# Handoff Standard

Every meaningful stop point must produce a handoff that another human or agent can continue without re-discovery.

## Required Template

```md
# Handoff

- Project: <slug or repo-wide>
- Task: <one sentence>
- Status: <not started | in progress | blocked | ready for validation | complete>

## Files changed
- <path>
- <path>

## What changed
- <fact>
- <fact>

## Why this changed
- <reason>

## Source of truth
- <canonical entry + canonical sources>

## Fragile areas / watchouts
- <what may drift>

## Next prompt should assume
- <starting assumptions for next operator>

## What still needs validation
- <specific check>

## Known risks
- <specific risk>

## Exact next command
`<command>`

## Exact next file to open
`<path>`

## Do not do next / warnings
- <warning>
```

## Rules

- Be specific, not narrative.
- Name exact files, not vague areas.
- Include one exact next command.
- Include one exact next file to open.
- Call out blockers directly.
- Do not hide missing verification.
- Explicitly record source-of-truth location and fragile areas.
- Add assumptions the next prompt should start with.
- Keep the single active handoff in `docs/ops/ACTIVE_HANDOFF.md` for all work.
- When switching tasks or machines, append the previous entry to `docs/ops/ARCHIVED_HANDOFFS.md` before overwriting the active handoff.
