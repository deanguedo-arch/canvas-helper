import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  APPS_SCRIPT_ASSET_MANIFEST_PATH,
  APPS_SCRIPT_DRIVE_ASSET_DIR,
  buildAppsScriptAssetManifest,
  buildAppsScriptClaspIgnore,
  buildAppsScriptCode,
  buildAppsScriptDeployReadme,
  buildAppsScriptManifest
} from "../apps-script.js";
import {
  copyFileEnsuringDir,
  ensureDir,
  fileExists,
  listFilesRecursive,
  removePath,
  writeJsonFile,
  writeTextFile
} from "../fs.js";
import { getProjectPaths } from "../paths.js";
import { loadProjectManifest, markProjectWorkspaceApproved } from "../projects.js";

import {
  buildSingleHtmlOutputBundle,
  detectStorageKeysFromWorkspace,
  runExportAuthoringPreflight,
  type EmbeddedAssetRecord,
  type ExportAuthoringGateOptions
} from "./shared.js";

type PreservedAppsScriptConfig = {
  claspJson: string | null;
};

async function preserveAppsScriptConfig(exportDir: string): Promise<PreservedAppsScriptConfig> {
  const claspJsonPath = path.join(exportDir, ".clasp.json");
  return {
    claspJson: (await fileExists(claspJsonPath)) ? await readFile(claspJsonPath, "utf8") : null
  };
}

async function restoreAppsScriptConfig(exportDir: string, preservedConfig: PreservedAppsScriptConfig) {
  if (preservedConfig.claspJson) {
    await writeTextFile(path.join(exportDir, ".clasp.json"), preservedConfig.claspJson);
  }
}

async function writeDriveAssetFile(
  driveAssetsDir: string,
  manifestEntry: ReturnType<typeof buildAppsScriptAssetManifest>["assets"][number],
  record: EmbeddedAssetRecord
) {
  const destinationPath = path.join(driveAssetsDir, manifestEntry.relativePath);
  if (record.contentKind === "text") {
    await writeTextFile(destinationPath, record.textContent);
    return;
  }

  await copyFileEnsuringDir(record.sourcePath, destinationPath);
}

function countExportFiles(files: string[], driveAssetsDir: string) {
  const normalizedDriveAssetsDir = path.resolve(driveAssetsDir);
  let driveAssetFileCount = 0;
  let shellFileCount = 0;

  for (const filePath of files) {
    if (path.resolve(filePath).startsWith(`${normalizedDriveAssetsDir}${path.sep}`)) {
      driveAssetFileCount += 1;
      continue;
    }

    shellFileCount += 1;
  }

  return {
    driveAssetFileCount,
    shellFileCount
  };
}

export async function exportProjectToAppsScript(
  projectSlug: string,
  gateOptions: ExportAuthoringGateOptions = {}
) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);

  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  await runExportAuthoringPreflight(projectSlug, paths.workspaceEntrypoint, gateOptions, "export");

  const bundle = await buildSingleHtmlOutputBundle(paths.workspaceDir, paths.workspaceEntrypoint);
  const driveAssetManifest = buildAppsScriptAssetManifest(bundle.documentAssets);
  const exportDir = path.join(paths.exportsDir, "apps-script");
  const driveAssetsDir = path.join(exportDir, APPS_SCRIPT_DRIVE_ASSET_DIR);
  const projectTitle = manifest.slug;
  const explicitStorageKeys = Array.isArray(manifest.googleHosted?.trackedStorageKeys)
    ? manifest.googleHosted.trackedStorageKeys.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
  const fallbackStorageKey = `${projectSlug}::workspace-state::v1`;
  const detectedStorageKeys =
    explicitStorageKeys.length > 0 ? [] : await detectStorageKeysFromWorkspace(paths.workspaceDir, fallbackStorageKey);
  const storageKeys =
    explicitStorageKeys.length > 0
      ? [...new Set(explicitStorageKeys)]
      : [...new Set([fallbackStorageKey, ...detectedStorageKeys])];
  const preservedConfig = await preserveAppsScriptConfig(exportDir);

  await removePath(exportDir);
  await ensureDir(driveAssetsDir);

  await Promise.all([
    writeTextFile(path.join(exportDir, "appsscript.json"), buildAppsScriptManifest()),
    writeTextFile(path.join(exportDir, ".claspignore"), buildAppsScriptClaspIgnore()),
    writeTextFile(
      path.join(exportDir, "Code.gs"),
      buildAppsScriptCode({
        assetManifestPath: APPS_SCRIPT_ASSET_MANIFEST_PATH,
        projectSlug,
        projectTitle,
        shellAssetPath: driveAssetManifest.shellAssetPath,
        storageKeys
      })
    ),
    writeTextFile(path.join(driveAssetsDir, driveAssetManifest.shellAssetPath), bundle.htmlShell),
    writeJsonFile(path.join(driveAssetsDir, APPS_SCRIPT_ASSET_MANIFEST_PATH), driveAssetManifest)
  ]);

  await Promise.all(
    bundle.documentAssets.map(async (record) => {
      const manifestEntry = driveAssetManifest.assets.find((asset) => asset.id === record.id);
      if (!manifestEntry) {
        throw new Error(`Missing Apps Script asset manifest entry for "${record.id}".`);
      }

      await writeDriveAssetFile(driveAssetsDir, manifestEntry, record);
    })
  );

  const exportFiles = await listFilesRecursive(exportDir);
  const fileCounts = countExportFiles(exportFiles, driveAssetsDir);

  await writeTextFile(
    path.join(exportDir, "README-deploy.md"),
    buildAppsScriptDeployReadme({
      driveAssetFileCount: fileCounts.driveAssetFileCount,
      projectSlug,
      projectTitle,
      shellFileCount: fileCounts.shellFileCount + (preservedConfig.claspJson ? 1 : 0),
      storageKeys
    })
  );

  await restoreAppsScriptConfig(exportDir, preservedConfig);
  await markProjectWorkspaceApproved(projectSlug);

  const finalExportFiles = await listFilesRecursive(exportDir);
  const finalFileCounts = countExportFiles(finalExportFiles, driveAssetsDir);

  return {
    projectSlug,
    exportDir,
    shellFileCount: finalFileCounts.shellFileCount,
    driveAssetFileCount: finalFileCounts.driveAssetFileCount,
    storageKeys
  };
}
