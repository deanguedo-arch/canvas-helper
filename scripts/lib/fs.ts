import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export async function ensureDir(dirPath: string) {
  await mkdir(dirPath, { recursive: true });
}

export async function removePath(targetPath: string) {
  await rm(targetPath, { force: true, recursive: true });
}

export async function fileExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

export async function writeJsonFile(filePath: string, value: unknown) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function writeTextFile(filePath: string, value: string) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, value, "utf8");
}

export async function copyFileEnsuringDir(sourcePath: string, destinationPath: string) {
  await ensureDir(path.dirname(destinationPath));
  await copyFile(sourcePath, destinationPath);
}

export async function copyDirectory(sourceDir: string, destinationDir: string) {
  await ensureDir(destinationDir);
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
      continue;
    }

    await copyFileEnsuringDir(sourcePath, destinationPath);
  }
}

export async function listFilesRecursive(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        return listFilesRecursive(entryPath);
      }

      return [entryPath];
    })
  );

  return files.flat();
}

export async function latestMtimeMs(dirPath: string): Promise<number> {
  if (!(await fileExists(dirPath))) {
    return 0;
  }

  const files = await listFilesRecursive(dirPath);
  if (files.length === 0) {
    return (await stat(dirPath)).mtimeMs;
  }

  const mtimes = await Promise.all(files.map(async (filePath) => (await stat(filePath)).mtimeMs));
  return Math.max(...mtimes);
}
