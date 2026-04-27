import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import { fileExists } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";

const projectPaths = getProjectPaths("worldreligions30-option1");
const dataPath = path.resolve(projectPaths.workspaceDir, "course-data.js");
const moduleDir = path.resolve(projectPaths.workspaceDir, "content", "WR30_Chapter1_Source_Content_Web_Module");
const moduleHtmlPath = path.resolve(moduleDir, "index.html");
const moduleCssPath = path.resolve(moduleDir, "styles.css");

function loadCourseData(source: string) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return (context.window as { WORLD_RELIGIONS_DATA?: { chapters?: Array<Record<string, string>> } }).WORLD_RELIGIONS_DATA;
}

test("world religions option1 chapter 1 wires a local source-content module", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);
  const chapter = data?.chapters?.find((entry) => entry.id === "chapter-1");

  assert.ok(chapter);
  assert.equal(chapter.title, "The Religious Impulse");
  assert.equal(chapter.contentPath, "./content/WR30_Chapter1_Source_Content_Web_Module/index.html");
  assert.match(chapter.summary, /religious impulse/i);
});

test("world religions option1 chapter 1 content covers the Lewis Browne quiz cue", async () => {
  assert.equal(await fileExists(moduleHtmlPath), true, "expected Chapter 1 module index.html");
  assert.equal(await fileExists(moduleCssPath), true, "expected Chapter 1 module styles.css");

  const html = await readFile(moduleHtmlPath, "utf8");

  assert.match(html, /Lewis Browne/i);
  assert.match(html, /faith,\s*hope,\s*and\s*charity/i);
});
