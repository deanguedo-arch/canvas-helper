import { readFile } from 'node:fs/promises'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { createQuestion } from '../../core/model/createQuestion'
import type { Choice, MatchingChoice } from '../../core/schema/choice'
import type { Question } from '../../core/schema/question'
import type { IngestIssue, IngestParseResult } from '../shared/ingestTypes'
import { createSourceDocument } from '../shared/sourceDocument'
import {
  scorePdfExtractionConfidence,
  scorePdfQuestionConfidence,
} from './confidence'
import { extractOcrTextFromPdf } from './ocr'
import {
  extractDraftQuestionsFromPdfText,
  hasQuestionSignals,
  normalizePdfText,
  type PdfQuestionCandidate,
} from './questionExtraction'

function mapCandidateToQuestion(
  candidate: PdfQuestionCandidate,
  sourceReference: string,
  sourceTag: 'pdf' | 'pdf_ocr',
): Question {
  const metadataTags =
    sourceTag === 'pdf_ocr' ? ['ingested', 'pdf', 'ocr'] : ['ingested', 'pdf']

  const createWrittenResponseFallback = () =>
    createQuestion({
      type: 'written_response',
      prompt: candidate.prompt,
      sourceReference,
      sourcePage: candidate.sourcePage,
      originText: candidate.prompt,
      confidenceScore: scorePdfQuestionConfidence(candidate.prompt),
      answerStatus: 'missing',
      reviewStatus: 'needs_review',
      metadataTags,
    })

  if (
    (candidate.questionType === 'multiple_choice' ||
      candidate.questionType === 'multi_select') &&
    candidate.choices.length >= 2
  ) {
    const base = createQuestion({
      type: candidate.questionType,
      prompt: candidate.prompt,
      sourceReference,
      sourcePage: candidate.sourcePage,
      originText: candidate.prompt,
      confidenceScore: scorePdfQuestionConfidence(candidate.prompt),
      answerStatus: 'missing',
      reviewStatus: 'needs_review',
      metadataTags,
    })

    if (
      base.type !== 'multiple_choice' &&
      base.type !== 'multi_select'
    ) {
      return base
    }

    const choices: Choice[] = candidate.choices.map((choice, index) => ({
      choiceId: `${base.questionId}_choice_${index + 1}`,
      label: choice.label,
      text: choice.text,
      isCorrect: false,
      orderIndex: index,
      matchKey: null,
      fixedPosition: null,
      matchRole: null,
    }))

    return {
      ...base,
      choices,
      correctAnswers: [],
    }
  }

  if (candidate.questionType === 'true_false') {
    const base = createQuestion({
      type: 'true_false',
      prompt: candidate.prompt,
      sourceReference,
      sourcePage: candidate.sourcePage,
      originText: candidate.prompt,
      confidenceScore: scorePdfQuestionConfidence(candidate.prompt),
      answerStatus: 'missing',
      reviewStatus: 'needs_review',
      metadataTags,
    })

    if (base.type !== 'true_false') {
      return base
    }

    const choices: Choice[] = [
      {
        choiceId: `${base.questionId}_choice_true`,
        label: 'T',
        text: 'True',
        isCorrect: false,
        orderIndex: 0,
        matchKey: null,
        fixedPosition: null,
        matchRole: null,
      },
      {
        choiceId: `${base.questionId}_choice_false`,
        label: 'F',
        text: 'False',
        isCorrect: false,
        orderIndex: 1,
        matchKey: null,
        fixedPosition: null,
        matchRole: null,
      },
    ]

    return {
      ...base,
      choices,
      correctAnswers: [],
    }
  }

  if (candidate.questionType === 'short_answer') {
    return createQuestion({
      type: 'short_answer',
      prompt: candidate.prompt,
      sourceReference,
      sourcePage: candidate.sourcePage,
      originText: candidate.prompt,
      confidenceScore: scorePdfQuestionConfidence(candidate.prompt),
      answerStatus: 'missing',
      reviewStatus: 'needs_review',
      metadataTags,
      correctAnswers: [],
    })
  }

  if (candidate.questionType === 'matching' && candidate.matchingPairs.length >= 2) {
    const base = createQuestion({
      type: 'matching',
      prompt: candidate.prompt,
      sourceReference,
      sourcePage: candidate.sourcePage,
      originText: candidate.prompt,
      confidenceScore: scorePdfQuestionConfidence(candidate.prompt),
      answerStatus: 'inferred',
      reviewStatus: 'needs_review',
      metadataTags,
      exportNotes: 'Answer map inferred from source matching pairs; review before export.',
    })

    if (base.type !== 'matching') {
      return base
    }

    const promptChoices: MatchingChoice[] = candidate.matchingPairs.map(
      (pair, index) => ({
        choiceId: `${base.questionId}_prompt_${index + 1}`,
        label: `P${index + 1}`,
        text: pair.promptText,
        isCorrect: false,
        orderIndex: index,
        matchKey: `pair_${index + 1}`,
        fixedPosition: null,
        matchRole: 'prompt',
      }),
    )
    const matchChoices: MatchingChoice[] = candidate.matchingPairs.map(
      (pair, index) => ({
        choiceId: `${base.questionId}_match_${index + 1}`,
        label: `M${index + 1}`,
        text: pair.matchText,
        isCorrect: false,
        orderIndex: candidate.matchingPairs.length + index,
        matchKey: `pair_${index + 1}`,
        fixedPosition: null,
        matchRole: 'match',
      }),
    )

    return {
      ...base,
      choices: [...promptChoices, ...matchChoices],
      correctAnswers: candidate.matchingPairs.map((_, index) => ({
        promptChoiceId: promptChoices[index].choiceId,
        matchChoiceId: matchChoices[index].choiceId,
      })),
    }
  }

  if (candidate.questionType === 'ordering') {
    const orderingItems =
      candidate.orderingItems.length >= 2
        ? candidate.orderingItems
        : candidate.choices.map((choice) => choice.text).filter((text) => text.length > 0)

    if (orderingItems.length < 2) {
      return createWrittenResponseFallback()
    }

    const base = createQuestion({
      type: 'ordering',
      prompt: candidate.prompt,
      sourceReference,
      sourcePage: candidate.sourcePage,
      originText: candidate.prompt,
      confidenceScore: scorePdfQuestionConfidence(candidate.prompt),
      answerStatus: 'missing',
      reviewStatus: 'needs_review',
      metadataTags,
    })

    if (base.type !== 'ordering') {
      return base
    }

    const choices: Choice[] = orderingItems.map((item, index) => ({
      choiceId: `${base.questionId}_step_${index + 1}`,
      label: String(index + 1),
      text: item,
      isCorrect: false,
      orderIndex: index,
      matchKey: null,
      fixedPosition: true,
      matchRole: null,
    }))

    return {
      ...base,
      choices,
      correctAnswers: [],
    }
  }

  if (candidate.questionType === 'multiple_choice' || candidate.questionType === 'multi_select') {
    return createWrittenResponseFallback()
  }

  return createQuestion({
    type: 'written_response',
    prompt: candidate.prompt,
    sourceReference,
    sourcePage: candidate.sourcePage,
    originText: candidate.prompt,
    confidenceScore: scorePdfQuestionConfidence(candidate.prompt),
    answerStatus: 'missing',
    reviewStatus: 'needs_review',
    metadataTags,
  })
}

