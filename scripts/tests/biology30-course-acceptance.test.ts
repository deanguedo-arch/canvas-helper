import assert from "node:assert/strict";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  BIOLOGY30_COURSE_ACCEPTANCE_CATEGORIES,
  recordBiology30CourseAcceptance,
  type Biology30CourseAcceptanceV1
} from "../lib/biology30-course/v1/acceptance.js";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const projects = ["biology30-unit-b", "biology30-unit-c", "biology30-unit-d"] as const;
const recommendedScores = {
  academic: 24,
  coherence: 19,
  visual: 14,
  practice: 15,
  accessibility: 9,
  runtime: 10,
  maintainability: 4
};

async function exists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function buildAuthorizationText(buildSha256: string, scores: Record<string, number>, totalScore: number) {
  return [
    `I reviewed and accept the exact blocked candidate build ${buildSha256}.`,
    ...BIOLOGY30_COURSE_ACCEPTANCE_CATEGORIES.map((category) => `${category.shortLabel} ${scores[category.id]}/${category.points};`),
    `Total ${totalScore}/100. No binary blocker found: yes. Decision: accept the exact candidate.`
  ].join("\n");
}

function acceptanceRecord(input: {
  project: string;
  buildSha256: string;
  scores?: Record<string, number>;
  totalScore?: number;
  binaryBlockers?: string[];
}): Biology30CourseAcceptanceV1 {
  const scores = input.scores ?? recommendedScores;
  const totalScore = input.totalScore ?? Object.values(scores).reduce((total, score) => total + score, 0);
  return {
    schemaVersion: 1,
    projectSlug: input.project,
    acceptedBuildSha256: input.buildSha256,
    reviewer: "Teacher acceptance fixture",
    reviewedAt: "2026-08-31T05:00:00.000Z",
    categoryScores: scores,
    totalScore,
    binaryBlockers: input.binaryBlockers ?? [],
    decision: "accepted",
    scoredBy: "user",
    userConfirmed: true,
    authorizationSource: "explicit-user-message",
    authorizationText: buildAuthorizationText(input.buildSha256, scores, totalScore),
    statement: `I accept ${input.project} exact build ${input.buildSha256} at ${totalScore}/100.`
  };
}

async function createAcceptanceFixture(project: typeof projects[number]) {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), `${project}-acceptance-`));
  const fixtureProjectDir = path.join(fixtureRoot, "projects", project);
  await mkdir(path.dirname(fixtureProjectDir), { recursive: true });
  await cp(path.join(repoRoot, "projects", project), fixtureProjectDir, { recursive: true });
  const metaDir = path.join(fixtureProjectDir, "meta");
  await rm(path.join(metaDir, "human-acceptance.json"), { force: true });
  const candidate = await readJson<{ buildSha256: string }>(path.join(metaDir, "production-candidate.json"));
  const submissionPath = path.join(fixtureRoot, `${project}-acceptance-submission.json`);
  await writeJson(submissionPath, acceptanceRecord({ project, buildSha256: candidate.buildSha256 }));
  return { fixtureRoot, fixtureProjectDir, metaDir, submissionPath, buildSha256: candidate.buildSha256 };
}

async function assertNoTransactionDebris(fixtureRoot: string, project: string) {
  const entries = await readdir(path.join(fixtureRoot, "projects"));
  assert.deepEqual(entries, [project]);
}

