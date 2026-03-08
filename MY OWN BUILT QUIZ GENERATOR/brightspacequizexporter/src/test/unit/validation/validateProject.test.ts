import { describe, expect, it } from 'vitest'
import {
  type AssessmentProject,
  type AssessmentProjectInput,
} from '../../../core/schema/assessment'
import { validateProject } from '../../../core/validation/validateProject'
import { loadJsonFixture } from '../../helpers/fixtureLoader'

const projectFixtures = [
  'simple-mc-project.json',
  'mixed-question-project.json',
  'matching-project.json',
  'ordering-project.json',
] as const

describe('validateProject', () => {
  it.each(projectFixtures)(
    'marks fixture %s as export-ready',
    (fixtureName) => {
      const project = loadJsonFixture<AssessmentProject>('projects', fixtureName)
      const result = validateProject(project)

      expect(result.errors).toHaveLength(0)
      expect(result.blockingIssues).toHaveLength(0)
      expect(result.canExport).toBe(true)
    },
  )

  it('reports a missing title as a blocking issue', () => {
    const project = loadJsonFixture<AssessmentProject>(
      'projects',
      'simple-mc-project.json',
    )
    project.title = '   '

    const result = validateProject(project)

    expect(result.errors.some((issue) => issue.code === 'project_title_required')).toBe(
      true,
    )
    expect(result.canExport).toBe(false)
  })

  it('reports duplicate question ids', () => {
    const project = loadJsonFixture<AssessmentProject>(
      'projects',
      'mixed-question-project.json',
    )
    project.questions[1].questionId = project.questions[0].questionId

    const result = validateProject(project)

    expect(result.errors.some((issue) => issue.code === 'duplicate_question_id')).toBe(
      true,
    )
  })

  it('reports missing section references', () => {
    const project = loadJsonFixture<AssessmentProject>(
      'projects',
      'simple-mc-project.json',
    )
    project.questions[0].sectionId = 'missing_section'

    const result = validateProject(project)

    expect(
      result.errors.some(
        (issue) => issue.code === 'question_section_reference_invalid',
      ),
    ).toBe(true)
  })

  it('can require approved review status for export', () => {
    const project = loadJsonFixture<AssessmentProject>(
      'projects',
      'mixed-question-project.json',
    )

    const result = validateProject(project, {
      requireApprovedForExport: true,
    })

    expect(
      result.errors.some(
        (issue) => issue.code === 'question_requires_approved_review_status',
      ),
    ).toBe(true)
    expect(result.canExport).toBe(false)
  })

  it('surfaces schema failures as validation issues', () => {
    const project = loadJsonFixture<AssessmentProject>(
      'projects',
      'simple-mc-project.json',
    ) as AssessmentProjectInput
    const questions = project.questions as AssessmentProject['questions']
    questions[0] = {
      ...questions[0],
      type: 'essay',
    } as never

    const result = validateProject(project)

    expect(result.errors.some((issue) => issue.code === 'project_schema_invalid')).toBe(
      true,
    )
    expect(result.canExport).toBe(false)
  })
})
