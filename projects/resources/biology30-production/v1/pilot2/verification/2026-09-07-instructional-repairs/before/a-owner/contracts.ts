export const PILOT_2_SOURCE_SLUG = "biology30-unit-a-pilot" as const;
export const PILOT_2_SLUG = "biology30-unit-a-pilot-2" as const;
export const PILOT_2_SOURCE_WORKSPACE_SHA256 = "b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee" as const;

export const TEACHER_SOURCE_FILES = [
  {
    id: "chapter-11-daily-plans",
    filename: "Chapter 11 Daily Plans.docx",
    sha256: "92cd8a88a72accaf2d26a7cab7004884864ebaaddd13f001c11c684dc6432697",
    kind: "teacher-daily-plan"
  },
  {
    id: "chapter-12-daily-plans",
    filename: "Chapter 12 Daily Plans.docx",
    sha256: "ca0ddd6cb21ba4e99329ddc466fe4b3a326126715f11fb885c9962c9afa944d8",
    kind: "teacher-daily-plan"
  },
  {
    id: "chapter-13-daily-plans",
    filename: "Chapter 13 Daily Plans.docx",
    sha256: "2007a5641da07c7e7f4a4f2136ca1e3d38ca0e26d6c9a32538806a8600544129",
    kind: "teacher-daily-plan"
  },
  {
    id: "unit-a-review-plan",
    filename: "Unit A Review Plan.docx",
    sha256: "6afddd745f8f2a3d37383ea4bbc08734c5a2e86014fea93fc53154e790edc531",
    kind: "teacher-review-plan"
  }
] as const;

export const POWERPOINT_SOURCES = [
  { id: "chapter-11-notes", filename: "Unit A Chapter 11 Notes.pptx", sha256: "74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1", slideCount: 66, mediaCount: 68 },
  { id: "chapter-12-notes", filename: "Unit A Chapter 12 Notes.pptx", sha256: "4162d8b6bc3ebe94a11b53ed2694932adccf41622a4473e785a46d57cd2184ea", slideCount: 29, mediaCount: 34 },
  { id: "chapter-13-notes", filename: "Unit A Chapter 13 Notes.pptx", sha256: "05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482", slideCount: 43, mediaCount: 50 }
] as const;

export const SHARED_ARCHIVE_SOURCES = [
  { id: "class-2026-27", sha256: "46a6c8794419bcbd574888c2b54cbf42c2c551894a8f6844c2233b82ea7baed5", extension: "zip" },
  { id: "system-2020", sha256: "0c00ebf519d0a727c569001b3f3840fb04b1040a726fa3d2cb36a9120f005761", extension: "zip" },
  ...POWERPOINT_SOURCES.map((source) => ({ id: source.id, sha256: source.sha256, extension: "pptx" as const }))
] as const;

export type Pilot2Lesson = {
  id: string;
  order: number;
  chapter: 11 | 12 | 13;
  title: string;
  requiredMinutes: number;
  optionalMinutes: number;
  coreFocus: string;
  sourceSlides: string;
  teacherSourceId: string;
  textbook: { printedPages: number[]; recommendedPractice: string };
  outcomeIds: string[];
  conceptIds: string[];
  gate1Rendered: boolean;
};

