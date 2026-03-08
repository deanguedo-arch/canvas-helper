import type { ExportFormat } from '../schema/enums'

export type ValidationSeverity = 'error' | 'warning'

export type ValidationIssue = {
  code: string
  message: string
  severity: ValidationSeverity
  blocking: boolean
  path: string[]
  questionId?: string
  suggestedFix?: string
}

export type ValidationSuggestion = {
  issueCode: string
  message: string
  path: string[]
}

export type ValidationSummary = {
  issues: ValidationIssue[]
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  blockingIssues: ValidationIssue[]
  suggestedFixes: ValidationSuggestion[]
  isValid: boolean
  canExport: boolean
}

export type QuestionValidationResult = ValidationSummary & {
  questionId: string
}

export type ProjectValidationResult = ValidationSummary & {
  projectId: string
  questionResults: QuestionValidationResult[]
}

export type ValidateProjectOptions = {
  exportTarget?: ExportFormat | null
  requireApprovedForExport?: boolean
}

export type ValidateQuestionContext = {
  sectionIds?: ReadonlySet<string>
  options?: ValidateProjectOptions
}

type CreateValidationIssueInput = {
  code: string
  message: string
  severity?: ValidationSeverity
  blocking?: boolean
  path?: Array<string | number | null | undefined>
  questionId?: string
  suggestedFix?: string
}

function normalizePath(path: Array<string | number | null | undefined>) {
  return path
    .filter((segment) => segment !== null && segment !== undefined)
    .map((segment) => String(segment))
}

export function createValidationIssue(
  input: CreateValidationIssueInput,
): ValidationIssue {
  const severity = input.severity ?? 'error'

  return {
    code: input.code,
    message: input.message,
    severity,
    blocking: input.blocking ?? severity === 'error',
    path: normalizePath(input.path ?? []),
    questionId: input.questionId,
    suggestedFix: input.suggestedFix,
  }
}

export function buildValidationSummary(
  issues: ValidationIssue[],
): ValidationSummary {
  const errors = issues.filter((issue) => issue.severity === 'error')
  const warnings = issues.filter((issue) => issue.severity === 'warning')
  const blockingIssues = issues.filter((issue) => issue.blocking)
  const suggestedFixes = [...new Map(
    issues
      .filter((issue) => issue.suggestedFix)
      .map((issue) => [
        `${issue.code}:${issue.path.join('.')}:${issue.suggestedFix ?? ''}`,
        {
          issueCode: issue.code,
          message: issue.suggestedFix ?? '',
          path: issue.path,
        },
      ]),
  ).values()]

  return {
    issues,
    errors,
    warnings,
    blockingIssues,
    suggestedFixes,
    isValid: errors.length === 0,
    canExport: blockingIssues.length === 0,
  }
}
