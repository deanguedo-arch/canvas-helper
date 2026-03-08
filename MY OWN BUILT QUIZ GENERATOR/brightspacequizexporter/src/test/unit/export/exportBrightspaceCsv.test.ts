import { describe, expect, it } from 'vitest'
import { type AssessmentProject } from '../../../core/schema/assessment'
import { exportBrightspaceCsv } from '../../../export/brightspaceCsv/exportBrightspaceCsv'
import { loadJsonFixture } from '../../helpers/fixtureLoader'

describe('exportBrightspaceCsv', () => {
  it('can export with warnings when answer keys are incomplete', () => {
    const project = loadJsonFixture<AssessmentProject>(
      'projects',
      'simple-mc-project.json',
    )
    project.questions[0].correctAnswers = []
    project.questions[0].choices.forEach((choice) => {
      choice.isCorrect = false
    })

    const result = exportBrightspaceCsv(project)

    expect(result.status).toBe('success')
    expect(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'multiple_choice_requires_exactly_one_correct_answer',
      ),
    ).toBe(true)
    expect(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'brightspace_incomplete_answer_keys_exported',
      ),
    ).toBe(true)
  })

  it('can still fail strictly when incomplete answer keys are disallowed', () => {
    const project = loadJsonFixture<AssessmentProject>(
      'projects',
      'simple-mc-project.json',
    )
    project.questions[0].correctAnswers = []
    project.questions[0].choices.forEach((choice) => {
      choice.isCorrect = false
    })

    const result = exportBrightspaceCsv(project, {
      allowIncompleteAnswerKeys: false,
    })

    expect(result.status).toBe('failed')
  })

  it('can require approved review status before export', () => {
    const project = loadJsonFixture<AssessmentProject>(
      'projects',
      'mixed-question-project.json',
    )

    const result = exportBrightspaceCsv(project, {
      requireApprovedForExport: true,
    })

    expect(result.status).toBe('failed')
    expect(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'question_requires_approved_review_status',
      ),
    ).toBe(true)
  })

  it('emits exporter warnings for fixed scoring and omitted fields', () => {
    const project = loadJsonFixture<AssessmentProject>(
      'projects',
      'simple-mc-project.json',
    )

    const result = exportBrightspaceCsv(project)

    expect(result.status).toBe('success')
    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.code === 'brightspace_sections_not_exported',
      ),
    ).toBe(true)
    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.code === 'brightspace_question_fields_omitted',
      ),
    ).toBe(true)
    expect(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'brightspace_source_metadata_not_exported',
      ),
    ).toBe(true)
  })

  it('uses a deterministic file name derived from the project title', () => {
    const project = loadJsonFixture<AssessmentProject>(
      'projects',
      'simple-mc-project.json',
    )

    const result = exportBrightspaceCsv(project)

    expect(result.fileName).toBe('water-cycle-check-brightspace.csv')
  })
})
