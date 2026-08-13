import {
  COURSE_EDIT_MAX_DRAFTS,
  isCourseEditDraft,
  isCourseEditPatch,
  isCourseEditTargetIdentity,
  type CourseEditDraft,
  type CourseEditPatch
} from "../../../shared/course-editing.js";

const STORAGE_KEY = "canvas-helper/course-edit-drafts-v2";
const LEGACY_STORAGE_KEY = "canvas-helper/course-edit-drafts-v1";
const STORAGE_VERSION = 2;
const MAX_PROJECTS = 40;

type StoredProjectDrafts = {
  projectSlug: string;
  updatedAt: number;
  drafts: CourseEditDraft[];
};

type StoredCourseEditDrafts = {
  version: typeof STORAGE_VERSION;
  projects: StoredProjectDrafts[];
};

export type CourseEditDraftLoadResult = {
  drafts: CourseEditDraft[];
  warnings: string[];
};

export type CourseEditDraftImportResult = CourseEditDraftLoadResult & {
  ok: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeProjectSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9._-]*$/i.test(value) && value.length <= 160;
}

function defaultStyle() {
  return {
    textStyle: "default",
    fontFamily: "default",
    fontSize: "default",
    textTone: "default",
    alignment: "default",
    spacing: "default"
  } as const;
}

function legacyDraft(value: unknown): CourseEditDraft | null {
  if (!isRecord(value) || !isCourseEditTargetIdentity(value.identity) || !isCourseEditPatch(value.patch)) return null;
  const allowed = new Set(["id", "createdAt", "updatedAt", "identity", "beforeText", "afterText", "patch"]);
  if (Object.keys(value).some((key) => !allowed.has(key))) return null;
  if (
    typeof value.id !== "string" || !/^[A-Za-z0-9._-]+$/.test(value.id) ||
    typeof value.createdAt !== "number" || !Number.isFinite(value.createdAt) ||
    typeof value.updatedAt !== "number" || !Number.isFinite(value.updatedAt) ||
    typeof value.beforeText !== "string" || typeof value.afterText !== "string"
  ) return null;
  const patch = value.patch as CourseEditPatch;
  const tagName = value.identity.tagName;
  const styleKeys = Object.keys(patch.style ?? {}) as Array<keyof NonNullable<CourseEditPatch["style"]>>;
  return {
    id: value.id,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    identity: value.identity,
    beforeText: value.beforeText.slice(0, 24_000),
    afterText: value.afterText.slice(0, 24_000),
    baseline: {
      originalHtml: value.beforeText.slice(0, 24_000),
      attributes: { href: "", src: "", alt: "", title: "" },
      currentStyle: defaultStyle(),
      capabilities: {
        richText: tagName !== "img",
        link: tagName === "a",
        image: tagName === "img",
        styles: styleKeys.length > 0,
        styleKeys
      }
    },
    patch
  };
}

function parseStored(raw: string | null): { stored: StoredCourseEditDrafts; warnings: string[] } {
  const empty: StoredCourseEditDrafts = { version: STORAGE_VERSION, projects: [] };
  if (!raw) return { stored: empty, warnings: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || !Array.isArray(parsed.projects) || (parsed.version !== STORAGE_VERSION && parsed.version !== 1)) {
      return { stored: empty, warnings: ["Saved course-edit drafts could not be read because their format is invalid."] };
    }
    const warnings: string[] = [];
    const projects: StoredProjectDrafts[] = [];
    for (const entry of parsed.projects) {
      if (!isRecord(entry) || !isSafeProjectSlug(entry.projectSlug) || typeof entry.updatedAt !== "number" || !Array.isArray(entry.drafts)) {
        warnings.push("One invalid saved course-edit project was skipped.");
        continue;
      }
      const drafts = entry.drafts
        .map((draft) => isCourseEditDraft(draft) ? draft : parsed.version === 1 ? legacyDraft(draft) : null)
        .filter((draft): draft is CourseEditDraft => Boolean(draft))
        .filter((draft) => draft.identity.projectSlug === entry.projectSlug)
        .slice(0, COURSE_EDIT_MAX_DRAFTS);
      if (drafts.length !== entry.drafts.length) warnings.push(`Some invalid drafts for ${entry.projectSlug} were skipped.`);
      if (drafts.length) projects.push({ projectSlug: entry.projectSlug, updatedAt: entry.updatedAt, drafts });
    }
    projects.sort((left, right) => right.updatedAt - left.updatedAt);
    if (projects.length > MAX_PROJECTS) warnings.push(`Only the ${MAX_PROJECTS} most recent course draft sets were kept.`);
    if (parsed.version === 1 && projects.length) {
      warnings.push("Older drafts were recovered. Reopen each one before applying if it contains a link, image, or style-only change.");
    }
    return { stored: { version: STORAGE_VERSION, projects: projects.slice(0, MAX_PROJECTS) }, warnings };
  } catch {
    return { stored: empty, warnings: ["Saved course-edit drafts were corrupt and were not loaded."] };
  }
}

