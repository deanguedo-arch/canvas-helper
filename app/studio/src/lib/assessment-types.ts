export type AssessmentQuestionType =
  | "multiple_choice"
  | "true_false"
  | "multi_select"
  | "short_answer"
  | "written_response"
  | "matching"
  | "ordering";

export type AssessmentChoice = {
  choiceId: string;
  label: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
  matchKey: string | null;
  fixedPosition: boolean | null;
  matchRole: "prompt" | "match" | null;
};

export type MatchingCorrectAnswer = {
  promptChoiceId: string;
  matchChoiceId: string;
};

export type AssessmentQuestion = {
  questionId: string;
  sectionId: string | null;
  type: AssessmentQuestionType;
  prompt: string;
  stemRichText: string | null;
  choices: AssessmentChoice[];
  correctAnswers: string[] | MatchingCorrectAnswer[];
  points: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  explanation: string;
  sourceReference: string;
  sourcePage: number | null;
  originText: string;
  confidenceScore: number | null;
  answerStatus: "verified" | "inferred" | "missing";
  reviewStatus: "draft" | "needs_review" | "approved";
  exportNotes: string;
  metadataTags: string[];
};

export type AssessmentProject = {
  projectId: string;
  title: string;
  description: string;
  courseName: string;
  subjectTags: string[];
  sourceDocuments: Array<{
    sourceDocumentId: string;
    name: string;
    type: "text" | "docx" | "pdf" | "manual";
    origin: string;
    importedAt: string;
  }>;
  sections: Array<{
    sectionId: string;
    title: string;
    description: string;
    instructions: string;
    orderIndex: number;
    metadataTags: string[];
  }>;
  questions: AssessmentQuestion[];
  createdAt: string;
  updatedAt: string;
  version: number;
  exportHistory: Array<{
    exportId: string;
    format: "brightspace_csv";
    exportedAt: string;
    status: "success" | "failed";
    fileName: string;
    notes: string;
  }>;
};

export type AssessmentValidationIssue = {
  code: string;
  message: string;
  severity: "error" | "warning";
  blocking: boolean;
  path: string[];
  questionId?: string;
  suggestedFix?: string;
};

export type AssessmentValidation = {
  projectId: string;
  issues: AssessmentValidationIssue[];
  errors: AssessmentValidationIssue[];
  warnings: AssessmentValidationIssue[];
  blockingIssues: AssessmentValidationIssue[];
  isValid: boolean;
  canExport: boolean;
};

export type AssessmentImportResult = {
  assessmentSlug: string;
  importedAt: string;
  sourceResults: Array<{
    sourcePath: string;
    fileName: string;
    sourceDocument: {
      sourceDocumentId: string;
      name: string;
      type: "text" | "docx" | "pdf" | "manual";
      origin: string;
      importedAt: string;
    };
    confidenceScore: number;
    questionCount: number;
    issues: Array<{
      code: string;
      severity: "info" | "warning" | "error";
      message: string;
      sourcePage: number | null;
    }>;
    candidateDiagnostics: Array<{
      code: string;
      severity: "info" | "warning" | "error";
      message: string;
      sourcePage: number | null;
    }>;
    extractionMethod?: "native" | "ocr";
    pageCount?: number;
  }>;
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
  validation: AssessmentValidation;
};

export type AssessmentExportResult = {
  status: "success" | "failed";
  fileName: string;
  content: string | null;
  rows: string[][];
  diagnostics: Array<{
    code: string;
    message: string;
    severity: "info" | "warning" | "error";
    questionId?: string;
    path?: string[];
  }>;
};
