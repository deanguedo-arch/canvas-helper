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