export const PILOT_2_LESSONS: Pilot2Lesson[] = [
  {
    id: "lesson-01", order: 1, chapter: 11, title: "Neuron Structure", requiredMinutes: 80, optionalMinutes: 20,
    coreFocus: "Neurons, glia, neuron parts, myelin function, neuron roles, and an introductory reflex pathway.",
    sourceSlides: "Chapter 11 slides 1–20", teacherSourceId: "chapter-11-daily-plans",
    textbook: { printedPages: [367, 368, 369, 370, 371, 372, 384], recommendedPractice: "pp. 367–372 Q1, 2, 4–8; p. 384 Q3" },
    outcomeIds: ["A1.1k", "A1.3k", "A1.2s"], conceptIds: ["neuron-structure", "myelin-conduction", "reflex-arc"], gate1Rendered: true
  },
  {
    id: "lesson-02", order: 2, chapter: 11, title: "Action Potentials", requiredMinutes: 75, optionalMinutes: 20,
    coreFocus: "Resting potential, ion gradients, threshold, phases, all-or-none response, intensity, and refractory period.",
    sourceSlides: "Chapter 11 slides 21–30", teacherSourceId: "chapter-11-daily-plans",
    textbook: { printedPages: [374, 375, 376, 377, 384], recommendedPractice: "pp. 374–377 Q9–13; p. 384 Q4–5" },
    outcomeIds: ["A1.1k", "A1.3s"], conceptIds: ["resting-membrane-potential", "action-potential", "membrane-potential-phases", "refractory-period"], gate1Rendered: false
  },
  {
    id: "lesson-03", order: 3, chapter: 11, title: "Synaptic Transmission", requiredMinutes: 70, optionalMinutes: 20,
    coreFocus: "Define neurotransmitter before teaching the synaptic sequence, acetylcholine, norepinephrine, and cholinesterase.",
    sourceSlides: "Chapter 11 slides 31–42", teacherSourceId: "chapter-11-daily-plans",
    textbook: { printedPages: [380, 381, 382, 384], recommendedPractice: "pp. 380–382 Q14–18; p. 384 Q6" },
    outcomeIds: ["A1.1k", "A1.1sts", "A1.2sts", "A1.3sts"], conceptIds: ["synaptic-transmission"], gate1Rendered: true
  },
  {
    id: "lesson-04", order: 4, chapter: 11, title: "PNS and CNS", requiredMinutes: 65, optionalMinutes: 15,
    coreFocus: "CNS and PNS organization, nerves, somatic and autonomic control, and sympathetic and parasympathetic divisions.",
    sourceSlides: "Chapter 11 slides 43–53", teacherSourceId: "chapter-11-daily-plans",
    textbook: { printedPages: [389, 396, 397, 398, 399], recommendedPractice: "p. 389 Q19; pp. 396–399 Q28, 29, 31, 32, 2, 3" },
    outcomeIds: ["A1.2k"], conceptIds: ["central-peripheral-systems", "somatic-autonomic-systems", "sympathetic-parasympathetic"], gate1Rendered: false
  },
  {
    id: "lesson-05", order: 5, chapter: 11, title: "The Brain", requiredMinutes: 70, optionalMinutes: 25,
    coreFocus: "Required brain structures and functions, spinal cord, and evidence-based symptom localization.",
    sourceSlides: "Chapter 11 slides 54–65", teacherSourceId: "chapter-11-daily-plans",
    textbook: { printedPages: [389, 390, 391, 392, 395, 399], recommendedPractice: "pp. 389–392 Q20, 22–24; p. 395 Q1, 4; p. 399 Q1" },
    outcomeIds: ["A1.2k", "A1.1sts", "A1.3s"], conceptIds: ["central-peripheral-systems", "scientific-explanation"], gate1Rendered: false
  },
  {
    id: "lesson-06", order: 6, chapter: 12, title: "Sensory Reception", requiredMinutes: 70, optionalMinutes: 15,
    coreFocus: "Transduction, adaptation, receptor classes, taste, smell, skin sensation, and proprioception.",
    sourceSlides: "Chapter 12 slides 1–11", teacherSourceId: "chapter-12-daily-plans",
    textbook: { printedPages: [406, 407, 408, 409, 426, 427, 428, 429], recommendedPractice: "pp. 406–409 Q1–3, 5–6 and Q1–4; pp. 426–429 Q26–30" },
    outcomeIds: ["A1.6k", "A1.1s", "A1.2s", "A1.3s", "A1.4s"], conceptIds: ["sensory-transduction", "sensory-receptor-classes", "sensory-adaptation"], gate1Rendered: false
  },
  {
    id: "lesson-07", order: 7, chapter: 12, title: "Photoreception and the Eye", requiredMinutes: 75, optionalMinutes: 20,
    coreFocus: "Required eye anatomy, light pathway, retina, rods, cones, fovea, and optic nerve.",
    sourceSlides: "Chapter 12 slides 12–21", teacherSourceId: "chapter-12-daily-plans",
    textbook: { printedPages: [412, 413, 414, 415, 416, 418], recommendedPractice: "pp. 412–416 Q7, 8, 10, 12–16; p. 418 Q1–5" },
    outcomeIds: ["A1.4k", "A1.2s", "A1.3s", "A1.3sts"], conceptIds: ["sensory-transduction", "vision-pathway"], gate1Rendered: false
  },
  {
    id: "lesson-08", order: 8, chapter: 12, title: "Hearing and Balance", requiredMinutes: 75, optionalMinutes: 20,
    coreFocus: "Required ear anatomy, sound transduction, equilibrium, and Eustachian-tube function.",
    sourceSlides: "Chapter 12 slides 22–29", teacherSourceId: "chapter-12-daily-plans",
    textbook: { printedPages: [421, 422, 423, 424, 425, 429], recommendedPractice: "pp. 421–425 Q18–20, 23; p. 429 Q1–4" },
    outcomeIds: ["A1.5k", "A1.2s", "A1.3s", "A1.3sts"], conceptIds: ["sensory-transduction", "hearing-equilibrium-pathway"], gate1Rendered: false
  },
  {
    id: "lesson-09", order: 9, chapter: 13, title: "Homeostasis", requiredMinutes: 70, optionalMinutes: 15,
    coreFocus: "Dynamic homeostasis, nervous and endocrine comparison, feedback, target cells, and principal glands.",
    sourceSlides: "Chapter 13 slides 1–13", teacherSourceId: "chapter-13-daily-plans",
    textbook: { printedPages: [437, 438, 439, 440, 441, 442], recommendedPractice: "pp. 437–441 Q1, 2, 7, 8; p. 442 Q1, 2, 4" },
    outcomeIds: ["A2.1k", "A2.2k", "A2.4k", "A2.5k"], conceptIds: ["homeostasis", "regulated-variable-set-point", "control-system-roles", "negative-feedback", "endocrine-signalling"], gate1Rendered: false
  },
  {
    id: "lesson-10", order: 10, chapter: 13, title: "Pituitary Hormones Part 1", requiredMinutes: 70, optionalMinutes: 15,
    coreFocus: "Hypothalamus-pituitary relationship, tropic hormones, and human growth hormone.",
    sourceSlides: "Chapter 13 slides 13–19, with noncurricular hormones excluded", teacherSourceId: "chapter-13-daily-plans",
    textbook: { printedPages: [442, 444, 445, 446], recommendedPractice: "p. 442 Q10–12 and Q3; p. 446 Q13–14" },
    outcomeIds: ["A2.1k", "A2.2k", "A2.3k", "A2.6k"], conceptIds: ["hypothalamus-pituitary-axis", "endocrine-signalling"], gate1Rendered: false
  },
  {
    id: "lesson-11", order: 11, chapter: 13, title: "Pituitary Hormones Part 2", requiredMinutes: 70, optionalMinutes: 15,
    coreFocus: "ADH, water balance, hormone source-target-effect reasoning, and imbalances.",
    sourceSlides: "Chapter 13 slides 20–24, with oxytocin excluded as out of Unit A", teacherSourceId: "chapter-13-daily-plans",
    textbook: { printedPages: [442, 444, 445, 446], recommendedPractice: "p. 442 Q10–12 and Q3; p. 446 Q13–14" },
    outcomeIds: ["A2.1k", "A2.2k", "A2.3k", "A2.4k", "A2.6k", "A2.2s", "A2.3s"], conceptIds: ["hypothalamus-pituitary-axis", "water-salt-regulation"], gate1Rendered: false
  },
  {
    id: "lesson-12", order: 12, chapter: 13, title: "Thyroid and Parathyroid Glands", requiredMinutes: 75, optionalMinutes: 20,
    coreFocus: "TSH and thyroxine, metabolism, PTH and calcitonin, and calcium feedback.",
    sourceSlides: "Chapter 13 slides 25–32", teacherSourceId: "chapter-13-daily-plans",
    textbook: { printedPages: [449, 450], recommendedPractice: "pp. 449–450 Q15–17, 2, 4, 5" },
    outcomeIds: ["A2.1k", "A2.2k", "A2.3k", "A2.4k", "A2.6k", "A2.3s"], conceptIds: ["thyroid-calcium-feedback", "antagonistic-hormones", "negative-feedback"], gate1Rendered: false
  },
  {
    id: "lesson-13", order: 13, chapter: 13, title: "Pancreas and Adrenal Glands", requiredMinutes: 95, optionalMinutes: 25,
    coreFocus: "Insulin and glucagon, diabetes, cortisol, epinephrine, aldosterone, stress, and salt balance.",
    sourceSlides: "Chapter 13 slides 33–41", teacherSourceId: "chapter-13-daily-plans",
    textbook: { printedPages: [453, 454, 455, 456, 457, 458, 459, 460, 461, 462], recommendedPractice: "pp. 453–455 Q18–23, 1, 2; use pp. 456–462 for pancreas and diabetes follow-up" },
    outcomeIds: ["A2.1k", "A2.2k", "A2.3k", "A2.5k", "A2.6k", "A2.1s", "A2.2s", "A2.3s", "A2.4s"], conceptIds: ["antagonistic-hormones", "blood-glucose-regulation", "water-salt-regulation", "stress-response"], gate1Rendered: true
  }
];

export const PILOT_2_REVIEW_ROUTES = [
  { id: "chapter-11-practice", title: "Chapter 11 Practice", requiredMinutes: 100, optionalMinutes: 0, requiredItemCount: 12, chapter: 11 },
  { id: "chapter-12-practice", title: "Chapter 12 Practice", requiredMinutes: 85, optionalMinutes: 0, requiredItemCount: 12, chapter: 12 },
  { id: "chapter-13-practice", title: "Chapter 13 Practice", requiredMinutes: 100, optionalMinutes: 0, requiredItemCount: 12, chapter: 13 },
  { id: "review-seminar", title: "Review Seminar", requiredMinutes: 180, optionalMinutes: 20, requiredItemCount: 0, chapter: null },
  { id: "final-practice", title: "Final Practice", requiredMinutes: 80, optionalMinutes: 30, requiredItemCount: 18, optionalItemCount: 6, chapter: null }
] as const;

export const REQUIRED_MINUTES = PILOT_2_LESSONS.reduce((sum, lesson) => sum + lesson.requiredMinutes, 0)
  + PILOT_2_REVIEW_ROUTES.reduce((sum, route) => sum + route.requiredMinutes, 0);
export const OPTIONAL_MINUTES = PILOT_2_LESSONS.reduce((sum, lesson) => sum + lesson.optionalMinutes, 0)
  + PILOT_2_REVIEW_ROUTES.reduce((sum, route) => sum + route.optionalMinutes, 0);

export const OUTCOME_ROUTE_MAP: Record<string, string[]> = {
  "A1.1k": ["lesson-01", "lesson-02", "lesson-03"],
  "A1.2k": ["lesson-04", "lesson-05"],
  "A1.3k": ["lesson-01"],
  "A1.4k": ["lesson-07"],
  "A1.5k": ["lesson-08"],
  "A1.6k": ["lesson-06"],
  "A1.1sts": ["lesson-03", "lesson-05", "lesson-06", "review-seminar"],
  "A1.2sts": ["lesson-03", "lesson-06", "review-seminar"],
  "A1.3sts": ["lesson-03", "lesson-07", "lesson-08", "review-seminar"],
  "A1.1s": ["lesson-06", "process-collection"],
  "A1.2s": ["lesson-01", "lesson-06", "lesson-07", "lesson-08", "process-collection"],
  "A1.3s": ["lesson-02", "lesson-05", "lesson-06", "lesson-07", "lesson-08", "chapter-11-practice", "chapter-12-practice"],
  "A1.4s": ["process-collection", "review-seminar"],
  "A2.1k": ["lesson-09", "lesson-10", "lesson-11", "lesson-12", "lesson-13"],
  "A2.2k": ["lesson-09", "lesson-10", "lesson-11", "lesson-12", "lesson-13"],
  "A2.3k": ["lesson-10", "lesson-11", "lesson-12", "lesson-13"],
  "A2.4k": ["lesson-09", "lesson-11", "lesson-12", "lesson-13"],
  "A2.5k": ["lesson-09", "lesson-13", "review-seminar"],
  "A2.6k": ["lesson-10", "lesson-11", "lesson-12", "lesson-13"],
  "A2.1sts": ["lesson-13", "review-seminar"],
  "A2.2sts": ["lesson-13", "review-seminar"],
  "A2.1s": ["lesson-13", "process-collection"],
  "A2.2s": ["lesson-11", "lesson-13", "process-collection"],
  "A2.3s": ["lesson-10", "lesson-11", "lesson-12", "lesson-13", "chapter-13-practice"],
  "A2.4s": ["process-collection", "review-seminar"]
};

