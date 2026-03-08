import type { ExportFormat } from '../../core/schema/enums'
import type { BrightspaceCsvRow } from '../brightspaceCsv/csvTypes'
import type { ExportDiagnostic } from './diagnostics'

type BaseExportResult = {
  format: ExportFormat
  fileName: string
  diagnostics: ExportDiagnostic[]
}

export type SuccessfulExportResult = BaseExportResult & {
  status: 'success'
  content: string
  rows: BrightspaceCsvRow[]
}

export type FailedExportResult = BaseExportResult & {
  status: 'failed'
  content: null
  rows: []
}

export type ExportResult = SuccessfulExportResult | FailedExportResult
