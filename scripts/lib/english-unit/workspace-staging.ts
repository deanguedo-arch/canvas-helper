import { createHash } from "node:crypto";
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm
} from "node:fs/promises";
import path from "node:path";

import type {
  EnglishUnitBuildManifestV1,
  EnglishUnitBuildSourceV1
} from "./types.js";

export type EnglishFactoryOwnedPath = {
  path: string;
  kind: "file" | "directory";
};

export type EnglishWorkspaceFileHash = {
  path: string;
  sha256: string;
};

export type EnglishWorkspaceBuildMetadata = {
  projectSlug: string;
  status?: EnglishUnitBuildManifestV1["status"];
  generatedAt?: string;
  profile: EnglishUnitBuildManifestV1["profile"];
  recipe: EnglishUnitBuildManifestV1["recipe"];
  sources: EnglishUnitBuildSourceV1[];
  reviewItems?: string[];
};

export type EnglishWorkspaceStageContext = {
  stageDir: string;
  workspaceDir: string;
  ownedPaths: EnglishFactoryOwnedPath[];
  preservedCustomFiles: EnglishWorkspaceFileHash[];
};

export type EnglishWorkspaceStagingOptions = {
  workspaceDir: string;
  ownedPaths?: EnglishFactoryOwnedPath[];
  metadata: EnglishWorkspaceBuildMetadata;
  buildStage(context: EnglishWorkspaceStageContext): Promise<void>;
  validateIndex?(context: EnglishWorkspaceStageContext & { indexPath: string; html: string }): Promise<void> | void;
};

export type EnglishWorkspacePromotionResult = {
  manifest: EnglishUnitBuildManifestV1;
  ownedFileHashes: EnglishWorkspaceFileHash[];
  preservedCustomFileHashes: EnglishWorkspaceFileHash[];
};

export const DEFAULT_ENGLISH_FACTORY_OWNED_PATHS: EnglishFactoryOwnedPath[] = [
  { path: "index.html", kind: "file" },
  { path: "assets/generated", kind: "directory" },
  { path: "resources/generated", kind: "directory" }
];

export const ENGLISH_WORKSPACE_PRESERVED_PATHS = ["components", "assets/custom"] as const;

function toManifestPath(value: string): string {
  return value.split(path.sep).join("/");
}

