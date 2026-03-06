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