test("exact 95-point B-D decisions record human acceptance without authorizing promotion or export", async (context) => {
  const fixtureRoots: string[] = [];
  context.after(async () => {
    await Promise.all(fixtureRoots.map((fixtureRoot) => rm(fixtureRoot, { recursive: true, force: true })));
  });

  for (const project of projects) {
    const fixture = await createAcceptanceFixture(project);
    fixtureRoots.push(fixture.fixtureRoot);
    const projectBefore = await readFile(path.join(fixture.metaDir, "project.json"), "utf8");
    const result = await recordBiology30CourseAcceptance({
      repoRoot: fixture.fixtureRoot,
      project,
      acceptancePath: fixture.submissionPath
    });

    assert.equal(result.acceptedBuildSha256, fixture.buildSha256);
    assert.equal(result.totalScore, 95);
    assert.equal(result.promotionAuthorized, false);
    assert.equal(result.exportAuthorized, false);
    assert.equal(await readFile(path.join(fixture.metaDir, "project.json"), "utf8"), projectBefore);

    const canonical = await readJson<Record<string, unknown>>(path.join(fixture.metaDir, "human-acceptance.json"));
    assert.equal(canonical.acceptedBuildSha256, fixture.buildSha256);
    assert.equal(canonical.totalScore, 95);
    assert.equal(canonical.promotionAuthorized, false);
    assert.equal(canonical.studioEditingAuthorized, false);
    assert.equal(canonical.exportAuthorized, false);
    assert.equal(canonical.brightspaceUploadAuthorized, false);
    assert.equal(canonical.publicationAuthorized, false);

    const matrix = await readJson<{
      status: string;
      categories: Array<{ id: string; score: number }>;
      humanDecision: string;
      humanTotal: number;
      automaticPromotion: boolean;
    }>(path.join(fixture.metaDir, "acceptance-matrix.json"));
    assert.equal(matrix.status, "human-accepted-awaiting-promotion-authorization");
    assert.deepEqual(Object.fromEntries(matrix.categories.map((category) => [category.id, category.score])), recommendedScores);
    assert.equal(matrix.humanDecision, "accepted");
    assert.equal(matrix.humanTotal, 95);
    assert.equal(matrix.automaticPromotion, false);

    const quality = await readJson<Record<string, unknown>>(path.join(fixture.metaDir, "quality-readiness-evidence.json"));
    assert.equal(quality.status, "human-accepted-awaiting-promotion-authorization");
    assert.equal(quality.humanTotal, 95);
    assert.equal(quality.humanDecision, "accepted");
    assert.equal(quality.promotionAuthorized, false);
    assert.equal(quality.exportAuthorized, false);

    const review = await readJson<Record<string, unknown>>(path.join(fixture.metaDir, "production-review.json"));
    assert.equal(review.status, "human-accepted-awaiting-promotion-authorization");
    assert.equal(review.decision, "accepted");
    assert.equal(review.promotionAuthorized, false);
    assert.equal(review.exportAuthorized, false);

    const candidate = await readJson<Record<string, unknown>>(path.join(fixture.metaDir, "production-candidate.json"));
    assert.equal(candidate.status, "blocked-human-accepted-awaiting-promotion-authorization");
    assert.equal(candidate.studioEditingEnabled, false);
    assert.equal(candidate.exportEnabled, false);
    await assertNoTransactionDebris(fixture.fixtureRoot, project);

    await assert.rejects(
      recordBiology30CourseAcceptance({
        repoRoot: fixture.fixtureRoot,
        project,
        acceptancePath: fixture.submissionPath
      }),
      /already has a canonical human-acceptance record/
    );
  }
});

