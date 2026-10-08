# Handoff

- Project: Biology 30 Chapters 11–12; remaining-chapter planning.
- Task: Integrate reviewed teaching into canonical sources and finish the supported local validation batch, without SCORM packages.
- Status: integrated locally; focused validation passed with explicit remaining limits. No deployment or LMS certification.

## Files changed

- Both chapters' workspace/index.html and workspace/assets/teaching-v101/: exact reviewed teaching and assets.
- Both meta/project.json: injected teaching provenance; CH12 extension helper declared canonical; scoped portable regeneration command.
- CH12 workspace/Biology30_Chapter12.html: 43,001,663-byte standalone derived snapshot with 110 embedded assets.
- scripts/integrate-biology30-ch11-ch12-teaching.mjs, snapshot-biology30-chapter12-portable.mjs, serve-biology30-integrated-teaching.mjs.
- CH11 meta/e2e-contract.json: remove nonexistent sidebar route for preserved legacy foundation check; add actual textbook-practice route.
- CH12 meta/e2e-contract.json: native routes, mobile coverage and optional-note persistence scenario.
- e2e/lib/learner-course-assertions.ts: support native hash navigation links and native optional-note controls.
- e2e/lib/project-contract-schema.ts and scripts/tests/e2e-contract-harness.test.ts: strictly validated native-note scenario, required identity/collection route and duplicate rejection.
- scripts/verify-english-course.ts: narrow its Evidence Bank checks to English-supported scenario kinds after the shared union gained native-note. No English course content changed.
- This root: CANONICAL_INTEGRATION.json, canonical-before metadata backups, CHAPTER_INVENTORY.json, REMAINING_CHAPTER_PLAN.md and this handoff.

## What changed / why

Canonical CH11 and CH12 now use the exact review candidate bytes. Fonts, CSS, existing runtimes, native questions/keys, activity IDs, saved-state owners, progress semantics and original figures remain unchanged. The legacy foundation check is preserved in HTML; only the invalid requirement that it appear in the sidebar was removed from the test inventory. Textbook Practice uses a native hash link, now supported by the test helper without modifying learner HTML.

## Source of truth

CH11: projects/biology30-unit-a-pilot-3/workspace/index.html; runtime owner scripts/lib/biology30-pilot3/runtime.ts. HTML SHA256 7500d72fe3f340ffb3de15248c09816ea542a50d791c0bf25b5d7e50464b3084.

CH12: projects/biology30-chapter-12/workspace/index.html, styles.css, main.js and assets/teaching-v101/extension-model-lock.js. HTML SHA256 7c762bb9f006fa8f156ce60c6a058349264f945b537200d5cab64c69b3e34920.

Immutable returned source and frozen old/new comparison remain under this root. EDITOR_RECONCILIATION.json accounts for all 529 affected original keys: 185 retained and 344 superseded, zero unclassified. Whole-interval successors are not semantic one-to-one redirects. No old editor override or learner answer migration occurred.

## Verification run

- Independent editor reconciliation and static identity/media preservation verifier passed before integration.
- Both canonical workspace verification commands passed after integration: metadata/local assets/embeds/resources clear.
- CH11 course doctor passed. Scoped verify:course-onboarding passed: 5805 mapped editable targets; native apply/reload/Undo restored bytes. Map is truncated, not exhaustive editor-target acceptance.
- CH11 test:e2e:project passed: desktop routes, native local-run evidence scenario, 390x844 mobile routes, image/overflow/error checks covered by its contract.
- CH12 test:e2e:project passed: desktop/native navigation, new optional-note save/reload/All My Work and 390x844 mobile routes. This is learner preview testing, not Studio editing certification.
- test:e2e:harness: all nine unit tests passed, including native-note schema validation and invalid-route/duplicate/missing-ID rejection.
- Combined E2E harness and English verifier tests: 26 passed. Repository typecheck remains failing on out-of-scope builder/test errors; final output has no errors in the changed E2E helpers/schema or English verifier. This is not a clean repository-wide typecheck.
- Real browser CH12 canonical QA origin 57313: lesson06 response saved, survived reload, appeared in All My Work, required progress stayed 0/9; no captured runtime errors.
- New scripts syntax checks passed; final canonical hashes match reviewed candidates. Scoped diff whitespace checks passed. Broad checkout whitespace output included unrelated existing Science24 changes; those were not edited.
- Portable snapshot preserves canonical source, embeds local CSS/script/image dependencies and leaves non-executable native data intact. Actual file-URL runtime testing was blocked by browser URL policy; not passed.

## Fragile areas / watchouts

CH12 remains blocked/proposal-only-v1 with Studio editing disabled. CH11 remains active/direct-workspace-v1; no new lifecycle promotion or exact-head release-readiness claim. Do not rerun old refresh-biology30-chapter-portable.mjs: it rewrites both 12 and 13 canonical sources. Use the declared new CH12 snapshot-only command for its derived copy.

Do not rerun the frozen comparison builder against the newly integrated canonical source: its original-source hash guard will reject it. Preserve frozen original assets while comparisons use baseline symlinks. Preserve native storage namespaces and immutable attempt history; same IDs and unchanged owners do not prove every old import/conflict path.

## What still needs validation / known risks

Actual print/PDF layout and photo readability remain open: the IAB print click showed no destination dialog. No actual PDF file was produced. Offline standalone file launch is also unverified because file URLs are blocked by browser policy. Legacy-save import, quota/conflict/failure recovery, comprehensive keyboard/accessibility, real-device media/reader rendering and Brightspace resume/completion remain open. No SCORM packages, deployment, commit or push were performed. APFS free space is low; avoid copying whole asset trees.

## Routes actually used

Deterministic integration/snapshot/inventory and existing test commands; lead retained dirty-boundary, state/editor compatibility and source decisions. No new worker was launched. Local source/reference reuse is separate from provider caching; no provider-cache telemetry or measured savings, so savings unknown.

## Next prompt should assume

Dean authorized local integration and continuation planning, not blanket acceptance of every unseen lesson or release. Current complete CH11/12 teaching is canonical. Remaining chapter authoring follows REMAINING_CHAPTER_PLAN.md. CH17 existing status records signed-off 01–07 and pending 08–15/extension; do not regenerate or auto-integrate it.

## Exact next action

Prepare the Chapter13 lesson01–03 hash-bound source/teaching map and chapter progression from the teacher PowerPoint and textbook, before external authoring or course edits. Outstanding local output/failure checks remain explicitly tracked, not replaced by SCORM packaging.

## Exact next file to open

/Users/deanguedo/Documents/GitHub/canvas-helper/projects/biology30-chapter-13/meta/prompt-pack.md

## Preview links / do not do next

Integrated CH11: http://127.0.0.1:57310/index.html#lesson-01 . Integrated CH12: http://127.0.0.1:57312/index.html#lesson-06 . Disposable QA origins 57311/57313. Existing old/new comparisons remain at 57300. Server owner: scripts/serve-biology30-integrated-teaching.mjs, running exec session 51017.

Do not package, deploy, silently change assessment keys, replay old editor patches or promote blocked courses. Preserve other ongoing work; prior Credit Gauntlet handoff must be archived intact when this becomes the active handoff.
