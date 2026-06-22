import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { exportProjectToGoogleHosted } from "../lib/exporter.js";
import {
  buildGoogleHostedBridgeScript,
  decideGoogleHostedNoRemoteAction,
  injectGoogleHostedBridgeTag
} from "../lib/google-hosted.js";
import { fileExists, readJsonFile, removePath, writeJsonFile, writeTextFile } from "../lib/fs.js";
import { getResourcePaths, repoRoot } from "../lib/paths.js";
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
    progressItems: [{ id: "lesson-1", title: "Lesson 1", type: "lesson", required: true }],
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
  assert.match(bridge, /preview\/references\/raw/);
  assert.match(bridge, /progressSummary/);
  assert.match(bridge, /"progressItems":\[\{"id":"lesson-1"/);
});

test("buildGoogleHostedBridgeScript embeds save controls into course sidebars when available", () => {
  const bridge = buildGoogleHostedBridgeScript({
    projectSlug: "general-psychology-20-independent-studies-202633108",
    storageKeys: ["general-psychology-20-independent-studies-202633108::workspace-state::v1"]
  });

  assert.match(bridge, /findGoogleHostedControlsHost/);
  assert.match(bridge, /canvas-helper-google-hosted-controls--embedded/);
  assert.match(bridge, /sidebarRootSelectors/);
  assert.match(bridge, /\.forensic-sidebar/);
  assert.match(bridge, /\.shell-sidebar/);
  assert.match(bridge, /\.sidebar/);
  assert.match(bridge, /#sidebar/);
  assert.match(bridge, /:has\(> \.canvas-helper-google-hosted-controls--embedded\)/);
  assert.match(bridge, /position:sticky;bottom:16px;margin-top:auto/);
  assert.match(bridge, /body\.sidebar-collapsed \.canvas-helper-google-hosted-controls--embedded/);
  assert.match(bridge, /\.app\.sidebar-hidden \.canvas-helper-google-hosted-controls--embedded/);
  assert.match(bridge, /\.forensic-layout\.menu-collapsed \.canvas-helper-google-hosted-controls--embedded/);
  assert.match(bridge, /\.forensics35-shell\.sidebar-compact \.canvas-helper-google-hosted-controls--embedded/);
  assert.match(bridge, /\.menu-collapsed \.canvas-helper-google-hosted-controls--embedded/);
  assert.match(bridge, /\[data-collapsed='true'\] \.canvas-helper-google-hosted-controls--embedded/);
  assert.match(
    bridge,
    /aside\[data-testid='chapter-menu-panel'\]:has\(\[data-testid\*='mobile-menu-toggle'\]\[aria-expanded='false'\]\)>\.canvas-helper-google-hosted-controls--embedded/
  );
  assert.match(
    bridge,
    /aside\[data-sidebar-responsive-mode='option2-sticky'\]:has\(\[data-testid\*='mobile-menu-toggle'\]\[aria-expanded='false'\]\)>\.canvas-helper-google-hosted-controls--embedded/
  );
  assert.doesNotMatch(bridge, /\.canvas-helper-google-hosted-controls--embedded\[data-authenticated='false'\]\{display:none!important\}/);
  assert.match(bridge, /body:not\(\.mobile-nav-open\) \.sidebar \.canvas-helper-google-hosted-controls--embedded/);
  assert.match(bridge, /\.forensic-layout:not\(\.mobile-menu-open\) \.forensic-sidebar \.canvas-helper-google-hosted-controls--embedded/);
  assert.match(bridge, /setAttribute\("data-authenticated", "false"\)/);
  assert.match(bridge, /display:none!important/);
  assert.match(bridge, /margin-top:auto/);
  assert.match(bridge, /MutationObserver/);
  assert.match(bridge, /data-placement", "sidebar"/);
  assert.match(bridge, /data-placement", "fixed"/);
  assert.doesNotMatch(bridge, /parseColorChannels/);
  assert.doesNotMatch(bridge, /findSidebarAccentColor/);
  assert.doesNotMatch(bridge, /applySidebarThemeStyles/);
  assert.doesNotMatch(bridge, /--gh-controls-bg/);
  assert.doesNotMatch(bridge, /--gh-button-bg/);
});

test("buildGoogleHostedBridgeScript includes reload-loop guard for restore flows", () => {
  const bridge = buildGoogleHostedBridgeScript({
    projectSlug: "calm-module",
    storageKeys: ["calm_workbook_data"]
  });

  assert.match(bridge, /sessionStorage/);
  assert.match(bridge, /reload-loop guard/);
  assert.match(bridge, /skipReloadIfRepeated/);
});

test("buildGoogleHostedBridgeScript upgrades old saved documents with progress summaries", () => {
  const bridge = buildGoogleHostedBridgeScript({
    progressItems: [{ id: "lesson-1", title: "Lesson 1", type: "lesson", required: true }],
    projectSlug: "calm-module",
    storageKeys: ["calm_workbook_data"]
  });

  assert.match(bridge, /shouldUpgradeProgressSummary/);
  assert.match(bridge, /progress-upgrade/);
  assert.match(bridge, /remoteData\.progressSummary/);
});

test("decideGoogleHostedNoRemoteAction clears local state when it belongs to a different user", () => {
  assert.equal(
    decideGoogleHostedNoRemoteAction({
      hasLocalState: true,
      localMetaUid: "user-a",
      userUid: "user-b"
    }),
    "clear-local"
  );
  assert.equal(
    decideGoogleHostedNoRemoteAction({
      hasLocalState: true,
      localMetaUid: "user-a",
      userUid: "user-a"
    }),
    "persist-local"
  );
  assert.equal(
    decideGoogleHostedNoRemoteAction({
      hasLocalState: false,
      localMetaUid: "user-a",
      userUid: "user-b"
    }),
    "ready"
  );
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
      "course-shell-data.js": [
        "export default {",
        '  "modules": [',
        "    {",
        '      "id": "module-1",',
        '      "title": "Module 1",',
        '      "activities": [',
        '        { "id": "overview", "kind": "overview", "title": "Module 1" },',
        '        { "id": "lesson-1", "kind": "lesson", "title": "Lesson 1" }',
        "      ]",
        "    }",
        "  ]",
        "};",
        ""
      ].join("\n"),
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
    assert.match(bridgeScript, /"progressItems":\[\{"id":"lesson-1"/);
    assert.equal(firebaseConfig.projectSlug, TEST_PROJECT_SLUG);
    assert.match(deployReadme, /firebase deploy --only hosting/);
    assert.deepEqual(result.storageKeys, ["test-google-hosted-export::workspace-state::v1"]);
    assert.equal(await fileExists(path.join(paths.metaDir, "prompt-pack.md")), false);
  } finally {
    await cleanupProjectFixture(TEST_PROJECT_SLUG);
  }
});

test("exportProjectToGoogleHosted detects localStorage keys from jsx workspaces", async () => {
  const jsxProjectSlug = `${TEST_PROJECT_SLUG}-jsx`;
  await createProjectFixture({
    slug: jsxProjectSlug,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <head>",
      "    <meta charset=\"utf-8\">",
      "    <title>Google Hosted JSX Fixture</title>",
      "  </head>",
      "  <body>",
      "    <div id=\"app\"></div>",
      "    <script src=\"./main.jsx\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "main.jsx": [
        "function boot() {",
        "  const saved = localStorage.getItem('calm_workbook_data');",
        "  localStorage.setItem('calm_workbook_data', saved || JSON.stringify({ answer: 1 }));",
        "}",
        "boot();",
        ""
      ].join("\n")
    }
  });

  try {
    const result = await exportProjectToGoogleHosted(jsxProjectSlug);

    assert.deepEqual(result.storageKeys, [`${jsxProjectSlug}::workspace-state::v1`, "calm_workbook_data"]);
  } finally {
    await cleanupProjectFixture(jsxProjectSlug);
  }
});

test("exportProjectToGoogleHosted transpiles main.jsx to browser-safe main.js when needed", async () => {
  const jsxTranspileSlug = `${TEST_PROJECT_SLUG}-jsx-transpile`;
  await createProjectFixture({
    slug: jsxTranspileSlug,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <head>",
      "    <meta charset=\"utf-8\">",
      "    <title>Google Hosted JSX Transpile Fixture</title>",
      "  </head>",
      "  <body>",
      "    <div id=\"app\"></div>",
      "    <script src=\"https://unpkg.com/@babel/standalone/babel.min.js\"></script>",
      "    <script type=\"text/babel\" data-type=\"module\" src=\"./main.jsx?rev=fixture\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "main.jsx": [
        'import React from "react";',
        'import ReactDOM from "react-dom/client";',
        "",
        "const App = () => <div>fixture</div>;",
        "const root = document.getElementById(\"app\");",
        "if (root) {",
        "  ReactDOM.createRoot(root).render(<App />);",
        "}",
        ""
      ].join("\n")
    }
  });

  try {
    const result = await exportProjectToGoogleHosted(jsxTranspileSlug);
    const exportedIndexHtml = await readFile(path.join(result.exportDir, "index.html"), "utf8");
    const transpiledMainJsPath = path.join(result.exportDir, "main.js");
    const transpiledMainJs = await readFile(transpiledMainJsPath, "utf8");

    assert.equal(await fileExists(transpiledMainJsPath), true);
    assert.match(exportedIndexHtml, /<script src="\.\/google-hosted-bridge\.js"><\/script>\s*<script type="module" src="\.\/main\.js\?rev=fixture"><\/script>/);
    assert.doesNotMatch(exportedIndexHtml, /@babel\/standalone|text\/babel|main\.jsx|data-type="module"/);
    assert.match(transpiledMainJs, /https:\/\/esm\.sh\/react@19\.1\.1\/jsx-runtime/);
    assert.doesNotMatch(transpiledMainJs, /from "react\/jsx-runtime"/);
    assert.doesNotMatch(transpiledMainJs, /from "react-dom\/client"/);
    assert.doesNotMatch(transpiledMainJs, /from "react";/);
  } finally {
    await cleanupProjectFixture(jsxTranspileSlug);
  }
});

