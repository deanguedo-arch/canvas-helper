import assert from "node:assert/strict";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { load as loadHtml } from "cheerio";

import { hashBiologyWorkspaceTree } from "../lib/biology30-unit-a/v2/gate2-build.js";
import { hashProjectTree } from "../lib/biology30-unit-a/v2/intake.js";
import {
  prepareBiologyDirectWorkspaceHtml,
  promoteBiology30UnitAV2
} from "../lib/biology30-unit-a/v2/promote.js";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const projectSlug = "biology30-unit-a";
const projectDir = path.join(repoRoot, "projects", projectSlug);
const resourceDir = path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/v2");
const pilotSlugs = [
  "biology30-unit-a-class-2026-faithful",
  "biology30-unit-a-class-2026-optimized",
  "biology30-unit-a-system-2020-faithful",
  "biology30-unit-a-system-2020-optimized",
  "biology30-unit-a-synthesis"
];
const scores = {
  academic: 25,
  coherence: 20,
  visual: 15,
  practice: 15,
  accessibility: 10,
  runtime: 10,
  maintainability: 5
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

function stripPromotionAttributes(html: string) {
  return html
    .replace(/ data-canvas-helper-edit-key="biology30-unit-a-v1-\d{5}"/g, "")
    .replace(/ data-canvas-helper-studio-edit="annotation-only"/g, "");
}

async function createPromotionFixture() {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-promotion-"));
  const fixtureProjectDir = path.join(fixtureRoot, "projects", projectSlug);
  const fixtureResourceDir = path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot/v2");
  await mkdir(path.dirname(fixtureProjectDir), { recursive: true });
  await cp(projectDir, fixtureProjectDir, { recursive: true });
  await mkdir(path.dirname(fixtureResourceDir), { recursive: true });
  await cp(resourceDir, fixtureResourceDir, { recursive: true });

  const fixtureMetaDir = path.join(fixtureProjectDir, "meta");
  await rm(path.join(fixtureMetaDir, "human-acceptance.json"), { force: true });
  await rm(path.join(fixtureMetaDir, "gate-4-promotion.json"), { force: true });
  await writeFile(
    path.join(fixtureProjectDir, "workspace", "index.html"),
    stripPromotionAttributes(await readFile(path.join(fixtureProjectDir, "workspace", "index.html"), "utf8")),
    "utf8"
  );
  const workspace = await hashBiologyWorkspaceTree(path.join(fixtureProjectDir, "workspace"));
  const build = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "gate-2-build.json"));
  await writeJson(path.join(fixtureMetaDir, "gate-2-build.json"), { ...build, buildSha256: workspace.sha256 });
  const candidate = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "production-candidate.json"));
  await writeJson(path.join(fixtureMetaDir, "production-candidate.json"), {
    ...candidate,
    status: "blocked-awaiting-user",
    buildSha256: workspace.sha256,
    ownership: "proposal-only-v1",
    studioEditingEnabled: false,
    exportEnabled: false
  });
  const project = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "project.json"));
  await writeJson(path.join(fixtureMetaDir, "project.json"), {
    ...project,
    canonicalEntry: "projects/resources/biology30-unit-a-pilot/v2/production-contract.json",
    canonicalSources: ["projects/resources/biology30-unit-a-pilot/v2/production-contract.json"],
    generatedOutputs: ["projects/biology30-unit-a/workspace"],
    regenerateCommand: "npm run build:biology30-unit-a-v2 -- --project biology30-unit-a --strict",
    authoring: {
      driverId: "proposal-only-v1",
      familyId: "biology30-unit-a-pilot",
      sourceResourceIds: ["class-2026-27", "system-2020"],
      qualityProfile: "biology30-unit-a-production-v1",
      studioEditing: { enabled: false }
    },
    authoringStatus: "blocked",
    exportTargets: [
      { target: "html", enabled: false },
      { target: "scorm", enabled: false }
    ]
  });
  const review = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "gate-2-review.json"));
  await writeJson(path.join(fixtureMetaDir, "gate-2-review.json"), { ...review, buildSha256: workspace.sha256, status: "awaiting-user", decision: null });
  const matrix = await readJson<Record<string, unknown> & { categories: Array<Record<string, unknown>> }>(path.join(fixtureMetaDir, "gate-3-acceptance-matrix.json"));
  await writeJson(path.join(fixtureMetaDir, "gate-3-acceptance-matrix.json"), {
    ...matrix,
    buildSha256: workspace.sha256,
    status: "awaiting-human-score-and-decision",
    categories: matrix.categories.map((category) => ({ ...category, score: null })),
    humanDecision: null,
    automaticPromotion: false,
    automatedEvidencePass: true
  });
  const automated = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "gate-3-automated-review.json"));
  await writeJson(path.join(fixtureMetaDir, "gate-3-automated-review.json"), {
    ...automated,
    buildSha256: workspace.sha256,
    status: "automated-evidence-passed-awaiting-human-decision",
    promotionAuthorized: false
  });
  const visual = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "gate-3-visual-review.json"));
  await writeJson(path.join(fixtureMetaDir, "gate-3-visual-review.json"), {
    ...visual,
    buildSha256: workspace.sha256,
    binaryVisualBlockerFound: false,
    humanVisualAcceptance: null
  });
  const inspection = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "gate-3-figure-visual-inspection.json"));
  await writeJson(path.join(fixtureMetaDir, "gate-3-figure-visual-inspection.json"), {
    ...inspection,
    buildSha256: workspace.sha256,
    status: "passed",
    openedAllContactSheets: true,
    unresolvedFindings: []
  });

  const pilotHashes = [];
  for (const [index, slug] of pilotSlugs.entries()) {
    const pilotDir = path.join(fixtureRoot, "projects", slug);
    await mkdir(path.join(pilotDir, "meta"), { recursive: true });
    await mkdir(path.join(pilotDir, "workspace"), { recursive: true });
    await writeFile(path.join(pilotDir, "meta", "science-comparison.json"), "{}\n", "utf8");
    await writeFile(path.join(pilotDir, "workspace", "index.html"), `<p>${slug}</p>\n`, "utf8");
    const pilotManifest = {
      id: slug,
      slug,
      title: slug,
      sourcePath: "projects/resources/biology30-unit-a-pilot/resource-manifest.json",
      inputKind: "brightspace-zip",
      brightspaceTarget: "scorm",
      previewModes: ["workspace"],
      workspaceEntrypoint: `projects/${slug}/workspace/index.html`,
      rawEntrypoint: `projects/${slug}/raw/intake.json`,
      learningSource: "other",
      learningTrust: "curated",
      learningUpdatedAt: "2026-08-30T00:00:00.000Z",
      createdAt: "2026-08-30T00:00:00.000Z",
      updatedAt: "2026-08-30T00:00:00.000Z",
      migrationState: "migrated",
      projectType: "conversion",
      preferredWorkflows: ["conversion"],
      canonicalEntry: `projects/${slug}/meta/science-comparison.json`,
      canonicalSources: [`projects/${slug}/meta/science-comparison.json`],
      generatedOutputs: [],
      authoring: {
        driverId: "proposal-only-v1",
        familyId: "biology30-unit-a-pilot",
        qualityProfile: "biology30-unit-a-comparison-v1",
        studioEditing: { enabled: false }
      },
      authoringStatus: "blocked",
      exportTargets: [
        { target: "html", enabled: false },
        { target: "scorm", enabled: false }
      ],
      referenceOnly: [],
      sourceOfTruthNotes: "Blocked historical comparison fixture."
    };
    const manifestName = index === 0 ? "project 6.json" : "project.json";
    await writeJson(path.join(pilotDir, "meta", manifestName), pilotManifest);
    pilotHashes.push(await hashProjectTree(fixtureRoot, slug));
  }
  await writeJson(path.join(fixtureResourceDir, "pilot-tree-hashes.json"), {
    schemaVersion: 1,
    generatedAt: "2026-08-30T00:00:00.000Z",
    status: "unchanged",
    before: pilotHashes,
    after: pilotHashes
  });
  const acceptancePath = path.join(fixtureMetaDir, "human-acceptance.json");
  await writeJson(acceptancePath, {
    schemaVersion: 1,
    projectSlug,
    acceptedBuildSha256: workspace.sha256,
    reviewer: "fixture-user",
    reviewedAt: "2026-08-30T16:30:00Z",
    categoryScores: scores,
    totalScore: 100,
    binaryBlockers: [],
    decision: "accepted",
    scoredBy: "user",
    userConfirmed: true,
    authorizationSource: "explicit-user-message",
    authorizationText: "Accept this exact build and continue with the local gates.",
    statement: `I accept Biology 30 Unit A candidate ${workspace.sha256}.`
  });
  return { fixtureRoot, fixtureProjectDir, acceptancePath, buildSha256: workspace.sha256 };
}

