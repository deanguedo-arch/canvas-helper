import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import JSZip from "jszip";

import { validateProjectManifestPolicy } from "../lib/project-manifest-policy.js";
import {
  intakeScienceComparison,
  type ScienceComparisonIntakeRequest,
  type ScienceComparisonVariant
} from "../lib/science-comparison.js";
import type { ProjectManifest } from "../lib/types.js";

async function writeBrightspaceFixture(filePath: string, title: string, extraEntry?: { name: string; value: string }) {
  const archive = new JSZip();
  archive.file(
    "imsmanifest.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">
  <organizations><organization identifier="org"><title>${title}</title></organization></organizations>
  <resources />
</manifest>`
  );
  archive.file("course/unit-a/index.html", `<html><body><h1>${title}</h1></body></html>`);
  if (extraEntry) archive.file(extraEntry.name, extraEntry.value);
  const buffer = await archive.generateAsync({ type: "nodebuffer" });
  await writeFile(filePath, buffer);
  return { buffer, sha256: createHash("sha256").update(buffer).digest("hex") };
}

function buildRequest(repoRoot: string, primaryZip: string, referenceZip: string): ScienceComparisonIntakeRequest {
  return {
    repoRoot,
    family: "biology30-unit-a-pilot",
    courseCode: "BIO 30",
    title: "Biology 30 Unit A",
    unitTitle: "Unit A",
    primaryId: "class-2026-27",
    primaryLabel: "2026-27 class course",
    primaryZip,
    referenceId: "system-2020",
    referenceLabel: "CBE system course (2020)",
    referenceZip,
    treatments: ["faithful", "optimized"],
    synthesis: "outcome-led"
  };
}

async function withFixture(
  run: (input: { repoRoot: string; sourceRoot: string; primaryZip: string; referenceZip: string; primaryHash: string; referenceHash: string }) => Promise<void>
) {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "science-comparison-repo-"));
  const sourceRoot = await mkdtemp(path.join(os.tmpdir(), "science-comparison-sources-"));
  const primaryZip = path.join(sourceRoot, "class.zip");
  const referenceZip = path.join(sourceRoot, "system.zip");
  try {
    const primary = await writeBrightspaceFixture(primaryZip, "Class Biology 30");
    const reference = await writeBrightspaceFixture(referenceZip, "System Biology 30");
    await run({
      repoRoot,
      sourceRoot,
      primaryZip,
      referenceZip,
      primaryHash: primary.sha256,
      referenceHash: reference.sha256
    });
  } finally {
    await Promise.all([rm(repoRoot, { recursive: true, force: true }), rm(sourceRoot, { recursive: true, force: true })]);
  }
}

test("transactionally stores two named Brightspace sources once and creates exactly five blocked projects", async () => {
  await withFixture(async ({ repoRoot, primaryZip, referenceZip, primaryHash, referenceHash }) => {
    const result = await intakeScienceComparison(buildRequest(repoRoot, primaryZip, referenceZip));
    assert.equal(result.resources.length, 2);
    assert.deepEqual(
      result.variants.map((variant) => variant.slug),
      [
        "biology30-unit-a-class-2026-faithful",
        "biology30-unit-a-class-2026-optimized",
        "biology30-unit-a-system-2020-faithful",
        "biology30-unit-a-system-2020-optimized",
        "biology30-unit-a-synthesis"
      ]
    );

    const resourceManifest = JSON.parse(
      await readFile(path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/resource-manifest.json"), "utf8")
    ) as { schemaVersion: number; resources: Array<Record<string, string>> };
    assert.equal(resourceManifest.schemaVersion, 2);
    assert.deepEqual(
      resourceManifest.resources.map((resource) => ({
        id: resource.id,
        kind: resource.kind,
        role: resource.role,
        sha256: resource.sha256,
        manifestTitle: resource.manifestTitle
      })),
      [
        {
          id: "class-2026-27",
          kind: "brightspace-export",
          role: "primary",
          sha256: primaryHash,
          manifestTitle: "Class Biology 30"
        },
        {
          id: "system-2020",
          kind: "brightspace-export",
          role: "reference",
          sha256: referenceHash,
          manifestTitle: "System Biology 30"
        }
      ]
    );
    assert.deepEqual((await readdir(path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/_sources"))).sort(), [
      `${primaryHash}.zip`,
      `${referenceHash}.zip`
    ].sort());

    const contract = JSON.parse(
      await readFile(path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/comparison-contract.json"), "utf8")
    ) as { schemaVersion: number; variants: ScienceComparisonVariant[]; evaluationRubric: { totalPoints: number; criteria: Array<{ points: number }> } };
    assert.equal(contract.schemaVersion, 1);
    assert.equal(contract.variants.length, 5);
    assert.equal(contract.evaluationRubric.totalPoints, 100);
    assert.equal(contract.evaluationRubric.criteria.reduce((sum, criterion) => sum + criterion.points, 0), 100);

    for (const variant of result.variants) {
      const projectDir = path.join(repoRoot, "projects", variant.slug);
      const manifest = JSON.parse(await readFile(path.join(projectDir, "meta/project.json"), "utf8")) as ProjectManifest;
      assert.equal(validateProjectManifestPolicy(manifest).status, "valid");
      assert.equal(manifest.authoringStatus, "blocked");
      assert.equal(manifest.authoring?.driverId, "proposal-only-v1");
      assert.equal(manifest.authoring?.studioEditing?.enabled, false);
      assert.deepEqual(manifest.authoring?.sourceResourceIds, variant.sourceResourceIds);
      await assert.rejects(readFile(path.join(projectDir, "workspace/index.html"), "utf8"));
    }
  });
});

test("refuses duplicate targets before copying and preserves the existing project", async () => {
  await withFixture(async ({ repoRoot, primaryZip, referenceZip }) => {
    const request = buildRequest(repoRoot, primaryZip, referenceZip);
    await intakeScienceComparison(request);
    const marker = path.join(repoRoot, "projects/biology30-unit-a-class-2026-faithful/meta/decision-log.md");
    const before = await readFile(marker, "utf8");
    await assert.rejects(intakeScienceComparison(request), /target already exists/);
    assert.equal(await readFile(marker, "utf8"), before);
  });
});

test("rolls back every promoted comparison target when a later promotion fails", async () => {
  await withFixture(async ({ repoRoot, primaryZip, referenceZip }) => {
    const request = buildRequest(repoRoot, primaryZip, referenceZip);
    let collisionPath = "";
    request.testHooks = {
      beforePromote: async (targetPath, index) => {
        if (index !== 3) return;
        collisionPath = targetPath;
        await mkdir(targetPath, { recursive: true });
        await writeFile(path.join(targetPath, "external-marker.txt"), "do not remove", "utf8");
      }
    };
    await assert.rejects(intakeScienceComparison(request));
    await assert.rejects(readFile(path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/resource-manifest.json"), "utf8"));
    await assert.rejects(readFile(path.join(repoRoot, "projects/biology30-unit-a-class-2026-faithful/meta/project.json"), "utf8"));
    await assert.rejects(readFile(path.join(repoRoot, "projects/biology30-unit-a-class-2026-optimized/meta/project.json"), "utf8"));
    assert.equal(await readFile(path.join(collisionPath, "external-marker.txt"), "utf8"), "do not remove");
    await assert.rejects(readFile(path.join(repoRoot, "projects/biology30-unit-a-synthesis/meta/project.json"), "utf8"));
  });
});

test("validates named resource IDs and rejects unsafe archive entries", async () => {
  await withFixture(async ({ repoRoot, sourceRoot, primaryZip, referenceZip }) => {
    const invalidIdRequest = buildRequest(repoRoot, primaryZip, referenceZip);
    invalidIdRequest.primaryId = "Class Course";
    await assert.rejects(intakeScienceComparison(invalidIdRequest), /stable ID/);

    const unsafeZip = path.join(sourceRoot, "unsafe.zip");
    await writeBrightspaceFixture(unsafeZip, "Unsafe Biology", { name: "../teacher-key.txt", value: "secret" });
    const unsafeRequest = buildRequest(repoRoot, unsafeZip, referenceZip);
    await assert.rejects(intakeScienceComparison(unsafeRequest), /Unsafe Brightspace archive path/);
    await assert.rejects(readFile(path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/resource-manifest.json"), "utf8"));
  });
});
