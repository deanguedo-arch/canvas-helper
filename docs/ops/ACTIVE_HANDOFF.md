# Handoff

- Project: worldreligions30-option1
- Task: Change quiz progress from marks-based scoring to a live answered-questions counter and keep the quiz detail/results layout aligned with the editorial shell.
- Status: ready for validation

## Files changed
- `projects/worldreligions30-option1/workspace/main.js`
- `scripts/tests/worldreligions30-option1-quiz-summary.test.ts`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed
- Removed the old quiz score-reveal path based on objective marks and `quizResultsReady`.
- Added live completion counting so the top quiz number and the `Section Breakdown` rows now track answered questions instead of points.
- Kept `Check answers` for keyed objective feedback, but the big quiz summary number now updates as students select or type answers.
- Updated the quiz overview cards and generated results sheet to use completion language instead of `overall score` / pending point totals.
- Updated the active handoff so the repo now resumes inside `worldreligions30-option1` instead of the stale Sports Wellness image-sizing task.

## Why this changed
- The user wants the quiz number to function as a completion counter because written responses are graded manually.
- The previous results model was confusing because it mixed live progress with mark totals the teacher will not use in-app.

## Source of truth
- Quiz behavior and results generation: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option1\workspace\main.js`
- Quiz completion regression: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\worldreligions30-option1-quiz-summary.test.ts`

## Fragile areas / watchouts
- The live counter depends on `syncVisibleQuizCompletion()` to avoid rerendering away typed written responses.
- Matching and written answers now update the visible completion summary in place; a future renderer rewrite could accidentally drop those `data-quiz-completion-*` or `data-breakdown-score-for` hooks.
- The generated results sheet still includes keyed correctness tables for objective sections even though the headline metric is now completion-based.

## Next prompt should assume
- Work is still scoped only to `projects/worldreligions30-option1/**` plus required handoff docs.
- `sportswellness` must remain untouched in this session.
- Quiz totals should remain question-completion based, not point based, unless the user explicitly asks to bring marks back.

## What still needs validation
- Manual Studio visual QA on a few quizzes to confirm the live counter updates correctly for multiple choice, matching, true/false, and written responses.
- A design pass if the user wants the completion copy or results-sheet cards tightened visually after seeing the new behavior in context.

## Known risks
- The first data regression still verifies that chapter 1 source data contains written-response marks, even though the runtime no longer uses those marks for the top summary counter.
- If a future quiz import omits stable question numbers, written-response counting will fall back to array order.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option1\workspace\main.js`

## Do not do next / warnings
- Do not edit `projects/sportswellness/**`.
- Do not reintroduce `quizResultsReady`, `overall score`, or point-total language into the quiz detail shell unless the scoring model changes again.
