export type ModelGraphSeries = {
  label: string;
  values: number[];
  symbol: "circle" | "square" | "triangle";
  color: string;
};

export type ModelGraph = {
  title: string;
  description: string;
  xLabel: string;
  yLabel: string;
  xValues: string[];
  yMin: number;
  yMax: number;
  yTicks: number[];
  invertY?: boolean;
  series: ModelGraphSeries[];
  highlightIndices?: number[];
  note: string;
};

export type ModelLabChoice = {
  id: string;
  label: string;
  resultTitle: string;
  observation: string;
  reasoning: string;
  affectedStep: 1 | 2 | 3 | 4;
  evidence: Array<{ label: string; value: string }>;
  path?: string[];
  graph?: ModelGraph;
  nextQuestion: string;
};

export type ModelLabRecord = {
  id: string;
  lessonId: string;
  lessonLabel: string;
  chapter: 11 | 12 | 13;
  title: string;
  investigationQuestion: string;
  learningPurpose: string;
  testVariable: string;
  comparisonControl: string;
  evidenceFocus: string;
  predictionPrompt: string;
  explanationPrompt: string;
  prompt: string;
  kind: "pathway-builder" | "case-explorer" | "graph-explorer" | "data-lab";
  pilot1SourceInteractionIds: string[];
  reasoningAction: string;
  staticEquivalent: string;
  steps: Array<{ label: string; detail: string }>;
  choices: ModelLabChoice[];
};

type ModelLabGuidance = Pick<ModelLabRecord,
  | "investigationQuestion"
  | "learningPurpose"
  | "testVariable"
  | "comparisonControl"
  | "evidenceFocus"
  | "predictionPrompt"
  | "explanationPrompt"
>;

const MODEL_LAB_GUIDANCE = {
  myelin: {
    investigationQuestion: "How does an axon's covering change where a signal is regenerated and how reliably it travels?",
    learningPurpose: "Use structure-and-function evidence to explain why myelin usually speeds conduction without making an action potential larger.",
    testVariable: "Change the axon condition: unmyelinated, normally myelinated, or damaged myelin.",
    comparisonControl: "Keep the starting action potential and its direction of travel the same.",
    evidenceFocus: "Inspect regeneration sites, current loss between sites, and whether the signal reaches the next region.",
    predictionPrompt: "Predict where the action potential will be regenerated and whether conduction will be faster, slower, or interrupted.",
    explanationPrompt: "Use one observation from the model to explain how the axon covering changed signal speed or reliability."
  },
  "action-potential": {
    investigationQuestion: "How do ion-channel changes produce each part of an action-potential graph?",
    learningPurpose: "Connect membrane voltage and graph direction to the channels that are open and the ions that move.",
    testVariable: "Change the phase of one action potential that you inspect.",
    comparisonControl: "Keep the same neuron model, voltage scale, and complete action-potential event.",
    evidenceFocus: "Inspect approximate voltage, graph direction, channel state, ion movement, and refractory behaviour.",
    predictionPrompt: "Predict whether voltage will rise, fall, undershoot, or remain near rest during the phase you select, and name the main ion movement.",
    explanationPrompt: "Use the graph and channel evidence to explain why membrane voltage moved in that direction."
  },
  synapse: {
    investigationQuestion: "How does changing one synaptic step alter the postsynaptic response?",
    learningPurpose: "Trace a signal across a chemical synapse and locate whether a disruption changes release, receptor binding, or signal termination.",
    testVariable: "Change one step: calcium entry, postsynaptic receptor access, or acetylcholine breakdown.",
    comparisonControl: "Keep the arriving impulse and the basic presynaptic-to-postsynaptic pathway the same.",
    evidenceFocus: "Inspect transmitter release, receptor activation, response strength, and response duration.",
    predictionPrompt: "Predict whether the postsynaptic response will become weaker, last longer, or remain near normal, and identify the affected step.",
    explanationPrompt: "Use evidence from the pathway to explain how the changed step produced the postsynaptic result."
  },
  "nervous-system": {
    investigationQuestion: "How do signal direction and effector type determine a nervous-system pathway?",
    learningPurpose: "Classify afferent and efferent routes, then distinguish somatic from autonomic motor output.",
    testVariable: "Change the body response or effector that receives the motor output.",
    comparisonControl: "Keep the receptor-to-CNS-to-effector organization of the pathway.",
    evidenceFocus: "Inspect signal direction, the CNS integration point, effector type, and motor division.",
    predictionPrompt: "Predict the afferent and efferent route and whether the final motor pathway is somatic or autonomic.",
    explanationPrompt: "Use direction and effector evidence to justify the pathway classification."
  },
  brain: {
    investigationQuestion: "What can a change in function suggest about a brain network, and what can it not prove?",
    learningPurpose: "Connect synthetic functional evidence to a likely starting region while avoiding unsupported diagnosis or one-region-only claims.",
    testVariable: "Change the observed function in the synthetic case.",
    comparisonControl: "Keep the evidence non-diagnostic and consider connected brain regions in every case.",
    evidenceFocus: "Inspect the changed function, likely starting region, connected structures, and limits of the evidence.",
    predictionPrompt: "Predict which brain region is the strongest starting point and name one connected region that may also contribute.",
    explanationPrompt: "Use the case evidence to support a likely region, then state one conclusion the evidence cannot establish."
  },
  sensory: {
    investigationQuestion: "What does sensory evidence show when stimulus duration, receptor density, or procedure quality changes?",
    learningPurpose: "Separate the stimulus from the receptor or behavioural response and judge whether the evidence supports adaptation or a fair comparison.",
    testVariable: "Change the sensory pattern, body location, or investigation procedure.",
    comparisonControl: "Keep the stated stimulus and comparison conditions visible so they are not confused with the response.",
    evidenceFocus: "Inspect response change over time, receptor-density patterns, variables, and limits in the procedure.",
    predictionPrompt: "Predict the response pattern you expect and identify the evidence that would support it.",
    explanationPrompt: "Use the graph, comparison, or procedure evidence to explain the pattern and one limitation."
  },
  eye: {
    investigationQuestion: "Where do focusing, transduction, neural signalling, and perception occur along the light-to-vision pathway?",
    learningPurpose: "Separate the eye's optical work from retinal transduction and later neural interpretation.",
    testVariable: "Change the location in the light-to-vision pathway that you inspect.",
    comparisonControl: "Keep the same ordered route from incoming light to visual processing.",
    evidenceFocus: "Inspect what enters or leaves each location and whether its role is optical, sensory, neural, or perceptual.",
    predictionPrompt: "Predict the selected location's role and what would change if that step could not work normally.",
    explanationPrompt: "Use pathway evidence to explain the location's role without saying that the brain simply flips an image."
  },
  hearing: {
    investigationQuestion: "How can sound-threshold and pathway evidence be interpreted without turning classroom data into a diagnosis?",
    learningPurpose: "Connect mechanical vibration to hair-cell transduction and distinguish hearing evidence from equilibrium evidence.",
    testVariable: "Change the supplied threshold pattern or the hearing/equilibrium pathway under inspection.",
    comparisonControl: "Keep the data synthetic and use the same non-diagnostic interpretation rule.",
    evidenceFocus: "Inspect frequency thresholds, pathway order, hair-cell input, and the limits of the evidence.",
    predictionPrompt: "Predict the pattern or pathway result you expect and identify the evidence you will compare.",
    explanationPrompt: "Use the supplied data or pathway to explain the result, then state why it is not a diagnosis."
  },
  homeostasis: {
    investigationQuestion: "Does a control-system response oppose the original disturbance and move a variable toward its workable range?",
    learningPurpose: "Identify receptor, control centre, and effector roles, then test whether a loop is truly negative feedback.",
    testVariable: "Change the disturbance or the missing, reversed, or functioning step in the loop.",
    comparisonControl: "Keep the regulated variable and its workable range explicit.",
    evidenceFocus: "Inspect the direction of the disturbance, the response, and the return effect on the variable.",
    predictionPrompt: "Predict the response and state whether it should raise or lower the regulated variable.",
    explanationPrompt: "Use direction-of-change evidence to explain whether the response opposes the disturbance."
  },
  pituitary: {
    investigationQuestion: "How do anterior- and posterior-pituitary pathways differ in source, release site, target, and feedback?",
    learningPurpose: "Trace a hormone route accurately and avoid treating the pituitary as an independent master controller.",
    testVariable: "Change the hormone pathway that you trace.",
    comparisonControl: "Keep source, release site, target, effect, and feedback as the five comparison points.",
    evidenceFocus: "Inspect whether the pathway uses hypothalamic releasing hormones, anterior-pituitary secretion, or posterior-pituitary release.",
    predictionPrompt: "Predict the source, release site, and target for the pathway you select.",
    explanationPrompt: "Use the route evidence to explain how hypothalamus and pituitary work together in this pathway."
  },
  adh: {
    investigationQuestion: "How do blood concentration, ADH action, and urine volume change together during water-balance feedback?",
    learningPurpose: "Read direction and timing in supplied data, then connect the graph to ADH source, release, kidney target, and effect.",
    testVariable: "Change the water-balance condition: dehydration, reduced ADH action, or recovery.",
    comparisonControl: "Keep the same normalized baseline and observation times.",
    evidenceFocus: "Inspect blood concentration, ADH signal or action, urine volume, and whether values move toward baseline.",
    predictionPrompt: "Predict the direction of blood concentration, ADH action, and urine volume for the selected condition.",
    explanationPrompt: "Use at least two plotted variables to explain the feedback response or mismatch."
  },
  "thyroid-calcium": {
    investigationQuestion: "Do thyroid and calcium hormone patterns show an expected feedback response or a possible pathway mismatch?",
    learningPurpose: "Use paired hormone and target evidence to distinguish TSH-thyroxine control from PTH-calcitonin calcium control.",
    testVariable: "Change the regulated variable or hormone pattern in the synthetic case.",
    comparisonControl: "Keep source, target, response direction, and feedback limit visible.",
    evidenceFocus: "Inspect TSH and thyroxine together, or calcium level with PTH, calcitonin, and target-organ response.",
    predictionPrompt: "Predict which hormone should rise or fall and what target response should follow.",
    explanationPrompt: "Use the paired values and target response to explain whether the pattern matches expected feedback."
  },
  glucose: {
    investigationQuestion: "How do time-series and pathway evidence separate glucose regulation from rapid and longer stress responses?",
    learningPurpose: "Explain how pancreatic islets and adrenal regions produce different signals that can overlap while serving different control needs.",
    testVariable: "Change the meal, activity, insulin-response, or stress condition.",
    comparisonControl: "Keep time, hormone source, target, and direction of response as comparison points.",
    evidenceFocus: "Inspect glucose curves, alpha- or beta-cell signals, adrenal region, ACTH involvement, and response timing.",
    predictionPrompt: "Predict the direction and timing of the main response and identify the hormone or gland region responsible.",
    explanationPrompt: "Use the graph or pathway evidence to explain the response and distinguish it from the closest alternative."
  }
} satisfies Record<string, ModelLabGuidance>;

