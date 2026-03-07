# Handoff

- Project: genpsy-studio
- Task: Integrate Assessment Factory into Canvas Helper Studio with global assessment library + deterministic import/edit/export flow.
- Status: ready for validation

## Files changed
- app/server/routes/assessments.ts
- app/server/studio-server.ts
- app/studio/src/App.tsx
- app/studio/src/components/AssessmentLibraryMode.tsx
- app/studio/src/lib/assessment-types.ts
- app/studio/src/lib/assessments.ts
- app/studio/src/styles.css
- scripts/assessment-import.ts
- scripts/assessment-export.ts
- scripts/lib/assessments/schema.ts
- scripts/lib/assessments/model.ts
- scripts/lib/assessments/validation.ts
- scripts/lib/assessments/export-brightspace.ts
- scripts/lib/assessments/question-extraction.ts
- scripts/lib/assessments/ingest/pdf.ts
- scripts/lib/assessments/ingest/docx.ts
- scripts/lib/assessments/library.ts
- scripts/lib/assessments/index.ts
- scripts/lib/paths.ts
- scripts/tests/assessments-engine.test.ts
- README.md
- ARCHITECTURE.md
- package.json
- package-lock.json

## What changed
- Added a new global assessment library at `projects/assessments/<assessment-slug>/`.
- Ported deterministic assessment engine layers into `scripts/lib/assessments/` (schema, validation, PDF/DOCX ingest, merge, export).
- Added API endpoints for assessment CRUD/import/export at `/api/assessments...`.
- Added CLI parity (`assessment:import`, `assessment:export`) and deterministic tests (`test:assessments`).
- Added Studio top-level mode switch and full `Assessment Library` editor mode (API-backed, no localStorage system of record).
- Imported fixture `Copy of Personal Psychology 20 Unit 1.pdf` into `copy-of-personal-psychology-20-unit-1-acceptance` with 29 extracted student-facing questions.

## What still needs validation
- Open Studio and validate `Assessment Library` mode end-to-end (import, edit, save, export diagnostics).
- Validate expected export block behavior for unanswered multiple-choice/true-false questions.
- Decide whether to add deterministic key-matching from `PerPsy20AB01Key.pdf` to auto-populate `correctAnswers`.

## Known risks
- Brightspace CSV export currently blocks if required correctness fields are missing (expected behavior, but not one-click for raw student booklet PDFs).
- Upload endpoint currently writes to temp disk and depends on local file size constraints; no explicit max-size guard added yet.
- Existing repo tree contains unrelated in-progress changes outside this assessment integration.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/assessments/copy-of-personal-psychology-20-unit-1-acceptance/assessment.project.json`

## Do not do next / warnings
- Do not treat `PerPsy20AB01Key.pdf` as the student assessment body.
- Do not bypass validation to force CSV export with unresolved answer keys.
- Do not move assessment ingest/export logic into Studio frontend code.
