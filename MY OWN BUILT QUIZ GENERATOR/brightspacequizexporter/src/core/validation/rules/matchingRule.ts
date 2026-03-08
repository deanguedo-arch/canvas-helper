import type { MatchingQuestion } from '../../schema/question'
import { createValidationIssue } from '../types'

function countByMatchKey(matchKeys: string[]) {
  const counts = new Map<string, number>()

  for (const matchKey of matchKeys) {
    counts.set(matchKey, (counts.get(matchKey) ?? 0) + 1)
  }

  return counts
}

export function matchingRule(question: MatchingQuestion) {
  const issues = []
  const promptChoices = question.choices.filter((choice) => choice.matchRole === 'prompt')
  const matchChoices = question.choices.filter((choice) => choice.matchRole === 'match')
  const promptIds = new Set(promptChoices.map((choice) => choice.choiceId))
  const matchIds = new Set(matchChoices.map((choice) => choice.choiceId))
  const promptKeyCounts = countByMatchKey(promptChoices.map((choice) => choice.matchKey))
  const matchKeyCounts = countByMatchKey(matchChoices.map((choice) => choice.matchKey))
  const allMatchKeys = new Set([
    ...promptKeyCounts.keys(),
    ...matchKeyCounts.keys(),
  ])
  const duplicatePromptAssignments =
    new Set(question.correctAnswers.map((answer) => answer.promptChoiceId)).size !==
    question.correctAnswers.length
  const duplicateMatchAssignments =
    new Set(question.correctAnswers.map((answer) => answer.matchChoiceId)).size !==
    question.correctAnswers.length
  const invalidMappings = question.correctAnswers.filter(
    (answer) =>
      !promptIds.has(answer.promptChoiceId) || !matchIds.has(answer.matchChoiceId),
  )

  if (promptChoices.length === 0 || matchChoices.length === 0) {
    issues.push(
      createValidationIssue({
        code: 'matching_requires_prompt_and_match_choices',
        message: 'Matching questions must include both prompt-side and match-side choices.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
      }),
    )
  }

  if (promptChoices.length !== matchChoices.length) {
    issues.push(
      createValidationIssue({
        code: 'matching_requires_balanced_sides',
        message: 'Matching questions must have a balanced number of prompt and match choices.',
        path: ['questions', question.questionId, 'choices'],
        questionId: question.questionId,
      }),
    )
  }

  for (const matchKey of allMatchKeys) {
    if (
      (promptKeyCounts.get(matchKey) ?? 0) !== 1 ||
      (matchKeyCounts.get(matchKey) ?? 0) !== 1
    ) {
      issues.push(
        createValidationIssue({
          code: 'matching_requires_one_prompt_and_one_match_per_key',
          message:
            'Each matching pair must contain exactly one prompt choice and one match choice.',
          path: ['questions', question.questionId, 'choices'],
          questionId: question.questionId,
          suggestedFix:
            'Assign each matchKey to exactly one prompt and one match choice.',
        }),
      )
      break
    }
  }

  if (invalidMappings.length > 0) {
    issues.push(
      createValidationIssue({
        code: 'matching_correct_answers_must_reference_existing_choices',
        message:
          'Matching correctAnswers must reference existing prompt and match choice ids.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (duplicatePromptAssignments || duplicateMatchAssignments) {
    issues.push(
      createValidationIssue({
        code: 'matching_duplicate_assignments',
        message:
          'Matching correctAnswers must not assign the same prompt or match choice more than once.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
      }),
    )
  }

  if (
    question.answerStatus !== 'missing' &&
    question.correctAnswers.length !== promptChoices.length
  ) {
    issues.push(
      createValidationIssue({
        code: 'matching_requires_complete_answer_map',
        message:
          'Matching questions need a complete answer map for every prompt choice.',
        path: ['questions', question.questionId, 'correctAnswers'],
        questionId: question.questionId,
        suggestedFix:
          'Provide one match assignment for each prompt choice before export.',
      }),
    )
  }

  return issues
}
