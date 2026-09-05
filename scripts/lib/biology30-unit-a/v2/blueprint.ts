import type { NamedBrightspaceResource } from "../../science-comparison.js";
import type {
  BiologyArtifactV2,
  BiologyCorrectionRecordV1,
  BiologyInteractionV2,
  BiologyLessonRecordV2,
  BiologyOutcomeCategoryV2,
  BiologyOutcomeRecordV2,
  BiologyPdfPageDispositionV1,
  BiologyProductionContractV1,
  BiologyProductionSourceV2,
  BiologySourceRefV2
} from "./types.js";

export const BIOLOGY30_V2_FAMILY = "biology30-unit-a-pilot" as const;
export const BIOLOGY30_V2_PROJECT = "biology30-unit-a" as const;
export const BIOLOGY30_V2_TITLE = "Biology 30 — Unit A: Nervous and Endocrine Systems" as const;
export const BIOLOGY30_V2_PROFILE = "biology30-unit-a-production-v1" as const;
export const BIOLOGY30_NOTES_SHA256 = "538f58fffe4aa0459dfcf49c5675948d8c7231a95a6fb2b61d7cde56e06a6035";

export const ALBERTA_PROGRAM_URL = "https://education.alberta.ca/media/159727/bio203007.pdf";
export const ALBERTA_PERFORMANCE_URL =
  "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf";
export const ALBERTA_BIOLOGY_BULLETIN_URL =
  "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf";
export const ALBERTA_DIPLOMA_GENERAL_URL =
  "https://www.alberta.ca/system/files/ecc-diploma-exam-general-information-bulletin-2026-27.pdf";

const REQUIRED_SOURCE_HASHES = new Map([
  ["class-2026-27", "46a6c8794419bcbd574888c2b54cbf42c2c551894a8f6844c2233b82ea7baed5"],
  ["system-2020", "0c00ebf519d0a727c569001b3f3840fb04b1040a726fa3d2cb36a9120f005761"]
]);

type OutcomeSeed = {
  id: string;
  category: BiologyOutcomeCategoryV2;
  officialText: string;
  lessonIds: string[];
  evidenceRoutes: string[];
};

const OUTCOME_SEEDS: OutcomeSeed[] = [
  {
    id: "A1.1k",
    category: "knowledge",
    officialText:
      "Describe the general structure and function of a neuron and myelin sheath, explaining the formation and transmission of an action potential, including all-or-none response and intensity of response; the transmission of a signal across a synapse; and the main chemicals and transmitters involved, i.e., norepinephrine, acetylcholine and cholinesterase.",
    lessonIds: ["lesson-03", "lesson-04", "lesson-05"],
    evidenceRoutes: ["investigation-notebook#action-potential-evidence", "lesson-17#integrated-case"]
  },
  {
    id: "A1.2k",
    category: "knowledge",
    officialText:
      "Identify the principal structures of the central and peripheral nervous systems and explain their functions in regulating the voluntary (somatic) and involuntary (autonomic) systems of the human organism; i.e., cerebral hemispheres and lobes, cerebellum, pons, medulla oblongata, hypothalamus, spinal cord, sympathetic and parasympathetic nervous systems, and the sensory-somatic nervous system.",
    lessonIds: ["lesson-06"],
    evidenceRoutes: ["investigation-notebook#regulation-systems-map", "lesson-17#integrated-case"]
  },
  {
    id: "A1.3k",
    category: "knowledge",
    officialText:
      "Describe, using an example, the organization of neurons into nerves and the composition and function of reflex arcs; e.g., the patellar reflex, the pupillary reflex.",
    lessonIds: ["lesson-07"],
    evidenceRoutes: ["investigation-notebook#reflex-investigation", "lesson-17#integrated-case"]
  },
  {
    id: "A1.4k",
    category: "knowledge",
    officialText:
      "Describe the structure and function of the parts of the human eye; i.e., the cornea, lens, sclera, choroid, retina, rods and cones, fovea centralis, pupil, iris and optic nerve.",
    lessonIds: ["lesson-09"],
    evidenceRoutes: ["investigation-notebook#sensory-evidence-case"]
  },
  {
    id: "A1.5k",
    category: "knowledge",
    officialText:
      "Describe the structure and function of the parts of the human ear, including the pinna, auditory canal, tympanum, ossicles, cochlea, organ of Corti, auditory nerve, semicircular canals and Eustachian tube.",
    lessonIds: ["lesson-10"],
    evidenceRoutes: ["investigation-notebook#sensory-evidence-case"]
  },
  {
    id: "A1.6k",
    category: "knowledge",
    officialText:
      "Explain other ways that humans sense their environment and their spatial orientation in it; e.g., olfactory receptors, proprioceptors, taste receptors, receptors in the skin.",
    lessonIds: ["lesson-08", "lesson-11"],
    evidenceRoutes: ["investigation-notebook#sensory-investigation"]
  },
  {
    id: "A1.1sts",
    category: "sts",
    officialText:
      "Explain that scientific knowledge and theories develop through hypotheses, the collection of evidence, investigation and the ability to provide explanations (NS2).",
    lessonIds: ["lesson-05", "lesson-06", "lesson-11"],
    evidenceRoutes: ["lesson-11#evidence-brief", "investigation-notebook#hormone-technology-case"]
  },
  {
    id: "A1.2sts",
    category: "sts",
    officialText:
      "Explain that scientific investigation includes the process of analyzing evidence and providing explanations based upon scientific theories and concepts (NS5f) [ICT C7–4.2].",
    lessonIds: ["lesson-05", "lesson-11"],
    evidenceRoutes: ["lesson-11#evidence-brief", "investigation-notebook#action-potential-evidence"]
  },
  {
    id: "A1.3sts",
    category: "sts",
    officialText: "Explain that the goal of technology is to provide solutions to practical problems (ST1) [ICT F2–4.4].",
    lessonIds: ["lesson-05", "lesson-09", "lesson-10", "lesson-11"],
    evidenceRoutes: ["lesson-11#evidence-brief", "investigation-notebook#sensory-evidence-case"]
  },
  {
    id: "A1.1s",
    category: "skills",
    officialText: "Formulate questions about observed relationships and plan investigations of questions, ideas, problems and issues.",
    lessonIds: ["lesson-08"],
    evidenceRoutes: ["investigation-notebook#sensory-investigation"]
  },
  {
    id: "A1.2s",
    category: "skills",
    officialText:
      "Conduct investigations into relationships between and among observable variables and use a broad range of tools and techniques to gather and record data and information.",
    lessonIds: ["lesson-03", "lesson-06", "lesson-07", "lesson-08", "lesson-09", "lesson-10"],
    evidenceRoutes: ["investigation-notebook#reflex-investigation", "investigation-notebook#sensory-investigation"]
  },
  {
    id: "A1.3s",
    category: "skills",
    officialText: "Analyze data and apply mathematical and conceptual models to develop and assess possible solutions.",
    lessonIds: ["lesson-04", "lesson-06", "lesson-07", "lesson-08", "lesson-09", "lesson-10", "lesson-11"],
    evidenceRoutes: ["investigation-notebook#action-potential-evidence", "investigation-notebook#sensory-evidence-case"]
  },
  {
    id: "A1.4s",
    category: "skills",
    officialText:
      "Work collaboratively in addressing problems and apply the skills and conventions of science in communicating information and ideas and in assessing results.",
    lessonIds: ["lesson-07", "lesson-08", "lesson-11"],
    evidenceRoutes: ["investigation-notebook#sensory-investigation", "lesson-11#collaboration-checkpoint"]
  },
  {
    id: "A2.1k",
    category: "knowledge",
    officialText:
      "Identify the principal endocrine glands of humans; i.e., the hypothalamus/pituitary complex, thyroid, parathyroid, adrenal glands and islet cells of the pancreas.",
    lessonIds: ["lesson-02", "lesson-12", "lesson-13", "lesson-14", "lesson-15"],
    evidenceRoutes: ["investigation-notebook#regulation-systems-map", "lesson-17#integrated-case"]
  },
  {
    id: "A2.2k",
    category: "knowledge",
    officialText:
      "Describe the function of the hormones of the principal endocrine glands, i.e., thyroid-stimulating hormone (TSH)/thyroxine, calcitonin/parathyroid hormone (PTH), adrenocorticotropic hormone (ACTH)/cortisol, glucagon/insulin, human growth hormone (hGH), antidiuretic hormone (ADH), epinephrine, aldosterone, and describe how they maintain homeostasis through feedback.",
    lessonIds: ["lesson-02", "lesson-12", "lesson-13", "lesson-14", "lesson-15", "lesson-16"],
    evidenceRoutes: ["investigation-notebook#regulation-systems-map", "investigation-notebook#hormone-technology-case"]
  },
  {
    id: "A2.3k",
    category: "knowledge",
    officialText:
      "Explain the metabolic roles hormones may play in homeostasis; i.e., thyroxine in metabolism; insulin, glucagon and cortisol in blood sugar regulation; hGH in growth; ADH in water regulation; aldosterone in sodium ion regulation.",
    lessonIds: ["lesson-13", "lesson-14", "lesson-15", "lesson-16"],
    evidenceRoutes: ["investigation-notebook#glucose-urinalysis", "investigation-notebook#hormone-technology-case"]
  },
  {
    id: "A2.4k",
    category: "knowledge",
    officialText:
      "Explain how the endocrine system allows humans to sense their internal environment and respond appropriately; e.g., calcium balance, osmotic pressure of blood.",
    lessonIds: ["lesson-01", "lesson-02", "lesson-12", "lesson-14"],
    evidenceRoutes: ["investigation-notebook#regulation-systems-map", "lesson-17#integrated-case"]
  },
  {
    id: "A2.5k",
    category: "knowledge",
    officialText:
      "Compare the endocrine and nervous control systems and explain how they act together; e.g., stress and the adrenal gland.",
    lessonIds: ["lesson-01", "lesson-02", "lesson-12", "lesson-16"],
    evidenceRoutes: ["investigation-notebook#regulation-systems-map", "lesson-17#integrated-case"]
  },
  {
    id: "A2.6k",
    category: "knowledge",
    officialText:
      "Describe, using an example, the physiological consequences of hormone imbalances; i.e., diabetes mellitus (e.g., diabetes insipidus, gigantism, goitre, cretinism, Graves’ disease).",
    lessonIds: ["lesson-13", "lesson-14", "lesson-15", "lesson-16"],
    evidenceRoutes: ["investigation-notebook#glucose-urinalysis", "investigation-notebook#hormone-technology-case"]
  },
  {
    id: "A2.1sts",
    category: "sts",
    officialText: "Explain that science and technology are developed to meet societal needs and expand human capability (SEC1) [ICT F2–4.8].",
    lessonIds: ["lesson-15"],
    evidenceRoutes: ["investigation-notebook#glucose-urinalysis"]
  },
  {
    id: "A2.2sts",
    category: "sts",
    officialText:
      "Explain that science and technology have both intended and unintended consequences for humans and the environment (SEC3) [ICT F2–4.8, F3–4.1].",
    lessonIds: ["lesson-16"],
    evidenceRoutes: ["investigation-notebook#hormone-technology-case"]
  },
  {
    id: "A2.1s",
    category: "skills",
    officialText: "Formulate questions about observed relationships and plan investigations of questions, ideas, problems and issues.",
    lessonIds: ["lesson-14", "lesson-16"],
    evidenceRoutes: ["investigation-notebook#hormone-technology-case"]
  },
  {
    id: "A2.2s",
    category: "skills",
    officialText:
      "Conduct investigations into relationships between and among observable variables and use a broad range of tools and techniques to gather and record data and information.",
    lessonIds: ["lesson-15", "lesson-16"],
    evidenceRoutes: ["investigation-notebook#glucose-urinalysis", "investigation-notebook#hormone-technology-case"]
  },
  {
    id: "A2.3s",
    category: "skills",
    officialText: "Analyze data and apply mathematical and conceptual models to develop and assess possible solutions.",
    lessonIds: ["lesson-13", "lesson-14", "lesson-15", "lesson-16"],
    evidenceRoutes: ["investigation-notebook#glucose-urinalysis", "lesson-17#integrated-case"]
  },
  {
    id: "A2.4s",
    category: "skills",
    officialText:
      "Work collaboratively in addressing problems and apply the skills and conventions of science in communicating information and ideas and in assessing results.",
    lessonIds: ["lesson-16"],
    evidenceRoutes: ["lesson-16#collaboration-checkpoint", "investigation-notebook#hormone-technology-case"]
  }
];

