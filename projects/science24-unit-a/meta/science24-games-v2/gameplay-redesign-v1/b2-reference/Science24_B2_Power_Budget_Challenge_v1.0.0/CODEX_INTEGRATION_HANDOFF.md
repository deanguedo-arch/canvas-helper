# Integrate the working B2 game — do not recreate it from a picture

The approved task in this package is **B2 only**. Use the actual `game/` source and `PLAY.html` build. PNGs in `qa/screenshots/` are captures from that implementation, not substitute UI layers or requests for a redesign.

1. Read README, rules/content, sources/scope and the executed test report.
2. Keep a recoverable copy of the current course/repository. Do not change A1 or the other six games.
3. For a standalone distribution, use `PLAY.html` unchanged. For a multi-file distribution, copy the complete `game/` folder, including data.js, assets.js, engine.js, app.js, styles.css and index.html. The WebP originals are supplied for later art updates; assets.js already contains their data URLs.
4. Run the numerical tests. Run the browser tests against the same rebuilt HTML. Do not claim tests passed if the environment did not execute them.
5. Verify the actual intended course host/iframe, including its script/CSP policy. The package has no SCORM API, LMS grade reporting, cloud saving, accounts, analytics or backend. Adding those needs a separate design decision, not an assumed integration step.
6. Preserve the exact model/data separation. Device energy, total, budget status and service status must share the engine. Never copy the earlier premium mockup's incorrect 14.87 kWh number into runtime.
7. Preserve per-device power labels and fixed quantities. A group of five devices is not one device unless the model explicitly defines an aggregate load. Preserve hours/minutes and Wh/kWh handling.
8. Preserve back/forward state restoration, successful-answer locking and explicit revision, retained attempt history, and the immutable first-transfer submission. Reset must stay separate from navigation and require confirmation.
9. Preserve the transfer's changed context/data. Do not replace it with the already practised projector calculation.
10. Preserve the charcoal/forest/white layout, approved imagery, component hierarchy and responsive stacking. Do not replace art with generic icons or flatten the activity into a quiz form. Do not use screenshots as an interaction surface.
11. Capture browser screenshots on the target host at 390, 768, 1366 and 1648 CSS pixels and compare with this source. Font rendering can vary by system font; no proprietary font files are supplied. Compare in the same browser/OS for pixel comparisons.
12. Perform real-device Safari/touch, assistive-technology, keyboard, zoom and teacher-content review before release. Verify both a fresh session and an existing in-tab draft. Nothing should clear on Previous/Next/Home.

## Editing/building

Content is in `game/data.js`. Pure validators are in `game/engine.js`. UI/session behaviour is in `game/app.js`. Styling is in `game/styles.css`. Rebuild with `python3 tools/build.py` after editing. Update version metadata, screenshots and tests together.

## Must not change silently

- Do not save learner state to localStorage, cookies or a service without approval.
- Do not remove the warning that reloading/closing ends this in-memory session.
- Do not certify free-text reasoning by keyword matching.
- Do not label assisted corrections as first-attempt independent success.
- Do not treat full-centre lab completion as independent transfer evidence.
- Do not delete the no-data-collection or model-limit statements.
- Do not infer real building safety, thermal performance, electricity costs or product efficiency from these teaching numbers.
