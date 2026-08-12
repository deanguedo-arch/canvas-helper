import path from "node:path";
import { opendir, readdir, readFile } from "node:fs/promises";

import { fileExists, latestMtimeMs, listFilesRecursive, readJsonFile, writeJsonFile } from "./fs.js";
import { getProcessedProjectPaths, getProjectPaths, processedRoot, projectsRoot } from "./paths.js";
import type { ProjectManifest, ReferenceIndex, SectionMap, StudioProjectBundle } from "./types.js";
import { resolveIntelligencePolicy } from "./intelligence/config/policy.js";
import { normalizeProjectManifestPolicy } from "./project-manifest-policy.js";

const RESERVED_PROJECT_DIRS = new Set(["incoming", "processed", "resources"]);
const HTML_FILE_SCAN_SKIP_DIRS = new Set([".git", "assets", "exports", "node_modules"]);
const COPIED_RESOURCE_DIR_PATTERN = /^resources(?:\s+\d+|\s+copy(?:\s+\d+)?)$/i;
const DEFAULT_HTML_SCAN_MAX_ENTRIES = 20_000;
const DEFAULT_HTML_SCAN_MAX_ENTRIES_PER_DIRECTORY = 5_000;
const DEFAULT_HTML_SCAN_MAX_DEPTH = 16;
const HIDDEN_STUDIO_PROJECT_SLUGS = new Set([
  "social30-1-related-issue-1",
  "social30-1-related-issue-2",
  "social30-1-related-issue-3",
  "social30-1-related-issue-4"
]);

function normalizeSlash(value: string) {
  return value.replace(/\\/g, "/");
}

function shouldSkipHtmlFileScanDir(name: string) {
  return HTML_FILE_SCAN_SKIP_DIRS.has(name)
    || /^assets(?:\b|[\s._-])/i.test(name)
    || COPIED_RESOURCE_DIR_PATTERN.test(name)
    || /^workspace\.(?:previous|stuck)-/.test(name);
}

type StudioHtmlScanOptions = {
  maxEntries?: number;
  maxEntriesPerDirectory?: number;
  maxDepth?: number;
};

function htmlPathWithin(root: string, filePath: string) {
  const relativePath = normalizeSlash(path.relative(root, filePath));
  if (!relativePath || relativePath === ".." || relativePath.startsWith("../") || path.isAbsolute(relativePath)) {
    return null;
  }
  const extension = path.extname(relativePath).toLowerCase();
  return extension === ".html" || extension === ".htm" ? relativePath : null;
}

/**
 * Discover previewable HTML without allowing an accidental archive/resource
 * copy to make the Studio project picker recursively crawl forever.
 * Declared entrypoints are seeded first so the canonical page remains visible
 * even when the bounded fallback reaches its traversal limit.
 */
export async function listStudioHtmlFiles(
  dirPath: string,
  preferredFilePaths: string[] = [],
  options: StudioHtmlScanOptions = {}
) {
  if (!(await fileExists(dirPath))) {
    return [] as string[];
  }

  const files = new Set<string>();
  for (const preferredFilePath of preferredFilePaths) {
    const relativePath = htmlPathWithin(dirPath, preferredFilePath);
    if (relativePath && await fileExists(preferredFilePath)) files.add(relativePath);
  }

  const maxEntries = options.maxEntries ?? DEFAULT_HTML_SCAN_MAX_ENTRIES;
  const maxEntriesPerDirectory = options.maxEntriesPerDirectory ?? DEFAULT_HTML_SCAN_MAX_ENTRIES_PER_DIRECTORY;
  const maxDepth = options.maxDepth ?? DEFAULT_HTML_SCAN_MAX_DEPTH;
  const pending = [{ directoryPath: dirPath, depth: 0 }];
  let inspectedEntries = 0;

  while (pending.length > 0 && inspectedEntries < maxEntries) {
    const current = pending.shift();
    if (!current) break;
    const directory = await opendir(current.directoryPath);
    let directoryEntries = 0;
    for await (const entry of directory) {
      directoryEntries += 1;
      inspectedEntries += 1;
      if (directoryEntries > maxEntriesPerDirectory || inspectedEntries > maxEntries) break;

      const entryPath = path.join(current.directoryPath, entry.name);
      if (entry.isDirectory()) {
        if (current.depth < maxDepth && !shouldSkipHtmlFileScanDir(entry.name)) {
          pending.push({ directoryPath: entryPath, depth: current.depth + 1 });
        }
        continue;
      }
      if (!entry.isFile()) continue;
      const relativePath = htmlPathWithin(dirPath, entryPath);
      if (relativePath) files.add(relativePath);
    }
  }

  return [...files].sort((left, right) => left.localeCompare(right));
}

function normalizeLearningSource(value: string | undefined) {
  return value === "gemini" ? "gemini" : "other";
}

function normalizeLearningTrust(value: string | undefined) {
  return value === "curated" ? "curated" : "auto";
}

