# Handoff

- Project: forensicstudiesoption2
- Task: align option 2 chapter cards and assignment lanes to the original Forensics bucket rules and assignment content
- Status: complete

## Summary
- Option 2 now uses the same chapter-card inclusion rules as the original Forensics runtime, so only retained case-module content that appears in `projects/forensics` is surfaced in chapter readers.
- Option 2 assignment lanes now use the original Forensics synthetic lab titles and intro content instead of the previously generated summary cards.
- The canonical generator and its source-based tests were updated, then the generated chapter pages and `course-data.js` were rebuilt from that source of truth.
- Extra-credit content is now excluded from the option-2 surfaced course contract, so `Extra Credits`, its quiz entry, and the stale generated `chapter-10` page no longer appear.
- The option-2 loader now uses revisioned asset URLs for `styles.css`, `course-data.js`, and `main.js` so Builder does not keep serving the stale cached extra-credit runtime.

## Files changed
- docs/ops/ACTIVE_HANDOFF.md
- docs/ops/ARCHIVED_HANDOFFS.md
- docs/plans/2026-04-21-forensicstudiesoption2-module-assignment-fidelity.md
- projects/forensicstudiesoption2/workspace/index.html
- scripts/build-forensicstudiesoption2-content.ts
- scripts/tests/forensicstudiesoption2-content.test.ts
- scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
- projects/forensicstudiesoption2/workspace/course-data.js
- projects/forensicstudiesoption2/workspace/content/chapter-1/index.html
- projects/forensicstudiesoption2/workspace/content/chapter-2/index.html
- projects/forensicstudiesoption2/workspace/content/chapter-3/index.html
- projects/forensicstudiesoption2/workspace/content/chapter-4/index.html
- projects/forensicstudiesoption2/workspace/content/chapter-5/index.html
- projects/forensicstudiesoption2/workspace/content/chapter-6/index.html
- projects/forensicstudiesoption2/workspace/content/chapter-7/index.html
- projects/forensicstudiesoption2/workspace/content/chapter-8/index.html
- projects/forensicstudiesoption2/workspace/content/chapter-9/index.html
- projects/forensicstudiesoption2/workspace/content/chapter-10/index.html

## Verification run
- `node scripts/build-forensicstudiesoption2-content.ts`
- `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`
- `npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
- `npm.cmd run verify -- --project forensicstudiesoption2`

## What changed
- Rebuilt the option-2 chapter lesson inventory from the same original Forensics filter rules used in `projects/forensics/workspace/main.jsx`.
- Removed leaked `Unit Assessments` lesson cards and the assignment-link content pages they were pulling into chapter readers.
- Rebuilt option-2 assignment lanes so the visible titles now match original Forensics synthetic lab assignments, for example `Crime Scene Certification Lab` and `Fingerprint Analysis Interactive Assignment`.
- Replaced the old multi-brief assignment summaries with source-faithful assignment intro HTML from original Forensics synthetic lab content.
- Regenerated `workspace/course-data.js` and every chapter page from the generator so the new contract lives in canonical outputs.
- Added source-based regression coverage that locks both chapter card inventory and assignment lane fidelity to the original Forensics course map.
- Excluded the raw-export `Extra Credits` module from the surfaced option-2 course contract and pruned the stale generated `chapter-10` directory during regeneration.
- Added a cache-bust revision query to the option-2 loader assets so stale browser-cached course data and runtime files do not keep surfacing removed extra-credit UI.

## Why this changed
- The user wanted option 2 to stop inventing chapter and assignment cards that do not exist in the original Forensics course and to make the assignment section use the same underlying content as Forensics.

## Source of truth
- Original bucket and assignment contract reference: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics\workspace\main.jsx`
- Original module map reference: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics\workspace\d2l-map-data.js`
- Canonical option-2 generator: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\build-forensicstudiesoption2-content.ts`
- Canonical generated outputs: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensicstudiesoption2\workspace\course-data.js` and `...\workspace\content\chapter-*\index.html`

## Fragile areas / watchouts
- `workspace/course-data.js` and `workspace/content/chapter-*` are generated outputs and will be overwritten on the next generator run.
- Assignment lane fidelity now depends on the synthetic lab intro HTML copied from the original Forensics runtime into `build-forensicstudiesoption2-content.ts`.
- Module 7 still uses an external Wikimedia image inside the synthetic intro HTML because that is what the original Forensics runtime uses.
- The project still has no `projects/forensicstudiesoption2/meta/e2e-contract.json`, so project E2E remains blocked.

## Next prompt should assume
- `projects/forensics` was not touched.
- Option 2 chapter readers now use the original Forensics content bucket rules.
- Option 2 assignment lanes now use original Forensics synthetic lab titles and intro content.
- `Unit Assessments` no longer appear in option-2 chapter readers.
- `Extra Credits` and the extra-credit quiz no longer appear in option 2.
- Focused tests and project verify pass.

## What still needs validation
- Refresh `forensicstudiesoption2` in Canvas Builder and visually confirm the chapter readers no longer show `Unit Assessments` cards.
- Open at least Module 1 and Module 2 assignment detail pages and confirm the new titles and intro content now match the original Forensics assignment surfaces closely enough.
- Decide whether the single-brief option-2 assignment rendering should also be visually tightened to resemble the original Forensics assignment detail layout more closely.

## Known risks / follow-up
- The shell still wraps the content in the option-2 visual system, so this is content-fidelity alignment rather than a full Forensics UI clone.
- If the original Forensics runtime changes its synthetic intro HTML later, the option-2 generator will need a matching update.
- Without an E2E contract, browser-level regression coverage is still incomplete for this project.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\build-forensicstudiesoption2-content.ts`

## Do not do next / warnings
- Do not edit `projects/forensics/**` while refining option 2.
- Do not hand-edit `projects/forensicstudiesoption2/workspace/course-data.js` or the generated chapter pages without rerunning the generator.
- Do not treat missing project E2E as a new runtime failure until `meta/e2e-contract.json` exists.
