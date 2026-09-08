import { createHash } from "node:crypto";
import type { LearningInputs } from "./pilot2-learning-audit.js";
import type { CoreTeaching, Instruction } from "./pilot2-instruction-audit.js";

type PassageReview = {
  unit: string;
  reviewedItems: {
    itemId: string;
    questionSha256: string;
    requiredPassages: { partId: string; paragraphsSha256: string; workedExampleId: string; workedExampleSha256: string }[];
    review: string;
    keyCheck: string;
    assessedReasoning: string;
    teacherDecision: unknown;
  }[];
  pendingItemIds: string[];
};

export function passageDigest(value: unknown): string {
  const ordered = (item: unknown): unknown => Array.isArray(item) ? item.map(ordered)
    : item !== null && typeof item === "object"
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, child]) => [key, ordered(child)]))
      : item;
  return createHash("sha256").update(JSON.stringify(ordered(value))).digest("hex");
}

/** Validate review receipts, never infer scientific adequacy from matching hashes. */
export function validateBiology30PassageReviews(practice: LearningInputs["practice"], core: CoreTeaching, instruction: Instruction, review: PassageReview, requireComplete = false) {
  if ([core.unit, instruction.unit, review.unit].some(unit => unit !== practice.unit)) throw new Error("Cross-unit passage review");
  const items = new Map(practice.items.map(item => [item.id, item]));
  const prose = new Map(core.parts.map(part => [part.id, part]));
  const companions = new Map(instruction.parts.map(part => [part.partId, part]));
  const accounted = new Set<string>();
  for (const receipt of review.reviewedItems) {
    const item = items.get(receipt.itemId);
    if (!item || accounted.has(receipt.itemId)) throw new Error(`Unknown or duplicate passage review: ${receipt.itemId}`);
    accounted.add(receipt.itemId);
    const fields = item.kind === "multiple-choice"
      ? ["prompt", "options", "correctIndex", "rationale", "misconceptionFeedback"] as const
      : ["prompt", "modelResponse", "comparisonFeedback"] as const;
    const question = Object.fromEntries(fields.map(field => [field, item[field]]));
    if (passageDigest(question) !== receipt.questionSha256) throw new Error(`Stale question review: ${item.id}`);
    const expected = new Set([...item.teachingPartIds, ...item.prerequisitePartIds ?? []]);
    if (receipt.requiredPassages.length !== expected.size) throw new Error(`Passage review inventory drift: ${item.id}`);
    for (const passage of receipt.requiredPassages) {
      const part = prose.get(passage.partId), worked = companions.get(passage.partId)?.workedExample;
      if (!expected.delete(passage.partId) || !part || !worked) throw new Error(`Unknown, duplicate or unmapped reviewed passage: ${item.id}`);
      if (passageDigest(part.paragraphs) !== passage.paragraphsSha256 || worked.id !== passage.workedExampleId || passageDigest(worked) !== passage.workedExampleSha256) throw new Error(`Stale required passage review: ${item.id}: ${passage.partId}`);
    }
    if (expected.size || ![receipt.review, receipt.keyCheck, receipt.assessedReasoning].every(text => typeof text === "string" && text.trim())) throw new Error(`Incomplete passage reasoning: ${item.id}`);
    if (receipt.teacherDecision !== null) throw new Error("Passage author review cannot imply teacher acceptance");
  }
  for (const id of review.pendingItemIds) {
    if (!items.has(id) || accounted.has(id)) throw new Error(`Unknown or duplicate pending passage review: ${id}`);
    accounted.add(id);
  }
  if (accounted.size !== items.size) throw new Error("Practice items missing from reviewed/pending passage inventory");
  if (requireComplete && review.pendingItemIds.length) throw new Error("Required practice passage reviews remain pending");
  return { unit: practice.unit, reviewedItems: review.reviewedItems.length, pendingItems: review.pendingItemIds.length,
    proof: "Exact question and required-passage receipt integrity only; independent scientific key review and rendered prerequisites remain separate evidence." };
}
