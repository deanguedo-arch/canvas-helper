# Handoff Standard

Every meaningful stop point must produce a handoff that another human or agent can continue without re-discovery.

## Required Template

```md
# Handoff

- Project: <slug or repo-wide>
- Task: <one sentence>
- Status: <building | blocked | ready for rollout validation | validated | released>

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
- <specific check deferred until rollout, or none>

## Known risks
- <specific risk>

## Exact next action
- <await the next requested change, or the exact required command>

## Exact next file to open
`<path>`

## Do not do next / warnings
- <warning>
```

## Rules

- Be specific, not narrative.
- Name exact files, not vague areas.
- Include one exact next action. Use a command only when one is actually required; otherwise write `Await the next requested change.`
- Include one exact next file to open.
- Call out blockers directly.
- Do not hide missing verification.
- In Build mode, keep a short cumulative list of checks deferred until rollout. Do not regenerate reports or repeat passing suites merely to refresh the handoff.
- Use the compact template for ordinary Build-mode stops. Reserve a detailed verification record for a meaningful session boundary or Rollout checkpoint.
- Explicitly record source-of-truth location and fragile areas.
- Add assumptions the next prompt should start with.
- Keep the single active handoff in `docs/ops/ACTIVE_HANDOFF.md` for all work.
- When switching tasks or machines, append the previous entry to `docs/ops/ARCHIVED_HANDOFFS.md` before overwriting the active handoff.
