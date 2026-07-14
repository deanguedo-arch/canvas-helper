import path from "node:path";

import type { EnglishAnalysisExample, EnglishAnalysisTerm, EnglishUnitRecipeV1 } from "./types.js";

const lessonOrder = [
  "Short Stories - Introduction",
  "Lesson 1: Characters and Characterization",
  "Lesson 2: Introduction to Elements of Fiction",
  "Lesson 3: Irony",
  "Lesson 4: Point of View",
  "Lesson 5: Plot",
  "Lesson 6: Setting",
  "Lesson 7: Symbols and Motifs",
  "Lesson 8: Tone and Mood",
  "Lesson 9: Diction",
  "Lesson 10: Theme",
  "Lesson 11: Suggestions for Reading Short Stories",
  "Lesson 12: Literary Terms",
  "Lesson 13: Writing a Personal Response to Text(s)"
];

export const ELA20_SHORT_STORY_ANALYSIS_TERMS: EnglishAnalysisTerm[] = [
  {
    id: "characterization",
    category: "Elements of Fiction",
    label: "Characters and Characterization",
    definition: "How actions, dialogue, contrasts, visual choices, and stated positions reveal character or authorial stance."
  },
  {
    id: "irony",
    category: "Elements of Fiction",
    label: "Irony",
    definition: "A meaningful gap between expectation and outcome, appearance and reality, or stated purpose and actual effect."
  },
  {
    id: "point-of-view",
    category: "Elements of Fiction",
    label: "Point of View",
    definition: "The perspective, framing, or argumentative position that controls what the audience sees, knows, and evaluates."
  },
  {
    id: "plot",
    category: "Elements of Fiction",
    label: "Plot",
    definition: "How exposition, conflict, rising action, climax, and resolution organize events and develop meaning."
  },
  {
    id: "setting",
    category: "Elements of Fiction",
    label: "Setting",
    definition: "How time, place, social conditions, and atmosphere shape action, character choices, and meaning."
  },
  {
    id: "symbols-motifs",
    category: "Elements of Fiction",
    label: "Symbols and Motifs",
    definition: "An object, image, word, or recurring pattern that develops an idea beyond its literal meaning."
  },
  {
    id: "tone-mood",
    category: "Elements of Fiction",
    label: "Tone and Mood",
    definition: "Tone is the creator's attitude; mood is the feeling produced for the audience through language, imagery, sound, and visual atmosphere."
  },
  {
    id: "diction",
    category: "Elements of Fiction",
    label: "Diction",
    definition: "The deliberate word choices that establish voice, precision, attitude, emphasis, and emotional effect."
  },
  {
    id: "theme",
    category: "Elements of Fiction",
    label: "Theme",
    definition: "A larger insight about people, society, or experience developed through conflict, choices, patterns, and consequences."
  }
];

export const ELA20_SHORT_STORY_FICTION_ELEMENTS_HUB = {
  hubLesson: "Lesson 2: Introduction to Elements of Fiction",
  childLessons: lessonOrder.slice(3, 11)
};

export const ELA20_SHORT_STORY_TOP_LEVEL_LESSONS = [
  lessonOrder[0],
  lessonOrder[1],
  lessonOrder[2],
  lessonOrder[12],
  lessonOrder[11],
  lessonOrder[13]
];

export const ELA20_SHORT_STORY_MANAGED_ANALYSIS_TERM_IDS = new Set([
  "characterization",
  "conflict",
  "irony",
  "point-of-view",
  "structure-composition",
  "plot",
  "setting",
  "symbol-motif",
  "symbols-motifs",
  "tone-diction",
  "tone-mood",
  "diction",
  "theme-argument",
  "theme"
]);

type AnalysisPair = readonly [evidenceMoment: string, analysis: string];

