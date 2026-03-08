import type { OrderingQuestion } from '../../schema/question'
import { createValidationIssue } from '../types'

export function orderingRule(question: OrderingQuestion) {
  const issues = []
  const choiceIds = new Set(question.choices.map((choice) => choice.choiceId))
  const uniqueCorrectAnswers = new Set(question.correctAnswers)
  const invalidCorrectAnswerIds = question.correctAnswers.filter(
    (answerId) => !choiceIds.has(answerId),
  )

  if (question.choices.length < 2) {
    issues.push(
      createValidationIssue({
        code: 'ordering_requires_two_or_more_choices',
        message: 'Ordering questions require at least two ordered elements.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
        suggestedFix: 'Add at least two items to order.',
      }),
    )
  }

  if (invalidCorrectAnswerIds.length > 0) {
    issues.push(
      createValidationIssue({
        code: 'ordering_unknown_correct_answer',
        message: 'Ordering correctAnswers must reference existing choice ids.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (uniqueCorrectAnswers.size !== question.correctAnswers.length) {
    issues.push(
      createValidationIssue({
        code: 'ordering_duplicate_correct_answers',
        message: 'Ordering correctAnswers must not contain duplicates.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (
    (question.answerStatus !== 'missing' || question.correctAnswers.length > 0) &&
    uniqueCorrectAnswers.size !== question.choices.length
  ) {
    issues.push(
      createValidationIssue({
        code: 'ordering_requires_complete_order',
        message: 'Ordering questions need a full ordered list of all choices.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
        suggestedFix: 'List every choice id once in the intended order.',
      }),
    )
  }

  return issues
}