test("promotion adds only invisible ownership attributes to the accepted learner HTML", async () => {
  const original = stripPromotionAttributes(await readFile(path.join(projectDir, "workspace/index.html"), "utf8"));
  const prepared = prepareBiologyDirectWorkspaceHtml(original);
  assert.ok(prepared.editKeyCount > 500);
  assert.ok(prepared.annotationOnlyCount > 100);
  assert.equal(stripPromotionAttributes(prepared.html), original);
  const $ = loadHtml(prepared.html);
  const keys = $("[data-canvas-helper-edit-key]").map((_index, element) => $(element).attr("data-canvas-helper-edit-key")).get();
  assert.equal(new Set(keys).size, keys.length);
  assert.ok($("body [data-canvas-helper-course-title]").length >= 1);
  assert.ok($("button[data-canvas-helper-studio-edit='annotation-only']").length > 0);
});

test("exact user acceptance promotes one Direct workspace and freezes all five pilots", async (context) => {
  const fixture = await createPromotionFixture();
  context.after(() => rm(fixture.fixtureRoot, { recursive: true, force: true }));
  const result = await promoteBiology30UnitAV2({
    repoRoot: fixture.fixtureRoot,
    project: projectSlug,
    acceptancePath: fixture.acceptancePath
  });
  assert.equal(result.acceptedBuildSha256, fixture.buildSha256);
  assert.equal(result.frozenPilotCount, 5);
  assert.notEqual(result.promotedWorkspaceSha256, result.acceptedBuildSha256);
  const manifest = await readJson<Record<string, any>>(path.join(fixture.fixtureProjectDir, "meta/project.json"));
  assert.equal(manifest.authoringStatus, "active");
  assert.equal(manifest.authoring.driverId, "direct-workspace-v1");
  assert.equal(manifest.authoring.studioEditing.enabled, true);
  assert.deepEqual(manifest.authoring.editabilityContract, { schemaVersion: 1, profileId: "studio-routine-content-v1" });
  assert.equal(manifest.regenerateCommand, undefined);
  assert.deepEqual(manifest.generatedOutputs, []);
  assert.equal(manifest.canonicalEntry, "projects/biology30-unit-a/workspace/index.html");
  assert.equal(manifest.authoring.learnerSurfaces.surfaces.length, 23);
  const html = await readFile(path.join(fixture.fixtureProjectDir, "workspace/index.html"), "utf8");
  assert.match(html, /data-canvas-helper-edit-key=/);
  assert.match(html, /data-canvas-helper-studio-edit="annotation-only"/);
  for (const slug of pilotSlugs) {
    const pilotManifest = await readJson<Record<string, any>>(path.join(fixture.fixtureRoot, "projects", slug, "meta/project.json"));
    assert.equal(pilotManifest.authoringStatus, "reference-only");
    assert.equal(pilotManifest.authoring.studioEditing.enabled, false);
    assert.equal(pilotManifest.regenerateCommand, undefined);
    assert.deepEqual(pilotManifest.generatedOutputs, []);
    assert.equal(await exists(path.join(fixture.fixtureRoot, "projects", slug, "meta/promotion-freeze.json")), true);
  }
  await assert.rejects(
    promoteBiology30UnitAV2({ repoRoot: fixture.fixtureRoot, project: projectSlug, acceptancePath: fixture.acceptancePath }),
    /already promoted/
  );
});

