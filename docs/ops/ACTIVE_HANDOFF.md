# Handoff

- Project: `ela30-1-modern-drama`
- Task: Refine the Lessons route so it is a preview-card library only, with individual lessons opening on separate routed pages.
- Status: `Lesson routing refined and verified`

## Summary
The ELA 30-1 Modern Drama unit remains a standalone Canvas Helper conversion project. The Lessons route now behaves as a preview library only: it shows the eight lesson cards and does not render a lesson detail panel below the grid. Each lesson card and sidebar lesson link opens its own routed lesson page, where the full lesson content appears without the other lesson-card grid above it.

Preview:
`http://127.0.0.1:5174/preview/workspace/ela30-1-modern-drama/index.html#lessons`

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
  - exit 0
  - 4 tests passed
  - covers UTF-16 lesson decoding, malformed/encoded D2L image paths, manifest lesson extraction, image-only paragraph preservation, YouTube embed normalization, and the separate lesson-library/lesson-page routing shape
- `npx tsx scripts/build-ela-modern-drama.ts --zip "C:\Users\dean.guedo\Downloads\D2LExport_6670_CBE System ELA 30-1 (Winter 2020)_20266551.zip" --slug ela30-1-modern-drama --force`
  - exit 0
  - built 8 lessons
- `npm run verify -- --project ela30-1-modern-drama --mode workspace`
  - exit 0
  - metadata policy passed
  - no missing local assets
  - no missing workspace embeds
  - expected warnings remain for Tailwind CDN and Google font/icon links
- `npm run typecheck`
  - exit 0
- `npm run build:studio`
  - exit 0
- Playwright local preview check
  - exit 0
  - `#lessons` displays 8 lesson cards
  - `#lessons` displays 0 lesson detail panels
  - clicking the Lesson 1 card opens `#lesson-1-characteristics-of-modern-drama`
  - individual lesson page displays 1 lesson detail panel and 0 lesson cards
  - `#lesson-3-streetcar-information-and-overview` still displays its video iframe
  - screenshot saved to `C:\Users\dean.guedo\AppData\Local\Temp\ela30-1-modern-drama-lessons-split.png`

## Known risks / follow-up
- The frame is a master working version, not a finished Brightspace export package yet.
- Remote YouTube, Tailwind, Google fonts, and Google icon assets still depend on network access.
- Some source external links are old HTTP/PDF links from the D2L export and may need teacher review before publishing.
- LocalStorage completion state is preview-only and not a Brightspace gradebook integration.
- The generated metadata timestamps changed because the workspace was regenerated from the source ZIP.

## Source-of-truth location
- `projects/ela30-1-modern-drama/workspace/index.html`
- Regeneration source: `scripts/lib/ela-modern-drama.ts`

## Fragile areas / what might drift
- Manifest anchor: `Modern Drama` / `RES_CONTENT_3535`.
- Media path handling for D2L `encodedsrc` values and image-only paragraphs.
- YouTube URL parsing currently supports YouTube watch, embed, shorts, and youtu.be URLs.
- The FinLit-style frame is intentionally embedded as a single workspace HTML for quick Brightspace iteration.

## Next prompt assumptions
- Continue from `ela30-1-modern-drama` with `#lessons` as the preview library route.
- Preserve the split between lesson-card previews and individual lesson pages in future refinements.
- Use the generator when rebuilding from the original Brightspace ZIP.

## Exact next command
`npm run verify -- --project ela30-1-modern-drama --mode workspace`

## Exact next file to open
`projects/ela30-1-modern-drama/workspace/index.html`
