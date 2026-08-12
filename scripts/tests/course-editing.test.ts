import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  COURSE_EDIT_SCHEMA_VERSION,
  isCourseEditApplyRequest,
  type CourseEditDraft,
  type CourseEditResolveRequest,
  type CourseEditTarget
} from "../../app/shared/course-editing.ts";
import {
  applyCourseEditBatch,
  getCourseEditStatus,
  markCourseExportCurrent,
  resolveCourseEditTarget,
  undoCourseEditBatch
} from "../../app/server/lib/course-editing.ts";
import { decoratePreviewHtml } from "../../app/server/lib/preview-inspection.ts";
import {
  applyCourseEditOverridesToHtml,
  type StoredCourseEditOverride
} from "../lib/course-editing/overrides.ts";
import {
  collectEditableHtmlElements,
  sanitizeCourseEditRichText,
  sanitizeCourseEditUrl
} from "../lib/course-editing/html.ts";

const SLUG = "studio-edit-fixture";
const ORIGINAL_HTML = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Fixture</title></head>
  <body>
    <main>
      <h1>Hello teacher</h1>
      <p>Original paragraph</p>
      <a href="lesson.html">Lesson link</a>
      <img src="image.png" alt="Original image">
    </main>
  </body>
</html>
`;
const SECOND_HTML = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Second page</title></head>
  <body><main><h2>Second page heading</h2><p>Second page body</p></main></body>
</html>
`;

async function createFixture() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-course-edit-"));
  const projectRoot = path.join(repoRoot, "projects", SLUG);
  const workspace = path.join(projectRoot, "workspace");
  await Promise.all([
    mkdir(workspace, { recursive: true }),
    mkdir(path.join(projectRoot, "raw"), { recursive: true }),
    mkdir(path.join(projectRoot, "exports"), { recursive: true }),
    mkdir(path.join(projectRoot, "meta"), { recursive: true })
  ]);
  await writeFile(path.join(workspace, "index.html"), ORIGINAL_HTML, "utf8");
  await writeFile(path.join(workspace, "lesson.html"), SECOND_HTML, "utf8");
  await writeFile(path.join(projectRoot, "raw", "original.html"), ORIGINAL_HTML, "utf8");
  await writeFile(path.join(repoRoot, "package.json"), `${JSON.stringify({
    private: true,
    scripts: {
      "course:doctor": "node -e \"process.exit(0)\" --",
      verify: "node -e \"process.exit(0)\" --"
    }
  }, null, 2)}\n`, "utf8");
  await writeFile(path.join(projectRoot, "meta", "project.json"), `${JSON.stringify({
    id: "studio-edit-fixture-id",
    slug: SLUG,
    title: "Studio edit fixture",
    sourcePath: `projects/${SLUG}/raw/original.html`,
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["raw", "workspace"],
    workspaceEntrypoint: `projects/${SLUG}/workspace/index.html`,
    rawEntrypoint: `projects/${SLUG}/raw/original.html`,
    learningSource: "other",
    learningTrust: "curated",
    learningUpdatedAt: "2026-08-12T00:00:00.000Z",
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion"],
    canonicalEntry: `projects/${SLUG}/workspace/index.html`,
    canonicalSources: [
      `projects/${SLUG}/workspace/index.html`,
      `projects/${SLUG}/workspace/lesson.html`
    ],
    generatedOutputs: [],
    authoringStatus: "active",
    exportTargets: [{ target: "scorm", enabled: true }, { target: "html", enabled: true }],
    sourceOfTruthNotes: "Fixture workspace HTML is the canonical editable source.",
    createdAt: "2026-08-12T00:00:00.000Z",
    updatedAt: "2026-08-12T00:00:00.000Z"
  }, null, 2)}\n`, "utf8");
  return {
    repoRoot,
    sourcePath: path.join(workspace, "index.html"),
    async cleanup() { await rm(repoRoot, { recursive: true, force: true }); }
  };
}

function requestFor(
  document: NonNullable<ReturnType<typeof decoratePreviewHtml>>,
  tagName: string,
  htmlPath = "index.html"
): CourseEditResolveRequest {
  const located = [...document.nodeLocations.entries()].find(([, location]) => location.tagName === tagName);
  assert.ok(located, `Expected an inspectable ${tagName} element.`);
  return {
    projectSlug: SLUG,
    root: "workspace",
    htmlPath,
    selection: {
      nodeId: located[0],
      visibleText: tagName === "h1" ? "Hello teacher" : "",
      tagName,
      role: "",
      testId: "",
      geometry: { x: 10, y: 10, width: 220, height: 40 },
      viewport: { width: 1280, height: 720 },
      scroll: { windowTop: 0, windowLeft: 0, containers: [] },
      pageHref: `http://127.0.0.1:5173/preview/workspace/${SLUG}/${htmlPath}`
    }
  };
}

