# Handoff

- Project: forensics + repo-wide e2e platform
- Task: continue from e2e MVP into high-confidence suite planning and execution
- Status: in progress

## Files changed
- package.json
- package-lock.json
- scripts/run-e2e-project.ts
- e2e/playwright.config.ts
- e2e/specs/core-project-contract.spec.ts
- e2e/lib/load-project-contract.ts
- e2e/lib/project-open.ts
- e2e/project-e2e-contract.schema.json
- projects/e2e-fixture/raw/original.html
- projects/e2e-fixture/workspace/index.html
- projects/e2e-fixture/meta/project.json
- projects/e2e-fixture/meta/e2e-contract.json
- projects/forensics/meta/e2e-contract.json
- app/studio/src/App.tsx
- app/studio/src/components/Topbar.tsx
- app/studio/src/components/WorkspacePicker.tsx
- app/studio/src/components/PreviewPane.tsx
- AGENTS.md
- .cursorrules
- tasks/active.md
- ARCHITECTURE.md
- CONTRIBUTING.md
- docs/ops/FAST_PATHS.md
- README.md
- projects/forensics/workspace/index.html
- projects/forensics/workspace/main.js
- projects/forensics/workspace/main.jsx
- projects/forensics/meta/residue-audit.md
- docs/ops/ACTIVE_HANDOFF.md

## What changed
- Landed Playwright-based e2e platform MVP with repo-level config, reusable contract loader, and reusable core project contract spec.
- Added deterministic `e2e-fixture` project and a forensics project contract.
- Added stable shared Studio test selectors (`data-testid`) for shell/project root/mode controls/preview frame/fallback panel.
- Added e2e commands: `test:e2e`, `test:e2e:smoke`, `test:e2e:project`.
- Updated AGENTS/cursor/task policy so interaction-heavy tasks require e2e before completion.
- Updated architecture/contributing/fast-path/readme docs for e2e workflow.
- Added explicit high-confidence suite plan in `tasks/active.md` for 1-2 day follow-up.

## What still needs validation
- Execute manual Phase 6A representative module pass list in learner and archive modes.
- Execute the high-confidence suite plan from `tasks/active.md` (expanded module coverage and stronger assertions).

## Known risks
- Forensics deep checks currently rely on lesson search + module expansion behavior; further selector hardening is expected in high-confidence phase.
- Existing unrelated untracked repo noise remains (`MY OWN BUILT QUIZ GENERATOR/`, `projects/processed/**`).
- `verify` still warns about external Tailwind CDN dependency.

## Exact next command
`npm run test:e2e:project -- --project forensics`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/active.md`

## Do not do next / warnings
- Do not edit `projects/forensics/raw/**` or `projects/resources/forensics/**` directly.
- Do not commit `MY OWN BUILT QUIZ GENERATOR/` or unrelated untracked `projects/processed/**` files.
- Do not remove shared e2e selectors/contracts without updating specs.
