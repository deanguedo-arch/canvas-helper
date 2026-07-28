import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDraculaScriptScenes,
  renderV3MediumProfile,
  type EnglishResource,
} from "./v3-medium-profile-renderer.js";
import type {
  EnglishActivityProfileV1,
  EnglishUnitRecipeV3,
  EnglishWritingFormConfigV1,
} from "./types.js";

function recipe(input: {
  slug: string;
  courseCode: string;
  unitTitle: string;
  activityProfile: EnglishActivityProfileV1;
  writingForms?: EnglishWritingFormConfigV1[];
  derivesFromProject?: string;
}) {
  return {
    schemaVersion: 3,
    projectSlug: input.slug,
    courseCode: input.courseCode,
    courseTitle: input.courseCode,
    unitTitle: input.unitTitle,
    profileVersion: "3.0.0-test",
    status: "draft",
    derivesFromProject: input.derivesFromProject ?? "approved-donor",
    source: { brightspaceZip: "source.zip", teacherResourcesZip: "teacher.zip", unitId: "test" },
    activityProfile: input.activityProfile,
    writingForms: input.writingForms ?? [
      { kind: "literary-exploration", trackMode: "unit" },
      { kind: "personal-response", trackMode: "unit" },
    ],
    lessonOrder: [],
    topLevelLessonOrder: [],
    lessonGroups: [],
    readings: [],
    placements: [],
    analysisTerms: [],
    analysisExamples: [],
    resourceDispositions: [],
    excludedFiles: [],
    wordingCorrections: [],
    mediaPolicy: { verifiedAt: "2026-07-22", allowedYouTubeIds: [], blockedYouTubeIds: [], approvedExternalUrls: [] },
    customComponents: [],
    acceptance: { requiredRoutes: [], requiredActivityIds: [], reviewItems: [] },
  } as unknown as EnglishUnitRecipeV3;
}

function baseProfile(kind: EnglishActivityProfileV1["kind"]) {
  const routes = kind === "modern-drama"
    ? ["script-reader", "materials", "act-questions", "character-notes"]
    : kind === "novel-study"
      ? ["reading-guide", "novel-study-questions"]
      : kind === "film-study"
        ? ["viewing-guide", "film-study-questions", "film-room", "materials"]
        : [];
  return {
    kind,
    schemaVersion: 1 as const,
    activities: routes.map((route) => ({ id: route, title: route, route, enabled: true, evidencePolicyIds: [] })),
    evidencePolicies: [],
  };
}

const modernResources: EnglishResource[] = [
  {
    id: "dracula-script",
    title: "Dracula Script",
    role: "reading",
    source: "Dracula Script.docx",
    href: "assets/dracula-script.docx",
    text: "ACT ONE\nSCENE ONE\nDRACULA:\nWelcome.\nMINA:\nWho is there?\nSCENE TWO\nDRACULA:\nThe night begins.",
    reviewRequired: false,
  },
  {
    id: "dracula-act-one-questions",
    title: "Dracula Act One Questions",
    role: "question-set",
    source: "Dracula Questions.docx",
    href: "assets/dracula-questions.docx",
    text: "1. What does Dracula reveal in the opening scene?\n2. How does Mina respond to the conflict?",
    reviewRequired: false,
  },
];

