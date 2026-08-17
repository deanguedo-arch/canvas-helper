# Handoff

- Project: `repo-wide`
- Task: Complete PR #1 Direct Editing V1 remediation without adding the separate inline-text editor.
- Status: local implementation and release validation complete; exact published-head CI and independent review remain required before merge.

## Summary

- PR #1 remains a **draft** on `codex/studio-direct-editing-v1` targeting `codex/studio-roadmap-phases`.
- The three audited release blockers are closed: shared safe URL handling, recipe-derived English factory dependencies, and byte-exact factory Rename rollback.
- The eleven remaining recovery and integrity findings are addressed, including durable saved-draft reopen, no persistent pre-Apply asset API, exact onboarding rollback, `course:create` signaling rollback, and preview-launch cleanup.
- A frozen baseline verifier reports the established ten raw TypeScript diagnostics without calling raw typecheck green. A new isolated proof creates a real Studio-aware course through production `course:create` and proves inventory, thresholds, browser-local save, HTTP Normalize/Apply/reload/restart/Undo, and exact restoration.
- No inline `contenteditable` or parent-owned in-place editor was added. That is intentionally deferred to `codex/studio-inline-text-editing-v1` after the exact PR #1 integration commit and an independent GO.
- No learner course content was deliberately changed. The existing user-owned `projects/ready-mind/workspace/index.html` change and all unrelated untracked paths remain unstaged and untouched.

## Files changed

- Safety and mutation authority: `app/server/lib/course-editing.ts`, `app/server/lib/course-edit-render-validation.ts`, `app/server/routes/course-edits.ts`, `app/server/studio-server.ts`, `app/shared/course-editing.ts`, and `scripts/lib/course-editing/html.ts`.
- Factory and creation authority: `scripts/lib/english-unit/dependencies.ts`, `scripts/lib/english-unit/factory-build.ts`, `scripts/lib/english-unit/v3-donor-lessons.ts`, `scripts/lib/codex-course.ts`, `scripts/lib/course-onboarding.ts`, and `scripts/lib/new-course-readiness.ts`.
- New evidence gates: `scripts/verify-typecheck-baseline.ts`, `config/typecheck-baseline-v1.json`, `scripts/verify-fresh-course-studio-proof.ts`, `package.json`, `.github/workflows/new-course-readiness.yml`, and `.github/workflows/studio-direct-editing.yml`.
- Regression coverage: `scripts/tests/course-editing.test.ts`, `scripts/tests/course-onboarding.test.ts`, `scripts/tests/codex-course.test.ts`, `scripts/tests/new-course-readiness.test.ts`, `scripts/tests/package-script-contract.test.ts`, and `scripts/tests/studio-architecture.test.ts`.
- Independent-review packet: `docs/audits/2026-08-16-direct-editing-v1-remediation-audit.md`.

## What changed

- URL values now reject raw/encoded control characters, internal whitespace, malformed decoding, protocol-relative/root-absolute/backslash/traversal forms, and executable schemes. One sanitizer governs preview normalization, saved drafts, rich-text links, Apply, and final learner output.
- English factory readiness now derives output dependencies from recipes and donors rather than trusting generated manifest claims. Missing output-affecting dependencies fail closed and stored dependency paths are repository-relative.
- Rename captures both the post-metadata intermediate and final rebuilt fingerprints, then restores the exact pre-Rename write boundary on command, timeout, title, doctor, or rendered-validation failure.
- Saved drafts reopen by durable edit identity through read-only `POST /api/course-edits/reopen`; obsolete stored node IDs are discarded and Studio performs a current Resolve before preview or saving.
- The typecheck baseline gate verifies exactly the known ten normalized diagnostics and fails for additions, removals, changes, or a newly introduced diagnostic in a file changed after the baseline capture. Raw `typecheck` still exits `2` with those ten established diagnostics.
- The fresh-course proof runs in a temporary clean clone and deletes its generated test course afterward. It does not alter the real catalog or worktree.

## Verification run

At implementation head `311d4a4426b3e685481325347fb5fb2a85097d4b`:

