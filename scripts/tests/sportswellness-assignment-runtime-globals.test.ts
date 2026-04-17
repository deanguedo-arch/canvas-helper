import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const runtimePath = path.resolve("projects/sportswellness/workspace/assignment-runtime-main.js");

test("sportswellness assignment runtime exports mobile step-menu toggle handlers for all upgraded views", async () => {
  const runtime = await readFile(runtimePath, "utf8");

  const expectedSnippets = [
    "vb_showStep, vb_toggleStepMenu, vb_setScore",
    "mb_showStep, mb_toggleStepMenu, mb_setScore",
    "p3_showStep, p3_toggleStepMenu, p3_setScore",
    "p4a_showStep, p4a_toggleStepMenu, p4a_setScore",
    "p4b_showStep, p4b_toggleStepMenu, p4b_setScore",
    "Object.assign(window, runtimeGlobals);"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
