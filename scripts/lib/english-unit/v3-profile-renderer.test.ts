import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

import type { EnglishPreparedResource } from "./factory-resources.js";
import { renderV3ActivityProfile } from "./v3-profile-renderer.js";
import type {
  EnglishActivityProfileV1,
  EnglishReadingRecipe,
  EnglishUnitRecipeV3,
  EnglishWritingFormConfigV1,
} from "./types.js";

const TWO_FORM_SEQUENCE: EnglishWritingFormConfigV1[] = [
  { kind: "literary-exploration", trackMode: "unit" },
  { kind: "personal-response", trackMode: "unit" },
];

function baseProfile(kind: EnglishActivityProfileV1["kind"]) {
  return { kind, schemaVersion: 1 as const, activities: [], evidencePolicies: [] };
}

function recipe(input: {
  slug: string;
  courseCode: "ELA 10-2" | "ELA 20-2" | "ELA 30-2";
  unitTitle: string;
  activityProfile: EnglishActivityProfileV1;
  writingForms?: EnglishWritingFormConfigV1[];
  readings?: EnglishReadingRecipe[];
}) {
  return {
    schemaVersion: 3,
    projectSlug: input.slug,
    courseCode: input.courseCode,
    courseTitle: input.courseCode,
    unitTitle: input.unitTitle,
    profileVersion: "3.0.0-test",
    status: "draft",
    derivesFromProject: "approved-donor",
    source: {
      brightspaceZip: "source.zip",
      teacherResourcesZip: "teacher.zip",
      brightspaceUnitId: "test",
      teacherFolder: "teacher",
      lessonSelectors: [],
    },
    activityProfile: input.activityProfile,
    writingForms: input.writingForms ?? TWO_FORM_SEQUENCE,
    lessonOrder: [],
    topLevelLessonOrder: [],
    lessonGroups: [],
    readings: input.readings ?? [],
    placements: [],
    analysisTerms: [],
    analysisExamples: [],
    resourceDispositions: [],
    excludedFiles: [],
    wordingCorrections: [],
    mediaPolicy: {
      verifiedAt: "2026-07-22",
      allowedYouTubeIds: [],
      blockedYouTubeIds: [],
      approvedExternalUrls: [],
      externalUrlRewrites: {},
    },
    customComponents: [],
    acceptance: { requiredRoutes: [], requiredActivityIds: [], reviewItems: [] },
  } as EnglishUnitRecipeV3;
}

function assertNoCriticalEssay(output: ReturnType<typeof renderV3ActivityProfile>) {
  assert.doesNotMatch(JSON.stringify(output), /critical(?:[-_\s]?essay)/i);
  assert.doesNotThrow(() => new vm.Script(output.runtime ?? "", { filename: `${output.kind}-v3-runtime.js` }));
}

function writingRuntimeInstallations(output: ReturnType<typeof renderV3ActivityProfile>) {
  return output.runtime?.match(/function installEnglishWritingSequenceRuntime\b/g)?.length ?? 0;
}

