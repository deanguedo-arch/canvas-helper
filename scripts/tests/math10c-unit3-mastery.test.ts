import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ROOT = "projects/math10c-unit3-pilot/workspace/assets";
function load(name: string): any {
  const code = readFileSync(`${ROOT}/${name}`, "utf8");
  const module: { exports: any } = { exports: {} };
  const req = (request: string) => load(request.replace("./", ""));
  new Function("module", "exports", "require", code)(module, module.exports, req);
  return module.exports;
}
const Policy = load("mastery-policy.js");
const Mastery = load("mastery.js");
const HistoricalPolicy = load("mastery-history-policy.js");
const HistoricalMastery = load("mastery-history.js");
const State = load("state.js");
const target = "C3-36d";
const base = { target, firstValid: true, fresh: true, support: 0, policy: Policy.VERSION, checker: "unit-test", component: "structured-work" };
const receipt = (kind: string, instance: string, variation: string, observedAt: number, correct = true, extra: any = {}) => ({ ...base, kind, instance, variation, observedAt, correct, session: "s1", ...extra });
function evaluate(state: any): any {
  const receipts = (state.receipts || []).map((r: any) => r.component === "final-answer" ? { source: "p36-0", raw: "(2x+1)(x+3)", ...r } : r);
  const submissions = state.submissions || receipts.filter((r: any) => r.component !== "final-answer").map((r: any) => ({
    id: r.kind === "reasoning" && r.instance.endsWith("-reason") ? r.instance.slice(0, -7) : r.instance,
    mode: r.kind === "reasoning" ? "transfer" : r.kind, problem: "2x^2+7x+3", values: { "m36-factor": "(2x+1)(x+3)" }, observedAt: r.observedAt,
    policy: r.policy, checker: r.checker, fresh: r.fresh, firstValid: r.firstValid, support: r.support, checks: 1, firstSupport: 0, firstWrongMask: 0, firstValues: { 'm36-factor': '(2x+1)(x+3)' },
  }));
  return Mastery.evaluate({ ...state, receipts, submissions });
}

test("policy has a fixed denominator of 32 essential targets", () => {
  assert.equal(Policy.TARGETS.length, 32);
  assert.equal(new Set(Policy.TARGETS.map((t: any) => t.id)).size, 32);
  assert.ok(Policy.TARGETS.every((t: any) => t.essential));
});

test("question mapping credits only the mathematical target actually observed", () => {
  assert.equal(Policy.targetFor({ id: "p31-0", lesson: "3.1" }), "C3-31b");
  assert.equal(Policy.targetFor({ id: "p31-1", lesson: "3.1" }), "C3-31c");
  assert.equal(Policy.targetFor({ id: "p31-2", lesson: "3.1" }), "C3-31a");
  assert.equal(Policy.targetFor({ id: "p36-4", lesson: "3.6" }), "C3-36d");
  assert.equal(Policy.targetFor({ id: "p34-4", lesson: "3.4" }), null, "plain expansion does not prove an area-model target");
  assert.equal(Policy.targetFor({ id: "c36", lesson: "3.6" }), null, "fixed lesson completion is not fresh verification");
  assert.equal(Policy.targetFor({ id: "gen-common-2_3_2", lesson: "3.3", family: "common" }), "C3-33b");
});

test("fixed lesson and review checks guide the related skill without automatically crediting it", () => {
  assert.equal(Policy.observedTargetFor({ id: "g321", lesson: "3.2" }), "C3-32c");
  assert.equal(Policy.observedTargetFor({ id: "e302", lesson: "3.5" }), "C3-35d");
  assert.equal(Policy.observedTargetFor({ id: "c37", lesson: "3.7" }), "C3-37c");
  assert.equal(Policy.targetFor({ id: "g321", lesson: "3.2" }), null);
  assert.equal(Policy.targetFor({ id: "e302", lesson: "3.5" }), null);
});

