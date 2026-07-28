import type {
  EnglishActivityField,
  EnglishActivityQuestionSet,
  EnglishCriticalEssayProfile,
  EnglishMaterialHook,
  EnglishModernDramaScene,
  EnglishModernDramaProfile,
  EnglishShakespeareScene,
  EnglishShakespeareProfile,
  EnglishWritingTool
} from "./activity-profile-renderers.js";
import type {
  EnglishModernDramaActivityProfile,
  EnglishShakespeareDramaActivityProfile
} from "./types.js";

const COURSE_CODE = "ELA 10-1";

function field(id: string, label: string, placeholder: string, role?: EnglishActivityField["evidenceRole"]): EnglishActivityField {
  return { id, label, placeholder, hint: placeholder, evidenceRole: role };
}

function essay(title: string, textKind: "play" | "shakespeare"): EnglishCriticalEssayProfile {
  const locator = textKind === "play" ? "act, scene, page, or line" : "act, scene, and line";
  return {
    title: "Critical Analytical Essay",
    description: `Build a controlled interpretation of ${title} through six writing lessons, then review the combined essay preview.`,
    stages: [
      {
        id: "topic-thesis",
        title: "Topic and Thesis",
        focus: "Turn the assigned topic into one defensible controlling idea.",
        instruction: "Separate the topic, the text, and the interpretation before drafting the thesis.",
        checkpoints: ["I can answer the assigned topic directly.", "I can name the text and author accurately.", "I can state an arguable interpretation."],
        fields: [field("topic", "Assigned topic", "Restate the topic in your own words."), field("route", "Text and character route", `Name ${title}, the central character or conflict, and the development you will trace.`), field("thesis", "Working thesis", `State what the playwright suggests about the topic through ${title}.`)]
      },
      {
        id: "introduction",
        title: "Introduction",
        focus: "Move from the broader topic to the text, conflict, and thesis.",
        instruction: "Give only the context a reader needs before the controlling idea.",
        checkpoints: ["I can introduce the broader topic.", "I can identify the text and central conflict.", "I can end with a precise thesis."],
        fields: [field("opening", "Opening idea", "Introduce the topic in human terms."), field("context", "Text and conflict bridge", `Introduce ${title}, its author, and the central conflict without retelling the whole plot.`), field("thesis", "Final thesis sentence", "Draft the controlling sentence that will close the introduction.")]
      },
      ...(["beginning", "middle", "end"] as const).map((position, index) => ({
        id: `body-${index + 1}`,
        title: `Body Paragraph ${index + 1} - ${position[0]!.toUpperCase()}${position.slice(1)}`,
        focus: `Use precise ${locator} evidence to explain development at the ${position} of the text.`,
        instruction: "Build the paragraph from a focused claim, to precise evidence, to an explanation of how the evidence proves the interpretation.",
        checkpoints: ["I can make a debatable claim.", "I can identify evidence precisely.", "I can explain how the evidence supports the larger idea."],
        fields: [field("claim", `${position[0]!.toUpperCase()}${position.slice(1)} claim`, "Draft the paragraph's focused claim."), field("evidence", `${position[0]!.toUpperCase()}${position.slice(1)} evidence`, `Record the ${locator} evidence you will use.`, "detail"), field("analysis", "Analysis and thesis connection", "Explain how the evidence proves the claim and develops the controlling idea.", "connection")]
      })),
      {
        id: "conclusion-revision",
        title: "Conclusion and Revision",
        focus: "Complete the interpretation and revise the full essay for control and correctness.",
        instruction: "Synthesize the text's development, explain its broader significance, and complete a final revision pass.",
        checkpoints: ["I can restate the interpretation in fresh language.", "I can explain the larger significance.", "I can revise for structure and correctness."],
        fields: [field("synthesis", "Restated interpretation", "Restate the thesis without repeating it word for word."), field("significance", "Broader significance", "Explain what readers should understand beyond this text."), field("conclusion", "Complete conclusion", "Draft the polished conclusion paragraph."), field("revision", "Revision check", "Record the most important changes needed for structure, evidence, diction, and correctness.")]
      }
    ]
  };
}

const characterFields: EnglishActivityField[] = [
  field("traits", "First impressions and traits", "How is the character first presented?"),
  field("goals", "Goals and motivations", "What does the character want, and why?"),
  field("pressure", "Pressure and conflict", "What social, moral, family, or personal pressure acts on this character?"),
  field("relationships", "Relationships", "Which relationships reveal or change the character?"),
  field("choices", "Important choices", "Track choices and their consequences across the text."),
  field("development", "Development", "Explain what changes, what remains unresolved, and why it matters."),
  field("evidence", "Best supporting evidence", "Record an act, scene, quotation, action, or dramatic choice.", "detail")
];

function guidedFencesQuestion(id: string, section: string, prompt: string): EnglishActivityQuestionSet["questions"][number] {
  return {
    id,
    label: prompt,
    prompt,
    section,
    provenance: "profile-supplied",
    rows: 6,
    hint: "Return to the scene and support your interpretation with a precise line, stage action, relationship, or contrast."
  };
}

