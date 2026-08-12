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
  REVIEW_SET_LABEL_MAX_BYTES,
  REVIEW_SET_MAX_ITEMS,
  REVIEW_SET_NOTE_MAX_BYTES,
  REVIEW_SET_PRIORITIES,
  utf8ByteLength,
  type ReviewSetItem,
  type ReviewSetPriority,
  type ReviewSetScreenshot
} from "./review-set";
import {
  isReviewScreenshotPath,
  isReviewScreenshotSessionId,
  reviewScreenshotImageUrl
} from "./review-screenshots";
import { STUDIO_REVIEW_CACHE_LIMITS } from "../../../shared/studio-quality.js";

const STORAGE_KEY = "canvas-helper/review-workbench-v9";
const LEGACY_WORKBENCH_STORAGE_KEY = "canvas-helper/review-workbench-v8";
const LEGACY_PROJECT_SETS_STORAGE_KEY = "canvas-helper/review-sets-by-project-v7";
const LEGACY_SINGLE_SET_STORAGE_KEY = "canvas-helper/review-set-v6";
const OBSOLETE_STORAGE_KEYS = ["canvas-helper/review-set-v5", "canvas-helper/review-set-v4", "canvas-helper/review-set-v3"];
const STORAGE_VERSION = 9;
const BACKUP_VERSION = 1;
const STORAGE_TTL_MS = STUDIO_REVIEW_CACHE_LIMITS.ttlDays * 24 * 60 * 60 * 1_000;
const STORAGE_MAX_PROJECTS = STUDIO_REVIEW_CACHE_LIMITS.projects;
const STORAGE_MAX_SESSIONS_PER_PROJECT = STUDIO_REVIEW_CACHE_LIMITS.sessionsPerProject;
const STORAGE_MAX_SET_CHARACTERS = 160_000;
const STORAGE_MAX_CHARACTERS = 1_200_000;
const REVIEW_SET_NAME_MAX_BYTES = 80;

type StoredReviewSet = {
  id: string;
  name: string;
  updatedAt: number;
  items: unknown[];
};

type StoredReviewProject = {
  updatedAt: number;
  screenshotSessionId: string;
  activeSetId: string;
  sets: StoredReviewSet[];
};

type StoredReviewWorkbench = {
  version: typeof STORAGE_VERSION;
  projects: Record<string, StoredReviewProject>;
};

type LegacyStoredReviewSetEntry = {
  updatedAt: number;
  sessionId: string;
  items: unknown[];
};

export type ReviewSetSessionSummary = {
  id: string;
  name: string;
  updatedAt: number;
  itemCount: number;
  screenshotCount: number;
  active: boolean;
};

export type HydratedReviewSet = {
  reviewSessionId: string;
  name: string;
  sessionId: string;
  items: ReviewSetItem[];
  sessions: ReviewSetSessionSummary[];
  persistenceError?: string;
};

export type ReviewSetBackup = {
  schema: "canvas-helper-review-set-backup";
  version: typeof BACKUP_VERSION;
  projectSlug: string;
  reviewSessionId: string;
  name: string;
  screenshotSessionId: string;
  exportedAt: string;
  items: unknown[];
};

export const REVIEW_SET_MAX_SESSIONS = STORAGE_MAX_SESSIONS_PER_PROJECT;

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

function isSafeProjectSlug(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(value);
}

function isReviewSessionId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9-]{16,80}$/.test(value);
}

function normalizeSetName(value: unknown, fallback = "Review 1") {
  if (typeof value !== "string") return fallback;
  const normalized = value.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
  return normalized && utf8ByteLength(normalized) <= REVIEW_SET_NAME_MAX_BYTES ? normalized : fallback;
}

function isResolution(value: unknown): value is InspectionResolution {
  if (!isRecord(value) || !isPreviewInspectPayload(value.selection)) return false;
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
  if (!isRecord(value)) return null;
  const ownerNodeId = isSafeInline(value.ownerNodeId, 160) && value.ownerNodeId
    ? value.ownerNodeId
    : owner.ownerNodeId;
  if (
    !isSafeInline(value.id, 160) ||
    !value.id ||
    !isReviewScreenshotPath(value.filePath) ||
    !String(value.filePath).startsWith(`.runtime/studio-review-sets/${owner.sessionId}/`) ||
    !Number.isInteger(value.byteLength) ||
    Number(value.byteLength) <= 0 ||
    Number(value.byteLength) > REVIEW_SCREENSHOT_MAX_BYTES ||
    !Number.isInteger(value.width) ||
    Number(value.width) <= 0 ||
    Number(value.width) > REVIEW_SCREENSHOT_MAX_DIMENSION ||
    !Number.isInteger(value.height) ||
    Number(value.height) <= 0 ||
    Number(value.height) > REVIEW_SCREENSHOT_MAX_DIMENSION
  ) return null;
  return {
    id: value.id,
    filePath: value.filePath,
    byteLength: Number(value.byteLength),
    width: Number(value.width),
    height: Number(value.height),
    ownerNodeId,
    cropped: value.cropped === true,
    imageUrl: reviewScreenshotImageUrl(value.filePath, { ...owner, ownerNodeId })
  };
}

