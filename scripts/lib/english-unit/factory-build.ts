import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";

import { renderEnglishActivityProfile, type EnglishActivityProfile, type EnglishMaterialHook } from "./activity-profile-renderers.js";
import {
  buildEla20CrucibleActivityProfile,
  buildEla20FilmStudyActivityProfile,
  buildEla20MacbethActivityProfile,
  buildEla20NovelStudyActivityProfile
} from "./ela20-activity-profiles.js";
import { renderEnglishFactoryUnit } from "./factory-render.js";
import {
  buildCrucibleActQuestionSets,
  buildMacbethActQuestionSets,
  prepareEnglishFactoryResources,
  type EnglishPreparedResource
} from "./factory-resources.js";
import { readMacbethSceneComponent } from "./macbeth-scenes.js";
import { parseEnglishUnitRecipe } from "./schema.js";
import { collectVerifiedVideos, loadBrightspaceLessonsByIds } from "./source.js";
import type {
  EnglishBuildReport,
  EnglishBuildReportItem,
  EnglishUnitRecipeV2
} from "./types.js";
import { stageAndPromoteEnglishWorkspace } from "./workspace-staging.js";

const LOGO_RELATIVE_PATH = path.join("docs", "design", "next-step", "assets", "nxt-ce-logo-white-with-ce.png");
const FORBIDDEN_LEARNER_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "soft/hard gate", pattern: /(?:soft|hard)[ _-]*gate/i },
  { label: "answer key", pattern: /answer\s*key|soft gate anwsers/i },
  { label: "ELA 30-1", pattern: /(?:ELA|English)\s*30-1/i },
  { label: "Diploma framing", pattern: /Diploma(?:\s+Exam)?|Part\s+A\s*\(Written\)/i },
  { label: "unrelated Math content", pattern: /factors_and_products|linear_functions|trigonometry/i }
];

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

async function fileSha256(filePath: string) {
  return sha256(await readFile(filePath));
}

async function fileExists(filePath: string) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function resolveRecipeSource(repoRoot: string, sourcePath: string) {
  return path.isAbsolute(sourcePath) ? sourcePath : path.join(repoRoot, sourcePath);
}

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
    .map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.role === "question-set" ? "Teacher-supplied question or activity sheet." : "Teacher-selected unit resource.",
      href: resource.href,
      actionLabel: "Open / Download",
      downloadable: true,
      status: "available" as const
    }));
}

async function buildActivityProfile(input: {
  recipe: EnglishUnitRecipeV2;
  workspaceDir: string;
  resources: EnglishPreparedResource[];
}): Promise<EnglishActivityProfile> {
  const materials = materialHooks(input.resources);
  switch (input.recipe.activityProfile.kind) {
    case "modern-drama":
      return buildEla20CrucibleActivityProfile({
        projectSlug: input.recipe.projectSlug,
        materials,
        actQuestionSets: buildCrucibleActQuestionSets(input.resources)
      });
    case "shakespeare-drama": {
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
        actQuestionSets: buildMacbethActQuestionSets(questionResource)
      });
    }
    case "novel-study":
      return buildEla20NovelStudyActivityProfile({ projectSlug: input.recipe.projectSlug, materials });
    case "film-study":
      return buildEla20FilmStudyActivityProfile({
        projectSlug: input.recipe.projectSlug,
        materials,
        filmTitle: input.recipe.activityProfile.filmSelection.mode === "selected"
          ? input.recipe.activityProfile.filmSelection.title
          : undefined
      });
    case "short-fiction":
      throw new Error("The migrated Short Stories golden profile is built through the V1 compatibility path.");
  }
}

