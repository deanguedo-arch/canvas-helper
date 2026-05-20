import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import { listProjectSlugs, readStudioProjectBundle } from "../lib/projects.js";

const projectDir = path.resolve("projects", "mental-health-wellness");
const workspaceDir = path.resolve(projectDir, "workspace");
const projectJsonPath = path.resolve(projectDir, "meta", "project.json");
const auditPath = path.resolve(projectDir, "meta", "source-zip-audit.json");
const indexPath = path.resolve(workspaceDir, "index.html");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const moduleCssPath = path.resolve(workspaceDir, "content", "module-index.css");

type CourseData = {
  course?: Record<string, unknown>;
  chapters?: Array<Record<string, unknown>>;
  quizzes?: Array<Record<string, unknown>>;
  assignments?: Array<Record<string, unknown>>;
  library?: Array<Record<string, unknown>>;
};

function loadCourseData(source: string): CourseData {
  const context = { window: {} as { MENTAL_HEALTH_WELLNESS_DATA?: CourseData } };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.window.MENTAL_HEALTH_WELLNESS_DATA ?? {};
}

test("mental health wellness project metadata and shell files exist", async () => {
  await access(projectJsonPath);
  await access(auditPath);
  await access(indexPath);
  await access(mainPath);
  await access(dataPath);
  await access(moduleCssPath);
  await access(path.resolve(workspaceDir, "content", "chapter-1", "index.html"));
  await access(path.resolve(workspaceDir, "content", "chapter-6", "index.html"));

  const [projectJsonSource, indexSource] = await Promise.all([
    readFile(projectJsonPath, "utf8"),
    readFile(indexPath, "utf8")
  ]);
  const manifest = JSON.parse(projectJsonSource) as {
    slug: string;
    migrationState: string;
    projectType: string;
    preferredWorkflows: string[];
    canonicalEntry: string;
    canonicalSources: string[];
    authoringStatus: string;
  };

  assert.equal(manifest.slug, "mental-health-wellness");
  assert.equal(manifest.migrationState, "migrated");
  assert.equal(manifest.projectType, "conversion");
  assert.deepEqual(manifest.preferredWorkflows, ["conversion"]);
  assert.equal(manifest.authoringStatus, "active");
  assert.match(manifest.canonicalEntry, /projects[\\/]mental-health-wellness[\\/]workspace[\\/]index\.html$/);
  assert.ok(manifest.canonicalSources.some((entry) => /workspace[\\/]course-data\.js$/.test(entry)));

  assert.match(indexSource, /<title>Mental Health (?:&|&amp;) Wellness<\/title>/);
  assert.match(indexSource, /data-project-slug="mental-health-wellness"/);
  assert.match(indexSource, /Mental Health (?:&|&amp;) Wellness/);
  assert.match(indexSource, /Content-only Brightspace conversion/);
  assert.match(indexSource, /Completed content/);
  assert.doesNotMatch(indexSource, /Forensics 25/i);
  assert.doesNotMatch(indexSource, /Forensic Studies 25/i);
});

test("mental health wellness course data is content-only and keeps source module order", async () => {
  const dataSource = await readFile(dataPath, "utf8");
  const data = loadCourseData(dataSource);

  assert.equal(data.course?.title, "Mental Health & Wellness");
  assert.equal(data.course?.enableLibrary, false);
  assert.equal(data.chapters?.length, 6);
  assert.deepEqual(
    Array.from(data.chapters ?? [], (chapter) => chapter.title),
    [
      "Unit 1: What is Mental Health?",
      "Unit 2: Stress, Coping, and the Body",
      "Unit 3: Mental Illness",
      "Unit 4: Treatments",
      "Unit 5: Community Resources",
      "Unit 6: Self Care"
    ]
  );

  for (const chapter of data.chapters ?? []) {
    assert.match(String(chapter.contentPath), /^\.\/content\/chapter-\d+\/index\.html$/);
    assert.ok(Array.isArray(chapter.componentIds), `expected componentIds for ${chapter.id}`);
    assert.ok(Number(chapter.componentCount) > 0, `expected content components for ${chapter.id}`);
  }

  assert.deepEqual(Array.from(data.quizzes ?? []), []);
  assert.deepEqual(Array.from(data.assignments ?? []), []);
  assert.deepEqual(Array.from(data.library ?? []), []);
  assert.doesNotMatch(dataSource, /Course Information/);
  assert.doesNotMatch(dataSource, /Unit \d Assignment/);
  assert.doesNotMatch(dataSource, /Assignment Submission/);
  assert.doesNotMatch(dataSource, /KEEP HIDDEN|Teacher Materials/i);
});

