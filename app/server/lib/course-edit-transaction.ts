import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const LOCK_SCHEMA_VERSION = 1;
const JOURNAL_SCHEMA_VERSION = 1;
const FOREIGN_HOST_STALE_MS = 24 * 60 * 60 * 1_000;
const activeLocks = new Set<string>();

export type CourseEditPathFingerprint = {
  repoRelativePath: string;
  kind: "missing" | "file" | "directory";
  sha256: string;
  fileCount: number;
  byteCount: number;
};

export type CourseEditTransactionJournal = {
  schemaVersion: typeof JOURNAL_SCHEMA_VERSION;
  transactionId: string;
  projectSlug: string;
  operation: "apply" | "undo" | "rename" | "asset-upload";
  checkpointId: string | null;
  phase: "prepared" | "mutating" | "validating" | "rolling-back" | "manual-recovery";
  startedAt: string;
  updatedAt: string;
  expectedBefore: CourseEditPathFingerprint[];
  expectedAfter: CourseEditPathFingerprint[];
};

type LockOwner = {
  schemaVersion: typeof LOCK_SCHEMA_VERSION;
  lockId: string;
  projectSlug: string;
  operation: CourseEditTransactionJournal["operation"];
  pid: number;
  hostname: string;
  startedAt: string;
};

function runtimePath(repoRoot: string, ...segments: string[]) {
  return path.join(repoRoot, ".runtime", ...segments);
}

function lockPath(repoRoot: string, projectSlug: string) {
  return runtimePath(repoRoot, "studio-edit-locks", projectSlug);
}

function ownerPath(repoRoot: string, projectSlug: string) {
  return path.join(lockPath(repoRoot, projectSlug), "owner.json");
}

export function courseEditJournalPath(repoRoot: string, projectSlug: string) {
  return runtimePath(repoRoot, "studio-edit-transactions", projectSlug, "active.json");
}

async function syncDirectory(directoryPath: string) {
  try {
    const handle = await open(directoryPath, "r");
    try {
      await handle.sync();
    } finally {
      await handle.close();
    }
  } catch {
    // Some platforms do not allow directory fsync. The atomic rename still
    // preserves a complete prior or next JSON document on those platforms.
  }
}

