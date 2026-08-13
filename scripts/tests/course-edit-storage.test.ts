import assert from "node:assert/strict";
import test from "node:test";

import type { CourseEditDraft } from "../../app/shared/course-editing.ts";
import {
  exportCourseEditDrafts,
  importCourseEditDrafts,
  loadCourseEditDrafts,
  saveCourseEditDrafts
} from "../../app/studio/src/lib/course-edit-storage.ts";

const projectSlug = "legacy-snapshot-storage-fixture";

function snapshotDraft(): CourseEditDraft {
  return {
    id: "snapshot-draft",
    createdAt: 1,
    updatedAt: 2,
    identity: {
      targetId: "a".repeat(24),
      projectSlug,
      htmlPath: "index.html",
      nodeId: `ch1:${"b".repeat(24)}:1`,
      sourceDigest: "c".repeat(64),
      elementDigest: "d".repeat(64),
      editId: `che2:${"e".repeat(24)}`,
      tagName: "h1",
      adapter: "legacy-snapshot"
    },
    beforeText: "Before",
    afterText: "After",
    baseline: {
      originalHtml: "Before",
      attributes: { href: "", src: "", alt: "", title: "" },
      currentStyle: {
        textStyle: "default",
        fontFamily: "default",
        fontSize: "default",
        textTone: "default",
        alignment: "default",
        spacing: "default"
      },
      capabilities: {
        richText: true,
        link: false,
        image: false,
        styles: true,
        styleKeys: ["textTone"]
      }
    },
    patch: { html: "After" }
  };
}

test("legacy snapshot drafts survive browser storage reload and backup round-trip", () => {
  const values = new Map<string, string>();
  const localStorage = {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
    removeItem(key: string) { values.delete(key); },
    clear() { values.clear(); },
    key(index: number) { return [...values.keys()][index] ?? null; },
    get length() { return values.size; }
  };
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage } });
  try {
    const draft = snapshotDraft();
    assert.equal(saveCourseEditDrafts(projectSlug, [draft]), true);
    assert.deepEqual(loadCourseEditDrafts(projectSlug), [draft]);

    const backup = exportCourseEditDrafts(projectSlug);
    values.clear();
    assert.deepEqual(loadCourseEditDrafts(projectSlug), []);
    const restored = importCourseEditDrafts(projectSlug, backup);
    assert.equal(restored.ok, true);
    assert.deepEqual(loadCourseEditDrafts(projectSlug), [draft]);
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
