import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import * as exporter from "../lib/exporter.js";
import { fileExists } from "../lib/fs.js";
import { repoRoot } from "../lib/paths.js";
import { cleanupProjectFixture, createProjectFixture } from "./helpers/project-fixture.js";

const TEST_PROJECT_SLUG = "test-apps-script-export";

type AppsScriptExportFn = (projectSlug: string) => Promise<{
  driveAssetFileCount: number;
  projectSlug: string;
  exportDir: string;
  shellFileCount: number;
}>;

function getAppsScriptExportFn() {
  return (exporter as Record<string, unknown>).exportProjectToAppsScript as AppsScriptExportFn | undefined;
}

test("exportProjectToAppsScript writes a drive-backed Apps Script shell package", async () => {
  const exportProjectToAppsScript = getAppsScriptExportFn();
  assert.equal(typeof exportProjectToAppsScript, "function");

  await createProjectFixture({
    slug: TEST_PROJECT_SLUG,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <head>",
      "    <meta charset=\"utf-8\">",
      "    <title>Apps Script Fixture</title>",
      "    <link rel=\"stylesheet\" href=\"./styles.css\">",
      "  </head>",
      "  <body>",
      "    <div id=\"app\">Hello Apps Script</div>",
      "    <script src=\"./main.js\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "styles.css": [
        "body {",
        "  background: #0b1220;",
        "  color: #f8fafc;",
        "}",
        ""
      ].join("\n"),
      "main.js": [
        "document.body.setAttribute('data-fixture', 'apps-script');",
        "localStorage.setItem('apps-script-progress', JSON.stringify({ complete: true }));",
        ""
      ].join("\n")
    }
  });

  try {
    const fixtureManifestPath = path.join(repoRoot, "projects", TEST_PROJECT_SLUG, "meta", "project.json");
    const fixtureManifest = JSON.parse(await readFile(fixtureManifestPath, "utf8")) as Record<string, unknown>;
    fixtureManifest.googleHosted = {
      trackedStorageKeys: ["apps-script-progress", "apps-script-ui"]
    };
    await writeFile(fixtureManifestPath, `${JSON.stringify(fixtureManifest, null, 2)}\n`, "utf8");

    const result = await exportProjectToAppsScript!(TEST_PROJECT_SLUG);
    const appsscriptJsonPath = path.join(result.exportDir, "appsscript.json");
    const codeGsPath = path.join(result.exportDir, "Code.gs");
    const readmePath = path.join(result.exportDir, "README-deploy.md");
    const claspIgnorePath = path.join(result.exportDir, ".claspignore");
    const driveAssetsDir = path.join(result.exportDir, "drive-assets");
    const driveShellPath = path.join(driveAssetsDir, "__canvas_helper_shell", "index.html");
    const driveManifestPath = path.join(driveAssetsDir, "asset-manifest.json");
    const exportFiles = await Promise.all([
      readFile(appsscriptJsonPath, "utf8"),
      readFile(codeGsPath, "utf8"),
      readFile(readmePath, "utf8"),
      readFile(claspIgnorePath, "utf8"),
      readFile(driveManifestPath, "utf8"),
      readFile(driveShellPath, "utf8")
    ]);
    const [appsscriptJson, codeGs, readme, claspIgnore, driveManifest, driveShell] = exportFiles;

    assert.equal(result.projectSlug, TEST_PROJECT_SLUG);
    assert.equal(result.exportDir, path.join(repoRoot, "projects", TEST_PROJECT_SLUG, "exports", "apps-script"));
    assert.ok(result.shellFileCount > 0);
    assert.ok(result.driveAssetFileCount > 0);
    assert.equal(await fileExists(appsscriptJsonPath), true);
    assert.equal(await fileExists(codeGsPath), true);
    assert.equal(await fileExists(readmePath), true);
    assert.equal(await fileExists(claspIgnorePath), true);
    assert.equal(await fileExists(driveAssetsDir), true);
    assert.equal(await fileExists(driveShellPath), true);
    assert.equal(await fileExists(driveManifestPath), true);
    assert.match(appsscriptJson, /"runtimeVersion":\s*"V8"/);
    assert.match(codeGs, /function doGet/);
    assert.match(codeGs, /DriveApp/);
    assert.match(codeGs, /PropertiesService/);
    assert.match(codeGs, /setDriveRootFolderId/);
    assert.match(codeGs, /rebuildDriveAssetIndex/);
    assert.match(codeGs, /window\.__CH_ASSET__/);
    assert.match(codeGs, /HtmlService/);
    assert.match(codeGs, /drive-assets/i);
    assert.match(codeGs, /XFrameOptionsMode\.ALLOWALL/);
    assert.match(codeGs, /CANVAS_HELPER_DRIVE_INDEX_FOLDER_ID_KEY/);
    assert.match(codeGs, /const currentDriveRootFolderId = getDriveRootFolderId_\(\)/);
    assert.match(codeGs, /cachedIndexFolderId === currentDriveRootFolderId/);
    assert.match(codeGs, /assetUrlMap\[asset\.id\] = asset\.serveMode === 'apps-script'\s*\n\s*\? '__CH_APPS_SCRIPT_ASSET__'/);
    assert.match(codeGs, /return serveTextAsset_\(String\(e\.parameter\.asset\), e\.parameter\.raw === '1'\);/);
    assert.match(codeGs, /function buildAppsScriptAssetUrl_\(assetId, rawMode\)/);
    assert.match(codeGs, /const textAssetMap = \{\};/);
    assert.match(codeGs, /const textAssetMimeMap = \{\};/);
    assert.match(codeGs, /textAssetMap\[asset\.id\] = readDriveTextFileByPath_\(asset\.relativePath, assetContext\.driveIndex\);/);
    assert.match(codeGs, /textAssetMimeMap\[asset\.id\] = asset\.mimeType;/);
    assert.match(codeGs, /function toScriptSafeJson_\(value\)/);
    assert.match(codeGs, /const assetBaseUrl = new URL\(window\.location\.href\);/);
    assert.match(codeGs, /assetBaseUrl\.search = "";/);
    assert.match(codeGs, /assetBaseUrl\.hash = "";/);
    assert.match(codeGs, /assetUrl\.searchParams\.set\("asset", assetId\);/);
    assert.match(codeGs, /if \(rawMode\) \{\s*assetUrl\.searchParams\.set\("raw", "1"\);/);
    assert.match(codeGs, /window\.__CH_ASSET_RAW__=function\(assetId\)\{return buildEmbeddedTextAssetUrl_\(assetId\)\|\|buildAppsScriptAssetUrl_\(assetId, true\);\};/);
    assert.match(codeGs, /window\.__CH_TEXT_ASSET_MAP__=/);
    assert.match(codeGs, /window\.__CH_TEXT_ASSET_MIME_MAP__=/);
    assert.match(codeGs, /function buildEmbeddedTextAssetUrl_\(assetId\)/);
    assert.match(codeGs, /URL\.createObjectURL\(new Blob\(\[mappedTextAsset\],\{type:mappedTextAssetMime\}\)\)/);
    assert.match(codeGs, /toScriptSafeJson_\(textAssetMap\)/);
    assert.match(codeGs, /toScriptSafeJson_\(textAssetMimeMap\)/);
    assert.match(codeGs, /window\.__CH_TEXT_ASSET__=function\(assetId\)\{return window\.__CH_TEXT_ASSET_MAP__\[assetId\]\|\|null;\};/);
    assert.match(codeGs, /const nativeFetch = window\.fetch \? window\.fetch\.bind\(window\) : null;/);
    assert.match(codeGs, /window\.fetch=function\(input, init\)/);
    assert.match(codeGs, /new Response\(mappedTextAsset,\{status:200,headers:\{"Content-Type":"text\/plain;charset=utf-8"\}\}\)/);
    assert.match(codeGs, /const CANVAS_HELPER_AUTOSAVE_PROJECT_SLUG = "test-apps-script-export";/);
    assert.match(codeGs, /const CANVAS_HELPER_AUTOSAVE_STORAGE_KEYS = \["apps-script-progress","apps-script-ui"\];/);
    assert.match(codeGs, /function getCanvasHelperAutosave\(\)/);
    assert.match(codeGs, /function saveCanvasHelperAutosave\(payload\)/);
    assert.match(codeGs, /Session\.getTemporaryActiveUserKey\(\)/);
    assert.match(codeGs, /LockService\.getScriptLock\(\)/);
    assert.match(codeGs, /DriveApp\.createFolder/);
    assert.match(codeGs, /window\.__CH_APPS_SCRIPT_AUTOSAVE__/);
    assert.match(codeGs, /google\.script\.run/);
    assert.match(codeGs, /localStorage\.setItem/);
    assert.match(codeGs, /window\.addEventListener\("storage"/);
    assert.match(codeGs, /window\.setInterval\(function\(\)\{detectAndQueueSave\("interval"\);\},1500\);/);
    assert.doesNotMatch(codeGs, /Object\.getPrototypeOf\(window\.localStorage\)/);
    assert.doesNotMatch(codeGs, /storageProto\.setItem/);
    assert.match(codeGs, /asset\.mimeType && asset\.mimeType\.indexOf\('image\/'\) === 0/);
    assert.match(codeGs, /https:\/\/drive\.google\.com\/thumbnail\?id=/);
    assert.doesNotThrow(() => new vm.Script(codeGs));
    assert.match(claspIgnore, /drive-assets\/\*\*/);
    assert.match(claspIgnore, /\*\*\/drive-assets\/\*\*/);
    assert.match(driveManifest, /"shellAssetPath":\s*"__canvas_helper_shell\/index\.html"/);
    assert.match(driveManifest, /"assets":\s*\[/);
    assert.match(driveShell, /Hello Apps Script/);
    assert.match(readme, /Google Sites/i);
    assert.match(readme, /Apps Script/i);
    assert.match(readme, /Google Drive/i);
    assert.match(readme, /setDriveRootFolderId/i);
  } finally {
    await cleanupProjectFixture(TEST_PROJECT_SLUG);
  }
});

test("package.json exposes the apps-script export command", async () => {
  const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };

  assert.equal(packageJson.scripts?.["export:apps-script"], "tsx scripts/export-apps-script.ts");
});
