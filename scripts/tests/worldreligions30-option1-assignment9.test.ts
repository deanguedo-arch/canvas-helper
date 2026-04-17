import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { fileExists } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";

const projectPaths = getProjectPaths("worldreligions30-option1");
const mainPath = path.resolve(projectPaths.workspaceDir, "main.js");
const assignmentHtmlPath = path.resolve(projectPaths.workspaceDir, "assignments", "chapter9interactive.html");
const assignmentCssPath = path.resolve(projectPaths.workspaceDir, "assignments", "chapter9interactive.css");
const assignmentJsPath = path.resolve(projectPaths.workspaceDir, "assignments", "chapter9interactive.js");

test("world religions option1 ships a local Chapter 9 interactive assignment runtime", async () => {
  assert.equal(await fileExists(assignmentHtmlPath), true, "expected chapter9interactive.html");
  assert.equal(await fileExists(assignmentCssPath), true, "expected chapter9interactive.css");
  assert.equal(await fileExists(assignmentJsPath), true, "expected chapter9interactive.js");
});

test("world religions option1 assignment shell wires Chapter 9 to the interactive runtime", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /Sikh Symbol or Practice Study/);
  assert.match(source, /\.\/assignments\/chapter9interactive\.html/);
  assert.match(source, /chapter9interactive/);
});

test("world religions option1 chapter 9 assignment uses the shared report pattern without option labels or extra shell actions", async () => {
  const [mainSource, html, js, css] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(assignmentHtmlPath, "utf8"),
    readFile(assignmentJsPath, "utf8"),
    readFile(assignmentCssPath, "utf8")
  ]);

  assert.doesNotMatch(mainSource, /Option A/);
  assert.doesNotMatch(mainSource, /Open interactive assignment/);
  assert.doesNotMatch(mainSource, /Open standalone/);
  assert.match(mainSource, /Back to assignments/);

  assert.doesNotMatch(html, /Next step/);
  assert.match(html, /Generate report/);

  assert.doesNotMatch(js, /Option A/);
  assert.doesNotMatch(js, /Open report window/);
  assert.match(js, /Print or Save PDF/);
  assert.match(js, /Generate report/);
  assert.match(js, /popup\.print\(\)/);
  assert.match(js, /assignment-report|report-shell|report-summary/);

  assert.match(css, /@import "\.\/chapter1interactive\.css"|\.assignment-report|\.report-shell|\.report-summary/);
});
