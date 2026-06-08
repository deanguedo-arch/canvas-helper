import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const outputRoot = path.resolve(
  "projects",
  "forensicstudiesoption2-nextstep-test",
  "workspace",
  "module-1-static"
);

async function fileText(relativePath: string) {
  return readFile(path.join(outputRoot, relativePath), "utf8");
}

async function assertExists(relativePath: string) {
  await access(path.join(outputRoot, relativePath));
}

test("module 1 static tester contains the required content-only files", async () => {
  for (const relativePath of [
    "index.html",
    "styles.css",
    "module-1.js",
    "module-1-data.js",
    "lesson.html",
    "assignment/module1assignment.html",
    "assignment/module1assignment.bundle.js",
    "assignment/forensic-assignment-theme.css",
    "assignment/forensic-assignment-print.js",
    "README.md",
    "MIGRATION_REPORT.md",
    "ACCEPTANCE_CHECKLIST.md"
  ]) {
    await assertExists(relativePath);
  }
});

test("module 1 shell is scoped to Module 1 and removes hosted progress behavior", async () => {
  const combined = [
    await fileText("index.html"),
    await fileText("module-1.js"),
    await fileText("module-1-data.js"),
    await fileText("lesson.html")
  ].join("\n");

  assert.match(combined, /Forensic Studies 25/);
  assert.match(combined, /1 Introduction to Crime Scenes/);
  assert.match(combined, /Crime Scene Certification Lab/);
  assert.match(combined, /M1 Introduction to Crime Scenes Quiz/);
  assert.match(combined, /Scholarly Access/);

  for (const forbidden of [
    /Firebase/i,
    /google-hosted-bridge/i,
    /hosted-runtime-content/i,
    /localStorage/i,
    /sessionStorage/i,
    /Save now/i,
    /unlocked chapters/i,
    /completed quizzes/i,
    /Mark Complete/i,
    /data-progress-state/i,
    /locked-card/i
  ]) {
    assert.doesNotMatch(combined, forbidden);
  }

  assert.doesNotMatch(combined, /Module 2[^0-9]/);
  assert.doesNotMatch(combined, /chapter-2/);
});

test("lesson content exposes all Module 1 cards and rewrites local images", async () => {
  const lesson = await fileText("lesson.html");
  const imageFiles = await readdir(path.join(outputRoot, "assets", "images"));

  const cardCount = (lesson.match(/class="[^"]*\blesson-card\b/g) ?? []).length;
  assert.equal(cardCount, 22);
  assert.equal(imageFiles.length, 19);

  assert.match(lesson, /assets\/images\/module-1-image-01\.jpg/);
  assert.doesNotMatch(lesson, /\.\.\/\.\.\/references\/forensics/);
  assert.doesNotMatch(lesson, /%D1%81ontent/i);
});

test("quiz data is Module 1 only and supports browser scoring", async () => {
  const dataSource = await fileText("module-1-data.js");
  const scriptSource = await fileText("module-1.js");

  assert.match(dataSource, /const MODULE_1_DATA = /);
  assert.match(dataSource, /"id": "quiz-1"/);
  assert.doesNotMatch(dataSource, /"id": "quiz-2"/);

  const questionCount = (dataSource.match(/"prompt":/g) ?? []).length;
  assert.ok(questionCount > 0, "quiz questions should be serialized");

  assert.match(scriptSource, /calculateScore/);
  assert.match(scriptSource, /Try Again/);
  assert.match(scriptSource, /correct/);
});

test("runtime files do not retain storage, hosted, or lock behavior", async () => {
  const runtimeFiles = [
    "index.html",
    "module-1.js",
    "module-1-data.js",
    "lesson.html",
    "assignment/module1assignment.html",
    "assignment/module1assignment.bundle.js",
    "assignment/forensic-assignment-theme.css",
    "assignment/forensic-assignment-print.js"
  ];
  const combined = (await Promise.all(runtimeFiles.map((file) => fileText(file)))).join("\n");

  for (const forbidden of [
    /Firebase/i,
    /google-hosted-bridge/i,
    /hosted-runtime-content/i,
    /localStorage/i,
    /sessionStorage/i,
    /Mark Complete/i,
    /locked-card/i,
    /data-progress-state/i
  ]) {
    assert.doesNotMatch(combined, forbidden);
  }
});

test("static tester keeps the original course-shell visual character", async () => {
  const index = await fileText("index.html");
  const styles = await fileText("styles.css");
  const script = await fileText("module-1.js");

  assert.match(index, /class="brand-title"/);
  assert.match(index, /class="brand-rule"/);
  assert.match(index, /class="menu-button"/);
  assert.match(script, /course-home-card/);
  assert.match(script, /module-card/);
  assert.match(styles, /repeating-linear-gradient/);
  assert.match(styles, /grid-template-columns: 252px minmax/);
  assert.match(styles, /\.course-home-card/);
  assert.match(styles, /\.module-card/);
  assert.match(styles, /\.module-badge/);
  assert.match(styles, /box-shadow: 0 8px 24px/);
});
