import { fileExists, readJsonFile } from "./fs.js";
import { getProjectPaths } from "./paths.js";
import type {
  AssessmentMap,
  CourseBlueprint,
  ReferenceChunk,
  ReferenceChunkManifest,
  ResourceAuthorityRole,
  ResourceCatalog,
  ResourceCatalogEntry
} from "./types.js";

export async function readOptionalJson<T>(filePath: string) {
  if (!(await fileExists(filePath))) {
    return null;
  }

  return readJsonFile<T>(filePath);
}

export async function loadResourceCatalog(projectSlug: string) {
  const paths = getProjectPaths(projectSlug);
  if (!(await fileExists(paths.resourceCatalogPath))) {
    throw new Error(`Resource catalog not found for "${projectSlug}". Run npm run refs -- --project ${projectSlug} first.`);
  }

  return readJsonFile<ResourceCatalog>(paths.resourceCatalogPath);
}

export async function loadCourseBlueprint(projectSlug: string) {
  const paths = getProjectPaths(projectSlug);
  if (!(await fileExists(paths.courseBlueprintPath))) {
    throw new Error(`Course blueprint not found for "${projectSlug}". Run npm run blueprint -- --project ${projectSlug} first.`);
  }

  return readJsonFile<CourseBlueprint>(paths.courseBlueprintPath);
}

export async function loadAssessmentMap(projectSlug: string) {
  const paths = getProjectPaths(projectSlug);
  if (!(await fileExists(paths.assessmentMapPath))) {
    throw new Error(`Assessment map not found for "${projectSlug}". Run npm run assessment-map -- --project ${projectSlug} first.`);
  }

  return readJsonFile<AssessmentMap>(paths.assessmentMapPath);
}

export async function loadReferenceChunks(entry: Pick<ResourceCatalogEntry, "chunkManifestPath">) {
  if (!entry.chunkManifestPath || !(await fileExists(entry.chunkManifestPath))) {
    return [] as ReferenceChunk[];
  }

  const manifest = await readJsonFile<ReferenceChunkManifest>(entry.chunkManifestPath);
  return manifest.chunks;
}

export async function loadAllReferenceChunks(catalog: ResourceCatalog) {
  const chunkEntries = await Promise.all(
    catalog.resources.map(async (resource) => ({
      resourceId: resource.id,
      chunks: await loadReferenceChunks(resource)
    }))
  );

  return new Map(chunkEntries.map((entry) => [entry.resourceId, entry.chunks]));
}

export function compactUnique(values: Array<string | null | undefined>, limit = Number.POSITIVE_INFINITY) {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const cleaned = value?.trim();
    if (!cleaned || seen.has(cleaned)) {
      continue;
    }

    seen.add(cleaned);
    result.push(cleaned);
    if (result.length >= limit) {
      break;
    }
  }

  return result;
}

export function authorityRank(role: ResourceAuthorityRole | undefined) {
  switch (role) {
    case "assessment-authoritative":
      return 5;
    case "blueprint-authoritative":
      return 4;
    case "context-authoritative":
      return 3;
    case "supporting-only":
      return 2;
    case "fallback-only":
      return 1;
    default:
      return 0;
  }
}
