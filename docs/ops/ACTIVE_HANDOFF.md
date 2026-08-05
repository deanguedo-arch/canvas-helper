# Handoff

- Project: `repo-wide`
- Task: Implement the focused Studio workflow upgrade: a compact course build brief, source workbench, safe Review Set re-check loop, and bounded preview health.
- Status: complete on `codex/studio-workflow-v2`; no learner-course artifact was changed.

## Files changed

- Shared/preview/server: `app/shared/course-build-brief.ts`, `app/shared/inspection.ts`, `app/shared/preview-bridge.ts`, `app/server/routes/course-build-brief.ts`, `app/server/lib/preview-inspection.ts`, `app/server/preview-bridge-runtime.ts`, `app/server/studio-server.ts`.
- Studio: `app/studio/src/App.tsx`, `app/studio/src/components/CourseBuildBriefPanel.tsx`, `app/studio/src/components/PreviewHealthPanel.tsx`, `app/studio/src/components/InspectionPanel.tsx`, `app/studio/src/components/InspectorPanel.tsx`, `app/studio/src/components/ReviewSetPanel.tsx`, `app/studio/src/hooks/useCourseBuildBrief.ts`, `app/studio/src/hooks/usePreviewScrollSync.ts`, `app/studio/src/hooks/useProjectCommands.ts`, `app/studio/src/lib/course-build-brief.ts`, `app/studio/src/lib/review-set.ts`, and `app/studio/src/styles.css`.
- Verification/docs: `scripts/tests/course-build-brief.test.ts`, Inspector tests, `e2e/specs/inspection.spec.ts`, `docs/plans/2026-08-04-studio-workflow-v2.md`, `ARCHITECTURE.md`, `README.md`, and `docs/ops/FAST_PATHS.md`.

## What changed

- Studio now presents a bounded doctor-derived Course Build Brief before a teacher starts editing or handing off work.
- Exact direct-workspace selections show a bounded verified source excerpt; generated and proposal-only projects never receive an invented source excerpt or edit target.
- Inspect can copy the verified target and reveal the selected opaque node in the preview without iframe-DOM access.
- Review Set can reveal a saved selection, request a fresh changed-surface click, confirm only the same safe route, and run Workspace Verify only after that confirmation.
- A Verify success explicitly remains a workspace command result, not a claim that the learner-facing change is finished.
- Preview Health records at most six bounded runtime/asset signals locally and never puts them in a packet.

## Why this changed

- The teacher needs a faster, lower-token route from a visible Studio surface into an evidence-backed Codex task.
- Existing course drivers already know enough to distinguish direct editing, factory rebuilds, and proposal-only work. The UI now makes that distinction usable without pretending to solve missing ownership.

## Verification run

- Passed: `npm run test:studio-inspection` (29), `npm run build:studio`, `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` (13), `npm run test:e2e:smoke`, and `git diff --check`.
- Passed: `npm run course:doctor -- --project forensics35`, `npm run course:doctor -- --project ela20-1-modern-play-crucible`, and `npm run course:doctor -- --project social10-1-related-issue-1-option-2` (proposal-only as intended).
- `npm run typecheck` still has only the established unrelated legacy errors in ELA, Forensics, Social 20, and English-builder code; no touched-file diagnostic was added.
- Live Studio check at `http://127.0.0.1:5173/` confirmed the Social 10 build brief visibly reports `proposal-only-v1`, no safe editable source, and the declared rebuild/validation route.

## Source of truth

- Workflow contract: `docs/plans/2026-08-04-studio-workflow-v2.md`.
- Course ownership and doctor rules: `scripts/lib/course-authoring/context.ts`.
- Inspection resolver and bridge boundary: `app/server/lib/preview-inspection.ts`, `app/shared/preview-bridge.ts`, and `app/studio/src/hooks/usePreviewScrollSync.ts`.

## Fragile areas / watchouts

- Preserve the isolated preview origin and private `MessageChannel`; never restore direct iframe DOM reads or wildcard messaging.
- Source excerpts remain direct-workspace-only, bounded, and excluded from every copied packet.
- Route re-check does not prove instructional quality. Keep the explicit learner-preview check after Workspace Verify.

## Next prompt should assume

- Branch: `codex/studio-workflow-v2`.
- The existing Social/English patterns remain untouched; current generated workspace output is still not canonical source.
- ChatGPT Pro may advise from a copied brief or handoff, but Codex verifies the local route and tests before implementation.

## What still needs validation

- A teacher should use the new loop on a real direct or factory-backed course change, then decide whether Review Set’s five-item cap is still the right practical boundary.
- Browser-tab screenshot consent remains a separate browser-owned manual acceptance check from the pre-existing Inspector workflow.

## Known risks

- Social 10 remains proposal-only. Do not make it editable through Studio until a separately verified ownership adapter and zero-learner-content-diff rebuild proof exist.
- A Science driver still needs real source archives and its representative-unit decision; no generic factory should be inferred from this UI work.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`docs/plans/2026-08-04-studio-workflow-v2.md`

## Do not do next / warnings

- Do not hand-edit `projects/<slug>/workspace/**` when its brief says generated or proposal-only.
- Do not put source excerpts, screenshots, or Preview Health entries into a ChatGPT/Codex packet.
- Do not treat a passed Workspace Verify as a substitute for viewing the revised learner experience.
