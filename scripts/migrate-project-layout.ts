import path from "node:path";
import { readdir, rename, stat } from "node:fs/promises";

import { copyDirectory, copyFileEnsuringDir, ensureDir, fileExists, removePath } from "./lib/fs.js";
import {
  getProcessedProjectPaths,
  getProjectPaths,
  getResourcePaths,
  incomingRoot,
  processedRoot,
  projectsRoot,
  resourcesRoot
} from "./lib/paths.js";
import { listProjectSlugs, loadProjectManifest, updateProjectManifest } from "./lib/projects.js";

const LEGACY_INCOMING_ROOT = path.join(projectsRoot, "_incoming");
const RESERVED_PROJECT_DIRS = new Set(["incoming", "processed", "resources"]);
const TIMESTAMP_ARTIFACT_PATTERN = /^\d{4}-\d{2}-\d{2}t\d{2}-\d{2}-\d{2}-\d{3}z-/;

function normalizePathForCompare(value: string) {
  return path.resolve(value).replace(/[\\/]+/g, path.sep).toLowerCase();
}

function isPathInsideRoot(targetPath: string, rootPath: string) {
  const normalizedTarget = normalizePathForCompare(targetPath);
  const normalizedRoot = normalizePathForCompare(rootPath);
  return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`);
}

async function movePath(sourcePath: string, destinationPath: string) {
  await ensureDir(path.dirname(destinationPath));

  try {
    await rename(sourcePath, destinationPath);
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException | undefined)?.code;
    if (errorCode !== "EXDEV") {
      throw error;
    }

    const sourceStats = await stat(sourcePath);
    if (sourceStats.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
    } else {
      await copyFileEnsuringDir(sourcePath, destinationPath);
    }

    await removePath(sourcePath);
  }
}

async function copySnapshot(sourcePath: string, destinationDir: string) {
  await removePath(destinationDir);
  const sourceStats = await stat(sourcePath);

  if (sourceStats.isDirectory()) {
    await copyDirectory(sourcePath, destinationDir);
    return destinationDir;
  }

  const destinationPath = path.join(destinationDir, path.basename(sourcePath));
  await copyFileEnsuringDir(sourcePath, destinationPath);
  return destinationDir;
}

async function migrateLegacyIncomingBundles(warnings: string[]) {
  if (!(await fileExists(LEGACY_INCOMING_ROOT))) {
    return;
  }

  const entries = await readdir(LEGACY_INCOMING_ROOT, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const sourcePath = path.join(LEGACY_INCOMING_ROOT, entry.name);

    if (entry.name === "_processed" || entry.name === "_failed") {
      await removePath(sourcePath);
      continue;
    }

    if (entry.name === "references") {
      continue;
    }

    if (entry.name === "gemini" && entry.isDirectory()) {
      const geminiEntries = await readdir(sourcePath, { withFileTypes: true });
      for (const geminiEntry of geminiEntries) {
        if (geminiEntry.name.startsWith(".")) {
          continue;
        }

        const geminiSourcePath = path.join(sourcePath, geminiEntry.name);
        const destinationPath = path.join(incomingRoot, geminiEntry.name);
        await removePath(destinationPath);
        try {
          await movePath(geminiSourcePath, destinationPath);
        } catch (error) {
          warnings.push(`Could not move legacy Gemini bundle ${geminiSourcePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      await removePath(sourcePath);
      continue;
    }

    const destinationPath = path.join(incomingRoot, entry.name);
    await removePath(destinationPath);

    try {
      await movePath(sourcePath, destinationPath);
    } catch (error) {
      warnings.push(`Could not move legacy incoming item ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

function parseLegacyTaggedResourceFile(fileName: string) {
  const separatorIndex = fileName.indexOf("__");
  if (separatorIndex <= 0 || separatorIndex === fileName.length - 2) {
    return null;
  }

  return {
    slug: fileName.slice(0, separatorIndex),
    originalName: fileName.slice(separatorIndex + 2)
  };
}

async function migrateLegacyIncomingResources(warnings: string[]) {
  const legacyReferencesRoot = path.join(LEGACY_INCOMING_ROOT, "references");
  if (!(await fileExists(legacyReferencesRoot))) {
    return;
  }

  const entries = await readdir(legacyReferencesRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const entryPath = path.join(legacyReferencesRoot, entry.name);
    if (entry.isDirectory() && entry.name !== "all") {
      const destinationRoot = getResourcePaths(entry.name).root;
      try {
        await ensureDir(destinationRoot);
        const files = await readdir(entryPath, { withFileTypes: true });
        for (const file of files) {
          if (!file.isFile() || file.name.startsWith(".")) {
            continue;
          }

          await movePath(path.join(entryPath, file.name), path.join(destinationRoot, file.name));
        }
        await removePath(entryPath);
      } catch (error) {
        warnings.push(`Could not move legacy resource lane ${entryPath}: ${error instanceof Error ? error.message : String(error)}`);
      }
      continue;
    }

    if (entry.isDirectory() && entry.name === "all") {
      const files = await readdir(entryPath, { withFileTypes: true });
      for (const file of files) {
        if (!file.isFile() || file.name.startsWith(".")) {
          continue;
        }

        const parsed = parseLegacyTaggedResourceFile(file.name);
        if (!parsed) {
          warnings.push(`Skipped legacy tagged resource without slug: ${file.name}`);
          continue;
        }

        try {
          await movePath(
            path.join(entryPath, file.name),
            path.join(getResourcePaths(parsed.slug).root, parsed.originalName)
          );
        } catch (error) {
          warnings.push(`Could not move legacy tagged resource ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      await removePath(entryPath);
    }
  }

  await removePath(legacyReferencesRoot);
}

