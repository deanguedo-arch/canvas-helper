import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

import { load as loadHtml } from "cheerio";

import {
  OPTIONAL_MINUTES,
  PILOT_2_LESSONS,
  PILOT_2_REVIEW_ROUTES,
  REQUIRED_MINUTES,
  TEACHER_SOURCE_FILES
} from "../lib/biology30-unit-a-pilot-2/contracts.js";
import {
  ADVANCED_BRIDGE_BASELINE_SHA256,
  ADVANCED_GATE_B_IDS,
  ADVANCED_GATE_B_MINUTES,
  ADVANCED_GATE_A_IDS,
  ADVANCED_GATE_A_MINUTES,
  ADVANCED_LEARNING_BLUEPRINT,
  ADVANCED_LEARNING_MANIFEST_IDS,
  ADVANCED_LESSON_MINUTES
} from "../lib/biology30-unit-a-pilot-2/advanced-content.js";
import { buildBiology30UnitAPilot2Full, estimateWorstCaseState } from "../lib/biology30-unit-a-pilot-2/build-full.js";
import { CHAPTER_11_BASELINE, CHAPTER_11_STUDY_TASKS, studyResponseId } from "../lib/biology30-unit-a-pilot-2/chapter-11-study.js";
import { buildBiology30UnitAPilot2ProcessCollectionIndex } from "../lib/biology30-unit-a-pilot-2/build-process-collection-index.js";
import { createBiology30UnitAPilot2, hashTree } from "../lib/biology30-unit-a-pilot-2/create.js";
import { MODEL_LAB_RECORDS } from "../lib/biology30-unit-a-pilot-2/model-lab-content.js";
import { PROCESS_ACTIVITY_KINDS, PROCESS_COLLECTION_BASELINE_SHA256 } from "../lib/biology30-unit-a-pilot-2/process-collection-content.js";
import { TEXTBOOK_REVIEW_ATTEMPT_IDS, TEXTBOOK_REVIEW_SUPPORT } from "../lib/biology30-unit-a-pilot-2/textbook-review-content.js";
import { buildOnlineFinalizationReport, onlineBaselineDirectory } from "../lib/biology30-unit-a-pilot-2/online-finalization.js";
import { ONLINE_STUDIES, ONLINE_MICROSCOPY } from "../lib/biology30-unit-a-pilot-2/online-studies.js";
import { ONLINE_VIDEO_REVIEW } from "../lib/biology30-unit-a-pilot-2/online-video-review.js";

const execFile = promisify(execFileCallback);
const repoRoot = process.cwd();
const projectRoot = path.join(repoRoot, "projects", "biology30-unit-a-pilot-2");
const workspacePath = path.join(projectRoot, "workspace", "index.html");
const metaRoot = path.join(projectRoot, "meta");

test("online finalization is exact-build, preserves all prior work and supplies complete local media paths",async()=>{
  const html=await readFile(workspacePath,"utf8"),$=loadHtml(html);
  const report=await readJson<any>("online-finalization.json");
  const before=await readFile(path.join(projectRoot,onlineBaselineDirectory,"workspace/index.html"),"utf8");
  assert.deepEqual(report,buildOnlineFinalizationReport(before,html,report.generatedAt,42383));
  assert.equal(await sha256File(path.join(projectRoot,"workspace",ONLINE_MICROSCOPY.asset)),ONLINE_MICROSCOPY.sha256);
  for(const study of ONLINE_STUDIES){
    assert.equal($(`[data-online-study="${study.id}"] [data-online-pick]`).length,study.rows.length*study.columns.length);
    study.rows.forEach(row=>row.answers.forEach((answer,index)=>assert.ok(study.options[index][answer])));
  }
  for(const video of ONLINE_VIDEO_REVIEW){
    assert.match(video.sha256,/^[a-f0-9]{64}$/);assert.ok(video.start<video.end&&video.end<=video.sourceSeconds);
    const src=$(`.required-media[data-video-entry="${video.id}"] [data-video-stage]`).attr("data-video-src")!;
    const url=new URL(src);assert.equal(url.searchParams.get("autoplay"),"0");assert.equal(url.searchParams.get("start"),String(video.start));assert.equal(url.searchParams.get("end"),String(video.end));
  }
  assert.equal(report.teacherDecision,null);assert.equal(report.transferReady,false);
  assert.match($("[data-online-microscopy]").text(),/not operating a microscope/);
  assert.equal($('[data-local-equivalent]').parent().filter(".required-media").length,14);
});

async function readJson<T = Record<string, unknown>>(fileName: string): Promise<T> {
  return JSON.parse(await readFile(path.join(metaRoot, fileName), "utf8")) as T;
}

