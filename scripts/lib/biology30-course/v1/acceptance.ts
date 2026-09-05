import { createHash } from "node:crypto";
import { lstat, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ProjectManifest } from "../../types.js";
import { hashBiologyWorkspaceTree } from "../../biology30-unit-a/v2/gate2-build.js";

const SUPPORTED_PROJECTS = new Set([
  "biology30-unit-b",
  "biology30-unit-c",
  "biology30-unit-d"
]);

export const BIOLOGY30_COURSE_ACCEPTANCE_CATEGORIES = [
  { id: "academic", label: "Academic alignment and accuracy", shortLabel: "Academic", points: 25, minimum: 20 },
  { id: "coherence", label: "Instructional coherence", shortLabel: "Coherence", points: 20, minimum: 16 },
  { id: "visual", label: "Visual and editorial quality", shortLabel: "Visual", points: 15, minimum: 12 },
  { id: "practice", label: "Practice and investigations", shortLabel: "Practice", points: 15, minimum: 12 },
  { id: "accessibility", label: "Accessibility", shortLabel: "Accessibility", points: 10, minimum: 8 },
  { id: "runtime", label: "Local-first runtime and persistence", shortLabel: "Runtime", points: 10, minimum: 8 },
  { id: "maintainability", label: "Maintainability and Studio readiness", shortLabel: "Maintainability", points: 5, minimum: 4 }
] as const;

export type Biology30CourseAcceptanceV1 = {
  schemaVersion: 1;
  projectSlug: string;
  acceptedBuildSha256: string;
  reviewer: string;
  reviewedAt: string;
  categoryScores: Record<string, number>;
  totalScore: number;
  binaryBlockers: string[];
  decision: "accepted";
  scoredBy: "user";
  userConfirmed: true;
  authorizationSource: "explicit-user-message";
  authorizationText: string;
  statement: string;
};

export type Biology30CourseAcceptanceRequest = {
  repoRoot: string;
  project: string;
  acceptancePath: string;
  testHooks?: {
    beforeCommit?: (targetPath: string, index: number) => void | Promise<void>;
  };
};

export type Biology30CourseAcceptanceResult = {
  projectDir: string;
  acceptedBuildSha256: string;
  totalScore: number;
  canonicalAcceptancePath: string;
  recordedAt: string;
  promotionAuthorized: false;
  exportAuthorized: false;
};

type AcceptanceMatrix = {
  schemaVersion: number;
  projectSlug: string;
  buildSha256: string;
  generatedAt: string;
  status: string;
  automaticPromotion: boolean;
  minimumTotal: number;
  categories: Array<{ id: string; label: string; points: number; minimum: number; score: number | null }>;
  binaryBlockers: string[];
  automatedEvidencePass: boolean;
  humanDecision: string | null;
  humanTotal?: number | null;
  humanReviewer?: string | null;
  humanReviewedAt?: string | null;
  humanAcceptancePath?: string | null;
};

type ProductionCandidate = {
  buildSha256: string;
  status: string;
  ownership: string;
  studioEditingEnabled: boolean;
  exportEnabled: boolean;
  humanAcceptancePath?: string;
};

type QualityReadiness = {
  buildSha256: string;
  status: string;
  automaticPromotion: boolean;
  humanTotal: number | null;
  humanDecision: string | null;
  promotionAuthorized: boolean;
  exportAuthorized: boolean;
  binaryBlockerAudit: {
    automatedOrVisualBlockersFound: number;
    humanConfirmation: boolean | null;
    evidencePaths: string[];
  };
  humanReviewer?: string;
  humanReviewedAt?: string;
  humanAcceptancePath?: string;
};

type ProductionReview = {
  buildSha256: string;
  status: string;
  decision: string | null;
  promotionAuthorized: boolean;
  exportAuthorized: boolean;
  unresolvedRedTeamFindings: unknown[];
  humanTotal?: number;
  humanReviewer?: string;
  humanReviewedAt?: string;
  humanAcceptancePath?: string;
};

