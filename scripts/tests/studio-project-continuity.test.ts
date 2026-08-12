import assert from "node:assert/strict";
import test from "node:test";

import {
  loadProjectLibrary,
  normalizeProjectLibrary,
  saveProjectLibrary,
  toggleFavoriteProject,
  touchRecentProject
} from "../../app/studio/src/lib/project-library.js";
import { formatProjectSlugLabel, getProjectLabel } from "../../app/studio/src/lib/project-display.js";
import type { ProjectBundle } from "../../app/studio/src/lib/types.js";
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
import { workspacePreviewPathMatchesProject } from "../../e2e/lib/project-open.ts";
import { STUDIO_FIXTURES } from "../../e2e/lib/studio-fixtures.ts";

test("Studio fixture descriptors are neutral, distinct, and exact-path matched", () => {
  assert.notEqual(STUDIO_FIXTURES.primary.slug, STUDIO_FIXTURES.secondary.slug);
  assert.ok(STUDIO_FIXTURES.primary.heading);
  assert.ok(STUDIO_FIXTURES.secondary.heading);
  assert.equal(
    workspacePreviewPathMatchesProject(
      `/_canvas-helper/p/1234567890123456/preview/workspace/${STUDIO_FIXTURES.secondary.slug}/index.html`,
      STUDIO_FIXTURES.secondary.slug
    ),
    true
  );
  assert.equal(
    workspacePreviewPathMatchesProject(
      `/_canvas-helper/p/1234567890123456/preview/workspace/${STUDIO_FIXTURES.secondary.slug}-copy/index.html`,
      STUDIO_FIXTURES.secondary.slug
    ),
    false
  );
  assert.equal(
    workspacePreviewPathMatchesProject(
      `/_canvas-helper/p/1234567890123456/preview/workspace/e2e%2Dstudio%2Dsecondary/index.html`,
      STUDIO_FIXTURES.secondary.slug
    ),
    true
  );
  assert.equal(
    workspacePreviewPathMatchesProject(
      `/_canvas-helper/p/1234567890123456/preview/workspace/e2e%2Fstudio-secondary/index.html`,
      STUDIO_FIXTURES.secondary.slug
    ),
    false
  );
  assert.equal(workspacePreviewPathMatchesProject("/preview/workspace/%ZZ/index.html", "%ZZ"), false);
});

test("Studio turns repository slugs into readable course names without replacing curated titles", () => {
  assert.equal(formatProjectSlugLabel("social10-1-related-issue-1-option-2"), "Social 10-1 Related Issue 1 Option 2");
  assert.equal(formatProjectSlugLabel("ela20-1-modern-play"), "ELA 20-1 Modern Play");
  assert.equal(formatProjectSlugLabel("forensics35"), "Forensics 35");
  assert.equal(formatProjectSlugLabel("calm3new"), "CALM 3 New");

  const slugTitleProject = {
    manifest: {
      slug: "social10-1-related-issue-1-option-2",
      title: "Social10 1 Related Issue 1 Option 2"
    }
  } as ProjectBundle;
  const curatedTitleProject = {
    manifest: {
      slug: "social10-1-related-issue-1-option-2",
      title: "Social 10-1: Globalization and Identity"
    }
  } as ProjectBundle;

  assert.equal(getProjectLabel(slugTitleProject), "Social 10-1 Related Issue 1 Option 2");
  assert.equal(getProjectLabel(curatedTitleProject), "Social 10-1: Globalization and Identity");
});

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

