import type { QuestionType } from '../../core/schema/enums'
import type {
  CandidateDiagnostic,
  QuestionChoiceCandidate,
  QuestionRegion,
  TypedQuestionCandidate,
} from './questionCandidates'

const TRUE_FALSE_CUE_PATTERN = /\b(true\s*\/\s*false|true or false|t\s*\/\s*f)\b/i
const MULTI_SELECT_CUE_PATTERN =
  /\b(select|choose|mark)\b[\w\s,-]{0,40}\b(all that apply|all correct|more than one)\b|\ball that apply\b/i
const SHORT_ANSWER_CUE_PATTERN =
  /\b(short answer|fill in the blank|fill in the blanks|brief answer|one word|identify the name)\b/i
const ORDERING_CUE_PATTERN = /\b(order|arrange|sequence|rank)\b/i
const WRITTEN_RESPONSE_CUE_PATTERN =
  /\b(written response|project work|personal reflection|respond|essay)\b/i
const LONG_FORM_VERB_PATTERN =
  /^(?:why|how|explain|describe|compare|discuss|analyze|reflect|create|do you agree)\b/i
const SHORT_FORM_VERB_PATTERN =
  /^(?:what|when|where|who|which|identify|define|name|list)\b/i

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizedContext(region: QuestionRegion) {
  return normalizeText(
    [
      ...region.contextHeadings,
      ...region.instructionContext,
      ...region.promptParts,
      region.prompt,
    ].join(' '),
  )
}

function createDiagnostic(
  candidateId: string,
  severity: CandidateDiagnostic['severity'],
  code: string,
  message: string,
  evidence: string[],
  aiAssisted = false,
): CandidateDiagnostic {
  return {
    candidateId,
    severity,
    code,
    message,
    evidence: evidence.filter((value) => value.trim().length > 0),
    aiAssisted,
  }
}

function isTrueToken(value: string) {
  const token = normalizeText(value).toLowerCase().replace(/[.!?]+$/g, '')
  return token === 'true' || token === 't'
}

function isFalseToken(value: string) {
  const token = normalizeText(value).toLowerCase().replace(/[.!?]+$/g, '')
  return token === 'false' || token === 'f'
}

function isTrueFalseChoiceSet(choices: QuestionChoiceCandidate[]) {
  if (choices.length !== 2) {
    return false
  }

  const texts = choices.map((choice) => choice.text)
  const labels = choices.map((choice) => choice.label)

  return (
    (texts.some(isTrueToken) || labels.some(isTrueToken)) &&
    (texts.some(isFalseToken) || labels.some(isFalseToken))
  )
}

function looksLikeShortAnswerPrompt(prompt: string) {
  const normalizedPrompt = normalizeText(prompt)

  if (normalizedPrompt.length === 0) {
    return false
  }

  if (SHORT_FORM_VERB_PATTERN.test(normalizedPrompt)) {
    return true
  }

  if (/_{3,}/.test(normalizedPrompt) || normalizedPrompt.endsWith(':')) {
    return true
  }

  return normalizedPrompt.length <= 140 && normalizedPrompt.includes('?')
}

function withDiagnostics(
  region: QuestionRegion,
  questionType: QuestionType,
  confidenceScore: number,
  diagnostics: CandidateDiagnostic[],
  answerStatus: TypedQuestionCandidate['answerStatus'] = 'missing',
  exportNotes = '',
): TypedQuestionCandidate {
  return {
    candidateId: region.regionId,
    prompt: normalizeText(region.prompt),
    questionType,
    originText: normalizeText(region.originText),
    sourcePage: region.sourcePage,
    contextHeadings: region.contextHeadings,
    choices: region.choices,
    matchingPairs: region.matchingPairs,
    orderingItems: region.orderingItems,
    answerStatus,
    reviewStatus: 'needs_review',
    confidenceScore: clamp(Number(confidenceScore.toFixed(2))),
    exportNotes,
    diagnostics,
  }
}

