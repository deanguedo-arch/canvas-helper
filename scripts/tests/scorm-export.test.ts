import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import { detectStorageKeysFromWorkspace } from "../lib/exports/shared.js";
import * as scormPackage from "../lib/exports/scorm-package.js";
import {
  buildScormBridgeScript,
  buildScormManifest,
  findStorageKeysInScriptSources,
  injectScormBridgeTag,
  normalizeScormVersion
} from "../lib/scorm.js";

type ScormBridgeHandle = {
  save: () => boolean;
  saveAndExit: () => boolean;
  markCompleted: () => boolean;
};

function runScormBridgeHarness(options: {
  version: "2004" | "1.2";
  projectSlug: string;
  storageKey: string;
  localValue?: string;
  initialSuspendData?: string;
}) {
  class FakeStorage {
    private readonly values = new Map<string, string>();

    getItem(key: string) {
      return this.values.get(String(key)) ?? null;
    }

    setItem(key: string, value: string) {
      this.values.set(String(key), String(value));
    }

    removeItem(key: string) {
      this.values.delete(String(key));
    }

    clear() {
      this.values.clear();
    }
  }

  class FakeElement {
    readonly children: FakeElement[] = [];
    readonly attributes = new Map<string, string>();
    readonly style: Record<string, string> = {};
    textContent = "";
    type = "";

    setAttribute(name: string, value: string) {
      this.attributes.set(name, value);
    }

    appendChild(child: FakeElement) {
      this.children.push(child);
      return child;
    }

    addEventListener() {
      // Tests invoke the exposed bridge API directly.
    }

    querySelector(selector: string): FakeElement | null {
      const attribute = selector.match(/^\[([^\]]+)\]$/)?.[1];
      if (attribute && this.attributes.has(attribute)) {
        return this;
      }
      for (const child of this.children) {
        const match = child.querySelector(selector);
        if (match) {
          return match;
        }
      }
      return null;
    }
  }

  class FakeCustomEvent {
    constructor(readonly type: string) {}
  }

  const statusKey = options.version === "2004"
    ? "cmi.completion_status"
    : "cmi.core.lesson_status";
  const lmsValues = new Map<string, string>([
    ["cmi.suspend_data", options.initialSuspendData ?? ""],
    [statusKey, "incomplete"]
  ]);
  const writtenKeys: string[] = [];
  const setValue = (key: string, value: string) => {
    writtenKeys.push(key);
    lmsValues.set(key, value);
    return "true";
  };
  const api = options.version === "2004"
    ? {
        Initialize: () => "true",
        Terminate: () => "true",
        GetValue: (key: string) => lmsValues.get(key) ?? "",
        SetValue: setValue,
        Commit: () => "true"
      }
    : {
        LMSInitialize: () => "true",
        LMSFinish: () => "true",
        LMSGetValue: (key: string) => lmsValues.get(key) ?? "",
        LMSSetValue: setValue,
        LMSCommit: () => "true"
      };
  const body = new FakeElement();
  const localStorage = new FakeStorage();
  if (options.localValue !== undefined) {
    localStorage.setItem(options.storageKey, options.localValue);
  }
  const document = {
    body,
    readyState: "complete",
    visibilityState: "visible",
    createElement: () => new FakeElement(),
    addEventListener: () => undefined
  };
  const dispatchedEvents: string[] = [];
  const windowObject: Record<string, unknown> = {
    localStorage,
    setTimeout: () => 1,
    clearTimeout: () => undefined,
    addEventListener: () => undefined,
    dispatchEvent: (event: FakeCustomEvent) => {
      dispatchedEvents.push(event.type);
      return true;
    },
    CustomEvent: FakeCustomEvent,
    opener: null
  };
  windowObject.parent = windowObject;
  windowObject[options.version === "2004" ? "API_1484_11" : "API"] = api;

  vm.runInNewContext(
    buildScormBridgeScript({
      projectSlug: options.projectSlug,
      storageKeys: [options.storageKey],
      version: options.version
    }),
    {
      window: windowObject,
      document,
      Storage: FakeStorage,
      console,
      Date,
      JSON,
      Object,
      Set,
      String
    }
  );

  return {
    body,
    bridge: windowObject.__canvasHelperScorm as ScormBridgeHandle,
    dispatchedEvents,
    lmsValues,
    localStorage,
    statusKey,
    writtenKeys
  };
}

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

test("findStorageKeysInScriptSources extracts named storage key constants", () => {
  const source = `
    const FORENSICS_WORKSPACE_STATE_KEY = "forensics::workspace-state::v1";
    window.localStorage.setItem(FORENSICS_WORKSPACE_STATE_KEY, JSON.stringify(state));
  `;
  const keys = findStorageKeysInScriptSources([source], "fallback-key");

  assert.deepEqual(keys, ["forensics::workspace-state::v1"]);
});

