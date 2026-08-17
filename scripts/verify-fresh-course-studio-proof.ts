import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import type {
  CourseEditApplyRequest,
  CourseEditDraft,
  CourseEditResolveRequest,
  CourseEditTarget
} from "../app/shared/course-editing.js";
import { COURSE_EDIT_SCHEMA_VERSION } from "../app/shared/course-editing.js";
import type { CourseEditabilityCoverageReport } from "../app/shared/course-editability.js";
import { decoratePreviewHtml } from "../app/server/lib/preview-inspection.js";
import {
  courseEditFingerprintsMatch,
  fingerprintCourseEditPaths
} from "../app/server/lib/course-edit-transaction.js";
import {
  loadCourseEditDrafts,
  saveCourseEditDrafts
} from "../app/studio/src/lib/course-edit-storage.js";
import { collectEditableHtmlElements } from "./lib/course-editing/html.js";
import {
  startCourseEditHttpRouteHarness,
  type CourseEditHttpRouteHarness
} from "./lib/course-editing/http-route-harness.js";
import { parseArgs, getStringFlag, hasFlag } from "./lib/cli.js";
import { evaluateNewCourseCoverageReadiness } from "./lib/new-course-readiness.js";
import { repoRoot } from "./lib/paths.js";

const execFileAsync = promisify(execFile);
const PROOF_SCHEMA_VERSION = 1;
const PROOF_MARKER = "Fresh Studio proof edit.";

type Arguments = {
  reportPath: string;
  isolated: boolean;
};

type CommandResult = {
  stdout: string;
  stderr: string;
};

type FreshCourseProof = {
  schemaVersion: typeof PROOF_SCHEMA_VERSION;
  status: "pass" | "fail";
  implementationSha: string;
  createdWith: "npm run course:create";
  execution: "ephemeral-clean-checkout";
  projectSlug: string | null;
  checks: Record<string, unknown>;
  error?: string;
};

function usage() {
  return "Usage: npm run verify:fresh-course-studio-proof -- [--report <path>]";
}

