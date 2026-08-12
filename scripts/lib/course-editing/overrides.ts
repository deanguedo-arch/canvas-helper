import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CourseEditPatch } from "../../../app/shared/course-editing.js";
import { applyPatchToEditableElement, collectEditableHtmlElements, decorateGeneratedCourseHtml } from "./html.js";

export const STUDIO_EDIT_OVERRIDES_FILE = "studio-edits.json";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function courseEditOverridesPath(repoRoot: string, projectSlug: string) {
  return path.join(repoRoot, "projects", projectSlug, "meta", STUDIO_EDIT_OVERRIDES_FILE);
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
      typeof entry.editId === "string" && /^che1:[a-f0-9]{24}$/.test(entry.editId) &&
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
  let html = decorateGeneratedCourseHtml(input.html, input.projectSlug, htmlPath);
  if (!applicable.length) return html;
  const unresolved = new Set(applicable.map((entry) => entry.editId));
  const initial = collectEditableHtmlElements(html, input.projectSlug, htmlPath);
  if (!initial) throw new Error("Studio could not map generated HTML for stored course edits.");
  const byEditId = new Map(initial.map((element) => [element.editId, element]));
  const operations = applicable.map((override) => {
    const element = byEditId.get(override.editId);
    if (!element || element.tagName !== override.tagName || element.pathKey !== override.pathKey) {
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
}) {
  const stored = await loadCourseEditOverrides(input.repoRoot, input.projectSlug);
  return applyCourseEditOverridesToHtml({
    html: input.html,
    projectSlug: input.projectSlug,
    htmlPath: input.htmlPath,
    overrides: stored.overrides
  });
}
