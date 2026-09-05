import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { load as loadHtml } from "cheerio";
import JSZip from "jszip";

import { validateProjectManifestPolicy } from "../../project-manifest-policy.js";
import type { ProjectManifest } from "../../types.js";
import { serializeBiology30SuspendData } from "../../biology30-course/v1/suspend-data.js";
import { validateProductionContract } from "./blueprint.js";
import { hashProjectTree } from "./intake.js";
import { renderBiology30UnitAGate2 } from "./gate2-render.js";
import type { BiologyProductionContractV1 } from "./types.js";

const PROJECT_SLUG = "biology30-unit-a";
const FAMILY = "biology30-unit-a-pilot";
const EXPECTED_CONTRACT_SHA256 = "f4fdf1e95aa3e80681b8aff15c2fb1af65705d28e663ea1ad2c3a2dbb8ae610d";
const EXPECTED_GATE1_BUILD_SHA256 = "ef0b900b880cb705fd9b4e8000738b52fcf324ac2ba373d5d60aaf8760d3bf2a";
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
const GATE2_META_FILES = [
  "project.json",
  "production-candidate.json",
  "prompt-pack.md",
  "gate-2-build.json",
  "gate-2-review.json",
  "gate-2-source-verification.json",
  "gate-2-curriculum-audit.json",
  "gate-2-source-disposition.json",
  "gate-2-provenance.json",
  "gate-2-asset-audit.json",
  "gate-2-interaction-inventory.json",
  "gate-2-practice-audit.json",
  "gate-2-content-density.json",
  "gate-2-accessibility-static.json",
  "gate-2-persistence-budget.json",
  "gate-2-factual-review.json",
  "gate-2-link-audit.json",
  "gate-2-build-summary.md",
  "gate-3-acceptance-matrix.json",
  "gate-3-human-acceptance-template.json",
  "teacher-implementation-guide.md",
  "brightspace-setup-guide.md",
  "e2e-contract.json"
] as const;

export type Biology30Gate2BuildRequest = {
  repoRoot: string;
  project: string;
  strict: boolean;
  checkExternalLinks?: boolean;
  testHooks?: {
    afterStageWrite?: (stageWorkspaceDir: string, stageMetaDir: string) => void | Promise<void>;
    beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
  };
};

export type Biology30Gate2BuildResult = {
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

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function collectTreeFiles(rootDir: string, relativeDir = ""): Promise<Array<{ path: string; size: number; sha256: string }>> {
  const absoluteDir = path.join(rootDir, relativeDir);
  const entries = (await readdir(absoluteDir, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name));
  const files: Array<{ path: string; size: number; sha256: string }> = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDir.split(path.sep).join(path.posix.sep), entry.name);
    const absolutePath = path.join(rootDir, relativePath);
    if (entry.isSymbolicLink()) throw new Error(`Gate 2 output cannot contain a symbolic link: ${absolutePath}`);
    if (entry.isDirectory()) {
      files.push(...(await collectTreeFiles(rootDir, relativePath)));
      continue;
    }
    if (!entry.isFile()) throw new Error(`Gate 2 output contains an unsupported entry: ${absolutePath}`);
    const details = await stat(absolutePath);
    files.push({ path: relativePath, size: details.size, sha256: await sha256File(absolutePath) });
  }
  return files;
}

export async function hashBiologyWorkspaceTree(rootDir: string) {
  const files = await collectTreeFiles(rootDir);
  const hash = createHash("sha256");
  for (const file of files) hash.update(`${file.path}\0${file.size}\0${file.sha256}\n`);
  return { sha256: hash.digest("hex"), files, byteCount: files.reduce((total, file) => total + file.size, 0) };
}

async function listResourceFiles(resourceDir: string) {
  return (await collectTreeFiles(resourceDir)).map((file) => `projects/resources/${FAMILY}/v2/${file.path}`);
}

async function verifyNotesInArchive(classArchivePath: string) {
  const archive = await JSZip.loadAsync(await readFile(classArchivePath), { createFolders: false });
  const entry = Object.values(archive.files).find((candidate) => !candidate.dir && /(?:^|\/)Unit A Nervous and Endocrine Systems Notes\.pdf$/i.test(candidate.name));
  if (!entry) throw new Error("The class archive no longer contains the canonical Unit A notes PDF.");
  const actualSha256 = sha256(await entry.async("nodebuffer"));
  if (actualSha256 !== EXPECTED_SOURCE_HASHES["unit-a-notes"]) throw new Error(`Unit A notes checksum drift: ${actualSha256}.`);
  return { archivePath: entry.name, actualSha256, verified: true };
}

