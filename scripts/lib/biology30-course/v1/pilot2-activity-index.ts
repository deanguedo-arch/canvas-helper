import type { TopicLayout } from "./topic-layout.js";
import {validateBiologyRuntimeIdentity} from './course-identity.js';
import type { TopicTeaching, Instruction } from "./pilot2-instruction-audit.js";
import type { LearningInputs } from "./pilot2-learning-audit.js";
import { decodeGraphDraft, graphWorkText, type GraphWork } from "./pilot2-graph-work.js";
import { validateTopicState, type TopicState, type TopicStateSchema } from "./pilot2-state.js";
import { describeLegacyWork } from "./pilot2-legacy-work.js";
import type { Biology30SuspendDataSchema } from "./suspend-data.js";

export type ActivityEntry = {
  id: string; routeId: string; focusId: string; title: string; category: string;
  responses: { id: string; label: string }[];
  choices: { id: string; label: string; options: Record<string, string> }[];
  flags: { id: string; label: string }[];
};
export type ActivityInputs = {
  contract: TopicLayout; state: TopicStateSchema; framing: TopicTeaching; instruction: Instruction;
  practice: LearningInputs["practice"];
  vocabulary: { conceptFamilies: { id: string; label: string }[] };
  models: { models: { id: string; title: string; predictionId: string; explanationId: string; testFlag: string; collectionFlag: string; cases: { value: string; label: string }[] }[] };
  investigations: { investigations: { id: string; title: string; responseFields: { id: string; label: string }[] }[] };
  seminar: { id: string; title: string; activities: { id: string; prompt: string }[] };
  textbook: { groups: { id: string; chapter: number | null; items: { id: string; questionNumber: number; title: string }[] }[] };
};

