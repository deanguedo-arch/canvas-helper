# Task
## Goal
Execute Phase 6 for `forensics`: QA and hardening on top of the completed faithful-player, interaction, and visual passes.

## Constraints
- Keep `projects/forensics/raw/**` and `projects/resources/forensics/**` immutable.
- Work in `projects/forensics/workspace/**`, `projects/forensics/meta/**`, and minimal shared code only if a reusable parser gap is required.
- No new dependencies.
- No renames.
- No broad refactors.
- No new feature scope.
- No structural rewrites.
- No visual redesign work.

## Acceptance tests
- Existing faithful-player acceptance remains true (visibility modes + real source rendering + fallback behavior).
- Interaction layer remains additive and non-destructive (section mode + checkpoints + quiz navigation/progress).
- Visual shell remains coherent and readable after recent polish pass.
- `npm run verify -- --project forensics` passes.
- `npm run typecheck` passes.
- `npm run build:studio` passes.

## QA / Hardening Gaps
- [ ] Validate representative nodes across all major modules in learner mode and archive mode.
- [ ] Confirm hidden/admin content never appears in learner mode.
- [ ] Confirm assignment/quiz renderers fail soft on unmapped variants with structured fallback panel.
- [ ] Audit for unnecessary file churn before commit.

## Expected files to change
- `tasks/active.md`
- `projects/forensics/workspace/**`
- optional minimal shared parser files if required by a reusable gap

## Commands
- `npm run verify -- --project forensics`
- `npm run typecheck`
- `npm run build:studio`