const SOURCE_REFS: BiologySourceRefV2[] = [
  {
    id: "alberta-program",
    sourceId: "alberta-program-of-studies",
    url: ALBERTA_PROGRAM_URL,
    role: "core",
    rightsStatus: "official-public-curriculum",
    usage: "paraphrase"
  },
  {
    id: "alberta-performance",
    sourceId: "alberta-performance-standards",
    url: ALBERTA_PERFORMANCE_URL,
    role: "core",
    rightsStatus: "official-public-performance-guidance",
    usage: "paraphrase"
  },
  {
    id: "alberta-bulletin",
    sourceId: "alberta-biology-bulletin-2025-26",
    url: ALBERTA_BIOLOGY_BULLETIN_URL,
    role: "core",
    rightsStatus: "official-public-assessment-guidance",
    usage: "paraphrase"
  },
  {
    id: "openstax-a-and-p",
    sourceId: "openstax-anatomy-physiology-2e",
    url: "https://openstax.org/details/books/anatomy-and-physiology-2e",
    role: "cross-check",
    rightsStatus: "CC-BY-4.0; attribution required for adapted material",
    usage: "paraphrase"
  },
  {
    id: "ninds-health-information",
    sourceId: "ninds-health-information",
    url: "https://www.ninds.nih.gov/health-information",
    role: "cross-check",
    rightsStatus: "official-US-government-health-source; verify page-specific reuse before Gate 1",
    usage: "paraphrase"
  },
  {
    id: "niddk-diabetes",
    sourceId: "niddk-diabetes",
    url: "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes",
    role: "cross-check",
    rightsStatus: "official-US-government-health-source; verify page-specific reuse before Gate 1",
    usage: "paraphrase"
  },
  {
    id: "nei-how-eyes-work",
    sourceId: "nei-how-eyes-work",
    url: "https://www.nei.nih.gov/learn-about-eye-health/healthy-vision/how-eyes-work",
    role: "cross-check",
    rightsStatus: "official-US-government-health-source; verify page-specific reuse before Gate 1",
    usage: "paraphrase"
  },
  {
    id: "nidcd-how-hearing-works",
    sourceId: "nidcd-how-hearing-works",
    url: "https://www.nidcd.nih.gov/health/how-do-we-hear",
    role: "cross-check",
    rightsStatus: "official-US-government-health-source; verify page-specific reuse before Gate 1",
    usage: "paraphrase"
  },
  {
    id: "health-canada",
    sourceId: "health-canada",
    url: "https://www.canada.ca/en/health-canada.html",
    role: "cross-check",
    rightsStatus: "official-Canadian-government-health-source; select page-specific references before Gate 1",
    usage: "paraphrase"
  },
  ...[
    ["notes-neurons", 7, 17],
    ["notes-reflexes", 18, 20],
    ["notes-action-potential", 21, 30],
    ["notes-synapses", 31, 42],
    ["notes-nervous-organization", 43, 66],
    ["notes-sensory-receptors", 69, 77],
    ["notes-vision", 78, 87],
    ["notes-hearing", 88, 96],
    ["notes-homeostasis", 100, 105],
    ["notes-hormone-signalling", 106, 109],
    ["notes-pituitary", 110, 120],
    ["notes-thyroid", 121, 128],
    ["notes-pancreas", 129, 133],
    ["notes-adrenals", 134, 137],
    ["notes-integration", 138, 139]
  ].map(([id, start, end]) => ({
    id: String(id),
    sourceId: "unit-a-notes",
    sourcePath: "Unit A Nervous and Endocrine Systems Notes.pdf",
    pdfPages: Array.from({ length: Number(end) - Number(start) + 1 }, (_value, index) => Number(start) + index),
    role: "core" as const,
    rightsStatus: "authorized-local-course-source",
    usage: "adaptation" as const
  })),
  ...[
    ["class-unit-root", "1498071", "Unit A - Nervous & Endocrine Systems"],
    ["class-day-neuron", "1498120", "Unit A - Nervous & Endocrine Systems > Days 1-7: Chapter 11 > Day 1: Neuron Structure"],
    ["class-day-action-potential", "1498122", "Unit A - Nervous & Endocrine Systems > Days 1-7: Chapter 11 > Day 2: Action Potentials"],
    ["class-day-synapse", "1498123", "Unit A - Nervous & Endocrine Systems > Days 1-7: Chapter 11 > Day 3: Synaptic Transmission"],
    ["class-day-pns-cns", "1498124", "Unit A - Nervous & Endocrine Systems > Days 1-7: Chapter 11 > Day 4: PNS and CNS"],
    ["class-day-brain", "1498131", "Unit A - Nervous & Endocrine Systems > Days 1-7: Chapter 11 > Day 5: The Brain"],
    ["class-day-sensory", "1498130", "Unit A - Nervous & Endocrine Systems > Days 8-12: Chapter 12 > Day 8: Sensory Reception"],
    ["class-day-eye", "1498132", "Unit A - Nervous & Endocrine Systems > Days 8-12: Chapter 12 > Day 9: Photoreception and the Eye"],
    ["class-day-ear", "1498133", "Unit A - Nervous & Endocrine Systems > Days 8-12: Chapter 12 > Day 10: Hearing and Balance"],
    ["class-day-homeostasis", "1498138", "Unit A - Nervous & Endocrine Systems > Days 13-19: Chapter 13 > Day 13: Homeostasis"],
    ["class-day-pituitary-1", "1498140", "Unit A - Nervous & Endocrine Systems > Days 13-19: Chapter 13 > Days 14: Pituitary Hormones Part 1"],
    ["class-day-pituitary-2", "1498141", "Unit A - Nervous & Endocrine Systems > Days 13-19: Chapter 13 > Day 15: Pituitary Hormones Part 2"],
    ["class-day-thyroid", "1498142", "Unit A - Nervous & Endocrine Systems > Days 13-19: Chapter 13 > Day 16: Thyroid and Parathyroid Glands"],
    ["class-day-pancreas-adrenal", "1498143", "Unit A - Nervous & Endocrine Systems > Days 13-19: Chapter 13 > Day 17: Pancreas and Adrenal Glands"],
    ["class-review-seminar", "1498128", "Unit A - Nervous & Endocrine Systems > Days 20-23: Unit A Review and Exam > B30 Unit A Review Seminar"],
    ["class-quiz-11", "1498237", "Unit A - Nervous & Endocrine Systems > Days 1-7: Chapter 11 > Days 6-7: Ch 11 Quiz > Chapter 11 Quiz"],
    ["class-quiz-12", "1498238", "Unit A - Nervous & Endocrine Systems > Days 8-12: Chapter 12 > Days 11-12: Chapter 12 Quiz > Biology 30 Unit A - Chapter 12 Quiz"],
    ["class-quiz-13", "1498239", "Unit A - Nervous & Endocrine Systems > Days 13-19: Chapter 13 > Days 18-19: Chapter 13 Quiz > Biology 30 Unit A - Chapter 13 Quiz"]
  ].map(([id, itemId, sourcePath]) => ({
    id,
    sourceId: "class-2026-27",
    itemId,
    sourcePath,
    role: "core" as const,
    rightsStatus: "authorized-local-course-source",
    usage: "adaptation" as const
  })),
  ...[
    ["system-unit-intro", "2241", "Unit A > Unit A Introduction"],
    ["system-m1-l1", "2248", "Unit A > Module 1 > Unit A - M1: Lesson 1"],
    ["system-m1-l2", "2253", "Unit A > Module 1 > Unit A - M1: Lesson 2"],
    ["system-m1-l3", "2258", "Unit A > Module 1 > Unit A - M1: Lesson 3"],
    ["system-m1-l4", "2265", "Unit A > Module 1 > Unit A - M1: Lesson 4"],
    ["system-m1-l5", "2273", "Unit A > Module 1 > Unit A - M1: Lesson 5"],
    ["system-m1-l6", "2282", "Unit A > Module 1 > Unit A - M1: Lesson 6"],
    ["system-m1-l7", "2293", "Unit A > Module 1 > Unit A - M1:Lesson 7"],
    ["system-m1-l8", "2301", "Unit A > Module 1 > Unit A - M1:Lesson 8"],
    ["system-m1-summary", "2311", "Unit A > Module 1 > Module 1 Summary"],
    ["system-m2-l1", "2317", "Unit A > Module 2 > Unit A - M2: Lesson 1"],
    ["system-m2-l2", "2326", "Unit A > Module 2 > Unit A - M2: Lesson 2"],
    ["system-m2-l3", "2335", "Unit A > Module 2 > Unit A - M2: Lesson 3"],
    ["system-m2-l4", "2343", "Unit A > Module 2 > Unit A - M2: Lesson 4"],
    ["system-m2-l5", "2350", "Unit A > Module 2 > Unit A - M2: Lesson 5"],
    ["system-m2-l6", "2359", "Unit A > Module 2 > Unit A - M2: Lesson 6"],
    ["system-m2-summary", "2365", "Unit A > Module 2 > Module 2 Summary"]
  ].map(([id, itemId, sourcePath]) => ({
    id,
    sourceId: "system-2020",
    itemId,
    sourcePath,
    role: "core" as const,
    rightsStatus: "authorized-local-course-source",
    usage: "adaptation" as const
  }))
];

