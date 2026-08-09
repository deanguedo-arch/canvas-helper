import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import type { IncomingMessage } from "node:http";
import { readFile, symlink } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { hasTrustedStudioMutationOrigin } from "../../app/server/lib/request-security.ts";
import { getPreviewPath } from "../../app/server/lib/preview-paths.ts";
import { startIsolatedPreviewServer } from "../../app/server/preview-server.ts";
import { handleInspectionRoute } from "../../app/server/routes/inspection.ts";
import {
  createPreviewStandaloneBridgeBootstrap,
  isPreviewBridgeMessage,
  isPreviewStandaloneBridgeBootstrap
} from "../../app/shared/preview-bridge.ts";
import { ensureDir, removePath } from "../lib/fs.js";
import { getProjectPaths, repoRoot } from "../lib/paths.js";

function request(method: string, origin?: string) {
  return {
    method,
    headers: {
      host: "127.0.0.1:4173",
      ...(origin ? { origin } : {})
    }
  } as unknown as IncomingMessage;
}

test("Studio mutations require the exact Studio origin", () => {
  assert.equal(hasTrustedStudioMutationOrigin(request("POST", "http://127.0.0.1:4173")), true);
  assert.equal(hasTrustedStudioMutationOrigin(request("POST", "http://127.0.0.1:61104")), false);
  assert.equal(hasTrustedStudioMutationOrigin(request("POST")), false);
});

test("safe Studio reads do not require an Origin header", () => {
  assert.equal(hasTrustedStudioMutationOrigin(request("GET")), true);
});

test("preview paths reject encoded separators, traversal, and symlink escapes", async () => {
  await assert.rejects(
    getPreviewPath("workspace", "forensics35", "assets%2F..%2Findex.html"),
    /encoded separators/i
  );
  await assert.rejects(getPreviewPath("workspace", "forensics35", "../raw/original.html"), /safe relative/i);

  const slug = `preview-symlink-${Date.now()}`;
  const paths = getProjectPaths(slug);
  await removePath(paths.root);
  try {
    await ensureDir(paths.workspaceDir);
    await symlink(path.join(repoRoot, "package.json"), paths.workspaceEntrypoint);
    await assert.rejects(getPreviewPath("workspace", slug, "index.html"), /symlink outside/i);
  } finally {
    await removePath(paths.root);
  }
});

test("isolated preview pins the Studio origin and exposes no Studio API routes", async () => {
  const studioOrigin = "http://127.0.0.1:4173";
  const previewServer = await startIsolatedPreviewServer({ studioOrigin });
  try {
    const bridgeResponse = await fetch(`${previewServer.origin}/_canvas-helper/preview-bridge.js`);
    assert.equal(bridgeResponse.status, 200);
    assert.equal(bridgeResponse.headers.get("content-security-policy"), `frame-ancestors ${studioOrigin}`);
    assert.equal(bridgeResponse.headers.get("permissions-policy"), "display-capture=()");
    const bridgeSource = await bridgeResponse.text();
    assert.match(bridgeSource, /var STUDIO_ORIGIN = "http:\/\/127\.0\.0\.1:4173"/);
    assert.match(bridgeSource, /window\.top !== window/);
    assert.match(bridgeSource, /data-canvas-helper-preview-controls/);
    assert.match(bridgeSource, /data-canvas-helper-preview-inspect/);
    assert.match(bridgeSource, /studio-connect-standalone/);
    assert.match(bridgeSource, /canvas-helper-inspect-session/);
    assert.match(bridgeSource, /studioWindow\.postMessage/);
    assert.match(bridgeSource, /window\.opener = null/);
    assert.match(bridgeSource, /data-canvas-helper-return-to-studio/);
    assert.match(bridgeSource, /data-canvas-helper-preview-review-toggle/);
    assert.match(bridgeSource, /data-canvas-helper-preview-review-note/);
    assert.match(bridgeSource, /data-canvas-helper-preview-review-save/);
    assert.match(bridgeSource, /data-canvas-helper-preview-review-copy/);
    assert.match(bridgeSource, /send\("preview-return-to-studio", null\)/);
    assert.match(bridgeSource, /window\.close\(\)/);
    assert.match(bridgeSource, /if \(!event\.isTrusted\) return/);
    assert.match(bridgeSource, /window\.location\.replace\(STUDIO_ORIGIN\)/);
    assert.doesNotThrow(() => new Function(bridgeSource));

    const apiResponse = await fetch(`${previewServer.origin}/api/projects`);
    assert.equal(apiResponse.status, 404);
    assert.equal(apiResponse.headers.get("content-security-policy"), `frame-ancestors ${studioOrigin}`);
    assert.equal(apiResponse.headers.get("permissions-policy"), "display-capture=()");
  } finally {
    await previewServer.close();
  }
});

