import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

export const SOCIAL30_RESOURCE_MANIFEST_PATH = "projects/resources/social30-1-related-issues/resource-manifest.json";
export const SOCIAL30_DEFAULT_RESOURCE_ID = "social30-1-brightspace-winter-2020";

export type SocialSourceResource = {
  id: string;
  kind: "brightspace-zip";
  path: string;
  sha256: string;
  availability: "canonical" | "snapshot-backed";
  provenance: {
    sourceSystem: "brightspace";
    description: string;
  };
};

export type ResolvedSocialSourceResource = SocialSourceResource & {
  absolutePath: string;
};

type SocialSourceResourceManifest = {
  schemaVersion: 1;
  familyId: "social30-1-related-issues";
  resources: SocialSourceResource[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeRepoRelativePath(value: string) {
  const normalized = path.posix.normalize(value.replaceAll("\\", "/")).replace(/^\.\//, "");
  if (!normalized || normalized === "." || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) {
    throw new Error(`Resource path must be repository-relative and contained: ${JSON.stringify(value)}`);
  }
  return normalized;
}

function isAllowedSocial30SourcePath(value: string) {
  return (
    value.startsWith("projects/resources/social30-1-related-issues/_sources/") ||
    /^projects\/processed\/social30-1-related-issue-[^/]+\/source\//.test(value)
  );
}

function parseResource(value: unknown): SocialSourceResource {
  if (!isRecord(value)) throw new Error("Social resource entries must be objects.");
  const id = typeof value.id === "string" ? value.id.trim() : "";
  const kind = value.kind;
  const rawPath = typeof value.path === "string" ? value.path.trim() : "";
  const sha256 = typeof value.sha256 === "string" ? value.sha256.trim().toLowerCase() : "";
  const availability = value.availability;
  const provenance = value.provenance;
  if (!id || kind !== "brightspace-zip" || !rawPath || !/^[a-f0-9]{64}$/.test(sha256)) {
    throw new Error("Social resource entries require id, kind, path, and a SHA-256 checksum.");
  }
  const resourcePath = normalizeRepoRelativePath(rawPath);
  if (!isAllowedSocial30SourcePath(resourcePath)) {
    throw new Error(`Social 30 source path is outside the allowed resource or processed snapshot locations: ${resourcePath}`);
  }
  if (availability !== "canonical" && availability !== "snapshot-backed") {
    throw new Error(`Social resource availability must be canonical or snapshot-backed: ${id}`);
  }
  if (!isRecord(provenance) || provenance.sourceSystem !== "brightspace" || typeof provenance.description !== "string") {
    throw new Error(`Social resource provenance is incomplete: ${id}`);
  }
  return {
    id,
    kind,
    path: resourcePath,
    sha256,
    availability,
    provenance: { sourceSystem: "brightspace", description: provenance.description.trim() }
  };
}

function parseManifest(value: unknown): SocialSourceResourceManifest {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.familyId !== "social30-1-related-issues" || !Array.isArray(value.resources)) {
    throw new Error("Invalid Social 30 source resource manifest.");
  }
  const resources = value.resources.map(parseResource);
  const ids = new Set<string>();
  for (const resource of resources) {
    if (ids.has(resource.id)) throw new Error(`Social resource ID appears more than once: ${resource.id}`);
    ids.add(resource.id);
  }
  return { schemaVersion: 1, familyId: "social30-1-related-issues", resources };
}

function isContainedPath(parentPath: string, candidatePath: string) {
  const relative = path.relative(parentPath, candidatePath);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function assertMaterializedZip(resource: SocialSourceResource, repoRoot: string): Promise<string> {
  const absolutePath = path.resolve(repoRoot, resource.path);
  if (!isContainedPath(path.resolve(repoRoot), absolutePath)) {
    throw new Error(`Social resource path escapes this checkout: ${resource.path}`);
  }
  let stats;
  try {
    stats = await lstat(absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Social source resource is not materialized: ${resource.path}`);
    }
    throw error;
  }
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new Error(`Social source resource must be a real file: ${resource.path}`);
  }

  const content = await readFile(absolutePath);
  if (content.subarray(0, 64).toString("utf8").startsWith("version https://git-lfs.github.com/spec/v1")) {
    throw new Error(`Social source resource is an unresolved Git LFS pointer: ${resource.path}`);
  }
  const actualSha256 = createHash("sha256").update(content).digest("hex");
  if (actualSha256 !== resource.sha256) {
    throw new Error(`Social source resource checksum mismatch for ${resource.id}.`);
  }
  return absolutePath;
}

export async function resolveSocial30SourceResource(options: {
  repoRoot: string;
  resourceId?: string;
  manifestPath?: string;
}): Promise<ResolvedSocialSourceResource> {
  const manifestPath = options.manifestPath ?? SOCIAL30_RESOURCE_MANIFEST_PATH;
  const normalizedManifestPath = normalizeRepoRelativePath(manifestPath);
  const manifestAbsolutePath = path.resolve(options.repoRoot, normalizedManifestPath);
  if (!isContainedPath(path.resolve(options.repoRoot), manifestAbsolutePath)) {
    throw new Error(`Social resource manifest escapes this checkout: ${manifestPath}`);
  }
  const manifest = parseManifest(JSON.parse(await readFile(manifestAbsolutePath, "utf8")));
  const resourceId = options.resourceId ?? SOCIAL30_DEFAULT_RESOURCE_ID;
  const resource = manifest.resources.find((entry) => entry.id === resourceId);
  if (!resource) throw new Error(`Unknown Social source resource ID: ${resourceId}`);
  return { ...resource, absolutePath: await assertMaterializedZip(resource, options.repoRoot) };
}
