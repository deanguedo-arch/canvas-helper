# A2 Interaction and State Rules

- Every stage has a visible Previous control except the first screen.
- Previous and Next preserve all state: learner inputs, opened evidence, attempted answers, feedback, hints, and transfer work.
- Changing an answer after a successful check invalidates progression until it is checked again, or enters an explicit revision mode.
- Restart is separate from Previous and always asks for confirmation.
- A new scenario never silently inherits incompatible model inputs.

## Game-specific primary interaction
Factory order puzzle: change whole-particle coefficients, inspect the element ledger, ship only balanced batches, then solve a plain-text equation.

## Submission lifecycle
1. Learner makes the required prediction/model/plan.
2. Learner submits or runs the model.
3. Validator returns result + targeted explanation + next action.
4. Learner may revise without losing the previous attempt.
5. Any edit invalidates the prior checked state until checked again.
6. Independent transfer remains locked until the designed practice progression is complete.
