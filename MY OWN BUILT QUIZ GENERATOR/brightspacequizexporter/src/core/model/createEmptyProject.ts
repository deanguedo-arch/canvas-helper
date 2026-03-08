import type {
  AssessmentProject,
  ExportHistoryEntry,
  SourceDocument,
} from '../schema/assessment'
import { AssessmentProjectSchema } from '../schema/assessment'
import type { Question } from '../schema/question'
import type { Section } from '../schema/section'

type CreateEmptyProjectOptions = {
  projectId?: string
  title?: string
  description?: string
  courseName?: string
  subjectTags?: string[]
  sourceDocuments?: SourceDocument[]
  sections?: Section[]
  questions?: Question[]
  createdAt?: string
  updatedAt?: string
  version?: number
  exportHistory?: ExportHistoryEntry[]
}

function createIdentifier(prefix: string) {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

export function createEmptyProject(
  options: CreateEmptyProjectOptions = {},
): AssessmentProject {
  const timestamp = new Date().toISOString()

  return AssessmentProjectSchema.parse({
    projectId: options.projectId ?? createIdentifier('project'),
    title: options.title ?? 'Untitled Assessment',
    description: options.description ?? '',
    courseName: options.courseName ?? '',
    subjectTags: options.subjectTags ?? [],
    sourceDocuments: options.sourceDocuments ?? [],
    sections: options.sections ?? [],
    questions: options.questions ?? [],
    createdAt: options.createdAt ?? timestamp,
    updatedAt: options.updatedAt ?? timestamp,
    version: options.version ?? 1,
    exportHistory: options.exportHistory ?? [],
  })
}
