import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const runtimePath = path.resolve("projects/sportswellness/workspace/assignment-runtime-main.js");
const stylesPath = path.resolve("projects/sportswellness/workspace/styles.css");
const phase2SlicePattern =
  /\/\/ --- PHASE 2A \(VALUES\) LOGIC ---[\s\S]*?\/\/ --- PHASE 3 \(FOCUS BLUEPRINT\) LOGIC ---/;

test("sportswellness phase 2 values blueprint matches the three-value lesson contract", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase2Runtime = runtime.match(phase2SlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "Core Value 03",
    "Why do these values matter to you?",
    "What action proves these values this week?",
    "Pit crew or support environment",
    "What question will you ask before a hard choice?",
    "value3",
    "values_why",
    "task_bridge",
    "pit_crew"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(phase2Runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(phase2Runtime, /Choose two values--/);
  assert.doesNotMatch(phase2Runtime, /Phase 4 Mastery Report/);
});

test("sportswellness phase 2 master config includes default settings, maintenance, and social context", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase2Runtime = runtime.match(phase2SlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "Master Config",
    "Pre-performance default",
    "In-performance default",
    "Post-performance default",
    "Daily system check",
    "Weekly review and update",
    "Recovery checkpoint",
    "Pit crew check-in",
    "pre_default",
    "in_default",
    "post_default",
    "daily_check",
    "weekly_review",
    "recovery_checkpoint",
    "pit_crew_check"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(phase2Runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(phase2Runtime, /The User Blueprint/);
  assert.doesNotMatch(phase2Runtime, /Phase 4 System Configuration/);
});

test("sportswellness phase 2 runtime defines the step-markup helper used by master config rewrites", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase2Runtime = runtime.match(phase2SlicePattern)?.[0] ?? runtime;

  assert.match(phase2Runtime, /setStepMarkup\('mb-step0'/);
  assert.match(phase2Runtime, /function setStepMarkup\(id,\s*html\)/);
});

test("sportswellness phase 2 runtime tolerates legacy rubric score keys without null score groups", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase2Runtime = runtime.match(phase2SlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "const group = document.getElementById(`vb-group-${cat}`);",
    "const group = document.getElementById(`mb-group-${cat}`);",
    "incomingVBScores.depth",
    "incomingVBScores.sys",
    "incomingMBScores.id",
    "incomingMBScores.tk",
    "incomingMBScores.mn",
    "incomingMBScores.cl"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(phase2Runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 2 runtime re-upgrades remounted DOM instead of relying on a stale session flag", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase2Runtime = runtime.match(phase2SlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "const valuesRoot = document.getElementById('view-values');",
    "const masterRoot = document.getElementById('view-master');",
    "const valuesUpgraded = !valuesRoot || valuesRoot.dataset.phase2Upgrade === 'v1';",
    "const masterUpgraded = !masterRoot || masterRoot.dataset.phase2Upgrade === 'v1';",
    "valuesRoot.dataset.phase2Upgrade = 'v1';",
    "masterRoot.dataset.phase2Upgrade = 'v1';"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(phase2Runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 2 assignments capture motivation quality, goal ladder context, and recovery thresholds from the drive content", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase2Runtime = runtime.match(phase2SlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "What is driving your effort right now?",
    "pressure, guilt, values, identity, enjoyment, or fear",
    "motivation_driver",
    "Outcome goal",
    "Performance goal",
    "Process goal",
    "goal_outcome",
    "goal_performance",
    "goal_process",
    "When do you push and when do you back off?",
    "deload trigger",
    "recovery_threshold"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(phase2Runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness summary preview containers use normal text flow instead of flex word fragments", async () => {
  const styles = await readFile(stylesPath, "utf8");
  const previewBlockMatch = styles.match(
    /#vb-summary-preview,\s*#mb-summary-preview,\s*#p3-summary-preview,\s*#p4a-summary-preview,\s*#p4b-summary-preview\s*\{[\s\S]*?\}/
  );

  assert.ok(previewBlockMatch, "Expected shared summary preview styles block");
  const previewBlock = previewBlockMatch[0];

  assert.match(previewBlock, /display:\s*block;/);
  assert.match(previewBlock, /text-align:\s*left;/);
  assert.doesNotMatch(previewBlock, /display:\s*flex;/);
  assert.doesNotMatch(previewBlock, /justify-content:\s*center;/);
  assert.doesNotMatch(previewBlock, /align-items:\s*center;/);

  const previewSpanBlockMatch = styles.match(
    /#vb-summary-preview span,\s*#mb-summary-preview span,\s*#p3-summary-preview span,\s*#p4a-summary-preview span,\s*#p4b-summary-preview span\s*\{[\s\S]*?\}/
  );

  assert.ok(previewSpanBlockMatch, "Expected shared summary preview span block");
  assert.match(previewSpanBlockMatch[0], /display:\s*inline;/);
});

test("sportswellness phase 2 assignments reuse the Phase 1 shell and review layout language", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase2Runtime = runtime.match(phase2SlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "Assignment 02A",
    "Assignment 02B",
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
    assert.match(phase2Runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 1 and phase 2 assignments share the same desktop sizing layer", async () => {
  const styles = await readFile(stylesPath, "utf8");

  assert.match(
    styles,
    /:is\(#view-phase1,\s*#view-values,\s*#view-master(?:,\s*#view-phase3(?:,\s*#view-phase4a(?:,\s*#view-phase4b)?)?)?\)\s+\.grid\s*>\s*div,/
  );
  assert.match(
    styles,
    /:is\(#view-phase1,\s*#view-values,\s*#view-master(?:,\s*#view-phase3(?:,\s*#view-phase4a(?:,\s*#view-phase4b)?)?)?\)\s+\.p1-step-btn\s*\{[\s\S]*?letter-spacing:\s*0\.18em;/
  );
  assert.match(
    styles,
    /@media\s*\(min-width:\s*1200px\)\s*\{[\s\S]*?:is\(#view-phase1,\s*#view-values,\s*#view-master(?:,\s*#view-phase3(?:,\s*#view-phase4a(?:,\s*#view-phase4b)?)?)?\)\s+h1\s*\{/
  );
  assert.match(
    styles,
    /@media\s*\(min-width:\s*1500px\)\s*\{[\s\S]*?:is\(#view-phase1,\s*#view-values,\s*#view-master(?:,\s*#view-phase3(?:,\s*#view-phase4a(?:,\s*#view-phase4b)?)?)?\)\s+\.p1-rubric-table tbody td\s*\{[\s\S]*?font-size:\s*12px;/
  );
});

test("sportswellness phase 2 review scoring matches the three-level rubric and normalizes legacy saves", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const phase2Runtime = runtime.match(phase2SlicePattern)?.[0] ?? runtime;

  const expectedSnippets = [
    "function normalizePhase2RubricScore(value)",
    "[1,2,3].map(v => `<button onclick=\"vb_setScore('",
    "[1,2,3].map(v => `<button onclick=\"mb_setScore('",
    "/15",
    "/12",
    "/3",
    "normalizePhase2RubricScore(incomingVBScores.clar)",
    "normalizePhase2RubricScore(incomingMBScores.audit ?? incomingMBScores.cl)"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(phase2Runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(phase2Runtime, /\$\{vb_scores\[c\.id\] \|\| 0\}\/5/);
  assert.doesNotMatch(phase2Runtime, /\$\{mb_scores\[c\.id\] \|\| 0\}\/5/);
});

test("sportswellness phase 2 field cards use explicit card wrappers so review inputs stop clipping", async () => {
  const runtime = await readFile(runtimePath, "utf8");
  const styles = await readFile(stylesPath, "utf8");
  const phase2Runtime = runtime.match(phase2SlicePattern)?.[0] ?? runtime;

  const runtimeSnippets = [
    "phase2-field-card",
    "phase2-field-copy",
    "phase2-field-kicker",
    "phase2-field-note",
    "phase2-field-control"
  ];

  for (const snippet of runtimeSnippets) {
    assert.match(phase2Runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(styles, /\.phase2-field-card\s*\{/);
  assert.match(styles, /\.phase2-field-kicker\s*\{/);
  assert.match(styles, /\.phase2-field-control\s*\{/);
});
