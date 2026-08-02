# Ops Runbook

Use this folder to keep local work disciplined, reproducible, and handoff-friendly.

## Learner Mode Workflow

- Use your platform launcher for the default stable Studio startup:
  - Windows: `launch-canvas-helper.bat`
  - macOS: `./launch-canvas-helper.command` (or `./launch-canvas-helper.sh`)
- Codex desktop app on macOS can use npm shortcuts:
  - `npm run studio:codex`
  - `npm run studio:codex:auto`
  - `npm run studio:codex:migrate`
  - `npm run studio:codex:session`
- Optional launcher actions:
  - `launch-canvas-helper.bat refresh` or `./launch-canvas-helper.command refresh`
  - `launch-canvas-helper.bat watch` or `./launch-canvas-helper.command watch`
- The effective mode follows `--learner-mode` > `LEARNER_MODE` > project config > repo config > built-in default.
- Studio status is informational: it reads and shows the effective mode from the same resolver used by commands.

## Core Operating Loop

1. Read [`AGENTS.md`](../../AGENTS.md)
2. Read [`ARCHITECTURE.md`](../../ARCHITECTURE.md)
3. Use [`session-checklist.md`](./session-checklist.md) before and during work
4. After restoring from [`ACTIVE_HANDOFF.md`](./ACTIVE_HANDOFF.md), use `course:doctor` and `context:project` for an active migrated course when a compact source brief is needed
5. Use `npm run headroom` only when prompt-pack regeneration is intentionally required; it is not the default resume step
6. Use [`HANDOFF.md`](./HANDOFF.md) for every meaningful stop point and write it into [`ACTIVE_HANDOFF.md`](./ACTIVE_HANDOFF.md)
7. If workflow is known, read the matching guide under [`docs/workflows/`](../workflows/README.md)
8. Use [`agent-prompt-templates.md`](./agent-prompt-templates.md) only after architecture, workflow, and task boundaries are clear

## Surgical Default

- Start with the narrowest useful retrieval path.
- Prefer known entrypoints, targeted reads, and `rg` over broad discovery.
- Do not expand scope or change behavior unless the current context is insufficient.
- If broader retrieval is needed, stop and ask for approval with the reason, added scope, and expected cost.
- Keep follow-up reads minimal even after approval.

## Subagent Mode

- If the user explicitly says this is a subagent, or says to act as a subagent, treat the task as subagent mode automatically.
- If the signal is ambiguous, ask exactly once: `Should I apply subagent rules for this task?`
- Keep subagent mode on for the rest of the task once confirmed unless the user changes the scope.
- Do not keep asking whether to apply subagent rules after confirmation.

## Intake Loop

1. Drop project bundles into `projects/incoming/<folder>`
2. Drop project resources into `projects/resources/<slug>/`
3. Use Studio `Refresh Intake` or `npm run incoming:refresh`
4. Confirm the imported bundle or synced references in Studio
5. Treat `projects/processed/<slug>/source/` as the latest import snapshot, not an editable workspace

## Key References

- Repo mission and agent rules: [`AGENTS.md`](../../AGENTS.md)
- System boundaries and placement rules: [`ARCHITECTURE.md`](../../ARCHITECTURE.md)
- Contribution and commit discipline: [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
- Session handoff standard: [`HANDOFF.md`](./HANDOFF.md) stored in [`ACTIVE_HANDOFF.md`](./ACTIVE_HANDOFF.md)
- Codex-specific Mac operating loop: [`codex-mac-workflow.md`](./codex-mac-workflow.md)
- Apps Script Drive deploy workflow: [`apps-script-drive-deploy.md`](./apps-script-drive-deploy.md)
- Fast Google Apps Script course conversion runbook: [`googlescriptforcourses.md`](./googlescriptforcourses.md)
- Google Hosted deploy workflow: [`google-hosted-deploy.md`](./google-hosted-deploy.md)
- Google hosting fast runtime and assignment embed workflow: [`google-hosting-fast-runtime-assignment-embed.md`](./google-hosting-fast-runtime-assignment-embed.md)
- STAX course deploy proof gate: [`stax-course-deploy-proof-gate.md`](./stax-course-deploy-proof-gate.md)
- Next Step D2L redesign prompt and process: [`next-step-brightspace-d2l-redesign.md`](./next-step-brightspace-d2l-redesign.md)
- Workflow patterns and prompt contract: [`docs/workflows/`](../workflows/README.md)

## Working Rule

The browser is the local shell. Node is the engine. Project data lives on disk. Ops docs exist to keep that workflow governable as the repo grows.
