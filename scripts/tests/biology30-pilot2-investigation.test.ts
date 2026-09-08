import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { auditBiology30InvestigationReviews, investigationDigest, validateBiology30InvestigationReview } from "../lib/biology30-course/v1/pilot2-investigation-audit.js";
import { emptyGraphDraft, encodeGraphDraft, decodeGraphDraft } from "../lib/biology30-course/v1/pilot2-graph-work.js";
const load = async (unit: string, name: string) => JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${unit}/pilot2-${name}.json`, "utf8"));

test("nine investigation operations and graph responses have exact bounded review contracts", async () => {
  for (const unit of ["B", "C", "D"]) {
    const report = await auditBiology30InvestigationReviews(process.cwd(), unit, true);
    assert.equal(report.report.reviewed, 3); assert.equal(report.report.pending, 0);
    assert.equal(report.graphResponses.length, 1);
  }
  const work = await load("d", "demographic-graph-work"), state = await load("d", "state-schema");
  const draft = emptyGraphDraft(work); draft.g[0].a = work.graphs[0].expectedAxes;
  draft.g[0].p = [[1000,1060]]; draft.e = work.modelExplanation;
  const saved = encodeGraphDraft(work, draft, state.responses[work.responseId].limit);
  assert.deepEqual(decodeGraphDraft(work, saved), { kind: "graph", draft });
  assert.deepEqual(decodeGraphDraft(work, "Earlier quadrat observations"), { kind: "preserved-writing", original: "Earlier quadrat observations" });
});

test("investigation reviews reject data/prose drift, missing operations, capacity loss and gating changes", async () => {
  const input = await load("c", "investigations"), core = await load("c", "content"), state = await load("c", "state-schema"), review = await load("c", "investigation-review");
  const changed = structuredClone(input); changed.investigations[0].dataset.rows[0][1] = 70;
  assert.throws(() => validateBiology30InvestigationReview(changed, core, state, review, true), /Stale investigation review/);
  const stale = structuredClone(core); stale.parts.find((p: {id: string}) => p.id === input.investigations[0].coreSkillPartId).paragraphs[0] += "Changed";
  assert.throws(() => validateBiology30InvestigationReview(input, stale, state, review, true), /Stale investigation teaching/);
  const missing = structuredClone(review); missing.reviewedItems.pop();
  assert.throws(() => validateBiology30InvestigationReview(input, core, state, missing, true), /inventory incomplete/);
  const small = structuredClone(state); small.responses[input.investigations[0].responseFields[0].id].limit = 10;
  assert.throws(() => validateBiology30InvestigationReview(input, core, small, review, true), /capacity failure/);
  const gated = structuredClone(input), bound = structuredClone(review); gated.investigations[0].investigationExtensionRequired = true;
  bound.reviewedItems[0].itemSha256 = investigationDigest(gated.investigations[0]);
  assert.throws(() => validateBiology30InvestigationReview(gated, core, state, bound, true), /must remain distinct/);
});
