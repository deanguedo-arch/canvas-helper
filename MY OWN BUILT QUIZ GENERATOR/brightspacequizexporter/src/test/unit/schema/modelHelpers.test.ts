import { describe, expect, it } from 'vitest'
import { cloneProject } from '../../../core/model/cloneProject'
import { createEmptyProject } from '../../../core/model/createEmptyProject'
import { createQuestion } from '../../../core/model/createQuestion'
import { normalizeProject } from '../../../core/model/normalizeProject'
import { AssessmentProjectSchema } from '../../../core/schema/assessment'
import { questionTypes } from '../../../core/schema/enums'

describe('model helpers', () => {
  it('creates a valid empty project', () => {
    const project = createEmptyProject({
      projectId: 'project_fixture',
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
    })

    expect(() => AssessmentProjectSchema.parse(project)).not.toThrow()
    expect(project.title).toBe('Untitled Assessment')
    expect(project.questions).toHaveLength(0)
  })

  it.each(questionTypes)('creates a valid %s question scaffold', (type) => {
    const question = createQuestion({
      questionId: `${type}_fixture`,
      type,
    })

    expect(question.type).toBe(type)

    if (type === 'matching') {
      expect(question.choices.every((choice) => choice.matchRole !== null)).toBe(
        true,
      )
    }
  })

  it('normalizes duplicate tags and section ordering', () => {
    const project = normalizeProject(
      createEmptyProject({
        projectId: 'project_normalized',
        title: 'Normalization Check',
        createdAt: '2026-03-06T00:00:00.000Z',
        updatedAt: '2026-03-06T00:00:00.000Z',
        subjectTags: ['science', 'science', 'biology'],
        sections: [
          {
            sectionId: 'section_b',
            title: 'Later',
            description: '',
            instructions: '',
            orderIndex: 2,
            metadataTags: ['beta', 'beta'],
          },
          {
            sectionId: 'section_a',
            title: 'Earlier',
            description: '',
            instructions: '',
            orderIndex: 1,
            metadataTags: ['alpha'],
          },
        ],
        questions: [
          createQuestion({
            questionId: 'question_001',
            metadataTags: ['draft', 'draft'],
          }),
        ],
      }),
    )

    expect(project.subjectTags).toEqual(['science', 'biology'])
    expect(project.sections.map((section) => section.sectionId)).toEqual([
      'section_a',
      'section_b',
    ])
    expect(project.sections[1].metadataTags).toEqual(['beta'])
    expect(project.questions[0].metadataTags).toEqual(['draft'])
  })

  it('clones a project without sharing references', () => {
    const project = createEmptyProject({
      projectId: 'project_clone',
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
      questions: [
        createQuestion({
          questionId: 'question_clone',
          prompt: 'Original prompt',
        }),
      ],
    })

    const clonedProject = cloneProject(project)
    clonedProject.questions[0].prompt = 'Changed prompt'

    expect(project.questions[0].prompt).toBe('Original prompt')
    expect(clonedProject.questions[0].prompt).toBe('Changed prompt')
  })
})
