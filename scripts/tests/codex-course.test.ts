import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { STUDIO_PROJECT_CHANGE_SIGNAL } from "../../app/shared/project-discovery.ts";
import {
  COURSE_EDIT_SCHEMA_VERSION,
  type CourseEditDraft,
  type CourseEditResolveRequest,
  type CourseEditTarget
} from "../../app/shared/course-editing.ts";
import {
  applyCourseEditBatch,
  getCourseEditStatus,
  resolveCourseEditPageMap,
  resolveCourseEditTarget,
  undoCourseEditBatch
} from "../../app/server/lib/course-editing.ts";
import { decoratePreviewHtml } from "../../app/server/lib/preview-inspection.ts";
import { inspectCourseAuthoringProject } from "../lib/course-authoring/context.ts";
import {
  CODEX_STUDIO_COURSE_CONTRACT,
  createCodexStudioCourse
} from "../lib/codex-course.ts";
import { collectEditableHtmlElements } from "../lib/course-editing/html.ts";
import { validateProjectManifestPolicy } from "../lib/project-manifest-policy.ts";
import type { ProjectManifest } from "../lib/types.ts";

const SLUG = "codex-studio-course-test";
const TITLE = "Applied Learning 20";
const CREATED_AT = "2026-08-13T12:00:00.000Z";

async function createRepo() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-codex-course-"));
  await writeFile(path.join(repoRoot, "package.json"), `${JSON.stringify({
    private: true,
    scripts: {
      "course:doctor": "node -e \"process.exit(0)\" --",
      verify: "node -e \"process.exit(0)\" --"
    }
  }, null, 2)}\n`, "utf8");
  return {
    repoRoot,
    async cleanup() { await rm(repoRoot, { recursive: true, force: true }); }
  };
}

async function createCourse(repoRoot: string) {
  return createCodexStudioCourse({
    repoRoot,
    slug: SLUG,
    title: TITLE,
    courseCode: "AL 20",
    summary: "A practical course that connects evidence, decisions, and reflection.",
    now: CREATED_AT
  });
}

function resolveRequestForKey(source: string, editKey: string): CourseEditResolveRequest {
  const document = decoratePreviewHtml(source);
  assert.ok(document);
  const element = collectEditableHtmlElements(document.source, SLUG, "index.html")?.find(
    (candidate) => candidate.attributes["data-canvas-helper-edit-key"] === editKey
  );
  assert.ok(element, `Expected editable element with key ${editKey}.`);
  const located = [...document.nodeLocations.entries()].find(([, location]) => (
    location.sourceStart === element.sourceStart && location.tagName === element.tagName
  ));
  assert.ok(located, `Expected inspection node for ${editKey}.`);
  const visibleText = document.source
    .slice(element.innerStart, element.innerEnd)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return {
    projectSlug: SLUG,
    root: "workspace",
    htmlPath: "index.html",
    selection: {
      nodeId: located[0],
      visibleText,
      tagName: element.tagName,
      role: "",
      testId: "",
      geometry: { x: 20, y: 20, width: 400, height: 48 },
      viewport: { width: 1280, height: 800 },
      scroll: { windowTop: 0, windowLeft: 0, containers: [] },
      pageHref: `http://127.0.0.1:5173/preview/workspace/${SLUG}/index.html`
    }
  };
}

function draftFor(target: CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> }, html: string): CourseEditDraft {
  return {
    id: "codex-course-draft",
    createdAt: 1,
    updatedAt: 2,
    identity: target.identity,
    beforeText: target.originalText,
    afterText: html,
    baseline: {
      originalHtml: target.originalHtml,
      attributes: target.attributes,
      currentStyle: target.currentStyle,
      capabilities: target.capabilities
    },
    patch: { html }
  };
}

