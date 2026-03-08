import {
  AssessmentProjectSchema,
  type AssessmentProject,
} from '../../core/schema/assessment'
import type { StorageLike } from '../shared/repositoryTypes'

const PROJECT_KEY_PREFIX = 'brightspace-assessment-factory:project:'

function projectStorageKey(projectId: string) {
  return `${PROJECT_KEY_PREFIX}${projectId}`
}

export function loadProject(
  storage: StorageLike,
  projectId: string,
): AssessmentProject | null {
  const storedProject = storage.getItem(projectStorageKey(projectId))

  if (!storedProject) {
    return null
  }

  try {
    return AssessmentProjectSchema.parse(JSON.parse(storedProject))
  } catch {
    return null
  }
}
