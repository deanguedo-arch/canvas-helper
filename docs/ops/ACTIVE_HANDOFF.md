# Handoff

- Project: `repo-wide`
- Task: Complete Canvas Studio roadmap Phase D: a bounded, named local Review Set workbench.
- Status: complete, committed as `a7501627`, and pushed to `origin/codex/studio-roadmap-phases`.

## Files changed

- `app/studio/src/App.tsx`
- `app/studio/src/components/InspectorPanel.tsx`
- `app/studio/src/components/ReviewSetPanel.tsx`
- `app/studio/src/lib/review-set-storage.ts`
- `app/studio/src/lib/review-set.ts`
- `app/studio/src/precision-editor.css`
- `e2e/specs/inspection.spec.ts`
- `scripts/tests/preview-security.test.ts`
- `scripts/tests/studio-project-continuity.test.ts`
- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Each project can keep up to eight named local Review Sets while only one bounded set is active for Codex.
- Teachers can reorder annotations and screenshots, label and prioritize items, duplicate or move items, and merge queued work when packet limits permit.
- Readiness badges identify missing notes, missing screenshots, stale selections, selections that need relinking, and ready items.
- The active set shows its item and byte count and can be copied, downloaded as Markdown, or backed up and restored through validated JSON.
- All named sets for one project share a bounded screenshot session; restored screenshot paths remain owner-checked.
- No learner-course file under `projects/<slug>/workspace`, `raw`, or `exports` changed.

## Why this changed

- Longer reviews need several small implementation batches instead of one oversized Codex prompt.
- Review evidence must remain understandable, portable, and safely local without weakening source or screenshot ownership checks.

## Verification run

- Passed: `npm run test:studio-inspection` — 55/55.
- Passed: `npm run build:studio`.
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` — 23/23.
- Passed: `npm run test:e2e:smoke` — 1/1.
- Passed: `npm run test:e2e:project -- --project e2e-fixture` — 1/1.
- Passed: `git diff --check`.
- Baseline only: `npm run typecheck` still reports established unrelated errors in legacy ELA, Forensics, Social 20, and English-builder files; no diagnostic points into a Phase D file.

## Source of truth

- Workbench persistence, migration, ownership, and backup validation: `app/studio/src/lib/review-set-storage.ts`.
- Review item bounds and Codex/Markdown packet content: `app/studio/src/lib/review-set.ts`.
- Teacher-facing workbench controls and readiness states: `app/studio/src/components/ReviewSetPanel.tsx`.
- Workbench orchestration: `app/studio/src/App.tsx`.

## Fragile areas / watchouts

- Keep one shared screenshot session per project workbench so moving an item does not break screenshot ownership.
- Never accept imported screenshot paths outside the exact project/session/annotation/node ownership chain.
- Keep the existing limits aligned: eight named sets per project, five items per set, three screenshots per item, fifteen screenshots per project session, and the bounded Codex packet size.
- Duplicate intentionally omits screenshots because one local PNG cannot safely claim two annotation owners.
- Untracked `projects/processed/**/source 2/` folders remain unrelated local intake artifacts and were deliberately excluded.

## Next prompt should assume

- Branch: `codex/studio-roadmap-phases`.
- Phases A through D are implemented and pushed.
- Phase D implementation commit: `a7501627`.
- The next roadmap boundary is Phase E: annotation precision, relinking, retake/replace, concern labels, and resolution state.
- Preserve the matte, restrained, project-neutral interface and current source-of-truth boundaries.

## What still needs validation

- Phase D has completed its local regression gate. External browser-profile portability is intentionally limited to explicit JSON backup and restore.

## Known risks

- Review Sets remain browser-local and expire after seven days unless exported.
- One project workbench is limited to fifteen local screenshots across all of its named sets; teachers may need to finish or clear a batch before capturing more.
- Repository-wide typecheck remains red for unrelated legacy course-builder errors.

## Exact next command

`sed -n '1,320p' app/studio/src/hooks/useScreenshotAnnotation.ts`

## Exact next file to open

`app/studio/src/hooks/useScreenshotAnnotation.ts`

## Do not do next / warnings

- Do not touch learner-course source or generated output for Studio roadmap work.
- Do not weaken packet, source-recheck, capture, or screenshot-ownership limits while adding relinking and replacement.
- Do not stage or delete unrelated untracked intake snapshots.
