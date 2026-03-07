import { z } from "zod";

export const QuestionTypeSchema = z.enum([
  "multiple_choice",
  "true_false",
  "multi_select",
  "short_answer",
  "written_response",
  "matching",
  "ordering"
]);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const AnswerStatusSchema = z.enum(["verified", "inferred", "missing"]);
export type AnswerStatus = z.infer<typeof AnswerStatusSchema>;

export const ReviewStatusSchema = z.enum(["draft", "needs_review", "approved"]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const SourceDocumentTypeSchema = z.enum(["text", "docx", "pdf", "manual"]);
export type SourceDocumentType = z.infer<typeof SourceDocumentTypeSchema>;

export const MatchRoleSchema = z.enum(["prompt", "match"]);
export type MatchRole = z.infer<typeof MatchRoleSchema>;

const IsoDateTimeSchema = z.string().datetime({ offset: true });

export const ChoiceSchema = z.object({
  choiceId: z.string().min(1),
  label: z.string(),
  text: z.string(),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().int().nonnegative().default(0),
  matchKey: z.string().nullable().default(null),
  fixedPosition: z.boolean().nullable().default(null),
  matchRole: MatchRoleSchema.nullable().default(null)
});
export type Choice = z.infer<typeof ChoiceSchema>;

export const MatchingChoiceSchema = ChoiceSchema.extend({
  matchKey: z.string().min(1),
  matchRole: MatchRoleSchema
});
export type MatchingChoice = z.infer<typeof MatchingChoiceSchema>;

export const MatchingCorrectAnswerSchema = z.object({
  promptChoiceId: z.string().min(1),
  matchChoiceId: z.string().min(1)
});
export type MatchingCorrectAnswer = z.infer<typeof MatchingCorrectAnswerSchema>;

const QuestionCommonSchema = z.object({
  questionId: z.string().min(1),
  sectionId: z.string().min(1).nullable().default(null),
  prompt: z.string(),
  stemRichText: z.string().nullable().default(null),
  points: z.number().nonnegative().default(1),
  feedbackCorrect: z.string().default(""),
  feedbackIncorrect: z.string().default(""),
  explanation: z.string().default(""),
  sourceReference: z.string().default(""),
  sourcePage: z.number().int().nonnegative().nullable().default(null),
  originText: z.string().default(""),
  confidenceScore: z.number().min(0).max(1).nullable().default(null),
  answerStatus: AnswerStatusSchema.default("missing"),
  reviewStatus: ReviewStatusSchema.default("draft"),
  exportNotes: z.string().default(""),
  metadataTags: z.array(z.string().min(1)).default([])
});

const MultipleChoiceQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal("multiple_choice"),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string().min(1)).default([])
});

const TrueFalseQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal("true_false"),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string().min(1)).default([])
});

const MultiSelectQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal("multi_select"),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string().min(1)).default([])
});

const ShortAnswerQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal("short_answer"),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string()).default([])
});

const WrittenResponseQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal("written_response"),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string()).default([])
});

const MatchingQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal("matching"),
  choices: z.array(MatchingChoiceSchema).default([]),
  correctAnswers: z.array(MatchingCorrectAnswerSchema).default([])
});

const OrderingQuestionSchema = QuestionCommonSchema.extend({
  type: z.literal("ordering"),
  choices: z.array(ChoiceSchema).default([]),
  correctAnswers: z.array(z.string().min(1)).default([])
});

export const QuestionSchema = z.discriminatedUnion("type", [
  MultipleChoiceQuestionSchema,
  TrueFalseQuestionSchema,
  MultiSelectQuestionSchema,
  ShortAnswerQuestionSchema,
  WrittenResponseQuestionSchema,
  MatchingQuestionSchema,
  OrderingQuestionSchema
]);
export type Question = z.infer<typeof QuestionSchema>;
export type QuestionInput = z.input<typeof QuestionSchema>;