function hydrateItem(value: unknown, sessionId: string, expectedProjectSlug: string): ReviewSetItem | null {
  if (!isRecord(value) || !isRecord(value.request) || !isResolution(value.resolution)) return null;
  const request = value.request as Record<string, unknown>;
  const priority = REVIEW_SET_PRIORITIES.includes(value.priority as ReviewSetPriority)
    ? value.priority as ReviewSetPriority
    : "normal";
  const shortLabel = typeof value.shortLabel === "string" ? value.shortLabel : "";
  if (
    !isSafeInline(value.id, 160) ||
    !value.id ||
    value.previewMode !== "workspace" ||
    !isSafeInline(request.projectSlug, 160) ||
    request.projectSlug !== expectedProjectSlug ||
    request.root !== "workspace" ||
    !isSafeRepoPath(request.htmlPath) ||
    !isPreviewInspectPayload(request.selection) ||
    !request.selection.nodeId ||
    request.projectSlug !== value.resolution.projectSlug ||
    request.selection.nodeId !== value.resolution.selection.nodeId ||
    request.selection.pageHref !== value.resolution.selection.pageHref ||
    !INSPECTION_ISSUE_CATEGORIES.includes(value.issueCategory as (typeof INSPECTION_ISSUE_CATEGORIES)[number]) ||
    utf8ByteLength(shortLabel) > REVIEW_SET_LABEL_MAX_BYTES ||
    typeof value.teacherNote !== "string" ||
    utf8ByteLength(value.teacherNote) > REVIEW_SET_NOTE_MAX_BYTES ||
    !Array.isArray(value.screenshots) ||
    value.screenshots.length > REVIEW_SCREENSHOT_MAX_PER_ITEM
  ) return null;
  const screenshots = value.screenshots.map((screenshot) => hydrateScreenshot(screenshot, {
    sessionId,
    projectSlug: request.projectSlug as string,
    itemId: value.id as string,
    ownerNodeId: (request.selection as { nodeId: string }).nodeId
  }));
  if (screenshots.some((screenshot) => screenshot === null)) return null;
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
      shortLabel,
      priority,
      anchorState: value.anchorState === "changed" || value.anchorState === "missing" ? value.anchorState : "ready",
      resolved: value.resolved === true,
      teacherNote: value.teacherNote,
      screenshots: screenshots as ReviewSetScreenshot[]
    });
  } catch {
    return null;
  }
}

function serializeItems(items: ReviewSetItem[]) {
  return items.map((item) => ({
    ...item,
    screenshots: item.screenshots.map(({ imageUrl: _imageUrl, ...screenshot }) => screenshot)
  }));
}

function hydrateItems(items: unknown[], sessionId: string, projectSlug: string) {
  if (items.length > REVIEW_SET_MAX_ITEMS) return null;
  const hydrated = items.map((item) => hydrateItem(item, sessionId, projectSlug));
  return hydrated.some((item) => item === null) ? null : hydrated as ReviewSetItem[];
}

function emptyWorkbench(): StoredReviewWorkbench {
  return { version: STORAGE_VERSION, projects: {} };
}

