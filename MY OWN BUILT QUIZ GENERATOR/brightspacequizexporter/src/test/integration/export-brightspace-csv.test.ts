import { describe, expect, it } from 'vitest'
import { type AssessmentProject } from '../../core/schema/assessment'
import { exportBrightspaceCsv } from '../../export/brightspaceCsv/exportBrightspaceCsv'
import { loadJsonFixture, loadTextFixture } from '../helpers/fixtureLoader'

const exportFixtures = [
  ['simple-mc-project.json', 'simple-mc.csv'],
  ['mixed-question-project.json', 'mixed-question.csv'],
  ['matching-project.json', 'matching.csv'],
  ['ordering-project.json', 'ordering.csv'],
] as const

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n/g, '\n')
}

describe('brightspace csv export', () => {
  it.each(exportFixtures)(
    'exports %s to the expected CSV snapshot',
    (projectFixtureName, expectedFixtureName) => {
      const project = loadJsonFixture<AssessmentProject>(
        'projects',
        projectFixtureName,
      )
      const expectedCsv = loadTextFixture(
        'expected-exports',
        expectedFixtureName,
      )
      const result = exportBrightspaceCsv(project)

      expect(result.status).toBe('success')
      if (result.status !== 'success') {
        throw new Error('Expected export to succeed.')
      }

      expect(normalizeLineEndings(result.content)).toBe(
        normalizeLineEndings(expectedCsv),
      )
    },
  )
})