function validateLearnerHtml(html: string, recipe: EnglishUnitRecipeV2, renderedRoutes: string[]) {
  const contamination = FORBIDDEN_LEARNER_PATTERNS.filter((item) => item.pattern.test(html)).map((item) => item.label);
  if (contamination.length) throw new Error(`Forbidden learner content remains: ${contamination.join(", ")}`);
  const duplicateIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]).filter((id, index, ids) => ids.indexOf(id) !== index);
  if (duplicateIds.length) throw new Error(`Rendered English unit contains duplicate page/element ids: ${[...new Set(duplicateIds)].slice(0, 8).join(", ")}`);
  const missingRenderedRoutes = renderedRoutes.filter((route) => !html.includes(`id="${route}"`));
  if (missingRenderedRoutes.length) throw new Error(`Rendered activity routes are missing: ${missingRenderedRoutes.join(", ")}`);
  for (const route of ["overview", "lessons", "evidence-bank", "resources"]) {
    if (!html.includes(`id="${route}"`)) throw new Error(`Required English route is missing: ${route}`);
  }
  if (!html.includes("window.nextStepEvidenceBank")) throw new Error("Shared Evidence Bank API is missing from learner output.");
  if (!html.includes("data-response-id") || !html.includes("data-save-response-collection")) {
    throw new Error(`English ${recipe.activityProfile.kind} output is missing autosave or collection-save hooks.`);
  }
}

function renderMappingMarkdown(report: EnglishBuildReport, recipe: EnglishUnitRecipeV2) {
  const rows = report.items.map((item) => `| ${item.status} | ${item.role} | ${item.source.replace(/\|/g, "\\|")} | ${(item.destination ?? "-").replace(/\|/g, "\\|")} | ${item.note.replace(/\|/g, "\\|")} |`).join("\n");
  return `# ${recipe.courseCode} ${recipe.unitTitle} Mapping\n\n- Profile: ${recipe.activityProfile.kind} (${recipe.profileVersion})\n- Brightspace lessons: ${report.selectedUnit.lessonCount}\n- Status: ${recipe.status}\n- Placed: ${report.summary.placed}\n- Excluded: ${report.summary.excluded}\n- Missing: ${report.summary.missing}\n- Failed: ${report.summary.failed}\n\n| Status | Role | Source | Destination | Note |\n| --- | --- | --- | --- | --- |\n${rows}\n`;
}

