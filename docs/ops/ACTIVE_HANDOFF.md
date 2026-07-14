# Handoff

- Project: `ela20-1-shakespeare-macbeth`
- Task: Audit the supplemental Next Step ELA 20-1 export and rebuild Macbeth's Materials, Act Questions, Character Notes, Writing Studio, and Resources to the proven ELA 30-1 Othello format.
- Status: implementation complete and review-ready; final export remains blocked

## Files changed

- `package.json`
- `scripts/lib/english-unit/types.ts`
- `scripts/lib/english-unit/schema.ts`
- `scripts/lib/english-unit/course-seeds.ts`
- `scripts/lib/english-unit/ela20-activity-profiles.ts`
- `scripts/lib/english-unit/activity-profile-renderers.ts`
- `scripts/lib/english-unit/activity-profile-runtime.ts`
- `scripts/lib/english-unit/factory-render.ts`
- `scripts/lib/english-unit/factory-build.ts`
- `scripts/lib/english-unit/activity-profile-renderers.test.ts`
- `scripts/lib/english-unit/ela20-activity-profiles.test.ts`
- `scripts/lib/english-unit/factory-render.test.ts`
- `scripts/tests/english-macbeth-workspace.test.ts`
- `scripts/verify-english-course.ts`
- `projects/resources/ela20-1/_sources/e3024a3265517f915612b58ee98347c3f2d80ef8c42e80a94fe64b02429369a4.zip`
- `projects/resources/ela20-1/_inventory/nextstep-ela20-1-s2-2026.md`
- `projects/resources/ela20-1/_inventory/nextstep-ela20-1-s2-2026.json`
- `projects/ela20-1-shakespeare-macbeth/meta/english-unit.json`
- `projects/ela20-1-shakespeare-macbeth/meta/project.json`
- `projects/ela20-1-shakespeare-macbeth/meta/prompt-pack.md`
- `projects/ela20-1-shakespeare-macbeth/meta/build-report.{md,json}`
- `projects/ela20-1-shakespeare-macbeth/meta/mapping-report.{md,json}`
- `projects/ela20-1-shakespeare-macbeth/workspace/index.html`
- `config/english/families/ela20-1-verification.{md,json}`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Hashed and retained the supplied Next Step export as immutable reference source `e3024a3265517f915612b58ee98347c3f2d80ef8c42e80a94fe64b02429369a4` and produced Markdown/JSON disposition reports.
- Confirmed the archive contains 18 XML files, 6 PDFs, and 1 JPEG, but most advertised module files and all novel/film texts are absent.
- Added verified Macbeth access through MIT Shakespeare and a truthful external myShakespeare companion link; myShakespeare is not embedded because its response headers restrict framing.
- Adapted the usable theme guidance, character-change prompt, and visual-motif task structure into clean ELA 20-1 interactive activities without importing summative or grade-contaminated PDFs.
- Rebuilt Macbeth Materials as the Othello-style two-column file/reader browser with open, full-screen, and download actions.
- Rebuilt Act Questions as an act/scene checkpoint workbook with the 20 teacher-selected scenes, hints, scoped printing, word counts, progress, individual scene saves, and one upserted act collection.
- Rebuilt Character Notes as six Othello-style dossiers with a left rail, progress, card grid, quotation saves, and an upserted full dossier collection.
- Rebuilt Writing Studio as the Othello-style activity workbench with Language Lab, Close Reading, Theme Builder, Character-Change Paragraph, Critical Essay, and Visual Motif Essay.
- Rebuilt Resources with recovered local documents plus grouped play-access/study-support links.
- Fixed dossier collection markers so working fields save as one Evidence Bank collection, and aligned the typed recipe/schema/seed with all six Writing Studio tools.
- Preserved supplemental `referenceOnly` metadata across future factory rebuilds and serialized the English browser tests to remove cross-browser style timing flakiness.

## Why this changed

- Macbeth had the correct activity names but not the proven Othello hierarchy, formatting, or interaction depth.
- The supplemental export had useful instructional scaffolds and access links, but it required file-level classification to avoid assessments, inherited ELA 30-1 language, and missing manifest targets.
- The six-tool learner workspace and five-tool typed recipe had to be reconciled so future bulk builds reproduce the reviewed result.

## Source of truth

