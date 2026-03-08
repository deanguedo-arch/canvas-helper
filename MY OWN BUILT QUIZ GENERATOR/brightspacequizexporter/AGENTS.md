# AGENTS.md

## Purpose
This repository builds a local-first assessment authoring tool that exports Brightspace-compatible CSV.

## Primary rule
Be surgical.
Do not make broad unrelated changes.

## Architecture priorities
1. Canonical schema is the source of truth.
2. Validation must happen before export.
3. Exporters adapt from canonical schema only.
4. Parsing, AI generation, editing, validation, storage, and export must stay separated.

## Behavioral rules for agents
- Read only files relevant to the current task.
- Do not rename folders or move files unless the task explicitly requires it.
- Do not refactor unrelated modules while implementing a feature.
- Prefer the smallest safe change.
- If changing schema, also update validators, fixtures, and tests.
- If changing exporter behavior, update exporter tests and expected output fixtures.
- If adding a dependency, justify it in the task output.
- Avoid creating catch-all utility files.
- Keep functions focused and composable.
- Add concise comments only where logic is not obvious.
- Never silently weaken validation to make tests pass.

## Repository boundaries
### Core
`src/core/` contains canonical schema, model logic, validation, and transforms.

### Export
`src/export/brightspaceCsv/` contains Brightspace CSV mapping and export logic only.

### Ingest
`src/ingest/` contains source import logic by input type.

### AI
`src/ai/` contains prompt templates and AI orchestration only.

### Storage
`src/storage/` contains load/save logic.

### UI
`src/app/` contains React UI and app state only.

## Task discipline
For each task:
1. Identify the smallest affected module set.
2. Implement changes only in that scope.
3. Add or update tests.
4. Report exactly what changed.
5. Report any follow-up work separately.

## Do not
- do repo-wide cleanup unless explicitly asked
- merge unrelated concerns into a single file
- hide broken logic behind fallback behavior
- guess exporter mappings without documenting them
- silently infer correct answers for autograded items

## Definition of good work
Good work is:
- narrow
- understandable
- test-covered
- reversible
- consistent with the documented architecture
