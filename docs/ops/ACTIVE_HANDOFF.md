# Handoff

- Project: `repo-wide`
- Task: Close every actionable finding from the independent Canvas Studio Direct Editing audit and prepare an exact, GitHub-verifiable re-audit packet.
- Status: ready for validation

## Publication and review state

- Branch: `codex/studio-direct-editing-v1`
- Focused draft PR: `https://github.com/deanguedo-arch/canvas-helper/pull/1`
- PR base: `codex/studio-roadmap-phases` at `74b0c3ee7de150472c10f172a664ee658050f2ca`
- Remediation implementation commits: `99b8f3bbafc2cb4b546f8115d95ab8207a78b33b`, `4e5f8c7f726aef7f8cd98d74c326d07ba06433f2`, `73ef39bc2c288acf5cba4585103bcc915f332483`, `bd67e342589007ef275001a9e04038fad670d41c`, and `ef30b252dab156804bede46546c9986c92483398`
- Audit packet: `docs/audits/2026-08-13-chatgpt-studio-course-editing-audit-brief.md`
- Independent finding record: `docs/audits/2026-08-12-studio-direct-editing-rollout-hardening.md`
- The PR must remain draft until the exact-head GitHub workflow is green and an independent re-audit accepts the boundary. Do not merge based only on local implementation evidence.

## Summary

- All actionable findings in the supplied independent audit have an implementation, regression coverage, and a public evidence path.
- Undo now fails closed after drift; separate Studio processes use an atomic complete-owner filesystem lock; interrupted batches use fingerprint-aware recovery that preserves unknown external bytes; terminal cleanup is restart-idempotent.
- The server validates the actual learner render after each batch. Studio visually distinguishes source-owned editable regions from runtime-owned or unsupported Annotation-only regions.
- Draft persistence, no-op handling, stable generated identities, image upload, Rename Course, bounded request bodies, multi-page snapshots, and artifact-based export freshness are covered by focused tests.
- A clean Git checkout contains 66 project directories and 65 manifests. Of those, 63 source-backed projects are explicitly Studio-enabled: 28 Direct, 5 English factory, 4 Social factory, and 26 preserved legacy snapshots. One project is blocked, one is reference-only, and one tracked directory is a package archive.
- The earlier 84-directory/19-archive claim was caused by 18 ignored or untracked local package directories. It is corrected in the audit documents and those local artifacts are excluded from GitHub evidence.
- Catalog acceptance passed 63/63: 50 projects completed a reversible rendered learner lifecycle, 12 honestly reported no source-owned text target, and Aboriginal Studies 30 safely reported no learner-stable sampled text target after exact restoration.
- Real Direct, English, Social, and snapshot pilots passed together through HTTP Apply, rebuild/materialization, learner render, reload, server restart, route-level Undo, and byte-for-byte restoration.
- The first exact-head PR workflow exposed a clean-Linux-only live-discovery defect: the first `course:create` signal was watched before its parent directory existed. Studio now creates that exact operational directory before subscribing, and the formerly failing clean-checkout browser scenario passes.
- The second exact-head workflow passed the release gate and all four real pilots, then exposed two catalog-environment mismatches: Macbeth's declared factory needs Poppler/Tesseract OCR, and a later verifier sample exceeded the browser's shared 320-character text bound. CI now installs the OCR runtime and the verifier mirrors the browser bound; Macbeth passes its route-level lifecycle locally.
- No tracked learner course content remains changed from verification. The user's unrelated local duplicate, archive, resource, and transaction paths remain untouched and unstaged.

## Files changed

### Mutation, locking, recovery, validation, and HTTP contracts

- `app/shared/course-editing.ts`
- `app/server/lib/course-editing.ts`
- `app/server/lib/course-edit-transaction.ts`
- `app/server/lib/course-edit-render-validation.ts`
- `app/server/lib/course-edit-image.ts`
- `app/server/routes/course-edits.ts`
- `app/server/studio-server.ts`
- `scripts/lib/course-editing/http-route-harness.ts`
- `scripts/lib/course-editing/catalog-pilot.ts`
- `scripts/lib/course-editing/export-freshness.ts`

### Generated ownership, inspection, and teacher workflow

- `scripts/lib/course-editing/html.ts`
- `scripts/lib/course-editing/overrides.ts`
- `app/server/lib/preview-inspection.ts`
- `app/server/preview-bridge-runtime.ts`
- `app/studio/src/components/CourseEditPanel.tsx`
- `app/studio/src/hooks/useCourseEditing.ts`
- `app/studio/src/lib/course-edit-storage.ts`

### Course lifecycle, catalog acceptance, and CI

- `scripts/lib/course-authoring/context.ts`
- `scripts/lib/course-onboarding.ts`
- `scripts/lib/codex-course.ts`
- `scripts/lib/importer.ts`
- `scripts/verify-course-editing-pilots.ts`
- `scripts/verify-course-onboarding.ts`
- `.github/workflows/studio-direct-editing.yml`
- `scripts/tests/course-editing.test.ts`
- `scripts/tests/course-edit-storage.test.ts`
- `scripts/tests/studio-architecture.test.ts`

