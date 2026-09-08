export const BIOLOGY30_CONCEPT_FIGURE_KINDS = [
  "pathway",
  "feedback",
  "timeline",
  "cycle",
  "layers",
  "comparison",
  "calculation",
  "evidence",
  "network"
] as const;

export type Biology30ConceptFigureKind = (typeof BIOLOGY30_CONCEPT_FIGURE_KINDS)[number];

export const BIOLOGY30_CONCEPT_FIGURE_KIND_BY_LESSON: Readonly<Record<string, Biology30ConceptFigureKind>> = Object.freeze({
  "b-lesson-01": "network",
  "b-lesson-02": "pathway",
  "b-lesson-03": "pathway",
  "b-lesson-04": "pathway",
  "b-lesson-05": "feedback",
  "b-lesson-06": "cycle",
  "b-lesson-07": "layers",
  "b-lesson-08": "timeline",
  "b-lesson-09": "comparison",
  "b-lesson-10": "layers",
  "b-lesson-11": "evidence",
  "b-lesson-12": "feedback",
  "b-lesson-13": "evidence",
  "b-lesson-14": "network",

  "c-lesson-01": "timeline",
  "c-lesson-02": "pathway",
  "c-lesson-03": "evidence",
  "c-lesson-04": "cycle",
  "c-lesson-05": "comparison",
  "c-lesson-06": "evidence",
  "c-lesson-07": "comparison",
  "c-lesson-08": "pathway",
  "c-lesson-09": "calculation",
  "c-lesson-10": "evidence",
  "c-lesson-11": "comparison",
  "c-lesson-12": "calculation",
  "c-lesson-13": "evidence",
  "c-lesson-14": "calculation",
  "c-lesson-15": "network",
  "c-lesson-16": "evidence",
  "c-lesson-17": "cycle",
  "c-lesson-18": "pathway",
  "c-lesson-19": "pathway",
  "c-lesson-20": "evidence",
  "c-lesson-21": "pathway",
  "c-lesson-22": "evidence",
  "c-lesson-23": "cycle",
  "c-lesson-24": "network",

  "d-lesson-01": "evidence",
  "d-lesson-02": "feedback",
  "d-lesson-03": "calculation",
  "d-lesson-04": "evidence",
  "d-lesson-05": "comparison",
  "d-lesson-06": "pathway",
  "d-lesson-07": "timeline",
  "d-lesson-08": "evidence",
  "d-lesson-09": "feedback",
  "d-lesson-10": "evidence",
  "d-lesson-11": "network"
});

export const BIOLOGY30_CONCEPT_FIGURE_KIND_LABELS: Readonly<Record<Biology30ConceptFigureKind, string>> = Object.freeze({
  pathway: "pathway",
  feedback: "feedback model",
  timeline: "timeline",
  cycle: "cycle model",
  layers: "layered model",
  comparison: "comparison",
  calculation: "calculation model",
  evidence: "evidence model",
  network: "systems model"
});

export function biology30ConceptFigureKind(lessonId: string): Biology30ConceptFigureKind {
  const kind = BIOLOGY30_CONCEPT_FIGURE_KIND_BY_LESSON[lessonId];
  if (!kind) throw new Error(`Biology 30 lesson ${lessonId} has no explicit scientific figure grammar.`);
  return kind;
}

export function validateBiology30ConceptFigureGrammar(lessonIds: string[]) {
  const uniqueLessonIds = new Set(lessonIds);
  if (uniqueLessonIds.size !== lessonIds.length) throw new Error("Biology 30 scientific figure grammar received duplicate lesson IDs.");
  const missing = lessonIds.filter((lessonId) => !BIOLOGY30_CONCEPT_FIGURE_KIND_BY_LESSON[lessonId]);
  if (missing.length) throw new Error(`Biology 30 scientific figure grammar is incomplete: ${missing.join(", ")}.`);
  const kinds = new Set(lessonIds.map((lessonId) => BIOLOGY30_CONCEPT_FIGURE_KIND_BY_LESSON[lessonId]));
  if (lessonIds.length >= 10 && kinds.size < 7) {
    throw new Error(`Biology 30 scientific figure grammar needs at least seven visual forms for a production unit; found ${kinds.size}.`);
  }
}
