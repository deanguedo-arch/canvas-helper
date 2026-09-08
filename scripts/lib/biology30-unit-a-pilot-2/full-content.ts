export type TextbookLocator = {
  doc: "chapter-11" | "chapter-12" | "chapter-13";
  printed: number;
  physical: number;
};

export type PracticeItem = {
  id: string;
  lessonId?: string;
  number: number;
  prompt: string;
  choices: Record<string, string>;
  answer: string;
  rationale: string;
  feedback: Record<string, string>;
  textbook: TextbookLocator;
  optional?: boolean;
  legacyChoices?: Record<string, string>;
};

export type FlowVisual = {
  kind: "flow";
  id: string;
  title: string;
  steps: Array<{ label: string; detail: string }>;
  description: string;
};

export type TableVisual = {
  kind: "table";
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
  description: string;
};

export type ImageVisual = {
  kind: "image";
  id: string;
  title: string;
  src: string;
  alt: string;
  description: string;
};

export type SvgVisual = {
  kind: "svg";
  id: string;
  title: string;
  variant: "action-potential-graph" | "brain-anatomy" | "adh-response-graph" | "adrenal-anatomy";
  description: string;
};

export type LessonVisual = FlowVisual | TableVisual | ImageVisual | SvgVisual;

export type LessonTerm = {
  term: string;
  meaning: string;
  status: "new" | "used-again";
  vocabularyId?: string;
};

export type LessonPart = {
  title: string;
  paragraphs: string[];
  visuals: LessonVisual[];
  wordLens: string[];
};

export type FullLessonContent = {
  inquiry: string;
  prerequisites: string;
  words: Array<[string, string]>;
  learningGoal: string;
  part1: LessonPart;
  stop: { title: string; prompt: string; answer: string };
  part2: LessonPart;
  part3?: LessonPart;
  part4?: LessonPart;
  worked: { title: string; setup: string; steps: string[]; reasoning: string };
  retrieval: { title: string; prompt: string };
  guidedHeading: string;
  evidencePrompt: string;
  advanced: { title: string; paragraphs: string[] };
};

/**
 * Supporting vocabulary is kept separate from the four visible anchors. This
 * list is authored content: it tells learners which terms are new and which
 * are being reused, without turning every anatomical label into a Frayer task.
 */
export const LESSON_TERM_INVENTORY: Record<string, LessonTerm[]> = {
  "lesson-01": [
    { term: "central nervous system (CNS)", meaning: "the brain and spinal cord, which process information and organize responses", status: "new", vocabularyId: "central-peripheral-systems" },
    { term: "peripheral nervous system (PNS)", meaning: "the nerves and related structures outside the brain and spinal cord", status: "new", vocabularyId: "central-peripheral-systems" },
    { term: "action potential", meaning: "a brief electrical signal that is renewed as it travels along an axon", status: "new", vocabularyId: "action-potential" },
    { term: "threshold", meaning: "the membrane voltage that must be reached to start an action potential", status: "new", vocabularyId: "action-potential" },
    { term: "cell body", meaning: "the part of a neuron that contains the nucleus and maintains the cell", status: "new", vocabularyId: "neuron-structure" },
    { term: "axon terminal", meaning: "the end of an axon that communicates with a target cell", status: "new", vocabularyId: "neuron-structure" },
    { term: "Schwann cell", meaning: "a support cell outside the brain and spinal cord that can wrap an axon in myelin", status: "new", vocabularyId: "myelin-conduction" },
    { term: "oligodendrocyte", meaning: "a support cell in the brain or spinal cord that can wrap parts of several axons in myelin", status: "new", vocabularyId: "myelin-conduction" },
    { term: "node of Ranvier", meaning: "a gap between myelin segments where an action potential is regenerated", status: "new", vocabularyId: "myelin-conduction" },
    { term: "sensory neuron", meaning: "a neuron that carries information from a receptor toward the CNS", status: "new" },
    { term: "interneuron", meaning: "a neuron that connects and processes information within the CNS", status: "new" },
    { term: "motor neuron", meaning: "a neuron that carries a command from the CNS toward an effector", status: "new" },
    { term: "receptor", meaning: "a structure that detects a change", status: "new", vocabularyId: "control-system-roles" },
    { term: "effector", meaning: "a muscle or gland that carries out a response", status: "new", vocabularyId: "control-system-roles" }
  ],
  "lesson-02": [
    { term: "membrane potential", meaning: "the voltage across a cell membrane", status: "new", vocabularyId: "resting-membrane-potential" },
    { term: "ion gradient", meaning: "an unequal ion concentration across a membrane", status: "new", vocabularyId: "resting-membrane-potential" },
    { term: "selective permeability", meaning: "the membrane property that allows some substances to cross more easily than others", status: "new", vocabularyId: "resting-membrane-potential" },
    { term: "leak channel", meaning: "a membrane channel that is open at rest and allows an ion to diffuse", status: "new", vocabularyId: "resting-membrane-potential" },
    { term: "sodium-potassium pump", meaning: "an ATP-powered protein that maintains sodium and potassium gradients", status: "new", vocabularyId: "resting-membrane-potential" },
    { term: "hyperpolarization", meaning: "a brief change that makes the membrane more negative than resting potential", status: "new", vocabularyId: "membrane-potential-phases" },
    { term: "refractory period", meaning: "the recovery time when another signal is impossible or harder to begin", status: "new", vocabularyId: "refractory-period" },
    { term: "firing frequency", meaning: "the number of action potentials produced in a period of time", status: "new", vocabularyId: "action-potential" },
    { term: "myelin", meaning: "electrical insulation around parts of an axon", status: "used-again", vocabularyId: "myelin-conduction" }
  ],
  "lesson-03": [
    { term: "presynaptic", meaning: "the signalling side of a synapse that releases neurotransmitter", status: "new", vocabularyId: "synaptic-transmission" },
    { term: "postsynaptic", meaning: "the receiving side of a synapse with receptors", status: "new", vocabularyId: "synaptic-transmission" },
    { term: "synaptic cleft", meaning: "the small gap crossed by a neurotransmitter", status: "new", vocabularyId: "synaptic-transmission" },
    { term: "vesicle", meaning: "a membrane-bound sac that stores neurotransmitter", status: "new", vocabularyId: "synaptic-transmission" },
    { term: "acetylcholine", meaning: "a neurotransmitter used at many synapses, including motor-neuron junctions", status: "new", vocabularyId: "synaptic-transmission" },
    { term: "norepinephrine", meaning: "a neurotransmitter used by many sympathetic pathways", status: "new", vocabularyId: "synaptic-transmission" },
    { term: "agonist", meaning: "a substance that increases a signalling effect", status: "new", vocabularyId: "synaptic-transmission" },
    { term: "antagonist", meaning: "a substance that reduces or blocks a signalling effect", status: "new", vocabularyId: "synaptic-transmission" },
    { term: "reuptake", meaning: "transport of released messenger back into a cell", status: "new", vocabularyId: "synaptic-transmission" },
    { term: "action potential", meaning: "an all-or-none electrical signal along a neuron membrane", status: "used-again", vocabularyId: "action-potential" }
  ],
  "lesson-04": [
    { term: "nerve", meaning: "a bundle of axons in the peripheral nervous system", status: "new", vocabularyId: "central-peripheral-systems" },
    { term: "ganglion", meaning: "a cluster of neuron cell bodies in the PNS", status: "new", vocabularyId: "central-peripheral-systems" },
    { term: "afferent", meaning: "carrying sensory information toward the CNS", status: "new", vocabularyId: "central-peripheral-systems" },
    { term: "efferent", meaning: "carrying motor information away from the CNS", status: "new", vocabularyId: "central-peripheral-systems" },
    { term: "sympathetic", meaning: "the autonomic division that supports an immediate action pattern", status: "new", vocabularyId: "sympathetic-parasympathetic" },
    { term: "parasympathetic", meaning: "the autonomic division that supports routine maintenance and recovery", status: "new", vocabularyId: "sympathetic-parasympathetic" },
    { term: "white matter", meaning: "CNS tissue containing many myelinated axons", status: "new", vocabularyId: "myelin-conduction" },
    { term: "grey matter", meaning: "CNS tissue containing many neuron cell bodies, dendrites, and synapses", status: "new", vocabularyId: "neuron-structure" }
  ],
  "lesson-05": [
    { term: "cerebral hemisphere", meaning: "one of the two connected halves of the cerebrum", status: "new" },
    { term: "cerebral cortex", meaning: "the folded outer grey matter of the cerebrum", status: "new" },
    { term: "frontal lobe", meaning: "a cortical region important in planning, movement, and speech production", status: "new" },
    { term: "parietal lobe", meaning: "a cortical region important in body sensation and spatial processing", status: "new" },
    { term: "temporal lobe", meaning: "a cortical region important in hearing, language, and memory", status: "new" },
    { term: "occipital lobe", meaning: "a cortical region important in visual processing", status: "new" },
    { term: "thalamus", meaning: "a relay and processing region for much sensory information", status: "new" },
    { term: "pons", meaning: "a brainstem region involved in relay, breathing, sleep, and arousal", status: "new" },
    { term: "medulla oblongata", meaning: "a brainstem region that helps regulate vital automatic functions", status: "new" },
    { term: "spinal cord", meaning: "CNS tissue that carries signals and organizes some reflexes", status: "new", vocabularyId: "central-peripheral-systems" },
    { term: "scientific explanation", meaning: "a claim connected to evidence by biological reasoning, with an appropriate limit", status: "new", vocabularyId: "scientific-explanation" }
  ],
  "lesson-06": [
    { term: "sensation", meaning: "detection and neural representation of a stimulus", status: "new", vocabularyId: "sensory-transduction" },
    { term: "perception", meaning: "the meaning produced through CNS interpretation of sensory signals", status: "new", vocabularyId: "sensory-transduction" },
    { term: "photoreceptor", meaning: "a receptor that responds to light", status: "new", vocabularyId: "sensory-receptor-classes" },
    { term: "mechanoreceptor", meaning: "a receptor that responds to force, stretch, vibration, or movement", status: "new", vocabularyId: "sensory-receptor-classes" },
    { term: "chemoreceptor", meaning: "a receptor that responds to particular chemicals", status: "new", vocabularyId: "sensory-receptor-classes" },
    { term: "thermoreceptor", meaning: "a receptor that responds to temperature change", status: "new", vocabularyId: "sensory-receptor-classes" },
    { term: "nociceptor", meaning: "a receptor that responds to potentially damaging conditions", status: "new", vocabularyId: "sensory-receptor-classes" },
    { term: "action potential", meaning: "an all-or-none electrical signal along a neuron membrane", status: "used-again", vocabularyId: "action-potential" }
  ],
  "lesson-07": [
    { term: "sclera", meaning: "the tough outer coat of the eye", status: "new", vocabularyId: "vision-pathway" },
    { term: "iris", meaning: "the coloured muscle that changes pupil diameter", status: "new", vocabularyId: "vision-pathway" },
    { term: "pupil", meaning: "the opening that lets light enter the eye", status: "new", vocabularyId: "vision-pathway" },
    { term: "choroid", meaning: "the pigmented, blood-rich layer between sclera and retina", status: "new", vocabularyId: "vision-pathway" },
    { term: "rod", meaning: "a photoreceptor sensitive in dim light", status: "new", vocabularyId: "vision-pathway" },
    { term: "cone", meaning: "a photoreceptor that supports colour and fine detail in brighter light", status: "new", vocabularyId: "vision-pathway" },
    { term: "fovea", meaning: "the central retinal region with the sharpest cone-based vision", status: "new", vocabularyId: "vision-pathway" },
    { term: "optic nerve", meaning: "the bundle of ganglion-cell axons leaving the eye", status: "new", vocabularyId: "vision-pathway" },
    { term: "accommodation", meaning: "a change in lens shape used to focus at different distances", status: "new", vocabularyId: "vision-pathway" }
  ],
  "lesson-08": [
    { term: "pinna", meaning: "the outer-ear flap that helps collect sound", status: "new", vocabularyId: "hearing-equilibrium-pathway" },
    { term: "tympanum", meaning: "the eardrum, which vibrates with pressure waves", status: "new", vocabularyId: "hearing-equilibrium-pathway" },
    { term: "ossicles", meaning: "three middle-ear bones that transmit vibration", status: "new", vocabularyId: "hearing-equilibrium-pathway" },
    { term: "oval window", meaning: "the membrane that transfers ossicle vibration into cochlear fluid", status: "new", vocabularyId: "hearing-equilibrium-pathway" },
    { term: "cochlea", meaning: "the coiled inner-ear structure for hearing", status: "new", vocabularyId: "hearing-equilibrium-pathway" },
    { term: "organ of Corti", meaning: "the cochlear sensory organ containing hair cells", status: "new", vocabularyId: "hearing-equilibrium-pathway" },
    { term: "vestibule", meaning: "an inner-ear region that detects head position and linear motion", status: "new", vocabularyId: "hearing-equilibrium-pathway" },
    { term: "Eustachian tube", meaning: "a passage that helps equalize middle-ear pressure", status: "new", vocabularyId: "hearing-equilibrium-pathway" }
  ],
  "lesson-09": [
    { term: "dynamic stability", meaning: "ongoing adjustment that keeps conditions within workable ranges", status: "new", vocabularyId: "homeostasis" },
    { term: "regulated variable", meaning: "an internal condition monitored and adjusted by a control system", status: "new", vocabularyId: "regulated-variable-set-point" },
    { term: "workable range", meaning: "the values within which a variable can support normal function", status: "new", vocabularyId: "regulated-variable-set-point" },
    { term: "control centre", meaning: "the part of a control system that compares information and organizes a response", status: "new", vocabularyId: "control-system-roles" },
    { term: "endocrine gland", meaning: "a structure that releases hormones into internal fluid or blood", status: "new", vocabularyId: "endocrine-signalling" },
    { term: "hormone", meaning: "a chemical signal carried through body fluids to receptor-bearing target cells", status: "new", vocabularyId: "endocrine-signalling" },
    { term: "target cell", meaning: "a cell able to respond because it has a compatible receptor", status: "new", vocabularyId: "endocrine-signalling" },
    { term: "receptor", meaning: "a protein or structure that detects a signal", status: "used-again", vocabularyId: "control-system-roles" }
  ],
  "lesson-10": [
    { term: "anterior pituitary", meaning: "glandular tissue that makes and releases pituitary hormones", status: "new", vocabularyId: "hypothalamus-pituitary-axis" },
    { term: "posterior pituitary", meaning: "neural tissue that stores and releases hypothalamic hormones", status: "new", vocabularyId: "hypothalamus-pituitary-axis" },
    { term: "releasing hormone", meaning: "a hypothalamic hormone that controls anterior-pituitary cells", status: "new", vocabularyId: "hypothalamus-pituitary-axis" },
    { term: "tropic hormone", meaning: "a hormone whose main target is another endocrine gland", status: "new", vocabularyId: "hypothalamus-pituitary-axis" },
    { term: "hGH", meaning: "human growth hormone from the anterior pituitary", status: "new", vocabularyId: "hypothalamus-pituitary-axis" },
    { term: "TSH", meaning: "thyroid-stimulating hormone from the anterior pituitary", status: "new", vocabularyId: "thyroid-calcium-feedback" },
    { term: "ACTH", meaning: "adrenocorticotropic hormone from the anterior pituitary", status: "new", vocabularyId: "stress-response" },
    { term: "negative feedback", meaning: "a response whose return effect reduces the original disturbance", status: "used-again", vocabularyId: "negative-feedback" }
  ],
  "lesson-11": [
    { term: "hypothalamus", meaning: "the brain region whose neurons make ADH and monitor fluid concentration", status: "used-again", vocabularyId: "hypothalamus-pituitary-axis" },
    { term: "posterior pituitary", meaning: "the neural release site for ADH made in the hypothalamus", status: "used-again", vocabularyId: "hypothalamus-pituitary-axis" },
    { term: "collecting duct", meaning: "a kidney tube where ADH changes water reabsorption", status: "new", vocabularyId: "water-salt-regulation" },
    { term: "aquaporin", meaning: "a membrane channel that allows water to cross", status: "new", vocabularyId: "water-salt-regulation" },
    { term: "urine concentration", meaning: "the amount of dissolved material relative to water in urine", status: "new", vocabularyId: "water-salt-regulation" },
    { term: "dehydration", meaning: "a condition in which the body has lost more water than it has taken in", status: "new", vocabularyId: "water-salt-regulation" },
    { term: "diabetes insipidus", meaning: "a water-balance disorder involving too little ADH effect", status: "new", vocabularyId: "water-salt-regulation" },
    { term: "negative feedback", meaning: "a response whose return effect reduces the original disturbance", status: "used-again", vocabularyId: "negative-feedback" }
  ],
  "lesson-12": [
    { term: "thyroid gland", meaning: "an endocrine gland that releases thyroxine and calcitonin", status: "new", vocabularyId: "thyroid-calcium-feedback" },
    { term: "parathyroid gland", meaning: "one of the small glands that release PTH", status: "new", vocabularyId: "thyroid-calcium-feedback" },
    { term: "metabolism", meaning: "the complete set of chemical reactions in a cell or body", status: "new", vocabularyId: "thyroid-calcium-feedback" },
    { term: "iodine", meaning: "an element required to make thyroid hormones", status: "new", vocabularyId: "thyroid-calcium-feedback" },
    { term: "bone remodelling", meaning: "continuous breakdown and rebuilding of bone tissue", status: "new", vocabularyId: "thyroid-calcium-feedback" },
    { term: "antagonistic hormones", meaning: "hormones that produce coordinated effects in opposite directions", status: "used-again", vocabularyId: "antagonistic-hormones" },
    { term: "target cell", meaning: "a cell able to respond because it has a compatible receptor", status: "used-again", vocabularyId: "endocrine-signalling" }
  ],
  "lesson-13": [
    { term: "alpha cell", meaning: "a pancreatic-islet cell that releases glucagon", status: "new", vocabularyId: "blood-glucose-regulation" },
    { term: "beta cell", meaning: "a pancreatic-islet cell that releases insulin", status: "new", vocabularyId: "blood-glucose-regulation" },
    { term: "glycogen", meaning: "a stored polymer of glucose found mainly in liver and skeletal muscle", status: "new", vocabularyId: "blood-glucose-regulation" },
    { term: "hyperglycemia", meaning: "blood glucose above the healthy range", status: "new", vocabularyId: "blood-glucose-regulation" },
    { term: "diabetes mellitus", meaning: "a group of disorders in which blood glucose remains too high", status: "new", vocabularyId: "blood-glucose-regulation" },
    { term: "urinalysis", meaning: "the examination of urine properties or substances", status: "new", vocabularyId: "blood-glucose-regulation" },
    { term: "adrenal medulla", meaning: "the inner adrenal region that releases epinephrine and norepinephrine", status: "new", vocabularyId: "stress-response" },
    { term: "adrenal cortex", meaning: "the outer adrenal region that releases cortisol and aldosterone", status: "new", vocabularyId: "stress-response" },
    { term: "ACTH", meaning: "an anterior-pituitary hormone that stimulates the adrenal cortex", status: "used-again", vocabularyId: "stress-response" },
    { term: "target cell", meaning: "a cell able to respond because it has a compatible receptor", status: "used-again", vocabularyId: "endocrine-signalling" }
  ]
};

