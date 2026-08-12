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
import { REVIEW_SCREENSHOT_MAX_FILES_PER_SESSION, REVIEW_SCREENSHOT_MAX_PER_ITEM } from "../../app/shared/inspection.ts";
import {
  STUDIO_PERFORMANCE_BUDGETS_MS,
  STUDIO_PERFORMANCE_DEADLINES_MS,
  STUDIO_REVIEW_CACHE_LIMITS,
  studioPerformanceBudget,
  studioPerformanceDeadline
} from "../../app/shared/studio-quality.ts";
import { REVIEW_SET_MAX_ITEMS } from "../../app/studio/src/lib/review-set.ts";
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
  assert.equal(STUDIO_REVIEW_CACHE_LIMITS.itemsPerSession, REVIEW_SET_MAX_ITEMS);
  assert.equal(STUDIO_REVIEW_CACHE_LIMITS.sessionsPerProject, REVIEW_SET_MAX_SESSIONS);
  assert.equal(STUDIO_REVIEW_CACHE_LIMITS.screenshotsPerItem, REVIEW_SCREENSHOT_MAX_PER_ITEM);
  assert.equal(STUDIO_REVIEW_CACHE_LIMITS.screenshotsPerSession, REVIEW_SCREENSHOT_MAX_FILES_PER_SESSION);
  assert.ok(STUDIO_REVIEW_CACHE_LIMITS.projects <= 40);
  assert.ok(STUDIO_REVIEW_CACHE_LIMITS.ttlDays <= 7);
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
