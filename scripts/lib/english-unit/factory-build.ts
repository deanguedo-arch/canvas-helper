import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";

import {
  STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
  STUDIO_ROUTINE_CONTENT_PROFILE_ID
} from "../../../app/shared/course-editability.js";

import {
  renderEnglishActivityProfile,
  type EnglishActivityProfile,
  type EnglishMaterialHook,
  type EnglishRenderedActivityProfile
} from "./activity-profile-renderers.js";
import {
  buildEla20CrucibleActivityProfile,
  buildEla20FilmStudyActivityProfile,
  buildEla20MacbethActivityProfile,
  buildEla20NovelStudyActivityProfile
} from "./ela20-activity-profiles.js";
import {
  buildEla10FencesActivityProfile,
  buildEla10MerchantActivityProfile
} from "./ela10-activity-profiles.js";
import { writeEnglishLearnerE2EContract } from "./e2e-contract.js";
import { parseFencesScriptScenes } from "./fences-script.js";
import { renderEnglishFactoryUnit } from "./factory-render.js";
import {
  hasV3DonorLessonSelector,
  hydrateEnglishV3DonorData,
  inspectEnglishV3DonorLessonPlans,
  normalizeEnglishV3ResolvedLessons,
  resolveEnglishV3DonorLessons,
  type EnglishDonorLessonPlan
} from "./v3-donor-lessons.js";
import {
  buildCrucibleActQuestionSets,
  buildMacbethActQuestionSets,
  buildMerchantActQuestionSets,
  buildQuestionSetsFromResources,
  prepareEnglishFactoryResources,
  type EnglishPreparedResource
} from "./factory-resources.js";
import { readMacbethSceneComponent } from "./macbeth-scenes.js";
import {
  ensureMerchantFoundationLessons,
  readMerchantFoundationLessons
} from "./merchant-foundation-lessons.js";
import { readMerchantSceneComponent } from "./merchant-scenes.js";
import { parseEnglishCourseManifest, parseEnglishUnitRecipe } from "./schema.js";
import { collectVerifiedVideos, loadBrightspaceLessonsByIds, loadBrightspaceUnit } from "./source.js";
import type {
  EnglishBuildReport,
  EnglishBuildReportItem,
  EnglishBuiltLesson,
  EnglishCourseManifestV1,
  EnglishUnitRecipeV2,
  EnglishUnitRecipeV3,
  EnglishWritingFormKind
} from "./types.js";
import { renderV3ActivityProfile } from "./v3-profile-renderer.js";
import { composeEnglishV3Runtime } from "./v3-runtime-sanitizer.js";
import { transformWritingFoundationsLessons } from "./writing-foundations-lessons.js";
import { ensureStandardEnglishWritingProfile } from "./writing-sequence-renderer.js";
import { runEnglishFactoryOutputTransaction } from "./factory-transaction.js";
import { stageAndPromoteEnglishWorkspace } from "./workspace-staging.js";
import { englishFactoryRepoRelativePath } from "./dependencies.js";
import { applyStoredCourseEdits } from "../course-editing/overrides.js";

const LOGO_RELATIVE_PATH = path.join("docs", "design", "next-step", "assets", "nxt-ce-logo-white-with-ce.png");
const FORBIDDEN_LEARNER_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "soft/hard gate", pattern: /(?:soft|hard)[ _-]*gate/i },
  { label: "answer key", pattern: /answer\s*key|soft gate anwsers/i },
  { label: "ELA 30-1", pattern: /(?:ELA|English)\s*30-1/i },
  { label: "Diploma framing", pattern: /Diploma(?:\s+Exam)?|Part\s+A\s*\(Written\)/i },
  { label: "unrelated Math content", pattern: /factors_and_products|linear_functions|trigonometry/i }
];

type EnglishFactoryRecipe = EnglishUnitRecipeV2 | EnglishUnitRecipeV3;

type EnglishFactorySource = { id: string; path: string; sha256: string };

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

