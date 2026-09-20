## Game frame sizing — 2026-09-18

- Summary: game frames now follow their full content height; Phase 2–4 arenas adapt to actual embed width. Removed viewport-height feedback from embedded wrappers. Original game mechanics unchanged.
- Files changed/source of truth: canonical workspace `game-frame-fit.js`, game `frame-fit.css`/`frame-fit.js`, parent and game HTML entries, and canonicalSources metadata. Phase 1 game files are under `assets/game/original`; Phase 2–4 under `assets/game`.
- Verification: focused real file-URL Chromium sizing checks at 1302 and 390 pixels, intro/start/active bounds and no horizontal overflow; Phase 2–4 pause/resume/end bounds checked. Desktop active game screenshots inspected. See `scripts/tests/sportswellness-game-sizing.cjs`.
- Risks/follow-up: phone games use normal course page scrolling; Phase 1 retains its stacked controls. Broad learner-state/E2E, Studio and LMS rollout gates deferred. No packaging or deployment.
- Fragile areas: intrinsic-height sizing must not reintroduce iframe viewport-dependent wrapper minimum heights. Height messages require exact iframe window source and expected origin, with finite bounded values.
- Next prompt assumptions/action: reload the local preview and play the game; preserve original mechanics during further layout work.
- Exact next file: workspace game `frame-fit.css`.

# sportswellness-phase-3 integration handoff

## Summary
Imported ChatGPT Pro working preview as a separate blocked conversion review candidate. Original Sports Wellness, Phase 1 and Biology/Chemistry preserved. Eighteen routes, twelve numbered topics, sixteen formative checks, twelve required Build fields, four written reviews, 12 checkpoint identities, three guided/untimed cases and transfer retained.

## Files changed
New workspace and operational metadata for this slug; importer inert-script filter and focused regression test; shared real-URL integration harness. Source package preserved under projects/incoming/sportswellness-phases2-4-working-previews-v1. Six-line current Phase 1 activity shortcut CSS delta added through exact stylesheet reuse. Parent and child game origins normalized for file URLs; gameplay unchanged.

## Verification run
607 upstream file hashes and ZIP CRC verified. Current real HTTP/file checks and limits: integration-checks.json. Long-response restoration/final input, checkpoint partial resume/incomplete rejection/deduplication, invalid backup/confirmed replacement, notes delete/Undo, game pause/resume/exit summaries, wrong-window messages, safe scoped print popup, desktop/phone views and drawer checked. Denied-storage recoverable work checked on Phase 2 shared runtime. Import inert metadata regression and existing React imports checked. These are focused integration checks, not broad course certification.

## Known risks / follow-up
Shared bridge capacity remains below the 780,000 response-character maximum plus notes/history. Never truncate. SCORM/Brightspace, Studio lifecycle/readiness, full-route E2E, actual browser shutdown, physical devices/assistive technology, student pilot and teacher outcome review deferred. Print window content verified; operating-system print dialogue not certified. PDFs/utility CSS are supplied generated artifacts; recover/adapt regeneration tools before production readiness. Videos remain withheld.

## Source of truth
workspace/index.html owns teaching, questions, captions, links and instructions; workspace/runtime.js owns behaviour; styles.css matches current Phase 1; original game source/bridge are canonical; vendor runtime, utility CSS and reading PDF roles are declared in project.json. meta/source-review and incoming developer records are upstream references.

## Fragile areas
Phase identity and field IDs; first-answer snapshots; checkpoint content version; origin/session/game-message validation; full permitted text; generated PDF versus HTML drift. Raw import is reference-only: active preview is workspace.

## Next prompt assumptions
Build mode, local preview only; no deployment, SCORM packaging, activation or old-state migration inferred.

## Exact next action
Open the affected workspace for review. A separately requested rollout batch should use the recorded deferred list rather than infer certification from the upstream fixture report.

## Exact next file to open
projects/sportswellness-phase-3/workspace/index.html#course-guide
