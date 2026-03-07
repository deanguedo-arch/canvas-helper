import path from "node:path";
import { copyFile, readdir, readFile, stat, writeFile } from "node:fs/promises";

import { ensureDir, fileExists, listFilesRecursive, removePath, writeJsonFile } from "../fs.js";
import { assessmentsRoot, getAssessmentPaths } from "../paths.js";
import { createEmptyAssessmentProject, normalizeAssessmentProject } from "./model.js";
import type {
  AssessmentImportResult,
  AssessmentLibraryItem,
  AssessmentLibrarySummary,
  AssessmentProject,
  AssessmentProjectInput,
  BrightspaceExportResult,
  Question
} from "./schema.js";
import { AssessmentProjectSchema } from "./schema.js";
import { validateAssessmentProject } from "./validation.js";
import { exportAssessmentBrightspaceCsv } from "./export-brightspace.js";
import { parseDocxToAssessment } from "./ingest/docx.js";
import { parsePdfToAssessment } from "./ingest/pdf.js";

function toAssessmentSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePromptKey(question: Question) {
  return question.prompt.toLowerCase().replace(/\s+/g, " ").trim();
}

function questionQualityScore(question: Question) {
  if (question.type === "multiple_choice") {
    const populatedChoices = question.choices.filter((choice) => choice.text.trim().length > 0).length;
    return 100 + populatedChoices;
  }
  if (question.type === "matching") {
    return 98 + question.choices.length;
  }
  if (question.type === "true_false") {
    return 96 + question.choices.length;
  }
  if (question.type === "multi_select") {
    return 90 + question.choices.filter((choice) => choice.text.trim().length > 0).length;
  }
  if (question.type === "ordering") {
    return 88 + question.choices.length;
  }
  if (question.type === "short_answer") {
    return 30 + question.correctAnswers.filter((answer) => answer.trim().length > 0).length;
  }
  return 10;
}

function mergeQuestions(existingQuestions: Question[], incomingQuestions: Question[]) {
  const merged: Question[] = [];
  const indexByPrompt = new Map<string, number>();

  function addOrUpgrade(question: Question) {
    const key = normalizePromptKey(question);
    const existingIndex = indexByPrompt.get(key);
    if (existingIndex === undefined) {
      indexByPrompt.set(key, merged.length);
      merged.push(question);
      return;
    }

    if (questionQualityScore(question) > questionQualityScore(merged[existingIndex])) {
      merged[existingIndex] = question;
    }
  }

  for (const question of existingQuestions) {
    addOrUpgrade(question);
  }
  for (const question of incomingQuestions) {
    addOrUpgrade(question);
  }

  return merged;
}

async function parseSourceFile(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".pdf") {
    return parsePdfToAssessment(filePath);
  }
  if (extension === ".docx") {
    return parseDocxToAssessment(filePath);
  }

  return {
    sourceDocument: {
      sourceDocumentId: `source_${Date.now().toString(36)}`,
      name: path.basename(filePath),
      type: "manual" as const,
      origin: filePath,
      importedAt: new Date().toISOString()
    },
    extractedText: "",
    questions: [],
    confidenceScore: 0,
    issues: [
      {
        code: "unsupported_source_type",
        severity: "warning" as const,
        message: `Unsupported source type: ${extension || "unknown"}.`,
        sourcePage: null
      }
    ],
    candidateDiagnostics: []
  };
}

export async function ensureAssessmentLibraryRoot() {
  await ensureDir(assessmentsRoot);
}