function readStorage() {
  const empty = { stored: { version: STORAGE_VERSION, projects: [] } as StoredCourseEditDrafts, warnings: [] as string[] };
  if (typeof window === "undefined") return empty;
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    return parseStored(current ?? window.localStorage.getItem(LEGACY_STORAGE_KEY));
  } catch {
    return { ...empty, warnings: ["Browser storage is unavailable, so course-edit drafts can only remain in this tab."] };
  }
}

function writeStorage(value: StoredCourseEditDrafts) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadCourseEditDraftState(projectSlug: string): CourseEditDraftLoadResult {
  if (!isSafeProjectSlug(projectSlug)) return { drafts: [], warnings: ["The selected project name is not safe for draft storage."] };
  const { stored, warnings } = readStorage();
  return {
    drafts: stored.projects.find((entry) => entry.projectSlug === projectSlug)?.drafts ?? [],
    warnings
  };
}

export function loadCourseEditDrafts(projectSlug: string) {
  return loadCourseEditDraftState(projectSlug).drafts;
}

export function saveCourseEditDrafts(projectSlug: string, drafts: CourseEditDraft[]) {
  if (
    !isSafeProjectSlug(projectSlug) ||
    drafts.length > COURSE_EDIT_MAX_DRAFTS ||
    !drafts.every(isCourseEditDraft) ||
    !drafts.every((draft) => draft.identity.projectSlug === projectSlug)
  ) return false;
  const stored = readStorage().stored;
  const remaining = stored.projects.filter((entry) => entry.projectSlug !== projectSlug);
  const projects = drafts.length
    ? [{ projectSlug, updatedAt: Date.now(), drafts }, ...remaining].slice(0, MAX_PROJECTS)
    : remaining;
  return writeStorage({ version: STORAGE_VERSION, projects });
}

export function exportCourseEditDrafts(projectSlug: string) {
  const state = loadCourseEditDraftState(projectSlug);
  return `${JSON.stringify({
    kind: "canvas-helper-course-edit-drafts",
    version: 1,
    projectSlug,
    exportedAt: new Date().toISOString(),
    drafts: state.drafts
  }, null, 2)}\n`;
}

export function importCourseEditDrafts(projectSlug: string, source: string): CourseEditDraftImportResult {
  if (!isSafeProjectSlug(projectSlug) || source.length > 2_000_000) {
    return { ok: false, drafts: [], warnings: ["This draft backup is too large or belongs to an invalid project."] };
  }
  try {
    const parsed = JSON.parse(source) as unknown;
    if (
      !isRecord(parsed) || parsed.kind !== "canvas-helper-course-edit-drafts" || parsed.version !== 1 ||
      parsed.projectSlug !== projectSlug || !Array.isArray(parsed.drafts) ||
      parsed.drafts.length > COURSE_EDIT_MAX_DRAFTS || !parsed.drafts.every(isCourseEditDraft) ||
      !parsed.drafts.every((draft) => draft.identity.projectSlug === projectSlug)
    ) {
      return { ok: false, drafts: [], warnings: ["This is not a valid draft backup for the selected course."] };
    }
    if (!saveCourseEditDrafts(projectSlug, parsed.drafts)) {
      return { ok: false, drafts: parsed.drafts, warnings: ["The backup is valid, but browser storage is unavailable."] };
    }
    return { ok: true, drafts: parsed.drafts, warnings: [] };
  } catch {
    return { ok: false, drafts: [], warnings: ["The selected draft backup is not valid JSON."] };
  }
}