async function resolveHeading(repoRoot: string, sourcePath: string) {
  const document = decoratePreviewHtml(await readFile(sourcePath, "utf8"));
  assert.ok(document);
  const target = await resolveCourseEditTarget(requestFor(document, "h1"), repoRoot);
  assert.equal(target.eligibility, "editable");
  assert.ok(target.identity);
  return target as CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> };
}

async function resolveElement(repoRoot: string, sourcePath: string, tagName: string, htmlPath: string) {
  const document = decoratePreviewHtml(await readFile(sourcePath, "utf8"));
  assert.ok(document);
  const target = await resolveCourseEditTarget(requestFor(document, tagName, htmlPath), repoRoot);
  assert.equal(target.eligibility, "editable");
  assert.ok(target.identity);
  return target as CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> };
}

async function resolveElementAt(
  repoRoot: string,
  sourcePath: string,
  tagName: string,
  occurrence = 0,
  htmlPath = "index.html"
) {
  const document = decoratePreviewHtml(await readFile(sourcePath, "utf8"));
  assert.ok(document);
  const located = [...document.nodeLocations.entries()].filter(([, location]) => location.tagName === tagName)[occurrence];
  assert.ok(located, `Expected inspectable ${tagName} occurrence ${occurrence}.`);
  const request = requestFor(document, tagName, htmlPath);
  request.selection.nodeId = located[0];
  const target = await resolveCourseEditTarget(request, repoRoot);
  assert.equal(target.eligibility, "editable");
  assert.ok(target.identity);
  return target as CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> };
}

function draftFor(target: CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> }, html: string): CourseEditDraft {
  return {
    id: "draft-1",
    createdAt: 1,
    updatedAt: 2,
    identity: target.identity,
    beforeText: target.originalText,
    afterText: html.replace(/<[^>]+>/g, ""),
    patch: {
      html,
      style: { textTone: "accent", fontSize: "large", spacing: "relaxed" }
    }
  };
}

test("direct Studio edits apply atomically, mark exports stale, and undo", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const draft = draftFor(target, "<strong>Updated</strong><script>bad()</script> heading");
    const result = await applyCourseEditBatch({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, projectSlug: SLUG, drafts: [draft] }, fixture.repoRoot);

    assert.equal(result.ok, true);
    assert.deepEqual(result.staleExportTargets.sort(), ["html", "scorm"]);
    const changed = await readFile(fixture.sourcePath, "utf8");
    assert.match(changed, /<strong>Updated<\/strong> heading/);
    assert.doesNotMatch(changed, /script|bad\(\)/);
    assert.match(changed, /data-canvas-helper-text-tone="accent"/);
    assert.match(changed, /data-canvas-helper-studio-edit-styles/);

    const status = await getCourseEditStatus(SLUG, fixture.repoRoot);
    assert.equal(status.available, true);
    assert.equal(status.canUndo, true);
    assert.equal(status.exportsOutOfDate, true);

    const undone = await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(undone.ok, true);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    const undoneStatus = await getCourseEditStatus(SLUG, fixture.repoRoot);
    assert.equal(undoneStatus.canUndo, false);
    assert.equal(undoneStatus.exportsOutOfDate, true);
    assert.deepEqual(undoneStatus.staleExportTargets.sort(), ["html", "scorm"]);
  } finally {
    await fixture.cleanup();
  }
});

test("one direct-course batch can update and undo multiple declared pages", async () => {
  const fixture = await createFixture();
  const secondPath = path.join(fixture.repoRoot, "projects", SLUG, "workspace", "lesson.html");
  try {
    const firstTarget = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const secondTarget = await resolveElement(fixture.repoRoot, secondPath, "h2", "lesson.html");
    const secondDraft = { ...draftFor(secondTarget, "Updated second page"), id: "draft-2" };
    const result = await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draftFor(firstTarget, "Updated first page"), secondDraft]
    }, fixture.repoRoot);

    assert.equal(result.appliedCount, 2);
    assert.match(await readFile(fixture.sourcePath, "utf8"), /Updated first page/);
    assert.match(await readFile(secondPath, "utf8"), /Updated second page/);

    await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    assert.equal(await readFile(secondPath, "utf8"), SECOND_HTML);
  } finally {
    await fixture.cleanup();
  }
});

