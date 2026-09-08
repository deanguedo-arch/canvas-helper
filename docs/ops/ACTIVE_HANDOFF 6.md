# Handoff

- Project: `repo-wide`
- Task: Close all 23 Studio Direct Editing audit findings and prove the hardened boundary on real Direct, English, and Social courses.
- Status: complete

## Files changed

### Direct Editing contracts, server, and preview boundary

- `app/shared/course-editing.ts`
- `app/shared/inspection.ts`
- `app/shared/preview-bridge.ts`
- `app/server/lib/course-editing.ts`
- `app/server/lib/course-edit-transaction.ts`
- `app/server/lib/course-edit-render-validation.ts`
- `app/server/lib/course-edit-image.ts`
- `app/server/lib/preview-inspection.ts`
- `app/server/lib/preview-paths.ts`
- `app/server/preview-bridge-runtime.ts`
- `app/server/preview-server.ts`
- `app/server/routes/course-edits.ts`
- `app/server/routes/preview.ts`

### Studio teacher workflow

- `app/studio/src/App.tsx`
- `app/studio/src/components/CourseEditPanel.tsx`
- `app/studio/src/components/InspectorPanel.tsx`
- `app/studio/src/hooks/useCourseEditing.ts`
- `app/studio/src/lib/course-edit-storage.ts`
- `app/studio/src/lib/studio-release-notes.ts`
- `app/studio/src/styles.css`

### Authoring, builders, and export evidence

- `scripts/lib/course-authoring/context.ts`
- `scripts/lib/course-editing/html.ts`
- `scripts/lib/course-editing/overrides.ts`
- `scripts/lib/course-editing/export-freshness.ts`
- `scripts/lib/project-manifest-policy.ts`
- `scripts/lib/types.ts`
- `scripts/lib/next-step-course-shell.ts`
- `scripts/lib/english-unit/factory-build.ts`
- `scripts/lib/exports/apps-script.ts`
- `scripts/lib/exports/brightspace.ts`
- `scripts/lib/exports/google-hosted.ts`
- `scripts/lib/exports/scorm-package.ts`
- `scripts/lib/exports/single-html.ts`
- `scripts/build-english-unit.ts`
- `scripts/build-social10-related-issues.ts`
- `scripts/build-social20-related-issues.ts`
- `scripts/build-social30-related-issues.ts`
- `scripts/verify-course-editing-pilots.ts`
- `package.json`

### Explicit pilot onboarding and title ownership

- `projects/e2e-fixture/meta/project.json`
- `projects/ela20-1-short-stories-pilot/meta/project.json`
- `projects/social30-1-related-issue-1-option-2/meta/project.json`
- `projects/mental-health-wellness/meta/project.json`
- `projects/mental-health-wellness/meta/build_forensics_style_course.py`
- `projects/mental-health-wellness/workspace/index.html`
- `projects/mental-health-wellness/workspace/main.js`
- `projects/mental-health-wellness/workspace/course-data.js`

### Tests and documentation