test("Dracula script pages map to truthful Acts I-III and both Act III scenes", () => {
  const pages = [
    ...Array.from({ length: 10 }, (_value, index) => ({
      page: index + 3,
      text: index === 0
        ? "Act Two\nLucy's bedroom; following day\nAct Three\nSCENE 1\nThe library, 32 hours later\nSCENE 2\nA vault\nThe library on the ground floor of Dr. Seward's Sanitarium at Purley.\nHARKER: Act One begins."
        : `HARKER: Act One page ${index + 3}.`,
    })),
    ...Array.from({ length: 5 }, (_value, index) => ({ page: index + 14, text: `LUCY: Act Two page ${index + 14}.` })),
    ...Array.from({ length: 7 }, (_value, index) => ({
      page: index + 20,
      text: index === 0
        ? "ACTTHREE\nSCENE I:\nVAN HELSING: Act Three begins."
        : index === 5
          ? "VAN HELSING: Scene One ends.\nSCENE II:\nRENFIELD: The vault scene begins."
          : `DRACULA: Act Three page ${index + 20}.`,
    })),
  ];
  const resource: EnglishResource = {
    id: "dracula-script",
    title: "Dracula Play Script",
    role: "reading",
    source: "Dracula.pdf",
    reviewRequired: false,
    text: pages.map((page) => page.text).join("\n\n"),
    pages,
  };

  const scenes = buildDraculaScriptScenes(resource);
  assert.deepEqual(scenes.map((scene) => [scene.id, scene.act, scene.scene]), [
    ["act-1-scene-1", 1, 1],
    ["act-2-scene-1", 2, 1],
    ["act-3-scene-1", 3, 1],
    ["act-3-scene-2", 3, 2],
  ]);
  assert.match(scenes[0]?.text ?? "", /Act One begins/);
  assert.doesNotMatch(scenes[0]?.text ?? "", /Lucy's bedroom; following day/);
  assert.match(scenes[3]?.text ?? "", /vault scene begins/);
  assert.doesNotMatch(scenes[2]?.text ?? "", /vault scene begins/);
});

test("modern-drama V3 renders ordered -2 writing before native play activities and extracts teacher questions", () => {
  const output = renderV3MediumProfile({
    recipe: recipe({
      slug: "ela10-2-modern-play-dracula",
      courseCode: "ELA 10-2",
      unitTitle: "Modern Play - Dracula",
      activityProfile: {
        ...baseProfile("modern-drama"),
        kind: "modern-drama",
        actIds: ["act-1", "act-2"],
        characterIds: ["dracula", "mina"],
        criticalEssay: false,
      },
    }),
    resources: modernResources,
  });

  assert.equal(output.kind, "modern-drama");
  assert.deepEqual(output.navGroups?.slice(0, 2).map((group) => group.id), ["literary-exploration", "personal-response"]);
  assert.equal(output.pages[0]?.id, "literary-exploration");
  assert.equal(output.pages[8]?.id, "personal-response");
  assert.ok(output.pages.findIndex((page) => page.id === "script-reader") > output.pages.findIndex((page) => page.id === "personal-response-preview"));
  assert.equal(output.pages.some((page) => page.id === "critical-essay" || page.id.startsWith("critical-essay-")), false);
  assert.equal(output.navGroups?.some((group) => group.id === "critical-essay"), false);
  assert.match(output.pages.find((page) => page.id === "act-questions")?.html ?? "", /What does Dracula reveal in the opening scene/);
  assert.match(output.pages.find((page) => page.id === "script-reader")?.html ?? "", /Dracula Script Reader/);
  assert.match(output.pages.map((page) => page.html).join("\n"), /ELA 10-2/);
});

test("modern-drama V3 omits native routes disabled by the recipe", () => {
  const output = renderV3MediumProfile({
    recipe: recipe({
      slug: "ela30-2-modern-drama-streetcar",
      courseCode: "ELA 30-2",
      unitTitle: "Modern Drama - A Streetcar Named Desire",
      activityProfile: {
        ...baseProfile("modern-drama"),
        kind: "modern-drama",
        activities: [
          { id: "character-notes", title: "Character Notes", route: "character-notes", enabled: true, evidencePolicyIds: [] },
          { id: "materials", title: "Materials", route: "materials", enabled: true, evidencePolicyIds: [] },
        ],
        actIds: ["scene-1"],
        characterIds: ["blanche"],
        criticalEssay: false,
      },
      writingForms: [
        { kind: "literary-exploration", trackMode: "unit" },
        { kind: "personal-response", trackMode: "unit" },
        { kind: "visual-response", trackMode: "unit" },
      ],
    }),
    resources: [],
  });

  assert.equal(output.pages.some((page) => page.id === "act-questions"), false);
  assert.equal(output.pages.some((page) => page.id === "script-reader"), false);
  assert.equal(output.pages.some((page) => page.id === "character-notes"), true);
  assert.equal(output.pages.some((page) => page.id === "materials"), true);
});

test("modern-drama V3 renders the approved Streetcar film-room playlist", () => {
  const output = renderV3MediumProfile({
    recipe: recipe({
      slug: "ela30-2-modern-drama-streetcar",
      courseCode: "ELA 30-2",
      unitTitle: "Modern Drama - A Streetcar Named Desire",
      activityProfile: {
        ...baseProfile("modern-drama"),
        kind: "modern-drama",
        activities: [
          { id: "film-room", title: "Film Room", route: "film-room", enabled: true, evidencePolicyIds: [] },
          { id: "writing-studio", title: "Writing Studio", route: "writing-studio", enabled: true, evidencePolicyIds: [] },
          { id: "materials", title: "Materials", route: "materials", enabled: true, evidencePolicyIds: [] },
        ],
        actIds: ["scene-1"],
        characterIds: ["blanche"],
        criticalEssay: false,
      },
      writingForms: [
        { kind: "literary-exploration", trackMode: "unit" },
        { kind: "personal-response", trackMode: "unit" },
        { kind: "visual-response", trackMode: "unit" },
      ],
    }),
    resources: [
      {
        id: "streetcar-full-film",
        title: "Streetcar Named Desire Movie",
        role: "media",
        source: "assets/media/streetcar-named-desire-movie.mp4",
        href: "assets/generated/resources/streetcar-full-film-streetcar-named-desire-movie.mp4",
        reviewRequired: false,
      },
      {
        id: "streetcar-audio-overview",
        title: "Streetcar Audio Overview",
        role: "media",
        source: "assets/media/The_Brando_Curse_and_Forbidden_Subtext.m4a",
        href: "assets/generated/resources/streetcar-audio-overview-The_Brando_Curse_and_Forbidden_Subtext.m4a",
        reviewRequired: false,
      },
    ],
  });

  const filmRoom = output.pages.find((page) => page.id === "film-room");
  const writingStudio = output.pages.find((page) => page.id === "writing-studio");
  assert.ok(filmRoom);
  assert.ok(writingStudio);
  assert.match(filmRoom.html, /Streetcar Named Desire Movie/);
  assert.match(filmRoom.html, /Streetcar Audio Overview/);
  assert.match(filmRoom.html, /data-english-activity-select/);
  assert.match(filmRoom.html, /<video/);
  assert.match(filmRoom.html, /<audio/);
  assert.match(writingStudio.html, /Critical\/Analytical Response Workspace/);
  assert.match(writingStudio.html, /Text Knowledge/);
  assert.match(writingStudio.html, /Thesis Workshop/);
  assert.match(writingStudio.html, /Evidence Collector/);
  assert.match(writingStudio.html, /Paragraph Architect/);
  assert.match(writingStudio.html, /data-shakespeare-select-input="ela30-2-modern-drama-streetcar:writing-studio:tools"/);
  assert.match(writingStudio.html, /data-save-response-collection/);
  assert.match(writingStudio.html, /data-save-evidence-note/);
  assert.equal(output.pages.find((page) => page.id === "materials")?.html.includes("Streetcar Audio Overview"), false);
});

test("novel-study V3 uses recipe tracks, teacher questions, and no donor Critical Essay pages", () => {
  const output = renderV3MediumProfile({
    recipe: recipe({
      slug: "ela10-2-novel-study",
      courseCode: "ELA 10-2",
      unitTitle: "Novel Study",
      activityProfile: {
        ...baseProfile("novel-study"),
        kind: "novel-study",
        novels: [
          { id: "speak", title: "Speak", author: "Laurie Halse Anderson" },
          { id: "boy-striped-pajamas", title: "The Boy in the Striped Pajamas", author: "John Boyne" },
        ],
        questionPhases: ["opening", "middle", "final"],
        genericQuestionCount: 24,
        writingTools: ["analytical-paragraph", "motif-string", "authors-intent"],
      },
      writingForms: [
        { kind: "literary-exploration", trackMode: "per-work" },
        { kind: "personal-response", trackMode: "per-work" },
      ],
    }),
    resources: [{
      id: "novel-questions",
      title: "Novel Questions",
      role: "question-set",
      source: "Novel Questions.docx",
      href: "assets/novel-questions.docx",
      text: "1. How does the protagonist respond to isolation?\n2. What pattern develops in the middle of the novel?",
      reviewRequired: false,
    }],
  });

  const allHtml = output.pages.map((page) => page.html).join("\n");
  assert.equal(output.pages.some((page) => page.id === "critical-essay" || page.id.startsWith("critical-essay-")), false);
  assert.deepEqual(output.navGroups?.slice(0, 2).map((group) => group.id), ["literary-exploration", "personal-response"]);
  assert.match(allHtml, /Speak — Laurie Halse Anderson/);
  assert.match(allHtml, /The Boy in the Striped Pajamas — John Boyne/);
  assert.match(output.pages.find((page) => page.id === "novel-study-questions")?.html ?? "", /How does the protagonist respond to isolation/);
  assert.ok(output.pages.findIndex((page) => page.id === "reading-guide") > output.pages.findIndex((page) => page.id === "personal-response-preview"));
});

test("ELA 30-2 film V3 preserves the three-form order before native film activities", () => {
  const output = renderV3MediumProfile({
    recipe: recipe({
      slug: "ela30-2-film-study",
      courseCode: "ELA 30-2",
      unitTitle: "Film Study",
      activityProfile: {
        ...baseProfile("film-study"),
        kind: "film-study",
        filmSelection: { mode: "pending" },
        techniqueQuestionCount: 22,
        fullResponseQuestionCount: 18,
        criticalEssayFieldCount: 19,
        viewingGuide: true,
      },
      writingForms: [
        { kind: "literary-exploration", trackMode: "unit" },
        { kind: "personal-response", trackMode: "unit" },
        { kind: "visual-response", trackMode: "unit" },
      ],
    }),
    resources: [],
  });

  assert.deepEqual(output.navGroups?.slice(0, 3).map((group) => group.id), ["literary-exploration", "personal-response", "visual-response"]);
  assert.equal(output.pages[0]?.id, "literary-exploration");
  assert.equal(output.pages[8]?.id, "personal-response");
  assert.equal(output.pages[16]?.id, "visual-response");
  assert.ok(output.pages.findIndex((page) => page.id === "viewing-guide") > output.pages.findIndex((page) => page.id === "visual-response-preview"));
  assert.equal(output.pages.some((page) => page.id === "critical-essay" || page.id.startsWith("critical-essay-")), false);
  assert.equal(output.navGroups?.some((group) => group.id === "critical-essay"), false);
});

test("ELA 30-2 film reuses the approved 30-1 Film Room and Resources donor surfaces", () => {
  const output = renderV3MediumProfile({
    recipe: recipe({
      slug: "ela30-2-film-study",
      courseCode: "ELA 30-2",
      unitTitle: "Film Study",
      derivesFromProject: "ela30-1-feature-film-legacy",
      activityProfile: {
        ...baseProfile("film-study"),
        kind: "film-study",
        filmSelection: { mode: "pending" },
        techniqueQuestionCount: 22,
        fullResponseQuestionCount: 18,
        criticalEssayFieldCount: 19,
        viewingGuide: true,
      },
      writingForms: [
        { kind: "literary-exploration", trackMode: "unit" },
        { kind: "personal-response", trackMode: "unit" },
        { kind: "visual-response", trackMode: "unit" },
      ],
    }),
    resources: [],
  });

  const filmRoom = output.pages.find((page) => page.id === "film-room");
  const materials = output.pages.find((page) => page.id === "materials");
  assert.ok(filmRoom);
  assert.ok(materials);
  assert.equal(materials.label, "Materials");
  assert.equal(output.pages.some((page) => page.id === "resources"), false);
  assert.doesNotMatch(filmRoom.html, /film-concept-index|Film Language Review|Mise-en-scene Review/);
  assert.match(filmRoom.html, /Elements of Film: Visual Storytelling/);
  assert.match(filmRoom.html, /Elements of Film: Editing/);
  assert.match(filmRoom.html, /Elements of Film: Continuity/);
  assert.match(filmRoom.html, /Elements of Film: Sound/);
  assert.equal((filmRoom.html.match(/class="film-room-panel"/g) ?? []).length, 4);
  assert.match(materials.html, /The Cabinet of Dr\. Caligari/);
  assert.match(materials.html, /The Five Formal Elements of Film/);
  assert.match(materials.html, /Continuity Editing/);
  assert.doesNotMatch(materials.html, /data-resource-kind="video"/);
});

test("ELA 10-2 film reuses the approved feature-film video playlist", () => {
  const ela10Recipe = recipe({
    slug: "ela10-2-film-study",
    courseCode: "ELA 10-2",
    unitTitle: "Film Study",
    derivesFromProject: "ela10-1-film-study",
    activityProfile: {
      ...baseProfile("film-study"),
      kind: "film-study",
      filmSelection: { mode: "pending" },
      techniqueQuestionCount: 22,
      fullResponseQuestionCount: 18,
      criticalEssayFieldCount: 0,
      viewingGuide: true,
    },
  });
  const output = renderV3MediumProfile({ recipe: ela10Recipe, resources: [] });
  const room = output.pages.find((page) => page.id === "film-room");

  assert.ok(room);
  assert.match(room.html, /Media Playlist/);
  assert.match(room.html, /youtube\.com\/embed\/BXAr2yiYCV4/);
  assert.match(room.html, /Elements of Film: Sound/);
});

test("V3 medium adapter rejects forbidden writing-form combinations", () => {
  const filmProfile = {
    ...baseProfile("film-study"),
    kind: "film-study" as const,
    filmSelection: { mode: "pending" as const },
    techniqueQuestionCount: 22,
    fullResponseQuestionCount: 18,
    criticalEssayFieldCount: 19,
    viewingGuide: true as const,
  };
  assert.throws(() => renderV3MediumProfile({
    recipe: recipe({
      slug: "ela20-2-film-study",
      courseCode: "ELA 20-2",
      unitTitle: "Film Study",
      activityProfile: filmProfile,
      writingForms: [{ kind: "critical-essay", trackMode: "unit" }],
    }),
    resources: [],
  }), /cannot render Critical Essay/);
  assert.throws(() => renderV3MediumProfile({
    recipe: recipe({
      slug: "ela20-2-film-study",
      courseCode: "ELA 20-2",
      unitTitle: "Film Study",
      activityProfile: filmProfile,
      writingForms: [{ kind: "visual-response", trackMode: "unit" }],
    }),
    resources: [],
  }), /only in ELA 30-2/);
});
