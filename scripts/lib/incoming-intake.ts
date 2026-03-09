import { open, readFile, rename, rm, stat } from "node:fs/promises";
import path from "node:path";

import { copyDirectory, copyFileEnsuringDir, ensureDir, removePath } from "./fs.js";
import { refreshProjectIntelligence } from "./intelligence.js";
import {
  inferSlugFromIncomingItem,
  listIncomingProjectItems,
  listResourceProjectDirs
} from "./incoming-watch.js";
import { importProject } from "./importer.js";
import {
  getProcessedProjectPaths,
  getResourcePaths,
  incomingRoot as defaultIncomingRoot,
  incomingWatchLockPath,
  resourcesRoot as defaultResourcesRoot
} from "./paths.js";
import { loadProjectManifest, updateProjectManifest } from "./projects.js";
import { extractProjectReferences } from "./references.js";

export type IncomingMode = "all" | "projects" | "references";

export type ImportedProjectSummary = {
  sourceKey: string;
  requestedSlug: string;
  slug: string;
  archivedTo: string;
  warnings: string[];
};

export type SkippedProjectSummary = {
  sourceKey: string;
  requestedSlug: string;
  reason: string;
};

export type SyncedReferenceSummary = {
  sourcePath: string;
  slug: string;
  targetPath: string;
  archivedTo?: string;
};

export type IncomingFailureSummary = {
  kind: "project" | "reference";
  inputPath: string;
  message: string;
  archivedTo?: string;
};

export type IncomingRefreshSummary = {
  startedAt: string;
  finishedAt: string;
  mode: IncomingMode;
  importedProjects: ImportedProjectSummary[];
  skippedProjects: SkippedProjectSummary[];
  syncedReferences: SyncedReferenceSummary[];
  failures: IncomingFailureSummary[];
  archivedPaths: string[];
};

export class IncomingLockError extends Error {
  constructor(lockPath: string) {
    super(`Incoming intake is already running (${lockPath}).`);
    this.name = "IncomingLockError";
  }
}

function createEmptySummary(mode: IncomingMode): IncomingRefreshSummary {
  return {
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    mode,
    importedProjects: [],
    skippedProjects: [],
    syncedReferences: [],
    failures: [],
    archivedPaths: []
  };
}

function mergeSummaries(target: IncomingRefreshSummary, source: IncomingRefreshSummary) {
  target.importedProjects.push(...source.importedProjects);
  target.skippedProjects.push(...source.skippedProjects);
  target.syncedReferences.push(...source.syncedReferences);
  target.failures.push(...source.failures);
  target.archivedPaths.push(...source.archivedPaths);
}

type IncomingLockRecord = {
  pid?: number;
  startedAt?: string;
};

async function readIncomingLockRecord(lockPath: string): Promise<IncomingLockRecord | null> {
  try {
    return JSON.parse(await readFile(lockPath, "utf8")) as IncomingLockRecord;
  } catch {
    return null;
  }
}

function processExists(pid: number | undefined) {
  if (!Number.isInteger(pid) || (pid ?? 0) <= 0) {
    return false;
  }

  const processId = pid as number;

  try {
    process.kill(processId, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException | undefined)?.code === "EPERM";
  }
}

async function clearStaleIncomingLock(lockPath: string) {
  const record = await readIncomingLockRecord(lockPath);
  if (!record || processExists(record.pid)) {
    return false;
  }

  await rm(lockPath, { force: true });
  return true;
}

async function acquireIncomingLock(lockPath: string) {
  await ensureDir(path.dirname(lockPath));

  try {
    const handle = await open(lockPath, "wx");
    await handle.writeFile(
      `${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }, null, 2)}\n`,
      "utf8"
    );
    return handle;
  } catch (error) {
    if ((error as NodeJS.ErrnoException | undefined)?.code === "EEXIST") {
      if (await clearStaleIncomingLock(lockPath)) {
        return acquireIncomingLock(lockPath);
      }

      throw new IncomingLockError(lockPath);
    }

    throw error;
  }
}

async function moveOrCopy(sourcePath: string, destinationPath: string) {
  await ensureDir(path.dirname(destinationPath));

  try {
    await rename(sourcePath, destinationPath);
    return;
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException | undefined)?.code;
    if (errorCode !== "EXDEV") {
      throw error;
    }
  }

  const sourceStats = await stat(sourcePath);
  if (sourceStats.isDirectory()) {
    await copyDirectory(sourcePath, destinationPath);
  } else {
    await copyFileEnsuringDir(sourcePath, destinationPath);
  }

  await removePath(sourcePath);
}

