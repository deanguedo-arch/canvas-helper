import {
  INSPECTION_ISSUE_CATEGORIES,
  REVIEW_SCREENSHOT_MAX_BYTES,
  REVIEW_SCREENSHOT_MAX_DIMENSION,
  REVIEW_SCREENSHOT_MAX_PER_ITEM,
  type InspectionResolution,
  type InspectionResolveRequest
} from "../../../shared/inspection.js";
import { isPreviewInspectPayload } from "../../../shared/preview-bridge.js";
import {
  createReviewSetItem,
  REVIEW_SET_MAX_ITEMS,
  REVIEW_SET_NOTE_MAX_BYTES,
  utf8ByteLength,
  type ReviewSetItem,
  type ReviewSetScreenshot
} from "./review-set";
import {
  isReviewScreenshotPath,
  isReviewScreenshotSessionId,
  reviewScreenshotImageUrl
} from "./review-screenshots";

const STORAGE_KEY = "canvas-helper/review-set-v6";
const LEGACY_STORAGE_KEYS = ["canvas-helper/review-set-v5", "canvas-helper/review-set-v4", "canvas-helper/review-set-v3"];
const STORAGE_VERSION = 6;
const STORAGE_TTL_MS = 7 * 24 * 60 * 60 * 1_000;
const STORAGE_MAX_CHARACTERS = 160_000;

type StoredReviewSet = {
  version: typeof STORAGE_VERSION;
  updatedAt: number;
  sessionId: string;
  items: unknown[];
};

export type HydratedReviewSet = {
  sessionId: string;
  items: ReviewSetItem[];
  persistenceError?: string;
};

const STORAGE_UNAVAILABLE_MESSAGE = "Canvas Helper could not access browser storage. This Review Set will stay open only until this tab closes.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeInline(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" && value.length <= maximumLength && !/[\u0000-\u001f]/.test(value);
}

function isSafeRepoPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 1_024 &&
    !/[\u0000-\u001f\\]/.test(value) &&
    !value.startsWith("/") &&
    !value.startsWith("~") &&
    !value.split("/").some((segment) => !segment || segment === "." || segment === "..")
  );
}

function isOptionalCommand(value: unknown): value is string | null {
  return value === null || isSafeInline(value, 1_024);
}

function isResolution(value: unknown): value is InspectionResolution {
  if (!isRecord(value) || !isPreviewInspectPayload(value.selection)) {
    return false;
  }
  return (
    isSafeInline(value.projectSlug, 160) &&
    isSafeRepoPath(value.previewPath) &&
    ["exact", "bounded", "unknown"].includes(String(value.resolution)) &&
    ["current", "unverified", "stale", "unsupported"].includes(String(value.freshness)) &&
    ["canonical-editable-source", "generated-workspace-output", "reference-only", "unknown"].includes(String(value.artifactRole)) &&
    typeof value.generated === "boolean" &&
    (value.primaryEditTarget === null || isSafeRepoPath(value.primaryEditTarget)) &&
    (value.primaryEditLine === null || (Number.isInteger(value.primaryEditLine) && Number(value.primaryEditLine) > 0)) &&
    Array.isArray(value.contributors) &&
    value.contributors.length <= 24 &&
    value.contributors.every(isSafeRepoPath) &&
    isOptionalCommand(value.rebuildCommand) &&
    isOptionalCommand(value.validationCommand) &&
    Array.isArray(value.warnings) &&
    value.warnings.length <= 24 &&
    value.warnings.every((warning) => isSafeInline(warning, 1_024))
  );
}

function hydrateScreenshot(
  value: unknown,
  owner: { sessionId: string; projectSlug: string; itemId: string; ownerNodeId: string }
): ReviewSetScreenshot | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    !isSafeInline(value.id, 160) ||
    !value.id ||
    !isReviewScreenshotPath(value.filePath) ||
    !Number.isInteger(value.byteLength) ||
    Number(value.byteLength) <= 0 ||
    Number(value.byteLength) > REVIEW_SCREENSHOT_MAX_BYTES ||
    !Number.isInteger(value.width) ||
    Number(value.width) <= 0 ||
    Number(value.width) > REVIEW_SCREENSHOT_MAX_DIMENSION ||
    !Number.isInteger(value.height) ||
    Number(value.height) <= 0 ||
    Number(value.height) > REVIEW_SCREENSHOT_MAX_DIMENSION
  ) {
    return null;
  }
  return {
    id: value.id,
    filePath: value.filePath,
    byteLength: Number(value.byteLength),
    width: Number(value.width),
    height: Number(value.height),
    imageUrl: reviewScreenshotImageUrl(value.filePath, owner)
  };
}

