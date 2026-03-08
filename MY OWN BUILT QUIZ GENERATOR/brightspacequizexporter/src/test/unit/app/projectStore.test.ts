import { describe, expect, it } from 'vitest'
import { createEmptyProject } from '../../../core/model/createEmptyProject'
import { createQuestion } from '../../../core/model/createQuestion'
import {
  addMatchingPairToQuestion,
  addQuestionToProject,
  changeQuestionTypeInProject,
  createProjectStoreState,
  moveChoiceInQuestion,
  removeMatchingPairFromQuestion,
  updateQuestionInProject,
} from '../../../app/state/projectStore'

describe('projectStore helpers', () => {
  it('adds a question and selects it', () => {
    const project = createEmptyProject({
      projectId: 'project_store_add',
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
    })

    const result = addQuestionToProject(project, 'multiple_choice')
    const state = createProjectStoreState(result.project, result.selectedQuestionId)

    expect(result.project.questions).toHaveLength(1)
    expect(result.project.questions[0].type).toBe('multiple_choice')
    expect(state.selectedQuestionId).toBe(result.project.questions[0].questionId)
  })

  it('synchronizes multiple choice correct answers from choice flags', () => {
    const question = createQuestion({
      questionId: 'question_mc_sync',
      type: 'multiple_choice',
    })
    const project = createEmptyProject({
      projectId: 'project_mc_sync',
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
      questions: [question],
    })

    const updatedProject = updateQuestionInProject(project, question.questionId, (currentQuestion) => {
      if (currentQuestion.type !== 'multiple_choice') {
        return currentQuestion
      }

      return {
        ...currentQuestion,
        choices: currentQuestion.choices.map((choice, index) => ({
          ...choice,
          isCorrect: index === 2,
        })),
      }
    })

    expect(updatedProject.questions[0].correctAnswers).toEqual([
      updatedProject.questions[0].choices[2].choiceId,
    ])
    expect(updatedProject.questions[0].choices[2].label).toBe('C')
  })

  it('rebuilds default scaffolding when the question type changes', () => {
    const question = createQuestion({
      questionId: 'question_type_change',
      type: 'multiple_choice',
      prompt: 'Original prompt',
      points: 5,
    })
    const project = createEmptyProject({
      projectId: 'project_type_change',
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
      questions: [question],
    })

    const updatedProject = changeQuestionTypeInProject(
      project,
      question.questionId,
      'true_false',
    )
    const updatedQuestion = updatedProject.questions[0]

    expect(updatedQuestion.type).toBe('true_false')
    expect(updatedQuestion.prompt).toBe('Original prompt')
    expect(updatedQuestion.points).toBe(5)
    expect(updatedQuestion.choices.map((choice) => choice.text)).toEqual([
      'True',
      'False',
    ])
  })

  it('keeps ordering correct answers aligned with item order', () => {
    const question = createQuestion({
      questionId: 'question_ordering_sync',
      type: 'ordering',
    })
    const project = createEmptyProject({
      projectId: 'project_ordering_sync',
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
      questions: [question],
    })

    const movedProject = moveChoiceInQuestion(
      project,
      question.questionId,
      question.choices[2].choiceId,
      'up',
    )
    const movedQuestion = movedProject.questions[0]

    expect(movedQuestion.choices.map((choice) => choice.label)).toEqual(['1', '2', '3'])
    expect(movedQuestion.correctAnswers).toEqual(
      movedQuestion.choices.map((choice) => choice.choiceId),
    )
    expect(movedQuestion.choices[1].choiceId).toBe(question.choices[2].choiceId)
  })

  it('adds and removes matching pairs while keeping answer mappings complete', () => {
    const question = createQuestion({
      questionId: 'question_matching_sync',
      type: 'matching',
    })
    const project = createEmptyProject({
      projectId: 'project_matching_sync',
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
      questions: [question],
    })

    const expandedProject = addMatchingPairToQuestion(project, question.questionId)
    const expandedQuestion = expandedProject.questions[0]
    const removedMatchKey = expandedQuestion.choices.find(
      (choice) => choice.matchRole === 'prompt',
    )?.matchKey

    expect(expandedQuestion.choices).toHaveLength(6)
    expect(expandedQuestion.correctAnswers).toHaveLength(3)

    const reducedProject = removeMatchingPairFromQuestion(
      expandedProject,
      question.questionId,
      removedMatchKey ?? '',
    )

    expect(reducedProject.questions[0].choices).toHaveLength(4)
    expect(reducedProject.questions[0].correctAnswers).toHaveLength(2)
  })
})
