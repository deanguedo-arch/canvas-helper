import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { load as loadHtml } from "cheerio";

import {
  classifyBiologyUnitSourceDisposition,
  loadBiologySourceModel
} from "../lib/biology30-unit-a/source.js";
import {
  BIOLOGY30_PROGRAM_OF_STUDIES_SHA256,
  BIOLOGY30_REMAINING_OUTCOMES,
  BIOLOGY30_UNIT_CURRICULA,
  validateBiology30RemainingCurriculum
} from "../lib/biology30-course/v1/curriculum.js";
import {
  BIOLOGY30_REMAINING_ARTIFACTS,
  BIOLOGY30_REMAINING_LESSONS,
  BIOLOGY30_REMAINING_MODULES,
  validateBiology30RemainingBlueprint
} from "../lib/biology30-course/v1/blueprint.js";
import {
  BIOLOGY30_PRODUCTION_FAMILY,
  BIOLOGY30_PRODUCTION_RESOURCE_ROOT,
  BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH,
  intakeBiology30RemainingUnits,
  validateBiology30SourceAndRightsRegister,
  type Biology30SourceAndRightsRegister,
  type RemainingUnitContract
} from "../lib/biology30-course/v1/intake.js";
import { BIOLOGY30_UNIT_B_CONTENT } from "../lib/biology30-course/v1/content-b.js";
import { BIOLOGY30_UNIT_C_CONTENT } from "../lib/biology30-course/v1/content-c.js";
import { BIOLOGY30_UNIT_D_CONTENT } from "../lib/biology30-course/v1/content-d.js";
import { BIOLOGY30_UNIT_B_GLOSSARY } from "../lib/biology30-course/v1/glossary-b.js";
import { BIOLOGY30_UNIT_C_GLOSSARY } from "../lib/biology30-course/v1/glossary-c.js";
import { BIOLOGY30_UNIT_D_GLOSSARY } from "../lib/biology30-course/v1/glossary-d.js";
import { validateBiology30LessonContent, type Biology30LessonContent } from "../lib/biology30-course/v1/content-types.js";
import {
  BIOLOGY30_CONCEPT_FIGURE_KIND_BY_LESSON,
  BIOLOGY30_CONCEPT_FIGURE_KINDS,
  validateBiology30ConceptFigureGrammar
} from "../lib/biology30-course/v1/figure-grammar.js";
import { renderBiology30ProductionUnit } from "../lib/biology30-course/v1/render.js";
import { buildWorstCaseBiology30ProductionState } from "../lib/biology30-course/v1/build.js";
import { expandBiology30SuspendData, serializeBiology30SuspendData } from "../lib/biology30-course/v1/suspend-data.js";
import type { NamedBrightspaceResource } from "../lib/science-comparison.js";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

const unitContracts = [
  {
    code: "B",
    title: "Unit B",
    chapters: [14, 15],
    expected: {
      "class-2026-27": { rootId: "1498072", itemCount: 40, quizCount: 2, questionCount: 58 },
      "system-2020": { rootId: "2366", itemCount: 82, quizCount: 0, questionCount: 0 }
    }
  },
  {
    code: "C",
    title: "Unit C",
    chapters: [16, 17, 18],
    expected: {
      "class-2026-27": { rootId: "1498073", itemCount: 65, quizCount: 3, questionCount: 79 },
      "system-2020": { rootId: "2448", itemCount: 138, quizCount: 0, questionCount: 0 }
    }
  },
  {
    code: "D",
    title: "Unit D",
    chapters: [19, 20],
    expected: {
      "class-2026-27": { rootId: "1498074", itemCount: 33, quizCount: 2, questionCount: 65 },
      "system-2020": { rootId: "2586", itemCount: 65, quizCount: 0, questionCount: 0 }
    }
  }
] as const;

const authoredUnits: Record<"B" | "C" | "D", { content: Biology30LessonContent[]; glossary: Record<string, string> }> = {
  B: { content: BIOLOGY30_UNIT_B_CONTENT, glossary: BIOLOGY30_UNIT_B_GLOSSARY },
  C: { content: BIOLOGY30_UNIT_C_CONTENT, glossary: BIOLOGY30_UNIT_C_GLOSSARY },
  D: { content: BIOLOGY30_UNIT_D_CONTENT, glossary: BIOLOGY30_UNIT_D_GLOSSARY }
};

