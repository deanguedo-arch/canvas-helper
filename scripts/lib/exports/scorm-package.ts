import { readFile } from "node:fs/promises";
import path from "node:path";

import { fileExists, listFilesRecursive, writeTextFile } from "../fs.js";
import { getProjectPaths } from "../paths.js";
import { loadProjectManifest, markProjectWorkspaceApproved } from "../projects.js";
import {
  buildScormBridgeScript,
  buildScormManifest,
  getScormExportLabel,
  getScormZipLabel,
  injectScormBridgeTag,
  type ScormVersion
} from "../scorm.js";

import {
  copyWorkspaceToExportDir,
  createZipFromDirectory,
  detectStorageKeysFromWorkspace,
  runExportAuthoringPreflight,
  toRelativePosixPath
} from "./shared.js";
import type { ExportAuthoringGateOptions } from "./shared.js";

export async function exportProjectToScormPackage(
  projectSlug: string,
  version: ScormVersion = "2004",
  gateOptions: ExportAuthoringGateOptions = {}
) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);
  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  await runExportAuthoringPreflight(projectSlug, paths.workspaceEntrypoint, gateOptions, "export");

  const exportLabel = getScormExportLabel(version);
  const zipLabel = getScormZipLabel(version);
  const scormExportDir = path.join(paths.exportsDir, exportLabel);
  const workspaceEntrypointRelative = toRelativePosixPath(paths.workspaceDir, paths.workspaceEntrypoint);
  const scormEntrypointPath = path.join(scormExportDir, ...workspaceEntrypointRelative.split("/"));
  const bridgeRelativePath = "./scorm-bridge.js";
  const bridgeAbsolutePath = path.join(scormExportDir, "scorm-bridge.js");

  await copyWorkspaceToExportDir(paths.workspaceDir, scormExportDir);

  if (!(await fileExists(scormEntrypointPath))) {
    throw new Error(
      `Workspace entrypoint "${workspaceEntrypointRelative}" was not copied into SCORM export for "${projectSlug}".`
    );
  }

  const storageKeys = await detectStorageKeysFromWorkspace(scormExportDir, `${projectSlug}::workspace-state::v1`);
  const bridgeScript = buildScormBridgeScript({
    projectSlug,
    storageKeys,
    version
  });

  await writeTextFile(bridgeAbsolutePath, bridgeScript);

  const entrypointHtml = await readFile(scormEntrypointPath, "utf8");
  const entrypointWithBridge = injectScormBridgeTag(entrypointHtml, bridgeRelativePath);
  await writeTextFile(scormEntrypointPath, entrypointWithBridge);

  const packageFiles = await listFilesRecursive(scormExportDir);
  const packageFilePaths = packageFiles.map((filePath) => toRelativePosixPath(scormExportDir, filePath));
  const scormManifest = buildScormManifest({
    identifier: `${projectSlug}-${zipLabel}`,
    title: manifest.slug,
    entrypoint: workspaceEntrypointRelative,
    files: packageFilePaths,
    version
  });

  await writeTextFile(path.join(scormExportDir, "imsmanifest.xml"), scormManifest);

  const finalFiles = await listFilesRecursive(scormExportDir);
  const zipPath = path.join(paths.exportsDir, `${projectSlug}-${zipLabel}.zip`);
  await createZipFromDirectory(scormExportDir, zipPath);
  await markProjectWorkspaceApproved(projectSlug);

  return {
    projectSlug,
    version,
    fileCount: finalFiles.length,
    exportDir: scormExportDir,
    zipPath,
    storageKeys
  };
}
