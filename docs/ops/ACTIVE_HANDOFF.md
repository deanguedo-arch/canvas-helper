# Handoff

- Project: sportswellness
- Task: tune the `Phase 4 Mental Filter Simulator Game` so some negative comments move directly while others remain erratic
- Status: complete

## Summary
- The Phase 4 simulator now gives negative comments mixed motion behavior: some withdrawals move straight toward the player like positive comments, while others still wobble unpredictably.
- Deposit and withdrawal meaning, confidence-account scoring, and hit effects stay the same; only the movement pattern was adjusted.
- Source-based regression coverage now locks the new movement-profile hooks so this behavior does not silently drift.

## Files changed
- docs/ops/ACTIVE_HANDOFF.md
- projects/sportswellness/workspace/performance/phase4-mental-filter-simulator-game.app.js
- scripts/tests/sportswellness-performance-menu.test.ts

## Verification run
- `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
- `npm run test:e2e:project -- --project sportswellness`
- `npx tsx --test scripts/tests/sportswellness-phase3-content.test.ts` (fails on the pre-existing `Multiple-choice review` expectation in `projects/sportswellness/workspace/main.js`)

## What changed
- Added `WITHDRAWAL_DIRECT_CHANCE = 0.4` in `projects/sportswellness/workspace/performance/phase4-mental-filter-simulator-game.app.js` so a share of negative-comment withdrawals now use direct movement.
- Added a per-transaction `movementProfile` so deposits stay direct and withdrawals can be either `direct` or `erratic`.
- Restricted wobble amplitude, wobble frequency, and erratic steering logic to withdrawals tagged `movementProfile === 'erratic'`.
- Expanded `scripts/tests/sportswellness-performance-menu.test.ts` so the new mixed-movement hooks are part of the checked contract.

## Why this changed
- The user wanted the bad comments to stop feeling one-note by having some behave like the positive comments instead of every negative comment moving unpredictably.
- Mixed withdrawal motion keeps the original challenge while making the simulator behavior feel less mechanically repetitive.

## Source of truth
- Canonical entry: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\index.html`
- Canonical sources:
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\main.js`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase4-mental-filter-simulator-game.html`
  - `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase4-mental-filter-simulator-game.app.js`

## Fragile areas / watchouts
- The direct-versus-erratic split is intentionally random, so the exact mix changes on every run.
- Negative comments that move directly are still withdrawals; future tuning should avoid changing their transaction type unless the scoring model is also meant to change.
- The standalone game still depends on browser-loaded `React`, `ReactDOM`, `Tailwind`, and `Babel` CDNs.

## Next prompt should assume
- `Performance` still exposes the Phase 4 simulator through `projects/sportswellness/workspace/performance/phase4-mental-filter-simulator-game.html`.
- Negative comments in the Phase 4 simulator now split between direct and erratic movement, with `WITHDRAWAL_DIRECT_CHANCE` currently set to `0.4`.
- The simulator scoring and confidence-account rules are unchanged.

## What still needs validation
- Open the Sports Wellness preview, launch `Performance`, and visually confirm the Phase 4 simulator now feels right with the mixed negative-comment movement.
- If the ratio still feels off after preview, tune `WITHDRAWAL_DIRECT_CHANCE` up or down and retest.

## Known risks / follow-up
- `npx tsx --test scripts/tests/sportswellness-phase3-content.test.ts` is still red on the unrelated `Multiple-choice review` expectation in `projects/sportswellness/workspace/main.js`.
- I did not run a manual browser preview for this movement tweak.

## Exact next command
`npm.cmd run studio:codex`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\performance\phase4-mental-filter-simulator-game.app.js`

## Do not do next / warnings
- Do not patch only the reference-folder `MentalFiltergame` source and expect the workspace behavior to change; the workspace copy is the live runtime.
- Do not change transaction type or hit logic if the goal is only movement tuning.
- Do not treat the failing `sportswellness-phase3-content.test.ts` check as caused by this Phase 4 behavior tweak without fixing or updating the separate Phase 3 lesson contract.