test("promotion refuses a stale or incomplete human decision without writes", async (context) => {
  const fixture = await createPromotionFixture();
  context.after(() => rm(fixture.fixtureRoot, { recursive: true, force: true }));
  const before = await readFile(path.join(fixture.fixtureProjectDir, "meta/project.json"));
  const acceptance = await readJson<Record<string, any>>(fixture.acceptancePath);
  acceptance.acceptedBuildSha256 = "0".repeat(64);
  await writeJson(fixture.acceptancePath, acceptance);
  await assert.rejects(
    promoteBiology30UnitAV2({ repoRoot: fixture.fixtureRoot, project: projectSlug, acceptancePath: fixture.acceptancePath }),
    /stale/
  );
  assert.deepEqual(await readFile(path.join(fixture.fixtureProjectDir, "meta/project.json")), before);
  assert.equal(await exists(path.join(fixture.fixtureProjectDir, "meta/gate-4-promotion.json")), false);
});

test("promotion refuses a 94-point decision even when every category minimum passes", async (context) => {
  const fixture = await createPromotionFixture();
  context.after(() => rm(fixture.fixtureRoot, { recursive: true, force: true }));
  const before = await readFile(path.join(fixture.fixtureProjectDir, "meta/project.json"));
  const acceptance = await readJson<Record<string, any>>(fixture.acceptancePath);
  acceptance.categoryScores = {
    academic: 24,
    coherence: 19,
    visual: 14,
    practice: 14,
    accessibility: 9,
    runtime: 9,
    maintainability: 5
  };
  acceptance.totalScore = 94;
  await writeJson(fixture.acceptancePath, acceptance);
  await assert.rejects(
    promoteBiology30UnitAV2({ repoRoot: fixture.fixtureRoot, project: projectSlug, acceptancePath: fixture.acceptancePath }),
    /at least 95/
  );
  assert.deepEqual(await readFile(path.join(fixture.fixtureProjectDir, "meta/project.json")), before);
  assert.equal(await exists(path.join(fixture.fixtureProjectDir, "meta/gate-4-promotion.json")), false);
});

