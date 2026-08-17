import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type {
  CourseEditCoverageRatio,
  CourseEditabilityProjectReport
} from "../app/shared/course-editability.js";
import { getStringFlag, parseArgs } from "./lib/cli.js";
import { inspectCourseAuthoringProject } from "./lib/course-authoring/context.js";
import {
  buildCourseEditabilityReport,
  canonicalCourseEditabilityJson,
  writeCourseEditabilityReport
} from "./lib/course-editability/report.js";
import {
  NEW_COURSE_EDITABILITY_POLICY_INCEPTION,
  discoverNewCourseReadinessCandidates,
  evaluateNewCourseCoverageReadiness,
  evaluateNewCourseManifestReadiness,
  type NewCourseReadinessCandidate,
  type NewCourseReadinessEvaluation
} from "./lib/new-course-readiness.js";
import { repoRoot } from "./lib/paths.js";

const execFileAsync = promisify(execFile);

type Arguments = {
  base: string | null;
  reportPath: string;
  coverageReportPath: string;
};

type DoctorEvidence = {
  passed: boolean;
  status: string;
  driverId: string | null;
  driverSource: string | null;
  editingEnabled: boolean;
  issueCount: number;
};

type CoverageEvidence = {
  passed: boolean;
  status: string | null;
  inventoryComplete: boolean;
  learnerSurfaceCount: number;
  blockCoverage: CourseEditCoverageRatio | null;
  teacherTextCoverage: CourseEditCoverageRatio | null;
  failedCodes: string[];
};

type LifecycleEvidence = {
  passed: boolean;
  outcome: string;
  editableMapCount: number;
  annotationOnlyMapCount: number;
};

type ProjectEvidence = {
  projectSlug: string;
  trigger: NewCourseReadinessCandidate["trigger"];
  required: boolean;
  changedPathCount: number;
  changedPathDigest: string;
  status: "pass" | "fail" | "not-required";
  manifest: NewCourseReadinessEvaluation | null;
  doctor: DoctorEvidence | null;
  coverage: CoverageEvidence | null;
  lifecycle: LifecycleEvidence | null;
};

function usage() {
  return "Usage: npm run verify:new-course-readiness -- [--base <git-revision>] [--report <path>] [--coverage-report <path>]";
}

function parseArguments(argv: string[]): Arguments {
  const parsed = parseArgs(argv);
  const allowed = new Set(["base", "report", "coverage-report"]);
  const unknown = Object.keys(parsed.flags).filter((flag) => !allowed.has(flag));
  if (unknown.length || parsed.positionals.length) throw new Error(usage());
  return {
    base: getStringFlag(parsed, "base") ?? null,
    reportPath: path.resolve(
      repoRoot,
      getStringFlag(parsed, "report") ?? ".runtime/new-course-readiness.json"
    ),
    coverageReportPath: path.resolve(
      repoRoot,
      getStringFlag(parsed, "coverage-report") ?? ".runtime/new-course-editability-report.json"
    )
  };
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function coverageEvidence(
  project: CourseEditabilityProjectReport | null,
  evaluation: NewCourseReadinessEvaluation,
  globalFailedCodes: string[]
): CoverageEvidence {
  const failedCodes = [...new Set([...globalFailedCodes, ...evaluation.failedCodes])].sort();
  return {
    passed: failedCodes.length === 0,
    status: project?.status ?? null,
    inventoryComplete: project?.inventory.complete === true,
    learnerSurfaceCount: project?.surfaces.length ?? 0,
    blockCoverage: project?.blockCoverage ?? null,
    teacherTextCoverage: project?.teacherTextCoverage ?? null,
    failedCodes
  };
}

async function doctorEvidence(projectSlug: string): Promise<DoctorEvidence> {
  try {
    const doctor = await inspectCourseAuthoringProject(projectSlug, repoRoot);
    const editingEnabled = doctor.project?.studioEditing.enabled === true;
    const passed = (
      doctor.status === "pass" &&
      doctor.project?.driverSource === "declared" &&
      editingEnabled
    );
    return {
      passed,
      status: doctor.status,
      driverId: doctor.project?.driverId ?? null,
      driverSource: doctor.project?.driverSource ?? null,
      editingEnabled,
      issueCount: doctor.issues.length
    };
  } catch {
    return {
      passed: false,
      status: "error",
      driverId: null,
      driverSource: null,
      editingEnabled: false,
      issueCount: 1
    };
  }
}

async function lifecycleEvidence(projectSlug: string, exactHead: string): Promise<LifecycleEvidence> {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  try {
    const { stdout, stderr } = await execFileAsync(
      npmCommand,
      ["run", "verify:course-onboarding", "--", "--project", projectSlug],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...process.env, GITHUB_SHA: exactHead },
        maxBuffer: 64 * 1024 * 1024
      }
    );
    if (stdout.trim()) process.stdout.write(stdout);
    if (stderr.trim()) process.stderr.write(stderr);
    const report = JSON.parse(await readFile(
      path.join(repoRoot, ".runtime", "course-onboarding-verification.json"),
      "utf8"
    )) as {
      failed: number;
      results: Array<{
        projectSlug: string;
        reversiblePilot: string;
        map: { editableCount: number; annotationOnlyCount: number };
      }>;
    };
    const result = report.results.find((entry) => entry.projectSlug === projectSlug);
    const passed = report.failed === 0 && result?.reversiblePilot === "pass";
    return {
      passed,
      outcome: result?.reversiblePilot ?? "missing-result",
      editableMapCount: result?.map.editableCount ?? 0,
      annotationOnlyMapCount: result?.map.annotationOnlyCount ?? 0
    };
  } catch (error) {
    const output = error as { stdout?: string; stderr?: string };
    if (output.stdout?.trim()) process.stdout.write(output.stdout);
    if (output.stderr?.trim()) process.stderr.write(output.stderr);
    return {
      passed: false,
      outcome: "command-failed",
      editableMapCount: 0,
      annotationOnlyMapCount: 0
    };
  }
}

