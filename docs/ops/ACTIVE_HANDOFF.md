# Handoff

- Project: `social-studies-10-1-docx-export`
- Task: Restyle the Unit 1 Word pilot so it visually matches the Brightspace Unit 1 overview page.
- Status: ready for validation

## Files changed
- `projects/social-studies-10-1-docx-export/meta/project.json`
- `projects/social-studies-10-1-docx-export/meta/build_unit1_docx_export.py`
- `projects/social-studies-10-1-docx-export/meta/unit-1-conversion-map.json`
- `projects/social-studies-10-1-docx-export/meta/unit-1-docx-export-audit.json`
- `projects/social-studies-10-1-docx-export/meta/unit-1-docx-export-audit.md`
- `projects/social-studies-10-1-docx-export/meta/unit-1-docx-export-verification.json`
- `projects/social-studies-10-1-docx-export/exports/docx/01 - 1. Globalization and Identity.docx`
- `projects/social-studies-10-1-docx-export/exports/supporting-files/`
- `projects/social-studies-10-1-docx-export/exports/supporting-files-index.csv`
- `projects/social-studies-10-1-docx-export/exports/qa/quicklook/01 - 1. Globalization and Identity.docx.png`
- `.stax/visual-proofs/socialstudies10-unit1-docx-quicklook.png`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed
- Restyled the Unit 1 DOCX pages with the Brightspace site frame: gray page border, blue unit header, purple guiding question, Trebuchet/Lucida typography, feature boxes, and green callout boxes.
- Used `/Users/deanguedo/Downloads/U1P02overviewsurvey.html.zip` as the visual style reference and recorded it in project metadata.
- Reworked the opening image/text layout so `teenipod.png` sits beside the introductory paragraphs like the Brightspace page instead of appearing as a generic inline image.
- Generated Word-stable blue header banner images from the original CSS color and Trebuchet font to avoid nested-table rendering drift.
- Preserved Unit 1 hierarchy, including the nested `Unit 1 Assessment` folder, 15 embedded video links, 7 package images, 3 rendered Study Guide PDF pages, and 9 copied support files.

## Why this changed
- The first Unit 1 DOCX preserved structure but looked too generic; the user asked for it to look like the Brightspace site screenshot.

## Source of truth
- Canonical builder: `projects/social-studies-10-1-docx-export/meta/build_unit1_docx_export.py`
- Course source ZIP: `/Users/deanguedo/Downloads/D2LCCExport_149634_25-26 _ S2 _ Social Studies 10-1 _ Per 1(A) _ Sec _202651213.ZIP`
- Style reference ZIP: `/Users/deanguedo/Downloads/U1P02overviewsurvey.html.zip`
- Source structure: `imsmanifest.xml` inside the course ZIP
- Generated DOCX: `projects/social-studies-10-1-docx-export/exports/docx/01 - 1. Globalization and Identity.docx`

## Fragile areas / watchouts
- Blue unit headers are generated banner images for visual fidelity, so the title in those banners is not plain editable Word text.
- DOCX cannot preserve live iframe execution; embedded videos are preserved as playable links.
- Some referenced source assets are absent from the supplied ZIP and remain listed in `unit-1-docx-export-audit.md`.
- Linked support files are relative to the DOCX folder; keep `exports/supporting-files/` with the DOCX if moving it.
- Full LibreOffice render QA cannot run on this machine because `soffice` is unavailable; Quick Look first-page proof was generated instead.

## Next prompt should assume
- Unit 1 remains the pilot output, not an all-units conversion.
- The user needs visual acceptance of the Brightspace-like Word style before applying it to other units.
- The active project slug is `social-studies-10-1-docx-export`.

## What still needs validation
- User review of the generated Unit 1 DOCX in Word.
- Full page-by-page render inspection if LibreOffice or Word automation becomes available.
- Decision on whether to expand this exact pattern to the remaining units.

## Known risks
- Missing source assets cannot be embedded unless the originals or a more complete package are supplied.
- Videos are links, not offline video files.
- The wider checkout already has many unrelated dirty/deleted files outside this task.
- STAX observer state may still flag stale historical proof from older tasks.

## Exact next command
`/Users/deanguedo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 projects/social-studies-10-1-docx-export/meta/build_unit1_docx_export.py`

## Exact next file to open
`projects/social-studies-10-1-docx-export/meta/unit-1-docx-export-audit.md`

## Do not do next / warnings
- Do not edit `projects/<slug>/raw/**` for this pilot.
- Do not flatten Unit 1 assessment children into the main lesson list.
- Do not claim all missing images were embedded; use the audit for exact fallback records.
