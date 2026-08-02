import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { repoRoot } from "../lib/paths.js";

const projectSlug = "how-assessment-works";
const projectRoot = path.join(repoRoot, "projects", projectSlug);
const workspaceRoot = path.join(projectRoot, "workspace");
const manifestPath = path.join(projectRoot, "meta", "project.json");
const e2eContractPath = path.join(projectRoot, "meta", "e2e-contract.json");
const indexPath = path.join(workspaceRoot, "index.html");
const stylesPath = path.join(workspaceRoot, "styles.css");
const mainPath = path.join(workspaceRoot, "main.js");
const storageKey = "canvas-helper:how-assessment-works:state:v1";

async function readWorkspace() {
  const [manifestSource, e2eContractSource, indexSource, stylesSource, mainSource] =
    await Promise.all([
      readFile(manifestPath, "utf8"),
      readFile(e2eContractPath, "utf8"),
      readFile(indexPath, "utf8"),
      readFile(stylesPath, "utf8"),
      readFile(mainPath, "utf8")
    ]);

  return {
    manifestSource,
    manifest: JSON.parse(manifestSource) as {
      slug: string;
      title: string;
      migrationState: string;
      projectType: string;
      preferredWorkflows: string[];
      canonicalEntry: string;
      canonicalSources: string[];
      authoringStatus: string;
      exportTargets: Array<{ target: string; enabled: boolean }>;
      googleHosted?: { trackedStorageKeys?: string[] };
    },
    e2eContract: JSON.parse(e2eContractSource) as {
      projectSlug: string;
    },
    indexSource,
    stylesSource,
    mainSource
  };
}

function assertAppearsInOrder(source: string, values: string[]) {
  let cursor = -1;
  for (const value of values) {
    const next = source.indexOf(value, cursor + 1);
    assert.ok(next > cursor, `expected "${value}" after the preceding learner step`);
    cursor = next;
  }
}

test("How Assessment Works declares the standalone learner workspace as canonical", async () => {
  const { manifest, e2eContract, indexSource } = await readWorkspace();

  assert.equal(manifest.slug, projectSlug);
  assert.equal(manifest.title, "How Assessment Works");
  assert.equal(manifest.migrationState, "migrated");
  assert.equal(manifest.projectType, "generated-course");
  assert.deepEqual(manifest.preferredWorkflows, ["generated-course"]);
  assert.equal(manifest.authoringStatus, "ready-for-export");
  assert.equal(manifest.canonicalEntry, indexPath);
  assert.deepEqual(manifest.canonicalSources, [indexPath, stylesPath, mainPath]);
  assert.ok(
    manifest.exportTargets.some(({ target, enabled }) => target === "scorm" && enabled),
    "the learner presentation should remain enabled for SCORM export"
  );
  assert.deepEqual(manifest.googleHosted?.trackedStorageKeys, [storageKey]);
  assert.equal(e2eContract.projectSlug, projectSlug);

  assert.match(indexSource, /<title>How Assessment Works<\/title>/);
  assert.equal(indexSource.match(/<h1\b/g)?.length, 1, "the learner page should have one H1");
  assert.match(indexSource, /<h1>How Assessment Works<\/h1>/);
  assert.doesNotMatch(indexSource, /<(?:aside|nav)\b/i);
  assert.doesNotMatch(indexSource, /data-(?:course-shell|module-nav|sidebar)/i);
});

