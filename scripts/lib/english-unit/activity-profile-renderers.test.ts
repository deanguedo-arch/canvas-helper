import assert from "node:assert/strict";
import test from "node:test";

import { chromium } from "@playwright/test";

import { renderNextStepCourseShell } from "../next-step-course-shell.js";
import {
  renderEnglishActivityProfile,
  type EnglishActivityField,
  type EnglishCriticalEssayProfile,
  type EnglishFilmStudyProfile,
  type EnglishModernDramaProfile,
  type EnglishNovelStudyProfile,
  type EnglishShakespeareProfile
} from "./activity-profile-renderers.js";
import { ENGLISH_ACTIVITY_PROFILE_CSS, ENGLISH_ACTIVITY_PROFILE_RUNTIME } from "./activity-profile-runtime.js";
import { buildEla20FilmStudyActivityProfile } from "./ela20-activity-profiles.js";

const essay: EnglishCriticalEssayProfile = {
  description: "Build a controlled response from interpretation and evidence.",
  stages: [
    {
      id: "thesis",
      title: "Topic and Thesis",
      focus: "Develop an arguable interpretation.",
      checkpoints: ["Connect the interpretation to the assigned topic."],
      fields: [{ id: "controlling-idea", label: "Controlling idea", hint: "Make the idea arguable." }]
    }
  ]
};

const questions = [
  {
    id: "act-one",
    title: "Act 1 Questions",
    questions: [{ id: "conflict", label: "How does the central conflict begin?", hint: "Use a precise moment.", section: "Teacher Act Worksheet" }]
  }
];

const dossierFields: EnglishActivityField[] = [
  { id: "goal", label: "Goal or pressure" },
  { id: "change", label: "Important change" }
];

