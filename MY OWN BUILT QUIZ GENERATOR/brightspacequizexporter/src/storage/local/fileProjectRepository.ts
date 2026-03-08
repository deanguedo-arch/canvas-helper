import { loadProject } from './loadProject'
import { saveProject } from './saveProject'
import type {
  ProjectRepository,
  StorageLike,
  StoredProjectSummary,
} from '../shared/repositoryTypes'

const PROJECT_INDEX_KEY = 'brightspace-assessment-factory:index'
const PROJECT_KEY_PREFIX = 'brightspace-assessment-factory:project:'

function createMemoryStorage(): StorageLike {
  const entries = new Map<string, string>()

  return {
    getItem(key) {
      return entries.get(key) ?? null
    },
    setItem(key, value) {
      entries.set(key, value)
    },
    removeItem(key) {
      entries.delete(key)
    },
  }
}

function defaultStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }

  return createMemoryStorage()
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

function projectStorageKey(projectId: string) {
  return `${PROJECT_KEY_PREFIX}${projectId}`
}

export function createFileProjectRepository(
  storage: StorageLike = defaultStorage(),
): ProjectRepository {
  return {
    list() {
      return readProjectIndex(storage)
    },
    load(projectId) {
      return loadProject(storage, projectId)
    },
    save(project) {
      return saveProject(storage, project)
    },
    delete(projectId) {
      storage.removeItem(projectStorageKey(projectId))
      const nextIndex = readProjectIndex(storage).filter(
        (summary) => summary.projectId !== projectId,
      )
      storage.setItem(PROJECT_INDEX_KEY, JSON.stringify(nextIndex))
    },
  }
}
