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
const M36 = load("mastery-36.js");
const Contracts = load("contracts.js");
const State = load("state.js");
const Mastery = load("mastery.js");

test("every bounded 3.6 variant has a checker-accepted complete factorization", () => {
  assert.equal(M36.variants.length, 240);
  const seen = new Set<string>();
  for (const tuple of M36.variants) {
    const p = M36.problem(tuple);
    assert.equal(Contracts.check(p.factor, { mode: "factor", contract: "unit-polynomial-v1", answer: p.factor }).status, "correct", p.poly);
    assert.ok(!seen.has(p.poly), `duplicate polynomial ${p.poly}`);
    seen.add(p.poly);
  }
});

test("delayed item extracts the whole GCF and checks its complete primitive factors", () => {
  const p = M36.problem(M36.variants[11]);
  assert.equal(p.poly, "36x^2+6x-6");
  assert.deepEqual([p.g, p.a, p.b, p.c], [6, 6, 1, -1]);
  assert.equal(p.factor, "6*(3x-1)(2x+1)");
});

test("unchanged identities cannot count as a useful middle-term split", () => {
  const p = M36.problem(M36.variants[0]);
  assert.notEqual(M36.middleSplit(`${p.poly}=${p.poly}`, p).status, "intermediate");
  assert.notEqual(M36.middleSplit(`${p.poly}=2x^2+7x+0x+3`, { g: 1, a: 2, b: 7, c: 3, poly: "2x^2+7x+3" }).status, "intermediate");
  assert.equal(M36.middleSplit("2x^2+7x+3=2x^2+6x+x+3", { g: 1, a: 2, b: 7, c: 3, poly: "2x^2+7x+3" }).status, "intermediate");
  assert.equal(M36.middleSplit("2x²+7x+3=2x²+6x+x+3", { g: 1, a: 2, b: 7, c: 3, poly: "2x^2+7x+3" }).status, "intermediate", "the in-course squared button must preserve a useful split");
});

test("3.6 variation names distinguish structure rather than display IDs", () => {
  const primitive = M36.problem([2, 1, 1, 3]);
  const sameShape = M36.problem([3, 1, 1, 3]);
  const wholeGcf = M36.problem([3, -1, 4, 2, 3]);
  assert.equal(M36.variation("C3-36a", primitive), M36.variation("C3-36a", sameShape));
  assert.notEqual(M36.variation("C3-36a", primitive), M36.variation("C3-36a", wholeGcf));
  assert.notEqual(M36.variation("C3-36b", primitive), M36.variation("C3-36b", wholeGcf));
});

test("retained 3.6 submission and policy receipt round-trip without dropping working", () => {
  const record = {
    id: "m36-verification-v12", index: 11, mode: "verification", problem: "36x^2+6x-6",
    values: { "m36-g": "6", "m36-a": "6", "m36-b": "1", "m36-c": "-1", "m36-m": "-3", "m36-n": "4", "m36-split": "36x^2+6x-6=6(6x^2-3x+4x-1)", "m36-factor": "6(3x-1)(2x+1)", "m36-expand": "36x^2+6x-6" },
    firstValues: { "m36-g": "6", "m36-a": "6", "m36-b": "1", "m36-c": "-1", "m36-m": "-3", "m36-n": "4", "m36-split": "36x^2+6x-6=6(6x^2-3x+4x-1)", "m36-factor": "6(3x-1)(2x+1)", "m36-expand": "36x^2+6x-6" }, firstSupport: 0, firstWrongMask: 0, firstAt: 1_700_000_000_000, checks: 1, practiceCredit: 100,
    observedAt: 1_700_000_000_000, support: 0, fresh: true, firstValid: true, result: "4 of 4 components correct", repair: "none", policy: State.MASTERY_POLICY, checker: M36.VERSION, selected: true,
  };
  const mastery = State.validateMastery({ session: "s1", receipts: [{ target: "C3-36d", kind: "verification", instance: record.id, variation: "whole-gcf-opposite-signs", observedAt: record.observedAt, correct: true, support: 0, firstValid: true, fresh: true, policy: State.MASTERY_POLICY, checker: M36.VERSION, component: "structured-work", session: "s1", originSession: "" }], gaps: {}, seen36: [11], submissions: [record], retiredCount: 7 });
  const state = {
    v: State.catalog("unit3-catalog-v05").contentVersion, rev: 1, route: "u3-36", r: {}, active: [], pos: 0, recent: [], pins: [],
    selectedTopic: "3.6", runMode: "independent", runSeed: 0, firsts: {}, drafts: {}, counts: {}, trig: {}, book: {},
    reasons: {}, paper: {}, done: [], notes: {}, exposed: [], seen: [], summary: { attempts: 0, correct: 0, supported: 0 },
    skills: {}, legacySummary: { attempts: 0, correct: 0, supported: 0 }, summaryRevision: 0, mastery,
  };
  const decoded = State.decode(State.encode(state), { pages: ["u3-36"], version: state.v });
  assert.deepEqual(decoded.mastery.submissions[0], record);
  assert.equal(decoded.mastery.retiredCount, 7);
  const savedSix = State.encode(state);
  savedSix.format = "unit3-state-6";
  delete savedSix.mastery.seen31;
  const fromSix = State.decode(savedSix, { pages: ["u3-36"], version: state.v });
  assert.deepEqual(fromSix.mastery.submissions[0], record);
  assert.deepEqual(fromSix.mastery.seen31, []);
  assert.equal(decoded.mastery.receipts[0].policy, State.MASTERY_POLICY);
  assert.equal(Mastery.evaluate(decoded.mastery).targets.find((t: any) => t.id === "C3-36d").stage, 25);
  const missingWork = structuredClone(decoded.mastery);
  missingWork.submissions = [];
  assert.equal(Mastery.evaluate(missingWork).targets.find((t: any) => t.id === "C3-36d").stage, 0);
  const previousShape = State.encode(state);
  previousShape.format = "unit3-state-5";
  delete previousShape.mastery.retiredCount;
  previousShape.mastery.submissions[0].pop();
  const meta = previousShape.mastery.meta;
  previousShape.mastery.receipts = previousShape.mastery.receipts.map((row: any[]) => row.map((value: any, index: number) => index >= 8 ? meta[value] : value));
  previousShape.mastery.submissions = [{ ...record, selected: undefined }];
  delete previousShape.mastery.submissions[0].selected;
  delete previousShape.mastery.meta;
  const oldDecoded = State.decode(previousShape, { pages: ["u3-36"], version: state.v });
  assert.deepEqual(oldDecoded.mastery.submissions[0], previousShape.mastery.submissions[0]);
  assert.equal(oldDecoded.mastery.retiredCount, 0);
  assert.equal(oldDecoded.mastery.receipts[0].policy, State.MASTERY_POLICY);
  state.mastery.receipts[0].source = "p36-0";
  state.mastery.receipts[0].raw = "(2x+1)(x+3)";
  const answerDecoded = State.decode(State.encode(state), { pages: ["u3-36"], version: state.v });
  assert.equal(answerDecoded.mastery.receipts[0].source, "p36-0");
  assert.equal(answerDecoded.mastery.receipts[0].raw, "(2x+1)(x+3)");
});
