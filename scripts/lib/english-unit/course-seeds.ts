import type {
  EnglishActivityDefinition,
  EnglishActivityEvidencePolicy,
  EnglishActivityProfileV1,
  EnglishComponentOverride,
  EnglishCourseArchiveV1,
  EnglishCourseManifestV1,
  EnglishCourseUnitV1,
  EnglishLessonSelectorV2,
  EnglishResourceDispositionV2,
  EnglishUnitRecipeV2
} from "./types.js";
import { ensureStandardEnglishWritingProfile } from "./writing-sequence-renderer.js";

export const ELA20_COURSE_ID = "ela20-1";
export const ELA20_PROFILE_ID = "next-step-english";
export const ELA20_PROFILE_VERSION = "next-step-english-v1";

export type EnglishUnitSeed = {
  manifest: EnglishCourseUnitV1;
  primaryBrightspaceUnitId: string;
  teacherFolder: string;
  selectors: EnglishLessonSelectorV2[];
  createRecipe: boolean;
};

const shortStoriesSeed: EnglishUnitSeed = {
  manifest: {
    projectSlug: "ela20-1-short-stories-pilot",
    unitTitle: "Short Stories",
    recipePath: "projects/ela20-1-short-stories-pilot/meta/english-unit.json",
    profileVersion: ELA20_PROFILE_VERSION,
    activityProfile: "short-fiction",
    brightspaceUnitIds: ["53033"],
    reviewStatus: "needs-review"
  },
  primaryBrightspaceUnitId: "53033",
  teacherFolder: "UNIT 1 Short Story",
  selectors: [
    {
      itemId: "53033",
      title: "Short Stories",
      disposition: "include",
      includeChildren: true,
      reason: "Existing Short Stories pilot source branch."
    }
  ],
  createRecipe: false
};

const crucibleSeed: EnglishUnitSeed = {
  manifest: {
    projectSlug: "ela20-1-modern-play-crucible",
    unitTitle: "Modern Play - The Crucible",
    recipePath: "projects/ela20-1-modern-play-crucible/meta/english-unit.json",
    profileVersion: ELA20_PROFILE_VERSION,
    activityProfile: "modern-drama",
    brightspaceUnitIds: ["53034"],
    reviewStatus: "needs-review"
  },
  primaryBrightspaceUnitId: "53034",
  teacherFolder: "UNIT 2 Modern Play",
  selectors: [
    { itemId: "53068", title: "Modern Drama Introduction", disposition: "include" },
    { itemId: "53069", title: "Characteristics of Modern Drama", disposition: "include" },
    { itemId: "53074", title: "Critical and Analytical Response", disposition: "include" },
    { itemId: "53075", title: "Student Samples", disposition: "include" },
    {
      itemId: "53070",
      title: "A Streetcar Named Desire Introduction",
      disposition: "exclude",
      reason: "Alternate play content; The Crucible is teacher-selected."
    },
    {
      itemId: "53071",
      title: "A Streetcar Named Desire Overview",
      disposition: "exclude",
      reason: "Alternate play content; The Crucible is teacher-selected."
    },
    {
      itemId: "53072",
      title: "Death of a Salesman Introduction",
      disposition: "exclude",
      reason: "Alternate play content; The Crucible is teacher-selected."
    },
    {
      itemId: "53073",
      title: "A Doll's House Introduction",
      disposition: "exclude",
      reason: "Alternate play content; The Crucible is teacher-selected."
    }
  ],
  createRecipe: true
};

