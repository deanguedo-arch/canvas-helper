import path from "node:path";

import { fileExists, readJsonFile } from "../fs.js";
import { getProjectPaths } from "../paths.js";
import type { ReferenceChunkManifest, ResourceCatalog } from "../types.js";
import type { SourceChunk } from "./types.js";

type SourceResourceSelection = {
  sourceReferenceId: string | null;
  sourceTitle: string;
  sourcePdfUrl: string | null;
  sourceChunks: SourceChunk[];
};

function getChunkPage(chunk: ReferenceChunkManifest["chunks"][number]) {
  if (chunk.locator.page) {
    return chunk.locator.page;
  }

  if (chunk.locator.startPage) {
    return chunk.locator.startPage;
  }

  return null;
}

function normalizeChunk(chunk: ReferenceChunkManifest["chunks"][number]): SourceChunk {
  return {
    id: chunk.id,
    index: chunk.index,
    page: getChunkPage(chunk),
    text: chunk.text
  };
}

function resolveCatalogChunkManifestPath(projectSlug: string, chunkManifestPath: string) {
  if (path.isAbsolute(chunkManifestPath)) {
    return chunkManifestPath;
  }

  return path.join(getProjectPaths(projectSlug).resourceExtractedDir, chunkManifestPath);
}

function findPreferredPdfResource(catalog: ResourceCatalog) {
  return catalog.resources.find((resource) => resource.kind === "pdf" && resource.chunkManifestPath) ?? null;
}

export async function loadProjectSourceSelection(projectSlug: string): Promise<SourceResourceSelection> {
  const projectPaths = getProjectPaths(projectSlug);
  if (!(await fileExists(projectPaths.resourceCatalogPath))) {
    return {
      sourceReferenceId: null,
      sourceTitle: "Source Document",
      sourcePdfUrl: null,
      sourceChunks: []
    };
  }

  const catalog = await readJsonFile<ResourceCatalog>(projectPaths.resourceCatalogPath);
  const sourceResource = findPreferredPdfResource(catalog);
  if (!sourceResource?.chunkManifestPath) {
    return {
      sourceReferenceId: null,
      sourceTitle: "Source Document",
      sourcePdfUrl: null,
      sourceChunks: []
    };
  }

  const chunkManifestPath = resolveCatalogChunkManifestPath(projectSlug, sourceResource.chunkManifestPath);
  if (!(await fileExists(chunkManifestPath))) {
    return {
      sourceReferenceId: sourceResource.id,
      sourceTitle: sourceResource.titleGuess || "Source Document",
      sourcePdfUrl: null,
      sourceChunks: []
    };
  }

  const chunkManifest = await readJsonFile<ReferenceChunkManifest>(chunkManifestPath);
  return {
    sourceReferenceId: sourceResource.id,
    sourceTitle: sourceResource.titleGuess || "Source Document",
    sourcePdfUrl: null,
    sourceChunks: chunkManifest.chunks.map(normalizeChunk)
  };
}

