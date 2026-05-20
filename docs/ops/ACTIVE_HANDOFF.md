# Handoff

- Project: `mental-health-wellness`
- Task: Convert the supplied Mental Health & Wellness Brightspace ZIP into a content-only course using the Forensics 25 shell behavior and styling pattern.
- Status: complete

## Files changed
- `projects/mental-health-wellness/meta/build_forensics_style_course.py`
- `projects/mental-health-wellness/meta/project.json`
- `projects/mental-health-wellness/meta/source-zip-audit.json`
- `projects/mental-health-wellness/raw/original.html`
- `projects/mental-health-wellness/workspace/**`
- `scripts/tests/mental-health-wellness-shell.test.ts`
- `docs/plans/2026-05-20-mental-health-wellness-forensics-shell-design.md`
- `docs/plans/2026-05-20-mental-health-wellness-forensics-shell.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`
- `.stax/task.md`
- `.stax/codex-report.md`

## What changed
- Added a new migrated conversion project, `mental-health-wellness`.
- Built a Forensics 25-style shell with the same sidebar, chapter cards, iframe module view, local storage progress, and sequential lesson-card completion.
- Imported Units 1-6 from the Brightspace ZIP as 6 chapters with 70 content components.
- Excluded the `Course Information` top-level module from the learner-facing course.
- Kept `quizzes`, `assignments`, and `library` arrays present but empty for this first pass.
- Hid empty quiz and assignment tabs until those arrays are populated later.
- Skipped top-level `Assignment Submission`, hidden teacher materials, and all unit assignment subtrees.
- Removed learner-facing source trace cards/paths from lesson cards.
- Added blue styling for lesson cards that are not marked complete.
- Removed visible Forensics wording from the Mental Health learner-facing shell.
- Added a project-local generator so the shell can be regenerated from the same ZIP.

## Why this changed
- The user wanted the same Mental Health & Wellness Brightspace ZIP placed into the framework/look/functionality of the existing Forensics 25 course.
- The user clarified that assignments and quizzes should not be included for now, but should remain possible later.

## Source of truth
- Canonical entry: `projects/mental-health-wellness/workspace/index.html`
- Canonical sources: `projects/mental-health-wellness/workspace/main.js`, `projects/mental-health-wellness/workspace/styles.css`, `projects/mental-health-wellness/workspace/course-data.js`, `projects/mental-health-wellness/workspace/content/module-index.css`
- Regeneration command: `python projects/mental-health-wellness/meta/build_forensics_style_course.py`
- Source ZIP: `C:\Users\dean.guedo\Downloads\D2LCCExport_60408_21-22 _ S2 _ Mental Health _ Wellness _ Per 1(A) __202652043.zip`
- Audit: `projects/mental-health-wellness/meta/source-zip-audit.json`

## Fragile areas / watchouts
- Regeneration deletes and rebuilds `projects/mental-health-wellness/workspace/**` and `projects/mental-health-wellness/raw/**`.
- The audit still records 5 unresolved source-package references: 3 missing Brightspace quickLink PDFs and 2 missing shared template banner images.
- The visible shell has no assignment or quiz surface by design; adding them later should update `course-data.js`, unhide tabs through non-empty arrays, and add tests.
- STAX visual proof for the blue incomplete-card state was captured at `.stax/visual-proofs/visual_2026-05-20T20_50_44_115Z_872ca640d800.png`.

## Next prompt should assume
- The content-only shell exists and passes targeted tests plus repo verification.
- Assignments/quizzes are intentionally absent from learner-facing workspace output.
- Existing unrelated dirty HSS/STAX/Social Studies/DOCX files remain present.

## What still needs validation
- Manual browser review of all chapters for visual fidelity and media usefulness.
- STAX proof acceptance; the sidecar was already carrying stale HSS task state before this work.

## Known risks
- Some linked source PDFs were not present in the ZIP and cannot be restored without the missing files.
- External font/icon CDN dependencies remain, matching the Forensics shell pattern.
- The course is not configured for live Google Hosted deploy yet.

## Exact next command
`node node_modules/tsx/dist/cli.mjs --test scripts/tests/mental-health-wellness-shell.test.ts`

## Exact next file to open
`projects/mental-health-wellness/workspace/index.html`

## Do not do next / warnings
- Do not add assignments or quizzes unless the user asks for that next pass.
- Do not run deploy or publish commands unless explicitly requested.
- Do not remove unrelated dirty HSS/STAX/Social Studies files without explicit approval.
