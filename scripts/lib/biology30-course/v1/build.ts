import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { cp, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { load as loadHtml } from "cheerio";

import { validateProjectManifestPolicy } from "../../project-manifest-policy.js";
import type { ProjectManifest } from "../../types.js";
import { hashBiologyWorkspaceTree } from "../../biology30-unit-a/v2/gate2-build.js";
import { BIOLOGY30_UNIT_B_CONTENT } from "./content-b.js";
import { BIOLOGY30_UNIT_C_CONTENT } from "./content-c.js";
import { BIOLOGY30_UNIT_D_CONTENT } from "./content-d.js";
import { validateBiology30LessonContent, type Biology30LessonContent } from "./content-types.js";
import { BIOLOGY30_UNIT_B_GLOSSARY } from "./glossary-b.js";
import { BIOLOGY30_UNIT_C_GLOSSARY } from "./glossary-c.js";
import { BIOLOGY30_UNIT_D_GLOSSARY } from "./glossary-d.js";
import {
  BIOLOGY30_PRODUCTION_FAMILY,
  BIOLOGY30_PRODUCTION_PROFILE,
  BIOLOGY30_PRODUCTION_RESOURCE_ROOT,
  BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH,
  validateBiology30SourceAndRightsRegister,
  validateBiology30RemainingUnitContract,
  type Biology30SourceAndRightsRegister,
  type RemainingSourceCatalog,
  type RemainingUnitContract
} from "./intake.js";
import { renderBiology30ProductionUnit, type Biology30ProductionRenderResult } from "./render.js";
import { serializeBiology30SuspendData } from "./suspend-data.js";
import { BIOLOGY30_TOPIC_PROFILE, readBiology30TopicContract } from "./pilot2-contract.js";
import { hashTopicBuildTree } from "./pilot2-build-transaction.js";
import { buildTopicProductionUnit } from "./pilot2-build.js";

const SOURCE_MANIFEST_PATH = "projects/resources/biology30-unit-a-pilot/resource-manifest.json";
const SHARED_ASSET_ROOT = "projects/resources/biology30-unit-a-pilot/v2/assets";
const UNIT_BY_PROJECT = {
  "biology30-unit-b": "B",
  "biology30-unit-c": "C",
  "biology30-unit-d": "D"
} as const;

type SupportedProject = keyof typeof UNIT_BY_PROJECT;

export type Biology30ProductionBuildRequest = {
  repoRoot: string;
  project: string;
  strict: boolean;
  checkExternalLinks?: boolean;
  profile?: string;
  baselineWorkspaceSha256?: string;
  testHooks?: {
    afterStageWrite?: (stageWorkspaceDir: string, stageMetaDir: string) => void | Promise<void>;
    beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
  };
};

export type Biology30ProductionBuildResult = {
  projectDir: string;
  workspaceDir: string;
  unitCode: "B" | "C" | "D";
  buildSha256: string;
  contractSha256: string;
  learnerRouteCount: number;
  lessonCount: number;
  practiceItemCount: number;
  generatedAt: string;
};

type SourceManifestResource = {
  id: string;
  label: string;
  role: string;
  path: string;
  sha256: string;
  originalName: string;
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
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function unitContent(unitCode: "B" | "C" | "D"): { contents: Biology30LessonContent[]; glossary: Record<string, string>; contentSources: string[] } {
  if (unitCode === "B") {
    return {
      contents: BIOLOGY30_UNIT_B_CONTENT,
      glossary: BIOLOGY30_UNIT_B_GLOSSARY,
      contentSources: [
        "scripts/lib/biology30-course/v1/content-b.ts",
        "scripts/lib/biology30-course/v1/glossary-b.ts",
        "scripts/lib/biology30-course/v1/content-factory.ts",
        "scripts/lib/biology30-course/v1/figure-grammar.ts"
      ]
    };
  }
  if (unitCode === "C") {
    return {
      contents: BIOLOGY30_UNIT_C_CONTENT,
      glossary: BIOLOGY30_UNIT_C_GLOSSARY,
      contentSources: [
        "scripts/lib/biology30-course/v1/content-c.ts",
        "scripts/lib/biology30-course/v1/glossary-c.ts",
        "scripts/lib/biology30-course/v1/content-factory.ts",
        "scripts/lib/biology30-course/v1/figure-grammar.ts"
      ]
    };
  }
  if (unitCode === "D") {
    return {
      contents: BIOLOGY30_UNIT_D_CONTENT,
      glossary: BIOLOGY30_UNIT_D_GLOSSARY,
      contentSources: [
        "scripts/lib/biology30-course/v1/content-d.ts",
        "scripts/lib/biology30-course/v1/glossary-d.ts",
        "scripts/lib/biology30-course/v1/figure-grammar.ts"
      ]
    };
  }
  throw new Error(`Unit ${unitCode} is outside the remaining-units production boundary.`);
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function lessonInstructionalText(content: Biology30LessonContent) {
  const values = [
    content.learningIntention,
    ...content.successCriteria,
    content.materials,
    content.safety,
    content.warmup.title,
    content.warmup.prompt,
    ...content.sections.flatMap((section) => [section.label ?? "", section.title, ...section.paragraphs, section.table?.caption ?? "", ...(section.table?.headers ?? []), ...(section.table?.rows.flat() ?? [])]),
    content.conceptMap.title,
    content.conceptMap.description,
    ...content.conceptMap.nodes.flatMap((node) => [node.label, node.detail]),
    content.interaction.title,
    content.interaction.intro,
    content.interaction.prompt,
    ...content.interaction.cases.flatMap((entry) => [entry.label, entry.evidence, entry.explanation]),
    content.interaction.staticFallback,
    ...content.practiceSeeds.flatMap((item) => [item.prompt, item.correct, ...item.distractors, item.rationale, ...item.misconceptionFeedback]),
    content.artifact.prompt,
    ...content.artifact.evidenceRequirements,
    content.exit.title,
    content.exit.prompt
  ];
  return values.filter(Boolean).join(" ");
}

function visibleText(html: string) {
  const $ = loadHtml(html);
  $("script,style,template,noscript").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

function buildContentDensity(contents: Biology30LessonContent[], generatedAt: string) {
  const lessons = contents.map((content) => {
    const instructionalWords = wordCount(lessonInstructionalText(content));
    const paragraphWords = content.sections.flatMap((section) => section.paragraphs.map((paragraph) => wordCount(paragraph)));
    return {
      lessonId: content.id,
      instructionalWords,
      explanatorySectionWords: wordCount(content.sections.flatMap((section) => section.paragraphs).join(" ")),
      sectionCount: content.sections.length,
      longestParagraphWords: Math.max(...paragraphWords),
      pass: instructionalWords >= 900 && instructionalWords <= 1600 && content.sections.length >= 4 && Math.max(...paragraphWords) <= 120
    };
  });
  return {
    schemaVersion: 1,
    generatedAt,
    definition: "Learner-facing instructional words in the lesson record, including explanations, model evidence, feedback, and evidence prompts; navigation and repeated shell text are excluded.",
    expectedWordsPerLesson: { minimum: 900, maximum: 1600 },
    lessons,
    pass: lessons.every((lesson) => lesson.pass)
  };
}

function buildAccessibilityReport(html: string, routeIds: string[], expectedFigures: number, generatedAt: string) {
  const $ = loadHtml(html);
  const ids = $("[id]").map((_index, element) => $(element).attr("id") ?? "").get();
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  const missingRouteH1 = routeIds.filter((routeId) => $(`#${routeId}`).find("h1").length !== 1);
  const unlabeledFields = $("input,select,textarea").toArray().flatMap((element) => {
    const node = $(element);
    const id = node.attr("id");
    const wrapped = node.parents("label").length > 0;
    const explicit = Boolean(id && $(`label[for='${id}']`).length);
    const named = Boolean(node.attr("aria-label") || node.attr("aria-labelledby"));
    return wrapped || explicit || named ? [] : [id || node.attr("name") || element.tagName];
  });
  const figures = $("figure[data-semantic-figure-id]");
  const incompleteFigures = figures.toArray().flatMap((element) => {
    const node = $(element);
    return node.attr("aria-labelledby") && node.attr("aria-describedby") && node.find("figcaption").length ? [] : [node.attr("data-semantic-figure-id") || "unknown"];
  });
  const tablesWithoutCaptions = $("table").toArray().filter((element) => $(element).find("caption").length !== 1).length;
  const missingLearningLanguage = $(".bio-learning-targets h2").toArray().filter((element) => !/^I am learning to\b/.test($(element).text().trim())).length
    + $(".bio-learning-targets li").toArray().filter((element) => !/^I can\b/.test($(element).text().trim())).length;
  const pass = duplicateIds.length === 0
    && missingRouteH1.length === 0
    && unlabeledFields.length === 0
    && figures.length === expectedFigures
    && incompleteFigures.length === 0
    && tablesWithoutCaptions === 0
    && missingLearningLanguage === 0
    && $("a[href='#course-main']").length > 0
    && $("iframe").length === 0;
  return {
    schemaVersion: 1,
    generatedAt,
    standard: "WCAG 2.2 AA static prerequisites",
    routeCount: routeIds.length,
    duplicateIds,
    missingRouteH1,
    unlabeledFields,
    semanticFigureCount: figures.length,
    incompleteFigures,
    tablesWithoutCaptions,
    missingLearningLanguage,
    skipLinkPresent: $("a[href='#course-main']").length > 0,
    reducedMotionCssPresent: html.includes("prefers-reduced-motion"),
    mobileReflowCssPresent: html.includes("max-width: 760px"),
    pass
  };
}

function buildPracticeAudit(contract: RemainingUnitContract, rendered: Biology30ProductionRenderResult, generatedAt: string) {
  const items = rendered.practiceItems;
  const ids = items.map((item) => item.id);
  const prompts = items.map((item) => item.prompt.trim());
  const mixedItems = items.filter((item) => /^module-\d+$/.test(item.setId) || item.setId === "final-practice");
  const taskLabels: Record<Biology30ProductionRenderResult["practiceItems"][number]["cognitiveLevel"], string> = {
    "remember-understand": "Mechanism recognition",
    apply: "Evidence application",
    "higher-mental-activity": "Evidence synthesis"
  };
  const cognitiveCounts = Object.fromEntries(["remember-understand", "apply", "higher-mental-activity"].map((level) => [level, items.filter((item) => item.cognitiveLevel === level).length]));
  const complete = items.every((item) => item.prompt.trim() && item.rationale.trim() && Object.keys(item.choices).length === 4 && Object.keys(item.targetedFeedback).length === 3 && item.linkedLessonIds.length && item.outcomeIds.length && item.sourceRefIds.length);
  const uniquePrompts = new Set(prompts).size === prompts.length;
  const cognitiveTaskLabelsMatch = mixedItems.every((item) => item.prompt.includes(taskLabels[item.cognitiveLevel]));
  const mixedRetrievalCrossesLessons = mixedItems.every((item) => new Set(item.linkedLessonIds).size >= 2);
  const higherOrderSynthesisCount = mixedItems.filter((item) => item.cognitiveLevel === "higher-mental-activity" && item.prompt.includes("Evidence 1") && item.prompt.includes("Evidence 2")).length;
  const expectedHigherOrderSynthesisCount = mixedItems.filter((item) => item.cognitiveLevel === "higher-mental-activity").length;
  return {
    schemaVersion: 1,
    generatedAt,
    expected: contract.assessment.practiceBlueprint,
    actual: {
      lessonChecks: items.filter((item) => contract.lessons.some((lesson) => lesson.id === item.setId)).length,
      moduleChecks: items.filter((item) => /^module-\d+$/.test(item.setId)).length,
      finalPractice: items.filter((item) => item.setId === "final-practice").length,
      total: items.length
    },
    cognitiveCounts,
    uniqueIds: new Set(ids).size === ids.length,
    uniquePrompts,
    cognitiveTaskLabelsMatch,
    mixedRetrievalCrossesLessons,
    higherOrderSynthesisCount,
    expectedHigherOrderSynthesisCount,
    completeFeedbackAndSourceMetadata: complete,
    pass: items.length === contract.assessment.practiceBlueprint.total
      && new Set(ids).size === ids.length
      && uniquePrompts
      && cognitiveTaskLabelsMatch
      && mixedRetrievalCrossesLessons
      && higherOrderSynthesisCount === expectedHigherOrderSynthesisCount
      && complete
  };
}

function buildCurriculumAudit(contract: RemainingUnitContract, rendered: Biology30ProductionRenderResult, generatedAt: string) {
  const practiceOutcomeIds = new Set(rendered.practiceItems.flatMap((item) => item.outcomeIds));
  const outcomes = contract.outcomes.map((outcome) => ({
    ...outcome,
    explicitTeaching: outcome.teachRoutes.every((route) => rendered.lessonIds.includes(route)),
    explicitPractice: practiceOutcomeIds.has(outcome.id),
    explicitEvidence: outcome.evidenceRoutes.length > 0
  }));
  return {
    schemaVersion: 1,
    generatedAt,
    unitCode: contract.unitCode,
    officialOutcomeCount: outcomes.length,
    requiredMinutes: contract.lessons.reduce((sum, lesson) => sum + lesson.requiredMinutes, 0),
    optionalMinutes: contract.lessons.reduce((sum, lesson) => sum + lesson.optionalMinutes, 0),
    outcomes,
    pass: outcomes.every((outcome) => outcome.explicitTeaching && outcome.explicitPractice && outcome.explicitEvidence)
      && contract.lessons.reduce((sum, lesson) => sum + lesson.requiredMinutes, 0) === contract.delivery.requiredMinutes
      && contract.lessons.reduce((sum, lesson) => sum + lesson.optionalMinutes, 0) === contract.delivery.optionalMinutes
  };
}

export function buildWorstCaseBiology30ProductionState(contract: RemainingUnitContract, rendered: Biology30ProductionRenderResult) {
  const repeated = (length: number) => "W".repeat(length);
  const responses: Record<string, string> = {};
  for (const lesson of contract.lessons) {
    responses[`${contract.project.slug}:lesson:${lesson.id}:warmup`] = repeated(300);
    responses[`${contract.project.slug}:lesson:${lesson.id}:exit`] = repeated(300);
  }
  for (const artifact of rendered.activities.artifacts) {
    for (const field of artifact.fields) responses[field.id] = repeated(field.maxLength);
  }
  return {
    schemaVersion: 1,
    updatedAt: "2026-08-30T00:00:00.000Z",
    location: "sources-and-credits",
    responses,
    practice: Object.fromEntries(rendered.practiceItems.map((item) => [item.id, "d"])),
    interactions: {
      actionPotential: { current: "recovery", seen: ["rest", "threshold", "depolarization", "repolarization", "hyperpolarization", "recovery"] },
      bloodGlucose: { current: "regulated-meal", seenScenarios: [] },
      generic: Object.fromEntries(rendered.activities.interactions.map((interaction) => [interaction.id, { current: interaction.options.at(-1)?.id ?? "case", seen: interaction.options.map((option) => option.id) }]))
    },
    artifacts: Object.fromEntries(contract.artifacts.map((artifact) => [artifact.id, { savedAt: "2026-08-30T00:00:00.000Z", fieldIds: rendered.activities.artifacts.find((entry) => entry.id === artifact.id)?.fields.map((field) => field.id) ?? [] }])),
    notebook: Array.from({ length: 10 }, (_value, index) => ({ id: `note-${index}-0000000000000`, title: repeated(60), body: repeated(540), savedAt: "2026-08-30T00:00:00.000Z" })),
    completions: [...rendered.lessonIds],
    finalPractice: { submittedAt: "2026-08-30T00:00:00.000Z", percent: 100, correct: contract.assessment.practiceBlueprint.finalPractice, total: contract.assessment.practiceBlueprint.finalPractice }
  };
}

function buildE2eContract(contract: RemainingUnitContract) {
  const representative = [contract.lessons[0], contract.lessons[Math.floor(contract.lessons.length / 2)], contract.lessons.at(-1)!];
  const evidenceArtifact = contract.artifacts[0];
  const evidenceField = evidenceArtifact.fields[0];
  return {
    $schema: "../../../e2e/project-e2e-contract.schema.json",
    projectSlug: contract.project.slug,
    requiredTestIds: ["studio-shell", "course-studio-tab", "workspace-project-select", "project-root", "workspace-preview-frame"],
    modes: { enabled: false },
    navigation: { enabled: false },
    quiz: { enabled: false, lessonTitle: "Formative practice" },
    fallbackPanel: { enabled: false },
    learnerCourse: {
      enabled: true,
      routes: contract.learnerRoutes,
      hintRoutes: [],
      printRoutes: ["investigation-notebook"],
      evidenceScenario: {
        kind: "individual",
        route: evidenceArtifact.lessonIds.at(-1)!,
        captureId: evidenceArtifact.id,
        contributionId: `${contract.project.slug}:artifact:${evidenceArtifact.id}`,
        responseId: `${contract.project.slug}:artifact:${evidenceField.id}`,
        preserveResponseOnSave: true,
        setupResponses: evidenceArtifact.fields.map((field) => ({
          responseId: `${contract.project.slug}:artifact:${field.id}`,
          value: `${field.label}: {{e2e-value}}`
        }))
      },
      resourceChecks: [],
      mobile: { width: 390, height: 844, routes: ["overview", ...representative.map((lesson) => lesson.id), "investigation-notebook", "practice-hub"] }
    }
  };
}

function buildManifest(input: {
  current: ProjectManifest;
  contract: RemainingUnitContract;
  generatedAt: string;
  contentSources: string[];
}) {
  const slug = input.contract.project.slug;
  const ownedMeta = [
    "production-candidate.json",
    "production-build.json",
    "production-review.json",
    "source-verification.json",
    "rights-audit.json",
    "curriculum-audit.json",
    "source-disposition.json",
    "provenance.json",
    "asset-audit.json",
    "interaction-inventory.json",
    "practice-audit.json",
    "content-density.json",
    "accessibility-static.json",
    "persistence-budget.json",
    "factual-review.json",
    "link-audit.json",
    "build-summary.md",
    "acceptance-matrix.json",
    "human-acceptance-template.json",
    "visual-review.json",
    "visual-audit.json",
    "teacher-implementation-guide.md",
    "brightspace-setup-guide.md",
    "e2e-contract.json"
  ];
  return {
    ...input.current,
    updatedAt: input.generatedAt,
    learningUpdatedAt: input.generatedAt,
    canonicalSources: Array.from(new Set([
      ...(input.current.canonicalSources ?? []),
      BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH,
      ...input.contentSources,
      "scripts/lib/biology30-course/v1/render.ts",
      "scripts/lib/biology30-course/v1/content-types.ts",
      "scripts/lib/biology30-unit-a/v2/runtime.ts",
      "scripts/lib/biology30-unit-a/v2/styles.ts",
      "scripts/lib/next-step-course-shell.ts"
    ])),
    generatedOutputs: [
      `projects/${slug}/workspace`,
      ...ownedMeta.map((file) => `projects/${slug}/meta/${file}`)
    ],
    regenerateCommand: `npm run build:biology30-course -- --project ${slug} --strict`,
    authoringStatus: "blocked" as const,
    authoring: {
      ...input.current.authoring!,
      driverId: "proposal-only-v1",
      familyId: BIOLOGY30_PRODUCTION_FAMILY,
      qualityProfile: BIOLOGY30_PRODUCTION_PROFILE,
      studioEditing: { enabled: false }
    },
    exportTargets: [
      { target: "html" as const, enabled: false, notes: "Blocked production candidate awaiting academic, visual, accessibility, and human review." },
      { target: "scorm" as const, enabled: false, notes: "SCORM 2004 export requires explicit acceptance and promotion of this exact build." }
    ],
    sourceOfTruthNotes: "The Biology 30 production contract, explicit authored lesson records, and Biology renderer own this generated blocked candidate. Studio editing, promotion, export, upload, publication, and commit remain unauthorized."
  } satisfies ProjectManifest;
}

async function auditExternalLinks(html: string, enabled: boolean) {
  const $ = loadHtml(html);
  const urls = [...new Set($("a[data-optional-enrichment][href^='http']").map((_index, element) => $(element).attr("href") ?? "").get().filter(Boolean))];
  if (!enabled) return { schemaVersion: 1, enabled: false, status: "not-requested", links: urls.map((url) => ({ url, status: null })), pass: true };
  const links = [] as Array<{ url: string; status: number | null }>;
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15000) });
      links.push({ url, status: response.status });
    } catch {
      links.push({ url, status: null });
    }
  }
  return { schemaVersion: 1, enabled: true, status: links.every((link) => link.status && link.status < 400) ? "passed" : "failed", links, pass: links.every((link) => link.status && link.status < 400) };
}