/** One owning index for controls and collection; no second response store. */
export function buildTopicActivityIndex(input: ActivityInputs): ActivityEntry[] {
  const { contract, state } = input, unit = contract.unit.toLowerCase();
  validateBiologyRuntimeIdentity(contract);
  if(contract.unit!==state.unit||contract.courseId!==state.courseId)throw Error('Activity course identity does not match saved-state schema');
  const entries: ActivityEntry[] = [];
  const add = (entry: ActivityEntry) => entries.push(entry);
  for (const topic of contract.topics) {
    const teaching = input.framing.topics.find(item => item.topicId === topic.id);
    if (!teaching) throw new Error(`Missing activity framing: ${topic.id}`);
    for (const [field, label, flag] of [
      [teaching.retrieval, "Retrieval", null],
      [teaching.evidenceSlip, "Evidence Slip", `${topic.id}-evidence-collected`],
      [teaching.localWalkthrough.checkpoint, "Media checkpoint", `${topic.id}-media-attempted`],
    ] as const) {
      add({ id: field.responseId, routeId: topic.id, focusId: field.responseId, title: `${topic.title}: ${label}`, category: label,
        responses: [{ id: field.responseId, label: field.prompt }], choices: [], flags: flag ? [{ id: flag, label: label === "Evidence Slip" ? "Saved to collection" : "Attempted" }] : [] });
    }
    for (const part of topic.parts) {
      const advanced = input.instruction.parts.find(item => item.partId === part.id)?.advanced;
      if (!advanced) throw new Error(`Missing Advanced activity: ${part.id}`);
      add({ id: advanced.id, routeId: topic.id, focusId: advanced.id, title: advanced.title, category: "Advanced Learning", responses: [], choices: [],
        flags: [{ id: `${advanced.id}-complete`, label: "Self-marked complete" }] });
    }
  }
  for (const item of input.practice.items) {
    const selected = item.kind === "multiple-choice";
    add({ id: item.id, routeId: item.routeId, focusId: item.id, title: item.prompt, category: item.role === "challenge" ? "Diploma Challenge" : "Practice",
      responses: selected ? [] : [{ id: item.id, label: "Your response" }],
      choices: selected ? [{ id: item.id, label: "Your selection", options: Object.fromEntries(item.options!.map((text, index) => [String(index), text])) }] : [],
      flags: [{ id: `${item.id}-attempted`, label: "Attempted" }] });
  }
  for (const family of input.vocabulary.conceptFamilies) {
    const ids = state.families.responseIds[family.id];
    if (ids?.length !== 4) throw new Error(`Incomplete Frayer state: ${family.id}`);
    add({ id: family.id, routeId: `${unit}-core-vocabulary`, focusId: family.id, title: family.label, category: "Frayer",
      responses: ids.map((id, index) => ({ id, label: ["Contextual definition", "Essential mechanism", "Unit evidence", "Non-example or confusion"][index] })), choices: [],
      flags: [{ id: `${family.id}-collected`, label: "Saved to collection" }] });
  }
  for (const model of input.models.models) {
    add({ id: model.id, routeId: `${unit}-models`, focusId: model.id, title: model.title, category: "Models and Data Lab",
      responses: [{ id: model.predictionId, label: "Prediction" }, { id: model.explanationId, label: "Explanation" }],
      choices: [{ id: model.id, label: "Selected case", options: Object.fromEntries(model.cases.map(item => [item.value, item.label])) }],
      flags: [{ id: model.testFlag, label: "Tested" }, { id: model.collectionFlag, label: "Saved to collection" }] });
  }
  for (const investigation of input.investigations.investigations) {
    add({ id: investigation.id, routeId: `${unit}-investigations`, focusId: investigation.id, title: investigation.title, category: "Investigation",
      responses: investigation.responseFields.map(field => ({ id: field.id, label: field.label })), choices: [], flags: [{ id: `${investigation.id}-saved`, label: "Saved to collection" }] });
  }
  add({ id: input.seminar.id, routeId: input.seminar.id, focusId: input.seminar.activities[0].id, title: input.seminar.title, category: "Review Seminar",
    responses: input.seminar.activities.map(item => ({ id: item.id, label: item.prompt })), choices: [], flags: [{ id: `${input.seminar.id}-saved`, label: "Saved to collection" }] });
  for (const group of input.textbook.groups) for (const item of group.items) {
    add({ id: item.id, routeId: group.chapter ? `${unit}-chapter-${group.chapter}-practice` : `${unit}-final-practice`, focusId: item.id,
      title: `Textbook Q${item.questionNumber}: ${item.title}`, category: "Textbook reinforcement", responses: [], choices: [], flags: [{ id: `${item.id}-attempted`, label: "Attempt confirmed" }] });
  }
  add({ id: `${unit}-process-note`, routeId: `${unit}-notes`, focusId: `${unit}-process-note`, title: "My notes", category: "Notes",
    responses: [{ id: `${unit}-process-note`, label: "Notes" }], choices: [], flags: [] });
  validateTopicActivityIndex(entries, state);
  return entries;
}

export function validateTopicActivityIndex(entries: ActivityEntry[], state: TopicStateSchema) {
  const ids = new Set<string>();
  const accounted = { responses: new Set<string>(), choices: new Set<string>(), flags: new Set<string>() };
  for (const entry of entries) {
    if (!entry.id || ids.has(entry.id) || !state.routes.includes(entry.routeId) || !entry.focusId || !entry.title.trim()) throw new Error(`Invalid activity return target: ${entry.id}`);
    ids.add(entry.id);
    for (const kind of ["responses", "choices", "flags"] as const) for (const field of entry[kind]) {
      if (!Object.hasOwn(state[kind], field.id) || accounted[kind].has(field.id) || !field.label.trim()) throw new Error(`Unbound or duplicate collection ${kind}: ${field.id}`);
      accounted[kind].add(field.id);
    }
    for (const choice of entry.choices) {
      if (Object.keys(choice.options).sort().join("\0") !== [...state.choices[choice.id].values].sort().join("\0") || Object.values(choice.options).some(label => !label.trim())) throw new Error(`Collection choice meaning drift: ${choice.id}`);
    }
  }
  for (const kind of ["responses", "choices", "flags"] as const) {
    if (accounted[kind].size !== Object.keys(state[kind]).length) throw new Error(`Collection omits registered ${kind}`);
  }
  return { entries: entries.length, responses: accounted.responses.size, choices: accounted.choices.size, flags: accounted.flags.size };
}

