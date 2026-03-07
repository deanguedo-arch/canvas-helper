import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import test from "node:test";

import { createEmptyAssessmentProject, createQuestion } from "../lib/assessments/model.js";
import { exportAssessmentBrightspaceCsv } from "../lib/assessments/export-brightspace.js";
import { validateAssessmentProject } from "../lib/assessments/validation.js";
import { collectAssessmentInputPaths } from "../lib/assessments/library.js";
import { extractDraftQuestionsFromPdfText } from "../lib/assessments/question-extraction.js";

test("validation blocks export when multiple-choice has no marked correct option", () => {
  const question = createQuestion({
    type: "multiple_choice",
    prompt: "Psychology is the study of?",
    choices: [
      {
        choiceId: "a",
        label: "A",
        text: "behaviour and mental processes",
        isCorrect: false,
        orderIndex: 0,
        matchKey: null,
        fixedPosition: null,
        matchRole: null
      },
      {
        choiceId: "b",
        label: "B",
        text: "astrology",
        isCorrect: false,
        orderIndex: 1,
        matchKey: null,
        fixedPosition: null,
        matchRole: null
      }
    ],
    correctAnswers: []
  });
  const project = createEmptyAssessmentProject({
    projectId: "validation-test",
    title: "Validation Test",
    questions: [question]
  });

  const validation = validateAssessmentProject(project);
  assert.equal(validation.canExport, false);
  assert.equal(
    validation.issues.some((issue) => issue.code === "multiple_choice_requires_exactly_one_correct_answer"),
    true
  );
});

test("brightspace export succeeds for a valid multiple-choice question", () => {
  const question = createQuestion({
    type: "multiple_choice",
    prompt: "Psychology is the study of?",
    choices: [
      {
        choiceId: "a",
        label: "A",
        text: "behaviour and mental processes",
        isCorrect: true,
        orderIndex: 0,
        matchKey: null,
        fixedPosition: null,
        matchRole: null
      },
      {
        choiceId: "b",
        label: "B",
        text: "fortune telling",
        isCorrect: false,
        orderIndex: 1,
        matchKey: null,
        fixedPosition: null,
        matchRole: null
      }
    ],
    correctAnswers: ["a"]
  });
  const project = createEmptyAssessmentProject({
    projectId: "export-test",
    title: "Export Test",
    questions: [question]
  });

  const result = exportAssessmentBrightspaceCsv(project);
  assert.equal(result.status, "success");
  assert.equal(result.rows.some((row) => row[0] === "NewQuestion" && row[1] === "MC"), true);
  assert.equal(result.rows.some((row) => row[0] === "Option" && row[1] === "100"), true);
});

test("question extraction heuristics detect MC and true/false blocks", () => {
  const extracted = extractDraftQuestionsFromPdfText(`
1. Psychology is the study of:
A) Behaviour and mental processes
B) The stars

2. True or False: Psychiatrists can prescribe medication.
`);

  assert.equal(extracted.length, 2);
  assert.equal(extracted[0]?.questionType, "multiple_choice");
  assert.equal(extracted[1]?.questionType, "true_false");
});

test("collectAssessmentInputPaths keeps only PDF and DOCX files", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-assessment-test-"));

  try {
    await writeFile(path.join(tempDir, "quiz-a.pdf"), "stub", "utf8");
    await writeFile(path.join(tempDir, "quiz-b.docx"), "stub", "utf8");
    await writeFile(path.join(tempDir, "notes.txt"), "stub", "utf8");

    const files = await collectAssessmentInputPaths(tempDir);
    const basenames = files.map((filePath) => path.basename(filePath)).sort();
    assert.deepEqual(basenames, ["quiz-a.pdf", "quiz-b.docx"]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
