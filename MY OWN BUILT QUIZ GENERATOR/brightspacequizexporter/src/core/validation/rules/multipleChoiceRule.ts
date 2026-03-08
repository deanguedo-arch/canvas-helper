import type { MultipleChoiceQuestion } from '../../schema/question'
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

export function multipleChoiceRule(question: MultipleChoiceQuestion) {
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
        code: 'multiple_choice_requires_choices',
        message: 'Multiple choice questions need at least two choices.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
        suggestedFix: 'Add at least two answer choices.',
      }),
    )
  }

  if (invalidCorrectAnswerIds.length > 0) {
    issues.push(
      createValidationIssue({
        code: 'multiple_choice_unknown_correct_answer',
        message: 'Multiple choice correctAnswers must reference existing choice ids.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
        suggestedFix: 'Update correctAnswers to point at existing choices only.',
      }),
    )
  }

  if (uniqueCorrectAnswers.size !== question.correctAnswers.length) {
    issues.push(
      createValidationIssue({
        code: 'multiple_choice_duplicate_correct_answers',
        message: 'Multiple choice correctAnswers must not contain duplicates.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (uniqueCorrectAnswers.size !== 1) {
    issues.push(
      createValidationIssue({
        code: 'multiple_choice_requires_exactly_one_correct_answer',
        message: 'Multiple choice questions must have exactly one correct answer.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
        suggestedFix: 'Select exactly one correct answer.',
      }),
    )
  }

  if (!sameCorrectSet(question.correctAnswers, flaggedCorrectIds)) {
    issues.push(
      createValidationIssue({
        code: 'multiple_choice_choice_flags_do_not_match_correct_answers',
        message: 'Choice isCorrect flags must match correctAnswers.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
        suggestedFix:
          'Keep choice isCorrect flags synchronized with correctAnswers.',
      }),
    )
  }

  return issues
}