test("ordinary practice row numbers do not masquerade as mathematical variation", () => {
  const first = Policy.variationFor({ id: "p31-0", lesson: "3.1" });
  const second = Policy.variationFor({ id: "p31-3", lesson: "3.1" });
  assert.equal(first, second);
  const rows = [receipt("verification", "one", first, 1), receipt("verification", "two", second, 2)];
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 25);
});

test("answer-only practice cannot combine with one constructed task to claim consistent independence", () => {
  const rows = [receipt("verification", "practice", "practice-answer-only", 1, true, { component: "final-answer" }), receipt("verification", "constructed", "whole-gcf", 2, true, { component: "structured-work" })];
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 25);
  rows.push(receipt("verification", "constructed-two", "primitive", 3, true, { component: "structured-work" }));
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 50);
});

test("unclassified answer receipts cannot masquerade as constructed work", () => {
  const rows = [receipt("verification", "first", "form-one", 1, true, { component: "answer" }), receipt("verification", "second", "form-two", 2, true, { component: "answer" })];
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 0);
});

test("constructed mastery credit requires the original problem and actual saved work", () => {
  const row = receipt("verification", "m36-verification-v1", "whole-gcf", 1);
  assert.equal(Mastery.evaluate({ receipts: [row], submissions: [] }).targets.find((t: any) => t.id === target).stage, 0);
  assert.equal(evaluate({ receipts: [row] }).targets.find((t: any) => t.id === target).stage, 25);
  assert.equal(evaluate({ receipts: [row], submissions: [{ id: row.instance, mode: "verification", problem: row.instance, values: {}, observedAt: row.observedAt, policy: row.policy, checker: row.checker, fresh: true, firstValid: true, support: 0 }] }).targets.find((t: any) => t.id === target).stage, 0);
  const stale = { id: row.instance, mode: "verification", problem: "2x^2+7x+3", values: { "m36-factor": "(2x+1)(x+3)" }, observedAt: row.observedAt + 1, policy: row.policy, checker: row.checker, fresh: true, firstValid: true, support: 0 };
  assert.equal(evaluate({ receipts: [row], submissions: [stale] }).targets.find((t: any) => t.id === target).stage, 0);
});

test("support and completion-like records never award mastery", () => {
  const rows = [receipt("verification", "a", "v1", 1, true, { support: 1 }), { ...base, kind: "completion", instance: "b", variation: "v2", observedAt: 2, correct: true }];
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 0);
});

test("state 13 evidence retains its old score as history without silently becoming independent evidence", () => {
  const oldWork = { id: "m36-verification-v1", index: 0, mode: "verification", problem: "2x^2+7x+3", values: { "m36-factor": "(2x+1)(x+3)" }, observedAt: 1_700_000_000_000, support: 1, fresh: true, firstValid: true, checks: 1, result: "4 of 4 components correct", repair: "none", policy: HistoricalPolicy.VERSION, checker: "m36-contract-3" };
  const oldReceipt = { target, kind: "verification", instance: oldWork.id, variation: "whole-gcf", observedAt: oldWork.observedAt, correct: true, support: 1, firstValid: true, fresh: true, policy: HistoricalPolicy.VERSION, checker: oldWork.checker, component: "structured-work", session: "s1", originSession: "s1" };
  const old = State.validateMastery({ session: "s1", receipts: [oldReceipt], submissions: [oldWork], gaps: {} });
  assert.equal(HistoricalMastery.evaluate(old).targets.find((row: any) => row.id === target).stage, 25);
  assert.equal(Mastery.evaluate(old).targets.find((row: any) => row.id === target).stage, 0);
  const historical = HistoricalMastery.evaluate(old);
  const snapshot = { score: historical.score, stages: historical.targets.map((row: any) => row.stage), marks: historical.targets.map((row: any) => row.marks), gaps: historical.targets.map(() => 0), policy: HistoricalPolicy.VERSION };
  const retained = State.validateMastery({ ...old, historical: snapshot });
  assert.deepEqual(retained.historical, snapshot);
  assert.deepEqual(retained.submissions[0].values, oldWork.values);
  assert.equal(retained.submissions[0].firstValues, undefined, "unknown first working is not invented");
});

