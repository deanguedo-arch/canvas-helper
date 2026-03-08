import { describe, expect, it } from 'vitest'
import { createEmptyProject } from '../../../core/model/createEmptyProject'
import { createQuestion } from '../../../core/model/createQuestion'
import { createFileProjectRepository } from '../../../storage/local/fileProjectRepository'
import type { StorageLike } from '../../../storage/shared/repositoryTypes'

function createStorage(): StorageLike {
  const values = new Map<string, string>()

  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, value)
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

describe('fileProjectRepository', () => {
  it('saves, lists, and loads projects from storage', () => {
    const repository = createFileProjectRepository(createStorage())
    const project = createEmptyProject({
      projectId: 'project_repository',
      title: 'Repository test',
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
      questions: [
        createQuestion({
          questionId: 'question_repository',
          type: 'multiple_choice',
        }),
      ],
    })

    const savedProject = repository.save(project)
    const summaries = repository.list()
    const loadedProject = repository.load(project.projectId)

    expect(savedProject.updatedAt).not.toBe('2026-03-06T00:00:00.000Z')
    expect(summaries).toEqual([
      {
        projectId: 'project_repository',
        title: 'Repository test',
        updatedAt: savedProject.updatedAt,
        version: 1,
        questionCount: 1,
      },
    ])
    expect(loadedProject?.projectId).toBe('project_repository')
    expect(loadedProject?.questions).toHaveLength(1)
  })

  it('deletes saved projects and clears them from the index', () => {
    const repository = createFileProjectRepository(createStorage())
    const project = createEmptyProject({
      projectId: 'project_repository_delete',
      title: 'Delete me',
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
    })

    repository.save(project)
    repository.delete(project.projectId)

    expect(repository.list()).toEqual([])
    expect(repository.load(project.projectId)).toBeNull()
  })
})
