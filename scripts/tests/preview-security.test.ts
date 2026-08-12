import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFile, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { hasTrustedStudioMutationOrigin } from "../../app/server/lib/request-security.ts";
import { getPreviewPath } from "../../app/server/lib/preview-paths.ts";
import {
  buildPreviewRuntimeRelayUrl,
  handlePreviewRuntimeRelay,
  normalizePreviewRuntimeSource,
  parsePreviewRuntimeRelayPath,
  rewritePreviewHtmlRuntimeScripts,
  rewritePreviewRuntimeJavaScript
} from "../../app/server/lib/preview-runtime-relay.ts";
import { startIsolatedPreviewServer } from "../../app/server/preview-server.ts";
import { hasTrustedStandalonePreviewNavigation } from "../../app/server/studio-server.ts";
import { handleInspectionRoute } from "../../app/server/routes/inspection.ts";
import {
  clearStoredReviewSet,
  loadStoredReviewSet,
  saveStoredReviewSet
} from "../../app/studio/src/lib/review-set-storage.ts";
import {
  loadPreviewLayoutPreferences,
  savePreviewLayoutPreferences
} from "../../app/studio/src/lib/storage.ts";
import { preserveVisualSelection, runWithCurrentPreviewSelection } from "../../app/studio/src/lib/current-preview-selection.ts";
import {
  createPreviewStandaloneBridgeBootstrap,
  createPreviewStandaloneHostBridgeBootstrap,
  createPreviewStandaloneHostRejoin,
  isPreviewBridgeMessage,
  isPreviewStandaloneBridgeBootstrap,
  isPreviewStandaloneHostBridgeBootstrap,
  isPreviewStandaloneHostRejoin
} from "../../app/shared/preview-bridge.ts";
import {
  normalizePreviewPageIdentity,
  normalizePreviewPageRouteIdentity,
  rebasePreviewPageHref
} from "../../app/shared/preview-path.ts";
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

function relayResponse() {
  const headers = new Map<string, string>();
  let body = Buffer.alloc(0);
  let ended = false;
  const response = {
    statusCode: 200,
    setHeader(name: string, value: string | number | readonly string[]) {
      headers.set(name.toLowerCase(), Array.isArray(value) ? value.join(", ") : String(value));
    },
    end(value?: string | Buffer) {
      body = value === undefined ? Buffer.alloc(0) : Buffer.from(value);
      ended = true;
    }
  } as unknown as ServerResponse;
  return {
    response,
    headers,
    body: () => body,
    ended: () => ended
  };
}

test("Studio mutations require the exact Studio origin", () => {
  assert.equal(hasTrustedStudioMutationOrigin(request("POST", "http://127.0.0.1:4173")), true);
  assert.equal(hasTrustedStudioMutationOrigin(request("POST", "http://127.0.0.1:61104")), false);
  assert.equal(hasTrustedStudioMutationOrigin(request("POST")), false);
});

test("safe Studio reads do not require an Origin header", () => {
  assert.equal(hasTrustedStudioMutationOrigin(request("GET")), true);
});

test("standalone preview host navigation requires same-origin fetch metadata or the exact Studio referrer", () => {
  const studioOrigin = "http://127.0.0.1:4173";
  const withHeaders = (headers: Record<string, string> = {}) => ({ headers }) as unknown as IncomingMessage;
  const withReferer = (referer?: string) => withHeaders(referer ? { referer } : {});
  assert.equal(hasTrustedStandalonePreviewNavigation(withReferer(`${studioOrigin}/?e2e=1`), studioOrigin), true);
  assert.equal(hasTrustedStandalonePreviewNavigation(withHeaders({
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "navigate",
    "sec-fetch-dest": "document"
  }), studioOrigin), true);
  assert.equal(hasTrustedStandalonePreviewNavigation(withHeaders({
    "sec-fetch-site": "same-site",
    "sec-fetch-mode": "navigate",
    "sec-fetch-dest": "document"
  }), studioOrigin), false);
  assert.equal(hasTrustedStandalonePreviewNavigation(withReferer("http://127.0.0.1:61234/preview/workspace/course/index.html"), studioOrigin), false);
  assert.equal(hasTrustedStandalonePreviewNavigation(withReferer(), studioOrigin), false);
});

test("preview page identity preserves course query and hash state while stripping only transient controls", () => {
  const oldCapability = "12345678-1234-1234-1234-123456789abc";
  const newCapability = "abcdef12-1234-1234-1234-123456789abc";
  const original = `http://127.0.0.1:61234/_canvas-helper/p/${oldCapability}/preview/workspace/e2e-fixture/index.html?rev=4&lesson=one&canvas-helper-capture=1#part-a`;
  const changedQuery = original.replace("lesson=one", "lesson=two");
  const changedHash = original.replace("#part-a", "#part-b");
  assert.notEqual(normalizePreviewPageIdentity(original), normalizePreviewPageIdentity(changedQuery));
  assert.notEqual(normalizePreviewPageIdentity(original), normalizePreviewPageIdentity(changedHash));
  assert.equal(normalizePreviewPageIdentity(original)?.includes("canvas-helper-capture"), false);
  assert.equal(
    normalizePreviewPageRouteIdentity(original),
    "project:workspace:e2e-fixture\u001f/preview/workspace/e2e-fixture/index.html?rev=4&lesson=one#part-a"
  );
  assert.equal(
    rebasePreviewPageHref(
      original,
      `http://127.0.0.1:62345/_canvas-helper/p/${newCapability}/preview/workspace/e2e-fixture/index.html?rev=9`
    ),
    `http://127.0.0.1:62345/_canvas-helper/p/${newCapability}/preview/workspace/e2e-fixture/index.html?rev=4&lesson=one#part-a`
  );
  assert.equal(
    rebasePreviewPageHref(
      original,
      `http://127.0.0.1:62345/_canvas-helper/p/${newCapability}/preview/workspace/another-project/index.html`
    ),
    null
  );
});

