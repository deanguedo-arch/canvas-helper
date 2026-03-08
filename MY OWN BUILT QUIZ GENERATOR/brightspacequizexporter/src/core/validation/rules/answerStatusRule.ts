import type { Question } from '../../schema/question'
import { createValidationIssue } from '../types'

const autogradedQuestionTypes = new Set<Question['type']>([
  'multiple_choice',
  'true_false',
  'multi_select',
  'short_answer',
  'matching',
  'ordering',
])

export function answerStatusRule(question: Question) {
  const issues = []

  if (question.answerStatus === 'inferred') {
    issues.push(
      createValidationIssue({
        code: 'inferred_answer_requires_review',
        message: 'This question uses inferred answers and should be reviewed.',
        severity: 'warning',
        blocking: false,
        path: ['questions', question.questionId, 'answerStatus'],
        questionId: question.questionId,
        suggestedFix: 'Review inferred answers and mark them verified if confirmed.',
      }),
    )
  }

  if (
    question.answerStatus === 'missing' &&
    autogradedQuestionTypes.has(question.type)
  ) {
    issues.push(
      createValidationIssue({
        code: 'autograded_question_missing_answers',
        message:
          'Autograded questions cannot export while answer status is missing.',
        path: ['questions', question.questionId, 'answerStatus'],
        questionId: question.questionId,
        suggestedFix: 'Provide verified or inferred answers before export.',
      }),
    )
  }

  return issues
}
