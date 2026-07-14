import assert from "node:assert/strict";
import test from "node:test";

import { renderEnglishActivityProfile, type EnglishActivityQuestionSet, type EnglishShakespeareScene } from "./activity-profile-renderers.js";
import {
  buildEla20ActivityProfile,
  buildEla20CrucibleActivityProfile,
  buildEla20FilmStudyActivityProfile,
  buildEla20MacbethActivityProfile,
  buildEla20NovelStudyActivityProfile
} from "./ela20-activity-profiles.js";

function macbethScenes(): EnglishShakespeareScene[] {
  const counts = [7, 4, 6, 3, 8];
  return counts.flatMap((count, actIndex) =>
    Array.from({ length: count }, (_value, sceneIndex) => ({
      id: `preserved-${actIndex + 1}-${sceneIndex + 1}`,
      act: actIndex + 1,
      scene: sceneIndex + 1,
      title: `Act ${actIndex + 1}, Scene ${sceneIndex + 1}`,
      summary: "Preserved scene summary.",
      focus: "Track language, character, conflict, and theme.",
      editorialStatus: "needs-editorial" as const,
      passages: [
        {
          id: "anchor-one",
          speaker: "Speaker",
          original: "Preserved public-domain original line.",
          companion: "Preserved plain-language companion line."
        }
      ]
    }))
  );
}

function macbethActQuestions(): EnglishActivityQuestionSet[] {
  return Array.from({ length: 5 }, (_value, index) => ({
    id: `act-${index + 1}`,
    title: `Act ${index + 1} Questions`,
    questions: [
      {
        id: "scene-analysis",
        label: `How does conflict develop in Act ${index + 1}?`,
        hint: "Use one precise scene."
      }
    ]
  }));
}

test("Crucible profile creates truthful placeholders and accepts later extracted act questions", () => {
  const placeholder = buildEla20CrucibleActivityProfile({ projectSlug: "ela20-crucible" });
  assert.equal(placeholder.actQuestionSets.length, 4);
  assert.equal(placeholder.actQuestionSets.every((set) => set.questions.length === 0), true);
  assert.equal(placeholder.actQuestionSets.every((set) => set.intro?.includes("has not been extracted yet")), true);
  assert.equal(placeholder.essay.stages.length, 6);
  assert.equal(placeholder.playTitle, "The Crucible");

  const extracted = buildEla20CrucibleActivityProfile({
    projectSlug: "ela20-crucible",
    actQuestionSets: [
      { id: "act-1", title: "Act 1 Questions", questions: [{ id: "q1", label: "What motivates the first accusation?" }] }
    ]
  });
  assert.equal(extracted.actQuestionSets[0]?.questions.length, 1);
  assert.equal(extracted.actQuestionSets.slice(1).every((set) => set.questions.length === 0), true);
  const rendered = renderEnglishActivityProfile(extracted);
  assert.match(rendered.pages.find((page) => page.id === "act-questions")?.html ?? "", /ela20-crucible:act-questions:act-1:q1/);
});

test("Macbeth profile requires all preserved scenes and five populated act sets", () => {
  const profile = buildEla20MacbethActivityProfile({
    projectSlug: "ela20-macbeth",
    scenes: macbethScenes(),
    actQuestionSets: macbethActQuestions()
  });
  assert.equal(profile.scenes.length, 28);
  assert.equal(profile.scenes[0]?.id, "act-1-scene-1");
  assert.equal(profile.scenes[27]?.id, "act-5-scene-8");
  assert.deepEqual(profile.characters.map((character) => character.name), [
    "Macbeth",
    "Lady Macbeth",
    "Banquo",
    "Macduff",
    "Duncan",
    "The Witches"
  ]);
  assert.deepEqual(profile.writingTools.map((tool) => tool.title), [
    "Language Lab",
    "Close Reading Annotation Lab",
    "Theme Builder",
    "Character-Change Paragraph",
    "Critical Essay",
    "Visual Motif Essay"
  ]);
  assert.equal(profile.writingTools[0]?.evidenceMode, "none");
  assert.equal(profile.writingTools.slice(1).every((tool) => tool.evidenceMode !== "none"), true);
  assert.equal(profile.materials[0]?.href, "https://shakespeare.mit.edu/macbeth/index.html");
  assert.equal(profile.materials[0]?.embeddable, true);
  assert.equal(profile.materials[1]?.href, "https://myshakespeare.com/macbeth/act-1-scene-1");
  assert.equal(profile.materials[1]?.embeddable, false);
  const visualMotif = profile.writingTools.find((tool) => tool.id === "graphic-essay");
  assert.equal(visualMotif?.title, "Visual Motif Essay");
  assert.deepEqual(
    visualMotif?.fields.map((field) => field.id),
    ["motif", "theme-claim", "introduction", "act-one-evidence", "act-two-evidence", "act-three-evidence", "act-four-five-evidence", "visual-plan", "rubric-check"]
  );
  const paragraph = profile.writingTools.find((tool) => tool.id === "character-change-paragraph");
  assert.match(paragraph?.description ?? "", /response to his murders reveal a change/);

  assert.throws(
    () => buildEla20MacbethActivityProfile({ projectSlug: "ela20-macbeth", scenes: macbethScenes().slice(0, -1), actQuestionSets: macbethActQuestions() }),
    /scene data is incomplete/
  );
  assert.throws(
    () => buildEla20MacbethActivityProfile({ projectSlug: "ela20-macbeth", scenes: macbethScenes(), actQuestionSets: macbethActQuestions().slice(0, 4) }),
    /must provide act-1 through act-5/
  );
});

