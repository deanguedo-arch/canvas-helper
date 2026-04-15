# Mental Fitness Option 2 Gating Design

- Project: mentalwellness10-option2
- Date: 2026-04-15

## Goal
Add real learner gating to the existing Option 2 shell so each phase must be marked complete before its quiz opens, and each quiz must be passed at 70 percent before its assignment and the next phase unlock.

## Approved rules
- Phase content gets a `Mark complete` action.
- Marking a phase complete unlocks that phase quiz.
- Quizzes can be retaken unlimited times.
- A quiz counts as passed only when the student submits a score of at least 70 percent.
- Passing the quiz unlocks that phase assignment and the next phase.
- If a phase has no quiz yet, phase completion unlocks its assignment and the next phase directly.
- Keep an authoring bypass flag in code so the lock system can be disabled without another rewrite.

## State model
- `completedPhases`
- `passedQuizzes`
- `quizScores`
- `authoringUnlockAll`

## UI impact
- Locked cards remain visible but non-clickable.
- Phase detail gets a completion footer action.
- Quiz detail gets a `Submit quiz` action and pass/fail state.
- The top progress meter reflects completed phases plus passed quizzes.

## Source of truth
- `projects/mentalwellness10-option2/workspace/main.js`
- `projects/mentalwellness10-option2/workspace/styles.css`