const physicalPage = (doc: TextbookLocator["doc"], printed: number) =>
  printed - ({ "chapter-11": 359, "chapter-12": 403, "chapter-13": 433 } as const)[doc];

type PracticeRow = [prompt: string, choices: string[], answerIndex: number, rationale: string, printedPage: number];

function misconceptionFeedback(choices: Record<string, string>, answer: string, rationale: string) {
  return Object.fromEntries(Object.entries(choices)
    .filter(([key]) => key !== answer)
    .map(([key, choice]) => [key, `This choice identifies “${choice}.” That conflicts with the required structure, direction, or control step. ${rationale} Compare the choice with that mechanism, then try again.`]));
}

function practiceItems(routeId: string, doc: TextbookLocator["doc"], rows: PracticeRow[], options: { lessonId?: string; optional?: boolean } = {}): PracticeItem[] {
  return rows.map(([prompt, choiceList, answerIndex, rationale, printed], index) => {
    const choices = Object.fromEntries(choiceList.map((choice, choiceIndex) => [String.fromCharCode(97 + choiceIndex), choice]));
    const answer = String.fromCharCode(97 + answerIndex);
    return {
      id: `biology30-unit-a-pilot-2:practice:${routeId}-${String(index + 1).padStart(2, "0")}`,
      lessonId: options.lessonId,
      number: index + 1,
      prompt,
      choices,
      answer,
      rationale,
      feedback: misconceptionFeedback(choices, answer, rationale),
      textbook: { doc, printed, physical: physicalPage(doc, printed) },
      optional: options.optional
    };
  });
}

