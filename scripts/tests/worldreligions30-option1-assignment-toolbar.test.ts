import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { getProjectPaths } from "../lib/paths.js";

const projectPaths = getProjectPaths("worldreligions30-option1");
const mainPath = path.resolve(projectPaths.workspaceDir, "main.js");
const shellStylesPath = path.resolve(projectPaths.workspaceDir, "styles.css");
const sharedAssignmentCssPath = path.resolve(projectPaths.workspaceDir, "assignments", "chapter1interactive.css");

test("world religions option1 integrates assignment controls into a non-floating shell toolbar and removes the old runtime note cards", async () => {
  const [mainSource, shellStyles, assignmentCss] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(shellStylesPath, "utf8"),
    readFile(sharedAssignmentCssPath, "utf8")
  ]);

  assert.match(mainSource, /assignment-toolbar/);
  assert.match(mainSource, /data-assignment-action="back"/);
  assert.match(mainSource, /data-assignment-action="reset"/);
  assert.match(mainSource, /data-assignment-action="previous"/);
  assert.match(mainSource, /data-assignment-action="generate"/);
  assert.match(mainSource, /contentDocument|contentWindow/);
  assert.match(mainSource, /getElementById\("generate-report"\)/);

  assert.doesNotMatch(shellStyles, /\.assignment-toolbar\s*\{[^}]*position:\s*sticky/);
  assert.doesNotMatch(shellStyles, /\.assignment-instructions-shell\s*\{[^}]*position:\s*sticky/);
  assert.match(shellStyles, /\.assignment-instructions-shell/);

  assert.match(assignmentCss, /\.sidebar-note\s*\{[\s\S]*display:\s*none/);
  assert.match(assignmentCss, /\.assignment-footer\s*\{[\s\S]*display:\s*none/);
});
