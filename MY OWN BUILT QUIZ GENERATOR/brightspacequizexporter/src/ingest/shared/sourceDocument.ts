import type { SourceDocument } from '../../core/schema/assessment'
import { SourceDocumentSchema } from '../../core/schema/assessment'
import type { SourceDocumentType } from '../../core/schema/enums'

export type CreateSourceDocumentOptions = {
  sourceDocumentId?: string
  name?: string
  type: SourceDocumentType
  origin: string
  importedAt?: string
}

function createIdentifier(prefix: string) {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function normalizeName(origin: string, providedName?: string) {
  if (providedName && providedName.trim().length > 0) {
    return providedName.trim()
  }

  const normalizedOrigin = origin.replaceAll('\\', '/')
  const detectedName = normalizedOrigin.split('/').at(-1)?.trim() ?? ''
  return detectedName.length > 0 ? detectedName : 'source-document'
}

export function createSourceDocument(
  options: CreateSourceDocumentOptions,
): SourceDocument {
  return SourceDocumentSchema.parse({
    sourceDocumentId: options.sourceDocumentId ?? createIdentifier('source'),
    name: normalizeName(options.origin, options.name),
    type: options.type,
    origin: options.origin,
    importedAt: options.importedAt ?? new Date().toISOString(),
  })
}
