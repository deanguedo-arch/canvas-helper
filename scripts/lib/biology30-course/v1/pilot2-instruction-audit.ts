import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import type { TopicContract } from "./pilot2-contract.js";
import type { TopicStateSchema } from "./pilot2-state.js";
import { assertTopicReading } from "./pilot2-reading.js";

export type CoreTeaching = { unit: string; parts: { id: string; title: string; paragraphs: string[]; termIntroductionIds: string[] }[] };
export type Instruction = {
  unit: string;
  parts: {
    partId: string;
    outcomeIds: string[];
    workedExample: { id: string; prompt: string; steps: string[]; conclusion: string };
    stopCheck: { id: string; prompt: string; guide: string; persistence: string };
    advanced: { id: string; title: string; paragraphs: string[]; optional: boolean; initiallyExpanded: boolean; completionRequired: boolean;
      structureVersion?:'a-style-v1'; connection?:string;
      evidence?:{caption:string;description:string;columns:string[];rows:string[][];limitation:string};
      related?:{kind:'model'|'worked-example';routeId:string;focusId:string;label:string}; };
  }[];
};
export type TopicTeaching = { unit: string; topics: {
  topicId: string; observableQuestion: string; learningGoal: string; priorKnowledgeSupport: string;
  retrieval: { responseId: string; prompt: string; comparisonGuide: string; requiredForCompletion: boolean };
  evidenceSlip: { responseId: string; prompt: string; criteria: string[]; requiredSaveForCompletion: boolean };
  localWalkthrough: { frames: { partId: string; figureTarget: string; scenario: string; orderedExplanation: string[]; conclusion: string }[];
    checkpoint: { responseId: string; prompt: string; comparisonGuide: string; sameForLocalAndVettedExternal: boolean; requiredAttemptForCompletion: boolean };
    completionEvidence: string };
  nextRequiredRouteId: string | null;
}[] };
type Introductions = { introducedTerms: { id: string; firstTeachingPartId: string; requiredIntroductionTarget: string }[] };
const words = (text: string) => text.match(/[A-Za-z][A-Za-z'’-]*/g)?.length ?? 0;
const nonempty = (values: string[]) => values.length > 0 && values.every(value => typeof value === "string" && value.trim().length > 0);

/** Structural authoring audit only. Passing cannot mark scientific, source or rendering gates complete. */
export function validateBiology30Instruction(contract: TopicContract, core: CoreTeaching, instruction: Instruction) {
  if (core.unit !== contract.unit || instruction.unit !== contract.unit) throw new Error("Cross-unit instruction");
  const planned = contract.topics.flatMap(topic => topic.parts);
  if (JSON.stringify(core.parts.map(part => part.id)) !== JSON.stringify(planned.map(part => part.id)) ||
      JSON.stringify(instruction.parts.map(part => part.partId)) !== JSON.stringify(planned.map(part => part.id))) {
    throw new Error("Teaching/companion inventory or order drift");
  }
  const identities = new Set<string>();
  for (const [index, part] of planned.entries()) {
    const prose = core.parts[index], companion = instruction.parts[index];
    if (prose.title !== part.title || !nonempty(prose.paragraphs)) throw new Error(`Missing canonical core teaching: ${part.id}`);
    if (JSON.stringify(companion.outcomeIds) !== JSON.stringify(part.outcomeIds)) throw new Error(`Companion outcome drift: ${part.id}`);
    const { workedExample: worked, stopCheck: stop, advanced } = companion;
    if (worked.id !== `${part.id}-worked` || stop.id !== `${part.id}-stop` || advanced.id !== `${part.id}-advanced`) throw new Error(`Companion identity drift: ${part.id}`);
    for (const id of [worked.id, stop.id, advanced.id]) {
      if (identities.has(id)) throw new Error(`Duplicate teaching identity: ${id}`);
      identities.add(id);
    }
    if (!nonempty([worked.prompt, worked.conclusion, ...worked.steps]) || worked.steps.length < 2 || new Set(worked.steps).size !== worked.steps.length) throw new Error(`Incomplete worked operation: ${part.id}`);
    if (!nonempty([stop.prompt, stop.guide]) || stop.persistence !== "self-check-reveal; no new response field or completion requirement") throw new Error(`Stop check contract drift: ${part.id}`);
    if (!nonempty([advanced.title, ...advanced.paragraphs]) || !advanced.paragraphs.length || !advanced.optional || advanced.initiallyExpanded || advanced.completionRequired) throw new Error(`Advanced became missing, expanded or required: ${part.id}`);
    if(advanced.structureVersion==='a-style-v1'){
      const e=advanced.evidence,r=advanced.related;
      if(advanced.paragraphs.length!==3||!advanced.connection?.trim()||!e||!nonempty([e.caption,e.description,e.limitation,...e.columns])||e.columns.length<2||e.rows.length<2||e.rows.some(row=>row.length!==e.columns.length||!nonempty(row))||!r||!nonempty([r.routeId,r.focusId,r.label]))throw new Error(`Incomplete A-style Advanced Learning: ${part.id}`);
      if(r.kind==='worked-example'&&r.focusId!==worked.id)throw new Error(`Advanced worked-example target drift: ${part.id}`);
    }
  }
  const topics = contract.topics.map(topic => {
    const indices = topic.parts.map(part => planned.findIndex(item => item.id === part.id));
    const coreWords = indices.reduce((sum, i) => sum + words(core.parts[i].paragraphs.join(" ")), 0);
    const workedWords = indices.reduce((sum, i) => {
      const worked = instruction.parts[i].workedExample;
      return sum + words([worked.prompt, ...worked.steps, worked.conclusion].join(" "));
    }, 0);
    const advancedWords = indices.reduce((sum, i) => sum + words(instruction.parts[i].advanced.paragraphs.join(" ")), 0);
    return { topicId: topic.id, coreWords, workedWords, advancedWords, requiredExplanatoryWords: coreWords + workedWords };
  });
  const reading = assertTopicReading(core.parts);
  return { unit: contract.unit, coreParts: planned.length, workedExamples: planned.length, stopChecks: planned.length, advancedExplanations: planned.length, topics,
    reading,
    proof: "Complete ordered authored companions and non-gating Advanced flags only. Figures, first-use teaching, source/key review, old-section coverage, local walkthroughs, workload realism and rendered evidence remain separate requirements." };
}

export function validateBiology30TopicTeaching(contract: TopicContract, core: CoreTeaching, instruction: Instruction, framing: TopicTeaching, state: TopicStateSchema, vocabulary: Introductions) {
  if (framing.unit !== contract.unit || state.unit !== contract.unit || JSON.stringify(framing.topics.map(topic => topic.topicId)) !== JSON.stringify(contract.topics.map(topic => topic.id))) throw new Error("Topic framing inventory drift");
  const companions = new Map(instruction.parts.map(part => [part.partId, part]));
  const expectedIntroductions = new Map(core.parts.map(part => [part.id, [] as string[]]));
  for (const term of vocabulary.introducedTerms) {
    if (!expectedIntroductions.has(term.firstTeachingPartId) || term.requiredIntroductionTarget !== `${term.firstTeachingPartId}-terms`) throw new Error(`Invalid definition target: ${term.id}`);
    expectedIntroductions.get(term.firstTeachingPartId)!.push(term.id);
  }
  for (const part of core.parts) if (JSON.stringify(part.termIntroductionIds) !== JSON.stringify(expectedIntroductions.get(part.id))) throw new Error(`Visible definition inventory drift: ${part.id}`);
  for (const [index, topic] of framing.topics.entries()) {
    const planned = contract.topics[index];
    if (!nonempty([topic.observableQuestion, topic.learningGoal, topic.priorKnowledgeSupport, topic.evidenceSlip.prompt, ...topic.evidenceSlip.criteria]) || topic.evidenceSlip.criteria.length !== 3) throw new Error(`Missing topic purpose/evidence: ${planned.id}`);
    if (topic.retrieval.requiredForCompletion || !topic.evidenceSlip.requiredSaveForCompletion || !topic.localWalkthrough.checkpoint.requiredAttemptForCompletion || !topic.localWalkthrough.checkpoint.sameForLocalAndVettedExternal || topic.localWalkthrough.completionEvidence !== "checkpoint attempt; never elapsed viewing time") throw new Error(`Topic completion contract drift: ${planned.id}`);
    for (const [role, question] of [["retrieval", topic.retrieval], ["media", topic.localWalkthrough.checkpoint]] as const) {
      if (question.responseId !== `${planned.id}-${role}` || !nonempty([question.prompt, question.comparisonGuide]) || !state.responses[question.responseId] || question.comparisonGuide.length > state.responses[question.responseId].limit) throw new Error(`Unanswerable or missing topic checkpoint: ${planned.id}`);
    }
    if (topic.evidenceSlip.responseId !== `${planned.id}-evidence` || !state.responses[topic.evidenceSlip.responseId]) throw new Error(`Evidence response mapping drift: ${planned.id}`);
    const frames = topic.localWalkthrough.frames;
    if (JSON.stringify(frames.map(frame => frame.partId)) !== JSON.stringify(planned.parts.map(part => part.id))) throw new Error(`Local walkthrough omits or reorders teaching: ${planned.id}`);
    for (const frame of frames) {
      const worked = companions.get(frame.partId)!.workedExample;
      if (frame.figureTarget !== `${frame.partId}-figure` || frame.scenario !== worked.prompt || frame.conclusion !== worked.conclusion || JSON.stringify(frame.orderedExplanation) !== JSON.stringify(worked.steps)) throw new Error(`Local narration drifted from reviewed worked source: ${frame.partId}`);
    }
    const next = contract.requiredRoutes[contract.requiredRoutes.indexOf(planned.id) + 1] ?? null;
    if (topic.nextRequiredRouteId !== next) throw new Error(`Next route skipped a required activity: ${planned.id}`);
  }
  return { topics: framing.topics.length, definitionIntroductions: vocabulary.introducedTerms.length, narrationFrames: instruction.parts.length,
    illustratedWalkthroughsVerified: false, proof: "Framing, response capacity, ordered narration and definition placement declarations only; actual illustrations, semantic prerequisites and rendered equivalence are pending." };
}

export async function auditBiology30Instruction(repoRoot: string, contract: TopicContract) {
  const base = `projects/resources/biology30-production/v1/units/unit-${contract.unit.toLowerCase()}`;
  const files = [`${base}/pilot2-content.json`, `${base}/pilot2-instruction.json`, `${base}/pilot2-topic-teaching.json`, `${base}/pilot2-state-schema.json`, `${base}/pilot2-vocabulary.json`];
  const bytes = await Promise.all(files.map(file => readFile(path.join(repoRoot, file))));
  const [core, instruction, framing, state, vocabulary] = bytes.map(value => JSON.parse(value.toString("utf8"))) as [CoreTeaching, Instruction, TopicTeaching, TopicStateSchema, Introductions];
  return { core, instruction, framing, state, vocabulary, report: { ...validateBiology30Instruction(contract, core, instruction), framing: validateBiology30TopicTeaching(contract, core, instruction, framing, state, vocabulary) }, files: files.map((file, i) => ({ file, sha256: createHash("sha256").update(bytes[i]).digest("hex") })) };
}
