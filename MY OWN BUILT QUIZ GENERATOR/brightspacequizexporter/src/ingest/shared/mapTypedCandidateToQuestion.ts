import { createQuestion } from '../../core/model/createQuestion'
import type { Choice, MatchingChoice } from '../../core/schema/choice'
import type { Question } from '../../core/schema/question'
import type { TypedQuestionCandidate } from './questionCandidates'

type MapTypedCandidateToQuestionOptions = {
  sourceReference: string
  metadataTags: string[]
}

export function mapTypedCandidateToQuestion(
  candidate: TypedQuestionCandidate,
  options: MapTypedCandidateToQuestionOptions,
): Question {
  const base = createQuestion({
    type: candidate.questionType,
    prompt: candidate.prompt,
    sourceReference: options.sourceReference,
    sourcePage: candidate.sourcePage,
    originText: candidate.originText,
    confidenceScore: candidate.confidenceScore,
    answerStatus: candidate.answerStatus,
    reviewStatus: candidate.reviewStatus,
    exportNotes: candidate.exportNotes,
    metadataTags: options.metadataTags,
  })

  if (
    (candidate.questionType === 'multiple_choice' ||
      candidate.questionType === 'multi_select') &&
    (base.type === 'multiple_choice' || base.type === 'multi_select')
  ) {
    const choices: Choice[] = candidate.choices.map((choice, index) => ({
      choiceId: `${base.questionId}_choice_${index + 1}`,
      label: choice.label,
      text: choice.text,
      isCorrect: false,
      orderIndex: index,
      matchKey: null,
      fixedPosition: null,
      matchRole: null,
    }))

    return {
      ...base,
      choices,
      correctAnswers: [],
    }
  }

  if (candidate.questionType === 'true_false' && base.type === 'true_false') {
    const choices: Choice[] = [
      {
        choiceId: `${base.questionId}_choice_true`,
        label: 'T',
        text: 'True',
        isCorrect: false,
        orderIndex: 0,
        matchKey: null,
        fixedPosition: null,
        matchRole: null,
      },
      {
        choiceId: `${base.questionId}_choice_false`,
        label: 'F',
        text: 'False',
        isCorrect: false,
        orderIndex: 1,
        matchKey: null,
        fixedPosition: null,
        matchRole: null,
      },
    ]

    return {
      ...base,
      choices,
      correctAnswers: [],
    }
  }

  if (candidate.questionType === 'matching' && base.type === 'matching') {
    const promptChoices: MatchingChoice[] = candidate.matchingPairs.map((pair, index) => ({
      choiceId: `${base.questionId}_prompt_${index + 1}`,
      label: `P${index + 1}`,
      text: pair.promptText,
      isCorrect: false,
      orderIndex: index,
      matchKey: `pair_${index + 1}`,
      fixedPosition: null,
      matchRole: 'prompt',
    }))
    const matchChoices: MatchingChoice[] = candidate.matchingPairs.map((pair, index) => ({
      choiceId: `${base.questionId}_match_${index + 1}`,
      label: `M${index + 1}`,
      text: pair.matchText,
      isCorrect: false,
      orderIndex: candidate.matchingPairs.length + index,
      matchKey: `pair_${index + 1}`,
      fixedPosition: null,
      matchRole: 'match',
    }))

    return {
      ...base,
      choices: [...promptChoices, ...matchChoices],
      correctAnswers: candidate.matchingPairs.map((_, index) => ({
        promptChoiceId: promptChoices[index].choiceId,
        matchChoiceId: matchChoices[index].choiceId,
      })),
    }
  }

  if (candidate.questionType === 'ordering' && base.type === 'ordering') {
    const choices: Choice[] = candidate.orderingItems.map((item, index) => ({
      choiceId: `${base.questionId}_step_${index + 1}`,
      label: String(index + 1),
      text: item,
      isCorrect: false,
      orderIndex: index,
      matchKey: null,
      fixedPosition: true,
      matchRole: null,
    }))

    return {
      ...base,
      choices,
      correctAnswers:
        candidate.answerStatus === 'inferred'
          ? choices.map((choice) => choice.choiceId)
          : [],
    }
  }

  return base
}
