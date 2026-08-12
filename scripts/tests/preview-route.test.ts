import assert from "node:assert/strict";
import type { IncomingMessage, ServerResponse } from "node:http";
import test from "node:test";

import { ensureDir, removePath } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";

import { handlePreviewRoutes } from "../../app/server/routes/preview.ts";
import {
  inspectPreviewPreflightTarget,
  resolvePreviewPreflightTarget
} from "../../app/server/lib/preview-preflight.ts";

const previewOrigin = "http://127.0.0.1:61234";
const previewCapability = "12345678-1234-1234-1234-123456789abc";

function workspacePreviewUrl(slug: string, relativePath = "index.html") {
  return `${previewOrigin}/_canvas-helper/p/${previewCapability}/preview/workspace/${slug}/${relativePath}`;
}

function createResponseRecorder() {
  const headers = new Map<string, string>();
  let body = "";

  const response = {
    statusCode: 200,
    setHeader(name: string, value: string) {
      headers.set(name, value);
    },
    end(value?: string | Buffer) {
      body = typeof value === "string" ? value : value ? value.toString("utf8") : "";
    }
  } as unknown as ServerResponse;

  return {
    response,
    headers,
    getBody() {
      return body;
    }
  };
}

test("missing html reference previews return an in-browser diagnostic instead of a silent fallback 404", async () => {
  const slug = `preview-route-${Date.now()}`;
  const paths = getProjectPaths(slug);

  await removePath(paths.root);
  await removePath(paths.resourceDir);

  try {
    await ensureDir(paths.resourceDir);
    const { response, headers, getBody } = createResponseRecorder();

    const handled = await handlePreviewRoutes(
      `/preview/references/raw/${slug}/content/unit-1/missing-lesson.html`,
      { method: "GET" } as IncomingMessage,
      response
    );

    assert.equal(handled, true);
    assert.equal(response.statusCode, 200);
    assert.equal(headers.get("Content-Type"), "text/html; charset=utf-8");
    assert.equal(headers.get("X-Canvas-Helper-Preview-Error"), "missing-reference-resource");
    assert.match(getBody(), /Missing local course resource/i);
    assert.match(getBody(), new RegExp(slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(getBody(), /npm run refs -- --project/);
    assert.equal(getBody().includes(paths.resourceDir), false);
  } finally {
    await removePath(paths.root);
    await removePath(paths.resourceDir);
  }
});

test("missing html workspace previews return an in-browser diagnostic instead of a raw json 404", async () => {
  const slug = `preview-workspace-route-${Date.now()}`;
  const paths = getProjectPaths(slug);

  await removePath(paths.root);
  await removePath(paths.resourceDir);

  try {
    await ensureDir(paths.workspaceDir);
    const { response, headers, getBody } = createResponseRecorder();

    const handled = await handlePreviewRoutes(
      `/preview/workspace/${slug}/assets/missing-assignment.html`,
      { method: "GET" } as IncomingMessage,
      response
    );

    assert.equal(handled, true);
    assert.equal(response.statusCode, 200);
    assert.equal(headers.get("Content-Type"), "text/html; charset=utf-8");
    assert.equal(headers.get("X-Canvas-Helper-Preview-Error"), "missing-workspace-resource");
    assert.match(getBody(), /Missing local workspace asset/i);
    assert.match(getBody(), new RegExp(slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(getBody(), /workspace\/assets/i);
    assert.equal(getBody().includes(paths.workspaceDir), false);
  } finally {
    await removePath(paths.root);
    await removePath(paths.resourceDir);
  }
});

test("preview failures never disclose absolute local paths", async () => {
  const slug = `preview-private-path-${Date.now()}`;
  const paths = getProjectPaths(slug);

  await removePath(paths.root);
  try {
    await ensureDir(paths.workspaceDir);
    const { response, getBody } = createResponseRecorder();
    const handled = await handlePreviewRoutes(
      `/preview/workspace/${slug}/assets/missing-assignment.txt`,
      { method: "GET" } as IncomingMessage,
      response
    );

    assert.equal(handled, true);
    assert.equal(response.statusCode, 404);
    assert.doesNotMatch(getBody(), new RegExp(paths.workspaceDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(getBody(), /\/Users\//);
    assert.match(getBody(), /Preview file not found/i);
  } finally {
    await removePath(paths.root);
  }
});

test("a trailing workspace preview URL uses the declared index entry", async () => {
  const slug = `preview-default-entry-${Date.now()}`;
  const paths = getProjectPaths(slug);

  await removePath(paths.root);
  try {
    await ensureDir(paths.workspaceDir);
    await (await import("node:fs/promises")).writeFile(paths.workspaceEntrypoint, "<main>Default workspace entry</main>", "utf8");
    const { response, getBody } = createResponseRecorder();
    const handled = await handlePreviewRoutes(
      `/preview/workspace/${slug}/`,
      { method: "GET" } as IncomingMessage,
      response
    );

    assert.equal(handled, true);
    assert.equal(response.statusCode, 200);
    assert.match(getBody(), /Default workspace entry/);
  } finally {
    await removePath(paths.root);
  }
});

test("isolated HTML previews receive transient opaque nodes and the bridge without rewriting the source", async () => {
  const slug = `preview-decoration-${Date.now()}`;
  const paths = getProjectPaths(slug);
  const source = "<!doctype html><html><head><script>window.courseScript = true;</script><title>Preview</title></head><body><main><h1>Inspectable</h1></main></body></html>";

  await removePath(paths.root);
  try {
    await ensureDir(paths.workspaceDir);
    await (await import("node:fs/promises")).writeFile(paths.workspaceEntrypoint, source, "utf8");
    const { response, getBody } = createResponseRecorder();

    const handled = await handlePreviewRoutes(
      `/preview/workspace/${slug}/index.html`,
      {
        method: "GET",
        url: `/preview/workspace/${slug}/index.html`
      } as IncomingMessage,
      response,
      { bridgeScriptPath: "/_canvas-helper/preview-bridge.js" }
    );

    assert.equal(handled, true);
    assert.match(getBody(), /data-canvas-helper-inspect-node="ch1:/);
    assert.match(getBody(), /_canvas-helper\/preview-bridge\.js"/);
    assert.doesNotMatch(getBody(), /__ch_(?:nonce|studio|frame)/);
    assert.ok(getBody().indexOf("data-canvas-helper-preview-bridge") < getBody().indexOf("window.courseScript"));
    assert.equal(await (await import("node:fs/promises")).readFile(paths.workspaceEntrypoint, "utf8"), source);
  } finally {
    await removePath(paths.root);
  }
});

test("preview preflight accepts static and approved-runtime course pages", async () => {
  const slug = `preview-preflight-ready-${Date.now()}`;
  const paths = getProjectPaths(slug);
  await removePath(paths.root);
  try {
    await ensureDir(paths.workspaceDir);
    await (await import("node:fs/promises")).writeFile(paths.workspaceEntrypoint, "<main><h1>Ready course</h1></main>", "utf8");
    const staticTarget = await resolvePreviewPreflightTarget(workspacePreviewUrl(slug), previewOrigin);
    const staticResult = await inspectPreviewPreflightTarget(staticTarget);
    assert.equal(staticResult.status, "ready");
    assert.equal(staticResult.runtimeFamily, "static-html");

    await (await import("node:fs/promises")).writeFile(
      paths.workspaceEntrypoint,
      '<div id="root"></div><script type="module">import React from "https://esm.sh/react@19.1.1";</script>',
      "utf8"
    );
    const runtimeResult = await inspectPreviewPreflightTarget(staticTarget);
    assert.equal(runtimeResult.status, "ready");
    assert.equal(runtimeResult.runtimeFamily, "approved-runtime");

    await (await import("node:fs/promises")).writeFile(
      paths.workspaceEntrypoint,
      `<html><body>${" ".repeat(768 * 1024)}<main>Content beyond the bounded sample</main></body></html>`,
      "utf8"
    );
    const largePage = await inspectPreviewPreflightTarget(staticTarget);
    assert.equal(largePage.status, "ready");
  } finally {
    await removePath(paths.root);
  }
});

test("preview preflight turns empty and missing-runtime pages into useful recovery states", async () => {
  const slug = `preview-preflight-recovery-${Date.now()}`;
  const paths = getProjectPaths(slug);
  await removePath(paths.root);
  try {
    await ensureDir(paths.workspaceDir);
    await (await import("node:fs/promises")).writeFile(paths.workspaceEntrypoint, "<!doctype html><html><body></body></html>", "utf8");
    const target = await resolvePreviewPreflightTarget(workspacePreviewUrl(slug), previewOrigin);
    const empty = await inspectPreviewPreflightTarget(target);
    assert.equal(empty.status, "error");
    assert.equal(empty.code, "empty-page");

    await (await import("node:fs/promises")).writeFile(
      paths.workspaceEntrypoint,
      '<div id="root"></div><script src="./missing-main.js"></script>',
      "utf8"
    );
    const missingRuntime = await inspectPreviewPreflightTarget(target);
    assert.equal(missingRuntime.status, "error");
    assert.equal(missingRuntime.code, "missing-local-runtime");
    assert.match(missingRuntime.message, /local script that is missing/i);
    assert.deepEqual(missingRuntime.details, ["Missing script: missing-main.js"]);
    assert.doesNotMatch(JSON.stringify(missingRuntime), /\/Users\//);
  } finally {
    await removePath(paths.root);
  }
});

test("preview preflight warns about styling and unsupported runtime families without hiding static content", async () => {
  const slug = `preview-preflight-warning-${Date.now()}`;
  const paths = getProjectPaths(slug);
  await removePath(paths.root);
  try {
    await ensureDir(paths.workspaceDir);
    await (await import("node:fs/promises")).writeFile(
      paths.workspaceEntrypoint,
      '<main>Readable fallback</main><link rel="stylesheet" href="./missing.css"><script src="https://example.com/course.js?token=secret-value"></script>',
      "utf8"
    );
    const target = await resolvePreviewPreflightTarget(workspacePreviewUrl(slug), previewOrigin);
    const unsupported = await inspectPreviewPreflightTarget(target);
    assert.equal(unsupported.status, "warning");
    assert.equal(unsupported.code, "unsupported-runtime");
    assert.deepEqual(unsupported.details, ["Unsupported script host: example.com"]);
    assert.doesNotMatch(JSON.stringify(unsupported), /secret-value|token=/);

    await (await import("node:fs/promises")).writeFile(
      paths.workspaceEntrypoint,
      '<main>Readable fallback</main><link rel="stylesheet" href="./missing.css">',
      "utf8"
    );
    const missingStyle = await inspectPreviewPreflightTarget(target);
    assert.equal(missingStyle.status, "warning");
    assert.equal(missingStyle.code, "missing-local-style");
  } finally {
    await removePath(paths.root);
  }
});

test("preview preflight rejects URLs outside the exact isolated loopback origin", async () => {
  await assert.rejects(
    resolvePreviewPreflightTarget(
      `https://example.com/_canvas-helper/p/${previewCapability}/preview/workspace/course/index.html`,
      previewOrigin
    ),
    /outside the isolated local preview/i
  );
});
