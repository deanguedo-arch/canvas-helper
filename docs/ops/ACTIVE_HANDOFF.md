# Handoff

- Project: authoring preference enforcement
- Task: enforce style/decision preferences across conversion/export/deploy with fail-fast deviations and preference-learning overrides
- Status: complete

## Files changed
- config/authoring-preferences.json
- docs/plans/2026-03-13-authoring-preference-enforcement-design.md
- docs/plans/2026-03-13-authoring-preference-enforcement.md
- scripts/lib/types.ts
- scripts/lib/paths.ts
- scripts/lib/intelligence/config/authoring-preferences.ts
- scripts/lib/intelligence/apply/deviation-gate.ts
- scripts/lib/conversion/hss1010.ts
- scripts/convert-hss1010.ts
- scripts/lib/exports/shared.ts
- scripts/lib/exports/google-hosted.ts
- scripts/lib/exports/brightspace.ts
- scripts/lib/exports/scorm-package.ts
- scripts/lib/exports/single-html.ts
- scripts/export-google-hosted.ts
- scripts/export-brightspace.ts
- scripts/export-brightspace-package.ts
- scripts/export-html.ts
- scripts/export-scorm.ts
- scripts/deploy-google-hosted.ts
- scripts/tests/authoring-preferences.test.ts
- scripts/tests/deviation-gate.test.ts
- scripts/tests/hss1010-conversion.test.ts
- scripts/tests/google-hosted-export.test.ts
- README.md
- ARCHITECTURE.md
- CONTRIBUTING.md
- docs/ops/ACTIVE_HANDOFF.md

## What changed
- Added explicit repo/project authoring preference model with deterministic precedence:
  - CLI override
  - project override
  - selected benchmark defaults
  - repo defaults
- Added fail-fast deviation gate:
  - writes `meta/deviation-report.json` and `meta/deviation-report.md`
  - blocks on `error` deviations
  - supports explicit acceptance with reason
  - supports updating repo/project preferences from accepted deviations
- Wired gate into:
  - `convert:hss1010`
  - export targets (google-hosted, brightspace, scorm, single-html)
  - `deploy:google-hosted` precheck before Firebase deploy
- Added CLI override flags on convert/export/deploy scripts:
  - `--accept-deviations`
  - `--because`
  - `--update-preferences`
  - `--preference-scope`
- Added tests for:
  - preference resolution precedence
  - deviation gate behavior and report output
  - conversion fail-fast + acceptance update path
  - google-hosted export fail-fast + acceptance update path

## Verification run
- `npx tsx --test scripts/tests/authoring-preferences.test.ts`
- `npx tsx --test scripts/tests/deviation-gate.test.ts`
- `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
- `npx tsx --test scripts/tests/google-hosted-export.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`

## Known risks
- Default repo preference rules are advisory (`warn`) to avoid blocking existing projects. Teams that want strict enforcement should promote rules to `error`.
- Deviation checks currently run on file-content heuristics (pattern-based), not semantic AST-level analysis.
- Deploy precheck assumes exported `index.html` as primary entrypoint.

## Exact next command
`npm.cmd run export:google-hosted -- --project <slug>`

## Exact next file to open
`C:/Users/dean.guedo/Documents/GitHub/canvas-helper/config/authoring-preferences.json`

## Do not do next / warnings
- Do not set aggressive repo-wide `error` rules without validating existing course outputs first.
- Do not use `--accept-deviations` without `--because`; this now fails by design.
