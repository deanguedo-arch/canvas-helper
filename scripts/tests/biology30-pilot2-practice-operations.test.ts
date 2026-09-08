import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { validateBiology30PracticeOperations } from "../lib/biology30-course/v1/pilot2-practice-operations.js";

test("required operation links reject foundation/challenge laundering and stale component mappings", async () => {
  let total = 0;
  for (const unit of ["b", "c", "d"]) {
    const load = async (name: string) => JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${unit}/pilot2-${name}.json`, "utf8"));
    const academic = await load("academic-contract"), practice = await load("practice");
    total += validateBiology30PracticeOperations(academic, practice).reviewedItems;
    for (const predicate of [(item: any) => item.componentEvidenceRole === "prerequisite-only", (item: any) => item.role === "challenge"]) {
      const nonRequired = practice.items.find(predicate);
      assert.ok(nonRequired);
      const inflated = structuredClone(academic);
      inflated.components.find((component: any) => component.id === nonRequired.componentIds[0]).requiredPracticeIds.push(nonRequired.id);
      assert.throws(() => validateBiology30PracticeOperations(inflated, practice), /Required practice operation inventory drift/);
    }
    const unknown = structuredClone(practice); unknown.items[0].componentIds.push("invented-component");
    assert.throws(() => validateBiology30PracticeOperations(academic, unknown), /Unknown or duplicate practice component/);
    const broadOutcome = structuredClone(practice); broadOutcome.items[0].outcomeIds.push("invented-outcome");
    assert.throws(() => validateBiology30PracticeOperations(academic, broadOutcome), /Practice outcome mapping drift/);
    const missingRole = structuredClone(practice); delete missingRole.items[0].componentEvidenceRole;
    assert.throws(() => validateBiology30PracticeOperations(academic, missingRole), /Missing operation evidence role/);
    const omitted = structuredClone(academic); omitted.components.find((component: any) => component.requiredPracticeIds.length).requiredPracticeIds.pop();
    assert.throws(() => validateBiology30PracticeOperations(omitted, practice), /Required practice operation inventory drift/);
  }
  assert.equal(total, 249);
});
