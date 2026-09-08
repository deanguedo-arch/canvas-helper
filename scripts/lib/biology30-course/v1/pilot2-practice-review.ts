import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import type { LearningInputs } from "./pilot2-learning-audit.js";
import { passageDigest } from "./pilot2-passage-audit.js";

type Practice = LearningInputs["practice"];
type KeyReview = {
  schemaVersion: number;
  unit: string;
  method: string;
  teacherDecision: unknown;
  reviewedItems: { itemId: string; itemSha256: string; derivation: string; derivedCorrectIndex: number | null; comparison: string; teacherDecision: unknown }[];
  pendingItemIds: string[];
};

/** Includes datasets, mappings, limits and reveal policy as well as the key. */
export function practiceItemDigest(item: object) {
  return passageDigest(Object.fromEntries(Object.entries(item).filter(([key]) => !["revisionHistory", "reviewStatus"].includes(key))));
}

/** This checks exact review integrity; it cannot make an academic judgment. */
export function validateBiology30PracticeKeys(practice: Practice, review: KeyReview, requireComplete = false) {
  if (review.schemaVersion !== 1 || practice.unit !== review.unit) throw new Error("Cross-unit or unsupported practice key review");
  if (!review.method?.trim() || review.teacherDecision !== null) throw new Error("Practice key author review cannot imply teacher acceptance");
  const items = new Map(practice.items.map(item => [item.id, item]));
  const accounted = new Set<string>();
  for (const receipt of review.reviewedItems) {
    const item = items.get(receipt.itemId);
    if (!item || accounted.has(item.id)) throw new Error(`Unknown or duplicate practice key review: ${receipt.itemId}`);
    accounted.add(item.id);
    if (practiceItemDigest(item) !== receipt.itemSha256) throw new Error(`Stale practice key review: ${item.id}`);
    if (!receipt.derivation?.trim() || !receipt.comparison?.trim()) throw new Error(`Missing practice key derivation: ${item.id}`);
    if (receipt.teacherDecision !== null) throw new Error("Practice key author review cannot imply teacher acceptance");
    if (item.kind === "multiple-choice") {
      if (!Number.isInteger(receipt.derivedCorrectIndex) || receipt.derivedCorrectIndex! < 0 || receipt.derivedCorrectIndex! >= item.options!.length || receipt.derivedCorrectIndex !== item.correctIndex) throw new Error(`Independent practice key disagreement: ${item.id}`);
    } else if (receipt.derivedCorrectIndex !== null) throw new Error(`Written operation received an automatic answer index: ${item.id}`);
  }
  for (const id of review.pendingItemIds) {
    if (!items.has(id) || accounted.has(id)) throw new Error(`Unknown or duplicate pending practice key: ${id}`);
    accounted.add(id);
  }
  if (accounted.size !== items.size) throw new Error("Practice items missing from key review inventory");
  if (requireComplete && review.pendingItemIds.length) throw new Error("Independent practice key reviews remain pending");
  return { unit: practice.unit, reviewedItems: review.reviewedItems.length, pendingItems: review.pendingItemIds.length,
    proof: "Exact prompt-first author derivation and key receipt integrity. This is not independent human review, rendered prerequisite proof or teacher acceptance." };
}

export async function auditBiology30PracticeKeys(repoRoot: string, practice: Practice, requireComplete = false) {
  const file = `projects/resources/biology30-production/v1/units/unit-${practice.unit.toLowerCase()}/pilot2-practice-key-review.json`;
  const bytes = await readFile(`${repoRoot}/${file}`);
  return { report: validateBiology30PracticeKeys(practice, JSON.parse(bytes.toString("utf8")), requireComplete), file, sha256: createHash("sha256").update(bytes).digest("hex") };
}
