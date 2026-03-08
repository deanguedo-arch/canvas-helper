import type { AssessmentProject } from '../../core/schema/assessment'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type StoredProjectSummary = {
  projectId: string
  title: string
  updatedAt: string
  version: number
  questionCount: number
}

export type ProjectRepository = {
  list(): StoredProjectSummary[]
  load(projectId: string): AssessmentProject | null
  save(project: AssessmentProject): AssessmentProject
  delete(projectId: string): void
}
