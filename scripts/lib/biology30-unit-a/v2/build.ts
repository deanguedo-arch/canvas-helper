import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  copyFile,
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";

import { load as loadHtml } from "cheerio";
import JSZip from "jszip";

import { validateProjectManifestPolicy } from "../../project-manifest-policy.js";
import type { ProjectManifest } from "../../types.js";
import { validateProductionContract } from "./blueprint.js";
import { hashProjectTree } from "./intake.js";
import { renderBiology30UnitAGate1 } from "./render.js";
import type { BiologyGate0ReviewV1, BiologyProductionContractV1 } from "./types.js";

const PROJECT_SLUG = "biology30-unit-a";
const FAMILY = "biology30-unit-a-pilot";
const EXPECTED_CONTRACT_SHA256 = "f4fdf1e95aa3e80681b8aff15c2fb1af65705d28e663ea1ad2c3a2dbb8ae610d";
const EXPECTED_SOURCE_HASHES = {
  "class-2026-27": "46a6c8794419bcbd574888c2b54cbf42c2c551894a8f6844c2233b82ea7baed5",
  "system-2020": "0c00ebf519d0a727c569001b3f3840fb04b1040a726fa3d2cb36a9120f005761",
  "unit-a-notes": "538f58fffe4aa0459dfcf49c5675948d8c7231a95a6fb2b61d7cde56e06a6035"
} as const;
const PILOT_SLUGS = [
  "biology30-unit-a-class-2026-faithful",
  "biology30-unit-a-class-2026-optimized",
  "biology30-unit-a-system-2020-faithful",
  "biology30-unit-a-system-2020-optimized",
  "biology30-unit-a-synthesis"
] as const;
const GATE1_META_FILES = [
  "project.json",
  "production-candidate.json",
  "prompt-pack.md",
  "gate-1-build.json",
  "gate-1-review.json",
  "gate-1-provenance.json",
  "gate-1-asset-audit.json",
  "gate-1-interaction-inventory.json",
  "gate-1-practice-audit.json",
  "gate-1-content-density.json",
  "gate-1-accessibility-static.json",
  "gate-1-persistence-budget.json",
  "gate-1-source-verification.json",
  "gate-1-build-summary.md",
  "e2e-contract.json"
] as const;

export type Biology30Gate1BuildRequest = {
  repoRoot: string;
  project: string;
  strict: boolean;
  checkExternalLinks?: boolean;
  testHooks?: {
    afterStageWrite?: (stageWorkspaceDir: string, stageMetaDir: string) => void | Promise<void>;
    beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
  };
};

export type Biology30Gate1BuildResult = {
  projectDir: string;
  workspaceDir: string;
  buildSha256: string;
  contractSha256: string;
  learnerRouteCount: number;
  generatedAt: string;
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

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
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

async function readJson<T>(targetPath: string): Promise<T> {
  return JSON.parse(await readFile(targetPath, "utf8")) as T;
}

async function collectTreeFiles(rootDir: string, relativeDir = ""): Promise<Array<{ path: string; size: number; sha256: string }>> {
  const absoluteDir = path.join(rootDir, relativeDir);
  const entries = (await readdir(absoluteDir, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name));
  const files: Array<{ path: string; size: number; sha256: string }> = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDir.split(path.sep).join(path.posix.sep), entry.name);
    const absolutePath = path.join(rootDir, relativePath);
    if (entry.isSymbolicLink()) throw new Error(`Gate 1 generated output cannot contain a symbolic link: ${absolutePath}`);
    if (entry.isDirectory()) {
      files.push(...(await collectTreeFiles(rootDir, relativePath)));
      continue;
    }
    if (!entry.isFile()) throw new Error(`Gate 1 generated output contains an unsupported entry: ${absolutePath}`);
    const details = await stat(absolutePath);
    files.push({ path: relativePath, size: details.size, sha256: await sha256File(absolutePath) });
  }
  return files;
}

async function hashTree(rootDir: string) {
  const files = await collectTreeFiles(rootDir);
  const hash = createHash("sha256");
  for (const file of files) hash.update(`${file.path}\0${file.size}\0${file.sha256}\n`);
  return { sha256: hash.digest("hex"), files, byteCount: files.reduce((total, file) => total + file.size, 0) };
}

async function verifyNotesInsideClassArchive(classArchivePath: string) {
  const archive = await JSZip.loadAsync(await readFile(classArchivePath), { createFolders: false });
  const entry = Object.values(archive.files).find(
    (candidate) => !candidate.dir && /(?:^|\/)Unit A Nervous and Endocrine Systems Notes\.pdf$/i.test(candidate.name)
  );
  if (!entry) throw new Error("The class archive no longer contains the canonical Unit A notes PDF.");
  const bytes = await entry.async("nodebuffer");
  const actual = sha256(bytes);
  if (actual !== EXPECTED_SOURCE_HASHES["unit-a-notes"]) {
    throw new Error(`Unit A notes checksum drift: expected ${EXPECTED_SOURCE_HASHES["unit-a-notes"]}, received ${actual}.`);
  }
  return { archivePath: entry.name, actualSha256: actual, verified: true };
}

async function verifyGate1Authority(resourceDir: string) {
  const refresh = await readJson<{
    result?: { biologySpecificBulletin2026_27Found?: unknown; currentBiologySpecificBulletinSchoolYear?: unknown };
  }>(path.join(resourceDir, "gate-1-authority-refresh.json"));
  if (refresh.result?.biologySpecificBulletin2026_27Found !== false || refresh.result.currentBiologySpecificBulletinSchoolYear !== "2025-26") {
    throw new Error("The Gate 1 Alberta authority refresh is missing or unresolved.");
  }
}

