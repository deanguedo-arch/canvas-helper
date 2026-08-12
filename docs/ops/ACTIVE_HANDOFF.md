# Handoff

- Project: `repo-wide`
- Task: Complete Canvas Studio roadmap Phase G: accessibility, narrow-screen resilience, and explicit performance budgets.
- Status: complete, committed as `c71e524c`, and pushed to `origin/codex/studio-roadmap-phases`.

## Files changed

- `ARCHITECTURE.md`
- `app/server/lib/preview-inspection.ts`
- `app/server/preview-bridge-runtime.ts`
- `app/shared/preview-bridge.ts`
- `app/shared/studio-quality.ts`
- `app/studio/src/App.tsx`
- `app/studio/src/components/CourseToolbar.tsx`
- `app/studio/src/components/InspectionPanel.tsx`
- `app/studio/src/components/ReviewSetPanel.tsx`
- `app/studio/src/components/ScreenshotAnnotation.tsx`
- `app/studio/src/components/Topbar.tsx`
- `app/studio/src/hooks/usePreviewRecovery.ts`
- `app/studio/src/hooks/usePreviewScrollSync.ts`
- `app/studio/src/hooks/useProjects.ts`
- `app/studio/src/hooks/useScreenshotAnnotation.ts`
- `app/studio/src/lib/review-set-storage.ts`
- `app/studio/src/lib/studio-performance.ts`
- `app/studio/src/precision-editor.css`
- `docs/ops/FAST_PATHS.md`
- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`
- `e2e/specs/inspection.spec.ts`
- `package.json`
- `scripts/tests/preview-security.test.ts`
- `scripts/tests/studio-incoming-refresh.test.ts`
- `scripts/tests/studio-quality.test.ts`

## What changed

- Shared, locally measured budgets now cover selection feedback, screenshot capture, and preview readiness.
- Annotation selection, save, remove, show, Done, and Escape flows restore focus predictably for keyboard users.
- Full Preview supports the same keyboard review intent as embedded Studio.
- Reduced-motion, high-contrast, and 320-pixel layouts remain usable without hiding the course or review controls.
- Pointer work is frame-coalesced, source and keyboard indexes are cached, late scroll containers are discovered, and Canvas Helper overlays no longer invalidate course caches.
- Server inspection documents use a bounded exact-path and file-stat cache; project intake forces a fresh project listing.
- Review Set retention, thumbnails, and capture work remain bounded and avoid needless rebuilds while notes are typed.
- No learner-course file under `projects/<slug>/workspace`, `raw`, or `exports` changed.

## Why this changed

- The Studio review loop must remain fast, keyboard-complete, and visually stable on real teacher hardware and smaller windows.
- Performance claims now have visible deadlines and regression coverage instead of depending on subjective impressions.

## Verification run

- Passed: `npm run test:studio-inspection` — 68/68.
- Passed: `npm run build:studio`.
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` — 48/48.
- Passed: the query/hash Show regression repeated three consecutive times.
- Passed: `npm run test:e2e:smoke` — 1/1.
- Passed: `npm run test:e2e:project -- --project e2e-fixture` — 1/1.
- Passed: `git diff --check`.
- Passed: independent Terra Max strict re-review after all adversarial findings were closed.
- Baseline only: `npm run typecheck` still reports established unrelated diagnostics; no diagnostic points into a Phase G file.

## Source of truth

- Shared budgets and cache limits: `app/shared/studio-quality.ts`.
- Runtime bridge behavior: `app/server/preview-bridge-runtime.ts`.
- Bridge message contract: `app/shared/preview-bridge.ts`.
- Client measurement: `app/studio/src/lib/studio-performance.ts`.
- Review persistence: `app/studio/src/lib/review-set-storage.ts`.
- Phase G regression gate: `e2e/specs/inspection.spec.ts`.

## Fragile areas / watchouts

- Measure committed selection work from pointer release or keyboard activation; do not include the teacher's deliberation or drag time.
- Keep Canvas Helper overlay mutations outside course-content invalidation while still observing real course mutations.
- Preserve exact-page readiness and the private exact-origin bridge from Phase F.
- Keep caches and retained Review Set data bounded by the shared quality contract.
- Unrelated `projects/processed/**/source 2/`, resource intake, and duplicate test-results folders remain local and were deliberately excluded.

## Next prompt should assume

- Branch: `codex/studio-roadmap-phases`.
- Phases A through G are implemented and pushed.
- Phase G implementation commit: `c71e524c`.
- The remaining roadmap boundary is Phase H: architecture and release discipline.
- Preserve the matte, restrained, project-neutral interface and current source-of-truth boundaries.

## What still needs validation

- Phase G has no outstanding validation; Phase H requires its own focused tests, full inspection E2E gate, smoke checks, and independent review.

## Known risks

- Repository-wide typecheck remains red for unrelated legacy ELA, Forensics, Social 20, English-factory, and PDF extraction diagnostics.
- Browser performance depends on host load, so tests enforce deadlines with deliberate margin rather than claiming absolute latency on every machine.

## Exact next command

`rg -n "useState|useRef|Review Set|PreviewReview|release notes|What's new" app/studio/src/App.tsx app/studio/src app/shared e2e/specs/inspection.spec.ts`

## Exact next file to open

`app/studio/src/App.tsx`

## Do not do next / warnings

- Do not add course-specific branches to complete Phase H.
- Do not touch learner-course source or generated output for Studio roadmap work.
- Do not stage or delete unrelated untracked intake snapshots.