const analysisMatrix: Record<string, Record<string, AnalysisPair[]>> = {
  "lamp-at-noon": {
    characterization: [
      ["Ellen insists that the family must leave, while Paul continues to defend the farm.", "Their opposing choices characterize Ellen as urgently protective and Paul as proud, hopeful, and increasingly trapped by his commitment."],
      ["Paul listens to the storm in the stable while Ellen watches the clock and the child inside.", "The parallel scenes reveal two isolated people responding to the same danger without being able to understand one another." ]
    ],
    conflict: [
      ["The dust storm attacks the house, crops, animals, and every attempt at ordinary family life.", "The external struggle against the environment intensifies the internal struggle within the marriage."],
      ["Ellen wants safety elsewhere; Paul believes leaving would mean abandoning the future he has worked for.", "The conflict is not simply selfishness against duty: both characters define survival differently." ]
    ],
    irony: [
      ["A lamp must be lit at noon because the storm has erased the daylight.", "The title image is ironic because noon should represent maximum light; its darkness shows how completely the farm's promise has failed."],
      ["Paul remains to preserve a home and future, yet that decision helps destroy the family he hoped to protect.", "The outcome reverses his intention and turns perseverance into a source of loss." ]
    ],
    "point-of-view": [
      ["The close third-person narration moves between Ellen's anxious waiting and Paul's struggle outside.", "The shifting focus lets readers understand both positions while emphasizing that the spouses cannot share that understanding with each other."],
      ["Storm sounds, dust, and darkness are filtered through each character's immediate physical experience.", "The limited perspective makes the setting feel personal and claustrophobic rather than merely descriptive." ]
    ],
    "structure-composition": [
      ["Interior scenes with Ellen alternate with Paul's work in the stable and fields.", "The alternating structure keeps the marital conflict and environmental conflict developing together."],
      ["The story escalates from tense waiting and argument to departure, search, and irreversible discovery.", "The compressed sequence removes opportunities for recovery and drives the narrative toward tragedy." ]
    ],
    "symbol-motif": [
      ["The lamp burns during the unnatural darkness at noon.", "The lamp becomes both a fragile sign of human endurance and a warning that the family's situation cannot continue."],
      ["Dust repeatedly enters the house, food, clothing, and characters' bodies.", "The dust motif shows that the environment cannot be kept outside; it penetrates the family's most private spaces and relationships." ]
    ],
    "tone-diction": [
      ["The clock, wind, and dust are described as if they possess hostile energy.", "Personification creates an anxious, threatening tone and turns the setting into an active antagonist."],
      ["Harsh sensory language emphasizes grit, darkness, pressure, and the sound of the storm.", "The diction makes the reader experience exhaustion and confinement instead of observing them from a safe distance." ]
    ],
    "theme-argument": [
      ["Paul and Ellen both act from understandable needs, but neither can make the other feel heard.", "The story suggests that hardship becomes more destructive when pride and fear prevent honest recognition of another person's reality."],
      ["The farm demands continued sacrifice even after evidence shows that the family is no longer safe.", "The narrative develops the idea that perseverance without adaptation can become dangerous rather than heroic." ]
    ]
  },
  "sea-devil": {
    characterization: [
      ["The fisherman chooses the challenge and solitude of night fishing.", "His routine characterizes him as independent, confident, and attracted to testing himself against nature."],
      ["He survives by changing tactics repeatedly instead of surrendering to panic.", "His actions reveal persistence and practical adaptability as the qualities that matter most under pressure." ]
    ],
    conflict: [
      ["The fishing line binds the man to the ray and drags him into a struggle for breath and control.", "The physical conflict makes human strength feel limited beside the force of an animal in its own environment."],
      ["Fear urges the man toward panic while experience forces him to observe and act deliberately.", "The internal conflict shows that survival depends on controlling fear as much as defeating an external threat." ]
    ],
    irony: [
      ["A peaceful activity the man loves becomes the cause of his brush with death.", "The reversal challenges his assumption that familiarity with the water gives him mastery over it."],
      ["The simple fishing line meant to control a catch becomes the device that traps the fisherman.", "The tool reverses roles, making the hunter behave like the captured animal." ]
    ],
    "point-of-view": [
      ["The narration stays close to the unnamed man's calculations, sensations, and changing fear.", "The limited viewpoint makes each failed escape attempt immediate while withholding any outside rescue or reassurance."],
      ["The protagonist remains unnamed throughout the ordeal.", "His anonymity makes the experience less like one biography and more like a broad encounter between human confidence and nature." ]
    ],
    "structure-composition": [
      ["A calm fishing routine is followed by foreshadowing, entanglement, repeated escape attempts, and release.", "The escalating sequence turns plot into a test of adaptation, with each failure requiring a new response."],
      ["References to the plane and causeway widen the story beyond the immediate struggle.", "These structural comparisons place modern human power beside natural forces that remain difficult to control." ]
    ],
    "symbol-motif": [
      ["The fishing line connects the man and the ray throughout the central struggle.", "The line symbolizes the dangerous bond created when a person tries to dominate a force he does not fully understand."],
      ["Dark water repeatedly hides distance, movement, and the ray's full power.", "The water motif represents the limits of human perception and control." ]
    ],
    "tone-diction": [
      ["The opening uses controlled, observant language before the prose shifts into urgent physical action.", "The tonal change mirrors the man's movement from confidence to fear."],
      ["Action verbs track pulling, twisting, cutting, surfacing, and breathing.", "The concrete diction keeps the crisis physical and makes survival feel earned through precise effort." ]
    ],
    "theme-argument": [
      ["The man survives only after recognizing the ray's power and adjusting his behaviour.", "The story suggests that respect for nature requires humility and responsiveness rather than simple courage."],
      ["Modern structures and machines exist nearby, but none automatically protects the fisherman.", "The narrative argues that technological confidence does not erase human vulnerability within the natural world." ]
    ]
  },
  "do-not-fall": {
    characterization: [
      ["Page 5 and page 6 present contrasting versions of Joseph through different visual situations.", "The contrast shows that character is constructed through context and framing, not only through direct description."],
      ["Joseph's actions and dialogue on pages 11 and 12 reveal information that earlier panels withhold.", "The later sequence asks readers to revise their first impression using behaviour as evidence." ]
    ],
    conflict: [
      ["Vertical panels and negative space on page 6 emphasize height, separation, and the possibility of falling.", "Composition makes physical danger visible while also suggesting psychological or social instability."],
      ["Frank's motivation places pressure on Joseph's choices.", "The interpersonal conflict gives the visual action a purpose beyond spectacle and forces readers to evaluate what each character wants." ]
    ],
    irony: [
      ["The Statue of Liberty shapes the story's meaning even though it never appears in a panel.", "Its absence is ironic: a famous promise of welcome and freedom is felt most strongly through what the city does not visibly provide."],
      ["New York's iconic promise contrasts with images of danger, isolation, and obscured identity.", "The contrast unsettles the expectation that arrival in the city automatically produces belonging or opportunity." ]
    ],
    "point-of-view": [
      ["Page 7 uses a gutterless medium shot while withholding the protagonist's face.", "The framing limits emotional access and makes posture, clothing, and surrounding space carry the meaning."],
      ["The sequence reveals only selected visual details instead of an all-knowing explanation.", "This restricted visual perspective makes the reader infer motive and identity from composition." ]
    ],
    "structure-composition": [
      ["Page 6 relies on negative space and vertical panels.", "The layout slows the eye, emphasizes height, and makes isolation part of the reading experience."],
      ["The final page organizes meaning through the protagonist's shirt and the placement of light and shadow.", "The visual climax gathers earlier questions about identity into a final composed image rather than a verbal explanation." ]
    ],
    "symbol-motif": [
      ["The unseen Statue of Liberty remains a reference point for interpreting New York City.", "It symbolizes freedom and welcome while its absence invites readers to question whether those promises are fulfilled."],
      ["The protagonist's shirt and the final contrast of light and shadow receive deliberate emphasis.", "These visual symbols connect personal identity with judgment, visibility, and belonging." ]
    ],
    "tone-diction": [
      ["Negative space and shadow create silence even when no narrator describes the mood.", "The visual diction produces a tense, isolated tone through absence and contrast."],
      ["Dialogue and action on pages 11 and 12 work together rather than repeating the same information.", "The combination lets spoken language reveal one layer of character while visual behaviour complicates it." ]
    ],
    "theme-argument": [
      ["The story contrasts the symbolic promise of New York with Joseph's lived experience.", "The visual narrative invites readers to consider how belonging depends on treatment and recognition, not simply location."],
      ["Readers must revise their understanding of Joseph as new visual evidence appears.", "The text develops the idea that identity cannot be judged reliably from a single image or first impression." ]
    ]
  },
  "men-must-pay": {
    characterization: [
      ["Tom Barrett's title states a moral verdict before the article presents its evidence.", "The opening characterizes his authorial stance as certain, punitive, and grounded in the language of moral repayment."],
      ["Barrett selects emotionally intense examples and words to support reinstating capital punishment.", "His choices present him as an advocate seeking moral urgency rather than a detached observer." ]
    ],
    conflict: [
      ["The article frames a conflict between punishment for wrongdoing and limits on state power.", "By emphasizing payment for evil, Barrett places retribution at the centre of the debate."],
      ["Barrett's position directly opposes Roy Cook's argument against returning to execution.", "Reading the articles together turns the issue into a clash between competing definitions of justice." ]
    ],
    irony: [
      ["The language of paying a moral debt treats death as if it could balance harm already done.", "The metaphor creates an irony the reader must examine: punishment is presented as restoration even though it produces another death."],
      ["A call for moral order relies partly on highly emotional wording.", "The tension between rational policy debate and emotional appeal complicates the article's claim to certainty." ]
    ],
    "point-of-view": [
      ["The article speaks from an openly pro-capital-punishment editorial position.", "Because the stance is declared, readers can track how evidence is selected and framed to support a predetermined conclusion."],
      ["Barrett assumes an audience concerned with accountability and public justice.", "That implied audience shapes which values receive emphasis and which counterarguments receive less attention." ]
    ],
    "structure-composition": [
      ["The title supplies the conclusion before the supporting points appear.", "This deductive structure encourages readers to interpret every later example as proof of a moral claim already announced."],
      ["Main points are reinforced with emotionally forceful language rather than presented as a neutral evidence chart.", "The organization blends claim and persuasion so the reader feels urgency while evaluating support." ]
    ],
    "symbol-motif": [
      ["The word pay operates as a repeated moral and economic metaphor.", "It turns punishment into a debt transaction, making execution sound like the completion of an obligation."],
      ["Images associated with punishment stand for a larger demand that society visibly condemn evil.", "The motif moves the debate beyond procedure and toward symbolic retribution." ]
    ],
    "tone-diction": [
      ["The title uses absolute moral language: men must pay for evil.", "The diction creates a forceful, uncompromising tone before evidence is considered."],
      ["Highly emotional words intensify the description of crime and punishment.", "The language seeks to shape judgment through feeling as well as logic, which readers should distinguish when assessing the argument." ]
    ],
    "theme-argument": [
      ["Barrett's main claim is that grave wrongdoing deserves an ultimate and visible penalty.", "The argument rests on retribution as a central principle of justice."],
      ["The strength of the article depends on whether its examples prove that execution creates justice rather than only expressing anger.", "A critical reading separates the moral claim from the quality and sufficiency of its supporting evidence." ]
    ]
  },
  "we-must-not-return": {
    characterization: [
      ["Roy Cook opens with a historical quotation before stating his opposition to capital punishment.", "The choice characterizes his authorial stance as historically conscious and concerned with what society might repeat."],
      ["Cook organizes reasons and evidence against returning to execution.", "His method presents him as an advocate attempting to build caution through documented support." ]
    ],
    conflict: [
      ["The article places demands for punishment against concerns about returning to state execution.", "The conflict asks whether justice is best served by severity or restraint."],
      ["Cook's position directly answers the retributive logic advanced by Tom Barrett.", "Together the paired texts stage a conflict between competing values, evidence, and definitions of social progress." ]
    ],
    irony: [
      ["Returning to an older punishment is presented by supporters as progress toward justice.", "Cook's title exposes the irony by framing the same action as regression."],
      ["A system intended to demonstrate respect for justice may reproduce irreversible violence.", "The tension between purpose and method invites readers to question whether the punishment contradicts the value it claims to defend." ]
    ],
    "point-of-view": [
      ["The historical quotation places the issue inside a longer public record.", "This framing asks readers to view the present debate through consequences and precedents rather than immediate emotion alone."],
      ["Cook writes from an openly anti-capital-punishment editorial perspective.", "The declared position helps readers evaluate how his evidence and counterarguments are selected." ]
    ],
    "structure-composition": [
      ["The article begins with Radclive's quotation and then develops points supported by evidence.", "The opening establishes historical context before the argument moves into present judgment."],
      ["Cook's claims can be mapped beside the evidence offered for each one.", "The structure invites readers to test support systematically rather than accepting the conclusion from tone alone." ]
    ],
    "symbol-motif": [
      ["The noose in the title stands for the entire institution of capital punishment.", "The concrete object condenses a complex policy debate into an image of irreversible state violence."],
      ["The word return creates a recurring movement backward.", "The motif frames execution as a reversal of social development rather than a new solution." ]
    ],
    "tone-diction": [
      ["The phrase must not return expresses urgency while defining the policy as regression.", "The diction is firm, but its emotional direction differs from Barrett's language of repayment."],
      ["Historical quotation and evidence-based paragraphs create a cautionary tone.", "The restrained presentation aims to make opposition appear considered rather than reactive." ]
    ],
    "theme-argument": [
      ["Cook's central claim is that society should not restore capital punishment.", "The argument treats restraint and attention to evidence as measures of justice and progress."],
      ["The article's persuasiveness depends on how well each claim is connected to reliable support.", "A critical response should compare evidence quality with Barrett's emotional and retributive appeals rather than choosing by tone alone." ]
    ]
  }
};

