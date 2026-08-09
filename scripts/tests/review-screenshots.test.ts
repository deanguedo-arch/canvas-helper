import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  cleanupExpiredReviewScreenshotSessions,
  REVIEW_SCREENSHOT_RETENTION_MS,
  saveReviewScreenshot
} from "../../app/server/lib/review-screenshots.ts";
import { createReviewScreenshotRouteHandler } from "../../app/server/routes/review-screenshots.ts";

const sessionId = "12345678-1234-1234-1234-123456789abc";

function boundedPng(width = 640, height = 480) {
  const png = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png, 0);
  png.writeUInt32BE(13, 8);
  Buffer.from("IHDR").copy(png, 12);
  png.writeUInt32BE(width, 16);
  png.writeUInt32BE(height, 20);
  return png;
}

test("Review Set screenshot storage writes bounded PNGs to ignored repo-relative session paths", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-review-screenshots-"));
  try {
    const png = boundedPng();
    const result = await saveReviewScreenshot({
      sessionId,
      projectSlug: "e2e-fixture",
      itemId: "review-1",
      png
    }, { rootDir });

    assert.equal(result.path, `.runtime/studio-review-sets/${sessionId}/e2e-fixture-review-1.png`);
    assert.equal(result.byteLength, png.length);
    assert.equal(result.width, 640);
    assert.equal(result.height, 480);
    assert.deepEqual(await readFile(result.absolutePath), png);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("Review Set screenshot storage rejects invalid dimensions and more than five files per session", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-review-screenshots-"));
  try {
    await assert.rejects(
      saveReviewScreenshot({ sessionId, projectSlug: "e2e-fixture", itemId: "too-wide", png: boundedPng(9_000, 100) }, { rootDir }),
      /dimensions exceed/i
    );
    for (let index = 1; index <= 5; index += 1) {
      await saveReviewScreenshot({
        sessionId,
        projectSlug: "e2e-fixture",
        itemId: `review-${index}`,
        png: boundedPng()
      }, { rootDir });
    }
    await assert.rejects(
      saveReviewScreenshot({ sessionId, projectSlug: "e2e-fixture", itemId: "review-6", png: boundedPng() }, { rootDir }),
      /maximum number/i
    );
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("expired Review Set screenshot sessions are removed without touching unrelated entries", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-review-screenshots-"));
  try {
    const result = await saveReviewScreenshot({
      sessionId,
      projectSlug: "e2e-fixture",
      itemId: "review-1",
      png: boundedPng()
    }, { rootDir });
    await cleanupExpiredReviewScreenshotSessions({ rootDir, now: Date.now() + REVIEW_SCREENSHOT_RETENTION_MS + 1_000 });
    await assert.rejects(stat(path.dirname(result.absolutePath)));
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("the screenshot route accepts only a bounded PNG with safe Review Set identity headers", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-review-route-"));
  const handler = createReviewScreenshotRouteHandler({ rootDir });
  const server = createServer((request, response) => {
    void handler(request.url || "", request, response);
  });
  server.listen({ host: "127.0.0.1", port: 0 });
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/inspection/screenshots`, {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
        "X-Canvas-Helper-Review-Session": sessionId,
        "X-Canvas-Helper-Project": "e2e-fixture",
        "X-Canvas-Helper-Review-Item": "review-route"
      },
      body: boundedPng()
    });
    const payload = await response.json() as { path?: string; byteLength?: number };
    assert.equal(response.status, 200);
    assert.equal(payload.path, `.runtime/studio-review-sets/${sessionId}/e2e-fixture-review-route.png`);
    assert.equal(payload.byteLength, 24);

    const rejected = await fetch(`http://127.0.0.1:${address.port}/api/inspection/screenshots`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "X-Canvas-Helper-Review-Session": sessionId,
        "X-Canvas-Helper-Project": "e2e-fixture",
        "X-Canvas-Helper-Review-Item": "review-route"
      },
      body: "not a png"
    });
    assert.equal(rejected.status, 400);
  } finally {
    server.close();
    await once(server, "close");
    await rm(rootDir, { recursive: true, force: true });
  }
});
