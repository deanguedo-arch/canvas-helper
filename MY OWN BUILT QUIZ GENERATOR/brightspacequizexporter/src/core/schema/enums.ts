import { z } from 'zod'

export const questionTypes = [
  'multiple_choice',
  'true_false',
  'multi_select',
  'short_answer',
  'written_response',
  'matching',
  'ordering',
] as const

export const QuestionTypeSchema = z.enum(questionTypes)
export type QuestionType = z.infer<typeof QuestionTypeSchema>

export const AnswerStatusSchema = z.enum(['verified', 'inferred', 'missing'])
export type AnswerStatus = z.infer<typeof AnswerStatusSchema>

export const ReviewStatusSchema = z.enum(['draft', 'needs_review', 'approved'])
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>

export const SourceDocumentTypeSchema = z.enum(['text', 'docx', 'pdf', 'manual'])
export type SourceDocumentType = z.infer<typeof SourceDocumentTypeSchema>

export const ExportFormatSchema = z.enum(['brightspace_csv'])
export type ExportFormat = z.infer<typeof ExportFormatSchema>

export const ExportStatusSchema = z.enum(['success', 'failed'])
export type ExportStatus = z.infer<typeof ExportStatusSchema>

export const MatchRoleSchema = z.enum(['prompt', 'match'])
export type MatchRole = z.infer<typeof MatchRoleSchema>
