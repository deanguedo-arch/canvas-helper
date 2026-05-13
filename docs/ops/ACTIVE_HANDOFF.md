# Handoff

- Project: `social-studies-10-1-docx-export`
- Task: Improve the Unit 1 Brightspace-to-DOCX pilot rules for full-screen sizing, clean image fallbacks, source-link cleanup, and embedded media cards.
- Status: regenerated successfully to refreshed DOCX v3; ready for Word visual review

## Summary

- Added focused Python regression coverage for scalable DOCX conversion behavior.
- Patched the Unit 1 builder so missing images are audited without visible `[Unresolved image: ...]` text in the learner-facing DOCX.
- Patched image source links that wrap images so `Image source` no longer appears beside embedded images.
- Added nearest-path ranking for ambiguous ZIP image basename matches, which should recover more Brightspace images when relative paths are wrong but the asset exists elsewhere in the package.
- Reworked embedded media cards to use a generated embedded-style preview image plus a clickable title, without printing raw iframe/embed URLs into the document body.
- Expanded the Word page/frame sizing assumptions toward a full-screen desktop Brightspace layout.
- Added portable source ZIP resolution so the builder tries an environment override, the normal Windows Downloads folder, and then the legacy `/Users/deanguedo/Downloads` path.
- Regenerated the Unit 1 DOCX from the restored Brightspace ZIP. Because the canonical DOCX was locked by another process, the builder wrote a refreshed sibling output.
- Confirmed all 21 unresolved asset references are genuinely absent from the supplied ZIP by basename; none were recoverable through the stronger resolver.
- Cleaned video/media cards so learner-facing DOCX text no longer says `Iframe preserved from Brightspace` or any similar preservation note.
- Added YouTube thumbnail derivation and remote thumbnail embedding where possible. The generated DOCX used real remote thumbnails for 10 of 15 media cards; the others use the generated preview fallback.
- Hyperlinked the media preview image itself and kept the media title as a clickable link.
- Replaced rasterized blue lesson header bars with real Word table/cell headers so the text no longer collapses into tiny unreadable pixels on Windows.

## Files Changed

- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `projects/social-studies-10-1-docx-export/meta/build_unit1_docx_export.py`
- `scripts/tests/social_studies_docx_export_test.py`

## Verification Run

- `python -m unittest scripts.tests.social_studies_docx_export_test`
  - Final result: passed, `Ran 9 tests`, `OK`
- `python projects\social-studies-10-1-docx-export\meta\build_unit1_docx_export.py`
  - Passed and wrote `projects/social-studies-10-1-docx-export/exports/docx/01 - 1. Globalization and Identity - refreshed 3.docx`
- `npm run verify -- --project social-studies-10-1-docx-export`
  - Passed with one metadata warning: `canonicalEntry` is not listed in `canonicalSources`.
- DOCX XML/audit inspection
  - Confirmed no `[Unresolved image: ...]`, no `Image source`, no raw `https://embed.ted.com`, no `Iframe preserved from Brightspace`, and no `preserved from Brightspace` body text in the refreshed DOCX.
  - Confirmed header text is present as Word text, not a raster header image.
  - Confirmed `mediaPreviewCards=15`, `remoteThumbnails=10`, `thumbnailUrls=10`, and `wordMediaFiles=21`.

## Known Risks / Follow-Up

- The canonical output `projects/social-studies-10-1-docx-export/exports/docx/01 - 1. Globalization and Identity.docx` appears to be open/locked, so the refreshed output was written beside it.
- The refreshed output is `projects/social-studies-10-1-docx-export/exports/docx/01 - 1. Globalization and Identity - refreshed 3.docx`.
- The expected default source ZIP path is now `C:\Users\dean.guedo\Downloads\D2LCCExport_149634_25-26 _ S2 _ Social Studies 10-1 _ Per 1(A) _ Sec _202651213.ZIP`.
- The builder also supports `SOCIAL10_SOURCE_ZIP` and `SOCIAL10_STYLE_REFERENCE_ZIP` environment variable overrides.
- The style reference ZIP `/Users/deanguedo/Downloads/U1P02overviewsurvey.html.zip` was also not found locally.
- The media preview cards are generated offline and clickable; they do not make Word run live iframe video.

## Source-Of-Truth Location

- Canonical builder: `projects/social-studies-10-1-docx-export/meta/build_unit1_docx_export.py`
- Focused regression: `scripts/tests/social_studies_docx_export_test.py`
- Current refreshed DOCX: `projects/social-studies-10-1-docx-export/exports/docx/01 - 1. Globalization and Identity - refreshed 3.docx`

## Fragile Areas / What Might Drift

- Any future scale-up should move these DOCX rules into a shared converter instead of continuing to grow the Unit 1 pilot script.
- Asset resolution should stay audit-backed so recovered images and unresolved assets remain visible to operators without muddying learner-facing Word output.
- Video behavior should remain honest: generated preview plus link, not a fake claim that DOCX preserved live embedded playback.

## Next Prompt Assumptions

- The real DOCX has been regenerated to a refreshed sibling file with real Word header bars, cleaned media-card wording, and linked preview images.
- Next step is Word visual review against the screenshots, especially header bars, sizing, missing-image cleanup, and media-card appearance.
- If the refreshed file is accepted, close the old canonical DOCX and rerun the builder so it can replace `01 - 1. Globalization and Identity.docx` directly.

## Exact Next Command

Open `projects/social-studies-10-1-docx-export/exports/docx/01 - 1. Globalization and Identity - refreshed 3.docx`

## Exact Next File To Open

`projects/social-studies-10-1-docx-export/meta/build_unit1_docx_export.py`

## Do Not Do Next / Warnings

- Do not manually patch the generated DOCX as the durable fix.
- Do not edit `projects/<slug>/raw/**`; this project currently has no raw source folder for the Brightspace ZIP.
- Do not claim final visual acceptance until the refreshed DOCX is inspected in Word.