### Audit, release, and operating documentation

- `docs/audits/2026-08-12-studio-direct-editing-rollout-hardening.md`
- `docs/audits/2026-08-13-course-catalog-onboarding.md`
- `docs/audits/2026-08-13-chatgpt-studio-course-editing-audit-brief.md`
- `docs/releases/2026-08-12-canvas-studio-direct-editing.md`
- `docs/ops/FAST_PATHS.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`
- `README.md`
- `ARCHITECTURE.md`

## What changed

- One exhaustive shared adapter predicate now recognizes Direct, English factory, Social factory, and legacy snapshot in storage, transport, server validation, and pilot code.
- Resolve, Rename, and Apply bodies use streaming byte ceilings rather than trusting parsed JSON size after allocation.
- Lock acquisition publishes a complete fsynced owner through an atomic no-replace hard-link claim. Stale-lock retirement is identity-bound and normal cleanup removes its tombstone.
- Recovery compares complete before/after write-boundary fingerprints. Exact-before, exact-after, and known-partial states recover deterministically; unknown post-crash external bytes enter manual recovery and are never overwritten.
- Apply computes expected after-fingerprints up front and rereads each Direct source immediately before atomic replacement. Rejected rendered validation restores exact bytes without leaving a journal or Undo checkpoint.
- Generated overrides refuse ambiguous identical siblings unless the canonical builder supplies a durable `data-canvas-helper-edit-key`.
- Image uploads use bounded full Sharp decoding, full SHA-256 names, retry-safe dual publication, and learner-browser natural-dimension checks.
- Export evidence V2 fingerprints target identity, workspace bytes, normalized manifest, Studio metadata, package state, recursive local exporter imports including side-effect-only imports, and artifact bytes. SCORM 1.2 and SCORM 2004 remain independent.
- Public HTTP route harnesses cover body limits and restart lifecycles. Snapshot materialization loads every declared page from its own source.
- `.github/workflows/studio-direct-editing.yml` runs focused tests, exports, the source-locked Studio release gate, all four real pilots, and the full catalog on every PR revision and branch push, then uploads SHA-bearing reports.
- The workflow installs the Poppler/Tesseract runtime required by the declared Macbeth factory, and catalog selections use the same shared visible-text ceiling as the browser bridge.
- Studio creates `.runtime/course-create/` before registering the exact signal-file watcher, so the first Codex-created course appears live on clean Linux as well as established local checkouts.

## Why this changed

- File-level tests alone did not prove that the teacher-visible learner result survived runtime JavaScript, rebuilds, server restarts, or Undo.
- Process-local coordination and unconditional recovery could overwrite newer work after concurrency or a crash.
- Inferred legacy eligibility did not establish source ownership and could run builders that replace Studio changes.
- Audit claims must be reproducible from a clean Git checkout; local-only package directories cannot count as published catalog evidence.

## Source of truth

- Apply, Rename, upload, and Undo authority: `app/server/lib/course-editing.ts`.
- Cross-process lock and transaction recovery: `app/server/lib/course-edit-transaction.ts`.
- Learner-render postcondition: `app/server/lib/course-edit-render-validation.ts`.
- Editability map: `app/server/lib/preview-inspection.ts` and `app/server/preview-bridge-runtime.ts`.
- Generated identity/replay: `scripts/lib/course-editing/html.ts` and `scripts/lib/course-editing/overrides.ts`.
- Export evidence: `scripts/lib/course-editing/export-freshness.ts`.
- Per-course ownership: `projects/<slug>/meta/project.json`.
- Catalog classifier and acceptance: `scripts/lib/course-onboarding.ts` and `scripts/verify-course-onboarding.ts`.
- Re-audit entrypoint: `docs/audits/2026-08-13-chatgpt-studio-course-editing-audit-brief.md`.

## Verification run

- Exact source checkout at `73ef39bc2c288acf5cba4585103bcc915f332483`: `npm run test:studio-release` passed:
  - 147/147 focused contracts
  - production Studio build passed
  - 58/58 complete Studio inspection E2E scenarios passed
  - platform smoke 1/1 passed
  - strict project contract 1/1 passed
  - report `ok: true`, `sourceChangedDuringRun: false`, 523 fingerprinted source files, digest `5e8e06cc12fe77cd70b6aa59c880e90eadd4455fbe4619d2d44169b9cb70e6ec`
