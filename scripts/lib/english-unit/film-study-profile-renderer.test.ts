import assert from "node:assert/strict";
import test from "node:test";

import { buildEla20FilmStudyActivityProfile } from "./ela20-activity-profiles.js";
import type { EnglishFilmStudyActivityProfile } from "./types.js";
import {
  FILM_STUDY_PROFILE_CSS,
  FILM_STUDY_PROFILE_RUNTIME,
  createFilmStudyProfileRendererRecipe,
  renderFilmStudyProfileModule,
  type FilmStudyProfileRendererRecipe
} from "./film-study-profile-renderer.js";

function buildProfile(filmTitle?: string) {
  return buildEla20FilmStudyActivityProfile({
    projectSlug: "ela20-1-film-renderer-test",
    filmTitle,
    materials: [
      {
        id: "teacher-viewing-handout",
        title: "Teacher Viewing Handout",
        description: "Teacher-selected viewing support.",
        href: "resources/teacher-viewing-handout.pdf",
        downloadable: true
      }
    ]
  });
}

function pageHtml(result: ReturnType<typeof renderFilmStudyProfileModule>, id: string) {
  const page = result.pages.find((candidate) => candidate.id === id);
  assert.ok(page, `Expected page ${id}`);
  return page.html;
}

test("Film Study donor module renders the complete configured activity system", () => {
  const recipe = createFilmStudyProfileRendererRecipe(buildProfile(), {
    videos: [
      {
        id: "shots-and-angles",
        title: "Shots and Angles",
        lessonTitle: "Film Shots and Angles",
        description: "Review how shot distance and camera angle shape meaning.",
        embedUrl: "https://www.youtube-nocookie.com/embed/BXAr2yiYCV4",
        fallbackUrl: "https://www.youtube.com/watch?v=BXAr2yiYCV4"
      },
      {
        id: "sound-in-film",
        title: "Sound in Film",
        lessonTitle: "Sound in Film",
        description: "Review diegetic and non-diegetic sound.",
        fallbackUrl: "https://www.youtube.com/watch?v=sgiZb8jJgF8",
        embeddable: false,
        status: "fallback-only"
      }
    ],
    resources: [
      {
        id: "editing-concepts",
        title: "Editing and Transitions",
        description: "Review the corresponding course lesson.",
        group: "Technique Lessons",
        kind: "concept",
        href: "#lessons",
        actionLabel: "Open Lessons"
      }
    ]
  });
  const result = renderFilmStudyProfileModule(recipe);

  assert.deepEqual(result.pages.map((page) => page.id), [
    "critical-essay",
    "critical-essay-topic-interpretation",
    "critical-essay-introduction",
    "critical-essay-body-one",
    "critical-essay-body-two",
    "critical-essay-body-three",
    "critical-essay-conclusion-revision",
    "critical-essay-preview",
    "viewing-guide",
    "film-study-questions",
    "film-room",
    "resources"
  ]);
  assert.deepEqual(result.navGroups, [{
    id: "critical-essay",
    label: "Critical Essay",
    icon: "edit_note",
    landingItemLabel: "Critical Analytical Essay Guide",
    itemPageIds: [
      "critical-essay-topic-interpretation",
      "critical-essay-introduction",
      "critical-essay-body-one",
      "critical-essay-body-two",
      "critical-essay-body-three",
      "critical-essay-conclusion-revision",
      "critical-essay-preview"
    ]
  }]);
  assert.equal(result.contract.essayStageCount, 6);
  assert.equal(result.contract.essayFieldCount, 19);
  assert.deepEqual(result.contract.questionSetCounts, {
    "technique-questions": 22,
    "full-film-response": 18
  });
  assert.equal(result.contract.viewingMomentContributionPrefix, "ela20-1-film-renderer-test:viewing-guide:moment");

  const essayGuide = pageHtml(result, "critical-essay");
  assert.doesNotMatch(essayGuide, /Film selection pending|data-film-selection-pending/);
  assert.match(essayGuide, /Critical Analytical Essay Guide/);
  assert.match(essayGuide, /Alberta assignment focus/);
  assert.match(essayGuide, /Your writing path/);
  assert.doesNotMatch(essayGuide, /Outcome coverage|critical-sequence-card|film-stage-picker|data-film-profile-select/);
  assert.ok(essayGuide.indexOf("I can...") < essayGuide.indexOf("Alberta assignment focus"));
  assert.match(essayGuide, /I can organize my ideas into a controlled critical\/analytical essay/);

  const essayStageIds = [
    "critical-essay-topic-interpretation",
    "critical-essay-introduction",
    "critical-essay-body-one",
    "critical-essay-body-two",
    "critical-essay-body-three",
    "critical-essay-conclusion-revision"
  ];
  const essayStages = essayStageIds.map((id) => pageHtml(result, id)).join("\n");
  assert.match(essayStages, /Build Topic and Interpretation/);
  assert.match(essayStages, /Build Conclusion and Revision/);
  assert.match(essayStages, /Complete conclusion draft/);
  assert.equal((essayStages.match(/Save Stage to Evidence Bank/g) ?? []).length, 6);
  assert.match(essayStages, /data-evidence-collection-id="ela20-1-film-renderer-test:critical-essay:unit:topic-interpretation:collection"/);
  assert.equal((essayStages.match(/data-film-progress-label data-activity-progress-label/g) ?? []).length, 6);
  assert.equal((essayStages.match(/data-worksheet-toggle-hints/g) ?? []).length, 6);
  assert.equal((essayStages.match(/data-worksheet-print/g) ?? []).length, 6);
  assert.equal((essayStages.match(/data-activity-response/g) ?? []).length, 19);
  assert.equal((essayStages.match(/film-stage-summary english-dark-worksheet-header/g) ?? []).length, 6);

  const essayPreview = pageHtml(result, "critical-essay-preview");
  assert.match(essayPreview, /Critical Essay Preview/);
  assert.match(essayPreview, /combines your saved boxes exactly as written/);
  assert.match(essayPreview, /data-film-essay-preview/);
  assert.match(essayPreview, /data-film-essay-preview-section="introduction"/);
  assert.match(essayPreview, /data-film-essay-preview-section="body-three"/);
  assert.match(essayPreview, /data-film-essay-preview-section="conclusion"/);
  assert.match(essayPreview, /data-film-save-essay-preview/);
  assert.match(essayPreview, /Save Full Essay Plan/);
  assert.doesNotMatch(essayPreview, /data-save-response-collection/);
  assert.match(essayPreview, /data-worksheet-print/);
  assert.match(essayPreview, /<header class="english-dark-worksheet-header">/);

  const viewing = pageHtml(result, "viewing-guide");
  assert.match(viewing, /class="film-viewing-setup notebook-setup"/);
  assert.match(viewing, /First reaction/);
  assert.match(viewing, /Working pattern/);
  assert.match(viewing, /Saved Viewing Moments/);
  assert.match(viewing, /data-film-viewing-save-draft/);
  assert.match(viewing, /data-film-viewing-filter-technique/);
  assert.match(viewing, /data-film-viewing-filter-strongest/);
  assert.match(viewing, /Save Viewing Synthesis to Evidence Bank/);
  assert.match(viewing, /data-worksheet-toggle-hints/);
  assert.match(viewing, /data-worksheet-print/);
  assert.equal((viewing.match(/film-section-heading english-dark-worksheet-header/g) ?? []).length, 2);
  assert.match(viewing, /film-bank-heading english-dark-worksheet-header/);

  const questions = pageHtml(result, "film-study-questions");
  assert.match(questions, /Film Technique Questions/);
  assert.match(questions, /Full Film Response/);
  assert.match(questions, /Formative Progress/);
  assert.match(questions, /22 prompts/);
  assert.match(questions, /18 prompts/);
  assert.match(questions, /Types of Cinematography Shots/);
  assert.match(questions, /Shot Composition/);
  assert.match(questions, /Relationships And Conflict/);
  assert.match(questions, /Theme And Resolution/);
  assert.doesNotMatch(questions, /profile-supplied/i);
  assert.equal((questions.match(/Save Selected Question Set to Evidence Bank/g) ?? []).length, 2);
  assert.equal((questions.match(/film-question-header english-dark-worksheet-header/g) ?? []).length, 2);

  const room = pageHtml(result, "film-room");
  assert.match(room, /class="film-room-shell"/);
  assert.match(room, /class="film-room-stage"/);
  assert.match(room, /class="film-room-sidebar"/);
  assert.match(room, /data-film-room-select-menu/);
  assert.match(room, /Playlist Order/);
  assert.match(room, /Elements of Film: Visual Storytelling/);
  assert.match(room, /youtube-nocookie\.com\/embed\/BXAr2yiYCV4/);
  assert.match(room, /youtube\.com\/watch\?v=BXAr2yiYCV4/);
  assert.doesNotMatch(room, /Embedded lesson video|Direct lesson resource|Link needs review/);

  const resources = pageHtml(result, "resources");
  assert.match(resources, /class="film-resource-groups resource-browser"/);
  assert.match(resources, /data-film-resource-select-menu/);
  assert.match(resources, /data-film-resource-panel/);
  assert.match(resources, /Teacher Materials/);
  assert.match(resources, /Technique Lessons/);
  assert.match(resources, /Elements of Film/);
  assert.match(resources, /Elements of Film - Continued/);
  assert.match(resources, /Teacher Viewing Handout/);
  assert.ok(result.resourceLinks.length >= 4);

  assert.match(result.css, /\.evidence-bank-save-action\s*\{[^}]*background:\s*var\(--film-green\)/s);
  assert.match(result.css, /\.film-room-shell\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) 340px/s);
  assert.match(result.runtime, /data-film-viewing-edit/);
  assert.match(result.runtime, /data-film-viewing-delete/);
  assert.match(result.runtime, /data-film-viewing-strongest/);
  assert.match(result.runtime, /data-film-room-select-menu/);
  assert.match(result.runtime, /data-film-resource-select-menu/);
  assert.match(result.runtime, /nextStepEvidenceBank/);
  assert.match(result.runtime, /api\.upsert/);
  assert.doesNotMatch(result.runtime, /api\.remove/);
  assert.doesNotThrow(() => new Function(result.runtime));
});

