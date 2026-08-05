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

## Studio Inspect + Codex Handoff

Read first:
- `app/shared/preview-bridge.ts`
- `app/shared/inspection.ts`
- `app/server/preview-server.ts`
- `app/server/lib/preview-inspection.ts`
- `app/server/routes/inspection.ts`
- `app/server/routes/course-build-brief.ts`
- `app/studio/src/hooks/usePreviewScrollSync.ts`
- `app/studio/src/hooks/useCourseBuildBrief.ts`
- `app/studio/src/components/InspectionPanel.tsx`
- `app/studio/src/components/CourseBuildBriefPanel.tsx`
- `app/studio/src/components/PreviewHealthPanel.tsx`

Rules:
- Keep preview on the isolated loopback origin; never restore iframe DOM reads, wildcard messaging, or a same-origin preview shortcut.
- A preview selection is evidence, not source authority. Resolve canonical targets only through the project driver and fail closed as `unknown` when it cannot be proved.
- Generated Social and English workspaces remain output; packets point to their builder/factory source and rebuild flow.
- Direct-workspace source excerpts are local UI evidence only; never add them to a copied packet. Proposal-only projects must continue to show no safe editable source.
- Re-check confirms only a safe source/rebuild route. A successful Workspace Verify is not proof that the learner-facing change is complete.
- Preview Health is bounded in-memory diagnostic context, not a console capture, and never belongs in a handoff.
- Screenshot capture is explicit Studio-only browser consent. The preview origin must retain `Permissions-Policy: display-capture=()`; images never enter a Codex packet.

Verification floor:
- `npm run test:studio-inspection`
- `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts`
- `npm run build:studio`

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
- `projects/<slug>/meta/project.json`
- `scripts/lib/english-unit/workspace-staging.ts` when the project uses `build:english-unit`
- `scripts/lib/social-resource-manifest.ts` and `scripts/lib/social-build-staging.ts` when the project uses `build:social30`

Use:
- `npm run course:list -- --all` to distinguish actual readiness from a project lifecycle label; do not treat `active` as permission to edit or rebuild.
- `npm run course:doctor -- --project <slug>` before building a compact course brief
- `npm run context:project -- --project <slug>` only after the doctor passes
- Treat Studio as a local read-only inspection and handoff surface. Course changes belong in the declared canonical source or owning rebuild flow.

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
- `npm run test:english-transaction`
- `npm run verify:english-course -- --course <course>`
- `npm run test:e2e:project -- --project <slug>`
- `npm run test:scorm`

## Social 30 Related-Issues Rebuild

Read first:
- `docs/workflows/social-related-issues.md`
- `projects/<slug>/meta/project.json`
- `projects/resources/social30-1-related-issues/resource-manifest.json`
- `scripts/lib/social-resource-manifest.ts`
- `scripts/lib/social-build-staging.ts`
- `scripts/build-social30-related-issues.ts`

Do not start from a personal Downloads path or manually alter `workspace/index.html`. Select a declared source by ID, check the project first, then rebuild one exact issue:

```bash
npm run course:doctor -- --project <issue-slug>
npm run build:social30 -- --resource <resource-id> --only <issue-slug>
```

Verification floor:
- `npm run test:social-build`
- `npm run course:doctor -- --project <issue-slug>`
- `npm run test:e2e:project -- --project <issue-slug>`
- `git diff --check`

## Science Pilot Intake

Read first:
- `docs/workflows/science-pilot.md`
- `scripts/lib/science-pilot-intake.ts`
- `projects/<science-slug>/meta/science-pilot.json` after intake
- `projects/<science-slug>/meta/decision-log.md` after the two review passes

Create a planning-only pilot from real ZIP sources:

```bash
npm run intake:science-pilot -- \
  --project <science-slug> \
  --course-code "SCI 20" \
  --title "Science 20" \
  --mode conversion \
  --brightspace-zip "<brightspace.zip>" \
  --teacher-resources-zip "<teacher-resources.zip>"
```

The command intentionally leaves the course blocked and creates no learner workspace. Use the shared planning packet for red-team and green-team review; build one representative unit only after their evidence is recorded.

Verification floor:
- `npm run test:science-pilot`
- `npm run validate:manifests`

## Handoff Resume

- open `docs/ops/ACTIVE_HANDOFF.md`

## Workflow-Aware Resume

When workflow type is known, read the matching workflow guide immediately after `ACTIVE_HANDOFF`:

- `docs/workflows/conversion.md`
- `docs/workflows/generated-course.md`
- `docs/workflows/injection-integration.md`
- `docs/workflows/prompt-contract.md` for prompt structure
- `docs/workflows/social-related-issues.md` for related-issues rebuilds
- `docs/workflows/science-pilot.md` for a source-backed Science pilot

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
