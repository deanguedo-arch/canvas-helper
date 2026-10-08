# Engineering phases and release gates

## P0 — Storage proof, not a pretty dashboard
Read persistence/upgrade contracts; implement config validation, bound SCORM adapter, codec, schema validator, synthetic mock API and save coordinator in a small probe. Prove failed-read/no-reset, explicit string false, invalid/future schema, wire bounds and revision races. Produce a test SCORM probe ZIP and tenant checklist. Tenant access may be pending; label it NOT RUN, not passed. No real student work.

**Exit:** local failure tests pass; an actual probe artifact and repeatable run commands exist; tenant unknowns recorded. Full production safety is not declared.

## P1 — Visual and editor slice
Build the light shell, Plan, Settings and actual editor with synthetic fixtures. Use supplied tokens/SVGs, not raster sheets. Include responsive context collapse and focused writing mode. Compare rendered screenshots at required sizes with canonical light references. Keep backend/storage modules independent.

**Exit:** user can review the actual implemented visual direction; keyboard editor slice and paste tests run. Do not create all pages before checking the core writing experience.

## P2 — Projects and graph integrity
Implement workspace/project creation, rename, metadata, plan, source/evidence records, duplicate/remap, archive/restore and notes. Drive each through typed commands and one coordinator. No source-course edits. Implement empty states and counters derived from real data.

**Exit:** multiple projects survive mock + real available resume; IDs/references validate; no shared keys across learners. Test copies and removals.

## P3 — Durable writing and portable backups
Complete rich editor, paste normalization, evidence insertion, exports, full/project backup/validation/import and local recovery paths. Implement verified export-and-remove. Enforce wire/raw/field budgets with honest UI.

**Exit:** round-trip and malicious/corrupt/oversized tests pass, newest unsynced text is exportable, and a working import-preview flow exists.

## P4 — Teaching and revision
Integrate reviewed candidate content/template data; generic Analysis Explorer; revision passes and learner-entered feedback. Do not implement live teacher integrations or auto-scoring merely because a concept image has them.

**Exit:** guide review status visible to owner; project content remains unchanged by template updates; writing examples are clearly fictional/approved.

## P5 — Error paths, accessibility and responsive hardening
Complete recovery UI, lock handling, lifecycle and denied-storage flows; test assistive technology, keyboard, small screens, mobile input and print. Network audit and metadata-only diagnostic tests.

**Exit:** all local P0 cases pass, P1 issues have explicit disposition. Produce actual screenshot suite and test receipts.

## P6 — Brightspace sandbox qualification
Run every TENANT test with synthetic learner(s), actual built package and near-cap cases. Test same-object replacement separately from new-object migration and course copy. Owner fills result record and approves save label and cache policy.

**Exit:** recorded tenant results, deployment scope, pinned setting, retention/access considerations and safe upgrade/rollback plan. Missing tenant access blocks this gate, not local development.

## P7 — Bounded pilot and release
Package only production assets, root manifest, built code/content and notices. No fixtures/references/preview/logs/student data. Hash final ZIP. Release one pilot cohort with backups and feedback collection under owner control. Freeze release for active cohort; build next version in staging.

**Exit:** owner sign-off, student help, reproducible build, complete receipts, known limits and rollback/migration procedure. Do not replace a live object autonomously.

## Suggested agent ownership
One lead owns schemas/persistence/release. After P0 contracts freeze, separate agents may own shell/editor styling, project views and guide content. Agents do not rename data fields independently. Integration owner runs all tests and reconciles branches before claiming completion. Prefer bounded deliverable pairs over a single sprawling rewrite.
