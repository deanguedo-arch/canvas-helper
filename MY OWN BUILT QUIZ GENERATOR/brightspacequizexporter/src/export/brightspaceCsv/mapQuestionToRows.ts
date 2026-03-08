import type {
  MatchingQuestion,
  Question,
  ShortAnswerQuestion,
} from '../../core/schema/question'
import type { BrightspaceCsvRow } from './csvTypes'
import {
  BRIGHTSPACE_CSV_ROW_KEYWORDS,
  BRIGHTSPACE_DEFAULT_SCORING,
  QUESTION_TYPE_TO_BRIGHTSPACE_CODE,
} from './constants'
import { createExportDiagnostic, type ExportDiagnostic } from '../shared/diagnostics'

type MappedQuestionRows = {
  rows: BrightspaceCsvRow[]
  diagnostics: ExportDiagnostic[]
}

function hasContent(value: string | null | undefined) {
  return value !== null && value !== undefined && value.trim().length > 0
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(value)
}

function questionTextRow(question: Question): BrightspaceCsvRow {
  if (hasContent(question.stemRichText)) {
    return [BRIGHTSPACE_CSV_ROW_KEYWORDS.QuestionText, '', question.stemRichText ?? '']
  }

  return [BRIGHTSPACE_CSV_ROW_KEYWORDS.QuestionText, question.prompt]
}

function itemRow(text: string): BrightspaceCsvRow {
  const trimmedText = text.trim()

  if (trimmedText.includes('<') && trimmedText.includes('>')) {
    return [BRIGHTSPACE_CSV_ROW_KEYWORDS.Item, '', text]
  }

  return [BRIGHTSPACE_CSV_ROW_KEYWORDS.Item, text]
}

function sortChoicesByOrder<T extends { orderIndex: number }>(choices: T[]) {
  return [...choices].sort((left, right) => left.orderIndex - right.orderIndex)
}

function commonRows(question: Question): MappedQuestionRows {
  const rows: BrightspaceCsvRow[] = [
    [
      BRIGHTSPACE_CSV_ROW_KEYWORDS.NewQuestion,
      QUESTION_TYPE_TO_BRIGHTSPACE_CODE[question.type],
    ],
    [BRIGHTSPACE_CSV_ROW_KEYWORDS.Title, question.questionId],
    [BRIGHTSPACE_CSV_ROW_KEYWORDS.Points, formatNumber(question.points)],
    questionTextRow(question),
  ]
  const diagnostics: ExportDiagnostic[] = []
  const fixedScoring = BRIGHTSPACE_DEFAULT_SCORING[question.type]
  const omittedFields: string[] = []

  if (fixedScoring) {
    rows.push([BRIGHTSPACE_CSV_ROW_KEYWORDS.Scoring, fixedScoring])
    diagnostics.push(
      createExportDiagnostic({
        code: 'brightspace_fixed_scoring_default_applied',
        severity: 'warning',
        questionId: question.questionId,
        path: ['questions', question.questionId, 'type'],
        message: `Brightspace scoring mode for ${question.type} is exported as "${fixedScoring}" because the canonical schema does not yet model scoring strategies.`,
      }),
    )
  }

  if (hasContent(question.feedbackCorrect)) {
    omittedFields.push('feedbackCorrect')
  }
  if (hasContent(question.feedbackIncorrect)) {
    omittedFields.push('feedbackIncorrect')
  }
  if (hasContent(question.explanation)) {
    omittedFields.push('explanation')
  }
  if (hasContent(question.exportNotes)) {
    omittedFields.push('exportNotes')
  }
  if (omittedFields.length > 0) {
    diagnostics.push(
      createExportDiagnostic({
        code: 'brightspace_question_fields_omitted',
        severity: 'warning',
        questionId: question.questionId,
        path: ['questions', question.questionId],
        message: `Brightspace CSV export does not currently map: ${omittedFields.join(', ')}.`,
      }),
    )
  }

  if (
    hasContent(question.sourceReference) ||
    question.sourcePage !== null ||
    hasContent(question.originText) ||
    question.metadataTags.length > 0
  ) {
    diagnostics.push(
      createExportDiagnostic({
        code: 'brightspace_source_metadata_not_exported',
        severity: 'warning',
        questionId: question.questionId,
        path: ['questions', question.questionId],
        message:
          'Brightspace CSV export omits internal source and metadata tracking fields.',
      }),
    )
  }

  return { rows, diagnostics }
}

