import { lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { load as loadHtml } from "cheerio";

import {
  STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
  STUDIO_ROUTINE_CONTENT_PROFILE_ID
} from "../../../../app/shared/course-editability.js";
import { learnerRouteNeedsNativeDetailsState } from "../../course-editability/inventory.js";
import { collectEditableHtmlElements } from "../../course-editing/html.js";
import { validateProjectManifestPolicy } from "../../project-manifest-policy.js";
import type { ProjectManifest } from "../../types.js";
import { hashBiologyWorkspaceTree } from "./gate2-build.js";
import { hashProjectTree } from "./intake.js";

const PROJECT_SLUG = "biology30-unit-a";
const FAMILY_ID = "biology30-unit-a-pilot";
const ACCEPTANCE_RELATIVE_PATH = `projects/${PROJECT_SLUG}/meta/human-acceptance.json`;
const PILOT_HASH_RECORD = `projects/resources/${FAMILY_ID}/v2/pilot-tree-hashes.json`;
const PILOT_SLUGS = [
  "biology30-unit-a-class-2026-faithful",
  "biology30-unit-a-class-2026-optimized",
  "biology30-unit-a-system-2020-faithful",
  "biology30-unit-a-system-2020-optimized",
  "biology30-unit-a-synthesis"
] as const;
const ACCEPTANCE_CATEGORIES = [
  { id: "academic", points: 25, minimum: 20 },
  { id: "coherence", points: 20, minimum: 16 },
  { id: "visual", points: 15, minimum: 12 },
  { id: "practice", points: 15, minimum: 12 },
  { id: "accessibility", points: 10, minimum: 8 },
  { id: "runtime", points: 10, minimum: 8 },
  { id: "maintainability", points: 5, minimum: 4 }
] as const;

type BiologyAcceptanceV1 = {
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

export type Biology30PromotionRequest = {
  repoRoot: string;
  project: string;
  acceptancePath: string;
  testHooks?: {
    afterStageWrite?: (stageRoot: string) => void | Promise<void>;
    beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
  };
};

export type Biology30PromotionResult = {
  projectDir: string;
  acceptedBuildSha256: string;
  promotedWorkspaceSha256: string;
  editKeyCount: number;
  annotationOnlyCount: number;
  frozenPilotCount: number;
  promotedAt: string;
};

type StagedWrite = {
  targetPath: string;
  stagedPath: string;
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

function safeIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
}

function validateAcceptance(input: {
  acceptance: BiologyAcceptanceV1;
  expectedBuildSha256: string;
  matrix: {
    buildSha256: string;
    automaticPromotion: boolean;
    automatedEvidencePass: boolean;
    categories: Array<{ id: string; points: number; minimum: number; score: number | null }>;
  };
}) {
  const { acceptance, expectedBuildSha256, matrix } = input;
  if (acceptance.schemaVersion !== 1 || acceptance.projectSlug !== PROJECT_SLUG) {
    throw new Error("The Biology human-acceptance record has an invalid project or schema.");
  }
  if (acceptance.acceptedBuildSha256 !== expectedBuildSha256 || matrix.buildSha256 !== expectedBuildSha256) {
    throw new Error("The Biology human-acceptance record is stale for the current exact candidate build.");
  }
  if (
    !acceptance.reviewer?.trim() ||
    !safeIsoDate(acceptance.reviewedAt) ||
    acceptance.decision !== "accepted" ||
    acceptance.scoredBy !== "user" ||
    acceptance.userConfirmed !== true ||
    acceptance.authorizationSource !== "explicit-user-message" ||
    !acceptance.authorizationText?.trim()
  ) {
    throw new Error("The Biology human-acceptance record is incomplete or is not explicitly user-authorized.");
  }
  if (matrix.automaticPromotion !== false || matrix.automatedEvidencePass !== true) {
    throw new Error("The Biology acceptance matrix is not ready for a human decision.");
  }
  if (!Array.isArray(acceptance.binaryBlockers) || acceptance.binaryBlockers.length !== 0) {
    throw new Error("The Biology candidate cannot be promoted with a binary blocker.");
  }
  const expectedCategoryIds = ACCEPTANCE_CATEGORIES.map((category) => category.id);
  const actualCategoryIds = Object.keys(acceptance.categoryScores ?? {}).sort();
  if (actualCategoryIds.join("\0") !== [...expectedCategoryIds].sort().join("\0")) {
    throw new Error("The Biology human-acceptance record must score every rubric category exactly once.");
  }
  const matrixById = new Map(matrix.categories.map((category) => [category.id, category]));
  let total = 0;
  for (const category of ACCEPTANCE_CATEGORIES) {
    const matrixCategory = matrixById.get(category.id);
    if (!matrixCategory || matrixCategory.points !== category.points || matrixCategory.minimum !== category.minimum) {
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
  if (!acceptance.statement?.includes(expectedBuildSha256) || !/\baccept\w*\b/i.test(acceptance.statement)) {
    throw new Error("The Biology acceptance statement must explicitly accept the exact candidate build hash.");
  }
}

function runtimeOwnedElement(tagName: string, attributes: Record<string, string>) {
  if (Object.hasOwn(attributes, "data-canvas-helper-course-title")) return false;
  if (tagName === "button") return true;
  const runtimePattern = /^data-(?:bio|course|lesson|practice|model|artifact|notebook|complete|reset|run|ap|glucose|page|open|module|route|copy|print|remove|export|submit|save|toggle|nav)(?:-|$)/;
  return Object.keys(attributes).some((name) => runtimePattern.test(name));
}

export function prepareBiologyDirectWorkspaceHtml(html: string) {
  const elements = collectEditableHtmlElements(html, PROJECT_SLUG, "index.html");
  if (!elements) throw new Error("The accepted Biology workspace cannot be parsed for durable Studio edit keys.");
  const insertions: Array<{ index: number; value: string }> = [];
  let editKeyCount = 0;
  let annotationOnlyCount = 0;
  for (const element of elements) {
    if (Object.hasOwn(element.attributes, "data-canvas-helper-course-title")) continue;
    if (runtimeOwnedElement(element.tagName, element.attributes)) {
      if (element.attributes["data-canvas-helper-studio-edit"] !== "annotation-only") {
        insertions.push({ index: element.openEnd, value: ' data-canvas-helper-studio-edit="annotation-only"' });
      }
      annotationOnlyCount += 1;
      continue;
    }
    if (!element.attributes["data-canvas-helper-edit-key"]) {
      const key = `biology30-unit-a-v1-${String(element.ordinal).padStart(5, "0")}`;
      insertions.push({ index: element.openEnd, value: ` data-canvas-helper-edit-key="${key}"` });
    }
    editKeyCount += 1;
  }
  let promotedHtml = html;
  for (const insertion of insertions.sort((left, right) => right.index - left.index)) {
    promotedHtml = `${promotedHtml.slice(0, insertion.index)}${insertion.value}${promotedHtml.slice(insertion.index)}`;
  }
  const stripped = promotedHtml
    .replace(/ data-canvas-helper-edit-key="biology30-unit-a-v1-\d{5}"/g, "")
    .replace(/ data-canvas-helper-studio-edit="annotation-only"/g, "");
  if (stripped !== html) throw new Error("Studio promotion changed more than invisible ownership attributes.");
  const $ = loadHtml(promotedHtml);
  const keys = $("[data-canvas-helper-edit-key]").map((_index, element) => $(element).attr("data-canvas-helper-edit-key") ?? "").get();
  if (!keys.length || new Set(keys).size !== keys.length) throw new Error("Studio promotion did not create unique durable edit keys.");
  if ($("body [data-canvas-helper-course-title]").length < 1) throw new Error("Studio promotion requires a learner-visible synchronized course-title surface.");
  return { html: promotedHtml, editKeyCount, annotationOnlyCount };
}

async function listWorkspaceFiles(rootDir: string, relativeDir = ""): Promise<string[]> {
  const entries = (await readdir(path.join(rootDir, relativeDir), { withFileTypes: true }))
    .sort((left, right) => left.name.localeCompare(right.name));
  const files: string[] = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDir.split(path.sep).join("/"), entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Promoted Biology workspace cannot contain a symbolic link: ${relativePath}`);
    if (entry.isDirectory()) files.push(...await listWorkspaceFiles(rootDir, relativePath));
    else if (entry.isFile()) files.push(relativePath);
    else throw new Error(`Promoted Biology workspace contains an unsupported entry: ${relativePath}`);
  }
  return files;
}

async function loadPilotManifest(projectDir: string, expectedSlug: string) {
  const canonicalPath = path.join(projectDir, "meta", "project.json");
  if (await pathExists(canonicalPath)) return readJson<ProjectManifest>(canonicalPath);
  const metaDir = path.join(projectDir, "meta");
  const fallbackNames = (await readdir(metaDir)).filter((name) => /^project \d+\.json$/.test(name)).sort();
  if (fallbackNames.length !== 1) throw new Error(`Historical pilot ${expectedSlug} has no unambiguous project manifest.`);
  const fallback = await readJson<ProjectManifest>(path.join(metaDir, fallbackNames[0]));
  if (fallback.slug !== expectedSlug) throw new Error(`Historical pilot ${expectedSlug} has a mismatched fallback manifest.`);
  return fallback;
}

function freezePilotManifest(manifest: ProjectManifest, promotedAt: string) {
  const historicalPaths = [
    ...(manifest.referenceOnly ?? []),
    ...(manifest.canonicalEntry ? [manifest.canonicalEntry] : []),
    ...(manifest.canonicalSources ?? []),
    ...(manifest.generatedOutputs ?? [])
  ];
  const frozen: ProjectManifest = {
    ...manifest,
    updatedAt: promotedAt,
    authoringStatus: "reference-only",
    generatedOutputs: [],
    authoring: {
      ...manifest.authoring,
      driverId: "proposal-only-v1",
      studioEditing: { enabled: false }
    },
    exportTargets: (manifest.exportTargets ?? []).map((target) => ({
      ...target,
      enabled: false,
      notes: "Historical Biology comparison reference; frozen when biology30-unit-a was promoted."
    })),
    referenceOnly: [...new Set(historicalPaths)].sort(),
    sourceOfTruthNotes: "Historical Biology 30 Unit A comparison reference. Rebuild, Studio Edit, export, and promotion are disabled after the production V2 selection."
  };
  delete frozen.canonicalEntry;
  delete frozen.canonicalSources;
  delete frozen.regenerateCommand;
  const validation = validateProjectManifestPolicy(frozen);
  if (validation.status !== "valid") throw new Error(`Frozen pilot manifest is invalid for ${manifest.slug}: ${validation.errors.join(" ")}`);
  return frozen;
}

function promotedProjectManifest(input: {
  current: ProjectManifest;
  workspaceFiles: string[];
  routeIds: string[];
  html: string;
  promotedAt: string;
}) {
  const projectRoot = `projects/${PROJECT_SLUG}`;
  const canonicalSources = input.workspaceFiles.map((file) => `${projectRoot}/workspace/${file}`);
  const direct: ProjectManifest = {
    ...input.current,
    updatedAt: input.promotedAt,
    learningUpdatedAt: input.promotedAt,
    workspaceApprovedAt: input.promotedAt,
    canonicalEntry: `${projectRoot}/workspace/index.html`,
    canonicalSources,
    generatedOutputs: [],
    authoring: {
      driverId: "direct-workspace-v1",
      familyId: "biology30-unit-a-production",
      sourceResourceIds: input.current.authoring?.sourceResourceIds,
      qualityProfile: "biology30-unit-a-production-v1",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true },
      learnerSurfaces: {
        schemaVersion: 1,
        mode: "declared-routes-and-states",
        surfaces: input.routeIds.map((routeId) => ({
          htmlPath: "index.html",
          route: `#${routeId}`,
          stateKey: learnerRouteNeedsNativeDetailsState(input.html, `#${routeId}`)
        }))
      },
      editabilityContract: {
        schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
        profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
      }
    },
    authoringStatus: "active",
    exportTargets: [
      { target: "html", enabled: true, notes: "Frozen canonical Direct workspace for preview and local release verification." },
      { target: "scorm", enabled: true, notes: "SCORM 2004 export is permitted only from this accepted frozen workspace." }
    ],
    referenceOnly: [...new Set([
      ...(input.current.referenceOnly ?? []),
      ...(input.current.canonicalSources ?? []).filter((entry) => !entry.startsWith(`${projectRoot}/workspace/`)),
      input.current.sourcePath,
      input.current.rawEntrypoint
    ])].filter((entry) => !canonicalSources.includes(entry)).sort(),
    sourceOfTruthNotes: "The accepted Biology 30 Unit A workspace is frozen as the canonical Direct source. Earlier Biology resources and build reports remain provenance/reference material; the proposal builder must not overwrite Studio edits."
  };
  delete direct.regenerateCommand;
  const validation = validateProjectManifestPolicy(direct);
  if (validation.status !== "valid") throw new Error(`Promoted Biology manifest is invalid: ${validation.errors.join(" ")}`);
  return direct;
}