const macbethSeed: EnglishUnitSeed = {
  manifest: {
    projectSlug: "ela20-1-shakespeare-macbeth",
    unitTitle: "Shakespearean Drama - Macbeth",
    recipePath: "projects/ela20-1-shakespeare-macbeth/meta/english-unit.json",
    profileVersion: ELA20_PROFILE_VERSION,
    activityProfile: "shakespeare-drama",
    brightspaceUnitIds: ["3448"],
    reviewStatus: "needs-review"
  },
  primaryBrightspaceUnitId: "3448",
  teacherFolder: "UNIT 3 Shakespeare",
  selectors: [
    { itemId: "3450", title: "Shakespearean Terminology", disposition: "include" },
    { itemId: "3451", title: "Characteristics of Shakespearean Drama", disposition: "include" },
    { itemId: "3452", title: "Tips for Reading Drama 1", disposition: "include" },
    { itemId: "3453", title: "Tips for Reading Drama 2", disposition: "include" },
    { itemId: "3455", title: "Shakespeare's World", disposition: "include" },
    { itemId: "3456", title: "Reading Shakespeare", disposition: "include" },
    { itemId: "3457", title: "Introduction to Macbeth", disposition: "include" },
    { itemId: "3458", title: "Macbeth Online", disposition: "include" },
    { itemId: "3459", title: "Critical Response", disposition: "include" },
    { itemId: "3460", title: "Critical Response Suggestions", disposition: "include" },
    {
      itemId: "3454",
      title: "Moonlodge",
      disposition: "exclude",
      reason: "Unrelated play content."
    },
    {
      itemId: "53037",
      title: "Shakespearean Drama - Hamlet",
      disposition: "exclude",
      includeChildren: true,
      reason: "Alternate Shakespeare play branch."
    },
    {
      itemId: "53038",
      title: "King Lear",
      disposition: "exclude",
      includeChildren: true,
      reason: "Alternate Shakespeare play branch."
    },
    {
      itemId: "53039",
      title: "Othello",
      disposition: "exclude",
      includeChildren: true,
      reason: "Alternate Shakespeare play branch."
    }
  ],
  createRecipe: true
};

const novelSeed: EnglishUnitSeed = {
  manifest: {
    projectSlug: "ela20-1-novel-study-clean",
    unitTitle: "Novel Study",
    recipePath: "projects/ela20-1-novel-study-clean/meta/english-unit.json",
    profileVersion: ELA20_PROFILE_VERSION,
    activityProfile: "novel-study",
    brightspaceUnitIds: ["53041", "3465"],
    reviewStatus: "needs-review"
  },
  primaryBrightspaceUnitId: "53041",
  teacherFolder: "UNIT 4 Novel",
  selectors: [
    { itemId: "53127", title: "Novel Study Introduction", disposition: "include" },
    { itemId: "3467", title: "Characteristics of the Novel", disposition: "include" },
    { itemId: "3468", title: "How to Read a Novel", disposition: "include" }
  ],
  createRecipe: true
};

const filmSeed: EnglishUnitSeed = {
  manifest: {
    projectSlug: "ela20-1-feature-film",
    unitTitle: "Film Study",
    recipePath: "projects/ela20-1-feature-film/meta/english-unit.json",
    profileVersion: ELA20_PROFILE_VERSION,
    activityProfile: "film-study",
    brightspaceUnitIds: ["53042"],
    reviewStatus: "needs-review"
  },
  primaryBrightspaceUnitId: "53042",
  teacherFolder: "UNIT 5 Film Study",
  selectors: Array.from({ length: 9 }, (_, index) => ({
    itemId: String(53128 + index),
    title: `Film Study Lesson ${index + 1}`,
    disposition: "include" as const
  })),
  createRecipe: true
};

export const ELA20_UNIT_SEEDS: readonly EnglishUnitSeed[] = [
  shortStoriesSeed,
  crucibleSeed,
  macbethSeed,
  novelSeed,
  filmSeed
];

function activity(
  id: string,
  title: string,
  route: string,
  evidencePolicyIds: string[] = [],
  componentSlot?: EnglishActivityDefinition["componentSlot"]
): EnglishActivityDefinition {
  return { id, title, route, enabled: true, evidencePolicyIds, componentSlot };
}