const actionPotentialGraph = (highlightIndices: number[]): ModelGraph => ({
  title: "Membrane voltage during one action potential",
  description: "A line begins near minus 70 millivolts, reaches threshold near minus 55, rises to about plus 30, falls below resting potential, and then returns to rest. The selected phase is marked with a larger outlined point.",
  xLabel: "Phase of the action potential",
  yLabel: "Membrane voltage (mV)",
  xValues: ["Rest", "Threshold", "Rising", "Peak", "Falling", "Undershoot", "Recovery"],
  yMin: -90,
  yMax: 40,
  yTicks: [-80, -70, -55, 0, 30],
  series: [{ label: "Membrane voltage", values: [-70, -55, 5, 30, -25, -80, -70], symbol: "circle", color: "#006f60" }],
  highlightIndices,
  note: "The plotted values are a teaching model. Exact voltage and timing vary among neurons."
});

const audiogramGraph = (highlightIndices: number[]): ModelGraph => ({
  title: "Synthetic hearing-threshold pattern",
  description: "Thresholds are low from 250 to 1000 hertz and rise at higher frequencies. On this audiogram, larger decibel hearing-level values are plotted lower on the graph.",
  xLabel: "Frequency (Hz)",
  yLabel: "Threshold (dB HL; larger values lower)",
  xValues: ["250", "500", "1000", "2000", "4000", "8000"],
  yMin: 0,
  yMax: 70,
  yTicks: [0, 20, 40, 60],
  invertY: true,
  series: [{ label: "Measured threshold", values: [10, 10, 15, 25, 45, 60], symbol: "circle", color: "#006f60" }],
  highlightIndices,
  note: "This is supplied classroom data, not a hearing test or diagnosis."
});

const sensoryAdaptationGraph = (highlightIndices: number[]): ModelGraph => ({
  title: "Response during a steady stimulus",
  description: "A normalized sensory response starts at 100 percent and decreases while the stimulus remains steady.",
  xLabel: "Time after stimulus begins",
  yLabel: "Response (% of initial response)",
  xValues: ["0 s", "10 s", "20 s", "40 s", "60 s"],
  yMin: 0,
  yMax: 100,
  yTicks: [0, 25, 50, 75, 100],
  series: [{ label: "Sensory response", values: [100, 78, 61, 47, 40], symbol: "circle", color: "#006f60" }],
  highlightIndices,
  note: "The stimulus is unchanged in this model; the changing line represents the sensory response."
});

const adhGraph = (variant: "dehydration" | "low-adh" | "recovery"): ModelGraph => {
  const records = {
    dehydration: {
      description: "During water loss, blood concentration and the ADH signal rise while urine volume falls.",
      series: [
        { label: "Blood concentration", values: [100, 103, 106, 104], symbol: "circle" as const, color: "#006f60" },
        { label: "ADH signal", values: [100, 132, 168, 145], symbol: "square" as const, color: "#a14f00" },
        { label: "Urine volume", values: [100, 78, 52, 61], symbol: "triangle" as const, color: "#315e88" }
      ]
    },
    "low-adh": {
      description: "When ADH action is reduced, blood concentration rises while urine volume stays high.",
      series: [
        { label: "Blood concentration", values: [100, 104, 108, 110], symbol: "circle" as const, color: "#006f60" },
        { label: "ADH action", values: [100, 76, 58, 52], symbol: "square" as const, color: "#a14f00" },
        { label: "Urine volume", values: [100, 121, 148, 158], symbol: "triangle" as const, color: "#315e88" }
      ]
    },
    recovery: {
      description: "After water becomes available, blood concentration and ADH move toward baseline while urine volume recovers.",
      series: [
        { label: "Blood concentration", values: [106, 104, 102, 100], symbol: "circle" as const, color: "#006f60" },
        { label: "ADH signal", values: [168, 144, 119, 100], symbol: "square" as const, color: "#a14f00" },
        { label: "Urine volume", values: [52, 59, 76, 96], symbol: "triangle" as const, color: "#315e88" }
      ]
    }
  } as const;
  const selected = records[variant];
  return {
    title: "Supplied water-balance data",
    description: selected.description,
    xLabel: "Observation time",
    yLabel: "Relative value (% of starting baseline)",
    xValues: ["Start", "1 h", "2 h", "Recovery"],
    yMin: 40,
    yMax: 180,
    yTicks: [50, 100, 150],
    series: selected.series.map((series) => ({ ...series, values: [...series.values] })),
    note: "Values are normalized teaching data. They show direction and timing, not a personal health measurement."
  };
};

