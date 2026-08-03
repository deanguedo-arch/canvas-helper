import { copyFile, lstat, mkdir, mkdtemp, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";

type TransactionTarget = {
  targetPath: string;
  /**
   * Keep the original in place while the factory runs, but restore it if the
   * factory fails. This is used for project.json because metadata rendering
   * deliberately reads the existing reviewed contract.
   */
  preserveDuringRun?: boolean;
};

type Snapshot = TransactionTarget & {
  backupPath: string;
  existed: boolean;
};

async function pathExists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function copyPath(sourcePath: string, destinationPath: string): Promise<void> {
  const stats = await lstat(sourcePath);
  if (stats.isSymbolicLink()) {
    throw new Error(`English factory transaction does not support symbolic links: ${sourcePath}`);
  }
  if (stats.isFile()) {
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
    return;
  }
  if (!stats.isDirectory()) {
    throw new Error(`English factory transaction supports only files and directories: ${sourcePath}`);
  }
  await mkdir(destinationPath, { recursive: true });
  const entries = await readdir(sourcePath, { withFileTypes: true });
  for (const entry of entries) {
    await copyPath(path.join(sourcePath, entry.name), path.join(destinationPath, entry.name));
  }
}

async function snapshotTarget(snapshot: Snapshot): Promise<void> {
  if (!snapshot.existed) return;
  await mkdir(path.dirname(snapshot.backupPath), { recursive: true });
  if (snapshot.preserveDuringRun) {
    await copyPath(snapshot.targetPath, snapshot.backupPath);
    return;
  }
  await rename(snapshot.targetPath, snapshot.backupPath);
}

async function restoreSnapshot(snapshot: Snapshot): Promise<void> {
  await rm(snapshot.targetPath, { recursive: true, force: true });
  if (!snapshot.existed) return;
  await mkdir(path.dirname(snapshot.targetPath), { recursive: true });
  if (snapshot.preserveDuringRun) {
    await copyPath(snapshot.backupPath, snapshot.targetPath);
    return;
  }
  await rename(snapshot.backupPath, snapshot.targetPath);
}

/**
 * Keeps the English factory's generated outputs mutually recoverable. The
 * workspace renderer already has its own staged promotion; this outer layer
 * covers resource-library and metadata writes that happen after that promotion.
 */
export async function runEnglishFactoryOutputTransaction<T>(options: {
  projectDir: string;
  resourceDir: string;
  run(): Promise<T>;
}): Promise<T> {
  const projectDir = path.resolve(options.projectDir);
  const resourceDir = path.resolve(options.resourceDir);
  const metaDir = path.join(projectDir, "meta");
  const transactionDir = await mkdtemp(path.join(projectDir, ".english-factory-transaction-"));
  const targets: TransactionTarget[] = [
    { targetPath: path.join(projectDir, "workspace", "index.html") },
    { targetPath: path.join(projectDir, "workspace", "assets", "generated") },
    { targetPath: path.join(projectDir, "workspace", "resources", "generated") },
    { targetPath: path.join(resourceDir, "teacher") },
    { targetPath: path.join(resourceDir, "_extracted") },
    { targetPath: path.join(metaDir, "english-unit-build.json") },
    { targetPath: path.join(metaDir, "english-unit-mapping.json") },
    { targetPath: path.join(metaDir, "english-unit-mapping.md") },
    { targetPath: path.join(metaDir, "e2e-contract.json") },
    { targetPath: path.join(metaDir, "conversion-notes.md") },
    { targetPath: path.join(metaDir, "project.json"), preserveDuringRun: true }
  ];
  const snapshots: Snapshot[] = [];

  try {
    for (const [index, target] of targets.entries()) {
      const snapshot: Snapshot = {
        ...target,
        backupPath: path.join(transactionDir, "backup", String(index)),
        existed: await pathExists(target.targetPath)
      };
      await snapshotTarget(snapshot);
      snapshots.push(snapshot);
    }
    return await options.run();
  } catch (error) {
    for (const snapshot of [...snapshots].reverse()) {
      await restoreSnapshot(snapshot);
    }
    throw error;
  } finally {
    await rm(transactionDir, { recursive: true, force: true });
  }
}
