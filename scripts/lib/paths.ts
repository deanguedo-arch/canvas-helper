import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ProjectPaths } from "./types.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(currentDir, "..", "..");
export const projectsRoot = path.join(repoRoot, "projects");

export function getProjectPaths(slug: string): ProjectPaths {
  const root = path.join(projectsRoot, slug);

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
    referencesDir: path.join(root, "references"),
    referencesRawDir: path.join(root, "references", "raw"),
    referencesExtractedDir: path.join(root, "references", "extracted"),
    metaDir: path.join(root, "meta"),
    manifestPath: path.join(root, "meta", "project.json"),
    sectionMapPath: path.join(root, "meta", "section-map.json"),
    styleGuidePath: path.join(root, "meta", "style-guide.md"),
    contentOutlinePath: path.join(root, "meta", "content-outline.md"),
    referenceIndexPath: path.join(root, "meta", "reference-index.json"),
    importLogPath: path.join(root, "meta", "import-log.md"),
    sessionLogPath: path.join(root, "meta", "studio-session-log.md"),
    exportsDir: path.join(root, "exports"),
    brightspaceExportDir: path.join(root, "exports", "brightspace")
  };
}
