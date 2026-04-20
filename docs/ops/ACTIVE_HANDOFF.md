# Handoff

- Project: general-psychology-20-independent-studies-202633108
- Task: Remove the remaining Module 2 written-response placeholder, wire the visible quiz cards to real converted quiz sources, and keep the Final Project PDF in content instead of an empty assignment-only module.
- Status: ready for validation

## Files changed
- `projects/general-psychology-20-independent-studies-202633108/meta/build-shell-from-manifest.ps1`
- `projects/general-psychology-20-independent-studies-202633108/workspace/main.js`
- `projects/general-psychology-20-independent-studies-202633108/workspace/course-shell-data.js`
- `projects/general-psychology-20-independent-studies-202633108/workspace/assessment-delivery.js`
- `projects/general-psychology-20-independent-studies-202633108/meta/d2l-course-map.json`
- `projects/general-psychology-20-independent-studies-202633108/meta/d2l-course-map.md`
- `scripts/tests/general-psychology-workspace.test.ts`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed
- Extended `meta/build-shell-from-manifest.ps1` to infer quiz XML resources directly from `projects/resources/<slug>/quiz/**` when the manifest-backed assessment record has no source file attached.
- Added title aliasing so the visible Module 1 shell cards map to the existing converted quiz banks:
  - `John Watson` -> `Behaviourism`
  - `Maslow Quiz` -> `Humanism Quiz`
  - `Summary Quiz` -> `Psychological Schools of Thought Summary Quiz`
- Regenerated `workspace/course-shell-data.js` so the visible quiz assessment cards now point at local `quiz/.../qti_*.xml` sources instead of the missing-source fallback copy.
- Added another project-specific exclusion so Module 2 no longer includes the `Written Response (Principles of Learning)` placeholder tied to `chapter_15761.html`.
- Updated `workspace/main.js` so the `General Psychology 20 Final Project` PDF is treated as content rather than being reclassified into assignments and leaving the module content list empty.
- Expanded `scripts/tests/general-psychology-workspace.test.ts` to cover the Module 2 exclusion, quiz-source wiring, the existing authoring unlock, and the Final Project classification rule.

## Why this changed
- The user-facing General Psychology shell still had one leftover D2L placeholder lesson and several quiz cards that incorrectly rendered the “source file missing” fallback even though the quiz XML banks already existed locally.
- The Final Project module looked broken because its only PDF item was being pushed out of content by the assignment heuristic.

## Source of truth
- General Psychology shell generator: `projects/general-psychology-20-independent-studies-202633108/meta/build-shell-from-manifest.ps1`
- Local General Psychology runtime classification and authoring unlock: `projects/general-psychology-20-independent-studies-202633108/workspace/main.js`
- Generated shell data: `projects/general-psychology-20-independent-studies-202633108/workspace/course-shell-data.js`

## Fragile areas / watchouts
- Quiz-source inference currently depends on normalized quiz titles plus a small alias table for known mismatches. If new title drift appears, update the alias map in `build-shell-from-manifest.ps1`.
- The authoring unlock flag is still on in `workspace/main.js`, so all content/quizzes remain open locally for testing.
- This work fixed the local workspace shell. It was not exported or redeployed in this pass.

## Next prompt should assume
- The Module 2 `Written Response (Principles of Learning)` placeholder is removed from the generated shell.
- The visible General Psychology quiz cards now load from local quiz XML or from the intentional local overrides instead of the missing-source fallback.
- The Final Project module should now show its PDF in content instead of “No content items.”

## What still needs validation
- Reload the local General Psychology preview and spot-check the quiz cards the user reported, especially `John Watson`, the Module 2 quiz list, and the Final Project module.
- If the hosted General Psychology site should match these fixes, run export and deploy after local review.

## Known risks
- `npm.cmd run typecheck` still fails on the unrelated pre-existing `scripts/tests/worldreligions30-option1-quiz-summary.test.ts` errors.
- If the quiz XML titles or launcher titles are renamed later, the aliasing logic may need one more targeted update.

## Exact next command
`npm.cmd run verify -- --project general-psychology-20-independent-studies-202633108`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\meta\build-shell-from-manifest.ps1`

## Do not do next / warnings
- Do not hand-edit `workspace/course-shell-data.js`; regenerate from `meta/build-shell-from-manifest.ps1`.
- Do not export or deploy this workspace without remembering that `AUTHORING_UNLOCK_ALL = true` is still enabled locally.
