import type { AssessmentProject } from '../../schema/assessment'
import { createValidationIssue } from '../types'

export function uniqueQuestionIds(project: AssessmentProject) {
  const seenCounts = new Map<string, number>()

  for (const question of project.questions) {
    seenCounts.set(question.questionId, (seenCounts.get(question.questionId) ?? 0) + 1)
  }

  return [...seenCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([questionId]) =>
      createValidationIssue({
        code: 'duplicate_question_id',
        message: `Question id "${questionId}" is duplicated.`,
        path: ['questions', questionId],
        questionId,
        suggestedFix: 'Ensure every question has a unique questionId.',
      }),
    )
}
