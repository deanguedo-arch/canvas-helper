# Schema Notes

The canonical assessment schema is the source of truth for all ingestion, editing, validation, and export behavior.

Initial schema implementation will cover:

- assessment metadata
- question records
- choice records
- section records
- answer and review status fields

## Phase 1 Structure

- `QuestionSchema` is a discriminated union on `type`
- `correctAnswers` stays on the question record but uses a type-specific shape
- matching questions use `choice.matchRole` to distinguish prompt-side and match-side options explicitly
- assessment projects own `sections`, `questions`, `sourceDocuments`, and `exportHistory`
