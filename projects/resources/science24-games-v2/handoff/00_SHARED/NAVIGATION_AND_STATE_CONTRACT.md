# Navigation and State Contract

- Every stage has a visible Previous control except the first screen.
- Previous and Next preserve all state: learner inputs, opened evidence, attempted answers, feedback, hints, and transfer work.
- Changing an answer after a successful check invalidates progression until it is checked again, or enters an explicit revision mode.
- Restart is separate from Previous and always asks for confirmation.
- A new scenario never silently inherits incompatible model inputs.

## Minimum state per mission
`scenarioId`, `scenarioVersion`, `stage`, `prediction`, `modelInputs`, `openedEvidence`, `selectedEvidence`, `claim`, `explanation`, `hintsUsed`, `attempts`, `feedback`, `submittedValid`, `transferResponse`, `selfReview`.

## Focus behavior
- major route change → move focus to the screen heading;
- evidence/model reveal → move focus to the newly revealed item;
- feedback → move focus to the feedback heading;
- hint → move focus to the hint;
- do not make the whole app an `aria-live` region.
