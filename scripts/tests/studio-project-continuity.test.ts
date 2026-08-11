import assert from "node:assert/strict";
import test from "node:test";

import {
  loadProjectLibrary,
  normalizeProjectLibrary,
  saveProjectLibrary,
  toggleFavoriteProject,
  touchRecentProject
} from "../../app/studio/src/lib/project-library.js";
import {
  clearStoredReviewSet,
  createReviewSetBackup,
  deleteStoredReviewSet,
  listStoredReviewSets,
  loadStoredReviewSet,
  parseReviewSetBackup,
  saveStoredReviewSet
} from "../../app/studio/src/lib/review-set-storage.js";
import { createReviewSetItem } from "../../app/studio/src/lib/review-set.js";
import type { InspectionResolution } from "../../app/shared/inspection.js";
import {
  loadWorkspacePageSelections,
  saveWorkspacePageSelection
} from "../../app/studio/src/lib/storage.js";

function withLocalStorage(run: (values: Map<string, string>) => void) {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem(key: string) { return values.get(key) ?? null; },
        setItem(key: string, value: string) { values.set(key, value); },
        removeItem(key: string) { values.delete(key); }
      }
    }
  });
  try {
    run(values);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

test("project library keeps bounded favorites and newest unique recents", () => {
  const initial = normalizeProjectLibrary({
    favorites: ["alpha", "alpha", "../unsafe"],
    recents: [
      { slug: "alpha", openedAt: 10 },
      { slug: "alpha", openedAt: 8 },
      { slug: "beta", openedAt: 9 }
    ]
  });
  assert.deepEqual(initial.favorites, ["alpha"]);
  assert.deepEqual(initial.recents.map((recent) => recent.slug), ["alpha", "beta"]);

  const touched = touchRecentProject(initial, "beta", 11);
  assert.deepEqual(touched.recents.map((recent) => recent.slug), ["beta", "alpha"]);
  assert.deepEqual(toggleFavoriteProject(touched, "beta").favorites, ["beta", "alpha"]);
});

test("project library, last page, and separate empty Review Sets persist safely", () => {
  withLocalStorage(() => {
    const library = toggleFavoriteProject(touchRecentProject(loadProjectLibrary(), "alpha", 10), "alpha");
    assert.equal(saveProjectLibrary(library), true);
    assert.deepEqual(loadProjectLibrary().favorites, ["alpha"]);

    assert.equal(saveWorkspacePageSelection("alpha", "lessons/one.html"), true);
    assert.equal(saveWorkspacePageSelection("beta", "alternate.html"), true);
    assert.deepEqual(loadWorkspacePageSelections(), {
      beta: "alternate.html",
      alpha: "lessons/one.html"
    });
    assert.equal(saveWorkspacePageSelection("alpha", "../unsafe.html"), false);

    const alphaSession = "11111111-1111-4111-8111-111111111111";
    const betaSession = "22222222-2222-4222-8222-222222222222";
    assert.equal(saveStoredReviewSet("alpha", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "Review 1", alphaSession, []), true);
    assert.equal(saveStoredReviewSet("beta", "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "Review 1", betaSession, []), true);
    assert.equal(loadStoredReviewSet("alpha")?.sessionId, alphaSession);
    assert.equal(loadStoredReviewSet("beta")?.sessionId, betaSession);
    assert.equal(clearStoredReviewSet("alpha"), true);
    assert.equal(loadStoredReviewSet("alpha"), null);
    assert.equal(loadStoredReviewSet("beta")?.sessionId, betaSession);
  });
});

test("review workbench keeps named queued sessions and validates local JSON backups", () => {
  withLocalStorage(() => {
    const screenshotSessionId = "33333333-3333-4333-8333-333333333333";
    const firstSetId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const secondSetId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
    const resolution: InspectionResolution = {
      projectSlug: "alpha",
      previewPath: "projects/alpha/workspace/index.html",
      selection: {
        nodeId: "ch1:1234567890abcdef12345678:1",
        visibleText: "Selected heading",
        tagName: "h1",
        role: "",
        testId: "",
        geometry: { x: 0, y: 0, width: 100, height: 40 },
        viewport: { width: 1280, height: 720 },
        scroll: { windowTop: 0, windowLeft: 0, containers: [] },
        pageHref: "http://127.0.0.1:61234/_canvas-helper/p/12345678-1234-1234-1234-123456789abc/preview/workspace/alpha/index.html"
      },
      resolution: "exact",
      freshness: "current",
      artifactRole: "canonical-editable-source",
      generated: false,
      primaryEditTarget: "projects/alpha/workspace/index.html",
      primaryEditLine: 1,
      contributors: [],
      rebuildCommand: null,
      validationCommand: "npm run course:doctor -- --project alpha",
      warnings: []
    };
    const item = createReviewSetItem({
      id: "review-alpha-0001",
      previewMode: "workspace",
      request: { projectSlug: "alpha", root: "workspace", htmlPath: "index.html", selection: resolution.selection },
      resolution,
      issueCategory: "content",
      shortLabel: "Opening heading",
      priority: "high",
      teacherNote: "Make this heading more direct."
    });

    assert.equal(saveStoredReviewSet("alpha", firstSetId, "First pass", screenshotSessionId, [item]), true);
    assert.equal(saveStoredReviewSet("alpha", secondSetId, "Later pass", screenshotSessionId, [], false), true);
    assert.equal(listStoredReviewSets("alpha").length, 2);
    assert.equal(loadStoredReviewSet("alpha")?.reviewSessionId, firstSetId);
    assert.equal(loadStoredReviewSet("alpha", secondSetId, false)?.name, "Later pass");
    assert.equal(loadStoredReviewSet("alpha")?.reviewSessionId, firstSetId);

    const backup = createReviewSetBackup({
      projectSlug: "alpha",
      reviewSessionId: firstSetId,
      name: "First pass",
      screenshotSessionId,
      items: [item]
    });
    const restored = parseReviewSetBackup(backup, "alpha", screenshotSessionId);
    assert.equal(restored.name, "First pass");
    assert.equal(restored.items[0]?.shortLabel, "Opening heading");
    assert.equal(restored.items[0]?.priority, "high");
    assert.throws(() => parseReviewSetBackup(backup, "beta", screenshotSessionId), /does not belong/i);

    assert.equal(deleteStoredReviewSet("alpha", secondSetId), true);
    assert.equal(listStoredReviewSets("alpha").length, 1);
  });
});
