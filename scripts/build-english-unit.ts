import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";

import { getStringFlag, parseArgs } from "./lib/cli.js";
import { writeEnglishLearnerE2EContract } from "./lib/english-unit/e2e-contract.js";
import { buildEnglishFactoryProject } from "./lib/english-unit/factory-build.js";
import {
  createEla20ShortStoriesPilotRecipe,
  ELA20_SHORT_STORY_ANALYSIS_EXAMPLES,
  ELA20_SHORT_STORY_ANALYSIS_TERMS,
  ELA20_SHORT_STORY_FICTION_ELEMENTS_HUB,
  ELA20_SHORT_STORY_MANAGED_ANALYSIS_TERM_IDS,
  ELA20_SHORT_STORY_TOP_LEVEL_LESSONS
} from "./lib/english-unit/pilot-recipe.js";
import {
  ELA10_SHORT_STORY_ANALYSIS_EXAMPLES,
  ELA10_SHORT_STORY_ANALYSIS_TERMS,
  ELA10_SHORT_STORY_MANAGED_ANALYSIS_TERM_IDS
} from "./lib/english-unit/ela10-course-seeds.js";
import { renderEnglishUnit } from "./lib/english-unit/render.js";
import {
  collectVerifiedVideos,
  loadBrightspaceUnit,
  normalizeZipPath,
  parseNumberedQuestions,
  safeFileName
} from "./lib/english-unit/source.js";
import type {
  EnglishBuildReport,
  EnglishBuildReportItem,
  EnglishBuiltReading,
  EnglishUnitRecipeV1
} from "./lib/english-unit/types.js";
import { stageAndPromoteEnglishWorkspace } from "./lib/english-unit/workspace-staging.js";
import { extractPdfTextWithFallback } from "./lib/pdf-text.js";
import { repoRoot } from "./lib/paths.js";

export type BuildArgs = {
  projectSlug: string;
  brightspaceZip?: string;
  teacherResourcesZip?: string;
  unitId: string;
};

const DEFAULT_PROJECT = "ela20-1-short-stories-pilot";
const DEFAULT_UNIT_ID = "53033";
const LOGO_SOURCE = path.join(repoRoot, "docs", "design", "next-step", "assets", "nxt-ce-logo-white-with-ce.png");
const ELA30_SHORT_STORIES_REFERENCE = path.join(repoRoot, "projects", "ela30-1-short-stories", "workspace", "index.html");

function parseBuildArgs(argv = process.argv.slice(2)): BuildArgs {
  const args = parseArgs(argv);
  return {
    projectSlug: getStringFlag(args, "project") ?? DEFAULT_PROJECT,
    brightspaceZip: getStringFlag(args, "brightspace-zip"),
    teacherResourcesZip: getStringFlag(args, "teacher-resources-zip"),
    unitId: getStringFlag(args, "unit-id") ?? DEFAULT_UNIT_ID
  };
}

async function fileExists(filePath: string) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function assertRecipe(value: unknown, projectSlug: string): asserts value is EnglishUnitRecipeV1 {
  const recipe = value as Partial<EnglishUnitRecipeV1>;
  if (recipe.schemaVersion !== 1 || recipe.projectSlug !== projectSlug || !Array.isArray(recipe.lessonOrder) || !Array.isArray(recipe.readings)) {
    throw new Error(`Invalid English unit recipe for ${projectSlug}.`);
  }
}