type BehaviourSeed = { outcomeId: string; page: number; texts: string[] };

const PERFORMANCE_BEHAVIOUR_SEEDS: BehaviourSeed[] = [
  { outcomeId: "A1.1k", page: 6, texts: [
    "Identify the cell body, dendrites, axon, Schwann cell, myelin sheath, node of Ranvier, and axon terminal on a diagram and describe their functions.",
    "Explain the relationship between the myelin sheath and nerve-impulse transmission.",
    "Compare the functions of sensory neurons, motor neurons, and interneurons.",
    "Distinguish a sensory neuron, motor neuron, and interneuron on a diagram.",
    "Use a microscope and prepared slides to observe neurons and synapses.",
    "Define action potential and refractory period.",
    "Label resting potential, depolarization, threshold, and refractory period on an action-potential graph.",
    "Describe sodium and potassium movement during establishment of resting membrane potential.",
    "Describe action-potential formation and transmission through sodium and potassium movement during depolarization, repolarization, and the refractory period.",
    "Describe the all-or-none response and threshold potential of a nerve impulse.",
    "Describe a synapse and explain how acetylcholine or norepinephrine transmits a signal across it.",
    "Describe cholinesterase's role in regulating synaptic transmission.",
    "Given symptoms of a neuron disorder, predict which neuron structures could be affected."
  ] },
  { outcomeId: "A1.2k", page: 7, texts: [
    "Outline the basic organization of the nervous system, including the CNS and PNS.",
    "Relate myelinated and unmyelinated nerve fibres to white and grey matter in the CNS.",
    "List physiological effects of sympathetic and parasympathetic pathways.",
    "Describe the function of the somatic nervous system.",
    "Perform an experimental procedure to investigate receptor types in the sensory-somatic nervous system.",
    "Explain the homeostatic function of the autonomic nervous system and compare sympathetic and parasympathetic roles.",
    "Identify the cerebrum and its lobes, cerebellum, pons, medulla oblongata, hypothalamus, and spinal cord on a diagram and describe their functions.",
    "Observe and identify major mammalian brain structures using a model, dissection, or computer simulation.",
    "Given symptoms of a brain disorder, predict which brain structures could be affected."
  ] },
  { outcomeId: "A1.3k", page: 7, texts: [
    "Describe the elements of a reflex arc, their functions, and how they work together to generate a reflex.",
    "Label the components of a reflex arc on a diagram.",
    "Follow a procedure to investigate a reflex.",
    "Design an experiment to investigate a reflex."
  ] },
  { outcomeId: "A1.4k", page: 8, texts: [
    "Identify the sclera, cornea, iris, pupil, lens, choroid, retina, rods, cones, fovea centralis, and optic nerve.",
    "Observe and identify major mammalian eye structures using a model, dissection, or computer simulation.",
    "Describe the functions of the required human-eye structures.",
    "Follow a procedure to investigate visual discrimination.",
    "Trace the pathway of light from the eye to the area of the brain where light stimuli are interpreted."
  ] },
  { outcomeId: "A1.5k", page: 8, texts: [
    "Identify the pinna, auditory canal, tympanum, ossicles, cochlea, organ of Corti, auditory nerve, semicircular canals, and Eustachian tube.",
    "Observe and identify major mammalian ear structures using a model, dissection, or computer simulation.",
    "Describe the functions of the required human-ear structures.",
    "Follow a safe procedure to investigate the ability to hear a range of sounds.",
    "Trace the pathway of sound from the ear to the area of the brain where sound stimuli are interpreted."
  ] },
  { outcomeId: "A1.6k", page: 8, texts: [
    "Identify other ways humans sense their environment and spatial orientation.",
    "Identify manipulated, responding, and controlled variables in a sensory experimental design."
  ] },
  { outcomeId: "A2.1k", page: 9, texts: [
    "Identify the hypothalamus, pituitary, thyroid, parathyroids, adrenal glands, and pancreatic islet cells in diagrams and models.",
    "Identify the glands that secrete TSH, thyroxine, calcitonin, PTH, ACTH, cortisol, insulin, glucagon, hGH, ADH, epinephrine, and aldosterone."
  ] },
  { outcomeId: "A2.2k", page: 9, texts: [
    "Describe the functions of TSH, thyroxine, calcitonin, PTH, ACTH, cortisol, insulin, glucagon, hGH, ADH, epinephrine, and aldosterone.",
    "Describe how the required hormones maintain homeostasis through negative feedback."
  ] },
  { outcomeId: "A2.3k", page: 9, texts: [
    "Describe the roles of thyroxine in metabolism; insulin, glucagon, and cortisol in glucose metabolism; hGH in growth; ADH in water regulation; aldosterone in sodium regulation; and PTH and calcitonin in calcium regulation.",
    "Compare the metabolic roles of cortisol and epinephrine, and of calcitonin and PTH.",
    "Use a hypothesis to explain how hormones other than insulin and glucagon could affect glucose metabolism."
  ] },
  { outcomeId: "A2.4k", page: 9, texts: [
    "Use a specific example to explain how the endocrine system senses the internal environment and responds appropriately."
  ] },
  { outcomeId: "A2.5k", page: 10, texts: [
    "Differentiate between short-term and long-term stress responses.",
    "Relate the short-term stress response, norepinephrine, and adrenal glands to the sympathetic nervous system."
  ] },
  { outcomeId: "A2.6k", page: 10, texts: [
    "Describe physiological consequences of hormone imbalance in diabetes mellitus.",
    "Describe physiological consequences of imbalances in the required Unit A hormones.",
    "Identify manipulated, responding, and controlled variables in an endocrine experimental design.",
    "Formulate a hypothesis from published data about environmental influences on the endocrine system."
  ] },
  { outcomeId: "A1.4s", page: 5, texts: [
    "Use collaboration, teamwork, and scientific communication while developing and assessing explanations and results."
  ] }
];

const BEHAVIOUR_ROUTE_OVERRIDES: Record<string, string> = {
  "A1.1k-01": "lesson-01", "A1.1k-02": "lesson-01", "A1.1k-03": "lesson-01", "A1.1k-04": "lesson-01", "A1.1k-05": "process-collection",
  "A1.1k-06": "lesson-02", "A1.1k-07": "lesson-02", "A1.1k-08": "lesson-02", "A1.1k-09": "lesson-02", "A1.1k-10": "lesson-02",
  "A1.1k-11": "lesson-03", "A1.1k-12": "lesson-03", "A1.1k-13": "lesson-01",
  "A1.2k-01": "lesson-04", "A1.2k-02": "lesson-04", "A1.2k-03": "lesson-04", "A1.2k-04": "lesson-04", "A1.2k-05": "process-collection",
  "A1.2k-06": "lesson-04", "A1.2k-07": "lesson-05", "A1.2k-08": "lesson-05", "A1.2k-09": "lesson-05",
  "A1.3k-01": "lesson-01", "A1.3k-02": "lesson-01", "A1.3k-03": "process-collection", "A1.3k-04": "process-collection",
  "A2.1k-01": "lesson-09", "A2.1k-02": "lesson-10",
  "A2.2k-01": "lesson-10", "A2.2k-02": "lesson-09",
  "A2.3k-01": "lesson-13", "A2.3k-02": "lesson-13", "A2.3k-03": "lesson-13",
  "A2.4k-01": "lesson-09", "A2.5k-01": "lesson-13", "A2.5k-02": "lesson-13",
  "A2.6k-01": "lesson-13", "A2.6k-02": "lesson-13", "A2.6k-03": "process-collection", "A2.6k-04": "process-collection",
  "A1.4s-01": "process-collection"
};