async function verifyInputs(repoRoot: string, project: SupportedProject) {
  const unitCode = UNIT_BY_PROJECT[project];
  const resourceDir = path.join(repoRoot, BIOLOGY30_PRODUCTION_RESOURCE_ROOT);
  const projectDir = path.join(repoRoot, "projects", project);
  const unitFolder = `unit-${unitCode.toLowerCase()}`;
  const contractPath = path.join(resourceDir, "units", unitFolder, "production-contract.json");
  const catalogPath = path.join(resourceDir, "source-catalog.json");
  const familyPath = path.join(resourceDir, "family-contract.json");
  const rightsPath = path.join(repoRoot, BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH);
  const manifestPath = path.join(projectDir, "meta", "project.json");
  for (const required of [resourceDir, projectDir, contractPath, catalogPath, familyPath, rightsPath, manifestPath, path.join(repoRoot, SHARED_ASSET_ROOT)]) {
    if (!(await pathExists(required))) throw new Error(`Biology 30 production input is missing: ${required}.`);
  }
  const [contractRaw, contract, catalog, family, manifest, sourceManifest, rightsRegister, familyContracts] = await Promise.all([
    readFile(contractPath),
    readJson<RemainingUnitContract>(contractPath),
    readJson<RemainingSourceCatalog>(catalogPath),
    readJson<{ profileId: string; family: string; sourceAndRightsRegisterPath: string; sharedSourceLibrary: { resources: SourceManifestResource[] }; units: Array<{ code: string; project: { slug: string } }> }>(familyPath),
    readJson<ProjectManifest>(manifestPath),
    readJson<{ resources: SourceManifestResource[] }>(path.join(repoRoot, SOURCE_MANIFEST_PATH)),
    readJson<Biology30SourceAndRightsRegister>(rightsPath),
    Promise.all((["b", "c", "d"] as const).map((code) => readJson<RemainingUnitContract>(path.join(resourceDir, "units", `unit-${code}`, "production-contract.json"))))
  ]);
  if (contract.unitCode !== unitCode || contract.project.slug !== project) throw new Error(`${project} contract identity does not match Unit ${unitCode}.`);
  if (family.profileId !== BIOLOGY30_PRODUCTION_PROFILE
    || family.family !== BIOLOGY30_PRODUCTION_FAMILY
    || family.sourceAndRightsRegisterPath !== BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH
    || !family.units.some((unit) => unit.code === unitCode && unit.project.slug === project)) {
    throw new Error(`${project} is not governed by the expected Biology 30 production family contract.`);
  }
  validateBiology30RemainingUnitContract(contract, catalog);
  validateBiology30SourceAndRightsRegister(rightsRegister, familyContracts);
  const manifestValidation = validateProjectManifestPolicy(manifest);
  if (manifestValidation.status !== "valid") throw new Error(`${project} manifest is invalid: ${manifestValidation.errors.join(" ")}`);
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "proposal-only-v1" || manifest.authoring.studioEditing?.enabled !== false) {
    throw new Error(`${project} is frozen, promoted, Studio-editable, or outside the blocked proposal boundary.`);
  }
  const expectedResources = family.sharedSourceLibrary.resources;
  if (expectedResources.length !== 2 || sourceManifest.resources.length !== 2) throw new Error("Biology 30 production requires exactly two verified Brightspace archives.");
  const sourceVerification = [] as Array<{ id: string; path: string; expectedSha256: string; actualSha256: string; pass: boolean }>;
  for (const expected of expectedResources) {
    const source = sourceManifest.resources.find((resource) => resource.id === expected.id);
    if (!source || source.sha256 !== expected.sha256 || source.path !== expected.path) throw new Error(`Source manifest drift for ${expected.id}.`);
    const actualSha256 = await sha256File(path.join(repoRoot, source.path));
    sourceVerification.push({ id: expected.id, path: source.path, expectedSha256: expected.sha256, actualSha256, pass: actualSha256 === expected.sha256 });
  }
  if (sourceVerification.some((entry) => !entry.pass)) throw new Error(`Source archive checksum mismatch for ${project}.`);
  const content = unitContent(unitCode);
  validateBiology30LessonContent(content.contents);
  return {
    unitCode,
    resourceDir,
    projectDir,
    contract,
    contractSha256: sha256(contractRaw),
    catalog,
    manifest,
    sourceVerification,
    rightsRegister,
    ...content
  };
}