test("short-fiction V3 maps the selected work, scoped questions, analysis, and learner Materials deterministically", () => {
  const reading: EnglishReadingRecipe = {
    id: "lamp-at-noon",
    title: "The Lamp at Noon",
    author: "Sinclair Ross",
    kind: "short-fiction",
    group: "Short Fiction",
    readingFile: "The Lamp at Noon.pdf",
    questionFile: "The Lamp at Noon.pdf",
    questionPages: [9],
  };
  const shortRecipe = recipe({
    slug: "ela20-2-short-stories",
    courseCode: "ELA 20-2",
    unitTitle: "Short Stories",
    activityProfile: {
      ...baseProfile("short-fiction"),
      kind: "short-fiction",
      readerMode: "text-bank",
      questionCollectionScope: "story",
      analysisExplorer: true,
    },
    writingForms: [
      { kind: "literary-exploration", trackMode: "per-work" },
      { kind: "personal-response", trackMode: "per-work" },
    ],
    readings: [reading],
  });
  shortRecipe.analysisTerms = [{ id: "setting", category: "Elements of Fiction", label: "Setting", definition: "The time and place of a work." }];
  shortRecipe.analysisExamples = [{
    readingId: "lamp-at-noon",
    termId: "setting",
    term: "Setting",
    evidenceMoment: "The wind keeps returning.",
    analysis: "The hostile setting intensifies the conflict.",
  }];

  const resources: EnglishPreparedResource[] = [
    {
      id: "lamp-reading",
      title: "The Lamp at Noon",
      role: "reading",
      source: "Teacher Files/Short Stories/The Lamp at Noon.pdf",
      href: "assets/generated/resources/lamp-at-noon.pdf",
      text: "Story text that must not become the question prompt.",
      pages: [
        { page: 1, text: "Story text." },
        { page: 9, text: "1. How does the setting shape the conflict?\n2. What does the recurring wind suggest?" },
      ],
      reviewRequired: false,
    },
    {
      id: "teacher-handout",
      title: "Short Story Terms",
      role: "supporting-resource",
      source: "Teacher Files/Short Story Terms.pdf",
      href: "assets/generated/resources/short-story-terms.pdf",
      reviewRequired: false,
    },
    {
      id: "review-only",
      title: "Unreviewed Answer Key",
      role: "supporting-resource",
      source: "Teacher Files/Unreviewed Answer Key.pdf",
      href: "assets/generated/resources/unreviewed-answer-key.pdf",
      reviewRequired: true,
    },
  ];

  const output = renderV3ActivityProfile({ recipe: shortRecipe, resources });
  const questionPage = output.pages.find((page) => page.id === "story-questions");
  const storyBankPage = output.pages.find((page) => page.id === "story-bank");

  assert.equal(output.kind, "short-fiction");
  assert.deepEqual(output.navGroups?.slice(0, 2).map((group) => group.id), ["literary-exploration", "personal-response"]);
  assert.equal(output.pages[0]?.id, "literary-exploration");
  assert.equal(output.pages[8]?.id, "personal-response");
  assert.ok(storyBankPage);
  assert.equal(storyBankPage?.label, "Text Bank");
  assert.match(storyBankPage?.html ?? "", /The Lamp at Noon/);
  assert.equal(output.pages.some((page) => page.id === "materials"), false, "the factory owns the separate Materials route");
  assert.equal(output.resourceLinks?.some((resource) => resource.title === "Short Story Terms"), true);
  assert.equal(output.resourceLinks?.some((resource) => resource.title === "Unreviewed Answer Key"), false);
  assert.match(questionPage?.html ?? "", /How does the setting shape the conflict/);
  assert.match(questionPage?.html ?? "", /What does the recurring wind suggest/);
  assert.doesNotMatch(questionPage?.html ?? "", /Story text that must not become/);
  assert.match(output.pages.map((page) => page.html).join("\n"), /The hostile setting intensifies the conflict/);
  assertNoCriticalEssay(output);
});

test("short-fiction V3 does not label a reading-only PDF as an original question sheet", () => {
  const reading: EnglishReadingRecipe = {
    id: "source-only-reading",
    title: "Source-only Reading",
    author: "Test Author",
    kind: "short-fiction",
    group: "Assigned texts",
    readingFile: "Source-only Reading.pdf",
    questionFile: "Source-only Reading.pdf",
    questionPrompts: [{ id: "question-1", prompt: "How does the central image develop the text’s idea?" }],
  };
  const output = renderV3ActivityProfile({
    recipe: recipe({
      slug: "ela30-2-short-stories-visual-literacy",
      courseCode: "ELA 30-2",
      unitTitle: "Short Stories and Visual Literacy",
      activityProfile: {
        ...baseProfile("short-fiction"),
        kind: "short-fiction",
        readerMode: "text-bank",
        questionCollectionScope: "story",
        analysisExplorer: true,
      },
      writingForms: [
        { kind: "literary-exploration", trackMode: "per-work" },
        { kind: "personal-response", trackMode: "per-work" },
        { kind: "visual-response", trackMode: "unit" },
      ],
      readings: [reading],
    }),
    resources: [{
      id: "source-only-reading",
      title: "Source-only Reading",
      role: "reading",
      source: "Teacher Files/Source-only Reading.pdf",
      href: "assets/generated/resources/source-only-reading.pdf",
      text: "The assigned reading.",
      reviewRequired: false,
    }],
  });

  const questionPage = output.pages.find((page) => page.id === "story-questions");
  assert.match(questionPage?.html ?? "", /How does the central image develop/);
  assert.doesNotMatch(questionPage?.html ?? "", /Open original question sheet/);
});

test("writing-foundations V3 groups its four practice routes in the sidebar", () => {
  const output = renderV3ActivityProfile({
    recipe: recipe({
      slug: "ela10-2-writing-foundations",
      courseCode: "ELA 10-2",
      unitTitle: "Writing Foundations",
      activityProfile: { ...baseProfile("writing-foundations"), kind: "writing-foundations" },
      writingForms: [],
    }),
    resources: [],
  });

  assert.equal(output.kind, "writing-foundations");
  assert.deepEqual(output.pages.map((page) => page.id), ["sentence-lab", "paragraph-builder", "organization-lab", "final-paragraph"]);
  assert.deepEqual(output.navGroups, [{
    id: "sentence-lab",
    label: "Writing Activities",
    icon: "edit_square",
    landingItemLabel: "Sentence Practice",
    itemPageIds: ["paragraph-builder", "organization-lab", "final-paragraph"]
  }]);
  assert.ok(output.pages.every((page) => page.navigation === "lesson-linked"));
  assert.equal(
    output.resourceLinks?.some((resource) => resource.href === "https://owl.purdue.edu/owl/general_writing/academic_writing/paragraphs_and_paragraphing/index.html"),
    true
  );
  assertNoCriticalEssay(output);
});