function classifyRuleBased(region: QuestionRegion): TypedQuestionCandidate {
  const prompt = normalizeText(region.prompt)
  const context = normalizedContext(region)
  const evidence = [...region.contextHeadings, ...region.instructionContext, prompt]

  if (region.matchingPairs.length >= 2) {
    return withDiagnostics(
      region,
      'matching',
      0.94,
      [
        createDiagnostic(
          region.regionId,
          'info',
          'matching_pairs_detected',
          'Detected paired prompt/match rows in the source structure.',
          evidence,
        ),
      ],
      'inferred',
      'Answer map inferred from source matching pairs; review before export.',
    )
  }

  if (
    region.orderingItems.length >= 2 &&
    (ORDERING_CUE_PATTERN.test(context) ||
      region.structuralSignals.includes('ordering-items'))
  ) {
    return withDiagnostics(
      region,
      'ordering',
      0.9,
      [
        createDiagnostic(
          region.regionId,
          'info',
          'ordering_sequence_detected',
          'Detected an ordered list that should remain in source order.',
          evidence,
        ),
      ],
      'inferred',
      'Ordering sequence inferred from source item order; review before export.',
    )
  }

  if (region.choices.length >= 2) {
    if (isTrueFalseChoiceSet(region.choices) || TRUE_FALSE_CUE_PATTERN.test(context)) {
      return withDiagnostics(region, 'true_false', 0.92, [
        createDiagnostic(
          region.regionId,
          'info',
          'true_false_choices_detected',
          'Detected a two-choice true/false question structure.',
          evidence,
        ),
      ])
    }

    if (MULTI_SELECT_CUE_PATTERN.test(context)) {
      return withDiagnostics(region, 'multi_select', 0.9, [
        createDiagnostic(
          region.regionId,
          'info',
          'multi_select_cue_detected',
          'Detected multi-select wording with multiple choices.',
          evidence,
        ),
      ])
    }

    return withDiagnostics(region, 'multiple_choice', 0.91, [
      createDiagnostic(
        region.regionId,
        'info',
        'choice_block_detected',
        'Detected a numbered prompt with labeled options.',
        evidence,
      ),
    ])
  }

  if (region.responseSpaceCount > 0) {
    if (
      SHORT_ANSWER_CUE_PATTERN.test(context) ||
      region.structuralSignals.includes('blank-answer-cell') ||
      region.structuralSignals.includes('labeled-response-slot')
    ) {
      return withDiagnostics(region, 'short_answer', 0.82, [
        createDiagnostic(
          region.regionId,
          'info',
          'short_answer_response_space_detected',
          'Detected a bounded response slot that behaves like a short-answer field.',
          evidence,
        ),
      ])
    }

    if (
      WRITTEN_RESPONSE_CUE_PATTERN.test(context) ||
      LONG_FORM_VERB_PATTERN.test(prompt) ||
      prompt.length > 170
    ) {
      return withDiagnostics(region, 'written_response', 0.78, [
        createDiagnostic(
          region.regionId,
          'info',
          'written_response_space_detected',
          'Detected long-form response space without auto-graded answer structure.',
          evidence,
        ),
      ])
    }

    if (looksLikeShortAnswerPrompt(prompt)) {
      return withDiagnostics(region, 'short_answer', 0.58, [
        createDiagnostic(
          region.regionId,
          'warning',
          'ambiguous_response_space_short_answer',
          'Response-space question looks short-form but source cues are limited; review the inferred type.',
          evidence,
        ),
      ])
    }

    return withDiagnostics(region, 'written_response', 0.54, [
      createDiagnostic(
        region.regionId,
        'warning',
        'ambiguous_response_space_written_response',
        'Response-space question defaults to written response because no stronger structural cue was detected.',
        evidence,
      ),
    ])
  }

  if (SHORT_ANSWER_CUE_PATTERN.test(context) || /_{3,}/.test(prompt)) {
    return withDiagnostics(region, 'short_answer', 0.7, [
      createDiagnostic(
        region.regionId,
        'info',
        'short_answer_text_cue_detected',
        'Detected short-answer wording without structured response space.',
        evidence,
      ),
    ])
  }

  return withDiagnostics(region, 'written_response', 0.46, [
    createDiagnostic(
      region.regionId,
      'warning',
      'ambiguous_question_type',
      'No strong structural type cue was detected; imported as written response for manual review.',
      evidence,
    ),
  ])
}

export type AiQuestionTypeResolution = {
  questionType: QuestionType
  confidenceScore?: number
  diagnostics?: Array<{
    severity: CandidateDiagnostic['severity']
    code: string
    message: string
    evidence?: string[]
  }>
}

export type QuestionTypeAiFallback = (
  region: QuestionRegion,
) => Promise<AiQuestionTypeResolution | null>

type ClassifyQuestionRegionsOptions = {
  aiFallback?: QuestionTypeAiFallback
}

export async function classifyQuestionRegions(
  regions: QuestionRegion[],
  options: ClassifyQuestionRegionsOptions = {},
): Promise<TypedQuestionCandidate[]> {
  const typedCandidates: TypedQuestionCandidate[] = []

  for (const region of regions) {
    const ruleBased = classifyRuleBased(region)
    const hasOnlyWarnings = ruleBased.diagnostics.every(
      (diagnostic) => diagnostic.severity === 'warning',
    )

    if (!hasOnlyWarnings || !options.aiFallback) {
      typedCandidates.push(ruleBased)
      continue
    }

    const aiResolution = await options.aiFallback(region)

    if (!aiResolution) {
      typedCandidates.push(ruleBased)
      continue
    }

    const diagnostics = [
      ...ruleBased.diagnostics,
      ...(aiResolution.diagnostics ?? []).map((diagnostic) =>
        createDiagnostic(
          region.regionId,
          diagnostic.severity,
          diagnostic.code,
          diagnostic.message,
          diagnostic.evidence ?? [],
          true,
        ),
      ),
    ]

    typedCandidates.push({
      ...ruleBased,
      questionType: aiResolution.questionType,
      confidenceScore: clamp(
        Number(
          (aiResolution.confidenceScore ?? Math.max(ruleBased.confidenceScore, 0.62)).toFixed(
            2,
          ),
        ),
      ),
      diagnostics,
    })
  }

  return typedCandidates
}