function collectionPolicy(
  id: string,
  activityId: string,
  scope: "activity" | "work" | "locator" = "activity"
): EnglishActivityEvidencePolicy {
  return {
    id,
    activityId,
    saveMode: "collection",
    requiresExplicitSave: true,
    collectionScope: scope,
    contributionIdTemplate: `{projectSlug}:${activityId}:${scope === "activity" ? "collection" : `{${scope}Id}`}`
  };
}

function individualPolicy(id: string, activityId: string): EnglishActivityEvidencePolicy {
  return {
    id,
    activityId,
    saveMode: "individual",
    requiresExplicitSave: true,
    contributionIdTemplate: `{projectSlug}:${activityId}:{entryId}`
  };
}

function modernDramaProfile(): EnglishActivityProfileV1 {
  return {
    schemaVersion: 1,
    kind: "modern-drama",
    actIds: ["act-1", "act-2", "act-3", "act-4"],
    characterIds: ["john-proctor", "elizabeth-proctor", "abigail-williams", "reverend-hale", "danforth"],
    criticalEssay: true,
    activities: [
      activity("play-materials", "Play Materials", "play-materials"),
      activity("act-questions", "Act Questions", "act-questions", ["act-question-collection"]),
      activity("character-conflict", "Character and Conflict Notes", "character-notes", ["character-dossier-collection"], "act-tracker"),
      activity("critical-essay", "Critical Essay", "critical-essay", ["critical-essay-plan", "critical-essay-stage"]),
      activity("evidence-bank", "Evidence Bank", "evidence-bank")
    ],
    evidencePolicies: [
      collectionPolicy("act-question-collection", "act-questions", "locator"),
      collectionPolicy("character-dossier-collection", "character-conflict", "work"),
      collectionPolicy("critical-essay-plan", "critical-essay"),
      individualPolicy("critical-essay-stage", "critical-essay")
    ]
  };
}

function shakespeareProfile(): EnglishActivityProfileV1 {
  return {
    schemaVersion: 1,
    kind: "shakespeare-drama",
    actIds: ["act-1", "act-2", "act-3", "act-4", "act-5"],
    sceneCount: 28,
    sideBySideReader: true,
    characterIds: ["macbeth", "lady-macbeth", "banquo", "macduff", "duncan", "witches"],
    writingTools: ["language-lab", "close-reading", "theme-builder", "character-change-paragraph", "critical-essay", "graphic-essay"],
    editorialStatus: "needs-editorial",
    activities: [
      activity("side-by-side-reader", "Side-by-Side Reader", "side-by-side", ["scene-evidence-entry"]),
      activity("macbeth-materials", "Macbeth Materials", "play-materials"),
      activity("act-questions", "Macbeth Act Questions", "act-questions", ["act-question-collection", "scene-checkpoint-entry"]),
      activity("character-notes", "Character Notes", "character-notes", ["character-dossier-collection", "character-quotation-entry"]),
      activity("writing-studio", "Shakespeare Writing Studio", "writing-studio", [
        "annotation-entry",
        "theme-response-entry",
        "writing-plan-collection"
      ], "writing-studio"),
      activity("evidence-bank", "Evidence Bank", "evidence-bank")
    ],
    evidencePolicies: [
      individualPolicy("scene-evidence-entry", "side-by-side-reader"),
      collectionPolicy("act-question-collection", "act-questions", "locator"),
      individualPolicy("scene-checkpoint-entry", "act-questions"),
      collectionPolicy("character-dossier-collection", "character-notes", "work"),
      individualPolicy("character-quotation-entry", "character-notes"),
      individualPolicy("annotation-entry", "writing-studio"),
      individualPolicy("theme-response-entry", "writing-studio"),
      collectionPolicy("writing-plan-collection", "writing-studio")
    ]
  };
}

