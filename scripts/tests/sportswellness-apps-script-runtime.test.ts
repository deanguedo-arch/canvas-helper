import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/sportswellness/workspace/main.js");
const pdfViewerPath = path.resolve("projects/sportswellness/workspace/pdf-viewer.html");

test("sportswellness apps-script runtime fetches assignment html raw and loads performance tools via iframe srcdoc when needed", async () => {
  const source = await readFile(mainPath, "utf8");

  const expectedSnippets = [
    "function getAppsScriptAssetId(url)",
    "new URL(url, window.location.href)",
    "parsedUrl.searchParams.get('asset')",
    "function getAppsScriptRawAssetUrl(url)",
    "window.__CH_ASSET_RAW__",
    "window.__CH_TEXT_ASSET__",
    "const embeddedTextAsset = window.__CH_TEXT_ASSET__(assetId)",
    "return embeddedTextAsset;",
    "const embeddedScriptAsset = getEmbeddedTextAsset(src)",
    "script.textContent = embeddedScriptAsset;",
    "return Promise.resolve();",
    "fetchTextAsset(getAppsScriptRawAssetUrl(ASSIGNMENT_RUNTIME_HTML_SRC))",
    "async function setPerformanceFrameSource(frame, url)",
    "frame.srcdoc = html",
    "frame.src = url",
    "data-performance-frame"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness pdf viewer falls back to a Drive preview iframe for Drive-hosted PDFs", async () => {
  const source = await readFile(pdfViewerPath, "utf8");

  const expectedSnippets = [
    "function getDriveFileId(url)",
    "function buildDrivePreviewUrl(url)",
    "function renderDrivePreview(previewUrl)",
    "document.createElement('iframe')",
    "previewFrame.src = previewUrl",
    "const drivePreviewUrl = buildDrivePreviewUrl(file);",
    "if (drivePreviewUrl) {",
    "renderDrivePreview(drivePreviewUrl);",
    "return;"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
