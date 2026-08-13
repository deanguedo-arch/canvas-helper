import assert from "node:assert/strict";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  COURSE_EDIT_SCHEMA_VERSION,
  type CourseEditDraft,
  type CourseEditResolveRequest,
  type CourseEditTarget
} from "../app/shared/course-editing.js";
import {
  resolveCourseEditPageMap
} from "../app/server/lib/course-editing.js";
import { decoratePreviewHtml } from "../app/server/lib/preview-inspection.js";
import {
  courseEditFingerprintsMatch,
  fingerprintCourseEditPaths
} from "../app/server/lib/course-edit-transaction.js";
import {
  inspectCourseAuthoringProject,
  listCourseAuthoringProjects
} from "./lib/course-authoring/context.js";
import { collectEditableHtmlElements } from "./lib/course-editing/html.js";
import {
  startCourseEditHttpRouteHarness,
  type CourseEditHttpRouteHarness
} from "./lib/course-editing/http-route-harness.js";
import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { catalogPilotVisibleText } from "./lib/course-editing/catalog-pilot.js";
import { repoRoot } from "./lib/paths.js";

const PILOT_MARKER = "Studio catalog safety check";
const PILOT_TAG_PRIORITY = new Map([
  ["h2", 0], ["h3", 1], ["h1", 2], ["p", 3], ["li", 4], ["blockquote", 5],
  ["figcaption", 6], ["span", 7], ["small", 8], ["label", 9], ["td", 10], ["th", 11]
]);

type TargetResolution = {
  candidateKey: string;
  source: string;
  sourcePath: string;
  target: CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> };
  map: Awaited<ReturnType<typeof resolveCourseEditPageMap>>;
};

function errorMessages(error: unknown): string[] {
  if (error instanceof AggregateError) {
    return [error.message, ...error.errors.flatMap((nested) => errorMessages(nested))];
  }
  return [error instanceof Error ? error.message : String(error)];
}

function errorEvidence(error: unknown) {
  if (!(error instanceof AggregateError)) {
    return error instanceof Error ? error.stack || error.message : String(error);
  }
  return [error.stack || error.message, ...error.errors.flatMap((nested) => errorMessages(nested).map((message) => `Caused by: ${message}`))]
    .join("\n");
}

