# Handoff

- Project: repo-wide (calm3new + calm-module + calmmodule2)
- Task: Add explicit SCORM suspend semantics and a Save and Exit flow so Brightspace resumes learner state reliably.
- Status: complete

## Files changed
- scripts/lib/scorm.ts
- scripts/tests/scorm-export.test.ts
- docs/plans/2026-03-11-scorm-suspend-resume-fix.md
- docs/plans/2026-03-11-google-hosted-export-design.md
- docs/plans/2026-03-11-google-hosted-export.md
- projects/calm3new/meta/HANDOFF.md

## What changed
- Updated the generated SCORM bridge to initialize incomplete status, write `cmi.exit = "suspend"` during save and terminate, and commit suspend data through an explicit save path.
- Added a SCORM-only `Save and Exit` control and exposed `window.__canvasHelperScorm.save()` and `window.__canvasHelperScorm.saveAndExit()` in exported packages.
- Added regression coverage for suspend semantics in `npm.cmd run test:scorm`.
- Regenerated `projects/calm3new/exports/calm3new-scorm-2004.zip`.
- Regenerated `projects/calm3new/exports/calm3new-scorm-1-2.zip`.
- Regenerated `projects/calm-module/exports/calm-module-scorm-2004.zip`.
- Regenerated `projects/calmmodule2/exports/calmmodule2-scorm-2004.zip`.
- Captured the approved design and execution plan for a future `google-hosted` export target backed by Firebase Hosting, Google sign-in, and Firestore resume.

## What still needs validation
- None. User confirmed Brightspace persistence works with the updated SCORM package flow.

## Known risks
- Learner resume is most reliable when the exported `Save and Exit` control is used before closing the SCO.
- SCORM 1.2 has lower suspend-data capacity; long free-text states can exceed limits.
- `google-hosted` is planned only in this commit; no Firebase-backed export implementation exists yet.

## Exact next command
`Get-Content docs/plans/2026-03-11-google-hosted-export.md`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-03-11-google-hosted-export.md`

## Do not do next / warnings
- Do not rely on Brightspace impersonation alone when validating cross-browser resume.
- Do not commit regenerated runtime or prompt-pack noise unrelated to this SCORM fix.
- Do not assume Google Sites alone can provide cross-device resume; the planned Google path depends on Firebase-backed identity and storage.
