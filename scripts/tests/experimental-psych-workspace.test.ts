import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js");

test("experimental psychology keeps the Next Step theme internally without a learner theme toggle", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /COURSE_THEME_MODES/);
  assert.match(source, /const DEFAULT_THEME_MODE = "next-step";/);
  assert.match(source, /const THEME_PREFERENCE_VERSION = 2;/);
  assert.match(
    source,
    /parsed\.themePreferenceVersion === THEME_PREFERENCE_VERSION\s*\?\s*normalizeThemeMode\(parsed\.themeMode\)\s*:\s*DEFAULT_THEME_MODE/,
  );
  assert.match(source, /state\.themePreferenceVersion = THEME_PREFERENCE_VERSION;/);
  assert.doesNotMatch(source, /data-theme-toggle="current"/);
  assert.doesNotMatch(source, /data-theme-toggle="next-step"/);
  assert.doesNotMatch(source, /aria-pressed="\$\{themeMode === "next-step"/);
  assert.match(source, /next-step-theme/);
  assert.match(source, /--ns-primary:\s*#1e6d0d/);
});

test("experimental psychology quizzes use the forensics-style assessment surface", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /data-quiz-layout="forensics-assessment"/);
  assert.match(source, /quiz-detail-surface/);
  assert.match(source, /data-testid="quiz-section-breakdown"/);
  assert.match(source, /data-testid="quiz-question-row"/);
  assert.match(source, /Generate Results/);
  assert.match(source, /Check answers/);
  assert.match(source, /quiz-choice-letter/);
  assert.match(source, /Final Evaluation/);
});

test("experimental psychology uses the forensics35 course shell structure", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /courseShellView/);
  assert.match(source, /data-shell-nav="home"/);
  assert.match(source, /data-shell-nav="chapters"/);
  assert.match(source, /data-shell-nav="quizzes"/);
  assert.match(source, /forensics35-home-library/);
  assert.match(source, /forensics35-chapters-library/);
  assert.match(source, /forensics35-quiz-library/);
  assert.match(source, /data-testid="forensics35-chapter-card"/);
  assert.match(source, /forensics35-quiz-card/);
  assert.match(source, /data-testid="chapter-sequence-list"/);
  assert.match(source, /data-testid="mark-complete-panel"/);
  assert.match(source, /data-open-shell-content/);
  assert.match(source, /data-open-shell-quiz/);
  assert.match(source, /SCHOLARLY ACCESS/);
  assert.match(source, /filter:\s*blur\(3px\)/);
});
