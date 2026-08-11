import assert from "node:assert/strict";
import { createSocket } from "node:dgram";
import { once } from "node:events";
import { createServer } from "node:http";
import { createServer as createTcpServer } from "node:net";
import { mkdtemp, readFile, rm, stat, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  cleanupExpiredReviewScreenshotSessions,
  deleteReviewScreenshots,
  readReviewScreenshot,
  REVIEW_SCREENSHOT_RETENTION_MS,
  saveReviewScreenshot,
  verifyReviewScreenshot
} from "../../app/server/lib/review-screenshots.ts";
import { captureMarkedPreviewPng } from "../../app/server/lib/preview-capture.ts";
import { decoratePreviewHtml } from "../../app/server/lib/preview-inspection.ts";
import { startIsolatedPreviewServer } from "../../app/server/preview-server.ts";
import { createReviewScreenshotRouteHandler } from "../../app/server/routes/review-screenshots.ts";
import { createPreviewCaptureRouteHandler } from "../../app/server/routes/preview-capture.ts";
import { repoRoot } from "../lib/paths.ts";

const sessionId = "12345678-1234-1234-1234-123456789abc";
const ownerNodeId = "ch1:1234567890abcdef12345678:1";

function boundedPng(width = 640, height = 480) {
  const png = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png, 0);
  png.writeUInt32BE(13, 8);
  Buffer.from("IHDR").copy(png, 12);
  png.writeUInt32BE(width, 16);
  png.writeUInt32BE(height, 20);
  return png;
}

async function withTemporaryCapturePage(
  html: string,
  run: (input: { previewOrigin: string; pageHref: string; nodeId: string }) => Promise<void>
) {
  const fileName = `capture-security-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.html`;
  const filePath = path.join(repoRoot, "projects", "e2e-fixture", "workspace", fileName);
  const decorated = decoratePreviewHtml(html);
  const targetTag = decorated?.html.match(/<h1[^>]*id="capture-target"[^>]*>/i)?.[0] ?? "";
  const nodeId = targetTag.match(/data-canvas-helper-inspect-node="([^"]+)"/i)?.[1] ?? "";
  assert.match(nodeId, /^ch1:[a-f0-9]{24}:[1-9][0-9]*$/);
  await writeFile(filePath, html, { encoding: "utf8", mode: 0o600 });
  const previewServer = await startIsolatedPreviewServer({ studioOrigin: "http://127.0.0.1:4173" });
  const capability = "12345678-1234-1234-1234-123456789abc";
  const pageHref = `${previewServer.origin}/_canvas-helper/p/${capability}/preview/workspace/e2e-fixture/${fileName}`;
  try {
    const bootstrap = await fetch(pageHref, { headers: { Referer: "http://127.0.0.1:4173/" } });
    assert.equal(bootstrap.status, 200);
    await bootstrap.arrayBuffer();
    await run({ previewOrigin: previewServer.origin, pageHref, nodeId });
  } finally {
    await previewServer.close();
    await rm(filePath, { force: true });
  }
}