function novelProfile(): EnglishActivityProfileV1 {
  return {
    schemaVersion: 1,
    kind: "novel-study",
    novels: [
      { id: "lord-of-the-flies", title: "Lord of the Flies", author: "William Golding" },
      { id: "the-book-thief", title: "The Book Thief", author: "Markus Zusak" }
    ],
    questionPhases: ["opening", "middle", "final"],
    genericQuestionCount: 24,
    writingTools: ["analytical-paragraph", "motif-string", "authors-intent", "critical-essay"],
    activities: [
      activity("critical-essay", "Critical Essay", "critical-essay", ["critical-essay-plan", "critical-essay-stage"]),
      activity("reading-guide", "Reading Guide", "reading-guide", ["passage-entry"], "reading-notebook"),
      activity("major-works-data", "Major Works Data Sheet", "major-works-data", ["major-works-collection"]),
      activity("novel-questions", "Novel Study Questions", "novel-study-questions", ["novel-question-collection"]),
      activity("writing-studio", "Writing Studio", "writing-studio", ["paragraph-entry", "motif-entry", "authors-intent-entry"]),
      activity("evidence-bank", "Evidence Bank", "evidence-bank")
    ],
    evidencePolicies: [
      {
        id: "critical-essay-plan",
        activityId: "critical-essay",
        saveMode: "collection",
        requiresExplicitSave: true,
        collectionScope: "work",
        contributionIdTemplate: "{projectSlug}:critical-essay:{workId}:full-plan"
      },
      {
        id: "critical-essay-stage",
        activityId: "critical-essay",
        saveMode: "collection",
        requiresExplicitSave: true,
        collectionScope: "locator",
        contributionIdTemplate: "{projectSlug}:critical-essay:{workId}:{locatorId}:collection"
      },
      individualPolicy("passage-entry", "reading-guide"),
      collectionPolicy("major-works-collection", "major-works-data", "work"),
      collectionPolicy("novel-question-collection", "novel-questions", "locator"),
      individualPolicy("paragraph-entry", "writing-studio"),
      individualPolicy("motif-entry", "writing-studio"),
      individualPolicy("authors-intent-entry", "writing-studio")
    ]
  };
}

function filmProfile(): EnglishActivityProfileV1 {
  return {
    schemaVersion: 1,
    kind: "film-study",
    filmSelection: { mode: "pending" },
    techniqueQuestionCount: 22,
    fullResponseQuestionCount: 18,
    criticalEssayFieldCount: 19,
    viewingGuide: true,
    activities: [
      activity("critical-essay", "Critical Essay", "critical-essay", ["critical-essay-plan", "critical-essay-stage"]),
      activity("viewing-guide", "Viewing Guide", "viewing-guide", ["viewing-moment-entry", "viewing-synthesis"]),
      activity("film-questions", "Film Study Questions", "film-study-questions", ["film-question-collection"]),
      activity("film-room", "Film Room", "film-room"),
      activity("evidence-bank", "Evidence Bank", "evidence-bank"),
      activity("resources", "Resources", "resources")
    ],
    evidencePolicies: [
      collectionPolicy("critical-essay-plan", "critical-essay"),
      individualPolicy("critical-essay-stage", "critical-essay"),
      individualPolicy("viewing-moment-entry", "viewing-guide"),
      collectionPolicy("viewing-synthesis", "viewing-guide", "work"),
      collectionPolicy("film-question-collection", "film-questions", "locator")
    ]
  };
}

function resource(
  id: string,
  source: string,
  role: EnglishResourceDispositionV2["role"],
  disposition: EnglishResourceDispositionV2["disposition"],
  reason: string,
  destination?: string
): EnglishResourceDispositionV2 {
  return { id, source, role, disposition, reason, destination };
}

