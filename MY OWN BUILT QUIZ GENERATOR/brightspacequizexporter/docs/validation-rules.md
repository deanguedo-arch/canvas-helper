# Validation Rules

Validation must run before export and return:

- errors
- warnings
- blocking issues
- suggested fixes

Planned baseline checks:

- assessment title exists
- question ids are unique
- prompts are not empty
- question-type-specific answer structure is valid
- points are numeric and non-negative

## Phase 2 Coverage

Implemented validation covers:

- assessment title presence
- unique question ids
- prompt presence
- non-negative finite point values
- section references that point to known sections
- duplicate choice ids as blocking issues
- duplicate choice text as warnings
- multiple choice with exactly one correct answer
- multi-select with one or more correct answers
- true/false with a normalized true/false pair
- short answer with accepted answers when not marked missing
- matching with balanced prompt/match structure
- ordering with at least two ordered elements and a complete order when answers exist
- autograded questions marked `missing` as blocking for export readiness
- `inferred` answers as warnings
- optional export gating for non-approved review states