export const FULL_LESSON_CONTENT: Record<string, FullLessonContent> = {
  "lesson-02": {
    inquiry: "How can a small change in membrane voltage become a signal that travels along an axon?",
    prerequisites: "You should know the parts of a neuron and that myelin changes conduction speed.",
    words: [
      ["resting potential", "the voltage across a neuron's membrane before an action potential"],
      ["threshold", "the membrane voltage that triggers an action potential"],
      ["depolarization", "a change that makes the inside less negative"],
      ["repolarization", "a return toward the resting negative voltage"]
    ],
    learningGoal: "explain how ion movement creates an action potential and how neurons represent stimulus intensity.",
    part1: {
      title: "Ion gradients store potential energy",
      paragraphs: [
        "A resting neuron has an unequal distribution of charged particles, called ions. <strong>Sodium ions</strong> are more concentrated outside the cell, while <strong>potassium ions</strong> are more concentrated inside. Large negatively charged proteins also remain inside. Separating these charges stores potential energy. A voltmeter placed across the membrane would detect an electrical difference called the <strong>membrane potential</strong>.",
        "The membrane is <strong>selectively permeable</strong>, so some ions cross more easily than others. At rest, potassium leak channels let potassium diffuse out faster than sodium leaks in. Each departing potassium ion carries positive charge away. This movement helps make the inside negative compared with the outside, even though both sides still contain positive and negative ions.",
        "The <strong>sodium-potassium pump</strong> uses ATP to move three sodium ions out for every two potassium ions moved in. The pump maintains the sodium and potassium gradients over time. It does not create the steep rising and falling phases of each action potential. A typical course model uses about −70 mV for <strong>resting potential</strong>, although the exact value differs among neurons."
        ,"The concentration gradient and the electrical gradient both affect ion movement. Sodium is pulled inward because it is more concentrated outside and because the inside is negative. Potassium is more concentrated inside, so an open potassium channel allows it to diffuse outward. The membrane voltage is the result of these unequal movements, not a count of every ion in the cell."
      ],
      visuals: [
        { kind: "image", id: "resting-membrane-potential", title: "Resting membrane potential", src: "assets/generated-visuals/lesson-04-resting-membrane-1014f22e.png", alt: "A neuron membrane at rest with more sodium outside, more potassium inside, potassium leak channels, and a sodium-potassium pump moving three sodium ions out and two potassium ions in.", description: "Ion gradients, selective permeability, and the sodium-potassium pump support a resting voltage near −70 mV. The pump maintains the gradients; it does not cause each action-potential phase by itself." },
        { kind: "table", id: "resting-ion-pattern", title: "Read the resting pattern", columns: ["Feature", "Outside the axon", "Inside the axon"], rows: [["Sodium concentration", "Higher", "Lower"], ["Potassium concentration", "Lower", "Higher"], ["Relative charge at the membrane", "More positive", "More negative"]], description: "The table compares relative concentrations and charge across the membrane at rest." }
      ],
      wordLens: ["resting-membrane-potential"]
    },
    stop: {
      title: "Separate the pump from the channels",
      prompt: "Which structure maintains the sodium and potassium gradients over time, and what energy source does it use?",
      answer: "The sodium-potassium pump maintains the gradients. It uses energy from ATP."
    },
    part2: {
      title: "Voltage-gated channels create a travelling signal",
      paragraphs: [
        "A stimulus can open channels and make the membrane less negative. If the trigger region reaches <strong>threshold</strong>, many voltage-gated sodium channels open. Sodium follows its concentration and electrical gradients into the neuron. The rapid entry of positive charge causes <strong>depolarization</strong>, the steep rising phase on the voltage graph.",
        "Near the peak, sodium channels become inactive and voltage-gated potassium channels open. Potassium leaves the neuron, carrying positive charge outward. This movement causes <strong>repolarization</strong>, so the voltage falls toward its resting value. Potassium channels close slowly, so the voltage may briefly fall below rest. This undershoot is <strong>hyperpolarization</strong>.",
        "Channels must return to their resting states before the same membrane region can fire normally again. During the absolute refractory period, another action potential cannot begin there. During the relative refractory period, a stronger stimulus may be needed. This recovery limits firing rate and makes backward re-excitation unlikely as the signal moves along the axon."
        ,"The graph joins all of these events on one time line. Moving upward means the inside is becoming less negative or more positive. Moving downward means the inside is becoming more negative again. A point on the line should always be explained with both the voltage direction and the channel state that caused it."
      ],
      visuals: [
        { kind: "svg", id: "action-potential-voltage-graph", title: "Membrane voltage during one action potential", variant: "action-potential-graph", description: "The graph connects voltage over time with threshold, sodium entry, potassium exit, the undershoot, and the two refractory periods." },
        { kind: "flow", id: "action-potential-phases", title: "Match each graph phase to an ion movement", steps: [["Rest", "About −70 mV; gradients and open leak channels support the resting voltage"], ["Threshold", "A sufficient depolarization opens many voltage-gated sodium channels"], ["Depolarize", "Sodium enters; membrane voltage rises"], ["Repolarize", "Potassium leaves; membrane voltage falls"], ["Undershoot", "Potassium channels close slowly"], ["Recover", "Voltage-gated channels reset for another signal"]].map(([label, detail]) => ({ label, detail })), description: "Reading the graph means naming both the voltage direction and the channel or ion event that explains it." }
      ],
      wordLens: ["action-potential", "membrane-potential-phases", "refractory-period"]
    },
    part3: {
      title: "The signal is regenerated and its pattern carries information",
      paragraphs: [
        "An action potential at one axon region creates local current in the next region. If that next region reaches threshold, it produces a new action potential. The signal is therefore <strong>regenerated</strong> along the axon instead of fading like a passive electrical change. On an unmyelinated axon, regeneration occurs across many neighbouring membrane regions.",
        "On a myelinated axon, current spreads under the myelin and action potentials are regenerated mainly at the nodes of Ranvier. This <strong>saltatory conduction</strong> is faster and uses fewer active membrane regions. The action potential does not literally jump through empty space; current spreads beneath the insulation and brings the next node to threshold.",
        "Each action potential from one neuron is all-or-none. Once threshold is reached, a slightly stronger stimulus does not make that action potential taller. A stronger or longer stimulus can increase <strong>firing frequency</strong>, the number of action potentials produced per second. It can also recruit additional sensory neurons. The nervous system uses these patterns to represent stimulus intensity."
        ,"Regeneration also explains why a signal can travel a long axon without becoming smaller at the far end. Each active region supplies local current to the next region, and the next region creates a new full action potential. Conduction can fail if the membrane cannot reach threshold or if myelin damage allows too much current to leak away."
      ],
      visuals: [
        { kind: "table", id: "stimulus-intensity-code", title: "All-or-none signal, variable message", columns: ["Stimulus", "Size of each action potential", "Message pattern"], rows: [["Just reaches threshold", "Full size", "Lower firing frequency"], ["Stronger, sustained stimulus", "About the same full size", "Higher firing frequency and possible recruitment"]], description: "The height of each action potential remains similar. Frequency, timing, and the number of active neurons can change." }
      ],
      wordLens: ["myelin-conduction", "action-potential"]
    },
    worked: {
      title: "A stimulus becomes stronger",
      setup: "A pressure receptor reaches threshold twice in one second, then ten times in one second while pressure increases.",
      steps: ["Each threshold event produces a full action potential.", "The later action potentials are not taller than the earlier ones.", "The increased firing frequency carries evidence that the stimulus became stronger.", "Nearby receptors may also be recruited if a larger area is pressed."],
      reasoning: "Signal intensity is coded by timing and recruitment, not by changing the all-or-none size of one action potential."
    },
    retrieval: { title: "Tell the ion story", prompt: "Without looking back, explain which ion movement drives depolarization and which ion movement drives repolarization." },
    guidedHeading: "Check voltage and ion movement",
    evidencePrompt: "Explain why a stronger stimulus can produce a stronger message even though each action potential is all-or-none.",
    advanced: { title: "Absolute and relative refractory periods", paragraphs: ["During the absolute refractory period, inactive sodium channels cannot reopen. A second action potential cannot begin in that membrane region.", "During the relative refractory period, some channels have reset, but the membrane may still be hyperpolarized. A stronger-than-usual stimulus may be needed. This distinction helps explain firing-rate limits."] }
  },
  "lesson-04": {
    inquiry: "How does the nervous system organize incoming information and outgoing commands?",
    prerequisites: "You should know sensory, motor, and interneuron roles and how signals cross synapses.",
    words: [["central nervous system", "the brain and spinal cord"], ["peripheral nervous system", "nerves and ganglia outside the brain and spinal cord"], ["somatic system", "sensory and motor pathways linked mainly with skeletal muscle"], ["autonomic system", "motor pathways that regulate smooth muscle, cardiac muscle, and glands"]],
    learningGoal: "classify nervous-system pathways and compare somatic, sympathetic, and parasympathetic control.",
    part1: {
      title: "The CNS processes; the PNS connects",
      paragraphs: ["The central nervous system, or CNS, contains the brain and spinal cord. It receives information, compares it with other information, and organizes responses. The peripheral nervous system, or PNS, includes nerves and ganglia outside the CNS. It carries sensory information toward the CNS and motor commands away from it.", "A nerve is a bundle of axons in the PNS. Some nerves carry mainly sensory information, some mainly motor information, and many carry both. Sensory pathways are often called afferent because they arrive at the CNS. Motor pathways are often called efferent because they exit the CNS.", "The somatic system includes sensory input from skin, muscles, and joints and motor output to skeletal muscle. A somatic response may be voluntary, but somatic reflexes can occur without a conscious decision."],
      visuals: [
        { kind: "flow", id: "nervous-system-hierarchy", title: "Nervous-system organization", steps: [{ label: "Nervous system", detail: "All neural communication" }, { label: "CNS", detail: "Brain and spinal cord process information" }, { label: "PNS sensory", detail: "Carries information toward the CNS" }, { label: "PNS motor", detail: "Carries commands to effectors" }], description: "The PNS connects receptors and effectors with the processing centres of the CNS." },
        { kind: "table", id: "afferent-efferent", title: "Follow the direction", columns: ["Path", "Direction", "Example"], rows: [["Sensory (afferent)", "Receptor toward CNS", "Touch information enters the spinal cord"], ["Motor (efferent)", "CNS toward effector", "A command reaches skeletal muscle"]], description: "Direction relative to the CNS separates sensory and motor pathways." }
      ],
      wordLens: ["central-peripheral-systems", "somatic-autonomic-systems"]
    },
    stop: { title: "Name the direction", prompt: "A signal travels from the spinal cord to a biceps muscle. Is it sensory or motor, and is it moving toward or away from the CNS?", answer: "It is motor information moving away from the CNS toward an effector." },
    part2: {
      title: "Autonomic divisions coordinate internal organs",
      paragraphs: ["The autonomic system regulates cardiac muscle, smooth muscle, and glands. Its sympathetic and parasympathetic divisions often produce opposing effects, but neither division simply switches every organ on or off.", "A sympathetic response supports immediate action. Heart rate may rise, airways may widen, and blood flow may be redirected. A parasympathetic response supports digestion, energy storage, and routine maintenance. Its effects often help restore conditions after a challenge.", "The effect depends on the organ and the receptors on its target cells. For example, sympathetic signals can increase heart rate but reduce some digestive activity. Accurate explanations name the target organ and effect instead of calling one division excitatory and the other inhibitory."],
      visuals: [
        { kind: "table", id: "somatic-autonomic-compare", title: "Two motor pathways", columns: ["Feature", "Somatic motor", "Autonomic motor"], rows: [["Main effector", "Skeletal muscle", "Cardiac muscle, smooth muscle, glands"], ["Typical pathway", "One motor neuron from CNS", "Two-neuron chain with a ganglion"], ["Control", "Voluntary actions and reflexes", "Mostly automatic regulation"]], description: "Somatic and autonomic pathways differ in effectors and organization." },
        { kind: "table", id: "autonomic-organ-effects", title: "Effects depend on the organ", columns: ["Target", "Sympathetic example", "Parasympathetic example"], rows: [["Heart", "Rate and force increase", "Rate decreases"], ["Airways", "Widen", "Return toward resting diameter"], ["Digestive tract", "Activity often decreases", "Activity often increases"], ["Pupil", "Dilates", "Constricts"]], description: "The divisions coordinate organ-specific patterns rather than one universal effect." }
      ],
      wordLens: ["sympathetic-parasympathetic"]
    },
    worked: { title: "A sudden alarm", setup: "A loud alarm starts while a learner is eating lunch.", steps: ["Sensory pathways carry sound information toward the CNS.", "The CNS evaluates the event.", "Sympathetic motor pathways support rapid action by changing heart, airway, and digestive activity.", "When the event ends, parasympathetic effects help routine activity resume."], reasoning: "The explanation follows information into the CNS, then names specific motor targets and effects." },
    retrieval: { title: "Build the hierarchy", prompt: "Explain how the CNS, PNS, somatic system, and autonomic system fit together." },
    guidedHeading: "Classify the pathway",
    evidencePrompt: "Compare one somatic response and one autonomic response. Name the effector in each.",
    advanced: { title: "Why autonomic effects are not simple opposites", paragraphs: ["Some organs receive input from both autonomic divisions. Others receive mainly one division. Effects also depend on receptor type.", "This is why a strong explanation predicts a response organ by organ. It avoids the inaccurate claim that sympathetic input excites every target while parasympathetic input inhibits every target."] }
  },
  "lesson-05": {
    inquiry: "What can a change in movement, speech, memory, or balance suggest about a brain region?",
    prerequisites: "You should know that the CNS contains the brain and spinal cord and that evidence can support more than one explanation.",
    words: [["cerebrum", "the largest brain region, involved in conscious processing and voluntary activity"], ["cerebellum", "a region that helps coordinate movement, posture, and balance"], ["brainstem", "the connection between brain and spinal cord that regulates vital functions"], ["hypothalamus", "a control region that links neural and endocrine regulation"]],
    learningGoal: "identify major brain and spinal-cord structures and use evidence carefully to connect structure with function.",
    part1: {
      title: "Brain regions work as connected networks",
      paragraphs: [
        "The <strong>cerebrum</strong> is the largest part of the brain. It has two connected cerebral hemispheres and a folded outer layer called the cerebral cortex. The cortex contains grey matter with many neuron cell bodies, dendrites, and synapses. Deeper white matter contains many myelinated axons that connect cortical areas with each other and with other parts of the nervous system.",
        "The frontal lobes contribute to planning, decision making, speech production, and voluntary movement. The parietal lobes process body sensations and spatial information. The temporal lobes support hearing, language, and memory. The occipital lobes process visual information. These are major patterns, not isolated boxes. A complex task usually depends on several regions working together.",
        "The two hemispheres exchange information through large bundles of axons. Some functions show left-right specialization, but personality cannot be divided into a logical left brain and a creative right brain. Both hemispheres participate in complex behaviour. A useful brain model identifies important contributions while keeping the connected network visible."
        ,"Grey matter and white matter describe tissue organization, not whether one area is active. Grey matter contains many cell bodies, dendrites, and synapses, where much local processing occurs. White matter contains many myelinated axons, which carry information between processing areas. Both are needed for a coordinated response."
      ],
      visuals: [
        { kind: "svg", id: "complete-brain-anatomy", title: "Major brain structures in side view", variant: "brain-anatomy", description: "The model labels the cerebral lobes, thalamus, hypothalamus, cerebellum, pons, medulla oblongata, and spinal cord while showing that pathways connect the regions." },
        { kind: "table", id: "cortical-lobes", title: "Cortical regions and evidence", columns: ["Region", "Important functions", "Possible evidence after damage"], rows: [["Frontal", "Planning, movement, speech production", "Changed planning or voluntary movement"], ["Parietal", "Body sensation and spatial processing", "Difficulty locating touch or space"], ["Temporal", "Hearing, language, memory", "Changed sound, word, or memory processing"], ["Occipital", "Vision", "Changed visual processing"]], description: "A symptom can suggest a region, but it is not a diagnosis and may involve a wider network." }
      ],
      wordLens: ["central-peripheral-systems"]
    },
    stop: { title: "Avoid the brain-box error", prompt: "Why is it misleading to say one lobe works alone during a complex task?", answer: "Complex tasks use networks. A labelled region may make an important contribution, but it communicates with other regions." },
    part2: {
      title: "Deep brain regions and the brainstem regulate essential functions",
      paragraphs: [
        "The <strong>thalamus</strong> receives and organizes much of the sensory information moving toward the cerebral cortex. Smell follows a different early route. The thalamus does more than pass messages unchanged; it helps select and organize information. The nearby <strong>hypothalamus</strong> monitors internal conditions and helps regulate temperature, thirst, hunger, autonomic activity, and endocrine signalling.",
        "The <strong>cerebellum</strong> compares intended movement with sensory feedback. It adjusts timing, force, posture, and balance. Damage can produce poorly timed or unsteady movement even when the muscles can still produce force. The cerebellum works with the cortex, brainstem, spinal cord, and sensory pathways rather than acting as a separate balance switch.",
        "The <strong>brainstem</strong> connects the cerebrum, cerebellum, and spinal cord. The pons relays information and contributes to breathing, sleep, and arousal. The <strong>medulla oblongata</strong> helps regulate breathing, heart activity, blood-vessel diameter, swallowing, and other vital automatic functions. The term brainstem includes more than the medulla alone."
        ,"The pons and medulla are close together, but their names are not interchangeable. The pons forms a visible bulge above the medulla and connects with the cerebellum. The medulla continues into the spinal cord. On a diagram, use position as well as function to tell these structures apart."
      ],
      visuals: [
        { kind: "flow", id: "brain-region-network", title: "Major regions in a connected brain", steps: [{ label: "Cerebrum", detail: "Conscious perception, planning, language, memory, and voluntary movement" }, { label: "Thalamus", detail: "Organizes much sensory information moving toward cortex" }, { label: "Hypothalamus", detail: "Links internal monitoring, autonomic control, and hormones" }, { label: "Cerebellum", detail: "Adjusts movement, posture, and balance" }, { label: "Pons and medulla", detail: "Connect pathways and regulate vital automatic functions" }], description: "Each region has important roles, but complex behaviour depends on communication among regions." }
      ],
      wordLens: ["scientific-explanation"]
    },
    part3: {
      title: "The spinal cord both conducts and processes information",
      paragraphs: [
        "The <strong>spinal cord</strong> carries information between the brain and spinal nerves. Sensory information enters through dorsal roots. Motor information leaves through ventral roots. Ascending tracts carry sensory information toward the brain, while descending tracts carry motor commands toward spinal circuits. In the spinal cord, central grey matter is surrounded by white matter containing many myelinated axons.",
        "The spinal cord is also a processing centre. In a withdrawal reflex, sensory input can activate interneurons and motor neurons before the brain produces conscious awareness. The brain still receives information about the event and can shape later movement. A reflex is therefore organized neural processing, not a signal that completely avoids the central nervous system.",
        "When using symptoms as evidence, identify the observed change, connect it with a known function, and state a limit. A movement change could involve cortex, cerebellum, brainstem, spinal cord, peripheral nerves, muscles, or several sites. Classroom cases can support a biological inference, but they cannot diagnose a person."
        ,"A good location claim is therefore cautious and testable. It uses words such as “may involve” rather than “proves damage to.” It also asks what other observations could support or weaken the claim. This is the same evidence habit used when interpreting a graph or an investigation."
      ],
      visuals: [
        { kind: "flow", id: "spinal-cord-directions", title: "Information through the spinal cord", steps: [{ label: "Receptor", detail: "Detects a change" }, { label: "Dorsal entry", detail: "Sensory information enters the spinal cord" }, { label: "Spinal processing", detail: "Local synapses can organize a reflex while tracts carry information" }, { label: "Ventral exit", detail: "Motor information leaves" }, { label: "Effector", detail: "A muscle or gland responds" }], description: "Sensory and motor pathways have different directions, while the spinal cord both conducts and processes information." },
        { kind: "table", id: "brain-evidence-limits", title: "From evidence to a cautious conclusion", columns: ["Evidence", "Supported idea", "Important limit"], rows: [["Unsteady, poorly timed movement", "Cerebellar pathways may be involved", "Other sensory or motor pathways could contribute"], ["Loss of vision in part of the visual field", "Visual pathways or occipital cortex may be involved", "The symptom does not locate one site by itself"], ["Weakness below a spinal injury", "Descending motor pathways may be disrupted", "Extent depends on injury level and tissue affected"]], description: "Scientific reasoning separates a supported inference from a medical diagnosis." }
      ],
      wordLens: ["central-peripheral-systems", "scientific-explanation"]
    },
    worked: { title: "Locating a likely region", setup: "A synthetic case shows normal muscle strength but poor timing and balance during movement.", steps: ["Identify the strongest evidence: timing and balance are disrupted.", "Connect the pattern with a known function: the cerebellum helps coordinate movement.", "State the inference: cerebellar pathways may be involved.", "State the limit: the evidence does not diagnose a condition or exclude other pathways."], reasoning: "A careful conclusion uses function evidence and keeps the uncertainty visible." },
    retrieval: { title: "Connect region and job", prompt: "Choose the cerebellum, brainstem, or hypothalamus. Explain one key function and one piece of evidence that could suggest its involvement." },
    guidedHeading: "Use brain evidence carefully",
    evidencePrompt: "Explain why the statement “creative people use the right side of the brain” is not a sound model of brain function.",
    advanced: { title: "Plasticity and network recovery", paragraphs: ["Brain networks can change with learning and after some injuries. This capacity is called plasticity. Recovery depends on the location and extent of damage, health, time, and rehabilitation.", "Plasticity does not mean every damaged function fully returns. Evidence should be interpreted without promises or simple left-versus-right claims."] }
  },
  "lesson-06": {
    inquiry: "How does the nervous system turn light, pressure, temperature, and chemicals into neural information?",
    prerequisites: "You should know that neurons carry action potentials and that a receptor starts a sensory pathway.",
    words: [["sensory transduction", "conversion of stimulus energy into an electrical change in a receptor"], ["sensory receptor", "a cell or ending that responds to a particular kind of stimulus"], ["sensory adaptation", "a decrease in response during a steady stimulus"], ["proprioception", "information about body position and movement"]],
    learningGoal: "compare sensory receptor classes and explain transduction, adaptation, taste, smell, touch, and proprioception.",
    part1: {
      title: "Receptors convert different forms of energy",
      paragraphs: ["A sensory receptor does not send light, pressure, or chemicals through a neuron. It performs sensory transduction: stimulus energy changes the receptor membrane. If the change is strong enough, action potentials begin in a sensory neuron or transmitter is released to one.", "Photoreceptors respond to light. Mechanoreceptors respond to stretch, pressure, vibration, or movement. Chemoreceptors respond to particular chemicals. Thermoreceptors respond to temperature change. Nociceptors respond to potentially damaging conditions. Proprioceptors are mechanoreceptors that report muscle length, tendon tension, and joint position.", "Each receptor is most sensitive to a preferred stimulus. The brain identifies the sensation partly from which pathway is active, where it began, and how the firing pattern changes."],
      visuals: [
        { kind: "image", id: "sensory-receptor-families", title: "Sensory receptor families", src: "assets/generated-visuals/selected/lesson-08-sensory-receptor-families-selected.png", alt: "Examples of photoreceptors, mechanoreceptors, chemoreceptors, thermoreceptors, nociceptors, and proprioceptors with their preferred stimuli.", description: "Receptor classes are grouped by the kind of energy or chemical change they detect. Proprioceptors are specialized mechanoreceptors." },
        { kind: "flow", id: "sensory-transduction-path", title: "From stimulus to perception", steps: [{ label: "Stimulus", detail: "Light, force, chemical, or temperature change" }, { label: "Receptor", detail: "Membrane channels or pigments respond" }, { label: "Electrical change", detail: "A receptor potential forms" }, { label: "Neural signal", detail: "Action potentials carry information" }, { label: "CNS processing", detail: "The brain interprets the pattern" }], description: "Transduction occurs at the receptor; perception depends on later processing in the CNS." }
      ],
      wordLens: ["sensory-transduction", "sensory-receptor-classes"]
    },
    stop: { title: "Name the conversion", prompt: "Pressure bends a receptor membrane and changes its voltage. Which process has occurred?", answer: "Sensory transduction has occurred because mechanical energy was converted into an electrical change." },
    part2: {
      title: "Sensory pathways compare change over time",
      paragraphs: ["Some receptors adapt during a steady stimulus. Clothing may feel obvious when first put on, then less noticeable. The stimulus remains, but the receptor pathway sends fewer signals. Rapidly adapting receptors emphasize change. Slowly adapting receptors continue to report ongoing conditions.", "Taste and smell begin with chemoreceptors. Dissolved molecules bind to receptors in taste buds or the olfactory epithelium. Their combined patterns contribute to flavour. Touch depends on several receptor types, so pressure, vibration, temperature, and tissue damage are not one single sense.", "A fair sensory investigation changes one factor at a time. It records a responding variable and controls other conditions. Because sensation varies among people, consent, comfort, repeated trials, and a supplied-data option are essential."],
      visuals: [
        { kind: "table", id: "receptor-class-table", title: "Match stimulus with receptor", columns: ["Receptor class", "Preferred stimulus", "Unit A example"], rows: [["Photoreceptor", "Light", "Rods and cones"], ["Mechanoreceptor", "Force or movement", "Touch, hair cells, proprioception"], ["Chemoreceptor", "Chemical", "Taste and smell"], ["Thermoreceptor", "Temperature", "Skin temperature change"], ["Nociceptor", "Potential tissue damage", "Pain pathway"]], description: "A preferred stimulus can activate a receptor most effectively, while very strong other stimuli may also affect it." },
        { kind: "table", id: "adaptation-patterns", title: "Two response patterns", columns: ["Pattern", "Signal during a steady stimulus", "Useful information"], rows: [["Rapid adaptation", "Strong at change, then falls", "Onset, ending, movement"], ["Slow adaptation", "Continues while stimulus remains", "Ongoing pressure or body position"]], description: "Adaptation changes signal frequency; it does not prove that the stimulus disappeared." }
      ],
      wordLens: ["sensory-adaptation"]
    },
    worked: { title: "Planning a touch investigation", setup: "A learner asks whether two nearby points are easier to distinguish on a fingertip than on a forearm.", steps: ["Manipulated variable: body location.", "Responding variable: smallest spacing reported as two points.", "Controls: same blunt tools, pressure, instructions, and trial order method.", "Use consent, avoid broken skin, and allow a supplied anonymous data set.", "Repeat trials and report variation rather than one perfect value."], reasoning: "A useful sensory claim depends on a fair comparison and acknowledges variation and limits." },
    retrieval: { title: "Trace one sense", prompt: "Choose pressure, temperature, taste, or smell. Explain the stimulus, receptor class, transduction, and neural pathway." },
    guidedHeading: "Check receptor and signal",
    evidencePrompt: "Explain why sensory adaptation does not mean the stimulus has disappeared.",
    advanced: { title: "Receptive fields and sensory resolution", paragraphs: ["A receptor and the sensory neurons connected to it form part of a receptive field. Smaller fields and more densely packed pathways can support finer spatial detail.", "The two-point task is influenced by receptive-field size, pathway organization, attention, and procedure. It is not a medical test."] }
  },
  "lesson-07": {
    inquiry: "What happens to light between the cornea and the visual cortex?",
    prerequisites: "You should know sensory transduction and that photoreceptors respond to light.",
    words: [["cornea", "the clear curved front surface that begins focusing light"], ["lens", "the flexible structure that fine-tunes focus on the retina"], ["retina", "the light-sensitive tissue lining the back of the eye"], ["photoreceptor", "a receptor cell that changes its activity in response to light"]],
    learningGoal: "trace light through the eye and explain how rods, cones, the fovea, and the optic nerve support vision.",
    part1: {
      title: "The eye focuses light on the retina",
      paragraphs: ["Light first passes through the cornea. The cornea provides most of the eye's refraction: the bending of light as it passes between materials. Light then moves through the aqueous humour and pupil. The iris changes pupil diameter, which changes how much light enters.", "The lens fine-tunes focus. Ciliary muscles and suspensory ligaments change lens shape during accommodation. A rounder lens bends light more for a nearby object. A flatter lens bends light less for a distant object.", "Light passes through the vitreous humour and reaches the retina. The image formed on the retina is inverted, but vision is not explained by saying the brain simply flips a picture. Perception develops from neural processing across retinal and brain pathways."],
      visuals: [
        { kind: "flow", id: "eye-light-path", title: "Light through the eye", steps: [{ label: "Cornea", detail: "Begins refraction" }, { label: "Pupil", detail: "Opening controlled by the iris" }, { label: "Lens", detail: "Fine-tunes focus" }, { label: "Vitreous humour", detail: "Light crosses the eye" }, { label: "Retina", detail: "Photoreceptors change activity" }, { label: "Optic nerve", detail: "Neural signals leave the eye" }], description: "The path separates the movement of light from the later movement of neural information." },
        { kind: "table", id: "accommodation-compare", title: "Accommodation changes lens shape", columns: ["Viewing distance", "Ciliary muscle", "Lens shape", "Light bending"], rows: [["Near", "Contracts", "Rounder", "More"], ["Far", "Relaxes", "Flatter", "Less"]], description: "The lens changes shape to keep an image focused on the retina." }
      ],
      wordLens: ["vision-pathway"]
    },
    stop: { title: "Separate light from neural signals", prompt: "At what structure does light energy first become a change in receptor activity?", answer: "Photoreceptors in the retina transduce light into changes in cell activity." },
    part2: {
      title: "Rods and cones begin visual coding",
      paragraphs: ["Rods are very sensitive in dim light and support black-and-white vision, but they provide less fine detail. Cones work best in brighter light and support colour vision and high detail. Three cone classes have different wavelength sensitivities.", "The fovea is a small central region with a high density of cones. It supports sharp central vision. The optic disc is where axons leave as the optic nerve. It has no photoreceptors, creating a blind spot in each eye.", "Retinal circuits process information before it leaves the eye. Photoreceptors influence bipolar cells, which influence ganglion cells. Ganglion-cell axons form the optic nerve. At the optic chiasm, some fibres cross, so each cerebral hemisphere receives information from both eyes."],
      visuals: [
        { kind: "image", id: "retina-light-pathway", title: "Retina and visual pathway", src: "assets/generated-visuals/selected/lesson-09-retina-pathway-selected.png", alt: "Light reaches retinal photoreceptors, information passes through retinal cells to ganglion-cell axons, and the optic nerves partially cross before signals reach visual areas of the brain.", description: "Light travels through the retina to rods and cones. Neural information then travels in the opposite direction through retinal circuits and along the optic nerve." },
        { kind: "table", id: "rods-cones", title: "Rods and cones", columns: ["Feature", "Rods", "Cones"], rows: [["Light level", "Very sensitive in dim light", "Work best in brighter light"], ["Colour", "No colour discrimination", "Colour vision"], ["Detail", "Lower detail", "High detail, especially in fovea"], ["Distribution", "Common outside the fovea", "Most dense in the fovea"]], description: "The two receptor types contribute different information to vision." }
      ],
      wordLens: ["sensory-transduction", "vision-pathway"]
    },
    worked: { title: "Reading a pathway question", setup: "A ray of light enters the eye and a signal later reaches the visual cortex.", steps: ["Trace light: cornea → pupil → lens → vitreous humour → retina.", "Name transduction: rods or cones change activity in response to light.", "Trace neural information: retinal circuits → ganglion cells → optic nerve.", "Add central processing: pathways partly cross and continue toward visual cortex."], reasoning: "A complete answer clearly separates the optical path from the neural path." },
    retrieval: { title: "Trace two pathways", prompt: "Write one sequence for light through the eye and a second sequence for neural information leaving the retina." },
    guidedHeading: "Check focus and photoreceptors",
    evidencePrompt: "Compare rods and cones using light level, colour, and visual detail.",
    advanced: { title: "Blind spots and visual processing", paragraphs: ["The optic disc creates a retinal blind spot, yet it is not usually noticed. Overlapping information from both eyes and brain processing help fill the perceptual gap.", "This is evidence that vision is an active neural construction. It is more accurate than saying the brain receives and flips a complete camera image."] }
  },
  "lesson-08": {
    inquiry: "How can the inner ear detect both sound vibrations and head movement?",
    prerequisites: "You should know that mechanoreceptors convert movement into neural information.",
    words: [["tympanic membrane", "the eardrum, which vibrates when sound waves arrive"], ["ossicles", "three middle-ear bones that transfer vibration"], ["cochlea", "the coiled inner-ear structure for hearing"], ["equilibrium", "the sensing and control of balance and head position"]],
    learningGoal: "trace sound through the ear and explain how hair cells support hearing and equilibrium.",
    part1: {
      title: "Sound energy moves through three regions",
      paragraphs: ["Sound waves enter the auditory canal and vibrate the tympanic membrane. The malleus, incus, and stapes are the three ossicles of the middle ear. They transfer vibration to the oval window of the inner ear.", "Pressure waves then move through fluid in the cochlea. They move the basilar membrane and bend hair cells in the organ of Corti. Bending opens mechanically gated channels, changing transmitter release onto sensory neurons. This is sensory transduction.", "The round window allows pressure to be released. The Eustachian tube connects the middle ear with the throat and helps equalize air pressure across the tympanic membrane. It is not part of the neural sound pathway."],
      visuals: [
        { kind: "flow", id: "sound-pathway", title: "Sound from air to neural signal", steps: [{ label: "Auditory canal", detail: "Directs sound waves" }, { label: "Tympanic membrane", detail: "Vibrates" }, { label: "Ossicles", detail: "Transfer vibration" }, { label: "Oval window", detail: "Moves inner-ear fluid" }, { label: "Cochlea", detail: "Basilar membrane moves" }, { label: "Hair cells", detail: "Transduce movement" }, { label: "Auditory nerve", detail: "Carries neural information" }], description: "Mechanical energy is transferred through the outer, middle, and inner ear before transduction by hair cells." },
        { kind: "table", id: "ear-regions", title: "Three regions of the ear", columns: ["Region", "Main structures", "Main job"], rows: [["Outer ear", "Pinna and auditory canal", "Collect and direct sound"], ["Middle ear", "Tympanic membrane and ossicles", "Transfer vibration"], ["Inner ear", "Cochlea and vestibular apparatus", "Transduce sound and movement"]], description: "The regions organize the path but work together as one system." }
      ],
      wordLens: ["hearing-equilibrium-pathway"]
    },
    stop: { title: "Find transduction", prompt: "Which cells convert movement of the basilar membrane into a change in neural signalling?", answer: "Hair cells in the organ of Corti perform the transduction." },
    part2: {
      title: "The vestibular apparatus detects head movement",
      paragraphs: ["The semicircular canals detect rotational movement. Each canal is oriented in a different plane. When the head turns, fluid movement bends a gelatinous structure and its hair cells. The firing pattern changes with the direction and speed of rotation.", "The utricle and saccule detect linear acceleration and head position relative to gravity. Small calcium-carbonate crystals add mass to a gelatinous layer. Movement shifts the layer and bends hair cells.", "Balance also uses vision and proprioception. The brain compares these sources and sends motor commands that adjust posture and eye movement. A classroom activity cannot diagnose hearing loss or a balance disorder. Avoid high-volume sound and stop any movement that causes discomfort."],
      visuals: [
        { kind: "image", id: "equilibrium-apparatus", title: "Equilibrium in the inner ear", src: "assets/generated-visuals/selected/lesson-10-equilibrium-selected.png", alt: "Semicircular canals detect rotational movement while the utricle and saccule detect linear acceleration and head position.", description: "Hair cells bend when fluid or weighted gelatinous layers move. The three semicircular canals are arranged in different planes." },
        { kind: "table", id: "hearing-balance-compare", title: "One receptor type, different mechanical inputs", columns: ["System", "Structure", "Movement detected"], rows: [["Hearing", "Cochlear hair cells", "Sound-driven basilar-membrane movement"], ["Rotation", "Semicircular canals", "Fluid movement during head turning"], ["Linear acceleration", "Utricle and saccule", "Weighted layer shifts with gravity or straight-line motion"]], description: "Hair cells are mechanoreceptors in both hearing and equilibrium pathways." }
      ],
      wordLens: ["sensory-transduction", "hearing-equilibrium-pathway"]
    },
    worked: { title: "A head turn in the dark", setup: "A learner turns their head while standing still, then closes their eyes.", steps: ["Semicircular-canal fluid lags during the turn and bends hair cells.", "Vestibular neurons carry a changed firing pattern to the CNS.", "Proprioceptors also report body position.", "Closing the eyes removes one source of balance information, so the CNS relies more on vestibular and proprioceptive input."], reasoning: "Equilibrium is an integrated result, not the work of one organ alone." },
    retrieval: { title: "Compare the hair cells", prompt: "Explain how hair cells support both hearing and balance, including what bends them in each system." },
    guidedHeading: "Check sound and balance",
    evidencePrompt: "Trace a sound wave from the auditory canal to an auditory nerve signal.",
    advanced: { title: "Place coding in the cochlea", paragraphs: ["Different parts of the basilar membrane respond best to different sound frequencies. High-frequency sounds peak near the base; lower frequencies peak farther along the cochlea.", "This place pattern contributes to pitch coding. It does not make a browser tone or classroom activity a hearing test."] }
  },
  "lesson-09": {
    inquiry: "How do the nervous and endocrine systems keep changing conditions within workable ranges?",
    prerequisites: "You should know neural pathways, receptors, and that organs respond only when their cells have suitable receptors.",
    words: [["homeostasis", "dynamic regulation of internal conditions within workable ranges"], ["regulated variable", "a condition monitored and adjusted by a control system"], ["negative feedback", "a response that reduces the original disturbance"], ["target cell", "a cell with a receptor that can respond to a signal"]],
    learningGoal: "build a negative-feedback loop and compare nervous and endocrine control by signal, route, speed, and duration.",
    part1: {
      title: "Homeostasis is active and dynamic",
      paragraphs: ["Homeostasis does not hold the body at one unchanging number. Conditions such as temperature, blood glucose, and water balance vary within workable ranges. Control systems detect changes and adjust responses over time.", "A regulated variable is the condition being monitored. A receptor detects a change. A control centre compares information with a workable range and organizes output. An effector changes its activity. The response changes the regulated variable.", "In negative feedback, the response reduces the original disturbance. If body temperature rises, heat-loss responses oppose the rise. The word negative describes the direction of the response, not whether the response is harmful."],
      visuals: [
        { kind: "image", id: "integrated-control", title: "An integrated control system", src: "assets/generated-visuals/selected/lesson-01-integrated-control-selected.png", alt: "A disturbance changes a regulated variable, a receptor and control centre process information, and an effector produces a response that reduces the disturbance.", description: "Follow the variable around the loop. Negative feedback is confirmed only when the response opposes the original change." },
        { kind: "flow", id: "negative-feedback-loop", title: "Build a negative-feedback explanation", steps: [{ label: "Disturbance", detail: "A variable moves away from its workable range" }, { label: "Receptor", detail: "Detects the change" }, { label: "Control centre", detail: "Processes information and sends output" }, { label: "Effector", detail: "Changes activity" }, { label: "Response", detail: "Opposes the disturbance" }], description: "A complete loop names the regulated variable and explains how the response changes it." }
      ],
      wordLens: ["homeostasis", "regulated-variable-set-point", "control-system-roles", "negative-feedback"]
    },
    stop: { title: "Check the return effect", prompt: "Sweating increases heat loss after body temperature rises. What makes this negative feedback?", answer: "The response opposes the original rise by increasing heat loss, which moves temperature toward its workable range." },
    part2: {
      title: "Two control systems use different signals",
      paragraphs: ["The nervous system sends electrical signals along neurons and chemical signals across synapses. Its responses are often fast, brief, and directed to specific connected targets.", "The endocrine system releases hormones into the blood. Hormones travel widely, but only receptor-bearing target cells respond. Endocrine responses are often slower to begin and longer lasting because transport, receptor binding, and changes inside target cells take time.", "The systems overlap. The hypothalamus receives neural information and controls pituitary pathways. Sympathetic neurons stimulate the adrenal medulla. During stress, fast neural signals and longer hormone responses can support the same body-wide goal."],
      visuals: [
        { kind: "image", id: "control-system-comparison", title: "Nervous and endocrine control", src: "assets/generated-visuals/selected/lesson-02-control-comparison-selected.png", alt: "A comparison of neural signals travelling along neurons with hormones released into blood and binding only to receptor-bearing target cells.", description: "Neural and endocrine systems differ in route, speed, duration, and targeting, yet they can coordinate one response." },
        { kind: "image", id: "endocrine-body-map", title: "Major Unit A endocrine structures", src: "assets/generated-visuals/lesson-12-endocrine-map-2dd61d4a.png", alt: "A body map showing the hypothalamus, pituitary, thyroid and parathyroid glands, adrenal glands, and pancreatic islets.", description: "The map locates the endocrine structures used in Unit A. A gland releases a hormone; a target cell is defined by its receptor, not by its distance from the gland." }
      ],
      wordLens: ["endocrine-signalling"]
    },
    worked: { title: "Troubleshoot a feedback claim", setup: "A learner writes: “Blood glucose rises, insulin is released, so this is negative feedback.”", steps: ["Name the regulated variable: blood glucose.", "Name the disturbance: glucose rises after a meal.", "Name an effector response: responsive tissues increase uptake or storage, and liver output falls.", "Show the return effect: these changes oppose the rise."], reasoning: "Hormone release alone does not prove negative feedback. The target response must reduce the original disturbance." },
    retrieval: { title: "Build a complete loop", prompt: "Choose body temperature or blood glucose. Name the variable, receptor or sensor, control signal, effector, and return effect." },
    guidedHeading: "Check the control system",
    evidencePrompt: "Compare nervous and endocrine control using signal, route, speed, duration, and target.",
    advanced: { title: "Set points, ranges, and changing needs", paragraphs: ["A set point is a useful model, but many variables are regulated within ranges that change with time, activity, meals, sleep, or development.", "Strong explanations use the evidence given in a case. They do not assume that every person has one fixed ideal value at all times."] }
  },
  "lesson-10": {
    inquiry: "How can the hypothalamus and pituitary control another endocrine gland or body tissue?",
    prerequisites: "You should know endocrine signalling, target-cell receptors, and negative feedback.",
    words: [["hypothalamus", "the brain region that links neural information with pituitary control"], ["pituitary gland", "an endocrine gland connected to and regulated by the hypothalamus"], ["tropic hormone", "a hormone whose main target is another endocrine gland"], ["human growth hormone", "a pituitary hormone that supports growth and metabolism"]],
    learningGoal: "trace a hypothalamus-pituitary pathway and explain the source, target, and effects of human growth hormone.",
    part1: {
      title: "The hypothalamus controls two pituitary regions",
      paragraphs: ["The pituitary is sometimes called a master gland, but that label is incomplete. The hypothalamus regulates pituitary activity, and several other glands also respond to signals outside the pituitary.", "The anterior pituitary is glandular tissue. Hypothalamic releasing hormones travel through a small portal blood system and control anterior-pituitary cells. Some anterior-pituitary hormones are tropic because they stimulate another endocrine gland. TSH targets the thyroid, and ACTH targets the adrenal cortex.", "The posterior pituitary is neural tissue. It stores and releases hormones made by hypothalamic neurons. ADH is one of those hormones and will be studied in the next lesson."],
      visuals: [
        { kind: "flow", id: "hypothalamus-pituitary-path", title: "Two routes from the hypothalamus", steps: [{ label: "Hypothalamus", detail: "Receives neural and internal information" }, { label: "Anterior route", detail: "Releasing hormone enters portal blood" }, { label: "Anterior pituitary", detail: "Releases hGH or a tropic hormone" }, { label: "Posterior route", detail: "Hypothalamic axons carry hormone" }, { label: "Posterior pituitary", detail: "Stores and releases ADH" }], description: "The anterior pituitary makes its hormones; the posterior pituitary releases hormones made in the hypothalamus." },
        { kind: "table", id: "tropic-hormone-preview", title: "Source, target, and effect", columns: ["Hormone", "Source", "Main target", "Unit A effect"], rows: [["hGH", "Anterior pituitary", "Many tissues, including liver, bone, muscle", "Supports growth and metabolism"], ["TSH", "Anterior pituitary", "Thyroid", "Stimulates thyroxine release"], ["ACTH", "Anterior pituitary", "Adrenal cortex", "Stimulates cortisol release"]], description: "A tropic hormone acts mainly on another endocrine gland; hGH has many direct and indirect targets." }
      ],
      wordLens: ["hypothalamus-pituitary-axis"]
    },
    stop: { title: "Test the master-gland claim", prompt: "Why is “the pituitary controls every endocrine gland” inaccurate?", answer: "The hypothalamus regulates the pituitary, not every gland is controlled by it, and glands can also respond to blood chemistry or neural signals." },
    part2: {
      title: "Human growth hormone supports growth and fuel use",
      paragraphs: ["Human growth hormone, or hGH, is released by the anterior pituitary. It acts directly on some tissues and stimulates the liver and other tissues to produce growth factors. These signals support protein synthesis, cell division, bone growth, and changes in fuel use.", "Growth plates are regions near the ends of growing long bones where new tissue allows the bones to lengthen. Too little hGH during childhood can limit growth. Too much before growth plates close can cause excessive linear growth. Too much after the plates close can enlarge some bones and soft tissues. These patterns are explained as hormone imbalances, not diagnosed from appearance.", "hGH release changes in pulses and is influenced by sleep, activity, nutrition, and feedback. A single measurement may therefore be hard to interpret. A useful data explanation looks for a pattern over time and identifies its limits."],
      visuals: [
        { kind: "flow", id: "hgh-pathway", title: "Human growth hormone pathway", steps: [{ label: "Hypothalamus", detail: "Controls anterior-pituitary release" }, { label: "Anterior pituitary", detail: "Releases hGH" }, { label: "Targets", detail: "Liver, bone, muscle, and other tissues with receptors" }, { label: "Effects", detail: "Growth-factor release, protein synthesis, growth, metabolism" }, { label: "Feedback", detail: "Target signals reduce further release" }], description: "hGH has direct effects and indirect effects through growth factors." },
        { kind: "table", id: "hgh-data-pattern", title: "Read a pulse pattern", columns: ["Time", "Sample A hGH", "Sample B hGH"], rows: [["08:00", "Low", "Low"], ["12:00", "Moderate pulse", "Low"], ["22:00", "High pulse", "Moderate pulse"], ["02:00", "Low", "High pulse"]], description: "Synthetic instructional data show why repeated samples are more informative than one value. The table is not diagnostic." }
      ],
      wordLens: ["endocrine-signalling"]
    },
    worked: { title: "Follow a tropic pathway", setup: "ACTH rises and cortisol rises later.", steps: ["Source of ACTH: anterior pituitary.", "Target: receptor-bearing cells of the adrenal cortex.", "Effect: cortisol production and release increase.", "Feedback: rising cortisol can reduce hypothalamic and pituitary stimulation."], reasoning: "A tropic pathway names two endocrine levels and closes the loop with feedback." },
    retrieval: { title: "Separate the two pituitary regions", prompt: "Explain one difference between the anterior and posterior pituitary, then name one hormone linked with each." },
    guidedHeading: "Check pituitary pathways",
    evidencePrompt: "Explain why the pituitary is important but should not be described as controlling every endocrine gland by itself.",
    advanced: { title: "Pulses and feedback in growth signalling", paragraphs: ["hGH is secreted in pulses rather than at a constant rate. Growth factors, blood nutrient levels, sleep, and hypothalamic signals influence the pattern.", "Standard-of-excellence reasoning distinguishes direct hGH effects from effects mediated by growth factors and explains why one sample has limited value."] }
  },
  "lesson-11": {
    inquiry: "How does the body conserve water when blood becomes too concentrated?",
    prerequisites: "You should know the hypothalamus-pituitary relationship, target cells, and negative feedback.",
    words: [["ADH", "antidiuretic hormone, which increases water reabsorption in the kidneys"], ["osmoreceptor", "a receptor that responds to changes in fluid concentration"], ["water reabsorption", "movement of filtered water back into the blood"], ["osmotic concentration", "the amount of dissolved solute relative to water"]],
    learningGoal: "trace ADH from stimulus to kidney response and explain changes in urine volume and concentration.",
    part1: {
      title: "Osmoreceptors detect a water-balance disturbance",
      paragraphs: [
        "Body fluids contain water and dissolved substances such as sodium ions. When the body loses water through sweating, breathing, or urine, the blood plasma becomes more concentrated. Specialized <strong>osmoreceptors</strong> in the hypothalamus respond to this change. They provide the sensory information that begins the water-conservation response.",
        "Neurons in the <strong>hypothalamus</strong> make antidiuretic hormone, or <strong>ADH</strong>. The hormone moves down their axons and is stored in nerve endings in the posterior pituitary. When the neurons are activated, the posterior pituitary releases ADH into the blood. The hypothalamus is the production site; the posterior pituitary is the release site.",
        "ADH travels to kidney collecting ducts. It binds to receptors on specific duct cells and increases the placement of <strong>aquaporin</strong> water channels in their membranes. More water then moves from the forming urine back into the blood. ADH does not pull dissolved wastes out of the urine, and it cannot affect cells that lack the matching receptor."
        ,"Water moves through aquaporins by osmosis, from a region with more available water toward the more concentrated fluid around the collecting duct. ADH changes how easily water can cross the duct membrane. It does not make the kidney create new water. This distinction links a hormone signal to a physical movement of water."
      ],
      visuals: [
        { kind: "flow", id: "adh-feedback", title: "ADH negative feedback", steps: [{ label: "Water loss", detail: "Blood becomes more concentrated" }, { label: "Hypothalamic osmoreceptors", detail: "Detect the concentration change" }, { label: "Posterior pituitary", detail: "Releases ADH made in the hypothalamus" }, { label: "Kidney collecting ducts", detail: "Reabsorb more water" }, { label: "Return effect", detail: "Blood concentration falls toward its range" }], description: "ADH release, blood transport, receptor binding, and kidney response are distinct steps." },
        { kind: "table", id: "adh-urine-pattern", title: "Predict urine from ADH", columns: ["Condition", "ADH", "Water reabsorbed", "Urine"], rows: [["Water loss", "Higher", "More", "Lower volume, more concentrated"], ["Excess water", "Lower", "Less", "Higher volume, more dilute"]], description: "The response changes water reabsorption rather than creating or destroying water." }
      ],
      wordLens: ["hypothalamus-pituitary-axis", "water-salt-regulation"]
    },
    stop: { title: "Keep source and release site separate", prompt: "Where is ADH made, and where is it released into the blood?", answer: "ADH is made by neurons in the hypothalamus and released from the posterior pituitary." },
    part2: {
      title: "Negative feedback changes urine volume and concentration",
      paragraphs: [
        "When ADH activity rises, the kidneys return more water to the blood. The remaining urine has less water, so its volume falls and its concentration rises. Water conservation helps dilute the blood back toward its workable range. As the disturbance becomes smaller, osmoreceptor stimulation and ADH release fall. Thirst can support the same goal by increasing water intake.",
        "When body fluids are unusually dilute, osmoreceptor stimulation decreases. Less ADH is released, collecting ducts become less permeable to water, and a larger volume of dilute urine is produced. ADH therefore changes both urine volume and urine concentration, but in opposite directions. A strong answer always states which variable rises and which falls.",
        "The graph shows a general relationship rather than a medical reference range. As blood concentration rises above the course model's baseline, ADH and urine concentration rise while urine volume falls. The response is dynamic: values change over time, and they do not remain fixed at one exact number."
        ,"Read each line from left to right before comparing the lines. First state what happens to blood concentration. Then describe the direction of ADH, urine concentration, and urine volume. Finally, explain the kidney mechanism. This order prevents a graph description from becoming a list with no biological cause."
      ],
      visuals: [
        { kind: "svg", id: "adh-response-graph", title: "ADH and urine patterns as blood concentration rises", variant: "adh-response-graph", description: "The graph and data table show that higher blood concentration is associated with more ADH, more concentrated urine, and less urine volume in the course model." },
        { kind: "flow", id: "source-target-effect", title: "Hormone reasoning frame", steps: [{ label: "Stimulus", detail: "Blood concentration changes" }, { label: "Sensor and source", detail: "Hypothalamic osmoreceptors respond and hypothalamic neurons make ADH" }, { label: "Release", detail: "Posterior pituitary releases ADH" }, { label: "Target", detail: "Collecting-duct cells with ADH receptors" }, { label: "Effect", detail: "Water reabsorption changes" }], description: "Naming production site, release site, receptor-bearing target, and effect prevents common hormone-pathway errors." }
      ],
      wordLens: ["water-salt-regulation"]
    },
    part3: {
      title: "A changed pathway produces a different data pattern",
      paragraphs: [
        "Urine and blood data can help locate a changed step. A low volume of concentrated urine during dehydration is consistent with effective ADH signalling. A large volume of dilute urine despite concentrated blood may mean that too little ADH reaches the blood or that the kidney does not respond normally. One pattern alone cannot show which explanation is correct.",
        "<strong>Diabetes insipidus</strong> is a water-balance disorder involving too little effective ADH signalling. It is different from diabetes mellitus, which involves blood-glucose regulation. In a central form, too little ADH is produced or released. In a nephrogenic form, the kidneys respond poorly even when ADH is present. Both can produce large amounts of dilute urine and strong thirst.",
        "Course cases use synthetic data and do not diagnose anyone. Caffeine may increase urine output in some situations, but it should not be described as simply turning off ADH in every person. Dose, habitual use, fluid intake, and kidney responses all matter. A careful explanation uses the supplied evidence and names what it cannot establish."
        ,"When two samples differ, hold the causal claim to the evidence provided. High ADH with dilute urine supports a possible target-response problem, while low ADH with dilute urine points to a different step. Other measurements would still be needed. The goal is to locate a pathway change, not attach a medical label."
      ],
      visuals: [
        { kind: "table", id: "water-balance-data", title: "Synthetic water-balance evidence", columns: ["Sample", "Blood concentration", "ADH", "Urine volume", "Urine concentration"], rows: [["A", "High", "High", "Low", "High"], ["B", "Low", "Low", "High", "Low"], ["C", "High", "High", "High", "Low"]], description: "Samples A and B show expected feedback patterns. Sample C shows that ADH is present but the expected kidney response is absent; it does not establish a diagnosis." }
      ],
      wordLens: ["water-salt-regulation", "scientific-explanation"]
    },
    worked: { title: "Explain a dehydration pattern", setup: "After several hours without water, a synthetic data set shows higher blood concentration, higher ADH, and lower urine volume.", steps: ["Water loss raises blood concentration.", "Osmoreceptors stimulate ADH release.", "ADH binds to kidney target-cell receptors.", "More water is reabsorbed, so urine volume falls and concentration rises.", "Water conservation opposes the original concentration increase."], reasoning: "The data fit negative feedback because the kidney response reduces the disturbance." },
    retrieval: { title: "Trace ADH", prompt: "Explain the ADH pathway using stimulus, sensor, hormone source, release site, target, effect, and return effect." },
    guidedHeading: "Check water balance",
    evidencePrompt: "Use the ADH pathway to explain why dehydration can produce a small volume of concentrated urine.",
    advanced: { title: "When ADH is present but the kidney does not respond", paragraphs: ["A pathway can fail at the signal or at the receptor-bearing target. If ADH is low, the release step may be disrupted. If ADH is high but urine remains very dilute, kidney response may be disrupted.", "This source-versus-target distinction is useful biological reasoning. Real diagnosis requires more evidence and clinical testing."] }
  },
  "lesson-12": {
    inquiry: "How do thyroid and parathyroid hormones regulate metabolism and blood calcium?",
    prerequisites: "You should know tropic hormones, target cells, negative feedback, and how to trace source, target, and effect.",
    words: [["TSH", "thyroid-stimulating hormone from the anterior pituitary"], ["thyroxine", "a thyroid hormone that increases metabolic activity in many target tissues"], ["PTH", "parathyroid hormone, which raises blood calcium"], ["calcitonin", "a thyroid hormone that can help lower blood calcium"]],
    learningGoal: "trace TSH-thyroxine feedback and compare PTH with calcitonin in calcium regulation.",
    part1: {
      title: "TSH connects the pituitary with the thyroid",
      paragraphs: ["The thyroid gland lies at the front of the neck. The anterior pituitary releases TSH, which binds to receptors on thyroid cells. The thyroid then produces and releases thyroxine.", "Thyroxine increases metabolic activity in many receptor-bearing tissues. It influences oxygen use, heat production, fuel use, growth, and development. It does not make every cell respond in exactly the same way.", "Rising thyroxine reduces stimulation from the hypothalamus and anterior pituitary. This negative feedback helps prevent continued release. Low thyroxine can therefore be paired with high TSH when the thyroid itself is not responding well, or with low TSH when pituitary stimulation is reduced."],
      visuals: [
        { kind: "flow", id: "thyroid-axis", title: "TSH-thyroxine feedback", steps: [{ label: "Hypothalamus", detail: "Stimulates the anterior pituitary" }, { label: "Anterior pituitary", detail: "Releases TSH" }, { label: "Thyroid", detail: "Releases thyroxine" }, { label: "Target tissues", detail: "Metabolic activity changes" }, { label: "Feedback", detail: "Thyroxine reduces further stimulation" }], description: "TSH is the tropic signal; thyroxine is the target-gland hormone that feeds back." },
        { kind: "table", id: "thyroid-data-reasoning", title: "Read TSH and thyroxine together", columns: ["Pattern", "TSH", "Thyroxine", "Supported pathway idea"], rows: [["A", "High", "Low", "Pituitary is stimulating, but thyroid output remains low"], ["B", "Low", "High", "High thyroxine is reducing TSH stimulation"], ["C", "Low", "Low", "Pituitary stimulation may be reduced"]], description: "Synthetic patterns locate a possible level of disruption but do not diagnose a disorder." }
      ],
      wordLens: ["hypothalamus-pituitary-axis", "thyroid-calcium-feedback"]
    },
    stop: { title: "Name the tropic hormone", prompt: "Which hormone directly stimulates the thyroid gland, and where is it released?", answer: "TSH directly stimulates the thyroid. It is released by the anterior pituitary." },
    part2: {
      title: "PTH and calcitonin coordinate blood calcium",
      paragraphs: ["Small parathyroid glands are located on the back of the thyroid. When blood calcium falls, they release PTH. PTH raises blood calcium by increasing calcium release from bone, increasing kidney reabsorption, and supporting intestinal absorption through vitamin-D activation.", "Calcitonin is released by cells in the thyroid when blood calcium is high. It can reduce bone breakdown and support calcium storage. In adult human calcium regulation, PTH has the stronger day-to-day role, so the pair should not be treated as perfectly equal switches.", "Bone is living tissue. Calcium moves between blood and bone as cells build and break down bone matrix. The kidney and intestine also matter. A complete feedback answer names these effectors rather than saying a hormone changes blood calcium by itself."],
      visuals: [
        { kind: "flow", id: "pth-calcium-loop", title: "PTH raises blood calcium", steps: [{ label: "Blood calcium falls", detail: "Parathyroid cells detect the change" }, { label: "PTH rises", detail: "Hormone travels in blood" }, { label: "Bone, kidney, intestine", detail: "Calcium movement changes" }, { label: "Blood calcium rises", detail: "The original fall is opposed" }, { label: "PTH stimulation falls", detail: "Negative feedback closes the loop" }], description: "PTH coordinates several effectors to oppose a fall in blood calcium." },
        { kind: "table", id: "calcium-hormone-compare", title: "Two calcium signals", columns: ["Hormone", "Released when", "Main direction", "Important targets"], rows: [["PTH", "Blood calcium is low", "Raises blood calcium", "Bone, kidney, indirect intestine"], ["Calcitonin", "Blood calcium is high", "Can lower blood calcium", "Mainly bone and kidney"]], description: "The hormones have opposing directions, but their physiological roles are not identical in strength." }
      ],
      wordLens: ["antagonistic-hormones", "thyroid-calcium-feedback", "negative-feedback"]
    },
    worked: { title: "Use two hormone values", setup: "Synthetic data show low thyroxine and high TSH.", steps: ["Low thyroxine reduces negative feedback.", "The hypothalamus and pituitary continue stimulation.", "TSH rises because the anterior pituitary is signalling strongly.", "The pattern supports reduced thyroid output despite stimulation."], reasoning: "Paired hormone values reveal more about the pathway than either value alone. The pattern is instructional, not diagnostic." },
    retrieval: { title: "Compare two loops", prompt: "Explain one similarity and one difference between TSH-thyroxine feedback and PTH calcium regulation." },
    guidedHeading: "Check thyroid and calcium control",
    evidencePrompt: "Explain how low blood calcium leads to a PTH response that opposes the disturbance.",
    advanced: { title: "Why antagonistic does not mean perfectly symmetrical", paragraphs: ["Antagonistic hormones produce opposing effects on a regulated variable. They do not need identical targets, strength, or timing.", "PTH is the main rapid regulator when blood calcium falls. Calcitonin has a more limited role in many adult contexts. The course model keeps the opposing direction while preserving that nuance."] }
  }
};

