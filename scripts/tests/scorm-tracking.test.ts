import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { resolveScormTracking, type ScormTrackingContract } from "../lib/scorm-tracking.js";
import { findStorageKeysInScriptSources } from "../lib/scorm.js";
import { exportProjectToScormPackage } from "../lib/exports/scorm-package.js";
import { createProjectFixture, cleanupProjectFixture } from "./helpers/project-fixture.js";

const html = `<section class="course-page" id="overview"></section><section class="course-page" id="lesson-1"></section><a data-page-target="overview"></a><button data-complete-id="required-1"></button><button data-complete-id="optional-1"></button>
<script>const completionIds = ["required-1"]; const STORAGE_KEY = "unit:complete"; function readComplete(){} function updateComplete(){const count = completionIds.filter((id) => complete.has(id)).length;}</script>`;

test("Next Step adapter uses the exact required list, not optional buttons or visits", () => {
  const report = resolveScormTracking(html, ["unit:complete"], "2004");
  assert.equal(report.source, "next-step-shell");
  assert.deepEqual(report.contract?.completion?.requiredIds, ["required-1"]);
  assert.equal(report.features.progressMeasure, true);
});

test("unknown and partial shells explicitly report missing integrations", () => {
  assert.equal(resolveScormTracking("<h1>Unknown course</h1>", [], "2004").features.resume, false);
  const report = resolveScormTracking(html.replace('const completionIds = ["required-1"]', 'const completionIds = calculateRequiredIds()'), ["unit:complete"], "2004");
  assert.equal(report.features.resume, true);
  assert.equal(report.features.completion, false);
  assert.match(report.warnings.join(" "), /Automatic completion and progress are unconnected/);
  assert.equal(resolveScormTracking(html, ["unit:complete"], "1.2").features.progressMeasure, false);
});

test("explicit Science-style contract supports a nested completed ID array without changing course content", () => {
  const contract: ScormTrackingContract = { schemaVersion: 1, adapter: "hash-pages-v1", pageIds: ["overview", "lesson-1"], defaultPageId: "overview", completion: { storageKey: "science-state", requiredIds: ["required-1"], path: ["tracking", "completed"] } };
  const report = resolveScormTracking(html, [], "2004", contract);
  assert.equal(report.source, "workspace-contract");
  assert.deepEqual(report.contract, contract);
});

test("invalid contracts fail export instead of silently claiming tracking", () => {
  const base = { schemaVersion: 1, adapter: "hash-pages-v1", pageIds: ["overview"], defaultPageId: "overview" };
  for (const bad of [null, {}, { ...base, schemaVersion: 2 }, { ...base, pageIds: ["missing"] }, { ...base, pageIds: ["overview", "overview"] }, { ...base, completion: { storageKey: "key", requiredIds: [] } }, { ...base, completion: { storageKey: "key", requiredIds: ["a"], path: ["__proto__"] } }]) {
    assert.throws(() => resolveScormTracking(html, [], "2004", bad));
  }
});

test("representative current Social and ELA workspaces expose tracking without rebuilding", async () => {
  for (const slug of ["social20-1-related-issue-1-option-2", "ela10-2-writing-foundations"]) {
    const source = await readFile(`projects/${slug}/workspace/index.html`, "utf8");
    const keys = findStorageKeysInScriptSources([source], "fallback");
    const report = resolveScormTracking(source, keys, "2004");
    assert.equal(report.source, "next-step-shell", `${slug}: ${report.warnings.join(" ")}`);
    assert.ok(report.contract!.completion!.requiredIds.length > 0);
  }
});

test("real export packages tracking evidence and preserves the workspace and prior ZIP on invalid contract", async () => {
  const slug = "test-scorm-tracking-" + randomUUID();
  const contract: ScormTrackingContract = { schemaVersion: 1, adapter: "hash-pages-v1", pageIds: ["overview", "lesson-1"], defaultPageId: "overview", completion: { storageKey: "science-tracking", requiredIds: ["core"] } };
  const paths = await createProjectFixture({ slug, workspaceHtml: html, workspaceFiles: { "scorm-tracking.json": JSON.stringify(contract) } });
  try {
    const result = await exportProjectToScormPackage(slug, "2004");
    assert.equal(result.trackingReport.source, "workspace-contract");
    assert.ok(result.storageKeys.includes("science-tracking"));
    assert.equal(await readFile(paths.workspaceEntrypoint, "utf8"), html);
    execFileSync("unzip", ["-tq", result.zipPath]);
    const report = JSON.parse(execFileSync("unzip", ["-p", result.zipPath, "scorm-tracking-report.json"], { encoding: "utf8" }));
    assert.equal(report.features.completion, true);
    const bridge = execFileSync("unzip", ["-p", result.zipPath, "scorm-bridge.js"], { encoding: "utf8" });
    assert.match(bridge, /science-tracking/);
    assert.match(bridge, /cmi.session_time/);
    const manifestBefore = await readFile(paths.manifestPath, "utf8");
    const review = await exportProjectToScormPackage(slug, "2004", { reviewOnly: true });
    assert.match(review.zipPath, /-review\.zip$/);
    assert.equal(await readFile(paths.manifestPath, "utf8"), manifestBefore);
    assert.equal(JSON.parse(execFileSync("unzip", ["-p", review.zipPath, "review-only.json"], {encoding: "utf8"})).reviewOnly, true);
    execFileSync("unzip", ["-tq", review.zipPath]);
    const zipBefore = await readFile(result.zipPath);
    const reportBefore = await readFile(path.join(result.exportDir, "scorm-tracking-report.json"));
    await writeFile(path.join(paths.workspaceDir, "scorm-tracking.json"), '{"schemaVersion":99}');
    await assert.rejects(() => exportProjectToScormPackage(slug, "2004"), /Unsupported SCORM tracking contract/);
    assert.deepEqual(await readFile(result.zipPath), zipBefore);
    assert.deepEqual(await readFile(path.join(result.exportDir, "scorm-tracking-report.json")), reportBefore);
  } finally { await cleanupProjectFixture(slug); }
});
