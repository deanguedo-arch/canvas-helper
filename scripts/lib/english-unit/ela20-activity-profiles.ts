import { safeId } from "./source.js";
import type {
  EnglishActivityField,
  EnglishActivityProfile,
  EnglishActivityQuestion,
  EnglishActivityQuestionSet,
  EnglishCriticalEssayProfile,
  EnglishFilmStudyProfile,
  EnglishMaterialHook,
  EnglishModernDramaProfile,
  EnglishNovelStudyProfile,
  EnglishShakespeareProfile,
  EnglishShakespeareScene,
  EnglishWritingTool
} from "./activity-profile-renderers.js";
import type {
  EnglishFilmStudyActivityProfile,
  EnglishModernDramaActivityProfile,
  EnglishNovelStudyActivityProfile,
  EnglishShakespeareDramaActivityProfile
} from "./types.js";

const COURSE_CODE = "ELA 20-1";
const FORBIDDEN_WORDING = /\bELA\s*30-1\b|\bDiploma(?:\s+Exam)?\b|\bPart\s+A\b|\b(?:soft|hard)\s+gate\b/i;

type Ela20ProfileBaseInput = {
  projectSlug: string;
  courseCode?: string;
  unitTitle?: string;
  evidenceBankRoute?: string;
  materials?: EnglishMaterialHook[];
};

export type Ela20CrucibleProfileInput = Ela20ProfileBaseInput & {
  actQuestionSets?: EnglishActivityQuestionSet[];
  configuration?: EnglishModernDramaActivityProfile;
};

export type Ela20MacbethProfileInput = Ela20ProfileBaseInput & {
  scenes: EnglishShakespeareScene[];
  actQuestionSets: EnglishActivityQuestionSet[];
  configuration?: EnglishShakespeareDramaActivityProfile;
};

export type Ela20NovelProfileInput = Ela20ProfileBaseInput & {
  questionSets?: EnglishActivityQuestionSet[];
  configuration?: EnglishNovelStudyActivityProfile;
};

export type Ela20FilmProfileInput = Ela20ProfileBaseInput & {
  filmTitle?: string;
  configuration?: EnglishFilmStudyActivityProfile;
};

export type Ela20ActivityProfileFactoryInput =
  | ({ kind: "modern-drama" } & Ela20CrucibleProfileInput)
  | ({ kind: "shakespeare-drama" } & Ela20MacbethProfileInput)
  | ({ kind: "novel-study" } & Ela20NovelProfileInput)
  | ({ kind: "film-study" } & Ela20FilmProfileInput);

function field(
  id: string,
  label: string,
  placeholder: string,
  hint?: string,
  evidenceRole?: EnglishActivityField["evidenceRole"]
): EnglishActivityField {
  return { id, label, placeholder, hint: hint ?? placeholder, evidenceRole };
}

function selectField(
  id: string,
  label: string,
  options: string[],
  evidenceRole?: EnglishActivityField["evidenceRole"]
): EnglishActivityField {
  return { id, label, type: "select", options, hint: "Choose the option that best matches the evidence or current focus.", evidenceRole };
}

function question(id: string, label: string, hint: string, section?: string): EnglishActivityQuestion {
  return { id, label, hint, section, rows: 5, placeholder: "Develop your response with specific evidence." };
}

function assertProjectSlug(projectSlug: string) {
  if (!projectSlug.trim()) throw new Error("ELA 20-1 activity profiles require a projectSlug.");
}

function selectConfiguredItems<T>(ids: string[], catalog: Map<string, T>, label: string) {
  const unknown = ids.filter((id) => !catalog.has(id));
  if (unknown.length) throw new Error(`${label} configuration contains unsupported ids: ${unknown.join(", ")}`);
  return ids.map((id) => catalog.get(id)!);
}

function assertNoForbiddenWording(value: unknown, context: string) {
  const serialized = JSON.stringify(value);
  const match = serialized.match(FORBIDDEN_WORDING);
  if (match) throw new Error(`${context} contains excluded or grade-contaminated wording: ${match[0]}`);
}

function assertUniqueQuestionData(sets: EnglishActivityQuestionSet[], context: string) {
  const setIds = new Set<string>();
  for (const set of sets) {
    const setId = safeId(set.id);
    if (setIds.has(setId)) throw new Error(`${context} contains duplicate question-set id: ${set.id}`);
    setIds.add(setId);
    const questionIds = new Set<string>();
    for (const item of set.questions) {
      const questionId = safeId(item.id);
      if (questionIds.has(questionId)) throw new Error(`${context} ${set.title} contains duplicate question id: ${item.id}`);
      if (!(item.prompt ?? item.label).trim()) throw new Error(`${context} ${set.title} contains an empty question.`);
      questionIds.add(questionId);
    }
  }
}

function finishProfile<T extends EnglishActivityProfile>(profile: T): T {
  assertNoForbiddenWording(profile, `${profile.kind} profile`);
  return profile;
}

function bodyStage(id: string, title: string, position: "beginning" | "middle" | "end", textKind: "play" | "novel"): EnglishCriticalEssayProfile["stages"][number] {
  const labels = {
    beginning: { state: "Initial character or conflict", evidence: "Opening evidence", analysis: "Connection to the controlling idea" },
    middle: { state: "Turning point or rising pressure", evidence: "Middle evidence", analysis: "Change in progress" },
    end: { state: "Final character state or resolution", evidence: "Ending evidence", analysis: "Final connection to the controlling idea" }
  }[position];
  return {
    id,
    title,
    focus: `Use precise ${textKind === "play" ? "act and scene" : "chapter and page"} evidence to explain development at the ${position} of the ${textKind}.`,
    instruction: "Build the paragraph from a focused claim, to precise evidence, to an explanation of how that evidence proves the interpretation.",
    checkpoints: ["Make a debatable claim.", "Identify the evidence precisely.", "Explain how the evidence supports the larger idea."],
    fields: [
      field(`${position}-state`, labels.state, "State the focused claim for this paragraph.", "Keep the claim connected to development, not plot summary."),
      field(`${position}-evidence`, labels.evidence, textKind === "play" ? "Record the act, scene, quotation, action, or dramatic choice." : "Record the chapter, page, quotation, or precise moment.", "Include enough context to make the evidence understandable."),
      field(`${position}-analysis`, labels.analysis, "Explain how the evidence proves the paragraph claim and develops the essay's interpretation.", "Name the creator's choice and its effect when useful.")
    ]
  };
}

