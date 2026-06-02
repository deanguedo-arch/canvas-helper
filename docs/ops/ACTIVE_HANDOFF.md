# Handoff

- Project: `forensicstudiesoption2`
- Task: Generate and validate the Apps Script / Google Drive package for Forensic Studies Option 2.
- Status: `ready for Apps Script deployment validation`

## Files changed
- `scripts/lib/exports/shared.ts`
- `scripts/lib/apps-script.ts`
- `scripts/tests/apps-script-export.test.ts`
- `projects/forensicstudiesoption2/meta/project.json`
- `projects/forensicstudiesoption2/meta/deviation-report.md`
- `projects/forensicstudiesoption2/meta/deviation-report.json`
- Generated output: `projects/forensicstudiesoption2/exports/apps-script/`
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed
- Generated the Apps Script package at `projects/forensicstudiesoption2/exports/apps-script/`.
- The generated package contains `Code.gs`, `appsscript.json`, `.claspignore`, `README-deploy.md`, and `drive-assets/`.
- The package includes 4 shell files and 29 Drive asset files; `asset-manifest.json` lists 27 course assets plus the shell and manifest files.
- `Code.gs` includes Apps Script autosave for all 10 tracked Forensics keys:
  - `forensicstudiesoption2.progress`
  - `forensicstudiesoption2.ui`
  - `forensics::module1assignment::v1`
  - `forensics::module2assignment::v1`
  - `forensics::module3assignment::v1`
  - `forensics::module4assignment::v1`
  - `forensics::module5assignment::v1`
  - `forensics::module6assignment::v1`
  - `forensics::module7assignment::v1`
  - `forensics::module8assignment::v1`
- Fixed a shared export bug where local route-like references that resolve to directories, such as `assignments/module2`, were treated as file assets.
- Added an Apps Script export regression test for directory references.

## Why this changed
- The user could not use Brightspace SCORM upload and asked to try the Google Apps Script treatment for the same course.
- Apps Script autosave can provide cross-browser persistence through `google.script.run` and Drive-backed private JSON autosave records after live deployment.
- The Forensics workspace has a route-like string reference to a local directory; the exporter needed to skip directories and only embed regular files.

## Source of truth
- Course source:
  - `projects/forensicstudiesoption2/workspace/index.html`
  - `projects/forensicstudiesoption2/workspace/main.js`
  - `projects/forensicstudiesoption2/workspace/course-data.js`
  - `projects/forensicstudiesoption2/workspace/assignments/`
- Apps Script exporter:
  - `scripts/lib/exports/apps-script.ts`
  - `scripts/lib/apps-script.ts`
  - `scripts/lib/exports/shared.ts`
  - `scripts/export-apps-script.ts`
- Generated package:
  - `projects/forensicstudiesoption2/exports/apps-script/`

## Fragile areas / watchouts
- The package is generated and verified locally, but it has not been deployed to a live Apps Script web app.
- Raw `drive-assets/__canvas_helper_shell/index.html` is not a full local preview because `Code.gs` injects the Apps Script asset and autosave bootstrap at runtime.
- Cross-browser autosave only works from the deployed Apps Script `/exec` URL with `google.script.run` available.
- Learners must be signed into a Google account consistently across browsers/devices for reliable restore.
- Upload the `drive-assets` folder itself to Google Drive, not its parent folder.
- Existing dirty files under `projects/forensicstudiesoption2-nextstep-test/meta/*` predated this work and were not touched.

## Next prompt should assume
- Latest scope is only `forensicstudiesoption2`.
- The Apps Script package has been generated and includes the Forensics autosave keys.
- `.clasp.json` is not present yet in `projects/forensicstudiesoption2/exports/apps-script/`, so the Apps Script project has not been linked locally.
- No Google Drive upload, `clasp push`, Apps Script version, or web-app deployment was performed.

## What still needs validation
- Upload `projects/forensicstudiesoption2/exports/apps-script/drive-assets` to Google Drive.
- Create or link a standalone Apps Script project from `projects/forensicstudiesoption2/exports/apps-script`.
- Set the uploaded Drive folder ID with `setDriveRootFolderId("FOLDER_ID")` or a temporary no-argument helper.
- Run `rebuildDriveAssetIndex()` in Apps Script.
- Deploy as a web app, open the `/exec` URL in a browser, and verify course load, assignments, images, autosave status, and cross-browser restore.

## Known risks
- A local file preview cannot prove Apps Script autosave because `google.script.run` exists only in Apps Script.
- If Drive permissions are too narrow, binary assets may not render for learners.
- If the Drive root folder ID points at the parent folder instead of `drive-assets`, Apps Script will report missing indexed assets.

## Exact next command
`Set-Location "C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensicstudiesoption2\exports\apps-script"; clasp create --type webapp --title "forensicstudiesoption2"`

## Exact next file to open
`projects/forensicstudiesoption2/exports/apps-script/README-deploy.md`

## Do not do next / warnings
- Do not paste browser HTML or JS files into Apps Script as `.gs`; only push the generated shell files.
- Do not deploy or publish a new Apps Script web app without confirming the Google Drive `drive-assets` upload and folder ID.
- Do not overwrite unrelated course exports.
