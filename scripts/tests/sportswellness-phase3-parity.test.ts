import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { listProjectSlugs } from "../lib/projects.js";

const mainPath = path.resolve("projects/sportswellness/workspace/main.js");
const pdfPath = path.resolve("projects/sportswellness/workspace/assets/readings/phase3-focus-content.pdf");
const figureDir = path.resolve("projects/sportswellness/workspace/assets/readings/phase3-figures");

test("sportswellness is the only remaining sports wellness studio slug", async () => {
  const slugs = await listProjectSlugs();

  assert.ok(slugs.includes("sportswellness"));
  assert.ok(!slugs.includes("mentalwellness10"));
  assert.ok(!slugs.includes("mentalwellness10-option1"));
  assert.ok(!slugs.includes("mentalwellness10-option2"));
});

test("sportswellness phase 3 lesson includes authored figures and a linked quiz", async () => {
  const source = await readFile(mainPath, "utf8");

  const expectedSnippets = [
    "PHASE_CONTENT['phase-3']",
    "quizId: 'quiz-phase3-focus-under-pressure'",
    "heroFigure",
    "./assets/readings/phase3-figures/phase3-focus-system-map.png",
    "./assets/readings/phase3-figures/phase3-attentional-quadrants.png",
    "./assets/readings/phase3-figures/phase3-inner-game-equation.png",
    "./assets/readings/phase3-figures/phase3-precompetition-blueprint.png",
    "./assets/readings/phase3-figures/phase3-reset-sequence.png",
    "id: 'quiz-phase3-focus-under-pressure'",
    "code: 'Quiz 03'",
    "questionCount: 12",
    "sourcePdf: './assets/readings/phase3-focus-content.pdf'"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 3 reading pdf and figure assets exist", async () => {
  await access(pdfPath);
  await access(path.join(figureDir, "phase3-focus-system-map.png"));
  await access(path.join(figureDir, "phase3-attentional-quadrants.png"));
  await access(path.join(figureDir, "phase3-inner-game-equation.png"));
  await access(path.join(figureDir, "phase3-precompetition-blueprint.png"));
  await access(path.join(figureDir, "phase3-reset-sequence.png"));
});