/**
 * Revision Gate B completes the teacher-approved lesson pattern across the
 * remaining generated lessons. These additions stay in authored TypeScript so
 * the learner receives static HTML, while the source order remains easy to
 * compare with the daily plans and PowerPoint slide ranges.
 */
const GATE_B_LESSON_EXPANSIONS: Record<string, {
  part1: string[];
  part2: string[];
  part3: LessonPart;
}> = {
  "lesson-04": {
    part1: [
      "The CNS and PNS are location groups, not two unrelated systems. A touch receptor in the hand belongs to the PNS. Its sensory axon enters the spinal cord, which belongs to the CNS. A motor command then leaves the spinal cord through another PNS axon. One response can therefore cross the CNS–PNS boundary more than once.",
      "A <strong>ganglion</strong> is a cluster of neuron cell bodies in the PNS. A nerve is a bundle of PNS axons. These words are not interchangeable. In the CNS, bundles of axons are usually called tracts, while groups of cell bodies form nuclei or layers. For this course, first decide whether a structure is inside or outside the brain and spinal cord."
    ],
    part2: [
      "Autonomic motor pathways usually use a two-neuron chain. A first neuron leaves the CNS and connects with a second neuron in an autonomic ganglion. The second neuron reaches cardiac muscle, smooth muscle, or a gland. Somatic motor pathways usually use one motor neuron from the CNS to skeletal muscle. This pathway difference helps explain why a ganglion is important in autonomic control.",
      "Sympathetic and parasympathetic are names for coordinated pathways, not personality types. Sympathetic activity becomes prominent during an immediate challenge. Parasympathetic activity supports many routine functions and recovery. Both divisions remain active to different degrees, and the balance can change from one organ to another."
    ],
    part3: {
      title: "White matter and grey matter describe what is concentrated in the tissue",
      paragraphs: [
        "In the CNS, <strong>white matter</strong> contains many myelinated axons. The lipid-rich myelin gives the tissue a lighter appearance. <strong>Grey matter</strong> contains many neuron cell bodies, dendrites, synapses, and unmyelinated regions. Both kinds of tissue also contain glial cells and blood vessels. The labels describe concentrations, not pure tissue made of only one structure.",
        "Their arrangement changes by location. In much of the cerebrum, grey matter forms an outer cortex and deeper groups of cell bodies, while white matter carries axons between regions. In the spinal cord, much of the grey matter lies more centrally and white matter surrounds it. A diagram should therefore be read by location rather than by a rule that grey is always outside.",
        "Myelin links this tissue pattern with conduction. An axon in white matter can carry information quickly between distant CNS regions. A synapse in grey matter allows information to be combined or redirected. A useful explanation names the structure, its location, and the kind of information work that happens there.",
        "To trace a pathway, begin at the receptor. Mark every segment as sensory or motor, afferent or efferent, and CNS or PNS. Then name the effector. This method is more reliable than memorizing a list because it follows the direction in which information actually travels."
      ],
      visuals: [{
        kind: "table",
        id: "white-grey-matter-relationship",
        title: "White matter and grey matter work together",
        columns: ["Tissue description", "Structures concentrated there", "Main information role", "Common location example"],
        rows: [
          ["White matter", "Many myelinated axons", "Carry signals between regions", "Deeper cerebrum; outer spinal cord"],
          ["Grey matter", "Many cell bodies, dendrites, and synapses", "Combine and process information", "Cerebral cortex; central spinal cord"]
        ],
        description: "White and grey matter contain several cell parts. Their names describe which structures are concentrated in a region, and their arrangement differs between brain and spinal cord."
      }],
      wordLens: ["central-peripheral-systems", "myelin-conduction"]
    }
  },
  "lesson-06": {
    part1: [
      "<strong>Sensation</strong> begins when receptors detect a stimulus and sensory pathways carry information toward the CNS. <strong>Perception</strong> is the meaning the CNS builds from that information. The two are connected but not identical. The same receptor signal can be interpreted differently when context, attention, or information from another sense changes.",
      "Transduction begins with a change in receptor membrane voltage called a receptor potential. A larger effective stimulus can produce a larger receptor potential. If threshold is reached in the connected sensory neuron, action potentials begin. Their frequency can change with stimulus strength even though each action potential remains all-or-none."
    ],
    part2: [
      "Adaptation does not mean that every sensory pathway becomes silent. Some receptors respond strongly when a stimulus starts or stops. Others continue signalling while the condition remains. Pain pathways may adapt slowly or not in the same way as light touch. The pattern helps the nervous system notice both new events and conditions that still require attention.",
      "Taste and smell use many receptor types and pattern recognition. A food molecule must dissolve before it can reach a taste receptor. Airborne molecules dissolve in mucus before reaching olfactory receptors. Flavour also depends on temperature, texture, and smell, which is why a blocked nose can change the experience of eating."
    ],
    part3: {
      title: "Receptor density and experimental design shape the evidence",
      paragraphs: [
        "Touch sensitivity is not uniform across the body. Areas used for fine discrimination, such as fingertips, often have more receptor pathways and smaller receptive fields than areas such as the forearm. A receptive field is the area where a stimulus can change the activity of a particular sensory neuron. Two nearby touches are easier to distinguish when they activate separate pathways. This is a population pattern, not a test that every person must match.",
        "A two-point investigation needs a clear manipulated variable, such as point spacing or body location. The responding variable could be the proportion of trials reported as two points. Pressure, order, contact time, vision, and the tool should be controlled. Randomizing one-point and two-point trials reduces guessing based on a predictable sequence.",
        "Consent and comfort come first. Use blunt materials, gentle pressure, and no face or injured-skin testing. A learner may use supplied data instead. The results describe performance under the test conditions and cannot diagnose nerve damage or a sensory disorder.",
        "When reading a data table, compare repeated trials rather than one response. State the pattern, support it with values, and then connect it to receptor density or receptive-field size. End by naming a limitation. This turns an observation into a scientific explanation without claiming more than the evidence shows."
      ],
      visuals: [{
        kind: "table",
        id: "touch-density-evidence",
        title: "Synthetic two-point discrimination evidence",
        columns: ["Point spacing", "Fingertip: two points reported", "Forearm: two points reported"],
        rows: [["4 mm", "4 of 5 trials", "0 of 5 trials"], ["12 mm", "5 of 5 trials", "2 of 5 trials"], ["30 mm", "5 of 5 trials", "5 of 5 trials"]],
        description: "The fingertip separates nearby points more often in this synthetic data set. Repeated trials support a pattern, but the activity is not diagnostic."
      }],
      wordLens: ["sensory-receptor-classes", "scientific-explanation"]
    }
  },
  "lesson-07": {
    part1: [
      "The <strong>sclera</strong> is the tough outer coat that protects the eye and helps it keep its shape. At the front, the clear cornea continues this outer layer and bends incoming light. The <strong>choroid</strong> lies inside the sclera. Its blood vessels support eye tissues, and its pigment absorbs scattered light.",
      "The aqueous humour fills the space near the cornea and lens. The vitreous humour fills the larger chamber behind the lens. These clear fluids help maintain eye shape and allow light to pass. They are not photoreceptors. Light detection begins only when focused light reaches rods and cones in the retina."
    ],
    part2: [
      "Light passes through much of the neural retina before reaching the photoreceptor outer segments. Rods and cones change their chemical state when they absorb light. This alters transmitter release to bipolar cells. Ganglion cells receive processed input from retinal circuits, and their axons form the optic nerve.",
      "The retina does more than record a picture. Its circuits compare light across nearby regions and begin organizing contrast and change. The brain continues this processing with information from both eyes. Perception is therefore an active neural process, not a camera image that is simply turned upright."
    ],
    part3: {
      title: "Follow focus and neural information as two connected pathways",
      paragraphs: [
        "The optical pathway describes where light travels: cornea, aqueous humour, pupil, lens, vitreous humour, and retina. The neural pathway begins at rods and cones. It continues through retinal cells, the optic nerve, a partial crossing at the optic chiasm, relay regions, and visual areas of the cerebrum. Keeping the pathways separate prevents light from being confused with a nerve impulse.",
        "Accommodation changes lens shape. For a near object, ciliary muscle action reduces tension on the suspensory ligaments, and the elastic lens becomes rounder. A rounder lens bends light more. For a distant object, the lens becomes flatter and bends light less. The cornea still provides most refraction in both cases.",
        "The fovea supports the sharpest central vision because cones are densely packed there and their pathways preserve detail. The optic disc creates a blind spot because ganglion-cell axons leave the eye at that location and no rods or cones are present. The other eye and the brain's use of surrounding information usually make the gap hard to notice.",
        "A strong vision explanation states what is moving at each stage. Light is refracted through clear structures. Photoreceptors transduce light into a cellular response. Neural signals then travel through the optic nerve. The explanation should not say that light itself travels down a neuron."
      ],
      visuals: [{
        kind: "flow",
        id: "optical-neural-pathways",
        title: "Optical pathway becomes a neural pathway",
        steps: [
          { label: "Focus light", detail: "Cornea and lens bend light toward the retina" },
          { label: "Transduce", detail: "Rods and cones change their activity after absorbing light" },
          { label: "Process in retina", detail: "Bipolar and ganglion pathways organize the signal" },
          { label: "Carry information", detail: "Optic-nerve axons leave the eye and partly cross" },
          { label: "Build perception", detail: "Connected brain regions interpret visual information" }
        ],
        description: "Light travels to the retina. Neural information, not light, then travels toward the brain."
      }],
      wordLens: ["vision-pathway", "sensory-transduction"]
    }
  },
  "lesson-08": {
    part1: [
      "The <strong>pinna</strong> and auditory canal form the outer ear. They collect sound and guide pressure waves toward the tympanic membrane. The middle ear begins at this membrane. Its ossicles act as a linked lever system that transfers vibration from air to the fluid-filled inner ear.",
      "The stapes pushes on the oval window. This motion produces pressure waves in cochlear fluid. Different regions of the basilar membrane respond most strongly to different sound frequencies. The round window moves in the opposite direction and provides space for the nearly incompressible fluid to shift."
    ],
    part2: [
      "In a semicircular canal, the sensory structure sits in an enlarged region near the canal's base. When the head begins to rotate, fluid lags behind and bends a gelatinous cupula. Hair cells inside it bend, changing the firing of vestibular sensory neurons. Opposite directions produce different firing patterns.",
      "The <strong>vestibule</strong> is the central inner-ear region between the cochlea and semicircular canals. It contains the utricle and saccule. These organs have weighted sensory layers, where tiny calcium-carbonate crystals add inertia. Gravity or linear acceleration shifts the layer and bends hair cells. They report head tilt and straight-line motion, while the semicircular canals report rotation."
    ],
    part3: {
      title: "Read hearing evidence without turning it into a diagnosis",
      paragraphs: [
        "Pitch is linked mainly with sound frequency, while loudness is linked with wave amplitude and neural recruitment. In the cochlea, high frequencies produce the strongest movement nearer the base. Lower frequencies peak farther toward the cochlear tip. Hair cells at different places therefore contribute information about pitch.",
        "An audiogram plots the quietest level detected at different frequencies. A classroom graph can be used to practise reading axes and patterns. It is not a hearing test unless calibrated equipment, controlled procedures, and a qualified professional are involved. Browser tones and personal headphones vary too much for diagnosis.",
        "To read the synthetic table, first compare values across frequency within one ear. Then compare the two ears at the same frequency. A higher course value means a louder sound was needed in that model. It does not state why the pattern occurred, so any cause would require more evidence.",
        "Balance evidence also needs care. Dizziness can have many causes. A short movement activity cannot locate a damaged structure. In course cases, state which sensory input changed, how the CNS might compare vestibular, visual, and proprioceptive signals, and what further evidence would be needed.",
        "The Eustachian tube has a supporting role. It helps equalize air pressure on the two sides of the tympanic membrane. It does not carry sound to the auditory nerve. Separating supporting structures from the transduction pathway makes a hearing explanation more precise."
      ],
      visuals: [{
        kind: "table",
        id: "synthetic-audiogram-pattern",
        title: "Synthetic sound-detection pattern",
        columns: ["Frequency", "Left-ear course value", "Right-ear course value", "Careful observation"],
        rows: [["500 Hz", "10 dB", "10 dB", "Similar low-frequency values"], ["2000 Hz", "15 dB", "20 dB", "Small difference"], ["8000 Hz", "35 dB", "20 dB", "Higher left-ear value in this data set"]],
        description: "The values provide graph-reading practice only. They are synthetic and cannot diagnose hearing loss."
      }],
      wordLens: ["hearing-equilibrium-pathway", "scientific-explanation"]
    }
  },
  "lesson-09": {
    part1: [
      "A <strong>set point</strong> is a useful model for a target value, but many body conditions are regulated across a range. The target can also shift. Body temperature, for example, changes with time of day and can be reset during fever. This moving balance is called <strong>dynamic stability</strong>: homeostasis is a process of adjustment, not a claim that every value is constant.",
      "A stimulus-response chain is not automatically negative feedback. The response must feed back to the regulated variable and oppose the original change. Sweating after body temperature rises fits this pattern because evaporation increases heat loss. A pupil constricting in bright light is a response, but the regulated variable and feedback claim must still be identified carefully."
    ],
    part2: [
      "An endocrine <strong>gland</strong> releases a hormone into body fluid, usually blood. The hormone is the signal, not the gland itself. Transport carries the signal around the body. Receptor binding happens only at compatible target cells, and the target response follows. These four steps should not be collapsed into one arrow.",
      "Water-soluble hormones usually bind to receptors at the cell membrane and start an internal signalling pathway. Lipid-soluble hormones can cross the membrane and bind receptors inside the cell. Both require compatible receptors. Neither type causes every tissue to respond in the same way."
    ],
    part3: {
      title: "Speed and duration depend on the pathway, not just the system name",
      paragraphs: [
        "Neural signals can reach a connected target within milliseconds because action potentials travel along a defined pathway. Neurotransmitters then cross a short synaptic gap. Hormones must be released, transported, bind receptors, and change target-cell activity. This often creates a slower start and a longer effect, but the exact timing varies.",
        "The systems frequently work together. During dehydration, osmoreceptors in the hypothalamus detect that body fluids have become more concentrated. These are sensory cells sensitive to fluid concentration. Antidiuretic hormone, or ADH, then carries a signal to the kidneys that helps conserve water. Lesson 11 follows the full pathway. During an alarm, sympathetic neurons act quickly and the adrenal medulla releases epinephrine into blood. The body does not choose only one control system.",
        "To compare pathways, use five questions: What changed? What detects it? What signal travels? Which target can respond? How does the response affect the original variable? This frame exposes missing links and prevents a hormone name from standing in for a full mechanism.",
        "In a feedback graph, time belongs on the horizontal axis. The disturbed variable changes first. The response begins after detection and processing. If the loop is negative feedback, the variable then moves back toward its workable range. A delay or small overshoot does not make the system positive feedback."
      ],
      visuals: [{
        kind: "table",
        id: "control-pathway-reasoning-frame",
        title: "Build a complete control explanation",
        columns: ["Question", "Neural example", "Endocrine example"],
        rows: [
          ["What changed?", "Skin pressure", "Blood glucose"],
          ["What detects it?", "Mechanoreceptor", "Pancreatic islet cells"],
          ["What signal travels?", "Action potentials and neurotransmitter", "Hormone in blood"],
          ["What target responds?", "Connected neuron or muscle", "Receptor-bearing tissue"],
          ["What is the return effect?", "Movement changes the situation", "Glucose moves toward its range"]
        ],
        description: "Both systems need a detected change, a signal, a responsive target, and an effect. Negative feedback additionally requires a return effect that opposes the disturbance."
      }],
      wordLens: ["control-system-roles", "endocrine-signalling", "negative-feedback"]
    }
  },
  "lesson-10": {
    part1: [
      "Hypothalamic neurons receive information about the nervous system and internal conditions. Some release hormones into the portal vessels between the hypothalamus and anterior pituitary. Because this blood route is short, a small amount of releasing hormone can reach anterior-pituitary target cells before being diluted through the whole circulation.",
      "Anterior-pituitary cells make the hormones they release. Posterior-pituitary nerve endings do not make ADH. They store and release ADH made in hypothalamic neurons. This source-and-release distinction is central to the next lesson and prevents the posterior pituitary from being treated like a second glandular lobe."
    ],
    part2: [
      "Growth requires more than hGH. Nutrition, thyroid hormones, sex hormones, genetics, health, and growth-plate state also matter. hGH should therefore be described as one important signal in a larger system. It does not directly make every body part grow at the same rate.",
      "Hormone imbalance patterns depend on age and timing. Too much hGH before growth plates close can increase long-bone length. Excess after closure cannot lengthen those bones in the same way, but it can enlarge some bones and soft tissues. These course patterns explain physiology and are not a basis for judging or diagnosing a person."
    ],
    part3: {
      title: "Source–target–effect tables keep pituitary pathways separate",
      paragraphs: [
        "TSH and ACTH are tropic hormones because their main targets are endocrine glands. TSH binds to thyroid cells and supports thyroxine release. ACTH binds to cells of the adrenal cortex and supports cortisol release. The target-gland hormones then act on other tissues and also provide feedback to the hypothalamus and pituitary.",
        "hGH is different. It has direct effects on several tissues and indirect effects through growth factors, including factors released by the liver. Calling every anterior-pituitary hormone tropic would therefore be inaccurate. The useful question is whether the hormone's main target is another endocrine gland.",
        "A hormone table should be read across one row. Start with the source, follow the hormone to its target, and name the effect. Then ask what signal reduces further release. Reading down one column can compare sources or targets, but it does not by itself explain the pathway.",
        "A source–target–effect answer should also keep a hormone separate from the response it causes. TSH is the signal, the thyroid is the target gland, and increased thyroxine release is the response. Naming each role makes it easier to find the step that changed in a data case.",
        "Pilot 2 focuses on the pituitary hormones required for Unit A. Other pituitary hormones are important in human biology, but reproductive control belongs to another unit. Keeping them out of required questions gives more time to understand hGH, TSH, ACTH, and ADH well."
      ],
      visuals: [{
        kind: "table",
        id: "pituitary-pathway-comparison",
        title: "Compare four Unit A pituitary pathways",
        columns: ["Hormone", "Made by", "Released from", "Main target or role"],
        rows: [
          ["hGH", "Anterior pituitary", "Anterior pituitary", "Many tissues; direct and growth-factor effects"],
          ["TSH", "Anterior pituitary", "Anterior pituitary", "Thyroid gland"],
          ["ACTH", "Anterior pituitary", "Anterior pituitary", "Adrenal cortex"],
          ["ADH", "Hypothalamic neurons", "Posterior pituitary", "Kidney collecting ducts"]
        ],
        description: "The posterior pituitary releases ADH made in the hypothalamus. The anterior pituitary makes and releases hGH, TSH, and ACTH."
      }],
      wordLens: ["hypothalamus-pituitary-axis", "endocrine-signalling"]
    }
  },
  "lesson-12": {
    part1: [
      "Thyroid cells need <strong>iodine</strong> to build thyroid hormones. The gland takes iodide from blood and adds it to a large protein before releasing active hormone. Too little iodine can reduce hormone production. In a feedback pathway, low thyroxine removes some inhibition of the hypothalamus and pituitary, so TSH may rise.",
      "Metabolism includes all chemical reactions, not only digestion or body mass. Thyroxine can increase oxygen use and heat production in many target tissues. It also supports normal growth and nervous-system development. The effect depends on hormone level, age, tissue receptors, and other conditions."
    ],
    part2: [
      "PTH also reduces calcium loss in urine and supports activation of vitamin D in the kidneys. Active vitamin D increases calcium absorption from the intestine. The intestine is therefore part of the response even though PTH does not simply carry calcium from food into blood by itself.",
      "Calcitonin can oppose some actions that raise blood calcium, especially by reducing bone breakdown. Its day-to-day role in adult humans is smaller than a perfectly balanced two-hormone diagram suggests. For Unit A, use it to compare direction while recognizing that PTH is the stronger regulator of a fall in calcium."
    ],
    part3: {
      title: "Use hormone pairs and graphs to locate a changed step",
      paragraphs: [
        "A low target-gland hormone does not identify the changed structure by itself. If thyroxine is low and TSH is high, the pituitary is sending a strong signal while thyroid output remains low. If both thyroxine and TSH are low, reduced hypothalamic or pituitary stimulation becomes another possible explanation.",
        "Graph timing also matters. After TSH rises, thyroxine should not appear before the stimulation. Thyroxine then feeds back and TSH can fall. A graph with no delay is a simplified model. A good interpretation still identifies which line is the tropic signal, which is the target-gland hormone, and which direction shows feedback.",
        "Calcium data require the same care. A fall in blood calcium should be followed by increased PTH activity and responses in bone, kidney, and intestine. As blood calcium rises, the stimulus for PTH release becomes smaller. Naming the return effect completes the negative-feedback explanation.",
        "The thyroid and parathyroid glands are close together, but their major Unit A roles differ. Thyroid hormones support metabolic regulation, while parathyroid hormone is central to calcium regulation. Location alone does not make their hormones part of one feedback loop.",
        "Course disorder cases use respectful current language and synthetic evidence. Symptoms can overlap across many conditions. The goal is to explain a hormone pattern, not diagnose a person. State what the data support, what they do not prove, and which additional measurement would help."
      ],
      visuals: [{
        kind: "table",
        id: "thyroid-calcium-evidence-frame",
        title: "Locate the pathway change",
        columns: ["Evidence pattern", "Supported explanation", "What remains uncertain"],
        rows: [
          ["Low thyroxine, high TSH", "Strong pituitary signal with low thyroid output", "Cause of reduced thyroid output"],
          ["Low thyroxine, low TSH", "Reduced central stimulation may be involved", "Hypothalamic versus pituitary step"],
          ["Low calcium, high PTH", "Parathyroid response is present", "Whether bone, kidney, and intestine respond normally"]
        ],
        description: "Paired values can locate a possible pathway level. They do not establish a diagnosis or a single cause."
      }],
      wordLens: ["thyroid-calcium-feedback", "scientific-explanation"]
    }
  }
};

