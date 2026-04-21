import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import { listProjectSlugs, readStudioProjectBundle } from "../lib/projects.js";

const projectDir = path.resolve("projects", "forensicstudiesoption2");
const workspaceDir = path.resolve(projectDir, "workspace");
const projectJsonPath = path.resolve(projectDir, "meta", "project.json");
const indexPath = path.resolve(workspaceDir, "index.html");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");

function loadCourseData(source: string) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return (context.window as { FORENSIC_STUDIES_OPTION2_DATA?: { chapters?: Array<Record<string, string>>, assignments?: Array<Record<string, string>>, library?: Array<Record<string, string>> } }).FORENSIC_STUDIES_OPTION2_DATA;
}

function extractNamedFunction(source: string, functionName: string) {
  const marker = `function ${functionName}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `expected to find ${functionName} in source`);

  const bodyStart = source.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `expected to find ${functionName} body start`);

  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`unable to extract function ${functionName}`);
}

test("forensic studies option2 project metadata and workspace shell exist", async () => {
  await access(projectJsonPath);
  await access(indexPath);
  await access(mainPath);
  await access(dataPath);

  const [projectJsonSource, indexSource] = await Promise.all([
    readFile(projectJsonPath, "utf8"),
    readFile(indexPath, "utf8")
  ]);

  assert.match(projectJsonSource, /"slug": "forensicstudiesoption2"/);
  assert.match(projectJsonSource, /"projectType": "generated-course"/);
  assert.match(indexSource, /Forensic Studies 25 \| Option 2/);
  assert.match(indexSource, /data-project-slug="forensicstudiesoption2"/);
  assert.match(indexSource, /Forensic Studies 25 content, assignments, and quizzes\./);
  assert.match(indexSource, /href="\.\/styles\.css\?rev=/);
  assert.match(indexSource, /src="\.\/course-data\.js\?rev=/);
  assert.match(indexSource, /src="\.\/main\.js\?rev=/);
  assert.doesNotMatch(indexSource, /Option 2 shell for Forensics source content/i);
});

test("forensic studies option2 uses the world religions shell contract with mapped forensics data", async () => {
  const [indexSource, mainSource, dataSource] = await Promise.all([
    readFile(indexPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(dataPath, "utf8")
  ]);

  const data = loadCourseData(dataSource);
  const chapterOne = data?.chapters?.find((entry) => entry.id === "chapter-1");
  const chapterEightAssignment = data?.assignments?.find((entry) => entry.id === "assignment-8");

  assert.ok(chapterOne);
  assert.equal(chapterOne.title, "1 Introduction to Crime Scenes");
  assert.match(String(chapterOne.contentPath || ""), /chapter-1\/index\.html$/);

  assert.ok(chapterEightAssignment);
  assert.equal(chapterEightAssignment.interactivePath, "./assignments/module8assignment.html");

  assert.equal(data?.course?.enableLibrary, false);
  assert.ok(Array.isArray(data?.library), "expected library array to remain defined");
  assert.equal(data?.library?.length || 0, 0);
  assert.doesNotMatch(indexSource, /id="nav-library"/);
  assert.doesNotMatch(indexSource, />\s*Library\s*</);
  assert.doesNotMatch(indexSource, /overlay-download/);
  assert.doesNotMatch(mainSource, /setSection\("library"\)/);
  assert.doesNotMatch(mainSource, /renderLibrary\(/);
  assert.doesNotMatch(mainSource, /data-open-expanded-viewer/);
  assert.doesNotMatch(mainSource, /getLibraryItems\(/);

  assert.match(mainSource, /FORENSIC_STUDIES_OPTION2_DATA/);
  assert.match(mainSource, /quiz\.sourcePath/);
});

test("forensic studies option2 is discoverable by the studio project picker", async () => {
  const slugs = await listProjectSlugs();
  assert.ok(slugs.includes("forensicstudiesoption2"));

  const bundle = await readStudioProjectBundle("forensicstudiesoption2");
  assert.equal(bundle.manifest.slug, "forensicstudiesoption2");
  assert.equal(path.basename(bundle.paths.rawEntrypoint), "original.html");
});

test("forensic studies option2 quiz section breakdown omits empty question types", async () => {
  const mainSource = await readFile(mainPath, "utf8");
  const formatQuestionRangeSource = extractNamedFunction(mainSource, "formatQuestionRange");
  const computeQuizSectionBreakdownSource = extractNamedFunction(mainSource, "computeQuizSectionBreakdown");

  const context = {
    result: [] as Array<{ key: string; title: string; range: string; score: string }>,
    computeQuizCompletionSummary: () => ({
      multipleChoiceAnswered: 0,
      multipleChoiceTotal: 5,
      trueFalseAnswered: 0,
      trueFalseTotal: 0,
      matchingAnswered: 0,
      matchingTotal: 0,
      writtenAnswered: 0,
      writtenTotal: 0
    })
  };

  vm.createContext(context);
  vm.runInContext(
    `${formatQuestionRangeSource}\n${computeQuizSectionBreakdownSource}\nresult = computeQuizSectionBreakdown({});`,
    context
  );

  const keys = Array.from(context.result, (section) => section.key);
  const titles = Array.from(context.result, (section) => section.title);

  assert.deepEqual(keys, ["mc"]);
  assert.deepEqual(titles, ["Multiple Choice"]);
});

test("forensic studies option2 shell copy drops generic option 2 and source-link filler text", async () => {
  const mainSource = await readFile(mainPath, "utf8");

  assert.doesNotMatch(mainSource, /Rebuilt quizzes stay interactive/i);
  assert.doesNotMatch(mainSource, /Each module opens into the option 2 shell/i);
  assert.doesNotMatch(mainSource, /Source brief coverage/i);
  assert.doesNotMatch(mainSource, /This module includes multiple mapped assignment briefs/i);
  assert.doesNotMatch(mainSource, /This assignment is still tracked in the option 2 shell/i);
  assert.doesNotMatch(mainSource, /The option 2 shell keeps it reachable/i);
});

test("forensic studies option2 quiz flow uses generate results as the completion gate", async () => {
  const mainSource = await readFile(mainPath, "utf8");

  assert.doesNotMatch(mainSource, /data-mark-quiz-complete/);
  assert.doesNotMatch(mainSource, /Mark complete/i);
  assert.doesNotMatch(mainSource, /Open source/i);
  assert.doesNotMatch(mainSource, /Open original source/i);
  assert.match(mainSource, /data-generate-quiz-results/);
  assert.match(mainSource, /state\.progress\.quizComplete\[quiz\.id\]\s*=\s*true/);
  assert.match(mainSource, /state\.progress\.quizCompletedAt\[quiz\.id\]\s*=\s*new Date\(\)\.toISOString\(\)/);
  assert.match(mainSource, /data-check-answers="\$\{escapeHtml\(quiz\.id\)\}" \$\{complete \? "" : "disabled"\}/);
  assert.match(mainSource, /data-retake-quiz="\$\{escapeHtml\(quiz\.id\)\}" \$\{complete \? "" : "disabled"\}/);
  assert.doesNotMatch(mainSource, /const markCompleteButton = event\.target\.closest\("\[data-mark-quiz-complete\]"\)/);
});

test("forensic studies option2 unlocks quizzes and assignments from module component completion", async () => {
  const [mainSource, dataSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(dataPath, "utf8")
  ]);
  const data = loadCourseData(dataSource);
  const chapterOne = data?.chapters?.find((entry) => entry.id === "chapter-1");

  assert.ok(Array.isArray(chapterOne?.componentIds), "expected generated chapter component metadata");
  assert.ok((chapterOne?.componentIds?.length || 0) > 0, "expected at least one chapter component id");

  assert.match(mainSource, /moduleComponents/);
  assert.match(mainSource, /function isModuleComplete\(/);
  assert.match(mainSource, /function getChapterComponentIds\(/);
  assert.match(mainSource, /function syncChapterProgressFrame\(/);
  assert.match(mainSource, /forensicstudiesoption2-module-progress-ready/);
  assert.match(mainSource, /forensicstudiesoption2-module-progress-update/);
  assert.match(mainSource, /forensicstudiesoption2-module-progress-sync/);
  assert.match(mainSource, /return !!quiz && isModuleComplete\(quiz\.chapterId\)/);
  assert.match(mainSource, /return !!assignment && isModuleComplete\(assignment\.chapterId\)/);
  assert.doesNotMatch(mainSource, /return !!state\.progress\.quizComplete\[`quiz-\$\{number - 1\}`\]/);
  assert.doesNotMatch(mainSource, /Locked until the previous quiz is complete/i);
  assert.match(mainSource, /Locked until all module content is marked complete/i);
});

test("forensic studies option2 applies special assignment 8 and final exam rules", async () => {
  const [mainSource, dataSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(dataPath, "utf8")
  ]);
  const data = loadCourseData(dataSource);
  const chapterEight = data?.chapters?.find((entry) => entry.id === "chapter-8");
  const chapterNine = data?.chapters?.find((entry) => entry.id === "chapter-9");
  const assignmentEight = data?.assignments?.find((entry) => entry.id === "assignment-8");
  const finalExamQuiz = data?.quizzes?.find((entry) => entry.id === "quiz-9");

  assert.ok(chapterEight, "expected chapter 8 to remain in imported course data");
  assert.ok(chapterNine, "expected final exam chapter to remain in imported course data");
  assert.ok(assignmentEight, "expected assignment 8 to remain in imported course data");
  assert.ok(finalExamQuiz, "expected final exam quiz to remain in imported course data");

  assert.match(mainSource, /assignmentComplete/);
  assert.match(mainSource, /function isAssignmentComplete\(/);
  assert.match(mainSource, /function markAssignmentComplete\(/);
  assert.match(mainSource, /function areForensicsAssignmentsOneToSevenComplete\(/);
  assert.match(mainSource, /function isForensicsFinalExamUnlocked\(/);
  assert.match(mainSource, /function getVisibleChapters\(/);
  assert.match(mainSource, /chapter\.id !== "chapter-8"/);
  assert.match(mainSource, /assignment\.id === "assignment-8"/);
  assert.match(mainSource, /areForensicsAssignmentsOneToSevenComplete\(\)/);
  assert.match(mainSource, /quiz\.id === "quiz-9"/);
  assert.match(mainSource, /Open test/);
  assert.doesNotMatch(mainSource, /Open quiz/);
});
