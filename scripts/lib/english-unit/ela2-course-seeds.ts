import type {
  EnglishActivityDefinition,
  EnglishActivityEvidencePolicy,
  EnglishActivityProfileV1,
  EnglishCourseArchiveV1,
  EnglishCourseManifestV1,
  EnglishCourseUnitV1,
  EnglishLessonSelectorV2,
  EnglishAnalysisExample,
  EnglishAnalysisTerm,
  EnglishMediaPolicy,
  EnglishReadingRecipe,
  EnglishResourceDispositionV2,
  EnglishUnitRecipeV3,
  EnglishWritingFormConfigV1
} from "./types.js";
import type { EnglishUnitSeed } from "./course-seeds.js";

export const ELA2_COURSE_IDS = ["ela10-2", "ela20-2", "ela30-2"] as const;
export type Ela2CourseId = (typeof ELA2_COURSE_IDS)[number];

type UnitDefinition = {
  projectSlug: string;
  unitTitle: string;
  derivesFromProject: string;
  activityProfile: EnglishActivityProfileV1;
  primaryBrightspaceUnitId: string;
  brightspaceUnitIds: string[];
  teacherFolder: string;
  selectors: EnglishLessonSelectorV2[];
  resources: EnglishResourceDispositionV2[];
  readings?: EnglishReadingRecipe[];
  analysisTerms?: EnglishAnalysisTerm[];
  analysisExamples?: EnglishAnalysisExample[];
  mediaPolicy?: EnglishMediaPolicy;
  topLevelLessonOrder?: string[];
  fictionElementsHub?: EnglishUnitRecipeV3["fictionElementsHub"];
  writingTrackMode: "unit" | "per-work";
  reviewItems: string[];
};

export type Ela2CourseDefinition = {
  courseId: Ela2CourseId;
  courseCode: string;
  courseTitle: string;
  profileId: string;
  profileVersion: string;
  units: readonly UnitDefinition[];
};

function activity(
  id: string,
  title: string,
  route: string,
  evidencePolicyIds: string[] = []
): EnglishActivityDefinition {
  return { id, title, route, enabled: true, evidencePolicyIds };
}