test("course capture disables WebRTC before top-level and child-frame course code can send TURN UDP", async () => {
  const udp = createSocket("udp4");
  const tcp = createTcpServer((socket) => socket.destroy());
  let receivedPackets = 0;
  let receivedConnections = 0;
  udp.on("message", () => { receivedPackets += 1; });
  tcp.on("connection", () => { receivedConnections += 1; });
  udp.bind(0, "127.0.0.1");
  await once(udp, "listening");
  tcp.listen({ host: "127.0.0.1", port: 0 });
  await once(tcp, "listening");
  const udpAddress = udp.address();
  const tcpAddress = tcp.address();
  assert.ok(typeof udpAddress !== "string" && tcpAddress && typeof tcpAddress !== "string");
  const turnUrls = [
    `turn:127.0.0.1:${udpAddress.port}?transport=udp`,
    `turn:127.0.0.1:${tcpAddress.port}?transport=tcp`
  ];
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Capture network test</title></head>
<body>
  <h1 id="capture-target">Course capture target</h1>
  <script>
    window.__capturePeers = [];
    function attemptPeer(scope) {
      try {
        var Peer = scope.RTCPeerConnection || scope.webkitRTCPeerConnection;
        if (!Peer) return;
        var peer = new Peer({ iceServers: [{ urls: ${JSON.stringify(turnUrls)}, username: "visible-course-secret", credential: "capture-test" }], iceTransportPolicy: "relay" });
        peer.createDataChannel("capture");
        peer.createOffer().then(function(offer) { return peer.setLocalDescription(offer); }).catch(function() {});
        window.__capturePeers.push(peer);
      } catch (_) {}
    }
    attemptPeer(window);
    var frame = document.createElement("iframe");
    document.body.appendChild(frame);
    if (frame.contentWindow) attemptPeer(frame.contentWindow);
  </script>
</body></html>`;
  try {
    await withTemporaryCapturePage(html, async ({ previewOrigin, pageHref, nodeId }) => {
      const result = await captureMarkedPreviewPng({
        previewOrigin,
        projectSlug: "e2e-fixture",
        markerNumber: 1,
        selection: {
          nodeId,
          visibleText: "Course capture target",
          tagName: "h1",
          role: "",
          testId: "",
          geometry: { x: 8, y: 8, width: 320, height: 48 },
          viewport: { width: 640, height: 480 },
          scroll: { windowTop: 0, windowLeft: 0, containers: [] },
          pageHref
        }
      });
      assert.equal(result.png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      await new Promise((resolve) => setTimeout(resolve, 250));
      assert.equal(receivedPackets, 0);
      assert.equal(receivedConnections, 0);
    });
  } finally {
    udp.close();
    tcp.close();
  }
});

test("course capture skips blocked remote iframe error documents without stalling", async () => {
  const blockedFrames = Array.from(
    { length: 48 },
    (_, index) => `<iframe src="https://example.invalid/blocked-${index}" title="Blocked frame ${index}"></iframe>`
  ).join("");
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Blocked frame capture test</title></head>
<body>
  <h1 id="capture-target">Course capture target</h1>
  ${blockedFrames}
</body></html>`;
  await withTemporaryCapturePage(html, async ({ previewOrigin, pageHref, nodeId }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const result = await captureMarkedPreviewPng({
        previewOrigin,
        projectSlug: "e2e-fixture",
        markerNumber: 1,
        signal: controller.signal,
        selection: {
          nodeId,
          visibleText: "Course capture target",
          tagName: "h1",
          role: "",
          testId: "",
          geometry: { x: 8, y: 8, width: 320, height: 48 },
          viewport: { width: 640, height: 480 },
          scroll: { windowTop: 0, windowLeft: 0, containers: [] },
          pageHref
        }
      });
      assert.equal(result.png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    } finally {
      clearTimeout(timeout);
    }
  });
});

test("course capture rejects a same-path page whose query or hash state changes", async () => {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Capture state test</title></head>
<body>
  <h1 id="capture-target">Stateful capture target</h1>
  <script>history.replaceState(null, "", "?state=changed#other");</script>
</body></html>`;
  await withTemporaryCapturePage(html, async ({ previewOrigin, pageHref, nodeId }) => {
    await assert.rejects(
      captureMarkedPreviewPng({
        previewOrigin,
        projectSlug: "e2e-fixture",
        markerNumber: 1,
        selection: {
          nodeId,
          visibleText: "Stateful capture target",
          tagName: "h1",
          role: "",
          testId: "",
          geometry: { x: 8, y: 8, width: 320, height: 48 },
          viewport: { width: 640, height: 480 },
          scroll: { windowTop: 0, windowLeft: 0, containers: [] },
          pageHref: `${pageHref}?state=original#initial`
        }
      }),
      /bounded local capture page|changed pages/i
    );
  });
});