test("independent evidence advances through 25, 50, 75 and delayed 100", () => {
  const rows = [receipt("verification", "a", "v1", 1), receipt("verification", "b", "v2", 2)];
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 50);
  rows.push(receipt("transfer", "c", "application", 3), receipt("reasoning", "c-reason", "constructed", 4));
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 75);
  rows.push(receipt("retention", "d", "delayed", 4 + Policy.RETENTION_MS, true, { session: "s2", originSession: "s1" }));
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 100);
});

test("transfer and reasoning must belong to the same new question and session", () => {
  const verified = [receipt("verification", "a", "v1", 1), receipt("verification", "b", "v2", 2)];
  const mismatched = [...verified, receipt("transfer", "c", "changed-form", 3), receipt("reasoning", "d-reason", "relationship", 4)];
  assert.equal(evaluate({ receipts: mismatched }).targets.find((t: any) => t.id === target).stage, 50);
  const wrongSession = [...verified, receipt("transfer", "c", "changed-form", 3), receipt("reasoning", "c-reason", "relationship", 4, true, { session: "s2" })];
  assert.equal(evaluate({ receipts: wrongSession }).targets.find((t: any) => t.id === target).stage, 50);
  const reused = [...verified, receipt("transfer", "b", "changed-form", 3), receipt("reasoning", "b-reason", "relationship", 4)];
  assert.equal(evaluate({ receipts: reused }).targets.find((t: any) => t.id === target).stage, 50);
});

test("a successful later verification does not erase earlier transfer and retention", () => {
  const rows = [receipt("verification", "a", "v1", 1), receipt("verification", "b", "v2", 2), receipt("transfer", "c", "changed-form", 3), receipt("reasoning", "c-reason", "relationship", 4), receipt("retention", "d", "delayed", 4 + Policy.RETENTION_MS, true, { session: "s2", originSession: "s1" })];
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 100);
  rows.push(receipt("verification", "e", "v1", 5 + Policy.RETENTION_MS));
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 100);
});

test("an early or same-session revisit does not award retention", () => {
  const rows = [receipt("verification", "a", "v1", 1), receipt("verification", "b", "v2", 2), receipt("transfer", "c", "application", 3), receipt("reasoning", "c-reason", "constructed", 4), receipt("retention", "d", "delayed", 5, true, { session: "s1", originSession: "s1" })];
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 75);
});

test("retention must reference the session that produced transfer evidence", () => {
  const rows = [receipt("verification", "a", "v1", 1), receipt("verification", "b", "v2", 2), receipt("transfer", "c", "changed-form", 3), receipt("reasoning", "c-reason", "relationship", 4), receipt("retention", "d", "delayed", 4 + Policy.RETENTION_MS, true, { session: "s3", originSession: "another-session" })];
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 75);
  rows[4] = { ...rows[4], originSession: "s1" };
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 100);
});

test("a repeated mathematical instance cannot supply the second verification", () => {
  const rows = [receipt("verification", "a", "positive-pair", 1), receipt("verification", "a", "opposite-signs", 2)];
  assert.equal(evaluate({ receipts: rows }).targets.find((t: any) => t.id === target).stage, 25);
});

test("unresolved fresh recheck prevents a displayed 100", () => {
  const rows = [receipt("verification", "a", "v1", 1), receipt("verification", "b", "v2", 2), receipt("transfer", "c", "changed-form", 3), receipt("reasoning", "c-reason", "constructed", 4), receipt("retention", "d", "delayed", 4 + Policy.RETENTION_MS, true, { session: "s2", originSession: "s1" }), receipt("verification", "e", "v3", 5 + Policy.RETENTION_MS, false)];
  const result = evaluate({ receipts: rows }).targets.find((t: any) => t.id === target);
  assert.equal(result.stage, 75);
  assert.equal(result.pendingRecheck, true);
});

test("one later slip preserves attained stage and opens a recheck", () => {
  const rows = [receipt("verification", "a", "v1", 1), receipt("verification", "b", "v2", 2), receipt("verification", "c", "v3", 3, false)];
  const result = evaluate({ receipts: rows }).targets.find((t: any) => t.id === target);
  assert.equal(result.stage, 50);
  assert.equal(result.pendingRecheck, true);
});