test("How Assessment Works presents four learner beats and adjustable example weights", async () => {
  const { indexSource, mainSource } = await readWorkspace();

  assertAppearsInOrder(indexSource, [
    "Your assessment journey",
    "Product, Process, and Defence",
    "What counts as evidence?",
    "Readiness checkpoints",
    "After you submit: Defence"
  ]);
  assertAppearsInOrder(indexSource, [
    "<strong>Learn</strong>",
    "<strong>Practise</strong>",
    "<strong>Check readiness</strong>",
    "<strong>Create</strong>",
    "<strong>Submit</strong>",
    "<strong>Explain</strong>",
    "<strong>Revise if needed</strong>"
  ]);

  for (const testId of [
    "assessment-root",
    "assessment-progress",
    "score-calculator",
    "evidence-activity",
    "readiness-scenario",
    "completion-checklist",
    "completion-status"
  ]) {
    assert.match(indexSource, new RegExp(`data-testid="${testId}"`));
  }

  assert.match(indexSource, /The three weights\s+always total 100%/);
  assert.match(indexSource, /Process can be set from 0–25%/);
  assert.match(indexSource, /actual weights for your task/i);
  assert.match(indexSource, /After you submit the requested Product and Process evidence/);
  assert.match(indexSource, /<progress id="unit-progress" value="0" max="3">/);

  const rangeInputs = [...indexSource.matchAll(/<input\b[\s\S]*?\/>/g)]
    .map(([input]) => input)
    .filter((input) => /\btype="range"/.test(input));
  assert.equal(rangeInputs.length, 3, "all three assessment weights should be adjustable");
  for (const [pillar, input, maximum, value] of [
    ["product", rangeInputs[0], "100", "50"],
    ["process", rangeInputs[1], "25", "25"],
    ["defence", rangeInputs[2], "100", "25"]
  ] as const) {
    assert.match(input, new RegExp(`id="${pillar}-weight"`));
    assert.match(input, new RegExp(`max="${maximum}"`));
    assert.match(input, new RegExp(`value="${value}"`));
  }
  assert.match(indexSource, /id="weight-status" aria-live="polite"/);
  assert.match(indexSource, /Total: 100%\./);

  const numberInputs = [...indexSource.matchAll(/<input\b[\s\S]*?\/>/g)]
    .map(([input]) => input)
    .filter((input) => /\btype="number"/.test(input));
  assert.equal(numberInputs.length, 3, "only the three sample marks should be numeric controls");
  for (const [pillar, input] of [
    ["product", numberInputs[0]],
    ["process", numberInputs[1]],
    ["defence", numberInputs[2]]
  ] as const) {
    assert.match(input, new RegExp(`id="${pillar}-mark"`));
    assert.match(input, new RegExp(`name="${pillar}"`));
    assert.doesNotMatch(input, /weight/i);
  }

  for (const format of ["Short conversation", "Written response", "Recorded explanation"]) {
    assert.match(indexSource, new RegExp(`<h3>${format}</h3>`));
  }
  assert.match(indexSource, /Accommodations and\s+alternate ways to respond remain available/);

  for (const [testId, sourceKey, source] of [
    ["inspire-video", "inspire", "./assets/media/inspire-the-work.mp4"],
    ["process-checkin-video", "checkin", "./assets/media/the-process-check-in.mp4"]
  ]) {
    assert.match(
      indexSource,
      new RegExp(
        `<video[\\s\\S]*?data-testid="${testId}"[\\s\\S]*?controls[\\s\\S]*?preload="metadata"[\\s\\S]*?data-video-source="${sourceKey}"`
      )
    );
    assert.match(mainSource, new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(mainSource, /hydrateLocalVideos\(\)/);
  assert.match(indexSource, /The video is optional/);
});

test("How Assessment Works has no external runtime or administration-facing learner language", async () => {
  const { indexSource, stylesSource, mainSource } = await readWorkspace();
  const learnerRuntime = `${indexSource}\n${stylesSource}\n${mainSource}`;

  const runtimeReferences = [
    ...indexSource.matchAll(/\b(?:href|src)="([^"]+)"/g)
  ].map((match) => match[1]);
  assert.ok(runtimeReferences.includes("./styles.css"));
  assert.ok(runtimeReferences.includes("./main.js"));
  assert.ok(
    runtimeReferences.every(
      (reference) => reference.startsWith("./") || reference.startsWith("#")
    ),
    "every runtime reference should remain local to the package"
  );
  assert.doesNotMatch(learnerRuntime, /\bhttps?:\/\//i);
  assert.doesNotMatch(learnerRuntime, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
  assert.doesNotMatch(learnerRuntime, /fonts\.googleapis|cdn\.tailwindcss|material-symbols/i);
  assert.doesNotMatch(indexSource, /<(?:iframe|img|audio|source)\b/i);
  assert.equal(indexSource.match(/<video\b/g)?.length, 2);

  assert.doesNotMatch(learnerRuntime, /\bAI\b/i);
  assert.doesNotMatch(learnerRuntime, /\b(?:staff|board|district)\b/i);
  assert.doesNotMatch(learnerRuntime, /\bgatekeep(?:ing|er|ers)?\b/i);
  assert.doesNotMatch(indexSource, /\b(?:validated|failed)\b/i);
  assert.match(indexSource, /\bready\b/i);
  assert.match(indexSource, /\bnot ready yet\b/i);
});

test("How Assessment Works persists compact state and completes only through its three gates", async () => {
  const { indexSource, mainSource } = await readWorkspace();

  assert.match(mainSource, new RegExp(storageKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(mainSource, /window\.localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(mainSource, /window\.localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(state\)\)/);
  for (const stateField of [
    "theme",
    "lastStep",
    "marks",
    "weights",
    "evidenceAnswers",
    "readinessAnswers",
    "checklist",
    "completedAt"
  ]) {
    assert.match(mainSource, new RegExp(`\\b${stateField}\\b`));
  }

  assert.match(
    mainSource,
    /return state\.evidenceCompleted && state\.readinessCompleted && checklistIsComplete\(\);/
  );
  assert.match(mainSource, /elements\.finishUnit\.disabled = !gatesComplete \|\| Boolean\(state\.completedAt\);/);
  assert.match(mainSource, /state\.completedAt = new Date\(\)\.toISOString\(\);/);
  assert.match(mainSource, /window\.__canvasHelperScorm/);
  assert.match(mainSource, /bridge\.markCompleted\(\)/);
  assert.match(mainSource, /window\.addEventListener\("canvas-helper:scorm-ready"/);
  assert.match(mainSource, /bridge\.saveAndExit\(\)/);
  assert.doesNotMatch(mainSource, /cmi\.(?:score|success_status)|markPassed|setScore/);
  assert.match(mainSource, /process:\s*25/);
  assert.match(
    mainSource,
    /process:\s*\(state\.marks\.process \* state\.weights\.process\) \/ 100/
  );

  assert.match(indexSource, /id="finish-unit" type="submit" disabled/);
  assert.match(indexSource, /Save progress/);
});
