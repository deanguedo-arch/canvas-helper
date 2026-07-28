import assert from "node:assert/strict";
import test from "node:test";

import * as cheerio from "cheerio";

import { buildEla20NovelStudyActivityProfile } from "./ela20-activity-profiles.js";
import { ENGLISH_ACTIVITY_PROFILE_RUNTIME } from "./activity-profile-runtime.js";
import {
  NOVEL_STUDY_PROFILE_CSS,
  NOVEL_STUDY_PROFILE_RUNTIME,
  renderNovelStudyProfile,
  type EnglishNovelStudyRendererProfile
} from "./novel-study-profile-renderer.js";

const profile: EnglishNovelStudyRendererProfile = {
  kind: "novel-study",
  namespace: "ela20-novel-parity",
  courseCode: "ELA 20-1",
  unitTitle: "Novel Study",
  evidenceBankRoute: "evidence-bank",
  tracks: [
    { id: "island-track", title: "Island Novel", author: "A. Writer" },
    { id: "history-track", title: "History Novel", author: "B. Writer" }
  ],
  materials: [
    { id: "island-access", title: "Island Novel", description: "Use the school-licensed edition.", status: "access-required" },
    { id: "reading-notes", title: "Reading Notes", href: "assets/reading-notes.pdf", status: "available", downloadable: true }
  ],
  essay: {
    title: "Critical Analytical Essay",
    description: "Move from a focused interpretation to a controlled essay plan.",
    stages: [
      { id: "topic-thesis", title: "Topic and Thesis", focus: "Establish a defensible interpretation.", checkpoints: ["Answer the topic."], fields: [{ id: "thesis", label: "Working thesis", hint: "Make the claim arguable." }] },
      { id: "introduction", title: "Introduction", focus: "Build context.", fields: [{ id: "opening", label: "Opening idea" }] },
      { id: "body-one", title: "Body 1", focus: "Use opening evidence.", fields: [{ id: "evidence", label: "Opening evidence" }] },
      { id: "body-two", title: "Body 2", focus: "Use middle evidence.", fields: [{ id: "evidence", label: "Middle evidence" }] },
      { id: "body-three", title: "Body 3", focus: "Use ending evidence.", fields: [{ id: "evidence", label: "Ending evidence" }] },
      { id: "conclusion-revision", title: "Conclusion and Revision", focus: "Complete and revise.", fields: [{ id: "revision", label: "Revision plan" }] }
    ]
  },
  readingGuideFields: [
    { id: "locator", label: "Chapter and page", type: "text" },
    { id: "evidence-type", label: "Evidence type", type: "select", options: ["Character", "Motif", "Theme"] },
    { id: "passage", label: "Quotation or precise moment", evidenceRole: "detail" },
    { id: "effect", label: "Author's choice and effect", evidenceRole: "connection" }
  ],
  majorWorksFields: [
    { id: "context", label: "Author and context" },
    { id: "plot", label: "Plot overview" },
    { id: "characters", label: "Major characters" },
    { id: "themes", label: "Themes" }
  ],
  questionSets: [
    { id: "opening", title: "Opening Questions", subtitle: "Profile-supplied enrichment", questions: [{ id: "expectations", label: "What expectations does the opening create?", hint: "Use a precise opening detail." }] },
    { id: "middle", title: "Middle Questions", questions: [{ id: "change", label: "What important change has occurred?" }] },
    { id: "final", title: "Final Questions", questions: [{ id: "theme", label: "How is the central theme developed?" }] }
  ],
  writingTools: [
    {
      id: "analytical-paragraph",
      title: "Analytical Paragraph Builder",
      description: "Build and revise a paragraph.",
      evidenceMode: "individual",
      fields: [{ id: "claim", label: "Controlling idea" }, { id: "paragraph", label: "Analytical paragraph" }]
    },
    {
      id: "motif-string",
      title: "Motif String Board",
      description: "Connect repeated details.",
      evidenceMode: "individual",
      fields: [{ id: "motif", label: "Motif", type: "text" }, { id: "meaning", label: "Larger meaning" }]
    },
    {
      id: "authors-intent",
      title: "Author's Intent",
      description: "Interpret the author's construction.",
      evidenceMode: "individual",
      fields: [{ id: "choice", label: "Character or plot choice" }, { id: "intent", label: "Author's possible intent" }]
    }
  ]
};

function documentFor(output: ReturnType<typeof renderNovelStudyProfile>) {
  return cheerio.load(output.pages.map((page) => page.html).join("\n"));
}

