# Handoff

- Project: `repo-wide`
- Task: Bring the complete existing course catalog into explicit Studio authoring contracts without ruining legacy courses, while keeping future Codex/imported courses current by construction.
- Status: complete

## Publication and independent-audit packet

- Branch: `codex/studio-direct-editing-v1`
- Pushed implementation commit: `1b221ee9ad9594a7166572494448e1db32f6e0e1`
- Focused draft PR: `https://github.com/deanguedo-arch/canvas-helper/pull/1`
- PR base: `codex/studio-roadmap-phases` at `74b0c3ee7de150472c10f172a664ee658050f2ca`
- Audit packet: `docs/audits/2026-08-13-chatgpt-studio-course-editing-audit-brief.md`
- The PR is intentionally focused on Direct Editing and catalog onboarding. The full comparison to `main` includes the older stacked Studio roadmap and English/course history.

## Summary

- Catalog onboarding is complete and idempotent across all 84 project directories.
- 63 active or ready-for-export source-backed projects now pass `course:doctor` with explicit Studio editing enabled:
  - 28 Direct workspace projects
  - 5 English factory projects
  - 4 Social factory projects
  - 26 preserved legacy snapshots
- One project remains intentionally blocked (`calm-module-4`), one is reference-only (`e2e-studio-secondary`), and 19 package/export-only directories are catalogued without fabricating editable sources.
- The four original Social 30 issue courses are no longer hidden from Studio. Missing Social 30 Option Two Issues 2–4 were built from the checksum-verified source and onboarded with the existing staged factory.
- Net-new `course:create` courses and newly imported projects receive explicit Direct ownership automatically, so future courses do not need another catalog catch-up.
- Temporary catalog edits were all undone. No active edit lock, journal, or Undo checkpoint remains, and no existing learner workspace retained a pilot marker.

## Files changed

### Catalog onboarding and acceptance

- `scripts/lib/course-onboarding.ts`
- `scripts/onboard-courses.ts`
- `scripts/verify-course-onboarding.ts`
- `scripts/tests/course-onboarding.test.ts`
- `package.json`
- `.gitignore`

### Authoring drivers and source policy

- `scripts/lib/course-authoring/context.ts`
- `scripts/lib/project-manifest-policy.ts`
- `scripts/lib/types.ts`
- `scripts/lib/importer.ts`
- `app/shared/course-editing.ts`
- `app/server/lib/course-editing.ts`
- `app/server/lib/course-edit-render-validation.ts`
- `app/server/lib/preview-inspection.ts`
- `app/studio/src/lib/types.ts`

### Studio discovery and catalog visibility

- `scripts/lib/projects.ts`
- `app/studio/src/lib/project-display.ts`
- `app/shared/project-discovery.ts`
- `app/server/studio-server.ts`
- `app/studio/src/hooks/useProjects.ts`
- `scripts/tests/studio-project-continuity.test.ts`

### Course contracts and generated Social workspaces

- 65 `projects/<slug>/meta/project.json` manifests
- `scripts/build-social30-related-issues.ts`
- `projects/social30-1-related-issue-2-option-2/**`
- `projects/social30-1-related-issue-3-option-2/**`
- `projects/social30-1-related-issue-4-option-2/**`

### Documentation and release communication

- `docs/audits/2026-08-13-course-catalog-onboarding.md`
- `docs/ops/FAST_PATHS.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`
- `README.md`
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `AGENTS.md`
- `docs/releases/2026-08-12-canvas-studio-direct-editing.md`
- `app/studio/src/lib/studio-release-notes.ts`

## What changed

- `npm run course:onboard -- --all` audits every project directory without writes.
- Adding `--apply` writes changed manifests as one rollback-safe catalog transaction, doctors every enabled project, rolls all manifests back if any enabled course fails, then sends the fixed project-change signal to a running Studio.
- A second audit is retain-only. Unmanifested directories that are not demonstrably package-only now fail closed instead of being mislabeled.
- `legacy-snapshot-v1` treats the current workspace as a protected recoverable baseline. Studio stores replayable overrides in `meta/studio-edits.json`, materializes them into declared pages, validates the real learner render, and supports drift-safe Undo without running the historical replacement builder.
- Direct projects write only declared workspace-owned canonical files. Shared code remains read-only in Studio.
- English/Social factories keep generated workspace output protected and replay course-only overrides through staged rebuilds.
- Imported projects now declare `imported-workspace-v1` / `direct-workspace-v1` at intake.
- The rendered-validation navigation allowance is a bounded 30 seconds so multi-thousand-element legacy pages such as Othello can complete source decoration without weakening postconditions.
- Studio's visual Edit map remains authoritative only for display. Every actual patch is re-resolved and learner-render validated by the server.

## Why this changed

- A blanket editable flag would have made several legacy builders capable of replacing Studio work.
- Package output is not a canonical source, and runtime-created DOM is not automatically persistable.
- Explicit Direct/factory/snapshot outcomes let all real source-backed courses enter the current Studio model while preserving the course that learners already see.
- Future creation and import paths now declare ownership immediately, preventing the catalog from drifting back into inferred legacy state.

## Source of truth

- Complete catalog outcome and exceptions: `docs/audits/2026-08-13-course-catalog-onboarding.md`.
- Per-course ownership: `projects/<slug>/meta/project.json`.
- Catalog classifier/transaction: `scripts/lib/course-onboarding.ts`.
- Doctor/readiness resolver: `scripts/lib/course-authoring/context.ts`.
- Apply/replay/Undo authority: `app/server/lib/course-editing.ts`.
- Filesystem transaction boundary: `app/server/lib/course-edit-transaction.ts`.
- Learner-render postcondition: `app/server/lib/course-edit-render-validation.ts`.
- Visual edit boundary: `app/server/lib/preview-inspection.ts` and `app/server/preview-bridge-runtime.ts`.
- Future Codex-course path: `scripts/lib/codex-course.ts`.
- Future import path: `scripts/lib/importer.ts`.

