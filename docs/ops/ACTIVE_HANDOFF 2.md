# Handoff

- Project: `kainaeng-brightspace-reface`
- Task: refacing `Unconfirmed 160903.zip` and producing a Brightspace-uploadable package under the 2 GB cap
- Status: complete

## Summary
- Added a deterministic streaming Brightspace package refacer at `scripts/reface-brightspace-package.ps1`.
- Added focused fixture coverage at `scripts/tests/brightspace-package-reface.test.ts`.
- Rebuilt the supplied Brightspace ZIP in default mode without changing `imsmanifest.xml`, entry paths, media, PDFs, images, or non-content payloads.
- Added lean mode with `-PruneContentServiceObjects -MediaExportDirectory` for Brightspace upload limits.
- Lean mode transforms the same 63 content HTML files, rewrites the 24 `contentservice_objects/` video resources to lightweight placeholder HTML topics, excludes those oversized MP4 entries from the ZIP, and exports the original MP4 files separately.
- Generated the under-2 GB import package at 134.73 MB.

## Files changed
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/plans/2026-04-29-kainaeng-brightspace-reface-design.md`
- `docs/plans/2026-04-29-kainaeng-brightspace-reface.md`
- `scripts/reface-brightspace-package.ps1`
- `scripts/tests/brightspace-package-reface.test.ts`

## Generated output
- Full preserved package:
  `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-refaced.zip`
- Full package report:
  `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-reface-report.md`
- Lean Brightspace upload package:
  `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-refaced-lean-under-2gb.zip`
- Lean package report:
  `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-refaced-lean-under-2gb-report.md`
- Externalized media folder:
  `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-externalized-media`

## Verification run
- `npx tsx --test scripts/tests/brightspace-package-reface.test.ts` failed first because lean mode did not exist.
- `npx tsx --test scripts/tests/brightspace-package-reface.test.ts`
- `npm.cmd run typecheck`
- Real lean package run:
  `.\scripts\reface-brightspace-package.ps1 -InputZip "C:\Users\dean.guedo\Documents\GitHub\canvas-helper\canvas code and references\kainaeng\Unconfirmed 160903.zip" -OutputZip "C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-refaced-lean-under-2gb.zip" -ReportJson "C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-refaced-lean-under-2gb-report.json" -ReportMarkdown "C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-refaced-lean-under-2gb-report.md" -PruneContentServiceObjects -MediaExportDirectory "C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-externalized-media"`
- Lean package checks confirmed:
  - output ZIP size: 134.73 MB
  - input entries: 146
  - output entries: 146
  - transformed HTML pages: 63
  - pruned content-service objects: 24
  - rewritten content-service resources: 24
  - placeholder HTML entries: 24
  - `contentservice_objects/` entries in lean ZIP: 0
  - `contentservice_objects` manifest references in lean ZIP: false
  - dangling manifest item identifier references: 0
  - non-pruned non-HTML payload mismatches: 0
  - exported media hash mismatches: 0

## Known risks / follow-up
- The original package has one pre-existing missing local reference: `Assignment Submission.html` links to `Adobe Scan Instructions.docx`, but that DOCX is not present in the ZIP.
- Lean mode intentionally changes `imsmanifest.xml` by rewriting the 24 content-service video resources to generated placeholder HTML pages. This is necessary to meet the 2 GB Brightspace upload limit while keeping module item references valid.
- The 24 exported MP4 files total about 3.86 GB and are not inside the lean import ZIP.
- Import into a Brightspace sandbox course is still the final external proof step; review Brightspace import logs after import.

## Source-of-truth location
- Input package: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\canvas code and references\kainaeng\Unconfirmed 160903.zip`
- Transformer source: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\reface-brightspace-package.ps1`
- Lean upload ZIP: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-refaced-lean-under-2gb.zip`
- Lean report: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-refaced-lean-under-2gb-report.md`
- Externalized media: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-externalized-media`

## Fragile areas / what might drift
- The ZIP uses a Cyrillic-c `\u0441ontent/` root, not a Latin `content/` root; the transformer explicitly handles both.
- Lean mode relies on the package fact that the large `contentservice_objects/` MP4s can be represented by placeholder HTML topics when the original MP4s are externalized.
- Root-relative Brightspace template paths like `/shared/...` are intentionally ignored during local link validation because they are served by Brightspace, not the package.
- Future styling changes should remain CSS-based unless an import QA pass proves a structure rewrite is safe.

## Next prompt assumptions
- The user's immediate upload target is the lean ZIP, not the full 4 GB preserved ZIP.
- LMS quizzes, grades, release conditions, and non-content assets remain out of scope.
- The one missing DOCX link is inherited from the source package unless the user provides that missing file.

## Exact next command
`npx tsx --test scripts/tests/brightspace-package-reface.test.ts`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\kainaeng-brightspace-reface\exports\kainaeng-brightspace-refaced-lean-under-2gb-report.md`