async function verifyInputs(input: { repoRoot: string; projectDir: string; resourceDir: string }) {
  const contractPath = path.join(input.resourceDir, "production-contract.json");
  const contractText = await readFile(contractPath, "utf8");
  const contractSha256 = sha256(contractText);
  if (contractSha256 !== EXPECTED_CONTRACT_SHA256) {
    throw new Error(`Gate 0 contract drift: approval names ${EXPECTED_CONTRACT_SHA256}, current contract is ${contractSha256}.`);
  }
  const contract = JSON.parse(contractText) as BiologyProductionContractV1;
  validateProductionContract(contract);
  const approval = await readJson<BiologyGate0ReviewV1>(path.join(input.resourceDir, "gate-0-review.json"));
  if (
    approval.status !== "approved" ||
    approval.contractSha256 !== contractSha256 ||
    approval.decision?.approved !== true ||
    approval.decision.approvedContractSha256 !== contractSha256 ||
    approval.decision.authorization !== "gate-1-only"
  ) {
    throw new Error("Gate 1 requires explicit user approval of the exact Gate 0 contract hash.");
  }
  await verifyGate1Authority(input.resourceDir);

  const manifest = await readJson<ProjectManifest>(path.join(input.projectDir, "meta", "project.json"));
  if (
    manifest.authoringStatus !== "blocked" ||
    manifest.authoring?.driverId !== "proposal-only-v1" ||
    manifest.authoring.studioEditing?.enabled !== false
  ) {
    throw new Error("Gate 1 can build only the blocked proposal-only Biology project.");
  }
  if (await pathExists(path.join(input.projectDir, "meta", "human-acceptance.json"))) {
    throw new Error("Refusing to rebuild a Biology project with a human acceptance record.");
  }

  const classSource = contract.sources.find((source) => source.id === "class-2026-27");
  const systemSource = contract.sources.find((source) => source.id === "system-2020");
  if (!classSource?.path || !systemSource?.path) throw new Error("The production contract is missing a named Brightspace source path.");
  const classPath = path.join(input.repoRoot, classSource.path);
  const systemPath = path.join(input.repoRoot, systemSource.path);
  const [classHash, systemHash] = await Promise.all([sha256File(classPath), sha256File(systemPath)]);
  if (classHash !== EXPECTED_SOURCE_HASHES["class-2026-27"]) throw new Error(`class-2026-27 checksum drift: ${classHash}`);
  if (systemHash !== EXPECTED_SOURCE_HASHES["system-2020"]) throw new Error(`system-2020 checksum drift: ${systemHash}`);
  const notes = await verifyNotesInsideClassArchive(classPath);

  const recordedPilotHashes = await readJson<{
    status: string;
    after: Array<{ slug: string; sha256: string; fileCount: number; byteCount: number }>;
  }>(path.join(input.resourceDir, "pilot-tree-hashes.json"));
  if (recordedPilotHashes.status !== "unchanged") throw new Error("The Gate 0 comparison-pilot tree-hash report is not accepted.");
  const currentPilotHashes = await Promise.all(PILOT_SLUGS.map((slug) => hashProjectTree(input.repoRoot, slug)));
  for (const current of currentPilotHashes) {
    const recorded = recordedPilotHashes.after.find((entry) => entry.slug === current.slug);
    if (!recorded || recorded.sha256 !== current.sha256 || recorded.fileCount !== current.fileCount || recorded.byteCount !== current.byteCount) {
      throw new Error(`Comparison pilot changed after Gate 0: ${current.slug}`);
    }
  }
  return {
    contract,
    contractSha256,
    manifest,
    sourceVerification: {
      schemaVersion: 1,
      verifiedAt: new Date().toISOString(),
      sources: [
        { id: "class-2026-27", expectedSha256: EXPECTED_SOURCE_HASHES["class-2026-27"], actualSha256: classHash, verified: true },
        { id: "system-2020", expectedSha256: EXPECTED_SOURCE_HASHES["system-2020"], actualSha256: systemHash, verified: true },
        { id: "unit-a-notes", expectedSha256: EXPECTED_SOURCE_HASHES["unit-a-notes"], ...notes }
      ],
      comparisonPilots: currentPilotHashes
    }
  };
}

