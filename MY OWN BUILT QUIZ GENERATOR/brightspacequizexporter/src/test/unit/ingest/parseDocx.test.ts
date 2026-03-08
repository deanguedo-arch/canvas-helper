import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { classifyQuestionRegions } from '../../../ingest/shared/classifyQuestionRegions'
import {
  extractDocxTextFromDocumentXml,
  extractNormalizedDocxBlocks,
  extractQuestionRegionsFromDocxBlocks,
} from '../../../ingest/docx/mapping'
import { parseDocx } from '../../../ingest/docx/parseDocx'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function paragraph(text = '', options: { bold?: boolean; size?: number; image?: boolean } = {}) {
  const runProperties = [
    options.bold ? '<w:b w:val="1"/>' : '',
    typeof options.size === 'number' ? `<w:sz w:val="${options.size}"/>` : '',
  ].join('')

  if (options.image) {
    return `<w:p><w:r>${runProperties}<w:drawing></w:drawing></w:r></w:p>`
  }

  if (text.length === 0) {
    return '<w:p><w:r></w:r></w:p>'
  }

  return `<w:p><w:r>${runProperties}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
}

function table(rows: string[][]) {
  const rowXml = rows
    .map(
      (row) =>
        `<w:tr>${row
          .map((cell) => {
            const paragraphs = cell
              .split('\n')
              .map((line) => paragraph(line))
              .join('')
            return `<w:tc>${paragraphs.length > 0 ? paragraphs : paragraph('')}</w:tc>`
          })
          .join('')}</w:tr>`,
    )
    .join('')

  return `<w:tbl>${rowXml}</w:tbl>`
}

const structuredDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraph('', { image: true })}
    ${paragraph('')}
    ${paragraph('Section 1, Lessons 1 and 2', { bold: true, size: 32 })}
    ${paragraph('Exercise 1: Multiple Choice', { bold: true, size: 28 })}
    ${paragraph('Decide which of the choices best completes the statement or answers the question.')}
    ${paragraph('Enter the letter that corresponds to your choice in the blank space next to the question. (10 marks)')}
    ${table([
      [
        '',
        '1. Scientists holding this psychological perspective study observable responses and ignore emotion.\nA. Behavioural\nB. Biological\nC. Cognitive\nD. Psychoanalytic',
      ],
      [
        '',
        '2. Scientists holding this psychological perspective focus on unconscious desires.\nA. Behavioural\nB. Biological\nC. Cognitive\nD. Psychoanalytic',
      ],
    ])}
    ${paragraph('Exercise 2: Written Response', { bold: true, size: 28 })}
    ${paragraph('Respond to the following questions in the spaces provided. Your answers must be well-organized using complete sentences and appropriate grammar.')}
    ${paragraph('1. What do abnormal psychologists study? (2 marks)')}
    ${table([['']])}
    ${paragraph('Exercise 3: Matching', { bold: true, size: 28 })}
    ${paragraph('Match each of the terms in Column A with the correct description in Column B. Enter the letter that corresponds to your choice in the Answer column next to each description in Column B. (6 marks)')}
    ${table([
      ['Column A', 'Answer', 'Column B'],
      ['A. social norm view', '', '1. In this view, abnormal behaviour is often linked to genetics.'],
      ['B. statistical deviation view', '', '2. If Bob has an IQ of 165, he would be considered abnormal by those who ascribe to this view.'],
    ])}
    ${paragraph('Exercise 4: Fill in the Blanks', { bold: true, size: 28 })}
    ${paragraph('Complete each statement by identifying the name of the individual in the blank space beside each item. (6 marks)')}
    ${table([
      ['Statement:', "Individual's Name:"],
      ['wrongly believed in the existence of four bodily fluids.', ''],
      ['was an important figure in Islamic medicine.', ''],
    ])}
    ${paragraph('Exercise 5: Project Work', { bold: true, size: 28 })}
    ${paragraph('1. Create a poster, collage, PowerPoint presentation, painting, poem, or sculpture depicting how you believe mental illness is portrayed in the community in which you live. Give your creation a title. (12 marks)')}
    ${paragraph('I have completed and attached/submitted a:')}
    ${paragraph('Poster')}
    ${paragraph('Poem')}
    ${paragraph('Collage')}
    ${table([['']])}
    ${paragraph('Exercise 6: Personal Reflection', { bold: true, size: 28 })}
    ${paragraph('Respond to the following questions in the space provided. Your answers must be well-organized using complete sentences and appropriate grammar.')}
    ${paragraph('1. Regarding the various views of abnormality listed below, indicate if a supporter of the view considers the behaviour abnormal. Explain your reasoning.')}
    ${paragraph('Behaviour: A person refuses to eat any food that is orange.')}
    ${paragraph('a. Social norm view (2 marks)')}
    ${table([['']])}
    ${paragraph('b. Statistical deviation view (2 marks)')}
    ${table([['']])}
  </w:body>
</w:document>`

const ambiguousDocumentXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraph('Personal Psychology Unit 1', { bold: true, size: 28 })}
    ${paragraph('What is emotional intelligence?')}
  </w:body>
