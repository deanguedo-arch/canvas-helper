# Canvas Helper

Canvas Helper is a local-first Node-powered workbench for importing Canvas course content, preserving immutable raw baselines, editing workspace copies, previewing them in a browser Studio, and exporting Brightspace-ready deliverables.

Repo-level intelligence defaults live in `config/intelligence.json`. Project-specific overrides can live in `projects/<slug>/meta/intelligence-policy.json` and/or `projects/<slug>/meta/project.json`.

## Quick Start

1. Install Node.js
2. Run `npm.cmd install`
3. Start Studio with `npm.cmd run studio`
4. On Windows, use explicit mode launchers:
   - `launch-canvas-helper-off.bat`
   - `launch-canvas-helper-collect.bat` (default/normal)
   - `launch-canvas-helper-apply.bat`
   - or `launch-canvas-helper.bat` and set `LEARNER_MODE` manually

## Main Commands

- `npm.cmd run studio`
- `npm.cmd run studio:auto`
- `npm.cmd run import -- "<path-to-html-or-folder>" --slug <slug>`
- `npm.cmd run analyze -- --project <slug>`
- `npm.cmd run refs -- --project <slug>`
- `npm.cmd run export:brightspace -- --project <slug>`
- `npm.cmd run export:brightspace:zip -- --project <slug>`
- `npm.cmd run export:html -- --project <slug>`
- `npm.cmd run smoke:pipeline`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`

## Core Workflow

1. Put incoming bundles in `projects/_incoming/`
2. Import into `projects/<slug>/...`
3. Edit only `projects/<slug>/workspace/`
4. Use Studio to compare raw vs workspace
5. Run analyze / refs / export as needed
6. Capture a handoff before stopping

## Learner modes

The workflow is controlled by an explicit learner mode, resolved in this order:

1. CLI flag `--learner-mode <off|collect|apply>`
2. `LEARNER_MODE` environment variable
3. `projects/<slug>/meta/project.json` or `projects/<slug>/meta/intelligence-policy.json`
4. `config/intelligence.json`
5. built-in safe fallback (`collect`)

### `off`

- collection: disabled
- application: disabled
- best for: clean baseline / debugging

### `collect`

- collection: enabled
- application: disabled
- best for: normal day-to-day work (safe default)

### `apply`

- collection: enabled
- application: enabled
- best for: trusted repeated project types

`launch-canvas-helper-collect.bat` is the default explicit startup path.

## Repo Guides

- Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Agent operating rules: [`AGENTS.md`](./AGENTS.md)
- Contribution rules: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Ops runbook: [`docs/ops/README.md`](./docs/ops/README.md)
