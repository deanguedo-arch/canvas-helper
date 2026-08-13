import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";

import {
  COURSE_EDIT_SCHEMA_VERSION,
  type CourseEditDraft,
  type CourseEditResolveRequest,
  type CourseEditTarget
} from "../app/shared/course-editing.js";
import { decoratePreviewHtml } from "../app/server/lib/preview-inspection.js";
import {
  courseEditFingerprintsMatch,
  fingerprintCourseEditPaths
} from "../app/server/lib/course-edit-transaction.js";
import { inspectCourseAuthoringProject } from "./lib/course-authoring/context.js";
import { collectEditableHtmlElements } from "./lib/course-editing/html.js";
import {
  startCourseEditHttpRouteHarness,
  type CourseEditHttpRouteHarness
} from "./lib/course-editing/http-route-harness.js";
import { getStringFlag, parseArgs } from "./lib/cli.js";
import { repoRoot } from "./lib/paths.js";

const PILOT_MARKER = "Studio safety pilot check";

type Pilot = {
  projectSlug: string;
  selector: { attribute: "id" | "class"; value: string };
};

const PILOTS: Pilot[] = [
  {
    projectSlug: "mental-health-wellness",
    selector: { attribute: "id", value: "course-subtitle" }
  },
  {
    projectSlug: "ela20-1-short-stories-pilot",
    selector: { attribute: "class", value: "page-intro" }
  },
  {
    projectSlug: "social30-1-related-issue-1-option-2",
    selector: { attribute: "class", value: "page-intro" }
  },
  {
    projectSlug: "ela10-2-writing-foundations",
    selector: { attribute: "id", value: "outcomes-title" }
  }
];

function textFromHtml(value: string) {
  return load(`<body>${value}</body>`)("body").text().replace(/\s+/g, " ").trim();
}

function matchesSelector(attributes: Record<string, string>, selector: Pilot["selector"]) {
  const value = attributes[selector.attribute] ?? "";
  return selector.attribute === "class"
    ? value.split(/\s+/).includes(selector.value)
    : value === selector.value;
}

async function resolvePilotTarget(pilot: Pilot, http: CourseEditHttpRouteHarness) {
  const htmlPath = "index.html";
  const sourcePath = path.join(repoRoot, "projects", pilot.projectSlug, "workspace", htmlPath);
  const source = await readFile(sourcePath, "utf8");
  const document = decoratePreviewHtml(source);
  assert.ok(document, `Studio could not inspect ${pilot.projectSlug}.`);
  const editable = collectEditableHtmlElements(document.source, pilot.projectSlug, htmlPath)?.find((element) => (
    matchesSelector(element.attributes, pilot.selector)
  ));
  assert.ok(editable, `Pilot selector did not resolve for ${pilot.projectSlug}.`);
  const located = [...document.nodeLocations.entries()].find(([, location]) => (
    location.sourceStart === editable.sourceStart && location.tagName === editable.tagName
  ));
  assert.ok(located, `Pilot target was not inspectable for ${pilot.projectSlug}.`);
  const originalHtml = document.source.slice(editable.innerStart, editable.innerEnd);
  const request: CourseEditResolveRequest = {
    projectSlug: pilot.projectSlug,
    root: "workspace",
    htmlPath,
    selection: {
      nodeId: located[0],
      visibleText: textFromHtml(originalHtml),
      tagName: editable.tagName,
      role: "",
      testId: "",
      geometry: { x: 20, y: 20, width: 600, height: 48 },
      viewport: { width: 1280, height: 800 },
      scroll: { windowTop: 0, windowLeft: 0, containers: [] },
      pageHref: `http://127.0.0.1:5173/preview/workspace/${pilot.projectSlug}/${htmlPath}`
    }
  };
  const target = await http.resolve(request);
  assert.equal(target.eligibility, "editable", `${pilot.projectSlug}: ${target.reason}`);
  assert.ok(target.identity, `${pilot.projectSlug}: target identity is missing.`);
  return { source, target: target as CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> } };
}

