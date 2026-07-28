import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { createReadStream } from "node:fs";
import { access, copyFile, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import JSZip from "jszip";

import {
  ELA20_COURSE_ID,
  ELA20_UNIT_SEEDS,
  createEla20CourseManifest,
  createEla20RecipeSeeds,
  getEla20TeacherResourceMap
} from "./course-seeds.js";
import {
  ELA10_COURSE_ID,
  ELA10_UNIT_SEEDS,
  createEla10CourseManifest,
  createEla10RecipeSeeds,
  getEla10TeacherResourceMap
} from "./ela10-course-seeds.js";
import {
  createEla2CourseManifest,
  createEla2RecipeSeeds,
  getEla2TeacherResourceMap,
  getEla2UnitSeeds,
  isEla2CourseId
} from "./ela2-course-seeds.js";
import { parseEnglishCourseManifest, parseEnglishUnitRecipe } from "./schema.js";
import type { EnglishCourseArchiveV1, EnglishCourseManifestV1 } from "./types.js";
import type { EnglishUnitRecipe } from "./types.js";
import type { EnglishUnitSeed } from "./course-seeds.js";

export type EnglishInventoryEntryV1 = {
  path: string;
  isDirectory: boolean;
  extension: string;
};

export type EnglishArchiveInventoryV1 = {
  archiveId: string;
  path: string;
  sha256: string;
  entries: EnglishInventoryEntryV1[];
};

export type EnglishCourseInventoryV1 = {
  schemaVersion: 1;
  courseId: string;
  generatedAt: string;
  archives: EnglishArchiveInventoryV1[];
};

export type EnglishMappingStatus =
  | "placed"
  | "excluded"
  | "review-required"
  | "reference-only"
  | "metadata"
  | "missing";

export type EnglishCourseMappingEntryV1 = {
  archiveId: string;
  path: string;
  status: EnglishMappingStatus;
  classification: string;
  reason: string;
  projectSlug?: string;
  resourceId?: string;
  brightspaceItemIds?: string[];
};

export type EnglishCourseMappingReportV1 = {
  schemaVersion: 1;
  courseId: string;
  generatedAt: string;
  summary: Record<EnglishMappingStatus, number>;
  entries: EnglishCourseMappingEntryV1[];
};

export type EnglishRecipeIntakeAction = {
  projectSlug: string;
  path: string;
  status: "created" | "preserved-existing" | "preserved-invalid" | "missing-existing";
  note: string;
};

export type EnglishCourseIntakeResult = {
  courseId: string;
  manifestPath: string;
  inventoryPath: string;
  mappingJsonPath: string;
  mappingMarkdownPath: string;
  archives: EnglishCourseArchiveV1[];
  recipes: EnglishRecipeIntakeAction[];
  summary: EnglishCourseMappingReportV1["summary"];
};

type BrightspaceItemRecord = {
  itemId: string;
  title: string;
  href?: string;
  ancestorIds: string[];
  topLevelId: string;
};

type LoadedArchive = {
  archive: EnglishCourseArchiveV1;
  recipeArchivePath: string;
  zip: JSZip;
  inventory: EnglishArchiveInventoryV1;
};

type LoadedSupplement = {
  archive: EnglishCourseArchiveV1;
  inventory: EnglishArchiveInventoryV1;
  mapping: EnglishCourseMappingEntryV1;
};

const execFile = promisify(execFileCallback);
const MAX_JSZIP_SOURCE_BYTES = 1_750_000_000;

const mathTopFolders = new Set([
  "face_to_face_exams",
  "factors_and_products",
  "linear_functions",
  "measurement",
  "relations_functions",
  "roots_powers",
  "systems",
  "trigonometry"
]);

function normalizeZipPath(value: string) {
  return value.replace(/\\/g, "/").replace(/^\.\//, "");
}

function repoRelative(repoRoot: string, targetPath: string) {
  return normalizeZipPath(path.relative(repoRoot, targetPath));
}

function isMissingError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error && typeof error === "object" && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT");
}

async function exists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch (error) {
    if (isMissingError(error)) return false;
    throw error;
  }
}

