import type { MultiSelectQuestion } from '../../schema/question'
import { createValidationIssue } from '../types'

function sameCorrectSet(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false
  }

  const leftSet = new Set(left)
  const rightSet = new Set(right)

  if (leftSet.size !== left.length || rightSet.size !== right.length) {
    return false
  }

  return [...leftSet].every((value) => rightSet.has(value))
}

export function multiSelectRule(question: MultiSelectQuestion) {
  const issues = []
  const choiceIds = new Set(question.choices.map((choice) => choice.choiceId))
  const uniqueCorrectAnswers = new Set(question.correctAnswers)
  const invalidCorrectAnswerIds = question.correctAnswers.filter(
    (answerId) => !choiceIds.has(answerId),
  )
  const flaggedCorrectIds = question.choices
    .filter((choice) => choice.isCorrect)
    .map((choice) => choice.choiceId)

  if (question.choices.length < 2) {
    issues.push(
      createValidationIssue({
        code: 'multi_select_requires_choices',
        message: 'Multi-select questions need at least two choices.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
      }),
    )
  }

  if (invalidCorrectAnswerIds.length > 0) {
    issues.push(
      createValidationIssue({
        code: 'multi_select_unknown_correct_answer',
        message: 'Multi-select correctAnswers must reference existing choice ids.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (uniqueCorrectAnswers.size !== question.correctAnswers.length) {
    issues.push(
      createValidationIssue({
        code: 'multi_select_duplicate_correct_answers',
        message: 'Multi-select correctAnswers must not contain duplicates.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (uniqueCorrectAnswers.size < 1) {
    issues.push(
      createValidationIssue({
        code: 'multi_select_requires_one_or_more_correct_answers',
        message: 'Multi-select questions must have one or more correct answers.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
        suggestedFix: 'Select at least one correct answer.',
      }),
    )
  }

  if (!sameCorrectSet(question.correctAnswers, flaggedCorrectIds)) {
    issues.push(
      createValidationIssue({
        code: 'multi_select_choice_flags_do_not_match_correct_answers',
        message: 'Choice isCorrect flags must match correctAnswers.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
      }),
    )
  }

  return issues
}
