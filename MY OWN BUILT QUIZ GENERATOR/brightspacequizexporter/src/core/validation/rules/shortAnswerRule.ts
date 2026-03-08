import type { ShortAnswerQuestion } from '../../schema/question'
import { createValidationIssue } from '../types'

export function shortAnswerRule(question: ShortAnswerQuestion) {
  const issues = []
  const trimmedAnswers = question.correctAnswers.map((answer) => answer.trim())
  const nonEmptyAnswers = trimmedAnswers.filter((answer) => answer.length > 0)
  const normalizedAnswers = nonEmptyAnswers.map((answer) => answer.toLowerCase())

  if (question.choices.length > 0) {
    issues.push(
      createValidationIssue({
        code: 'short_answer_should_not_define_choices',
        message: 'Short answer questions should not define choices.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
      }),
    )
  }

  if (trimmedAnswers.some((answer) => answer.length === 0)) {
    issues.push(
      createValidationIssue({
        code: 'short_answer_blank_accepted_answer',
        message: 'Short answer accepted answers must not be blank.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (
    normalizedAnswers.length > 0 &&
    new Set(normalizedAnswers).size !== normalizedAnswers.length
  ) {
    issues.push(
      createValidationIssue({
        code: 'short_answer_duplicate_accepted_answer',
        message: 'Short answer accepted answers contain duplicates.',
        severity: 'warning',
        blocking: false,
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (question.answerStatus !== 'missing' && nonEmptyAnswers.length === 0) {
    issues.push(
      createValidationIssue({
        code: 'short_answer_requires_accepted_answer',
        message:
          'Short answer questions need at least one accepted answer when answers are present or verified.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
        suggestedFix: 'Add at least one accepted short answer.',
      }),
    )
  }

  return issues
}
