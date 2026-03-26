import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { removePath } from "../lib/fs.js";
import { buildCourseShellSourceMetadataByHref } from "../lib/course-shell-resources.js";
import type { ReferenceIndex, ResourceCatalog } from "../lib/types.js";

test("buildCourseShellSourceMetadataByHref extracts normalized preview text by relative path", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "course-shell-resources-"));
  const extractedPath = path.join(tempDir, "lesson.txt");

  await writeFile(
    extractedPath,
    "  This is the first sentence.\n\nThis is the second sentence with extra spacing.  ",
    "utf8"
  );

  const referenceIndex: ReferenceIndex = {
    projectId: "forensics35",
    generatedAt: "2026-03-18T00:00:00.000Z",
    references: [
      {
        id: "content-1",
        originalPath: "x",
        relativePath: "сontent\\i123\\Content\\lesson.html",
        kind: "html",
        extractionStatus: "indexed",
        extractionMethod: "native",
        extractedTextPath: extractedPath
      }
    ]
  };

  const metadata = await buildCourseShellSourceMetadataByHref({
    referenceIndex,
    previewMaxLength: 80
  });

  assert.equal(
    metadata["сontent/i123/Content/lesson.html"]?.contentPreview,
    "This is the first sentence. This is the second sentence with extra spacing."
  );
  assert.equal(
    metadata["сontent/i123/Content/lesson.html"]?.contentBody,
    "This is the first sentence.\n\nThis is the second sentence with extra spacing."
  );

  await removePath(tempDir);
});

test("buildCourseShellSourceMetadataByHref falls back to resource catalog and truncates long previews", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "course-shell-resources-catalog-"));
  const extractedPath = path.join(tempDir, "assignment.txt");

  await writeFile(
    extractedPath,
    "A".repeat(90),
    "utf8"
  );

  const resourceCatalog: ResourceCatalog = {
    projectId: "forensics35",
    generatedAt: "2026-03-18T00:00:00.000Z",
    warnings: [],
    resources: [
      {
        id: "assignment-1",
        originalPath: "x",
        relativePath: "assignment/i123/assignment.xml",
        kind: "other",
        extractionStatus: "indexed",
        extractionMethod: "native",
        extractedTextPath: extractedPath,
        chunkCount: 1,
        titleGuess: "Assignment",
        resourceCategory: "assessment",
        authorityRole: "assessment-authoritative",
        blueprintSignals: [],
        assessmentSignals: [],
        supportSignals: []
      }
    ]
  };

  const metadata = await buildCourseShellSourceMetadataByHref({
    resourceCatalog,
    previewMaxLength: 40
  });

  assert.equal(metadata["assignment/i123/assignment.xml"]?.contentPreview.endsWith("…"), true);
  assert.equal(metadata["assignment/i123/assignment.xml"]?.contentPreview.length <= 40, true);
  assert.equal(metadata["assignment/i123/assignment.xml"]?.contentBody, "A".repeat(90));

  await removePath(tempDir);
});
