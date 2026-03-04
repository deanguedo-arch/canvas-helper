import { readFile } from "node:fs/promises";
import path from "node:path";

import mammoth from "mammoth";
import { load } from "cheerio";
import pdf from "pdf-parse";

import { ensureDir, fileExists, listFilesRecursive, removePath, writeJsonFile, writeTextFile } from "./fs.js";
import { getProjectPaths } from "./paths.js";
import { loadProjectManifest } from "./projects.js";
import type { ReferenceIndex, ReferenceKind, ReferenceManifest } from "./types.js";

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

async function extractText(referencePath: string, kind: ReferenceKind) {
  switch (kind) {
    case "txt":
    case "md":
      return readFile(referencePath, "utf8");
    case "html": {
      const html = await readFile(referencePath, "utf8");
      const $ = load(html);
      return $.text().replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    }
    case "pdf": {
      const buffer = await readFile(referencePath);
      const parsed = await pdf(buffer);
      return parsed.text.trim();
    }
    case "docx": {
      const result = await mammoth.extractRawText({ path: referencePath });
      return result.value.trim();
    }
    default:
      return null;
  }
}

export async function extractProjectReferences(projectSlug: string) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);

  await ensureDir(paths.referencesRawDir);
  await removePath(paths.referencesExtractedDir);
  await ensureDir(paths.referencesExtractedDir);

  const files = (await fileExists(paths.referencesRawDir)) ? await listFilesRecursive(paths.referencesRawDir) : [];
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
      const extractedText = await extractText(filePath, kind);
      if (extractedText) {
        const outputPath = path.join(paths.referencesExtractedDir, `${reference.id}.txt`);
        await writeTextFile(outputPath, `${extractedText}\n`);
        reference.extractedTextPath = outputPath;
        reference.extractionStatus = "indexed";
      }
    } catch {
      reference.extractionStatus = "failed";
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
