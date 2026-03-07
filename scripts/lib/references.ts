import { readFile } from "node:fs/promises";
import path from "node:path";

import mammoth from "mammoth";
import { load } from "cheerio";

import { ensureDir, fileExists, listFilesRecursive, removePath, writeJsonFile, writeTextFile } from "./fs.js";
import { getProjectPaths } from "./paths.js";
import { extractPdfTextWithFallback } from "./pdf-text.js";
import { loadProjectManifest } from "./projects.js";
import type { ReferenceExtractionMethod, ReferenceIndex, ReferenceKind, ReferenceManifest } from "./types.js";

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
};

async function extractText(referencePath: string, kind: ReferenceKind): Promise<ExtractedReferenceText> {
  switch (kind) {
    case "txt":
    case "md":
      return {
        text: await readFile(referencePath, "utf8"),
        extractionMethod: "native",
        extractionIssue: null
      };
    case "html": {
      const html = await readFile(referencePath, "utf8");
      const $ = load(html);
      return {
        text: $.text().replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim(),
        extractionMethod: "native",
        extractionIssue: null
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
              : null
      }));
    case "docx": {
      const result = await mammoth.extractRawText({ path: referencePath });
      return {
        text: result.value.trim(),
        extractionMethod: "native",
        extractionIssue: null
      };
    }
    default:
      return {
        text: null,
        extractionMethod: null,
        extractionIssue: null
      };
  }
}

export async function extractProjectReferences(projectSlug: string) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);

  await ensureDir(paths.resourceDir);
  await removePath(paths.referencesExtractedDir);
  await ensureDir(paths.referencesExtractedDir);

  const files = (await fileExists(paths.referencesRawDir))
    ? (await listFilesRecursive(paths.referencesRawDir)).filter((filePath) => {
        const relativePath = path.relative(paths.referencesRawDir, filePath).replace(/\\/g, "/");
        return relativePath !== "_extracted" && !relativePath.startsWith("_extracted/");
      })
    : [];
  const references: ReferenceManifest[] = [];

  for (const filePath of files.sort((left, right) => left.localeCompare(right))) {
    const relativePath = path.relative(paths.referencesRawDir, filePath);
    const kind = kindFromExtension(filePath);
    const reference: ReferenceManifest = {
      id: toReferenceId(relativePath),
      originalPath: filePath,
      kind,
      extractionStatus: "stored-only"
    };

    try {
      const extracted = await extractText(filePath, kind);
      if (extracted.extractionIssue) {
        reference.extractionStatus = "failed";
        reference.extractionIssue = extracted.extractionIssue;
        console.warn(`[refs] ${projectSlug}/${relativePath}: ${extracted.extractionIssue}`);
        references.push(reference);
        continue;
      }

      if (extracted.text) {
        const outputPath = path.join(paths.referencesExtractedDir, `${reference.id}.txt`);
        await writeTextFile(outputPath, `${extracted.text}\n`);
        if (extracted.extractionMethod) {
          reference.extractionMethod = extracted.extractionMethod;
        }
        reference.extractedTextPath = outputPath;
        reference.extractionStatus = "indexed";
      }
    } catch (error) {
      reference.extractionStatus = "failed";
      reference.extractionIssue = error instanceof Error ? error.message : String(error);
      console.warn(`[refs] ${projectSlug}/${relativePath}: ${reference.extractionIssue}`);
    }

    references.push(reference);
  }

  const referenceIndex: ReferenceIndex = {
    projectId: manifest.id,
    generatedAt: new Date().toISOString(),
    references
  };

  await writeJsonFile(paths.referenceIndexPath, referenceIndex);
  return referenceIndex;
}
