import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { access, mkdtemp, mkdir, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { once } from "node:events";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  COURSE_EDIT_SCHEMA_VERSION,
  COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
  isCourseEditApplyRequest,
  isCourseEditDraft,
  isCourseEditNormalizeRequest,
  type CourseEditDraft,
  type CourseEditPendingAssetReference,
  type CourseEditPendingImage,
  type CourseEditPreviewNormalizeRequest,
  type CourseEditResolveRequest,
  type CourseEditTarget
} from "../../app/shared/course-editing.ts";
import { handleCourseEditsRoute } from "../../app/server/routes/course-edits.ts";
import {
  loadCourseEditDrafts,
  saveCourseEditDrafts
} from "../../app/studio/src/lib/course-edit-storage.ts";
import {
  applyCourseEditBatch,
  courseEditCanonicalPatchDigest,
  getCourseEditStatus,
  markCourseExportCurrent,
  normalizeCourseEditEditorDocument,
  reopenCourseEditTarget,
  recoverInterruptedCourseEdit,
  renameCourseForStudio,
  resolveCourseEditPageMap,
  resolveCourseEditTarget,
  restoreCheckpointDirectoryInPlace,
  undoCourseEditBatch
} from "../../app/server/lib/course-editing.ts";
import {
  clearCourseEditPreview,
  normalizeCourseEditPreview
} from "../../app/server/lib/course-edit-preview.ts";
import { validateRenderedCourseEdits } from "../../app/server/lib/course-edit-render-validation.ts";
import {
  pendingCourseEditImageStateForTests,
  storePendingCourseEditImage
} from "../../app/server/lib/course-edit-preview-assets.ts";
import { decoratePreviewHtml } from "../../app/server/lib/preview-inspection.ts";
import {
  applyCourseEditOverridesToHtml,
  applyStoredCourseTitleToHtml,
  type StoredCourseEditOverride
} from "../lib/course-editing/overrides.ts";
import {
  collectEditableHtmlElements,
  sanitizeCourseEditRichText,
  sanitizeCourseEditUrl
} from "../lib/course-editing/html.ts";
import { fingerprintCourseExportInputs } from "../lib/course-editing/export-freshness.ts";

const SLUG = "studio-edit-fixture";
const ORIGINAL_HTML = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title data-canvas-helper-course-title>Fixture</title></head>
  <body>
    <header><h2 data-canvas-helper-course-title>Studio edit fixture</h2><h3 data-canvas-helper-course-title>Studio edit fixture</h3></header>
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
  await writeFile(path.join(workspace, "course-data.js"), `window.COURSE = { "title": /* data-canvas-helper-course-title */ "Studio edit fixture" };\n`, "utf8");
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
      `projects/${SLUG}/workspace/lesson.html`,
      `projects/${SLUG}/workspace/course-data.js`
    ],
    authoring: {
      driverId: "direct-workspace-v1",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true }
    },
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
  const editable = collectEditableHtmlElements(document.source, SLUG, htmlPath)?.find(
    (element) => element.sourceStart === located[1].sourceStart && element.tagName === tagName
  );
  const visibleText = editable
    ? document.source.slice(editable.innerStart, editable.innerEnd).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
    : "";
  return {
    projectSlug: SLUG,
    root: "workspace",
    htmlPath,
    selection: {
      nodeId: located[0],
      visibleText,
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

function livePreviewPageIdentity(htmlPath = "index.html") {
  return `http://127.0.0.1:5173/_canvas-helper/p/12345678-1234-1234-1234-123456789abc/preview/workspace/${SLUG}/${htmlPath}`;
}

function pendingReference(pending: CourseEditPendingImage): CourseEditPendingAssetReference {
  return {
    kind: pending.kind,
    id: pending.id,
    previewSessionId: pending.previewSessionId,
    digest: pending.digest,
    finalSrc: pending.finalSrc,
    mimeType: pending.mimeType,
    width: pending.width,
    height: pending.height,
    byteLength: pending.byteLength
  };
}

test("the page editability map identifies text, links, images, and synchronized course titles", async () => {
  const fixture = await createFixture();
  try {
    const document = decoratePreviewHtml(await readFile(fixture.sourcePath, "utf8"));
    assert.ok(document);
    const map = await resolveCourseEditPageMap(SLUG, "index.html", document, fixture.repoRoot);
    assert.equal(map.available, true);
    assert.equal(map.truncated, false);
    const actionForTag = (tagName: string, occurrence = 0) => {
      const nodeId = [...document.nodeLocations.entries()].filter(([, location]) => location.tagName === tagName)[occurrence]?.[0];
      assert.ok(nodeId, `Expected mapped ${tagName} occurrence ${occurrence}.`);
      return map.entries.find((entry) => entry.nodeId === nodeId);
    };
    assert.equal(actionForTag("h1")?.action, "edit-text");
    assert.equal(actionForTag("a")?.action, "edit-link");
    assert.equal(actionForTag("img")?.action, "replace-image");
    assert.equal(actionForTag("h2")?.action, "rename-course");
    assert.match(actionForTag("h1")?.expected?.textFingerprint ?? "", /^[a-f0-9]{8}$/);
    assert.ok(map.editableCount >= 4);
  } finally {
    await fixture.cleanup();
  }
});

test("live preview normalization is canonical, ordered, read-only, and fails closed after clear", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const sessionId = randomUUID();
    const request: CourseEditPreviewNormalizeRequest = {
      schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
      previewSessionId: sessionId,
      revision: 1,
      projectSlug: SLUG,
      pageIdentity: livePreviewPageIdentity(),
      mapSourceDigest: target.identity.sourceDigest,
      targetNodeId: target.identity.nodeId,
      identity: target.identity,
      patch: { html: "Preview <strong>heading</strong><script>bad()</script>", style: { textTone: "accent" } }
    };
    const normalized = await normalizeCourseEditPreview(request, fixture.repoRoot);
    assert.deepEqual(normalized.canonicalPatch, {
      html: "Preview <strong>heading</strong>",
      style: { textTone: "accent" }
    });
    assert.equal(normalized.representation.html, "Preview <strong>heading</strong>");
    assert.equal(normalized.representation.style.textTone, "accent");
    assert.match(normalized.canonicalPatchDigest, /^[a-f0-9]{64}$/);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    await assert.rejects(normalizeCourseEditPreview(request, fixture.repoRoot), /newer live preview revision/i);

    const second = await normalizeCourseEditPreview({ ...request, revision: 2, patch: { html: "Newest heading" } }, fixture.repoRoot);
    assert.equal(second.canonicalPatch.html, "Newest heading");
    await clearCourseEditPreview({
      schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
      previewSessionId: sessionId,
      revision: 3,
      projectSlug: SLUG,
      pageIdentity: request.pageIdentity,
      mapSourceDigest: request.mapSourceDigest,
      targetNodeId: request.targetNodeId
    });
    await assert.rejects(
      normalizeCourseEditPreview({ ...request, revision: 4, patch: { html: "Must not revive" } }, fixture.repoRoot),
      /session is closed/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
  } finally {
    await fixture.cleanup();
  }
});

test("plain-text inline normalization is read-only, canonical, and rejects unsupported source drift", async () => {
  const fixture = await createFixture();
  let server: Awaited<ReturnType<typeof startCourseEditRouteServer>> | null = null;
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    assert.deepEqual(target.editor, {
      kind: "plain-text",
      text: "Hello teacher",
      allowsLineBreaks: false
    });
    const request = {
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      identity: target.identity,
      document: { kind: "plain-text" as const, text: "A <teacher> & class" }
    };
    assert.equal(isCourseEditNormalizeRequest(request), true);
    const normalized = await normalizeCourseEditEditorDocument({ ...request, repoRoot: fixture.repoRoot });
    assert.equal(normalized.changed, true);
    assert.deepEqual(normalized.document, { kind: "plain-text", text: "A <teacher> & class" });
    assert.deepEqual(normalized.canonicalPatch, { html: "A &lt;teacher&gt; &amp; class" });
    assert.equal(normalized.representation.html, "A &lt;teacher&gt; &amp; class");
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);

    const noChange = await normalizeCourseEditEditorDocument({
      ...request,
      document: { kind: "plain-text", text: "Hello teacher" },
      repoRoot: fixture.repoRoot
    });
    assert.equal(noChange.changed, false);
    assert.deepEqual(noChange.canonicalPatch, {});
    await assert.rejects(
      normalizeCourseEditEditorDocument({
        ...request,
        document: { kind: "plain-text", text: "No\nline break" },
        repoRoot: fixture.repoRoot
      }),
      /single line/i
    );

    server = await startCourseEditRouteServer(fixture.repoRoot);
    const routed = await routeJson<{ changed: boolean; canonicalPatch: { html?: string } }>(
      server.origin,
      "/api/course-edits/normalize",
      "POST",
      request
    );
    assert.equal(routed.changed, true);
    assert.equal(routed.canonicalPatch.html, "A &lt;teacher&gt; &amp; class");
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);

    await writeFile(fixture.sourcePath, ORIGINAL_HTML.replace("Hello teacher", "Changed elsewhere"), "utf8");
    await assert.rejects(
      normalizeCourseEditEditorDocument({ ...request, repoRoot: fixture.repoRoot }),
      /same stable edit identity|selected content/i
    );
  } finally {
    await server?.close().catch(() => undefined);
    await fixture.cleanup();
  }
});

