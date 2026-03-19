import { readFile } from "node:fs/promises";
import path from "node:path";

import ts from "typescript";

import { copyDirectory, copyFileEnsuringDir, fileExists, listFilesRecursive, writeTextFile } from "../fs.js";
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

import {
  copyWorkspaceToExportDir,
  detectStorageKeysFromWorkspace,
  runExportAuthoringPreflight,
  toRelativePosixPath,
  type ExportAuthoringGateOptions
} from "./shared.js";

const GOOGLE_HOSTED_REACT_VERSION = "19.1.1";
const GOOGLE_HOSTED_REACT_IMPORT_REWRITES: Array<[from: string, to: string]> = [
  ["react", `https://esm.sh/react@${GOOGLE_HOSTED_REACT_VERSION}`],
  ["react/jsx-runtime", `https://esm.sh/react@${GOOGLE_HOSTED_REACT_VERSION}/jsx-runtime`],
  ["react/jsx-dev-runtime", `https://esm.sh/react@${GOOGLE_HOSTED_REACT_VERSION}/jsx-dev-runtime`],
  ["react-dom/client", `https://esm.sh/react-dom@${GOOGLE_HOSTED_REACT_VERSION}/client`]
];

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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rewriteReactImportsToEsmSh(source: string) {
  let rewritten = source;
  for (const [from, to] of GOOGLE_HOSTED_REACT_IMPORT_REWRITES) {
    const pattern = new RegExp(`(["'])${escapeRegExp(from)}\\1`, "g");
    rewritten = rewritten.replace(pattern, `"${to}"`);
  }
  return rewritten;
}

function formatTsDiagnostics(diagnostics: readonly ts.Diagnostic[]) {
  return diagnostics
    .map((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n").trim();
      if (!diagnostic.file || typeof diagnostic.start !== "number") {
        return message;
      }
      const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      return `${position.line + 1}:${position.character + 1} ${message}`;
    })
    .join("; ");
}

async function transpileHostedMainJsx(exportDir: string) {
  const mainJsxPath = path.join(exportDir, "main.jsx");
  if (!(await fileExists(mainJsxPath))) {
    return false;
  }

  const mainJsxSource = await readFile(mainJsxPath, "utf8");
  const transpileResult = ts.transpileModule(mainJsxSource, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ES2020,
      target: ts.ScriptTarget.ES2020,
      allowJs: true
    },
    fileName: "main.jsx",
    reportDiagnostics: true
  });

  const diagnostics = (transpileResult.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
  );
  if (diagnostics.length > 0) {
    throw new Error(`Failed to transpile main.jsx for Google Hosted export: ${formatTsDiagnostics(diagnostics)}`);
  }

  const browserSafeModule = rewriteReactImportsToEsmSh(transpileResult.outputText);
  await writeTextFile(path.join(exportDir, "main.js"), browserSafeModule);
  return true;
}

function extractD2LExportRoot(mapSource: string) {
  const match = mapSource.match(/["']exportRoot["']\s*:\s*["']([^"']+)["']/);
  return match?.[1]?.trim() || null;
}

async function copyHostedReferenceAssets(projectSlug: string, workspaceDir: string, exportDir: string) {
  const d2lMapCandidates = [path.join(workspaceDir, "d2l-map-data.js"), path.join(workspaceDir, "assets", "d2l-map-data.js")];
  let exportRoot: string | null = null;
  const cyrillicContentRootName = "\u0441ontent";
  const mojibakeContentRootName = "\u00D1\u0081ontent";

  for (const candidatePath of d2lMapCandidates) {
    if (!(await fileExists(candidatePath))) {
      continue;
    }
    const mapSource = await readFile(candidatePath, "utf8");
    exportRoot = extractD2LExportRoot(mapSource);
    if (exportRoot) {
      break;
    }
  }

  const paths = getProjectPaths(projectSlug);
  const copiedRoots = new Set<string>();

  function normalizeReferenceRoot(value: string | null) {
    if (!value) {
      return null;
    }
    const normalized = value.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/^\/+/, "");
    const [firstSegmentRaw] = normalized.split("/");
    const firstSegment = firstSegmentRaw?.trim();
    if (!firstSegment) {
      return null;
    }
    if (firstSegment === cyrillicContentRootName || firstSegment === mojibakeContentRootName) {
      return cyrillicContentRootName;
    }
    return firstSegment;
  }

  async function copyReferenceRoot(relativeRoot: string) {
    if (!relativeRoot || copiedRoots.has(relativeRoot)) {
      return;
    }
    const sourceRoot = path.join(paths.referencesDir, relativeRoot);
    if (!(await fileExists(sourceRoot))) {
      return;
    }
    await copyDirectory(sourceRoot, path.join(exportDir, relativeRoot));
    copiedRoots.add(relativeRoot);
  }

  const rootsToCopy = new Set<string>(["assignment", "quiz", "content", cyrillicContentRootName]);
  const normalizedExportRoot = normalizeReferenceRoot(exportRoot);
  if (normalizedExportRoot) {
    rootsToCopy.add(normalizedExportRoot);
  }

  for (const root of rootsToCopy) {
    await copyReferenceRoot(root);
  }

  const cyrillicContentRoot = path.join(paths.referencesDir, cyrillicContentRootName);
  if (await fileExists(cyrillicContentRoot)) {
    await copyDirectory(cyrillicContentRoot, path.join(exportDir, "content"));
  }

  const manifestPath = path.join(paths.referencesDir, "imsmanifest.xml");
  if (await fileExists(manifestPath)) {
    await copyFileEnsuringDir(manifestPath, path.join(exportDir, "imsmanifest.xml"));
  }
}
export async function exportProjectToGoogleHosted(
  projectSlug: string,
  gateOptions: ExportAuthoringGateOptions = {}
) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);
  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  await runExportAuthoringPreflight(projectSlug, paths.workspaceEntrypoint, gateOptions, "export");

  const exportLabel = getGoogleHostedExportLabel();
  const googleHostedExportDir = path.join(paths.exportsDir, exportLabel);
  const workspaceEntrypointRelative = toRelativePosixPath(paths.workspaceDir, paths.workspaceEntrypoint);
  const googleHostedEntrypointPath = path.join(googleHostedExportDir, ...workspaceEntrypointRelative.split("/"));
  const bridgeRelativePath = "./google-hosted-bridge.js";
  const preservedDeployFiles = await readPreservedDeployFiles(googleHostedExportDir);

  await copyWorkspaceToExportDir(paths.workspaceDir, googleHostedExportDir);
  await transpileHostedMainJsx(googleHostedExportDir);
  await copyHostedReferenceAssets(projectSlug, paths.workspaceDir, googleHostedExportDir);

  if (!(await fileExists(googleHostedEntrypointPath))) {
    throw new Error(
      `Workspace entrypoint "${workspaceEntrypointRelative}" was not copied into Google Hosted export for "${projectSlug}".`
    );
  }

  const fallbackStorageKey = `${projectSlug}::workspace-state::v1`;
  const detectedStorageKeys = await detectStorageKeysFromWorkspace(googleHostedExportDir, fallbackStorageKey);
  const storageKeys = [...new Set([fallbackStorageKey, ...detectedStorageKeys])];

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

