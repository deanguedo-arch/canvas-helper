import { describe, expect, it } from 'vitest'
import { type AssessmentProject } from '../../../core/schema/assessment'
import { validateQuestion } from '../../../core/validation/validateQuestion'
import { loadJsonFixture } from '../../helpers/fixtureLoader'

function loadFixtureQuestion(
  fixtureName: string,
  questionIndex = 0,
  sectionIds?: Set<string>,
) {
  const project = loadJsonFixture<AssessmentProject>('projects', fixtureName)

  return {
    question: project.questions[questionIndex],
    sectionIds: sectionIds ?? new Set(project.sections.map((section) => section.sectionId)),
  }
}

describe('validateQuestion', () => {
  it('accepts a valid multiple choice fixture question', () => {
    const { question, sectionIds } = loadFixtureQuestion('simple-mc-project.json')
    const result = validateQuestion(question, { sectionIds })

    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
    expect(result.canExport).toBe(true)
  })

  it('rejects multiple choice questions without exactly one correct answer', () => {
    const { question, sectionIds } = loadFixtureQuestion('simple-mc-project.json')
    question.correctAnswers = ['choice_a', 'choice_b']
    question.choices[0].isCorrect = true
    question.choices[1].isCorrect = true

    const result = validateQuestion(question, { sectionIds })

    expect(
      result.errors.some(
        (issue) =>
          issue.code === 'multiple_choice_requires_exactly_one_correct_answer',
      ),
    ).toBe(true)
  })

  it('rejects multi-select questions without any correct answers', () => {
    const { question, sectionIds } = loadFixtureQuestion(
      'mixed-question-project.json',
      1,
    )
    question.correctAnswers = []
    question.choices.forEach((choice) => {
      choice.isCorrect = false
    })

    const result = validateQuestion(question, { sectionIds })

    expect(
      result.errors.some(
        (issue) =>
          issue.code === 'multi_select_requires_one_or_more_correct_answers',
      ),
    ).toBe(true)
  })

  it('rejects malformed true/false choices', () => {
    const { question, sectionIds } = loadFixtureQuestion(
      'mixed-question-project.json',
      0,
    )
    question.choices[0].text = 'Yes'
    question.choices[1].text = 'No'

    const result = validateQuestion(question, { sectionIds })

    expect(
      result.errors.some(
        (issue) =>
          issue.code === 'true_false_requires_normalized_boolean_pair',
      ),
    ).toBe(true)
  })

  it('rejects verified short answer questions without accepted answers', () => {
    const { question, sectionIds } = loadFixtureQuestion(
      'mixed-question-project.json',
      2,
    )
    question.correctAnswers = []
    question.answerStatus = 'verified'

    const result = validateQuestion(question, { sectionIds })

    expect(
      result.errors.some(
        (issue) => issue.code === 'short_answer_requires_accepted_answer',
      ),
    ).toBe(true)
  })

  it('rejects matching questions with incomplete answer maps', () => {
    const { question, sectionIds } = loadFixtureQuestion('matching-project.json')
    expect(question.type).toBe('matching')

    if (question.type !== 'matching') {
      throw new Error('Expected matching fixture question.')
    }

    question.correctAnswers = [question.correctAnswers[0]]

    const result = validateQuestion(question, { sectionIds })

    expect(
      result.errors.some(
        (issue) => issue.code === 'matching_requires_complete_answer_map',
      ),
    ).toBe(true)
  })

  it('rejects ordering questions without a complete order', () => {
    const { question, sectionIds } = loadFixtureQuestion('ordering-project.json')
    question.correctAnswers = ['choice_prewrite']

    const result = validateQuestion(question, { sectionIds })

    expect(
      result.errors.some(
        (issue) => issue.code === 'ordering_requires_complete_order',
      ),
    ).toBe(true)
  })

  it('warns on inferred answers without blocking export', () => {
    const { question, sectionIds } = loadFixtureQuestion('simple-mc-project.json')
    question.answerStatus = 'inferred'

    const result = validateQuestion(question, { sectionIds })

    expect(
      result.warnings.some(
        (issue) => issue.code === 'inferred_answer_requires_review',
      ),
    ).toBe(true)
    expect(result.canExport).toBe(true)
  })

  it('warns on duplicate choice text', () => {
    const { question, sectionIds } = loadFixtureQuestion('simple-mc-project.json')
    question.choices[1].text = question.choices[0].text

    const result = validateQuestion(question, { sectionIds })

    expect(result.warnings.some((issue) => issue.code === 'duplicate_choice_text')).toBe(
      true,
    )
  })
})
