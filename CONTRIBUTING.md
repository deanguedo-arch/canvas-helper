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
- Intelligence changes: targeted tests plus `npm.cmd run typecheck`
- Authoring enforcement changes: targeted deviation/preference tests plus `npm.cmd run typecheck`
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
- risks and next steps are explicit
- the resulting handoff is actionable for the next operator

## Avoid Oversized Changes

- split work by responsibility, not by arbitrary line count
- avoid bundling refactors with feature work unless the refactor is necessary to preserve clarity
- prefer wrappers and thin compatibility shims over disruptive rewrites
- stop and document boundary pressure if the task starts to spill across unrelated domains
