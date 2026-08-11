# Handoff

- Project: `repo-wide`
- Task: Complete Canvas Studio roadmap Phase C: project finding, per-project continuity, local intake entry, and preview reconnection.
- Status: complete, committed as `cddc6142`, and pushed to `origin/codex/studio-roadmap-phases`.

## Summary

- Studio now has a real searchable course finder with keyboard access, metadata status, recents, and optional favorites.
- Project selectors use declared metadata groups rather than subject-name rules.
- The selected HTML page and existing viewport state restore separately for each project.
- Every project now owns a separate temporary Review Set and screenshot session; switching courses no longer destroys unrelated review work.
- Preview startup exposes a bounded starting, ready, or unavailable state with an explicit reconnect action.
- **New Project** opens a short local-intake flow wired to the existing safe intake scan.
- Reload no longer replaces the remembered project while the course catalogue is still loading.
- No learner-course file under `projects/<slug>/workspace`, `raw`, or `exports` changed.

## Files changed

- `app/studio/src/App.tsx`
- `app/studio/src/components/NewProjectPanel.tsx`
- `app/studio/src/components/ReferencePicker.tsx`
- `app/studio/src/components/Topbar.tsx`
- `app/studio/src/components/WorkspacePicker.tsx`
- `app/studio/src/hooks/usePreviewRuntime.ts`
- `app/studio/src/hooks/useProjectCommands.ts`
- `app/studio/src/hooks/useProjectLibrary.ts`
- `app/studio/src/hooks/useProjects.ts`
- `app/studio/src/hooks/useStudioSelection.ts`
- `app/studio/src/lib/project-display.ts`
- `app/studio/src/lib/project-library.ts`
- `app/studio/src/lib/review-set-storage.ts`
- `app/studio/src/lib/storage.ts`
- `app/studio/src/lib/types.ts`
- `app/studio/src/precision-editor.css`
- `e2e/specs/inspection.spec.ts`
- `scripts/tests/studio-project-continuity.test.ts`
- `scripts/tests/preview-security.test.ts`
- `package.json`
- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## Verification run

- Passed: `npm run test:studio-inspection` — 54/54.
- Passed: `npm run build:studio`.
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` — 22/22.
- Passed: `npm run test:e2e:smoke` — 1/1.
- Passed: `npm run test:e2e:project -- --project e2e-fixture` — 1/1.
- Passed: `git diff --check`.
- Baseline only: `npm run typecheck` still reports established unrelated errors in legacy ELA, Forensics, Social 20, and English-builder files; no diagnostic points into a Phase C file.

## Source of truth

- Project finder and teacher-facing connection state: `app/studio/src/components/Topbar.tsx`.
- Recents and favorites contract: `app/studio/src/lib/project-library.ts`.
- Per-project Review Set storage and migration: `app/studio/src/lib/review-set-storage.ts`.
- Last-page and viewport continuity: `app/studio/src/lib/storage.ts` and `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Existing local intake contract: `app/studio/src/hooks/useProjects.ts` and `app/studio/src/lib/projects.ts`.

## Fragile areas / what might drift

- Keep Review Sets keyed by project; restoring a single global set would reintroduce destructive course switching.
- Do not apply a project fallback until the project catalogue has loaded.
- Search grouping must continue to use project metadata, not course or subject naming conventions.
- Review Set storage is browser-local, bounded to 40 projects, and expires after seven days.
- Untracked `projects/processed/**/source 2/` folders remain unrelated local intake artifacts and were deliberately excluded.

## Known risks / follow-up

- Favorites, recents, page choices, and temporary Review Sets are intentionally local to this browser profile.
- The New Project flow scans the existing local intake folder; it does not yet provide an operating-system file picker.
- Phase D is responsible for named and queued Review Set sessions, richer organization, and export/import.

## Next prompt assumptions

- Branch: `codex/studio-roadmap-phases`.
- Phases A, B, and C are implemented and pushed.
- Phase C implementation commit: `cddc6142`.
- The next roadmap boundary is Phase D: the stronger local Review Set workbench.
- Keep the matte, restrained visual foundation and project-neutral information architecture.

## Exact next command

`sed -n '1,280p' app/studio/src/components/ReviewSetPanel.tsx`

## Exact next file to open

`app/studio/src/components/ReviewSetPanel.tsx`

## Do not do next / warnings

- Do not touch learner-course source or generated output for Studio roadmap work.
- Do not remove existing packet-size, screenshot-ownership, or source-recheck safety checks while adding sessions.
- Do not stage or delete unrelated untracked intake snapshots.
