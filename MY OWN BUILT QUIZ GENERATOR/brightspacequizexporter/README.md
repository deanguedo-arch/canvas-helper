# Brightspace Assessment Factory

Local-first assessment authoring and Brightspace CSV export tooling.

## Mission

Build a production-style assessment authoring system that lets a teacher create, review, validate, and export Brightspace-compatible quizzes from external source material.

## Current Status

Phase 0 scaffolding is complete:

- Vite + React + TypeScript app shell
- repo-level Codex controls via `AGENTS.md` and `.codex/`
- documented architecture, roadmap, and product notes
- placeholder module layout for schema, validation, export, ingest, storage, AI, and tests

## Development

```bash
npm install
npm run dev
```

Additional commands:

```bash
npm run build
npm run lint
npm test
```

## Working Agreement

This repository is intentionally structured for narrow implementation tasks:

- canonical schema is the source of truth
- validation happens before export
- Brightspace CSV is the primary deployment artifact
- unrelated refactors stay out of scope unless explicitly requested

Read `AGENTS.md`, `ARCHITECTURE.md`, and `ROADMAP.md` before starting feature work.
