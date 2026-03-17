# Handoff

- Project: forensics
- Task: add Module 4 + Module 5 embedded assignments with reliable print/save PDF exports; fix Module 5 white screen
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/main.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/index.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module4assignment.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module5assignment.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module5assignment.app.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module5assignment.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module5assignment.source.txt

## What changed
- Injected Module 4 and Module 5 synthetic lab assignments into their module assignments view (kept existing placeholders).
- Module 4 assignment export now prints from a hidden iframe (no popups) with a clean report layout.
- Module 5 assignment added as a standalone embedded React app (HTML wrapper + compiled module JS).
- Fixed Module 5 white screen by forcing ESM JSX runtime import in compiled app.
- Added Module 5 assignment report export via iframe print and a Print/Save PDF button.
- Added a runtime error overlay in Module 5 assignment HTML to surface failures instead of white screen.

## What still needs validation
- Open Module 5 assignment and confirm no white screen (error overlay should stay hidden).
- Use Print/Save PDF in Module 5 assignment and confirm it opens the browser print dialog.
- Use Print/Save PDF in Module 4 assignment and confirm report includes answers from all module sections.

## Known risks
- Module 5 app uses external ESM dependencies; any network blockage could still cause blank render (overlay will show details).
- If embedded iframe permissions change in the host, print dialogs may be blocked again.

## Exact next command
`npm run verify -- --project forensics`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module5assignment.html`

## Do not do next / warnings
- Do not edit `projects/forensics/raw/**` or `projects/resources/forensics/**`.
- Do not delete existing assignment placeholders; they are intentionally kept.
