import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/worldreligions30-option1/workspace/main.js");
const dataPath = path.resolve("projects/worldreligions30-option1/workspace/course-data.js");

test("world religions option1 contains legacy quizzes with inline multiple-choice options after chapter 2", async () => {
  const source = await readFile(dataPath, "utf8");

  assert.match(source, /"id": "quiz-3"/);
  assert.match(source, /"prompt": "1\. Early religions differed[^"]*A\./);
  assert.match(source, /"options": \[\]/);
});

test("world religions option1 quiz renderer normalizes inline multiple-choice options into standard answer buttons", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /resolveMultipleChoiceItems|normalizeMultipleChoice|splitInlineMultipleChoice/);
  assert.match(source, /options:\s*parseInlineMultipleChoiceOptions|resolveMultipleChoiceOptions|splitInlineMultipleChoice/);
  assert.match(source, /prompt:\s*stripPromptNumber|cleanedPrompt|questionStem/);
  assert.match(source, /renderMultipleChoice\(quiz,\s*work,\s*showResults\)/);
  assert.doesNotMatch(source, /search\(\/\\bA\\\./);
  assert.match(source, /search\(\/A\\\./);
});
