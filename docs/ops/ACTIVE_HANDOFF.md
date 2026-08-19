# Handoff

- Project: `repo-wide`
- Task: Keep Canvas Studio Edit mode smooth while scrolling long learner pages.
- Status: implementation and local verification complete on `codex/studio-edit-scroll-performance-v1`; exact-head PR checks remain before merge.

## Summary

- The slow path was not course editing itself: the preview bridge reported a scroll state every animation frame and Studio synchronously serialized its complete scroll-position map into browser storage for each report.
- The learner bridge now coalesces noncritical scroll-state reports to one short bounded interval. Edit outlines, tooltips, and presentation overlays still move on the next animation frame, so the visible selection remains aligned while scrolling.
- Studio now retains the latest position in memory and batches browser-storage persistence. It flushes immediately when changing preview surfaces, unmounting a frame, or closing Studio, so the last useful position is not lost.
- A new browser regression simulates rapid scrolling, proves the final position remains restorable, and proves storage writes are bounded rather than one per frame.

## Files changed

- `app/server/preview-bridge-runtime.ts` — bounded scroll-state bridge cadence while preserving immediate outline positioning.
- `app/studio/src/hooks/usePreviewScrollSync.ts` — coalesced browser-storage persistence with immediate lifecycle flushes.
- `e2e/specs/inspection.spec.ts` — rapid-scroll persistence and outline-following regression coverage.

## Verification run

- `npm run test:e2e -- e2e/specs/inspection.spec.ts --grep 'scroll'` — passed 3/3.
- `npm run test:studio-inspection` — passed.
- `npm run verify:typecheck-baseline` — passed with only the established ten unrelated diagnostics.
- `npm run build:studio` — passed; the existing non-blocking bundle-size advisory remains.
- `npm run test:e2e -- e2e/specs/inspection.spec.ts` — passed 65/65.
- `git diff --check` — passed.

## Source of truth

- Scroll bridge and overlay behavior: `app/server/preview-bridge-runtime.ts`.
- Studio-side scroll persistence: `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Browser proof: `e2e/specs/inspection.spec.ts`.

## Known risks / follow-up

- An already-open Full Preview needs a normal reload after this update so its isolated learner bridge receives the revised runtime. Save or discard any unsaved draft before reloading.
- This reduces local Studio work during scrolling; it does not claim Brightspace, deployed-host, full-WCAG, delayed learner interaction, or cross-browser SCORM acceptance.
- The visible outline remains intentionally immediate. Do not move its positioning onto the persistence timer or it will appear to lag behind the learner content.

## Next prompt should assume

- Edit-mode scrolling stays responsive on long pages because position reporting and persistence are coalesced, while the selected outline stays attached to the current element.
- No learner course source, raw import, export, or draft content changed for this fix.

## Exact next command

`git status --short && git add app/server/preview-bridge-runtime.ts app/studio/src/hooks/usePreviewScrollSync.ts e2e/specs/inspection.spec.ts docs/ops/ACTIVE_HANDOFF.md docs/ops/ARCHIVED_HANDOFFS.md`

## Exact next file to open

`app/studio/src/hooks/usePreviewScrollSync.ts`

## Do not do next / warnings

- Do not reload a teacher's open Full Preview while an unsaved draft is active.
- Do not weaken the existing learner-DOM isolation or turn the scroll map into a per-frame browser-storage write again.
