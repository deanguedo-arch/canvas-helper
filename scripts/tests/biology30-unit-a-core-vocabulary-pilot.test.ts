import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { load as loadHtml } from "cheerio";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const projectDir = path.join(repoRoot, "projects/biology30-unit-a-pilot");
const workspacePath = path.join(projectDir, "workspace/index.html");
const vocabularyPath = path.join(projectDir, "meta/core-vocabulary.json");
const projectPath = path.join(projectDir, "meta/project.json");
const productionContractPath = path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/v2/production-contract.json");

const EXPECTED_ENTRY_IDS = [
  "homeostasis",
  "regulated-variable-set-point",
  "control-system-roles",
  "negative-feedback",
  "scientific-explanation",
  "neuron-structure",
  "myelin-conduction",
  "resting-membrane-potential",
  "action-potential",
  "membrane-potential-phases",
  "refractory-period",
  "synaptic-transmission",
  "central-peripheral-systems",
  "somatic-autonomic-systems",
  "sympathetic-parasympathetic",
  "reflex-arc",
  "sensory-transduction",
  "sensory-receptor-classes",
  "sensory-adaptation",
  "vision-pathway",
  "hearing-equilibrium-pathway",
  "endocrine-signalling",
  "hypothalamus-pituitary-axis",
  "antagonistic-hormones",
  "thyroid-calcium-feedback",
  "blood-glucose-regulation",
  "water-salt-regulation",
  "stress-response"
] as const;

const EXPECTED_SLICE_IDS = [
  "homeostasis",
  "action-potential",
  "sympathetic-parasympathetic",
  "sensory-transduction",
  "endocrine-signalling"
] as const;

const EXPECTED_FIXED = [
  ["Systems and Signals", "negative-feedback"],
  ["Neural Communication", "action-potential"],
  ["Nervous Control", "reflex-arc"],
  ["Sensory Systems", "sensory-transduction"],
  ["Endocrine Control", "endocrine-signalling"],
  ["Integration", "homeostasis"]
] as const;

const EXPECTED_WORD_LENS: Record<string, readonly string[]> = {
  "lesson-01": ["homeostasis", "regulated-variable-set-point", "control-system-roles"],
  "lesson-02": ["negative-feedback", "endocrine-signalling"],
  "lesson-03": ["neuron-structure", "myelin-conduction"],
  "lesson-04": ["resting-membrane-potential", "action-potential", "membrane-potential-phases"],
  "lesson-05": ["synaptic-transmission"],
  "lesson-06": ["central-peripheral-systems", "somatic-autonomic-systems", "sympathetic-parasympathetic"],
  "lesson-07": ["reflex-arc"],
  "lesson-08": ["sensory-transduction", "sensory-receptor-classes", "sensory-adaptation"],
  "lesson-09": ["sensory-transduction", "vision-pathway"],
  "lesson-10": ["sensory-transduction", "hearing-equilibrium-pathway"],
  "lesson-11": ["scientific-explanation", "sensory-adaptation"],
  "lesson-12": ["endocrine-signalling", "negative-feedback"],
  "lesson-13": ["hypothalamus-pituitary-axis", "water-salt-regulation"],
  "lesson-14": ["thyroid-calcium-feedback", "antagonistic-hormones"],
  "lesson-15": ["blood-glucose-regulation", "antagonistic-hormones"],
  "lesson-16": ["stress-response", "water-salt-regulation"],
  "lesson-17": ["homeostasis", "negative-feedback", "scientific-explanation"]
};

const FRAYER_FIELDS = ["definition", "characteristics", "example", "non-example"] as const;
const MODEL_FRAYER_FIELDS = ["definition", "characteristics", "example", "nonExample"] as const;
const TEXTBOOK_OFFSETS: Record<string, number> = {
  "chapter-11": 359,
  "chapter-12": 403,
  "chapter-13": 433
};

