export type ParagraphArchitectStepId = "p" | "e" | "t" | "a" | "l";

export type ParagraphArchitectChoice = {
  id: string;
  text: string;
  type: "analytical" | "trap";
  trapMsg?: string;
};

export type ParagraphArchitectScenario = {
  id: string;
  title: string;
  theme: string;
  steps: Record<ParagraphArchitectStepId, ParagraphArchitectChoice[]>;
};

export type ParagraphArchitectStep = {
  id: ParagraphArchitectStepId;
  label: string;
  description: string;
};

export type ParagraphArchitectActivity = {
  title: string;
  description: string;
  steps: ParagraphArchitectStep[];
  scenarios: ParagraphArchitectScenario[];
};

export const PARAGRAPH_ARCHITECT_ACTIVITY_SOURCE = "C:\\Users\\dean.guedo\\Downloads\\petal_paragraph_architect.tsx";

export const PARAGRAPH_ARCHITECT_ACTIVITY: ParagraphArchitectActivity = {
  title: "Paragraph Architect",
  description: "Build a PETAL body paragraph by choosing a point, evidence, technique, analysis, and link that stay analytical.",
  steps: [
    { id: "p", label: "Point", description: "Topic sentence. Address the character's goal, conflict, or result." },
    { id: "e", label: "Evidence", description: "Integrate a precise quotation or vivid moment from the text." },
    { id: "t", label: "Technique", description: "Identify the specific literary device or dramatic technique." },
    { id: "a", label: "Analyze", description: "Explain how the evidence and technique prove the point." },
    { id: "l", label: "Link", description: "Connect the analysis back to the thesis and universal theme." }
  ],
  scenarios: [
    {
      id: "s1",
      title: "Blanche's Illusion",
      theme: "Illusion vs. Reality",
      steps: {
        p: [
          { id: "p1", text: "Driven by a desperate goal to secure sanctuary, Blanche constructs a fragile facade of Southern purity that inevitably clashes with the harsh reality of her new environment.", type: "analytical" },
          { id: "p2", text: "Blanche takes a streetcar to Stella's house to hide from her past.", type: "trap", trapMsg: "Plot summary trap. A topic sentence must make an analytical claim about the character's goal, conflict, or result." }
        ],
        e: [
          { id: "e1", text: "She takes a lot of baths in the apartment.", type: "trap", trapMsg: "Vague evidence trap. Use a precise, vivid moment or direct quotation to anchor your analysis." },
          { id: "e2", text: "She purchases a cheap paper lantern to cover the naked light bulb in the Kowalski bedroom.", type: "analytical" }
        ],
        t: [
          { id: "t1", text: "Metaphor", type: "trap", trapMsg: "Incorrect technique. The lantern is a physical stage object, not a figurative comparison in dialogue." },
          { id: "t2", text: "Symbolic Prop / Thematic Motif", type: "analytical" }
        ],
        a: [
          { id: "a1", text: "By physically filtering the harsh, exposing glare of the bulb, the lantern acts as a tangible manifestation of her psychological need to soften reality and hide her fading youth.", type: "analytical" },
          { id: "a2", text: "This shows she does not like bright lights because they hurt her eyes and make her look old.", type: "trap", trapMsg: "Literal trap. Analyze how the technique proves the point about her psychological facade." }
        ],
        l: [
          { id: "l1", text: "Ultimately, this desperate reliance on artificial magic highlights the tragic vulnerability of individuals who use illusion as a shield against an unforgiving world.", type: "analytical" },
          { id: "l2", text: "This leads to the result of her going crazy and being taken away.", type: "trap", trapMsg: "Plot summary trap. The link must connect back to the universal thesis, not just tell how the story ends." }
        ]
      }
    },
    {
      id: "s2",
      title: "Stanley's Dominance",
      theme: "Power & Primal Reality",
      steps: {
        p: [
          { id: "p1", text: "Stanley gets mad at Blanche for staying in his apartment and ruining his life.", type: "trap", trapMsg: "Colloquial trap. State the underlying conflict of values using elevated vocabulary." },
          { id: "p2", text: "Stanley's goal of maintaining absolute patriarchal dominance creates an immediate, insurmountable conflict with Blanche's aristocratic presence.", type: "analytical" }
        ],
        e: [
          { id: "e1", text: "He heaves a blood-stained package of raw meat at Stella in the opening scene.", type: "analytical" },
          { id: "e2", text: "He plays poker with his friends in the kitchen.", type: "trap", trapMsg: "Weak evidence trap. The poker game needs more explanation than a direct, violently symbolic action." }
        ],
        t: [
          { id: "t1", text: "Zoomorphic Imagery / Symbolic Stage Action", type: "analytical" },
          { id: "t2", text: "Irony", type: "trap", trapMsg: "Incorrect technique. This action is a direct display of primal character, not irony." }
        ],
        a: [
          { id: "a1", text: "This proves he went to the butcher to get food for dinner.", type: "trap", trapMsg: "Literal trap. Analyze the symbolic meaning of the playwright's stage action." },
          { id: "a2", text: "This primal gesture immediately establishes him as a brutal hunter-gatherer, reducing their domestic dynamic to one of coarse, animalistic subservience.", type: "analytical" }
        ],
        l: [
          { id: "l1", text: "Therefore, Stanley is the villain of the story.", type: "trap", trapMsg: "Moralizing trap. Analyze what Stanley represents thematically rather than judging him." },
          { id: "l2", text: "Consequently, Williams establishes that in the modern, industrialized New South, raw physical power will violently overcome delicate social refinement.", type: "analytical" }
        ]
      }
    },
    {
      id: "s3",
      title: "Stella's Choice",
      theme: "Self-Preservation",
      steps: {
        p: [
          { id: "p1", text: "Caught between two opposing worlds, Stella's realization that she cannot survive without Stanley forces her to abandon objective truth.", type: "analytical" },
          { id: "p2", text: "Stella has a conflict because she loves Stanley but also loves her sister Blanche.", type: "trap", trapMsg: "Vague trap. Use elevated vocabulary such as opposing worlds and objective truth." }
        ],
        e: [
          { id: "e1", text: "She tells Eunice, 'I couldn't believe her story and go on living with Stanley.'", type: "analytical" },
          { id: "e2", text: "She goes back to Stanley at the end of the play.", type: "trap", trapMsg: "Plot summary trap. Choose a specific piece of dialogue or stage direction." }
        ],
        t: [
          { id: "t1", text: "Foreshadowing", type: "trap", trapMsg: "Incorrect technique. This occurs near the end and resolves her conflict rather than foreshadowing it." },
          { id: "t2", text: "Explicit Dialogue / Internal Conflict", type: "analytical" }
        ],
        a: [
          { id: "a1", text: "Her conscious choice to disbelieve Blanche reveals that her primal, physical bond to her husband supersedes her aristocratic loyalty to her sister.", type: "analytical" },
          { id: "a2", text: "This means she genuinely thinks Blanche is a liar.", type: "trap", trapMsg: "Literal trap. She likely knows Blanche is telling the truth; analyze the psychology of choosing disbelief." }
        ],
        l: [
          { id: "l1", text: "Through Stella's tragic compromise, the play suggests that self-preservation in a hostile environment often demands devastating moral sacrifices.", type: "analytical" },
          { id: "l2", text: "This shows Stella is a terrible sister.", type: "trap", trapMsg: "Moralizing trap. Analyze the thematic result of the choice rather than judging her." }
        ]
      }
    },
    {
      id: "s4",
      title: "Mitch's Conformity",
      theme: "Toxic Social Expectations",
      steps: {
        p: [
          { id: "p1", text: "Seeking a socially acceptable sanctuary, Mitch initially presents a facade of gentility that eventually collapses under the pressure of patriarchal conformity.", type: "analytical" },
          { id: "p2", text: "Mitch wants to marry Blanche but then finds out she lied about her past.", type: "trap", trapMsg: "Plot summary trap. Focus on internal conflict or social conformity, not just what happens." }
        ],
        e: [
          { id: "e1", text: "He brutally tears the paper lantern off the lightbulb to get a 'good look' at Blanche in the light.", type: "analytical" },
          { id: "e2", text: "He tells her she is not clean enough to bring in the house with his mother.", type: "trap", trapMsg: "Weak evidence trap. The physical action of tearing the lantern offers deeper symbolic analysis." }
        ],
        t: [
          { id: "t1", text: "Symbolic Stage Action / Character Foil", type: "analytical" },
          { id: "t2", text: "Personification", type: "trap", trapMsg: "Incorrect technique. He is not giving human traits to a non-human object." }
        ],
        a: [
          { id: "a1", text: "By physically ripping away the protective filter, Mitch adopts Stanley's ruthless realism, weaponizing the harsh light to expose and shame Blanche.", type: "analytical" },
          { id: "a2", text: "This shows he finally realizes she is old and has been lying about her age.", type: "trap", trapMsg: "Literal trap. Analyze the power dynamic and his adoption of Stanley's cruel methods." }
        ],
        l: [
          { id: "l1", text: "This just proves that Mitch is actually a jerk just like Stanley.", type: "trap", trapMsg: "Colloquial and moralizing trap. Focus on the universal theme rather than judging the character." },
          { id: "l2", text: "Ultimately, his betrayal underscores how societal pressures to conform to aggressive masculine standards can eradicate compassion and genuine connection.", type: "analytical" }
        ]
      }
    },
    {
      id: "s5",
      title: "Blanche's Grief",
      theme: "Unresolved Trauma",
      steps: {
        p: [
          { id: "p1", text: "Paralyzed by the guilt of her husband's suicide, Blanche is unable to escape the psychological haunting of her past, causing her to retreat into madness.", type: "analytical" },
          { id: "p2", text: "Blanche feels bad because her husband Allan died when they were very young.", type: "trap", trapMsg: "Colloquial trap. Use terms such as paralyzed by guilt or unresolved trauma." }
        ],
        e: [
          { id: "e1", text: "She talks about Allan to Mitch while they are on their date.", type: "trap", trapMsg: "Vague trap. Use a specific dramatic technique or vivid moment." },
          { id: "e2", text: "The Varsouviana polka music plays loudly in her mind, stopping only when she hears the gunshot.", type: "analytical" }
        ],
        t: [
          { id: "t1", text: "Auditory Motif / Expressionism", type: "analytical" },
          { id: "t2", text: "Allegory", type: "trap", trapMsg: "Incorrect technique. The music is an auditory motif, not an allegory." }
        ],
        a: [
          { id: "a1", text: "The relentless, cyclical melody externalizes her internal trauma, trapping her mind in a continuous loop of her greatest failure until she finds artificial release.", type: "analytical" },
          { id: "a2", text: "This shows that she really likes polka music but it reminds her of a sad time.", type: "trap", trapMsg: "Literal trap. The music is an expressionistic tool showing her fracturing mind." }
        ],
        l: [
          { id: "l1", text: "Consequently, Williams illustrates that unresolved grief, when confronted by an unforgiving reality, will inevitably fracture an individual's sanity.", type: "analytical" },
          { id: "l2", text: "This shows that you should always deal with your problems or you will go crazy.", type: "trap", trapMsg: "Moralizing trap. State the author's universal truth objectively." }
        ]
      }
    },
    {
      id: "s6",
      title: "Destructive Passion",
      theme: "Unchecked Desire",
      steps: {
        p: [
          { id: "p1", text: "Driven by overwhelming, animalistic desire, Stella and Stanley's relationship represents a destructive, intoxicating passion that blinds individuals to moral atrocities.", type: "analytical" },
          { id: "p2", text: "Stanley and Stella fight a lot but they always make up because they love each other.", type: "trap", trapMsg: "Colloquial trap. This ignores the dark, destructive undercurrent of the relationship." }
        ],
        e: [
          { id: "e1", text: "After Stanley hits Stella, they reconcile with 'low, animal moans' as she is carried into the dark flat.", type: "analytical" },
          { id: "e2", text: "Stella goes upstairs to Eunice's apartment but then comes back down.", type: "trap", trapMsg: "Plot summary trap. Select evidence with strong literary or symbolic weight." }
        ],
        t: [
          { id: "t1", text: "Simile", type: "trap", trapMsg: "Incorrect technique. The stage directions use zoomorphic imagery rather than a like-or-as simile." },
          { id: "t2", text: "Zoomorphic Imagery / Stage Directions", type: "analytical" }
        ],
        a: [
          { id: "a1", text: "This means that they act like animals sometimes when they are mad.", type: "trap", trapMsg: "Vague analysis trap. Explain why Williams reduces them to animalistic behavior." },
          { id: "a2", text: "The reduction of their reconciliation to guttural sounds physicalizes their bond as purely instinctual, stripped of any rational or ethical consideration.", type: "analytical" }
        ],
        l: [
          { id: "l1", text: "Through this primal dynamic, the play warns that unchecked physical desire often requires the sacrifice of moral clarity and social refinement.", type: "analytical" },
          { id: "l2", text: "This proves that Desire is the main theme of the play.", type: "trap", trapMsg: "Circular logic trap. Explain what the play says about desire, not just that desire exists." }
        ]
      }
    }
  ]
};
