import { execFile } from "node:child_process";
import type { Dirent } from "node:fs";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import {
  STUDIO_ROUTINE_CONTENT_CANDIDATE_KINDS,
  STUDIO_ROUTINE_CONTENT_CAPABILITY_KINDS,
  isProjectStudioEditabilityContractV1,
  type CourseEditCoverageBreakdown,
  type CourseEditCoverageRatio,
  type CourseEditabilityProjectReport
} from "../../app/shared/course-editability.js";
import {
  normalizeProjectManifestPolicy,
  validateProjectManifestPolicy
} from "./project-manifest-policy.js";
import { collectEnglishFactoryDependencyPaths } from "./english-unit/dependencies.js";
import type { ProjectAuthoringStatus, ProjectManifest } from "./types.js";

const execFileAsync = promisify(execFile);

/**
 * Courses already present at this commit remain migration work. Courses added,
 * activated, or explicitly enrolled after it are governed by the new-course
 * Studio editability gate.
 */
export const NEW_COURSE_EDITABILITY_POLICY_INCEPTION = "350d2ad4f164520123a37210fd8185cac20c4b77";
export const NEW_COURSE_EDITABILITY_POLICY_ANCHOR = "config/studio-editability-policy-v1.json";

export const NEW_COURSE_BLOCK_COVERAGE_MINIMUM = 0.9;
export const NEW_COURSE_TEXT_COVERAGE_MINIMUM = 0.9;
export const NEW_COURSE_CATEGORY_COVERAGE_MINIMUM = 0.8;
export const NEW_COURSE_CAPABILITY_COVERAGE_MINIMUM = 0.9;

const NEW_COURSE_DRIVER_IDS = new Set([
  "direct-workspace-v1",
  "english-factory-v1",
  "social-related-issues-v1"
]);
const EXPLICIT_NON_ACTIVE_STATUSES = new Set<ProjectAuthoringStatus>([
  "blocked",
  "reference-only",
  "archived"
]);
const NON_PROJECT_DIRECTORIES = new Set(["assessments", "incoming", "processed"]);

export type NewCourseReadinessTrigger =
  | "new-active"
  | "activated"
  | "governed-change"
  | "new-non-active";

export type NewCourseReadinessCandidate = {
  projectSlug: string;
  trigger: NewCourseReadinessTrigger;
  required: boolean;
  changedPaths: string[];
  manifestPath: string;
  manifest: ProjectManifest | null;
};

export type NewCourseReadinessCheck = {
  code: string;
  passed: boolean;
};

export type NewCourseReadinessEvaluation = {
  passed: boolean;
  checks: NewCourseReadinessCheck[];
  failedCodes: string[];
};

