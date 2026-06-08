# Handoff

- Project: `ela30-1-modern-drama`
- Task: Add Film Room dropdown behavior, top-bar lesson progress, and sidebar-local collapse control.
- Status: `Implemented and verified, pending commit`

## Summary
The ELA 30-1 Streetcar frame now has the requested Film Room dropdown behavior and a completion-linked top progress bar. The video stage remains on the left; the right Film Room controller has a labeled playlist `<select>` plus a separate `Now loaded` panel. The fixed top bar now includes a styled course progress track that updates when lesson `Mark Complete` buttons are used. The sidebar collapse button has been moved from the fixed top bar into the sidebar header.

Preview:
`http://127.0.0.1:5174/preview/workspace/ela30-1-modern-drama/index.html#film-room`

## Files changed
- `docs/ops/ACTIVE_HANDOFF.md`
- `projects/ela30-1-modern-drama/meta/project.json`
- `projects/ela30-1-modern-drama/meta/reference-index.json`
- `projects/ela30-1-modern-drama/meta/resource-catalog.json`
- `projects/ela30-1-modern-drama/meta/section-map.json`
- `projects/ela30-1-modern-drama/workspace/index.html`
- `scripts/lib/ela-modern-drama.ts`
- `scripts/tests/ela-modern-drama-frame.test.ts`

## Verification run
- `npx tsx --test scripts/tests/ela-modern-drama-frame.test.ts`
  - exit 1 first for missing Film Room dropdown
  - exit 1 again for generic video title fallback
  - exit 1 again for missing top progress/sidebar placement
  - exit 0 after implementation
  - 7 tests passed
- `npx tsx scripts/build-ela-modern-drama.ts --zip "C:\Users\dean.guedo\Downloads\D2LExport_6670_CBE System ELA 30-1 (Winter 2020)_20266815.zip" --slug ela30-1-modern-drama --force`
  - exit 0
  - rebuilt 25 Streetcar lessons
- Generated HTML structural checks
  - exit 0
  - Film Room has 1 select, 5 options, 5 video panels, 5 now-loaded panels, no playlist buttons, and lesson-title labels
  - Header has progress fill/count/percent and no sidebar toggle
  - Sidebar has the collapse toggle
- `npm run verify -- --project ela30-1-modern-drama --mode workspace`
  - exit 0
  - metadata policy passed
  - no missing local assets or workspace embeds
  - expected external dependency warnings remain for Tailwind CDN and Google fonts/icons
- `npm run typecheck`
  - exit 0
- `npm run build:studio`
  - exit 0
- Playwright local preview checks
  - exit 0
  - Film dropdown switches to Lesson 11 and updates visible iframe/metadata/count
  - Top progress starts at 0%, changes to 4% after one of 25 lessons is marked complete, updates fill width and ARIA value
  - Sidebar toggle collapses from the sidebar header
  - Mobile top progress has no horizontal overflow

## Known risks / follow-up
- This is still a master working HTML frame, not a finished Brightspace export package.
- Source iframe titles in the export are generic, so the generator uses the source lesson title for dropdown labels.
- Embedded YouTube videos remain network-dependent.
- Lesson completion is localStorage preview behavior, not Brightspace gradebook persistence.
- Project has no `meta/e2e-contract.json`; browser verification used focused Playwright scripts.

## Source-of-truth location
- Canonical editable source: `projects/ela30-1-modern-drama/workspace/index.html`
- Regeneration source: `scripts/lib/ela-modern-drama.ts`

## Fragile areas / what might drift
- The Streetcar source branch still depends on `RES_CONTENT_3544` and the source typo alias `A Steetcar Named Desire`.
- Generic video titles are intentionally replaced with the source lesson title in the Film Room catalog.
- Progress math is tied to `lessonIds.length` and localStorage key `canvas-helper:ela30-1-modern-drama:complete`.
- Forced rebuild rewrites generated timestamps in project metadata.

## Next prompt assumptions
- Continue from `ela30-1-modern-drama` with Streetcar as the active unit content.
- Keep the Film Room dropdown and top progress bar as the default pattern for this master frame.
- Use the generator for future rebuilds rather than hand-patching generated HTML.

## Exact next command
`git status --short --branch`

## Exact next file to open
`projects/ela30-1-modern-drama/workspace/index.html`