export async function listAssessmentLibrarySummaries(): Promise<AssessmentLibrarySummary[]> {
  await ensureAssessmentLibraryRoot();
  const entries = await readdir(assessmentsRoot, { withFileTypes: true });
  const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  const summaries = await Promise.all(
    slugs.map(async (slug): Promise<AssessmentLibrarySummary | null> => {
      const paths = getAssessmentPaths(slug);
      if (!(await fileExists(paths.assessmentProjectPath))) {
        return null;
      }
      const project = AssessmentProjectSchema.parse(JSON.parse(await readFile(paths.assessmentProjectPath, "utf8")));
      return {
        slug,
        title: project.title,
        updatedAt: project.updatedAt,
        questionCount: project.questions.length,
        sourceCount: project.sourceDocuments.length
      };
    })
  );

  return summaries
    .filter((summary): summary is AssessmentLibrarySummary => Boolean(summary))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function readAssessmentLibraryItem(slug: string): Promise<AssessmentLibraryItem> {
  const paths = getAssessmentPaths(slug);
  if (!(await fileExists(paths.assessmentProjectPath))) {
    throw new Error(`Assessment "${slug}" not found.`);
  }
  const project = AssessmentProjectSchema.parse(JSON.parse(await readFile(paths.assessmentProjectPath, "utf8")));
  const importResult = (await fileExists(paths.importResultPath))
    ? (JSON.parse(await readFile(paths.importResultPath, "utf8")) as AssessmentImportResult)
    : null;
  return {
    slug,
    project,
    importResult,
    validation: validateAssessmentProject(project)
  };
}

export async function saveAssessmentLibraryProject(slug: string, projectInput: AssessmentProjectInput) {
  const paths = getAssessmentPaths(slug);
  const normalized = normalizeAssessmentProject(projectInput);
  await ensureDir(paths.root);
  await writeJsonFile(paths.assessmentProjectPath, normalized);
  return readAssessmentLibraryItem(slug);
}

export async function deleteAssessmentLibraryItem(slug: string) {
  const paths = getAssessmentPaths(slug);
  await removePath(paths.root);
}

export async function importAssessmentSources(options: {
  inputPaths: string[];
  sourceFileNames?: string[];
  slug?: string;
  title?: string;
}): Promise<AssessmentLibraryItem> {
  if (options.inputPaths.length === 0) {
    throw new Error("No input files provided for assessment import.");
  }

  const firstName = path.basename(options.sourceFileNames?.[0] ?? options.inputPaths[0] ?? "assessment");
  const derivedSlug = toAssessmentSlug(path.basename(firstName, path.extname(firstName))) || "assessment";
  const slug = toAssessmentSlug(options.slug ?? derivedSlug) || `assessment-${Date.now().toString(36)}`;
  const paths = getAssessmentPaths(slug);
  await ensureDir(paths.root);
  await ensureDir(paths.sourceDir);
  await ensureDir(paths.brightspaceExportDir);

  const existingProject =
    (await fileExists(paths.assessmentProjectPath))
      ? AssessmentProjectSchema.parse(JSON.parse(await readFile(paths.assessmentProjectPath, "utf8")))
      : createEmptyAssessmentProject({
          projectId: slug,
          title: options.title ?? path.basename(firstName, path.extname(firstName))
        });

  const importTimestamp = new Date().toISOString();
  const sourceResults: AssessmentImportResult["sourceResults"] = [];
  let mergedQuestions = [...existingProject.questions];
  const mergedSourceDocuments = [...existingProject.sourceDocuments];
  const diagnostics: string[] = [];

  for (const [index, inputPath] of options.inputPaths.entries()) {
    const preferredSourceFileName = path.basename(options.sourceFileNames?.[index] ?? inputPath);
    const sourceFileName = (await fileExists(path.join(paths.sourceDir, preferredSourceFileName)))
      ? `${path.basename(preferredSourceFileName, path.extname(preferredSourceFileName))}-${Date.now().toString(36)}${path.extname(preferredSourceFileName)}`
      : preferredSourceFileName;
    const targetPath = path.join(paths.sourceDir, sourceFileName);
    await copyFile(inputPath, targetPath);

    const parsed = await parseSourceFile(targetPath);
    mergedQuestions = mergeQuestions(mergedQuestions, parsed.questions);

    if (!mergedSourceDocuments.some((source) => source.origin === targetPath && source.name === parsed.sourceDocument.name)) {
      mergedSourceDocuments.push(parsed.sourceDocument);
    }

    const methodAware = parsed as Awaited<ReturnType<typeof parsePdfToAssessment>>;
    sourceResults.push({
      sourcePath: targetPath,
      fileName: sourceFileName,
      sourceDocument: parsed.sourceDocument,
      confidenceScore: parsed.confidenceScore,
      questionCount: parsed.questions.length,
      issues: parsed.issues,
      candidateDiagnostics: parsed.candidateDiagnostics,
      extractionMethod: methodAware.extractionMethod,
      pageCount: methodAware.pageCount
    });

    diagnostics.push(
      `${sourceFileName}: parsed ${parsed.questions.length} question(s), confidence ${parsed.confidenceScore.toFixed(2)}.`
    );
  }

  const nextProject: AssessmentProject = normalizeAssessmentProject({
    ...existingProject,
    projectId: slug,
    title: options.title ?? existingProject.title,
    sourceDocuments: mergedSourceDocuments,
    questions: mergedQuestions
  });

  const importResult: AssessmentImportResult = {
    assessmentSlug: slug,
    importedAt: importTimestamp,
    sourceResults,
    mergedQuestionCount: nextProject.questions.length,
    diagnostics
  };

  await writeJsonFile(paths.assessmentProjectPath, nextProject);
  await writeJsonFile(paths.importResultPath, importResult);

  return readAssessmentLibraryItem(slug);
}

export async function exportAssessmentLibraryItemBrightspace(slug: string): Promise<BrightspaceExportResult> {
  const paths = getAssessmentPaths(slug);
  if (!(await fileExists(paths.assessmentProjectPath))) {
    throw new Error(`Assessment "${slug}" not found.`);
  }

  const project = AssessmentProjectSchema.parse(JSON.parse(await readFile(paths.assessmentProjectPath, "utf8")));
  const exportResult = exportAssessmentBrightspaceCsv(project);
  await ensureDir(paths.brightspaceExportDir);

  if (exportResult.content) {
    await writeFile(paths.brightspaceCsvPath, exportResult.content, "utf8");
  }

  const nextProject: AssessmentProject = {
    ...project,
    updatedAt: new Date().toISOString(),
    exportHistory: [
      {
        exportId: `export_${Date.now().toString(36)}`,
        format: "brightspace_csv" as const,
        exportedAt: new Date().toISOString(),
        status: exportResult.status,
        fileName: exportResult.fileName,
        notes: exportResult.diagnostics.map((diagnostic) => `${diagnostic.severity}:${diagnostic.code}`).join("; ")
      },
      ...project.exportHistory
    ].slice(0, 20)
  };

  await writeJsonFile(paths.assessmentProjectPath, nextProject);
  return exportResult;
}

export async function collectAssessmentInputPaths(inputPath: string): Promise<string[]> {
  const resolved = path.resolve(inputPath);
  if (!(await fileExists(resolved))) {
    throw new Error(`Input path not found: ${resolved}`);
  }

  const targetStat = await stat(resolved);
  if (targetStat.isFile()) {
    const extension = path.extname(resolved).toLowerCase();
    return extension === ".pdf" || extension === ".docx" ? [resolved] : [];
  }

  if (!targetStat.isDirectory()) {
    return [];
  }

  const files = await listFilesRecursive(resolved);
  return files.filter((filePath) => {
    const extension = path.extname(filePath).toLowerCase();
    return extension === ".pdf" || extension === ".docx";
  });
}
