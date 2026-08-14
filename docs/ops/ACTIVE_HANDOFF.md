# Handoff

- Project: `repo-wide`
- Task: Implement safe real-time Studio preview, honest element-level editability measurement, new-course defaults, and a complete independent-audit packet.
- Status: ready for independent validation

## Publication and review state

- Branch: `codex/studio-direct-editing-v1`
- Pull request: `https://github.com/deanguedo-arch/canvas-helper/pull/1`
- Accepted Direct Editing baseline: `e71241433e173c7617dbf5ea5e5ddcc5bf712c11`
- First plan-audit head/verdict: `a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a` — **REQUEST CHANGES**
- Published implementation commit: `ef72243e1c7039bc8c7778a33dadf44c61947d60`
- The audit handoff also raises the GitHub job timeout from 90 to 180 minutes because the exhaustive rendered census can consume roughly 75 minutes before later pilot/catalog steps; test scope is unchanged.
- Implementation audit packet: `docs/audits/2026-08-14-chatgpt-pro-real-time-editability-implementation-audit.md`
- PR #1 remains open, mergeable, ready for review, and unmerged. Merge remains a repository-owner action.
- Implementation-only PR run `31840471429` and push run `31840465755` began for `ef72243e` and were superseded by the audit/CI-only descendant. Use the PR checks and uploaded artifact from the final branch head as the authority.

## Summary

- Implemented adapter-owned learner-surface inventories, a mutation-prohibited project reader, rendered semantic collection, production Resolve parity, non-overlapping block/text/capability metrics, stable reason codes, canonical report digests, and repository residue proof.
- Implemented immediate server-normalized inert overlays in embedded Studio and Full Preview. The learner subtree and course files remain unchanged while typing and through Save.
- Added preview sessions, monotonic revisions, source/target/digest binding, closed-generation behavior, acknowledgement latency, complete reset handling, and screenshot/Review Set protection while an unapplied overlay is visible.
- Added fully decoded, bounded, memory-only image preview. Apply is the first asset write and materializes the exact bytes inside the existing lock/checkpoint/journal/rebuild/render/Undo transaction.
- Saved drafts retain page identity, can reopen on the correct page in Studio or Full Preview, re-resolve current authority, and restore the canonical preview.
- Strengthened `course:create` with an editable image/caption and an explicit Annotation-only runtime practice control; the fresh-course contract now enforces ≥90% block/text coverage plus per-category and capability floors.
- Added explicit learner-surface declarations across the source-backed catalog. All 63 enabled projects remain onboarded; element inventory is honestly separate.
- Updated README, architecture, contributing, workflow, release, product plan, and Phase 0.5 contract documentation.
- Published the implementation before creating the separate ChatGPT Pro audit update, as requested.
- No learner course content was intentionally changed. Every verification edit was restored; user-owned concurrent builder outputs and duplicate/resource files were preserved and left unstaged.

## Files changed

