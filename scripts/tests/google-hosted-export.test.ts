import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { exportProjectToGoogleHosted } from "../lib/exporter.js";
import {
  buildGoogleHostedBridgeScript,
  injectGoogleHostedBridgeTag
} from "../lib/google-hosted.js";
import { fileExists, readJsonFile } from "../lib/fs.js";
import { repoRoot } from "../lib/paths.js";
import { cleanupProjectFixture, createProjectFixture } from "./helpers/project-fixture.js";

const TEST_PROJECT_SLUG = "test-google-hosted-export";

test("injectGoogleHostedBridgeTag inserts bridge before first local script", () => {
  const html = `
    <html>
      <head></head>
      <body>
        <script src="https://cdn.example.com/library.js"></script>
        <script src="./main.js"></script>
      </body>
    </html>
  `;

  const output = injectGoogleHostedBridgeTag(html, "./google-hosted-bridge.js");
  assert.match(
    output,
    /<script src="\.\/google-hosted-bridge\.js"><\/script>\s*<script src="\.\/main\.js"><\/script>/
  );
});

test("buildGoogleHostedBridgeScript includes auth, firestore, project binding, and autosave messaging", () => {
  const bridge = buildGoogleHostedBridgeScript({
    projectSlug: "calm3new",
    storageKeys: ["calm3new::workspace-state::v1"]
  });

  assert.match(bridge, /signInWithPopup/);
  assert.match(bridge, /signInWithRedirect/);
  assert.match(bridge, /getRedirectResult/);
  assert.match(bridge, /collection\("users"\)\.doc/);
  assert.match(bridge, /"projectSlug":"calm3new"/);
  assert.match(bridge, /Autosave ready/);
  assert.match(bridge, /window\.__canvasHelperGoogleHosted/);
});

test("exportProjectToGoogleHosted writes the expected bundle and injects the bridge", async () => {
  const paths = await createProjectFixture({
    slug: TEST_PROJECT_SLUG,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <head>",
      "    <meta charset=\"utf-8\">",
      "    <title>Google Hosted Fixture</title>",
      "  </head>",
      "  <body>",
      "    <div id=\"app\"></div>",
      "    <script src=\"./main.js\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "main.js": [
        'const STORAGE_KEY = "test-google-hosted-export::workspace-state::v1";',
        'window.localStorage.setItem("test-google-hosted-export::workspace-state::v1", JSON.stringify({ reportSnapshot: { score: 2 } }));',
        'console.log("fixture");',
        ""
      ].join("\n")
    }
  });

  try {
    const result = await exportProjectToGoogleHosted(TEST_PROJECT_SLUG);
    const exportDir = result.exportDir;
    const exportedHtml = await readFile(path.join(exportDir, "index.html"), "utf8");
    const bridgeScript = await readFile(path.join(exportDir, "google-hosted-bridge.js"), "utf8");
    const firebaseConfig = await readJsonFile<Record<string, unknown>>(
      path.join(exportDir, "firebase-config.template.json")
    );
    const deployReadme = await readFile(path.join(exportDir, "README-deploy.md"), "utf8");

    assert.ok(await fileExists(path.join(exportDir, "index.html")));
    assert.ok(await fileExists(path.join(exportDir, "google-hosted-bridge.js")));
    assert.ok(await fileExists(path.join(exportDir, "firebase-config.template.json")));
    assert.ok(await fileExists(path.join(exportDir, "firebase.json")));
    assert.ok(await fileExists(path.join(exportDir, ".firebaserc.template")));
    assert.ok(await fileExists(path.join(exportDir, "README-deploy.md")));
    assert.match(
      exportedHtml,
      /<script src="\.\/google-hosted-bridge\.js"><\/script>\s*<script src="\.\/main\.js"><\/script>/
    );
    assert.match(bridgeScript, /Sign in with Google/);
    assert.match(bridgeScript, /test-google-hosted-export::workspace-state::v1/);
    assert.equal(firebaseConfig.projectSlug, TEST_PROJECT_SLUG);
    assert.match(deployReadme, /firebase deploy --only hosting/);
    assert.deepEqual(result.storageKeys, ["test-google-hosted-export::workspace-state::v1"]);
    assert.equal(await fileExists(path.join(paths.metaDir, "prompt-pack.md")), false);
  } finally {
    await cleanupProjectFixture(TEST_PROJECT_SLUG);
  }
});

test("package.json exposes the google-hosted export command", async () => {
  const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };

  assert.equal(packageJson.scripts?.["export:google-hosted"], "tsx scripts/export-google-hosted.ts");
});
