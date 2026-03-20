# Handoff

- Project: calm-module-4
- Task: Finish the CALM Module 4 workspace surface and prepare the remaining Firebase app upload
- Status: blocked

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\main.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\components\careerplanning.reference.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\components\resourcefulpeople.reference.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\components\masterplan.reference.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\components\resumebuilder.reference.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\components\coverletterbuilder.reference.jsx

## What changed
- Added `Career Planner` as the visible label for the `portfolio` unit in the module list and kept it routed to the career-planning activity.
- Inserted `Resourceful People` immediately after `Career Planner` and `Master Plan` immediately after `Resourceful People`.
- Copied the Canvas activity code for `Resourceful People` and `Master Plan` into workspace component files so they render as full activities in the module flow.
- Kept the Resume Builder and Cover Letter Builder activities wired into the same workspace pattern and left their shell behavior responsive.
- Adjusted the Career Planning and Master Plan layouts so they fit better with the open sidebar and the widened workspace shell.
- Rebuilt the workspace bundle and verified the calm-module-4 project contract after the layout and ordering changes.
- The Firebase app upload is still pending. This slug does not yet have a `projects/calm-module-4/meta/google-hosted.deploy.json` file, so the deploy path is not ready yet.

## What still needs validation
- Create `projects/calm-module-4/meta/google-hosted.deploy.json` with the Firebase project id and hosting site id for this module.
- Generate or confirm the Google Hosted export bundle for `calm-module-4` if this upload will use the deploy tool.
- Run the Firebase deploy flow once the deploy config exists.
- Do a final browser pass in Studio with the sidebar open and closed to confirm the wide-shell layout still feels balanced.

## Known risks
- No Firebase deploy config currently exists for `calm-module-4`, so upload to the Firebase app is still blocked.
- The repo still shows expected external font/CDN warnings in `npm run verify`.
- The workspace now depends on several copied activity components, so future layout changes should preserve the current unit order and shell assumptions.

## Exact next command
`npm.cmd run deploy:google-hosted`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\meta\google-hosted.deploy.json`

## Do not do next / warnings
- Do not edit `projects/calm-module-4/raw/**` or `projects/calm-module-4/exports/**` by hand.
- Do not attempt the Firebase upload until the deploy config file exists and the project/site ids are confirmed.