const glucoseGraph = (variant: "regulated-meal" | "low-insulin" | "reduced-response" | "activity"): ModelGraph => {
  const records = {
    "regulated-meal": { description: "Glucose rises after a meal and returns toward its starting range.", values: [5, 7.4, 7.8, 6.1, 5.2] },
    "low-insulin": { description: "Glucose rises after a meal and remains high when the insulin signal is low.", values: [5.3, 8.8, 11.7, 12.1, 10.9] },
    "reduced-response": { description: "Glucose remains elevated longer when target tissues respond weakly despite an insulin signal.", values: [5.4, 8.5, 10.4, 9.3, 7.8] },
    activity: { description: "Glucose falls during extended activity and then moves back toward its starting range.", values: [5.2, 4.7, 4.2, 4.5, 4.9] }
  } as const;
  const selected = records[variant];
  return {
    title: "Synthetic blood-glucose response",
    description: selected.description,
    xLabel: "Time (minutes)",
    yLabel: "Blood glucose (mmol/L)",
    xValues: ["0", "30", "60", "120", "180"],
    yMin: 3,
    yMax: 13,
    yTicks: [4, 6, 8, 10, 12],
    series: [{ label: "Blood glucose", values: [...selected.values], symbol: "circle", color: "#006f60" }],
    note: "This synthetic series supports mechanism practice. It cannot diagnose diabetes."
  };
};

