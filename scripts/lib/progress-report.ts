import { readFile } from "node:fs/promises";
import path from "node:path";

import { fileExists } from "./fs.js";

export type ProgressCompletionItem = {
  id: string;
  title?: string;
  type?: string;
  moduleId?: string;
  moduleTitle?: string;
  required?: boolean;
};

export type ProgressSummary = {
  percentComplete: number;
  completedCount: number;
  requiredCount: number;
  completedItemIds: string[];
  lastActivityId?: string;
  updatedAt: string;
};

export type ProgressReportRow = {
  courseSlug: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  percentComplete: number;
  completedCount: number;
  requiredCount: number;
  lastActivityId: string;
  lastActive: string;
};

type ExtractProgressSummaryOptions = {
  state: unknown;
  reportSnapshot?: unknown;
  requiredItems?: ProgressCompletionItem[];
  now?: Date | string;
};

type CourseShellData = {
  modules?: Array<{
    id?: unknown;
    title?: unknown;
    moduleVisibilityLabel?: unknown;
    activities?: Array<{
      id?: unknown;
      title?: unknown;
      kind?: unknown;
      type?: unknown;
      moduleTitle?: unknown;
      moduleVisibilityLabel?: unknown;
      resourceKind?: unknown;
      required?: unknown;
      hidden?: unknown;
    }>;
  }>;
};

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string | number }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { bytesValue: string }
  | { referenceValue: string }
  | { geoPointValue: { latitude: number; longitude: number } }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

export type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

const COMPLETION_ARRAY_FIELDS = new Set([
  "completedactivityids",
  "completedids",
  "completeditemids",
  "completedlessonids",
  "completedquizids"
]);

const COMPLETION_MAP_FIELDS = new Set([
  "completedactivitybyid",
  "completedbyid",
  "completeditembyid",
  "completeditemsbyid",
  "completedlessonbyid",
  "completedquizbyid"
]);

const EXCLUDED_ACTIVITY_KINDS = new Set(["overview", "resource", "resources", "teacher-resource", "reference"]);
const INCLUDED_ACTIVITY_KINDS = new Set(["activity", "assessment", "checkpoint", "interactive", "lesson", "page", "quiz", "task"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeUpdatedAt(now: Date | string | undefined) {
  if (typeof now === "string") {
    return now;
  }
  return (now ?? new Date()).toISOString();
}

export function normalizeRequiredCompletionItems(items: ProgressCompletionItem[] = []) {
  const seen = new Set<string>();
  const normalized: ProgressCompletionItem[] = [];

  for (const item of items) {
    const id = getString(item.id);
    if (!id || seen.has(id) || item.required === false) {
      continue;
    }

    seen.add(id);
    normalized.push({
      id,
      moduleId: getString(item.moduleId) || undefined,
      moduleTitle: getString(item.moduleTitle) || undefined,
      required: true,
      title: getString(item.title) || id,
      type: getString(item.type) || "activity"
    });
  }

  return normalized;
}

function addCompletedMapIds(value: unknown, completedIds: Set<string>) {
  if (!isRecord(value)) {
    return;
  }

  for (const [id, completionValue] of Object.entries(value)) {
    if (completionValue === true) {
      completedIds.add(id);
      continue;
    }

    if (isRecord(completionValue)) {
      const status = getString(completionValue.status).toLowerCase();
      if (completionValue.completed === true || status === "complete" || status === "completed") {
        completedIds.add(id);
      }
    }
  }
}

function addCompletedArrayIds(value: unknown, completedIds: Set<string>) {
  if (!Array.isArray(value)) {
    return;
  }

  for (const entry of value) {
    if (typeof entry === "string" && entry.trim()) {
      completedIds.add(entry.trim());
      continue;
    }

    if (isRecord(entry)) {
      const id = getString(entry.id);
      const status = getString(entry.status).toLowerCase();
      if (id && entry.completed !== false && status !== "incomplete" && status !== "pending") {
        completedIds.add(id);
      }
    }
  }
}

function collectCompletedItemIds(value: unknown, completedIds = new Set<string>(), visited = new WeakSet<object>()) {
  if (!value || typeof value !== "object") {
    return completedIds;
  }

  if (visited.has(value)) {
    return completedIds;
  }
  visited.add(value);

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectCompletedItemIds(entry, completedIds, visited);
    }
    return completedIds;
  }

  for (const [key, child] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();
    if (COMPLETION_MAP_FIELDS.has(normalizedKey)) {
      addCompletedMapIds(child, completedIds);
      continue;
    }

    if (COMPLETION_ARRAY_FIELDS.has(normalizedKey) || (normalizedKey.startsWith("completed") && Array.isArray(child))) {
      addCompletedArrayIds(child, completedIds);
      continue;
    }

    collectCompletedItemIds(child, completedIds, visited);
  }

  return completedIds;
}

