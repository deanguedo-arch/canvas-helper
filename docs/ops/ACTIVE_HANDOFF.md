# Handoff

- Project: `mental-health-wellness`
- Task: Evaluate the newly supplied Mental Health & Wellness D2LExport content-folder ZIP and use anything that improves the existing Forensics-style course shell.
- Status: complete

## Summary
- The new content-folder ZIP is useful, but only for a narrow gap.
- It contains additional coursefile resources: 40 images, 37 PDFs, 82 HTML files, and 8 Office documents.
- The first Mental Health & Wellness pass was already good for packaged lesson images: it copied 20 images from the original source package.
- The new ZIP resolved the three remaining PDF quickLinks that had previously been unavailable:
- `pregnancy-mental-health-grossesse-sante-mentale-eng.pdf`
- `Team-Based Healthcare Offers Proven Path to Improving Americans' Mental Health.pdf`
- `PrimaryCare_Overview_Reviews_Narrative_Summaries_ENG_0.pdf`
- The new ZIP does not contain the remaining shared-template `banner_06.jpg` references.
- Current audit now has 8 support files, 20 copied images, 0 unresolved links, and 2 unresolved assets, both shared-template banner images.

## Files changed
- `projects/mental-health-wellness/meta/build_forensics_style_course.py`
- `projects/mental-health-wellness/meta/source-zip-audit.json`
- `projects/mental-health-wellness/workspace/content/chapter-3/index.html`
- `projects/mental-health-wellness/workspace/content/chapter-4/index.html`
- `projects/mental-health-wellness/workspace/references/mental-health-wellness/linked-resources/**`
- `scripts/tests/mental-health-wellness-shell.test.ts`
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification run
- `node node_modules/tsx/dist/cli.mjs --test scripts/tests/mental-health-wellness-shell.test.ts`
- `python projects/mental-health-wellness/meta/build_forensics_style_course.py`
- `rg -n "missing-resource-link|quickLink\.d2l|pregnancy-mental-health|Team-Based%20Healthcare|PrimaryCare_Overview" projects/mental-health-wellness/workspace/content`
- `npm.cmd run verify -- --project mental-health-wellness`

## Known risks / follow-up
- The two remaining unresolved assets are `/shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/img/banner_06.jpg` in Module 5 Summary and Module 6 Summary.
- Those shared-template banner images were not present in either Mental Health package.
- Regeneration now uses `MENTAL_HEALTH_WELLNESS_ASSET_ZIP` when set, or the supplied Downloads path by default.
- Live deploy was not requested and was not run.

## Source-of-truth location
- `projects/mental-health-wellness/workspace/index.html`
- Regeneration command: `python projects/mental-health-wellness/meta/build_forensics_style_course.py`

## Fragile areas / what might drift
- The project-local generator deletes and rebuilds the Mental Health workspace and raw folder.
- The auxiliary asset ZIP path is local-machine specific unless the environment variable points to a durable copy.
- The remaining `banner_06.jpg` references are from Brightspace shared template paths, not course package files.

## Next prompt assumptions
- Mental Health & Wellness is ready for review with the useful assets from the new D2LExport ZIP included.
- The first conversion was broadly correct; the new ZIP improves missing PDF resource coverage rather than changing the course shell.

## Exact next command
`npm.cmd run verify -- --project mental-health-wellness`

## Exact next file to open
`projects/mental-health-wellness/workspace/index.html`

---

- Project: `learning-strategies-15`, `learning-strategies-25`, `learning-strategies-35`
- Task: Convert the three supplied Learning Strategies Brightspace ZIPs into separate content-only course shells using the same Forensics 25-style behavior and cleanup pattern used for Mental Health & Wellness.
- Status: complete

## Summary
- Added three migrated conversion projects:
- `projects/learning-strategies-15`
- `projects/learning-strategies-25`
- `projects/learning-strategies-35`
- `projects/mental-health-wellness`
- Built each from its own supplied Brightspace ZIP as an individual course.
- Used the same student shell behavior as the recent Mental Health/Forensics-style course: sidebar navigation, lesson cards, iframe lesson view, local progress, Mark Complete flow, and blurred/blue locked next cards.
- Kept `quizzes`, `assignments`, and `library` arrays empty for now.
- Removed learner-facing LMS/admin material: Course Information, Keys, assignment booklets, assignment/dropbox directions, contact assignment, teacher guide/admin/source wording, and Next Steps blocks.
- Kept card headers to the content label, such as `Reading`, without repeating lesson-name trails.
- Applied link/readability cleanup so links are visually clickable and imported lesson bodies are less cluttered.
- Temporarily review-unlocked all lesson cards in Mental Health & Wellness plus Learning Strategies 15/25/35 so every card can be checked without completing earlier cards first.

