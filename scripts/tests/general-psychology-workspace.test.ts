import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/general-psychology-20-independent-studies-202633108/workspace/main.js");
const courseShellDataPath = path.resolve(
  "projects/general-psychology-20-independent-studies-202633108/workspace/course-shell-data.js",
);

async function readCourseShellData() {
  const source = await readFile(courseShellDataPath, "utf8");
  const jsonText = source.replace(/^\uFEFF/, "").replace(/^export default\s*/, "").replace(/;\s*$/, "");
  return JSON.parse(jsonText);
}

test("general psychology quiz rows do not render conversion status pills", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(
    source,
    /const status = bucket === "assignments" && !isQuizLibraryItem\(activity\)\s+\? getActivityConversionStatus\(activity\)\s+: "";/,
  );
});

test("general psychology keeps default authoring-lock behavior", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /const AUTHORING_UNLOCK_ALL = false;/);
  assert.doesNotMatch(
    source,
    /function moduleCompletion\(module\)\s*\{[\s\S]*if \(AUTHORING_UNLOCK_ALL\) \{[\s\S]*isUnlocked: true/,
  );
  assert.doesNotMatch(
    source,
    /function buildUnlockedContentActivities\(content\)\s*\{[\s\S]*if \(AUTHORING_UNLOCK_ALL\) \{\s*return content;\s*\}/,
  );
  assert.match(source, /const moduleQuizzesUnlocked = module \? moduleCompletion\(module\)\.isUnlocked : false;/);
});

test("general psychology module 6 excludes the social influence written response placeholder", async () => {
  const source = await readFile(courseShellDataPath, "utf8");

  assert.doesNotMatch(source, /chapter_15872\.html/);
  assert.match(source, /chapter_15853\.html/);
});

test("general psychology module 4 excludes the process of thinking written response placeholder", async () => {
  const source = await readFile(courseShellDataPath, "utf8");

  assert.doesNotMatch(source, /chapter_15812\.html/);
  assert.match(source, /chapter_15811\.html/);
});

test("general psychology module 2 excludes the principles of learning written response placeholder", async () => {
  const source = await readFile(courseShellDataPath, "utf8");

  assert.doesNotMatch(source, /chapter_15761\.html/);
  assert.match(source, /chapter_15760\.html/);
});

test("general psychology quiz assessments are backed by local quiz XML instead of missing-source placeholders", async () => {
  const courseShellData = await readCourseShellData();
  const mainSource = await readFile(mainPath, "utf8");

  const quizAssessments = courseShellData.modules
    .flatMap((module: { activities: Array<Record<string, unknown>> }) => module.activities)
    .filter((activity: Record<string, unknown>) => activity.kind === "assessment" && activity.resourceKind === "quiz");

  assert.ok(quizAssessments.length > 0, "expected quiz assessments in the shell");

  for (const activity of quizAssessments) {
    const sourceHref = String(activity.sourceHref || "");
    if (!sourceHref) {
      assert.match(
        mainSource,
        new RegExp(`"${String(activity.id).replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}"\\s*:`),
        `${activity.title} should be backed by a local quiz override when no sourceHref is present`,
      );
      continue;
    }

    assert.match(sourceHref, /^(content|сontent|quiz)\//, `${activity.title} should have a local sourceHref`);
    assert.doesNotMatch(
      String(activity.contentBody || ""),
      /did not include the source file/i,
      `${activity.title} should not use the missing-source fallback`,
    );
  }
});

test("general psychology keeps the final project pdf in content instead of classifying it as an assignment", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(
    source,
    /if \(resourceKind === "pdf" && \/\\bfinal\\s\+project\\b\/i\.test\(String\(activity\?\.title \|\| ""\)\)\) \{\s*return false;\s*\}/,
  );
});
