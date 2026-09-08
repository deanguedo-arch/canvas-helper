import type { Biology30ContentSection, Biology30InteractionCase, Biology30LessonContent } from "./content-types.js";
import type { Biology30ProductionUnitCode } from "./curriculum.js";

export type Biology30CompactSection = {
  label: string;
  title: string;
  mechanism: string;
  evidence: string;
  table?: Biology30ContentSection["table"];
};

export type Biology30CompactLessonSpec = {
  id: string;
  unitCode: Biology30ProductionUnitCode;
  learningIntention: string;
  successCriteria: [string, string, string];
  materials: string;
  safety: string;
  warmup: { title: string; prompt: string; placeholder: string };
  sections: [Biology30CompactSection, Biology30CompactSection, Biology30CompactSection, Biology30CompactSection];
  conceptMap: Biology30LessonContent["conceptMap"];
  interaction: {
    title: string;
    intro: string;
    prompt: string;
    cases: [Biology30InteractionCase, Biology30InteractionCase, Biology30InteractionCase];
    staticFallback: string;
  };
  practice: {
    anchorPrompt: string;
    anchorCorrect: string;
    misconceptions: [string, string, string];
    anchorRationale: string;
    boundedPrompt: string;
    boundedCorrect: string;
    overclaims: [string, string, string];
    boundedRationale: string;
  };
  artifact: Biology30LessonContent["artifact"];
  exit: Biology30LessonContent["exit"];
  glossaryTerms: string[];
  sourceSummary: string;
};

export function buildBiology30CompactLesson(spec: Biology30CompactLessonSpec): Biology30LessonContent {
  const secondCase = spec.interaction.cases[1];
  const firstCase = spec.interaction.cases[0];
  const thirdCase = spec.interaction.cases[2];
  const anchorFeedback = spec.practice.misconceptions.map((misconception, index) => {
    const lead = [
      "This assigns the mechanism, structure, or signal incorrectly.",
      "This misses an important change in timing, location, or biological level.",
      "This turns a bounded relationship into a rule that the evidence does not support."
    ][index];
    return `“${misconception}” is not supported. ${lead} ${spec.practice.anchorRationale}`;
  }) as [string, string, string];
  const boundedFeedback = spec.practice.overclaims.map((overclaim, index) => {
    const lead = [
      "The conclusion extends beyond the population, condition, or evidence that was examined.",
      "The conclusion removes biologically important variation or uncertainty.",
      "The conclusion substitutes certainty, diagnosis, or a value judgment for a scientific inference."
    ][index];
    return `“${overclaim}” overstates the result. ${lead} ${spec.practice.boundedRationale}`;
  }) as [string, string, string];
  return {
    id: spec.id,
    unitCode: spec.unitCode,
    learningIntention: spec.learningIntention,
    successCriteria: spec.successCriteria,
    materials: spec.materials,
    safety: spec.safety,
    warmup: spec.warmup,
    sections: spec.sections.map((section) => ({
      label: section.label,
      title: section.title,
      paragraphs: [section.mechanism, section.evidence],
      ...(section.table ? { table: section.table } : {})
    })),
    conceptMap: spec.conceptMap,
    interaction: spec.interaction,
    practiceSeeds: [
      {
        id: `${spec.id}-anchor`,
        cognitiveLevel: "remember-understand",
        prompt: spec.practice.anchorPrompt,
        correct: spec.practice.anchorCorrect,
        distractors: spec.practice.misconceptions,
        rationale: `${spec.practice.anchorRationale} The correct statement identifies the relevant structure, signal, process, or evidence without adding a claim the lesson cannot support.`,
        misconceptionFeedback: anchorFeedback
      },
      {
        id: `${spec.id}-evidence`,
        cognitiveLevel: "apply",
        prompt: `${firstCase.evidence} Which explanation best connects this evidence to the lesson mechanism?`,
        correct: firstCase.explanation,
        distractors: [secondCase.explanation, thirdCase.explanation, "The observation is enough to prove a single cause, so no comparison or additional evidence is needed."],
        rationale: `${firstCase.explanation} This interpretation matches the selected evidence while preserving the distinction between an observation, a mechanism, and a conclusion.`,
        misconceptionFeedback: [
          `That explanation matches “${secondCase.label},” where the defining evidence is: ${secondCase.evidence} It does not account for the evidence in “${firstCase.label}.”`,
          `That explanation matches “${thirdCase.label},” where the defining evidence is: ${thirdCase.evidence} It does not account for the evidence in “${firstCase.label}.”`,
          `The “${firstCase.label}” observation supports a mechanism-level inference, not proof of one unique cause. ${spec.interaction.staticFallback}`
        ]
      },
      {
        id: `${spec.id}-bounded`,
        cognitiveLevel: "higher-mental-activity",
        prompt: spec.practice.boundedPrompt,
        correct: spec.practice.boundedCorrect,
        distractors: spec.practice.overclaims,
        rationale: `${spec.practice.boundedRationale} Strong scientific communication is specific about the evidence, the mechanism, uncertainty, and the limits of application.`,
        misconceptionFeedback: boundedFeedback
      },
      ...(spec.unitCode === "C" ? [{
        id: `${spec.id}-transfer`,
        cognitiveLevel: "apply" as const,
        prompt: `${secondCase.evidence} Which explanation is most consistent with this new evidence?`,
        correct: secondCase.explanation,
        distractors: [firstCase.explanation, thirdCase.explanation, "The result proves that every organism, family, or cell must show the same outcome." ] as [string, string, string],
        rationale: `${secondCase.explanation} Transfer practice requires matching the mechanism to the changed evidence rather than repeating the answer from another case.`,
        misconceptionFeedback: [
          `That interpretation fits “${firstCase.label},” where the evidence is: ${firstCase.evidence} The transfer prompt instead describes “${secondCase.label}.”`,
          `That interpretation fits “${thirdCase.label},” where the evidence is: ${thirdCase.evidence} Trace the defining variable or stage in “${secondCase.label}” before choosing.`,
          `The evidence in “${secondCase.label}” supports this bounded explanation: ${secondCase.explanation} It cannot establish a universal outcome for every organism, family, or cell.`
        ] as [string, string, string]
      }] : [])
    ],
    artifact: spec.artifact,
    exit: spec.exit,
    glossaryTerms: spec.glossaryTerms,
    sourceSummary: spec.sourceSummary
  };
}