for (const [lessonId, expansion] of Object.entries(GATE_B_LESSON_EXPANSIONS)) {
  const lesson = FULL_LESSON_CONTENT[lessonId];
  if (!lesson) throw new Error(`Gate B expansion references unknown lesson content: ${lessonId}`);
  lesson.part1.paragraphs.push(...expansion.part1);
  lesson.part2.paragraphs.push(...expansion.part2);
  lesson.part3 = expansion.part3;
}

export const REMAINING_GUIDED_ITEMS: PracticeItem[] = [
  ...practiceItems("lesson-02-guided", "chapter-11", [
    ["On the membrane-voltage graph, the line rises steeply from threshold toward its peak. Which event best explains that phase?", ["Sodium moves into the axon through voltage-gated channels", "Potassium moves into the axon through leak channels", "The sodium-potassium pump reverses", "Proteins leave the nucleus"], 0, "Voltage-gated sodium channels open at threshold. Rapid sodium entry drives the steep depolarizing rise.", 375],
    ["How can a stronger stimulus be represented if action potentials are all-or-none?", ["Each action potential becomes taller", "Firing frequency and neuron recruitment can increase", "The resting voltage becomes permanently positive", "The synaptic cleft disappears"], 1, "Stronger stimuli can increase firing frequency and recruit more neurons while each action potential remains all-or-none.", 377]
  ], { lessonId: "lesson-02" }),
  ...practiceItems("lesson-04-guided", "chapter-11", [
    ["Which route carries a command from the spinal cord to skeletal muscle?", ["A sensory afferent pathway", "A somatic motor pathway", "An endocrine pathway", "A parasympathetic sensory gland"], 1, "Somatic motor neurons carry commands from the CNS to skeletal-muscle effectors.", 396],
    ["Which statement about autonomic divisions is most accurate?", ["Sympathetic input excites every organ", "Parasympathetic input inhibits every organ", "Their effects depend on the organ and receptors", "Both divisions control only skeletal muscle"], 2, "Autonomic effects are organ-specific and often coordinated in opposing directions.", 398]
  ], { lessonId: "lesson-04" }),
  ...practiceItems("lesson-05-guided", "chapter-11", [
    ["Which brain region is most directly linked with coordination of movement and balance?", ["Cerebellum", "Occipital cortex", "Thyroid", "Dorsal root"], 0, "The cerebellum helps coordinate timing, posture, and balance.", 392],
    ["Why should a symptom-location answer include a limitation?", ["Brain regions have no known functions", "One symptom can involve several connected pathways", "Symptoms always come from muscles", "Only hormones affect behaviour"], 1, "Complex functions use connected networks, so one symptom rarely proves one location or diagnosis.", 390]
  ], { lessonId: "lesson-05" }),
  ...practiceItems("lesson-06-guided", "chapter-12", [
    ["What is sensory transduction?", ["Storage of a hormone in blood", "Conversion of stimulus energy into an electrical receptor change", "Movement of a motor neuron into the CNS", "A loss of every sensory response"], 1, "Transduction converts stimulus energy into an electrical change that can begin neural signalling.", 407],
    ["What does sensory adaptation show?", ["The stimulus must have disappeared", "Response can decrease during a steady stimulus", "All receptors detect the same energy", "A diagnosis has been made"], 1, "Some receptor pathways respond strongly to change and less during a sustained stimulus.", 409]
  ], { lessonId: "lesson-06" }),
  ...practiceItems("lesson-07-guided", "chapter-12", [
    ["Which sequence correctly traces light through the front of the eye?", ["Retina → lens → cornea", "Cornea → pupil → lens → retina", "Optic nerve → pupil → retina", "Iris → optic nerve → cornea"], 1, "Light passes through the cornea and pupil, is focused by the lens, and reaches the retina.", 412],
    ["Which photoreceptor comparison is correct?", ["Rods support colour and highest detail in the fovea", "Cones work only in complete darkness", "Rods are more sensitive in dim light; cones support colour and detail", "Rods form the optic nerve without other cells"], 2, "Rods are sensitive in dim light, while cones support colour and high detail.", 415]
  ], { lessonId: "lesson-07" }),
  ...practiceItems("lesson-08-guided", "chapter-12", [
    ["Where does hearing transduction occur?", ["In hair cells of the organ of Corti", "In the Eustachian tube", "In the tympanic membrane alone", "In the iris"], 0, "Cochlear hair cells convert mechanical movement into changes in neural signalling.", 421],
    ["Which structure detects rotational head movement?", ["Cochlea only", "Semicircular canals", "Ossicles", "Cornea"], 1, "Semicircular canals are oriented in different planes and detect rotational movement.", 424]
  ], { lessonId: "lesson-08" }),
  ...practiceItems("lesson-09-guided", "chapter-13", [
    ["What makes a response negative feedback?", ["It feels unpleasant", "It reduces the original disturbance", "It always uses a neuron", "It stops every change"], 1, "Negative feedback is defined by a response that opposes the original change in a regulated variable.", 438],
    ["Why do only some cells respond to a circulating hormone?", ["Only target cells have compatible receptors", "Hormones cannot travel in blood", "Every hormone stays inside its gland", "Only neurons use receptors"], 0, "A hormone can circulate widely, but receptor-bearing target cells produce the relevant response.", 441]
  ], { lessonId: "lesson-09" }),
  ...practiceItems("lesson-10-guided", "chapter-13", [
    ["Which hormone is tropic?", ["TSH, because it targets the thyroid gland", "hGH, because it is stored in bone", "ADH, because it is made by the kidney", "Insulin, because it travels in a neuron"], 0, "TSH is tropic because its main target is another endocrine gland.", 445],
    ["Which statement about the posterior pituitary is correct?", ["It makes insulin", "It stores and releases hormones made in the hypothalamus", "It controls every endocrine gland", "It is part of the thyroid"], 1, "Hypothalamic neurons make ADH, and the posterior pituitary stores and releases it.", 444]
  ], { lessonId: "lesson-10" }),
  ...practiceItems("lesson-11-guided", "chapter-13", [
    ["What urine pattern is expected when ADH activity is high during dehydration?", ["Large volume and dilute", "Small volume and concentrated", "No water reabsorption", "High glucose in every sample"], 1, "ADH increases kidney water reabsorption, producing a smaller volume of more concentrated urine.", 446],
    ["Where is ADH made?", ["Pancreatic alpha cells", "Hypothalamic neurons", "Thyroid follicles", "Adrenal medulla"], 1, "ADH is made in the hypothalamus and released from the posterior pituitary.", 446]
  ], { lessonId: "lesson-11" }),
  ...practiceItems("lesson-12-guided", "chapter-13", [
    ["A synthetic sample has low thyroxine and high TSH. Which idea is best supported?", ["The pituitary is providing strong stimulation while thyroid output remains low", "The thyroid is producing too much thyroxine", "PTH has stopped all kidney activity", "Insulin is the tropic signal"], 0, "Low feedback can allow TSH to rise while reduced thyroid output keeps thyroxine low.", 449],
    ["Which response follows a fall in blood calcium?", ["PTH falls and calcium storage always rises", "PTH rises and effectors increase calcium in blood", "TSH directly releases calcium from blood", "Calcitonin becomes the only pituitary hormone"], 1, "PTH rises and coordinates bone, kidney, and intestinal effects that raise blood calcium.", 450]
  ], { lessonId: "lesson-12" })
];

