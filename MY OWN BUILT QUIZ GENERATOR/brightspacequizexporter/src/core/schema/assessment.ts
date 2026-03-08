import { z } from 'zod'
import {
  ExportFormatSchema,
  ExportStatusSchema,
  SourceDocumentTypeSchema,
} from './enums'
import { QuestionSchema } from './question'
import { SectionSchema } from './section'

const IsoDateTimeSchema = z.string().datetime({ offset: true })

export const SourceDocumentSchema = z.object({
  sourceDocumentId: z.string().min(1),
  name: z.string(),
  type: SourceDocumentTypeSchema,
  origin: z.string().default(''),
  importedAt: IsoDateTimeSchema,
})

export const ExportHistoryEntrySchema = z.object({
  exportId: z.string().min(1),
  format: ExportFormatSchema.default('brightspace_csv'),
  exportedAt: IsoDateTimeSchema,
  status: ExportStatusSchema.default('success'),
  fileName: z.string().default(''),
  notes: z.string().default(''),
})

export const AssessmentProjectSchema = z.object({
  projectId: z.string().min(1),
  title: z.string(),
  description: z.string().default(''),
  courseName: z.string().default(''),
  subjectTags: z.array(z.string().min(1)).default([]),
  sourceDocuments: z.array(SourceDocumentSchema).default([]),
  sections: z.array(SectionSchema).default([]),
  questions: z.array(QuestionSchema).default([]),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
  version: z.number().int().positive().default(1),
  exportHistory: z.array(ExportHistoryEntrySchema).default([]),
})

export type SourceDocument = z.infer<typeof SourceDocumentSchema>
export type ExportHistoryEntry = z.infer<typeof ExportHistoryEntrySchema>
export type AssessmentProject = z.infer<typeof AssessmentProjectSchema>
export type AssessmentProjectInput = z.input<typeof AssessmentProjectSchema>
