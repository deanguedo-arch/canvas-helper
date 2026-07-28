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
import type {
  EnglishFilmStudyActivityProfile,
  EnglishModernDramaActivityProfile,
  EnglishNovelStudyActivityProfile,
  EnglishShakespeareDramaActivityProfile
} from "./types.js";

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
  assert.equal(placeholder.essay?.stages.length, 6);
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

  const withFullText = buildEla20CrucibleActivityProfile({
    projectSlug: "ela20-crucible",
    materials: [{ id: "crucible-full-text-pdf", title: "The Crucible Full Text", kind: "document", href: "assets/full-text.pdf" }]
  });
  assert.equal(withFullText.materials.some((material) => material.id === "crucible-play-access"), false);
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
  const rendered = renderEnglishActivityProfile(profile);
  const readingGuide = rendered.pages.find((page) => page.id === "reading-guide")?.html ?? "";
  const writingStudio = rendered.pages.find((page) => page.id === "writing-studio")?.html ?? "";
  assert.match(readingGuide, /data-repeatable-contribution-prefix="ela20-novel:reading-guide:lord-of-the-flies:passage"/);
  assert.equal([...writingStudio.matchAll(/data-repeatable-root=/g)].length, 6);
  assert.match(writingStudio, /data-repeatable-contribution-prefix="ela20-novel:writing-studio:lord-of-the-flies:motif-string-board:entry"/);
});

test("Film profile is pending by default and has six stages, 19 fields, 22 technique prompts, and 18 full-response prompts", () => {
  const profile = buildEla20FilmStudyActivityProfile({ projectSlug: "ela20-film" });
  assert.deepEqual(profile.filmSelection, { mode: "pending" });
  assert.equal(profile.essay.stages.length, 6);
  assert.equal(profile.essay.stages.reduce((total, stage) => total + stage.fields.length, 0), 19);
  assert.deepEqual(profile.questionSets.map((set) => set.questions.length), [22, 18]);
  assert.deepEqual(
    profile.questionSets.map((set) => [...new Set(set.questions.map((question) => question.section))]),
    [
      ["Types of Cinematography Shots", "Shot Composition", "Camera Movement", "Lighting", "Sound Effects", "Mise-en-scene"],
      ["Film Selection", "Character And Motivation", "Relationships And Conflict", "Theme And Resolution"]
    ]
  );
  assert.equal(profile.questionSets[0]?.questions[21]?.label.includes("Wall-E"), false);
  assert.equal(profile.viewingGuideFields.some((field) => field.id === "timestamp" && field.evidenceRole === "detail"), true);
  assert.equal(profile.viewingGuideFields.some((field) => field.id === "technique" && field.evidenceRole === "concept"), true);
  const rendered = renderEnglishActivityProfile(profile);
  const viewingGuide = rendered.pages.find((page) => page.id === "viewing-guide")?.html ?? "";
  assert.match(rendered.runtime ?? "", /data-film-viewing-evidence-save/);
  assert.match(viewingGuide, /data-film-viewing-store/);
  assert.match(viewingGuide, /data-film-viewing-editing-id/);
});

