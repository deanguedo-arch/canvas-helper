# Handoff

- Project: `canvas-helper`
- Active slice: Brightspace ZIP-to-DOCX upload-package conversion for `C:\Users\dean.guedo\Downloads\science-10.zip`.
- Status: Conversion complete; seven course-section packages generated and audited.

## Summary
- The source ZIP is a single Brightspace package with one `imsmanifest.xml`, but the manifest root contains seven course sections.
- The converter now supports `include_title_patterns` on `CourseConfig`, so a bundled ZIP can be split into one DOCX upload package per selected top-level course section.
- Generated packages:
  - `projects/science-14-docx-export/exports/upload-package`
  - `projects/science-10-docx-export/exports/upload-package`
  - `projects/cfl-art-docx-export/exports/upload-package`
  - `projects/rec2050-sport-psychology-2-docx-export/exports/upload-package`
  - `projects/ent1020-elements-of-a-venture-plan-docx-export/exports/upload-package`
  - `projects/rec1050-sport-psychology-1-docx-export/exports/upload-package`
  - `projects/science-10-4-docx-export/exports/upload-package`
- Audit result: all seven packages have matching DOCX counts, zero coverage failures, and zero unresolved assets.

## Files changed
- `scripts/brightspace_zip_to_docx_upload_package.py`
- `scripts/tests/brightspace_docx_style_profile_test.py`
- `docs/ops/ACTIVE_HANDOFF.md`
- `.stax/task.md`
- `.stax/codex-report.md`
- Generated output under the seven `projects/*-docx-export/exports/upload-package/` folders listed above.

## Verification run
- `python scripts\tests\brightspace_docx_style_profile_test.py` failed first with `TypeError: CourseConfig.__init__() got an unexpected keyword argument 'include_title_patterns'`.
- `python scripts\tests\brightspace_docx_style_profile_test.py` passed after implementation.
- `python scripts\brightspace_zip_to_docx_upload_package.py --course science14 --course science10 --course cfl-art --course rec2050 --course ent1020 --course rec1050 --course science10-4` passed and generated all seven upload packages.
- Audit summary passed:
  - Science 14: 15 DOCX, 0 unresolved assets, 0 coverage failures.
  - Science 10: 16 DOCX, 0 unresolved assets, 0 coverage failures.
  - CFL Art: 3 DOCX, 0 unresolved assets, 0 coverage failures.
  - REC2050 Sport Psychology 2: 10 DOCX, 0 unresolved assets, 0 coverage failures.
  - ENT1020 Elements of a Venture Plan: 7 DOCX, 0 unresolved assets, 0 coverage failures.
  - REC1050 Sport Psychology 1: 10 DOCX, 0 unresolved assets, 0 coverage failures.
  - Science 10-4: 5 DOCX, 0 unresolved assets, 0 coverage failures.
- STAX command evidence collected:
  - `cmd_2026-05-29T15_51_09_119Z_db631f87763f`: converter unit test passed.
  - `cmd_2026-05-29T15_52_19_952Z_c2cde333bfe4`: generated package audit passed.

## Known risks / follow-up
- Each generated upload package includes its own `00_SOURCE_ZIP/science-10.zip` copy, following the existing converter convention. This makes the seven packages large.
- `science-10-docx-export` has 10 source manifest placeholders where Brightspace listed an item but supplied no resource file; these are recorded in `03_AUDITS/course-docx-audit.json`.
- Two failed STAX evidence attempts exist before the successful audit evidence because nested PowerShell and `node -e` quoting were stripped by the collector shell. The successful audit evidence is the one to trust.
- No deploy, publish, sync, or release action was performed.

## Source-of-truth location
- Source ZIP: `C:\Users\dean.guedo\Downloads\science-10.zip`
- Converter: `scripts/brightspace_zip_to_docx_upload_package.py`
- Converter regression: `scripts/tests/brightspace_docx_style_profile_test.py`
- Generated packages: the seven `projects/*-docx-export/exports/upload-package/` folders listed in the summary.
- Per-package audits: each package's `03_AUDITS/course-docx-audit.json`.

## Fragile areas / what might drift
- Course filtering depends on top-level Brightspace manifest titles. If a future bundle renames course sections, add or adjust `include_title_patterns`.
- Word automation generated the DOCX files locally; reruns require working Microsoft Word COM automation on Windows.
- STAX generated state is freshness-sensitive and may need another observer preflight if additional files change.

## Next prompt assumptions
- Treat the Science 10 bundle conversion as complete unless the user asks for package compression, cleanup, or a different course split.
- If continuing validation, inspect the per-package audit JSON before opening DOCX files manually.
- Do not broaden into hosted deploy or course redesign from this handoff.

## Exact next command
`python scripts\tests\brightspace_docx_style_profile_test.py`

## Exact next file to open
`projects/science-10-docx-export/exports/upload-package/03_AUDITS/course-docx-audit.json`