type Source = {
  id: string;
  sourceId?: string;
  sourcePath?: string;
  pdfPages?: number[];
  path?: string;
  url?: string;
  rightsStatus: string;
  usage: string;
};

type VocabularyEntry = {
  id: string;
  label: string;
  category: string;
  familyTerms: string[];
  primaryLessonIds: string[];
  outcomeIds: string[];
  learnerDefinition: string;
  mechanism: string;
  wordAnalysis: {
    kind: "morpheme" | "word-family" | "acronym" | "name-history" | "whole-phrase";
    parts: Array<{ text: string; meaning: string }>;
    caution?: string;
  };
  relatedTerms: string[];
  commonConfusion: string;
  retrievalPrompt: string;
  textbookRefs: Array<{ documentId: string; printedPage: number; physicalPage: number; support: "direct" | "closest" }>;
  practiceIds: string[];
  modelId: string;
  modelFrayer: Record<(typeof MODEL_FRAYER_FIELDS)[number], string>;
  sourceRefIds: string[];
  fixedMilestone?: string;
};

type VocabularyContract = {
  schemaVersion: number;
  profileId: string;
  project: string;
  status: string;
  baseline: {
    workspaceSha256: string;
    glossaryEntryCount: number;
    suspendStateVersion: number;
    worstCaseCharacters: number;
    buildGuardCharacters: number;
  };
  learnerPolicy: {
    conceptFamilyCount: number;
    fixedFrayerCount: number;
    choiceFrayerCount: number;
    maximumCollectedCount: number;
    fieldMaximumCharacters: number;
    completionGating: boolean;
    scoreImpact: boolean;
    requiredMinuteImpact: boolean;
    fullGlossaryPreserved: boolean;
    targetMaximumSuspendCharacters: number;
  };
  responseContract: {
    idTemplate: string;
    fieldIds: string[];
    possibleResponseIdCount: number;
    maximumPersistedEntryCount: number;
    maximumPersistedResponseCount: number;
    fieldMaximumCharacters: number;
  };
  verticalSliceEntryIds: string[];
  stage1Review: {
    status: string;
    workspaceSha256: string;
    workspaceTreeSha256: string;
    visualReportPath: string;
    visualReportSha256: string;
    contactSheetCount: number;
    allContactSheetsOpened: boolean;
    geometryFindingCount: number;
    conservativeWorstCaseStateCharacters: number;
    remainingCharactersBelowBuildGuard: number;
    teacherAcceptance: string;
    acceptedAt?: string;
    acceptanceStatement?: string;
    stage2Authorized: boolean;
  };
  stage2Review: {
    status: string;
    workspaceSha256: string;
    workspaceTreeSha256: string;
    visualReportPath: string;
    visualReportSha256: string;
    contactSheetCount: number;
    allContactSheetsOpened: boolean;
    conceptEntryViewportCount: number;
    conceptStateViewportCount: number;
    wordLensViewportCount: number;
    zoomViewportCount: number;
    geometryFindingCount: number;
    blockedExternalRequestCount: number;
    blockedExternalRequestExplanation: string;
    conservativeWorstCaseStateCharacters: number;
    remainingCharactersBelowBuildGuard: number;
    teacherAcceptance: string;
  };
  categories: Array<{ id: string; label: string }>;
  fixedMilestones: Array<{ module: string; entryId: string }>;
  sources: Source[];
  entries: VocabularyEntry[];
};