function codePointCompare(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function projectSlugForChangedPath(filePath: string) {
  const parts = filePath.split("/");
  if (parts[0] !== "projects" || !parts[1]) return null;
  if (parts[1] === "resources") return parts[2] || null;
  if (NON_PROJECT_DIRECTORIES.has(parts[1])) return null;
  return parts[1];
}

function safeRepoRelativeDependency(repoRoot: string, value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const absolute = path.isAbsolute(value) ? path.resolve(value) : path.resolve(repoRoot, value);
  const relative = path.relative(repoRoot, absolute).split(path.sep).join("/");
  if (!relative || relative === ".." || relative.startsWith("../") || path.isAbsolute(relative)) return null;
  return relative;
}

async function governedManifestDependencies(
  repoRoot: string,
  projectSlug: string,
  manifest: ProjectManifest
) {
  const values: unknown[] = [
    `projects/${projectSlug}`,
    `projects/resources/${projectSlug}`,
    manifest.sourcePath,
    manifest.canonicalEntry,
    ...(manifest.canonicalSources ?? []),
    ...(manifest.referenceOnly ?? []),
    manifest.importedFirstPassOrigin?.sourcePath
  ];
  const manifestDependencies = values
    .map((value) => safeRepoRelativeDependency(repoRoot, value))
    .filter((value): value is string => Boolean(value));
  const factoryDependencies = manifest.authoring?.driverId === "english-factory-v1"
    ? await collectEnglishFactoryDependencyPaths({ repoRoot, projectSlug })
    : [];
  return [...new Set([...manifestDependencies, ...factoryDependencies])]
    .sort(codePointCompare);
}

function changedPathMatchesDependency(changedPath: string, dependency: string) {
  return changedPath === dependency || changedPath.startsWith(`${dependency.replace(/\/$/, "")}/`);
}

async function listCurrentGovernedManifests(repoRoot: string) {
  const projectsRoot = path.join(repoRoot, "projects");
  const results: Array<{ projectSlug: string; manifest: ProjectManifest }> = [];
  let entries: Dirent[];
  try {
    entries = await readdir(projectsRoot, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || NON_PROJECT_DIRECTORIES.has(entry.name) || entry.name === "resources") {
      continue;
    }
    const manifest = await readManifestFile(path.join(projectsRoot, entry.name, "meta", "project.json"));
    if (!manifest || !activeStatus(manifest) || !declaresEditabilityContract(manifest)) continue;
    results.push({ projectSlug: entry.name, manifest });
  }
  return results.sort((left, right) => codePointCompare(left.projectSlug, right.projectSlug));
}

function activeStatus(manifest: ProjectManifest | null) {
  return manifest?.authoringStatus === "active" || manifest?.authoringStatus === "ready-for-export";
}

function explicitlyNonActive(manifest: ProjectManifest | null) {
  return Boolean(manifest?.authoringStatus && EXPLICIT_NON_ACTIVE_STATUSES.has(manifest.authoringStatus));
}

function declaresEditabilityContract(manifest: ProjectManifest | null) {
  return isProjectStudioEditabilityContractV1(manifest?.authoring?.editabilityContract);
}

function usesSupportedNewCourseDriver(manifest: ProjectManifest | null) {
  const driverId = manifest?.authoring?.driverId;
  return Boolean(driverId && NEW_COURSE_DRIVER_IDS.has(driverId));
}

function hasExplicitStudioEditing(manifest: ProjectManifest | null) {
  return manifest?.authoring?.studioEditing?.enabled === true;
}

async function git(repoRoot: string, args: string[]) {
  const { stdout } = await execFileAsync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024
  });
  return stdout;
}

async function resolveRevision(repoRoot: string, revision: string) {
  try {
    return (await git(repoRoot, ["rev-parse", "--verify", `${revision}^{commit}`])).trim();
  } catch {
    return null;
  }
}

async function isAncestor(repoRoot: string, ancestor: string, descendant: string) {
  try {
    await git(repoRoot, ["merge-base", "--is-ancestor", ancestor, descendant]);
    return true;
  } catch {
    return false;
  }
}

async function revisionHasPolicyAnchor(repoRoot: string, revision: string) {
  try {
    await git(repoRoot, ["cat-file", "-e", `${revision}:${NEW_COURSE_EDITABILITY_POLICY_ANCHOR}`]);
    return true;
  } catch {
    return false;
  }
}

async function readManifestFile(filePath: string): Promise<ProjectManifest | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as ProjectManifest;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    return null;
  }
}

async function manifestFileExists(filePath: string) {
  try {
    const stats = await lstat(filePath);
    return stats.isFile() || stats.isSymbolicLink();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    return true;
  }
}

async function readManifestAtRevision(
  repoRoot: string,
  revision: string,
  manifestPath: string
): Promise<ProjectManifest | null> {
  try {
    return JSON.parse(await git(repoRoot, ["show", `${revision}:${manifestPath}`])) as ProjectManifest;
  } catch {
    return null;
  }
}

export async function selectNewCourseComparisonBase(input: {
  repoRoot: string;
  requestedBase?: string | null;
  policyInception?: string;
}) {
  const inceptionRevision = input.policyInception ?? NEW_COURSE_EDITABILITY_POLICY_INCEPTION;
  const head = await resolveRevision(input.repoRoot, "HEAD");
  if (!head) throw new Error("New-course readiness requires a valid Git HEAD.");
  const requested = input.requestedBase
    ? await resolveRevision(input.repoRoot, input.requestedBase)
    : null;
  if (
    requested &&
    await isAncestor(input.repoRoot, requested, head) &&
    await revisionHasPolicyAnchor(input.repoRoot, requested)
  ) {
    return requested;
  }
  const inception = await resolveRevision(input.repoRoot, inceptionRevision);
  if (inception && await isAncestor(input.repoRoot, inception, head)) return inception;
  if (requested && await revisionHasPolicyAnchor(input.repoRoot, head)) {
    // This is the bootstrap/squash-safe case: the reviewed policy anchor is
    // present at HEAD, but its pre-merge feature-branch SHA is not reachable.
    return head;
  }
  throw new Error(
    `New-course policy anchor ${NEW_COURSE_EDITABILITY_POLICY_ANCHOR} and inception ${inceptionRevision} are unavailable. Fetch full Git history or restore the reviewed policy anchor.`
  );
}