test("acceptance recording rejects stale, sub-95, incomplete, and blocker-bearing decisions without writes", async (context) => {
  const fixture = await createAcceptanceFixture("biology30-unit-b");
  context.after(() => rm(fixture.fixtureRoot, { recursive: true, force: true }));
  const protectedFiles = [
    "acceptance-matrix.json",
    "quality-readiness-evidence.json",
    "production-review.json",
    "production-candidate.json"
  ];
  const before = new Map(await Promise.all(protectedFiles.map(async (name) => [name, await readFile(path.join(fixture.metaDir, name), "utf8")] as const)));

  const stale = acceptanceRecord({ project: "biology30-unit-b", buildSha256: "f".repeat(64) });
  await writeJson(fixture.submissionPath, stale);
  await assert.rejects(
    recordBiology30CourseAcceptance({ repoRoot: fixture.fixtureRoot, project: "biology30-unit-b", acceptancePath: fixture.submissionPath }),
    /stale/
  );

  const scores94 = { ...recommendedScores, coherence: 18 };
  await writeJson(fixture.submissionPath, acceptanceRecord({
    project: "biology30-unit-b",
    buildSha256: fixture.buildSha256,
    scores: scores94,
    totalScore: 94
  }));
  await assert.rejects(
    recordBiology30CourseAcceptance({ repoRoot: fixture.fixtureRoot, project: "biology30-unit-b", acceptancePath: fixture.submissionPath }),
    /at least 95/
  );

  await writeJson(fixture.submissionPath, acceptanceRecord({
    project: "biology30-unit-b",
    buildSha256: fixture.buildSha256,
    binaryBlockers: ["factual error"]
  }));
  await assert.rejects(
    recordBiology30CourseAcceptance({ repoRoot: fixture.fixtureRoot, project: "biology30-unit-b", acceptancePath: fixture.submissionPath }),
    /binary blocker/
  );

  const incomplete = acceptanceRecord({ project: "biology30-unit-b", buildSha256: fixture.buildSha256 });
  incomplete.authorizationText = `I accept ${fixture.buildSha256} at 95/100.`;
  await writeJson(fixture.submissionPath, incomplete);
  await assert.rejects(
    recordBiology30CourseAcceptance({ repoRoot: fixture.fixtureRoot, project: "biology30-unit-b", acceptancePath: fixture.submissionPath }),
    /must state the Academic score/
  );

  assert.equal(await exists(path.join(fixture.metaDir, "human-acceptance.json")), false);
  for (const name of protectedFiles) {
    assert.equal(await readFile(path.join(fixture.metaDir, name), "utf8"), before.get(name));
  }
  await assertNoTransactionDebris(fixture.fixtureRoot, "biology30-unit-b");
});

test("a mid-commit failure rolls every acceptance file back and permits a clean retry", async (context) => {
  const fixture = await createAcceptanceFixture("biology30-unit-d");
  context.after(() => rm(fixture.fixtureRoot, { recursive: true, force: true }));
  const protectedFiles = [
    "acceptance-matrix.json",
    "quality-readiness-evidence.json",
    "production-review.json",
    "production-candidate.json"
  ];
  const before = new Map(await Promise.all(protectedFiles.map(async (name) => [name, await readFile(path.join(fixture.metaDir, name), "utf8")] as const)));

  await assert.rejects(
    recordBiology30CourseAcceptance({
      repoRoot: fixture.fixtureRoot,
      project: "biology30-unit-d",
      acceptancePath: fixture.submissionPath,
      testHooks: {
        beforeCommit: (_targetPath, index) => {
          if (index === 3) throw new Error("simulated acceptance commit failure");
        }
      }
    }),
    /simulated acceptance commit failure/
  );

  assert.equal(await exists(path.join(fixture.metaDir, "human-acceptance.json")), false);
  for (const name of protectedFiles) {
    assert.equal(await readFile(path.join(fixture.metaDir, name), "utf8"), before.get(name));
  }
  await assertNoTransactionDebris(fixture.fixtureRoot, "biology30-unit-d");

  const result = await recordBiology30CourseAcceptance({
    repoRoot: fixture.fixtureRoot,
    project: "biology30-unit-d",
    acceptancePath: fixture.submissionPath
  });
  assert.equal(result.totalScore, 95);
  assert.equal(await exists(path.join(fixture.metaDir, "human-acceptance.json")), true);
  await assertNoTransactionDebris(fixture.fixtureRoot, "biology30-unit-d");
});

test("the acceptance recorder refuses Unit A and its own canonical target", async (context) => {
  const fixture = await createAcceptanceFixture("biology30-unit-b");
  context.after(() => rm(fixture.fixtureRoot, { recursive: true, force: true }));
  await assert.rejects(
    recordBiology30CourseAcceptance({ repoRoot: fixture.fixtureRoot, project: "biology30-unit-a", acceptancePath: fixture.submissionPath }),
    /supports only biology30-unit-b/
  );
  await assert.rejects(
    recordBiology30CourseAcceptance({
      repoRoot: fixture.fixtureRoot,
      project: "biology30-unit-b",
      acceptancePath: path.join(fixture.metaDir, "human-acceptance.json")
    }),
    /separate acceptance submission file/
  );
});
