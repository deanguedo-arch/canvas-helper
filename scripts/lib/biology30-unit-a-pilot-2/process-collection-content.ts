import type { Pilot2Lesson } from "./contracts.js";
import type { PracticeItem } from "./full-content.js";
import type { ModelLabRecord } from "./model-lab-content.js";
import type { TextbookReviewSupportV1 } from "./textbook-review-content.js";

export const PROCESS_COLLECTION_BASELINE_SHA256 = "11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c" as const;

export const PROCESS_ACTIVITY_KINDS = [
  "retrieval",
  "evidence-slip",
  "practice",
  "media-checkpoint",
  "frayer",
  "model",
  "investigation",
  "review-seminar",
  "textbook-review",
  "process-note"
] as const;

export type ProcessActivityKind = (typeof PROCESS_ACTIVITY_KINDS)[number];
export type ProcessChapter = "chapter-11" | "chapter-12" | "chapter-13" | "unit-review" | "personal";

export type SaveResultV1 = {
  local: "saved" | "failed";
  lms: "saved" | "unavailable" | "failed";
};

export type ProcessCollectionRecordV1 = {
  id: string;
  sequence: number;
  kind: ProcessActivityKind;
  activityType: string;
  chapter: ProcessChapter;
  chapterLabel: string;
  lessonLabel: string;
  routeId: string;
  focusTargetId: string;
  selectKey?: string;
  prompt: string;
  returnLabel: string;
  stateRef:
    | { kind: "response"; responseId: string; collectedBy?: "evidenceIds" }
    | { kind: "practice"; practiceId: string }
    | { kind: "media"; checkpointId: string }
    | { kind: "frayer"; entryId: string; responseIds: string[] }
    | { kind: "model"; modelId: string }
    | { kind: "investigation"; checkpointId: string; responseIds: string[] }
    | { kind: "textbook"; attemptId: string };
  courseEvidence?: Record<string, unknown>;
};

type VocabularyForCollection = {
  id: string;
  label: string;
  primaryLessonIds: string[];
  modelFrayer: { definition: string; characteristics: string; example: string; nonExample: string };
};

type VideoForCollection = {
  youtubeId: string;
  title: string;
  routeId: string;
  checkpoint: { prompt: string; choices: readonly string[]; answer: string; rationale: string };
};

type SeminarForCollection = {
  id: string;
  title: string;
  prompt: string;
  model: string;
};

type PracticeForCollection = { routeId: string; item: PracticeItem };

export type ProcessCollectionRegistryInput = {
  lessons: Pilot2Lesson[];
  lessonWorkPrompts: Record<string, { retrieval: string; evidence: string }>;
  practice: PracticeForCollection[];
  videos: VideoForCollection[];
  vocabularyEntries: VocabularyForCollection[];
  models: ModelLabRecord[];
  seminarSessions: readonly SeminarForCollection[];
  textbookReviews: TextbookReviewSupportV1[];
  allowedRoutes: readonly string[];
};

export type ProcessCollectionRegistryV1 = {
  schemaVersion: 1;
  project: "biology30-unit-a-pilot-2";
  authoredSource: "scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts";
  stateSchemaVersion: 6;
  createsDuplicateEvidenceState: false;
  completionImpact: false;
  scoringImpact: false;
  expectedCounts: Record<ProcessActivityKind | "total", number>;
  records: ProcessCollectionRecordV1[];
};

const COURSE = "biology30-unit-a-pilot-2";

const routeRanks: Record<string, number> = {
  "lesson-01": 1,
  "lesson-02": 2,
  "lesson-03": 3,
  "lesson-04": 4,
  "lesson-05": 5,
  "chapter-11-practice": 5.5,
  "lesson-06": 6,
  "lesson-07": 7,
  "lesson-08": 8,
  "chapter-12-practice": 8.5,
  "lesson-09": 9,
  "lesson-10": 10,
  "lesson-11": 11,
  "lesson-12": 12,
  "lesson-13": 13,
  "chapter-13-practice": 13.5,
  "review-seminar": 14,
  "final-practice": 15,
  "core-vocabulary": 16,
  "model-lab": 17,
  "process-collection": 18
};

const kindRanks: Record<ProcessActivityKind, number> = {
  "retrieval": 10,
  "evidence-slip": 20,
  "practice": 30,
  "media-checkpoint": 40,
  "frayer": 50,
  "model": 60,
  "investigation": 70,
  "review-seminar": 80,
  "textbook-review": 90,
  "process-note": 100
};

