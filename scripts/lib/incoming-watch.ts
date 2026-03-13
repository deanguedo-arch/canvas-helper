import path from "node:path";
import { readdir, stat } from "node:fs/promises";

import { fileExists, listFilesRecursive } from "./fs.js";
import { projectsRoot, resourcesRoot } from "./paths.js";

const IMPORTABLE_SOURCE_EXTENSIONS = new Set([".html", ".htm", ".txt"]);
const WATCH_IGNORE_MARKERS = new Set([".watch-ignore", ".canvas-helper-ignore"]);
const RESOURCE_EXTRACTED_DIR = "_extracted";

function isVisibleEntry(name: string) {
  return !name.startsWith(".");
}

function isImportableSourceFile(fileName: string) {
  return IMPORTABLE_SOURCE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

async function hasWatchIgnoreMarker(folderPath: string) {
  const entries = await readdir(folderPath, { withFileTypes: true });
  return entries.some((entry) => entry.isFile() && WATCH_IGNORE_MARKERS.has(entry.name));
}

export function slugifyProjectName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function inferSlugFromIncomingItem(inputPath: string) {
  const parsed = path.parse(inputPath);
  return slugifyProjectName(parsed.ext ? parsed.name : parsed.base);
}

export async function listIncomingProjectItems(incomingRoot: string) {
  if (!(await fileExists(incomingRoot))) {
    return [] as string[];
  }

  const entries = await readdir(incomingRoot, { withFileTypes: true });
  const items: string[] = [];

  for (const entry of entries) {
    if (!isVisibleEntry(entry.name)) {
      continue;
    }

    const entryPath = path.join(incomingRoot, entry.name);
    if (entry.isDirectory()) {
      if (await hasWatchIgnoreMarker(entryPath)) {
        continue;
      }

      items.push(entryPath);
      continue;
    }

    if (entry.isFile() && isImportableSourceFile(entry.name)) {
      items.push(entryPath);
    }
  }

  return items.sort((left, right) => left.localeCompare(right));
}

export async function listResourceProjectDirs(resourceRoot = resourcesRoot, projectsRootDir = projectsRoot) {
  if (!(await fileExists(resourceRoot))) {
    return [] as string[];
  }

  const entries = await readdir(resourceRoot, { withFileTypes: true });
  const candidateDirs = entries.filter((entry) => entry.isDirectory() && isVisibleEntry(entry.name));
  const dirs: string[] = [];

  for (const entry of candidateDirs) {
    const resourceDir = path.join(resourceRoot, entry.name);
    if (await hasWatchIgnoreMarker(resourceDir)) {
      continue;
    }

    const manifestPath = path.join(projectsRootDir, entry.name, "meta", "project.json");
    if (!(await fileExists(manifestPath))) {
      continue;
    }

    dirs.push(resourceDir);
  }

  return dirs.sort((left, right) => left.localeCompare(right));
}

export async function listResourceSourceFiles(resourceDir: string) {
  if (!(await fileExists(resourceDir))) {
    return [] as string[];
  }

  const files = await listFilesRecursive(resourceDir);
  return files
    .filter((filePath) => {
      const relativePath = path.relative(resourceDir, filePath).replace(/\\/g, "/");
      return (
        isVisibleEntry(path.basename(filePath)) &&
        relativePath !== RESOURCE_EXTRACTED_DIR &&
        !relativePath.startsWith(`${RESOURCE_EXTRACTED_DIR}/`)
      );
    })
    .sort((left, right) => left.localeCompare(right));
}

export async function latestResourceSourceMtimeMs(resourceDir: string) {
  if (!(await fileExists(resourceDir))) {
    return 0;
  }

  const resourceStats = await stat(resourceDir);
  const files = await listResourceSourceFiles(resourceDir);
  if (files.length === 0) {
    return resourceStats.mtimeMs;
  }

  const mtimes = await Promise.all(files.map(async (filePath) => (await stat(filePath)).mtimeMs));
  return Math.max(resourceStats.mtimeMs, ...mtimes);
}
