import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const mainPath = path.resolve("projects/worldreligions30-option1/workspace/main.js");
const stylesPath = path.resolve("projects/worldreligions30-option1/workspace/styles.css");
const dataPath = path.resolve("projects/worldreligions30-option1/workspace/course-data.js");

type WorldReligionsCourseData = {
  quizzes?: Array<Record<string, any>>;
};

function loadCourseData(source: string): WorldReligionsCourseData {
  const context = { window: {} as { WORLD_RELIGIONS_DATA?: WorldReligionsCourseData } };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.window.WORLD_RELIGIONS_DATA ?? {};
}

function sumPromptMarks(items: Array<Record<string, any>>) {
  return items.reduce((total: number, item) => {
    const matches = Array.from(String(item.prompt || "").matchAll(/(\d+)\s*marks?/gi));
    const last = matches.at(-1);
    return total + Number(last?.[1] || 0);
  }, 0);
}

test("world religions option1 chapter 1 quiz data includes written-response marks beyond the objective total", async () => {
  const source = await readFile(dataPath, "utf8");
  const data = loadCourseData(source);
  const quiz = data.quizzes?.find((entry) => entry.id === "quiz-1");

  assert.ok(quiz);
  assert.equal(quiz.objectiveTotal, 50);
  assert.equal(sumPromptMarks(quiz.writtenResponse || []), 62);
});

test("world religions option1 quiz detail uses a live completion counter and section breakdown instead of a scored mark total", async () => {
  const [mainSource, stylesSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);

  assert.match(mainSource, /computeQuizCompletionSummary|countAnsweredQuestions|countAnsweredQuizItems/);
  assert.match(mainSource, /Final Evaluation/);
  assert.match(mainSource, /completed questions|questions completed|completion progress/i);
  assert.match(mainSource, /quiz-evaluation-panel|quiz-summary-panel|quiz-overview-panel/);
  assert.match(mainSource, /Section Breakdown/);
  assert.match(mainSource, /quiz-section-breakdown|quiz-breakdown-list/);
  assert.doesNotMatch(mainSource, /quiz-pill-row/);
  assert.match(mainSource, /sectionHeader.*hidden|hidden = !!\(state\.tab === "quizzes" && state\.activeId\)|toggleAttribute\("hidden"/);
  assert.match(mainSource, /data-generate-quiz-results/);
  assert.doesNotMatch(mainSource, /quizResultsReady|shouldRevealQuizScore|revealObjectiveScore/);
  assert.doesNotMatch(mainSource, /Overall score/i);

  assert.match(stylesSource, /\.quiz-evaluation-panel|\.quiz-summary-panel|\.quiz-overview-panel/);
  assert.match(stylesSource, /\.quiz-meta-row|\.quiz-meta-strip/);
  assert.match(stylesSource, /\.quiz-section-breakdown|\.quiz-breakdown-list/);
  assert.match(stylesSource, /\.quiz-back-link|\.btn-link-muted/);
  assert.match(stylesSource, /\.quiz-evaluation-earned/);
  assert.match(stylesSource, /font-variant-numeric:\s*lining-nums tabular-nums/);
});

test("world religions option1 quiz results sheet reports completion totals while keeping manual review language", async () => {
  const mainSource = await readFile(mainPath, "utf8");

  assert.match(mainSource, /Completed questions/);
  assert.match(mainSource, /manual review|teacher review/i);
  assert.doesNotMatch(mainSource, /objective points keyed|written-response points pending/i);
});