- `npm run test:course-editing` — 50/50 passed.
- `npm run test:course-onboarding` — 5/5 passed.
- `npm run test:codex-course` — 5/5 passed.
- `npm run test:new-course-readiness` — 10/10 passed.
- `npm run test:course-editability` — 17/17 passed.
- `npm run test:exports` — 55/55 passed.
- `npm run build:studio` — passed.
- `npm run verify:typecheck-baseline` — passed; raw `npm run typecheck -- --pretty false` exited `2` with the exact established ten diagnostics.
- `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts --grep "direct edits persist"` — passed.
- `npm run test:studio-release` — passed: 162 focused contracts, 58/58 inspection E2E, smoke, and strict project contract.
- `npm run verify:fresh-course-studio-proof -- --report .runtime/fresh-course-studio-proof-local.json` — passed: complete inventory, 26/27 blocks, and 793/818 teacher-text code units, plus real reversible lifecycle.
- `npm run verify:course-editing-pilots` — passed for Direct, English factory, Social factory, and legacy snapshot; each restored its exact boundary.
- `npm run verify:course-onboarding -- --all` — 63/63 passed. Existing `ready-mind` checkpoint was safely skipped rather than overwritten.
- `git diff --check` — passed before documentation-only updates.

## Source of truth

- Audit instructions and explicit claims: `docs/audits/2026-08-16-direct-editing-v1-remediation-audit.md`.
- Core write, rollback, and Undo authority: `app/server/lib/course-editing.ts` and `app/server/lib/course-edit-transaction.ts`.
- Read-only draft reopen and request boundary: `app/server/routes/course-edits.ts` and `app/server/studio-server.ts`.
- Factory dependency authority: `scripts/lib/english-unit/dependencies.ts`.
- Fresh course and typecheck evidence: `scripts/verify-fresh-course-studio-proof.ts` and `scripts/verify-typecheck-baseline.ts`.
- Published CI authority: `.github/workflows/studio-direct-editing.yml`, `.github/workflows/new-course-readiness.yml`, and PR #1 artifacts for the final published SHA.

## Fragile areas / watchouts

- The Studio filesystem lock coordinates Studio processes, not arbitrary concurrent Codex, Git, manual-editor, or standalone-builder writers. Those writers must not run during Apply.
- A portable filesystem compare-and-swap cannot close the tiny reread-to-rename interval against an uncooperative external writer. The transaction and drift checks fail closed where they can observe it; this remains an operational contract.
- The frozen baseline intentionally compares changed files since baseline capture. One pre-existing diagnostic is in a file that earlier PR work had already changed, so it cannot honestly enforce the plan's stricter literal “any file changed anywhere in PR” wording without treating an inherited baseline diagnostic as newly introduced.
- Local render checks are bounded. Brightspace/deployed-host behavior, cross-browser SCORM, delayed interaction, full WCAG, and teacher rollout remain separate acceptance.
- Coverage and catalog lifecycle evidence do not mean every visible legacy element is editable; runtime/behavior-rich/ambiguous elements remain Annotation-only or need dedicated controls.

## Next prompt should assume

- Do not add the inline-text UI, `contenteditable`, or Full Preview editing to PR #1.
- After PR #1 is integrated at an independently approved exact SHA, create `codex/studio-inline-text-editing-v1` from that exact commit—not by assuming `main`—and implement the separate inline-editing plan.
- Keep Apply as the first course-file and course-asset write. Save draft remains browser-local state only.

## What still needs validation

- Publish the scoped commits, then inspect matching push and PR-context executions of `Studio Direct Editing release gate`, `New course Studio readiness`, and the all-catalog editability census. Download/inspect their same-SHA evidence artifacts.
- Obtain an independent review verdict before making PR #1 ready for review or merging it.

## Known risks

- The local worktree is intentionally dirty because of user-owned course and untracked data. The isolated fresh-course proof is clean-clone evidence; GitHub exact-head workflows are the release authority.
- `npm run report:course-editability -- --all --allow-incomplete` remains an exhaustive CI evidence job, not a local claim of global legacy element coverage.

## Exact next command

`gh pr checks 1 --watch`

## Exact next file to open

`docs/audits/2026-08-16-direct-editing-v1-remediation-audit.md`

## Do not do next / warnings

- Do not merge, post review replies, or resolve review threads without explicit repository-owner authorization.
- Do not stage `projects/ready-mind/workspace/index.html`, `.runtime/**`, duplicate resource paths, transaction folders, or alternate handoff files.
- Do not describe raw typecheck as green or claim final GitHub evidence before the final published SHA has completed.
