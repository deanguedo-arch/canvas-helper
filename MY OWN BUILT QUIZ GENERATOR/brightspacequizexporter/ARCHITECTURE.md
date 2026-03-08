# Architecture

## Core Rules

1. The internal canonical schema is the source of truth.
2. Exporters never become the source of truth.
3. Input parsing, AI generation, editing, validation, and export remain separate layers.
4. Deterministic export behavior is required for the same input.

## Layer Boundaries

- `src/core/`: schema, model helpers, validation, transforms
- `src/export/`: export adapters and diagnostics
- `src/ingest/`: input parsing by source type
- `src/storage/`: local project persistence
- `src/ai/`: prompt templates and generation pipelines
- `src/app/`: React UI and app state
- `src/test/`: unit and integration coverage

## Phase 0 Status

This repository currently provides scaffolded folders and placeholder modules only. The first implementation phases are:

1. Canonical schema
2. Validation engine
3. Brightspace CSV exporter
4. Minimal editing UI

## Design Constraints

- Prefer pure functions in transformation logic.
- Keep module responsibilities tight.
- Update fixtures and tests with any behavior change.
- Reject silent fallback behavior that hides invalid data.