test("Novel profile supplies two tracks, six essay stages, and exactly 24 disclosed enrichment questions", () => {
  const profile = buildEla20NovelStudyActivityProfile({ projectSlug: "ela20-novel" });
  assert.deepEqual(profile.tracks.map((track) => track.title), ["Lord of the Flies", "The Book Thief"]);
  assert.equal(profile.essay.stages.length, 6);
  assert.deepEqual(profile.questionSets.map((set) => set.id), ["opening", "middle", "final"]);
  assert.deepEqual(profile.questionSets.map((set) => set.questions.length), [9, 9, 6]);
  assert.equal(profile.questionSets.reduce((total, set) => total + set.questions.length, 0), 24);
  assert.equal(profile.questionSets.every((set) => set.subtitle?.includes("Profile-supplied enrichment")), true);
  assert.deepEqual(profile.writingTools.map((tool) => tool.title), [
    "Analytical Paragraph Builder",
    "Motif String Board",
    "Author's Intent"
  ]);
  assert.equal(profile.readingGuideFields.some((field) => field.id === "analytical-use" && field.evidenceRole === "connection"), true);
  assert.equal(profile.majorWorksFields.some((field) => field.id === "themes"), true);
});

test("Film profile is pending by default and has six stages, 19 fields, 22 technique prompts, and 18 full-response prompts", () => {
  const profile = buildEla20FilmStudyActivityProfile({ projectSlug: "ela20-film" });
  assert.deepEqual(profile.filmSelection, { mode: "pending" });
  assert.equal(profile.essay.stages.length, 6);
  assert.equal(profile.essay.stages.reduce((total, stage) => total + stage.fields.length, 0), 19);
  assert.deepEqual(profile.questionSets.map((set) => set.questions.length), [22, 18]);
  assert.equal(profile.viewingGuideFields.some((field) => field.id === "timestamp" && field.evidenceRole === "detail"), true);
  assert.equal(profile.viewingGuideFields.some((field) => field.id === "technique" && field.evidenceRole === "concept"), true);
  const rendered = renderEnglishActivityProfile(profile);
  assert.match(rendered.pages.find((page) => page.id === "viewing-guide")?.html ?? "", /Save Viewing Moment to Evidence Bank/);
});

test("factory dispatches by profile kind and rejects excluded wording from supplied data", () => {
  const modern = buildEla20ActivityProfile({ kind: "modern-drama", projectSlug: "factory-modern" });
  const novel = buildEla20ActivityProfile({ kind: "novel-study", projectSlug: "factory-novel" });
  const film = buildEla20ActivityProfile({ kind: "film-study", projectSlug: "factory-film" });
  const shakespeare = buildEla20ActivityProfile({
    kind: "shakespeare-drama",
    projectSlug: "factory-macbeth",
    scenes: macbethScenes(),
    actQuestionSets: macbethActQuestions()
  });
  assert.deepEqual([modern.kind, shakespeare.kind, novel.kind, film.kind], ["modern-drama", "shakespeare-drama", "novel-study", "film-study"]);
  assert.deepEqual([modern.namespace, shakespeare.namespace, novel.namespace, film.namespace], ["factory-modern", "factory-macbeth", "factory-novel", "factory-film"]);

  assert.throws(
    () => buildEla20CrucibleActivityProfile({
      projectSlug: "contaminated",
      actQuestionSets: [{ id: "act-1", title: "Act 1 Questions", questions: [{ id: "bad", label: "Prepare this for the Diploma Exam." }] }]
    }),
    /grade-contaminated wording/
  );

  const allProfiles = [modern, shakespeare, novel, film];
  assert.doesNotMatch(JSON.stringify(allProfiles), /ELA\s*30-1|Diploma|Part\s+A|soft\s+gate|hard\s+gate/i);
});
