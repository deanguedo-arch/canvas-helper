# Handoff

- Project: forensics35
- Task: ship the first rich-content parity pass using the shared course-shell foundation and stabilize project-contract E2E for continuation
- Status: ready for validation

## Files changed
- projects/forensics35/workspace/main.jsx
- projects/forensics35/workspace/main.js
- projects/forensics35/workspace/index.html
- projects/forensics35/workspace/course-shell-data.js
- projects/forensics35/workspace/d2l-map-data.js
- projects/forensics35/meta/e2e-contract.json
- projects/forensics35/meta/assessment-map.json
- projects/forensics35/meta/course-blueprint.json
- projects/forensics35/meta/d2l-course-map.json
- projects/forensics35/meta/d2l-course-map.md
- projects/forensics35/meta/deviation-report.json
- projects/forensics35/meta/deviation-report.md
- projects/forensics35/meta/lesson-packets/*
- scripts/lib/course-shell.ts
- scripts/lib/course-shell-resources.ts
- scripts/lib/course-shell-content-parsers.ts
- scripts/build-course-shell.ts
- scripts/tests/course-shell.test.ts
- scripts/tests/course-shell-resources.test.ts
- scripts/tests/course-shell-content-parsers.test.ts
- scripts/tests/forensics35-workspace.test.ts
- scripts/run-e2e-project.ts
- e2e/specs/core-project-contract.spec.ts
- e2e/specs/deep-project-contract.spec.ts
- package.json

## What changed
- Upgraded course-shell activity contract for render-ready source metadata and hinting.
- Hydrated shell build with reference index/resource catalog excerpts.
- Added parser utilities and tests for XML/content extraction behavior.
- Switched `forensics35` workspace to richer React player (`main.jsx`) and browser-safe transpiled runtime (`main.js`).
- Generated `forensics35` shell/map/meta artifacts and synced workspace data.
- Added project E2E contract and stabilized core/deep contract runs for `forensics35`.
- Updated Windows project E2E runner invocation to avoid `spawn EINVAL`.

## What still needs validation
- Manual QA pass in Studio for Modules 1-3 content depth and UX parity.
- Increase deep contract coverage from minimal target(s) to full module certification profile.
- Confirm final Firebase-hosted behavior after deployment from updated export output.

## Known risks
- Deep E2E coverage is currently narrow by design for stability.
- Some richer player behavior is inherited from `forensics` runtime and may need additional `forensics35` cleanup in follow-up.
- Parallel Playwright runs can collide on Vite port `4173`.

## Exact next command
`npm.cmd run test:e2e:project -- --project forensics35`

## Exact next file to open
`projects/forensics35/meta/e2e-contract.json`

## Do not do next / warnings
- Do not edit `projects/forensics35/raw/**`.
- Do not hand-edit generated export artifacts in `projects/forensics35/exports/**`.
- Do not run project/deep Playwright contract commands in parallel.