function findFirstStringField(value: unknown, fieldNames: string[], visited = new WeakSet<object>()): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  if (visited.has(value)) {
    return undefined;
  }
  visited.add(value);

  if (isRecord(value)) {
    for (const fieldName of fieldNames) {
      const candidate = getString(value[fieldName]);
      if (candidate) {
        return candidate;
      }
    }

    for (const child of Object.values(value)) {
      const found = findFirstStringField(child, fieldNames, visited);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findFirstStringField(child, fieldNames, visited);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

function extractSnapshotObject(reportSnapshot: unknown, state: unknown) {
  if (isRecord(reportSnapshot)) {
    return reportSnapshot;
  }

  if (isRecord(state) && isRecord(state.reportSnapshot)) {
    return state.reportSnapshot;
  }

  if (isRecord(state)) {
    for (const value of Object.values(state)) {
      if (isRecord(value) && isRecord(value.reportSnapshot)) {
        return value.reportSnapshot;
      }
    }
  }

  return null;
}

export function extractProgressSummary(options: ExtractProgressSummaryOptions): ProgressSummary {
  const requiredItems = normalizeRequiredCompletionItems(options.requiredItems);
  const completedIds = collectCompletedItemIds(options.state);
  const snapshot = extractSnapshotObject(options.reportSnapshot, options.state);

  if (snapshot) {
    collectCompletedItemIds(snapshot, completedIds);
  }

  const updatedAt = normalizeUpdatedAt(options.now);
  const lastActivityId =
    findFirstStringField(snapshot, ["lastActivityId", "lastCompletedItemId"]) ??
    findFirstStringField(options.state, ["lastActivityId", "lastCompletedItemId", "selectedActivityId"]);

  if (requiredItems.length > 0) {
    const completedItemIds = requiredItems.filter((item) => completedIds.has(item.id)).map((item) => item.id);
    const requiredCount = requiredItems.length;
    const snapshotCompletedCount = snapshot ? getNumber(snapshot.completedCount) : null;
    const snapshotPercent = snapshot
      ? getNumber(snapshot.percentComplete) ?? getNumber(snapshot.progressPercent) ?? getNumber(snapshot.completionPercent)
      : null;
    const completedCount =
      completedItemIds.length === 0 && snapshotCompletedCount !== null
        ? Math.max(0, Math.min(requiredCount, Math.round(snapshotCompletedCount)))
        : completedItemIds.length;
    return {
      completedCount,
      completedItemIds,
      lastActivityId,
      percentComplete:
        completedItemIds.length === 0 && snapshotPercent !== null
          ? clampPercent(snapshotPercent)
          : clampPercent((completedCount / requiredCount) * 100),
      requiredCount,
      updatedAt
    };
  }

  const snapshotCompletedCount = snapshot ? getNumber(snapshot.completedCount) : null;
  const snapshotRequiredCount = snapshot
    ? getNumber(snapshot.requiredCount) ?? getNumber(snapshot.totalCount) ?? getNumber(snapshot.totalItems)
    : null;
  const snapshotPercent = snapshot
    ? getNumber(snapshot.percentComplete) ?? getNumber(snapshot.progressPercent) ?? getNumber(snapshot.completionPercent)
    : null;

  if (snapshotCompletedCount !== null || snapshotRequiredCount !== null || snapshotPercent !== null) {
    const completedCount = Math.max(0, Math.round(snapshotCompletedCount ?? completedIds.size));
    const requiredCount = Math.max(0, Math.round(snapshotRequiredCount ?? 0));
    const percentComplete =
      snapshotPercent !== null
        ? clampPercent(snapshotPercent)
        : requiredCount > 0
          ? clampPercent((completedCount / requiredCount) * 100)
          : 0;

    return {
      completedCount,
      completedItemIds: [...completedIds].sort(),
      lastActivityId,
      percentComplete,
      requiredCount,
      updatedAt
    };
  }

  return {
    completedCount: completedIds.size,
    completedItemIds: [...completedIds].sort(),
    lastActivityId,
    percentComplete: 0,
    requiredCount: 0,
    updatedAt
  };
}

function isStudentFacingActivity(activity: NonNullable<NonNullable<CourseShellData["modules"]>[number]["activities"]>[number]) {
  if (activity.required === false || activity.hidden === true) {
    return false;
  }

  const id = getString(activity.id);
  if (!id) {
    return false;
  }

  const title = getString(activity.title).toLowerCase();
  if (/student resource materials?|student resources?|teacher resources?|course information/.test(title)) {
    return false;
  }

  const moduleVisibility = getString(activity.moduleVisibilityLabel).toLowerCase();
  if (moduleVisibility === "hidden") {
    return false;
  }

  const kind = getString(activity.kind || activity.type).toLowerCase();
  if (EXCLUDED_ACTIVITY_KINDS.has(kind)) {
    return false;
  }

  if (INCLUDED_ACTIVITY_KINDS.has(kind)) {
    return true;
  }

  const resourceKind = getString(activity.resourceKind).toLowerCase();
  return resourceKind === "quiz" || resourceKind === "html";
}

export function buildRequiredCompletionItemsFromCourseShellData(courseData: CourseShellData) {
  const items: ProgressCompletionItem[] = [];

  for (const moduleEntry of courseData.modules ?? []) {
    const moduleId = getString(moduleEntry.id);
    const moduleTitle = getString(moduleEntry.title);
    const moduleVisibility = getString(moduleEntry.moduleVisibilityLabel).toLowerCase();
    if (moduleVisibility === "hidden") {
      continue;
    }

    for (const activity of moduleEntry.activities ?? []) {
      if (!isStudentFacingActivity(activity)) {
        continue;
      }

      items.push({
        id: getString(activity.id),
        moduleId: moduleId || undefined,
        moduleTitle: moduleTitle || getString(activity.moduleTitle) || undefined,
        required: true,
        title: getString(activity.title) || getString(activity.id),
        type: getString(activity.kind || activity.type || activity.resourceKind) || "activity"
      });
    }
  }

  return normalizeRequiredCompletionItems(items);
}

function parseCourseShellDataSource(source: string) {
  const jsonLike = source
    .trim()
    .replace(/^export\s+default\s+/, "")
    .replace(/;\s*$/, "");
  return JSON.parse(jsonLike) as CourseShellData;
}

export async function loadRequiredCompletionItemsFromWorkspace(workspaceDir: string) {
  const candidatePath = path.join(workspaceDir, "course-shell-data.js");
  if (!(await fileExists(candidatePath))) {
    return [];
  }

  try {
    const source = await readFile(candidatePath, "utf8");
    return buildRequiredCompletionItemsFromCourseShellData(parseCourseShellDataSource(source));
  } catch {
    return [];
  }
}

export function decodeFirestoreValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) {
    return null;
  }
  if ("booleanValue" in value) {
    return value.booleanValue;
  }
  if ("integerValue" in value) {
    return Number(value.integerValue);
  }
  if ("doubleValue" in value) {
    return value.doubleValue;
  }
  if ("timestampValue" in value) {
    return value.timestampValue;
  }
  if ("stringValue" in value) {
    return value.stringValue;
  }
  if ("bytesValue" in value) {
    return value.bytesValue;
  }
  if ("referenceValue" in value) {
    return value.referenceValue;
  }
  if ("geoPointValue" in value) {
    return value.geoPointValue;
  }
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map((entry) => decodeFirestoreValue(entry));
  }
  if ("mapValue" in value) {
    const decoded: Record<string, unknown> = {};
    for (const [fieldName, fieldValue] of Object.entries(value.mapValue.fields ?? {})) {
      decoded[fieldName] = decodeFirestoreValue(fieldValue);
    }
    return decoded;
  }
  return null;
}

