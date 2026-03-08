import { basename } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseDocx } from '../../../ingest/docx/parseDocx'

const fixturePath = process.env.DOCX_FIXTURE_PATH
const describeRealFixture = fixturePath ? describe : describe.skip

function questionTypeCounts(questionTypes: string[]) {
  return questionTypes.reduce<Record<string, number>>((counts, questionType) => {
    counts[questionType] = (counts[questionType] ?? 0) + 1
    return counts
  }, {})
}

describeRealFixture('manual DOCX fixture evaluation', () => {
  it('summarizes a real DOCX import result', async () => {
    const result = await parseDocx(fixturePath!)
    const summary = {
      fixture: basename(fixturePath!),
      questionCount: result.questions.length,
      typeCounts: questionTypeCounts(result.questions.map((question) => question.type)),
      issueCodes: result.issues.map((issue) => issue.code),
      warningDiagnostics: result.candidateDiagnostics.filter(
        (diagnostic) => diagnostic.severity === 'warning',
      ).length,
    }

    console.log(JSON.stringify(summary, null, 2))
    expect(result.questions.length).toBeGreaterThan(0)
  })
})
