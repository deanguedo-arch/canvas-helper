# Handoff

- Project: forensics
- Task: complete Phase 6 QA/hardening with a detailed module pass list
- Status: in progress

## Files changed
- tasks/active.md
- docs/ops/ACTIVE_HANDOFF.md
- projects/forensics/meta/HANDOFF.md

## What changed
- Expanded Phase 6 QA checklist with explicit checks per node type (HTML, assignment, quiz, PDF, external).
- Added a module-based pass list derived from the course map to drive consistent manual QA coverage.

## What still needs validation
- Run the detailed module pass list in learner and archive modes and check off `tasks/active.md`.
- Verify hidden/admin content never appears in learner mode and remains visible in archive mode.
- Confirm fallback panel appears for weak/unmapped nodes.
- Run required commands: `npm run verify -- --project forensics`, `npm run typecheck`, `npm run build:studio`.

## Known risks
- Unrelated metadata churn is present in multiple `projects/*/meta/project.json` files (path normalization + updated timestamps) from project migration commands.
- Untracked directory `MY OWN BUILT QUIZ GENERATOR/` exists after gitlink cleanup and should not be accidentally committed.
- Untracked `projects/processed/forensics/` snapshot exists and may represent generated/import state not intended for commit.
- `scripts/build-unit1-knowledge-check.ts` type coverage is currently bypassed with `// @ts-nocheck`.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/active.md`

## Do not do next / warnings
- Do not edit `projects/forensics/raw/**` or `projects/resources/forensics/**` directly.
- Do not start new feature work before finishing Phase 6 QA/hardening checks.
- Do not commit `MY OWN BUILT QUIZ GENERATOR/` or `projects/processed/forensics/` unless explicitly intended.