## Files changed
- `projects/learning-strategies-15/**`
- `projects/learning-strategies-25/**`
- `projects/learning-strategies-35/**`
- `scripts/tests/learning-strategies-shells.test.ts`
- `.stax/task.md`
- `.stax/codex-report.md`
- `.stax/visual-proofs/manifest.json`
- `.stax/visual-proofs/learning-strategies-15-shell-proof.png`
- `.stax/visual-proofs/learning-strategies-25-shell-proof.png`
- `.stax/visual-proofs/learning-strategies-35-shell-proof.png`
- `.stax/visual-proofs/mental-health-wellness-review-unlocked.png`
- `.stax/visual-proofs/learning-strategies-15-review-unlocked.png`
- `.stax/visual-proofs/learning-strategies-25-review-unlocked.png`
- `.stax/visual-proofs/learning-strategies-35-review-unlocked.png`
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification run
- `node node_modules/tsx/dist/cli.mjs --test scripts/tests/learning-strategies-shells.test.ts`
- `rg -n -i -g "*.html" "Course Information|Assignment Booklet|Teacher Guide|Contact Assignment|Retained content from the original|Brightspace module|Brightspace export|Source image unavailable|Content-only Brightspace conversion|source unit|original course package|Next Steps|sequence-title|sequence-note" projects/learning-strategies-15/workspace projects/learning-strategies-25/workspace projects/learning-strategies-35/workspace`
- `npm.cmd run validate:manifests -- --project learning-strategies-15`
- `npm.cmd run validate:manifests -- --project learning-strategies-25`
- `npm.cmd run validate:manifests -- --project learning-strategies-35`
- `npm.cmd run verify -- --project learning-strategies-15`
- `npm.cmd run verify -- --project learning-strategies-25`
- `npm.cmd run verify -- --project learning-strategies-35`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- Playwright rendered check for all three shells.
- STAX visual proof collection for all three shells.
- Review-unlock check:
  - `node node_modules/tsx/dist/cli.mjs --test scripts/tests/learning-strategies-shells.test.ts scripts/tests/mental-health-wellness-shell.test.ts`
  - Playwright rendered check for Mental Health & Wellness and Learning Strategies 15/25/35 confirming zero locked cards and zero disabled Mark Complete buttons on chapter 1.

## Known risks / follow-up
- The source ZIPs contain no packaged images. Missing source image references are represented by the student-facing `Image not available yet.` fallback.
- Source audits still show unresolved references because the Brightspace exports did not include those files: LS15 has 84, LS25 has 95, and LS35 has 91 unresolved references.
- Mental Health & Wellness is different: its ZIP contains image files and 20 images were copied; only 2 shared template banner references remain unresolved.
- Learning Strategies 15 images were restored from `C:\Users\dean.guedo\Downloads\D2LExport_68818_22-23 _ S2 _ Learning Strategies 15 (2018) _ Per 1_202652115.zip`: 67 images copied, 0 unresolved image refs.
- Learning Strategies 25 images were restored from `C:\Users\dean.guedo\Downloads\D2LExport_149442_24-25 _ Learning Strategies 25 (2018) _ Per 1(A-B)_202652130.zip`: 73 images copied, 0 unresolved image refs.
- Learning Strategies 35 images were restored from `C:\Users\dean.guedo\Downloads\D2LExport_149441_24-25 _ Learning Strategies 35 (2018) _ Per 1(A-B)_202652158.zip`: 61 images copied, 0 unresolved image refs.
- Live deploy was not requested and was not run.
- Quizzes and assignments are intentionally absent and should be added in a later pass.
- There are unrelated dirty files already present in the worktree; they were not reverted.

## Source-of-truth location
- `projects/learning-strategies-15/workspace/index.html`
- `projects/learning-strategies-25/workspace/index.html`
- `projects/learning-strategies-35/workspace/index.html`
- Regeneration commands:
- `python projects/learning-strategies-15/meta/build_forensics_style_course.py`
- `python projects/learning-strategies-25/meta/build_forensics_style_course.py`
- `python projects/learning-strategies-35/meta/build_forensics_style_course.py`

## Fragile areas / what might drift
- Each project-local generator deletes and rebuilds that project workspace and raw folder.
- The generator logic is duplicated across the three projects to match the current project-local builder pattern.
- Future assignment/quiz additions need tests updated so hidden tabs become visible only when real data exists.
- Review-unlock mode is currently hard-coded as `reviewUnlockAll = true` in the generated chapter scripts and project-local generators. Turn it back off before a student-facing release if sequential locking is desired.

## Next prompt assumptions
- The three Learning Strategies shells exist separately and are ready for browser review.
- Assignments/quizzes are deliberately excluded for now.
- Missing images come from absent Brightspace package assets, not from a failed copy step.

## Exact next command
`node node_modules/tsx/dist/cli.mjs --test scripts/tests/learning-strategies-shells.test.ts`

## Exact next file to open
`projects/learning-strategies-15/workspace/index.html`