- `npm run test:course-editing -- --test-reporter=dot` — 43/43 passed after the final exporter dependency and stale-lock cleanup changes.
- `npm run test:studio-inspection -- --test-reporter=dot` — 149/149 passed after the clean-Linux watcher and catalog-bound fixes.
- Clean checkout with `.runtime/course-create/` absent: the exact formerly failing Codex-created-course live-discovery E2E passed 1/1.
- Clean checkout with OCR support available: `npm run verify:course-onboarding -- --project ela20-1-shakespeare-macbeth` — 1/1 passed through the public route and exact restoration.
- Clean implementation checkout at `4e5f8c7f726aef7f8cd98d74c326d07ba06433f2`: `npm run verify:course-editing-pilots` — 4/4 passed with HTTP server restart and exact restoration.
- Same clean checkout: `npm run verify:course-onboarding -- --all` — 63/63 passed: 50 reversible learner cycles, 12 no-source-owned-text-target outcomes, one no-learner-stable-text-target outcome, zero failures.
- Same clean checkout: `npm run course:onboard -- --all` — 66 tracked project directories, 65 manifests, retain-only for all source-backed projects; one tracked package archive classification.
- `npm run validate:manifests` — 65/65 valid.
- `npm run test:authoring-context -- --test-reporter=dot` — 18/18 passed.
- `npm run test:metadata-policy -- --test-reporter=dot` — 27/27 passed.
- `npm run test:exports` — 55/55 passed across SCORM, Google Hosted, and Apps Script suites.
- `npm run typecheck -- --pretty false` — still exits 2 on the same ten established unrelated diagnostics in legacy ELA, Forensics, Social 20, and English factory resource/render files; no remediation file has a diagnostic.
- `git diff --check` — passed before each remediation commit.
- Clean-checkout residue audit — no active transaction journal, lock owner, or latest Undo checkpoint remained after catalog verification.

## Fragile areas / watchouts

- The lock is cooperative. Node has no portable conditional replace for the final Direct reread-to-rename interval, so manual, Git, Codex, or standalone builder writes must not run concurrently with Apply.
- Render settlement and edited-target accessibility checks are bounded local heuristics. They do not prove delayed interaction behavior, full WCAG conformance, Brightspace behavior, or deployed-host behavior.
- Snapshot adapters preserve the current workspace baseline; they do not reconstruct missing historical factory inputs. Never run a quarantined legacy replacement builder merely to refresh a snapshot course.
- Twelve courses expose no routine source-owned text target. They are correctly visible but Annotation-only for that content until ownership is migrated or a dedicated adapter is added.
- Aboriginal Studies 30 retains runtime/contrast debt for sampled text changes. Do not weaken validation to force it through.
- `calm-module-4` remains deliberately blocked by its unresolved `lesson-shell` lifecycle deviation.
- The single tracked package archive and the 18 local-only package directories have no proved canonical editable source.
- Running Codex or a builder after a Studio batch intentionally invalidates Undo.
- The dirty main checkout still contains user-owned duplicate/conflict files, local resources, and factory transaction directories. Do not clean or broadly stage them.

## Next prompt should assume

- Direct Editing is implemented and locally release-verified for all four supported adapters, but PR #1 is still a draft pending exact-head CI and independent re-audit.
- Every source-backed active project in the clean GitHub catalog is explicitly onboarded; this does not mean every rendered DOM node is inline-editable.
- Edit mode is the honest visual answer: supported source-owned nodes show an edit action, while runtime-owned or unsupported nodes show Annotation only.
- Net-new Codex courses must use `npm run course:create`; imported courses receive explicit Direct ownership during import.
- The clean GitHub catalog count is 66 directories / 65 manifests / 63 enabled projects, not the superseded dirty-checkout count of 84.

## What still needs validation

- Push the catalog-runtime fix and updated evidence, then require the replacement exact-head GitHub Actions workflow to pass and retain its three SHA-bearing reports.
- Give PR #1 and `docs/audits/2026-08-13-chatgpt-studio-course-editing-audit-brief.md` to the independent auditor for a fresh verdict.
- Brightspace upload, deployed-host acceptance, and cross-browser SCORM save/restore remain external per-export checks.
- Broad inline editing for runtime-owned courses, Aboriginal Studies runtime/contrast repair, CALM Module 4 lifecycle repair, and recovery/import of package-only sources remain separate follow-up work.

## Known risks

- A non-cooperating external writer can bypass the lock protocol; operating guidance is required until platform-specific conditional replacement exists.
- An operator can bypass `course:create`, import, or onboarding through arbitrary filesystem edits; the next doctor/onboarding run must catch that drift.
- A historical builder launched outside Studio can replace a snapshot workspace. Studio will refuse stale Undo afterward, but cannot prevent an explicitly invoked external command.
- A release package may still be learner-usable while lacking an authorable source; do not equate package validity with Studio editability.

## Exact next command

`gh pr checks 1 --watch`

## Exact next file to open

`docs/audits/2026-08-13-chatgpt-studio-course-editing-audit-brief.md`

## Do not do next / warnings

- Do not merge PR #1 before exact-head CI and the independent re-audit.
- Do not weaken source mapping, rendered-result, contrast, or accessibility checks to increase the editable count.
- Do not run quarantined legacy rebuild commands on snapshot courses.
- Do not use Undo after Codex, a builder, or another tool changes that course.
- Do not delete, normalize, or broadly stage the user's unrelated local files.