function parseArguments(argv: string[]): Arguments {
  const parsed = parseArgs(argv);
  const allowed = new Set(["report", "in-isolated-checkout", "help", "h"]);
  const unknown = Object.keys(parsed.flags).filter((flag) => !allowed.has(flag));
  if (unknown.length || parsed.positionals.length) throw new Error(usage());
  if (hasFlag(parsed, "help") || hasFlag(parsed, "h")) {
    console.log(usage());
    process.exit(0);
  }
  return {
    reportPath: path.resolve(repoRoot, getStringFlag(parsed, "report") ?? ".runtime/fresh-course-studio-proof.json"),
    isolated: hasFlag(parsed, "in-isolated-checkout")
  };
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

async function command(commandName: string, args: string[], cwd: string): Promise<CommandResult> {
  try {
    const result = await execFileAsync(commandName, args, {
      cwd,
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
      env: { ...process.env }
    });
    const stdout = String(result.stdout ?? "");
    const stderr = String(result.stderr ?? "");
    if (stdout.trim()) process.stdout.write(stdout);
    if (stderr.trim()) process.stderr.write(stderr);
    return { stdout, stderr };
  } catch (error) {
    const result = error as { stdout?: string; stderr?: string; message?: string };
    if (result.stdout?.trim()) process.stdout.write(result.stdout);
    if (result.stderr?.trim()) process.stderr.write(result.stderr);
    throw new Error(result.message ?? `Command failed: ${commandName} ${args.join(" ")}`);
  }
}

async function git(cwd: string, args: string[]) {
  return (await command("git", args, cwd)).stdout.trim();
}

async function writeReport(reportPath: string, report: FreshCourseProof) {
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function textFromHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveRequestForEditKey(input: {
  source: string;
  projectSlug: string;
  editKey: string;
}): CourseEditResolveRequest {
  const document = decoratePreviewHtml(input.source);
  assert.ok(document, "Studio could not build an inspection document for the fresh course.");
  const element = collectEditableHtmlElements(document.source, input.projectSlug, "index.html")?.find(
    (candidate) => candidate.attributes["data-canvas-helper-edit-key"] === input.editKey
  );
  assert.ok(element, `The fresh course is missing editable ${input.editKey} content.`);
  const located = [...document.nodeLocations.entries()].find(([, location]) => (
    location.sourceStart === element.sourceStart && location.tagName === element.tagName
  ));
  assert.ok(located, `The fresh course ${input.editKey} target is not inspectable.`);
  return {
    projectSlug: input.projectSlug,
    root: "workspace",
    htmlPath: "index.html",
    selection: {
      nodeId: located[0],
      visibleText: textFromHtml(document.source.slice(element.innerStart, element.innerEnd)),
      tagName: element.tagName,
      role: "",
      testId: "",
      geometry: { x: 20, y: 20, width: 640, height: 64 },
      viewport: { width: 1280, height: 800 },
      scroll: { windowTop: 0, windowLeft: 0, containers: [] },
      pageHref: `http://127.0.0.1:5173/preview/workspace/${input.projectSlug}/index.html`
    }
  };
}

function createDraft(target: CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> }): CourseEditDraft {
  const now = Date.now();
  return {
    id: "fresh-studio-proof-draft",
    createdAt: now,
    updatedAt: now,
    identity: target.identity,
    beforeText: target.originalText,
    afterText: `${target.originalText} ${PROOF_MARKER}`,
    baseline: {
      originalHtml: target.originalHtml,
      attributes: target.attributes,
      currentStyle: target.currentStyle,
      capabilities: target.capabilities
    },
    patch: { html: `${target.originalHtml} ${PROOF_MARKER}` }
  };
}

function assertDraftStorageRoundTrip(projectSlug: string, draft: CourseEditDraft) {
  const values = new Map<string, string>();
  const localStorage = {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
    removeItem(key: string) { values.delete(key); },
    clear() { values.clear(); },
    key(index: number) { return [...values.keys()][index] ?? null; },
    get length() { return values.size; }
  };
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage } });
  try {
    assert.equal(saveCourseEditDrafts(projectSlug, [draft]), true, "Studio could not save the canonical fresh-course draft locally.");
    const restored = loadCourseEditDrafts(projectSlug);
    assert.equal(restored.length, 1, "Studio did not recover the saved fresh-course draft.");
    assert.equal(restored[0]?.canonicalPatchDigest, draft.canonicalPatchDigest, "Studio recovered a different canonical draft.");
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

async function runLifecycle(input: {
  isolatedRoot: string;
  projectSlug: string;
  workspaceEntry: string;
}) {
  const projectRoot = path.join(input.isolatedRoot, "projects", input.projectSlug);
  const resourceRoot = path.join(input.isolatedRoot, "projects", "resources", input.projectSlug);
  const before = await fingerprintCourseEditPaths(input.isolatedRoot, [projectRoot, resourceRoot]);
  const original = await readFile(input.workspaceEntry, "utf8");
  let http: CourseEditHttpRouteHarness | null = await startCourseEditHttpRouteHarness(input.isolatedRoot);
  let applied = false;
  let undone = false;
  try {
    const resolved = await http.resolve(resolveRequestForEditKey({
      source: original,
      projectSlug: input.projectSlug,
      editKey: "course-summary"
    }));
    assert.equal(resolved.eligibility, "editable", `Fresh-course Resolve rejected the declared course summary: ${resolved.reason}`);
    assert.ok(resolved.identity, "Fresh-course Resolve returned no durable identity.");
    const target = resolved as CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> };
    const draft = createDraft(target);
    const normalized = await http.normalize(draft.identity, draft.patch);
    draft.patch = normalized.canonicalPatch;
    draft.canonicalPatchDigest = normalized.canonicalPatchDigest;
    assertDraftStorageRoundTrip(input.projectSlug, draft);

    const appliedResult = await http.apply({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: input.projectSlug,
      drafts: [draft]
    } satisfies CourseEditApplyRequest);
    applied = true;
    assert.equal(appliedResult.ok, true, "Fresh-course Apply did not return success.");
    assert.equal(appliedResult.appliedCount, 1, "Fresh-course Apply did not apply exactly one draft.");
    assert.equal(appliedResult.canUndo, true, "Fresh-course Apply did not create an Undo checkpoint.");

    const afterApply = await readFile(input.workspaceEntry, "utf8");
    const reloaded = await http.resolve(resolveRequestForEditKey({
      source: afterApply,
      projectSlug: input.projectSlug,
      editKey: "course-summary"
    }));
    assert.equal(reloaded.eligibility, "editable", `Fresh-course Reload Resolve rejected the saved element: ${reloaded.reason}`);
    assert.match(reloaded.originalText, new RegExp(PROOF_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "Fresh-course reload lost the applied text.");

    await http.close();
    http = await startCourseEditHttpRouteHarness(input.isolatedRoot);
    assert.equal((await http.status(input.projectSlug)).canUndo, true, "Fresh-course Undo did not survive server restart.");
    const undoneResult = await http.undo(input.projectSlug);
    undone = true;
    assert.equal(undoneResult.ok, true, "Fresh-course Undo did not return success.");
    assert.equal(undoneResult.canUndo, false, "Fresh-course Undo checkpoint was not cleared.");
    assert.equal(await readFile(input.workspaceEntry, "utf8"), original, "Fresh-course Undo did not restore the exact learner source bytes.");
    assert.equal((await http.status(input.projectSlug)).canUndo, false, "Fresh-course status still exposes Undo after restoration.");
  } catch (error) {
    if (applied && !undone && http) {
      try {
        await http.undo(input.projectSlug);
      } catch {
        // The assertion below records a byte-boundary failure before the
        // isolated checkout is deleted. Do not mask the original failure.
      }
    }
    throw error;
  } finally {
    await http?.close().catch(() => undefined);
  }
  const after = await fingerprintCourseEditPaths(input.isolatedRoot, [projectRoot, resourceRoot]);
  assert.ok(courseEditFingerprintsMatch(before, after), "Fresh-course Undo did not restore the complete project/resource boundary byte-for-byte.");
  return {
    browserDraftSave: "pass",
    httpNormalize: "pass",
    httpApply: "pass",
    renderedValidation: "pass",
    reload: "pass",
    serverRestart: "pass",
    undo: "pass",
    byteForByteRestore: "pass",
    restoredFiles: before.reduce((total, entry) => total + entry.fileCount, 0),
    restoredBytes: before.reduce((total, entry) => total + entry.byteCount, 0)
  };
}

async function runInsideIsolatedCheckout(args: Arguments): Promise<FreshCourseProof> {
  const implementationSha = await git(repoRoot, ["rev-parse", "HEAD"]);
  const projectSlug = `fresh-studio-proof-${implementationSha.slice(0, 10)}`;
  const projectRoot = path.join(repoRoot, "projects", projectSlug);
  const workspaceEntry = path.join(projectRoot, "workspace", "index.html");
  let courseCreated = false;
  try {
    await command(npmCommand(), [
      "run", "course:create", "--",
      "--slug", projectSlug,
      "--title", "Fresh Studio Proof Course",
      "--course-code", "FSP 1",
      "--summary", "An isolated production course-create proof for Studio editability."
    ], repoRoot);
    courseCreated = true;

    await command(npmCommand(), ["run", "course:doctor", "--", "--project", projectSlug], repoRoot);
    const coverageReportPath = ".runtime/fresh-course-studio-proof-editability.json";
    await command(npmCommand(), [
      "run", "report:course-editability", "--",
      "--project", projectSlug,
      "--report", coverageReportPath
    ], repoRoot);
    const coverage = JSON.parse(await readFile(path.join(repoRoot, coverageReportPath), "utf8")) as CourseEditabilityCoverageReport;
    const projectCoverage = coverage.projects.find((entry) => entry.projectSlug === projectSlug) ?? null;
    const readiness = evaluateNewCourseCoverageReadiness(projectCoverage);
    assert.equal(coverage.exactCommit, implementationSha, "Fresh-course coverage was not collected from the implementation SHA under proof.");
    assert.equal(coverage.residue.ok, true, "Fresh-course coverage wrote to the isolated course boundary.");
    assert.equal(readiness.passed, true, `Fresh course missed its editability contract: ${readiness.failedCodes.join(", ")}`);

    const lifecycle = await runLifecycle({
      isolatedRoot: repoRoot,
      projectSlug,
      workspaceEntry
    });
    await rm(projectRoot, { recursive: true, force: true });
    courseCreated = false;
    return {
      schemaVersion: PROOF_SCHEMA_VERSION,
      status: "pass",
      implementationSha,
      createdWith: "npm run course:create",
      execution: "ephemeral-clean-checkout",
      projectSlug,
      checks: {
        courseCreate: "pass",
        doctor: "pass",
        inventoryComplete: projectCoverage?.inventory.complete === true,
        learnerSurfaceCount: projectCoverage?.surfaces.length ?? 0,
        coverage: {
          status: projectCoverage?.status ?? null,
          blockCoverage: projectCoverage?.blockCoverage ?? null,
          teacherTextCoverage: projectCoverage?.teacherTextCoverage ?? null,
          readinessChecks: readiness.checks
        },
        lifecycle,
        projectCleanup: "pass"
      }
    };
  } finally {
    if (courseCreated) await rm(projectRoot, { recursive: true, force: true });
  }
}

async function runFromPrimaryCheckout(args: Arguments): Promise<FreshCourseProof> {
  const implementationSha = await git(repoRoot, ["rev-parse", "HEAD"]);
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-fresh-studio-proof-"));
  const isolatedRoot = path.join(temporaryRoot, "checkout");
  const isolatedReport = path.join(isolatedRoot, ".runtime", "fresh-course-studio-proof-internal.json");
  let innerReport: FreshCourseProof | null = null;
  let failure: unknown = null;
  try {
    await command("git", ["clone", "--shared", "--no-checkout", repoRoot, isolatedRoot], temporaryRoot);
    await command("git", ["checkout", "--detach", implementationSha], isolatedRoot);
    await symlink(path.join(repoRoot, "node_modules"), path.join(isolatedRoot, "node_modules"), "dir");
    await command(npmCommand(), [
      "run", "verify:fresh-course-studio-proof", "--",
      "--in-isolated-checkout",
      "--report", ".runtime/fresh-course-studio-proof-internal.json"
    ], isolatedRoot);
    innerReport = JSON.parse(await readFile(isolatedReport, "utf8")) as FreshCourseProof;
    assert.equal(innerReport.status, "pass", "The isolated fresh-course proof returned a failing report.");
    assert.equal(innerReport.implementationSha, implementationSha, "The isolated checkout did not prove the requested implementation SHA.");
  } catch (error) {
    failure = error;
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
  const report: FreshCourseProof = failure || !innerReport
    ? {
        schemaVersion: PROOF_SCHEMA_VERSION,
        status: "fail",
        implementationSha,
        createdWith: "npm run course:create",
        execution: "ephemeral-clean-checkout",
        projectSlug: null,
        checks: { isolatedCheckoutCleanup: "pass" },
        error: failure instanceof Error ? failure.message : "The isolated fresh-course proof did not return a report."
      }
    : {
        ...innerReport,
        checks: {
          ...innerReport.checks,
          isolatedCheckoutCleanup: "pass"
        }
      };
  await writeReport(args.reportPath, report);
  if (failure) throw failure;
  return report;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const report = args.isolated
    ? await runInsideIsolatedCheckout(args)
    : await runFromPrimaryCheckout(args);
  if (args.isolated) await writeReport(args.reportPath, report);
  console.log(`Fresh course Studio proof: ${path.relative(repoRoot, args.reportPath)}`);
  console.log(`Implementation SHA: ${report.implementationSha}`);
  console.log(`Gate: ${report.status.toUpperCase()}`);
  if (report.status !== "pass") process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
