# Handoff

- Project: `repo-wide`
- Task: Add safe teacher-facing direct editing to Canvas Studio and Full Preview.
- Status: complete and release-validated on `codex/studio-direct-editing-v1`; ready for a teacher pilot.

## Files changed

- `app/shared/course-editing.ts`
- `app/server/lib/course-editing.ts`
- `app/server/routes/course-edits.ts`
- `scripts/lib/course-editing/html.ts`
- `scripts/lib/course-editing/overrides.ts`
- `app/studio/src/hooks/useCourseEditing.ts`
- `app/studio/src/lib/course-edit-storage.ts`
- `app/studio/src/components/CourseEditPanel.tsx`
- `app/studio/src/components/EditModeBar.tsx`
- `app/studio/src/App.tsx`
- `app/server/preview-bridge-runtime.ts`
- `app/shared/preview-bridge.ts`
- English and Social owning builders
- bounded Studio project/page discovery and its regression contract
- focused contracts, inspection E2E, release notes, architecture, workflow, and project-fixture metadata

## What changed

- Added a dedicated blue Edit mode in Studio and Full Preview.
- Added safe editing for supported text, links, images, alt text, titles/captions, and curated visual tokens.
- Added per-course Draft Changes that persist across reload and Studio/Full Preview, with before/after, edit, remove, reorder, batch apply, and Undo last batch.
- Added server-owned opaque target resolution, digest revalidation, sanitization, transactional checkpoints, rollback, rebuild, validation, and export-staleness tracking.
- Direct courses update declared canonical workspace pages, including multi-page batches.
- English and explicitly onboarded Social courses store course-only overrides in `meta/studio-edits.json`; stable generated edit IDs let builders replay them after every rebuild.
- Unsupported, stale, blocked, proposal-only, runtime-generated, or unmapped content remains annotation-only.
- Studio project discovery now seeds declared entrypoints, skips duplicate copied resource trees, and bounds fallback traversal so one accidental archive cannot freeze the course picker.

## Why this changed

- Teachers need routine text and visual corrections to appear in the working course without copying every small request into Codex.
- Generated course ownership and protected raw/export boundaries still need to remain trustworthy.
- Draft review and one transactional apply reduce accidental partial edits and repeated context use.

## Source of truth

- Contracts: `app/shared/course-editing.ts`.
- Transaction and adapter orchestration: `app/server/lib/course-editing.ts`.
- Generated edit identity and replay: `scripts/lib/course-editing/`.
- Studio state and persistence: `app/studio/src/hooks/useCourseEditing.ts` and `app/studio/src/lib/course-edit-storage.ts`.
- Full Preview bridge: `app/shared/preview-bridge.ts` and `app/server/preview-bridge-runtime.ts`.

## Fragile areas / watchouts

- The preview must never provide or choose a filesystem path.
- Stable generated IDs deliberately fail closed if a builder changes the owned element structure.
- Generated apply/undo checkpoints copy workspace and meta state into ignored `.runtime` storage; retain the size/file ceilings.
- Social editing remains unavailable unless the manifest declares `social-related-issues-v1`, source resource IDs, and passes doctor.
- Raw imports and exports remain protected; Studio rebuild commands must not mutate them.
- Project HTML fallback discovery is bounded; pages beyond that ceiling need to be declared as canonical/entrypoint content instead of depending on an unbounded recursive scan.

## Next prompt should assume

- Direct Editing V1 is implemented and the complete Studio release gate passes: focused contracts, production build, 56 inspection E2E cases, platform smoke, and strict project contract.
- Independent red-team review returned `SHIP`; green-team review found the course-picker recursion problem, which is now fixed with bounded discovery and a measured 58-project load in roughly 114 ms on this checkout.
- Repository typecheck still reports only established unrelated legacy-builder diagnostics.
- No implementation work remains in Direct Editing V1.
- Unrelated untracked intake/resource/test-result folders still belong to the user and must remain unstaged.

## Verification run

- `npm run test:course-editing` — 11/11 passed.
- `npm run test:studio-inspection` — 106/106 passed before the bounded picker contract was added.
- `npm exec -- tsx --test scripts/tests/studio-project-html-scan.test.ts scripts/tests/studio-release-runner.test.ts` — 7/7 passed.
- `npm run build:studio` — passed.
- `npm run test:studio-release` — final pass: 108 focused, 56 inspection E2E, 1 platform smoke, 1 strict project contract.
- `npm run typecheck` — no Direct Editing diagnostics; established unrelated builder diagnostics remain.

## Known risks

- Real English and Social pilot edits require individually eligible projects; blocked or legacy manifests correctly remain annotation-only.
- Checkpoint storage is local and intentionally keeps only the latest successful batch per course.
- Repository-wide typecheck has established unrelated legacy-builder diagnostics.

## Exact next command

`npm run studio`

## Exact next file to open

`docs/releases/2026-08-12-canvas-studio-direct-editing.md`

## Do not do next / warnings

- Do not onboard blocked projects merely to expose Edit mode.
- Do not patch generated workspaces, raw imports, or exports as canonical sources.
- Do not stage unrelated `source 2`, resource intake, or `test-results 2` folders.
