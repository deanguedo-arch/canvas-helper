import { readFile } from "node:fs/promises";

import { fileExists } from "./fs.js";
import type { ReferenceIndex, ResourceCatalog, ResourceCatalogEntry, ReferenceManifest } from "./types.js";

export type CourseShellActivitySourceMetadata = {
  contentBody: string;
  contentPreview: string;
};

export type BuildCourseShellSourceMetadataOptions = {
  referenceIndex?: ReferenceIndex | null;
  resourceCatalog?: ResourceCatalog | null;
  previewMaxLength?: number;
};

function normalizePath(value: string) {
  return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}

function normalizePreview(value: string, maxLength: number) {
  const flattened = value.replace(/\s+/g, " ").trim();
  if (!flattened) {
    return "";
  }
  if (flattened.length <= maxLength) {
    return flattened;
  }
  return `${flattened.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function normalizeBody(value: string) {
  return value.replace(/\r/g, "").replace(/\u00a0/g, " ").trim();
}

async function readExtractedText(
  reference: ReferenceManifest | ResourceCatalogEntry,
) {
  const extractedPath = reference.extractedTextPath;
  if (!extractedPath) {
    return null;
  }
  if (!(await fileExists(extractedPath))) {
    return null;
  }
  try {
    return await readFile(extractedPath, "utf8");
  } catch {
    return null;
  }
}

export async function buildCourseShellSourceMetadataByHref(
  options: BuildCourseShellSourceMetadataOptions
) {
  const previewMaxLength = options.previewMaxLength ?? 220;
  const sourceMetadataByHref: Record<string, CourseShellActivitySourceMetadata> = {};
  const references = [
    ...(options.referenceIndex?.references ?? []),
    ...(options.resourceCatalog?.resources ?? [])
  ];

  for (const reference of references) {
    const relativePath = normalizePath(reference.relativePath || "");
    if (!relativePath) {
      continue;
    }

    if (sourceMetadataByHref[relativePath]?.contentPreview?.length) {
      continue;
    }

    const extractedText = await readExtractedText(reference);
    if (!extractedText) {
      continue;
    }

    sourceMetadataByHref[relativePath] = {
      contentBody: normalizeBody(extractedText),
      contentPreview: normalizePreview(extractedText, previewMaxLength)
    };
  }

  return sourceMetadataByHref;
}