async function migrateProjectResources(slug: string, warnings: string[]) {
  const projectPaths = getProjectPaths(slug);
  const legacyReferencesDir = path.join(projectPaths.root, "references");
  const legacyRawDir = path.join(legacyReferencesDir, "raw");
  const legacyExtractedDir = path.join(legacyReferencesDir, "extracted");
  const resourcePaths = getResourcePaths(slug);

  await ensureDir(resourcePaths.root);
  await ensureDir(resourcePaths.extractedDir);

  if (await fileExists(legacyRawDir)) {
    const files = await readdir(legacyRawDir, { withFileTypes: true });
    for (const file of files) {
      const sourcePath = path.join(legacyRawDir, file.name);
      const destinationPath = path.join(resourcePaths.root, file.name);

      try {
        await removePath(destinationPath);
        await movePath(sourcePath, destinationPath);
      } catch (error) {
        warnings.push(`Could not move raw resource ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  if (await fileExists(legacyExtractedDir)) {
    const files = await readdir(legacyExtractedDir, { withFileTypes: true });
    for (const file of files) {
      const sourcePath = path.join(legacyExtractedDir, file.name);
      const destinationPath = path.join(resourcePaths.extractedDir, file.name);

      try {
        await removePath(destinationPath);
        await movePath(sourcePath, destinationPath);
      } catch (error) {
        warnings.push(`Could not move extracted resource ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  const nestedReferencesDir = path.join(resourcePaths.root, "references");
  if (await fileExists(nestedReferencesDir)) {
    const entries = await readdir(nestedReferencesDir, { withFileTypes: true });
    for (const entry of entries) {
      const sourcePath = path.join(nestedReferencesDir, entry.name);
      const destinationPath = path.join(resourcePaths.root, entry.name);

      try {
        await removePath(destinationPath);
        await movePath(sourcePath, destinationPath);
      } catch (error) {
        warnings.push(`Could not flatten nested resource path ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    try {
      await removePath(nestedReferencesDir);
    } catch (error) {
      warnings.push(`Could not remove nested references directory ${nestedReferencesDir}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (await fileExists(legacyReferencesDir)) {
    try {
      await removePath(legacyReferencesDir);
    } catch (error) {
      warnings.push(`Could not remove legacy references directory ${legacyReferencesDir}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

async function seedProcessedSnapshot(slug: string, warnings: string[]) {
  const manifest = await loadProjectManifest(slug);
  const projectPaths = getProjectPaths(slug);
  const processedPaths = getProcessedProjectPaths(slug);

  let snapshotSource = manifest.sourcePath;
  if (
    !snapshotSource ||
    !(await fileExists(snapshotSource)) ||
    isPathInsideRoot(snapshotSource, projectPaths.root) ||
    isPathInsideRoot(snapshotSource, processedRoot)
  ) {
    snapshotSource = projectPaths.rawDir;
  }

  try {
    const snapshotDir = await copySnapshot(snapshotSource, processedPaths.sourceDir);
    await updateProjectManifest(slug, (current) => ({
      ...current,
      sourcePath: snapshotDir,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    warnings.push(`Could not seed processed snapshot for ${slug}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function cleanupNonProjectArtifacts(activeSlugs: Set<string>, warnings: string[]) {
  const entries = await readdir(projectsRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (RESERVED_PROJECT_DIRS.has(entry.name) || activeSlugs.has(entry.name)) {
      continue;
    }

    const targetPath = path.join(projectsRoot, entry.name);
    try {
      await removePath(targetPath);
    } catch (error) {
      warnings.push(`Could not remove non-project artifact ${targetPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

function findDuplicateArtifactSlugs(slugs: string[]) {
  const slugSet = new Set(slugs);
  const duplicates = new Set<string>();

  for (const slug of slugs) {
    if (TIMESTAMP_ARTIFACT_PATTERN.test(slug)) {
      duplicates.add(slug);
      continue;
    }

    if (!slug.endsWith("-2")) {
      continue;
    }

    const baseSlug = slug.slice(0, -2);
    if (baseSlug && slugSet.has(baseSlug)) {
      duplicates.add(slug);
    }
  }

  return [...duplicates].sort((left, right) => left.localeCompare(right));
}

async function cleanupDuplicateArtifactProjects(duplicateSlugs: string[], warnings: string[]) {
  for (const slug of duplicateSlugs) {
    const projectPaths = getProjectPaths(slug);
    const resourcePaths = getResourcePaths(slug);
    const processedPaths = getProcessedProjectPaths(slug);

    for (const targetPath of [projectPaths.root, resourcePaths.root, processedPaths.root]) {
      if (!(await fileExists(targetPath))) {
        continue;
      }

      try {
        await removePath(targetPath);
      } catch (error) {
        warnings.push(`Could not remove duplicate artifact ${targetPath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}

async function main() {
  const warnings: string[] = [];

  await ensureDir(incomingRoot);
  await ensureDir(processedRoot);
  await ensureDir(resourcesRoot);

  await migrateLegacyIncomingBundles(warnings);
  await migrateLegacyIncomingResources(warnings);

  const activeSlugs = new Set(await listProjectSlugs());
  for (const slug of activeSlugs) {
    await migrateProjectResources(slug, warnings);
    await seedProcessedSnapshot(slug, warnings);
  }

  await cleanupNonProjectArtifacts(activeSlugs, warnings);
  await cleanupDuplicateArtifactProjects(findDuplicateArtifactSlugs([...activeSlugs]), warnings);
  await removePath(LEGACY_INCOMING_ROOT);

  console.log("Project layout migration complete.");
  if (warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