## Verification run

- `npm run course:onboard -- --all` — retain-only audit:
  - 28 Direct
  - 5 English factory
  - 4 Social factory
  - 26 legacy snapshot
  - 1 blocked
  - 1 reference-only
  - 19 package archive
  - zero pending source-backed manifest changes
- `npm run validate:manifests` — all 65 manifests valid.
- `npm run verify:course-onboarding -- --all` — 63/63 passed:
  - 49 completed apply → applicable rebuild/materialization → learner render → reload → Undo → exact fingerprint restoration
  - 12 correctly reported no source-owned text target
  - `aboriginal-studies-30` and `sportswellness` safely rejected sampled text because of runtime replacement or existing contrast; every trial restored exactly
- `npm run test:course-onboarding` — 2/2 passed, including idempotence/live signal and fail-closed unmanifested source behavior.
- `npm run test:course-editing -- --test-reporter=dot` — 28/28 passed.
- `npm run test:authoring-context -- --test-reporter=dot` — 18/18 passed.
- `npm run test:metadata-policy -- --test-reporter=dot` — 27/27 passed earlier in this task.
- `npm run test:studio-inspection -- --test-reporter=dot` — 132/132 passed.
- `npm run build:studio` — passed.
- `npm run test:studio-release` — final source-locked pass:
  - 132/132 focused contracts
  - production build passed
  - 58/58 inspection E2E scenarios passed
  - platform smoke 1/1 passed
  - strict project contract 1/1 passed
  - `.runtime/studio-release-report.json` records `ok: true`, source digest `d7f83382e2bb2019fedf76623ceeff7abaea87e689201457add0005c62b6646e`, 524 fingerprinted files, and `sourceChangedDuringRun: false`
- `npm run typecheck -- --pretty false` — no diagnostics in onboarding or Direct Editing files; established unrelated errors remain in legacy ELA, Forensics, Social 20, and English factory resource/render code.
- `git diff --check` — passed; only existing CRLF conversion warnings were printed.
- Residue audit — no active `.runtime/studio-edit-transactions/**`, lock owner, or latest Undo checkpoint remains.

## Fragile areas / watchouts

- The 26 snapshot projects preserve the current workspace; they do not reconstruct missing historical factory inputs. Their documented legacy commands are quarantined from Studio. Running one manually can still replace the materialized page and should be treated as a deliberate migration operation.
- Twelve runtime-rendered projects have zero safe source-owned text target. They are visible in Studio, but learner text correctly routes to Annotate/Codex until routine content moves back into canonical HTML or receives a supported adapter.
- `aboriginal-studies-30` and `sportswellness` remain text-restricted by runtime ownership and existing contrast debt. Do not weaken rendered validation to make them pass.
- `calm-module-4` stays blocked until its required `lesson-shell` deviation is resolved.
- The 19 package archives are accounted for but not visible as editable courses because no canonical source exists.
- Running Codex or a builder after a Studio batch invalidates Undo by design.
- Repository-wide typecheck retains unrelated baseline diagnostics.
- The dirty worktree contains user-owned duplicate/conflict paths and other pre-existing work. They were preserved and must not be cleaned or broadly staged without explicit authorization.

## Next prompt should assume

- All current source-backed active courses are explicitly onboarded and visible in Studio.
- Clicking **Edit** shows the real visual boundary: supported visible regions show their action; runtime-owned or unsupported content shows Annotation only.
- A course created in Codex must begin with `course:create`; an imported course receives explicit Direct ownership at import.
- Legacy snapshot Studio edits are safe because Studio never invokes their replacement builders and every apply still receives a learner-render postcondition.
- Package-only archives need source recovery/import, not a manifest flag.
- No catalog migration rerun is needed unless new unmanifested legacy directories are introduced.

## What still needs validation

- No repository validation remains for the catalog onboarding itself.
- Brightspace upload, SCORM/browser persistence, and deployed-host acceptance remain per-export external checks.
- Recovering canonical sources for any of the 19 package archives is separate course-recovery work.
- Making the 12 runtime-only courses broadly inline-editable requires moving routine content into source-owned HTML or adding a dedicated runtime adapter.
- Repairing Aboriginal Studies/Sports Wellness contrast/runtime ownership and the CALM Module 4 deviation are explicit follow-up tasks, not rollout blockers for the rest of the catalog.

## Known risks

- An operator can still bypass the documented creation/import/onboarding commands through arbitrary filesystem edits; the next doctor/onboarding audit will fail or expose that drift.
- A historical builder run outside Studio can replace a snapshot workspace. Studio will refuse stale Undo afterward, but it cannot prevent an explicitly launched external command.
- A package archive may be learner-usable as a release while still being non-authorable; do not equate those states.
- Existing exports may be stale after future course edits and must be republished from their owning export target.

## Exact next command

`npm run test:studio-release`

## Exact next file to open

`docs/audits/2026-08-13-chatgpt-studio-course-editing-audit-brief.md`

## Do not do next / warnings

- Do not run quarantined legacy rebuild commands merely to “refresh” snapshot courses.
- Do not create manifests for package-only directories until a canonical source is recovered or intentionally imported.
- Do not mark runtime-owned DOM editable by relaxing source signatures, visibility, contrast, or learner-render checks.
- Do not use Undo after Codex, a builder, or another tool changes that course.
- Do not delete or normalize the user's duplicate/conflict files or unrelated dirty worktree.
