import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, cp, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { load as loadHtml } from "cheerio";

import { validateProjectManifestPolicy } from "../project-manifest-policy.js";
import { buildAtomicCurriculumContract, type Pilot2AtomicContractV1 } from "./atomic-contract.js";
import { PILOT_2_LESSONS, PILOT_2_REVIEW_ROUTES, PILOT_2_SLUG, VIDEO_REMAP, buildPerformanceBehaviours } from "./contracts.js";
import { ACADEMIC_CORRECTION_BASELINE, ACADEMIC_CORRECTION_ID } from "./practice-corrections.js";
import { academicCorrectionBaselineDirectory, academicCorrectionMarkdown, buildAcademicCorrectionReport } from "./academic-corrections.js";
import { hashTree, type TreeHash } from "./create.js";
import { buildModelLabInteractionMap } from "./model-lab-content.js";
import { PROCESS_COLLECTION_BASELINE_SHA256, type ProcessCollectionRegistryV1 } from "./process-collection-content.js";
import { renderPilot2Full } from "./render-gate1.js";
import { replaceMarkdownSection } from "./review-history.js";
import { buildFinalAcademicAudit, FINAL_ACADEMIC_BASELINE, FINAL_ACADEMIC_CHECKPOINT } from "./final-academic-audit.js";
import { buildRenderedFigureInventory, estimateWorstCaseState, fullReadingReport } from "./build-full.js";
import { CHAPTER_11_BASELINE, CHAPTER_11_STUDY_TASKS, CHAPTER_11_SCIENCE_SOURCES, studyResponseId } from "./chapter-11-study.js";
import { ONLINE_BASELINE, onlineBaselineDirectory, buildOnlineFinalizationReport } from "./online-finalization.js";
import { ONLINE_MICROSCOPY } from "./online-studies.js";

const PROCESS_COLLECTION_GATE = "process-collection-index" as const;
const PROTECTED_PROJECTS = ["biology30-unit-a-pilot", "biology30-unit-a", "biology30-unit-b", "biology30-unit-c", "biology30-unit-d"] as const;
const PROTECTED_PROJECT_EXCLUSIONS: Partial<Record<(typeof PROTECTED_PROJECTS)[number], readonly string[]>> = {
  "biology30-unit-a-pilot": ["meta/unit-a-to-bcd-improvement-playbook.md"]
};

export type Pilot2ProcessCollectionBuildRequest = {
  repoRoot: string;
  project: string;
  baselineAdvancedGateBSha256: string;
  gate: string;
  baselineWorkspaceSha256?: string;
  testHooks?: {
    afterStageWrite?: (stageProjectDir: string) => void | Promise<void>;
    beforePromote?: (stageProjectDir: string, targetProjectDir: string) => void | Promise<void>;
  };
};

export type Pilot2ProcessCollectionBuildResult = {
  projectDir: string;
  workspaceSha256: string;
  workspaceTreeSha256: string;
  potentialRecordCount: number;
  stateSchemaVersion: number;
  estimatedWorstCaseStateCharacters: number;
  protectedProjectHashes: TreeHash[];
};

async function pathExists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
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