export const EXCELLENCE_BEHAVIOUR_IDS = ["A1.3k-04", "A2.3k-02", "A2.3k-03", "A2.5k-02", "A2.6k-04"] as const;
export const LOCAL_COMMUNICATION_BEHAVIOUR_ID = "A1.4s-01";

export function buildPerformanceBehaviours() {
  return PERFORMANCE_BEHAVIOUR_SEEDS.flatMap((seed) => seed.texts.map((text, index) => {
    const id = `${seed.outcomeId}-${String(index + 1).padStart(2, "0")}`;
    const route = BEHAVIOUR_ROUTE_OVERRIDES[id] ?? OUTCOME_ROUTE_MAP[seed.outcomeId]?.[0];
    if (!route) throw new Error(`No Pilot 2 route for performance behaviour ${id}.`);
    const chapterPractice = seed.outcomeId.startsWith("A1.4") || seed.outcomeId.startsWith("A1.5") || seed.outcomeId.startsWith("A1.6")
      ? "chapter-12-practice"
      : seed.outcomeId.startsWith("A1") ? "chapter-11-practice" : "chapter-13-practice";
    return {
      id,
      outcomeId: seed.outcomeId,
      standard: id === LOCAL_COMMUNICATION_BEHAVIOUR_ID ? "local-curriculum-criterion" : (EXCELLENCE_BEHAVIOUR_IDS as readonly string[]).includes(id) ? "excellence" : "acceptable",
      sourceKind: id === LOCAL_COMMUNICATION_BEHAVIOUR_ID ? "locally-authored-curriculum-paraphrase" : "official-performance-example",
      authorityColumn: id === LOCAL_COMMUNICATION_BEHAVIOUR_ID ? null : (EXCELLENCE_BEHAVIOUR_IDS as readonly string[]).includes(id) ? "right-excellence" : "left-acceptable",
      sourceScope: "Illustrative, non-exhaustive performance examples; the Program of Studies controls required outcomes. This record does not itself prove learner performance.",
      text,
      authorityUrl: id === LOCAL_COMMUNICATION_BEHAVIOUR_ID ? "https://education.alberta.ca/media/159727/bio203007.pdf" : "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf",
      authorityPdfPage: id === LOCAL_COMMUNICATION_BEHAVIOUR_ID ? 53 : seed.page,
      teachRoute: route,
      visualOrModelRoute: route === "process-collection" ? "model-lab" : `${route}#visual`,
      workedExampleRoute: route === "process-collection" ? "review-seminar#worked-example" : `${route}#worked-example`,
      practiceRoute: chapterPractice,
      evidenceRoute: route === "process-collection" ? "process-collection" : `${route}#evidence-slip`
    };
  }));
}

export const TEACHER_PLAN_ROWS = [
  { id: "ch11-day-1", sourceId: "chapter-11-daily-plans", row: 2, day: "1", topic: "Neuron Structure", sourceRange: "Chapter 11 slides 1–20", textbook: "pp. 367–372 and 384", destinationRoutes: ["lesson-01"], treatment: "core-rewrite" },
  { id: "ch11-day-2", sourceId: "chapter-11-daily-plans", row: 3, day: "2", topic: "Action Potentials", sourceRange: "Chapter 11 slides 21–30", textbook: "pp. 374–377 and 384", destinationRoutes: ["lesson-02"], treatment: "core-rewrite" },
  { id: "ch11-day-3", sourceId: "chapter-11-daily-plans", row: 4, day: "3", topic: "Synaptic Transmission", sourceRange: "Chapter 11 slides 31–42", textbook: "pp. 380–382 and 384", destinationRoutes: ["lesson-03"], treatment: "core-rewrite" },
  { id: "ch11-day-4", sourceId: "chapter-11-daily-plans", row: 5, day: "4", topic: "PNS and CNS", sourceRange: "Chapter 11 slides 43–53", textbook: "pp. 389 and 396–399", destinationRoutes: ["lesson-04"], treatment: "core-rewrite" },
  { id: "ch11-day-5", sourceId: "chapter-11-daily-plans", row: 6, day: "5", topic: "The Brain", sourceRange: "Chapter 11 slides 54–65", textbook: "pp. 389–395 and 399", destinationRoutes: ["lesson-05"], treatment: "core-rewrite" },
  { id: "ch11-days-6-7", sourceId: "chapter-11-daily-plans", row: 7, day: "6–7", topic: "Chapter 11 review", sourceRange: "Chapter 11 slide 66", textbook: "pp. 402–403", destinationRoutes: ["chapter-11-practice"], treatment: "move-to-review", exclusion: "Secure chapter quiz and key are excluded." },
  { id: "ch12-day-8", sourceId: "chapter-12-daily-plans", row: 2, day: "8", topic: "Sensory Reception", sourceRange: "Chapter 12 slides 1–11", textbook: "pp. 406–409 and 426–429", destinationRoutes: ["lesson-06"], treatment: "core-rewrite" },
  { id: "ch12-day-9", sourceId: "chapter-12-daily-plans", row: 3, day: "9", topic: "Photoreception and the Eye", sourceRange: "Chapter 12 slides 12–21", textbook: "pp. 412–418", destinationRoutes: ["lesson-07"], treatment: "core-rewrite" },
  { id: "ch12-day-10", sourceId: "chapter-12-daily-plans", row: 4, day: "10", topic: "Hearing and Balance", sourceRange: "Chapter 12 slides 22–29", textbook: "pp. 421–425 and 429", destinationRoutes: ["lesson-08"], treatment: "core-rewrite", correction: "The deck has 29 slides; the source plan's slide 30 endpoint is corrected to slide 29." },
  { id: "ch12-days-11-12", sourceId: "chapter-12-daily-plans", row: 5, day: "11–12", topic: "Chapter 12 review", sourceRange: null, textbook: "pp. 432–433", destinationRoutes: ["chapter-12-practice"], treatment: "move-to-review", correction: "The source plan's Chapter 11 page reference is corrected to Chapter 12 pp. 432–433.", exclusion: "Secure chapter quiz and key are excluded." },
  { id: "ch13-day-13", sourceId: "chapter-13-daily-plans", row: 2, day: "13", topic: "Homeostasis", sourceRange: "Chapter 13 slides 1–13", textbook: "pp. 437–442", destinationRoutes: ["lesson-09"], treatment: "core-rewrite" },
  { id: "ch13-day-14", sourceId: "chapter-13-daily-plans", row: 3, day: "14", topic: "Pituitary Hormones Part 1", sourceRange: "Chapter 13 slides 13–19", textbook: "pp. 442–446", destinationRoutes: ["lesson-10"], treatment: "core-rewrite", correction: "Slides 12–24 are divided by concept rather than taught twice; out-of-unit pituitary hormones are excluded." },
  { id: "ch13-day-15", sourceId: "chapter-13-daily-plans", row: 4, day: "15", topic: "Pituitary Hormones Part 2", sourceRange: "Chapter 13 slides 20–24", textbook: "pp. 442–446", destinationRoutes: ["lesson-11"], treatment: "core-rewrite", correction: "Slides 12–24 are divided by concept rather than taught twice; oxytocin is excluded from required Unit A instruction." },
  { id: "ch13-day-16", sourceId: "chapter-13-daily-plans", row: 5, day: "16", topic: "Thyroid and Parathyroid Glands", sourceRange: "Chapter 13 slides 25–32", textbook: "pp. 449–450", destinationRoutes: ["lesson-12"], treatment: "core-rewrite" },
  { id: "ch13-day-17", sourceId: "chapter-13-daily-plans", row: 6, day: "17", topic: "Pancreas and Adrenal Glands", sourceRange: "Chapter 13 slides 33–41", textbook: "pp. 453–462", destinationRoutes: ["lesson-13"], treatment: "core-rewrite" },
  { id: "ch13-days-18-19", sourceId: "chapter-13-daily-plans", row: 7, day: "18–19", topic: "Chapter 13 review", sourceRange: "Chapter 13 slides 42–43", textbook: "pp. 464–465", destinationRoutes: ["chapter-13-practice"], treatment: "move-to-review", exclusion: "Secure chapter quiz and key are excluded." },
  { id: "unit-a-days-20-23", sourceId: "unit-a-review-plan", row: 2, day: "20–23", topic: "Unit A Review", sourceRange: "Review Seminar source", textbook: "Unit 5 review at actual printed pp. 468–471", destinationRoutes: ["review-seminar", "final-practice"], treatment: "move-to-review", correction: "The source plan's pp. 466–469 label is corrected to the actual review on pp. 468–471.", exclusion: "External credentials, secure exam access, prior secure quizzes, and teacher-only keys are excluded." }
] as const;

