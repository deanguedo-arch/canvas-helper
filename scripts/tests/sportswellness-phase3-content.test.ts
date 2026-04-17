import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/sportswellness/workspace/main.js");
const phase3PdfPath = path.resolve("projects/sportswellness/workspace/assets/readings/phase3-focus-content.pdf");

test("sportswellness phase 3 lesson rebuild is present in main runtime", async () => {
  const source = await readFile(mainPath, "utf8");

  const expectedSnippets = [
    "PHASE_CONTENT['phase-3']",
    "Mastering Focus Under Pressure",
    "Attention, Concentration, and the Inner Game of Performance",
    "Define concentration as selective, sustained, and shiftable attention rather than simple effortful focus.",
    "Pressure does not simply add emotion; it changes what the mind attends to.",
    "Nideffer's attentional quadrants",
    "Gallwey's performance equation states that performance equals potential minus interference.",
    "Self 1",
    "Self 2",
    "Pre-competition plans that protect attention",
    "Regaining concentration during performance",
    "Instructional vs. motivational cues",
    "quizId: 'quiz-phase3-focus-under-pressure'",
    "./assets/readings/phase3-figures/phase3-focus-system-map.png",
    "./assets/readings/phase3-figures/phase3-attentional-quadrants.png",
    "./assets/readings/phase3-figures/phase3-inner-game-equation.png",
    "./assets/readings/phase3-figures/phase3-precompetition-blueprint.png",
    "./assets/readings/phase3-figures/phase3-reset-sequence.png",
    "Multiple-choice review",
    "Answer key with brief explanations",
    "Glossary of essential terms",
    "./assets/readings/phase3-focus-content.pdf"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 3 source pdf is present in the workspace", async () => {
  await access(phase3PdfPath);
});
