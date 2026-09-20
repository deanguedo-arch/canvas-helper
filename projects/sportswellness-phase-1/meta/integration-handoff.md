## Game frame sizing — 2026-09-18

- Summary: game frames now follow their full content height; Phase 2–4 arenas adapt to actual embed width. Removed viewport-height feedback from embedded wrappers. Original game mechanics unchanged.
- Files changed/source of truth: canonical workspace `game-frame-fit.js`, game `frame-fit.css`/`frame-fit.js`, parent and game HTML entries, and canonicalSources metadata. Phase 1 game files are under `assets/game/original`; Phase 2–4 under `assets/game`.
- Verification: focused real file-URL Chromium sizing checks at 1302 and 390 pixels, intro/start/active bounds and no horizontal overflow; Phase 2–4 pause/resume/end bounds checked. Desktop active game screenshots inspected. See `scripts/tests/sportswellness-game-sizing.cjs`.
- Risks/follow-up: phone games use normal course page scrolling; Phase 1 retains its stacked controls. Broad learner-state/E2E, Studio and LMS rollout gates deferred. No packaging or deployment.
- Fragile areas: intrinsic-height sizing must not reintroduce iframe viewport-dependent wrapper minimum heights. Height messages require exact iframe window source and expected origin, with finite bounded values.
- Next prompt assumptions/action: reload the local preview and play the game; preserve original mechanics during further layout work.
- Exact next file: workspace game `frame-fit.css`.

