import {
  COURSE_EDIT_MAX_DRAFTS,
  isCourseEditDraft,
  type CourseEditDraft
} from "../../../shared/course-editing.js";

const STORAGE_KEY = "canvas-helper/course-edit-drafts-v1";
const STORAGE_VERSION = 1;
const MAX_PROJECTS = 40;
const TTL_MS = 7 * 24 * 60 * 60 * 1_000;

type StoredProjectDrafts = {
  projectSlug: string;
  updatedAt: number;
  drafts: CourseEditDraft[];
};

type StoredCourseEditDrafts = {
  version: typeof STORAGE_VERSION;
  projects: StoredProjectDrafts[];
};

function isSafeProjectSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9._-]*$/i.test(value) && value.length <= 160;
}

function readStorage(): StoredCourseEditDrafts {
  const empty: StoredCourseEditDrafts = { version: STORAGE_VERSION, projects: [] };
  if (typeof window === "undefined") return empty;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<StoredCourseEditDrafts> | null;
    if (!parsed || parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.projects)) return empty;
    const now = Date.now();
    const projects = parsed.projects
      .filter((entry): entry is StoredProjectDrafts => (
        Boolean(entry) &&
        isSafeProjectSlug(entry.projectSlug) &&
        typeof entry.updatedAt === "number" &&
        Number.isFinite(entry.updatedAt) &&
        entry.updatedAt <= now &&
        now - entry.updatedAt <= TTL_MS &&
        Array.isArray(entry.drafts) &&
        entry.drafts.length <= COURSE_EDIT_MAX_DRAFTS &&
        entry.drafts.every(isCourseEditDraft) &&
        entry.drafts.every((draft) => draft.identity.projectSlug === entry.projectSlug)
      ))
      .sort((left, right) => right.updatedAt - left.updatedAt)
      .slice(0, MAX_PROJECTS);
    return { version: STORAGE_VERSION, projects };
  } catch {
    return empty;
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

export function loadCourseEditDrafts(projectSlug: string) {
  if (!isSafeProjectSlug(projectSlug)) return [];
  return readStorage().projects.find((entry) => entry.projectSlug === projectSlug)?.drafts ?? [];
}

export function saveCourseEditDrafts(projectSlug: string, drafts: CourseEditDraft[]) {
  if (
    !isSafeProjectSlug(projectSlug) ||
    drafts.length > COURSE_EDIT_MAX_DRAFTS ||
    !drafts.every(isCourseEditDraft) ||
    !drafts.every((draft) => draft.identity.projectSlug === projectSlug)
  ) return false;
  const stored = readStorage();
  const remaining = stored.projects.filter((entry) => entry.projectSlug !== projectSlug);
  const projects = drafts.length
    ? [{ projectSlug, updatedAt: Date.now(), drafts }, ...remaining].slice(0, MAX_PROJECTS)
    : remaining;
  return writeStorage({ version: STORAGE_VERSION, projects });
}