export const CHAPTER_12_ITEMS = practiceItems("chapter-12-practice", "chapter-12", [
  ["Which receptor class responds to light?", ["Photoreceptor", "Chemoreceptor", "Thermoreceptor", "Nociceptor"], 0, "Photoreceptors transduce light energy.", 407],
  ["Which receptor class includes many touch and hearing receptors?", ["Mechanoreceptor", "Photoreceptor", "Osmoreceptor only", "Endocrine receptor"], 0, "Mechanoreceptors respond to force, stretch, vibration, or movement.", 407],
  ["What is transduction?", ["A stimulus-energy conversion at a receptor", "A hormone stored in a gland", "A motor command only", "The disappearance of a stimulus"], 0, "Transduction changes stimulus energy into an electrical receptor response.", 408],
  ["Why might clothing become less noticeable after several minutes?", ["Sensory adaptation", "The clothing loses mass", "The CNS becomes endocrine tissue", "All receptors stop permanently"], 0, "Some touch pathways reduce their response during a steady stimulus.", 409],
  ["Which sequence traces light correctly?", ["Cornea → pupil → lens → retina", "Retina → cornea → lens", "Lens → optic nerve → pupil", "Iris → retina → cornea"], 0, "Light crosses the cornea and pupil, is focused by the lens, and reaches the retina.", 412],
  ["What is the iris's main role in the light path?", ["Change pupil diameter", "Make action potentials in the optic nerve", "Detect head rotation", "Equalize middle-ear pressure"], 0, "The iris changes pupil diameter and therefore light entry.", 413],
  ["Which statement best describes rods?", ["They are sensitive in dim light", "They provide the sharpest colour vision in the fovea", "They form the lens", "They detect sound"], 0, "Rods are highly sensitive in dim light but provide lower detail and no colour discrimination.", 415],
  ["What creates the blind spot?", ["The optic disc has no photoreceptors", "The pupil closes permanently", "The lens blocks all light", "The cornea has no nerves"], 0, "Ganglion-cell axons leave at the optic disc, where rods and cones are absent.", 416],
  ["Which sequence traces sound into the inner ear?", ["Canal → tympanic membrane → ossicles → oval window", "Cochlea → iris → ossicles", "Pupil → tympanic membrane → retina", "Semicircular canal → cornea → nerve"], 0, "Sound vibrates the tympanic membrane, and ossicles transfer the movement to the oval window.", 420],
  ["What do cochlear hair cells do?", ["Transduce mechanical movement", "Release thyroxine", "Focus light", "Move sodium through kidney ducts"], 0, "Hair-cell bending changes electrical activity and transmitter release.", 421],
  ["What do semicircular canals mainly detect?", ["Rotational head movement", "Blood glucose", "Colour", "Air pressure in the middle ear"], 0, "Fluid movement in the canals signals rotation.", 424],
  ["Why does balance usually use more than the vestibular apparatus?", ["The CNS also combines vision and proprioception", "Only hormones control posture", "The cochlea detects every body movement", "Balance does not use neural signals"], 0, "The brain combines vestibular, visual, and proprioceptive information.", 425]
]);