test("Review Set screenshot storage writes bounded PNGs to ignored repo-relative session paths", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-review-screenshots-"));
  try {
    const png = boundedPng();
    const result = await saveReviewScreenshot({
      sessionId,
      projectSlug: "e2e-fixture",
      itemId: "review-1",
      screenshotId: "shot-1",
      ownerNodeId,
      png
    }, { rootDir });

    assert.match(result.path, new RegExp(`^\\.runtime/studio-review-sets/${sessionId}/e2e-fixture-[a-f0-9]{32}-[a-f0-9]{16}\\.png$`));
    assert.equal(result.byteLength, png.length);
    assert.equal(result.width, 640);
    assert.equal(result.height, 480);
    assert.deepEqual(await readFile(result.absolutePath), png);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("Review Set screenshots are verified against their annotation owner and can be reclaimed", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-review-owner-"));
  try {
    const result = await saveReviewScreenshot({
      sessionId,
      projectSlug: "e2e-fixture",
      itemId: "review-owner-1",
      screenshotId: "shot-owner-1",
      ownerNodeId,
      png: boundedPng()
    }, { rootDir });
    const verified = await verifyReviewScreenshot({
      repoRelativePath: result.path,
      sessionId,
      projectSlug: "e2e-fixture",
      itemId: "review-owner-1",
      ownerNodeId
    }, { rootDir });
    assert.equal(verified.path, result.path);
    assert.equal(verified.width, 640);
    await assert.rejects(
      verifyReviewScreenshot({
        repoRelativePath: result.path,
        sessionId,
        projectSlug: "e2e-fixture",
        itemId: "review-owner",
        ownerNodeId
      }, { rootDir }),
      /does not belong/i
    );
    await assert.rejects(
      verifyReviewScreenshot({
        repoRelativePath: result.path,
        sessionId,
        projectSlug: "e2e-fixture",
        itemId: "review-owner-1",
        ownerNodeId: "ch1:different-owner:2"
      }, { rootDir }),
      /does not belong/i
    );
    await assert.rejects(deleteReviewScreenshots([{
      repoRelativePath: result.path,
      sessionId,
      projectSlug: "e2e-fixture",
      itemId: "review-owner",
      ownerNodeId
    }], { rootDir }), /does not belong/i);
    assert.deepEqual((await readReviewScreenshot(result.path, { rootDir })).png, boundedPng());
    await deleteReviewScreenshots([{
      repoRelativePath: result.path,
      sessionId,
      projectSlug: "e2e-fixture",
      itemId: "review-owner-1",
      ownerNodeId
    }], { rootDir });
    await assert.rejects(readReviewScreenshot(result.path, { rootDir }));
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("Review Set screenshot storage rejects invalid dimensions and more than fifteen files per session", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-review-screenshots-"));
  try {
    await assert.rejects(
      saveReviewScreenshot({ sessionId, projectSlug: "e2e-fixture", itemId: "too-wide", screenshotId: "shot-too-wide", ownerNodeId, png: boundedPng(9_000, 100) }, { rootDir }),
      /dimensions exceed/i
    );
    for (let index = 1; index <= 15; index += 1) {
      await saveReviewScreenshot({
        sessionId,
        projectSlug: "e2e-fixture",
        itemId: `review-${index}`,
        screenshotId: `shot-${index}`,
        ownerNodeId,
        png: boundedPng()
      }, { rootDir });
    }
    await assert.rejects(
      saveReviewScreenshot({ sessionId, projectSlug: "e2e-fixture", itemId: "review-16", screenshotId: "shot-16", ownerNodeId, png: boundedPng() }, { rootDir }),
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
      screenshotId: "shot-expired",
      ownerNodeId,
      png: boundedPng()
    }, { rootDir });
    await assert.rejects(
      readReviewScreenshot(result.path, { rootDir, now: Date.now() + REVIEW_SCREENSHOT_RETENTION_MS + 1_000 })
    );
    await cleanupExpiredReviewScreenshotSessions({ rootDir, now: Date.now() + REVIEW_SCREENSHOT_RETENTION_MS + 1_000 });
    await assert.rejects(stat(path.dirname(result.absolutePath)));
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("future-dated Review Set screenshot sessions are rejected and reclaimed", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-review-future-"));
  const now = Date.now();
  try {
    const result = await saveReviewScreenshot({
      sessionId,
      projectSlug: "e2e-fixture",
      itemId: "review-future",
      screenshotId: "shot-future",
      ownerNodeId,
      png: boundedPng()
    }, { rootDir, now });
    const future = new Date(now + 120_000);
    await utimes(result.absolutePath, future, future);
    await utimes(path.dirname(result.absolutePath), future, future);

    await cleanupExpiredReviewScreenshotSessions({ rootDir, now });
    await assert.rejects(stat(path.dirname(result.absolutePath)));
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("concurrent duplicate Review Set screenshot saves cannot overwrite one another", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-review-concurrent-"));
  try {
    const input = {
      sessionId,
      projectSlug: "e2e-fixture",
      itemId: "review-concurrent",
      screenshotId: "shot-concurrent",
      ownerNodeId,
      png: boundedPng()
    };
    const results = await Promise.allSettled([
      saveReviewScreenshot(input, { rootDir }),
      saveReviewScreenshot(input, { rootDir })
    ]);
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(results.filter((result) => result.status === "rejected").length, 1);
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
        "X-Canvas-Helper-Review-Item": "review-route",
        "X-Canvas-Helper-Review-Screenshot": "shot-route",
        "X-Canvas-Helper-Inspection-Node": ownerNodeId
      },
      body: boundedPng()
    });
    const payload = await response.json() as { path?: string; byteLength?: number };
    assert.equal(response.status, 200);
    assert.match(payload.path ?? "", new RegExp(`^\\.runtime/studio-review-sets/${sessionId}/e2e-fixture-[a-f0-9]{32}-[a-f0-9]{16}\\.png$`));
    assert.equal(payload.byteLength, 24);

    const restored = await fetch(
      `http://127.0.0.1:${address.port}/api/inspection/screenshots?${new URLSearchParams({
        path: payload.path ?? "",
        sessionId,
        projectSlug: "e2e-fixture",
        itemId: "review-route",
        ownerNodeId
      }).toString()}`
    );
    assert.equal(restored.status, 200);
    assert.equal(restored.headers.get("content-type"), "image/png");
    assert.deepEqual(Buffer.from(await restored.arrayBuffer()), boundedPng());
    assert.equal((await fetch(
      `http://127.0.0.1:${address.port}/api/inspection/screenshots?path=${encodeURIComponent(payload.path ?? "")}`
    )).status, 400);

    const verified = await fetch(`http://127.0.0.1:${address.port}/api/inspection/screenshots/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        projectSlug: "e2e-fixture",
        itemId: "review-route",
        ownerNodeId,
        paths: [payload.path]
      })
    });
    assert.equal(verified.status, 200);
    const verificationPayload = await verified.json() as { screenshots?: Array<{ path?: string }> };
    assert.equal(verificationPayload.screenshots?.[0]?.path, payload.path);

    const wrongOwner = await fetch(`http://127.0.0.1:${address.port}/api/inspection/screenshots/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        projectSlug: "e2e-fixture",
        itemId: "review-route",
        ownerNodeId: "ch1:wrong-owner:2",
        paths: [payload.path]
      })
    });
    assert.equal(wrongOwner.status, 400);

    const unboundDelete = await fetch(`http://127.0.0.1:${address.port}/api/inspection/screenshots`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: [payload.path] })
    });
    assert.equal(unboundDelete.status, 400);

    const rejected = await fetch(`http://127.0.0.1:${address.port}/api/inspection/screenshots`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "X-Canvas-Helper-Review-Session": sessionId,
        "X-Canvas-Helper-Project": "e2e-fixture",
        "X-Canvas-Helper-Review-Item": "review-route",
        "X-Canvas-Helper-Review-Screenshot": "shot-route-rejected",
        "X-Canvas-Helper-Inspection-Node": ownerNodeId
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

test("the preview capture route accepts only a bounded source-mapped workspace selection", async () => {
  const previewOrigin = "http://127.0.0.1:61234";
  let captureCalls = 0;
  const handler = createPreviewCaptureRouteHandler({
    previewOrigin,
    capture: async (input) => {
      captureCalls += 1;
      assert.equal(input.projectSlug, "e2e-fixture");
      assert.equal(input.markerNumber, 2);
      return { png: boundedPng(1280, 720), width: 1280, height: 720 };
    }
  });
  const server = createServer((request, response) => {
    void handler(request.url || "", request, response);
  });
  server.listen({ host: "127.0.0.1", port: 0 });
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/inspection/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectSlug: "e2e-fixture",
        markerNumber: 2,
        selection: {
          nodeId: "ch1:1234567890abcdef12345678:1",
          visibleText: "Fixture heading",
          tagName: "h1",
          role: "",
          testId: "",
          geometry: { x: 20, y: 30, width: 200, height: 60 },
          viewport: { width: 1280, height: 720 },
          scroll: { windowTop: 0, windowLeft: 0, containers: [] },
          pageHref: `${previewOrigin}/_canvas-helper/p/12345678-1234-1234-1234-123456789abc/preview/workspace/e2e-fixture/index.html`
        }
      })
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/png");
    assert.equal(captureCalls, 1);

    const rejected = await fetch(`http://127.0.0.1:${address.port}/api/inspection/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectSlug: "e2e-fixture", markerNumber: 8, selection: {} })
    });
    assert.equal(rejected.status, 400);
    assert.equal(captureCalls, 1);
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("the preview capture route permits only one headless capture at a time", async () => {
  const previewOrigin = "http://127.0.0.1:61234";
  const firstCaptureGate: { release?: () => void } = {};
  let firstStarted: (() => void) | null = null;
  const started = new Promise<void>((resolve) => { firstStarted = resolve; });
  const handler = createPreviewCaptureRouteHandler({
    previewOrigin,
    capture: async (input) => {
      assert.ok(input.signal);
      firstStarted?.();
      await new Promise<void>((resolve) => { firstCaptureGate.release = resolve; });
      return { png: boundedPng(1280, 720), width: 1280, height: 720 };
    }
  });
  const server = createServer((request, response) => {
    void handler(request.url || "", request, response);
  });
  server.listen({ host: "127.0.0.1", port: 0 });
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/api/inspection/capture`;
  const body = JSON.stringify({
    projectSlug: "e2e-fixture",
    markerNumber: 1,
    selection: {
      nodeId: ownerNodeId,
      visibleText: "Fixture heading",
      tagName: "h1",
      role: "",
      testId: "",
      geometry: { x: 20, y: 30, width: 200, height: 60 },
      viewport: { width: 1280, height: 720 },
      scroll: { windowTop: 0, windowLeft: 0, containers: [] },
      pageHref: `${previewOrigin}/_canvas-helper/p/12345678-1234-1234-1234-123456789abc/preview/workspace/e2e-fixture/index.html`
    }
  });
  try {
    const firstResponse = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    await started;
    const overlapping = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    assert.equal(overlapping.status, 429);
    firstCaptureGate.release?.();
    assert.equal((await firstResponse).status, 200);
  } finally {
    firstCaptureGate.release?.();
    server.close();
    await once(server, "close");
  }
});

