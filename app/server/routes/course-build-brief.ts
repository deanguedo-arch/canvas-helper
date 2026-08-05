import type { IncomingMessage, ServerResponse } from "node:http";

import {
  inspectCourseAuthoringProject,
  type CourseAuthoringPath,
  type CourseDoctorIssue,
  type CourseDoctorReport
} from "../../../scripts/lib/course-authoring/context.ts";
import type { CourseBuildBrief, CourseBuildBriefIssue, CourseBuildBriefStatus } from "../../shared/course-build-brief.js";
import { sendJson } from "../lib/response";
import { isSafeProjectSlug } from "../lib/validation";

const MAX_SOURCES = 4;
const MAX_ISSUES = 4;

function inline(value: string, maximum: number) {
  const normalized = value.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
  return normalized.length > maximum ? `${normalized.slice(0, Math.max(0, maximum - 1))}…` : normalized;
}

function safeRepoPath(value: string) {
  const normalized = value.replaceAll("\\", "/").trim();
  if (
    !normalized ||
    normalized.startsWith("/") ||
    normalized.startsWith("~") ||
    /^[A-Za-z]:\//.test(normalized) ||
    normalized.split("/").some((segment) => !segment || segment === "." || segment === "..")
  ) {
    return null;
  }
  return normalized;
}

function safeCommand(value: string | undefined) {
  if (!value) {
    return null;
  }
  const normalized = inline(value, 360);
  return /(?:^|[\s"'=])(?:~[\\/]|\/(?!\/)|\\\\|[A-Za-z]:[\\/])/.test(normalized) || /\bfile:/i.test(normalized)
    ? null
    : normalized || null;
}

function safeIssue(issue: CourseDoctorIssue): CourseBuildBriefIssue {
  const message = inline(issue.message, 360)
    .replace(/(?:file:)?\/(?:Users|home|private|var|tmp)\/\S*/gi, "[local path]")
    .replace(/[A-Za-z]:[\\/]\S*/g, "[local path]");
  return {
    severity: issue.severity,
    code: inline(issue.code, 80) || "course-check",
    message: message || "Course authoring check reported an issue."
  };
}

function declaredPaths(paths: CourseAuthoringPath[]) {
  return paths
    .map((entry) => safeRepoPath(entry.repoRelative))
    .filter((entry): entry is string => Boolean(entry))
    .slice(0, MAX_SOURCES);
}

function statusFor(report: CourseDoctorReport): CourseBuildBriefStatus {
  if (report.status === "fail" || !report.project) {
    return "blocked";
  }
  if (report.project.authoringMode === "proposal-only") {
    return "proposal-only";
  }
  return report.status === "warning" ? "attention" : "ready";
}

export function buildCourseBuildBrief(report: CourseDoctorReport): CourseBuildBrief {
  const project = report.project;
  const status = statusFor(report);
  const issues = report.issues.slice(0, MAX_ISSUES).map(safeIssue);

  if (status === "proposal-only") {
    issues.unshift({
      severity: "warning",
      code: "proposal-only",
      message: "No safe editable source is declared yet. Collect inspection evidence, then establish a verified driver and rebuild path before editing."
    });
  }
  if (status === "blocked" && issues.length === 0) {
    issues.push({
      severity: "error",
      code: "course-check",
      message: "Course authoring checks did not produce a safe change route."
    });
  }

  return {
    projectSlug: inline(report.slug, 120),
    status,
    driver: project ? inline(project.driverId, 120) : null,
    mode: project?.authoringMode ?? null,
    editableSources: status === "blocked" || status === "proposal-only" || !project ? [] : declaredPaths(project.editableSources),
    sharedSources: status === "blocked" || !project ? [] : declaredPaths(project.sharedSources),
    generatedOutput: Boolean(project && project.authoringMode !== "direct"),
    rebuildCommand: project ? safeCommand(project.regenerateCommand) : null,
    validationCommand: `npm run course:doctor -- --project ${inline(report.slug, 120)}`,
    issues: issues.slice(0, MAX_ISSUES)
  };
}

export async function handleCourseBuildBriefRoute(url: string, request: IncomingMessage, response: ServerResponse) {
  const match = url.match(/^\/api\/projects\/([^/]+)\/authoring-brief$/);
  if (!match) {
    return false;
  }
  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed." });
    return true;
  }
  if (!isSafeProjectSlug(match[1])) {
    sendJson(response, 400, { error: "Invalid project slug." });
    return true;
  }

  try {
    sendJson(response, 200, buildCourseBuildBrief(await inspectCourseAuthoringProject(match[1])));
  } catch {
    sendJson(response, 400, { error: "Course build brief is unavailable." });
  }
  return true;
}
