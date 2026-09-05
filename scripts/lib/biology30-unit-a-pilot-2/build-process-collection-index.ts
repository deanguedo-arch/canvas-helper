import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, cp, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { load as loadHtml } from "cheerio";

import { validateProjectManifestPolicy } from "../project-manifest-policy.js";
import { buildAtomicCurriculumContract, type Pilot2AtomicContractV1 } from "./atomic-contract.js";
import { PILOT_2_LESSONS, PILOT_2_REVIEW_ROUTES, PILOT_2_SLUG, VIDEO_REMAP } from "./contracts.js";
import { hashTree, type TreeHash } from "./create.js";
import { buildModelLabInteractionMap } from "./model-lab-content.js";
import { PROCESS_COLLECTION_BASELINE_SHA256, type ProcessCollectionRegistryV1 } from "./process-collection-content.js";
import { renderPilot2Full } from "./render-gate1.js";

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
  const base = existing.split(heading)[0].trim();
  return `${base}\n\n${heading}\n\nThe Process Collection presentation was rebuilt as one structured **All My Work** index derived from existing state. Its authored registry covers 178 possible records across retrieval, Evidence Slips, practice, media checkpoints, Frayer models, Models and Data Lab, investigations, Review Seminar, textbook-review confirmations, and the learner-created note. Only work that a learner has actually started or saved appears. Chapter and activity filters change the view without changing evidence state, while copy and print use the complete structured collection.\n\nEach record has an allowlisted exact return link in the form \`#<route>/work/<work-id>\`. The link opens its route and any containing disclosure, restores the relevant vocabulary or model selection, scrolls to the source, and moves focus to the exact heading. The three investigation editors and one process note remain below the index under **Continue your work**.\n\nSaving now reports local and LMS outcomes independently. Learners see **Saved to course**, **Saved on this device**, **Saved on this device only**, or **Not saved—copy your work before leaving** according to the destinations that actually succeeded. State remains version 6 and no new learner-state field was added. The Advanced Bridge Gate B review remains anchored to its verified baseline SHA \`${PROCESS_COLLECTION_BASELINE_SHA256}\` with its teacher decision unresolved. This new candidate is separately bound to SHA \`${workspaceSha256}\` and awaits explicit review.\n`;
}

function updatePromptPack(existing: string, workspaceSha256: string, workspaceTreeSha256: string) {
  const heading = "## Current contained enhancement — Process Collection Index";
  const base = existing.split(heading)[0].trim();
  return `${base}\n\n${heading}\n\n- Current canonical workspace SHA-256: \`${workspaceSha256}\`\n- Current workspace tree SHA-256: \`${workspaceTreeSha256}\`\n- Preserved pre-index and Advanced Bridge Gate B review SHA-256: \`${PROCESS_COLLECTION_BASELINE_SHA256}\`\n- Review record: \`meta/process-collection-index-review.json\`\n- Authored registry: \`scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts\`\n- Generated registry: \`meta/process-collection-index.json\`\n\nThis contained candidate replaces duplicate evidence displays with one state-derived **All My Work** index. It does not change course content, Advanced Learning, practice, completion, required or optional time, state schema, Pilot 1, or Units A–D. The earlier Advanced Bridge Gate B review and its unresolved teacher decision remain attached to the preserved pre-index build. No deployment, export, commit, push, publication, Studio editing, or transfer is authorized.\n\n### Review focus\n\n1. Start representative work in every activity category and confirm only meaningful started records appear.\n2. Filter by chapter and activity type; filtering must not change saved state.\n3. Use exact return links with keyboard navigation and confirm the originating heading receives focus.\n4. Confirm copy and print include all started categories even when the visible index is filtered.\n5. Review the four truthful save outcomes with local-only, LMS-success, LMS-failure, and total-failure fixtures.\n6. Confirm the 40 Advanced Learning blocks, 86 practice items, 18 required routes, 1,505 required minutes, and 295 optional minutes are unchanged.\n`;
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
  if (manifestResult.status !== "valid" || manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "direct-workspace-v1" || manifest.authoring?.studioEditing?.enabled !== false || manifest.exportTargets?.some((target: { enabled?: boolean }) => target.enabled !== false)) throw new Error("Pilot 2 escaped its blocked direct-workspace boundary.");
}

