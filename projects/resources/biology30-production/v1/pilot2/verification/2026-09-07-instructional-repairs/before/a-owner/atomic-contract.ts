import { load as loadHtml } from "cheerio";
import { BEHAVIOUR_EVIDENCE, SKILL_OUTCOME_EVIDENCE, type AcademicEvidenceBinding } from "./academic-evidence.js";

type CurriculumOutcome = {
  id: string;
  officialText: string;
  authorityUrl: string;
  teachRoutes: string[];
};

type PerformanceBehaviour = {
  id: string;
  outcomeId: string;
  text: string;
  authorityUrl: string;
  authorityPdfPage: number;
  teachRoute: string;
  practiceRoute: string;
  standard: string;
  sourceKind: string;
  authorityColumn: string | null;
};

type CurriculumMap = {
  outcomes: CurriculumOutcome[];
  performanceBehaviours: PerformanceBehaviour[];
};

type TeacherPlanRow = {
  id: string;
  sourceId: string;
  row: number;
  sourceRange: string;
  textbook: string;
  destinationRoutes: string[];
};

type TeacherSourceCrosswalk = { teacherPlanRows: TeacherPlanRow[] };

type PracticeBlueprintItem = {
  id: string;
  routeId: string;
  outcomeIds: string[];
  performanceBehaviourIds: string[];
};

type PracticeBlueprint = {
  lessonItems: PracticeBlueprintItem[];
  chapterItems: PracticeBlueprintItem[];
  finalCoreItems: PracticeBlueprintItem[];
  challengeItems: PracticeBlueprintItem[];
};

export interface Pilot2AtomicComponentV1 {
  id: string;
  outcomeIds: string[];
  performanceBehaviourIds: string[];
  sourceRefs: string[];
  prerequisiteTermIds: string[];
  firstTeachSelector: string;
  requiredExplanationPoints: string[];
  visualOrDataId: string;
  workedExampleId: string;
  practiceItemIds: string[];
  taskSelectors: string[];
  alignmentRationale: string;
  academicStatus: "mapped-awaiting-review" | "gap-recorded";
  remainingGap: string | null;
  evidenceId: string;
  tier: "required-core" | "advanced" | "excluded";
  sourceStandard?: string;
  sourceKind?: string;
  authorityColumn?: string | null;
  renderedTextEvidence: string;
}

export type Pilot2AtomicContractV1 = {
  schemaVersion: 1;
  project: "biology30-unit-a-pilot-2";
  generatedAt: string;
  workspaceSha256: string;
  status: "revision-gate-b-awaiting-teacher-review";
  coveragePolicy: string;
  counts: {
    outcomes: number;
    acceptableStandardBehaviours: number;
    excellenceStandardBehaviours: number;
    localCurriculumCriteria: number;
    atomicComponents: number;
  };
  components: Pilot2AtomicComponentV1[];
};

const ROUTE_ZONE: Record<string, string> = {
  "lesson-01": "#lesson-01 [data-core-zone=\"lesson-01-part-1\"]",
  "lesson-02": "#lesson-02 [data-core-zone=\"lesson-02-part-1\"]",
  "lesson-03": "#lesson-03 [data-core-zone=\"lesson-03-part-1\"]",
  "lesson-04": "#lesson-04 [data-core-zone=\"lesson-04-part-1\"]",
  "lesson-05": "#lesson-05 [data-core-zone=\"lesson-05-part-1\"]",
  "lesson-06": "#lesson-06 [data-core-zone=\"lesson-06-part-1\"]",
  "lesson-07": "#lesson-07 [data-core-zone=\"lesson-07-part-1\"]",
  "lesson-08": "#lesson-08 [data-core-zone=\"lesson-08-part-1\"]",
  "lesson-09": "#lesson-09 [data-core-zone=\"lesson-09-part-1\"]",
  "lesson-10": "#lesson-10 [data-core-zone=\"lesson-10-part-1\"]",
  "lesson-11": "#lesson-11 [data-core-zone=\"lesson-11-part-1\"]",
  "lesson-12": "#lesson-12 [data-core-zone=\"lesson-12-part-1\"]",
  "lesson-13": "#lesson-13 [data-core-zone=\"lesson-13-part-1\"]",
  "process-collection": "#process-collection [data-investigation=\"sensory-receptors\"]",
  "review-seminar": "#review-seminar [data-seminar-session=\"nervous\"]"
};