test("Core Vocabulary contract declares 28 exact, sourced concept families and eight Frayer slots", async () => {
  const [vocabularyText, productionText, html] = await Promise.all([
    readFile(vocabularyPath, "utf8"),
    readFile(productionContractPath, "utf8"),
    readFile(workspacePath, "utf8")
  ]);
  const contract = JSON.parse(vocabularyText) as VocabularyContract;
  const production = JSON.parse(productionText) as {
    lessons: Array<{ id: string }>;
    outcomes: Array<{ id: string }>;
    sourceRefs: Array<{ id: string; sourceId?: string; sourcePath?: string; pdfPages?: number[] }>;
  };
  const $ = loadHtml(html);
  const lessonIds = new Set(production.lessons.map((lesson) => lesson.id));
  const outcomeIds = new Set(production.outcomes.map((outcome) => outcome.id));
  const practiceIds = new Set($("[data-practice-id]").map((_index, node) => $(node).attr("data-practice-id") ?? "").get());
  const modelIds = new Set($("[data-bio-interaction]").map((_index, node) => $(node).attr("data-bio-interaction") ?? "").get());
  const sourceById = new Map(contract.sources.map((source) => [source.id, source]));
  const productionSourceById = new Map(production.sourceRefs.map((source) => [source.id, source]));

  assert.equal(contract.schemaVersion, 1);
  assert.equal(contract.profileId, "biology30-unit-a-core-vocabulary-pilot-v1");
  assert.equal(contract.project, "biology30-unit-a-pilot");
  assert.equal(contract.status, "stage-2-codex-verified-awaiting-teacher-review");
  assert.deepEqual(contract.entries.map((entry) => entry.id), EXPECTED_ENTRY_IDS);
  assert.equal(new Set(contract.entries.map((entry) => entry.id)).size, 28);
  assert.deepEqual(contract.verticalSliceEntryIds, EXPECTED_SLICE_IDS);
  assert.deepEqual(contract.stage1Review, {
    status: "teacher-accepted",
    workspaceSha256: "1b283ef4795a01ecefdbfbeb1bdd290e77210967fd1f0012b7b5f71a35bd2c47",
    workspaceTreeSha256: "2f2b7b3d80332ba073a6dbd6bccedb98d575e7f343c2e4106fe53ba0abbc4c70",
    visualReportPath: ".runtime/biology30-unit-a-core-vocabulary-pilot-visual-audit/2026-09-02T20-18-11-917Z/visual-audit.json",
    visualReportSha256: "fabd5a6a9fbd4fcbf85ef4b14a9817254c9bd7f256c0f60c6b1487c6cadf9c97",
    contactSheetCount: 7,
    allContactSheetsOpened: true,
    geometryFindingCount: 0,
    conservativeWorstCaseStateCharacters: 41378,
    remainingCharactersBelowBuildGuard: 6622,
    teacherAcceptance: "accepted",
    acceptedAt: "2026-09-02",
    acceptanceStatement: "The teacher explicitly approved proceeding from the reviewed representative slice to the complete 28-family Unit A implementation in this conversation.",
    stage2Authorized: true
  });
  const currentWorkspaceSha256 = createHash("sha256").update(html).digest("hex");
  assert.notEqual(currentWorkspaceSha256, contract.stage1Review.workspaceSha256, "Stage 2 must not rewrite the accepted Stage 1 evidence hash");
  assert.deepEqual(contract.stage2Review, {
    status: "codex-verified-awaiting-teacher-review",
    workspaceSha256: "b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee",
    workspaceTreeSha256: "61396aee1fec5e4c35fd408a2629ca05abda82df584a2db47e46444c37e361dc",
    visualReportPath: ".runtime/biology30-unit-a-core-vocabulary-pilot-visual-audit/2026-09-03T01-08-03-419Z/visual-audit.json",
    visualReportSha256: "6fac8fd887e27509bc4f0183ecbabaea9496396af928c11a516c439e36ed6db0",
    contactSheetCount: 7,
    allContactSheetsOpened: true,
    conceptEntryViewportCount: 84,
    conceptStateViewportCount: 30,
    wordLensViewportCount: 51,
    zoomViewportCount: 2,
    geometryFindingCount: 0,
    blockedExternalRequestCount: 12,
    blockedExternalRequestExplanation: "The blocked requests are the 12 pre-existing optional YouTube previews on lessons whose Word Lens placements were inspected. Core Vocabulary remains locally complete and no required vocabulary instruction depends on those requests.",
    conservativeWorstCaseStateCharacters: 41378,
    remainingCharactersBelowBuildGuard: 6622,
    teacherAcceptance: "pending"
  });
  assert.equal(currentWorkspaceSha256, contract.stage2Review.workspaceSha256);
  const visualReport = await readFile(path.join(repoRoot, contract.stage2Review.visualReportPath));
  assert.equal(createHash("sha256").update(visualReport).digest("hex"), contract.stage2Review.visualReportSha256);
  assert.deepEqual(contract.fixedMilestones.map((record) => [record.module, record.entryId]), EXPECTED_FIXED);
  assert.equal(new Set(contract.fixedMilestones.map((record) => record.entryId)).size, 6);
  assert.deepEqual(contract.learnerPolicy, {
    conceptFamilyCount: 28,
    fixedFrayerCount: 6,
    choiceFrayerCount: 2,
    maximumCollectedCount: 8,
    fieldMaximumCharacters: 240,
    completionGating: false,
    scoreImpact: false,
    requiredMinuteImpact: false,
    fullGlossaryPreserved: true,
    targetMaximumSuspendCharacters: 44000
  });
  assert.deepEqual(contract.responseContract, {
    idTemplate: "biology30-unit-a-pilot:core-vocabulary:<entry-id>:<field-id>",
    fieldIds: FRAYER_FIELDS,
    possibleResponseIdCount: 112,
    maximumPersistedEntryCount: 8,
    maximumPersistedResponseCount: 32,
    fieldMaximumCharacters: 240
  });

  const categoryIds = new Set(contract.categories.map((category) => category.id));
  assert.equal(categoryIds.size, 6);
  assert.equal(new Set(contract.sources.map((source) => source.id)).size, contract.sources.length);
  assert.ok(contract.sources.every((source) => source.rightsStatus && source.usage));

  for (const source of contract.sources.filter((record) => record.sourceId === "unit-a-notes")) {
    const productionSource = productionSourceById.get(source.id);
    assert.ok(productionSource, `${source.id} must reuse the production source record`);
    assert.equal(source.sourcePath, productionSource?.sourcePath, source.id);
    assert.deepEqual(source.pdfPages, productionSource?.pdfPages, source.id);
  }

  for (const entry of contract.entries) {
    assert.ok(entry.label && entry.learnerDefinition && entry.mechanism && entry.commonConfusion && entry.retrievalPrompt, entry.id);
    assert.ok(categoryIds.has(entry.category), entry.id);
    assert.ok(entry.familyTerms.length >= 2, entry.id);
    assert.ok(entry.primaryLessonIds.length >= 1 && entry.primaryLessonIds.every((id) => lessonIds.has(id)), entry.id);
    assert.ok(entry.outcomeIds.length >= 1 && entry.outcomeIds.every((id) => outcomeIds.has(id)), entry.id);
    assert.ok(entry.practiceIds.length >= 1 && entry.practiceIds.every((id) => practiceIds.has(id)), entry.id);
    assert.ok(modelIds.has(entry.modelId), entry.id);
    assert.ok(entry.wordAnalysis.parts.length >= 1, entry.id);
    assert.ok(["morpheme", "word-family", "acronym", "name-history", "whole-phrase"].includes(entry.wordAnalysis.kind), entry.id);
    assert.ok(entry.relatedTerms.length >= 2, entry.id);
    assert.ok(entry.textbookRefs.length >= 1, entry.id);
    assert.ok(entry.sourceRefIds.length >= 1 && entry.sourceRefIds.every((id) => sourceById.has(id)), entry.id);
    for (const ref of entry.textbookRefs) {
      assert.ok(Object.hasOwn(TEXTBOOK_OFFSETS, ref.documentId), `${entry.id}: ${ref.documentId}`);
      assert.equal(ref.printedPage - ref.physicalPage, TEXTBOOK_OFFSETS[ref.documentId], entry.id);
      assert.ok(ref.support === "direct" || ref.support === "closest", entry.id);
    }
    for (const field of MODEL_FRAYER_FIELDS) {
      assert.ok(entry.modelFrayer[field].trim(), `${entry.id}: ${field}`);
      assert.ok(entry.modelFrayer[field].length <= 240, `${entry.id}: ${field}`);
    }
  }

  const opaqueEntries = new Map(contract.entries.map((entry) => [entry.id, entry]));
  assert.equal(opaqueEntries.get("sympathetic-parasympathetic")?.wordAnalysis.kind, "name-history");
  assert.match(opaqueEntries.get("sympathetic-parasympathetic")?.wordAnalysis.caution ?? "", /do not predict|cannot predict|not predict/i);
  assert.match(opaqueEntries.get("endocrine-signalling")?.commonConfusion ?? "", /receptor/i);
  assert.match(opaqueEntries.get("homeostasis")?.commonConfusion ?? "", /not.*constant|does not mean.*constant/i);
});

