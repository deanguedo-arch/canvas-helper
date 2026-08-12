import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { CURRENT_STUDIO_RELEASE } from "../../app/studio/src/lib/studio-release-notes.ts";

test("Studio release manifest is bounded, unique, and mirrored in release documentation", async () => {
  assert.match(CURRENT_STUDIO_RELEASE.version, /^\d{4}\.\d{2}$/);
  assert.match(CURRENT_STUDIO_RELEASE.date, /^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
  assert.ok(CURRENT_STUDIO_RELEASE.title.length <= 80);
  assert.ok(CURRENT_STUDIO_RELEASE.summary.length <= 240);
  assert.ok(CURRENT_STUDIO_RELEASE.notes.length >= 1 && CURRENT_STUDIO_RELEASE.notes.length <= 8);
  assert.equal(new Set(CURRENT_STUDIO_RELEASE.notes.map((note) => note.title)).size, CURRENT_STUDIO_RELEASE.notes.length);
  for (const note of CURRENT_STUDIO_RELEASE.notes) {
    assert.ok(note.title && note.title.length <= 80);
    assert.ok(note.summary && note.summary.length <= 240);
    assert.doesNotMatch(`${note.title}${note.summary}`, /<[^>]+>/);
  }

  const releasePath = path.resolve("docs", "releases", "2026-08-11-canvas-studio.md");
  const releaseDocument = await readFile(releasePath, "utf8");
  assert.match(releaseDocument, new RegExp(CURRENT_STUDIO_RELEASE.version.replace(".", "\\.")));
  assert.ok(releaseDocument.includes(CURRENT_STUDIO_RELEASE.title));
  for (const note of CURRENT_STUDIO_RELEASE.notes) assert.ok(releaseDocument.includes(note.title));
});
