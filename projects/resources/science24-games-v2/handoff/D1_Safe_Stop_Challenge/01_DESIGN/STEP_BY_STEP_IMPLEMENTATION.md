# D1 Step-by-Step Implementation Plan

1. Freeze the supplied package and verify `SHA256SUMS.txt` at the root.
2. Read all shared contracts under `00_SHARED/`.
3. Read this game's design, scenario, answer/feedback, state and asset files completely.
4. Open every executable mockup in `04_MOCKUPS/html/` and compare it to its PNG baseline.
5. Run `node --test tests/engine.test.js` in `05_CODE_STARTER/`; do not edit until the baseline passes.
6. Create the production shell by copying the mockup DOM/CSS rather than re-creating it from memory.
7. Load versioned scenario JSON; no science answer belongs only in UI markup.
8. Connect the pure domain engine to renderers and controls.
9. Implement reversible navigation and complete state restoration.
10. Implement worked → supported → reduced-support → transfer scaffold fading.
11. Add local feedback, explicit revision mode and attempt comparison.
12. Add keyboard/touch equivalents, focus management and text/table alternatives.
13. Run unit tests against every authored scenario and misconception path.
14. Run browser routes at 360, 390, 430, 768, 1024, 1440 and 1648 px plus 200% zoom.
15. Capture visual-regression screenshots and compare with the baselines; unexplained drift fails.
16. Record teacher content review, tested browsers/devices, accessibility results and known limits.
17. Integrate only into an approved copy of the course; preserve course IDs, progress and existing saved-work contracts.