test("canonical preview digests bind Apply to the exact normalized patch", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const normalized = await normalizeCourseEditPreview({
      schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
      previewSessionId: randomUUID(),
      revision: 1,
      projectSlug: SLUG,
      pageIdentity: livePreviewPageIdentity(),
      mapSourceDigest: target.identity.sourceDigest,
      targetNodeId: target.identity.nodeId,
      identity: target.identity,
      patch: { html: "Canonical learner preview" }
    }, fixture.repoRoot);
    const draft = draftFor(target, String(normalized.canonicalPatch.html));
    draft.patch = normalized.canonicalPatch;
    draft.canonicalPatchDigest = normalized.canonicalPatchDigest;
    const applied = await applyCourseEditBatch({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, projectSlug: SLUG, drafts: [draft] }, fixture.repoRoot);
    assert.equal(applied.ok, true);
    assert.match(await readFile(fixture.sourcePath, "utf8"), /Canonical learner preview/);
    await undoCourseEditBatch(SLUG, fixture.repoRoot);

    const fresh = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const tampered = draftFor(fresh, "Tampered preview");
    tampered.canonicalPatchDigest = "0".repeat(64);
    await assert.rejects(
      applyCourseEditBatch({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, projectSlug: SLUG, drafts: [tampered] }, fixture.repoRoot),
      /saved preview no longer matches/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
  } finally {
    await fixture.cleanup();
  }
});

test("pending image previews stay in bounded memory and clear without filesystem residue", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveElement(fixture.repoRoot, fixture.sourcePath, "img", "index.html");
    const sessionId = randomUUID();
    const pageIdentity = livePreviewPageIdentity();
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
    const pending = await storePendingCourseEditImage({
      projectSlug: SLUG,
      htmlPath: "index.html",
      targetId: target.identity.targetId,
      sourceDigest: target.identity.sourceDigest,
      targetNodeId: target.identity.nodeId,
      previewSessionId: sessionId,
      pageIdentity,
      bytes: png
    });
    assert.equal(pendingCourseEditImageStateForTests().entries, 1);
    await assert.rejects(access(path.join(fixture.repoRoot, "projects", "resources", SLUG, "studio-assets")));
    await assert.rejects(access(path.join(fixture.repoRoot, "projects", SLUG, "workspace", "assets", "custom", "studio")));
    const normalized = await normalizeCourseEditPreview({
      schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
      previewSessionId: sessionId,
      revision: 1,
      projectSlug: SLUG,
      pageIdentity,
      mapSourceDigest: target.identity.sourceDigest,
      targetNodeId: target.identity.nodeId,
      identity: target.identity,
      patch: { src: pending.finalSrc },
      pendingAssets: [pendingReference(pending)]
    }, fixture.repoRoot);
    assert.equal(normalized.canonicalPatch.src, pending.finalSrc);
    assert.equal(normalized.representation.attributes.src, pending.previewSrc);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    await clearCourseEditPreview({
      schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
      previewSessionId: sessionId,
      revision: 2,
      projectSlug: SLUG,
      pageIdentity,
      mapSourceDigest: target.identity.sourceDigest,
      targetNodeId: target.identity.nodeId
    });
    assert.deepEqual(pendingCourseEditImageStateForTests(), { entries: 0, bytes: 0 });
  } finally {
    await fixture.cleanup();
  }
});

test("pending images remain memory-only through Save and materialize inside Apply with exact Undo", async () => {
  const fixture = await createFixture();
  try {
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
    await writeFile(path.join(fixture.repoRoot, "projects", SLUG, "workspace", "image.png"), png);
    const target = await resolveElement(fixture.repoRoot, fixture.sourcePath, "img", "index.html");
    const sessionId = randomUUID();
    const pageIdentity = livePreviewPageIdentity();
    const pending = await storePendingCourseEditImage({
      projectSlug: SLUG,
      htmlPath: "index.html",
      targetId: target.identity.targetId,
      sourceDigest: target.identity.sourceDigest,
      targetNodeId: target.identity.nodeId,
      previewSessionId: sessionId,
      pageIdentity,
      bytes: png
    });
    const reference = pendingReference(pending);
    const normalized = await normalizeCourseEditPreview({
      schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
      previewSessionId: sessionId,
      revision: 1,
      projectSlug: SLUG,
      pageIdentity,
      mapSourceDigest: target.identity.sourceDigest,
      targetNodeId: target.identity.nodeId,
      identity: target.identity,
      patch: { src: reference.finalSrc, alt: "Applied from pending memory" },
      pendingAssets: [reference]
    }, fixture.repoRoot);
    await clearCourseEditPreview({
      schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
      previewSessionId: sessionId,
      revision: 2,
      projectSlug: SLUG,
      pageIdentity,
      mapSourceDigest: target.identity.sourceDigest,
      targetNodeId: target.identity.nodeId,
      retainPendingAssetIds: [reference.id]
    });
    assert.equal(pendingCourseEditImageStateForTests().entries, 1);
    const resourceAsset = path.join(fixture.repoRoot, "projects", "resources", SLUG, "studio-assets", `${reference.digest}.png`);
    const workspaceAsset = path.join(fixture.repoRoot, "projects", SLUG, "workspace", "assets", "custom", "studio", `${reference.digest}.png`);
    await assert.rejects(access(resourceAsset));
    await assert.rejects(access(workspaceAsset));
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);

    const now = Date.now();
    const draft: CourseEditDraft = {
      id: "pending-image-draft",
      createdAt: now,
      updatedAt: now,
      identity: target.identity,
      beforeText: target.originalText,
      afterText: "Applied from pending memory",
      baseline: {
        originalHtml: target.originalHtml,
        attributes: target.attributes,
        currentStyle: target.currentStyle,
        capabilities: target.capabilities
      },
      patch: normalized.canonicalPatch,
      canonicalPatchDigest: normalized.canonicalPatchDigest,
      pendingAssets: normalized.pendingAssets
    };
    const applied = await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draft]
    }, fixture.repoRoot);
    assert.equal(applied.ok, true);
    assert.match(await readFile(fixture.sourcePath, "utf8"), /Applied from pending memory/);
    assert.deepEqual(await readFile(resourceAsset), png);
    assert.deepEqual(await readFile(workspaceAsset), png);
    assert.equal(pendingCourseEditImageStateForTests().entries, 0);

    await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    await assert.rejects(access(resourceAsset));
    await assert.rejects(access(workspaceAsset));
    await assert.rejects(access(path.dirname(resourceAsset)));
    await assert.rejects(access(path.dirname(workspaceAsset)));
  } finally {
    await fixture.cleanup();
  }
});

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
  const patch: CourseEditDraft["patch"] = {
    html,
    style: { textTone: "accent", spacing: "relaxed" }
  };
  const canonicalStyle = Object.fromEntries(
    Object.entries(patch.style ?? {}).filter(([key, value]) => (
      target.currentStyle[key as keyof typeof target.currentStyle] !== value
    ))
  );
  const canonicalPatch: CourseEditDraft["patch"] = {
    html: sanitizeCourseEditRichText(html),
    ...(Object.keys(canonicalStyle).length ? { style: canonicalStyle } : {})
  };
  return {
    id: "draft-1",
    createdAt: 1,
    updatedAt: 2,
    identity: target.identity,
    beforeText: target.originalText,
    afterText: html.replace(/<[^>]+>/g, ""),
    baseline: {
      originalHtml: target.originalHtml,
      attributes: target.attributes,
      currentStyle: target.currentStyle,
      capabilities: target.capabilities
    },
    patch,
    canonicalPatchDigest: courseEditCanonicalPatchDigest(canonicalPatch)
  };
}