const supplementalWorkbenchAnalysis: Record<
  string,
  { setting: AnalysisPair[]; "tone-mood": AnalysisPair[]; diction: AnalysisPair[] }
> = {
  "lamp-at-noon": {
    setting: [
      ["The farm is isolated on a drought-stricken prairie while a dust storm blocks the noon light.", "The physical setting creates scarcity and confinement, making every family decision feel urgent and dangerous."],
      ["Dust crosses the boundaries of the house and stable despite Ellen's and Paul's efforts to keep it out.", "The setting is not passive background; it invades domestic space and intensifies the breakdown of the marriage."]
    ],
    "tone-mood": [
      ["The wind, clock, darkness, and dust are presented as persistent hostile forces.", "Ross's threatening tone creates a claustrophobic, anxious mood in which ordinary waiting feels like an approaching disaster."],
      ["The final movement replaces argument with frantic searching and irreversible loss.", "The tone shifts from tense frustration to tragedy, leaving the reader with grief rather than a simple judgment about which spouse was right."]
    ],
    diction: [
      ["Harsh sensory words emphasize grit, darkness, pressure, and the sound of the storm.", "The abrasive diction makes the environment feel physically present and prevents the reader from treating the drought as distant background."],
      ["Repeated language connected to wind, dust, listening, and waiting surrounds Paul and Ellen.", "This word pattern links the external storm with their emotional strain and reinforces the sense that neither character can escape the crisis."]
    ]
  },
  "sea-devil": {
    setting: [
      ["The fisherman works alone on dark coastal water at night, beyond immediate help.", "The isolated setting removes easy rescue and makes his knowledge, judgment, and physical endurance the only available protections."],
      ["The causeway and passing aircraft remain near enough to suggest modern human power but too distant to save him.", "The contrast between the surrounding human world and the water emphasizes how vulnerable one person remains inside nature."]
    ],
    "tone-mood": [
      ["The opening observes the fisherman's familiar routine in controlled, confident language.", "The steady tone creates calm before the encounter, allowing the later panic to feel sharper and more disruptive."],
      ["During the struggle, rapid physical actions and repeated threats to breath replace the opening calm.", "The urgent tone produces a tense, breathless mood that follows the fisherman's changing fear and determination." ]
    ],
    diction: [
      ["Concrete action verbs track pulling, twisting, cutting, surfacing, and breathing.", "The precise diction keeps the crisis physical and shows survival as a sequence of deliberate adjustments rather than luck alone."],
      ["Observational language identifies the line, water, animal movement, and the man's bodily reactions.", "This practical vocabulary reflects an experienced fisherman trying to think clearly while fear threatens his control." ]
    ]
  },
  "do-not-fall": {
    setting: [
      ["Vertical panels, height, negative space, and New York architecture frame Joseph's movement.", "The urban setting creates both physical risk and social isolation, making the city feel imposing rather than welcoming."],
      ["The Statue of Liberty influences the story's meaning even though it is not shown directly.", "The setting carries a cultural promise of freedom and belonging that the character's experience complicates." ]
    ],
    "tone-mood": [
      ["Shadow, empty space, and withheld facial detail dominate key panels.", "The restrained visual tone produces an uneasy, isolated mood and makes the reader search the images for emotional information."],
      ["Later dialogue and action reveal details that earlier pages deliberately withheld.", "The tonal movement from uncertainty toward recognition changes how the reader judges Joseph and the surrounding conflict." ]
    ],
    diction: [
      ["Dialogue is brief and selective, leaving much of the story's meaning to images and sequencing.", "The sparse diction prevents characters from explaining everything and requires the reader to interpret posture, framing, and action."],
      ["The title uses the direct command 'Do Not Fall' alongside the specific place name New York City.", "The imperative diction creates immediate danger while the city name adds expectations about opportunity, identity, and belonging." ]
    ]
  },
  "men-must-pay": {
    setting: [
      ["The article is situated within a public debate about whether capital punishment should be restored.", "This social and political setting shapes the writer's evidence choices and makes justice, punishment, and state power the central context."],
      ["The text is paired with an opposing editorial on the same policy question.", "The paired setting asks readers to compare arguments rather than treating one writer's position as neutral background information." ]
    ],
    "tone-mood": [
      ["The title announces that offenders 'must pay' for evil before the supporting points begin.", "The forceful, morally certain tone creates urgency and encourages anger at wrongdoing."],
      ["Emotionally intense examples and absolute language reinforce the call for punishment.", "The charged tone may make the argument feel decisive, but it also requires readers to separate emotional impact from evidentiary strength." ]
    ],
    diction: [
      ["The words 'must,' 'pay,' and 'evil' frame punishment as an unavoidable moral debt.", "This diction turns a policy choice into an obligation and narrows the space for compromise before the argument is developed."],
      ["Descriptions of crime and punishment rely on emotionally powerful vocabulary.", "The word choice appeals to outrage and retribution, shaping the audience's judgment through feeling as well as logic." ]
    ]
  },
  "we-must-not-return": {
    setting: [
      ["The article places the present policy debate beside a historical quotation and earlier practices of execution.", "The historical setting encourages readers to judge restoration of capital punishment as a possible return to a rejected past."],
      ["Cook's position appears beside Barrett's opposing demand for retribution.", "The paired-perspectives setting makes the article part of a live argument about competing definitions of justice and social progress." ]
    ],
    "tone-mood": [
      ["Historical framing and evidence-based paragraphs create a measured, cautionary voice.", "The restrained tone produces concern without copying the retributive anger of the opposing article."],
      ["The phrase 'must not return' combines firmness with the image of backward movement.", "The urgent tone creates a mood of warning and presents the decision as one with irreversible consequences." ]
    ],
    diction: [
      ["The title's words 'must not return' define execution as regression rather than restoration.", "This diction frames the policy choice morally and historically before the body of the argument supplies evidence."],
      ["The concrete word 'noose' stands in for the broader institution of capital punishment.", "The word choice makes an abstract policy debate physically vivid and emphasizes the finality of state execution." ]
    ]
  }
};