export function meaningfulTopicResponse(id: string, value: string | undefined, graphs: GraphWork[]) {
  if (!value?.trim()) return false;
  const graph = graphs.find(item => item.responseId === id);
  if (!graph) return true;
  const result = decodeGraphDraft(graph, value);
  return result.kind === "preserved-writing" || Boolean(result.draft.e.trim()) || result.draft.g.some(plot => plot.a.some(axis => axis !== null) || plot.p.some(points => points.some(point => point !== null)));
}

export type WorkEntry = { id: string; title: string; category: string; routeId: string | null; focusId: string | null; fields: { label: string; text: string }[]; legacyOriginal?: string };
export function collectTopicWork(index: ActivityEntry[], state: TopicState, schema: TopicStateSchema, graphs: GraphWork[] = [], legacySchema?: Biology30SuspendDataSchema): WorkEntry[] {
  validateTopicState(state, schema);
  const entries: WorkEntry[] = [];
  for (const item of index) {
    const fields: WorkEntry["fields"] = [];
    for (const field of item.responses) {
      const text = state.responses[field.id];
      if (!meaningfulTopicResponse(field.id, text, graphs)) continue;
      const graph = graphs.find(graph => graph.responseId === field.id), decoded = graph ? decodeGraphDraft(graph, text) : null;
      fields.push({ label: field.label, text: decoded?.kind === "graph" ? graphWorkText(graph!, decoded.draft) : text });
    }
    for (const field of item.choices) {
      const value = state.choices[field.id];
      if (value !== undefined) fields.push({ label: field.label, text: field.options[value] });
    }
    for (const field of item.flags) if (state.flags.includes(field.id)) fields.push({ label: "Status", text: field.label });
    if (fields.length) entries.push({ id: item.id, title: item.title, category: item.category, routeId: item.routeId, focusId: item.focusId, fields });
  }
  state.legacy.forEach((legacy, index) => entries.push({ id: `preserved-legacy-${index}`, title: `Earlier work: ${legacy.source}`, category: "Preserved earlier work", routeId: null, focusId: null,
    fields: legacySchema ? describeLegacyWork(legacy.original, legacySchema) : [{ label: "Original saved payload; not reassigned to new activities", text: legacy.original }], legacyOriginal: legacy.original }));
  return entries;
}

/** Copy/Print callers receive the whole collection, never the filtered DOM. */
export function topicWorkText(index: ActivityEntry[], state: TopicState, schema: TopicStateSchema, graphs: GraphWork[] = [], legacySchema?: Biology30SuspendDataSchema) {
  validateTopicActivityIndex(index, schema);
  return collectTopicWork(index, state, schema, graphs, legacySchema).map(entry => `${entry.title}\n${entry.category}\n${entry.fields.map(field => `${field.label}\n${field.text}`).join("\n\n")}`).join("\n\n────\n\n");
}

export function completedTopicRoutes(input: ActivityInputs, state: TopicState, graphs: GraphWork[] = []) {
  validateTopicState(state, input.state);
  const attempted = (item: LearningInputs["practice"]["items"][number]) => state.flags.includes(`${item.id}-attempted`) &&
    (item.kind === "multiple-choice" ? state.choices[item.id] !== undefined : meaningfulTopicResponse(item.id, state.responses[item.id], graphs));
  return input.contract.requiredRoutes.filter(routeId => {
    const teaching = input.framing.topics.find(topic => topic.topicId === routeId);
    if (teaching) return input.practice.items.filter(item => item.routeId === routeId && item.role === "guided").length === 2 &&
      input.practice.items.filter(item => item.routeId === routeId && item.role === "guided").every(attempted) &&
      state.flags.includes(`${routeId}-evidence-collected`) && Boolean(state.responses[teaching.evidenceSlip.responseId]?.trim()) &&
      state.flags.includes(`${routeId}-media-attempted`) && Boolean(state.responses[teaching.localWalkthrough.checkpoint.responseId]?.trim());
    if (routeId === input.seminar.id) return state.flags.includes(`${routeId}-saved`) && input.seminar.activities.every(item => Boolean(state.responses[item.id]?.trim()));
    const questions = input.practice.items.filter(item => item.routeId === routeId && ["chapter", "final"].includes(item.role));
    return questions.length > 0 && questions.every(attempted);
  });
}
