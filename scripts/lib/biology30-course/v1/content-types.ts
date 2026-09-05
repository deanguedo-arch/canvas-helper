import type { Biology30ProductionUnitCode } from "./curriculum.js";

export type Biology30ContentSection = {
  label?: string;
  title: string;
  paragraphs: string[];
  table?: {
    caption: string;
    headers: string[];
    rows: string[][];
  };
};

export type Biology30InteractionCase = {
  id: string;
  label: string;
  evidence: string;
  explanation: string;
};

export type Biology30PracticeSeed = {
  id: string;
  cognitiveLevel: "remember-understand" | "apply" | "higher-mental-activity";
  prompt: string;
  correct: string;
  distractors: [string, string, string];
  rationale: string;
  misconceptionFeedback: [string, string, string];
};

export type Biology30LessonContent = {
  id: string;
  unitCode: Biology30ProductionUnitCode;
  learningIntention: string;
  successCriteria: [string, string, string];
  materials: string;
  safety: string;
  warmup: {
    title: string;
    prompt: string;
    placeholder: string;
  };
  sections: Biology30ContentSection[];
  conceptMap: {
    title: string;
    description: string;
    nodes: Array<{ label: string; detail: string }>;
  };
  interaction: {
    title: string;
    intro: string;
    prompt: string;
    cases: [Biology30InteractionCase, Biology30InteractionCase, Biology30InteractionCase];
    staticFallback: string;
  };
  practiceSeeds: Biology30PracticeSeed[];
  artifact: {
    prompt: string;
    evidenceRequirements: [string, string, string];
  };
  exit: {
    title: string;
    prompt: string;
    placeholder: string;
  };
  glossaryTerms: string[];
  sourceSummary: string;
};

export function validateBiology30LessonContent(records: Biology30LessonContent[]) {
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) throw new Error(`Duplicate Biology 30 content record ${record.id}.`);
    ids.add(record.id);
    if (!record.learningIntention.startsWith("I am learning to ")) {
      throw new Error(`${record.id} needs a learner-facing learning intention.`);
    }
    if (record.sections.length < 4 || record.sections.some((section) => section.paragraphs.length < 2)) {
      throw new Error(`${record.id} needs at least four developed explanatory sections.`);
    }
    if (record.practiceSeeds.length < 3 || new Set(record.practiceSeeds.map((seed) => seed.id)).size !== record.practiceSeeds.length) {
      throw new Error(`${record.id} needs at least three unique practice seeds.`);
    }
    if (record.conceptMap.nodes.length < 3 || record.interaction.cases.length !== 3) {
      throw new Error(`${record.id} needs a complete concept model and three-case interaction.`);
    }
    for (const paragraph of record.sections.flatMap((section) => section.paragraphs)) {
      const words = paragraph.trim().split(/\s+/).length;
      if (words > 120) throw new Error(`${record.id} contains a paragraph longer than 120 words.`);
    }
  }
}