test("Novel Study donor-parity renderer preserves configured tracks, phases, tools, and access metadata", () => {
  const output = renderNovelStudyProfile(profile);
  assert.deepEqual(output.pages.map((page) => page.id), [
    "critical-essay",
    "critical-essay-topic-thesis",
    "critical-essay-introduction",
    "critical-essay-body-one",
    "critical-essay-body-two",
    "critical-essay-body-three",
    "critical-essay-conclusion-revision",
    "critical-essay-preview",
    "reading-guide",
    "major-works-data",
    "novel-study-questions",
    "writing-studio"
  ]);
  assert.deepEqual(output.navGroups, [{
    id: "critical-essay",
    label: "Critical Essay",
    icon: "edit_note",
    landingItemLabel: "Critical Analytical Essay Guide",
    itemPageIds: [
      "critical-essay-topic-thesis",
      "critical-essay-introduction",
      "critical-essay-body-one",
      "critical-essay-body-two",
      "critical-essay-body-three",
      "critical-essay-conclusion-revision",
      "critical-essay-preview"
    ]
  }]);
  assert.deepEqual(output.resourceLinks.map((resource) => resource.id), ["island-access", "reading-notes"]);
  assert.equal(output.resourceLinks.filter((resource) => resource.status === "access-required").length, 1);
  const $ = documentFor(output);
  assert.equal($("[data-novel-track-select]").first().find("option").length, 2);
  assert.match($.text(), /Island Novel/);
  assert.match($.text(), /History Novel/);
  assert.equal($("#novel-study-tracks").length, 0);
  assert.match($.text(), /Opening Questions/);
  assert.match($.text(), /Middle Questions/);
  assert.match($.text(), /Final Questions/);
  assert.match($.text(), /Analytical Paragraph Builder/);
  assert.match($.text(), /Motif String Board/);
  assert.match($.text(), /Author's Intent/);
});

test("critical essay is an eight-page grouped sequence with two isolated tracks, stage saves, and track-specific previews", () => {
  const output = renderNovelStudyProfile(profile);
  const $ = documentFor(output);
  const stageRoutes = $("[data-novel-module='critical-essay-stage']");
  assert.equal(stageRoutes.length, 6, "each writing stage is a dedicated route");
  assert.equal(stageRoutes.find("[data-novel-critical-essay-stage]").length, 12, "each route contains one independent panel per novel");
  assert.equal(stageRoutes.find(".novel-stage-summary.novel-dark-worksheet-header").length, 12, "essay stages use the shared dark worksheet treatment");
  assert.equal(stageRoutes.find(".novel-activity-summary").length, 12, "essay stages use the same learner-facing activity summary contract as the other workspaces");
  assert.equal(stageRoutes.find(".novel-critical-planner > .novel-field-grid").length, 12, "each essay planner exposes one stacked field group");
  assert.equal(stageRoutes.find("[data-novel-progress]").length, 12);
  assert.equal(stageRoutes.find("[data-novel-toggle-hints]").length, 12);
  assert.equal(stageRoutes.find("[data-novel-print]").length, 12);
  assert.equal(stageRoutes.find("[data-worksheet-toggle-hints]").length, 12);
  assert.equal(stageRoutes.find("[data-worksheet-print]").length, 12);
  assert.equal(stageRoutes.find("[data-save-profile-collection]").length, 12);
  assert.match(stageRoutes.text(), /Save Stage to Evidence Bank/);

  const stageCollectionIds = stageRoutes.find("[data-novel-critical-essay-stage]")
    .map((_index, element) => $(element).attr("data-evidence-collection-id"))
    .get();
  assert.equal(new Set(stageCollectionIds).size, 12);
  assert(stageCollectionIds.includes("ela20-novel-parity:critical-essay:island-track:topic-thesis:collection"));
  assert(stageCollectionIds.includes("ela20-novel-parity:critical-essay:history-track:conclusion-revision:collection"));

  const preview = $("#critical-essay-preview[data-novel-essay-preview]");
  assert.equal(preview.length, 1);
  assert.equal(preview.find("[data-novel-essay-preview-panel]").length, 2);
  assert.equal(preview.find("[data-novel-save-essay-preview]").length, 2);
  assert.equal(preview.find("[data-worksheet-print]").length, 2);
  assert.deepEqual(
    preview.find("[data-novel-essay-preview-panel]")
      .map((_index, element) => $(element).attr("data-evidence-collection-id"))
      .get(),
    [
      "ela20-novel-parity:critical-essay:island-track:full-plan",
      "ela20-novel-parity:critical-essay:history-track:full-plan"
    ]
  );
  assert.equal(preview.find("[data-novel-essay-preview-foundation]").length, 6);
  assert.equal(preview.find("[data-novel-essay-preview-section]").length, 10);
  assert.equal(preview.find("[data-novel-essay-preview-revision]").length, 2);
  assert.match(preview.text(), /Save Full Essay Plan/);

  const dormantSelectedStageIds = $("#critical-essay input[type='hidden'][data-response-id]")
    .map((_index, element) => $(element).attr("data-response-id"))
    .get();
  assert.deepEqual(dormantSelectedStageIds, [
    "ela20-novel-parity:critical-essay:island-track:selected-stage",
    "ela20-novel-parity:critical-essay:history-track:selected-stage"
  ]);

  const criticalEssayHtml = output.pages
    .filter((page) => page.id === "critical-essay" || page.id.startsWith("critical-essay-"))
    .map((page) => page.html)
    .join("\n");
  assert.doesNotMatch(criticalEssayHtml, /\bELA\s*30-1\b|\bDiploma(?:\s+Exam)?\b|\bPart\s+A\b|\b(?:soft|hard)\s+gate\b/i);

  const questions = $("[data-novel-module='novel-questions']");
  assert.equal(questions.find("[data-novel-phase-panel]").length, 6);
  assert.equal(questions.find("[data-novel-progress]").length, 6);
  assert.equal(questions.find("[data-save-profile-collection]").length, 6);
  assert.match(questions.text(), /Save Phase Answers to Evidence Bank/);
});

test("all Novel Study activity summaries use the dark worksheet header", () => {
  const $ = documentFor(renderNovelStudyProfile(profile));
  const hintToggles = $("[data-worksheet-toggle-hints]");
  assert.ok(hintToggles.length > 0);
  assert.equal(hintToggles.filter('[aria-pressed="false"]').length, hintToggles.length);
  const headers = $(".novel-document-header");
  assert.equal(headers.length, 28);
  assert.equal(headers.filter(".novel-activity-summary").length, headers.length);
  assert.equal($("[data-novel-module='reading-guide'] .novel-activity-summary").length, 2);
  assert.equal($("[data-novel-module='major-works'] .novel-activity-summary").length, 2);
  assert.equal($("[data-novel-module='novel-questions'] .novel-dark-worksheet-header").length, 6);
  assert.equal($("[data-novel-module='writing-studio'] .novel-dark-worksheet-header").length, 6);
  assert.equal($("[data-novel-module='critical-essay-stage'] .novel-dark-worksheet-header").length, 12);
  assert.equal($("[data-novel-module='reading-guide'] .novel-dark-worksheet-header").length, 2);
  assert.equal($("[data-novel-module='major-works'] .novel-dark-worksheet-header").length, 2);
  assert.equal($("[data-novel-module='major-works'] .novel-major-works-fields").length, 2);
  assert.doesNotMatch($.text(), /Profile-supplied enrichment|configured tools|questions across \d+ phases/i);
  assert.match(NOVEL_STUDY_PROFILE_CSS, /\.novel-document-header\.novel-activity-summary\{[^}]*background:#fff[^}]*color:#202420/);
  assert.match(NOVEL_STUDY_PROFILE_CSS, /\.novel-document-header\.novel-activity-summary\.novel-dark-worksheet-header,[^{]+\{[^}]*background:#161a17[^}]*color:#fff/);
  assert.match(NOVEL_STUDY_PROFILE_CSS, /\.novel-dark-worksheet-header p\{color:#b9c3b2\}/);
  assert.match(NOVEL_STUDY_PROFILE_CSS, /\.novel-dark-worksheet-header \.novel-progress-track span\{background:#9fcf93\}/);
  assert.match(NOVEL_STUDY_PROFILE_CSS, /\.novel-major-works-fields\{margin-top:0;padding:22px\}/);
  assert.match(NOVEL_STUDY_PROFILE_CSS, /\.novel-question-number\{[^}]*background:transparent[^}]*color:#175314/);
});

test("teacher question sets stay with their configured novel track", () => {
  const output = renderNovelStudyProfile({
    ...profile,
    questionSets: [
      ...profile.questionSets,
      {
        id: "island-teacher-questions",
        title: "Island Teacher Questions",
        trackIds: ["island-track"],
        questions: [{ id: "island-detail", label: "What detail shapes the island conflict?" }]
      }
    ]
  });
  const $ = documentFor(output);
  const island = $("#novel-study-questions [data-novel-track-panel='island-track']");
  const history = $("#novel-study-questions [data-novel-track-panel='history-track']");
  assert.match(island.text(), /Island Teacher Questions/);
  assert.doesNotMatch(history.text(), /Island Teacher Questions|island conflict/);
  assert.equal(island.find("[data-novel-phase-panel]").length, 4);
  assert.equal(history.find("[data-novel-phase-panel]").length, 3);
});

test("the configured ELA 20-1 profile preserves all 36 substantive essay response IDs and the two existing full-plan IDs", () => {
  const realProfile = buildEla20NovelStudyActivityProfile({ projectSlug: "ela20-1-novel-study-clean" });
  const output = renderNovelStudyProfile({
    ...realProfile,
    recipeProfile: realProfile.recipeProfile?.kind === "novel-study" ? realProfile.recipeProfile : undefined
  });
  const $ = documentFor(output);
  assert.doesNotMatch($.text(), /Profile-supplied enrichment/i, "source provenance stays in reports instead of learner-facing activity copy");
  const essayFieldIds = $("[data-novel-critical-essay-stage] [data-novel-field][data-response-id]")
    .map((_index, element) => $(element).attr("data-response-id"))
    .get();
  assert.equal(essayFieldIds.length, 36);
  assert.equal(new Set(essayFieldIds).size, 36);
  assert.equal(essayFieldIds.filter((id) => id.includes(":lord-of-the-flies:")).length, 18);
  assert.equal(essayFieldIds.filter((id) => id.includes(":the-book-thief:")).length, 18);
  assert(essayFieldIds.includes("ela20-1-novel-study-clean:critical-essay:lord-of-the-flies:topic-thesis:topic"));
  assert(essayFieldIds.includes("ela20-1-novel-study-clean:critical-essay:lord-of-the-flies:conclusion-revision:revision-plan"));
  assert(essayFieldIds.includes("ela20-1-novel-study-clean:critical-essay:the-book-thief:body-two:middle-analysis"));
  assert(essayFieldIds.includes("ela20-1-novel-study-clean:critical-essay:the-book-thief:conclusion-revision:revision-plan"));
  assert.deepEqual(
    $("#critical-essay-preview [data-novel-essay-preview-panel]")
      .map((_index, element) => $(element).attr("data-evidence-collection-id"))
      .get(),
    [
      "ela20-1-novel-study-clean:critical-essay:lord-of-the-flies:full-plan",
      "ela20-1-novel-study-clean:critical-essay:the-book-thief:full-plan"
    ]
  );
});

test("Reading Guide provides an editable multi-card bank, filtering, strongest selection, synthesis, and deliberate evidence actions", () => {
  const $ = documentFor(renderNovelStudyProfile(profile));
  const reading = $("[data-novel-module='reading-guide']");
  assert.equal(reading.find("[data-repeatable-root='reading-passage']").length, 2);
  assert.equal(reading.find("[data-repeatable-save]").length, 2);
  assert.equal(reading.find("[data-repeatable-clear]").length, 2);
  assert.equal(reading.find("[data-repeatable-filter]").length, 2);
  assert.equal(reading.find("[data-repeatable-list]").length, 2);
  assert.equal(reading.find("[data-strongest-summary]").length, 2);
  assert.equal(reading.find("[data-evidence-type='reading-guide-synthesis'] [data-save-profile-collection]").length, 2);
  assert.equal(reading.find("[data-worksheet-toggle-hints]").length, 2);
  assert.equal(reading.find("[data-worksheet-print]").length, 2);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /data-repeatable-edit/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /data-repeatable-delete/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /data-repeatable-strongest/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /data-repeatable-evidence/);
});

test("Major Works and Writing Studio use stable collections and multi-entry banks with green Evidence Bank actions", () => {
  const output = renderNovelStudyProfile(profile);
  const $ = documentFor(output);
  assert.equal($("[data-novel-module='major-works'] [data-evidence-type='major-works-data']").length, 2);
  assert.equal($("[data-novel-module='major-works'] .evidence-bank-save-action").length, 2);
  assert.equal($("[data-repeatable-root='paragraph']").length, 2);
  assert.equal($("[data-repeatable-root='motif']").length, 2);
  assert.equal($("[data-repeatable-root='author-intent']").length, 2);
  assert.equal($("[data-novel-module='writing-studio'] [data-worksheet-toggle-hints]").length, 6);
  assert.equal($("[data-novel-module='writing-studio'] [data-worksheet-print]").length, 6);
  assert.match($.text(), /Paragraph Bank/);
  assert.match($.text(), /Multi-card Motif Board/);
  assert.match($.text(), /Author-Intent Archive/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /window\.nextStepEvidenceBank/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /api\.upsert/);
  assert.doesNotMatch(NOVEL_STUDY_PROFILE_RUNTIME, /api\.upsert\([^)]*init/);
});

test("static response IDs are unique, stable, and runtime/CSS fragments are safe to integrate", () => {
  const output = renderNovelStudyProfile(profile);
  const $ = documentFor(output);
  const ids = $("[data-response-id]").map((_index, element) => $(element).attr("data-response-id")).get();
  assert.equal(new Set(ids).size, ids.length);
  assert(ids.every((id) => id.startsWith("ela20-novel-parity:")));
  assert.match(ids.join("\n"), /ela20-novel-parity:critical-essay:island-track:topic-thesis:thesis/);
  assert.match(ids.join("\n"), /ela20-novel-parity:novel-questions:history-track:final:theme/);
  assert.doesNotThrow(() => new Function(NOVEL_STUDY_PROFILE_RUNTIME));
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /data-novel-essay-preview-panel/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /data-novel-save-essay-preview/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /critical-essay.*full-plan/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /api\.list/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /Full essay plan updated in Evidence Bank/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /revisionPlan/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /\.novel-document, \.novel-notebook, \[data-novel-module\]/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /\[data-novel-print-scope\], \[data-collection-scope\], \.novel-document/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /hints\.hasAttribute\("data-novel-toggle-hints"\)\) return;/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /print\.hasAttribute\("data-novel-print"\)\) return;/);
  assert.doesNotMatch(NOVEL_STUDY_PROFILE_RUNTIME, /data-novel-toggle-hints"\)\) \{\s+if \(button\.hasAttribute\("data-worksheet-toggle-hints"\)\) return;/);
  assert.doesNotMatch(NOVEL_STUDY_PROFILE_RUNTIME, /data-novel-print"\)\) \{\s+if \(button\.hasAttribute\("data-worksheet-print"\)\) return;/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /document\.body\.classList\.add\("print-job-active"\);\s+const clearPrintJob/);
  assert.match(NOVEL_STUDY_PROFILE_RUNTIME, /window\.print\(\);\s+window\.setTimeout\(clearPrintJob, 1000\);/);
  assert.match(NOVEL_STUDY_PROFILE_CSS, /\.novel-critical-planner>\.novel-field-grid\{grid-template-columns:1fr\}/);
  assert.match(NOVEL_STUDY_PROFILE_CSS, /\.novel-stage-summary\{[^}]*background:#fff[^}]*color:#202420/);
  assert.doesNotMatch(NOVEL_STUDY_PROFILE_CSS, /gradient/i);
  assert.doesNotMatch(NOVEL_STUDY_PROFILE_CSS, /border-radius:\s*(?:2[0-9]|3[0-9])px/i);
});

test("renderer rejects duplicate recipe identifiers before emitting unstable learner state", () => {
  assert.throws(
    () => renderNovelStudyProfile({ ...profile, tracks: [{ id: "same", title: "One" }, { id: "same", title: "Two" }] }),
    /duplicate stable id: same/
  );
});

test("renderer honours recipe-disabled activity routes without adding a standalone track chooser", () => {
  const activities = [
    { id: "critical-essay", title: "Critical Essay", route: "critical-essay", enabled: false, evidencePolicyIds: [] },
    { id: "reading-guide", title: "Reading Guide", route: "reading-guide", enabled: false, evidencePolicyIds: [] },
    { id: "major-works-data", title: "Major Works", route: "major-works-data", enabled: false, evidencePolicyIds: [] },
    { id: "novel-questions", title: "Questions", route: "novel-study-questions", enabled: true, evidencePolicyIds: [] },
    { id: "writing-studio", title: "Writing Studio", route: "writing-studio", enabled: true, evidencePolicyIds: [] }
  ];
  const output = renderNovelStudyProfile({
    ...profile,
    recipeProfile: {
      schemaVersion: 1,
      kind: "novel-study",
      novels: profile.tracks,
      questionPhases: ["opening", "middle", "final"],
      genericQuestionCount: 3,
      writingTools: ["analytical-paragraph", "motif-string", "authors-intent", "critical-essay"],
      activities,
      evidencePolicies: []
    }
  });
  assert.deepEqual(output.pages.map((page) => page.id), ["novel-study-questions", "writing-studio"]);
  assert.equal(output.pages.some((page) => page.id === "critical-essay" || page.id.startsWith("critical-essay-")), false);
  assert.deepEqual(output.navGroups, []);
});
