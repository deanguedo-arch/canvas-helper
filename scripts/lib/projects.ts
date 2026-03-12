import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

import { fileExists, latestMtimeMs, listFilesRecursive, readJsonFile, writeJsonFile } from "./fs.js";
import { getProcessedProjectPaths, getProjectPaths, processedRoot, projectsRoot } from "./paths.js";
import type { ProjectManifest, ReferenceIndex, SectionMap, StudioProjectBundle } from "./types.js";
import { resolveIntelligencePolicy } from "./intelligence/config/policy.js";

const RESERVED_PROJECT_DIRS = new Set(["incoming", "processed", "resources"]);

function normalizeSlash(value: string) {
  return value.replace(/\\/g, "/");
}

async function listHtmlFiles(dirPath: string) {
  if (!(await fileExists(dirPath))) {
    return [] as string[];
  }

  const files = await listFilesRecursive(dirPath);
  return files
    .filter((filePath) => {
      const extension = path.extname(filePath).toLowerCase();
      return extension === ".html" || extension === ".htm";
    })
    .map((filePath) => normalizeSlash(path.relative(dirPath, filePath)))
    .sort((left, right) => left.localeCompare(right));
}

function normalizeLearningSource(value: string | undefined) {
  return value === "gemini" ? "gemini" : "other";
}

function normalizeLearningTrust(value: string | undefined) {
  return value === "curated" ? "curated" : "auto";
}

function normalizeProjectManifest(manifest: ProjectManifest): ProjectManifest {
  const fallbackLearningTimestamp = manifest.updatedAt ?? manifest.createdAt ?? new Date().toISOString();
  return {
    ...manifest,
    learningSource: normalizeLearningSource(manifest.learningSource),
    learningTrust: normalizeLearningTrust(manifest.learningTrust),
    learningUpdatedAt: manifest.learningUpdatedAt ?? fallbackLearningTimestamp,
    workspaceApprovedAt: manifest.workspaceApprovedAt
  };
}

async function hasRequiredProjectArtifacts(slug: string) {
  const paths = getProjectPaths(slug);
  const [hasManifest, hasRawEntrypoint, hasWorkspaceEntrypoint] = await Promise.all([
    fileExists(paths.manifestPath),
    fileExists(paths.rawEntrypoint),
    fileExists(paths.workspaceEntrypoint)
  ]);

  return hasManifest && hasRawEntrypoint && hasWorkspaceEntrypoint;
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

export async function readStudioProjectBundle(slug: string): Promise<StudioProjectBundle> {
  await ensureProjectFromProcessedSnapshot(slug);
  const manifest = await loadProjectManifest(slug);
  const paths = getProjectPaths(slug);
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
    latestMtimeMs(paths.rawDir),
    latestMtimeMs(paths.workspaceDir),
    listHtmlFiles(paths.rawDir),
    listHtmlFiles(paths.workspaceDir)
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
      rawEntrypoint: paths.rawEntrypoint,
      workspaceEntrypoint: paths.workspaceEntrypoint,
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