type Replacement = {
  targetPath: string;
  stagedPath: string;
  backupPath: string;
  hadOriginal: boolean;
  promoted: boolean;
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

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

function json(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateAuthorizationText(acceptance: Biology30CourseAcceptanceV1) {
  const text = acceptance.authorizationText;
  if (!text.includes(acceptance.acceptedBuildSha256) || !/\baccept\w*\b/i.test(text)) {
    throw new Error("The Biology acceptance authorization must explicitly accept the exact candidate build hash.");
  }
  if (!new RegExp(`\\b${acceptance.totalScore}\\s*\\/\\s*100\\b`).test(text)) {
    throw new Error("The Biology acceptance authorization must state the exact total score out of 100.");
  }
  for (const category of BIOLOGY30_COURSE_ACCEPTANCE_CATEGORIES) {
    const score = acceptance.categoryScores[category.id];
    const pattern = new RegExp(`${escapeRegExp(category.shortLabel)}[^\\n;]{0,80}${score}\\s*\\/\\s*${category.points}`, "i");
    if (!pattern.test(text)) {
      throw new Error(`The Biology acceptance authorization must state the ${category.shortLabel} score as ${score}/${category.points}.`);
    }
  }
}

function validateAcceptance(input: {
  acceptance: Biology30CourseAcceptanceV1;
  project: string;
  buildSha256: string;
  matrix: AcceptanceMatrix;
}) {
  const { acceptance, project, buildSha256, matrix } = input;
  if (acceptance.schemaVersion !== 1 || acceptance.projectSlug !== project) {
    throw new Error("The Biology human-acceptance record has an invalid project or schema.");
  }
  if (acceptance.acceptedBuildSha256 !== buildSha256 || matrix.buildSha256 !== buildSha256) {
    throw new Error("The Biology human-acceptance record is stale for the current exact candidate build.");
  }
  if (
    !acceptance.reviewer?.trim()
    || !safeIsoDate(acceptance.reviewedAt)
    || acceptance.decision !== "accepted"
    || acceptance.scoredBy !== "user"
    || acceptance.userConfirmed !== true
    || acceptance.authorizationSource !== "explicit-user-message"
    || !acceptance.authorizationText?.trim()
  ) {
    throw new Error("The Biology human-acceptance record is incomplete or is not explicitly user-authorized.");
  }
  if (!Array.isArray(acceptance.binaryBlockers) || acceptance.binaryBlockers.length !== 0) {
    throw new Error("The Biology candidate cannot be accepted with a binary blocker.");
  }
  if (
    matrix.schemaVersion !== 1
    || matrix.projectSlug !== project
    || matrix.minimumTotal !== 95
    || matrix.automaticPromotion !== false
    || matrix.automatedEvidencePass !== true
    || matrix.humanDecision !== null
    || matrix.categories.some((category) => category.score !== null)
  ) {
    throw new Error("The Biology acceptance matrix is not ready for a first exact-build human decision.");
  }
  const expectedIds = BIOLOGY30_COURSE_ACCEPTANCE_CATEGORIES.map((category) => category.id).sort();
  const actualIds = Object.keys(acceptance.categoryScores ?? {}).sort();
  if (actualIds.join("\0") !== expectedIds.join("\0")) {
    throw new Error("The Biology human-acceptance record must score every rubric category exactly once.");
  }
  const matrixById = new Map(matrix.categories.map((category) => [category.id, category]));
  let total = 0;
  for (const category of BIOLOGY30_COURSE_ACCEPTANCE_CATEGORIES) {
    const matrixCategory = matrixById.get(category.id);
    if (
      !matrixCategory
      || matrixCategory.label !== category.label
      || matrixCategory.points !== category.points
      || matrixCategory.minimum !== category.minimum
    ) {
      throw new Error(`The Biology acceptance matrix has drifted for ${category.id}.`);
    }
    const score = acceptance.categoryScores[category.id];
    if (!Number.isInteger(score) || score < category.minimum || score > category.points) {
      throw new Error(`The Biology human score for ${category.id} must be an integer from ${category.minimum} to ${category.points}.`);
    }
    total += score;
  }
  if (acceptance.totalScore !== total || total < 95) {
    throw new Error("The Biology human-acceptance total must equal the category sum and be at least 95.");
  }
  if (
    !acceptance.statement?.includes(buildSha256)
    || !acceptance.statement.includes(`${acceptance.totalScore}/100`)
    || !/\baccept\w*\b/i.test(acceptance.statement)
  ) {
    throw new Error("The Biology acceptance statement must explicitly accept the exact build and total score.");
  }
  validateAuthorizationText(acceptance);
}

async function commitTransactionalWrites(input: {
  repoRoot: string;
  project: string;
  values: Array<{ targetPath: string; value: unknown }>;
  beforeCommit?: (targetPath: string, index: number) => void | Promise<void>;
}) {
  const projectsDir = path.join(input.repoRoot, "projects");
  const stageRoot = await mkdtemp(path.join(projectsDir, `.${input.project}-acceptance-stage-`));
  const backupRoot = await mkdtemp(path.join(projectsDir, `.${input.project}-acceptance-backup-`));
  const replacements: Replacement[] = [];
  try {
    for (const [index, entry] of input.values.entries()) {
      const stagedPath = path.join(stageRoot, `${String(index).padStart(2, "0")}-${path.basename(entry.targetPath)}`);
      await writeFile(stagedPath, json(entry.value), "utf8");
      await readJson(stagedPath);
      replacements.push({
        targetPath: entry.targetPath,
        stagedPath,
        backupPath: path.join(backupRoot, `${String(index).padStart(2, "0")}-${path.basename(entry.targetPath)}`),
        hadOriginal: false,
        promoted: false
      });
    }
    for (const [index, replacement] of replacements.entries()) {
      await input.beforeCommit?.(replacement.targetPath, index);
      replacement.hadOriginal = await pathExists(replacement.targetPath);
      if (replacement.hadOriginal) await rename(replacement.targetPath, replacement.backupPath);
      await rename(replacement.stagedPath, replacement.targetPath);
      replacement.promoted = true;
    }
  } catch (error) {
    for (const replacement of [...replacements].reverse()) {
      if (replacement.promoted && await pathExists(replacement.targetPath)) {
        await rm(replacement.targetPath, { force: true });
      }
      if (replacement.hadOriginal && await pathExists(replacement.backupPath)) {
        await rename(replacement.backupPath, replacement.targetPath);
      }
    }
    throw error;
  } finally {
    await rm(stageRoot, { recursive: true, force: true });
    await rm(backupRoot, { recursive: true, force: true });
  }
}

export async function recordBiology30CourseAcceptance(
  request: Biology30CourseAcceptanceRequest
): Promise<Biology30CourseAcceptanceResult> {
  const repoRoot = path.resolve(request.repoRoot);
  const project = request.project.trim();
  if (!SUPPORTED_PROJECTS.has(project)) {
    throw new Error("Biology course acceptance supports only biology30-unit-b, biology30-unit-c, or biology30-unit-d.");
  }
  const projectDir = path.join(repoRoot, "projects", project);
  const workspaceDir = path.join(projectDir, "workspace");
  const metaDir = path.join(projectDir, "meta");
  const canonicalAcceptancePath = path.join(metaDir, "human-acceptance.json");
  const acceptancePath = path.resolve(request.acceptancePath);
  if (acceptancePath === canonicalAcceptancePath) {
    throw new Error("Provide a separate acceptance submission file; the canonical human-acceptance.json is written transactionally.");
  }
  const acceptanceStat = await lstat(acceptancePath);
  if (!acceptanceStat.isFile() || acceptanceStat.isSymbolicLink()) {
    throw new Error("The Biology acceptance submission must be a regular JSON file.");
  }
  if (await pathExists(canonicalAcceptancePath)) {
    throw new Error("The Biology candidate already has a canonical human-acceptance record; refusing to overwrite it.");
  }

  const acceptanceRaw = await readFile(acceptancePath, "utf8");
  const acceptance = JSON.parse(acceptanceRaw) as Biology30CourseAcceptanceV1;
  const workspace = await hashBiologyWorkspaceTree(workspaceDir);
  const [
    manifest,
    productionBuild,
    candidate,
    matrix,
    visualReview,
    visualAudit,
    productionReview,
    quality,
    recommendation
  ] = await Promise.all([
    readJson<ProjectManifest>(path.join(metaDir, "project.json")),
    readJson<{ buildSha256: string; status: string; automatedEvidencePass: boolean }>(path.join(metaDir, "production-build.json")),
    readJson<ProductionCandidate>(path.join(metaDir, "production-candidate.json")),
    readJson<AcceptanceMatrix>(path.join(metaDir, "acceptance-matrix.json")),
    readJson<{ buildSha256: string; pass: boolean; findings: unknown[] }>(path.join(metaDir, "visual-review.json")),
    readJson<{ buildSha256: string; geometry: { pass: boolean; findingCount: number }; visualInspection: { status: string; unresolvedFindings: number } }>(path.join(metaDir, "visual-audit.json")),
    readJson<ProductionReview>(path.join(metaDir, "production-review.json")),
    readJson<QualityReadiness>(path.join(metaDir, "quality-readiness-evidence.json")),
    readJson<{ buildSha256: string; recommendationOnly: boolean; recommendedTotal: number; automatedOrVisualBinaryBlockersFound: number; authorization: Record<string, boolean> }>(path.join(metaDir, "agent-score-recommendation.json"))
  ]);
  const buildSha256 = workspace.sha256;
  const exactBuildRecords = [
    productionBuild.buildSha256,
    candidate.buildSha256,
    matrix.buildSha256,
    visualReview.buildSha256,
    visualAudit.buildSha256,
    productionReview.buildSha256,
    quality.buildSha256,
    recommendation.buildSha256
  ];
  if (exactBuildRecords.some((value) => value !== buildSha256)) {
    throw new Error("The Biology exact-build evidence is stale for the current workspace tree.");
  }
  if (
    manifest.slug !== project
    || manifest.authoringStatus !== "blocked"
    || manifest.authoring?.driverId !== "proposal-only-v1"
    || manifest.authoring?.studioEditing?.enabled !== false
    || (manifest.exportTargets ?? []).some((target) => target.enabled !== false)
    || candidate.ownership !== "proposal-only-v1"
    || candidate.studioEditingEnabled !== false
    || candidate.exportEnabled !== false
  ) {
    throw new Error("The Biology candidate is not an intact blocked proposal-only workspace.");
  }
  if (
    productionBuild.automatedEvidencePass !== true
    || visualReview.pass !== true
    || (visualReview.findings ?? []).length !== 0
    || visualAudit.geometry.pass !== true
    || visualAudit.geometry.findingCount !== 0
    || !visualAudit.visualInspection.status.includes("passed")
    || visualAudit.visualInspection.unresolvedFindings !== 0
    || productionReview.unresolvedRedTeamFindings.length !== 0
    || productionReview.promotionAuthorized !== false
    || productionReview.exportAuthorized !== false
    || quality.automaticPromotion !== false
    || quality.humanTotal !== null
    || quality.humanDecision !== null
    || quality.promotionAuthorized !== false
    || quality.exportAuthorized !== false
    || quality.binaryBlockerAudit.automatedOrVisualBlockersFound !== 0
    || quality.binaryBlockerAudit.humanConfirmation !== null
    || recommendation.recommendationOnly !== true
    || recommendation.recommendedTotal < 95
    || recommendation.automatedOrVisualBinaryBlockersFound !== 0
    || Object.values(recommendation.authorization).some(Boolean)
  ) {
    throw new Error("The Biology exact-build evidence is not ready for a first human acceptance record.");
  }

  validateAcceptance({ acceptance, project, buildSha256, matrix });
  const recordedAt = new Date().toISOString();
  const relativeAcceptancePath = `projects/${project}/meta/human-acceptance.json`;
  const acceptedMatrix: AcceptanceMatrix = {
    ...matrix,
    status: "human-accepted-awaiting-promotion-authorization",
    categories: matrix.categories.map((category) => ({ ...category, score: acceptance.categoryScores[category.id] })),
    humanDecision: "accepted",
    humanTotal: acceptance.totalScore,
    humanReviewer: acceptance.reviewer,
    humanReviewedAt: acceptance.reviewedAt,
    humanAcceptancePath: relativeAcceptancePath
  };
  const acceptedQuality: QualityReadiness = {
    ...quality,
    status: "human-accepted-awaiting-promotion-authorization",
    humanTotal: acceptance.totalScore,
    humanDecision: "accepted",
    promotionAuthorized: false,
    exportAuthorized: false,
    humanReviewer: acceptance.reviewer,
    humanReviewedAt: acceptance.reviewedAt,
    humanAcceptancePath: relativeAcceptancePath,
    binaryBlockerAudit: {
      ...quality.binaryBlockerAudit,
      humanConfirmation: true
    }
  };
  const acceptedReview: ProductionReview = {
    ...productionReview,
    status: "human-accepted-awaiting-promotion-authorization",
    decision: "accepted",
    promotionAuthorized: false,
    exportAuthorized: false,
    humanTotal: acceptance.totalScore,
    humanReviewer: acceptance.reviewer,
    humanReviewedAt: acceptance.reviewedAt,
    humanAcceptancePath: relativeAcceptancePath
  };
  const acceptedCandidate: ProductionCandidate = {
    ...candidate,
    status: "blocked-human-accepted-awaiting-promotion-authorization",
    studioEditingEnabled: false,
    exportEnabled: false,
    humanAcceptancePath: relativeAcceptancePath
  };
  const canonicalAcceptance = {
    ...acceptance,
    acceptanceSubmissionSha256: sha256(acceptanceRaw),
    recordedAt,
    promotionAuthorized: false,
    studioEditingAuthorized: false,
    exportAuthorized: false,
    brightspaceUploadAuthorized: false,
    publicationAuthorized: false
  };

  await commitTransactionalWrites({
    repoRoot,
    project,
    beforeCommit: request.testHooks?.beforeCommit,
    values: [
      { targetPath: canonicalAcceptancePath, value: canonicalAcceptance },
      { targetPath: path.join(metaDir, "acceptance-matrix.json"), value: acceptedMatrix },
      { targetPath: path.join(metaDir, "quality-readiness-evidence.json"), value: acceptedQuality },
      { targetPath: path.join(metaDir, "production-review.json"), value: acceptedReview },
      { targetPath: path.join(metaDir, "production-candidate.json"), value: acceptedCandidate }
    ]
  });

  return {
    projectDir,
    acceptedBuildSha256: buildSha256,
    totalScore: acceptance.totalScore,
    canonicalAcceptancePath,
    recordedAt,
    promotionAuthorized: false,
    exportAuthorized: false
  };
}
