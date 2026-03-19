# Handoff

- Project: canvas-helper
- Task: split the instruction system into CANVAS and DEFAULT modes and upgrade the generation prompt
- Status: in progress

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/AGENTS.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursorrules
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/base-repo-contract.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/default-mode.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/canvas-mode.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/mode-switching.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/engine/context-builder.ts

## What changed
- Reframed the repo instructions around two distinct authoring modes: CANVAS for first-pass generation and DEFAULT for balanced engineering.
- Rewrote the repo contract and cursor overlays to remove SPARK references and make mode switching explicit.
- Replaced the generation prompt with a more professional artifact-builder prompt focused on hierarchy, interaction quality, readability, responsiveness, and meaningful states.

## What still needs validation
- Run a typecheck or equivalent validation for the edited TypeScript file.
- Confirm there are no remaining SPARK references in the instruction system if you want a clean two-mode setup.

## Known risks
- The instruction changes are behavioral; their effect is not directly covered by unit tests.
- This handoff now reflects the current repo-wide instruction task instead of the previous unrelated project task.

## Exact next command
`npm run typecheck`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/AGENTS.md`

## Do not do next / warnings
- Do not reintroduce SPARK references unless the mode system changes again.
- Do not broaden the scope into unrelated app logic without a separate task.