test("Stage 2 renders all 28 concept families, six fixed Frayers, and the complete lesson integration", async () => {
  const [html, vocabularyText] = await Promise.all([readFile(workspacePath, "utf8"), readFile(vocabularyPath, "utf8")]);
  const contract = JSON.parse(vocabularyText) as VocabularyContract;
  const $ = loadHtml(html);
  const route = $("#core-vocabulary");

  assert.equal($(".course-page").length, 32);
  assert.equal(route.length, 1);
  assert.equal(route.find("h1").text().trim(), "Core Vocabulary");
  assert.equal($("[data-glossary-index] article").length, 109, "the complete glossary must remain intact");
  assert.equal($("[data-page-target='core-vocabulary']").first().prev("[data-page-target='overview']").length, 1);
  assert.equal(route.find("[data-vocabulary-search]").length, 1);
  assert.equal(route.find("[data-vocabulary-filter]").length, 1);
  assert.equal(route.find("[data-vocabulary-entry-select]").length, 1);
  assert.equal(route.attr("data-core-vocabulary-profile"), "full-v1");
  assert.deepEqual(route.find("[data-vocabulary-entry-target]").map((_index, node) => $(node).attr("data-vocabulary-entry-target")).get(), EXPECTED_ENTRY_IDS);
  assert.deepEqual(route.find("[data-vocabulary-entry-select] option").map((_index, node) => $(node).attr("value")).get(), EXPECTED_ENTRY_IDS);
  const renderedEntryIds = route.find("[data-vocabulary-entry]").map((_index, node) => $(node).attr("data-vocabulary-entry") ?? "").get();
  assert.equal(new Set(renderedEntryIds).size, 28);
  assert.deepEqual([...renderedEntryIds].sort(), [...EXPECTED_ENTRY_IDS].sort());
  assert.deepEqual(route.find("[data-vocabulary-filter] option").map((_index, node) => $(node).attr("value")).get(), [
    "all", "systems-signals", "neural-communication", "nervous-control", "sensory-systems", "endocrine-control", "integration"
  ]);
  assert.equal(route.find("[data-vocabulary-frayer]").length, 28);
  assert.equal(route.find("[data-vocabulary-fixed='true']").length, 6);
  assert.equal(route.find("[data-vocabulary-choice='true']").length, 22);
  assert.equal(route.find("[data-choose-vocabulary]").length, 22);
  assert.equal(route.find("[data-clear-vocabulary]").length, 22);

  const renderedResponseIds = route.find("[data-vocabulary-field]").map((_index, node) => $(node).attr("data-bio-response-id") ?? "").get();
  const expectedRenderedResponseIds = EXPECTED_ENTRY_IDS.flatMap((entryId) => FRAYER_FIELDS.map((fieldId) => `biology30-unit-a-pilot:core-vocabulary:${entryId}:${fieldId}`));
  assert.deepEqual([...renderedResponseIds].sort(), [...expectedRenderedResponseIds].sort());
  assert.equal(new Set(renderedResponseIds).size, 112);
  assert.ok(route.find("[data-vocabulary-field]").toArray().every((node) => $(node).attr("maxlength") === "240"));
  assert.equal(route.find("[data-vocabulary-model][hidden]").length, 28);
  assert.equal(route.find("[data-reveal-vocabulary-model][disabled]").length, 28);
  assert.equal(route.find(".bio-vocabulary-links").length, 28, "each concept uses one quiet link row");

  for (const entryId of EXPECTED_ENTRY_IDS) {
    const panel = route.find(`[data-vocabulary-entry='${entryId}']`);
    const record = contract.entries.find((entry) => entry.id === entryId);
    assert.ok(record, entryId);
    assert.equal(panel.find("h2").first().text().trim(), record?.label);
    assert.ok(panel.text().includes(record?.learnerDefinition ?? ""), entryId);
    assert.ok(panel.text().includes(record?.mechanism ?? ""), entryId);
    assert.ok(panel.text().toLowerCase().includes("common confusion"), entryId);
    assert.equal(panel.find("[data-page-target^='lesson-']").length, (record?.primaryLessonIds.length ?? 0) + 1, entryId);
    assert.equal(panel.find("[data-textbook-doc]").length, record?.textbookRefs.length, entryId);
    assert.equal(panel.find("[data-open-bio-model]").length, 1, entryId);
    assert.equal(panel.find("[data-vocabulary-field]").length, 4, entryId);
    assert.equal(panel.find("[data-vocabulary-model] dd").length, 4, entryId);
    if (record?.fixedMilestone) {
      assert.equal(panel.find("[data-vocabulary-fixed='true']").length, 1, entryId);
      assert.equal(panel.find("[data-choose-vocabulary]").length, 0, entryId);
      assert.equal(panel.find("[data-vocabulary-field][disabled]").length, 0, entryId);
    } else {
      assert.equal(panel.find("[data-vocabulary-choice='true']").length, 1, entryId);
      assert.equal(panel.find("[data-choose-vocabulary]").length, 1, entryId);
      assert.equal(panel.find("[data-vocabulary-field][disabled]").length, 4, entryId);
    }
  }

  assert.equal($(".bio-word-lens").length, 17);
  for (const [lessonId, entryIds] of Object.entries(EXPECTED_WORD_LENS)) {
    assert.deepEqual(
      $(`#${lessonId} .bio-word-lens [data-open-core-vocabulary]`).map((_index, node) => $(node).attr("data-open-core-vocabulary")).get(),
      entryIds,
      lessonId
    );
  }
  assert.equal($("#investigation-notebook [data-vocabulary-collection-list]").length, 1);
  assert.equal($("#investigation-notebook [data-vocabulary-collection-count]").text().trim(), "0 of 8 collected");
  const processSections = $("#investigation-notebook > section").toArray();
  const vocabularySectionIndex = processSections.findIndex((node) => $(node).find("#process-core-vocabulary").length === 1);
  const exitSectionIndex = processSections.findIndex((node) => $(node).find("#process-exit-slips").length === 1);
  const noteSectionIndex = processSections.findIndex((node) => $(node).find("#notebook-new-entry").length === 1);
  assert.ok(exitSectionIndex >= 0 && vocabularySectionIndex === exitSectionIndex + 1 && noteSectionIndex === vocabularySectionIndex + 1);

  const learnerCopy = route.clone().find("button, input, select, textarea").remove().end().text().replace(/\s+/g, " ");
  assert.doesNotMatch(learnerCopy, /SCORM|suspend data|required minutes|completion gate|administrative|implementation contract/i);
  assert.doesNotMatch(html, /linear-gradient|radial-gradient/i, "the Core Vocabulary visual system must not introduce gradients");
});