const BEHAVIOUR_ZONE_OVERRIDES: Record<string, string> = {
  "A1.1k-02": "#lesson-01 [data-core-zone=\"lesson-01-part-2\"]",
  "A1.1k-03": "#lesson-01 [data-core-zone=\"lesson-01-part-3\"]",
  "A1.1k-04": "#lesson-01 [data-core-zone=\"lesson-01-part-3\"]",
  "A1.1k-05": "#lesson-01 [data-core-zone=\"lesson-01-part-1\"]",
  "A1.1k-06": "#lesson-02 [data-core-zone=\"lesson-02-part-2\"]",
  "A1.1k-07": "#lesson-02 [data-core-zone=\"lesson-02-part-2\"]",
  "A1.1k-08": "#lesson-02 [data-core-zone=\"lesson-02-part-1\"]",
  "A1.1k-09": "#lesson-02 [data-core-zone=\"lesson-02-part-2\"]",
  "A1.1k-10": "#lesson-02 [data-core-zone=\"lesson-02-part-3\"]",
  "A1.1k-12": "#lesson-03 [data-core-zone=\"lesson-03-part-2\"]",
  "A1.1k-13": "#lesson-01 [data-core-zone=\"lesson-01-part-2\"]",
  "A1.2k-02": "#lesson-04 [data-core-zone=\"lesson-04-part-1\"]",
  "A1.2k-03": "#lesson-04 [data-core-zone=\"lesson-04-part-2\"]",
  "A1.2k-04": "#lesson-04 [data-core-zone=\"lesson-04-part-1\"]",
  "A1.2k-05": "#process-collection [data-investigation=\"sensory-receptors\"]",
  "A1.2k-06": "#lesson-04 [data-core-zone=\"lesson-04-part-2\"]",
  "A1.2k-07": "#lesson-05 [data-core-zone=\"lesson-05-part-2\"]",
  "A1.2k-08": "#lesson-05 [data-core-zone=\"lesson-05-part-2\"]",
  "A1.2k-09": "#lesson-05 [data-core-zone=\"lesson-05-part-3\"]",
  "A1.3k-01": "#lesson-01 [data-core-zone=\"lesson-01-part-3\"]",
  "A1.3k-02": "#lesson-01 [data-core-zone=\"lesson-01-part-3\"]",
  "A1.3k-03": "#process-collection [data-investigation=\"reflex-response\"]",
  "A1.3k-04": "#process-collection [data-investigation=\"reflex-response\"]",
  "A1.4k-04": "#process-collection [data-investigation=\"sensory-receptors\"]",
  "A1.4k-05": "#lesson-07 [data-core-zone=\"lesson-07-part-2\"]",
  "A1.5k-04": "#lesson-08 [data-core-zone=\"lesson-08-part-2\"]",
  "A1.5k-05": "#lesson-08 [data-core-zone=\"lesson-08-part-2\"]",
  "A1.6k-02": "#process-collection [data-investigation=\"sensory-receptors\"]",
  "A2.1k-02": "#lesson-10 [data-core-zone=\"lesson-10-part-2\"]",
  "A2.2k-01": "#lesson-10 [data-core-zone=\"lesson-10-part-2\"]",
  "A2.2k-02": "#lesson-09 [data-core-zone=\"lesson-09-part-2\"]",
  "A2.3k-01": "#lesson-13 [data-core-zone=\"lesson-13-part-1\"]",
  "A2.3k-02": "#lesson-13 [data-core-zone=\"lesson-13-part-4\"]",
  "A2.3k-03": "#lesson-13 [data-core-zone=\"lesson-13-part-4\"]",
  "A2.5k-01": "#lesson-13 [data-core-zone=\"lesson-13-part-4\"]",
  "A2.5k-02": "#lesson-13 [data-core-zone=\"lesson-13-part-3\"]",
  "A2.6k-01": "#lesson-13 [data-core-zone=\"lesson-13-part-2\"]",
  "A2.6k-02": "#lesson-13 [data-core-zone=\"lesson-13-part-4\"]",
  "A2.6k-03": "#process-collection [data-investigation=\"endocrine-data\"]",
  "A2.6k-04": "#process-collection [data-investigation=\"endocrine-data\"]",
  "A1.4s-01": "#process-collection [data-investigation=\"sensory-receptors\"]"
};