async function sha256File(filePath: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

async function writeJsonAtomic(targetPath: string, value: unknown) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await rename(temporaryPath, targetPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

async function writeTextAtomic(targetPath: string, value: string) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(temporaryPath, value, "utf8");
    await rename(temporaryPath, targetPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

async function importArchive(input: {
  repoRoot: string;
  sourcePath: string;
  archiveId: "brightspace" | "teacher-resources";
  courseId: string;
  importedAt: string;
}): Promise<LoadedArchive> {
  const sourcePath = path.resolve(input.sourcePath);
  if (!(await exists(sourcePath))) throw new Error(`Missing ${input.archiveId} ZIP: ${sourcePath}`);
  const digest = await sha256File(sourcePath);
  const sourcesDir = path.join(input.repoRoot, "projects", "resources", input.courseId, "_sources");
  const canonicalPath = path.join(sourcesDir, `${digest}.zip`);
  await mkdir(sourcesDir, { recursive: true });

  if (await exists(canonicalPath)) {
    const canonicalDigest = await sha256File(canonicalPath);
    if (canonicalDigest !== digest) {
      throw new Error(`Canonical archive hash mismatch: ${canonicalPath}`);
    }
  } else {
    await copyFile(sourcePath, canonicalPath);
  }

  const sourceSize = (await stat(canonicalPath)).size;
  let recipeArchivePath = canonicalPath;
  let inventoryNames: string[] | undefined;
  if (sourceSize > MAX_JSZIP_SOURCE_BYTES) {
    const normalizedPath = path.join(sourcesDir, `${digest}.normalized.zip`);
    if (!(await exists(normalizedPath))) {
      const stagingDir = path.join(sourcesDir, `.normalize-${digest.slice(0, 12)}-${process.pid}`);
      await rm(stagingDir, { recursive: true, force: true });
      await mkdir(stagingDir, { recursive: true });
      try {
        await execFile("/usr/bin/tar", [
          "-xf", canonicalPath, "-C", stagingDir,
          "--exclude", "*.mp4", "--exclude", "*.MP4",
          "--exclude", "*.mp3", "--exclude", "*.MP3",
          "--exclude", "*.wav", "--exclude", "*.WAV"
        ], { maxBuffer: 64 * 1024 * 1024 });
        await execFile("/usr/bin/zip", ["-qr", normalizedPath, "."], {
          cwd: stagingDir,
          maxBuffer: 64 * 1024 * 1024
        });
      } finally {
        await rm(stagingDir, { recursive: true, force: true });
      }
    }
    recipeArchivePath = normalizedPath;
    const listed = await execFile("/usr/bin/zipinfo", ["-1", canonicalPath], { maxBuffer: 64 * 1024 * 1024 });
    inventoryNames = listed.stdout.split(/\r?\n/).map(normalizeZipPath).filter(Boolean);
  }
  const zip = await JSZip.loadAsync(await readFile(recipeArchivePath));
  const entries = (inventoryNames
    ? inventoryNames.map((entryPath) => ({
        path: entryPath,
        isDirectory: entryPath.endsWith("/"),
        extension: entryPath.endsWith("/") ? "" : path.posix.extname(entryPath).toLowerCase()
      }))
    : Object.values(zip.files).map((entry) => ({
        path: normalizeZipPath(entry.name),
        isDirectory: entry.dir,
        extension: entry.dir ? "" : path.posix.extname(entry.name).toLowerCase()
      })))
    .sort((left, right) => left.path.localeCompare(right.path));
  const archive: EnglishCourseArchiveV1 = {
    id: input.archiveId,
    kind: input.archiveId,
    path: repoRelative(input.repoRoot, canonicalPath),
    sha256: digest,
    importedAt: input.importedAt
  };

  return {
    archive,
    recipeArchivePath: repoRelative(input.repoRoot, recipeArchivePath),
    zip,
    inventory: { archiveId: input.archiveId, path: archive.path, sha256: digest, entries }
  };
}

function directChildText($: cheerio.CheerioAPI, element: Element, childName: string) {
  return $(element).children(childName).first().text().replace(/\s+/g, " ").trim();
}

async function importSupplementFile(input: {
  repoRoot: string;
  sourcePath: string;
  courseId: string;
  importedAt: string;
}): Promise<LoadedSupplement> {
  const sourcePath = path.resolve(input.sourcePath);
  if (!(await exists(sourcePath))) throw new Error(`Missing supplemental file: ${sourcePath}`);
  const sourceStats = await stat(sourcePath);
  if (!sourceStats.isFile()) throw new Error(`Supplemental source is not a file: ${sourcePath}`);

  const digest = await sha256File(sourcePath);
  const extension = path.extname(sourcePath).toLowerCase();
  const archiveId = `supplement-${digest.slice(0, 12)}`;
  const sourcesDir = path.join(input.repoRoot, "projects", "resources", input.courseId, "_sources");
  const canonicalPath = path.join(sourcesDir, `${digest}${extension}`);
  await mkdir(sourcesDir, { recursive: true });

  if (await exists(canonicalPath)) {
    const canonicalDigest = await sha256File(canonicalPath);
    if (canonicalDigest !== digest) throw new Error(`Canonical supplemental file hash mismatch: ${canonicalPath}`);
  } else {
    await copyFile(sourcePath, canonicalPath);
  }

  const archive: EnglishCourseArchiveV1 = {
    id: archiveId,
    kind: "supplement",
    path: repoRelative(input.repoRoot, canonicalPath),
    sha256: digest,
    importedAt: input.importedAt
  };
  const displayPath = path.basename(sourcePath);
  const inventory: EnglishArchiveInventoryV1 = {
    archiveId,
    path: archive.path,
    sha256: digest,
    entries: [{ path: displayPath, isDirectory: false, extension }]
  };
  const mapping: EnglishCourseMappingEntryV1 = {
    archiveId,
    path: displayPath,
    status: "reference-only",
    classification: "supplemental-source",
    reason: "Registered, hashed, and inventoried as source material; supplemental files are never placed in learner output automatically."
  };

  return { archive, inventory, mapping };
}

async function parseBrightspaceItems(zip: JSZip): Promise<BrightspaceItemRecord[]> {
  const manifestEntry =
    zip.file("imsmanifest.xml") ??
    Object.values(zip.files).find((entry) => !entry.dir && entry.name.toLowerCase().endsWith("/imsmanifest.xml"));
  if (!manifestEntry) return [];

  const xml = await manifestEntry.async("string");
  const $ = cheerio.load(xml, { xmlMode: true });
  const resourceHrefs = new Map<string, string[]>();
  $("resource").each((_, element) => {
    const id = $(element).attr("identifier");
    if (!id) return;
    const hrefs = new Set<string>();
    const primaryHref = $(element).attr("href");
    if (primaryHref) hrefs.add(normalizeZipPath(primaryHref));
    $(element).children("file").each((_, fileElement) => {
      const href = $(fileElement).attr("href");
      if (href) hrefs.add(normalizeZipPath(href));
    });
    if (hrefs.size) resourceHrefs.set(id, [...hrefs]);
  });

  const records: BrightspaceItemRecord[] = [];
  const visit = (element: Element, ancestorIds: string[], topLevelId: string) => {
    const node = $(element);
    const itemId = node.attr("identifier") ?? "";
    if (!itemId) return;
    const nextTopLevelId = topLevelId || itemId;
    const identifierRef = node.attr("identifierref");
    const baseRecord = {
      itemId,
      title: directChildText($, element, "title"),
      ancestorIds,
      topLevelId: nextTopLevelId
    };
    const hrefs = identifierRef ? resourceHrefs.get(identifierRef) ?? [] : [];
    if (hrefs.length) {
      for (const href of hrefs) records.push({ ...baseRecord, href });
    } else {
      records.push(baseRecord);
    }
    node.children("item").each((_, child) => visit(child, [...ancestorIds, itemId], nextTopLevelId));
  };

  $("organization").first().children("item").each((_, element) => visit(element, [], ""));
  return records;
}

function gateLike(value: string) {
  return /(?:soft|hard)[-_ ]*gate|\bgate\b/i.test(value);
}

function answerKeyLike(value: string) {
  return /(?:^|[\s_/-])(?:answers?|anwsers?|solutions?)(?:[\s_.\-/]|$)/i.test(value);
}

function diplomaLike(value: string) {
  return /diploma|part[ _-]*a|exam[ _-]*prep/i.test(value);
}

function mathPathLike(value: string) {
  const topFolder = normalizeZipPath(value).split("/", 1)[0].toLowerCase();
  return mathTopFolders.has(topFolder);
}

function emptySummary(): EnglishCourseMappingReportV1["summary"] {
  return {
    placed: 0,
    excluded: 0,
    "review-required": 0,
    "reference-only": 0,
    metadata: 0,
    missing: 0
  };
}

function selectionIndexes(seeds: readonly EnglishUnitSeed[]) {
  const includes = new Map<string, string>();
  const includeSubtrees = new Map<string, string>();
  const excludes = new Map<string, { projectSlug: string; reason: string }>();
  const excludeSubtrees = new Map<string, { projectSlug: string; reason: string }>();
  for (const seed of seeds) {
    for (const selector of seed.selectors) {
      if (selector.disposition === "include") {
        includes.set(selector.itemId, seed.manifest.projectSlug);
        if (selector.includeChildren) includeSubtrees.set(selector.itemId, seed.manifest.projectSlug);
      } else {
        const exclusion = { projectSlug: seed.manifest.projectSlug, reason: selector.reason ?? "Explicitly excluded lesson." };
        excludes.set(selector.itemId, exclusion);
        if (selector.includeChildren) excludeSubtrees.set(selector.itemId, exclusion);
      }
    }
  }
  return { includes, includeSubtrees, excludes, excludeSubtrees };
}

function classifyBrightspaceEntry(input: {
  entry: EnglishInventoryEntryV1;
  records: BrightspaceItemRecord[];
  seeds: readonly EnglishUnitSeed[];
  courseId: string;
}): EnglishCourseMappingEntryV1 {
  const { includes, includeSubtrees, excludes, excludeSubtrees } = selectionIndexes(input.seeds);
  const entryPath = input.entry.path;
  const records = input.records;
  const itemIds = records.map((record) => record.itemId);
  const base = { archiveId: "brightspace" as const, path: entryPath, brightspaceItemIds: itemIds.length ? itemIds : undefined };

  if (input.entry.isDirectory) {
    return { ...base, status: "metadata", classification: "directory", reason: "ZIP directory entry." };
  }
  if (/^(?:imsmanifest\.xml|syllabus_d2l\.xml|courseimage_d2l\.xml|orgunitconfig\/)/i.test(entryPath)) {
    return { ...base, status: "metadata", classification: "brightspace-metadata", reason: "Required only for source inventory and manifest parsing." };
  }
  if (gateLike(entryPath)) {
    return { ...base, status: "excluded", classification: "gate-assessment", reason: "Soft/hard-gate content is globally excluded." };
  }
  if (answerKeyLike(entryPath)) {
    return { ...base, status: "excluded", classification: "answer-key", reason: "Answer keys and solutions are excluded from learner output." };
  }
  if (diplomaLike(entryPath)) {
    return { ...base, status: "excluded", classification: "diploma-content", reason: `Diploma and Part A material is outside the ${input.courseId} unit factory.` };
  }

  if (mathPathLike(entryPath)) {
    return { ...base, status: "excluded", classification: "unrelated-math", reason: "Unrelated Math course content." };
  }

  for (const record of records) {
    const exactExclusion = excludes.get(record.itemId);
    if (exactExclusion) {
      return {
        ...base,
        status: "excluded",
        classification: "alternate-content",
        projectSlug: exactExclusion.projectSlug,
        reason: exactExclusion.reason
      };
    }
    for (const ancestorId of record.ancestorIds) {
      const subtreeExclusion = excludeSubtrees.get(ancestorId);
      if (subtreeExclusion) {
        return {
          ...base,
          status: "excluded",
          classification: "alternate-content",
          projectSlug: subtreeExclusion.projectSlug,
          reason: subtreeExclusion.reason
        };
      }
    }
  }

  if (/^(?:hamlet|king_lear|othello|streetcar_named_desire)\//i.test(entryPath)) {
    return { ...base, status: "excluded", classification: "alternate-content", reason: "Asset belongs to an alternate play branch." };
  }

  for (const record of records) {
    const projectSlug = includes.get(record.itemId);
    if (projectSlug) {
      return { ...base, status: "placed", classification: "selected-brightspace-lesson", projectSlug, reason: `Selected exact Brightspace item ${record.itemId}.` };
    }
    for (const ancestorId of record.ancestorIds) {
      const subtreeProject = includeSubtrees.get(ancestorId);
      if (subtreeProject) {
        return { ...base, status: "placed", classification: "selected-brightspace-lesson", projectSlug: subtreeProject, reason: `Descendant of selected Brightspace branch ${ancestorId}.` };
      }
    }
  }

  if (input.courseId === ELA20_COURSE_ID && /^short_stories\//i.test(entryPath)) {
    return { ...base, status: "placed", classification: "existing-pilot-resource", projectSlug: "ela20-1-short-stories-pilot", reason: "Resource belongs to the existing Short Stories pilot branch." };
  }
  if (input.courseId === ELA20_COURSE_ID && /^film_study\//i.test(entryPath)) {
    return { ...base, status: "placed", classification: "selected-branch-resource", projectSlug: "ela20-1-feature-film", reason: "Resource belongs to the fully selected Film Study branch." };
  }
  if (input.courseId === ELA20_COURSE_ID && /^novel_study\//i.test(entryPath)) {
    return { ...base, status: "review-required", classification: "novel-branch-resource", projectSlug: "ela20-1-novel-study-clean", reason: "Review before placement because only exact Novel lesson items are selected." };
  }

  return {
    ...base,
    status: "reference-only",
    classification: records.length ? "unselected-brightspace-content" : "unlinked-brightspace-source",
    reason: records.length
      ? `Brightspace content is outside the exact ${input.courseId} lesson allowlist.`
      : "File is not linked from the Brightspace content manifest; it remains available only in the immutable source archive."
  };
}

function classifyTeacherEntry(
  entry: EnglishInventoryEntryV1,
  teacherResources: ReadonlyMap<string, { projectSlug: string; resource: import("./types.js").EnglishResourceDispositionV2 }>,
  courseId: string,
  seeds: readonly EnglishUnitSeed[]
): EnglishCourseMappingEntryV1 {
  const entryPath = entry.path;
  const base = { archiveId: "teacher-resources" as const, path: entryPath };
  const owner = [...seeds]
    .sort((left, right) => right.teacherFolder.length - left.teacherFolder.length)
    .find((seed) => entryPath === seed.teacherFolder || entryPath.startsWith(`${seed.teacherFolder}/`));
  if (entry.isDirectory) {
    return { ...base, status: "metadata", classification: "directory", reason: "ZIP directory entry." };
  }
  if (gateLike(entryPath)) {
    const mapped = teacherResources.get(entryPath);
    return {
      ...base,
      status: "excluded",
      classification: "gate-assessment",
      projectSlug: mapped?.projectSlug ?? owner?.manifest.projectSlug,
      resourceId: mapped?.resource.id,
      reason: "Soft/hard-gate content is globally excluded."
    };
  }
  if (answerKeyLike(entryPath)) {
    return {
      ...base,
      status: "excluded",
      classification: "answer-key",
      projectSlug: owner?.manifest.projectSlug,
      reason: "Answer keys and solutions are excluded from learner output."
    };
  }
  const mapped = teacherResources.get(entryPath);
  if (mapped) {
    const status: EnglishMappingStatus =
      mapped.resource.disposition === "place"
        ? "placed"
        : mapped.resource.disposition === "exclude"
          ? "excluded"
          : mapped.resource.disposition === "source-only"
            ? "reference-only"
            : "review-required";
    return {
      ...base,
      status,
      classification: `teacher-${mapped.resource.role}`,
      projectSlug: mapped.projectSlug,
      resourceId: mapped.resource.id,
      reason: mapped.resource.reason
    };
  }
  if (courseId === ELA20_COURSE_ID && /^UNIT 1 Short Story\//i.test(entryPath)) {
    return {
      ...base,
      status: "placed",
      classification: "existing-pilot-resource",
      projectSlug: "ela20-1-short-stories-pilot",
      reason: "Teacher resource is owned by the existing Short Stories pilot recipe."
    };
  }
  if (owner) {
    return {
      ...base,
      status: "review-required",
      classification: "teacher-unit-resource",
      projectSlug: owner.manifest.projectSlug,
      reason: "Teacher archive ownership is known, but this source is not automatically learner-facing until its unit recipe explicitly places it."
    };
  }
  return {
    ...base,
    status: "review-required",
    classification: "unmapped-teacher-resource",
    reason: "Teacher resource is not present in an approved unit resource disposition."
  };
}

async function buildMappingReport(input: {
  courseId: string;
  generatedAt: string;
  brightspace: LoadedArchive;
  teacherResources: LoadedArchive;
  supplements: readonly LoadedSupplement[];
  seeds: readonly EnglishUnitSeed[];
  teacherResourceMap: ReadonlyMap<string, { projectSlug: string; resource: import("./types.js").EnglishResourceDispositionV2 }>;
}): Promise<EnglishCourseMappingReportV1> {
  const itemRecords = await parseBrightspaceItems(input.brightspace.zip);
  const recordsByHref = new Map<string, BrightspaceItemRecord[]>();
  for (const record of itemRecords) {
    if (!record.href) continue;
    const rows = recordsByHref.get(record.href) ?? [];
    rows.push(record);
    recordsByHref.set(record.href, rows);
  }

  const entries: EnglishCourseMappingEntryV1[] = [
    ...input.brightspace.inventory.entries.map((entry) =>
      classifyBrightspaceEntry({ entry, records: recordsByHref.get(entry.path) ?? [], seeds: input.seeds, courseId: input.courseId })
    ),
    ...input.teacherResources.inventory.entries.map((entry) => classifyTeacherEntry(entry, input.teacherResourceMap, input.courseId, input.seeds)),
    ...input.supplements.map((supplement) => supplement.mapping)
  ];

  const actualTeacherPaths = new Set(input.teacherResources.inventory.entries.map((entry) => entry.path));
  for (const [resourcePath, mapped] of input.teacherResourceMap) {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(resourcePath)) continue;
    if (actualTeacherPaths.has(resourcePath)) continue;
    entries.push({
      archiveId: "teacher-resources",
      path: resourcePath,
      status: "missing",
      classification: "configured-resource-missing",
      projectSlug: mapped.projectSlug,
      resourceId: mapped.resource.id,
      reason: `Configured resource was not present in the teacher archive. ${mapped.resource.reason}`
    });
  }

  entries.sort((left, right) => left.archiveId.localeCompare(right.archiveId) || left.path.localeCompare(right.path));
  const summary = emptySummary();
  for (const entry of entries) summary[entry.status] += 1;
  return { schemaVersion: 1, courseId: input.courseId, generatedAt: input.generatedAt, summary, entries };
}

function markdownCell(value: string | undefined) {
  return (value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function renderMappingMarkdown(report: EnglishCourseMappingReportV1) {
  const lines = [
    `# ${report.courseId} English Intake Mapping`,
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    ...Object.entries(report.summary).map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## Source disposition",
    "",
    "| Archive | Source | Status | Classification | Project | Reason |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.entries.map(
      (entry) =>
        `| ${entry.archiveId} | ${markdownCell(entry.path)} | ${entry.status} | ${entry.classification} | ${markdownCell(entry.projectSlug)} | ${markdownCell(entry.reason)} |`
    ),
    ""
  ];
  return lines.join("\n");
}

async function createRecipeIfMissing(input: {
  repoRoot: string;
  recipe: EnglishUnitRecipe;
}): Promise<EnglishRecipeIntakeAction> {
  const recipePath = path.join(input.repoRoot, "projects", input.recipe.projectSlug, "meta", "english-unit.json");
  const relativePath = repoRelative(input.repoRoot, recipePath);
  if (await exists(recipePath)) {
    try {
      parseEnglishUnitRecipe(JSON.parse(await readFile(recipePath, "utf8")));
      return {
        projectSlug: input.recipe.projectSlug,
        path: relativePath,
        status: "preserved-existing",
        note: "Existing recipe was validated and preserved without modification."
      };
    } catch (error) {
      return {
        projectSlug: input.recipe.projectSlug,
        path: relativePath,
        status: "preserved-invalid",
        note: `Existing recipe was preserved without modification but needs repair: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  parseEnglishUnitRecipe(input.recipe);
  await mkdir(path.dirname(recipePath), { recursive: true });
  try {
    await writeFile(recipePath, `${JSON.stringify(input.recipe, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && (error as NodeJS.ErrnoException).code === "EEXIST")) {
      throw error;
    }
    return {
      projectSlug: input.recipe.projectSlug,
      path: relativePath,
      status: "preserved-existing",
      note: "A concurrent intake created the recipe first; it was not overwritten."
    };
  }
  return {
    projectSlug: input.recipe.projectSlug,
    path: relativePath,
    status: "created",
    note: "Created the missing English unit recipe."
  };
}

async function readExistingManifest(manifestPath: string): Promise<EnglishCourseManifestV1 | undefined> {
  if (!(await exists(manifestPath))) return undefined;
  return parseEnglishCourseManifest(JSON.parse(await readFile(manifestPath, "utf8")));
}

export async function intakeEnglishCourse(input: {
  repoRoot: string;
  courseId: string;
  brightspaceZip: string;
  teacherResourcesZip: string;
  supplementalFiles?: string[];
  now?: Date;
}): Promise<EnglishCourseIntakeResult> {
  if (![ELA20_COURSE_ID, ELA10_COURSE_ID].includes(input.courseId) && !isEla2CourseId(input.courseId)) {
    throw new Error(
      `Unsupported English course "${input.courseId}". Available courses: ${ELA20_COURSE_ID}, ${ELA10_COURSE_ID}, ela10-2, ela20-2, ela30-2.`
    );
  }

  const repoRoot = path.resolve(input.repoRoot);
  const generatedAt = (input.now ?? new Date()).toISOString();
  const [brightspace, teacherResources] = await Promise.all([
    importArchive({
      repoRoot,
      sourcePath: input.brightspaceZip,
      archiveId: "brightspace",
      courseId: input.courseId,
      importedAt: generatedAt
    }),
    importArchive({
      repoRoot,
      sourcePath: input.teacherResourcesZip,
      archiveId: "teacher-resources",
      courseId: input.courseId,
      importedAt: generatedAt
    })
  ]);
  const loadedSupplements = await Promise.all(
    [...new Set(input.supplementalFiles ?? [])].map((sourcePath) =>
      importSupplementFile({ repoRoot, sourcePath, courseId: input.courseId, importedAt: generatedAt })
    )
  );
  const supplementsByDigest = new Map<string, LoadedSupplement>();
  for (const supplement of loadedSupplements) supplementsByDigest.set(supplement.archive.sha256, supplement);
  const supplements = [...supplementsByDigest.values()];

  const configDir = path.join(repoRoot, "config", "english", "families");
  const manifestPath = path.join(configDir, `${input.courseId}.json`);
  const inventoryPath = path.join(configDir, `${input.courseId}-inventory.json`);
  const mappingJsonPath = path.join(configDir, `${input.courseId}-mapping.json`);
  const mappingMarkdownPath = path.join(configDir, `${input.courseId}-mapping.md`);
  const existingManifest = await readExistingManifest(manifestPath);
  const existingReviewStatuses = new Map(
    existingManifest?.units.map((unit) => [unit.projectSlug, unit.reviewStatus] as const) ?? []
  );
  const preservedAuditReferences = existingManifest?.archives.filter((archive) => archive.kind === "audit-reference") ?? [];
  const preservedSupplements = (existingManifest?.archives.filter((archive) => archive.kind === "supplement") ?? [])
    .filter((archive) => !supplementsByDigest.has(archive.sha256));
  const archives = [
    brightspace.archive,
    teacherResources.archive,
    ...supplements.map((supplement) => supplement.archive),
    ...preservedSupplements,
    ...preservedAuditReferences
  ];
  const isEla10 = input.courseId === ELA10_COURSE_ID;
  const isEla20 = input.courseId === ELA20_COURSE_ID;
  const ela2CourseId = isEla2CourseId(input.courseId) ? input.courseId : undefined;
  const seeds = ela2CourseId
    ? getEla2UnitSeeds(ela2CourseId)
    : isEla10
      ? ELA10_UNIT_SEEDS
      : ELA20_UNIT_SEEDS;
  const teacherResourceMap = ela2CourseId
    ? getEla2TeacherResourceMap(ela2CourseId)
    : isEla10
      ? getEla10TeacherResourceMap()
      : getEla20TeacherResourceMap();
  const manifest = ela2CourseId
    ? createEla2CourseManifest({ courseId: ela2CourseId, archives, generatedAt, existingReviewStatuses })
    : isEla10
      ? createEla10CourseManifest({ archives, generatedAt, existingReviewStatuses })
      : createEla20CourseManifest({ archives, generatedAt, existingReviewStatuses });
  parseEnglishCourseManifest(manifest);

  const inventory: EnglishCourseInventoryV1 = {
    schemaVersion: 1,
    courseId: input.courseId,
    generatedAt,
    archives: [brightspace.inventory, teacherResources.inventory, ...supplements.map((supplement) => supplement.inventory)]
  };
  const mapping = await buildMappingReport({
    courseId: input.courseId,
    generatedAt,
    brightspace,
    teacherResources,
    supplements,
    seeds,
    teacherResourceMap
  });

  const recipeSeeds = ela2CourseId
    ? createEla2RecipeSeeds({
        courseId: ela2CourseId,
        brightspaceArchivePath: brightspace.recipeArchivePath,
        teacherArchivePath: teacherResources.recipeArchivePath
      })
    : isEla10
      ? createEla10RecipeSeeds({ brightspaceArchivePath: brightspace.recipeArchivePath, teacherArchivePath: teacherResources.recipeArchivePath })
      : createEla20RecipeSeeds({ brightspaceArchivePath: brightspace.recipeArchivePath, teacherArchivePath: teacherResources.recipeArchivePath });
  const recipeActions: EnglishRecipeIntakeAction[] = [];
  for (const recipe of recipeSeeds) recipeActions.push(await createRecipeIfMissing({ repoRoot, recipe }));

  if (isEla20) {
    const shortStoriesPath = path.join(repoRoot, shortStoriesRecipePath());
    recipeActions.unshift({
      projectSlug: "ela20-1-short-stories-pilot",
      path: shortStoriesRecipePath(),
      status: (await exists(shortStoriesPath)) ? "preserved-existing" : "missing-existing",
      note: (await exists(shortStoriesPath))
        ? "Existing Short Stories recipe remains the golden profile and was not modified."
        : "Short Stories is intentionally not scaffolded by intake; restore or build the existing pilot recipe."
    });
  }

  await Promise.all([
    writeJsonAtomic(manifestPath, manifest),
    writeJsonAtomic(inventoryPath, inventory),
    writeJsonAtomic(mappingJsonPath, mapping),
    writeTextAtomic(mappingMarkdownPath, renderMappingMarkdown(mapping))
  ]);

  return {
    courseId: input.courseId,
    manifestPath: repoRelative(repoRoot, manifestPath),
    inventoryPath: repoRelative(repoRoot, inventoryPath),
    mappingJsonPath: repoRelative(repoRoot, mappingJsonPath),
    mappingMarkdownPath: repoRelative(repoRoot, mappingMarkdownPath),
    archives,
    recipes: recipeActions,
    summary: mapping.summary
  };
}

function shortStoriesRecipePath() {
  return "projects/ela20-1-short-stories-pilot/meta/english-unit.json";
}