async function startCourseEditRouteServer(repoRoot: string) {
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    void handleCourseEditsRoute(pathname, request, response, { repoRoot }).then((handled) => {
      if (!handled && !response.writableEnded) {
        response.statusCode = 404;
        response.end("Not found");
      }
    }).catch((error) => {
      response.statusCode = 500;
      response.end(error instanceof Error ? error.message : String(error));
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return {
    origin: `http://127.0.0.1:${address.port}`,
    async close() {
      server.close();
      await once(server, "close");
    }
  };
}

async function routeJson<T>(origin: string, pathname: string, method: "GET" | "POST", body?: unknown): Promise<T> {
  const response = await fetch(`${origin}${pathname}`, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const result = await response.json() as T & { error?: string };
  assert.equal(response.ok, true, result.error ?? `Route returned ${response.status}.`);
  return result;
}

async function writeFileFromIndependentProcess(filePath: string, content: string) {
  const child = spawn(process.execPath, [
    "--eval",
    'require("node:fs").writeFileSync(process.argv[1], Buffer.from(process.argv[2], "base64"))',
    filePath,
    Buffer.from(content, "utf8").toString("base64")
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let errorOutput = "";
  child.stderr.on("data", (chunk) => { errorOutput += chunk.toString(); });
  const [exitCode] = await once(child, "exit");
  assert.equal(exitCode, 0, errorOutput);
}

test("direct Studio edits apply atomically, mark exports stale, and undo", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const draft = draftFor(target, "<strong>Updated</strong><script>bad()</script> heading");
    const result = await applyCourseEditBatch({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, projectSlug: SLUG, drafts: [draft] }, fixture.repoRoot);

    assert.equal(result.ok, true);
    assert.deepEqual(result.staleExportTargets.sort(), ["html", "scorm12", "scorm2004"]);
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
    assert.deepEqual(undoneStatus.staleExportTargets.sort(), ["html", "scorm12", "scorm2004"]);
  } finally {
    await fixture.cleanup();
  }
});

test("legacy snapshot edits use replayable overrides and Undo restores the page byte-for-byte", async () => {
  const fixture = await createFixture();
  try {
    const manifestPath = path.join(fixture.repoRoot, "projects", SLUG, "meta", "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
    manifest.authoring = {
      driverId: "legacy-snapshot-v1",
      familyId: "legacy-snapshot",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true }
    };
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    const before = await readFile(fixture.sourcePath, "utf8");
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    assert.equal(target.identity.adapter, "legacy-snapshot");

    const result = await applyCourseEditBatch(
      {
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(target, "Snapshot <strong>update</strong>")]
      },
      fixture.repoRoot
    );
    assert.equal(result.ok, true);
    assert.match(await readFile(fixture.sourcePath, "utf8"), /Snapshot <strong>update<\/strong>/);
    const overridesPath = path.join(fixture.repoRoot, "projects", SLUG, "meta", "studio-edits.json");
    assert.equal((JSON.parse(await readFile(overridesPath, "utf8")) as { overrides: unknown[] }).overrides.length, 1);

    await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), before);
    await assert.rejects(readFile(overridesPath, "utf8"), { code: "ENOENT" });
  } finally {
    await fixture.cleanup();
  }
});

test("legacy snapshot completes serialized draft, HTTP apply, server restart, and HTTP undo lifecycle", async () => {
  const fixture = await createFixture();
  let server: Awaited<ReturnType<typeof startCourseEditRouteServer>> | null = null;
  try {
    const manifestPath = path.join(fixture.repoRoot, "projects", SLUG, "meta", "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
    manifest.authoring = {
      driverId: "legacy-snapshot-v1",
      familyId: "legacy-snapshot",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true }
    };
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    const before = await readFile(fixture.sourcePath, "utf8");
    const document = decoratePreviewHtml(before);
    assert.ok(document);

    server = await startCourseEditRouteServer(fixture.repoRoot);
    const target = await routeJson<CourseEditTarget>(server.origin, "/api/course-edits/resolve", "POST", requestFor(document, "h1"));
    assert.equal(target.eligibility, "editable");
    assert.ok(target.identity);
    assert.equal(target.identity.adapter, "legacy-snapshot");
    const savedDraft = draftFor(
      target as CourseEditTarget & { identity: NonNullable<CourseEditTarget["identity"]> },
      "Snapshot route lifecycle"
    );
    const values = new Map<string, string>();
    const localStorage = {
      getItem(key: string) { return values.get(key) ?? null; },
      setItem(key: string, value: string) { values.set(key, value); },
      removeItem(key: string) { values.delete(key); },
      clear() { values.clear(); },
      key(index: number) { return [...values.keys()][index] ?? null; },
      get length() { return values.size; }
    };
    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
    let serializedDraft: CourseEditDraft;
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage } });
    try {
      assert.equal(saveCourseEditDrafts(SLUG, [savedDraft]), true);
      serializedDraft = JSON.parse(JSON.stringify(loadCourseEditDrafts(SLUG)[0])) as CourseEditDraft;
    } finally {
      if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
      else Reflect.deleteProperty(globalThis, "window");
    }
    assert.equal(isCourseEditDraft(serializedDraft), true);

    const applied = await routeJson<{ ok: boolean; canUndo: boolean }>(
      server.origin,
      `/api/projects/${SLUG}/course-edits/apply`,
      "POST",
      { schemaVersion: COURSE_EDIT_SCHEMA_VERSION, projectSlug: SLUG, drafts: [serializedDraft] }
    );
    assert.equal(applied.ok, true);
    assert.equal(applied.canUndo, true);
    assert.match(await readFile(fixture.sourcePath, "utf8"), /Snapshot route lifecycle/);

    await server.close();
    server = null;
    server = await startCourseEditRouteServer(fixture.repoRoot);
    const restarted = await routeJson<{ canUndo: boolean }>(server.origin, `/api/projects/${SLUG}/course-edits/status`, "GET");
    assert.equal(restarted.canUndo, true);
    const undone = await routeJson<{ ok: boolean; canUndo: boolean }>(
      server.origin,
      `/api/projects/${SLUG}/course-edits/undo`,
      "POST"
    );
    assert.equal(undone.ok, true);
    assert.equal(undone.canUndo, false);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), before);
  } finally {
    await server?.close().catch(() => undefined);
    await fixture.cleanup();
  }
});

