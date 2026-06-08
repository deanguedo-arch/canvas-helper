# Handoff

- Project: `ela30-1-modern-drama`
- Task: Keep the `ela30-1-modern-drama` Writing Studio structure aligned with the current user-requested labels and grouping.
- Status: ready for validation

## Files changed
- `scripts/lib/ela-modern-drama.ts`
- `projects/ela30-1-modern-drama/workspace/index.html`
- `projects/ela30-1-modern-drama/meta/project.json`
- `scripts/lib/ela-thesis-builder-activity.ts`
- `scripts/lib/ela-critical-response-activity.ts`
- `scripts/tests/ela-modern-drama-frame.test.ts`
- `docs/ops/ACTIVE_HANDOFF.md`

## What changed
- Outer Writing Studio tab label is now `Thesis Workshop`.
- The prior `Thesis Control` activity remains available as the nested Text Knowledge question set, not a top-level replacement.
- Activity metadata and injected component wiring remain in project metadata for reusable rebuilds.
- This handoff checkpoint was refreshed so continuation starts with the current state.

## Why this changed
- The user requested this specific visible labeling hierarchy before continuing to other units.

## Source of truth
- Canonical editable entry: `scripts/lib/ela-modern-drama.ts`
- Canonical editable source for injected content:
  - `scripts/lib/ela-thesis-builder-activity.ts`
  - `scripts/lib/ela-critical-response-activity.ts`
- Canonical workspace output: `projects/ela30-1-modern-drama/workspace/index.html`
- Canonical project wiring: `projects/ela30-1-modern-drama/meta/project.json`

## Fragile areas / watchouts
- Regenerating the project rewrites `workspace/index.html`; keep all behavioral edits in `scripts/lib/ela-modern-drama.ts`.
- If the downloaded TSX activity sources change, regenerate the converted activity modules.
- `.stax` status can remain stale even after proof commands succeed.
- Completion/presentation state is currently implemented in browser storage and local preview scope.

## Next prompt should assume
- Continue with `ela30-1-modern-drama` as active.
- Keep the current shell styling, side bar collapse, progress, and content library/film room patterns.
- Do not commit or push without explicit request.

## What still needs validation
- Re-run focused project verification after any file edits: `npm run verify -- --project ela30-1-modern-drama --mode workspace`.
- Optional: run a STAX preflight for updated proof posture.

## Known risks
- Label drift can reappear if downstream generators or metadata are changed out of sync.
- Clipboard-dependent actions remain environment-sensitive in some browsers.

## Exact next command
`npm run verify -- --project ela30-1-modern-drama --mode workspace`

## Exact next file to open
`projects/ela30-1-modern-drama/workspace/index.html`

## Do not do next / warnings
- Do not edit files under `projects/ela30-1-modern-drama/raw/**` or `projects/ela30-1-modern-drama/exports/**` for source-of-truth work.
- Do not remove the nested Text Knowledge `Thesis Control` placement while keeping outer tab `Thesis Workshop`.