test("modern drama, novel study, and film study keep their native activity systems after the configured writing routes", () => {
  const cases: Array<{
    profile: EnglishActivityProfileV1;
    courseCode: "ELA 20-2" | "ELA 30-2";
    slug: string;
    unitTitle: string;
    writingForms: EnglishWritingFormConfigV1[];
    nativePage: string;
  }> = [
    {
      profile: {
        ...baseProfile("modern-drama"),
        kind: "modern-drama",
        activities: [{ id: "materials", title: "Materials", route: "materials", enabled: true, evidencePolicyIds: [] }],
        actIds: ["act-1"],
        characterIds: ["protagonist"],
        criticalEssay: false,
      },
      courseCode: "ELA 20-2",
      slug: "ela20-2-modern-play-crucible",
      unitTitle: "Modern Play - The Crucible",
      writingForms: TWO_FORM_SEQUENCE,
      nativePage: "materials",
    },
    {
      profile: {
        ...baseProfile("novel-study"),
        kind: "novel-study",
        activities: [{ id: "reading-guide", title: "Reading Guide", route: "reading-guide", enabled: true, evidencePolicyIds: [] }],
        novels: [{ id: "lord-of-the-flies", title: "Lord of the Flies", author: "William Golding" }],
        questionPhases: ["opening", "middle", "final"],
        genericQuestionCount: 24,
        writingTools: ["analytical-paragraph", "motif-string", "authors-intent"],
      },
      courseCode: "ELA 20-2",
      slug: "ela20-2-novel-study",
      unitTitle: "Novel Study",
      writingForms: TWO_FORM_SEQUENCE,
      nativePage: "reading-guide",
    },
    {
      profile: {
        ...baseProfile("film-study"),
        kind: "film-study",
        activities: [{ id: "viewing-guide", title: "Viewing Guide", route: "viewing-guide", enabled: true, evidencePolicyIds: [] }],
        filmSelection: { mode: "pending" },
        techniqueQuestionCount: 22,
        fullResponseQuestionCount: 18,
        criticalEssayFieldCount: 19,
        viewingGuide: true,
      },
      courseCode: "ELA 30-2",
      slug: "ela30-2-film-study",
      unitTitle: "Film Study",
      writingForms: [
        { kind: "literary-exploration", trackMode: "unit" },
        { kind: "personal-response", trackMode: "unit" },
        { kind: "visual-response", trackMode: "unit" },
      ],
      nativePage: "viewing-guide",
    },
  ];

  for (const fixture of cases) {
    const output = renderV3ActivityProfile({
      recipe: recipe({
        slug: fixture.slug,
        courseCode: fixture.courseCode,
        unitTitle: fixture.unitTitle,
        activityProfile: fixture.profile,
        writingForms: fixture.writingForms,
      }),
      resources: [],
    });
    const expectedForms = fixture.writingForms.map((form) => form.kind);
    assert.deepEqual(output.navGroups?.slice(0, expectedForms.length).map((group) => group.id), expectedForms);
    assert.ok(output.pages.findIndex((page) => page.id === fixture.nativePage) > output.pages.findIndex((page) => page.id === `${expectedForms.at(-1)}-preview`));
    if (fixture.courseCode === "ELA 30-2") {
      assert.match(output.pages.map((page) => page.html).join("\n"), /Current Visual/);
    }
    assert.equal(
      writingRuntimeInstallations(output),
      1,
      `${fixture.slug} must install the shared writing runtime exactly once`,
    );
    assertNoCriticalEssay(output);
  }
});

test("V3 profile composition rejects Critical Essay, duplicates, wrong ordering, and Visual Response outside ELA 30-2", () => {
  const profile = { ...baseProfile("writing-foundations"), kind: "writing-foundations" as const };
  const render = (courseCode: "ELA 10-2" | "ELA 20-2" | "ELA 30-2", writingForms: EnglishWritingFormConfigV1[]) => renderV3ActivityProfile({
    recipe: recipe({ slug: "invalid", courseCode, unitTitle: "Invalid", activityProfile: profile, writingForms }),
    resources: [],
  });

  assert.doesNotThrow(() => render("ELA 10-2", []));
  assert.throws(() => render("ELA 10-2", [{ kind: "critical-essay", trackMode: "unit" }]), /cannot render Critical Essay/);
  assert.throws(() => render("ELA 20-2", [
    { kind: "literary-exploration", trackMode: "unit" },
    { kind: "literary-exploration", trackMode: "unit" },
  ]), /duplicate writing forms/);
  assert.throws(() => render("ELA 20-2", [...TWO_FORM_SEQUENCE].reverse()), /must be ordered/);
  assert.throws(() => render("ELA 20-2", [
    { kind: "literary-exploration", trackMode: "unit" },
    { kind: "personal-response", trackMode: "unit" },
    { kind: "visual-response", trackMode: "unit" },
  ]), /must be ordered/);
});