test("exportProjectToGoogleHosted preserves firebase deploy config across re-export", async () => {
  const preserveProjectSlug = `${TEST_PROJECT_SLUG}-preserve-config`;
  await createProjectFixture({
    slug: preserveProjectSlug,
    workspaceFiles: {
      "main.js": [
        'localStorage.setItem("calm_workbook_data", JSON.stringify({ answer: 1 }));',
        ""
      ].join("\n")
    }
  });

  try {
    const firstExport = await exportProjectToGoogleHosted(preserveProjectSlug);
    const customFirebaseConfig = [
      "{",
      '  "apiKey": "custom-key",',
      '  "appId": "custom-app",',
      '  "authDomain": "custom.firebaseapp.com",',
      '  "messagingSenderId": "custom-sender",',
      '  "projectId": "custom-project",',
      '  "storageBucket": "custom.firebasestorage.app",',
      '  "allowedEmailDomains": ["example.org"],',
      `  "projectSlug": "${preserveProjectSlug}"`,
      "}",
      ""
    ].join("\n");
    const customFirebaseRc = ['{', '  "projects": {', '    "default": "custom-project"', "  }", "}", ""].join("\n");

    await writeTextFile(path.join(firstExport.exportDir, "firebase-config.json"), customFirebaseConfig);
    await writeTextFile(path.join(firstExport.exportDir, ".firebaserc"), customFirebaseRc);

    const secondExport = await exportProjectToGoogleHosted(preserveProjectSlug);
    const preservedFirebaseConfig = await readFile(path.join(secondExport.exportDir, "firebase-config.json"), "utf8");
    const preservedFirebaseRc = await readFile(path.join(secondExport.exportDir, ".firebaserc"), "utf8");

    assert.equal(preservedFirebaseConfig, customFirebaseConfig);
    assert.equal(preservedFirebaseRc, customFirebaseRc);
  } finally {
    await cleanupProjectFixture(preserveProjectSlug);
  }
});

