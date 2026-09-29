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
const State = load("state.js");
const Mastery = load("mastery.js");
const Policy = load("mastery-policy.js");

function evidence(checks: number, support = 0, includeNewRule = true): any {
  const work = { id: "m31-verification-v1", index: 0, mode: "verification", problem: "Counters: 24, 36", values: { "m31-gcf": "12" },
    observedAt: 1_700_000_000_000, support, fresh: true, firstValid: true, result: "4 of 4 components correct",
    repair: "none", policy: Policy.VERSION, checker: "m31-contract-1", firstValues: { "m31-gcf": "12" }, firstSupport: support, firstWrongMask: 0, practiceCredit: 125 - 25 * Math.min(4, checks + Number(Boolean(support))), ...(includeNewRule ? { checks } : {}) };
  const receipt = { target: "C3-31b", kind: "verification", instance: work.id, variation: "shared-factors",
    observedAt: work.observedAt, correct: true, support, firstValid: true, fresh: true, policy: Policy.VERSION,
    checker: work.checker, component: "structured-work", session: "s1", originSession: "s1" };
  return { session: "s1", receipts: [receipt], gaps: {}, submissions: [work] };
}

test("four check positions earn declining practice credit; only a fresh first unaided check earns mastery", () => {
  for (const [checks, credit] of [[1, 100], [2, 75], [3, 50], [4, 25]]) {
    const state = evidence(checks), target = Mastery.evaluate(state).targets.find((row: any) => row.id === "C3-31b");
    assert.equal(state.submissions[0].practiceCredit, credit);
    assert.equal(target.stage, checks === 1 ? 25 : 0);
    assert.equal(target.marks, checks === 1 ? 25 : 0);
  }
});

test("a method hint lowers practice credit one step without establishing independent mastery", () => {
  assert.equal(evidence(1, 1).submissions[0].practiceCredit, 75);
  assert.equal(evidence(2, 1).submissions[0].practiceCredit, 50);
  assert.equal(Mastery.evaluate(evidence(1, 1)).targets.find((row: any) => row.id === "C3-31b").stage, 0);
  assert.equal(Mastery.evaluate(evidence(2, 1)).targets.find((row: any) => row.id === "C3-31b").stage, 0);
  assert.equal(Mastery.evaluate(evidence(1, 1, false)).targets.find((row: any) => row.id === "C3-31b").stage, 0);
});

test("fresh first-check work still needs transfer and 48-hour retention for higher stages", () => {
  const start = 1_700_000_000_000;
  const rows = [
    { id: "m31-verification-v1", mode: "verification", variation: "shared-factors", checks: 1, at: start, session: "s1" },
    { id: "m31-verification-v2", mode: "verification", variation: "coprime", checks: 1, at: start + 1, session: "s1" },
    { id: "m31-transfer-v3", mode: "transfer", variation: "packs", checks: 1, at: start + 2, session: "s1" },
    { id: "m31-retention-v4", mode: "retention", variation: "signals", checks: 1, at: start + 2 + Policy.RETENTION_MS, session: "s2" },
  ];
  const submissions = rows.map(row => ({ id: row.id, index: 0, mode: row.mode, problem: "Counters: 24, 36", values: { "m31-gcf": "12" },
    observedAt: row.at, support: 0, fresh: true, firstValid: true, result: "4 of 4 components correct", repair: "none",
    policy: Policy.VERSION, checker: "m31-contract-1", checks: row.checks, firstValues: { "m31-gcf": "12" }, firstSupport: 0, firstWrongMask: 0 }));
  const receipts = rows.flatMap(row => [row.mode, ...(row.mode === "transfer" ? ["reasoning"] : [])].map(kind => ({
    target: "C3-31b", kind, instance: kind === "reasoning" ? row.id + "-reason" : row.id, variation: row.variation,
    observedAt: row.at, correct: true, support: 0, firstValid: true, fresh: true, policy: Policy.VERSION,
    checker: "m31-contract-1", component: kind === "verification" ? "structured-work" : "whole-task-and-relationship",
    session: row.session, originSession: row.mode === "retention" ? "s1" : row.session,
  })));
  const target = Mastery.evaluate({ receipts, submissions }).targets.find((row: any) => row.id === "C3-31b");
  assert.equal(target.stage, 100);
  assert.equal(target.marks, 100);
});

test("unfinished check count and final check count survive state 14 encoding", () => {
  const mastery = evidence(3, 1);
  mastery.workshop31 = { id: "m31-verification-v2", index: 1, mode: "verification", values: { "m31-gcf": "9" }, fresh: true, support: 1, checks: 2, wrongMask: 2 };
  const v = State.catalog("unit3-catalog-v05").contentVersion;
  const state = { v, rev: 1, route: "u3-31", r: {}, active: [], pos: 0, recent: [], pins: [], selectedTopic: "3.1",
    runMode: "independent", runSeed: 0, firsts: {}, drafts: {}, counts: {}, trig: {}, book: {}, reasons: {}, paper: {},
    done: [], notes: {}, exposed: [], seen: [], summary: { attempts: 0, correct: 0, supported: 0 }, skills: {},
    legacySummary: { attempts: 0, correct: 0, supported: 0 }, summaryRevision: 0, mastery };
  const packed = State.encode(state);
  assert.equal(packed.format, "unit3-state-14");
  const restored = State.decode(packed, { pages: ["u3-31"], version: v });
  assert.equal(restored.mastery.workshop31.checks, 2);
  assert.equal(restored.mastery.workshop31.wrongMask, 2);
  assert.equal(restored.mastery.submissions[0].checks, 3);
  assert.equal(Mastery.evaluate(restored.mastery).targets.find((row: any) => row.id === "C3-31b").marks, 0);
});
