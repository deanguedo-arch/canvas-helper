import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { STUDIO_PROJECT_CHANGE_SIGNAL } from "../../app/shared/project-discovery.ts";
import { inspectCourseAuthoringProject } from "../lib/course-authoring/context.ts";
import { onboardCourseCatalog } from "../lib/course-onboarding.ts";
import type { ProjectManifest } from "../lib/types.ts";

const FIRST_RUN = "2026-08-13T13:00:00.000Z";
const SECOND_RUN = "2026-08-13T14:00:00.000Z";

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
    assert.equal(direct.canonicalEntry, "projects/direct-legacy/workspace/index.html");
    assert.ok(direct.canonicalSources?.includes("projects/direct-legacy/workspace/styles.css"));
    assert.equal(snapshot.authoring?.driverId, "legacy-snapshot-v1");
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

test("bulk onboarding fails closed for an unmanifested source directory", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-course-onboarding-unclassified-"));
  try {
    const workspaceRoot = path.join(repoRoot, "projects", "unknown-course", "workspace");
    await mkdir(workspaceRoot, { recursive: true });
    await writeFile(path.join(workspaceRoot, "index.html"), "<main>Unknown source</main>\n", "utf8");
    await assert.rejects(
      onboardCourseCatalog({ repoRoot, apply: true, now: FIRST_RUN }),
      /has no project manifest and is not a package-only archive/i
    );
    await assert.rejects(readFile(path.join(repoRoot, STUDIO_PROJECT_CHANGE_SIGNAL)));
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