export async function buildBiology30UnitAPilot2ProcessCollectionIndex(request: Pilot2ProcessCollectionBuildRequest): Promise<Pilot2ProcessCollectionBuildResult> {
  const repoRoot = path.resolve(request.repoRoot);
  if (request.project !== PILOT_2_SLUG) throw new Error(`--project must be ${PILOT_2_SLUG}.`);
  if (request.gate !== PROCESS_COLLECTION_GATE) throw new Error(`--gate must be ${PROCESS_COLLECTION_GATE}.`);
  if (request.baselineAdvancedGateBSha256 !== PROCESS_COLLECTION_BASELINE_SHA256) throw new Error("The supplied Advanced Bridge Gate B baseline SHA does not match the verified pre-index candidate.");

  const projectDir = path.join(repoRoot, "projects", PILOT_2_SLUG);
  const metaDir = path.join(projectDir, "meta");
  const workspacePath = path.join(projectDir, "workspace", "index.html");
  if (!(await pathExists(workspacePath))) throw new Error(`Pilot 2 workspace is missing: ${workspacePath}`);
  const currentWorkspaceSha256 = await sha256File(workspacePath);
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
  const rendered = renderPilot2Full({ lessons: PILOT_2_LESSONS, vocabularyEntries: vocabulary.entries, fixedVocabularyIds, videos });
  const generatedAt = new Date().toISOString();
  const atomicBuild = buildAtomicCurriculumContract({ html: rendered.html, curriculum, crosswalk: sourceCrosswalk, practice: practiceBlueprint, vocabularyEntries: vocabulary.entries, generatedAt });

  const projectsDir = path.join(repoRoot, "projects");
  const stageContainer = await mkdtemp(path.join(projectsDir, ".biology30-unit-a-pilot-2-process-index-stage-"));
  const stageProjectDir = path.join(stageContainer, PILOT_2_SLUG);
  let backupDir = "";
  try {
    await cp(projectDir, stageProjectDir, { recursive: true, force: false });
    const stageWorkspaceDir = path.join(stageProjectDir, "workspace");
    const stageMetaDir = path.join(stageProjectDir, "meta");
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
    await writeFile(stageWorkspacePath, atomicBuild.html, "utf8");
    const workspaceSha256 = await sha256File(stageWorkspacePath);
    const workspaceTree = await hashTree(stageWorkspaceDir, "workspace");
    const atomicContract: Pilot2AtomicContractV1 = { ...atomicBuild.contract, workspaceSha256 };
    const processRegistry = processRegistryDocument(rendered.processCollectionRegistry, generatedAt, workspaceSha256, workspaceTree.sha256, stateBudget);
    const modelMap = buildModelLabInteractionMap(workspaceSha256, generatedAt);

    practiceBlueprint.workspaceSha256 = workspaceSha256;
    practiceBlueprint.status = "process-collection-index-awaiting-teacher-review";
    practiceBlueprint.updatedAt = generatedAt;
    practiceReadiness.workspaceSha256 = workspaceSha256;
    figureMediaPlan.workspaceSha256 = workspaceSha256;
    figureMediaPlan.renderedFigureInventory.workspaceSha256 = workspaceSha256;
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
      authorizationBoundary: "Review-only Process Collection enhancement. No deployment, export, publication, commit, push, Studio editing, Pilot 1 change, or Unit B-D change is authorized."
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
    const promptPack = updatePromptPack(existingPromptPack, workspaceSha256, workspaceTree.sha256);
    await Promise.all([
      writeFile(stageWorkspacePath, atomicBuild.html, "utf8"),
      writeJson(path.join(stageMetaDir, "atomic-curriculum-map.json"), atomicContract),
      writeJson(path.join(stageMetaDir, "practice-blueprint.json"), practiceBlueprint),
      writeJson(path.join(stageMetaDir, "practice-readiness-audit.json"), practiceReadiness),
      writeJson(path.join(stageMetaDir, "figure-media-plan.json"), figureMediaPlan),
      writeJson(path.join(stageMetaDir, "model-lab-interaction-map.json"), modelMap),
      writeJson(path.join(stageMetaDir, "textbook-review-integration.json"), textbookReview),
      writeJson(path.join(stageMetaDir, "route-response-map.json"), routeStateMap),
      writeJson(path.join(stageMetaDir, "pilot-2-contract.json"), contract),
      writeJson(path.join(stageMetaDir, "process-collection-index.json"), processRegistry),
      writeJson(path.join(stageMetaDir, "process-collection-index-review.json"), processReview),
      writeJson(path.join(stageMetaDir, "process-collection-index-audit.json"), processAudit),
      writeJson(path.join(stageMetaDir, "pilot-2-improvement-ledger.json"), improvementLedger),
      writeFile(path.join(stageMetaDir, "pilot-2-improvement-journal.md"), journal, "utf8"),
      writeFile(path.join(stageMetaDir, "prompt-pack.md"), promptPack, "utf8"),
      writeJson(path.join(stageMetaDir, "project.json"), manifest)
    ]);

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
