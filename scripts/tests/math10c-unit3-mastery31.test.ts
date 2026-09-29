import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const code = readFileSync("projects/math10c-unit3-pilot/workspace/assets/mastery-31.js", "utf8");
const module: { exports: any } = { exports: {} };
new Function("module", "exports", code)(module, module.exports);
const M31 = module.exports;
function load(name: string): any {
  const code = readFileSync(`projects/math10c-unit3-pilot/workspace/assets/${name}`, "utf8");
  const loaded: { exports: any } = { exports: {} };
  new Function("module", "exports", "require", code)(loaded, loaded.exports, (request: string) => load(request.replace("./", "")));
  return loaded.exports;
}
const State = load("state.js");
const Mastery = load("mastery.js");

function answer(row: any) {
  const p = M31.problem(row);
  return { "m31-prime-a": p.prime[0].join("*"), "m31-prime-b": p.prime[1].join("*"),
    ...(p.numbers.length === 3 ? { "m31-prime-c": p.prime[2].join("*") } : {}),
    "m31-gcf": String(p.gcf), "m31-lcm": String(p.lcm), "m31-method": p.method,
    "m31-value": String(p.value), "m31-counts": p.counts.join(",") };
}

test("all 3.1 tasks have exact, checker-accepted arithmetic and distinct instances", () => {
  assert.equal(M31.variants.length, 240);
  assert.equal(createHash("sha256").update(JSON.stringify(M31.variants)).digest("hex"), "4d5e2801e87acdf2a9cf9d586704850ec1a29edc7f8c4b847b3e51e61ba4e740", "saved task indices require explicit migration if the bank changes");
  const signatures = new Set<string>();
  for (const row of M31.variants) {
    const p = M31.problem(row);
    const signature = `${p.numbers.join(",")}|${p.context}`;
    assert.ok(!signatures.has(signature), signature);
    signatures.add(signature);
    assert.ok(p.prompt.length <= 160, p.prompt);
    assert.equal(p.numbers.length, row.role === "verification" ? 2 : 3);
    assert.equal(p.numbers.every((n: number, i: number) => p.value % n === 0 || n % p.value === 0), true);
    assert.deepEqual(Object.values(M31.check(row, answer(row)).correct), [true, true, true, true], signature);
    for (const [i, factors] of p.prime.entries()) assert.equal(factors.reduce((n: number, f: number) => n * f, 1), p.numbers[i]);
  }
});

test("the first two independent tasks vary both number structure and contextual decision", () => {
  const first = M31.problem(M31.variants[0]);
  const second = M31.problem(M31.variants[1]);
  for (const target of ["C3-31a", "C3-31b", "C3-31c", "C3-31d"])
    assert.notEqual(M31.variation(target, first), M31.variation(target, second), target);
  assert.equal(first.context, "packs");
  assert.equal(second.context, "signals");
});

test("prime order and exponent notation are equivalent, but composite factors are not prime factorization", () => {
  const row = M31.variants[0], values = answer(row);
  values["m31-prime-a"] = "3×2^3";
  values["m31-prime-b"] = "3^2 · 2^2";
  assert.equal(M31.check(row, values).correct["C3-31a"], true);
  values["m31-prime-a"] = "2³×3";
  values["m31-prime-b"] = "2²×3²";
  assert.equal(M31.check(row, values).correct["C3-31a"], true, "the in-course superscript buttons must produce accepted answers");
  values["m31-prime-a"] = "4*6";
  const wrong = M31.check(row, values);
  assert.equal(wrong.status, "checked");
  assert.equal(wrong.correct["C3-31a"], false);
  assert.equal(wrong.correct["C3-31b"], true);
});

test("choice and relationship counts must both fit the context", () => {
  const packs = M31.variants[0], values = answer(packs);
  values["m31-method"] = "LCM";
  assert.equal(M31.check(packs, values).correct["C3-31d"], false);
  values["m31-method"] = "GCF";
  values["m31-counts"] = "3,2";
  assert.equal(M31.check(packs, values).correct["C3-31d"], false);
  const signals = M31.variants[120], triple = answer(signals);
  triple["m31-counts"] = "1,1";
  assert.equal(M31.check(signals, triple).status, "input", "a three-quantity task needs three counts");
});

test("malformed notation is an entry repair, not a used mathematical attempt", () => {
  const row = M31.variants[0], values = answer(row);
  values["m31-prime-a"] = "2^x*3";
  assert.equal(M31.check(row, values).status, "input");
  values["m31-prime-a"] = "2*2*2*3";
  values["m31-gcf"] = "twelve";
  assert.equal(M31.check(row, values).status, "input");
});

test("3.1 selected working, seen variants, and active draft survive state migration", () => {
  const row = M31.variants[0], problem = M31.problem(row), values = answer(row);
  const work = { id: "m31-verification-v1", index: 0, mode: "verification", problem: problem.prompt, values, firstValues: {...values}, firstSupport: 0, firstWrongMask: 0, firstAt: 1_700_000_000_000, checks: 1, practiceCredit: 100,
    observedAt: 1_700_000_000_000, support: 0, fresh: true, firstValid: true, result: "4 of 4 components correct",
    repair: "none", policy: State.MASTERY_POLICY, checker: M31.VERSION, selected: true };
  const receipt = { target: "C3-31d", kind: "verification", instance: work.id, variation: M31.variation("C3-31d", problem),
    observedAt: work.observedAt, correct: true, support: 0, firstValid: true, fresh: true, policy: State.MASTERY_POLICY,
    checker: M31.VERSION, component: "structured-work", session: "s1", originSession: "s1" };
  const v = State.catalog("unit3-catalog-v05").contentVersion;
  const state = { v, rev: 1, route: "u3-31", r: {}, active: [], pos: 0, recent: [], pins: [], selectedTopic: "3.1",
    runMode: "independent", runSeed: 0, firsts: {}, drafts: {}, counts: {}, trig: {}, book: {}, reasons: {}, paper: {},
    done: [], notes: {}, exposed: [], seen: [], summary: { attempts: 0, correct: 0, supported: 0 }, skills: {},
    legacySummary: { attempts: 0, correct: 0, supported: 0 }, summaryRevision: 0,
    mastery: { session: "s1", receipts: [receipt], gaps: {}, seen36: [], seen31: [0, 120], submissions: [work],
      workshop31: { id: "m31-transfer-v121", index: 120, mode: "transfer", values: { "m31-prime-a": "2^2*3" }, fresh: true, support: 0 } } };
  const decoded = State.decode(State.encode(state), { pages: ["u3-31"], version: v });
  assert.deepEqual(decoded.mastery.submissions[0], work);
  assert.deepEqual(decoded.mastery.seen31, [0, 120]);
  assert.deepEqual(decoded.mastery.workshop31, state.mastery.workshop31);
  assert.equal(Mastery.evaluate(decoded.mastery).targets.find((target: any) => target.id === "C3-31d").stage, 25);
});
