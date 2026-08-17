import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { STUDIO_PROJECT_CHANGE_SIGNAL } from "../../app/shared/project-discovery.ts";
import {
  STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
  STUDIO_ROUTINE_CONTENT_PROFILE_ID
} from "../../app/shared/course-editability.ts";
import { PREVIEW_BRIDGE_MAX_VISIBLE_TEXT } from "../../app/shared/preview-bridge.ts";
import { inspectCourseAuthoringProject } from "../lib/course-authoring/context.ts";
import { onboardCourseCatalog } from "../lib/course-onboarding.ts";
import { catalogPilotVisibleText } from "../lib/course-editing/catalog-pilot.ts";
import type { ProjectManifest } from "../lib/types.ts";

const FIRST_RUN = "2026-08-13T13:00:00.000Z";
const SECOND_RUN = "2026-08-13T14:00:00.000Z";

test("catalog pilot text matches the bounded browser bridge representation", () => {
  const visible = catalogPilotVisibleText(`<strong>A &amp; B</strong> ${"long ".repeat(100)}`);
  assert.equal(visible.startsWith("A & B long long"), true);
  assert.equal(visible.length, PREVIEW_BRIDGE_MAX_VISIBLE_TEXT);
});

async function createLegacyProject(repoRoot: string, slug: string, regenerateCommand?: string) {
  const projectRoot = path.join(repoRoot, "projects", slug);
  const workspaceRoot = path.join(projectRoot, "workspace");
  const metaRoot = path.join(projectRoot, "meta");
  const rawRoot = path.join(projectRoot, "raw");
  await Promise.all([
    mkdir(workspaceRoot, { recursive: true }),
    mkdir(metaRoot, { recursive: true }),
    mkdir(rawRoot, { recursive: true })
  ]);
  await Promise.all([
    writeFile(path.join(workspaceRoot, "index.html"), "<!doctype html><main><h1>Course</h1></main>\n", "utf8"),
    writeFile(path.join(workspaceRoot, "styles.css"), "body { color: #111; }\n", "utf8"),
    writeFile(path.join(rawRoot, "original.html"), "<!doctype html><main><h1>Imported course</h1></main>\n", "utf8")
  ]);
  const manifest: ProjectManifest = {
    id: slug,
    slug,
    sourcePath: `projects/${slug}/raw/original.html`,
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["workspace"],
    workspaceEntrypoint: `C:\\legacy\\canvas-helper\\projects\\${slug}\\workspace\\index.html`,
    rawEntrypoint: `C:\\legacy\\canvas-helper\\projects\\${slug}\\raw\\original.html`,
    learningSource: "other",
    learningTrust: "auto",
    learningUpdatedAt: "2026-01-01T00:00:00.000Z",
    migrationState: "legacy",
    projectType: "conversion",
    authoringStatus: "active",
    ...(regenerateCommand ? { regenerateCommand } : {}),
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
  await writeFile(path.join(metaRoot, "project.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

test("bulk onboarding explicitly classifies legacy sources and is idempotent", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-course-onboarding-"));
  try {
    await createLegacyProject(repoRoot, "direct-legacy");
    await createLegacyProject(
      repoRoot,
      "builder-legacy",
      "python projects/builder-legacy/meta/build_sports_style_course.py"
    );
    const archiveRoot = path.join(repoRoot, "projects", "release-only", "exports");
    await mkdir(archiveRoot, { recursive: true });
    await writeFile(path.join(archiveRoot, "course.zip"), "package bytes", "utf8");

    const first = await onboardCourseCatalog({ repoRoot, apply: true, now: FIRST_RUN });
    assert.equal(first.projectDirectoryCount, 3);
    assert.equal(first.manifestCount, 2);
    assert.deepEqual(first.counts, {
      direct: 1,
      "english-factory": 0,
      "social-factory": 0,
      "legacy-snapshot": 1,
      blocked: 0,
      "reference-only": 0,
      "package-archive": 1
    });

    const directPath = path.join(repoRoot, "projects", "direct-legacy", "meta", "project.json");
    const snapshotPath = path.join(repoRoot, "projects", "builder-legacy", "meta", "project.json");
    const direct = JSON.parse(await readFile(directPath, "utf8")) as ProjectManifest;
    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8")) as ProjectManifest;
    assert.equal(direct.migrationState, "migrated");
    assert.equal(direct.authoring?.driverId, "direct-workspace-v1");
    assert.equal(direct.authoring?.studioEditing?.enabled, true);
    assert.deepEqual(direct.authoring?.editabilityContract, {
      schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
      profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
    });
    assert.equal(direct.canonicalEntry, "projects/direct-legacy/workspace/index.html");
    assert.ok(direct.canonicalSources?.includes("projects/direct-legacy/workspace/styles.css"));
    assert.equal(snapshot.authoring?.driverId, "legacy-snapshot-v1");
    assert.equal(snapshot.authoring?.editabilityContract, undefined);
    assert.equal(snapshot.regenerateCommand, undefined);
    assert.match(snapshot.sourceOfTruthNotes ?? "", /quarantined the prior rebuild command/i);
    assert.equal((await inspectCourseAuthoringProject("direct-legacy", repoRoot)).status, "pass");
    assert.equal((await inspectCourseAuthoringProject("builder-legacy", repoRoot)).status, "pass");

    const signalPath = path.join(repoRoot, STUDIO_PROJECT_CHANGE_SIGNAL);
    const firstSignal = await readFile(signalPath, "utf8");
    assert.equal((JSON.parse(firstSignal) as { projectCount: number }).projectCount, 2);
    const directBytes = await readFile(directPath);
    const snapshotBytes = await readFile(snapshotPath);

    const second = await onboardCourseCatalog({ repoRoot, apply: true, now: SECOND_RUN });
    assert.deepEqual(
      second.entries.filter((entry) => entry.studioEditing !== "not-applicable").map((entry) => entry.action),
      ["retain", "retain"]
    );
    assert.deepEqual(await readFile(directPath), directBytes);
    assert.deepEqual(await readFile(snapshotPath), snapshotBytes);
    assert.equal(await readFile(signalPath, "utf8"), firstSignal);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("bulk onboarding records an unmanifested source directory as blocked without inventing ownership", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-course-onboarding-unclassified-"));
  try {
    const workspaceRoot = path.join(repoRoot, "projects", "unknown-course", "workspace");
    await mkdir(workspaceRoot, { recursive: true });
    await writeFile(path.join(workspaceRoot, "index.html"), "<main>Unknown source</main>\n", "utf8");
    const report = await onboardCourseCatalog({ repoRoot, apply: true, now: FIRST_RUN });
    assert.deepEqual(report.counts, {
      direct: 0,
      "english-factory": 0,
      "social-factory": 0,
      "legacy-snapshot": 0,
      blocked: 1,
      "reference-only": 0,
      "package-archive": 0
    });
    assert.deepEqual(report.entries, [{
      slug: "unknown-course",
      classification: "blocked",
      studioEditing: "disabled",
      action: "classify",
      reason: "No project manifest was found. Catalog onboarding did not invent canonical source authority; establish an explicit source contract before enabling Studio writes."
    }]);
    await assert.rejects(readFile(path.join(repoRoot, "projects", "unknown-course", "meta", "project.json")));
    await assert.rejects(readFile(path.join(repoRoot, STUDIO_PROJECT_CHANGE_SIGNAL)));
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("onboarding recomputes Rename permission from current title markers", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-course-onboarding-rename-"));
  try {
    await createLegacyProject(repoRoot, "stale-rename");
    const manifestPath = path.join(repoRoot, "projects", "stale-rename", "meta", "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as ProjectManifest;
    manifest.authoring = {
      driverId: "direct-workspace-v1",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true }
    };
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    await onboardCourseCatalog({ repoRoot, apply: true, now: FIRST_RUN });
    const next = JSON.parse(await readFile(manifestPath, "utf8")) as ProjectManifest;
    assert.equal(next.authoring?.studioEditing?.renameCourse, false);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("onboarding rollback restores exact original bytes, modes, and prior signal presence", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-course-onboarding-rollback-"));
  try {
    await createLegacyProject(repoRoot, "rollback-course");
    const manifestPath = path.join(repoRoot, "projects", "rollback-course", "meta", "project.json");
    const originalManifest = await readFile(manifestPath);
    await chmod(manifestPath, 0o640);
    const signalPath = path.join(repoRoot, STUDIO_PROJECT_CHANGE_SIGNAL);
    await mkdir(path.dirname(signalPath), { recursive: true });
    const originalSignal = Buffer.from("pre-existing non-JSON signal bytes\n");
    await writeFile(signalPath, originalSignal);
    await chmod(signalPath, 0o600);

    await assert.rejects(
      onboardCourseCatalog({
        repoRoot,
        apply: true,
        now: FIRST_RUN,
        hooks: { afterStudioSignalWritten() { throw new Error("simulated signal failure"); } }
      }),
      /simulated signal failure/i
    );

    assert.deepEqual(await readFile(manifestPath), originalManifest);
    assert.equal((await stat(manifestPath)).mode & 0o777, 0o640);
    assert.deepEqual(await readFile(signalPath), originalSignal);
    assert.equal((await stat(signalPath)).mode & 0o777, 0o600);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