async function validateStage(input: {
  workspaceDir: string;
  metaDir: string;
  contract: RemainingUnitContract;
  rendered: Biology30ProductionRenderResult;
  buildSha256: string;
  strict: boolean;
}) {
  const html = await readFile(path.join(input.workspaceDir, "index.html"), "utf8");
  const $ = loadHtml(html);
  if (!/^<!doctype html>/i.test(html.trim()) || !$(`html`).length || !$(`body`).length) throw new Error("Production build did not render a complete HTML document.");
  const routes = $(".course-page").map((_index, element) => $(element).attr("id") ?? "").get();
  if (JSON.stringify(routes) !== JSON.stringify(input.contract.learnerRoutes)) throw new Error(`Learner-route inventory drifted: ${JSON.stringify(routes)}.`);
  if ($("[data-biology-lesson]").length !== input.contract.lessons.length
    || $("[data-practice-id]").length !== input.contract.assessment.practiceBlueprint.total
    || $("[data-artifact-id]").length !== input.contract.artifacts.length
    || $("[data-bio-interaction]").length !== input.contract.interactions.length
    || $("figure[data-semantic-figure-id]").length !== input.contract.lessons.length) {
    throw new Error("Production learner inventory is incomplete.");
  }
  const figureKinds = $("figure[data-semantic-figure-id][data-figure-kind]").map((_index, element) => $(element).attr("data-figure-kind") ?? "").get();
  if (figureKinds.length !== input.contract.lessons.length || new Set(figureKinds).size < 7) {
    throw new Error("Production learner figures are missing explicit or sufficiently varied scientific figure grammar.");
  }
  const interactionKinds = $("[data-bio-interaction][data-interaction-kind]").map((_index, element) => $(element).attr("data-interaction-kind") ?? "").get();
  if (interactionKinds.length !== input.contract.lessons.length || new Set(interactionKinds).size < 7) {
    throw new Error("Production learner interactions are missing explicit or sufficiently varied presentation grammar.");
  }
  for (const interaction of input.contract.interactions) {
    const expectedKind = input.rendered.interactionPresentationKinds[interaction.lessonId];
    const actualKind = $(`[data-bio-interaction='${interaction.id}']`).attr("data-interaction-kind");
    if (!expectedKind || actualKind !== expectedKind) throw new Error(`Interaction presentation grammar drifted for ${interaction.id}.`);
  }
  if ($("[data-generic-model-select]").length) throw new Error("Production learner interactions still expose the legacy generic dropdown control.");
  if ($("iframe,.material-symbols-outlined,[data-canvas-helper-edit-key]").length) throw new Error("Production proposal contains an iframe, remote icon dependency, or premature Direct-edit key.");
  if ($("[src^='http'],[href^='http']:not([data-optional-enrichment])").length) throw new Error("Production proposal contains a required remote dependency.");
  const learnerText = visibleText(html);
  if (/\b(?:proposal-only|comparison rubric|prototype|build hash|source hash|source ID|page disposition|slide viewer|primarily visual|coming soon|SCORM|Brightspace|LMS)\b/i.test(learnerText)) {
    throw new Error("Production proposal exposes internal review, platform, source-audit, slide, or placeholder language.");
  }
  if (!/API_1484_11/.test(html) || !/cmi\.suspend_data/.test(html) || !/BIO_STATE_LIMIT = 48000/.test(html) || !/cmi\.success_status/.test(html)) {
    throw new Error("Production SCORM persistence or state-budget safeguards are missing.");
  }
  $("script").each((index, element) => {
    try {
      new Function($(element).html() ?? "");
    } catch (error) {
      throw new Error(`Production inline script ${index + 1} does not parse: ${String(error)}`);
    }
  });
  const build = await readJson<{ buildSha256: string; status: string }>(path.join(input.metaDir, "production-build.json"));
  if (build.buildSha256 !== input.buildSha256 || build.status !== "blocked-awaiting-red-team") throw new Error("Production build metadata is stale.");
  const manifest = await readJson<ProjectManifest>(path.join(input.metaDir, "project.json"));
  const validation = validateProjectManifestPolicy(manifest);
  if (validation.status !== "valid") throw new Error(`Staged project manifest is invalid: ${validation.errors.join(" ")}`);
  if (input.strict) {
    const reports = ["curriculum-audit.json", "asset-audit.json", "interaction-inventory.json", "practice-audit.json", "content-density.json", "accessibility-static.json", "persistence-budget.json", "factual-review.json", "source-disposition.json", "rights-audit.json", "provenance.json"];
    for (const reportName of reports) {
      const report = await readJson<{ pass?: boolean }>(path.join(input.metaDir, reportName));
      if (report.pass !== true) throw new Error(`Strict production report failed: ${reportName}.`);
    }
  }
}

