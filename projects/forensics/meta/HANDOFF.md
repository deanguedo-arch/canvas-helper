# Handoff

- Project: forensics
- Task: split the Module 8 interactive assignment into separate activity files and keep the Module 7 DNA lab responsive
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module7assignment-app.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module7assignment.bundle.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module7assignment.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module8assignment.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/canvas code and references/forensics/ASSIGMENTS CODE/module8assignment-career-matcher.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/canvas code and references/forensics/ASSIGMENTS CODE/module8assignment-day-in-life.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/canvas code and references/forensics/ASSIGMENTS CODE/module8assignment-case-role.jsx

## What changed
- Made the Module 7 DNA lab lanes responsive by shrinking the lane width and allowing horizontal scroll instead of clipping the ladder and suspect lanes.
- Expanded the Module 8 page into three interactive formats on the same assignment page: career matcher, day-in-the-life picker, and case-role simulation.
- Added separate source files for those three Module 8 activities in the reference folder so each activity can be opened or reused on its own.

## What still needs validation
- Open Module 7 DNA lab and confirm the ladder, Marker A, and suspect lanes are fully reachable without clipping.
- Open Module 8 assignment and confirm the three activity sections render and switch correctly.
- If you plan to use the split Module 8 source files in Studio, wire them into the app flow.

## Known risks
- The split Module 8 files are reference/source files only and are not yet wired into the workspace navigation.
- `module7assignment.bundle.js` was patched directly to match the JSX source, so any future rebuild should keep the bundle aligned.

## Exact next command
`/Users/deanguedo/Documents/GitHub/canvas-helper/launch-canvas-helper.command`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module8assignment.html`

## Do not do next / warnings
- Do not edit `projects/forensics/raw/**` or `projects/resources/forensics/**`.
- Do not overwrite the split Module 8 reference files unless you are intentionally changing their standalone versions.
