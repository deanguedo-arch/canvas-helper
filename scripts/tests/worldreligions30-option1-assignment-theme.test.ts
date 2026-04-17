import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { getProjectPaths } from "../lib/paths.js";

const projectPaths = getProjectPaths("worldreligions30-option1");
const sharedCssPath = path.resolve(projectPaths.workspaceDir, "assignments", "chapter1interactive.css");
const chapter1JsPath = path.resolve(projectPaths.workspaceDir, "assignments", "chapter1interactive.js");
const chapter10JsPath = path.resolve(projectPaths.workspaceDir, "assignments", "chapter10interactive.js");

test("world religions option1 shared assignment theme uses the flat editorial academic system with a persistent footer bar", async () => {
  const css = await readFile(sharedCssPath, "utf8");

  assert.doesNotMatch(css, /body::before|body:before/);
  assert.doesNotMatch(css, /box-shadow\s*:/);
  assert.doesNotMatch(css, /backdrop-filter\s*:/);
  assert.match(css, /--page:\s*#fdfbf7|--page:\s*#FDFBF7/);
  assert.match(css, /--sidebar:\s*#ebe5d9|--sidebar:\s*#EBE5D9/);
  assert.match(css, /--gold:\s*#9b7c3c|--gold:\s*#9B7C3C/);
  assert.match(css, /position:\s*sticky/);
  assert.match(css, /\.step-button\.active[\s\S]*background:\s*var\(--page\)/);
  assert.match(css, /\.step-button\.active::before[\s\S]*background:\s*var\(--gold\)/);
});

test("world religions option1 assignment runtimes use Proceed for working steps and print only on the final report", async () => {
  const [chapter1Js, chapter10Js] = await Promise.all([
    readFile(chapter1JsPath, "utf8"),
    readFile(chapter10JsPath, "utf8")
  ]);

  for (const source of [chapter1Js, chapter10Js]) {
    assert.match(source, /"Print or Save PDF"\s*:\s*"Proceed"|"Proceed"\s*:\s*"Print or Save PDF"/);
    assert.match(source, /setStep\(state\.activeStep \+ 1\)/);
    assert.match(source, /assignmentStepKind|data-assignment-step-kind/);
  }
});
