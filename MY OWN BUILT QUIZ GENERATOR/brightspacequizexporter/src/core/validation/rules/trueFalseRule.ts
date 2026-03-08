import type { TrueFalseQuestion } from '../../schema/question'
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

export function trueFalseRule(question: TrueFalseQuestion) {
  const issues = []
  const normalizedChoiceTexts = question.choices.map((choice) =>
    choice.text.trim().toLowerCase(),
  )
  const choiceIds = new Set(question.choices.map((choice) => choice.choiceId))
  const uniqueCorrectAnswers = new Set(question.correctAnswers)
  const invalidCorrectAnswerIds = question.correctAnswers.filter(
    (answerId) => !choiceIds.has(answerId),
  )
  const flaggedCorrectIds = question.choices
    .filter((choice) => choice.isCorrect)
    .map((choice) => choice.choiceId)

  if (question.choices.length !== 2) {
    issues.push(
      createValidationIssue({
        code: 'true_false_requires_two_choices',
        message: 'True/false questions must define exactly two choices.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
      }),
    )
  }

  if (
    normalizedChoiceTexts.length === 2 &&
    normalizedChoiceTexts.slice().sort().join('|') !== 'false|true'
  ) {
    issues.push(
      createValidationIssue({
        code: 'true_false_requires_normalized_boolean_pair',
        message: 'True/false choices must normalize to "True" and "False".',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
        suggestedFix: 'Use exactly one True choice and one False choice.',
      }),
    )
  }

  if (invalidCorrectAnswerIds.length > 0) {
    issues.push(
      createValidationIssue({
        code: 'true_false_unknown_correct_answer',
        message: 'True/false correctAnswers must reference existing choice ids.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (uniqueCorrectAnswers.size !== 1) {
    issues.push(
      createValidationIssue({
        code: 'true_false_requires_exactly_one_correct_answer',
        message: 'True/false questions must have exactly one correct answer.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (!sameCorrectSet(question.correctAnswers, flaggedCorrectIds)) {
    issues.push(
      createValidationIssue({
        code: 'true_false_choice_flags_do_not_match_correct_answers',
        message: 'Choice isCorrect flags must match correctAnswers.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
      }),
    )
  }

  return issues
}