export async function discoverNewCourseReadinessCandidates(input: {
  repoRoot: string;
  requestedBase?: string | null;
  policyInception?: string;
}) {
  const repoRoot = path.resolve(input.repoRoot);
  const comparisonBase = await selectNewCourseComparisonBase(input);
  const exactHead = (await git(repoRoot, ["rev-parse", "HEAD"])).trim();
  const changedOutput = await git(repoRoot, [
    "diff",
    "--no-renames",
    "--name-only",
    "-z",
    `${comparisonBase}...${exactHead}`
  ]);
  const changedPaths = changedOutput.split("\0").filter(Boolean);
  const pathsBySlug = new Map<string, string[]>();
  for (const changedPath of changedPaths) {
    const slug = projectSlugForChangedPath(changedPath);
    if (!slug) continue;
    const current = pathsBySlug.get(slug) ?? [];
    current.push(changedPath);
    pathsBySlug.set(slug, current);
  }
  for (const { projectSlug, manifest } of await listCurrentGovernedManifests(repoRoot)) {
    const dependencies = await governedManifestDependencies(repoRoot, projectSlug, manifest);
    const matching = changedPaths.filter((changedPath) => (
      dependencies.some((dependency) => changedPathMatchesDependency(changedPath, dependency))
    ));
    if (!matching.length) continue;
    const current = pathsBySlug.get(projectSlug) ?? [];
    current.push(...matching);
    pathsBySlug.set(projectSlug, current);
  }

  const candidates: NewCourseReadinessCandidate[] = [];
  for (const [projectSlug, projectChangedPaths] of pathsBySlug) {
    const manifestPath = `projects/${projectSlug}/meta/project.json`;
    const currentManifestPath = path.join(repoRoot, manifestPath);
    const [manifest, baseManifest, currentManifestExists] = await Promise.all([
      readManifestFile(currentManifestPath),
      readManifestAtRevision(repoRoot, comparisonBase, manifestPath),
      manifestFileExists(currentManifestPath)
    ]);
    if (!manifest) {
      if (declaresEditabilityContract(baseManifest) || currentManifestExists) {
        candidates.push({
          projectSlug,
          trigger: baseManifest ? "governed-change" : "new-active",
          required: true,
          changedPaths: [...new Set(projectChangedPaths)].sort(codePointCompare),
          manifestPath,
          manifest: null
        });
      }
      continue;
    }

    const isNew = !baseManifest;
    const currentlyActive = activeStatus(manifest) || (!explicitlyNonActive(manifest) && isNew);
    const wasActive = activeStatus(baseManifest);
    const governed = declaresEditabilityContract(manifest) || declaresEditabilityContract(baseManifest);
    const newlyOnboardedSafeDriver = (
      currentlyActive &&
      usesSupportedNewCourseDriver(manifest) &&
      hasExplicitStudioEditing(manifest) &&
      (!usesSupportedNewCourseDriver(baseManifest) || !hasExplicitStudioEditing(baseManifest))
    );
    let trigger: NewCourseReadinessTrigger | null = null;
    let required = false;
    if (isNew && currentlyActive) {
      trigger = "new-active";
      required = true;
    } else if (isNew) {
      trigger = "new-non-active";
    } else if (currentlyActive && !wasActive) {
      trigger = "activated";
      required = true;
    } else if (newlyOnboardedSafeDriver) {
      trigger = "activated";
      required = true;
    } else if (currentlyActive && governed) {
      trigger = "governed-change";
      required = true;
    }
    if (!trigger) continue;
    candidates.push({
      projectSlug,
      trigger,
      required,
      changedPaths: [...new Set(projectChangedPaths)].sort(codePointCompare),
      manifestPath,
      manifest
    });
  }
  candidates.sort((left, right) => codePointCompare(left.projectSlug, right.projectSlug));
  return { comparisonBase, exactHead, candidates };
}

function evaluation(checks: NewCourseReadinessCheck[]): NewCourseReadinessEvaluation {
  const failedCodes = checks.filter((check) => !check.passed).map((check) => check.code);
  return { passed: failedCodes.length === 0, checks, failedCodes };
}

