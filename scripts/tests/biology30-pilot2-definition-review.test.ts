import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { validateBiology30DefinitionReview } from "../lib/biology30-course/v1/pilot2-definition-review.js";
const load = async (unit: string, name: string) => JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${unit}/pilot2-${name}.json`, "utf8"));
test("definition wording reviews cover all501 introduced and236 preserved entries and reject stale or missing receipts", async () => {
  let total = 0;
  let preservedTotal = 0;
  for (const unit of ["b","c","d"]) {
    const vocabulary = await load(unit,"vocabulary"), review = await load(unit,"definition-wording-review");
    const result = validateBiology30DefinitionReview(vocabulary,review);
    total += result.reviewedDefinitions;
    preservedTotal += result.reviewedPreserved;
    const changed = structuredClone(vocabulary); changed.introducedTerms[0].definition += " changed";
    assert.throws(() => validateBiology30DefinitionReview(changed,review), /Stale definition/);
    const missing = structuredClone(review); missing.reviewedIntroductions.pop();
    assert.throws(() => validateBiology30DefinitionReview(vocabulary,missing), /inventory incomplete/);
    const acceptance = structuredClone(review); acceptance.teacherDecision = "accepted";
    assert.throws(() => validateBiology30DefinitionReview(vocabulary,acceptance), /Invalid definition/);
    const changedPreserved = structuredClone(vocabulary); changedPreserved.preservedGlossaryEntries[0].definition += " changed";
    assert.throws(() => validateBiology30DefinitionReview(changedPreserved,review), /Stale preserved glossary/);
    const missingPreserved = structuredClone(review); missingPreserved.reviewedPreserved.pop();
    assert.throws(() => validateBiology30DefinitionReview(vocabulary,missingPreserved), /inventory incomplete/);
    const duplicatePreserved = structuredClone(review); duplicatePreserved.reviewedPreserved.push(duplicatePreserved.reviewedPreserved[0]);
    assert.throws(() => validateBiology30DefinitionReview(vocabulary,duplicatePreserved), /duplicate preserved glossary/);
    const duplicateSource = structuredClone(vocabulary); duplicateSource.preservedGlossaryEntries.push(duplicateSource.preservedGlossaryEntries[0]);
    assert.throws(() => validateBiology30DefinitionReview(duplicateSource,review), /Duplicate preserved glossary identity/);
  }
  assert.equal(total,501);
  assert.equal(preservedTotal,236);
});