function chapterForRoute(routeId: string, lessons: Pilot2Lesson[]): ProcessChapter {
  const lesson = lessons.find((entry) => entry.id === routeId);
  if (lesson) return `chapter-${lesson.chapter}` as ProcessChapter;
  if (/chapter-11/.test(routeId)) return "chapter-11";
  if (/chapter-12/.test(routeId)) return "chapter-12";
  if (/chapter-13/.test(routeId)) return "chapter-13";
  return routeId === "process-collection" ? "personal" : "unit-review";
}

function chapterLabel(chapter: ProcessChapter) {
  if (chapter === "personal") return "Personal work";
  if (chapter === "unit-review") return "Unit review";
  return `Chapter ${chapter.slice(-2)}`;
}

function routeLabel(routeId: string, lessons: Pilot2Lesson[]) {
  const lesson = lessons.find((entry) => entry.id === routeId);
  if (lesson) return `Lesson ${lesson.order} · ${lesson.title}`;
  const labels: Record<string, string> = {
    "chapter-11-practice": "Chapter 11 Practice",
    "chapter-12-practice": "Chapter 12 Practice",
    "chapter-13-practice": "Chapter 13 Practice",
    "review-seminar": "Review Seminar",
    "final-practice": "Final Practice",
    "core-vocabulary": "Core Vocabulary",
    "model-lab": "Models and Data Lab",
    "process-collection": "Process Collection"
  };
  return labels[routeId] ?? routeId;
}

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function processPracticeWorkId(practiceId: string) {
  return `practice-${safeId(practiceId.replace(`${COURSE}:practice:`, ""))}`;
}

export function processMediaWorkId(youtubeId: string) {
  return `media-${safeId(youtubeId)}`;
}

function sequence(routeId: string, kind: ProcessActivityKind, offset = 0) {
  return Math.round((routeRanks[routeId] ?? 99) * 1_000) + kindRanks[kind] + offset;
}

function recordBase(input: {
  id: string;
  kind: ProcessActivityKind;
  routeId: string;
  lessons: Pilot2Lesson[];
  prompt: string;
  focusTargetId: string;
  offset?: number;
  chapter?: ProcessChapter;
  lessonLabel?: string;
}) {
  const chapter = input.chapter ?? chapterForRoute(input.routeId, input.lessons);
  return {
    id: input.id,
    sequence: sequence(input.routeId, input.kind, input.offset),
    kind: input.kind,
    activityType: {
      "retrieval": "Retrieve It",
      "evidence-slip": "Evidence Slip",
      "practice": "Practice response",
      "media-checkpoint": "Media checkpoint",
      "frayer": "Frayer model",
      "model": "Model investigation",
      "investigation": "Investigation",
      "review-seminar": "Review Seminar response",
      "textbook-review": "Textbook-review confirmation",
      "process-note": "Process note"
    }[input.kind],
    chapter,
    chapterLabel: chapterLabel(chapter),
    lessonLabel: input.lessonLabel ?? routeLabel(input.routeId, input.lessons),
    routeId: input.routeId,
    focusTargetId: input.focusTargetId,
    prompt: input.prompt,
    returnLabel: `Return to ${input.lessonLabel ?? routeLabel(input.routeId, input.lessons)}`
  };
}

