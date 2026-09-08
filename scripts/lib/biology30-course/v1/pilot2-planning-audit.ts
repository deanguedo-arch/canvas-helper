import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import type { TopicContract } from "./pilot2-contract.js";

type Target = { topicId: string; partId: string };
type Academic = { unit: string; sourceSha256: string; outcomeCount: number; componentCount: number; components: { id: string; requiredPracticeIds: string[]; outcomeId: string; requiredSourcePage: number; criterion: string; targets: Target[] }[] };
type Inquiry = { id: string; generalOutcome: number; question: string; coreSkillTopicId: string; coreSkillPartId: string; outcomeIds: string[]; coreSkillOperationsRequired: boolean; investigationExtensionRequired: boolean; sourceKind: string; dataset: { columns: string[]; rows: unknown[][] }; procedure: string[]; expected: string; limitations: string[]; saveFields: string[] };
type Guide = { id: string; questionNumber: number; printedPage: number; physicalPage: number; continuationPhysicalPage: number | null; guide: string; teachingTopicId: string; teachingPartId: string; attemptRequiredToReveal: boolean; countsForRequiredCompletion: boolean };
type TextbookGroup = { id: string; chapter: number; textbookUnit: number | null; items: Guide[] };
type Program = { sourceSha256: string; records: { unit: string; outcomeId: string; physicalPage: number }[] };
export type Biology30PlanningInputs = { academic: Academic; investigations: { unit: string; investigations: Inquiry[] }; guides: { unit: string; groups: TextbookGroup[] }; program: Program };

const inclusive = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const assignments = {
  B: { "b-textbook-chapter-14": [1,2,3,4,8,9,11,13,16,17,20,23], "b-textbook-chapter-15": [...inclusive(1,5),...inclusive(7,17),22,23,25,26], "b-textbook-unit-6": inclusive(1,52) },
  C: { "c-textbook-chapter-16": [...inclusive(2,9),11,...inclusive(13,18),21], "c-textbook-chapter-17": [...inclusive(2,6),8,9,10,...inclusive(12,18),21], "c-textbook-chapter-18": [1,2,3,4,5,6,9,10,12,13,22], "c-textbook-unit-7": inclusive(1,48) },
  D: { "d-textbook-chapter-19": inclusive(1,15), "d-textbook-chapter-20": [...inclusive(1,12),14,15,17,18,20,22], "d-textbook-unit-8": inclusive(1,35) }
} as const;
const firstFolios: Record<number, number> = {14:472,15:506,16:544,17:584,18:622,19:672,20:702};

