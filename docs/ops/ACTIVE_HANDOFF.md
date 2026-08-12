# Handoff

- Project: `repo-wide`
- Task: Complete Canvas Studio roadmap Phase F: exact-page preflight, runtime health, and teacher-facing preview recovery.
- Status: complete, committed as `75a5d369`, and pushed to `origin/codex/studio-roadmap-phases`.

## Files changed

- `ARCHITECTURE.md`
- `app/server/lib/preview-preflight.ts`
- `app/server/preview-bridge-runtime.ts`
- `app/server/routes/preview-preflight.ts`
- `app/server/studio-server.ts`
- `app/shared/preview-bridge.ts`
- `app/shared/preview-health.ts`
- `app/studio/src/App.tsx`
- `app/studio/src/components/CourseToolbar.tsx`
- `app/studio/src/components/PreviewPane.tsx`
- `app/studio/src/components/PreviewRecoveryPanel.tsx`
- `app/studio/src/components/ReferencePicker.tsx`
- `app/studio/src/hooks/usePreviewRecovery.ts`
- `app/studio/src/hooks/usePreviewScrollSync.ts`
- `app/studio/src/lib/preview-recovery.ts`
- `app/studio/src/precision-editor.css`
- `docs/ops/FAST_PATHS.md`
- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`
- `e2e/specs/inspection.spec.ts`
- `scripts/tests/codex-packet.test.ts`
- `scripts/tests/preview-route.test.ts`
- `scripts/tests/preview-security.test.ts`

## What changed

- Studio performs a bounded exact-origin preflight before mounting a selected course HTML page.
- Annotate and Full Preview remain unavailable until the exact current page passes its own check.
- Empty, hidden, transparent, decorative, indefinitely loading, loader-only, bridge-failed, and runtime-failed pages produce an explicit recovery surface.
- Slow pages stay mounted long enough to render and can recover from a temporary empty state.
- Recovery offers Retry, Open another page, Copy issue for Codex, and collapsed Details in plain teacher language.
- Full Preview opens only through the standalone recovery host and includes Retry and Return to Studio.
- Diagnostics are URL-scoped, bounded, privacy-scrubbed, and separated between embedded and standalone previews.
- Generic inline reference resources remain visible without being treated as course pages.
- No learner-course file under `projects/<slug>/workspace`, `raw`, or `exports` changed.

## Why this changed

- A blank or mangled preview must never look like a working course.
- Teachers need a direct recovery path without the old technical dashboard.
- Exact-page readiness prevents stale state from authorizing a different page or bypassing the recovery host.

## Verification run

- Passed: `npm run test:studio-inspection` — 64/64.
- Passed: `npm run build:studio`.
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` — 35/35.
- Passed: the loader-status regression repeated three consecutive times.
- Passed: `npm run test:e2e:smoke` — 1/1.
- Passed: `npm run test:e2e:project -- --project e2e-fixture` — 1/1.
- Passed: `git diff --check`.
- Passed: independent Terra Max red-team re-review after closing all reported edge cases.
- Audited: 524 raw/workspace HTML pages across 57 projects — zero hard failures, four warnings.
- Baseline only: `npm run typecheck` still reports established unrelated errors in legacy ELA, Forensics, Social 20, and English-builder files; no diagnostic points into a Phase F file.

## Source of truth

- Exact-page preflight contract: `app/shared/preview-health.ts`.
- Server-side preflight policy: `app/server/lib/preview-preflight.ts`.
- Runtime content health and standalone recovery: `app/server/preview-bridge-runtime.ts`.
- Client recovery state machine: `app/studio/src/hooks/usePreviewRecovery.ts`.
- Teacher-facing recovery surface: `app/studio/src/components/PreviewRecoveryPanel.tsx`.
- Bounded issue handoff: `app/studio/src/lib/preview-recovery.ts`.

## Fragile areas / what might drift

- Keep readiness bound to the exact current preview URL and retry attempt.
- Do not count status, progress, hidden, transparent, or decorative-only output as meaningful course content.
- Do not shorten the delayed-content window without checking real legacy course startup times.
- Full Preview must continue to open through `/standalone-preview`, never through a raw isolated-course URL.
- The four warnings remain project-level follow-up: one missing ELA template script, one legacy D2L root-relative runtime, one unsupported Firebase module family, and one missing Ready Mind `main.js`.
- Untracked `projects/processed/**/source 2/` folders remain unrelated local intake artifacts and were deliberately excluded.

## Next prompt assumptions

- Branch: `codex/studio-roadmap-phases`.
- Phases A through F are implemented and pushed.
- Phase F implementation commit: `75a5d369`.
- The next roadmap boundary is Phase G: accessibility, narrow-screen resilience, and explicit performance budgets.
- Preserve the matte, restrained, project-neutral interface and current source-of-truth boundaries.

## Known risks / follow-up

- Runtime health is intentionally heuristic and bounded; future runtime families require explicit tests before allowlisting.
- The four warning pages render or recover, but their project sources still need separate canonical repair if those courses are promoted to active authoring.
- Repository-wide typecheck remains red for unrelated legacy builder errors.

## Exact next command

`rg -n "stopAnnotationMode|toggleAnnotationMode|aria-live|focus\\(|loading=|@media|prefers-reduced-motion" app/studio/src app/server/preview-bridge-runtime.ts e2e/specs/inspection.spec.ts`

## Exact next file to open

`app/studio/src/components/InspectionPanel.tsx`

## Do not do next / warnings

- Do not restore Preview Health, source-file lists, or technical dashboard cards in the normal review rail.
- Do not classify secure-capture media fallbacks as learner-course defects.
- Do not touch learner-course source or generated output for Studio roadmap work.
- Do not stage or delete unrelated untracked intake snapshots.
