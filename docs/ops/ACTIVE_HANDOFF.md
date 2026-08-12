# Handoff

- Project: `repo-wide`
- Task: Close Canvas Studio's visual-review-to-Codex loop with compact handoffs and persistent Verify Changes.
- Status: complete and release-verified; ready to publish the final implementation commit.

## Files changed

- `app/server/preview-bridge-runtime.ts`
- `app/shared/preview-bridge.ts`
- `app/studio/src/App.tsx`
- `app/studio/src/components/InspectorPanel.tsx`
- `app/studio/src/components/ReviewSetPanel.tsx`
- `app/studio/src/hooks/usePreviewScrollSync.ts`
- `app/studio/src/lib/review-set-storage.ts`
- `app/studio/src/lib/review-set.ts`
- `app/studio/src/lib/review-workbench.ts`
- `app/studio/src/precision-editor.css`
- `e2e/specs/inspection.spec.ts`
- `scripts/tests/codex-packet.test.ts`
- `scripts/tests/preview-security.test.ts`
- `scripts/tests/studio-project-continuity.test.ts`
- `scripts/tests/studio-quality.test.ts`
- `docs/audits/2026-08-12-canvas-studio-current-state-and-next-step-audit.md`
- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Added persisted `draft`, `sent`, `accepted`, and `reopened` states with backward-compatible storage and backup validation.
- Made a successful exact-packet copy the only automatic transition to `Sent`; manual clipboard fallback requires explicit teacher confirmation.
- Added **Verify changes**, **Show next change**, **Accept change**, and **Reopen for follow-up** in Studio and Full Preview.
- Kept sent and accepted evidence immutable until explicit reopen, and limited follow-up packets to new or reopened requests.
- Bound every handoff to packet, review-session, item, project, and storage-version identity before it can be marked sent.
- Added a two-phase copy reservation shared across Studio and Full Preview, including cross-surface locking and timeout cancellation.
- Kept one authoritative Full Preview connection and returned later Open Full Preview actions to it.
- Preserved original screenshot ownership after annotation relinking so Full Preview thumbnails remain valid.
- Updated the roadmap and independent-audit brief to mark the four post-roadmap priorities complete.

## Why this changed

- Copying a Review Set previously ended the visible workflow without proving which requests were sent or helping the teacher verify Codex's result.
- Compact packets reduce repeated context, while immutable sent evidence and explicit reopen protect the historical request.
- Copying from two surfaces needed one transaction boundary so a stale, delayed, blocked, or never-settling clipboard operation could not create false success or permanent locks.

## Verification run

- Passed: `npm run test:studio-release` — 93 focused contracts, production build, 55 inspection E2E tests, platform smoke, strict neutral-project contract, and stable source fingerprint.
- Passed targeted: relinked screenshot loading, one authoritative Full Preview, stalled Full Preview clipboard timeout, exact packet reservation, and old resolved-item exclusion.
- Passed final focused Full Preview check: same-course reuse, reload rejoin, target identity across Studio reload, and stale-token rejection after a project switch.
- Passed: `git diff --check`.
- Repository-wide `npm run typecheck -- --pretty false` retains only the established unrelated legacy-builder diagnostics; none point into this change set.
- Two independent Terra Max reviewers initially returned NO-SHIP and identified timeout, duplicate-preview, relinked-screenshot, reload-rejoin, stale-course focus, and cross-page identity risks. Those findings were fixed and regression-tested; both reviewers returned `SHIP` on the final diff.

## Source of truth

- Lifecycle and packet contract: `app/studio/src/lib/review-set.ts`.
- Persistence and migration: `app/studio/src/lib/review-set-storage.ts`.
- Transaction and lifecycle orchestration: `app/studio/src/App.tsx`.
- Full Preview protocol: `app/shared/preview-bridge.ts`, `app/studio/src/hooks/usePreviewScrollSync.ts`, and `app/server/preview-bridge-runtime.ts`.
- User-facing lifecycle: `app/studio/src/components/ReviewSetPanel.tsx`.
- Release behavior: `e2e/specs/inspection.spec.ts` and `npm run test:studio-release`.

## Fragile areas / watchouts

- Never mark an item sent before the exact reserved packet reaches the clipboard or the teacher confirms manual transfer.
- A timeout, blocked clipboard, preview close, project change, or packet change must unlock both Studio and Full Preview without marking sent.
- `screenshot.ownerNodeId` is immutable evidence ownership and may intentionally differ from a relinked item's current node.
- Sent and accepted items must remain out of follow-up packets until explicitly reopened.
- Full Preview shares Studio state; it must not become a second persistent owner.

## Next prompt should assume

- The post-roadmap visual, first-use, compact-handoff, and Verify Changes priorities are implemented and release-verified.
- No learner-course source, workspace, raw file, or export was changed.
- The next product decision should come from observed use in real course work, not another speculative feature phase.

## What still needs validation

- No in-scope implementation validation remains after the release gate, focused post-hardening checks, production build, and independent sign-off.
- Real course use should validate whether teachers understand `Sent`, `Accept`, and `Reopen for follow-up` without additional onboarding.

## Known risks

- Browser clipboard APIs remain environment-dependent; the manual packet path is the deliberate fallback.
- Local Review Sets remain bounded and expire under the existing local-retention policy.
- Repository-wide typecheck has unrelated legacy-course-builder failures outside Studio's source boundary.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`docs/audits/2026-08-12-canvas-studio-current-state-and-next-step-audit.md`

## Do not do next / warnings

- Do not add an embedded API assistant, cloud account system, unlimited Review Sets, or direct source editing without new evidence.
- Do not patch learner generated output from a visual selection; Codex must still investigate canonical ownership.
- Do not stage unrelated local intake, resource, duplicate source, or test-result folders.