function mapMultipleChoiceLikeRows(question: Question, correctValue: string) {
  const correctAnswerIds = new Set(question.correctAnswers as string[])

  return sortChoicesByOrder(question.choices).map<BrightspaceCsvRow>((choice) => [
    BRIGHTSPACE_CSV_ROW_KEYWORDS.Option,
    correctAnswerIds.has(choice.choiceId) ? correctValue : '0',
    choice.text,
  ])
}

function mapShortAnswerRows(question: ShortAnswerQuestion) {
  return question.correctAnswers.map<BrightspaceCsvRow>((answer) => [
    BRIGHTSPACE_CSV_ROW_KEYWORDS.Answer,
    '100',
    answer,
  ])
}

function mapMatchingRows(question: MatchingQuestion): BrightspaceCsvRow[] {
  const promptChoices = sortChoicesByOrder(
    question.choices.filter((choice) => choice.matchRole === 'prompt'),
  )
  const matchChoices = sortChoicesByOrder(
    question.choices.filter((choice) => choice.matchRole === 'match'),
  )
  const promptPositionById = new Map(
    promptChoices.map((choice, index) => [choice.choiceId, String(index + 1)]),
  )
  const matchAssociationById = new Map(
    question.correctAnswers.map((answer) => [
      answer.matchChoiceId,
      promptPositionById.get(answer.promptChoiceId) ?? '',
    ]),
  )

  return [
    ...promptChoices.map<BrightspaceCsvRow>((choice, index) => [
      BRIGHTSPACE_CSV_ROW_KEYWORDS.Choice,
      String(index + 1),
      choice.text,
    ]),
    ...matchChoices.map<BrightspaceCsvRow>((choice) => [
      BRIGHTSPACE_CSV_ROW_KEYWORDS.Match,
      matchAssociationById.get(choice.choiceId) ?? '',
      choice.text,
    ]),
  ]
}

function mapOrderingRows(question: Extract<Question, { type: 'ordering' }>) {
  const choiceById = new Map(question.choices.map((choice) => [choice.choiceId, choice]))

  return question.correctAnswers.map<BrightspaceCsvRow>((choiceId) => {
    const choice = choiceById.get(choiceId)

    return itemRow(choice?.text ?? '')
  })
}

export function mapQuestionToRows(question: Question): MappedQuestionRows {
  const mapped = commonRows(question)

  switch (question.type) {
    case 'multiple_choice':
      mapped.rows.push(...mapMultipleChoiceLikeRows(question, '100'))
      break
    case 'true_false': {
      const trueChoice = question.choices.find(
        (choice) => choice.text.trim().toLowerCase() === 'true',
      )
      const falseChoice = question.choices.find(
        (choice) => choice.text.trim().toLowerCase() === 'false',
      )
      const correctAnswerIds = new Set(question.correctAnswers)

      mapped.rows.push([
        BRIGHTSPACE_CSV_ROW_KEYWORDS.TRUE,
        correctAnswerIds.has(trueChoice?.choiceId ?? '') ? '100' : '0',
      ])
      mapped.rows.push([
        BRIGHTSPACE_CSV_ROW_KEYWORDS.FALSE,
        correctAnswerIds.has(falseChoice?.choiceId ?? '') ? '100' : '0',
      ])
      break
    }
    case 'multi_select':
      mapped.rows.push(...mapMultipleChoiceLikeRows(question, '1'))
      break
    case 'short_answer':
      mapped.rows.push(...mapShortAnswerRows(question))
      break
    case 'written_response':
      if (question.correctAnswers.length > 0) {
        mapped.diagnostics.push(
          createExportDiagnostic({
            code: 'brightspace_written_response_answers_omitted',
            severity: 'warning',
            questionId: question.questionId,
            path: ['questions', question.questionId, 'correctAnswers'],
            message:
              'Written response answer guidance is not represented in Brightspace CSV export.',
          }),
        )
      }
      break
    case 'matching':
      mapped.rows.push(...mapMatchingRows(question))
      break
    case 'ordering':
      mapped.rows.push(...mapOrderingRows(question))
      break
  }

  return mapped
}
