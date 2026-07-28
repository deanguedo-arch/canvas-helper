import assert from "node:assert/strict";
import test from "node:test";

import {
  createEla10CourseManifest,
  createEla10RecipeSeeds,
  ELA10_FILM_DONOR_LESSON_IDS,
  ELA10_FILM_LESSON_DONOR_ARCHIVE,
  ELA10_PROFILE_VERSION,
  ELA10_SHORT_STORY_ANALYSIS_EXAMPLES,
  ELA10_SHORT_STORY_ANALYSIS_TERMS,
  ELA10_UNIT_SEEDS,
  getEla10TeacherResourceMap
} from "./ela10-course-seeds.js";
import { MERCHANT_FOUNDATION_LESSON_IDS } from "./merchant-foundation-lessons.js";

const recipes = createEla10RecipeSeeds({
  brightspaceArchivePath: "projects/resources/ela10-1/brightspace.zip",
  teacherArchivePath: "projects/resources/ela10-1/spo-format-key.zip"
});
const bySlug = new Map(recipes.map((recipe) => [recipe.projectSlug, recipe]));

test("ELA 10-1 manifest preserves the SPO unit order and five activity profiles", () => {
  const manifest = createEla10CourseManifest({ archives: [], generatedAt: "2026-07-16T00:00:00.000Z" });
  assert.equal(manifest.profileVersion, ELA10_PROFILE_VERSION);
  assert.deepEqual(manifest.units.map((unit) => unit.projectSlug), [
    "ela10-1-short-stories",
    "ela10-1-shakespeare-merchant-of-venice",
    "ela10-1-novel-study",
    "ela10-1-modern-play-fences",
    "ela10-1-film-study"
  ]);
  assert.deepEqual(manifest.units.map((unit) => unit.activityProfile), [
    "short-fiction",
    "shakespeare-drama",
    "novel-study",
    "modern-drama",
    "film-study"
  ]);
  assert.equal(ELA10_UNIT_SEEDS.length, 5);
});

test("ELA 10-1 recipes use only explicit instructional Brightspace lesson files", () => {
  const included = (slug: string) => {
    const recipe = bySlug.get(slug);
    assert.ok(recipe && recipe.schemaVersion === 2);
    return recipe.source.lessonSelectors.filter((selector) => selector.disposition === "include").map((selector) => selector.itemId);
  };
  assert.deepEqual(included("ela10-1-shakespeare-merchant-of-venice"), []);
  assert.deepEqual(included("ela10-1-novel-study"), ["1473151"]);
  assert.deepEqual(included("ela10-1-modern-play-fences"), ["1473101", "1473096", "1473100"]);
  assert.deepEqual(included("ela10-1-film-study"), ELA10_FILM_DONOR_LESSON_IDS);
});