const workbenchAnalysisMatrix: Record<string, Record<string, AnalysisPair[]>> = Object.fromEntries(
  Object.entries(analysisMatrix).map(([readingId, terms]) => [
    readingId,
    {
      characterization: terms.characterization,
      irony: terms.irony,
      "point-of-view": terms["point-of-view"],
      plot: terms["structure-composition"],
      setting: supplementalWorkbenchAnalysis[readingId].setting,
      "symbols-motifs": terms["symbol-motif"],
      "tone-mood": supplementalWorkbenchAnalysis[readingId]["tone-mood"],
      diction: supplementalWorkbenchAnalysis[readingId].diction,
      theme: terms["theme-argument"]
    }
  ])
);

const analysisTermLabel = new Map(ELA20_SHORT_STORY_ANALYSIS_TERMS.map((term) => [term.id, term.label]));

export const ELA20_SHORT_STORY_ANALYSIS_EXAMPLES: EnglishAnalysisExample[] = Object.entries(workbenchAnalysisMatrix).flatMap(
  ([readingId, terms]) =>
    Object.entries(terms).flatMap(([termId, examples]) =>
      examples.map(([evidenceMoment, analysis]) => ({
        readingId,
        termId,
        term: analysisTermLabel.get(termId) ?? termId,
        evidenceMoment,
        analysis
      }))
    )
);

