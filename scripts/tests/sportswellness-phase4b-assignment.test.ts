import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const runtimePath = path.resolve("projects/sportswellness/workspace/assignment-runtime-main.js");
const stylesPath = path.resolve("projects/sportswellness/workspace/styles.css");
const phase4bSlicePattern =
  /\/\/ --- PHASE 4B VISUALIZATION \(NEW\) LOGIC ---[\s\S]*?\/\/ --- INIT ---/;

test("sportswellness phase 4b reuses the authored Phase 1 shell language", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase4bRuntime = runtime.match(phase4bSlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "Assignment 04B",
    "Visualization Master Blueprint",
    "p1-phase-subtitle",
    "p1-step-nav-shell",
    "p1-step-nav",
    "p1-step-btn",
    "p1-review-grid",
    "p1-rubric-shell",
    "p1-rubric-table",
    "Mastery score",
    "File actions"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(phase4bRuntime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 4b review uses the three-level rubric and normalizes legacy scores", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase4bRuntime = runtime.match(phase4bSlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "function normalizePhase4BRubricScore(value)",
    "[1,2,3].map(v => `<button onclick=\"p4b_setScore('",
    "/15",
    "/3",
    "normalizePhase4BRubricScore"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(phase4bRuntime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(phase4bRuntime, /\$\{p4b_scores\[c\.id\] \|\| 0\}\/5/);
  assert.doesNotMatch(phase4bRuntime, /\$\{total\}\/25/);
});

test("sportswellness phase 4b joins the shared shell sizing and explicit field-card layout rules", async () => {
  const styles = await readFile(stylesPath, "utf8");

  assert.match(
    styles,
    /:is\(#view-phase1,\s*#view-values,\s*#view-master,\s*#view-phase3,\s*#view-phase4a,\s*#view-phase4b\)\s+\.grid\s*>\s*div,/
  );
  assert.match(
    styles,
    /:is\(#view-values,\s*#view-master,\s*#view-phase3,\s*#view-phase4a,\s*#view-phase4b\)\s+\.phase2-field-card\s*\{/
  );
  assert.match(
    styles,
    /:is\(#view-values,\s*#view-master,\s*#view-phase3,\s*#view-phase4a,\s*#view-phase4b\)\s+\.phase2-score-group\s*\{/
  );
});
