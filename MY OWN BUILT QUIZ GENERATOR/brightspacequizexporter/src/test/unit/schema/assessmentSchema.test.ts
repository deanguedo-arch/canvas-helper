import { describe, expect, it } from 'vitest'
import {
  AssessmentProjectSchema,
  type AssessmentProject,
} from '../../../core/schema/assessment'
import { loadJsonFixture } from '../../helpers/fixtureLoader'

const projectFixtures = [
  'simple-mc-project.json',
  'mixed-question-project.json',
  'matching-project.json',
  'ordering-project.json',
] as const

describe('AssessmentProjectSchema', () => {
  it.each(projectFixtures)('parses fixture %s', (fixtureName) => {
    const fixture = loadJsonFixture<AssessmentProject>('projects', fixtureName)

    expect(() => AssessmentProjectSchema.parse(fixture)).not.toThrow()
  })

  it('rejects unsupported question types', () => {
    const fixture = loadJsonFixture<AssessmentProject>(
      'projects',
      'simple-mc-project.json',
    )

    fixture.questions[0] = {
      ...fixture.questions[0],
      type: 'essay' as never,
    }

    expect(AssessmentProjectSchema.safeParse(fixture).success).toBe(false)
  })
})