test("a source change after target resolution rejects the batch without overwriting it", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const externallyChanged = ORIGINAL_HTML.replace("Original paragraph", "Changed outside Studio");
    await writeFile(fixture.sourcePath, externallyChanged, "utf8");
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(target, "Stale draft")]
      }, fixture.repoRoot),
      /changed after this draft was created|no longer current/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), externallyChanged);
  } finally {
    await fixture.cleanup();
  }
});

test("a source change at the final commit boundary is never overwritten or rolled back", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const externallyChanged = ORIGINAL_HTML.replace("Original paragraph", "Concurrent external save");
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(target, "Studio draft")]
      }, fixture.repoRoot, {
        beforeDirectCommit: async () => writeFile(fixture.sourcePath, externallyChanged, "utf8")
      }),
      /changed while Studio prepared/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), externallyChanged);
  } finally {
    await fixture.cleanup();
  }
});

test("canonical pages cannot cross an intermediate workspace symlink", async () => {
  const fixture = await createFixture();
  try {
    const projectRoot = path.join(fixture.repoRoot, "projects", SLUG);
    const linkedPath = path.join(projectRoot, "workspace", "linked", "original.html");
    await symlink(path.join(projectRoot, "raw"), path.join(projectRoot, "workspace", "linked"), "dir");
    const manifestPath = path.join(projectRoot, "meta", "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.canonicalSources.push(`projects/${SLUG}/workspace/linked/original.html`);
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    const document = decoratePreviewHtml(await readFile(linkedPath, "utf8"));
    assert.ok(document);
    await assert.rejects(
      resolveCourseEditTarget(requestFor(document, "h1", "linked/original.html"), fixture.repoRoot),
      /symbolic link|real workspace/i
    );
    assert.equal(await readFile(path.join(projectRoot, "raw", "original.html"), "utf8"), ORIGINAL_HTML);
  } finally {
    await fixture.cleanup();
  }
});

test("one batch rejects nested editable targets instead of silently erasing a child edit", async () => {
  const fixture = await createFixture();
  try {
    const nested = ORIGINAL_HTML.replace("Original paragraph", "Original <strong>nested</strong> paragraph");
    await writeFile(fixture.sourcePath, nested, "utf8");
    const paragraph = await resolveElementAt(fixture.repoRoot, fixture.sourcePath, "p");
    const strong = await resolveElementAt(fixture.repoRoot, fixture.sourcePath, "strong");
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(paragraph, "Updated parent"), { ...draftFor(strong, "Updated child"), id: "draft-2" }]
      }, fixture.repoRoot),
      /contains another selected edit/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), nested);
  } finally {
    await fixture.cleanup();
  }
});

test("undo stays recoverable when validation fails and always invalidates regenerated exports", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draftFor(target, "Applied version")]
    }, fixture.repoRoot);
    const applied = await readFile(fixture.sourcePath, "utf8");
    await markCourseExportCurrent(SLUG, "html", fixture.repoRoot);
    await markCourseExportCurrent(SLUG, "scorm2004", fixture.repoRoot);
    assert.equal((await getCourseEditStatus(SLUG, fixture.repoRoot)).exportsOutOfDate, false);

    await writeFile(path.join(fixture.repoRoot, "package.json"), `${JSON.stringify({
      private: true,
      scripts: {
        "course:doctor": "node -e \"process.exit(0)\" --",
        verify: "node -e \"process.exit(1)\" --"
      }
    }, null, 2)}\n`, "utf8");
    await assert.rejects(undoCourseEditBatch(SLUG, fixture.repoRoot), /validation failed/i);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), applied);
    assert.equal((await getCourseEditStatus(SLUG, fixture.repoRoot)).canUndo, true);

    await writeFile(path.join(fixture.repoRoot, "package.json"), `${JSON.stringify({
      private: true,
      scripts: {
        "course:doctor": "node -e \"process.exit(0)\" --",
        verify: "node -e \"process.exit(0)\" --"
      }
    }, null, 2)}\n`, "utf8");
    const undone = await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(undone.exportsOutOfDate, true);
    assert.deepEqual(undone.staleExportTargets.sort(), ["html", "scorm"]);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
  } finally {
    await fixture.cleanup();
  }
});