function removeLegacyKeys() {
  try {
    window.localStorage.removeItem(LEGACY_WORKBENCH_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_PROJECT_SETS_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_SINGLE_SET_STORAGE_KEY);
    OBSOLETE_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}

function migrationSetId(updatedAt: number, position = 0) {
  return `review-migrated-${Math.max(0, Math.floor(updatedAt))}-${position}`.slice(0, 80);
}

function parseStoredJson(serialized: string) {
  try {
    return JSON.parse(serialized) as unknown;
  } catch {
    return null;
  }
}

function migrateLegacy(): StoredReviewWorkbench {
  const workbench = emptyWorkbench();
  const workbenchSerialized = window.localStorage.getItem(LEGACY_WORKBENCH_STORAGE_KEY);
  if (workbenchSerialized && workbenchSerialized.length <= STORAGE_MAX_CHARACTERS) {
    const parsed = parseStoredJson(workbenchSerialized);
    if (isRecord(parsed) && parsed.version === 8 && isRecord(parsed.projects)) {
      const migrated = { version: STORAGE_VERSION, projects: parsed.projects as Record<string, StoredReviewProject> } satisfies StoredReviewWorkbench;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      removeLegacyKeys();
      return migrated;
    }
  }
  const projectSerialized = window.localStorage.getItem(LEGACY_PROJECT_SETS_STORAGE_KEY);
  if (projectSerialized && projectSerialized.length <= STORAGE_MAX_CHARACTERS) {
    const parsed = parseStoredJson(projectSerialized);
    if (isRecord(parsed) && parsed.version === 7 && isRecord(parsed.projects)) {
      let position = 0;
      for (const [slug, rawEntry] of Object.entries(parsed.projects)) {
        if (!isSafeProjectSlug(slug) || !isRecord(rawEntry)) continue;
        const entry = rawEntry as LegacyStoredReviewSetEntry;
        if (!Number.isFinite(entry.updatedAt) || !isReviewScreenshotSessionId(entry.sessionId) || !Array.isArray(entry.items)) continue;
        const setId = migrationSetId(entry.updatedAt, position++);
        workbench.projects[slug] = {
          updatedAt: entry.updatedAt,
          screenshotSessionId: entry.sessionId,
          activeSetId: setId,
          sets: [{ id: setId, name: "Review 1", updatedAt: entry.updatedAt, items: entry.items }]
        };
      }
    }
  }
  if (!Object.keys(workbench.projects).length) {
    const singleSerialized = window.localStorage.getItem(LEGACY_SINGLE_SET_STORAGE_KEY);
    if (singleSerialized && singleSerialized.length <= STORAGE_MAX_SET_CHARACTERS) {
      const entry = parseStoredJson(singleSerialized) as (LegacyStoredReviewSetEntry & { version?: unknown }) | null;
      const firstItem = entry && Array.isArray(entry.items) && isRecord(entry.items[0]) && isRecord(entry.items[0].request)
        ? entry.items[0].request.projectSlug
        : "";
      if (
        entry &&
        entry.version === 6 &&
        isSafeProjectSlug(firstItem) &&
        Number.isFinite(entry.updatedAt) &&
        isReviewScreenshotSessionId(entry.sessionId) &&
        Array.isArray(entry.items)
      ) {
        const setId = migrationSetId(entry.updatedAt);
        workbench.projects[firstItem] = {
          updatedAt: entry.updatedAt,
          screenshotSessionId: entry.sessionId,
          activeSetId: setId,
          sets: [{ id: setId, name: "Review 1", updatedAt: entry.updatedAt, items: entry.items }]
        };
      }
    }
  }
  if (Object.keys(workbench.projects).length) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workbench));
  }
  removeLegacyKeys();
  return workbench;
}

function readWorkbench(): StoredReviewWorkbench {
  const serialized = window.localStorage.getItem(STORAGE_KEY);
  if (!serialized) return migrateLegacy();
  if (serialized.length > STORAGE_MAX_CHARACTERS) {
    window.localStorage.removeItem(STORAGE_KEY);
    return emptyWorkbench();
  }
  const parsed = parseStoredJson(serialized);
  if (isRecord(parsed) && parsed.version === STORAGE_VERSION && isRecord(parsed.projects)) {
    return { version: STORAGE_VERSION, projects: parsed.projects as Record<string, StoredReviewProject> };
  }
  window.localStorage.removeItem(STORAGE_KEY);
  return migrateLegacy();
}

function writeWorkbench(workbench: StoredReviewWorkbench) {
  const serialized = JSON.stringify(workbench);
  if (serialized.length > STORAGE_MAX_CHARACTERS) return false;
  window.localStorage.setItem(STORAGE_KEY, serialized);
  return true;
}

function sessionSummaries(project: StoredReviewProject): ReviewSetSessionSummary[] {
  return project.sets
    .map((set) => ({
      id: set.id,
      name: normalizeSetName(set.name),
      updatedAt: set.updatedAt,
      itemCount: Array.isArray(set.items) ? set.items.length : 0,
      screenshotCount: Array.isArray(set.items)
        ? set.items.reduce<number>((count, item) => count + (isRecord(item) && Array.isArray(item.screenshots) ? item.screenshots.length : 0), 0)
        : 0,
      active: set.id === project.activeSetId
    }))
    .sort((left, right) => right.updatedAt - left.updatedAt);
}

