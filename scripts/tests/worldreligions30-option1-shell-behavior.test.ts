import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import { getProjectPaths } from "../lib/paths.js";

const projectPaths = getProjectPaths("worldreligions30-option1");
const mainPath = path.resolve(projectPaths.workspaceDir, "main.js");
const dataPath = path.resolve(projectPaths.workspaceDir, "course-data.js");
const stylesPath = path.resolve(projectPaths.workspaceDir, "styles.css");

function loadCourseData(source: string) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return (context.window as { WORLD_RELIGIONS_DATA?: { chapters?: Array<Record<string, string>> } }).WORLD_RELIGIONS_DATA;
}

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

test("world religions option1 chapter 1 shell mounts the authored content module and labels it Content", async () => {
  const [mainSource, dataSource, stylesSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(dataPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);

  const data = loadCourseData(dataSource);
  const chapter = data?.chapters?.find((entry) => entry.id === "chapter-1");

  assert.ok(chapter);
  assert.equal(chapter.title, "Content");
  assert.equal(chapter.contentPath, "./content/WR30_Chapter1_Source_Content_Web_Module/index.html");
  assert.match(mainSource, /chapter\.contentPath/);
  assert.match(mainSource, /chapter-content-frame/);
  assert.match(mainSource, /Open content/i);
  assert.match(stylesSource, /\.chapter-content-shell/);
  assert.match(stylesSource, /\.chapter-content-frame/);
});

test("world religions option1 chapter 2 shell mounts the authored content module", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);
  const chapter = data?.chapters?.find((entry) => entry.id === "chapter-2");

  assert.ok(chapter);
  assert.equal(chapter.title, "Content");
  assert.equal(chapter.contentPath, "./content/WR30_Chapter2_Source_Content_Web_Module/index.html");
});

test("world religions option1 chapter 3 shell mounts the authored content module", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);
  const chapter = data?.chapters?.find((entry) => entry.id === "chapter-3");

  assert.ok(chapter);
  assert.equal(chapter.title, "Content");
  assert.equal(chapter.contentPath, "./content/WR30_Chapter3_Source_Content_Web_Module/index.html");
});

test("world religions option1 chapter 5 shell mounts the authored content module", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);
  const chapter = data?.chapters?.find((entry) => entry.id === "chapter-5");

  assert.ok(chapter);
  assert.equal(chapter.title, "Content");
  assert.equal(chapter.contentPath, "./content/WR30_Chapter5_Source_Content_Web_Module/index.html");
});
