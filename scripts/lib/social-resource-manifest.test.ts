import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { resolveSocial30SourceResource } from "./social-resource-manifest.js";

const MANIFEST_PATH = "projects/resources/social30-1-related-issues/resource-manifest.json";
const SOURCE_PATH = "projects/resources/social30-1-related-issues/_sources/social30.zip";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function writeFixture(repoRoot: string, content: string, checksum = sha256(content)) {
  const sourcePath = path.join(repoRoot, SOURCE_PATH);
  const manifestPath = path.join(repoRoot, MANIFEST_PATH);
  await Promise.all([mkdir(path.dirname(sourcePath), { recursive: true }), mkdir(path.dirname(manifestPath), { recursive: true })]);
  await writeFile(sourcePath, content);
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        familyId: "social30-1-related-issues",
        resources: [
          {
            id: "fixture-social30",
            kind: "brightspace-zip",
            path: SOURCE_PATH,
            sha256: checksum,
            availability: "canonical",
            provenance: { sourceSystem: "brightspace", description: "Test Brightspace export." }
          }
        ]
      },
      null,
      2
    )}\n`
  );
}

test("resolves a declared, checksum-verified Social source resource", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-social-resource-"));
  try {
    await writeFixture(repoRoot, "fixture zip bytes");
    const resource = await resolveSocial30SourceResource({
      repoRoot,
      manifestPath: MANIFEST_PATH,
      resourceId: "fixture-social30"
    });

    assert.equal(resource.path, SOURCE_PATH);
    assert.equal(resource.availability, "canonical");
    assert.equal(resource.absolutePath, path.join(repoRoot, SOURCE_PATH));
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("rejects a Social source whose bytes no longer match the declared checksum", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-social-resource-"));
  try {
    await writeFixture(repoRoot, "fixture zip bytes", sha256("different bytes"));
    await assert.rejects(
      resolveSocial30SourceResource({ repoRoot, manifestPath: MANIFEST_PATH, resourceId: "fixture-social30" }),
      /checksum mismatch/
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("rejects an unresolved Git LFS pointer even when its checksum matches", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-social-resource-"));
  const lfsPointer = "version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 1\n";
  try {
    await writeFixture(repoRoot, lfsPointer);
    await assert.rejects(
      resolveSocial30SourceResource({ repoRoot, manifestPath: MANIFEST_PATH, resourceId: "fixture-social30" }),
      /unresolved Git LFS pointer/
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