const crucibleResources: EnglishResourceDispositionV2[] = [
  ...[1, 2, 3, 4].map((act) =>
    resource(
      `crucible-act-${act}`,
      `UNIT 2 Modern Play/#00${act} Crucible Act ${act}.pdf`,
      "question-set",
      "place",
      `Teacher-selected Crucible Act ${act} question sheet.`,
      "play-materials"
    )
  ),
  resource(
    "crucible-conflict",
    "UNIT 2 Modern Play/Crucible Conflict.jpg",
    "supporting-resource",
    "place",
    "Teacher-supplied conflict teaching image.",
    "character-conflict"
  ),
  resource(
    "crucible-litchart",
    "UNIT 2 Modern Play/thecrucible-LitChart.pdf",
    "supporting-resource",
    "review-required",
    "Retain outside learner output until redistribution and accessibility review is recorded.",
    "play-materials"
  ),
  resource(
    "crucible-hard-gate",
    "UNIT 2 Modern Play/MODERN PLAY UNIT HARD GATE- CRUCIBLE Critical Response to Text.doc",
    "excluded-assessment",
    "exclude",
    "Hard-gate assessment is intentionally excluded."
  ),
  resource(
    "ivanov-soft-gate-questions",
    "UNIT 2 Modern Play/MODERN PLAY UNIT SOFT GATE ASSESSMENT Ivanov RC Questions.docx",
    "excluded-assessment",
    "exclude",
    "Soft-gate assessment is intentionally excluded."
  ),
  resource(
    "ivanov-soft-gate-reading",
    "UNIT 2 Modern Play/MODERN PLAY UNIT SOFT GATE ASSESSMENT Ivanov RC Reading.docx",
    "excluded-assessment",
    "exclude",
    "Soft-gate assessment is intentionally excluded."
  )
];

const macbethResources: EnglishResourceDispositionV2[] = [
  resource("macbeth-recurring-images", "UNIT 3 Shakespeare/MACBETH Recurring Images.pdf", "supporting-resource", "place", "Teacher-selected motif resource.", "writing-studio"),
  resource("macbeth-dramatic-purpose", "UNIT 3 Shakespeare/MACBETH-Dramatic Purpose.pdf", "question-set", "place", "Teacher-selected dramatic-purpose activity.", "writing-studio"),
  resource("macbeth-act-questions", "UNIT 3 Shakespeare/MACBETH Act Questions.pdf", "question-set", "place", "Teacher-selected act and scene questions.", "act-questions"),
  resource("macbeth-unit-review", "UNIT 3 Shakespeare/MACBETH Unit End Review.pdf", "question-set", "place", "Teacher-selected unit review.", "macbeth-materials"),
  ...[1, 2, 3, 4, 5].map((act) =>
    resource(
      `macbeth-graphic-novel-${act}`,
      `UNIT 3 Shakespeare/MACBETH Graphic Novel Act ${act}.pdf`,
      "reading",
      "review-required",
      "Retain outside learner output until redistribution and accessibility review is recorded.",
      "macbeth-materials"
    )
  ),
  resource("macbeth-graphic-essay", "UNIT 3 Shakespeare/MACBETH Graphic Essay.docx", "supporting-resource", "place", "Teacher-supplied Graphic Essay planner and rubric.", "writing-studio")
];

const novelResources: EnglishResourceDispositionV2[] = [
  resource("novel-unit-prompts", "UNIT 4 Novel/NOVEL UNIT 20-1.docx", "supporting-resource", "place", "Teacher-selected prompts for both configured novel tracks.", "novel-questions"),
  resource("major-works-data", "UNIT 4 Novel/Major Works Data Sheet.docx", "supporting-resource", "place", "Teacher-selected reading guide and analysis organizer.", "major-works-data"),
  resource("novel-soft-gate-reading", "UNIT 4 Novel/NOVEL UNIT SOFT GATE ASSESSMENT Falling in Love RC Reading.docx", "excluded-assessment", "exclude", "Soft-gate assessment is intentionally excluded."),
  resource("novel-soft-gate-questions", "UNIT 4 Novel/NOVEL UNIT SOFT GATE ASSESSMENT Falling in Love RC Questions.docx", "excluded-assessment", "exclude", "Soft-gate assessment is intentionally excluded.")
];

const filmResources: EnglishResourceDispositionV2[] = [
  resource("film-hard-gate", "UNIT 5 Film Study/FILM UNIT 20-1 HARD GATE Personal Response to Text Essay Prompt.docx", "excluded-assessment", "exclude", "Hard-gate assessment is intentionally excluded."),
  resource("film-selection", "profile://student-selected-film", "supporting-resource", "place", "Learners record the approved film they select in the title-neutral viewing guide.", "viewing-guide")
];