function lesson(input: Omit<BiologyLessonRecordV2, "practiceIds">): BiologyLessonRecordV2 {
  return {
    ...input,
    practiceIds: [1, 2, 3].map((number) => `${input.id}-check-${number}`)
  };
}

export const BIOLOGY30_V2_LESSONS: BiologyLessonRecordV2[] = [
  lesson({
    id: "lesson-01",
    moduleId: "module-1",
    order: 1,
    title: "Homeostasis Under Pressure",
    inquiry: "How does the body keep key internal conditions within workable ranges during a sprint, cold exposure, or stress?",
    requiredMinutes: 60,
    optionalMinutes: 20,
    outcomeIds: ["A2.4k", "A2.5k"],
    prerequisiteLessonIds: [],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-homeostasis", "class-day-homeostasis", "system-unit-intro", "system-m2-l1"],
    sections: ["A changing internal environment", "Variables, sensors, and effectors", "Build the baseline systems map"],
    figureIds: ["figure-integrated-control-overview"],
    interactionIds: ["interaction-control-system-comparison"],
    artifactIds: ["regulation-systems-map"],
    glossaryTerms: ["homeostasis", "stimulus", "receptor", "control centre", "effector", "regulated variable"]
  }),
  lesson({
    id: "lesson-02",
    moduleId: "module-1",
    order: 2,
    title: "Two Control Systems and Feedback",
    inquiry: "Why can a nerve signal act in milliseconds while a hormone can shape a response for minutes or hours?",
    requiredMinutes: 75,
    optionalMinutes: 25,
    outcomeIds: ["A2.1k", "A2.2k", "A2.4k", "A2.5k"],
    prerequisiteLessonIds: ["lesson-01"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-homeostasis", "notes-hormone-signalling", "system-m2-l1", "system-m2-l6"],
    sections: ["Nervous and endocrine signalling", "Negative feedback", "Troubleshoot a control loop"],
    figureIds: ["figure-control-system-comparison", "figure-generic-feedback-loop"],
    interactionIds: ["interaction-negative-feedback-builder"],
    artifactIds: ["regulation-systems-map"],
    glossaryTerms: ["hormone", "target cell", "negative feedback", "set point", "feedback loop"]
  }),
  lesson({
    id: "lesson-03",
    moduleId: "module-2",
    order: 3,
    title: "Neurons, Types, and Myelin",
    inquiry: "How does the structure of a neuron make rapid directional communication possible?",
    requiredMinutes: 80,
    optionalMinutes: 15,
    outcomeIds: ["A1.1k", "A1.2s"],
    prerequisiteLessonIds: ["lesson-02"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-neurons", "class-day-neuron", "system-m1-l3", "system-m1-l7", "openstax-a-and-p"],
    sections: ["Neuron structure", "Sensory, motor, and interneurons", "Myelin in the CNS and PNS"],
    figureIds: ["figure-neuron-anatomy", "figure-neuron-types", "figure-myelin-saltatory-conduction"],
    interactionIds: ["interaction-neuron-pathway-sort"],
    artifactIds: [],
    glossaryTerms: ["neuron", "dendrite", "axon", "myelin", "node of Ranvier", "Schwann cell", "oligodendrocyte"]
  }),
  lesson({
    id: "lesson-04",
    moduleId: "module-2",
    order: 4,
    title: "Action Potentials: Ions into Information",
    inquiry: "How can a brief change in membrane voltage carry information without becoming weaker along the axon?",
    requiredMinutes: 90,
    optionalMinutes: 15,
    outcomeIds: ["A1.1k", "A1.3s"],
    prerequisiteLessonIds: ["lesson-03"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-action-potential", "class-day-action-potential", "system-m1-l7", "openstax-a-and-p"],
    sections: ["Resting potential", "Threshold and depolarization", "Repolarization and refractory period", "Stimulus intensity"],
    figureIds: ["figure-resting-membrane", "figure-action-potential-graph"],
    interactionIds: ["interaction-action-potential-explorer"],
    artifactIds: ["action-potential-evidence"],
    glossaryTerms: ["resting potential", "threshold", "depolarization", "repolarization", "hyperpolarization", "refractory period"]
  }),
  lesson({
    id: "lesson-05",
    moduleId: "module-2",
    order: 5,
    title: "Synapses, Drugs, Toxins, and Disorders",
    inquiry: "What happens to a nervous-system message when a chemical changes release, binding, breakdown, or reuptake at a synapse?",
    requiredMinutes: 80,
    optionalMinutes: 15,
    outcomeIds: ["A1.1k", "A1.1sts", "A1.2sts", "A1.3sts"],
    prerequisiteLessonIds: ["lesson-04"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-synapses", "class-day-synapse", "system-m1-l8", "openstax-a-and-p", "ninds-health-information"],
    sections: ["Crossing the synaptic gap", "Excitation, inhibition, and summation", "How drugs and toxins alter transmission", "Evidence and treatment"],
    figureIds: ["figure-synaptic-transmission"],
    interactionIds: ["interaction-synapse-sequence"],
    artifactIds: [],
    glossaryTerms: ["synapse", "neurotransmitter", "acetylcholine", "norepinephrine", "cholinesterase", "agonist", "antagonist", "reuptake"]
  }),
  lesson({
    id: "lesson-06",
    moduleId: "module-3",
    order: 6,
    title: "Nervous-System Organization and the Brain",
    inquiry: "How can a pattern of symptoms help identify the nervous-system structure that is not functioning normally?",
    requiredMinutes: 90,
    optionalMinutes: 20,
    outcomeIds: ["A1.2k", "A1.1sts", "A1.2s", "A1.3s"],
    prerequisiteLessonIds: ["lesson-05"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-nervous-organization", "class-day-pns-cns", "class-day-brain", "system-m1-l1", "system-m1-l2", "openstax-a-and-p", "ninds-health-information"],
    sections: ["CNS and PNS hierarchy", "Somatic and autonomic divisions", "Brain regions and evidence", "What hemispheric specialization does and does not mean"],
    figureIds: ["figure-nervous-system-hierarchy", "figure-brain-regions"],
    interactionIds: ["interaction-brain-symptom-locator"],
    artifactIds: [],
    glossaryTerms: ["central nervous system", "peripheral nervous system", "somatic", "autonomic", "sympathetic", "parasympathetic", "corpus callosum"]
  }),
  lesson({
    id: "lesson-07",
    moduleId: "module-3",
    order: 7,
    title: "Reflex Arcs and Response Investigation",
    inquiry: "How can the body produce a rapid protective response before conscious interpretation is complete?",
    requiredMinutes: 105,
    optionalMinutes: 30,
    outcomeIds: ["A1.3k", "A1.2s", "A1.3s", "A1.4s"],
    prerequisiteLessonIds: ["lesson-06"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-reflexes", "system-m1-l3", "openstax-a-and-p"],
    sections: ["Five components of a reflex arc", "Design the investigation", "Collect or inspect supplied data", "Graph, interpret, and qualify the result"],
    figureIds: ["figure-reflex-arc"],
    interactionIds: ["interaction-reflex-arc-builder"],
    artifactIds: ["reflex-investigation"],
    glossaryTerms: ["reflex", "sensory neuron", "interneuron", "motor neuron", "effector", "controlled variable"]
  }),
  lesson({
    id: "lesson-08",
    moduleId: "module-4",
    order: 8,
    title: "Sensory Receptors and Experimental Design",
    inquiry: "Why do different body regions detect pressure, temperature, pain, and position with different sensitivity?",
    requiredMinutes: 80,
    optionalMinutes: 15,
    outcomeIds: ["A1.6k", "A1.1s", "A1.2s", "A1.3s", "A1.4s"],
    prerequisiteLessonIds: ["lesson-07"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-sensory-receptors", "class-day-sensory", "system-m1-l4", "openstax-a-and-p"],
    sections: ["Receptor families", "Sensation, perception, and adaptation", "Plan a safe sensory investigation", "Use collected or supplied data"],
    figureIds: ["figure-sensory-receptor-families"],
    interactionIds: ["interaction-sensory-investigation-planner"],
    artifactIds: ["sensory-investigation"],
    glossaryTerms: ["photoreceptor", "mechanoreceptor", "chemoreceptor", "thermoreceptor", "nociceptor", "proprioceptor", "sensory adaptation"]
  }),
  lesson({
    id: "lesson-09",
    moduleId: "module-4",
    order: 9,
    title: "Vision: From Light to Perception",
    inquiry: "How do the optical structures of the eye and the neural retina work together to create visual information?",
    requiredMinutes: 95,
    optionalMinutes: 10,
    outcomeIds: ["A1.4k", "A1.2s", "A1.3s", "A1.3sts"],
    prerequisiteLessonIds: ["lesson-08"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-vision", "class-day-eye", "system-m1-l5", "openstax-a-and-p", "nei-how-eyes-work"],
    sections: ["Eye structures and refraction", "Rods, cones, and the retina", "From retinal image to perception", "Blind spot or acuity investigation", "Vision technologies"],
    figureIds: ["figure-eye-anatomy", "figure-retina-light-pathway"],
    interactionIds: ["interaction-eye-light-path"],
    artifactIds: ["sensory-evidence-case"],
    glossaryTerms: ["cornea", "iris", "pupil", "lens", "retina", "rod", "cone", "fovea centralis", "optic nerve"]
  }),
  lesson({
    id: "lesson-10",
    moduleId: "module-4",
    order: 10,
    title: "Hearing and Equilibrium",
    inquiry: "How do pressure waves become neural signals, and how does the inner ear also report head movement?",
    requiredMinutes: 95,
    optionalMinutes: 10,
    outcomeIds: ["A1.5k", "A1.2s", "A1.3s", "A1.3sts"],
    prerequisiteLessonIds: ["lesson-09"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-hearing", "class-day-ear", "system-m1-l6", "openstax-a-and-p", "nidcd-how-hearing-works"],
    sections: ["Outer and middle ear", "Cochlea and transduction", "Equilibrium", "Read an audiogram", "Hearing technology and safety"],
    figureIds: ["figure-ear-hearing-pathway", "figure-equilibrium-apparatus"],
    interactionIds: ["interaction-audiogram-evidence-explorer"],
    artifactIds: ["sensory-evidence-case"],
    glossaryTerms: ["pinna", "tympanum", "ossicles", "cochlea", "organ of Corti", "semicircular canal", "Eustachian tube", "audiogram"]
  }),
  lesson({
    id: "lesson-11",
    moduleId: "module-4",
    order: 11,
    title: "Sensory Evidence, Photoperiod, and Technology",
    inquiry: "How should biological evidence and technology claims be evaluated when they affect sensation, access, and quality of life?",
    requiredMinutes: 75,
    optionalMinutes: 10,
    outcomeIds: ["A1.1sts", "A1.2sts", "A1.3sts", "A1.3s", "A1.4s"],
    prerequisiteLessonIds: ["lesson-10"],
    sourceRefIds: ["alberta-program", "alberta-performance", "system-m1-l4", "system-m1-l5", "system-m1-l6", "ninds-health-information", "nei-how-eyes-work", "nidcd-how-hearing-works", "health-canada"],
    sections: ["Read a context-rich dataset", "Photoperiod and evidence", "Evaluate a sensory technology", "Communicate an evidence brief"],
    figureIds: ["figure-sensory-evidence-chain"],
    interactionIds: ["interaction-sensory-evidence-board"],
    artifactIds: ["sensory-investigation", "sensory-evidence-case"],
    glossaryTerms: ["photoperiod", "evidence", "mechanism", "technology", "accessibility", "limitation"]
  }),
  lesson({
    id: "lesson-12",
    moduleId: "module-5",
    order: 12,
    title: "Endocrine Architecture and Feedback",
    inquiry: "How can a chemical messenger affect one target while circulating through the entire bloodstream?",
    requiredMinutes: 80,
    optionalMinutes: 10,
    outcomeIds: ["A2.1k", "A2.2k", "A2.4k", "A2.5k"],
    prerequisiteLessonIds: ["lesson-11"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-homeostasis", "notes-hormone-signalling", "class-day-homeostasis", "system-m2-l1", "openstax-a-and-p"],
    sections: ["Principal endocrine glands", "Hormones and target cells", "Feedback around a set point", "Nervous-endocrine coordination"],
    figureIds: ["figure-endocrine-body-map", "figure-generic-feedback-loop"],
    interactionIds: ["interaction-endocrine-body-map"],
    artifactIds: ["regulation-systems-map"],
    glossaryTerms: ["endocrine gland", "target tissue", "receptor", "water-soluble hormone", "lipid-soluble hormone"]
  }),
  lesson({
    id: "lesson-13",
    moduleId: "module-5",
    order: 13,
    title: "Hypothalamus, Pituitary, Growth, and Water Balance",
    inquiry: "How can one brain-endocrine complex coordinate growth and water balance through different feedback pathways?",
    requiredMinutes: 90,
    optionalMinutes: 10,
    outcomeIds: ["A2.1k", "A2.2k", "A2.3k", "A2.6k", "A2.3s"],
    prerequisiteLessonIds: ["lesson-12"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-pituitary", "class-day-pituitary-1", "class-day-pituitary-2", "system-m2-l2", "system-m2-l6", "openstax-a-and-p"],
    sections: ["Hypothalamus-pituitary relationship", "Human growth hormone", "ADH and water balance", "Interpret a hormone-data case"],
    figureIds: ["figure-hypothalamus-pituitary-axes", "figure-water-balance-loop"],
    interactionIds: ["interaction-hypothalamus-pituitary-feedback"],
    artifactIds: [],
    glossaryTerms: ["hypothalamus", "pituitary", "releasing hormone", "tropic hormone", "hGH", "ADH", "osmotic pressure"]
  }),
  lesson({
    id: "lesson-14",
    moduleId: "module-5",
    order: 14,
    title: "Thyroid, Parathyroid, Metabolism, and Calcium",
    inquiry: "How can paired feedback loops regulate metabolic rate and blood calcium through different glands and hormones?",
    requiredMinutes: 80,
    optionalMinutes: 10,
    outcomeIds: ["A2.1k", "A2.2k", "A2.3k", "A2.4k", "A2.6k", "A2.1s", "A2.3s"],
    prerequisiteLessonIds: ["lesson-13"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-thyroid", "class-day-thyroid", "system-m2-l4", "openstax-a-and-p"],
    sections: ["TSH and thyroxine", "PTH and calcitonin", "Predict feedback changes", "Interpret a disorder case"],
    figureIds: ["figure-thyroxine-loop", "figure-calcium-regulation-loop"],
    interactionIds: ["interaction-thyroid-calcium-feedback"],
    artifactIds: [],
    glossaryTerms: ["thyroid", "parathyroid", "TSH", "thyroxine", "calcitonin", "PTH", "antagonistic hormones"]
  }),
  lesson({
    id: "lesson-15",
    moduleId: "module-5",
    order: 15,
    title: "Pancreas, Blood Glucose, Diabetes, and Urinalysis",
    inquiry: "What patterns in blood and urine data reveal that glucose regulation is not returning to its expected range?",
    requiredMinutes: 105,
    optionalMinutes: 10,
    outcomeIds: ["A2.1k", "A2.2k", "A2.3k", "A2.6k", "A2.1sts", "A2.2s", "A2.3s"],
    prerequisiteLessonIds: ["lesson-14"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-pancreas", "class-day-pancreas-adrenal", "system-m2-l5", "openstax-a-and-p", "niddk-diabetes"],
    sections: ["Pancreatic islets", "Insulin and glucagon", "Type 1 and type 2 diabetes", "Simulated urinalysis", "Treatment principles and evidence"],
    figureIds: ["figure-blood-glucose-loop"],
    interactionIds: ["interaction-blood-glucose-simulator"],
    artifactIds: ["glucose-urinalysis"],
    glossaryTerms: ["islet cell", "insulin", "glucagon", "glycogen", "hyperglycemia", "urinalysis", "diabetes mellitus"]
  }),
  lesson({
    id: "lesson-16",
    moduleId: "module-5",
    order: 16,
    title: "Adrenals, Stress, Water/Salt, and Hormone Technology",
    inquiry: "How do neural and endocrine signals coordinate short- and long-term stress while protecting water and ion balance?",
    requiredMinutes: 105,
    optionalMinutes: 15,
    outcomeIds: ["A2.2k", "A2.3k", "A2.5k", "A2.6k", "A2.1s", "A2.2s", "A2.3s", "A2.4s", "A2.2sts"],
    prerequisiteLessonIds: ["lesson-15"],
    sourceRefIds: ["alberta-program", "alberta-performance", "notes-adrenals", "class-day-pancreas-adrenal", "system-m2-l3", "openstax-a-and-p", "health-canada"],
    sections: ["Adrenal medulla and short-term stress", "Adrenal cortex and long-term stress", "ADH, aldosterone, blood, and urine", "Evaluate hormone technology", "Asynchronous feedback checkpoint"],
    figureIds: ["figure-stress-response-comparison", "figure-water-salt-regulation"],
    interactionIds: ["interaction-water-salt-data-lab"],
    artifactIds: ["hormone-technology-case"],
    glossaryTerms: ["adrenal cortex", "adrenal medulla", "ACTH", "cortisol", "epinephrine", "aldosterone", "general adaptation syndrome"]
  }),
  lesson({
    id: "lesson-17",
    moduleId: "module-6",
    order: 17,
    title: "Integrated Regulation and Unit Mastery",
    inquiry: "How can sensory, neural, endocrine, glucose, and osmolality evidence be combined to explain a whole-body response?",
    requiredMinutes: 120,
    optionalMinutes: 55,
    outcomeIds: OUTCOME_SEEDS.map((outcome) => outcome.id),
    prerequisiteLessonIds: ["lesson-16"],
    sourceRefIds: ["alberta-program", "alberta-performance", "alberta-bulletin", "notes-integration", "class-review-seminar", "class-quiz-11", "class-quiz-12", "class-quiz-13", "system-m1-summary", "system-m2-summary"],
    sections: ["Novel integrated case", "Revise the systems map", "Compile the investigation portfolio", "Complete context-based practice", "Plan the Brightspace summative next step"],
    figureIds: ["figure-integrated-nervous-endocrine-case"],
    interactionIds: ["interaction-integrated-case-board"],
    artifactIds: ["regulation-systems-map", "hormone-technology-case"],
    glossaryTerms: ["integration", "claim", "evidence", "reasoning", "limitation", "homeostasis"]
  })
];

const ARTIFACT_FIELDS = [
  { id: "claim", label: "Scientific claim", maxLength: 500 },
  { id: "evidence", label: "Evidence or data", maxLength: 500 },
  { id: "reasoning", label: "Reasoning and connections", maxLength: 500 },
  { id: "limitations", label: "Limitations, safety, or reflection", maxLength: 500 }
];

export const BIOLOGY30_V2_ARTIFACTS: BiologyArtifactV2[] = [
  ["regulation-systems-map", "Baseline and final regulation systems map", ["lesson-01", "lesson-02", "lesson-12", "lesson-17"], ["A2.1k", "A2.2k", "A2.4k", "A2.5k"]],
  ["action-potential-evidence", "Action-potential evidence interpretation", ["lesson-04"], ["A1.1k", "A1.3s"]],
  ["reflex-investigation", "Reflex investigation", ["lesson-07"], ["A1.3k", "A1.2s", "A1.3s", "A1.4s"]],
  ["sensory-investigation", "Sensory investigation design and data analysis", ["lesson-08", "lesson-11"], ["A1.6k", "A1.1s", "A1.2s", "A1.3s", "A1.4s"]],
  ["sensory-evidence-case", "Vision or audiogram evidence case", ["lesson-09", "lesson-10", "lesson-11"], ["A1.4k", "A1.5k", "A1.3sts", "A1.3s"]],
  ["glucose-urinalysis", "Blood-glucose and urinalysis analysis", ["lesson-15"], ["A2.1k", "A2.2k", "A2.3k", "A2.6k", "A2.1sts", "A2.2s", "A2.3s"]],
  ["hormone-technology-case", "Hormone-technology and integrated-regulation case", ["lesson-16", "lesson-17"], ["A2.2k", "A2.3k", "A2.5k", "A2.6k", "A2.1s", "A2.2s", "A2.3s", "A2.4s", "A2.2sts"]]
].map(([id, title, lessonIds, outcomeIds]) => ({
  id: id as string,
  title: title as string,
  lessonIds: lessonIds as string[],
  outcomeIds: outcomeIds as string[],
  fields: ARTIFACT_FIELDS.map((field) => ({ ...field, id: `${id}:${field.id}` })),
  rubricId: "biology30-unit-a-artifact-rubric-v1",
  printEnabled: true,
  exportSummaryEnabled: true
}));

export const BIOLOGY30_V2_INTERACTIONS: BiologyInteractionV2[] = [
  ["interaction-control-system-comparison", "control-system-comparison", "lesson-01", "static-model"],
  ["interaction-negative-feedback-builder", "negative-feedback-builder", "lesson-02", "static-model"],
  ["interaction-neuron-pathway-sort", "neuron-pathway-sort", "lesson-03", "static-model"],
  ["interaction-action-potential-explorer", "action-potential-graph", "lesson-04", "static-model"],
  ["interaction-synapse-sequence", "synapse-sequence", "lesson-05", "static-model"],
  ["interaction-brain-symptom-locator", "brain-symptom-locator", "lesson-06", "static-model"],
  ["interaction-reflex-arc-builder", "reflex-arc-builder", "lesson-07", "supplied-data"],
  ["interaction-sensory-investigation-planner", "investigation-planner", "lesson-08", "supplied-data"],
  ["interaction-eye-light-path", "eye-light-path", "lesson-09", "static-model"],
  ["interaction-audiogram-evidence-explorer", "audiogram-evidence", "lesson-10", "supplied-data"],
  ["interaction-sensory-evidence-board", "evidence-board", "lesson-11", "printable"],
  ["interaction-endocrine-body-map", "endocrine-body-map", "lesson-12", "static-model"],
  ["interaction-hypothalamus-pituitary-feedback", "feedback-simulator", "lesson-13", "static-model"],
  ["interaction-thyroid-calcium-feedback", "feedback-simulator", "lesson-14", "static-model"],
  ["interaction-blood-glucose-simulator", "blood-glucose-simulator", "lesson-15", "supplied-data"],
  ["interaction-water-salt-data-lab", "water-salt-data-lab", "lesson-16", "supplied-data"],
  ["interaction-integrated-case-board", "integrated-case-board", "lesson-17", "printable"]
].map(([id, kind, lessonId, fallbackType]) => ({
  id,
  kind,
  lessonId,
  responseIds: [`biology30-unit-a:activity:${id.replace(/^interaction-/, "")}:state`],
  completionRule: "Learner completes the reasoning prompt and receives or reveals explanatory feedback.",
  fallbackType: fallbackType as BiologyInteractionV2["fallbackType"]
}));

const CORRECTIONS: BiologyCorrectionRecordV1[] = [
  {
    id: "myelin-white-grey-regeneration",
    sourcePages: [12],
    severity: "blocker",
    sourceProblem: "The slide equates myelinated neurons with white matter, unmyelinated neurons with grey matter, and regeneration with myelination status.",
    requiredTreatment: "Teach white/grey matter as tissue-level organization and distinguish Schwann-cell PNS support from oligodendrocyte CNS myelination and the limits on axon regeneration.",
    verification: "No learner text may repeat the three binary claims from the source table."
  },
  {
    id: "multiple-sclerosis-causation",
    sourcePages: [14],
    severity: "blocker",
    sourceProblem: "The slide calls multiple sclerosis a genetic disorder.",
    requiredTreatment: "Describe MS as an immune-mediated demyelinating disease with multifactorial risk; do not present a single genetic cause.",
    verification: "Claim review cites a current authoritative neurological source."
  },
  {
    id: "teacher-memorization-language",
    sourcePages: [38, 40, 60, 76, 108, 112],
    severity: "major",
    sourceProblem: "Teacher-facing memorization and testing directions are embedded in the learner notes.",
    requiredTreatment: "Replace them with learner targets, retrieval support, and curriculum-bounded explanations.",
    verification: "Automated scan rejects 'do not need to memorize', 'will not be tested', and equivalent teacher notes."
  },
  {
    id: "autonomic-system-collage",
    sourcePages: [48],
    severity: "major",
    sourceProblem: "The collage is visually dense, unlicensed for reuse, and includes oversimplified organ effects.",
    requiredTreatment: "Create an original accessible comparison using context-dependent sympathetic and parasympathetic effects and a long-description table.",
    verification: "Figure has title, description, table equivalent, source record, and no copied artwork."
  },
  {
    id: "hemisphere-neuromyth",
    sourcePages: [58],
    severity: "blocker",
    sourceProblem: "The slide presents analytical left-brain and creative right-brain personality framing.",
    requiredTreatment: "Teach limited functional lateralization, distributed networks, hemispheric communication, and why the personality dichotomy is unsupported.",
    verification: "Regression scan rejects analytical-left/creative-right personality claims."
  },
  {
    id: "external-only-context",
    sourcePages: [5, 63, 66, 139],
    severity: "major",
    sourceProblem: "Required understanding is deferred to external videos or links.",
    requiredTreatment: "Recreate all required explanations and review locally; retain links only as optional enrichment.",
    verification: "Network-blocked E2E retains complete required instruction."
  },
  {
    id: "sensory-table-recreation",
    sourcePages: [72],
    severity: "major",
    sourceProblem: "The source is a raster table with incomplete context and no text equivalent.",
    requiredTreatment: "Create an original semantic receptor matrix and explain modality, receptor, organ, stimulus, and transduction.",
    verification: "Screen-reader table and figure description communicate all relationships."
  },
  {
    id: "source-typos",
    sourcePages: [74, 94],
    severity: "editorial",
    sourceProblem: "The slides contain terminology and proofreading errors, including 'unami' and 'fels'.",
    requiredTreatment: "Use 'umami' and fully proofread all recreated content.",
    verification: "Editorial scan and human review find no inherited source typo."
  },
  {
    id: "visual-perception-oversimplification",
    sourcePages: [83, 86],
    severity: "blocker",
    sourceProblem: "The slides say the brain flips the image and suggest newborns initially see the world upside down.",
    requiredTreatment: "Explain retinal image formation and neural processing without a literal brain-flip mechanism; exclude the unsupported newborn claim.",
    verification: "Claim review confirms both source statements are absent or explicitly corrected."
  },
  {
    id: "hearing-activity-safety",
    sourcePages: [91, 95],
    severity: "blocker",
    sourceProblem: "The hearing sequence does not establish a safe, calibrated, non-diagnostic boundary for a browser-based learner activity.",
    requiredTreatment: "Use a sourced or clearly synthetic audiogram for evidence analysis; never present browser tones as a hearing test, require high-volume audio, or make a diagnostic claim.",
    verification: "Keyboard and network-blocked tests use visual evidence without mandatory audio, and learner text states that the activity is not a hearing test."
  },
  {
    id: "feedback-versus-stimulus-response",
    sourcePages: [100, 102, 103, 104],
    severity: "blocker",
    sourceProblem: "Several source diagrams can be read as linear stimulus-response chains rather than closed regulatory feedback systems.",
    requiredTreatment: "Explicitly distinguish negative feedback from a one-way stimulus-response pathway by identifying the regulated variable, detector, control centre, effector, response, and return signal.",
    verification: "Every required feedback model visibly closes the loop and prompts the learner to predict the effect of a disruption."
  },
  {
    id: "hormone-signalling-stages",
    sourcePages: [101, 106, 107, 108, 109],
    severity: "major",
    sourceProblem: "Compressed slide diagrams can blur hormone release, bloodstream transport, receptor binding, and the target-cell response.",
    requiredTreatment: "Teach and label hormone release, transport, receptor binding, signal-specific target selection, target response, and feedback as distinct stages.",
    verification: "The endocrine architecture lesson and model assess each stage separately and do not imply that circulation alone causes a response."
  },
  {
    id: "instructional-data-labelling",
    sourcePages: [91, 133, 136],
    severity: "blocker",
    sourceProblem: "The production plan requires new audiogram, urinalysis, glucose, and stress datasets that are not present as complete rights-safe local datasets in the sources.",
    requiredTreatment: "Cite every quantitative dataset or visibly label it 'synthetic instructional data'; record generation assumptions and never use it for diagnosis.",
    verification: "Automated data inventory rejects any required quantitative display without a citation or the exact synthetic instructional data label."
  },
  {
    id: "feedback-insulin-targets",
    sourcePages: [104, 130, 131],
    severity: "blocker",
    sourceProblem: "The slides imply insulin makes all body cells permeable to glucose and use an oversimplified or dated regulation diagram.",
    requiredTreatment: "Explain tissue-specific insulin effects, liver and skeletal-muscle glycogen storage, adipose responses, and glucagon's principal liver action using a newly authored loop.",
    verification: "Regression scan rejects 'all cells become permeable' and glucagon-driven muscle glucose release."
  },
  {
    id: "pituitary-scope-and-clipping",
    sourcePages: [112, 114, 119, 120],
    severity: "major",
    sourceProblem: "The pituitary overview is clipped and mixes reproductive hormones that belong primarily to Unit B into the Unit A memory burden.",
    requiredTreatment: "Rebuild only the Unit A-required hypothalamus/pituitary, hGH, ADH, TSH, and ACTH relationships; keep FSH, LH, prolactin, and oxytocin as reference-only where needed for later units.",
    verification: "Outcome map shows no Unit B expansion and the new axis figure is unclipped."
  },
  {
    id: "caffeine-adh-claim",
    sourcePages: [117],
    severity: "major",
    sourceProblem: "The slide gives an overly simple claim that caffeine inhibits ADH production and necessarily produces large fluid loss.",
    requiredTreatment: "Use cautious, current language about caffeine's variable mild diuretic effects and keep the lesson focused on ADH physiology.",
    verification: "Current authoritative cross-check is recorded before Gate 1 publication."
  },
  {
    id: "diabetes-insipidus-details",
    sourcePages: [118],
    severity: "major",
    sourceProblem: "The slide compresses central and nephrogenic diabetes insipidus and overstates ion loss and one treatment pathway.",
    requiredTreatment: "Differentiate deficient ADH release from reduced kidney response, emphasize water-balance evidence, and avoid medical advice.",
    verification: "Claim review cites an authoritative current health source."
  },
  {
    id: "thyroid-terminology",
    sourcePages: [123, 124],
    severity: "blocker",
    sourceProblem: "Source treatment includes dated terminology and can imply a simple one-cause model for thyroid disorders.",
    requiredTreatment: "Use current terms such as congenital hypothyroidism, explain historical terminology only if necessary, and distinguish primary from central feedback patterns.",
    verification: "Automated scan rejects the historical term unless its context explicitly marks it as historical."
  },
  {
    id: "diabetes-stereotypes-and-treatment",
    sourcePages: [132, 133],
    severity: "blocker",
    sourceProblem: "The slides use dated age-based type 1/type 2 descriptions and simplified treatment statements.",
    requiredTreatment: "Use current distinctions based on autoimmune beta-cell destruction and insulin resistance/relative deficiency; avoid diagnostic or treatment advice.",
    verification: "NIDDK or equivalent current official source is recorded and all medical-safety language passes review."
  },
  {
    id: "stress-diagram-recreation",
    sourcePages: [135, 136],
    severity: "major",
    sourceProblem: "Key stress and adrenal relationships are image-only and visually fragmented.",
    requiredTreatment: "Create an original short-term versus long-term stress comparison and a separate water/salt model.",
    verification: "Both figures include long descriptions and supplied-data applications."
  }
];

const CORRECTION_PAGES = new Set(CORRECTIONS.flatMap((record) => record.sourcePages));

function pageLessons(page: number): string[] {
  if (page === 6) return ["lesson-01"];
  if (page >= 7 && page <= 17) return ["lesson-03"];
  if (page >= 18 && page <= 20) return ["lesson-07"];
  if (page >= 21 && page <= 30) return ["lesson-04"];
  if (page >= 31 && page <= 42) return ["lesson-05"];
  if (page >= 43 && page <= 66) return ["lesson-06"];
  if (page >= 69 && page <= 77) return ["lesson-08"];
  if (page >= 78 && page <= 87) return ["lesson-09"];
  if (page >= 88 && page <= 96) return ["lesson-10"];
  if (page >= 100 && page <= 105) return ["lesson-01", "lesson-02", "lesson-12"];
  if (page >= 106 && page <= 109) return ["lesson-02", "lesson-12"];
  if (page >= 110 && page <= 120) return ["lesson-13"];
  if (page >= 121 && page <= 128) return ["lesson-14"];
  if (page >= 129 && page <= 133) return ["lesson-15"];
  if (page >= 134 && page <= 137) return ["lesson-16"];
  if (page >= 138 && page <= 139) return ["lesson-17"];
  return [];
}

const REDUNDANT_PAGES = new Set([2, 3, 4, 67, 68, 97, 98, 99]);
const REFERENCE_ONLY_PAGES = new Set([1, 5, 62, 63, 64, 65, 86, 93, 114, 119]);

export function buildPdfPageDisposition(): BiologyPdfPageDispositionV1[] {
  return Array.from({ length: 139 }, (_value, index) => {
    const page = index + 1;
    if (REDUNDANT_PAGES.has(page)) {
      return {
        page,
        status: "excluded-redundant" as const,
        lessonIds: [],
        reason: "Chapter title, index, or source outcome slide is superseded by the official curriculum map and native course navigation."
      };
    }
    if (REFERENCE_ONLY_PAGES.has(page)) {
      return {
        page,
        status: "reference-only" as const,
        lessonIds: pageLessons(page),
        reason:
          page === 114 || page === 119
            ? "The page primarily introduces reproductive hormones reserved for Unit B and is retained only for source context."
            : "The page is retained for source context or optional enrichment but is not required learner instruction."
      };
    }
    const lessonIds = pageLessons(page);
    if (lessonIds.length === 0) throw new Error(`PDF page ${page} is not dispositioned.`);
    if (CORRECTION_PAGES.has(page)) {
      const correctionIds = CORRECTIONS.filter((record) => record.sourcePages.includes(page)).map((record) => record.id);
      return {
        page,
        status: "corrected" as const,
        lessonIds,
        reason: `The underlying topic is required, but the source treatment must be corrected or natively recreated under: ${correctionIds.join(", ")}.`
      };
    }
    return {
      page,
      status: "used" as const,
      lessonIds,
      reason: "The page contributes source concepts that will be rewritten as native, curriculum-aligned web instruction."
    };
  });
}

function modulePracticeRoute(lessonId: string) {
  const lesson = BIOLOGY30_V2_LESSONS.find((candidate) => candidate.id === lessonId);
  if (!lesson) throw new Error(`Unknown lesson ${lessonId} while building outcome practice routes.`);
  return lesson.moduleId === "module-6" ? "practice-hub#integrated-final" : `practice-hub#${lesson.moduleId}`;
}

export function buildOutcomeRecords(): BiologyOutcomeRecordV2[] {
  return OUTCOME_SEEDS.map((outcome) => ({
    id: outcome.id,
    officialText: outcome.officialText,
    category: outcome.category,
    authorityUrl: ALBERTA_PROGRAM_URL,
    teachRoutes: outcome.lessonIds,
    practiceRoutes: [
      ...outcome.lessonIds.map((lessonId) => `${lessonId}#practice`),
      ...new Set(outcome.lessonIds.map(modulePracticeRoute))
    ],
    evidenceRoutes: outcome.evidenceRoutes
  }));
}

export function buildProductionSources(resources: NamedBrightspaceResource[], generatedAt: string): BiologyProductionSourceV2[] {
  const brightspaceSources: BiologyProductionSourceV2[] = resources.map((resource) => ({
    id: resource.id,
    label: resource.label,
    kind: "brightspace-export",
    role: resource.role,
    path: resource.path,
    sha256: resource.sha256,
    originalName: resource.originalName,
    rightsStatus: "authorized-local-course-source",
    allowedUse: "Local course development and Brightspace delivery; source files remain unchanged."
  }));
  return [
    ...brightspaceSources,
    {
      id: "unit-a-notes",
      label: "Unit A Nervous and Endocrine Systems Notes",
      kind: "source-pdf",
      role: "primary",
      path: `${resources.find((resource) => resource.id === "class-2026-27")?.path ?? ""}#Unit A Nervous and Endocrine Systems Notes.pdf`,
      sha256: BIOLOGY30_NOTES_SHA256,
      originalName: "Unit A Nervous and Endocrine Systems Notes.pdf",
      origins: [
        {
          kind: "shared-archive-entry",
          locator: `${resources.find((resource) => resource.id === "class-2026-27")?.path ?? ""}#Unit A Nervous and Endocrine Systems Notes.pdf`,
          sha256: BIOLOGY30_NOTES_SHA256
        },
        {
          kind: "supplied-download",
          locator: "/Users/deanguedo/Downloads/Unit A Nervous and Endocrine Systems Notes.pdf",
          sha256: BIOLOGY30_NOTES_SHA256
        }
      ],
      rightsStatus: "authorized-local-course-source",
      allowedUse: "Rewrite and redraw as local native instruction; do not deliver slide images as lessons."
    },
    {
      id: "alberta-program-of-studies",
      label: "Alberta Biology 20–30 Program of Studies",
      kind: "official-curriculum",
      role: "authority",
      url: ALBERTA_PROGRAM_URL,
      retrievedAt: generatedAt,
      rightsStatus: "official-public-curriculum",
      allowedUse: "Outcome authority, quotation of outcome wording, mapping, and citation."
    },
    {
      id: "alberta-performance-standards",
      label: "Biology 30 Student-based Performance Standards",
      kind: "official-curriculum",
      role: "authority",
      url: ALBERTA_PERFORMANCE_URL,
      retrievedAt: generatedAt,
      rightsStatus: "official-public-performance-guidance",
      allowedUse: "Performance evidence, cognitive demand, investigation, and data-interpretation guidance."
    },
    {
      id: "alberta-biology-bulletin-2025-26",
      label: "Biology 30 Information Bulletin 2025–2026",
      kind: "official-curriculum",
      role: "authority",
      url: ALBERTA_BIOLOGY_BULLETIN_URL,
      retrievedAt: generatedAt,
      rightsStatus: "official-public-assessment-guidance",
      allowedUse: "Diploma blueprint and cognitive-level guidance; refresh before Gate 1."
    },
    {
      id: "alberta-diploma-general-2026-27",
      label: "Diploma Examination General Information Bulletin 2026–2027",
      kind: "official-curriculum",
      role: "authority",
      url: ALBERTA_DIPLOMA_GENERAL_URL,
      retrievedAt: generatedAt,
      rightsStatus: "official-public-assessment-guidance",
      allowedUse: "Current diploma-examination process context only."
    },
    {
      id: "openstax-anatomy-physiology-2e",
      label: "OpenStax Anatomy and Physiology 2e",
      kind: "authoritative-supplement",
      role: "supplement",
      url: "https://openstax.org/details/books/anatomy-and-physiology-2e",
      retrievedAt: generatedAt,
      rightsStatus: "CC-BY-4.0",
      allowedUse: "Factual cross-checking and attributed adaptation; no untracked copying."
    },
    ...[
      ["ninds-health-information", "NINDS Health Information", "https://www.ninds.nih.gov/health-information"],
      ["niddk-diabetes", "NIDDK: What Is Diabetes?", "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes"],
      ["nei-how-eyes-work", "National Eye Institute: How the Eyes Work", "https://www.nei.nih.gov/learn-about-eye-health/healthy-vision/how-eyes-work"],
      ["nidcd-how-hearing-works", "NIDCD: How Do We Hear?", "https://www.nidcd.nih.gov/health/how-do-we-hear"],
      ["health-canada", "Health Canada", "https://www.canada.ca/en/health-canada.html"]
    ].map(([id, label, url]) => ({
      id,
      label,
      kind: "authoritative-supplement" as const,
      role: "supplement" as const,
      url,
      retrievedAt: generatedAt,
      rightsStatus: "official-government-source; page-specific rights and retrieval must be verified before Gate 1 use",
      allowedUse: "Current factual cross-checking and paraphrase after page-specific source registration."
    }))
  ];
}

export function createProductionContract(input: {
  resources: NamedBrightspaceResource[];
  generatedAt: string;
}): BiologyProductionContractV1 {
  return {
    schemaVersion: 1,
    profileId: BIOLOGY30_V2_PROFILE,
    family: BIOLOGY30_V2_FAMILY,
    project: {
      slug: BIOLOGY30_V2_PROJECT,
      title: BIOLOGY30_V2_TITLE,
      courseCode: "BIO 30",
      version: "production-candidate-v2"
    },
    status: {
      authoringStatus: "blocked",
      driverId: "proposal-only-v1",
      reviewGate: "gate-0-awaiting-approval",
      studioEditingEnabled: false,
      exportEnabled: false
    },
    curriculum: {
      unitTitle: "Unit A: Nervous and Endocrine Systems",
      unitCourseTimePercent: 25,
      diplomaEmphasisPercent: { minimum: 20, maximum: 25 },
      programOfStudiesUrl: ALBERTA_PROGRAM_URL,
      performanceStandardsUrl: ALBERTA_PERFORMANCE_URL,
      currentBiologyBulletinUrl: ALBERTA_BIOLOGY_BULLETIN_URL,
      currentBiologyBulletinSchoolYear: "2025-26",
      diplomaGeneralBulletinUrl: ALBERTA_DIPLOMA_GENERAL_URL,
      diplomaGeneralBulletinSchoolYear: "2026-27",
      biologyBulletin2026_27Found: false,
      refreshRequiredBeforeGate1: true
    },
    delivery: {
      mode: "independent-first-asynchronous",
      requiredMinutes: 1505,
      optionalMinutes: 295,
      requiredInternet: false,
      requiredTeacherPresence: false,
      requiredPeerAvailability: false
    },
    assessment: {
      boundary: "formative-practice-and-submission-ready-artifacts",
      secureSummativeLocation: "brightspace",
      minimumPracticeItems: 100,
      artifactCount: 7
    },
    visualProfile: {
      id: "next-step-scientific-editorial-v1",
      remoteAssetsAllowedForCompletion: false,
      sourceSlidesAllowedAsLessons: false
    },
    learnerRoutes: [
      "overview",
      ...BIOLOGY30_V2_LESSONS.map((candidate) => candidate.id),
      "model-lab",
      "investigation-notebook",
      "practice-hub",
      "glossary-and-data",
      "sources-and-credits"
    ],
    sources: buildProductionSources(input.resources, input.generatedAt),
    sourceRefs: SOURCE_REFS,
    outcomes: buildOutcomeRecords(),
    lessons: BIOLOGY30_V2_LESSONS,
    artifacts: BIOLOGY30_V2_ARTIFACTS,
    interactions: BIOLOGY30_V2_INTERACTIONS,
    practiceBlueprint: {
      lessonChecks: 51,
      moduleChecks: 25,
      finalPractice: 24,
      total: 100,
      cognitiveDistribution: {
        rememberUnderstandPercent: { minimum: 25, maximum: 35 },
        applyPercent: { minimum: 45, maximum: 55 },
        higherMentalActivityPercent: { minimum: 15, maximum: 25 }
      }
    },
    reviewGates: [
      { id: "gate-0", label: "Curriculum and source contract", requiresHumanApproval: true, status: "ready" },
      { id: "gate-1", label: "Two-lesson visual vertical slice", requiresHumanApproval: true, status: "blocked" },
      { id: "gate-2", label: "Full-course production", requiresHumanApproval: false, status: "blocked" },
      { id: "gate-3", label: "Academic, visual, and technical red-team", requiresHumanApproval: true, status: "blocked" },
      { id: "gate-4", label: "Direct-source promotion and Studio readiness", requiresHumanApproval: true, status: "blocked" },
      { id: "gate-5", label: "SCORM release and Brightspace validation", requiresHumanApproval: true, status: "blocked" }
    ],
    promotionPolicy: {
      automaticPromotion: false,
      minimumScore: 95,
      minimumCategoryPercent: 80,
      freezeComparisonPilotsOnPromotion: true,
      comparisonPilotsBecome: "reference-only",
      winnerDriver: "direct-workspace-v1",
      exportFormat: "scorm-2004"
    },
    generatedAt: input.generatedAt
  };
}

export function getCorrectionLedger() {
  return CORRECTIONS.map((record) => ({ ...record, sourcePages: [...record.sourcePages] }));
}

export function validateProductionSourceManifest(resources: NamedBrightspaceResource[]) {
  if (resources.length !== 2) throw new Error("Biology 30 V2 requires exactly two named Brightspace resources.");
  const byId = new Map(resources.map((resource) => [resource.id, resource]));
  for (const [sourceId, expectedHash] of REQUIRED_SOURCE_HASHES) {
    const resource = byId.get(sourceId);
    if (!resource) throw new Error(`Missing required Biology 30 V2 source ${sourceId}.`);
    if (resource.sha256 !== expectedHash) {
      throw new Error(`Source contract drift for ${sourceId}: expected ${expectedHash}, received ${resource.sha256}.`);
    }
  }
  const primary = byId.get("class-2026-27");
  const reference = byId.get("system-2020");
  if (primary?.role !== "primary" || reference?.role !== "reference") {
    throw new Error("Biology 30 V2 requires class-2026-27 as primary and system-2020 as reference.");
  }
}

function assertUnique(values: string[], label: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

export function validateProductionContract(contract: BiologyProductionContractV1) {
  if (contract.schemaVersion !== 1 || contract.profileId !== BIOLOGY30_V2_PROFILE) {
    throw new Error("Invalid Biology 30 Unit A V2 production contract identity.");
  }
  if (contract.project.slug !== BIOLOGY30_V2_PROJECT || contract.status.driverId !== "proposal-only-v1") {
    throw new Error("Biology 30 Unit A V2 must remain a blocked proposal at Gate 0.");
  }
  if (contract.status.studioEditingEnabled || contract.status.exportEnabled || contract.status.authoringStatus !== "blocked") {
    throw new Error("Gate 0 must not enable Studio editing or export.");
  }
  if (contract.lessons.length !== 17) throw new Error(`Expected 17 Biology lessons, received ${contract.lessons.length}.`);
  if (contract.outcomes.length !== 25) throw new Error(`Expected 25 Unit A outcomes, received ${contract.outcomes.length}.`);
  if (contract.artifacts.length !== 7) throw new Error(`Expected seven portfolio artifacts, received ${contract.artifacts.length}.`);
  if (contract.practiceBlueprint.total !== 100) throw new Error("The Gate 0 practice blueprint must total 100 items.");
  const requiredMinutes = contract.lessons.reduce((total, candidate) => total + candidate.requiredMinutes, 0);
  const optionalMinutes = contract.lessons.reduce((total, candidate) => total + candidate.optionalMinutes, 0);
  if (requiredMinutes !== 1505) throw new Error(`Required lesson minutes total ${requiredMinutes}, expected 1505.`);
  if (optionalMinutes !== 295) throw new Error(`Optional lesson minutes total ${optionalMinutes}, expected 295.`);
  assertUnique(contract.lessons.map((candidate) => candidate.id), "lesson ID");
  assertUnique(contract.outcomes.map((candidate) => candidate.id), "outcome ID");
  assertUnique(contract.sourceRefs.map((candidate) => candidate.id), "source reference ID");
  assertUnique(contract.artifacts.map((candidate) => candidate.id), "artifact ID");
  assertUnique(contract.interactions.map((candidate) => candidate.id), "interaction ID");
  assertUnique(contract.learnerRoutes, "learner route");
  const outcomeIds = new Set(contract.outcomes.map((outcome) => outcome.id));
  const sourceRefIds = new Set(contract.sourceRefs.map((source) => source.id));
  const lessonIds = new Set(contract.lessons.map((candidate) => candidate.id));
  const artifactIds = new Set(contract.artifacts.map((artifact) => artifact.id));
  const interactionIds = new Set(contract.interactions.map((interaction) => interaction.id));
  for (const outcome of contract.outcomes) {
    if (!outcome.officialText.trim() || outcome.teachRoutes.length === 0 || outcome.practiceRoutes.length === 0 || outcome.evidenceRoutes.length === 0) {
      throw new Error(`Outcome ${outcome.id} lacks official text or teach/practice/evidence coverage.`);
    }
    if (outcome.teachRoutes.every((route) => route === "lesson-17")) {
      throw new Error(`Outcome ${outcome.id} is taught only in the final review.`);
    }
  }
  for (const candidate of contract.lessons) {
    for (const outcomeId of candidate.outcomeIds) if (!outcomeIds.has(outcomeId)) throw new Error(`Lesson ${candidate.id} references unknown outcome ${outcomeId}.`);
    for (const sourceRefId of candidate.sourceRefIds) if (!sourceRefIds.has(sourceRefId)) throw new Error(`Lesson ${candidate.id} references unknown source ${sourceRefId}.`);
    for (const prerequisite of candidate.prerequisiteLessonIds) if (!lessonIds.has(prerequisite)) throw new Error(`Lesson ${candidate.id} references unknown prerequisite ${prerequisite}.`);
    for (const artifactId of candidate.artifactIds) if (!artifactIds.has(artifactId)) throw new Error(`Lesson ${candidate.id} references unknown artifact ${artifactId}.`);
    for (const interactionId of candidate.interactionIds) if (!interactionIds.has(interactionId)) throw new Error(`Lesson ${candidate.id} references unknown interaction ${interactionId}.`);
  }
  const dispositions = buildPdfPageDisposition();
  if (dispositions.length !== 139 || new Set(dispositions.map((entry) => entry.page)).size !== 139) {
    throw new Error("All 139 notes pages must have exactly one disposition.");
  }
}
