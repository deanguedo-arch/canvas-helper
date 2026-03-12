# Handoff

- Project: repo-wide
- Task: Reduce agent/file churn by decoupling exports from intelligence refresh, centralizing Studio command metadata, splitting export target modules, adding fast-path ops guidance, and adding popup-to-redirect auth fallback for Google-hosted sign-in.
- Status: complete

## Files changed
- app/shared/studio-commands.ts
- scripts/lib/exports/shared.ts
- scripts/lib/exports/brightspace.ts
- scripts/lib/exports/scorm-package.ts
- scripts/lib/exports/google-hosted.ts
- scripts/lib/exports/single-html.ts
- scripts/lib/exporter.ts
- scripts/lib/projects.ts
- scripts/tests/helpers/project-fixture.ts
- scripts/tests/google-hosted-export.test.ts
- scripts/lib/google-hosted.ts
- app/server/lib/types.ts
- app/server/lib/command-runner.ts
- app/studio/src/lib/types.ts
- app/studio/src/hooks/useProjectCommands.ts
- package.json
- README.md
- ARCHITECTURE.md
- docs/ops/FAST_PATHS.md
- docs/ops/HANDOFF.md
- docs/ops/ACTIVE_HANDOFF.md

## What changed
- Export commands now mark the workspace approved without regenerating prompt-pack or other intelligence artifacts.
- Studio command ids, labels, refresh behavior, and CLI args now come from `app/shared/studio-commands.ts`.
- Export target orchestration was split into `scripts/lib/exports/` modules with `scripts/lib/exporter.ts` as a thin facade.
- Added reusable test fixture helpers for export tests.
- Added fast retrieval guidance and standardized repo-wide handoff location.
- Google-hosted runtime now falls back to redirect auth when popup sign-in is blocked or cancelled, and resumes via `getRedirectResult()`.

## What still needs validation
- Confirm the updated export flow feels materially faster during normal Studio use on a real project loop.
- Confirm popup-blocked environments can complete Google-hosted sign-in via redirect and still restore state.

## Known risks
- Any hidden caller that relied on exports to regenerate prompt-pack will now need an explicit intelligence command.
- Future Studio commands should use `app/shared/studio-commands.ts`; bypassing it reintroduces drift.
- Redirect auth can trigger full-page reloads in locked-down environments; the bridge assumes Firebase redirect handling is allowed.

## Exact next command
`npm run export:google-hosted -- --project calm3new`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/FAST_PATHS.md`

## Do not do next / warnings
- Do not reintroduce `refreshProjectIntelligence(...)` inside export targets unless the user explicitly asks for coupled export-plus-intelligence behavior.
- Do not add new Studio commands by editing only one side of the stack; use the shared command contract.
- Do not assume popup auth is available in school browsers; verify redirect flow on a real deployment.