export function decodeFirestoreDocument(document: FirestoreDocument) {
  const decoded: Record<string, unknown> = {};
  for (const [fieldName, fieldValue] of Object.entries(document.fields ?? {})) {
    decoded[fieldName] = decodeFirestoreValue(fieldValue);
  }
  return decoded;
}

export function progressDocumentToRow(courseSlug: string, document: FirestoreDocument): ProgressReportRow {
  const decoded = decodeFirestoreDocument(document);
  const progressSummary = isRecord(decoded.progressSummary) ? decoded.progressSummary : {};
  const studentId = getString(decoded.userId) || getString(decoded.studentId) || document.name.split("/").pop() || "";
  const savedAt = getString(decoded.savedAt) || getString(decoded.updatedAt) || document.updateTime || "";

  return {
    completedCount: Math.max(0, Math.round(getNumber(progressSummary.completedCount) ?? 0)),
    courseSlug: getString(decoded.projectSlug) || getString(decoded.courseSlug) || courseSlug,
    lastActive: getString(progressSummary.updatedAt) || savedAt,
    lastActivityId: getString(progressSummary.lastActivityId),
    percentComplete: clampPercent(getNumber(progressSummary.percentComplete) ?? 0),
    requiredCount: Math.max(0, Math.round(getNumber(progressSummary.requiredCount) ?? 0)),
    studentEmail: getString(decoded.userEmail) || getString(decoded.studentEmail),
    studentId,
    studentName: getString(decoded.userName) || getString(decoded.studentName)
  };
}

function csvEscape(value: unknown) {
  const text = value === null || typeof value === "undefined" ? "" : String(value);
  if (!/[",\r\n]/.test(text)) {
    return text;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

export function progressRowsToCsv(rows: ProgressReportRow[]) {
  const headers = [
    "studentName",
    "studentEmail",
    "studentId",
    "courseSlug",
    "percentComplete",
    "completedCount",
    "requiredCount",
    "lastActivityId",
    "lastActive"
  ];

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.studentName,
        row.studentEmail,
        row.studentId,
        row.courseSlug,
        row.percentComplete,
        row.completedCount,
        row.requiredCount,
        row.lastActivityId,
        row.lastActive
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return `${lines.join("\n")}\n`;
}
