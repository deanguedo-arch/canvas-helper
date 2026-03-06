import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { copyFileEnsuringDir, ensureDir, fileExists, listFilesRecursive, removePath } from "../lib/fs.js";
import { importProject } from "../lib/importer.js";
import { getProjectPaths } from "../lib/paths.js";

test("importProject scaffolds a project from a pdf-only bundle", async () => {
  const slug = `doc-bundle-import-${Date.now()}`;
  const paths = getProjectPaths(slug);
  const sourcePath = path.resolve(".runtime", "test-fixtures", slug, "bundle");
  const sourcePdf = path.resolve("canvas code and references", "CALM Module 1 - Personal Choices.pdf");

  await removePath(paths.root);
  await removePath(paths.resourceDir);
  await removePath(sourcePath);
  await ensureDir(sourcePath);
  await copyFileEnsuringDir(sourcePdf, path.join(sourcePath, path.basename(sourcePdf)));

  try {
    const result = await importProject({
      inputPath: sourcePath,
      slug,
      force: true
    });

    assert.equal(result.slug, slug);
    assert.equal(await fileExists(paths.workspaceEntrypoint), true);
    assert.equal(await fileExists(paths.manifestPath), true);

    const rawReferenceFiles = await listFilesRecursive(paths.referencesRawDir);
    assert.equal(rawReferenceFiles.some((filePath) => filePath.toLowerCase().endsWith(".pdf")), true);

    const extractedReferenceFiles = await listFilesRecursive(paths.referencesExtractedDir);
    assert.equal(extractedReferenceFiles.length > 0, true);
    assert.equal(extractedReferenceFiles.some((filePath) => filePath.toLowerCase().endsWith(".txt")), true);
  } finally {
    await removePath(paths.root);
    await removePath(paths.resourceDir);
    await removePath(sourcePath);
  }
});
