import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const runtimePath = path.resolve("projects/sportswellness/workspace/assignment-runtime-main.js");
const stylesPath = path.resolve("projects/sportswellness/workspace/styles.css");
const phase4aSlicePattern =
  /\/\/ --- PHASE 4A \(CONFIDENCE - NEW\) LOGIC ---[\s\S]*?\/\/ --- PHASE 4B VISUALIZATION \(NEW\) LOGIC ---/;

test("sportswellness phase 4a reuses the authored Phase 1 shell language", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase4aRuntime = runtime.match(phase4aSlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "Assignment 04A",
    "Confidence Master Blueprint",
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
    assert.match(phase4aRuntime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 4a review uses the three-level rubric and normalizes legacy scores", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase4aRuntime = runtime.match(phase4aSlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "function normalizePhase4ARubricScore(value)",
    "[1,2,3].map(v => `<button onclick=\"p4a_setScore('",
    "/15",
    "/3",
    "normalizePhase4ARubricScore"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(phase4aRuntime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(phase4aRuntime, /\$\{p4a_scores\[c\.id\] \|\| 0\}\/5/);
  assert.doesNotMatch(phase4aRuntime, /\$\{total\}\/25/);
});

test("sportswellness phase 4a aligns to the phase 4 confidence chapter model", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase4aRuntime = runtime.match(phase4aSlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "mastery experiences",
    "deposits vs withdrawals",
    "mental filter",
    "Daily E-S-P",
    "temporary / limited / nonrepresentative",
    "What? So what? Now what?",
    "C-B-A design rules"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(
      phase4aRuntime,
      new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    );
  }
});

test("sportswellness phase 4a joins the shared shell sizing and explicit field-card layout rules", async () => {
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
