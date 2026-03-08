import type { AssessmentProject } from '../../schema/assessment'
import { createValidationIssue } from '../types'

export function requireTitle(project: AssessmentProject) {
  if (project.title.trim().length > 0) {
    return []
  }

  return [
    createValidationIssue({
      code: 'project_title_required',
      message: 'Assessment title is required.',
      path: ['title'],
      suggestedFix: 'Add a non-empty assessment title before export.',
    }),
  ]
}
