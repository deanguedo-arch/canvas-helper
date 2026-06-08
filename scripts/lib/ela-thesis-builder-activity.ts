export type ThesisBuilderTopic = {
  id: string;
  text: string;
  label: string;
};

export type ThesisBuilderCharacter = {
  id: string;
  name: string;
  desc: string;
};

export type ThesisBuilderChoice = {
  id: string;
  text: string;
  type: "analytical" | "trap";
  trapMsg?: string;
};

export type ThesisBuilderActivity = {
  title: string;
  description: string;
  topics: ThesisBuilderTopic[];
  characters: ThesisBuilderCharacter[];
  actions: Record<string, ThesisBuilderChoice[]>;
  consequences: Record<string, ThesisBuilderChoice[]>;
};

export const THESIS_BUILDER_ACTIVITY_SOURCE = "C:\\Users\\dean.guedo\\Downloads\\thesis_builder_activity.tsx";

export const THESIS_BUILDER_ACTIVITY: ThesisBuilderActivity = {
  title: "Thesis Builder",
  description: "Build a diploma-ready thesis by connecting prompt topic, character, analytical action, and universal significance.",
  topics: [
    { id: "t1", text: "the impact of illusions on reality", label: "Illusion vs. Reality" },
    { id: "t2", text: "the conflict between the past and the present", label: "Past vs. Present" },
    { id: "t3", text: "the significance of an individual's desire for dominance", label: "Power & Dominance" },
    { id: "t4", text: "the psychological impact of unresolved trauma", label: "Unresolved Trauma" },
    { id: "t5", text: "the destructive nature of unchecked desire", label: "Role of Desire" },
    { id: "t6", text: "the struggle for self-preservation in a hostile environment", label: "Self-Preservation" }
  ],
  characters: [
    { id: "c1", name: "Blanche DuBois", desc: "The faded Southern belle" },
    { id: "c2", name: "Stanley Kowalski", desc: "The embodiment of the New South" },
    { id: "c3", name: "Stella Kowalski", desc: "The bridge between two worlds" },
    { id: "c4", name: "Harold 'Mitch' Mitchell", desc: "The illusion of sanctuary" }
  ],
  actions: {
    c1: [
      { id: "a1", text: "meticulously constructing a fragile facade of Southern gentility", type: "analytical" },
      { id: "a2", text: "lying about her age and drinking Stanley's liquor", type: "trap", trapMsg: "Plot summary trap. Do not just list what the character does. Elevate the language to describe the analytical meaning behind the lies." },
      { id: "a3", text: "utilizing calculated deceit as a psychological shield", type: "analytical" },
      { id: "a4", text: "taking long hot baths to wash away her past", type: "trap", trapMsg: "Literal trap. While the bathing is symbolic, this phrasing is too literal for a thesis. Focus on the psychological motivation." },
      { id: "a5", text: "desperately clinging to aristocratic ideals to avoid confronting her own degradation", type: "analytical" },
      { id: "a6", text: "retreating into a world of fabricated magic", type: "analytical" }
    ],
    c2: [
      { id: "a7", text: "enforcing a ruthless, uncompromising code of primal realism", type: "analytical" },
      { id: "a8", text: "systematically stripping away the illusions of those around him", type: "analytical" },
      { id: "a9", text: "throwing a radio out the window and yelling at his wife", type: "trap", trapMsg: "Plot summary trap. While this happens in the play, a thesis must focus on what his violence represents thematically." },
      { id: "a10", text: "asserting territorial dominance through physical intimidation", type: "analytical" },
      { id: "a11", text: "acting like an ape and eating with his fingers", type: "trap", trapMsg: "Colloquial trap. This is too casual. Use Williams' text to frame him analytically, such as embodying primal, animalistic forces." },
      { id: "a12", text: "weaponizing truth to destroy fragile idealism", type: "analytical" }
    ],
    c3: [
      { id: "a13", text: "crying but choosing to stay with Stanley anyway", type: "trap", trapMsg: "Colloquial trap. This is too casual and plot-focused. Frame her choice using analytical, ELA 30-1 level vocabulary." },
      { id: "a14", text: "consciously embracing self-deception to preserve her sanctuary", type: "analytical" },
      { id: "a15", text: "sacrificing her aristocratic loyalty for physical security", type: "analytical" },
      { id: "a16", text: "ignoring Blanche's warnings because she likes Stanley", type: "trap", trapMsg: "Vague trap. 'Likes Stanley' is too weak. Analyze the intense, primal bond that dictates her decisions." },
      { id: "a17", text: "mediating the irreconcilable differences between two opposing worldviews", type: "analytical" },
      { id: "a18", text: "surrendering moral clarity for the sake of survival", type: "analytical" }
    ],
    c4: [
      { id: "a19", text: "offering a temporary, conditional sanctuary based on false pretenses", type: "analytical" },
      { id: "a20", text: "tearing the paper lantern off the lightbulb to look at her", type: "trap", trapMsg: "Plot summary trap. Do not focus on the literal lantern in your thesis. Focus on what tearing it represents: violating sanctuary and exposing truth." },
      { id: "a21", text: "exposing his own underlying brutality when confronted with imperfect truth", type: "analytical" },
      { id: "a22", text: "rejecting Blanche because she was not clean enough for his mother", type: "trap", trapMsg: "Literal plot trap. Elevate this to analyze his hypocrisy or conformity to the New South's double standards." },
      { id: "a23", text: "conforming to the patriarchal expectations of his environment", type: "analytical" }
    ]
  },
  consequences: {
    c1: [
      { id: "cq1", text: "will inevitably fracture their own psyche when confronted with brutal truths.", type: "analytical" },
      { id: "cq2", text: "ensures their ultimate destruction in a world that has no room for delicate idealism.", type: "analytical" },
      { id: "cq3", text: "which causes her to be sent away to a mental hospital.", type: "trap", trapMsg: "Plot summary trap. The end of a thesis should state the thematic message or universal truth, not just how the story ends." },
      { id: "cq4", text: "proves that lying never works out in the end.", type: "trap", trapMsg: "Moralizing trap. Avoid simplistic, judgmental cliches. Analyze the tragic significance of the character's failure." },
      { id: "cq5", text: "highlights the tragic futility of escaping reality through imagination.", type: "analytical" }
    ],
    c2: [
      { id: "cq6", text: "demonstrates the inevitable, violent triumph of the New South over the Old.", type: "analytical" },
      { id: "cq7", text: "proving that he is the villain of the story and a terrible husband.", type: "trap", trapMsg: "Moralizing trap. Avoid judging characters as good or evil. Analyze their symbolic function in the playwright's message." },
      { id: "cq8", text: "exposes the terrifying vulnerability of those unable to adapt to modern brutality.", type: "analytical" },
      { id: "cq9", text: "shows that men were very sexist in the 1940s.", type: "trap", trapMsg: "Generalization trap. This is a broad historical statement, not analysis of the text's specific thematic message." },
      { id: "cq10", text: "solidifies the absolute supremacy of pragmatic realism over fragile idealism.", type: "analytical" }
    ],
    c3: [
      { id: "cq11", text: "highlights the tragic moral compromises required to survive in a patriarchal society.", type: "analytical" },
      { id: "cq12", text: "showing she is a bad sister who does not care about family.", type: "trap", trapMsg: "Moralizing trap. Do not judge Stella as bad. Analyze the significance and cost of the choice she is forced to make." },
      { id: "cq13", text: "illustrates how the bridge between the Old and New South requires the abandonment of truth.", type: "analytical" },
      { id: "cq14", text: "meaning she has to live with a guilty conscience forever.", type: "trap", trapMsg: "Speculation trap. Do not guess what happens after the curtain falls. Stick to the universal truth Williams reveals in the text." },
      { id: "cq15", text: "proves that primal, physical bonds often overpower intellectual or familial loyalties.", type: "analytical" }
    ],
    c4: [
      { id: "cq16", text: "reveals the inescapable pervasiveness of the New South's uncompromising cruelty.", type: "analytical" },
      { id: "cq17", text: "proves that even seemingly gentle individuals are corrupted by their environment.", type: "analytical" },
      { id: "cq18", text: "making him just as bad as Stanley in the end.", type: "trap", trapMsg: "Colloquial trap. 'Just as bad' is too informal. Describe how he adopts Stanley's ideological stance instead." },
      { id: "cq19", text: "demonstrates how the demand for perfection destroys the possibility of genuine connection.", type: "analytical" },
      { id: "cq20", text: "showing he never really loved her anyway.", type: "trap", trapMsg: "Emotional speculation trap. Avoid analyzing characters like real people with hidden feelings. Analyze their literary purpose." }
    ]
  }
};