async function writeMetadata(input: {
  repoRoot: string;
  projectDir: string;
  metaDir: string;
  recipe: EnglishUnitRecipeV2;
  report: EnglishBuildReport;
  buildManifest: unknown;
  brightspacePath: string;
  teacherPath: string;
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
      `# ${input.recipe.courseCode} ${input.recipe.unitTitle} Prompt Pack\n\n- Mode: DEFAULT\n- Workflow: conversion\n- Activity profile: ${input.recipe.activityProfile.kind} (${input.recipe.profileVersion})\n- Exact included Brightspace IDs: ${includedIds}\n- Exact excluded Brightspace IDs: ${excludedIds || "none"}\n- Canonical recipe: projects/${input.recipe.projectSlug}/meta/english-unit.json\n- Canonical learner source: projects/${input.recipe.projectSlug}/workspace/index.html\n- Preserved custom source: projects/${input.recipe.projectSlug}/workspace/components and workspace/assets/custom\n- Rebuild command: npm run build:english-unit -- --project ${input.recipe.projectSlug}\n\n## Authoring boundary\n\nEdit the recipe for source, placement, profile, or wording decisions. Put bespoke activity code or data under the preserved custom paths. The factory owns index.html and assets/generated; do not patch exports.\n\n## Review blockers\n\n${input.recipe.acceptance.reviewItems.map((item) => `- ${item}`).join("\n")}\n\nFinal SCORM packaging remains blocked until the recipe is ready-for-export and project E2E passes.\n`,
      "utf8"
    );
  }

  const projectPath = path.join(input.metaDir, "project.json");
  let existing: Record<string, unknown> = {};
  try { existing = JSON.parse(await readFile(projectPath, "utf8")); } catch { existing = {}; }
  const workspaceEntry = path.join(input.projectDir, "workspace", "index.html");
  const recipePath = path.join(input.metaDir, "english-unit.json");
  const now = input.report.generatedAt;
  const projectJson = {
    ...existing,
    id: input.recipe.projectSlug,
    slug: input.recipe.projectSlug,
    sourcePath: input.brightspacePath,
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
      promptPackPath,
      path.join(input.repoRoot, "scripts", "build-english-unit.ts"),
      path.join(input.repoRoot, "scripts", "lib", "english-unit", "factory-build.ts"),
      path.join(input.repoRoot, "scripts", "lib", "english-unit", "activity-profile-renderers.ts"),
      path.join(input.repoRoot, "scripts", "lib", "next-step-course-shell.ts")
    ],
    generatedOutputs: [],
    regenerateCommand: `npm run build:english-unit -- --project ${input.recipe.projectSlug}`,
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: input.brightspacePath,
      importedAt: (existing.importedFirstPassOrigin as { importedAt?: string } | undefined)?.importedAt ?? now,
      notes: `${input.recipe.unitTitle} factory conversion using the ${input.recipe.activityProfile.kind} activity profile.`
    },
    authoringStatus: input.recipe.status === "ready-for-export" ? "ready-for-export" : "active",
    exportTargets: [
      { target: "scorm", enabled: true, notes: "Export individually only after the recipe is ready-for-export and verification passes." },
      { target: "html", enabled: true, notes: "Canonical editable workspace preview." }
    ],
    referenceOnly: Array.from(new Set([
      ...(((existing.referenceOnly as string[] | undefined) ?? []).filter((entry) => typeof entry === "string" && entry.trim())),
      input.brightspacePath,
      input.teacherPath
    ])),
    sourceOfTruthNotes: "Edit meta/english-unit.json and workspace/components or workspace/assets/custom. Factory-owned index/assets/generated output is replaced through a safe staged build; custom component paths are preserved.",
    injectedComponents: input.recipe.customComponents
  };
  await writeFile(projectPath, `${JSON.stringify(projectJson, null, 2)}\n`, "utf8");

  const e2ePath = path.join(input.metaDir, "e2e-contract.json");
  if (!(await fileExists(e2ePath))) {
    await writeFile(e2ePath, `${JSON.stringify({
      $schema: "../../../e2e/project-e2e-contract.schema.json",
      projectSlug: input.recipe.projectSlug,
      requiredTestIds: ["studio-shell", "course-studio-tab", "workspace-project-select", "project-root", "workspace-preview-frame"],
      modes: { enabled: false },
      navigation: { enabled: false },
      quiz: { enabled: false, lessonTitle: input.recipe.activityProfile.kind === "film-study" ? "Film Study Questions" : "Questions" },
      fallbackPanel: { enabled: false }
    }, null, 2)}\n`, "utf8");
  }
  await writeFile(path.join(input.metaDir, "conversion-notes.md"), `# ${input.recipe.courseCode} ${input.recipe.unitTitle}\n\n- Activity profile: ${input.recipe.activityProfile.kind}\n- Source lesson IDs: ${input.recipe.source.lessonSelectors.filter((selector) => selector.disposition === "include").map((selector) => selector.itemId).join(", ")}\n- Status: ${input.recipe.status}\n- Review items: ${input.recipe.acceptance.reviewItems.length}\n- Canonical recipe: projects/${input.recipe.projectSlug}/meta/english-unit.json\n- Canonical workspace: projects/${input.recipe.projectSlug}/workspace/index.html\n- Preserved custom code/data: projects/${input.recipe.projectSlug}/workspace/components and workspace/assets/custom\n- Rebuild: npm run build:english-unit -- --project ${input.recipe.projectSlug}\n- Final SCORM: only after ready-for-export\n`, "utf8");
}