export function evaluateNewCourseManifestReadiness(
  manifest: ProjectManifest | null,
  expectedSlug: string
) {
  const normalized = manifest ? normalizeProjectManifestPolicy(manifest) : null;
  const policy = manifest ? validateProjectManifestPolicy(manifest) : null;
  const driverId = normalized?.authoring?.driverId;
  const checks: NewCourseReadinessCheck[] = [
    { code: "manifest-present", passed: Boolean(manifest) },
    { code: "manifest-slug", passed: manifest?.slug === expectedSlug },
    { code: "manifest-policy", passed: policy?.status === "valid" },
    { code: "migrated", passed: manifest?.migrationState === "migrated" },
    {
      code: "active-authoring-status",
      passed: manifest?.authoringStatus === "active" || manifest?.authoringStatus === "ready-for-export"
    },
    { code: "supported-new-course-driver", passed: Boolean(driverId && NEW_COURSE_DRIVER_IDS.has(driverId)) },
    { code: "studio-editing-enabled", passed: normalized?.authoring?.studioEditing?.enabled === true },
    { code: "rename-enabled", passed: normalized?.authoring?.studioEditing?.renameCourse === true },
    { code: "image-assets-enabled", passed: normalized?.authoring?.studioEditing?.imageAssets === true },
    {
      code: "versioned-editability-contract",
      passed: isProjectStudioEditabilityContractV1(normalized?.authoring?.editabilityContract)
    },
    {
      code: "direct-surface-declaration",
      passed: driverId !== "direct-workspace-v1" || Boolean(normalized?.authoring?.learnerSurfaces)
    }
  ];
  return evaluation(checks);
}

function ratioAtLeast(ratio: CourseEditCoverageRatio | null, minimum: number) {
  return Boolean(ratio && ratio.denominator > 0 && ratio.numerator / ratio.denominator >= minimum);
}

function breakdownAtLeast(breakdown: CourseEditCoverageBreakdown | undefined, minimum: number) {
  return Boolean(breakdown && breakdown.total > 0 && breakdown.supported / breakdown.total >= minimum);
}

function breakdownIsComplete(breakdown: CourseEditCoverageBreakdown | undefined) {
  return Boolean(breakdown && breakdown.total > 0 && breakdown.supported === breakdown.total);
}

export function evaluateNewCourseCoverageReadiness(report: CourseEditabilityProjectReport | null) {
  const checks: NewCourseReadinessCheck[] = [
    { code: "coverage-project-present", passed: Boolean(report) },
    { code: "coverage-complete", passed: report?.status === "complete" },
    { code: "inventory-complete", passed: report?.inventory.complete === true },
    { code: "learner-surfaces-present", passed: Boolean(report?.surfaces.length) },
    {
      code: "learner-surfaces-complete",
      passed: Boolean(report?.surfaces.length && report.surfaces.every((surface) => surface.status === "complete"))
    },
    {
      code: "block-coverage-90",
      passed: ratioAtLeast(report?.blockCoverage ?? null, NEW_COURSE_BLOCK_COVERAGE_MINIMUM)
    },
    {
      code: "teacher-text-coverage-90",
      passed: ratioAtLeast(report?.teacherTextCoverage ?? null, NEW_COURSE_TEXT_COVERAGE_MINIMUM)
    }
  ];

  for (const kind of STUDIO_ROUTINE_CONTENT_CANDIDATE_KINDS) {
    const breakdown = report?.candidatesByKind[kind];
    checks.push({
      code: `candidate-${kind}-present`,
      passed: Boolean(breakdown?.total)
    });
    checks.push({
      code: `candidate-${kind}-80`,
      passed: breakdownAtLeast(breakdown, NEW_COURSE_CATEGORY_COVERAGE_MINIMUM)
    });
  }
  checks.push({
    code: "course-name-100",
    passed: breakdownIsComplete(report?.candidatesByKind["course-name"])
  });
  for (const kind of STUDIO_ROUTINE_CONTENT_CAPABILITY_KINDS) {
    const breakdown = report?.capabilitiesByKind[kind];
    checks.push({
      code: `capability-${kind}-present`,
      passed: Boolean(breakdown?.total)
    });
    checks.push({
      code: `capability-${kind}-${kind === "rename-synchronization" ? "100" : "90"}`,
      passed: kind === "rename-synchronization"
        ? breakdownIsComplete(breakdown)
        : breakdownAtLeast(breakdown, NEW_COURSE_CAPABILITY_COVERAGE_MINIMUM)
    });
  }
  return evaluation(checks);
}
