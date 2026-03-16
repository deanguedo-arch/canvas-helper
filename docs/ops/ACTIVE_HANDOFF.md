# Handoff

- Project: forensics + repo-wide e2e platform
- Task: continue from e2e MVP into high-confidence suite planning and execution
- Status: in progress

## Files changed
- package.json
- scripts/run-e2e-project.ts
- e2e/specs/core-project-contract.spec.ts
- e2e/specs/deep-project-contract.spec.ts
- e2e/lib/load-project-contract.ts
- e2e/lib/project-contract-schema.ts
- e2e/lib/contract-preflight.ts
- e2e/lib/contract-assertions.ts
- e2e/project-e2e-contract.schema.json
- projects/e2e-fixture/workspace/index.html
- projects/e2e-fixture/meta/e2e-contract.json
- projects/forensics/meta/e2e-contract.json
- projects/forensics/workspace/main.jsx
- projects/forensics/workspace/main.js
- projects/forensics/workspace/index.html
- AGENTS.md
- docs/ops/FAST_PATHS.md
- scripts/tests/e2e-contract-harness.test.ts
- scripts/tests/fixtures/e2e-contracts/invalid-unknown-check.json
- scripts/tests/fixtures/e2e-contracts/invalid-extra-property.json
- scripts/tests/fixtures/e2e-contracts/invalid-mode.json
- scripts/tests/fixtures/e2e-contracts/invalid-empty-deep.json
- scripts/tests/fixtures/e2e-contracts/invalid-bad-assertion-profile.json
- docs/ops/ACTIVE_HANDOFF.md

## What changed
- Added strict project-contract schema validation (Zod) with deep-target requirements and assertion profile checks.
- Added preflight required `data-testid` enforcement plus helper assertions for state-change checks.
- Tightened deep project-contract spec to fail fast on missing slug/empty targets and assert state transitions for mode, lesson open, quiz, section mode, and node nav.
- Added deterministic quiz navigation state in fixture + forensics (`data-current`) and lesson active hooks (`data-active`).
- Added harness tests and invalid contract fixtures for the strict contract path.
- Updated FAST_PATHS + AGENTS to document strict project-contract expectations.
- Hardened forensics workspace preview to never render an empty shell during e2e runs (fallback course, safe lesson/module lists, query-expands module sections).
- Deep spec now resets to learner mode before module targets, clears search after lesson select, and makes node-nav check use enabled controls.

## What still needs validation
- Run harness validation: `npm run test:e2e:harness`.
- Run fixture deep suite: `npm run test:e2e:project -- --project e2e-fixture`.
- Run smoke: `npm run test:e2e:smoke`.

## Known risks
- Quiz navigation checks now require `data-current` on quiz question buttons; additional projects will need that hook when they opt-in.
- Forensics deep checks rely on lesson search + module expansion behavior; if the module list UI changes, update `data-testid` hooks.

## Exact next command
`npm run test:e2e:harness`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/e2e/specs/deep-project-contract.spec.ts`

## Do not do next / warnings
- Do not edit `projects/forensics/raw/**` or `projects/resources/forensics/**` directly.
- Do not commit `MY OWN BUILT QUIZ GENERATOR/` or unrelated untracked `projects/processed/**` files.
- Do not remove shared e2e selectors/contracts without updating specs.