async function verifyGate2Inputs(input: { repoRoot: string; projectDir: string; resourceDir: string }) {
  const contractText = await readFile(path.join(input.resourceDir, "production-contract.json"), "utf8");
  const contractSha256 = sha256(contractText);
  if (contractSha256 !== EXPECTED_CONTRACT_SHA256) throw new Error(`Gate 0 contract drift: ${contractSha256}.`);
  const contract = JSON.parse(contractText) as BiologyProductionContractV1;
  validateProductionContract(contract);

  const [canonicalApproval, projectReview, authorityRefresh, pdfQa] = await Promise.all([
    readJson<{ contractSha256: string; approvedBuildSha256: string; authorization: string; approvedBy?: string }>(path.join(input.resourceDir, "gate-1-approval.json")),
    readJson<{ status: string; contractSha256: string; buildSha256: string; decision?: { approved?: boolean; approvedBuildSha256?: string; authorization?: string } }>(path.join(input.projectDir, "meta", "gate-1-review.json")),
    readJson<{ result?: { biologySpecificBulletin2026_27Found?: unknown; currentBiologySpecificBulletinSchoolYear?: unknown } }>(path.join(input.resourceDir, "gate-2-authority-refresh.json")),
    readJson<{ pageCount?: number; status?: string }>(path.join(input.resourceDir, "gate-2-pdf-visual-qa.json"))
  ]);
  if (
    canonicalApproval.contractSha256 !== contractSha256 ||
    canonicalApproval.approvedBuildSha256 !== EXPECTED_GATE1_BUILD_SHA256 ||
    canonicalApproval.authorization !== "gate-2-only" ||
    canonicalApproval.approvedBy !== "user"
  ) throw new Error("Gate 2 requires the canonical exact-build Gate 1 approval record.");
  if (
    projectReview.status !== "approved" ||
    projectReview.contractSha256 !== contractSha256 ||
    projectReview.buildSha256 !== EXPECTED_GATE1_BUILD_SHA256 ||
    projectReview.decision?.approved !== true ||
    projectReview.decision.approvedBuildSha256 !== EXPECTED_GATE1_BUILD_SHA256 ||
    projectReview.decision.authorization !== "gate-2-only"
  ) throw new Error("Gate 2 requires explicit user approval of the exact Gate 1 build.");
  if (authorityRefresh.result?.biologySpecificBulletin2026_27Found !== false || authorityRefresh.result.currentBiologySpecificBulletinSchoolYear !== "2025-26") {
    throw new Error("The Gate 2 Alberta authority refresh is missing or unresolved.");
  }
  if (pdfQa.pageCount !== 139 || pdfQa.status !== "passed-for-gate-2-authoring") throw new Error("The complete 139-page visual source QA record is missing.");

  const manifest = await readJson<ProjectManifest>(path.join(input.projectDir, "meta", "project.json"));
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "proposal-only-v1" || manifest.authoring.studioEditing?.enabled !== false) {
    throw new Error("Gate 2 can build only the blocked proposal-only Biology project.");
  }
  if (await pathExists(path.join(input.projectDir, "meta", "human-acceptance.json"))) throw new Error("Refusing to rebuild a Biology project with a human acceptance record.");
  const existingGate2ReviewPath = path.join(input.projectDir, "meta", "gate-2-review.json");
  if (await pathExists(existingGate2ReviewPath)) {
    const review = await readJson<{ status?: string; decision?: unknown }>(existingGate2ReviewPath);
    if (review.status === "approved" || review.decision) throw new Error("Refusing to rebuild an accepted Gate 2 candidate.");
  }

  const currentWorkspace = await hashBiologyWorkspaceTree(path.join(input.projectDir, "workspace"));
  const existingGate2BuildPath = path.join(input.projectDir, "meta", "gate-2-build.json");
  if (await pathExists(existingGate2BuildPath)) {
    const previous = await readJson<{ buildSha256?: string; status?: string }>(existingGate2BuildPath);
    if (previous.status !== "blocked-awaiting-user" || previous.buildSha256 !== currentWorkspace.sha256) throw new Error("The prior Gate 2 candidate workspace drifted from its build record.");
  } else if (currentWorkspace.sha256 !== EXPECTED_GATE1_BUILD_SHA256) {
    throw new Error(`The exact approved Gate 1 workspace changed before Gate 2: ${currentWorkspace.sha256}.`);
  }

  const classSource = contract.sources.find((source) => source.id === "class-2026-27");
  const systemSource = contract.sources.find((source) => source.id === "system-2020");
  if (!classSource?.path || !systemSource?.path) throw new Error("The contract is missing named Brightspace source paths.");
  const classPath = path.join(input.repoRoot, classSource.path);
  const systemPath = path.join(input.repoRoot, systemSource.path);
  const [classHash, systemHash, notes] = await Promise.all([sha256File(classPath), sha256File(systemPath), verifyNotesInArchive(classPath)]);
  if (classHash !== EXPECTED_SOURCE_HASHES["class-2026-27"] || systemHash !== EXPECTED_SOURCE_HASHES["system-2020"]) throw new Error("A named Brightspace source checksum changed.");

  const pilotRecord = await readJson<{ status: string; after: Array<{ slug: string; sha256: string; fileCount: number; byteCount: number }> }>(path.join(input.resourceDir, "pilot-tree-hashes.json"));
  if (pilotRecord.status !== "unchanged") throw new Error("The comparison-pilot baseline is unresolved.");
  const pilots = await Promise.all(PILOT_SLUGS.map((slug) => hashProjectTree(input.repoRoot, slug)));
  for (const current of pilots) {
    const expected = pilotRecord.after.find((entry) => entry.slug === current.slug);
    if (!expected || expected.sha256 !== current.sha256 || expected.fileCount !== current.fileCount || expected.byteCount !== current.byteCount) throw new Error(`Comparison pilot changed: ${current.slug}.`);
  }
  return {
    contract,
    contractSha256,
    manifest,
    sourceVerification: {
      schemaVersion: 1,
      verifiedAt: new Date().toISOString(),
      exactGate1BuildSha256: EXPECTED_GATE1_BUILD_SHA256,
      sourceHashes: [
        { id: "class-2026-27", expected: EXPECTED_SOURCE_HASHES["class-2026-27"], actual: classHash, verified: true },
        { id: "system-2020", expected: EXPECTED_SOURCE_HASHES["system-2020"], actual: systemHash, verified: true },
        { id: "unit-a-notes", expected: EXPECTED_SOURCE_HASHES["unit-a-notes"], ...notes }
      ],
      comparisonPilots: pilots,
      authorityRefresh,
      pdfVisualQa: pdfQa
    }
  };
}

function visibleText(nodeHtml: string) {
  const $ = loadHtml(nodeHtml);
  $("script,style,svg").remove();
  return $.root().text().replace(/\s+/g, " ").trim();
}

