import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import {
  COURSE_EDITABILITY_CANDIDATE_SCHEMA_VERSION,
  COURSE_EDITABILITY_INVENTORY_SCHEMA_VERSION,
  COURSE_EDITABILITY_ISOLATION_PROFILE_VERSION,
  COURSE_EDITABILITY_REASON_REGISTRY_VERSION,
  type CourseEditabilityCoverageReport,
  type CourseEditabilityResidueProof,
  type LearnerSurface
} from "../../../app/shared/course-editability.js";
import { resolveLearnerSurfaceInventory } from "./inventory.js";
import { listCourseEditabilityProjectSlugsReadOnly } from "./read-only-project.js";
import {
  fingerprintCourseEditPaths,
  type CourseEditPathFingerprint
} from "../../../app/server/lib/course-edit-transaction.js";
import {
  COURSE_EDITABILITY_RENDER_LIMITS,
  RenderedCourseEditabilityCollector,
  type RenderedSurfaceCollection
} from "./rendered.js";
import { scoreAggregate, scoreProject } from "./scoring.js";

const execFileAsync = promisify(execFile);

type RepositoryState = {
  digest: string;
  clean: boolean;
  gitDigest: string;
  boundaries: CourseEditPathFingerprint[];
};

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

async function git(repoRoot: string, args: string[]) {
  const { stdout } = await execFileAsync("git", args, { cwd: repoRoot, encoding: "buffer", maxBuffer: 128 * 1024 * 1024 });
  return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
}

async function repositoryState(repoRoot: string): Promise<RepositoryState> {
  const slugs = await listCourseEditabilityProjectSlugsReadOnly(repoRoot);
  const boundaryPaths = [
    ...slugs.flatMap((slug) => [
      path.join(repoRoot, "projects", slug),
      path.join(repoRoot, "projects", "resources", slug)
    ]),
    ...[
      "studio-edit-status",
      "studio-edit-checkpoints",
      "studio-edit-transactions",
      "studio-edit-locks"
    ].map((entry) => path.join(repoRoot, ".runtime", entry))
  ].sort(codePointCompare);
  const [status, workingDiff, indexDiff, boundaries] = await Promise.all([
    git(repoRoot, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]),
    git(repoRoot, ["diff", "--no-ext-diff", "--binary"]),
    git(repoRoot, ["diff", "--cached", "--no-ext-diff", "--binary"]),
    fingerprintCourseEditPaths(repoRoot, boundaryPaths)
  ]);
  boundaries.sort((left, right) => codePointCompare(left.repoRelativePath, right.repoRelativePath));
  const gitDigest = createHash("sha256").update(status).update(workingDiff).update(indexDiff).digest("hex");
  const digest = sha256(canonicalCourseEditabilityJson({ gitDigest, boundaries }));
  return { digest, clean: status.length === 0, gitDigest, boundaries };
}

function repositoryChangedPaths(before: RepositoryState, after: RepositoryState) {
  const changed = new Set<string>();
  if (before.gitDigest !== after.gitDigest) changed.add("repository-git-state");
  const beforeByPath = new Map(before.boundaries.map((entry) => [entry.repoRelativePath, entry]));
  const afterByPath = new Map(after.boundaries.map((entry) => [entry.repoRelativePath, entry]));
  for (const pathName of new Set([...beforeByPath.keys(), ...afterByPath.keys()])) {
    if (JSON.stringify(beforeByPath.get(pathName)) !== JSON.stringify(afterByPath.get(pathName))) changed.add(pathName);
  }
  return [...changed].sort(codePointCompare);
}

function codePointCompare(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => codePointCompare(left, right))
      .map(([key, entry]) => [key, canonicalValue(entry)])
  );
}

export function canonicalCourseEditabilityJson(value: unknown) {
  return `${JSON.stringify(canonicalValue(value))}\n`;
}

export function courseEditabilityReportDigest(report: Omit<CourseEditabilityCoverageReport, "reportDigest">) {
  return sha256(canonicalCourseEditabilityJson(report));
}

export type BuildCourseEditabilityReportOptions = {
  repoRoot: string;
  projectSlugs?: string[];
  inventoryOnly?: boolean;
  onProjectStart?: (projectSlug: string, index: number, total: number) => void;
};

export type CourseEditabilitySurfaceCollector = {
  collect(
    surface: LearnerSurface,
    declaredSurfaces?: readonly LearnerSurface[]
  ): Promise<RenderedSurfaceCollection>;
};