test("findStorageKeysInScriptSources resolves course shell storage key templates", () => {
  const courseDataSource = `
    window.courseShellData = {
      "storageKey": "general-psychology-20-independent-studies-202633108::workspace-state::v1"
    };
  `;
  const mainSource = `
    const STORAGE_KEY = String(courseShellData.storageKey || "fallback::workspace-state::v1");
    const LEGACY_STORAGE_KEY = \`${"${courseShellData.storageKey}"}::assessment-layout::v5\`;
    localStorage.getItem(STORAGE_KEY);
    localStorage.getItem(LEGACY_STORAGE_KEY);
  `;
  const keys = findStorageKeysInScriptSources([courseDataSource, mainSource], "fallback-key");

  assert.deepEqual(keys.sort(), [
    "general-psychology-20-independent-studies-202633108::workspace-state::v1",
    "general-psychology-20-independent-studies-202633108::workspace-state::v1::assessment-layout::v5"
  ]);
});

test("findStorageKeysInScriptSources resolves project slug template keys used in localStorage", () => {
  const source = `
    const PROJECT_SLUG = document.body?.dataset.projectSlug || "worldreligions30-option1";
    const STORAGE_KEY = \`${"${PROJECT_SLUG}"}.progress\`;
    const UI_KEY = \`${"${PROJECT_SLUG}"}.ui\`;
    window.localStorage.getItem(STORAGE_KEY);
    window.localStorage.setItem(UI_KEY, JSON.stringify({ sidebarCollapsed: true }));
  `;
  const keys = findStorageKeysInScriptSources([source], "fallback-key");

  assert.deepEqual(keys.sort(), ["worldreligions30-option1.progress", "worldreligions30-option1.ui"]);
});