</w:document>`

async function createDocxFixture(filePath: string, documentXml: string) {
  const zip = new JSZip()
  zip.file('[Content_Types].xml', '<Types></Types>')
  zip.file('word/document.xml', documentXml)
  const output = await zip.generateAsync({ type: 'nodebuffer' })
  await writeFile(filePath, output)
}

function questionTypeCounts(questionTypes: string[]) {
  return questionTypes.reduce<Record<string, number>>((counts, questionType) => {
    counts[questionType] = (counts[questionType] ?? 0) + 1
    return counts
  }, {})
}

describe('DOCX ingest', () => {
  it('extracts normalized blocks for images, headings, tables, and breaks', () => {
    const blocks = extractNormalizedDocxBlocks(structuredDocumentXml)

    expect(blocks[0].kind).toBe('image')
    expect(blocks[1].kind).toBe('break')
    expect(blocks[2].kind).toBe('heading')
    expect(blocks[3].text).toBe('Exercise 1: Multiple Choice')
    expect(blocks.find((block) => block.kind === 'table')?.rows[0].cells[1].lines[0]).toBe(
      '1. Scientists holding this psychological perspective study observable responses and ignore emotion.',
    )
  })

  it('extracts readable text from structured DOCX XML', () => {
    const text = extractDocxTextFromDocumentXml(structuredDocumentXml)

    expect(text).toContain('Exercise 1: Multiple Choice')
    expect(text).toContain('What do abnormal psychologists study?')
    expect(text).toContain('[image]')
  })

  it('segments and classifies structured DOCX regions into supported question types', async () => {
    const blocks = extractNormalizedDocxBlocks(structuredDocumentXml)
    const regions = extractQuestionRegionsFromDocxBlocks(blocks)
    const typedCandidates = await classifyQuestionRegions(regions)
    const typeCounts = questionTypeCounts(
      typedCandidates.map((candidate) => candidate.questionType),
    )

    expect(typeCounts).toEqual({
      matching: 1,
      multiple_choice: 2,
      short_answer: 2,
      written_response: 4,
    })
    expect(
      typedCandidates.some(
        (candidate) =>
          candidate.questionType === 'written_response' &&
          candidate.prompt.includes('Create a poster'),
      ),
    ).toBe(true)
    expect(typedCandidates.some((candidate) => candidate.prompt === 'Poster')).toBe(false)
    expect(
      typedCandidates.some(
        (candidate) =>
          candidate.questionType === 'matching' &&
          candidate.matchingPairs[0]?.promptText === 'A. social norm view',
      ),
    ).toBe(true)
  })

  it('flags ambiguous question-like paragraphs for manual review', async () => {
    const blocks = extractNormalizedDocxBlocks(ambiguousDocumentXml)
    const regions = extractQuestionRegionsFromDocxBlocks(blocks)
    const typedCandidates = await classifyQuestionRegions(regions)

    expect(typedCandidates).toHaveLength(1)
    expect(typedCandidates[0].questionType).toBe('written_response')
    expect(
      typedCandidates[0].diagnostics.some(
        (diagnostic) => diagnostic.code === 'ambiguous_question_type',
      ),
    ).toBe(true)
  })

  it('parses a DOCX file into typed questions without fabricating auto-graded answers', async () => {
    const fixturePath = join(tmpdir(), `docx-typed-fixture-${Date.now()}.docx`)
    await createDocxFixture(fixturePath, structuredDocumentXml)

    const result = await parseDocx(fixturePath)
    const typeCounts = questionTypeCounts(result.questions.map((question) => question.type))

    expect(typeCounts).toEqual({
      matching: 1,
      multiple_choice: 2,
      short_answer: 2,
      written_response: 4,
    })
    expect(result.questions.find((question) => question.type === 'matching')?.answerStatus).toBe(
      'inferred',
    )
    expect(
      result.questions
        .filter(
          (question) =>
            question.type === 'multiple_choice' || question.type === 'true_false',
        )
        .every((question) => question.answerStatus === 'missing'),
    ).toBe(true)
    expect(
      result.issues.some(
        (issue) => issue.code === 'answer_key_required_for_detected_auto_graded_items',
      ),
    ).toBe(true)
    expect(result.candidateDiagnostics.length).toBeGreaterThan(0)
  })
})
