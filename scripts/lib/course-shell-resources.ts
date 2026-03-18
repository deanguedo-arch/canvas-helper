import { readFile } from "node:fs/promises";

import { fileExists } from "./fs.js";
import type { ReferenceIndex, ResourceCatalog, ResourceCatalogEntry, ReferenceManifest } from "./types.js";

export type CourseShellActivitySourceMetadata = {
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

async function previewFromExtractedText(
  reference: ReferenceManifest | ResourceCatalogEntry,
  previewMaxLength: number
) {
  const extractedPath = reference.extractedTextPath;
  if (!extractedPath) {
    return "";
  }
  if (!(await fileExists(extractedPath))) {
    return "";
  }
  try {
    const text = await readFile(extractedPath, "utf8");
    return normalizePreview(text, previewMaxLength);
  } catch {
    return "";
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

    const contentPreview = await previewFromExtractedText(reference, previewMaxLength);
    if (!contentPreview) {
      continue;
    }

    sourceMetadataByHref[relativePath] = {
      contentPreview
    };
  }

  return sourceMetadataByHref;
}