function dispositionForSlide(deckId: string, slideNumber: number) {
  if (deckId === "chapter-11-notes") {
    if (slideNumber <= 4) return { treatment: "exclude-duplicate", destinations: [], reason: "Presentation title, index, or teacher-facing outcome framing is replaced by the course overview and lesson goals." };
    if (slideNumber >= 7 && slideNumber <= 20) return { treatment: slideNumber === 14 || slideNumber === 16 ? "advanced-rewrite" : "core-rewrite", destinations: ["lesson-01"], reason: slideNumber === 14 ? "The multiple-sclerosis claims require current, non-diagnostic correction." : slideNumber === 16 ? "Morphology examples are useful extension material but are not required neuron-role knowledge." : "Re-authored in prerequisite order for Neuron Structure." };
    if (slideNumber === 5 || slideNumber === 6) return { treatment: "reference-only", destinations: ["lesson-01"], reason: "Overview/video reference supports the topic but does not control the lesson explanation." };
    if (slideNumber >= 21 && slideNumber <= 30) return { treatment: "core-rewrite", destinations: ["lesson-02"], reason: "Re-authored as the Action Potentials lesson." };
    if (slideNumber >= 31 && slideNumber <= 39) return { treatment: slideNumber >= 34 && slideNumber <= 38 ? "advanced-rewrite" : "core-rewrite", destinations: ["lesson-03"], reason: slideNumber >= 34 && slideNumber <= 38 ? "Excitatory/inhibitory signalling and summation are optional depth after the required synaptic sequence." : "Re-authored after defining neurotransmitter and synapse." };
    if (slideNumber >= 40 && slideNumber <= 42) return { treatment: "advanced-rewrite", destinations: ["lesson-03"], reason: "Drug and toxin mechanisms remain optional, corrected, and non-diagnostic." };
    if (slideNumber >= 43 && slideNumber <= 53) return { treatment: "core-rewrite", destinations: ["lesson-04"], reason: "Re-authored as PNS and CNS organization; self-help media remains excluded by the media contract." };
    if (slideNumber >= 54 && slideNumber <= 62) return { treatment: "core-rewrite", destinations: ["lesson-05"], reason: "Re-authored as required brain and spinal-cord structure and function." };
    if (slideNumber === 63 || slideNumber === 65) return { treatment: "exclude-noncurricular", destinations: [], reason: "The source topic is outside the Unit A instructional focus." };
    if (slideNumber === 64) return { treatment: "advanced-rewrite", destinations: ["lesson-05"], reason: "Brain-disorder evidence is optional and must avoid diagnosis or neuromyths." };
    return { treatment: "move-to-review", destinations: ["chapter-11-practice"], reason: "Recap content is represented by aligned non-graded practice; unavailable media is not delivered." };
  }
  if (deckId === "chapter-12-notes") {
    if (slideNumber <= 2) return { treatment: "exclude-duplicate", destinations: [], reason: "Presentation title or index is replaced by course navigation." };
    if (slideNumber <= 11) return { treatment: "core-rewrite", destinations: ["lesson-06"], reason: "Re-authored as Sensory Reception." };
    if (slideNumber <= 21) return { treatment: "core-rewrite", destinations: ["lesson-07"], reason: "Re-authored as Photoreception and the Eye; inaccurate image-flipping language is prohibited." };
    return { treatment: "core-rewrite", destinations: ["lesson-08"], reason: "Re-authored as Hearing and Balance with safe, non-diagnostic treatment." };
  }
  if (slideNumber <= 2) return { treatment: "exclude-duplicate", destinations: [], reason: "Presentation title or index is replaced by course navigation." };
  if (slideNumber <= 11) return { treatment: "core-rewrite", destinations: ["lesson-09"], reason: "Re-authored as dynamic homeostasis and endocrine signalling." };
  if (slideNumber === 12) return { treatment: "exclude-noncurricular", destinations: [], reason: "Teacher study directions and study-skills videos are outside the Unit A learning content." };
  if (slideNumber <= 17) return { treatment: "core-rewrite", destinations: ["lesson-10"], reason: "Re-authored as the hypothalamus-pituitary relationship and hGH." };
  if (slideNumber === 18 || slideNumber === 23) return { treatment: "exclude-noncurricular", destinations: [], reason: "Prolactin, FSH, LH, and oxytocin are not required Unit A pituitary content." };
  if (slideNumber === 19) return { treatment: "core-rewrite", destinations: ["lesson-10", "lesson-12", "lesson-13"], reason: "TSH and ACTH are introduced as links to their target-gland lessons." };
  if (slideNumber <= 24) return { treatment: "core-rewrite", destinations: ["lesson-11"], reason: slideNumber === 21 ? "The caffeine/ADH oversimplification is corrected; the required mechanism remains local." : "Re-authored as ADH, water balance, and source-target-effect reasoning." };
  if (slideNumber <= 32) return { treatment: "core-rewrite", destinations: ["lesson-12"], reason: "Re-authored as thyroid, parathyroid, metabolism, and calcium feedback." };
  if (slideNumber <= 41) return { treatment: "core-rewrite", destinations: ["lesson-13"], reason: slideNumber === 37 ? "Outdated and single-cause diabetes language is corrected using current authoritative health information." : "Re-authored as pancreas and adrenal control." };
  return { treatment: "move-to-review", destinations: ["chapter-13-practice", "review-seminar"], reason: "Reviewed media supports optional recap; secure quizzes remain excluded." };
}

export function buildSlideDispositions() {
  return POWERPOINT_SOURCES.flatMap((deck) => Array.from({ length: deck.slideCount }, (_value, index) => {
    const slideNumber = index + 1;
    return { deckId: deck.id, slideNumber, ...dispositionForSlide(deck.id, slideNumber) };
  }));
}