test("exportProjectToGoogleHosted prefers explicit tracked storage keys from project metadata", async () => {
  const explicitKeysSlug = `${TEST_PROJECT_SLUG}-explicit-keys`;
  const paths = await createProjectFixture({
    slug: explicitKeysSlug,
    workspaceFiles: {
      "main.js": [
        'const STORAGE_KEY = `${PROJECT_SLUG}.progress`;',
        'localStorage.setItem("partial-key", JSON.stringify({ answer: 1 }));',
        ""
      ].join("\n")
    }
  });

  try {
    const manifest = await readJsonFile<Record<string, unknown>>(paths.manifestPath);
    await writeJsonFile(paths.manifestPath, {
      ...manifest,
      googleHosted: {
        trackedStorageKeys: [
          `${explicitKeysSlug}.progress`,
          `${explicitKeysSlug}.ui`,
          "forensics::module1assignment::v1",
          "forensics::module2assignment::v1"
        ]
      }
    });

    const result = await exportProjectToGoogleHosted(explicitKeysSlug);
    const bridgeScript = await readFile(path.join(result.exportDir, "google-hosted-bridge.js"), "utf8");
    const readme = await readFile(path.join(result.exportDir, "README-deploy.md"), "utf8");

    assert.match(bridgeScript, /"storageKeys":\["test-google-hosted-export-explicit-keys\.progress","test-google-hosted-export-explicit-keys\.ui","forensics::module1assignment::v1","forensics::module2assignment::v1"\]/);
    assert.match(readme, /Tracked localStorage keys: .*test-google-hosted-export-explicit-keys\.progress/i);
    assert.match(readme, /Tracked localStorage keys: .*forensics::module2assignment::v1/i);
    assert.deepEqual(result.storageKeys, [
      `${explicitKeysSlug}.progress`,
      `${explicitKeysSlug}.ui`,
      "forensics::module1assignment::v1",
      "forensics::module2assignment::v1"
    ]);
  } finally {
    await cleanupProjectFixture(explicitKeysSlug);
  }
});

