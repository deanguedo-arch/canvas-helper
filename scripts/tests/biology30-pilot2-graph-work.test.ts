import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { emptyGraphDraft, encodeGraphDraft, decodeGraphDraft, compareGraphDraft, graphWorkText, graphMaximumResponse } from "../lib/biology30-course/v1/pilot2-graph-work.js";
import { validateBiology30GraphWork } from "../lib/biology30-course/v1/pilot2-graph-audit.js";

async function fixture(unit: string) {
  const base = `projects/resources/biology30-production/v1/units/unit-${unit}`;
  const read = async (name: string) => JSON.parse(await readFile(`${base}/pilot2-${name}.json`, "utf8"));
  const [contract, work, practice, state, vocabulary, timing, investigations] = await Promise.all(["contract", "graph-work", "practice", "state-schema", "vocabulary", "time", "investigations"].map(read));
  return { contract, work, learning: { practice, state, vocabulary, timing }, investigations };
}

test("all six required graphs bind 39 plotted values to reviewed data and fit existing response fields", async () => {
  let graphs = 0, points = 0;
  for (const u of ["b", "c", "d"]) {
    const { contract, work, learning, investigations } = await fixture(u);
    const report = validateBiology30GraphWork(contract, work, learning, investigations);
    graphs += report.graphs; points += report.points;
    assert.ok(graphMaximumResponse(work, learning.state.responses[work.responseId].limit) <= learning.state.responses[work.responseId].limit);
    const drift = structuredClone(work); drift.graphs[0].series[0].expected[0] += 1;
    assert.throws(() => validateBiology30GraphWork(contract, drift, learning, investigations), /differ from supplied|changed recurrence/);
    const changedSource = structuredClone(investigations);
    if (u !== "d") {
      changedSource.investigations.find((i: any) => i.id === work.source.investigationId).dataset.rows[0][1] += 1;
      assert.throws(() => validateBiology30GraphWork(contract, work, learning, changedSource), /dataset changed/);
    }
  }
  assert.deepEqual([graphs, points], [6, 39]);
});

test("graph drafts preserve blanks, zeroes, wrong answers and readable full collection text", async () => {
  const { work, learning } = await fixture("b"), draft = emptyGraphDraft(work);
  draft.g[0].p[0][0] = 0; draft.g[0].p[0][1] = 99; draft.g[0].a = [0, 0, 0]; draft.e = "My initial explanation.";
  const before = structuredClone(draft), text = encodeGraphDraft(work, draft, learning.state.responses[work.responseId].limit);
  assert.deepEqual(decodeGraphDraft(work, text), { kind: "graph", draft });
  const feedback = compareGraphDraft(work, draft);
  assert.equal(feedback[0].series[0].points[0], "compare-source-value");
  assert.equal(feedback[0].series[0].points[2], "blank");
  assert.deepEqual(feedback[0].outsideScale, [{ series: 0, pointIndex: 1, value: 99 }]);
  assert.deepEqual(draft, before);
  const collection = graphWorkText(work, draft);
  assert.match(collection, /2 = 0; 7 = 99; 12 = not plotted/);
  assert.match(collection, /Progesterone/);
  assert.match(collection, /My initial explanation/);
});

test("graph response rejection preserves earlier prose, unknown versions and escaped overflow", async () => {
  const { work, learning } = await fixture("c"), draft = emptyGraphDraft(work), limit = learning.state.responses[work.responseId].limit;
  for (const original of ["Previous written calculation: 28/100 = 28%.", '{"v":99}', '{broken', '{"__proto__":{"x":1}}']) assert.deepEqual(decodeGraphDraft(work, original), { kind: "preserved-writing", original });
  draft.g[0].p[0][0] = Infinity;
  assert.throws(() => encodeGraphDraft(work, draft, limit), /finite nonnegative/);
  draft.g[0].p[0][0] = 72; draft.k = "D";
  assert.throws(() => encodeGraphDraft(work, draft, limit), /unit/);
  draft.k = "C"; draft.e = '"'.repeat(work.explanationLimit);
  assert.throws(() => encodeGraphDraft(work, draft, limit), /exceeds its saved field/);
  assert.equal(draft.e.length, work.explanationLimit);
});

test("growth curves retain interval units and usable alternative scales are not marked incorrect", async () => {
  const { work } = await fixture("d"), draft = emptyGraphDraft(work);
  assert.deepEqual(work.graphs[0].series.map((s: any) => s.expected), [[100, 120, 144, 172.8, 207.4], [100, 116, 133.8, 153.4, 174.7]]);
  draft.g[0].a = [0, 0, 2];
  draft.g[0].p = work.graphs[0].series.map((s: any) => [...s.expected]);
  assert.deepEqual(compareGraphDraft(work, draft)[0].axes, ["matches", "matches", "fits-source-values"]);
  draft.g[0].a[2] = 0;
  assert.equal(compareGraphDraft(work, draft)[0].axes[2], "scale-too-small");
  assert.match(graphWorkText(work, draft), /Model interval/);
});