test("mental health wellness shell is adapted from forensics without assessment placeholders", async () => {
  const mainSource = await readFile(mainPath, "utf8");

  assert.match(mainSource, /MENTAL_HEALTH_WELLNESS_DATA/);
  assert.match(mainSource, /mental-health-wellness\.progress/);
  assert.match(mainSource, /mental-health-wellness\.ui/);
  assert.match(mainSource, /mental-health-wellness-module-progress-ready/);
  assert.match(mainSource, /mental-health-wellness-module-progress-update/);
  assert.match(mainSource, /mental-health-wellness-module-progress-sync/);
  assert.match(mainSource, /function hasQuizzes\(/);
  assert.match(mainSource, /function hasAssignments\(/);
  assert.match(mainSource, /function getCompletedContentCount\(/);
  assert.match(mainSource, /totalQuizzes \? Math\.round\(\(completedQuizzes \/ totalQuizzes\) \* 100\) : contentPercent/);
  assert.match(mainSource, /refs\.tabQuizzes\.hidden = !hasQuizzes\(\)/);
  assert.match(mainSource, /refs\.tabAssignments\.hidden = !hasAssignments\(\)/);
  assert.match(mainSource, /return data\.assignments \|\| \[\]/);
  assert.doesNotMatch(mainSource, /FORENSIC_STUDIES_OPTION2_DATA/);
  assert.doesNotMatch(mainSource, /forensicstudiesoption2/);
  assert.doesNotMatch(mainSource, /ASSIGNMENT_OVERRIDES/);
  assert.doesNotMatch(mainSource, /Assignment content has not been authored yet/);
  assert.doesNotMatch(mainSource, /Forensics 25/i);
  assert.doesNotMatch(mainSource, /Forensic Studies/i);
});

test("mental health wellness chapter pages use content-only module progression", async () => {
  const [chapterOneSource, chapterSixSource, moduleCssSource] = await Promise.all([
    readFile(path.resolve(workspaceDir, "content", "chapter-1", "index.html"), "utf8"),
    readFile(path.resolve(workspaceDir, "content", "chapter-6", "index.html"), "utf8"),
    readFile(moduleCssPath, "utf8")
  ]);
  const combined = `${chapterOneSource}\n${chapterSixSource}`;

  assert.match(chapterOneSource, /Unit 1: What is Mental Health\? \| Mental Health (?:&|&amp;) Wellness/);
  assert.match(combined, /data-project-slug="mental-health-wellness"/);
  assert.match(combined, /data-module-component-id=/);
  assert.match(combined, /Mark Complete/);
  assert.match(combined, /mental-health-wellness-module-progress-ready/);
  assert.match(combined, /mental-health-wellness-module-progress-update/);
  assert.match(combined, /Complete this component to unlock the next lesson card\./);
  assert.doesNotMatch(combined, /Course Information/);
  assert.doesNotMatch(combined, /source-file-link/);
  assert.doesNotMatch(combined, /source-link-row/);
  assert.doesNotMatch(combined, /Original package path/);
  assert.match(moduleCssSource, /\.lesson-card\[data-progress-state="active"\]/);
  assert.match(moduleCssSource, /\.lesson-card\[data-progress-state="locked"\]/);
  assert.match(moduleCssSource, /#1d4ed8|#2563eb/);
  assert.doesNotMatch(combined, /Forensic/i);
  assert.doesNotMatch(combined, /quiz and assignment/i);
  assert.doesNotMatch(combined, /Unit \d Assignment/);
  assert.doesNotMatch(combined, /Assignment Submission|KEEP HIDDEN|Teacher Materials/i);
});

test("mental health wellness audit records excluded assessment and teacher material", async () => {
  const audit = JSON.parse(await readFile(auditPath, "utf8")) as {
    includedChapters: Array<{ title: string; componentCount: number }>;
    skippedTopLevelModules: Array<{ title: string; reason: string }>;
    skippedAssessmentItems: Array<{ title: string; reason: string }>;
    unresolvedAssets: Array<{ src: string }>;
  };

  assert.equal(audit.includedChapters.length, 6);
  assert.ok(audit.includedChapters.every((entry) => entry.componentCount > 0));
  assert.ok(audit.skippedTopLevelModules.some((entry) => entry.title === "Course Information"));
  assert.ok(audit.skippedTopLevelModules.some((entry) => entry.title === "Assignment Submission"));
  assert.ok(audit.skippedTopLevelModules.some((entry) => /Teacher Materials/.test(entry.title)));
  assert.ok(audit.skippedAssessmentItems.some((entry) => entry.title === "Unit 1 Assignment"));
  assert.ok(audit.skippedAssessmentItems.some((entry) => entry.title === "Unit 6 Assignment"));
  assert.ok(Array.isArray(audit.unresolvedAssets));
});

test("mental health wellness is discoverable by the studio project picker", async () => {
  const slugs = await listProjectSlugs();
  assert.ok(slugs.includes("mental-health-wellness"));

  const bundle = await readStudioProjectBundle("mental-health-wellness");
  assert.equal(bundle.manifest.slug, "mental-health-wellness");
  assert.match(bundle.paths.workspaceEntrypoint, /projects[\\/]mental-health-wellness[\\/]workspace[\\/]index\.html$/);
});