const OUTCOME_ZONE_OVERRIDES: Record<string, string> = {
  "A1.1sts": "#lesson-03 [data-core-zone=\"lesson-03-part-2\"]",
  "A1.2sts": "#lesson-03 [data-core-zone=\"lesson-03-part-3\"]",
  "A1.3sts": "#lesson-07 [data-core-zone=\"lesson-07-part-2\"]",
  "A1.1s": "#process-collection [data-investigation=\"sensory-receptors\"]",
  "A1.2s": "#process-collection [data-investigation=\"reflex-response\"]",
  "A1.3s": "#lesson-02 [data-core-zone=\"lesson-02-part-2\"]",
  "A1.4s": "#process-collection [data-investigation=\"sensory-receptors\"]",
  "A2.1sts": "#lesson-13 [data-core-zone=\"lesson-13-part-2\"]",
  "A2.2sts": "#lesson-13 [data-core-zone=\"lesson-13-part-2\"]",
  "A2.1s": "#process-collection [data-investigation=\"endocrine-data\"]",
  "A2.2s": "#process-collection [data-investigation=\"endocrine-data\"]",
  "A2.3s": "#lesson-11 [data-core-zone=\"lesson-11-part-3\"]",
  "A2.4s": "#process-collection [data-investigation=\"endocrine-data\"]"
};

const OUTCOME_ROUTE_PREFERENCE: Record<string, string> = {
  "A1.1k": "lesson-02", "A1.2k": "lesson-05", "A1.3k": "lesson-01", "A1.4k": "lesson-07", "A1.5k": "lesson-08", "A1.6k": "lesson-06",
  "A2.1k": "lesson-09", "A2.2k": "lesson-09", "A2.3k": "lesson-13", "A2.4k": "lesson-09", "A2.5k": "lesson-13", "A2.6k": "lesson-13"
};

const PROCESS_FIGURES: Record<string, string> = {
  "reflex-response": "reflex-response-data",
  "sensory-receptors": "sensory-receptor-investigation-data",
  "endocrine-data": "endocrine-supplied-data"
};

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function textEvidence(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 700);
}

