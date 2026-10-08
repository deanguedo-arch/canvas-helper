# Master Build Contract — All Eight Science 24 Games

## Product objective
Build eight responsive, local-first web learning games that feel like direct extensions of the existing Next Step Science 24 course and deliberately prepare students for Alberta Science 24 assessment demands.

## Locked common learning loop
1. Brief — goal, question, allowed actions and success criterion.
2. Worked round — a complete reasoning process and likely mistake.
3. Supported attempt — prediction before the model; one targeted hint at a time.
4. Feedback and retry — preserve the attempt so revision is visible.
5. Fresh transfer — new context/representation; no worked solution exposed first.
6. Review — distinguish completion from demonstrated independent transfer.

## Exact visual implementation rule
The HTML/CSS mockups in every game's `04_MOCKUPS/html/` folder are executable design source, not inspiration. Codex must reuse their DOM structure, CSS tokens, provided SVG/PNG assets and responsive breakpoints. The PNG files in `04_MOCKUPS/png/` are deterministic full-page previews of those executable sources. During implementation, Codex must create browser screenshots from the same HTML and use those as the runtime visual-regression baselines. A redesign that merely uses green and charcoal is a failure.

## Shared technical direction
- HTML5, CSS3 and modern vanilla JavaScript ES modules.
- SVG/DOM for equations, quantities, graphs, routes, pedigrees and answer-critical science.
- JSON-authored scenarios with version IDs.
- Pure deterministic domain validators separate from rendering.
- Anonymous in-memory state by default; no accounts, analytics, cloud storage or network dependence.
- Keyboard/touch parity, visible focus, reduced motion and text/table equivalents.
- Reversible Previous/Next navigation with complete state preservation.
- Unit and browser tests; unperformed checks remain `Not tested`.

## What Codex may not do
- Replace the screen architecture with a generic form or dashboard.
- invent new science or alter accepted answers without a documented source review;
- bake formulas, values, graph axes or route logic into generated images;
- auto-grade open reasoning with keyword matching;
- remove previous-step navigation or reset work when moving backward;
- add scores for speed, leaderboards, economies, avatars, multiplayer or student data collection;
- claim the activity is released or effective without teacher and runtime review.