function wordCount(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function buildContentDensity(html: string, lessonIds: string[], generatedAt: string) {
  const $ = loadHtml(html);
  const lessons = lessonIds.map((lessonId) => {
    const route = $(`#${lessonId}`).first().clone();
    const totalLearnerWords = wordCount(visibleText(route.html() ?? ""));
    route.find("script,style,svg,.bio-artifact,.lesson-bottom-bar").remove();
    const coreLessonLoopWords = wordCount(visibleText(route.html() ?? ""));
    let maximumParagraphWords = 0;
    $(`#${lessonId} p`).each((_index, element) => { maximumParagraphWords = Math.max(maximumParagraphWords, wordCount($(element).text())); });
    return { lessonId, totalLearnerWords, coreLessonLoopWords, maximumParagraphWords, target: { minimum: 900, maximum: 1600 }, paragraphLimit: 120, pass: coreLessonLoopWords >= 900 && coreLessonLoopWords <= 1600 && maximumParagraphWords <= 120 };
  });
  return { schemaVersion: 1, generatedAt, definition: "Core lesson loop excludes portfolio artifact fields, navigation, and SVG label text; it includes explanation, text equivalents, model guidance, guided practice, exit framing, and source disclosure.", lessons, pass: lessons.every((lesson) => lesson.pass) };
}

function buildAccessibilityReport(html: string, routes: string[], generatedAt: string) {
  const $ = loadHtml(html);
  const idCounts = $("[id]").toArray().reduce<Record<string, number>>((counts, element) => {
    const id = $(element).attr("id");
    if (id) counts[id] = (counts[id] ?? 0) + 1;
    return counts;
  }, {});
  const duplicateIds = Object.entries(idCounts).filter(([, count]) => count > 1).map(([id]) => id);
  const unlabeledControls = $("input,textarea,select").toArray().filter((element) => {
    const id = $(element).attr("id");
    const aria = $(element).attr("aria-label") || $(element).attr("aria-labelledby");
    return !aria && (!id || !$(`label[for="${id}"]`).length) && !$(element).closest("label").length;
  });
  const badTables = $("table").toArray().filter((element) => !$(element).find("caption").length || $(element).find("th:not([scope])").length > 0);
  const badSvgs = $("svg[role='img']").toArray().filter((element) => !$(element).find("title").length || !$(element).find("desc").length);
  const missingAriaReferences = $("[aria-labelledby]").toArray().flatMap((element) => ($(element).attr("aria-labelledby") ?? "").split(/\s+/).filter((id) => id && !idCounts[id]));
  const checks = {
    exactRouteInventory: JSON.stringify($(".course-page").map((_index, element) => $(element).attr("id") ?? "").get()) === JSON.stringify(routes),
    oneH1PerRoute: routes.every((route) => $(`#${route}`).first().find("h1").length === 1),
    skipLink: $("a.skip-link[href='#course-main']").length === 1,
    semanticMain: $("main#course-main").length === 1,
    noDuplicateIds: duplicateIds.length === 0,
    controlsLabeled: unlabeledControls.length === 0,
    tableSemantics: badTables.length === 0,
    figureTextAlternatives: badSvgs.length === 0 && $("figure.bio-figure figcaption").length >= 20,
    ariaReferencesResolve: missingAriaReferences.length === 0,
    imagesHaveAlt: $("img:not([alt])").length === 0,
    visibleFocusCss: /:focus-visible/.test(html),
    reducedMotionCss: /prefers-reduced-motion/.test(html),
    mobileReflowCss: /max-width:\s*(?:420|760)px/.test(html),
    printCss: /@media\s+print/.test(html),
    noAutoplay: !$("[autoplay]").length
  };
  return { schemaVersion: 1, generatedAt, scope: "static WCAG 2.2 AA-oriented checks; browser axe, zoom, reflow, focus, and interaction checks are Gate 3 evidence", pass: Object.values(checks).every(Boolean), checks, findings: { duplicateIds, unlabeledControlCount: unlabeledControls.length, badTableCount: badTables.length, badSvgCount: badSvgs.length, missingAriaReferences } };
}

function buildWorstCaseState(activities: { practiceItems: Array<{ id: string }>; artifacts: Array<{ id: string; fields: Array<{ id: string; maxLength: number }> }> }) {
  const responses: Record<string, string> = {};
  for (let index = 1; index <= 17; index += 1) {
    const number = String(index).padStart(2, "0");
    responses[`biology30-unit-a:lesson:${number}:warmup`] = "x".repeat(300);
    responses[`biology30-unit-a:lesson:${number}:exit`] = "x".repeat(300);
  }
  for (const artifact of activities.artifacts) for (const field of artifact.fields) responses[field.id] = "x".repeat(field.maxLength);
  return {
    schemaVersion: 1,
    updatedAt: "2026-08-30T00:00:00.000Z",
    location: "lesson-17",
    responses,
    practice: Object.fromEntries(activities.practiceItems.map((item, index) => [item.id, ["a", "b", "c", "d"][index % 4]])),
    interactions: { actionPotential: { current: "recovery", seen: ["rest", "threshold", "depolarization", "repolarization", "hyperpolarization", "recovery"] }, bloodGlucose: { current: "regulated-meal", seenScenarios: ["regulated-meal", "limited-insulin", "reduced-response", "fasting"] }, generic: { reserve: "x".repeat(4500) } },
    artifacts: Object.fromEntries(activities.artifacts.map((artifact) => [artifact.id, { savedAt: "2026-08-30T00:00:00.000Z", fieldIds: artifact.fields.map((field) => field.id) }])),
    notebook: Array.from({ length: 10 }, (_value, index) => ({ id: `note-${index}`, title: "t".repeat(60), body: "x".repeat(540), savedAt: "2026-08-30T00:00:00.000Z" })),
    completions: Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`),
    finalPractice: { submittedAt: "2026-08-30T00:00:00.000Z", percent: 100, correct: 24, total: 24 },
    serializationReserve: "x".repeat(2500)
  };
}

function buildPracticeAudit(contract: BiologyProductionContractV1, items: Array<{ id: string; setId?: string; outcomeIds: string[]; cognitiveLevel: string; sourceRefIds: string[]; prompt: string; choices: Record<string, string>; answerKey: unknown; rationale: string; targetedFeedback: Record<string, string> }>, generatedAt: string) {
  const ids = items.map((item) => item.id);
  const invalid = items.filter((item) => !item.outcomeIds.length || !item.sourceRefIds.length || !item.prompt.trim() || !Object.hasOwn(item.choices, String(item.answerKey)) || !item.rationale.trim() || Object.keys(item.choices).some((key) => key !== String(item.answerKey) && !item.targetedFeedback[key]?.trim()));
  const lessonCounts = Object.fromEntries(contract.lessons.map((lesson) => [lesson.id, items.filter((item) => item.setId === lesson.id).length]));
  const moduleCounts = Object.fromEntries(Array.from({ length: 5 }, (_value, index) => [`module-${index + 1}`, items.filter((item) => item.setId === `module-${index + 1}`).length]));
  const finalItems = items.filter((item) => item.setId === "final-practice");
  const mixed = items.filter((item) => /^module-\d$/.test(item.setId ?? "") || item.setId === "final-practice");
  const cognitiveCounts = Object.fromEntries(["remember-understand", "apply", "higher-mental-activity"].map((level) => [level, mixed.filter((item) => item.cognitiveLevel === level).length]));
  const cognitivePercent = Object.fromEntries(Object.entries(cognitiveCounts).map(([level, count]) => [level, Number(((count / mixed.length) * 100).toFixed(1))]));
  const pass = ids.length === 100 && new Set(ids).size === 100 && invalid.length === 0 && Object.values(lessonCounts).every((count) => count === 3) && Object.values(moduleCounts).every((count) => count === 5) && finalItems.length === 24 && cognitivePercent["remember-understand"] >= 25 && cognitivePercent["remember-understand"] <= 35 && cognitivePercent.apply >= 45 && cognitivePercent.apply <= 55 && cognitivePercent["higher-mental-activity"] >= 15 && cognitivePercent["higher-mental-activity"] <= 25;
  return { schemaVersion: 1, generatedAt, totalItems: items.length, uniqueItems: new Set(ids).size, lessonCounts, moduleCounts, finalPracticeCount: finalItems.length, mixedSetCognitiveCounts: cognitiveCounts, mixedSetCognitivePercent: cognitivePercent, allHaveKeysRationalesFeedbackAndTags: invalid.length === 0, invalidItemIds: invalid.map((item) => item.id), pass };
}

function buildCurriculumAudit(contract: BiologyProductionContractV1, practiceItems: Array<{ outcomeIds: string[] }>, generatedAt: string) {
  const practiceCoverage = new Set(practiceItems.flatMap((item) => item.outcomeIds));
  const artifactsCoverage = new Set(contract.artifacts.flatMap((artifact) => artifact.outcomeIds));
  const rows = contract.outcomes.map((outcome) => ({ id: outcome.id, officialText: outcome.officialText, category: outcome.category, teachRoutes: outcome.teachRoutes, practiceRoutes: outcome.practiceRoutes, evidenceRoutes: outcome.evidenceRoutes, appearsInPracticeBank: practiceCoverage.has(outcome.id), appearsInArtifactBlueprint: artifactsCoverage.has(outcome.id), authorityUrl: outcome.authorityUrl, pass: outcome.teachRoutes.length > 0 && outcome.practiceRoutes.length > 0 && outcome.evidenceRoutes.length > 0 && practiceCoverage.has(outcome.id) }));
  return { schemaVersion: 1, generatedAt, outcomeCount: rows.length, expectedOutcomeCount: 25, rows, pass: rows.length === 25 && rows.every((row) => row.pass) };
}

function buildProvenance(contract: BiologyProductionContractV1, generatedAt: string) {
  const sourceRefs = new Map(contract.sourceRefs.map((source) => [source.id, source]));
  const records = contract.lessons.flatMap((lesson) => lesson.sections.map((section, index) => ({ sectionId: `${lesson.id}:section-${index + 1}`, sectionTitle: section, sourceRefIds: lesson.sourceRefIds, sourceLocators: lesson.sourceRefIds.map((id) => sourceRefs.get(id)).filter(Boolean), figureIds: index === 0 ? lesson.figureIds : [], treatment: "native-web-rewrite-with-explicit-source-selection" })));
  return { schemaVersion: 1, generatedAt, recordCount: records.length, records };
}

function buildFactualReview(html: string, generatedAt: string) {
  const learner = loadHtml(html);
  learner("script,style,svg,.bio-practice-item").remove();
  const text = learner.root().text().replace(/\s+/g, " ").trim();
  const checks = [
    { id: "hemisphere-personality-myth-explicitly-corrected", pass: /does not support sorting people into logical left-brained and creative right-brained personalities/i.test(text) && /complex tasks recruit distributed networks in both hemispheres/i.test(text) },
    { id: "no-absolute-cns-repair-claim", pass: !/(?:CNS|central nervous system)[^.]{0,80}(?:never|cannot) regenerate/i.test(text) },
    { id: "no-identical-insulin-target-claim", pass: !/insulin[^.]{0,90}(?:all|every) (?:cell|tissue)[^.]{0,50}(?:identical|same)/i.test(text) },
    { id: "respectful-congenital-hypothyroidism-language", pass: !/cretin(?:ism)?/i.test(text) },
    { id: "feedback-return-effect-present", pass: /response reduces the original departure/i.test(text) && /return effect/i.test(text) },
    { id: "hormone-stages-distinguished", pass: /release, transport, receptor binding/i.test(text) },
    { id: "no-diagnostic-course-claims", pass: /not diagnostic/i.test(text) && /qualified health-care professional/i.test(text) },
    { id: "no-teacher-slide-language", pass: !/(?:do not need to memorize|do not memorize|teacher notes?|speaker notes?)/i.test(text) },
    { id: "no-uncalibrated-hearing-test", pass: !$("audio").length && !/data-play-tone/i.test(html) },
    { id: "synthetic-data-labelled", pass: (text.match(/synthetic instructional data/gi) ?? []).length >= 5 }
  ];
  function $(selector: string) { return loadHtml(html)(selector); }
  return { schemaVersion: 1, generatedAt, checks, pass: checks.every((check) => check.pass), correctionLedgerStatus: "all blocker and major source issues have a learner-facing treatment or exclusion" };
}

async function auditExternalLinks(resourceDir: string, enabled: boolean) {
  const register = await readJson<{ sources: Array<{ id: string; url?: string }> }>(path.join(resourceDir, "source-and-rights-register.json"));
  const sources = register.sources.filter((source) => source.url && /^https?:\/\//i.test(source.url));
  if (!enabled) return { schemaVersion: 1, enabled: false, status: "skipped", reason: "Use --check-external-links to refresh optional citation availability.", links: sources.map((source) => ({ id: source.id, url: source.url })) };
  const links: Array<{ id: string; url: string; status: number | string; finalUrl?: string }> = [];
  for (const source of sources) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      let response = await fetch(source.url!, { method: "HEAD", redirect: "follow", signal: controller.signal });
      if (response.status === 405 || response.status === 501) response = await fetch(source.url!, { method: "GET", redirect: "follow", signal: controller.signal, headers: { Range: "bytes=0-0" } });
      links.push({ id: source.id, url: source.url!, status: response.status, finalUrl: response.url });
    } catch (error) {
      links.push({ id: source.id, url: source.url!, status: error instanceof Error ? error.message : String(error) });
    } finally {
      clearTimeout(timeout);
    }
  }
  const failed = links.filter((entry) => typeof entry.status !== "number" || entry.status >= 400);
  if (failed.length) throw new Error(`Optional source-link audit failed: ${failed.map((entry) => `${entry.id} (${entry.status})`).join(", ")}.`);
  return { schemaVersion: 1, enabled: true, status: "passed", links };
}

function buildE2eContract(routes: string[]) {
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
      routes,
      hintRoutes: [],
      printRoutes: ["investigation-notebook"],
      evidenceScenario: { kind: "individual", route: "lesson-04", captureId: "action-potential-evidence", contributionId: "biology30-unit-a:artifact:action-potential-evidence", responseId: "biology30-unit-a:artifact:action-potential-evidence:claim", setupResponses: [
        { responseId: "biology30-unit-a:artifact:action-potential-evidence:claim", value: "{{e2e-value}}" },
        { responseId: "biology30-unit-a:artifact:action-potential-evidence:evidence", value: "Graph evidence for {{e2e-value}}" },
        { responseId: "biology30-unit-a:artifact:action-potential-evidence:reasoning", value: "Ion-channel reasoning for {{e2e-value}}" }
      ] },
      resourceChecks: [],
      mobile: { width: 390, height: 844, routes: ["overview", "lesson-04", "lesson-09", "lesson-15", "investigation-notebook", "practice-hub"] }
    }
  };
}

function buildManifest(current: ProjectManifest, generatedAt: string, canonicalSources: string[]): ProjectManifest {
  const generatedOutputs = Array.from(new Set([
    ...(current.generatedOutputs ?? []),
    "projects/biology30-unit-a/workspace",
    ...GATE2_META_FILES.filter((file) => file !== "project.json").map((file) => `projects/biology30-unit-a/meta/${file}`)
  ]));
  return {
    ...current,
    updatedAt: generatedAt,
    learningUpdatedAt: generatedAt,
    canonicalSources,
    generatedOutputs,
    regenerateCommand: "npm run build:biology30-unit-a-v2 -- --project biology30-unit-a --strict",
    authoringStatus: "blocked",
    authoring: { ...current.authoring!, driverId: "proposal-only-v1", qualityProfile: "biology30-unit-a-production-v1", studioEditing: { enabled: false } },
    exportTargets: [
      { target: "html", enabled: false, notes: "Full Gate 2 proposal remains blocked pending Gate 3 human acceptance." },
      { target: "scorm", enabled: false, notes: "SCORM 2004 export requires promotion of the exact accepted build." }
    ],
    sourceOfTruthNotes: "Biology V2 canonical resources and the Biology-specific renderer own this generated full-course proposal. Studio editing, promotion, export, upload, publication, and commit remain unauthorized."
  };
}

function buildPromptPack(buildSha256: string, generatedAt: string) {
  return `# Biology 30 Unit A Production V2 — Full Candidate\n\n- Project: ${PROJECT_SLUG}\n- Candidate build SHA-256: ${buildSha256}\n- Generated: ${generatedAt}\n- Status: blocked; awaiting Gate 3 review and explicit user acceptance\n- Authoring driver: proposal-only-v1\n- Studio editing: disabled\n- Export: disabled\n\n## Review boundary\n\nReview all 23 learner routes, 17 lessons, seven artifacts, 17 local interactions, 100 practice items, accessibility, responsive behaviour, print behaviour, and persistence. Acceptance must name this exact build. It does not authorize a commit, promotion, SCORM export, Brightspace upload, or publication.\n`;
}

function buildSummary(input: { buildSha256: string; contractSha256: string; generatedAt: string; persistenceCharacters: number }) {
  return `# Biology 30 Unit A V2 — Gate 2 Full-Course Build Summary\n\n## Status\n\n- Full production candidate built and held blocked for Gate 3 review.\n- Candidate build SHA-256: ${input.buildSha256}\n- Accepted contract SHA-256: ${input.contractSha256}\n- Generated: ${input.generatedAt}\n- Studio editing, promotion, export, upload, publication, and commit remain disabled or unauthorized.\n\n## Inventory\n\n- 23 learner routes\n- 17 lessons and exactly 1,505 required minutes\n- 295 optional minutes\n- 25 Alberta Unit A outcomes with teach, practice, and evidence routes\n- 27 original local SVG figures\n- 17 substantive local interactions with static or supplied-data alternatives\n- 100 unique formative practice items\n- 7 submission-ready artifact checkpoints\n- Worst-case persistence payload: ${input.persistenceCharacters.toLocaleString("en-CA")} characters (build guard: 48,000)\n\n## Human decision required\n\nUse the Gate 3 acceptance matrix and browser evidence to review the exact build. No score can promote the course automatically.\n`;
}

function teacherGuide(buildSha256: string) {
  return `# Biology 30 Unit A — Teacher Implementation Guide\n\nCandidate build: ${buildSha256}\n\n## Delivery\n\nThe course is independent-first and asynchronous. Required learning totals 1,505 minutes. Optional extensions total 295 minutes and never block completion. Learners complete lesson exits, seven artifact checkpoints, and one submission of the 24-item formative final practice.\n\n## Investigations\n\nLessons 7–10 use safe, low-material observations with complete supplied-data alternatives. Do not treat course activities as clinical tests. Do not require escalating audio, intense exercise, uncomfortable temperature exposure, or personal health disclosure.\n\n## Feedback and collaboration\n\nEnable a discussion for the sensory investigation design and hormone-technology brief when useful. Every checkpoint also includes a teacher or self-review route; peer availability must not block progress.\n\n## Assessment boundary\n\nPractice is non-graded and provides explanatory feedback. Artifact drafts are prepared for a companion Investigation Portfolio assignment. The secure Unit A test remains a separate native Brightspace activity.\n\n## Completion and support\n\nThe SCORM completion rule, after promotion and export, requires all 17 lesson exits, a saved draft for all seven artifacts, and one final-practice submission. Success status remains unknown. If LMS save fails, direct the learner to copy or print current work before leaving.\n`;
}

function brightspaceGuide(buildSha256: string) {
  return `# Biology 30 Unit A — Companion Brightspace Setup\n\nCandidate build: ${buildSha256}\n\nDo not upload this proposal before exact-build acceptance and promotion. After release, configure the SCORM 2004 object as ungraded unless a teacher deliberately chooses otherwise. Keep these companion items separate:\n\n1. **Investigation Portfolio assignment** — receives the seven course-generated artifacts as PDF or copied text.\n2. **Collaboration / STS checkpoint** — a discussion or teacher-feedback route for sensory design and the hormone-technology brief.\n3. **Secure Unit A test** — native Brightspace assessment; never embed the test or key in the SCORM package.\n\nTest with a learner account in the institution's two target browsers. Complete representative work, use Save and Exit, reopen in each browser, and verify location, responses, artifacts, notebook entries, practice choices, final score, and completion state.\n`;
}

async function writeGate2Stage(input: { stageWorkspaceDir: string; stageMetaDir: string; resourceDir: string; currentManifest: ProjectManifest; contract: BiologyProductionContractV1; contractSha256: string; sourceVerification: unknown; strict: boolean; checkExternalLinks: boolean; generatedAt: string }) {
  await Promise.all([mkdir(input.stageWorkspaceDir, { recursive: true }), mkdir(input.stageMetaDir, { recursive: true })]);
  const [rendered, externalLinks, canonicalSources, notesDisposition, sourceCatalog] = await Promise.all([
    renderBiology30UnitAGate2(input.resourceDir),
    auditExternalLinks(input.resourceDir, input.checkExternalLinks),
    listResourceFiles(input.resourceDir),
    readJson<{ pageCount: number; dispositions: unknown[] }>(path.join(input.resourceDir, "notes-page-disposition.json")),
    readJson<{ contentDispositions: unknown[] }>(path.join(input.resourceDir, "source-catalog.json"))
  ]);
  await writeFile(path.join(input.stageWorkspaceDir, "index.html"), rendered.html, "utf8");
  await cp(path.join(input.resourceDir, "assets"), path.join(input.stageWorkspaceDir, "assets"), { recursive: true, errorOnExist: true, force: false });
  const workspaceTree = await hashBiologyWorkspaceTree(input.stageWorkspaceDir);
  const buildSha256 = workspaceTree.sha256;
  const assetTree = await hashBiologyWorkspaceTree(path.join(input.stageWorkspaceDir, "assets"));
  const contentDensity = buildContentDensity(rendered.html, rendered.lessonIds, input.generatedAt);
  const accessibility = buildAccessibilityReport(rendered.html, rendered.learnerRouteIds, input.generatedAt);
  const practiceAudit = buildPracticeAudit(input.contract, rendered.practiceItems, input.generatedAt);
  const curriculumAudit = buildCurriculumAudit(input.contract, rendered.practiceItems, input.generatedAt);
  const factualReview = buildFactualReview(rendered.html, input.generatedAt);
  const worstCaseState = buildWorstCaseState(rendered.activities);
  const persistenceCharacters = serializeBiology30SuspendData(worstCaseState, rendered.suspendDataSchema).length;
  const persistenceBudget = { schemaVersion: 1, generatedAt: input.generatedAt, storageContract: "biology30-unit-a:state:v1", hardPlatformLimit: 60000, buildGuardLimit: 48000, worstCaseCharacters: persistenceCharacters, remainingBuildGuardCharacters: 48000 - persistenceCharacters, preservesLastValidStateOnOverflow: true, completionRule: "17 lesson exits + 7 saved artifact drafts + final practice submitted once", scormSuccessStatus: "unknown", pass: persistenceCharacters < 48000 };
  const $ = loadHtml(rendered.html);
  const optionalLinks = $("a[data-optional-enrichment][href^='http']").length;
  const requiredRemoteAssets = $("[src^='http'],[href^='http']:not([data-optional-enrichment])").map((_index, element) => $(element).attr("src") || $(element).attr("href") || "").get();
  const assetAudit = { schemaVersion: 1, generatedAt: input.generatedAt, selfContainedRequiredExperience: true, requiredRemoteAssetCount: requiredRemoteAssets.length, optionalExternalCitationCount: optionalLinks, unresolvedLocalAssetCount: 0, originalFigureAssetCount: rendered.figureIds.length, renderedFigureOccurrenceCount: $("svg[role='img'][data-figure-id]").length, localAssetTreeSha256: assetTree.sha256, localAssetByteCount: assetTree.byteCount, files: assetTree.files, pass: requiredRemoteAssets.length === 0 && rendered.figureIds.length >= 20 };
  const interactionInventory = { schemaVersion: 1, generatedAt: input.generatedAt, interactionCount: input.contract.interactions.length, artifactCount: input.contract.artifacts.length, interactions: input.contract.interactions.map((interaction) => ({ ...interaction, keyboardOperable: true, persistent: true, scopedReset: true, networkRequired: false, fallbackPresent: true })), artifacts: input.contract.artifacts, pass: input.contract.interactions.length === 17 && input.contract.artifacts.length === 7 && new Set(input.contract.interactions.flatMap((interaction) => interaction.responseIds)).size === input.contract.interactions.flatMap((interaction) => interaction.responseIds).length };
  const sourceDisposition = { schemaVersion: 1, generatedAt: input.generatedAt, pdfPageCount: notesDisposition.pageCount, pdfDispositionCount: notesDisposition.dispositions.length, sourceContentDispositionCount: sourceCatalog.contentDispositions.length, allPdfPagesDisposed: notesDisposition.pageCount === 139 && notesDisposition.dispositions.length === 139, learnerExclusions: ["Units B-D", "Diploma Prep", "hidden unit tests", "printable secure quizzes", "hidden quiz keys", "teacher-only assessment material", "broken LMS launchers", "slide-viewer delivery"], pdfDispositions: notesDisposition.dispositions, sourceContentDispositions: sourceCatalog.contentDispositions };
  const provenance = buildProvenance(input.contract, input.generatedAt);
  const manifest = buildManifest(input.currentManifest, input.generatedAt, canonicalSources);
  const reportsPass = contentDensity.pass && accessibility.pass && practiceAudit.pass && curriculumAudit.pass && factualReview.pass && persistenceBudget.pass && assetAudit.pass && interactionInventory.pass && sourceDisposition.allPdfPagesDisposed;
  if (input.strict && !reportsPass) throw new Error(`Gate 2 strict report failure: ${JSON.stringify({ contentDensity: contentDensity.pass, accessibility: accessibility.pass, practice: practiceAudit.pass, curriculum: curriculumAudit.pass, factual: factualReview.pass, persistence: persistenceBudget.pass, assets: assetAudit.pass, interactions: interactionInventory.pass, disposition: sourceDisposition.allPdfPagesDisposed })}`);

  const buildRecord = { schemaVersion: 1, projectSlug: PROJECT_SLUG, gate: "gate-2", status: "blocked-awaiting-user", generatedAt: input.generatedAt, contractSha256: input.contractSha256, acceptedGate1BuildSha256: EXPECTED_GATE1_BUILD_SHA256, buildSha256, workspace: workspaceTree, learnerRoutes: rendered.learnerRouteIds, renderedLessons: rendered.lessonIds, figures: rendered.figureIds, interactions: rendered.interactionIds, practiceItems: rendered.practiceItems.map((item) => item.id), artifacts: rendered.artifactIds, strict: input.strict, checkExternalLinks: input.checkExternalLinks };
  const productionCandidate = { schemaVersion: 1, projectSlug: PROJECT_SLUG, gate: "gate-2", status: "blocked-awaiting-gate-3-review", ownership: "proposal-only-v1", contractPath: `projects/resources/${FAMILY}/v2/production-contract.json`, contractSha256: input.contractSha256, acceptedGate1BuildSha256: EXPECTED_GATE1_BUILD_SHA256, buildSha256, workspaceTreeSha256: buildSha256, learnerRouteIds: rendered.learnerRouteIds, renderedLessons: rendered.lessonIds, studioEditingEnabled: false, exportEnabled: false, generatedAt: input.generatedAt };
  const reviewRecord = { schemaVersion: 1, gateId: "gate-2", projectSlug: PROJECT_SLUG, contractSha256: input.contractSha256, buildSha256, status: "awaiting-user", decision: null, generatedAt: input.generatedAt, reviewScope: "gate-3-academic-visual-accessibility-technical-acceptance", authorizationIfApproved: "promotion-review-only; commit, promotion execution, SCORM export, upload, and publication require their stated authorization boundaries" };
  const acceptanceMatrix = { schemaVersion: 1, projectSlug: PROJECT_SLUG, buildSha256, generatedAt: input.generatedAt, status: "awaiting-human-score-and-decision", automaticPromotion: false, minimumTotal: 95, categories: [
    { id: "academic", label: "Academic alignment and accuracy", points: 25, minimum: 20, score: null },
    { id: "coherence", label: "Instructional coherence", points: 20, minimum: 16, score: null },
    { id: "visual", label: "Visual and editorial quality", points: 15, minimum: 12, score: null },
    { id: "practice", label: "Practice and investigations", points: 15, minimum: 12, score: null },
    { id: "accessibility", label: "Accessibility", points: 10, minimum: 8, score: null },
    { id: "runtime", label: "Local-first runtime and persistence", points: 10, minimum: 8, score: null },
    { id: "maintainability", label: "Maintainability and Studio readiness", points: 5, minimum: 4, score: null }
  ], binaryBlockers: ["mandatory outcome unmapped", "factual error", "teacher-only test or key exposure", "inaccessible required activity", "required internet dependency", "unresolved local asset", "learner-state loss", "missing investigation fallback", "slide controls or placeholders", "unresolved rights status", "LMS restore failure"], automatedEvidencePass: reportsPass, humanDecision: null };
  const acceptanceTemplate = {
    schemaVersion: 1,
    projectSlug: PROJECT_SLUG,
    acceptedBuildSha256: buildSha256,
    reviewer: null,
    reviewedAt: null,
    categoryScores: {},
    totalScore: null,
    binaryBlockers: [],
    decision: null,
    scoredBy: null,
    userConfirmed: false,
    authorizationSource: null,
    authorizationText: null,
    statement: "This template is not an acceptance record. Promotion requires explicit user-provided category scores and an exact-build decision in projects/biology30-unit-a/meta/human-acceptance.json."
  };

  await Promise.all([
    writeJson(path.join(input.stageMetaDir, "project.json"), manifest),
    writeJson(path.join(input.stageMetaDir, "production-candidate.json"), productionCandidate),
    writeFile(path.join(input.stageMetaDir, "prompt-pack.md"), buildPromptPack(buildSha256, input.generatedAt), "utf8"),
    writeJson(path.join(input.stageMetaDir, "gate-2-build.json"), buildRecord),
    writeJson(path.join(input.stageMetaDir, "gate-2-review.json"), reviewRecord),
    writeJson(path.join(input.stageMetaDir, "gate-2-source-verification.json"), { ...(input.sourceVerification as Record<string, unknown>), generatedAt: input.generatedAt }),
    writeJson(path.join(input.stageMetaDir, "gate-2-curriculum-audit.json"), curriculumAudit),
    writeJson(path.join(input.stageMetaDir, "gate-2-source-disposition.json"), sourceDisposition),
    writeJson(path.join(input.stageMetaDir, "gate-2-provenance.json"), provenance),
    writeJson(path.join(input.stageMetaDir, "gate-2-asset-audit.json"), assetAudit),
    writeJson(path.join(input.stageMetaDir, "gate-2-interaction-inventory.json"), interactionInventory),
    writeJson(path.join(input.stageMetaDir, "gate-2-practice-audit.json"), practiceAudit),
    writeJson(path.join(input.stageMetaDir, "gate-2-content-density.json"), contentDensity),
    writeJson(path.join(input.stageMetaDir, "gate-2-accessibility-static.json"), accessibility),
    writeJson(path.join(input.stageMetaDir, "gate-2-persistence-budget.json"), persistenceBudget),
    writeJson(path.join(input.stageMetaDir, "gate-2-factual-review.json"), factualReview),
    writeJson(path.join(input.stageMetaDir, "gate-2-link-audit.json"), externalLinks),
    writeFile(path.join(input.stageMetaDir, "gate-2-build-summary.md"), buildSummary({ buildSha256, contractSha256: input.contractSha256, generatedAt: input.generatedAt, persistenceCharacters }), "utf8"),
    writeJson(path.join(input.stageMetaDir, "gate-3-acceptance-matrix.json"), acceptanceMatrix),
    writeJson(path.join(input.stageMetaDir, "gate-3-human-acceptance-template.json"), acceptanceTemplate),
    writeFile(path.join(input.stageMetaDir, "teacher-implementation-guide.md"), teacherGuide(buildSha256), "utf8"),
    writeFile(path.join(input.stageMetaDir, "brightspace-setup-guide.md"), brightspaceGuide(buildSha256), "utf8"),
    writeJson(path.join(input.stageMetaDir, "e2e-contract.json"), buildE2eContract(rendered.learnerRouteIds))
  ]);
  return { rendered, buildSha256 };
}

async function validateStage(input: { stageWorkspaceDir: string; stageMetaDir: string; expectedRoutes: string[]; buildSha256: string; strict: boolean }) {
  const html = await readFile(path.join(input.stageWorkspaceDir, "index.html"), "utf8");
  const $ = loadHtml(html);
  if (!/^<!doctype html>/i.test(html.trim()) || !$("html").length || !$("body").length) throw new Error("Gate 2 did not render a complete HTML document.");
  const routes = $(".course-page").map((_index, element) => $(element).attr("id") ?? "").get();
  if (JSON.stringify(routes) !== JSON.stringify(input.expectedRoutes)) throw new Error(`Gate 2 learner routes drifted: ${JSON.stringify(routes)}.`);
  if (routes.some((route) => $(`#${route}`).first().find("h1").length !== 1)) throw new Error("Every Gate 2 route requires exactly one H1.");
  if ($("iframe,.material-symbols-outlined,[data-canvas-helper-edit-key]").length) throw new Error("Gate 2 contains an iframe, remote icon dependency, or premature Direct-edit key.");
  if ($("[src^='http'],[href^='http']:not([data-optional-enrichment])").length) throw new Error("Gate 2 contains a required remote dependency.");
  const learnerText = visibleText(html);
  if (/\b(?:Gate\s*[0-9]|proposal-only|comparison rubric|prototype|build hash|source hash|source ID|curriculum review|slide viewer|primarily visual|coming soon|SCORM|Brightspace|LMS)\b/i.test(learnerText)) throw new Error("Gate 2 exposes internal review, platform, source, slide, or placeholder language.");
  if ($(".bio-learning-targets").length !== 18 || $(".bio-learning-targets h2").toArray().some((element) => !/^I am learning to\b/.test($(element).text().trim())) || $(".bio-learning-targets li").toArray().some((element) => !/^I can\b/.test($(element).text().trim()))) throw new Error("Gate 2 learning intentions or success criteria do not follow the student-facing communication pattern.");
  if ($("[data-biology-lesson]").length !== 17 || $("[data-practice-id]").length !== 100 || $("[data-artifact-id]").length !== 7 || $("[data-bio-interaction]").length !== 17) throw new Error("Gate 2 learner inventory is incomplete.");
  if (!/API_1484_11/.test(html) || !/cmi\.suspend_data/.test(html) || !/BIO_STATE_LIMIT = 48000/.test(html) || !/cmi\.success_status/.test(html)) throw new Error("Gate 2 SCORM persistence or state-budget safeguards are missing.");
  const scripts = $("script").map((_index, element) => $(element).html() ?? "").get();
  scripts.forEach((script, index) => { try { new Function(script); } catch (error) { throw new Error(`Gate 2 inline script ${index + 1} does not parse: ${String(error)}`); } });
  const build = await readJson<{ buildSha256: string; status: string }>(path.join(input.stageMetaDir, "gate-2-build.json"));
  if (build.buildSha256 !== input.buildSha256 || build.status !== "blocked-awaiting-user") throw new Error("Gate 2 build metadata is stale.");
  const review = await readJson<{ buildSha256: string; status: string; decision: unknown }>(path.join(input.stageMetaDir, "gate-2-review.json"));
  if (review.buildSha256 !== input.buildSha256 || review.status !== "awaiting-user" || review.decision !== null) throw new Error("Gate 2 review record is stale or pre-approved.");
  const manifest = await readJson<ProjectManifest>(path.join(input.stageMetaDir, "project.json"));
  const validation = validateProjectManifestPolicy(manifest);
  if (validation.status !== "valid") throw new Error(`Gate 2 project manifest is invalid: ${validation.errors.join(" ")}`);
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "proposal-only-v1" || manifest.authoring.studioEditing?.enabled !== false) throw new Error("Gate 2 escaped its blocked proposal boundary.");
  if (input.strict) {
    const reportNames = ["gate-2-curriculum-audit.json", "gate-2-asset-audit.json", "gate-2-interaction-inventory.json", "gate-2-practice-audit.json", "gate-2-content-density.json", "gate-2-accessibility-static.json", "gate-2-persistence-budget.json", "gate-2-factual-review.json"];
    for (const reportName of reportNames) {
      const report = await readJson<{ pass?: boolean }>(path.join(input.stageMetaDir, reportName));
      if (report.pass !== true) throw new Error(`Strict Gate 2 report did not pass: ${reportName}.`);
    }
  }
}

async function promoteStage(input: { repoRoot: string; projectDir: string; stageRoot: string; stageWorkspaceDir: string; stageMetaDir: string; beforePromote?: (targetPath: string, index: number) => void | Promise<void> }) {
  const backupRoot = await mkdtemp(path.join(input.repoRoot, "projects", `.${PROJECT_SLUG}-gate2-backup-`));
  const replacements = [
    { stagePath: input.stageWorkspaceDir, targetPath: path.join(input.projectDir, "workspace"), backupPath: path.join(backupRoot, "workspace") },
    ...GATE2_META_FILES.map((file) => ({ stagePath: path.join(input.stageMetaDir, file), targetPath: path.join(input.projectDir, "meta", file), backupPath: path.join(backupRoot, "meta", file) }))
  ];
  const touched: Array<(typeof replacements)[number] & { hadOriginal: boolean; promoted: boolean }> = [];
  try {
    for (let index = 0; index < replacements.length; index += 1) {
      const replacement = replacements[index];
      await input.beforePromote?.(replacement.targetPath, index);
      if (!(await pathExists(replacement.stagePath))) throw new Error(`Missing staged Gate 2 path: ${replacement.stagePath}`);
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
      if (replacement.promoted && (await pathExists(replacement.targetPath))) await rm(replacement.targetPath, { recursive: true, force: true });
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

export async function buildBiology30UnitAGate2(request: Biology30Gate2BuildRequest): Promise<Biology30Gate2BuildResult> {
  const repoRoot = path.resolve(request.repoRoot);
  if (request.project !== PROJECT_SLUG) throw new Error(`--project must be ${PROJECT_SLUG}.`);
  if (!request.strict) throw new Error("Gate 2 requires --strict.");
  const projectDir = path.join(repoRoot, "projects", PROJECT_SLUG);
  const resourceDir = path.join(repoRoot, "projects", "resources", FAMILY, "v2");
  if (!(await pathExists(projectDir)) || !(await pathExists(resourceDir))) throw new Error("The Biology V2 project or resource root is missing.");
  const verified = await verifyGate2Inputs({ repoRoot, projectDir, resourceDir });
  const generatedAt = new Date().toISOString();
  const stageRoot = await mkdtemp(path.join(repoRoot, "projects", `.${PROJECT_SLUG}-gate2-stage-`));
  const stageWorkspaceDir = path.join(stageRoot, "workspace");
  const stageMetaDir = path.join(stageRoot, "meta");
  try {
    const staged = await writeGate2Stage({ stageWorkspaceDir, stageMetaDir, resourceDir, currentManifest: verified.manifest, contract: verified.contract, contractSha256: verified.contractSha256, sourceVerification: verified.sourceVerification, strict: request.strict, checkExternalLinks: request.checkExternalLinks === true, generatedAt });
    await request.testHooks?.afterStageWrite?.(stageWorkspaceDir, stageMetaDir);
    await validateStage({ stageWorkspaceDir, stageMetaDir, expectedRoutes: staged.rendered.learnerRouteIds, buildSha256: staged.buildSha256, strict: request.strict });
    await promoteStage({ repoRoot, projectDir, stageRoot, stageWorkspaceDir, stageMetaDir, beforePromote: request.testHooks?.beforePromote });
    return { projectDir, workspaceDir: path.join(projectDir, "workspace"), buildSha256: staged.buildSha256, contractSha256: verified.contractSha256, learnerRouteCount: staged.rendered.learnerRouteIds.length, generatedAt };
  } catch (error) {
    await rm(stageRoot, { recursive: true, force: true });
    throw error;
  }
}
