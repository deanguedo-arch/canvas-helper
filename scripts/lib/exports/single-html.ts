import path from "node:path";

import { fileExists, ensureDir, writeTextFile } from "../fs.js";
import { getProjectPaths } from "../paths.js";
import { markProjectWorkspaceApproved } from "../projects.js";

import { buildSingleHtmlOutput, runExportAuthoringPreflight, type ExportAuthoringGateOptions } from "./shared.js";

export async function exportProjectToSingleHtml(
  projectSlug: string,
  gateOptions: ExportAuthoringGateOptions = {}
) {
  const paths = getProjectPaths(projectSlug);

  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  await runExportAuthoringPreflight(projectSlug, paths.workspaceEntrypoint, gateOptions, "export");

  const { html, inlinedAssetCount } = await buildSingleHtmlOutput(paths.workspaceDir, paths.workspaceEntrypoint);
  const singleHtmlExportDir = path.join(paths.exportsDir, "single-html");
  const outputPath = path.join(singleHtmlExportDir, `${projectSlug}.html`);

  await ensureDir(singleHtmlExportDir);
  await writeTextFile(outputPath, html);
  await markProjectWorkspaceApproved(projectSlug);

  return {
    projectSlug,
    outputPath,
    inlinedAssetCount
  };
}
