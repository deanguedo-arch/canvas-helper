import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { runBiology30TopicModel, type TopicModel } from "../lib/biology30-course/v1/pilot2-models.js";

async function models() {
  const result = new Map<string, TopicModel>();
  for (const unit of ["b", "c", "d"]) {
    const base = `projects/resources/biology30-production/v1/units/unit-${unit}`;
    const input = JSON.parse(await readFile(`${base}/pilot2-models.json`, "utf8"));
    const state = JSON.parse(await readFile(`${base}/pilot2-state-schema.json`, "utf8"));
    for (const model of input.models) {
      assert.deepEqual(model.options, state.choices[model.id].values);
      assert.equal(model.requiredForCompletion, false);
      assert.equal(model.requiredForScore, false);
      result.set(model.id, model);
    }
  }
  return result;
}

test("all 27 cases reconstruct without mutating source data or silently accepting another option", async () => {
  let cases = 0;
  for (const model of (await models()).values()) {
    const before = JSON.stringify(model);
    for (const option of model.options) {
      const output = runBiology30TopicModel(model, option);
      assert.ok(output.rows.length && output.columns.length && output.limitation);
      assert.ok(output.rows.every(row => row.length === output.columns.length));
      assert.deepEqual(runBiology30TopicModel(JSON.parse(before), option), output);
      cases++;
    }
    assert.equal(JSON.stringify(model), before);
    assert.throws(() => runBiology30TopicModel(model, "unreviewed-option"), /Unknown/);
    const omitted = structuredClone(model); omitted.cases.pop();
    assert.throws(() => runBiology30TopicModel(omitted, model.options[0]), /inventory drift/);
  }
  assert.equal(cases, 27);
});

test("B outputs keep hormone scales, within-stage denominators and production versus transport distinct", async () => {
  const data = await models();
  const output = (id: string, choice: string) => runBiology30TopicModel(data.get(id)!, choice);
  const duct = output("b-model-signal-pathway", "duct-obstruction");
  assert.deepEqual(duct.rows.map(row => row[2]), ["present", "present", "present", "blocked"]);
  const cycle = output("b-model-cycle-sequence", "days-12-to-21");
  assert.deepEqual(cycle.rows.map(row => row[0]), [12, 14, 21]);
  assert.equal(cycle.values.separateHormoneScales, true);
  assert.deepEqual(cycle.values.differences, [-1, -4, -4, 9]);
  assert.ok(Math.abs(Number(output("b-model-development-timing", "early").values.difference) - 0.4) < 1e-12);
  assert.ok(Math.abs(Number(output("b-model-development-timing", "later").values.difference) - 0.1) < 1e-12);
});

test("C outputs preserve daughter-cell boundaries, cross probabilities and translation stops", async () => {
  const data = await models();
  const counts = runBiology30TopicModel(data.get("c-model-chromosome-counts")!, "46");
  assert.deepEqual(counts.rows.map(row => row.slice(1)), [[46, 46, 2], [46, 92, 2], [23, 46, 1], [23, 23, 1]]);
  const crosses = data.get("c-model-inheritance-cross")!;
  assert.deepEqual(runBiology30TopicModel(crosses, "AA-aa").values.probabilities, { AA: 0, Aa: 1, aa: 0 });
  assert.deepEqual(runBiology30TopicModel(crosses, "Aa-Aa").values.probabilities, { AA: 0.25, Aa: 0.5, aa: 0.25 });
  assert.deepEqual(runBiology30TopicModel(crosses, "Aa-aa").values.probabilities, { AA: 0, Aa: 0.5, aa: 0.5 });
  const sequence = data.get("c-model-sequence-expression")!;
  for (const choice of ["reference", "synonymous"]) {
    const output = runBiology30TopicModel(sequence, choice);
    assert.deepEqual(output.values.peptide, ["Met", "Glu", "Phe"]);
    assert.equal(output.values.stopIndex, 9);
  }
  const insertion = runBiology30TopicModel(sequence, "one-base-insertion");
  assert.deepEqual(insertion.values.peptide, ["Met", "Arg", "Ile", "Leu"]);
  assert.equal(insertion.values.trailingBases, "A");
  assert.equal(insertion.values.stopIndex, null);
});

test("D outputs distinguish observed counts, expectations, density and per-initial-individual rates", async () => {
  const data = await models();
  const genePool = runBiology30TopicModel(data.get("d-model-gene-pool")!, "45-45-10");
  assert.equal(genePool.values.p, 0.675);
  assert.equal(genePool.values.alleleCopies, 200);
  assert.equal(genePool.rows[0][2], 0.45);
  assert.ok(Math.abs(Number(genePool.rows[0][3]) - 0.455625) < 1e-12);
  const model = data.get("d-model-population-balance")!;
  const base = runBiology30TopicModel(model, "baseline");
  assert.equal(base.values.final, 1060);
  assert.equal(base.values.finalDensity, 5.3);
  assert.equal(base.values.absolutePerTime, 6);
  assert.equal(base.values.perInitialIndividualOverInterval, 0.06);
  assert.equal(base.values.averagePerInitialIndividualPerTime, 0.006);
  assert.equal(runBiology30TopicModel(model, "higher-immigration").values.final, 1120);
  assert.equal(runBiology30TopicModel(model, "higher-mortality").values.final, 980);
  const competition = data.get("d-model-competition")!;
  assert.deepEqual(competition.options.map(choice => runBiology30TopicModel(competition, choice).values.mean), [4, 3, 2.4]);
});

test("model audit rejects drift in shared investigation observations and optional-state contracts", async () => {
  const { validateBiology30Models } = await import("../lib/biology30-course/v1/pilot2-model-audit.js");
  for (const unit of ["b", "c", "d"]) {
    const base = `projects/resources/biology30-production/v1/units/unit-${unit}`;
    const read = async (name: string) => JSON.parse(await readFile(`${base}/pilot2-${name}.json`, "utf8"));
    const [contract, input, investigations, state] = await Promise.all(["contract", "models", "investigations", "state-schema"].map(read));
    const result = validateBiology30Models(contract, input, investigations, state);
    assert.equal(result.models, 3); assert.ok(result.sharedDataBindings > 0);
    const changed = structuredClone(input);
    const model = changed.models.find((entry: any) => entry.sourceBindings?.length);
    const keys = model.sourceBindings[0].modelPath;
    let target = model;
    for (const key of keys.slice(0, -1)) target = target[key];
    target[keys.at(-1)] = "changed observation";
    assert.throws(() => validateBiology30Models(contract, changed, investigations, state), /data drift/);
    const gated = structuredClone(input); gated.models[0].requiredForCompletion = true;
    assert.throws(() => validateBiology30Models(contract, gated, investigations, state), /teaching\/state drift/);
    const absent = structuredClone(input); absent.models.find((entry: any) => entry.sourceBindings?.length).sourceInvestigationId = "missing";
    assert.throws(() => validateBiology30Models(contract, absent, investigations, state), /Unresolved/);
  }
});