export const CHAPTER_13_ITEMS = practiceItems("chapter-13-practice", "chapter-13", [
  ["Which description best fits homeostasis?", ["Dynamic regulation within workable ranges", "A body condition that never changes", "Only a nervous-system response", "Only an endocrine disorder"], 0, "Homeostasis is active regulation, not a perfectly fixed internal state.", 437],
  ["Which sequence is a negative-feedback loop?", ["Temperature rises → heat loss rises → temperature falls", "Temperature rises → heat gain rises → temperature rises", "Hormone is released → no target responds", "A receptor detects nothing"], 0, "The heat-loss response opposes the original temperature rise.", 438],
  ["What determines whether a cell responds to a hormone?", ["A compatible receptor", "Distance from every gland only", "The cell's colour", "Whether it is a neuron"], 0, "Only receptor-bearing target cells make the relevant response.", 441],
  ["Which structure links neural information with pituitary control?", ["Hypothalamus", "Cochlea", "Cornea", "Spinal nerve"], 0, "The hypothalamus controls pituitary pathways and integrates internal information.", 443],
  ["What makes TSH a tropic hormone?", ["It targets another endocrine gland", "It is released by the thyroid", "It acts only on bone", "It carries action potentials"], 0, "TSH targets the thyroid and stimulates thyroxine release.", 445],
  ["Which is an expected hGH effect?", ["Support growth and protein synthesis", "Directly detect light", "Break down acetylcholine", "Equalize ear pressure"], 0, "hGH has direct and growth-factor-mediated effects on growth and metabolism.", 445],
  ["Which ADH pattern fits dehydration?", ["Higher ADH and more water reabsorption", "Lower ADH and no thirst", "Higher insulin and more sound transduction", "Lower PTH and pupil dilation"], 0, "Dehydration raises blood concentration, supporting ADH release and water conservation.", 446],
  ["High TSH with low thyroxine most strongly supports which idea?", ["Strong pituitary stimulation with low thyroid output", "Excessive thyroxine feedback", "High insulin release", "Low blood calcium only"], 0, "Paired values suggest the thyroid is not producing enough hormone despite TSH stimulation.", 449],
  ["What is the main direction of PTH action?", ["Raise blood calcium", "Lower blood glucose", "Raise sound frequency", "Lower every hormone"], 0, "PTH coordinates bone, kidney, and intestinal effects that raise blood calcium.", 450],
  ["What follows rising blood glucose after a meal?", ["Beta cells release insulin", "Alpha cells release more glucagon only", "Posterior pituitary releases insulin", "Adrenal medulla releases PTH"], 0, "Pancreatic beta cells respond to rising glucose by releasing insulin.", 456],
  ["Which adrenal region releases epinephrine?", ["Medulla", "Cortex", "Parathyroid", "Anterior pituitary"], 0, "The adrenal medulla supports rapid sympathetic responses through epinephrine and norepinephrine.", 453],
  ["Which hormone increases kidney sodium reabsorption?", ["Aldosterone", "Acetylcholine", "Calcitonin", "hGH only"], 0, "Aldosterone from the adrenal cortex increases sodium reabsorption; water tends to follow.", 454]
]);

