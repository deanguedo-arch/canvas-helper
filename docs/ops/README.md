# Canvas Helper Ops

Phase 1 keeps the repo structure stable and adds a high-signal operating layer for fast iteration.

## One-Click Launcher

- File: `launch-canvas-helper.bat`
- Double-click to open a menu for:
  - `Studio only`
  - `Import + Analyze + Refs + Studio`
  - `Export Brightspace`
- Studio URL opens automatically: `http://127.0.0.1:5173`

## Daily Session Loop

1. Launch `launch-canvas-helper.bat`.
2. Import or select target project.
3. Compare `raw` vs `workspace` in Split view.
4. Make edits only in `projects/<slug>/workspace/`.
5. Save session handoff log from Studio.
6. Export Brightspace bundle when ready.

Use [session-checklist.md](/c:/Users/dean.guedo/Documents/GitHub/canvas-helper/docs/ops/session-checklist.md) to keep runs consistent.

## Prompting System

Use [agent-prompt-templates.md](/c:/Users/dean.guedo/Documents/GitHub/canvas-helper/docs/ops/agent-prompt-templates.md) as your fast-start prompt catalog for common edit types.

## Preview Note

Use [preview-note-template.md](/c:/Users/dean.guedo/Documents/GitHub/canvas-helper/docs/ops/preview-note-template.md) before or after major edits so context survives session handoff.