test("review workbench preserves recovery state and immutable screenshot ownership through v8 migration", () => {
  withLocalStorage((values) => {
    const screenshotSessionId = "44444444-4444-4444-8444-444444444444";
    const reviewSessionId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
    const resolution: InspectionResolution = {
      projectSlug: "alpha",
      previewPath: "projects/alpha/workspace/index.html",
      selection: {
        nodeId: "ch1:1234567890abcdef12345678:2",
        selectionKind: "area",
        visibleText: "Replacement heading",
        tagName: "h2",
        role: "",
        testId: "",
        geometry: { x: 10, y: 20, width: 200, height: 60 },
        viewport: { width: 1280, height: 720 },
        scroll: { windowTop: 120, windowLeft: 0, containers: [] },
        pageHref: "http://127.0.0.1:61234/_canvas-helper/p/12345678-1234-1234-1234-123456789abc/preview/workspace/alpha/index.html"
      },
      resolution: "exact",
      freshness: "current",
      artifactRole: "canonical-editable-source",
      generated: false,
      primaryEditTarget: "projects/alpha/workspace/index.html",
      primaryEditLine: 2,
      contributors: [],
      rebuildCommand: null,
      validationCommand: "npm run course:doctor -- --project alpha",
      warnings: []
    };
    const item = createReviewSetItem({
      id: "review-alpha-relinked",
      previewMode: "workspace",
      request: { projectSlug: "alpha", root: "workspace", htmlPath: "index.html", selection: resolution.selection },
      resolution,
      issueCategory: "layout",
      anchorState: "changed",
      resolved: true,
      teacherNote: "Keep the original evidence after relinking.",
      screenshots: [{
        id: "shot-before-relink",
        imageUrl: "blob:shot-before-relink",
        filePath: `.runtime/studio-review-sets/${screenshotSessionId}/shot-before-relink.png`,
        byteLength: 1_024,
        width: 640,
        height: 480,
        ownerNodeId: "ch1:1234567890abcdef12345678:1",
        cropped: true
      }]
    });

    assert.equal(saveStoredReviewSet("alpha", reviewSessionId, "Recovery check", screenshotSessionId, [item]), true);
    const current = loadStoredReviewSet("alpha");
    assert.equal(current?.items[0]?.anchorState, "changed");
    assert.equal(current?.items[0]?.resolved, true);
    assert.equal(current?.items[0]?.request.selection.selectionKind, "area");
    assert.equal(current?.items[0]?.screenshots[0]?.ownerNodeId, "ch1:1234567890abcdef12345678:1");
    assert.equal(current?.items[0]?.screenshots[0]?.cropped, true);

    const serialized = values.get("canvas-helper/review-workbench-v9");
    assert.ok(serialized);
    const legacy = JSON.parse(serialized as string) as { version: number };
    legacy.version = 8;
    values.delete("canvas-helper/review-workbench-v9");
    values.set("canvas-helper/review-workbench-v8", JSON.stringify(legacy));

    const migrated = loadStoredReviewSet("alpha");
    assert.equal(migrated?.items[0]?.anchorState, "changed");
    assert.equal(migrated?.items[0]?.resolved, true);
    assert.equal(migrated?.items[0]?.screenshots[0]?.ownerNodeId, "ch1:1234567890abcdef12345678:1");
    assert.equal(values.has("canvas-helper/review-workbench-v9"), true);
    assert.equal(values.has("canvas-helper/review-workbench-v8"), false);
  });
});

test("review workbench discards corrupt current and v8 storage before accepting new work", () => {
  withLocalStorage((values) => {
    values.set("canvas-helper/review-workbench-v8", "{not-json");
    assert.equal(loadStoredReviewSet("alpha"), null);
    assert.equal(values.has("canvas-helper/review-workbench-v8"), false);
    assert.equal(
      saveStoredReviewSet(
        "alpha",
        "ffffffff-ffff-4fff-8fff-ffffffffffff",
        "Recovered review",
        "55555555-5555-4555-8555-555555555555",
        []
      ),
      true
    );
    assert.equal(loadStoredReviewSet("alpha")?.name, "Recovered review");

    values.set("canvas-helper/review-workbench-v9", "[also-not-json");
    assert.equal(loadStoredReviewSet("alpha"), null);
    assert.equal(values.has("canvas-helper/review-workbench-v9"), false);
    assert.equal(
      saveStoredReviewSet(
        "alpha",
        "99999999-9999-4999-8999-999999999999",
        "Clean review",
        "66666666-6666-4666-8666-666666666666",
        []
      ),
      true
    );
    assert.equal(loadStoredReviewSet("alpha")?.name, "Clean review");
  });
});