async function writeJson(targetPath: string, value: unknown) {
  await writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function protectedHashes(repoRoot: string) {
  return Promise.all(PROTECTED_PROJECTS.map((slug) => (
    hashTree(path.join(repoRoot, "projects", slug), slug, PROTECTED_PROJECT_EXCLUSIONS[slug] ?? [])
  )));
}

function assertProtected(expected: TreeHash[], actual: TreeHash[]) {
  const bySlug = new Map(actual.map((entry) => [entry.slug, entry]));
  for (const entry of expected) {
    const found = bySlug.get(entry.slug);
    if (!found || found.sha256 !== entry.sha256 || found.fileCount !== entry.fileCount || found.byteCount !== entry.byteCount) {
      throw new Error(`Protected project changed during the Process Collection build: ${entry.slug}`);
    }
  }
}

function appendJournal(existing: string, workspaceSha256: string) {
  const heading = "## 2026-09-04 — Unified Process Collection index and truthful saves";
  if (existing.split("\n").includes(heading)) return existing;
  const base = existing.trim();
  return `${base}\n\n${heading}\n\nThe Process Collection presentation was rebuilt as one structured **All My Work** index derived from existing state. Its authored registry covers 178 possible records across retrieval, Evidence Slips, practice, media checkpoints, Frayer models, Models and Data Lab, investigations, Review Seminar, textbook-review confirmations, and the learner-created note. Only work that a learner has actually started or saved appears. Chapter and activity filters change the view without changing evidence state, while copy and print use the complete structured collection.\n\nEach record has an allowlisted exact return link in the form \`#<route>/work/<work-id>\`. The link opens its route and any containing disclosure, restores the relevant vocabulary or model selection, scrolls to the source, and moves focus to the exact heading. The three investigation editors and one process note remain below the index under **Continue your work**.\n\nSaving now reports local and LMS outcomes independently. Learners see **Saved to course**, **Saved on this device**, **Saved on this device only**, or **Not saved—copy your work before leaving** according to the destinations that actually succeeded. State remains version 6 and no new learner-state field was added. The Advanced Bridge Gate B review remains anchored to its verified baseline SHA \`${PROCESS_COLLECTION_BASELINE_SHA256}\` with its teacher decision unresolved. This new candidate is separately bound to SHA \`${workspaceSha256}\` and awaits explicit review.\n`;
}

function updatePromptPack(existing: string, workspaceSha256: string, workspaceTreeSha256: string) {
  const heading = "## Current contained enhancement — Process Collection Index";
  return replaceMarkdownSection(existing, heading, `${heading}\n\n- Current canonical workspace SHA-256: \`${workspaceSha256}\`\n- Current workspace tree SHA-256: \`${workspaceTreeSha256}\`\n- Preserved pre-index and Advanced Bridge Gate B review SHA-256: \`${PROCESS_COLLECTION_BASELINE_SHA256}\`\n- Review record: \`meta/process-collection-index-review.json\`\n- Authored registry: \`scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts\`\n- Generated registry: \`meta/process-collection-index.json\`\n\nThis contained candidate replaces duplicate evidence displays with one state-derived **All My Work** index. It does not change course content, Advanced Learning, practice, completion, required or optional time, state schema, Pilot 1, or Units A–D. The earlier Advanced Bridge Gate B review and its unresolved teacher decision remain attached to the preserved pre-index build. No deployment, export, commit, push, publication, Studio editing, or transfer is authorized.\n\n### Review focus\n\n1. Start representative work in every activity category and confirm only meaningful started records appear.\n2. Filter by chapter and activity type; filtering must not change saved state.\n3. Use exact return links with keyboard navigation and confirm the originating heading receives focus.\n4. Confirm copy and print include all started categories even when the visible index is filtered.\n5. Review the four truthful save outcomes with local-only, LMS-success, LMS-failure, and total-failure fixtures.\n6. Confirm the 40 Advanced Learning blocks, 86 practice items, 18 required routes, 1,505 required minutes, and 295 optional minutes are unchanged.\n`);
}

function processRegistryDocument(registry: ProcessCollectionRegistryV1, generatedAt: string, workspaceSha256: string, workspaceTreeSha256: string, stateBudget: Record<string, unknown>) {
  return {
    ...registry,
    generatedAt,
    status: "awaiting-explicit-user-review",
    baselineWorkspaceSha256: PROCESS_COLLECTION_BASELINE_SHA256,
    workspaceSha256,
    workspaceTreeSha256,
    presentation: {
      heading: "All My Work",
      derivation: "existing-saved-state-only",
      rendersOnlyMeaningfulRecords: true,
      chapterFilter: true,
      activityTypeFilter: true,
      stableCourseOrdering: true,
      nestedScrolling: false,
      copyUsesCompleteStructuredIndex: true,
      printUsesCompleteStructuredIndex: true,
      exactReturnPattern: "#<route>/work/<work-id>"
    },
    persistence: {
      stateSchemaVersion: 6,
      addsLearnerStateFields: false,
      saveResultSchema: { local: ["saved", "failed"], lms: ["saved", "unavailable", "failed"] },
      messages: ["Saved to course", "Saved on this device", "Saved on this device only", "Not saved—copy your work before leaving"],
      estimatedWorstCaseCharacters: stateBudget.estimatedWorstCaseCharacters,
      completionImpact: false,
      scoringImpact: false
    },
    deferred: ["earlier-response-history", "multiple-model-runs", "error-repair-activities", "diagram-or-graph-annotation", "multi-entry-notes", "changes-and-comparisons", "my-showcase", "no-write-impersonation-guard", "scorm-export", "deployment", "publication", "lms-certification"]
  };
}

async function validateCandidate(stageProjectDir: string, workspaceSha256: string) {
  const workspacePath = path.join(stageProjectDir, "workspace", "index.html");
  if (await sha256File(workspacePath) !== workspaceSha256) throw new Error("The staged Process Collection workspace changed during validation.");
  const html = await readFile(workspacePath, "utf8");
  const $ = loadHtml(html);
  const metaDir = path.join(stageProjectDir, "meta");
  const registry = JSON.parse(await readFile(path.join(metaDir, "process-collection-index.json"), "utf8"));
  const review = JSON.parse(await readFile(path.join(metaDir, "process-collection-index-review.json"), "utf8"));
  const advancedReview = JSON.parse(await readFile(path.join(metaDir, "advanced-bridge-gate-b-review.json"), "utf8"));
  const contract = JSON.parse(await readFile(path.join(metaDir, "pilot-2-contract.json"), "utf8"));
  const manifest = JSON.parse(await readFile(path.join(metaDir, "project.json"), "utf8"));
  const atomic = JSON.parse(await readFile(path.join(metaDir, "atomic-curriculum-map.json"), "utf8")) as Pilot2AtomicContractV1;
  const practice = JSON.parse(await readFile(path.join(metaDir, "practice-readiness-audit.json"), "utf8"));
  const figureMedia = JSON.parse(await readFile(path.join(metaDir, "figure-media-plan.json"), "utf8"));
  const modelMap = JSON.parse(await readFile(path.join(metaDir, "model-lab-interaction-map.json"), "utf8"));
  const textbook = JSON.parse(await readFile(path.join(metaDir, "textbook-review-integration.json"), "utf8"));

  if (registry.schemaVersion !== 1 || registry.records?.length !== 178 || registry.expectedCounts?.total !== 178 || registry.createsDuplicateEvidenceState !== false || registry.stateSchemaVersion !== 6) throw new Error("The generated Process Collection registry is incomplete.");
  const exactCounts = { retrieval: 13, "evidence-slip": 13, practice: 86, "media-checkpoint": 14, frayer: 28, model: 13, investigation: 3, "review-seminar": 3, "textbook-review": 4, "process-note": 1 };
  for (const [kind, count] of Object.entries(exactCounts)) if (registry.records.filter((record: { kind: string }) => record.kind === kind).length !== count) throw new Error(`Process Collection ${kind} count drifted.`);
  for (const record of registry.records as Array<{ id: string; routeId: string; focusTargetId: string }>) {
    if ($(`#${record.routeId}`).length !== 1 || $(`#${record.focusTargetId}`).length !== 1) throw new Error(`Process Collection record ${record.id} has an unresolved route or focus target.`);
  }
  if ($("#process-collection [data-all-work-list]").length !== 1 || $("#process-collection [data-collection-chapter-filter]").length !== 1 || $("#process-collection [data-collection-type-filter]").length !== 1) throw new Error("The All My Work index or filters are missing.");
  if ($("#process-collection [data-exit-slip-collection],#process-collection [data-frayer-collection],#process-collection [data-model-collection]").length) throw new Error("A duplicate legacy collection remains visible.");
  if ($("#process-collection [data-investigation]").length !== 3 || $("#process-collection #collection-notes").length !== 1) throw new Error("Continue your work must retain three investigations and one note.");
  for (const message of ["Saved to course", "Saved on this device", "Saved on this device only", "Not saved—copy your work before leaving"]) if (!html.includes(message)) throw new Error(`Truthful save message is absent: ${message}`);
  if (!html.includes("version:6") || contract.state?.schemaVersion !== 6 || Number(contract.requiredMinutes) !== 1505 || Number(contract.optionalMinutes) !== 295 || Number(contract.requiredRouteCount) !== 18) throw new Error("The Process Collection candidate changed the state, time, or completion contract.");
  if ($("[data-practice-id]").length !== 86 || $("[data-advanced-block-id]").length !== 40 || $("[data-media-checkpoint-id]").length !== 14 || $(".lesson-page").length !== 13) throw new Error("Course content changed while building the Process Collection index.");
  if (review.workspaceSha256 !== workspaceSha256 || review.baselineWorkspaceSha256 !== PROCESS_COLLECTION_BASELINE_SHA256 || review.teacherDecision !== null || review.status !== "awaiting-teacher-review") throw new Error("The Process Collection review record is not bound to the exact candidate.");
  if (advancedReview.workspaceSha256 !== PROCESS_COLLECTION_BASELINE_SHA256 || advancedReview.teacherDecision !== null || advancedReview.codexReview?.status !== "verified-for-teacher-review") throw new Error("The unresolved Advanced Bridge Gate B review was changed.");
  if (contract.advancedBridgeGateB?.workspaceSha256 !== PROCESS_COLLECTION_BASELINE_SHA256 || contract.advancedBridgeGateB?.teacherDecision !== null || contract.processCollectionIndex?.workspaceSha256 !== workspaceSha256) throw new Error("The new candidate was not separated from the preserved Advanced Bridge review.");
  if (atomic.workspaceSha256 !== workspaceSha256 || practice.workspaceSha256 !== workspaceSha256 || figureMedia.workspaceSha256 !== workspaceSha256 || figureMedia.renderedFigureInventory?.workspaceSha256 !== workspaceSha256 || modelMap.workspaceSha256 !== workspaceSha256 || textbook.workspaceSha256 !== workspaceSha256) throw new Error("A current learner-content contract is not bound to the Process Collection candidate.");
  const manifestResult = validateProjectManifestPolicy(manifest);
  if (manifestResult.status !== "valid" || manifest.authoringStatus !== "blocked" || !["direct-workspace-v1","proposal-only-v1"].includes(manifest.authoring?.driverId) || manifest.authoring?.studioEditing?.enabled !== false || manifest.exportTargets?.some((target: { enabled?: boolean }) => target.enabled !== false)) throw new Error("Pilot 2 escaped its blocked owning-builder boundary.");
}

export async function buildBiology30UnitAPilot2ProcessCollectionIndex(request: Pilot2ProcessCollectionBuildRequest): Promise<Pilot2ProcessCollectionBuildResult> {
  const repoRoot = path.resolve(request.repoRoot);
  if (request.project !== PILOT_2_SLUG) throw new Error(`--project must be ${PILOT_2_SLUG}.`);
  const finalAcademic = request.gate === "final-academic-review";
  if (request.gate !== PROCESS_COLLECTION_GATE && !finalAcademic) throw new Error(`Unsupported contained build gate: ${request.gate}.`);
  if (finalAcademic && request.baselineWorkspaceSha256 !== FINAL_ACADEMIC_BASELINE) throw new Error("Final academic review requires the exact checkpointed workspace SHA.");
  if (request.baselineAdvancedGateBSha256 !== PROCESS_COLLECTION_BASELINE_SHA256) throw new Error("The supplied Advanced Bridge Gate B baseline SHA does not match the verified pre-index candidate.");

  const projectDir = path.join(repoRoot, "projects", PILOT_2_SLUG);
  const metaDir = path.join(projectDir, "meta");
  const workspacePath = path.join(projectDir, "workspace", "index.html");
  if (!(await pathExists(workspacePath))) throw new Error(`Pilot 2 workspace is missing: ${workspacePath}`);
  const currentWorkspaceSha256 = await sha256File(workspacePath);
  if (finalAcademic && currentWorkspaceSha256 !== ACADEMIC_CORRECTION_BASELINE) {
    const correctionPath = path.join(metaDir, "academic-corrections.json");
    const correction = await pathExists(correctionPath) ? JSON.parse(await readFile(correctionPath, "utf8")) : null;
    const onlinePath=path.join(metaDir,"online-finalization.json");
    const online=await pathExists(onlinePath)?JSON.parse(await readFile(onlinePath,"utf8")):null;
    const onlineDescendant=correction?.workspaceSha256===ONLINE_BASELINE && online?.baselineWorkspaceSha256===ONLINE_BASELINE && online.workspaceSha256===currentWorkspaceSha256 && online.teacherDecision===null;
    if (correction?.baselineWorkspaceSha256 !== ACADEMIC_CORRECTION_BASELINE || (correction.workspaceSha256 !== currentWorkspaceSha256 && !onlineDescendant) || correction.teacherDecision !== null) throw new Error("Academic correction requires its exact approved baseline or recorded unreviewed descendant.");
  }
  if (finalAcademic && currentWorkspaceSha256 !== FINAL_ACADEMIC_BASELINE) {
    const currentReviewPath = path.join(metaDir, "final-academic-review.json");
    const currentReview = await pathExists(currentReviewPath) ? JSON.parse(await readFile(currentReviewPath, "utf8")) : null;
    if (currentReview?.baselineWorkspaceSha256 !== FINAL_ACADEMIC_BASELINE || currentReview.workspaceSha256 !== currentWorkspaceSha256 || currentReview.teacherDecision !== null) throw new Error("Final academic review candidate drifted from its recorded checkpoint or unreviewed descendant.");
  }
  const existingProcessReviewPath = path.join(metaDir, "process-collection-index-review.json");
  const existingProcessReview = await pathExists(existingProcessReviewPath) ? JSON.parse(await readFile(existingProcessReviewPath, "utf8")) : null;
  const continuingUnreviewedCandidate = existingProcessReview?.gate === PROCESS_COLLECTION_GATE
    && existingProcessReview?.baselineWorkspaceSha256 === PROCESS_COLLECTION_BASELINE_SHA256
    && existingProcessReview?.workspaceSha256 === currentWorkspaceSha256
    && existingProcessReview?.teacherDecision === null;
  if (currentWorkspaceSha256 !== PROCESS_COLLECTION_BASELINE_SHA256 && !continuingUnreviewedCandidate) throw new Error(`Process Collection Index requires the exact pre-index learner SHA ${PROCESS_COLLECTION_BASELINE_SHA256} or its current unreviewed descendant.`);

  const [advancedReview, revisionReview, contract, manifest, vocabulary, sourceMedia, curriculum, sourceCrosswalk, practiceBlueprint, practiceReadiness, figureMediaPlan, textbookReview, routeStateMap, stateBudget, improvementLedger, existingJournal, existingPromptPack] = await Promise.all([
    readFile(path.join(metaDir, "advanced-bridge-gate-b-review.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "revision-gate-b-review.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "pilot-2-contract.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "project.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "core-vocabulary.json"), "utf8").then(JSON.parse),
    readFile(path.join(repoRoot, "projects", "biology30-unit-a-pilot", "meta", "media-integration.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "curriculum-performance-map.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "teacher-source-crosswalk.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "practice-blueprint.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "practice-readiness-audit.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "figure-media-plan.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "textbook-review-integration.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "route-response-map.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "state-budget.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "pilot-2-improvement-ledger.json"), "utf8").then(JSON.parse),
    readFile(path.join(metaDir, "pilot-2-improvement-journal.md"), "utf8"),
    readFile(path.join(metaDir, "prompt-pack.md"), "utf8")
  ]);
  if (advancedReview.status !== "awaiting-teacher-review" || advancedReview.workspaceSha256 !== PROCESS_COLLECTION_BASELINE_SHA256 || advancedReview.teacherDecision !== null || advancedReview.codexReview?.status !== "verified-for-teacher-review" || advancedReview.codexReview?.workspaceSha256 !== PROCESS_COLLECTION_BASELINE_SHA256) throw new Error("The verified Advanced Bridge Gate B review record is missing or has drifted.");
  if (revisionReview.workspaceSha256 !== PROCESS_COLLECTION_BASELINE_SHA256 || revisionReview.teacherDecision !== null || contract.advancedBridgeGateB?.workspaceSha256 !== PROCESS_COLLECTION_BASELINE_SHA256 || contract.advancedBridgeGateB?.teacherDecision !== null) throw new Error("The unresolved Gate B review boundary has drifted.");
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.studioEditing?.enabled !== false || manifest.exportTargets?.some((target: { enabled?: boolean }) => target.enabled !== false)) throw new Error("Pilot 2 is not blocked, preview-only, and non-exportable.");
  const preservedBaselinePath = path.join(projectDir, "raw", "process-collection-index-baselines", PROCESS_COLLECTION_BASELINE_SHA256, "workspace", "index.html");
  if (currentWorkspaceSha256 !== PROCESS_COLLECTION_BASELINE_SHA256 && (!(await pathExists(preservedBaselinePath)) || await sha256File(preservedBaselinePath) !== PROCESS_COLLECTION_BASELINE_SHA256)) throw new Error("The immutable pre-index baseline is missing or changed.");

  const protectedBefore = await protectedHashes(repoRoot);
  const videos = VIDEO_REMAP.map((record) => {
    const source = sourceMedia.videos.find((video: { youtubeId?: string }) => video.youtubeId === record.youtubeId);
    if (!source) throw new Error(`Required mapped video is absent from the media contract: ${record.youtubeId}`);
    return { ...source, ...record, chapter: PILOT_2_LESSONS.find((lesson) => lesson.id === record.routeId)?.chapter ?? 11 };
  });
  const fixedVocabularyIds = vocabulary.fixedMilestones.map((entry: { entryId: string }) => entry.entryId);
  const wordData=JSON.parse(await readFile(path.join(metaDir,"word-details.json"),"utf8"));
  const rendered = renderPilot2Full({ lessons: PILOT_2_LESSONS, vocabularyEntries: vocabulary.entries, fixedVocabularyIds, videos, wordData });
  const generatedAt = new Date().toISOString();
  curriculum.performanceBehaviours = buildPerformanceBehaviours();
  curriculum.generatedAt = generatedAt;
  curriculum.sourceClassification = { acceptableExamples: 47, excellenceExamples: 5, localCurriculumCriteria: 1, interpretation: "Source-column classification, not an exhaustive list of requirements or proof of mastery. Required outcomes remain controlled by the Program of Studies." };
  const atomicBuild = buildAtomicCurriculumContract({ html: rendered.html, curriculum, crosswalk: sourceCrosswalk, practice: practiceBlueprint, vocabularyEntries: vocabulary.entries, generatedAt });

  const projectsDir = path.join(repoRoot, "projects");
  const stageContainer = await mkdtemp(path.join(projectsDir, ".biology30-unit-a-pilot-2-process-index-stage-"));
  const stageProjectDir = path.join(stageContainer, PILOT_2_SLUG);
  let backupDir = "";
  try {
    await cp(projectDir, stageProjectDir, { recursive: true, force: false });
    const stageWorkspaceDir = path.join(stageProjectDir, "workspace");
    const stageMetaDir = path.join(stageProjectDir, "meta");
    const onlineBaseline=path.join(stageProjectDir,onlineBaselineDirectory);
    const onlineBaselineHtml=path.join(onlineBaseline,"workspace","index.html");
    if(!await pathExists(onlineBaselineHtml)){
      if(currentWorkspaceSha256!==ONLINE_BASELINE)throw new Error("Cannot reconstruct the immutable online-revision baseline from a later build.");
      await mkdir(path.dirname(onlineBaselineHtml),{recursive:true});
      await copyFile(workspacePath,onlineBaselineHtml);
      await cp(metaDir,path.join(onlineBaseline,"meta"),{recursive:true,filter:source=>!source.endsWith(".zip")});
      await writeJson(path.join(onlineBaseline,"baseline.json"),{workspaceSha256:ONLINE_BASELINE,capturedAt:generatedAt,status:"changes-requested",userDirection:"Finish the remaining work as one candidate; delivery is fully online.",teacherDecision:null});
    }
    if(await sha256File(onlineBaselineHtml)!==ONLINE_BASELINE)throw new Error("Online-revision baseline drifted.");
    const microscopyPath=path.join(stageWorkspaceDir,ONLINE_MICROSCOPY.asset);
    if(!await pathExists(microscopyPath)){
      const response=await fetch(ONLINE_MICROSCOPY.assetUrl);
      if(!response.ok)throw new Error(`CDC image intake failed: ${response.status}`);
      const bytes=Buffer.from(await response.arrayBuffer());
      if(createHash("sha256").update(bytes).digest("hex")!==ONLINE_MICROSCOPY.sha256)throw new Error("CDC image changed; inspect and approve its provenance before replacing it.");
      await mkdir(path.dirname(microscopyPath),{recursive:true});
      await writeFile(microscopyPath,bytes);
    }
    if(await sha256File(microscopyPath)!==ONLINE_MICROSCOPY.sha256)throw new Error("Local microscopy asset checksum mismatch.");
    if (finalAcademic) {
      const correctionBaseline = path.join(stageProjectDir, academicCorrectionBaselineDirectory);
      const correctionWorkspace = path.join(correctionBaseline, "workspace", "index.html");
      if (!(await pathExists(correctionWorkspace))) {
        if (currentWorkspaceSha256 !== ACADEMIC_CORRECTION_BASELINE) throw new Error("Missing immutable academic correction baseline.");
        await mkdir(path.dirname(correctionWorkspace), { recursive: true });
        await copyFile(workspacePath, correctionWorkspace);
        await cp(metaDir, path.join(correctionBaseline, "meta"), { recursive: true, filter: source => !source.endsWith(".zip") });
      }
      if (await sha256File(correctionWorkspace) !== ACADEMIC_CORRECTION_BASELINE) throw new Error("Immutable academic correction baseline drifted.");
      const academicBaseline = path.join(stageProjectDir, "raw", "final-academic-baselines", FINAL_ACADEMIC_BASELINE);
      const academicBaselineWorkspace = path.join(academicBaseline, "workspace", "index.html");
      if (!(await pathExists(academicBaselineWorkspace))) {
        if (currentWorkspaceSha256 !== FINAL_ACADEMIC_BASELINE) throw new Error("Cannot recreate a missing academic baseline from a later candidate.");
        await mkdir(path.dirname(academicBaselineWorkspace), { recursive: true });
        await mkdir(path.join(academicBaseline, "meta-snapshot"), { recursive: true });
        await copyFile(workspacePath, academicBaselineWorkspace);
        for (const file of ["atomic-curriculum-map.json", "process-collection-index-review.json", "pilot-2-improvement-ledger.json", "pilot-2-improvement-journal.md", "practice-readiness-audit.json"]) await copyFile(path.join(metaDir, file), path.join(academicBaseline, "meta-snapshot", file));
        await writeJson(path.join(academicBaseline, "baseline.json"), { workspaceSha256: FINAL_ACADEMIC_BASELINE, checkpointCommit: FINAL_ACADEMIC_CHECKPOINT, capturedAt: generatedAt, status: "changes-requested", basis: "User authorized final Unit A corrections and a reproducible B-D runbook; historical teacher acceptances retain their exact prior scopes." });
      }
      if (await sha256File(academicBaselineWorkspace) !== FINAL_ACADEMIC_BASELINE) throw new Error("Academic baseline changed.");
    }
    const baselineDir = path.join(stageProjectDir, "raw", "process-collection-index-baselines", PROCESS_COLLECTION_BASELINE_SHA256);
    const baselineWorkspacePath = path.join(baselineDir, "workspace", "index.html");
    const baselineMetaDir = path.join(baselineDir, "meta-snapshot");
    await mkdir(path.dirname(baselineWorkspacePath), { recursive: true });
    await mkdir(baselineMetaDir, { recursive: true });
    if (!(await pathExists(baselineWorkspacePath))) {
      await copyFile(workspacePath, baselineWorkspacePath);
      for (const file of ["advanced-bridge-gate-b-review.json", "revision-gate-b-review.json", "pilot-2-contract.json", "state-budget.json", "pilot-2-improvement-ledger.json", "prompt-pack.md"]) await copyFile(path.join(metaDir, file), path.join(baselineMetaDir, file));
      await writeJson(path.join(baselineDir, "baseline.json"), { schemaVersion: 1, project: PILOT_2_SLUG, capturedAt: generatedAt, workspaceSha256: PROCESS_COLLECTION_BASELINE_SHA256, workspaceTreeSha256: advancedReview.workspaceTreeSha256, reviewStatusAtCapture: advancedReview.status, teacherDecisionAtCapture: null, protectedProjectHashes: protectedBefore, purpose: "Immutable verified Advanced Bridge Gate B learner build before the contained Process Collection Index enhancement." });
    }
    if (await sha256File(baselineWorkspacePath) !== PROCESS_COLLECTION_BASELINE_SHA256) throw new Error("The preserved Process Collection baseline does not match the verified pre-index build.");

    const stageWorkspacePath = path.join(stageWorkspaceDir, "index.html");
    if (finalAcademic) {
      const chapterBaseline = path.join(stageProjectDir, "raw", "chapter-11-academic-baselines", CHAPTER_11_BASELINE);
      const preservedWorkspace = path.join(chapterBaseline, "workspace", "index.html");
      if (!(await pathExists(preservedWorkspace))) {
        if (await sha256File(workspacePath) !== CHAPTER_11_BASELINE) throw new Error("Chapter 11 revision baseline drifted; refusing to replace the candidate.");
        await mkdir(path.dirname(preservedWorkspace), { recursive: true });
        await copyFile(workspacePath, preservedWorkspace);
        await cp(metaDir, path.join(chapterBaseline, "meta"), { recursive: true, filter: source => !source.endsWith(".zip") });
      }
      if (await sha256File(preservedWorkspace) !== CHAPTER_11_BASELINE) throw new Error("Preserved Chapter 11 baseline changed.");
    }
    await writeFile(stageWorkspacePath, atomicBuild.html, "utf8");
    const workspaceSha256 = await sha256File(stageWorkspacePath);
    const workspaceTree = await hashTree(stageWorkspaceDir, "workspace");
    const atomicContract: Pilot2AtomicContractV1 = { ...atomicBuild.contract, workspaceSha256 };
    const academicAudit = finalAcademic ? buildFinalAcademicAudit(atomicBuild.html, atomicContract, generatedAt) : null;
    const corrections = finalAcademic ? buildAcademicCorrectionReport(
      await readFile(path.join(stageProjectDir, academicCorrectionBaselineDirectory, "workspace", "index.html"), "utf8"),
      await readFile(onlineBaselineHtml, "utf8"),
      JSON.parse(await readFile(path.join(stageProjectDir, academicCorrectionBaselineDirectory, "meta", "remaining-academic-review.json"), "utf8")),
      generatedAt,
    ) : null;
    const stateEstimate = estimateWorstCaseState(atomicBuild.html, fixedVocabularyIds);
    if (stateEstimate.characters > 44000) throw new Error("Chapter 11 saved responses exceed the state budget.");
    const onlineReport=buildOnlineFinalizationReport(await readFile(onlineBaselineHtml,"utf8"),atomicBuild.html,generatedAt,stateEstimate.characters);
    await writeJson(path.join(stageMetaDir,"online-finalization.json"),onlineReport);
    Object.assign(stateBudget, {
      estimatedWorstCaseCharacters: stateEstimate.characters,
      responseCountAtWorstCase: stateEstimate.responseCount,
      headroomBelowRuntimeGuard: 48000 - stateEstimate.characters,
      headroomBelowPlatformLimit: 60000 - stateEstimate.characters,
      chapter11StudyResponseCount: CHAPTER_11_STUDY_TASKS.length,
      chapter11Migration: "Six new allowlisted response IDs begin empty. Existing v6 responses, model predictions/results, practice IDs and completion are unchanged; no new top-level state field."
    });
    const processRegistry = processRegistryDocument(rendered.processCollectionRegistry, generatedAt, workspaceSha256, workspaceTree.sha256, stateBudget);
    const modelMap = buildModelLabInteractionMap(workspaceSha256, generatedAt);

    practiceBlueprint.workspaceSha256 = workspaceSha256;
    practiceBlueprint.status = finalAcademic ? "source-reviewed-awaiting-teacher-clearance" : "process-collection-index-awaiting-teacher-review";
    practiceBlueprint.updatedAt = generatedAt;
    practiceReadiness.workspaceSha256 = workspaceSha256;
    if (academicAudit) {
      for (const group of ["lessonItems", "chapterItems", "finalCoreItems", "challengeItems"]) for (const planned of practiceBlueprint[group]) {
        const reviewed = corrections!.items.find((item) => item.id === planned.id) ?? corrections!.items.find((item) => item.id === planned.id.replace(/-guided-(\d)$/, "-guided-0$1"));
        if (!reviewed) throw new Error(`Unmapped practice blueprint item ${planned.id}`);
        if (planned.id !== reviewed.id) { planned.supersededPlanningId = planned.id; planned.id = reviewed.id; }
        planned.outcomeIds = academicAudit.practice.find((item) => item.id === planned.id)!.outcomeIds;
        planned.sourceReview = "meta/final-academic-review.json";
        planned.cognitiveLevel = academicAudit.practice.find((item) => item.id === planned.id)!.alignment.cognitiveDemand;
        planned.alignmentScope = "supporting-concept-not-complete-behaviour-demonstration";
        planned.performanceBehaviourIds = academicAudit.practice.find((item) => item.id === planned.id)!.performanceBehaviourIds.filter((id) => curriculum.performanceBehaviours.find((entry: { id: string; standard: string }) => entry.id === id)?.standard !== "excellence" || group === "challengeItems");
      }
      practiceBlueprint.alignmentReviewPolicy = "Each question has an authored concept-level source mapping in final-academic-review.json. Supporting a performance example is not proof of its full diagram, experimental or communication operation; separate exact task bindings provide those opportunities. Cognitive labels describe authored demand, not measured student difficulty.";
      practiceBlueprint.finalTopicReview = academicAudit.finalPracticeTopicReview;
      Object.assign(practiceReadiness, {
        gate: "final-academic-review", generatedAt, academicClearance: false,
        policy: "The 86 item meanings and keys retain the source-grounded review preserved in academic-corrections.json; the online-finalization guard proves their entire rendered question/feedback surfaces are unchanged. This is an authoring review, not teacher acceptance, observed mastery or diploma-exam certification.",
        counts: { total: 86, required: 80, optional: 6, structurallyValid: 86, sourceReviewed: 86 },
        records: academicAudit.practice
      });
    }
    figureMediaPlan.workspaceSha256 = workspaceSha256;
    figureMediaPlan.videos = figureMediaPlan.videos.map((video: {youtubeId:string}) => ({...video, localEquivalentStepCount:3, localEquivalentWorkedCase:true, review:"meta/online-finalization.json"}));
    figureMediaPlan.renderedFigureInventory = {
      ...buildRenderedFigureInventory({ html: atomicBuild.html, atomicContract, sourceCrosswalk, acceptedRasterFigures: figureMediaPlan.figures }),
      workspaceSha256,
      generatedAt
    };
    figureMediaPlan.chapter11StudyFigures = {
      workspaceSha256,
      count: CHAPTER_11_STUDY_TASKS.length,
      contract: "meta/chapter-11-academic-repair.json",
      scope: "Six model-panel study figures are separate from the lesson-only renderedFigureInventory. Text, SVG descriptions and tables are available locally; teacher acceptance of this context remains pending.",
      records: CHAPTER_11_STUDY_TASKS.map(task => ({ id: `study-${task.id}`, modelId: task.modelId, lessonId: task.lessonId, selector: `[data-study-task="${task.id}"] figure`, sourceInput: "scripts/lib/biology30-unit-a-pilot-2/chapter-11-study.ts", teacherDecision: null }))
    };
    figureMediaPlan.updatedAt = generatedAt;
    textbookReview.workspaceSha256 = workspaceSha256;
    textbookReview.generatedAt = generatedAt;
    routeStateMap.processCollectionIndexWorkspaceSha256 = workspaceSha256;
    routeStateMap.processCollectionIndexBaselineWorkspaceSha256 = PROCESS_COLLECTION_BASELINE_SHA256;
    routeStateMap.stateSchemaVersion = 6;
    routeStateMap.updatedAt = generatedAt;

    contract.processCollectionIndex = {
      status: "awaiting-teacher-review",
      baselineWorkspaceSha256: PROCESS_COLLECTION_BASELINE_SHA256,
      workspaceSha256,
      workspaceTreeSha256: workspaceTree.sha256,
      potentialRecords: 178,
      stateSchemaVersion: 6,
      addsLearnerStateFields: false,
      completionImpact: false,
      scoringImpact: false,
      requiredMinutesImpact: false,
      optionalMinutesImpact: false,
      reviewRecord: "meta/process-collection-index-review.json",
      registry: "meta/process-collection-index.json",
      teacherDecision: null
    };

    const processReview = {
      schemaVersion: 1,
      project: PILOT_2_SLUG,
      gate: PROCESS_COLLECTION_GATE,
      status: "awaiting-teacher-review",
      generatedAt,
      baselineWorkspaceSha256: PROCESS_COLLECTION_BASELINE_SHA256,
      workspaceSha256,
      workspaceTreeSha256: workspaceTree.sha256,
      preservedAdvancedBridgeReview: { reviewRecord: "meta/advanced-bridge-gate-b-review.json", workspaceSha256: PROCESS_COLLECTION_BASELINE_SHA256, teacherDecision: null },
      counts: { potentialRecords: 178, routes: rendered.learnerRoutes.length, lessons: PILOT_2_LESSONS.length, reviewRoutes: PILOT_2_REVIEW_ROUTES.length, practiceItems: 86, advancedLearningBlocks: 40, mediaCheckpoints: 14, requiredRoutes: 18, requiredMinutes: 1505, optionalMinutes: 295 },
      reviewCriteria: ["only meaningful started or saved records appear", "chapter and activity filters do not mutate state", "all exact return links open their allowlisted source and focus its heading", "copy and print use the complete structured index", "the four save-result conditions display truthful messages", "state remains version 6 and within the existing budget", "Process Collection work cannot affect completion or scoring", "desktop, tablet, mobile, keyboard, print, and 200 percent zoom layouts do not clip or overflow"],
      codexReview: null,
      teacherDecision: null,
      authorizationBoundary: finalAcademic ? "The user authorized the local checkpoint, contained Unit A academic corrections and the B-D production recipe. This record describes the carried-forward Process Collection feature, not academic clearance. No push, deployment, export, publication, Studio editing or B-D implementation." : "Review-only Process Collection enhancement. No deployment, export, publication, commit, push, Studio editing, Pilot 1 change, or Unit B-D change is authorized."
    };
    const processAudit = {
      schemaVersion: 1,
      project: PILOT_2_SLUG,
      generatedAt,
      workspaceSha256,
      baselineWorkspaceSha256: PROCESS_COLLECTION_BASELINE_SHA256,
      registry: "meta/process-collection-index.json",
      counts: processRegistry.expectedCounts,
      preservedContracts: { stateSchemaVersion: 6, worstCaseStateCharacters: stateBudget.estimatedWorstCaseCharacters, advancedLearningBlocks: 40, practiceItems: 86, requiredRoutes: 18, requiredMinutes: 1505, optionalMinutes: 295 },
      completionImpact: false,
      scoringImpact: false,
      addsLearnerStateFields: false,
      status: "static-validation-pending"
    };

    improvementLedger.workspaceSha256 = workspaceSha256;
    improvementLedger.reviewGate = PROCESS_COLLECTION_GATE;
    const processRule = { id: "unified-process-collection-index-and-truthful-save-status", status: "awaiting-explicit-user-review", acceptedScope: null, evidence: "meta/process-collection-index.json", review: "meta/process-collection-index-review.json" };
    improvementLedger.rules = [...improvementLedger.rules.filter((rule: { id: string }) => rule.id !== processRule.id), processRule];
    improvementLedger.updatedAt = generatedAt;

    const canonicalProcessMeta = ["process-collection-index.json", "process-collection-index-review.json", "process-collection-index-audit.json"];
    manifest.updatedAt = generatedAt;
    manifest.canonicalSources = [...new Set([...(manifest.canonicalSources ?? []), ...canonicalProcessMeta.map((file) => `projects/${PILOT_2_SLUG}/meta/${file}`)])];
    manifest.referenceOnly = [...new Set([...(manifest.referenceOnly ?? []), `projects/${PILOT_2_SLUG}/raw/process-collection-index-baselines/${PROCESS_COLLECTION_BASELINE_SHA256}/`])];
    manifest.sourceOfTruthNotes = `The directly authored Process Collection Index candidate at SHA-256 ${workspaceSha256} is canonical and blocked for exact-build review. The verified Advanced Bridge Gate B learner build remains preserved at SHA-256 ${PROCESS_COLLECTION_BASELINE_SHA256}; its teacher decision remains unresolved and was not reassigned to this contained enhancement. State stays version 6. Pilot 1 and production Units A-D are protected references. Export, promotion, deployment, Studio editing, and B-D transfer are not authorized.`;

    const journal = appendJournal(existingJournal, workspaceSha256);
    const promptPack = finalAcademic ? replaceMarkdownSection(existingPromptPack, "## Current academic review and B-D production recipe", `## Current academic review and B-D production recipe\n\n- Current learner SHA: \`${workspaceSha256}\`; tree SHA: \`${workspaceTree.sha256}\`.\n- Checkpoint: \`${FINAL_ACADEMIC_CHECKPOINT}\`; immutable pre-audit SHA: \`${FINAL_ACADEMIC_BASELINE}\`.\n- Corrective batch: [practice and source-column changes](./academic-corrections.md), [all 86 before/after records](./academic-corrections.json), and [exact-build verification](./academic-corrections-verification.json). The review-only findings remain attached to the preserved 21363490 baseline, not this corrected build.\n- Start at [the canonical playbook](../../biology30-unit-a-pilot/meta/unit-a-to-bcd-improvement-playbook.md#current-production-recipe), then [the exact academic findings](./final-academic-review.json), [both-pilot transfer contract](../../biology30-unit-a-pilot/meta/biology30-improvement-transfer-contract.json), and [B-D material readiness](../../biology30-unit-a-pilot/meta/bcd-material-readiness.json).\n- Status: complete online authoring candidate, awaiting one complete exact-build teacher review; blocked and non-exportable. Author verification is not teacher acceptance.\n- The preceding Chapter 11 batch added six saved diagram/reasoning tasks inside Models and Data Lab and repairs the numeric action-potential graph. See [the authored task contract](./chapter-11-academic-repair.json). Existing question IDs, core prose, counts, state schema and completion rules remain unchanged; six new allowlisted response IDs raise the worst-case estimate to 42,284 characters. The current batch corrects 49 textbook locators, 188 distractors, all 258 visible wrong-choice explanations and key-position bias without changing prompts/keys. Changed alternatives use fresh choice values; saved old answers retain their original meaning. The 53 source records now distinguish 47 acceptable examples, five excellence examples and one local criterion. Those historical gaps are superseded by [online finalization](./online-finalization.json): five saved identification matrices, one rights-cleared microscopy observation, three fully online investigations, fourteen transcript-reviewed focused excerpts and forty-two illustrated panels. State remains v6; six further compact response IDs bring the worst case to 42,738 characters. Read the final clearance notes before approval. Physical lab operation, real collaboration, learner pace and LMS certification are not claimed.\n- Rebuild only through authored TypeScript using \`--gate final-academic-review --baseline-workspace-sha ${FINAL_ACADEMIC_BASELINE}\`. Do not patch generated HTML.\n- B-D use the owning production builder and a full-unit build followed by review, after Unit A acceptance and complete unit-specific intake. No intermediate slice pause or automatic acceptance transfer.\n- The checkpoint is complete. No further commit, push, deployment, export, publication or B-D implementation is included. Historical build sections elsewhere describe their named prior candidates, not current clearance.\n`) : updatePromptPack(existingPromptPack, workspaceSha256, workspaceTree.sha256);
    await Promise.all([
      writeFile(stageWorkspacePath, atomicBuild.html, "utf8"),
      writeJson(path.join(stageMetaDir, "atomic-curriculum-map.json"), atomicContract),
      writeJson(path.join(stageMetaDir, "practice-blueprint.json"), practiceBlueprint),
      writeJson(path.join(stageMetaDir, "practice-readiness-audit.json"), practiceReadiness),
      writeJson(path.join(stageMetaDir, "figure-media-plan.json"), figureMediaPlan),
      writeJson(path.join(stageMetaDir, "model-lab-interaction-map.json"), modelMap),
      writeJson(path.join(stageMetaDir, "textbook-review-integration.json"), textbookReview),
      writeJson(path.join(stageMetaDir, "route-response-map.json"), routeStateMap),
      writeJson(path.join(stageMetaDir, "state-budget.json"), stateBudget),
      writeJson(path.join(stageMetaDir, "pilot-2-contract.json"), contract),
      writeJson(path.join(stageMetaDir, "process-collection-index.json"), processRegistry),
      writeJson(path.join(stageMetaDir, "process-collection-index-review.json"), processReview),
      writeJson(path.join(stageMetaDir, "process-collection-index-audit.json"), processAudit),
      writeJson(path.join(stageMetaDir, "pilot-2-improvement-ledger.json"), improvementLedger),
      writeFile(path.join(stageMetaDir, "pilot-2-improvement-journal.md"), journal, "utf8"),
      writeFile(path.join(stageMetaDir, "prompt-pack.md"), promptPack, "utf8"),
      writeJson(path.join(stageMetaDir, "project.json"), manifest)
    ]);
    if (academicAudit) {
      const chapter11Record = {
        schemaVersion: 1, project: PILOT_2_SLUG, generatedAt, workspaceSha256,
        baselineWorkspaceSha256: CHAPTER_11_BASELINE, status: "awaiting-explicit-user-review", teacherDecision: null,
        sourceInput: "scripts/lib/biology30-unit-a-pilot-2/chapter-11-study.ts",
        sources: CHAPTER_11_SCIENCE_SOURCES.map(source => ({ ...source, checkedAt: "2026-09-05" })),
        curriculum: { url: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf", physicalPages: [6, 7] },
        tasks: CHAPTER_11_STUDY_TASKS.map(task => ({ ...task, responseId: studyResponseId(task.id), selector: `[data-study-task="${task.id}"]`, collectionRecordId: `model-${task.modelId}`, outcomeIds: [...new Set(task.behaviourIds.map(id => id.split("-")[0]))], rights: "Original authored SVG/semantic diagrams; existing course brain schematic reused for letter identification. No new third-party raster assets.", accessibility: "Native disclosures, labelled keyboard-editable response, adjacent full text/table equivalent; SVGs can be enlarged." })),
        invariants: { requiredPracticeItems: 80, optionalPracticeItems: 6, requiredRoutes: 18, stateVersion: 6, requiredMinutes: 1505, optionalMinutes: 295, collectionRecords: 178, completionImpact: false },
        remaining: ["Earlier implementation gaps are superseded by meta/online-finalization.json.", "Teacher review of the complete online build remains pending; no physical-lab certification or B-D transfer is implied."]
      };
      await writeJson(path.join(stageMetaDir, "chapter-11-academic-repair.json"), chapter11Record);
      routeStateMap.chapter11StudyResponseIds = CHAPTER_11_STUDY_TASKS.map(task => studyResponseId(task.id));
      await writeJson(path.join(stageMetaDir, "route-response-map.json"), routeStateMap);
      contract.chapter11AcademicRepair = { workspaceSha256, baselineWorkspaceSha256: CHAPTER_11_BASELINE, reviewRecord: "meta/chapter-11-academic-repair.json", teacherDecision: null, status: "awaiting-explicit-user-review" };
      const reading = JSON.parse(await readFile(path.join(metaDir, "reading-level-report.json"), "utf8"));
      reading.workspaceSha256 = workspaceSha256;
      reading.generatedAt = generatedAt;
      reading.revisionGateBCoreLessons = fullReadingReport(atomicBuild.html);
      reading.interpretation = "Readability is a diagnostic, not proof that explanations or prerequisites are sufficient.";
      if (reading.revisionGateBCoreLessons.some((entry: { fleschKincaidGrade: number; averageSentenceWords: number; longestCoreParagraphWords: number }) => entry.fleschKincaidGrade > 12 || entry.averageSentenceWords > 20 || entry.longestCoreParagraphWords > 100)) throw new Error("Final academic revision exceeds the preserved core reading guard.");
      await writeJson(path.join(stageMetaDir, "reading-level-report.json"), reading);
      await writeJson(path.join(stageMetaDir, "final-academic-review.json"), academicAudit);
      contract.finalAcademicReview = { workspaceSha256, baselineWorkspaceSha256: FINAL_ACADEMIC_BASELINE, reviewRecord: "meta/final-academic-review.json", status: academicAudit.status, teacherDecision: null, transferReady: false };
      improvementLedger.reviewGate = "final-academic-review";
      for (const id of ["explicit-academic-evidence-without-route-fallbacks", "exact-first-use-vocabulary-links", "append-only-improvement-history"]) if (!improvementLedger.rules.some((rule: { id: string }) => rule.id === id)) improvementLedger.rules.push({ id, status: "awaiting-explicit-user-review", acceptedScope: null, evidence: "meta/final-academic-review.json" });
      const academicRule = improvementLedger.rules.find((rule: { id: string }) => rule.id === "explicit-academic-evidence-without-route-fallbacks");
      academicRule.correctionIteration = { id: ACADEMIC_CORRECTION_ID, workspaceSha256: corrections!.workspaceSha256, baselineWorkspaceSha256: ACADEMIC_CORRECTION_BASELINE, evidence: "meta/academic-corrections.json", review: "meta/academic-corrections-verification.json", status: "awaiting-explicit-user-review", teacherDecision: null };
      contract.onlineFinalization={workspaceSha256,reviewRecord:"meta/online-finalization.json",baselineWorkspaceSha256:ONLINE_BASELINE,status:"awaiting-explicit-user-review",teacherDecision:null};
      const onlineRule={id:"complete-online-investigation-and-media-paths",status:"awaiting-explicit-user-review",acceptedScope:null,evidence:"meta/online-finalization.json"};
      if(!improvementLedger.rules.some((rule:{id:string})=>rule.id===onlineRule.id))improvementLedger.rules.push(onlineRule);
      manifest.canonicalSources=[...new Set([...manifest.canonicalSources,...["online-finalization","online-media","online-video-review","online-studies","online-investigations","render-online","practice-academic-review"].map(name=>`scripts/lib/biology30-unit-a-pilot-2/${name}.ts`),`projects/${PILOT_2_SLUG}/meta/online-finalization.json`])];
      manifest.referenceOnly=[...new Set([...manifest.referenceOnly,`projects/${PILOT_2_SLUG}/${onlineBaselineDirectory}/`])];
      contract.academicCorrections = academicRule.correctionIteration;
      await writeJson(path.join(stageMetaDir, "curriculum-performance-map.json"), curriculum);
      await writeJson(path.join(stageMetaDir, "academic-corrections.json"), corrections);
      await writeFile(path.join(stageMetaDir, "academic-corrections.md"), academicCorrectionMarkdown(corrections!), "utf8");
      manifest.canonicalSources = [...new Set([...manifest.canonicalSources, `scripts/lib/biology30-unit-a-pilot-2/practice-corrections.ts`, `scripts/lib/biology30-unit-a-pilot-2/academic-corrections.ts`, `projects/${PILOT_2_SLUG}/meta/academic-corrections.json`])];
      manifest.referenceOnly = [...new Set([...manifest.referenceOnly, `projects/${PILOT_2_SLUG}/${academicCorrectionBaselineDirectory}/`])];
      academicRule.chapter11Iteration = { workspaceSha256, evidence: "meta/chapter-11-academic-repair.json", review: "meta/final-academic-verification.json", status: "awaiting-explicit-user-review", teacherDecision: null, scope: "Six saved identification/reasoning tasks and corrected action-potential graph. Task presence is not demonstrated mastery or approval of practical skills." };
      manifest.canonicalSources = [...new Set([...manifest.canonicalSources, `projects/${PILOT_2_SLUG}/meta/final-academic-review.json`])];
      manifest.canonicalSources = [...new Set([...manifest.canonicalSources, `scripts/lib/biology30-unit-a-pilot-2/chapter-11-study.ts`, `projects/${PILOT_2_SLUG}/meta/chapter-11-academic-repair.json`])];
      manifest.referenceOnly = [...new Set([...manifest.referenceOnly, `projects/${PILOT_2_SLUG}/raw/chapter-11-academic-baselines/${CHAPTER_11_BASELINE}/`])];
      manifest.sourceOfTruthNotes = `The learner candidate is generated from authored TypeScript under scripts/lib/biology30-unit-a-pilot-2/. Workspace SHA ${workspaceSha256} is a complete online authoring candidate blocked for exact-build teacher review. See meta/final-academic-review.json. Direct Studio editing, export, deployment and B-D transfer remain disabled. The checkpoint is ${FINAL_ACADEMIC_CHECKPOINT}.`;
      manifest.authoring.driverId = "proposal-only-v1";
      manifest.canonicalSources=[...new Set([...manifest.canonicalSources,`projects/${PILOT_2_SLUG}/meta/word-details.json`,...["a-word-page","a-word-runtime","word-record","word-reader","word-frayer-state","word-frayer-runtime"].map(name=>`scripts/lib/biology30-vocabulary/${name}.ts`)])];
      manifest.canonicalEntry = "scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts";
      manifest.canonicalSources = [...new Set([...manifest.canonicalSources.filter((file:string)=>file!==`projects/${PILOT_2_SLUG}/workspace/index.html`),manifest.canonicalEntry,...["panel","render-a","a-entry","a-bridge"].map(name=>`scripts/lib/biology30-vocabulary/${name}.ts`)])];
      manifest.generatedOutputs = [...new Set([...(manifest.generatedOutputs??[]),`projects/${PILOT_2_SLUG}/workspace/index.html`])];
      manifest.regenerateCommand = `npm run build:biology30-unit-a-pilot-2 -- --project ${PILOT_2_SLUG} --gate final-academic-review --baseline-workspace-sha ${FINAL_ACADEMIC_BASELINE}`;
      manifest.sourceOfTruthNotes += " In-lesson vocabulary is owned by the authored renderer and scripts/lib/biology30-vocabulary/. Frayer controls are shared by moving their single DOM instance; no additional saved responses. Hosted and packaged copies require separate refresh and are not updated by this build.";
      await Promise.all([writeJson(path.join(stageMetaDir, "pilot-2-contract.json"), contract), writeJson(path.join(stageMetaDir, "pilot-2-improvement-ledger.json"), improvementLedger), writeJson(path.join(stageMetaDir, "project.json"), manifest)]);
    }

    await request.testHooks?.afterStageWrite?.(stageProjectDir);
    await validateCandidate(stageProjectDir, workspaceSha256);
    assertProtected(protectedBefore, await protectedHashes(repoRoot));
    await request.testHooks?.beforePromote?.(stageProjectDir, projectDir);

    backupDir = path.join(projectsDir, `.biology30-unit-a-pilot-2-process-index-backup-${randomUUID()}`);
    await rename(projectDir, backupDir);
    try {
      await rename(stageProjectDir, projectDir);
    } catch (error) {
      await rename(backupDir, projectDir);
      backupDir = "";
      throw error;
    }
    await rm(backupDir, { recursive: true, force: true });
    backupDir = "";
    await rm(stageContainer, { recursive: true, force: true });
    return { projectDir, workspaceSha256, workspaceTreeSha256: workspaceTree.sha256, potentialRecordCount: 178, stateSchemaVersion: 6, estimatedWorstCaseStateCharacters: Number(stateBudget.estimatedWorstCaseCharacters), protectedProjectHashes: protectedBefore };
  } catch (error) {
    if (backupDir && await pathExists(backupDir) && !(await pathExists(projectDir))) await rename(backupDir, projectDir);
    await rm(stageContainer, { recursive: true, force: true });
    throw error;
  }
}
