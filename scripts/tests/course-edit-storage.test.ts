import assert from "node:assert/strict";
import test from "node:test";

import type { CourseEditDraft, CourseEditEditorDocument, CourseEditTargetIdentity } from "../../app/shared/course-editing.ts";
import {
  clearCourseEditInlineRecovery,
  exportCourseEditDrafts,
  importCourseEditDrafts,
  loadCourseEditInlineRecovery,
  loadCourseEditDrafts,
  saveCourseEditInlineRecovery,
  type CourseEditInlineRecovery,
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

function snapshotIdentity(): CourseEditTargetIdentity {
  return snapshotDraft().identity;
}

function snapshotDocument(): CourseEditEditorDocument {
  return { kind: "plain-text", text: "Unsaved teacher proposal" };
}

function snapshotRecovery(): CourseEditInlineRecovery {
  return {
    projectSlug,
    identity: snapshotIdentity(),
    document: snapshotDocument(),
    savedDraftId: null,
    requiresRebase: false,
    createdAt: 3,
    updatedAt: 4
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

test("unsaved inline text survives a browser reload without becoming a course draft", () => {
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
    const recovery = snapshotRecovery();
    assert.deepEqual(saveCourseEditInlineRecovery(projectSlug, recovery), { ok: true, evictedProjectSlug: null });
    assert.deepEqual(loadCourseEditInlineRecovery(projectSlug).recovery, recovery);
    assert.deepEqual(loadCourseEditDrafts(projectSlug), []);

    assert.equal(clearCourseEditInlineRecovery(projectSlug), true);
    assert.equal(loadCourseEditInlineRecovery(projectSlug).recovery, null);
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("unsaved inline recovery rejects malformed browser storage instead of trusting it", () => {
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
    const recovery = { ...snapshotRecovery(), untrustedPreviewSession: "must-not-load" };
    values.set("canvas-helper/course-edit-inline-recovery-v1", JSON.stringify({
      version: 1,
      projects: [{ projectSlug, updatedAt: recovery.updatedAt, recovery }]
    }));
    const loaded = loadCourseEditInlineRecovery(projectSlug);
    assert.equal(loaded.recovery, null);
    assert.match(loaded.warnings.join(" "), /invalid unsaved text recovery/i);
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