export async function collectCourseEditabilitySurfaces(
  collector: CourseEditabilitySurfaceCollector,
  surfaces: readonly LearnerSurface[],
  maximumWorkers = COURSE_EDITABILITY_RENDER_LIMITS.maximumWorkers
): Promise<RenderedSurfaceCollection[]> {
  if (!surfaces.length) return [];
  const workerCount = Math.min(
    surfaces.length,
    Math.max(1, Math.floor(maximumWorkers))
  );
  const collections = new Array<RenderedSurfaceCollection>(surfaces.length);
  let nextIndex = 0;
  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < surfaces.length) {
      const index = nextIndex;
      nextIndex += 1;
      collections[index] = await collector.collect(surfaces[index], surfaces);
    }
  });
  await Promise.all(workers);
  return collections;
}

export async function buildCourseEditabilityReport(
  options: BuildCourseEditabilityReportOptions
): Promise<CourseEditabilityCoverageReport> {
  const repoRoot = path.resolve(options.repoRoot);
  const before = await repositoryState(repoRoot);
  const [exactCommitBuffer, commitTimestampBuffer] = await Promise.all([
    git(repoRoot, ["rev-parse", "HEAD"]),
    git(repoRoot, ["show", "-s", "--format=%cI", "HEAD"])
  ]);
  const exactCommit = exactCommitBuffer.toString("utf8").trim();
  const commitTimestamp = commitTimestampBuffer.toString("utf8").trim();
  const slugs = options.projectSlugs?.length
    ? [...new Set(options.projectSlugs)].sort(codePointCompare)
    : await listCourseEditabilityProjectSlugsReadOnly(repoRoot);
  let collector: RenderedCourseEditabilityCollector | null = null;
  const projects = [];
  try {
    if (!options.inventoryOnly) collector = await RenderedCourseEditabilityCollector.create(repoRoot, commitTimestamp);
    for (const [index, projectSlug] of slugs.entries()) {
      options.onProjectStart?.(projectSlug, index + 1, slugs.length);
      const inventoryResult = await resolveLearnerSurfaceInventory(projectSlug, repoRoot);
      const { adapter, ...inventory } = inventoryResult;
      let collections: RenderedSurfaceCollection[] = [];
      if (inventory.complete && collector) {
        collections = await collectCourseEditabilitySurfaces(collector, inventory.surfaces);
      }
      projects.push(scoreProject({ projectSlug, adapter, inventory, collections }));
    }
  } finally {
    await collector?.close();
  }
  projects.sort((left, right) => codePointCompare(left.projectSlug, right.projectSlug));
  const after = await repositoryState(repoRoot);
  const changedPaths = repositoryChangedPaths(before, after);
  const browserStorageWriteAttemptCount = projects.reduce(
    (total, project) => total + (project.reasons["storage-write-attempt"] ?? 0),
    0
  );
  // Storage writes are blocked and make their individual surface incomplete.
  // The collector uses fresh non-persistent contexts and closes the temporary
  // browser profile before this proof is assembled, so an attempt is not
  // itself persistent browser residue.
  const browserStorageResidue = false;
  const residue: CourseEditabilityResidueProof = {
    ok: before.digest === after.digest && changedPaths.length === 0 && !browserStorageResidue,
    changedPaths,
    browserStorageWriteAttemptCount,
    browserStorageResidue
  };
  const scoredAggregate = scoreAggregate(projects);
  const aggregate = residue.ok
    ? scoredAggregate
    : {
        ...scoredAggregate,
        status: "incomplete" as const,
        blockCoverage: null,
        teacherTextCoverage: null
      };
  const withoutDigest: Omit<CourseEditabilityCoverageReport, "reportDigest"> = {
    schemaVersion: 1,
    exactCommit,
    commitTimestamp,
    worktreeClean: before.clean,
    inventorySchemaVersion: COURSE_EDITABILITY_INVENTORY_SCHEMA_VERSION,
    candidateSchemaVersion: COURSE_EDITABILITY_CANDIDATE_SCHEMA_VERSION,
    reasonRegistryVersion: COURSE_EDITABILITY_REASON_REGISTRY_VERSION,
    isolationProfileVersion: COURSE_EDITABILITY_ISOLATION_PROFILE_VERSION,
    limits: { ...COURSE_EDITABILITY_RENDER_LIMITS },
    projects,
    aggregate,
    residue
  };
  return { ...withoutDigest, reportDigest: courseEditabilityReportDigest(withoutDigest) };
}

export async function writeCourseEditabilityReport(filePath: string, report: CourseEditabilityCoverageReport) {
  const resolved = path.resolve(filePath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, canonicalCourseEditabilityJson(report), "utf8");
  const parsed = JSON.parse(await readFile(resolved, "utf8")) as CourseEditabilityCoverageReport;
  const { reportDigest, ...withoutDigest } = parsed;
  if (courseEditabilityReportDigest(withoutDigest) !== reportDigest) {
    throw new Error("The written course-editability report digest did not verify.");
  }
}