async function prepareRecipe(args: BuildArgs, projectDir: string, metaDir: string, rawDir: string) {
  const recipePath = path.join(metaDir, "english-unit.json");
  await mkdir(metaDir, { recursive: true });
  await mkdir(rawDir, { recursive: true });

  let recipe: EnglishUnitRecipeV1 | undefined;
  let recipeChanged = false;
  if (await fileExists(recipePath)) {
    const parsed = JSON.parse(await readFile(recipePath, "utf8"));
    assertRecipe(parsed, args.projectSlug);
    recipe = parsed;
  }

  if (!recipe) {
    if (!args.brightspaceZip || !args.teacherResourcesZip) {
      throw new Error(
        "First build requires --brightspace-zip and --teacher-resources-zip. Later builds may use only --project."
      );
    }
    if (!(await fileExists(args.brightspaceZip))) throw new Error(`Brightspace ZIP not found: ${args.brightspaceZip}`);
    if (!(await fileExists(args.teacherResourcesZip))) throw new Error(`Teacher resources ZIP not found: ${args.teacherResourcesZip}`);
    recipe = createEla20ShortStoriesPilotRecipe({
      projectSlug: args.projectSlug,
      brightspaceRawFile: path.basename(args.brightspaceZip),
      teacherRawFile: path.basename(args.teacherResourcesZip),
      unitId: args.unitId
    });
    recipeChanged = true;
  }

  const pilotReadingIds = new Set(ELA20_SHORT_STORY_ANALYSIS_EXAMPLES.map((example) => example.readingId));
  const usesPilotAnalysisDefaults = [...pilotReadingIds].every((readingId) =>
    recipe.readings.some((reading) => reading.id === readingId)
  );
  if (usesPilotAnalysisDefaults) {
    const preservedTerms = (recipe.analysisTerms ?? []).filter(
      (term) => !ELA20_SHORT_STORY_MANAGED_ANALYSIS_TERM_IDS.has(term.id)
    );
    const nextTerms = [...ELA20_SHORT_STORY_ANALYSIS_TERMS.map((term) => ({ ...term })), ...preservedTerms];
    if (JSON.stringify(recipe.analysisTerms ?? []) !== JSON.stringify(nextTerms)) {
      recipe.analysisTerms = nextTerms;
      recipeChanged = true;
    }
    const preservedExamples = (recipe.analysisExamples ?? []).filter(
      (example) => !example.termId || !ELA20_SHORT_STORY_MANAGED_ANALYSIS_TERM_IDS.has(example.termId)
    );
    const nextExamples = [...preservedExamples, ...ELA20_SHORT_STORY_ANALYSIS_EXAMPLES.map((example) => ({ ...example }))];
    if (JSON.stringify(recipe.analysisExamples ?? []) !== JSON.stringify(nextExamples)) {
      recipe.analysisExamples = nextExamples;
      recipeChanged = true;
    }
    const nextFictionElementsHub = {
      ...ELA20_SHORT_STORY_FICTION_ELEMENTS_HUB,
      childLessons: [...ELA20_SHORT_STORY_FICTION_ELEMENTS_HUB.childLessons]
    };
    if (JSON.stringify(recipe.fictionElementsHub) !== JSON.stringify(nextFictionElementsHub)) {
      recipe.fictionElementsHub = nextFictionElementsHub;
      recipeChanged = true;
    }
    if (JSON.stringify(recipe.topLevelLessonOrder ?? []) !== JSON.stringify(ELA20_SHORT_STORY_TOP_LEVEL_LESSONS)) {
      recipe.topLevelLessonOrder = [...ELA20_SHORT_STORY_TOP_LEVEL_LESSONS];
      recipeChanged = true;
    }
  }
  const ela10ReadingIds = new Set(ELA10_SHORT_STORY_ANALYSIS_EXAMPLES.map((example) => example.readingId));
  const usesEla10AnalysisDefaults = [...ela10ReadingIds].every((readingId) =>
    recipe.readings.some((reading) => reading.id === readingId)
  );
  if (usesEla10AnalysisDefaults) {
    const preservedTerms = (recipe.analysisTerms ?? []).filter(
      (term) => !ELA10_SHORT_STORY_MANAGED_ANALYSIS_TERM_IDS.has(term.id)
    );
    const nextTerms = [...ELA10_SHORT_STORY_ANALYSIS_TERMS.map((term) => ({ ...term })), ...preservedTerms];
    if (JSON.stringify(recipe.analysisTerms ?? []) !== JSON.stringify(nextTerms)) {
      recipe.analysisTerms = nextTerms;
      recipeChanged = true;
    }
    const preservedExamples = (recipe.analysisExamples ?? []).filter(
      (example) => !example.termId || !ELA10_SHORT_STORY_MANAGED_ANALYSIS_TERM_IDS.has(example.termId)
    );
    const nextExamples = [...preservedExamples, ...ELA10_SHORT_STORY_ANALYSIS_EXAMPLES.map((example) => ({ ...example }))];
    if (JSON.stringify(recipe.analysisExamples ?? []) !== JSON.stringify(nextExamples)) {
      recipe.analysisExamples = nextExamples;
      recipeChanged = true;
    }
  }
  if (recipeChanged) await writeFile(recipePath, `${JSON.stringify(recipe, null, 2)}\n`, "utf8");

  const brightspaceRawPath = path.join(projectDir, recipe.source.brightspaceZip);
  const teacherRawPath = path.join(projectDir, recipe.source.teacherResourcesZip);
  if (args.brightspaceZip) await copyFile(args.brightspaceZip, brightspaceRawPath);
  if (args.teacherResourcesZip) await copyFile(args.teacherResourcesZip, teacherRawPath);
  if (!(await fileExists(brightspaceRawPath))) throw new Error(`Recipe Brightspace source is missing: ${brightspaceRawPath}`);
  if (!(await fileExists(teacherRawPath))) throw new Error(`Recipe teacher source is missing: ${teacherRawPath}`);

  return { recipe, recipePath, brightspaceRawPath, teacherRawPath };
}

