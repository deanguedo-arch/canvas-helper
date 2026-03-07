import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ProjectPaths } from "./types.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(currentDir, "..", "..");
export const projectsRoot = path.join(repoRoot, "projects");
export const assessmentsRoot = path.join(projectsRoot, "assessments");
export const incomingRoot = path.join(projectsRoot, "incoming");
export const processedRoot = path.join(projectsRoot, "processed");
export const resourcesRoot = path.join(projectsRoot, "resources");
export const incomingWatchLockPath = path.join(repoRoot, ".runtime", "incoming-watch.lock");
export const repoIntelligencePolicyPath = path.join(repoRoot, "config", "intelligence.json");
export const legacyRepoIntelligencePolicyPath = path.join(repoRoot, "intelligence-policy.json");

export function getResourcePaths(slug: string) {
  const root = path.join(resourcesRoot, slug);
  return {
    root,
    extractedDir: path.join(root, "_extracted")
  };
}

export function getProcessedProjectPaths(slug: string) {
  const root = path.join(processedRoot, slug);
  return {
    root,
    sourceDir: path.join(root, "source")
  };
}

export function getAssessmentPaths(slug: string) {
  const root = path.join(assessmentsRoot, slug);
  return {
    root,
    sourceDir: path.join(root, "source"),
    assessmentProjectPath: path.join(root, "assessment.project.json"),
    importResultPath: path.join(root, "import-result.json"),
    exportsDir: path.join(root, "exports"),
    brightspaceExportDir: path.join(root, "exports", "brightspace"),
    brightspaceCsvPath: path.join(root, "exports", "brightspace", `${slug}-brightspace.csv`)
  };
}

export function getProjectPaths(slug: string): ProjectPaths {
  const root = path.join(projectsRoot, slug);
  const resourcePaths = getResourcePaths(slug);

  return {
    root,
    rawDir: path.join(root, "raw"),
    rawEntrypoint: path.join(root, "raw", "original.html"),
    rawSourceText: path.join(root, "raw", "original-source.txt"),
    rawAssetsDir: path.join(root, "raw", "assets"),
    workspaceDir: path.join(root, "workspace"),
    workspaceEntrypoint: path.join(root, "workspace", "index.html"),
    workspaceAssetsDir: path.join(root, "workspace", "assets"),
    workspaceComponentsDir: path.join(root, "workspace", "components"),
    workspaceSectionsDir: path.join(root, "workspace", "sections"),
    resourceDir: resourcePaths.root,
    resourceExtractedDir: resourcePaths.extractedDir,
    referencesDir: resourcePaths.root,
    referencesRawDir: resourcePaths.root,
    referencesExtractedDir: resourcePaths.extractedDir,
    metaDir: path.join(root, "meta"),
    manifestPath: path.join(root, "meta", "project.json"),
    sectionMapPath: path.join(root, "meta", "section-map.json"),
    styleGuidePath: path.join(root, "meta", "style-guide.md"),
    contentOutlinePath: path.join(root, "meta", "content-outline.md"),
    referenceIndexPath: path.join(root, "meta", "reference-index.json"),
    resourceCatalogPath: path.join(root, "meta", "resource-catalog.json"),
    courseBlueprintPath: path.join(root, "meta", "course-blueprint.json"),
    assessmentMapPath: path.join(root, "meta", "assessment-map.json"),
    lessonPacketsDir: path.join(root, "meta", "lesson-packets"),
    lessonPacketsIndexPath: path.join(root, "meta", "lesson-packets", "index.json"),
    importLogPath: path.join(root, "meta", "import-log.md"),
    sessionLogPath: path.join(root, "meta", "studio-session-log.md"),
    intelligencePolicyPath: path.join(root, "meta", "intelligence-policy.json"),
    exportsDir: path.join(root, "exports"),
    brightspaceExportDir: path.join(root, "exports", "brightspace")
  };
}