export function buildProcessCollectionRegistry(input: ProcessCollectionRegistryInput): ProcessCollectionRegistryV1 {
  const lessonById = new Map(input.lessons.map((lesson) => [lesson.id, lesson]));
  const records: ProcessCollectionRecordV1[] = [];

  input.lessons.forEach((lesson) => {
    const prompts = input.lessonWorkPrompts[lesson.id];
    if (!prompts?.retrieval.trim() || !prompts.evidence.trim()) throw new Error(`Process Collection is missing exact lesson prompts for ${lesson.id}.`);
    records.push({
      ...recordBase({ id: `retrieval-${lesson.id}`, kind: "retrieval", routeId: lesson.id, lessons: input.lessons, focusTargetId: `${lesson.id}-retrieve`, prompt: prompts.retrieval }),
      stateRef: { kind: "response", responseId: `${COURSE}:${lesson.id}:retrieval` }
    });
    records.push({
      ...recordBase({ id: `evidence-${lesson.id}`, kind: "evidence-slip", routeId: lesson.id, lessons: input.lessons, focusTargetId: `${lesson.id}-evidence-title`, prompt: prompts.evidence }),
      stateRef: { kind: "response", responseId: `${COURSE}:${lesson.id}:evidence-slip`, collectedBy: "evidenceIds" }
    });
  });

  input.practice.forEach(({ routeId, item }, index) => {
    const key = item.id.replace(`${COURSE}:practice:`, "");
    records.push({
      ...recordBase({ id: processPracticeWorkId(item.id), kind: "practice", routeId, lessons: input.lessons, focusTargetId: `work-focus-practice-${safeId(key)}`, prompt: item.prompt, offset: index }),
      stateRef: { kind: "practice", practiceId: item.id },
      courseEvidence: { choices: item.choices, answer: item.answer, rationale: item.rationale, feedback: item.feedback ?? {}, textbook: item.textbook }
    });
  });

  input.videos.forEach((video, index) => {
    const lesson = lessonById.get(video.routeId);
    records.push({
      ...recordBase({ id: processMediaWorkId(video.youtubeId), kind: "media-checkpoint", routeId: video.routeId, lessons: input.lessons, focusTargetId: `work-focus-media-${safeId(video.youtubeId)}`, prompt: video.checkpoint.prompt, offset: index }),
      stateRef: { kind: "media", checkpointId: `${COURSE}:media:${video.youtubeId}:checkpoint` },
      courseEvidence: { title: video.title, choices: video.checkpoint.choices, answer: video.checkpoint.answer, rationale: video.checkpoint.rationale, lessonOrder: lesson?.order }
    });
  });

  input.vocabularyEntries.forEach((entry, index) => {
    const firstLessonId = entry.primaryLessonIds.find((routeId) => lessonById.has(routeId));
    const lesson = firstLessonId ? lessonById.get(firstLessonId) : undefined;
    const chapter = lesson ? `chapter-${lesson.chapter}` as ProcessChapter : "unit-review";
    const fields = ["definition", "characteristics", "example", "non-example"];
    records.push({
      ...recordBase({ id: `frayer-${safeId(entry.id)}`, kind: "frayer", routeId: "core-vocabulary", lessons: input.lessons, focusTargetId: `work-focus-frayer-${safeId(entry.id)}`, prompt: `Build a four-part Frayer model for ${entry.label}.`, offset: index, chapter, lessonLabel: lesson ? `Lesson ${lesson.order} concept · ${entry.label}` : `Unit concept · ${entry.label}` }),
      selectKey: entry.id,
      stateRef: { kind: "frayer", entryId: entry.id, responseIds: fields.map((field) => `${COURSE}:core-vocabulary:${entry.id}:${field}`) },
      courseEvidence: entry.modelFrayer
    });
  });

  input.models.forEach((model, index) => {
    const chapter = `chapter-${model.chapter}` as ProcessChapter;
    records.push({
      ...recordBase({ id: `model-${safeId(model.id)}`, kind: "model", routeId: "model-lab", lessons: input.lessons, focusTargetId: `work-focus-model-${safeId(model.id)}`, prompt: model.investigationQuestion, offset: index, chapter, lessonLabel: `${model.lessonLabel} model · ${model.title}` }),
      selectKey: model.id,
      stateRef: { kind: "model", modelId: model.id },
      courseEvidence: { choices: model.choices.map((choice) => ({ id: choice.id, label: choice.label, resultTitle: choice.resultTitle, observation: choice.observation, reasoning: choice.reasoning, evidence: choice.evidence })) }
    });
  });

  const investigations = [
    { id: "reflex-response", chapter: "chapter-11" as const, lesson: "Lesson 1 · Neuron Structure", prompt: "How consistent is response distance across five trials?", responses: ["pattern", "claim"] },
    { id: "sensory-receptors", chapter: "chapter-12" as const, lesson: "Lesson 6 · Sensory Reception", prompt: "Does the smallest detected two-point spacing differ between a fingertip and forearm?", responses: ["plan", "analysis"] },
    { id: "endocrine-data", chapter: "chapter-13" as const, lesson: "Lesson 13 · Pancreas and Adrenal Glands", prompt: "What mechanism and limitation are supported by the synthetic hormone, blood, and urine evidence?", responses: ["analysis"] }
  ];
  investigations.forEach((investigation, index) => {
    const checkpointId = `${COURSE}:investigation:${investigation.id}`;
    records.push({
      ...recordBase({ id: `investigation-${investigation.id}`, kind: "investigation", routeId: "process-collection", lessons: input.lessons, focusTargetId: `work-focus-investigation-${investigation.id}`, prompt: investigation.prompt, offset: index, chapter: investigation.chapter, lessonLabel: investigation.lesson }),
      selectKey: investigation.id,
      stateRef: { kind: "investigation", checkpointId, responseIds: investigation.responses.map((field) => `${checkpointId}:${field}`) }
    });
  });

  input.seminarSessions.forEach((session, index) => {
    records.push({
      ...recordBase({ id: `seminar-${session.id}`, kind: "review-seminar", routeId: "review-seminar", lessons: input.lessons, focusTargetId: `work-focus-seminar-${session.id}`, prompt: session.prompt, offset: index }),
      stateRef: { kind: "response", responseId: `${COURSE}:review-seminar:${session.id}` },
      courseEvidence: { model: session.model }
    });
  });

  input.textbookReviews.forEach((review, index) => {
    records.push({
      ...recordBase({ id: `textbook-${safeId(review.routeId)}`, kind: "textbook-review", routeId: review.routeId, lessons: input.lessons, focusTargetId: `${review.routeId}-textbook-review-title`, prompt: review.assignment, offset: index }),
      stateRef: { kind: "textbook", attemptId: review.attemptId },
      courseEvidence: { selfReported: true, printedPages: review.pageLinks.map((link) => link.printedPage) }
    });
  });

  records.push({
    ...recordBase({ id: "process-note", kind: "process-note", routeId: "process-collection", lessons: input.lessons, focusTargetId: "collection-notes", prompt: "Learner-created note, question, or connection.", chapter: "personal" }),
    stateRef: { kind: "response", responseId: `${COURSE}:process-collection:note` }
  });

  records.sort((left, right) => left.sequence - right.sequence || left.id.localeCompare(right.id));
  const expectedCounts: ProcessCollectionRegistryV1["expectedCounts"] = {
    retrieval: 13,
    "evidence-slip": 13,
    practice: 86,
    "media-checkpoint": 14,
    frayer: 28,
    model: 13,
    investigation: 3,
    "review-seminar": 3,
    "textbook-review": 4,
    "process-note": 1,
    total: 178
  };
  validateProcessCollectionRegistry(records, expectedCounts, input.allowedRoutes);
  return {
    schemaVersion: 1,
    project: COURSE,
    authoredSource: "scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts",
    stateSchemaVersion: 6,
    createsDuplicateEvidenceState: false,
    completionImpact: false,
    scoringImpact: false,
    expectedCounts,
    records
  };
}

