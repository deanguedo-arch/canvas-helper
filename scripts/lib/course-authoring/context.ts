import { Buffer } from "node:buffer";
import { lstat, open, readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

import { repoRoot as defaultRepoRoot } from "../paths.js";
import { validateProjectManifestPolicy } from "../project-manifest-policy.js";
import type { ProjectManifest } from "../types.js";
import { resolveSocial30SourceResource, SOCIAL30_RESOURCE_MANIFEST_PATH } from "../social-resource-manifest.js";

export const MAX_PROJECT_CONTEXT_BYTES = 5_000;

const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const RESERVED_PROJECT_DIRECTORIES = new Set(["assessments", "incoming", "processed", "resources"]);
const PROJECT_LOCAL_ROOTS = new Set(["workspace", "raw", "meta", "exports"]);

export type CourseAuthoringDriverId =
  | "direct-workspace-v1"
  | "english-factory-v1"
  | "social-related-issues-v1"
  | "proposal-only-v1";

export type CourseAuthoringDriverSource = "declared" | "legacy-inferred";

export type CourseAuthoringPath = {
  kind: "file" | "directory";
  repoRelative: string;
  exists: boolean;
};

export type CourseDoctorIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type ResolvedCourseAuthoringProject = {
  slug: string;
  driverId: CourseAuthoringDriverId;
  driverSource: CourseAuthoringDriverSource;
  authoringMode: "direct" | "factory" | "proposal-only";
  canonicalSources: CourseAuthoringPath[];
  editableSources: CourseAuthoringPath[];
  protectedPaths: CourseAuthoringPath[];
  sharedSources: CourseAuthoringPath[];
  regenerateCommand?: string;
};

export type CourseDoctorReport = {
  slug: string;
  status: "pass" | "warning" | "fail";
  issues: CourseDoctorIssue[];
  normalizedLegacyPathCount: number;
  project?: ResolvedCourseAuthoringProject;
};

export type CourseReadiness = "direct-ready" | "factory-ready" | "proposal-only" | "blocked" | "not-onboarded" | "invalid-manifest";

export type CourseListEntry = {
  slug: string;
  readiness: CourseReadiness;
  lifecycle: string;
  driver: CourseAuthoringDriverId | "invalid-manifest" | "not-onboarded";
  driverSource?: CourseAuthoringDriverSource;
  issueCount?: number;
};

type LoadedProjectManifest = {
  manifest: ProjectManifest;
  projectRoot: string;
};

type ResolvedManifestPath = CourseAuthoringPath & {
  absolutePath: string;
  normalizedLegacyPath: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isContainedPath(parentPath: string, candidatePath: string) {
  const relative = path.relative(parentPath, candidatePath);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function toRepoRelative(repoRoot: string, absolutePath: string) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join("/");
}

function hasTraversalSegment(value: string) {
  return value.replaceAll("\\", "/").split("/").some((segment) => segment === ".." || segment === ".");
}

function resolveLegacyWindowsPath(value: string, repoRoot: string) {
  const repoName = path.basename(path.resolve(repoRoot)).toLowerCase();
  const segments = value.replaceAll("\\", "/").split("/").filter(Boolean);
  const anchorIndex = segments.map((segment) => segment.toLowerCase()).lastIndexOf(repoName);
  if (anchorIndex < 0) {
    throw new Error(`Cannot safely resolve legacy Windows path outside this checkout: ${value}`);
  }

  const suffix = segments.slice(anchorIndex + 1);
  if (suffix.length === 0 || suffix.some((segment) => segment === "." || segment === "..")) {
    throw new Error(`Cannot safely normalize legacy Windows path: ${value}`);
  }

  return path.resolve(repoRoot, ...suffix);
}

function resolveManifestPath(value: string, repoRoot: string, projectRoot: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed !== value) {
    throw new Error(`Manifest path must be a non-empty trimmed string: ${JSON.stringify(value)}`);
  }
  if (hasTraversalSegment(trimmed)) {
    throw new Error(`Manifest path must not contain traversal segments: ${value}`);
  }

  const normalizedSlashes = trimmed.replaceAll("\\", "/");
  if (path.isAbsolute(trimmed)) {
    return { absolutePath: path.resolve(trimmed), normalizedLegacyPath: true };
  }
  if (path.win32.isAbsolute(trimmed)) {
    return { absolutePath: resolveLegacyWindowsPath(trimmed, repoRoot), normalizedLegacyPath: true };
  }

  const firstSegment = normalizedSlashes.split("/")[0];
  const basePath = firstSegment && PROJECT_LOCAL_ROOTS.has(firstSegment) ? projectRoot : repoRoot;
  return {
    absolutePath: path.resolve(basePath, ...normalizedSlashes.split("/")),
    normalizedLegacyPath: false
  };
}

async function nearestExistingAncestor(targetPath: string) {
  let currentPath = targetPath;
  while (true) {
    try {
      await lstat(currentPath);
      return currentPath;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) throw error;
      currentPath = parentPath;
    }
  }
}