test("one legacy snapshot batch materializes and undoes each page against its own source", async () => {
  const fixture = await createFixture();
  const lessonPath = path.join(fixture.repoRoot, "projects", SLUG, "workspace", "lesson.html");
  try {
    const manifestPath = path.join(fixture.repoRoot, "projects", SLUG, "meta", "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
    manifest.authoring = {
      driverId: "legacy-snapshot-v1",
      familyId: "legacy-snapshot",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true }
    };
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const lessonTarget = await resolveElement(fixture.repoRoot, lessonPath, "h2", "lesson.html");
    await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [
        draftFor(target, "Current index update"),
        { ...draftFor(lessonTarget, "Current lesson update"), id: "draft-2" }
      ]
    }, fixture.repoRoot);
    assert.match(await readFile(fixture.sourcePath, "utf8"), /Current index update/);
    assert.match(await readFile(lessonPath, "utf8"), /Current lesson update/);
    await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    assert.equal(await readFile(lessonPath, "utf8"), SECOND_HTML);
  } finally {
    await fixture.cleanup();
  }
});

test("course status derives a useful rename title when legacy metadata omits title", async () => {
  const fixture = await createFixture();
  try {
    const manifestPath = path.join(fixture.repoRoot, "projects", SLUG, "meta", "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    delete manifest.title;
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    assert.equal((await getCourseEditStatus(SLUG, fixture.repoRoot)).courseTitle, "Studio edit fixture");
  } finally {
    await fixture.cleanup();
  }
});

test("direct Studio editing rejects text replaced by course runtime code", async () => {
  const fixture = await createFixture();
  try {
    const document = decoratePreviewHtml(await readFile(fixture.sourcePath, "utf8"));
    assert.ok(document);
    const request = requestFor(document, "h1");
    request.selection.visibleText = "Runtime replacement";
    const target = await resolveCourseEditTarget(request, fixture.repoRoot);
    assert.equal(target.eligibility, "unsupported");
    assert.match(target.reason, /replaced by course code/i);
  } finally {
    await fixture.cleanup();
  }
});

test("rendered-result validation rolls back an edit that course JavaScript replaces after load", async () => {
  const fixture = await createFixture();
  try {
    const runtimeHtml = ORIGINAL_HTML.replace(
      "</body>",
      `<script>setTimeout(() => { document.querySelector("h1").textContent = "Runtime wins"; }, 40);</script></body>`
    );
    await writeFile(fixture.sourcePath, runtimeHtml, "utf8");
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(target, "Teacher request")]
      }, fixture.repoRoot),
      /rendered-result validation failed|course JavaScript changed/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), runtimeHtml);
    assert.equal((await getCourseEditStatus(SLUG, fixture.repoRoot)).canUndo, false);
  } finally {
    await fixture.cleanup();
  }
});

test("a rendered safety rejection restores exact bytes and leaves no transaction residue", async () => {
  const fixture = await createFixture();
  const journalPath = path.join(fixture.repoRoot, ".runtime", "studio-edit-transactions", SLUG, "active.json");
  const latestPath = path.join(fixture.repoRoot, ".runtime", "studio-edit-checkpoints", SLUG, "latest.json");
  try {
    const lowContrast = ORIGINAL_HTML.replace("<head>", "<head><style>h1{color:#fff;background:#fff}</style>");
    await writeFile(fixture.sourcePath, lowContrast, "utf8");
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const draft = draftFor(target, "Rejected contrast request");
    draft.patch = { html: "Rejected contrast request" };
    draft.canonicalPatchDigest = courseEditCanonicalPatchDigest(draft.patch);
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draft]
      }, fixture.repoRoot),
      /contrast/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), lowContrast);
    await assert.rejects(access(journalPath), { code: "ENOENT" });
    await assert.rejects(access(latestPath), { code: "ENOENT" });
  } finally {
    await fixture.cleanup();
  }
});

test("Undo refuses after a newer filesystem change and preserves that work", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draftFor(target, "Applied version")]
    }, fixture.repoRoot);
    const newer = (await readFile(fixture.sourcePath, "utf8")).replace("Original paragraph", "Newer external work");
    await writeFile(fixture.sourcePath, newer, "utf8");
    const status = await getCourseEditStatus(SLUG, fixture.repoRoot);
    assert.equal(status.canUndo, false);
    assert.match(status.undoUnavailableReason, /changed after/i);
    await assert.rejects(undoCourseEditBatch(SLUG, fixture.repoRoot), /changed after/i);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), newer);
  } finally {
    await fixture.cleanup();
  }
});

test("filesystem lock refuses a second Studio server before any mutation", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const lockRoot = path.join(fixture.repoRoot, ".runtime", "studio-edit-locks", SLUG);
    await mkdir(lockRoot, { recursive: true });
    await writeFile(path.join(lockRoot, "owner.json"), `${JSON.stringify({
      schemaVersion: 1,
      lockId: randomUUID(),
      projectSlug: SLUG,
      operation: "apply",
      pid: process.pid,
      hostname: os.hostname(),
      startedAt: new Date().toISOString()
    })}\n`, "utf8");
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(target, "Blocked version")]
      }, fixture.repoRoot),
      /another Studio server/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
  } finally {
    await fixture.cleanup();
  }
});

test("two independent Node processes racing for a course lock produce exactly one winner", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-lock-race-"));
  const helper = path.join(process.cwd(), "scripts", "tests", "helpers", "course-edit-lock-worker.ts");
  const barrier = path.join(repoRoot, "barrier");
  const runWorker = (id: string) => {
    const child = spawn(process.execPath, ["--import", "tsx", helper, repoRoot, id], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"]
    });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk.toString(); });
    child.stderr.on("data", (chunk) => { output += chunk.toString(); });
    return { child, output: () => output };
  };
  const waitFor = async (filePath: string) => {
    for (let attempt = 0; attempt < 1_000; attempt += 1) {
      try {
        await access(filePath);
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
    throw new Error(`Timed out waiting for ${filePath}.`);
  };
  try {
    const workers = [runWorker("one"), runWorker("two")];
    await Promise.all([waitFor(path.join(barrier, "ready-one")), waitFor(path.join(barrier, "ready-two"))]);
    await writeFile(path.join(barrier, "go"), "go\n", "utf8");
    const exits = await Promise.all(workers.map(({ child }) => once(child, "exit")));
    assert.deepEqual(exits.map((entry) => entry[0]), [0, 0], workers.map((entry) => entry.output()).join("\n"));
    const results = await Promise.all(["one", "two"].map((id) => readFile(path.join(barrier, `result-${id}`), "utf8")));
    assert.equal(results.filter((entry) => entry === "acquired\n").length, 1);
    assert.equal(results.filter((entry) => /^rejected:Another Studio server/i.test(entry)).length, 1);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("an interrupted known-partial multi-file transaction is recovered before new work", async () => {
  const fixture = await createFixture();
  const secondPath = path.join(fixture.repoRoot, "projects", SLUG, "workspace", "lesson.html");
  try {
    const first = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const second = await resolveElement(fixture.repoRoot, secondPath, "h2", "lesson.html");
    await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draftFor(first, "Applied first"), { ...draftFor(second, "Applied second"), id: "draft-2" }]
    }, fixture.repoRoot);
    const staleTarget = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const checkpointPath = path.join(fixture.repoRoot, ".runtime", "studio-edit-checkpoints", SLUG, "latest.json");
    const checkpoint = JSON.parse(await readFile(checkpointPath, "utf8"));
    await writeFile(fixture.sourcePath, ORIGINAL_HTML, "utf8");
    const journalPath = path.join(fixture.repoRoot, ".runtime", "studio-edit-transactions", SLUG, "active.json");
    await mkdir(path.dirname(journalPath), { recursive: true });
    await writeFile(journalPath, `${JSON.stringify({
      schemaVersion: 1,
      transactionId: "interrupted-fixture",
      projectSlug: SLUG,
      operation: "apply",
      checkpointId: checkpoint.checkpointId,
      phase: "mutating",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedBefore: checkpoint.expectedBefore,
      expectedAfter: checkpoint.expectedAfter
    }, null, 2)}\n`, "utf8");
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(staleTarget, "New request")]
      }, fixture.repoRoot),
      /selected element changed|stable edit identity/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    assert.equal(await readFile(secondPath, "utf8"), SECOND_HTML);
    await assert.rejects(readFile(journalPath, "utf8"), /ENOENT/);
  } finally {
    await fixture.cleanup();
  }
});

