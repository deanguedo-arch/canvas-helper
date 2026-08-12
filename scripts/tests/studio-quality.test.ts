import assert from "node:assert/strict";
import { mkdtemp, rm, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  clearPreviewInspectionDocumentCache,
  loadPreviewInspectionDocument,
  previewInspectionDocumentCacheStats
} from "../../app/server/lib/preview-inspection.ts";
import { buildPreviewBridgeRuntime } from "../../app/server/preview-bridge-runtime.ts";
import { REVIEW_SCREENSHOT_MAX_FILES_PER_SESSION, REVIEW_SCREENSHOT_MAX_PER_ITEM } from "../../app/shared/inspection.ts";
import {
  PREVIEW_BRIDGE_MAX_MESSAGE_BYTES,
  PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH,
  PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH,
  PREVIEW_REVIEW_MAX_ITEMS,
  PREVIEW_REVIEW_MAX_SCREENSHOTS,
  PREVIEW_REVIEW_NOTE_MAX_LENGTH,
  PREVIEW_REVIEW_PACKET_MAX_LENGTH,
  PREVIEW_STANDALONE_SESSION_TOKEN_MAX_LENGTH,
  isPreviewBridgeMessage,
  isPreviewReviewAction
} from "../../app/shared/preview-bridge.ts";
import {
  STUDIO_BRIDGE_LIMITS,
  STUDIO_PACKET_LIMITS,
  STUDIO_PERFORMANCE_BUDGETS_MS,
  STUDIO_PERFORMANCE_DEADLINES_MS,
  STUDIO_REVIEW_CACHE_LIMITS,
  STUDIO_REVIEW_LIMITS,
  STUDIO_SCREENSHOT_LIMITS,
  studioPerformanceBudget,
  studioPerformanceDeadline
} from "../../app/shared/studio-quality.ts";
import { REVIEW_SET_MAX_ITEMS } from "../../app/studio/src/lib/review-set.ts";
import { utf8ByteLength } from "../../app/studio/src/lib/review-set.ts";
import { REVIEW_SET_MAX_SESSIONS } from "../../app/studio/src/lib/review-set-storage.ts";

test("Studio quality budgets keep ordinary work fast without shortening recovery deadlines", () => {
  assert.deepEqual(STUDIO_PERFORMANCE_BUDGETS_MS, {
    previewReady: 2_000,
    selectionFeedback: 500,
    captureStatus: 2_500
  });
  assert.deepEqual(STUDIO_PERFORMANCE_DEADLINES_MS, {
    previewReady: 12_000,
    selectionFeedback: 2_000,
    captureStatus: 25_000
  });
  for (const measure of ["preview-ready", "selection-feedback", "capture-status"] as const) {
    assert.ok(studioPerformanceBudget(measure) < studioPerformanceDeadline(measure));
  }
});

test("Review Set persistence and screenshot limits share one bounded contract", () => {
  assert.strictEqual(STUDIO_REVIEW_CACHE_LIMITS.itemsPerSession, STUDIO_REVIEW_LIMITS.itemsPerSession);
  assert.equal(STUDIO_REVIEW_CACHE_LIMITS.itemsPerSession, REVIEW_SET_MAX_ITEMS);
  assert.equal(STUDIO_REVIEW_CACHE_LIMITS.sessionsPerProject, REVIEW_SET_MAX_SESSIONS);
  assert.equal(STUDIO_REVIEW_CACHE_LIMITS.screenshotsPerItem, REVIEW_SCREENSHOT_MAX_PER_ITEM);
  assert.equal(STUDIO_REVIEW_CACHE_LIMITS.screenshotsPerSession, REVIEW_SCREENSHOT_MAX_FILES_PER_SESSION);
  assert.ok(STUDIO_REVIEW_CACHE_LIMITS.projects <= 40);
  assert.ok(STUDIO_REVIEW_CACHE_LIMITS.ttlDays <= 7);
  assert.equal(STUDIO_BRIDGE_LIMITS.reviewNoteCodeUnits, STUDIO_REVIEW_LIMITS.noteUtf8Bytes);
  assert.equal(STUDIO_PACKET_LIMITS.inspectionUtf8Bytes, 7_500);
  assert.equal(STUDIO_SCREENSHOT_LIMITS.bytes, 5 * 1024 * 1024);
  assert.equal(STUDIO_SCREENSHOT_LIMITS.dimension, 8_192);
  assert.equal(STUDIO_SCREENSHOT_LIMITS.pixels, 32_000_000);
  assert.equal(STUDIO_REVIEW_LIMITS.screenshotTotalFiles, 150);
  assert.equal(STUDIO_REVIEW_LIMITS.screenshotTotalBytes, 100 * 1024 * 1024);
  assert.equal(STUDIO_REVIEW_LIMITS.inspectionSourceCacheEntries, 24);
});