test("exportProjectToGoogleHosted can build a local-only hosted bridge without Google sign-in", async () => {
  const localOnlySlug = `${TEST_PROJECT_SLUG}-local-only`;
  const paths = await createProjectFixture({
    slug: localOnlySlug,
    workspaceFiles: {
      "main.js": [
        `localStorage.setItem("${localOnlySlug}::workspace-state::v1", JSON.stringify({ answer: 1 }));`,
        ""
      ].join("\n")
    }
  });

  try {
    const manifest = await readJsonFile<Record<string, unknown>>(paths.manifestPath);
    await writeJsonFile(paths.manifestPath, {
      ...manifest,
      googleHosted: {
        authMode: "none",
        trackedStorageKeys: [`${localOnlySlug}::workspace-state::v1`]
      }
    });

    const result = await exportProjectToGoogleHosted(localOnlySlug);
    const bridgeScript = await readFile(path.join(result.exportDir, "google-hosted-bridge.js"), "utf8");
    const readme = await readFile(path.join(result.exportDir, "README-deploy.md"), "utf8");

    assert.match(bridgeScript, /"authMode":"none"/);
    assert.match(bridgeScript, /preview\/references\/raw/);
    assert.doesNotMatch(bridgeScript, /Sign in with Google/);
    assert.doesNotMatch(bridgeScript, /firebase-auth-compat/);
    assert.doesNotMatch(bridgeScript, /signInWithPopup/);
    assert.doesNotMatch(bridgeScript, /collection\("users"\)\.doc/);
    assert.match(readme, /Google sign-in is disabled for this bundle/);
  } finally {
    await cleanupProjectFixture(localOnlySlug);
  }
});

test("exportProjectToGoogleHosted copies D2L export root reference files for hosted runtime", async () => {
  const slug = `${TEST_PROJECT_SLUG}-references`;
  const exportRoot = "D2LCCExport_Test";
  const resourcePaths = getResourcePaths(slug);
  const sourceReferenceFile = path.join(resourcePaths.root, exportRoot, "content", "sample.html");

  await createProjectFixture({
    slug,
    workspaceFiles: {
      "main.js": [
        'localStorage.setItem("calm_workbook_data", JSON.stringify({ answer: 1 }));',
        ""
      ].join("\n"),
      "d2l-map-data.js": [
        "const d2lCourseMapData = {",
        `  \"exportRoot\": \"${exportRoot}\"`,
        "};",
        "",
        "export default d2lCourseMapData;",
        ""
      ].join("\n")
    }
  });

  await writeTextFile(sourceReferenceFile, "<html><body>sample reference</body></html>\n");

  try {
    const result = await exportProjectToGoogleHosted(slug);
    const copiedReferenceFile = path.join(result.exportDir, exportRoot, "content", "sample.html");
    assert.equal(await fileExists(copiedReferenceFile), true);
  } finally {
    await cleanupProjectFixture(slug);
    await removePath(resourcePaths.root);
  }
});

