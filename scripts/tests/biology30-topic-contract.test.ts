import assert from "node:assert/strict";
import test from "node:test";
import { readFile, mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { readBiology30TopicContract, validateBiology30TopicContract, verifyBiology30TopicReviewEvidence, biology30TopicDesignSha256, TOPIC_REVIEW_GATES, type TopicUnit } from "../lib/biology30-course/v1/pilot2-contract.js";
import { buildBiology30ProductionUnit } from "../lib/biology30-course/v1/build.js";
import { auditBiology30PlanningInputs, validateBiology30PlanningInputs } from "../lib/biology30-course/v1/pilot2-planning-audit.js";

test("atomic targets, required online skill operations and exact textbook assignments remain connected", async () => {
  let guides = 0;
  for (const unit of ["B", "C", "D"] as TopicUnit[]) {
    const { contract } = await readBiology30TopicContract(process.cwd(), unit);
    const { report, input } = await auditBiology30PlanningInputs(process.cwd(), contract);
    guides += report.nativeTextbookGuides;
    const brokenTarget = structuredClone(input);
    brokenTarget.academic.components[0].targets[0].partId = "unrelated-teaching";
    assert.throws(() => validateBiology30PlanningInputs(contract, brokenTarget), /Unresolved exact/);
    const optionalOnly = structuredClone(input);
    optionalOnly.investigations.investigations[0].coreSkillOperationsRequired = false;
    assert.throws(() => validateBiology30PlanningInputs(contract, optionalOnly), /only required skill/);
    const omittedQuestion = structuredClone(input);
    omittedQuestion.guides.groups[0].items.pop();
    assert.throws(() => validateBiology30PlanningInputs(contract, omittedQuestion), /assignment drift/);
    const wrongPage = structuredClone(input);
    wrongPage.guides.groups[0].items[0].physicalPage++;
    assert.throws(() => validateBiology30PlanningInputs(contract, wrongPage), /printed\/physical mismatch/);
  }
  assert.equal(guides, 243);
});

const hash = async (file: string) => createHash("sha256").update(await readFile(file)).digest("hex");

test("pre-render reviews reject stale bytes, missing inventory, design drift and unsafe evidence paths", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "biology-review-evidence-"));
  try {
    const base = "projects/resources/biology30-production/v1";
    const content = `${base}/units/unit-b/pilot2-content.json`;
    const evidence = `${base}/pilot2/review.json`;
    await mkdir(path.join(root, path.dirname(content)), { recursive: true });
    await mkdir(path.join(root, path.dirname(evidence)), { recursive: true });
    await writeFile(path.join(root, content), '{"lesson":"reviewed"}');
    await writeFile(path.join(root, evidence), '{"review":"test fixture, not academic clearance"}');
    const { contract } = await readBiology30TopicContract(process.cwd(), "B");
    contract.status = "frozen";
    for (const gate of TOPIC_REVIEW_GATES) contract.reviewGates[gate] = { status: "passed", evidence: [evidence], evidenceSha256: { [evidence]: await hash(path.join(root, evidence)) } };
    contract.freezeEvidence = { designSha256: biology30TopicDesignSha256(contract), inputs: { [content]: await hash(path.join(root, content)) } };
    assert.equal(validateBiology30TopicContract(contract, true).readyForRendering, true);
    assert.equal((await verifyBiology30TopicReviewEvidence(root, contract)).frozenInputs, 1);
    const routingDrift = structuredClone(contract);
    routingDrift.topics[0].title += " changed";
    assert.throws(() => validateBiology30TopicContract(routingDrift, true), /missing or stale/);
    await writeFile(path.join(root, content), '{"lesson":"changed after review"}');
    await assert.rejects(verifyBiology30TopicReviewEvidence(root, contract), /Stale Biology frozen input/);
    contract.freezeEvidence.inputs[content] = await hash(path.join(root, content));
    const extra = `${base}/units/unit-b/pilot2-new-input.json`;
    await writeFile(path.join(root, extra), '{}');
    await assert.rejects(verifyBiology30TopicReviewEvidence(root, contract), /inventory is incomplete/);
    contract.freezeEvidence.inputs[extra] = await hash(path.join(root, extra));
    await writeFile(path.join(root, evidence), 'changed review');
    await assert.rejects(verifyBiology30TopicReviewEvidence(root, contract), /Stale Biology review evidence/);
    const traversal = `${base}/../../outside.json`;
    contract.reviewGates.sourceDispositions = { status: "passed", evidence: [traversal], evidenceSha256: { [traversal]: "0".repeat(64) } };
    await assert.rejects(verifyBiology30TopicReviewEvidence(root, contract), /Unsafe Biology review path/);
    const outside = path.join(root, "outside.json");
    await writeFile(outside, "outside fixture");
    const linked = `${base}/pilot2/linked.json`;
    await symlink(outside, path.join(root, linked));
    contract.reviewGates.sourceDispositions = { status: "passed", evidence: [linked], evidenceSha256: { [linked]: await hash(outside) } };
    await assert.rejects(verifyBiology30TopicReviewEvidence(root, contract), /escapes through a symlink/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("all-unit teacher topics and added slide continuations cover every slide exactly once", async () => {
  const chapters = new Map<number, number[]>();
  const dSlides: number[] = [];
  for (const unit of ["B", "C", "D"] as TopicUnit[]) {
    const { contract, report } = await readBiology30TopicContract(process.cwd(), unit);
    assert.equal(report.readyForRendering, false);
    assert.ok(report.pending.length > 0);
    for (const topic of contract.topics) {
      const list = chapters.get(topic.chapter) ?? [];
      list.push(...topic.slideNumbers);
      chapters.set(topic.chapter, list);
      if (unit === "D") dSlides.push(...topic.slideNumbers);
    }
    assert.throws(() => validateBiology30TopicContract(contract, true), /not frozen/);
    assert.throws(() => validateBiology30TopicContract({ ...contract, status: "frozen" }), /incomplete/);
    const changed = structuredClone(contract);
    changed.topics[1].parts[0].id = changed.topics[0].parts[0].id;
    assert.throws(() => validateBiology30TopicContract(changed), /Duplicate/);
    const falsePass = structuredClone(contract);
    falsePass.reviewGates.stateAndMigration = { status: "passed", evidence: [] };
    assert.throws(() => validateBiology30TopicContract(falsePass), /without evidence/);
  }
  for (const [chapter, count] of [[14, 35], [15, 42], [16, 79], [17, 114], [18, 61]]) {
    assert.deepEqual(chapters.get(chapter)?.sort((a,b)=>a-b), Array.from({ length: count }, (_,i)=>i+1));
  }
  assert.deepEqual(dSlides, Array.from({length: 68}, (_,i)=>i+1));
});

test("profile refusal cannot silently regenerate the legacy candidate or alter metadata", async () => {
  for (const unit of ["B", "C", "D"] as TopicUnit[]) {
    const project = `biology30-unit-${unit.toLowerCase()}`;
    const paths = [`projects/${project}/workspace/index.html`, `projects/${project}/meta/project.json`, `projects/${project}/meta/production-build.json`];
    const before = await Promise.all(paths.map(hash));
    await assert.rejects(buildBiology30ProductionUnit({ repoRoot: process.cwd(), project, strict: true, profile: "unknown" }), /Unsupported Biology profile/);
    await assert.rejects(buildBiology30ProductionUnit({ repoRoot: process.cwd(), project, strict: true, profile: "pilot2-topic-sequence-v1", baselineWorkspaceSha256: "0".repeat(64) }), /baseline drift/);
    const { contract } = await readBiology30TopicContract(process.cwd(), unit);
    await assert.rejects(buildBiology30ProductionUnit({ repoRoot: process.cwd(), project, strict: true, profile: "pilot2-topic-sequence-v1", baselineWorkspaceSha256: contract.baselineWorkspaceSha256 }), /not frozen/);
    assert.deepEqual(await Promise.all(paths.map(hash)), before);
  }
});

import { auditBiology30LearningInputs, validateBiology30LearningInputs } from "../lib/biology30-course/v1/pilot2-learning-audit.js";
test("actual practice, vocabulary, Frayer and time contracts stay connected to the response registry",async()=>{
  for(const unit of ["B","C","D"] as TopicUnit[]){
    const {contract}=await readBiology30TopicContract(process.cwd(),unit);const {input}=await auditBiology30LearningInputs(process.cwd(),contract);
    const omitted=structuredClone(input);omitted.practice.items.pop();assert.throws(()=>validateBiology30LearningInputs(contract,omitted),/question counts/);
    const selected = input.practice.items.find(item => item.kind === "multiple-choice");assert.ok(selected);
    const wrong=structuredClone(input);wrong.practice.items.find(item => item.id === selected.id)!.correctIndex=4;assert.throws(()=>validateBiology30LearningInputs(contract,wrong),/practice key/);
    const gating=structuredClone(input);gating.vocabulary.frayerContract.requiredForCompletion=true;assert.throws(()=>validateBiology30LearningInputs(contract,gating),/participation contract/);
    const unbalanced=structuredClone(input);unbalanced.timing.routes[0].components.readingDefinitionsAndFigureInterpretation++;assert.throws(()=>validateBiology30LearningInputs(contract,unbalanced),/workload arithmetic/);
    const missingState=structuredClone(input);delete missingState.state.choices[selected.id];assert.throws(()=>validateBiology30LearningInputs(contract,missingState),/Choice state/);
  }
});
