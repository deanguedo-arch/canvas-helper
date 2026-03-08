export type ExportDiagnosticSeverity = 'info' | 'warning' | 'error'

export type ExportDiagnostic = {
  code: string
  message: string
  severity: ExportDiagnosticSeverity
  questionId?: string
  path?: string[]
}

type CreateExportDiagnosticInput = {
  code: string
  message: string
  severity?: ExportDiagnosticSeverity
  questionId?: string
  path?: Array<string | number | null | undefined>
}

export function createExportDiagnostic(
  input: CreateExportDiagnosticInput,
): ExportDiagnostic {
  return {
    code: input.code,
    message: input.message,
    severity: input.severity ?? 'info',
    questionId: input.questionId,
    path:
      input.path?.filter((segment) => segment !== null && segment !== undefined).map(String) ??
      undefined,
  }
}
