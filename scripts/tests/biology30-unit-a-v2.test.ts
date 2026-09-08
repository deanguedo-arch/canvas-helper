import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { NamedBrightspaceResource } from "../lib/science-comparison.js";
import {
  BIOLOGY30_V2_LESSONS,
  buildPdfPageDisposition,
  createProductionContract,
  getCorrectionLedger,
  validateProductionContract,
  validateProductionSourceManifest
} from "../lib/biology30-unit-a/v2/blueprint.js";
import {
  intakeBiology30UnitAV2,
  promoteStagedDirectories,
  validateContractSourceLocators
} from "../lib/biology30-unit-a/v2/intake.js";
import type { BiologyProductionContractV1, BiologySourceCatalogV1 } from "../lib/biology30-unit-a/v2/types.js";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

async function loadNamedResources() {
  const manifest = JSON.parse(
    await readFile(path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/resource-manifest.json"), "utf8")
  ) as { resources: NamedBrightspaceResource[] };
  return manifest.resources;
}

async function buildContract() {
  const resources = await loadNamedResources();
  validateProductionSourceManifest(resources);
  return createProductionContract({ resources, generatedAt: "2026-08-29T00:00:00.000Z" });
}

function fakeCatalog(contract: BiologyProductionContractV1): BiologySourceCatalogV1 {
  const brightspaceRefs = contract.sourceRefs.filter(
    (sourceRef) => sourceRef.sourceId === "class-2026-27" || sourceRef.sourceId === "system-2020"
  );
  return {
    schemaVersion: 1,
    family: "biology30-unit-a-pilot",
    generatedAt: contract.generatedAt,
    sources: [
      {
        id: "class-2026-27",
        label: "class",
        role: "primary",
        path: "class.zip",
        sha256: "a".repeat(64),
        originalName: "class.zip",
        manifestTitle: "class",
        unitRootId: "1498071",
        unitRootTitle: "Unit A - Nervous & Endocrine Systems",
        itemCount: 1,
        visibleQuizCount: 3,
        visibleQuizQuestionCount: 75,
        utf16HtmlCount: 0
      },
      {
        id: "system-2020",
        label: "system",
        role: "reference",
        path: "system.zip",
        sha256: "b".repeat(64),
        originalName: "system.zip",
        manifestTitle: "system",
        unitRootId: "2240",
        unitRootTitle: "Unit A",
        itemCount: 1,
        visibleQuizCount: 0,
        visibleQuizQuestionCount: 0,
        utf16HtmlCount: 1
      }
    ],
    items: brightspaceRefs.map((sourceRef) => ({
      sourceId: sourceRef.sourceId,
      itemId: sourceRef.itemId!,
      title: sourceRef.sourcePath!.split(" > ").at(-1)!,
      pathTitles: sourceRef.sourcePath!.split(" > "),
      visible: true,
      explicitlyHidden: false,
      descriptionPresent: true,
      disposition: "included",
      dispositionReason: "test fixture"
    })),
    visibleQuizzes: [],
    contentDispositions: [
      ...brightspaceRefs.map((sourceRef) => ({
        sourceId: sourceRef.sourceId,
        itemId: sourceRef.itemId!,
        title: sourceRef.sourcePath!.split(" > ").at(-1)!,
        pathTitles: sourceRef.sourcePath!.split(" > "),
        visibleInSource: true,
        disposition: "included",
        reason: "test fixture"
      })),
      {
        sourceId: "class-2026-27",
        itemId: "1498117",
        title: "Unit A Test",
        pathTitles: ["Unit A", "Unit A Test"],
        visibleInSource: false,
        disposition: "excluded-teacher-assessment",
        reason: "secure assessment"
      }
    ]
  };
}

async function exists(targetPath: string) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

const pilotSlugs = [
  "biology30-unit-a-class-2026-faithful",
  "biology30-unit-a-class-2026-optimized",
  "biology30-unit-a-system-2020-faithful",
  "biology30-unit-a-system-2020-optimized",
  "biology30-unit-a-synthesis"
];

async function createRealSourceFixture() {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-v2-intake-"));
  const realManifestPath = path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/resource-manifest.json");
  const manifest = JSON.parse(await readFile(realManifestPath, "utf8")) as { resources: NamedBrightspaceResource[] };
  const familyDir = path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot");
  await mkdir(path.join(familyDir, "_sources"), { recursive: true });
  await writeFile(path.join(familyDir, "resource-manifest.json"), `${JSON.stringify({ schemaVersion: 2, family: "biology30-unit-a-pilot", resources: manifest.resources }, null, 2)}\n`);
  for (const resource of manifest.resources) {
    const source = path.join(repoRoot, resource.path);
    const destination = path.join(fixtureRoot, resource.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await symlink(source, destination);
  }
  for (const slug of pilotSlugs) {
    const pilotDir = path.join(fixtureRoot, "projects", slug, "workspace");
    await mkdir(pilotDir, { recursive: true });
    await writeFile(path.join(pilotDir, "baseline.txt"), `${slug}\n`);
  }
  return fixtureRoot;
}

test("Gate 0 production contract is decision-complete and remains blocked", async () => {
  const contract = await buildContract();
  validateProductionContract(contract);
  assert.equal(contract.status.authoringStatus, "blocked");
  assert.equal(contract.status.driverId, "proposal-only-v1");
  assert.equal(contract.status.studioEditingEnabled, false);
  assert.equal(contract.status.exportEnabled, false);
  assert.equal(contract.outcomes.length, 25);
  assert.equal(contract.lessons.length, 17);
  assert.equal(contract.lessons.reduce((total, lesson) => total + lesson.requiredMinutes, 0), 1505);
  assert.equal(contract.lessons.reduce((total, lesson) => total + lesson.optionalMinutes, 0), 295);
  assert.equal(contract.artifacts.length, 7);
  assert.equal(contract.practiceBlueprint.total, 100);
  assert.equal(contract.learnerRoutes.length, 23);
  assert.equal(contract.curriculum.biologyBulletin2026_27Found, false);
  assert.equal(contract.curriculum.refreshRequiredBeforeGate1, true);
});

test("all official Unit A outcomes have teach, practice, and observable evidence routes", async () => {
  const contract = await buildContract();
  const expected = [
    "A1.1k", "A1.2k", "A1.3k", "A1.4k", "A1.5k", "A1.6k",
    "A1.1sts", "A1.2sts", "A1.3sts", "A1.1s", "A1.2s", "A1.3s", "A1.4s",
    "A2.1k", "A2.2k", "A2.3k", "A2.4k", "A2.5k", "A2.6k",
    "A2.1sts", "A2.2sts", "A2.1s", "A2.2s", "A2.3s", "A2.4s"
  ];
  assert.deepEqual(contract.outcomes.map((outcome) => outcome.id), expected);
  for (const outcome of contract.outcomes) {
    assert.ok(outcome.officialText.length > 20, `${outcome.id} has official wording`);
    assert.ok(outcome.teachRoutes.length > 0, `${outcome.id} has a teach route`);
    assert.ok(outcome.practiceRoutes.length > 0, `${outcome.id} has a practice route`);
    assert.ok(outcome.evidenceRoutes.length > 0, `${outcome.id} has an evidence route`);
    assert.ok(outcome.teachRoutes.some((route) => route !== "lesson-17"), `${outcome.id} is taught before final review`);
  }
});

test("all 139 notes pages are dispositioned and correction regressions are explicit", () => {
  const dispositions = buildPdfPageDisposition();
  assert.equal(dispositions.length, 139);
  assert.deepEqual(dispositions.map((entry) => entry.page), Array.from({ length: 139 }, (_value, index) => index + 1));
  const corrections = getCorrectionLedger();
  for (const page of [12, 58, 112, 130, 131]) {
    assert.equal(dispositions.find((entry) => entry.page === page)?.status, "corrected");
    assert.ok(corrections.some((record) => record.sourcePages.includes(page)), `page ${page} has a correction record`);
  }
  assert.ok(corrections.some((record) => /left-brain/i.test(record.sourceProblem)));
  assert.ok(corrections.some((record) => /hearing test/i.test(record.requiredTreatment)));
  assert.ok(corrections.some((record) => /synthetic instructional data/i.test(record.requiredTreatment)));
});

test("lesson blueprint has unique practice, response, figure, and source identifiers", async () => {
  const contract = await buildContract();
  const practiceIds = contract.lessons.flatMap((lesson) => lesson.practiceIds);
  const responseIds = contract.interactions.flatMap((interaction) => interaction.responseIds);
  const figureIds = contract.lessons.flatMap((lesson) => lesson.figureIds);
  assert.equal(practiceIds.length, 51);
  assert.equal(new Set(practiceIds).size, practiceIds.length);
  assert.equal(new Set(responseIds).size, responseIds.length);
  assert.ok(new Set(figureIds).size >= 20);
  assert.ok(contract.interactions.length >= 13);
  assert.deepEqual(BIOLOGY30_V2_LESSONS.map((lesson) => lesson.order), Array.from({ length: 17 }, (_value, index) => index + 1));
});

test("explicit source locator validation rejects drift and teacher-only selection", async () => {
  const contract = await buildContract();
  const catalog = fakeCatalog(contract);
  validateContractSourceLocators(contract, catalog);
  const missing = structuredClone(catalog);
  const selected = contract.sourceRefs.find((sourceRef) => sourceRef.sourceId === "class-2026-27")!;
  missing.items = missing.items.filter((item) => item.itemId !== selected.itemId);
  assert.throws(() => validateContractSourceLocators(contract, missing), /missing item/);
  const teacherSelected = structuredClone(contract);
  teacherSelected.sourceRefs.push({
    id: "forbidden-test",
    sourceId: "class-2026-27",
    itemId: "1498117",
    sourcePath: "Unit A > Unit A Test",
    role: "core",
    rightsStatus: "not learner-authorized",
    usage: "adaptation"
  });
  catalog.items.push({
    sourceId: "class-2026-27",
    itemId: "1498117",
    title: "Unit A Test",
    pathTitles: ["Unit A", "Unit A Test"],
    visible: false,
    explicitlyHidden: true,
    descriptionPresent: false,
    disposition: "excluded-teacher-assessment",
    dispositionReason: "secure"
  });
  assert.throws(() => validateContractSourceLocators(teacherSelected, catalog), /selects excluded source material/);
});

test("strict contract validation rejects minutes, duplicate IDs, and unknown references", async () => {
  const contract = await buildContract();
  const minutes = structuredClone(contract);
  minutes.lessons[0].requiredMinutes += 1;
  assert.throws(() => validateProductionContract(minutes), /expected 1505/);
  const duplicate = structuredClone(contract);
  duplicate.lessons[1].id = duplicate.lessons[0].id;
  assert.throws(() => validateProductionContract(duplicate), /Duplicate lesson ID/);
  const unknown = structuredClone(contract);
  unknown.lessons[0].sourceRefIds.push("fuzzy-inferred-source");
  assert.throws(() => validateProductionContract(unknown), /unknown source/);
});

test("V2 implementation does not call the legacy fuzzy stage mapper", async () => {
  const source = await Promise.all([
    readFile(path.join(repoRoot, "scripts/lib/biology30-unit-a/v2/blueprint.ts"), "utf8"),
    readFile(path.join(repoRoot, "scripts/lib/biology30-unit-a/v2/intake.ts"), "utf8")
  ]);
  assert.doesNotMatch(source.join("\n"), /mapBiologyItemToStage|selectStageForItem|fuzzy stage/i);
});

test("real-source Gate 0 intake creates one blocked candidate and then refuses the duplicate", async (context) => {
  const fixtureRoot = await createRealSourceFixture();
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const result = await intakeBiology30UnitAV2({
    repoRoot: fixtureRoot,
    family: "biology30-unit-a-pilot",
    project: "biology30-unit-a"
  });
  assert.equal(await exists(path.join(result.resourceDir, "production-contract.json")), true);
  assert.equal(await exists(path.join(result.projectDir, "workspace", "index.html")), true);
  const project = JSON.parse(await readFile(path.join(result.projectDir, "meta", "project.json"), "utf8")) as {
    authoringStatus: string;
    authoring: { driverId: string; studioEditing: { enabled: boolean } };
  };
  assert.equal(project.authoringStatus, "blocked");
  assert.equal(project.authoring.driverId, "proposal-only-v1");
  assert.equal(project.authoring.studioEditing.enabled, false);
  const rawIntake = JSON.parse(await readFile(path.join(result.projectDir, "raw", "intake.json"), "utf8")) as {
    sourceArchivesCopiedIntoProject: boolean;
  };
  assert.equal(rawIntake.sourceArchivesCopiedIntoProject, false);
  await assert.rejects(
    intakeBiology30UnitAV2({ repoRoot: fixtureRoot, family: "biology30-unit-a-pilot", project: "biology30-unit-a" }),
    /Refusing existing Biology V2 resource target/
  );
});

test("real-source Gate 0 intake removes both staged roots after validation failure", async (context) => {
  const fixtureRoot = await createRealSourceFixture();
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  await assert.rejects(
    intakeBiology30UnitAV2({
      repoRoot: fixtureRoot,
      family: "biology30-unit-a-pilot",
      project: "biology30-unit-a",
      testHooks: {
        afterStageWrite: async (stageResourceDir) => {
          const reviewPath = path.join(stageResourceDir, "gate-0-review.json");
          const review = JSON.parse(await readFile(reviewPath, "utf8")) as Record<string, unknown>;
          review.status = "approved-without-user";
          await writeFile(reviewPath, `${JSON.stringify(review, null, 2)}\n`);
        }
      }
    }),
    /stale or pre-approved/
  );
  assert.equal(await exists(path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot/v2")), false);
  assert.equal(await exists(path.join(fixtureRoot, "projects/biology30-unit-a")), false);
  const familyEntries = await readdir(path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot"));
  const projectEntries = await readdir(path.join(fixtureRoot, "projects"));
  assert.equal(familyEntries.some((entry) => entry.startsWith(".v2-stage-")), false);
  assert.equal(projectEntries.some((entry) => entry.startsWith(".biology30-unit-a-stage-")), false);
});

test("staged-directory promotion rolls back every promoted target after a second-target failure", async (context) => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-v2-transaction-"));
  context.after(() => rm(tempRoot, { recursive: true, force: true }));
  const stageA = path.join(tempRoot, ".stage-a");
  const stageB = path.join(tempRoot, ".stage-b");
  const finalA = path.join(tempRoot, "final-a");
  const finalB = path.join(tempRoot, "final-b");
  await Promise.all([mkdir(stageA), mkdir(stageB)]);
  await Promise.all([writeFile(path.join(stageA, "one.txt"), "one"), writeFile(path.join(stageB, "two.txt"), "two")]);
  await assert.rejects(
    promoteStagedDirectories({
      pairs: [
        { stagePath: stageA, finalPath: finalA },
        { stagePath: stageB, finalPath: finalB }
      ],
      beforePromote: (_targetPath, index) => {
        if (index === 1) throw new Error("simulated second promotion failure");
      }
    }),
    /simulated second promotion failure/
  );
  assert.equal(await exists(stageA), false);
  assert.equal(await exists(stageB), false);
  assert.equal(await exists(finalA), false);
  assert.equal(await exists(finalB), false);
});

test("staged-directory promotion refuses an existing target without overwriting it", async (context) => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-v2-duplicate-"));
  context.after(() => rm(tempRoot, { recursive: true, force: true }));
  const stage = path.join(tempRoot, ".stage");
  const existing = path.join(tempRoot, "existing");
  await Promise.all([mkdir(stage), mkdir(existing)]);
  await writeFile(path.join(existing, "keep.txt"), "keep");
  await assert.rejects(
    promoteStagedDirectories({ pairs: [{ stagePath: stage, finalPath: existing }] }),
    /Refusing to overwrite existing target/
  );
  assert.equal(await readFile(path.join(existing, "keep.txt"), "utf8"), "keep");
});