async function loadProductionContract(unitCode: "B" | "C" | "D") {
  return JSON.parse(await readFile(
    path.join(repoRoot, BIOLOGY30_PRODUCTION_RESOURCE_ROOT, "units", `unit-${unitCode.toLowerCase()}`, "production-contract.json"),
    "utf8"
  )) as RemainingUnitContract;
}

async function loadResources() {
  const manifestPath = path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/resource-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { resources: NamedBrightspaceResource[] };
  return manifest.resources;
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

async function createRemainingUnitFixture() {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-remaining-intake-"));
  const resources = await loadResources();
  const familyDir = path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot");
  await mkdir(familyDir, { recursive: true });
  await writeFile(
    path.join(familyDir, "resource-manifest.json"),
    `${JSON.stringify({ schemaVersion: 2, family: "biology30-unit-a-pilot", resources }, null, 2)}\n`,
    "utf8"
  );
  for (const resource of resources) {
    const destination = path.join(fixtureRoot, resource.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await symlink(path.join(repoRoot, resource.path), destination);
  }
  return fixtureRoot;
}

test("the immutable Brightspace sources contain complete Unit B-D boundaries and practice banks", async () => {
  const resources = await loadResources();
  assert.deepEqual(resources.map((resource) => resource.id), ["class-2026-27", "system-2020"]);

  let visibleQuestionTotal = 0;
  for (const unit of unitContracts) {
    for (const resource of resources) {
      const model = await loadBiologySourceModel({
        repoRoot,
        resource,
        unitTitle: unit.title,
        chapterNumbers: [...unit.chapters]
      });
      const expected = unit.expected[resource.id as keyof typeof unit.expected];
      assert.ok(expected, `unexpected source ${resource.id}`);
      assert.equal(model.unitRoot.identifier, expected.rootId, `${unit.code}/${resource.id} root`);
      assert.equal(model.items.length, expected.itemCount, `${unit.code}/${resource.id} item inventory`);
      assert.equal(model.quizzes.length, expected.quizCount, `${unit.code}/${resource.id} visible quiz inventory`);
      const questionCount = model.quizzes.reduce((total, quiz) => total + quiz.questions.length, 0);
      assert.equal(questionCount, expected.questionCount, `${unit.code}/${resource.id} visible question inventory`);
      if (resource.id === "system-2020") {
        assert.ok(model.utf16HtmlPaths.length > 0, `${unit.code} system lessons exercise UTF-16 decoding`);
      }
      visibleQuestionTotal += questionCount;
    }
  }

  assert.equal(visibleQuestionTotal, 202, "Units B-D expose 202 source-visible questions for quality review");
});

test("the official curriculum baseline contains all 92 Unit B-D specific outcomes", () => {
  validateBiology30RemainingCurriculum();
  assert.equal(BIOLOGY30_PROGRAM_OF_STUDIES_SHA256, "07864cbe1e95b135ce87a8d6aa3339b38a9b8f414d2a4d10802e3d702922cb0f");
  assert.deepEqual(
    Object.fromEntries(Object.values(BIOLOGY30_UNIT_CURRICULA).map((unit) => [unit.code, unit.outcomes.length])),
    { B: 30, C: 35, D: 27 }
  );
  assert.equal(BIOLOGY30_REMAINING_OUTCOMES.length, 92);
  assert.equal(new Set(BIOLOGY30_REMAINING_OUTCOMES.map((outcome) => outcome.id)).size, 92);
  for (const unit of Object.values(BIOLOGY30_UNIT_CURRICULA)) {
    for (const generalOutcome of [1, 2, 3] as const) {
      assert.deepEqual(
        unit.outcomes.filter((outcome) => outcome.generalOutcome === generalOutcome && outcome.category === "skills").map((outcome) => outcome.id),
        [1, 2, 3, 4].map((number) => `${unit.code}${generalOutcome}.${number}s`)
      );
    }
  }
});

test("the remaining-unit blueprint is time-complete, source-explicit, and outcome-complete", () => {
  validateBiology30RemainingBlueprint();
  assert.deepEqual(
    Object.fromEntries(Object.entries(BIOLOGY30_REMAINING_LESSONS).map(([unit, lessons]) => [unit, lessons.length])),
    { B: 14, C: 24, D: 11 }
  );
  assert.equal(BIOLOGY30_REMAINING_MODULES.length, 12);
  assert.equal(BIOLOGY30_REMAINING_ARTIFACTS.filter((artifact) => artifact.unitCode === "B").length, 8);
  assert.equal(BIOLOGY30_REMAINING_ARTIFACTS.filter((artifact) => artifact.unitCode === "C").length, 12);
  assert.equal(BIOLOGY30_REMAINING_ARTIFACTS.filter((artifact) => artifact.unitCode === "D").length, 6);
});

test("all three authored units render their exact blocked learner inventories without platform or slide language", async () => {
  const expected = {
    B: { lessons: 14, routes: 20, practice: 86, artifacts: 8, glossary: 118 },
    C: { lessons: 24, routes: 30, practice: 160, artifacts: 12, glossary: 233 },
    D: { lessons: 11, routes: 17, practice: 72, artifacts: 6, glossary: 71 }
  } as const;
  for (const unitCode of ["B", "C", "D"] as const) {
    const contract = await loadProductionContract(unitCode);
    const authored = authoredUnits[unitCode];
    const counts = expected[unitCode];
    validateBiology30LessonContent(authored.content);
    if (unitCode === "C") {
      assert.equal(new Set(authored.content.map((lesson) => lesson.materials)).size, counts.lessons, "Unit C gives every lesson a specific materials list");
      assert.equal(new Set(authored.content.map((lesson) => lesson.safety)).size, counts.lessons, "Unit C gives every lesson a specific safety boundary");
      assert.ok(authored.content.every((lesson) => lesson.materials.includes("Investigation Notebook")), "Unit C keeps the learner evidence workflow visible");
      assert.ok(authored.content.every((lesson) => lesson.safety.length >= 120), "Unit C safety notes explain the lesson-specific boundary");
    }
    const rendered = renderBiology30ProductionUnit({ contract, contents: authored.content, glossary: authored.glossary });
    assert.equal(rendered.lessonIds.length, counts.lessons, `${unitCode} lessons`);
    assert.equal(rendered.learnerRouteIds.length, counts.routes, `${unitCode} routes`);
    assert.equal(rendered.practiceItems.length, counts.practice, `${unitCode} practice`);
    assert.equal(new Set(rendered.practiceItems.map((item) => item.prompt)).size, counts.practice, `${unitCode} practice prompts are unique`);
    const mixedPractice = rendered.practiceItems.filter((item) => /^module-\d+$/.test(item.setId) || item.setId === "final-practice");
    const taskLabels = {
      "remember-understand": "Mechanism recognition",
      apply: "Evidence application",
      "higher-mental-activity": "Evidence synthesis"
    } as const;
    assert.ok(mixedPractice.length > 0, `${unitCode} exposes mixed retrieval and transfer practice`);
    for (const item of mixedPractice) {
      assert.ok(new Set(item.linkedLessonIds).size >= 2, `${item.id} crosses lesson boundaries`);
      assert.match(item.prompt, new RegExp(taskLabels[item.cognitiveLevel]), `${item.id} uses a task matching its cognitive tag`);
      if (item.cognitiveLevel === "higher-mental-activity") {
        assert.match(item.prompt, /Evidence 1[\s\S]+Evidence 2/, `${item.id} requires two-source synthesis`);
      }
    }
    assert.ok(rendered.practiceItems.filter((item) => item.setId === "final-practice").every((item) => item.prompt.startsWith("Unit transfer")), `${unitCode} final practice is visibly transfer-oriented`);
    assert.ok(rendered.practiceItems.filter((item) => /^module-\d+$/.test(item.setId)).every((item) => item.prompt.startsWith("Module retrieval")), `${unitCode} module practice is visibly mixed retrieval`);
    assert.ok(mixedPractice.every((item) => Object.values(item.targetedFeedback).every((feedback) => feedback.length >= 80)), `${unitCode} mixed-practice feedback explains the specific reasoning error`);
    if (unitCode === "B" || unitCode === "C") {
      const lessonFeedback = rendered.practiceItems
        .filter((item) => item.setId.startsWith(`${unitCode.toLowerCase()}-lesson-`))
        .flatMap((item) => Object.values(item.targetedFeedback));
      assert.doesNotMatch(lessonFeedback.join("\n"), /This choice confuses two biological levels|This choice treats a changing biological process|This choice overgeneralizes from one case/);
      assert.ok(new Set(lessonFeedback).size >= Math.floor(lessonFeedback.length * 0.95), `${unitCode} lesson feedback is lesson-specific rather than boilerplate`);
    }
    assert.equal(rendered.artifactIds.length, counts.artifacts, `${unitCode} artifacts`);
    assert.equal(rendered.semanticFigureIds.length, counts.lessons, `${unitCode} semantic figures`);
    assert.equal(Object.keys(rendered.semanticFigureKinds).length, counts.lessons, `${unitCode} scientific figure grammar`);
    assert.ok(new Set(Object.values(rendered.semanticFigureKinds)).size >= 7, `${unitCode} uses at least seven scientific figure forms`);
    assert.equal(rendered.interactionIds.length, counts.lessons, `${unitCode} interactions`);
    assert.equal(Object.keys(rendered.interactionPresentationKinds).length, counts.lessons, `${unitCode} interaction presentation grammar`);
    assert.ok(new Set(Object.values(rendered.interactionPresentationKinds)).size >= 7, `${unitCode} uses at least seven interaction presentation forms`);
    assert.equal(rendered.glossaryTerms.length, counts.glossary, `${unitCode} glossary`);
    assert.equal(rendered.suspendDataSchema.profile, "biology30-compact-suspend-v2");
    assert.match(rendered.html, /I am learning to/);
    assert.match(rendered.html, /I can /);
    assert.doesNotMatch(rendered.html, /\b(?:SCORM|Brightspace|LMS)\b/i);
    assert.doesNotMatch(rendered.html, /slide (?:viewer|controls?)|primarily visual|comparison prototype/i);
    assert.doesNotMatch(rendered.html, /\b95(?:[- ]quality|\/100)\b/i);
    assert.doesNotMatch(rendered.html, /\b0\.\s+Apply the idea\b/i);
    assert.doesNotMatch(rendered.html, /Describe the pattern before naming a cause, connect each claim to a mechanism/i);
    assert.doesNotMatch(rendered.html, /Integrated transfer case|Module evidence check/);
    assert.match(rendered.html, /Question 1 · (?:Recall and connect|Apply the evidence|Evaluate the claim)/);
    assert.match(rendered.html, /Read the complete model as text/);
    if (unitCode === "B") {
      assert.match(rendered.html, /OpenStax Anatomy and Physiology 2e/);
      assert.match(rendered.html, /Sexual health and preventing sexually transmitted infections/);
      assert.match(rendered.html, /Assisted human reproduction/);
    } else {
      assert.match(rendered.html, /OpenStax Biology 2e/);
      assert.doesNotMatch(rendered.html, /OpenStax Anatomy and Physiology 2e/);
    }
    const $ = loadHtml(rendered.html);
    assert.equal($("[data-semantic-figure-id][data-figure-kind]").length, counts.lessons, `${unitCode} exposes a typed scientific model for each lesson`);
    $("[data-semantic-figure-id][data-figure-kind]").each((_index, element) => {
      const lessonId = $(element).closest("[data-biology-lesson]").attr("data-biology-lesson") ?? "";
      assert.equal($(element).attr("data-figure-kind"), BIOLOGY30_CONCEPT_FIGURE_KIND_BY_LESSON[lessonId], `${lessonId} keeps its explicit figure grammar`);
    });
    assert.equal($("[data-bio-interaction][data-interaction-kind]").length, counts.lessons, `${unitCode} exposes a typed interaction for each lesson`);
    assert.equal($("[data-bio-model-case]").length, counts.lessons * 3, `${unitCode} exposes three accessible evidence cases per interaction`);
    assert.equal($("[data-generic-model-select]").length, 0, `${unitCode} removes the legacy generic dropdown`);
    $("[data-bio-interaction][data-interaction-kind]").each((_index, element) => {
      const lessonId = $(element).closest("[data-biology-lesson]").attr("data-biology-lesson") ?? "";
      assert.equal($(element).attr("data-interaction-kind"), BIOLOGY30_CONCEPT_FIGURE_KIND_BY_LESSON[lessonId], `${lessonId} keeps its explicit interaction grammar`);
      assert.equal($(element).find("[data-bio-model-case]").length, 3, `${lessonId} has three interaction cases`);
    });
    assert.equal($("[src^='http'],[href^='http']:not([data-optional-enrichment])").length, 0, `${unitCode} has no required remote assets`);
  }
});

test("the scientific figure grammar explicitly covers all 49 lessons with all nine visual forms", () => {
  const entries = Object.entries(BIOLOGY30_CONCEPT_FIGURE_KIND_BY_LESSON);
  assert.equal(entries.length, 49);
  assert.deepEqual(
    Object.fromEntries((["B", "C", "D"] as const).map((unitCode) => [
      unitCode,
      entries.filter(([lessonId]) => lessonId.startsWith(`${unitCode.toLowerCase()}-lesson-`)).length
    ])),
    { B: 14, C: 24, D: 11 }
  );
  assert.deepEqual([...new Set(entries.map(([, kind]) => kind))].sort(), [...BIOLOGY30_CONCEPT_FIGURE_KINDS].sort());
  for (const unitCode of ["b", "c", "d"] as const) {
    validateBiology30ConceptFigureGrammar(entries.filter(([lessonId]) => lessonId.startsWith(`${unitCode}-lesson-`)).map(([lessonId]) => lessonId));
  }
  assert.throws(() => validateBiology30ConceptFigureGrammar(["b-lesson-01", "missing-lesson"]), /incomplete/);
  assert.throws(() => validateBiology30ConceptFigureGrammar(["b-lesson-01", "b-lesson-01"]), /duplicate/);
});

test("the compact LMS envelope round-trips every B-D learner-state category below the 48,000-character guard", async () => {
  for (const unitCode of ["B", "C", "D"] as const) {
    const contract = await loadProductionContract(unitCode);
    const authored = authoredUnits[unitCode];
    const rendered = renderBiology30ProductionUnit({ contract, contents: authored.content, glossary: authored.glossary });
    const state = buildWorstCaseBiology30ProductionState(contract, rendered);
    const serialized = serializeBiology30SuspendData(state, rendered.suspendDataSchema);
    assert.ok(serialized.length < 48_000, `${unitCode} compact state is ${serialized.length} characters`);
    const expanded = expandBiology30SuspendData(JSON.parse(serialized), rendered.suspendDataSchema, rendered.activities);
    assert.deepEqual(expanded.responses, state.responses, `${unitCode} responses round-trip`);
    assert.deepEqual(expanded.practice, state.practice, `${unitCode} practice round-trips`);
    assert.deepEqual(expanded.completions, state.completions, `${unitCode} completion routes round-trip`);
    assert.deepEqual(Object.keys(expanded.artifacts), Object.keys(state.artifacts), `${unitCode} artifact completion round-trips`);
    assert.deepEqual(
      expanded.notebook.map((entry) => [entry.title, entry.body]),
      state.notebook.map((entry) => [entry.title, entry.body]),
      `${unitCode} notebook content round-trips`
    );
    assert.deepEqual(expanded.finalPractice, state.finalPractice, `${unitCode} final practice round-trips`);
  }
});

test("chapter filtering cannot leak another Biology 30 unit's quizzes", async () => {
  const classSource = (await loadResources()).find((resource) => resource.id === "class-2026-27");
  assert.ok(classSource);

  for (const unit of unitContracts) {
    const model = await loadBiologySourceModel({
      repoRoot,
      resource: classSource,
      unitTitle: unit.title,
      chapterNumbers: [...unit.chapters]
    });
    for (const quiz of model.quizzes) {
      assert.ok(
        unit.chapters.some((chapter) => new RegExp(`chapter\\s+${chapter}\\s+quiz`, "i").test(quiz.title)),
        `${unit.code} contains an out-of-boundary quiz: ${quiz.title}`
      );
    }
  }
});

test("every remaining unit excludes secure tests and transforms only visible chapter quizzes", async () => {
  const classSource = (await loadResources()).find((resource) => resource.id === "class-2026-27");
  assert.ok(classSource);

  for (const unit of unitContracts) {
    const model = await loadBiologySourceModel({
      repoRoot,
      resource: classSource,
      unitTitle: unit.title,
      chapterNumbers: [...unit.chapters]
    });
    const dispositions = classifyBiologyUnitSourceDisposition(model, {
      unitCode: unit.code,
      boundaryLabel: unit.title
    });
    const secureTests = dispositions.filter((record) => /unit\s+[b-d]\s+(?:test|exam)/i.test(record.title));
    assert.ok(secureTests.length > 0, `${unit.code} has an explicit secure-test disposition`);
    assert.ok(
      secureTests.every((record) => record.disposition === "excluded-teacher-assessment"),
      `${unit.code} secure tests remain excluded`
    );
    const transformedPractice = dispositions.filter((record) => record.disposition === "transformed-practice");
    assert.equal(transformedPractice.length, unit.expected["class-2026-27"].quizCount);
    assert.ok(transformedPractice.every((record) => record.visibleInSource));
    assert.ok(
      dispositions
        .filter((record) => /quiz.*(?:printable|key)|(?:printable|key).*quiz/i.test(record.title))
        .every((record) => record.disposition === "excluded-assessment-material"),
      `${unit.code} printable quizzes and keys remain excluded`
    );
  }
});

test("source intake rejects an empty or invalid chapter contract", async () => {
  const classSource = (await loadResources()).find((resource) => resource.id === "class-2026-27");
  assert.ok(classSource);

  await assert.rejects(
    loadBiologySourceModel({ repoRoot, resource: classSource, unitTitle: "Unit B", chapterNumbers: [] }),
    /requires at least one valid chapter number/
  );
  await assert.rejects(
    loadBiologySourceModel({ repoRoot, resource: classSource, unitTitle: "Unit B", chapterNumbers: [14, 0] }),
    /requires at least one valid chapter number/
  );
});

test("the canonical source-PDF review covers all 395 pages and binds every flagged page to a correction", async () => {
  const resourceDir = path.join(repoRoot, BIOLOGY30_PRODUCTION_RESOURCE_ROOT);
  const [family, manifest, review, dispositions, ledger] = await Promise.all([
    readFile(path.join(resourceDir, "family-contract.json"), "utf8").then((value) => JSON.parse(value) as { sourcePdfVisualReviewPath: string }),
    readFile(path.join(resourceDir, "source-pdf-manifest.json"), "utf8").then((value) => JSON.parse(value) as {
      visualReviewRecordPath: string;
      noteSources: Array<{ sourceId: string; sha256: string; pageCount: number; visualReviewStatus: string }>;
    }),
    readFile(path.join(resourceDir, "source-pdf-visual-review.json"), "utf8").then((value) => JSON.parse(value) as {
      status: string;
      scope: { sourceCount: number; pageCount: number; contactSheetCount: number; allPagesRendered: boolean; allListedContactSheetsOpened: boolean; learnerDeliveryUsesRenderedSourcePages: boolean };
      evidence: { auditIndexSha256: string; orderedContactSheetHashListSha256: string };
      sources: Array<{ sourceId: string; sha256: string; pageCount: number; contactSheetCount: number; correctionIds: string[] }>;
      checks: { pass: boolean; binaryBlockerFound: boolean };
      humanCourseAcceptance: null;
    }),
    readFile(path.join(resourceDir, "notes-page-disposition.json"), "utf8").then((value) => JSON.parse(value) as {
      entries: Array<{ sourceId: string; page: number; status: string; correctionIds: string[] }>;
    }),
    readFile(path.join(resourceDir, "factual-correction-ledger.json"), "utf8").then((value) => JSON.parse(value) as {
      entries: Array<{ id: string; sourceId: string; pages: number[] }>;
    })
  ]);

  assert.equal(family.sourcePdfVisualReviewPath, manifest.visualReviewRecordPath);
  assert.equal(review.status, "complete-authoring-reference-review");
  assert.deepEqual(review.scope, {
    sourceCount: 5,
    pageCount: 395,
    contactSheetCount: 35,
    allPagesRendered: true,
    allListedContactSheetsOpened: true,
    learnerDeliveryUsesRenderedSourcePages: false
  });
  assert.match(review.evidence.auditIndexSha256, /^[a-f0-9]{64}$/);
  assert.match(review.evidence.orderedContactSheetHashListSha256, /^[a-f0-9]{64}$/);
  assert.equal(review.sources.reduce((total, source) => total + source.pageCount, 0), 395);
  assert.equal(review.sources.reduce((total, source) => total + source.contactSheetCount, 0), 35);
  assert.equal(review.checks.pass, true);
  assert.equal(review.checks.binaryBlockerFound, false);
  assert.equal(review.humanCourseAcceptance, null);
  assert.ok(manifest.noteSources.every((source) => source.visualReviewStatus === "complete-authoring-reference-review"));

  const manifestBySource = new Map(manifest.noteSources.map((source) => [source.sourceId, source]));
  for (const source of review.sources) {
    const expected = manifestBySource.get(source.sourceId);
    assert.ok(expected, `Missing PDF manifest entry for ${source.sourceId}.`);
    assert.equal(source.sha256, expected.sha256);
    assert.equal(source.pageCount, expected.pageCount);
  }

  assert.equal(dispositions.entries.length, 395);
  for (const correction of ledger.entries) {
    for (const page of correction.pages) {
      const disposition = dispositions.entries.find((entry) => entry.sourceId === correction.sourceId && entry.page === page);
      assert.ok(disposition, `Missing disposition for ${correction.sourceId} page ${page}.`);
      assert.equal(disposition.status, "corrected");
      assert.ok(disposition.correctionIds.includes(correction.id), `Missing ${correction.id} on ${correction.sourceId} page ${page}.`);
    }
  }
});

test("AI score recommendations reach 95 without populating or authorizing human acceptance", async () => {
  for (const unitCode of ["b", "c", "d"] as const) {
    const projectDir = path.join(repoRoot, "projects", `biology30-unit-${unitCode}`);
    const recommendation = JSON.parse(await readFile(path.join(projectDir, "meta/agent-score-recommendation.json"), "utf8")) as {
      projectSlug: string;
      buildSha256: string;
      recommendationOnly: boolean;
      recommendedScores: Array<{ score: number; available: number; minimum: number; evidencePaths: string[] }>;
      recommendedTotal: number;
      everyCategoryMinimumMet: boolean;
      automatedOrVisualBinaryBlockersFound: number;
      humanAcceptanceRecord: { path: string; scoresRemainBlank: boolean; decisionRemainsNull: boolean; userConfirmedRemainsFalse: boolean };
      authorization: Record<string, boolean>;
    };
    const quality = JSON.parse(await readFile(path.join(projectDir, "meta/quality-readiness-evidence.json"), "utf8")) as {
      buildSha256: string;
      agentScoreRecommendation: { path: string; recommendedTotal: number; authorizing: boolean };
      humanTotal: number | null;
      humanDecision: string | null;
      promotionAuthorized: boolean;
      exportAuthorized: boolean;
    };
    const matrix = JSON.parse(await readFile(path.join(projectDir, "meta/acceptance-matrix.json"), "utf8")) as {
      buildSha256: string;
      categories: Array<{ score: number | null }>;
      humanDecision: string | null;
    };
    const humanTemplate = JSON.parse(await readFile(path.join(projectDir, "meta/human-acceptance-template.json"), "utf8")) as {
      acceptedBuildSha256: string;
      categoryScores: Record<string, number>;
      totalScore: number | null;
      decision: string | null;
      userConfirmed: boolean;
    };

    assert.equal(recommendation.projectSlug, `biology30-unit-${unitCode}`);
    assert.equal(recommendation.recommendationOnly, true);
    assert.equal(recommendation.recommendedScores.length, 7);
    assert.equal(recommendation.recommendedScores.reduce((total, category) => total + category.score, 0), 95);
    assert.equal(recommendation.recommendedTotal, 95);
    assert.equal(recommendation.everyCategoryMinimumMet, true);
    assert.ok(recommendation.recommendedScores.every((category) => category.score >= category.minimum && category.score <= category.available));
    assert.equal(recommendation.automatedOrVisualBinaryBlockersFound, 0);
    assert.ok(Object.values(recommendation.authorization).every((value) => value === false));
    assert.deepEqual(recommendation.humanAcceptanceRecord, {
      path: "meta/human-acceptance-template.json",
      scoresRemainBlank: true,
      decisionRemainsNull: true,
      userConfirmedRemainsFalse: true
    });
    for (const evidencePath of recommendation.recommendedScores.flatMap((category) => category.evidencePaths)) {
      assert.equal(await exists(path.resolve(projectDir, evidencePath)), true, `${unitCode} recommendation evidence exists: ${evidencePath}`);
    }

    assert.equal(quality.buildSha256, recommendation.buildSha256);
    assert.deepEqual(quality.agentScoreRecommendation, {
      path: "meta/agent-score-recommendation.json",
      recommendedTotal: 95,
      authorizing: false
    });
    assert.equal(quality.humanTotal, null);
    assert.equal(quality.humanDecision, null);
    assert.equal(quality.promotionAuthorized, false);
    assert.equal(quality.exportAuthorized, false);
    assert.equal(matrix.buildSha256, recommendation.buildSha256);
    assert.ok(matrix.categories.every((category) => category.score === null));
    assert.equal(matrix.humanDecision, null);
    assert.equal(humanTemplate.acceptedBuildSha256, recommendation.buildSha256);
    assert.deepEqual(humanTemplate.categoryScores, {});
    assert.equal(humanTemplate.totalScore, null);
    assert.equal(humanTemplate.decision, null);
    assert.equal(humanTemplate.userConfirmed, false);
  }
});

test("transactional intake creates exactly three blocked 95-point proposals and refuses duplicates", async (context) => {
  const fixtureRoot = await createRemainingUnitFixture();
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }));

  const result = await intakeBiology30RemainingUnits({
    repoRoot: fixtureRoot,
    family: BIOLOGY30_PRODUCTION_FAMILY
  });
  assert.equal(result.projectDirs.length, 3);
  assert.equal(result.sourceCatalog.sources.reduce((total, source) => total + source.itemCount, 0), 423);
  assert.equal(result.sourceCatalog.sources.reduce((total, source) => total + source.utf16HtmlCount, 0), 237);
  assert.equal(result.sourceCatalog.visibleQuizzes.reduce((total, quiz) => total + quiz.questionCount, 0), 202);
  assert.equal(result.noteSources.reduce((total, source) => total + source.pageCount, 0), 395);

  const resourceDir = path.join(fixtureRoot, BIOLOGY30_PRODUCTION_RESOURCE_ROOT);
  const familyContract = JSON.parse(await readFile(path.join(resourceDir, "family-contract.json"), "utf8")) as {
    quality: { minimumScore: number; automaticPromotion: boolean };
    aggregate: { outcomes: number; lessons: number; practiceItems: number; notesPages: number };
  };
  assert.deepEqual(familyContract.quality, { minimumScore: 95, automaticPromotion: false, noBinaryBlockers: true });
  assert.deepEqual(familyContract.aggregate, {
    outcomes: 92,
    lessons: 49,
    requiredMinutes: 4500,
    optionalMinutes: 900,
    practiceItems: 318,
    sourceVisibleQuestions: 202,
    notesPages: 395
  });
  const dispositions = JSON.parse(await readFile(path.join(resourceDir, "notes-page-disposition.json"), "utf8")) as {
    entries: unknown[];
  };
  assert.equal(dispositions.entries.length, 395);
  const rightsRegister = JSON.parse(await readFile(path.join(fixtureRoot, BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH), "utf8")) as Biology30SourceAndRightsRegister;
  const contracts = await Promise.all((["b", "c", "d"] as const).map((unitCode) =>
    readFile(path.join(resourceDir, "units", `unit-${unitCode}`, "production-contract.json"), "utf8").then((value) => JSON.parse(value) as RemainingUnitContract)
  ));
  validateBiology30SourceAndRightsRegister(rightsRegister, contracts);
  assert.equal(rightsRegister.sources.length, 16);
  assert.equal(rightsRegister.uses.some((use) => use.sourceId === "canada-sti-guidance" && use.lessonIds?.includes("b-lesson-07")), true);
  assert.equal(rightsRegister.uses.some((use) => use.sourceId === "canada-assisted-human-reproduction" && use.lessonIds?.includes("b-lesson-13")), true);

  for (const unitCode of ["b", "c", "d"] as const) {
    const slug = `biology30-unit-${unitCode}`;
    const projectDir = path.join(fixtureRoot, "projects", slug);
    const manifest = JSON.parse(await readFile(path.join(projectDir, "meta/project.json"), "utf8")) as {
      authoringStatus: string;
      authoring: { driverId: string; studioEditing: { enabled: boolean } };
      exportTargets: Array<{ enabled: boolean }>;
    };
    assert.equal(manifest.authoringStatus, "blocked");
    assert.equal(manifest.authoring.driverId, "proposal-only-v1");
    assert.equal(manifest.authoring.studioEditing.enabled, false);
    assert.ok(manifest.exportTargets.every((target) => target.enabled === false));
    assert.equal(await exists(path.join(projectDir, "workspace/index.html")), true);
  }

  const beforeDuplicate = await readFile(path.join(resourceDir, "family-contract.json"), "utf8");
  await assert.rejects(
    intakeBiology30RemainingUnits({ repoRoot: fixtureRoot, family: BIOLOGY30_PRODUCTION_FAMILY }),
    /refuses existing targets/
  );
  assert.equal(await readFile(path.join(resourceDir, "family-contract.json"), "utf8"), beforeDuplicate);
});

test("transactional intake rolls back every promoted B-D target after a mid-commit failure", async (context) => {
  const fixtureRoot = await createRemainingUnitFixture();
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }));

  await assert.rejects(
    intakeBiology30RemainingUnits({
      repoRoot: fixtureRoot,
      family: BIOLOGY30_PRODUCTION_FAMILY,
      testHooks: {
        beforePromote: (_targetPath, index) => {
          if (index === 2) throw new Error("simulated Unit C promotion failure");
        }
      }
    }),
    /simulated Unit C promotion failure/
  );

  assert.equal(await exists(path.join(fixtureRoot, BIOLOGY30_PRODUCTION_RESOURCE_ROOT)), false);
  for (const unitCode of ["b", "c", "d"]) {
    assert.equal(await exists(path.join(fixtureRoot, "projects", `biology30-unit-${unitCode}`)), false);
  }
  const resourceEntries = await readdir(path.join(fixtureRoot, "projects/resources"));
  assert.equal(resourceEntries.some((entry) => entry.startsWith(".biology30-production-intake-")), false);
});
