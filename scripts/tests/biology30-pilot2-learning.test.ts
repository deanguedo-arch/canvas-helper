import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { validateBiology30LearningInputs } from "../lib/biology30-course/v1/pilot2-learning-audit.js";

test("constructed practice fits complete exemplars and rejects capacity or schema drift", async () => {
  for (const unit of ["b", "c", "d"]) {
    const base = `projects/resources/biology30-production/v1/units/unit-${unit}`;
    const read = async (name: string) => JSON.parse(await readFile(`${base}/pilot2-${name}.json`, "utf8"));
    const [contract, practice, vocabulary, timing, state] = await Promise.all(["contract", "practice", "vocabulary", "time", "state-schema"].map(read));
    const input = { practice, vocabulary, timing, state };
    assert.equal(validateBiology30LearningInputs(contract, input).unit, unit.toUpperCase());
    const changedMap = structuredClone(input); changedMap.state.responsePacking.order.reverse();
    assert.throws(() => validateBiology30LearningInputs(contract, changedMap), /Response packing order identity/);
    const staleTerms = structuredClone(contract); staleTerms.topics[0].newTermIds.pop();
    assert.throws(() => validateBiology30LearningInputs(staleTerms, input), /new\/reused vocabulary inventory drift/);
    const staleReused = structuredClone(contract); staleReused.topics[0].reusedTermIds.push("future-term");
    assert.throws(() => validateBiology30LearningInputs(staleReused, input), /new\/reused vocabulary inventory drift/);
    const item = practice.items.find((entry: any) => entry.kind === "constructed");
    const cramped = structuredClone(input); cramped.state.responses[item.id].limit = item.modelResponse.length;
    assert.throws(() => validateBiology30LearningInputs(contract, cramped), /working room/);
    const expanded = structuredClone(input); expanded.practice.items.find((entry: any) => entry.id === item.id).modelResponse += " More explanation.".repeat(20);
    assert.throws(() => validateBiology30LearningInputs(contract, expanded), /working room/);
    const premature = structuredClone(input);
    premature.practice.items.find((entry: any) => entry.role === "guided").prerequisitePartIds = [contract.topics.at(-1).parts.at(-1).id];
    assert.throws(() => validateBiology30LearningInputs(contract, premature), /precedes required prerequisite/);
    const unknown = structuredClone(input);
    unknown.practice.items[0].prerequisitePartIds = ["missing-required-passage"];
    assert.throws(() => validateBiology30LearningInputs(contract, unknown), /precedes required prerequisite/);
  }
});

test("passage receipts reject changed questions, prose, examples and review inventories", async () => {
  const { validateBiology30PassageReviews } = await import("../lib/biology30-course/v1/pilot2-passage-audit.js");
  for (const unit of ["b", "c", "d"]) {
    const base = `projects/resources/biology30-production/v1/units/unit-${unit}`;
    const read = async (name: string) => JSON.parse(await readFile(`${base}/pilot2-${name}.json`, "utf8"));
    const [practice, core, instruction, review] = await Promise.all(["practice", "content", "instruction", "practice-passage-review"].map(read));
    const validate = (p = practice, c = core, i = instruction, r = review, complete = false) => validateBiology30PassageReviews(p, c, i, r, complete);
    assert.equal(validate().reviewedItems, review.reviewedItems.length);
    if (review.pendingItemIds.length) assert.throws(() => validate(practice, core, instruction, review, true), /remain pending/);
    else assert.equal(validate(practice, core, instruction, review, true).pendingItems, 0);
    const receipt = review.reviewedItems[0], partId = receipt.requiredPassages[0].partId;
    const question = structuredClone(practice);
    const changedQuestion = question.items.find((item: any) => item.id === receipt.itemId);
    if (changedQuestion.kind === "multiple-choice") changedQuestion.options[1] += " changed meaning";
    else changedQuestion.modelResponse += " changed meaning";
    assert.throws(() => validate(question), /Stale question/);
    const paragraphs = structuredClone(core);
    paragraphs.parts.find((part: any) => part.id === partId).paragraphs[0] += " changed teaching";
    assert.throws(() => validate(practice, paragraphs), /Stale required passage/);
    const worked = structuredClone(instruction);
    worked.parts.find((part: any) => part.partId === partId).workedExample.steps[0] += " changed operation";
    assert.throws(() => validate(practice, core, worked), /Stale required passage/);
    const mapping = structuredClone(practice);
    mapping.items.find((item: any) => item.id === receipt.itemId).prerequisitePartIds = [core.parts.at(-1).id];
    assert.throws(() => validate(mapping), /inventory drift|unmapped reviewed passage/);
    const duplicate = structuredClone(review); duplicate.reviewedItems.push(duplicate.reviewedItems[0]);
    assert.throws(() => validate(practice, core, instruction, duplicate), /duplicate passage review/);
    const missing = structuredClone(review);
    if (missing.pendingItemIds.length) missing.pendingItemIds.pop(); else missing.reviewedItems.pop();
    assert.throws(() => validate(practice, core, instruction, missing), /missing from reviewed/);
    const accept = structuredClone(review); accept.reviewedItems[0].teacherDecision = "accepted";
    assert.throws(() => validate(practice, core, instruction, accept), /cannot imply teacher acceptance/);
  }
});
