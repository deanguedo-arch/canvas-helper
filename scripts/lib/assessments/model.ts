import type {
  AssessmentProject,
  AssessmentProjectInput,
  Choice,
  MatchingChoice,
  Question,
  QuestionType,
  SourceDocument,
  Section
} from "./schema.js";
import { AssessmentProjectSchema, QuestionSchema } from "./schema.js";

function createIdentifier(prefix: string) {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createChoice(
  questionId: string,
  suffix: string,
  label: string,
  text = "",
  orderIndex = 0
): Choice {
  return {
    choiceId: `${questionId}_${suffix}`,
    label,
    text,
    isCorrect: false,
    orderIndex,
    matchKey: null,
    fixedPosition: null,
    matchRole: null
  };
}

function createMatchingChoice(
  questionId: string,
  suffix: string,
  label: string,
  matchRole: "prompt" | "match",
  matchKey: string,
  orderIndex: number
): MatchingChoice {
  return {
    choiceId: `${questionId}_${suffix}`,
    label,
    text: "",
    isCorrect: false,
    orderIndex,
    matchKey,
    fixedPosition: null,
    matchRole
  };
}

function createDefaultChoices(type: QuestionType, questionId: string) {
  switch (type) {
    case "multiple_choice":
    case "multi_select":
      return [
        createChoice(questionId, "choice_a", "A", "", 0),
        createChoice(questionId, "choice_b", "B", "", 1),
        createChoice(questionId, "choice_c", "C", "", 2),
        createChoice(questionId, "choice_d", "D", "", 3)
      ];
    case "true_false":
      return [
        createChoice(questionId, "choice_true", "T", "True", 0),
        createChoice(questionId, "choice_false", "F", "False", 1)
      ];
    case "matching":
      return [
        createMatchingChoice(questionId, "prompt_1", "P1", "prompt", "pair_1", 0),
        createMatchingChoice(questionId, "prompt_2", "P2", "prompt", "pair_2", 1),
        createMatchingChoice(questionId, "match_1", "M1", "match", "pair_1", 2),
        createMatchingChoice(questionId, "match_2", "M2", "match", "pair_2", 3)
      ];
    case "ordering":
      return [
        createChoice(questionId, "step_1", "1", "", 0),
        createChoice(questionId, "step_2", "2", "", 1),
        createChoice(questionId, "step_3", "3", "", 2)
      ];
    case "short_answer":
    case "written_response":
      return [];
    default:
      return [];
  }
}

export function createQuestion(options: Partial<Question> & { type?: QuestionType } = {}) {
  const questionId = options.questionId ?? createIdentifier("question");
  const type = options.type ?? "multiple_choice";

  return QuestionSchema.parse({
    questionId,
    sectionId: options.sectionId ?? null,
    type,
    prompt: options.prompt ?? "",
    stemRichText: options.stemRichText ?? null,
    choices: options.choices ?? createDefaultChoices(type, questionId),
    correctAnswers: options.correctAnswers ?? [],
    points: options.points ?? 1,
    feedbackCorrect: options.feedbackCorrect ?? "",
    feedbackIncorrect: options.feedbackIncorrect ?? "",
    explanation: options.explanation ?? "",
    sourceReference: options.sourceReference ?? "",
    sourcePage: options.sourcePage ?? null,
    originText: options.originText ?? "",
    confidenceScore: options.confidenceScore ?? null,
    answerStatus: options.answerStatus ?? "missing",
    reviewStatus: options.reviewStatus ?? "draft",
    exportNotes: options.exportNotes ?? "",
    metadataTags: options.metadataTags ?? []
  });
}

export function createSourceDocument(options: {
  name?: string;
  type: SourceDocument["type"];
  origin: string;
  importedAt?: string;
}) {
  return {
    sourceDocumentId: createIdentifier("source"),
    name: options.name?.trim().length ? options.name.trim() : options.origin.split(/[\\/]/).at(-1) ?? "source-document",
    type: options.type,
    origin: options.origin,
    importedAt: options.importedAt ?? new Date().toISOString()
  } satisfies SourceDocument;
}

export function createEmptyAssessmentProject(options: {
  projectId?: string;
  title?: string;
  description?: string;
  courseName?: string;
  subjectTags?: string[];
  sourceDocuments?: SourceDocument[];
  sections?: Section[];
  questions?: Question[];
}) {
  const timestamp = new Date().toISOString();
  return AssessmentProjectSchema.parse({
    projectId: options.projectId ?? createIdentifier("assessment"),
    title: options.title ?? "Untitled Assessment",
    description: options.description ?? "",
    courseName: options.courseName ?? "",
    subjectTags: options.subjectTags ?? [],
    sourceDocuments: options.sourceDocuments ?? [],
    sections: options.sections ?? [],
    questions: options.questions ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
    exportHistory: []
  });
}

function letterLabel(index: number) {
  let value = index + 1;
  let label = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = `${String.fromCharCode(65 + remainder)}${label}`;
    value = Math.floor((value - 1) / 26);
  }

  return label;
}

export function normalizeAssessmentProject(projectInput: AssessmentProjectInput): AssessmentProject {
  const project = AssessmentProjectSchema.parse(projectInput);
  const normalizedQuestions = project.questions.map((question) => {
    switch (question.type) {
      case "multiple_choice":
      case "multi_select": {
        const choices = question.choices
          .map((choice, index) => ({
            ...choice,
            label: letterLabel(index),
            orderIndex: index
          }))
          .sort((left, right) => left.orderIndex - right.orderIndex);
        const correctAnswers = choices.filter((choice) => choice.isCorrect).map((choice) => choice.choiceId);
        return {
          ...question,
          choices,
          correctAnswers
        };
      }
      case "true_false": {
        const trueChoice = question.choices.find((choice) => choice.label === "T") ?? question.choices[0];
        const falseChoice = question.choices.find((choice) => choice.label === "F") ?? question.choices[1];
        const choices = [
          {
            ...(trueChoice ?? createChoice(question.questionId, "choice_true", "T", "True", 0)),
            label: "T",
            text: "True",
            orderIndex: 0
          },
          {
            ...(falseChoice ?? createChoice(question.questionId, "choice_false", "F", "False", 1)),
            label: "F",
            text: "False",
            orderIndex: 1
          }
        ];
        const correctAnswers = choices.filter((choice) => choice.isCorrect).map((choice) => choice.choiceId);
        return {
          ...question,
          choices,
          correctAnswers
        };
      }
      case "short_answer":
      case "written_response":
        return {
          ...question,
          choices: []
        };
      case "matching":
        return {
          ...question,
          choices: [...question.choices].sort((left, right) => left.orderIndex - right.orderIndex)
        };
      case "ordering":
        return {
          ...question,
          choices: [...question.choices]
            .map((choice, index) => ({
              ...choice,
              label: String(index + 1),
              orderIndex: index,
              fixedPosition: index === 0 ? true : null
            }))
            .sort((left, right) => left.orderIndex - right.orderIndex)
        };
      default:
        return question;
    }
  });

  return AssessmentProjectSchema.parse({
    ...project,
    questions: normalizedQuestions,
    updatedAt: new Date().toISOString(),
    version: Math.max(1, project.version)
  });
}