function routeFromSelector(selector: string) {
  return selector.match(/^#([^\s]+)/)?.[1] ?? "";
}

function sourceRefsFor(routeId: string, outcome: CurriculumOutcome, behaviour: PerformanceBehaviour | undefined, crosswalk: TeacherSourceCrosswalk) {
  const row = crosswalk.teacherPlanRows.find((entry) => entry.destinationRoutes.includes(routeId))
    ?? crosswalk.teacherPlanRows.find((entry) => entry.destinationRoutes.some((route) => outcome.teachRoutes.includes(route)));
  const refs = [`${outcome.authorityUrl}#${outcome.id}`];
  if (behaviour) refs.push(`${behaviour.authorityUrl}#pdf-page=${behaviour.authorityPdfPage}&behaviour=${behaviour.id}`);
  if (row) {
    refs.push(`${row.sourceId}:row-${row.row}:${row.sourceRange || "review-plan"}`);
    refs.push(`textbook:${row.textbook}`);
  }
  return refs;
}

function prerequisiteTerms(routeId: string, vocabularyEntries: Array<{ id: string; primaryLessonIds?: string[] }>) {
  return vocabularyEntries.filter((entry) => entry.primaryLessonIds?.includes(routeId)).map((entry) => entry.id);
}

function visualFor(dom: ReturnType<typeof loadHtml>, selector: string, componentId: string) {
  const zone = dom(selector);
  const direct = zone.find("[data-figure-id]").first().attr("data-figure-id");
  if (direct) return direct;
  const investigation = zone.attr("data-investigation");
  if (investigation) {
    const id = PROCESS_FIGURES[investigation] ?? `atomic-data-${safeId(componentId)}`;
    zone.find(".comparison-table").first().attr("data-figure-id", id);
    return id;
  }
  const table = zone.find(".comparison-table").first();
  if (table.length) {
    const id = `atomic-data-${safeId(componentId)}`;
    table.attr("data-figure-id", id);
    return id;
  }
  const routeId = routeFromSelector(selector);
  const routeFigure = dom(`#${routeId} [data-figure-id]`).first().attr("data-figure-id");
  if (!routeFigure) throw new Error(`Atomic component ${componentId} has no exact visual or data object.`);
  return routeFigure;
}

function workedExampleFor(dom: ReturnType<typeof loadHtml>, selector: string) {
  const routeId = routeFromSelector(selector);
  const lessonWorked = dom(`#${routeId} .worked-example[id]`).first().attr("id");
  if (lessonWorked) return lessonWorked;
  const investigation = dom(selector).attr("data-investigation");
  if (investigation) {
    const id = `${investigation}-worked-example`;
    dom(selector).find(".worked-investigation").first().attr("id", id);
    return id;
  }
  const reviewWorked = dom(`#${routeId} .worked-example[id],#${routeId} [data-seminar-session]`).first();
  if (reviewWorked.length) {
    const id = reviewWorked.attr("id") ?? `${routeId}-worked-example`;
    reviewWorked.attr("id", id);
    return id;
  }
  throw new Error(`Atomic component at ${selector} has no worked example.`);
}

export function resolveAcademicEvidence(dom: ReturnType<typeof loadHtml>, id: string, binding: AcademicEvidenceBinding | undefined) {
  if (!binding) throw new Error(`Missing authored academic evidence binding: ${id}`);
  const practiceItemIds = binding.practiceKeys.map((key) => `biology30-unit-a-pilot-2:practice:${key}`);
  for (const key of practiceItemIds) {
    if (dom(`[data-practice-id="${key}"]`).length !== 1) throw new Error(`Exact academic practice target is missing: ${id} -> ${key}`);
  }
  for (const selector of binding.taskSelectors) {
    if (/^#[\w-]+$/.test(selector) || dom(selector).length !== 1) throw new Error(`Exact academic task target is missing: ${id} -> ${selector}`);
  }
  if (!practiceItemIds.length && !binding.taskSelectors.length) throw new Error(`No practice or observable task is declared for ${id}`);
  return {
    practiceItemIds,
    taskSelectors: binding.taskSelectors,
    alignmentRationale: binding.rationale,
    academicStatus: binding.remainingGap ? "gap-recorded" as const : "mapped-awaiting-review" as const,
    remainingGap: binding.remainingGap ?? null
  };
}

function evidenceFor(dom: ReturnType<typeof loadHtml>, selector: string) {
  const routeId = routeFromSelector(selector);
  const lessonEvidence = dom(`#${routeId} [data-evidence-contribution-id]`).first().attr("data-evidence-contribution-id");
  if (lessonEvidence) return lessonEvidence;
  const investigation = dom(selector).attr("data-investigation");
  const processEvidence = investigation ? dom(selector).find("[data-save-investigation]").attr("data-save-investigation") : undefined;
  if (processEvidence) return processEvidence;
  const reviewEvidence = dom(`#${routeId} [data-response-id]`).first().attr("data-response-id");
  if (reviewEvidence) return reviewEvidence;
  throw new Error(`Atomic component at ${selector} has no observable evidence record.`);
}

function annotate(dom: ReturnType<typeof loadHtml>, selector: string, componentId: string) {
  const node = dom(selector);
  if (node.length !== 1) throw new Error(`Atomic selector must resolve exactly once: ${selector} (${node.length})`);
  const ids = new Set((node.attr("data-atomic-components") ?? "").split(/\s+/).filter(Boolean));
  ids.add(componentId);
  node.attr("data-atomic-components", [...ids].join(" "));
  return textEvidence(node.text());
}

/** Bind links to actual static prose, not to a lesson-wide landing heading. */
export function annotateLessonFirstUses(dom: ReturnType<typeof loadHtml>) {
  const inventory: Array<{ lessonId: string; term: string; targetId: string; kind: "course-use" | "definition-only" }> = [];
  dom(".lesson-page").each((_lessonIndex, lesson) => {
    const route = dom(lesson);
    const lessonId = route.attr("id")!;
    route.find("[data-lesson-term]").each((index, row) => {
      const term = dom(row).attr("data-lesson-term")!;
      const phrase = term.toLowerCase().replace(/\s*\([^)]*\)/g, "");
      const alternatives = [phrase, ...phrase.split(" and ")];
      const target = route.find(".learn-block p,.learn-block li,.learn-block td,.learn-block th,.learn-block figcaption")
        .filter((_i, element) => alternatives.some((word) => dom(element).text().toLowerCase().includes(word))).first();
      const node = target.length ? target : dom(row).find("dt");
      const targetId = node.attr("id") ?? `${lessonId}-term-use-${index + 1}`;
      node.attr("id", targetId).attr("tabindex", "-1");
      dom(row).find("[data-open-first-use]").attr("data-open-first-use", targetId).text(target.length ? "First use" : "Definition");
      inventory.push({ lessonId, term, targetId, kind: target.length ? "course-use" : "definition-only" });
    });
  });
  return inventory;
}

export function buildAtomicCurriculumContract(input: {
  html: string;
  curriculum: CurriculumMap;
  crosswalk: TeacherSourceCrosswalk;
  practice: PracticeBlueprint;
  vocabularyEntries: Array<{ id: string; primaryLessonIds?: string[] }>;
  generatedAt: string;
}) {
  const dom = loadHtml(input.html);
  annotateLessonFirstUses(dom);
  const outcomes = new Map(input.curriculum.outcomes.map((entry) => [entry.id, entry]));
  const components: Pilot2AtomicComponentV1[] = [];

  for (const behaviour of input.curriculum.performanceBehaviours) {
    const outcome = outcomes.get(behaviour.outcomeId);
    if (!outcome) throw new Error(`Unknown outcome for ${behaviour.id}: ${behaviour.outcomeId}`);
    const selector = BEHAVIOUR_ZONE_OVERRIDES[behaviour.id] ?? ROUTE_ZONE[behaviour.teachRoute];
    if (!selector) throw new Error(`No atomic teaching selector is declared for ${behaviour.id}.`);
    const componentId = `behaviour-${safeId(behaviour.id)}`;
    const routeId = routeFromSelector(selector);
    const renderedTextEvidence = annotate(dom, selector, componentId);
    components.push({
      id: componentId,
      outcomeIds: [outcome.id],
      performanceBehaviourIds: [behaviour.id],
      sourceStandard: behaviour.standard,
      sourceKind: behaviour.sourceKind,
      authorityColumn: behaviour.authorityColumn,
      sourceRefs: sourceRefsFor(routeId, outcome, behaviour, input.crosswalk),
      prerequisiteTermIds: prerequisiteTerms(routeId, input.vocabularyEntries),
      firstTeachSelector: selector,
      requiredExplanationPoints: [behaviour.text, `The learner must explain or use this idea in the context shown at ${selector}.`],
      visualOrDataId: visualFor(dom, selector, componentId),
      workedExampleId: workedExampleFor(dom, selector),
      ...resolveAcademicEvidence(dom, behaviour.id, BEHAVIOUR_EVIDENCE[behaviour.id]),
      evidenceId: evidenceFor(dom, selector),
      tier: behaviour.standard === "excellence" ? "advanced" : "required-core",
      renderedTextEvidence
    });
  }

  for (const outcome of input.curriculum.outcomes) {
    const preferredRoute = OUTCOME_ROUTE_PREFERENCE[outcome.id] ?? outcome.teachRoutes.find((route) => route.startsWith("lesson-")) ?? outcome.teachRoutes[0];
    const selector = OUTCOME_ZONE_OVERRIDES[outcome.id] ?? ROUTE_ZONE[preferredRoute];
    if (!selector) throw new Error(`No atomic teaching selector is declared for outcome ${outcome.id}.`);
    const componentId = `outcome-${safeId(outcome.id)}`;
    const routeId = routeFromSelector(selector);
    const renderedTextEvidence = annotate(dom, selector, componentId);
    const behaviourBindings = input.curriculum.performanceBehaviours.filter((entry) => entry.outcomeId === outcome.id && entry.standard !== "excellence").map((entry) => BEHAVIOUR_EVIDENCE[entry.id]);
    const binding = SKILL_OUTCOME_EVIDENCE[outcome.id] ?? (behaviourBindings.length ? {
      practiceKeys: [...new Set(behaviourBindings.flatMap((entry) => entry.practiceKeys))],
      taskSelectors: [...new Set(behaviourBindings.flatMap((entry) => entry.taskSelectors))],
      rationale: "This outcome aggregates the explicitly authored behaviour bindings; it is not satisfied by one question selected from a route.",
      remainingGap: behaviourBindings.some((entry) => entry.remainingGap) ? "One or more constituent behaviours still has an explicit gap. Consult its individual record; do not certify the whole outcome." : undefined
    } : undefined);
    components.push({
      id: componentId,
      outcomeIds: [outcome.id],
      performanceBehaviourIds: [],
      sourceRefs: sourceRefsFor(routeId, outcome, undefined, input.crosswalk),
      prerequisiteTermIds: prerequisiteTerms(routeId, input.vocabularyEntries),
      firstTeachSelector: selector,
      requiredExplanationPoints: [outcome.officialText, `The route must connect this required idea to a model, example, practice item, and saved evidence.`],
      visualOrDataId: visualFor(dom, selector, componentId),
      workedExampleId: workedExampleFor(dom, selector),
      ...resolveAcademicEvidence(dom, outcome.id, binding),
      evidenceId: evidenceFor(dom, selector),
      tier: "required-core",
      renderedTextEvidence
    });
  }

  const contract: Omit<Pilot2AtomicContractV1, "workspaceSha256"> = {
    schemaVersion: 1,
    project: "biology30-unit-a-pilot-2",
    generatedAt: input.generatedAt,
    status: "revision-gate-b-awaiting-teacher-review",
    coveragePolicy: "This is an exact structural evidence index, not a certificate of academic completeness. Authored question/task bindings replace route fallbacks. gap-recorded means the named behaviour is not demonstrated; mapped-awaiting-review still needs scientific and teacher review. A labelled figure does not prove the learner performed a labelling task, and synthetic data do not prove a hands-on or published-data behaviour.",
    counts: {
      outcomes: input.curriculum.outcomes.length,
      acceptableStandardBehaviours: input.curriculum.performanceBehaviours.filter((entry) => entry.standard === "acceptable").length,
      excellenceStandardBehaviours: input.curriculum.performanceBehaviours.filter((entry) => entry.standard === "excellence").length,
      localCurriculumCriteria: input.curriculum.performanceBehaviours.filter((entry) => entry.standard === "local-curriculum-criterion").length,
      atomicComponents: components.length
    },
    components
  };
  return { html: dom.html(), contract };
}

export function validateAtomicCurriculumContract(html: string, contract: Pilot2AtomicContractV1) {
  const dom = loadHtml(html);
  const outcomeIds = new Set(contract.components.flatMap((component) => component.outcomeIds));
  const behaviourIds = contract.components.flatMap((component) => component.performanceBehaviourIds);
  if (contract.counts.outcomes !== 25 || outcomeIds.size !== 25) throw new Error(`Atomic contract covers ${outcomeIds.size} of 25 outcomes.`);
  if (contract.counts.acceptableStandardBehaviours !== 47 || contract.counts.excellenceStandardBehaviours !== 5 || contract.counts.localCurriculumCriteria !== 1 || behaviourIds.length !== 53 || new Set(behaviourIds).size !== 53) {
    throw new Error("Atomic contract must distinguish 47 acceptable examples, five excellence examples and one local criterion.");
  }
  if (contract.components.length !== 78 || contract.counts.atomicComponents !== 78) throw new Error("Atomic contract must contain 53 behaviour records and 25 outcome records.");
  for (const component of contract.components) {
    if (component.tier !== (component.sourceStandard === "excellence" ? "advanced" : "required-core")) throw new Error(`${component.id} has the wrong required/advanced tier.`);
    if (component.sourceRefs.length < 2 || component.requiredExplanationPoints.length < 2 || component.renderedTextEvidence.length < 80) {
      throw new Error(`${component.id} lacks source, explanation, or rendered evidence detail.`);
    }
    const teaching = dom(component.firstTeachSelector);
    if (teaching.length !== 1 || !(teaching.attr("data-atomic-components") ?? "").split(/\s+/).includes(component.id)) {
      throw new Error(`${component.id} does not resolve to its exact rendered teaching selector.`);
    }
    if (dom(`[data-figure-id=\"${component.visualOrDataId}\"]`).length < 1) throw new Error(`${component.id} has no rendered visual or data object.`);
    if (dom(`#${component.workedExampleId}`).length !== 1) throw new Error(`${component.id} has no rendered worked example.`);
    if ((!component.practiceItemIds.length && !component.taskSelectors.length) || component.practiceItemIds.some((id) => dom(`[data-practice-id=\"${id}\"]`).length !== 1) || component.taskSelectors.some((selector) => dom(selector).length !== 1)) {
      throw new Error(`${component.id} has no rendered aligned practice item.`);
    }
    if (!component.alignmentRationale || (component.academicStatus === "gap-recorded") !== Boolean(component.remainingGap)) throw new Error(`${component.id} hides or misstates its academic review status.`);
    if (dom(`[data-evidence-contribution-id=\"${component.evidenceId}\"],[data-save-investigation=\"${component.evidenceId}\"],[data-response-id=\"${component.evidenceId}\"]`).length < 1) {
      throw new Error(`${component.id} has no rendered evidence record.`);
    }
  }
}
