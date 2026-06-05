# Handoff

- Project: `ela30-1-modern-drama`
- Task: Build a new ELA 30-1 Modern Drama conversion project from the supplied Brightspace ZIP using the FinLit-style master lesson frame.
- Status: `Generated, media-integrated, verified, ready to continue from another workstation`

## Summary
The ELA 30-1 Modern Drama unit is now a standalone Canvas Helper conversion project. The generator extracts the Modern Drama manifest section from the D2L export, decodes UTF-16 Brightspace HTML, preserves the eight lesson sequence, copies seven source images into the workspace, normalizes local HTML resources, and turns YouTube iframes/watch links into embedded video surfaces. The workspace uses the FinLit-style routed frame with Overview, Lessons, Writing Studio, Readings, and Resources.

Preview:
`http://127.0.0.1:5174/preview/workspace/ela30-1-modern-drama/index.html#resources`

## Files changed
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`
- `projects/ela30-1-modern-drama/**`
- `projects/resources/ela30-1-modern-drama/**`
- `scripts/build-ela-modern-drama.ts`
- `scripts/lib/ela-modern-drama.ts`
- `scripts/tests/ela-modern-drama-frame.test.ts`

## Verification run
- `npx tsx --test scripts/tests/ela-modern-drama-frame.test.ts`
  - exit 0
  - 3 tests passed
  - covers UTF-16 lesson decoding, malformed/encoded D2L image paths, manifest lesson extraction, image-only paragraph preservation, and YouTube embed normalization
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
  - Resources route visible
  - 2 video embeds on Resources
  - 7 source lesson images present
  - Doll's House lesson video embed present
  - Streetcar lesson iframe embed present
  - 8 lesson cards present
  - screenshot saved to `C:\Users\dean.guedo\AppData\Local\Temp\ela30-1-modern-drama-preview.png`

## Known risks / follow-up
- The frame is a master working version, not a finished Brightspace export package yet.
- Remote YouTube, Tailwind, Google fonts, and Google icon assets still depend on network access.
- Some source external links are old HTTP/PDF links from the D2L export and may need teacher review before publishing.
- LocalStorage completion state is preview-only and not a Brightspace gradebook integration.

## Source-of-truth location
- `projects/ela30-1-modern-drama/workspace/index.html`
- Regeneration source: `scripts/lib/ela-modern-drama.ts`

## Fragile areas / what might drift
- Manifest anchor: `Modern Drama` / `RES_CONTENT_3535`.
- Media path handling for D2L `encodedsrc` values and image-only paragraphs.
- YouTube URL parsing currently supports YouTube watch, embed, shorts, and youtu.be URLs.
- The FinLit-style frame is intentionally embedded as a single workspace HTML for quick Brightspace iteration.

## Next prompt assumptions
- Continue from `ela30-1-modern-drama` as the first repeatable ELA master lesson conversion pattern.
- Keep raw/source resources as reference-only and edit `workspace/index.html` for authoring changes.
- Use the generator when rebuilding from the original Brightspace ZIP.

## Exact next command
`npm run verify -- --project ela30-1-modern-drama --mode workspace`

## Exact next file to open
`projects/ela30-1-modern-drama/workspace/index.html`
