import { readFile } from "node:fs/promises";
import path from "node:path";

import { fileExists, listFilesRecursive, writeTextFile } from "../fs.js";
import { getProjectPaths, repoRoot } from "../paths.js";
import { recordCourseExportEvidence } from "../course-editing/export-freshness.js";
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
import { resolveScormTracking } from "../scorm-tracking.js";

export function resolveTrackedScormStorageKeys(
  detectedStorageKeys: string[],
  manifest: { googleHosted?: { trackedStorageKeys?: unknown[] } }
) {
  const keys = new Set<string>();
  for (const key of detectedStorageKeys) {
    const normalized = String(key || "").trim();
    if (normalized) {
      keys.add(normalized);
    }
  }

  for (const key of manifest.googleHosted?.trackedStorageKeys ?? []) {
    const normalized = String(key || "").trim();
    if (normalized) {
      keys.add(normalized);
    }
  }

  return [...keys];
}

export function resolveScormPackageTitle(manifest: { slug: string; title?: string }) {
  return manifest.title?.trim() || manifest.slug;
}

export async function exportProjectToScormPackage(
  projectSlug: string,
  version: ScormVersion = "2004",
  gateOptions: ExportAuthoringGateOptions & { reviewOnly?: boolean } = {}
) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);
  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  await runExportAuthoringPreflight(projectSlug, paths.workspaceEntrypoint, gateOptions, "export");

  const suffix = gateOptions.reviewOnly ? "-review" : "";
  const exportLabel = getScormExportLabel(version) + suffix;
  const zipLabel = getScormZipLabel(version) + suffix;
  const scormExportDir = path.join(paths.exportsDir, exportLabel);
  const workspaceEntrypointRelative = toRelativePosixPath(paths.workspaceDir, paths.workspaceEntrypoint);
  const scormEntrypointPath = path.join(scormExportDir, ...workspaceEntrypointRelative.split("/"));
  const bridgeRelativePath = "./scorm-bridge.js";
  const bridgeAbsolutePath = path.join(scormExportDir, "scorm-bridge.js");

  // Reject a malformed explicit contract before replacing any previous export.
  const contractPath = path.join(paths.workspaceDir, "scorm-tracking.json");
  const explicitTracking = await fileExists(contractPath) ? JSON.parse(await readFile(contractPath, "utf8")) : undefined;
  if (explicitTracking !== undefined) {
    resolveScormTracking(await readFile(paths.workspaceEntrypoint, "utf8"), [], version, explicitTracking);
  }

  await copyWorkspaceToExportDir(paths.workspaceDir, scormExportDir);

  if (!(await fileExists(scormEntrypointPath))) {
    throw new Error(
      `Workspace entrypoint "${workspaceEntrypointRelative}" was not copied into SCORM export for "${projectSlug}".`
    );
  }

  const detectedStorageKeys = await detectStorageKeysFromWorkspace(scormExportDir, `${projectSlug}::workspace-state::v1`);
  const storageKeys = resolveTrackedScormStorageKeys(detectedStorageKeys, manifest);
  const entrypointHtml = await readFile(scormEntrypointPath, "utf8");
  const trackingReport = resolveScormTracking(entrypointHtml, storageKeys, version, explicitTracking);
  if (trackingReport.contract?.completion && !storageKeys.includes(trackingReport.contract.completion.storageKey)) {
    storageKeys.push(trackingReport.contract.completion.storageKey);
  }
  const bridgeScript = buildScormBridgeScript({
    projectSlug,
    storageKeys,
    version,
    tracking: trackingReport.contract
  });

  await writeTextFile(bridgeAbsolutePath, bridgeScript);

  await writeTextFile(path.join(scormExportDir, "scorm-tracking-report.json"), JSON.stringify(trackingReport, null, 2));
  const entrypointWithBridge = injectScormBridgeTag(entrypointHtml, bridgeRelativePath);
  await writeTextFile(scormEntrypointPath, entrypointWithBridge);

  if (gateOptions.reviewOnly) await writeTextFile(path.join(scormExportDir, "review-only.json"), JSON.stringify({schemaVersion: 1, reviewOnly: true, projectSlug, authoringStatus: manifest.authoringStatus ?? null, liveBrightspaceVerified: false, photoAuthenticationConfigured: false}, null, 2));

  const packageFiles = await listFilesRecursive(scormExportDir);
  const packageFilePaths = packageFiles.map((filePath) => toRelativePosixPath(scormExportDir, filePath));
  const scormManifest = buildScormManifest({
    identifier: `${projectSlug}-${zipLabel}`,
    title: resolveScormPackageTitle(manifest),
    entrypoint: workspaceEntrypointRelative,
    files: packageFilePaths,
    version
  });

  await writeTextFile(path.join(scormExportDir, "imsmanifest.xml"), scormManifest);

  const finalFiles = await listFilesRecursive(scormExportDir);
  const zipPath = path.join(paths.exportsDir, `${projectSlug}-${zipLabel}.zip`);
  await createZipFromDirectory(scormExportDir, zipPath);
  if (!gateOptions.reviewOnly) {
    await markProjectWorkspaceApproved(projectSlug);
    await recordCourseExportEvidence({
      repoRoot,
      projectSlug,
      target: version === "1.2" ? "scorm12" : "scorm2004",
      artifactPath: zipPath
    });
  }

  return {
    projectSlug,
    version,
    fileCount: finalFiles.length,
    exportDir: scormExportDir,
    zipPath,
    storageKeys,
    trackingReport
  };
}
