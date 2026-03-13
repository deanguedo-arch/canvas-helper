import { readFile } from "node:fs/promises";
import path from "node:path";

import { fileExists, listFilesRecursive, writeTextFile } from "../fs.js";
import { getProjectPaths } from "../paths.js";
import { loadProjectManifest, markProjectWorkspaceApproved } from "../projects.js";

import {
  copyWorkspaceToExportDir,
  createZipFromDirectory,
  runExportAuthoringPreflight,
  unique,
  type ExportAuthoringGateOptions
} from "./shared.js";

export async function exportProjectToBrightspace(
  projectSlug: string,
  gateOptions: ExportAuthoringGateOptions = {}
) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);

  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  await runExportAuthoringPreflight(projectSlug, paths.workspaceEntrypoint, gateOptions, "export");

  await copyWorkspaceToExportDir(paths.workspaceDir, paths.brightspaceExportDir);

  const exportedFiles = await listFilesRecursive(paths.brightspaceExportDir);
  const htmlFiles = exportedFiles.filter((filePath) => path.extname(filePath).toLowerCase() === ".html");
  const externalDependencies: string[] = [];

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    externalDependencies.push(...[...html.matchAll(/https?:\/\/[^\s"'<>]+/g)].map((match) => match[0]));
  }

  const report = `# Brightspace Export Report

- Project: ${manifest.slug}
- Generated: ${new Date().toISOString()}
- Files exported: ${exportedFiles.length}
- Export directory: ${paths.brightspaceExportDir}

## Upload Guidance
- Upload the entire brightspace export folder contents together so relative asset paths remain intact.
- Use index.html as the course page entrypoint.

## External Dependencies
${externalDependencies.length > 0 ? unique(externalDependencies).map((dependency) => `- ${dependency}`).join("\n") : "- None detected."}

## Warnings
${externalDependencies.length > 0 ? "- This export still depends on external CDN resources. Keep internet access available or replace those dependencies before publishing offline." : "- None."}
  `;

  await writeTextFile(path.join(paths.brightspaceExportDir, "export-report.md"), report);
  await markProjectWorkspaceApproved(projectSlug);

  return {
    projectSlug,
    fileCount: exportedFiles.length,
    exportDir: paths.brightspaceExportDir
  };
}

export async function exportProjectToBrightspacePackage(
  projectSlug: string,
  gateOptions: ExportAuthoringGateOptions = {}
) {
  const brightspaceExport = await exportProjectToBrightspace(projectSlug, gateOptions);
  const paths = getProjectPaths(projectSlug);
  const zipPath = path.join(paths.exportsDir, `${projectSlug}-brightspace.zip`);

  await createZipFromDirectory(paths.brightspaceExportDir, zipPath);

  return {
    ...brightspaceExport,
    zipPath
  };
}
