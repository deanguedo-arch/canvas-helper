import assert from "node:assert/strict";
import type { IncomingMessage, ServerResponse } from "node:http";
import test from "node:test";

import { ensureDir, removePath } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";

import { handlePreviewRoutes } from "../../app/server/routes/preview.ts";

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
  } finally {
    await removePath(paths.root);
    await removePath(paths.resourceDir);
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
