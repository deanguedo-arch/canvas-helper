# Handoff

- Project: repo-wide / general-psychology-20-independent-studies-202633108
- Task: Harden local reopenability by failing verify on missing course-shell source files and returning explicit preview diagnostics for missing lesson HTML resources.
- Status: ready for validation

## Files changed
- `app/server/routes/preview.ts`
- `scripts/lib/verification.ts`
- `scripts/verify-project.ts`
- `scripts/tests/verification-course-shell.test.ts`
- `scripts/tests/preview-route.test.ts`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed
- `verify` now inspects `workspace/course-shell-data.js` in workspace mode and checks that every shell activity `sourceHref` resolves to an actual file under `projects/resources/<slug>`.
- Activities that already ship an explicit “the source file was not included in the cartridge” fallback are reported as warnings instead of hard failures so intentionally degraded assessment items do not block unrelated reopen work.
- Missing HTML lesson/resource preview requests now return an in-browser diagnostic page with the slug, requested path, expected local path, and the recovery command instead of a silent 404 fallback.
- Added focused regression tests for both the new verification path and the new preview-route diagnostic behavior.

## Why this changed
- The general psychology course reopened in a broken local state because the shell still referenced lesson files that had been removed from `projects/resources/<slug>`, and existing verification only checked direct HTML asset tags.
- The failure mode was silent inside the course shell: missing lesson fetches collapsed to the generic “Course content item” fallback instead of telling the operator that the local resource bundle was gone.

## Source of truth
- Verification logic: `scripts/lib/verification.ts`
- Verify CLI output: `scripts/verify-project.ts`
- Missing-resource preview diagnostic: `app/server/routes/preview.ts`
- General psychology canonical authoring surface remains `projects/general-psychology-20-independent-studies-202633108/workspace/index.html` plus its workspace runtime files and `projects/resources/general-psychology-20-independent-studies-202633108`

## Fragile areas / watchouts
- The stricter resource check only runs when `workspace/course-shell-data.js` exists. Projects that do not use the course-shell runtime are unchanged.
- The preview-route diagnostic is intentionally limited to missing HTML/HTM reference previews so lesson fetches become readable in-browser; non-HTML missing resources still use the existing 404 JSON path.
- There are unrelated dirty workspace files in this repo, including regenerated general psychology metadata and sportswellness assets, which were left untouched.

## Next prompt should assume
- `npm run verify -- --project <slug>` is now the intended reopenability gate for course-shell projects because it checks shell `sourceHref` targets under `projects/resources/<slug>`.
- If a lesson HTML resource is missing locally, previewing that reference will show a diagnostic page instead of silently degrading to generic shell copy.
- The restored `general-psychology-20-independent-studies-202633108` resource bundle currently passes the new verification path.

## What still needs validation
- Reload the local general psychology preview and confirm a missing lesson now surfaces the diagnostic page if the resource bundle is removed again.
- Decide whether to extend the same explicit diagnostic behavior to missing XML/PDF reference previews, not just HTML lessons.

## Known risks
- `npm.cmd run typecheck` still fails on pre-existing errors in `scripts/tests/worldreligions30-option1-quiz-summary.test.ts`; this work did not change that file.
- The verification carve-out depends on the fallback copy still containing a “source file missing from the cartridge” message. If future wording changes, intentionally missing assessment items could become hard failures until the pattern is updated.

## Exact next command
`npm.cmd run verify -- --project general-psychology-20-independent-studies-202633108`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\verification.ts`

## Do not do next / warnings
- Do not delete or “clean up” `projects/resources/<slug>` for shipped course-shell projects unless you are intentionally rebuilding the local authoring state.
- Do not treat the hosted Firebase bundle as sufficient recovery data for local authoring; the local preview contract still depends on the project resource bundle.
