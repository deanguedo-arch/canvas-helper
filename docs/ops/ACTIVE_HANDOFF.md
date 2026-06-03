# Handoff

- Project: `forensic-studies-25-docx-export`
- Task: Fix linked-image failures in the Forensic Studies 25 DOCX conversion.
- Status: `Fixed package generated; canonical Genetics original remains locked by Word`

## Summary
The linked-image placeholders came from external image relationships that Word preserved in the DOCX package. The shared Brightspace DOCX converter now detects external DOCX image relationships and embeds those images into `word/media/*`, using a generated placeholder only if an external image cannot be fetched.

Clean fixed package:
`projects/forensic-studies-25-docx-export-fixed/exports/upload-package/`

Canonical package restored as much as the open Word lock allows:
`projects/forensic-studies-25-docx-export/exports/upload-package/`

Because `08 - 7 Forensic Genetics.docx` is open in Word, the canonical folder contains a fixed copy named `08 - 7 Forensic Genetics - refreshed.docx`. The full fixed package has the corrected Genetics file under the original name.

## Files changed
- `scripts/brightspace_zip_to_docx_upload_package.py`
- `scripts/tests/brightspace_docx_style_profile_test.py`
- `projects/forensic-studies-25-docx-export-fixed/exports/upload-package/**`
- `projects/forensic-studies-25-docx-export/exports/upload-package/**`
- `projects/forensic-studies-25-docx-export-fixed/meta/**`
- `projects/forensic-studies-25-docx-export/meta/**`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`

Unrelated dirty files observed and preserved:
- `reports/latest-progress.csv`
- `reports/progress-2026-06-02-1511.csv`
- `reports/progress-2026-06-03-0840.csv`
- `reports/progress-2026-06-03-0841.csv`

## Verification run
- Failing test observed before implementation: `python scripts/tests/brightspace_docx_style_profile_test.py` failed because `docx_external_image_relationships` and `embed_external_image_relationships` were missing.
- `python scripts/tests/brightspace_docx_style_profile_test.py` passed after implementation: 6 tests.
- `python -m py_compile scripts/brightspace_zip_to_docx_upload_package.py scripts/tests/brightspace_docx_style_profile_test.py` passed.
- Full fixed package generation passed with 11 included units, 147 rendered HTML sections, 172 copied ZIP images, 11 external DOCX images embedded, and 0 remaining external DOCX image relationships.
- Verification script confirmed every DOCX in `forensic-studies-25-docx-export-fixed` has 0 external image relationships.
- Verification script confirmed restored canonical DOCX files have 0 external image relationships, excluding the locked original `08 - 7 Forensic Genetics.docx` and Word's `~$` lock file.

## Known risks / follow-up
- The original canonical `08 - 7 Forensic Genetics.docx` could not be overwritten because Word has it open.
- Use `projects/forensic-studies-25-docx-export-fixed/exports/upload-package/` as the clean package now.
- After closing Word, rerun the exact next command below to replace the canonical package without the refreshed-copy workaround.
- Some external images may be embedded as generated placeholders if their source server did not return image bytes during conversion.

## Source-of-truth location
- Converter: `scripts/brightspace_zip_to_docx_upload_package.py`
- Regression tests: `scripts/tests/brightspace_docx_style_profile_test.py`
- Clean fixed package: `projects/forensic-studies-25-docx-export-fixed/exports/upload-package/`
- Canonical package: `projects/forensic-studies-25-docx-export/exports/upload-package/`

## Fragile areas / what might drift
- External HTTP images can disappear or block automated fetches over time.
- Word can create external image relationships when importing HTML with remote image URLs.
- Open DOCX files block canonical regeneration on Windows.

## Next prompt assumptions
- The priority is usable DOCX output with no broken linked-image boxes.
- The clean fixed package is acceptable immediately, while the canonical package can be fully replaced after the open Word document is closed.

## Exact next command
`$env:FORENSIC_STUDIES25_SOURCE_ZIP='C:\Users\dean.guedo\Downloads\D2LExport_148856_24-25 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_20266328.zip'; python scripts/brightspace_zip_to_docx_upload_package.py --course forensic-studies25`

## Exact next file to open
`projects/forensic-studies-25-docx-export-fixed/exports/upload-package/01_DOCX_BY_UNIT/08 - 7 Forensic Genetics.docx`