function normalizeProjectManifest(manifest: ProjectManifest): ProjectManifest {
  const policyNormalizedManifest = normalizeProjectManifestPolicy(manifest);
  const fallbackLearningTimestamp = manifest.updatedAt ?? manifest.createdAt ?? new Date().toISOString();
  return {
    ...policyNormalizedManifest,
    learningSource: normalizeLearningSource(policyNormalizedManifest.learningSource),
    learningTrust: normalizeLearningTrust(policyNormalizedManifest.learningTrust),
    learningUpdatedAt: policyNormalizedManifest.learningUpdatedAt ?? fallbackLearningTimestamp,
    workspaceApprovedAt: policyNormalizedManifest.workspaceApprovedAt
  };
}

async function hasRequiredProjectArtifacts(slug: string) {
  const paths = getProjectPaths(slug);
  if (!(await fileExists(paths.manifestPath))) {
    return false;
  }

  const manifest = await readJsonFile<ProjectManifest>(paths.manifestPath);
  const [hasManifestRawEntrypoint, hasDefaultRawEntrypoint, hasManifestWorkspaceEntrypoint, hasDefaultWorkspaceEntrypoint] =
    await Promise.all([
      manifest.rawEntrypoint ? fileExists(resolveManifestPath(paths.root, manifest.rawEntrypoint)) : Promise.resolve(false),
      fileExists(paths.rawEntrypoint),
      manifest.workspaceEntrypoint
        ? fileExists(resolveManifestPath(paths.root, manifest.workspaceEntrypoint))
        : Promise.resolve(false),
      fileExists(paths.workspaceEntrypoint)
    ]);

  const hasWorkspaceEntrypoint = hasManifestWorkspaceEntrypoint || hasDefaultWorkspaceEntrypoint;
  const hasRawEntrypoint = hasManifestRawEntrypoint || hasDefaultRawEntrypoint;

  return hasWorkspaceEntrypoint && (hasRawEntrypoint || Boolean(manifest.previewModes?.includes("workspace")));
}

function resolveManifestPath(projectRoot: string, manifestPath: string) {
  return path.isAbsolute(manifestPath) ? manifestPath : path.join(projectRoot, manifestPath);
}

async function resolveProjectEntrypoint(projectRoot: string, manifestPath: string | undefined, fallbackPath: string) {
  if (manifestPath) {
    const candidatePath = resolveManifestPath(projectRoot, manifestPath);
    if (await fileExists(candidatePath)) {
      return candidatePath;
    }
  }

  return fallbackPath;
}

async function hasRecoverableProcessedSnapshot(slug: string) {
  const processedPaths = getProcessedProjectPaths(slug);
  if (!(await fileExists(processedPaths.sourceDir))) {
    return false;
  }

  const sourceFiles = await listFilesRecursive(processedPaths.sourceDir);
  return sourceFiles.length > 0;
}

async function ensureProjectFromProcessedSnapshot(slug: string) {
  if (await hasRequiredProjectArtifacts(slug)) {
    return true;
  }

  if (!(await hasRecoverableProcessedSnapshot(slug))) {
    return false;
  }

  const { importProject } = await import("./importer.js");
  await importProject({
    inputPath: getProcessedProjectPaths(slug).sourceDir,
    slug,
    force: true
  });

  return hasRequiredProjectArtifacts(slug);
}

