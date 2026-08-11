# Handoff

- Project: `repo-wide`
- Task: Complete Canvas Studio roadmap Phase E: precise annotations, screenshot recovery, stale-anchor recovery, relinking, and resolved work.
- Status: complete, committed as `a1abbb56`, and pushed to `origin/codex/studio-roadmap-phases`.

## Files changed

- `app/server/lib/review-screenshots.ts`
- `app/server/preview-bridge-runtime.ts`
- `app/server/routes/review-screenshots.ts`
- `app/shared/inspection.ts`
- `app/shared/preview-bridge.ts`
- `app/studio/src/App.tsx`
- `app/studio/src/components/InspectionPanel.tsx`
- `app/studio/src/components/InspectorPanel.tsx`
- `app/studio/src/components/ReviewSetPanel.tsx`
- `app/studio/src/components/ScreenshotAnnotation.tsx`
- `app/studio/src/hooks/usePreviewScrollSync.ts`
- `app/studio/src/hooks/useScreenshotAnnotation.ts`
- `app/studio/src/lib/current-preview-selection.ts`
- `app/studio/src/lib/review-screenshots.ts`
- `app/studio/src/lib/review-set-storage.ts`
- `app/studio/src/lib/review-set.ts`
- `app/studio/src/precision-editor.css`
- `e2e/specs/inspection.spec.ts`
- `scripts/tests/codex-packet.test.ts`
- `scripts/tests/preview-security.test.ts`
- `scripts/tests/review-screenshots.test.ts`
- `scripts/tests/studio-project-continuity.test.ts`
- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Element and teacher-drawn area selections are visually distinct and keep their exact bounded geometry through capture and handoff.
- Keyboard selection remains learner-action-safe.
- Draft and saved screenshots can be cropped; saved screenshots can be retaken through exact-owner atomic replacement.
- Screenshot replacement locks conflicting review mutations, checks the exact screenshot again after the PUT, and supports aborting an in-flight request.
- Retake and crop are disabled after relinking when the preserved screenshot belongs to the former selection.
- Changed and missing anchors are detected before copy; missing nodes return to the nearest saved page location.
- Relink preserves note, concern, priority, label, and original screenshots while moving the live anchor.
- Resolved annotations remain in the local review but are excluded from the next Codex packet until reopened.
- Review storage migrated to v9 with immutable per-screenshot ownership and safe recovery from corrupt v8 or v9 values.
- Current proposal-only and legacy projects remain reviewable; unknown source ownership is not confused with a missing visual anchor.
- No learner-course file under `projects/<slug>/workspace`, `raw`, or `exports` changed.

## Why this changed

- Saved review evidence must remain trustworthy after navigation, rebuilding, and relinking.
- Recovery controls need plain teacher language while retaining strict screenshot and source-ownership boundaries.
- Resolved work should lower token use by staying out of the next Codex handoff without deleting the teacher's history.

## Verification run

- Passed: `npm run test:studio-inspection` — 59/59.
- Passed: `npm run build:studio`.
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` — 24/24.
- Passed: `npm run test:e2e:smoke` — 1/1.
- Passed: `npm run test:e2e:project -- --project e2e-fixture` — 1/1.
- Passed: `git diff --check`.
- Passed: independent Terra red-team re-review of all four original findings.
- Baseline only: `npm run typecheck` still reports established unrelated errors in legacy ELA, Forensics, Social 20, and English-builder files; no diagnostic points into a Phase E file.

## Source of truth

- Selection and recovery orchestration: `app/studio/src/App.tsx`.
- Teacher-facing annotation and Review Set controls: `app/studio/src/components/InspectionPanel.tsx` and `app/studio/src/components/ReviewSetPanel.tsx`.
- Screenshot capture and crop: `app/studio/src/hooks/useScreenshotAnnotation.ts`.
- Screenshot persistence and exact-owner replacement: `app/studio/src/lib/review-screenshots.ts` and `app/server/lib/review-screenshots.ts`.
- Review persistence, migration, and immutable screenshot ownership: `app/studio/src/lib/review-set-storage.ts`.
- Bounded Codex packet: `app/studio/src/lib/review-set.ts`.

## Fragile areas / watchouts

- A screenshot preserved through Relink intentionally keeps its original node owner. It can be viewed or removed, but not cropped or retaken as if it belonged to the new target.
- Keep teacher-drawn area geometry intact when refreshing the mapped owner element.
- Never allow review/session/project mutation to race an in-flight screenshot replacement.
- Keep proposal-only source diagnostics separate from visual-anchor freshness.
- Untracked `projects/processed/**/source 2/` folders remain unrelated local intake artifacts and were deliberately excluded.

## Next prompt should assume

- Branch: `codex/studio-roadmap-phases`.
- Phases A through E are implemented and pushed.
- Phase E implementation commit: `a1abbb56`.
- The next roadmap boundary is Phase F: explicit preview preflight and teacher-facing recovery without restoring the old technical dashboard.
- Preserve the matte, restrained, project-neutral interface and current source-of-truth boundaries.

## What still needs validation

- Phase E completed its local regression gate. Cross-tab screenshot replacement remains last-write-wins and should not be expanded without a revision contract.

## Known risks

- Review Sets remain browser-local and expire after seven days unless exported.
- Two Studio tabs can still replace the same exact-owner screenshot last-write-wins; the single-tab UI lock does not create a server revision history.
- Repository-wide typecheck remains red for unrelated legacy course-builder errors.

## Exact next command

`sed -n '1,260p' app/studio/src/components/PreviewPane.tsx`

## Exact next file to open

`app/studio/src/components/PreviewPane.tsx`

## Do not do next / warnings

- Do not bring back Preview Health, source-file lists, or other technical dashboard cards in the normal review rail.
- Do not classify secure-capture media fallbacks as learner-course defects.
- Do not touch learner-course source or generated output for Studio roadmap work.
- Do not stage or delete unrelated untracked intake snapshots.
