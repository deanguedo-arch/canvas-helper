import type {
  AnswerStatus,
  QuestionType,
  ReviewStatus,
} from '../../core/schema/enums'

export type NormalizedBlockKind = 'heading' | 'paragraph' | 'table' | 'break' | 'image'

export type NormalizedTableCell = {
  columnIndex: number
  text: string
  lines: string[]
  isBlank: boolean
}

export type NormalizedTableRow = {
  rowIndex: number
  text: string
  cells: NormalizedTableCell[]
}

export type NormalizedBlock = {
  blockId: string
  kind: NormalizedBlockKind
  text: string
  originText: string
  lines: string[]
  contextHeadings: string[]
  headingLevel: number | null
  listMarker: string | null
  hasImage: boolean
  tableId: string | null
  rows: NormalizedTableRow[]
}

export type QuestionChoiceCandidate = {
  label: string
  text: string
}

export type MatchingPairCandidate = {
  promptText: string
  matchText: string
}

export type QuestionRegion = {
  regionId: string
  prompt: string
  promptParts: string[]
  originText: string
  contextHeadings: string[]
  instructionContext: string[]
  sourceBlockIds: string[]
  sourcePage: number | null
  choices: QuestionChoiceCandidate[]
  matchingPairs: MatchingPairCandidate[]
  orderingItems: string[]
  responseSpaceCount: number
  tableColumnCount: number | null
  splitFromComposite: boolean
  structuralSignals: string[]
}

export type CandidateDiagnostic = {
  candidateId: string
  severity: 'info' | 'warning' | 'error'
  code: string
  message: string
  evidence: string[]
  aiAssisted: boolean
}

export type TypedQuestionCandidate = {
  candidateId: string
  prompt: string
  questionType: QuestionType
  originText: string
  sourcePage: number | null
  contextHeadings: string[]
  choices: QuestionChoiceCandidate[]
  matchingPairs: MatchingPairCandidate[]
  orderingItems: string[]
  answerStatus: AnswerStatus
  reviewStatus: ReviewStatus
  confidenceScore: number
  exportNotes: string
  diagnostics: CandidateDiagnostic[]
}