async function listProcessedProjectSlugs() {
  if (!(await fileExists(processedRoot))) {
    return [] as string[];
  }

  const entries = await readdir(processedRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

export async function loadProjectManifest(slug: string) {
  await ensureProjectFromProcessedSnapshot(slug);
  const paths = getProjectPaths(slug);
  if (!(await fileExists(paths.manifestPath))) {
    throw new Error(`Project manifest not found for "${slug}" at ${paths.manifestPath}.`);
  }

  const manifest = await readJsonFile<ProjectManifest>(paths.manifestPath);
  return normalizeProjectManifest(manifest);
}

export async function updateProjectManifest(
  slug: string,
  updater: (manifest: ProjectManifest) => ProjectManifest
) {
  const paths = getProjectPaths(slug);
  const currentManifest = await loadProjectManifest(slug);
  await writeJsonFile(paths.manifestPath, normalizeProjectManifest(updater(currentManifest)));
}

export async function markProjectWorkspaceApproved(slug: string, approvedAt = new Date().toISOString()) {
  await updateProjectManifest(slug, (manifest) => ({
    ...manifest,
    workspaceApprovedAt: approvedAt,
    updatedAt: approvedAt
  }));

  return approvedAt;
}

export async function listProjectSlugs() {
  const [hasProjectsRoot, processedSlugs] = await Promise.all([
    fileExists(projectsRoot),
    listProcessedProjectSlugs()
  ]);

  if (!hasProjectsRoot && processedSlugs.length === 0) {
    return [];
  }

  const entries = hasProjectsRoot ? await readdir(projectsRoot, { withFileTypes: true }) : [];
  const candidateSlugs = new Set(
    entries
      .filter((entry) => entry.isDirectory() && !RESERVED_PROJECT_DIRS.has(entry.name))
      .map((entry) => entry.name)
  );
  for (const slug of processedSlugs) {
    candidateSlugs.add(slug);
  }

  const availability = await Promise.all(
    [...candidateSlugs].map(async (slug) => {
      try {
        return {
          slug,
          hasManifest: await ensureProjectFromProcessedSnapshot(slug)
        };
      } catch {
        return {
          slug,
          hasManifest: false
        };
      }
    })
  );

  return availability
    .filter((entry) => entry.hasManifest)
    .filter((entry) => !HIDDEN_STUDIO_PROJECT_SLUGS.has(entry.slug))
    .map((entry) => entry.slug)
    .sort((left, right) => left.localeCompare(right));
}

async function readOptionalFile(filePath: string) {
  if (!(await fileExists(filePath))) {
    return "";
  }

  return readFile(filePath, "utf8");
}

async function readOptionalJson<T>(filePath: string) {
  if (!(await fileExists(filePath))) {
    return null;
  }

  return readJsonFile<T>(filePath);
}

async function resolveWorkspaceScriptFile(workspaceDir: string) {
  const jsxPath = path.join(workspaceDir, "main.jsx");
  if (await fileExists(jsxPath)) {
    return jsxPath;
  }

  const jsPath = path.join(workspaceDir, "main.js");
  if (await fileExists(jsPath)) {
    return jsPath;
  }

  return undefined;
}

async function latestExistingMtimeMs(filePaths: Array<string | undefined>, fallbackDir: string) {
  const mtimes = await Promise.all(
    filePaths.map(async (filePath) => {
      if (!filePath || !(await fileExists(filePath))) {
        return 0;
      }
      return latestMtimeMs(filePath);
    })
  );
  const latest = Math.max(...mtimes);
  if (latest > 0) {
    return latest;
  }
  return latestMtimeMs(fallbackDir);
}

export async function readStudioProjectBundle(slug: string): Promise<StudioProjectBundle> {
  await ensureProjectFromProcessedSnapshot(slug);
  const manifest = await loadProjectManifest(slug);
  const paths = getProjectPaths(slug);
  const rawEntrypoint = await resolveProjectEntrypoint(paths.root, manifest.rawEntrypoint, paths.rawEntrypoint);
  const workspaceEntrypoint = await resolveProjectEntrypoint(
    paths.root,
    manifest.workspaceEntrypoint,
    paths.workspaceEntrypoint
  );
  const workspaceScript = await resolveWorkspaceScriptFile(paths.workspaceDir);
  const workspaceStyles = (await fileExists(path.join(paths.workspaceDir, "styles.css")))
    ? path.join(paths.workspaceDir, "styles.css")
    : undefined;

  const [
    sectionMap,
    referenceIndex,
    intelligencePolicy,
    styleGuide,
    importLog,
    rawRevision,
    workspaceRevision,
    rawHtmlFiles,
    workspaceHtmlFiles
  ] = await Promise.all([
    readOptionalJson<SectionMap>(paths.sectionMapPath),
    readOptionalJson<ReferenceIndex>(paths.referenceIndexPath),
    resolveIntelligencePolicy(slug),
    readOptionalFile(paths.styleGuidePath),
    readOptionalFile(paths.importLogPath),
    latestExistingMtimeMs([rawEntrypoint], paths.rawDir),
    latestExistingMtimeMs([workspaceEntrypoint, workspaceScript, workspaceStyles], paths.workspaceDir),
    listStudioHtmlFiles(paths.rawDir, [rawEntrypoint]),
    listStudioHtmlFiles(paths.workspaceDir, [workspaceEntrypoint])
  ]);

  return {
    manifest,
    sectionMap,
    referenceIndex,
    htmlFiles: {
      raw: rawHtmlFiles,
      workspace: workspaceHtmlFiles
    },
    paths: {
      root: paths.root,
      rawEntrypoint,
      workspaceEntrypoint,
      workspaceScript,
      workspaceStyles,
      metaDir: paths.metaDir,
      resourceDir: paths.resourceDir,
      resourceExtractedDir: paths.resourceExtractedDir,
      referencesDir: paths.referencesDir,
      sessionLogPath: paths.sessionLogPath
    },
    styleGuide,
    importLog,
    effectiveLearnerMode: intelligencePolicy.mode,
    effectiveLearnerModeSource: intelligencePolicy.source,
    revisions: {
      raw: rawRevision,
      workspace: workspaceRevision
    }
  };
}

export async function listStudioProjectBundles() {
  const slugs = await listProjectSlugs();
  return Promise.all(slugs.map((slug) => readStudioProjectBundle(slug)));
}
