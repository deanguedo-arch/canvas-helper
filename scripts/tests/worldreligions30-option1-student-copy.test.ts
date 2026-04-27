import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { getProjectPaths } from "../lib/paths.js";

const projectPaths = getProjectPaths("worldreligions30-option1");
const workspaceDir = projectPaths.workspaceDir;
const indexPath = path.resolve(workspaceDir, "index.html");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const contentDir = path.resolve(workspaceDir, "content");

test("world religions option1 student-facing shell copy avoids authoring language", async () => {
  const [indexHtml, mainSource, dataSource] = await Promise.all([
    readFile(indexPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(dataPath, "utf8")
  ]);

  assert.doesNotMatch(indexHtml, /comparative course shell/i);
  assert.doesNotMatch(indexHtml, /Browse chapter shells/i);

  assert.doesNotMatch(mainSource, /Chapter shells stay empty for now/i);
  assert.doesNotMatch(mainSource, /Each quiz can be completed, checked, and exported/i);
  assert.doesNotMatch(mainSource, /Open content/);
  assert.doesNotMatch(mainSource, /Open chapter content/);
  assert.doesNotMatch(mainSource, /Open chapter shell/);
  assert.doesNotMatch(mainSource, /Local chapter PDF for/i);
  assert.doesNotMatch(mainSource, /Assignment content has not been authored yet/i);

  assert.doesNotMatch(dataSource, /source content on/i);
  assert.doesNotMatch(dataSource, /Assignment space reserved/i);
  assert.doesNotMatch(dataSource, /Local chapter PDF for/i);
});

test("world religions option1 chapter readings avoid source-content labels", async () => {
  const entries = await readdir(contentDir, { withFileTypes: true });
  const moduleDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("WR30_Chapter") && entry.name.endsWith("_Source_Content_Web_Module"))
    .map((entry) => path.resolve(contentDir, entry.name, "index.html"));

  assert.ok(moduleDirs.length >= 10, "expected chapter reading modules");

  for (const modulePath of moduleDirs) {
    const html = await readFile(modulePath, "utf8");
    assert.doesNotMatch(html, /Source Content/i, `unexpected source-content label in ${path.basename(path.dirname(modulePath))}`);
    assert.doesNotMatch(html, /standalone module/i, `unexpected standalone-module label in ${path.basename(path.dirname(modulePath))}`);
    assert.doesNotMatch(html, /Module Purpose/i, `unexpected module-purpose heading in ${path.basename(path.dirname(modulePath))}`);
  }
});
