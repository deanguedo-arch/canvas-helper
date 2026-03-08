import {
  AssessmentProjectSchema,
  type AssessmentProject,
  type AssessmentProjectInput,
} from '../../core/schema/assessment'
import { validateProject } from '../../core/validation/validateProject'
import type { ValidationIssue, ValidationSummary } from '../../core/validation/types'
import {
  BRIGHTSPACE_CSV_FILE_SUFFIX,
  BRIGHTSPACE_CSV_FORMAT,
} from './constants'
import type { BrightspaceCsvRow } from './csvTypes'
import { mapQuestionToRows } from './mapQuestionToRows'
import { createExportDiagnostic, type ExportDiagnostic } from '../shared/diagnostics'
import type { ExportResult } from '../shared/exportResult'

type ExportBrightspaceCsvOptions = {
  requireApprovedForExport?: boolean
  allowIncompleteAnswerKeys?: boolean
}

const RELAXABLE_EXPORT_ISSUE_CODES = new Set([
  'multiple_choice_requires_exactly_one_correct_answer',
  'multiple_choice_choice_flags_do_not_match_correct_answers',
  'multi_select_requires_one_or_more_correct_answers',
  'multi_select_choice_flags_do_not_match_correct_answers',
  'true_false_requires_exactly_one_correct_answer',
  'true_false_choice_flags_do_not_match_correct_answers',
  'short_answer_requires_accepted_answer',
  'autograded_question_missing_answers',
])

function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function escapeCsvCell(value: string) {
  if (value.includes('"')) {
    value = value.replaceAll('"', '""')
  }

  if (value.includes(',') || value.includes('\n') || value.includes('\r') || value.includes('"')) {
    return `"${value}"`
  }

  return value
}

function serializeRows(rows: BrightspaceCsvRow[]) {
  const content = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\r\n')

  return content.length > 0 ? `${content}\r\n` : content
}

function isRelaxableExportIssue(issue: ValidationIssue) {
  return RELAXABLE_EXPORT_ISSUE_CODES.has(issue.code)
}

function canExportWithOptions(
  validationSummary: ValidationSummary,
  allowIncompleteAnswerKeys: boolean,
) {
  return (
    validationSummary.canExport ||
    (allowIncompleteAnswerKeys &&
      validationSummary.blockingIssues.length > 0 &&
      validationSummary.blockingIssues.every(isRelaxableExportIssue))
  )
}

function issueToDiagnostic(
  issue: ValidationIssue,
  allowIncompleteAnswerKeys: boolean,
) {
  return createExportDiagnostic({
    code: issue.code,
    message: issue.message,
    severity:
      allowIncompleteAnswerKeys && isRelaxableExportIssue(issue)
        ? 'warning'
        : issue.severity === 'error'
          ? 'error'
          : 'warning',
    questionId: issue.questionId,
    path: issue.path,
  })
}

function validationDiagnostics(
  project: AssessmentProjectInput | AssessmentProject,
  allowIncompleteAnswerKeys: boolean,
) {
  const validationResult = validateProject(project, {
    requireApprovedForExport: false,
  })
  const diagnostics = validationResult.issues.map<ExportDiagnostic>((issue) =>
    issueToDiagnostic(issue, allowIncompleteAnswerKeys),
  )

  return {
    validationResult,
    diagnostics,
  }
}

export function exportBrightspaceCsv(
  projectInput: AssessmentProjectInput | AssessmentProject,
  options: ExportBrightspaceCsvOptions = {},
): ExportResult {
  const allowIncompleteAnswerKeys = options.allowIncompleteAnswerKeys ?? true
  const parsedProject = AssessmentProjectSchema.safeParse(projectInput)
  const fallbackProjectId =
    typeof projectInput === 'object' &&
    projectInput !== null &&
    'projectId' in projectInput &&
    typeof projectInput.projectId === 'string'
      ? projectInput.projectId
      : 'project'
  const fileNameSource =
    parsedProject.success && parsedProject.data.title.trim().length > 0
      ? parsedProject.data.title
      : fallbackProjectId
  const fileName = `${slugifyFileName(fileNameSource) || fallbackProjectId}${BRIGHTSPACE_CSV_FILE_SUFFIX}`

  if (!parsedProject.success) {
    const diagnostics = parsedProject.error.issues.map((issue) =>
      createExportDiagnostic({
        code: 'project_schema_invalid',
        severity: 'error',
        message: issue.message,
        path: issue.path.map(String),
      }),
    )

    return {
      status: 'failed',
      format: BRIGHTSPACE_CSV_FORMAT,
      fileName,
      content: null,
      rows: [],
      diagnostics,
    }
  }

  const { validationResult, diagnostics } = validationDiagnostics(
    parsedProject.data,
    allowIncompleteAnswerKeys,
  )

  if (
    options.requireApprovedForExport &&
    !canExportWithOptions(
      validateProject(parsedProject.data, { requireApprovedForExport: true }),
      allowIncompleteAnswerKeys,
    )
  ) {
    const strictValidation = validateProject(parsedProject.data, {
      requireApprovedForExport: true,
    })

    return {
      status: 'failed',
      format: BRIGHTSPACE_CSV_FORMAT,
      fileName,
      content: null,
      rows: [],
      diagnostics: strictValidation.issues.map((issue) =>
        issueToDiagnostic(issue, allowIncompleteAnswerKeys),
      ),
    }
  }

  if (!canExportWithOptions(validationResult, allowIncompleteAnswerKeys)) {
    return {
      status: 'failed',
      format: BRIGHTSPACE_CSV_FORMAT,
      fileName,
      content: null,
      rows: [],
      diagnostics,
    }
  }

  const rows: BrightspaceCsvRow[] = []
  const exportDiagnostics = [...diagnostics]
  const relaxedBlockingIssueCount = validationResult.blockingIssues.filter(
    isRelaxableExportIssue,
  ).length

  if (allowIncompleteAnswerKeys && relaxedBlockingIssueCount > 0) {
    exportDiagnostics.push(
      createExportDiagnostic({
        code: 'brightspace_incomplete_answer_keys_exported',
        severity: 'warning',
        message:
          'CSV export included questions with incomplete answer keys. Review before importing into Brightspace.',
        path: ['questions'],
      }),
    )
  }

  if (parsedProject.data.sections.length > 0) {
    exportDiagnostics.push(
      createExportDiagnostic({
        code: 'brightspace_sections_not_exported',
        severity: 'warning',
        message:
          'Brightspace CSV export is flat; section structure is not represented in the CSV output.',
        path: ['sections'],
      }),
    )
  }

  for (const question of parsedProject.data.questions) {
    const mapped = mapQuestionToRows(question)
    rows.push(...mapped.rows)
    exportDiagnostics.push(...mapped.diagnostics)
  }

  return {
    status: 'success',
    format: BRIGHTSPACE_CSV_FORMAT,
    fileName,
    content: serializeRows(rows),
    rows,
    diagnostics: exportDiagnostics,
  }
}
