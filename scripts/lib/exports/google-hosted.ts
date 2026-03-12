import { readFile } from "node:fs/promises";
import path from "node:path";

import { fileExists, listFilesRecursive, writeTextFile } from "../fs.js";
import {
  buildFirebaseConfigTemplate,
  buildFirebaseHostingConfig,
  buildFirebaseRcTemplate,
  buildGoogleHostedBridgeScript,
  buildGoogleHostedDeployReadme,
  getGoogleHostedExportLabel,
  injectGoogleHostedBridgeTag
} from "../google-hosted.js";
import { getProjectPaths } from "../paths.js";
import { loadProjectManifest, markProjectWorkspaceApproved } from "../projects.js";

import { copyWorkspaceToExportDir, detectStorageKeysFromWorkspace, toRelativePosixPath } from "./shared.js";

async function readPreservedDeployFiles(exportDir: string) {
  const preservedFileNames = ["firebase-config.json", ".firebaserc"];
  const preservedFiles = new Map<string, string>();

  await Promise.all(
    preservedFileNames.map(async (fileName) => {
      const filePath = path.join(exportDir, fileName);
      if (!(await fileExists(filePath))) {
        return;
      }

      preservedFiles.set(fileName, await readFile(filePath, "utf8"));
    })
  );

  return preservedFiles;
}

export async function exportProjectToGoogleHosted(projectSlug: string) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);
  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  const exportLabel = getGoogleHostedExportLabel();
  const googleHostedExportDir = path.join(paths.exportsDir, exportLabel);
  const workspaceEntrypointRelative = toRelativePosixPath(paths.workspaceDir, paths.workspaceEntrypoint);
  const googleHostedEntrypointPath = path.join(googleHostedExportDir, ...workspaceEntrypointRelative.split("/"));
  const bridgeRelativePath = "./google-hosted-bridge.js";
  const preservedDeployFiles = await readPreservedDeployFiles(googleHostedExportDir);

  await copyWorkspaceToExportDir(paths.workspaceDir, googleHostedExportDir);

  if (!(await fileExists(googleHostedEntrypointPath))) {
    throw new Error(
      `Workspace entrypoint "${workspaceEntrypointRelative}" was not copied into Google Hosted export for "${projectSlug}".`
    );
  }

  const storageKeys = await detectStorageKeysFromWorkspace(googleHostedExportDir, `${projectSlug}::workspace-state::v1`);

  await Promise.all([
    writeTextFile(
      path.join(googleHostedExportDir, "google-hosted-bridge.js"),
      buildGoogleHostedBridgeScript({
        projectSlug,
        storageKeys
      })
    ),
    writeTextFile(path.join(googleHostedExportDir, "firebase-config.template.json"), buildFirebaseConfigTemplate(projectSlug)),
    writeTextFile(path.join(googleHostedExportDir, "firebase.json"), buildFirebaseHostingConfig()),
    writeTextFile(path.join(googleHostedExportDir, ".firebaserc.template"), buildFirebaseRcTemplate()),
    writeTextFile(
      path.join(googleHostedExportDir, "README-deploy.md"),
      buildGoogleHostedDeployReadme({
        projectSlug,
        projectTitle: manifest.slug,
        storageKeys
      })
    ),
    ...[...preservedDeployFiles.entries()].map(([fileName, content]) =>
      writeTextFile(path.join(googleHostedExportDir, fileName), content)
    )
  ]);

  const entrypointHtml = await readFile(googleHostedEntrypointPath, "utf8");
  const entrypointWithBridge = injectGoogleHostedBridgeTag(entrypointHtml, bridgeRelativePath);
  await writeTextFile(googleHostedEntrypointPath, entrypointWithBridge);

  const finalFiles = await listFilesRecursive(googleHostedExportDir);
  await markProjectWorkspaceApproved(projectSlug);

  return {
    projectSlug,
    fileCount: finalFiles.length,
    exportDir: googleHostedExportDir,
    storageKeys
  };
}