export const PILOT_1_ROUTE_MAP: Record<string, { destinations: string[]; treatment: string }> = {
  overview: { destinations: ["overview"], treatment: "core-rewrite" },
  "lesson-01": { destinations: ["lesson-09"], treatment: "core-rewrite" },
  "lesson-02": { destinations: ["lesson-09"], treatment: "core-rewrite" },
  "lesson-03": { destinations: ["lesson-01"], treatment: "core-rewrite" },
  "lesson-04": { destinations: ["lesson-02"], treatment: "core-rewrite" },
  "lesson-05": { destinations: ["lesson-03"], treatment: "advanced-rewrite" },
  "lesson-06": { destinations: ["lesson-04", "lesson-05"], treatment: "core-rewrite" },
  "lesson-07": { destinations: ["lesson-01", "process-collection"], treatment: "keep-interaction" },
  "lesson-08": { destinations: ["lesson-06", "process-collection"], treatment: "keep-interaction" },
  "lesson-09": { destinations: ["lesson-07"], treatment: "core-rewrite" },
  "lesson-10": { destinations: ["lesson-08"], treatment: "core-rewrite" },
  "lesson-11": { destinations: ["lesson-06", "review-seminar"], treatment: "move-to-review" },
  "lesson-12": { destinations: ["lesson-09"], treatment: "core-rewrite" },
  "lesson-13": { destinations: ["lesson-10", "lesson-11"], treatment: "core-rewrite" },
  "lesson-14": { destinations: ["lesson-12"], treatment: "core-rewrite" },
  "lesson-15": { destinations: ["lesson-13", "process-collection"], treatment: "keep-interaction" },
  "lesson-16": { destinations: ["lesson-13"], treatment: "core-rewrite" },
  "lesson-17": { destinations: ["review-seminar", "final-practice"], treatment: "move-to-review" },
  "chapter-11-review": { destinations: ["chapter-11-practice"], treatment: "move-to-review" },
  "chapter-12-review": { destinations: ["chapter-12-practice"], treatment: "move-to-review" },
  "chapter-13-review": { destinations: ["chapter-13-practice"], treatment: "move-to-review" },
  "review-seminar": { destinations: ["review-seminar"], treatment: "move-to-review" },
  "textbook-unit-review": { destinations: ["final-practice"], treatment: "move-to-review" },
  "core-vocabulary": { destinations: ["core-vocabulary"], treatment: "keep-interaction" },
  library: { destinations: ["textbook-library"], treatment: "keep-interaction" },
  "video-library": { destinations: ["video-library"], treatment: "keep-interaction" },
  "model-lab": { destinations: ["model-lab"], treatment: "keep-interaction" },
  "investigation-notebook": { destinations: ["process-collection"], treatment: "keep-interaction" },
  "practice-hub": { destinations: ["chapter-11-practice", "chapter-12-practice", "chapter-13-practice", "final-practice"], treatment: "move-to-review" },
  "glossary-and-data": { destinations: ["glossary-and-data"], treatment: "keep-interaction" },
  "sources-and-credits": { destinations: ["sources-and-credits"], treatment: "core-rewrite" },
  "review-overview": { destinations: ["chapter-11-practice", "chapter-12-practice", "chapter-13-practice", "review-seminar", "final-practice"], treatment: "move-to-review" }
};

export const VOCABULARY_LESSON_MAP: Record<string, string[]> = {
  homeostasis: ["lesson-09", "review-seminar"],
  "regulated-variable-set-point": ["lesson-09"],
  "control-system-roles": ["lesson-09"],
  "negative-feedback": ["lesson-09", "lesson-12", "lesson-13"],
  "scientific-explanation": ["review-seminar", "final-practice"],
  "neuron-structure": ["lesson-01"],
  "myelin-conduction": ["lesson-01"],
  "resting-membrane-potential": ["lesson-02"],
  "action-potential": ["lesson-02"],
  "membrane-potential-phases": ["lesson-02"],
  "refractory-period": ["lesson-02"],
  "synaptic-transmission": ["lesson-03"],
  "central-peripheral-systems": ["lesson-04"],
  "somatic-autonomic-systems": ["lesson-04"],
  "sympathetic-parasympathetic": ["lesson-04"],
  "reflex-arc": ["lesson-01"],
  "sensory-transduction": ["lesson-06", "lesson-07", "lesson-08"],
  "sensory-receptor-classes": ["lesson-06"],
  "sensory-adaptation": ["lesson-06"],
  "vision-pathway": ["lesson-07"],
  "hearing-equilibrium-pathway": ["lesson-08"],
  "endocrine-signalling": ["lesson-09"],
  "hypothalamus-pituitary-axis": ["lesson-10", "lesson-11"],
  "antagonistic-hormones": ["lesson-12", "lesson-13"],
  "thyroid-calcium-feedback": ["lesson-12"],
  "blood-glucose-regulation": ["lesson-13"],
  "water-salt-regulation": ["lesson-11", "lesson-13"],
  "stress-response": ["lesson-13"]
};

export const FIGURE_CANDIDATES = [
  { id: "resting-membrane-potential", oldLessonId: "lesson-04", newRouteId: "lesson-02", path: "assets/generated-visuals/lesson-04-resting-membrane-1014f22e.png" },
  { id: "endocrine-body-map", oldLessonId: "lesson-12", newRouteId: "lesson-09", path: "assets/generated-visuals/lesson-12-endocrine-map-2dd61d4a.png" },
  { id: "integrated-control", oldLessonId: "lesson-01", newRouteId: "lesson-09", path: "assets/generated-visuals/selected/lesson-01-integrated-control-selected.png" },
  { id: "control-comparison", oldLessonId: "lesson-02", newRouteId: "lesson-09", path: "assets/generated-visuals/selected/lesson-02-control-comparison-selected.png" },
  { id: "neuron-roles", oldLessonId: "lesson-03", newRouteId: "lesson-01", path: "assets/generated-visuals/selected/lesson-03-neuron-roles-selected.png" },
  { id: "myelin-saltatory", oldLessonId: "lesson-03", newRouteId: "lesson-01", path: "assets/generated-visuals/selected/lesson-03-myelin-saltatory-selected.png" },
  { id: "synaptic-transmission", oldLessonId: "lesson-05", newRouteId: "lesson-03", path: "assets/generated-visuals/selected/lesson-05-synaptic-transmission-selected.png" },
  { id: "sensory-receptors", oldLessonId: "lesson-08", newRouteId: "lesson-06", path: "assets/generated-visuals/selected/lesson-08-sensory-receptor-families-selected.png" },
  { id: "retina-pathway", oldLessonId: "lesson-09", newRouteId: "lesson-07", path: "assets/generated-visuals/selected/lesson-09-retina-pathway-selected.png" },
  { id: "equilibrium", oldLessonId: "lesson-10", newRouteId: "lesson-08", path: "assets/generated-visuals/selected/lesson-10-equilibrium-selected.png" },
  { id: "stress-response", oldLessonId: "lesson-16", newRouteId: "lesson-13", path: "assets/generated-visuals/selected/lesson-16-stress-response-selected.png" },
  { id: "integrated-regulation", oldLessonId: "lesson-17", newRouteId: "final-practice", path: "assets/generated-visuals/selected/lesson-17-integrated-regulation-selected.png" }
] as const;

export type RequiredMediaCheckpoint = {
  youtubeId: string;
  routeId: Pilot2Lesson["id"];
  role: "primary" | "primary-secondary";
  topic: string;
  localSteps: Array<{ label: string; detail: string }>;
  checkpoint: {
    prompt: string;
    choices: readonly [string, string, string];
    answer: "a" | "b" | "c";
    rationale: string;
  };
};

/**
 * The video and the local walkthrough are two paths to the same required
 * sense-making checkpoint. The source media report supplies provider and URL
 * metadata; this contract supplies the course-specific teaching treatment.
 */
