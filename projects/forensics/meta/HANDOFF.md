# Handoff

- Project: forensics
- Task: complete Phase 6 QA/hardening with a detailed module pass list
- Status: in progress

## Files changed
- tasks/active.md
- projects/forensics/meta/HANDOFF.md
- docs/ops/ACTIVE_HANDOFF.md

## What changed
- Expanded Phase 6 QA checklist with explicit checks per node type (HTML, assignment, quiz, PDF, external).
- Added a module-based pass list derived from the course map to drive consistent manual QA coverage.

## What still needs validation
- Run the detailed module pass list in learner and archive modes and check off `tasks/active.md`.
- Verify hidden/admin content never appears in learner mode and remains visible in archive mode.
- Confirm fallback panel appears for weak/unmapped nodes.
- Run required commands: `npm run verify -- --project forensics`, `npm run typecheck`, `npm run build:studio`.

## Known risks
- Unrelated metadata changes exist in multiple `projects/*/meta/project.json` files.
- `MY OWN BUILT QUIZ GENERATOR/` is untracked and should not be committed by accident.
- `projects/processed/forensics/` is untracked generated state.
- `scripts/build-unit1-knowledge-check.ts` has type checking disabled.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/active.md`

## Do not do next / warnings
- Do not edit `projects/forensics/raw/**` or `projects/resources/forensics/**` directly.
- Do not start Phase 6 fixes until QA findings are captured first.
- Do not commit untracked quiz-generator or processed snapshot folders unless intentionally scoped.
