import path from "node:path";
import { readdir } from "node:fs/promises";

import { fileExists } from "./fs.js";

const IMPORTABLE_SOURCE_EXTENSIONS = new Set([".html", ".txt", ".pdf", ".docx"]);

function isVisibleEntry(name: string) {
  return !name.startsWith(".");
}

function isImportableSourceFile(fileName: string) {
  return IMPORTABLE_SOURCE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

async function collectImportableFolders(folderPath: string): Promise<string[]> {
  const entries = (await readdir(folderPath, { withFileTypes: true })).filter((entry) => isVisibleEntry(entry.name));
  const visibleFiles = entries.filter((entry) => entry.isFile());
  const visibleDirectories = entries.filter((entry) => entry.isDirectory());

  if (visibleFiles.some((entry) => isImportableSourceFile(entry.name))) {
    return [folderPath];
  }

  const childImportableFolders = (
    await Promise.all(visibleDirectories.map((entry) => collectImportableFolders(path.join(folderPath, entry.name))))
  )
    .flat()
    .sort((left, right) => left.localeCompare(right));

  if (childImportableFolders.length === 0) {
    return [];
  }

  if (visibleFiles.length > 0 && childImportableFolders.length === 1) {
    return [folderPath];
  }

  return childImportableFolders;
}

export async function listIncomingProjectFolders(incomingRoot: string) {
  if (!(await fileExists(incomingRoot))) {
    return [] as string[];
  }

  const entries = await readdir(incomingRoot, { withFileTypes: true });
  const rootDirectories = entries
    .filter((entry) => entry.isDirectory() && isVisibleEntry(entry.name))
    .map((entry) => path.join(incomingRoot, entry.name));

  return (
    await Promise.all(rootDirectories.map((folderPath) => collectImportableFolders(folderPath)))
  )
    .flat()
    .sort((left, right) => left.localeCompare(right));
}
