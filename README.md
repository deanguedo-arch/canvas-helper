# Canvas Helper

Canvas Helper is a local-first Node-powered workbench for importing Canvas course content, preserving immutable raw baselines, editing workspace copies, previewing them in a browser Studio, and exporting Brightspace-ready deliverables.

Repo-level intelligence defaults live in `intelligence-policy.json`. Project-specific overrides can live in `projects/<slug>/meta/intelligence-policy.json`.

## Quick Start

1. Install Node.js
2. Run `npm.cmd install`
3. Start Studio with `npm.cmd run studio`
4. Or use `launch-canvas-helper.bat` on Windows

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

## Repo Guides

- Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Agent operating rules: [`AGENTS.md`](./AGENTS.md)
- Contribution rules: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Ops runbook: [`docs/ops/README.md`](./docs/ops/README.md)
