# Handoff

- Project: repo-wide
- Task: Complete workflow operating-system refactor and deterministic clarification policy, then leave one clean continuation point
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/AGENTS.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursorrules
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/base-repo-contract.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/canvas-mode.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/default-mode.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/mode-switching.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/types.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/projects.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/importer.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/project-manifest-policy.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/engine/context-builder.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/validate-project-metadata.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/verify-project.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/tests/project-manifest-policy.test.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/tests/generation-context-builder.test.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/README.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/conversion.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/generated-course.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/injection-integration.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/prompt-contract.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/FAST_PATHS.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/README.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/session-checklist.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/agent-prompt-templates.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/README.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/ARCHITECTURE.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/CONTRIBUTING.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/meta/project.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics35/meta/project.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module-4/meta/project.json

## What changed
- Reframed the repo around three official workflows (`conversion`, `generated-course`, `injection/integration`) with explicit two-mode behavior (`CANVAS`, `DEFAULT`).
- Added source-of-truth metadata schema fields and migrated exemplar project manifests.
- Added lightweight manifest policy enforcement and CLI validation command (`validate:manifests`), plus verify-time policy checks.
- Rewrote generation context guidance to support imported-first-pass expansion, conversion enhancement, and injection/integration.
- Added deterministic clarification policy in `AGENTS.md` plus mode-specific clarification behavior in Cursor mode rules.
- Added prompt-layer clarification rule in `docs/workflows/prompt-contract.md`.

## Why this changed
- To reduce source-of-truth drift and repetitive clarification loops while keeping workflow quality high and prompts more surgical.

## Source of truth
- Repo operating policy: `AGENTS.md` + `.cursor/rules/*` + `.cursorrules`
- Metadata policy enforcement: `scripts/lib/project-manifest-policy.ts`
- Prompt behavior contract: `docs/workflows/prompt-contract.md`

## Fragile areas / watchouts
- Legacy projects remain intentionally skipped by strict metadata validation until migrated.
- Manifest discipline still depends on maintaining `canonicalSources` and injected-component statuses during future edits.
- Forensics bundle regeneration is still documented as manual; this can be automated later.

## Next prompt should assume
- Complete prompts with required fields should execute immediately; ambiguous prompts should trigger exactly one high-leverage question.
- Migrated active projects should pass `validate:manifests` and verify-time metadata checks.

## What still needs validation
- Run behavior spot-checks on one task per workflow type to confirm clarification behavior in practice.
- Decide migration schedule for remaining legacy project manifests.

## Known risks
- This is still policy-driven behavior, not a hard runtime prompt form; quality depends on consistent prompt discipline.
- Policy drift is possible if future rule edits are not kept synchronized.

## Exact next command
`npm run validate:manifests`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/prompt-contract.md`

## Do not do next / warnings
- Do not edit `projects/<slug>/raw/**` or `projects/<slug>/exports/**` directly.
- Do not mark legacy projects as migrated until required source-of-truth fields are populated.