test("Film Study module remains useful without supplied links or videos", () => {
  const profile = buildEla20FilmStudyActivityProfile({ projectSlug: "ela20-1-film-empty-sources" });
  const result = renderFilmStudyProfileModule(createFilmStudyProfileRendererRecipe(profile));
  const room = pageHtml(result, "film-room");
  const resources = pageHtml(result, "resources");

  assert.match(room, /film-concept-index/);
  assert.match(room, /Film Language Review/);
  assert.match(room, /Open Film Study Lessons/);
  assert.doesNotMatch(room, /Media Playlist|Choose a video|Open source directly/);
  assert.doesNotMatch(room, /<iframe/);
  assert.match(resources, /Film Concepts/);
  assert.equal((resources.match(/class="film-resource-card external-resource-card"/g) ?? []).length, 3);
  assert.match(resources, /matching course lessons/);
});

test("Film Study Personal Response renders six staged lessons, preview, and deliberate evidence saves", () => {
  const configuration = {
    schemaVersion: 1,
    kind: "film-study",
    filmSelection: { mode: "pending" },
    techniqueQuestionCount: 22,
    fullResponseQuestionCount: 18,
    criticalEssayFieldCount: 19,
    viewingGuide: true,
    activities: [
      { id: "critical-essay", title: "Critical Essay", route: "critical-essay", enabled: true, evidencePolicyIds: [] },
      { id: "personal-response", title: "Personal Response", route: "personal-response", enabled: true, evidencePolicyIds: ["personal-response-plan", "personal-response-stage"] },
      { id: "viewing-guide", title: "Viewing Guide", route: "viewing-guide", enabled: true, evidencePolicyIds: [] },
      { id: "film-questions", title: "Film Study Questions", route: "film-study-questions", enabled: true, evidencePolicyIds: [] },
      { id: "film-room", title: "Film Room", route: "film-room", enabled: true, evidencePolicyIds: [] },
      { id: "resources", title: "Resources", route: "resources", enabled: true, evidencePolicyIds: [] }
    ],
    evidencePolicies: [
      { id: "personal-response-plan", activityId: "personal-response", saveMode: "collection", requiresExplicitSave: true, contributionIdTemplate: "{projectSlug}:personal-response:collection" },
      { id: "personal-response-stage", activityId: "personal-response", saveMode: "individual", requiresExplicitSave: true, contributionIdTemplate: "{projectSlug}:personal-response:{entryId}" }
    ]
  } satisfies EnglishFilmStudyActivityProfile;
  const profile = buildEla20FilmStudyActivityProfile({ projectSlug: "ela20-1-film-personal-response", configuration });
  const result = renderFilmStudyProfileModule(createFilmStudyProfileRendererRecipe(profile));
  const personalPages = result.pages.filter((page) => page.id === "personal-response" || page.id.startsWith("personal-response-"));

  assert.deepEqual(personalPages.map((page) => page.id), [
    "personal-response",
    "personal-response-prompt-impression",
    "personal-response-film-evidence",
    "personal-response-knowledge-experience",
    "personal-response-form-perspective",
    "personal-response-response-plan",
    "personal-response-draft-revise",
    "personal-response-preview"
  ]);
  assert.equal(result.contract.personalResponseStageCount, 6);
  assert.equal(result.contract.personalResponseFieldCount, 18);
  assert.deepEqual(result.navGroups[1], {
    id: "personal-response",
    label: "Personal Response",
    icon: "edit_note",
    landingItemLabel: "Personal Response to Text Guide",
    itemPageIds: personalPages.slice(1).map((page) => page.id)
  });
  const guide = pageHtml(result, "personal-response");
  assert.match(guide, /Personal Response to Text Guide/);
  assert.match(guide, /What makes a personal response work/);
  assert.match(guide, /Prose Form/);
  assert.doesNotMatch(guide, /examination|hard gate|Diploma Exam/i);
  const stages = personalPages.slice(1, -1).map((page) => page.html).join("\n");
  assert.equal((stages.match(/Save Stage to Evidence Bank/g) ?? []).length, 6);
  assert.equal((stages.match(/data-activity-response/g) ?? []).length, 18);
  assert.match(stages, /data-evidence-collection-id="ela20-1-film-personal-response:personal-response:unit:prompt-impression:collection"/);
  assert.match(stages, /Short essay/);
  assert.match(stages, /Interior monologue/);
  const preview = pageHtml(result, "personal-response-preview");
  assert.match(preview, /Save Full Personal Response Plan/);
  assert.match(preview, /data-film-personal-response-preview/);
  assert.match(result.runtime, /personal-response:full-plan/);
  assert.match(result.runtime, /data-film-save-personal-response-preview/);
});

