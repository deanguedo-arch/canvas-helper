# Session Checklist

## Start

1. Open `launch-canvas-helper.bat`.
2. Confirm dependencies install (if first run).
3. Open Studio and select target project slug.
4. Read before edits:
   - `projects/<slug>/meta/project.json`
   - `projects/<slug>/meta/section-map.json`
   - `projects/<slug>/meta/style-guide.md`

## During Work

1. Keep `projects/<slug>/raw/` unchanged.
2. Edit only in `projects/<slug>/workspace/`.
3. Use Split view to compare regressions and behavior parity.
4. Validate references from `projects/<slug>/references/extracted/` first.

## Before Handoff

1. Save Studio session log (`Save Session Log` button).
2. Update preview note from template:
   - what changed
   - what still needs validation
   - exact next command
3. If needed, run:
   - `npm.cmd run analyze -- --project <slug>`
   - `npm.cmd run refs -- --project <slug>`
   - `npm.cmd run export:brightspace -- --project <slug>`

## Done Criteria

1. Workspace preview reflects intended change.
2. No raw baseline edits.
3. Handoff note exists and contains next actions.
