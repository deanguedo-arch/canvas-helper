import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const runtimePath = path.resolve("projects/sportswellness/workspace/assignment-runtime-main.js");
const stylesPath = path.resolve("projects/sportswellness/workspace/styles.css");
const phase3SlicePattern =
  /\/\/ --- PHASE 3 \(FOCUS BLUEPRINT\) LOGIC ---[\s\S]*?\/\/ --- PHASE 4A \(CONFIDENCE - NEW\) LOGIC ---/;

test("sportswellness phase 3 reuses the authored Phase 1 shell language", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase3Runtime = runtime.match(phase3SlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "Assignment 03",
    "Focus Master Blueprint",
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
    assert.match(phase3Runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 3 review uses the three-level rubric and normalizes legacy scores", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase3Runtime = runtime.match(phase3SlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "function normalizePhase3RubricScore(value)",
    "[1,2,3].map(v => `<button onclick=\"p3_setScore('",
    "/15",
    "/3",
    "normalizePhase3RubricScore"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(phase3Runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(phase3Runtime, /\$\{p3_scores\[c\.id\] \|\| 0\}\/5/);
  assert.doesNotMatch(phase3Runtime, /\$\{total\}\/25/);
});

test("sportswellness phase 3 joins the shared shell sizing and explicit field-card layout rules", async () => {
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
