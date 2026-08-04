import assert from "node:assert/strict";
import type { IncomingMessage } from "node:http";
import { readFile, symlink } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { hasTrustedStudioMutationOrigin } from "../../app/server/lib/request-security.ts";
import { getPreviewPath } from "../../app/server/lib/preview-paths.ts";
import { startIsolatedPreviewServer } from "../../app/server/preview-server.ts";
import { isPreviewBridgeMessage } from "../../app/shared/preview-bridge.ts";
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
    assert.match(await bridgeResponse.text(), /var STUDIO_ORIGIN = "http:\/\/127\.0\.0\.1:4173"/);

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
});

test("screenshot annotation is local, opt-in, and stops capture tracks", async () => {
  const source = await readFile(path.join(repoRoot, "app/studio/src/hooks/useScreenshotAnnotation.ts"), "utf8");
  assert.match(source, /getDisplayMedia/);
  assert.match(source, /audio:\s*false/);
  assert.match(source, /expectedPreviewUrl/);
  assert.match(source, /displaySurface !== "browser"/);
  assert.match(source, /stream\?\.getTracks\(\)\.forEach\(\(track\) => track\.stop\(\)\)/);
  assert.match(source, /URL\.createObjectURL/);
  assert.doesNotMatch(source, /fetch\(|\/api\/|navigator\.clipboard|localStorage|sessionStorage/);
});