export const FINAL_CORE_ITEMS = practiceItems("final-practice-core", "chapter-13", [
  ["A toxin slows signal conduction without changing action-potential size. Which structure is the most direct focus?", ["Myelin sheath", "Pancreatic islet", "Lens", "Thyroid"], 0, "Myelin limits current loss and increases conduction speed without making each action potential larger.", 371],
  ["A neuron reaches threshold more often during a stronger stimulus. What changes?", ["Firing frequency", "The all-or-none size", "The axon identity", "The CNS becomes a gland"], 0, "Stronger stimuli can increase firing frequency while individual action potentials remain all-or-none.", 377],
  ["A substance blocks presynaptic calcium channels. What is the immediate synaptic effect?", ["Less neurotransmitter release", "More myelin production", "More ADH release", "The retina focuses light"], 0, "Presynaptic calcium entry triggers vesicle fusion, so blocking it reduces transmitter release.", 380],
  ["Which pathway carries a command to skeletal muscle?", ["Somatic motor", "Sensory afferent", "Endocrine only", "Parasympathetic receptor"], 0, "Somatic motor output travels from the CNS to skeletal muscle.", 396],
  ["A synthetic case shows poor coordination but normal muscle strength. Which inference is most careful?", ["Cerebellar pathways may be involved", "The cerebellum is certainly destroyed", "The thyroid controls all movement", "The case proves a diagnosis"], 0, "Coordination evidence can support cerebellar involvement, but it cannot prove a diagnosis.", 392],
  ["Which event occurs first in a withdrawal reflex?", ["A receptor detects the stimulus", "A motor neuron activates before any input", "The pituitary releases insulin", "The cortex diagnoses damage"], 0, "A receptor first detects the change, then sensory information enters the CNS.", 372],
  ["Pressure bends a receptor and opens ion channels. What process is shown?", ["Sensory transduction", "Negative feedback only", "Hormone transport", "Accommodation"], 0, "Mechanical energy is being converted into an electrical receptor change.", 408],
  ["Which structure fine-tunes the focus of light on the retina?", ["Lens", "Ossicles", "Semicircular canal", "Adrenal cortex"], 0, "The lens changes shape during accommodation to fine-tune focus.", 413],
  ["Which cells transduce sound-driven movement?", ["Hair cells in the organ of Corti", "Rods in the retina", "Pancreatic beta cells", "Schwann cells"], 0, "Cochlear hair cells convert basilar-membrane movement into neural signalling.", 421],
  ["What shows that sweating after a temperature rise is negative feedback?", ["Heat loss opposes the rise", "Sweating raises temperature", "The response has no effector", "The variable is the sweat"], 0, "Sweating increases heat loss, which opposes the original rise in body temperature.", 438],
  ["A hormone circulates past many cells. Which cells respond?", ["Cells with compatible receptors", "Every cell equally", "Only cells next to the gland", "Only sensory neurons"], 0, "Target response depends on compatible receptors.", 441],
  ["Which sequence correctly traces TSH control?", ["Anterior pituitary → TSH → thyroid → thyroxine", "Thyroid → TSH → cochlea", "Posterior pituitary → insulin → thyroid", "Pancreas → ADH → bone"], 0, "TSH from the anterior pituitary stimulates thyroid release of thyroxine.", 449],
  ["During dehydration, which pattern is expected?", ["Higher ADH and concentrated urine", "Lower ADH and concentrated urine", "Higher insulin and dilute urine", "Lower PTH and high sound sensitivity"], 0, "ADH increases kidney water reabsorption, reducing urine volume and increasing its concentration.", 446],
  ["Blood calcium falls. Which response opposes the change?", ["PTH rises", "Insulin rises", "Cholinesterase rises", "Rods release TSH"], 0, "PTH coordinates effects that raise blood calcium.", 450],
  ["Blood glucose rises after a meal. Which response follows?", ["Beta cells release insulin", "Alpha cells release glucagon as the main response", "Adrenal medulla releases calcitonin", "Pituitary releases insulin"], 0, "Insulin from beta cells supports uptake and storage in receptor-bearing targets.", 456],
  ["Which statement correctly compares adrenal regions?", ["Medulla supports rapid epinephrine responses; cortex releases cortisol and aldosterone", "Cortex releases insulin; medulla releases thyroxine", "Both release one identical hormone", "Neither responds during stress"], 0, "The medulla and cortex have different hormones, targets, and timing.", 453],
  ["Synthetic data show high blood concentration, high ADH, but a large volume of dilute urine. What is the best inference?", ["The kidney response to ADH may be reduced", "ADH has certainly stopped being released", "Insulin caused sound transduction", "The data prove a diagnosis"], 0, "High ADH with poor water conservation suggests a target-response problem, but more evidence is needed.", 446],
  ["During a stress case, heart rate rises quickly and cortisol stays elevated later. Which explanation fits?", ["Rapid neural-medulla and slower pituitary-cortex pathways overlap", "One action potential becomes permanently larger", "Only the pancreas detects stress", "Every target cell responds without receptors"], 0, "Fast sympathetic and adrenal-medulla effects can overlap with a slower ACTH-cortisol pathway.", 454]
]);

export const FINAL_CHALLENGE_ITEMS = practiceItems("final-practice-challenge", "chapter-13", [
  ["Two axons have the same diameter. Axon A is myelinated and Axon B is not. Which prediction and reason are strongest?", ["A conducts faster because current spreads farther between nodes", "B conducts faster because it loses more current", "A produces larger action potentials", "B needs no membrane channels"], 0, "Myelin reduces current loss and allows regeneration mainly at nodes, increasing conduction speed.", 371],
  ["A postsynaptic cell receives one excitatory and one inhibitory input at the same time. What determines whether it fires?", ["The combined membrane effect at the trigger region", "The colour of the neurotransmitter", "Whether the axon has a nucleus", "The posterior pituitary"], 0, "The neuron integrates inputs across time and location; the net change determines whether threshold is reached.", 382],
  ["A visual-field pattern changes after damage behind the optic chiasm. Why can both eyes contribute to the pattern?", ["Each hemisphere receives processed information from both eyes", "The lens sends hormones to both eyes", "Rods cross through the ear", "The pupil creates action potentials"], 0, "Partial crossing at the optic chiasm organizes visual fields from both eyes into each hemisphere.", 416],
  ["A synthetic sample has low TSH and low thyroxine. Which pathway level deserves investigation first?", ["Hypothalamic-pituitary stimulation", "Pancreatic insulin release only", "Cochlear hair cells", "Spinal motor roots"], 0, "Low TSH with low thyroxine can support reduced central stimulation rather than failure of a strongly stimulated thyroid.", 449],
  ["Why might aldosterone remain high even if ACTH is not high?", ["Kidney-linked pressure and ion signals strongly regulate aldosterone", "Aldosterone is a neurotransmitter", "The retina releases aldosterone", "ACTH never affects the adrenal cortex"], 0, "Aldosterone is regulated mainly through kidney-linked pressure and ion pathways, not only ACTH.", 454],
  ["A case shows rising glucose, rising insulin, and continued rising glucose. What additional evidence is most useful?", ["Target-tissue response and liver glucose output", "Pupil diameter only", "Sound frequency only", "Myelin colour"], 0, "The hormone value alone cannot show whether receptor-bearing targets respond or whether liver output is changing.", 456]
  ], { optional: true });

export const REVIEW_SEMINAR_SESSIONS = [
  {
    id: "nervous",
    title: "Session 1 · Nervous communication",
    prompt: "A myelinated sensory neuron reaches a chemical synapse, but transmitter release falls after calcium channels are blocked. Explain what still works, what changes, and why.",
    frame: ["Name the normal neural sequence.", "Locate the blocked step.", "Predict the immediate effect.", "State one piece of evidence that would support the prediction."],
    model: "The action potential can still travel along the myelinated axon. At the terminal, reduced calcium entry causes fewer vesicles to fuse, so less neurotransmitter enters the cleft and the postsynaptic response becomes smaller."
  },
  {
    id: "sensory",
    title: "Session 2 · Sensory evidence",
    prompt: "A learner detects two points more accurately on a fingertip than on a forearm, then reports that a steady touch becomes less noticeable. Explain both patterns without making a diagnosis.",
    frame: ["Name the receptor class.", "Use receptive fields or receptor density for spatial detail.", "Use adaptation for the steady stimulus.", "State a procedure or evidence limit."],
    model: "Touch mechanoreceptors transduce pressure. Fingertips often have denser pathways and smaller receptive fields, supporting finer spatial detail. Adaptation reduces response to steady pressure. Results also depend on procedure and cannot diagnose sensory function."
  },
  {
    id: "endocrine",
    title: "Session 3 · Endocrine integration",
    prompt: "After dehydration and a stressful event, synthetic data show high ADH, concentrated urine, rapid epinephrine, and later cortisol. Build one explanation that separates each source, target, effect, and time scale.",
    frame: ["Explain ADH and kidney water conservation.", "Explain the rapid adrenal-medulla response.", "Explain the slower ACTH-cortisol pathway.", "Show how each response supports homeostasis."],
    model: "ADH made in the hypothalamus and released from the posterior pituitary raises kidney water reabsorption. Sympathetic input rapidly stimulates adrenal-medulla epinephrine. A slower hypothalamus-pituitary pathway raises ACTH and adrenal-cortex cortisol. The pathways overlap but have different signals, targets, and timing."
  }
] as const;
