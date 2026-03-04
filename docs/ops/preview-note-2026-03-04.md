# Preview Note

Date: 2026-03-04
Project slug: studio-shell (global) and calm-module (active preview)
Editor: dean.guedo

## Goal

Tune Studio for faster review: no redundant sidebar, compact header, larger preview visibility, and one-click fit-to-width.

## What Changed

1. Added one-click launcher and ops docs:
   - `launch-canvas-helper.bat`
   - `docs/ops/*`
   - `README.md` links
2. Removed left sidebar project rail from Studio and moved project controls to top header.
3. Condensed top header copy and controls; removed long file path line.
4. Reworked preview zoom behavior so low zoom (e.g. 60%) shows more content instead of a cropped shrink.
5. Added per-pane `Fit` button to auto-fit preview width by current device mode.

## Validation

1. `npm.cmd run typecheck` passed.
2. `npm.cmd run build:studio` passed.
3. Manual visual check still needed in running Studio for your preferred sizing balance.

## Risks / Watch Items

1. `sidebarOpen` preference is still present in saved layout payload for compatibility, but sidebar UI is removed.
2. `Fit` uses current pane width and device mode; if window size changes, click `Fit` again.

## Next Session Resume

1. Start Studio: `launch-canvas-helper.bat` -> option `1` (or run `npm.cmd run studio -- --host 127.0.0.1 --port 5173`).
2. Open `calm-module` and check split mode at `60%`, then click `Fit` on both panes.
3. If needed, tweak:
   - `app/studio/src/styles.css` (`--frame-height`, `preview-stage` padding)
   - `app/studio/src/App.tsx` (`fitPreviewToWidth`)

## Export Status

- Analyze run: not part of this UI pass
- Refs run: not part of this UI pass
- Brightspace export run: not part of this UI pass
