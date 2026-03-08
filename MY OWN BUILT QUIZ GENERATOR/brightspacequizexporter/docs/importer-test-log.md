# Importer Test Log

Use this file to record real Brightspace import attempts and fixture outcomes.

Fields to capture:

- date
- fixture used
- export version
- import result
- notes on warnings or failures

## 2026-03-07

- date: 2026-03-07
- fixture used: `AP35 Assignment Book 1_.docx`
- export version: source-aware DOCX ingest pilot
- import result: 35 questions detected
- type distribution: 13 `multiple_choice`, 10 `written_response`, 10 `short_answer`, 2 `matching`
- notes on warnings or failures:
  - file-level warnings: `ambiguous_question_candidates`, `answer_key_required_for_detected_auto_graded_items`
  - candidate-level warnings: 1 ambiguous fallback classification remained after structural parsing
  - evaluation harness: `DOCX_FIXTURE_PATH="/absolute/path/to/file.docx" npm test -- src/test/unit/ingest/evaluateDocxFixture.test.ts`
