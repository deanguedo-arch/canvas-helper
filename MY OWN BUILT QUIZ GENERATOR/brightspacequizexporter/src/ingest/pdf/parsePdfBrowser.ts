import { createWorker } from 'tesseract.js'
import pdfJsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { createQuestion } from '../../core/model/createQuestion'
import type { Choice, MatchingChoice } from '../../core/schema/choice'
import type { Question } from '../../core/schema/question'
import type { IngestIssue, IngestParseResult } from '../shared/ingestTypes'
import { createSourceDocument } from '../shared/sourceDocument'
import {
  scorePdfExtractionConfidence,
  scorePdfQuestionConfidence,
} from './confidence'
import {
  extractDraftQuestionsFromPdfText,
  hasQuestionSignals,
  normalizePdfText,
  type PdfQuestionCandidate,
} from './questionExtraction'

type PdfJsTextItem = {
  str?: string
}

type PdfJsPageProxy = {
  getTextContent: () => Promise<{ items: PdfJsTextItem[] }>
  getViewport: (options: { scale: number }) => { width: number; height: number }
  render: (params: {
    canvasContext: CanvasRenderingContext2D
    viewport: { width: number; height: number }
  }) => { promise: Promise<void> }
}

type PdfJsDocumentProxy = {
  numPages: number
  getPage: (pageNumber: number) => Promise<PdfJsPageProxy>
  destroy?: () => Promise<void> | void
}

const OCR_PAGE_LIMIT = 40
const OCR_SCALE = 1.8

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

function shouldAttemptOcrFallback(extractedText: string, questionCount: number) {
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

async function loadPdfDocument(file: File): Promise<PdfJsDocumentProxy> {
  const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as {
    GlobalWorkerOptions: {
      workerSrc: string
    }
    getDocument: (source: {
      data: Uint8Array
      disableWorker: boolean
      useWorkerFetch: boolean
      isEvalSupported: boolean
      disableFontFace: boolean
    }) => {
      promise: Promise<PdfJsDocumentProxy>
    }
  }
  pdfjs.GlobalWorkerOptions.workerSrc = pdfJsWorkerUrl
  const data = new Uint8Array(await file.arrayBuffer())
  const loadingTask = pdfjs.getDocument({
    data,
    disableWorker: true,
    useWorkerFetch: false,
    isEvalSupported: true,
    disableFontFace: false,
  })
  return loadingTask.promise
}

async function extractTextFromPdfDocument(pdfDocument: PdfJsDocumentProxy) {
  const pageText: string[] = []

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const lines = textContent.items
      .map((item) => item.str ?? '')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
    pageText.push(lines.join('\n'))
  }

  return normalizePdfText(pageText.join('\f'))
}

async function extractOcrTextFromPdfDocument(pdfDocument: PdfJsDocumentProxy) {
  const pageLimit = Math.max(1, Math.min(OCR_PAGE_LIMIT, pdfDocument.numPages))
  const worker = await createWorker('eng', 1)
  const pageText: string[] = []

  try {
    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber)
      const viewport = page.getViewport({ scale: OCR_SCALE })
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.floor(viewport.width))
      canvas.height = Math.max(1, Math.floor(viewport.height))
      const context = canvas.getContext('2d')

      if (!context) {
        continue
      }

      await page.render({ canvasContext: context, viewport }).promise
      const { data } = await worker.recognize(canvas)
      const normalizedText = normalizePdfText(data.text ?? '')

      if (normalizedText.length > 0) {
        pageText.push(normalizedText)
      }
    }
  } finally {
    await worker.terminate()
  }

  return normalizePdfText(pageText.join('\f'))
}

export async function parsePdfFile(file: File): Promise<IngestParseResult> {
  const sourceDocument = createSourceDocument({
    type: 'pdf',
    origin: file.name,
    name: file.name,
  })

  const pdfDocument = await loadPdfDocument(file)
  const primaryText = await extractTextFromPdfDocument(pdfDocument)
  const primaryCandidates = extractDraftQuestionsFromPdfText(primaryText)
  let extractedText = primaryText
  let questions = mapCandidatesToQuestions(primaryCandidates, sourceDocument.name)
  let usedOcrFallback = false
  let ocrFailed = false

  if (shouldAttemptOcrFallback(primaryText, questions.length)) {
    try {
      const ocrText = await extractOcrTextFromPdfDocument(pdfDocument)
      const ocrCandidates = extractDraftQuestionsFromPdfText(ocrText)

      if (ocrText.length > 0) {
        extractedText = [primaryText, ocrText]
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
      ocrFailed = true
    }
  }

  await pdfDocument.destroy?.()

  const confidenceScore = scorePdfExtractionConfidence({
    extractedTextLength: extractedText.length,
    questionCandidateCount: questions.length,
    pageCount: Math.max(1, pdfDocument.numPages),
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
    issues.push({
      code: questions.length > 0 ? 'ocr_applied' : 'ocr_no_candidates',
      severity: questions.length > 0 ? 'info' : 'warning',
      message:
        questions.length > 0
          ? 'OCR fallback was applied and produced draft question candidates.'
          : 'OCR fallback was applied but did not produce question candidates from this PDF.',
      sourcePage: null,
    })
  } else if (ocrFailed) {
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