test("failed validation rolls the source back and preserves the previous undo checkpoint", async () => {
  const fixture = await createFixture();
  try {
    const firstTarget = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draftFor(firstTarget, "First good batch")]
    }, fixture.repoRoot);
    const firstApplied = await readFile(fixture.sourcePath, "utf8");
    const firstStatus = await getCourseEditStatus(SLUG, fixture.repoRoot);

    const secondTarget = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    await writeFile(path.join(fixture.repoRoot, "package.json"), `${JSON.stringify({
      private: true,
      scripts: {
        "course:doctor": "node -e \"process.exit(0)\" --",
        verify: "node -e \"process.exit(1)\" --"
      }
    }, null, 2)}\n`, "utf8");
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(secondTarget, "Second bad batch")]
      }, fixture.repoRoot),
      /validation failed/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), firstApplied);
    assert.equal((await getCourseEditStatus(SLUG, fixture.repoRoot)).checkpointId, firstStatus.checkpointId);
  } finally {
    await fixture.cleanup();
  }
});

test("generated course overrides bind to stable element identities and replay after rebuild", () => {
  const generated = "<!doctype html><html><head><title>Generated</title></head><body><main><h1>Original</h1><p>Body</p></main></body></html>";
  const elements = collectEditableHtmlElements(generated, "factory-fixture", "index.html");
  assert.ok(elements);
  const heading = elements.find((entry) => entry.tagName === "h1");
  assert.ok(heading);
  const override: StoredCourseEditOverride = {
    editId: heading.editId,
    htmlPath: "index.html",
    tagName: heading.tagName,
    pathKey: heading.pathKey,
    patch: { html: "Teacher override", style: { textStyle: "heading" } },
    updatedAt: "2026-08-12T00:00:00.000Z"
  };
  const rebuilt = applyCourseEditOverridesToHtml({
    html: generated,
    projectSlug: "factory-fixture",
    overrides: [override]
  });
  assert.match(rebuilt, /Teacher override/);
  assert.match(rebuilt, new RegExp(`data-canvas-helper-edit-id="${heading.editId}"`));
  assert.match(rebuilt, /data-canvas-helper-text-style="heading"/);
});

test("generated override replay rejects parent and child edits from separate batches", () => {
  const generated = "<!doctype html><html><body><main><p>Parent <strong>child</strong></p></main></body></html>";
  const elements = collectEditableHtmlElements(generated, "factory-fixture", "index.html");
  assert.ok(elements);
  const paragraph = elements.find((entry) => entry.tagName === "p");
  const strong = elements.find((entry) => entry.tagName === "strong");
  assert.ok(paragraph && strong);
  const override = (element: typeof paragraph, html: string): StoredCourseEditOverride => ({
    editId: element.editId,
    htmlPath: "index.html",
    tagName: element.tagName,
    pathKey: element.pathKey,
    patch: { html },
    updatedAt: "2026-08-12T00:00:00.000Z"
  });
  assert.throws(() => applyCourseEditOverridesToHtml({
    html: generated,
    projectSlug: "factory-fixture",
    overrides: [override(paragraph, "Updated parent"), override(strong, "Updated child")]
  }), /overlap/i);
});

test("editing contracts reject browser-supplied paths and unsafe content", () => {
  assert.equal(sanitizeCourseEditRichText("<b>Good</b><iframe>bad</iframe>"), "<strong>Good</strong>");
  assert.throws(() => sanitizeCourseEditUrl("javascript:alert(1)", "href"), /unsupported/i);
  assert.throws(() => sanitizeCourseEditUrl("../outside.png", "src"), /cannot leave/i);
  assert.equal(isCourseEditApplyRequest({
    schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
    projectSlug: SLUG,
    drafts: [{
      ...draftFor({
        eligibility: "editable",
        reason: "",
        capabilities: { richText: true, link: false, image: false, styles: true },
        originalHtml: "Old",
        originalText: "Old",
        attributes: { href: "", src: "", alt: "", title: "" },
        currentStyle: { textStyle: "default", fontFamily: "default", fontSize: "default", textTone: "default", alignment: "default", spacing: "default" },
        identity: {
          targetId: "a".repeat(24),
          projectSlug: SLUG,
          htmlPath: "index.html",
          nodeId: `ch1:${"b".repeat(24)}:1`,
          sourceDigest: "c".repeat(64),
          editId: null,
          tagName: "h1",
          adapter: "direct"
        }
      }, "New"),
      identity: {
        targetId: "a".repeat(24),
        projectSlug: SLUG,
        htmlPath: "index.html",
        nodeId: `ch1:${"b".repeat(24)}:1`,
        sourceDigest: "c".repeat(64),
        editId: null,
        tagName: "h1",
        adapter: "direct",
        filesystemPath: "/tmp/escape.html"
      }
    }]
  }), false);
});