function normalizeOwnedPath(value: string): string {
  if (!value.trim() || path.isAbsolute(value)) {
    throw new Error(`Factory-owned paths must be non-empty workspace-relative paths: "${value}".`);
  }

  const normalized = path.posix.normalize(value.replaceAll("\\", "/")).replace(/^\.\//, "");
  if (!normalized || normalized === "." || normalized === ".." || normalized.startsWith("../")) {
    throw new Error(`Factory-owned path escapes the workspace: "${value}".`);
  }
  return normalized;
}

function pathsOverlap(left: string, right: string): boolean {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function validateOwnedPaths(paths: EnglishFactoryOwnedPath[]): EnglishFactoryOwnedPath[] {
  const normalized = paths.map((entry) => ({ ...entry, path: normalizeOwnedPath(entry.path) }));
  if (!normalized.some((entry) => entry.path === "index.html" && entry.kind === "file")) {
    throw new Error('Factory-owned paths must declare "index.html" as a file.');
  }

  for (const entry of normalized) {
    if (entry.path !== "index.html") {
      const segments = entry.path.split("/");
      const allowedRoot = segments[0] === "assets" || segments[0] === "resources";
      if (entry.kind !== "directory" || !allowedRoot || segments.length < 2) {
        throw new Error(
          `Factory-owned path "${entry.path}" must be index.html or a declared assets/resources subdirectory.`
        );
      }
    }
    for (const preservedPath of ENGLISH_WORKSPACE_PRESERVED_PATHS) {
      if (pathsOverlap(entry.path, preservedPath)) {
        throw new Error(`Factory-owned path "${entry.path}" overlaps preserved custom path "${preservedPath}".`);
      }
    }
  }

  for (let index = 0; index < normalized.length; index += 1) {
    for (let comparison = index + 1; comparison < normalized.length; comparison += 1) {
      if (pathsOverlap(normalized[index]!.path, normalized[comparison]!.path)) {
        throw new Error(
          `Factory-owned paths overlap: "${normalized[index]!.path}" and "${normalized[comparison]!.path}".`
        );
      }
    }
  }

  return normalized;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function copyDirectory(sourceDir: string, destinationDir: string): Promise<void> {
  await mkdir(destinationDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Preserved custom path contains an unsupported symbolic link: ${sourcePath}`);
    }
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
      continue;
    }
    if (!entry.isFile()) continue;
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
  }
}

async function sha256File(filePath: string): Promise<string> {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

async function collectFileHashes(rootDir: string, relativeRoot: string): Promise<EnglishWorkspaceFileHash[]> {
  const absoluteRoot = path.join(rootDir, relativeRoot);
  if (!(await pathExists(absoluteRoot))) return [];

  const rootStats = await lstat(absoluteRoot);
  if (rootStats.isSymbolicLink()) {
    throw new Error(`Cannot hash symbolic link in English workspace transaction: ${absoluteRoot}`);
  }
  if (rootStats.isFile()) {
    return [{ path: toManifestPath(relativeRoot), sha256: await sha256File(absoluteRoot) }];
  }
  if (!rootStats.isDirectory()) return [];

  const entries = await readdir(absoluteRoot, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((entry) => collectFileHashes(rootDir, path.join(relativeRoot, entry.name)))
  );
  return nested.flat().sort((left, right) => left.path.localeCompare(right.path));
}

async function collectHashesForRoots(rootDir: string, roots: readonly string[]): Promise<EnglishWorkspaceFileHash[]> {
  const hashes = await Promise.all(roots.map((relativeRoot) => collectFileHashes(rootDir, relativeRoot)));
  return hashes.flat().sort((left, right) => left.path.localeCompare(right.path));
}

function sameFileHashes(left: EnglishWorkspaceFileHash[], right: EnglishWorkspaceFileHash[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function validateStagedOwnedPaths(stageDir: string, ownedPaths: EnglishFactoryOwnedPath[]): Promise<void> {
  for (const ownedPath of ownedPaths) {
    const stagedPath = path.join(stageDir, ownedPath.path);
    if (!(await pathExists(stagedPath))) {
      throw new Error(`Staged build did not produce declared factory-owned path "${ownedPath.path}".`);
    }
    const stats = await lstat(stagedPath);
    if (stats.isSymbolicLink()) {
      throw new Error(`Staged factory-owned path cannot be a symbolic link: "${ownedPath.path}".`);
    }
    if (ownedPath.kind === "file" && !stats.isFile()) {
      throw new Error(`Staged factory-owned path must be a file: "${ownedPath.path}".`);
    }
    if (ownedPath.kind === "directory" && !stats.isDirectory()) {
      throw new Error(`Staged factory-owned path must be a directory: "${ownedPath.path}".`);
    }
  }
}

export async function validateEnglishStagedIndex(indexPath: string): Promise<string> {
  const html = await readFile(indexPath, "utf8");
  if (!html.trim()) throw new Error("Staged English workspace index.html is empty.");
  if (html.includes("\0")) throw new Error("Staged English workspace index.html contains null bytes.");
  for (const requiredPattern of [/<html(?:\s|>)/i, /<body(?:\s|>)/i, /<\/body>/i, /<\/html>/i]) {
    if (!requiredPattern.test(html)) {
      throw new Error("Staged English workspace index.html is not a complete HTML document.");
    }
  }
  return html;
}

type PromotedPath = {
  relativePath: string;
  hadPrevious: boolean;
};

async function rollbackPromotion(
  workspaceDir: string,
  backupDir: string,
  promotedPaths: PromotedPath[]
): Promise<void> {
  for (const promoted of [...promotedPaths].reverse()) {
    const destinationPath = path.join(workspaceDir, promoted.relativePath);
    const backupPath = path.join(backupDir, promoted.relativePath);
    await rm(destinationPath, { recursive: true, force: true });
    if (promoted.hadPrevious && (await pathExists(backupPath))) {
      await mkdir(path.dirname(destinationPath), { recursive: true });
      await rename(backupPath, destinationPath);
    }
  }
}

async function promoteOwnedPaths(
  stageDir: string,
  workspaceDir: string,
  backupDir: string,
  ownedPaths: EnglishFactoryOwnedPath[]
): Promise<PromotedPath[]> {
  const promoted: PromotedPath[] = [];
  try {
    for (const ownedPath of ownedPaths) {
      const stagedPath = path.join(stageDir, ownedPath.path);
      const destinationPath = path.join(workspaceDir, ownedPath.path);
      const backupPath = path.join(backupDir, ownedPath.path);
      const hadPrevious = await pathExists(destinationPath);

      if (hadPrevious) {
        await mkdir(path.dirname(backupPath), { recursive: true });
        await rename(destinationPath, backupPath);
      }

      try {
        await mkdir(path.dirname(destinationPath), { recursive: true });
        await rename(stagedPath, destinationPath);
      } catch (error) {
        if (hadPrevious && (await pathExists(backupPath))) {
          await rename(backupPath, destinationPath);
        }
        throw error;
      }
      promoted.push({ relativePath: ownedPath.path, hadPrevious });
    }
    return promoted;
  } catch (error) {
    await rollbackPromotion(workspaceDir, backupDir, promoted);
    throw error;
  }
}

export async function stageAndPromoteEnglishWorkspace(
  options: EnglishWorkspaceStagingOptions
): Promise<EnglishWorkspacePromotionResult> {
  const workspaceDir = path.resolve(options.workspaceDir);
  const ownedPaths = validateOwnedPaths(options.ownedPaths ?? DEFAULT_ENGLISH_FACTORY_OWNED_PATHS);
  const workspaceParent = path.dirname(workspaceDir);
  await mkdir(workspaceParent, { recursive: true });
  if (await pathExists(workspaceDir)) {
    const workspaceStats = await lstat(workspaceDir);
    if (workspaceStats.isSymbolicLink() || !workspaceStats.isDirectory()) {
      throw new Error(`English workspace must be a real directory: ${workspaceDir}`);
    }
  }

  const transactionDir = await mkdtemp(path.join(workspaceParent, ".english-workspace-transaction-"));
  const stageDir = path.join(transactionDir, "stage");
  const backupDir = path.join(transactionDir, "backup");
  await mkdir(stageDir, { recursive: true });
  await mkdir(backupDir, { recursive: true });

  const preservedCustomFiles = await collectHashesForRoots(workspaceDir, ENGLISH_WORKSPACE_PRESERVED_PATHS);
  const context: EnglishWorkspaceStageContext = {
    stageDir,
    workspaceDir,
    ownedPaths,
    preservedCustomFiles
  };

  try {
    for (const preservedPath of ENGLISH_WORKSPACE_PRESERVED_PATHS) {
      const sourcePath = path.join(workspaceDir, preservedPath);
      if (await pathExists(sourcePath)) {
        await copyDirectory(sourcePath, path.join(stageDir, preservedPath));
      }
    }

    await options.buildStage(context);
    await validateStagedOwnedPaths(stageDir, ownedPaths);
    const indexPath = path.join(stageDir, "index.html");
    const html = await validateEnglishStagedIndex(indexPath);
    await options.validateIndex?.({ ...context, indexPath, html });

    const currentCustomFiles = await collectHashesForRoots(workspaceDir, ENGLISH_WORKSPACE_PRESERVED_PATHS);
    if (!sameFileHashes(preservedCustomFiles, currentCustomFiles)) {
      throw new Error("Preserved English workspace custom files changed during staging; rerun the build.");
    }

    const ownedFileHashes = await collectHashesForRoots(
      stageDir,
      ownedPaths.map((ownedPath) => ownedPath.path)
    );
    const promoted = await promoteOwnedPaths(stageDir, workspaceDir, backupDir, ownedPaths);
    const promotedCustomFiles = await collectHashesForRoots(workspaceDir, ENGLISH_WORKSPACE_PRESERVED_PATHS);
    if (!sameFileHashes(preservedCustomFiles, promotedCustomFiles)) {
      await rollbackPromotion(workspaceDir, backupDir, promoted);
      throw new Error("Preserved English workspace custom files changed during promotion; prior output was restored.");
    }

    const manifest: EnglishUnitBuildManifestV1 = {
      schemaVersion: 1,
      projectSlug: options.metadata.projectSlug,
      generatedAt: options.metadata.generatedAt ?? new Date().toISOString(),
      status: options.metadata.status ?? "success",
      profile: options.metadata.profile,
      recipe: options.metadata.recipe,
      sources: options.metadata.sources,
      components: preservedCustomFiles.map((file) => ({
        id: file.path,
        source: file.path,
        sha256: file.sha256
      })),
      ownedFiles: ownedFileHashes.map((file) => file.path),
      reviewItems: options.metadata.reviewItems ?? []
    };

    return {
      manifest,
      ownedFileHashes,
      preservedCustomFileHashes: preservedCustomFiles
    };
  } finally {
    await rm(transactionDir, { recursive: true, force: true });
  }
}