export function buildWorstCaseBiologyState() {
  const responses: Record<string, string> = {};
  for (let index = 1; index <= 17; index += 1) responses[`biology30-unit-a:lesson:${String(index).padStart(2, "0")}:exit`] = "x".repeat(300);
  for (let index = 1; index <= 7; index += 1) responses[`biology30-unit-a:artifact:${index}:draft`] = "x".repeat(2000);
  const practice = Object.fromEntries(
    Array.from({ length: 100 }, (_value, index) => [
      `practice-${String(index + 1).padStart(3, "0")}`,
      index % 4 === 0 ? "a" : index % 4 === 1 ? "b" : index % 4 === 2 ? "c" : "d"
    ])
  );
  return {
    schemaVersion: 1,
    updatedAt: "2026-08-30T00:00:00.000Z",
    location: "lesson-17",
    responses,
    practice,
    interactions: { serializedModelState: "x".repeat(2600), navigationAndCompletionState: "x".repeat(2000) },
    artifacts: Object.fromEntries(Array.from({ length: 7 }, (_value, index) => [`artifact-${index + 1}`, { savedAt: "2026-08-30T00:00:00.000Z" }])),
    notebook: Array.from({ length: 10 }, (_value, index) => ({ id: `note-${index}`, title: "t".repeat(60), body: "x".repeat(540), savedAt: "2026-08-30T00:00:00.000Z" })),
    completions: Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`),
    finalPractice: { submittedAt: "2026-08-30T00:00:00.000Z", percent: 100 },
    serializationReserve: "x".repeat(2500)
  };
}

function visibleText(html: string) {
  const $ = loadHtml(html);
  $("script,style,svg").remove();
  return $.root().text().replace(/\s+/g, " ").trim();
}

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function analyzeContentDensity(resourceDir: string, generatedAt: string) {
  return Promise.all(
    ["lesson-04", "lesson-15"].map(async (lessonId) => {
      const html = await readFile(path.join(resourceDir, "content", "lessons", `${lessonId}.html`), "utf8");
      const $ = loadHtml(html);
      let maximumParagraphWords = 0;
      let maximumSectionWords = 0;
      $("p").each((_index, element) => {
        maximumParagraphWords = Math.max(maximumParagraphWords, countWords($(element).text()));
      });
      $("section").each((_index, element) => {
        maximumSectionWords = Math.max(maximumSectionWords, countWords($(element).text()));
      });
      return {
        lessonId,
        totalWords: countWords(visibleText(html)),
        maximumParagraphWords,
        maximumSectionWords,
        paragraphLimit: 120,
        lessonTarget: { minimum: 900, maximum: 1600 }
      };
    })
  ).then((lessons) => ({ schemaVersion: 1, generatedAt, lessons }));
}

function buildProvenance(generatedAt: string) {
  return {
    schemaVersion: 1,
    generatedAt,
    records: [
      { sectionId: "lesson-04:resting-potential", sourceRefIds: ["notes-action-potential", "system-m1-l7", "openstax-action-potential"], treatment: "corrected-native-rewrite", learnerUse: "explanation-and-original-redraw" },
      { sectionId: "lesson-04:voltage-phases", sourceRefIds: ["notes-action-potential", "class-day-action-potential", "system-m1-l7", "openstax-action-potential"], treatment: "corrected-native-rewrite", learnerUse: "explanation-model-practice" },
      { sectionId: "lesson-04:artifact", sourceRefIds: ["alberta-program", "alberta-performance"], treatment: "original-aligned-evidence-task", learnerUse: "portfolio-evidence" },
      { sectionId: "lesson-15:pancreatic-islets", sourceRefIds: ["notes-pancreas", "system-m2-l5", "openstax-endocrine-pancreas"], treatment: "corrected-native-rewrite", learnerUse: "explanation-and-original-redraw" },
      { sectionId: "lesson-15:diabetes", sourceRefIds: ["niddk-diabetes-overview", "niddk-diabetes-causes"], treatment: "current-authoritative-rewrite", learnerUse: "health-and-disorder-explanation" },
      { sectionId: "lesson-15:urinalysis", sourceRefIds: ["niddk-diabetes-tests", "niddk-diabetes-management"], treatment: "original-synthetic-dataset", learnerUse: "data-analysis-with-diagnostic-boundary" },
      { sectionId: "lesson-15:artifact", sourceRefIds: ["alberta-program", "alberta-performance", "niddk-diabetes-tests"], treatment: "original-aligned-evidence-task", learnerUse: "portfolio-evidence" }
    ]
  };
}

function buildE2eContract() {
  return {
    $schema: "../../../e2e/project-e2e-contract.schema.json",
    projectSlug: PROJECT_SLUG,
    requiredTestIds: ["studio-shell", "course-studio-tab", "workspace-project-select", "project-root", "workspace-preview-frame"],
    modes: { enabled: false },
    navigation: { enabled: false },
    quiz: { enabled: false, lessonTitle: "Formative practice" },
    fallbackPanel: { enabled: false },
    learnerCourse: {
      enabled: true,
      routes: ["overview", "lessons", "lesson-04", "lesson-15", "model-lab", "investigation-notebook", "practice-hub"],
      hintRoutes: [],
      printRoutes: [],
      evidenceScenario: {
        kind: "individual",
        route: "lesson-04",
        captureId: "action-potential-evidence",
        contributionId: "biology30-unit-a:artifact:action-potential-evidence",
        responseId: "biology30-unit-a:artifact:action-potential-evidence:claim",
        setupResponses: [
          { responseId: "biology30-unit-a:artifact:action-potential-evidence:claim", value: "{{e2e-value}}" },
          { responseId: "biology30-unit-a:artifact:action-potential-evidence:evidence", value: "Graph evidence for {{e2e-value}}" },
          { responseId: "biology30-unit-a:artifact:action-potential-evidence:reasoning", value: "Ion-channel reasoning for {{e2e-value}}" }
        ]
      },
      resourceChecks: [],
      mobile: { width: 390, height: 844, routes: ["overview", "lesson-04", "lesson-15", "investigation-notebook", "practice-hub"] }
    }
  };
}

function buildUpdatedManifest(current: ProjectManifest, generatedAt: string): ProjectManifest {
  const canonicalSources = [
    "projects/resources/biology30-unit-a-pilot/v2/production-contract.json",
    "projects/resources/biology30-unit-a-pilot/v2/curriculum-map.json",
    "projects/resources/biology30-unit-a-pilot/v2/source-and-rights-register.json",
    "projects/resources/biology30-unit-a-pilot/v2/source-and-rights-gate-1.json",
    "projects/resources/biology30-unit-a-pilot/v2/notes-page-disposition.json",
    "projects/resources/biology30-unit-a-pilot/v2/factual-correction-ledger.json",
    "projects/resources/biology30-unit-a-pilot/v2/content-gap-ledger.json",
    "projects/resources/biology30-unit-a-pilot/v2/content/overview.html",
    "projects/resources/biology30-unit-a-pilot/v2/content/lessons/lesson-04.html",
    "projects/resources/biology30-unit-a-pilot/v2/content/lessons/lesson-15.html",
    "projects/resources/biology30-unit-a-pilot/v2/content/hubs/model-lab.html",
    "projects/resources/biology30-unit-a-pilot/v2/content/hubs/investigation-notebook.html",
    "projects/resources/biology30-unit-a-pilot/v2/content/hubs/practice-hub.html",
    "projects/resources/biology30-unit-a-pilot/v2/activities/gate-1-activities.json",
    "projects/resources/biology30-unit-a-pilot/v2/datasets/lesson-15-synthetic.json",
    "projects/resources/biology30-unit-a-pilot/v2/figures/resting-membrane.svg",
    "projects/resources/biology30-unit-a-pilot/v2/figures/action-potential-graph.svg",
    "projects/resources/biology30-unit-a-pilot/v2/figures/blood-glucose-loop.svg"
  ];
  return {
    ...current,
    updatedAt: generatedAt,
    learningUpdatedAt: generatedAt,
    canonicalSources,
    generatedOutputs: [
      "projects/biology30-unit-a/workspace",
      ...GATE1_META_FILES.filter((file) => file !== "project.json").map((file) => `projects/biology30-unit-a/meta/${file}`)
    ],
    regenerateCommand: "npm run build:biology30-unit-a-v2 -- --project biology30-unit-a --strict",
    authoringStatus: "blocked",
    authoring: {
      ...current.authoring!,
      driverId: "proposal-only-v1",
      qualityProfile: "biology30-unit-a-production-v1",
      studioEditing: { enabled: false }
    },
    exportTargets: [
      { target: "html", enabled: false, notes: "Gate 1 visual and learning-loop review candidate only." },
      { target: "scorm", enabled: false, notes: "SCORM 2004 export requires accepted full-course review and promotion." }
    ],
    sourceOfTruthNotes: "The Biology V2 resources and Biology-specific renderer own this generated Gate 1 candidate. The workspace remains blocked and review-only; Studio editing, promotion, export, upload, and commit remain unauthorized."
  };
}

async function validateRenderedWorkspace(input: {
  stageWorkspaceDir: string;
  stageMetaDir: string;
  expectedRoutes: string[];
  buildSha256: string;
  strict: boolean;
}) {
  const indexPath = path.join(input.stageWorkspaceDir, "index.html");
  const html = await readFile(indexPath, "utf8");
  const $ = loadHtml(html);
  if (!/^<!doctype html>/i.test(html.trim()) || !$("html").length || !$("body").length) throw new Error("Gate 1 did not render a complete HTML document.");
  const actualRoutes = $(".course-page").map((_index, element) => $(element).attr("id") || "").get();
  if (JSON.stringify(actualRoutes) !== JSON.stringify(input.expectedRoutes)) {
    throw new Error(`Gate 1 learner routes drifted: ${JSON.stringify(actualRoutes)}.`);
  }
  for (const routeId of input.expectedRoutes) {
    const route = $(`#${routeId}`);
    if (route.find("h1").length !== 1) throw new Error(`Learner route ${routeId} must contain exactly one H1.`);
  }
  if ($("iframe, .material-symbols-outlined, [data-canvas-helper-edit-key]").length) {
    throw new Error("Gate 1 contains an iframe, remote icon dependency, or premature Direct-edit key.");
  }
  const remoteRuntimeAssets = $("[src],[href]")
    .map((_index, element) => $(element).attr("src") || $(element).attr("href") || "")
    .get()
    .filter((value) => /^https?:/i.test(value));
  if (remoteRuntimeAssets.length) throw new Error(`Gate 1 contains required remote runtime assets: ${remoteRuntimeAssets.join(", ")}`);
  const localAssets = $("[src],[href]")
    .map((_index, element) => $(element).attr("src") || $(element).attr("href") || "")
    .get()
    .filter((value) => value && !value.startsWith("#") && !/^(?:mailto:|tel:|data:|javascript:)/i.test(value));
  for (const asset of localAssets) {
    const cleanPath = asset.split(/[?#]/)[0];
    if (!(await pathExists(path.join(input.stageWorkspaceDir, cleanPath)))) throw new Error(`Gate 1 has an unresolved local asset: ${asset}`);
  }
  const learnerText = visibleText(html);
  if (/\b(?:Gate\s*1|proposal-only|comparison rubric|prototype|build hash|source hash|source ID|curriculum review|slide viewer|primarily visual|coming soon)\b/i.test(learnerText)) {
    throw new Error("Gate 1 exposes internal review, comparison, slide, or placeholder language to learners.");
  }
  if (!/data-bio-response-id="biology30-unit-a:lesson:04:exit"/.test(html) || !/data-bio-response-id="biology30-unit-a:lesson:15:exit"/.test(html)) {
    throw new Error("Gate 1 stable lesson-exit response IDs are missing.");
  }
  if (!/API_1484_11/.test(html) || !/cmi\.suspend_data/.test(html) || !/BIO_STATE_LIMIT = 48000/.test(html)) {
    throw new Error("Gate 1 persistence foundation is missing SCORM 2004 or state-budget safeguards.");
  }
  const scripts = $("script").map((_index, element) => $(element).html() || "").get();
  for (const [index, script] of scripts.entries()) {
    try { new Function(script); } catch (error) { throw new Error(`Gate 1 inline script ${index + 1} does not parse: ${String(error)}`); }
  }
  const build = await readJson<{ buildSha256: string; status: string }>(path.join(input.stageMetaDir, "gate-1-build.json"));
  if (build.buildSha256 !== input.buildSha256 || build.status !== "blocked-awaiting-user") throw new Error("Gate 1 build metadata is stale.");
  const review = await readJson<{ buildSha256: string; status: string; decision: unknown }>(path.join(input.stageMetaDir, "gate-1-review.json"));
  if (review.buildSha256 !== input.buildSha256 || review.status !== "awaiting-user" || review.decision !== null) throw new Error("Gate 1 review record is stale or pre-approved.");
  const manifest = await readJson<ProjectManifest>(path.join(input.stageMetaDir, "project.json"));
  const manifestValidation = validateProjectManifestPolicy(manifest);
  if (manifestValidation.status !== "valid") throw new Error(`Gate 1 project manifest is invalid: ${manifestValidation.errors.join(" ")}`);
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "proposal-only-v1" || manifest.authoring.studioEditing?.enabled !== false) {
    throw new Error("Gate 1 escaped its blocked proposal boundary.");
  }
  if (input.strict) {
    const contentDensity = await readJson<{ lessons: Array<{ totalWords: number; maximumParagraphWords: number }> }>(path.join(input.stageMetaDir, "gate-1-content-density.json"));
    for (const lesson of contentDensity.lessons) {
      if (lesson.totalWords < 900 || lesson.totalWords > 1600 || lesson.maximumParagraphWords > 120) {
        throw new Error(`Gate 1 content-density requirement failed: ${JSON.stringify(lesson)}.`);
      }
    }
    const budget = await readJson<{ worstCaseCharacters: number; pass: boolean }>(path.join(input.stageMetaDir, "gate-1-persistence-budget.json"));
    if (!budget.pass || budget.worstCaseCharacters >= 48000) throw new Error("Gate 1 worst-case persistence state exceeds 48,000 characters.");
  }
}

type Gate1Activities = {
  schemaVersion: number;
  projectSlug: string;
  lessons: string[];
  interactions: Array<{
    id: string;
    lessonId: string;
    kind: string;
    responseIds: string[];
    completionRule: string;
    fallbackType: "static-model" | "supplied-data" | "printable";
    datasetId?: string;
  }>;
  artifacts: Array<{
    id: string;
    lessonIds: string[];
    outcomeIds: string[];
    fields: Array<{ id: string; label: string; maxLength: number }>;
    rubricId: string;
    printEnabled: boolean;
    exportSummaryEnabled: boolean;
  }>;
  practiceItems: Array<{
    id: string;
    outcomeIds: string[];
    cognitiveLevel: "remember-understand" | "apply" | "higher-mental-activity";
    sourceRefIds: string[];
    prompt: string;
    choices: Record<string, string>;
    answerKey: unknown;
    rationale: string;
    targetedFeedback: Record<string, string>;
  }>;
};

function buildPromptPack(buildSha256: string, generatedAt: string) {
  return `# Biology 30 Unit A Production V2 — Gate 1

- Project: ${PROJECT_SLUG}
- Candidate build SHA-256: ${buildSha256}
- Generated: ${generatedAt}
- Status: blocked; awaiting exact-build user review
- Authoring driver: proposal-only-v1
- Studio editing: disabled
- Export: disabled

## Current review boundary

Review the Overview, Lesson 4, Lesson 15, Model Lab skeleton, Investigation Notebook skeleton, Practice Hub skeleton, scientific editorial visual system, local-first interactions, accessibility behavior, and persistence foundation.

Approval of this exact build authorizes Gate 2 full-course production only. It does not authorize promotion, Direct Editing, commit, SCORM export, Brightspace upload, or publication. Rebuilding a substantively changed candidate requires a new exact-build review.
`;
}

function buildGate1Summary(input: {
  generatedAt: string;
  buildSha256: string;
  contractSha256: string;
  routeIds: string[];
  figureCount: number;
  interactionCount: number;
  practiceCount: number;
  artifactCount: number;
  persistenceCharacters: number;
}) {
  return `# Biology 30 Unit A V2 — Gate 1 Build Summary

## Status

- Blocked and awaiting user review of the exact candidate.
- Candidate build SHA-256: ${input.buildSha256}
- Accepted Gate 0 contract SHA-256: ${input.contractSha256}
- Generated: ${input.generatedAt}
- Studio editing and export remain disabled.

## Review surfaces

- Overview
- Lesson 4: Action Potentials: Ions into Information
- Lesson 15: Pancreas, Blood Glucose, Diabetes, and Urinalysis
- Model Lab skeleton
- Investigation Notebook skeleton
- Practice Hub skeleton

## Candidate inventory

- Learner routes: ${input.routeIds.length}
- Original figures: ${input.figureCount}
- Substantive local interactions: ${input.interactionCount}
- Formative practice items: ${input.practiceCount}
- Submission-ready artifact drafts: ${input.artifactCount}
- Worst-case planned persistence payload: ${input.persistenceCharacters.toLocaleString("en-CA")} characters (limit: 48,000)

## Approval meaning

Approval accepts the scientific editorial visual direction and the independent-learning loop represented by Lessons 4 and 15. It authorizes Gate 2 full-course production only. It does not approve the unfinished full course, promotion, Studio Direct Editing, a commit, SCORM export, Brightspace upload, or publication.
`;
}

async function copyGate1Assets(resourceDir: string, stageWorkspaceDir: string) {
  const sourceAssets = path.join(resourceDir, "assets");
  const targetAssets = path.join(stageWorkspaceDir, "assets");
  await cp(sourceAssets, targetAssets, { recursive: true, errorOnExist: true, force: false });
  return hashTree(targetAssets);
}

async function auditExternalLinks(resourceDir: string, enabled: boolean) {
  const register = await readJson<{
    entries?: Array<{ id?: string; url?: string }>;
  }>(path.join(resourceDir, "source-and-rights-gate-1.json"));
  const entries = (register.entries ?? []).filter((source) => typeof source.url === "string" && /^https?:\/\//i.test(source.url));
  if (!enabled) {
    return {
      enabled: false,
      status: "skipped",
      reason: "Run with --check-external-links to refresh optional source-link availability.",
      links: entries.map((entry) => ({ id: entry.id, url: entry.url, status: "not-checked" }))
    };
  }
  const links = [] as Array<{ id?: string; url?: string; status: number | string; finalUrl?: string }>;
  for (const entry of entries) {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 15_000);
    try {
      let response = await fetch(entry.url!, { method: "HEAD", redirect: "follow", signal: abort.signal });
      if (response.status === 405 || response.status === 501) {
        response = await fetch(entry.url!, { method: "GET", redirect: "follow", signal: abort.signal, headers: { Range: "bytes=0-0" } });
      }
      links.push({ id: entry.id, url: entry.url, status: response.status, finalUrl: response.url });
    } catch (error) {
      links.push({ id: entry.id, url: entry.url, status: error instanceof Error ? error.message : String(error) });
    } finally {
      clearTimeout(timeout);
    }
  }
  const failed = links.filter((entry) => typeof entry.status !== "number" || entry.status >= 400);
  if (failed.length) throw new Error(`External source-link audit failed: ${failed.map((entry) => `${entry.id} (${entry.status})`).join(", ")}`);
  return { enabled: true, status: "passed", links };
}

function buildPracticeAudit(activities: Gate1Activities, generatedAt: string) {
  const ids = activities.practiceItems.map((item) => item.id);
  const uniqueIds = new Set(ids);
  const invalid = activities.practiceItems.filter((item) => {
    const answer = String(item.answerKey);
    return (
      !item.outcomeIds.length ||
      !item.sourceRefIds.length ||
      !item.prompt.trim() ||
      !Object.hasOwn(item.choices, answer) ||
      !item.rationale.trim() ||
      Object.keys(item.targetedFeedback).length < Object.keys(item.choices).length - 1
    );
  });
  if (ids.length !== 6 || uniqueIds.size !== ids.length || invalid.length) {
    throw new Error(`Gate 1 practice architecture is invalid: ${ids.length} items, ${uniqueIds.size} unique IDs, ${invalid.length} incomplete items.`);
  }
  const cognitiveDistribution = Object.fromEntries(
    ["remember-understand", "apply", "higher-mental-activity"].map((level) => [
      level,
      activities.practiceItems.filter((item) => item.cognitiveLevel === level).length
    ])
  );
  return {
    schemaVersion: 1,
    generatedAt,
    totalItems: ids.length,
    uniqueIds: uniqueIds.size,
    lessonCounts: Object.fromEntries(activities.lessons.map((lessonId) => [lessonId, ids.filter((id) => id.startsWith(`${lessonId}-`)).length])),
    cognitiveDistribution,
    allHaveAnswerKeys: true,
    allHaveRationales: true,
    allHaveTargetedFeedback: true,
    allHaveOutcomeAndSourceTags: true,
    items: activities.practiceItems.map((item) => ({
      id: item.id,
      outcomeIds: item.outcomeIds,
      cognitiveLevel: item.cognitiveLevel,
      sourceRefIds: item.sourceRefIds
    }))
  };
}

function buildInteractionInventory(activities: Gate1Activities, generatedAt: string) {
  const interactionIds = new Set(activities.interactions.map((interaction) => interaction.id));
  const responseIds = activities.interactions.flatMap((interaction) => interaction.responseIds);
  const artifactIds = new Set(activities.artifacts.map((artifact) => artifact.id));
  const artifactFieldIds = activities.artifacts.flatMap((artifact) => artifact.fields.map((field) => field.id));
  if (interactionIds.size !== activities.interactions.length || new Set(responseIds).size !== responseIds.length) {
    throw new Error("Gate 1 interactions contain duplicate interaction or response IDs.");
  }
  if (activities.interactions.length !== 2 || artifactIds.size !== 2 || new Set(artifactFieldIds).size !== artifactFieldIds.length) {
    throw new Error("Gate 1 interaction or artifact inventory is incomplete or unstable.");
  }
  if (activities.interactions.some((interaction) => !interaction.completionRule || !interaction.fallbackType)) {
    throw new Error("Every Gate 1 interaction requires a completion rule and fallback.");
  }
  if (activities.artifacts.some((artifact) => !artifact.printEnabled || !artifact.exportSummaryEnabled || artifact.fields.some((field) => field.maxLength > 2000))) {
    throw new Error("Every Gate 1 artifact requires bounded fields plus print and summary export.");
  }
  return {
    schemaVersion: 1,
    generatedAt,
    nativeLocalInteractionCount: activities.interactions.length,
    artifactCount: activities.artifacts.length,
    interactions: activities.interactions.map((interaction) => ({
      ...interaction,
      keyboardOperable: true,
      persistent: true,
      resetIsScoped: true,
      networkRequired: false
    })),
    artifacts: activities.artifacts
  };
}

function buildStaticAccessibilityReport(html: string, generatedAt: string, expectedRoutes: string[]) {
  const $ = loadHtml(html);
  const duplicateIds = Object.entries(
    $("[id]").toArray().reduce<Record<string, number>>((counts, element) => {
      const id = $(element).attr("id");
      if (id) counts[id] = (counts[id] ?? 0) + 1;
      return counts;
    }, {})
  ).filter(([, count]) => count > 1).map(([id]) => id);
  const unlabeledControls = $("input,textarea,select").toArray().filter((element) => {
    const id = $(element).attr("id");
    const ariaLabel = $(element).attr("aria-label") || $(element).attr("aria-labelledby");
    return !ariaLabel && (!id || !$(`label[for="${id}"]`).length) && !$(element).closest("label").length;
  });
  const uncaptionedTables = $("table").toArray().filter((element) => !$(element).find("caption").length);
  const tablesWithoutHeaderScopes = $("table th").toArray().filter((element) => !$(element).attr("scope"));
  const imagesWithoutAlt = $("img").toArray().filter((element) => !$(element).is("[alt]"));
  const figuresWithoutDescriptions = $("svg[role='img']").toArray().filter((element) => !$(element).find("title").length || !$(element).find("desc").length);
  const checks = {
    oneH1PerRoute: expectedRoutes.every((routeId) => $(`#${routeId}`).find("h1").length === 1),
    skipLink: $("a.skip-link[href='#course-main']").length === 1,
    semanticMain: $("main#course-main").length === 1,
    noDuplicateIds: duplicateIds.length === 0,
    controlsLabeled: unlabeledControls.length === 0,
    imagesHaveAlt: imagesWithoutAlt.length === 0,
    svgTitlesAndDescriptions: figuresWithoutDescriptions.length === 0,
    tableCaptions: uncaptionedTables.length === 0,
    tableHeaderScopes: tablesWithoutHeaderScopes.length === 0,
    visibleFocusCss: /:focus-visible/.test(html),
    reducedMotionCss: /prefers-reduced-motion/.test(html),
    mobileReflowCss: /max-width:\s*(?:420|640|680|760)px/.test(html),
    printCss: /@media\s+print/.test(html),
    noAutoplay: !$("[autoplay]").length
  };
  const pass = Object.values(checks).every(Boolean);
  return {
    schemaVersion: 1,
    generatedAt,
    scope: "static pre-browser Gate 1 checks; browser axe and interaction checks remain separate",
    pass,
    checks,
    findings: {
      duplicateIds,
      unlabeledControlCount: unlabeledControls.length,
      imagesWithoutAltCount: imagesWithoutAlt.length,
      figuresWithoutDescriptionsCount: figuresWithoutDescriptions.length,
      uncaptionedTableCount: uncaptionedTables.length,
      tableHeadersWithoutScopeCount: tablesWithoutHeaderScopes.length
    }
  };
}

async function writeGate1Stage(input: {
  stageWorkspaceDir: string;
  stageMetaDir: string;
  resourceDir: string;
  currentManifest: ProjectManifest;
  contractSha256: string;
  sourceVerification: unknown;
  strict: boolean;
  checkExternalLinks: boolean;
  generatedAt: string;
}) {
  await Promise.all([mkdir(input.stageWorkspaceDir, { recursive: true }), mkdir(input.stageMetaDir, { recursive: true })]);
  const [rendered, contentDensity, activities, externalLinkAudit] = await Promise.all([
    renderBiology30UnitAGate1(input.resourceDir),
    analyzeContentDensity(input.resourceDir, input.generatedAt),
    readJson<Gate1Activities>(path.join(input.resourceDir, "activities", "gate-1-activities.json")),
    auditExternalLinks(input.resourceDir, input.checkExternalLinks)
  ]);
  await writeFile(path.join(input.stageWorkspaceDir, "index.html"), rendered.html, "utf8");
  const copiedAssets = await copyGate1Assets(input.resourceDir, input.stageWorkspaceDir);
  const workspaceTree = await hashTree(input.stageWorkspaceDir);
  const buildSha256 = workspaceTree.sha256;
  const persistenceState = buildWorstCaseBiologyState();
  const worstCaseCharacters = JSON.stringify(persistenceState).length;
  const persistenceBudget = {
    schemaVersion: 1,
    generatedAt: input.generatedAt,
    storageContract: "biology30-unit-a:state:v1",
    hardRuntimeLimit: 60000,
    buildGuardLimit: 48000,
    worstCaseCharacters,
    remainingBuildGuardCharacters: 48000 - worstCaseCharacters,
    preservesLastValidStateOnOverflow: true,
    pass: worstCaseCharacters < 48000
  };
  const practiceAudit = buildPracticeAudit(activities, input.generatedAt);
  const interactionInventory = buildInteractionInventory(activities, input.generatedAt);
  const accessibility = buildStaticAccessibilityReport(rendered.html, input.generatedAt, rendered.learnerRouteIds);
  if (!accessibility.pass) throw new Error(`Gate 1 static accessibility checks failed: ${JSON.stringify(accessibility.checks)}; ${JSON.stringify(accessibility.findings)}.`);
  const assetAudit = {
    schemaVersion: 1,
    generatedAt: input.generatedAt,
    selfContained: true,
    requiredRemoteAssetCount: 0,
    unresolvedLocalAssetCount: 0,
    localAssetTreeSha256: copiedAssets.sha256,
    localAssetByteCount: copiedAssets.byteCount,
    files: copiedAssets.files
  };
  const sourceVerificationReport = {
    ...(input.sourceVerification as Record<string, unknown>),
    generatedAt: input.generatedAt,
    authorityRefresh: await readJson(path.join(input.resourceDir, "gate-1-authority-refresh.json")),
    sourceReview: await readJson(path.join(input.resourceDir, "gate-1-source-review.json")),
    externalLinkAudit
  };
  const updatedManifest = buildUpdatedManifest(input.currentManifest, input.generatedAt);
  const productionCandidate = {
    schemaVersion: 1,
    projectSlug: PROJECT_SLUG,
    gate: "gate-1",
    status: "blocked-awaiting-user",
    ownership: "proposal-only-v1",
    contractPath: `projects/resources/${FAMILY}/v2/production-contract.json`,
    contractSha256: input.contractSha256,
    buildSha256,
    workspaceTreeSha256: buildSha256,
    learnerRouteIds: rendered.learnerRouteIds,
    lessonRenderingStarted: true,
    renderedLessons: ["lesson-04", "lesson-15"],
    studioEditingEnabled: false,
    exportEnabled: false,
    generatedAt: input.generatedAt
  };
  const buildRecord = {
    schemaVersion: 1,
    projectSlug: PROJECT_SLUG,
    gate: "gate-1",
    status: "blocked-awaiting-user",
    generatedAt: input.generatedAt,
    contractSha256: input.contractSha256,
    buildSha256,
    workspace: workspaceTree,
    learnerRoutes: rendered.learnerRouteIds,
    renderedLessons: ["lesson-04", "lesson-15"],
    figures: rendered.figureIds,
    interactions: rendered.interactionIds,
    practiceItems: rendered.practiceIds,
    artifacts: rendered.artifactIds,
    strict: input.strict,
    checkExternalLinks: input.checkExternalLinks
  };
  const reviewRecord = {
    schemaVersion: 1,
    gateId: "gate-1",
    projectSlug: PROJECT_SLUG,
    contractSha256: input.contractSha256,
    buildSha256,
    status: "awaiting-user",
    decision: null,
    generatedAt: input.generatedAt,
    approvalScope: "gate-2-full-course-production-only",
    approvalRequirements: [
      "Approve the scientific editorial visual direction shown in the Overview, Lesson 4, and Lesson 15.",
      "Approve the independent-learning loop, explanatory depth, diagrams, practice feedback, and evidence-artifact structure.",
      "Approve the local-first model, notebook, responsive, print, accessibility, and persistence foundations.",
      "Name this exact build SHA-256; substantive rebuilds require a new review.",
      "Authorize Gate 2 only; promotion, commit, SCORM export, Brightspace upload, and publication remain unauthorized."
    ]
  };
  const summary = buildGate1Summary({
    generatedAt: input.generatedAt,
    buildSha256,
    contractSha256: input.contractSha256,
    routeIds: rendered.learnerRouteIds,
    figureCount: rendered.figureIds.length,
    interactionCount: rendered.interactionIds.length,
    practiceCount: rendered.practiceIds.length,
    artifactCount: rendered.artifactIds.length,
    persistenceCharacters: worstCaseCharacters
  });

  await Promise.all([
    writeJson(path.join(input.stageMetaDir, "project.json"), updatedManifest),
    writeJson(path.join(input.stageMetaDir, "production-candidate.json"), productionCandidate),
    writeFile(path.join(input.stageMetaDir, "prompt-pack.md"), buildPromptPack(buildSha256, input.generatedAt), "utf8"),
    writeJson(path.join(input.stageMetaDir, "gate-1-build.json"), buildRecord),
    writeJson(path.join(input.stageMetaDir, "gate-1-review.json"), reviewRecord),
    writeJson(path.join(input.stageMetaDir, "gate-1-provenance.json"), buildProvenance(input.generatedAt)),
    writeJson(path.join(input.stageMetaDir, "gate-1-asset-audit.json"), assetAudit),
    writeJson(path.join(input.stageMetaDir, "gate-1-interaction-inventory.json"), interactionInventory),
    writeJson(path.join(input.stageMetaDir, "gate-1-practice-audit.json"), practiceAudit),
    writeJson(path.join(input.stageMetaDir, "gate-1-content-density.json"), contentDensity),
    writeJson(path.join(input.stageMetaDir, "gate-1-accessibility-static.json"), accessibility),
    writeJson(path.join(input.stageMetaDir, "gate-1-persistence-budget.json"), persistenceBudget),
    writeJson(path.join(input.stageMetaDir, "gate-1-source-verification.json"), sourceVerificationReport),
    writeFile(path.join(input.stageMetaDir, "gate-1-build-summary.md"), summary, "utf8"),
    writeJson(path.join(input.stageMetaDir, "e2e-contract.json"), buildE2eContract())
  ]);
  return { rendered, buildSha256 };
}

async function promoteGate1Stage(input: {
  repoRoot: string;
  projectDir: string;
  stageRoot: string;
  stageWorkspaceDir: string;
  stageMetaDir: string;
  beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
}) {
  const backupRoot = await mkdtemp(path.join(input.repoRoot, "projects", `.${PROJECT_SLUG}-gate1-backup-`));
  const replacements = [
    {
      stagePath: input.stageWorkspaceDir,
      targetPath: path.join(input.projectDir, "workspace"),
      backupPath: path.join(backupRoot, "workspace")
    },
    ...GATE1_META_FILES.map((file) => ({
      stagePath: path.join(input.stageMetaDir, file),
      targetPath: path.join(input.projectDir, "meta", file),
      backupPath: path.join(backupRoot, "meta", file)
    }))
  ];
  const touched: Array<(typeof replacements)[number] & { hadOriginal: boolean; promoted: boolean }> = [];
  try {
    for (let index = 0; index < replacements.length; index += 1) {
      const replacement = replacements[index];
      await input.beforePromote?.(replacement.targetPath, index);
      if (!(await pathExists(replacement.stagePath))) throw new Error(`Missing staged Gate 1 path: ${replacement.stagePath}`);
      const hadOriginal = await pathExists(replacement.targetPath);
      await mkdir(path.dirname(replacement.backupPath), { recursive: true });
      if (hadOriginal) await rename(replacement.targetPath, replacement.backupPath);
      const record = { ...replacement, hadOriginal, promoted: false };
      touched.push(record);
      await mkdir(path.dirname(replacement.targetPath), { recursive: true });
      await rename(replacement.stagePath, replacement.targetPath);
      record.promoted = true;
    }
  } catch (error) {
    for (const replacement of touched.reverse()) {
      if (replacement.promoted && (await pathExists(replacement.targetPath))) {
        await rm(replacement.targetPath, { recursive: true, force: true });
      }
      if (replacement.hadOriginal && (await pathExists(replacement.backupPath))) {
        await mkdir(path.dirname(replacement.targetPath), { recursive: true });
        await rename(replacement.backupPath, replacement.targetPath);
      }
    }
    throw error;
  } finally {
    await rm(backupRoot, { recursive: true, force: true });
    await rm(input.stageRoot, { recursive: true, force: true });
  }
}

export async function buildBiology30UnitAGate1(request: Biology30Gate1BuildRequest): Promise<Biology30Gate1BuildResult> {
  const repoRoot = path.resolve(request.repoRoot);
  if (request.project !== PROJECT_SLUG) throw new Error(`--project must be ${PROJECT_SLUG}.`);
  if (!request.strict) throw new Error("Gate 1 requires --strict.");
  const projectDir = path.join(repoRoot, "projects", PROJECT_SLUG);
  const resourceDir = path.join(repoRoot, "projects", "resources", FAMILY, "v2");
  if (!(await pathExists(projectDir))) throw new Error(`The blocked Gate 0 project is missing: ${projectDir}`);
  if (!(await pathExists(resourceDir))) throw new Error(`The Biology V2 resource root is missing: ${resourceDir}`);
  const existingReviewPath = path.join(projectDir, "meta", "gate-1-review.json");
  if (await pathExists(existingReviewPath)) {
    const existingReview = await readJson<{ status?: string }>(existingReviewPath);
    if (existingReview.status === "approved") throw new Error("Refusing to rebuild an approved Gate 1 candidate. Gate 2 must use the accepted exact build.");
  }
  const verified = await verifyInputs({ repoRoot, projectDir, resourceDir });
  const generatedAt = new Date().toISOString();
  const stageRoot = await mkdtemp(path.join(repoRoot, "projects", `.${PROJECT_SLUG}-gate1-stage-`));
  const stageWorkspaceDir = path.join(stageRoot, "workspace");
  const stageMetaDir = path.join(stageRoot, "meta");
  try {
    const staged = await writeGate1Stage({
      stageWorkspaceDir,
      stageMetaDir,
      resourceDir,
      currentManifest: verified.manifest,
      contractSha256: verified.contractSha256,
      sourceVerification: verified.sourceVerification,
      strict: request.strict,
      checkExternalLinks: request.checkExternalLinks === true,
      generatedAt
    });
    await request.testHooks?.afterStageWrite?.(stageWorkspaceDir, stageMetaDir);
    await validateRenderedWorkspace({
      stageWorkspaceDir,
      stageMetaDir,
      expectedRoutes: staged.rendered.learnerRouteIds,
      buildSha256: staged.buildSha256,
      strict: request.strict
    });
    await promoteGate1Stage({
      repoRoot,
      projectDir,
      stageRoot,
      stageWorkspaceDir,
      stageMetaDir,
      beforePromote: request.testHooks?.beforePromote
    });
    return {
      projectDir,
      workspaceDir: path.join(projectDir, "workspace"),
      buildSha256: staged.buildSha256,
      contractSha256: verified.contractSha256,
      learnerRouteCount: staged.rendered.learnerRouteIds.length,
      generatedAt
    };
  } catch (error) {
    await rm(stageRoot, { recursive: true, force: true });
    throw error;
  }
}