function collectionPolicy(
  id: string,
  activityId: string,
  scope: "activity" | "work" | "locator" = "activity"
): EnglishActivityEvidencePolicy {
  const scopedId = scope === "activity" ? "collection" : `{${scope}Id}`;
  return {
    id,
    activityId,
    saveMode: "collection",
    requiresExplicitSave: true,
    collectionScope: scope,
    contributionIdTemplate: `{projectSlug}:${activityId}:${scopedId}`
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

function shortFictionProfile(input: {
  includeFilmRoom?: boolean;
  resourceRoute?: "materials" | "resources";
} = {}): EnglishActivityProfileV1 {
  const resourceRoute = input.resourceRoute ?? "materials";
  return {
    schemaVersion: 1,
    kind: "short-fiction",
    readerMode: "text-bank",
    questionCollectionScope: "story",
    analysisExplorer: true,
    activities: [
      activity("story-bank", "Short Story Bank", "story-bank"),
      activity("story-questions", "Short Story Questions", "story-questions", ["story-question-collection"]),
      activity("writing-studio", "Writing Studio", "writing-studio", ["analysis-entry", "writing-response-collection"]),
      ...(input.includeFilmRoom ? [activity("film-room", "Film Room", "film-room")] : []),
      activity("evidence-bank", "Evidence Bank", "evidence-bank"),
      activity(resourceRoute, resourceRoute === "resources" ? "Resources" : "Materials", resourceRoute)
    ],
    evidencePolicies: [
      collectionPolicy("story-question-collection", "story-questions", "work"),
      individualPolicy("analysis-entry", "writing-studio"),
      collectionPolicy("writing-response-collection", "writing-studio", "work")
    ]
  };
}

function modernDramaProfile(input: {
  actIds: string[];
  characterIds: string[];
  includeScriptReader: boolean;
  includeFilmRoom: boolean;
  includeWritingStudio?: boolean;
  resourceRoute?: "materials" | "resources";
}): EnglishActivityProfileV1 {
  const resourceRoute = input.resourceRoute ?? "materials";
  const activities: EnglishActivityDefinition[] = [];
  if (input.includeScriptReader) activities.push(activity("script-reader", "Script Reader", "script-reader"));
  activities.push(
    activity("act-questions", "Act Questions", "act-questions", ["act-question-collection"]),
    activity("character-conflict", "Character and Conflict Notes", "character-notes", ["character-dossier-collection"])
  );
  if (input.includeFilmRoom) activities.push(activity("film-room", "Film Room", "film-room"));
  if (input.includeWritingStudio) activities.push(activity("writing-studio", "Writing Studio", "writing-studio", ["text-knowledge-collection", "thesis-workshop-collection", "evidence-collector-entry", "paragraph-architect-collection"]));
  activities.push(
    activity("evidence-bank", "Evidence Bank", "evidence-bank"),
    activity(resourceRoute, resourceRoute === "resources" ? "Resources" : "Materials", resourceRoute)
  );
  return {
    schemaVersion: 1,
    kind: "modern-drama",
    actIds: input.actIds,
    characterIds: input.characterIds,
    criticalEssay: false,
    activities,
    evidencePolicies: [
      collectionPolicy("act-question-collection", "act-questions", "locator"),
      collectionPolicy("character-dossier-collection", "character-conflict", "work"),
      ...(input.includeWritingStudio ? [
        collectionPolicy("text-knowledge-collection", "writing-studio", "activity"),
        collectionPolicy("thesis-workshop-collection", "writing-studio", "activity"),
        individualPolicy("evidence-collector-entry", "writing-studio"),
        collectionPolicy("paragraph-architect-collection", "writing-studio", "activity")
      ] : [])
    ]
  };
}

function novelStudyProfile(
  novels: Array<{ id: string; title: string; author?: string }>,
  input: { resourceRoute?: "materials" | "resources" } = {}
): EnglishActivityProfileV1 {
  const resourceRoute = input.resourceRoute ?? "materials";
  return {
    schemaVersion: 1,
    kind: "novel-study",
    novels,
    questionPhases: ["opening", "middle", "final"],
    genericQuestionCount: 24,
    writingTools: ["analytical-paragraph", "motif-string", "authors-intent"],
    activities: [
      activity("reading-guide", "Reading Guide", "reading-guide", ["passage-entry"]),
      activity("major-works-data", "Major Works Data Sheet", "major-works-data", ["major-works-collection"]),
      activity("novel-questions", "Novel Study Questions", "novel-study-questions", ["novel-question-collection"]),
      activity("writing-studio", "Writing Studio", "writing-studio", ["paragraph-entry", "motif-entry", "authors-intent-entry"]),
      activity("evidence-bank", "Evidence Bank", "evidence-bank"),
      activity(resourceRoute, resourceRoute === "resources" ? "Resources" : "Materials", resourceRoute)
    ],
    evidencePolicies: [
      individualPolicy("passage-entry", "reading-guide"),
      collectionPolicy("major-works-collection", "major-works-data", "work"),
      collectionPolicy("novel-question-collection", "novel-questions", "locator"),
      individualPolicy("paragraph-entry", "writing-studio"),
      individualPolicy("motif-entry", "writing-studio"),
      individualPolicy("authors-intent-entry", "writing-studio")
    ]
  };
}

function filmStudyProfile(input: { resourceRoute?: "materials" | "resources" } = {}): EnglishActivityProfileV1 {
  const resourceRoute = input.resourceRoute ?? "materials";
  return {
    schemaVersion: 1,
    kind: "film-study",
    filmSelection: { mode: "pending" },
    techniqueQuestionCount: 22,
    fullResponseQuestionCount: 18,
    criticalEssayFieldCount: 0,
    viewingGuide: true,
    activities: [
      activity("viewing-guide", "Viewing Guide", "viewing-guide", ["viewing-moment-entry", "viewing-synthesis"]),
      activity("film-questions", "Film Study Questions", "film-study-questions", ["film-question-collection"]),
      activity("film-room", "Film Room", "film-room"),
      activity("evidence-bank", "Evidence Bank", "evidence-bank"),
      activity(resourceRoute, resourceRoute === "resources" ? "Resources" : "Materials", resourceRoute)
    ],
    evidencePolicies: [
      individualPolicy("viewing-moment-entry", "viewing-guide"),
      collectionPolicy("viewing-synthesis", "viewing-guide", "work"),
      collectionPolicy("film-question-collection", "film-questions", "locator")
    ]
  };
}

function writingFoundationsProfile(): EnglishActivityProfileV1 {
  return {
    schemaVersion: 1,
    kind: "writing-foundations",
    activities: [
      activity("sentence-lab", "Sentence Lab", "sentence-lab", ["corrected-sentence-collection", "sentence-example-entry"]),
      activity("paragraph-builder", "Paragraph Builder", "paragraph-builder", ["paragraph-plan-collection"]),
      activity("organization-lab", "Organization Lab", "organization-lab", ["organized-paragraph-collection"]),
      activity("evidence-bank", "Evidence Bank", "evidence-bank"),
      activity("resources", "Resources", "resources")
    ],
    evidencePolicies: [
      collectionPolicy("corrected-sentence-collection", "sentence-lab"),
      individualPolicy("sentence-example-entry", "sentence-lab"),
      collectionPolicy("paragraph-plan-collection", "paragraph-builder", "locator"),
      collectionPolicy("organized-paragraph-collection", "organization-lab")
    ]
  };
}

function resource(
  id: string,
  source: string,
  role: EnglishResourceDispositionV2["role"],
  disposition: EnglishResourceDispositionV2["disposition"],
  reason: string,
  destination?: string,
  title?: string
): EnglishResourceDispositionV2 {
  return { id, source, title, role, disposition, reason, destination };
}

function teacherPath(course: "10" | "20" | "30", suffix: string) {
  return `ENGLISH ${course}-2 NSO/${suffix}`;
}

function excluded(id: string, course: "10" | "20" | "30", suffix: string, reason = "Soft/hard-gate assessment is intentionally excluded.") {
  return resource(id, teacherPath(course, suffix), "excluded-assessment", "exclude", reason);
}

function selectedResource(
  id: string,
  course: "10" | "20" | "30",
  suffix: string,
  role: EnglishResourceDispositionV2["role"],
  destination: string,
  reason: string
) {
  return resource(id, teacherPath(course, suffix), role, "place", reason, destination);
}

const writingFoundationSelectors: EnglishLessonSelectorV2[] = [
  { itemId: "3351", title: "Writing Foundations", disposition: "include" },
  { itemId: "3352", title: "Complete Sentences", disposition: "include" },
  { itemId: "3353", title: "Paragraph Structure and Drafting", disposition: "include" },
  { itemId: "3354", title: "Paragraph Planning Model: Hamburger", disposition: "include" },
  { itemId: "3355", title: "Paragraph Planning Model: Graphic Organizer", disposition: "include" },
  { itemId: "3356", title: "Paragraph Planning Model: PEEL", disposition: "include" },
  { itemId: "3357", title: "Organizing for Coherence", disposition: "include" }
];

const ela20ShortSelectors: EnglishLessonSelectorV2[] = [
  { itemId: "53033", title: "Short Stories", disposition: "include", includeChildren: true }
];

const crucibleSelectors: EnglishLessonSelectorV2[] = [
  { itemId: "53068", title: "Modern Drama Introduction", disposition: "include" },
  { itemId: "53069", title: "Characteristics of Modern Drama", disposition: "include" },
  { itemId: "53074", title: "Critical and Analytical Response", disposition: "include" },
  { itemId: "53075", title: "Student Samples", disposition: "include" },
  ...[53070, 53071, 53072, 53073].map((itemId) => ({
    itemId: String(itemId),
    disposition: "exclude" as const,
    reason: "Alternate play content; The Crucible is teacher-selected."
  }))
];

const novel20Selectors: EnglishLessonSelectorV2[] = [
  { itemId: "53127", title: "Novel Study Introduction", disposition: "include" },
  { itemId: "3467", title: "Characteristics of the Novel", disposition: "include" },
  { itemId: "3468", title: "How to Read a Novel", disposition: "include" }
];

const film20Selectors: EnglishLessonSelectorV2[] = [
  { itemId: "53128", title: "Film Study Overview", disposition: "include" },
  { itemId: "53129", title: "A Brief History of Film", disposition: "include" },
  { itemId: "53130", title: "Formal Elements of Film", disposition: "include" },
  { itemId: "53131", title: "Editing and Sound", disposition: "include" },
  { itemId: "53132", title: "Film Editing Techniques", disposition: "include" },
  { itemId: "53133", title: "Camera Shots and Angles", disposition: "include" },
  { itemId: "53134", title: "Mise-en-scene", disposition: "include" },
  { itemId: "53135", title: "Composition and Camera Movement", disposition: "include" },
  { itemId: "53136", title: "Sound in Film", disposition: "include" }
];

const readings10: EnglishReadingRecipe[] = [
  ["cask-of-amontillado", "The Cask of Amontillado", "Edgar Allan Poe", "Cask of Amontillado.pdf", "Cask of Amontillado Quiz.pdf"],
  ["flight-into-danger", "Flight into Danger", "Arthur Hailey", "Flight into Danger.pdf", "Flight_Into_Danger_Questions.pdf"],
  ["flying-machine", "The Flying Machine", "Ray Bradbury", "Flying Machine.pdf", "Flying Machine.pdf"],
  ["harrison-bergeron", "Harrison Bergeron", "Kurt Vonnegut Jr.", "Harrison Bergeron Overview.pdf", "Harrison Bergeron Questions.pdf"],
  ["i-am-a-rock", "I Am a Rock", "Paul Simon", "I am a Rock Text.pdf", "I am a Rock Questions.pdf"]
].map(([id, title, author, readingFile, questionFile]) => ({
  id, title, author, kind: "short-fiction", group: "Assigned texts", readingFile, questionFile
}));

const readings20: EnglishReadingRecipe[] = [
  { id: "lamp-at-noon", title: "The Lamp at Noon", author: "Sinclair Ross", kind: "short-fiction", group: "Short Fiction", readingFile: "Lamp at Noon.pdf", questionFile: "Lamp at Noon.pdf", questionPages: [9] },
  { id: "sea-devil", title: "The Sea Devil", author: "Arthur Gordon", kind: "short-fiction", group: "Short Fiction", readingFile: "Sea Devil Text.pdf", questionFile: "Sea Devil Questions.pdf" },
  { id: "do-not-fall", title: "Do Not Fall in New York City", author: "Garth Ennis and Steve Dillon", kind: "visual-narrative", group: "Visual Narrative", readingFile: "Do Not Fall in New York Comic.pdf", questionFile: "Do Not Fall Questions.pdf" },
  { id: "men-must-pay", title: "Men Must Pay for Evil They Do", author: "Tom Barrett", kind: "paired-perspective", group: "Paired Perspectives", readingFile: "Men Must Pay Text.pdf", questionFile: "Men Must Pay for Evil they do questions.pdf" },
  { id: "we-must-not-return", title: "We Must Not Return to the Noose", author: "Roy Cook", kind: "paired-perspective", group: "Paired Perspectives", readingFile: "We Must not Return Text.pdf", questionFile: "We Must not Return Questions.pdf" }
];

const ELA30_SHORT_STORY_ANALYSIS_TERMS: EnglishAnalysisTerm[] = [
  { id: "characterization", category: "Character", label: "Characterization", definition: "The methods a writer uses to reveal a character's traits, motives, relationships, and changes." },
  { id: "conflict", category: "Plot", label: "Conflict", definition: "A struggle between opposing needs, values, people, forces, or parts of a character's identity." },
  { id: "setting", category: "Story World", label: "Setting", definition: "The time, place, social conditions, and atmosphere in which a text unfolds." },
  { id: "point-of-view", category: "Narration", label: "Point of View", definition: "The perspective through which information is selected, limited, and presented to the reader." },
  { id: "irony", category: "Layers of Meaning", label: "Irony", definition: "A meaningful contrast between what is said, expected, intended, or understood and what is actually true or occurs." },
  { id: "symbolism", category: "Layers of Meaning", label: "Symbolism", definition: "The use of a concrete object, image, place, or action to suggest meaning beyond its literal role." },
  { id: "tone-and-diction", category: "Language", label: "Tone and Diction", definition: "Tone is the attitude created by a text; diction is the writer's deliberate choice of words that helps create it." },
  { id: "theme", category: "Central Ideas", label: "Theme", definition: "A developed insight about people, choices, relationships, society, or experience that emerges across a text." }
];

const ELA30_SHORT_STORY_ANALYSIS_EXAMPLES: EnglishAnalysisExample[] = [
  {
    readingId: "god-is-not-a-fish-inspector",
    termId: "characterization",
    term: "Characterization",
    evidenceMoment: "He wiped his forehead with his hand and cursed his infirmity.",
    analysis: "Fusi's private anger at his weakening body characterizes him as proud and fiercely independent; he treats age as an opponent rather than a condition he is ready to accept."
  },
  {
    readingId: "god-is-not-a-fish-inspector",
    termId: "conflict",
    term: "Conflict",
    evidenceMoment: "a quarter of a mile and one net were nearly beyond him",
    analysis: "The physical task exposes Fusi's internal conflict between the capable man he remembers and the limits his aging body now imposes."
  },
  {
    readingId: "god-is-not-a-fish-inspector",
    termId: "setting",
    term: "Setting",
    evidenceMoment: "no more than an hour and a half until dawn",
    analysis: "The dark shoreline and approaching dawn create a deadline. The setting turns Fusi's private trip into a race against exposure, pain, and time."
  },
  {
    readingId: "god-is-not-a-fish-inspector",
    termId: "point-of-view",
    term: "Point of View",
    evidenceMoment: "Now, he reflected bitterly",
    analysis: "The third-person limited point of view moves into Fusi's thoughts, allowing the reader to feel the bitterness that his daughter and neighbours may not see."
  },
  {
    readingId: "god-is-not-a-fish-inspector",
    termId: "irony",
    term: "Irony",
    evidenceMoment: "Externally, he had changed very little over the years.",
    analysis: "The contrast is ironic because Fusi still looks strong while his unseen physical decline is steadily reducing what he can do."
  },
  {
    readingId: "god-is-not-a-fish-inspector",
    termId: "symbolism",
    term: "Symbolism",
    evidenceMoment: "the oars rising like too-small wings from a cumbersome body",
    analysis: "The wing image suggests freedom and power, but their smallness beside the cumbersome body makes the boat-and-oars image symbolize Fusi's diminished independence."
  },
  {
    readingId: "god-is-not-a-fish-inspector",
    termId: "tone-and-diction",
    term: "Tone and Diction",
    evidenceMoment: "a bent shingle-nail twisted and turned in his shoulder socket",
    analysis: "The harsh verbs and jagged nail image create a punishing tone, making Fusi's pain feel mechanical, invasive, and impossible to ignore."
  },
  {
    readingId: "god-is-not-a-fish-inspector",
    termId: "theme",
    term: "Theme",
    evidenceMoment: "invisible deterioration that was gradually shrinking the limits of his endurance",
    analysis: "The story develops the idea that aging is frightening not only because the body changes, but because those changes threaten a person's identity and independence."
  },
  {
    readingId: "mother-and-son",
    termId: "characterization",
    term: "Characterization",
    evidenceMoment: "She pushes his hair back from his eyes, curls a lock of it around her finger",
    analysis: "The mother's affectionate gestures also position her as controlling: she handles her son as if he still belongs physically and emotionally to her."
  },
  {
    readingId: "mother-and-son",
    termId: "conflict",
    term: "Conflict",
    evidenceMoment: "half-gratefully, half-resentfully",
    analysis: "The balanced phrasing captures the son's internal conflict. He still wants the comfort of his mother's attention while resenting the power it gives her."
  },
  {
    readingId: "mother-and-son",
    termId: "setting",
    term: "Setting",
    evidenceMoment: "whose twelve-year-old son has drifted into the party",
    analysis: "The public party setting makes the mother's touching performative as well as private, increasing the son's embarrassment and revealing the social imbalance between them."
  },
  {
    readingId: "mother-and-son",
    termId: "point-of-view",
    term: "Point of View",
    evidenceMoment: "her flesh has claimed possession of his",
    analysis: "The observing speaker interprets the mother's touch rather than merely reporting it, guiding readers to see affection and possession operating at the same time."
  },
  {
    readingId: "mother-and-son",
    termId: "irony",
    term: "Irony",
    evidenceMoment: "She's a normal parent.",
    analysis: "The flat claim is ironic after the smile has been linked with power and cruelty. It makes ordinary parental love seem capable of control as well as care."
  },
  {
    readingId: "mother-and-son",
    termId: "symbolism",
    term: "Symbolism",
    evidenceMoment: "plays with the buttons on his shirt",
    analysis: "The repeated use of the mother's hands symbolizes her continuing hold over her son, even as he approaches an age when he might pull away."
  },
  {
    readingId: "mother-and-son",
    termId: "tone-and-diction",
    term: "Tone and Diction",
    evidenceMoment: "a loving smile, of course, but not altogether a friendly one",
    analysis: "The qualification 'but not altogether' shifts the tone from warm to uneasy, suggesting that love in this relationship contains pride, power, and threat."
  },
  {
    readingId: "mother-and-son",
    termId: "theme",
    term: "Theme",
    evidenceMoment: "They both know she's the stronger",
    analysis: "The poem suggests that growing independence is complicated when family love also establishes a familiar structure of power."
  },
  {
    readingId: "old-man",
    termId: "characterization",
    term: "Characterization",
    evidenceMoment: "I need someone to love me the whole day through",
    analysis: "The direct admission characterizes the speaker as emotionally open and lonely, despite the freedom and experience he describes elsewhere."
  },
  {
    readingId: "old-man",
    termId: "conflict",
    term: "Conflict",
    evidenceMoment: "Love lost, such a cost",
    analysis: "The compressed line names the speaker's central emotional conflict: independence has not protected him from the pain and cost of lost connection."
  },
  {
    readingId: "old-man",
    termId: "setting",
    term: "Setting",
    evidenceMoment: "Run around the same old town",
    analysis: "The familiar town suggests repetition and emotional stagnation, contrasting with the speaker's claim that there is still 'so much more.'"
  },
  {
    readingId: "old-man",
    termId: "point-of-view",
    term: "Point of View",
    evidenceMoment: "Old man, look at my life",
    analysis: "The first-person address makes the song a plea to be seen. The repeated 'my' keeps the listener inside the speaker's need for recognition."
  },
  {
    readingId: "old-man",
    termId: "irony",
    term: "Irony",
    evidenceMoment: "Live alone in a paradise",
    analysis: "The contrast between 'paradise' and living alone complicates the idea of success: an ideal place cannot satisfy the speaker's need for companionship."
  },
  {
    readingId: "old-man",
    termId: "symbolism",
    term: "Symbolism",
    evidenceMoment: "Like a coin that won't get tossed / Rolling home to you.",
    analysis: "The coin suggests chance and instability; imagining one that will not be tossed expresses the speaker's desire for a dependable bond and a secure return."
  },
  {
    readingId: "old-man",
    termId: "tone-and-diction",
    term: "Tone and Diction",
    evidenceMoment: "Old man, take a look at my life",
    analysis: "The repeated imperative 'look' creates an earnest, pleading tone. The speaker does not simply describe himself; he asks another person to witness him."
  },
  {
    readingId: "old-man",
    termId: "theme",
    term: "Theme",
    evidenceMoment: "I'm a lot like you were.",
    analysis: "The refrain develops the idea that people at different ages share the same basic need for love, understanding, and a sense of belonging."
  },
  {
    readingId: "warren-pryor",
    termId: "characterization",
    term: "Characterization",
    evidenceMoment: "And he said nothing. Hard and serious",
    analysis: "Warren's silence and rigid description characterize him as emotionally contained; his parents see success while he suppresses his dissatisfaction."
  },
  {
    readingId: "warren-pryor",
    termId: "conflict",
    term: "Conflict",
    evidenceMoment: "aching with empty strength and throttled rage",
    analysis: "The physical language reveals Warren's conflict between the labouring identity his body carries and the confined office role chosen for him."
  },
  {
    readingId: "warren-pryor",
    termId: "setting",
    term: "Setting",
    evidenceMoment: "the stony fields, the meagre acreage that bore them down",
    analysis: "The harsh farm setting explains the parents' sacrifice and why the bank appears to them as rescue, even though Warren experiences it differently."
  },
  {
    readingId: "warren-pryor",
    termId: "point-of-view",
    term: "Point of View",
    evidenceMoment: "They marvelled how he wore a milk-white shirt",
    analysis: "The third-person speaker moves between the parents' pride and Warren's silence, exposing a gap between how his life looks and how it feels."
  },
  {
    readingId: "warren-pryor",
    termId: "irony",
    term: "Irony",
    evidenceMoment: "He was saved from their thistle-strewn farm and its red dirt.",
    analysis: "The word 'saved' is ironic because the final image shows Warren trapped in a teller's cage, with his strength unused and his anger restrained."
  },
  {
    readingId: "warren-pryor",
    termId: "symbolism",
    term: "Symbolism",
    evidenceMoment: "his passport from the years of brutal toil",
    analysis: "The diploma symbolizes escape and opportunity to Warren's parents, but the poem later questions whether that passport led him to freedom."
  },
  {
    readingId: "warren-pryor",
    termId: "tone-and-diction",
    term: "Tone and Diction",
    evidenceMoment: "slaving ... brutal toil ... barren hole",
    analysis: "The severe labour diction creates a tone of hardship, making the parents' hopes understandable while preparing the reader for the cost of their plan."
  },
  {
    readingId: "warren-pryor",
    termId: "theme",
    term: "Theme",
    evidenceMoment: "like a young bear inside his teller's cage",
    analysis: "The poem suggests that a life others define as success can become another form of confinement when it denies a person's nature and desires."
  }
];

const readings30: EnglishReadingRecipe[] = [
  {
    id: "god-is-not-a-fish-inspector",
    title: "God Is Not a Fish Inspector",
    author: "W. D. Valgardson",
    kind: "short-fiction",
    group: "Short Stories and Poetry",
    readingFile: "God Is Not A Fish Inspector.pdf",
    questionFile: "God Is Not A Fish Inspector.pdf",
    questionPrompts: [
      { id: "question-1", prompt: "What physical difficulties does Fusi experience as he leaves shore and begins rowing? Support your answer with two details." },
      { id: "question-2", prompt: "How does the comparison of the oars to “too-small wings” develop the reader’s understanding of Fusi?" },
      { id: "question-3", prompt: "Trace how the author’s imagery makes Fusi’s pain increasingly vivid. Which image is most effective, and why?" },
      { id: "question-4", prompt: "What contrast does Fusi make between himself at twenty and himself now? What does it reveal about his conflict?" },
      { id: "question-5", prompt: "Why does Fusi hurry away without facing his daughter? What can you infer from this action?" },
      { id: "question-6", prompt: "Explain how the setting and the approaching dawn create pressure in the excerpt." },
      { id: "question-7", prompt: "What does “invisible deterioration” mean in context, and why is Fusi more afraid of it than his visible aging?" },
      { id: "question-8", prompt: "Develop a theme statement about aging, independence, or endurance. Support it with precise evidence from the excerpt." }
    ]
  },
  {
    id: "mother-and-son",
    title: "Mother and Son",
    author: "Alden Nowlan",
    kind: "short-fiction",
    group: "Short Stories and Poetry",
    readingFile: "Mother and Son.pdf",
    questionFile: "Mother and Son.pdf",
    questionPrompts: [
      { id: "question-1", prompt: "How does the opening contrast the mother’s attention to guests with her physical attention to her son?" },
      { id: "question-2", prompt: "Identify two gestures made by the mother and explain what each reveals about their relationship." },
      { id: "question-3", prompt: "Why is the mother’s smile described as loving but “not altogether a friendly one”?" },
      { id: "question-4", prompt: "Explain the effect of the words “power” and “cruelty” in the description of a “normal parent.”" },
      { id: "question-5", prompt: "What does the son’s response—half grateful and half resentful—reveal about his conflicting feelings?" },
      { id: "question-6", prompt: "How does the poem develop tension between dependence and independence?" },
      { id: "question-7", prompt: "What does the ending suggest about the son’s readiness to separate from his mother?" },
      { id: "question-8", prompt: "Develop a theme statement about family love, control, or growing up. Support it with precise evidence from the poem." }
    ]
  },
  {
    id: "old-man",
    title: "Old Man",
    author: "Neil Young",
    kind: "short-fiction",
    group: "Short Stories and Poetry",
    readingFile: "Old Man.pdf",
    questionFile: "Old Man.pdf",
    questionPrompts: [
      { id: "question-1", prompt: "Who is the speaker addressing, and what similarities does the speaker see between them?" },
      { id: "question-2", prompt: "What does “Live alone in a paradise / That makes me think of two” suggest about loneliness and companionship?" },
      { id: "question-3", prompt: "Explain the effect of the recurring request to “look at my life.”" },
      { id: "question-4", prompt: "What do the images of a coin being tossed and “rolling home” suggest about uncertainty or belonging?" },
      { id: "question-5", prompt: "How does the speaker’s need for lasting love contrast with things that “get lost”?" },
      { id: "question-6", prompt: "What does the statement “I’ve been first and last” reveal about the speaker’s experience or emotional state?" },
      { id: "question-7", prompt: "How does repetition shape the tone and central idea of the song?" },
      { id: "question-8", prompt: "Develop a theme statement about aging, connection, or the need to be understood. Support it with two precise details." }
    ]
  },
  {
    id: "warren-pryor",
    title: "Warren Pryor",
    author: "Alden Nowlan",
    kind: "short-fiction",
    group: "Short Stories and Poetry",
    readingFile: "Warren Pryor.pdf",
    questionFile: "Warren Pryor.pdf"
  }
];

const resources10Short = [
  selectedResource("cask-reading", "10", "UNIT 2 Short Stories/Cask of Amontillado.pdf", "reading", "story-bank", "Teacher-selected short story."),
  resource("cask-quiz", teacherPath("10", "UNIT 2 Short Stories/Cask of Amontillado Quiz.pdf"), "question-set", "review-required", "Formative vocabulary/comprehension practice; teacher review is required before learner placement.", "story-questions"),
  selectedResource("flight-reading", "10", "UNIT 2 Short Stories/Flight into Danger.pdf", "reading", "story-bank", "Teacher-selected short story."),
  selectedResource("flight-questions", "10", "UNIT 2 Short Stories/Flight_Into_Danger_Questions.pdf", "question-set", "story-questions", "Teacher-supplied story questions."),
  selectedResource("flying-machine", "10", "UNIT 2 Short Stories/Flying Machine.pdf", "reading", "story-bank", "Teacher-selected short story and embedded questions."),
  selectedResource("harrison-reading", "10", "UNIT 2 Short Stories/Harrison Bergeron Overview.pdf", "reading", "story-bank", "Teacher-selected short story."),
  selectedResource("harrison-questions", "10", "UNIT 2 Short Stories/Harrison Bergeron Questions.pdf", "question-set", "story-questions", "Teacher-supplied story questions."),
  selectedResource("rock-reading", "10", "UNIT 2 Short Stories/I am a Rock Text.pdf", "reading", "story-bank", "Teacher-selected text."),
  selectedResource("rock-questions", "10", "UNIT 2 Short Stories/I am a Rock Questions.pdf", "question-set", "story-questions", "Teacher-supplied text questions."),
  excluded("short-soft-reading", "10", "UNIT 2 Short Stories/SOFT GATE_ Ceintures SVP Reading.docx"),
  excluded("short-soft-questions", "10", "UNIT 2 Short Stories/SOFT GATE_ Ceintures SVP Questions.docx"),
  excluded("short-hard-reading", "10", "UNIT 2 Short Stories/HARD GATE Leiningen vs the Ants.pdf"),
  excluded("short-hard-questions", "10", "UNIT 2 Short Stories/HARD GATE Leiningen vs the Ants questions.pdf")
];

const resources10Dracula = [
  {
    id: "dracula-script",
    title: "Dracula Play Script",
    source: teacherPath("10", "UNIT 3 Modern Play/Dracula.pdf"),
    role: "reading" as const,
    disposition: "source-only" as const,
    sourcePages: [{ start: 3, end: 12 }, { start: 14, end: 18 }, { start: 20, end: 26 }],
    destination: "script-reader",
    reason: "Use only the 22 play-script pages: Act I source pages 3-12, Act II pages 14-18, and Act III pages 20-26. The original 125-page anthology PDF stays non-learner-facing; front matter (1-2), embedded question sheets (13, 19, 27-28), duplicate Act III text (29), a monologue brief and student samples (30-32), and unrelated anthology material (33-125) are excluded from the Script Reader."
  },
  {
    id: "dracula-assignments",
    title: "Dracula Questions and Assignment Sources",
    source: teacherPath("10", "UNIT 3 Modern Play/Dracula Assignments.pdf"),
    role: "question-set" as const,
    disposition: "source-only" as const,
    sourcePages: [{ start: 15, end: 15 }, { start: 17, end: 20 }, { start: 25, end: 25 }, { start: 27, end: 28 }],
    destination: "act-questions",
    reason: "Retain only eight clean Dracula-specific source pages. Interactive Act Questions use pages 18-20 (Act I: 4, Act II: 5, Act III: 3; 12 total). Pages 15, 17, 25, and 27-28 remain source-only assignment candidates pending teacher review. Filled responses (5, 16, 21-24, 29), the duplicate character sheet (26), unit tests and exams (30-47), and background or non-assignment pages (1-14) are excluded from learner output."
  },
  resource(
    "dracula-vocabulary",
    teacherPath("10", "UNIT 3 Modern Play/Dracula Vocabulary Quiz.doc"),
    "question-set",
    "review-required",
    "Retain as the source for clearly labelled, non-graded formative vocabulary practice only; teacher review is required before learner placement.",
    "vocabulary-practice"
  ),
  excluded("dracula-soft-reading", "10", "UNIT 3 Modern Play/SOFT GATE_ School Thief Reading.docx"),
  excluded("dracula-soft-questions", "10", "UNIT 3 Modern Play/SOFT GATE_ School Thief Questions.docx"),
  excluded("dracula-hard-gate", "10", "UNIT 3 Modern Play/MODERN PLAY UNIT 10-2 HARD GATE Critical Response to Text.docx")
];

const resources10Novel = [
  selectedResource("speak-overview", "10", "UNIT 4 Novel/Overview of Speak by Laurie Halse Anderson.docx", "supporting-resource", "materials", "Teacher-selected novel overview."),
  selectedResource("boy-overview", "10", "UNIT 4 Novel/The Boy in the Striped Pyjamas Overview.docx", "supporting-resource", "materials", "Teacher-selected novel overview."),
  selectedResource("major-works-data", "10", "UNIT 4 Novel/Major Works Data Sheet.docx", "supporting-resource", "major-works-data", "Teacher-selected reading and analysis organizer."),
  excluded("novel-soft-reading", "10", "UNIT 4 Novel/SOFT GATE_ All The Years of Her Life Reading.docx"),
  excluded("novel-soft-questions", "10", "UNIT 4 Novel/SOFT GATE_ All The Years of Her Life Questions.docx"),
  excluded("novel-hard-gate", "10", "UNIT 4 Novel/10-2 NOVEL UNIT HARD GATE Literary Response to Text.docx")
];

const resources10Writing = [
  excluded("writing-soft-reading", "10", "UNIT 1 Essentials of Writting/SOFT GATE_ Ensign Knightly Reading.docx"),
  excluded("writing-soft-questions", "10", "UNIT 1 Essentials of Writting/SOFT GATE_ Ensign Knightly Questions.docx"),
  excluded("writing-hard-gate", "10", "UNIT 1 Essentials of Writting/HARD GATE- Paragraph Response.docx")
];

const resources20Short = [
  selectedResource("lamp", "20", "UNIT 1 Short Story/Lamp at Noon.pdf", "reading", "story-bank", "Teacher-selected short story with page-nine questions."),
  selectedResource("sea-devil", "20", "UNIT 1 Short Story/Sea Devil Text.pdf", "reading", "story-bank", "Teacher-selected short story."),
  selectedResource("sea-devil-questions", "20", "UNIT 1 Short Story/Sea Devil Questions.pdf", "question-set", "story-questions", "Teacher-supplied story questions."),
  selectedResource("do-not-fall", "20", "UNIT 1 Short Story/Do Not Fall in New York Comic.pdf", "reading", "story-bank", "Teacher-selected visual narrative."),
  selectedResource("do-not-fall-questions", "20", "UNIT 1 Short Story/Do Not Fall Questions.pdf", "question-set", "story-questions", "Teacher-supplied visual-narrative questions."),
  selectedResource("men-must-pay", "20", "UNIT 1 Short Story/Men Must Pay Text.pdf", "reading", "story-bank", "Teacher-selected paired-perspective text."),
  selectedResource("men-must-pay-questions", "20", "UNIT 1 Short Story/Men Must Pay for Evil they do questions.pdf", "question-set", "story-questions", "Teacher-supplied paired-perspective questions."),
  selectedResource("noose", "20", "UNIT 1 Short Story/We Must not Return Text.pdf", "reading", "story-bank", "Teacher-selected paired-perspective text."),
  selectedResource("noose-questions", "20", "UNIT 1 Short Story/We Must not Return Questions.pdf", "question-set", "story-questions", "Teacher-supplied paired-perspective questions."),
  excluded("short-hard-gate", "20", "UNIT 1 Short Story/SHORT STORY HARD GATE Personal Response-the Hours.pdf"),
  excluded("short-soft-reading", "20", "UNIT 1 Short Story/SHORT STORY UNIT SOFT GATE ASSESSMENT Circus in Town RC Readings.doc"),
  excluded("short-soft-questions", "20", "UNIT 1 Short Story/SHORT STORY UNIT SOFT GATE ASSESSMENT Circus in Town RC Questions.docx")
];

const resources20Crucible = [
  ...[1, 2, 3, 4].map((act) => selectedResource(
    `crucible-act-${act}`,
    "20",
    `UNIT 2 Modern Play/#00${act} Crucible Act ${act}.pdf`,
    "question-set",
    "act-questions",
    `Teacher-selected Crucible Act ${act} questions.`
  )),
  selectedResource("crucible-conflict", "20", "UNIT 2 Modern Play/Crucible Conflict.jpg", "supporting-resource", "character-conflict", "Teacher-selected conflict activity."),
  resource("crucible-litchart", teacherPath("20", "UNIT 2 Modern Play/thecrucible-LitChart.pdf"), "supporting-resource", "review-required", "Retain outside learner output until redistribution and accessibility review is resolved.", "play-materials"),
  excluded("crucible-hard-gate", "20", "UNIT 2 Modern Play/MODERN PLAY UNIT HARD GATE- CRUCIBLE Personal Response to Text.doc"),
  excluded("crucible-soft-reading", "20", "UNIT 2 Modern Play/MODERN PLAY UNIT SOFT GATE ASSESSMENT Ivanov RC Reading.docx"),
  excluded("crucible-soft-questions", "20", "UNIT 2 Modern Play/MODERN PLAY UNIT SOFT GATE ASSESSMENT Ivanov RC Questions.docx")
];

const resources20Novel = [
  selectedResource("novel-prompts", "20", "UNIT 3 Novel/NOVEL UNIT 20-2.docx", "question-set", "novel-questions", "Teacher-selected prompts for both novel tracks."),
  selectedResource("major-works-data", "20", "UNIT 3 Novel/Major Works Data Sheet.docx", "supporting-resource", "major-works-data", "Teacher-selected reading and analysis organizer."),
  excluded("novel-soft-reading", "20", "UNIT 3 Novel/NOVEL UNIT SOFT GATE ASSESSMENT Falling in Love RC Reading.docx"),
  excluded("novel-soft-questions", "20", "UNIT 3 Novel/NOVEL UNIT SOFT GATE ASSESSMENT Falling in Love RC Questions.docx")
];

const resources30Short = [
  ...readings30.map((reading) => selectedResource(
    `reading-${reading.id}`,
    "30",
    `UNIT 1 Short Stories/${reading.readingFile}`,
    "reading",
    "story-bank",
    "Teacher-selected short-story or poetry text."
  )),
  resource("visual-literacy-slides", teacherPath("30", "UNIT 1 Short Stories/Visual literacy final[1].pptx"), "supporting-resource", "review-required", "Visual-literacy source requires rights, accessibility, and conversion review before learner placement.", "materials"),
  excluded("short-visual-hard-gate", "30", "UNIT 1 Short Stories/SHORT STORY HARD GATE 30-2 Visual Response Task.docx.pdf"),
  excluded("short-soft-reading", "30", "UNIT 1 Short Stories/SHORT STORY UNIT SOFT GATE ASSESSMENT Grasshopper RC Readings.pdf"),
  excluded("short-soft-questions", "30", "UNIT 1 Short Stories/SHORT STORY UNIT SOFT GATE ASSESSMENTGrasshopper RC Questions.pdf")
];

const resources30Streetcar = [
  resource(
    "streetcar-primary-text",
    "project-workspace://ela30-1-modern-drama/assets/source/a-streetcar-named-desire.pdf",
    "reading",
    "place",
    "Reuse the approved ELA 30-1 learner copy in the Streetcar Materials reader.",
    "materials",
    "A Streetcar Named Desire"
  ),
  resource(
    "streetcar-cbe-reading-guide",
    "project-workspace://ela30-1-modern-drama/assets/source/cbe-streetcar-reading-guide.pdf",
    "supporting-resource",
    "place",
    "Reuse the approved ELA 30-1 Streetcar reading guide.",
    "materials",
    "Streetcar Reading Guide"
  ),
  resource(
    "streetcar-nextstep-booklet",
    "project-workspace://ela30-1-modern-drama/assets/source/nextstep-unit5-streetcar.docx",
    "question-set",
    "place",
    "Reuse the approved ELA 30-1 Streetcar unit booklet.",
    "materials",
    "Streetcar Unit Booklet"
  ),
  ...[
    ["streetcar-full-film", "streetcar-named-desire-movie.mp4", "Streetcar Named Desire Movie", "Full film resource used by the approved ELA 30-1 Film Room."],
    ["streetcar-audio-overview", "The_Brando_Curse_and_Forbidden_Subtext.m4a", "Streetcar Audio Overview", "Audio context connected to the overview and character lessons."],
    ["blue-piano-motif", "Motif_of_the_Blue_Piano.mp4", "Blue Piano Motif", "Lesson media connected to motifs."],
    ["paper-moon-motif", "The__Paper_Moon__Motif.mp4", "Paper Moon Motif", "Lesson media connected to motifs."],
    ["varsouviana-polka-motif", "Varsouviana_Polka_Motif.mp4", "Varsouviana Polka Motif", "Lesson media connected to motifs."],
    ["belle-reve-motif", "Unpacking_Belle_Reve.mp4", "Belle Reve Motif", "Lesson media connected to motifs."],
    ["psychological-weapons-audio", "Psychological_weapons_in_A_Streetcar_Named_Desire.m4a", "Psychological Weapons Audio", "Audio review connected to motifs and character pressure."],
    ["light-symbolism", "Light_Motif_in_Streetcar.mp4", "Light Motif", "Lesson media connected to symbols."],
    ["floral-symbolism", "Decoding_Floral_Symbolism.mp4", "Floral Symbolism", "Lesson media connected to symbols."],
    ["truth-theme", "Truth_vs.mp4", "Truth versus Illusion", "Lesson media connected to themes."],
    ["repression-theme", "Repression___Dependence.mp4", "Repression and Dependence", "Lesson media connected to themes."],
    ["class-theme", "Class_in_Streetcar.mp4", "Class in Streetcar", "Lesson media connected to themes."],
    ["passion-theme", "Streetcar__Passion___Desire.mp4", "Passion and Desire", "Lesson media connected to themes."]
  ].map(([id, fileName, title, reason]) => resource(
    id!,
    `project-workspace://ela30-1-modern-drama/assets/media/${fileName}`,
    "media",
    "place",
    reason!,
    "film-room",
    title
  )),
  excluded("streetcar-hard-gate", "30", "UNIT 2 Modern Play/30-2 MODERN PLAY UNIT HARD GATE- A STREETCAR NAMED DESIRE    Personal Response to Text.docx"),
  excluded("streetcar-soft-reading", "30", "UNIT 2 Modern Play/MODERN PLAY UNIT SOFT GATE ASSESSMENT Man of Destiny RC Readings.pdf"),
  excluded("streetcar-soft-questions", "30", "UNIT 2 Modern Play/MODERN PLAY UNIT SOFT GATE ASSESSMENT Man of Destiny RC Questions.pdf")
];

const resources30Novel = [
  selectedResource("major-works-data", "30", "UNIT 3 Novel/Major Works Data Sheet.docx", "supporting-resource", "major-works-data", "Teacher-selected reading and analysis organizer."),
  excluded("novel-hard-gate", "30", "UNIT 3 Novel/30-2 NOVEL UNIT HARD GATE Literary Response to Text.docx"),
  excluded("novel-soft-reading", "30", "UNIT 3 Novel/NOVEL UNIT SOFT GATE ASSESSMENT  RC Readings.pdf"),
  excluded("novel-soft-questions", "30", "UNIT 3 Novel/NOVEL UNIT SOFT GATE ASSESSMENT  RC Questions.pdf")
];

const resources10Film = [excluded("film-hard-gate", "10", "UNIT 5 Film/FILM UNIT 10-2 HARD GATE Personal Response to Text Essay Prompt.docx")];
const resources20Film = [excluded("film-hard-gate", "20", "UNIT 4 Film Study/FILM UNIT 20-2 HARD GATE Personal Response to Text Essay Prompt - Copy.docx")];
const resources30Film = [excluded("film-hard-gate", "30", "UNIT 4 Film Study/FILM UNIT 30-2 HARD GATE Personal Response to Text Essay Prompt.docx")];

function donorSelectors(projectSlug: string): EnglishLessonSelectorV2[] {
  return [{
    itemId: `donor:${projectSlug}`,
    title: "Approved donor lesson sequence",
    disposition: "include",
    includeChildren: true,
    reason: "Resolve lesson content from the approved donor recipe during the derived V3 build; this is not a Brightspace content selector."
  }];
}

function formsFor(courseId: Ela2CourseId, trackMode: "unit" | "per-work", profile: string): EnglishWritingFormConfigV1[] {
  const forms: EnglishWritingFormConfigV1[] = [
    { kind: "literary-exploration", trackMode, profile },
    { kind: "personal-response", trackMode, profile }
  ];
  if (courseId === "ela30-2") forms.push({ kind: "visual-response", trackMode, profile: "visual-literacy" });
  return forms;
}

const ELA10_UNITS: readonly UnitDefinition[] = [
  {
    projectSlug: "ela10-2-writing-foundations",
    unitTitle: "Writing Foundations",
    derivesFromProject: "ela10-1-short-stories",
    activityProfile: writingFoundationsProfile(),
    primaryBrightspaceUnitId: "3350",
    brightspaceUnitIds: ["3349", "3350", "3351", "3352", "3353", "3354", "3355", "3356", "3357"],
    teacherFolder: teacherPath("10", "UNIT 1 Essentials of Writting"),
    selectors: writingFoundationSelectors,
    resources: resources10Writing,
    writingTrackMode: "unit",
    reviewItems: [
      "Confirm all seven UTF-16LE pages normalize cleanly to UTF-8.",
      "Resolve rights before using the Teachers Pay Teachers slides; they remain source-only by default.",
      "Verify the native run-on-sentence lesson and accessible hamburger, Graphic, and PEEL diagrams.",
      "Use the current Purdue OWL Paragraphs and Paragraphing page as the verified writing support; the broken SlideShare embed and obsolete Purdue URL remain excluded."
    ]
  },
  {
    projectSlug: "ela10-2-short-stories",
    unitTitle: "Short Stories",
    derivesFromProject: "ela10-1-short-stories",
    activityProfile: shortFictionProfile({ resourceRoute: "resources" }),
    primaryBrightspaceUnitId: "derived-ela10-1-short-stories",
    brightspaceUnitIds: ["donor:ela10-1-short-stories"],
    teacherFolder: teacherPath("10", "UNIT 2 Short Stories"),
    selectors: donorSelectors("ela10-1-short-stories"),
    resources: resources10Short,
    readings: readings10,
    writingTrackMode: "per-work",
    reviewItems: [
      "Review the Cask vocabulary quiz before enabling it as formative practice.",
      "Confirm every supplied question set is extracted without prefilled learner answers."
    ]
  },
  {
    projectSlug: "ela10-2-modern-play-dracula",
    unitTitle: "Modern Play - Dracula",
    derivesFromProject: "ela10-1-modern-play-fences",
    activityProfile: modernDramaProfile({
      actIds: ["act-1", "act-2", "act-3"],
      characterIds: ["dracula", "jonathan-harker", "mina", "lucy", "van-helsing"],
      includeScriptReader: true,
      includeFilmRoom: false,
      resourceRoute: "resources"
    }),
    primaryBrightspaceUnitId: "derived-ela10-1-modern-play-fences",
    brightspaceUnitIds: ["donor:ela10-1-modern-play-fences"],
    teacherFolder: teacherPath("10", "UNIT 3 Modern Play"),
    selectors: donorSelectors("ela10-1-modern-play-fences"),
    resources: resources10Dracula,
    writingTrackMode: "unit",
    reviewItems: [
      "Verify the scoped Script Reader against Dracula.pdf pages 3-12, 14-18, and 20-26; it maps four scenes across Acts I-III and still requires rights and accessibility approval.",
      "Editorially verify all 12 clean act questions from Dracula Assignments.pdf pages 18-20 (4/5/3 by act) before final export.",
      "Review the retained Dracula vocabulary quiz before adapting it into clearly labelled, non-graded formative practice; no answer key or learner answers may be published.",
      "Approve, adapt, or decline the source-only assignment candidates on Dracula Assignments.pdf pages 15, 17, 25, and 27-28; page 28 is only a partial Personal Response planner."
    ]
  },
  {
    projectSlug: "ela10-2-novel-study",
    unitTitle: "Novel Study",
    derivesFromProject: "ela10-1-novel-study",
    activityProfile: novelStudyProfile([
      { id: "speak", title: "Speak", author: "Laurie Halse Anderson" },
      { id: "boy-striped-pajamas", title: "The Boy in the Striped Pajamas", author: "John Boyne" }
    ], { resourceRoute: "resources" }),
    primaryBrightspaceUnitId: "derived-ela10-1-novel-study",
    brightspaceUnitIds: ["donor:ela10-1-novel-study"],
    teacherFolder: teacherPath("10", "UNIT 4 Novel"),
    selectors: donorSelectors("ela10-1-novel-study"),
    resources: resources10Novel,
    writingTrackMode: "per-work",
    reviewItems: [
      "Confirm learner access to both novels; the primary texts are not supplied.",
      "Review question coverage for both title tracks before export."
    ]
  },
  {
    projectSlug: "ela10-2-film-study",
    unitTitle: "Film Study",
    derivesFromProject: "ela10-1-film-study",
    activityProfile: filmStudyProfile({ resourceRoute: "resources" }),
    primaryBrightspaceUnitId: "derived-ela10-1-film-study",
    brightspaceUnitIds: ["donor:ela10-1-film-study"],
    teacherFolder: teacherPath("10", "UNIT 5 Film"),
    selectors: donorSelectors("ela10-1-film-study"),
    resources: resources10Film,
    writingTrackMode: "unit",
    reviewItems: ["Keep title-neutral language and validate every inherited lesson video and fallback link."]
  }
];

const ELA20_UNITS: readonly UnitDefinition[] = [
  {
    projectSlug: "ela20-2-short-stories",
    unitTitle: "Short Stories",
    derivesFromProject: "ela20-1-short-stories-pilot",
    activityProfile: shortFictionProfile(),
    primaryBrightspaceUnitId: "53033",
    brightspaceUnitIds: ["53033"],
    teacherFolder: teacherPath("20", "UNIT 1 Short Story"),
    selectors: ela20ShortSelectors,
    resources: resources20Short,
    readings: readings20,
    topLevelLessonOrder: [
      "Short Stories - Introduction",
      "Lesson 1: Characters and Characterization",
      "Lesson 2: Introduction to Elements of Fiction",
      "Lesson 12: Literary Terms",
      "Lesson 11: Suggestions for Reading Short Stories",
      "Lesson 13: Writing a Personal Response to Text(s)"
    ],
    fictionElementsHub: {
      hubLesson: "Lesson 2: Introduction to Elements of Fiction",
      childLessons: [
        "Lesson 3: Irony",
        "Lesson 4: Point of View",
        "Lesson 5: Plot",
        "Lesson 6: Setting",
        "Lesson 7: Symbols and Motifs",
        "Lesson 8: Tone and Mood",
        "Lesson 9: Diction",
        "Lesson 10: Theme"
      ]
    },
    writingTrackMode: "per-work",
    reviewItems: [
      "Confirm The Lamp at Noon page-nine questions remain correctly extracted.",
      "Verify separate Literary Exploration and Personal Response state for all five selected texts."
    ]
  },
  {
    projectSlug: "ela20-2-modern-play-crucible",
    unitTitle: "Modern Play - The Crucible",
    derivesFromProject: "ela20-1-modern-play-crucible",
    activityProfile: modernDramaProfile({
      actIds: ["act-1", "act-2", "act-3", "act-4"],
      characterIds: ["john-proctor", "elizabeth-proctor", "abigail-williams", "reverend-hale", "danforth"],
      includeScriptReader: false,
      includeFilmRoom: true
    }),
    primaryBrightspaceUnitId: "53068",
    brightspaceUnitIds: ["53068", "53069", "53074", "53075"],
    teacherFolder: teacherPath("20", "UNIT 2 Modern Play"),
    selectors: crucibleSelectors,
    resources: resources20Crucible,
    writingTrackMode: "unit",
    reviewItems: [
      "Confirm access to the complete play and film before final export.",
      "Resolve redistribution and accessibility for the supplied LitChart."
    ]
  },
  {
    projectSlug: "ela20-2-novel-study",
    unitTitle: "Novel Study",
    derivesFromProject: "ela20-1-novel-study-clean",
    activityProfile: novelStudyProfile([
      { id: "lord-of-the-flies", title: "Lord of the Flies", author: "William Golding" },
      { id: "book-thief", title: "The Book Thief", author: "Markus Zusak" }
    ], { resourceRoute: "resources" }),
    primaryBrightspaceUnitId: "53127",
    brightspaceUnitIds: ["53127", "3467", "3468"],
    teacherFolder: teacherPath("20", "UNIT 3 Novel"),
    selectors: novel20Selectors,
    resources: resources20Novel,
    writingTrackMode: "per-work",
    reviewItems: [
      "Confirm learner access to both novels; the primary texts are not supplied.",
      "Review the supplied NOVEL UNIT prompts against both tracks."
    ]
  },
  {
    projectSlug: "ela20-2-film-study",
    unitTitle: "Film Study",
    derivesFromProject: "ela20-1-feature-film",
    activityProfile: filmStudyProfile(),
    primaryBrightspaceUnitId: "53128",
    brightspaceUnitIds: Array.from({ length: 9 }, (_, index) => String(53128 + index)),
    teacherFolder: teacherPath("20", "UNIT 4 Film Study"),
    selectors: film20Selectors,
    resources: resources20Film,
    writingTrackMode: "unit",
    reviewItems: ["Keep title-neutral language and validate every inherited lesson video and fallback link."]
  }
];

const ELA30_UNITS: readonly UnitDefinition[] = [
  {
    projectSlug: "ela30-2-short-stories-visual-literacy",
    unitTitle: "Short Stories and Visual Literacy",
    derivesFromProject: "ela30-1-short-stories",
    activityProfile: shortFictionProfile({ includeFilmRoom: true, resourceRoute: "resources" }),
    primaryBrightspaceUnitId: "derived-ela30-1-short-stories",
    brightspaceUnitIds: ["donor:ela30-1-short-stories"],
    teacherFolder: teacherPath("30", "UNIT 1 Short Stories"),
    selectors: donorSelectors("ela30-1-short-stories"),
    resources: resources30Short,
    readings: readings30,
    analysisTerms: ELA30_SHORT_STORY_ANALYSIS_TERMS,
    analysisExamples: ELA30_SHORT_STORY_ANALYSIS_EXAMPLES,
    mediaPolicy: {
      verifiedAt: "2026-07-23",
      allowedYouTubeIds: [
        "1KbDdiku75E",
        "j1bfOBBl6pQ",
        "SKi56cPUSFk",
        "WH5jlkK4aUI",
        "30CPmgVQNks",
        "FzpJnYIQv98",
        "YcCrsVK5dWs",
        "urEh4_fTtao",
        "RecVd-6g-IY"
      ],
      blockedYouTubeIds: [],
      approvedExternalUrls: [
        "https://literarydevices.net/play/",
        "https://literarydevices.net/character/",
        "https://www.bibliomania.com/0/0/29/63/frameset.html",
        "https://wilstar.com/christmas/symbols-and-their-history/"
      ],
      externalUrlRewrites: {
        "http://www.bibliomania.com/0/0/29/63/frameset.html": "https://www.bibliomania.com/0/0/29/63/frameset.html"
      }
    },
    writingTrackMode: "per-work",
    reviewItems: [
      "Resolve rights and accessibility for packaged visual-literacy materials.",
      "Use teacher-authorized or licensed replacement visuals and fresh response models.",
      "Verify the neutral current-visual track until licensed or teacher-authorized visuals are approved for per-visual tracking."
    ]
  },
  {
    projectSlug: "ela30-2-modern-drama-streetcar",
    unitTitle: "Modern Drama - A Streetcar Named Desire",
    derivesFromProject: "ela30-1-modern-drama",
    activityProfile: modernDramaProfile({
      actIds: Array.from({ length: 11 }, (_, index) => `scene-${index + 1}`),
      characterIds: ["blanche-dubois", "stanley-kowalski", "stella-kowalski", "mitch"],
      includeScriptReader: false,
      includeFilmRoom: true,
      includeWritingStudio: true
    }),
    primaryBrightspaceUnitId: "derived-ela30-1-modern-drama",
    brightspaceUnitIds: ["donor:ela30-1-modern-drama"],
    teacherFolder: teacherPath("30", "UNIT 2 Modern Play"),
    selectors: donorSelectors("ela30-1-modern-drama"),
    resources: resources30Streetcar,
    writingTrackMode: "unit",
    reviewItems: [
      "Confirm learner access to A Streetcar Named Desire; no primary script is supplied.",
      "Verify the neutral current-visual track used by Visual Response."
    ]
  },
  {
    projectSlug: "ela30-2-novel-study",
    unitTitle: "Novel Study",
    derivesFromProject: "ela30-1-novel-study-legacy",
    activityProfile: novelStudyProfile([
      { id: "fight-club", title: "Fight Club", author: "Chuck Palahniuk" },
      { id: "night", title: "Night", author: "Elie Wiesel" },
      { id: "fallen-angels", title: "Fallen Angels", author: "Walter Dean Myers" }
    ]),
    primaryBrightspaceUnitId: "derived-ela30-1-novel-study-legacy",
    brightspaceUnitIds: ["donor:ela30-1-novel-study-legacy"],
    teacherFolder: teacherPath("30", "UNIT 3 Novel"),
    selectors: donorSelectors("ela30-1-novel-study-legacy"),
    resources: resources30Novel,
    writingTrackMode: "per-work",
    reviewItems: [
      "Confirm learner access to all three novels; primary texts are not supplied.",
      "Verify per-work Literary Exploration and Personal Response state isolation, plus the neutral current-visual track for Visual Response."
    ]
  },
  {
    projectSlug: "ela30-2-film-study",
    unitTitle: "Film Study",
    derivesFromProject: "ela30-1-feature-film-legacy",
    activityProfile: filmStudyProfile(),
    primaryBrightspaceUnitId: "derived-ela30-1-feature-film-legacy",
    brightspaceUnitIds: ["donor:ela30-1-feature-film-legacy"],
    teacherFolder: teacherPath("30", "UNIT 4 Film Study"),
    selectors: donorSelectors("ela30-1-feature-film-legacy"),
    resources: resources30Film,
    writingTrackMode: "unit",
    reviewItems: [
      "Keep title-neutral language and validate every inherited lesson video and fallback link.",
      "Verify the neutral current-visual track used by Visual Response."
    ]
  }
];

export const ELA2_COURSE_DEFINITIONS: Readonly<Record<Ela2CourseId, Ela2CourseDefinition>> = {
  "ela10-2": {
    courseId: "ela10-2",
    courseCode: "ELA 10-2",
    courseTitle: "English Language Arts 10-2",
    profileId: "next-step-english",
    profileVersion: "next-step-english-v3-ela10-2",
    units: ELA10_UNITS
  },
  "ela20-2": {
    courseId: "ela20-2",
    courseCode: "ELA 20-2",
    courseTitle: "English Language Arts 20-2",
    profileId: "next-step-english",
    profileVersion: "next-step-english-v3-ela20-2",
    units: ELA20_UNITS
  },
  "ela30-2": {
    courseId: "ela30-2",
    courseCode: "ELA 30-2",
    courseTitle: "English Language Arts 30-2",
    profileId: "next-step-english",
    profileVersion: "next-step-english-v3-ela30-2",
    units: ELA30_UNITS
  }
};

export function isEla2CourseId(value: string): value is Ela2CourseId {
  return (ELA2_COURSE_IDS as readonly string[]).includes(value);
}

export function getEla2CourseDefinition(courseId: Ela2CourseId): Ela2CourseDefinition {
  return ELA2_COURSE_DEFINITIONS[courseId];
}

export function getEla2UnitSeeds(courseId: Ela2CourseId): readonly EnglishUnitSeed[] {
  const definition = getEla2CourseDefinition(courseId);
  return definition.units.map((unit) => ({
    manifest: {
      projectSlug: unit.projectSlug,
      unitTitle: unit.unitTitle,
      recipePath: `projects/${unit.projectSlug}/meta/english-unit.json`,
      profileVersion: definition.profileVersion,
      activityProfile: unit.activityProfile.kind,
      brightspaceUnitIds: [...unit.brightspaceUnitIds],
      reviewStatus: "needs-review"
    },
    primaryBrightspaceUnitId: unit.primaryBrightspaceUnitId,
    teacherFolder: unit.teacherFolder,
    selectors: unit.selectors.map((selector) => ({ ...selector })),
    createRecipe: true
  }));
}

function correctionsFor(courseCode: string) {
  return ["ELA 10-1", "English 10-1", "ELA 20-1", "English 20-1", "ELA 30-1", "English 30-1"]
    .map((find) => ({ find, replace: courseCode, reason: "Correct inherited donor course-level wording." }))
    .concat([
      { find: "CBE", replace: "", reason: "Remove inherited provider branding from learner-facing copy." },
      { find: "<p>Please continue to the next page.</p>", replace: "", reason: "Remove the complete obsolete LMS navigation paragraph." },
      { find: "Please continue to the next page.", replace: "", reason: "Remove the complete obsolete LMS navigation sentence without leaving stray punctuation." },
      { find: "continue to the next page", replace: "", reason: "Remove obsolete LMS navigation language." }
    ]);
}

function buildRecipe(input: {
  course: Ela2CourseDefinition;
  unit: UnitDefinition;
  brightspaceArchivePath: string;
  teacherArchivePath: string;
}): EnglishUnitRecipeV3 {
  const lessonOrder = input.unit.selectors
    .filter((selector) => selector.disposition === "include")
    .map((selector) => selector.itemId);
  const enabledActivities = input.unit.activityProfile.activities.filter((activityItem) => activityItem.enabled);
  const excludedFiles = input.unit.resources
    .filter((item) => item.disposition === "exclude")
    .map((item) => ({ file: item.source, reason: item.reason }));

  return {
    schemaVersion: 3,
    projectSlug: input.unit.projectSlug,
    courseCode: input.course.courseCode,
    courseTitle: input.course.courseTitle,
    unitTitle: input.unit.unitTitle,
    profileVersion: input.course.profileVersion,
    status: "needs-review",
    derivesFromProject: input.unit.derivesFromProject,
    writingForms: formsFor(input.course.courseId, input.unit.writingTrackMode, input.unit.activityProfile.kind),
    source: {
      brightspaceZip: input.brightspaceArchivePath,
      teacherResourcesZip: input.teacherArchivePath,
      brightspaceUnitId: input.unit.primaryBrightspaceUnitId,
      teacherFolder: input.unit.teacherFolder,
      archiveRefs: { brightspace: "brightspace", teacherResources: "teacher-resources" },
      lessonSelectors: input.unit.selectors.map((selector) => ({ ...selector }))
    },
    activityProfile: input.unit.activityProfile,
    lessonOrder,
    topLevelLessonOrder: input.unit.topLevelLessonOrder
      ? [...input.unit.topLevelLessonOrder]
      : [...lessonOrder],
    fictionElementsHub: input.unit.fictionElementsHub
      ? {
          ...input.unit.fictionElementsHub,
          childLessons: [...input.unit.fictionElementsHub.childLessons]
        }
      : undefined,
    lessonGroups: [{ id: "unit-lessons", title: input.unit.unitTitle, lessonIds: [...lessonOrder] }],
    readings: input.unit.readings?.map((reading) => ({ ...reading })) ?? [],
    placements: [],
    analysisTerms: input.unit.analysisTerms?.map((term) => ({ ...term })) ?? [],
    analysisExamples: input.unit.analysisExamples?.map((example) => ({ ...example })) ?? [],
    resourceDispositions: input.unit.resources.map((item) => ({ ...item })),
    excludedFiles,
    wordingCorrections: correctionsFor(input.course.courseCode),
    mediaPolicy: input.unit.mediaPolicy ?? {
      verifiedAt: "not-reviewed",
      allowedYouTubeIds: [],
      blockedYouTubeIds: [],
      approvedExternalUrls: [],
      externalUrlRewrites: {}
    },
    customComponents: [],
    acceptance: {
      requiredRoutes: enabledActivities.map((activityItem) => activityItem.route),
      requiredActivityIds: enabledActivities.map((activityItem) => activityItem.id),
      reviewItems: [...input.unit.reviewItems]
    }
  };
}

export function createEla2RecipeSeeds(input: {
  courseId: Ela2CourseId;
  brightspaceArchivePath: string;
  teacherArchivePath: string;
}): EnglishUnitRecipeV3[] {
  const course = getEla2CourseDefinition(input.courseId);
  return course.units.map((unit) => buildRecipe({
    course,
    unit,
    brightspaceArchivePath: input.brightspaceArchivePath,
    teacherArchivePath: input.teacherArchivePath
  }));
}

export function createEla2CourseManifest(input: {
  courseId: Ela2CourseId;
  archives: EnglishCourseArchiveV1[];
  generatedAt: string;
  existingReviewStatuses?: ReadonlyMap<string, EnglishCourseUnitV1["reviewStatus"]>;
}): EnglishCourseManifestV1 {
  const definition = getEla2CourseDefinition(input.courseId);
  return {
    schemaVersion: 1,
    courseId: definition.courseId,
    courseCode: definition.courseCode,
    courseTitle: definition.courseTitle,
    profileId: definition.profileId,
    profileVersion: definition.profileVersion,
    archives: input.archives.map((archive) => ({ ...archive })),
    units: getEla2UnitSeeds(input.courseId).map((seed) => ({
      ...seed.manifest,
      brightspaceUnitIds: [...seed.manifest.brightspaceUnitIds],
      reviewStatus: input.existingReviewStatuses?.get(seed.manifest.projectSlug) ?? seed.manifest.reviewStatus
    })),
    generatedAt: input.generatedAt
  };
}

export function getEla2TeacherResourceMap(courseId: Ela2CourseId): ReadonlyMap<
  string,
  { projectSlug: string; resource: EnglishResourceDispositionV2 }
> {
  const rows: Array<[string, { projectSlug: string; resource: EnglishResourceDispositionV2 }]> = [];
  for (const unit of getEla2CourseDefinition(courseId).units) {
    for (const resourceItem of unit.resources) {
      rows.push([resourceItem.source.replace(/\\/g, "/"), { projectSlug: unit.projectSlug, resource: resourceItem }]);
    }
  }
  return new Map(rows);
}
