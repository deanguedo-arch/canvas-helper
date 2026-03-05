# Decisions
## Raw is immutable
- projects/<slug>/raw is an immutable baseline. Never edit it manually.

## Workspace is editable
- All edits happen in projects/<slug>/workspace.

## Splitting is opt-in
- Any code splitting/refactoring during analyze is opt-in via CLI flag. Default is OFF.

## No new dependencies by default
- Do not add npm deps unless a task explicitly requires it.

## Verify before claiming done
- Changes are “done” only after typecheck + studio build + relevant verify script passes.