test("selected-film recipes remain notice-free and escape the title", () => {
  const result = renderFilmStudyProfileModule(createFilmStudyProfileRendererRecipe(buildProfile("A Film <Reframed>")));
  const allHtml = result.pages.map((page) => page.html).join("\n");
  assert.doesNotMatch(allHtml, /data-film-selection-pending/);
  assert.match(allHtml, /A Film &lt;Reframed&gt;/);
  assert.doesNotMatch(allHtml, /A Film <Reframed>/);
});

test("renderer validates the recipe boundary and stable ids", () => {
  const profile = buildProfile();
  const wrongEssay = structuredClone(profile);
  wrongEssay.essay.stages[0].fields.pop();
  assert.throws(
    () => renderFilmStudyProfileModule(createFilmStudyProfileRendererRecipe(wrongEssay)),
    /six stages and exactly 19 fields/
  );

  assert.throws(
    () => renderFilmStudyProfileModule(createFilmStudyProfileRendererRecipe(profile, {
      routes: { criticalEssay: "film-room" }
    })),
    /route ids must be unique/
  );

  assert.throws(
    () => renderFilmStudyProfileModule(createFilmStudyProfileRendererRecipe(profile, {
      videos: [{ id: "unsafe", title: "Unsafe", lessonTitle: "Unsafe", fallbackUrl: "javascript:alert(1)" }]
    })),
    /unsupported href/
  );

  const duplicateFallbackRecipe: FilmStudyProfileRendererRecipe = createFilmStudyProfileRendererRecipe(profile, {
    videos: [
      { id: "one", title: "One", lessonTitle: "One", fallbackUrl: "https://example.com/video" },
      { id: "two", title: "Two", lessonTitle: "Two", fallbackUrl: "https://example.com/video" }
    ]
  });
  assert.throws(() => renderFilmStudyProfileModule(duplicateFallbackRecipe), /duplicate video fallback/);
});