test("modern-drama renderer emits the activity-specific pages and shared Evidence Bank contract", () => {
  const profile: EnglishModernDramaProfile = {
    kind: "modern-drama",
    namespace: "ela20-crucible",
    courseCode: "ELA 20-1",
    unitTitle: "Modern Drama",
    playTitle: "The Crucible",
    evidenceBankRoute: "evidence-bank",
    materials: [
      { id: "play-copy", title: "Play access", status: "access-required" },
      { id: "act-one-source", title: "Act 1 Questions", href: "assets/crucible-act-one.pdf", downloadable: true, status: "available" }
    ],
    actQuestionSets: [
      ...questions,
      { id: "act-two", title: "Act 2 Questions", questions: [{ id: "pressure", label: "How does pressure increase?", hint: "Track a character choice." }] }
    ],
    characters: [{ id: "john-proctor", name: "John Proctor" }, { id: "elizabeth-proctor", name: "Elizabeth Proctor" }],
    characterFields: dossierFields,
    essay: {
      ...essay,
      stages: [
        ...essay.stages,
        { id: "body-one", title: "Body Paragraph One", focus: "Develop one analytical stage.", fields: [{ id: "evidence", label: "Evidence and analysis" }] }
      ]
    }
  };
  const output = renderEnglishActivityProfile(profile);
  assert.deepEqual(output.pages.map((page) => page.id), ["play-materials", "act-questions", "character-notes", "critical-essay", "critical-essay-thesis", "critical-essay-body-one", "critical-essay-preview"]);
  assert.deepEqual(output.navGroups, [{
    id: "critical-essay",
    label: "Critical Essay",
    icon: "edit_note",
    landingItemLabel: "Critical Analytical Essay Guide",
    itemPageIds: ["critical-essay-thesis", "critical-essay-body-one", "critical-essay-preview"]
  }]);
  assert.equal(output.resourceLinks?.length, 1);

  const materials = output.pages.find((page) => page.id === "play-materials")?.html ?? "";
  assert.match(materials, /data-modern-drama-donor-parity="materials"/);
  assert.match(materials, /class="library-browser story-bank-browser shakespeare-document-browser modern-drama-document-browser"/);
  assert.match(materials, /data-response-id="ela20-crucible:selection:materials"/);
  assert.match(materials, /data-shakespeare-fullscreen-src="assets\/crucible-act-one\.pdf"/);
  assert.match(materials, /data-shakespeare-download-src="assets\/crucible-act-one\.pdf"/);
  assert.match(materials, /Use the assigned or school-licensed copy of this play/);

  const actQuestions = output.pages.find((page) => page.id === "act-questions")?.html ?? "";
  assert.match(actQuestions, /data-modern-drama-donor-parity="act-questions"/);
  assert.match(actQuestions, /class="shakespeare-workbench-picker modern-drama-workbench-picker"/);
  assert.match(actQuestions, /class="worksheet-document-header scene-checkpoint-heading english-dark-worksheet-header"/);
  assert.match(actQuestions, /data-evidence-collection-id="ela20-crucible:act-questions:act-one:collection"/);
  assert.match(actQuestions, /data-response-id="ela20-crucible:act-questions:act-one:conflict"/);
  assert.match(actQuestions, /data-activity-progress-label/);
  assert.match(actQuestions, /data-worksheet-toggle-hints/);
  assert.match(actQuestions, /data-worksheet-print/);
  assert.match(actQuestions, /Save Act Answers to Evidence Bank/);
  assert.doesNotMatch(actQuestions, /All scene questions|data-modern-drama-question-jump-target/);
  assert.match(actQuestions, /Scene questions/);
  assert.match(actQuestions, /Teacher Act Worksheet/);

  const characterNotes = output.pages.find((page) => page.id === "character-notes")?.html ?? "";
  assert.match(characterNotes, /data-modern-drama-donor-parity="character-conflict-dossiers"/);
  assert.match(characterNotes, /class="character-dossier-shell"/);
  assert.match(characterNotes, /data-character-progress-label="john-proctor"/);
  assert.match(characterNotes, /data-evidence-collection-id="ela20-crucible:character-notes:john-proctor:dossier"/);
  assert.doesNotMatch(characterNotes, /Quotation and conflict bank|Save Quotation to Evidence Bank|:quotation:detail/);
  assert.match(characterNotes, /Save Dossier to Evidence Bank/);
  assert.match(characterNotes, /class="worksheet-document-header character-dossier-heading english-dark-worksheet-header"/);

  const criticalEssay = output.pages.find((page) => page.id === "critical-essay")?.html ?? "";
  assert.match(criticalEssay, /data-modern-drama-donor-parity="critical-essay-guide"/);
  assert.match(criticalEssay, /Critical Analytical Essay Guide/);
  assert.match(criticalEssay, /Your writing path/);
  assert.match(criticalEssay, /Alberta assignment focus/);

  const thesisLesson = output.pages.find((page) => page.id === "critical-essay-thesis")?.html ?? "";
  assert.match(thesisLesson, /data-modern-drama-donor-parity="critical-essay-stage"/);
  assert.match(thesisLesson, /class="modern-drama-stage-summary english-dark-worksheet-header"/);
  assert.match(thesisLesson, /data-evidence-collection-id="ela20-crucible:critical-essay:unit:thesis:collection"/);
  assert.match(thesisLesson, /data-response-id="ela20-crucible:critical-essay:unit:thesis:controlling-idea"/);
  assert.match(thesisLesson, /Save Stage to Evidence Bank/);
  assert.match(thesisLesson, /class="modern-drama-critical-support-grid"/);
  assert.match(thesisLesson, /class="critical-writing-panel modern-drama-critical-panel modern-drama-critical-example"><h3>Example<\/h3>/);
  assert.match(thesisLesson, /Arthur Miller and The Crucible/);
  assert.match(thesisLesson, /class="critical-writing-panel modern-drama-critical-panel modern-drama-critical-tip"><h3>Writing tip<\/h3>/);
  assert.match(thesisLesson, /class="critical-writing-panel modern-drama-critical-panel modern-drama-critical-how-to"><h3>How to apply it<\/h3>/);
  assert.match(
    thesisLesson,
    /modern-drama-critical-lesson[\s\S]*modern-drama-critical-support-grid[\s\S]*modern-drama-critical-how-to[\s\S]*modern-drama-critical-planner/
  );

  const otherPlay = renderEnglishActivityProfile({
    ...profile,
    namespace: "ela10-fences-essay",
    courseCode: "ELA 10-1",
    playTitle: "Fences",
    recipeProfile: {
      schemaVersion: 1,
      kind: "modern-drama",
      actIds: ["act-one"],
      characterIds: ["troy"],
      criticalEssay: true,
      activities: [{
        id: "personal-response",
        title: "Personal Response",
        route: "personal-response",
        enabled: true,
        evidencePolicyIds: [],
      }],
      evidencePolicies: [],
    },
  });
  const otherPlayStage = otherPlay.pages.find((page) => page.id === "critical-essay-thesis")?.html ?? "";
  assert.doesNotMatch(otherPlayStage, /modern-drama-critical-support-grid|Arthur Miller and The Crucible/);
  const otherPlayPersonalResponse = otherPlay.pages.find((page) => page.id === "personal-response")?.html ?? "";
  assert.match(otherPlayPersonalResponse, /english-writing-workbook-page/);
  assert.match(otherPlay.css ?? "", /\.english-writing-workbook-stage > \.english-writing-stage-header[\s\S]*background: #161a17;/);

  const essayPreview = output.pages.find((page) => page.id === "critical-essay-preview")?.html ?? "";
  assert.match(essayPreview, /data-modern-drama-donor-parity="critical-essay-preview"/);
  assert.match(essayPreview, /data-modern-essay-preview/);
  assert.match(essayPreview, /Save Full Essay Plan/);

  const html = output.pages.map((page) => page.html).join("\n");
  assert.match(html, /data-save-response-collection/);
  assert.doesNotMatch(html, /data-save-evidence-note/);
  assert.match(html, /class="evidence-bank-save-action"/);
  assert.doesNotMatch(html, /Diploma|Othello/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.modern-drama-critical-support-grid/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.modern-drama-critical-tip/);
});

test("modern-drama renderer adds a local Film Room without placing the MP4 in Materials", () => {
  const profile: EnglishModernDramaProfile = {
    kind: "modern-drama",
    namespace: "ela20-crucible-film",
    courseCode: "ELA 20-1",
    unitTitle: "Modern Drama",
    playTitle: "The Crucible",
    materials: [
      { id: "full-text", title: "The Crucible Full Text", kind: "document", href: "assets/full-text.pdf", downloadable: true },
      { id: "feature-film", title: "The Crucible Feature Film", kind: "video", href: "assets/crucible.mp4", downloadable: true }
    ],
    actQuestionSets: questions,
    characters: [{ id: "john-proctor", name: "John Proctor" }],
    characterFields: dossierFields
  };

  const output = renderEnglishActivityProfile(profile);
  assert.deepEqual(output.pages.map((page) => page.id), ["play-materials", "film-room", "act-questions", "character-notes"]);
  const materials = output.pages.find((page) => page.id === "play-materials")?.html ?? "";
  assert.match(materials, /The Crucible Full Text/);
  assert.doesNotMatch(materials, /The Crucible Feature Film/);
  const filmRoom = output.pages.find((page) => page.id === "film-room")?.html ?? "";
  assert.match(filmRoom, /<video controls playsinline preload="metadata" title="The Crucible Feature Film"/);
  assert.match(filmRoom, /<source src="assets\/crucible\.mp4" type="video\/mp4">/);
  assert.match(filmRoom, /caption or transcript accommodation/);
  assert.doesNotMatch(filmRoom, /admin|pending/i);
});

test("modern-drama renderer provides a single-column scene reader without Shakespeare comparison copy", () => {
  const profile: EnglishModernDramaProfile = {
    kind: "modern-drama",
    namespace: "ela10-fences",
    courseCode: "ELA 10-1",
    unitTitle: "Modern Play",
    playTitle: "Fences",
    questionNavigation: "scene",
    scriptScenes: [
      { id: "act-1-scene-1", act: 1, scene: 1, title: "Friday evening.", text: "Troy and Bono enter the yard.\ntroy: Trying to guess out of six hundred\n\nways which way the number will come.\nbono: What did they say?" },
      { id: "act-1-scene-2", act: 1, scene: 2, title: "Rose hangs clothes.", text: "rose (sings): Jesus, be a fence all around me." }
    ],
    scriptSpeakers: ["Troy", "Bono", "Rose"],
    materials: [{ id: "fences-script", title: "Fences Script", kind: "document", href: "assets/fences.pdf", downloadable: true }],
    actQuestionSets: [
      {
        id: "act-one",
        title: "Act I Questions",
        questions: [
          { id: "scene-one", label: "How is the central conflict introduced?", section: "Act I, Scene 1", provenance: "profile-supplied" },
          { id: "scene-two", label: "What does the fence symbolize?", section: "Act I, Scene 2 — Teacher Questions", provenance: "teacher-supplied" }
        ]
      }
    ],
    characters: [{ id: "troy", name: "Troy" }],
    characterFields: dossierFields
  };
  const output = renderEnglishActivityProfile(profile);
  assert.equal(output.pages[0]?.id, "script-reader");
  const reader = output.pages[0]?.html ?? "";
  assert.match(reader, /Fences Script Reader/);
  assert.match(reader, /Act 1, Scene 1/);
  assert.match(reader, /data-english-activity-select="ela10-fences:script-reader:scenes"/);
  assert.match(reader, /class="modern-drama-script-text"/);
  assert.match(reader, /class="modern-drama-script-stage-direction" aria-label="Opening stage direction"/);
  assert.match(reader, /class="modern-drama-script-dialogue" role="list" aria-label="Scene dialogue"/);
  assert.match(reader, /class="modern-drama-script-speech"><strong class="modern-drama-script-speaker">troy:<\/strong> Trying to guess out of six hundred ways which way the number will come\.<\/p>/);
  assert.doesNotMatch(reader, /six hundred<\/p><p>ways/);
  assert.match(reader, /<strong class="modern-drama-script-speaker">rose:<\/strong> <em class="modern-drama-script-cue">\(sings\)<\/em>/);
  assert.match(reader, /Open Original PDF/);
  assert.doesNotMatch(reader, /side-by-side|plain-language|companion/i);

  const sceneQuestions = output.pages.find((page) => page.id === "act-questions")?.html ?? "";
  assert.match(sceneQuestions, /data-modern-drama-question-navigation="scene"/);
  assert.match(sceneQuestions, /Choose an act and scene/);
  assert.match(sceneQuestions, /Act I, Scene 1 — 1 question/);
  assert.match(sceneQuestions, /Act I, Scene 2 — 1 question/);
  assert.equal((sceneQuestions.match(/class="worksheet-document english-activity-worksheet shakespeare-question-workbench modern-drama-question-workbench"/g) ?? []).length, 2);
  assert.match(sceneQuestions, /Save Scene Answers to Evidence Bank/);
  assert.match(sceneQuestions, /data-response-id="ela10-fences:act-questions:act-one:scene-one"/);
  assert.match(sceneQuestions, /data-evidence-collection-id="ela10-fences:act-questions:act-one:scene-collection:act-i-scene-1:collection"/);
});

test("Shakespeare renderer keeps side-by-side passages data-driven and marks editorial state", () => {
  const profile: EnglishShakespeareProfile = {
    kind: "shakespeare-drama",
    namespace: "ela20-macbeth",
    courseCode: "ELA 20-1",
    unitTitle: "Shakespearean Drama",
    playTitle: "Macbeth",
    scenes: [
      {
        id: "act-1-scene-1",
        act: 1,
        scene: 1,
        title: "The Heath",
        summary: "The witches establish the play's unsettled world.",
        editorialStatus: "needs-editorial",
        passages: [{ id: "fair-foul", speaker: "Witches", original: "Fair is foul.", companion: "Appearances will be unreliable." }]
      }
    ],
    materials: [
      {
        id: "macbeth-original-text",
        title: "Macbeth Original Text",
        description: "Read the complete public-domain play through MIT Shakespeare.",
        href: "https://shakespeare.mit.edu/macbeth/index.html",
        actionLabel: "Open Source",
        status: "available"
      },
      {
        id: "motif-work",
        title: "Macbeth Recurring Images",
        description: "Teacher-selected motif work.",
        href: "assets/macbeth-recurring-images.pdf",
        downloadable: true,
        status: "available"
      }
    ],
    actQuestionSets: [
      {
        id: "act-one",
        title: "Act 1 Questions",
        questions: [
          {
            id: "conflict",
            label: "Act 1, Scene 1: How does the central conflict begin?",
            hint: "Use a precise moment.",
            provenance: "profile-supplied"
          }
        ]
      }
    ],
    characters: [{ id: "macbeth", name: "Macbeth" }],
    characterFields: dossierFields,
    writingTools: [
      {
        id: "language-lab",
        title: "Language Lab",
        description: "Practise Shakespeare's phrasing.",
        evidenceMode: "none",
        fields: [
          { id: "original-phrase", label: "Original phrase" },
          { id: "plain-language", label: "Plain-language meaning" },
          { id: "language-feature", label: "Language feature" }
        ]
      },
      {
        id: "close-reading",
        title: "Close Reading Annotation Lab",
        description: "Annotate a passage.",
        evidenceMode: "individual",
        fields: [
          { id: "passage", label: "Passage", evidenceRole: "detail" },
          { id: "analysis", label: "Analysis", evidenceRole: "connection" }
        ]
      },
      {
        id: "visual-motif",
        title: "Visual Motif Essay",
        description: "Trace a motif across four acts.",
        evidenceMode: "collection",
        evidenceLabel: "Save Visual Motif Essay Plan",
        fields: [
          { id: "motif", label: "Motif focus", type: "select", options: ["Blood", "Sleep"] },
          { id: "theme-claim", label: "Theme connection" },
          { id: "act-one-evidence", label: "Act 1 quotation, image, and commentary" },
          { id: "act-four-five-evidence", label: "Act 4 or 5 quotation, image, and commentary" },
          { id: "visual-plan", label: "Visual composition plan" },
          { id: "rubric-check", label: "Quality check" }
        ]
      }
    ],
    essay
  };
  const output = renderEnglishActivityProfile(profile);
  assert.equal(output.resourceLinks?.length, 2);
  assert.equal(output.resourceLinks?.[0]?.href, "https://shakespeare.mit.edu/macbeth/index.html");
  const reader = output.pages.find((page) => page.id === "side-by-side")?.html ?? "";
  assert.match(reader, /Fair is foul\./);
  assert.match(reader, /Appearances will be unreliable\./);
  assert.doesNotMatch(reader, /Companion needs editorial review|data-editorial-status|Machine-normalized|final packaging/);
  assert.match(reader, /data-evidence-contribution-id="ela20-macbeth:side-by-side:act-1-scene-1:evidence"/);
  const materials = output.pages.find((page) => page.id === "play-materials")?.html ?? "";
  assert.match(materials, /class="library-browser story-bank-browser shakespeare-document-browser"/);
  assert.match(materials, /data-response-id="ela20-macbeth:selection:materials"/);
  assert.match(materials, /data-shakespeare-open-src="https:\/\/shakespeare\.mit\.edu\/macbeth\/index\.html"/);
  assert.match(materials, /data-shakespeare-fullscreen-src="https:\/\/shakespeare\.mit\.edu\/macbeth\/index\.html"/);
  assert.match(materials, /data-shakespeare-download-src="assets\/macbeth-recurring-images\.pdf"/);

  const actQuestions = output.pages.find((page) => page.id === "act-questions")?.html ?? "";
  assert.match(actQuestions, /class="worksheet-document-header scene-checkpoint-heading english-dark-worksheet-header"/);
  assert.match(actQuestions, /data-evidence-collection-id="ela20-macbeth:act-questions:act-one:collection"/);
  assert.match(actQuestions, /data-response-id="ela20-macbeth:act-questions:act-one:conflict"/);
  assert.match(actQuestions, /data-evidence-contribution-id="ela20-macbeth:act-questions:act-one:scene-1:evidence"/);
  assert.match(actQuestions, /data-question-origin="profile-supplied"/);
  assert.match(actQuestions, /Scene questions/);
  assert.doesNotMatch(actQuestions, /Profile-supplied questions|teacher-supplied Macbeth question PDF|source PDF contains/);
  assert.match(actQuestions, /Save Scene Checkpoint to Evidence Bank/);
  assert.match(actQuestions, /Save Act Answers to Evidence Bank/);

  const characterNotes = output.pages.find((page) => page.id === "character-notes")?.html ?? "";
  assert.match(characterNotes, /class="character-dossier-shell"/);
  assert.match(characterNotes, /data-evidence-collection-id="ela20-macbeth:character-notes:macbeth:dossier"/);
  assert.doesNotMatch(characterNotes, /Quotation bank|Save Quotation to Evidence Bank|:quotation:detail/);
  assert.match(characterNotes, /Save Dossier to Evidence Bank/);
  assert.match(characterNotes, /class="worksheet-document-header character-dossier-heading english-dark-worksheet-header"/);

  const writingStudio = output.pages.find((page) => page.id === "writing-studio")?.html ?? "";
  assert.match(writingStudio, /data-shakespeare-language-lab/);
  assert.match(writingStudio, /data-shakespeare-match-state/);
  assert.match(writingStudio, /data-evidence-contribution-id="ela20-macbeth:writing-studio:close-reading:entry"/);
  assert.match(writingStudio, /data-evidence-collection-id="ela20-macbeth:writing-studio:visual-motif:collection"/);
  assert.match(writingStudio, /data-response-id="ela20-macbeth:writing-studio:visual-motif:motif"/);
  assert.match(writingStudio, /data-response-id="ela20-macbeth:writing-studio:visual-motif:theme-claim"/);
  assert.match(writingStudio, /data-response-id="ela20-macbeth:writing-studio:visual-motif:act-one-evidence"/);
  assert.match(writingStudio, /data-response-id="ela20-macbeth:writing-studio:visual-motif:act-four-five-evidence"/);
  assert.match(writingStudio, /data-response-id="ela20-macbeth:writing-studio:visual-motif:visual-plan"/);
  assert.match(writingStudio, /data-response-id="ela20-macbeth:writing-studio:visual-motif:rubric-check"/);
  assert.match(writingStudio, /Save Visual Motif Essay Plan/);
  assert.match(writingStudio, /class="writing-activity-header shakespeare-assignment-header english-dark-worksheet-header"/);
  assert.deepEqual(output.pages.filter((page) => page.id.startsWith("critical-essay")).map((page) => page.id), [
    "critical-essay",
    "critical-essay-thesis",
    "critical-essay-preview"
  ]);
  assert.deepEqual(output.navGroups?.[0]?.itemPageIds, ["critical-essay-thesis", "critical-essay-preview"]);
  assert.match(output.pages.find((page) => page.id === "critical-essay")?.html ?? "", /data-modern-drama-donor-parity="critical-essay-guide"/);
  assert.match(output.pages.find((page) => page.id === "critical-essay-preview")?.html ?? "", /data-modern-essay-preview/);
});

test("Novel renderer separates track response IDs while reusing the configured activities", () => {
  const profile: EnglishNovelStudyProfile = {
    kind: "novel-study",
    namespace: "ela20-novel",
    courseCode: "ELA 20-1",
    unitTitle: "Novel Study",
    tracks: [
      { id: "lord-of-the-flies", title: "Lord of the Flies", author: "William Golding" },
      { id: "book-thief", title: "The Book Thief", author: "Markus Zusak" }
    ],
    essay,
    readingGuideFields: [
      { id: "passage", label: "Passage", evidenceRole: "detail" },
      { id: "analysis", label: "Author's choice and effect", evidenceRole: "connection" }
    ],
    majorWorksFields: [{ id: "theme", label: "Themes" }],
    questionSets: questions,
    writingTools: [{ id: "paragraph", title: "Analytical Paragraph Builder", description: "Build a paragraph.", evidenceMode: "collection", fields: [{ id: "draft", label: "Paragraph" }] }]
  };
  const output = renderEnglishActivityProfile(profile);
  assert.equal(output.pages.some((page) => page.id === "critical-essay"), true);
  const html = output.pages.map((page) => page.html).join("\n");
  assert.match(html, /data-novel-track-panel="lord-of-the-flies"/);
  assert.match(html, /data-novel-track-panel="book-thief"/);
  assert.match(html, /ela20-novel:major-works:lord-of-the-flies:collection/);
  assert.match(html, /ela20-novel:major-works:book-thief:collection/);
  assert.match(html, /Save Passage Card/);
  assert.match(output.runtime ?? "", /Save to Evidence Bank/);
  assert.match(html, /Save Phase Answers to Evidence Bank/);
});

test("Film renderer remains title-neutral while exposing viewing and question collection saves", () => {
  const profile = buildEla20FilmStudyActivityProfile({ projectSlug: "ela20-film" });
  const output = renderEnglishActivityProfile(profile);
  assert.deepEqual(output.pages.map((page) => page.id), [
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
  assert.deepEqual(output.navGroups, [{
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
  const html = output.pages.map((page) => page.html).join("\n");
  assert.doesNotMatch(html, /Film selection pending|data-film-selection-pending/);
  assert.match(html, /Critical Analytical Essay Guide/);
  assert.match(html, /Saved Viewing Moments/);
  assert.match(output.runtime ?? "", /Save to Evidence Bank/);
  assert.match(html, /Save Selected Question Set to Evidence Bank/);
});

test("renderer rejects duplicate stable IDs and exports matching runtime hooks", () => {
  const validFilm = buildEla20FilmStudyActivityProfile({ projectSlug: "duplicate-test" });
  const profile: EnglishFilmStudyProfile = {
    ...validFilm,
    questionSets: [
      { id: "same", title: "One", questions: [] },
      { id: "same", title: "Two", questions: [] }
    ]
  };
  assert.throws(() => renderEnglishActivityProfile(profile), /Film question sets contains duplicate id/);
  assert.doesNotThrow(() => new Function(ENGLISH_ACTIVITY_PROFILE_RUNTIME), "the emitted activity runtime must remain valid JavaScript");
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-english-activity-select/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-worksheet-toggle-hints/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-shakespeare-panel-select/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-shakespeare-reader-overlay/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-shakespeare-character-studio/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-shakespeare-match-state/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-modern-essay-preview/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-save-modern-essay-preview/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /button\.evidence-bank-save-action/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /background: #154212/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.shakespeare-materials-page \.shakespeare-document-browser/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.shakespeare-questions-page \.scene-checkpoint-heading/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.shakespeare-character-page \.character-dossier-shell/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.shakespeare-writing-page \.shakespeare-language-lab/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.modern-drama-essay-stage/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.modern-drama-preview-document/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.modern-drama-questions-page \.modern-drama-act-progress/);
});

test("repeatable novel evidence accumulates, updates, removes, and survives reload without clearing the source draft", { timeout: 30_000 }, async () => {
  const profile: EnglishNovelStudyProfile = {
    kind: "novel-study",
    namespace: "repeatable-runtime",
    courseCode: "ELA 20-1",
    unitTitle: "Novel Study",
    tracks: [{ id: "novel-one", title: "Novel One" }],
    essay,
    readingGuideFields: [
      { id: "passage", label: "Passage", evidenceRole: "detail" },
      { id: "analysis", label: "Analysis", evidenceRole: "connection" }
    ],
    majorWorksFields: [],
    questionSets: questions,
    writingTools: []
  };
  const rendered = renderEnglishActivityProfile(profile);
  const shell = renderNextStepCourseShell({
    slug: "repeatable-runtime",
    courseTitle: "Novel Study",
    courseCode: "ELA 20-1",
    overviewIntro: "Runtime test",
    outcomes: ["Test repeatable evidence"],
    lessons: [],
    storageKeyBase: "canvas-helper:repeatable-runtime-test",
    navItems: rendered.pages.map((page) => ({ id: page.id, label: page.label, icon: page.icon, html: page.html })),
    extraCss: `${ENGLISH_ACTIVITY_PROFILE_CSS}\n${rendered.css ?? ""}`
  });
  const html = shell.replace("</body>", `<script>${ENGLISH_ACTIVITY_PROFILE_RUNTIME}\n${rendered.runtime ?? ""}</script></body>`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route("http://repeatable.test/", (route) => route.fulfill({ status: 200, contentType: "text/html", body: html }));
  try {
    await page.goto("http://repeatable.test/");
    await page.evaluate(() => { (document.querySelector("#reading-guide") as HTMLElement).hidden = false; });
    const panel = page.locator('#reading-guide [data-repeatable-root="reading-passage"]');
    const detail = panel.locator('[data-repeatable-draft="passage"]');
    const connection = panel.locator('[data-repeatable-draft="analysis"]');
    await detail.fill("First passage");
    await connection.fill("First analysis");
    await panel.locator("[data-repeatable-save]").click();
    await panel.locator("[data-repeatable-evidence]").first().click();
    assert.match((await panel.locator("[data-repeatable-entry]").first().textContent()) ?? "", /First passage/, "saving must preserve the activity card");

    await detail.fill("Second passage");
    await connection.fill("Second analysis");
    await panel.locator("[data-repeatable-save]").click();
    await panel.locator("[data-repeatable-evidence]").nth(1).click();

    const firstEntries = await page.evaluate(() => (window as typeof window & {
      nextStepEvidenceBank: { list: () => Array<{ contributionId: string; answer: string }> };
    }).nextStepEvidenceBank.list());
    assert.equal(firstEntries.length, 2);
    assert.equal(new Set(firstEntries.map((entry) => entry.contributionId)).size, 2);
    assert.equal(firstEntries.every((entry) => entry.contributionId.startsWith("repeatable-runtime:reading-guide:")), true);

    await page.reload();
    await page.evaluate(() => { (document.querySelector("#reading-guide") as HTMLElement).hidden = false; });
    const restoredPanel = page.locator('#reading-guide [data-repeatable-root="reading-passage"]');
    assert.equal(await restoredPanel.locator("[data-repeatable-entry]").count(), 2, "saved entry identities must restore with response state");

    await restoredPanel.locator("[data-repeatable-edit]").first().click();
    const restoredDetail = restoredPanel.locator('[data-repeatable-draft="passage"]');
    await restoredDetail.fill("First passage revised");
    await restoredPanel.locator("[data-repeatable-save]").click();
    await restoredPanel.locator("[data-repeatable-evidence]").first().click();
    const updatedEntries = await page.evaluate(() => (window as typeof window & {
      nextStepEvidenceBank: { list: () => Array<{ contributionId: string; answer: string }> };
    }).nextStepEvidenceBank.list());
    assert.equal(updatedEntries.length, 2, "saving an edited entry must upsert rather than duplicate");
    assert.equal(updatedEntries.some((entry) => entry.answer.includes("First passage revised")), true);

    await page.evaluate(() => {
      const api = (window as typeof window & { nextStepEvidenceBank: { list: () => Array<{ contributionId: string }>; remove: (id: string) => boolean } }).nextStepEvidenceBank;
      api.remove(api.list()[0].contributionId);
    });
    assert.equal(await restoredPanel.locator("[data-repeatable-entry]").count(), 2, "removing the Evidence Bank copy must not erase source activity cards");
    assert.match((await restoredPanel.textContent()) ?? "", /First passage revised/);
    const remainingEntries = await page.evaluate(() => (window as typeof window & {
      nextStepEvidenceBank: { list: () => unknown[] };
    }).nextStepEvidenceBank.list());
    assert.equal(remainingEntries.length, 1);
  } finally {
    await browser.close();
  }
});
