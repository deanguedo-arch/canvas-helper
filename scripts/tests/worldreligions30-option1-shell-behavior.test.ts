import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { getProjectPaths } from "../lib/paths.js";

const projectPaths = getProjectPaths("worldreligions30-option1");
const mainPath = path.resolve(projectPaths.workspaceDir, "main.js");

test("world religions option1 keeps authoring unlocks enabled for chapters and quizzes", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /const AUTHORING_UNLOCK_ALL = true;/);
  assert.match(source, /function isChapterUnlocked\(number\)\s*\{\s*if \(AUTHORING_UNLOCK_ALL\) return true;/);
  assert.match(source, /function isQuizUnlocked\(quiz\)\s*\{\s*return !!quiz && isChapterUnlocked\(quiz\.number\);/);
});

test("world religions option1 routes chapter pdf actions into the overlay viewer", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /data-open-expanded-viewer="\$\{escapeHtml\(getLibraryIdForChapter\(chapter\.id\)\)\}"/);
  assert.match(source, /Open PDF/);
  assert.match(source, /Open chapter PDF/);
  assert.doesNotMatch(source, /data-open-library="\$\{escapeHtml\(getLibraryIdForChapter\(chapter\.id\)\)\}"[^>]*>Open PDF/);
  assert.doesNotMatch(source, /data-open-library="\$\{escapeHtml\(getLibraryIdForChapter\(chapter\.id\)\)\}"[^>]*>Open chapter PDF/);
});

test("world religions option1 normalizes library items so chapter pdf links resolve even when course data omits chapterId", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /chapterId:\s*item\.chapterId\s*\|\|/);
  assert.match(source, /chapterId:\s*item\.chapterId\s*\|\|\s*`chapter-\$\{item\.number\}`/);
});