- Measurement: `app/shared/course-editability.ts`, `scripts/lib/course-editability/**`, `scripts/report-course-editability.ts`, and focused tests.
- Preview authority: `app/shared/course-editing.ts`, `app/shared/preview-bridge.ts`, `app/server/lib/course-edit-preview.ts`, `app/server/lib/course-edit-preview-assets.ts`, `app/server/lib/course-editing.ts`, and routes/server wiring.
- Teacher UI: `app/studio/src/hooks/useCourseEditing.ts`, `usePreviewScrollSync.ts`, `components/CourseEditPanel.tsx`, `App.tsx`, `InspectorPanel.tsx`, styles, and release notes.
- New-course/catalog: `scripts/lib/codex-course.ts`, onboarding/manifest policy/types, verification runners, and explicit `projects/*/meta/project.json` declarations.
- Verification/CI: `.github/workflows/studio-direct-editing.yml`, `e2e/specs/inspection.spec.ts`, and course-editability/editing/security tests.
- Documentation: `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `docs/ops/FAST_PATHS.md`, the two real-time plans, the Codex course workflow, the Studio release note, and the implementation audit packet.

## Verification run

- `npm run test:course-editability` — 16/16 passed.
- `npm run test:studio-inspection` — 154/154 passed.
- `npm run verify:course-editing-pilots` — 4/4 real adapters passed Apply/rebuild/render/reload/restart/Undo and byte restoration.
- `npm run verify:course-onboarding -- --all` — 63/63 enabled projects passed; temporary rejected/safe edits restored.
- `npm run course:onboard -- --all` — retain-only for enabled projects; local-only package archives stayed non-authorable.
- `npm run validate:manifests` — all 65 manifests passed.
- `npm run build:studio` — passed, 85 modules.
- `npm run test:studio-release` — passed 154 focused contracts, build, 58/58 inspection E2E, platform smoke, and strict project contract.
- Focused What’s New rerun — 2/2 passed after binding the test to the canonical release manifest.
- Exact `ef72243e` inventory-only census — 57/65 complete, residue proof passed; five snapshot gaps, two unsupported drivers, one missing route inventory.
- Stable representative rendered census — `e2e-fixture` 13/21 blocks, 315/445 teacher-text code units, residue proof passed.
- First all-catalog rendered diagnostic reached 65/65 but correctly exited nonzero and nulled aggregate coverage because an independent builder changed many course boundaries during the run. It is not release evidence.
- `git diff --check` — passed.
- `npm run typecheck -- --pretty false` — exited 2 with the established ten unrelated diagnostics in legacy builders/factory files; none is in the implementation files.

## Source of truth

- Normative contracts: `docs/plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`.
- Product phases and external gates: `docs/plans/2026-08-13-studio-real-time-editability-and-rollout.md`.
- Independent review instructions/evidence: `docs/audits/2026-08-14-chatgpt-pro-real-time-editability-implementation-audit.md`.
- Measurement implementation: `app/shared/course-editability.ts` and `scripts/lib/course-editability/`.
- Preview/Apply authority: `app/server/lib/course-edit-preview.ts`, `course-edit-preview-assets.ts`, `course-editing.ts`, and `app/shared/preview-bridge.ts`.
- Teacher workflow: `app/studio/src/hooks/useCourseEditing.ts`, `CourseEditPanel.tsx`, `App.tsx`, and `app/server/preview-bridge-runtime.ts`.
- Published implementation: commit `ef72243e1c7039bc8c7778a33dadf44c61947d60`.

## Fragile areas / what might drift

- The 57/65 learner inventory result is exact for `ef72243e`; custom runtime route/tab/module declarations can change it and must be remeasured.
- `aboriginal-studies-30`, four nonstandard English snapshots, `genpsy-studio`, the disabled CALM project, and the secondary test fixture remain explicitly incomplete for census purposes.
- Blocked storage attempts invalidate an individual surface; they are not persistent browser residue because fresh non-persistent contexts close before repository proof.
- The all-catalog rendered census is intentionally long. Any builder, Git mutation, Studio Apply, or manual writer during it must invalidate its residue proof.
- The filesystem lock remains cooperative for participating writers; arbitrary external writers must not race Direct Apply.
- Memory-only pending images intentionally require re-upload after expiry/server restart.
- Local render settlement and edited-target accessibility checks remain bounded; they are not delayed-interaction or full-WCAG proof.
- User-owned duplicate resource paths, local package archives, two factory transaction directories, external handoff files, and `test-results 2/` remain unstaged and must not be cleaned broadly.

## Next prompt should assume

- Live preview, saved-draft reopen, transactional pending images, the census command, new-course threshold, and explicit catalog inventories exist at `ef72243e`.
- All 63 source-backed projects are onboarded for their declared safe adapter, but only 57/65 manifest inventories are currently complete for element-coverage measurement.
- No publishable global element percentage exists while required inventories/surfaces are incomplete.
- The first all-catalog local rendered run is deliberately non-authoritative because concurrent external writers tripped residue proof.
- The next decision is an independent implementation audit and exact-head CI review, not more speculative architecture work.
- Teacher rollout and Brightspace/deployed-host/cross-browser/full-WCAG acceptance remain separate.

## What still needs validation

- Record the final exact-head and PR workflow conclusions/artifacts for the final audit-document head.
- Obtain the requested independent ChatGPT Pro verdict against every original P1/P2 finding.
- Complete the eight inventory gaps only through proven source ownership and explicit route/state contracts.
- Run the five-teacher/twenty-session quantitative rollout.
- Complete Brightspace upload/launch/resume/score, deployed-host, cross-browser SCORM, and full accessibility acceptance.

## Known risks / follow-up

- A reviewer may find a census reconciliation, canonicalization, overlay, pending-asset, or reset mismatch not covered by existing tests; treat any P0/P1 as release-blocking.
- Large exact-head census runtime is real because every candidate crosses production Resolve. Optimize only without changing the denominator or failure semantics.
- Do not turn incomplete legacy states into “complete” through a bounded HTML scan, flag, generated-output patch, or unsafe historical builder.
- Do not cite local 34/65 diagnostic completion as a percentage; use the clean exact-head artifact and retain null aggregate status while the catalog is incomplete.
- PR #1 must not be merged without repository-owner authorization.

## Exact next command

`gh pr checks 1 --watch`

## Exact next file to open

`docs/audits/2026-08-14-chatgpt-pro-real-time-editability-implementation-audit.md`

## Do not do next / warnings

- Do not run builders, Studio Apply, Git mutations, or manual course edits during a residue-proof census.
- Do not use coverage to enable Edit or authorize a target.
- Do not mutate the learner subtree for preview or save an ephemeral image URL.
- Do not force Undo or recovery over unknown/newer bytes.
- Do not stage or delete unrelated user-owned duplicate/archive/transaction/handoff/test paths.
- Do not claim teacher, Brightspace, deployed-host, cross-browser SCORM, delayed-runtime, or full-WCAG acceptance from local gates.