function buildSixStageTextEssay(input: { textKind: "play" | "novel"; title: string }): EnglishCriticalEssayProfile {
  return {
    title: "Critical Analytical Essay",
    description: `Use this six-stage planner to turn ${input.title} evidence into a controlled critical analytical response.`,
    stages: [
      {
        id: "topic-thesis",
        title: "Topic and Thesis",
        focus: "Turn the assigned topic into one defensible controlling idea.",
        instruction: "Identify the topic, choose the character or conflict that best reveals it, and state what the text suggests.",
        checkpoints: ["Answer the assigned topic directly.", "Name the text and creator accurately.", "Make the interpretation arguable."],
        fields: [
          field("topic", "Assigned topic", "Restate the topic in your own words."),
          field("interpretation", "Interpretation", `What does ${input.title} suggest about this topic?`),
          field("thesis", "Working thesis", "Write one sentence that names the text, creator, and controlling idea.", "A thesis should guide every body paragraph.")
        ]
      },
      {
        id: "introduction",
        title: "Introduction",
        focus: "Move from the broader human idea to the text, conflict, and thesis.",
        instruction: "Open with the human issue, establish the text and central conflict, then land on the thesis.",
        checkpoints: ["Keep the opening connected to the topic.", "Provide only the context the reader needs.", "Place the thesis at the end of the introduction."],
        fields: [
          field("opening", "Opening idea", "Introduce the broader human issue without using a dictionary definition."),
          field("text-bridge", "Text and conflict bridge", `Introduce ${input.title}, its creator, and the conflict that matters to the topic.`),
          field("thesis-revision", "Revised thesis", "Revise the thesis so it follows naturally from the introduction.")
        ]
      },
      bodyStage("body-one", "Body Paragraph 1 - Beginning", "beginning", input.textKind),
      bodyStage("body-two", "Body Paragraph 2 - Middle", "middle", input.textKind),
      bodyStage("body-three", "Body Paragraph 3 - End", "end", input.textKind),
      {
        id: "conclusion-revision",
        title: "Conclusion and Revision",
        focus: "Complete the interpretation and revise for clarity, evidence, structure, and correctness.",
        instruction: "Return to the text's final insight, widen toward the human idea, and identify the most important revision work.",
        checkpoints: ["Complete rather than repeat the argument.", "Connect the final insight to the broader topic.", "Revise for precise language and sentence control."],
        fields: [
          field("final-insight", "Final textual insight", "What does the ending finally reveal about the topic?"),
          field("human-connection", "Broader human connection", "What should readers understand beyond this individual text?"),
          field("revision-plan", "Revision plan", "Identify the evidence, organization, wording, and correctness changes still needed.")
        ]
      }
    ]
  };
}

const CRUCIBLE_ACT_IDS = ["act-1", "act-2", "act-3", "act-4"] as const;

function normalizeCrucibleQuestionSets(input: EnglishActivityQuestionSet[] | undefined, configuredActIds: string[] = [...CRUCIBLE_ACT_IDS]) {
  const unsupported = configuredActIds.filter((id) => !CRUCIBLE_ACT_IDS.includes(id as (typeof CRUCIBLE_ACT_IDS)[number]));
  if (unsupported.length) throw new Error(`Crucible act configuration contains unsupported ids: ${unsupported.join(", ")}`);
  const supplied = new Map((input ?? []).map((set) => [safeId(set.id), set]));
  const unexpected = [...supplied.keys()].filter((id) => !configuredActIds.includes(id));
  if (unexpected.length) throw new Error(`Crucible question input contains unexpected set ids: ${unexpected.join(", ")}`);
  const sets = configuredActIds.map((id) => {
    const extracted = supplied.get(id);
    if (extracted) return { ...extracted, id };
    const actNumber = CRUCIBLE_ACT_IDS.indexOf(id as (typeof CRUCIBLE_ACT_IDS)[number]) + 1;
    return {
      id,
      title: `Act ${actNumber} Questions`,
      subtitle: "Source questions pending extraction",
      intro: `The Act ${actNumber} question sheet has not been extracted yet. Use the teacher-provided source until the guided questions are mapped.`,
      questions: []
    } satisfies EnglishActivityQuestionSet;
  });
  assertUniqueQuestionData(sets, "Crucible");
  return sets;
}

const CRUCIBLE_CHARACTER_FIELDS: EnglishActivityField[] = [
  field("goal", "Goal", "What does this character want, and why?", "Separate the stated goal from a possible hidden motive."),
  field("pressure", "Pressure", "What social, moral, legal, or personal pressure acts on this character?"),
  field("relationships", "Relationships", "How do key relationships affect this character's choices?"),
  field("accusations", "Accusations and reputation", "What is said about this character, and how does reputation shape the conflict?"),
  field("choices", "Important choices", "Track a choice that changes the direction of the play."),
  field("change", "Change across the acts", "How does the character's understanding, position, or behaviour change?"),
  field("conflict", "Conflict development", "Explain how this character intensifies, redirects, or resolves a conflict."),
  field("evidence", "Best supporting evidence", "Record an act, scene, quotation, action, or dramatic choice.")
];

const CRUCIBLE_CHARACTERS = [
  { id: "john-proctor", name: "John Proctor" },
  { id: "elizabeth-proctor", name: "Elizabeth Proctor" },
  { id: "abigail-williams", name: "Abigail Williams" },
  { id: "reverend-hale", name: "Reverend Hale" },
  { id: "deputy-governor-danforth", name: "Deputy Governor Danforth" },
  { id: "mary-warren", name: "Mary Warren" }
];

const CRUCIBLE_CHARACTER_CATALOG = new Map(CRUCIBLE_CHARACTERS.flatMap((character) => [
  [character.id, character] as const,
  ...(character.id === "deputy-governor-danforth" ? [["danforth", { ...character, id: "danforth" }] as const] : [])
]));

export function buildEla20CrucibleActivityProfile(input: Ela20CrucibleProfileInput): EnglishModernDramaProfile {
  assertProjectSlug(input.projectSlug);
  const configuration = input.configuration;
  const suppliedMaterials = input.materials ?? [];
  const hasCompletePlay = suppliedMaterials.some((material) => material.id === "crucible-full-text-pdf" && material.href);
  const profile: EnglishModernDramaProfile = {
    kind: "modern-drama",
    namespace: input.projectSlug,
    courseCode: COURSE_CODE,
    unitTitle: "Modern Drama",
    evidenceBankRoute: input.evidenceBankRoute ?? "evidence-bank",
    recipeProfile: configuration,
    playTitle: "The Crucible",
    materials: [
      ...(!hasCompletePlay ? [{
        id: "crucible-play-access",
        title: "The Crucible",
        description: "Use the teacher-provided or school-licensed edition of the play.",
        status: "access-required"
      } satisfies EnglishMaterialHook] : []),
      ...suppliedMaterials
    ],
    actQuestionSets: normalizeCrucibleQuestionSets(input.actQuestionSets, configuration?.actIds),
    characters: configuration
      ? selectConfiguredItems(configuration.characterIds, CRUCIBLE_CHARACTER_CATALOG, "Crucible character")
      : CRUCIBLE_CHARACTERS,
    characterFields: CRUCIBLE_CHARACTER_FIELDS,
    essay: configuration?.criticalEssay === false ? undefined : buildSixStageTextEssay({ textKind: "play", title: "The Crucible" })
  };
  return finishProfile(profile);
}

const MACBETH_SCENE_COUNTS = new Map<number, number>([
  [1, 7],
  [2, 4],
  [3, 6],
  [4, 3],
  [5, 8]
]);

function validateMacbethScenes(scenes: EnglishShakespeareScene[]) {
  const expected = [...MACBETH_SCENE_COUNTS.entries()].flatMap(([act, count]) =>
    Array.from({ length: count }, (_value, index) => `${act}.${index + 1}`)
  );
  const byLocator = new Map<string, EnglishShakespeareScene>();
  for (const scene of scenes) {
    const locator = `${scene.act}.${scene.scene}`;
    if (byLocator.has(locator)) throw new Error(`Macbeth scene data contains duplicate Act ${scene.act}, Scene ${scene.scene}.`);
    if (!MACBETH_SCENE_COUNTS.has(scene.act) || scene.scene < 1 || scene.scene > (MACBETH_SCENE_COUNTS.get(scene.act) ?? 0)) {
      throw new Error(`Macbeth scene data contains an unexpected locator: Act ${scene.act}, Scene ${scene.scene}.`);
    }
    if (!scene.passages.length || scene.passages.some((passage) => !passage.original.trim() || !passage.companion.trim())) {
      throw new Error(`Macbeth Act ${scene.act}, Scene ${scene.scene} requires original and companion passage data.`);
    }
    byLocator.set(locator, scene);
  }
  const missing = expected.filter((locator) => !byLocator.has(locator));
  if (missing.length) throw new Error(`Macbeth scene data is incomplete; missing ${missing.join(", ")}.`);
  return expected.map((locator) => {
    const scene = byLocator.get(locator)!;
    return { ...scene, id: `act-${scene.act}-scene-${scene.scene}` };
  });
}