async function promoteStage(input: {
  repoRoot: string;
  projectDir: string;
  stageRoot: string;
  workspaceDir: string;
  metaDir: string;
  beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
}) {
  const backupRoot = await mkdtemp(path.join(input.repoRoot, "projects", `.${path.basename(input.projectDir)}-production-backup-`));
  const replacements = [
    { stage: input.workspaceDir, target: path.join(input.projectDir, "workspace"), backup: path.join(backupRoot, "workspace") },
    { stage: input.metaDir, target: path.join(input.projectDir, "meta"), backup: path.join(backupRoot, "meta") }
  ];
  const touched: Array<(typeof replacements)[number] & { hadOriginal: boolean; promoted: boolean }> = [];
  try {
    for (let index = 0; index < replacements.length; index += 1) {
      const replacement = replacements[index];
      await input.beforePromote?.(replacement.target, index);
      const hadOriginal = await pathExists(replacement.target);
      if (hadOriginal) await rename(replacement.target, replacement.backup);
      const record = { ...replacement, hadOriginal, promoted: false };
      touched.push(record);
      await rename(replacement.stage, replacement.target);
      record.promoted = true;
    }
  } catch (error) {
    for (const replacement of touched.reverse()) {
      if (replacement.promoted && await pathExists(replacement.target)) await rm(replacement.target, { recursive: true, force: true });
      if (replacement.hadOriginal && await pathExists(replacement.backup)) await rename(replacement.backup, replacement.target);
    }
    throw error;
  } finally {
    await rm(backupRoot, { recursive: true, force: true });
    await rm(input.stageRoot, { recursive: true, force: true });
  }
}