export async function durableAtomicWrite(filePath: string, content: string | Uint8Array, mode = 0o600) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp-${process.pid}-${randomUUID()}`;
  let handle: Awaited<ReturnType<typeof open>> | null = null;
  try {
    handle = await open(temporary, "wx", mode);
    await handle.writeFile(content, "utf8");
    await handle.sync();
    await handle.close();
    handle = null;
    await rename(temporary, filePath);
    await syncDirectory(path.dirname(filePath));
  } finally {
    await handle?.close().catch(() => undefined);
    await rm(temporary, { force: true });
  }
}

function isSafeRelativePath(repoRoot: string, targetPath: string) {
  const relative = path.relative(repoRoot, targetPath);
  return Boolean(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function updateHashFromFile(hash: ReturnType<typeof createHash>, filePath: string) {
  const stream = createReadStream(filePath);
  for await (const chunk of stream) hash.update(chunk as Buffer);
}

export async function fingerprintCourseEditPath(repoRoot: string, targetPath: string): Promise<CourseEditPathFingerprint> {
  const absolute = path.resolve(targetPath);
  if (!isSafeRelativePath(path.resolve(repoRoot), absolute)) throw new Error("Course edit fingerprint path escaped this checkout.");
  const repoRelativePath = path.relative(repoRoot, absolute).split(path.sep).join("/");
  let rootStats;
  try {
    rootStats = await lstat(absolute);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        repoRelativePath,
        kind: "missing",
        sha256: createHash("sha256").update("missing\0").digest("hex"),
        fileCount: 0,
        byteCount: 0
      };
    }
    throw error;
  }
  if (rootStats.isSymbolicLink()) throw new Error("Course edit fingerprints do not follow symbolic links.");

  const hash = createHash("sha256");
  let fileCount = 0;
  let byteCount = 0;
  if (rootStats.isFile()) {
    hash.update(`file\0${rootStats.mode & 0o777}\0${rootStats.size}\0`);
    await updateHashFromFile(hash, absolute);
    return { repoRelativePath, kind: "file", sha256: hash.digest("hex"), fileCount: 1, byteCount: rootStats.size };
  }
  if (!rootStats.isDirectory()) throw new Error("Course edit fingerprints support only files and directories.");

  const visit = async (directoryPath: string, relativeDirectory: string): Promise<void> => {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const childPath = path.join(directoryPath, entry.name);
      const relative = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      const stats = await lstat(childPath);
      if (stats.isSymbolicLink()) throw new Error("Course edit fingerprints do not follow symbolic links.");
      if (stats.isDirectory()) {
        hash.update(`directory\0${relative}\0${stats.mode & 0o777}\0`);
        await visit(childPath, relative);
      } else if (stats.isFile()) {
        fileCount += 1;
        byteCount += stats.size;
        hash.update(`file\0${relative}\0${stats.mode & 0o777}\0${stats.size}\0`);
        await updateHashFromFile(hash, childPath);
        hash.update("\0");
      }
    }
  };
  hash.update(`directory\0${rootStats.mode & 0o777}\0`);
  await visit(absolute, "");
  return { repoRelativePath, kind: "directory", sha256: hash.digest("hex"), fileCount, byteCount };
}

export async function fingerprintCourseEditPaths(repoRoot: string, targetPaths: string[]) {
  return await Promise.all(targetPaths.map((targetPath) => fingerprintCourseEditPath(repoRoot, targetPath)));
}

export function courseEditFingerprintsMatch(
  expected: readonly CourseEditPathFingerprint[],
  actual: readonly CourseEditPathFingerprint[]
) {
  if (expected.length !== actual.length) return false;
  const byPath = new Map(actual.map((entry) => [entry.repoRelativePath, entry]));
  return expected.every((entry) => {
    const current = byPath.get(entry.repoRelativePath);
    return Boolean(
      current &&
      current.kind === entry.kind &&
      current.sha256 === entry.sha256 &&
      current.fileCount === entry.fileCount &&
      current.byteCount === entry.byteCount
    );
  });
}

export async function writeCourseEditJournal(journal: CourseEditTransactionJournal, repoRoot: string) {
  await durableAtomicWrite(
    courseEditJournalPath(repoRoot, journal.projectSlug),
    `${JSON.stringify({ ...journal, updatedAt: new Date().toISOString() }, null, 2)}\n`
  );
}

export async function readCourseEditJournal(projectSlug: string, repoRoot: string): Promise<CourseEditTransactionJournal | null> {
  try {
    const value = JSON.parse(await readFile(courseEditJournalPath(repoRoot, projectSlug), "utf8")) as CourseEditTransactionJournal;
    if (
      value.schemaVersion !== JOURNAL_SCHEMA_VERSION ||
      value.projectSlug !== projectSlug ||
      !["apply", "undo", "rename", "asset-upload"].includes(value.operation) ||
      !["prepared", "mutating", "validating", "rolling-back", "manual-recovery"].includes(value.phase) ||
      !Array.isArray(value.expectedBefore) ||
      !Array.isArray(value.expectedAfter)
    ) {
      throw new Error("The interrupted Studio edit journal is invalid.");
    }
    return value;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function removeCourseEditJournal(projectSlug: string, repoRoot: string) {
  await rm(courseEditJournalPath(repoRoot, projectSlug), { force: true });
  await syncDirectory(path.dirname(courseEditJournalPath(repoRoot, projectSlug)));
}

function processIsAlive(pid: number) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

async function readLockOwner(repoRoot: string, projectSlug: string): Promise<LockOwner | null> {
  try {
    const value = JSON.parse(await readFile(ownerPath(repoRoot, projectSlug), "utf8")) as LockOwner;
    return value.schemaVersion === LOCK_SCHEMA_VERSION && value.projectSlug === projectSlug ? value : null;
  } catch {
    return null;
  }
}

function lockOwnerIsActive(owner: LockOwner | null) {
  if (!owner) return false;
  if (owner.hostname === os.hostname()) return processIsAlive(owner.pid);
  const startedAt = Date.parse(owner.startedAt);
  return !Number.isFinite(startedAt) || Date.now() - startedAt < FOREIGN_HOST_STALE_MS;
}

async function acquireLock(projectSlug: string, operation: CourseEditTransactionJournal["operation"], repoRoot: string) {
  const directory = lockPath(repoRoot, projectSlug);
  await mkdir(path.dirname(directory), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await mkdir(directory);
      const owner: LockOwner = {
        schemaVersion: LOCK_SCHEMA_VERSION,
        lockId: randomUUID(),
        projectSlug,
        operation,
        pid: process.pid,
        hostname: os.hostname(),
        startedAt: new Date().toISOString()
      };
      await durableAtomicWrite(ownerPath(repoRoot, projectSlug), `${JSON.stringify(owner, null, 2)}\n`);
      return owner;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      const owner = await readLockOwner(repoRoot, projectSlug);
      if (lockOwnerIsActive(owner)) {
        throw new Error("Another Studio server is already changing this course. Wait for it to finish before trying again.");
      }
      if (attempt > 0) throw new Error("Studio could not safely claim the course edit lock.");
      await rm(directory, { recursive: true, force: true });
    }
  }
  throw new Error("Studio could not acquire the course edit lock.");
}

export async function withCourseEditFileLock<T>(input: {
  projectSlug: string;
  operation: CourseEditTransactionJournal["operation"];
  repoRoot: string;
  recoverInterrupted: () => Promise<void>;
  run: () => Promise<T>;
}) {
  const localKey = `${path.resolve(input.repoRoot)}\0${input.projectSlug}`;
  if (activeLocks.has(localKey)) throw new Error("Another edit is already being applied to this course.");
  activeLocks.add(localKey);
  let owner: LockOwner | null = null;
  try {
    owner = await acquireLock(input.projectSlug, input.operation, input.repoRoot);
    await input.recoverInterrupted();
    return await input.run();
  } finally {
    activeLocks.delete(localKey);
    if (owner) {
      const current = await readLockOwner(input.repoRoot, input.projectSlug);
      if (current?.lockId === owner.lockId) await rm(lockPath(input.repoRoot, input.projectSlug), { recursive: true, force: true });
    }
  }
}
