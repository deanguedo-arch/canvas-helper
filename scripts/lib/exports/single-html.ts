import path from "node:path";

import { fileExists, ensureDir } from "../fs.js";
import { getProjectPaths, repoRoot } from "../paths.js";
import { recordCourseExportEvidence } from "../course-editing/export-freshness.js";
import { markProjectWorkspaceApproved } from "../projects.js";

import {
  buildSingleHtmlOutputBundle,
  writeSingleHtmlOutputBundle,
  runExportAuthoringPreflight,
  type ExportAuthoringGateOptions
} from "./shared.js";

export async function exportProjectToSingleHtml(
  projectSlug: string,
  gateOptions: ExportAuthoringGateOptions = {}
) {
  const paths = getProjectPaths(projectSlug);

  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  await runExportAuthoringPreflight(projectSlug, paths.workspaceEntrypoint, gateOptions, "export");

  const bundle = await buildSingleHtmlOutputBundle(paths.workspaceDir, paths.workspaceEntrypoint);
  const singleHtmlExportDir = path.join(paths.exportsDir, "single-html");
  const outputPath = path.join(singleHtmlExportDir, `${projectSlug}.html`);

  await ensureDir(singleHtmlExportDir);
  await writeSingleHtmlOutputBundle(outputPath, bundle);
  await markProjectWorkspaceApproved(projectSlug);
  await recordCourseExportEvidence({ repoRoot, projectSlug, target: "html", artifactPath: outputPath });

  return {
    projectSlug,
    outputPath,
    inlinedAssetCount: bundle.inlinedAssetCount
  };
}
