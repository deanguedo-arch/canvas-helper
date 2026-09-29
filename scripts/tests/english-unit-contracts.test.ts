import assert from "node:assert/strict";
import test from "node:test";

import {
  ELA2_COURSE_IDS,
  createEla2CourseManifest,
  createEla2RecipeSeeds,
  getEla2TeacherResourceMap,
  getEla2UnitSeeds
} from "../lib/english-unit/ela2-course-seeds.js";
import { createEla20ShortStoriesPilotRecipe } from "../lib/english-unit/pilot-recipe.js";
import {
  EnglishContractValidationError,
  EnglishEvidenceEntryV2Schema,
  EnglishUnitRecipeV3Schema,
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
          },
          {
            id: "supplemental-audit",
            kind: "audit-reference",
            path: "projects/resources/ela20-1/_sources/audit.zip",
            sha256: "b".repeat(64)
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
      assert.ok(error.issues.some((issue) => issue.code === "audit_reference_inventory_required"));
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

test("ELA -2 V3 seed matrix creates all thirteen units with ordered writing forms", () => {
  const expectedSlugs = [
    "ela10-2-writing-foundations",
    "ela10-2-short-stories",
    "ela10-2-modern-play-dracula",
    "ela10-2-novel-study",
    "ela10-2-film-study",
    "ela20-2-short-stories",
    "ela20-2-modern-play-crucible",
    "ela20-2-novel-study",
    "ela20-2-film-study",
    "ela30-2-short-stories-visual-literacy",
    "ela30-2-modern-drama-streetcar",
    "ela30-2-novel-study",
    "ela30-2-film-study"
  ];
  const recipes = ELA2_COURSE_IDS.flatMap((courseId) =>
    createEla2RecipeSeeds({
      courseId,
      brightspaceArchivePath: `projects/resources/${courseId}/_sources/brightspace.zip`,
      teacherArchivePath: `projects/resources/${courseId}/_sources/teacher-resources.zip`
    })
  );

  assert.deepEqual(recipes.map((recipe) => recipe.projectSlug), expectedSlugs);
  assert.equal(recipes.length, 13);
  for (const recipe of recipes) {
    const parsed = EnglishUnitRecipeV3Schema.parse(recipe);
    assert.equal(parsed.schemaVersion, 3);
    assert.equal(parsed.courseCode.endsWith("-2"), true);
    assert.equal(parsed.activityProfile.activities.some((activity) => activity.id === "critical-essay"), false);
    assert.equal(parsed.acceptance.requiredRoutes.includes("critical-essay"), false);
    assert.deepEqual(
      parsed.writingForms.map((form) => form.kind),
      parsed.activityProfile.kind === "writing-foundations"
        ? []
        : parsed.courseCode === "ELA 30-2"
        ? ["literary-exploration", "personal-response", "visual-response"]
        : ["literary-exploration", "personal-response"]
    );
  }
});

test("ELA 30-2 Short Stories provides guided questions when the selected source contains no question sheet", () => {
  const recipe = createEla2RecipeSeeds({
    courseId: "ela30-2",
    brightspaceArchivePath: "projects/resources/ela30-2/_sources/brightspace.zip",
    teacherArchivePath: "projects/resources/ela30-2/_sources/teacher-resources.zip"
  }).find((candidate) => candidate.projectSlug === "ela30-2-short-stories-visual-literacy");

  assert.ok(recipe);
  const byReading = new Map(recipe.readings.map((reading) => [reading.id, reading]));
  assert.equal(byReading.get("god-is-not-a-fish-inspector")?.questionPrompts?.length, 8);
  assert.equal(byReading.get("mother-and-son")?.questionPrompts?.length, 8);
  assert.equal(byReading.get("old-man")?.questionPrompts?.length, 8);
  assert.equal(
    byReading.get("warren-pryor")?.questionPrompts,
    undefined,
    "Warren Pryor must continue using the four questions printed in its teacher PDF"
  );
  assert.deepEqual(
    byReading.get("god-is-not-a-fish-inspector")?.questionPrompts?.map((prompt) => prompt.id),
    Array.from({ length: 8 }, (_, index) => `question-${index + 1}`)
  );
  const routes = recipe.activityProfile.activities.map((activity) => activity.route);
  assert.equal(routes.includes("film-room"), true);
  assert.equal(routes.includes("resources"), true);
  assert.equal(routes.includes("materials"), false);
  assert.equal(recipe.mediaPolicy.allowedYouTubeIds.length, 9);
  assert.equal(recipe.analysisTerms.length, 8);
  assert.equal(recipe.analysisExamples.length, 32);
  for (const reading of recipe.readings) {
    const examples = recipe.analysisExamples.filter((example) => example.readingId === reading.id);
    assert.equal(examples.length, 8, `${reading.title} should model all eight analysis terms`);
    assert.equal(new Set(examples.map((example) => example.termId)).size, 8);
    assert.equal(examples.every((example) => example.evidenceMoment.trim() && example.analysis.trim()), true);
  }
});

test("ELA 10-2 Writing Foundations uses the exact page allowlist and dedicated profile", () => {
  const seeds = getEla2UnitSeeds("ela10-2");
  const writingFoundations = seeds.find((seed) => seed.manifest.projectSlug === "ela10-2-writing-foundations");
  assert.ok(writingFoundations);
  assert.equal(writingFoundations.manifest.activityProfile, "writing-foundations");
  assert.deepEqual(
    writingFoundations.selectors.filter((selector) => selector.disposition === "include").map((selector) => selector.itemId),
    ["3351", "3352", "3353", "3354", "3355", "3356", "3357"]
  );
  assert.deepEqual(writingFoundations.manifest.brightspaceUnitIds, [
    "3349",
    "3350",
    "3351",
    "3352",
    "3353",
    "3354",
    "3355",
    "3356",
    "3357"
  ]);
});

test("ELA 10-2 Dracula seed scopes clean source pages and includes Act III", () => {
  const recipe = createEla2RecipeSeeds({
    courseId: "ela10-2",
    brightspaceArchivePath: "projects/resources/ela10-2/_sources/brightspace.zip",
    teacherArchivePath: "projects/resources/ela10-2/_sources/teacher-resources.zip"
  }).find((candidate) => candidate.projectSlug === "ela10-2-modern-play-dracula");
  assert.ok(recipe);
  assert.equal(recipe.activityProfile.kind, "modern-drama");
  assert.deepEqual(recipe.activityProfile.actIds, ["act-1", "act-2", "act-3"]);

  const script = recipe.resourceDispositions.find((resource) => resource.id === "dracula-script");
  const assignments = recipe.resourceDispositions.find((resource) => resource.id === "dracula-assignments");
  const vocabulary = recipe.resourceDispositions.find((resource) => resource.id === "dracula-vocabulary");
  assert.equal(script?.disposition, "source-only");
  assert.deepEqual(script?.sourcePages, [{ start: 3, end: 12 }, { start: 14, end: 18 }, { start: 20, end: 26 }]);
  assert.equal(assignments?.disposition, "source-only");
  assert.deepEqual(assignments?.sourcePages, [
    { start: 15, end: 15 },
    { start: 17, end: 20 },
    { start: 25, end: 25 },
    { start: 27, end: 28 }
  ]);
  assert.equal(vocabulary?.role, "question-set");
  assert.equal(vocabulary?.disposition, "review-required");
  assert.equal(vocabulary?.destination, "vocabulary-practice");

  const unsafe = structuredClone(recipe);
  unsafe.resourceDispositions.find((resource) => resource.id === "dracula-script")!.disposition = "place";
  assert.throws(() => parseEnglishUnitRecipe(unsafe), /Page-scoped PDF resources must be source-only/);
});

test("ELA 10-2 routes every unit through Resources without a Materials route", () => {
  const recipes = createEla2RecipeSeeds({
    courseId: "ela10-2",
    brightspaceArchivePath: "projects/resources/ela10-2/_sources/brightspace.zip",
    teacherArchivePath: "projects/resources/ela10-2/_sources/teacher-resources.zip"
  });

  assert.equal(recipes.length, 5);
  for (const recipe of recipes) {
    const routes = recipe.activityProfile.activities
      .filter((activity) => activity.enabled)
      .map((activity) => activity.route);
    assert.ok(routes.includes("resources"), `${recipe.projectSlug} should include Resources`);
    assert.ok(!routes.includes("materials"), `${recipe.projectSlug} should not include Materials`);
    assert.ok(recipe.acceptance.requiredRoutes.includes("resources"));
    assert.ok(!recipe.acceptance.requiredRoutes.includes("materials"));
  }
});

test("ELA -2 manifests and teacher maps preserve review status and gate exclusions", () => {
  for (const courseId of ELA2_COURSE_IDS) {
    const existingReviewStatuses = new Map([[getEla2UnitSeeds(courseId)[0]!.manifest.projectSlug, "blocked" as const]]);
    const manifest = parseEnglishCourseManifest(createEla2CourseManifest({
      courseId,
      archives: [
        { id: "brightspace", kind: "brightspace", path: "brightspace.zip", sha256: "a".repeat(64) },
        { id: "teacher-resources", kind: "teacher-resources", path: "teacher.zip", sha256: "b".repeat(64) }
      ],
      generatedAt: "2026-07-22T12:00:00.000Z",
      existingReviewStatuses
    }));
    assert.equal(manifest.units[0]?.reviewStatus, "blocked");

    const resources = [...getEla2TeacherResourceMap(courseId).values()].map((entry) => entry.resource);
    const gates = resources.filter((resource) => /(?:soft|hard)[ _-]*gate/i.test(resource.source));
    assert.ok(gates.length > 0);
    assert.equal(gates.every((resource) => resource.role === "excluded-assessment" && resource.disposition === "exclude"), true);
    assert.equal(resources.some((resource) => /(?:soft|hard)[ _-]*gate/i.test(resource.source) && resource.disposition === "place"), false);
  }
});