function validateMacbethQuestionSets(sets: EnglishActivityQuestionSet[], configuredActIds = ["act-1", "act-2", "act-3", "act-4", "act-5"]) {
  assertUniqueQuestionData(sets, "Macbeth");
  const supported = ["act-1", "act-2", "act-3", "act-4", "act-5"];
  const invalidConfiguration = configuredActIds.filter((id) => !supported.includes(id));
  if (invalidConfiguration.length) throw new Error(`Macbeth act configuration contains unsupported ids: ${invalidConfiguration.join(", ")}`);
  const expected = configuredActIds;
  const byId = new Map(sets.map((set) => [safeId(set.id), set]));
  const missing = expected.filter((id) => !byId.has(id));
  const unexpected = [...byId.keys()].filter((id) => !expected.includes(id));
  if (missing.length || unexpected.length) {
    throw new Error(`Macbeth act questions must provide act-1 through act-5${missing.length ? `; missing ${missing.join(", ")}` : ""}${unexpected.length ? `; unexpected ${unexpected.join(", ")}` : ""}.`);
  }
  for (const id of expected) {
    if (!(byId.get(id)?.questions.length)) throw new Error(`Macbeth ${id} requires at least one extracted question.`);
  }
  return expected.map((id) => ({ ...byId.get(id)!, id }));
}

const MACBETH_CHARACTER_FIELDS: EnglishActivityField[] = [
  field("traits", "First impressions and traits", "How is the character first presented?"),
  field("public-perception", "Public perception", "What do other characters believe or say about this character?"),
  field("tragic-pressure", "Tragic flaw or central pressure", "What desire, fear, belief, or weakness drives the character?"),
  field("foil-relationships", "Foil relationships", "Which character provides the strongest contrast, and what does the contrast reveal?"),
  field("thematic-role", "Thematic role", "How does this character develop an idea such as ambition, loyalty, guilt, appearance, or fate?"),
  field("act-one", "Act 1 development", "Record an important choice, change, or revelation."),
  field("act-two-three", "Acts 2-3 development", "Track how conflict changes this character."),
  field("act-four-five", "Acts 4-5 development", "Explain the character's final position, change, or consequence."),
  field("quotations", "Anchor quotations", "Record brief quotations with act and scene locators.")
];

const MACBETH_CHARACTERS = [
  { id: "macbeth", name: "Macbeth" },
  { id: "lady-macbeth", name: "Lady Macbeth" },
  { id: "banquo", name: "Banquo" },
  { id: "macduff", name: "Macduff" },
  { id: "duncan", name: "Duncan" },
  { id: "witches", name: "The Witches" }
];

const MACBETH_CHARACTER_CATALOG = new Map(MACBETH_CHARACTERS.map((character) => [character.id, character]));

const MACBETH_WRITING_TOOLS: EnglishWritingTool[] = [
  {
    id: "language-lab",
    title: "Language Lab",
    description: "Practise translating Shakespeare's phrasing and identifying language choices. Practice scores save with the activity but are not added to the Evidence Bank.",
    evidenceMode: "none",
    fields: [
      field("original-phrase", "Original phrase", "Record the phrase being studied."),
      field("plain-language", "Plain-language meaning", "Restate the meaning accurately in current language."),
      selectField("language-feature", "Language feature", ["Diction", "Imagery", "Metaphor", "Paradox", "Rhythm", "Dramatic irony", "Other"]),
      field("practice-score", "Practice score", "Record the score or feedback from this language practice.")
    ]
  },
  {
    id: "close-reading",
    title: "Close Reading Annotation Lab",
    description: "Annotate a short passage, identify a deliberate language or dramatic choice, and explain its effect.",
    evidenceMode: "individual",
    evidenceLabel: "Save Annotation to Evidence Bank",
    fields: [
      field("locator", "Act and scene", "Example: Act 2, Scene 1"),
      field("passage", "Passage", "Record a brief passage for close reading.", undefined, "detail"),
      field("annotation", "Language or dramatic choice", "Identify diction, imagery, rhythm, contrast, stagecraft, or another precise choice.", undefined, "connection"),
      field("effect", "Effect and meaning", "Explain what the choice reveals and how it develops the scene's larger meaning.", undefined, "connection")
    ]
  },
  {
    id: "theme-builder",
    title: "Theme Builder",
    description: "Move from a recurring topic to a defensible thematic statement supported by scene evidence.",
    evidenceMode: "individual",
    evidenceLabel: "Save Theme Response to Evidence Bank",
    fields: [
      selectField("topic", "Recurring topic", ["Ambition", "Appearance and reality", "Evil", "Fate and choice", "Guilt", "Leadership", "Loyalty", "Violence"]),
      field("pattern", "Pattern across the play", "Describe how the topic changes or becomes more complicated.", undefined, "detail"),
      field("scene-evidence", "Scene evidence", "Record two connected moments with act and scene locators.", undefined, "detail"),
      field("theme-statement", "Thematic statement", "State what the play suggests about people or society through this pattern.", undefined, "connection")
    ]
  },
  {
    id: "character-change-paragraph",
    title: "Character-Change Paragraph",
    description: "Respond to the teacher prompt: How does Macbeth's response to his murders reveal a change in his character?",
    evidenceMode: "collection",
    evidenceLabel: "Save Character-Change Paragraph",
    fields: [
      field("focused-answer", "Focused answer", "State the specific change you will prove rather than retelling the murders."),
      field("evidence", "Act, scene, and evidence", "Choose a precise response, action, or line from Macbeth and include its locator."),
      field("analysis", "Analysis of change", "Explain how the evidence reveals a change in Macbeth's thinking, feeling, or behaviour."),
      field("paragraph", "Complete analytical paragraph", "Combine a focused claim, contextualized evidence, detailed analysis, and a concluding connection.")
    ]
  },
  {
    id: "critical-essay",
    title: "Critical Essay",
    description: "Build a focused interpretation, select evidence from across the play, and plan a controlled analytical response.",
    evidenceMode: "collection",
    evidenceLabel: "Save Critical Essay Plan",
    fields: [
      field("topic", "Assigned topic", "Restate the topic in your own words."),
      field("thesis", "Working thesis", "State what Shakespeare suggests about the topic."),
      field("evidence-one", "Evidence from the beginning", "Record an act, scene, quotation, and analytical purpose."),
      field("evidence-two", "Evidence from the middle", "Record an act, scene, quotation, and analytical purpose."),
      field("evidence-three", "Evidence from the ending", "Record an act, scene, quotation, and analytical purpose."),
      field("organization", "Essay organization", "Plan the order of claims and the final insight.")
    ]
  },
  {
    id: "graphic-essay",
    title: "Visual Motif Essay",
    description: "Trace one Macbeth motif across at least four acts, connect four quotations to four symbolic visuals, and explain how the pattern develops a thematic idea.",
    evidenceMode: "collection",
    evidenceLabel: "Save Visual Motif Essay Plan",
    fields: [
      selectField("motif", "Motif focus", ["Lust for power", "Treachery", "Manipulation", "Blood", "Sleep", "Darkness", "Appearance and reality", "Another recurring pattern"]),
      field("theme-claim", "Theme connection", "Explain what Shakespeare suggests through this recurring motif."),
      field("introduction", "Introduction plan", "Introduce the motif, establish its pattern across the play, and state the controlling interpretation."),
      field("act-one-evidence", "Act 1 quotation, image, and commentary", "Record a complete quotation with an act, scene, and line locator. Describe one symbolic visual and explain how both develop the motif."),
      field("act-two-evidence", "Act 2 quotation, image, and commentary", "Record a complete quotation with an act, scene, and line locator. Describe one symbolic visual and explain how both develop the motif."),
      field("act-three-evidence", "Act 3 quotation, image, and commentary", "Record a complete quotation with an act, scene, and line locator. Describe one symbolic visual and explain how both develop the motif."),
      field("act-four-five-evidence", "Act 4 or 5 quotation, image, and commentary", "Record a complete quotation with an act, scene, and line locator. Describe one symbolic visual and explain how both develop the motif."),
      field("visual-plan", "Visual composition plan", "Describe the layout, relationships, and symbolism that will unify all four visuals. Avoid simply illustrating the literal events."),
      field("rubric-check", "Quality check", "Confirm that the quotations span four acts, the images are symbolic, every quotation and image has detailed commentary, and the complete design communicates one thematic message.")
    ]
  }
];

