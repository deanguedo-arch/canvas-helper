# Handoff

- Project: repo-wide
- Task: Refactor Canvas Helper operating model around workflow-aware rules, enforceable source-of-truth metadata, and two-mode prompting
- Status: ready for validation

## Files changed
- AGENTS.md
- .cursorrules
- .cursor/rules/base-repo-contract.mdc
- .cursor/rules/default-mode.mdc
- .cursor/rules/canvas-mode.mdc
- .cursor/rules/mode-switching.mdc
- scripts/lib/types.ts
- scripts/lib/projects.ts
- scripts/lib/importer.ts
- scripts/lib/engine/context-builder.ts
- scripts/lib/project-manifest-policy.ts
- scripts/validate-project-metadata.ts
- scripts/verify-project.ts
- scripts/tests/project-manifest-policy.test.ts
- scripts/tests/generation-context-builder.test.ts
- package.json
- README.md
- ARCHITECTURE.md
- CONTRIBUTING.md
- docs/ops/HANDOFF.md
- docs/ops/FAST_PATHS.md
- docs/ops/README.md
- docs/ops/session-checklist.md
- docs/ops/agent-prompt-templates.md
- docs/workflows/README.md
- docs/workflows/conversion.md
- docs/workflows/generated-course.md
- docs/workflows/injection-integration.md
- docs/workflows/prompt-contract.md
- projects/forensics/meta/project.json
- projects/forensics35/meta/project.json
- projects/calm-module-4/meta/project.json
- docs/ops/ARCHIVED_HANDOFFS.md
- docs/ops/ACTIVE_HANDOFF.md

## What changed
- Reframed repo contract and Cursor rule surfaces around three official workflows: `conversion`, `generated-course`, and `injection/integration`.
- Kept only the two active modes (`CANVAS`, `DEFAULT`) with behavior split aligned to artifact work vs integration/stability work.
- Added explicit artifact-role, source-of-truth, and regeneration discipline in governance docs.
- Extended project manifest schema in `scripts/lib/types.ts` with workflow/project/source-of-truth metadata fields.
- Added manifest policy normalization + validation in `scripts/lib/project-manifest-policy.ts`.
- Added a lightweight manifest validation command: `npm run validate:manifests`.
- Hooked project metadata validation into `npm run verify` so migrated active projects must declare required fields.
- Updated importer defaults to write migrated metadata for new imports.
- Rewrote generation system context to support imported-first-pass expansion, conversion enhancement, and injection/integration work.
- Added workflow pattern library and prompt contract docs under `docs/workflows/`.
- Backfilled exemplar project metadata for:
  - `forensics35` (conversion)
  - `calm-module-4` (generated-course)
  - `forensics` (hybrid/integration)

## Why this changed
- Current project work was outpacing operational discipline (source drift, reference ambiguity, mixed prompting behavior).
- The repo needed enforceable metadata and clearer workflow/mode contracts to reduce re-discovery and improve consistency across sessions and machines.

## Source of truth
- Governance/rules source of truth: `AGENTS.md` + `.cursor/rules/*` + `.cursorrules`.
- Workflow memory/prompting source of truth: `docs/workflows/*` + `docs/ops/*`.
- Metadata policy source of truth: `scripts/lib/project-manifest-policy.ts`.
- Project metadata source of truth: `projects/<slug>/meta/project.json`.

## Fragile areas / watchouts
- Existing non-backfilled projects still normalize to `migrationState: legacy`; validation intentionally skips them until migrated.
- Some projects may require metadata backfill before strict migrated validation can be rolled out repo-wide.
- Forensics bundle regeneration remains documented as manual; future automation can replace that note with an executable command.

## Next prompt should assume
- Workflow model is now official and should be included in prompts (`Mode + Workflow + Canonical entry + Boundary + Source-of-truth constraints + Success criteria`).
- Active migrated projects should pass `validate:manifests` and `verify` metadata policy checks.
- Continue CALM Module 4 deploy work only after adding `projects/calm-module-4/meta/google-hosted.deploy.json`.

## What still needs validation
- Run `npm run validate:manifests` across all projects and decide migration/backfill priority for any remaining legacy slugs.
- Manual sanity check in Studio that exemplar metadata backfill aligns with active file reality (especially injected-component statuses).
- Confirm team preference on eventually enforcing migrated metadata for all active projects (timeline decision).

## Known risks
- Legacy projects can still bypass strict metadata validation by design until migrated.
- Metadata accuracy depends on ongoing handoff discipline; stale `canonicalSources` can still happen if updates are not maintained.

## Exact next command
`npm run validate:manifests`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/prompt-contract.md`

## Do not do next / warnings
- Do not edit `projects/<slug>/raw/**` or `projects/<slug>/exports/**` by hand.
- Do not mark legacy projects as migrated without completing canonical/source-of-truth fields.