export const VIDEO_REMAP: RequiredMediaCheckpoint[] = [
  {
    youtubeId: "A44brRGG4Ys", routeId: "lesson-01", role: "primary", topic: "Neuron structure",
    localSteps: [
      { label: "Receive", detail: "Dendrites and the cell body receive input from receptors or other neurons." },
      { label: "Begin", detail: "The trigger region starts an action potential when the membrane reaches threshold." },
      { label: "Conduct", detail: "The axon carries the signal; myelin reduces current loss between nodes." },
      { label: "Communicate", detail: "Axon terminals pass information to the next cell at a synapse." }
    ],
    checkpoint: {
      prompt: "Which sequence follows the usual direction of information through one neuron?",
      choices: ["Axon terminal → dendrite → cell body", "Dendrite → cell body → axon → axon terminal", "Myelin → nucleus → receptor"],
      answer: "b",
      rationale: "Input usually reaches dendrites or the cell body, then an action potential travels along the axon to its terminals."
    }
  },
  {
    youtubeId: "oa6rvUJlg7o", routeId: "lesson-02", role: "primary", topic: "Action potentials",
    localSteps: [
      { label: "Rest", detail: "Ion gradients and potassium leak support a membrane voltage near −70 mV." },
      { label: "Rise", detail: "At threshold, voltage-gated sodium channels open and sodium enters." },
      { label: "Fall", detail: "Sodium channels inactivate, potassium channels open, and potassium leaves." },
      { label: "Recover", detail: "The membrane undershoots while channels reset during refractory periods." }
    ],
    checkpoint: {
      prompt: "What directly drives the steep rising phase on an action-potential graph?",
      choices: ["Sodium entering through voltage-gated channels", "Potassium entering through leak channels", "The sodium-potassium pump reversing"],
      answer: "a",
      rationale: "Rapid sodium entry makes the inside less negative and drives depolarization."
    }
  },
  {
    youtubeId: "YcJy28Nnrb8", routeId: "lesson-03", role: "primary", topic: "Synaptic transmission",
    localSteps: [
      { label: "Arrive", detail: "An action potential reaches the presynaptic terminal." },
      { label: "Release", detail: "Calcium entry causes vesicles to release neurotransmitter." },
      { label: "Bind", detail: "The messenger crosses the cleft and binds matching receptors." },
      { label: "End", detail: "Breakdown, reuptake, or diffusion limits the signal." }
    ],
    checkpoint: {
      prompt: "Which event links an arriving action potential to neurotransmitter release?",
      choices: ["Calcium enters the presynaptic terminal", "Myelin crosses the synaptic cleft", "The postsynaptic nucleus divides"],
      answer: "a",
      rationale: "Voltage-gated calcium channels open in the terminal, and calcium entry triggers vesicle fusion."
    }
  },
  {
    youtubeId: "QY9NTVh-Awo", routeId: "lesson-04", role: "primary", topic: "Peripheral nervous system",
    localSteps: [
      { label: "Sense", detail: "Afferent pathways carry information from receptors toward the CNS." },
      { label: "Process", detail: "The brain and spinal cord integrate information." },
      { label: "Command", detail: "Efferent pathways carry motor information away from the CNS." },
      { label: "Act", detail: "Somatic or autonomic effectors produce a response." }
    ],
    checkpoint: {
      prompt: "Which pathway carries a command from the CNS toward an effector?",
      choices: ["Afferent sensory", "Efferent motor", "Endocrine receptor"],
      answer: "b",
      rationale: "Efferent motor pathways exit the CNS and carry commands toward muscles or glands."
    }
  },
  {
    youtubeId: "0-8PvNOdByc", routeId: "lesson-05", role: "primary", topic: "Major brain structures",
    localSteps: [
      { label: "Cerebrum", detail: "Connected cortical regions support perception, planning, language, memory, and voluntary movement." },
      { label: "Cerebellum", detail: "This region adjusts the timing and coordination of movement and balance." },
      { label: "Brainstem", detail: "The midbrain, pons, and medulla connect pathways and support vital functions." },
      { label: "Integration", detail: "The thalamus, hypothalamus, spinal cord, and cortex work through connected networks." }
    ],
    checkpoint: {
      prompt: "Which conclusion best fits evidence of poor movement timing and balance?",
      choices: ["The cerebellum may be involved, but the evidence is not diagnostic", "Only the frontal lobe can be involved", "The endocrine system must be the only cause"],
      answer: "a",
      rationale: "The cerebellum contributes to coordination, but one symptom cannot prove one location or diagnosis."
    }
  },
  {
    youtubeId: "qPix_X-9t7E", routeId: "lesson-06", role: "primary", topic: "Sensory input and processing",
    localSteps: [
      { label: "Stimulus", detail: "Light, force, chemicals, or temperature change reaches a receptor." },
      { label: "Transduce", detail: "The receptor converts that stimulus into an electrical change." },
      { label: "Signal", detail: "Sensory neurons carry a coded pattern toward the CNS." },
      { label: "Perceive", detail: "CNS processing gives the pattern meaning in context." }
    ],
    checkpoint: {
      prompt: "What is sensory transduction?",
      choices: ["Converting stimulus energy into an electrical receptor change", "Moving a hormone through blood", "Turning every signal into a reflex"],
      answer: "a",
      rationale: "Transduction is the conversion that begins sensory signalling at a receptor."
    }
  },
  {
    youtubeId: "o0DYP-u1rNM", routeId: "lesson-07", role: "primary", topic: "Vision",
    localSteps: [
      { label: "Focus", detail: "The cornea and lens bend light toward the retina." },
      { label: "Transduce", detail: "Rods and cones change their signalling in response to light." },
      { label: "Process", detail: "Retinal circuits compare and organize the changing pattern." },
      { label: "Transmit", detail: "Ganglion-cell axons carry output through the optic nerve to the brain." }
    ],
    checkpoint: {
      prompt: "Which statement correctly separates optics from neural processing?",
      choices: ["The cornea and lens focus light; the retina and brain process neural signals", "The optic nerve focuses light", "The brain simply flips a complete picture"],
      answer: "a",
      rationale: "Focusing occurs in the eye's optical structures, while the retina and brain transform and interpret neural patterns."
    }
  },
  {
    youtubeId: "Ie2j7GpC4JU", routeId: "lesson-08", role: "primary", topic: "Hearing and balance",
    localSteps: [
      { label: "Collect", detail: "The pinna and auditory canal direct pressure waves to the tympanum." },
      { label: "Transfer", detail: "Ossicles pass vibration to the oval window and cochlear fluid." },
      { label: "Transduce", detail: "Bending cochlear hair cells changes signalling in the auditory nerve." },
      { label: "Balance", detail: "Vestibular hair cells respond to head motion and position." }
    ],
    checkpoint: {
      prompt: "Where is mechanical vibration converted into a neural signal for hearing?",
      choices: ["At cochlear hair cells in the organ of Corti", "At the pinna only", "Inside the Eustachian tube"],
      answer: "a",
      rationale: "Movement in the cochlea bends hair cells, beginning neural signalling in the auditory pathway."
    }
  },
  {
    youtubeId: "eWHH9je2zG4", routeId: "lesson-09", role: "primary", topic: "Endocrine signalling",
    localSteps: [
      { label: "Release", detail: "An endocrine gland releases a hormone into the blood." },
      { label: "Transport", detail: "Blood carries the hormone widely through the body." },
      { label: "Recognize", detail: "Only cells with a compatible receptor can detect the signal." },
      { label: "Respond", detail: "Receptor-bearing target cells change activity and help regulate a variable." }
    ],
    checkpoint: {
      prompt: "Why can a hormone travel widely but affect only some cells?",
      choices: ["Only target cells have compatible receptors and response machinery", "Hormones never enter the blood", "Every cell always responds identically"],
      answer: "a",
      rationale: "A target response requires a compatible receptor and the cell machinery that acts on that signal."
    }
  },
  {
    youtubeId: "QHkGG4TimvQ", routeId: "lesson-10", role: "primary", topic: "Anterior pituitary pathways",
    localSteps: [
      { label: "Hypothalamus", detail: "A releasing hormone enters portal blood." },
      { label: "Anterior pituitary", detail: "Pituitary cells release hGH or a tropic hormone." },
      { label: "Target", detail: "A tissue or endocrine gland with matching receptors responds." },
      { label: "Feedback", detail: "Target signals can reduce further hypothalamic and pituitary stimulation." }
    ],
    checkpoint: {
      prompt: "What makes TSH a tropic hormone?",
      choices: ["It acts mainly on another endocrine gland", "It is stored in myelin", "It crosses a synapse as acetylcholine"],
      answer: "a",
      rationale: "TSH is tropic because its main target is the thyroid gland."
    }
  },
  {
    youtubeId: "BYaR-JgbjCs", routeId: "lesson-11", role: "primary", topic: "Posterior pituitary and ADH",
    localSteps: [
      { label: "Detect", detail: "Hypothalamic osmoreceptors respond when body fluids become more concentrated." },
      { label: "Make", detail: "Hypothalamic neurons produce ADH." },
      { label: "Release", detail: "Axons carry ADH to the posterior pituitary, which releases it into blood." },
      { label: "Conserve", detail: "Kidney collecting ducts reabsorb more water, reducing urine volume." }
    ],
    checkpoint: {
      prompt: "Which statement correctly separates where ADH is made and released?",
      choices: ["Made in the hypothalamus; released through the posterior pituitary", "Made in the posterior pituitary; released by the thyroid", "Made in the kidney; released by the pancreas"],
      answer: "a",
      rationale: "Hypothalamic neurons make ADH, and their terminals in the posterior pituitary release it."
    }
  },
  {
    youtubeId: "cDGmsR2ZILE", routeId: "lesson-12", role: "primary", topic: "Thyroid feedback",
    localSteps: [
      { label: "Stimulate", detail: "The hypothalamus and anterior pituitary stimulate thyroid activity." },
      { label: "Release", detail: "TSH causes the thyroid to release thyroxine." },
      { label: "Respond", detail: "Receptor-bearing tissues change metabolic activity." },
      { label: "Feed back", detail: "Rising thyroxine reduces further stimulation." }
    ],
    checkpoint: {
      prompt: "What pattern shows negative feedback in the thyroid axis?",
      choices: ["Rising thyroxine reduces TSH stimulation", "TSH becomes insulin", "PTH focuses light"],
      answer: "a",
      rationale: "The target-gland hormone feeds back to reduce upstream stimulation."
    }
  },
  {
    youtubeId: "y9Bdi4dnSlg", routeId: "lesson-13", role: "primary", topic: "Insulin and glucagon",
    localSteps: [
      { label: "Rise", detail: "Rising blood glucose stimulates pancreatic beta cells." },
      { label: "Insulin", detail: "Insulin changes uptake, storage, and liver output in receptor-bearing targets." },
      { label: "Fall", detail: "Falling blood glucose stimulates pancreatic alpha cells." },
      { label: "Glucagon", detail: "Glucagon acts mainly on the liver to increase glucose output." }
    ],
    checkpoint: {
      prompt: "Which cells release insulin when blood glucose rises?",
      choices: ["Pancreatic beta cells", "Pancreatic alpha cells", "Adrenal-medulla cells"],
      answer: "a",
      rationale: "Beta cells respond to rising glucose by increasing insulin release."
    }
  },
  {
    youtubeId: "v-t1Z5-oPtU", routeId: "lesson-13", role: "primary-secondary", topic: "Stress response",
    localSteps: [
      { label: "Rapid route", detail: "Sympathetic nerves stimulate the adrenal medulla." },
      { label: "Immediate signal", detail: "Epinephrine supports rapid changes in circulation and fuel supply." },
      { label: "Longer route", detail: "ACTH stimulates the adrenal cortex to release cortisol." },
      { label: "Recovery", detail: "Feedback and removal of the stressor help responses move toward baseline." }
    ],
    checkpoint: {
      prompt: "Which comparison correctly separates two stress pathways?",
      choices: ["Epinephrine is rapid; ACTH and cortisol support a longer response", "Cortisol is a neurotransmitter at the neuromuscular junction", "The adrenal cortex detects light"],
      answer: "a",
      rationale: "The adrenal-medulla response is rapid, while the hypothalamus-pituitary-adrenal pathway develops over a longer time."
    }
  }
];

