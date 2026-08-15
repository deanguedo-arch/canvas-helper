import test from "node:test";
import assert from "node:assert/strict";

import {
  STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
  STUDIO_ROUTINE_CONTENT_PROFILE_ID
} from "../../app/shared/course-editability.js";

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

test("normalization preserves a declared code-owned authoring driver", () => {
  const normalized = normalizeProjectManifestPolicy(
    createManifest({
      authoring: {
        driverId: "social-related-issues-v1",
        familyId: "social30-related-issues",
        sourceResourceIds: ["social30-main-zip", "social30-main-zip"],
        qualityProfile: "social-related-issues"
      }
    })
  );

  assert.deepEqual(normalized.authoring, {
    driverId: "social-related-issues-v1",
    familyId: "social30-related-issues",
    sourceResourceIds: ["social30-main-zip"],
    qualityProfile: "social-related-issues"
  });
});

test("normalization preserves the explicit legacy snapshot driver", () => {
  const normalized = normalizeProjectManifestPolicy(
    createManifest({
      authoring: {
        driverId: "legacy-snapshot-v1",
        familyId: "legacy-snapshot",
        studioEditing: { enabled: true, imageAssets: true }
      }
    })
  );

  assert.deepEqual(normalized.authoring, {
    driverId: "legacy-snapshot-v1",
    familyId: "legacy-snapshot",
    studioEditing: { enabled: true, imageAssets: true }
  });
});

test("normalization preserves a valid versioned Studio editability contract", () => {
  const normalized = normalizeProjectManifestPolicy(
    createManifest({
      authoring: {
        driverId: "direct-workspace-v1",
        studioEditing: { enabled: true, renameCourse: true, imageAssets: true },
        editabilityContract: {
          schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
          profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
        }
      }
    })
  );

  assert.deepEqual(normalized.authoring?.editabilityContract, {
    schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
    profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
  });
});

test("validation rejects an invalid or unsafe Studio editability contract", () => {
  const invalid = createManifest({
    migrationState: "migrated",
    authoringStatus: "active",
    projectType: "generated-course",
    preferredWorkflows: ["generated-course"],
    canonicalEntry: "/tmp/workspace/index.html",
    canonicalSources: ["/tmp/workspace/index.html"],
    exportTargets: [{ target: "html", enabled: true }],
    authoring: {
      driverId: "legacy-snapshot-v1",
      studioEditing: { enabled: true },
      editabilityContract: {
        schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
        profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
      }
    }
  });
  const result = validateProjectManifestPolicy(invalid);
  assert.equal(result.status, "invalid");
  assert.ok(result.errors.some((error) => error.includes("legacy snapshot")));

  invalid.authoring!.editabilityContract = { schemaVersion: 2, profileId: "unknown" } as never;
  const malformed = validateProjectManifestPolicy(invalid);
  assert.equal(malformed.status, "invalid");
  assert.ok(malformed.errors.some((error) => error.includes("supported versioned Studio")));
});

test("validation rejects an unsupported declared authoring driver", () => {
  const result = validateProjectManifestPolicy(
    createManifest({
      migrationState: "migrated",
      authoringStatus: "active",
      projectType: "conversion",
      preferredWorkflows: ["conversion"],
      canonicalEntry: "/tmp/workspace/index.html",
      canonicalSources: ["/tmp/workspace/index.html"],
      exportTargets: [{ target: "html", enabled: true }],
      authoring: { driverId: "not-a-driver" as never }
    })
  );

  assert.equal(result.status, "invalid");
  assert.ok(result.errors.some((line) => line.includes("supported `driverId`")));
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
