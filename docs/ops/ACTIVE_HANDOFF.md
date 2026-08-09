# Handoff

- Project: `repo-wide`
- Task: Add a compact Inspect workflow to the standalone workspace preview and connect selections to Studio's existing Inspector and Review Set.
- Status: complete on `codex/studio-workflow-v2`; no learner-course artifact was changed.

## Files changed

- Bridge and server: `app/shared/preview-bridge.ts`, `app/server/preview-bridge-runtime.ts`.
- Studio: `app/studio/src/hooks/usePreviewScrollSync.ts`, `app/studio/src/App.tsx`, `app/studio/src/components/Topbar.tsx`.
- Verification: `scripts/tests/preview-security.test.ts`, `e2e/specs/inspection.spec.ts`.
- Documentation: `README.md`, `ARCHITECTURE.md`, `docs/ops/FAST_PATHS.md`, `docs/plans/2026-08-04-studio-workflow-v2.md`, `docs/ops/ACTIVE_HANDOFF.md`, and `docs/ops/ARCHIVED_HANDOFFS.md`.

## What changed

- **Open preview** still uses the browser's normal separate-tab behavior, so Studio remains open and the in-app browser does not need to allow a scripted popup.
- A standalone workspace preview now shows a compact top-level-only toolbar with **Inspect** and **Return to Studio**. Embedded Studio previews do not receive this toolbar.
- Inspect mode stays synchronized between Studio and the full preview. A selected course element travels into the existing repository-side resolver, Inspector, and Review Set; no second handoff format was introduced.
- Each connected preview receives one short-lived session token. The early-injected bridge removes the token from the visible URL, transfers a private `MessageChannel` only to the exact Studio origin, and clears `window.opener` before course scripts execute.
- A directly opened preview can still highlight an element locally, but its status no longer claims a Studio connection until Studio acknowledges the private channel.

## Why this changed

- The teacher needs the larger full-page course view for visual review while retaining the source-aware Inspect and multi-annotation workflow already built into Studio.
- The first scripted-popup implementation passed Chromium automation but was blocked by the Codex in-app browser. Preserving the native link action fixes that compatibility problem without weakening the preview boundary.

## Source of truth

- Protocol and bounded message validation: `app/shared/preview-bridge.ts`.
- Early-injected preview behavior and standalone controls: `app/server/preview-bridge-runtime.ts`.
- Studio connection, mode synchronization, and selection routing: `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Workflow contract: `docs/plans/2026-08-04-studio-workflow-v2.md`.
- Course content remains owned by each project's declared canonical sources and build driver. No file under `projects/**` changed.

## Fragile areas / watchouts

- `app/server/lib/preview-inspection.ts` must continue injecting the bridge before every course script. The short-lived opener is safe only because the bridge transfers the channel and clears it before course code runs.
- The successful link click deliberately changes `rel` from the safe fallback to `opener` for that one tokenized navigation. Do not remove this without an equivalent browser-compatible handshake.
- Keep exact loopback-origin checks, bounded message validators, the one-time token, and private ports. Do not introduce wildcard messaging, iframe DOM reads, URL-carried selection text, or persistent token storage.
- The toolbar must remain top-level-only so it never covers the embedded Studio preview.

## Next prompt should assume

- Branch: `codex/studio-workflow-v2`.
- The standalone mini inspector is implemented and connected to the same Inspector and Review Set as embedded inspection.
- Social and English learner artifacts were not modified. Social 10 remains proposal-only and generated workspace output remains non-canonical.
- The Studio development server is available through `npm run studio:codex`.

## What still needs validation

- Optional teacher acceptance: in the live full preview, click **Inspect**, select a real course element, return to Studio, and confirm the resolved target and Review Set note match the intended surface.
- Browser-owned screenshot consent remains a separate manual step; the mini inspector does not silently capture screenshots.

## Known risks

- Repository-wide `npm run typecheck` remains blocked by established unrelated errors in legacy ELA, Forensics, Social 20, LLM dependency, and English-builder files. No touched-file diagnostic was added.
- Opening a newer standalone workspace preview replaces the previous standalone connection for that preview mode; the older page remains usable but no longer sends selections to Studio.

## Verification run

- Passed: `npm run build:studio`.
- Passed: `npm run test:studio-inspection` (30 tests).
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` (14 tests), including selection transfer and Return to Studio.
- Passed: `npm run test:e2e:smoke` (1 test).
- Passed: focused `git diff --check`.
- Live Codex in-app-browser acceptance passed: native separate-tab opening, token removal, connected toolbar, and Studio-to-preview Inspect synchronization. No new app-origin console error appeared after a clean reload.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`app/server/preview-bridge-runtime.ts`

## Do not do next / warnings

- Do not hand-edit generated `projects/<slug>/workspace/**` as part of this Studio feature.
- Do not add the mini toolbar to embedded iframe previews.
- Do not treat a visual selection as proof that a generated artifact is a safe primary edit target; keep using the resolver and project metadata.