export const MODEL_LAB_RECORDS: ModelLabRecord[] = [
  {
    ...MODEL_LAB_GUIDANCE.myelin,
    id: "myelin", lessonId: "lesson-01", lessonLabel: "Lesson 1", chapter: 11, title: "Myelin and conduction",
    prompt: "Predict where the action potential must be regenerated, then inspect how the signal moves.",
    kind: "pathway-builder", pilot1SourceInteractionIds: ["interaction-neuron-pathway-sort", "interaction-reflex-arc-builder"],
    reasoningAction: "Compare signal regeneration in intact, unmyelinated, and damaged pathways.",
    staticEquivalent: "A complete text pathway lists every membrane region and explains why myelin changes speed but not action-potential size.",
    steps: [
      { label: "Signal begins", detail: "An action potential changes the membrane voltage in one axon region." },
      { label: "Current spreads", detail: "Local current moves toward the next excitable membrane region." },
      { label: "Membrane responds", detail: "Voltage-gated channels regenerate the action potential." },
      { label: "Signal continues", detail: "The same-sized action potential moves forward along the axon." }
    ],
    choices: [
      { id: "unmyelinated", label: "Run an unmyelinated axon", resultTitle: "Regeneration occurs along adjacent membrane", observation: "Each nearby membrane region must open channels and regenerate the action potential.", reasoning: "More membrane responds in sequence, so conduction is usually slower than in a similar myelinated axon.", affectedStep: 3, evidence: [{ label: "Regeneration sites", value: "Many adjacent membrane regions" }, { label: "Signal size", value: "Regenerated to a similar amplitude" }], path: ["Action potential", "Adjacent membrane", "Next membrane region", "Axon terminal"], nextQuestion: "Why is slower conduction not the same as a smaller action potential?" },
      { id: "myelinated", label: "Run a myelinated axon", resultTitle: "Regeneration is concentrated at nodes", observation: "Current spreads beneath myelin and the action potential is regenerated mainly at nodes of Ranvier.", reasoning: "Myelin limits current loss, so the next node reaches threshold sooner without making each action potential larger.", affectedStep: 2, evidence: [{ label: "Regeneration sites", value: "Nodes of Ranvier" }, { label: "Current between nodes", value: "Spreads beneath myelin" }], path: ["Node 1 fires", "Current spreads under myelin", "Node 2 reaches threshold", "Signal continues"], nextQuestion: "Which observation would show that myelin changed speed rather than signal amplitude?" },
      { id: "damaged-myelin", label: "Model damaged myelin", resultTitle: "Current leaks before the next node", observation: "Less local current reaches the next node, so threshold may be delayed or not reached.", reasoning: "Loss of insulation can slow or interrupt conduction. The outcome depends on the location and extent of damage.", affectedStep: 2, evidence: [{ label: "Current loss", value: "Increased between nodes" }, { label: "Possible result", value: "Delayed or failed regeneration" }], path: ["Node 1 fires", "Current leaks", "Node 2 receives less current", "Signal slows or stops"], nextQuestion: "What additional evidence would distinguish slower conduction from complete conduction failure?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE["action-potential"],
    id: "action-potential", lessonId: "lesson-02", lessonLabel: "Lesson 2", chapter: 11, title: "Action-potential graph explorer",
    prompt: "Select a phase. Link its voltage direction to the channel state and ion movement.",
    kind: "graph-explorer", pilot1SourceInteractionIds: ["interaction-action-potential-explorer"],
    reasoningAction: "Read membrane voltage against time and connect each phase to ion-channel evidence.",
    staticEquivalent: "The full graph, phase table, voltages, channel states, and ion movements are available together without operating the explorer.",
    steps: [
      { label: "Rest", detail: "Ion gradients and selective permeability support a voltage near −70 mV." },
      { label: "Threshold and rise", detail: "Enough depolarization opens many voltage-gated sodium channels." },
      { label: "Peak and fall", detail: "Sodium channels inactivate while potassium channels move K+ out." },
      { label: "Undershoot and recovery", detail: "Potassium channels close and channel states reset after refractory periods." }
    ],
    choices: [
      { id: "rest", label: "Rest", resultTitle: "Resting membrane potential", observation: "The model is near −70 mV. Potassium leak and ion gradients help keep the inside negative relative to the outside.", reasoning: "The sodium-potassium pump maintains the gradients over time; it does not create the rapid spike by itself.", affectedStep: 1, evidence: [{ label: "Approximate voltage", value: "−70 mV" }, { label: "Dominant condition", value: "Selective permeability and ion gradients" }], graph: actionPotentialGraph([0]), nextQuestion: "What would have to change for this membrane to move toward threshold?" },
      { id: "threshold", label: "Threshold", resultTitle: "Threshold starts the regenerative response", observation: "The membrane reaches about −55 mV and enough voltage-gated sodium channels open to sustain rapid depolarization.", reasoning: "A subthreshold change fades. Reaching threshold starts an all-or-none action potential.", affectedStep: 2, evidence: [{ label: "Approximate voltage", value: "−55 mV" }, { label: "Key event", value: "Many voltage-gated Na+ channels open" }], graph: actionPotentialGraph([1]), nextQuestion: "How would the graph differ after a stimulus that stops below threshold?" },
      { id: "sodium-opens", label: "Rising phase", resultTitle: "The membrane depolarizes", observation: "Na+ moves into the axon down its electrochemical gradient, and voltage rises rapidly.", reasoning: "Positive charge entering makes the inside less negative and then positive.", affectedStep: 2, evidence: [{ label: "Ion movement", value: "Na+ enters" }, { label: "Voltage direction", value: "Rising" }], graph: actionPotentialGraph([2]), nextQuestion: "Why does a stronger stimulus increase firing frequency instead of doubling this peak?" },
      { id: "peak", label: "Peak", resultTitle: "Sodium entry stops increasing", observation: "Near +30 mV, sodium channels inactivate and delayed potassium channels are open.", reasoning: "The changing channel states turn the voltage away from the peak and begin repolarization.", affectedStep: 3, evidence: [{ label: "Approximate voltage", value: "+30 mV" }, { label: "Transition", value: "Na+ channels inactivate; K+ channels are open" }], graph: actionPotentialGraph([3]), nextQuestion: "Which channel change explains why voltage does not remain near the peak?" },
      { id: "falling", label: "Falling phase", resultTitle: "Potassium exit repolarizes the membrane", observation: "K+ leaves the axon while sodium channels remain inactivated, so voltage moves negative again.", reasoning: "The loss of positive charge from the inside produces the falling phase.", affectedStep: 3, evidence: [{ label: "Ion movement", value: "K+ exits" }, { label: "Voltage direction", value: "Falling" }], graph: actionPotentialGraph([4]), nextQuestion: "Which evidence separates repolarization from the later undershoot?" },
      { id: "potassium-stays-open", label: "Undershoot", resultTitle: "The membrane becomes briefly more negative", observation: "K+ channels close slowly, so potassium continues leaving after voltage passes its resting value.", reasoning: "Continued positive-charge loss produces hyperpolarization and contributes to the relative refractory period.", affectedStep: 4, evidence: [{ label: "Approximate voltage", value: "−80 mV" }, { label: "Channel condition", value: "Some K+ channels remain open" }], graph: actionPotentialGraph([5]), nextQuestion: "Why might a stronger-than-usual stimulus be needed during this phase?" },
      { id: "recovery", label: "Recovery", resultTitle: "Channel states return toward readiness", observation: "Potassium channels close and sodium channels recover from inactivation as voltage returns near rest.", reasoning: "Restored channel readiness allows another action potential. The maintained ion gradients support continued signalling.", affectedStep: 4, evidence: [{ label: "Approximate voltage", value: "−70 mV" }, { label: "Key change", value: "Voltage-gated channels reset" }], graph: actionPotentialGraph([6]), nextQuestion: "How do refractory periods support one-way propagation along an axon?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE.synapse,
    id: "synapse", lessonId: "lesson-03", lessonLabel: "Lesson 3", chapter: 11, title: "Synaptic transmission troubleshooter",
    prompt: "Choose a disrupted step, predict the postsynaptic effect, and then inspect the complete sequence.",
    kind: "pathway-builder", pilot1SourceInteractionIds: ["interaction-synapse-sequence"],
    reasoningAction: "Locate a disruption before, at, or after receptor binding.",
    staticEquivalent: "All three disruptions are described beside the complete presynaptic-to-postsynaptic sequence.",
    steps: [
      { label: "Impulse arrives", detail: "An action potential reaches the presynaptic terminal." },
      { label: "Calcium enters", detail: "Voltage-gated calcium channels open." },
      { label: "Messenger crosses", detail: "Vesicles release neurotransmitter, which binds to receptors." },
      { label: "Signal ends", detail: "Breakdown, reuptake, or diffusion limits receptor stimulation." }
    ],
    choices: [
      { id: "calcium", label: "Block calcium entry", resultTitle: "Less neurotransmitter is released", observation: "The impulse arrives, but fewer vesicles fuse with the presynaptic membrane.", reasoning: "Calcium entry is the link between terminal depolarization and exocytosis.", affectedStep: 2, evidence: [{ label: "Presynaptic impulse", value: "Arrives" }, { label: "Transmitter release", value: "Decreases" }], path: ["Impulse arrives", "Calcium entry blocked", "Fewer vesicles fuse", "Weak postsynaptic effect"], nextQuestion: "Why can normal postsynaptic receptors still produce a weak response in this case?" },
      { id: "receptor", label: "Block postsynaptic receptors", resultTitle: "Release is normal but the target response falls", observation: "Neurotransmitter enters the cleft and can be cleared normally, but it cannot activate the blocked receptors.", reasoning: "The disruption occurs after diffusion and before the target-cell electrical effect.", affectedStep: 3, evidence: [{ label: "Transmitter release", value: "Near expected" }, { label: "Postsynaptic response", value: "Reduced" }], path: ["Release occurs", "Transmitter diffuses", "Receptor is blocked", "Target response decreases"], nextQuestion: "Which measurement would help distinguish a receptor block from reduced transmitter release?" },
      { id: "enzyme", label: "Block cholinesterase", resultTitle: "Acetylcholine acts for longer", observation: "More acetylcholine remains available to bind receptors in the cleft.", reasoning: "Slower breakdown delays signal termination and may extend postsynaptic stimulation.", affectedStep: 4, evidence: [{ label: "Initial release", value: "Near expected" }, { label: "Signal duration", value: "Longer" }], path: ["Acetylcholine released", "Receptors activated", "Cholinesterase blocked", "Stimulation continues"], nextQuestion: "How does this pattern differ from the effect of a receptor antagonist?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE["nervous-system"],
    id: "nervous-system", lessonId: "lesson-04", lessonLabel: "Lesson 4", chapter: 11, title: "Nervous-system pathway builder",
    prompt: "Choose an effector, then trace afferent input, central integration, and efferent output.",
    kind: "pathway-builder", pilot1SourceInteractionIds: ["interaction-neuron-pathway-sort", "interaction-reflex-arc-builder"],
    reasoningAction: "Classify information by direction and effector rather than by neuron shape.",
    staticEquivalent: "Each case includes a complete receptor-to-effector route and its somatic or autonomic classification.",
    steps: [
      { label: "Receptor", detail: "A change is detected at the body surface or inside the body." },
      { label: "Afferent route", detail: "Sensory information travels toward the CNS." },
      { label: "CNS integration", detail: "The spinal cord or brain organizes an output." },
      { label: "Efferent route", detail: "Motor information travels toward an effector." }
    ],
    choices: [
      { id: "skeletal-muscle", label: "Move a skeletal muscle", resultTitle: "Use a somatic motor pathway", observation: "Motor output travels from the CNS to skeletal muscle.", reasoning: "Somatic pathways control skeletal-muscle effectors, including voluntary movement and reflex responses.", affectedStep: 4, evidence: [{ label: "Effector", value: "Skeletal muscle" }, { label: "Motor division", value: "Somatic" }], path: ["Skin receptor", "Sensory neuron", "CNS integration", "Somatic motor neuron → muscle"], nextQuestion: "Why can a reflex use a somatic motor neuron even when the response was not consciously planned?" },
      { id: "heart-rate", label: "Adjust heart rate", resultTitle: "Use an autonomic pathway", observation: "Sympathetic and parasympathetic outputs can change cardiac activity.", reasoning: "The two divisions coordinate rather than acting as universal on and off switches for every organ.", affectedStep: 4, evidence: [{ label: "Effector", value: "Cardiac tissue" }, { label: "Motor division", value: "Autonomic" }], path: ["Internal receptor", "Sensory pathway", "Brainstem integration", "Autonomic output → heart"], nextQuestion: "What evidence would show whether sympathetic or parasympathetic influence was stronger?" },
      { id: "reversed", label: "Test a reversed pathway", resultTitle: "The proposed order reverses information flow", observation: "The proposal begins with the effector and ends with the receptor.", reasoning: "Receptors supply sensory input before CNS processing; effectors act after motor output.", affectedStep: 1, evidence: [{ label: "Problem", value: "Effector placed first" }, { label: "Repair", value: "Begin with receptor input" }], path: ["Effector?", "Motor neuron?", "Sensory neuron?", "Receptor?"], nextQuestion: "Which two labels must exchange positions to begin repairing this pathway?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE.brain,
    id: "brain", lessonId: "lesson-05", lessonLabel: "Lesson 5", chapter: 11, title: "Brain evidence locator",
    prompt: "Use a changed function to choose a relevant network, then state what the evidence cannot prove.",
    kind: "case-explorer", pilot1SourceInteractionIds: ["interaction-brain-symptom-locator"],
    reasoningAction: "Match functional evidence to a brain region while keeping the conclusion non-diagnostic.",
    staticEquivalent: "All synthetic cases list the observation, likely starting region, connected structures, and limits.",
    steps: [
      { label: "Describe evidence", detail: "Name the changed movement, sensation, language, or automatic function." },
      { label: "Choose a region", detail: "Match the evidence to a known function." },
      { label: "Check connections", detail: "Consider pathways linking that region with others." },
      { label: "State a limit", detail: "A classroom case cannot establish a medical diagnosis." }
    ],
    choices: [
      { id: "coordination", label: "Inspect coordination evidence", resultTitle: "The cerebellum is a useful starting point", observation: "Strength is near expected, but balance, timing, and rapid alternating movements are irregular.", reasoning: "Those functions make cerebellar or connected motor pathways relevant, but the evidence alone cannot identify a cause.", affectedStep: 2, evidence: [{ label: "Changed function", value: "Timing and coordination" }, { label: "Starting region", value: "Cerebellum" }], path: ["Movement plan", "Motor pathways", "Cerebellar comparison", "Coordinated output"], nextQuestion: "Which vestibular or sensory evidence would help narrow this explanation?" },
      { id: "language", label: "Inspect language evidence", resultTitle: "A language-production network is a candidate", observation: "The person follows spoken directions but produces short, effortful phrases.", reasoning: "The contrast supports a language-production hypothesis, not a complete diagnosis. Motor-speech and broader language evidence are still needed.", affectedStep: 2, evidence: [{ label: "Relatively preserved", value: "Understanding directions" }, { label: "Changed", value: "Fluent speech production" }], path: ["Hear directions", "Interpret language", "Plan speech", "Produce response"], nextQuestion: "What additional observation would separate language planning from muscle-control difficulty?" },
      { id: "breathing", label: "Inspect automatic breathing evidence", resultTitle: "Examine the brainstem network", observation: "The changed function is automatic and life-sustaining.", reasoning: "The pons and medulla help regulate breathing, but they work with wider neural and chemical-control networks.", affectedStep: 2, evidence: [{ label: "Changed function", value: "Automatic breathing rhythm" }, { label: "Starting network", value: "Pons and medulla" }], path: ["CO₂ and pH input", "Brainstem integration", "Motor output", "Breathing muscles"], nextQuestion: "Why would one breathing change be insufficient to identify a single damaged structure?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE.sensory,
    id: "sensory", lessonId: "lesson-06", lessonLabel: "Lesson 6", chapter: 12, title: "Sensory evidence explorer",
    prompt: "Choose a sensory pattern. Separate the unchanged stimulus from the changing receptor or behavioural response.",
    kind: "data-lab", pilot1SourceInteractionIds: ["interaction-sensory-investigation-planner", "interaction-sensory-evidence-board"],
    reasoningAction: "Interpret adaptation or receptor-density evidence and improve an investigation design.",
    staticEquivalent: "The adaptation graph, receptor-density comparison, procedure choices, and evidence limits are provided in text and tables.",
    steps: [
      { label: "Stimulus", detail: "A physical or chemical change reaches a receptor." },
      { label: "Transduction", detail: "The receptor converts that energy into an electrical change." },
      { label: "Neural pathway", detail: "Signals travel toward the central nervous system." },
      { label: "Perception or report", detail: "The brain interprets the pattern and the learner reports an observation." }
    ],
    choices: [
      { id: "sustained-odor", label: "Graph a steady odour", resultTitle: "The response decreases while the stimulus remains", observation: "The normalized sensory response falls over time even though the odour is held steady.", reasoning: "This pattern supports sensory adaptation; it does not show that the stimulus vanished.", affectedStep: 2, evidence: [{ label: "Stimulus", value: "Held steady" }, { label: "Reported response", value: "Decreases over time" }], graph: sensoryAdaptationGraph([0, 4]), nextQuestion: "Which controlled observation would help separate adaptation from a weaker stimulus source?" },
      { id: "two-point", label: "Compare fingertip and forearm", resultTitle: "Fingertips usually show finer spatial discrimination", observation: "In supplied trials, two points are reported at smaller separations on the fingertip than on the forearm.", reasoning: "Receptor density, receptive-field size, and neural representation can affect this task. One participant does not establish a universal threshold.", affectedStep: 4, evidence: [{ label: "Median fingertip threshold", value: "4 mm" }, { label: "Median forearm threshold", value: "28 mm" }], path: ["Same blunt contacts", "Randomized separations", "Repeated reports", "Compare medians and overlap"], nextQuestion: "Why are repeated randomized trials stronger than one steadily increasing trial?" },
      { id: "randomize", label: "Improve the procedure", resultTitle: "Randomize and repeat the trials", observation: "The participant cannot rely on a predictable sequence, and one uncertain report does not decide the threshold.", reasoning: "Random order reduces expectation bias. Repetition reveals variation and supports a more defensible comparison.", affectedStep: 4, evidence: [{ label: "Independent variable", value: "Body region or stimulus condition" }, { label: "Reliability repair", value: "Randomized repeated trials" }], path: ["Define variables", "Use safe equal contact", "Randomize and repeat", "Summarize variation"], nextQuestion: "Which variable must stay the same when comparing fingertip and forearm?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE.eye,
    id: "eye", lessonId: "lesson-07", lessonLabel: "Lesson 7", chapter: 12, title: "Light-to-vision pathway",
    prompt: "Select a location and decide whether it focuses light, transduces light, carries neural output, or supports perception.",
    kind: "pathway-builder", pilot1SourceInteractionIds: ["interaction-eye-light-path"],
    reasoningAction: "Separate the optical pathway from retinal transduction and brain interpretation.",
    staticEquivalent: "The complete light and neural pathway is labelled, with each location's evidence and role stated in text.",
    steps: [
      { label: "Focus light", detail: "The cornea and lens refract light toward the retina." },
      { label: "Detect light", detail: "Rods and cones change their signalling when light reaches them." },
      { label: "Organize output", detail: "Retinal neurons shape the pattern sent through ganglion-cell axons." },
      { label: "Interpret", detail: "The brain uses the neural pattern to support perception." }
    ],
    choices: [
      { id: "near-focus", label: "Focus on a nearby object", resultTitle: "The lens becomes more rounded", observation: "Ciliary-muscle action changes lens shape during accommodation.", reasoning: "A more rounded lens bends light more strongly so it can focus on the retina.", affectedStep: 1, evidence: [{ label: "Changed structure", value: "Lens" }, { label: "Process", value: "Accommodation" }], path: ["Cornea refracts", "Pupil admits light", "Lens changes shape", "Image reaches retina"], nextQuestion: "Which eye structure controls light entry without performing phototransduction?" },
      { id: "retina", label: "Locate phototransduction", resultTitle: "Photoreceptors in the retina transduce light", observation: "Rods and cones change membrane signalling when light reaches them.", reasoning: "The retina converts light into patterned neural activity and begins processing before the optic nerve.", affectedStep: 2, evidence: [{ label: "Input", value: "Light energy" }, { label: "Output", value: "Changed neural signalling" }], path: ["Light reaches retina", "Rods and cones respond", "Retinal circuits process", "Ganglion cells signal"], nextQuestion: "Why is the optic nerve not the site of phototransduction?" },
      { id: "blind-spot", label: "Test the optic disc", resultTitle: "The optic disc has no photoreceptors", observation: "Ganglion-cell axons leave the eye at the optic disc, creating the physiological blind spot.", reasoning: "The visual system normally uses both eyes and surrounding patterns, so the gap is not usually noticed.", affectedStep: 3, evidence: [{ label: "Structure", value: "Optic disc" }, { label: "Missing cells", value: "Rods and cones" }], path: ["Light enters eye", "Light reaches optic disc", "No photoreceptor transduces it", "No signal from that point"], nextQuestion: "How could a simple two-eye test demonstrate that the blind spot is retinal rather than a missing object?" },
      { id: "cortex", label: "Locate perception", resultTitle: "Brain networks interpret the neural pattern", observation: "The optic nerve carries retinal output; connected brain regions compare and interpret that input.", reasoning: "Perception is not explained by saying the brain simply flips a picture. It depends on distributed neural processing.", affectedStep: 4, evidence: [{ label: "Signal arriving", value: "Neural pattern" }, { label: "Process", value: "Interpretation across brain networks" }], path: ["Retinal output", "Optic nerve", "Connected pathways", "Visual perception"], nextQuestion: "What is lost when optical focusing and neural interpretation are described as one step?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE.hearing,
    id: "hearing", lessonId: "lesson-08", lessonLabel: "Lesson 8", chapter: 12, title: "Audiogram and balance evidence",
    prompt: "Read the pattern before naming a cause. Use the same mechanoreceptor idea for hearing and equilibrium.",
    kind: "data-lab", pilot1SourceInteractionIds: ["interaction-audiogram-evidence-explorer"],
    reasoningAction: "Interpret a supplied audiogram and connect mechanical input to hair-cell transduction without diagnosing.",
    staticEquivalent: "The complete threshold table, graph description, hearing pathway, balance pathway, and interpretation limit are available together.",
    steps: [
      { label: "Mechanical input", detail: "Sound vibration or head movement changes a sensory structure." },
      { label: "Fluid movement", detail: "Cochlear or vestibular fluid shifts." },
      { label: "Hair-cell bending", detail: "Mechanoreceptor hair cells change their membrane activity." },
      { label: "Neural signal", detail: "The auditory-vestibular nerve carries the pattern to the brain." }
    ],
    choices: [
      { id: "cochlea", label: "Trace a sound wave", resultTitle: "Cochlear hair cells transduce sound", observation: "The tympanum, ossicles, and oval window transfer vibration into cochlear-fluid movement.", reasoning: "Movement bends hair cells in the organ of Corti, changing the neural signal for hearing.", affectedStep: 3, evidence: [{ label: "Mechanical route", value: "Tympanum → ossicles → oval window" }, { label: "Receptor", value: "Cochlear hair cell" }], path: ["Sound vibrates tympanum", "Ossicles move", "Cochlear fluid shifts", "Hair cells signal"], nextQuestion: "Which structure transfers vibration from the middle ear into inner-ear fluid?" },
      { id: "low-frequency", label: "Inspect 250–1000 Hz", resultTitle: "Thresholds are relatively low in this range", observation: "The supplied thresholds are 10–15 dB HL from 250 to 1000 Hz.", reasoning: "This supports a frequency-specific description. It does not establish perfect hearing in every setting.", affectedStep: 4, evidence: [{ label: "Frequency range", value: "250–1000 Hz" }, { label: "Threshold range", value: "10–15 dB HL" }], graph: audiogramGraph([0, 1, 2]), nextQuestion: "Why should this result not be generalized to speech in background noise?" },
      { id: "high-frequency", label: "Inspect 4000–8000 Hz", resultTitle: "High-frequency thresholds are elevated", observation: "Thresholds rise from 45 to 60 dB HL at 4000 and 8000 Hz.", reasoning: "The graph supports a high-frequency pattern. Cause requires air-bone comparison, history, examination, and other tests.", affectedStep: 4, evidence: [{ label: "Frequency range", value: "4000–8000 Hz" }, { label: "Threshold range", value: "45–60 dB HL" }], graph: audiogramGraph([4, 5]), nextQuestion: "What additional evidence would help locate where the hearing pathway changed?" },
      { id: "rotation", label: "Trace head rotation", resultTitle: "Semicircular canals detect angular acceleration", observation: "Fluid lags behind the moving canal and bends receptor structures.", reasoning: "The resulting pattern helps the brain estimate rotational movement; it is not a hearing test.", affectedStep: 3, evidence: [{ label: "Input", value: "Angular acceleration" }, { label: "Receptor system", value: "Vestibular hair cells" }], path: ["Head begins rotating", "Canal fluid lags", "Hair cells bend", "Vestibular signal changes"], nextQuestion: "Why does steady rotation produce a different signal from the start or stop of rotation?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE.homeostasis,
    id: "homeostasis", lessonId: "lesson-09", lessonLabel: "Lesson 9", chapter: 13, title: "Negative-feedback builder",
    prompt: "Inspect a loop, identify what is missing or reversed, and repair the return effect.",
    kind: "pathway-builder", pilot1SourceInteractionIds: ["interaction-control-system-comparison", "interaction-negative-feedback-builder"],
    reasoningAction: "Build a receptor-control centre-effector loop and test whether the response opposes the disturbance.",
    staticEquivalent: "Each complete and incomplete loop is written as a sequence with the direction of change stated explicitly.",
    steps: [
      { label: "Variable changes", detail: "A regulated condition moves away from its workable range." },
      { label: "Receptor detects", detail: "A sensor responds to the direction and size of change." },
      { label: "Control centre signals", detail: "Neural or endocrine output reaches an effector." },
      { label: "Response opposes", detail: "The response reduces the original disturbance." }
    ],
    choices: [
      { id: "temperature-rises", label: "Build a heat-loss loop", resultTitle: "The response opposes rising temperature", observation: "Skin blood flow and sweating can increase under appropriate conditions, increasing heat loss.", reasoning: "The return effect reduces the original temperature rise, establishing negative feedback.", affectedStep: 4, evidence: [{ label: "Regulated variable", value: "Core body temperature" }, { label: "Return effect", value: "Temperature departure decreases" }], path: ["Temperature rises", "Receptors signal", "Effectors increase heat loss", "Temperature moves toward range"], nextQuestion: "Which part of this sequence proves the loop is negative feedback?" },
      { id: "missing-return", label: "Repair a missing return", resultTitle: "Sweating alone does not complete the loop", observation: "The diagram ends at sweat-gland activity and never shows what happens to temperature.", reasoning: "Add increased evaporative heat loss and a reduced temperature disturbance to establish the return relationship.", affectedStep: 4, evidence: [{ label: "Present", value: "Effector action" }, { label: "Missing", value: "Effect on the original disturbance" }], path: ["Temperature rises", "Sweat glands activate", "Evaporation increases", "Add: temperature rise is reduced"], nextQuestion: "Why is naming an effector not enough to classify feedback direction?" },
      { id: "wrong-direction", label: "Test the wrong direction", resultTitle: "The proposed response amplifies the disturbance", observation: "Temperature rises and the proposed effector produces additional heat.", reasoning: "That response is not negative feedback unless another effect reverses the direction of change.", affectedStep: 4, evidence: [{ label: "Original change", value: "Temperature rises" }, { label: "Proposed response", value: "Adds more heat" }], path: ["Temperature rises", "Control signal", "Heat production rises", "Disturbance becomes larger"], nextQuestion: "How would you change the effector response so this becomes a negative-feedback loop?" },
      { id: "no-receptor", label: "Remove a target-cell receptor", resultTitle: "The circulating hormone produces no specific response in that cell", observation: "The hormone may pass the cell in blood without binding.", reasoning: "Hormones travel widely, but only receptor-bearing target cells respond through that signalling pathway.", affectedStep: 3, evidence: [{ label: "Hormone in blood", value: "Present" }, { label: "Matching receptor", value: "Absent" }], path: ["Hormone released", "Hormone circulates", "No matching receptor", "No pathway-specific response"], nextQuestion: "What evidence would separate absent receptors from a problem later in cell signalling?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE.pituitary,
    id: "pituitary", lessonId: "lesson-10", lessonLabel: "Lesson 10", chapter: 13, title: "Hypothalamus-pituitary pathway builder",
    prompt: "Select a hormone route. Trace where the signal is made, released, received, and regulated.",
    kind: "pathway-builder", pilot1SourceInteractionIds: ["interaction-endocrine-body-map", "interaction-hypothalamus-pituitary-feedback"],
    reasoningAction: "Compare an anterior-pituitary axis with a posterior-pituitary neural-release pathway.",
    staticEquivalent: "All routes state source, release site, target, effect, and feedback without requiring interaction.",
    steps: [
      { label: "Hypothalamus", detail: "Neural-endocrine signals begin in specific hypothalamic cells." },
      { label: "Pituitary route", detail: "Anterior cells synthesize hormones; posterior terminals release hypothalamic hormones." },
      { label: "Target", detail: "A gland or body tissue responds through matching receptors." },
      { label: "Feedback", detail: "A downstream signal or regulated variable changes earlier stimulation." }
    ],
    choices: [
      { id: "thyroid-axis", label: "Trace the thyroid axis", resultTitle: "TSH links the anterior pituitary to the thyroid", observation: "Hypothalamic signals influence TSH, and TSH stimulates the thyroid to release thyroxine.", reasoning: "Thyroxine feeds back to the hypothalamus and pituitary, helping regulate further release.", affectedStep: 2, evidence: [{ label: "Pituitary hormone", value: "TSH" }, { label: "Target gland", value: "Thyroid" }], path: ["Hypothalamus signals", "Anterior pituitary releases TSH", "Thyroid releases thyroxine", "Thyroxine feeds back"], nextQuestion: "Which measured pair would help distinguish low pituitary drive from a thyroid-level problem?" },
      { id: "growth-hormone", label: "Trace human growth hormone", resultTitle: "hGH acts on several target tissues", observation: "The anterior pituitary makes and releases hGH in response to hypothalamic control.", reasoning: "Effects depend on age, nutrition, receptors, and related growth signals; the pituitary does not work alone.", affectedStep: 2, evidence: [{ label: "Source", value: "Anterior pituitary" }, { label: "Targets", value: "Several body tissues" }], path: ["Hypothalamic control", "Anterior pituitary releases hGH", "Target tissues respond", "Signals feed back"], nextQuestion: "Why is the phrase master gland incomplete for this pathway?" },
      { id: "adh-route", label: "Trace the ADH route", resultTitle: "ADH is made in the hypothalamus and released posteriorly", observation: "Hypothalamic neurons synthesize ADH. Their axon terminals release it from the posterior pituitary.", reasoning: "The posterior pituitary is a release site, not the site where ADH is made.", affectedStep: 2, evidence: [{ label: "Synthesis", value: "Hypothalamic neurons" }, { label: "Release", value: "Posterior pituitary terminals" }], path: ["Osmoreceptors change", "Hypothalamus makes ADH", "Posterior pituitary releases ADH", "Kidney responds"], nextQuestion: "How does this route differ from the anterior-pituitary TSH route?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE.adh,
    id: "adh", lessonId: "lesson-11", lessonLabel: "Lesson 11", chapter: 13, title: "ADH and water-balance data lab",
    prompt: "Run a supplied-data case. Compare blood concentration, ADH action, and urine volume over time.",
    kind: "data-lab", pilot1SourceInteractionIds: ["interaction-water-salt-data-lab"],
    reasoningAction: "Use direction and timing in a graph to explain water-balance feedback.",
    staticEquivalent: "Every graph value appears in a table, followed by a complete source-target-effect explanation and a non-diagnostic limit.",
    steps: [
      { label: "Osmoreceptors", detail: "Hypothalamic receptors detect a change in blood concentration." },
      { label: "ADH is made", detail: "Hypothalamic neurons produce ADH." },
      { label: "ADH is released", detail: "Axon terminals in the posterior pituitary release ADH." },
      { label: "Kidneys respond", detail: "Collecting ducts change water reabsorption." }
    ],
    choices: [
      { id: "dehydration", label: "Run water-loss data", resultTitle: "ADH rises as the body conserves water", observation: "Blood concentration and ADH rise while urine volume falls and urine becomes more concentrated.", reasoning: "Returning more water to the blood opposes the rise in blood concentration.", affectedStep: 4, evidence: [{ label: "ADH direction", value: "Rises" }, { label: "Urine volume", value: "Falls" }], graph: adhGraph("dehydration"), nextQuestion: "Which line is the disturbance, which is the signal, and which is part of the response?" },
      { id: "low-adh", label: "Run reduced-ADH data", resultTitle: "Urine stays dilute and high in volume", observation: "Less water is reabsorbed from collecting ducts, even while blood concentration rises.", reasoning: "The pattern follows reduced ADH action. It cannot diagnose why the pathway changed.", affectedStep: 3, evidence: [{ label: "ADH action", value: "Reduced" }, { label: "Urine volume", value: "Remains high" }], graph: adhGraph("low-adh"), nextQuestion: "What additional measurement would help separate low ADH release from weak kidney response?" },
      { id: "recovery", label: "Run recovery data", resultTitle: "The signals move back toward baseline", observation: "After water becomes available, blood concentration and ADH fall toward baseline while urine volume starts to rise.", reasoning: "The earlier conservation response opposed water loss, and the reduced disturbance now lowers the signal.", affectedStep: 1, evidence: [{ label: "Blood concentration", value: "Moves toward baseline" }, { label: "ADH signal", value: "Falls as the disturbance shrinks" }], graph: adhGraph("recovery"), nextQuestion: "Why do the lines not all return to baseline at exactly the same moment?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE["thyroid-calcium"],
    id: "thyroid-calcium", lessonId: "lesson-12", lessonLabel: "Lesson 12", chapter: 13, title: "Thyroid and calcium feedback explorer",
    prompt: "Choose the regulated variable, read the paired hormone evidence, and locate the feedback mismatch.",
    kind: "case-explorer", pilot1SourceInteractionIds: ["interaction-thyroid-calcium-feedback"],
    reasoningAction: "Use paired hormone values to distinguish expected response from a possible pathway-level mismatch.",
    staticEquivalent: "Each synthetic pattern lists variable, pituitary or gland signal, target response, and evidential limit.",
    steps: [
      { label: "Detect change", detail: "A control pathway responds to thyroxine or blood-calcium evidence." },
      { label: "Release hormone", detail: "The relevant gland changes hormone output." },
      { label: "Targets respond", detail: "Bone, kidney, intestine, or metabolic tissues change activity." },
      { label: "Return effect", detail: "The response should reduce the original disturbance." }
    ],
    choices: [
      { id: "low-thyroxine", label: "Low thyroxine, high TSH", resultTitle: "The pituitary drive is high while thyroid output remains low", observation: "Low thyroxine reduces negative feedback, so TSH rises, but thyroxine remains below the expected range.", reasoning: "A thyroid-level production problem is one candidate. The pair does not prove a single cause.", affectedStep: 2, evidence: [{ label: "Thyroxine", value: "Low" }, { label: "TSH", value: "High" }], path: ["Thyroxine low", "Feedback inhibition falls", "TSH rises", "Thyroxine remains low"], nextQuestion: "What additional evidence would test whether the thyroid can respond to TSH?" },
      { id: "central-low", label: "Low thyroxine, low TSH", resultTitle: "Thyroid output and pituitary drive are both low", observation: "The target hormone is low without the expected increase in TSH.", reasoning: "Hypothalamic or pituitary signalling is one candidate, but illness and medication context can also alter the pattern.", affectedStep: 2, evidence: [{ label: "Thyroxine", value: "Low" }, { label: "TSH", value: "Low" }], path: ["Thyroxine low", "Expected feedback signal", "TSH stays low", "Thyroid drive remains low"], nextQuestion: "Why is a paired TSH value more informative than thyroxine alone?" },
      { id: "low-calcium", label: "Low calcium, high PTH", resultTitle: "PTH responds in the expected direction", observation: "PTH is high, but blood calcium remains low.", reasoning: "Inspect kidney, bone, vitamin D, intestinal absorption, and calcium supply instead of assuming PTH underproduction.", affectedStep: 3, evidence: [{ label: "Blood calcium", value: "Low" }, { label: "PTH", value: "High" }], path: ["Calcium falls", "PTH rises", "Bone/kidney/intestine responses", "Calcium still low"], nextQuestion: "Which target-system evidence would help explain why calcium remains low?" }
    ]
  },
  {
    ...MODEL_LAB_GUIDANCE.glucose,
    id: "glucose", lessonId: "lesson-13", lessonLabel: "Lesson 13", chapter: 13, title: "Glucose and stress response lab",
    prompt: "Run a glucose or stress scenario. Use time-series or pathway evidence to separate overlapping hormone actions.",
    kind: "data-lab", pilot1SourceInteractionIds: ["interaction-blood-glucose-simulator", "interaction-water-salt-data-lab"],
    reasoningAction: "Interpret glucose curves and compare rapid adrenal-medulla signalling with longer adrenal-cortex responses.",
    staticEquivalent: "All glucose values and stress pathways are available in tables and ordered text, with a health-data limitation.",
    steps: [
      { label: "Disturbance", detail: "Blood glucose, stress, pressure, or sodium balance changes." },
      { label: "Hormone source", detail: "Pancreatic islets or an adrenal region releases a signal." },
      { label: "Target response", detail: "Only receptor-bearing tissues change their activity." },
      { label: "Evidence over time", detail: "Short and long responses can overlap." }
    ],
    choices: [
      { id: "meal", label: "Run a regulated meal", resultTitle: "Glucose returns toward its starting range", observation: "Glucose rises after a meal and then falls as the insulin branch becomes more active.", reasoning: "Beta cells release insulin, and responsive tissues increase glucose uptake or storage. The return toward range reduces the original stimulus.", affectedStep: 3, evidence: [{ label: "Peak glucose", value: "7.8 mmol/L at 60 min" }, { label: "180-minute value", value: "5.2 mmol/L" }], graph: glucoseGraph("regulated-meal"), nextQuestion: "Which part of the curve is the clearest evidence of the return effect?" },
      { id: "low-insulin", label: "Run a low-insulin signal", resultTitle: "Glucose remains elevated", observation: "The curve rises above 11 mmol/L and stays high through 180 minutes.", reasoning: "A low insulin signal can reduce uptake and storage responses, but the synthetic curve alone cannot diagnose a cause.", affectedStep: 2, evidence: [{ label: "Peak glucose", value: "12.1 mmol/L at 120 min" }, { label: "180-minute value", value: "10.9 mmol/L" }], graph: glucoseGraph("low-insulin"), nextQuestion: "Which hormone measurement would help test this proposed mechanism?" },
      { id: "reduced-response", label: "Run reduced target response", resultTitle: "A strong signal can have a weak effect", observation: "Glucose stays elevated longer even though an insulin signal is present.", reasoning: "Reduced receptor or downstream responsiveness can weaken target-cell uptake and storage.", affectedStep: 3, evidence: [{ label: "Insulin signal", value: "Present" }, { label: "Target response", value: "Reduced" }], graph: glucoseGraph("reduced-response"), nextQuestion: "What evidence separates reduced responsiveness from low insulin production?" },
      { id: "activity", label: "Run extended activity", resultTitle: "Falling glucose recruits a different response", observation: "Glucose falls during activity and then moves back toward its starting range.", reasoning: "Glucagon and other signals can support liver glucose output as fuel demand continues.", affectedStep: 3, evidence: [{ label: "Lowest value", value: "4.2 mmol/L at 60 min" }, { label: "180-minute value", value: "4.9 mmol/L" }], graph: glucoseGraph("activity"), nextQuestion: "Which evidence would show that liver glucose output increased during recovery?" },
      { id: "rapid-stress", label: "Trace rapid stress", resultTitle: "The adrenal medulla supports the immediate phase", observation: "Sympathetic neurons stimulate the adrenal medulla, and epinephrine rises quickly.", reasoning: "This route can rapidly change cardiac output, airflow, blood distribution, and fuel availability.", affectedStep: 2, evidence: [{ label: "Control", value: "Sympathetic nerve input" }, { label: "Main hormone", value: "Epinephrine" }], path: ["Challenge detected", "Sympathetic output", "Adrenal medulla releases epinephrine", "Rapid target responses"], nextQuestion: "Why would a five-minute heart-rate peak fit this route better than cortisol alone?" },
      { id: "long-stress", label: "Trace longer stress", resultTitle: "Cortisol supports a longer response", observation: "Hypothalamic control and ACTH stimulate the adrenal cortex while rapid medulla effects may already be occurring.", reasoning: "Cortisol changes fuel use over longer time scales, so several control pathways can overlap.", affectedStep: 2, evidence: [{ label: "Pituitary signal", value: "ACTH" }, { label: "Target gland region", value: "Adrenal cortex" }], path: ["Hypothalamic signal", "Anterior pituitary releases ACTH", "Cortex releases cortisol", "Cortisol effects and feedback"], nextQuestion: "Which time-series evidence would separate the rapid and longer stress phases?" }
    ]
  }
];

export const MODEL_ID_BY_LESSON = Object.fromEntries(MODEL_LAB_RECORDS.map((model) => [model.lessonId, model.id])) as Record<string, string>;

export function buildModelLabInteractionMap(workspaceSha256: string, generatedAt: string) {
  return {
    schemaVersion: 2,
    project: "biology30-unit-a-pilot-2",
    generatedAt,
    workspaceSha256,
    persistencePolicy: "Each model saves the selected scenario, learner prediction, learner explanation, and Process Collection flag. Authored graph values, pathways, and feedback remain derived content. Stable hashed keys compact response and practice records without changing their public IDs.",
    completionPolicy: "Models and Data Lab investigations and collected evidence remain optional and do not change the eighteen required routes.",
    records: [
      ...MODEL_LAB_RECORDS.map((model) => ({
        id: model.id,
        destinationRoute: "model-lab",
        lessonId: model.lessonId,
        sourceInteractionIds: model.pilot1SourceInteractionIds,
        treatment: "adapted-for-pilot-2",
        kind: model.kind,
        investigationQuestion: model.investigationQuestion,
        learningPurpose: model.learningPurpose,
        testVariable: model.testVariable,
        comparisonControl: model.comparisonControl,
        evidenceFocus: model.evidenceFocus,
        predictionPrompt: model.predictionPrompt,
        explanationPrompt: model.explanationPrompt,
        reasoningAction: model.reasoningAction,
        scenarioCount: model.choices.length,
        persistenceFields: [`models.results.${model.id}`, `models.predictions.${model.id}`, `models.explanations.${model.id}`],
        staticEquivalent: model.staticEquivalent,
        processCollection: true,
        status: "awaiting-explicit-user-review"
      })),
      {
        id: "integrated-review-evidence",
        destinationRoute: "review-seminar",
        lessonId: null,
        sourceInteractionIds: ["interaction-integrated-case-board"],
        treatment: "adapted-into-three-saved-review-sessions",
        kind: "case-explorer",
        reasoningAction: "Revise nervous, sensory, and endocrine case explanations using evidence and a stated limit.",
        persistenceField: "responses[biology30-unit-a-pilot-2:review-seminar:*]",
        staticEquivalent: "Each review case contains an authored reasoning frame and course-model comparison.",
        processCollection: true,
        status: "awaiting-explicit-user-review"
      }
    ]
  };
}
