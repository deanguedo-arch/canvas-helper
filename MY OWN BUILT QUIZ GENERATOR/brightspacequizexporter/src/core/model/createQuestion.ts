import type { Choice, MatchingChoice } from '../schema/choice'
import type { Question, MatchingCorrectAnswer } from '../schema/question'
import { QuestionSchema } from '../schema/question'
import type { QuestionType } from '../schema/enums'

type CreateQuestionOptions = {
  questionId?: string
  sectionId?: string | null
  type?: QuestionType
  prompt?: string
  stemRichText?: string | null
  choices?: Choice[] | MatchingChoice[]
  correctAnswers?: string[] | MatchingCorrectAnswer[]
  points?: number
  feedbackCorrect?: string
  feedbackIncorrect?: string
  explanation?: string
  sourceReference?: string
  sourcePage?: number | null
  originText?: string
  confidenceScore?: number | null
  answerStatus?: Question['answerStatus']
  reviewStatus?: Question['reviewStatus']
  exportNotes?: string
  metadataTags?: string[]
}

function createIdentifier(prefix: string) {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function createChoice(
  questionId: string,
  suffix: string,
  label: string,
  text = '',
  orderIndex = 0,
): Choice {
  return {
    choiceId: `${questionId}_${suffix}`,
    label,
    text,
    isCorrect: false,
    orderIndex,
    matchKey: null,
    fixedPosition: null,
    matchRole: null,
  }
}

function createMatchingChoice(
  questionId: string,
  suffix: string,
  label: string,
  matchRole: 'prompt' | 'match',
  matchKey: string,
  orderIndex: number,
): MatchingChoice {
  return {
    choiceId: `${questionId}_${suffix}`,
    label,
    text: '',
    isCorrect: false,
    orderIndex,
    matchKey,
    fixedPosition: null,
    matchRole,
  }
}

function createDefaultChoices(
  type: QuestionType,
  questionId: string,
): Choice[] | MatchingChoice[] {
  switch (type) {
    case 'multiple_choice':
    case 'multi_select':
      return [
        createChoice(questionId, 'choice_a', 'A', '', 0),
        createChoice(questionId, 'choice_b', 'B', '', 1),
        createChoice(questionId, 'choice_c', 'C', '', 2),
        createChoice(questionId, 'choice_d', 'D', '', 3),
      ]
    case 'true_false':
      return [
        createChoice(questionId, 'choice_true', 'T', 'True', 0),
        createChoice(questionId, 'choice_false', 'F', 'False', 1),
      ]
    case 'matching':
      return [
        createMatchingChoice(questionId, 'prompt_1', 'P1', 'prompt', 'pair_1', 0),
        createMatchingChoice(questionId, 'prompt_2', 'P2', 'prompt', 'pair_2', 1),
        createMatchingChoice(questionId, 'match_1', 'M1', 'match', 'pair_1', 2),
        createMatchingChoice(questionId, 'match_2', 'M2', 'match', 'pair_2', 3),
      ]
    case 'ordering':
      return [
        createChoice(questionId, 'step_1', '1', '', 0),
        createChoice(questionId, 'step_2', '2', '', 1),
        createChoice(questionId, 'step_3', '3', '', 2),
      ]
    case 'short_answer':
    case 'written_response':
      return []
  }
}

export function createQuestion(options: CreateQuestionOptions = {}): Question {
  const questionId = options.questionId ?? createIdentifier('question')
  const type = options.type ?? 'multiple_choice'

  return QuestionSchema.parse({
    questionId,
    sectionId: options.sectionId ?? null,
    type,
    prompt: options.prompt ?? '',
    stemRichText: options.stemRichText ?? null,
    choices: options.choices ?? createDefaultChoices(type, questionId),
    correctAnswers: options.correctAnswers ?? [],
    points: options.points ?? 1,
    feedbackCorrect: options.feedbackCorrect ?? '',
    feedbackIncorrect: options.feedbackIncorrect ?? '',
    explanation: options.explanation ?? '',
    sourceReference: options.sourceReference ?? '',
    sourcePage: options.sourcePage ?? null,
    originText: options.originText ?? '',
    confidenceScore: options.confidenceScore ?? null,
    answerStatus: options.answerStatus ?? 'missing',
    reviewStatus: options.reviewStatus ?? 'draft',
    exportNotes: options.exportNotes ?? '',
    metadataTags: options.metadataTags ?? [],
  })
}
