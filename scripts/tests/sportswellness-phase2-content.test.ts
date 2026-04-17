import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/sportswellness/workspace/main.js");

test("sportswellness phase 2 lesson rebuild is present in main runtime", async () => {
  const source = await readFile(mainPath, "utf8");

  const expectedSnippets = [
    "PHASE_CONTENT['phase-2']",
    "The Psychology of Integrated Discipline",
    "Self-Determination Theory and the Motivation Continuum",
    "Recovery, Overreaching, and Overtraining Syndrome",
    "./assets/readings/phase2-drive-content.pdf",
    "phase2-figures",
    "Why this chapter matters",
    "The three psychological needs",
    "One important caution from self-determination theory is the overjustification problem.",
    "Approval-oriented swimmers improved when competing in the relay context",
    "Review Questions",
    "Answer Key",
    "SAID principle"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 2 quiz is added and quiz detail back label is not hardcoded to phase 1", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /phase-2/);
  assert.match(source, /quiz-phase2/i);
  assert.doesNotMatch(source, /id="back-to-phase">Back to phase 1<\/button>/);
});
