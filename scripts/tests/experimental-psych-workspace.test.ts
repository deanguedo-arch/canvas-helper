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
  assert.doesNotMatch(source, /import \* as pdfjsLib from "https:\/\/esm\.sh\/pdfjs-dist/);
  assert.match(source, /function loadPdfJsLib\(\)/);
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
  assert.match(source, /data-content-state=/);
  assert.match(source, /All lesson content for this module is laid out below\./);
  assert.match(source, /locked\s*\?\s*`<p class="forensic-sequence-summary">This lesson will unlock after the previous content is marked complete\.<\/p>`\s*:\s*renderActivityBody\(activity\)/);
  assert.match(source, /Content is open\. Mark complete whenever you are ready\./);
  assert.match(source, /function bindLazyReaderHydration\(\)/);
  assert.match(source, /data-lazy-html-activity=/);
  assert.match(source, /data-lazy-pdf-activity=/);
  assert.match(source, /slice\(0, 12\)\.forEach\(hydrateTarget\);/);
  assert.match(source, /window\.setTimeout\(\(\) => \{\s*targets\.filter\(\(target\) => target\.hasAttribute\("data-lazy-html-activity"\)\)\.forEach\(hydrateTarget\);/);
  assert.match(source, /Formatting the full source content as this lesson comes into view/);
  assert.match(source, /function bindUnavailableLessonImages\(\)/);
  assert.match(source, /image\.setAttribute\("loading", image\.getAttribute\("loading"\) \|\| "lazy"\);/);
  assert.doesNotMatch(source, /image\.remove\(\);/);
  assert.doesNotMatch(source, /wrapper\.remove\(\);/);
  assert.match(source, /quizLoadingByActivityId\.delete\(activity\.id\);\s*renderWithForensicsScrollRestored\(\);/);
  assert.match(source, /htmlLoadingByActivityId\.delete\(activity\.id\);\s*renderWithForensicsScrollRestored\(\);/);
  assert.match(source, /data-open-shell-quiz/);
  assert.match(source, /SCHOLARLY ACCESS/);
  assert.match(source, /filter:\s*blur\(3px\)/);
});

test("experimental psychology library cards do not expose D2L manifest scaffolding copy", async () => {
  const source = await readFile(mainPath, "utf8");
  const scaffoldingCopy =
    /Mapped from the D2L manifest hierarchy|Manifest-derived lesson title|Source path preserved for traceability|renderer mappings|mapped from the course manifest|real course sequence/i;

  assert.doesNotMatch(source, scaffoldingCopy);
});

test("experimental psychology assignment cards use classroom hand-in copy and clean assignment titles", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(
    source,
    /Complete this assignment directly in the workspace, then save the result as a PDF and attach the resulting PDF to your corresponding Google Classroom assignment\./,
  );
  assert.match(source, /function formatAssignmentTitleForCard\(title\)/);
  assert.match(source, /formatAssignmentTitleForCard\(activity\.title\)/);
  assert.match(source, /formatAssignmentTitleForCard\(selected\?\.title\)/);
  assert.match(source, /const buttonLabel = isAssignment \? "Open assignment" : "Open test";/);
  assert.match(source, /forensic-assignment-description/);
});

test("experimental psychology authoring mode unlocks progressive shell gates", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /const AUTHORING_UNLOCK_ALL = true;/);
  assert.match(
    source,
    /function moduleCompletion\(module\)\s*\{[\s\S]*if \(AUTHORING_UNLOCK_ALL\) \{[\s\S]*isUnlocked: true/,
  );
  assert.match(
    source,
    /function buildUnlockedContentItems\(contentItems\)\s*\{[\s\S]*if \(AUTHORING_UNLOCK_ALL\) \{\s*return items;\s*\}/,
  );
});
