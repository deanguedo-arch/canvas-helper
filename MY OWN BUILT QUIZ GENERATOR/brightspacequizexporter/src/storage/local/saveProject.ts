import { normalizeProject } from '../../core/model/normalizeProject'
import type { AssessmentProject } from '../../core/schema/assessment'
import type {
  StorageLike,
  StoredProjectSummary,
} from '../shared/repositoryTypes'

const PROJECT_INDEX_KEY = 'brightspace-assessment-factory:index'
const PROJECT_KEY_PREFIX = 'brightspace-assessment-factory:project:'

function projectStorageKey(projectId: string) {
  return `${PROJECT_KEY_PREFIX}${projectId}`
}

function readProjectIndex(storage: StorageLike): StoredProjectSummary[] {
  const storedIndex = storage.getItem(PROJECT_INDEX_KEY)

  if (!storedIndex) {
    return []
  }

  try {
    const parsedIndex = JSON.parse(storedIndex) as StoredProjectSummary[]

    return Array.isArray(parsedIndex) ? parsedIndex : []
  } catch {
    return []
  }
}

function writeProjectIndex(storage: StorageLike, index: StoredProjectSummary[]) {
  storage.setItem(PROJECT_INDEX_KEY, JSON.stringify(index))
}

function summarizeProject(project: AssessmentProject): StoredProjectSummary {
  return {
    projectId: project.projectId,
    title: project.title,
    updatedAt: project.updatedAt,
    version: project.version,
    questionCount: project.questions.length,
  }
}

export function saveProject(storage: StorageLike, project: AssessmentProject) {
  const normalizedProject = normalizeProject(project)
  const normalizedForStorage: AssessmentProject = {
    ...normalizedProject,
    updatedAt: new Date().toISOString(),
  }
  const currentIndex = readProjectIndex(storage)
  const nextSummary = summarizeProject(normalizedForStorage)
  const nextIndex = [
    nextSummary,
    ...currentIndex.filter(
      (summary) => summary.projectId !== normalizedForStorage.projectId,
    ),
  ].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

  storage.setItem(
    projectStorageKey(normalizedForStorage.projectId),
    JSON.stringify(normalizedForStorage),
  )
  writeProjectIndex(storage, nextIndex)

  return normalizedForStorage
}