async function inspectManifestPath(
  value: string,
  repoRoot: string,
  projectRoot: string,
  expectedKind?: CourseAuthoringPath["kind"]
): Promise<ResolvedManifestPath> {
  const resolved = resolveManifestPath(value, repoRoot, projectRoot);
  const normalizedRepoRoot = path.resolve(repoRoot);
  if (!isContainedPath(normalizedRepoRoot, resolved.absolutePath)) {
    throw new Error(`Manifest path escapes this checkout: ${value}`);
  }

  const [realRepoRoot, existingAncestor] = await Promise.all([
    realpath(normalizedRepoRoot),
    nearestExistingAncestor(resolved.absolutePath)
  ]);
  const realAncestor = await realpath(existingAncestor);
  if (!isContainedPath(realRepoRoot, realAncestor)) {
    throw new Error(`Manifest path resolves outside this checkout through a symbolic link: ${value}`);
  }

  try {
    const targetStats = await stat(resolved.absolutePath);
    const kind = targetStats.isDirectory() ? "directory" : "file";
    if (expectedKind && kind !== expectedKind) {
      throw new Error(`Manifest path has the wrong kind; expected ${expectedKind}: ${value}`);
    }
    return {
      absolutePath: resolved.absolutePath,
      repoRelative: toRepoRelative(normalizedRepoRoot, resolved.absolutePath),
      kind,
      exists: true,
      normalizedLegacyPath: resolved.normalizedLegacyPath
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return {
      absolutePath: resolved.absolutePath,
      repoRelative: toRepoRelative(normalizedRepoRoot, resolved.absolutePath),
      kind: expectedKind ?? "file",
      exists: false,
      normalizedLegacyPath: resolved.normalizedLegacyPath
    };
  }
}

function manifestStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function hasLegacyEnglishFactoryCommand(manifest: ProjectManifest, slug: string) {
  return manifest.regenerateCommand === `npm run build:english-unit -- --project ${slug}`;
}

function resolveAuthoringDriver(manifest: ProjectManifest, slug: string): {
  driverId?: CourseAuthoringDriverId;
  source: CourseAuthoringDriverSource;
} {
  if (manifest.authoring?.driverId) {
    return { driverId: manifest.authoring.driverId, source: "declared" };
  }
  if (hasLegacyEnglishFactoryCommand(manifest, slug)) {
    return { driverId: "english-factory-v1", source: "legacy-inferred" };
  }
  return { source: "legacy-inferred" };
}

function createIssue(report: CourseDoctorReport, code: string, message: string, severity: "error" | "warning" = "error") {
  report.issues.push({ severity, code, message });
}

function pathIsProtected(projectRoot: string, absolutePath: string) {
  return [path.join(projectRoot, "raw"), path.join(projectRoot, "exports")].some((protectedRoot) =>
    isContainedPath(protectedRoot, absolutePath)
  );
}

async function loadProjectManifest(slug: string, repoRoot: string): Promise<LoadedProjectManifest> {
  assertExactProjectSlug(slug);
  const projectRoot = path.join(repoRoot, "projects", slug);
  const manifestPath = path.join(projectRoot, "meta", "project.json");
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Project manifest not found for "${slug}" at ${manifestPath}.`);
    }
    throw error;
  }

  if (!isRecord(parsed) || typeof parsed.slug !== "string") {
    throw new Error(`Invalid project manifest at ${manifestPath}: missing string slug.`);
  }
  if (parsed.slug !== slug) {
    throw new Error(`Manifest slug "${parsed.slug}" does not match requested slug "${slug}".`);
  }

  return { manifest: parsed as ProjectManifest, projectRoot };
}

async function requireManifestPath(
  report: CourseDoctorReport,
  label: string,
  value: string,
  repoRoot: string,
  projectRoot: string,
  options: { protected?: boolean; required?: boolean; kind?: CourseAuthoringPath["kind"] } = {}
) {
  try {
    const resolved = await inspectManifestPath(value, repoRoot, projectRoot, options.kind);
    if (resolved.normalizedLegacyPath) report.normalizedLegacyPathCount += 1;
    if (options.protected && pathIsProtected(projectRoot, resolved.absolutePath)) {
      createIssue(report, "protected-source", `${label} overlaps a protected raw or exports path: ${value}`);
    }
    if (options.required !== false && !resolved.exists) {
      createIssue(report, "missing-source", `${label} does not exist: ${value}`);
    }
    return resolved;
  } catch (error) {
    createIssue(report, "invalid-path", `${label}: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
}

function toCoursePath(pathValue: ResolvedManifestPath): CourseAuthoringPath {
  return {
    kind: pathValue.kind,
    repoRelative: pathValue.repoRelative,
    exists: pathValue.exists
  };
}

function uniquePaths(paths: CourseAuthoringPath[]) {
  const seen = new Set<string>();
  return paths.filter((entry) => {
    const key = `${entry.kind}:${entry.repoRelative}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function assertNotLfsPointer(report: CourseDoctorReport, label: string, resolved: ResolvedManifestPath | undefined) {
  if (!resolved?.exists || resolved.kind !== "file") return;
  const handle = await open(resolved.absolutePath, "r");
  try {
    const buffer = Buffer.alloc(64);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (buffer.subarray(0, bytesRead).toString("utf8").startsWith("version https://git-lfs.github.com/spec/v1")) {
      createIssue(report, "unresolved-lfs-source", `${label} is an unresolved Git LFS pointer: ${resolved.repoRelative}`);
    }
  } finally {
    await handle.close();
  }
}

async function inspectEnglishRecipeSourceArchives(
  report: CourseDoctorReport,
  recipe: ResolvedManifestPath | undefined,
  repoRoot: string,
  projectRoot: string
) {
  if (!recipe?.exists) return [] as ResolvedManifestPath[];
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(recipe.absolutePath, "utf8"));
  } catch (error) {
    createIssue(report, "invalid-english-recipe", `English recipe cannot be read as JSON: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
  const source = isRecord(parsed) && isRecord(parsed.source) ? parsed.source : undefined;
  if (!source) {
    createIssue(report, "invalid-english-recipe", "English recipe is missing a source object with both archive paths.");
    return [];
  }

  const archiveDeclarations = [
    { label: "English Brightspace archive", value: source.brightspaceZip },
    { label: "English teacher-resource archive", value: source.teacherResourcesZip }
  ];
  const archives: ResolvedManifestPath[] = [];
  for (const archive of archiveDeclarations) {
    if (typeof archive.value !== "string" || !archive.value.trim()) {
      createIssue(report, "invalid-english-recipe", `${archive.label} is missing from the English recipe.`);
      continue;
    }
    const resolved = await requireManifestPath(report, archive.label, archive.value, repoRoot, projectRoot, { kind: "file" });
    await assertNotLfsPointer(report, archive.label, resolved);
    if (resolved) archives.push(resolved);
  }
  return archives;
}

async function inspectEnglishFactoryProject(
  report: CourseDoctorReport,
  manifest: ProjectManifest,
  repoRoot: string,
  projectRoot: string,
  driverSource: CourseAuthoringDriverSource
) {
  const slug = manifest.slug;
  const recipe = await requireManifestPath(
    report,
    "English recipe",
    `projects/${slug}/meta/english-unit.json`,
    repoRoot,
    projectRoot
  );
  const components = await requireManifestPath(
    report,
    "English custom components root",
    `projects/${slug}/workspace/components`,
    repoRoot,
    projectRoot,
    { required: false, kind: "directory" }
  );
  const customAssets = await requireManifestPath(
    report,
    "English custom assets root",
    `projects/${slug}/workspace/assets/custom`,
    repoRoot,
    projectRoot,
    { required: false, kind: "directory" }
  );
  const sourceArchives = await inspectEnglishRecipeSourceArchives(report, recipe, repoRoot, projectRoot);
  const shared = await Promise.all(
    [
      "scripts/build-english-unit.ts",
      "scripts/lib/english-unit/factory-build.ts",
      "scripts/lib/english-unit/workspace-staging.ts"
    ].map((source) => requireManifestPath(report, "English factory source", source, repoRoot, projectRoot, { kind: "file" }))
  );
  const protectedEntries = [
    { path: `projects/${slug}/raw`, kind: "directory" },
    { path: `projects/${slug}/exports`, kind: "directory" },
    { path: `projects/${slug}/workspace/index.html`, kind: "file" },
    { path: `projects/${slug}/workspace/assets/generated`, kind: "directory" },
    { path: `projects/${slug}/workspace/resources/generated`, kind: "directory" },
    { path: `projects/${slug}/meta/project.json`, kind: "file" },
    { path: `projects/${slug}/meta/prompt-pack.md`, kind: "file" }
  ] as const;
  const protectedPaths = await Promise.all(
    protectedEntries.map((entry) =>
      requireManifestPath(report, "English protected path", entry.path, repoRoot, projectRoot, {
        required: false,
        kind: entry.kind
      })
    )
  );

  const declaredCanonicalSources = [
    ...(typeof manifest.canonicalEntry === "string" ? [manifest.canonicalEntry] : []),
    ...manifestStringList(manifest.canonicalSources)
  ];
  const canonicalSources = await Promise.all(
    [...new Set(declaredCanonicalSources)].map((source) =>
      requireManifestPath(report, "Declared canonical source", source, repoRoot, projectRoot)
    )
  );

  return {
    slug,
    driverId: "english-factory-v1" as const,
    driverSource,
    authoringMode: "factory" as const,
    canonicalSources: uniquePaths(canonicalSources.filter((entry): entry is ResolvedManifestPath => Boolean(entry)).map(toCoursePath)),
    editableSources: uniquePaths([recipe, components, customAssets].filter((entry): entry is ResolvedManifestPath => Boolean(entry)).map(toCoursePath)),
    protectedPaths: uniquePaths(protectedPaths.filter((entry): entry is ResolvedManifestPath => Boolean(entry)).map(toCoursePath)),
    sharedSources: uniquePaths(
      [...shared, ...sourceArchives].filter((entry): entry is ResolvedManifestPath => Boolean(entry)).map(toCoursePath)
    ),
    regenerateCommand: manifest.regenerateCommand
  };
}

async function inspectDirectProject(
  report: CourseDoctorReport,
  manifest: ProjectManifest,
  repoRoot: string,
  projectRoot: string,
  options: {
    driverId?: Exclude<CourseAuthoringDriverId, "english-factory-v1">;
    driverSource: CourseAuthoringDriverSource;
  }
) {
  const declaredSources = [
    ...(typeof manifest.canonicalEntry === "string" ? [manifest.canonicalEntry] : []),
    ...manifestStringList(manifest.canonicalSources)
  ];
  const resolvedSources = await Promise.all(
    [...new Set(declaredSources)].map((source) =>
      requireManifestPath(report, "Canonical source", source, repoRoot, projectRoot, { protected: true })
    )
  );
  const canonicalSources = uniquePaths(
    resolvedSources.filter((entry): entry is ResolvedManifestPath => Boolean(entry)).map(toCoursePath)
  );
  const workspaceRoot = path.join(projectRoot, "workspace");
  const allWorkspaceOwned = resolvedSources
    .filter((entry): entry is ResolvedManifestPath => Boolean(entry))
    .every((entry) => isContainedPath(workspaceRoot, entry.absolutePath));
  const forceProposal = options.driverId === "social-related-issues-v1" || options.driverId === "proposal-only-v1";
  const proposalOnly = forceProposal || !allWorkspaceOwned;

  const protectedEntries = [
    { path: `projects/${manifest.slug}/raw`, kind: "directory" },
    { path: `projects/${manifest.slug}/exports`, kind: "directory" },
    { path: `projects/${manifest.slug}/meta/project.json`, kind: "file" }
  ] as const;
  const protectedPaths = await Promise.all(
    protectedEntries.map((entry) =>
      requireManifestPath(report, "Protected path", entry.path, repoRoot, projectRoot, {
        required: false,
        kind: entry.kind
      })
    )
  );
  const workspacePath = proposalOnly
    ? await requireManifestPath(report, "Generated workspace", `projects/${manifest.slug}/workspace`, repoRoot, projectRoot, {
        required: false,
        kind: "directory"
      })
    : undefined;
  const sharedSources = resolvedSources
    .filter((entry): entry is ResolvedManifestPath => Boolean(entry))
    .filter((entry) => !isContainedPath(workspaceRoot, entry.absolutePath));

  return {
    slug: manifest.slug,
    driverId: (options.driverId ?? (proposalOnly ? "proposal-only-v1" : "direct-workspace-v1")) as CourseAuthoringDriverId,
    driverSource: options.driverSource,
    authoringMode: (proposalOnly ? "proposal-only" : "direct") as "direct" | "proposal-only",
    canonicalSources,
    editableSources: proposalOnly ? [] : canonicalSources,
    protectedPaths: uniquePaths(
      [...protectedPaths, workspacePath].filter((entry): entry is ResolvedManifestPath => Boolean(entry)).map(toCoursePath)
    ),
    sharedSources: uniquePaths(sharedSources.map(toCoursePath)),
    regenerateCommand: manifest.regenerateCommand
  };
}

async function inspectSocialRelatedIssuesProject(
  report: CourseDoctorReport,
  manifest: ProjectManifest,
  repoRoot: string,
  projectRoot: string,
  driverSource: CourseAuthoringDriverSource
) {
  const base = await inspectDirectProject(report, manifest, repoRoot, projectRoot, {
    driverId: "social-related-issues-v1",
    driverSource
  });
  const sourceResourceIds = manifest.authoring?.sourceResourceIds ?? [];
  const resourceManifest = await requireManifestPath(
    report,
    "Social resource manifest",
    SOCIAL30_RESOURCE_MANIFEST_PATH,
    repoRoot,
    projectRoot,
    { kind: "file" }
  );

  if (sourceResourceIds.length === 0) {
    createIssue(report, "missing-social-resource", "Social related-issues projects must declare at least one authoring.sourceResourceIds entry.");
  }

  const resolvedResources: ResolvedManifestPath[] = [];
  for (const resourceId of sourceResourceIds) {
    try {
      const resource = await resolveSocial30SourceResource({ repoRoot, resourceId });
      resolvedResources.push({
        absolutePath: resource.absolutePath,
        repoRelative: toRepoRelative(repoRoot, resource.absolutePath),
        kind: "file",
        exists: true,
        normalizedLegacyPath: false
      });
    } catch (error) {
      createIssue(
        report,
        "invalid-social-resource",
        `Social source resource ${resourceId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return {
    ...base,
    sharedSources: uniquePaths(
      [...base.sharedSources, resourceManifest, ...resolvedResources]
        .filter((entry): entry is ResolvedManifestPath => Boolean(entry))
        .map(toCoursePath)
    )
  };
}

export function assertExactProjectSlug(slug: string) {
  if (!PROJECT_SLUG_PATTERN.test(slug)) {
    throw new Error(`Invalid exact project slug: "${slug}".`);
  }
  return slug;
}

export async function inspectCourseAuthoringProject(
  slug: string,
  repoRoot = defaultRepoRoot
): Promise<CourseDoctorReport> {
  const report: CourseDoctorReport = {
    slug,
    status: "fail",
    issues: [],
    normalizedLegacyPathCount: 0
  };
  let loaded: LoadedProjectManifest;
  try {
    loaded = await loadProjectManifest(slug, repoRoot);
  } catch (error) {
    createIssue(report, "manifest", error instanceof Error ? error.message : String(error));
    return report;
  }

  const policy = validateProjectManifestPolicy(loaded.manifest);
  if (policy.status === "skipped-legacy") {
    createIssue(report, "legacy-manifest", "Legacy manifests are not eligible for compact authoring context.");
  }
  for (const error of policy.errors) createIssue(report, "manifest-policy", error);

  if (loaded.manifest.authoringStatus !== "active") {
    createIssue(
      report,
      "not-active",
      `Only active projects are eligible for authoring context; received "${loaded.manifest.authoringStatus ?? "missing"}".`
    );
  }

  const resolvedDriver = resolveAuthoringDriver(loaded.manifest, slug);
  report.project = resolvedDriver.driverId === "english-factory-v1"
    ? await inspectEnglishFactoryProject(report, loaded.manifest, repoRoot, loaded.projectRoot, resolvedDriver.source)
    : resolvedDriver.driverId === "social-related-issues-v1"
      ? await inspectSocialRelatedIssuesProject(report, loaded.manifest, repoRoot, loaded.projectRoot, resolvedDriver.source)
      : await inspectDirectProject(report, loaded.manifest, repoRoot, loaded.projectRoot, {
          driverId: resolvedDriver.driverId,
          driverSource: resolvedDriver.source
        });

  report.status = report.issues.some((issue) => issue.severity === "error")
    ? "fail"
    : report.issues.some((issue) => issue.severity === "warning")
      ? "warning"
      : "pass";
  return report;
}

function renderPathList(paths: readonly CourseAuthoringPath[], emptyLabel = "(none)") {
  return paths.length === 0
    ? `- ${emptyLabel}`
    : paths.map((entry) => `- [${entry.kind}] ${entry.repoRelative}`).join("\n");
}

export function renderCourseDoctorReport(report: CourseDoctorReport) {
  const lines = [`${report.status.toUpperCase()}: ${report.slug}`];
  if (report.project) {
    lines.push(`Driver: ${report.project.driverId}`);
    lines.push(`Driver source: ${report.project.driverSource}`);
    lines.push(`Mode: ${report.project.authoringMode}`);
  }
  if (report.normalizedLegacyPathCount > 0) {
    lines.push(`Normalized legacy paths in memory: ${report.normalizedLegacyPathCount} (manifest unchanged)`);
  }
  for (const issue of report.issues) {
    lines.push(`${issue.severity.toUpperCase()} ${issue.code}: ${issue.message}`);
  }
  return lines.join("\n");
}

export function renderProjectAuthoringContext(report: CourseDoctorReport) {
  if (report.status !== "pass" || !report.project) {
    throw new Error("Course authoring context is unavailable until course:doctor passes.");
  }

  const project = report.project;
  const automaticWriteStatus = project.driverId === "direct-workspace-v1"
    ? "- Automatic generation writes: allowed only for the exact canonical workspace files above; the server revalidates this before writing."
    : "- Automatic generation writes: proposal-only for this driver; use the declared authoring driver and rebuild flow.";
  const lines = [
    "# Course Authoring Context",
    "",
    `- Project: ${project.slug}`,
    `- Driver: ${project.driverId}`,
    `- Driver source: ${project.driverSource}`,
    `- Mode: ${project.authoringMode}`,
    automaticWriteStatus,
    `- Legacy path normalization: ${report.normalizedLegacyPathCount} path(s), in memory only.`,
    "",
    "## Canonical editable sources",
    renderPathList(project.editableSources, "(proposal-only; an explicit authoring driver is required)"),
    "",
    "## Shared sources",
    renderPathList(project.sharedSources),
    "",
    "## Protected or generated paths (do not hand-edit)",
    renderPathList(project.protectedPaths),
    "",
    "## Rebuild",
    project.regenerateCommand ? `- ${project.regenerateCommand}` : "- No rebuild command is declared.",
    "",
    "## Safety",
    "- Do not edit raw or exports paths.",
    "- Do not infer a write target outside the canonical editable sources above.",
    "- Whole resource catalogs, blueprints, and prompt packs are intentionally excluded from this compact context."
  ];
  const text = lines.join("\n");
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > MAX_PROJECT_CONTEXT_BYTES) {
    throw new Error(`Project context is ${bytes} UTF-8 bytes; limit is ${MAX_PROJECT_CONTEXT_BYTES} bytes.`);
  }
  return text;
}

export async function buildProjectAuthoringContext(slug: string, repoRoot = defaultRepoRoot) {
  const report = await inspectCourseAuthoringProject(slug, repoRoot);
  if (report.status !== "pass") return { report, text: null };

  try {
    return { report, text: renderProjectAuthoringContext(report) };
  } catch (error) {
    createIssue(report, "context-cap", error instanceof Error ? error.message : String(error));
    report.status = "fail";
    return { report, text: null };
  }
}

function readinessFromDoctorReport(report: CourseDoctorReport): CourseReadiness {
  if (report.status !== "pass" || !report.project) {
    return "blocked";
  }
  if (report.project.driverId === "direct-workspace-v1" && report.project.authoringMode === "direct") {
    return "direct-ready";
  }
  if (report.project.driverId === "english-factory-v1") {
    return "factory-ready";
  }
  return "proposal-only";
}

export async function listCourseAuthoringProjects(options: { includeAll?: boolean; repoRoot?: string } = {}) {
  const repoRoot = options.repoRoot ?? defaultRepoRoot;
  const projectsRoot = path.join(repoRoot, "projects");
  const entries = await readdir(projectsRoot, { withFileTypes: true });
  const slugs = entries
    .filter((entry) => entry.isDirectory() && PROJECT_SLUG_PATTERN.test(entry.name) && !RESERVED_PROJECT_DIRECTORIES.has(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const rows = await Promise.all(
    slugs.map(async (slug): Promise<CourseListEntry | undefined> => {
      try {
        const { manifest } = await loadProjectManifest(slug, repoRoot);
        const migratedActive = manifest.migrationState === "migrated" && manifest.authoringStatus === "active";
        if (!options.includeAll && !migratedActive) return undefined;
        if (!migratedActive) {
          const lifecycle = manifest.authoringStatus ?? "missing-status";
          const declaredDriver = manifest.authoring?.driverId;
          return {
            slug,
            readiness: lifecycle === "blocked" ? "blocked" : "not-onboarded",
            lifecycle,
            driver: declaredDriver ?? "not-onboarded",
            driverSource: declaredDriver ? "declared" : undefined,
            issueCount: lifecycle === "blocked" ? 0 : undefined
          };
        }

        const report = await inspectCourseAuthoringProject(slug, repoRoot);
        return {
          slug,
          readiness: readinessFromDoctorReport(report),
          lifecycle: manifest.authoringStatus ?? "missing-status",
          driver: report.project?.driverId ?? "invalid-manifest",
          driverSource: report.project?.driverSource,
          issueCount: report.issues.length
        };
      } catch {
        return options.includeAll
          ? { slug, readiness: "invalid-manifest", lifecycle: "invalid-manifest", driver: "invalid-manifest" }
          : undefined;
      }
    })
  );

  return rows.filter((row): row is CourseListEntry => Boolean(row));
}
