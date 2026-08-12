# Handoff

- Project: `repo-wide`
- Task: Complete and publish all Canvas Studio evolution roadmap phases A through H.
- Status: complete; Phase H implementation is commit `1ad3cc21` and is pushed to `origin/codex/studio-roadmap-phases`.

## Files changed

- `app/studio/src/App.tsx`
- `app/studio/src/components/WhatsNewPanel.tsx`
- `app/studio/src/hooks/useInspectionDraft.ts`
- `app/studio/src/lib/inspection-draft.ts`
- `app/studio/src/lib/review-workbench.ts`
- `app/studio/src/lib/studio-release-notes.ts`
- `app/shared/studio-quality.ts`
- `app/shared/preview-bridge.ts`
- `app/shared/preview-path.ts`
- `app/server/preview-bridge-runtime.ts`
- `scripts/lib/studio-release.ts`
- `scripts/run-studio-release.ts`
- `e2e/playwright.release.config.ts`
- `e2e/lib/studio-fixtures.ts`
- `e2e/specs/inspection.spec.ts`
- `projects/e2e-studio-secondary/`
- `docs/releases/2026-08-11-canvas-studio.md`
- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`

## What changed

- All roadmap phases A through H are implemented and published on `codex/studio-roadmap-phases`.
- Phase H moved selection lifecycle and cancellation into `useInspectionDraft` and exposed Review Set internals to `App.tsx` through one `review-workbench.ts` facade.
- Cross-boundary Review Set, screenshot, preview capability, bridge, packet, and storage limits now originate in `app/shared/studio-quality.ts`; tests protect byte/code-unit distinctions and runtime parity.
- Neutral descriptor-driven fixtures cover project switching and encoded-path behavior without branching on a real learner course.
- Studio now includes an accessible, responsive **What’s new** dialog backed by the checked-in release manifest and release note.
- `npm run test:studio-release` uses local installed tools, an owned loopback port, `forbidOnly`, fail-fast ordered gates, and a stable-tree SHA-256 source fingerprint.
- No learner-course source, workspace, or generated export changed. `projects/e2e-studio-secondary/` is a neutral automation fixture only.

## Why this changed

- Canvas Studio needed to remain simple for a teacher while becoming safer to extend, easier to verify, and less dependent on one oversized component or duplicated limits.
- Shared releases now have reproducible evidence for the exact source state tested, rather than relying on an older HEAD commit or an informal collection of commands.

## Verification run

- Passed: `npm run test:studio-release`.
  - 85/85 focused Studio contracts.
  - Studio production build.
  - 50/50 complete inspection E2E tests.
  - 1/1 platform smoke.
  - 1/1 strict neutral-project contract.
- Passed: stable-tree release report schema `canvas-helper-studio-release-v2`; 499 in-scope files fingerprinted with SHA-256, `sourceChangedDuringRun: false`, `ok: true`.
- Passed: `npm run test:authoring-context` — 16/16.
- Passed: `npm run build:studio`.
- Passed: `git diff --check`.
- Passed: independent Terra Max red-team re-review after all three review rounds; final verdict: `PASS`.
- Baseline only: `npm run typecheck` still reports established unrelated diagnostics in legacy ELA, Forensics, Social 20, English-factory, and PDF extraction builders; none points into Phase H files.

## Source of truth

- Roadmap and phase record: `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`.
- Studio application orchestration: `app/studio/src/App.tsx`.
- Inspection lifecycle: `app/studio/src/hooks/useInspectionDraft.ts` and `app/studio/src/lib/inspection-draft.ts`.
- Review Workbench boundary: `app/studio/src/lib/review-workbench.ts`.
- Cross-boundary numeric contract: `app/shared/studio-quality.ts`.
- Preview message/runtime contract: `app/shared/preview-bridge.ts`, `app/shared/preview-path.ts`, and `app/server/preview-bridge-runtime.ts`.
- Release gate: `scripts/run-studio-release.ts`, `scripts/lib/studio-release.ts`, and `e2e/playwright.release.config.ts`.
- Current teacher-facing release: `app/studio/src/lib/studio-release-notes.ts` and `docs/releases/2026-08-11-canvas-studio.md`.

## Fragile areas / watchouts

- Keep capability-token, standalone-session, and Review Set session limits distinct even when their current numeric values match.
- Update `STUDIO_RELEASE_SOURCE_PATHS` when a new source root becomes part of the Studio release boundary; keep generated `dist`, runtime reports, and Playwright output excluded.
- Keep `App.tsx` on the Review Workbench facade instead of importing storage, screenshot, packet, or capture modules directly.
- Preserve abort-on-new-selection, abort-on-project-change, and abort-on-unmount behavior in the inspection hook.
- Keep release-manifest headings synchronized with the durable release note.
- Unrelated `projects/processed/**/source 2/`, resource intake, and duplicate `test-results 2/` folders remain local and deliberately untracked.

## Next prompt should assume

- Branch: `codex/studio-roadmap-phases`.
- Phases A through H are complete and pushed.
- Phase H implementation commit: `1ad3cc21`.
- The final Terra Max verdict is `PASS`.
- Canvas Studio remains project-neutral; no learner course was edited to complete the roadmap.
- New Studio work should be a new scoped feature or maintenance task, not an unfinished roadmap phase.

## What still needs validation

- No Phase A-H validation remains.
- A future release should rerun `npm run test:studio-release` after any Studio, preview, Review Set, fixture, or release-gate source changes.

## Known risks

- Repository-wide typecheck remains red for unrelated legacy builder diagnostics and should be handled as a separate maintenance task.
- The release report is intentionally ignored runtime evidence; durable release facts live in this handoff, the roadmap, and the release note.
- Browser performance still depends on host load, so the suite enforces explicit budgets with recovery margins rather than promising identical latency on every machine.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`

## Do not do next / warnings

- Do not edit generated learner-course output to change Studio behavior.
- Do not reintroduce course-specific feature branches into shared Studio or server code.
- Do not bypass the Review Workbench facade or duplicate cross-boundary limits outside `app/shared/studio-quality.ts`.
- Do not stage or delete the unrelated untracked intake, resource, or duplicate test-result folders.