test("Full Preview review state preserves screenshot ownership after an annotation is relinked", () => {
  const reviewState = {
    sessionId: "12345678-1234-1234-1234-123456789abc",
    items: [{
      id: "review-1",
      projectSlug: "e2e-fixture",
      nodeId: "ch1:new-selection:2",
      excerpt: "Relinked target",
      teacherNote: "Keep the original evidence.",
      handoffState: "draft",
      screenshots: [{
        id: "screenshot-1",
        filePath: ".runtime/studio-review-sets/12345678-1234-1234-1234-123456789abc/review-1-screenshot-1.png",
        ownerNodeId: "ch1:original-selection:1"
      }]
    }],
    draftScreenshotCount: 0,
    captureItemId: "",
    saving: false,
    copying: false,
    preparing: false,
    packetReady: true,
    status: "",
    error: "",
    undoLabel: ""
  };
  assert.equal(isPreviewBridgeMessage({
    protocol: "canvas-helper.preview",
    version: 1,
    type: "studio-set-review-state",
    payload: reviewState
  }), true);
  assert.equal(isPreviewBridgeMessage({
    protocol: "canvas-helper.preview",
    version: 1,
    type: "studio-set-review-state",
    payload: {
      ...reviewState,
      items: [{ ...reviewState.items[0], screenshots: [{ ...reviewState.items[0].screenshots[0], ownerNodeId: "" }] }]
    }
  }), false);
});

test("Studio can explicitly release a timed-out Full Preview copy transaction", () => {
  assert.equal(isPreviewBridgeMessage({
    protocol: "canvas-helper.preview",
    version: 1,
    type: "studio-cancel-review-copy",
    payload: {
      copyId: "copy-1234567890",
      message: "The Review Set copy timed out. Nothing was marked sent; try copying again."
    }
  }), true);
  assert.equal(isPreviewBridgeMessage({
    protocol: "canvas-helper.preview",
    version: 1,
    type: "studio-cancel-review-copy",
    payload: { copyId: "", message: "invalid" }
  }), false);
});

test("Full Preview course edit messages are bounded and never accept filesystem paths", () => {
  const base = {
    protocol: "canvas-helper.preview",
    version: 1
  } as const;
  assert.equal(isPreviewBridgeMessage({
    ...base,
    type: "preview-edit-action",
    payload: { action: "set-mode", enabled: false, nextMode: "annotate", requestId: "edit-1" }
  }), true);
  assert.equal(isPreviewBridgeMessage({
    ...base,
    type: "preview-edit-action",
    payload: { action: "save-target", targetId: "a".repeat(24), patch: { html: "Safe <strong>text</strong>" }, filesystemPath: "/tmp/escape" }
  }), false);
  assert.equal(isPreviewBridgeMessage({
    ...base,
    type: "preview-edit-action",
    payload: { action: "update-draft", draftId: "draft-1", patch: { html: "x".repeat(24_001) } }
  }), false);
  assert.equal(isPreviewBridgeMessage({
    ...base,
    type: "studio-refresh-preview",
    payload: { href: `http://127.0.0.1:61234/_canvas-helper/p/12345678-1234-1234-1234-123456789abc/preview/workspace/e2e-fixture/index.html?rev=2` }
  }), true);
  assert.equal(isPreviewBridgeMessage({
    ...base,
    type: "studio-refresh-preview",
    payload: { href: "file:///tmp/escape", path: "/tmp/escape" }
  }), false);
});

