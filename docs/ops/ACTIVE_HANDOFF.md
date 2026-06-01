# Handoff

- Project: `canvas-helper`
- Active slice: Next Step Simple Ops Firebase deploy + spreadsheet bridge.
- Status: The displayed project is live on Firebase Hosting; spreadsheet bridge is ready in source but still needs a deployed Apps Script `/exec` URL.

## Summary
- Deployed the Next Step Simple Ops displayed project to Firebase Hosting.
- Targeted the existing Firebase Hosting site `nextstepclassroom`, which matches the supplied Firebase app id.
- Live URL: `https://nextstepclassroom.web.app`
- Added Firebase initialization/Analytics to the displayed project using the supplied config.
- Added project-local Firebase config:
  - `projects/next-step-simple-ops-webapp/firebase.json`
  - `projects/next-step-simple-ops-webapp/.firebaserc`
- Added Windows deploy helper:
  - `publish-next-step-simple-ops.bat`
- The `.bat` verifies the Canvas Helper project, builds Studio, then deploys only `hosting:nextstepclassroom`.
- The app still does not send email, post Classroom announcements, delete Classroom content, or bypass Apps Script gates.

## Files changed
- `projects/next-step-simple-ops-webapp/workspace/index.html`
- `projects/next-step-simple-ops-webapp/workspace/styles.css`
- `projects/next-step-simple-ops-webapp/workspace/app.js`
- `projects/next-step-simple-ops-webapp/firebase.json`
- `projects/next-step-simple-ops-webapp/.firebaserc`
- `projects/next-step-simple-ops-webapp/raw/original.html`
- `projects/next-step-simple-ops-webapp/meta/project.json`
- `projects/next-step-simple-ops-webapp/meta/prompt-pack.md`
- `publish-next-step-simple-ops.bat`
- `tasks/next-step-course-builder-lite-extension.gs`
- `scripts/tests/apps-script-tracker-source.test.ts`
- `docs/ops/ACTIVE_HANDOFF.md`
- `.stax/codex-report.md`

## Verification run
- `node --check projects/next-step-simple-ops-webapp/workspace/app.js && npm run verify -- --project next-step-simple-ops-webapp`
  - exit code: `0`
- `npm run build:studio`
  - exit code: `0`
- `npm run test:apps-script`
  - exit code: `0`
  - result: `13/13` tests passed
- `cd projects/next-step-simple-ops-webapp && npx firebase hosting:sites:list --project calm-module-one --json --non-interactive`
  - exit code: `0`
  - confirmed `nextstepclassroom` exists
- `cd projects/next-step-simple-ops-webapp && npx firebase deploy --only hosting:nextstepclassroom --project calm-module-one --non-interactive`
  - exit code: `0`
  - Hosting URL: `https://nextstepclassroom.web.app`
- Live fetch check for `https://nextstepclassroom.web.app/`
  - exit code: `0`
  - HTTP status: `200`
  - contains `Next Step Command Centre`
- STAX visual proof:
  - proof id: `visual_2026-06-01T19_36_42_040Z_abe7c48dd62e`
  - proof path: `.stax/visual-proofs/visual_2026-06-01T19_36_42_040Z_abe7c48dd62e.png`
- STAX observer preflight:
  - exit code: `0`
  - non-blocking observer verdict: `Reject`
  - reason: approval artifact missing and noisy stale STAX history remains from unrelated older tasks

## Known risks / follow-up
- The deployed app is not yet connected to live spreadsheet data.
- The Apps Script bridge must be deployed as a web app and pasted into the Firebase app Settings view.
- The bridge state shape depends on the current sheet names and headers in `tasks/next-step-course-builder-lite-extension.gs`.
- The app intentionally remains read-focused from Firebase; write actions must stay in Apps Script gated flows.

## Source-of-truth location
- Displayed project source:
  - `projects/next-step-simple-ops-webapp/workspace/index.html`
  - `projects/next-step-simple-ops-webapp/workspace/styles.css`
  - `projects/next-step-simple-ops-webapp/workspace/app.js`
- Firebase deploy config:
  - `projects/next-step-simple-ops-webapp/firebase.json`
  - `projects/next-step-simple-ops-webapp/.firebaserc`
  - `publish-next-step-simple-ops.bat`
- Spreadsheet bridge source:
  - `tasks/next-step-course-builder-lite-extension.gs`

## Fragile areas / what might drift
- Recreating the Apps Script deployment may produce a new `/exec` URL.
- The Firebase Hosting site should remain `nextstepclassroom`; deploying default hosting would overwrite a different site.
- Sheet header changes may break bridge fields until mapping code is updated.

## Next prompt assumptions
- The deployed Firebase app is live and ready for bridge connection.
- Next step is Apps Script web app deployment/update, not adding write actions.
- Use Settings in `https://nextstepclassroom.web.app` to save and test the Apps Script `/exec` URL.

## Exact next command
`cd projects/next-step-simple-ops-webapp && npx firebase deploy --only hosting:nextstepclassroom --project calm-module-one --non-interactive`

## Exact next file to open
`tasks/next-step-course-builder-lite-extension.gs`
