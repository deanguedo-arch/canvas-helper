import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, cp, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { load as loadHtml } from "cheerio";
import {packWordFrayers,type WordFrayerSchema} from '../biology30-vocabulary/word-frayer-state.js';

import { validateProjectManifestPolicy } from "../project-manifest-policy.js";
import {
  ADVANCED_BRIDGE_BASELINE_SHA256,
  ADVANCED_GATE_B_BLOCKS,
  ADVANCED_GATE_B_IDS,
  ADVANCED_GATE_B_MINUTES,
  ADVANCED_GATE_A_BLOCKS,
  ADVANCED_GATE_A_IDS,
  ADVANCED_GATE_A_MINUTES,
  ADVANCED_LEARNING_BLUEPRINT,
  ADVANCED_LEARNING_BLOCKS,
  ADVANCED_LEARNING_MANIFEST_IDS,
  ADVANCED_LESSON_MINUTES,
  STANDARD_OF_EXCELLENCE_BEHAVIOURS
} from "./advanced-content.js";
import { buildAtomicCurriculumContract, validateAtomicCurriculumContract, type Pilot2AtomicContractV1 } from "./atomic-contract.js";
import {
  FIGURE_CANDIDATES,
  OPTIONAL_MINUTES,
  PILOT_2_LESSONS,
  PILOT_2_REVIEW_ROUTES,
  PILOT_2_SLUG,
  REQUIRED_MINUTES,
  VIDEO_REMAP
} from "./contracts.js";
import { hashTree, type TreeHash } from "./create.js";
import { buildModelLabInteractionMap, MODEL_LAB_RECORDS } from "./model-lab-content.js";
import { renderPilot2Full } from "./render-gate1.js";
import { TEXTBOOK_REVIEW_ATTEMPT_IDS, TEXTBOOK_REVIEW_SUPPORT, validateTextbookReviewSupport } from "./textbook-review-content.js";

const PROTECTED_PROJECTS = ["biology30-unit-a-pilot", "biology30-unit-a", "biology30-unit-b", "biology30-unit-c", "biology30-unit-d"] as const;
const PROTECTED_PROJECT_EXCLUSIONS: Partial<Record<(typeof PROTECTED_PROJECTS)[number], readonly string[]>> = {
  "biology30-unit-a-pilot": ["meta/unit-a-to-bcd-improvement-playbook.md"]
};
const REQUIRED_GATE_1_SHA = "8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe";
const REQUIRED_GATE_2_BASELINE_SHA = "9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7";
const REQUIRED_REVISION_GATE_A_SHA = "3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff";
const REQUIRED_ADVANCED_GATE_A_SHA = "3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6";
const REQUIRED_REVISION = "teacher-feedback-1";
const REQUIRED_GATE = "advanced-bridge-gate-b";
const REVISION_GATE_B_ITERATION = "advanced-learning-bridge-gate-b";
const NAVIGATION_ITERATION_BASELINE_SHA = "cc968289c232ebeee5db0572426ea519806da8920c44dc4a3de008597e85a261";
const MODEL_LAYOUT_BASELINE_SHA = "b280c64e8eb144590bce5fcb3bf984de43ae1fc9fef5dfdc0f28ba051fac4161";
const MODEL_GUIDANCE_BASELINE_SHA = "2ea73014993b01e6cd64b0000d1c59d21d03ff3ed4c5af4617f009599babc3ae";
const MEDIA_WALKTHROUGH_LAYOUT_BASELINE_SHA = "e5398f56cdba93f5c57e681d6c21b6b4a5c19bd75985ce63babe6d6cde0a3916";
const VOCABULARY_LOCKED_PREVIEW_BASELINE_SHA = "b6eaba5b1f543a62e8971a55b36e5705df01e0f14adc7eaddafcd81989da0e8f";
const TEXTBOOK_REVIEW_BASELINE_SHA = "24e18ca81a7bf33a0182825be95472fa2a3f6ac55b779f90f14855e25ee9c66c";

export type Pilot2FullBuildRequest = {
  repoRoot: string;
  project: string;
  acceptedGate1Sha256: string;
  baselineGate2Sha256: string;
  acceptedRevisionGateASha256: string;
  acceptedAdvancedGateASha256: string;
  revision: string;
  gate: string;
  testHooks?: {
    afterStageWrite?: (stageProjectDir: string) => void | Promise<void>;
    beforePromote?: (stageProjectDir: string, targetProjectDir: string) => void | Promise<void>;
  };
};

export type Pilot2FullBuildResult = {
  projectDir: string;
  workspaceSha256: string;
  workspaceTreeSha256: string;
  learnerRouteCount: number;
  practiceItemCount: number;
  estimatedWorstCaseStateCharacters: number;
  protectedProjectHashes: TreeHash[];
};

