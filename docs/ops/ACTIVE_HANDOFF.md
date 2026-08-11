# Handoff

- Project: `repo-wide`
- Task: Complete Canvas Studio roadmap Phase B: polish the core review loop while preserving the verified precision shell and course boundaries.
- Status: complete, committed as `ccdb916d`, and pushed to `origin/codex/studio-roadmap-phases`.

## Summary

- Studio and full preview now share explicit capture, cancel, retry, save, remove, undo, show, and copy feedback.
- The latest asynchronous action owns the visible outcome, so an older full-preview response cannot replace newer teacher feedback.
- The latest annotation save or removal can be undone for ten seconds; screenshot files are retained only while a removed item remains recoverable.
- Focus/Split, device, zoom, and Review Set visibility now persist separately for each project.
- Screenshot capture can be canceled for a draft or a saved annotation, and error states expose a clear retry action.
- **Done**, `Escape`, full-preview **Return to Studio**, and Review Set continuity are covered by browser tests.
- No learner-course file under `projects/<slug>/workspace`, `raw`, or `exports` changed.

## Files changed

- `app/studio/src/App.tsx`
- `app/studio/src/components/AnnotationModeBar.tsx`
- `app/studio/src/components/InspectionPanel.tsx`
- `app/studio/src/components/InspectorPanel.tsx`
- `app/studio/src/components/ReviewSetPanel.tsx`
- `app/studio/src/hooks/useLayoutPreferences.ts`
- `app/studio/src/hooks/useScreenshotAnnotation.ts`
- `app/studio/src/lib/storage.ts`
- `app/studio/src/precision-editor.css`
- `app/shared/preview-bridge.ts`
- `app/server/preview-bridge-runtime.ts`
- `scripts/tests/preview-security.test.ts`
- `e2e/specs/inspection.spec.ts`
- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## Verification run

- Passed: `npm run test:studio-inspection` — 52/52.
- Passed: `npm run build:studio`.
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` — 18/18.
- Passed: `npm run test:e2e:smoke` — 1/1.
- Passed: `npm run test:e2e:project -- --project e2e-fixture` — 1/1.
- Passed: `git diff --check`.
- Baseline only: `npm run typecheck` still reports established unrelated errors in legacy ELA, Forensics, Social 20, and English-builder files; no diagnostic points into a Phase B file.

## Source of truth

- Review-loop orchestration and latest-action feedback: `app/studio/src/App.tsx`.
- Per-project layout persistence: `app/studio/src/hooks/useLayoutPreferences.ts` and `app/studio/src/lib/storage.ts`.
- Teacher-facing Review Set feedback and undo controls: `app/studio/src/components/ReviewSetPanel.tsx`.
- Shared full-preview action contract: `app/shared/preview-bridge.ts`.
- Full-preview toolbar and stale-result guard: `app/server/preview-bridge-runtime.ts`.
- Screenshot ownership, packet bounds, and canonical source-resolution rules remain in their existing server and shared modules.

## Fragile areas / what might drift

- Keep the bridge request ID bounded and echoed by Studio; removing it would reintroduce stale full-preview feedback.
- Removed screenshots are intentionally reclaimed only after undo expires or a later undo replaces the pending one.
- Per-project layout entries are browser-local, bounded to 100 projects, and fall back safely when storage is blocked.
- Do not move course state into Studio storage or style inside the isolated course iframe.
- Untracked `projects/processed/**/source 2/` folders remain unrelated local intake artifacts and were deliberately excluded from both Phase B commits.

## Known risks / follow-up

- Undo currently covers annotation save/remove, not note edits or individual screenshot removal; broader history belongs in the bounded Review Set workbench phase.
- The repository-wide typecheck baseline remains noisy and is not evidence of a Phase B regression.
- Phase C must replace destructive cross-project Review Set switching with separate per-project temporary sets before adding recents and favorites.

## Next prompt assumptions

- Branch: `codex/studio-roadmap-phases`.
- Phase A/B2 implementation: `741b5282`.
- Phase B implementation: `ccdb916d`.
- The next roadmap boundary is Phase C: project finding and per-project continuity.
- Keep the `uncodixfy` matte, restrained visual foundation; do not add gradients, glass effects, excessive pills, or subject-specific UI.

## Exact next command

`rg -n "selectedSlug|Review Set|project" app/studio/src app/shared scripts/tests e2e/specs/inspection.spec.ts`

## Exact next file to open

`app/studio/src/components/Topbar.tsx`

## Do not do next / warnings

- Do not touch learner-course source or generated output for Studio roadmap work.
- Do not restore a single global Review Set once Phase C introduces per-project sets.
- Do not expose repository paths or source-resolution jargon in the teacher-facing project picker.
- Do not stage or delete unrelated untracked intake snapshots.
