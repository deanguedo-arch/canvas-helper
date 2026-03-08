import type { SourceDocument } from '../../core/schema/assessment'
import type { Question } from '../../core/schema/question'
import type { CandidateDiagnostic } from './questionCandidates'

export type IngestIssueSeverity = 'info' | 'warning' | 'error'

export type IngestIssue = {
  code: string
  severity: IngestIssueSeverity
  message: string
  sourcePage: number | null
}

export type IngestParseResult = {
  sourceDocument: SourceDocument
  extractedText: string
  questions: Question[]
  confidenceScore: number
  issues: IngestIssue[]
  candidateDiagnostics: CandidateDiagnostic[]
}
