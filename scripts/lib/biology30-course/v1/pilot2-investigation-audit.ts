import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { passageDigest } from "./pilot2-passage-audit.js";
import { graphMaximumResponse, type GraphWork } from "./pilot2-graph-work.js";

export type Investigation = {
  id: string; coreSkillPartId: string; coreSkillOperationsRequired: boolean;
  investigationExtensionRequired: boolean; saveFields: string[];
  responseFields: { id: string; label: string; prompt: string; modelResponse: string; comparisonPolicy: string; attemptBeforeGuide: boolean }[];
  graphExercise?: { path: string; responseId: string };
  materialFiles: { path: string; sha256: string; role: string }[];
  [key: string]: unknown;
};
export type InvestigationReview = {
  schemaVersion: number; unit: string; method: string; teacherDecision: unknown;
  reviewedItems: { id: string; itemSha256: string; requiredPartId: string; paragraphsSha256: string; derivation: string; operationReview: string; teacherDecision: unknown }[];
  pendingItemIds: string[];
};
export function investigationDigest(item: Investigation) {
  return passageDigest(Object.fromEntries(Object.entries(item).filter(([key]) => !["revisionHistory", "status"].includes(key))));
}
export function validateBiology30InvestigationReview(
  input: { unit: string; investigations: Investigation[]; teacherAcceptance: unknown },
  core: { unit: string; parts: { id: string; paragraphs: string[] }[] },
  state: { unit: string; responses: Record<string, { limit: number }> }, review: InvestigationReview,
  requireComplete = false,
) {
  if (review.schemaVersion !== 1 || [core.unit, state.unit, review.unit].some(unit => unit !== input.unit)) throw new Error("Investigation review unit/schema mismatch");
  if (input.teacherAcceptance !== null || review.teacherDecision !== null || !review.method.trim()) throw new Error("Investigation author review cannot imply teacher acceptance");
  if (input.investigations.length !== 3) throw new Error("Each unit requires three authored investigations");
  const items = new Map(input.investigations.map(item => [item.id, item]));
  if (items.size !== 3) throw new Error("Duplicate investigation ID");
  const seen = new Set<string>();
  for (const receipt of review.reviewedItems) {
    const item = items.get(receipt.id), part = core.parts.find(part => part.id === receipt.requiredPartId);
    if (!item || seen.has(item.id)) throw new Error("Unknown or duplicate investigation receipt");
    seen.add(item.id);
    if (investigationDigest(item) !== receipt.itemSha256) throw new Error(`Stale investigation review: ${item.id}`);
    if (!part || item.coreSkillPartId !== part.id || passageDigest(part.paragraphs) !== receipt.paragraphsSha256) throw new Error(`Stale investigation teaching: ${item.id}`);
    if (receipt.teacherDecision !== null || !receipt.derivation.trim() || !receipt.operationReview.trim()) throw new Error("Missing investigation derivation or unsupported acceptance");
    if (!item.coreSkillOperationsRequired || item.investigationExtensionRequired) throw new Error("Required core skills and optional investigation extension must remain distinct");
    if (item.saveFields.length !== 4 || item.responseFields.length !== 4) throw new Error("Incomplete investigation operation/response inventory");
    for (const [index, suffix] of ["plan", "observations", "explanation", "revision"].entries()) {
      const field = item.responseFields[index], expected = `${item.id}-${suffix}`, capacity = state.responses[expected]?.limit;
      if (field.id !== expected || field.label !== item.saveFields[index] || !capacity) throw new Error(`Unbound investigation response: ${expected}`);
      if (!field.prompt.trim() || !field.comparisonPolicy.trim() || !field.modelResponse.trim() || field.modelResponse.length > capacity || !field.attemptBeforeGuide) throw new Error(`Investigation guide, operation or capacity failure: ${expected}`);
    }
  }
  for (const id of review.pendingItemIds) {
    if (!items.has(id) || seen.has(id)) throw new Error("Unknown or duplicate pending investigation");
    seen.add(id);
  }
  if (seen.size !== 3 || (requireComplete && review.pendingItemIds.length)) throw new Error("Investigation review inventory incomplete");
  return { unit: input.unit, reviewed: review.reviewedItems.length, pending: review.pendingItemIds.length, proof: "Exact authored method/data/operation review integrity; rendered interactions and teacher acceptance remain separate." };
}
export async function auditBiology30InvestigationReviews(repoRoot: string, unit: string, requireComplete = false) {
  const base = `projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}`;
  const files: Record<string, string> = {};
  const bytesFor = async (file: string) => {
    const resolved = await realpath(path.resolve(repoRoot, file));
    const boundary = await realpath(path.resolve(repoRoot, "projects/resources/biology30-production/v1"));
    const relative = path.relative(boundary, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Unsafe investigation dependency");
    const bytes = await readFile(resolved); files[file] = createHash("sha256").update(bytes).digest("hex");
    return bytes;
  };
  const load = async (file: string) => JSON.parse((await bytesFor(file)).toString("utf8"));
  const input = await load(`${base}/pilot2-investigations.json`), core = await load(`${base}/pilot2-content.json`);
  const state = await load(`${base}/pilot2-state-schema.json`), review = await load(`${base}/pilot2-investigation-review.json`);
  const report = validateBiology30InvestigationReview(input, core, state, review, requireComplete);
  const graphResponses = [];
  for (const item of input.investigations as Investigation[]) for (const material of item.materialFiles) {
    await bytesFor(material.path);
    if (!material.role.trim() || files[material.path] !== material.sha256) throw new Error(`Stale investigation material: ${material.path}`);
  }
  for (const item of input.investigations as Investigation[]) if (item.graphExercise) {
    const graph: GraphWork = await load(item.graphExercise.path);
    if (graph.unit !== unit || graph.responseId !== item.graphExercise.responseId || !state.responses[graph.responseId]) throw new Error("Cross-unit or missing investigation graph response");
    graphResponses.push({ id: item.id, responseId: graph.responseId, maximumEncodedLength: graphMaximumResponse(graph, state.responses[graph.responseId].limit) });
  }
  return { report, graphResponses, files };
}