const MACBETH_WRITING_TOOL_CATALOG = new Map(MACBETH_WRITING_TOOLS.map((tool) => [tool.id, tool]));

export function buildEla20MacbethActivityProfile(input: Ela20MacbethProfileInput): EnglishShakespeareProfile {
  assertProjectSlug(input.projectSlug);
  const configuration = input.configuration;
  const scenes = validateMacbethScenes(input.scenes);
  if (configuration && scenes.length !== configuration.sceneCount) {
    throw new Error(`Macbeth recipe expects ${configuration.sceneCount} scenes, but ${scenes.length} preserved scenes were supplied.`);
  }
  if (configuration?.editorialStatus === "reviewed" && scenes.some((scene) => scene.editorialStatus !== "reviewed")) {
    throw new Error("Macbeth recipe is marked reviewed, but one or more preserved scene companions still need editorial review.");
  }
  const profile: EnglishShakespeareProfile = {
    kind: "shakespeare-drama",
    namespace: input.projectSlug,
    courseCode: COURSE_CODE,
    unitTitle: "Shakespearean Drama",
    evidenceBankRoute: input.evidenceBankRoute ?? "evidence-bank",
    recipeProfile: configuration,
    playTitle: "Macbeth",
    scenes,
    materials: [
      {
        id: "macbeth-original-text",
        title: "Macbeth Original Text",
        description: "Read the complete public-domain play through MIT Shakespeare.",
        href: "https://shakespeare.mit.edu/macbeth/index.html",
        actionLabel: "Open Source",
        embeddable: true,
        status: "available"
      },
      {
        id: "macbeth-multimedia-companion",
        title: "myShakespeare Macbeth Companion",
        description: "Open scene-level text, audio, video, and character interviews through myShakespeare.",
        href: "https://myshakespeare.com/macbeth/act-1-scene-1",
        actionLabel: "Open Companion",
        embeddable: false,
        status: "available"
      },
      ...(input.materials ?? [])
    ],
    actQuestionSets: validateMacbethQuestionSets(input.actQuestionSets, configuration?.actIds),
    characters: configuration
      ? selectConfiguredItems(configuration.characterIds, MACBETH_CHARACTER_CATALOG, "Macbeth character")
      : MACBETH_CHARACTERS,
    characterFields: MACBETH_CHARACTER_FIELDS,
    writingTools: configuration
      ? selectConfiguredItems(configuration.writingTools, MACBETH_WRITING_TOOL_CATALOG, "Macbeth writing tool")
      : MACBETH_WRITING_TOOLS
  };
  return finishProfile(profile);
}

const NOVEL_QUESTIONS: EnglishActivityQuestionSet[] = [
  {
    id: "opening",
    title: "Opening Questions",
    subtitle: "Profile-supplied enrichment | Complete after approximately the first third",
    intro: "These prompts are profile-supplied enrichment. Use the assigned novel and precise chapter or page evidence.",
    questions: [
      question("opening-situation", "How does the novel begin, and what initial situation or question draws the reader in?", "Describe the setting, mood, and first important pressure."),
      question("major-characters", "Who are the major characters, and what relationships connect them?", "Explain the relationships rather than listing names."),
      question("initial-conflict", "What conflict begins to move the novel forward?", "Identify both the immediate problem and any deeper pressure."),
      question("suspense", "How does the author create suspense or uncertainty?", "Consider pacing, foreshadowing, withheld information, danger, or unstable relationships."),
      question("point-of-view", "What is the point of view, and how does it shape what the reader knows?", "Identify the narrator and explain the effect of that perspective."),
      question("minor-characters", "Which minor characters already affect the protagonist, conflict, or setting?", "Choose characters whose influence matters even if they are not central."),
      question("reader-response", "Which character creates the strongest response in you so far, and why?", "Support the response with a specific action, choice, or line."),
      question("developing-theme", "What larger idea appears to be developing in the opening?", "Turn a one-word topic into a statement about people, choices, or society."),
      question("opening-prediction", "What do you predict will happen next, and what evidence supports the prediction?", "Base the prediction on conflict, goals, patterns, or foreshadowing.")
    ]
  },
  {
    id: "middle",
    title: "Middle Questions",
    subtitle: "Profile-supplied enrichment | Complete after approximately the middle third",
    intro: "These prompts are profile-supplied enrichment. Revisit earlier predictions and track changes in conflict, character, and craft.",
    questions: [
      question("conflict-change", "How has the central conflict intensified, shifted, or revealed a deeper problem?", "Compare the current conflict with the opening."),
      question("different-pressures", "Are the major characters facing the same problem in the same way?", "Compare at least two characters and their pressures."),
      question("important-decision", "What important decision has the protagonist made, and what motivates it?", "Explain the decision, motivation, and consequence."),
      question("author-style", "Which authorial choice is especially important in the middle of the novel?", "Consider structure, narration, imagery, flashback, foreshadowing, or shifts in perspective."),
      question("continuing-suspense", "How does the author continue to create suspense or uncertainty?", "Look for complications, secrets, delayed answers, or rising stakes."),
      question("surprise", "What development most challenged your expectations, and why?", "Explain how the author prepared for or deliberately concealed the moment."),
      question("character-development", "How is one character being developed through action, dialogue, narration, or others' perceptions?", "Use one precise example and name the technique."),
      question("prediction-review", "How accurate were your opening predictions?", "Compare the prediction with what happened and explain what changed your thinking."),
      question("ending-prediction", "What is your final prediction for the ending?", "Use current conflict, choices, and repeated patterns.")
    ]
  },
  {
    id: "final",
    title: "Final Questions",
    subtitle: "Profile-supplied enrichment | Complete after finishing the novel",
    intro: "These prompts are profile-supplied enrichment. Synthesize the complete novel rather than responding to the ending alone.",
    questions: [
      question("setting-influence", "How did the setting influence the characters and events across the novel?", "Consider time, place, social conditions, and atmosphere."),
      question("dynamic-static", "Which characters are dynamic or static, and what evidence proves the distinction?", "Track a clear before-and-after change or a meaningful refusal to change."),
      question("elapsed-time", "How is time handled across the novel?", "Estimate the timeline and mention jumps, flashbacks, compression, or repetition."),
      question("most-important-theme", "Which thematic idea is most important, and how is it developed from beginning to end?", "Use connected evidence from more than one part of the novel."),
      question("takeaway", "What lasting understanding will you take from the novel?", "Connect the understanding to character, conflict, craft, or theme."),
      question("evaluation", "What is one thoughtful criticism or recommendation you would make about the novel?", "Name a strength, limitation, intended audience, or reason for the recommendation.")
    ]
  }
];

