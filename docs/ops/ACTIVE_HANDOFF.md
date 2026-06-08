# Handoff

- Project: `ela30-1-modern-drama`
- Task: Remove duplicate Readings section and center the white Next Step CE topbar logo.
- Status: `implemented and verified, pending commit`

## Files changed
- `.stax/task.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`
- `docs/design/next-step/assets/nxt-ce-logo-white-with-ce.png`
- `projects/ela30-1-modern-drama/meta/project.json`
- `projects/ela30-1-modern-drama/meta/reference-index.json`
- `projects/ela30-1-modern-drama/meta/resource-catalog.json`
- `projects/ela30-1-modern-drama/meta/section-map.json`
- `projects/ela30-1-modern-drama/workspace/index.html`
- `projects/ela30-1-modern-drama/workspace/assets/brand/nxt-ce-logo-white-with-ce.png`
- `scripts/lib/ela-modern-drama.ts`
- `scripts/tests/ela-modern-drama-frame.test.ts`

## What changed
- Removed the Readings sidebar link from the generated ELA shell.
- Removed the generated `#readings` route and static route allow-list entry.
- Removed the Readings entry from `meta/section-map.json`.
- Restored the centered white Next Step CE logo in the fixed topbar.
- Moved the completion-linked progress control into the top-right corner.
- Removed the centered unit-title/progress stack from the topbar.
- Kept Library, Film Room, Resources, lessons, progress, and sidebar collapse behavior intact.

## Why this changed
- The PDF/document workflow now belongs in Library, so a separate Readings section duplicated navigation without adding a distinct use.
- The topbar needed to match the requested Next Step branded course shell instead of using the unit title or a left-aligned logo as the topbar anchor.

## Source of truth
- Canonical editable source: `projects/ela30-1-modern-drama/workspace/index.html`
- Regeneration source: `scripts/lib/ela-modern-drama.ts`
- Current source ZIP: `C:\Users\dean.guedo\Downloads\D2LExport_6670_CBE System ELA 30-1 (Winter 2020)_20266815.zip`

## Fragile areas / watchouts
- A stale `#readings` hash intentionally falls back to Overview because the route no longer exists.
- The centered logo asset is copied from `docs/design/next-step/assets/nxt-ce-logo-white-with-ce.png` during regeneration.
- Forced rebuild rewrites generated timestamps in project metadata.
- STAX observer status may remain Reject because of stale historical sidecar proof unrelated to this focused ELA change.

## Next prompt should assume
- Continue from `ela30-1-modern-drama` with Streetcar as the active unit.
- Use the generator for future rebuilds rather than hand-patching generated workspace HTML.
- Library is the canonical PDF/document section.
- Topbar center is the white Next Step CE logo; the unit title remains in the sidebar and page content, not the fixed header center.

## What still needs validation
- Brightspace packaging/export is still a later step.

## Known risks
- Embedded YouTube videos remain network-dependent.
- Lesson completion remains localStorage preview behavior, not Brightspace gradebook persistence.

## Exact next command
`git status --short --branch`

## Exact next file to open
`scripts/lib/ela-modern-drama.ts`

## Do not do next / warnings
- Do not wire in the other ELA units until explicitly requested.
- Do not stage unrelated untracked Forensics static-module files.