/** Check the authored planning topology. A successful result is not a rendered academic pass. */
export function validateBiology30PlanningInputs(contract: TopicContract, input: Biology30PlanningInputs) {
  const { academic, investigations, guides, program } = input;
  if ([academic.unit, investigations.unit, guides.unit].some(unit => unit !== contract.unit)) throw new Error("Cross-unit planning input");
  if (academic.sourceSha256 !== program.sourceSha256) throw new Error("Atomic curriculum authority drift");
  const topics = new Map(contract.topics.map(topic => [topic.id, topic]));
  const outcomes = new Map(program.records.filter(record => record.unit === contract.unit).map(record => [record.outcomeId, record]));
  const target = (topicId: string, partId: string) => {
    const part = topics.get(topicId)?.parts.find(part => part.id === partId);
    if (!part) throw new Error(`Unresolved exact topic/part target: ${topicId}/${partId}`);
    return part;
  };
  const componentIds = new Set<string>();
  const boundOutcomes = new Set<string>();
  for (const component of academic.components) {
    if (componentIds.has(component.id)) throw new Error(`Duplicate academic component: ${component.id}`);
    componentIds.add(component.id);
    const source = outcomes.get(component.outcomeId);
    if (!source || source.physicalPage !== component.requiredSourcePage || !component.criterion.trim() || !component.targets.length) throw new Error(`Incomplete authority/component binding: ${component.id}`);
    for (const t of component.targets) {
      if (!target(t.topicId, t.partId).outcomeIds.includes(component.outcomeId)) throw new Error(`Part does not declare the contracted outcome: ${component.id}`);
    }
    boundOutcomes.add(component.outcomeId);
  }
  if (academic.outcomeCount !== outcomes.size || boundOutcomes.size !== outcomes.size || academic.componentCount !== academic.components.length) throw new Error("Atomic outcome inventory drift");
  if (investigations.investigations.length !== 3 || new Set(investigations.investigations.map(i => i.generalOutcome)).size !== 3) throw new Error("Each general outcome needs its own investigation contract");
  for (const inquiry of investigations.investigations) {
    const part = target(inquiry.coreSkillTopicId, inquiry.coreSkillPartId);
    if (!inquiry.coreSkillOperationsRequired || inquiry.investigationExtensionRequired) throw new Error("Optional investigation cannot own the only required skill operation");
    const skillIds = [1,2,3,4].map(n => `${contract.unit}${inquiry.generalOutcome}.${n}s`);
    if (skillIds.some(id => !inquiry.outcomeIds.includes(id) || !part.outcomeIds.includes(id))) throw new Error(`Required skill task is incomplete: ${inquiry.id}`);
    if (!inquiry.sourceKind.trim() || !inquiry.question.trim() || !inquiry.expected.trim() || inquiry.procedure.length < 4 || inquiry.saveFields.length !== 4 || !inquiry.limitations.length) throw new Error(`Incomplete investigation: ${inquiry.id}`);
    if (!inquiry.dataset.rows.length || inquiry.dataset.columns.length < 2 || inquiry.dataset.rows.some(row => row.length !== inquiry.dataset.columns.length)) throw new Error(`Broken investigation table: ${inquiry.id}`);
  }
  const expectedGroups = assignments[contract.unit] as Record<string, readonly number[]>;
  if (guides.groups.length !== Object.keys(expectedGroups).length || new Set(guides.groups.map(group => group.id)).size !== guides.groups.length) throw new Error("Textbook review group drift");
  const guideIds = new Set<string>();
  for (const group of guides.groups) {
    if (JSON.stringify(group.items.map(item => item.questionNumber)) !== JSON.stringify(expectedGroups[group.id])) throw new Error(`Teacher textbook assignment drift: ${group.id}`);
    for (const guide of group.items) {
      if (guideIds.has(guide.id)) throw new Error(`Duplicate textbook response identity: ${guide.id}`);
      guideIds.add(guide.id);
      target(guide.teachingTopicId, guide.teachingPartId);
      if (guide.physicalPage !== guide.printedPage - firstFolios[group.chapter] + 1) throw new Error(`Textbook printed/physical mismatch: ${guide.id}`);
      if (!guide.guide.trim() || !guide.attemptRequiredToReveal || guide.countsForRequiredCompletion) throw new Error(`Textbook attempt/gating drift: ${guide.id}`);
    }
  }
  return { unit: contract.unit, outcomes: outcomes.size, components: academic.components.length, investigations: investigations.investigations.length, nativeTextbookGuides: guideIds.size, proof: "planning topology only; authored explanations, exact passage matches, keys and rendered operations require their separate reviews" };
}

export async function auditBiology30PlanningInputs(repoRoot: string, contract: TopicContract) {
  const base = `projects/resources/biology30-production/v1/units/unit-${contract.unit.toLowerCase()}`;
  const files = [`${base}/pilot2-academic-contract.json`, `${base}/pilot2-investigations.json`, `${base}/pilot2-textbook-guides.json`, "projects/resources/biology30-production/v1/pilot2/authority/program-outcome-register.json"];
  const bytes = await Promise.all(files.map(file => readFile(path.join(repoRoot, file))));
  const [academic, investigations, guides, program] = bytes.map(bytes => JSON.parse(bytes.toString("utf8")));
  const input: Biology30PlanningInputs = { academic, investigations, guides, program };
  return { report: validateBiology30PlanningInputs(contract, input), input, files: files.map((file, index) => ({ file, sha256: createHash("sha256").update(bytes[index]).digest("hex") })) };
}