const commonCorrections = [
  { find: "English 30-1", replace: "English 20-1", reason: "Correct inherited grade contamination." },
  { find: "ELA 30-1", replace: "ELA 20-1", reason: "Correct inherited grade contamination." },
  { find: "Diploma Exam", replace: "course assessment", reason: "Remove Diploma Exam framing from ELA 20-1." },
  { find: "Part A", replace: "written response", reason: "Remove Diploma Exam section framing." }
];

function component(
  id: string,
  slot: EnglishComponentOverride["slot"],
  sourceFolder: string
): EnglishComponentOverride {
  return {
    id,
    slot,
    mode: "extend",
    source: `workspace/components/${sourceFolder}/component.html`,
    assetRoot: `workspace/assets/custom/${sourceFolder}`,
    enabled: false
  };
}

function buildRecipe(input: {
  seed: EnglishUnitSeed;
  brightspaceArchivePath: string;
  teacherArchivePath: string;
  activityProfile: EnglishActivityProfileV1;
  resources: EnglishResourceDispositionV2[];
  customComponents: EnglishComponentOverride[];
  reviewItems: string[];
}): EnglishUnitRecipeV2 {
  input = { ...input, activityProfile: ensureStandardEnglishWritingProfile(input.activityProfile) };
  const includedLessons = input.seed.selectors
    .filter((selector) => selector.disposition === "include")
    .map((selector) => selector.itemId);
  const excludedFiles = input.resources
    .filter((item) => item.disposition === "exclude")
    .map((item) => ({ file: item.source, reason: item.reason }));

  return {
    schemaVersion: 2,
    projectSlug: input.seed.manifest.projectSlug,
    courseCode: "ELA 20-1",
    courseTitle: "English Language Arts 20-1",
    unitTitle: input.seed.manifest.unitTitle,
    profileVersion: ELA20_PROFILE_VERSION,
    status: "needs-review",
    source: {
      brightspaceZip: input.brightspaceArchivePath,
      teacherResourcesZip: input.teacherArchivePath,
      brightspaceUnitId: input.seed.primaryBrightspaceUnitId,
      teacherFolder: input.seed.teacherFolder,
      archiveRefs: { brightspace: "brightspace", teacherResources: "teacher-resources" },
      lessonSelectors: input.seed.selectors.map((selector) => ({ ...selector }))
    },
    activityProfile: input.activityProfile,
    lessonOrder: includedLessons,
    topLevelLessonOrder: includedLessons,
    lessonGroups: [{ id: "unit-lessons", title: input.seed.manifest.unitTitle, lessonIds: includedLessons }],
    readings: [],
    placements: [],
    analysisTerms: [],
    analysisExamples: [],
    resourceDispositions: input.resources.map((item) => ({ ...item })),
    excludedFiles,
    wordingCorrections: commonCorrections.map((correction) => ({ ...correction })),
    mediaPolicy: {
      verifiedAt: input.activityProfile.kind === "film-study" ? "2026-07-14" : "not-applicable",
      allowedYouTubeIds: input.activityProfile.kind === "film-study"
        ? ["BXAr2yiYCV4", "3Sr-vxVaY_M", "G45X6fSk1do", "sgiZb8jJgF8"]
        : [],
      blockedYouTubeIds: [],
      approvedExternalUrls: [],
      externalUrlRewrites: {}
    },
    customComponents: input.customComponents,
    acceptance: {
      requiredRoutes: input.activityProfile.activities.filter((item) => item.enabled).map((item) => item.route),
      requiredActivityIds: input.activityProfile.activities.filter((item) => item.enabled).map((item) => item.id),
      reviewItems: input.reviewItems
    }
  };
}

