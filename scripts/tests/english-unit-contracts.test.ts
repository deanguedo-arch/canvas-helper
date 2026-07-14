import assert from "node:assert/strict";
import test from "node:test";

import { createEla20ShortStoriesPilotRecipe } from "../lib/english-unit/pilot-recipe.js";
import {
  EnglishContractValidationError,
  EnglishEvidenceEntryV2Schema,
  adaptEnglishUnitRecipeV1,
  parseEnglishCourseManifest,
  parseEnglishUnitRecipe,
  validateEnglishUnitRecipeCrossReferences
} from "../lib/english-unit/schema.js";

const pilotRecipe = () =>
  createEla20ShortStoriesPilotRecipe({
    projectSlug: "ela20-1-short-stories-pilot",
    brightspaceRawFile: "brightspace.zip",
    teacherRawFile: "teacher.zip",
    unitId: "53033"
  });

test("adapts a V1 English recipe to the V2 short-fiction profile", () => {
  const parsed = parseEnglishUnitRecipe(pilotRecipe());

  assert.equal(parsed.schemaVersion, 2);
  assert.equal(parsed.activityProfile.kind, "short-fiction");
  assert.equal(parsed.source.lessonSelectors[0]?.itemId, "53033");
  assert.equal(parsed.source.lessonSelectors[0]?.includeChildren, true);
  assert.equal(parsed.resourceDispositions.filter((resource) => resource.disposition === "exclude").length, 3);
});

test("reports V2 cross-reference and preserved-component path failures", () => {
  const recipe = adaptEnglishUnitRecipeV1(pilotRecipe());
  recipe.acceptance.requiredActivityIds.push("missing-activity");
  recipe.customComponents.push({
    id: "unsafe-component",
    slot: "writing-studio",
    mode: "extend",
    source: "workspace/generated/component.html",
    assetRoot: "workspace/assets/generated",
    enabled: true
  });

  const issues = validateEnglishUnitRecipeCrossReferences(recipe);
  assert.ok(issues.some((issue) => issue.code === "unknown_required_activity"));
  assert.ok(issues.some((issue) => issue.code === "component_source_outside_preserved_root"));
  assert.ok(issues.some((issue) => issue.code === "component_assets_outside_preserved_root"));
});

test("course manifests require both shared archives and matching profile versions", () => {
  assert.throws(
    () =>
      parseEnglishCourseManifest({
        schemaVersion: 1,
        courseId: "ela20-1",
        courseCode: "ELA 20-1",
        courseTitle: "English Language Arts 20-1",
        profileId: "next-step-english",
        profileVersion: "1.0.0",
        archives: [
          {
            id: "brightspace",
            kind: "brightspace",
            path: "projects/resources/ela20-1/_sources/brightspace.zip",
            sha256: "a".repeat(64)
          }
        ],
        units: [
          {
            projectSlug: "ela20-1-short-stories-pilot",
            unitTitle: "Short Stories",
            recipePath: "projects/ela20-1-short-stories-pilot/meta/english-unit.json",
            profileVersion: "2.0.0",
            activityProfile: "short-fiction",
            brightspaceUnitIds: ["53033"],
            reviewStatus: "needs-review"
          }
        ]
      }),
    (error) => {
      assert.ok(error instanceof EnglishContractValidationError);
      assert.ok(error.issues.some((issue) => issue.code === "missing_course_archive"));
      assert.ok(error.issues.some((issue) => issue.code === "unit_profile_version_mismatch"));
      return true;
    }
  );
});

test("evidence entries require deliberate saved content or response ids", () => {
  const base = {
    schemaVersion: 2,
    contributionId: "ela20-1:macbeth:act-1",
    projectSlug: "ela20-1-shakespeare-macbeth",
    entryKind: "collection",
    source: { kind: "question-set", id: "macbeth-act-1" },
    activity: { id: "act-questions", profile: "shakespeare-drama" },
    tags: ["macbeth", "act-1"],
    createdAt: "2026-07-14T10:00:00-06:00",
    updatedAt: "2026-07-14T10:00:00-06:00"
  };

  assert.equal(EnglishEvidenceEntryV2Schema.safeParse(base).success, false);
  assert.equal(
    EnglishEvidenceEntryV2Schema.safeParse({ ...base, responseIds: ["macbeth:act-1:q1"] }).success,
    true
  );
});
