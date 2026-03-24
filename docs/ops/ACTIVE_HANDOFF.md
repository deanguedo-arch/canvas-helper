# Handoff

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Task: Build the initial conversion pass for the imported Experimental Psychology 30 D2L export and make the planning artifacts filesystem-safe
- Status: complete

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/curriculum-heuristics.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/tests/course-planning.test.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/project.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/d2l-course-map.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/d2l-course-map.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/course-blueprint.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/assessment-map.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/index.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/course-shell-data.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/index.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/import-log.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/prompt-pack.md

## What changed
- Imported the D2L ZIP into `projects/incoming/experimental-psych-30-per-1-a-b-sec-s-202632352` using `bsdtar` because the archive used nonstandard encoded folder names that `unzip` could not extract on macOS.
- Created the new conversion project and generated D2L mapping, course blueprint, assessment map, lesson packets, and course shell data for the imported course.
- Replaced the raw imported page with a custom course shell in `workspace/index.html` and `workspace/main.js` that reads the generated shell data, browses modules and activities, and tracks local completion state.
- Updated the project manifest so `workspace/main.js` is a canonical source, `workspace/course-shell-data.js` is a generated output, and the regen command is recorded.
- Fixed `toStableId(...)` so very long extracted statements are truncated and hashed, which keeps lesson packet filenames under filesystem limits without changing the underlying learning text.
- Added a regression test that proves long extracted statements still produce safe, repeatable stable IDs.

## Why this changed
- The imported D2L export needed a working conversion baseline, not just raw intake.
- The first lesson-packet build failed because one outcome title was derived from an extremely long extracted statement, so the ID generator needed to become filesystem-safe.

## Source of truth
- Canonical editable source: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/index.html`
- Canonical source files currently tracked in the manifest: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/index.html`, `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`
- Generated planning artifacts: `projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/**`
- Derived build output: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/course-shell-data.js`

## Fragile areas / watchouts
- The D2L import still references shared HTML template assets that are not present locally, so verify warnings will continue until those paths are replaced or removed.
- OCR fallback is unavailable in this environment, so PDF-derived references that need OCR may remain under-processed.
- The blueprint currently collapsed to one unit, which means the next conversion pass likely needs manual structure refinement if the course should reflect the full 7-module D2L outline.

## Next prompt should assume
- The import and first planning pass are complete.
- The workspace now has a dedicated course shell; next work should focus on content refinement, module naming, and any manual restructuring needed to better match the full D2L export.

## What still needs validation
- Studio review of `workspace/index.html`, `workspace/main.js`, and `workspace/course-shell-data.js`.
- Manual refinement of the course structure if the one-unit blueprint is too compressed for the actual course intent.

## Known risks
- The imported course content may still need substantial human-guided normalization because the automated blueprint is overly coarse.
- Generated planning artifacts are derived output and should be regenerated rather than edited by hand.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`

## Do not do next / warnings
- Do not edit `projects/experimental-psych-30-per-1-a-b-sec-s-202632352/raw/**`.
- Do not hand-patch generated planning outputs unless you are intentionally fixing a regeneration bug.
- Do not treat the current one-unit blueprint as authoritative for final course structure without review.
