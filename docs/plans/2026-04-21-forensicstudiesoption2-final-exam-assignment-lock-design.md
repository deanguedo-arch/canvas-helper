# Forensicstudiesoption2 Final Exam And Assignment Lock Design

## Goal

Add Forensics-specific progression rules to `forensicstudiesoption2` without touching the original `projects/forensics` source:

- remove Module 8 content access from the chapter surface
- keep Assignment 8, but lock it until Assignments 1-7 are completed
- lock the Final Exam until the earlier modules are done
- treat the Final Exam as a test entry that opens directly to the quiz
- rename learner-facing `Open quiz` actions to `Open test`

## Scope

In scope:

- `projects/forensicstudiesoption2/workspace/main.js`
- `scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
- focused handoff-free runtime behavior only

Out of scope:

- editing `projects/forensics/**`
- regenerating `course-data.js`
- changing the authored Forensics lesson content
- broad shell redesign or new project-wide lock policies

## Source Of Truth

The imported course data remains the source record for chapters, quizzes, and assignments.

The new special-case behavior belongs in `projects/forensicstudiesoption2/workspace/main.js` because:

- the user wants a Forensics-option-2-only rule set
- the change is behavioral, not a source-content rewrite
- hiding Module 8 content is a rendering decision, not a data-import correction

## Desired Behavior

### Module 8

- do not show the Module 8 content card on the chapter/home surface
- do not open Module 8 content if its chapter id is triggered directly
- keep Assignment 8 available in the Assignments tab only

### Assignment 8 unlock

- Assignment 8 stays locked until Assignments 1-7 are complete
- assignment completion is tracked in shell-local progress state
- assignments become complete when the learner triggers the embedded assignment's final report/print action inside the same-origin iframe

### Final Exam

- the Final Exam remains visible on the chapter/home surface
- it should not show an `Open content` action
- it should expose a single `Open test` action that opens the connected quiz directly
- it stays locked until the earlier modules are done

## Completion Rules

### Assignment completion

Persist `assignmentComplete[id] = true` in the existing shell progress object.

For this pass, mark an assignment complete when the embedded assignment iframe emits a recognizable final-action click through the shell bridge:

- `Generate Report`
- `Generate Print Report`
- `Print Report`
- `PRINT TO PDF`

This keeps the rule aligned with how the current embedded assignments are actually finished without requiring a bundle rewrite.

### Assignment 8 unlock rule

Assignment 8 unlocks only when:

- `assignment-1` through `assignment-7` are complete

### Final Exam unlock rule

The Final Exam unlocks only when:

- `quiz-1` through `quiz-7` are complete
- `assignment-1` through `assignment-8` are complete

This reflects the user's "all other modules are done" requirement while accounting for the fact that Module 8 has no separate quiz.

## Rendering Rules

Add shell helpers for:

- visible chapter cards
- assignment completion lookup
- assignment 8 special unlock
- final exam special unlock
- final exam chapter detection

Render effects:

- chapter overview hides `chapter-8`
- chapter overview renders `chapter-9` as a final-exam card with only `Open test`
- all former `Open quiz` labels become `Open test`

## Testing Strategy

Add focused shell assertions that lock:

- hidden Module 8 chapter-card behavior
- Assignment 8 special lock helper usage
- Final Exam direct-test behavior
- `Open test` labels replacing `Open quiz`
- assignment completion state added to persisted progress

## Risks

- the embedded assignments do not share a single formal completion event today
- completion detection is therefore text- and button-based inside same-origin iframes
- if a future assignment changes its final action label, the shell detector will need an update

## Acceptance Criteria

- Module 8 content no longer appears in the chapter/home surface
- Assignment 8 remains but stays locked until Assignments 1-7 are complete
- Final Exam stays locked until the rest of the course is done
- Final Exam opens directly to the quiz/test
- learner-facing `Open quiz` labels are replaced with `Open test`
- focused tests and `verify` pass
