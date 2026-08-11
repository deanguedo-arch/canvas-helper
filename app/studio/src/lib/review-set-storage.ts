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

const STORAGE_KEY = "canvas-helper/review-sets-by-project-v7";
const LEGACY_SINGLE_SET_STORAGE_KEY = "canvas-helper/review-set-v6";
const OBSOLETE_STORAGE_KEYS = ["canvas-helper/review-set-v5", "canvas-helper/review-set-v4", "canvas-helper/review-set-v3"];
const STORAGE_VERSION = 7;
const STORAGE_TTL_MS = 7 * 24 * 60 * 60 * 1_000;
const STORAGE_MAX_PROJECTS = 40;
const STORAGE_MAX_SET_CHARACTERS = 160_000;
const STORAGE_MAX_CHARACTERS = 1_200_000;

type StoredReviewSetEntry = {
  updatedAt: number;
  sessionId: string;
  items: unknown[];
};

type StoredReviewSetCollection = {
  version: typeof STORAGE_VERSION;
  projects: Record<string, StoredReviewSetEntry>;
};

type LegacyStoredReviewSet = StoredReviewSetEntry & { version: 6 };

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

function isSafeProjectSlug(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(value);
}

function removeObsoleteStoredKeys() {
  try {
    window.localStorage.removeItem(LEGACY_SINGLE_SET_STORAGE_KEY);
    OBSOLETE_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}

function storageUnavailable(): HydratedReviewSet {
  return { sessionId: "", items: [], persistenceError: STORAGE_UNAVAILABLE_MESSAGE };
}

function emptyCollection(): StoredReviewSetCollection {
  return { version: STORAGE_VERSION, projects: {} };
}

function serializeItems(items: ReviewSetItem[]) {
  return items.map((item) => ({
    ...item,
    screenshots: item.screenshots.map(({ imageUrl: _imageUrl, ...screenshot }) => screenshot)
  }));
}

function readCollection(): StoredReviewSetCollection {
  const serialized = window.localStorage.getItem(STORAGE_KEY);
  if (serialized) {
    if (serialized.length > STORAGE_MAX_CHARACTERS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return emptyCollection();
    }
    const parsed = JSON.parse(serialized) as unknown;
    if (isRecord(parsed) && parsed.version === STORAGE_VERSION && isRecord(parsed.projects)) {
      return { version: STORAGE_VERSION, projects: parsed.projects as Record<string, StoredReviewSetEntry> };
    }
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const legacySerialized = window.localStorage.getItem(LEGACY_SINGLE_SET_STORAGE_KEY);
  if (!legacySerialized || legacySerialized.length > STORAGE_MAX_SET_CHARACTERS) {
    removeObsoleteStoredKeys();
    return emptyCollection();
  }
  const legacy = JSON.parse(legacySerialized) as LegacyStoredReviewSet;
  const firstItem = Array.isArray(legacy.items) && isRecord(legacy.items[0]) && isRecord(legacy.items[0].request)
    ? legacy.items[0].request.projectSlug
    : "";
  const collection = emptyCollection();
  if (
    legacy.version === 6 &&
    isSafeProjectSlug(firstItem) &&
    Number.isFinite(legacy.updatedAt) &&
    isReviewScreenshotSessionId(legacy.sessionId) &&
    Array.isArray(legacy.items) &&
    legacy.items.length <= REVIEW_SET_MAX_ITEMS
  ) {
    collection.projects[firstItem] = {
      updatedAt: legacy.updatedAt,
      sessionId: legacy.sessionId,
      items: legacy.items
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  }
  removeObsoleteStoredKeys();
  return collection;
}

function writeCollection(collection: StoredReviewSetCollection) {
  const serialized = JSON.stringify(collection);
  if (serialized.length > STORAGE_MAX_CHARACTERS) return false;
  window.localStorage.setItem(STORAGE_KEY, serialized);
  return true;
}

function removeProjectEntry(collection: StoredReviewSetCollection, projectSlug: string) {
  delete collection.projects[projectSlug];
  writeCollection(collection);
}

export function loadStoredReviewSet(projectSlug = ""): HydratedReviewSet | null {
  if (typeof window === "undefined") return null;
  try {
    const collection = readCollection();
    const selectedSlug = isSafeProjectSlug(projectSlug)
      ? projectSlug
      : Object.entries(collection.projects)
          .sort(([, left], [, right]) => Number(right.updatedAt) - Number(left.updatedAt))[0]?.[0] ?? "";
    if (!selectedSlug) return null;
    const stored = collection.projects[selectedSlug];
    if (!stored) return null;
    if (
      !Number.isFinite(stored.updatedAt) ||
      stored.updatedAt > Date.now() ||
      Date.now() - stored.updatedAt > STORAGE_TTL_MS ||
      !isReviewScreenshotSessionId(stored.sessionId) ||
      !Array.isArray(stored.items) ||
      stored.items.length > REVIEW_SET_MAX_ITEMS
    ) {
      removeProjectEntry(collection, selectedSlug);
      return null;
    }
    const items = stored.items.map((item) => hydrateItem(item, stored.sessionId));
    if (
      items.some((item) => item === null) ||
      items.some((item) => item?.request.projectSlug !== selectedSlug)
    ) {
      removeProjectEntry(collection, selectedSlug);
      return null;
    }
    return { sessionId: stored.sessionId, items: items as ReviewSetItem[] };
  } catch {
    return storageUnavailable();
  }
}

export function saveStoredReviewSet(projectSlug: string, sessionId: string, items: ReviewSetItem[]) {
  if (
    typeof window === "undefined" ||
    !isSafeProjectSlug(projectSlug) ||
    !isReviewScreenshotSessionId(sessionId) ||
    items.length > REVIEW_SET_MAX_ITEMS ||
    items.some((item) => item.request.projectSlug !== projectSlug)
  ) {
    return false;
  }
  try {
    const entry: StoredReviewSetEntry = {
      updatedAt: Date.now(),
      sessionId,
      items: serializeItems(items)
    };
    if (JSON.stringify(entry).length > STORAGE_MAX_SET_CHARACTERS) return false;
    const collection = readCollection();
    const projects = Object.fromEntries(
      Object.entries(collection.projects)
        .filter(([slug]) => slug !== projectSlug)
        .sort(([, left], [, right]) => Number(right.updatedAt) - Number(left.updatedAt))
        .slice(0, STORAGE_MAX_PROJECTS - 1)
    );
    projects[projectSlug] = entry;
    return writeCollection({ version: STORAGE_VERSION, projects });
  } catch {
    return false;
  }
}

export function clearStoredReviewSet(projectSlug = "") {
  if (typeof window === "undefined") return true;
  try {
    if (!projectSlug) {
      window.localStorage.removeItem(STORAGE_KEY);
      return removeObsoleteStoredKeys();
    }
    if (!isSafeProjectSlug(projectSlug)) return false;
    const collection = readCollection();
    delete collection.projects[projectSlug];
    return writeCollection(collection);
  } catch {
    return false;
  }
}
