import assert from "node:assert/strict";
import test from "node:test";

import {
  buildScormBridgeScript,
  buildScormManifest,
  findStorageKeysInScriptSources,
  injectScormBridgeTag,
  normalizeScormVersion
} from "../lib/scorm.js";

test("normalizeScormVersion accepts common aliases", () => {
  assert.equal(normalizeScormVersion("2004"), "2004");
  assert.equal(normalizeScormVersion("2004-4th"), "2004");
  assert.equal(normalizeScormVersion("1.2"), "1.2");
  assert.equal(normalizeScormVersion("1-2"), "1.2");
  assert.equal(normalizeScormVersion("unknown"), null);
});

test("findStorageKeysInScriptSources extracts STORAGE_KEY and localStorage literals", () => {
  const source = `
    const STORAGE_KEY = "calm3new::workspace-state::v1";
    localStorage.setItem("secondary-key", "value");
  `;
  const keys = findStorageKeysInScriptSources([source], "fallback-key");

  assert.deepEqual(keys.sort(), ["calm3new::workspace-state::v1", "secondary-key"]);
});

test("injectScormBridgeTag inserts bridge before first local script", () => {
  const html = `
    <html>
      <head></head>
      <body>
        <script src="https://cdn.example.com/library.js"></script>
        <script src="./main.js"></script>
      </body>
    </html>
  `;

  const output = injectScormBridgeTag(html, "./scorm-bridge.js");
  assert.match(output, /<script src="\.\/scorm-bridge\.js"><\/script>\s*<script src="\.\/main\.js"><\/script>/);
});

test("buildScormManifest emits SCORM 2004 metadata and resource references", () => {
  const manifest = buildScormManifest({
    identifier: "calm3new-scorm-2004",
    title: "CALM Module 3",
    entrypoint: "index.html",
    files: ["index.html", "main.js", "styles.css", "scorm-bridge.js"],
    version: "2004"
  });

  assert.match(manifest, /<schemaversion>2004 4th Edition<\/schemaversion>/);
  assert.match(manifest, /adlcp_v1p3/);
  assert.match(manifest, /<file href="scorm-bridge\.js" \/>/);
});

test("buildScormManifest emits SCORM 1.2 metadata", () => {
  const manifest = buildScormManifest({
    identifier: "calm3new-scorm-1-2",
    title: "CALM Module 3",
    entrypoint: "index.html",
    files: ["index.html"],
    version: "1.2"
  });

  assert.match(manifest, /<schemaversion>1\.2<\/schemaversion>/);
  assert.match(manifest, /adlcp_rootv1p2/);
});

test("buildScormBridgeScript targets the expected SCORM API", () => {
  const bridge2004 = buildScormBridgeScript({
    projectSlug: "calm3new",
    storageKeys: ["calm3new::workspace-state::v1"],
    version: "2004"
  });
  const bridge12 = buildScormBridgeScript({
    projectSlug: "calm3new",
    storageKeys: ["calm3new::workspace-state::v1"],
    version: "1.2"
  });

  assert.match(bridge2004, /API_1484_11/);
  assert.match(bridge2004, /"maxSuspendChars":60000/);
  assert.match(bridge2004, /const bootedImmediately = boot\(\);/);
  assert.match(bridge12, /LMSInitialize/);
  assert.match(bridge12, /"maxSuspendChars":3500/);
});

test("buildScormBridgeScript emits explicit suspend and save-exit flow", () => {
  const bridge2004 = buildScormBridgeScript({
    projectSlug: "calm3new",
    storageKeys: ["calm3new::workspace-state::v1"],
    version: "2004"
  });

  assert.match(bridge2004, /cmi\.completion_status/);
  assert.match(bridge2004, /cmi\.exit/);
  assert.match(bridge2004, /suspend/);
  assert.match(bridge2004, /saveAndExit/);
  assert.match(bridge2004, /Save and Exit/);
});
