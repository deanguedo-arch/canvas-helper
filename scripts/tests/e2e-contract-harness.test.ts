import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { validateProjectContract, type ProjectE2EContract } from "../../e2e/lib/project-contract-schema.js";
import { assertNonEmptyCertificationTargets, assertTextChanged } from "../../e2e/lib/contract-assertions.js";

const FIXTURE_ROOT = path.join(process.cwd(), "scripts", "tests", "fixtures", "e2e-contracts");

async function loadFixture(name: string) {
  const raw = await readFile(path.join(FIXTURE_ROOT, name), "utf8");
  return JSON.parse(raw) as unknown;
}

test("validateProjectContract rejects unknown check names", async () => {
  const contract = await loadFixture("invalid-unknown-check.json");
  assert.throws(
    () => validateProjectContract(contract, "invalid-unknown-check.json"),
    /Invalid e2e contract/
  );
});

test("validateProjectContract rejects extra properties", async () => {
  const contract = await loadFixture("invalid-extra-property.json");
  assert.throws(
    () => validateProjectContract(contract, "invalid-extra-property.json"),
    /Invalid e2e contract/
  );
});

test("validateProjectContract rejects invalid mode enums", async () => {
  const contract = await loadFixture("invalid-mode.json");
  assert.throws(
    () => validateProjectContract(contract, "invalid-mode.json"),
    /Invalid e2e contract/
  );
});

test("validateProjectContract rejects empty deep contracts when required", async () => {
  const contract = await loadFixture("invalid-empty-deep.json");
  assert.throws(
    () => validateProjectContract(contract, "invalid-empty-deep.json", { requireDeepTargets: true }),
    /deep contract has no modulePassTargets, visibilityChecks, or enabled learnerCourse routes/
  );
});

test("validateProjectContract rejects missing assertion profiles", async () => {
  const contract = await loadFixture("invalid-bad-assertion-profile.json");
  assert.throws(
    () => validateProjectContract(contract, "invalid-bad-assertion-profile.json"),
    /assertionProfile/
  );
});

test("assertNonEmptyCertificationTargets throws on empty targets", () => {
  const contract = { projectSlug: "fixture-empty" } as ProjectE2EContract;
  assert.throws(() => assertNonEmptyCertificationTargets(contract), /Deep contract is empty/);
});

test("assertTextChanged throws when text does not change", () => {
  assert.throws(() => assertTextChanged("Indicator", "same", "same"), /stayed the same/);
});