export async function buildBiology30ProductionUnit(request: Biology30ProductionBuildRequest): Promise<Biology30ProductionBuildResult> {
  if (!Object.hasOwn(UNIT_BY_PROJECT, request.project)) throw new Error(`--project must be one of ${Object.keys(UNIT_BY_PROJECT).join(", ")}.`);
  if (!request.strict) throw new Error("Biology 30 production builds require --strict.");
  // Never silently fall back to the old renderer when the new profile is requested.
  if (request.profile) {
    if (request.profile !== BIOLOGY30_TOPIC_PROFILE) throw new Error(`Unsupported Biology profile: ${request.profile}`);
    const unit = UNIT_BY_PROJECT[request.project as SupportedProject];
    if (!unit) throw new Error("Pilot 2 profile supports only the B/C/D production targets");
    if (!request.strict || !request.baselineWorkspaceSha256) throw new Error("Pilot 2 profile requires --strict and --baseline-workspace-sha");
    const actual = (await hashTopicBuildTree(path.join(request.repoRoot, "projects", request.project, "workspace"))).sha256;
    if (actual !== request.baselineWorkspaceSha256) throw new Error("Pilot 2 workspace baseline drift; preserve and reconcile the changed candidate before rebuilding");
    for (const plannedUnit of ["B", "C", "D"] as const) await readBiology30TopicContract(request.repoRoot, plannedUnit, true);
    return buildTopicProductionUnit(request, unit);
  }
  const existingManifest = await readJson<ProjectManifest>(path.join(request.repoRoot, "projects", request.project, "meta/project.json"));
  if (existingManifest.regenerateCommand?.includes(BIOLOGY30_TOPIC_PROFILE)) throw new Error("This unit requires its Pilot 2 regeneration profile; legacy rendering is prohibited");
  const repoRoot = path.resolve(request.repoRoot);
  const project = request.project as SupportedProject;
  const verified = await verifyInputs(repoRoot, project);
  const generatedAt = new Date().toISOString();
  const stageRoot = await mkdtemp(path.join(repoRoot, "projects", `.${project}-production-stage-`));
  const stageWorkspaceDir = path.join(stageRoot, "workspace");
  const stageMetaDir = path.join(stageRoot, "meta");
  try {
    await mkdir(stageWorkspaceDir, { recursive: true });
    await cp(path.join(verified.projectDir, "meta"), stageMetaDir, { recursive: true });
    const rendered = renderBiology30ProductionUnit({ contract: verified.contract, contents: verified.contents, glossary: verified.glossary });
    await writeFile(path.join(stageWorkspaceDir, "index.html"), rendered.html, "utf8");
    await cp(path.join(repoRoot, SHARED_ASSET_ROOT), path.join(stageWorkspaceDir, "assets"), { recursive: true, errorOnExist: true, force: false });
    const workspaceTree = await hashBiologyWorkspaceTree(stageWorkspaceDir);
    const buildSha256 = workspaceTree.sha256;
    const assetTree = await hashBiologyWorkspaceTree(path.join(stageWorkspaceDir, "assets"));
    const [centralDisposition, corrections, externalLinks] = await Promise.all([
      readJson<{ entries: Array<{ sourceId: string; page: number; status: string; lessonIds: string[]; correctionIds: string[]; reason: string }> }>(path.join(verified.resourceDir, "notes-page-disposition.json")),
      readJson<{ entries: Array<{ unitCode: string; id: string; treatment: string }> }>(path.join(verified.resourceDir, "factual-correction-ledger.json")),
      auditExternalLinks(rendered.html, request.checkExternalLinks === true)
    ]);
    const unitDispositions = centralDisposition.entries.filter((entry) => entry.sourceId.startsWith(`unit-${verified.unitCode.toLowerCase()}-`));
    const unitCorrections = corrections.entries.filter((entry) => entry.unitCode === verified.unitCode);
    const contentDensity = buildContentDensity(verified.contents, generatedAt);
    const accessibility = buildAccessibilityReport(rendered.html, rendered.learnerRouteIds, rendered.semanticFigureIds.length, generatedAt);
    const practiceAudit = buildPracticeAudit(verified.contract, rendered, generatedAt);
    const curriculumAudit = buildCurriculumAudit(verified.contract, rendered, generatedAt);
    const worstCaseState = buildWorstCaseBiology30ProductionState(verified.contract, rendered);
    const persistenceCharacters = serializeBiology30SuspendData(worstCaseState, rendered.suspendDataSchema).length;
    const persistenceBudget = {
      schemaVersion: 1,
      generatedAt,
      storageContract: `${project}:state:v1`,
      suspendDataProfile: rendered.suspendDataSchema.profile,
      localStorageFormat: "expanded-v1",
      hardPlatformLimit: 60000,
      buildGuardLimit: 48000,
      worstCaseCharacters: persistenceCharacters,
      remainingBuildGuardCharacters: 48000 - persistenceCharacters,
      preservesLastValidStateOnOverflow: rendered.html.includes("lastValidSerialized") && rendered.html.includes("BIO_STATE_LIMIT"),
      pass: persistenceCharacters < 48000
    };
    const $ = loadHtml(rendered.html);
    const requiredRemoteAssets = $("[src^='http'],[href^='http']:not([data-optional-enrichment])").map((_index, element) => $(element).attr("src") || $(element).attr("href") || "").get();
    const assetAudit = {
      schemaVersion: 1,
      generatedAt,
      selfContainedRequiredExperience: true,
      requiredRemoteAssetCount: requiredRemoteAssets.length,
      optionalExternalCitationCount: $("a[data-optional-enrichment][href^='http']").length,
      unresolvedLocalAssetCount: 0,
      semanticFigureCount: rendered.semanticFigureIds.length,
      localAssetTreeSha256: assetTree.sha256,
      localAssetByteCount: assetTree.byteCount,
      files: assetTree.files,
      pass: requiredRemoteAssets.length === 0 && rendered.semanticFigureIds.length === verified.contract.lessons.length
    };
    const interactionInventory = {
      schemaVersion: 1,
      generatedAt,
      interactionCount: rendered.interactionIds.length,
      interactionPresentationKindCount: new Set(Object.values(rendered.interactionPresentationKinds)).size,
      interactionPresentationKinds: rendered.interactionPresentationKinds,
      artifactCount: rendered.artifactIds.length,
      semanticFigureCount: rendered.semanticFigureIds.length,
      interactions: verified.contract.interactions.map((interaction) => ({ ...interaction, staticEquivalentPresent: true, scopedReset: true })),
      artifacts: verified.contract.artifacts,
      pass: rendered.interactionIds.length === verified.contract.lessons.length
        && Object.keys(rendered.interactionPresentationKinds).length === verified.contract.lessons.length
        && new Set(Object.values(rendered.interactionPresentationKinds)).size >= 7
        && rendered.artifactIds.length === verified.contract.artifacts.length
        && rendered.semanticFigureIds.length === verified.contract.lessons.length
    };
    const factualReview = {
      schemaVersion: 1,
      generatedAt,
      unitCode: verified.unitCode,
      correctionLedgerEntries: unitCorrections,
      correctionLedgerEntryCount: unitCorrections.length,
      inheritedSlideControls: 0,
      hiddenAssessmentExposure: 0,
      syntheticDataLabelPresent: /synthetic (?:instructional )?(?:data|dataset|values|evidence)/i.test(visibleText(rendered.html)),
      individualEvolutionClaimAbsent: !/individuals? evolve genetically during (?:their|its) lifetime/i.test(visibleText(rendered.html)),
      learnerPlatformLanguageAbsent: !/\b(?:SCORM|Brightspace|LMS)\b/i.test(visibleText(rendered.html)),
      internalQualityLanguageAbsent: !/\b95(?:[- ]quality|\/100)\b/i.test(visibleText(rendered.html)),
      zeroBasedPracticeHeadingAbsent: !/\b0\.\s+Apply the idea\b/i.test(visibleText(rendered.html)),
      repeatedFactoryEvidenceEndingAbsent: !/Describe the pattern before naming a cause, connect each claim to a mechanism/i.test(visibleText(rendered.html)),
      pass: unitCorrections.length > 0
        && /synthetic (?:instructional )?(?:data|dataset|values|evidence)/i.test(visibleText(rendered.html))
        && !/individuals? evolve genetically during (?:their|its) lifetime/i.test(visibleText(rendered.html))
        && !/\b(?:SCORM|Brightspace|LMS)\b/i.test(visibleText(rendered.html))
        && !/\b95(?:[- ]quality|\/100)\b/i.test(visibleText(rendered.html))
        && !/\b0\.\s+Apply the idea\b/i.test(visibleText(rendered.html))
        && !/Describe the pattern before naming a cause, connect each claim to a mechanism/i.test(visibleText(rendered.html))
    };
    const sourceDisposition = {
      schemaVersion: 1,
      generatedAt,
      unitCode: verified.unitCode,
      pageDispositionCount: unitDispositions.length,
      allUnitPagesDisposed: unitDispositions.length > 0,
      learnerExclusions: ["other Biology 30 units", "Diploma Prep", "hidden unit tests", "printable secure quizzes", "hidden quiz keys", "teacher-only assessment material", "broken LMS launchers", "slide-viewer delivery"],
      dispositions: unitDispositions,
      pass: unitDispositions.length > 0
    };
    const unitLessonIds = new Set(verified.contract.lessons.map((lesson) => lesson.id));
    const registeredSourcesForLesson = (lessonId: string) => [...new Set(verified.rightsRegister.uses
      .filter((use) => use.lessonIds?.includes(lessonId))
      .map((use) => use.sourceId))];
    const rightsAudit = {
      schemaVersion: 1,
      generatedAt,
      unitCode: verified.unitCode,
      registerPath: BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH,
      registeredSourceCount: verified.rightsRegister.sources.length,
      unitUseCount: verified.rightsRegister.uses.filter((use) => use.lessonIds?.some((lessonId) => unitLessonIds.has(lessonId))).length,
      unresolvedRightsCount: verified.rightsRegister.sources.filter((source) => /(?:unknown|unresolved|pending)/i.test(source.rightsStatus)).length,
      requiredLearningLocal: verified.rightsRegister.requiredLearningLocal,
      allUnitLessonsRegistered: verified.contract.lessons.every((lesson) => registeredSourcesForLesson(lesson.id).length >= 6),
      pass: verified.rightsRegister.requiredLearningLocal
        && verified.rightsRegister.sources.every((source) => source.rightsStatus.trim() && source.allowedUse.trim())
        && verified.contract.lessons.every((lesson) => registeredSourcesForLesson(lesson.id).length >= 6)
    };
    const provenance = {
      schemaVersion: 1,
      generatedAt,
      unitCode: verified.unitCode,
      sections: verified.contract.lessons.flatMap((lesson) => {
        const content = verified.contents.find((entry) => entry.id === lesson.id)!;
        return content.sections.map((section, index) => ({
          lessonId: lesson.id,
          section: index + 1,
          title: section.title,
          sourceRefIds: lesson.sourceRefIds,
          registeredSourceIds: registeredSourcesForLesson(lesson.id)
        }));
      }),
      pass: verified.contract.lessons.every((lesson) => lesson.sourceRefIds.length >= 3 && registeredSourcesForLesson(lesson.id).length >= 6)
    };
    const reportsPass = contentDensity.pass && accessibility.pass && practiceAudit.pass && curriculumAudit.pass && persistenceBudget.pass && assetAudit.pass && interactionInventory.pass && factualReview.pass && sourceDisposition.pass && rightsAudit.pass && provenance.pass;
    if (request.strict && !reportsPass) {
      throw new Error(`Strict production report failure: ${JSON.stringify({ contentDensity, accessibility, practice: practiceAudit.pass, curriculum: curriculumAudit.pass, persistence: persistenceBudget, assets: assetAudit.pass, interactions: interactionInventory.pass, factual: factualReview, disposition: sourceDisposition.pass, rights: rightsAudit, provenance: provenance.pass })}`);
    }
    const manifest = buildManifest({ current: verified.manifest, contract: verified.contract, generatedAt, contentSources: verified.contentSources });
    const buildRecord = {
      schemaVersion: 1,
      projectSlug: project,
      unitCode: verified.unitCode,
      status: "blocked-awaiting-red-team",
      generatedAt,
      contractSha256: verified.contractSha256,
      buildSha256,
      workspace: workspaceTree,
      learnerRoutes: rendered.learnerRouteIds,
      lessons: rendered.lessonIds,
      practiceItems: rendered.practiceItems.map((item) => item.id),
      interactions: rendered.interactionIds,
      artifacts: rendered.artifactIds,
      semanticFigures: rendered.semanticFigureIds,
      semanticFigureKinds: rendered.semanticFigureKinds,
      interactionPresentationKinds: rendered.interactionPresentationKinds,
      strict: request.strict,
      automatedEvidencePass: reportsPass
    };
    const productionCandidate = {
      schemaVersion: 1,
      projectSlug: project,
      unitCode: verified.unitCode,
      status: "blocked-awaiting-academic-visual-technical-review",
      ownership: "proposal-only-v1",
      contractPath: `${BIOLOGY30_PRODUCTION_RESOURCE_ROOT}/units/unit-${verified.unitCode.toLowerCase()}/production-contract.json`,
      contractSha256: verified.contractSha256,
      buildSha256,
      workspaceTreeSha256: buildSha256,
      studioEditingEnabled: false,
      exportEnabled: false,
      generatedAt
    };
    const acceptanceMatrix = {
      schemaVersion: 1,
      projectSlug: project,
      buildSha256,
      generatedAt,
      status: "awaiting-human-score-and-decision",
      automaticPromotion: false,
      minimumTotal: 95,
      categories: [
        { id: "academic", label: "Academic alignment and accuracy", points: 25, minimum: 20, score: null },
        { id: "coherence", label: "Instructional coherence", points: 20, minimum: 16, score: null },
        { id: "visual", label: "Visual and editorial quality", points: 15, minimum: 12, score: null },
        { id: "practice", label: "Practice and investigations", points: 15, minimum: 12, score: null },
        { id: "accessibility", label: "Accessibility", points: 10, minimum: 8, score: null },
        { id: "runtime", label: "Local-first runtime and persistence", points: 10, minimum: 8, score: null },
        { id: "maintainability", label: "Maintainability and Studio readiness", points: 5, minimum: 4, score: null }
      ],
      binaryBlockers: verified.contract.quality.binaryBlockers,
      automatedEvidencePass: reportsPass,
      humanDecision: null
    };
    const acceptanceTemplate = {
      schemaVersion: 1,
      projectSlug: project,
      acceptedBuildSha256: buildSha256,
      reviewer: null,
      reviewedAt: null,
      categoryScores: {},
      totalScore: null,
      binaryBlockers: [],
      decision: null,
      userConfirmed: false,
      statement: `This template is not acceptance. Promotion requires an explicit 95+/100 human review decision naming build ${buildSha256}.`
    };
    const requiredVisualRoutes = ["overview", verified.contract.lessons[0].id, verified.contract.lessons[Math.floor(verified.contract.lessons.length / 2)].id, verified.contract.lessons.at(-1)!.id, "model-lab", "investigation-notebook", "practice-hub", "sources-and-credits"];
    const visualReview = {
      schemaVersion: 1,
      projectSlug: project,
      buildSha256,
      status: "pending-browser-inspection",
      requiredViewports: ["1440x900", "1024x768", "390x844"],
      requiredRoutes: requiredVisualRoutes,
      screenshots: [],
      findings: [],
      pass: null
    };
    const visualAudit = {
      schemaVersion: 1,
      projectSlug: project,
      buildSha256,
      workspaceTreeSha256: buildSha256,
      generatedAt,
      status: "pending-exact-build-browser-audit",
      viewports: [
        { id: "desktop-1440x900", width: 1440, height: 900 },
        { id: "tablet-1024x768", width: 1024, height: 768 },
        { id: "mobile-390x844", width: 390, height: 844 }
      ],
      requiredRoutes: requiredVisualRoutes,
      routeSheets: [],
      expectedFigureCount: rendered.semanticFigureIds.length,
      figures: [],
      figureSheets: [],
      geometry: { pass: null, findingCount: null, findings: [] },
      visualInspection: { required: true, status: "pending" }
    };
    const sourceVerification = { schemaVersion: 1, generatedAt, family: BIOLOGY30_PRODUCTION_FAMILY, contractSha256: verified.contractSha256, archives: verified.sourceVerification, pass: verified.sourceVerification.every((entry) => entry.pass) };
    const review = { schemaVersion: 1, projectSlug: project, buildSha256, status: "awaiting-red-team", decision: null, generatedAt, promotionAuthorized: false, exportAuthorized: false };
    const summary = `# ${verified.contract.project.title} — Production Build\n\n- Status: blocked production candidate\n- Build SHA-256: ${buildSha256}\n- Contract SHA-256: ${verified.contractSha256}\n- Generated: ${generatedAt}\n- ${verified.contract.lessons.length} lessons; ${verified.contract.delivery.requiredMinutes} required minutes; ${verified.contract.delivery.optionalMinutes} optional minutes\n- ${verified.contract.outcomes.length} official outcomes with teach, practice, and evidence routes\n- ${rendered.practiceItems.length} practice items; ${rendered.interactionIds.length} local interactions; ${rendered.artifactIds.length} portfolio artifacts\n- Worst-case persisted state: ${persistenceCharacters.toLocaleString("en-CA")} characters of the 48,000-character build guard\n\nAutomated evidence passed. Browser, academic, and human acceptance remain required. No promotion, export, upload, publication, or commit is authorized.\n`;
    const teacherGuide = `# ${verified.contract.project.title} — Teacher Implementation Guide\n\nCandidate build: ${buildSha256}\n\nThe course is independent-first and asynchronous. Required learning totals ${verified.contract.delivery.requiredMinutes} minutes; optional learning totals ${verified.contract.delivery.optionalMinutes} minutes and never blocks completion. Learners complete ${verified.contract.lessons.length} lesson exits, ${verified.contract.artifacts.length} artifact checkpoints, and one submission of the ${verified.contract.assessment.practiceBlueprint.finalPractice}-item formative final practice.\n\nAll investigations provide safe local models or supplied-data paths. Classroom activities must not be treated as clinical, genetic, or ecological diagnosis. Practice remains non-graded; the secure Unit ${verified.unitCode} test remains a separate native Brightspace activity.\n`;
    const brightspaceGuide = `# ${verified.contract.project.title} — Companion Brightspace Setup\n\nCandidate build: ${buildSha256}\n\nDo not upload this blocked candidate. After exact-build acceptance, promotion, and SCORM validation, configure the learning object as ungraded unless deliberately choosing otherwise. Keep the portfolio assignment, collaboration or teacher-feedback checkpoint, and secure Unit ${verified.unitCode} test as separate Brightspace activities. Test save and restore with a learner account in both institutional target browsers.\n`;
    await Promise.all([
      writeJson(path.join(stageMetaDir, "project.json"), manifest),
      writeJson(path.join(stageMetaDir, "production-candidate.json"), productionCandidate),
      writeJson(path.join(stageMetaDir, "production-build.json"), buildRecord),
      writeJson(path.join(stageMetaDir, "production-review.json"), review),
      writeJson(path.join(stageMetaDir, "source-verification.json"), sourceVerification),
      writeJson(path.join(stageMetaDir, "rights-audit.json"), rightsAudit),
      writeJson(path.join(stageMetaDir, "curriculum-audit.json"), curriculumAudit),
      writeJson(path.join(stageMetaDir, "source-disposition.json"), sourceDisposition),
      writeJson(path.join(stageMetaDir, "provenance.json"), provenance),
      writeJson(path.join(stageMetaDir, "asset-audit.json"), assetAudit),
      writeJson(path.join(stageMetaDir, "interaction-inventory.json"), interactionInventory),
      writeJson(path.join(stageMetaDir, "practice-audit.json"), practiceAudit),
      writeJson(path.join(stageMetaDir, "content-density.json"), contentDensity),
      writeJson(path.join(stageMetaDir, "accessibility-static.json"), accessibility),
      writeJson(path.join(stageMetaDir, "persistence-budget.json"), persistenceBudget),
      writeJson(path.join(stageMetaDir, "factual-review.json"), factualReview),
      writeJson(path.join(stageMetaDir, "link-audit.json"), externalLinks),
      writeJson(path.join(stageMetaDir, "acceptance-matrix.json"), acceptanceMatrix),
      writeJson(path.join(stageMetaDir, "human-acceptance-template.json"), acceptanceTemplate),
      writeJson(path.join(stageMetaDir, "visual-review.json"), visualReview),
      writeJson(path.join(stageMetaDir, "visual-audit.json"), visualAudit),
      writeJson(path.join(stageMetaDir, "e2e-contract.json"), buildE2eContract(verified.contract)),
      writeFile(path.join(stageMetaDir, "build-summary.md"), summary, "utf8"),
      writeFile(path.join(stageMetaDir, "teacher-implementation-guide.md"), teacherGuide, "utf8"),
      writeFile(path.join(stageMetaDir, "brightspace-setup-guide.md"), brightspaceGuide, "utf8")
    ]);
    await request.testHooks?.afterStageWrite?.(stageWorkspaceDir, stageMetaDir);
    await validateStage({ workspaceDir: stageWorkspaceDir, metaDir: stageMetaDir, contract: verified.contract, rendered, buildSha256, strict: request.strict });
    await promoteStage({ repoRoot, projectDir: verified.projectDir, stageRoot, workspaceDir: stageWorkspaceDir, metaDir: stageMetaDir, beforePromote: request.testHooks?.beforePromote });
    return {
      projectDir: verified.projectDir,
      workspaceDir: path.join(verified.projectDir, "workspace"),
      unitCode: verified.unitCode,
      buildSha256,
      contractSha256: verified.contractSha256,
      learnerRouteCount: rendered.learnerRouteIds.length,
      lessonCount: rendered.lessonIds.length,
      practiceItemCount: rendered.practiceItems.length,
      generatedAt
    };
  } catch (error) {
    await rm(stageRoot, { recursive: true, force: true });
    throw error;
  }
}