const NOVEL_READING_GUIDE_FIELDS: EnglishActivityField[] = [
  selectField("reading-pass", "Reading pass", ["Opening chapters", "Middle chapters", "Final chapters", "Reread", "Evidence review"]),
  field("locator", "Chapter and page", "Example: Chapter 4, page 82"),
  selectField("evidence-type", "Evidence type", ["Character", "Conflict", "Setting", "Symbol", "Motif", "Theme", "Narration", "Key quotation", "Turning point"], "concept"),
  field("passage", "Quotation or precise moment", "Copy a brief quotation or summarize one precise moment.", undefined, "detail"),
  field("context", "Context", "What is happening, and who is involved?", undefined, "detail"),
  field("author-choice", "Author's choice", "Identify diction, imagery, dialogue, contrast, narration, structure, setting, or another deliberate choice.", undefined, "connection"),
  field("effect", "Effect on the reader", "Explain what the choice makes the reader notice, feel, question, or understand.", undefined, "connection"),
  field("theme-connection", "Theme or character connection", "Connect this passage to a larger pattern or change.", undefined, "connection"),
  field("analytical-use", "Possible analytical use", "Explain how this evidence could support a question, paragraph, or essay.", undefined, "connection")
];

const MAJOR_WORKS_FIELDS: EnglishActivityField[] = [
  field("context", "Author and context", "Record useful author, historical, cultural, or publication context."),
  field("genre", "Genre and form", "Identify the novel's genre and important formal features."),
  field("plot", "Plot overview", "Summarize the central plot without replacing analysis with detail."),
  field("style", "Style and narration", "Describe the narrator, point of view, structure, and distinctive style."),
  field("quotations", "Important quotations", "Collect brief quotations with chapter or page locators."),
  field("characters", "Major characters", "Track roles, relationships, goals, conflicts, and changes."),
  field("setting", "Setting", "Explain how time, place, atmosphere, or society affects the novel."),
  field("opening", "Opening significance", "Explain how the opening establishes expectations, conflict, or voice."),
  field("ending", "Ending significance", "Explain how the ending resolves, complicates, or reframes the novel."),
  field("symbols", "Symbols and motifs", "Track repeated images, objects, settings, phrases, or patterns."),
  field("themes", "Themes", "State the novel's developed ideas as complete thematic statements.")
];

const NOVEL_WRITING_TOOLS: EnglishWritingTool[] = [
  {
    id: "analytical-paragraph",
    title: "Analytical Paragraph Builder",
    description: "Build a debatable claim, connect two pieces of evidence, explain them, and revise the paragraph.",
    evidenceMode: "individual",
    evidenceLabel: "Save Paragraph to Evidence Bank",
    fields: [
      field("claim", "Controlling idea", "Write one arguable claim."),
      field("evidence-one", "Evidence one", "Record a quotation or precise moment with a locator."),
      field("evidence-two", "Evidence two", "Record connected or contrasting evidence with a locator."),
      field("connection", "Evidence connection", "Explain the pattern created by these details."),
      field("paragraph", "Analytical paragraph", "Draft the complete paragraph.", undefined, "detail"),
      field("revision", "Revision insight", "Explain the most important improvement still needed.", undefined, "connection")
    ]
  },
  {
    id: "motif-string-board",
    title: "Motif String Board",
    description: "Connect repeated details across the novel before turning the pattern into an interpretation.",
    evidenceMode: "individual",
    evidenceLabel: "Save Motif Card to Evidence Bank",
    fields: [
      field("motif", "Motif", "Name the repeated image, object, phrase, setting, action, or idea."),
      field("moments", "Connected moments", "Record at least two chapter or page locators.", undefined, "detail"),
      field("pattern", "Pattern", "Explain what changes or remains consistent across the moments.", undefined, "connection"),
      field("meaning", "Larger meaning", "Connect the motif to character, conflict, or theme.", undefined, "connection")
    ]
  },
  {
    id: "authors-intent",
    title: "Author's Intent",
    description: "Move from a character or plot choice to an interpretation of why the author constructed the moment this way.",
    evidenceMode: "individual",
    evidenceLabel: "Save Author's Intent Response",
    fields: [
      field("choice", "Character or plot choice", "Identify one precise choice or turning point.", undefined, "detail"),
      field("motivation", "Character motivation", "Explain the character's stated and implied motivation."),
      field("author-choice", "Author's construction", "Identify how narration, structure, contrast, dialogue, or imagery shapes the moment.", undefined, "connection"),
      field("intent", "Author's possible intent", "Explain what the author may want the reader to understand or question.", undefined, "connection")
    ]
  }
];

const NOVEL_QUESTION_CATALOG = new Map(NOVEL_QUESTIONS.map((set) => [set.id, set]));
const NOVEL_WRITING_TOOL_CATALOG = new Map<string, EnglishWritingTool>([
  ["analytical-paragraph", NOVEL_WRITING_TOOLS[0]!],
  ["motif-string", NOVEL_WRITING_TOOLS[1]!],
  ["authors-intent", NOVEL_WRITING_TOOLS[2]!]
]);

const DEFAULT_NOVEL_TRACKS = [
  { id: "lord-of-the-flies", title: "Lord of the Flies", author: "William Golding" },
  { id: "the-book-thief", title: "The Book Thief", author: "Markus Zusak" }
];

export function buildEla20NovelStudyActivityProfile(input: Ela20NovelProfileInput): EnglishNovelStudyProfile {
  assertProjectSlug(input.projectSlug);
  const configuration = input.configuration;
  const tracks = configuration?.novels ?? DEFAULT_NOVEL_TRACKS;
  const configuredQuestionSets = configuration
    ? selectConfiguredItems(configuration.questionPhases, NOVEL_QUESTION_CATALOG, "Novel question phase")
    : NOVEL_QUESTIONS;
  const questionCount = configuredQuestionSets.reduce((total, set) => total + set.questions.length, 0);
  if (configuration && questionCount !== configuration.genericQuestionCount) {
    throw new Error(`Novel recipe expects ${configuration.genericQuestionCount} profile-supplied questions, but the configured phases contain ${questionCount}.`);
  }
  const profile: EnglishNovelStudyProfile = {
    kind: "novel-study",
    namespace: input.projectSlug,
    courseCode: input.courseCode ?? COURSE_CODE,
    unitTitle: input.unitTitle ?? "Novel Study",
    evidenceBankRoute: input.evidenceBankRoute ?? "evidence-bank",
    recipeProfile: configuration,
    tracks,
    materials: [
      ...tracks.map((track) => ({ id: `${safeId(track.id)}-access`, title: track.title, description: "Use the teacher-provided or school-licensed edition.", status: "access-required" as const })),
      ...(input.materials ?? [])
    ],
    essay: buildSixStageTextEssay({ textKind: "novel", title: "the selected novel" }),
    readingGuideFields: NOVEL_READING_GUIDE_FIELDS,
    majorWorksFields: MAJOR_WORKS_FIELDS,
    questionSets: [
      ...(input.questionSets ?? []),
      ...configuredQuestionSets.map((set) => ({ ...set, title: input.questionSets?.length ? `Enrichment: ${set.title}` : set.title }))
    ],
    writingTools: configuration
      ? selectConfiguredItems(configuration.writingTools.filter((id) => id !== "critical-essay"), NOVEL_WRITING_TOOL_CATALOG, "Novel writing tool")
      : NOVEL_WRITING_TOOLS
  };
  return finishProfile(profile);
}