export function createEla20ShortStoriesPilotRecipe(input: {
  projectSlug: string;
  brightspaceRawFile: string;
  teacherRawFile: string;
  unitId: string;
}): EnglishUnitRecipeV1 {
  return {
    schemaVersion: 1,
    projectSlug: input.projectSlug,
    courseCode: "ELA 20-1",
    courseTitle: "Short Stories",
    unitTitle: "Unit 1: Short Stories",
    source: {
      brightspaceZip: path.posix.join("raw", input.brightspaceRawFile),
      teacherResourcesZip: path.posix.join("raw", input.teacherRawFile),
      brightspaceUnitId: input.unitId,
      teacherFolder: "UNIT 1 Short Story"
    },
    lessonOrder,
    topLevelLessonOrder: [...ELA20_SHORT_STORY_TOP_LEVEL_LESSONS],
    fictionElementsHub: { ...ELA20_SHORT_STORY_FICTION_ELEMENTS_HUB },
    readings: [
      {
        id: "lamp-at-noon",
        title: "The Lamp at Noon",
        author: "Sinclair Ross",
        kind: "short-fiction",
        group: "Short Fiction",
        readingFile: "Lamp at Noon.pdf",
        questionFile: "Lamp at Noon.pdf",
        questionPages: [9],
        questionPrompts: [
          {
            id: "1",
            sourcePage: 9,
            prompt:
              "Identify examples of foreshadowing, personification, metaphor, imagery, symbol, simile, and irony. Explain the meaning of each example and how each contributes to the story."
          },
          { id: "2", sourcePage: 9, prompt: "What do Paul and Ellen argue about? Who do you think is correct, and why?" },
          {
            id: "3",
            sourcePage: 9,
            prompt:
              "Reread the paragraph beginning 'Tense, she fixed her eyes upon the clock, listening.' Explain the effect of its personification and possible foreshadowing. Compare it with the description of the wind as Paul listens in the stable."
          },
          {
            id: "4",
            sourcePage: 9,
            prompt:
              "Why does Paul wish to remain on the land? Why does Ellen wish to leave? Paul suggests that she is thinking only of herself; what do you think?"
          },
          { id: "5", sourcePage: 9, prompt: "Who or what, in your opinion, is responsible for the death in this story?" },
          { id: "6", sourcePage: 9, prompt: "Identify the protagonist and the antagonist in the story." },
          { id: "7", sourcePage: 9, prompt: "How does the story's main conflict help to illustrate its theme?" },
          { id: "8", sourcePage: 9, prompt: "Are there times when one must think selfishly? Explain your response." }
        ]
      },
      {
        id: "sea-devil",
        title: "The Sea Devil",
        author: "Arthur Gordon",
        kind: "short-fiction",
        group: "Short Fiction",
        readingFile: "Sea Devil Text.pdf",
        questionFile: "Sea Devil Questions.pdf"
      },
      {
        id: "do-not-fall",
        title: "Do Not Fall in New York City",
        author: "Garth Ennis and Steve Dillon",
        kind: "visual-narrative",
        group: "Visual Narrative",
        readingFile: "Do Not Fall in New York Comic.pdf",
        questionFile: "Do Not Fall Questions.pdf"
      },
      {
        id: "men-must-pay",
        title: "Men Must Pay for Evil They Do",
        author: "Tom Barrett",
        kind: "paired-perspective",
        group: "Paired Perspectives",
        readingFile: "Men Must Pay Text.pdf",
        questionFile: "Men Must Pay for Evil they do questions.pdf"
      },
      {
        id: "we-must-not-return",
        title: "We Must Not Return to the Noose",
        author: "Roy Cook",
        kind: "paired-perspective",
        group: "Paired Perspectives",
        readingFile: "We Must not Return Text.pdf",
        questionFile: "We Must not Return Questions.pdf"
      }
    ],
    placements: [
      {
        targetLesson: "Lesson 1: Characters and Characterization",
        readingIds: ["sea-devil", "do-not-fall"],
        questionRefs: ["sea-devil:3", "do-not-fall:3", "do-not-fall:4", "do-not-fall:5"],
        purpose: "Compare characterization through action, conflict, dialogue, and visual choices."
      },
      {
        targetLesson: "Lesson 3: Irony",
        readingIds: ["lamp-at-noon"],
        questionRefs: ["lamp-at-noon:1"],
        purpose: "Connect irony and figurative language to the story's central conflict."
      },
      {
        targetLesson: "Lesson 4: Point of View",
        readingIds: ["men-must-pay", "we-must-not-return"],
        questionRefs: ["men-must-pay:1", "we-must-not-return:4"],
        purpose: "Compare how two writers frame opposing positions on the same issue."
      },
      {
        targetLesson: "Lesson 5: Plot",
        readingIds: ["sea-devil"],
        questionRefs: ["sea-devil:2", "sea-devil:3"],
        purpose: "Trace foreshadowing, escalating attempts, climax, and survival."
      },
      {
        targetLesson: "Lesson 6: Setting",
        readingIds: ["lamp-at-noon"],
        questionRefs: ["lamp-at-noon:3", "lamp-at-noon:4"],
        purpose: "Analyze how the dust storm and the farm shape decision, mood, and conflict."
      },
      {
        targetLesson: "Lesson 7: Symbols and Motifs",
        readingIds: ["lamp-at-noon", "do-not-fall"],
        questionRefs: ["lamp-at-noon:1", "do-not-fall:6", "do-not-fall:7"],
        purpose: "Interpret recurring images and visual symbols as evidence of larger ideas."
      },
      {
        targetLesson: "Lesson 8: Tone and Mood",
        readingIds: ["men-must-pay", "we-must-not-return"],
        questionRefs: ["men-must-pay:3", "we-must-not-return:2"],
        purpose: "Compare how emotional intensity and restraint affect an argument."
      },
      {
        targetLesson: "Lesson 9: Diction",
        readingIds: ["men-must-pay", "we-must-not-return"],
        questionRefs: ["men-must-pay:3", "we-must-not-return:1"],
        purpose: "Examine word choice, quotation, and emotional language in persuasive nonfiction."
      },
      {
        targetLesson: "Lesson 10: Theme",
        readingIds: ["lamp-at-noon", "sea-devil", "do-not-fall", "men-must-pay", "we-must-not-return"],
        questionRefs: ["lamp-at-noon:7", "sea-devil:5", "do-not-fall:6", "we-must-not-return:4"],
        purpose: "Build theme statements by comparing evidence across fiction, visual narrative, and nonfiction."
      },
      {
        targetLesson: "Lesson 12: Literary Terms",
        readingIds: ["lamp-at-noon", "sea-devil", "do-not-fall", "men-must-pay", "we-must-not-return"],
        questionRefs: [],
        purpose: "Apply the literary vocabulary to the five assigned texts."
      },
      {
        targetLesson: "Lesson 13: Writing a Personal Response to Text(s)",
        readingIds: ["lamp-at-noon", "sea-devil", "do-not-fall", "men-must-pay", "we-must-not-return"],
        questionRefs: ["lamp-at-noon:8", "men-must-pay:4", "we-must-not-return:5"],
        purpose: "Plan an evidence-based personal, critical, or creative response without an assessment gate."
      }
    ],
    analysisTerms: ELA20_SHORT_STORY_ANALYSIS_TERMS,
    analysisExamples: ELA20_SHORT_STORY_ANALYSIS_EXAMPLES,
    excludedFiles: [
      {
        file: "SHORT STORY HARD GATE Personal Response-the Hours.pdf",
        reason: "Hard-gate assessment explicitly excluded from this pilot."
      },
      {
        file: "SHORT STORY UNIT SOFT GATE ASSESSMENT Circus in Town RC Questions.docx",
        reason: "Soft-gate assessment explicitly excluded from this pilot."
      },
      {
        file: "SHORT STORY UNIT SOFT GATE ASSESSMENT Circus in Town RC Readings.doc",
        reason: "Soft-gate assessment reading explicitly excluded from this pilot."
      }
    ],
    wordingCorrections: [
      { find: "English 30-1", replace: "English 20-1", reason: "Correct inherited grade-level wording." },
      { find: "Diploma Exam", replace: "course writing", reason: "Remove diploma-specific framing from an ELA 20-1 unit." },
      { find: "diploma exam", replace: "course writing", reason: "Remove diploma-specific framing from an ELA 20-1 unit." }
    ],
    mediaPolicy: {
      verifiedAt: "2026-07-13",
      allowedYouTubeIds: ["1KbDdiku75E", "j1bfOBBl6pQ", "SKi56cPUSFk", "WH5jlkK4aUI", "30CPmgVQNks", "FzpJnYIQv98", "YcCrsVK5dWs", "urEh4_fTtao"],
      blockedYouTubeIds: ["vhxLbjYOmrg", "RecVd-6g-IY"],
      approvedExternalUrls: [
        "https://literarydevices.net/play/",
        "https://literarydevices.net/character/",
        "https://owl.purdue.edu/owl/subject_specific_writing/writing_in_literature/literary_terms/index.html",
        "https://www.eldritchpress.org/nh/dhe.html",
        "https://www.dowse.com/fiction/Lawrence.html",
        "https://www.bibliomania.com/0/0/29/63/frameset.html",
        "https://wilstar.com/xmas/xmassymb.htm"
      ],
      externalUrlRewrites: {
        "https://owl.english.purdue.edu/owl/resource/575/01/": "https://owl.purdue.edu/owl/subject_specific_writing/writing_in_literature/literary_terms/index.html",
        "http://www.eldritchpress.org/nh/dhe.html": "https://www.eldritchpress.org/nh/dhe.html",
        "http://www.dowse.com/fiction/Lawrence.html": "https://www.dowse.com/fiction/Lawrence.html",
        "http://www.bibliomania.com/0/0/29/63/frameset.html": "https://www.bibliomania.com/0/0/29/63/frameset.html",
        "http://wilstar.com/xmas/xmassymb.htm": "https://wilstar.com/xmas/xmassymb.htm"
      }
    }
  };
}
