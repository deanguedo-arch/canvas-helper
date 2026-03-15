# Task
## Goal
Complete Phase 3 for `forensics` as a faithful D2L course player: preserve real source sequence and meaning, render real node types reliably, and enforce learner-safe default visibility with explicit archive mode.

## Constraints
- Keep `projects/forensics/raw/**` and `projects/resources/forensics/**` immutable.
- Work in `projects/forensics/workspace/**`, `projects/forensics/meta/**`, and minimal shared code only if a reusable parser gap is required.
- No new dependencies.
- No renames.
- No broad refactors.
- No interaction/visual polish work beyond what is required for source-faithful rendering.

## Acceptance tests
- Learner mode hides teacher/admin-only content (for example `Teacher Resources (KEEP HIDDEN)`).
- Archive mode reveals hidden/admin content in the same mapped hierarchy.
- Final exam and extra-credit nodes remain visible in sequence.
- Representative node types render from real source files:
  - HTML
  - PDF
  - assignment XML
  - quiz/QTI XML
- Rendering failures degrade to structured in-shell fallback, not a blank preview or runtime crash.
- `npm run verify -- --project forensics` passes.
- `npm run typecheck` passes.
- `npm run build:studio` passes.

## Known Parser/Renderer Gaps
- [ ] `quiz` XML variants with multi-item sections: parse all items, not only first item.
- [ ] `assignment` XML variants: extract richer structure (task, reminders, links) when present.
- [ ] `html` pages with Brightspace-template dependencies: retain readability after script/style stripping.
- [ ] media-first nodes currently mapped as `html-reading`: add better node-kind mapping and renderer routing.

## Expected files to change
- `tasks/active.md`
- `projects/forensics/workspace/**`
- optional minimal shared parser files if required by a reusable gap

## Commands
- `npm run verify -- --project forensics`
- `npm run typecheck`
- `npm run build:studio`
