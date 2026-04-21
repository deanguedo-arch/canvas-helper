# Handoff

- Project: sportswellness
- Task: make the four `Performance` games share the Sports Wellness course palette
- Status: complete

## Summary
- All four standalone `Performance` games now load one shared Sports Wellness theme stylesheet so their shells, panels, text, borders, and primary action colors read as part of the same course.
- The remaining hardcoded outlier surfaces were patched in the game apps, including the Phase 1 arena/chart, Phase 2 outcome zone, Phase 3 court, and Phase 4 core background/actions.
- The palette pass preserves semantic red danger states and amber caution states where the gameplay still needs contrast.

## Files changed
- docs/ops/ACTIVE_HANDOFF.md
- docs/ops/ARCHIVED_HANDOFFS.md
- docs/plans/2026-04-21-sportswellness-performance-games-shared-palette-design.md
- docs/plans/2026-04-21-sportswellness-performance-games-shared-palette-implementation.md
- projects/sportswellness/workspace/performance/performance-game-theme.css
- projects/sportswellness/workspace/performance/phase1-performance-state-simulator-game.html
- projects/sportswellness/workspace/performance/phase1-performance-state-simulator-game.app.js
- projects/sportswellness/workspace/performance/phase2-discipline-game.html
- projects/sportswellness/workspace/performance/phase2-discipline-game.app.js
- projects/sportswellness/workspace/performance/phase3-focus-game.html
- projects/sportswellness/workspace/performance/phase3-focus-game.app.js
- projects/sportswellness/workspace/performance/phase4-mental-filter-simulator-game.html
- projects/sportswellness/workspace/performance/phase4-mental-filter-simulator-game.app.js
- scripts/tests/sportswellness-performance-menu.test.ts

## Verification run
- `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
- `npm run test:e2e:project -- --project sportswellness`
- `npx tsx --test scripts/tests/sportswellness-phase3-content.test.ts` (fails on the pre-existing `Multiple-choice review` expectation in `projects/sportswellness/workspace/main.js`)

## What changed
- Added `projects/sportswellness/workspace/performance/performance-game-theme.css` as the shared palette source of truth for the injected game pages.
- Updated all four standalone game HTML wrappers to load the shared stylesheet and apply the shared `performance-game-theme` body class.
- Remapped the imported `zinc`, `lime`, and `cyan` chrome used by the games to the Sports Wellness palette tokens:
  - background `#0b111a`
  - panel `#151b25`
  - line `#2a3748`
  - text `#f4f7fb`
  - muted `#9aa6b6`
  - primary `#00ffca`
- Patched the app-level hardcoded surfaces that CSS utility overrides could not reach:
  - Phase 1 under-arousal and activation now use amber while the arena/chart use the slate/mint shell.
  - Phase 2 outcome-zone gold/yellow chrome now follows the shared mint primary palette.
  - Phase 3 no longer uses the old green/orange court hex colors and now uses slate + mint surfaces.
  - Phase 4 uses the shared background and clearer mint/amber action separation.
- Expanded `scripts/tests/sportswellness-performance-menu.test.ts` so the shared theme file, wrapper links, and removal of the old Phase 3 court colors are now part of the locked contract.

## Why this changed
- The user wanted the games in `Performance` to feel like part of the Sports Wellness course instead of four separate imported activities with their own palettes.
- A shared stylesheet plus targeted hardcoded-surface cleanup kept the pass surgical while still fixing the biggest visual drift.

## Source of truth
- Canonical entry: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\index.html`
- Canonical sources:
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\main.js`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\performance-game-theme.css`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase1-performance-state-simulator-game.html`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase1-performance-state-simulator-game.app.js`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase2-discipline-game.html`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase2-discipline-game.app.js`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase3-focus-game.html`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase3-focus-game.app.js`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase4-mental-filter-simulator-game.html`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase4-mental-filter-simulator-game.app.js`

## Fragile areas / watchouts
- The shared palette depends on the `performance-game-theme.css` remapping layer plus a small number of per-app hardcoded patches; removing either side will bring drift back.
- These pages still depend on browser-loaded `React`, `ReactDOM`, `Tailwind`, and `Babel` CDNs.
- Phase 4 now uses mint for `Approve` and amber for `Lockdown`; if future changes collapse both actions back into the same palette treatment, readability will regress.

## Next prompt should assume
- All four `Performance` games now share the Sports Wellness slate + mint shell language through `projects/sportswellness/workspace/performance/performance-game-theme.css`.
- The Phase 3 game no longer uses the old green/orange court colors.
- The current unrelated red test is still `scripts/tests/sportswellness-phase3-content.test.ts` on the missing `Multiple-choice review` snippet in `projects/sportswellness/workspace/main.js`.

## What still needs validation
- Open the Sports Wellness preview, click `Performance`, and visually confirm the four games now feel consistent with the course shell.
- Spot-check the action contrast in the Phase 4 simulator to confirm `Approve` and `Lockdown` are still easy to distinguish after the palette pass.

## Known risks / follow-up
- `npx tsx --test scripts/tests/sportswellness-phase3-content.test.ts` is still red on the unrelated `Multiple-choice review` expectation in `projects/sportswellness/workspace/main.js`.
- I did not run a manual browser preview for the new palette pass.

## Exact next command
`npm.cmd run studio:codex`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\performance-game-theme.css`

## Do not do next / warnings
- Do not patch only the old reference-folder game sources and expect the live palette to change; the workspace copies are the runtime source of truth.
- Do not remove the shared wrapper stylesheet link from any of the four game HTML files unless you are intentionally breaking the shared palette contract.
- Do not treat the failing `sportswellness-phase3-content.test.ts` check as caused by this palette pass without fixing or updating the separate Phase 3 lesson contract.