async function replaceProcessedSnapshot(sourcePath: string, slug: string) {
  const processedPaths = getProcessedProjectPaths(slug);
  await removePath(processedPaths.sourceDir);

  const sourceStats = await stat(sourcePath);
  if (sourceStats.isDirectory()) {
    await moveOrCopy(sourcePath, processedPaths.sourceDir);
    return processedPaths.sourceDir;
  }

  const processedFilePath = path.join(processedPaths.sourceDir, path.basename(sourcePath));
  await moveOrCopy(sourcePath, processedFilePath);
  return processedPaths.sourceDir;
}

export async function withIncomingLock<T>(
  callback: () => Promise<T>,
  lockPath = incomingWatchLockPath
): Promise<T> {
  const handle = await acquireIncomingLock(lockPath);

  try {
    return await callback();
  } finally {
    await handle.close();
    await rm(lockPath, { force: true });
  }
}

export async function processIncomingProjectItem(options: {
  inputPath: string;
  incomingRoot: string;
}): Promise<ImportedProjectSummary> {
  const requestedSlug = inferSlugFromIncomingItem(options.inputPath);
  if (!requestedSlug) {
    throw new Error(`Could not derive a valid project slug from ${options.inputPath}.`);
  }

  const sourceKey = path.relative(options.incomingRoot, options.inputPath).replace(/\\/g, "/");
  const result = await importProject({
    inputPath: options.inputPath,
    slug: requestedSlug,
    force: true
  });

  const archivedTo = await replaceProcessedSnapshot(options.inputPath, result.slug);
  await updateProjectManifest(result.slug, (manifest) => ({
    ...manifest,
    sourcePath: archivedTo,
    updatedAt: new Date().toISOString()
  }));

  return {
    sourceKey,
    requestedSlug,
    slug: result.slug,
    archivedTo,
    warnings: result.warnings
  };
}

export async function refreshResourceProjects(options: {
  resourceDirs: string[];
}): Promise<IncomingRefreshSummary> {
  const summary = createEmptySummary("references");

  for (const resourceDir of [...options.resourceDirs].sort((left, right) => left.localeCompare(right))) {
    const slug = path.basename(resourceDir);

    try {
      await loadProjectManifest(slug);
      await extractProjectReferences(slug);
      await refreshProjectIntelligence(slug, {
        markWorkspaceApproved: true,
        command: "refs"
      });

      const resourcePaths = getResourcePaths(slug);
      summary.syncedReferences.push({
        sourcePath: resourceDir,
        slug,
        targetPath: resourcePaths.extractedDir
      });
    } catch (error) {
      summary.failures.push({
        kind: "reference",
        inputPath: resourceDir,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  summary.finishedAt = new Date().toISOString();
  return summary;
}

export async function runIncomingRefresh(options: {
  incomingRoot?: string;
  resourcesRoot?: string;
  mode?: IncomingMode;
} = {}): Promise<IncomingRefreshSummary> {
  const incomingRoot = path.resolve(options.incomingRoot ?? defaultIncomingRoot);
  const resourcesRoot = path.resolve(options.resourcesRoot ?? defaultResourcesRoot);
  const mode = options.mode ?? "all";
  const summary = createEmptySummary(mode);

  await ensureDir(incomingRoot);
  await ensureDir(resourcesRoot);

  if (mode === "all" || mode === "projects") {
    const items = await listIncomingProjectItems(incomingRoot);
    for (const inputPath of items) {
      try {
        const imported = await processIncomingProjectItem({
          inputPath,
          incomingRoot
        });
        summary.importedProjects.push(imported);
        summary.archivedPaths.push(imported.archivedTo);
      } catch (error) {
        summary.failures.push({
          kind: "project",
          inputPath,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  if (mode === "all" || mode === "references") {
    const resourceDirs = await listResourceProjectDirs(resourcesRoot);
    const resourceSummary = await refreshResourceProjects({
      resourceDirs
    });
    mergeSummaries(summary, resourceSummary);
  }

  summary.finishedAt = new Date().toISOString();
  return summary;
}
