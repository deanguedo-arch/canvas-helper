import { QuestionSchema, type Question, type QuestionInput } from '../schema/question'
import { answerStatusRule } from './rules/answerStatusRule'
import { matchingRule } from './rules/matchingRule'
import { multiSelectRule } from './rules/multiSelectRule'
import { multipleChoiceRule } from './rules/multipleChoiceRule'
import { orderingRule } from './rules/orderingRule'
import { shortAnswerRule } from './rules/shortAnswerRule'
import { trueFalseRule } from './rules/trueFalseRule'
import {
  buildValidationSummary,
  createValidationIssue,
  type QuestionValidationResult,
  type ValidateQuestionContext,
  type ValidationIssue,
} from './types'

const choiceTextRequiredTypes = new Set<Question['type']>([
  'multiple_choice',
  'true_false',
  'multi_select',
  'matching',
  'ordering',
])

function getFallbackQuestionId(question: QuestionInput | Question) {
  if (
    typeof question === 'object' &&
    question !== null &&
    'questionId' in question &&
    typeof question.questionId === 'string'
  ) {
    return question.questionId
  }

  return 'unknown_question'
}

function findDuplicateValues(values: string[]) {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value)
      continue
    }

    seen.add(value)
  }

  return [...duplicates]
}

export function validateQuestion(
  questionInput: QuestionInput | Question,
  context: ValidateQuestionContext = {},
): QuestionValidationResult {
  const parsedQuestion = QuestionSchema.safeParse(questionInput)
  const fallbackQuestionId = getFallbackQuestionId(questionInput)

  if (!parsedQuestion.success) {
    const issues = parsedQuestion.error.issues.map((issue) =>
      createValidationIssue({
        code: 'question_schema_invalid',
        message: issue.message,
        path: ['questions', fallbackQuestionId, ...issue.path.map(String)],
        questionId: fallbackQuestionId,
        suggestedFix: 'Bring the question data back into the canonical schema shape.',
      }),
    )

    return {
      questionId: fallbackQuestionId,
      ...buildValidationSummary(issues),
    }
  }

  const question = parsedQuestion.data
  const sectionIds = context.sectionIds
  const issues: ValidationIssue[] = []

  if (question.prompt.trim().length === 0) {
    issues.push(
      createValidationIssue({
        code: 'question_prompt_required',
        message: 'Question prompt must not be empty.',
        path: ['questions', question.questionId, 'prompt'],
        questionId: question.questionId,
        suggestedFix: 'Add a prompt before export.',
      }),
    )
  }

  if (!Number.isFinite(question.points) || question.points < 0) {
    issues.push(
      createValidationIssue({
        code: 'question_points_invalid',
        message: 'Question points must be a finite non-negative number.',
        path: ['questions', question.questionId, 'points'],
        questionId: question.questionId,
      }),
    )
  }

  if (
    question.sectionId !== null &&
    sectionIds !== undefined &&
    !sectionIds.has(question.sectionId)
  ) {
    issues.push(
      createValidationIssue({
        code: 'question_section_reference_invalid',
        message: `Question references missing section "${question.sectionId}".`,
        path: ['questions', question.questionId, 'sectionId'],
        questionId: question.questionId,
        suggestedFix: 'Assign the question to an existing section or clear sectionId.',
      }),
    )
  }

  if (question.type !== 'short_answer' && question.type !== 'written_response') {
    const duplicateChoiceIds = findDuplicateValues(
      question.choices.map((choice) => choice.choiceId),
    )
    const duplicateChoiceTexts = findDuplicateValues(
      question.choices
        .map((choice) => choice.text.trim().toLowerCase())
        .filter((value) => value.length > 0),
    )

    if (duplicateChoiceIds.length > 0) {
      issues.push(
        createValidationIssue({
          code: 'duplicate_choice_id',
          message: 'Choice ids must be unique within a question.',
          path: ['questions', question.questionId, 'choices'],
          questionId: question.questionId,
          suggestedFix: 'Give each choice a unique choiceId.',
        }),
      )
    }

    if (duplicateChoiceTexts.length > 0) {
      issues.push(
        createValidationIssue({
          code: 'duplicate_choice_text',
          message: 'Choice text contains duplicates.',
          severity: 'warning',
          blocking: false,
          path: ['questions', question.questionId, 'choices'],
          questionId: question.questionId,
          suggestedFix: 'Rewrite duplicate choices unless they are intentionally identical.',
        }),
      )
    }
  }

  if (choiceTextRequiredTypes.has(question.type)) {
    const emptyChoiceTexts = question.choices.filter(
      (choice) => choice.text.trim().length === 0,
    )

    if (emptyChoiceTexts.length > 0) {
      issues.push(
        createValidationIssue({
          code: 'question_choice_text_required',
          message: 'All choices for this question type must have non-empty text.',
          path: ['questions', question.questionId, 'choices'],
          questionId: question.questionId,
          suggestedFix: 'Fill in every choice text before export.',
        }),
      )
    }
  }

  if (question.type === 'written_response' && question.choices.length > 0) {
    issues.push(
      createValidationIssue({
        code: 'written_response_should_not_define_choices',
        message: 'Written response questions should not define choices.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
      }),
    )
  }

  if (
    context.options?.requireApprovedForExport &&
    question.reviewStatus !== 'approved'
  ) {
    issues.push(
      createValidationIssue({
        code: 'question_requires_approved_review_status',
        message: 'This question must be approved before export.',
        path: ['questions', question.questionId, 'reviewStatus'],
        questionId: question.questionId,
        suggestedFix: 'Complete review and set reviewStatus to approved.',
      }),
    )
  }

  switch (question.type) {
    case 'multiple_choice':
      issues.push(...multipleChoiceRule(question))
      break
    case 'true_false':
      issues.push(...trueFalseRule(question))
      break
    case 'multi_select':
      issues.push(...multiSelectRule(question))
      break
    case 'short_answer':
      issues.push(...shortAnswerRule(question))
      break
    case 'matching':
      issues.push(...matchingRule(question))
      break
    case 'ordering':
      issues.push(...orderingRule(question))
      break
    case 'written_response':
      break
  }

  issues.push(...answerStatusRule(question))

  return {
    questionId: question.questionId,
    ...buildValidationSummary(issues),
  }
}