function buildFencesQuestionCoverage(sourceSets: EnglishActivityQuestionSet[]): EnglishActivityQuestionSet[] {
  if (sourceSets.length !== 2 || sourceSets.some((set) => !set.questions.length)) {
    throw new Error(`Fences requires its two teacher question sheets; received ${sourceSets.length}.`);
  }
  const teacherActOne = sourceSets[0]!;
  const teacherActTwo = sourceSets[1]!;
  const withSection = (set: EnglishActivityQuestionSet, section: string) => set.questions.map((question) => ({
    ...question,
    section,
    provenance: "teacher-supplied" as const
  }));
  return [
    {
      id: teacherActOne.id,
      title: "Act I Questions",
      subtitle: "Scene questions and guided analysis",
      locator: "Act I",
      questions: [
        guidedFencesQuestion("scene-1-workplace", "Act I, Scene 1", "How do Troy's workplace complaint and his stories about baseball establish both his strength and his frustration with the limits placed on him?"),
        guidedFencesQuestion("scene-1-bono", "Act I, Scene 1", "What does Bono notice about Troy and Alberta, and how does their conversation introduce pressure within Troy's marriage?"),
        ...withSection(teacherActOne, "Act I, Scene 2"),
        guidedFencesQuestion("scene-3-football", "Act I, Scene 3", "Why does Troy oppose Cory's football opportunity, and how do Troy and Cory understand responsibility, work, and racial opportunity differently?"),
        guidedFencesQuestion("scene-3-fatherhood", "Act I, Scene 3", "What does Troy's explanation of a father's duty reveal about the difference between providing for a child and showing love?"),
        guidedFencesQuestion("scene-4-fence", "Act I, Scene 4", "How does Bono's explanation that some people build fences to keep others out while others build them to keep people in develop the play's title?"),
        guidedFencesQuestion("scene-4-strike", "Act I, Scene 4", "How does the confrontation between Troy and Cory produce the first strike, and what does that warning reveal about power in their relationship?")
      ]
    },
    {
      id: teacherActTwo.id,
      title: "Act II Questions",
      subtitle: "Scene questions and guided analysis",
      locator: "Act II",
      questions: [
        guidedFencesQuestion("scene-1-confession", "Act II, Scene 1", "How does Troy explain his relationship with Alberta, and how does Rose challenge the story he tells about his needs and responsibilities?"),
        guidedFencesQuestion("scene-1-rose", "Act II, Scene 1", "What does Rose's response reveal about the sacrifices she has made and the life she expected to build with Troy?"),
        guidedFencesQuestion("scene-2-gabriel", "Act II, Scene 2", "What do Troy's decisions about Gabriel's institutional papers reveal about responsibility, guilt, and self-interest?"),
        guidedFencesQuestion("scene-2-consequences", "Act II, Scene 2", "How are the consequences of Troy's earlier choices beginning to reshape his family and his sense of control?"),
        guidedFencesQuestion("scene-3-raynell", "Act II, Scene 3", "Why does Rose agree to care for Raynell while refusing to continue as Troy's wife, and what boundary does she establish?"),
        guidedFencesQuestion("scene-3-troy", "Act II, Scene 3", "How does Troy's arrival with the baby reveal both his vulnerability and his dependence on Rose?"),
        ...withSection(teacherActTwo, "Act II, Scene 4"),
        guidedFencesQuestion("scene-5-cory", "Act II, Scene 5", "Why does Cory initially refuse to attend Troy's funeral, and what helps him reconsider his relationship with his father?"),
        guidedFencesQuestion("scene-5-raynell", "Act II, Scene 5", "How does the song shared by Cory and Raynell connect Troy's children and complicate Cory's attempt to leave his father behind?"),
        guidedFencesQuestion("scene-5-gabriel", "Act II, Scene 5", "What is the dramatic and symbolic effect of Gabriel's final attempt to open the gates of heaven?"),
        guidedFencesQuestion("scene-5-ending", "Act II, Scene 5", "How does the final scene bring together the play's ideas about inheritance, forgiveness, responsibility, and freedom?")
      ]
    }
  ];
}

export function buildEla10FencesActivityProfile(input: {
  projectSlug: string;
  materials: EnglishMaterialHook[];
  scriptScenes: EnglishModernDramaScene[];
  questionSets: EnglishActivityQuestionSet[];
  configuration: EnglishModernDramaActivityProfile;
}): EnglishModernDramaProfile {
  return {
    kind: "modern-drama",
    namespace: input.projectSlug,
    courseCode: COURSE_CODE,
    unitTitle: "Modern Play",
    evidenceBankRoute: "evidence-bank",
    recipeProfile: input.configuration,
    playTitle: "Fences",
    scriptScenes: input.scriptScenes,
    scriptSpeakers: ["Troy", "Bono", "Rose", "Lyons", "Gabriel", "Cory", "Raynell", "Both", "Cory and Raynell"],
    questionNavigation: "scene",
    materials: input.materials,
    actQuestionSets: buildFencesQuestionCoverage(input.questionSets),
    characters: ["Troy Maxson", "Rose Maxson", "Cory Maxson", "Bono", "Gabriel Maxson", "Lyons Maxson"].map((name) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name })),
    characterFields,
    essay: essay("Fences", "play")
  };
}

