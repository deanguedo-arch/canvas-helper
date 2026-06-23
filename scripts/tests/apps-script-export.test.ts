import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import * as exporter from "../lib/exporter.js";
import { fileExists, removePath } from "../lib/fs.js";
import { repoRoot } from "../lib/paths.js";
import { cleanupProjectFixture, createProjectFixture } from "./helpers/project-fixture.js";

const TEST_PROJECT_SLUG = "test-apps-script-export";
const REFERENCE_ASSET_PROJECT_SLUG = "test-apps-script-reference-assets";
const DIRECTORY_REF_PROJECT_SLUG = "test-apps-script-directory-ref";
const ESCAPED_HTML_ASSET_PROJECT_SLUG = "test-apps-script-escaped-html-asset";
const CSS_IMPORT_PROJECT_SLUG = "test-apps-script-css-import";
const LOCAL_MODULE_IMPORT_PROJECT_SLUG = "test-apps-script-local-module-import";
const NO_AUTOSAVE_PROJECT_SLUG = "test-apps-script-no-autosave";
const PRECOMPILED_BABEL_PROJECT_SLUG = "test-apps-script-precompiled-babel";

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
    fixtureManifest.appsScript = {
      driveRootFolderId: "fixture-drive-root-folder-id"
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
    assert.match(codeGs, /function resolveDriveAssetRootFolder_/);
    assert.match(codeGs, /folder\.getFoldersByName\(CANVAS_HELPER_DRIVE_ASSET_ROOT_LABEL\)/);
    assert.match(codeGs, /folder\.getFilesByName\(CANVAS_HELPER_ASSET_MANIFEST_PATH\)\.hasNext\(\)/);
    assert.match(codeGs, /Drive asset folder is missing asset-manifest\.json/);
    assert.match(codeGs, /const driveIndexMeta = \{\};/);
    assert.match(codeGs, /const duplicateRelativePaths = \[\];/);
    assert.match(codeGs, /duplicatePathCount: duplicateRelativePaths\.length/);
    assert.match(codeGs, /duplicatePaths: duplicateRelativePaths\.slice\(0, 25\)/);
    assert.match(codeGs, /function noteDriveIndexEntry_\(/);
    assert.match(codeGs, /const updatedAt = file\.getLastUpdated \? file\.getLastUpdated\(\)\.getTime\(\) : 0;/);
    assert.match(codeGs, /if \(existingMeta\.updatedAt > updatedAt\) \{/);
    assert.match(codeGs, /const CANVAS_HELPER_DEFAULT_DRIVE_ROOT_FOLDER_ID = "fixture-drive-root-folder-id";/);
    assert.match(
      codeGs,
      /const normalizedFolderId = String\(folderId \|\| CANVAS_HELPER_DEFAULT_DRIVE_ROOT_FOLDER_ID \|\| ''\)\.trim\(\);/
    );
    assert.match(codeGs, /setProperty\(CANVAS_HELPER_DRIVE_ROOT_FOLDER_ID_KEY, normalizedFolderId\);/);
    assert.match(codeGs, /function setupCourseDrive\(\)/);
    assert.match(codeGs, /return setDriveRootFolderId\(CANVAS_HELPER_DEFAULT_DRIVE_ROOT_FOLDER_ID\);/);
    assert.match(codeGs, /window\.__CH_ASSET__/);
    assert.match(codeGs, /HtmlService/);
    assert.match(codeGs, /drive-assets/i);
    assert.match(codeGs, /XFrameOptionsMode\.ALLOWALL/);
    assert.match(codeGs, /CANVAS_HELPER_DRIVE_INDEX_FOLDER_ID_KEY/);
    assert.match(codeGs, /const currentDriveRootFolderId = getDriveRootFolderId_\(\)/);
    assert.match(codeGs, /getProperty\(CANVAS_HELPER_DRIVE_ROOT_FOLDER_ID_KEY\) \|\| CANVAS_HELPER_DEFAULT_DRIVE_ROOT_FOLDER_ID/);
    assert.match(codeGs, /cachedIndexFolderId === currentDriveRootFolderId/);
    assert.match(codeGs, /assetUrlMap\[asset\.id\] = asset\.serveMode === 'apps-script'\s*\n\s*\? '__CH_APPS_SCRIPT_ASSET__'/);
    assert.match(codeGs, /return serveAsset_\(String\(e\.parameter\.asset\), e\.parameter\.raw === '1'\);/);
    assert.match(codeGs, /function createBase64AssetOutput_\(asset, driveIndex\)/);
    assert.match(codeGs, /Utilities\.base64Encode\(DriveApp\.getFileById\(fileId\)\.getBlob\(\)\.getBytes\(\)\)/);
    assert.match(codeGs, /function getCanvasHelperAssetBase64\(assetId\)/);
    assert.match(codeGs, /base64: Utilities\.base64Encode\(Utilities\.newBlob\(textValue, manifestEntry\.mimeType\)\.getBytes\(\)\)/);
    assert.match(codeGs, /assetJsonp/);
    assert.match(codeGs, /function serveAssetJsonp_\(assetId, callbackName\)/);
    assert.match(codeGs, /ContentService\.MimeType\.JAVASCRIPT/);
    assert.match(codeGs, /function buildAppsScriptAssetUrl_\(assetId, rawMode\)/);
    assert.match(codeGs, /const textAssetMap = \{\};/);
    assert.match(codeGs, /const textAssetMimeMap = \{\};/);
    assert.match(codeGs, /if \(asset\.bootstrapInline\) \{/);
    assert.match(codeGs, /textAssetMap\[asset\.id\] = readDriveTextFileByPath_\(asset\.relativePath, assetContext\.driveIndex\);/);
    assert.match(codeGs, /textAssetMimeMap\[asset\.id\] = asset\.mimeType;/);
    assert.match(codeGs, /function toScriptSafeJson_\(value\)/);
    assert.match(codeGs, /function getAppsScriptWebAppUrl_\(\)/);
    assert.match(codeGs, /ScriptApp\.getService\(\)\.getUrl\(\) \|\| ''/);
    assert.match(codeGs, /const appsScriptWebAppUrl = getAppsScriptWebAppUrl_\(\);/);
    assert.match(codeGs, /const appsScriptWebAppUrl_=/);
    assert.match(codeGs, /const assetBaseUrl = new URL\(appsScriptWebAppUrl_\|\|window\.location\.href\);/);
    assert.match(codeGs, /assetBaseUrl\.search = "";/);
    assert.match(codeGs, /assetBaseUrl\.hash = "";/);
    assert.match(codeGs, /assetUrl\.searchParams\.set\("asset", assetId\);/);
    assert.match(codeGs, /if \(rawMode\) \{\s*assetUrl\.searchParams\.set\("raw", "1"\);/);
    assert.match(codeGs, /window\.__CH_ASSET_RAW__=function\(assetId\)\{return buildEmbeddedTextAssetUrl_\(assetId\)\|\|buildAppsScriptAssetUrl_\(assetId, true\);\};/);
    assert.match(codeGs, /function buildAppsScriptTextFrameHydratorBootstrap_\(\)/);
    assert.match(codeGs, /installAppsScriptTextFrameHydrator_/);
    assert.match(codeGs, /Loading assignment workspace\.\.\./);
    assert.match(codeGs, /Loading chapter workspace\.\.\./);
    assert.match(codeGs, /Still loading workspace\.\.\./);
    assert.match(codeGs, /function getDriveFileId_/);
    assert.match(codeGs, /function hydratePdfViewerFrame_/);
    assert.match(codeGs, /function rewriteFrameHtmlAssets_/);
    assert.match(codeGs, /function requestAssetDataUrl_/);
    assert.match(codeGs, /getCanvasHelperAssetBase64\(assetId\)/);
    assert.match(codeGs, /apps-script-frame-image-rewriter/);
    assert.match(codeGs, /Loading PDF preview\.\.\./);
    assert.match(codeGs, /https:\/\/drive\.google\.com\/file\/d\//);
    assert.match(codeGs, /fetch\(buildAppsScriptAssetUrl_\(request\.assetId,true\),\{credentials:"include"\}\)/);
    assert.match(codeGs, /frame\.src=blobUrl\+request\.childSearch\+request\.childHash/);
    assert.match(codeGs, /frame\.src=buildAppsScriptAssetUrl_\(request\.assetId,false\)\+request\.childSearch\+request\.childHash/);
    assert.match(codeGs, /new MutationObserver/);
    assert.match(codeGs, /attributes:true,attributeFilter:\["src"\]/);
    assert.match(codeGs, /window\.__CH_TEXT_ASSET_MAP__=/);
    assert.match(codeGs, /window\.__CH_TEXT_ASSET_MIME_MAP__=/);
    assert.match(codeGs, /function buildEmbeddedTextAssetUrl_\(assetId\)/);
    assert.match(codeGs, /URL\.createObjectURL\(new Blob\(\[mappedTextAsset\],\{type:mappedTextAssetMime\}\)\)/);
    assert.match(codeGs, /toScriptSafeJson_\(textAssetMap\)/);
    assert.match(codeGs, /toScriptSafeJson_\(textAssetMimeMap\)/);
    assert.match(codeGs, /window\.__CH_TEXT_ASSET__=function\(assetId\)\{return window\.__CH_TEXT_ASSET_MAP__\[assetId\]\|\|null;\};/);
    assert.match(codeGs, /window\.__CH_ASSET_JSONP__=function\(assetId,callbackName\)/);
    assert.match(codeGs, /const nativeFetch = window\.fetch \? window\.fetch\.bind\(window\) : null;/);
    assert.match(codeGs, /window\.fetch=function\(input, init\)/);
    assert.match(codeGs, /new Response\(mappedTextAsset,\{status:200,headers:\{"Content-Type":"text\/plain;charset=utf-8"\}\}\)/);
    assert.match(codeGs, /const CANVAS_HELPER_AUTOSAVE_PROJECT_SLUG = "test-apps-script-export";/);
    assert.match(codeGs, /const CANVAS_HELPER_AUTOSAVE_STORAGE_KEYS = \["apps-script-progress","apps-script-ui"\];/);
    assert.match(codeGs, /function getCanvasHelperAutosave\(\)/);
    assert.match(codeGs, /function saveCanvasHelperAutosave\(payload\)/);
    assert.match(codeGs, /Session\.getTemporaryActiveUserKey\(\)/);
    assert.match(codeGs, /const activeEmail = Session\.getActiveUser\(\)\.getEmail\(\);[\s\S]+return 'email:' \+ String\(activeEmail\)\.trim\(\)\.toLowerCase\(\);[\s\S]+const temporaryKey = Session\.getTemporaryActiveUserKey\(\);/);
    assert.match(codeGs, /throw new Error\('Apps Script autosave requires a signed-in Google account or a Google temporary active user key\.'\);/);
    assert.doesNotMatch(codeGs, /return 'anonymous';/);
    assert.match(codeGs, /LockService\.getScriptLock\(\)/);
    assert.match(codeGs, /DriveApp\.createFolder/);
    assert.match(codeGs, /window\.__CH_APPS_SCRIPT_AUTOSAVE__/);
    assert.match(codeGs, /google\.script\.run/);
    assert.match(codeGs, /let remoteSyncEnabled=false;/);
    assert.match(codeGs, /function getStatusNode\(\)/);
    assert.match(codeGs, /document\.createElement\("button"\)/);
    assert.match(codeGs, /Enable Google save/);
    assert.match(codeGs, /Local progress only/);
    assert.match(codeGs, /if\(!hasRunner\(\)\|\|applyingRemote\|\|!remoteSyncEnabled\)\{return;\}/);
    assert.match(codeGs, /window\.__CH_APPS_SCRIPT_AUTOSAVE__=\{enable:function\(\)\{enableRemoteSync\("manual-enable"\);\}/);
    assert.match(codeGs, /document\.addEventListener\("click",function\(event\)/);
    assert.doesNotMatch(codeGs, /scheduleRestore\(\);/);
    assert.match(codeGs, /localStorage\.setItem/);
    assert.match(codeGs, /window\.addEventListener\("storage"/);
    assert.match(codeGs, /window\.setInterval\(function\(\)\{detectAndQueueSave\("interval"\);\},1500\);/);
    assert.doesNotMatch(codeGs, /Object\.getPrototypeOf\(window\.localStorage\)/);
    assert.doesNotMatch(codeGs, /storageProto\.setItem/);
    assert.match(codeGs, /window\.__CH_ASSET_MIME_MAP__=/);
    assert.doesNotMatch(codeGs, /https:\/\/drive\.google\.com\/thumbnail\?id=/);
    assert.doesNotThrow(() => new vm.Script(codeGs));
    const appsScriptContext = vm.createContext({
      ScriptApp: {
        getService: () => ({
          getUrl: () => "https://script.google.com/macros/s/fixture-deployment/exec"
        })
      }
    });
    vm.runInContext(codeGs, appsScriptContext);
    const bootstrapHtml = vm.runInContext(
      [
        "buildAssetBootstrap_({",
        "  driveIndex: {",
        "    'binary-assets/fixture.pdf': 'fixture-pdf-file-id',",
        "    'text-assets/fixture-viewer.html': 'fixture-viewer-file-id'",
        "  },",
        "  assetManifest: {",
        "    assets: [",
        "      { id: 'asset-pdf', relativePath: 'binary-assets/fixture.pdf', mimeType: 'application/pdf', serveMode: 'drive' },",
        "      { id: 'asset-viewer', relativePath: 'text-assets/fixture-viewer.html', mimeType: 'text/html', serveMode: 'apps-script' }",
        "    ]",
        "  }",
        "})"
      ].join("\n"),
      appsScriptContext
    ) as string;
    const bootstrapJs = bootstrapHtml.replace(/^<script>/, "").replace(/<\/script>$/, "");
    assert.match(bootstrapJs, /function hydratePdfViewerFrame_/);
    assert.match(bootstrapJs, /const marker="\/file\/d\/";/);
    assert.match(bootstrapJs, /params\.get\("id"\)/);
    assert.match(bootstrapJs, /attributes:true,attributeFilter:\["src"\]/);
    assert.doesNotMatch(bootstrapJs, /pathname\.match/);
    assert.doesNotThrow(() => new vm.Script(bootstrapJs));
    assert.match(claspIgnore, /drive-assets\/\*\*/);
    assert.match(claspIgnore, /\*\*\/drive-assets\/\*\*/);
    assert.match(driveManifest, /"shellAssetPath":\s*"__canvas_helper_shell\/index\.html"/);
    assert.match(driveManifest, /"assets":\s*\[/);
    assert.match(driveShell, /Hello Apps Script/);
    assert.match(readme, /Google Sites/i);
    assert.match(readme, /Apps Script/i);
    assert.match(readme, /Google Drive/i);
    assert.match(readme, /setDriveRootFolderId/i);
    assert.match(readme, /paste `Code\.gs` and `appsscript\.json` in the Apps Script editor/);
    assert.match(readme, /EIPS accounts where `clasp` authentication fails/);
    assert.match(readme, /Bundled Drive asset folder ID: fixture-drive-root-folder-id/);
    assert.match(readme, /setupCourseDrive\(\)/);
    assert.match(readme, /polls tracked localStorage keys/i);
    assert.doesNotMatch(readme, /patches localStorage/i);
  } finally {
    await cleanupProjectFixture(TEST_PROJECT_SLUG);
  }
});

test("exportProjectToAppsScript packages D2L reference assets for module pages", async () => {
  const exportProjectToAppsScript = getAppsScriptExportFn();
  assert.equal(typeof exportProjectToAppsScript, "function");

  await createProjectFixture({
    slug: REFERENCE_ASSET_PROJECT_SLUG,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <head>",
      "    <meta charset=\"utf-8\">",
      "    <title>Reference Asset Fixture</title>",
      "  </head>",
      "  <body>",
      "    <div id=\"app\">Reference shell</div>",
      "    <script src=\"./main.js\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "main.js": [
        `window.referenceHtml = "/preview/references/raw/${REFERENCE_ASSET_PROJECT_SLUG}/content/unit/page.html";`,
        "window.referencePdf = window.referenceHtml.replace('page.html', 'reading.pdf');",
        "fetch(window.referenceHtml).then((response) => response.text());",
        ""
      ].join("\n")
    }
  });

  const resourceRoot = path.join(repoRoot, "projects", "resources", REFERENCE_ASSET_PROJECT_SLUG);

  try {
    await mkdir(path.join(resourceRoot, "content", "unit"), { recursive: true });
    await mkdir(path.join(resourceRoot, "quiz", "unit-quiz"), { recursive: true });
    await Promise.all([
      writeFile(
        path.join(resourceRoot, "content", "unit", "page.html"),
        "<!doctype html><html><body><img src=\"image.png\" alt=\"Reference image\"></body></html>\n",
        "utf8"
      ),
      writeFile(
        path.join(resourceRoot, "content", "unit", "utf16.html"),
        Buffer.concat([
          Buffer.from([0xff, 0xfe]),
          Buffer.from("<!doctype html><html><body><p>The psyche means the mind.</p></body></html>\n", "utf16le")
        ])
      ),
      writeFile(path.join(resourceRoot, "content", "unit", "image.png"), "fixture image bytes\n", "utf8"),
      writeFile(path.join(resourceRoot, "content", "unit", "reading.pdf"), "%PDF-1.4 fixture\n", "utf8"),
      writeFile(path.join(resourceRoot, "quiz", "unit-quiz", "qti.xml"), "<questestinterop></questestinterop>\n", "utf8")
    ]);

    const result = await exportProjectToAppsScript!(REFERENCE_ASSET_PROJECT_SLUG);
    const driveManifestPath = path.join(result.exportDir, "drive-assets", "asset-manifest.json");
    const driveShellPath = path.join(result.exportDir, "drive-assets", "__canvas_helper_shell", "index.html");
    const driveManifest = JSON.parse(await readFile(driveManifestPath, "utf8")) as {
      assets?: Array<{
        bootstrapInline?: boolean;
        contentKind?: string;
        mimeType?: string;
        referencePath?: string;
        relativePath?: string;
        serveMode?: string;
      }>;
    };
    const driveShell = await readFile(driveShellPath, "utf8");
    const referenceAssets = driveManifest.assets?.filter((asset) => asset.referencePath) ?? [];
    const pageAsset = referenceAssets.find((asset) => asset.referencePath === "content/unit/page.html");
    const utf16Asset = referenceAssets.find((asset) => asset.referencePath === "content/unit/utf16.html");
    const imageAsset = referenceAssets.find((asset) => asset.referencePath === "content/unit/image.png");
    const pdfAsset = referenceAssets.find((asset) => asset.referencePath === "content/unit/reading.pdf");
    const quizAsset = referenceAssets.find((asset) => asset.referencePath === "quiz/unit-quiz/qti.xml");
    const pageAssetContent = pageAsset?.relativePath
      ? await readFile(path.join(result.exportDir, "drive-assets", pageAsset.relativePath), "utf8")
      : "";
    const utf16AssetContent = utf16Asset?.relativePath
      ? await readFile(path.join(result.exportDir, "drive-assets", utf16Asset.relativePath), "utf8")
      : "";

    assert.ok(referenceAssets.length >= 4);
    assert.equal(pageAsset?.contentKind, "text");
    assert.equal(utf16Asset?.contentKind, "text");
    assert.equal(pageAsset?.serveMode, "apps-script");
    assert.equal(pageAsset?.bootstrapInline, undefined);
    assert.equal(imageAsset?.contentKind, "file");
    assert.equal(imageAsset?.serveMode, "drive");
    assert.equal(pdfAsset?.mimeType, "application/pdf");
    assert.equal(pdfAsset?.serveMode, "drive");
    assert.equal(quizAsset?.mimeType, "application/xml");
    assert.equal(quizAsset?.serveMode, "apps-script");
    assert.match(pageAssetContent, /src="image\.png"/);
    assert.doesNotMatch(pageAssetContent, /data:image\/png;base64,/);
    assert.match(utf16AssetContent, /The psyche means the mind/);
    assert.doesNotMatch(utf16AssetContent, /\u0000|�/);
    assert.match(driveShell, /canvas-helper-apps-script-reference-assets/);
    assert.match(driveShell, /window\.__CH_REFERENCE_ASSET__/);
    assert.match(driveShell, /preloadedTextAssetMap_/);
    assert.match(driveShell, /function hydrateImageAsset_/);
    assert.doesNotMatch(driveShell, /__CH_ASSET_JSONP__/);
    assert.match(driveShell, /!isImageAsset_\(assetId\)/);
    assert.match(driveShell, /function requestImageDataUrl_/);
    assert.match(driveShell, /getCanvasHelperAssetBase64\(assetId\)/);
    assert.match(driveShell, /apps-script-reference-image-hydrator/);
    assert.match(driveShell, /data:"\+mimeType\+"\;base64,/);
    assert.doesNotMatch(driveShell, /function requestImageBase64_/);
    assert.doesNotMatch(driveShell, /function requestImageJsonp_/);
    assert.doesNotMatch(driveShell, /Image JSONP failed/);
    assert.doesNotMatch(driveShell, /window\.parent\.google/);
    assert.doesNotMatch(driveShell, /apps-script-image-hydrator/);
    assert.match(driveShell, /window\.__CH_REFERENCE_ASSET_ID__/);
    assert.match(driveShell, /window\.__CH_REFERENCE_PATH_FOR_ASSET__/);
    assert.match(driveShell, /window\.__CH_REFERENCE_ASSET_MIME__/);
    assert.match(driveShell, /Object\.assign\(window\.__CH_TEXT_ASSET_MAP__,preloadedTextAssetMap_\)/);
    assert.match(driveShell, /function buildPreloadedTextResponse_/);
    assert.match(driveShell, /Promise\.resolve\(preloadedResponse\)/);
    assert.match(driveShell, /Reference image/);
    assert.match(driveShell, /\/preview\/references\/raw\//);
    assert.match(driveShell, /toPdfPreviewUrl_/);
    assert.match(driveShell, /\\u0441ontent/);
  } finally {
    await Promise.all([cleanupProjectFixture(REFERENCE_ASSET_PROJECT_SLUG), removePath(resourceRoot)]);
  }
});

test("exportProjectToAppsScript can disable Apps Script autosave", async () => {
  const exportProjectToAppsScript = getAppsScriptExportFn();
  assert.equal(typeof exportProjectToAppsScript, "function");

  await createProjectFixture({
    slug: NO_AUTOSAVE_PROJECT_SLUG,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <body>",
      "    <div id=\"app\">No autosave fixture</div>",
      "    <script src=\"./main.js\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "main.js": [
        "localStorage.setItem('test-apps-script-no-autosave::workspace-state::v1', 'saved');",
        ""
      ].join("\n")
    }
  });

  try {
    const fixtureManifestPath = path.join(repoRoot, "projects", NO_AUTOSAVE_PROJECT_SLUG, "meta", "project.json");
    const fixtureManifest = JSON.parse(await readFile(fixtureManifestPath, "utf8")) as Record<string, unknown>;
    fixtureManifest.appsScript = {
      disableAutosave: true,
      driveRootFolderId: "fixture-drive-root-folder-id"
    };
    await writeFile(fixtureManifestPath, `${JSON.stringify(fixtureManifest, null, 2)}\n`, "utf8");

    const result = await exportProjectToAppsScript!(NO_AUTOSAVE_PROJECT_SLUG);
    const codeGs = await readFile(path.join(result.exportDir, "Code.gs"), "utf8");
    const readme = await readFile(path.join(result.exportDir, "README-deploy.md"), "utf8");

    assert.doesNotThrow(() => new vm.Script(codeGs));
    assert.doesNotMatch(codeGs, /CANVAS_HELPER_AUTOSAVE/);
    assert.doesNotMatch(codeGs, /buildAutosaveBootstrap_/);
    assert.doesNotMatch(codeGs, /getCanvasHelperAutosave/);
    assert.doesNotMatch(codeGs, /saveCanvasHelperAutosave/);
    assert.doesNotMatch(codeGs, /window\.__CH_APPS_SCRIPT_AUTOSAVE__/);
    assert.doesNotMatch(codeGs, /Enable Google save/);
    assert.match(codeGs, /buildAssetBootstrap_\(assetContext\)/);
    assert.doesNotMatch(codeGs, /buildAssetBootstrap_\(assetContext\) \+ buildAutosaveBootstrap_\(\)/);
    assert.match(readme, /Apps Script autosave\/manual save is disabled/);
    assert.match(readme, /no manual save button, autosave button, or Apps Script save\/restore functions are generated/);
  } finally {
    await cleanupProjectFixture(NO_AUTOSAVE_PROJECT_SLUG);
  }
});

test("exportProjectToAppsScript ignores local references that resolve to directories", async () => {
  const exportProjectToAppsScript = getAppsScriptExportFn();
  assert.equal(typeof exportProjectToAppsScript, "function");

  await createProjectFixture({
    slug: DIRECTORY_REF_PROJECT_SLUG,
    workspaceFiles: {
      "main.js": [
        "const moduleRoute = './module2';",
        "document.body.setAttribute('data-module-route', moduleRoute);",
        ""
      ].join("\n"),
      "module2/placeholder.txt": "Directory marker for a route-like workspace reference.\n"
    }
  });

  try {
    const result = await exportProjectToAppsScript!(DIRECTORY_REF_PROJECT_SLUG);
    const driveManifestPath = path.join(result.exportDir, "drive-assets", "asset-manifest.json");
    const driveShellPath = path.join(result.exportDir, "drive-assets", "__canvas_helper_shell", "index.html");
    const [driveManifest, driveShell] = await Promise.all([
      readFile(driveManifestPath, "utf8"),
      readFile(driveShellPath, "utf8")
    ]);

    assert.match(driveShell, /const moduleRoute = '\.\/module2';/);
    assert.doesNotMatch(driveManifest, /module2/);
  } finally {
    await cleanupProjectFixture(DIRECTORY_REF_PROJECT_SLUG);
  }
});

test("exportProjectToAppsScript expands local CSS imports inside embedded HTML assets", async () => {
  const exportProjectToAppsScript = getAppsScriptExportFn();
  assert.equal(typeof exportProjectToAppsScript, "function");

  await createProjectFixture({
    slug: CSS_IMPORT_PROJECT_SLUG,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <body>",
      "    <div id=\"app\">CSS import fixture</div>",
      "    <script src=\"./main.js\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "main.js": [
        "window.assignmentPath = './assignment.html';",
        "document.body.setAttribute('data-assignment-path', window.assignmentPath);",
        ""
      ].join("\n"),
      "assignment.html": [
        "<!doctype html>",
        "<html>",
        "  <head>",
        "    <link rel=\"stylesheet\" href=\"./assignment.css\">",
        "  </head>",
        "  <body>",
        "    <main class=\"assignment-card base-rule\">Imported assignment style</main>",
        "  </body>",
        "</html>",
        ""
      ].join("\n"),
      "assignment.css": [
        "@import \"./base.css\";",
        ".assignment-card {",
        "  padding: 2rem;",
        "}",
        ""
      ].join("\n"),
      "base.css": [
        ".base-rule {",
        "  color: #123456;",
        "}",
        ""
      ].join("\n")
    }
  });

  try {
    const result = await exportProjectToAppsScript!(CSS_IMPORT_PROJECT_SLUG);
    const driveManifestPath = path.join(result.exportDir, "drive-assets", "asset-manifest.json");
    const driveManifest = JSON.parse(await readFile(driveManifestPath, "utf8")) as {
      assets?: Array<{ bootstrapInline?: boolean; byteSize?: number; contentKind?: string; relativePath?: string }>;
    };
    const textAssets = await Promise.all(
      (driveManifest.assets ?? [])
        .filter((asset) => asset.contentKind === "text" && asset.relativePath)
        .map(async (asset) => ({
          asset,
          content: await readFile(path.join(result.exportDir, "drive-assets", asset.relativePath ?? ""), "utf8")
        }))
    );
    const assignmentAsset = textAssets.find(({ content }) => content.includes("Imported assignment style"));
    const assignmentAssetContent = assignmentAsset?.content ?? "";

    assert.equal(assignmentAsset?.asset.bootstrapInline, true);
    assert.equal(typeof assignmentAsset?.asset.byteSize, "number");
    assert.match(assignmentAssetContent, /Imported assignment style/);
    assert.match(assignmentAssetContent, /\/\* inlined \.\/base\.css \*\//);
    assert.match(assignmentAssetContent, /\.base-rule\s*\{\s*color:\s*#123456;/);
    assert.match(assignmentAssetContent, /\.assignment-card\s*\{\s*padding:\s*2rem;/);
    assert.doesNotMatch(assignmentAssetContent, /@import\s+["']\.\/base\.css["']/);
  } finally {
    await cleanupProjectFixture(CSS_IMPORT_PROJECT_SLUG);
  }
});

test("exportProjectToAppsScript inlines local ES module imports in the drive shell", async () => {
  const exportProjectToAppsScript = getAppsScriptExportFn();
  assert.equal(typeof exportProjectToAppsScript, "function");

  await createProjectFixture({
    slug: LOCAL_MODULE_IMPORT_PROJECT_SLUG,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <body>",
      "    <div id=\"app\">Local module fixture</div>",
      "    <script type=\"text/babel\" data-type=\"module\" src=\"./main.jsx\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "main.jsx": [
        "import courseData from './course-data.js';",
        "import delivery, { deliveryLabel as visibleDeliveryLabel } from './delivery.js';",
        "window.LOCAL_MODULE_FIXTURE = {",
        "  title: courseData.title,",
        "  label: visibleDeliveryLabel,",
        "  count: delivery.length",
        "};",
        ""
      ].join("\n"),
      "course-data.js": [
        "export default {",
        "  title: 'Fixture Course',",
        "  launchPath: './assignment.html'",
        "};",
        ""
      ].join("\n"),
      "delivery.js": [
        "export const deliveryLabel = 'Ready';",
        "const delivery = [{ embedPath: './assignment.html' }];",
        "export default delivery;",
        ""
      ].join("\n"),
      "assignment.html": [
        "<!doctype html>",
        "<html>",
        "  <body>Assignment shell</body>",
        "</html>",
        ""
      ].join("\n")
    }
  });

  try {
    const result = await exportProjectToAppsScript!(LOCAL_MODULE_IMPORT_PROJECT_SLUG);
    const driveManifestPath = path.join(result.exportDir, "drive-assets", "asset-manifest.json");
    const driveShellPath = path.join(result.exportDir, "drive-assets", "__canvas_helper_shell", "index.html");
    const [driveManifest, driveShell] = await Promise.all([
      readFile(driveManifestPath, "utf8"),
      readFile(driveShellPath, "utf8")
    ]);
    const scriptBlocks = [...driveShell.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1] ?? "");

    assert.match(driveShell, /Local module fixture/);
    assert.match(driveShell, /const courseData = __ch_module_default_\d+;/);
    assert.match(driveShell, /const visibleDeliveryLabel = deliveryLabel;/);
    assert.match(driveShell, /launchPath: window\.__CH_ASSET__\("asset-\d+"\)/);
    assert.match(driveShell, /embedPath: window\.__CH_ASSET__\("asset-\d+"\)/);
    assert.doesNotMatch(driveShell, /from\s+window\.__CH_ASSET__/);
    assert.doesNotMatch(driveShell, /from\s+['"]\.\/course-data\.js['"]/);
    assert.doesNotMatch(driveShell, /from\s+['"]\.\/delivery\.js['"]/);
    assert.doesNotMatch(driveShell, /export\s+default/);
    assert.match(driveManifest, /"mimeType":\s*"text\/html"/);
    assert.match(driveManifest, /"serveMode":\s*"apps-script"/);
    assert.ok(scriptBlocks.length > 0);
    for (const [index, scriptBlock] of scriptBlocks.entries()) {
      assert.doesNotThrow(() => new vm.Script(scriptBlock, { filename: `apps-script-local-module-shell-${index}.js` }));
    }
  } finally {
    await cleanupProjectFixture(LOCAL_MODULE_IMPORT_PROJECT_SLUG);
  }
});

test("exportProjectToAppsScript prefers precompiled module scripts over Babel JSX scripts", async () => {
  const exportProjectToAppsScript = getAppsScriptExportFn();
  assert.equal(typeof exportProjectToAppsScript, "function");

  await createProjectFixture({
    slug: PRECOMPILED_BABEL_PROJECT_SLUG,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <body>",
      "    <div id=\"app\">Precompiled fixture</div>",
      "    <script src=\"https://unpkg.com/@babel/standalone/babel.min.js\"></script>",
      "    <script type=\"text/babel\" data-type=\"module\" src=\"./main.jsx?rev=fixture\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "main.jsx": [
        "const App = () => <strong>JSX source should not ship</strong>;",
        "window.SHOULD_NOT_USE_BABEL_SOURCE = App;",
        ""
      ].join("\n"),
      "main.js": [
        "import React from 'https://esm.sh/react@19.1.1';",
        "window.PRECOMPILED_APPS_SCRIPT_ENTRY = true;",
        "window.PRECOMPILED_REACT_READY = typeof React.createElement === 'function';",
        "document.body.setAttribute('data-entry', 'precompiled');",
        ""
      ].join("\n")
    }
  });

  try {
    const result = await exportProjectToAppsScript!(PRECOMPILED_BABEL_PROJECT_SLUG);
    const driveShellPath = path.join(result.exportDir, "drive-assets", "__canvas_helper_shell", "index.html");
    const driveShell = await readFile(driveShellPath, "utf8");
    const scriptBlocks = [...driveShell.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1] ?? "");

    assert.match(driveShell, /data-precompiled-source="main\.js"/);
    assert.match(driveShell, /data-bundled-source="esbuild"/);
    assert.match(driveShell, /PRECOMPILED_APPS_SCRIPT_ENTRY/);
    assert.doesNotMatch(driveShell, /text\/babel/);
    assert.doesNotMatch(driveShell, /type="module"/);
    assert.doesNotMatch(driveShell, /@babel\/standalone|babel\.min\.js/);
    assert.doesNotMatch(driveShell, /https:\/\/esm\.sh/);
    assert.doesNotMatch(driveShell, /import\s+[\s\S]+?\s+from\s+['"]/);
    assert.doesNotMatch(driveShell, /SHOULD_NOT_USE_BABEL_SOURCE/);
    assert.doesNotMatch(driveShell, /<strong>JSX source should not ship<\/strong>/);
    assert.ok(scriptBlocks.length > 0);
    for (const [index, scriptBlock] of scriptBlocks.entries()) {
      assert.doesNotThrow(() => new vm.Script(scriptBlock, { filename: `apps-script-precompiled-shell-${index}.js` }));
    }
  } finally {
    await cleanupProjectFixture(PRECOMPILED_BABEL_PROJECT_SLUG);
  }
});

test("exportProjectToAppsScript keeps escaped HTML strings syntactically valid", async () => {
  const exportProjectToAppsScript = getAppsScriptExportFn();
  assert.equal(typeof exportProjectToAppsScript, "function");

  await createProjectFixture({
    slug: ESCAPED_HTML_ASSET_PROJECT_SLUG,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <body>",
      "    <div id=\"app\"></div>",
      "    <script src=\"./course-data.js\"></script>",
      "    <script src=\"./main.js\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "course-data.js": [
        "window.TEST_IMAGE = \"./photo.jpg\";",
        "window.TEST_DATA = {",
        "  instructionHtml: \"<div><img src=\\\"./photo.jpg\\\" alt=\\\"Photo\\\"><img src=\\\"./photo%20space.jpg\\\" alt=\\\"Photo Space\\\"></div>\"",
        "};",
        ""
      ].join("\n"),
      "main.js": "document.body.setAttribute('data-loaded', String(Boolean(window.TEST_DATA)));\n",
      "photo.jpg": "fixture image bytes\n",
      "photo space.jpg": "fixture image bytes\n"
    }
  });

  try {
    const result = await exportProjectToAppsScript!(ESCAPED_HTML_ASSET_PROJECT_SLUG);
    const driveShellPath = path.join(result.exportDir, "drive-assets", "__canvas_helper_shell", "index.html");
    const driveShell = await readFile(driveShellPath, "utf8");
    const scriptBlocks = [...driveShell.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1] ?? "");

    assert.match(driveShell, /window\.TEST_IMAGE = window\.__CH_ASSET__\("asset-\d+"\);/);
    assert.equal([...driveShell.matchAll(/src=\\"" \+ window\.__CH_ASSET__\("asset-\d+"\)/g)].length, 2);
    assert.doesNotMatch(driveShell, /src=\\"\.\/photo\.jpg\\"/);
    assert.doesNotMatch(driveShell, /src=\\"\.\/photo%20space\.jpg\\"/);
    assert.doesNotMatch(driveShell, /src=\\window\.__CH_ASSET__/);
    assert.ok(scriptBlocks.length > 0);
    for (const [index, scriptBlock] of scriptBlocks.entries()) {
      assert.doesNotThrow(() => new vm.Script(scriptBlock, { filename: `apps-script-shell-${index}.js` }));
    }
  } finally {
    await cleanupProjectFixture(ESCAPED_HTML_ASSET_PROJECT_SLUG);
  }
});

test("package.json exposes the apps-script export command", async () => {
  const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };

  assert.equal(packageJson.scripts?.["export:apps-script"], "tsx scripts/export-apps-script.ts");
});