test("exportProjectToGoogleHosted fails when authoring deviation gate blocks export", async () => {
  const blockedSlug = `${TEST_PROJECT_SLUG}-blocked`;
  const paths = await createProjectFixture({
    slug: blockedSlug,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <head><meta charset=\"utf-8\"></head>",
      "  <body>",
      "    <div class=\"source-support-panel\">Visible source dump</div>",
      "    <script src=\"./main.js\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "main.js": "console.log('fixture');\n"
    }
  });

  await writeJsonFile(path.join(paths.metaDir, "authoring-preferences.json"), {
    schemaVersion: 1,
    flow: {
      sourceSupportMode: "hidden-by-default"
    },
    rules: {
      forbid: [
        {
          id: "forbid-visible-source-panel",
          description: "Do not show source support panel by default.",
          pattern: "source-support-panel"
        }
      ]
    },
    learning: {
      defaultScope: "project"
    }
  });

  try {
    await assert.rejects(
      () => exportProjectToGoogleHosted(blockedSlug),
      /Authoring preference deviations blocked export/
    );
    assert.equal(await fileExists(path.join(paths.metaDir, "deviation-report.json")), true);
  } finally {
    await cleanupProjectFixture(blockedSlug);
  }
});

test("exportProjectToGoogleHosted accepts deviations and updates repo preferences", async () => {
  const acceptedSlug = `${TEST_PROJECT_SLUG}-accepted`;
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-export-gate-"));
  const repoPreferencesPath = path.join(tempDir, "authoring-preferences.json");

  await writeJsonFile(repoPreferencesPath, {
    schemaVersion: 1,
    flow: {
      sourceSupportMode: "hidden-by-default"
    },
    rules: {
      forbid: [
        {
          id: "forbid-visible-source-panel",
          description: "Do not show source support panel by default.",
          pattern: "source-support-panel"
        }
      ]
    },
    learning: {
      defaultScope: "repo"
    }
  });

  await createProjectFixture({
    slug: acceptedSlug,
    workspaceHtml: [
      "<!doctype html>",
      "<html>",
      "  <head><meta charset=\"utf-8\"></head>",
      "  <body>",
      "    <div class=\"source-support-panel\">Visible source dump</div>",
      "    <script src=\"./main.js\"></script>",
      "  </body>",
      "</html>",
      ""
    ].join("\n"),
    workspaceFiles: {
      "main.js": "console.log('fixture');\n"
    }
  });

  try {
    const result = await exportProjectToGoogleHosted(acceptedSlug, {
      repoAuthoringPreferencesPath: repoPreferencesPath,
      authoringAcceptance: {
        acceptDeviations: ["forbid-visible-source-panel"],
        because: "Intentional for this rollout.",
        updatePreferences: true,
        preferenceScope: "repo"
      }
    });
    assert.ok(result.fileCount > 0);

    const updatedRepoPreferences = await readJsonFile<{
      rules?: { accepted?: Array<{ ruleId: string; reason: string }> };
    }>(repoPreferencesPath);
    assert.equal(
      updatedRepoPreferences.rules?.accepted?.some(
        (entry) => entry.ruleId === "forbid-visible-source-panel" && /Intentional/.test(entry.reason)
      ),
      true
    );
  } finally {
    await cleanupProjectFixture(acceptedSlug);
    await removePath(tempDir);
  }
});

test("package.json exposes the google-hosted export command", async () => {
  const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };

  assert.equal(packageJson.scripts?.["export:google-hosted"], "tsx scripts/export-google-hosted.ts");
});