async function pathExists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function sha256File(filePath: string) {
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

async function writeJson(targetPath: string, value: unknown) {
  await writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function protectedHashes(repoRoot: string) {
  return Promise.all(PROTECTED_PROJECTS.map((slug) => (
    hashTree(path.join(repoRoot, "projects", slug), slug, PROTECTED_PROJECT_EXCLUSIONS[slug] ?? [])
  )));
}

function assertProtected(expected: TreeHash[], actual: TreeHash[]) {
  const actualBySlug = new Map(actual.map((entry) => [entry.slug, entry]));
  for (const entry of expected) {
    const found = actualBySlug.get(entry.slug);
    if (!found || found.sha256 !== entry.sha256 || found.fileCount !== entry.fileCount || found.byteCount !== entry.byteCount) {
      throw new Error(`Protected project changed after the Pilot 2 baseline was recorded: ${entry.slug}`);
    }
  }
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function countSyllables(rawWord: string) {
  const word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  const normalized = word.replace(/(?:[^l]e|ed|es)$/i, "").replace(/^y/, "");
  return Math.max(1, normalized.match(/[aeiouy]{1,2}/g)?.length ?? 1);
}

function readingLevel(text: string) {
  const normalized = normalizeWhitespace(text);
  const words = normalized.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  const sentences = Math.max(1, normalized.match(/[.!?]+(?=\s|$)/g)?.length ?? 1);
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
  const grade = 0.39 * (words.length / sentences) + 11.8 * (syllables / Math.max(1, words.length)) - 15.59;
  return {
    wordCount: words.length,
    sentenceCount: sentences,
    averageSentenceWords: Number((words.length / sentences).toFixed(1)),
    fleschKincaidGrade: Number(grade.toFixed(1))
  };
}

export function fullReadingReport(html: string) {
  const $ = loadHtml(html);
  return PILOT_2_LESSONS.map((lesson) => {
    const route = $(`#${lesson.id}`).clone();
    route.find(".lesson-header,.guided-practice,.evidence-slip,.retrieve-block,.video-companion,details.advanced-learning,.practice-feedback").remove();
    const prose = route.find(".learn-block>p,.learn-block>.explain-grid>div>p,.stop-check>p,.stop-check details p,.worked-example>p,.worked-example>ol>li")
      .map((_index, element) => $(element).text()).get().join(" ");
    const paragraphs = route.find(".learn-block>p,.learn-block>.explain-grid>div>p").map((_index, element) => ($(element).text().match(/[A-Za-z][A-Za-z'’-]*/g) ?? []).length).get();
    return { routeId: lesson.id, ...readingLevel(prose), longestCoreParagraphWords: Math.max(0, ...paragraphs) };
  });
}

function stableStateToken(id: string) {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function compactRecordKeys<T>(record: Record<string, T>, encode: (value: T) => unknown) {
  const groups = new Map<string, string[]>();
  for (const id of Object.keys(record)) {
    const token = stableStateToken(id);
    groups.set(token, [...(groups.get(token) ?? []), id]);
  }
  return Object.fromEntries(Object.entries(record).map(([id, value]) => {
    const token = stableStateToken(id);
    const key = (groups.get(token)?.length ?? 0) === 1 ? token : `=${id}`;
    return [key, encode(value)];
  }));
}

export function estimateWorstCaseState(html: string, fixedVocabularyIds: string[]) {
  const $ = loadHtml(html);
  const wordSchema:WordFrayerSchema|undefined=$('#biology-word-data').length?JSON.parse($('#biology-word-data').text()).schema:undefined;
  const optionalVocabularyIds = $("[data-vocabulary-entry]").map((_index, element) => $(element).attr("data-vocabulary-entry")).get()
    .filter((id) => !fixedVocabularyIds.includes(id)).slice(0, 2);
  const allowedVocabularyIds = new Set([...fixedVocabularyIds, ...optionalVocabularyIds]);
  const responses: Record<string, string> = {};
  $("[data-response-id]").each((_index, element) => {
    const node = $(element);
    const id = node.attr("data-response-id");
    if (!id || responses[id] !== undefined) return;
    const vocabularyMatch = id.match(/:core-vocabulary:([^:]+):/);
    if(vocabularyMatch&&wordSchema)return;
    if (vocabularyMatch && !allowedVocabularyIds.has(vocabularyMatch[1])) return;
    responses[id] = "x".repeat(Number(node.attr("maxlength") ?? 2000));
  });
  const practice: Record<string, { choice: string; submitted: boolean; correct: boolean }> = {};
  $("[data-practice-id]").each((_index, element) => {
    const id = $(element).attr("data-practice-id");
    if (id) practice[id] = { choice: "a", submitted: true, correct: true };
  });
  const mediaIds = $("[data-media-checkpoint-id]").map((_index, element) => $(element).attr("data-media-checkpoint-id")).get();
  const mediaPaths = Object.fromEntries(mediaIds.map((id, index) => [id, index % 2 ? "local" : "video"]));
  const mediaCheckpoints = Object.fromEntries(mediaIds.map((id) => [id, { choice: "a", submitted: true, correct: true }]));
  const modelIds = $("[data-model-panel]").map((_index, element) => $(element).attr("data-model-panel")).get().filter((id): id is string => Boolean(id));
  const modelResults = Object.fromEntries(modelIds.map((id) => {
    const firstChoice = $(`[data-model-panel="${id}"] [data-model-choice]`).first().attr("data-model-choice") ?? "";
    return [id, firstChoice];
  }));
  const modelPredictions = Object.fromEntries(modelIds.map((id) => [id, "x".repeat(180)]));
  const modelExplanations = Object.fromEntries(modelIds.map((id) => [id, "x".repeat(240)]));
  const modelChoiceRefs = Object.fromEntries(modelIds.map((id) => [id, modelResults[id]]));
  const state = {
    version: 6,
    encoding: "hashed-v1",
    route: "final-practice",
    responses: compactRecordKeys(responses, (value) => value),
    practice: compactRecordKeys(practice, (value) => `${value.choice}${value.submitted ? "1" : "0"}${value.correct ? "1" : "0"}`),
    completedRoutes: ["lesson-01", "lesson-02", "lesson-03", "lesson-04", "lesson-05", "chapter-11-practice", "lesson-06", "lesson-07", "lesson-08", "chapter-12-practice", "lesson-09", "lesson-10", "lesson-11", "lesson-12", "lesson-13", "chapter-13-practice", "review-seminar", "final-practice"],
    visitedLessons: PILOT_2_LESSONS.map((lesson) => lesson.id),
    investigations: ["biology30-unit-a-pilot-2:investigation:reflex-response", "biology30-unit-a-pilot-2:investigation:sensory-receptors", "biology30-unit-a-pilot-2:investigation:endocrine-data"],
    evidenceIds: PILOT_2_LESSONS.map((lesson) => `biology30-unit-a-pilot-2:${lesson.id}:evidence-slip`),
    vocabulary: { activeId: fixedVocabularyIds[0] ?? "", choiceIds: optionalVocabularyIds, collectedIds: [...fixedVocabularyIds, ...optionalVocabularyIds] },
    media: { paths: mediaPaths, checkpoints: mediaCheckpoints, needsCheckRoutes: [] },
    models: { activeId: modelIds[modelIds.length - 1] ?? "", results: modelResults, predictions: modelPredictions, predictionChoices: modelChoiceRefs, explanations: modelExplanations, explanationChoices: modelChoiceRefs, collectedIds: modelIds },
    textbookReviewAttempts: [...TEXTBOOK_REVIEW_ATTEMPT_IDS],
    advanced: { c: "ffffffffff" }
  };
  if(wordSchema){
    state.vocabulary={activeId:wordSchema.legacyIds.slice().sort((a,b)=>b.length-a.length)[0],choiceIds:[],collectedIds:[]};
    (state as typeof state&{wordFrayers:unknown}).wordFrayers=packWordFrayers(wordSchema.wordIds.slice(-8).map(id=>({kind:'word',id,answers:['x'.repeat(240),'x'.repeat(240),'x'.repeat(240),'x'.repeat(240)],collected:true})),wordSchema);
  }
  return { characters: JSON.stringify(state).length, responseCount: Object.keys(responses).length+(wordSchema?32:0), practiceCount: Object.keys(practice).length, mediaCheckpointCount: mediaIds.length, modelCount: modelIds.length, textbookReviewAttemptCount: TEXTBOOK_REVIEW_ATTEMPT_IDS.length, advancedCompletionCount: ADVANCED_LEARNING_MANIFEST_IDS.length, state };
}

function normalizePracticeId(id: string) {
  return id.replace(/-(\d)(?=$)/, "-0$1");
}

const PRACTICE_ROUTE_ORDER: Record<string, number> = {
  "lesson-01": 1, "lesson-02": 2, "lesson-03": 3, "lesson-04": 4, "lesson-05": 5,
  "chapter-11-practice": 5.5,
  "lesson-06": 6, "lesson-07": 7, "lesson-08": 8,
  "chapter-12-practice": 8.5,
  "lesson-09": 9, "lesson-10": 10, "lesson-11": 11, "lesson-12": 12, "lesson-13": 13,
  "chapter-13-practice": 13.5,
  "review-seminar": 14,
  "final-practice": 15,
  "final-practice#advanced": 15
};

function buildPracticeReadinessAudit(input: {
  render: ReturnType<typeof renderPilot2Full>;
  blueprint: Record<string, unknown>;
  vocabularyEntries: Array<{ id: string; primaryLessonIds?: string[] }>;
  generatedAt: string;
}) {
  type RenderedPractice = {
    id: string;
    lessonId?: string;
    choices: Record<string, string>;
    answer: string;
    rationale: string;
    feedback?: Record<string, string>;
    textbook: { doc: string; printed: number; physical: number };
    optional?: boolean;
  };
  type BlueprintPractice = {
    id: string;
    routeId: string;
    outcomeIds: string[];
    performanceBehaviourIds: string[];
    prerequisiteConceptIds: string[];
    required: boolean;
  };
  const blueprintGroups = ["lessonItems", "chapterItems", "finalCoreItems", "challengeItems"] as const;
  const blueprintItems = blueprintGroups.flatMap((group) => (input.blueprint[group] as BlueprintPractice[] | undefined) ?? []);
  const rendered: Array<{ routeId: string; item: RenderedPractice }> = [
    ...input.render.guidedItems.map((item) => ({ routeId: item.lessonId ?? "", item })),
    ...input.render.chapterItems.map((item) => ({ routeId: item.id.includes("chapter-11") ? "chapter-11-practice" : item.id.includes("chapter-12") ? "chapter-12-practice" : "chapter-13-practice", item })),
    ...input.render.finalCoreItems.map((item) => ({ routeId: "final-practice", item })),
    ...input.render.challengeItems.map((item) => ({ routeId: "final-practice#advanced", item }))
  ];
  if (rendered.length !== 86 || blueprintItems.length !== 86) throw new Error(`Practice readiness requires 86 rendered and mapped items; found ${rendered.length}/${blueprintItems.length}.`);
  const vocabularyById = new Map(input.vocabularyEntries.map((entry) => [entry.id, entry]));
  const records = blueprintItems.map((blueprintItem) => {
    const found = rendered.find(({ item }) => normalizePracticeId(item.id) === normalizePracticeId(blueprintItem.id));
    if (!found) throw new Error(`Practice blueprint item is not rendered: ${blueprintItem.id}`);
    if (found.routeId !== blueprintItem.routeId) throw new Error(`Practice route drift for ${blueprintItem.id}: ${found.routeId} versus ${blueprintItem.routeId}.`);
    if (!blueprintItem.outcomeIds.length || !blueprintItem.prerequisiteConceptIds.length) throw new Error(`${blueprintItem.id} lacks outcome or prerequisite mapping.`);
    const routeRank = PRACTICE_ROUTE_ORDER[blueprintItem.routeId];
    if (routeRank === undefined) throw new Error(`Unknown practice route order: ${blueprintItem.routeId}`);
    const prerequisiteEvidence = blueprintItem.prerequisiteConceptIds.map((conceptId) => {
      const vocabulary = vocabularyById.get(conceptId);
      if (!vocabulary?.primaryLessonIds?.length) throw new Error(`${blueprintItem.id} references an unknown or untaught concept: ${conceptId}`);
      const firstTeachRoute = vocabulary.primaryLessonIds
        .filter((routeId) => PRACTICE_ROUTE_ORDER[routeId] !== undefined)
        .sort((left, right) => PRACTICE_ROUTE_ORDER[left] - PRACTICE_ROUTE_ORDER[right])[0];
      if (!firstTeachRoute || PRACTICE_ROUTE_ORDER[firstTeachRoute] > routeRank) {
        throw new Error(`${blueprintItem.id} uses ${conceptId} before it is taught.`);
      }
      return { conceptId, firstTeachRoute, readiness: firstTeachRoute === blueprintItem.routeId ? "taught-before-practice-in-route" : "taught-on-earlier-route" };
    });
    if (!found.item.rationale.trim() || !found.item.textbook?.printed || !found.item.textbook?.physical) throw new Error(`${found.item.id} lacks a rationale or exact textbook locator.`);
    const incorrectChoices = Object.keys(found.item.choices).filter((choice) => choice !== found.item.answer);
    if (!found.item.choices[found.item.answer] || incorrectChoices.some((choice) => !(found.item.feedback?.[choice] ?? "").trim())) {
      throw new Error(`${found.item.id} lacks an answer key or misconception feedback for every distractor.`);
    }
    return {
      id: found.item.id,
      routeId: found.routeId,
      required: blueprintItem.required,
      outcomeIds: blueprintItem.outcomeIds,
      performanceBehaviourIds: blueprintItem.performanceBehaviourIds,
      prerequisiteConceptIds: blueprintItem.prerequisiteConceptIds,
      prerequisiteEvidence,
      answerKey: found.item.answer,
      rationaleStatus: "present",
      misconceptionFeedbackChoices: incorrectChoices,
      textbook: found.item.textbook,
      readiness: "passed"
    };
  });
  return {
    schemaVersion: 1,
    project: PILOT_2_SLUG,
    gate: REQUIRED_GATE,
    generatedAt: input.generatedAt,
    workspaceSha256: "",
    policy: "A practice item is ready only when its exact outcomes and behaviours are mapped, every prerequisite concept is taught before the item, every distractor has corrective feedback, and an exact textbook locator is available.",
    counts: {
      total: records.length,
      required: records.filter((record) => record.required).length,
      optional: records.filter((record) => !record.required).length,
      passed: records.filter((record) => record.readiness === "passed").length
    },
    records
  };
}

export function buildRenderedFigureInventory(input: {
  html: string;
  atomicContract: Pilot2AtomicContractV1;
  sourceCrosswalk: { teacherPlanRows?: Array<{ id: string; sourceId: string; row: number; sourceRange: string; textbook: string; destinationRoutes: string[] }> };
  acceptedRasterFigures: Array<Record<string, unknown>>;
}) {
  const $ = loadHtml(input.html);
  const rasterByPath = new Map(input.acceptedRasterFigures.map((figure) => [String(figure.path), figure]));
  const seen = new Set<string>();
  const records = PILOT_2_LESSONS.flatMap((lesson) => {
    const route = $(`#${lesson.id}`);
    const fallbackSources = (input.sourceCrosswalk.teacherPlanRows ?? [])
      .filter((row) => row.destinationRoutes.includes(lesson.id))
      .flatMap((row) => [`${row.sourceId}:row-${row.row}:${row.sourceRange}`, `textbook:${row.textbook}`]);
    return route.find("[data-figure-id]").map((_index, element) => {
      const node = $(element);
      const id = node.attr("data-figure-id")?.trim() ?? "";
      if (!id || seen.has(id)) throw new Error(`Rendered figure IDs must be present and unique; found duplicate or empty ID: ${id || "(empty)"}.`);
      seen.add(id);
      const images = node.find("img");
      const svgs = node.find("svg");
      const raster = images.length > 0;
      const vector = svgs.length > 0;
      const treatment = raster ? "responsive-raster-with-text-equivalent" : vector ? "accessible-inline-svg" : "semantic-html";
      const textEquivalent = normalizeWhitespace(node.find("figcaption,caption,.figure-description,.text-equivalent").text() || node.text());
      const imageAlt = images.map((_imageIndex, image) => $(image).attr("alt")?.trim() ?? "").get();
      const svgTitles = svgs.map((_svgIndex, svg) => $(svg).find("title").text().trim()).get();
      const svgDescriptions = svgs.map((_svgIndex, svg) => $(svg).find("desc").text().trim()).get();
      const sourcePath = images.first().attr("src")?.replace(/^\.\//, "") ?? "";
      const acceptedRaster = rasterByPath.get(sourcePath);
      if (raster && (imageAlt.some((alt) => !alt) || textEquivalent.length < 40 || node.find("[data-enlarge-figure]").length !== 1 || !acceptedRaster)) {
        throw new Error(`${lesson.id} figure ${id} lacks accepted raster provenance, alt text, a text equivalent, or enlargement.`);
      }
      if (vector && (svgTitles.some((title) => !title) || svgDescriptions.some((description) => !description) || textEquivalent.length < 40)) {
        throw new Error(`${lesson.id} figure ${id} lacks an SVG title, description, or adjacent text equivalent.`);
      }
      if (!raster && !vector && textEquivalent.length < 40) throw new Error(`${lesson.id} semantic figure ${id} lacks a complete text equivalent.`);
      const atomicSources = input.atomicContract.components
        .filter((component) => component.visualOrDataId === id)
        .flatMap((component) => component.sourceRefs);
      const sourceRefs = [...new Set(atomicSources.length ? atomicSources : fallbackSources)];
      if (!sourceRefs.length) throw new Error(`${lesson.id} figure ${id} has no exact source or curriculum provenance.`);
      return {
        id,
        routeId: lesson.id,
        treatment,
        sourcePath: sourcePath || null,
        sourceSha256: acceptedRaster?.sourceSha256 ?? null,
        sourceRefs,
        rightsStatus: acceptedRaster?.rightsStatus ?? "course-native semantic teaching model based on cited curriculum and local authorized sources",
        accessibility: {
          status: "passed",
          imageAlt: imageAlt.length ? imageAlt : null,
          svgTitle: svgTitles.length ? svgTitles : null,
          svgDescription: svgDescriptions.length ? svgDescriptions : null,
          textEquivalent,
          enlargement: node.find("[data-enlarge-figure]").length === 1
        }
      };
    }).get();
  });
  const byLesson = Object.fromEntries(PILOT_2_LESSONS.map((lesson) => [lesson.id, records.filter((record) => record.routeId === lesson.id).length]));
  if (records.length < 52 || Object.values(byLesson).some((count) => count < 4)) throw new Error("The rendered figure inventory does not meet the four-per-lesson visual floor.");
  return { schemaVersion: 1, project: PILOT_2_SLUG, gate: REQUIRED_GATE, count: records.length, byLesson, records };
}

function buildTextbookReviewIntegration(workspaceSha256: string, generatedAt: string) {
  const records = validateTextbookReviewSupport().map((record) => ({
    ...record,
    answerCount: record.answers.length,
    renderedSelector: `#${record.routeId} [data-textbook-review-route="${record.routeId}"]`
  }));
  return {
    schemaVersion: 1,
    project: PILOT_2_SLUG,
    workspaceSha256,
    generatedAt,
    authoredSource: "scripts/lib/biology30-unit-a-pilot-2/textbook-review-content.ts",
    policy: {
      treatment: "optional-non-graded-reinforcement",
      answerAccess: "attempt-confirmation-required",
      answerPanelsOnReload: "collapsed",
      completionImpact: false,
      scoringImpact: false,
      requiredMinutesImpact: false,
      optionalMinutesImpact: false,
      runtimeDependencyOnPilot1: false
    },
    counts: {
      reviewSections: records.length,
      nativeAnswers: records.reduce((total, record) => total + record.answers.length, 0),
      attemptIds: new Set(records.map((record) => record.attemptId)).size
    },
    records
  };
}

type Pilot1SectionDisposition = {
  sourceRouteId: string;
  sourceSectionId: string;
  kind: string;
  sourceHeading?: string | null;
  sourceClasses?: string[];
  destinationRoutes: string[];
  treatment: "core-rewrite" | "advanced-rewrite" | "keep-interaction" | "move-to-review";
};

type Pilot1DispositionContract = {
  schemaVersion: number;
  project: string;
  sourceProject: string;
  recordCount: number;
  records: Pilot1SectionDisposition[];
};

function fallbackAdvancedBlockId(record: Pilot1SectionDisposition) {
  if (["lesson-05:section-007", "lesson-05:section-008", "lesson-05:section-009", "lesson-05:section-013"].includes(record.sourceSectionId)) return "l03-b03";
  return "l03-b01";
}

function buildAdvancedLearningBridge(input: {
  workspaceSha256: string;
  generatedAt: string;
  disposition: Pilot1DispositionContract;
}) {
  if (input.disposition.sourceProject !== "biology30-unit-a-pilot" || input.disposition.recordCount !== 470 || input.disposition.records.length !== 470) {
    throw new Error("The Pilot 1 section-disposition source must contain exactly 470 records.");
  }
  const blocksBySourceSection = new Map<string, string[]>();
  ADVANCED_LEARNING_BLUEPRINT.forEach((block) => block.pilot1SourceSectionIds.forEach((sectionId) => {
    blocksBySourceSection.set(sectionId, [...(blocksBySourceSection.get(sectionId) ?? []), block.id]);
  }));
  const renderedIds = new Set(ADVANCED_LEARNING_MANIFEST_IDS);
  const records = input.disposition.records.map((record) => {
    let finalOutcome: "retained-in-pilot-2-core" | "rewritten-into-advanced-learning" | "retained-through-models-and-data-lab" | "retained-in-chapter-or-unit-review" | "excluded";
    let reason: string;
    let advancedBlockId: string | null = null;
    if (record.treatment === "advanced-rewrite") {
      const mappedIds = blocksBySourceSection.get(record.sourceSectionId) ?? [];
      advancedBlockId = mappedIds[0] ?? fallbackAdvancedBlockId(record);
      finalOutcome = "rewritten-into-advanced-learning";
      reason = `Rewritten at Pilot 2's accessible reading level inside ${advancedBlockId}; deeper reasoning remains optional.`;
    } else if (record.treatment === "move-to-review") {
      finalOutcome = "retained-in-chapter-or-unit-review";
      reason = "Retained through the mapped Chapter Practice, Review Seminar, or Final Practice destination.";
    } else if (record.treatment === "keep-interaction" && record.destinationRoutes.some((routeId) => routeId === "model-lab" || routeId === "process-collection" || routeId.startsWith("lesson-"))) {
      finalOutcome = "retained-through-models-and-data-lab";
      reason = "The interaction or learner evidence remains available through its mapped lesson, Models and Data Lab, or Process Collection pathway.";
    } else {
      finalOutcome = "retained-in-pilot-2-core";
      reason = "The idea or resource remains in Pilot 2 core teaching or its learner resource route.";
    }
    return {
      ...record,
      finalOutcome,
      reason,
      advancedBlockId,
      advancedBlockRenderedInGateA: advancedBlockId ? ADVANCED_GATE_A_IDS.includes(advancedBlockId) : false,
      advancedBlockRenderedInGateB: advancedBlockId ? renderedIds.has(advancedBlockId) : false,
      exclusionReason: null
    };
  });
  const finalOutcomes = records.reduce<Record<string, number>>((counts, record) => {
    counts[record.finalOutcome] = (counts[record.finalOutcome] ?? 0) + 1;
    return counts;
  }, {});
  const blockRecords = ADVANCED_LEARNING_BLUEPRINT.map((block) => ({
    ...block,
    renderedSelector: renderedIds.has(block.id) ? `#${block.lessonId} [data-advanced-block-id="${block.id}"]` : null,
    trackerSelector: `#advanced-learning [data-advanced-index-item="${block.id}"]`,
    authoredContentStatus: ADVANCED_GATE_A_IDS.includes(block.id) ? "accepted-gate-a-block" : "complete-gate-b-block",
    completionImpact: false,
    scoringImpact: false,
    requiredMinutesImpact: false,
    evidenceAccessibility: "Semantic heading, prose, table with column headers, plain-language note, keyboard-operable disclosure, and exact Models and Data Lab link."
  }));
  return {
    schemaVersion: 1,
    project: PILOT_2_SLUG,
    sourceProject: "biology30-unit-a-pilot",
    profile: "pilot-1-to-pilot-2-advanced-learning-bridge-v1",
    status: "advanced-bridge-gate-b-awaiting-teacher-review",
    generatedAt: input.generatedAt,
    baselineWorkspaceSha256: ADVANCED_BRIDGE_BASELINE_SHA256,
    workspaceSha256: input.workspaceSha256,
    authoredSource: "scripts/lib/biology30-unit-a-pilot-2/advanced-content.ts",
    authorities: {
      checkedAt: "2026-09-04",
      biologyInformationBulletin: "2025-26",
      diplomaSupportPage: "https://www.alberta.ca/writing-diploma-exams",
      performanceStandards: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf",
      excellenceBehaviours: STANDARD_OF_EXCELLENCE_BEHAVIOURS
    },
    policy: {
      advancedMeans: "deeper curricular reasoning in accessible language",
      defaultDisclosureState: "collapsed",
      completionMethod: "learner-self-marked-checkbox",
      requiredProgressImpact: false,
      scoringImpact: false,
      responseImpact: false,
      runtimeDependencyOnPilot1: false,
      transferToUnitsBCD: "none-without-separate-review"
    },
    timing: {
      lessonBlocksMinutes: ADVANCED_LESSON_MINUTES,
      reviewSeminarExtensionMinutes: 20,
      diplomaChallengeMinutes: 30,
      totalOptionalMinutes: ADVANCED_LESSON_MINUTES + 20 + 30
    },
    counts: {
      manifestBlocks: blockRecords.length,
      acceptedGateABlocks: blockRecords.filter((record) => record.authoredContentStatus === "accepted-gate-a-block").length,
      renderedGateBBlocks: blockRecords.filter((record) => record.authoredContentStatus === "complete-gate-b-block").length,
      renderedTotalBlocks: blockRecords.filter((record) => Boolean(record.renderedSelector)).length,
      plannedGateBBlocks: 0,
      gateAMinutes: ADVANCED_GATE_A_MINUTES,
      gateBMinutes: ADVANCED_GATE_B_MINUTES,
      sourceSectionDispositions: records.length,
      finalOutcomes
    },
    savedState: {
      schemaVersion: 6,
      version5Migration: "All existing learner work is preserved and all 40 Advanced Learning flags begin unchecked.",
      encoding: "ten-hex-character-bitset-in-stable-manifest-order",
      allowlistedIds: ADVANCED_LEARNING_MANIFEST_IDS
    },
    blocks: blockRecords,
    sourceSectionAudit: {
      sourceContract: "meta/pilot-1-section-disposition.json",
      recordCount: records.length,
      oneOutcomePerRecord: true,
      records
    },
    teacherDecision: null
  };
}

function advancedLearningBridgeReport(bridge: ReturnType<typeof buildAdvancedLearningBridge>) {
  const blockRows = bridge.blocks.map((block) => `| ${block.id} | ${block.lessonOrder} | ${block.part} | ${block.title} | ${block.minutes} | ${block.authoredContentStatus === "accepted-gate-a-block" ? "Gate A accepted" : "Gate B rendered"} |`).join("\n");
  const outcomeRows = Object.entries(bridge.counts.finalOutcomes).map(([outcome, count]) => `| ${outcome} | ${count} |`).join("\n");
  return `# Pilot 1 to Pilot 2 Advanced Learning bridge\n\nStatus: **Advanced Bridge Gate B — awaiting explicit teacher review**  \nPre-bridge learner SHA-256: \`${bridge.baselineWorkspaceSha256}\`  \nAccepted Gate A learner SHA-256: \`${REQUIRED_ADVANCED_GATE_A_SHA}\`  \nGate B learner SHA-256: \`${bridge.workspaceSha256}\`\n\nPilot 2 keeps its readable required instruction. The completed bridge restores deeper curricular reasoning as forty collapsed, optional blocks written at the same accessible reading level. The eight representative Gate A blocks remain unchanged in role; the remaining thirty-two blocks are now authored and rendered.\n\n## Timing and completion\n\n- Forty lesson blocks: ${bridge.timing.lessonBlocksMinutes} optional minutes.\n- Review Seminar extension: ${bridge.timing.reviewSeminarExtensionMinutes} optional minutes.\n- Diploma Challenge: ${bridge.timing.diplomaChallengeMinutes} optional minutes.\n- Total: ${bridge.timing.totalOptionalMinutes} optional minutes.\n- These records never change required progress, scoring, written responses, or the 1,505 required minutes.\n\n## Exact 40-block map\n\n| ID | Lesson | Learn block | Advanced Learning title | Minutes | Delivery status |\n| --- | ---: | ---: | --- | ---: | --- |\n${blockRows}\n\n## Pilot 1 difference audit\n\nAll ${bridge.counts.sourceSectionDispositions} source records have one final outcome. The complete record-by-record audit is stored in \`meta/advanced-learning-bridge.json\`.\n\n| Final outcome | Records |\n| --- | ---: |\n${outcomeRows}\n\nNo Pilot 1 section is silently dropped. Gate B remains blocked until the exact full build is verified and explicitly accepted.\n`;
}

async function validateFullCandidate(stageProjectDir: string, workspaceSha256: string) {
  const workspacePath = path.join(stageProjectDir, "workspace", "index.html");
  if (await sha256File(workspacePath) !== workspaceSha256) throw new Error("The staged workspace changed during validation.");
  const html = await readFile(workspacePath, "utf8");
  const atomicContract = JSON.parse(await readFile(path.join(stageProjectDir, "meta", "atomic-curriculum-map.json"), "utf8")) as Pilot2AtomicContractV1;
  const practiceReadiness = JSON.parse(await readFile(path.join(stageProjectDir, "meta", "practice-readiness-audit.json"), "utf8"));
  const figureMediaPlan = JSON.parse(await readFile(path.join(stageProjectDir, "meta", "figure-media-plan.json"), "utf8"));
  const textbookReview = JSON.parse(await readFile(path.join(stageProjectDir, "meta", "textbook-review-integration.json"), "utf8"));
  const advancedBridge = JSON.parse(await readFile(path.join(stageProjectDir, "meta", "advanced-learning-bridge.json"), "utf8"));
  if (atomicContract.workspaceSha256 !== workspaceSha256) throw new Error("Atomic curriculum evidence is not bound to the staged workspace hash.");
  if (atomicContract.status !== "revision-gate-b-awaiting-teacher-review") throw new Error("Atomic curriculum evidence is not a Revision Gate B contract.");
  if (practiceReadiness.workspaceSha256 !== workspaceSha256 || practiceReadiness.counts?.total !== 86 || practiceReadiness.counts?.required !== 80 || practiceReadiness.counts?.optional !== 6 || practiceReadiness.counts?.passed !== 86) {
    throw new Error("Practice readiness evidence is incomplete or not bound to the staged workspace.");
  }
  if (figureMediaPlan.workspaceSha256 !== workspaceSha256 || figureMediaPlan.renderedFigureInventory?.count < 52 || figureMediaPlan.renderedFigureInventory?.records?.some((record: { accessibility?: { status?: string }; sourceRefs?: string[] }) => record.accessibility?.status !== "passed" || !record.sourceRefs?.length)) {
    throw new Error("Rendered figure provenance or accessibility evidence is incomplete or not bound to the staged workspace.");
  }
  if (textbookReview.schemaVersion !== 1 || textbookReview.workspaceSha256 !== workspaceSha256 || textbookReview.counts?.reviewSections !== 4 || textbookReview.counts?.nativeAnswers !== 120 || textbookReview.counts?.attemptIds !== 4 || textbookReview.policy?.completionImpact !== false || textbookReview.policy?.scoringImpact !== false) {
    throw new Error("Textbook review integration is incomplete, gating, or bound to the wrong workspace.");
  }
  if (advancedBridge.schemaVersion !== 1 || advancedBridge.status !== "advanced-bridge-gate-b-awaiting-teacher-review" || advancedBridge.workspaceSha256 !== workspaceSha256 || advancedBridge.baselineWorkspaceSha256 !== ADVANCED_BRIDGE_BASELINE_SHA256 || advancedBridge.counts?.manifestBlocks !== 40 || advancedBridge.counts?.acceptedGateABlocks !== 8 || advancedBridge.counts?.renderedGateBBlocks !== 32 || advancedBridge.counts?.renderedTotalBlocks !== 40 || advancedBridge.counts?.plannedGateBBlocks !== 0 || advancedBridge.timing?.lessonBlocksMinutes !== 245 || advancedBridge.timing?.totalOptionalMinutes !== 295 || advancedBridge.sourceSectionAudit?.recordCount !== 470 || advancedBridge.sourceSectionAudit?.records?.length !== 470 || advancedBridge.sourceSectionAudit.records.some((record: { finalOutcome?: string }) => !record.finalOutcome)) {
    throw new Error("Advanced Learning bridge evidence is incomplete or not bound to the staged workspace.");
  }
  validateAtomicCurriculumContract(html, atomicContract);
  if (/biology30-unit-a-pilot:(?!-2)/.test(html)) throw new Error("Pilot 1 learner-state IDs leaked into Pilot 2.");
  const $ = loadHtml(html);
  const learnerCopy = $("body").clone();
  learnerCopy.find("script,style").remove();
  if (/SCORM|source hash|provenance|comparison pilot|teacher key|secure quiz|implementation contract/i.test(learnerCopy.text())) {
    throw new Error("Learner-facing administrative or prohibited assessment language was found.");
  }
  const routes = $(".course-page[id]").map((_index, element) => $(element).attr("id")).get();
  if (routes.length !== 27 || new Set(routes).size !== 27) throw new Error(`Expected 27 complete learner routes; found ${routes.length}.`);
  if ($(".nav-group").length !== 5 || $(".lesson-page").length !== 13) throw new Error("The five-group navigation or thirteen-lesson contract is incomplete.");
  if ($("[data-sidebar-toggle]").length !== 1 || $("[data-sidebar-toggle]").attr("aria-expanded") !== "true" || $("[data-sidebar-toggle]").attr("aria-controls") !== "course-sidebar") {
    throw new Error("The accessible desktop course-navigation collapse control is missing.");
  }
  const navGroups = $(".nav-group").toArray();
  const processNav = navGroups.find((element) => normalizeWhitespace($(element).children("summary").text()) === "Process Collection");
  const resourcesNav = navGroups.find((element) => normalizeWhitespace($(element).children("summary").text()) === "Resources");
  const processLabels = processNav ? $(processNav).find(".nav-link").map((_index, element) => normalizeWhitespace($(element).text())).get() : [];
  const resourceLabels = resourcesNav ? $(resourcesNav).find(".nav-link").map((_index, element) => normalizeWhitespace($(element).text())).get() : [];
  if (JSON.stringify(processLabels) !== JSON.stringify(["Saved work", "Core Vocabulary", "Advanced Learning", "Models and Data Lab"])) throw new Error("Process Collection navigation is missing its saved-work, vocabulary, Advanced Learning, or guided-model pathway.");
  if (resourceLabels.some((label) => label === "Core Vocabulary" || label === "Models and Data Lab")) throw new Error("Process evidence tools remain incorrectly grouped under Resources.");
  for (const lesson of PILOT_2_LESSONS) {
    const route = $(`#${lesson.id}`);
    if (route.length !== 1) throw new Error(`Missing learner lesson: ${lesson.id}`);
    if (route.find(".lesson-words dt").length !== 4) throw new Error(`${lesson.id} must show exactly four anchor words.`);
    if (route.find("details.lesson-term-inventory").length !== 1 || route.find("details.lesson-term-inventory .lesson-term-row").length < 4) {
      throw new Error(`${lesson.id} is missing its complete lesson vocabulary disclosure.`);
    }
    if (route.find(".learn-block").length < 3 || route.find("[data-figure-id]").length < 4) {
      throw new Error(`${lesson.id} does not meet the complete three-part, four-visual Gate B lesson floor.`);
    }
    route.find(".learn-block").each((_index, element) => {
      const blockWords = ($(element).find(":scope>p,:scope>.explain-grid>div>p").map((_paragraphIndex, paragraph) => $(paragraph).text()).get().join(" ").match(/[A-Za-z][A-Za-z'’-]*/g) ?? []).length;
      if (blockWords > 260) throw new Error(`${lesson.id} has ${blockWords} uninterrupted core words in one Learn block.`);
    });
    const lessonHtml = route.html() ?? "";
    if (lessonHtml.indexOf("worked-example") > lessonHtml.indexOf("retrieve-block")) throw new Error(`${lesson.id} retrieves material before the worked example.`);
    if (route.find("[data-guided-practice] [data-practice-id]").length !== 2 || route.find(".evidence-slip").length !== 1) {
      throw new Error(`${lesson.id} does not match the required practice and evidence anatomy.`);
    }
    const expectedMedia = lesson.id === "lesson-13" ? 2 : 1;
    if (route.find("[data-media-checkpoint-id][data-media-required=\"true\"]").length !== expectedMedia) throw new Error(`${lesson.id} has an incorrect required-media checkpoint count.`);
    route.find("[data-media-checkpoint-id]").each((_index, element) => {
      const media = $(element);
      if (media.find("[data-local-equivalent] li").length < 4 || media.find("[data-check-media]").length !== 1) throw new Error(`${lesson.id} lacks a complete local media equivalent or shared checkpoint.`);
    });
  }
  const advancedManifest = JSON.parse($("html").attr("data-advanced-manifest") ?? "[]") as string[];
  if ($(".lesson-page .learn-block").length !== 40 || advancedManifest.length !== 40 || new Set(advancedManifest).size !== 40 || JSON.stringify(advancedManifest) !== JSON.stringify(ADVANCED_LEARNING_MANIFEST_IDS)) {
    throw new Error("The exact forty-item Learn-block and Advanced Learning manifest contract is incomplete or out of order.");
  }
  const renderedAdvancedBlocks = $(".lesson-page [data-advanced-block-id]");
  const renderedAdvancedIds = renderedAdvancedBlocks.map((_index, element) => $(element).attr("data-advanced-block-id")).get();
  if (renderedAdvancedBlocks.length !== 40 || JSON.stringify([...renderedAdvancedIds]) !== JSON.stringify(ADVANCED_LEARNING_MANIFEST_IDS)) {
    throw new Error(`Advanced Bridge Gate B must render all forty blocks in stable manifest order; found ${renderedAdvancedBlocks.length}: ${renderedAdvancedIds.join(",")}.`);
  }
  renderedAdvancedBlocks.each((_index, element) => {
    const block = $(element);
    const blockId = block.attr("data-advanced-block-id") ?? "unknown";
    const lessonId = block.attr("data-advanced-lesson") ?? "";
    const part = Number(block.attr("data-advanced-part"));
    const previous = block.prev();
    const explanationWords = (block.find(".advanced-learning-body>p").map((_paragraphIndex, paragraph) => $(paragraph).text()).get().join(" ").match(/[A-Za-z][A-Za-z'’-]*/g) ?? []).length;
    if (!previous.is(`.learn-block[data-core-zone="${lessonId}-part-${part}"]`) || block.find("h3[tabindex='-1']").length !== 1 || block.find(".advanced-evidence table thead th").length < 2 || block.find("[data-open-model]").length !== 1 || block.find(`[data-advanced-complete="${blockId}"]`).length !== 1 || explanationWords < 180 || explanationWords > 300) {
      throw new Error(`${blockId} is not adjacent to its Learn block or lacks the required explanation, evidence, model link, accessibility, or completion control.`);
    }
  });
  if ($(".lesson-page details.advanced-learning:not(.advanced-learning-block)").length !== 0) throw new Error("A superseded lesson-end Advanced Learning disclosure remains visible.");
  if ($("#advanced-learning [data-advanced-index-item]").length !== 40 || $("#advanced-learning [data-advanced-index-item] [data-advanced-complete]").length !== 40 || $("#advanced-learning [data-advanced-planned]").length !== 0 || $("#advanced-learning [data-advanced-link]").length !== 40) {
    throw new Error("The synchronized forty-item Advanced Learning checklist is incomplete.");
  }
  for (const routeId of ["chapter-11-practice", "chapter-12-practice", "chapter-13-practice"]) {
    if ($(`#${routeId} [data-practice-id][data-required="true"]`).length !== 12) throw new Error(`${routeId} does not contain twelve required items.`);
  }
  for (const record of textbookReview.records as Array<{ routeId: string; attemptId: string; jumpTargetId: string; answers: string[]; questionNumbers: number[]; pageLinks: Array<{ documentId: string; printedPage: number; physicalPage: number }> }>) {
    const route = $(`#${record.routeId}`);
    const support = route.find(`[data-textbook-review-route="${record.routeId}"]`);
    const attempt = support.find(`[data-textbook-review-attempt="${record.attemptId}"]`);
    const answer = support.find(`[data-textbook-review-answer="${record.attemptId}"]`);
    if (support.length !== 1 || attempt.length !== 1 || attempt.attr("aria-expanded") !== "false" || !answer.is("[hidden]") || answer.find(".textbook-review-answer-list>li").length !== record.answers.length || route.find(`#${record.jumpTargetId}`).length !== 1) {
      throw new Error(`${record.routeId} does not render its closed, attempt-gated textbook guide or question jump correctly.`);
    }
    if ((route.html() ?? "").indexOf("textbook-review-support") > (route.html() ?? "").indexOf("practice-stack")) throw new Error(`${record.routeId} textbook review appears after the course questions.`);
    record.pageLinks.forEach((link) => {
      if (support.find(`[data-open-textbook="${link.documentId}"][data-printed-page="${link.printedPage}"][data-pdf-page="${link.physicalPage}"]`).length !== 1) throw new Error(`${record.routeId} is missing an exact textbook page link.`);
    });
    const renderedAnswers = answer.find(".textbook-review-answer-list>li").map((_index, element) => normalizeWhitespace($(element).text().replace(/^Q\d+\.\s*/, ""))).get();
    if (JSON.stringify(renderedAnswers) !== JSON.stringify(record.answers) || JSON.stringify(answer.find(".textbook-review-answer-list>li").map((_index, element) => Number($(element).attr("value"))).get()) !== JSON.stringify(record.questionNumbers)) {
      throw new Error(`${record.routeId} rendered answer guide drifted from the authored contract.`);
    }
  }
  if (/Open Lesson 17/i.test($("#final-practice").text()) || !/version:6/.test(html)) throw new Error("The obsolete Lesson 17 action remains or learner state did not advance to version 6.");
  if ($(".lesson-page [data-practice-id]").length !== 26 || $("#final-practice [data-practice-id][data-required=\"true\"]").length !== 18 || $("#final-practice [data-practice-id][data-required=\"false\"]").length !== 6) {
    throw new Error("Rendered practice does not match the approved 26/36/18/6 architecture.");
  }
  if ($("#review-seminar [data-seminar-session]").length !== 3) throw new Error("Review Seminar must contain three saved sessions.");
  if ($("#process-collection [data-investigation]").length !== 3) throw new Error("Process Collection must contain three investigations.");
  if ($("#process-collection [data-model-collection]").length !== 1 || $("#model-lab [data-model-panel]").length !== 13) throw new Error("The thirteen-model evidence collection is incomplete.");
  $("#model-lab [data-model-panel]").each((_index, element) => {
    const panel = $(element);
    const modelId = panel.attr("data-model-panel") ?? "unknown-model";
    const choiceCount = panel.find("[data-model-choice]").length;
    if (panel.find(".model-path li").length !== 4 || choiceCount < 3 || panel.find("[data-model-result]").length !== choiceCount || panel.find(".model-orientation h3").length !== 1 || panel.find(".model-plan>div").length !== 3 || panel.find("[data-model-prediction][maxlength=180]").length !== 1 || panel.find("[data-test-model]").length !== 1 || panel.find("[data-model-explanation][maxlength=240]").length !== 1 || panel.find("[data-collect-model]").length !== 1 || panel.find("[data-reset-model]").length !== 1 || panel.find("[data-page-target]").length !== 1 || panel.find("details.model-static-equivalent").length !== 1) {
      throw new Error(`${modelId} does not provide a purpose, controlled-variable plan, four-step mechanism, prediction, test, evidence, explanation, save action, scoped reset, static equivalent, and exact lesson return.`);
    }
  });
  if ($('[data-model-panel="action-potential"] [data-model-choice]').length !== 7 || $('[data-model-panel="action-potential"] [data-model-result][data-result-type="graph"][data-has-data-table="true"]').length !== 7) throw new Error("The action-potential model is not a complete seven-phase graph explorer.");
  if ($('[data-model-panel="glucose"] [data-model-choice]').length !== 6 || $('[data-model-panel="glucose"] [data-model-result][data-result-type="graph"][data-has-data-table="true"]').length !== 4 || $('[data-model-panel="glucose"] [data-model-result][data-result-type="pathway"]').length !== 2) throw new Error("The glucose and stress model is missing its four time-series scenarios or two pathway cases.");
  for (const modelId of ["action-potential", "sensory", "hearing", "adh", "glucose"]) {
    const panel = $(`[data-model-panel="${modelId}"]`);
    if (!panel.find('[data-model-result][data-result-type="graph"]').length || panel.find('[data-model-result][data-result-type="graph"]').length !== panel.find('[data-model-result][data-result-type="graph"][data-has-data-table="true"]').length) throw new Error(`${modelId} is missing a graph or complete data-table equivalent.`);
  }
  for (const lesson of PILOT_2_LESSONS) {
    const coreModelLinks = $(`#${lesson.id} [data-open-model]`).filter((_index, element) => $(element).closest(".advanced-learning-block").length === 0);
    if (coreModelLinks.length !== 1) throw new Error(`${lesson.id} does not open its exact Models and Data Lab investigation.`);
  }
  const stateIds = $("[data-response-id],[data-practice-id],[data-save-investigation],[data-textbook-review-attempt]").map((_index, element) =>
    $(element).attr("data-response-id") ?? $(element).attr("data-practice-id") ?? $(element).attr("data-save-investigation") ?? $(element).attr("data-textbook-review-attempt")
  ).get();
  if (stateIds.some((id) => !id?.startsWith("biology30-unit-a-pilot-2:"))) throw new Error("A learner-state ID is outside the Pilot 2 namespace.");
  if (new Set(stateIds).size !== stateIds.length) throw new Error("Duplicate Pilot 2 learner-state IDs were rendered.");
  if ($("button").filter((_index, element) => /play optional video/i.test($(element).text())).length || /autoplay=1/i.test(html)) {
    throw new Error("Optional video behavior regressed to a custom play button or autoplay.");
  }
  if ($("[data-media-checkpoint-id]").length !== 14 || $("#video-library [data-video-panel]").length !== 14 || $("#textbook-library [data-library-panel]").length !== 3 || $("#core-vocabulary [data-vocabulary-entry]").length !== 28) {
    throw new Error("A complete resource inventory is missing from the full course.");
  }
  if ($("#core-vocabulary [data-vocabulary-locked]").length !== 28 || $("#core-vocabulary [data-vocabulary-unlock-link]").length !== 28 || /button\.disabled=!unlocked/.test(html) || !/\.vocabulary-index button\[hidden\]\{display:none\}/.test(html)) {
    throw new Error("Core Vocabulary must hide future terms in Learned so far and provide an operable lesson-linked preview in All term names.");
  }
  if ($("[data-media-checkpoint-id] iframe").length || /autoplay\s*=|[?&]autoplay=1/i.test(html)) throw new Error("Required media must show a preview without autoplay or pre-rendered playback frames.");
  for (const routeId of PILOT_2_LESSONS.map((lesson) => lesson.id)) {
    const route = $(`#${routeId}`);
    if (route.find("[data-figure-id]").length < 4) throw new Error(`${routeId} does not meet the Revision Gate B visual-density floor.`);
  }
  const requiredScience = [
    ["#lesson-01", /Schwann cell.*oligodendrocyte|oligodendrocyte.*Schwann cell/is],
    ["#lesson-01", /myelin.*limits current loss|limits current loss.*myelin/is],
    ["#lesson-02", /threshold.*depolarization|depolarization.*threshold/is],
    ["#lesson-02 [data-figure-id=\"action-potential-voltage-graph\"]", /action potential/i],
    ["#lesson-03", /neurotransmitter.*chemical messenger/is],
    ["#lesson-03", /calcium.*vesicles.*synaptic cleft.*receptor/is],
    ["#lesson-03", /cholinesterase.*reuptake.*agonist.*antagonist/is],
    ["#lesson-04", /afferent.*efferent|efferent.*afferent/is],
    ["#lesson-04", /somatic.*autonomic.*sympathetic.*parasympathetic/is],
    ["#lesson-04", /white matter.*grey matter|grey matter.*white matter/is],
    ["#lesson-05", /pons.*medulla oblongata|medulla oblongata.*pons/is],
    ["#lesson-05", /white matter.*grey matter|grey matter.*white matter/is],
    ["#lesson-06", /sensation.*perception|perception.*sensation/is],
    ["#lesson-06", /photoreceptor.*mechanoreceptor.*chemoreceptor.*thermoreceptor.*nociceptor.*proprioceptor/is],
    ["#lesson-07", /sclera.*cornea.*iris.*pupil.*lens.*choroid.*retina/is],
    ["#lesson-07", /rods.*cones.*fovea.*optic nerve.*accommodation/is],
    ["#lesson-08", /pinna.*auditory canal.*tympanic.*ossicles.*oval window.*cochlea/is],
    ["#lesson-08", /(?=[\s\S]*organ of Corti)(?=[\s\S]*hair cells)(?=[\s\S]*auditory nerve)(?=[\s\S]*vestibule)(?=[\s\S]*semicircular)(?=[\s\S]*Eustachian)/i],
    ["#lesson-09", /dynamic.*workable range.*negative feedback/is],
    ["#lesson-09", /hormone.*receptor-bearing target cells/is],
    ["#lesson-10", /anterior pituitary.*posterior pituitary/is],
    ["#lesson-10", /hGH.*TSH.*ACTH.*ADH/is],
    ["#lesson-11", /made by neurons in the hypothalamus.*released.*posterior pituitary/is],
    ["#lesson-11", /urine volume.*concentration|concentration.*urine volume/is],
    ["#lesson-12", /iodine.*thyroxine.*TSH/is],
    ["#lesson-12", /PTH.*calcitonin.*bone.*kidney.*intestin/is],
    ["#lesson-13", /alpha cells.*beta cells|beta cells.*alpha cells/is],
    ["#lesson-13", /adrenal medulla.*adrenal cortex|adrenal cortex.*adrenal medulla/is]
  ] as const;
  for (const [selector, pattern] of requiredScience) {
    if ($(selector).length !== 1 || !pattern.test($(selector).text())) throw new Error(`Required scientific detail is missing at ${selector}.`);
  }
  for (const figure of FIGURE_CANDIDATES) {
    const assetPath = path.join(stageProjectDir, "workspace", figure.path);
    if (!(await pathExists(assetPath))) throw new Error(`Missing accepted figure asset: ${figure.path}`);
  }
  const modelMap = JSON.parse(await readFile(path.join(stageProjectDir, "meta", "model-lab-interaction-map.json"), "utf8"));
  const mappedSourceIds = new Set<string>(modelMap.records.flatMap((record: { sourceInteractionIds?: string[] }) => record.sourceInteractionIds ?? []));
  const expectedPilot1InteractionIds = [
    "interaction-control-system-comparison", "interaction-negative-feedback-builder", "interaction-neuron-pathway-sort", "interaction-action-potential-explorer",
    "interaction-synapse-sequence", "interaction-brain-symptom-locator", "interaction-reflex-arc-builder", "interaction-sensory-investigation-planner",
    "interaction-eye-light-path", "interaction-audiogram-evidence-explorer", "interaction-sensory-evidence-board", "interaction-endocrine-body-map",
    "interaction-hypothalamus-pituitary-feedback", "interaction-thyroid-calcium-feedback", "interaction-blood-glucose-simulator",
    "interaction-water-salt-data-lab", "interaction-integrated-case-board"
  ];
  if (modelMap.schemaVersion !== 2 || modelMap.workspaceSha256 !== workspaceSha256 || modelMap.records.length !== 14 || expectedPilot1InteractionIds.some((id) => !mappedSourceIds.has(id)) || modelMap.records.filter((record: { treatment?: string }) => record.treatment === "adapted-for-pilot-2").some((record: { investigationQuestion?: string; learningPurpose?: string; testVariable?: string; comparisonControl?: string; evidenceFocus?: string; predictionPrompt?: string; explanationPrompt?: string; persistenceFields?: string[] }) => !record.investigationQuestion || !record.learningPurpose || !record.testVariable || !record.comparisonControl || !record.evidenceFocus || !record.predictionPrompt || !record.explanationPrompt || record.persistenceFields?.length !== 3)) {
    throw new Error("The Pilot 1 to Pilot 2 interaction map is incomplete or bound to the wrong workspace.");
  }
  const manifest = JSON.parse(await readFile(path.join(stageProjectDir, "meta", "project.json"), "utf8"));
  const manifestResult = validateProjectManifestPolicy(manifest);
  if (manifestResult.status !== "valid") throw new Error(`Staged project manifest is invalid: ${manifestResult.errors.join(" ")}`);
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "direct-workspace-v1" || manifest.authoring?.studioEditing?.enabled !== false || manifest.exportTargets?.some((target: { enabled?: boolean }) => target.enabled !== false)) {
    throw new Error("Pilot 2 escaped its blocked, direct-workspace, non-exportable boundary.");
  }
}

function fullPromptPack(workspaceSha256: string, workspaceTreeSha256: string) {
  return `# Biology 30 Unit A Pilot 2 prompt pack

## Boundary

- Project: \`biology30-unit-a-pilot-2\`
- Canonical learner source: \`projects/biology30-unit-a-pilot-2/workspace/index.html\`
- Ownership: direct workspace, blocked, preview-only, Studio Edit disabled
- Gate 1 accepted SHA-256: \`${REQUIRED_GATE_1_SHA}\`
- Gate 2 changes-requested SHA-256: \`${REQUIRED_GATE_2_BASELINE_SHA}\`
- Revision Gate A accepted SHA-256: \`${REQUIRED_REVISION_GATE_A_SHA}\`
- Advanced Learning pre-bridge SHA-256: \`${ADVANCED_BRIDGE_BASELINE_SHA256}\`
- Advanced Bridge Gate A accepted SHA-256: \`${REQUIRED_ADVANCED_GATE_A_SHA}\`
- Advanced Bridge Gate B candidate SHA-256: \`${workspaceSha256}\`
- Current workspace tree SHA-256: \`${workspaceTreeSha256}\`
- Pilot 1 and production Units A-D are protected references and must not be edited.

## Current gate

Advanced Bridge Gate B renders all forty optional blocks directly after their matching Learn sections. The eight accepted Gate A examples retain their role, and the remaining thirty-two blocks complete the bridge at the same accessible reading level. The synchronized Process Collection checklist now opens every block. Every one of Pilot 1's 470 section records has one retained, advanced, review, or exclusion disposition. The course remains blocked and cannot be exported or edited in Studio. No deployment, commit, push, export, promotion, or B-D transfer is authorized.

## Review focus

1. Review at least one expanded block in every lesson, including the eight accepted Gate A reference blocks and the thirty-two new Gate B blocks.
2. Confirm all forty blocks appear immediately after the core Learn section they extend, begin collapsed, use accessible language, and add genuine depth rather than harder wording.
3. Inspect each evidence table and exact Models and Data Lab link. Confirm the evidence supports the stated excellence-level reasoning and remains usable with keyboard-only navigation and text zoom.
4. Mark a block complete in a lesson, open Advanced Learning under Process Collection, and confirm the matching checklist item updates. Uncheck it in the checklist and confirm only that flag is removed.
5. Use representative checklist deep links from every chapter. Each must open the exact lesson, expand the exact block, scroll it into view, and focus its heading.
6. Reload after partial completion and confirm the flags persist. Load a version-5 state and confirm existing learner work remains while all advanced flags begin unchecked.
7. Confirm the checklist lists forty available blocks in lesson order and the timing contract remains 245 lesson-block minutes plus 50 existing optional review minutes.
8. Confirm none of the Advanced Learning checkboxes changes the eighteen required routes, guided practice, Evidence Slips, score, required time, Core Vocabulary, textbook review, or Models and Data Lab state.
9. Review the 470-record difference audit in \`meta/advanced-learning-bridge.json\` and the readable summary in \`meta/advanced-learning-bridge.md\`.
10. Review only the exact build recorded in \`meta/advanced-bridge-gate-b-review.json\`.

## Verification

\`npm run test:biology30-unit-a-pilot-2\`
\`npm run audit:biology30-unit-a-pilot-2:visual -- --project biology30-unit-a-pilot-2\`
\`npm run verify -- --project biology30-unit-a-pilot-2 --mode workspace\`
\`npm run test:e2e:project -- --project biology30-unit-a-pilot-2\`
\`npm run test:e2e:biology30-unit-a-pilot-2\`
\`npm run course:doctor -- --project biology30-unit-a-pilot-2\`
`;
}

export async function buildBiology30UnitAPilot2Full(request: Pilot2FullBuildRequest): Promise<Pilot2FullBuildResult> {
  const repoRoot = path.resolve(request.repoRoot);
  if (request.project !== PILOT_2_SLUG) throw new Error(`--project must be ${PILOT_2_SLUG}.`);
  if (request.acceptedGate1Sha256 !== REQUIRED_GATE_1_SHA) throw new Error("The supplied Gate 1 SHA does not match the approved Pilot 2 checkpoint.");
  if (request.baselineGate2Sha256 !== REQUIRED_GATE_2_BASELINE_SHA) throw new Error("The supplied Gate 2 baseline SHA does not match the changes-requested checkpoint.");
  if (request.acceptedRevisionGateASha256 !== REQUIRED_REVISION_GATE_A_SHA) throw new Error("The supplied Revision Gate A SHA does not match the approved exact build.");
  if (request.acceptedAdvancedGateASha256 !== REQUIRED_ADVANCED_GATE_A_SHA) throw new Error("The supplied Advanced Bridge Gate A SHA does not match the approved exact build.");
  if (request.revision !== REQUIRED_REVISION) throw new Error(`--revision must be ${REQUIRED_REVISION}.`);
  if (request.gate !== REQUIRED_GATE) throw new Error(`--gate must be ${REQUIRED_GATE}.`);
  const projectDir = path.join(repoRoot, "projects", request.project);
  if (!(await pathExists(projectDir))) throw new Error(`Pilot 2 project is missing: ${projectDir}`);
  const metaDir = path.join(projectDir, "meta");
  const workspacePath = path.join(projectDir, "workspace", "index.html");
  const [gate1Review, gate2ReviewBaseline, revisionGateAReview, advancedGateAReview, contract, manifest, vocabulary, sourceMedia, curriculum, sourceCrosswalk, practiceBlueprint, pilot1Disposition] = await Promise.all([
    readFile(path.join(metaDir, "gate-1-review.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "gate-2-review.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "revision-gate-a-review.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "advanced-bridge-gate-a-review.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "pilot-2-contract.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "project.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "core-vocabulary.json"), "utf8").then(JSON.parse),
    readFile(path.join(repoRoot, "projects", "biology30-unit-a-pilot", "meta", "media-integration.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "curriculum-performance-map.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "teacher-source-crosswalk.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "practice-blueprint.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "pilot-1-section-disposition.json"), "utf8").then(JSON.parse) as Promise<Pilot1DispositionContract>
  ]);
  if (gate1Review.status !== "teacher-accepted" || gate1Review.teacherDecision?.acceptedWorkspaceSha256 !== REQUIRED_GATE_1_SHA || contract.gate1?.teacherAcceptance !== "accepted") {
    throw new Error("Gate 1 has not been accepted against the required exact workspace hash.");
  }
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.studioEditing?.enabled !== false || manifest.exportTargets?.some((target: { enabled?: boolean }) => target.enabled !== false)) {
    throw new Error("Pilot 2 is not in the required blocked, non-editable, non-exportable state.");
  }
  const currentWorkspaceSha = await sha256File(workspacePath);
  const existingGateBReviewPath = path.join(metaDir, "revision-gate-b-review.json");
  const existingGateBReview = await pathExists(existingGateBReviewPath)
    ? JSON.parse(await readFile(existingGateBReviewPath, "utf8"))
    : null;
  if (gate2ReviewBaseline.workspaceSha256 !== REQUIRED_GATE_2_BASELINE_SHA || gate2ReviewBaseline.status === "teacher-accepted") {
    throw new Error(`Refusing revision because the Gate 2 review record drifted from ${REQUIRED_GATE_2_BASELINE_SHA}.`);
  }
  const preservedGate2Path = path.join(projectDir, "raw", "gate-2-review-baselines", REQUIRED_GATE_2_BASELINE_SHA, "workspace", "index.html");
  const verifiedGateAReview = revisionGateAReview.workspaceSha256 === REQUIRED_REVISION_GATE_A_SHA
    && revisionGateAReview.codexReview?.status === "passed"
    && revisionGateAReview.publicReview?.status === "deployed"
    && revisionGateAReview.publicReview?.allHostedFilesMatchCanonical === true;
  const startingFromAcceptedAdvancedGateA = currentWorkspaceSha === REQUIRED_ADVANCED_GATE_A_SHA
    && revisionGateAReview.status === "teacher-accepted"
    && verifiedGateAReview
    && advancedGateAReview.status === "teacher-accepted"
    && advancedGateAReview.workspaceSha256 === REQUIRED_ADVANCED_GATE_A_SHA
    && advancedGateAReview.teacherDecision?.decision === "accepted"
    && advancedGateAReview.teacherDecision?.acceptedWorkspaceSha256 === REQUIRED_ADVANCED_GATE_A_SHA
    && existingGateBReview?.workspaceSha256 === REQUIRED_ADVANCED_GATE_A_SHA;
  if ((!startingFromAcceptedAdvancedGateA)
    || !(await pathExists(preservedGate2Path))
    || await sha256File(preservedGate2Path) !== REQUIRED_GATE_2_BASELINE_SHA) {
    throw new Error(`Advanced Bridge Gate B requires the exact accepted Gate A learner SHA ${REQUIRED_ADVANCED_GATE_A_SHA}, its explicit acceptance record, the verified teacher-approved Revision Gate A build, and the preserved Gate 2 baseline.`);
  }

  const protectedBefore = await protectedHashes(repoRoot);
  const previousGateBBaseline: string | null = null;

  const videos = VIDEO_REMAP.map((record) => {
    const source = sourceMedia.videos.find((video: { youtubeId?: string }) => video.youtubeId === record.youtubeId);
    if (!source) throw new Error(`Required mapped video is absent from the media contract: ${record.youtubeId}`);
    const lesson = PILOT_2_LESSONS.find((entry) => entry.id === record.routeId);
    return { ...source, ...record, chapter: lesson?.chapter ?? 11 };
  });
  if (videos.length !== 14) throw new Error("The revised Pilot 2 media contract must contain fourteen mapped checkpoints.");
  const scientificExplanation = vocabulary.entries.find((entry: { id: string }) => entry.id === "scientific-explanation");
  if (!scientificExplanation) throw new Error("Core Vocabulary is missing the scientific-explanation family.");
  scientificExplanation.primaryLessonIds = ["lesson-05", "review-seminar", "final-practice"];
  const fixedVocabularyIds = vocabulary.fixedMilestones.map((entry: { entryId: string }) => entry.entryId);
  const generatedAt = new Date().toISOString();
  const rendered = renderPilot2Full({ lessons: PILOT_2_LESSONS, vocabularyEntries: vocabulary.entries, fixedVocabularyIds, videos });
  const practiceReadinessAudit = buildPracticeReadinessAudit({ render: rendered, blueprint: practiceBlueprint, vocabularyEntries: vocabulary.entries, generatedAt });
  const atomicBuild = buildAtomicCurriculumContract({ html: rendered.html, curriculum, crosswalk: sourceCrosswalk, practice: practiceBlueprint, vocabularyEntries: vocabulary.entries, generatedAt });
  const render = { ...rendered, html: atomicBuild.html };
  const projectsDir = path.join(repoRoot, "projects");
  const stageContainer = await mkdtemp(path.join(projectsDir, ".biology30-unit-a-pilot-2-revision-b-stage-"));
  const stageProjectDir = path.join(stageContainer, PILOT_2_SLUG);
  let backupDir = "";
  try {
    await cp(projectDir, stageProjectDir, { recursive: true, force: false });
    const stageWorkspaceDir = path.join(stageProjectDir, "workspace");
    const stageMetaDir = path.join(stageProjectDir, "meta");
    const acceptedGate1Dir = path.join(stageProjectDir, "raw", "gate-1-accepted");
    await mkdir(acceptedGate1Dir, { recursive: true });
    const acceptedGate1Path = path.join(acceptedGate1Dir, "index.html");
    if (!(await pathExists(acceptedGate1Path))) await copyFile(workspacePath, acceptedGate1Path);
    if (await sha256File(acceptedGate1Path) !== REQUIRED_GATE_1_SHA) throw new Error("The preserved Gate 1 HTML does not match the accepted hash.");

    const gate2BaselineDir = path.join(stageProjectDir, "raw", "gate-2-review-baselines", REQUIRED_GATE_2_BASELINE_SHA);
    const gate2MetaSnapshotDir = path.join(gate2BaselineDir, "meta-snapshot");
    await mkdir(gate2MetaSnapshotDir, { recursive: true });
    const gate2BaselineWorkspacePath = path.join(gate2BaselineDir, "workspace", "index.html");
    await mkdir(path.dirname(gate2BaselineWorkspacePath), { recursive: true });
    if (!(await pathExists(gate2BaselineWorkspacePath))) {
      await copyFile(workspacePath, gate2BaselineWorkspacePath);
      for (const file of ["gate-2-review.json", "gate-2-content-audit.json", "reading-level-report.json", "state-budget.json", "pilot-2-contract.json"]) {
        await copyFile(path.join(metaDir, file), path.join(gate2MetaSnapshotDir, file));
      }
      await writeJson(path.join(gate2BaselineDir, "baseline.json"), {
        schemaVersion: 1,
        project: PILOT_2_SLUG,
        capturedAt: generatedAt,
        workspaceSha256: REQUIRED_GATE_2_BASELINE_SHA,
        reviewStatusAtCapture: gate2ReviewBaseline.status,
        protectedProjectHashes: protectedBefore,
        purpose: "Immutable pre-revision Gate 2 candidate and content-contract evidence."
      });
    }
    if (await sha256File(gate2BaselineWorkspacePath) !== REQUIRED_GATE_2_BASELINE_SHA) throw new Error("The preserved Gate 2 baseline does not match the required changes-requested hash.");

    const revisionGateABaselineDir = path.join(stageProjectDir, "raw", "revision-gate-a-accepted", REQUIRED_REVISION_GATE_A_SHA);
    const revisionGateAMetaSnapshotDir = path.join(revisionGateABaselineDir, "meta-snapshot");
    const revisionGateAWorkspacePath = path.join(revisionGateABaselineDir, "workspace", "index.html");
    await mkdir(path.dirname(revisionGateAWorkspacePath), { recursive: true });
    await mkdir(revisionGateAMetaSnapshotDir, { recursive: true });
    if (!(await pathExists(revisionGateAWorkspacePath))) {
      await copyFile(workspacePath, revisionGateAWorkspacePath);
      for (const file of ["revision-gate-a-review.json", "revision-gate-a-content-audit.json", "reading-level-report.json", "state-budget.json", "pilot-2-contract.json", "atomic-curriculum-map.json"]) {
        await copyFile(path.join(metaDir, file), path.join(revisionGateAMetaSnapshotDir, file));
      }
      await writeJson(path.join(revisionGateABaselineDir, "baseline.json"), {
        schemaVersion: 1,
        project: PILOT_2_SLUG,
        capturedAt: generatedAt,
        workspaceSha256: REQUIRED_REVISION_GATE_A_SHA,
        reviewStatusAtCapture: revisionGateAReview.status,
        codexReviewStatus: revisionGateAReview.codexReview.status,
        publicReviewStatus: revisionGateAReview.publicReview.status,
        teacherDecisionEvidence: "User approved the next full-course step in the active Codex task after reviewing the exact deployed Revision Gate A build.",
        protectedProjectHashes: protectedBefore,
        purpose: "Immutable accepted Revision Gate A learner build and review evidence before full Revision Gate B propagation."
      });
    }
    if (await sha256File(revisionGateAWorkspacePath) !== REQUIRED_REVISION_GATE_A_SHA) throw new Error("The preserved Revision Gate A baseline does not match the accepted exact build.");

    const advancedGateABaselineDir = path.join(stageProjectDir, "raw", "advanced-bridge-gate-a-accepted", REQUIRED_ADVANCED_GATE_A_SHA);
    const advancedGateAWorkspacePath = path.join(advancedGateABaselineDir, "workspace", "index.html");
    const advancedGateAMetaDir = path.join(advancedGateABaselineDir, "meta-snapshot");
    await mkdir(path.dirname(advancedGateAWorkspacePath), { recursive: true });
    await mkdir(advancedGateAMetaDir, { recursive: true });
    if (!(await pathExists(advancedGateAWorkspacePath))) {
      await copyFile(workspacePath, advancedGateAWorkspacePath);
      for (const file of ["advanced-bridge-gate-a-review.json", "advanced-learning-bridge.json", "advanced-learning-bridge.md", "revision-gate-b-review.json", "revision-gate-b-content-audit.json", "state-budget.json", "route-response-map.json", "pilot-2-contract.json"]) {
        const source = path.join(metaDir, file);
        if (await pathExists(source)) await copyFile(source, path.join(advancedGateAMetaDir, file));
      }
      await writeJson(path.join(advancedGateABaselineDir, "baseline.json"), {
        schemaVersion: 1,
        project: PILOT_2_SLUG,
        capturedAt: generatedAt,
        workspaceSha256: REQUIRED_ADVANCED_GATE_A_SHA,
        reviewStatusAtCapture: "teacher-accepted",
        teacherDecisionEvidence: "The project owner explicitly approved the exact Advanced Bridge Gate A candidate and authorized Gate B authoring.",
        protectedProjectHashes: protectedBefore,
        purpose: "Immutable accepted Advanced Bridge Gate A learner build and review evidence before the remaining thirty-two blocks were authored."
      });
    }
    if (await sha256File(advancedGateAWorkspacePath) !== REQUIRED_ADVANCED_GATE_A_SHA) throw new Error("The preserved Advanced Bridge Gate A baseline does not match the accepted exact build.");

    const sourceWorkspace = path.join(repoRoot, "projects", "biology30-unit-a-pilot", "workspace");
    for (const figure of FIGURE_CANDIDATES) {
      const source = path.join(sourceWorkspace, figure.path);
      const destination = path.join(stageWorkspaceDir, figure.path);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(source, destination);
    }
    const stageWorkspacePath = path.join(stageWorkspaceDir, "index.html");
    await writeFile(stageWorkspacePath, render.html, "utf8");
    const workspaceSha256 = await sha256File(stageWorkspacePath);
    const textbookReviewIntegration = buildTextbookReviewIntegration(workspaceSha256, generatedAt);
    const advancedLearningBridge = buildAdvancedLearningBridge({ workspaceSha256, generatedAt, disposition: pilot1Disposition });
    const advancedLearningReport = advancedLearningBridgeReport(advancedLearningBridge);
    const modelLabInteractionMap = buildModelLabInteractionMap(workspaceSha256, generatedAt);
    const atomicContract: Pilot2AtomicContractV1 = { ...atomicBuild.contract, workspaceSha256 };
    practiceReadinessAudit.workspaceSha256 = workspaceSha256;
    practiceBlueprint.status = "revision-gate-b-awaiting-teacher-review";
    practiceBlueprint.workspaceSha256 = workspaceSha256;
    practiceBlueprint.readinessAudit = "meta/practice-readiness-audit.json";
    practiceBlueprint.updatedAt = generatedAt;
    await writeJson(path.join(stageMetaDir, "atomic-curriculum-map.json"), atomicContract);
    const workspaceTree = await hashTree(stageWorkspaceDir, "workspace");
    const reading = fullReadingReport(render.html);
    const readingFailures = reading.filter((entry) => entry.fleschKincaidGrade > 12 || entry.averageSentenceWords > 20 || entry.longestCoreParagraphWords > 100
      || entry.wordCount < 700 || entry.wordCount > (entry.routeId === "lesson-13" ? 1200 : 1050));
    if (readingFailures.length) {
      throw new Error(`Core reading rules failed: ${readingFailures.map((entry) => `${entry.routeId} grade=${entry.fleschKincaidGrade}, avg=${entry.averageSentenceWords}, paragraph=${entry.longestCoreParagraphWords}`).join("; ")}`);
    }
    const stateEstimate = estimateWorstCaseState(render.html, fixedVocabularyIds);
    if (stateEstimate.characters > 44_000) throw new Error(`Worst-case saved state exceeds 44,000 characters: ${stateEstimate.characters}`);
    if (stateEstimate.mediaCheckpointCount !== 14) throw new Error(`Expected fourteen media checkpoints in saved state; found ${stateEstimate.mediaCheckpointCount}.`);
    if (stateEstimate.modelCount !== 13) throw new Error(`Expected thirteen Model Lab records in saved state; found ${stateEstimate.modelCount}.`);
    if (stateEstimate.textbookReviewAttemptCount !== 4) throw new Error(`Expected four textbook review attempts in saved state; found ${stateEstimate.textbookReviewAttemptCount}.`);
    if (stateEstimate.advancedCompletionCount !== 40) throw new Error(`Expected forty Advanced Learning completion flags in saved state; found ${stateEstimate.advancedCompletionCount}.`);

    const routeStateMap = JSON.parse(await readFile(path.join(stageMetaDir, "route-response-map.json"), "utf8"));
    routeStateMap.currentPilot2StateIds = [...new Set(render.html.match(/biology30-unit-a-pilot-2:[A-Za-z0-9:._-]+/g) ?? [])].sort();
    routeStateMap.gate2WorkspaceSha256 = REQUIRED_GATE_2_BASELINE_SHA;
    routeStateMap.revisionGateAWorkspaceSha256 = REQUIRED_REVISION_GATE_A_SHA;
    routeStateMap.revisionGateBWorkspaceSha256 = workspaceSha256;
    routeStateMap.stateSchemaVersion = 6;
    routeStateMap.stateEncoding = "hashed-v1";
    routeStateMap.advancedLearning = {
      manifestIds: ADVANCED_LEARNING_MANIFEST_IDS,
      persistedAs: "ten-hex-character-bitset",
      completionImpact: false,
      migrationFromVersion5: "all Advanced Learning flags unchecked"
    };
    routeStateMap.updatedAt = generatedAt;

    const figureMediaPlan = JSON.parse(await readFile(path.join(stageMetaDir, "figure-media-plan.json"), "utf8"));
    figureMediaPlan.figures = await Promise.all(figureMediaPlan.figures.map(async (figure: Record<string, unknown>) => ({
      ...figure,
      gate1Treatment: undefined,
      gate2Treatment: "revision-gate-b-full-course-context-review",
      sourceSha256: await sha256File(path.join(sourceWorkspace, String(figure.path))),
      accessibilityStatus: "responsive-image-or-semantic-model-with-adjacent-text-and-enlargement-where-raster",
      revisionGateADecision: "accepted-in-reviewed-slice-context",
      teacherDecision: "awaiting-revision-gate-b-full-course-review"
    })));
    figureMediaPlan.workspaceSha256 = workspaceSha256;
    figureMediaPlan.renderedFigureInventory = buildRenderedFigureInventory({
      html: render.html,
      atomicContract,
      sourceCrosswalk,
      acceptedRasterFigures: figureMediaPlan.figures
    });
    figureMediaPlan.renderedFigureInventory.generatedAt = generatedAt;
    figureMediaPlan.renderedFigureInventory.workspaceSha256 = workspaceSha256;
    figureMediaPlan.videos = videos.map((video) => ({
      youtubeId: video.youtubeId,
      routeId: video.routeId,
      topic: video.topic,
      role: video.role,
      title: video.title,
      provider: video.provider,
      canonicalUrl: video.canonicalUrl,
      privacyEnhancedEmbedUrl: video.privacyEnhancedEmbedUrl,
      watchFor: video.watchFor,
      captionsStatus: video.captionsStatus,
      availabilityStatus: video.availabilityStatus,
      treatment: "required-video-or-local-equivalent",
      requiredLearningStep: true,
      youtubeRequired: false,
      localEquivalentStepCount: video.localSteps.length,
      completionImpact: true,
      requiredInstructionDependency: false,
      customPlayButton: false,
      autoplay: false
    }));
    figureMediaPlan.updatedAt = generatedAt;

    vocabulary.status = "revision-gate-b-awaiting-teacher-review";
    vocabulary.updatedAt = generatedAt;

    contract.gate2 = {
      ...contract.gate2,
      status: "changes-requested",
      workspaceSha256: REQUIRED_GATE_2_BASELINE_SHA,
      teacherAcceptance: "changes-requested",
      feedbackRecord: "meta/teacher-feedback-revision-1.json",
      immutableBaseline: `raw/gate-2-review-baselines/${REQUIRED_GATE_2_BASELINE_SHA}/baseline.json`
    };
    contract.revisionGateA = {
      ...contract.revisionGateA,
      status: "teacher-accepted",
      workspaceSha256: REQUIRED_REVISION_GATE_A_SHA,
      teacherAcceptance: "accepted",
      acceptedAt: generatedAt,
      acceptanceRecord: "meta/revision-gate-a-review.json",
      immutableBaseline: `raw/revision-gate-a-accepted/${REQUIRED_REVISION_GATE_A_SHA}/baseline.json`
    };
    contract.revisionGateB = {
      status: "awaiting-teacher-review",
      revision: REQUIRED_REVISION,
      iteration: REVISION_GATE_B_ITERATION,
      generatedAt,
      workspaceSha256,
      workspaceTreeSha256: workspaceTree.sha256,
      protectedProjectHashes: protectedBefore,
      acceptedRevisionGateAWorkspaceSha256: REQUIRED_REVISION_GATE_A_SHA,
      expandedRoutes: ["lesson-01", "lesson-03", "lesson-04", "lesson-06", "lesson-07", "lesson-08", "lesson-09", "lesson-10", "lesson-12"],
      renderedRoutes: render.learnerRoutes,
      counts: { lessons: 13, reviewRoutes: 5, learnerRoutes: 27, requiredPracticeItems: 80, optionalChallengeItems: 6, investigations: 3, vocabularyFamilies: 28, operableLockedVocabularyPreviews: 28, modelLabModels: 13, modelLabScenarios: MODEL_LAB_RECORDS.reduce((total, model) => total + model.choices.length, 0), collectableModelResults: 13, requiredMediaCheckpoints: 14, textbookReviewSections: 4, textbookReviewNativeAnswers: 120, advancedLearningManifestBlocks: 40, advancedLearningAcceptedGateABlocks: 8, advancedLearningRenderedGateBBlocks: 32, advancedLearningRenderedTotalBlocks: 40, advancedLearningPlannedBlocks: 0, advancedLearningLessonMinutes: 245, pilot1SectionDispositions: 470, acceptedRasterFigures: 12, renderedFigures: figureMediaPlan.renderedFigureInventory.count, atomicComponents: atomicContract.components.length },
      previousCandidate: { workspaceSha256: REQUIRED_ADVANCED_GATE_A_SHA, status: "teacher-accepted", immutableBaseline: `raw/advanced-bridge-gate-a-accepted/${REQUIRED_ADVANCED_GATE_A_SHA}/baseline.json` },
      textbookReviewBaseline: { workspaceSha256: TEXTBOOK_REVIEW_BASELINE_SHA, status: "changes-requested", immutableBaseline: `raw/revision-gate-b-review-baselines/${TEXTBOOK_REVIEW_BASELINE_SHA}/baseline.json` },
      teacherAcceptance: "pending",
      authorityCheck: { checkedAt: "2026-09-04", newestBiologySpecificBulletinFound: "2025-26", currentGeneralBulletin: "2026-27", result: "no-newer-biology-specific-bulletin-found" }
    };
    contract.advancedBridgeGateA = {
      status: "teacher-accepted",
      baselineWorkspaceSha256: ADVANCED_BRIDGE_BASELINE_SHA256,
      workspaceSha256: REQUIRED_ADVANCED_GATE_A_SHA,
      workspaceTreeSha256: advancedGateAReview.workspaceTreeSha256,
      renderedBlockIds: ADVANCED_GATE_A_IDS,
      completeManifestIds: ADVANCED_LEARNING_MANIFEST_IDS,
      renderedBlocks: ADVANCED_GATE_A_IDS.length,
      plannedGateBBlocksAtAcceptance: ADVANCED_LEARNING_MANIFEST_IDS.length - ADVANCED_GATE_A_IDS.length,
      lessonOptionalMinutes: ADVANCED_LESSON_MINUTES,
      totalOptionalMinutes: ADVANCED_LESSON_MINUTES + 50,
      sourceSectionDispositions: advancedLearningBridge.sourceSectionAudit.recordCount,
      contract: "meta/advanced-learning-bridge.json",
      reviewRecord: "meta/advanced-bridge-gate-a-review.json",
      immutableBaseline: `raw/advanced-bridge-gate-a-accepted/${REQUIRED_ADVANCED_GATE_A_SHA}/baseline.json`,
      teacherDecision: advancedGateAReview.teacherDecision
    };
    contract.advancedBridgeGateB = {
      status: "awaiting-teacher-review",
      acceptedGateAWorkspaceSha256: REQUIRED_ADVANCED_GATE_A_SHA,
      workspaceSha256,
      workspaceTreeSha256: workspaceTree.sha256,
      acceptedGateABlockIds: ADVANCED_GATE_A_IDS,
      newlyRenderedBlockIds: ADVANCED_GATE_B_IDS,
      renderedBlocks: ADVANCED_LEARNING_BLOCKS.length,
      lessonOptionalMinutes: ADVANCED_LESSON_MINUTES,
      totalOptionalMinutes: ADVANCED_LESSON_MINUTES + 50,
      sourceSectionDispositions: advancedLearningBridge.sourceSectionAudit.recordCount,
      contract: "meta/advanced-learning-bridge.json",
      reviewRecord: "meta/advanced-bridge-gate-b-review.json",
      teacherDecision: null
    };
    contract.state = { ...(contract.state ?? {}), schemaVersion: 6, storageKey: "biology30-unit-a-pilot-2:state:v1", encoding: "hashed-v1-plus-advanced-bitset", migration: "Version-1 through version-5 work is preserved. Existing responses, practice, completion, Process Collection, vocabulary, media, models, and textbook attempts remain unchanged. Version 6 adds forty allowlisted Advanced Learning completion flags, initially unchecked, as a ten-character hexadecimal bitset." };
    contract.textbookReviewIntegration = {
      contract: "meta/textbook-review-integration.json",
      sections: 4,
      nativeAnswers: 120,
      attemptIds: 4,
      optional: true,
      completionImpact: false,
      scoringImpact: false,
      timeImpact: false
    };
    contract.advancedLearningBridge = {
      contract: "meta/advanced-learning-bridge.json",
      report: "meta/advanced-learning-bridge.md",
      manifestBlocks: 40,
      acceptedGateABlocks: 8,
      renderedGateBBlocks: 32,
      renderedTotalBlocks: 40,
      plannedBlocks: 0,
      lessonOptionalMinutes: 245,
      totalOptionalMinutes: 295,
      completionImpact: false,
      scoringImpact: false,
      requiredMinutesImpact: false
    };

    const canonicalAssets = [
      "assets/brand/nxt-ce-logo-white-with-ce.png",
      "assets/font-manifest.json",
      "assets/fonts/HankenGrotesk-Variable.ttf",
      "assets/fonts/OFL-Hanken-Grotesk.txt",
      "assets/fonts/OFL-Work-Sans.txt",
      "assets/fonts/WorkSans-Variable.ttf",
      "assets/textbook/chapter-11.pdf",
      "assets/textbook/chapter-12.pdf",
      "assets/textbook/chapter-13.pdf",
      ...FIGURE_CANDIDATES.map((figure) => figure.path)
    ];
    const canonicalMeta = ["pilot-2-contract.json", "curriculum-performance-map.json", "atomic-curriculum-map.json", "teacher-source-crosswalk.json", "pilot-1-section-disposition.json", "advanced-learning-bridge.json", "advanced-learning-bridge.md", "advanced-bridge-gate-a-review.json", "advanced-bridge-gate-b-review.json", "practice-blueprint.json", "practice-readiness-audit.json", "core-vocabulary.json", "figure-media-plan.json", "model-lab-interaction-map.json", "textbook-review-integration.json", "route-response-map.json", "reading-level-report.json", "state-budget.json", "gate-1-review.json", "gate-2-review.json", "gate-2-content-audit.json", "teacher-feedback-revision-1.json", "revision-gate-a-review.json", "revision-gate-a-content-audit.json", "revision-gate-b-review.json", "revision-gate-b-content-audit.json", "pilot-2-improvement-ledger.json", "pilot-2-improvement-journal.md", "prompt-pack.md"];
    manifest.updatedAt = generatedAt;
    manifest.canonicalSources = [`projects/${PILOT_2_SLUG}/workspace/index.html`, ...canonicalAssets.map((asset) => `projects/${PILOT_2_SLUG}/workspace/${asset}`), ...canonicalMeta.map((file) => `projects/${PILOT_2_SLUG}/meta/${file}`)];
    manifest.referenceOnly = [...new Set([...(manifest.referenceOnly ?? []), `projects/${PILOT_2_SLUG}/raw/gate-1-accepted/index.html`, `projects/${PILOT_2_SLUG}/raw/gate-2-review-baselines/${REQUIRED_GATE_2_BASELINE_SHA}/`, `projects/${PILOT_2_SLUG}/raw/revision-gate-a-accepted/${REQUIRED_REVISION_GATE_A_SHA}/`, `projects/${PILOT_2_SLUG}/raw/advanced-bridge-gate-a-accepted/${REQUIRED_ADVANCED_GATE_A_SHA}/`, ...(previousGateBBaseline ? [`projects/${PILOT_2_SLUG}/${path.dirname(previousGateBBaseline)}/`] : [])])];
    manifest.sourceOfTruthNotes = `The directly authored Advanced Bridge Gate B workspace is canonical and blocked for exact-build review. It renders all forty optional Advanced Learning blocks; the exact eight-block Gate A candidate remains teacher-accepted and preserved at SHA-256 ${REQUIRED_ADVANCED_GATE_A_SHA}. Gate 1 and Revision Gate A remain accepted at SHA-256 ${REQUIRED_GATE_1_SHA} and ${REQUIRED_REVISION_GATE_A_SHA}; superseded review candidates remain immutable. Pilot 1 and production Units A-D are protected references. Export, promotion, deployment, Studio editing, and B-D transfer are not authorized.`;

    const e2eContract = JSON.parse(await readFile(path.join(stageMetaDir, "e2e-contract.json"), "utf8"));
    e2eContract.learnerCourse.routes = render.learnerRoutes;
    e2eContract.learnerCourse.printRoutes = ["process-collection"];
    e2eContract.learnerCourse.mobile.routes = render.learnerRoutes;
    e2eContract.quiz = { enabled: false, lessonTitle: "Final Practice" };

    const gate2Review = {
      ...gate2ReviewBaseline,
      status: "changes-requested",
      changesRequestedAt: generatedAt,
      workspaceSha256: REQUIRED_GATE_2_BASELINE_SHA,
      feedbackRecord: "meta/teacher-feedback-revision-1.json",
      immutableBaseline: `raw/gate-2-review-baselines/${REQUIRED_GATE_2_BASELINE_SHA}/baseline.json`,
      teacherDecision: { status: "changes-requested", basis: "Teacher feedback requested more depth, atomic specificity, complete vocabulary, and required multimedia." }
    };
    const teacherFeedbackRecord = {
      schemaVersion: 1,
      project: PILOT_2_SLUG,
      receivedAt: "2026-09-03",
      evidenceType: "teacher-feedback",
      executionPolicy: "This quotation is preserved as review evidence and is never executed as source code or an implementation instruction.",
      baselineWorkspaceSha256: REQUIRED_GATE_2_BASELINE_SHA,
      verbatim: "Some great changes! I love the bolded words and overall much better language, but almost a bit too brief. Since it is in paragraph form it would be nice to have more compelte and descriptive sentences, but at this reading level. Little more explanations would also be helpful.  But I think this organization and progression through the concepts is better.\nI also think the videos should not be optional. For the average student the text is not enough to make sense of it all. My slides use more succint wording but all videos are mandatory.\nI do love the stop and check section.\nIt does lack specific things, however. But these would only be caught going through the lessons carefully. For example, studentsneed to be able to see and work with graphs of action potentals, etc.\nI think overall this is the right direction, but it lacks some detail, explanation, diagram and specific concepts. Not sure how that is best addressed.\nOh and I love the 'Words before mechanism' section, but there are more new terms in each lesson than just those fore. It would be nice to include those, maybe even as a dropdown list or a scrollable sub-section so students don't have to look through them all if they don't want to. Just wouldn't want to give the false impression that only these 4 terms are important."
    };
    const acceptedRevisionGateAReview = {
      ...revisionGateAReview,
      status: "teacher-accepted",
      teacherDecision: {
        status: "accepted",
        acceptedAt: generatedAt,
        acceptedWorkspaceSha256: REQUIRED_REVISION_GATE_A_SHA,
        basis: "The user approved moving to the next full-course step after reviewing the exact deployed Revision Gate A build.",
        authorizationBoundary: "Revision Gate B implementation and verification only; no deployment, commit, push, export, promotion, Studio enablement, or Unit B-D changes."
      },
      immutableBaseline: `raw/revision-gate-a-accepted/${REQUIRED_REVISION_GATE_A_SHA}/baseline.json`
    };
    const revisionGateBReview = {
      schemaVersion: 1,
      project: PILOT_2_SLUG,
      revision: REQUIRED_REVISION,
      iteration: REVISION_GATE_B_ITERATION,
      status: "awaiting-teacher-review",
      generatedAt,
      acceptedGate1WorkspaceSha256: REQUIRED_GATE_1_SHA,
      changesRequestedGate2WorkspaceSha256: REQUIRED_GATE_2_BASELINE_SHA,
      acceptedRevisionGateAWorkspaceSha256: REQUIRED_REVISION_GATE_A_SHA,
      workspaceSha256,
      workspaceTreeSha256: workspaceTree.sha256,
      protectedProjectHashes: protectedBefore,
      previousCandidate: { workspaceSha256: REQUIRED_ADVANCED_GATE_A_SHA, status: "teacher-accepted", immutableBaseline: `raw/advanced-bridge-gate-a-accepted/${REQUIRED_ADVANCED_GATE_A_SHA}/baseline.json` },
      textbookReviewBaseline: { workspaceSha256: TEXTBOOK_REVIEW_BASELINE_SHA, status: "changes-requested", immutableBaseline: `raw/revision-gate-b-review-baselines/${TEXTBOOK_REVIEW_BASELINE_SHA}/baseline.json` },
      advancedBridgeBaseline: { workspaceSha256: ADVANCED_BRIDGE_BASELINE_SHA256, status: "changes-requested", immutableBaseline: `raw/revision-gate-b-review-baselines/${ADVANCED_BRIDGE_BASELINE_SHA256}/baseline.json` },
      expandedRoutes: ["lesson-01", "lesson-03", "lesson-04", "lesson-06", "lesson-07", "lesson-08", "lesson-09", "lesson-10", "lesson-12"],
      completeLessonRoutes: PILOT_2_LESSONS.map((lesson) => lesson.id),
      advancedBridgeGate: "gate-b",
      advancedLearning: { manifestBlocks: 40, acceptedGateABlocks: 8, newlyRenderedGateBBlocks: 32, renderedBlocks: 40, plannedBlocks: 0, lessonOptionalMinutes: 245, totalOptionalMinutes: 295, sourceSectionDispositions: 470 },
      reviewCriteria: ["all forty Advanced Learning blocks appear directly after their mapped Learn sections", "advanced depth uses accessible language and defines additional terminology", "every block contains a purposeful semantic evidence form and exact Models and Data Lab link", "the Process Collection checklist enables all forty manifest entries", "lesson and checklist completion controls synchronize and persist", "deep links expand and focus the exact block", "version-5 state migrates with all advanced flags unchecked and no learner-work loss", "advanced completion never changes required progress, score, practice, evidence, or required time", "all 470 Pilot 1 section records have one recorded disposition", "the 245-minute lesson-block budget plus existing 20-minute seminar extension and 30-minute Diploma Challenge preserves 295 optional minutes", "the 18-route completion and 1505-minute contract is unchanged"],
      codexReview: null,
      teacherDecision: null
    };
    const acceptedAdvancedBridgeGateAReview = {
      ...advancedGateAReview,
      status: "teacher-accepted",
      immutableBaseline: `raw/advanced-bridge-gate-a-accepted/${REQUIRED_ADVANCED_GATE_A_SHA}/baseline.json`
    };
    const advancedBridgeGateBReview = {
      schemaVersion: 1,
      project: PILOT_2_SLUG,
      gate: "advanced-bridge-gate-b",
      status: "awaiting-teacher-review",
      generatedAt,
      baselineWorkspaceSha256: ADVANCED_BRIDGE_BASELINE_SHA256,
      acceptedGateAWorkspaceSha256: REQUIRED_ADVANCED_GATE_A_SHA,
      workspaceSha256,
      workspaceTreeSha256: workspaceTree.sha256,
      acceptedGateABlockIds: ADVANCED_GATE_A_IDS,
      newlyRenderedGateBBlockIds: ADVANCED_GATE_B_IDS,
      manifestBlockIds: ADVANCED_LEARNING_MANIFEST_IDS,
      renderedBlocks: ADVANCED_LEARNING_BLOCKS.length,
      newlyRenderedBlocks: ADVANCED_GATE_B_BLOCKS.length,
      gateAMinutes: ADVANCED_GATE_A_MINUTES,
      gateBMinutes: ADVANCED_GATE_B_MINUTES,
      lessonOptionalMinutes: ADVANCED_LESSON_MINUTES,
      totalOptionalMinutes: ADVANCED_LESSON_MINUTES + 50,
      sourceSectionDispositions: advancedLearningBridge.sourceSectionAudit.recordCount,
      contract: "meta/advanced-learning-bridge.json",
      readableReport: "meta/advanced-learning-bridge.md",
      reviewCriteria: ["readable core instruction is unchanged", "all forty blocks add curricular standard-of-excellence reasoning without harder prose", "all blocks are collapsed by default and adjacent to their exact Learn section", "semantic evidence and exact Models and Data Lab links are useful", "all forty checklist items are operable", "completion state synchronizes, persists, and unchecks safely", "deep links open, expand, scroll, and focus exactly", "version-5 migration preserves all prior learner work", "advanced completion is completely non-gating", "mobile, keyboard, zoom, and screen-reader structures pass"],
      codexReview: null,
      teacherDecision: null,
      authorizationBoundary: "This candidate is review-only. No deployment, commit, push, export, publication, Studio editing, or changes to Pilot 1 or Units A-D are authorized."
    };
    const contentAudit = {
      schemaVersion: 1,
      project: PILOT_2_SLUG,
      revision: REQUIRED_REVISION,
      generatedAt,
      workspaceSha256,
      counts: { learnerRoutes: render.learnerRoutes.length, lessons: PILOT_2_LESSONS.length, reviewRoutes: PILOT_2_REVIEW_ROUTES.length, lessonPractice: render.guidedItems.length, chapterPractice: render.chapterItems.length, finalCorePractice: render.finalCoreItems.length, optionalChallengePractice: render.challengeItems.length, requiredPracticeTotal: render.guidedItems.length + render.chapterItems.length + render.finalCoreItems.length, investigations: 3, vocabularyFamilies: vocabulary.entries.length, operableLockedVocabularyPreviews: vocabulary.entries.length, modelLabModels: 13, modelLabScenarios: MODEL_LAB_RECORDS.reduce((total, model) => total + model.choices.length, 0), collectableModelResults: 13, requiredMediaCheckpoints: videos.length, textbookReviewSections: textbookReviewIntegration.counts.reviewSections, textbookReviewNativeAnswers: textbookReviewIntegration.counts.nativeAnswers, textbookReviewAttemptIds: textbookReviewIntegration.counts.attemptIds, advancedLearningManifestBlocks: 40, advancedLearningAcceptedGateABlocks: 8, advancedLearningRenderedGateBBlocks: 32, advancedLearningRenderedTotalBlocks: 40, advancedLearningPlannedBlocks: 0, advancedLearningLessonMinutes: 245, pilot1SectionDispositions: 470, renderedFigures: figureMediaPlan.renderedFigureInventory.count, atomicComponents: atomicContract.components.length },
      modelLabInteractionMap: "meta/model-lab-interaction-map.json",
      figureInventory: "meta/figure-media-plan.json#renderedFigureInventory",
      reading,
      savedStateEstimate: stateEstimate,
      atomicCurriculumMap: "meta/atomic-curriculum-map.json",
      textbookReviewIntegration: "meta/textbook-review-integration.json",
      advancedLearningBridge: "meta/advanced-learning-bridge.json",
      prohibitedContentScan: "passed",
      requiredRemoteDependencies: 0,
      completionRoutes: 18,
      protectedProjectHashes: protectedBefore,
      scope: "Advanced Bridge Gate B full candidate; all forty optional blocks require exact-build verification and explicit teacher review before any release decision."
    };
    const improvementLedger = JSON.parse(await readFile(path.join(stageMetaDir, "pilot-2-improvement-ledger.json"), "utf8"));
    improvementLedger.workspaceSha256 = workspaceSha256;
    improvementLedger.reviewGate = "advanced-bridge-gate-b";
    const revisionRules = [
      { id: "atomic-curriculum-component-coverage", status: "teacher-accepted", acceptedScope: "revision-gate-a-slice", evidence: "meta/revision-gate-a-review.json" },
      { id: "expanded-readable-core-explanations", status: "teacher-accepted", acceptedScope: "revision-gate-a-slice", evidence: "meta/revision-gate-a-review.json" },
      { id: "four-anchors-plus-complete-term-inventory", status: "teacher-accepted", acceptedScope: "revision-gate-a-slice", evidence: "meta/revision-gate-a-review.json" },
      { id: "required-media-or-local-equivalent", status: "teacher-accepted", acceptedScope: "revision-gate-a-slice", evidence: "meta/revision-gate-a-review.json" },
      { id: "media-aware-nondestructive-state-migration", status: "teacher-accepted", acceptedScope: "revision-gate-a-slice", evidence: "meta/revision-gate-a-review.json" },
      { id: "complete-thirteen-lesson-depth-propagation", status: "awaiting-explicit-user-review", evidence: "meta/reading-level-report.json" },
      { id: "all-lesson-purposeful-visual-density", status: "awaiting-explicit-user-review", evidence: "meta/revision-gate-b-content-audit.json" },
      { id: "curricular-prerequisite-practice-readiness", status: "awaiting-explicit-user-review", evidence: "meta/practice-readiness-audit.json" },
      { id: "full-course-required-media-equivalent-parity", status: "awaiting-explicit-user-review", evidence: "meta/figure-media-plan.json" },
      { id: "restored-collapsible-course-navigation", status: "awaiting-explicit-user-review", evidence: "meta/revision-gate-b-review.json" },
      { id: "process-collection-resource-grouping", status: "awaiting-explicit-user-review", evidence: "meta/revision-gate-b-content-audit.json" },
      { id: "lesson-model-lab-and-collected-evidence", status: "awaiting-explicit-user-review", evidence: "meta/revision-gate-b-content-audit.json" },
      { id: "responsive-model-mechanism-layout", status: "awaiting-explicit-user-review", evidence: "meta/revision-gate-b-review.json" },
      { id: "pilot-1-interaction-depth-adapted-to-pilot-2", status: "awaiting-explicit-user-review", evidence: "meta/model-lab-interaction-map.json" },
      { id: "guided-model-investigation-cycle", status: "awaiting-explicit-user-review", evidence: "meta/model-lab-interaction-map.json" },
      { id: "compact-backward-compatible-learner-state", status: "awaiting-explicit-user-review", evidence: "meta/state-budget.json" },
      { id: "responsive-illustrated-walkthrough-steps", status: "awaiting-explicit-user-review", evidence: "meta/revision-gate-b-review.json" },
      { id: "operable-locked-core-vocabulary-preview", status: "awaiting-explicit-user-review", evidence: "meta/revision-gate-b-review.json" },
      { id: "optional-attempt-gated-textbook-review-guides", status: "awaiting-explicit-user-review", evidence: "meta/textbook-review-integration.json" },
      { id: "pilot-1-to-pilot-2-advanced-learning-bridge", status: "awaiting-explicit-user-review", acceptedScope: null, evidence: "meta/advanced-learning-bridge.json" }
    ];
    improvementLedger.rules = [...improvementLedger.rules.filter((rule: { id: string }) => !revisionRules.some((entry) => entry.id === rule.id)), ...revisionRules];
    const existingJournal = await readFile(path.join(stageMetaDir, "pilot-2-improvement-journal.md"), "utf8");
    const gateAHeading = "## 2026-09-03 — Gate 2 changes requested and Revision Gate A";
    const journalBase = existingJournal.split(gateAHeading)[0].trim();
    const gateAEntry = `${gateAHeading}\n\nTeacher feedback changed Gate 2 SHA-256 \`${REQUIRED_GATE_2_BASELINE_SHA}\` to \`changes-requested\`. That exact workspace and its content contracts are preserved under \`raw/gate-2-review-baselines/\`. Gate 1 remains accepted.\n\nRevision Gate A expanded Lessons 2, 5, 11, and 13 while keeping the accepted visual direction and topic order. The exact build \`${REQUIRED_REVISION_GATE_A_SHA}\` passed the Codex visual, browser, state, and public-file checks. The user explicitly approved moving to Revision Gate B, so that build and its review evidence are now preserved under \`raw/revision-gate-a-accepted/\`.\n\nFourteen media checkpoints require the learner to select either the curated video or a complete local illustrated walkthrough and answer the same sense-making question. Completion records the checkpoint, never claimed watch time. Version-1 state migrates without deleting learner writing.\n\nThe atomic curriculum map binds all 25 outcomes and 53 acceptable-standard behaviours to exact teaching selectors, visuals or data, worked examples, practice items, evidence records, and source locators.`;
    const gateBEntry = `## 2026-09-03 — Revision Gate B full-course propagation\n\nThe accepted Revision Gate A pattern was applied to Lessons 1, 3, 4, 6, 7, 8, 9, 10, and 12. All thirteen lessons now contain 700–1,050 core instructional words, except Lesson 13 which retains its approved allowance up to 1,200 words. Each lesson keeps four visible anchors, the complete term disclosure, three or more Learn blocks, at least four purposeful visual or data objects, a worked example, post-instruction retrieval, two guided questions, one Evidence Slip, and required media sense-making.\n\nThe added teaching follows the daily plans and PowerPoint order. It completes neuron and glial structure, synaptic release and termination, CNS/PNS and white/grey matter relationships, receptor evidence, optical and neural vision pathways, hearing and equilibrium evidence, dynamic feedback and target-cell signalling, pituitary source-target-effect reasoning, and thyroid/calcium data interpretation.\n\nAll learner-state identifiers, required times, 18-route completion rules, Process Collection records, and non-gating Advanced Learning remain unchanged. The full candidate is bound to \`revision-gate-b-review.json\` and remains blocked pending exact-build Codex verification and explicit teacher acceptance. No rule or asset transfers to Units B-D automatically.`;
    const navigationIterationEntry = `## 2026-09-03 — Navigation and Model Lab restoration\n\nTeacher review identified two capability regressions in the Revision Gate B candidate: the desktop course-navigation collapse control had been removed, and Model Lab had been reduced to three shallow examples. The prior exact candidate \`${NAVIGATION_ITERATION_BASELINE_SHA}\` is retained as a changes-requested baseline.\n\nThis iteration restores a persistent desktop collapse control while preserving the mobile drawer. It groups Core Vocabulary and Model Lab under Process Collection because both create learner-owned process evidence. Model Lab now contains one lesson-linked mechanism for each of the thirteen lessons. Each model presents four causal steps, two conditions to compare, explanatory feedback, an exact lesson return, and a scoped add/remove action for Process Collection. Model results remain non-gating and do not affect the eighteen-route progress contract.\n\nLearner state advances to version 3. Existing version-1 and version-2 work migrates without loss; model selections and collection flags are added only when the learner uses the restored lab.`;
    const modelLayoutEntry = `## 2026-09-03 — Model Lab responsive step layout\n\nThe four mechanism steps were being forced into four narrow columns. At the teacher's annotated 1117 by 902 viewport, this produced excessive wrapping and made labels and explanations look as though they did not fit. The exact pre-fix candidate \`${MODEL_LAYOUT_BASELINE_SHA}\` is retained as a changes-requested baseline.\n\nThe shared Model Lab pattern now uses two readable columns when the model reader has enough room and one column when the course sidebar, model index, tablet layout, mobile layout, or zoom leaves less space. Step copy has an explicit minimum-width boundary and cards grow with their content instead of clipping it. The same rule applies to all thirteen models without changing their science, choices, saved evidence, or completion behaviour.`;
    const interactionDepthEntry = `## 2026-09-03 — Pilot 1 interaction depth adapted to Pilot 2\n\nThe user confirmed that Pilot 2 should keep its clearer teaching sequence while regaining the substantive graph explorers, pathway builders, data labs, and evidence cases that made Pilot 1's Model Lab useful. The exact pre-change candidate is preserved as a changes-requested Revision Gate B baseline before this iteration replaces it.\n\nAll thirteen stable lesson-model IDs remain in place. Their two-choice text reveals are expanded into three or more scientific cases. Lesson 2 now has a seven-phase membrane-voltage graph explorer. Lessons 6, 8, 11, and 13 include supplied-data graphs and complete tables. The remaining models use causal pathways or synthetic evidence cases. Every selection highlights the affected mechanism step, reveals evidence and reasoning, offers a complete static equivalent, and can be added to Process Collection.\n\nThe implementation preserves compact state by storing only one selected scenario ID per model. Graph values, pathway text, explanations, and collected summaries are derived from authored content. A scoped reset clears only that model's selection and collection flag. Model work remains optional and does not change the eighteen required routes, required time, practice totals, or learner completion.`;
    const guidedInvestigationEntry = `## 2026-09-03 — Models and Data Lab guided-investigation cycle\n\nThe user found that Model Lab did not explain what learners were doing, what they were supposed to learn, or why the activity mattered. The exact pre-change candidate \`${MODEL_GUIDANCE_BASELINE_SHA}\` is preserved as a changes-requested Revision Gate B baseline.\n\nThe learner-facing name is now Models and Data Lab. Every one of the thirteen lesson-linked models states an investigation question, learning purpose, changed variable, controlled comparison, and evidence focus. Learners choose a case, write a prediction before a result can be revealed, test the prediction, examine the graph, pathway, or evidence, write an explanation, and save the complete record to Process Collection. The result and explanation remain optional course evidence and do not affect required-route completion.\n\nState advances to version 4. Version-1 through version-3 records migrate without deleting learner work. Response and practice records use deterministic hashed storage keys while retaining their public stable IDs, creating enough state headroom for thirteen predictions and thirteen explanations. Reset remains scoped to one investigation.`;
    const mediaWalkthroughLayoutEntry = `## 2026-09-04 — Responsive illustrated walkthrough steps\n\nThe four-step local illustrated equivalents were still using four narrow columns inside the side-by-side media section. At the teacher's annotated 1265 by 902 viewport, headings and explanations wrapped into thin vertical strips even though the page itself did not technically overflow. The exact pre-change candidate \`${MEDIA_WALKTHROUGH_LAYOUT_BASELINE_SHA}\` is preserved as a changes-requested Revision Gate B baseline.\n\nThe shared illustrated-walkthrough pattern now responds to the width of its own media stage. It uses two readable columns when space permits and one vertical sequence when the lesson sidebar, expanded navigation, mobile layout, or text zoom leaves less room. Each step's number, heading, and explanation have explicit minimum-width and wrapping boundaries. The same correction applies to all fourteen required media checkpoints without changing their content, completion, persistence, or local-fallback behaviour.`;
    const vocabularyPreviewEntry = `## 2026-09-04 — Operable future-vocabulary previews\n\nThe Learned so far filter visually leaked future-term buttons because the shared button display rule overrode the hidden attribute. Those future buttons were also disabled, so selecting a visible term such as Regulated variable and set point produced a focus outline but left the reader on the previous concept. The exact pre-fix candidate \`${VOCABULARY_LOCKED_PREVIEW_BASELINE_SHA}\` is preserved as a changes-requested Revision Gate B baseline.\n\nLearned so far now hides future terms correctly. All term names keeps future concepts available for orientation: selecting one opens a concise locked preview that names the teaching lesson and links directly to it. Full meaning, morphology, mechanism, retrieval, and Frayer controls remain hidden until the learner begins that lesson. The selected future term and all existing learner work persist without changing completion.`;
    const textbookReviewEntry = `## 2026-09-04 — Optional textbook review inside practice routes\n\nThe user requested Pilot 1's textbook-review pattern inside Pilot 2's three Chapter Practice routes and Final Practice. The exact pre-change candidate \`${TEXTBOOK_REVIEW_BASELINE_SHA}\` is preserved as a changes-requested Revision Gate B baseline.\n\nEach chapter route now places its printed-page assignment, exact local PDF links, and attempt-gated native answer guide immediately before the twelve course questions. Final Practice places Unit A — Textbook Unit 5 Review after the synthesis figure and before the eighteen core questions, explains the textbook numbering difference, and uses the corrected printed pp. 468–471 locator. The four guides contain 20, 30, 19, and 51 reviewed answers.\n\nLearner state advances to version 5. Only four allowlisted attempt flags are added. A saved attempt survives reload, but the long guide reopens collapsed. Textbook work remains extra review and cannot change required practice, score, route completion, progress, or the 1,505 required and 295 optional minute contracts.`;
    const advancedBridgeGateAEntry = `## 2026-09-04 — Pilot 1 to Pilot 2 Advanced Learning Bridge, Gate A\n\nPilot 2 successfully lowered the reading barrier, but its thirteen short lesson-end Advanced Learning disclosures did not provide a traceable bridge to Pilot 1's deeper curricular reasoning. The user approved a forty-block architecture with one optional block directly after every Learn section. The exact pre-bridge candidate \`${ADVANCED_BRIDGE_BASELINE_SHA256}\` is preserved as a changes-requested baseline.\n\nGate A rendered eight representative blocks: myelin damage, action-potential graph analysis, synaptic summation, brain evidence localization, visual-processing limits, feedback troubleshooting, ADH source-versus-target failure, and integrated water/salt stress. Each block used accessible prose, semantic evidence, an exact Models and Data Lab link, and a synchronized self-completion checkbox. Learner state advanced to version 6 with a compact forty-flag bitset while required progress remained unchanged.\n\nAfter exact-build static, browser, state, accessibility, and visual verification, the project owner explicitly accepted Gate A at learner SHA-256 \`${REQUIRED_ADVANCED_GATE_A_SHA}\` and authorized the remaining thirty-two blocks. That exact candidate and its review records are preserved under \`raw/advanced-bridge-gate-a-accepted/\`.`;
    const advancedBridgeGateBEntry = `## 2026-09-04 — Pilot 1 to Pilot 2 Advanced Learning Bridge, Gate B\n\nThe remaining thirty-two authored blocks now complete the forty-block bridge. Every core Learn section has one adjacent optional extension of approximately 180 to 300 words, a semantic graph, table, pathway, or worked case, and an exact Models and Data Lab link. Advanced means deeper curricular reasoning in accessible language, not harder writing.\n\nAll forty items are available from the synchronized Process Collection checklist. Deep links open the exact lesson and block; checkboxes share one compact, allowlisted state. The lesson blocks still total 245 optional minutes. Together with the 20-minute Review Seminar extension and 30-minute Diploma Challenge, Pilot 2 remains exactly 295 optional minutes and 1,505 required minutes.\n\nThe 470-record Pilot 1 difference audit remains complete, and no source section is silently dropped. Gate B is a blocked review candidate until exact-build verification and explicit teacher acceptance. Nothing transfers automatically to Units B-D.`;
    const journal = `${journalBase}\n\n${gateAEntry}\n\n${gateBEntry}\n\n${navigationIterationEntry}\n\n${modelLayoutEntry}\n\n${interactionDepthEntry}\n\n${guidedInvestigationEntry}\n\n${mediaWalkthroughLayoutEntry}\n\n${vocabularyPreviewEntry}\n\n${textbookReviewEntry}\n\n${advancedBridgeGateAEntry}\n\n${advancedBridgeGateBEntry}\n`;
    const stateBudget = {
      schemaVersion: 6,
      project: PILOT_2_SLUG,
      targetMaximumCharacters: 44_000,
      runtimeHardGuardCharacters: 48_000,
      platformLimitCharacters: 60_000,
      estimatedWorstCaseCharacters: stateEstimate.characters,
      headroomBelowRuntimeGuard: 48_000 - stateEstimate.characters,
      headroomBelowPlatformLimit: 60_000 - stateEstimate.characters,
      responseCountAtWorstCase: stateEstimate.responseCount,
      practiceCountAtWorstCase: stateEstimate.practiceCount,
      mediaCheckpointCountAtWorstCase: stateEstimate.mediaCheckpointCount,
      modelCountAtWorstCase: stateEstimate.modelCount,
      textbookReviewAttemptCountAtWorstCase: stateEstimate.textbookReviewAttemptCount,
      advancedCompletionCountAtWorstCase: stateEstimate.advancedCompletionCount,
      encoding: "hashed-v1-plus-advanced-bitset",
      migrationPolicy: "Version-1 through version-5 responses, practice, completion, Process Collection, vocabulary, notes, media, models, and textbook-review attempts are preserved. Version 6 adds forty allowlisted Advanced Learning flags as a ten-character hexadecimal bitset; all flags begin unchecked during version-5 migration. Public response and practice IDs remain unchanged while their stored keys stay compacted deterministically.",
      overflowPolicy: "Reject an oversized write and preserve the last valid saved state. Never silently truncate learner work."
    };
    const readingReport = {
      schemaVersion: 1,
      project: PILOT_2_SLUG,
      generatedAt,
      method: "Flesch-Kincaid estimate plus sentence and paragraph limits; scientific terms are also reviewed in context",
      targetRange: [9.5, 11.5],
      hardMaximum: 12,
      averageSentenceMaximumWords: 20,
      paragraphMaximumWords: 100,
      revisionGateBCoreLessons: reading,
      depthRequirement: { routes: PILOT_2_LESSONS.map((lesson) => lesson.id), minimumCoreWords: 700, maximumCoreWords: { default: 1050, "lesson-13": 1200 } }
    };

    await Promise.all([
      writeJson(path.join(stageMetaDir, "project.json"), manifest),
      writeJson(path.join(stageMetaDir, "pilot-2-contract.json"), contract),
      writeJson(path.join(stageMetaDir, "practice-blueprint.json"), practiceBlueprint),
      writeJson(path.join(stageMetaDir, "practice-readiness-audit.json"), practiceReadinessAudit),
      writeJson(path.join(stageMetaDir, "core-vocabulary.json"), vocabulary),
      writeJson(path.join(stageMetaDir, "figure-media-plan.json"), figureMediaPlan),
      writeJson(path.join(stageMetaDir, "model-lab-interaction-map.json"), modelLabInteractionMap),
      writeJson(path.join(stageMetaDir, "textbook-review-integration.json"), textbookReviewIntegration),
      writeJson(path.join(stageMetaDir, "advanced-learning-bridge.json"), advancedLearningBridge),
      writeFile(path.join(stageMetaDir, "advanced-learning-bridge.md"), advancedLearningReport, "utf8"),
      writeJson(path.join(stageMetaDir, "advanced-bridge-gate-a-review.json"), acceptedAdvancedBridgeGateAReview),
      writeJson(path.join(stageMetaDir, "advanced-bridge-gate-b-review.json"), advancedBridgeGateBReview),
      writeJson(path.join(stageMetaDir, "route-response-map.json"), routeStateMap),
      writeJson(path.join(stageMetaDir, "reading-level-report.json"), readingReport),
      writeJson(path.join(stageMetaDir, "state-budget.json"), stateBudget),
      writeJson(path.join(stageMetaDir, "gate-2-review.json"), gate2Review),
      writeJson(path.join(stageMetaDir, "teacher-feedback-revision-1.json"), teacherFeedbackRecord),
      writeJson(path.join(stageMetaDir, "revision-gate-a-review.json"), acceptedRevisionGateAReview),
      writeJson(path.join(stageMetaDir, "revision-gate-b-review.json"), revisionGateBReview),
      writeJson(path.join(stageMetaDir, "revision-gate-b-content-audit.json"), contentAudit),
      writeJson(path.join(stageMetaDir, "pilot-2-improvement-ledger.json"), improvementLedger),
      writeFile(path.join(stageMetaDir, "pilot-2-improvement-journal.md"), journal, "utf8"),
      writeFile(path.join(stageMetaDir, "prompt-pack.md"), fullPromptPack(workspaceSha256, workspaceTree.sha256), "utf8"),
      writeJson(path.join(stageMetaDir, "e2e-contract.json"), e2eContract)
    ]);

    await request.testHooks?.afterStageWrite?.(stageProjectDir);
    await validateFullCandidate(stageProjectDir, workspaceSha256);
    assertProtected(protectedBefore, await protectedHashes(repoRoot));
    await request.testHooks?.beforePromote?.(stageProjectDir, projectDir);

    backupDir = path.join(projectsDir, `.biology30-unit-a-pilot-2-revision-b-backup-${randomUUID()}`);
    await rename(projectDir, backupDir);
    try {
      await rename(stageProjectDir, projectDir);
    } catch (error) {
      await rename(backupDir, projectDir);
      backupDir = "";
      throw error;
    }
    await rm(backupDir, { recursive: true, force: true });
    backupDir = "";
    await rm(stageContainer, { recursive: true, force: true });
    return { projectDir, workspaceSha256, workspaceTreeSha256: workspaceTree.sha256, learnerRouteCount: render.learnerRoutes.length, practiceItemCount: 86, estimatedWorstCaseStateCharacters: stateEstimate.characters, protectedProjectHashes: protectedBefore };
  } catch (error) {
    if (backupDir && await pathExists(backupDir) && !(await pathExists(projectDir))) await rename(backupDir, projectDir);
    await rm(stageContainer, { recursive: true, force: true });
    throw error;
  }
}
