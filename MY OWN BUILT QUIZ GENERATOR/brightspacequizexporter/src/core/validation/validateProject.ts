import {
  AssessmentProjectSchema,
  type AssessmentProject,
  type AssessmentProjectInput,
} from '../schema/assessment'
import { requireTitle } from './rules/requireTitle'
import { uniqueQuestionIds } from './rules/uniqueQuestionIds'
import { buildValidationSummary, createValidationIssue, type ProjectValidationResult, type ValidateProjectOptions } from './types'
import { validateQuestion } from './validateQuestion'

function getFallbackProjectId(project: AssessmentProjectInput | AssessmentProject) {
  if (
    typeof project === 'object' &&
    project !== null &&
    'projectId' in project &&
    typeof project.projectId === 'string'
  ) {
    return project.projectId
  }

  return 'unknown_project'
}

function duplicateSectionIdIssues(project: AssessmentProject) {
  const seenCounts = new Map<string, number>()

  for (const section of project.sections) {
    seenCounts.set(section.sectionId, (seenCounts.get(section.sectionId) ?? 0) + 1)
  }

  return [...seenCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([sectionId]) =>
      createValidationIssue({
        code: 'duplicate_section_id',
        message: `Section id "${sectionId}" is duplicated.`,
        path: ['sections', sectionId],
        suggestedFix: 'Ensure every section has a unique sectionId.',
      }),
    )
}

export function validateProject(
  projectInput: AssessmentProjectInput | AssessmentProject,
  options: ValidateProjectOptions = {},
): ProjectValidationResult {
  const parsedProject = AssessmentProjectSchema.safeParse(projectInput)
  const fallbackProjectId = getFallbackProjectId(projectInput)

  if (!parsedProject.success) {
    const issues = parsedProject.error.issues.map((issue) =>
      createValidationIssue({
        code: 'project_schema_invalid',
        message: issue.message,
        path: issue.path.map(String),
        suggestedFix: 'Bring the project data back into the canonical schema shape.',
      }),
    )

    return {
      projectId: fallbackProjectId,
      questionResults: [],
      ...buildValidationSummary(issues),
    }
  }

  const project = parsedProject.data
  const sectionIds = new Set(project.sections.map((section) => section.sectionId))
  const projectIssues = [
    ...requireTitle(project),
    ...uniqueQuestionIds(project),
    ...duplicateSectionIdIssues(project),
  ]
  const questionResults = project.questions.map((question) =>
    validateQuestion(question, {
      sectionIds,
      options,
    }),
  )
  const allIssues = [
    ...projectIssues,
    ...questionResults.flatMap((result) => result.issues),
  ]

  return {
    projectId: project.projectId,
    questionResults,
    ...buildValidationSummary(allIssues),
  }
}
