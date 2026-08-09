# Handoff

- Project: `repo-wide`
- Task: Preserve Studio's temporary Review Set when a teacher enters and exits the standalone full preview.
- Status: complete on `codex/studio-workflow-v2`; no learner-course artifact was changed.

## Files changed

- Return protocol and preview behavior: `app/shared/preview-bridge.ts`, `app/server/preview-bridge-runtime.ts`.
- Studio bridge and focus behavior: `app/studio/src/hooks/usePreviewScrollSync.ts`, `app/studio/src/App.tsx`.
- Verification: `scripts/tests/preview-security.test.ts`, `e2e/specs/inspection.spec.ts`.
- Documentation: `README.md`, `ARCHITECTURE.md`, `docs/ops/FAST_PATHS.md`, `docs/plans/2026-08-04-studio-workflow-v2.md`, `docs/ops/ACTIVE_HANDOFF.md`, `docs/ops/ARCHIVED_HANDOFFS.md`.

## What changed

- **Return to Studio** no longer replaces a connected preview tab with a second fresh Studio page.
- The standalone preview sends one bounded `preview-return-to-studio` event, asks the existing Studio window to focus, and closes itself.
- The original Studio instance therefore keeps its in-memory Review Set. Reopening the full preview resynchronizes the same saved annotations.
- If browser policy prevents the auxiliary tab from closing, the preview tells the teacher to close it manually; it does not navigate away and discard the visible route back to the original session.
- A directly opened preview with no Studio connection retains the trusted-origin navigation fallback.

## Why this changed

- Navigating the preview tab to Studio created a second empty Studio instance. Returning to the already-open owner preserves annotation continuity without adding permanent storage or expanding the preview's authority.

## Source of truth

- Temporary Review Set state and packet preparation: `app/studio/src/App.tsx` and `app/studio/src/lib/review-set.ts`.
- Bounded return event validation: `app/shared/preview-bridge.ts`.
- Top-level return control and close fallback: `app/server/preview-bridge-runtime.ts`.
- Standalone-only event handling: `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Course content remains owned by each project's declared canonical sources and build driver. No file under `projects/**` changed.

## Fragile areas / watchouts

- The Review Set is intentionally session-temporary. It survives opening and closing full previews while the original Studio tab stays open, but not a Studio reload or browser restart.
- Keep `preview-return-to-studio` standalone-only and `payload: null`; embedded course content must not be able to trigger Studio focus behavior.
- Keep exact-origin checks, the private one-time-token `MessageChannel`, early opener clearing, and top-level-only controls.
- Do not replace the close flow with persistent browser storage or navigate a connected preview into a second Studio instance.

## Next prompt should assume

- Branch: `codex/studio-workflow-v2`.
- Studio runs at `http://127.0.0.1:5173/` through `npm run studio:codex`.
- A connected full preview can save annotations, return to the original Studio with those items intact, and receive the same items when reopened.
- Review Set history remains deliberately temporary and Studio-owned.

## What still needs validation

- Optional teacher acceptance: collect several real course annotations, return to Studio, reopen the preview, and confirm the same set matches the expected teacher workflow.

## Known risks

- Repository-wide `npm run typecheck` still reports established unrelated errors in legacy ELA, Forensics, Social 20, LLM dependency, and English-builder files. No touched-file diagnostic was reported.
- A browser that refuses script-closing an auxiliary tab leaves the original Studio state safe but requires the teacher to close the preview tab manually.
- Opening a newer standalone workspace preview still replaces the previous standalone connection for that mode; the older page remains viewable but cannot update the shared set.

## Verification run

- Passed: `npm run build:studio`.
- Passed: `npm run test:studio-inspection` (30 tests).
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` (13 tests), including save, return, retained Studio item, reopen, and resynchronized preview item.
- Passed: `npm run test:e2e:smoke` (1 test).
- Passed: `git diff --check`.
- Passed: live in-app-browser load of the updated Studio and its connected top-level E2E preview controls.
- Baseline only: `npm run typecheck` reports the established unrelated errors listed above.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`app/server/preview-bridge-runtime.ts`

## Do not do next / warnings

- Do not add persistence merely to preserve preview open/close continuity; the existing Studio owner already provides that boundary.
- Do not hand-edit generated `projects/<slug>/workspace/**` as part of this Studio feature.
- Do not add return or Review Set controls inside embedded course iframes.
