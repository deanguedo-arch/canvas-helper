import assert from "node:assert/strict";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { load as loadHtml } from "cheerio";

import { buildBiology30UnitAGate2, hashBiologyWorkspaceTree } from "../lib/biology30-unit-a/v2/gate2-build.js";
import { hashProjectTree } from "../lib/biology30-unit-a/v2/intake.js";
import { renderBiology30UnitAGate2 } from "../lib/biology30-unit-a/v2/gate2-render.js";
import type { BiologyProductionContractV1 } from "../lib/biology30-unit-a/v2/types.js";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const resourceDir = path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/v2");
const projectDir = path.join(repoRoot, "projects/biology30-unit-a");
const expectedRoutes = [
  "overview",
  ...Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`),
  "model-lab",
  "investigation-notebook",
  "practice-hub",
  "glossary-and-data",
  "sources-and-credits"
];
const pilotSlugs = [
  "biology30-unit-a-class-2026-faithful",
  "biology30-unit-a-class-2026-optimized",
  "biology30-unit-a-system-2020-faithful",
  "biology30-unit-a-system-2020-optimized",
  "biology30-unit-a-synthesis"
];

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

async function createGate2Fixture() {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-gate2-"));
  const fixtureResourceDir = path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot/v2");
  await mkdir(path.dirname(fixtureResourceDir), { recursive: true });
  await cp(resourceDir, fixtureResourceDir, { recursive: true });
  await cp(projectDir, path.join(fixtureRoot, "projects/biology30-unit-a"), { recursive: true });

  const contract = await readJson<BiologyProductionContractV1>(path.join(fixtureResourceDir, "production-contract.json"));
  for (const source of contract.sources.filter((entry) => entry.path && !entry.path.includes("#"))) {
    const destination = path.join(fixtureRoot, source.path!);
    await mkdir(path.dirname(destination), { recursive: true });
    await symlink(path.join(repoRoot, source.path!), destination);
  }
  for (const slug of pilotSlugs) {
    await symlink(path.join(repoRoot, "projects", slug), path.join(fixtureRoot, "projects", slug));
  }
  const fixtureProjectDir = path.join(fixtureRoot, "projects/biology30-unit-a");
  const fixtureMetaDir = path.join(fixtureProjectDir, "meta");
  const workspacePath = path.join(fixtureProjectDir, "workspace/index.html");
  const candidateHtml = (await readFile(workspacePath, "utf8"))
    .replace(/ data-canvas-helper-edit-key="biology30-unit-a-v1-\d{5}"/g, "")
    .replace(/ data-canvas-helper-studio-edit="annotation-only"/g, "");
  await writeFile(workspacePath, candidateHtml, "utf8");
  await rm(path.join(fixtureMetaDir, "human-acceptance.json"), { force: true });
  await rm(path.join(fixtureMetaDir, "gate-4-promotion.json"), { force: true });
  const workspace = await hashBiologyWorkspaceTree(path.join(fixtureProjectDir, "workspace"));
  const build = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "gate-2-build.json"));
  await writeFile(path.join(fixtureMetaDir, "gate-2-build.json"), `${JSON.stringify({ ...build, buildSha256: workspace.sha256, status: "blocked-awaiting-user" }, null, 2)}\n`);
  const manifest = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "project.json"));
  await writeFile(path.join(fixtureMetaDir, "project.json"), `${JSON.stringify({
    ...manifest,
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
    exportTargets: [{ target: "html", enabled: false }, { target: "scorm", enabled: false }]
  }, null, 2)}\n`);
  const candidate = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "production-candidate.json"));
  await writeFile(path.join(fixtureMetaDir, "production-candidate.json"), `${JSON.stringify({
    ...candidate,
    status: "blocked-awaiting-user",
    buildSha256: workspace.sha256,
    ownership: "proposal-only-v1",
    studioEditingEnabled: false,
    exportEnabled: false
  }, null, 2)}\n`);
  const review = await readJson<Record<string, unknown>>(path.join(fixtureMetaDir, "gate-2-review.json"));
  await writeFile(path.join(fixtureMetaDir, "gate-2-review.json"), `${JSON.stringify({ ...review, buildSha256: workspace.sha256, status: "awaiting-user", decision: null }, null, 2)}\n`);
  const currentPilotHashes = await Promise.all(pilotSlugs.map((slug) => hashProjectTree(fixtureRoot, slug)));
  const pilotRecordPath = path.join(fixtureResourceDir, "pilot-tree-hashes.json");
  const pilotRecord = await readJson<Record<string, unknown>>(pilotRecordPath);
  await writeFile(pilotRecordPath, `${JSON.stringify({ ...pilotRecord, status: "unchanged", before: currentPilotHashes, after: currentPilotHashes }, null, 2)}\n`);
  return fixtureRoot;
}

function stagingEntries(entries: string[]) {
  return entries.filter((entry) => entry.startsWith(".biology30-unit-a-gate2-"));
}

test("Gate 2 renders the complete local-first learner inventory", async () => {
  const rendered = await renderBiology30UnitAGate2(resourceDir);
  const $ = loadHtml(rendered.html);

  assert.deepEqual(rendered.learnerRouteIds, expectedRoutes);
  assert.equal(rendered.lessonIds.length, 17);
  assert.equal(rendered.figureIds.length, 27);
  assert.equal(rendered.interactionIds.length, 17);
  assert.equal(rendered.practiceItems.length, 100);
  assert.equal(rendered.artifactIds.length, 7);
  assert.equal($("[data-biology-lesson]").length, 17);
  assert.equal($("[data-bio-interaction]").length, 17);
  assert.equal($("[data-model-index] [data-open-bio-model]").length, 17);
  for (const modelLink of $("[data-model-index] [data-open-bio-model]").toArray()) {
    const interactionId = $(modelLink).attr("data-open-bio-model") ?? "";
    const destination = $(`[data-bio-interaction="${interactionId}"]`);
    assert.equal(destination.length, 1, interactionId);
    assert.equal($(modelLink).attr("data-page-target"), destination.closest(".course-page").attr("id"), interactionId);
    assert.equal($(modelLink).text().trim(), "Open model", interactionId);
    assert.equal($(modelLink).attr("aria-label"), `Open ${$(modelLink).closest(".bio-hub-card").find("h2").text().trim()}`, interactionId);
  }
  assert.equal($("[data-bio-practice]").length, 17);
  assert.equal($("[data-lesson-practice-index] [data-open-bio-practice]").length, 17);
  for (const practiceLink of $("[data-lesson-practice-index] [data-open-bio-practice]").toArray()) {
    const lessonId = $(practiceLink).attr("data-open-bio-practice") ?? "";
    const destination = $(`[data-bio-practice="${lessonId}"]`);
    const card = $(practiceLink).closest(".bio-hub-card");
    assert.equal(destination.length, 1, lessonId);
    assert.equal($(practiceLink).attr("data-page-target"), destination.closest(".course-page").attr("id"), lessonId);
    assert.equal($(practiceLink).text().trim(), "Open lesson practice", lessonId);
    assert.equal($(practiceLink).attr("aria-label"), `Open practice for ${card.find("div > p").first().text().trim()}: ${card.find("h2").text().trim()}`, lessonId);
  }
  assert.equal($("[data-practice-id]").length, 100);
  assert.equal($("[data-artifact-id]").length, 7);
  assert.equal($(".bio-learning-targets").length, 18);
  for (const targetBlock of $(".bio-learning-targets").toArray()) {
    assert.match($(targetBlock).find("h2").text().trim(), /^I am learning to\b/);
    for (const criterion of $(targetBlock).find("li").toArray()) assert.match($(criterion).text().trim(), /^I can\b/);
  }
  assert.equal(new Set($("[data-practice-id]").map((_index, element) => $(element).attr("data-practice-id")).get()).size, 100);

  for (const routeId of expectedRoutes) assert.equal($(`#${routeId}`).first().find("h1").length, 1, routeId);
  const ids = $("[id]").map((_index, element) => $(element).attr("id") ?? "").get();
  assert.equal(new Set(ids).size, ids.length, "rendered IDs must be unique");
  assert.equal($("iframe,.material-symbols-outlined,[data-canvas-helper-edit-key]").length, 0);
  assert.equal($("[src^='http'],[href^='http']:not([data-optional-enrichment])").length, 0);
  assert.equal($("a[data-optional-enrichment][href^='http']").length, 10);
  assert.equal($("audio,[autoplay]").length, 0);
  assert.match(rendered.html, /API_1484_11/);
  assert.match(rendered.html, /cmi\.suspend_data/);
  assert.match(rendered.html, /cmi\.completion_status/);
  assert.match(rendered.html, /cmi\.score\.raw/);
  assert.match(rendered.html, /cmi\.success_status/);
  assert.match(rendered.html, /BIO_STATE_LIMIT = 48000/);
  assert.ok(rendered.html.includes("id.match(/^lesson-(\\d+)$/)"), "Unit A lesson IDs retain their numeric response-key escape");
  assert.match(rendered.html, /@font-face/);
  assert.match(rendered.html, /prefers-reduced-motion/);
  assert.match(rendered.html, /@media print/);

  const learnerView = loadHtml(rendered.html);
  learnerView("script,style").remove();
  const learnerText = learnerView.root().text().replace(/\s+/g, " ");
  assert.doesNotMatch(learnerText, /slide viewer|primarily visual|coming soon|proposal-only|build hash|source hash|comparison rubric/i);
  assert.doesNotMatch(learnerText, /\b(?:SCORM|Brightspace|LMS)\b/i);
  assert.doesNotMatch(learnerText, /teacher answer key|printable secure quiz|hidden unit test/i);
  for (const script of $("script").toArray()) assert.doesNotThrow(() => new Function($(script).html() || ""));
});

