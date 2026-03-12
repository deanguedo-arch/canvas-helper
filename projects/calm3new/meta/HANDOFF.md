# Handoff

- Project: repo-wide
- Task: Implement the planned `google-hosted` export target with Firebase-ready runtime, CLI, Studio/server wiring, docs, and smoke/test coverage.
- Status: complete

## Files changed
- scripts/lib/google-hosted.ts
- scripts/lib/exporter.ts
- scripts/export-google-hosted.ts
- scripts/tests/google-hosted-export.test.ts
- scripts/smoke-local-pipeline.ts
- app/server/lib/types.ts
- app/server/lib/command-runner.ts
- app/studio/src/lib/types.ts
- app/studio/src/hooks/useProjectCommands.ts
- package.json
- README.md
- ARCHITECTURE.md
- projects/calm3new/meta/HANDOFF.md

## What changed
- Added `scripts/lib/google-hosted.ts` to generate the hosted runtime bridge, Firebase config templates, hosting config, deploy docs, and HTML bridge injection.
- Added `exportProjectToGoogleHosted(projectSlug)` and `npm.cmd run export:google-hosted -- --project <slug>`.
- Wired `Google Hosted` into Studio/server command routing.
- Added regression coverage for bundle shape, bridge injection, runtime content, and CLI exposure in `scripts/tests/google-hosted-export.test.ts`.
- Extended `npm.cmd run smoke:pipeline` to generate and assert a `projects/<slug>/exports/google-hosted/` bundle.
- Updated `README.md` and `ARCHITECTURE.md` to document the new target and its Firebase deployment boundary.

## What still needs validation
- Manual Firebase deployment and cross-device learner verification on a real school or test Google account.

## Known risks
- The hosted bridge depends on Firebase web config being filled before deployment; placeholder configs fail fast.
- Cross-device resume still depends on school popup-auth policy allowing `signInWithPopup`.
- The bridge relies on detected localStorage keys; projects with nonstandard persistence keys may need targeted adjustment.

## Exact next command
`npm.cmd run export:google-hosted -- --project calm3new`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\exports\google-hosted\README-deploy.md`

## Do not do next / warnings
- Do not deploy the bundle without replacing Firebase placeholder values first.
- Do not broaden Firestore rules beyond `request.auth.uid == userId` for v1.
- Do not assume Google Sites alone provides resume; the persistence contract is Firebase Hosting + Auth + Firestore.
