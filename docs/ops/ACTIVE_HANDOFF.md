# Handoff

- Project: `ela30-1-modern-drama`
- Task: Replace the Modern Drama unit content with the full `A Streetcar Named Desire` unit from the newer ELA 30-1 Brightspace export while keeping the same frame.
- Status: `Streetcar content integrated and verified`

## Summary
The existing FinLit-style ELA frame is preserved, but the active content is now `A Streetcar Named Desire`. The generator now prefers the Streetcar manifest branch (`RES_CONTENT_3544`) when present, normalizes the source typo `A Steetcar Named Desire` to `A Streetcar Named Desire`, flattens nested Scene Overview pages into the lesson sequence, and keeps the PDF questions item as a local document lesson. The Lessons route remains a preview-card library only; individual lessons open on separate routed pages without the card grid above them.

Preview:
`http://127.0.0.1:5174/preview/workspace/ela30-1-modern-drama/index.html#lessons`

## Files changed
- `docs/ops/ACTIVE_HANDOFF.md`
- `projects/ela30-1-modern-drama/meta/content-outline.md`
- `projects/ela30-1-modern-drama/meta/import-log.md`
- `projects/ela30-1-modern-drama/meta/project.json`
- `projects/ela30-1-modern-drama/meta/reference-index.json`
- `projects/ela30-1-modern-drama/meta/resource-catalog.json`
- `projects/ela30-1-modern-drama/meta/section-map.json`
- `projects/ela30-1-modern-drama/meta/style-guide.md`
- `projects/ela30-1-modern-drama/raw/original.html`
- `projects/ela30-1-modern-drama/workspace/index.html`
- `projects/ela30-1-modern-drama/workspace/assets/source/**`
- `projects/resources/ela30-1-modern-drama/**`
- `scripts/lib/ela-modern-drama.ts`
- `scripts/tests/ela-modern-drama-frame.test.ts`

## Verification run
- `npx tsx --test scripts/tests/ela-modern-drama-frame.test.ts`
  - exit 0
  - 5 tests passed
  - covers UTF-16 decoding, D2L image paths, legacy Modern Drama fallback, Streetcar branch extraction with nested scenes and PDF lessons, and the separate lesson-library/lesson-page routing shape
- `npx tsx scripts/build-ela-modern-drama.ts --zip "C:\Users\dean.guedo\Downloads\D2LExport_6670_CBE System ELA 30-1 (Winter 2020)_20266815.zip" --slug ela30-1-modern-drama --force`
  - exit 0
  - built 25 Streetcar lessons
- Generated HTML structural check
  - exit 0
  - 25 lesson cards, 25 standalone lesson pages, no lesson detail panel inside `#lessons`, PDF frame present, and no old Death of Salesman / Doll's House / Modern Drama sequence text in the workspace
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
  - `#lessons` displays 25 Streetcar cards and 0 lesson detail panels
  - clicked Lesson 1 opens its standalone lesson page with 1 detail panel and 0 cards
  - PDF questions lesson has 1 local document iframe and 0 cards
  - Scene 11 route opens as a standalone lesson page
  - mobile `#lessons` at 390px has no horizontal overflow
  - screenshots saved to `%TEMP%\ela30-1-streetcar-desktop.png` and `%TEMP%\ela30-1-streetcar-mobile.png`

## Known risks / follow-up
- The frame is a master working version, not a finished Brightspace export package yet.
- Remote Tailwind, Google fonts, Google icons, and any source external links still depend on network access.
- The PDF lesson is embedded as a local iframe; Brightspace may require a different file-upload/mapping step during final packaging.
- LocalStorage completion state is preview-only and not a Brightspace gradebook integration.

## Source-of-truth location
- `projects/ela30-1-modern-drama/workspace/index.html`
- Regeneration source: `scripts/lib/ela-modern-drama.ts`

## Fragile areas / what might drift
- Streetcar manifest anchor: `RES_CONTENT_3544`; source title is misspelled as `A Steetcar Named Desire`.
- Forced rebuild now clears `projects/resources/ela30-1-modern-drama` to remove stale replaced-unit resources.
- PDF/document items are copied as binary assets; HTML items are decoded and cleaned as text.
- The FinLit-style frame is intentionally embedded as a single workspace HTML for quick Brightspace iteration.

## Next prompt assumptions
- Continue from `ela30-1-modern-drama` with Streetcar as the active unit content.
- Preserve the split between lesson-card previews and individual lesson pages in future refinements.
- Use the generator when rebuilding from the original Brightspace ZIP.

## Exact next command
`npm run verify -- --project ela30-1-modern-drama --mode workspace`

## Exact next file to open
`projects/ela30-1-modern-drama/workspace/index.html`
