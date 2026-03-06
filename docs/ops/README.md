# Ops Runbook

Use this folder to keep local work disciplined, reproducible, and handoff-friendly.

## Learner Mode Workflow

- Use one of the explicit launchers for local runs:
  - `launch-canvas-helper-off.bat`
  - `launch-canvas-helper-collect.bat`
  - `launch-canvas-helper-apply.bat`
- The effective mode follows `--learner-mode` > `LEARNER_MODE` > project config > repo config > built-in default.
- Studio status is informational: it reads and shows the effective mode from the same resolver used by commands.

## Core Operating Loop

1. Read [`AGENTS.md`](../../AGENTS.md)
2. Read [`ARCHITECTURE.md`](../../ARCHITECTURE.md)
3. Use [`session-checklist.md`](./session-checklist.md) before and during work
4. Use [`HANDOFF.md`](./HANDOFF.md) for every meaningful stop point
5. Use [`agent-prompt-templates.md`](./agent-prompt-templates.md) only after the architecture and task boundaries are clear

## Intake Loop

1. Drop project bundles into `projects/incoming/<folder>`
2. Drop project resources into `projects/resources/<slug>/`
3. Use Studio `Refresh Intake` or `npm.cmd run incoming:refresh`
4. Confirm the imported bundle or synced references in Studio
5. Treat `projects/processed/<slug>/source/` as the latest import snapshot, not an editable workspace

## Key References

- Repo mission and agent rules: [`AGENTS.md`](../../AGENTS.md)
- System boundaries and placement rules: [`ARCHITECTURE.md`](../../ARCHITECTURE.md)
- Contribution and commit discipline: [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
- Session handoff standard: [`HANDOFF.md`](./HANDOFF.md)

## Working Rule

The browser is the local shell. Node is the engine. Project data lives on disk. Ops docs exist to keep that workflow governable as the repo grows.
