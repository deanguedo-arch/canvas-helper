import type {
  EnglishActivityDefinition,
  EnglishActivityEvidencePolicy,
  EnglishActivityProfileV1,
  EnglishCourseArchiveV1,
  EnglishComponentOverride,
  EnglishCourseManifestV1,
  EnglishCourseUnitV1,
  EnglishLessonSelectorV2,
  EnglishResourceDispositionV2,
  EnglishUnitRecipe,
  EnglishUnitRecipeV1,
  EnglishUnitRecipeV2
} from "./types.js";
import { ensureStandardEnglishWritingProfile } from "./writing-sequence-renderer.js";
import type { EnglishUnitSeed } from "./course-seeds.js";
import { MERCHANT_FOUNDATION_LESSON_IDS } from "./merchant-foundation-lessons.js";

export const ELA10_COURSE_ID = "ela10-1";
export const ELA10_PROFILE_ID = "next-step-english";
export const ELA10_PROFILE_VERSION = "next-step-english-v3-ela10";
export const ELA10_FILM_LESSON_DONOR_ARCHIVE = "projects/resources/ela20-1/_sources/de70945ff9b907b1d63e719c890140bd69c65051f85a47c5ef657f715138f36c.zip";
export const ELA10_FILM_DONOR_UNIT_ID = "53042";
export const ELA10_FILM_DONOR_LESSON_SELECTORS: EnglishLessonSelectorV2[] = [
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
export const ELA10_FILM_DONOR_LESSON_IDS = ELA10_FILM_DONOR_LESSON_SELECTORS.map((selector) => selector.itemId);

function unit(projectSlug: string, unitTitle: string, profile: EnglishCourseUnitV1["activityProfile"], brightspaceUnitIds: string[], teacherFolder: string, selectors: EnglishLessonSelectorV2[]): EnglishUnitSeed {
  return {
    manifest: { projectSlug, unitTitle, recipePath: `projects/${projectSlug}/meta/english-unit.json`, profileVersion: ELA10_PROFILE_VERSION, activityProfile: profile, brightspaceUnitIds, reviewStatus: "needs-review" },
    primaryBrightspaceUnitId: brightspaceUnitIds[0]!, teacherFolder, selectors, createRecipe: true
  };
}

const shortSeed = unit("ela10-1-short-stories", "Short Stories", "short-fiction", ["1473027"], "UNIT 1 Short Stories", [
  { itemId: "1473061", title: "What Do Good Readers Do?", disposition: "include" },
  { itemId: "1473074", title: "Reading Strategies", disposition: "include" },
  { itemId: "1473069", title: "Literary Devices", disposition: "include" },
  { itemId: "1473049", title: "Annotating Readings", disposition: "include" },
  { itemId: "1473045", title: "Storytelling", disposition: "include" },
  { itemId: "1473046", title: "Reading Short Stories", disposition: "include" },
  { itemId: "1473054", title: "Short Story Terms", disposition: "include" },
  { itemId: "1473055", title: "Characters", disposition: "include" },
  { itemId: "1473056", title: "Setting", disposition: "include" },
  { itemId: "1473057", title: "Endings", disposition: "include" },
  { itemId: "1473058", title: "Conflict", disposition: "include" },
  { itemId: "1473059", title: "Point of View", disposition: "include" },
  { itemId: "1473053", title: "Writing a Short Story Analysis", disposition: "include" },
  { itemId: "1473064", title: "Literary Terms Review", disposition: "include" },
  { itemId: "1473037", title: "Unit 2 Assessment", disposition: "exclude", includeChildren: true, reason: "Assessment branch is excluded from the instructional unit." }
]);

const merchantSeed = unit("ela10-1-shakespeare-merchant-of-venice", "Shakespearean Drama - The Merchant of Venice", "shakespeare-drama", ["1473028"], "UNIT 2 Shakespeare", [
  { itemId: "1473108", title: "Who is William Shakespeare?", disposition: "exclude", reason: "Replaced by the richer CBE ELA 10-1 and Othello-derived Shakespeare foundation component." },
  { itemId: "1473109", title: "The Globe Theatre", disposition: "exclude", reason: "Replaced by the richer CBE ELA 10-1 and Othello-derived Shakespeare foundation component." },
  { itemId: "1473110", title: "Shakespeare's Language", disposition: "exclude", reason: "Replaced by the richer CBE ELA 10-1 and Othello-derived Shakespeare foundation component." },
  { itemId: "1473111", title: "Structure of Shakespeare's Plays", disposition: "exclude", reason: "Replaced by the richer CBE ELA 10-1 and Othello-derived Shakespeare foundation component." },
  { itemId: "1473078", title: "Introduction to Shakespeare", disposition: "exclude", reason: "Container page contains Romeo and Juliet-specific material; the teacher archive selects The Merchant of Venice." },
  { itemId: "1494110", title: "Shakespeare Resources", disposition: "exclude", reason: "Resource container points to Romeo and Juliet materials rather than the teacher-selected play." },
  { itemId: "1473086", title: "Romeo and Juliet: The Play", disposition: "exclude", includeChildren: true, reason: "Alternate play branch; The Merchant of Venice is teacher-selected." },
  { itemId: "1473083", title: "Romeo and Juliet Motif Project", disposition: "exclude", includeChildren: true, reason: "Alternate play project." },
  { itemId: "1473082", title: "Unit 4 Assessment", disposition: "exclude", includeChildren: true, reason: "Assessment branch is excluded." }
]);

const novelSeed = unit("ela10-1-novel-study", "Novel Study", "novel-study", ["1473031"], "UNIT 3 Novel", [
  { itemId: "1473151", title: "Synopsis and What to Consider Before Reading", disposition: "include" },
  { itemId: "1473041", title: "Choice of Novel", disposition: "exclude", reason: "Brightspace choice page conflicts with the two novels selected by the teacher archive." },
  { itemId: "1473116", title: "To Kill a Mockingbird", disposition: "exclude", reason: "Cover-only container; the instructional synopsis lesson is imported separately." },
  { itemId: "1473044", title: "Writing a Critical/Analytical Essay", disposition: "exclude", reason: "External assignment page is replaced by the shared ELA 10-1 Critical Essay profile." },
  { itemId: "1473117", title: "Indian Horse", disposition: "exclude", includeChildren: true, reason: "Not selected by the teacher archive." },
  { itemId: "1473118", title: "Purple Hibiscus", disposition: "exclude", includeChildren: true, reason: "Not selected by the teacher archive." },
  { itemId: "1473119", title: "Essay Topics", disposition: "exclude", reason: "Assessment topic page is excluded." },
  { itemId: "1473120", title: "Unit Assessment", disposition: "exclude", reason: "Assessment is excluded." }
]);

const fencesSeed = unit("ela10-1-modern-play-fences", "Modern Play - Fences", "modern-drama", ["1473026"], "UNIT 4 Modern Play", [
  { itemId: "1473101", title: "Considering Language", disposition: "include" },
  { itemId: "1473096", title: "How to Respond to Literature", disposition: "include" },
  { itemId: "1473100", title: "Writing a Personal Response to Text", disposition: "include" },
  { itemId: "1473035", title: "Creating Text", disposition: "exclude", reason: "Image-only module heading with no instructional lesson resource." },
  { itemId: "1473038", title: "Interpreting Text", disposition: "exclude", reason: "Empty module heading with no instructional lesson resource." },
  { itemId: "1473036", title: "Unit 1 Assessment", disposition: "exclude", includeChildren: true, reason: "Assessment branch is excluded." }
]);

const filmSeed = unit("ela10-1-film-study", "Film Study", "film-study", ["1473029"], "UNIT 5 Film Study", [
  { itemId: "1473091", title: "Film Study Explained", disposition: "include" },
  { itemId: "1473090", title: "Studying Film", disposition: "include" },
  { itemId: "1473093", title: "Critically Viewing a Film", disposition: "include" },
  { itemId: "1473123", title: "Lion", disposition: "include" },
  { itemId: "1473124", title: "Pay It Forward", disposition: "include" },
  { itemId: "1473089", title: "Intro to Film Study", disposition: "exclude", reason: "Empty module heading with no instructional lesson resource." },
  { itemId: "1473088", title: "Viewing a Film", disposition: "exclude", reason: "Image-only module heading with no instructional lesson resource." }
]);

export const ELA10_UNIT_SEEDS = [shortSeed, merchantSeed, novelSeed, fencesSeed, filmSeed] as const;

function activity(id: string, title: string, route: string, evidencePolicyIds: string[] = []): EnglishActivityDefinition {
  return { id, title, route, enabled: true, evidencePolicyIds };
}
function collection(id: string, activityId: string, scope: "activity" | "work" | "locator" = "activity"): EnglishActivityEvidencePolicy {
  return { id, activityId, saveMode: "collection", requiresExplicitSave: true, collectionScope: scope, contributionIdTemplate: `{projectSlug}:${activityId}:{${scope}Id}:collection` };
}
function individual(id: string, activityId: string): EnglishActivityEvidencePolicy {
  return { id, activityId, saveMode: "individual", requiresExplicitSave: true, contributionIdTemplate: `{projectSlug}:${activityId}:{entryId}` };
}

function shakespeareProfile(): EnglishActivityProfileV1 {
  return {
    schemaVersion: 1, kind: "shakespeare-drama", actIds: ["act-1", "act-2", "act-3", "act-4", "act-5"], sceneCount: 20, sideBySideReader: true,
    characterIds: ["antonio", "bassanio", "portia", "shylock", "jessica", "lorenzo"],
    writingTools: ["language-lab", "close-reading", "theme-builder", "critical-essay", "graphic-essay"], editorialStatus: "needs-editorial",
    activities: [
      activity("side-by-side-reader", "Side-by-Side Reader", "side-by-side", ["scene-evidence-entry"]),
      activity("play-materials", "The Merchant of Venice Materials", "play-materials"),
      activity("act-questions", "The Merchant of Venice Act Questions", "act-questions", ["act-question-collection"]),
      activity("character-notes", "Character Notes", "character-notes", ["character-dossier"]),
      activity("writing-studio", "Writing Studio", "writing-studio", ["writing-entry"]),
      activity("critical-essay", "Critical Essay", "critical-essay", ["essay-plan"]),
      activity("evidence-bank", "Evidence Bank", "evidence-bank")
    ],
    evidencePolicies: [individual("scene-evidence-entry", "side-by-side-reader"), collection("act-question-collection", "act-questions", "locator"), collection("character-dossier", "character-notes", "work"), individual("writing-entry", "writing-studio"), collection("essay-plan", "critical-essay")]
  };
}

function modernProfile(): EnglishActivityProfileV1 {
  return { schemaVersion: 1, kind: "modern-drama", actIds: ["act-one", "act-two"], characterIds: ["troy-maxson", "rose-maxson", "cory-maxson", "bono", "gabriel-maxson", "lyons-maxson"], criticalEssay: true,
    activities: [activity("script-reader", "Fences Script Reader", "script-reader"), activity("play-materials", "Fences Materials", "play-materials"), activity("act-questions", "Act and Scene Questions", "act-questions", ["question-collection"]), activity("character-conflict", "Character and Conflict Notes", "character-notes", ["dossier"]), activity("critical-essay", "Critical Essay", "critical-essay", ["essay-plan"]), activity("evidence-bank", "Evidence Bank", "evidence-bank")],
    evidencePolicies: [collection("question-collection", "act-questions", "locator"), collection("dossier", "character-conflict", "work"), collection("essay-plan", "critical-essay")]
  };
}

function novelProfile(): EnglishActivityProfileV1 {
  return { schemaVersion: 1, kind: "novel-study", novels: [{ id: "to-kill-a-mockingbird", title: "To Kill a Mockingbird", author: "Harper Lee" }, { id: "the-boy-in-the-striped-pyjamas", title: "The Boy in the Striped Pyjamas", author: "John Boyne" }], questionPhases: ["opening", "middle", "final"], genericQuestionCount: 24, writingTools: ["analytical-paragraph", "motif-string", "authors-intent", "critical-essay"],
    activities: [activity("critical-essay", "Critical Essay", "critical-essay", ["essay-plan"]), activity("reading-guide", "Reading Guide", "reading-guide", ["passage"]), activity("major-works-data", "Major Works Data Sheet", "major-works-data", ["major-works"]), activity("novel-questions", "Novel Study Questions", "novel-study-questions", ["questions"]), activity("writing-studio", "Writing Studio", "writing-studio", ["writing"]), activity("evidence-bank", "Evidence Bank", "evidence-bank")],
    evidencePolicies: [collection("essay-plan", "critical-essay", "work"), individual("passage", "reading-guide"), collection("major-works", "major-works-data", "work"), collection("questions", "novel-questions", "locator"), individual("writing", "writing-studio")]
  };
}

function filmProfile(): EnglishActivityProfileV1 {
  return { schemaVersion: 1, kind: "film-study", filmSelection: { mode: "pending" }, techniqueQuestionCount: 22, fullResponseQuestionCount: 18, criticalEssayFieldCount: 19, viewingGuide: true,
    activities: [activity("critical-essay", "Critical Essay", "critical-essay", ["essay"]), activity("viewing-guide", "Viewing Guide", "viewing-guide", ["moment", "synthesis"]), activity("film-questions", "Film Study Questions", "film-study-questions", ["questions"]), activity("film-room", "Film Room", "film-room"), activity("evidence-bank", "Evidence Bank", "evidence-bank"), activity("resources", "Resources", "resources")],
    evidencePolicies: [collection("essay", "critical-essay"), individual("moment", "viewing-guide"), collection("synthesis", "viewing-guide", "work"), collection("questions", "film-questions", "locator")]
  };
}

function resource(id: string, source: string, role: EnglishResourceDispositionV2["role"], disposition: EnglishResourceDispositionV2["disposition"], reason: string, destination?: string, title?: string): EnglishResourceDispositionV2 {
  return { id, source, role, disposition, reason, destination, title };
}

const merchantResources = [
  resource("mov-act-2-questions", "UNIT 2 Shakespeare/M of V Act 2 questions.docx", "question-set", "place", "Teacher-selected Act 2 questions.", "act-questions"),
  resource("mov-act-questions", "UNIT 2 Shakespeare/MOV Act Questions.pdf", "question-set", "place", "Teacher-selected act questions.", "act-questions"),
  resource("mov-questions", "UNIT 2 Shakespeare/MOV questions.pdf", "question-set", "exclude", "Exact byte-identical duplicate of MOV Act Questions.pdf; excluded to prevent repeated learner questions.", "act-questions"),
  resource("mov-graphic-essay", "UNIT 2 Shakespeare/MOV Graphic Essay.docx", "supporting-resource", "place", "Teacher-selected Graphic Essay planner.", "writing-studio"),
  resource("mov-resources", "UNIT 2 Shakespeare/MOV Resources.pdf", "supporting-resource", "place", "Teacher-selected play resources.", "play-materials"),
  resource("mov-imagery", "UNIT 2 Shakespeare/MOV imagery.pdf", "supporting-resource", "place", "Teacher-selected imagery activity.", "writing-studio"),
  resource("mov-act-3-text", "UNIT 2 Shakespeare/The Merchant of Venice3.docx", "question-set", "place", "Teacher-supplied Act 3 question worksheet.", "act-questions", "The Merchant of Venice Act 3 Questions"),
  resource("mov-act-4-text", "UNIT 2 Shakespeare/The Merchant of Venice.4x.docx", "question-set", "place", "Teacher-supplied Act 4 trial worksheet.", "act-questions", "The Merchant of Venice Act 4 Trial Questions"),
  resource("mov-act-5-text", "UNIT 2 Shakespeare/The Merchant of Venice V.docx", "question-set", "place", "Teacher-supplied Act 5 question worksheet.", "act-questions", "The Merchant of Venice Act 5 Questions")
];

const novelResources = [
  resource("major-works-data", "UNIT 3 Novel/Major Works Data Sheet.docx", "supporting-resource", "place", "Teacher-selected Major Works organizer.", "major-works-data"),
  resource("tkamb-overview", "UNIT 3 Novel/TKAMB Novel overview.pdf", "supporting-resource", "place", "Teacher-selected novel overview.", "resources"),
  resource("tkamb-questions", "UNIT 3 Novel/TKAMB Questions.pdf", "question-set", "place", "Teacher-selected novel questions.", "novel-study-questions"),
  resource("tkamb-chapter-questions", "UNIT 3 Novel/TKAMB-Chapter Questions.pdf", "question-set", "place", "Teacher-selected chapter questions.", "novel-study-questions"),
  resource("boy-striped-pyjamas-overview", "UNIT 3 Novel/The Boy in the Striped Pyjamas Overview.docx", "supporting-resource", "place", "Teacher-selected novel overview.", "resources"),
  resource("novel-hard-gate", "UNIT 3 Novel/NOVEL UNIT 10-1 HARD GATE Critical Response to Text.docx", "excluded-assessment", "exclude", "Hard-gate assessment is intentionally excluded.")
];

const fencesResources = [
  resource("fences-script", "UNIT 4 Modern Play/Fences script.pdf .pdf", "reading", "place", "Teacher-supplied play text.", "play-materials", "Fences Script"),
  resource("fences-acts-1-2", "UNIT 4 Modern Play/fences 1, 2.pdf", "question-set", "place", "Teacher-selected questions for Act I, Scene 2.", "act-questions", "Fences Act I, Scene 2 Questions"),
  resource("fences-acts-2-4", "UNIT 4 Modern Play/fences 2,4.pdf", "question-set", "place", "Teacher-selected questions for Act II, Scene 4.", "act-questions", "Fences Act II, Scene 4 Questions"),
  resource("fences-allusions", "UNIT 4 Modern Play/fences allusions.pdf", "supporting-resource", "place", "Teacher-selected allusions resource.", "play-materials"),
  resource("fences-objectives", "UNIT 4 Modern Play/fences objectives.pdf", "supporting-resource", "place", "Teacher-selected learning objectives.", "play-materials"),
  resource("fences-hard-gate", "UNIT 4 Modern Play/MODERN PLAY UNIT 10-1 HARD GATE Critical Response to Text.docx", "excluded-assessment", "exclude", "Hard-gate assessment is intentionally excluded.")
];

const filmResources = [resource("film-hard-gate", "UNIT 5 Film Study/FILM UNIT 10-1 HARD GATE Personal Response to Text Essay Prompt.docx", "excluded-assessment", "exclude", "Hard-gate assessment is intentionally excluded."), resource("film-choice", "profile://film-choice", "supporting-resource", "place", "The Brightspace course provides Lion and Pay It Forward as teacher choices.", "viewing-guide")];

const corrections = [
  { find: "English 20-1", replace: "English 10-1", reason: "Prevent donor-grade contamination." },
  { find: "ELA 20-1", replace: "ELA 10-1", reason: "Prevent donor-grade contamination." },
  { find: "English 30-1", replace: "English 10-1", reason: "Prevent donor-grade contamination." },
  { find: "ELA 30-1", replace: "ELA 10-1", reason: "Prevent donor-grade contamination." },
  { find: "Diploma Exam", replace: "course assessment", reason: "Remove Diploma framing." },
  { find: "Part A", replace: "written response", reason: "Remove Diploma framing." }
];

function buildV2(seed: EnglishUnitSeed, brightspaceArchivePath: string, teacherArchivePath: string, profile: EnglishActivityProfileV1, resources: EnglishResourceDispositionV2[], reviewItems: string[], customComponents: EnglishComponentOverride[] = []): EnglishUnitRecipeV2 {
  profile = ensureStandardEnglishWritingProfile(profile);
  const lessonIds = seed.selectors.filter((selector) => selector.disposition === "include").map((selector) => selector.itemId);
  return { schemaVersion: 2, projectSlug: seed.manifest.projectSlug, courseCode: "ELA 10-1", courseTitle: "English Language Arts 10-1", unitTitle: seed.manifest.unitTitle, profileVersion: ELA10_PROFILE_VERSION, status: "needs-review",
    source: { brightspaceZip: brightspaceArchivePath, teacherResourcesZip: teacherArchivePath, brightspaceUnitId: seed.primaryBrightspaceUnitId, teacherFolder: seed.teacherFolder, archiveRefs: { brightspace: "brightspace", teacherResources: "teacher-resources" }, lessonSelectors: seed.selectors.map((selector) => ({ ...selector })) },
    activityProfile: profile, lessonOrder: lessonIds, topLevelLessonOrder: lessonIds, lessonGroups: [{ id: "unit-lessons", title: seed.manifest.unitTitle, lessonIds }], readings: [], placements: [], analysisTerms: [], analysisExamples: [], resourceDispositions: resources, excludedFiles: resources.filter((item) => item.disposition === "exclude").map((item) => ({ file: item.source, reason: item.reason })), wordingCorrections: corrections,
    mediaPolicy: { verifiedAt: "not-reviewed", allowedYouTubeIds: [], blockedYouTubeIds: [], approvedExternalUrls: [], externalUrlRewrites: {} }, customComponents, acceptance: { requiredRoutes: profile.activities.filter((item) => item.enabled).map((item) => item.route), requiredActivityIds: profile.activities.filter((item) => item.enabled).map((item) => item.id), reviewItems }
  };
}

function merchantRecipe(brightspaceArchivePath: string, teacherArchivePath: string): EnglishUnitRecipeV2 {
  const recipe = buildV2(
    merchantSeed,
    brightspaceArchivePath,
    teacherArchivePath,
    shakespeareProfile(),
    merchantResources,
    [
      "Editorially review all 20 locally stored plain-language companion scenes.",
      "Review the 86 mapped teacher questions and the supplied Graphic Essay instructions.",
      "Review the six consolidated Shakespeare foundation lessons before final export."
    ],
    [
      { id: "merchant-side-by-side-data", slot: "custom:side-by-side-companion", mode: "extend", source: "workspace/components/shakespeare-side-by-side/scenes.json", enabled: true },
      { id: "merchant-shakespeare-foundation-lessons", slot: "custom:shakespeare-foundation-lessons", mode: "replace", source: "workspace/components/shakespeare-foundation-lessons/lessons.json", assetRoot: "workspace/assets/custom/shakespeare-foundations", enabled: true }
    ]
  );
  const lessonIds = [...MERCHANT_FOUNDATION_LESSON_IDS];
  return {
    ...recipe,
    lessonOrder: lessonIds,
    topLevelLessonOrder: lessonIds,
    lessonGroups: [{ id: "unit-lessons", title: "Shakespearean Drama - The Merchant of Venice", lessonIds }]
  };
}

function filmRecipe(brightspaceArchivePath: string, teacherArchivePath: string): EnglishUnitRecipeV2 {
  const recipe = buildV2(
    filmSeed,
    brightspaceArchivePath,
    teacherArchivePath,
    filmProfile(),
    filmResources,
    [
      "Review the nine ELA 20-1 Feature Film donor lessons after their ELA 10-1 wording adaptation.",
      "Validate all inherited film-study media and fallback links."
    ]
  );
  return {
    ...recipe,
    source: {
      ...recipe.source,
      brightspaceZip: ELA10_FILM_LESSON_DONOR_ARCHIVE,
      brightspaceUnitId: ELA10_FILM_DONOR_UNIT_ID,
      archiveRefs: { brightspace: "feature-film-20-1-donor", teacherResources: "teacher-resources" },
      lessonSelectors: ELA10_FILM_DONOR_LESSON_SELECTORS.map((selector) => ({ ...selector }))
    },
    lessonOrder: [...ELA10_FILM_DONOR_LESSON_IDS],
    topLevelLessonOrder: [...ELA10_FILM_DONOR_LESSON_IDS],
    lessonGroups: [{ id: "unit-lessons", title: "Film Study", lessonIds: [...ELA10_FILM_DONOR_LESSON_IDS] }],
    wordingCorrections: [
      ...recipe.wordingCorrections,
      { find: "it's narrative", replace: "its narrative", reason: "Correct inherited grammar in the Feature Film donor lesson." },
      { find: "critically evaluation", replace: "critically evaluating", reason: "Correct inherited grammar in the Feature Film donor lesson." },
      { find: "much more to analyzed", replace: "much more to analyze", reason: "Correct inherited grammar in the Feature Film donor lesson." },
      { find: "resemble the basic elements", replace: "resembles the basic elements", reason: "Correct inherited grammar in the Feature Film donor lesson." },
      { find: "Setting Characters", replace: "Setting, Characters", reason: "Restore missing punctuation in the Feature Film donor lesson." },
      { find: "The way in which the short is framed", replace: "The way in which the shot is framed", reason: "Correct an inherited film-term typo." },
      { find: "butfigurative", replace: "but figurative", reason: "Restore missing spacing in the mise-en-scene lesson." },
      { find: "student offilm", replace: "student of film", reason: "Restore missing spacing in the mise-en-scene lesson." }
    ],
    mediaPolicy: {
      verifiedAt: "2026-07-14",
      allowedYouTubeIds: ["BXAr2yiYCV4", "3Sr-vxVaY_M", "G45X6fSk1do", "sgiZb8jJgF8"],
      blockedYouTubeIds: [],
      approvedExternalUrls: [],
      externalUrlRewrites: {}
    }
  };
}

function projectRelativeArchive(repoRelativePath: string) {
  return repoRelativePath.startsWith("projects/") ? `../${repoRelativePath.slice("projects/".length)}` : repoRelativePath;
}

type Ela10AnalysisPair = readonly [evidenceMoment: string, analysis: string];

export const ELA10_SHORT_STORY_ANALYSIS_TERMS = [
  { id: "characterization", category: "Interpreting Character", label: "Characterization", definition: "The methods a writer uses to reveal character through action, dialogue, description, thought, and relationships." },
  { id: "conflict", category: "Interpreting Plot", label: "Conflict", definition: "The struggle between opposing forces that creates pressure and drives a text." },
  { id: "irony", category: "Layers of Meaning", label: "Irony", definition: "A contrast between appearance and reality, expectation and result, or words and intended meaning." },
  { id: "setting", category: "Interpreting Context", label: "Setting", definition: "The time, place, social conditions, and atmosphere in which a text occurs." },
  { id: "symbol", category: "Layers of Meaning", label: "Symbol", definition: "A concrete detail that carries meaning beyond its literal role." },
  { id: "theme", category: "Layers of Meaning", label: "Theme", definition: "A developed idea a text suggests about people, society, or experience." },
  { id: "tone", category: "Word Choice and Voice", label: "Tone", definition: "The creator's attitude toward the subject or audience, shaped by language and detail." },
  { id: "point-of-view", category: "Narration", label: "Point of View", definition: "The perspective through which a text's events and ideas are presented." }
] as const;

export const ELA10_SHORT_STORY_MANAGED_ANALYSIS_TERM_IDS = new Set<string>(
  ELA10_SHORT_STORY_ANALYSIS_TERMS.map((term) => term.id)
);

const ELA10_SHORT_STORY_ANALYSIS_MATRIX: Record<string, Record<string, Ela10AnalysisPair[]>> = {
  "cask-of-amontillado": {
    characterization: [
      ["Montresor calmly describes planning a revenge that must punish Fortunato without bringing punishment upon himself.", "His careful conditions and controlled narration characterize him as calculating, proud, and more concerned with a perfect plan than with moral restraint."],
      ["Fortunato follows Montresor away from the carnival because he wants to prove his expertise and dismiss Luchesi's judgment.", "Fortunato's pride in his knowledge makes him easy to manipulate; Montresor succeeds by turning a valued part of Fortunato's identity into a weakness."]
    ],
    conflict: [
      ["Montresor hides his intention while guiding Fortunato toward the place prepared for his revenge.", "The person-against-person conflict depends on unequal knowledge: Montresor controls the route and purpose while Fortunato believes they are sharing a friendly errand."],
      ["Once Fortunato is chained in the recess, his disbelief, pleading, and final silence confront Montresor's determination to finish the wall.", "The physical confinement makes the conflict irreversible and reveals how completely Montresor has replaced dialogue or justice with domination."]
    ],
    irony: [
      ["Montresor repeatedly appears concerned for Fortunato's health while leading him deeper into the catacombs.", "The false concern creates dramatic and verbal irony because the reader recognizes that the kindness is part of the murder plan."],
      ["Fortunato's name suggests good fortune, yet he is dressed for celebration while unknowingly walking toward his death.", "The contrast between his name, the carnival setting, and his fate intensifies the story's grim reversal of celebration into burial."]
    ],
    setting: [
      ["The story moves from a crowded carnival into damp, twisting catacombs lined with bones and affected by niter.", "The movement from public celebration to hidden confinement mirrors Fortunato's loss of safety and makes Montresor's private violence possible."],
      ["The underground passages grow narrower and more remote as the two men continue toward the Amontillado.", "The deepening setting creates claustrophobia and visually represents how every step reduces Fortunato's chance of escape."]
    ],
    symbol: [
      ["Fortunato's motley costume and bells remain visible and audible as Montresor's trap closes.", "The costume symbolizes the pride and foolish confidence Montresor exploits, while the bells turn a carnival image into a disturbing reminder of Fortunato's helplessness."],
      ["Montresor describes a family coat of arms built around a foot crushing a serpent and a motto promising retaliation.", "The emblem symbolizes a family identity organized around pride and revenge, helping explain the code Montresor uses to justify his actions." ]
    ],
    theme: [
      ["Fortunato's certainty that his judgment is superior keeps him following Montresor despite repeated warnings and discomfort.", "The story suggests that pride can narrow a person's judgment until a strength such as expertise becomes a path to self-destruction."],
      ["Montresor narrates the murder decades later without clearly identifying the original insult or expressing remorse.", "By withholding a proportionate cause and presenting revenge as a technical achievement, the story exposes how vengeance can erase empathy and moral perspective."]
    ],
    tone: [
      ["Friendly conversation, carnival clothing, and talk of rare wine gradually give way to bones, chains, darkness, and masonry.", "The shift from playful cordiality to gothic dread lets the reader feel the trap closing before Fortunato fully understands it."],
      ["Montresor reports the final stages of the wall in calm, precise language.", "The restrained diction creates a chilling tone because the narrator's composure contrasts with the cruelty and panic of the scene." ]
    ],
    "point-of-view": [
      ["Montresor tells the story in first person and decides which details about the insult, plan, and victim the reader receives.", "The limited viewpoint gives direct access to his reasoning but no independent confirmation that his revenge was justified."],
      ["The narrator looks back on the event after many decades while still presenting the murder as a successful act.", "The retrospective point of view invites readers to question his reliability, motives, and lack of remorse instead of accepting his interpretation as fact."]
    ]
  },
  "flight-into-danger": {
    characterization: [
      ["Early conversation reveals that Spencer once flew fighters, although he describes himself as rusty and treats the experience casually.", "The understated disclosure prepares for the crisis and characterizes him as knowledgeable without making him seem eager for authority."],
      ["Dr. Baird identifies the illness, organizes treatment, and gives difficult information without abandoning the passengers.", "His actions characterize him through professional responsibility: he remains practical and caring while the situation grows more dangerous."]
    ],
    conflict: [
      ["Food poisoning incapacitates many passengers and both pilots even though the aircraft itself is functioning normally.", "The central external conflict places the people aboard against a medical emergency in a setting where escape and replacement are impossible."],
      ["Spencer must control his fear and use old fighter-pilot experience to fly an unfamiliar passenger aircraft.", "His internal conflict between doubt and duty gives the landing emotional weight; survival requires him to act before he can feel fully prepared." ]
    ],
    irony: [
      ["The weather is calm, the plane has fuel, and its machinery is sound, yet the flight becomes a mortal emergency.", "The reversal challenges the expectation that an aviation disaster must begin with weather or mechanical failure."],
      ["A routine meal, not the aircraft, removes the trained pilots while leaving a passenger to take control.", "The ordinary source of danger is ironic because the passengers trust the meal without concern while treating the complex machine as the obvious risk." ]
    ],
    setting: [
      ["Most of the crisis unfolds inside a crowded aircraft at night, high above the ground and far from immediate help.", "The enclosed setting intensifies suspense because every passenger shares the same danger and no one can simply leave the scene."],
      ["The action shifts between the cabin, flight deck, airport control rooms, and landing tower.", "The connected settings show that survival depends on coordinated work across distance, with radio communication joining people who cannot see one another." ]
    ],
    symbol: [
      ["The empty pilot seats and unfamiliar controls confront Spencer when he enters the flight deck.", "They symbolize the responsibility suddenly transferred to him: technical equipment becomes a visible measure of the role he must accept."],
      ["The radio link carries instructions from experienced people on the ground to Spencer in the air.", "The radio functions as a symbol of cooperation and trust, turning separated individuals into a temporary team." ]
    ],
    theme: [
      ["The doctor, stewardess, Spencer, controllers, and Treleaven each contribute different knowledge to the rescue.", "The drama develops the idea that survival in a crisis depends on cooperation and specialized skill rather than on one effortless hero."],
      ["Spencer succeeds despite uncertainty, then focuses on the flaws in his landing instead of celebrating himself.", "His response suggests that courage is responsible action under pressure, not confidence, perfection, or the absence of fear." ]
    ],
    tone: [
      ["The flight begins with relaxed travel talk, football jokes, and ordinary meal service before illness spreads through the cabin.", "The tonal change from casual to urgent makes the danger feel sudden and disrupts the passengers' sense of routine safety."],
      ["During the approach, short technical instructions and precise references to controls replace most casual conversation.", "The controlled diction creates focused suspense: every detail matters, while calm language holds panic at the edge of the scene." ]
    ],
    "point-of-view": [
      ["As a drama, the text shifts among passengers, the flight deck, and airport personnel rather than remaining inside one character's thoughts.", "The changing dramatic perspective lets the audience understand the full emergency before some characters do, creating suspense through unequal knowledge."],
      ["Stage directions show gestures, sounds, locations, and actions but rarely explain private thoughts directly.", "Readers must infer fear, competence, and changing relationships from dialogue and behaviour, making performance details essential evidence." ]
    ]
  },
  "flying-machine": {
    characterization: [
      ["The Emperor recognizes the beauty of the flying invention but immediately imagines how an enemy could use it against the Great Wall.", "His divided response characterizes him as perceptive and protective, but also fearful enough to destroy what he cannot control."],
      ["The inventor proudly demonstrates the machine and expects wonder rather than punishment.", "His open enthusiasm characterizes him as imaginative and trusting, which places him at a fatal disadvantage before a ruler focused on possible threats." ]
    ],
    conflict: [
      ["The inventor's desire to create and fly collides with the Emperor's duty to protect the empire from possible attack.", "The person-against-person conflict represents a larger struggle between innovation and security."],
      ["The Emperor admires the miracle while fearing the consequences of allowing knowledge of it to survive.", "His internal conflict complicates the decision: he destroys something beautiful precisely because he understands its power." ]
    ],
    irony: [
      ["The inventor presents a beautiful miracle and receives death instead of honour.", "The result reverses both his expectation and the usual idea that discovery brings progress or reward."],
      ["Natural birds remain free above the empire while the human achievement of flight is burned and silenced.", "The contrast is ironic because the ruler accepts freedom in nature but treats the same possibility in human hands as intolerable." ]
    ],
    setting: [
      ["The story takes place in an ancient empire protected by the Great Wall and governed by one ruler's command.", "This political and historical setting makes the invention a military concern and gives the Emperor enough power to erase it immediately."],
      ["A peaceful morning and beautiful garden surround the discovery before the scene turns toward execution and destruction.", "The serene setting heightens the shock of the decision and keeps beauty beside violence throughout the story." ]
    ],
    symbol: [
      ["The flying machine lifts a person above the ground through imagination and skill.", "It symbolizes human creativity and freedom, but also the unpredictable power that new knowledge can give its users."],
      ["The Great Wall represents the Emperor's promise to preserve order and keep danger outside the empire.", "Its protective meaning also reveals the limits of his thinking: fear of anything that can cross the wall leads him to isolate and suppress." ]
    ],
    theme: [
      ["The Emperor destroys both the invention and its creator because another person might reproduce the idea for harmful purposes.", "The story suggests that fear of possible misuse can cause authority to sacrifice creativity, knowledge, and individual life."],
      ["The invention is capable of beauty and danger at the same time.", "The text develops the idea that technology has no single moral meaning; its value depends on the purposes people imagine and choose for it." ]
    ],
    tone: [
      ["The opening treats flight with lyrical wonder before the Emperor's questions turn toward walls, enemies, and secrecy.", "The changing diction moves the tone from amazement to unease as the same invention is reinterpreted as a threat."],
      ["The Emperor discusses destruction in calm, formal language rather than in an angry outburst.", "The controlled tone makes the violence more disturbing because it presents a human death as a measured administrative solution." ]
    ],
    "point-of-view": [
      ["The third-person narration stays close to the Emperor's observations and reasoning after the machine appears.", "Readers can follow both his wonder and fear, which makes his decision understandable without requiring them to approve it."],
      ["The inventor's hopes and private thoughts receive far less attention than the ruler's calculations.", "This imbalance reflects the power structure of the story: the person with authority controls not only the outcome but also the interpretation that matters." ]
    ]
  },
  "harrison-bergeron": {
    characterization: [
      ["George wears weights and a mental-handicap radio, obeys the law, and repeatedly loses any thought that might become critical.", "His behaviour characterizes him as intelligent and potentially strong, but trained into passivity by punishment and interruption."],
      ["Harrison tears away his handicaps, declares himself an emperor, and transforms the television studio into a stage for music and dance.", "His actions characterize him as courageous and imaginative but also grandiose, preventing the rebellion from becoming a simple portrait of perfect heroism." ]
    ],
    conflict: [
      ["Harrison rejects the government's enforced handicaps while Diana Moon Glampers uses lethal force to restore control.", "The external conflict places individual excellence and freedom against a state that treats difference as a crime."],
      ["George's natural capacity for thought and grief is repeatedly broken by sounds from his government radio.", "The internal struggle shows political control operating inside the mind, preventing him from sustaining either resistance or mourning." ]
    ],
    irony: [
      ["Laws intended to make everyone equal require masks, weights, mental disruption, imprisonment, and murder.", "The outcome is situationally ironic because a principle associated with fairness produces cruelty and extreme inequality of power."],
      ["Harrison's dance is broadcast publicly, but his parents cannot preserve or act on what they witness.", "The moment that should awaken viewers is immediately erased by violence, distraction, and damaged memory." ]
    ],
    setting: [
      ["The story is set in 2081 after constitutional amendments have made enforced sameness a national system.", "The dystopian future lets Vonnegut exaggerate a familiar ideal so readers can examine the danger of applying it without limits."],
      ["George and Hazel watch the central rebellion and killing from an ordinary living room through television.", "The domestic setting turns public tragedy into passive entertainment and shows how political violence can enter a home without producing action." ]
    ],
    symbol: [
      ["Weights, masks, altered voices, and mental radios are imposed on anyone whose abilities exceed the average.", "The handicaps symbolize enforced conformity and make the social cost of suppressing difference physically visible."],
      ["Harrison and the ballerina remove their restraints and rise during their dance.", "Their movement symbolizes a brief release of beauty, excellence, and human possibility before the government destroys it." ]
    ],
    theme: [
      ["The government can create sameness only by weakening citizens and killing those who refuse restraint.", "The story argues that equality of outcome becomes destructive when it requires the removal of freedom, ability, and individuality."],
      ["George and Hazel witness their son's death but cannot remember or think about it long enough to respond.", "The ending develops the idea that authoritarian systems endure by damaging attention, memory, and the ability to care." ]
    ],
    tone: [
      ["The narrator describes absurd handicaps and oppressive laws in a flat, matter-of-fact voice.", "The deadpan tone creates satire by treating a horrifying society as if its rules were ordinary and reasonable."],
      ["The dance becomes briefly romantic and exhilarating before Diana Moon Glampers enters with a weapon.", "The violent tonal reversal makes the destruction of beauty immediate and prevents the reader from settling into hope." ]
    ],
    "point-of-view": [
      ["The third-person narration centers much of the story on George and Hazel's interrupted awareness.", "Their limited understanding makes the reader notice connections they cannot hold, creating frustration and dramatic irony."],
      ["The narrator reports the society's rules with apparent neutrality while choosing details that reveal their absurdity.", "This gap between neutral delivery and disturbing content guides readers toward criticism without stating the argument directly." ]
    ]
  },
  "i-am-a-rock": {
    characterization: [
      ["The speaker repeatedly defines himself as strong, separate, and protected from other people.", "The repeated self-description characterizes him as defensive; the effort required to insist on independence suggests unresolved hurt beneath the confidence."],
      ["He surrounds himself with books, poetry, walls, and a private room instead of relationships.", "These choices reveal a person who values control and safety, but whose protection depends on withdrawing from experiences that might challenge him." ]
    ],
    conflict: [
      ["The speaker wants protection from pain but continues to remember love, friendship, and feelings he claims to reject.", "The internal conflict between emotional safety and human connection gives the song tension beneath its repetitive certainty."],
      ["Past hurt pushes the speaker toward isolation while memory keeps the rejected emotions present.", "The conflict shows that refusing contact can control behaviour without fully removing longing or pain." ]
    ],
    irony: [
      ["The speaker claims to have no need for friendship or love, yet spends the song explaining those relationships and the pain they caused.", "The sustained attention contradicts the claim of indifference and reveals how strongly connection still shapes him."],
      ["He presents rock-like strength and island-like separation as ways to avoid suffering.", "The claim is ironic because a human speaker must feel pain in order to desire such complete protection from it." ]
    ],
    setting: [
      ["The song begins in a dark winter month with the speaker alone, looking from a window onto a snow-covered street.", "The cold, silent setting externalizes his emotional withdrawal and establishes distance before he explains it."],
      ["The speaker remains inside a room while the outside world is visible but separate.", "The boundary between room and street makes isolation spatial: he can observe life without participating in it." ]
    ],
    symbol: [
      ["The speaker repeatedly compares himself to a rock and an island.", "The central symbols represent strength and independence, but also emotional hardness, separation, and the absence of mutual support."],
      ["Walls, a fortress, armour, and a womb build a pattern of enclosing protective images.", "Together these symbols show safety becoming confinement; each layer blocks harm while also blocking contact." ]
    ],
    theme: [
      ["The speaker avoids love and friendship because connection has caused pain.", "The song suggests that eliminating vulnerability may reduce immediate hurt but also removes intimacy, growth, and belonging."],
      ["Books and poetry protect the speaker while also helping him remain hidden from other people.", "The text develops the idea that art can offer real comfort, yet it can become avoidance when it replaces rather than supports human connection." ]
    ],
    tone: [
      ["Absolute statements about needing no one are repeated alongside memories of crying and feelings that have supposedly died.", "The forceful diction creates a defensive tone whose certainty is undercut by sadness."],
      ["Winter, silence, snow, darkness, and enclosure dominate the imagery.", "The sensory pattern creates a lonely, emotionally cold tone even when the speaker describes his isolation as safety." ]
    ],
    "point-of-view": [
      ["The song uses first person, allowing the speaker to control every explanation of his past and present choices.", "The intimate viewpoint gives direct access to his self-protective reasoning but no outside voice to confirm that isolation is working."],
      ["The repeated refrain returns to the speaker's chosen identity after each memory or explanation.", "The structure makes the point of view feel self-persuading, as though the speaker must repeatedly restore the story he tells about himself." ]
    ]
  }
};

const ELA10_SHORT_STORY_ANALYSIS_TERM_LABELS = new Map<string, string>(
  ELA10_SHORT_STORY_ANALYSIS_TERMS.map((term) => [term.id, term.label])
);

export const ELA10_SHORT_STORY_ANALYSIS_EXAMPLES = Object.entries(ELA10_SHORT_STORY_ANALYSIS_MATRIX).flatMap(
  ([readingId, terms]) =>
    Object.entries(terms).flatMap(([termId, examples]) =>
      examples.map(([evidenceMoment, analysis]) => ({
        readingId,
        termId,
        term: ELA10_SHORT_STORY_ANALYSIS_TERM_LABELS.get(termId) ?? termId,
        evidenceMoment,
        analysis
      }))
    )
);

function shortRecipe(brightspaceArchivePath: string, teacherArchivePath: string): EnglishUnitRecipeV1 {
  const readings = [
    { id: "cask-of-amontillado", title: "The Cask of Amontillado", author: "Edgar Allan Poe", kind: "short-fiction" as const, group: "Short Fiction", readingFile: "Cask of Amontillado.pdf", questionFile: "Cask of Amontillado Quiz.pdf", questionPrompts: [
      "Explain why the narrator sets out to cause Fortunato's death.",
      "State the time of year in which the story takes place.",
      "Describe what, besides wine, is kept in the catacombs.",
      "Why are Montresor and Fortunato not noticed or recognized on the way to Montresor's home?",
      "Describe the secret sign Fortunato uses to identify membership in the brotherhood of masons.",
      "Identify two traits that make Fortunato vulnerable to Montresor's revenge. Explain each one.",
      "Identify two things Montresor says or does to manipulate Fortunato into entering and continuing through the catacombs.",
      "Explain the irony of Montresor having no servants at home.",
      "Explain the irony of Fortunato declaring that Luchesi is an ignoramus.",
      "Explain the irony of Fortunato's name."
    ].map((prompt, index) => ({ id: String(index + 1), prompt })) },
    { id: "flight-into-danger", title: "Flight into Danger", author: "Arthur Hailey", kind: "short-fiction" as const, group: "Drama and Suspense", readingFile: "Flight into Danger.pdf", questionFile: "Flight_Into_Danger_Questions.pdf" },
    { id: "flying-machine", title: "The Flying Machine", author: "Ray Bradbury", kind: "short-fiction" as const, group: "Short Fiction", readingFile: "Flying Machine.pdf", questionFile: "Flying Machine.pdf", questionPrompts: ["Explain how the Emperor defines the word miracle.", "Choose three adjectives that describe the Emperor. Support each with a quotation and interpretation.", "What does the Emperor hope to accomplish, and are his actions those of a good leader?", "Explain the significance of the Emperor's final words about the birds.", "Select one sentence that best expresses the story's message and justify your choice."].map((prompt, index) => ({ id: String(index + 1), prompt })) },
    { id: "harrison-bergeron", title: "Harrison Bergeron", author: "Kurt Vonnegut Jr.", kind: "short-fiction" as const, group: "Short Fiction", readingFile: "Harrison Bergeron Overview.pdf", questionFile: "Harrison Bergeron Questions.pdf", questionPrompts: ["How does dialogue shape Diana Moon Glampers, George, Harrison, and Hazel?", "What might Vonnegut suggest about the potential of free humans?", "How is Harrison presented as superhuman, and how is the result an ironic reversal of a traditional hero story?", "Is Diana Moon Glampers handicapped? Explain.", "How do schools resemble the Handicapper General's office?", "Why do you think Vonnegut wrote this story?"].map((prompt, index) => ({ id: String(index + 1), prompt })) },
    { id: "i-am-a-rock", title: "I Am a Rock", author: "Paul Simon", kind: "paired-perspective" as const, group: "Poetry and Song", readingFile: "I am a Rock Text.pdf", questionFile: "I am a Rock Questions.pdf", questionPrompts: ["Why is a fortress that none may penetrate both positive and negative, and why is a rock the dominant metaphor?", "How can books and poetry protect someone?", "Which two adjectives best describe the speaker? Explain.", "What has caused the speaker to isolate himself, and how might those experiences have hurt him?", "What modern luxuries might a person use to protect themselves from the world?", "How do the lyrics contradict John Donne's message, and how does the ending affect the song's meaning?", "Plan an album-cover illustration and explain how one visual element communicates your message."].map((prompt, index) => ({ id: String(index + 1), prompt })) }
  ];
  const lessonOrder = shortSeed.selectors.filter((item) => item.disposition === "include").map((item) => item.title!);
  return { schemaVersion: 1, projectSlug: shortSeed.manifest.projectSlug, courseCode: "ELA 10-1", courseTitle: "Short Stories", unitTitle: "Unit 1: Short Stories", source: { brightspaceZip: projectRelativeArchive(brightspaceArchivePath), teacherResourcesZip: projectRelativeArchive(teacherArchivePath), brightspaceUnitId: "1473027", teacherFolder: "UNIT 1 Short Stories" }, lessonOrder, topLevelLessonOrder: ["What Do Good Readers Do?", "Storytelling", "Reading Short Stories", "Short Story Terms", "Writing a Short Story Analysis", "Literary Terms Review"], fictionElementsHub: { hubLesson: "Short Story Terms", contextLesson: "Reading Short Stories", childLessons: ["Characters", "Setting", "Endings", "Conflict", "Point of View", "Literary Devices", "Annotating Readings"] }, readings,
    placements: [
      { targetLesson: "Characters", readingIds: ["cask-of-amontillado", "harrison-bergeron"], questionRefs: [], purpose: "Compare how dialogue, pride, control, and conflict reveal character." },
      { targetLesson: "Setting", readingIds: ["cask-of-amontillado", "flight-into-danger"], questionRefs: [], purpose: "Explain how time, place, confinement, and danger shape action." },
      { targetLesson: "Conflict", readingIds: ["flying-machine", "harrison-bergeron", "i-am-a-rock"], questionRefs: [], purpose: "Trace conflicts between freedom, safety, authority, and isolation." },
      { targetLesson: "Point of View", readingIds: ["cask-of-amontillado", "i-am-a-rock"], questionRefs: [], purpose: "Evaluate how a speaker's perspective controls what the reader understands." },
      { targetLesson: "Writing a Short Story Analysis", readingIds: readings.map((reading) => reading.id), questionRefs: [], purpose: "Build an evidence-based interpretation from the assigned texts." }
    ],
    analysisTerms: ELA10_SHORT_STORY_ANALYSIS_TERMS.map((term) => ({ ...term })),
    analysisExamples: ELA10_SHORT_STORY_ANALYSIS_EXAMPLES.map((example) => ({ ...example })),
    excludedFiles: [{ file: "HARD GATE Blood Meridian.pdf", reason: "Hard-gate assessment is intentionally excluded." }], wordingCorrections: corrections, mediaPolicy: { verifiedAt: "not-reviewed", allowedYouTubeIds: [], blockedYouTubeIds: [], approvedExternalUrls: [], externalUrlRewrites: {} }
  };
}

export function createEla10RecipeSeeds(input: { brightspaceArchivePath: string; teacherArchivePath: string }): EnglishUnitRecipe[] {
  return [
    shortRecipe(input.brightspaceArchivePath, input.teacherArchivePath),
    merchantRecipe(input.brightspaceArchivePath, input.teacherArchivePath),
    buildV2(novelSeed, input.brightspaceArchivePath, input.teacherArchivePath, novelProfile(), novelResources, ["Confirm learner access to both novels; the primary novels are not included.", "Review profile-supplied enrichment questions alongside teacher question sheets."]),
    buildV2(fencesSeed, input.brightspaceArchivePath, input.teacherArchivePath, modernProfile(), fencesResources, ["Confirm redistribution and accessibility for the teacher-supplied Fences script.", "Review the extracted question collections before final export."]),
    filmRecipe(input.brightspaceArchivePath, input.teacherArchivePath)
  ];
}

export function createEla10CourseManifest(input: { archives: EnglishCourseArchiveV1[]; generatedAt: string; existingReviewStatuses?: ReadonlyMap<string, EnglishCourseUnitV1["reviewStatus"]> }): EnglishCourseManifestV1 {
  return { schemaVersion: 1, courseId: ELA10_COURSE_ID, courseCode: "ELA 10-1", courseTitle: "English Language Arts 10-1", profileId: ELA10_PROFILE_ID, profileVersion: ELA10_PROFILE_VERSION, archives: input.archives.map((archive) => ({ ...archive })), units: ELA10_UNIT_SEEDS.map((seed) => ({ ...seed.manifest, brightspaceUnitIds: [...seed.manifest.brightspaceUnitIds], reviewStatus: input.existingReviewStatuses?.get(seed.manifest.projectSlug) ?? seed.manifest.reviewStatus })), generatedAt: input.generatedAt };
}

export function getEla10TeacherResourceMap(): ReadonlyMap<string, { projectSlug: string; resource: EnglishResourceDispositionV2 }> {
  const rows: Array<[string, { projectSlug: string; resource: EnglishResourceDispositionV2 }]> = [];
  for (const [projectSlug, resources] of [[merchantSeed.manifest.projectSlug, merchantResources], [novelSeed.manifest.projectSlug, novelResources], [fencesSeed.manifest.projectSlug, fencesResources], [filmSeed.manifest.projectSlug, filmResources]] as const) {
    for (const item of resources) rows.push([item.source, { projectSlug, resource: item }]);
  }
  rows.push(["UNIT 1 Short Stories/HARD GATE Blood Meridian.pdf", { projectSlug: shortSeed.manifest.projectSlug, resource: resource("short-hard-gate", "UNIT 1 Short Stories/HARD GATE Blood Meridian.pdf", "excluded-assessment", "exclude", "Hard-gate assessment is intentionally excluded.") }]);
  for (const reading of ["Cask of Amontillado Quiz.pdf", "Cask of Amontillado.pdf", "Flight into Danger.pdf", "Flight_Into_Danger_Questions.pdf", "Flying Machine.pdf", "Harrison Bergeron Overview.pdf", "Harrison Bergeron Questions.pdf", "I am a Rock Questions.pdf", "I am a Rock Text.pdf"]) {
    rows.push([`UNIT 1 Short Stories/${reading}`, { projectSlug: shortSeed.manifest.projectSlug, resource: resource(`short-${reading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, `UNIT 1 Short Stories/${reading}`, /questions|quiz/i.test(reading) ? "question-set" : "reading", "place", "Teacher-selected Short Stories resource.") }]);
  }
  return new Map(rows);
}