test("interrupted recovery preserves unknown newer filesystem work and fails closed", async () => {
  const fixture = await createFixture();
  const secondPath = path.join(fixture.repoRoot, "projects", SLUG, "workspace", "lesson.html");
  try {
    const first = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const second = await resolveElement(fixture.repoRoot, secondPath, "h2", "lesson.html");
    await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draftFor(first, "Applied first"), { ...draftFor(second, "Applied second"), id: "draft-2" }]
    }, fixture.repoRoot);
    const checkpoint = JSON.parse(await readFile(
      path.join(fixture.repoRoot, ".runtime", "studio-edit-checkpoints", SLUG, "latest.json"),
      "utf8"
    ));
    const unknownFirst = "<!doctype html><html><body><h1>Newer external first</h1></body></html>";
    const unknownSecond = "<!doctype html><html><body><h2>Newer external second</h2></body></html>";
    await writeFileFromIndependentProcess(fixture.sourcePath, unknownFirst);
    await writeFileFromIndependentProcess(secondPath, unknownSecond);
    const journalPath = path.join(fixture.repoRoot, ".runtime", "studio-edit-transactions", SLUG, "active.json");
    await mkdir(path.dirname(journalPath), { recursive: true });
    await writeFile(journalPath, `${JSON.stringify({
      schemaVersion: 1,
      transactionId: "interrupted-external-fixture",
      projectSlug: SLUG,
      operation: "apply",
      checkpointId: checkpoint.checkpointId,
      phase: "mutating",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedBefore: checkpoint.expectedBefore,
      expectedAfter: checkpoint.expectedAfter
    }, null, 2)}\n`, "utf8");
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(first, "New request")]
      }, fixture.repoRoot),
      /preserved the interrupted transaction|manual recovery/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), unknownFirst);
    assert.equal(await readFile(secondPath, "utf8"), unknownSecond);
    assert.equal(JSON.parse(await readFile(journalPath, "utf8")).phase, "manual-recovery");
  } finally {
    await fixture.cleanup();
  }
});

test("terminal transaction cleanup is ordered and idempotent across retry boundaries", async () => {
  const fixture = await createFixture();
  const checkpointRoot = path.join(fixture.repoRoot, ".runtime", "studio-edit-checkpoints", SLUG);
  const journalPath = path.join(fixture.repoRoot, ".runtime", "studio-edit-transactions", SLUG, "active.json");
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draftFor(target, "Committed cleanup fixture")]
    }, fixture.repoRoot);
    const checkpoint = JSON.parse(await readFile(path.join(checkpointRoot, "latest.json"), "utf8"));
    const orphanId = "cleanup-orphan-before-journal-removal";
    await mkdir(path.join(checkpointRoot, orphanId), { recursive: true });
    await writeFile(path.join(checkpointRoot, orphanId, "orphan.txt"), "orphan", "utf8");
    await mkdir(path.dirname(journalPath), { recursive: true });
    await writeFile(journalPath, `${JSON.stringify({
      schemaVersion: 1,
      transactionId: "committed-cleanup-fixture",
      projectSlug: SLUG,
      operation: "apply",
      checkpointId: checkpoint.checkpointId,
      phase: "committed",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedBefore: checkpoint.expectedBefore,
      expectedAfter: checkpoint.expectedAfter,
      cleanupCheckpointIds: [orphanId]
    }, null, 2)}\n`, "utf8");

    await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    await assert.rejects(access(path.join(checkpointRoot, orphanId)), { code: "ENOENT" });
    await assert.rejects(access(journalPath), { code: "ENOENT" });

    await writeFile(journalPath, `${JSON.stringify({
      schemaVersion: 1,
      transactionId: "committed-cleanup-retry-fixture",
      projectSlug: SLUG,
      operation: "undo",
      checkpointId: null,
      phase: "committed",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedBefore: [],
      expectedAfter: [],
      cleanupCheckpointIds: [orphanId]
    }, null, 2)}\n`, "utf8");
    const nextTarget = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draftFor(nextTarget, "Retry cleanup fixture")]
    }, fixture.repoRoot);
    await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    await assert.rejects(access(journalPath), { code: "ENOENT" });
  } finally {
    await fixture.cleanup();
  }
});

test("prepared, validating, rolling-back, and rolled-back crash phases recover idempotently", async (context) => {
  for (const phase of ["prepared", "validating", "rolling-back", "rolled-back"] as const) {
    await context.test(phase, async () => {
      const fixture = await createFixture();
      const checkpointRoot = path.join(fixture.repoRoot, ".runtime", "studio-edit-checkpoints", SLUG);
      const latestPath = path.join(checkpointRoot, "latest.json");
      const journalPath = path.join(fixture.repoRoot, ".runtime", "studio-edit-transactions", SLUG, "active.json");
      try {
        const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
        await applyCourseEditBatch({
          schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
          projectSlug: SLUG,
          drafts: [draftFor(target, `Crash phase ${phase}`)]
        }, fixture.repoRoot);
        const checkpoint = JSON.parse(await readFile(latestPath, "utf8"));
        if (phase !== "validating") await writeFile(fixture.sourcePath, ORIGINAL_HTML, "utf8");
        if (phase === "rolled-back") await rm(latestPath, { force: true });
        await mkdir(path.dirname(journalPath), { recursive: true });
        await writeFile(journalPath, `${JSON.stringify({
          schemaVersion: 1,
          transactionId: `crash-${phase}`,
          projectSlug: SLUG,
          operation: "apply",
          checkpointId: checkpoint.checkpointId,
          phase,
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expectedBefore: checkpoint.expectedBefore,
          expectedAfter: checkpoint.expectedAfter,
          ...(phase === "rolled-back" ? { cleanupCheckpointIds: [checkpoint.checkpointId] } : {})
        }, null, 2)}\n`, "utf8");
        await recoverInterruptedCourseEdit(SLUG, fixture.repoRoot);
        assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
        await assert.rejects(access(journalPath), { code: "ENOENT" });
        await assert.rejects(access(latestPath), { code: "ENOENT" });
        await assert.rejects(access(path.join(checkpointRoot, checkpoint.checkpointId)), { code: "ENOENT" });
        await recoverInterruptedCourseEdit(SLUG, fixture.repoRoot);
        assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
      } finally {
        await fixture.cleanup();
      }
    });
  }
});

