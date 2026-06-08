import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const workspace = path.join(repoRoot, "projects", "forensics-module1", "workspace");

test("module 1 package keeps the existing Forensics shell", async () => {
  const index = await readFile(path.join(workspace, "index.html"), "utf8");
  const main = await readFile(path.join(workspace, "main.jsx"), "utf8");

  assert.match(index, /Forensic Studies 25 - Course Player/);
  assert.match(main, /ForensicCoursePlayerPreviewRestored/);
  assert.match(main, /FORENSIC_THEME/);
  assert.match(main, /border-\[#b07a58\]/);
  assert.doesNotMatch(main, /course-home-card/);
  assert.match(main, /function buildReferenceUrl\(relativePath\) \{\s*return encodePath\(relativePath\);\s*\}/);
  assert.doesNotMatch(main, /\/preview\/references\/raw\/forensics/);
});

test("module 1 data contains only Introduction to Crime Scenes", async () => {
  const dataSource = await readFile(path.join(workspace, "d2l-map-data.js"), "utf8");

  assert.match(dataSource, /"moduleCount": 1/);
  assert.match(dataSource, /"title": "1 Introduction to Crime Scenes"/);
  assert.match(dataSource, /"title": "Introduction to Crime Scenes Assignment"/);
  assert.match(dataSource, /"title": "M1 Introduction to Crime Scenes Quiz"/);
  assert.doesNotMatch(dataSource, /"title": "2 Types of Evidence and Fingerprint Analysis"/);
  assert.doesNotMatch(dataSource, /"title": "FINAL EXAM"/);

  const main = await readFile(path.join(workspace, "main.jsx"), "utf8");
  assert.doesNotMatch(main, /2 Types of Evidence and Fingerprint Analysis/);
  assert.doesNotMatch(main, /M2 Types of Evidence and Fingerprint Analysis Assessment/);
});

test("module 1 package disables persisted browser state", async () => {
  const main = await readFile(path.join(workspace, "main.jsx"), "utf8");
  const bundle = await readFile(path.join(workspace, "assets", "module1assignment.bundle.js"), "utf8");

  assert.match(main, /function readForensicsWorkspaceState\(\) \{\s*return null;\s*\}/);
  assert.match(main, /function writeForensicsWorkspaceState\(_state\) \{\s*return;\s*\}/);
  assert.doesNotMatch(main, /window\.localStorage\.getItem\(FORENSICS_WORKSPACE_STATE_KEY\)/);
  assert.doesNotMatch(main, /window\.localStorage\.setItem\(FORENSICS_WORKSPACE_STATE_KEY/);
  assert.doesNotMatch(bundle, /window\.localStorage\.getItem\("forensics::module1assignment::v1"\)/);
  assert.doesNotMatch(bundle, /window\.localStorage\.setItem\("forensics::module1assignment::v1"/);
});

test("module 1 package includes only the module 1 assignment asset", async () => {
  const html = await readFile(path.join(workspace, "assets", "module1assignment.html"), "utf8");
  const bundle = await readFile(path.join(workspace, "assets", "module1assignment.bundle.js"), "utf8");

  assert.match(html, /module1assignment\.bundle\.js/);
  assert.match(bundle, /React/);

  await assert.rejects(() => readFile(path.join(workspace, "assets", "module2assignment.html"), "utf8"));
});

test("module 1 package includes local source files for the existing shell", async () => {
  const exportRoot = "D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)";
  const firstLesson = path.join(
    workspace,
    exportRoot,
    "сontent",
    "ib4f8e92c-f47c-458f-92db-bcfce642e0ac",
    "Content",
    "book_1408",
    "chapter_11885.html"
  );
  const quiz = path.join(
    workspace,
    exportRoot,
    "quiz",
    "ia861a9ae-dc07-4f6b-99b0-024595a223ae",
    "qti_b450f83a-7ca7-4007-af5b-164602338fea.xml"
  );

  assert.ok((await stat(firstLesson)).isFile());
  assert.ok((await stat(quiz)).isFile());
});
