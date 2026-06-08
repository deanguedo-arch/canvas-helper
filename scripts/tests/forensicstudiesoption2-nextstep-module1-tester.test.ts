import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve("projects", "forensicstudiesoption2-nextstep-test");
const workspaceDir = path.join(projectRoot, "workspace");
const exportDir = path.join(projectRoot, "exports", "google-hosted");

async function readWorkspace(relativePath: string) {
  return readFile(path.join(workspaceDir, relativePath), "utf8");
}

async function readExport(relativePath: string) {
  return readFile(path.join(exportDir, relativePath), "utf8");
}

test("next-step forensic tester workspace is scoped to Module 1 only", async () => {
  const courseData = await readWorkspace("course-data.js");

  assert.match(courseData, /"id": "chapter-1"/);
  assert.match(courseData, /"id": "quiz-1"/);
  assert.match(courseData, /"id": "assignment-1"/);

  for (const forbidden of [
    /"id": "chapter-2"/,
    /"id": "chapter-3"/,
    /"id": "chapter-4"/,
    /"id": "chapter-5"/,
    /"id": "chapter-6"/,
    /"id": "chapter-7"/,
    /"id": "chapter-8"/,
    /"id": "chapter-9"/,
    /"id": "quiz-2"/,
    /"id": "assignment-2"/,
    /Final Exam/i
  ]) {
    assert.doesNotMatch(courseData, forbidden);
  }
});

test("next-step forensic tester removes sign-in, locking, and browser save behavior", async () => {
  const workspaceCombined = [
    await readWorkspace("index.html"),
    await readWorkspace("main.js"),
    await readWorkspace("course-data.js")
  ].join("\n");

  for (const forbidden of [
    /localStorage/,
    /sessionStorage/,
    /Save now/i,
    /Sign in/i,
    /Google sign-in/i,
    /Sign in with Google/i,
    /sync progress/i,
    /locked-card/,
    /Locked until/i,
    /data-open-(?:chapter|quiz|assignment)="[^"]+"\s+disabled/
  ]) {
    assert.doesNotMatch(workspaceCombined, forbidden);
  }
});

test("next-step forensic tester routes tabs directly to Module 1 surfaces", async () => {
  const mainSource = await readWorkspace("main.js");

  assert.match(mainSource, /function getDefaultActiveIdForTab\(tab\)/);
  assert.match(mainSource, /activeId:\s*getDefaultActiveIdForTab\("chapters"\)/);
  assert.match(mainSource, /state\.activeId\s*=\s*getDefaultActiveIdForTab\(state\.tab\)/);
  assert.match(mainSource, /state\.activeId\s*=\s*getDefaultActiveIdForTab\(tab\)/);
});

test("next-step forensic tester deployed export has no hosted bridge or save controls", async () => {
  const exportCombined = [
    await readExport("index.html"),
    await readExport("main.js"),
    await readExport("course-data.js")
  ].join("\n");

  assert.doesNotMatch(exportCombined, /google-hosted-bridge\.js/);
  assert.doesNotMatch(exportCombined, /canvas-helper-google-hosted/);
  assert.doesNotMatch(exportCombined, /localStorage|sessionStorage/);
  assert.doesNotMatch(exportCombined, /Sign in|Save now|sync progress/i);
  assert.doesNotMatch(exportCombined, /locked-card|Locked until/);
  assert.doesNotMatch(exportCombined, /data-open-(?:chapter|quiz|assignment)="[^"]+"\s+disabled/);
  assert.doesNotMatch(exportCombined, /"id": "chapter-2"/);
});
