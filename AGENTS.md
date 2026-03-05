# Agent Contract (Canvas Helper)
## Never touch
- projects/** (except projects/.gitkeep)
- projects/<slug>/raw/**
- projects/<slug>/exports/** (generated output)

## Allowed zones
- app/studio/**
- scripts/**
- docs/**
- tasks/**
- root config files (package.json, tsconfig, etc.)

## Change budget
- Touch <= 8 files unless the task explicitly lists more.

## Output format required
When you finish, output:
1) Files changed
2) Why each change exists (one line each)
3) Commands to verify
4) Known risks / TODOs (if any)

## No drive-by refactors
- No formatting sweeps
- No renames
- No dependency changes
- No “improvements” outside task scope

## Retrieval defaults
- Read `projects/<slug>/meta/prompt-pack.md` first.
- Then read local pattern bank matches from `.runtime/pattern-bank/`.
- Use `projects/<slug>/references/extracted/` only if needed after prompt-pack and bank matches.

## Automatic intelligence refresh
- `npm run import`, `npm run analyze`, and `npm run refs` refresh prompt-pack and pattern bank automatically.