async function stageWrite(stageRoot: string, targetPath: string, value: string | Buffer, index: number) {
  const stagedPath = path.join(stageRoot, "writes", String(index).padStart(3, "0"));
  await mkdir(path.dirname(stagedPath), { recursive: true });
  await writeFile(stagedPath, value);
  return { targetPath, stagedPath };
}

async function promoteWrites(input: {
  repoRoot: string;
  stageRoot: string;
  writes: StagedWrite[];
  beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
}) {
  const backupRoot = await mkdtemp(path.join(input.repoRoot, "projects", `.${PROJECT_SLUG}-promotion-backup-`));
  const touched: Array<StagedWrite & { backupPath: string; hadOriginal: boolean; promoted: boolean }> = [];
  try {
    for (let index = 0; index < input.writes.length; index += 1) {
      const write = input.writes[index];
      await input.beforePromote?.(write.targetPath, index);
      if (!(await pathExists(write.stagedPath))) throw new Error(`Missing staged promotion write: ${write.stagedPath}`);
      const backupPath = path.join(backupRoot, String(index).padStart(3, "0"));
      const hadOriginal = await pathExists(write.targetPath);
      if (hadOriginal) await rename(write.targetPath, backupPath);
      const record = { ...write, backupPath, hadOriginal, promoted: false };
      touched.push(record);
      await mkdir(path.dirname(write.targetPath), { recursive: true });
      await rename(write.stagedPath, write.targetPath);
      record.promoted = true;
    }
  } catch (error) {
    for (const write of touched.reverse()) {
      if (write.promoted && await pathExists(write.targetPath)) await rm(write.targetPath, { recursive: true, force: true });
      if (write.hadOriginal && await pathExists(write.backupPath)) {
        await mkdir(path.dirname(write.targetPath), { recursive: true });
        await rename(write.backupPath, write.targetPath);
      }
    }
    throw error;
  } finally {
    await rm(backupRoot, { recursive: true, force: true });
    await rm(input.stageRoot, { recursive: true, force: true });
  }
}