test("Gate 2 curriculum, practice, figures, sources, and stable response IDs are exact", async () => {
  const [contract, dispositions, rendered] = await Promise.all([
    readJson<BiologyProductionContractV1>(path.join(resourceDir, "production-contract.json")),
    readJson<{ pageCount: number; dispositions: Array<{ page: number; status: string; lessonIds?: string[]; reason?: string }> }>(path.join(resourceDir, "notes-page-disposition.json")),
    renderBiology30UnitAGate2(resourceDir)
  ]);
  const sourceIds = new Set(contract.sourceRefs.map((source) => source.id));
  const outcomeIds = new Set(contract.outcomes.map((outcome) => outcome.id));

  assert.equal(contract.outcomes.length, 25);
  assert.equal(contract.lessons.length, 17);
  assert.equal(contract.lessons.reduce((total, lesson) => total + lesson.requiredMinutes, 0), 1505);
  assert.equal(contract.lessons.reduce((total, lesson) => total + lesson.optionalMinutes, 0), 295);
  for (const outcome of contract.outcomes) {
    assert.ok(outcome.officialText.trim(), outcome.id);
    assert.ok(outcome.teachRoutes.length, `${outcome.id} teach route`);
    assert.ok(outcome.practiceRoutes.length, `${outcome.id} practice route`);
    assert.ok(outcome.evidenceRoutes.length, `${outcome.id} evidence route`);
    assert.ok(rendered.practiceItems.some((item) => item.outcomeIds.includes(outcome.id)), `${outcome.id} practice-bank coverage`);
  }

  assert.equal(dispositions.pageCount, 139);
  assert.equal(dispositions.dispositions.length, 139);
  assert.deepEqual(dispositions.dispositions.map((entry) => entry.page).sort((a, b) => a - b), Array.from({ length: 139 }, (_value, index) => index + 1));
  assert.ok(dispositions.dispositions.every((entry) => ["used", "corrected", "excluded-redundant", "reference-only"].includes(entry.status)));
  assert.ok(dispositions.dispositions.every((entry) => entry.lessonIds?.length || entry.reason?.trim()));

  assert.equal(new Set(rendered.practiceItems.map((item) => item.id)).size, 100);
  for (const item of rendered.practiceItems) {
    assert.ok(item.outcomeIds.length && item.outcomeIds.every((id) => outcomeIds.has(id)), item.id);
    assert.ok(item.sourceRefIds.length && item.sourceRefIds.every((id) => sourceIds.has(id)), item.id);
    assert.ok(Object.hasOwn(item.choices, String(item.answerKey)), item.id);
    assert.ok(item.rationale.trim().length > 20, item.id);
    assert.ok(Object.keys(item.choices).every((choice) => choice === String(item.answerKey) || item.targetedFeedback[choice]?.trim()), item.id);
  }
  for (const lesson of contract.lessons) assert.equal(rendered.practiceItems.filter((item) => item.setId === lesson.id).length, 3, lesson.id);
  for (let index = 1; index <= 5; index += 1) assert.equal(rendered.practiceItems.filter((item) => item.setId === `module-${index}`).length, 5, `module-${index}`);
  assert.equal(rendered.practiceItems.filter((item) => item.setId === "final-practice").length, 24);

  const mixed = rendered.practiceItems.filter((item) => /^module-\d$/.test(item.setId ?? "") || item.setId === "final-practice");
  const percentage = (level: string) => (mixed.filter((item) => item.cognitiveLevel === level).length / mixed.length) * 100;
  assert.ok(percentage("remember-understand") >= 25 && percentage("remember-understand") <= 35);
  assert.ok(percentage("apply") >= 45 && percentage("apply") <= 55);
  assert.ok(percentage("higher-mental-activity") >= 15 && percentage("higher-mental-activity") <= 25);

  const figureFiles = (await readdir(path.join(resourceDir, "figures"))).filter((file) => file.endsWith(".svg"));
  assert.equal(figureFiles.length, 27);
  for (const file of figureFiles) {
    const svg = await readFile(path.join(resourceDir, "figures", file), "utf8");
    assert.match(svg, /<title\b/);
    assert.match(svg, /<desc\b/);
    assert.match(svg, /role="img"/);
    assert.doesNotMatch(svg.replace("http://www.w3.org/2000/svg", ""), /<image\b|https?:\/\//);
  }

  const $ = loadHtml(rendered.html);
  for (let index = 1; index <= 17; index += 1) {
    const number = String(index).padStart(2, "0");
    assert.equal($(`[data-bio-response-id="biology30-unit-a:lesson:${number}:exit"]`).length, 1, `lesson ${number} exit`);
  }
  for (const artifact of contract.artifacts) assert.equal($(`[data-artifact-id="${artifact.id}"]`).length, 1, artifact.id);
});

test("Gate 2 generated reports remain exact before or after accepted Direct promotion", async () => {
  const build = await readJson<{ buildSha256: string; learnerRoutes: string[]; renderedLessons: string[]; figures: string[]; interactions: string[]; practiceItems: string[]; artifacts: string[] }>(path.join(projectDir, "meta/gate-2-build.json"));
  const candidate = await readJson<{ buildSha256: string; ownership: string; studioEditingEnabled: boolean; exportEnabled: boolean }>(path.join(projectDir, "meta/production-candidate.json"));
  const manifest = await readJson<{ authoringStatus: string; authoring: { driverId: string; studioEditing: { enabled: boolean } }; exportTargets: Array<{ enabled: boolean }> }>(path.join(projectDir, "meta/project.json"));
  const reportNames = [
    "gate-2-curriculum-audit.json",
    "gate-2-asset-audit.json",
    "gate-2-interaction-inventory.json",
    "gate-2-practice-audit.json",
    "gate-2-content-density.json",
    "gate-2-accessibility-static.json",
    "gate-2-persistence-budget.json",
    "gate-2-factual-review.json"
  ];
  for (const reportName of reportNames) assert.equal((await readJson<{ pass: boolean }>(path.join(projectDir, "meta", reportName))).pass, true, reportName);

  assert.match(build.buildSha256, /^[a-f0-9]{64}$/);
  assert.equal((await hashBiologyWorkspaceTree(path.join(projectDir, "workspace"))).sha256, build.buildSha256);
  assert.deepEqual(build.learnerRoutes, expectedRoutes);
  assert.equal(build.renderedLessons.length, 17);
  assert.equal(build.figures.length, 27);
  assert.equal(build.interactions.length, 17);
  assert.equal(build.practiceItems.length, 100);
  assert.equal(build.artifacts.length, 7);
  assert.equal(candidate.buildSha256, build.buildSha256);
  const promoted = await exists(path.join(projectDir, "meta/gate-4-promotion.json"));
  if (promoted) {
    const gate4 = await readJson<{ acceptedBuildSha256: string; promotedWorkspaceSha256: string }>(path.join(projectDir, "meta/gate-4-promotion.json"));
    assert.equal(gate4.acceptedBuildSha256, build.buildSha256);
    assert.equal(candidate.ownership, "direct-workspace-v1");
    assert.equal(candidate.studioEditingEnabled, true);
    assert.equal(candidate.exportEnabled, true);
    assert.equal(manifest.authoringStatus, "active");
    assert.equal(manifest.authoring.driverId, "direct-workspace-v1");
    assert.equal(manifest.authoring.studioEditing.enabled, true);
    assert.ok(manifest.exportTargets.every((target) => target.enabled === true));
    assert.equal(await exists(path.join(projectDir, "meta/human-acceptance.json")), true);
  } else {
    assert.equal(candidate.ownership, "proposal-only-v1");
    assert.equal(candidate.studioEditingEnabled, false);
    assert.equal(candidate.exportEnabled, false);
    assert.equal(manifest.authoringStatus, "blocked");
    assert.equal(manifest.authoring.driverId, "proposal-only-v1");
    assert.equal(manifest.authoring.studioEditing.enabled, false);
    assert.ok(manifest.exportTargets.every((target) => target.enabled === false));
    assert.equal(await exists(path.join(projectDir, "meta/human-acceptance.json")), false);
  }

  const persistence = await readJson<{ worstCaseCharacters: number; remainingBuildGuardCharacters: number; preservesLastValidStateOnOverflow: boolean }>(path.join(projectDir, "meta/gate-2-persistence-budget.json"));
  assert.ok(persistence.worstCaseCharacters < 48000);
  assert.equal(persistence.remainingBuildGuardCharacters, 48000 - persistence.worstCaseCharacters);
  assert.equal(persistence.preservesLastValidStateOnOverflow, true);

  const v2Sources = [
    await readFile(path.join(repoRoot, "scripts/lib/biology30-unit-a/v2/gate2-render.ts"), "utf8"),
    await readFile(path.join(repoRoot, "scripts/lib/biology30-unit-a/v2/gate2-build.ts"), "utf8")
  ].join("\n");
  assert.doesNotMatch(v2Sources, /mapBiologyItemToStage|buildBiology30UnitAPilots|from ["']\.\.\/render\.js["']|from ["']\.\.\/build\.js["']/);
});

test("Gate 2 builder transactionally replaces one blocked candidate", async (context) => {
  const fixtureRoot = await createGate2Fixture();
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const result = await buildBiology30UnitAGate2({ repoRoot: fixtureRoot, project: "biology30-unit-a", strict: true });
  const build = await readJson<{ buildSha256: string; learnerRoutes: string[]; status: string }>(path.join(result.projectDir, "meta/gate-2-build.json"));
  assert.equal(result.learnerRouteCount, 23);
  assert.equal(build.buildSha256, result.buildSha256);
  assert.equal(build.status, "blocked-awaiting-user");
  assert.deepEqual(build.learnerRoutes, expectedRoutes);
  assert.equal(stagingEntries(await readdir(path.join(fixtureRoot, "projects"))).length, 0);
});

test("Gate 2 validation failure preserves the previous candidate and removes staging", async (context) => {
  const fixtureRoot = await createGate2Fixture();
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const workspacePath = path.join(fixtureRoot, "projects/biology30-unit-a/workspace/index.html");
  const buildPath = path.join(fixtureRoot, "projects/biology30-unit-a/meta/gate-2-build.json");
  const before = await Promise.all([readFile(workspacePath), readFile(buildPath)]);
  await assert.rejects(
    buildBiology30UnitAGate2({
      repoRoot: fixtureRoot,
      project: "biology30-unit-a",
      strict: true,
      testHooks: {
        afterStageWrite: async (stageWorkspaceDir) => {
          const indexPath = path.join(stageWorkspaceDir, "index.html");
          await writeFile(indexPath, `${await readFile(indexPath, "utf8")}<p>Coming soon</p>`, "utf8");
        }
      }
    }),
    /placeholder language/
  );
  assert.deepEqual(await Promise.all([readFile(workspacePath), readFile(buildPath)]), before);
  assert.equal(stagingEntries(await readdir(path.join(fixtureRoot, "projects"))).length, 0);
});

test("Gate 2 promotion failure restores every replaced path", async (context) => {
  const fixtureRoot = await createGate2Fixture();
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const paths = [
    path.join(fixtureRoot, "projects/biology30-unit-a/workspace/index.html"),
    path.join(fixtureRoot, "projects/biology30-unit-a/meta/project.json"),
    path.join(fixtureRoot, "projects/biology30-unit-a/meta/production-candidate.json"),
    path.join(fixtureRoot, "projects/biology30-unit-a/meta/gate-2-build.json")
  ];
  const before = await Promise.all(paths.map((targetPath) => readFile(targetPath)));
  await assert.rejects(
    buildBiology30UnitAGate2({
      repoRoot: fixtureRoot,
      project: "biology30-unit-a",
      strict: true,
      testHooks: {
        beforePromote: (_targetPath, index) => {
          if (index === 3) throw new Error("simulated Gate 2 promotion failure");
        }
      }
    }),
    /simulated Gate 2 promotion failure/
  );
  assert.deepEqual(await Promise.all(paths.map((targetPath) => readFile(targetPath))), before);
  assert.equal(stagingEntries(await readdir(path.join(fixtureRoot, "projects"))).length, 0);
});

test("Gate 2 refuses stale approval, accepted, and promoted ownership boundaries", async (context) => {
  await context.test("stale exact-build approval", async (subtest) => {
    const fixtureRoot = await createGate2Fixture();
    subtest.after(() => rm(fixtureRoot, { recursive: true, force: true }));
    const approvalPath = path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot/v2/gate-1-approval.json");
    const approval = await readJson<Record<string, unknown>>(approvalPath);
    await writeFile(approvalPath, `${JSON.stringify({ ...approval, approvedBuildSha256: "0".repeat(64) }, null, 2)}\n`);
    await assert.rejects(buildBiology30UnitAGate2({ repoRoot: fixtureRoot, project: "biology30-unit-a", strict: true }), /canonical exact-build Gate 1 approval/);
  });

  await context.test("human acceptance record", async (subtest) => {
    const fixtureRoot = await createGate2Fixture();
    subtest.after(() => rm(fixtureRoot, { recursive: true, force: true }));
    await writeFile(path.join(fixtureRoot, "projects/biology30-unit-a/meta/human-acceptance.json"), "{}\n");
    await assert.rejects(buildBiology30UnitAGate2({ repoRoot: fixtureRoot, project: "biology30-unit-a", strict: true }), /human acceptance record/);
  });

  await context.test("accepted Gate 2 review", async (subtest) => {
    const fixtureRoot = await createGate2Fixture();
    subtest.after(() => rm(fixtureRoot, { recursive: true, force: true }));
    const reviewPath = path.join(fixtureRoot, "projects/biology30-unit-a/meta/gate-2-review.json");
    const review = await readJson<Record<string, unknown>>(reviewPath);
    await writeFile(reviewPath, `${JSON.stringify({ ...review, status: "approved", decision: { approved: true } }, null, 2)}\n`);
    await assert.rejects(buildBiology30UnitAGate2({ repoRoot: fixtureRoot, project: "biology30-unit-a", strict: true }), /accepted Gate 2 candidate/);
  });

  await context.test("promoted project manifest", async (subtest) => {
    const fixtureRoot = await createGate2Fixture();
    subtest.after(() => rm(fixtureRoot, { recursive: true, force: true }));
    const manifestPath = path.join(fixtureRoot, "projects/biology30-unit-a/meta/project.json");
    const manifest = await readJson<Record<string, unknown>>(manifestPath);
    await writeFile(manifestPath, `${JSON.stringify({ ...manifest, authoringStatus: "active" }, null, 2)}\n`);
    await assert.rejects(buildBiology30UnitAGate2({ repoRoot: fixtureRoot, project: "biology30-unit-a", strict: true }), /blocked proposal-only Biology project/);
  });
});
