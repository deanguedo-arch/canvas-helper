# Handoff

- Project: `canvas-helper`
- Active slice: STAX sidecar proof refresh for `aboriginal-studies-30` visual proof and Canvas Helper smoke evidence.
- Status: Handoff/report ready; final STAX proof refresh should be run against the pushed head.

## Summary
- The previous `.stax/status.json` was fresh but rejected because command evidence belonged to older commits.
- The current requested task is to make the Canvas Helper STAX sidecar green, keep the active handoff current, and commit/push the handoff/proof context.
- The required proof surface is current visual proof plus current command evidence, collected from the STAX checkout/tooling repo against `/Users/deanguedo/Documents/GitHub/canvas-helper`.

## Files changed
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification run
- To run after this handoff/report commit:
  - From `/Users/deanguedo/Documents/GitHub/STAX`: `npm run stax:collect -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper -- npm run test:e2e:smoke`
  - From `/Users/deanguedo/Documents/GitHub/STAX`: `npm run stax:collect -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper -- npm run typecheck`
  - From `/Users/deanguedo/Documents/GitHub/STAX`: `npm run stax:collect -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper -- git diff --check`
  - From `/Users/deanguedo/Documents/GitHub/STAX`: `npm run stax:collect-visual -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper --url http://127.0.0.1:5173/preview/workspace/aboriginal-studies-30/index.html?rev=1779894058951.8022 --description "AS30 local preview renders current responsive unit-card state" --checklist "target page/state: Aboriginal Studies 30 workspace Units view" --checklist "responsive/viewport checked: local preview URL captured by STAX visual collector" --checklist "visible outcome: unit cards and top-sidebar layout render without blank titles"`
  - From `/Users/deanguedo/Documents/GitHub/STAX`: `npm run stax:gate -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper`

## Known risks / follow-up
- STAX status/proof JSON files are generated sidecar state. If they are committed, they can become stale as soon as the commit SHA changes.
- The durable way to finish is: commit/push this handoff/report, then run final STAX collect/gate against that pushed head and leave the generated sidecar status as the local current truth.
- No deploy, publish, sync, or release action is part of this handoff.

## Source-of-truth location
- Active handoff: `docs/ops/ACTIVE_HANDOFF.md`
- STAX report: `.stax/codex-report.md`
- STAX task: `.stax/task.md`
- AS30 workspace: `projects/aboriginal-studies-30/workspace/index.html`

## Fragile areas / what might drift
- STAX command evidence is commit-bound; any commit after collection can turn green evidence into wrong-commit evidence.
- The local preview URL must be reachable when collecting visual proof by URL.
- The local `canvas-helper` package does not expose STAX scripts; run STAX commands from `/Users/deanguedo/Documents/GitHub/STAX`.

## Next prompt assumptions
- The next agent should not treat older `.stax/status.json` rejections as current until it reruns the gate.
- If current status is not Accept, collect fresh proof from the STAX repo against the current Canvas Helper head.
- Do not broaden into course redesign or deploy work.

## Exact next command
`cd /Users/deanguedo/Documents/GitHub/STAX && npm run stax:gate -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper`

## Exact next file to open
`.stax/status.json`
