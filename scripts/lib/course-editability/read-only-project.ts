import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";

import { normalizeProjectManifestPolicy } from "../project-manifest-policy.js";
import type { ProjectManifest } from "../types.js";

const RESERVED_PROJECT_DIRS = new Set(["incoming", "processed", "resources"]);
const PROJECT_SLUG_PATTERN = /^[a-z0-9][a-z0-9._-]*$/i;

export class CourseEditabilityReadError extends Error {
  readonly code:
    | "manifest-missing"
    | "manifest-invalid"
    | "declared-page-missing"
    | "project-repair-attempt";

  constructor(
    code: CourseEditabilityReadError["code"],
    message: string
  ) {
    super(message);
    this.name = "CourseEditabilityReadError";
    this.code = code;
  }
}

function normalizeSlash(value: string) {
  return value.split(path.sep).join("/");
}

function isInside(parent: string, candidate: string) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function assertProjectSlug(projectSlug: string) {
  if (!PROJECT_SLUG_PATTERN.test(projectSlug) || projectSlug.length > 160 || RESERVED_PROJECT_DIRS.has(projectSlug)) {
    throw new CourseEditabilityReadError("manifest-invalid", "The project slug is not safe for read-only inspection.");
  }
}

async function assertRealDirectory(directoryPath: string, label: string) {
  let stats;
  try {
    stats = await lstat(directoryPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new CourseEditabilityReadError("manifest-missing", `${label} is missing. Read-only inspection never repairs it.`);
    }
    throw error;
  }
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new CourseEditabilityReadError("manifest-invalid", `${label} must be a real directory.`);
  }
}

async function readContainedFile(root: string, relativePath: string, label: string) {
  if (
    !relativePath ||
    relativePath.includes("\0") ||
    relativePath.includes("\\") ||
    path.isAbsolute(relativePath) ||
    relativePath.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    throw new CourseEditabilityReadError("manifest-invalid", `${label} has an unsafe relative path.`);
  }
  const candidate = path.resolve(root, ...relativePath.split("/"));
  if (!isInside(root, candidate)) {
    throw new CourseEditabilityReadError("manifest-invalid", `${label} escaped its declared read boundary.`);
  }
  let stats;
  try {
    stats = await lstat(candidate);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new CourseEditabilityReadError("declared-page-missing", `${label} is missing.`);
    }
    throw error;
  }
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new CourseEditabilityReadError("manifest-invalid", `${label} must be a real file.`);
  }
  const [realRoot, realCandidate] = await Promise.all([realpath(root), realpath(candidate)]);
  if (!isInside(realRoot, realCandidate)) {
    throw new CourseEditabilityReadError("manifest-invalid", `${label} escaped its real read boundary.`);
  }
  return await readFile(candidate, "utf8");
}

export type CourseEditabilityReadOnlyProject = {
  projectSlug: string;
  repoRoot: string;
  projectRoot: string;
  workspaceRoot: string;
  metaRoot: string;
  rawManifest: ProjectManifest;
  manifest: ProjectManifest;
  readWorkspaceText: (relativePath: string) => Promise<string>;
  readMetaText: (relativePath: string) => Promise<string>;
  readMetaJson: <T>(relativePath: string) => Promise<T>;
};

export async function openCourseEditabilityReadOnlyProject(
  projectSlug: string,
  repoRoot: string
): Promise<CourseEditabilityReadOnlyProject> {
  assertProjectSlug(projectSlug);
  const resolvedRepoRoot = path.resolve(repoRoot);
  const projectsRoot = path.join(resolvedRepoRoot, "projects");
  const projectRoot = path.join(projectsRoot, projectSlug);
  const workspaceRoot = path.join(projectRoot, "workspace");
  const metaRoot = path.join(projectRoot, "meta");
  await Promise.all([
    assertRealDirectory(projectsRoot, "The projects directory"),
    assertRealDirectory(projectRoot, `Project ${projectSlug}`),
    assertRealDirectory(workspaceRoot, `Project ${projectSlug} workspace`),
    assertRealDirectory(metaRoot, `Project ${projectSlug} metadata`)
  ]);

  let rawManifest: ProjectManifest;
  try {
    rawManifest = JSON.parse(await readContainedFile(metaRoot, "project.json", "Project manifest")) as ProjectManifest;
  } catch (error) {
    if (error instanceof CourseEditabilityReadError) throw error;
    throw new CourseEditabilityReadError("manifest-invalid", "The project manifest is not valid JSON.");
  }
  if (!rawManifest || typeof rawManifest !== "object" || rawManifest.slug !== projectSlug) {
    throw new CourseEditabilityReadError("manifest-invalid", "The project manifest does not match its project slug.");
  }
  const manifest = normalizeProjectManifestPolicy(rawManifest);

  return {
    projectSlug,
    repoRoot: resolvedRepoRoot,
    projectRoot,
    workspaceRoot,
    metaRoot,
    rawManifest,
    manifest,
    readWorkspaceText: (relativePath) => readContainedFile(workspaceRoot, relativePath, "Workspace learner page"),
    readMetaText: (relativePath) => readContainedFile(metaRoot, relativePath, "Project metadata file"),
    readMetaJson: async <T>(relativePath: string) => {
      try {
        return JSON.parse(await readContainedFile(metaRoot, relativePath, "Project metadata file")) as T;
      } catch (error) {
        if (error instanceof CourseEditabilityReadError) throw error;
        throw new CourseEditabilityReadError("manifest-invalid", "A project metadata file is not valid JSON.");
      }
    }
  };
}

export async function listCourseEditabilityProjectSlugsReadOnly(repoRoot: string) {
  const projectsRoot = path.join(path.resolve(repoRoot), "projects");
  await assertRealDirectory(projectsRoot, "The projects directory");
  const entries = await readdir(projectsRoot, { withFileTypes: true });
  const slugs: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || RESERVED_PROJECT_DIRS.has(entry.name)) continue;
    if (!PROJECT_SLUG_PATTERN.test(entry.name)) continue;
    try {
      const stats = await lstat(path.join(projectsRoot, entry.name, "meta", "project.json"));
      if (stats.isFile() && !stats.isSymbolicLink()) slugs.push(entry.name);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return slugs.sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
}

export function projectRelativePath(project: CourseEditabilityReadOnlyProject, absolutePath: string) {
  return normalizeSlash(path.relative(project.projectRoot, absolutePath));
}