test("detectStorageKeysFromWorkspace reads inline assignment HTML storage keys", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-scorm-"));
  try {
    await writeFile(
      path.join(tempDir, "module4assignment.html"),
      `
        <!doctype html>
        <script>
          const MODULE4_ASSIGNMENT_STORAGE_KEY = "forensics::module4assignment::v1";
          window.localStorage.setItem(MODULE4_ASSIGNMENT_STORAGE_KEY, JSON.stringify({ complete: true }));
        </script>
      `,
      "utf8"
    );

    const keys = await detectStorageKeysFromWorkspace(tempDir, "fallback-key");
    assert.deepEqual(keys, ["forensics::module4assignment::v1"]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("resolveTrackedScormStorageKeys preserves explicit project metadata keys", () => {
  const resolver = (scormPackage as unknown as {
    resolveTrackedScormStorageKeys?: (
      detectedStorageKeys: string[],
      manifest: { googleHosted?: { trackedStorageKeys?: string[] } }
    ) => string[];
  }).resolveTrackedScormStorageKeys;

  assert.equal(typeof resolver, "function");
  const keys = resolver?.(
    ["forensicstudiesoption2.progress"],
    {
      googleHosted: {
        trackedStorageKeys: [
          "forensics::module4assignment::v1",
          "forensicstudiesoption2.progress",
          ""
        ]
      }
    }
  );

  assert.deepEqual(keys, ["forensicstudiesoption2.progress", "forensics::module4assignment::v1"]);
});

test("resolveScormPackageTitle prefers a human-readable project title", () => {
  assert.equal(
    scormPackage.resolveScormPackageTitle({
      slug: "how-assessment-works",
      title: "How Assessment Works"
    }),
    "How Assessment Works"
  );
  assert.equal(
    scormPackage.resolveScormPackageTitle({
      slug: "how-assessment-works",
      title: "  "
    }),
    "how-assessment-works"
  );
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

test("injectScormBridgeTag inserts bridge before inline course scripts", () => {
  const html = `
    <html>
      <head>
        <script>window.courseState = localStorage.getItem("course-state");</script>
      </head>
      <body></body>
    </html>
  `;

  const output = injectScormBridgeTag(html, "./scorm-bridge.js");
  assert.match(output, /<script src="\.\/scorm-bridge\.js"><\/script>\s*<script>window\.courseState/);
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
  assert.match(bridge2004, /DOMContentLoaded", installControls/);
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
  assert.match(bridge2004, /more saved work than Brightspace can accept/);
  assert.match(bridge2004, /last successful LMS save is still safe/);
  assert.match(bridge2004, /announceStatus\(lastPersistErrorMessage, true\)/);
  assert.match(bridge2004, /markCompleted/);
  assert.match(bridge2004, /completedValue: "completed"/);
  assert.match(bridge2004, /canvas-helper:scorm-ready/);

  const bridge12 = buildScormBridgeScript({
    projectSlug: "calm3new",
    storageKeys: ["calm3new::workspace-state::v1"],
    version: "1.2"
  });
  assert.match(bridge12, /cmi\.core\.lesson_status/);
  assert.match(bridge12, /completedValue: "completed"/);
  assert.match(bridge12, /canvas-helper:scorm-ready/);
});

test("SCORM 2004 markCompleted writes completion and suspend data without score or success status", () => {
  const storageKey = "canvas-helper:how-assessment-works:state:v1";
  const harness = runScormBridgeHarness({
    version: "2004",
    projectSlug: "how-assessment-works",
    storageKey,
    localValue: JSON.stringify({ final: "Ready" })
  });

  assert.deepEqual(harness.dispatchedEvents, ["canvas-helper:scorm-ready"]);
  assert.equal(harness.bridge.markCompleted(), true);
  assert.equal(harness.bridge.markCompleted(), true);
  assert.equal(harness.lmsValues.get("cmi.completion_status"), "completed");
  assert.match(harness.lmsValues.get("cmi.suspend_data") ?? "", /how-assessment-works/);
  assert.match(harness.lmsValues.get("cmi.suspend_data") ?? "", /"reason":"completion"/);
  assert.equal(
    harness.writtenKeys.filter((key) => key === "cmi.completion_status").length,
    1
  );
  assert.equal(
    harness.writtenKeys.some((key) => key.startsWith("cmi.score.") || key === "cmi.success_status"),
    false
  );
});

test("SCORM 1.2 markCompleted preserves lesson-status completion and ready signaling", () => {
  const storageKey = "canvas-helper:how-assessment-works:state:v1";
  const harness = runScormBridgeHarness({
    version: "1.2",
    projectSlug: "how-assessment-works",
    storageKey,
    localValue: JSON.stringify({ final: "Ready" })
  });

  assert.deepEqual(harness.dispatchedEvents, ["canvas-helper:scorm-ready"]);
  assert.equal(harness.bridge.markCompleted(), true);
  assert.equal(harness.lmsValues.get("cmi.core.lesson_status"), "completed");
  assert.match(harness.lmsValues.get("cmi.suspend_data") ?? "", /how-assessment-works/);
  assert.equal(
    harness.writtenKeys.some((key) => key.startsWith("cmi.core.score.")),
    false
  );
});

test("buildScormBridgeScript dynamically tracks localStorage keys created during a session", () => {
  const bridge2004 = buildScormBridgeScript({
    projectSlug: "experimental-psych-30",
    storageKeys: ["experimental-psych-30::workspace-state::v1"],
    version: "2004"
  });

  assert.match(bridge2004, /trackedKeySet\.add\(String\(key\)\)/);
  assert.match(bridge2004, /Object\.entries\(state\.values\)/);
});

test("buildScormBridgeScript flushes localStorage writes from assignment iframes", () => {
  const bridge2004 = buildScormBridgeScript({
    projectSlug: "forensicstudiesoption2",
    storageKeys: ["forensics::module4assignment::v1"],
    version: "2004"
  });

  assert.match(bridge2004, /window\.addEventListener\("storage"/);
  assert.match(bridge2004, /event\.storageArea === window\.localStorage/);
  assert.match(bridge2004, /trackedKeySet\.add\(String\(event\.key\)\)/);
  assert.match(bridge2004, /scheduleFlush\("storage:" \+ String\(event\.key\)\)/);
});

test("SCORM 2004 reports an oversized save and preserves the last valid suspend_data", () => {
  const storageKey = "ela30-1-shakespeare-othello:manual-evidence-notes";
  const lastValidSuspendData = JSON.stringify({
    version: 1,
    projectSlug: "ela30-1-shakespeare-othello",
    values: { [storageKey]: "[]" }
  });
  const harness = runScormBridgeHarness({
    version: "2004",
    projectSlug: "ela30-1-shakespeare-othello",
    storageKey,
    initialSuspendData: lastValidSuspendData
  });

  harness.localStorage.setItem(storageKey, JSON.stringify([{ detail: "x".repeat(61_000) }]));
  assert.equal(harness.bridge.save(), false);
  assert.equal(harness.lmsValues.get("cmi.suspend_data"), lastValidSuspendData);

  const status = harness.body.querySelector("[data-scorm-status]");
  assert.match(status?.textContent ?? "", /more saved work than Brightspace can accept/);
  assert.equal(status?.style.color, "#b91c1c");
});
