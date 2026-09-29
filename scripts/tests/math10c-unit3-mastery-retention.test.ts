import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ROOT = "projects/math10c-unit3-pilot/workspace/assets";
function load(name: string): any {
  const code = readFileSync(`${ROOT}/${name}`, "utf8");
  const module: { exports: any } = { exports: {} };
  new Function("module", "exports", "require", code)(module, module.exports, (request: string) => load(request.replace("./", "")));
  return module.exports;
}
const Policy = load("mastery-policy.js");
const Mastery = load("mastery.js");
const Retention = load("mastery-retention.js");

function work(id: string, at: number, selected = false) {
  return { id, index: at, mode: "verification", problem: "2x^2+7x+3", values: { "m36-factor": "(2x+1)(x+3)" },
    observedAt: at, support: 0, fresh: true, firstValid: true, result: "4 of 4 components correct", repair: "none",
    policy: Policy.VERSION, checker: "retention-test", selected, checks: 1, firstSupport: 0, firstWrongMask: 0, firstValues: { "m36-factor": "(2x+1)(x+3)" } };
}
function evidence(id: string, at: number, variation: string, correct = true) {
  return { target: "C3-36d", kind: "verification", instance: id, variation, observedAt: at, correct,
    support: 0, firstValid: true, fresh: true, policy: Policy.VERSION, checker: "retention-test",
    component: correct ? "structured-work" : "miss-complete-factors", session: "s1", originSession: "s1" };
}
const stage = (state: any) => Mastery.evaluate(state).targets.find((row: any) => row.id === "C3-36d");

test("retention removes only redundant unselected work and preserves credited stage clocks", () => {
  const source = { session: "s1", receipts: [evidence("v1", 1, "a"), evidence("v2", 2, "b"), evidence("v3", 3, "c")],
    submissions: [work("v1", 1), work("v2", 2), work("v3", 3), work("practice", 4)], gaps: {}, seen36: [], retiredCount: 0 };
  const before = stage(source);
  assert.equal(before.stage, 50);
  const result = Retention.compact(source, { maxSubmissions: 3, maxReceipts: 192 });
  assert.equal(result.fit, true);
  assert.equal(result.retired, 1);
  assert.equal(result.mastery.retiredCount, 1);
  assert.deepEqual(result.mastery.submissions.map((row: any) => row.id), ["v1", "v2", "practice"]);
  assert.deepEqual([stage(result.mastery).stage, stage(result.mastery).stage50At], [before.stage, before.stage50At]);
  assert.equal(source.submissions.length, 4, "the caller retains its candidate on failure");
});

test("selected work is never retired and capacity admission fails closed", () => {
  const source = { receipts: [evidence("v1", 1, "a"), evidence("v2", 2, "b"), evidence("v3", 3, "c")],
    submissions: [work("v1", 1), work("v2", 2), work("v3", 3, true), work("practice", 4)], gaps: {}, retiredCount: 0 };
  const result = Retention.compact(source, { maxSubmissions: 3, maxReceipts: 192, fits: () => true });
  assert.equal(result.fit, false);
  assert.equal(result.retired, 0);
  assert.equal(result.mastery.submissions.find((row: any) => row.id === "v3").selected, true);
});

test("full-envelope admission includes the retirement disclosure overhead", () => {
  const source = { receipts: [], submissions: [work("old", 1), work("current", 2)], gaps: {}, retiredCount: 0 };
  const result = Retention.compact(source, { maxSubmissions: 2, maxReceipts: 192, fits: state => state.retiredCount === 1 });
  assert.equal(result.fit, true);
  assert.equal(result.retired, 1);
  assert.deepEqual(result.mastery.submissions.map((row: any) => row.id), ["current"]);
});

test("the latest two bounded misses remain available for gap confirmation", () => {
  const source = { receipts: [evidence("miss-one", 1, "a", false), evidence("miss-two", 2, "b", false)],
    submissions: [work("miss-one", 1), work("miss-two", 2), work("current", 3)], gaps: {}, retiredCount: 0 };
  const result = Retention.compact(source, { maxSubmissions: 2, maxReceipts: 192 });
  assert.equal(result.fit, false);
  assert.equal(result.retired, 0);
  assert.deepEqual(result.mastery.submissions.map((row: any) => row.id), ["miss-one", "miss-two", "current"]);
});

test("an assessed target does not disappear when its only check was supported", () => {
  const supported = { ...evidence("supported", 1, "a", false), support: 1 };
  const source = { receipts: [supported], submissions: [{ ...work("supported", 1), support: 1 }, work("current", 2)], gaps: {}, retiredCount: 0 };
  assert.equal(stage(source).assessed, true);
  const result = Retention.compact(source, { maxSubmissions: 1, maxReceipts: 192 });
  assert.equal(result.fit, false);
  assert.equal(result.retired, 0);
  assert.equal(stage(result.mastery).assessed, true);
});
