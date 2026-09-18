# Original mechanics and local dependencies

Game application derived from uploaded phase4-mental-filter-simulator-game.app.js. Core target/card motion, scoring and thresholds are retained. Input descriptions, state panels, keyboard controls, pause clock, sound and evidence lifecycle are repaired.

React and ReactDOM are extracted from the user's supplied bundled Phase 1 game, with its bundled MIT license notices retained in react-local.js. TypeScript is used only at build time; no compiler or external CDN is required at runtime. Tailwind utility CSS is compiled locally from the game source. Fonts use the installed system stack; no fonts are shipped.
