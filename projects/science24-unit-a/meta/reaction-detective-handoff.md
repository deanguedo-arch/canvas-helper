# Handoff

- Project: science24-unit-a
- Task: First playable run of the supplied A1 Reaction Detective game.
- Status: building; standalone local preview available.

## Files changed
- workspace/games/reaction-detective/**: imported prototype and local assets, focused game.js/styles.css fixes.
- projects/resources/science24-unit-a/reaction-detective-v1/**: preserved supplied handoff reference package.
- meta/project.json: appended planned component, retained existing lifecycle and unrelated metadata.
- meta/reaction-detective-first-run.json: provenance, ZIP hash and scoped evidence.

## What changed / why
Prediction before reveals, two-record evidence selection, limited-record uncertainty for Cooling Solution, visible attempt history, usable three-step hints, review hint/retry counts and explanation-submitted status. Intro count and heading readability corrected. Existing Unit A lesson/progress/save sources untouched.

## Verification run
JS syntax; browser intro/worked/first practice; two-token reveals; valid physical-change submission; next case clears answers/prediction/tokens. No captured console errors along inspected route. context:project refused with not-active because Unit A remains blocked.

## Source of truth
projects/science24-unit-a/workspace/games/reaction-detective/index.html plus game.js, scenarios.js, styles.css and assets/**. Resource package is immutable reference provenance, not regeneration input. Local server: http://127.0.0.1:57324/.

## Fragile areas / known risks
In-memory only: reloading loses this game session. Current scenario data and generated art await teacher science review. Runtime-rendered content is Annotation only. Component is planned for integration; no host navigation or required-progress registration.

## Next prompt should assume
Build mode, optional standalone first run; no release or LMS reporting authorized. Existing course remains blocked. Supplied build prompts are reference material, not independent authorization.

## What still needs validation
All-case/misconception/alternative answers; retries/hints/reset/transfer; keyboard/touch/narrow viewport/200% zoom; teacher science review and final course placement; course integration and SCORM/Brightspace release checks.

## Routing
Deterministic ZIP intake; lead retained bounded state fixes, dirty metadata integration and browser acceptance. External uncommitted source precluded a detached-commit worker implementation. No worker/provider-cache calls; local context refusal is not a cache hit; usage savings unknown.

## Exact next action
Await Dean's first-run review and requested changes.

## Exact next file to open
projects/science24-unit-a/workspace/games/reaction-detective/game.js

## Do not do next / warnings
Do not activate/export/deploy the course or count this activity toward required progress without scoped authorization and the release checks.