async function pathExists(value: string) {
  try {
    await access(value);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function requestFor(input: {
  projectSlug: string;
  nodeId: string;
  tagName: string;
  visibleText: string;
}): CourseEditResolveRequest {
  return {
    projectSlug: input.projectSlug,
    root: "workspace",
    htmlPath: "index.html",
    selection: {
      nodeId: input.nodeId,
      visibleText: input.visibleText,
      tagName: input.tagName,
      role: "",
      testId: "",
      geometry: { x: 20, y: 20, width: 600, height: 48 },
      viewport: { width: 1280, height: 800 },
      scroll: { windowTop: 0, windowLeft: 0, containers: [] },
      pageHref: `http://127.0.0.1:5173/preview/workspace/${input.projectSlug}/index.html`
    }
  };
}

async function resolvePilotTarget(
  projectSlug: string,
  http: CourseEditHttpRouteHarness,
  excludedCandidates = new Set<string>()
): Promise<{
  resolution: TargetResolution | null;
  map: Awaited<ReturnType<typeof resolveCourseEditPageMap>>;
}> {
  const sourcePath = path.join(repoRoot, "projects", projectSlug, "workspace", "index.html");
  const source = await readFile(sourcePath, "utf8");
  const document = decoratePreviewHtml(source);
  assert.ok(document, `Studio could not inspect ${projectSlug}.`);
  const map = await resolveCourseEditPageMap(projectSlug, "index.html", document, repoRoot);
  const elements = collectEditableHtmlElements(document.source, projectSlug, "index.html") ?? [];
  const eligibleElements = elements.filter((element) => (
      PILOT_TAG_PRIORITY.has(element.tagName) &&
      !Object.hasOwn(element.attributes, "data-canvas-helper-course-title") &&
      catalogPilotVisibleText(document.source.slice(element.innerStart, element.innerEnd)).length > 0 &&
      document.source.slice(element.innerStart, element.innerEnd).length <= 2_000
    ));
  const candidateGroups = [...PILOT_TAG_PRIORITY.keys()].map((tagName) => (
    eligibleElements.filter((element) => element.tagName === tagName).sort((left, right) => left.ordinal - right.ordinal)
  ));
  const candidates: typeof eligibleElements = [];
  for (let position = 0; candidates.length < 80; position += 1) {
    let added = false;
    for (const group of candidateGroups) {
      const candidate = group[position];
      if (!candidate) continue;
      candidates.push(candidate);
      added = true;
      if (candidates.length >= 80) break;
    }
    if (!added) break;
  }

  for (const element of candidates.slice(0, 80)) {
    const candidateKey = `${element.tagName}:${element.sourceStart}:${element.sourceEnd}`;
    if (excludedCandidates.has(candidateKey)) continue;
    const located = [...document.nodeLocations.entries()].find(([, location]) => (
      location.sourceStart === element.sourceStart && location.tagName === element.tagName
    ));
    if (!located) continue;
    const target = await http.resolve(requestFor({
      projectSlug,
      nodeId: located[0],
      tagName: element.tagName,
      visibleText: catalogPilotVisibleText(document.source.slice(element.innerStart, element.innerEnd))
    }));
    if (target.eligibility === "editable" && target.identity && target.capabilities.richText) {
      return {
        map,
        resolution: {
          candidateKey,
          source,
          sourcePath,
          target: target as CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> },
          map
        }
      };
    }
  }
  return { resolution: null, map };
}

function pilotDraft(target: TargetResolution["target"]): CourseEditDraft {
  const now = Date.now();
  return {
    id: `catalog-pilot-${target.identity.projectSlug}`,
    createdAt: now,
    updatedAt: now,
    identity: target.identity,
    beforeText: target.originalText,
    afterText: `${target.originalText} ${PILOT_MARKER}`,
    baseline: {
      originalHtml: target.originalHtml,
      attributes: target.attributes,
      currentStyle: target.currentStyle,
      capabilities: target.capabilities
    },
    patch: { html: `${target.originalHtml} <strong>${PILOT_MARKER}</strong>` }
  };
}

function verificationPaths(projectSlug: string, driverId: string, sourcePath: string) {
  const projectRoot = path.join(repoRoot, "projects", projectSlug);
  if (driverId === "direct-workspace-v1") return [sourcePath];
  if (driverId === "legacy-snapshot-v1") {
    return [sourcePath, path.join(projectRoot, "meta", "studio-edits.json")];
  }
  const paths = [path.join(projectRoot, "workspace"), path.join(projectRoot, "meta")];
  if (driverId === "english-factory-v1") {
    const resourceRoot = path.join(repoRoot, "projects", "resources", projectSlug);
    paths.push(path.join(resourceRoot, "teacher"), path.join(resourceRoot, "_extracted"));
  }
  return paths;
}

async function verifyProject(projectSlug: string, mapOnly: boolean, http: CourseEditHttpRouteHarness) {
  const startedAt = Date.now();
  const doctor = await inspectCourseAuthoringProject(projectSlug, repoRoot);
  assert.equal(doctor.status, "pass", `${projectSlug} did not pass course:doctor.`);
  assert.ok(doctor.project?.studioEditing.enabled, `${projectSlug} is not enabled for Studio editing.`);
  const resolved = await resolvePilotTarget(projectSlug, http);
  const mapEvidence = {
    available: resolved.map.available,
    editableCount: resolved.map.editableCount,
    annotationOnlyCount: resolved.map.annotationOnlyCount,
    truncated: resolved.map.truncated
  };
  if (mapOnly || !resolved.resolution) {
    return {
      projectSlug,
      driverId: doctor.project.driverId,
      adapter: resolved.resolution?.target.identity.adapter ?? null,
      map: mapEvidence,
      reversiblePilot: resolved.resolution ? "not-requested" : "no-source-owned-text-target",
      durationMs: Date.now() - startedAt
    };
  }

  const priorStatus = await http.status(projectSlug);
  const hasExistingCheckpoint = await pathExists(path.join(
    repoRoot,
    ".runtime",
    "studio-edit-checkpoints",
    projectSlug,
    "latest.json"
  ));
  if (priorStatus.canUndo || hasExistingCheckpoint) {
    return {
      projectSlug,
      driverId: doctor.project.driverId,
      adapter: resolved.resolution.target.identity.adapter,
      map: mapEvidence,
      reversiblePilot: "skipped-existing-user-checkpoint",
      durationMs: Date.now() - startedAt
    };
  }

  const paths = verificationPaths(projectSlug, doctor.project.driverId, resolved.resolution.sourcePath);
  const before = await fingerprintCourseEditPaths(repoRoot, paths);
  const excludedCandidates = new Set<string>();
  const attemptErrors: Error[] = [];
  let resolution: TargetResolution | null = resolved.resolution;
  for (let attempt = 0; resolution && attempt < 6; attempt += 1) {
    const activeResolution: TargetResolution = resolution;
    const styleMarkersBefore: number = activeResolution.source.split("data-canvas-helper-studio-edit-styles").length - 1;
    let applied = false;
    let undone = false;
    try {
      await http.apply({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug,
        drafts: [pilotDraft(activeResolution.target)]
      });
      applied = true;
      const reloadedSource: string = await readFile(activeResolution.sourcePath, "utf8");
      assert.match(reloadedSource, new RegExp(PILOT_MARKER), `${projectSlug} lost the edit after learner render/reload.`);
      const styleMarkersAfter: number = reloadedSource.split("data-canvas-helper-studio-edit-styles").length - 1;
      assert.equal(styleMarkersAfter, styleMarkersBefore, `${projectSlug} injected style infrastructure for a text-only edit.`);
      await http.undo(projectSlug);
      undone = true;
      const after = await fingerprintCourseEditPaths(repoRoot, paths);
      assert.ok(courseEditFingerprintsMatch(before, after), `${projectSlug} was not restored byte-for-byte.`);
      return {
        projectSlug,
        driverId: doctor.project.driverId,
        adapter: activeResolution.target.identity.adapter,
        map: mapEvidence,
        reversiblePilot: "pass",
        durationMs: Date.now() - startedAt
      };
    } catch (error) {
      if (!undone) {
        try {
          const status = await http.status(projectSlug);
          if (applied || status.canUndo) {
            await http.undo(projectSlug);
            undone = true;
          }
        } catch (undoError) {
          throw new AggregateError([error, undoError], `${projectSlug} failed and its recovery Undo also failed.`);
        }
      }
      const afterFailure = await fingerprintCourseEditPaths(repoRoot, paths);
      assert.ok(courseEditFingerprintsMatch(before, afterFailure), `${projectSlug} was not restored after a rejected pilot target.`);
      const attemptError = error instanceof Error ? error : new Error(String(error));
      attemptErrors.push(attemptError);
      console.warn(
        `  rejected ${activeResolution.target.identity.tagName} ${JSON.stringify(activeResolution.target.originalText.slice(0, 80))}: ${errorMessages(attemptError).join(" | ")}`
      );
      excludedCandidates.add(activeResolution.candidateKey);
      resolution = (await resolvePilotTarget(projectSlug, http, excludedCandidates)).resolution;
    }
  }
  if (attemptErrors.length && attemptErrors.every((error) => (
    errorMessages(error).some((message) => message.includes("Rendered-result validation failed"))
  ))) {
    return {
      projectSlug,
      driverId: doctor.project.driverId,
      adapter: resolved.resolution.target.identity.adapter,
      map: mapEvidence,
      reversiblePilot: "no-learner-stable-text-target",
      pilotRejections: [...new Set(attemptErrors.map((error) => error.message))],
      durationMs: Date.now() - startedAt
    };
  }
  throw new AggregateError(attemptErrors, `${projectSlug} failed its reversible pilot.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const project = getStringFlag(args, "project");
  const from = getStringFlag(args, "from");
  const all = hasFlag(args, "all");
  const mapOnly = hasFlag(args, "map-only");
  const unknown = Object.keys(args.flags).filter((flag) => !["project", "from", "all", "map-only"].includes(flag));
  if (unknown.length || args.positionals.length || (!project && !all) || (project && all) || (from && !all)) {
    throw new Error("Usage: npm run verify:course-onboarding -- (--all [--from <slug>] | --project <slug>) [--map-only]");
  }
  const rows = await listCourseAuthoringProjects({ includeAll: true, repoRoot });
  let selected = project
    ? rows.filter((row) => row.slug === project)
    : rows.filter((row) => ["direct-ready", "factory-ready", "snapshot-ready"].includes(row.readiness));
  if (from) {
    const start = selected.findIndex((row) => row.slug === from);
    if (start < 0) throw new Error(`No onboarded start course matched ${from}.`);
    selected = selected.slice(start);
  }
  if (!selected.length) throw new Error(`No onboarded course matched ${project ?? "--all"}.`);

  const http = await startCourseEditHttpRouteHarness(repoRoot);
  const results = [];
  const failures: Array<{ projectSlug: string; error: string }> = [];
  try {
    for (const row of selected) {
      console.log(`[course onboarding] ${row.slug}`);
      try {
        const result = await verifyProject(row.slug, mapOnly, http);
        results.push(result);
        console.log(`  ${result.reversiblePilot}; ${result.map.editableCount} mapped editable target(s)`);
      } catch (error) {
        const message = errorEvidence(error);
        failures.push({ projectSlug: row.slug, error: message });
        console.error(`  FAIL: ${message}`);
      }
    }
  } finally {
    await http.close();
  }
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    commitSha: process.env.GITHUB_SHA ?? null,
    mapOnly,
    requested: selected.length,
    passed: results.length,
    failed: failures.length,
    results,
    failures
  };
  const reportPath = path.join(repoRoot, ".runtime", "course-onboarding-verification.json");
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  if (failures.length) throw new Error(`${failures.length}/${selected.length} course onboarding verification(s) failed.`);
  console.log(`PASS: ${results.length}/${selected.length} onboarded courses verified.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
