import test from "node:test";
import assert from "node:assert/strict";
import { readBiology30TopicContract, type TopicUnit } from "../lib/biology30-course/v1/pilot2-contract.js";
import { auditBiology30Instruction, validateBiology30Instruction, validateBiology30TopicTeaching } from "../lib/biology30-course/v1/pilot2-instruction-audit.js";

test("all 127 authored parts retain ordered worked operations, self-checks and optional adjacent Advanced", async () => {
  let total = 0;
  for (const unit of ["B", "C", "D"] as TopicUnit[]) {
    const { contract } = await readBiology30TopicContract(process.cwd(), unit);
    const result = await auditBiology30Instruction(process.cwd(), contract);
    total += result.report.coreParts;
    assert.equal(result.report.topics.length, contract.topics.length);
    assert.ok(result.report.topics.every(topic => topic.requiredExplanatoryWords === topic.coreWords + topic.workedWords));
    assert.equal(contract.status, "draft");
    assert.equal(contract.teacherAcceptance, null);
  }
  assert.equal(total, 127);
});

test("walkthrough drafts cannot omit frames, drift from their source, outgrow responses or skip chapter practice", async () => {
  const { contract } = await readBiology30TopicContract(process.cwd(), "B");
  const { core, instruction, framing, state, vocabulary } = await auditBiology30Instruction(process.cwd(), contract);
  const missing = structuredClone(framing); missing.topics[0].localWalkthrough.frames.pop();
  assert.throws(() => validateBiology30TopicTeaching(contract, core, instruction, missing, state, vocabulary), /omits/);
  const drift = structuredClone(framing); drift.topics[0].localWalkthrough.frames[0].conclusion = "Unreviewed replacement";
  assert.throws(() => validateBiology30TopicTeaching(contract, core, instruction, drift, state, vocabulary), /narration drifted/);
  const long = structuredClone(framing); long.topics[0].localWalkthrough.checkpoint.comparisonGuide = "x".repeat(121);
  assert.throws(() => validateBiology30TopicTeaching(contract, core, instruction, long, state, vocabulary), /Unanswerable/);
  const skip = structuredClone(framing); skip.topics[3].nextRequiredRouteId = "b-topic-fertilization-to-implantation";
  assert.throws(() => validateBiology30TopicTeaching(contract, core, instruction, skip, state, vocabulary), /skipped/);
  const terms = structuredClone(core); terms.parts[0].termIntroductionIds.pop();
  assert.throws(() => validateBiology30TopicTeaching(contract, terms, instruction, framing, state, vocabulary), /definition inventory/);
});

test("the authoring audit refuses omitted teaching, cross-unit content and accidental optional-work gating", async () => {
  const { contract } = await readBiology30TopicContract(process.cwd(), "B");
  const { core, instruction } = await auditBiology30Instruction(process.cwd(), contract);
  const missing = structuredClone(instruction); missing.parts.splice(2, 1);
  assert.throws(() => validateBiology30Instruction(contract, core, missing), /inventory/);
  const reordered = structuredClone(core); [reordered.parts[0], reordered.parts[1]] = [reordered.parts[1], reordered.parts[0]];
  assert.throws(() => validateBiology30Instruction(contract, reordered, instruction), /inventory/);
  assert.throws(() => validateBiology30Instruction(contract, { ...core, unit: "C" }, instruction), /Cross-unit/);
  for (const property of ["completionRequired", "initiallyExpanded"] as const) {
    const gated = structuredClone(instruction); gated.parts[0].advanced[property] = true;
    assert.throws(() => validateBiology30Instruction(contract, core, gated), /Advanced/);
  }
  const empty = structuredClone(instruction); empty.parts[0].workedExample.steps = [" "];
  assert.throws(() => validateBiology30Instruction(contract, core, empty), /worked/);
  const outcomes = structuredClone(instruction); outcomes.parts[0].outcomeIds = ["D3.1k"];
  assert.throws(() => validateBiology30Instruction(contract, core, outcomes), /outcome/);
  const stop = structuredClone(instruction); stop.parts[0].stopCheck.persistence = "required response";
  assert.throws(() => validateBiology30Instruction(contract, core, stop), /Stop check/);
});
