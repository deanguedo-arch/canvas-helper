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
  loadStoredReviewSet,
  saveStoredReviewSet
} from "../../app/studio/src/lib/review-set-storage.js";
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
    assert.equal(saveStoredReviewSet("alpha", alphaSession, []), true);
    assert.equal(saveStoredReviewSet("beta", betaSession, []), true);
    assert.equal(loadStoredReviewSet("alpha")?.sessionId, alphaSession);
    assert.equal(loadStoredReviewSet("beta")?.sessionId, betaSession);
    assert.equal(clearStoredReviewSet("alpha"), true);
    assert.equal(loadStoredReviewSet("alpha"), null);
    assert.equal(loadStoredReviewSet("beta")?.sessionId, betaSession);
  });
});