test("directory recovery reconciles in place without replacing the watched root", async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-restore-in-place-"));
  const backup = path.join(fixtureRoot, "backup");
  const target = path.join(fixtureRoot, "target");
  try {
    await Promise.all([mkdir(path.join(backup, "nested"), { recursive: true }), mkdir(path.join(target, "nested"), { recursive: true })]);
    await Promise.all([
      writeFile(path.join(backup, "kept.txt"), "checkpoint", "utf8"),
      writeFile(path.join(backup, "nested", "child.txt"), "nested checkpoint", "utf8"),
      writeFile(path.join(target, "kept.txt"), "changed", "utf8"),
      writeFile(path.join(target, "nested", "child.txt"), "changed nested", "utf8"),
      writeFile(path.join(target, "conflict 2.txt"), "late duplicate", "utf8")
    ]);
    const inodeBefore = (await stat(target)).ino;
    await restoreCheckpointDirectoryInPlace(backup, target);
    assert.equal((await stat(target)).ino, inodeBefore);
    assert.equal(await readFile(path.join(target, "kept.txt"), "utf8"), "checkpoint");
    assert.equal(await readFile(path.join(target, "nested", "child.txt"), "utf8"), "nested checkpoint");
    await assert.rejects(readFile(path.join(target, "conflict 2.txt"), "utf8"), /ENOENT/);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("no-op drafts and unsafe heading size controls are rejected", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const noOp = draftFor(target, target.originalHtml);
    noOp.patch = { html: target.originalHtml };
    await assert.rejects(
      applyCourseEditBatch({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, projectSlug: SLUG, drafts: [noOp] }, fixture.repoRoot),
      /actual change/i
    );
    const unsafe = draftFor(target, "Safe text");
    unsafe.patch = { html: "Safe text", style: { fontSize: "x-large" } };
    await assert.rejects(
      applyCourseEditBatch({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, projectSlug: SLUG, drafts: [unsafe] }, fixture.repoRoot),
      /fontSize control is not safe/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
  } finally {
    await fixture.cleanup();
  }
});

test("Rename course synchronizes declared surfaces, validates, and remains safely undoable", async () => {
  const fixture = await createFixture();
  try {
    const result = await renameCourseForStudio({ projectSlug: SLUG, title: "Renamed & Ready", repoRoot: fixture.repoRoot });
    assert.equal(result.courseTitle, "Renamed & Ready");
    assert.equal(result.canUndo, true);
    const html = await readFile(fixture.sourcePath, "utf8");
    assert.match(html, /<title data-canvas-helper-course-title>Renamed &amp; Ready<\/title>/);
    assert.equal((html.match(/data-canvas-helper-course-title>Renamed &amp; Ready/g) ?? []).length, 3);
    assert.match(await readFile(path.join(fixture.repoRoot, "projects", SLUG, "workspace", "course-data.js"), "utf8"), /"Renamed & Ready"/);
    assert.equal(JSON.parse(await readFile(path.join(fixture.repoRoot, "projects", SLUG, "meta", "project.json"), "utf8")).title, "Renamed & Ready");
    assert.equal(JSON.parse(await readFile(path.join(fixture.repoRoot, "projects", SLUG, "meta", "studio-course.json"), "utf8")).title, "Renamed & Ready");
    await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    assert.match(await readFile(path.join(fixture.repoRoot, "projects", SLUG, "workspace", "course-data.js"), "utf8"), /"Studio edit fixture"/);
  } finally {
    await fixture.cleanup();
  }
});

test("factory Rename records a metadata-only boundary and rolls back when rebuild fails", async () => {
  const fixture = await createFixture();
  try {
    const manifestPath = path.join(fixture.repoRoot, "projects", SLUG, "meta", "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
    manifest.authoring = {
      driverId: "legacy-snapshot-v1",
      familyId: "legacy-snapshot",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true }
    };
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    const beforeConfiguredManifest = await readFile(manifestPath, "utf8");
    const beforeHtml = await readFile(fixture.sourcePath, "utf8");

    await assert.rejects(
      renameCourseForStudio({
        projectSlug: SLUG,
        title: "Interrupted factory rename",
        repoRoot: fixture.repoRoot,
        hooks: {
          runRebuild() { throw new Error("simulated factory rebuild failure"); }
        }
      }),
      /simulated factory rebuild failure/i
    );

    assert.equal(await readFile(fixture.sourcePath, "utf8"), beforeHtml);
    assert.equal(await readFile(manifestPath, "utf8"), beforeConfiguredManifest);
    await assert.rejects(
      readFile(path.join(fixture.repoRoot, "projects", SLUG, "meta", "studio-course.json"), "utf8"),
      { code: "ENOENT" }
    );
    const status = await getCourseEditStatus(SLUG, fixture.repoRoot);
    assert.equal(status.available, true);
    assert.equal(status.canUndo, false);
  } finally {
    await fixture.cleanup();
  }
});

test("export freshness is tied to workspace and artifact bytes with separate SCORM variants", async () => {
  const fixture = await createFixture();
  try {
    const exportsRoot = path.join(fixture.repoRoot, "projects", SLUG, "exports");
    await mkdir(path.join(exportsRoot, "single-html"), { recursive: true });
    await writeFile(path.join(exportsRoot, "single-html", `${SLUG}.html`), ORIGINAL_HTML, "utf8");
    await writeFile(path.join(exportsRoot, `${SLUG}-scorm-2004.zip`), "2004-a", "utf8");
    await writeFile(path.join(exportsRoot, `${SLUG}-scorm-1-2.zip`), "12-a", "utf8");
    await markCourseExportCurrent(SLUG, "html", fixture.repoRoot);
    await markCourseExportCurrent(SLUG, "scorm2004", fixture.repoRoot);
    await markCourseExportCurrent(SLUG, "scorm12", fixture.repoRoot);
    assert.deepEqual((await getCourseEditStatus(SLUG, fixture.repoRoot)).staleExportTargets, []);

    const manifestPath = path.join(fixture.repoRoot, "projects", SLUG, "meta", "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    await writeFile(manifestPath, `${JSON.stringify({ ...manifest, title: "Changed export configuration" }, null, 2)}\n`, "utf8");
    assert.deepEqual(
      (await getCourseEditStatus(SLUG, fixture.repoRoot)).staleExportTargets.sort(),
      ["html", "scorm12", "scorm2004"]
    );
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    await markCourseExportCurrent(SLUG, "html", fixture.repoRoot);
    await markCourseExportCurrent(SLUG, "scorm2004", fixture.repoRoot);
    await markCourseExportCurrent(SLUG, "scorm12", fixture.repoRoot);

    await writeFile(path.join(exportsRoot, `${SLUG}-scorm-2004.zip`), "2004-tampered", "utf8");
    assert.deepEqual((await getCourseEditStatus(SLUG, fixture.repoRoot)).staleExportTargets, ["scorm2004"]);
    await writeFile(fixture.sourcePath, ORIGINAL_HTML.replace("Original paragraph", "Workspace changed"), "utf8");
    assert.deepEqual(
      (await getCourseEditStatus(SLUG, fixture.repoRoot)).staleExportTargets.sort(),
      ["html", "scorm12", "scorm2004"]
    );
  } finally {
    await fixture.cleanup();
  }
});

test("export input fingerprints change with entrypoint and side-effect dependency changes", async () => {
  const fixture = await createFixture();
  const implementationRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-exporter-version-"));
  const exporterPath = path.join(implementationRoot, "scripts", "lib", "exports", "single-html.ts");
  const dependencyPath = path.join(implementationRoot, "scripts", "lib", "exports", "export-setup.ts");
  try {
    await mkdir(path.dirname(exporterPath), { recursive: true });
    await writeFile(path.join(implementationRoot, "package.json"), "{}\n", "utf8");
    await writeFile(dependencyPath, "export const setupVersion = 1;\n", "utf8");
    await writeFile(exporterPath, "import \"./export-setup.ts\";\nexport const exporterVersion = 1;\n", "utf8");
    const first = await fingerprintCourseExportInputs({
      repoRoot: fixture.repoRoot,
      projectSlug: SLUG,
      target: "html",
      implementationRoot
    });
    const manifestPath = path.join(fixture.repoRoot, "projects", SLUG, "meta", "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    await writeFile(manifestPath, `${JSON.stringify({
      ...manifest,
      updatedAt: "2026-08-13T12:00:00.000Z",
      workspaceApprovedAt: "2026-08-13T12:00:00.000Z"
    }, null, 2)}\n`, "utf8");
    assert.equal(await fingerprintCourseExportInputs({
      repoRoot: fixture.repoRoot,
      projectSlug: SLUG,
      target: "html",
      implementationRoot
    }), first);
    await writeFile(dependencyPath, "export const setupVersion = 2;\n", "utf8");
    const second = await fingerprintCourseExportInputs({
      repoRoot: fixture.repoRoot,
      projectSlug: SLUG,
      target: "html",
      implementationRoot
    });
    assert.notEqual(second, first);
    await writeFile(exporterPath, "import \"./export-setup.ts\";\nexport const exporterVersion = 2;\n", "utf8");
    assert.notEqual(await fingerprintCourseExportInputs({
      repoRoot: fixture.repoRoot,
      projectSlug: SLUG,
      target: "html",
      implementationRoot
    }), second);
  } finally {
    await rm(implementationRoot, { recursive: true, force: true });
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

test("an unrelated source change safely rebases the draft without overwriting newer work", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const externallyChanged = ORIGINAL_HTML.replace("Original paragraph", "Changed outside Studio");
    await writeFile(fixture.sourcePath, externallyChanged, "utf8");
    await applyCourseEditBatch({
      schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
      projectSlug: SLUG,
      drafts: [draftFor(target, "Rebased draft")]
    }, fixture.repoRoot);
    const applied = await readFile(fixture.sourcePath, "utf8");
    assert.match(applied, /Rebased draft/);
    assert.match(applied, /Changed outside Studio/);
    await undoCourseEditBatch(SLUG, fixture.repoRoot);
    assert.equal(await readFile(fixture.sourcePath, "utf8"), externallyChanged);
  } finally {
    await fixture.cleanup();
  }
});

test("a selected element change still rejects the draft", async () => {
  const fixture = await createFixture();
  try {
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const externallyChanged = ORIGINAL_HTML.replace("Hello teacher", "Changed outside Studio");
    await writeFile(fixture.sourcePath, externallyChanged, "utf8");
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(target, "Stale draft")]
      }, fixture.repoRoot),
      /selected element changed|stable edit identity/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), externallyChanged);
  } finally {
    await fixture.cleanup();
  }
});

test("batch preflight identifies the stale draft before any course file changes", async () => {
  const fixture = await createFixture();
  const secondPath = path.join(fixture.repoRoot, "projects", SLUG, "workspace", "lesson.html");
  try {
    const first = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const second = await resolveElement(fixture.repoRoot, secondPath, "h2", "lesson.html");
    await writeFile(secondPath, SECOND_HTML.replace("Second page heading", "Externally changed heading"), "utf8");
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(first, "First draft must not apply"), { ...draftFor(second, "Stale second draft"), id: "draft-2" }]
      }, fixture.repoRoot),
      /Draft 2 .*needs attention.*No course files changed/i
    );
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
    assert.equal((await getCourseEditStatus(SLUG, fixture.repoRoot)).canUndo, false);
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
    const childDraft = { ...draftFor(strong, "Updated child"), id: "draft-2" };
    childDraft.patch = { html: "Updated child" };
    childDraft.canonicalPatchDigest = courseEditCanonicalPatchDigest(childDraft.patch);
    await assert.rejects(
      applyCourseEditBatch({
        schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
        projectSlug: SLUG,
        drafts: [draftFor(paragraph, "Updated parent"), childDraft]
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
    const exportsRoot = path.join(fixture.repoRoot, "projects", SLUG, "exports");
    await mkdir(path.join(exportsRoot, "single-html"), { recursive: true });
    await writeFile(path.join(exportsRoot, "single-html", `${SLUG}.html`), applied, "utf8");
    await writeFile(path.join(exportsRoot, `${SLUG}-scorm-2004.zip`), "scorm-2004", "utf8");
    await writeFile(path.join(exportsRoot, `${SLUG}-scorm-1-2.zip`), "scorm-1-2", "utf8");
    await markCourseExportCurrent(SLUG, "html", fixture.repoRoot);
    await markCourseExportCurrent(SLUG, "scorm2004", fixture.repoRoot);
    await markCourseExportCurrent(SLUG, "scorm12", fixture.repoRoot);
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
    assert.deepEqual(undone.staleExportTargets.sort(), ["html", "scorm12", "scorm2004"]);
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

test("generated text-only overrides do not inject Studio style CSS", () => {
  const generated = "<!doctype html><html><head><title>Generated</title></head><body><main><p>Original</p></main></body></html>";
  const paragraph = collectEditableHtmlElements(generated, "factory-fixture", "index.html")?.find((entry) => entry.tagName === "p");
  assert.ok(paragraph);
  const rebuilt = applyCourseEditOverridesToHtml({
    html: generated,
    projectSlug: "factory-fixture",
    overrides: [{
      editId: paragraph.editId,
      htmlPath: "index.html",
      tagName: paragraph.tagName,
      pathKey: paragraph.pathKey,
      patch: { html: "Teacher text" },
      updatedAt: "2026-08-12T00:00:00.000Z"
    }]
  });
  assert.match(rebuilt, /Teacher text/);
  assert.doesNotMatch(rebuilt, /data-canvas-helper-studio-edit-styles/);
});

test("generated edit identities survive reordering distinct sibling content", () => {
  const original = "<!doctype html><html><body><main><p>Alpha</p><p>Beta</p></main></body></html>";
  const reordered = "<!doctype html><html><body><main><p>Beta</p><p>Alpha</p></main></body></html>";
  const originalElements = collectEditableHtmlElements(original, "factory-fixture", "index.html");
  const reorderedElements = collectEditableHtmlElements(reordered, "factory-fixture", "index.html");
  assert.ok(originalElements && reorderedElements);
  const alphaBefore = originalElements.find((entry) => original.slice(entry.innerStart, entry.innerEnd) === "Alpha");
  const alphaAfter = reorderedElements.find((entry) => reordered.slice(entry.innerStart, entry.innerEnd) === "Alpha");
  assert.ok(alphaBefore && alphaAfter);
  assert.equal(alphaAfter.editId, alphaBefore.editId);
});

test("generated replay refuses identical siblings until canonical durable keys disambiguate them", () => {
  const original = "<!doctype html><html><body><main><button>Continue</button><button>Continue</button></main></body></html>";
  const inserted = "<!doctype html><html><body><main><button>Continue</button><button>Continue</button><button>Continue</button></main></body></html>";
  const buttons = collectEditableHtmlElements(original, "factory-fixture", "index.html")?.filter((entry) => entry.tagName === "button");
  assert.ok(buttons && buttons.length === 2);
  assert.equal(buttons.every((entry) => !entry.replaySafe), true);
  assert.throws(() => applyCourseEditOverridesToHtml({
    html: inserted,
    projectSlug: "factory-fixture",
    overrides: [{
      editId: buttons[1].editId,
      htmlPath: "index.html",
      tagName: "button",
      pathKey: buttons[1].pathKey,
      patch: { html: "Teacher target" },
      updatedAt: "2026-08-13T00:00:00.000Z"
    }]
  }), /durable data-canvas-helper-edit-key/i);

  const keyed = "<!doctype html><html><body><main><button data-canvas-helper-edit-key=\"back\">Continue</button><button data-canvas-helper-edit-key=\"forward\">Continue</button></main></body></html>";
  const keyedButtons = collectEditableHtmlElements(keyed, "factory-fixture", "index.html")?.filter((entry) => entry.tagName === "button");
  assert.ok(keyedButtons && keyedButtons.length === 2);
  assert.equal(keyedButtons.every((entry) => entry.replaySafe), true);
  assert.notEqual(keyedButtons[0].editId, keyedButtons[1].editId);
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
  for (const unsafe of [
    "JaVaScRiPt:alert(1)",
    "java\tscript:alert(1)",
    "java\rscript:alert(1)",
    "java\nscript:alert(1)",
    "java%09script:alert(1)",
    "java%250ascript:alert(1)",
    "javascript%3Aalert(1)",
    "//example.invalid/course.html",
    "/outside.html",
    "..%2foutside.html",
    "%2e%2e/outside.html",
    "..\\outside.html",
    "%5coutside.html",
    "relative%ZZ.html"
  ]) {
    assert.throws(() => sanitizeCourseEditUrl(unsafe, "href"), /control|unsupported|workspace|percent/i, unsafe);
  }
  assert.throws(() => sanitizeCourseEditUrl("../outside.png", "src"), /cannot leave/i);
  assert.throws(
    () => sanitizeCourseEditRichText('<a href="java%09script:alert(1)">unsafe</a>'),
    /control|unsupported/i
  );
  assert.throws(
    () => sanitizeCourseEditRichText(`<strong>${"x".repeat(24_000)}</strong>`),
    /too long after sanitization/i
  );
  assert.equal(sanitizeCourseEditUrl("https://example.invalid/lesson", "href"), "https://example.invalid/lesson");
  assert.equal(sanitizeCourseEditUrl("mailto:teacher@example.invalid", "href"), "mailto:teacher@example.invalid");
  assert.equal(sanitizeCourseEditUrl("assets/photo%20one.png", "src"), "assets/photo%20one.png");
  assert.equal(isCourseEditApplyRequest({
    schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
    projectSlug: SLUG,
    drafts: [{
      ...draftFor({
        eligibility: "editable",
        reason: "",
        capabilities: { richText: true, link: false, image: false, styles: true, styleKeys: ["fontSize", "textTone", "spacing"] },
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
          elementDigest: "d".repeat(64),
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

test("course title synchronization updates every safe marked non-void element", () => {
  const source = [
    "<title data-canvas-helper-course-title>Old</title>",
    "<h1 data-canvas-helper-course-title>Old</h1>",
    "<h4 data-canvas-helper-course-title>Old</h4>",
    "<h5 data-canvas-helper-course-title>Old</h5>",
    "<h6 data-canvas-helper-course-title>Old</h6>",
    "<p data-canvas-helper-course-title>Old</p>",
    "<span data-canvas-helper-course-title>Old</span>",
    "<img data-canvas-helper-course-title alt=\"Old\">"
  ].join("");
  const updated = applyStoredCourseTitleToHtml(source, "New & Ready");
  for (const tagName of ["title", "h1", "h4", "h5", "h6", "p", "span"]) {
    assert.match(updated, new RegExp(`<${tagName}[^>]*>New &amp; Ready<\\/${tagName}>`, "i"));
  }
  assert.match(updated, /<img data-canvas-helper-course-title alt="Old">/i);
});

test("saved drafts reopen through durable identity and distinguish target drift from unrelated page drift", async () => {
  const fixture = await createFixture();
  try {
    const keyed = ORIGINAL_HTML.replace("<h1>Hello teacher</h1>", "<h1 data-canvas-helper-edit-key=\"reopen-heading\">Hello teacher</h1>");
    await writeFile(fixture.sourcePath, keyed, "utf8");
    const target = await resolveHeading(fixture.repoRoot, fixture.sourcePath);
    const initial = await reopenCourseEditTarget(target.identity, fixture.repoRoot);
    assert.equal(initial.status, "resolved");
    if (initial.status !== "resolved") throw new Error("Expected the durable target to reopen.");
    assert.notEqual(initial.target.identity?.nodeId, "");

    await writeFile(fixture.sourcePath, keyed.replace("Original paragraph", "An unrelated later paragraph"), "utf8");
    const unrelated = await reopenCourseEditTarget(target.identity, fixture.repoRoot);
    assert.equal(unrelated.status, "resolved");
    if (unrelated.status !== "resolved") throw new Error("Expected unrelated source drift to resolve.");
    assert.notEqual(unrelated.target.identity?.sourceDigest, target.identity.sourceDigest);

    await writeFile(
      fixture.sourcePath,
      keyed.replace("Hello teacher", "Current heading text").replace("Original paragraph", "An unrelated later paragraph"),
      "utf8"
    );
    const changed = await reopenCourseEditTarget(target.identity, fixture.repoRoot);
    assert.equal(changed.status, "target-changed");
    if (changed.status !== "target-changed") throw new Error("Expected target drift to be reported.");
    assert.equal(changed.currentTarget.originalText, "Current heading text");

    const missing = await reopenCourseEditTarget({ ...target.identity, editId: null }, fixture.repoRoot);
    assert.equal(missing.status, "missing");
  } finally {
    await fixture.cleanup();
  }
});

test("render validation closes the isolated preview server when Chromium launch fails", async () => {
  const fixture = await createFixture();
  try {
    const source = await readFile(fixture.sourcePath, "utf8");
    const heading = collectEditableHtmlElements(source, SLUG, "index.html")?.find((element) => element.tagName === "h1");
    assert.ok(heading);
    let closed = false;
    await assert.rejects(
      validateRenderedCourseEdits({
        repoRoot: fixture.repoRoot,
        projectSlug: SLUG,
        checks: [{
          htmlPath: "index.html",
          tagName: heading.tagName,
          pathKey: heading.pathKey,
          editId: heading.editId,
          expected: { html: source.slice(heading.innerStart, heading.innerEnd) }
        }],
        hooks: {
          async startPreviewServer() {
            return {
              origin: "http://127.0.0.1:9",
              studioOrigin: "http://127.0.0.1:9",
              async close() { closed = true; }
            };
          },
          async launchBrowser() { throw new Error("simulated Chromium launch failure"); }
        }
      }),
      /simulated Chromium launch failure/i
    );
    assert.equal(closed, true);
  } finally {
    await fixture.cleanup();
  }
});

test("course edit HTTP routes reject oversized resolve, rename, and apply bodies", async () => {
  const fixture = await createFixture();
  const server = await startCourseEditRouteServer(fixture.repoRoot);
  try {
    for (const [pathname, bytes] of [
      ["/api/course-edits/resolve", 262_145],
      [`/api/projects/${SLUG}/course-edits/rename`, 16_385],
      [`/api/projects/${SLUG}/course-edits/apply`, 4_194_305]
    ] as const) {
      const response = await fetch(`${server.origin}${pathname}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: " ".repeat(bytes)
      });
      assert.equal(response.ok, false);
      assert.match((await response.text()), /bytes or smaller/i);
    }
    const malformed = await fetch(`${server.origin}/api/projects/%E0%A4%A/course-edits/status`);
    assert.equal(malformed.status, 400);
    assert.match(await malformed.text(), /invalid project slug/i);
    const retiredAssetRoute = await fetch(`${server.origin}/api/projects/${SLUG}/course-edits/assets`, {
      method: "POST",
      body: "retired"
    });
    assert.equal(retiredAssetRoute.status, 404);
    await assert.rejects(access(path.join(fixture.repoRoot, "projects", SLUG, "workspace", "assets", "custom", "studio")));
    assert.equal(await readFile(fixture.sourcePath, "utf8"), ORIGINAL_HTML);
  } finally {
    await server.close();
    await fixture.cleanup();
  }
});