function teacherEntryPath(recipe: EnglishUnitRecipeV1, fileName: string) {
  return normalizeZipPath(path.posix.join(recipe.source.teacherFolder, fileName));
}

async function writeZipResource(zip: JSZip, entryPath: string, targets: string[]) {
  const entry = zip.file(entryPath);
  if (!entry) throw new Error(`Teacher resource is missing: ${entryPath}`);
  const buffer = await entry.async("nodebuffer");
  for (const target of targets) {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buffer);
  }
}

async function buildReadings(input: {
  recipe: EnglishUnitRecipeV1;
  teacherZip: JSZip;
  workspaceDir: string;
  resourceDir: string;
  reportItems: EnglishBuildReportItem[];
}) {
  const includedFileNames = new Set(input.recipe.readings.flatMap((reading) => [reading.readingFile, reading.questionFile]));
  const visualOnlyFiles = new Set(
    input.recipe.readings
      .filter((reading) => reading.kind === "visual-narrative" && reading.readingFile !== reading.questionFile)
      .map((reading) => reading.readingFile)
  );
  const workspaceHrefByFile = new Map<string, string>();
  const extractionByFile = new Map<string, Awaited<ReturnType<typeof extractPdfTextWithFallback>>>();

  for (const fileName of includedFileNames) {
    const sourceEntry = teacherEntryPath(input.recipe, fileName);
    const safeName = safeFileName(fileName);
    const resourcePath = path.join(input.resourceDir, "teacher", fileName);
    const workspaceHref = `assets/readings/${safeName}`;
    const workspacePath = path.join(input.workspaceDir, workspaceHref);
    await writeZipResource(input.teacherZip, sourceEntry, [resourcePath, workspacePath]);
    workspaceHrefByFile.set(fileName, workspaceHref);

    const forceOcr = fileName === "Lamp at Noon.pdf";
    const extraction = visualOnlyFiles.has(fileName)
      ? {
          text: null,
          method: null,
          issue: "Visual narrative retained as a page-image PDF; OCR is intentionally skipped.",
          pages: [],
          pageCount: 0
        }
      : await extractPdfTextWithFallback(resourcePath, { forceOcr });
    extractionByFile.set(fileName, extraction);
    const extractedDir = path.join(input.resourceDir, "_extracted");
    await mkdir(extractedDir, { recursive: true });
    const extractedPath = path.join(extractedDir, `${safeName}.txt`);
    const extractedBody = extraction.issue
      ? `Extraction unavailable: ${extraction.issue}\n`
      : `${extraction.text ?? ""}\n`;
    await writeFile(extractedPath, extractedBody, "utf8");
    input.reportItems.push({
      role: fileName.toLowerCase().includes("question") ? "question-set" : "reading",
      source: sourceEntry,
      status: "placed",
      destination: workspaceHref,
      note: visualOnlyFiles.has(fileName)
        ? "Copied the original visual narrative; OCR is intentionally skipped because the separate question sheet supplies the structured learner activity."
        : extraction.issue
        ? `Copied original PDF; text extraction reported: ${extraction.issue}`
        : `Copied original PDF and extracted ${extraction.method === "ocr" ? "OCR" : "native"} text into the canonical resource library.`
    });
  }

  const readings: EnglishBuiltReading[] = [];
  for (const reading of input.recipe.readings) {
    const questionExtraction = extractionByFile.get(reading.questionFile);
    if (!questionExtraction) throw new Error(`Question extraction was not prepared for ${reading.questionFile}.`);
    let questions = reading.questionPrompts ?? [];
    let extractionMethod: EnglishBuiltReading["extractionMethod"] = reading.questionPrompts ? "recipe" : "native";
    if (reading.id === "lamp-at-noon" && reading.questionPrompts && questionExtraction.method === "ocr") {
      const ocrText = questionExtraction.text ?? "";
      const requiredSignals = ["Responding to Style", "foreshadowing", "Paul and Ellen", "Responding Personally"];
      const missingSignals = requiredSignals.filter((signal) => !ocrText.includes(signal));
      if (missingSignals.length) throw new Error(`Lamp at Noon OCR validation failed; missing: ${missingSignals.join(", ")}`);
      extractionMethod = "ocr";
      input.reportItems.push({
        role: "question-set",
        source: teacherEntryPath(input.recipe, reading.questionFile) + "#page=9",
        status: "placed",
        destination: "Question Bank: The Lamp at Noon",
        note: "OCR recovered the scanned question page; eight prompts were editorially normalized in the preserved recipe."
      });
    } else if (!reading.questionPrompts) {
      if (questionExtraction.issue) throw new Error(`Could not extract questions from ${reading.questionFile}: ${questionExtraction.issue}`);
      questions = parseNumberedQuestions(questionExtraction.text ?? "");
      if (!questions.length) throw new Error(`No numbered questions were extracted from ${reading.questionFile}.`);
      extractionMethod = questionExtraction.method === "ocr" ? "ocr" : "native";
    }

    readings.push({
      ...reading,
      readingHref: workspaceHrefByFile.get(reading.readingFile) ?? "",
      questionHref: workspaceHrefByFile.get(reading.questionFile) ?? "",
      questions,
      extractionMethod
    });
  }

  for (const exclusion of input.recipe.excludedFiles) {
    const sourceEntry = teacherEntryPath(input.recipe, exclusion.file);
    if (!input.teacherZip.file(sourceEntry)) throw new Error(`Expected excluded file is missing from teacher ZIP: ${sourceEntry}`);
    input.reportItems.push({
      role: "excluded-assessment",
      source: sourceEntry,
      status: "excluded",
      note: exclusion.reason
    });
  }

  const accountedFiles = new Set([...includedFileNames, ...input.recipe.excludedFiles.map((item) => item.file)]);
  const unclassified = Object.keys(input.teacherZip.files)
    .map(normalizeZipPath)
    .filter((entry) => entry.startsWith(`${normalizeZipPath(input.recipe.source.teacherFolder)}/`))
    .map((entry) => path.posix.basename(entry))
    .filter((fileName) => fileName && !accountedFiles.has(fileName));
  for (const fileName of unclassified) {
    input.reportItems.push({
      role: "supporting-resource",
      source: teacherEntryPath(input.recipe, fileName),
      status: "failed",
      note: "Teacher-folder file was not classified by the pilot recipe and was not copied into the learner workspace."
    });
  }

  return readings;
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

function renderMappingMarkdown(report: EnglishBuildReport) {
  const rows = report.items
    .map(
      (item) =>
        `| ${item.status} | ${item.role} | ${item.source.replace(/\|/g, "\\|")} | ${(item.destination ?? "-").replace(/\|/g, "\\|")} | ${item.note.replace(/\|/g, "\\|")} |`
    )
    .join("\n");
  return `# ${report.projectSlug} Source Mapping\n\n- Brightspace unit: ${report.selectedUnit.title} (${report.selectedUnit.identifier})\n- Brightspace lesson pages: ${report.selectedUnit.lessonCount}\n- Placed: ${report.summary.placed}\n- Corrected: ${report.summary.corrected}\n- Excluded: ${report.summary.excluded}\n- Missing: ${report.summary.missing}\n- Failed live/unclassified resources: ${report.summary.failed}\n\n| Status | Role | Source | Destination | Note |\n| --- | --- | --- | --- | --- |\n${rows}\n`;
}

async function writeProjectMetadata(input: {
  args: BuildArgs;
  recipe: EnglishUnitRecipeV1;
  projectDir: string;
  workspaceDir: string;
  metaDir: string;
  brightspaceRawPath: string;
  teacherRawPath: string;
  report: EnglishBuildReport;
}) {
  const projectJsonPath = path.join(input.metaDir, "project.json");
  let existing: Record<string, unknown> = {};
  try {
    existing = JSON.parse(await readFile(projectJsonPath, "utf8"));
  } catch {
    existing = {};
  }
  const now = input.report.generatedAt;
  const workspaceEntry = path.join(input.workspaceDir, "index.html");
  const recipePath = path.join(input.metaDir, "english-unit.json");
  const promptPackPath = path.join(input.metaDir, "prompt-pack.md");
  if (!(await fileExists(promptPackPath))) {
    await writeFile(
      promptPackPath,
      `# ${input.recipe.courseCode} ${input.recipe.courseTitle} Prompt Pack\n\n- Mode: DEFAULT\n- Workflow: conversion\n- Activity profile: short-fiction golden profile\n- Exact Brightspace unit: ${input.recipe.source.brightspaceUnitId}\n- Canonical recipe: projects/${input.args.projectSlug}/meta/english-unit.json\n- Canonical learner source: projects/${input.args.projectSlug}/workspace/index.html\n- Preserved custom source: projects/${input.args.projectSlug}/workspace/components and workspace/assets/custom\n- Rebuild command: npm run build:english-unit -- --project ${input.args.projectSlug}\n\n## Source authority\n\nThe teacher/SPO archive controls the unit organization, assigned texts, and question sets. Brightspace supplies instructional lesson content. The finished Short Stories course supplies the visual and interaction baseline.\n\n## Authoring boundary\n\nEdit the recipe or reusable English renderers for durable decisions; put bespoke code or data under the preserved custom paths. The staged build may replace only declared generated paths.\n\n## Review blocker\n\n- Review the content mapping before changing the project to ready-for-export.\n\nFinal SCORM packaging remains blocked until the project is ready-for-export and project E2E passes.\n`,
      "utf8"
    );
  }
  const projectJson = {
    id: input.args.projectSlug,
    slug: input.args.projectSlug,
    sourcePath: input.brightspaceRawPath,
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
    previewModes: ["workspace"],
    workspaceEntrypoint: workspaceEntry,
    rawEntrypoint: input.brightspaceRawPath,
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
      path.join(repoRoot, "scripts", "build-english-unit.ts"),
      path.join(repoRoot, "scripts", "lib", "english-unit", "render.ts"),
      path.join(repoRoot, "scripts", "lib", "english-unit", "literary-terms.ts"),
      path.join(repoRoot, "scripts", "lib", "next-step-course-shell.ts")
    ],
    generatedOutputs: [],
    regenerateCommand: `npm run build:english-unit -- --project ${input.args.projectSlug}`,
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: input.brightspaceRawPath,
      importedAt: (existing.importedFirstPassOrigin as { importedAt?: string } | undefined)?.importedAt ?? now,
      notes: `${input.recipe.courseCode} ${input.recipe.courseTitle}: Brightspace lesson sequence plus teacher-selected readings and questions.`
    },
    exportTargets: [
      { target: "scorm", enabled: true, notes: "Non-final SCORM 2004 pilot package for Brightspace testing." },
      { target: "html", enabled: true, notes: "Editable local workspace preview." }
    ],
    authoringStatus: "active",
    referenceOnly: [input.brightspaceRawPath, input.teacherRawPath, ELA30_SHORT_STORIES_REFERENCE],
    sourceOfTruthNotes:
      `The editable workspace is generated from meta/english-unit.json, the immutable imported source ZIPs, and scripts/build-english-unit.ts. The teacher/SPO archive controls organization and assigned texts; Brightspace supplies lessons. The finished ELA 30-1 Short Stories workspace is the visual and interaction reference; ${input.recipe.courseCode} content remains course-specific. Edit the recipe or reusable renderer for durable decisions; do not patch exports.`,
    injectedComponents: []
  };
  await writeFile(projectJsonPath, `${JSON.stringify(projectJson, null, 2)}\n`, "utf8");
  const e2ePath = path.join(input.metaDir, "e2e-contract.json");
  await writeEnglishLearnerE2EContract({
    projectSlug: input.args.projectSlug,
    html: await readFile(workspaceEntry, "utf8"),
    contractPath: e2ePath,
    quizTitle: "Question Bank"
  });
  await writeFile(path.join(input.metaDir, "english-unit-mapping.json"), `${JSON.stringify(input.report, null, 2)}\n`, "utf8");
  await writeFile(path.join(input.metaDir, "english-unit-mapping.md"), renderMappingMarkdown(input.report), "utf8");
  await writeFile(
    path.join(input.metaDir, "conversion-notes.md"),
    `# ${input.recipe.courseCode} ${input.recipe.courseTitle}\n\n- Selected Brightspace unit: ${input.report.selectedUnit.title} (${input.recipe.source.brightspaceUnitId})\n- Brightspace lessons imported: ${input.recipe.lessonOrder.length}\n- Learner-facing lesson sequence: ${input.recipe.topLevelLessonOrder.length} lessons\n- Teacher readings: ${input.recipe.readings.length}\n- Assessments intentionally excluded: ${input.recipe.excludedFiles.length}\n- Source authority: the teacher/SPO archive controls unit organization and assigned texts; Brightspace supplies instructional lessons\n- Visual and interaction reference: projects/ela30-1-short-stories/workspace/index.html\n- Canonical recipe: projects/${input.args.projectSlug}/meta/english-unit.json\n- Canonical workspace: projects/${input.args.projectSlug}/workspace/index.html\n- Rebuild: npm run build:english-unit -- --project ${input.args.projectSlug}\n\nThe recipe is preserved across rebuilds. The workspace is generated and may be replaced.\n`,
    "utf8"
  );
}

