import { createEmptyProject } from '../../core/model/createEmptyProject'
import { createQuestion } from '../../core/model/createQuestion'
import type { AssessmentProject } from '../../core/schema/assessment'
import type { Choice, MatchingChoice } from '../../core/schema/choice'
import type { Question, MatchingCorrectAnswer } from '../../core/schema/question'
import type { QuestionType } from '../../core/schema/enums'

export type ProjectStoreState = {
  currentProjectId: string | null
  selectedQuestionId: string | null
}

export type ProjectQuestionUpdateResult = {
  project: AssessmentProject
  selectedQuestionId: string | null
}

export const initialProjectStoreState: ProjectStoreState = {
  currentProjectId: null,
  selectedQuestionId: null,
}

function createIdentifier(prefix: string) {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function letterLabel(index: number) {
  let value = index + 1
  let label = ''

  while (value > 0) {
    const remainder = (value - 1) % 26
    label = `${String.fromCharCode(65 + remainder)}${label}`
    value = Math.floor((value - 1) / 26)
  }

  return label
}

function createChoice(questionId: string, label: string, orderIndex: number): Choice {
  return {
    choiceId: createIdentifier(`${questionId}_choice`),
    label,
    text: '',
    isCorrect: false,
    orderIndex,
    matchKey: null,
    fixedPosition: null,
    matchRole: null,
  }
}

function createMatchingChoice(
  questionId: string,
  label: string,
  matchRole: 'prompt' | 'match',
  matchKey: string,
  orderIndex: number,
): MatchingChoice {
  return {
    choiceId: createIdentifier(`${questionId}_${matchRole}`),
    label,
    text: '',
    isCorrect: false,
    orderIndex,
    matchKey,
    fixedPosition: null,
    matchRole,
  }
}

function syncQuestion(question: Question): Question {
  switch (question.type) {
    case 'multiple_choice':
    case 'multi_select': {
      const choices = question.choices.map((choice, index) => ({
        ...choice,
        label: letterLabel(index),
        orderIndex: index,
        matchKey: null,
        fixedPosition: null,
        matchRole: null,
      }))

      return {
        ...question,
        choices,
        correctAnswers: choices
          .filter((choice) => choice.isCorrect)
          .map((choice) => choice.choiceId),
      }
    }
    case 'true_false': {
      const [trueChoice, falseChoice] = question.choices

      const choices: Choice[] = [
        {
          ...(trueChoice ?? createChoice(question.questionId, 'T', 0)),
          label: 'T',
          text: 'True',
          orderIndex: 0,
          matchKey: null,
          fixedPosition: null,
          matchRole: null,
        },
        {
          ...(falseChoice ?? createChoice(question.questionId, 'F', 1)),
          label: 'F',
          text: 'False',
          orderIndex: 1,
          matchKey: null,
          fixedPosition: null,
          matchRole: null,
        },
      ]

      return {
        ...question,
        choices,
        correctAnswers: choices
          .filter((choice) => choice.isCorrect)
          .map((choice) => choice.choiceId),
      }
    }
    case 'short_answer':
      return {
        ...question,
        choices: [],
        correctAnswers: question.correctAnswers,
      }
    case 'written_response':
      return {
        ...question,
        choices: [],
        correctAnswers: question.correctAnswers,
      }
    case 'matching': {
      const promptChoices = question.choices
        .filter((choice) => choice.matchRole === 'prompt')
        .sort((left, right) => left.orderIndex - right.orderIndex)
      const matchChoices = question.choices
        .filter((choice) => choice.matchRole === 'match')
        .sort((left, right) => left.orderIndex - right.orderIndex)
      const promptByKey = new Map(promptChoices.map((choice) => [choice.matchKey, choice]))
      const matchByKey = new Map(matchChoices.map((choice) => [choice.matchKey, choice]))
      const matchKeys = [...new Set([...promptByKey.keys(), ...matchByKey.keys()])]
      const pairs = matchKeys.map((matchKey, index) => ({
        matchKey,
        prompt:
          promptByKey.get(matchKey) ??
          createMatchingChoice(question.questionId, `P${index + 1}`, 'prompt', matchKey, index),
        match:
          matchByKey.get(matchKey) ??
          createMatchingChoice(
            question.questionId,
            `M${index + 1}`,
            'match',
            matchKey,
            promptChoices.length + index,
          ),
      }))
      const choices = [
        ...pairs.map((pair, index) => ({
          ...pair.prompt,
          label: `P${index + 1}`,
          orderIndex: index,
          matchRole: 'prompt' as const,
          matchKey: pair.matchKey,
        })),
        ...pairs.map((pair, index) => ({
          ...pair.match,
          label: `M${index + 1}`,
          orderIndex: pairs.length + index,
          matchRole: 'match' as const,
          matchKey: pair.matchKey,
        })),
      ]
      const promptChoicesByKey = new Map(
        choices
          .filter((choice) => choice.matchRole === 'prompt')
          .map((choice) => [choice.matchKey, choice.choiceId]),
      )
      const matchChoicesByKey = new Map(
        choices
          .filter((choice) => choice.matchRole === 'match')
          .map((choice) => [choice.matchKey, choice.choiceId]),
      )
      const correctAnswers: MatchingCorrectAnswer[] = matchKeys.flatMap((matchKey) => {
        const promptChoiceId = promptChoicesByKey.get(matchKey)
        const matchChoiceId = matchChoicesByKey.get(matchKey)

        if (!promptChoiceId || !matchChoiceId) {
          return []
        }

        return [{ promptChoiceId, matchChoiceId }]
      })

      return {
        ...question,
        choices,
        correctAnswers,
      }
    }
    case 'ordering': {
      const choices = question.choices.map((choice, index) => ({
        ...choice,
        label: String(index + 1),
        orderIndex: index,
        matchKey: null,
        fixedPosition: index === 0 ? true : null,
        matchRole: null,
      }))

      return {
        ...question,
        choices,
        correctAnswers: choices.map((choice) => choice.choiceId),
      }
    }
  }
}

function updateQuestionCollection(
  project: AssessmentProject,
  questionId: string,
  updater: (question: Question) => Question,
): AssessmentProject {
  return {
    ...project,
    questions: project.questions.map((question) =>
      question.questionId === questionId ? syncQuestion(updater(question)) : question,
    ),
  }
}

export function createDraftProject(title = 'Untitled Assessment') {
  return createEmptyProject({ title })
}

export function createProjectStoreState(
  project: AssessmentProject | null,
  selectedQuestionId: string | null = null,
): ProjectStoreState {
  const resolvedSelectedQuestionId =
    selectedQuestionId &&
    project?.questions.some((question) => question.questionId === selectedQuestionId)
      ? selectedQuestionId
      : project?.questions[0]?.questionId ?? null

  return {
    currentProjectId: project?.projectId ?? null,
    selectedQuestionId: resolvedSelectedQuestionId,
  }
}

export function getSelectedQuestion(
  project: AssessmentProject | null,
  selectedQuestionId: string | null,
) {
  if (!project || !selectedQuestionId) {
    return null
  }

  return (
    project.questions.find((question) => question.questionId === selectedQuestionId) ?? null
  )
}

export function updateProjectMetadata(
  project: AssessmentProject,
  updates: Partial<
    Pick<AssessmentProject, 'title' | 'description' | 'courseName'>
  > & {
    subjectTags?: string[]
  },
) {
  return {
    ...project,
    ...updates,
    subjectTags: updates.subjectTags ?? project.subjectTags,
  }
}

export function addQuestionToProject(
  project: AssessmentProject,
  type: QuestionType,
): ProjectQuestionUpdateResult {
  const question = syncQuestion(
    createQuestion({
      type,
    }),
  )

  return {
    project: {
      ...project,
      questions: [...project.questions, question],
    },
    selectedQuestionId: question.questionId,
  }
}

export function updateQuestionInProject(
  project: AssessmentProject,
  questionId: string,
  updater: (question: Question) => Question,
) {
  return updateQuestionCollection(project, questionId, updater)
}

export function changeQuestionTypeInProject(
  project: AssessmentProject,
  questionId: string,
  type: QuestionType,
) {
  return updateQuestionCollection(project, questionId, (question) =>
    createQuestion({
      questionId: question.questionId,
      sectionId: question.sectionId,
      type,
      prompt: question.prompt,
      stemRichText: question.stemRichText,
      points: question.points,
      feedbackCorrect: question.feedbackCorrect,
      feedbackIncorrect: question.feedbackIncorrect,
      explanation: question.explanation,
      sourceReference: question.sourceReference,
      sourcePage: question.sourcePage,
      originText: question.originText,
      confidenceScore: question.confidenceScore,
      answerStatus: type === 'written_response' ? 'missing' : question.answerStatus,
      reviewStatus: question.reviewStatus,
      exportNotes: question.exportNotes,
      metadataTags: question.metadataTags,
    }),
  )
}

export function deleteQuestionFromProject(
  project: AssessmentProject,
  questionId: string,
) {
  return {
    ...project,
    questions: project.questions.filter((question) => question.questionId !== questionId),
  }
}

export function moveQuestionInProject(
  project: AssessmentProject,
  questionId: string,
  direction: 'up' | 'down',
) {
  const index = project.questions.findIndex((question) => question.questionId === questionId)

  if (index < 0) {
    return project
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1

  if (targetIndex < 0 || targetIndex >= project.questions.length) {
    return project
  }

  const questions = [...project.questions]
  const [movedQuestion] = questions.splice(index, 1)
  questions.splice(targetIndex, 0, movedQuestion)

  return {
    ...project,
    questions,
  }
}

export function addChoiceToQuestion(project: AssessmentProject, questionId: string) {
  return updateQuestionCollection(project, questionId, (question) => {
    if (
      question.type === 'short_answer' ||
      question.type === 'written_response' ||
      question.type === 'matching' ||
      question.type === 'true_false'
    ) {
      return question
    }

    return {
      ...question,
      choices: [
        ...question.choices,
        createChoice(question.questionId, letterLabel(question.choices.length), question.choices.length),
      ],
    }
  })
}

export function removeChoiceFromQuestion(
  project: AssessmentProject,
  questionId: string,
  choiceId: string,
) {
  return updateQuestionCollection(project, questionId, (question) => {
    if (
      question.type === 'short_answer' ||
      question.type === 'written_response' ||
      question.type === 'matching'
    ) {
      return question
    }

    if (question.type === 'true_false') {
      return question
    }

    return {
      ...question,
      choices: question.choices.filter((choice) => choice.choiceId !== choiceId),
    }
  })
}

export function moveChoiceInQuestion(
  project: AssessmentProject,
  questionId: string,
  choiceId: string,
  direction: 'up' | 'down',
) {
  return updateQuestionCollection(project, questionId, (question) => {
    if (
      question.type === 'short_answer' ||
      question.type === 'written_response' ||
      question.type === 'matching'
    ) {
      return question
    }

    const index = question.choices.findIndex((choice) => choice.choiceId === choiceId)

    if (index < 0) {
      return question
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= question.choices.length) {
      return question
    }

    const choices = [...question.choices]
    const [movedChoice] = choices.splice(index, 1)
    choices.splice(targetIndex, 0, movedChoice)

    return {
      ...question,
      choices,
    }
  })
}

export function addMatchingPairToQuestion(
  project: AssessmentProject,
  questionId: string,
) {
  return updateQuestionCollection(project, questionId, (question) => {
    if (question.type !== 'matching') {
      return question
    }

    const pairIndex = question.choices.filter((choice) => choice.matchRole === 'prompt').length
    const matchKey = createIdentifier('pair')

    return {
      ...question,
      choices: [
        ...question.choices,
        createMatchingChoice(question.questionId, `P${pairIndex + 1}`, 'prompt', matchKey, pairIndex),
        createMatchingChoice(
          question.questionId,
          `M${pairIndex + 1}`,
          'match',
          matchKey,
          pairIndex + 100,
        ),
      ],
    }
  })
}

export function removeMatchingPairFromQuestion(
  project: AssessmentProject,
  questionId: string,
  matchKey: string,
) {
  return updateQuestionCollection(project, questionId, (question) => {
    if (question.type !== 'matching') {
      return question
    }

    return {
      ...question,
      choices: question.choices.filter((choice) => choice.matchKey !== matchKey),
    }
  })
}

export function listMatchingPairs(question: Extract<Question, { type: 'matching' }>) {
  const promptChoices = question.choices
    .filter((choice) => choice.matchRole === 'prompt')
    .sort((left, right) => left.orderIndex - right.orderIndex)
  const matchByKey = new Map(
    question.choices
      .filter((choice) => choice.matchRole === 'match')
      .map((choice) => [choice.matchKey, choice]),
  )

  return promptChoices.map((promptChoice) => ({
    matchKey: promptChoice.matchKey,
    promptChoice,
    matchChoice: matchByKey.get(promptChoice.matchKey) ?? null,
  }))
}