- `scripts/tests/course-authoring-context.test.ts`
- `scripts/tests/course-editing.test.ts`
- `scripts/tests/mental-health-wellness-shell.test.ts`
- `scripts/tests/studio-project-continuity.test.ts`
- `README.md`
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `docs/audits/2026-08-12-studio-direct-editing-rollout-hardening.md`
- `docs/releases/2026-08-12-canvas-studio-direct-editing.md`
- `docs/ops/FAST_PATHS.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## What changed

- Undo fingerprints the complete applied write boundary and refuses after newer work.
- A filesystem lock, durable atomic writes, transaction journal, crash recovery, process-group timeout handling, and in-place directory reconciliation protect multi-process and interrupted operations.
- Inferred legacy drivers are `not-onboarded`; Edit requires a declared supported driver plus explicit `authoring.studioEditing.enabled`.
- Direct runtime ownership now compares rendered text fingerprints/length and decoded link/image/title attributes. Unsupported runtime-owned targets stay annotation-only.
- Apply preflights each draft by item, safely rebases only unchanged selected elements, uses semantic generated IDs, and validates the final learner DOM in isolated Chromium.
- Render validation covers requested content/attribute/style survival, visibility, image alt text, control names, heading text, and contrast.
- Drafts retain complete baselines, never silently expire, warn on bounded eviction, support strict JSON backup/restore, survive project switches safely, and reopen for every patch type.
- The editor now uses decoded content-editable rich text, selected-text links, visual before/after frames with accessible captions, delta-only patches, and tag-restricted visual controls.
- Validated image upload stores content-addressed canonical resources and builder-safe workspace copies.
- Rename course synchronizes marked headings, browser title, project metadata, stored metadata, and declared runtime data as one checkpointed operation.
- Export freshness is derived from workspace plus actual artifact bytes, and SCORM 1.2/2004 are separate evidence targets recorded by exporters.
- The Mental Health legacy builder refuses to erase marked Direct edits unless the operator supplies the explicit destructive override flag.
- `course:list -- --all` now reports only the three real pilots and neutral E2E fixture as ready; inferred projects remain `not-onboarded`.

## Why this changed

- The prior V1 could overwrite newer work, race another Studio process, leave partial batches after a crash, approve inferred courses, and pass static validation even when course JavaScript erased the learner-visible result.
- Teachers also needed a real editor, durable drafts, safe local images, synchronized course naming, and export status tied to the package that actually exists.

## Source of truth

- Browser/server contract: `app/shared/course-editing.ts`.
- Transaction orchestration: `app/server/lib/course-editing.ts`.
- Lock, fingerprints, journal, and durable writes: `app/server/lib/course-edit-transaction.ts`.
- Learner-render postconditions: `app/server/lib/course-edit-render-validation.ts`.
- Generated identity/replay and title/asset materialization: `scripts/lib/course-editing/html.ts` and `scripts/lib/course-editing/overrides.ts`.
- Artifact freshness: `scripts/lib/course-editing/export-freshness.ts` plus the owning modules under `scripts/lib/exports/`.
- Teacher UI and persisted drafts: `app/studio/src/components/CourseEditPanel.tsx`, `app/studio/src/hooks/useCourseEditing.ts`, and `app/studio/src/lib/course-edit-storage.ts`.
- Complete finding/evidence record: `docs/audits/2026-08-12-studio-direct-editing-rollout-hardening.md`.

## Verification run

- `npm run test:course-editing` — 26/26 passed, including drift-safe Undo, cross-process lock, crash recovery, in-place directory restore, runtime overwrite rollback, item-labelled preflight, uploads, Rename, freshness, and SCORM separation.
- `npm run verify:course-editing-pilots` — 3/3 passed:
  - Mental Health Direct: 48 files / 8,229,340 bytes restored byte-for-byte.
  - English factory: 64 files / 31,614,939 bytes restored byte-for-byte after rebuild.
  - Social factory: 107 files / 137,467,882 bytes restored byte-for-byte after rebuild.
- Pilot residue audit — no `studio-edits.json`, active journal, Undo checkpoint, or new conflict-copy file remains in any pilot project.
- `npm run test:studio-release` — final pass: 123 focused contracts, production build, 56/56 inspection E2E, platform smoke, and strict project contract. Report: `.runtime/studio-release-report.json`.
- `npm run test:exports` — SCORM 19/19, Google Hosted 16/16, Apps Script 20/20.
- `npm run test:authoring-context` — 16/16.
- `npm run test:metadata-policy` — 24/24.
- `npm run validate:manifests` — passed for every migrated manifest; legacy manifests were intentionally skipped.
- `npm run test:english-transaction` — 6/6.
- `npm run test:social-build` — 7/7.
- Mental Health shell and builder guard — 9/9 plus Python syntax compilation passed with `python3`.
- `git diff --check` — passed; only warnings were existing CRLF normalization notices in unrelated files.
- `npm run typecheck` — no diagnostics in Direct Editing files; the established unrelated errors remain in legacy ELA/Forensics/Social builders and English PDF/resource typing.

## Fragile areas / watchouts

- Keep generated-directory rollback in place. Replacing a whole watched project directory caused macOS Documents/File Provider to recreate conflict copies asynchronously.
- The 36 conflict copies created while discovering that behavior were moved, not deleted, to the temporary recovery folder `/tmp/canvas-helper-studio-edit-conflicts.JRfcN3/2026-08-12/` so they do not pollute the worktree.
- The pre-existing `workspace/assets 2`, `workspace/resources 2`, Social `* 2` metadata, processed `source 2`, resource intake, and `test-results 2` paths remain untouched and belong to the user.
- The filesystem lock coordinates local processes sharing this checkout; it is not a distributed lock for simultaneous edits from separate machines.
- Only one successful applied batch is available for Undo. Draft JSON backup is a separate recovery surface.
- The local browser postcondition does not replace Brightspace upload, LMS runtime, or cross-browser package acceptance.
- Artifact evidence intentionally reports current packages stale until the matching exporter actually runs; no course export was republished in this task.
- The current Mental Health learner wording was preserved. Do not run its builder with `--allow-studio-edit-overwrite` unless intentionally discarding marked Direct edits.

## Next prompt should assume

- All 23 audit findings are closed for the explicitly onboarded boundary.
- Edit mode is ready for a controlled rollout on `mental-health-wellness`, `ela20-1-short-stories-pilot`, and `social30-1-related-issue-1-option-2`; `e2e-fixture` remains test-only.
- All other projects stay annotation/Review Set or Codex workflows until independently onboarded and piloted.
- The three real pilot courses have no active Studio edit, override, journal, or Undo residue.
- No raw import or generated export was edited.

## What still needs validation

- No repository validation remains for this hardening task.
- Before teacher-wide enablement of another course, repeat its source-ownership review, runtime mapping, builder write-set audit, learner-render checks, and reversible real-course pilot.
- Brightspace package upload and cross-browser save/restore remain export-stage acceptance checks when new packages are produced.

## Known risks

- A network-synchronized checkout can still introduce external changes; fingerprinted boundaries and fail-closed Undo prevent Studio from overwriting them but cannot stop the sync provider itself.
- Background images, responsive source sets, semantic heading-level changes, layout redesigns, activities, assessment logic, and arbitrary code remain deliberately unsupported in Edit mode.
- Repository-wide typecheck retains unrelated baseline diagnostics outside the changed Direct Editing boundary.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`docs/audits/2026-08-12-studio-direct-editing-rollout-hardening.md`

## Do not do next / warnings

- Do not broadly enable inferred legacy projects; explicit onboarding plus a real reversible pilot is mandatory.
- Do not force Undo or delete a manual-recovery journal after boundary drift; inspect the newer files first.
- Do not manually toggle export freshness or treat one SCORM version as proof for the other.
- Do not hand-edit English or Social generated workspace output as canonical source.
- Do not delete `/tmp/canvas-helper-studio-edit-conflicts.JRfcN3/2026-08-12/` or the user's pre-existing duplicate folders without explicit approval.