async function commitTimestamp() {
  const { stdout } = await execFileAsync("git", ["show", "-s", "--format=%cI", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  return stdout.trim();
}

async function writeReport(filePath: string, report: Record<string, unknown>) {
  const withoutDigest = { ...report };
  const reportDigest = sha256(canonicalCourseEditabilityJson(withoutDigest));
  const completed = { ...withoutDigest, reportDigest };
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, canonicalCourseEditabilityJson(completed), "utf8");
  return reportDigest;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const discovery = await discoverNewCourseReadinessCandidates({
    repoRoot,
    requestedBase: args.base
  });
  const required = discovery.candidates.filter((candidate) => candidate.required);
  const rows = new Map<string, ProjectEvidence>();
  const readyForCoverage: string[] = [];

  for (const candidate of discovery.candidates) {
    const changedPathDigest = sha256(`${candidate.changedPaths.join("\n")}\n`);
    if (!candidate.required) {
      rows.set(candidate.projectSlug, {
        projectSlug: candidate.projectSlug,
        trigger: candidate.trigger,
        required: false,
        changedPathCount: candidate.changedPaths.length,
        changedPathDigest,
        status: "not-required",
        manifest: null,
        doctor: null,
        coverage: null,
        lifecycle: null
      });
      continue;
    }
    console.log(`[new-course readiness] static contract: ${candidate.projectSlug}`);
    const manifest = evaluateNewCourseManifestReadiness(candidate.manifest, candidate.projectSlug);
    const doctor = manifest.passed
      ? await doctorEvidence(candidate.projectSlug)
      : null;
    if (manifest.passed && doctor?.passed) readyForCoverage.push(candidate.projectSlug);
    rows.set(candidate.projectSlug, {
      projectSlug: candidate.projectSlug,
      trigger: candidate.trigger,
      required: true,
      changedPathCount: candidate.changedPaths.length,
      changedPathDigest,
      status: manifest.passed && doctor?.passed ? "pass" : "fail",
      manifest,
      doctor,
      coverage: null,
      lifecycle: null
    });
  }

  let coverageReportDigest: string | null = null;
  if (readyForCoverage.length) {
    const coverageReport = await buildCourseEditabilityReport({
      repoRoot,
      projectSlugs: readyForCoverage,
      onProjectStart: (projectSlug, index, total) => {
        console.log(`[new-course readiness ${index}/${total}] rendered coverage: ${projectSlug}`);
      }
    });
    await writeCourseEditabilityReport(args.coverageReportPath, coverageReport);
    coverageReportDigest = coverageReport.reportDigest;
    const globalFailedCodes = [
      ...(!coverageReport.worktreeClean ? ["worktree-not-clean"] : []),
      ...(!coverageReport.residue.ok ? ["read-only-residue-failed"] : []),
      ...(coverageReport.exactCommit !== discovery.exactHead ? ["coverage-head-mismatch"] : [])
    ];
    for (const projectSlug of readyForCoverage) {
      const row = rows.get(projectSlug);
      if (!row) continue;
      const project = coverageReport.projects.find((entry) => entry.projectSlug === projectSlug) ?? null;
      const evaluated = evaluateNewCourseCoverageReadiness(project);
      row.coverage = coverageEvidence(project, evaluated, globalFailedCodes);
      if (!row.coverage.passed) row.status = "fail";
    }
  }

  for (const projectSlug of readyForCoverage) {
    const row = rows.get(projectSlug);
    if (!row || row.status !== "pass" || !row.coverage?.passed) continue;
    console.log(`[new-course readiness] reversible lifecycle: ${projectSlug}`);
    row.lifecycle = await lifecycleEvidence(projectSlug, discovery.exactHead);
    if (!row.lifecycle.passed) row.status = "fail";
  }

  const projects = [...rows.values()].sort((left, right) => left.projectSlug.localeCompare(right.projectSlug));
  const passed = required.length === projects.filter((row) => row.required && row.status === "pass").length;
  const reportPath = path.relative(repoRoot, args.reportPath);
  const reportDigest = await writeReport(args.reportPath, {
    schemaVersion: 1,
    policyInception: NEW_COURSE_EDITABILITY_POLICY_INCEPTION,
    comparisonBase: discovery.comparisonBase,
    exactCommit: discovery.exactHead,
    commitTimestamp: await commitTimestamp(),
    status: passed ? "pass" : "fail",
    requiredProjectCount: required.length,
    passedProjectCount: projects.filter((row) => row.required && row.status === "pass").length,
    coverageReportDigest,
    projects
  });
  console.log(`New-course readiness report: ${reportPath}`);
  console.log(`Exact commit: ${discovery.exactHead}`);
  console.log(`Comparison base: ${discovery.comparisonBase}`);
  console.log(`Required courses: ${required.length}`);
  console.log(`Gate: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Report digest: ${reportDigest}`);
  if (!passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