export function validateProcessCollectionRegistry(records: ProcessCollectionRecordV1[], expectedCounts: ProcessCollectionRegistryV1["expectedCounts"], allowedRoutes: readonly string[]) {
  if (records.length !== expectedCounts.total) throw new Error(`Process Collection requires exactly ${expectedCounts.total} records; found ${records.length}.`);
  for (const kind of PROCESS_ACTIVITY_KINDS) {
    const found = records.filter((record) => record.kind === kind).length;
    if (found !== expectedCounts[kind]) throw new Error(`Process Collection ${kind} count drifted: ${found} versus ${expectedCounts[kind]}.`);
  }
  if (new Set(records.map((record) => record.id)).size !== records.length) throw new Error("Process Collection work IDs must be unique.");
  if (new Set(records.map((record) => record.focusTargetId)).size !== records.length) throw new Error("Process Collection focus targets must be unique.");
  const allowed = new Set(allowedRoutes);
  records.forEach((record) => {
    if (!allowed.has(record.routeId)) throw new Error(`Process Collection record ${record.id} points to unknown route ${record.routeId}.`);
    if (!record.prompt.trim() || !record.lessonLabel.trim() || !record.returnLabel.trim()) throw new Error(`Process Collection record ${record.id} lacks learner-facing context.`);
    if (!record.id.match(/^[a-z0-9][a-z0-9_-]*$/) || !record.focusTargetId.match(/^[a-z0-9][a-z0-9_-]*$/)) throw new Error(`Process Collection record ${record.id} has a non-allowlist-safe ID.`);
  });
}
