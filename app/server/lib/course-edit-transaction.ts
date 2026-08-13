import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  lstat,
  link,
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
  phase: "prepared" | "mutating" | "validating" | "rolling-back" | "manual-recovery" | "committed" | "rolled-back";
  startedAt: string;
  updatedAt: string;
  expectedBefore: CourseEditPathFingerprint[];
  expectedAfter: CourseEditPathFingerprint[];
  cleanupCheckpointIds?: string[];
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

function candidateLockPath(repoRoot: string, projectSlug: string, lockId: string) {
  return `${lockPath(repoRoot, projectSlug)}.candidate-${lockId}`;
}

function retiredLockPath(repoRoot: string, projectSlug: string, kind: "stale" | "released", lockId: string) {
  return `${lockPath(repoRoot, projectSlug)}.${kind}-${lockId}`;
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

function courseEditFingerprintEntryMatches(expected: CourseEditPathFingerprint | undefined, actual: CourseEditPathFingerprint | undefined) {
  return Boolean(
    expected &&
    actual &&
    expected.repoRelativePath === actual.repoRelativePath &&
    expected.kind === actual.kind &&
    expected.sha256 === actual.sha256 &&
    expected.fileCount === actual.fileCount &&
    expected.byteCount === actual.byteCount
  );
}

export type CourseEditBoundaryState = "before" | "after" | "known-partial" | "unknown";

export function classifyCourseEditBoundary(
  expectedBefore: readonly CourseEditPathFingerprint[],
  expectedAfter: readonly CourseEditPathFingerprint[],
  actual: readonly CourseEditPathFingerprint[]
): CourseEditBoundaryState {
  if (courseEditFingerprintsMatch(expectedBefore, actual)) return "before";
  if (expectedAfter.length && courseEditFingerprintsMatch(expectedAfter, actual)) return "after";
  if (!expectedAfter.length || expectedBefore.length !== expectedAfter.length || actual.length !== expectedBefore.length) return "unknown";
  const beforeByPath = new Map(expectedBefore.map((entry) => [entry.repoRelativePath, entry]));
  const afterByPath = new Map(expectedAfter.map((entry) => [entry.repoRelativePath, entry]));
  const allKnown = actual.every((entry) => (
    courseEditFingerprintEntryMatches(beforeByPath.get(entry.repoRelativePath), entry) ||
    courseEditFingerprintEntryMatches(afterByPath.get(entry.repoRelativePath), entry)
  ));
  return allKnown ? "known-partial" : "unknown";
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
      !["prepared", "mutating", "validating", "rolling-back", "manual-recovery", "committed", "rolled-back"].includes(value.phase) ||
      !Array.isArray(value.expectedBefore) ||
      !Array.isArray(value.expectedAfter) ||
      (value.cleanupCheckpointIds !== undefined && (
        !Array.isArray(value.cleanupCheckpointIds) ||
        value.cleanupCheckpointIds.some((entry) => typeof entry !== "string" || !entry || entry.length > 160)
      ))
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
    const target = lockPath(repoRoot, projectSlug);
    const stats = await lstat(target);
    if (stats.isSymbolicLink() || (!stats.isFile() && !stats.isDirectory())) return null;
    const ownerTarget = stats.isDirectory() ? ownerPath(repoRoot, projectSlug) : target;
    const ownerStats = await lstat(ownerTarget);
    if (ownerStats.isSymbolicLink() || !ownerStats.isFile()) return null;
    const value = JSON.parse(await readFile(ownerTarget, "utf8")) as LockOwner;
    return (
      value.schemaVersion === LOCK_SCHEMA_VERSION &&
      value.projectSlug === projectSlug &&
      typeof value.lockId === "string" &&
      /^[0-9a-f-]{36}$/i.test(value.lockId) &&
      ["apply", "undo", "rename", "asset-upload"].includes(value.operation) &&
      Number.isInteger(value.pid) &&
      value.pid > 0 &&
      typeof value.hostname === "string" &&
      value.hostname.length > 0 &&
      Number.isFinite(Date.parse(value.startedAt))
    ) ? value : null;
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

async function lockPathExists(repoRoot: string, projectSlug: string) {
  try {
    await lstat(lockPath(repoRoot, projectSlug));
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function acquireLock(
  projectSlug: string,
  operation: CourseEditTransactionJournal["operation"],
  repoRoot: string,
  beforePublish?: () => Promise<void>
) {
  const directory = lockPath(repoRoot, projectSlug);
  const parent = path.dirname(directory);
  await mkdir(parent, { recursive: true });
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const owner: LockOwner = {
      schemaVersion: LOCK_SCHEMA_VERSION,
      lockId: randomUUID(),
      projectSlug,
      operation,
      pid: process.pid,
      hostname: os.hostname(),
      startedAt: new Date().toISOString()
    };
    const candidate = candidateLockPath(repoRoot, projectSlug, owner.lockId);
    try {
      // The final lock is a hard link to a complete, fsynced owner document.
      // link(2) is an atomic no-replace claim, so competing processes can
      // never observe or mistake an ownerless lock for an abandoned one.
      await durableAtomicWrite(candidate, `${JSON.stringify(owner, null, 2)}\n`);
      await beforePublish?.();
      try {
        await link(candidate, directory);
        await syncDirectory(parent);
        return owner;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      }

      const current = await readLockOwner(repoRoot, projectSlug);
      if (!current) {
        if (!(await lockPathExists(repoRoot, projectSlug))) continue;
        throw new Error("The course edit lock has no valid owner. Studio left it in place and stopped for manual recovery.");
      }
      if (lockOwnerIsActive(current)) {
        throw new Error("Another Studio server is already changing this course. Wait for it to finish before trying again.");
      }

      // A deterministic tombstone prevents an ABA race: another stale-lock
      // contender that observed this owner cannot later unlink a newly
      // acquired lock using the same stale identity. The no-replace hard link
      // claims retirement of this exact lock inode before its live name is
      // removed.
      const tombstone = retiredLockPath(repoRoot, projectSlug, "stale", current.lockId);
      try {
        await link(directory, tombstone);
        await rm(directory, { force: true });
        await syncDirectory(parent);
      } catch (error) {
        if (!["ENOENT", "EEXIST"].includes((error as NodeJS.ErrnoException).code ?? "")) throw error;
      }
    } finally {
      await rm(candidate, { force: true });
    }
  }
  throw new Error("Studio could not acquire the course edit lock.");
}

async function releaseLock(owner: LockOwner, repoRoot: string) {
  const current = await readLockOwner(repoRoot, owner.projectSlug);
  if (current?.lockId !== owner.lockId) return;
  const directory = lockPath(repoRoot, owner.projectSlug);
  const retired = retiredLockPath(repoRoot, owner.projectSlug, "released", owner.lockId);
  try {
    await rename(directory, retired);
    await syncDirectory(path.dirname(directory));
    await rm(retired, { recursive: true, force: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export async function withCourseEditFileLock<T>(input: {
  projectSlug: string;
  operation: CourseEditTransactionJournal["operation"];
  repoRoot: string;
  recoverInterrupted: () => Promise<void>;
  run: () => Promise<T>;
  beforePublish?: () => Promise<void>;
}) {
  const localKey = `${path.resolve(input.repoRoot)}\0${input.projectSlug}`;
  if (activeLocks.has(localKey)) throw new Error("Another edit is already being applied to this course.");
  activeLocks.add(localKey);
  let owner: LockOwner | null = null;
  try {
    owner = await acquireLock(input.projectSlug, input.operation, input.repoRoot, input.beforePublish);
    await input.recoverInterrupted();
    return await input.run();
  } finally {
    activeLocks.delete(localKey);
    if (owner) await releaseLock(owner, input.repoRoot);
  }
}