function pilotDraft(target: CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> }): CourseEditDraft {
  const now = Date.now();
  return {
    id: `pilot-${target.identity.projectSlug}`,
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

function restorationPaths(projectSlug: string, driverId: string) {
  const projectRoot = path.join(repoRoot, "projects", projectSlug);
  const paths = [path.join(projectRoot, "workspace"), path.join(projectRoot, "meta")];
  if (driverId === "english-factory-v1") {
    const resourceRoot = path.join(repoRoot, "projects", "resources", projectSlug);
    paths.push(
      path.join(resourceRoot, "teacher"),
      path.join(resourceRoot, "_extracted")
    );
  }
  return paths;
}

async function runPilot(pilot: Pilot) {
  const startedAt = Date.now();
  let http = await startCourseEditHttpRouteHarness(repoRoot);
  const doctor = await inspectCourseAuthoringProject(pilot.projectSlug);
  assert.equal(doctor.status, "pass", `${pilot.projectSlug} did not pass course:doctor.`);
  assert.ok(doctor.project, `${pilot.projectSlug} has no resolved authoring project.`);
  assert.equal(doctor.project.driverSource, "declared", `${pilot.projectSlug} is not explicitly onboarded.`);
  assert.equal(doctor.project.studioEditing.enabled, true, `${pilot.projectSlug} is not enabled for Studio editing.`);

  const priorStatus = await http.status(pilot.projectSlug);
  assert.equal(priorStatus.canUndo, false, `${pilot.projectSlug} already has an Undo checkpoint; the pilot refused to replace it.`);
  const fingerprintPaths = restorationPaths(pilot.projectSlug, doctor.project.driverId);
  const before = await fingerprintCourseEditPaths(repoRoot, fingerprintPaths);
  const { source, target } = await resolvePilotTarget(pilot, http);
  const styleMarkersBefore = source.split("data-canvas-helper-studio-edit-styles").length - 1;
  let applied = false;
  let undone = false;
  let applyResult: Awaited<ReturnType<CourseEditHttpRouteHarness["apply"]>> | null = null;
  let finalStatus: Awaited<ReturnType<CourseEditHttpRouteHarness["status"]>> | null = null;

  try {
    applyResult = await http.apply({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: pilot.projectSlug,
      drafts: [pilotDraft(target)]
    });
    applied = true;
    assert.equal(applyResult.canUndo, true, `${pilot.projectSlug} did not expose its successful batch to Undo.`);
    assert.equal(applyResult.appliedCount, 1, `${pilot.projectSlug} applied an unexpected draft count.`);

    const reloaded = await resolvePilotTarget(pilot, http);
    assert.match(reloaded.target.originalText, new RegExp(PILOT_MARKER), `${pilot.projectSlug} lost the edit after rebuild/reload.`);
    const styleMarkersAfter = reloaded.source.split("data-canvas-helper-studio-edit-styles").length - 1;
    assert.equal(
      styleMarkersAfter,
      styleMarkersBefore,
      `${pilot.projectSlug} added styling infrastructure for a text-only pilot edit.`
    );

    await http.close();
    http = await startCourseEditHttpRouteHarness(repoRoot);
    assert.equal((await http.status(pilot.projectSlug)).canUndo, true, `${pilot.projectSlug} lost Undo state after the HTTP server restart.`);
    const undoResult = await http.undo(pilot.projectSlug);
    undone = true;
    assert.equal(undoResult.canUndo, false, `${pilot.projectSlug} retained an Undo checkpoint after restoration.`);
    finalStatus = await http.status(pilot.projectSlug);
  } catch (error) {
    if (applied && !undone) {
      try {
        await http.undo(pilot.projectSlug);
        undone = true;
      } catch (undoError) {
        throw new AggregateError([error, undoError], `${pilot.projectSlug} pilot failed and its recovery Undo also failed.`);
      }
    }
    throw error;
  } finally {
    await http.close().catch(() => undefined);
  }

  const after = await fingerprintCourseEditPaths(repoRoot, fingerprintPaths);
  assert.ok(courseEditFingerprintsMatch(before, after), `${pilot.projectSlug} was not restored byte-for-byte after Undo.`);
  assert.equal(finalStatus?.canUndo, false, `${pilot.projectSlug} still reports Undo after the pilot.`);

  const restoredFiles = before.reduce((total, entry) => total + entry.fileCount, 0);
  const restoredBytes = before.reduce((total, entry) => total + entry.byteCount, 0);
  return {
    projectSlug: pilot.projectSlug,
    driverId: doctor.project.driverId,
    adapter: target.identity.adapter,
    apply: "pass",
    rebuild: target.identity.adapter === "direct" ? "not-required" : "pass",
    renderedResult: "pass",
    reload: "pass",
    serverRestart: "pass",
    undo: "pass",
    byteForByteRestore: "pass",
    restoredFiles,
    restoredBytes,
    staleExportTargetsAfterApply: applyResult?.staleExportTargets ?? [],
    durationMs: Date.now() - startedAt
  };
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const requestedProject = getStringFlag(parsed, "project");
  const selected = requestedProject
    ? PILOTS.filter((pilot) => pilot.projectSlug === requestedProject)
    : PILOTS;
  if (!selected.length) {
    throw new Error(`Unknown Direct Editing pilot project: ${requestedProject}`);
  }

  const results = [];
  for (const pilot of selected) {
    console.log(`\n[Studio adapter pilot] ${pilot.projectSlug}`);
    const result = await runPilot(pilot);
    results.push(result);
    console.log(JSON.stringify(result, null, 2));
  }
  const reportPath = path.join(repoRoot, ".runtime", "course-editing-pilots.json");
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    commitSha: process.env.GITHUB_SHA ?? null,
    requested: selected.length,
    passed: results.length,
    results
  }, null, 2)}\n`, "utf8");
  console.log(`\nPASS: ${results.length}/${selected.length} real-course adapter pilots restored their sources.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