function storageUnavailable(): HydratedReviewSet {
  return {
    reviewSessionId: "",
    name: "Review 1",
    sessionId: "",
    items: [],
    sessions: [],
    persistenceError: STORAGE_UNAVAILABLE_MESSAGE
  };
}

export function createReviewSetSessionId() {
  if (typeof window !== "undefined" && typeof window.crypto?.randomUUID === "function") return window.crypto.randomUUID();
  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function loadStoredReviewSet(projectSlug = "", requestedReviewSessionId = "", activate = true): HydratedReviewSet | null {
  if (typeof window === "undefined") return null;
  try {
    const workbench = readWorkbench();
    const selectedProjectSlug = isSafeProjectSlug(projectSlug)
      ? projectSlug
      : Object.entries(workbench.projects).sort(([, left], [, right]) => right.updatedAt - left.updatedAt)[0]?.[0] ?? "";
    if (!selectedProjectSlug) return null;
    const project = workbench.projects[selectedProjectSlug];
    if (!project || !isReviewScreenshotSessionId(project.screenshotSessionId) || !Array.isArray(project.sets)) return null;
    if (!Number.isFinite(project.updatedAt) || project.updatedAt > Date.now() || Date.now() - project.updatedAt > STORAGE_TTL_MS) {
      delete workbench.projects[selectedProjectSlug];
      writeWorkbench(workbench);
      return null;
    }
    const reviewSessionId = isReviewSessionId(requestedReviewSessionId) ? requestedReviewSessionId : project.activeSetId;
    const stored = project.sets.find((set) => set.id === reviewSessionId) ?? project.sets[0];
    if (!stored || !isReviewSessionId(stored.id) || !Number.isFinite(stored.updatedAt) || !Array.isArray(stored.items)) return null;
    const items = hydrateItems(stored.items, project.screenshotSessionId, selectedProjectSlug);
    if (!items) {
      project.sets = project.sets.filter((set) => set.id !== stored.id);
      if (!project.sets.length) delete workbench.projects[selectedProjectSlug];
      else project.activeSetId = project.sets[0].id;
      writeWorkbench(workbench);
      return null;
    }
    if (activate && project.activeSetId !== stored.id) {
      project.activeSetId = stored.id;
      project.updatedAt = Date.now();
      writeWorkbench(workbench);
    }
    return {
      reviewSessionId: stored.id,
      name: normalizeSetName(stored.name),
      sessionId: project.screenshotSessionId,
      items,
      sessions: sessionSummaries({ ...project, activeSetId: activate ? stored.id : project.activeSetId })
    };
  } catch {
    return storageUnavailable();
  }
}

export function listStoredReviewSets(projectSlug: string): ReviewSetSessionSummary[] {
  if (typeof window === "undefined" || !isSafeProjectSlug(projectSlug)) return [];
  try {
    const project = readWorkbench().projects[projectSlug];
    return project && Array.isArray(project.sets) ? sessionSummaries(project) : [];
  } catch {
    return [];
  }
}

export function saveStoredReviewSet(
  projectSlug: string,
  reviewSessionId: string,
  name: string,
  screenshotSessionId: string,
  items: ReviewSetItem[],
  activate = true
) {
  if (
    typeof window === "undefined" ||
    !isSafeProjectSlug(projectSlug) ||
    !isReviewSessionId(reviewSessionId) ||
    !isReviewScreenshotSessionId(screenshotSessionId) ||
    items.length > REVIEW_SET_MAX_ITEMS ||
    items.some((item) => item.request.projectSlug !== projectSlug)
  ) return false;
  const normalizedName = normalizeSetName(name, "");
  if (!normalizedName) return false;
  try {
    const serializedItems = serializeItems(items);
    if (JSON.stringify(serializedItems).length > STORAGE_MAX_SET_CHARACTERS) return false;
    const workbench = readWorkbench();
    const existing = workbench.projects[projectSlug];
    if (existing && existing.screenshotSessionId !== screenshotSessionId) return false;
    const now = Date.now();
    const currentSets = Array.isArray(existing?.sets) ? existing.sets : [];
    const isNew = !currentSets.some((set) => set.id === reviewSessionId);
    if (isNew && currentSets.length >= STORAGE_MAX_SESSIONS_PER_PROJECT) return false;
    const sets = [
      ...currentSets.filter((set) => set.id !== reviewSessionId),
      { id: reviewSessionId, name: normalizedName, updatedAt: now, items: serializedItems }
    ].sort((left, right) => right.updatedAt - left.updatedAt).slice(0, STORAGE_MAX_SESSIONS_PER_PROJECT);
    const projects = Object.fromEntries(
      Object.entries(workbench.projects)
        .filter(([slug]) => slug !== projectSlug)
        .sort(([, left], [, right]) => Number(right.updatedAt) - Number(left.updatedAt))
        .slice(0, STORAGE_MAX_PROJECTS - 1)
    );
    projects[projectSlug] = {
      updatedAt: now,
      screenshotSessionId,
      activeSetId: activate ? reviewSessionId : existing?.activeSetId || reviewSessionId,
      sets
    };
    return writeWorkbench({ version: STORAGE_VERSION, projects });
  } catch {
    return false;
  }
}

export function deleteStoredReviewSet(projectSlug: string, reviewSessionId: string) {
  if (typeof window === "undefined" || !isSafeProjectSlug(projectSlug) || !isReviewSessionId(reviewSessionId)) return false;
  try {
    const workbench = readWorkbench();
    const project = workbench.projects[projectSlug];
    if (!project) return true;
    project.sets = project.sets.filter((set) => set.id !== reviewSessionId);
    if (!project.sets.length) {
      delete workbench.projects[projectSlug];
    } else {
      project.activeSetId = project.activeSetId === reviewSessionId ? project.sets[0].id : project.activeSetId;
      project.updatedAt = Date.now();
    }
    return writeWorkbench(workbench);
  } catch {
    return false;
  }
}

export function clearStoredReviewSet(projectSlug = "", reviewSessionId = "") {
  if (typeof window === "undefined") return true;
  try {
    if (!projectSlug) {
      window.localStorage.removeItem(STORAGE_KEY);
      return removeLegacyKeys();
    }
    if (reviewSessionId) return deleteStoredReviewSet(projectSlug, reviewSessionId);
    if (!isSafeProjectSlug(projectSlug)) return false;
    const workbench = readWorkbench();
    delete workbench.projects[projectSlug];
    return writeWorkbench(workbench);
  } catch {
    return false;
  }
}

export function createReviewSetBackup(input: {
  projectSlug: string;
  reviewSessionId: string;
  name: string;
  screenshotSessionId: string;
  items: ReviewSetItem[];
}) {
  if (!isSafeProjectSlug(input.projectSlug) || !isReviewSessionId(input.reviewSessionId) || !isReviewScreenshotSessionId(input.screenshotSessionId)) {
    throw new Error("This Review Set does not have a safe local identity.");
  }
  const backup: ReviewSetBackup = {
    schema: "canvas-helper-review-set-backup",
    version: BACKUP_VERSION,
    projectSlug: input.projectSlug,
    reviewSessionId: input.reviewSessionId,
    name: normalizeSetName(input.name),
    screenshotSessionId: input.screenshotSessionId,
    exportedAt: new Date().toISOString(),
    items: serializeItems(input.items)
  };
  const serialized = JSON.stringify(backup, null, 2);
  if (serialized.length > STORAGE_MAX_SET_CHARACTERS) throw new Error("This Review Set backup is too large.");
  return serialized;
}

export function parseReviewSetBackup(serialized: string, expectedProjectSlug: string, expectedScreenshotSessionId: string) {
  if (serialized.length > STORAGE_MAX_SET_CHARACTERS) throw new Error("This Review Set backup is too large.");
  const parsed = JSON.parse(serialized) as unknown;
  if (
    !isRecord(parsed) ||
    parsed.schema !== "canvas-helper-review-set-backup" ||
    parsed.version !== BACKUP_VERSION ||
    parsed.projectSlug !== expectedProjectSlug ||
    !isReviewSessionId(parsed.reviewSessionId) ||
    parsed.screenshotSessionId !== expectedScreenshotSessionId ||
    !isReviewScreenshotSessionId(parsed.screenshotSessionId) ||
    !Array.isArray(parsed.items)
  ) throw new Error("This backup does not belong to the active course and local screenshot session.");
  const items = hydrateItems(parsed.items, parsed.screenshotSessionId, expectedProjectSlug);
  if (!items) throw new Error("This Review Set backup contains invalid or unsafe items.");
  return { name: normalizeSetName(parsed.name, "Imported review"), items };
}
