import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { fileExists, listFilesRecursive, removePath } from "../lib/fs.js";
import { importProject } from "../lib/importer.js";
import { getProjectPaths } from "../lib/paths.js";

const sourcePath = path.resolve("projects/_incoming/calm 3");

test("importProject scaffolds a project from a docx/pdf-only bundle", async () => {
  const slug = `doc-bundle-import-${Date.now()}`;
  const paths = getProjectPaths(slug);

  await removePath(paths.root);

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
    assert.equal(rawReferenceFiles.some((filePath) => filePath.toLowerCase().endsWith(".docx")), true);
    assert.equal(rawReferenceFiles.some((filePath) => filePath.toLowerCase().endsWith(".pdf")), true);

    const extractedReferenceFiles = await listFilesRecursive(paths.referencesExtractedDir);
    assert.equal(extractedReferenceFiles.length > 0, true);
    assert.equal(extractedReferenceFiles.some((filePath) => filePath.toLowerCase().endsWith(".txt")), true);
  } finally {
    await removePath(paths.root);
  }
});