test("Studio bridge code posts to a port and never reads preview iframe DOM", async () => {
  const source = await readFile(path.join(repoRoot, "app/studio/src/hooks/usePreviewScrollSync.ts"), "utf8");
  assert.match(source, /new MessageChannel\(\)/);
  assert.match(source, /port\.postMessage/);
  assert.match(source, /studio-request-inspect-current/);
  assert.match(source, /requestCurrentInspectionSelection/);
  assert.match(source, /studio-focus-inspect-node/);
  assert.match(source, /focusPreviewInspectionSelection/);
  assert.match(source, /isPreviewStandaloneBridgeBootstrap/);
  assert.match(source, /standaloneSessionTokenRefs/);
  assert.match(source, /source === "standalone"/);
  assert.match(source, /event\.origin !== current\.previewOrigin/);
  assert.doesNotMatch(source, /window\.open/);
  assert.doesNotMatch(source, /postMessage\([^\n]+,\s*["']\*["']/);
  assert.doesNotMatch(source, /contentDocument/);
  assert.doesNotMatch(source, /contentWindow\?*\.document/);
});

test("the private bridge bounds the pre-capture geometry refresh protocol", () => {
  const selection = {
    nodeId: "ch1:1234567890abcdef12345678:1",
    visibleText: "Current element",
    tagName: "section",
    role: "",
    testId: "",
    geometry: { x: 0, y: 0, width: 100, height: 40 }
  };

  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-request-inspect-current",
      payload: { nodeId: selection.nodeId }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-inspect-mode",
      payload: { enabled: true }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-inspect-mode",
      payload: { enabled: "yes" }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-inspect-current",
      payload: selection
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-request-inspect-current",
      payload: { nodeId: "x".repeat(161) }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-focus-inspect-node",
      payload: { nodeId: selection.nodeId }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-diagnostic",
      payload: { kind: "asset-error", message: "img failed to load" }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-diagnostic",
      payload: { kind: "asset-error", message: "x".repeat(361) }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-review-action",
      payload: { action: "add", selection, teacherNote: "Make this clearer." }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-review-action",
      payload: { action: "remove", itemId: "" }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-return-to-studio",
      payload: null
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-return-to-studio",
      payload: { href: "http://example.com" }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-set-review-state",
      payload: {
        items: [{ id: "review-1", excerpt: "Current element", teacherNote: "Make this clearer." }],
        preparing: false,
        packetReady: true,
        status: "Review Set ready.",
        error: ""
      }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-set-review-packet",
      payload: { packet: "x".repeat(6_001) }
    }),
    false
  );
});

test("standalone preview bootstrap requires a bounded one-time session token", () => {
  const sessionToken = "12345678-1234-1234-1234-123456789abc";
  const bootstrap = createPreviewStandaloneBridgeBootstrap(sessionToken);
  assert.equal(isPreviewStandaloneBridgeBootstrap(bootstrap), true);
  assert.equal(
    isPreviewStandaloneBridgeBootstrap({
      ...bootstrap,
      payload: { sessionToken: "too-short" }
    }),
    false
  );
  assert.throws(() => createPreviewStandaloneBridgeBootstrap("not valid spaces"), /valid session token/i);
});

test("inspection failures never disclose absolute local paths", async () => {
  const server = createServer((request, response) => {
    void handleInspectionRoute(request.url || "", request, response);
  });
  server.listen({ host: "127.0.0.1", port: 0 });
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/inspection/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectSlug: "e2e-fixture",
        root: "workspace",
        htmlPath: "does-not-exist.html",
        selection: {
          nodeId: "ch1:aaaaaaaaaaaaaaaaaaaaaaaa:1",
          visibleText: "missing preview",
          tagName: "section",
          role: "",
          testId: "",
          geometry: { x: 0, y: 0, width: 1, height: 1 }
        }
      })
    });
    const payload = await response.json() as { error?: string };
    assert.equal(response.status, 400);
    assert.equal(payload.error, "Canvas Helper could not resolve this bounded inspection request.");
    assert.doesNotMatch(JSON.stringify(payload), new RegExp(repoRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("screenshot annotation is local, opt-in, and stops capture tracks", async () => {
  const source = await readFile(path.join(repoRoot, "app/studio/src/hooks/useScreenshotAnnotation.ts"), "utf8");
  assert.match(source, /getDisplayMedia/);
  assert.match(source, /audio:\s*false/);
  assert.match(source, /expectedPreviewUrl/);
  assert.match(source, /displaySurface !== "browser"/);
  assert.match(source, /activeCaptureRef/);
  assert.match(source, /activeCapture\.stream = availableStream/);
  assert.match(source, /const cancelCapture/);
  assert.match(source, /cancelCapture\(\);/);
  assert.match(source, /useEffect\(\s*\(\) => \(\) => \{\s*cancelCapture\(\);/);
  assert.match(source, /stopCaptureStream\(activeCapture\)/);
  assert.match(source, /URL\.createObjectURL/);
  assert.doesNotMatch(source, /fetch\(|\/api\/|navigator\.clipboard|localStorage|sessionStorage/);
});