const FILM_TECHNIQUE_QUESTIONS: EnglishActivityQuestion[] = [
  question("panning", "Describe what panning is and why it is used in films.", "Name the movement and explain what it helps the viewer follow.", "Types of Cinematography Shots"),
  question("extreme-long-close-up", "Explain the difference between an extreme long shot and a close up.", "Compare how much subject and setting the viewer can see.", "Types of Cinematography Shots"),
  question("close-up-effect", "What effect is achieved in a close up?", "Consider emotion, detail, and directed attention.", "Types of Cinematography Shots"),
  question("dutch-tilt", "What effect is the director trying to achieve through the use of Dutch tilt? Why might this shot be used?", "Connect the tilted frame to instability, threat, or confusion.", "Types of Cinematography Shots"),
  question("high-angle", "What is a high-angle shot and what is its purpose?", "Explain camera placement and its effect on power or vulnerability.", "Types of Cinematography Shots"),
  question("leading-lines", "What is the function of leading lines? Name four different types of leading lines.", "Explain how lines guide attention through a frame.", "Shot Composition"),
  question("rack-focus", "When is rack focus used? What is rack focus?", "Describe the focus shift and why attention is redirected.", "Shot Composition"),
  question("natural-frames", "Give four examples of natural frames.", "Identify objects or spaces that can frame a subject within a shot.", "Shot Composition"),
  question("follow-movement", "Name one common type of camera movement used to follow movement in a scene.", "Choose one method and describe it accurately.", "Camera Movement"),
  question("dolly", "Describe what is meant by a dolly movement.", "Explain how the camera physically moves through space.", "Camera Movement"),
  question("stabilization", "How do camera operators minimize vibration when using a sled and vest?", "Describe how stabilization equipment supports smooth movement.", "Camera Movement"),
  question("boom", "True or false: a boom is used for both low and high angle shots. Explain your answer.", "Explain the range of camera position a boom creates.", "Camera Movement"),
  question("three-point", "How is three-point lighting achieved?", "Name the three lights and explain how they work together.", "Lighting"),
  question("key-light", "What is the key light?", "Identify the main source in the lighting setup.", "Lighting"),
  question("fill-light", "What does the fill light do?", "Focus on shadow and contrast.", "Lighting"),
  question("back-light", "What is the purpose of the hair light?", "Explain how it separates a subject from the background.", "Lighting"),
  question("noir-lighting", "Describe the lighting arrangement when making a noir movie.", "Use terms such as low-key lighting, contrast, shadow, and mood.", "Lighting"),
  question("diegetic", "Explain the difference between diegetic sound and non-diegetic sound.", "Ask whether characters inside the film can hear it.", "Sound Effects"),
  question("diegetic-examples", "Give three examples of diegetic sound.", "Choose sounds that belong inside the film's world.", "Sound Effects"),
  question("nondiegetic-examples", "Give three examples of non-diegetic sound.", "Choose sounds added for the audience.", "Sound Effects"),
  question("mise-en-scene", "Explain the term mise-en-scene. What is the function of mise-en-scene?", "Consider everything deliberately placed within the frame.", "Mise-en-scene"),
  question("visual-emotion", "Describe some special features a director can use to emphasize a character's emotional state, such as symbols or visual elements.", "Connect a specific visual choice to what the viewer understands.", "Mise-en-scene")
];

const FILM_FULL_RESPONSE_QUESTIONS: EnglishActivityQuestion[] = [
  question("film-choice", "Which film did you watch?", "Identify the film before moving into analysis.", "Film Selection"),
  question("character-introduction", "How are the major characters introduced? What does this tell us about what will happen in the story?", "Use setting, dialogue, performance, or early conflict.", "Character And Motivation"),
  question("character-action-theme", "Select an action performed by one character. Explain why that character took the action, what motivated them, and what this motivation has to do with the theme of the film.", "Use a specific action rather than a general trait.", "Character And Motivation"),
  question("character-credibility", "The characters must be credible; how they act and what they say must make sense. What aspects of the personalities of the major characters affect their credibility?", "Connect personality and context to action.", "Character And Motivation"),
  question("character-consistency", "Is there consistency in the characters throughout the story? Do their actions follow their natures and ring true?", "Track whether later choices follow or complicate their established nature.", "Character And Motivation"),
  question("major-motives", "What motivates the major characters? Are their motivations or wants explained outright or revealed over time?", "Separate stated goals from motives the viewer infers.", "Character And Motivation"),
  question("unconscious-motives", "Are there any major characters who act on motives of which they are not aware? Describe any unconscious motives and explain how these motives affect their actions.", "Consider fear, guilt, pride, grief, desire, or denial.", "Character And Motivation"),
  question("relationships", "Are there important relationships between characters, such as friends, lovers, co-workers, or family members? Describe relationships that contribute to the story and how they advance the action.", "Explain what each relationship causes, reveals, or changes.", "Relationships And Conflict"),
  question("protagonist-motivation", "What motivates the protagonist in their struggle against the antagonist?", "Identify the goal and what is at stake.", "Relationships And Conflict"),
  question("protagonist-action", "How does the protagonist work against the antagonist? Recount one specific event in this struggle.", "Use one specific scene as evidence.", "Relationships And Conflict"),
  question("antagonist-motivation", "What motivates the antagonist to resist or struggle against the protagonist?", "Explain what the opposition wants or protects.", "Relationships And Conflict"),
  question("antagonist-action", "How does the antagonist resist or struggle against the protagonist? Recount one specific event in this struggle.", "Choose one action that changes the protagonist's situation.", "Relationships And Conflict"),
  question("values", "In what ways are the characters' actions driven by the values endorsed or criticized in the story, or by ideas presented by the story?", "Connect choices to the film's larger ideas.", "Theme And Resolution"),
  question("backstory", "What role does the back-story play in explaining the actions of the major characters? Explain your reasoning.", "Connect past events to present action.", "Theme And Resolution"),
  question("withheld-information", "Is there information known to the audience that is being held back from any characters? If so, describe it and explain how things change once this information becomes known.", "Consider suspense, irony, secrecy, and revelation.", "Theme And Resolution"),
  question("transformation", "Explore transformations or changes that occur over the course of the story in any major character. For each change, describe how it comes about and how it relates to the film's themes or ideas.", "Track a clear before-and-after change.", "Theme And Resolution"),
  question("resolution-trait", "Which aspects of the protagonist's personality lead to the resolution of the conflict? Describe them and their effect on the resolution.", "Connect the trait to the ending.", "Theme And Resolution"),
  question("internal-external", "As the story moves toward a conclusion, internal and external conflicts are resolved. Select one major character and describe their internal and external conflicts. Explain how the character's choices lead to a resolution of these conflicts.", "Separate the inner struggle from the outside problem.", "Theme And Resolution")
];

