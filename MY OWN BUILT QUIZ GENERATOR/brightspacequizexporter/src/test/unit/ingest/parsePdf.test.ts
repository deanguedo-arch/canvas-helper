import { describe, expect, it } from 'vitest'
import {
  extractDraftQuestionsFromPdfText,
  shouldAttemptOcrFallback,
} from '../../../ingest/pdf/parsePdf'
import {
  scorePdfExtractionConfidence,
  scorePdfQuestionConfidence,
} from '../../../ingest/pdf/confidence'

describe('PDF ingest heuristics', () => {
  it('extracts question-like lines into draft candidates', () => {
    const rawText = [
      'Unit 1 Personal Psychology',
      'What is emotional intelligence?',
      'Do you think emotions affect decision-making? Explain.',
      'PAGE 1',
    ].join('\n')

    const candidates = extractDraftQuestionsFromPdfText(rawText)
    expect(candidates).toHaveLength(2)
    expect(candidates[0].prompt).toBe('What is emotional intelligence?')
    expect(candidates[1].prompt).toContain('Do you think emotions affect decision-making?')
  })

  it('detects numbered multiple-choice blocks with A-D options', () => {
    const rawText = [
      '1. Psychology is the study of',
      'A. hypnosis',
      'B. the human soul',
      'C. human behaviour',
      'D. subconscious thoughts',
    ].join('\n')

    const candidates = extractDraftQuestionsFromPdfText(rawText)
    expect(candidates).toHaveLength(1)
    expect(candidates[0].questionType).toBe('multiple_choice')
    expect(candidates[0].choices).toHaveLength(4)
    expect(candidates[0].choices[2].label).toBe('C')
    expect(candidates[0].choices[2].text).toBe('human behaviour')
  })

  it('detects true/false items from section headings', () => {
    const rawText = [
      'True or False',
      '14. Psychology is a natural science.',
      '15. All behavior is conscious.',
    ].join('\n')

    const candidates = extractDraftQuestionsFromPdfText(rawText)
    expect(candidates).toHaveLength(2)
    expect(candidates[0].questionType).toBe('true_false')
    expect(candidates[0].choices).toHaveLength(2)
    expect(candidates[1].questionType).toBe('true_false')
  })

  it('detects multi-select cues in prompts', () => {
    const rawText = [
      '1. Select all that apply: Which are parts of the nervous system?',
      'A. Brain',
      'B. Spinal cord',
      'C. Liver',
      'D. Peripheral nerves',
    ].join('\n')

    const candidates = extractDraftQuestionsFromPdfText(rawText)
    expect(candidates).toHaveLength(1)
    expect(candidates[0].questionType).toBe('multi_select')
    expect(candidates[0].choices).toHaveLength(4)
  })

  it('detects matching blocks with paired lines', () => {
    const rawText = [
      'Matching',
      '1. Match each term with its definition.',
      'A. Neuron - Nerve cell',
      'B. Synapse - Gap between neurons',
      'C. Cortex - Outer brain layer',
    ].join('\n')

    const candidates = extractDraftQuestionsFromPdfText(rawText)
    expect(candidates).toHaveLength(1)
    expect(candidates[0].questionType).toBe('matching')
    expect(candidates[0].matchingPairs).toHaveLength(3)
  })

  it('detects ordering sections with numbered options', () => {
    const rawText = [
      'Ordering',
      '1. Arrange these steps in the scientific method.',
      'A. Form hypothesis',
      'B. Collect data',
      'C. Draw conclusion',
    ].join('\n')

    const candidates = extractDraftQuestionsFromPdfText(rawText)
    expect(candidates).toHaveLength(1)
    expect(candidates[0].questionType).toBe('ordering')
    expect(candidates[0].orderingItems).toHaveLength(3)
  })

  it('detects short-answer cues', () => {
    const rawText = [
      'Short Answer',
      '1. Brief answer: define cognition.',
      '2. Fill in the blank: The study of behavior is _____.',
    ].join('\n')

    const candidates = extractDraftQuestionsFromPdfText(rawText)
    expect(candidates).toHaveLength(2)
    expect(candidates[0].questionType).toBe('short_answer')
    expect(candidates[1].questionType).toBe('short_answer')
  })

  it('scores confidence in a stable range', () => {
    expect(scorePdfQuestionConfidence('What is identity formation?')).toBeGreaterThan(
      0.5,
    )
    expect(
      scorePdfExtractionConfidence({
        extractedTextLength: 4000,
        questionCandidateCount: 8,
        pageCount: 4,
      }),
    ).toBeGreaterThan(0.6)
  })

  it('returns no candidates when text has no question prompts', () => {
    const rawText = [
      'Personal Psychology Unit 1',
      'Student Workbook',
      'Read the chapter and summarize key ideas',
      'PAGE 2',
    ].join('\n')

    const candidates = extractDraftQuestionsFromPdfText(rawText)
    expect(candidates).toHaveLength(0)
  })

  it('flags OCR fallback when no question candidates exist', () => {
    expect(shouldAttemptOcrFallback('Workbook title and cover page text', 0)).toBe(
      true,
    )
    expect(
      shouldAttemptOcrFallback('Why do emotions influence behavior?', 1),
    ).toBe(false)
  })
})
