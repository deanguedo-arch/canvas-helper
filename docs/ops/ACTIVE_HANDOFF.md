# Handoff

- Project: `ela30-1-modern-drama`
- Task: Split Streetcar source materials into external Resources, PDF Library, and Film Room routes.
- Status: `Implemented, verified, pending commit`

## Summary
The active ELA 30-1 Streetcar frame now separates imported support materials into three routes. `Resources` renders only external non-video source cards with ELA styling and `Open Resource` actions. `Library` collects local PDFs/documents and shows the Streetcar questions PDF in a viewer with open/download actions. `Film Room` collects all normalized embedded videos into a dedicated playlist view.

Preview:
`http://127.0.0.1:5174/preview/workspace/ela30-1-modern-drama/index.html#library`

## Files changed
- `docs/ops/ACTIVE_HANDOFF.md`
- `projects/ela30-1-modern-drama/meta/import-log.md`
- `projects/ela30-1-modern-drama/meta/project.json`
- `projects/ela30-1-modern-drama/meta/reference-index.json`
- `projects/ela30-1-modern-drama/meta/resource-catalog.json`
- `projects/ela30-1-modern-drama/meta/section-map.json`
- `projects/ela30-1-modern-drama/meta/style-guide.md`
- `projects/ela30-1-modern-drama/workspace/index.html`
- `scripts/lib/ela-modern-drama.ts`
- `scripts/tests/ela-modern-drama-frame.test.ts`

## Verification run
- `npx tsx --test scripts/tests/ela-modern-drama-frame.test.ts`
  - exit 1 first, expected red failure before implementation
  - exit 0 after implementation
  - 6 tests passed
- `npx tsx scripts/build-ela-modern-drama.ts --zip "C:\Users\dean.guedo\Downloads\D2LExport_6670_CBE System ELA 30-1 (Winter 2020)_20266815.zip" --slug ela30-1-modern-drama --force`
  - exit 0
  - rebuilt 25 Streetcar lessons
- Generated HTML structural check
  - exit 0
  - Library has the PDF viewer, Film Room has 5 videos, Resources has external cards and no PDF/video content
- `npm run verify -- --project ela30-1-modern-drama --mode workspace`
  - exit 0
  - metadata policy passed
  - no missing local assets or workspace embeds
  - expected external dependency warnings remain for Tailwind CDN and Google fonts/icons
- `npm run typecheck`
  - exit 0
- `npm run build:studio`
  - exit 0
- Playwright local preview check
  - exit 0
  - verified Library, Film Room, Resources, film playlist switching, and no mobile horizontal overflow on the changed routes
- STAX visual collection
  - exit 0
  - proof `visual_2026-06-08T15_04_31_567Z_ae7bfb03cc55`
- STAX observer preflight
  - exit 0
  - verdict still `Reject`; non-blocking observer result caused by stale historical command evidence and missing approval artifact, not this route split

## Known risks / follow-up
- This is still a master working HTML frame, not a finished Brightspace export package.
- PDF iframe/open/download behavior may need final Brightspace file mapping.
- External links and embedded videos need teacher review before publishing.
- Project has no `meta/e2e-contract.json`; browser verification used a focused Playwright script instead.

## Source-of-truth location
- Canonical editable source: `projects/ela30-1-modern-drama/workspace/index.html`
- Regeneration source: `scripts/lib/ela-modern-drama.ts`

## Fragile areas / what might drift
- The Streetcar source branch still depends on `RES_CONTENT_3544` and the source typo alias `A Steetcar Named Desire`.
- `Resources` intentionally filters out PDFs/local documents and video links; future unit swaps should preserve that classification.
- Forced rebuild rewrites generated timestamps in project metadata.
- The frame uses localStorage completion state for preview only.

## Next prompt assumptions
- Continue from `ela30-1-modern-drama` with Streetcar as the active unit content.
- Keep `Resources`, `Library`, and `Film Room` as separate top-level surfaces.
- Use the generator for future rebuilds rather than hand-patching the generated HTML.

## Exact next command
`git status --short --branch`

## Exact next file to open
`projects/ela30-1-modern-drama/workspace/index.html`