test("exported Film Study fragments are valid standalone integration assets", () => {
  assert.match(FILM_STUDY_PROFILE_CSS, /\.critical-writing-panel\s*\{[^}]*margin:\s*16px 0 0;[^}]*border-radius:\s*6px;[^}]*padding:\s*18px;/s);
  assert.match(FILM_STUDY_PROFILE_CSS, /\.critical-category-grid article:last-child\s*\{[^}]*grid-column:\s*1 \/ -1;/s);
  assert.match(FILM_STUDY_PROFILE_CSS, /\.critical-model-block\s*\{[^}]*border-left:\s*4px solid #477445;[^}]*background:\s*#f2f5f0;/s);
  assert.match(FILM_STUDY_PROFILE_CSS, /\.critical-support-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s);
  assert.match(FILM_STUDY_PROFILE_CSS, /\.critical-tip-panel\s*\{[^}]*border-color:\s*#e4d4b1;[^}]*border-left-width:\s*1px;[^}]*background:\s*#fffaf0;/s);
  assert.match(FILM_STUDY_PROFILE_CSS, /\.critical-lesson-map ol\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s);
  assert.match(FILM_STUDY_PROFILE_CSS, /@media \(max-width: 760px\)[\s\S]*\.film-critical-essay-page \.critical-support-grid[\s\S]*grid-template-columns:\s*1fr;/);
  assert.match(FILM_STUDY_PROFILE_CSS, /@media \(max-width: 680px\)/);
  assert.match(FILM_STUDY_PROFILE_CSS, /@media print/);
  assert.match(FILM_STUDY_PROFILE_RUNTIME, /const __name=function\(target\)\{return target;\}/);
  assert.match(FILM_STUDY_PROFILE_RUNTIME, /function installFilmStudyProfileRuntime/);
  assert.doesNotThrow(() => new Function(FILM_STUDY_PROFILE_RUNTIME));
});