export async function buildEnglishFactoryProject(input: { repoRoot: string; projectSlug: string }) {
  const projectDir = path.join(input.repoRoot, "projects", input.projectSlug);
  const workspaceDir = path.join(projectDir, "workspace");
  const metaDir = path.join(projectDir, "meta");
  const recipePath = path.join(metaDir, "english-unit.json");
  if (!(await fileExists(recipePath))) throw new Error(`English unit recipe is missing: ${recipePath}`);
  const parsed = parseEnglishUnitRecipe(JSON.parse(await readFile(recipePath, "utf8")));
  if (parsed.schemaVersion !== 2) throw new Error(`Factory build requires an EnglishUnitRecipeV2: ${recipePath}`);
  const recipe = parsed;
  if (recipe.projectSlug !== input.projectSlug) throw new Error(`Recipe project slug ${recipe.projectSlug} does not match ${input.projectSlug}.`);

  const brightspacePath = resolveRecipeSource(input.repoRoot, recipe.source.brightspaceZip);
  const teacherPath = resolveRecipeSource(input.repoRoot, recipe.source.teacherResourcesZip);
  if (!(await fileExists(brightspacePath))) throw new Error(`Brightspace archive is missing: ${brightspacePath}`);
  if (!(await fileExists(teacherPath))) throw new Error(`Teacher archive is missing: ${teacherPath}`);
  const [brightspaceBuffer, teacherBuffer] = await Promise.all([readFile(brightspacePath), readFile(teacherPath)]);
  const [brightspaceZip, teacherZip] = await Promise.all([JSZip.loadAsync(brightspaceBuffer), JSZip.loadAsync(teacherBuffer)]);
  const resourceDir = path.join(input.repoRoot, "projects", "resources", input.projectSlug);
  await mkdir(resourceDir, { recursive: true });
  const reportItems: EnglishBuildReportItem[] = [];
  recipe.source.lessonSelectors.filter((selector) => selector.disposition === "exclude").forEach((selector) => reportItems.push({
    role: "lesson", source: `Brightspace item ${selector.itemId}`, status: "excluded", note: selector.reason ?? "Excluded by the exact source allowlist."
  }));

  let builtLessons: Awaited<ReturnType<typeof loadBrightspaceLessonsByIds>>["lessons"] = [];
  let preparedResources: EnglishPreparedResource[] = [];
  let renderedRoutes: string[] = [];
  let videos: Array<{ id: string; lessonTitle: string; embedSrc: string }> = [];
  const recipeHash = await fileSha256(recipePath);
  const profileHash = sha256(JSON.stringify(recipe.activityProfile));
  const promotion = await stageAndPromoteEnglishWorkspace({
    workspaceDir,
    ownedPaths: [{ path: "index.html", kind: "file" }, { path: "assets/generated", kind: "directory" }],
    metadata: {
      projectSlug: recipe.projectSlug,
      status: recipe.status === "ready-for-export" ? "success" : "needs-review",
      profile: { id: recipe.activityProfile.kind, version: recipe.profileVersion, sha256: profileHash },
      recipe: { path: path.relative(input.repoRoot, recipePath).replaceAll(path.sep, "/"), sha256: recipeHash },
      sources: [
        { id: "brightspace", path: path.relative(input.repoRoot, brightspacePath).replaceAll(path.sep, "/"), sha256: sha256(brightspaceBuffer) },
        { id: "teacher-resources", path: path.relative(input.repoRoot, teacherPath).replaceAll(path.sep, "/"), sha256: sha256(teacherBuffer) }
      ],
      reviewItems: recipe.acceptance.reviewItems
    },
    async buildStage({ stageDir }) {
      await mkdir(path.join(stageDir, "assets", "generated", "brand"), { recursive: true });
      await copyFile(path.join(input.repoRoot, LOGO_RELATIVE_PATH), path.join(stageDir, "assets", "generated", "brand", "nxt-ce-logo-white-with-ce.png"));
      const includedSelectors = recipe.source.lessonSelectors.filter((selector) => selector.disposition === "include");
      const loaded = await loadBrightspaceLessonsByIds({
        zip: brightspaceZip,
        workspaceDir: stageDir,
        recipe,
        selectors: includedSelectors.map((selector) => ({ itemId: selector.itemId, title: selector.title })),
        reportItems
      });
      builtLessons = loaded.lessons;
      preparedResources = await prepareEnglishFactoryResources({ recipe, teacherZip, workspaceDir: stageDir, resourceDir, reportItems });
      const profile = await buildActivityProfile({ recipe, workspaceDir: stageDir, resources: preparedResources });
      const renderedProfile = renderEnglishActivityProfile(profile);
      renderedRoutes = renderedProfile.pages.map((page) => page.id);
      videos = collectVerifiedVideos(builtLessons, recipe);
      const html = renderEnglishFactoryUnit({ recipe, lessons: builtLessons, activityProfile: renderedProfile, resources: preparedResources, videos });
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
  await writeMetadata({ repoRoot: input.repoRoot, projectDir, metaDir, recipe, report, buildManifest: promotion.manifest, brightspacePath, teacherPath });
  return { projectSlug: recipe.projectSlug, recipe, report, renderedRoutes, resourceCount: preparedResources.length, videoCount: videos.length, workspaceEntry: path.join(workspaceDir, "index.html") };
}

export const englishFactoryBuildInternals = { validateLearnerHtml, materialHooks, buildActivityProfile, FORBIDDEN_LEARNER_PATTERNS };