function buildFilmEssay(): EnglishCriticalEssayProfile {
  const essay: EnglishCriticalEssayProfile = {
    title: "Critical Analytical Essay",
    description: "Use this six-stage planner to turn precise film moments and technique analysis into a controlled response.",
    stages: [
      {
        id: "topic-interpretation",
        title: "Topic and Interpretation",
        focus: "Turn the assigned topic into a defensible interpretation of the feature film.",
        instruction: "Separate the topic, the insight developed through the film, and the thesis that will control the essay.",
        fields: [
          field("topic", "Two parts of the essay topic", "Separate the key ideas or demands in the assigned topic."),
          field("film-insight", "Film and character route", "Name the film, filmmaker, central character or conflict, and the beginning-middle-end development you will trace."),
          field("thesis", "Working thesis", "Write the filmmaker's larger idea about the assigned topic in one controlling sentence.")
        ]
      },
      {
        id: "introduction",
        title: "Introduction",
        focus: "Move from the broader human topic to the film, central conflict, and thesis.",
        instruction: "Keep the context purposeful and avoid summarizing the whole film.",
        fields: [
          field("opening", "General topic opening", "Draft two or three sentences that introduce the topic in human terms."),
          field("context", "Film and conflict bridge", "Introduce the film, filmmaker, character focus, and central conflict without summarizing the whole plot."),
          field("thesis-revision", "Final thesis sentence", "Write the controlling sentence that will close the introduction and guide the essay.")
        ]
      },
      {
        id: "body-one",
        title: "Body Paragraph 1 - Beginning",
        focus: "Establish the character, conflict, or idea at the beginning of the film.",
        fields: [
          field("claim", "Character at the beginning", "Draft the paragraph's topic sentence and explain the character's starting point."),
          field("scene-evidence", "Beginning film evidence", "Record the scene, timestamp, quotation, performance, or film technique you will use as proof."),
          field("analysis", "Beginning analysis and topic connection", "Explain how the evidence establishes the character or conflict and supports the thesis.")
        ]
      },
      {
        id: "body-two",
        title: "Body Paragraph 2 - Middle",
        focus: "Analyze the turning point, rising pressure, or change in the middle of the film.",
        fields: [
          field("claim", "Middle conflict or turning point", "Draft the paragraph's topic sentence and identify the pressure, crisis, or choice that drives change."),
          field("scene-evidence", "Middle film evidence", "Record the scene, timestamp, quotation, performance, or film technique you will use as proof."),
          field("analysis", "Change in progress and topic connection", "Explain how this moment changes the character or conflict and advances the thesis.")
        ]
      },
      {
        id: "body-three",
        title: "Body Paragraph 3 - End",
        focus: "Explain the final change, resolution, or unresolved tension.",
        fields: [
          field("claim", "Character at the end", "Draft the paragraph's topic sentence and explain the final change, resolution, or unresolved tension."),
          field("scene-evidence", "Ending film evidence", "Record the final scene, timestamp, quotation, performance, or film technique you will use as proof."),
          field("analysis", "Final analysis and topic connection", "Explain how the ending answers the assigned topic and completes or complicates the thesis.")
        ]
      },
      {
        id: "conclusion-revision",
        title: "Conclusion and Revision",
        focus: "Complete the interpretation and revise the full essay for control and correctness.",
        fields: [
          field("synthesis", "Restated interpretation", "Restate the thesis in fresh language without repeating it word for word."),
          field("significance", "Beginning-middle-end synthesis", "Connect the character's starting point, turning point, and final change into one clear insight."),
          field("structure-check", "Human condition connection", "Explain what the film's idea suggests about people or human experience beyond this story."),
          field("language-check", "Complete conclusion draft", "Combine the restated interpretation, synthesis, and broader significance into a polished conclusion paragraph.")
        ]
      }
    ]
  };
  const fieldCount = essay.stages.reduce((total, stage) => total + stage.fields.length, 0);
  if (essay.stages.length !== 6 || fieldCount !== 19) throw new Error("Film essay profile must contain six stages and exactly 19 fields.");
  return essay;
}

function buildFilmPersonalResponse(): EnglishCriticalEssayProfile {
  return {
    title: "Personal Response to Text",
    description: "Use this six-stage studio to connect a meaningful film idea to precise evidence and your own knowledge or experience in a purposeful prose form.",
    stages: [
      {
        id: "prompt-impression",
        title: "Prompt and Initial Impression",
        focus: "Understand the prompt and decide what idea, feeling, or impression you want to explore.",
        instruction: "Separate the prompt from your first response, then turn that reaction into a focused controlling idea.",
        checkpoints: ["I can identify what the prompt asks me to explore.", "I can name a genuine initial reaction to the film.", "I can turn that reaction into a focused idea."],
        fields: [
          field("prompt", "Course prompt", "Record or restate the assigned personal-response prompt in your own words."),
          field("initial-impression", "Initial impression", "What idea, feeling, question, or image from the film stays with you?"),
          field("controlling-idea", "Controlling idea", "What will your response suggest about the prompt or larger human experience?")
        ]
      },
      {
        id: "film-evidence",
        title: "Film Evidence",
        focus: "Choose a precise film moment and explain how it develops your controlling idea.",
        instruction: "Use a scene, timestamp, line, performance detail, image, sound, or film technique as meaningful support.",
        checkpoints: ["I can identify a precise film moment.", "I can explain a filmmaker's choice in that moment.", "I can connect the evidence to my controlling idea."],
        fields: [
          field("moment", "Film moment", "Record the scene, timestamp, quotation, image, sound, performance, or technique you will use."),
          field("creator-choice", "Filmmaker's choice", "What did the filmmaker deliberately do, and what effect does that choice create?"),
          field("meaning", "Connection to your idea", "Explain how this moment develops the idea, feeling, or impression at the centre of your response.")
        ]
      },
      {
        id: "knowledge-experience",
        title: "Knowledge and Experience",
        focus: "Connect the film's idea to relevant personal knowledge, observation, or experience.",
        instruction: "Choose a connection that deepens the response rather than replacing discussion of the film.",
        checkpoints: ["I can choose a relevant connection.", "I can explain why the connection matters.", "I can link the connection back to the film and prompt."],
        fields: [
          field("connection", "Knowledge or experience", "Describe the memory, observation, learning, or experience that connects meaningfully to the film."),
          field("significance", "Why it matters", "What did this connection help you understand, question, or reconsider?"),
          field("link-back", "Link back to the film", "Explain how the connection strengthens or complicates your interpretation of the film moment.")
        ]
      },
      {
        id: "form-perspective",
        title: "Prose Form and Perspective",
        focus: "Choose the form and perspective that best communicate your idea.",
        instruction: "Personal responses may be personal, critical, creative, or a purposeful blend, but every choice must remain grounded in the film and prompt.",
        checkpoints: ["I can choose a prose form that suits my purpose.", "I can choose a clear perspective and voice.", "I can identify the audience and effect I want."],
        fields: [
          selectField("prose-form", "Prose form", ["Short essay", "Editorial", "Letter", "Screenplay", "Diary entry", "Interior monologue", "Eulogy", "Speech", "Reminiscence", "Short story", "Interview", "Anecdote", "Newspaper article", "Personal observation", "Rebuttal", "Commentary"]),
          selectField("perspective", "Perspective", ["Personal", "Critical", "Creative", "Blended"]),
          field("audience-purpose", "Audience, purpose, and voice", "Who are you addressing, what do you want the response to accomplish, and what voice will fit?")
        ]
      },
      {
        id: "response-plan",
        title: "Shape the Response",
        focus: "Plan an opening, development, and ending that suit your chosen prose form.",
        instruction: "Arrange the film evidence and personal connection so the response develops rather than becoming a list of separate ideas.",
        checkpoints: ["I can open in a way that suits my form and voice.", "I can develop the film and personal connection coherently.", "I can end with a meaningful final insight."],
        fields: [
          field("opening", "Opening move", "Draft the opening that establishes your voice, situation, or controlling idea."),
          field("development", "Development sequence", "Plan how the film evidence, analysis, and personal connection will build on one another."),
          field("ending", "Ending insight", "Draft the final realization, image, action, or statement that completes the response.")
        ]
      },
      {
        id: "draft-revise",
        title: "Draft and Revise",
        focus: "Write the complete response and revise it for support, form, voice, and correctness.",
        instruction: "Use the plan as a foundation, then make the final response sound intentional and complete in its chosen form.",
        checkpoints: ["I can sustain my controlling idea through the full response.", "I can integrate film support and personal knowledge purposefully.", "I can revise for form, voice, clarity, and correctness."],
        fields: [
          { ...field("complete-draft", "Complete response draft", "Write the complete personal response in your chosen prose form."), rows: 14 },
          field("support-check", "Evidence and connection check", "Identify where the film evidence and personal connection are strongest and where more explanation is needed."),
          field("voice-form-check", "Form, voice, and correctness check", "Record the revisions needed to make the prose form, voice, sentences, and conventions deliberate and clear.")
        ]
      }
    ]
  };
}

