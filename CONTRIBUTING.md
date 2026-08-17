# Contributing

## Branch and Task Discipline

- Use focused branches with the `codex/` prefix for branch work.
- One task should map to one clearly scoped change set.
- Keep cross-domain changes intentional and documented.

## Commit Format

Use:

`type(scope): concise action`

Examples:

- `refactor(studio): split preview state into hooks and pane components`
- `refactor(server): move studio route handlers out of vite config`
- `feat(intelligence): add collect and apply policy modes`
- `docs(ops): define strict handoff contract`
- `test(smoke): add local pipeline smoke verification`

## Minimal Verification Expectations

- Small UI-only changes: `npm.cmd run typecheck`
- Studio/server changes: `npm.cmd run typecheck` and `npm.cmd run build:studio`
- Codex-to-Studio course creation changes: `npm run test:codex-course`, the focused live-discovery browser scenario, `npm.cmd run build:studio`, and `npm.cmd run typecheck`
- New or newly activated course changes: `npm run test:new-course-readiness` plus the exact-head `npm run verify:new-course-readiness -- --base <comparison-sha>` gate; CI supplies the base SHA and retains the coverage/lifecycle evidence artifact
- Course-catalog onboarding changes: `npm run test:course-onboarding`, a retain-only `npm run course:onboard -- --all`, `npm run verify:course-onboarding -- --all`, focused Studio tests, and `npm.cmd run typecheck`
- Course-editability census changes: `npm run test:course-editability`, an inventory-only all-catalog report, one rendered representative report, and the exact-head all-catalog CI artifact; do not run repository writers during a residue-proof census
- Studio direct-edit changes: `npm run test:course-editing`, `npm run test:studio-inspection`, `npm run verify:course-editing-pilots`, the focused direct-edit browser scenario, and the complete Studio release gate before publishing
- Direct-edit exporter evidence changes: run `npm run test:exports` in addition to the Direct Editing floor
- Interaction-heavy Studio/player changes: run E2E (`npm run test:e2e:smoke` for shared UI, `npm run test:e2e:project -- --project <slug>` for project contracts)
- Canvas Studio release candidates: `npm run test:studio-release`; do not replace its isolated port, local-tool, `forbidOnly`, full-inspection, smoke, or strict-project gates with a reused development server
- Intelligence changes: targeted tests plus `npm.cmd run typecheck`
- Authoring enforcement changes: targeted deviation/preference tests plus `npm.cmd run typecheck`
- Project metadata/source-of-truth policy changes: `npm.cmd run validate:manifests` plus targeted tests and `npm.cmd run typecheck`
- Pipeline changes: smoke-path verification plus targeted tests
- Incoming pipeline changes: targeted intake tests plus `npm.cmd run incoming:refresh -- --incoming <temp>` or an equivalent temp-root one-shot check

## Doc Update Triggers

Update docs when:

- commands change
- ownership boundaries change
- intelligence policy changes
- authoring preference defaults or deviation-gate behavior changes
- handoff expectations change
- the quick-start path changes
- intake, processed snapshot, or resource library behavior changes

## Test Update Triggers

Add or update tests when:

- route behavior changes
- direct-edit contracts, sanitization, adapter ownership, checkpoint/rollback, undo, or export-staleness behavior changes
- direct-edit filesystem locks, journals, rendered postconditions, image bytes, title synchronization, draft migrations, or artifact evidence change
- learner-surface inventory, candidate ownership, census isolation, scoring, report residue, preview normalization, preview ordering, inert overlays, or pending image memory changes
- Studio/player interaction behavior changes (mode toggles, navigation, quiz behavior, fallback rendering)
- path validation changes
- intelligence policy behavior changes
- authoring preference resolution or deviation-gate behavior changes
- prompt-pack behavior changes
- import/export pipeline behavior changes
- incoming bundle or shared resource behavior changes

## Definition of Done

A task is done when:

- the change stays within its architectural boundary
- the minimum verification has been run
- affected docs are updated
- shared Studio releases have a current `docs/releases/` note and a passing machine-readable `.runtime/studio-release-report.json`
- risks and next steps are explicit
- the resulting handoff is actionable for the next operator
- a net-new or newly activated active course declares `studio-routine-content-v1` and passes the automatic new-course gate: valid ownership, complete learner inventory, rendered 90% block/text coverage, promised category/capability floors, and one reversible apply/reload/Undo lifecycle
- imported or unresolved legacy material remains `blocked` until that same proof exists; previewability is not active Studio readiness
- a legacy catalog change has an explicit outcome for every project directory, leaves package-only artifacts non-authorable, and completes a rendered reversible catalog verification without learner-content residue

## Avoid Oversized Changes

- split work by responsibility, not by arbitrary line count
- avoid bundling refactors with feature work unless the refactor is necessary to preserve clarity
- prefer wrappers and thin compatibility shims over disruptive rewrites
- stop and document boundary pressure if the task starts to spill across unrelated domains
