# Fast Paths

Use these retrieval shortcuts before broader discovery. The point is to keep agent work surgical.

## Export Target Work

Read first:
- `app/shared/studio-commands.ts`
- `scripts/lib/exporter.ts`
- `scripts/lib/exports/<target>.ts`
- `scripts/lib/<target-runtime>.ts` when the target injects a browser bridge such as `scorm.ts` or `google-hosted.ts`
- the matching CLI script under `scripts/export-*.ts`
- `docs/ops/apps-script-drive-deploy.md` when the target is `apps-script` or the issue is Google Sites / Drive-backed delivery

Touch docs only if behavior changes:
- `README.md`
- `ARCHITECTURE.md`

Verification floor:
- targeted export test
- `npm run typecheck`

## Studio Command Wiring

Read first:
- `app/shared/studio-commands.ts`
- `app/server/lib/command-runner.ts`
- `app/studio/src/hooks/useProjectCommands.ts`
- `app/studio/src/lib/types.ts`

Do not start by searching the whole repo. The shared command contract is the source of truth.

## E2E Platform Work

Read first:
- `e2e/playwright.config.ts`
- `e2e/specs/core-project-contract.spec.ts`
- `e2e/lib/load-project-contract.ts`
- `e2e/lib/project-open.ts`
- `projects/<slug>/meta/e2e-contract.json`

Touch docs when behavior or policy changes:
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `AGENTS.md`

Verification floor:
- `npm run test:e2e:smoke`
- `npm run test:e2e:project -- --project <slug>` (when project contract changes)
- `npm run test:e2e:harness` (when contract validation or deep checks change)
- `npm run typecheck`

## Intelligence Policy Work

Read first:
- `scripts/lib/intelligence/config/policy.ts`
- `scripts/lib/intelligence/config/defaults.ts`
- `config/intelligence.json`

Then only open collect/apply modules that are directly affected.

## Compact Course Authoring Context

Read first:
- `scripts/lib/course-authoring/context.ts`
- `scripts/lib/engine/context-builder.ts`
- `scripts/lib/engine/apply-generation.ts`
- `projects/<slug>/meta/project.json`
- `scripts/lib/english-unit/workspace-staging.ts` when the project uses `build:english-unit`

Use:
- `npm run course:list -- --all` to distinguish actual readiness from a project lifecycle label; do not treat `active` as permission to edit or rebuild.
- `npm run course:doctor -- --project <slug>` before building a compact course brief
- `npm run context:project -- --project <slug>` only after the doctor passes
- In Studio, leave evidence IDs blank by default; add only exact `unit:`, `outcome:`, `resource:`, or `lesson:` IDs for an intentional narrow context.
- Treat automatic writes as direct-workspace only. Factory and proposal-only projects require their owning rebuild flow.

Verification floor:
- `npm run test:authoring-context`
- `npm run test:metadata-policy`

## Import / Refs Work

Read first:
- `scripts/lib/importer.ts`
- `scripts/lib/references.ts`
- `scripts/lib/paths.ts`
- relevant tests in `scripts/tests/`

## English Course Factory

Read first:
- `docs/workflows/english-course-factory.md`
- `config/english/families/<course>.json`
- `projects/<slug>/meta/prompt-pack.md`
- `projects/<slug>/meta/english-unit.json`
- `scripts/lib/english-unit/factory-build.ts`
- the selected profile in `scripts/lib/english-unit/ela20-activity-profiles.ts`

Do not start from an old unit-specific builder. Rebuild through `npm run build:english-unit -- --project <slug>` and put bespoke sources only under preserved component/custom paths.

Verification floor:
- `npm run test:english-course`
- `npm run verify:english-course -- --course <course>`
- `npm run test:e2e:project -- --project <slug>`
- `npm run test:scorm`

## Handoff Resume

- open `docs/ops/ACTIVE_HANDOFF.md`

## Workflow-Aware Resume

When workflow type is known, read the matching workflow guide immediately after `ACTIVE_HANDOFF`:

- `docs/workflows/conversion.md`
- `docs/workflows/generated-course.md`
- `docs/workflows/injection-integration.md`
- `docs/workflows/prompt-contract.md` for prompt structure

For conversion work, use the ordered playbook in `docs/workflows/conversion.md`:
- Intake + artifact generation
- Preflight audit (encoding/media/paths/order)
- Placement + conversion-status normalization
- Lock behavior pass
- Deploy readiness pass
- Verification floor

## Workflow Shift (High-Confidence E2E)

Before: manual learner/archive passes + spot checks + `verify/typecheck/build`.

Now: define a project contract (`projects/<slug>/meta/e2e-contract.json`) with `assertionProfiles`, `modulePassTargets`, and `visibilityChecks`, then run:
- `npm run test:e2e:project -- --project <slug>`
- `npm run test:e2e:smoke`
- `npm run test:e2e:harness` (when validation/contract strictness changes)
- `npm run verify -- --project <slug>`
- `npm run typecheck`
- `npm run build:studio`

Opt-in new projects by adding their contract and stable `data-testid` hooks in the workspace/player UI so the deep suite can drive module passes consistently.