const FILM_VIEWING_GUIDE_FIELDS: EnglishActivityField[] = [
  selectField("viewing-pass", "Viewing pass", ["First viewing", "Rewatch", "Clip study", "Final evidence review"]),
  selectField("technique-focus", "Technique focus", ["Cinematography", "Editing", "Sound", "Mise-en-scene", "Camera movement", "Lighting", "Performance"]),
  field("initial-response", "Initial response", "What image, sound, character, or scene first shapes your reaction?"),
  field("developing-theme", "Developing theme", "What repeated conflict, image, choice, or technique may become important?"),
  field("timestamp", "Scene or timestamp", "Example: opening scene, 24:15, final conversation", undefined, "detail"),
  selectField("technique", "Technique", ["Cinematography", "Editing", "Sound", "Mise-en-scene", "Camera movement", "Lighting", "Performance"], "concept"),
  field("observation", "What happens", "Describe the moment precisely without over-summarizing.", undefined, "detail"),
  field("director-choice", "Director's choice", "Identify what the director controls in this moment.", undefined, "connection"),
  field("effect", "Effect on the viewer", "Explain what the choice makes the viewer notice, feel, or believe.", undefined, "connection"),
  field("theme", "Theme or character connection", "Connect the moment to a larger idea, change, or conflict.", undefined, "connection"),
  field("analytical-use", "Possible analytical use", "Explain how this moment could support a film response or essay.", undefined, "connection")
];

export function buildEla20FilmStudyActivityProfile(input: Ela20FilmProfileInput): EnglishFilmStudyProfile {
  assertProjectSlug(input.projectSlug);
  const configuration = input.configuration;
  const configuredTitle = configuration?.filmSelection.mode === "selected" ? configuration.filmSelection.title.trim() : undefined;
  const suppliedTitle = input.filmTitle?.trim();
  if (configuredTitle && suppliedTitle && configuredTitle !== suppliedTitle) {
    throw new Error(`Film recipe selects "${configuredTitle}", but the builder received "${suppliedTitle}".`);
  }
  const filmTitle = configuredTitle ?? suppliedTitle;
  const techniqueQuestionCount = configuration?.techniqueQuestionCount ?? FILM_TECHNIQUE_QUESTIONS.length;
  const fullResponseQuestionCount = configuration?.fullResponseQuestionCount ?? FILM_FULL_RESPONSE_QUESTIONS.length;
  if (techniqueQuestionCount > FILM_TECHNIQUE_QUESTIONS.length || fullResponseQuestionCount > FILM_FULL_RESPONSE_QUESTIONS.length) {
    throw new Error(`Film recipe requests more profile-supplied questions than are available (${FILM_TECHNIQUE_QUESTIONS.length} technique, ${FILM_FULL_RESPONSE_QUESTIONS.length} full response).`);
  }
  const questionSets: EnglishActivityQuestionSet[] = [
    {
      id: "technique-questions",
      title: "Film Technique Questions",
      subtitle: "22 profile-supplied concept prompts",
      intro: "Use these questions while studying shots, composition, movement, lighting, sound, and mise-en-scene.",
      questions: FILM_TECHNIQUE_QUESTIONS.slice(0, techniqueQuestionCount)
    },
    {
      id: "full-film-response",
      title: "Full Film Response",
      subtitle: "18 profile-supplied after-viewing prompts",
      intro: "After viewing the film you are studying, analyze character, conflict, motivation, technique, theme, and resolution.",
      questions: FILM_FULL_RESPONSE_QUESTIONS.slice(0, fullResponseQuestionCount)
    }
  ];
  assertUniqueQuestionData(questionSets, "Film Study");
  const essay = buildFilmEssay();
  const essayFieldCount = essay.stages.reduce((total, stage) => total + stage.fields.length, 0);
  if (configuration && essayFieldCount !== configuration.criticalEssayFieldCount) {
    throw new Error(`Film recipe expects ${configuration.criticalEssayFieldCount} critical-essay fields, but the profile provides ${essayFieldCount}.`);
  }
  const profile: EnglishFilmStudyProfile = {
    kind: "film-study",
    namespace: input.projectSlug,
    courseCode: input.courseCode ?? COURSE_CODE,
    unitTitle: input.unitTitle ?? "Film Study",
    evidenceBankRoute: input.evidenceBankRoute ?? "evidence-bank",
    recipeProfile: configuration,
    filmSelection: filmTitle ? { mode: "selected", title: filmTitle } : { mode: "pending" },
    essay,
    personalResponse: configuration?.activities.some((activity) => activity.enabled && activity.route === "personal-response")
      ? buildFilmPersonalResponse()
      : undefined,
    viewingGuideFields: configuration?.viewingGuide === false ? [] : FILM_VIEWING_GUIDE_FIELDS,
    questionSets,
    materials: input.materials ?? []
  };
  return finishProfile(profile);
}

export function buildEla20ActivityProfile(input: Ela20ActivityProfileFactoryInput): EnglishActivityProfile {
  switch (input.kind) {
    case "modern-drama": {
      const { kind: _kind, ...profileInput } = input;
      return buildEla20CrucibleActivityProfile(profileInput);
    }
    case "shakespeare-drama": {
      const { kind: _kind, ...profileInput } = input;
      return buildEla20MacbethActivityProfile(profileInput);
    }
    case "novel-study": {
      const { kind: _kind, ...profileInput } = input;
      return buildEla20NovelStudyActivityProfile(profileInput);
    }
    case "film-study": {
      const { kind: _kind, ...profileInput } = input;
      return buildEla20FilmStudyActivityProfile(profileInput);
    }
  }
}