test("Codex creates a declared Direct course that is immediately Studio-ready", async () => {
  const fixture = await createRepo();
  try {
    const created = await createCourse(fixture.repoRoot);
    assert.equal(created.readiness, "direct-ready");
    const manifest = JSON.parse(await readFile(created.manifestPath, "utf8")) as ProjectManifest;
    assert.equal(validateProjectManifestPolicy(manifest).status, "valid");
    assert.equal(manifest.projectType, "generated-course");
    assert.equal(manifest.authoring?.driverId, "direct-workspace-v1");
    assert.equal(manifest.authoring?.familyId, CODEX_STUDIO_COURSE_CONTRACT);
    assert.deepEqual(manifest.authoring?.studioEditing, {
      enabled: true,
      renameCourse: true,
      imageAssets: true
    });
    assert.ok(manifest.canonicalSources?.every((entry) => entry.startsWith(`projects/${SLUG}/workspace/`)));
    assert.ok(manifest.referenceOnly?.every((entry) => entry.startsWith(`projects/${SLUG}/raw/`)));

    const doctor = await inspectCourseAuthoringProject(SLUG, fixture.repoRoot);
    assert.equal(doctor.status, "pass");
    assert.equal(doctor.project?.driverSource, "declared");
    assert.equal(doctor.project?.authoringMode, "direct");
    assert.equal(doctor.project?.studioEditing.enabled, true);

    const source = await readFile(created.workspaceEntry, "utf8");
    assert.match(source, /data-canvas-helper-course-title/);
    assert.match(source, /data-canvas-helper-edit-key="course-summary"/);
    assert.doesNotMatch(source, /<script\b/i);
    assert.match(await readFile(created.promptPackPath, "utf8"), /Codex to Studio contract/);
    assert.equal(
      (JSON.parse(await readFile(path.join(fixture.repoRoot, STUDIO_PROJECT_CHANGE_SIGNAL), "utf8")) as { projectSlug: string }).projectSlug,
      SLUG
    );
    assert.equal(await readFile(path.join(created.projectRoot, "raw", "original.html"), "utf8"), source);

    const document = decoratePreviewHtml(source);
    assert.ok(document);
    const map = await resolveCourseEditPageMap(SLUG, "index.html", document, fixture.repoRoot);
    assert.equal(map.available, true);
    assert.ok(map.entries.some((entry) => entry.action === "rename-course"));
    assert.ok(map.entries.some((entry) => entry.action === "edit-text"));
    assert.ok(map.entries.some((entry) => entry.action === "edit-link"));

    const status = await getCourseEditStatus(SLUG, fixture.repoRoot);
    assert.equal(status.available, true);
    assert.equal(status.canRenameCourse, true);
    assert.equal(status.canUploadImages, true);
  } finally {
    await fixture.cleanup();
  }
});

test("Codex course creation refuses unsafe slugs and never overwrites an existing project", async () => {
  const fixture = await createRepo();
  try {
    const created = await createCourse(fixture.repoRoot);
    const original = await readFile(created.workspaceEntry, "utf8");
    await assert.rejects(createCourse(fixture.repoRoot), /never overwrites/i);
    assert.equal(await readFile(created.workspaceEntry, "utf8"), original);
    await assert.rejects(
      createCodexStudioCourse({ repoRoot: fixture.repoRoot, slug: "../escape", title: "Unsafe" }),
      /lowercase project slug/i
    );
    await assert.rejects(
      createCodexStudioCourse({ repoRoot: fixture.repoRoot, slug: "resources", title: "Reserved" }),
      /reserved/i
    );
    await assert.rejects(stat(path.join(fixture.repoRoot, "escape")));
  } finally {
    await fixture.cleanup();
  }
});

test("a Codex-created course survives Studio apply, reload resolution, and Undo", async () => {
  const fixture = await createRepo();
  try {
    const created = await createCourse(fixture.repoRoot);
    const original = await readFile(created.workspaceEntry, "utf8");
    const request = resolveRequestForKey(original, "course-summary");
    const resolved = await resolveCourseEditTarget(request, fixture.repoRoot);
    assert.equal(resolved.eligibility, "editable");
    assert.ok(resolved.identity);
    const target = resolved as CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> };

    const applied = await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draftFor(target, "Learners investigate evidence, make a decision, and explain their reasoning.")]
    }, fixture.repoRoot);
    assert.equal(applied.ok, true);
    assert.deepEqual(applied.staleExportTargets, ["html"]);

    const changed = await readFile(created.workspaceEntry, "utf8");
    assert.match(changed, /Learners investigate evidence, make a decision, and explain their reasoning\./);
    const reloaded = await resolveCourseEditTarget(resolveRequestForKey(changed, "course-summary"), fixture.repoRoot);
    assert.equal(reloaded.eligibility, "editable");
    assert.equal(reloaded.originalText, "Learners investigate evidence, make a decision, and explain their reasoning.");
    assert.equal((await getCourseEditStatus(SLUG, fixture.repoRoot)).canUndo, true);

    const undone = await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(undone.ok, true);
    assert.equal(await readFile(created.workspaceEntry, "utf8"), original);
    assert.equal((await getCourseEditStatus(SLUG, fixture.repoRoot)).canUndo, false);
  } finally {
    await fixture.cleanup();
  }
});