test("bridge aliases and injected runtime use the canonical shared limits", () => {
  assert.equal(PREVIEW_BRIDGE_MAX_MESSAGE_BYTES, STUDIO_BRIDGE_LIMITS.messageUtf8Bytes);
  assert.equal(PREVIEW_STANDALONE_SESSION_TOKEN_MAX_LENGTH, STUDIO_BRIDGE_LIMITS.standaloneSessionTokenCodeUnits);
  assert.equal(PREVIEW_REVIEW_MAX_ITEMS, STUDIO_REVIEW_LIMITS.itemsPerSession);
  assert.equal(PREVIEW_REVIEW_MAX_SCREENSHOTS, STUDIO_REVIEW_LIMITS.screenshotsPerItem);
  assert.equal(PREVIEW_REVIEW_ITEM_ID_MAX_LENGTH, STUDIO_BRIDGE_LIMITS.reviewItemIdCodeUnits);
  assert.equal(PREVIEW_REVIEW_NOTE_MAX_LENGTH, STUDIO_BRIDGE_LIMITS.reviewNoteCodeUnits);
  assert.equal(PREVIEW_REVIEW_PACKET_MAX_LENGTH, STUDIO_BRIDGE_LIMITS.reviewPacketCodeUnits);
  assert.equal(PREVIEW_INSPECT_REQUEST_ID_MAX_LENGTH, STUDIO_BRIDGE_LIMITS.inspectRequestIdCodeUnits);

  const runtime = buildPreviewBridgeRuntime("http://127.0.0.1:4173", { hostPreviewOrigin: "http://127.0.0.1:4174" });
  assert.match(runtime, new RegExp(`var MAX_REVIEW_NOTE = ${STUDIO_BRIDGE_LIMITS.reviewNoteCodeUnits};`));
  assert.match(runtime, new RegExp(`var MAX_REVIEW_PACKET = ${STUDIO_BRIDGE_LIMITS.reviewPacketCodeUnits};`));
  assert.match(runtime, new RegExp(`var MAX_REVIEW_SESSION_ID = ${STUDIO_REVIEW_LIMITS.sessionIdMaxCodeUnits};`));
  assert.match(runtime, new RegExp(`var MIN_PREVIEW_CAPABILITY_TOKEN = ${STUDIO_BRIDGE_LIMITS.previewCapabilityTokenMinCodeUnits};`));
  assert.match(runtime, new RegExp(`var MAX_PREVIEW_CAPABILITY_TOKEN = ${STUDIO_BRIDGE_LIMITS.previewCapabilityTokenMaxCodeUnits};`));
  assert.match(runtime, /MIN_PREVIEW_CAPABILITY_TOKEN \+ "," \+ MAX_PREVIEW_CAPABILITY_TOKEN/);
  assert.doesNotMatch(runtime, /MIN_REVIEW_SESSION_ID \+ "," \+ MAX_REVIEW_SESSION_ID \+ "\}\)\(\/preview\/workspace/);
});

test("bridge code-unit limits and Review Set UTF-8 byte limits remain deliberately distinct", () => {
  const selection = {
    nodeId: "n",
    visibleText: "heading",
    tagName: "h1",
    role: "",
    testId: "",
    geometry: { x: 0, y: 0, width: 1, height: 1 },
    viewport: { width: 320, height: 480 },
    scroll: { windowTop: 0, windowLeft: 0, containers: [] },
    pageHref: "http://127.0.0.1/preview/workspace/e2e-fixture/index.html"
  };
  const maxCodeUnits = "é".repeat(STUDIO_BRIDGE_LIMITS.reviewNoteCodeUnits);
  const overCodeUnits = `${maxCodeUnits}a`;
  assert.equal(maxCodeUnits.length, STUDIO_BRIDGE_LIMITS.reviewNoteCodeUnits);
  assert.equal(utf8ByteLength(maxCodeUnits), STUDIO_REVIEW_LIMITS.noteUtf8Bytes * 2);
  assert.equal(isPreviewReviewAction({ action: "add", selection, teacherNote: maxCodeUnits }), true);
  assert.equal(isPreviewReviewAction({ action: "add", selection, teacherNote: overCodeUnits }), false);

  const packetAtLimit = "a".repeat(STUDIO_BRIDGE_LIMITS.reviewPacketCodeUnits);
  const packetOverLimit = `${packetAtLimit}a`;
  const envelope = (packet: string) => ({
    protocol: "canvas-helper.preview",
    version: 1,
    type: "studio-set-review-packet",
    payload: { packet }
  });
  assert.equal(isPreviewBridgeMessage(envelope(packetAtLimit)), true);
  assert.equal(isPreviewBridgeMessage(envelope(packetOverLimit)), false);
  assert.ok(STUDIO_PACKET_LIMITS.inspectionUtf8Bytes < STUDIO_BRIDGE_LIMITS.reviewPacketCodeUnits);
});

test("preview inspection cache reuses an unchanged file and invalidates a same-size newer file", async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-inspection-cache-"));
  context.after(async () => {
    clearPreviewInspectionDocumentCache();
    await rm(directory, { recursive: true, force: true });
  });
  const filePath = path.join(directory, "index.html");
  const firstSource = "<main><h1>Alpha</h1></main>";
  const secondSource = "<main><h1>Bravo</h1></main>";
  assert.equal(Buffer.byteLength(firstSource), Buffer.byteLength(secondSource));
  await writeFile(filePath, firstSource);
  clearPreviewInspectionDocumentCache();

  const first = await loadPreviewInspectionDocument(filePath);
  const unchanged = await loadPreviewInspectionDocument(filePath);
  assert.strictEqual(unchanged, first);
  assert.deepEqual(previewInspectionDocumentCacheStats(), { entries: 1, hits: 1, misses: 1 });

  await writeFile(filePath, secondSource);
  const future = new Date(Date.now() + 5_000);
  await utimes(filePath, future, future);
  const refreshed = await loadPreviewInspectionDocument(filePath);
  assert.notStrictEqual(refreshed, first);
  assert.notEqual(refreshed?.sourceDigest, first?.sourceDigest);
  assert.deepEqual(previewInspectionDocumentCacheStats(), { entries: 1, hits: 1, misses: 2 });
});
