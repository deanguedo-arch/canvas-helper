export type EvidenceCollectorChoice = {
  id: string;
  text: string;
  desc?: string;
  category?: string;
  type?: "analytical" | "trap";
  trapMsg?: string;
};

export type EvidenceCollectorActivity = {
  title: string;
  description: string;
  categories: string[];
  devices: EvidenceCollectorChoice[];
  evidence: Record<string, EvidenceCollectorChoice[]>;
  verbs: EvidenceCollectorChoice[];
  functions: EvidenceCollectorChoice[];
};

export const EVIDENCE_COLLECTOR_ACTIVITY_SOURCE = "C:\\Users\\dean.guedo\\Downloads\\evidence_collector_activity.tsx";

export const EVIDENCE_COLLECTOR_ACTIVITY: EvidenceCollectorActivity = {
  title: "Evidence Collector",
  description: "Build a precise analytical evidence sentence by connecting literary device, textual evidence, analytical verb, and thematic function.",
  categories: [
    "The Basics",
    "Interpreting Characters",
    "Interpreting Plot",
    "Interpreting Word Choice & Voice",
    "Layers of Meaning"
  ],
  devices: [
    { id: "d1", category: "The Basics", text: "Imagery", desc: "Vivid descriptions evoking sense-impressions" },
    { id: "d2", category: "The Basics", text: "Symbolism", desc: "Objects representing abstract concepts" },
    { id: "d3", category: "The Basics", text: "Tone", desc: "Word-choice and style conveying a specific attitude" },
    { id: "d4", category: "Interpreting Characters", text: "Protagonist / Anti-Hero", desc: "The primary figure, humanized by deep flaws" },
    { id: "d5", category: "Interpreting Characters", text: "Antagonist", desc: "The figure actively opposing the protagonist" },
    { id: "d6", category: "Interpreting Characters", text: "Archetype", desc: "A resonant figure of mythic or historical importance" },
    { id: "d7", category: "Interpreting Plot", text: "Exposition", desc: "Introduction of background, setting, and conflict" },
    { id: "d8", category: "Interpreting Plot", text: "Climax", desc: "The height of conflict where destinies are unclear" },
    { id: "d9", category: "Interpreting Word Choice & Voice", text: "Diction", desc: "Specific language and phrasing used by a character" },
    { id: "d10", category: "Interpreting Word Choice & Voice", text: "Irony", desc: "A situation contradicting expectations or truths" },
    { id: "d11", category: "Layers of Meaning", text: "Allegory", desc: "Tangible elements representing broader historical/social concepts" },
    { id: "d12", category: "Layers of Meaning", text: "Metaphor / Simile", desc: "Comparing elements to identify profound similarities" }
  ],
  evidence: {
    d1: [
      { id: "e1", text: "the vibrant description of the poker players wearing 'solid blues, a purple, a red-and-white check' to evoke raw, primary masculinity", type: "analytical" },
      { id: "e2", text: "the 'lurid reflections' and 'grotesque and menacing' shadows projected on the walls", type: "analytical" },
      { id: "e3", text: "the guys wearing bright colored shirts during the poker game", type: "trap", trapMsg: "Imagery trap. Do not just summarize what they wear. Use imagery to explain the sense-impression and its significance." }
    ],
    d2: [
      { id: "e4", text: "the fragile paper lantern purchased to artificially filter out the harsh glare of the naked bulb", type: "analytical" },
      { id: "e5", text: "the blood-stained package of meat heaved at Stella in the opening scene", type: "analytical" },
      { id: "e6", text: "Blanche putting a lantern on the light to hide her age", type: "trap", trapMsg: "Literal trap. Elevate the bulb as truth and the lantern as illusion." }
    ],
    d3: [
      { id: "e7", text: "the melancholic, fatalistic notes of the 'blue piano' that establish a mood of inevitable tragedy", type: "analytical" },
      { id: "e8", text: "the claustrophobic, oppressive stage directions describing the sweltering New Orleans heat", type: "analytical" },
      { id: "e9", text: "the music playing in the background when Blanche is sad", type: "trap", trapMsg: "Vague trap. Be specific about the kind of music and the attitude it establishes." }
    ],
    d4: [
      { id: "e10", text: "the portrayal of Blanche as a deeply flawed heroine whose desperate need for 'magic' over realism humanizes her trauma", type: "analytical" },
      { id: "e11", text: "Blanche's meticulous construction of a 'Southern Belle' facade to mask her psychological deterioration", type: "analytical" },
      { id: "e12", text: "Blanche being the main character who drinks too much and lies to everyone", type: "trap", trapMsg: "Colloquial trap. Frame her flaws as the defining traits of a tragic anti-hero." }
    ],
    d5: [
      { id: "e13", text: "Stanley Kowalski's ruthless, unyielding enforcement of his own territorial dominance", type: "analytical" },
      { id: "e14", text: "the systematic way Stanley strips away Blanche's constructed sanctuary through physical intimidation", type: "analytical" },
      { id: "e15", text: "Stanley acting like the villain by ruining Blanche's life", type: "trap", trapMsg: "Moralizing trap. Analyze his function as an antagonist representing a specific opposing ideology." }
    ],
    d6: [
      { id: "e16", text: "the deployment of Stanley as the quintessential 'alpha male' archetype of the industrialized New South", type: "analytical" },
      { id: "e17", text: "Blanche embodying the decaying, obsolete archetype of the aristocratic Old South", type: "analytical" },
      { id: "e18", text: "Stanley acting like a caveman throughout the play", type: "trap", trapMsg: "Colloquial trap. Use Williams' text to frame him as embodying primal, animalistic archetypes." }
    ],
    d7: [
      { id: "e19", text: "the opening stage directions establishing the cramped, diverse, and unapologetic atmosphere of Elysian Fields", type: "analytical" },
      { id: "e20", text: "the immediate introduction of the ideological clash between Blanche's white attire and the raw, physical environment", type: "analytical" },
      { id: "e21", text: "the first scene where Blanche arrives at Stella's house to visit", type: "trap", trapMsg: "Plot summary trap. Focus on what is established for the audience, not only what happens." }
    ],
    d8: [
      { id: "e22", text: "the terrifying culmination of tension in Scene 10, where inevitable physical violence shatters Blanche's psychological defenses", type: "analytical" },
      { id: "e23", text: "when Stanley assaults Blanche while Stella is at the hospital", type: "trap", trapMsg: "Literal trap. Focus on the destruction of illusion by brutal reality." }
    ],
    d9: [
      { id: "e24", text: "the stark contrast between Blanche's elevated, poetic euphemisms and Stanley's blunt, coarse slang", type: "analytical" },
      { id: "e25", text: "Blanche's reliance on French phrasing to artificially elevate her social standing in a working-class environment", type: "analytical" },
      { id: "e26", text: "the way the characters talk to each other differently based on where they grew up", type: "trap", trapMsg: "Vague trap. Diction requires specific word choices and a direct comparison of styles." }
    ],
    d10: [
      { id: "e27", text: "Blanche's obsessive, ritualistic bathing to 'cleanse' herself of her sordid past within the morally ambiguous space of the apartment", type: "analytical" },
      { id: "e28", text: "the audience knowing the brutal truth of the Flamingo Hotel while Blanche desperately performs her routine of pristine virtue", type: "analytical" },
      { id: "e29", text: "Stella not knowing that Blanche lost Belle Reve until she told her", type: "trap", trapMsg: "Plot detail trap. Irony requires a subversion of truth or expectation that the audience understands." }
    ],
    d11: [
      { id: "e30", text: "Blanche's fatalistic transit route, transferring from the 'Desire' streetcar to 'Cemeteries'", type: "analytical" },
      { id: "e31", text: "the broader representation of the death of the agrarian South at the hands of the industrial working class", type: "analytical" },
      { id: "e32", text: "the fact that they live in a poor neighborhood in New Orleans", type: "trap", trapMsg: "Literal trap. Analyze the allegorical meaning of the setting rather than the geographic fact." }
    ],
    d12: [
      { id: "e33", text: "Blanche's desperate characterization of Stanley as a 'survivor of the Stone Age' bearing raw meat home", type: "analytical" },
      { id: "e34", text: "the comparison of Blanche to a fragile, fluttering moth drawn dangerously close to a destructive light", type: "analytical" },
      { id: "e35", text: "Blanche saying she feels like a trapped animal", type: "trap", trapMsg: "Dropped quote trap. Explain what the comparison reveals about her psychological state." }
    ]
  },
  verbs: [
    { id: "v1", text: "to externalize", desc: "To make an internal feeling visible" },
    { id: "v2", text: "to physicalize", desc: "To give physical form to an idea" },
    { id: "v3", text: "to underscore", desc: "To emphasize a specific point" },
    { id: "v4", text: "to subvert", desc: "To undermine or twist expectations" },
    { id: "v5", text: "to manifest", desc: "To display or show plainly" },
    { id: "v6", text: "to accentuate", desc: "To make more noticeable" },
    { id: "v7", text: "to satirize", desc: "To mock or comment on societal norms" }
  ],
  functions: [
    { id: "f1", text: "the rapid psychological fragmentation and descent into madness of the protagonist.", type: "analytical" },
    { id: "f2", text: "the brutal, uncompromising reality of the New South overpowering the fragile illusions of the Old.", type: "analytical" },
    { id: "f3", text: "the desperate lengths an individual will go to in order to maintain a fabricated sanctuary.", type: "analytical" },
    { id: "f4", text: "the inescapable, haunting nature of unresolved trauma and grief.", type: "analytical" },
    { id: "f5", text: "the primal, territorial dominance that dictates survival in a modern, industrialized society.", type: "analytical" },
    { id: "f6", text: "the tragic cost of self-deception in a fundamentally hostile environment.", type: "analytical" },
    { id: "f7", text: "that Stanley is an evil abuser who ruins everything for his wife and sister-in-law.", type: "trap", trapMsg: "Moralizing trap. Analyze symbolic function and thematic representation instead of judging characters as evil." },
    { id: "f8", text: "that Blanche is just crazy and needs a doctor.", type: "trap", trapMsg: "Dismissive trap. Elevate your analysis of her mental state instead of reducing the tragedy to a simplistic diagnosis." }
  ]
};
