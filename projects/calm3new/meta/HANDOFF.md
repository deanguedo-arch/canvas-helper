# Handoff

- Project: repo-wide (calm3new + calm-module + calmmodule2)
- Task: Add SCORM export support in Studio/CLI and regenerate SCORM 2004 packages with suspend-data restore fix.
- Status: ready for validation

## Files changed
- scripts/lib/scorm.ts
- scripts/lib/exporter.ts
- scripts/export-scorm.ts
- scripts/tests/scorm-export.test.ts
- package.json
- app/server/lib/types.ts
- app/server/lib/command-runner.ts
- app/studio/src/lib/types.ts
- app/studio/src/hooks/useProjectCommands.ts
- README.md
- ARCHITECTURE.md
- projects/calm3new/meta/HANDOFF.md
- projects/genpsy-studio/meta/HANDOFF.md (deleted)

## What changed
- Added SCORM export command: `npm.cmd run export:scorm -- --project <slug> [--version 2004|1.2]`.
- Added SCORM 2004 and SCORM 1.2 command buttons in Studio.
- Added SCORM manifest generation and package builder (`imsmanifest.xml` + zip).
- Added SCORM bridge injection (`scorm-bridge.js`) to sync tracked localStorage keys into `cmi.suspend_data`.
- Fixed restore timing so bridge boots immediately before app script initialization.
- Regenerated SCORM packages:
  - `projects/calm3new/exports/calm3new-scorm-2004.zip`
  - `projects/calm3new/exports/calm3new-scorm-1-2.zip`
  - `projects/calm-module/exports/calm-module-scorm-2004.zip`
  - `projects/calmmodule2/exports/calmmodule2-scorm-2004.zip`

## What still needs validation
- Validate cross-browser resume in Brightspace using an actual learner identity (or impersonated learner), not only teacher `View as Student`.
- Validate `calm-module` and `calmmodule2` persistence behavior after publish via SCORM `Manage Versions`.

## Known risks
- `View as Student` role-switch is not a reliable SCORM persistence validator.
- SCORM 1.2 has lower suspend-data capacity; long free-text states can exceed limits.
- Export commands refreshed intelligence artifacts across multiple project meta/resource files; review before commit if you want a narrower diff.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm3new\meta\HANDOFF.md`

## Do not do next / warnings
- Do not use single-HTML upload as the tracked learner activity when account-level resume is required.
- Do not assume failed `View as Student` tests mean SCORM is broken.
- Do not replace SCORM content by raw file upload; use Brightspace SCORM `Manage Versions` to publish updated zips.