export function buildPracticeBlueprint(performanceBehaviours: Array<{ id: string; outcomeId: string }>) {
  const behaviourByOutcome = new Map<string, string[]>();
  for (const behaviour of performanceBehaviours) {
    const list = behaviourByOutcome.get(behaviour.outcomeId) ?? [];
    list.push(behaviour.id);
    behaviourByOutcome.set(behaviour.outcomeId, list);
  }
  const item = (id: string, routeId: string, outcomeIds: string[], conceptIds: string[], required: boolean, cognitiveLevel: string) => ({
    id: `biology30-unit-a-pilot-2:practice:${id}`,
    routeId,
    outcomeIds,
    performanceBehaviourIds: [...new Set(outcomeIds.flatMap((outcomeId) => behaviourByOutcome.get(outcomeId)?.slice(0, 2) ?? []))],
    prerequisiteConceptIds: conceptIds,
    required,
    cognitiveLevel,
    answerKeyRequired: true,
    rationaleRequired: true,
    misconceptionFeedbackRequired: true,
    textbookLinkRequired: true,
    secureSourceMaterialPermitted: false
  });
  const lessonItems = PILOT_2_LESSONS.flatMap((lesson) => [1, 2].map((number) => item(
    `${lesson.id}-guided-${number}`,
    lesson.id,
    lesson.outcomeIds,
    lesson.conceptIds,
    true,
    number === 1 ? "remember-understand" : "apply"
  )));
  const chapterOutcomes: Record<number, string[]> = {
    11: ["A1.1k", "A1.2k", "A1.3k", "A1.1sts", "A1.2sts", "A1.3sts", "A1.2s", "A1.3s"],
    12: ["A1.4k", "A1.5k", "A1.6k", "A1.1s", "A1.2s", "A1.3s", "A1.4s", "A1.3sts"],
    13: ["A2.1k", "A2.2k", "A2.3k", "A2.4k", "A2.5k", "A2.6k", "A2.1sts", "A2.2sts", "A2.1s", "A2.2s", "A2.3s", "A2.4s"]
  };
  const chapterConcepts: Record<number, string[]> = {
    11: PILOT_2_LESSONS.filter((lesson) => lesson.chapter === 11).flatMap((lesson) => lesson.conceptIds),
    12: PILOT_2_LESSONS.filter((lesson) => lesson.chapter === 12).flatMap((lesson) => lesson.conceptIds),
    13: PILOT_2_LESSONS.filter((lesson) => lesson.chapter === 13).flatMap((lesson) => lesson.conceptIds)
  };
  const chapterItems = [11, 12, 13].flatMap((chapter) => Array.from({ length: 12 }, (_value, index) => item(
    `chapter-${chapter}-practice-${String(index + 1).padStart(2, "0")}`,
    `chapter-${chapter}-practice`,
    [chapterOutcomes[chapter][index % chapterOutcomes[chapter].length]],
    [chapterConcepts[chapter][index % chapterConcepts[chapter].length]],
    true,
    index < 4 ? "remember-understand" : index < 10 ? "apply" : "higher-mental-activity"
  )));
  const finalOutcomePattern = ["A1.1k", "A1.2k", "A1.3k", "A1.4k", "A1.5k", "A1.6k", "A2.1k", "A2.2k", "A2.3k", "A2.4k", "A2.5k", "A2.6k"];
  const finalCoreItems = Array.from({ length: 18 }, (_value, index) => item(
    `final-practice-core-${String(index + 1).padStart(2, "0")}`,
    "final-practice",
    [finalOutcomePattern[index % finalOutcomePattern.length]],
    PILOT_2_LESSONS[(index * 2) % PILOT_2_LESSONS.length].conceptIds.slice(0, 1),
    true,
    index < 5 ? "remember-understand" : index < 15 ? "apply" : "higher-mental-activity"
  ));
  const challengeItems = Array.from({ length: 6 }, (_value, index) => item(
    `final-practice-challenge-${String(index + 1).padStart(2, "0")}`,
    "final-practice#advanced",
    [["A1.1k", "A1.3s"], ["A1.2k", "A1.3s"], ["A1.4k", "A1.3s"], ["A2.2k", "A2.3s"], ["A2.5k", "A2.3s"], ["A1.2sts", "A2.2sts"]][index],
    [PILOT_2_LESSONS[[1, 4, 6, 11, 12, 8][index]].conceptIds[0]],
    false,
    "higher-mental-activity"
  ));
  return {
    policy: {
      requiredAutoGradedItemCount: 80,
      optionalChallengeItemCount: 6,
      secureAssessmentContentPermitted: false,
      requiredItemsMayAssessAdvancedOnlyContent: false
    },
    lessonItems,
    chapterItems,
    finalCoreItems,
    challengeItems
  };
}