function mapCandidatesToQuestions(
  candidates: PdfQuestionCandidate[],
  sourceReference: string,
  sourceTag: 'pdf' | 'pdf_ocr' = 'pdf',
): Question[] {
  return candidates.map((candidate) =>
    mapCandidateToQuestion(candidate, sourceReference, sourceTag),
  )
}

function buildIssues(extractedText: string, questions: Question[]): IngestIssue[] {
  if (extractedText.length === 0) {
    return [
      {
        code: 'no_text_extracted',
        severity: 'error',
        message: 'No text was extracted from the PDF.',
        sourcePage: null,
      },
    ]
  }

  if (questions.length === 0) {
    return [
      {
        code: 'no_question_candidates',
        severity: 'warning',
        message:
          'Text was extracted but no question-like prompts were detected. Manual authoring is required.',
        sourcePage: null,
      },
    ]
  }

  return []
}

export function shouldAttemptOcrFallback(
  extractedText: string,
  questionCount: number,
) {
  if (questionCount > 0) {
    return false
  }

  if (extractedText.length === 0) {
    return true
  }

  if (!hasQuestionSignals(extractedText)) {
    return true
  }

  return extractedText.length < 1200
}

export async function parsePdf(filePath: string): Promise<IngestParseResult> {
  const sourceDocument = createSourceDocument({
    type: 'pdf',
    origin: filePath,
  })

  const pdfBuffer = await readFile(filePath)
  const extracted = await pdfParse(pdfBuffer)
  const primaryText = normalizePdfText(extracted.text ?? '')
  const primaryCandidates = extractDraftQuestionsFromPdfText(primaryText)
  let extractedText = primaryText
  let questions = mapCandidatesToQuestions(primaryCandidates, sourceDocument.name)
  let usedOcrFallback = false

  if (shouldAttemptOcrFallback(primaryText, questions.length)) {
    try {
      const ocrResult = await extractOcrTextFromPdf(filePath)
      const ocrCandidates = extractDraftQuestionsFromPdfText(ocrResult.text)

      if (ocrResult.text.length > 0) {
        extractedText = [primaryText, ocrResult.text]
          .filter((part) => part.trim().length > 0)
          .join('\f')
      }

      if (ocrCandidates.length > 0) {
        questions = mapCandidatesToQuestions(
          ocrCandidates,
          sourceDocument.name,
          'pdf_ocr',
        )
      }

      usedOcrFallback = true
    } catch {
      // Keep primary extraction and report OCR failure as an issue below.
    }
  }

  const confidenceScore = scorePdfExtractionConfidence({
    extractedTextLength: extractedText.length,
    questionCandidateCount: questions.length,
    pageCount: Math.max(1, extracted.numpages ?? 1),
  })

  const issues = buildIssues(extractedText, questions)

  if (confidenceScore < 0.35) {
    issues.push({
      code: 'low_confidence_extraction',
      severity: 'warning',
      message:
        'PDF extraction confidence is low. Review imported prompts before export.',
      sourcePage: null,
    })
  }

  if (questions.length === 0 && !hasQuestionSignals(extractedText)) {
    issues.push({
      code: 'ocr_required',
      severity: 'warning',
      message:
        'No question signals were detected in extracted text. This PDF likely needs OCR support.',
      sourcePage: null,
    })
  }

  if (questions.some((question) => question.type === 'multiple_choice')) {
    issues.push({
      code: 'answer_key_required_for_multiple_choice',
      severity: 'warning',
      message:
        'Multiple-choice items were detected without answer keys. Mark correct options before export.',
      sourcePage: null,
    })
  }

  if (usedOcrFallback) {
    if (questions.length > 0) {
      issues.push({
        code: 'ocr_applied',
        severity: 'info',
        message: 'OCR fallback was applied and produced draft question candidates.',
        sourcePage: null,
      })
    } else {
      issues.push({
        code: 'ocr_no_candidates',
        severity: 'warning',
        message:
          'OCR fallback was applied but did not produce question candidates from this PDF.',
        sourcePage: null,
      })
    }
  } else if (shouldAttemptOcrFallback(primaryText, primaryCandidates.length)) {
    issues.push({
      code: 'ocr_failed',
      severity: 'warning',
      message:
        'OCR fallback could not be completed in this environment. Text-only extraction was used.',
      sourcePage: null,
    })
  }

  return {
    sourceDocument,
    extractedText,
    questions,
    confidenceScore,
    issues,
    candidateDiagnostics: [],
  }
}

export { extractDraftQuestionsFromPdfText }