test("recipe profile decisions select generated data and enabled routes instead of being replaced by defaults", () => {
  const crucibleConfiguration = {
    schemaVersion: 1,
    kind: "modern-drama",
    actIds: ["act-2"],
    characterIds: ["danforth"],
    criticalEssay: false,
    activities: [
      { id: "play-materials", title: "Play Materials", route: "play-materials", enabled: true, evidencePolicyIds: [] },
      { id: "act-questions", title: "Act Questions", route: "act-questions", enabled: false, evidencePolicyIds: [] },
      { id: "character-conflict", title: "Character Notes", route: "character-notes", enabled: false, evidencePolicyIds: [] },
      { id: "critical-essay", title: "Critical Essay", route: "critical-essay", enabled: false, evidencePolicyIds: [] }
    ],
    evidencePolicies: []
  } satisfies EnglishModernDramaActivityProfile;
  const crucible = buildEla20CrucibleActivityProfile({ projectSlug: "configured-crucible", configuration: crucibleConfiguration });
  assert.deepEqual(crucible.actQuestionSets.map((set) => set.id), ["act-2"]);
  assert.deepEqual(crucible.characters.map((character) => character.id), ["danforth"]);
  assert.equal(crucible.essay, undefined);
  assert.deepEqual(renderEnglishActivityProfile(crucible).pages.map((page) => page.id), ["play-materials"]);

  const macbethConfiguration = {
    schemaVersion: 1,
    kind: "shakespeare-drama",
    actIds: ["act-1", "act-2", "act-3", "act-4", "act-5"],
    sceneCount: 28,
    sideBySideReader: true,
    characterIds: ["banquo"],
    writingTools: ["theme-builder"],
    editorialStatus: "needs-editorial",
    activities: [
      { id: "side-by-side-reader", title: "Reader", route: "side-by-side", enabled: false, evidencePolicyIds: [] },
      { id: "macbeth-materials", title: "Materials", route: "play-materials", enabled: false, evidencePolicyIds: [] },
      { id: "act-questions", title: "Questions", route: "act-questions", enabled: false, evidencePolicyIds: [] },
      { id: "character-notes", title: "Characters", route: "character-notes", enabled: false, evidencePolicyIds: [] },
      { id: "writing-studio", title: "Writing", route: "writing-studio", enabled: true, evidencePolicyIds: [] }
    ],
    evidencePolicies: []
  } satisfies EnglishShakespeareDramaActivityProfile;
  const macbeth = buildEla20MacbethActivityProfile({
    projectSlug: "configured-macbeth",
    scenes: macbethScenes(),
    actQuestionSets: macbethActQuestions(),
    configuration: macbethConfiguration
  });
  assert.deepEqual(macbeth.characters.map((character) => character.id), ["banquo"]);
  assert.deepEqual(macbeth.writingTools.map((tool) => tool.id), ["theme-builder"]);
  assert.deepEqual(renderEnglishActivityProfile(macbeth).pages.map((page) => page.id), ["writing-studio"]);

  const novelConfiguration = {
    schemaVersion: 1,
    kind: "novel-study",
    novels: [{ id: "configured-novel", title: "Configured Novel", author: "Course Author" }],
    questionPhases: ["opening"],
    genericQuestionCount: 9,
    writingTools: ["motif-string"],
    activities: [
      { id: "critical-essay", title: "Essay", route: "critical-essay", enabled: false, evidencePolicyIds: [] },
      { id: "reading-guide", title: "Reading Guide", route: "reading-guide", enabled: true, evidencePolicyIds: ["passage-entry"] },
      { id: "major-works-data", title: "Major Works", route: "major-works-data", enabled: false, evidencePolicyIds: [] },
      { id: "novel-questions", title: "Questions", route: "novel-study-questions", enabled: false, evidencePolicyIds: [] },
      { id: "writing-studio", title: "Writing", route: "writing-studio", enabled: true, evidencePolicyIds: ["motif-entry"] }
    ],
    evidencePolicies: [
      { id: "passage-entry", activityId: "reading-guide", saveMode: "individual", requiresExplicitSave: true, contributionIdTemplate: "{projectSlug}:reading-guide:{entryId}" },
      { id: "motif-entry", activityId: "writing-studio", saveMode: "individual", requiresExplicitSave: true, contributionIdTemplate: "{projectSlug}:writing-studio:{entryId}" }
    ]
  } satisfies EnglishNovelStudyActivityProfile;
  const novel = buildEla20NovelStudyActivityProfile({ projectSlug: "configured-novel-project", configuration: novelConfiguration });
  assert.deepEqual(novel.tracks.map((track) => track.title), ["Configured Novel"]);
  assert.deepEqual(novel.questionSets.map((set) => set.id), ["opening"]);
  assert.deepEqual(novel.writingTools.map((tool) => tool.id), ["motif-string-board"]);
  const renderedNovel = renderEnglishActivityProfile(novel);
  assert.deepEqual(renderedNovel.pages.map((page) => page.id), ["reading-guide", "writing-studio"]);
  assert.match(renderedNovel.pages[0]?.html ?? "", /data-repeatable-contribution-prefix="configured-novel-project:reading-guide/);

  const filmConfiguration = {
    schemaVersion: 1,
    kind: "film-study",
    filmSelection: { mode: "selected", title: "Configured Film" },
    techniqueQuestionCount: 2,
    fullResponseQuestionCount: 3,
    criticalEssayFieldCount: 19,
    viewingGuide: true,
    activities: [
      { id: "critical-essay", title: "Essay", route: "critical-essay", enabled: false, evidencePolicyIds: [] },
      { id: "viewing-guide", title: "Viewing Guide", route: "viewing-guide", enabled: true, evidencePolicyIds: ["viewing-moment-entry"] },
      { id: "film-questions", title: "Questions", route: "film-study-questions", enabled: true, evidencePolicyIds: [] },
      { id: "film-room", title: "Film Room", route: "film-room", enabled: false, evidencePolicyIds: [] },
      { id: "resources", title: "Resources", route: "resources", enabled: false, evidencePolicyIds: [] }
    ],
    evidencePolicies: [
      { id: "viewing-moment-entry", activityId: "viewing-guide", saveMode: "individual", requiresExplicitSave: true, contributionIdTemplate: "{projectSlug}:viewing-guide:{entryId}" }
    ]
  } satisfies EnglishFilmStudyActivityProfile;
  const film = buildEla20FilmStudyActivityProfile({ projectSlug: "configured-film-project", configuration: filmConfiguration });
  assert.deepEqual(film.filmSelection, { mode: "selected", title: "Configured Film" });
  assert.deepEqual(film.questionSets.map((set) => set.questions.length), [2, 3]);
  assert.deepEqual(film.essay.stages[0]?.fields.map((field) => field.label), ["Two parts of the essay topic", "Film and character route", "Working thesis"]);
  assert.deepEqual(film.essay.stages[5]?.fields.map((field) => field.label), ["Restated interpretation", "Beginning-middle-end synthesis", "Human condition connection", "Complete conclusion draft"]);
  assert.deepEqual(renderEnglishActivityProfile(film).pages.map((page) => page.id), ["viewing-guide", "film-study-questions"]);
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