export const SectionSchema = z.object({
  sectionId: z.string().min(1),
  title: z.string(),
  description: z.string().default(""),
  instructions: z.string().default(""),
  orderIndex: z.number().int().nonnegative().default(0),
  metadataTags: z.array(z.string().min(1)).default([])
});
export type Section = z.infer<typeof SectionSchema>;

export const SourceDocumentSchema = z.object({
  sourceDocumentId: z.string().min(1),
  name: z.string(),
  type: SourceDocumentTypeSchema,
  origin: z.string().default(""),
  importedAt: IsoDateTimeSchema
});
export type SourceDocument = z.infer<typeof SourceDocumentSchema>;

export const ExportHistoryEntrySchema = z.object({
  exportId: z.string().min(1),
  format: z.literal("brightspace_csv").default("brightspace_csv"),
  exportedAt: IsoDateTimeSchema,
  status: z.enum(["success", "failed"]).default("success"),
  fileName: z.string().default(""),
  notes: z.string().default("")
});
export type ExportHistoryEntry = z.infer<typeof ExportHistoryEntrySchema>;

export const AssessmentProjectSchema = z.object({
  projectId: z.string().min(1),
  title: z.string(),
  description: z.string().default(""),
  courseName: z.string().default(""),
  subjectTags: z.array(z.string().min(1)).default([]),
  sourceDocuments: z.array(SourceDocumentSchema).default([]),
  sections: z.array(SectionSchema).default([]),
  questions: z.array(QuestionSchema).default([]),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
  version: z.number().int().positive().default(1),
  exportHistory: z.array(ExportHistoryEntrySchema).default([])
});
export type AssessmentProject = z.infer<typeof AssessmentProjectSchema>;
export type AssessmentProjectInput = z.input<typeof AssessmentProjectSchema>;

export type ValidationSeverity = "error" | "warning";
export type ValidationIssue = {
  code: string;
  message: string;
  severity: ValidationSeverity;
  blocking: boolean;
  path: string[];
  questionId?: string;
  suggestedFix?: string;
};

export type ValidationSummary = {
  issues: ValidationIssue[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  blockingIssues: ValidationIssue[];
  isValid: boolean;
  canExport: boolean;
};

export type ProjectValidationResult = ValidationSummary & {
  projectId: string;
};

export type ExportDiagnosticSeverity = "info" | "warning" | "error";
export type ExportDiagnostic = {
  code: string;
  message: string;
  severity: ExportDiagnosticSeverity;
  questionId?: string;
  path?: string[];
};

export type BrightspaceExportResult = {
  status: "success" | "failed";
  fileName: string;
  content: string | null;
  rows: Array<string[]>;
  diagnostics: ExportDiagnostic[];
};

export type IngestIssueSeverity = "info" | "warning" | "error";
export type IngestIssue = {
  code: string;
  severity: IngestIssueSeverity;
  message: string;
  sourcePage: number | null;
};

export type CandidateDiagnostic = {
  code: string;
  severity: IngestIssueSeverity;
  message: string;
  sourcePage: number | null;
};

export type IngestParseResult = {
  sourceDocument: SourceDocument;
  extractedText: string;
  questions: Question[];
  confidenceScore: number;
  issues: IngestIssue[];
  candidateDiagnostics: CandidateDiagnostic[];
};

export type AssessmentImportSourceResult = {
  sourcePath: string;
  fileName: string;
  sourceDocument: SourceDocument;
  confidenceScore: number;
  questionCount: number;
  issues: IngestIssue[];
  candidateDiagnostics: CandidateDiagnostic[];
  extractionMethod?: "native" | "ocr";
  pageCount?: number;
};

export type AssessmentImportResult = {
  assessmentSlug: string;
  importedAt: string;
  sourceResults: AssessmentImportSourceResult[];
  mergedQuestionCount: number;
  diagnostics: string[];
};

export type AssessmentLibrarySummary = {
  slug: string;
  title: string;
  updatedAt: string;
  questionCount: number;
  sourceCount: number;
};

export type AssessmentLibraryItem = {
  slug: string;
  project: AssessmentProject;
  importResult: AssessmentImportResult | null;
  validation: ProjectValidationResult;
};