test("preview runtime compatibility relays only approved course CDN scripts through the scoped origin", () => {
  const capability = "12345678-1234-1234-1234-123456789abc";
  const publicPrefix = `/_canvas-helper/p/${capability}`;
  const tailwind = "https://cdn.tailwindcss.com/?plugins=forms";
  const relay = buildPreviewRuntimeRelayUrl(publicPrefix, tailwind);
  assert.equal(
    relay,
    `${publicPrefix}/runtime?source=${encodeURIComponent("https://cdn.tailwindcss.com/3.4.17?plugins=forms")}`
  );
  assert.deepEqual(parsePreviewRuntimeRelayPath(`${publicPrefix}/runtime`), { token: capability, publicPrefix });
  assert.equal(parsePreviewRuntimeRelayPath(`${publicPrefix}/preview/workspace/course/index.html`), null);
  assert.equal(normalizePreviewRuntimeSource("http://cdn.tailwindcss.com"), null);
  assert.equal(normalizePreviewRuntimeSource("https://example.com/runtime.js"), null);
  assert.equal(normalizePreviewRuntimeSource("https://user@unpkg.com/react.js"), null);
  assert.equal(normalizePreviewRuntimeSource("https://unpkg.com/unapproved-package@1.0.0/index.js"), null);
  assert.equal(normalizePreviewRuntimeSource("https://cdn.jsdelivr.net/npm/unapproved-package@1.0.0/index.js"), null);
  assert.equal(normalizePreviewRuntimeSource("https://esm.sh/unapproved-package@1.0.0"), null);
  assert.equal(normalizePreviewRuntimeSource("https://esm.sh/react@19.1.1?token=course-data"), null);
  assert.equal(normalizePreviewRuntimeSource("https://cdn.tailwindcss.com?plugins=forms&token=course-data"), null);
  assert.equal(
    normalizePreviewRuntimeSource("https://unpkg.com/@babel/standalone/babel.min.js"),
    "https://unpkg.com/@babel/standalone@7.28.5/babel.min.js"
  );
  assert.equal(
    normalizePreviewRuntimeSource("https://unpkg.com/lucide@latest"),
    "https://unpkg.com/lucide@0.542.0/dist/umd/lucide.js"
  );
  assert.equal(
    normalizePreviewRuntimeSource("https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"),
    "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"
  );
  assert.equal(
    normalizePreviewRuntimeSource("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"),
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
  );
  assert.equal(
    normalizePreviewRuntimeSource("https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"),
    "https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"
  );

  const html = rewritePreviewHtmlRuntimeScripts(
    `<script src="https://cdn.tailwindcss.com"></script><script src="https://example.com/course.js"></script><script>const opaqueMarkup = '<iframe src="/preview/workspace/course/data.html">';</script><iframe src="/preview/references/raw/course/content/quiz.html"></iframe>`,
    publicPrefix
  );
  assert.match(html, new RegExp(`${publicPrefix.replaceAll("/", "\\/")}\\/runtime\\?source=`));
  assert.doesNotMatch(html, /src="https:\/\/cdn\.tailwindcss\.com"/);
  assert.match(html, /src="https:\/\/example\.com\/course\.js"/);
  assert.match(html, new RegExp(`src="${publicPrefix.replaceAll("/", "\\/")}\/preview\/references\/raw\/course\/content\/quiz\.html"`));
  assert.match(html, /opaqueMarkup = '<iframe src="\/preview\/workspace\/course\/data\.html">'/);

  const localModule = rewritePreviewRuntimeJavaScript(
    `const documentation = "https://esm.sh/react@19.1.1";\nconst opaqueRoute = "/preview/workspace/course/data.html";\nimport React from "https://esm.sh/react@19.1.1";\nworker.src = "https://esm.sh/pdfjs-dist@4.10.38/legacy/build/pdf.worker.mjs";\nfunction referenceUrl() { return \`/preview/references/raw/\${slug}/\${path}\`; }`,
    publicPrefix
  );
  assert.doesNotMatch(localModule, /from "https:\/\/esm\.sh/);
  assert.doesNotMatch(localModule, /src = "https:\/\/esm\.sh/);
  assert.match(localModule, /documentation = "https:\/\/esm\.sh\/react@19\.1\.1"/);
  assert.match(localModule, /opaqueRoute = "\/preview\/workspace\/course\/data\.html"/);
  assert.match(localModule, /\/runtime\?source=/);
  assert.match(localModule, new RegExp(`${publicPrefix.replaceAll("/", "\\/")}\/preview\/references\/raw\/`));

  const oversizedLocalJavaScript = `function route() { return "/preview/workspace/course/index.html"; }/*${"x".repeat(520 * 1024)}*/`;
  assert.equal(
    rewritePreviewRuntimeJavaScript(oversizedLocalJavaScript, publicPrefix),
    oversizedLocalJavaScript
  );

  const registeredInlineSources = new Set<string>();
  const inlineModule = rewritePreviewHtmlRuntimeScripts(
    `<script type="module">import React from "https://esm.sh/react@19.1.1"; const label = "https://esm.sh/react@19.1.1";</script>`,
    publicPrefix,
    (source) => {
      registeredInlineSources.add(source);
      return true;
    }
  );
  assert.doesNotMatch(inlineModule, /from "https:\/\/esm\.sh/);
  assert.match(inlineModule, /label = "https:\/\/esm\.sh\/react@19\.1\.1"/);
  assert.deepEqual([...registeredInlineSources], ["https://esm.sh/react@19.1.1"]);

  const relayedModule = rewritePreviewRuntimeJavaScript(
    `import "/node/process.mjs";\nimport "/scheduler@^0.26.0?target=es2022";\nimport helper from "./react-dom.mjs";\nexport * from "/react@19.1.1/es2022/react.mjs";`,
    publicPrefix,
    "https://esm.sh/react-dom@19.1.1/es2022/client.mjs"
  );
  assert.doesNotMatch(relayedModule, /from "\/react@/);
  assert.doesNotMatch(relayedModule, /import "\/node/);
  assert.doesNotMatch(relayedModule, /import "\/scheduler@/);
  assert.doesNotMatch(relayedModule, /from "\.\/react-dom\.mjs"/);
  assert.match(relayedModule, /\/runtime\?source=/);
});

test("preview runtime relay binds declared sources, emits JavaScript only, and keeps HEAD cache-only", async () => {
  const originalFetch = globalThis.fetch;
  const capability = "77777777-1234-1234-1234-123456789abc";
  const publicPrefix = `/_canvas-helper/p/${capability}`;
  const source = normalizePreviewRuntimeSource("https://esm.sh/react-dom@19.1.1/client");
  assert.ok(source);
  const discovered = new Set<string>();
  let fetchCount = 0;
  try {
    globalThis.fetch = (async (_input, init) => {
      fetchCount += 1;
      assert.equal(init?.credentials, "omit");
      return new Response(
        `import "/scheduler@^0.26.0?target=es2022";\nimport helper from "./react-dom.mjs";`,
        { status: 200, headers: { "Content-Type": "application/javascript; charset=utf-8" } }
      );
    }) as typeof fetch;

    const result = relayResponse();
    await handlePreviewRuntimeRelay(
      { method: "GET", url: `${publicPrefix}/runtime?source=${encodeURIComponent(source)}` } as IncomingMessage,
      result.response,
      publicPrefix,
      new Set([source]),
      (runtimeSource) => {
        discovered.add(runtimeSource);
        return true;
      }
    );
    assert.equal(result.ended(), true);
    assert.equal(result.response.statusCode, 200);
    assert.equal(result.headers.get("content-type"), "text/javascript; charset=utf-8");
    assert.equal(result.headers.get("x-canvas-helper-preview-runtime"), "relayed");
    assert.match(result.body().toString("utf8"), /\/runtime\?source=/);
    assert.equal(fetchCount, 1);
    assert.ok([...discovered].some((value) => value.includes("scheduler")));
    assert.ok([...discovered].some((value) => value.includes("react-dom.mjs")));

    let headRegistrations = 0;
    const head = relayResponse();
    await handlePreviewRuntimeRelay(
      { method: "HEAD", url: `${publicPrefix}/runtime?source=${encodeURIComponent(source)}` } as IncomingMessage,
      head.response,
      publicPrefix,
      new Set([source]),
      () => {
        headRegistrations += 1;
        return true;
      }
    );
    assert.equal(head.response.statusCode, 200);
    assert.equal(head.body().length, 0);
    assert.equal(headRegistrations, 0);
    assert.equal(fetchCount, 1);

    const secondCapabilityPrefix = "/_canvas-helper/p/66666666-1234-1234-1234-123456789abc";
    const secondCapabilityResult = relayResponse();
    await handlePreviewRuntimeRelay(
      { method: "GET", url: `${secondCapabilityPrefix}/runtime?source=${encodeURIComponent(source)}` } as IncomingMessage,
      secondCapabilityResult.response,
      secondCapabilityPrefix,
      new Set([source]),
      () => true
    );
    const secondCapabilityBody = secondCapabilityResult.body().toString("utf8");
    assert.equal(secondCapabilityResult.response.statusCode, 200);
    assert.match(secondCapabilityBody, new RegExp(secondCapabilityPrefix.replaceAll("/", "\\/")));
    assert.doesNotMatch(secondCapabilityBody, new RegExp(publicPrefix.replaceAll("/", "\\/")));
    assert.equal(fetchCount, 1);

    const denied = relayResponse();
    const jquery = normalizePreviewRuntimeSource("https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js");
    assert.ok(jquery);
    await handlePreviewRuntimeRelay(
      { method: "GET", url: `${publicPrefix}/runtime?source=${encodeURIComponent(jquery)}` } as IncomingMessage,
      denied.response,
      publicPrefix,
      new Set([source]),
      () => true
    );
    assert.equal(denied.response.statusCode, 403);
    assert.equal(fetchCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("preview runtime relay rejects non-JavaScript MIME types and caps concurrent cold fetches", async () => {
  const originalFetch = globalThis.fetch;
  const capability = "88888888-1234-1234-1234-123456789abc";
  const publicPrefix = `/_canvas-helper/p/${capability}`;
  const htmlSource = normalizePreviewRuntimeSource("https://cdn.tailwindcss.com");
  assert.ok(htmlSource);
  let cancelled = false;
  try {
    globalThis.fetch = (async () => ({
      ok: true,
      status: 200,
      url: htmlSource,
      headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
      body: { cancel: async () => { cancelled = true; } }
    }) as unknown as Response) as typeof fetch;
    const htmlResult = relayResponse();
    await handlePreviewRuntimeRelay(
      { method: "GET", url: `${publicPrefix}/runtime?source=${encodeURIComponent(htmlSource)}` } as IncomingMessage,
      htmlResult.response,
      publicPrefix,
      new Set([htmlSource]),
      () => true
    );
    assert.equal(htmlResult.response.statusCode, 502);
    assert.equal(cancelled, true);
    assert.doesNotMatch(htmlResult.body().toString("utf8"), /<script/i);

    const coldSources = [
      "https://unpkg.com/@babel/standalone/babel.min.js",
      "https://unpkg.com/lucide@latest",
      "https://unpkg.com/react@18/umd/react.development.js",
      "https://unpkg.com/react@18/umd/react.production.min.js",
      "https://unpkg.com/react-dom@18/umd/react-dom.development.js",
      "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
      "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js",
      "https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
    ].map((value) => normalizePreviewRuntimeSource(value));
    assert.equal(coldSources.every(Boolean), true);
    const pendingResolvers: Array<(response: Response) => void> = [];
    globalThis.fetch = (() => new Promise<Response>((resolve) => pendingResolvers.push(resolve))) as typeof fetch;
    const pendingResults = coldSources.slice(0, 8).map((runtimeSource) => {
      const source = runtimeSource as string;
      const result = relayResponse();
      const pending = handlePreviewRuntimeRelay(
        { method: "GET", url: `${publicPrefix}/runtime?source=${encodeURIComponent(source)}` } as IncomingMessage,
        result.response,
        publicPrefix,
        new Set([source]),
        () => true
      );
      return { pending, result };
    });
    assert.equal(pendingResolvers.length, 8);

    const overflowSource = coldSources[8] as string;
    const overflow = relayResponse();
    await handlePreviewRuntimeRelay(
      { method: "GET", url: `${publicPrefix}/runtime?source=${encodeURIComponent(overflowSource)}` } as IncomingMessage,
      overflow.response,
      publicPrefix,
      new Set([overflowSource]),
      () => true
    );
    assert.equal(overflow.response.statusCode, 502);

    for (const resolve of pendingResolvers) {
      resolve(new Response("/* approved runtime */", {
        status: 200,
        headers: { "Content-Type": "text/javascript; charset=utf-8" }
      }));
    }
    await Promise.all(pendingResults.map(({ pending }) => pending));
    assert.equal(pendingResults.every(({ result }) => result.response.statusCode === 200), true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("full-preview draft capture never runs after the refreshed SPA route changes", async () => {
  const capability = "12345678-1234-1234-1234-123456789abc";
  const baseSelection = {
    nodeId: "ch1:1234567890abcdef12345678:1",
    visibleText: "Course heading",
    tagName: "h1",
    role: "",
    testId: "",
    geometry: { x: 0, y: 0, width: 200, height: 40 },
    viewport: { width: 1280, height: 720 },
    scroll: { windowTop: 0, windowLeft: 0, containers: [] },
    pageHref: `http://127.0.0.1:61234/_canvas-helper/p/${capability}/preview/workspace/e2e-fixture/index.html?lesson=one#part-a`
  };
  let captureCalls = 0;
  await assert.rejects(
    runWithCurrentPreviewSelection({
      expected: baseSelection,
      requestCurrent: async () => ({
        ...baseSelection,
        pageHref: baseSelection.pageHref.replace("lesson=one#part-a", "lesson=two#part-b")
      }),
      run: async () => {
        captureCalls += 1;
        return true;
      },
      changedMessage: "The course page changed."
    }),
    /course page changed/i
  );
  assert.equal(captureCalls, 0);
  const appSource = await readFile(path.join(repoRoot, "app/studio/src/App.tsx"), "utf8");
  assert.match(
    appSource,
    /action\.action === "capture-draft"[\s\S]{0,2400}prepareSelection:[\s\S]{0,800}requestCurrentInspectionSelection[\s\S]{0,800}hasSamePreviewPageRoute[\s\S]{0,800}preserveVisualSelection/
  );
});

test("current-selection refresh keeps a teacher-drawn area while accepting current page state", () => {
  const expected = {
    nodeId: "ch1:1234567890abcdef12345678:1",
    selectionKind: "area" as const,
    visibleText: "Course heading",
    tagName: "h1",
    role: "",
    testId: "",
    geometry: { x: 20, y: 30, width: 160, height: 70 },
    viewport: { width: 1280, height: 720 },
    scroll: { windowTop: 0, windowLeft: 0, containers: [] },
    pageHref: "http://127.0.0.1:61234/preview/workspace/e2e-fixture/index.html"
  };
  const current = {
    ...expected,
    selectionKind: "element" as const,
    geometry: { x: 10, y: 10, width: 400, height: 120 },
    scroll: { windowTop: 80, windowLeft: 0, containers: [] }
  };
  const preserved = preserveVisualSelection(expected, current);
  assert.equal(preserved.selectionKind, "area");
  assert.deepEqual(preserved.geometry, expected.geometry);
  assert.deepEqual(preserved.scroll, current.scroll);
});

test("blocked browser storage never crashes Review Set load, save, or clear", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const deniedStorage = {
    getItem() { throw new Error("storage denied"); },
    setItem() { throw new Error("storage denied"); },
    removeItem() { throw new Error("storage denied"); }
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: deniedStorage }
  });
  try {
    const loaded = loadStoredReviewSet();
    assert.deepEqual(loaded?.items, []);
    assert.match(loaded?.persistenceError ?? "", /browser storage/i);
    assert.equal(saveStoredReviewSet(
      "e2e-fixture",
      "87654321-4321-4321-8321-210987654321",
      "Review 1",
      "12345678-1234-1234-1234-123456789abc",
      []
    ), false);
    assert.equal(clearStoredReviewSet(), false);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("Studio layout preferences remain separate per project and tolerate blocked storage", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const values = new Map<string, string>();
  const localStorage = {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
    removeItem(key: string) { values.delete(key); }
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage }
  });
  try {
    const alpha = {
      ...loadPreviewLayoutPreferences("alpha"),
      compareMode: true,
      inspectorOpen: true,
      devices: { reference: "mobile" as const, workspace: "tablet" as const },
      zooms: { reference: 75, workspace: 125 }
    };
    const beta = {
      ...loadPreviewLayoutPreferences("beta"),
      compareMode: false,
      inspectorOpen: false,
      devices: { reference: "tablet" as const, workspace: "mobile" as const },
      zooms: { reference: 90, workspace: 80 }
    };
    savePreviewLayoutPreferences(alpha, "alpha");
    savePreviewLayoutPreferences(beta, "beta");
    assert.deepEqual(loadPreviewLayoutPreferences("alpha"), alpha);
    assert.deepEqual(loadPreviewLayoutPreferences("beta"), beta);
    assert.equal(loadPreviewLayoutPreferences("gamma").compareMode, false);

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem() { throw new Error("storage denied"); },
          setItem() { throw new Error("storage denied"); },
          removeItem() { throw new Error("storage denied"); }
        }
      }
    });
    assert.doesNotThrow(() => savePreviewLayoutPreferences(alpha, "alpha"));
    assert.equal(loadPreviewLayoutPreferences("alpha").compareMode, false);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
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
  const oversizedFixturePath = path.join(
    getProjectPaths("e2e-fixture").workspaceDir,
    "oversized-preview-test.js"
  );
  try {
    const oversizedFixtureSource = `function route() { return "/preview/workspace/e2e-fixture/index.html"; }/*${"x".repeat(520 * 1024)}*/`;
    await writeFile(oversizedFixturePath, oversizedFixtureSource, "utf8");

    const bridgeResponse = await fetch(`${previewServer.origin}/_canvas-helper/preview-bridge.js`);
    assert.equal(bridgeResponse.status, 200);
    const contentSecurityPolicy = bridgeResponse.headers.get("content-security-policy") ?? "";
    assert.match(contentSecurityPolicy, new RegExp(`frame-ancestors 'self' ${studioOrigin.replaceAll(".", "\\.")}`));
    assert.match(contentSecurityPolicy, /connect-src 'self'/);
    assert.match(contentSecurityPolicy, /font-src 'self' data: https:/);
    assert.match(contentSecurityPolicy, /frame-src 'self' https:/);
    assert.match(contentSecurityPolicy, /img-src 'self' data: blob: https:/);
    assert.match(contentSecurityPolicy, /media-src 'self' data: blob: https:/);
    assert.match(contentSecurityPolicy, /style-src 'self' 'unsafe-inline' https:/);
    assert.doesNotMatch(contentSecurityPolicy, /script-src[^;]*https:/);
    assert.doesNotMatch(contentSecurityPolicy, /connect-src[^;]*https:/);
    assert.match(contentSecurityPolicy, /form-action 'none'/);
    assert.match(contentSecurityPolicy, /object-src 'none'/);
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
    assert.match(bridgeSource, /data-canvas-helper-preview-review-undo/);
    assert.match(bridgeSource, /latestReviewActionId/);
    assert.match(bridgeSource, /requestId !== latestReviewActionId/);
    assert.match(bridgeSource, /send\("preview-return-to-studio", null\)/);
    assert.match(bridgeSource, /window\.close\(\)/);
    assert.match(bridgeSource, /if \(!event\.isTrusted\) return/);
    assert.match(bridgeSource, /window\.location\.replace\(STUDIO_ORIGIN\)/);
    assert.doesNotThrow(() => new Function(bridgeSource));

    const apiResponse = await fetch(`${previewServer.origin}/api/projects`);
    assert.equal(apiResponse.status, 404);
    assert.equal(apiResponse.headers.get("content-security-policy"), contentSecurityPolicy);
    assert.equal(apiResponse.headers.get("permissions-policy"), "display-capture=()");

    const capability = "12345678-1234-1234-1234-123456789abc";
    const authorizedPath = `/_canvas-helper/p/${capability}/preview/workspace/e2e-fixture/index.html`;
    const authorized = await fetch(`${previewServer.origin}${authorizedPath}`, {
      headers: { Referer: `${studioOrigin}/` }
    });
    assert.equal(authorized.status, 200);
    assert.match(await authorized.text(), /E2E Fixture Workspace/);

    const oversizedFixture = await fetch(
      `${previewServer.origin}/_canvas-helper/p/${capability}/preview/workspace/e2e-fixture/oversized-preview-test.js`
    );
    assert.equal(oversizedFixture.status, 200);
    assert.equal(await oversizedFixture.text(), oversizedFixtureSource);

    const calmCapability = "fedcba98-1234-1234-1234-123456789abc";
    const calmPublicPrefix = `/_canvas-helper/p/${calmCapability}`;
    const calmPreview = await fetch(
      `${previewServer.origin}${calmPublicPrefix}/preview/workspace/calm-module/index.html`,
      { headers: { Referer: `${studioOrigin}/` } }
    );
    assert.equal(calmPreview.status, 200);
    const calmHtml = await calmPreview.text();
    assert.match(calmHtml, new RegExp(`${calmPublicPrefix.replaceAll("/", "\\/")}\\/runtime\\?source=`));
    assert.doesNotMatch(calmHtml, /src="https:\/\/cdn\.tailwindcss\.com"/);

    const generalPsychCapability = "abcdef98-1234-1234-1234-123456789abc";
    const generalPsychPublicPrefix = `/_canvas-helper/p/${generalPsychCapability}`;
    const generalPsychPreview = await fetch(
      `${previewServer.origin}${generalPsychPublicPrefix}/preview/workspace/general-psychology-20-independent-studies-202633108/index.html`,
      { headers: { Referer: `${studioOrigin}/` } }
    );
    assert.equal(generalPsychPreview.status, 200);

    const generalPsychPdfSource = normalizePreviewRuntimeSource(
      "https://esm.sh/pdfjs-dist@4.10.38/legacy/build/pdf.mjs"
    );
    assert.ok(generalPsychPdfSource);
    const generalPsychPdfRuntimeUrl = `${previewServer.origin}${generalPsychPublicPrefix}/runtime?source=${encodeURIComponent(generalPsychPdfSource)}`;
    assert.equal((await fetch(generalPsychPdfRuntimeUrl, { method: "HEAD" })).status, 403);
    const generalPsychMainHead = await fetch(
      `${previewServer.origin}${generalPsychPublicPrefix}/preview/workspace/general-psychology-20-independent-studies-202633108/main.js`,
      { method: "HEAD" }
    );
    assert.equal(generalPsychMainHead.status, 200);
    assert.equal((await generalPsychMainHead.arrayBuffer()).byteLength, 0);
    assert.equal((await fetch(generalPsychPdfRuntimeUrl, { method: "HEAD" })).status, 403);

    const generalPsychMain = await fetch(
      `${previewServer.origin}${generalPsychPublicPrefix}/preview/workspace/general-psychology-20-independent-studies-202633108/main.js`
    );
    assert.equal(generalPsychMain.status, 200);
    const generalPsychMainSource = await generalPsychMain.text();
    assert.doesNotMatch(generalPsychMainSource, /from "https:\/\/esm\.sh/);
    assert.doesNotMatch(generalPsychMainSource, /return `\/preview\/references\/raw\//);

    const generalPsychQuiz = await fetch(
      `${previewServer.origin}${generalPsychPublicPrefix}/preview/workspace/general-psychology-20-independent-studies-202633108/assets/gp20-behaviourism-quiz.html`
    );
    assert.equal(generalPsychQuiz.status, 200);
    const generalPsychQuizHtml = await generalPsychQuiz.text();
    assert.match(
      generalPsychQuizHtml,
      new RegExp(`${generalPsychPublicPrefix.replaceAll("/", "\\/")}\/preview\/references\/raw\/general-psychology-20-independent-studies-202633108\/`)
    );
    const generalPsychReference = await fetch(
      `${previewServer.origin}${generalPsychPublicPrefix}/preview/references/raw/general-psychology-20-independent-studies-202633108/%D1%81ontent/i1dab161a-aa78-4c81-9991-a55e4fe09e47/Content/book_1818/chapter_15709.html`
    );
    assert.equal(generalPsychReference.status, 200);

    const rawCapability = "aaaaaaaa-1234-1234-1234-123456789abc";
    const rawPublicPrefix = `/_canvas-helper/p/${rawCapability}`;
    const rawPreview = await fetch(
      `${previewServer.origin}${rawPublicPrefix}/preview/raw/general-psychology-20-independent-studies-202633108/original.html`,
      { headers: { Referer: `${studioOrigin}/` } }
    );
    assert.equal(rawPreview.status, 200);
    const rawToReference = await fetch(
      `${previewServer.origin}${rawPublicPrefix}/preview/references/raw/general-psychology-20-independent-studies-202633108/%D1%81ontent/i1dab161a-aa78-4c81-9991-a55e4fe09e47/Content/book_1818/chapter_15709.html`
    );
    assert.equal(rawToReference.status, 403);

    const referenceCapability = "bbbbbbbb-1234-1234-1234-123456789abc";
    const referencePublicPrefix = `/_canvas-helper/p/${referenceCapability}`;
    const referencePreview = await fetch(
      `${previewServer.origin}${referencePublicPrefix}/preview/references/raw/general-psychology-20-independent-studies-202633108/%D1%81ontent/i1dab161a-aa78-4c81-9991-a55e4fe09e47/Content/book_1818/chapter_15709.html`,
      { headers: { Referer: `${studioOrigin}/` } }
    );
    assert.equal(referencePreview.status, 200);
    const referenceToWorkspace = await fetch(
      `${previewServer.origin}${referencePublicPrefix}/preview/workspace/general-psychology-20-independent-studies-202633108/index.html`
    );
    assert.equal(referenceToWorkspace.status, 403);

    const unsupportedRuntime = await fetch(
      `${previewServer.origin}${calmPublicPrefix}/runtime?source=${encodeURIComponent("https://example.com/runtime.js")}`
    );
    assert.equal(unsupportedRuntime.status, 400);
    const undeclaredRuntime = await fetch(
      `${previewServer.origin}${calmPublicPrefix}/runtime?source=${encodeURIComponent("https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js")}`
    );
    assert.equal(undeclaredRuntime.status, 403);
    const unregisteredRuntime = await fetch(
      `${previewServer.origin}/_canvas-helper/p/99999999-1234-1234-1234-123456789abc/runtime?source=${encodeURIComponent("https://unpkg.com/react@18/umd/react.production.min.js")}`
    );
    assert.equal(unregisteredRuntime.status, 403);

    const forensicsCapability = "13572468-1234-1234-1234-123456789abc";
    const forensicsPublicPrefix = `/_canvas-helper/p/${forensicsCapability}`;
    const forensicsAssignment = await fetch(
      `${previewServer.origin}${forensicsPublicPrefix}/preview/workspace/forensics/assets/module5assignment.html`,
      { headers: { Referer: `${studioOrigin}/` } }
    );
    assert.equal(forensicsAssignment.status, 200);
    const forensicsAssignmentHtml = await forensicsAssignment.text();
    assert.doesNotMatch(forensicsAssignmentHtml, /from "https:\/\/esm\.sh/);
    assert.match(forensicsAssignmentHtml, new RegExp(`${forensicsPublicPrefix.replaceAll("/", "\\/")}\\/runtime\\?source=`));

    const experimentalCapability = "24681357-1234-1234-1234-123456789abc";
    const experimentalPublicPrefix = `/_canvas-helper/p/${experimentalCapability}`;
    const experimentalAssignment = await fetch(
      `${previewServer.origin}${experimentalPublicPrefix}/preview/workspace/experimental-psych-30-per-1-a-b-sec-s-202632352/assets/module1-assignment-design.html`,
      { headers: { Referer: `${studioOrigin}/` } }
    );
    assert.equal(experimentalAssignment.status, 200);
    const experimentalAssignmentHtml = await experimentalAssignment.text();
    assert.doesNotMatch(experimentalAssignmentHtml, /from "https:\/\/esm\.sh/);
    assert.match(experimentalAssignmentHtml, new RegExp(`${experimentalPublicPrefix.replaceAll("/", "\\/")}\\/runtime\\?source=`));

    const sameCapabilityOtherProject = await fetch(
      `${previewServer.origin}/_canvas-helper/p/${capability}/preview/workspace/social10-1-related-issue-1-option-2/index.html`
    );
    assert.equal(sameCapabilityOtherProject.status, 403);
    const sameCapabilityOtherProjectReference = await fetch(
      `${previewServer.origin}${generalPsychPublicPrefix}/preview/references/raw/forensics/content/lesson.html`
    );
    assert.equal(sameCapabilityOtherProjectReference.status, 403);
    const unknownCapability = await fetch(
      `${previewServer.origin}/_canvas-helper/p/abcdefab-abcd-abcd-abcd-abcdefabcdef/preview/workspace/social10-1-related-issue-1-option-2/index.html`
    );
    assert.equal(unknownCapability.status, 403);
    assert.equal((await fetch(`${previewServer.origin}/preview/workspace/e2e-fixture/index.html`)).status, 403);
  } finally {
    await removePath(oversizedFixturePath);
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
  assert.match(source, /isPreviewStandaloneHostBridgeBootstrap/);
  assert.match(source, /isPreviewStandaloneHostRejoin/);
  assert.match(source, /standaloneSessionTokenRefs/);
  assert.match(source, /standaloneRejoinTokenRefs/);
  assert.match(source, /source === "standalone"/);
  assert.match(source, /event\.origin === current\.previewOrigin/);
  assert.match(source, /event\.origin === window\.location\.origin/);
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
    geometry: { x: 0, y: 0, width: 100, height: 40 },
    viewport: { width: 1280, height: 720 },
    scroll: { windowTop: 0, windowLeft: 0, containers: [] },
    pageHref: "http://127.0.0.1:61234/preview/workspace/e2e-fixture/index.html"
  };

  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-review-action",
      payload: { action: "mark-sent", itemIds: ["review-1", "review-2"], packetId: "0123456789abcdef", reviewSessionId: "12345678-1234-1234-1234-123456789abc" }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-review-action",
      payload: { action: "mark-sent", itemIds: ["review-1", "review-1"], packetId: "0123456789abcdef", reviewSessionId: "12345678-1234-1234-1234-123456789abc" }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-review-action",
      payload: { action: "begin-copy", copyId: "copy-1", itemIds: ["review-1", "review-2"], packetId: "0123456789abcdef", reviewSessionId: "12345678-1234-1234-1234-123456789abc" }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-review-action",
      payload: { action: "cancel-copy", itemIds: ["review-1"], packetId: "0123456789abcdef", reviewSessionId: "12345678-1234-1234-1234-123456789abc" }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-request-inspect-current",
      payload: { requestId: "capture-request-1", nodeId: selection.nodeId }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-review-action",
      payload: { action: "undo", requestId: "review-12" }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-review-action",
      payload: { action: "cancel-capture", requestId: "x".repeat(81) }
    }),
    false
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
      payload: { requestId: "capture-request-1", selection }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-request-inspect-current",
      payload: { requestId: "capture-request-2", nodeId: "x".repeat(161) }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-focus-inspect-node",
      payload: { requestId: "focus-request-1", nodeId: selection.nodeId }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-show-inspect-node",
      payload: { requestId: "focus-request-2", nodeId: selection.nodeId, pageHref: selection.pageHref }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-inspect-focused",
      payload: { requestId: "focus-request-2", nodeId: selection.nodeId, focused: true }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-health",
      payload: { status: "ready", href: selection.pageHref, textLength: 42, visualCount: 1 }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-health",
      payload: { status: "empty", href: selection.pageHref, textLength: -1, visualCount: 0 }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-diagnostic",
      payload: { kind: "asset-error", message: "img failed to load", href: selection.pageHref }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-diagnostic",
      payload: { kind: "asset-error", message: "missing page identity" }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "preview-diagnostic",
      payload: { kind: "asset-error", message: "x".repeat(361), href: selection.pageHref }
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
        sessionId: "12345678-1234-1234-1234-123456789abc",
        items: [{
          id: "review-1",
          projectSlug: "e2e-fixture",
          nodeId: selection.nodeId,
          excerpt: "Current element",
          teacherNote: "Make this clearer.",
          handoffState: "draft",
          screenshots: [{
            id: "shot-1",
            filePath: ".runtime/studio-review-sets/12345678-1234-1234-1234-123456789abc/e2e-fixture-review-1-shot.png",
            ownerNodeId: selection.nodeId
          }]
        }],
        draftScreenshotCount: 0,
        captureItemId: "",
        saving: false,
        copying: false,
        preparing: false,
        packetReady: true,
        status: "Review Set ready.",
        error: "",
        undoLabel: "Undo remove"
      }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-review-action-result",
      payload: { ok: true, message: "Undone.", clearDraft: false, requestId: "review-12" }
    }),
    true
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-review-action-result",
      payload: { ok: true, message: "Undone.", clearDraft: false, requestId: "x".repeat(81) }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-set-review-state",
      payload: {
        sessionId: "12345678-1234-1234-1234-123456789abc",
        items: [{ id: "review-1", projectSlug: "e2e-fixture", nodeId: selection.nodeId, excerpt: "Current element", teacherNote: "Make this clearer.", handoffState: "draft", screenshots: [] }],
        draftScreenshotCount: 0,
        captureItemId: "",
        saving: "no",
        copying: false,
        preparing: false,
        packetReady: true,
        status: "Review Set ready.",
        error: ""
      }
    }),
    false
  );
  assert.equal(
    isPreviewBridgeMessage({
      protocol: "canvas-helper.preview",
      version: 1,
      type: "studio-set-review-packet",
      payload: { packet: "x".repeat(7_701), packetId: "0123456789abcdef", itemIds: ["review-1"], reviewSessionId: "12345678-1234-1234-1234-123456789abc" }
    }),
    false
  );
});

test("standalone preview bootstrap requires a bounded one-time session token", () => {
  const sessionToken = "12345678-1234-1234-1234-123456789abc";
  const rejoinToken = "abcdefab-abcd-abcd-abcd-abcdefabcdef";
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

  const hostBootstrap = createPreviewStandaloneHostBridgeBootstrap(sessionToken, rejoinToken);
  assert.equal(isPreviewStandaloneHostBridgeBootstrap(hostBootstrap), true);
  assert.equal(isPreviewStandaloneHostBridgeBootstrap({ ...hostBootstrap, payload: { sessionToken, rejoinToken: "short" } }), false);
  const rejoin = createPreviewStandaloneHostRejoin(rejoinToken);
  assert.equal(isPreviewStandaloneHostRejoin(rejoin), true);
  assert.equal(isPreviewStandaloneHostRejoin({ ...rejoin, payload: { rejoinToken: "short" } }), false);
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
          geometry: { x: 0, y: 0, width: 1, height: 1 },
          viewport: { width: 1280, height: 720 },
          scroll: { windowTop: 0, windowLeft: 0, containers: [] },
          pageHref: "http://127.0.0.1:61234/preview/workspace/e2e-fixture/does-not-exist.html"
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

test("screenshot annotation uses the bounded course-only capture route and never requests screen sharing", async () => {
  const source = await readFile(path.join(repoRoot, "app/studio/src/hooks/useScreenshotAnnotation.ts"), "utf8");
  const captureSource = await readFile(path.join(repoRoot, "app/server/lib/preview-capture.ts"), "utf8");
  const captureRouteSource = await readFile(path.join(repoRoot, "app/server/routes/preview-capture.ts"), "utf8");
  assert.match(source, /\/api\/inspection\/capture/);
  assert.match(source, /REVIEW_SCREENSHOT_MAX_PER_ITEM/);
  assert.match(source, /activeCaptureRef/);
  assert.match(source, /const cancelCapture/);
  assert.match(source, /cancelCapture\(\);/);
  assert.match(source, /URL\.createObjectURL/);
  assert.doesNotMatch(source, /getDisplayMedia|navigator\.mediaDevices|displaySurface/);
  assert.match(captureSource, /routeWebSocket/);
  assert.match(captureSource, /serviceWorkers:\s*"block"/);
  assert.match(captureSource, /webSocket\.close/);
  assert.match(captureRouteSource, /awaitAbortable/);
  assert.match(captureRouteSource, /Promise\.race/);
});
