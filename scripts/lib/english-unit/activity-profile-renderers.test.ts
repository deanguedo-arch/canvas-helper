import assert from "node:assert/strict";
import test from "node:test";

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
    questions: [{ id: "conflict", label: "How does the central conflict begin?", hint: "Use a precise moment." }]
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
    materials: [{ id: "play-copy", title: "Play access", status: "access-required" }],
    actQuestionSets: questions,
    characters: [{ id: "john-proctor", name: "John Proctor" }],
    characterFields: dossierFields,
    essay
  };
  const output = renderEnglishActivityProfile(profile);
  assert.deepEqual(output.pages.map((page) => page.id), ["play-materials", "act-questions", "character-notes", "critical-essay"]);
  const html = output.pages.map((page) => page.html).join("\n");
  assert.match(html, /data-evidence-collection-id="ela20-crucible:act-questions:act-one:collection"/);
  assert.match(html, /data-save-response-collection/);
  assert.match(html, /Save Act Answers to Evidence Bank/);
  assert.match(html, /data-save-evidence-note/);
  assert.match(html, /class="evidence-bank-save-action"/);
  assert.doesNotMatch(html, /Diploma|Othello/);
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
            hint: "Use a precise moment."
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
  assert.match(reader, /data-editorial-status="needs-editorial"/);
  assert.match(reader, /data-evidence-contribution-id="ela20-macbeth:side-by-side:act-1-scene-1:evidence"/);
  const materials = output.pages.find((page) => page.id === "play-materials")?.html ?? "";
  assert.match(materials, /class="library-browser story-bank-browser shakespeare-document-browser"/);
  assert.match(materials, /data-response-id="ela20-macbeth:selection:materials"/);
  assert.match(materials, /data-shakespeare-open-src="https:\/\/shakespeare\.mit\.edu\/macbeth\/index\.html"/);
  assert.match(materials, /data-shakespeare-fullscreen-src="https:\/\/shakespeare\.mit\.edu\/macbeth\/index\.html"/);
  assert.match(materials, /data-shakespeare-download-src="assets\/macbeth-recurring-images\.pdf"/);

  const actQuestions = output.pages.find((page) => page.id === "act-questions")?.html ?? "";
  assert.match(actQuestions, /class="worksheet-document-header scene-checkpoint-heading"/);
  assert.match(actQuestions, /data-evidence-collection-id="ela20-macbeth:act-questions:act-one:collection"/);
  assert.match(actQuestions, /data-response-id="ela20-macbeth:act-questions:act-one:conflict"/);
  assert.match(actQuestions, /data-evidence-contribution-id="ela20-macbeth:act-questions:act-one:scene-1:evidence"/);
  assert.match(actQuestions, /Save Scene Checkpoint to Evidence Bank/);
  assert.match(actQuestions, /Save Act Answers to Evidence Bank/);

  const characterNotes = output.pages.find((page) => page.id === "character-notes")?.html ?? "";
  assert.match(characterNotes, /class="character-dossier-shell"/);
  assert.match(characterNotes, /data-evidence-collection-id="ela20-macbeth:character-notes:macbeth:dossier"/);
  assert.match(characterNotes, /data-evidence-contribution-id="ela20-macbeth:character-notes:macbeth:quotation"/);
  assert.match(characterNotes, /Save Quotation to Evidence Bank/);
  assert.match(characterNotes, /Save Dossier to Evidence Bank/);

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
  assert.equal(output.pages.some((page) => page.id === "critical-essay"), true);
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
  assert.equal(output.pages.some((page) => page.id === "critical-essay-lord-of-the-flies"), true);
  assert.equal(output.pages.some((page) => page.id === "critical-essay-book-thief"), true);
  const html = output.pages.map((page) => page.html).join("\n");
  assert.match(html, /ela20-novel:major-works:lord-of-the-flies:collection/);
  assert.match(html, /ela20-novel:major-works:book-thief:collection/);
  assert.match(html, /Save Passage to Evidence Bank/);
  assert.match(html, /Save Phase Answers to Evidence Bank/);
});

test("Film renderer remains title-neutral while exposing viewing and question collection saves", () => {
  const profile: EnglishFilmStudyProfile = {
    kind: "film-study",
    namespace: "ela20-film",
    courseCode: "ELA 20-1",
    unitTitle: "Film Study",
    filmSelection: { mode: "pending" },
    essay,
    viewingGuideFields: [
      { id: "timestamp", label: "Scene or timestamp", evidenceRole: "detail" },
      { id: "effect", label: "Effect on the viewer", evidenceRole: "connection" }
    ],
    questionSets: [{ id: "techniques", title: "Technique Questions", questions: [{ id: "camera", label: "How is camera movement used?" }] }]
  };
  const output = renderEnglishActivityProfile(profile);
  assert.deepEqual(output.pages.map((page) => page.id), ["critical-essay", "viewing-guide", "film-study-questions"]);
  const html = output.pages.map((page) => page.html).join("\n");
  assert.match(html, /A film has not been selected yet/);
  assert.match(html, /Saved Viewing Moments/);
  assert.match(html, /Save Viewing Moment to Evidence Bank/);
  assert.match(html, /Save Question Set to Evidence Bank/);
});

test("renderer rejects duplicate stable IDs and exports matching runtime hooks", () => {
  const profile: EnglishFilmStudyProfile = {
    kind: "film-study",
    namespace: "duplicate-test",
    courseCode: "ELA 20-1",
    unitTitle: "Film Study",
    filmSelection: { mode: "pending" },
    essay,
    viewingGuideFields: [],
    questionSets: [
      { id: "same", title: "One", questions: [] },
      { id: "same", title: "Two", questions: [] }
    ]
  };
  assert.throws(() => renderEnglishActivityProfile(profile), /Duplicate Film Study Questions question set id/);
  assert.doesNotThrow(() => new Function(ENGLISH_ACTIVITY_PROFILE_RUNTIME), "the emitted activity runtime must remain valid JavaScript");
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-english-activity-select/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-worksheet-toggle-hints/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-shakespeare-panel-select/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-shakespeare-reader-overlay/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-shakespeare-character-studio/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_RUNTIME, /data-shakespeare-match-state/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /button\.evidence-bank-save-action/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /background: #154212/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.shakespeare-materials-page \.shakespeare-document-browser/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.shakespeare-questions-page \.scene-checkpoint-heading/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.shakespeare-character-page \.character-dossier-shell/);
  assert.match(ENGLISH_ACTIVITY_PROFILE_CSS, /\.shakespeare-writing-page \.shakespeare-language-lab/);
});
