# Handoff

- Project: repo-wide
- Task: Add a resume-time Headroom prompt to the ops workflow so Cursor/Codex sessions ask before starting Headroom
- Status: complete

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/session-checklist.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/README.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Added a `Before You Change Code` step requiring a one-time Headroom prompt after reading `ACTIVE_HANDOFF.md` when resuming in Cursor or Codex and Headroom is available.
- Made the rule explicit that Headroom should not start automatically during handoff restore.
- Added the same expectation to the ops runbook core operating loop so resume behavior is documented in the main repo workflow docs.

## Why this changed
- To make Headroom opt-in at resume time instead of an implicit background step, keeping the workflow reversible and user-directed.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/session-checklist.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/README.md

## Fragile areas / watchouts
- This is a docs/policy change only; there is no automated restore hook enforcing it.
- Future agent prompts or local launcher docs could drift if they restate resume behavior separately.

## Next prompt should assume
- After reading `docs/ops/ACTIVE_HANDOFF.md`, ask once whether to start Headroom when resuming in Cursor or Codex and Headroom is installed.
- Do not start Headroom automatically as part of handoff restore.

## What still needs validation
- Behavioral validation in the next resumed Cursor or Codex session to confirm the prompt happens at the right time.

## Known risks
- Agents that ignore ops docs or rely only on external instructions may still miss the prompt until their local rule stack is updated.

## Exact next command
`sed -n '1,40p' docs/ops/session-checklist.md`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/session-checklist.md`

## Do not do next / warnings
- Do not turn this into automatic Headroom startup without an explicit user request.