test("version-3 vocabulary state is bounded, migrates version 2, and cannot change course completion", async () => {
  const [html, vocabularyText, projectText] = await Promise.all([
    readFile(workspacePath, "utf8"),
    readFile(vocabularyPath, "utf8"),
    readFile(projectPath, "utf8")
  ]);
  const contract = JSON.parse(vocabularyText) as VocabularyContract;
  const project = JSON.parse(projectText) as {
    authoringStatus: string;
    canonicalSources: string[];
    exportTargets: Array<{ target: string; enabled: boolean }>;
    authoring: { studioEditing: { enabled: boolean } };
  };

  const allResponseIds = contract.entries.flatMap((entry) => FRAYER_FIELDS.map((fieldId) => `biology30-unit-a-pilot:core-vocabulary:${entry.id}:${fieldId}`));
  assert.equal(allResponseIds.length, 112);
  assert.equal(new Set(allResponseIds).size, 112);

  const maximumPersistedPairs = Array.from({ length: 8 }, (_value, index) => index + 1).flatMap((entryNumber) => FRAYER_FIELDS.map((field) => [
    `v${String(entryNumber).padStart(2, "0")}${({ definition: "d", characteristics: "c", example: "e", "non-example": "n" } as const)[field]}`,
    "x".repeat(240)
  ]));
  const maximumVocabularyIndex = ["v01", ["v15", "v23"], ["v04", "v09", "v16", "v17", "v22", "v01", "v15", "v23"]];
  const conservativeEnvelope = contract.baseline.worstCaseCharacters
    + JSON.stringify(maximumPersistedPairs).length - 2
    + JSON.stringify(maximumVocabularyIndex).length
    + 8;
  assert.equal(conservativeEnvelope, 41378);
  assert.ok(conservativeEnvelope <= contract.learnerPolicy.targetMaximumSuspendCharacters);
  assert.ok(48000 - conservativeEnvelope >= 4000);

  assert.match(html, /v:\s*3,/);
  assert.match(html, /candidate\?\.v !== 2 && candidate\?\.v !== 3/);
  assert.match(html, /candidate\.v === 3 && Array\.isArray\(candidate\.w\)/);
  assert.match(html, /choiceIds[\s\S]{0,300}\.slice\(0, 2\)/);
  assert.match(html, /collectedIds[\s\S]{0,300}\.slice\(0, 8\)/);
  assert.match(html, /String\(value \|\| ""\)\.slice\(0, 240\)/);
  assert.match(html, /BIO_VOCABULARY_RESPONSE_TOKENS = Object\.fromEntries/);
  assert.match(html, /if \(suspendSerialized\.length >= BIO_STATE_LIMIT\)/);
  assert.match(html, /lastValidSerialized = suspendSerialized/);
  assert.match(html, /if \(!complete\)[\s\S]{0,500}model\.hidden = true/);
  assert.match(html, /if \(hasWriting && !window\.confirm/);

  const completionFunction = html.match(/function isCourseComplete\(\) \{[\s\S]*?\n  \}/)?.[0] ?? "";
  assert.match(completionFunction, /BIO_REQUIRED_LESSONS/);
  assert.match(completionFunction, /BIO_REQUIRED_ARTIFACTS/);
  assert.match(completionFunction, /finalPractice/);
  assert.doesNotMatch(completionFunction, /vocabulary|Frayer/i);

  assert.equal(project.authoringStatus, "blocked");
  assert.equal(project.authoring.studioEditing.enabled, false);
  assert.ok(project.exportTargets.every((target) => target.enabled === false));
  assert.ok(project.canonicalSources.includes("projects/biology30-unit-a-pilot/meta/core-vocabulary.json"));

  const $ = loadHtml(html);
  let parsedScripts = 0;
  $("script:not([src])").each((_index, node) => {
    const code = $(node).html() ?? "";
    if (!code.trim()) return;
    new Function(code);
    parsedScripts += 1;
  });
  assert.equal(parsedScripts, 4);
});