test("ELA 10-1 assigned works and activity profiles come from the SPO format key", () => {
  const shortStories = bySlug.get("ela10-1-short-stories");
  assert.ok(shortStories && shortStories.schemaVersion === 1);
  assert.deepEqual(shortStories.readings.map((reading) => reading.title), [
    "The Cask of Amontillado",
    "Flight into Danger",
    "The Flying Machine",
    "Harrison Bergeron",
    "I Am a Rock"
  ]);
  assert.equal(shortStories.readings[0]?.questionPrompts?.length, 10);

  const merchant = bySlug.get("ela10-1-shakespeare-merchant-of-venice");
  assert.ok(merchant && merchant.schemaVersion === 2 && merchant.activityProfile.kind === "shakespeare-drama");
  assert.equal(merchant.activityProfile.activities.find((activity) => activity.id === "side-by-side-reader")?.enabled, true);
  assert.equal(merchant.activityProfile.sceneCount, 20);
  assert.equal(merchant.activityProfile.actIds.length, 5);
  assert.deepEqual(merchant.activityProfile.characterIds, ["antonio", "bassanio", "portia", "shylock", "jessica", "lorenzo"]);
  assert.equal(merchant.resourceDispositions.find((resource) => resource.id === "mov-questions")?.disposition, "exclude");
  assert.equal(merchant.resourceDispositions.filter((resource) => /mov-act-[345]-text/.test(resource.id)).every((resource) => resource.role === "question-set" && resource.destination === "act-questions"), true);
  assert.equal(merchant.customComponents?.some((component) => component.source === "workspace/components/shakespeare-side-by-side/scenes.json" && component.enabled), true);
  assert.equal(merchant.customComponents?.some((component) => component.source === "workspace/components/shakespeare-foundation-lessons/lessons.json" && component.enabled), true);
  assert.deepEqual(merchant.lessonOrder, [...MERCHANT_FOUNDATION_LESSON_IDS]);

  const novel = bySlug.get("ela10-1-novel-study");
  assert.ok(novel && novel.schemaVersion === 2 && novel.activityProfile.kind === "novel-study");
  assert.deepEqual(novel.activityProfile.novels.map((track) => track.title), ["To Kill a Mockingbird", "The Boy in the Striped Pyjamas"]);

  const fences = bySlug.get("ela10-1-modern-play-fences");
  assert.ok(fences && fences.schemaVersion === 2 && fences.activityProfile.kind === "modern-drama");
  assert.deepEqual(fences.activityProfile.actIds, ["act-one", "act-two"]);
  assert.equal(fences.activityProfile.activities.find((activity) => activity.id === "script-reader")?.route, "script-reader");
  assert.ok(fences.resourceDispositions.some((resource) => resource.id === "fences-script" && resource.disposition === "place"));
  assert.deepEqual(fences.resourceDispositions.filter((resource) => resource.role === "question-set").map((resource) => resource.title), ["Fences Act I, Scene 2 Questions", "Fences Act II, Scene 4 Questions"]);

  const film = bySlug.get("ela10-1-film-study");
  assert.ok(film && film.schemaVersion === 2 && film.activityProfile.kind === "film-study");
  assert.equal(film.source.brightspaceZip, ELA10_FILM_LESSON_DONOR_ARCHIVE);
  assert.deepEqual(film.lessonOrder, ELA10_FILM_DONOR_LESSON_IDS);
  assert.deepEqual(film.mediaPolicy.allowedYouTubeIds, ["BXAr2yiYCV4", "3Sr-vxVaY_M", "G45X6fSk1do", "sgiZb8jJgF8"]);
  assert.equal(film.wordingCorrections.some((correction) => correction.find === "English 20-1" && correction.replace === "English 10-1"), true);
});

test("ELA 10-1 Short Stories provides two Analysis Explorer models for every term and assigned text", () => {
  const shortStories = bySlug.get("ela10-1-short-stories");
  assert.ok(shortStories && shortStories.schemaVersion === 1);
  assert.equal(ELA10_SHORT_STORY_ANALYSIS_TERMS.length, 8);
  assert.equal(ELA10_SHORT_STORY_ANALYSIS_EXAMPLES.length, 80);
  assert.deepEqual(shortStories.analysisTerms, ELA10_SHORT_STORY_ANALYSIS_TERMS);
  const termIds = shortStories.analysisTerms.map((analysisTerm: { id: string }) => analysisTerm.id);
  for (const reading of shortStories.readings) {
    for (const termId of termIds) {
      assert.equal(
        shortStories.analysisExamples.filter(
          (example) => example.readingId === reading.id && example.termId === termId
        ).length,
        2,
        `${reading.id} should have two ${termId} analysis examples`
      );
    }
  }
});

test("hard gates remain excluded and never become learner resources", () => {
  const mapped = [...getEla10TeacherResourceMap().values()].map((entry) => entry.resource);
  const gates = mapped.filter((resource) => /hard[ _-]*gate/i.test(resource.source));
  assert.equal(gates.length, 4);
  assert.equal(gates.every((resource) => resource.role === "excluded-assessment" && resource.disposition === "exclude"), true);
  assert.equal(mapped.some((resource) => /hard[ _-]*gate/i.test(resource.source) && resource.disposition === "place"), false);
});
