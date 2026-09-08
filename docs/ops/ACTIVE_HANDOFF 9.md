# Handoff

- Project: `biology30-unit-a`
- Task: Implement Biology 30 Unit A Production V2 through Gate 0, then stop for curriculum-map and correction-strategy approval.
- Status: blocked awaiting explicit Gate 0 user approval; no learner lesson rendering, promotion, commit, export, or Brightspace upload has occurred.

## Files changed

- V2 contract types, blueprint, validation, and transactional intake: `scripts/lib/biology30-unit-a/v2/types.ts`, `blueprint.ts`, and `intake.ts`.
- CLI and focused tests: `scripts/intake-biology30-unit-a-v2.ts`, `scripts/tests/biology30-unit-a-v2.test.ts`, and `package.json`.
- Canonical Gate 0 production records: `projects/resources/biology30-unit-a-pilot/v2/`.
- Blocked Studio proposal: `projects/biology30-unit-a/`.
- Workflow and architecture documentation: `README.md`, `ARCHITECTURE.md`, and `docs/workflows/science-pilot.md`.
- Handoff records: `docs/ops/ACTIVE_HANDOFF.md` and `docs/ops/ARCHIVED_HANDOFFS.md`.

## What changed

- Added `intake:biology30-unit-a-v2`, which accepts only the fixed family/project IDs, refuses existing targets, verifies immutable source hashes, stages both roots, validates every Gate 0 contract, and rolls back both promoted roots if either final rename fails.
- Verified the class and system archives at their required SHA-256 values and verified that the supplied notes PDF and the class-archive notes entry are byte-identical at `538f58fffe4aa0459dfcf49c5675948d8c7231a95a6fb2b61d7cde56e06a6035`.
- Parsed 58 class Unit A items, three visible quizzes containing 75 questions, 126 system Unit A items, and 114 UTF-16 system HTML files.
- Created an exact 25-outcome teach/practice/evidence map, 17-lesson sequence totalling 1,505 required and 295 optional minutes, seven-artifact blueprint, 100-item practice blueprint, 17-interaction blueprint, 59 explicit source references, and 139 page dispositions.
- Added correction regressions for myelin/regeneration, MS causation, hemispheric neuromyths, visual perception, hearing safety, negative feedback, hormone-signalling stages, synthetic-data labelling, insulin/glucose regulation, current terminology, diagnosis boundaries, and inherited slide defects.
- Created a minimal local-only Studio review shell. Live Studio inspection confirmed the new course is discoverable, Edit is disabled, Annotation is available, and no learner lessons are present.
- Recorded matching before/after hashes for all five historical comparison directories. None was changed.

## Why this changed

- The prior synthesis is not a production-quality first-teach course. Production V2 requires an approved, exact curriculum/source/correction contract before any visual or lesson authoring begins.

## Source of truth

- Production contract: `projects/resources/biology30-unit-a-pilot/v2/production-contract.json` at SHA-256 `cb773ee76a4c1a20f384a0edcbd764ee64a3af296ed87e0526d95e1ed940f3cc`.
- Human-readable curriculum review: `projects/resources/biology30-unit-a-pilot/v2/curriculum-map.md`.
- Source catalogue and rights: `projects/resources/biology30-unit-a-pilot/v2/source-catalog.json` and `source-and-rights-register.json`.
- PDF disposition and corrections: `projects/resources/biology30-unit-a-pilot/v2/notes-page-disposition.md` and `factual-correction-ledger.md`.
- Gate state: `projects/resources/biology30-unit-a-pilot/v2/gate-0-review.json` and `projects/biology30-unit-a/meta/production-candidate.json`.
- Implementation ownership: `scripts/lib/biology30-unit-a/v2/`.

## Fragile areas / watchouts

- The contract approval is tied to exact hash `cb773ee76a4c1a20f384a0edcbd764ee64a3af296ed87e0526d95e1ed940f3cc`; changing the contract invalidates approval.
- Alberta had no discoverable Biology-specific 2026-27 bulletin at Gate 0. The current subject bulletin is 2025-26, and a fresh Alberta-site search is mandatory before Gate 1 authoring.
- Planned health/government supplements are registered, but page-specific retrieval, rights, and claim review must be completed before their content enters learner lessons.
- `biology30-unit-a-class-2026-faithful` currently lacks `meta/project.json` and therefore remains a pre-existing `invalid-manifest` catalog entry. Gate 0 preserved its tree exactly; do not repair or rebuild it inside the V2 boundary.
- The repository is broadly dirty with unrelated user-owned work. Keep all edits path-scoped.

## Next prompt should assume

- Gate 0 implementation is complete and verified.
- The user must review and explicitly approve the exact curriculum map, correction ledger, page disposition, and supplementation strategy before Gate 1.
- Approval authorizes only Overview, Lessons 4 and 15, the visual/persistence foundation, and support-hub skeletons.
- Do not add `@axe-core/playwright`, shared-shell authored mode, local fonts, or lesson content until Gate 1 is authorized.

## What still needs validation

- Human Biology 30 review of all 25 official outcome texts and their teach/practice/evidence routes.
- Human approval of the 17-lesson sequence, 1,505-minute boundary, 139 page dispositions, and correction/content-gap strategy.
- Gate 1 visual and learning-loop approval after the two-lesson vertical slice is built.
- All later academic, accessibility, persistence, promotion, SCORM, and Brightspace gates remain unstarted.

## Known risks

- Gate 0 defines complete coverage and source strategy, not the correctness of lessons that do not yet exist.
- Some current health and technology claims will require page-specific authoritative sourcing during authoring.
- The invalid historical class-faithful manifest must eventually be reconciled during the separately authorized promotion/freeze transaction without changing its preserved workspace tree.

## Exact next command

`sed -n '1,320p' projects/resources/biology30-unit-a-pilot/v2/curriculum-map.md`

## Exact next file to open

`projects/resources/biology30-unit-a-pilot/v2/curriculum-map.md`

## Do not do next / warnings

- Do not rerun `intake:biology30-unit-a-v2`; duplicate targets are intentionally refused.
- Do not start Gate 1 until the user explicitly approves Gate 0.
- Do not invoke the five-version builder as a V2 build path.
- Do not change or promote the five historical prototypes.
- Do not enable Direct editing, commit, export SCORM, or upload to Brightspace.
- Do not delete, move, or rewrite unrelated dirty-worktree files.