function hydrateItem(value: unknown, sessionId: string): ReviewSetItem | null {
  if (!isRecord(value) || !isRecord(value.request) || !isResolution(value.resolution)) {
    return null;
  }
  const request = value.request as Record<string, unknown>;
  if (
    !isSafeInline(value.id, 160) ||
    !value.id ||
    value.previewMode !== "workspace" ||
    !isSafeInline(request.projectSlug, 160) ||
    !request.projectSlug ||
    request.root !== "workspace" ||
    !isSafeRepoPath(request.htmlPath) ||
    !isPreviewInspectPayload(request.selection) ||
    !request.selection.nodeId ||
    request.projectSlug !== value.resolution.projectSlug ||
    request.selection.nodeId !== value.resolution.selection.nodeId ||
    request.selection.pageHref !== value.resolution.selection.pageHref ||
    !INSPECTION_ISSUE_CATEGORIES.includes(value.issueCategory as (typeof INSPECTION_ISSUE_CATEGORIES)[number]) ||
    typeof value.teacherNote !== "string" ||
    utf8ByteLength(value.teacherNote) > REVIEW_SET_NOTE_MAX_BYTES ||
    !Array.isArray(value.screenshots) ||
    value.screenshots.length > REVIEW_SCREENSHOT_MAX_PER_ITEM
  ) {
    return null;
  }
  const screenshots = value.screenshots.map((screenshot) => hydrateScreenshot(screenshot, {
    sessionId,
    projectSlug: request.projectSlug as string,
    itemId: value.id as string,
    ownerNodeId: (request.selection as { nodeId: string }).nodeId
  }));
  if (screenshots.some((screenshot) => screenshot === null)) {
    return null;
  }
  const sanitizedRequest: InspectionResolveRequest = {
    projectSlug: request.projectSlug,
    root: "workspace",
    htmlPath: request.htmlPath,
    selection: request.selection
  };
  const sanitizedResolution: InspectionResolution = {
    projectSlug: value.resolution.projectSlug,
    previewPath: value.resolution.previewPath,
    selection: value.resolution.selection,
    resolution: value.resolution.resolution,
    freshness: value.resolution.freshness,
    artifactRole: value.resolution.artifactRole,
    generated: value.resolution.generated,
    primaryEditTarget: value.resolution.primaryEditTarget,
    primaryEditLine: value.resolution.primaryEditLine,
    sourceExcerpt: null,
    contributors: value.resolution.contributors,
    rebuildCommand: value.resolution.rebuildCommand,
    validationCommand: value.resolution.validationCommand,
    warnings: value.resolution.warnings
  };
  try {
    return createReviewSetItem({
      id: value.id,
      previewMode: "workspace",
      request: sanitizedRequest,
      resolution: sanitizedResolution,
      issueCategory: value.issueCategory as (typeof INSPECTION_ISSUE_CATEGORIES)[number],
      teacherNote: value.teacherNote,
      screenshots: screenshots as ReviewSetScreenshot[]
    });
  } catch {
    return null;
  }
}

function removeStoredKeys() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}

function storageUnavailable(): HydratedReviewSet {
  return { sessionId: "", items: [], persistenceError: STORAGE_UNAVAILABLE_MESSAGE };
}

export function loadStoredReviewSet(): HydratedReviewSet | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized || serialized.length > STORAGE_MAX_CHARACTERS) {
      if (serialized && !removeStoredKeys()) return storageUnavailable();
      return null;
    }
    const stored = JSON.parse(serialized) as StoredReviewSet;
    if (
      !isRecord(stored) ||
      stored.version !== STORAGE_VERSION ||
      !Number.isFinite(stored.updatedAt) ||
      stored.updatedAt > Date.now() ||
      Date.now() - stored.updatedAt > STORAGE_TTL_MS ||
      !isReviewScreenshotSessionId(stored.sessionId) ||
      !Array.isArray(stored.items) ||
      stored.items.length > REVIEW_SET_MAX_ITEMS
    ) {
      if (!removeStoredKeys()) return storageUnavailable();
      return null;
    }
    const items = stored.items.map((item) => hydrateItem(item, stored.sessionId));
    if (items.some((item) => item === null)) {
      if (!removeStoredKeys()) return storageUnavailable();
      return null;
    }
    return { sessionId: stored.sessionId, items: items as ReviewSetItem[] };
  } catch {
    return removeStoredKeys() ? null : storageUnavailable();
  }
}

export function saveStoredReviewSet(sessionId: string, items: ReviewSetItem[]) {
  if (typeof window === "undefined" || !isReviewScreenshotSessionId(sessionId) || items.length > REVIEW_SET_MAX_ITEMS) {
    return false;
  }
  try {
    const stored: StoredReviewSet = {
      version: STORAGE_VERSION,
      updatedAt: Date.now(),
      sessionId,
      items: items.map((item) => ({
        ...item,
        screenshots: item.screenshots.map(({ imageUrl: _imageUrl, ...screenshot }) => screenshot)
      }))
    };
    const serialized = JSON.stringify(stored);
    if (serialized.length > STORAGE_MAX_CHARACTERS) {
      return false;
    }
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}

export function clearStoredReviewSet() {
  return typeof window === "undefined" ? true : removeStoredKeys();
}
