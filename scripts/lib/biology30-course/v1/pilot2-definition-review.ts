import { createHash } from "node:crypto";
export type DefinitionReview = {
  schemaVersion: number; unit: string; method: string; teacherDecision: unknown;
  reviewedIntroductions: { id: string; definitionSha256: string; decision: string }[];
  preservedMethod: string;
  reviewedPreserved: { term: string; definitionSha256: string; decision: string }[];
};
/** Exact wording receipts do not establish when a learner first meets a term. */
export function validateBiology30DefinitionReview(
  vocabulary: { unit: string; introducedTerms: { id: string; definition: string }[]; preservedGlossaryEntries: { term: string; definition: string }[] }, review: DefinitionReview,
) {
  if (review.schemaVersion !== 1 || review.unit !== vocabulary.unit || review.teacherDecision !== null || !review.method.trim()) throw new Error("Invalid definition author review");
  const terms = new Map(vocabulary.introducedTerms.map(term => [term.id, term]));
  if (terms.size !== vocabulary.introducedTerms.length) throw new Error("Duplicate introduced definition identity");
  const seen = new Set<string>();
  for (const item of review.reviewedIntroductions) {
    const term = terms.get(item.id);
    if (!term || seen.has(item.id)) throw new Error("Unknown or duplicate definition receipt");
    seen.add(item.id);
    if (!item.decision.trim() || createHash("sha256").update(term.definition).digest("hex") !== item.definitionSha256) throw new Error(`Stale definition review: ${item.id}`);
  }
  if (seen.size !== terms.size) throw new Error("Definition review inventory incomplete");
  if (!review.preservedMethod?.trim() || !Array.isArray(review.reviewedPreserved)) throw new Error("Missing preserved glossary author review");
  const preserved = new Map(vocabulary.preservedGlossaryEntries.map(term => [term.term, term]));
  if (preserved.size !== vocabulary.preservedGlossaryEntries.length) throw new Error("Duplicate preserved glossary identity");
  const preservedSeen = new Set<string>();
  for (const item of review.reviewedPreserved) {
    const term = preserved.get(item.term);
    if (!term || preservedSeen.has(item.term)) throw new Error("Unknown or duplicate preserved glossary receipt");
    preservedSeen.add(item.term);
    if (!item.decision.trim() || createHash("sha256").update(term.definition).digest("hex") !== item.definitionSha256) throw new Error(`Stale preserved glossary review: ${item.term}`);
  }
  if (preservedSeen.size !== preserved.size) throw new Error("Preserved glossary review inventory incomplete");
  return { reviewedDefinitions: seen.size, reviewedPreserved: preservedSeen.size, proof: "Author-reviewed wording integrity only; all-surface first use and dependency placement remain separate." };
}