async function fileSha256(filePath: string) {
  return await new Promise<string>((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function fileExists(filePath: string) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function relocateV3GeneratedLessonResources(input: {
  lessons: EnglishBuiltLesson[];
  workspaceDir: string;
  reportItems: EnglishBuildReportItem[];
}) {
  const generatedRoot = path.resolve(input.workspaceDir, "assets", "generated", "supporting");
  await mkdir(generatedRoot, { recursive: true });
  return await Promise.all(input.lessons.map(async (lesson) => {
    let html = lesson.html;
    const supportingResources = await Promise.all(lesson.supportingResources.map(async (resource) => {
      const sourceHref = resource.href.split(/[?#]/, 1)[0] ?? resource.href;
      if (!sourceHref.startsWith("resources/generated/")) return { ...resource };
      const sourcePath = path.resolve(input.workspaceDir, sourceHref);
      const sourceRoot = path.resolve(input.workspaceDir, "resources", "generated");
      if (!sourcePath.startsWith(`${sourceRoot}${path.sep}`) || !(await fileExists(sourcePath))) {
        throw new Error(`Generated lesson resource is missing or unsafe: ${resource.href}`);
      }
      const targetName = `${lesson.id}-${path.basename(sourceHref)}`;
      const targetHref = `assets/generated/supporting/${targetName}`;
      await copyFile(sourcePath, path.join(generatedRoot, targetName));
      html = html.replaceAll(resource.href, targetHref);
      const reportItem = input.reportItems.find((item) => item.destination === `workspace/${sourceHref}`);
      if (reportItem) {
        reportItem.destination = targetHref;
        reportItem.note = `${reportItem.note ?? "Retained as a supporting lesson resource."} Promoted with the canonical V3 workspace.`;
      }
      return { ...resource, href: targetHref };
    }));
    return { ...lesson, html, supportingResources };
  }));
}

async function sourceSha256(sourcePath: string): Promise<string> {
  const sourceStat = await stat(sourcePath);
  if (sourceStat.isFile()) return fileSha256(sourcePath);
  if (!sourceStat.isDirectory()) throw new Error(`English source is neither a file nor a directory: ${sourcePath}`);
  const hash = createHash("sha256");
  async function addDirectory(directory: string) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      const relativePath = path.relative(sourcePath, absolutePath).replaceAll(path.sep, "/");
      if (entry.isDirectory()) {
        hash.update(`directory:${relativePath}\n`);
        await addDirectory(absolutePath);
      } else if (entry.isFile()) {
        hash.update(`file:${relativePath}\n`);
        hash.update(await readFile(absolutePath));
      }
    }
  }
  await addDirectory(sourcePath);
  return hash.digest("hex");
}

function resolveRecipeSource(repoRoot: string, sourcePath: string) {
  return path.isAbsolute(sourcePath) ? sourcePath : path.join(repoRoot, sourcePath);
}

function courseIdFromCode(courseCode: string) {
  const match = courseCode.trim().match(/^ELA\s+(\d+)-(\d+)$/i);
  if (!match) throw new Error(`Cannot resolve an English family manifest from course code ${courseCode}.`);
  return `ela${match[1]}-${match[2]}`.toLowerCase();
}

async function readV3FamilyManifest(repoRoot: string, recipe: EnglishUnitRecipeV3): Promise<{
  path: string;
  manifest: EnglishCourseManifestV1;
}> {
  const manifestPath = path.join(repoRoot, "config", "english", "families", `${courseIdFromCode(recipe.courseCode)}.json`);
  if (!(await fileExists(manifestPath))) throw new Error(`English V3 family manifest is missing: ${manifestPath}`);
  const manifest = parseEnglishCourseManifest(JSON.parse(await readFile(manifestPath, "utf8")));
  if (manifest.courseCode !== recipe.courseCode) {
    throw new Error(`Family manifest ${manifestPath} declares ${manifest.courseCode}, expected ${recipe.courseCode}.`);
  }
  if (!manifest.units.some((unit) => unit.projectSlug === recipe.projectSlug)) {
    throw new Error(`Family manifest ${manifestPath} does not declare unit ${recipe.projectSlug}.`);
  }
  return { path: manifestPath, manifest };
}

async function sourceRecord(repoRoot: string, id: string, sourcePath: string, expectedHash?: string): Promise<EnglishFactorySource> {
  const absolutePath = resolveRecipeSource(repoRoot, sourcePath);
  const actualHash = await sourceSha256(absolutePath);
  if (expectedHash && actualHash !== expectedHash) {
    throw new Error(`English source hash mismatch for ${id}: expected ${expectedHash}, received ${actualHash}.`);
  }
  return {
    id,
    path: path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/"),
    sha256: actualHash
  };
}

function donorPlanReferencePaths(repoRoot: string, plan: EnglishDonorLessonPlan) {
  const paths = [plan.sourcePath];
  if (plan.kind === "recipe-v1" || plan.kind === "recipe-v2" || plan.kind === "recipe-alias-v2") {
    paths.push(plan.recipePath);
  }
  return [...new Set(paths.map((entry) => (
    path.isAbsolute(entry) ? entry : path.resolve(repoRoot, entry)
  )))];
}

const V3_WRITING_ROUTE_IDS: Record<Exclude<EnglishWritingFormKind, "critical-essay">, readonly string[]> = {
  "literary-exploration": [
    "literary-exploration",
    "literary-exploration-prompt-controlling-idea",
    "literary-exploration-introduction-thesis",
    "literary-exploration-body-assigned-text",
    "literary-exploration-body-studied-work",
    "literary-exploration-body-personal-connection",
    "literary-exploration-conclusion-revision",
    "literary-exploration-preview"
  ],
  "personal-response": [
    "personal-response",
    "personal-response-prompt-impression",
    "personal-response-text-evidence",
    "personal-response-knowledge-experience",
    "personal-response-form-perspective",
    "personal-response-response-plan",
    "personal-response-draft-revise",
    "personal-response-preview"
  ],
  "visual-response": [
    "visual-response",
    "visual-response-observe",
    "visual-response-paces",
    "visual-response-central-idea",
    "visual-response-prose-form",
    "visual-response-draft",
    "visual-response-conclusion-revision",
    "visual-response-preview"
  ]
};

function reportSummary(items: EnglishBuildReportItem[]): EnglishBuildReport["summary"] {
  return {
    placed: items.filter((item) => item.status === "placed").length,
    excluded: items.filter((item) => item.status === "excluded").length,
    missing: items.filter((item) => item.status === "missing").length,
    duplicate: items.filter((item) => item.status === "duplicate").length,
    corrected: items.filter((item) => item.status === "corrected").length,
    failed: items.filter((item) => item.status === "failed").length
  };
}

function materialHooks(resources: EnglishPreparedResource[]): EnglishMaterialHook[] {
  return resources
    .filter((resource) => resource.href && !resource.reviewRequired)
    .map((resource) => {
      const kind: EnglishMaterialHook["kind"] = resource.role === "media" || /\.(?:mp4|m4v|webm)(?:[?#].*)?$/i.test(resource.href ?? "")
        ? "video"
        : /\.(?:jpe?g|png|gif|webp|svg)(?:[?#].*)?$/i.test(resource.href ?? "")
          ? "image"
          : "document";
      return {
        id: resource.id,
        title: resource.title,
        kind,
        description: kind === "video"
          ? "Course film."
          : resource.role === "question-set"
            ? "Question or activity sheet."
            : resource.role === "reading"
              ? "Play text."
              : "Unit resource.",
        href: resource.href,
        actionLabel: "Open / Download",
        downloadable: true,
        status: "available" as const
      };
    });
}

async function buildActivityProfile(input: {
  recipe: EnglishUnitRecipeV2;
  workspaceDir: string;
  resources: EnglishPreparedResource[];
}): Promise<EnglishActivityProfile> {
  const materials = materialHooks(input.resources);
  const isEla10 = input.recipe.courseCode === "ELA 10-1";
  const configuration = ensureStandardEnglishWritingProfile(input.recipe.activityProfile);
  switch (configuration.kind) {
    case "modern-drama":
      if (isEla10) {
        const scriptResource = input.resources.find((resource) => resource.id === "fences-script");
        if (!scriptResource?.text) throw new Error("The complete teacher-supplied Fences script could not be extracted for the scene reader.");
        return buildEla10FencesActivityProfile({
          projectSlug: input.recipe.projectSlug,
          materials,
          scriptScenes: parseFencesScriptScenes(scriptResource.text),
          questionSets: buildQuestionSetsFromResources(input.resources, {
            idPrefix: "fences",
            titlePrefix: "Fences Questions",
            hint: "Return to the relevant scene and support the response with a precise action, line, relationship, or dramatic choice."
          }),
          configuration
        });
      }
      return buildEla20CrucibleActivityProfile({
        projectSlug: input.recipe.projectSlug,
        materials,
        actQuestionSets: buildCrucibleActQuestionSets(input.resources),
        configuration
      });
    case "shakespeare-drama": {
      if (isEla10) {
        const scenePath = path.join(input.workspaceDir, "components", "shakespeare-side-by-side", "scenes.json");
        if (!(await fileExists(scenePath))) {
          throw new Error(
            `Merchant of Venice scene component is missing: ${scenePath}. Run npm run intake:english-course before building the unit.`
          );
        }
        return buildEla10MerchantActivityProfile({
          projectSlug: input.recipe.projectSlug,
          materials,
          scenes: await readMerchantSceneComponent(scenePath),
          questionSets: buildMerchantActQuestionSets(input.resources),
          configuration
        });
      }
      const scenePath = path.join(input.workspaceDir, "components", "shakespeare-side-by-side", "scenes.json");
      if (!(await fileExists(scenePath))) {
        throw new Error(
          `Macbeth scene component is missing: ${scenePath}. Run npm run intake:english-course before building the unit.`
        );
      }
      const questionResource = input.resources.find((resource) => resource.id === "macbeth-act-questions");
      if (!questionResource) throw new Error("Macbeth Act Questions were not prepared.");
      return buildEla20MacbethActivityProfile({
        projectSlug: input.recipe.projectSlug,
        materials,
        scenes: await readMacbethSceneComponent(scenePath),
        actQuestionSets: buildMacbethActQuestionSets(questionResource),
        configuration
      });
    }
    case "novel-study":
      return buildEla20NovelStudyActivityProfile({
        projectSlug: input.recipe.projectSlug,
        materials,
        questionSets: isEla10
          ? buildQuestionSetsFromResources(input.resources, {
              idPrefix: "to-kill-a-mockingbird",
              titlePrefix: "To Kill a Mockingbird Questions",
              hint: "Return to the relevant chapter and support the response with a precise event, quotation, character choice, or narrative detail.",
              preserveNumberedItems: true
            }).map((set) => ({ ...set, trackIds: ["to-kill-a-mockingbird"] }))
          : undefined,
        courseCode: input.recipe.courseCode,
        unitTitle: input.recipe.unitTitle,
        configuration
      });
    case "film-study":
      return buildEla20FilmStudyActivityProfile({
        projectSlug: input.recipe.projectSlug,
        materials,
        courseCode: input.recipe.courseCode,
        unitTitle: input.recipe.unitTitle,
        configuration,
        filmTitle: configuration.filmSelection.mode === "selected"
          ? configuration.filmSelection.title
          : undefined
      });
    case "short-fiction":
      throw new Error("The migrated Short Stories golden profile is built through the V1 compatibility path.");
    case "writing-foundations":
      throw new Error("Writing Foundations requires an EnglishUnitRecipeV3 and the V3 activity renderer.");
  }
}

function validateLearnerHtml(html: string, recipe: EnglishFactoryRecipe, renderedRoutes: string[]) {
  const courseSpecificPatterns = recipe.courseCode === "ELA 10-1"
    ? [{ label: "ELA 20-1 donor wording", pattern: /(?:ELA|English)\s*20-1/i }]
    : [];
  const v3DonorPatterns = recipe.schemaVersion === 3
    ? [
        { label: "donor -1 course wording", pattern: /(?:ELA|English)\s*(?:10|20|30)-1/i },
        { label: "Critical Essay residue", pattern: /critical(?:[-_\s]?essay)/i }
      ]
    : [];
  const sharedForbiddenPatterns = recipe.schemaVersion === 3
    ? FORBIDDEN_LEARNER_PATTERNS.filter((entry) => entry.label !== "Diploma framing")
    : FORBIDDEN_LEARNER_PATTERNS;
  const contamination = [...sharedForbiddenPatterns, ...courseSpecificPatterns, ...v3DonorPatterns]
    .filter((item) => item.pattern.test(html))
    .map((item) => item.label);
  if (contamination.length) throw new Error(`Forbidden learner content remains: ${contamination.join(", ")}`);
  const duplicateIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]).filter((id, index, ids) => ids.indexOf(id) !== index);
  if (duplicateIds.length) throw new Error(`Rendered English unit contains duplicate page/element ids: ${[...new Set(duplicateIds)].slice(0, 8).join(", ")}`);
  const missingRenderedRoutes = renderedRoutes.filter((route) => !html.includes(`id="${route}"`));
  if (missingRenderedRoutes.length) throw new Error(`Rendered activity routes are missing: ${missingRenderedRoutes.join(", ")}`);
  const requiredRoutes = recipe.schemaVersion === 3
    ? [...new Set([
        "overview",
        "lessons",
        "evidence-bank",
        ...recipe.acceptance.requiredRoutes
      ])]
    : ["overview", "lessons", "evidence-bank", "resources"];
  for (const route of requiredRoutes) {
    if (!html.includes(`id="${route}"`)) throw new Error(`Required English route is missing: ${route}`);
  }
  if (recipe.schemaVersion === 3) {
    const expectedWritingRoutes = recipe.writingForms.flatMap((form) => {
      if (form.kind === "critical-essay") throw new Error("English -2 output cannot configure Critical Essay.");
      return V3_WRITING_ROUTE_IDS[form.kind];
    });
    const missingWritingRoutes = expectedWritingRoutes.filter((route) => !html.includes(`id="${route}"`));
    if (missingWritingRoutes.length) throw new Error(`Configured V3 writing routes are missing: ${missingWritingRoutes.join(", ")}`);
    const configuredKinds = new Set(recipe.writingForms.map((form) => form.kind));
    const unexpectedWritingRoutes = (Object.keys(V3_WRITING_ROUTE_IDS) as Array<Exclude<EnglishWritingFormKind, "critical-essay">>)
      .filter((kind) => !configuredKinds.has(kind))
      .flatMap((kind) => V3_WRITING_ROUTE_IDS[kind])
      .filter((route) => html.includes(`id="${route}"`));
    if (unexpectedWritingRoutes.length) throw new Error(`Unconfigured V3 writing routes remain: ${unexpectedWritingRoutes.join(", ")}`);
    let previousIndex = -1;
    for (const form of recipe.writingForms) {
      const linkIndex = html.indexOf(`href="#${form.kind}"`);
      if (linkIndex < 0 || linkIndex <= previousIndex) {
        throw new Error(`V3 writing navigation does not preserve configured order at ${form.kind}.`);
      }
      previousIndex = linkIndex;
    }
    if (/data-(?:page-target|response-id|save-response-collection)="[^"]*critical(?:[-_\s]?essay)/i.test(html)) {
      throw new Error("Critical Essay runtime or storage hooks remain in V3 learner output.");
    }
  }
  if (!html.includes("window.nextStepEvidenceBank")) throw new Error("Shared Evidence Bank API is missing from learner output.");
  if (!html.includes("data-response-id") || !html.includes("data-save-response-collection")) {
    throw new Error(`English ${recipe.activityProfile.kind} output is missing autosave or collection-save hooks.`);
  }
}

function renderMappingMarkdown(report: EnglishBuildReport, recipe: EnglishFactoryRecipe) {
  const rows = report.items.map((item) => `| ${item.status} | ${item.role} | ${item.source.replace(/\|/g, "\\|")} | ${(item.destination ?? "-").replace(/\|/g, "\\|")} | ${item.note.replace(/\|/g, "\\|")} |`).join("\n");
  const v3Details = recipe.schemaVersion === 3
    ? `- Derived from: ${recipe.derivesFromProject}\n- Writing forms: ${recipe.writingForms.length ? recipe.writingForms.map((form) => `${form.kind} (${form.trackMode})`).join(", ") : "none"}\n`
    : "";
  return `# ${recipe.courseCode} ${recipe.unitTitle} Mapping\n\n- Profile: ${recipe.activityProfile.kind} (${recipe.profileVersion})\n${v3Details}- Brightspace lessons: ${report.selectedUnit.lessonCount}\n- Status: ${recipe.status}\n- Placed: ${report.summary.placed}\n- Excluded: ${report.summary.excluded}\n- Missing: ${report.summary.missing}\n- Failed: ${report.summary.failed}\n\n| Status | Role | Source | Destination | Note |\n| --- | --- | --- | --- | --- |\n${rows}\n`;
}

async function writeMetadata(input: {
  repoRoot: string;
  projectDir: string;
  metaDir: string;
  recipe: EnglishFactoryRecipe;
  report: EnglishBuildReport;
  buildManifest: unknown;
  brightspacePath: string;
  teacherPath: string;
  additionalReferenceOnly?: string[];
}) {
  await mkdir(input.metaDir, { recursive: true });
  await writeFile(path.join(input.metaDir, "english-unit-build.json"), `${JSON.stringify(input.buildManifest, null, 2)}\n`, "utf8");
  await writeFile(path.join(input.metaDir, "english-unit-mapping.json"), `${JSON.stringify(input.report, null, 2)}\n`, "utf8");
  await writeFile(path.join(input.metaDir, "english-unit-mapping.md"), renderMappingMarkdown(input.report, input.recipe), "utf8");

  const promptPackPath = path.join(input.metaDir, "prompt-pack.md");
  if (!(await fileExists(promptPackPath))) {
    const includedIds = input.recipe.source.lessonSelectors
      .filter((selector) => selector.disposition === "include")
      .map((selector) => selector.itemId)
      .join(", ");
    const excludedIds = input.recipe.source.lessonSelectors
      .filter((selector) => selector.disposition === "exclude")
      .map((selector) => selector.itemId)
      .join(", ");
    await writeFile(
      promptPackPath,
      `# ${input.recipe.courseCode} ${input.recipe.unitTitle} Prompt Pack\n\n- Mode: DEFAULT\n- Workflow: conversion\n- Activity profile: ${input.recipe.activityProfile.kind} (${input.recipe.profileVersion})\n- Exact included Brightspace IDs: ${includedIds}\n- Exact excluded Brightspace IDs: ${excludedIds || "none"}\n- Canonical recipe: projects/${input.recipe.projectSlug}/meta/english-unit.json\n- Canonical learner source: projects/${input.recipe.projectSlug}/workspace/index.html\n- Preserved custom source: projects/${input.recipe.projectSlug}/workspace/components and workspace/assets/custom\n- Rebuild command: npm run build:english-unit -- --project ${input.recipe.projectSlug}\n- Studio editability profile: studio-routine-content-v1\n\n## Authoring boundary\n\nEdit the recipe for source, placement, profile, or wording decisions. Put bespoke activity code or data under the preserved custom paths. The factory owns index.html and assets/generated; do not patch exports. The automatic new-course gate must pass before a newly created active unit is accepted.\n\n## Review blockers\n\n${input.recipe.acceptance.reviewItems.map((item) => `- ${item}`).join("\n")}\n\nFinal SCORM packaging remains blocked until the recipe is ready-for-export and project E2E passes.\n`,
      "utf8"
    );
  }

  const projectPath = path.join(input.metaDir, "project.json");
  let existing: Record<string, unknown> = {};
  try { existing = JSON.parse(await readFile(projectPath, "utf8")); } catch { existing = {}; }
  const toRepoRelative = (value: string, label: string) => (
    englishFactoryRepoRelativePath(input.repoRoot, value, label)
  );
  const workspaceEntryPath = path.join(input.projectDir, "workspace", "index.html");
  const workspaceEntry = toRepoRelative(workspaceEntryPath, "workspace entry");
  const recipePath = toRepoRelative(path.join(input.metaDir, "english-unit.json"), "recipe");
  const promptPack = toRepoRelative(promptPackPath, "prompt pack");
  const customSources = input.recipe.customComponents
    .filter((component) => component.enabled)
    .flatMap((component) => [component.source, component.assetRoot].filter((entry): entry is string => Boolean(entry)))
    .map((entry) => toRepoRelative(path.join(input.projectDir, entry), "custom component source"));
  const implementationSources = [
    path.join(input.repoRoot, "scripts", "build-english-unit.ts"),
    path.join(input.repoRoot, "scripts", "lib", "english-unit", "factory-build.ts"),
    path.join(input.repoRoot, "scripts", "lib", "english-unit", "activity-profile-renderers.ts"),
    ...(input.recipe.schemaVersion === 3 ? [
      path.join(input.repoRoot, "scripts", "lib", "english-unit", "v3-profile-renderer.ts"),
      path.join(input.repoRoot, "scripts", "lib", "english-unit", "v3-runtime-sanitizer.ts"),
      path.join(input.repoRoot, "scripts", "lib", "english-unit", "v3-donor-lessons.ts"),
      path.join(input.repoRoot, "scripts", "lib", "english-unit", "writing-foundations-lessons.ts")
    ] : []),
    path.join(input.repoRoot, "scripts", "lib", "next-step-course-shell.ts")
  ].map((entry) => toRepoRelative(entry, "factory implementation"));
  const existingReferenceOnly = (((existing.referenceOnly as string[] | undefined) ?? [])
    .filter((entry) => typeof entry === "string" && entry.trim())
    .flatMap((entry) => {
      try {
        return [toRepoRelative(entry, "existing reference")];
      } catch {
        // Older manifests could contain a source path from another checkout.
        // It cannot be a portable factory dependency, so replace it with the
        // current recipe-owned input instead of retaining a misleading path.
        return [];
      }
    }));
  const now = input.report.generatedAt;
  const projectJson = {
    ...existing,
    id: input.recipe.projectSlug,
    slug: input.recipe.projectSlug,
    sourcePath: toRepoRelative(input.brightspacePath, "Brightspace source"),
    inputKind: "brightspace-zip",
    previewModes: ["workspace"],
    workspaceEntrypoint: workspaceEntry,
    createdAt: existing.createdAt ?? now,
    updatedAt: now,
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion"],
    canonicalEntry: workspaceEntry,
    canonicalSources: [
      workspaceEntry,
      recipePath,
      promptPack,
      ...implementationSources,
      ...customSources
    ],
    generatedOutputs: [],
    regenerateCommand: `npm run build:english-unit -- --project ${input.recipe.projectSlug}`,
    authoring: existing.authoring ?? {
      driverId: "english-factory-v1",
      familyId: "english-unit",
      qualityProfile: "english-unit",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true },
      editabilityContract: {
        schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
        profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
      }
    },
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: toRepoRelative(input.brightspacePath, "Brightspace source"),
      importedAt: (existing.importedFirstPassOrigin as { importedAt?: string } | undefined)?.importedAt ?? now,
      notes: input.recipe.schemaVersion === 3
        ? `${input.recipe.unitTitle} V3 derived factory conversion from ${input.recipe.derivesFromProject} using the ${input.recipe.activityProfile.kind} activity profile.`
        : `${input.recipe.unitTitle} factory conversion using the ${input.recipe.activityProfile.kind} activity profile.`
    },
    authoringStatus: input.recipe.status === "ready-for-export" ? "ready-for-export" : "active",
    exportTargets: [
      { target: "scorm", enabled: true, notes: "Export individually only after the recipe is ready-for-export and verification passes." },
      { target: "html", enabled: true, notes: "Canonical editable workspace preview." }
    ],
    referenceOnly: Array.from(new Set([
      ...existingReferenceOnly,
      toRepoRelative(input.brightspacePath, "Brightspace source"),
      toRepoRelative(input.teacherPath, "teacher resource source"),
      ...(input.additionalReferenceOnly ?? []).map((entry) => toRepoRelative(entry, "additional reference"))
    ])),
    sourceOfTruthNotes: "Edit meta/english-unit.json and workspace/components or workspace/assets/custom. Factory-owned index/assets/generated output is replaced through a safe staged build; custom component paths are preserved.",
    injectedComponents: input.recipe.customComponents
  };
  await writeFile(projectPath, `${JSON.stringify(projectJson, null, 2)}\n`, "utf8");

  const e2ePath = path.join(input.metaDir, "e2e-contract.json");
  await writeEnglishLearnerE2EContract({
    projectSlug: input.recipe.projectSlug,
    html: await readFile(workspaceEntryPath, "utf8"),
    contractPath: e2ePath,
    quizTitle: input.recipe.activityProfile.kind === "film-study" ? "Film Study Questions" : "Questions"
  });
  await writeFile(path.join(input.metaDir, "conversion-notes.md"), `# ${input.recipe.courseCode} ${input.recipe.unitTitle}\n\n- Activity profile: ${input.recipe.activityProfile.kind}\n- Source lesson IDs: ${input.recipe.source.lessonSelectors.filter((selector) => selector.disposition === "include").map((selector) => selector.itemId).join(", ")}\n- Status: ${input.recipe.status}\n- Review items: ${input.recipe.acceptance.reviewItems.length}\n- Canonical recipe: projects/${input.recipe.projectSlug}/meta/english-unit.json\n- Canonical workspace: projects/${input.recipe.projectSlug}/workspace/index.html\n- Preserved custom code/data: projects/${input.recipe.projectSlug}/workspace/components and workspace/assets/custom\n- Rebuild: npm run build:english-unit -- --project ${input.recipe.projectSlug}\n- Final SCORM: only after ready-for-export\n`, "utf8");
}

export async function buildEnglishFactoryProject(input: { repoRoot: string; projectSlug: string }) {
  const projectDir = path.join(input.repoRoot, "projects", input.projectSlug);
  const workspaceDir = path.join(projectDir, "workspace");
  const metaDir = path.join(projectDir, "meta");
  const recipePath = path.join(metaDir, "english-unit.json");
  if (!(await fileExists(recipePath))) throw new Error(`English unit recipe is missing: ${recipePath}`);
  const parsedRecipe = parseEnglishUnitRecipe(JSON.parse(await readFile(recipePath, "utf8")));
  if (parsedRecipe.projectSlug !== input.projectSlug) throw new Error(`Recipe project slug ${parsedRecipe.projectSlug} does not match ${input.projectSlug}.`);
  const v3Family = parsedRecipe.schemaVersion === 3
    ? await readV3FamilyManifest(input.repoRoot, parsedRecipe)
    : undefined;
  const donorDataHydration = parsedRecipe.schemaVersion === 3
    ? await hydrateEnglishV3DonorData({ repoRoot: input.repoRoot, recipe: parsedRecipe })
    : undefined;
  const recipe = donorDataHydration?.recipe ?? parsedRecipe;
  const inheritedDonorDecisionCount = donorDataHydration
    ? donorDataHydration.inherited.questionPrompts
      + donorDataHydration.inherited.questionPageSelections
      + donorDataHydration.inherited.analysisTerms
      + donorDataHydration.inherited.analysisExamples
      + donorDataHydration.inherited.placements
      + Number(donorDataHydration.inherited.fictionElementsHub)
      + Number(donorDataHydration.inherited.lessonStructure)
    : 0;
  const merchantFoundation = recipe.schemaVersion === 2 && recipe.projectSlug === "ela10-1-shakespeare-merchant-of-venice"
    ? await ensureMerchantFoundationLessons({ repoRoot: input.repoRoot, projectDir })
    : undefined;
  const donorPlans = recipe.schemaVersion === 3 && hasV3DonorLessonSelector(recipe)
    ? await inspectEnglishV3DonorLessonPlans({ repoRoot: input.repoRoot, recipe })
    : [];

  const brightspacePath = resolveRecipeSource(input.repoRoot, recipe.source.brightspaceZip);
  const teacherPath = resolveRecipeSource(input.repoRoot, recipe.source.teacherResourcesZip);
  if (!(await fileExists(brightspacePath))) throw new Error(`Brightspace archive is missing: ${brightspacePath}`);
  if (!(await fileExists(teacherPath))) throw new Error(`Teacher archive is missing: ${teacherPath}`);
  const [brightspaceBuffer, teacherBuffer] = await Promise.all([readFile(brightspacePath), readFile(teacherPath)]);
  const [brightspaceZip, teacherZip] = await Promise.all([JSZip.loadAsync(brightspaceBuffer), JSZip.loadAsync(teacherBuffer)]);
  const resourceDir = path.join(input.repoRoot, "projects", "resources", input.projectSlug);
  return await runEnglishFactoryOutputTransaction({
    projectDir,
    resourceDir,
    async run() {
  await mkdir(resourceDir, { recursive: true });
  const reportItems: EnglishBuildReportItem[] = [];
  if (donorDataHydration?.source && inheritedDonorDecisionCount > 0) {
    reportItems.push({
      role: "supporting-resource",
      source: path.relative(input.repoRoot, donorDataHydration.source.recipePath).replaceAll(path.sep, "/"),
      status: "corrected",
      destination: recipe.projectSlug,
      note: `Hydrated ${inheritedDonorDecisionCount} curated learner-activity decision(s) for ${donorDataHydration.matchedReadings.length} exactly matched work(s); explicit V3 recipe decisions remained authoritative.`
    });
  }
  recipe.source.lessonSelectors.filter((selector) => selector.disposition === "exclude").forEach((selector) => reportItems.push({
    role: "lesson", source: `Brightspace item ${selector.itemId}`, status: "excluded", note: selector.reason ?? "Excluded by the exact source allowlist."
  }));

  let builtLessons: Awaited<ReturnType<typeof loadBrightspaceLessonsByIds>>["lessons"] = [];
  let preparedResources: EnglishPreparedResource[] = [];
  let renderedRoutes: string[] = [];
  let videos: Array<{ id: string; lessonTitle: string; embedSrc: string }> = [];
  let writingFoundationsLessonAssets: { css: string; runtime: string } | undefined;
  const recipeHash = await fileSha256(recipePath);
  const profileHash = sha256(JSON.stringify(recipe.activityProfile));
  const supplementalRoot = path.resolve(resourceDir, "_sources", "supplemental");
  const supplementalSources = await Promise.all(recipe.resourceDispositions
    .filter((resource) => resource.source.startsWith("supplemental://"))
    .map(async (resource) => {
      const relativePath = resource.source.slice("supplemental://".length).replace(/^\/+/, "");
      const sourcePath = path.resolve(supplementalRoot, relativePath);
      if (!relativePath || sourcePath === supplementalRoot || !sourcePath.startsWith(`${supplementalRoot}${path.sep}`)) {
        throw new Error(`Unsafe supplemental source in English unit recipe: ${resource.source}`);
      }
      return {
        id: `supplemental:${resource.id}`,
        path: path.relative(input.repoRoot, sourcePath).replaceAll(path.sep, "/"),
        sha256: await fileSha256(sourcePath)
      };
    }));
  const familySupplementSources = v3Family
    ? await Promise.all(v3Family.manifest.archives
        .filter((archive) => archive.kind === "supplement")
        .map((archive) => sourceRecord(input.repoRoot, `family:${archive.id}`, archive.path, archive.sha256)))
    : [];
  const familyManifestSource = v3Family
    ? await sourceRecord(input.repoRoot, `family:${v3Family.manifest.courseId}`, v3Family.path)
    : undefined;
  const donorDataSource = donorDataHydration?.source && inheritedDonorDecisionCount > 0
    ? await sourceRecord(
        input.repoRoot,
        `donor-data:${donorDataHydration.source.requestedProjectSlug}`,
        donorDataHydration.source.recipePath
      )
    : undefined;
  const donorSources = (await Promise.all(donorPlans.flatMap((plan, planIndex) =>
    donorPlanReferencePaths(input.repoRoot, plan).map(async (sourcePath, sourceIndex) => sourceRecord(
      input.repoRoot,
      `donor:${plan.requestedProjectSlug}:${plan.kind}:${planIndex + 1}:${sourceIndex + 1}`,
      sourcePath
    ))
  ))).flat();
  const merchantFoundationSource = merchantFoundation && await fileExists(merchantFoundation.supplementalArchivePath)
    ? {
        id: "supplemental:merchant-cbe-shakespeare-foundation",
        path: path.relative(input.repoRoot, merchantFoundation.supplementalArchivePath).replaceAll(path.sep, "/"),
        sha256: await fileSha256(merchantFoundation.supplementalArchivePath)
      }
    : undefined;
  const promotion = await stageAndPromoteEnglishWorkspace({
    workspaceDir,
    ownedPaths: [
      { path: "index.html", kind: "file" },
      { path: "assets/generated", kind: "directory" },
      { path: "resources/generated", kind: "directory" }
    ],
    metadata: {
      projectSlug: recipe.projectSlug,
      status: recipe.status === "ready-for-export" ? "success" : "needs-review",
      profile: { id: recipe.activityProfile.kind, version: recipe.profileVersion, sha256: profileHash },
      recipe: { path: path.relative(input.repoRoot, recipePath).replaceAll(path.sep, "/"), sha256: recipeHash },
      sources: [
        { id: "brightspace", path: path.relative(input.repoRoot, brightspacePath).replaceAll(path.sep, "/"), sha256: sha256(brightspaceBuffer) },
        { id: "teacher-resources", path: path.relative(input.repoRoot, teacherPath).replaceAll(path.sep, "/"), sha256: sha256(teacherBuffer) },
        ...supplementalSources,
        ...familySupplementSources,
        ...(familyManifestSource ? [familyManifestSource] : []),
        ...(donorDataSource ? [donorDataSource] : []),
        ...donorSources,
        ...(merchantFoundationSource ? [merchantFoundationSource] : [])
      ],
      reviewItems: recipe.acceptance.reviewItems
    },
    async buildStage({ stageDir }) {
      await Promise.all([
        mkdir(path.join(stageDir, "assets", "generated", "brand"), { recursive: true }),
        mkdir(path.join(stageDir, "resources", "generated"), { recursive: true })
      ]);
      await copyFile(path.join(input.repoRoot, LOGO_RELATIVE_PATH), path.join(stageDir, "assets", "generated", "brand", "nxt-ce-logo-white-with-ce.png"));
      const includedSelectors = recipe.source.lessonSelectors.filter((selector) => selector.disposition === "include");
      if (recipe.schemaVersion === 3 && hasV3DonorLessonSelector(recipe)) {
        const donorResolution = await resolveEnglishV3DonorLessons({
          repoRoot: input.repoRoot,
          recipe,
          workspaceDir: stageDir,
          reportItems
        });
        builtLessons = donorResolution.lessons;
      } else {
        const includeChildrenSelectors = recipe.schemaVersion === 3
          ? includedSelectors.filter((selector) => selector.includeChildren)
          : [];
        if (includeChildrenSelectors.length > 1) {
          throw new Error(`English V3 unit ${recipe.projectSlug} may include children from only one Brightspace module.`);
        }
        if (includeChildrenSelectors.length === 1 && (
          includedSelectors.length !== 1
          || includeChildrenSelectors[0]?.itemId !== recipe.source.brightspaceUnitId
        )) {
          throw new Error(
            `English V3 unit ${recipe.projectSlug} must use its single Brightspace unit selector ${recipe.source.brightspaceUnitId} when includeChildren is enabled.`
          );
        }
        const loaded = includeChildrenSelectors.length === 1
          ? await loadBrightspaceUnit({
              zip: brightspaceZip,
              workspaceDir: stageDir,
              recipe,
              reportItems
            })
          : await loadBrightspaceLessonsByIds({
              zip: brightspaceZip,
              workspaceDir: stageDir,
              recipe,
              selectors: includedSelectors.map((selector) => ({ itemId: selector.itemId, title: selector.title })),
              reportItems
            });
        builtLessons = merchantFoundation
          ? await readMerchantFoundationLessons(path.join(stageDir, "components", "shakespeare-foundation-lessons", "lessons.json"))
          : recipe.schemaVersion === 3
            ? normalizeEnglishV3ResolvedLessons(loaded.lessons, recipe)
            : loaded.lessons;
        if (recipe.schemaVersion === 3 && recipe.activityProfile.kind === "writing-foundations") {
          const transformed = transformWritingFoundationsLessons({
            lessons: builtLessons,
            sourcePageIds: includedSelectors.map((selector) => selector.itemId)
          });
          builtLessons = transformed.lessons;
          writingFoundationsLessonAssets = { css: transformed.css, runtime: transformed.runtime };
          transformed.sourceMap.forEach((mapping) => reportItems.push({
            role: "lesson",
            source: `Brightspace page ${mapping.sourcePageId}: ${mapping.sourceTitle}`,
            destination: mapping.learnerLessonTitle,
            status: "corrected",
            note: `Normalized and mapped into the seven-lesson Writing Foundations sequence as ${mapping.learnerLessonId}.`
          }));
        }
      }
      if (merchantFoundation) {
        builtLessons.forEach((lesson) => reportItems.push({
          role: "lesson",
          source: lesson.sourceHref,
          destination: lesson.title,
          status: "placed",
          note: "CBE ELA 10-1 Shakespeare content is layered into the proven Othello foundation lesson format."
        }));
      }
      if (recipe.schemaVersion === 3) {
        builtLessons = await relocateV3GeneratedLessonResources({ lessons: builtLessons, workspaceDir: stageDir, reportItems });
      }
      preparedResources = await prepareEnglishFactoryResources({
        repoRoot: input.repoRoot,
        recipe,
        teacherZip,
        workspaceDir: stageDir,
        resourceDir,
        reportItems
      });
      videos = collectVerifiedVideos(builtLessons, recipe);
      let renderedProfile: EnglishRenderedActivityProfile;
      if (recipe.schemaVersion === 3) {
        const v3Profile = renderV3ActivityProfile({ recipe, resources: preparedResources, context: { videos } });
        renderedProfile = writingFoundationsLessonAssets
          ? {
              ...v3Profile,
              css: [v3Profile.css, writingFoundationsLessonAssets.css].filter(Boolean).join("\n"),
              runtime: composeEnglishV3Runtime([
                { id: `${recipe.projectSlug}:v3-profile`, kind: "composite", source: v3Profile.runtime ?? "" },
                { id: `${recipe.projectSlug}:writing-foundations-lesson-tabs`, kind: "writing-foundations", source: writingFoundationsLessonAssets.runtime }
              ])
            }
          : v3Profile;
      } else {
        const profile = await buildActivityProfile({ recipe, workspaceDir: stageDir, resources: preparedResources });
        renderedProfile = renderEnglishActivityProfile(profile, { videos });
      }
      renderedRoutes = renderedProfile.pages.map((page) => page.id);
      const renderedHtml = renderEnglishFactoryUnit({ recipe, lessons: builtLessons, activityProfile: renderedProfile, resources: preparedResources, videos });
      const html = await applyStoredCourseEdits({ repoRoot: input.repoRoot, projectSlug: recipe.projectSlug, html: renderedHtml, workspaceDir: stageDir });
      validateLearnerHtml(html, recipe, renderedRoutes);
      await writeFile(path.join(stageDir, "index.html"), html, "utf8");
    },
    validateIndex({ html }) { validateLearnerHtml(html, recipe, renderedRoutes); }
  });

  const generatedAt = promotion.manifest.generatedAt;
  const report: EnglishBuildReport = {
    schemaVersion: 1,
    projectSlug: recipe.projectSlug,
    generatedAt,
    selectedUnit: { identifier: recipe.source.brightspaceUnitId, title: recipe.unitTitle, lessonCount: builtLessons.length },
    summary: reportSummary(reportItems),
    items: reportItems
  };
  const v3ReferenceOnly = v3Family
    ? [
        v3Family.path,
        ...v3Family.manifest.archives
          .filter((archive) => archive.kind === "supplement")
          .map((archive) => resolveRecipeSource(input.repoRoot, archive.path)),
        ...(donorDataSource ? [resolveRecipeSource(input.repoRoot, donorDataSource.path)] : []),
        ...donorPlans.flatMap((plan) => donorPlanReferencePaths(input.repoRoot, plan))
      ]
    : [];
  await writeMetadata({
    repoRoot: input.repoRoot,
    projectDir,
    metaDir,
    recipe,
    report,
    buildManifest: promotion.manifest,
    brightspacePath,
    teacherPath,
    additionalReferenceOnly: [
      ...(merchantFoundationSource ? [merchantFoundation!.supplementalArchivePath] : []),
      ...v3ReferenceOnly
    ]
  });
  return { projectSlug: recipe.projectSlug, recipe, report, renderedRoutes, resourceCount: preparedResources.length, videoCount: videos.length, workspaceEntry: path.join(workspaceDir, "index.html") };
    }
  });
}

export const englishFactoryBuildInternals = { validateLearnerHtml, materialHooks, buildActivityProfile, FORBIDDEN_LEARNER_PATTERNS };
