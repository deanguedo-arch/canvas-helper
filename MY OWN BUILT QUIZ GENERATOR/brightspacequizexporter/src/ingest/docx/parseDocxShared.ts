import type { SourceDocument } from '../../core/schema/assessment'
import type { Question } from '../../core/schema/question'
import { classifyQuestionRegions, type QuestionTypeAiFallback } from '../shared/classifyQuestionRegions'
import type { IngestIssue, IngestParseResult } from '../shared/ingestTypes'
import type { CandidateDiagnostic } from '../shared/questionCandidates'
import { mapTypedCandidateToQuestion } from '../shared/mapTypedCandidateToQuestion'
import { extractQuestionRegionsFromDocxBlocks } from './mapping'
import { extractNormalizedBlocksFromDocxDocumentXml } from './structure'

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function blocksToExtractedText(
  blocks: ReturnType<typeof extractNormalizedBlocksFromDocxDocumentXml>,
) {
  return blocks
    .map((block) => {
      if (block.kind === 'image') {
        return '[image]'
      }

      return block.kind === 'table'
        ? block.rows
            .map((row) => row.cells.map((cell) => cell.text).join('\n'))
            .filter((rowText) => rowText.trim().length > 0)
            .join('\n')
        : block.originText
    })
    .filter((text) => text.trim().length > 0)
    .join('\n')
    .trim()
}

function scoreDocxExtractionConfidence(
  extractedTextLength: number,
  questions: Question[],
  candidateDiagnostics: CandidateDiagnostic[],
) {
  const textScore = Math.min(1, extractedTextLength / 2400)
  const questionScore = Math.min(1, questions.length / 10)
  const confidenceAverage =
    questions.length > 0
      ? questions.reduce(
          (total, question) => total + (question.confidenceScore ?? 0),
          0,
        ) / questions.length
      : 0
  const warningPenalty = Math.min(
    0.2,
    candidateDiagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length *
      0.03,
  )

  return clamp(
    Number((textScore * 0.25 + questionScore * 0.3 + confidenceAverage * 0.45 - warningPenalty).toFixed(2)),
  )
}

function buildIssues(
  extractedText: string,
  questions: Question[],
  candidateDiagnostics: CandidateDiagnostic[],
): IngestIssue[] {
  const issues: IngestIssue[] = []

  if (extractedText.length === 0) {
    issues.push({
      code: 'no_text_extracted',
      severity: 'error',
      message: 'No text was extracted from the DOCX file.',
      sourcePage: null,
    })
    return issues
  }

  if (questions.length === 0) {
    issues.push({
      code: 'no_question_candidates',
      severity: 'warning',
      message:
        'Text was extracted but no question-like prompts were detected. Manual authoring is required.',
      sourcePage: null,
    })
    return issues
  }

  const ambiguousCount = candidateDiagnostics.filter(
    (diagnostic) => diagnostic.severity === 'warning',
  ).length

  if (ambiguousCount > 0) {
    issues.push({
      code: 'ambiguous_question_candidates',
      severity: 'warning',
      message: `${ambiguousCount} imported candidate(s) used fallback typing and require manual review.`,
      sourcePage: null,
    })
  }

  const autoGradedWithoutAnswers = questions.filter(
    (question) =>
      (question.type === 'multiple_choice' ||
        question.type === 'multi_select' ||
        question.type === 'true_false') &&
      question.answerStatus === 'missing',
  ).length

  if (autoGradedWithoutAnswers > 0) {
    issues.push({
      code: 'answer_key_required_for_detected_auto_graded_items',
      severity: 'warning',
      message:
        'Auto-graded question types were detected without answer keys. Review and mark correct answers before export.',
      sourcePage: null,
    })
  }

  return issues
}

type BuildDocxParseResultOptions = {
  sourceDocument: SourceDocument
  documentXml: string
  numberingXml?: string
  aiFallback?: QuestionTypeAiFallback
}

export async function buildDocxParseResult(
  options: BuildDocxParseResultOptions,
): Promise<IngestParseResult> {
  const blocks = extractNormalizedBlocksFromDocxDocumentXml(options.documentXml, {
    numberingXml: options.numberingXml,
  })
  const extractedText = blocksToExtractedText(blocks)
  const regions = extractQuestionRegionsFromDocxBlocks(blocks)
  const typedCandidates = await classifyQuestionRegions(regions, {
    aiFallback: options.aiFallback,
  })
  const candidateDiagnostics = typedCandidates.flatMap((candidate) => candidate.diagnostics)
  const questions = typedCandidates.map((candidate) =>
    mapTypedCandidateToQuestion(candidate, {
      sourceReference: options.sourceDocument.name,
      metadataTags: ['ingested', 'docx'],
    }),
  )
  const confidenceScore = scoreDocxExtractionConfidence(
    extractedText.length,
    questions,
    candidateDiagnostics,
  )
  const issues = buildIssues(extractedText, questions, candidateDiagnostics)

  if (confidenceScore < 0.35) {
    issues.push({
      code: 'low_confidence_extraction',
      severity: 'warning',
      message:
        'DOCX extraction confidence is low. Review imported prompts before export.',
      sourcePage: null,
    })
  }

  return {
    sourceDocument: options.sourceDocument,
    extractedText,
    questions,
    confidenceScore,
    issues,
    candidateDiagnostics,
  }
}