const merchantTools: EnglishWritingTool[] = [
  { id: "language-lab", title: "Language Lab", description: "Translate difficult phrasing, identify a language choice, and explain its effect.", evidenceMode: "none", fields: [field("passage", "Original phrase", "Record the phrase being studied."), field("meaning", "Plain-language meaning", "Restate the meaning accurately."), field("feature", "Language feature", "Identify diction, imagery, metaphor, pun, irony, or another choice."), field("effect", "Effect", "Explain what the choice reveals or emphasizes.")] },
  { id: "close-reading", title: "Close Reading Annotation Lab", description: "Annotate one short passage and save the interpretation deliberately.", evidenceMode: "individual", evidenceLabel: "Save Annotation to Evidence Bank", fields: [field("locator", "Act and scene", "Record the act and scene."), field("passage", "Passage", "Record a brief passage.", "detail"), field("choice", "Language or dramatic choice", "Identify the precise choice."), field("analysis", "Effect and meaning", "Explain what the choice reveals.", "connection")] },
  { id: "theme-builder", title: "Theme Builder", description: "Trace a recurring idea across the play.", evidenceMode: "individual", evidenceLabel: "Save Theme Response to Evidence Bank", fields: [field("topic", "Recurring topic", "Choose justice, mercy, prejudice, friendship, loyalty, wealth, love, or appearance."), field("pattern", "Pattern", "Explain how the topic develops."), field("evidence", "Scene evidence", "Record two connected moments.", "detail"), field("statement", "Thematic statement", "State what the play suggests through the pattern.", "connection")] },
  { id: "critical-essay", title: "Critical Essay Planner", description: "Plan a complete critical response using evidence from across the play.", evidenceMode: "collection", evidenceLabel: "Save Critical Essay Plan", fields: [field("topic", "Assigned topic", "Restate the topic."), field("thesis", "Working thesis", "State the controlling interpretation."), field("evidence", "Evidence sequence", "Plan beginning, middle, and ending evidence."), field("organization", "Organization", "Plan the order of claims and the final insight.")] },
  { id: "graphic-essay", title: "Graphic Essay Planner", description: "Plan the supplied graphic essay using quotations, symbolic visuals, and commentary.", evidenceMode: "collection", evidenceLabel: "Save Graphic Essay Plan", fields: [field("focus", "Controlling focus", "Name the motif, relationship, or conflict."), field("quotations", "Quotations", "Collect quotations with act and scene locators."), field("visuals", "Symbolic visuals", "Describe the visuals and their relationships."), field("commentary", "Analytical commentary", "Explain how each quotation and image supports the controlling idea.")] }
];

export function buildEla10MerchantActivityProfile(input: {
  projectSlug: string;
  materials: EnglishMaterialHook[];
  scenes: EnglishShakespeareScene[];
  questionSets: EnglishActivityQuestionSet[];
  configuration: EnglishShakespeareDramaActivityProfile;
}): EnglishShakespeareProfile {
  if (input.scenes.length !== 20) throw new Error(`The Merchant of Venice profile requires all 20 scenes; received ${input.scenes.length}.`);
  if (input.configuration.sceneCount !== input.scenes.length) {
    throw new Error(`The Merchant of Venice recipe expects ${input.configuration.sceneCount} scenes, but ${input.scenes.length} preserved scenes were supplied.`);
  }
  if (input.questionSets.length !== 5 || input.questionSets.some((set) => !set.questions.length)) {
    throw new Error("The Merchant of Venice profile requires populated Act 1 through Act 5 question collections.");
  }
  return {
    kind: "shakespeare-drama",
    namespace: input.projectSlug,
    courseCode: COURSE_CODE,
    unitTitle: "Shakespearean Drama",
    evidenceBankRoute: "evidence-bank",
    recipeProfile: input.configuration,
    playTitle: "The Merchant of Venice",
    scenes: input.scenes,
    materials: [
      {
        id: "merchant-original-text",
        title: "The Merchant of Venice Original Text",
        kind: "link",
        description: "Read the complete public-domain play through MIT Shakespeare.",
        href: "https://shakespeare.mit.edu/merchant/full.html",
        actionLabel: "Open Source",
        embeddable: true,
        status: "available"
      },
      ...input.materials
    ],
    actQuestionSets: input.questionSets,
    characters: ["Antonio", "Bassanio", "Portia", "Shylock", "Jessica", "Lorenzo"].map((name) => ({ id: name.toLowerCase(), name })),
    characterFields,
    writingTools: merchantTools,
    essay: essay("The Merchant of Venice", "shakespeare")
  };
}
