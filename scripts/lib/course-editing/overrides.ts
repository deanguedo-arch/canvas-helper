import { copyFile, lstat, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CourseEditPatch } from "../../../app/shared/course-editing.js";
import { applyPatchToEditableElement, collectEditableHtmlElements, decorateGeneratedCourseHtml } from "./html.js";

export const STUDIO_EDIT_OVERRIDES_FILE = "studio-edits.json";
export const STUDIO_COURSE_FILE = "studio-course.json";
export const STUDIO_COURSE_TITLE_ATTRIBUTE = "data-canvas-helper-course-title";
export const STUDIO_COURSE_TITLE_RUNTIME_MARKER = "data-canvas-helper-course-title";

export type StoredCourseEditOverride = {
  editId: string;
  htmlPath: string;
  tagName: string;
  pathKey: string;
  patch: CourseEditPatch;
  updatedAt: string;
};

export type StoredCourseEditOverrides = {
  schemaVersion: 1;
  projectSlug: string;
  updatedAt: string;
  overrides: StoredCourseEditOverride[];
};

export type StoredStudioCourse = {
  schemaVersion: 1;
  projectSlug: string;
  title: string;
  updatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function courseEditOverridesPath(repoRoot: string, projectSlug: string) {
  return path.join(repoRoot, "projects", projectSlug, "meta", STUDIO_EDIT_OVERRIDES_FILE);
}

export function studioCoursePath(repoRoot: string, projectSlug: string) {
  return path.join(repoRoot, "projects", projectSlug, "meta", STUDIO_COURSE_FILE);
}

export async function loadStoredStudioCourse(repoRoot: string, projectSlug: string): Promise<StoredStudioCourse | null> {
  try {
    const value = JSON.parse(await readFile(studioCoursePath(repoRoot, projectSlug), "utf8")) as unknown;
    if (
      !isRecord(value) || value.schemaVersion !== 1 || value.projectSlug !== projectSlug ||
      typeof value.title !== "string" || !value.title.trim() || value.title.length > 160 || typeof value.updatedAt !== "string"
    ) throw new Error("Invalid stored Studio course metadata.");
    return value as StoredStudioCourse;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function saveStoredStudioCourse(repoRoot: string, value: StoredStudioCourse) {
  const target = studioCoursePath(repoRoot, value.projectSlug);
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.studio-edit-${process.pid}-${Date.now()}`;
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}

function escapedHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function applyStoredCourseTitleToHtml(html: string, title: string) {
  const escaped = escapedHtml(title);
  return html.replace(
    new RegExp(`(<(title|h1|h2|h3)\\b[^>]*\\b${STUDIO_COURSE_TITLE_ATTRIBUTE}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?[^>]*>)[\\s\\S]*?(<\\/\\2\\s*>)`, "gi"),
    (_match, opening: string, _tagName: string, closing: string) => `${opening}${escaped}${closing}`
  );
}

export function applyStoredCourseTitleToRuntimeData(source: string, title: string) {
  return source.replace(
    /(\/\*\s*data-canvas-helper-course-title\s*\*\/\s*)"(?:\\.|[^"\\])*"/g,
    (_match, marker: string) => `${marker}${JSON.stringify(title)}`
  );
}

export async function loadCourseEditOverrides(repoRoot: string, projectSlug: string): Promise<StoredCourseEditOverrides> {
  const filePath = courseEditOverridesPath(repoRoot, projectSlug);
  try {
    const value = JSON.parse(await readFile(filePath, "utf8")) as unknown;
    if (!isRecord(value) || value.schemaVersion !== 1 || value.projectSlug !== projectSlug || !Array.isArray(value.overrides)) {
      throw new Error(`Invalid Studio edit overrides at ${filePath}.`);
    }
    const overrides = value.overrides.filter((entry): entry is StoredCourseEditOverride => (
      isRecord(entry) &&
      typeof entry.editId === "string" && /^che[12]:[a-f0-9]{24}$/.test(entry.editId) &&
      typeof entry.htmlPath === "string" &&
      typeof entry.tagName === "string" &&
      typeof entry.pathKey === "string" &&
      isRecord(entry.patch) &&
      typeof entry.updatedAt === "string"
    ));
    if (overrides.length !== value.overrides.length) throw new Error(`Invalid Studio edit override entry at ${filePath}.`);
    return {
      schemaVersion: 1,
      projectSlug,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
      overrides
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { schemaVersion: 1, projectSlug, updatedAt: new Date(0).toISOString(), overrides: [] };
    }
    throw error;
  }
}

export async function saveCourseEditOverrides(repoRoot: string, value: StoredCourseEditOverrides) {
  const target = courseEditOverridesPath(repoRoot, value.projectSlug);
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.studio-edit-${process.pid}-${Date.now()}`;
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}

export function applyCourseEditOverridesToHtml(input: {
  html: string;
  projectSlug: string;
  htmlPath?: string;
  overrides: StoredCourseEditOverride[];
}) {
  const htmlPath = input.htmlPath ?? "index.html";
  const applicable = input.overrides.filter((entry) => entry.htmlPath === htmlPath);
  const needsStyles = applicable.some((entry) => (
    entry.patch.style && Object.values(entry.patch.style).some((value) => value !== undefined && value !== "default")
  ));
  let html = decorateGeneratedCourseHtml(input.html, input.projectSlug, htmlPath, needsStyles);
  if (!applicable.length) return html;
  const unresolved = new Set(applicable.map((entry) => entry.editId));
  const initial = collectEditableHtmlElements(html, input.projectSlug, htmlPath);
  if (!initial) throw new Error("Studio could not map generated HTML for stored course edits.");
  const byEditId = new Map(initial.map((element) => [element.editId, element]));
  const operations = applicable.map((override) => {
    const element = byEditId.get(override.editId) ?? (
      override.editId.startsWith("che1:")
        ? initial.find((candidate) => candidate.pathKey === override.pathKey && candidate.tagName === override.tagName)
        : undefined
    );
    if (!element || element.tagName !== override.tagName || (override.editId.startsWith("che1:") && element.pathKey !== override.pathKey)) {
      return null;
    }
    unresolved.delete(override.editId);
    return { override, element };
  }).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const sourceOrder = [...operations].sort((left, right) => left.element.sourceStart - right.element.sourceStart);
  for (let index = 0; index < sourceOrder.length - 1; index += 1) {
    if (sourceOrder[index + 1].element.sourceStart < sourceOrder[index].element.sourceEnd) {
      throw new Error("Stored Studio edits overlap. Remove either the larger edit or its nested edit before rebuilding this course.");
    }
  }
  operations.sort((left, right) => right.element.sourceStart - left.element.sourceStart);
  for (const { override, element } of operations) {
    html = applyPatchToEditableElement(html, element, override.patch, override.editId);
  }
  if (unresolved.size) {
    throw new Error(`Stored Studio edits no longer match generated course content: ${[...unresolved].join(", ")}`);
  }
  return html;
}

export async function applyStoredCourseEdits(input: {
  repoRoot: string;
  projectSlug: string;
  html: string;
  htmlPath?: string;
  workspaceDir?: string;
}) {
  if (input.workspaceDir) await syncStoredCourseEditAssets(input.repoRoot, input.projectSlug, input.workspaceDir);
  const [stored, course] = await Promise.all([
    loadCourseEditOverrides(input.repoRoot, input.projectSlug),
    loadStoredStudioCourse(input.repoRoot, input.projectSlug)
  ]);
  const edited = applyCourseEditOverridesToHtml({
    html: input.html,
    projectSlug: input.projectSlug,
    htmlPath: input.htmlPath,
    overrides: stored.overrides
  });
  return course ? applyStoredCourseTitleToHtml(edited, course.title) : edited;
}

export async function syncStoredCourseEditAssets(repoRoot: string, projectSlug: string, workspaceDir: string) {
  const source = path.join(repoRoot, "projects", "resources", projectSlug, "studio-assets");
  let entries;
  try {
    const sourceStats = await lstat(source);
    if (!sourceStats.isDirectory() || sourceStats.isSymbolicLink()) throw new Error("Stored Studio assets must use a real canonical resource directory.");
    entries = await readdir(source, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  const destination = path.join(workspaceDir, "assets", "custom", "studio");
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  for (const entry of entries) {
    if (!entry.isFile() || !/^[a-f0-9]{24}\.(?:png|jpg|gif)$/.test(entry.name)) {
      throw new Error(`Invalid stored Studio image asset: ${entry.name}`);
    }
    const filePath = path.join(source, entry.name);
    const stats = await lstat(filePath);
    if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("Stored Studio image assets cannot use symbolic links.");
    await copyFile(filePath, path.join(destination, entry.name));
  }
}