test("promotion rolls back every project and pilot write after a mid-transaction failure", async (context) => {
  const fixture = await createPromotionFixture();
  context.after(() => rm(fixture.fixtureRoot, { recursive: true, force: true }));
  const paths = [
    path.join(fixture.fixtureProjectDir, "workspace/index.html"),
    path.join(fixture.fixtureProjectDir, "meta/project.json"),
    ...pilotSlugs.flatMap((slug) => [
      path.join(fixture.fixtureRoot, "projects", slug, "meta/project.json"),
      path.join(fixture.fixtureRoot, "projects", slug, "meta/promotion-freeze.json")
    ])
  ];
  const before = await Promise.all(paths.map(async (targetPath) => ({
    exists: await exists(targetPath),
    bytes: await exists(targetPath) ? await readFile(targetPath) : null
  })));
  await assert.rejects(
    promoteBiology30UnitAV2({
      repoRoot: fixture.fixtureRoot,
      project: projectSlug,
      acceptancePath: fixture.acceptancePath,
      testHooks: {
        beforePromote: (_targetPath, index) => {
          if (index === 9) throw new Error("simulated Biology promotion failure");
        }
      }
    }),
    /simulated Biology promotion failure/
  );
  for (const [index, targetPath] of paths.entries()) {
    assert.equal(await exists(targetPath), before[index].exists, targetPath);
    if (before[index].bytes) assert.deepEqual(await readFile(targetPath), before[index].bytes, targetPath);
  }
  const staging = (await readdir(path.join(fixture.fixtureRoot, "projects")))
    .filter((entry) => entry.startsWith(".biology30-unit-a-promotion-"));
  assert.deepEqual(staging, []);
});
