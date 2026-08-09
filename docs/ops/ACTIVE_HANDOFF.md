# Handoff

- Project: `repo-wide`
- Task: Replace Studio's technical Inspector dashboard with one simple annotation workflow shared by embedded and full-screen previews.
- Status: complete on `codex/studio-workflow-v2`; no learner-course artifact was changed.

## Files changed

- Protocol and preview runtime: `app/shared/preview-bridge.ts`, `app/server/preview-bridge-runtime.ts`.
- Studio state and bridge: `app/studio/src/App.tsx`, `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Studio UI: `app/studio/src/components/InspectionPanel.tsx`, `app/studio/src/components/InspectorPanel.tsx`, `app/studio/src/components/ReviewSetPanel.tsx`, `app/studio/src/components/Topbar.tsx`, `app/studio/src/styles.css`.
- Verification: `scripts/tests/preview-security.test.ts`, `e2e/specs/inspection.spec.ts`.
- Documentation: `README.md`, `ARCHITECTURE.md`, `docs/ops/FAST_PATHS.md`, `docs/plans/2026-08-04-studio-review-set.md`, `docs/plans/2026-08-04-studio-workflow-v2.md`, `docs/ops/ACTIVE_HANDOFF.md`, `docs/ops/ARCHIVED_HANDOFFS.md`.

## What changed

- The right rail now contains only **New annotation** and **Review Set**. Course Build Brief, Preview Health, Source Files, ownership labels, commands, and raw packet text are no longer rendered there.
- The teacher flow is now: Inspect, select, write a note, save, repeat, then copy the complete Review Set.
- Review Set preparation is automatic after a save or note edit. Copy remains disabled until current repository-side source routes pass revalidation.
- The standalone preview now exposes the same shared Review Set: note, save, edit, remove, clear, and copy are available without returning to Studio.
- Studio remains the only Review Set owner. The preview receives bounded summaries and the prepared packet through the existing private channel; it receives no filesystem access or write authority.

## Why this changed

- The teacher uses Studio as a visual annotation surface, not a developer dashboard. Source-routing details are useful to Codex in the copied handoff but were noise in the normal course-review workflow.

## Source of truth

- Review Set state, automatic revalidation, and packet creation: `app/studio/src/App.tsx` and `app/studio/src/lib/review-set.ts`.
- Bounded cross-origin message contract: `app/shared/preview-bridge.ts`.
- Top-level full-preview controls: `app/server/preview-bridge-runtime.ts`.
- Visible teacher workflow: `app/studio/src/components/InspectionPanel.tsx` and `app/studio/src/components/ReviewSetPanel.tsx`.
- Course content remains owned by each project's declared canonical sources and build driver. No file under `projects/**` changed.

## Fragile areas / watchouts

- Keep bridge injection ahead of course scripts so the one-time opener can be cleared before untrusted course code runs.
- Keep full-preview Review Set actions standalone-only; an embedded course iframe must not be able to invoke them.
- Keep exact-origin checks, private `MessageChannel` ports, bounded validators, and top-level-only controls.
- Do not expose source paths or raw packet text in the visible annotation UI; those details belong only in the bounded copied handoff.

## Next prompt should assume

- Branch: `codex/studio-workflow-v2`.
- Studio is running at `http://127.0.0.1:5173/` through `npm run studio:codex`.
- Embedded and standalone previews share one temporary Review Set with a five-item cap and automatic route revalidation.
- Social 10 remains proposal-only; its generated workspace was not modified or promoted to canonical source.

## What still needs validation

- Optional teacher acceptance: open the full preview from Studio, collect the first real multi-item Review Set, paste it into a Codex task, and confirm the resulting edits match the selected surfaces.

## Known risks

- Repository-wide `npm run typecheck` still reports established unrelated errors in legacy ELA, Forensics, Social 20, LLM dependency, and English-builder files. The Studio build and touched inspection boundary pass.
- Opening a newer standalone workspace preview replaces the previous standalone connection for that mode; the older page remains viewable but cannot update the shared set.
- Screenshot capture remains Studio-only because the isolated preview retains `Permissions-Policy: display-capture=()`.

## Verification run

- Passed: `npm run build:studio`.
- Passed: `npm run test:studio-inspection` (30 tests).
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` (13 tests).
- Passed: `npm run test:e2e:smoke` (1 test).
- Passed: live in-app-browser inspection on Social 10: select, note, save, automatic preparation, and simplified visible rail.
- Baseline only: `npm run typecheck` reports the established unrelated errors listed above.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`app/studio/src/App.tsx`

## Do not do next / warnings

- Do not hand-edit generated `projects/<slug>/workspace/**` as part of this Studio feature.
- Do not add the Review Set controls inside embedded course iframes.
- Do not treat a visual selection as proof that generated output is a safe primary edit target; keep using the resolver and project metadata.