export function createEla20RecipeSeeds(input: {
  brightspaceArchivePath: string;
  teacherArchivePath: string;
}): EnglishUnitRecipeV2[] {
  return [
    buildRecipe({
      seed: crucibleSeed,
      brightspaceArchivePath: input.brightspaceArchivePath,
      teacherArchivePath: input.teacherArchivePath,
      activityProfile: modernDramaProfile(),
      resources: crucibleResources,
      customComponents: [component("crucible-character-conflict", "act-tracker", "crucible-character-conflict")],
      reviewItems: [
        "Confirm access to the complete play before final export.",
        "Resolve redistribution and accessibility for the supplied LitChart."
      ]
    }),
    buildRecipe({
      seed: macbethSeed,
      brightspaceArchivePath: input.brightspaceArchivePath,
      teacherArchivePath: input.teacherArchivePath,
      activityProfile: shakespeareProfile(),
      resources: macbethResources,
      customComponents: [{
        id: "macbeth-side-by-side-data",
        slot: "custom:side-by-side-companion",
        mode: "extend",
        source: "workspace/components/shakespeare-side-by-side/scenes.json",
        enabled: true
      }],
      reviewItems: [
        "Editorially review all 28 locally stored plain-language companion scenes.",
        "Resolve redistribution and accessibility for the supplied graphic-novel scans."
      ]
    }),
    buildRecipe({
      seed: novelSeed,
      brightspaceArchivePath: input.brightspaceArchivePath,
      teacherArchivePath: input.teacherArchivePath,
      activityProfile: novelProfile(),
      resources: novelResources,
      customComponents: [component("novel-track-extension", "reading-notebook", "novel-track-extension")],
      reviewItems: [
        "Confirm learner access to Lord of the Flies and The Book Thief; primary texts are not supplied.",
        "Review the 24 profile-supplied generic questions before final export."
      ]
    }),
    buildRecipe({
      seed: filmSeed,
      brightspaceArchivePath: input.brightspaceArchivePath,
      teacherArchivePath: input.teacherArchivePath,
      activityProfile: filmProfile(),
      resources: filmResources,
      customComponents: [component("film-selection-extension", "film-scene-log", "film-selection-extension")],
      reviewItems: ["Validate every inherited lesson video and fallback link."]
    })
  ];
}

export function createEla20CourseManifest(input: {
  archives: EnglishCourseArchiveV1[];
  generatedAt: string;
  existingReviewStatuses?: ReadonlyMap<string, EnglishCourseUnitV1["reviewStatus"]>;
}): EnglishCourseManifestV1 {
  return {
    schemaVersion: 1,
    courseId: ELA20_COURSE_ID,
    courseCode: "ELA 20-1",
    courseTitle: "English Language Arts 20-1",
    profileId: ELA20_PROFILE_ID,
    profileVersion: ELA20_PROFILE_VERSION,
    archives: input.archives.map((archive) => ({ ...archive })),
    units: ELA20_UNIT_SEEDS.map((seed) => ({
      ...seed.manifest,
      brightspaceUnitIds: [...seed.manifest.brightspaceUnitIds],
      reviewStatus: input.existingReviewStatuses?.get(seed.manifest.projectSlug) ?? seed.manifest.reviewStatus
    })),
    generatedAt: input.generatedAt
  };
}

export function getEla20TeacherResourceMap(): ReadonlyMap<
  string,
  { projectSlug: string; resource: EnglishResourceDispositionV2 }
> {
  const rows: Array<[string, { projectSlug: string; resource: EnglishResourceDispositionV2 }]> = [];
  for (const [projectSlug, resources] of [
    [crucibleSeed.manifest.projectSlug, crucibleResources],
    [macbethSeed.manifest.projectSlug, macbethResources],
    [novelSeed.manifest.projectSlug, novelResources],
    [filmSeed.manifest.projectSlug, filmResources]
  ] as const) {
    for (const resourceItem of resources) {
      rows.push([resourceItem.source.replace(/\\/g, "/"), { projectSlug, resource: resourceItem }]);
    }
  }
  return new Map(rows);
}