- Unit decisions: `projects/ela20-1-shakespeare-macbeth/meta/english-unit.json`
- Restart context and supplemental decisions: `projects/ela20-1-shakespeare-macbeth/meta/prompt-pack.md`
- Supplemental source audit: `projects/resources/ela20-1/_inventory/nextstep-ela20-1-s2-2026.md`
- Activity content: `scripts/lib/english-unit/ela20-activity-profiles.ts`
- Learner markup: `scripts/lib/english-unit/activity-profile-renderers.ts`
- Learner behavior and scoped styles: `scripts/lib/english-unit/activity-profile-runtime.ts`
- Resource layout: `scripts/lib/english-unit/factory-render.ts`
- Safe rebuild and metadata preservation: `scripts/lib/english-unit/factory-build.ts`
- Canonical learner entry: `projects/ela20-1-shakespeare-macbeth/workspace/index.html`
- Editable scene data: `projects/ela20-1-shakespeare-macbeth/workspace/components/shakespeare-side-by-side/scenes.json`

## Verification run

- `npm run build:english-unit -- --project ela20-1-shakespeare-macbeth` passed: 10 lessons, 10 resources, 4 excluded assessments.
- `npm run test:english-course` passed: 31/31 with deterministic single-test concurrency.
- `npm run verify -- --project ela20-1-shakespeare-macbeth` passed; only expected Google Fonts/Material Symbols external dependency warnings remain.
- `npm run verify:english-course -- --course ela20-1` passed with 0 failures and 0 warnings across all five units.
- `npm run test:e2e:project -- --project ela20-1-shakespeare-macbeth` passed.
- `npm run test:e2e:smoke` passed.
- `npm run test:scorm` passed: 15/15.
- `npm run build:studio` passed: 52 modules transformed.
- Live in-app browser comparison verified the Othello-derived layout on all five Macbeth surfaces; mobile checks found no horizontal overflow, console errors, or broken images.
- `git diff --check` passed.
- `npm run typecheck -- --pretty false` still exits 2 with the same 16 unrelated baseline diagnostics in legacy ELA/Cheerio, Forensics, and duplicate Social builders; no English factory file appears in the diagnostics.

## Fragile areas / watchouts

- All 28 locally stored plain-language Macbeth companion scenes remain `needs-editorial` and are not final modern-English editions.
- MIT Shakespeare is an external embedded dependency. myShakespeare must remain an external open action because it disallows ordinary framing outside its approved origins.
- The supplemental archive advertises novel, film, Macbeth module, and shorter-text files that are physically absent; do not claim they were imported.
- `Half-Hanged Mary` is complete but remains held for Crucible placement and rights review.
- Stable response and contribution IDs drive reload and SCORM persistence; do not rename them during editorial cleanup.
- `workspace/index.html` and `workspace/assets/generated/**` are factory-owned generated output.
- The repo contains extensive unrelated user changes; do not reset, clean, or broadly stage the worktree.

## Next prompt should assume

- Macbeth now uses the Othello interaction/format pattern for Materials, Act Questions, Character Notes, Writing Studio, and Resources.
- The Next Step export has been fully inventoried; it bolsters Macbeth but does not solve missing novel or film texts.
- The Character-Change Paragraph and Visual Motif Essay are durable profile/recipe decisions and survive rebuilds.
- Evidence Bank saves are deliberate: scene quotations save individually; acts, dossiers, and writing plans save as upserted collections.
- Other ELA 20-1 units were not visually revised during this pass.

## What still needs validation

- User visual/content acceptance of the five Macbeth surfaces.
- Editorial rewrite/review of all 28 plain-language companion scenes.
- Rights/accessibility decision for teacher files and `Half-Hanged Mary` before any later placement.
- Final Brightspace import and cross-session restore only after Macbeth is marked `ready-for-export` and packaged individually.

## Known risks

- Final SCORM export remains blocked by editorial and rights review, not by implementation or test failures.
- External play-access sites can change their embed/access policies; keep truthful fallback links.
- Repository-wide typecheck remains unclean outside this work.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`projects/ela20-1-shakespeare-macbeth/meta/prompt-pack.md`

## Do not do next / warnings

- Do not export Macbeth as final SCORM until every `needs-editorial` scene and rights/accessibility item is resolved.
- Do not import the supplemental summative assessments, grade-contaminated PDFs, exams, question bank, or missing manifest targets.
- Do not patch generated workspace or export bundles directly; change the recipe, profile, renderer, runtime, or preserved custom component source and rebuild.