test("the preview capture deadline releases the slot even when capture work ignores abort", async () => {
  const previewOrigin = "http://127.0.0.1:61234";
  let captureCalls = 0;
  const handler = createPreviewCaptureRouteHandler({
    previewOrigin,
    timeoutMs: 50,
    capture: async (input) => {
      captureCalls += 1;
      if (captureCalls > 1) {
        return { png: boundedPng(1280, 720), width: 1280, height: 720 };
      }
      assert.ok(input.signal);
      await new Promise<void>((resolve) => setTimeout(resolve, 220));
      return { png: boundedPng(1280, 720), width: 1280, height: 720 };
    }
  });
  const server = createServer((request, response) => {
    void handler(request.url || "", request, response);
  });
  server.listen({ host: "127.0.0.1", port: 0 });
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/api/inspection/capture`;
  const body = JSON.stringify({
    projectSlug: "e2e-fixture",
    markerNumber: 1,
    selection: {
      nodeId: ownerNodeId,
      visibleText: "Fixture heading",
      tagName: "h1",
      role: "",
      testId: "",
      geometry: { x: 20, y: 30, width: 200, height: 60 },
      viewport: { width: 1280, height: 720 },
      scroll: { windowTop: 0, windowLeft: 0, containers: [] },
      pageHref: `${previewOrigin}/_canvas-helper/p/12345678-1234-1234-1234-123456789abc/preview/workspace/e2e-fixture/index.html`
    }
  });
  try {
    const startedAt = Date.now();
    const timedOut = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    assert.equal(timedOut.status, 408);
    assert.ok(Date.now() - startedAt < 200, "the route must return before non-cooperative capture work finishes");
    const next = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    assert.equal(next.status, 200);
    assert.equal(captureCalls, 2);
  } finally {
    server.close();
    await once(server, "close");
  }
});