async function sha256File(filePath: string) {
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

test("Pilot 2 is a separate blocked direct-workspace project with the exact route and time contract", async () => {
  const manifest = await readJson<any>("project.json");
  const contract = await readJson<any>("pilot-2-contract.json");
  assert.equal(manifest.slug, "biology30-unit-a-pilot-2");
  assert.equal(manifest.canonicalEntry, "projects/biology30-unit-a-pilot-2/workspace/index.html");
  assert.equal(manifest.authoringStatus, "blocked");
  assert.equal(manifest.authoring.driverId, "direct-workspace-v1");
  assert.equal(manifest.authoring.studioEditing.enabled, false);
  assert.ok(manifest.exportTargets.every((target: any) => target.enabled === false));
  assert.equal(contract.requiredMinutes, 1505);
  assert.equal(contract.optionalMinutes, 295);
  assert.equal(contract.requiredRouteCount, 18);
  assert.deepEqual(contract.navigationGroups, ["Start", "Learn", "Practice & Review", "Process Collection", "Resources"]);
  assert.equal(contract.lessons.length, 13);
  assert.equal(contract.reviewRoutes.length, 5);
  assert.equal(REQUIRED_MINUTES, 1505);
  assert.equal(OPTIONAL_MINUTES, 295);
  assert.equal(PILOT_2_LESSONS.length, 13);
  assert.equal(PILOT_2_REVIEW_ROUTES.length, 5);
  assert.equal(contract.gate1.teacherAcceptance, "accepted");
  assert.equal(contract.gate1.workspaceSha256, "8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe");
  assert.equal(contract.gate2.status, "changes-requested");
  assert.equal(contract.gate2.teacherAcceptance, "changes-requested");
  assert.equal(contract.gate2.workspaceSha256, "9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7");
  assert.equal(contract.gate2.renderedRoutes.length, 26);
  assert.equal(contract.gate2.counts.requiredPracticeItems, 80);
  assert.equal(contract.gate2.counts.optionalChallengeItems, 6);
  assert.equal(contract.revisionGateA.status, "teacher-accepted");
  assert.equal(contract.revisionGateA.revision, "teacher-feedback-1");
  assert.deepEqual(contract.revisionGateA.sliceRoutes, ["lesson-02", "lesson-05", "lesson-11", "lesson-13"]);
  assert.equal(contract.revisionGateA.counts.requiredMediaCheckpoints, 14);
  assert.equal(contract.revisionGateA.counts.atomicComponents, 78);
  assert.equal(contract.revisionGateA.workspaceSha256, "3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff");
  assert.equal(contract.revisionGateB.status, "awaiting-teacher-review");
  assert.equal(contract.revisionGateB.teacherAcceptance, "pending");
  assert.equal(contract.revisionGateB.counts.renderedFigures >= 52, true);
  assert.equal(contract.revisionGateB.counts.requiredPracticeItems, 80);
  assert.equal(contract.revisionGateB.counts.requiredMediaCheckpoints, 14);
  assert.equal(contract.revisionGateB.counts.modelLabModels, 13);
  assert.equal(contract.revisionGateB.counts.modelLabScenarios, 49);
  assert.equal(contract.revisionGateB.counts.collectableModelResults, 13);
  assert.equal(contract.revisionGateB.counts.operableLockedVocabularyPreviews, 28);
  assert.equal(contract.revisionGateB.counts.textbookReviewSections, 4);
  assert.equal(contract.revisionGateB.counts.textbookReviewNativeAnswers, 120);
  assert.equal(contract.revisionGateB.counts.advancedLearningManifestBlocks, 40);
  assert.equal(contract.revisionGateB.counts.advancedLearningAcceptedGateABlocks, 8);
  assert.equal(contract.revisionGateB.counts.advancedLearningRenderedGateBBlocks, 32);
  assert.equal(contract.revisionGateB.counts.advancedLearningRenderedTotalBlocks, 40);
  assert.equal(contract.revisionGateB.counts.advancedLearningPlannedBlocks, 0);
  assert.equal(contract.revisionGateB.counts.advancedLearningLessonMinutes, 245);
  assert.equal(contract.revisionGateB.counts.pilot1SectionDispositions, 470);
  assert.equal(contract.revisionGateB.iteration, "advanced-learning-bridge-gate-b");
  assert.ok(manifest.canonicalSources.includes("projects/biology30-unit-a-pilot-2/meta/model-lab-interaction-map.json"));
  assert.ok(manifest.canonicalSources.includes("projects/biology30-unit-a-pilot-2/meta/textbook-review-integration.json"));
  assert.ok(manifest.canonicalSources.includes("projects/biology30-unit-a-pilot-2/meta/advanced-learning-bridge.json"));
  assert.ok(manifest.canonicalSources.includes("projects/biology30-unit-a-pilot-2/meta/advanced-learning-bridge.md"));
  assert.ok(manifest.canonicalSources.includes("projects/biology30-unit-a-pilot-2/meta/advanced-bridge-gate-a-review.json"));
  assert.ok(manifest.canonicalSources.includes("projects/biology30-unit-a-pilot-2/meta/advanced-bridge-gate-b-review.json"));
  assert.equal(contract.advancedBridgeGateA.status, "teacher-accepted");
  assert.equal(contract.advancedBridgeGateA.baselineWorkspaceSha256, ADVANCED_BRIDGE_BASELINE_SHA256);
  assert.deepEqual(contract.advancedBridgeGateA.renderedBlockIds, ADVANCED_GATE_A_IDS);
  assert.equal(contract.advancedBridgeGateA.teacherDecision.decision, "accepted");
  assert.equal(contract.advancedBridgeGateA.teacherDecision.acceptedWorkspaceSha256, contract.advancedBridgeGateA.workspaceSha256);
  assert.equal(contract.advancedBridgeGateB.status, "awaiting-teacher-review");
  assert.equal(contract.advancedBridgeGateB.acceptedGateAWorkspaceSha256, contract.advancedBridgeGateA.workspaceSha256);
  assert.deepEqual(contract.advancedBridgeGateB.newlyRenderedBlockIds, ADVANCED_GATE_B_IDS);
  assert.equal(contract.advancedBridgeGateB.renderedBlocks, 40);
  assert.equal(contract.advancedBridgeGateB.teacherDecision, null);
  assert.equal(contract.state.schemaVersion, 6);
  assert.equal(contract.state.encoding, "hashed-v1-plus-advanced-bitset");
  assert.equal(contract.state.storageKey, "biology30-unit-a-pilot-2:state:v1");
});

test("Gate 0 maps every outcome, acceptable-standard behaviour, teacher-plan row, slide, and Pilot 1 section", async () => {
  const curriculum = await readJson<any>("curriculum-performance-map.json");
  const crosswalk = await readJson<any>("teacher-source-crosswalk.json");
  const dispositions = await readJson<any>("pilot-1-section-disposition.json");
  assert.equal(curriculum.outcomes.length, 25);
  assert.equal(new Set(curriculum.outcomes.map((outcome: any) => outcome.id)).size, 25);
  assert.equal(curriculum.performanceBehaviours.length, 53);
  assert.equal(new Set(curriculum.performanceBehaviours.map((entry: any) => entry.id)).size, 53);
  for (const outcome of curriculum.outcomes) {
    for (const field of ["teachRoutes", "visualOrModelRoutes", "workedExampleRoutes", "practiceRoutes", "evidenceRoutes"]) {
      assert.ok(outcome[field]?.length, `${outcome.id} is missing ${field}`);
    }
  }
  for (const behaviour of curriculum.performanceBehaviours) {
    for (const field of ["teachRoute", "visualOrModelRoute", "workedExampleRoute", "practiceRoute", "evidenceRoute"]) {
      assert.ok(behaviour[field], `${behaviour.id} is missing ${field}`);
    }
  }
  const myelin = curriculum.performanceBehaviours.find((entry: any) => entry.id === "A1.1k-02");
  assert.equal(myelin.teachRoute, "lesson-01");
  assert.equal(myelin.visualOrModelRoute, "lesson-01#visual");
  assert.equal(myelin.workedExampleRoute, "lesson-01#worked-example");
  assert.equal(myelin.practiceRoute, "chapter-11-practice");
  assert.equal(myelin.evidenceRoute, "lesson-01#evidence-slip");

  assert.equal(crosswalk.teacherPlanRows.length, 17);
  assert.equal(crosswalk.slideDispositions.length, 138);
  assert.deepEqual(
    Object.fromEntries(["chapter-11-notes", "chapter-12-notes", "chapter-13-notes"].map((id) => [id, crosswalk.slideDispositions.filter((entry: any) => entry.deckId === id).length])),
    { "chapter-11-notes": 66, "chapter-12-notes": 29, "chapter-13-notes": 43 }
  );
  assert.ok(crosswalk.teacherPlanRows.find((row: any) => row.id === "ch12-day-10").correction.includes("29 slides"));
  assert.ok(crosswalk.teacherPlanRows.find((row: any) => row.id === "ch12-days-11-12").correction.includes("432–433"));
  assert.ok(crosswalk.teacherPlanRows.find((row: any) => row.id === "unit-a-days-20-23").correction.includes("468–471"));
  assert.ok(crosswalk.teacherPlanRows.find((row: any) => row.id === "unit-a-days-20-23").exclusion.includes("credentials"));
  assert.ok(dispositions.recordCount >= 450);
  assert.equal(dispositions.records.length, dispositions.recordCount);
  assert.ok(dispositions.records.every((entry: any) => entry.destinationRoutes.length > 0 || String(entry.treatment).startsWith("exclude-")));
});

test("Advanced Bridge Gate B renders all forty blocks and resolves every Pilot 1 section exactly once", async () => {
  const bridge = await readJson<any>("advanced-learning-bridge.json");
  const report = await readFile(path.join(metaRoot, "advanced-learning-bridge.md"), "utf8");
  const review = await readJson<any>("advanced-bridge-gate-a-review.json");
  const gateBReview = await readJson<any>("advanced-bridge-gate-b-review.json");
  assert.equal(bridge.status, "advanced-bridge-gate-b-awaiting-teacher-review");
  assert.equal(bridge.baselineWorkspaceSha256, ADVANCED_BRIDGE_BASELINE_SHA256);
  assert.equal(bridge.workspaceSha256, PROCESS_COLLECTION_BASELINE_SHA256);
  assert.equal(bridge.counts.manifestBlocks, 40);
  assert.equal(bridge.counts.acceptedGateABlocks, 8);
  assert.equal(bridge.counts.renderedGateBBlocks, 32);
  assert.equal(bridge.counts.renderedTotalBlocks, 40);
  assert.equal(bridge.counts.plannedGateBBlocks, 0);
  assert.equal(bridge.counts.gateAMinutes, ADVANCED_GATE_A_MINUTES);
  assert.equal(bridge.counts.gateBMinutes, ADVANCED_GATE_B_MINUTES);
  assert.equal(bridge.timing.lessonBlocksMinutes, ADVANCED_LESSON_MINUTES);
  assert.equal(bridge.timing.totalOptionalMinutes, 295);
  assert.equal(ADVANCED_LEARNING_BLUEPRINT.length, 40);
  assert.deepEqual(bridge.blocks.map((entry: any) => entry.id), ADVANCED_LEARNING_MANIFEST_IDS);
  assert.deepEqual(bridge.blocks.filter((entry: any) => entry.authoredContentStatus === "accepted-gate-a-block").map((entry: any) => entry.id), ADVANCED_GATE_A_IDS);
  assert.deepEqual(bridge.blocks.filter((entry: any) => entry.authoredContentStatus === "complete-gate-b-block").map((entry: any) => entry.id), ADVANCED_GATE_B_IDS);
  assert.ok(bridge.blocks.every((entry: any) => entry.outcomeIds.length && entry.excellenceBehaviourIds.length && entry.prerequisiteTermIds.length && entry.sourceRefs.length >= 4 && entry.pilot1SourceSectionIds.length && entry.evidenceKind && entry.evidenceAccessibility));
  assert.equal(bridge.sourceSectionAudit.recordCount, 470);
  assert.equal(bridge.sourceSectionAudit.records.length, 470);
  assert.ok(bridge.sourceSectionAudit.records.every((entry: any) => typeof entry.finalOutcome === "string" && entry.finalOutcome.length > 0 && typeof entry.reason === "string" && entry.reason.length > 0));
  assert.equal(bridge.sourceSectionAudit.records.filter((entry: any) => entry.treatment === "advanced-rewrite").length, 11);
  assert.ok(bridge.sourceSectionAudit.records.filter((entry: any) => entry.treatment === "advanced-rewrite").every((entry: any) => entry.finalOutcome === "rewritten-into-advanced-learning" && ADVANCED_LEARNING_MANIFEST_IDS.includes(entry.advancedBlockId)));
  assert.equal(Object.values(bridge.counts.finalOutcomes).reduce((total: number, count: any) => total + Number(count), 0), 470);
  assert.equal(bridge.teacherDecision, null);
  assert.equal(review.workspaceSha256, "3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6");
  assert.equal(review.baselineWorkspaceSha256, ADVANCED_BRIDGE_BASELINE_SHA256);
  assert.deepEqual(review.renderedBlockIds, ADVANCED_GATE_A_IDS);
  assert.equal(review.status, "teacher-accepted");
  assert.equal(review.teacherDecision.decision, "accepted");
  assert.equal(gateBReview.workspaceSha256, PROCESS_COLLECTION_BASELINE_SHA256);
  assert.equal(gateBReview.acceptedGateAWorkspaceSha256, review.workspaceSha256);
  assert.deepEqual(gateBReview.acceptedGateABlockIds, ADVANCED_GATE_A_IDS);
  assert.deepEqual(gateBReview.newlyRenderedGateBBlockIds, ADVANCED_GATE_B_IDS);
  assert.equal(gateBReview.status, "awaiting-teacher-review");
  assert.equal(gateBReview.teacherDecision, null);
  ADVANCED_LEARNING_MANIFEST_IDS.forEach((id) => assert.match(report, new RegExp(`\\| ${id} \\|`)));
});

test("The atomic index resolves its rendered references without certifying academic completeness", async () => {
  const atomic = await readJson<any>("atomic-curriculum-map.json");
  const review = await readJson<any>("process-collection-index-review.json");
  const html = await readFile(workspacePath, "utf8");
  const $ = loadHtml(html);
  assert.equal(atomic.workspaceSha256, review.workspaceSha256);
  assert.equal(atomic.status, "revision-gate-b-awaiting-teacher-review");
  assert.equal(atomic.counts.outcomes, 25);
  assert.equal(atomic.counts.acceptableStandardBehaviours, 47);
  assert.equal(atomic.counts.excellenceStandardBehaviours, 5);
  assert.equal(atomic.counts.localCurriculumCriteria, 1);
  assert.equal(atomic.components.length, 78);
  assert.equal(new Set(atomic.components.flatMap((entry: any) => entry.outcomeIds)).size, 25);
  const behaviourIds = atomic.components.flatMap((entry: any) => entry.performanceBehaviourIds);
  assert.equal(behaviourIds.length, 53);
  assert.equal(new Set(behaviourIds).size, 53);
  for (const component of atomic.components) {
    assert.notEqual(component.firstTeachSelector, `#${component.firstTeachSelector.replace(/^#/, "").split(/\s/)[0]}`);
    assert.equal($(component.firstTeachSelector).length, 1, `${component.id} must resolve to one teaching block`);
    assert.ok($(component.firstTeachSelector).attr("data-atomic-components")?.split(/\s+/).includes(component.id));
    assert.ok(component.sourceRefs.length >= 2);
    assert.ok(component.requiredExplanationPoints.length >= 2);
    assert.ok(component.renderedTextEvidence.length >= 80);
    assert.ok($(`[data-figure-id="${component.visualOrDataId}"]`).length >= 1);
    assert.equal($(`#${component.workedExampleId}`).length, 1);
    assert.ok(component.practiceItemIds.every((id: string) => $(`[data-practice-id="${id}"]`).length === 1));
    assert.ok($(`[data-evidence-contribution-id="${component.evidenceId}"],[data-save-investigation="${component.evidenceId}"],[data-response-id="${component.evidenceId}"]`).length >= 1);
  }
  const actionGraph = atomic.components.find((entry: any) => entry.performanceBehaviourIds.includes("A1.1k-07"));
  assert.equal(actionGraph.visualOrDataId, "action-potential-voltage-graph");
});

test("Practice, vocabulary, media, response, reading, and state contracts are complete and non-gating where required", async () => {
  const practice = await readJson<any>("practice-blueprint.json");
  const vocabulary = await readJson<any>("core-vocabulary.json");
  const media = await readJson<any>("figure-media-plan.json");
  const mapping = await readJson<any>("route-response-map.json");
  const reading = await readJson<any>("reading-level-report.json");
  const stateBudget = await readJson<any>("state-budget.json");
  const practiceReadiness = await readJson<any>("practice-readiness-audit.json");
  const modelMap = await readJson<any>("model-lab-interaction-map.json");
  const textbookReview = await readJson<any>("textbook-review-integration.json");
  const advancedBridge = await readJson<any>("advanced-learning-bridge.json");
  assert.equal(practice.lessonItems.length, 26);
  assert.equal(practice.chapterItems.length, 36);
  assert.equal(practice.finalCoreItems.length, 18);
  assert.equal(practice.challengeItems.length, 6);
  assert.equal(new Set([...practice.lessonItems, ...practice.chapterItems, ...practice.finalCoreItems, ...practice.challengeItems].map((item: any) => item.id)).size, 86);
  assert.ok([...practice.lessonItems, ...practice.chapterItems, ...practice.finalCoreItems, ...practice.challengeItems].every((item: any) => item.id.startsWith("biology30-unit-a-pilot-2:practice:")));
  assert.ok([...practice.lessonItems, ...practice.chapterItems, ...practice.finalCoreItems, ...practice.challengeItems].every((item: any) => item.answerKeyRequired && item.rationaleRequired && item.misconceptionFeedbackRequired && item.textbookLinkRequired));
  assert.equal(vocabulary.entries.length, 28);
  assert.equal(vocabulary.fixedMilestones.length, 6);
  assert.equal(vocabulary.policy.completionGating, false);
  assert.ok(vocabulary.entries.every((entry: any) => entry.primaryLessonIds.length && entry.wordAnalysis.parts.length && entry.modelFrayer.definition));
  assert.equal(media.figures.length, 12);
  assert.equal(media.workspaceSha256, await sha256File(workspacePath));
  assert.equal(media.figures.filter((entry: any) => entry.gate2Treatment === "revision-gate-b-full-course-context-review").length, 12);
  assert.ok(media.renderedFigureInventory.count >= 52);
  assert.deepEqual(Object.keys(media.renderedFigureInventory.byLesson), PILOT_2_LESSONS.map((lesson) => lesson.id));
  assert.ok(Object.values(media.renderedFigureInventory.byLesson).every((count: any) => count >= 4));
  assert.ok(media.renderedFigureInventory.records.every((entry: any) => entry.accessibility.status === "passed" && entry.sourceRefs.length > 0));
  assert.equal(media.videos.length, 14);
  assert.ok(media.videos.every((entry: any) => entry.requiredLearningStep === true && entry.youtubeRequired === false && entry.localEquivalentStepCount === 3 && entry.localEquivalentWorkedCase === true));
  assert.ok(media.videos.every((entry: any) => entry.completionImpact === true && entry.requiredInstructionDependency === false && entry.customPlayButton === false && entry.autoplay === false));
  assert.ok(mapping.stateIdMap.length > 100);
  assert.ok(mapping.stateIdMap.every((entry: any) => entry.oldId.startsWith("biology30-unit-a-pilot:") && entry.newId.startsWith("biology30-unit-a-pilot-2:")));
  assert.equal(reading.revisionGateBCoreLessons.length, 13);
  assert.ok(reading.revisionGateBCoreLessons.every((entry: any) => entry.fleschKincaidGrade <= 12));
  assert.ok(reading.revisionGateBCoreLessons.every((entry: any) => entry.averageSentenceWords <= 20));
  assert.ok(reading.revisionGateBCoreLessons.every((entry: any) => entry.longestCoreParagraphWords <= 100));
  assert.ok(reading.revisionGateBCoreLessons.every((entry: any) => entry.wordCount >= 700 && entry.wordCount <= (entry.routeId === "lesson-13" ? 1200 : 1050)));
  assert.equal(practiceReadiness.workspaceSha256, await sha256File(workspacePath));
  assert.deepEqual(practiceReadiness.counts, { total: 86, required: 80, optional: 6, structurallyValid: 86, sourceReviewed: 86 });
  assert.equal(practiceReadiness.academicClearance, false);
  assert.ok(practiceReadiness.records.every((entry: any) => entry.structuralReview === "passed" && entry.semanticReview === "source-reviewed-preserved-meaning-and-feedback" && entry.choices.length && entry.rationale && entry.textbook.physicalPage));
  assert.equal(stateBudget.schemaVersion, 6);
  assert.equal(stateBudget.encoding, "hashed-v1-plus-advanced-bitset");
  assert.equal(stateBudget.targetMaximumCharacters, 44000);
  assert.equal(stateBudget.runtimeHardGuardCharacters, 48000);
  assert.ok(stateBudget.estimatedWorstCaseCharacters <= 44000);
  assert.ok(stateBudget.headroomBelowRuntimeGuard >= 4000);
  assert.equal(stateBudget.mediaCheckpointCountAtWorstCase, 14);
  assert.equal(stateBudget.modelCountAtWorstCase, 13);
  assert.equal(stateBudget.textbookReviewAttemptCountAtWorstCase, 4);
  assert.equal(stateBudget.advancedCompletionCountAtWorstCase, 40);
  assert.equal(mapping.stateSchemaVersion, 6);
  assert.equal(mapping.stateEncoding, "hashed-v1");
  assert.deepEqual(mapping.advancedLearning.manifestIds, ADVANCED_LEARNING_MANIFEST_IDS);
  assert.equal(mapping.advancedLearning.persistedAs, "ten-hex-character-bitset");
  assert.equal(mapping.advancedLearning.completionImpact, false);
  assert.equal(modelMap.schemaVersion, 2);
  assert.equal(modelMap.workspaceSha256, await sha256File(workspacePath));
  assert.equal(modelMap.records.length, 14);
  assert.equal(modelMap.records.filter((entry: any) => entry.treatment === "adapted-for-pilot-2").length, 13);
  assert.ok(modelMap.records.filter((entry: any) => entry.treatment === "adapted-for-pilot-2").every((entry: any) => entry.investigationQuestion && entry.learningPurpose && entry.testVariable && entry.comparisonControl && entry.evidenceFocus && entry.predictionPrompt && entry.explanationPrompt && entry.persistenceFields.length === 3));
  assert.equal(modelMap.records.find((entry: any) => entry.id === "integrated-review-evidence")?.treatment, "adapted-into-three-saved-review-sessions");
  const expectedPilot1Interactions = [
    "interaction-control-system-comparison", "interaction-negative-feedback-builder", "interaction-neuron-pathway-sort",
    "interaction-action-potential-explorer", "interaction-synapse-sequence", "interaction-brain-symptom-locator",
    "interaction-reflex-arc-builder", "interaction-sensory-investigation-planner", "interaction-eye-light-path",
    "interaction-audiogram-evidence-explorer", "interaction-sensory-evidence-board", "interaction-endocrine-body-map",
    "interaction-hypothalamus-pituitary-feedback", "interaction-thyroid-calcium-feedback", "interaction-blood-glucose-simulator",
    "interaction-water-salt-data-lab", "interaction-integrated-case-board"
  ];
  assert.deepEqual([...new Set(modelMap.records.flatMap((entry: any) => entry.sourceInteractionIds))].sort(), expectedPilot1Interactions.sort());
  assert.ok(modelMap.records.every((entry: any) => entry.processCollection === true));
  assert.equal(textbookReview.schemaVersion, 1);
  assert.equal(textbookReview.workspaceSha256, await sha256File(workspacePath));
  assert.deepEqual(textbookReview.counts, { reviewSections: 4, nativeAnswers: 120, attemptIds: 4 });
  assert.deepEqual(textbookReview.records.map((entry: any) => entry.routeId), ["chapter-11-practice", "chapter-12-practice", "chapter-13-practice", "final-practice"]);
  assert.deepEqual(textbookReview.records.map((entry: any) => entry.answerCount), [20, 30, 19, 51]);
  assert.deepEqual(textbookReview.records.map((entry: any) => entry.attemptId), TEXTBOOK_REVIEW_ATTEMPT_IDS);
  assert.equal(textbookReview.policy.completionImpact, false);
  assert.equal(textbookReview.policy.scoringImpact, false);
  assert.equal(textbookReview.policy.runtimeDependencyOnPilot1, false);
  assert.equal(TEXTBOOK_REVIEW_SUPPORT.reduce((total, entry) => total + entry.answers.length, 0), 120);
  assert.equal(advancedBridge.policy.requiredProgressImpact, false);
  assert.equal(advancedBridge.policy.scoringImpact, false);
  assert.equal(advancedBridge.savedState.schemaVersion, 6);
  assert.deepEqual(advancedBridge.savedState.allowlistedIds, ADVANCED_LEARNING_MANIFEST_IDS);
});

test("Revision Gate B learner HTML applies the accepted depth, vocabulary, visual, and media pattern to all lessons", async () => {
  const html = await readFile(workspacePath, "utf8");
  const $ = loadHtml(html);
  const expectedRoutes = [
    "overview",
    "lesson-01", "lesson-02", "lesson-03", "lesson-04", "lesson-05", "chapter-11-practice",
    "lesson-06", "lesson-07", "lesson-08", "chapter-12-practice",
    "lesson-09", "lesson-10", "lesson-11", "lesson-12", "lesson-13", "chapter-13-practice",
    "review-seminar", "final-practice", "process-collection", "core-vocabulary", "advanced-learning", "textbook-library",
    "video-library", "model-lab", "glossary-and-data", "sources-and-credits"
  ];
  assert.equal($(".nav-group").length, 5);
  assert.deepEqual($(".nav-group > summary span").map((_index, element) => $(element).text().trim()).get(), ["Start", "Learn", "Practice & Review", "Process Collection", "Resources"]);
  const navGroups = $(".nav-group").toArray();
  const processGroup = navGroups.find((element) => normalizeText($(element).children("summary").text()) === "Process Collection");
  const resourcesGroup = navGroups.find((element) => normalizeText($(element).children("summary").text()) === "Resources");
  assert.deepEqual($(processGroup!).find(".nav-link").map((_index, element) => normalizeText($(element).text())).get(), ["Saved work", "Core Vocabulary", "Advanced Learning", "Models and Data Lab"]);
  assert.deepEqual($(resourcesGroup!).find(".nav-link").map((_index, element) => normalizeText($(element).text())).get(), ["Textbook Library", "Video Library", "Glossary and Data", "Sources and Credits"]);
  assert.equal($("[data-sidebar-toggle][aria-controls=course-sidebar][aria-expanded=true]").length, 1);
  assert.deepEqual($(".course-page[id]").map((_index, element) => $(element).attr("id")).get(), expectedRoutes);
  assert.equal($(".lesson-page").length, 13);
  assert.deepEqual($(".lesson-page").map((_index, element) => $(element).attr("id")).get(), PILOT_2_LESSONS.map((lesson) => lesson.id));
  assert.equal($(".lesson-page [data-practice-id]").length, 26);
  for (const routeId of ["chapter-11-practice", "chapter-12-practice", "chapter-13-practice"]) {
    assert.equal($(`#${routeId} [data-practice-id][data-required=\"true\"]`).length, 12);
  }
  assert.equal($("#final-practice [data-practice-id][data-required=\"true\"]").length, 18);
  assert.equal($("#final-practice [data-practice-id][data-required=\"false\"]").length, 6);
  assert.equal($("#review-seminar [data-seminar-session]").length, 3);
  assert.equal($(".lesson-page .evidence-slip").length, 13);
  assert.equal($(".lesson-page .learn-block").length, 40);
  assert.equal($(".lesson-page details.advanced-learning-block").length, 40);
  assert.equal($(".lesson-page details.advanced-learning:not(.advanced-learning-block)").length, 0);
  assert.ok($(".science-figure img[alt]").length >= 10);
  assert.equal($(".science-figure img[alt]").length, $(".science-figure img").length);
  assert.equal($(".science-figure figcaption").length, $(".science-figure").length);
  for (const lessonId of PILOT_2_LESSONS.map((lesson) => lesson.id)) {
    const lesson = $(`#${lessonId}`);
    assert.equal(lesson.find(".lesson-words dt").length, 4);
    assert.equal(lesson.find("details.lesson-term-inventory").length, 1);
    assert.ok(lesson.find("details.lesson-term-inventory .lesson-term-row").length >= 4);
    assert.ok(lesson.find(".learn-block").length >= 3);
    assert.ok(lesson.find("[data-figure-id]").length >= 4, `${lessonId} needs at least four purposeful visuals`);
    const lessonHtml = lesson.html() ?? "";
    assert.ok(lessonHtml.indexOf("worked-example") < lessonHtml.indexOf("retrieve-block"), `${lessonId} retrieval must follow teaching and the worked example`);
    assert.equal(lesson.find("[data-guided-practice] [data-practice-id]").length, 2);
    assert.equal(lesson.find(".evidence-slip").length, 1);
    const expectedAdvanced = ADVANCED_LEARNING_BLUEPRINT.filter((entry) => entry.lessonId === lessonId);
    assert.equal(lesson.find("details.advanced-learning-block").length, expectedAdvanced.length);
    assert.equal(lesson.find("[data-media-checkpoint-id]").length, lessonId === "lesson-13" ? 2 : 1);
    assert.equal(lesson.find("[data-local-equivalent] .walkthrough-panel").length, lessonId === "lesson-13" ? 6 : 3);
    lesson.find(".walkthrough-panel").each((_i,node)=>{assert.equal($(node).find("figure").length,1);assert.ok($(node).children("p").text().split(/\s+/).length>=45)});
  }
  const lesson1Text = normalizeText($("#lesson-01").text());
  assert.match(lesson1Text, /myelin acts as electrical insulation/i);
  assert.match(lesson1Text, /action potential is regenerated at each node/i);
  assert.match($("#lesson-01 [data-practice-id]").text(), /myelinated axon usually conduct an impulse faster/i);
  assert.match($("#lesson-01 .evidence-slip").text(), /explain what myelin actually changes/i);
  const lesson3Html = $("#lesson-03").html() ?? "";
  assert.ok(lesson3Html.indexOf("A <strong>neurotransmitter</strong> is") < lesson3Html.indexOf("<strong>Acetylcholine</strong>"));
  assert.match($("#lesson-13").text(), /Not every tissue responds in the same way/i);
  assert.match($("#lesson-13").text(), /does not.*diagnos|cannot.*diagnos/is);
  assert.match($("#lesson-09").text(), /only receptor-bearing target cells respond/i);
  assert.match($("#lesson-10").text(), /master gland, but that label is incomplete/i);
  assert.match($("#lesson-12").text(), /parathyroid hormone/i);
  assert.ok($("#lesson-02 [data-figure-id=\"action-potential-voltage-graph\"]").length === 1);
  assert.match($("#lesson-02 [data-figure-id=\"action-potential-voltage-graph\"]").text(), /threshold/i);
  assert.match($("#lesson-05").text(), /pons/i);
  assert.match($("#lesson-05").text(), /medulla oblongata/i);
  assert.match($("#lesson-05").text(), /white matter/i);
  assert.match($("#lesson-05").text(), /grey matter/i);
  assert.match($("#lesson-11").text(), /made by neurons in the hypothalamus/i);
  assert.match($("#lesson-11").text(), /released from the posterior pituitary/i);
  assert.match($("#lesson-13").text(), /pancreatic islets/i);
  assert.match($("#lesson-13").text(), /adrenal medulla/i);
  assert.match($("#lesson-13").text(), /adrenal cortex/i);
  assert.equal($("#process-collection [data-investigation]").length, 3);
  assert.equal($("#process-collection .worked-investigation").length, 3);

  const stateIds = $("[data-response-id],[data-practice-id],[data-save-investigation],[data-textbook-review-attempt]").map((_index, element) =>
    $(element).attr("data-response-id") ?? $(element).attr("data-practice-id") ?? $(element).attr("data-save-investigation") ?? $(element).attr("data-textbook-review-attempt")
  ).get();
  assert.ok(stateIds.every((id) => id?.startsWith("biology30-unit-a-pilot-2:")));
  assert.equal(new Set(stateIds).size, stateIds.length);
  assert.doesNotMatch(html, /biology30-unit-a-pilot:(?!-2)/);
  assert.doesNotMatch(html, /Play optional video/i);
  assert.doesNotMatch(html, /autoplay=1/i);
  assert.equal($("[data-media-checkpoint-id]").length, 14);
  assert.equal($("[data-local-equivalent]").length, 14);
  $("[data-local-equivalent]").each((_index, element) => {
    assert.equal($(element).find(".walkthrough-panel").length, 3);
    assert.equal($(element).find(".walkthrough-panel figure").length, 3);
    assert.equal($(element).find(".walkthrough-case").length, 1);
  });
  assert.equal($("#video-library [data-video-panel]").length, 14);
  assert.equal($("[data-media-checkpoint-id] iframe").length, 0);
  assert.match(html, /version:6/);
  assert.match(html, /encoding="hashed-v1"|encoding:"hashed-v1"/);
  assert.match(html, /function stableStateToken\(id\)/);
  assert.match(html, /function expandStoredState\(raw\)/);
  assert.match(html, /function decodeAdvancedBitset\(value\)/);
  assert.match(html, /function encodeAdvancedBitset\(ids\)/);
  assert.match(html, /originalVersion<6\?\[\]/);
  assert.match(html, /Needs media check/);
  assert.match(html, /mediaReadyForRoute/);
  assert.deepEqual($("#video-library .video-playlist h2").map((_index, element) => $(element).text()).get(), ["Chapter 11", "Chapter 12", "Chapter 13"]);
  assert.equal($("#core-vocabulary [data-vocabulary-target]").length, 28);
  assert.equal($("#core-vocabulary [data-vocabulary-entry]").length, 28);
  assert.equal($("#core-vocabulary [data-vocabulary-locked]").length, 28);
  assert.equal($("#core-vocabulary [data-vocabulary-content]").length, 28);
  assert.equal($("#core-vocabulary [data-vocabulary-unlock-link]").length, 28);
  assert.equal($("#core-vocabulary [data-vocabulary-target][disabled]").length, 0);
  assert.match(html, /\.vocabulary-index button\[hidden\]\{display:none\}/);
  assert.doesNotMatch(html, /button\.disabled=!unlocked/);
  assert.match(html, /Full details unlock after you begin/);
  assert.doesNotMatch($("#core-vocabulary").text(), /Lesson 99/);
  assert.ok($("[data-open-textbook][data-printed-page][data-pdf-page]").length >= 20);
  assert.equal($("[data-textbook-review-route]").length, 4);
  assert.equal($("[data-textbook-review-attempt][aria-expanded=false]").length, 4);
  assert.equal($("[data-textbook-review-answer][hidden]").length, 4);
  assert.deepEqual($("[data-textbook-review-answer]").map((_index, element) => $(element).find(".textbook-review-answer-list>li").length).get(), [20, 30, 19, 51]);
  assert.deepEqual($("[data-question-jump]").map((_index, element) => normalizeText($(element).text())).get(), ["Go to the 12 course questions", "Go to the 12 course questions", "Go to the 12 course questions", "Go to the 18 core questions"]);
  for (const record of TEXTBOOK_REVIEW_SUPPORT) {
    const routeHtml = $(`#${record.routeId}`).html() ?? "";
    assert.ok(routeHtml.indexOf("textbook-review-support") < routeHtml.indexOf("practice-stack"));
    assert.equal($(`#${record.routeId} #${record.jumpTargetId}`).length, 1);
    for (const link of record.pageLinks) assert.equal($(`#${record.routeId} [data-open-textbook="${link.documentId}"][data-printed-page="${link.printedPage}"][data-pdf-page="${link.physicalPage}"]`).length, 1);
  }
  const finalHtml = $("#final-practice").html() ?? "";
  assert.ok(finalHtml.indexOf("integrated-regulation") < finalHtml.indexOf("textbook-review-support"));
  assert.ok(finalHtml.indexOf("textbook-review-support") < finalHtml.indexOf("final-practice-core-questions"));
  assert.doesNotMatch($("#final-practice").text(), /Open Lesson 17/i);
  assert.equal($("#textbook-library [data-library-panel]").length, 3);
  assert.equal($("#model-lab [data-model-panel]").length, 13);
  assert.equal(normalizeText($("#model-lab h1").text()), "Models and Data Lab");
  assert.equal($(".lesson-page [data-open-model]").length, 67);
  assert.equal($(".lesson-page [data-open-model]").filter((_index, element) => $(element).closest(".advanced-learning-block").length === 0).length, 27);
  assert.equal($(".lesson-page [data-online-walkthrough] [data-open-model]").length, 14);
  assert.deepEqual(JSON.parse($("html").attr("data-advanced-manifest") ?? "[]"), ADVANCED_LEARNING_MANIFEST_IDS);
  assert.equal($("#advanced-learning [data-advanced-index-item]").length, 40);
  assert.equal($("#advanced-learning [data-advanced-index-item] [data-advanced-complete]").length, 40);
  assert.equal($("#advanced-learning [data-advanced-planned]").length, 0);
  assert.equal($("#advanced-learning [data-advanced-link]").length, 40);
  assert.equal($("[data-advanced-complete]").length, 80);
  $(".lesson-page [data-advanced-block-id]").each((_index, element) => {
    const block = $(element);
    const lessonId = block.attr("data-advanced-lesson");
    const part = block.attr("data-advanced-part");
    assert.ok(block.prev().is(`.learn-block[data-core-zone="${lessonId}-part-${part}"]`));
    assert.equal(block.find(".advanced-evidence table").length, 1);
    assert.equal(block.find("[data-open-model]").length, 1);
    assert.equal(block.find("[data-advanced-complete]").length, 1);
  });
  assert.equal($("#process-collection [data-model-collection]").length, 0);
  assert.equal($("#process-collection [data-all-work-list]").length, 1);
  assert.equal($("#model-lab .model-mechanism .model-step-copy").length, 52);
  assert.equal($("#model-lab [data-model-choice]").length, 49);
  assert.equal($("#model-lab .model-orientation").length, 13);
  assert.equal($("#model-lab .model-plan>div").length, 39);
  assert.equal($("#model-lab [data-model-prediction][maxlength=180]").length, 13);
  assert.equal($("#model-lab [data-test-model]").length, 13);
  assert.equal($("#model-lab [data-model-explanation][maxlength=240]").length, 13);
  assert.match(html, /container-name:model-reader/);
  assert.match(html, /\.model-path\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(html, /@container model-reader \(max-width:560px\)\{[^}]*\.model-plan\{grid-template-columns:1fr/);
  assert.match(html, /@container model-reader \(max-width:560px\)\{[^@]*\.model-path\{grid-template-columns:1fr/);
  assert.match(html, /container-name:media-stage;container-type:inline-size/);
  assert.doesNotMatch(html, /\.illustrated-equivalent li\{display:grid/, "Old numbered-step styling must not squeeze nested feedback diagrams");
  assert.equal($('[data-local-equivalent] .walkthrough-panel').length, 42);
  $("#model-lab [data-model-panel]").each((_index, element) => {
    const modelId = $(element).attr("data-model-panel");
    const model = MODEL_LAB_RECORDS.find((entry) => entry.id === modelId);
    assert.ok(model, `unknown rendered model ${modelId}`);
    assert.equal($(element).find(".model-mechanism .model-path li").length, 4);
    assert.equal($(element).find("[data-model-choice]").length, model.choices.length);
    assert.equal($(element).find("[data-model-result]").length, model.choices.length);
    assert.equal($(element).find(".model-use-sequence span").length, 4);
    assert.equal($(element).find(".model-orientation h3").text(), model.investigationQuestion);
    assert.equal($(element).find(".model-plan>div").length, 3);
    assert.equal($(element).find("[data-model-prediction]").length, 1);
    assert.equal($(element).find("[data-test-model]").length, 1);
    assert.equal($(element).find("[data-model-explanation]").length, 1);
    assert.equal($(element).find("[data-collect-model]").length, 1);
    assert.equal($(element).find("[data-reset-model]").length, 1);
    assert.equal($(element).find("details.model-static-equivalent").length, 1);
  });
  assert.equal($("[data-model-panel=action-potential] [data-model-choice]").length, 7);
  assert.equal($("[data-model-panel=action-potential] [data-model-result][data-result-type=graph][data-has-data-table=true]").length, 7);
  assert.equal($("[data-model-panel=glucose] [data-model-choice]").length, 6);
  assert.equal($("[data-model-panel=glucose] [data-model-result][data-result-type=graph][data-has-data-table=true]").length, 4);
  assert.equal($("[data-model-panel=glucose] [data-model-result][data-result-type=pathway]").length, 2);
  for (const modelId of ["action-potential", "sensory", "hearing", "adh", "glucose"]) {
    assert.ok($(`[data-model-panel=${modelId}] [data-model-result][data-result-type=graph][data-has-data-table=true]`).length > 0);
  }
  assert.match(html, /function resetModel\(id\)/);
  assert.match(html, /delete state\.models\.results\[id\]/);
  assert.match(html, /delete state\.models\.predictions\[id\]/);
  assert.match(html, /delete state\.models\.explanations\[id\]/);
});

test("Process Collection has one complete 178-record index, exact returns, and truthful save states without new persistence", async () => {
  const registry = await readJson<any>("process-collection-index.json");
  const review = await readJson<any>("process-collection-index-review.json");
  const audit = await readJson<any>("process-collection-index-audit.json");
  const contract = await readJson<any>("pilot-2-contract.json");
  const manifest = await readJson<any>("project.json");
  const stateBudget = await readJson<any>("state-budget.json");
  const html = await readFile(workspacePath, "utf8");
  const $ = loadHtml(html);
  const currentSha = await sha256File(workspacePath);

  assert.equal(registry.workspaceSha256, currentSha);
  assert.equal(review.workspaceSha256, currentSha);
  assert.equal(audit.workspaceSha256, currentSha);
  assert.equal(registry.baselineWorkspaceSha256, PROCESS_COLLECTION_BASELINE_SHA256);
  assert.equal(review.baselineWorkspaceSha256, PROCESS_COLLECTION_BASELINE_SHA256);
  assert.equal(registry.records.length, 178);
  assert.equal(registry.expectedCounts.total, 178);
  const expectedCounts = { retrieval: 13, "evidence-slip": 13, practice: 86, "media-checkpoint": 14, frayer: 28, model: 13, investigation: 3, "review-seminar": 3, "textbook-review": 4, "process-note": 1 };
  for (const kind of PROCESS_ACTIVITY_KINDS) assert.equal(registry.records.filter((record: any) => record.kind === kind).length, expectedCounts[kind]);
  assert.equal(new Set(registry.records.map((record: any) => record.id)).size, 178);
  assert.equal(new Set(registry.records.map((record: any) => record.focusTargetId)).size, 178);
  for (const record of registry.records) {
    assert.equal($(`#${record.routeId}`).length, 1, `${record.id} route resolves`);
    assert.equal($(`#${record.focusTargetId}`).length, 1, `${record.id} focus target resolves`);
    assert.ok(record.prompt.length > 0);
    assert.ok(record.stateRef?.kind);
  }
  assert.equal($("#process-collection [data-exit-slip-collection],#process-collection [data-frayer-collection],#process-collection [data-model-collection]").length, 0);
  assert.equal($("#process-collection [data-all-work-list]").length, 1);
  assert.equal($("#process-collection [data-collection-chapter-filter]").length, 1);
  assert.equal($("#process-collection [data-collection-type-filter]").length, 1);
  assert.equal($("#process-collection [data-investigation]").length, 3);
  assert.equal($("#process-collection #collection-notes").length, 1);
  assert.match(html, /href="#'\+record\.routeId\+'\/work\/'\+record\.id/);
  assert.match(html, /function workRouteParts\(value\)/);
  assert.match(html, /function collectionText\(\)/);
  assert.match(html, /data-copy-collection/);
  assert.match(html, /data-print-collection/);
  for (const message of ["Saved to course", "Saved on this device", "Saved on this device only", "Not saved—copy your work before leaving"]) assert.match(html, new RegExp(message.replace(/[—]/g, "—")));
  assert.match(html, /result\.local=\"saved\"/);
  assert.match(html, /lms:api\?\"failed\":\"unavailable\"/);
  assert.equal(registry.createsDuplicateEvidenceState, false);
  assert.equal(registry.completionImpact, false);
  assert.equal(registry.scoringImpact, false);
  assert.equal(registry.persistence.addsLearnerStateFields, false);
  assert.equal(registry.stateSchemaVersion, 6);
  assert.equal(stateBudget.schemaVersion, 6);
  assert.equal(stateBudget.estimatedWorstCaseCharacters, 42383);
  assert.equal(contract.processCollectionIndex.workspaceSha256, currentSha);
  assert.equal(contract.processCollectionIndex.teacherDecision, null);
  assert.equal(contract.advancedBridgeGateB.workspaceSha256, PROCESS_COLLECTION_BASELINE_SHA256);
  assert.equal(contract.advancedBridgeGateB.teacherDecision, null);
  assert.equal(review.preservedAdvancedBridgeReview.teacherDecision, null);
  assert.equal(review.counts.practiceItems, 86);
  assert.equal(review.counts.advancedLearningBlocks, 40);
  assert.equal(review.counts.requiredRoutes, 18);
  assert.equal(review.counts.requiredMinutes, 1505);
  assert.equal(review.counts.optionalMinutes, 295);
  assert.ok(manifest.canonicalSources.includes("projects/biology30-unit-a-pilot-2/meta/process-collection-index.json"));
  assert.ok(manifest.canonicalSources.includes("projects/biology30-unit-a-pilot-2/meta/process-collection-index-review.json"));
  assert.ok(manifest.referenceOnly.includes(`projects/biology30-unit-a-pilot-2/raw/process-collection-index-baselines/${PROCESS_COLLECTION_BASELINE_SHA256}/`));
});

test("Chapter 11 diagram work supplies saved evidence without replacing existing work or required questions", async () => {
  const html = await readFile(workspacePath, "utf8");
  const $ = loadHtml(html);
  const baselinePath = path.join(projectRoot, "raw/chapter-11-academic-baselines", CHAPTER_11_BASELINE, "workspace/index.html");
  assert.equal(await sha256File(baselinePath), CHAPTER_11_BASELINE);
  const before = loadHtml(await readFile(baselinePath, "utf8"));
  const record = await readJson<any>("chapter-11-academic-repair.json");
  const registry = await readJson<any>("process-collection-index.json");
  assert.equal(record.workspaceSha256, await sha256File(workspacePath));
  assert.equal(record.teacherDecision, null);
  assert.equal($("[data-study-task]").length, 6);
  assert.equal(new Set(CHAPTER_11_STUDY_TASKS.map(task => studyResponseId(task.id))).size, 6);
  for (const task of CHAPTER_11_STUDY_TASKS) {
    const target = $(`[data-study-task="${task.id}"]`);
    assert.equal(target.closest("[data-model-panel]").attr("data-model-panel"), task.modelId);
    assert.equal(target.find("textarea").attr("data-response-id"), studyResponseId(task.id));
    assert.equal(target.find("textarea").attr("maxlength"), String(task.maxLength));
    assert.equal(target.find("figure").length, 1);
    assert.ok(target.find("figcaption").text().length > 50);
    assert.ok(target.find("[data-study-guide]").attr("hidden") !== undefined);
    assert.ok(target.find("[data-study-guide]").text().includes(task.guide[0]));
    assert.ok(registry.records.find((entry: any) => entry.id === `model-${task.modelId}`).stateRef.studyTasks.some((entry: any) => entry.responseId === studyResponseId(task.id)));
  }
  before("[data-response-id]").each((_i, node) => assert.equal($(`[data-response-id="${before(node).attr("data-response-id")}"]`).length, 1));
  before("[data-practice-id]").each((_i, node) => {
    const id = before(node).attr("data-practice-id");
    assert.equal($(`[data-practice-id="${id}"] h3`).text(), before(node).find("h3").text(), `${id} question unchanged`);
    for (const attr of ["data-answer", "data-rationale"]) assert.equal($(`[data-practice-id="${id}"] [data-practice-feedback]`).attr(attr), before(node).find("[data-practice-feedback]").attr(attr), `${id} ${attr} unchanged`);
  });
  // Both the lesson figure and unlabelled study figure use the same numeric geometry.
  for (const figure of $("[data-refractory=absolute]").toArray()) {
    assert.equal($(figure).attr("x"), "355");
    assert.equal($(figure).attr("width"), "192");
  }
  assert.equal($("[data-refractory=absolute]").length, 3);
  const vocab = await readJson<any>("core-vocabulary.json");
  const estimate = estimateWorstCaseState(html, vocab.fixedMilestones.map((entry: any) => entry.entryId));
  assert.equal(estimate.responseCount, 79);
  assert.equal(estimate.characters, 42383);
  assert.ok(estimate.characters <= 44000);
  assert.equal($("[data-practice-id]").length, 86);
  assert.equal($("[data-advanced-block-id]").length, 40);
});

test("source files, immutable accepted checkpoints, and protected Pilot 1 / production projects remain exact", async () => {
  const baseline = await readJson<any>("pilot-2-baseline.json");
  const gate1Review = await readJson<any>("gate-1-review.json");
  const gate2Review = await readJson<any>("gate-2-review.json");
  const revisionAReview = await readJson<any>("revision-gate-a-review.json");
  const revisionBReview = await readJson<any>("revision-gate-b-review.json");
  const advancedReview = await readJson<any>("advanced-bridge-gate-a-review.json");
  const advancedGateBReview = await readJson<any>("advanced-bridge-gate-b-review.json");
  const processReview = await readJson<any>("process-collection-index-review.json");
  assert.equal(await sha256File(path.join(repoRoot, "projects", "biology30-unit-a-pilot", "workspace", "index.html")), baseline.sourceWorkspaceSha256);
  assert.equal(await sha256File(path.join(projectRoot, "raw", "index.html")), baseline.rawBaselineSha256);
  assert.equal(await sha256File(path.join(projectRoot, "raw", "gate-1-accepted", "index.html")), gate1Review.workspaceSha256);
  for (const source of TEACHER_SOURCE_FILES) {
    assert.equal(await sha256File(path.join(projectRoot, "raw", "teacher-sources", `${source.sha256}.docx`)), source.sha256);
  }
  const preservedRevisionA = path.join(projectRoot, "raw", "revision-gate-a-accepted", "3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff", "workspace", "index.html");
  assert.equal(await sha256File(preservedRevisionA), "3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff");
  for (const expected of revisionBReview.protectedProjectHashes) {
    // These two new operational reports were authorized with the living playbook.
    // Exclude only their exact paths when comparing the older protected tree;
    // every previously recorded source, learner file and metadata byte still matches.
    const newOperationalReports = expected.slug === "biology30-unit-a-pilot" ? ["meta/biology30-improvement-transfer-contract.json", "meta/bcd-material-readiness.json"] : [];
    const actual = await hashTree(path.join(repoRoot, "projects", expected.slug), expected.slug, [...(expected.excludedPaths ?? []), ...newOperationalReports]);
    assert.deepEqual(newOperationalReports.length ? { ...actual, excludedPaths: expected.excludedPaths } : actual, expected);
  }
  assert.equal(await sha256File(workspacePath), processReview.workspaceSha256);
  assert.equal(processReview.baselineWorkspaceSha256, revisionBReview.workspaceSha256);
  const preservedProcessBaseline = path.join(projectRoot, "raw", "process-collection-index-baselines", processReview.baselineWorkspaceSha256, "workspace", "index.html");
  assert.equal(await sha256File(preservedProcessBaseline), PROCESS_COLLECTION_BASELINE_SHA256);
  assert.equal(revisionAReview.status, "teacher-accepted");
  assert.equal(revisionAReview.teacherDecision.acceptedWorkspaceSha256, "3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff");
  assert.equal(revisionBReview.status, "awaiting-teacher-review");
  assert.equal(revisionBReview.iteration, "advanced-learning-bridge-gate-b");
  assert.equal(revisionBReview.textbookReviewBaseline.workspaceSha256, "24e18ca81a7bf33a0182825be95472fa2a3f6ac55b779f90f14855e25ee9c66c");
  const preservedPriorGateB = path.join(projectRoot, revisionBReview.textbookReviewBaseline.immutableBaseline.replace(/\/baseline\.json$/, "/workspace/index.html"));
  assert.equal(await sha256File(preservedPriorGateB), revisionBReview.textbookReviewBaseline.workspaceSha256);
  const preservedPriorReview = JSON.parse(await readFile(path.join(projectRoot, "raw", "revision-gate-b-review-baselines", revisionBReview.textbookReviewBaseline.workspaceSha256, "meta-snapshot", "revision-gate-b-review.json"), "utf8"));
  assert.equal(preservedPriorReview.status, "changes-requested");
  assert.match(preservedPriorReview.teacherDecision.basis, /textbook chapter and unit review supports/i);
  assert.equal(revisionBReview.advancedBridgeBaseline.workspaceSha256, ADVANCED_BRIDGE_BASELINE_SHA256);
  const preservedAdvancedBaseline = path.join(projectRoot, revisionBReview.advancedBridgeBaseline.immutableBaseline.replace(/\/baseline\.json$/, "/workspace/index.html"));
  assert.equal(await sha256File(preservedAdvancedBaseline), ADVANCED_BRIDGE_BASELINE_SHA256);
  assert.equal(advancedReview.workspaceSha256, "3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6");
  assert.equal(advancedReview.status, "teacher-accepted");
  assert.equal(advancedReview.teacherDecision.decision, "accepted");
  const preservedAdvancedGateA = path.join(projectRoot, advancedReview.immutableBaseline.replace(/\/baseline\.json$/, "/workspace/index.html"));
  assert.equal(await sha256File(preservedAdvancedGateA), advancedReview.workspaceSha256);
  assert.equal(advancedGateBReview.workspaceSha256, revisionBReview.workspaceSha256);
  assert.equal(advancedGateBReview.acceptedGateAWorkspaceSha256, advancedReview.workspaceSha256);
  assert.equal(advancedGateBReview.status, "awaiting-teacher-review");
  assert.equal(advancedGateBReview.teacherDecision, null);
  if (revisionBReview.previousCandidate) {
    const immediatePriorGateB = path.join(projectRoot, revisionBReview.previousCandidate.immutableBaseline.replace(/\/baseline\.json$/, "/workspace/index.html"));
    assert.equal(await sha256File(immediatePriorGateB), revisionBReview.previousCandidate.workspaceSha256);
  }
  assert.equal(gate2Review.status, "changes-requested");
  assert.equal(gate2Review.workspaceSha256, "9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7");
  const preservedGate2 = path.join(projectRoot, "raw", "gate-2-review-baselines", gate2Review.workspaceSha256, "workspace", "index.html");
  assert.equal(await sha256File(preservedGate2), gate2Review.workspaceSha256);
});

test("creation refuses duplicate and mismatched targets", async () => {
  await assert.rejects(
    createBiology30UnitAPilot2({ repoRoot, source: "biology30-unit-a-pilot", project: "biology30-unit-a-pilot-2", sourceWorkspaceSha256: "b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee" }),
    /Refusing existing Pilot 2 target/
  );
  await assert.rejects(
    createBiology30UnitAPilot2({ repoRoot, source: "biology30-unit-a-pilot", project: "biology30-unit-a-pilot-2", sourceWorkspaceSha256: "0".repeat(64) }),
    /does not match the approved Pilot 2 baseline contract/
  );
});

test("a simulated staged-write failure rolls back without a partial project", async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-pilot-2-transaction-"));
  try {
    await mkdir(path.join(fixtureRoot, "projects", "resources"), { recursive: true });
    for (const slug of ["biology30-unit-a-pilot", "biology30-unit-a", "biology30-unit-b", "biology30-unit-c", "biology30-unit-d"]) {
      await symlink(path.join(repoRoot, "projects", slug), path.join(fixtureRoot, "projects", slug), "dir");
    }
    await symlink(path.join(repoRoot, "projects", "resources", "biology30-unit-a-pilot"), path.join(fixtureRoot, "projects", "resources", "biology30-unit-a-pilot"), "dir");
    await writeFile(path.join(fixtureRoot, ".gitignore"), "projects/biology30-unit-a-pilot-2\nprojects/.biology30-unit-a-pilot-2-stage-*\n", "utf8");
    await execFile("git", ["init"], { cwd: fixtureRoot });
    await execFile("git", ["config", "user.email", "fixture@example.invalid"], { cwd: fixtureRoot });
    await execFile("git", ["config", "user.name", "Pilot Fixture"], { cwd: fixtureRoot });
    await execFile("git", ["add", "."], { cwd: fixtureRoot });
    await execFile("git", ["commit", "--no-gpg-sign", "-m", "fixture"], { cwd: fixtureRoot });
    await assert.rejects(
      createBiology30UnitAPilot2({
        repoRoot: fixtureRoot,
        source: "biology30-unit-a-pilot",
        project: "biology30-unit-a-pilot-2",
        sourceWorkspaceSha256: "b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee",
        testHooks: { afterStageWrite: () => { throw new Error("simulated staged-write failure"); } }
      }),
      /simulated staged-write failure/
    );
    await assert.rejects(readFile(path.join(fixtureRoot, "projects", "biology30-unit-a-pilot-2", "workspace", "index.html")), /ENOENT/);
    const projectEntries = await readdir(path.join(fixtureRoot, "projects"));
    assert.equal(projectEntries.some((entry) => entry.startsWith(".biology30-unit-a-pilot-2-stage-")), false);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("the Advanced Bridge builder refuses stale input and preserves the exact pre-bridge candidate on staged failure", async () => {
  await assert.rejects(
    buildBiology30UnitAPilot2Full({
      repoRoot,
      project: "biology30-unit-a-pilot-2",
      acceptedGate1Sha256: "8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe",
      baselineGate2Sha256: "0".repeat(64),
      acceptedRevisionGateASha256: "3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff",
      acceptedAdvancedGateASha256: "3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6",
      revision: "teacher-feedback-1",
      gate: "advanced-bridge-gate-b"
    }),
    /supplied Gate 2 baseline SHA/
  );

  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-pilot-2-revision-transaction-"));
  try {
    const fixtureProjects = path.join(fixtureRoot, "projects");
    const fixtureProject = path.join(fixtureProjects, "biology30-unit-a-pilot-2");
    await mkdir(fixtureProjects, { recursive: true });
    await cp(projectRoot, fixtureProject, { recursive: true });
    const acceptedGateARoot = path.join(fixtureProject, "raw", "advanced-bridge-gate-a-accepted", "3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6");
    await copyFile(path.join(acceptedGateARoot, "workspace", "index.html"), path.join(fixtureProject, "workspace", "index.html"));
    const bridgeBaselineReviewPath = path.join(fixtureProject, "meta", "revision-gate-b-review.json");
    const bridgeBaselineReview = JSON.parse(await readFile(bridgeBaselineReviewPath, "utf8"));
    bridgeBaselineReview.status = "awaiting-teacher-review";
    bridgeBaselineReview.workspaceSha256 = "3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6";
    bridgeBaselineReview.iteration = "advanced-learning-bridge-gate-a";
    bridgeBaselineReview.teacherDecision = null;
    await writeFile(bridgeBaselineReviewPath, `${JSON.stringify(bridgeBaselineReview, null, 2)}\n`, "utf8");
    for (const slug of ["biology30-unit-a-pilot", "biology30-unit-a", "biology30-unit-b", "biology30-unit-c", "biology30-unit-d"]) {
      await symlink(path.join(repoRoot, "projects", slug), path.join(fixtureProjects, slug), "dir");
    }
    const originalSha = await sha256File(path.join(fixtureProject, "workspace", "index.html"));
    await assert.rejects(
      buildBiology30UnitAPilot2Full({
        repoRoot: fixtureRoot,
        project: "biology30-unit-a-pilot-2",
        acceptedGate1Sha256: "8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe",
        baselineGate2Sha256: "9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7",
        acceptedRevisionGateASha256: "3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff",
        acceptedAdvancedGateASha256: "3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6",
        revision: "teacher-feedback-1",
        gate: "advanced-bridge-gate-b",
        testHooks: { afterStageWrite: () => { throw new Error("simulated revision staged-write failure"); } }
      }),
      /simulated revision staged-write failure/
    );
    assert.equal(await sha256File(path.join(fixtureProject, "workspace", "index.html")), originalSha);
    const entries = await readdir(fixtureProjects);
    assert.equal(entries.some((entry) => entry.startsWith(".biology30-unit-a-pilot-2-revision-b-stage-")), false);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("the Advanced Bridge Gate B candidate cannot be rebuilt after the accepted Gate A baseline has moved", async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-pilot-2-gate-b-iteration-"));
  try {
    const fixtureProjects = path.join(fixtureRoot, "projects");
    const fixtureProject = path.join(fixtureProjects, "biology30-unit-a-pilot-2");
    await mkdir(fixtureProjects, { recursive: true });
    await cp(projectRoot, fixtureProject, { recursive: true });
    for (const slug of ["biology30-unit-a-pilot", "biology30-unit-a", "biology30-unit-b", "biology30-unit-c", "biology30-unit-d"]) {
      await symlink(path.join(repoRoot, "projects", slug), path.join(fixtureProjects, slug), "dir");
    }
    const originalSha = await sha256File(path.join(fixtureProject, "workspace", "index.html"));
    await assert.rejects(
      buildBiology30UnitAPilot2Full({
        repoRoot: fixtureRoot,
        project: "biology30-unit-a-pilot-2",
        acceptedGate1Sha256: "8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe",
        baselineGate2Sha256: "9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7",
        acceptedRevisionGateASha256: "3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff",
        acceptedAdvancedGateASha256: "3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6",
        revision: "teacher-feedback-1",
        gate: "advanced-bridge-gate-b",
        testHooks: { afterStageWrite: () => { throw new Error("the strict baseline check should run before staging"); } }
      }),
      /Advanced Bridge Gate B requires the exact accepted Gate A learner SHA/
    );
    assert.equal(await sha256File(path.join(fixtureProject, "workspace", "index.html")), originalSha);
    const entries = await readdir(fixtureProjects);
    assert.equal(entries.some((entry) => entry.startsWith(".biology30-unit-a-pilot-2-revision-b-stage-")), false);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("the Process Collection builder rejects a changed baseline and rolls back a staged failure", async () => {
  await assert.rejects(
    buildBiology30UnitAPilot2ProcessCollectionIndex({
      repoRoot,
      project: "biology30-unit-a-pilot-2",
      baselineAdvancedGateBSha256: "0".repeat(64),
      gate: "process-collection-index"
    }),
    /supplied Advanced Bridge Gate B baseline SHA/
  );

  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-pilot-2-process-index-transaction-"));
  try {
    const fixtureProjects = path.join(fixtureRoot, "projects");
    const fixtureProject = path.join(fixtureProjects, "biology30-unit-a-pilot-2");
    await mkdir(fixtureProjects, { recursive: true });
    await cp(projectRoot, fixtureProject, { recursive: true });
    const baselineRoot = path.join(fixtureProject, "raw", "process-collection-index-baselines", PROCESS_COLLECTION_BASELINE_SHA256);
    await copyFile(path.join(baselineRoot, "workspace", "index.html"), path.join(fixtureProject, "workspace", "index.html"));
    for (const file of ["advanced-bridge-gate-b-review.json", "revision-gate-b-review.json", "pilot-2-contract.json", "state-budget.json", "pilot-2-improvement-ledger.json", "prompt-pack.md"]) {
      await copyFile(path.join(baselineRoot, "meta-snapshot", file), path.join(fixtureProject, "meta", file));
    }
    for (const slug of ["biology30-unit-a-pilot", "biology30-unit-a", "biology30-unit-b", "biology30-unit-c", "biology30-unit-d"]) {
      await symlink(path.join(repoRoot, "projects", slug), path.join(fixtureProjects, slug), "dir");
    }
    const originalSha = await sha256File(path.join(fixtureProject, "workspace", "index.html"));
    await assert.rejects(
      buildBiology30UnitAPilot2ProcessCollectionIndex({
        repoRoot: fixtureRoot,
        project: "biology30-unit-a-pilot-2",
        baselineAdvancedGateBSha256: PROCESS_COLLECTION_BASELINE_SHA256,
        gate: "process-collection-index",
        testHooks: { afterStageWrite: () => { throw new Error("simulated Process Collection staged-write failure"); } }
      }),
      /simulated Process Collection staged-write failure/
    );
    assert.equal(await sha256File(path.join(fixtureProject, "workspace", "index.html")), originalSha);
    assert.equal(originalSha, PROCESS_COLLECTION_BASELINE_SHA256);
    const entries = await readdir(fixtureProjects);
    assert.equal(entries.some((entry) => entry.startsWith(".biology30-unit-a-pilot-2-process-index-stage-")), false);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
