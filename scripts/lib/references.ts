import { readFile } from "node:fs/promises";
import path from "node:path";

import mammoth from "mammoth";
import { load } from "cheerio";

import {
  chunkPdfPages,
  chunkTextBySections,
  classifyResource,
  extractSectionHeadings,
  guessTitleFromText
} from "./curriculum-heuristics.js";
import { ensureDir, fileExists, listFilesRecursive, removePath, writeJsonFile, writeTextFile } from "./fs.js";
import { getProjectPaths } from "./paths.js";
import { extractPdfTextWithFallback, inspectPdfOcrSupport } from "./pdf-text.js";
import { loadProjectManifest } from "./projects.js";
import type {
  ReferenceChunk,
  ReferenceChunkManifest,
  ReferenceExtractionMethod,
  ReferenceIndex,
  ReferenceKind,
  ReferenceManifest,
  ResourceCatalog,
  ResourceCatalogEntry
} from "./types.js";

function toReferenceId(relativePath: string) {
  return relativePath
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function kindFromExtension(filePath: string): ReferenceKind {
  switch (path.extname(filePath).toLowerCase()) {
    case ".txt":
      return "txt";
    case ".md":
      return "md";
    case ".html":
    case ".htm":
      return "html";
    case ".pdf":
      return "pdf";
    case ".docx":
      return "docx";
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".gif":
    case ".webp":
    case ".svg":
      return "image";
    default:
      return "other";
  }
}

type ExtractedReferenceText = {
  text: string | null;
  extractionMethod: ReferenceExtractionMethod | null;
  extractionIssue: string | null;
  pages: Array<{ page: number; text: string }>;
  pageCount: number;
};

async function extractText(referencePath: string, kind: ReferenceKind): Promise<ExtractedReferenceText> {
  switch (kind) {
    case "txt":
    case "md":
      return {
        text: await readFile(referencePath, "utf8"),
        extractionMethod: "native",
        extractionIssue: null,
        pages: [],
        pageCount: 0
      };
    case "html": {
      const html = await readFile(referencePath, "utf8");
      const $ = load(html);
      return {
        text: $.text().replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim(),
        extractionMethod: "native",
        extractionIssue: null,
        pages: [],
        pageCount: 0
      };
    }
    case "pdf":
      return extractPdfTextWithFallback(referencePath).then((result) => ({
        text: result.text,
        extractionMethod: result.method,
        extractionIssue:
          result.issue && result.issue.includes("Add an OCR-readable PDF")
            ? result.issue
            : result.issue
              ? `${result.issue} Add an OCR-readable PDF or a clean .txt/.docx copy.`
              : null,
        pages: result.pages,
        pageCount: result.pageCount
      }));
    case "docx": {
      const result = await mammoth.extractRawText({ path: referencePath });
      return {
        text: result.value.trim(),
        extractionMethod: "native",
        extractionIssue: null,
        pages: [],
        pageCount: 0
      };
    }
    default:
      return {
        text: null,
        extractionMethod: null,
        extractionIssue: null,
        pages: [],
        pageCount: 0
      };
  }
}

function toChunkManifestPath(extractedDir: string, referenceId: string) {
  return path.join(extractedDir, `${referenceId}.chunks.json`);
}

function toExtractedTextPath(extractedDir: string, referenceId: string) {
  return path.join(extractedDir, `${referenceId}.txt`);
}

async function removeStaleExtractedArtifacts(extractedDir: string, activeReferenceIds: Set<string>) {
  if (!(await fileExists(extractedDir))) {
    return;
  }

  for (const filePath of await listFilesRecursive(extractedDir)) {
    const fileName = path.basename(filePath);
    const referenceId = fileName.endsWith(".chunks.json")
      ? fileName.slice(0, -".chunks.json".length)
      : fileName.endsWith(".txt")
        ? fileName.slice(0, -".txt".length)
        : null;

    if (!referenceId || activeReferenceIds.has(referenceId)) {
      continue;
    }

    await removePath(filePath);
  }
}

function buildChunks(kind: ReferenceKind, titleGuess: string, extracted: ExtractedReferenceText) {
  if (!extracted.text) {
    return [] as ReferenceChunk[];
  }

  if (kind === "pdf" && extracted.pages.length > 0) {
    return chunkPdfPages(extracted.pages, titleGuess);
  }

  return chunkTextBySections(extracted.text, titleGuess);
}

export async function extractProjectReferences(projectSlug: string) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);

  await ensureDir(paths.resourceDir);
  await ensureDir(paths.referencesExtractedDir);

  const files = (await fileExists(paths.referencesRawDir))
    ? (await listFilesRecursive(paths.referencesRawDir)).filter((filePath) => {
        const relativePath = path.relative(paths.referencesRawDir, filePath).replace(/\\/g, "/");
        return relativePath !== "_extracted" && !relativePath.startsWith("_extracted/");
      })
    : [];
  const references: ReferenceManifest[] = [];
  const catalogEntries: ResourceCatalogEntry[] = [];
  const warnings: string[] = [];
  const activeReferenceIds = new Set(
    files.map((filePath) =>
      toReferenceId(path.relative(paths.referencesRawDir, filePath).replace(/\\/g, "/"))
    )
  );
  const pdfFiles = files.filter((filePath) => kindFromExtension(filePath) === "pdf");

  if (pdfFiles.length > 0) {
    const ocrSupport = await inspectPdfOcrSupport();
    if (!ocrSupport.available) {
      const warning = `OCR fallback is unavailable because ${ocrSupport.missing.join(" and ")} ${
        ocrSupport.missing.length === 1 ? "is" : "are"
      } missing. ${pdfFiles.length} PDF resource(s) may stay failed if they need OCR. Existing extracted outputs for unchanged resources will be preserved until the toolchain is available.`;
      warnings.push(warning);
      console.warn(`[refs] ${warning}`);
    }
  }

  for (const filePath of files.sort((left, right) => left.localeCompare(right))) {
    const relativePath = path.relative(paths.referencesRawDir, filePath).replace(/\\/g, "/");
    const kind = kindFromExtension(filePath);
    const reference: ReferenceManifest = {
      id: toReferenceId(relativePath),
      originalPath: filePath,
      relativePath,
      kind,
      extractionStatus: "stored-only"
    };
    let catalogEntry: ResourceCatalogEntry | null = null;

    try {
      const extracted = await extractText(filePath, kind);
      const titleGuess = guessTitleFromText(extracted.text ?? "", relativePath);
      const classification = classifyResource(relativePath, titleGuess, extracted.text);
      const chunks = buildChunks(kind, titleGuess, extracted);

      reference.titleGuess = titleGuess;
      reference.resourceCategory = classification.resourceCategory;
      reference.authorityRole = classification.authorityRole;
      reference.blueprintSignals = classification.blueprintSignals;
      reference.assessmentSignals = classification.assessmentSignals;
      reference.supportSignals = classification.supportSignals;
      reference.pageCount = extracted.pageCount || undefined;
      reference.sectionLabels = extracted.text ? extractSectionHeadings(extracted.text) : [];
      reference.chunkCount = chunks.length;

      if (extracted.extractionIssue) {
        reference.extractionStatus = "failed";
        reference.extractionIssue = extracted.extractionIssue;
        console.warn(`[refs] ${projectSlug}/${relativePath}: ${extracted.extractionIssue}`);
      } else if (extracted.text) {
        const outputPath = toExtractedTextPath(paths.referencesExtractedDir, reference.id);
        await writeTextFile(outputPath, `${extracted.text}\n`);
        if (extracted.extractionMethod) {
          reference.extractionMethod = extracted.extractionMethod;
        }
        reference.extractedTextPath = outputPath;
        reference.extractionStatus = "indexed";

        if (chunks.length > 0) {
          const chunkManifestPath = toChunkManifestPath(paths.referencesExtractedDir, reference.id);
          const chunkManifest: ReferenceChunkManifest = {
            projectId: manifest.id,
            referenceId: reference.id,
            generatedAt: new Date().toISOString(),
            chunks
          };
          await writeJsonFile(chunkManifestPath, chunkManifest);
          reference.chunkManifestPath = chunkManifestPath;
        } else {
          await removePath(toChunkManifestPath(paths.referencesExtractedDir, reference.id));
        }
      }

      catalogEntry = {
        id: reference.id,
        originalPath: reference.originalPath,
        relativePath,
        kind,
        extractionStatus: reference.extractionStatus,
        extractionMethod: reference.extractionMethod,
        extractedTextPath: reference.extractedTextPath,
        extractionIssue: reference.extractionIssue,
        chunkManifestPath: reference.chunkManifestPath,
        chunkCount: reference.chunkCount ?? 0,
        pageCount: reference.pageCount,
        sectionLabels: reference.sectionLabels,
        titleGuess: reference.titleGuess ?? titleGuess,
        resourceCategory: reference.resourceCategory ?? classification.resourceCategory,
        authorityRole: reference.authorityRole ?? classification.authorityRole,
        blueprintSignals: reference.blueprintSignals ?? classification.blueprintSignals,
        assessmentSignals: reference.assessmentSignals ?? classification.assessmentSignals,
        supportSignals: reference.supportSignals ?? classification.supportSignals
      };

      if (catalogEntry.extractionStatus !== "indexed" && kind !== "image" && kind !== "other") {
        warnings.push(`${relativePath}: extraction did not produce indexed text`);
      }
    } catch (error) {
      reference.extractionStatus = "failed";
      reference.extractionIssue = error instanceof Error ? error.message : String(error);
      console.warn(`[refs] ${projectSlug}/${relativePath}: ${reference.extractionIssue}`);
    }

    references.push(reference);
    catalogEntries.push(
      catalogEntry ?? {
        id: reference.id,
        originalPath: reference.originalPath,
        relativePath: reference.relativePath ?? relativePath,
        kind,
        extractionStatus: reference.extractionStatus,
        extractionMethod: reference.extractionMethod,
        extractedTextPath: reference.extractedTextPath,
        extractionIssue: reference.extractionIssue,
        chunkManifestPath: reference.chunkManifestPath,
        chunkCount: reference.chunkCount ?? 0,
        pageCount: reference.pageCount,
        sectionLabels: reference.sectionLabels,
        titleGuess: reference.titleGuess ?? guessTitleFromText("", relativePath),
        resourceCategory: reference.resourceCategory ?? "other",
        authorityRole: reference.authorityRole ?? "supporting-only",
        blueprintSignals: reference.blueprintSignals ?? [],
        assessmentSignals: reference.assessmentSignals ?? [],
        supportSignals: reference.supportSignals ?? []
      }
    );
  }

  await removeStaleExtractedArtifacts(paths.referencesExtractedDir, activeReferenceIds);

  const referenceIndex: ReferenceIndex = {
    projectId: manifest.id,
    generatedAt: new Date().toISOString(),
    references
  };
  const resourceCatalog: ResourceCatalog = {
    projectId: manifest.id,
    generatedAt: new Date().toISOString(),
    resources: catalogEntries,
    warnings
  };

  await writeJsonFile(paths.referenceIndexPath, referenceIndex);
  await writeJsonFile(paths.resourceCatalogPath, resourceCatalog);
  return referenceIndex;
}