export async function promoteBiology30UnitAV2(request: Biology30PromotionRequest): Promise<Biology30PromotionResult> {
  const repoRoot = path.resolve(request.repoRoot);
  if (request.project !== PROJECT_SLUG) throw new Error(`--project must be ${PROJECT_SLUG}.`);
  const expectedAcceptancePath = path.join(repoRoot, ACCEPTANCE_RELATIVE_PATH);
  if (path.resolve(request.acceptancePath) !== expectedAcceptancePath) {
    throw new Error(`--acceptance must be ${ACCEPTANCE_RELATIVE_PATH}.`);
  }
  const projectDir = path.join(repoRoot, "projects", PROJECT_SLUG);
  const metaDir = path.join(projectDir, "meta");
  if (await pathExists(path.join(metaDir, "gate-4-promotion.json"))) throw new Error("Biology 30 Unit A is already promoted.");

  const [currentManifest, candidate, build, matrix, automated, visual, figureInspection, acceptance, pilotHashes] = await Promise.all([
    readJson<ProjectManifest>(path.join(metaDir, "project.json")),
    readJson<{ buildSha256: string; ownership: string; studioEditingEnabled: boolean; exportEnabled: boolean }>(path.join(metaDir, "production-candidate.json")),
    readJson<{ buildSha256: string; learnerRoutes: string[] }>(path.join(metaDir, "gate-2-build.json")),
    readJson<{
      buildSha256: string;
      automaticPromotion: boolean;
      automatedEvidencePass: boolean;
      categories: Array<{ id: string; points: number; minimum: number; score: number | null }>;
    }>(path.join(metaDir, "gate-3-acceptance-matrix.json")),
    readJson<{ buildSha256: string; status: string; promotionAuthorized: boolean }>(path.join(metaDir, "gate-3-automated-review.json")),
    readJson<{ buildSha256: string; binaryVisualBlockerFound: boolean; humanVisualAcceptance: unknown }>(path.join(metaDir, "gate-3-visual-review.json")),
    readJson<{ buildSha256: string; status: string; openedAllContactSheets: boolean; unresolvedFindings: unknown[] }>(path.join(metaDir, "gate-3-figure-visual-inspection.json")),
    readJson<BiologyAcceptanceV1>(expectedAcceptancePath),
    readJson<{ status: string; after: Array<{ slug: string; sha256: string; fileCount: number; byteCount: number }> }>(path.join(repoRoot, PILOT_HASH_RECORD))
  ]);

  if (
    currentManifest.authoringStatus !== "blocked" ||
    currentManifest.authoring?.driverId !== "proposal-only-v1" ||
    currentManifest.authoring.studioEditing?.enabled !== false ||
    candidate.ownership !== "proposal-only-v1" ||
    candidate.studioEditingEnabled !== false ||
    candidate.exportEnabled !== false
  ) throw new Error("Promotion requires the blocked proposal-only Biology candidate.");

  const currentWorkspace = await hashBiologyWorkspaceTree(path.join(projectDir, "workspace"));
  if (currentWorkspace.sha256 !== build.buildSha256 || candidate.buildSha256 !== build.buildSha256) {
    throw new Error("The Biology workspace no longer matches its reviewed candidate hash.");
  }
  if (
    automated.buildSha256 !== build.buildSha256 ||
    automated.status !== "automated-evidence-passed-awaiting-human-decision" ||
    automated.promotionAuthorized !== false ||
    visual.buildSha256 !== build.buildSha256 ||
    visual.binaryVisualBlockerFound !== false ||
    visual.humanVisualAcceptance !== null ||
    figureInspection.buildSha256 !== build.buildSha256 ||
    figureInspection.status !== "passed" ||
    figureInspection.openedAllContactSheets !== true ||
    figureInspection.unresolvedFindings.length !== 0
  ) throw new Error("The exact-build Gate 3 evidence is stale, incomplete, or already altered.");
  validateAcceptance({ acceptance, expectedBuildSha256: build.buildSha256, matrix });

  if (pilotHashes.status !== "unchanged" || pilotHashes.after.length !== PILOT_SLUGS.length) {
    throw new Error("The historical Biology pilot hash record is incomplete.");
  }
  const recordedPilotHashes = new Map(pilotHashes.after.map((entry) => [entry.slug, entry]));
  const actualPilotHashes = await Promise.all(PILOT_SLUGS.map((slug) => hashProjectTree(repoRoot, slug)));
  for (const actual of actualPilotHashes) {
    const recorded = recordedPilotHashes.get(actual.slug);
    if (!recorded || recorded.sha256 !== actual.sha256 || recorded.fileCount !== actual.fileCount || recorded.byteCount !== actual.byteCount) {
      throw new Error(`Historical Biology pilot ${actual.slug} changed before promotion.`);
    }
  }

  const originalHtml = await readFile(path.join(projectDir, "workspace", "index.html"), "utf8");
  const prepared = prepareBiologyDirectWorkspaceHtml(originalHtml);
  const promotedAt = new Date().toISOString();
  const stageRoot = await mkdtemp(path.join(repoRoot, "projects", `.${PROJECT_SLUG}-promotion-stage-`));
  const stagedWorkspaceRoot = path.join(stageRoot, "workspace-hash");
  await mkdir(stagedWorkspaceRoot, { recursive: true });
  await writeFile(path.join(stagedWorkspaceRoot, "index.html"), prepared.html, "utf8");
  await mkdir(path.join(stagedWorkspaceRoot, "assets"), { recursive: true });
  const workspaceFiles = await listWorkspaceFiles(path.join(projectDir, "workspace"));
  for (const relativePath of workspaceFiles.filter((file) => file !== "index.html")) {
    const source = path.join(projectDir, "workspace", relativePath);
    const target = path.join(stagedWorkspaceRoot, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, await readFile(source));
  }
  const promotedWorkspace = await hashBiologyWorkspaceTree(stagedWorkspaceRoot);
  const directManifest = promotedProjectManifest({
    current: currentManifest,
    workspaceFiles,
    routeIds: build.learnerRoutes,
    html: prepared.html,
    promotedAt
  });
  const promotedCandidate = {
    ...candidate,
    status: "promoted-direct-workspace",
    acceptedBuildSha256: build.buildSha256,
    buildSha256: build.buildSha256,
    promotedWorkspaceSha256: promotedWorkspace.sha256,
    ownership: "direct-workspace-v1",
    studioEditingEnabled: true,
    exportEnabled: true,
    frozen: true,
    promotedAt
  };
  const gate2Review = await readJson<Record<string, unknown>>(path.join(metaDir, "gate-2-review.json"));
  const acceptedGate2Review = {
    ...gate2Review,
    status: "accepted",
    decision: {
      accepted: true,
      acceptedBuildSha256: build.buildSha256,
      reviewer: acceptance.reviewer,
      reviewedAt: acceptance.reviewedAt,
      authorization: "gate-4-promotion"
    }
  };
  const acceptedMatrix = {
    ...matrix,
    status: "accepted",
    categories: matrix.categories.map((category) => ({ ...category, score: acceptance.categoryScores[category.id] })),
    humanDecision: {
      decision: acceptance.decision,
      reviewer: acceptance.reviewer,
      reviewedAt: acceptance.reviewedAt,
      totalScore: acceptance.totalScore,
      binaryBlockers: acceptance.binaryBlockers
    }
  };
  const gate4Record = {
    schemaVersion: 1,
    projectSlug: PROJECT_SLUG,
    status: "promotion-complete-readiness-pending",
    acceptedBuildSha256: build.buildSha256,
    promotedWorkspaceSha256: promotedWorkspace.sha256,
    promotedAt,
    reviewer: acceptance.reviewer,
    acceptancePath: ACCEPTANCE_RELATIVE_PATH,
    directOwnership: "direct-workspace-v1",
    editabilityContract: directManifest.authoring?.editabilityContract,
    editKeyCount: prepared.editKeyCount,
    annotationOnlyCount: prepared.annotationOnlyCount,
    comparisonPilots: actualPilotHashes.map((entry) => ({
      slug: entry.slug,
      prePromotionTreeSha256: entry.sha256,
      status: "reference-only"
    })),
    rebuildOwnershipRemoved: true,
    promotionTransactional: true
  };
  const promptPack = `# Biology 30 Unit A Production V2 — Accepted Direct Workspace\n\n- Project: ${PROJECT_SLUG}\n- Accepted candidate SHA-256: ${build.buildSha256}\n- Promoted workspace SHA-256: ${promotedWorkspace.sha256}\n- Promoted: ${promotedAt}\n- Status: active\n- Authoring driver: direct-workspace-v1\n- Studio editing: enabled\n\n## Canonical ownership\n\nThe frozen accepted workspace at projects/${PROJECT_SLUG}/workspace/index.html is now the canonical learner source. Do not run the Biology proposal builder over it. Earlier V2 resources and the five comparison projects are provenance/reference-only.\n\n## Release boundary\n\nLocal SCORM 2004 export is permitted after Gate 4 readiness passes. Brightspace upload and publication require separate release action and learner-account validation.\n`;

  const writeValues: Array<{ targetPath: string; value: string | Buffer }> = [
    { targetPath: path.join(projectDir, "workspace", "index.html"), value: prepared.html },
    { targetPath: path.join(metaDir, "project.json"), value: json(directManifest) },
    { targetPath: path.join(metaDir, "production-candidate.json"), value: json(promotedCandidate) },
    { targetPath: path.join(metaDir, "gate-2-review.json"), value: json(acceptedGate2Review) },
    { targetPath: path.join(metaDir, "gate-3-acceptance-matrix.json"), value: json(acceptedMatrix) },
    { targetPath: path.join(metaDir, "gate-4-promotion.json"), value: json(gate4Record) },
    { targetPath: path.join(metaDir, "prompt-pack.md"), value: promptPack }
  ];
  for (const actualHash of actualPilotHashes) {
    const pilotProjectDir = path.join(repoRoot, "projects", actualHash.slug);
    const manifest = await loadPilotManifest(pilotProjectDir, actualHash.slug);
    if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "proposal-only-v1") {
      throw new Error(`Historical pilot ${actualHash.slug} is not a blocked proposal-only project.`);
    }
    const frozenManifest = freezePilotManifest(manifest, promotedAt);
    const freezeRecord = {
      schemaVersion: 1,
      projectSlug: actualHash.slug,
      status: "reference-only",
      selectedProductionProject: PROJECT_SLUG,
      acceptedBuildSha256: build.buildSha256,
      prePromotionTreeSha256: actualHash.sha256,
      frozenAt: promotedAt,
      rebuildDisabled: true,
      studioEditingEnabled: false,
      exportEnabled: false
    };
    writeValues.push(
      { targetPath: path.join(pilotProjectDir, "meta", "project.json"), value: json(frozenManifest) },
      { targetPath: path.join(pilotProjectDir, "meta", "promotion-freeze.json"), value: json(freezeRecord) }
    );
  }

  const writes: StagedWrite[] = [];
  try {
    for (let index = 0; index < writeValues.length; index += 1) {
      const entry = writeValues[index];
      writes.push(await stageWrite(stageRoot, entry.targetPath, entry.value, index));
    }
    await request.testHooks?.afterStageWrite?.(stageRoot);
    await promoteWrites({ repoRoot, stageRoot, writes, beforePromote: request.testHooks?.beforePromote });
  } catch (error) {
    await rm(stageRoot, { recursive: true, force: true });
    throw error;
  }

  return {
    projectDir,
    acceptedBuildSha256: build.buildSha256,
    promotedWorkspaceSha256: promotedWorkspace.sha256,
    editKeyCount: prepared.editKeyCount,
    annotationOnlyCount: prepared.annotationOnlyCount,
    frozenPilotCount: actualPilotHashes.length,
    promotedAt
  };
}
