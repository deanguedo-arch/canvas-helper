import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

import { fileExists, latestMtimeMs, readJsonFile, writeJsonFile } from "./fs.js";
import { getProjectPaths, projectsRoot } from "./paths.js";
import type { ProjectManifest, ReferenceIndex, SectionMap, StudioProjectBundle } from "./types.js";

export async function loadProjectManifest(slug: string) {
  const paths = getProjectPaths(slug);
  if (!(await fileExists(paths.manifestPath))) {
    throw new Error(`Project manifest not found for "${slug}" at ${paths.manifestPath}.`);
  }

  return readJsonFile<ProjectManifest>(paths.manifestPath);
}

export async function updateProjectManifest(
  slug: string,
  updater: (manifest: ProjectManifest) => ProjectManifest
) {
  const paths = getProjectPaths(slug);
  const currentManifest = await loadProjectManifest(slug);
  await writeJsonFile(paths.manifestPath, updater(currentManifest));
}

export async function listProjectSlugs() {
  if (!(await fileExists(projectsRoot))) {
    return [];
  }

  const entries = await readdir(projectsRoot, { withFileTypes: true });
  const candidateSlugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const availability = await Promise.all(
    candidateSlugs.map(async (slug) => ({
      slug,
      hasManifest: await fileExists(getProjectPaths(slug).manifestPath)
    }))
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
  const manifest = await loadProjectManifest(slug);
  const paths = getProjectPaths(slug);
  const workspaceScript = await resolveWorkspaceScriptFile(paths.workspaceDir);
  const workspaceStyles = (await fileExists(path.join(paths.workspaceDir, "styles.css")))
    ? path.join(paths.workspaceDir, "styles.css")
    : undefined;

  const [sectionMap, referenceIndex, styleGuide, importLog, rawRevision, workspaceRevision] = await Promise.all([
    readOptionalJson<SectionMap>(paths.sectionMapPath),
    readOptionalJson<ReferenceIndex>(paths.referenceIndexPath),
    readOptionalFile(paths.styleGuidePath),
    readOptionalFile(paths.importLogPath),
    latestMtimeMs(paths.rawDir),
    latestMtimeMs(paths.workspaceDir)
  ]);

  return {
    manifest,
    sectionMap,
    referenceIndex,
    paths: {
      root: paths.root,
      rawEntrypoint: paths.rawEntrypoint,
      workspaceEntrypoint: paths.workspaceEntrypoint,
      workspaceScript,
      workspaceStyles,
      metaDir: paths.metaDir,
      referencesDir: paths.referencesDir,
      sessionLogPath: paths.sessionLogPath
    },
    styleGuide,
    importLog,
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
