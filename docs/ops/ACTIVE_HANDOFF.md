# Handoff

- Project: mentalwellness10-option2
- Task: Fix split-screen scrolling in the Option 2 shell and make Assignment 00 require `Run Diagnostics` before the report/completion path unlocks.
- Status: complete

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md

## What changed
- Compact split-screen widths now scroll correctly in the standalone course shell. The `compact-layout` path no longer traps long content behind `overflow: hidden`, and the embedded assignment runtime is allowed to expand into the page so the whole surface scrolls naturally.
- Assignment 00 no longer unlocks the report/completion path just from selecting scores. The learner now has to finish the five prompts, fill the operator log, and click `Run Diagnostics` before:
  - `Generate System Report (PDF)` enables
  - the end-of-assignment `Mark complete` button enables
- The Assignment 00 status copy now explains the exact next step at each state:
  - missing prompts
  - missing operator log
  - inputs complete but not verified
  - report unlocked / ready to complete
- The shell-side completion card now reads the persisted diagnostic readiness state instead of always allowing completion immediately.

## Why this changed
- The user reported that this course stopped scrolling when run in split screen, even though other Canvas Helper course shells still scrolled correctly.
- The user also wanted `Run Diagnostics` to behave like the actual verification/unlock step for Assignment 00, instead of leaving report/completion feeling disconnected or prematurely available.

## Source of truth
- Shell entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\index.html
- Shell logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- Embedded assignment runtime logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- Embedded assignment styling: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css

## Fragile areas / watchouts
- Assignment 00 readiness is now stored in `diag_data.reportReady`. If the diagnostic payload shape changes again, keep that key aligned with the shell completion card.
- Compact-layout scrolling now relies on page-level scrolling rather than the previously trapped nested scroll path. Be careful with future `overflow` changes on `body`, `.content`, `.content-inner`, and `.assignment-runtime-mount`.
- The report flow still depends on `window.open()` and browser print behavior, so Builder/browser popup handling can still differ slightly from direct preview.

## Next prompt should assume
- Assignment 00 still uses the same five-question diagnostic and the same report payload, but the report is now intentionally gated behind `Run Diagnostics`.
- Editing any diagnostic score or the operator log clears the report-ready state until diagnostics are run again.
- The end-of-assignment `Mark complete` button for Assignment 00 is intentionally disabled until the diagnostic has been verified.
- Split-screen / compact-layout browsing now uses normal page scrolling in this project.

## What still needs validation
- Optional: do a Builder-specific non-headless popup spot-check if the user wants to compare print behavior there.
- Optional: mirror the same report-ready gating pattern into later assignments if the user wants a more explicit “verify then complete” flow elsewhere.
- Optional: if more compact-layout pages get special wrappers, spot-check them against the new page-level scroll behavior.

## Known risks
- The strict project E2E contract still only certifies the shared shell hooks, not deep module traversal.
- Assignment 00 still mixes newer shell markup with legacy inline runtime handlers, so id changes there remain easy to break.
- The Diagnostic route still opens the assignment section directly rather than keeping the phase tab visually active.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js`

## Do not do next / warnings
- Do not remove `diag_data.reportReady` unless you also replace the shell-side completion gate.
- Do not restore compact-layout `overflow: hidden` behavior without re-testing direct workspace preview at split-screen widths.
- Do not re-enable Assignment 00 completion before diagnostics run unless the user explicitly wants a looser gate again.
