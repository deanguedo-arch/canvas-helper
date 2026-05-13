# Active Handoff

## Summary
Added Biology 20 to the shared Brightspace ZIP to DOCX upload-package generator and generated a clean organized Biology 20 package. The package follows the established structure: source ZIP, DOCX by unit, supporting files by unit, audits, and cleaned HTML used for Word import.

## Files changed
- `scripts/brightspace_zip_to_docx_upload_package.py`
- `projects/biology-20-docx-export/meta/build_word_native_course_docx.py`
- `projects/biology-20-docx-export/meta/project.json`
- `projects/biology-20-docx-export/exports/upload-package/`
- `.stax/task.md`
- `.stax/codex-report.md`

## Verification run
- `python projects\biology-20-docx-export\meta\build_word_native_course_docx.py`
- Exit code: 0
- Biology output: 6 included units, 0 skipped top-level modules, 45 HTML sections, 0 images copied, 0 media references, 147 support files.
- A first run failed on a long Windows support-file path; the shared generator was patched to shorten support folder/file names and the rerun succeeded.

## Known risks / follow-up
- No manual visual review was run.
- No test suite was run; this was artifact generation.
- Biology output reported 0 HTML images/media conversions and 147 support files, so review the audit to confirm that matches the source package behavior.
- Long support-resource titles are shortened with hashes to stay Windows-safe.

## Source-of-truth location
- Shared generator: `scripts/brightspace_zip_to_docx_upload_package.py`
- Biology wrapper: `projects/biology-20-docx-export/meta/build_word_native_course_docx.py`
- Biology package: `projects/biology-20-docx-export/exports/upload-package/`
- Biology audit: `projects/biology-20-docx-export/exports/upload-package/03_AUDITS/course-docx-audit.json`

## Fragile areas / what might drift
- Word COM must be available on Windows.
- Biology appears support-file heavy; copied PDFs/docs are linked from DOCX sections, not converted into editable Word body content.
- If a future course has very long module/resource names, keep the shortened support-file naming rule.

## Next prompt assumptions
- User will inspect sampled Biology DOCX files and decide whether support-file-heavy modules need extra handling.
- If accepted, the same course key pattern can be used for additional Brightspace ZIPs.

## Exact next command
`python projects\biology-20-docx-export\meta\build_word_native_course_docx.py`

## Exact next file to open
`projects/biology-20-docx-export/exports/upload-package/00_README.md`
