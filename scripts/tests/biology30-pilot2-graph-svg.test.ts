import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { emptyGraphDraft, type GraphWork } from "../lib/biology30-course/v1/pilot2-graph-work.js";
import { renderBiology30GraphSvg } from "../lib/biology30-course/v1/pilot2-graph-svg.js";
const load = async (unit: string): Promise<GraphWork> => JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${unit}/pilot2-graph-work.json`, "utf8"));

test("graphs draw entered values only, preserve gaps and use proportional day spacing", async () => {
  const work = await load("b"), draft = emptyGraphDraft(work);
  draft.g[0].a = [0, 0, 0];
  assert(!renderBiology30GraphSvg(work, 0, draft).svg.includes("data-point="));
  draft.g[0].p[0] = [0, null, 4, 3, null, 2];
  const actual = renderBiology30GraphSvg(work, 0, draft);
  assert.deepEqual(actual.values.map(v => v.value), [0, null, 4, 3, null, 2]);
  assert.equal((actual.svg.match(/data-point=/g) ?? []).length, 4);
  const line = actual.svg.match(/data-entered-line="true" d="([^"]*)"/)![1];
  assert.equal((line.match(/M/g) ?? []).length, 3);
  const points = [...actual.svg.matchAll(/data-point="(\d)" data-value="[^"]*" cx="([^"]*)"/g)];
  const positions = Object.fromEntries(points.map(p => [p[1], Number(p[2])]));
  assert(Math.abs((positions["3"] - positions["2"]) / (positions["2"] - positions["0"]) - 2 / 10) < .001);
  assert(actual.svg.includes('data-value="0"'));
});

test("scale overflow is explicit and multiple series retain distinct markers and complete equivalents", async () => {
  const work = await load("d"), draft = emptyGraphDraft(work);
  draft.g[0].a = [0, 0, 0];
  draft.g[0].p = [[100, 120, null, null, null], [100, 116, null, null, null]];
  const overflow = renderBiology30GraphSvg(work, 0, draft);
  assert.equal(overflow.warnings.length, 2);
  assert(overflow.svg.includes("↑ 120"));
  assert.equal(overflow.values[1].value, 120);
  draft.g[0].a[2] = 1;
  const visible = renderBiology30GraphSvg(work, 0, draft);
  assert.equal(visible.warnings.length, 0);
  assert(visible.svg.includes("<circle data-point"));
  assert(visible.svg.includes("<rect data-point"));
  assert(visible.svg.includes('stroke-dasharray="9 5"'));
  assert(visible.svg.includes("Logistic: N next"));
  const noScale = emptyGraphDraft(work);
  assert.equal(renderBiology30GraphSvg(work, 0, noScale).warnings.length, 1);
  const bars = await load("c"), barDraft = emptyGraphDraft(bars);
  barDraft.g[0].a = [0, 0, 1]; barDraft.g[0].p[0][0] = 0;
  const zero = renderBiology30GraphSvg(bars, 0, barDraft);
  assert(zero.svg.includes('data-zero="true"'));
  assert.equal((zero.svg.match(/data-point=/g) ?? []).length, 1);
  assert(!renderBiology30GraphSvg(bars, 0, barDraft, "comparison").svg.includes('id="c-stage-counts-learner-drawing-title"'));
});