export async function buildEnglishUnit(args: BuildArgs) {
  const projectDir = path.join(repoRoot, "projects", args.projectSlug);
  const workspaceDir = path.join(projectDir, "workspace");
  const metaDir = path.join(projectDir, "meta");
  const rawDir = path.join(projectDir, "raw");
  const resourceDir = path.join(repoRoot, "projects", "resources", args.projectSlug);
  const existingRecipePath = path.join(metaDir, "english-unit.json");
  if (await fileExists(existingRecipePath)) {
    const existingRecipe = JSON.parse(await readFile(existingRecipePath, "utf8")) as { schemaVersion?: number };
    if (existingRecipe.schemaVersion === 2 || existingRecipe.schemaVersion === 3) {
      return buildEnglishFactoryProject({ repoRoot, projectSlug: args.projectSlug });
    }
  }
  const prepared = await prepareRecipe(args, projectDir, metaDir, rawDir);

  await mkdir(resourceDir, { recursive: true });
  const reportItems: EnglishBuildReportItem[] = [];
  const brightspaceBuffer = await readFile(prepared.brightspaceRawPath);
  const teacherBuffer = await readFile(prepared.teacherRawPath);
  const brightspaceZip = await JSZip.loadAsync(brightspaceBuffer);
  const teacherZip = await JSZip.loadAsync(teacherBuffer);
  let unit: Awaited<ReturnType<typeof loadBrightspaceUnit>>;
  let readings: EnglishBuiltReading[] = [];
  let videos: Array<{ id: string; lessonTitle: string; embedSrc: string }> = [];
  const digest = (value: Buffer | string) => createHash("sha256").update(value).digest("hex");
  const promotion = await stageAndPromoteEnglishWorkspace({
    workspaceDir,
    ownedPaths: [
      { path: "index.html", kind: "file" },
      { path: "assets/brand", kind: "directory" },
      { path: "assets/lessons", kind: "directory" },
      { path: "assets/readings", kind: "directory" },
      { path: "resources/generated", kind: "directory" }
    ],
    metadata: {
      projectSlug: prepared.recipe.projectSlug,
      status: "needs-review",
      profile: { id: "short-fiction", version: "next-step-english-v1", sha256: digest(JSON.stringify(prepared.recipe)) },
      recipe: { path: path.relative(repoRoot, prepared.recipePath).replaceAll(path.sep, "/"), sha256: digest(await readFile(prepared.recipePath)) },
      sources: [
        { id: "brightspace", path: path.relative(repoRoot, prepared.brightspaceRawPath).replaceAll(path.sep, "/"), sha256: digest(brightspaceBuffer) },
        { id: "teacher-resources", path: path.relative(repoRoot, prepared.teacherRawPath).replaceAll(path.sep, "/"), sha256: digest(teacherBuffer) }
      ],
      reviewItems: ["Review the pilot content mapping before changing the project to ready-for-export."]
    },
    async buildStage({ stageDir }) {
      await mkdir(path.join(stageDir, "assets", "brand"), { recursive: true });
      await mkdir(path.join(stageDir, "resources", "generated"), { recursive: true });
      await copyFile(LOGO_SOURCE, path.join(stageDir, "assets", "brand", "nxt-ce-logo-white-with-ce.png"));
      unit = await loadBrightspaceUnit({ zip: brightspaceZip, workspaceDir: stageDir, recipe: prepared.recipe, reportItems });
      readings = await buildReadings({ recipe: prepared.recipe, teacherZip, workspaceDir: stageDir, resourceDir, reportItems });
      videos = collectVerifiedVideos(unit.lessons, prepared.recipe);
      const html = renderEnglishUnit({ recipe: prepared.recipe, lessons: unit.lessons, readings, videos });
      const forbiddenLearnerPhrases = [
        "HARD GATE",
        "SOFT GATE",
        "Diploma Exam",
        "diploma exam",
        "Part A (Written)",
        ...(prepared.recipe.courseCode === "ELA 10-1"
          ? ["ELA 20-1", "English 20-1", "ELA 30-1", "English 30-1"]
          : ["ELA 30-1", "English 30-1"])
      ];
      const leaked = forbiddenLearnerPhrases.filter((phrase) => html.includes(phrase));
      if (leaked.length) throw new Error(`Forbidden learner-facing content remains: ${leaked.join(", ")}`);
      await writeFile(path.join(stageDir, "index.html"), html, "utf8");
    }
  });
  await writeFile(path.join(metaDir, "english-unit-build.json"), `${JSON.stringify(promotion.manifest, null, 2)}\n`, "utf8");

  const generatedAt = new Date().toISOString();
  const report: EnglishBuildReport = {
    schemaVersion: 1,
    projectSlug: args.projectSlug,
    generatedAt,
    selectedUnit: { identifier: prepared.recipe.source.brightspaceUnitId, title: unit!.title, lessonCount: unit!.lessons.length },
    summary: reportSummary(reportItems),
    items: reportItems
  };
  await writeProjectMetadata({
    args,
    recipe: prepared.recipe,
    projectDir,
    workspaceDir,
    metaDir,
    brightspaceRawPath: prepared.brightspaceRawPath,
    teacherRawPath: prepared.teacherRawPath,
    report
  });

  return { projectSlug: args.projectSlug, workspaceEntry: path.join(workspaceDir, "index.html"), report, readings, videos };
}

async function main() {
  const result = await buildEnglishUnit(parseBuildArgs());
  console.log(`Built ${result.projectSlug}`);
  console.log(`Workspace: ${result.workspaceEntry}`);
  console.log(`Lessons: ${result.report.selectedUnit.lessonCount}`);
  console.log(`Readings/resources: ${"readings" in result ? result.readings.length : result.resourceCount}`);
  console.log(`Verified videos: ${"videos" in result ? result.videos.length : result.videoCount}`);
  console.log(`Excluded items: ${result.report.summary.excluded}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