test("a confirmed gap needs two different fresh instances with the same bounded signal", () => {
  const one = receipt("verification", "wrong-one", "v1", 20, false, { component: "miss-whole-gcf" });
  const another = receipt("verification", "wrong-two", "v2", 21, false, { component: "miss-whole-gcf" });
  assert.equal(Mastery.repeatedBoundedSignal([one, another]), true);
  assert.equal(Mastery.repeatedBoundedSignal([one, { ...another, component: "miss-primitive-coeff" }]), false);
  assert.equal(Mastery.repeatedBoundedSignal([one, { ...another, instance: "wrong-one" }]), false);
  assert.equal(Mastery.repeatedBoundedSignal([one, { ...another, support: 1 }]), false);
  assert.equal(Mastery.repeatedBoundedSignal([one, { ...another, component: "answer" }]), false);
});

test("confirmed gaps cap only the affected stage", () => {
  const rows = [receipt("verification", "a", "v1", 1), receipt("verification", "b", "v2", 2), receipt("transfer", "c", "application", 3), receipt("reasoning", "c-reason", "constructed", 4), receipt("retention", "d", "delayed", 4 + Policy.RETENTION_MS, true, { session: "s2", originSession: "s1" })];
  assert.equal(evaluate({ receipts: rows, gaps: { [target]: { confirmed: true, kind: "retention" } } }).targets.find((t: any) => t.id === target).stage, 75);
  assert.equal(evaluate({ receipts: rows, gaps: { [target]: { confirmed: true, kind: "reasoning" } } }).targets.find((t: any) => t.id === target).stage, 50);
  assert.equal(evaluate({ receipts: rows, gaps: { [target]: { confirmed: true, kind: "execution" } } }).targets.find((t: any) => t.id === target).stage, 25);
});

test("post-gap evidence can re-establish a reopened stage", () => {
  const original = [receipt("verification", "a", "v1", 1), receipt("verification", "b", "v2", 2), receipt("transfer", "c", "application", 3), receipt("reasoning", "c-reason", "constructed", 4)];
  const repaired = [...original, receipt("verification", "d", "v3", 11), receipt("verification", "e", "v4", 12), receipt("transfer", "f", "application-2", 13), receipt("reasoning", "f-reason", "constructed-2", 14)];
  const execution = evaluate({ receipts: repaired, gaps: { [target]: { confirmed: true, kind: "execution", observedAt: 10 } } }).targets.find((t: any) => t.id === target);
  assert.equal(execution.stage, 75);
  assert.equal(execution.confirmedGap, null);
  const reasoning = evaluate({ receipts: repaired, gaps: { [target]: { confirmed: true, kind: "reasoning", observedAt: 10 } } }).targets.find((t: any) => t.id === target);
  assert.equal(reasoning.stage, 75);
  assert.equal(reasoning.confirmedGap, null);
});

test("a reasoning gap is repaired by new transfer and constructed reasoning without repeating sound verification", () => {
  const rows = [receipt("verification", "a", "v1", 1), receipt("verification", "b", "v2", 2), receipt("transfer", "c", "application", 3), receipt("reasoning", "c-reason", "constructed", 4), receipt("transfer", "d", "changed-form", 11), receipt("reasoning", "d-reason", "new-relationship", 12)];
  const result = evaluate({ receipts: rows, gaps: { [target]: { confirmed: true, kind: "reasoning", observedAt: 10 } } }).targets.find((t: any) => t.id === target);
  assert.equal(result.stage, 75);
  assert.equal(result.confirmedGap, null);
  assert.equal(result.stage75At, 12);
});

test("chapter score always uses all 32 targets", () => {
  const one = evaluate({ receipts: [receipt("verification", "a", "v1", 1)] });
  assert.equal(one.score, Number((25 / 32).toFixed(1)));
  assert.equal(one.readiness, "building");
});
