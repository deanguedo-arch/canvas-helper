import test from "node:test";
import assert from "node:assert/strict";

import { normalizeProjectManifestPolicy, validateProjectManifestPolicy } from "../lib/project-manifest-policy.js";
import type { ProjectManifest } from "../lib/types.js";

function createManifest(overrides: Partial<ProjectManifest> = {}): ProjectManifest {
  const base: ProjectManifest = {
    id: "policy-fixture",
    slug: "policy-fixture",
    sourcePath: "/tmp/source",
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["raw", "workspace"],
    workspaceEntrypoint: "/tmp/workspace/index.html",
    rawEntrypoint: "/tmp/raw/original.html",
    learningSource: "other",
    learningTrust: "auto",
    learningUpdatedAt: "2026-03-21T00:00:00.000Z",
    createdAt: "2026-03-21T00:00:00.000Z",
    updatedAt: "2026-03-21T00:00:00.000Z",
    ...overrides
  };

  return base;
}

test("validation skips legacy manifests", () => {
  const result = validateProjectManifestPolicy(createManifest({ migrationState: "legacy" }));
  assert.equal(result.status, "skipped-legacy");
  assert.equal(result.errors.length, 0);
});

test("validation fails migrated active manifests with missing source-of-truth fields", () => {
  const result = validateProjectManifestPolicy(
    createManifest({
      migrationState: "migrated",
      authoringStatus: "active",
      projectType: "conversion",
      preferredWorkflows: ["conversion"]
    })
  );

  assert.equal(result.status, "invalid");
  assert.ok(result.errors.some((line) => line.includes("canonicalEntry")));
  assert.ok(result.errors.some((line) => line.includes("canonicalSources")));
  assert.ok(result.errors.some((line) => line.includes("exportTargets")));
});

test("validation passes migrated active manifests with required policy fields", () => {
  const result = validateProjectManifestPolicy(
    createManifest({
      migrationState: "migrated",
      authoringStatus: "active",
      projectType: "generated-course",
      preferredWorkflows: ["generated-course", "injection/integration"],
      canonicalEntry: "/tmp/workspace/index.html",
      canonicalSources: ["/tmp/workspace/index.html", "/tmp/workspace/main.jsx"],
      generatedOutputs: ["/tmp/workspace/main.js"],
      regenerateCommand: "npm.cmd run build:studio",
      exportTargets: [{ target: "google-hosted", enabled: true }],
      referenceOnly: ["/tmp/workspace/reference-only.jsx"]
    })
  );

  assert.equal(result.status, "valid");
  assert.equal(result.errors.length, 0);
});

test("normalization defaults unknown policy values safely", () => {
  const normalized = normalizeProjectManifestPolicy(
    createManifest({
      migrationState: "not-real" as never,
      authoringStatus: "also-not-real" as never,
      preferredWorkflows: ["conversion", "not-real"] as never
    })
  );

  assert.equal(normalized.migrationState, "legacy");
  assert.equal(normalized.authoringStatus, "active");
  assert.deepEqual(normalized.preferredWorkflows, ["conversion"]);
});

test("normalization preserves apps-script export targets", () => {
  const normalized = normalizeProjectManifestPolicy(
    createManifest({
      exportTargets: [
        {
          target: "apps-script",
          enabled: true,
          notes: "Google Sites package"
        } as NonNullable<ProjectManifest["exportTargets"]>[number]
      ]
    })
  );

  assert.deepEqual(normalized.exportTargets, [
    { target: "apps-script", enabled: true, notes: "Google Sites package" }
  ]);
});

test("normalization preserves docx export targets", () => {
  const normalized = normalizeProjectManifestPolicy(
    createManifest({
      exportTargets: [
        {
          target: "docx",
          enabled: true,
          notes: "Word document pilot export"
        } as NonNullable<ProjectManifest["exportTargets"]>[number]
      ]
    })
  );

  assert.deepEqual(normalized.exportTargets, [
    { target: "docx", enabled: true, notes: "Word document pilot export" }
  ]);
});
