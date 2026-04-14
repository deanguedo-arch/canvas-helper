# Handoff

- Project: repo-wide
- Task: Add Firebase-hosted progress reporting for required in-app course completion
- Status: ready for validation

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\progress-report.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\google-hosted.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\exports\google-hosted.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\report-progress.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\report-all-progress.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\report-progress.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\progress-report.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\google-hosted-export.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\google-hosted-deploy.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\google-hosted-deploy.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\report-all-progress.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\package.json
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\firebase-progress-reporting.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\google-hosted-deploy.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\report-all-progress.bat
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calmmodule2\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics35\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\experimental-psych-30-per-1-a-b-sec-s-202632352\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\experimental-psych-30-per-1-a-b-sec-s-202632352\meta\google-hosted.deploy.json

## What changed
- Added a provider-neutral progress-report contract and extractor for required web-app completion.
- Added course-shell required-item extraction from `workspace/course-shell-data.js`.
- Updated Google-hosted exports to embed required progress items in `google-hosted-bridge.js`.
- Updated the hosted Firebase bridge to write `progressSummary`, `userEmail`, and `userName` beside existing saved state.
- Updated the hosted Firebase bridge to upgrade older saved documents on sign-in when progress reporting exists but the remote document still has no usable `progressSummary`.
- Added `npm run report:progress` to export Firestore student progress documents to CSV.
- Added focused tests for progress extraction, CSV formatting, and Google-hosted bridge inclusion.
- Added Firebase progress reporting documentation.
- Added a Google-hosted deployability guard so courses missing the current progress-reporting bridge are excluded from deploy.
- Documented the deploy readiness rule that `google-hosted-bridge.js` must include progress reporting markers.
- Added a shared Firestore report helper so CSV pull logic is reused by single-course and report-all flows.
- Added `npm run report:all` to auto-discover all deployable Google-hosted Firebase courses and write combined CSV output.
- Added `report-all-progress.bat` to write `reports/latest-progress.csv` plus a timestamped CSV without needing a manual course list.
- Regenerated the General Psychology Google-hosted export bundle so it includes the new progress reporting bridge.
- Restored General Psychology deploy readiness files from the existing public Firebase config and deploy metadata.
- Deployed General Psychology to Firebase Hosting site `generalpsychology`.
- Re-deployed General Psychology after adding the saved-document progress upgrade path.
- Exported and deployed `calm-module`, `calm-module-4`, `calm3new`, `calmmodule2`, and `forensics`.
- Restored missing deploy readiness files for `forensics35` from the existing public Firebase config and deployed it.
- Added deploy metadata/config for `experimental-psych-30-per-1-a-b-sec-s-202632352` using existing site `experimentalpsychology`, then exported and deployed it.

## Why this changed
- The district reporting need is percentage completion for required student-facing work inside Firebase-hosted course web apps.
- The existing Google-hosted bridge already persisted per-student state, so the smallest stable solution is to normalize progress at save time and pull CSV reports from Firestore.
- New Firebase sites need progress reporting attached automatically, so deploy readiness now fails closed when the export was not regenerated with the current bridge.

## Source of truth
- Reporting code: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\progress-report.ts
- Firebase hosted bridge: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\google-hosted.ts
- Export integration: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\exports\google-hosted.ts
- Reporting docs: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\firebase-progress-reporting.md
- Deploy readiness guard: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\google-hosted-deploy.ts
- Report-all entrypoint: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\report-all-progress.ts

## Fragile areas / watchouts
- Courses without `workspace/course-shell-data.js` can still save raw state and snapshot-derived progress, but may report `requiredCount: 0` until a required-item manifest is available.
- The browser bridge stores `userEmail` and `userName` when Firebase Auth provides them; confirm this is acceptable for the district privacy posture before production rollout.
- Firestore rules in generated deploy docs still only allow students to read/write their own document. CSV export uses a service account for reporting.
- Previously exported Firebase bundles for the listed deployed courses now include the progress bridge. Any other Firebase course not listed here still needs export/deploy.
- `npm run deploy:google-hosted` now hides/skips projects if `google-hosted-bridge.js` is missing `progressSummary`, `progressItems`, or `shouldUpgradeProgressSummary`.

## Next prompt should assume
- The current task is repo-wide Firebase progress reporting, not Forensics QA.
- Keep changes inside export/reporting code unless a course-specific adapter is explicitly needed.
- Do not edit `projects/<slug>/raw/**` or generated Firebase export bundles manually.

## What still needs validation
- `npm run test:progress-report` passed.
- `npm run test:google-hosted` passed after adding the progress-upgrade assertion.
- `npx tsx --test scripts/tests/google-hosted-deploy.test.ts` passed after adding the deploy guard.
- `npm run test:report-all-progress` passed.
- `npm run typecheck` passed.
- `npm run export:google-hosted -- --project general-psychology-20-independent-studies-202633108` passed.
- `npm run deploy:google-hosted -- --project general-psychology-20-independent-studies-202633108` passed twice, including the second deployment with the upgrade path.
- `npm run export:google-hosted` passed for `calm-module`, `calm-module-4`, `calm3new`, `calmmodule2`, `forensics`, `forensics35`, and `experimental-psych-30-per-1-a-b-sec-s-202632352`.
- `npm run deploy:google-hosted -- --project calm-module,calm-module-4,calm3new,calmmodule2,forensics` passed.
- `npm run deploy:google-hosted -- --project forensics35,experimental-psych-30-per-1-a-b-sec-s-202632352` passed after rewriting new JSON files as BOM-free UTF-8.
- Manually open https://generalpsychology.web.app/, sign in, complete a few items, and confirm Firestore receives `progressSummary`.
- Manually open each deployed course once with a test account to trigger progress-save upgrades, then run CSV reports.
- Deploy or locally test against a Firebase project before relying on live district reporting.

## Known risks
- The report command requires a Firebase service account with Firestore read permission.
- The first implementation uses generic completion-state detection. A course-specific adapter may be needed if a course stores completion in an unusual shape.
- Deployment emitted Node deprecation warnings for child-process shell args and `punycode`, but Firebase deployment completed successfully.
- `progress.csv` was locked/open during one rerun, so write failed with `EBUSY`; use a different `--out` path or close the CSV before rerunning.

## Exact next command
`npm run report:progress -- --firebase-project calm-module-one --course general-psychology-20-independent-studies-202633108 --out progress.csv --service-account <path-to-service-account.json>`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\progress-report.ts`

## Do not do next / warnings
- Do not hand-edit generated Firebase export bundles; regenerate them with `npm run export:google-hosted -- --project <slug>`.
- Do not treat client-side domain filtering as the reporting security model. Use Firestore rules or service-account exports for staff access.
