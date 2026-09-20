# Handoff

- Project: social30-1-related-issue-1-option-2
- Task: Match Biology Chapter 12 visuals and add lesson support, printed-page textbook reading, and shared Core Vocabulary notes.
- Status: released to the shared teacher-review site; LMS release remains separate.

## Files changed
- Canonical workspace/index.html, social-visual.css, social-lesson-tools.js; local font files/licenses and copied Chapter 10 PDF.
- meta/project.json, e2e-contract.json, lesson-support.json, visual-layer-handoff.md.
- scripts/tests/social30-issue1-lesson-tools.mjs; active/archived operational handoff.

## What changed
- Biology Work Sans/Hanken Grotesk fonts, charcoal shell, pale canvas, green/teal accents, content geometry and responsive drawer. Tool panels/forms/readers use the same visual system.
- Five sidebar groups: Overview; Lessons; Student Tools; Process Collection; Resources. Lesson links sit directly under Lessons in their existing order. The redundant Lesson pathway page and its nested Lessons link were removed; legacy #lessons bookmarks redirect to Lesson 1. Core Vocabulary remains the only new route.
- Overview introduction/outcomes/use guide/23-lesson roadmap/completion explanation. All 23 lessons receive goals, prerequisite guidance, actual-work guide, key terms and vocabulary help.
- 54 definitions sourced from existing glossaries and Study Guide. Optional four-field Frayer notes use new stable vocabulary response IDs within the existing response store. Page and popup loan/restore the same canonical controls; no copied answer fields or new completion gates.
- Textbook dialog accepts printed pages, maps to seven available PDF ranges, and handles unavailable pages without showing a wrong page. Original assigned reading remains required. Existing textbook Open links also use the dialog; downloads remain direct.
- Chapter 10 copied from Issue 3 without changing it. Lesson 19 pages 16–18 source label corrected from Chapter 1 to Introduction. Sources/mappings/correction recorded in lesson-support.json.
- Existing PDF/media iframes load lazily to avoid loading hidden viewers at startup. Mobile hidden sidebar is inert; dialog Escape/focus/scroll restoration retained.

- Browser-review refinements: added consistent inner padding to support panels, activity steps, templates, playlist groups and table cells. Film Room fills the available main workspace, with proportional 16:9 video and a stacked phone layout.
- Core Vocabulary now matches Biology’s page guide, word/meaning search, topic filter, matching count, grouped term index and selected-term reader. All 54 definitions and the actual optional Frayer controls remain canonical HTML with unchanged save IDs. Mobile term selection scrolls to the reader.

- Every lesson now has a textbook card: assigned readings retain their verified pages; the other 17 lessons offer optional textbook access through a blank printed-page chooser, without creating assignments. Focused first-lesson reader open/page jump/close and 23-card count checked.

- Latest width refinement: all learner page cards now fill the available workspace, rather than limiting expansion to Film Room. Collapsed sidebar navigation is fully hidden while its reopen toggle remains available. Inspected collapsed desktop screenshot; focused checks passed on eight page widths, navigation reopen, and 390px phone overflow/drawer visibility. No response controls or storage IDs changed.

- Textbook-card follow-up: replaced generic page choosers in the 17 unassigned lessons with verified, topic-matched optional printed-page ranges and direct reader links. Existing six assigned-reading lessons retain their required ranges. Supplementary page sources/rationales are recorded per lesson in lesson-support.json; case-study references are labeled background. Prior blank-chooser checks describe the superseded candidate.

- Added Textbook Practice immediately below Evidence Bank in Process Collection, using Biology Chapter 14 as a read-only structural reference. New canonical social-textbook-practice.js and 11 original PDF page captures plus question-area crops support 40 optional numbered questions from Chapters 1–4. Topic filters, question tiles, Previous/Next, enlargement, reader links, draft autosaving, Save question work and print-to-PDF are available. 80 new stable writing/saved-writing fields use the existing response store; lesson completion remains 23. Sources recorded in meta/textbook-practice-sources.json; new route added to inventory/E2E contract.
- Focused practice check passed: sidebar order, 40 independent owners, two response drafts, save/draft/reload, retained existing answer, topic filtering, enlargement/Escape/focus, printed-page reader, no JS errors and no phone horizontal overflow. Desktop/390px screenshots inspected. Broader E2E/Studio/SCORM/Brightspace and full print coverage remain deferred. Canonical next file remains workspace/index.html.

- Textbook Practice evidence integration: all 40 questions now expose Collect as evidence. Uses the existing manual Evidence Bank store with stable textbook-practice-<questionId> entries, source page/question, and explicit writing snapshots. Recollection updates one entry; practice edits do not silently alter collected evidence, and removing evidence preserves practice writing. No lesson completion/save IDs changed.
- Focused node scripts/tests/social30-issue1-textbook-evidence.mjs passed: empty-response guard, source reference, duplicate prevention/update, independent draft, reload retention, existing manual/lesson evidence preserved, and removal independence. JS syntax and diff whitespace checks passed; broader rollout checks remain deferred.

- Student Tools evidence integration: Issue Inquiry, Source Analysis, Position Builder, each Core Vocabulary term and each Film Room item now save explicit writing snapshots to the existing Evidence Bank. Source Analysis collection retains answers rather than clearing draft fields. Vocabulary collection works through the shared popup controls; Film Room adds 26 stable per-media notes fields. Re-save updates a stable student-tool-<toolKey> entry, preserving existing notes. New scoped canonical file: workspace/social-tools-evidence.js; metadata receipt in lesson-support.json.
- Focused node scripts/tests/social30-issue1-tools-evidence.mjs passed for all five tools: empty guards, source references, duplicate-free snapshots, original answers, popup collection, reload, existing evidence and phone overflow. Desktop Position Builder collection area inspected; syntax/diff checks passed. Broad E2E/Studio/SCORM/Brightspace remain deferred.

- Latest navigation request: Textbook Practice now sits last in Student Tools (after Film Room), with its page eyebrow and active-route sidebar group updated. Process Collection retains Evidence Bank. Existing practice route, questions, response IDs and evidence collection remain unchanged. Focused navigation placement/current-group inspection passed; no saved-state suite repeated for this presentation-only move.

- Deployment: added Social Issue 1 to the existing Biology/Chemistry review library, version 20260918-social1-2. All 1,651 existing science files retained; differing local Chapters 14–20 HTML was preserved in the checkout and replaced only in staging by hash-verified live bytes. Published hashes verified and live selector, Social saving/collection/reload, reader/vocabulary, Biology 11/14/20, Chemistry and phone overflow checks passed. Receipt: meta/teacher-review-deployment.json.
- Rollout test contract repair: added a native legacy-social evidence scenario rather than requiring an API this snapshot does not own. Corrected the stale harness error expectation and added the Evidence Bank scoped Print/PDF hook expected by its existing contract. Harness 8/8 and project E2E passed. Final selector mobile overflow fixed and its post-publish hash rechecked after brief CDN propagation.

## Why this changed
- Make Issue 1 a representative Social course using the requested Biology presentation and support features before wider propagation.

## Source of truth
- projects/social30-1-related-issue-1-option-2/workspace/index.html: visible guidance, definitions, real Frayer controls and existing lesson/answer owners.
- Same workspace/social-visual.css and social-lesson-tools.js: scoped presentation and behavior.
- meta/lesson-support.json: provenance and verified printed/PDF page mapping receipt; HTML remains the editable text owner.
- Existing legacy-snapshot-v1 ownership retained; historical Social builder remains quarantined.

## Verification run
- Sidebar refinement: focused local desktop/390px browser inspection confirmed the pathway page is absent, heading is Lessons, all 23 lesson links remain directly visible under it, links open the correct lessons, and legacy #lessons redirects to Lesson 1. Screenshots inspected; no JavaScript errors. Existing broad state suite was not repeated for this navigation presentation change.
- node scripts/tests/social30-issue1-lesson-tools.mjs http://127.0.0.1:8768: PASS.
- Checkpoint comparison: all 128 previous response IDs and 23 completion IDs retained; 216 new optional Frayer fields. All 54 term owners and all 23 support openings present.
- Real local browser checks: page/popup edits, close/return/reload, single field ownership, retained lesson/Study Guide answers, manual and lesson-derived Evidence Bank notes, and existing completion count.
- Seven textbook range starts/ends, repeated jumps, Chapter 10 page 351 -> physical 20, Introduction label correction, unavailable page 100, modal keyboard/focus, five sidebar groups and mobile drawer/dialog paths.
- Desktop and emulated 390px phone screenshots inspected for Overview, lesson opening, sidebar and both dialogs. Full Chromium rendered the actual embedded PDF on desktop/phone. Tool pages inspected; source analysis and Film Room phone layout inspected without page overflow.
- Native script syntax and scoped git diff --check passed. No JavaScript errors or missing local responses in the focused interaction check.

- Latest visual refinement: focused saved-work script passed with word/meaning search, topic filtering, empty results and page/popup/reload preservation. Inspected desktop and 390px phone vocabulary reader/popup, Film Room and Source Analysis; no horizontal page overflow. Rendered padding inspection across all 23 lessons found no remaining flush first-text boxes. Syntax and diff whitespace checks passed.

## Fragile areas / watchouts
- Preserve existing lesson/response/storage IDs, immutable original lesson content and Evidence Bank dismissal behavior. New Frayer IDs use <slug>:vocabulary:<term-id>:<field>.
- Vocabulary popup moves real controls; restore them before rendering their owner or opening another record. Definitions are copied for display from canonical HTML at popup opening.
- Printed pages are not PDF physical indexes; retain source-specific offsets. Pages 100–101 and other missing ranges are deliberately unavailable.
- Legacy inline CSS remains historical baseline; scoped final visual layer overrides it. Do not copy Biology's entire layered stylesheet or patch shared Biology code to change Social.

## Next prompt should assume
- Working branch codex/social-ela-updates. Restore tag checkpoint-before-social-ela-2026-09-18 remains at 280aaf12.
- Only Issue 1 was changed by this pass. Other concurrent Sports Wellness working changes were preserved.
- Local preview is served from the repository at http://127.0.0.1:8768/projects/social30-1-related-issue-1-option-2/workspace/index.html while the preview process is running. Direct file opening is also supported; server availability is session-local.
- Teacher-review deployment was authorized and completed on 2026-09-18. No commit, SCORM packaging or sibling-course propagation performed.

## What still needs validation
- Comprehensive responsive/accessibility regression; the required project E2E passed on 2026-09-18.
- Studio edit map, bounded Apply/reload/Undo lifecycle, and metadata/authoring certification.
- SCORM export/state-size capacity and actual Brightspace saving/resume/completion.
- Teacher acceptance of goals, guides and inherited vocabulary; actual physical devices and school external media/PDF-browser behavior.

## Known risks
- Saving retains the existing browser-local storage behavior; cross-device saving is unproved. New vocabulary responses increase future SCORM suspend-data demand.
- Native PDF embedding depends on browser support; an ordinary PDF link remains available. External media and Material Symbols font retain their existing network dependencies.

## Exact next action
- Review https://biology30pilot.web.app/#social30-1-issue1 and await the next requested change.

## Exact next file to open
`projects/social30-1-related-issue-1-option-2/workspace/index.html`

## Do not do next / warnings
- Do not run the quarantined Social builder over this canonical snapshot, replace stored IDs, or extend the pass to siblings/ELA without a scoped request. Rollout gates remain deferred, not passed.

## SCORM integration before packaging — 2026-09-18
- Summary: explicit SCORM 2004 hash-page tracking contract uses existing required lesson IDs and completion store. The shared exporter supplies LMS save status, Save now/Save and Exit, answer/evidence restoration, resume, progress/completion and active session/page timing. Optional tools/practice do not add requirements or scores.
- Files changed: workspace/scorm-tracking.json and meta/project.json; shared focused test scripts/tests/social-option2-scorm.mts. No workspace bridge duplication or Social-builder run.
- Verification: course:doctor passed for all 12 projects; `node_modules/.bin/tsx scripts/tests/social-option2-scorm.mts` passed all 12 real canonical pages against the current shared exporter bridge. Clean browser contexts restored existing Study Guide answers/manual evidence, new Position Builder answers/collected evidence/Frayer notes, bookmarks and cumulative time. Exact required IDs drive partial/full completion. Representative overflow and failed-commit/retry checks passed. Simulated LMS only; no upload ZIPs created.
- Risks/follow-up: verify generated ZIP assets/manifest, accumulated learner E2E/Studio checks and a real Brightspace attempt before claiming LMS readiness. The current legacy localStorage transport retains the shared 60,000-character save guard; overflow preserves the prior LMS save and reports a retryable error. Some Social 30 workspace snapshots retain an older bridge; export replaces it with the current shared implementation. Hosted/local course previews are not LMS certification.
- Source of truth: workspace/index.html retains lessons and real form controls; workspace/scorm-tracking.json owns the export tracking contract; scripts/lib/exports/scorm-package.ts owns generated bridge injection and packaging.
- Fragile areas: retain route/response/completion/storage IDs and the three original stores. Never count optional tool work, visits or evidence collection as lesson completion; do not invent written-work grades. Keep legacy builders quarantined.
- Next prompt assumptions: integration request does not authorize packaging/upload/deployment; no commit/push performed.
- Exact next action: when packaging is requested, freeze the candidate, run the accumulated rollout batch and export SCORM 2004 with the owning exporter; validate the actual ZIP and then pilot in Brightspace.
- Exact next file: workspace/scorm-tracking.json.

## Detailed time/action reporting — 2026-09-18
Opted this Social course into shared SCORM 2004 ungraded interaction summaries. Native rows carry counts/first/latest timestamps for page access, answer-edit bursts, changed lesson completion, actual evidence collection/removal, vocabulary/textbook/practice use, topic/source filters, guide openings, media selection/native player events and resource access. Page-time summaries carry active, foreground-visible and idle seconds. Hidden/sleep gaps are excluded; foreground time continues during quiet reading after the active idle cutoff. Answer text/search queries are not copied into analytics. No score or completion requirements changed. Counts hydrate from native LMS interactions, keeping action histories out of suspend data.

Shared owners changed: scripts/lib/scorm-actions.ts, scorm-tracking.ts and scorm.ts; contract/unit coverage, focused Social integration harness and README/architecture/contributing/SCORM workflow docs updated. All 12 focused real-page simulated-LMS checks and course doctors passed; shared unit tests 30 passed; shared browser tests 18 passed/1 skipped (excluded remote Biology photo pilot). Rejected interaction-write retry, cumulative stable edit rows, no answer text in reports, actual collection/completion/access events, foreground/active/hidden time and prior save protections verified. No Social upload ZIPs/deployment/commit/push performed. Actual Brightspace interaction/report visibility still needs a pilot; external iframe access does not prove viewing. Exact next file: workspace/scorm-tracking.json. Exact next action: freeze and run remaining candidate rollout gates when packaging is requested, then export/inspect actual SCORM 2004 ZIPs and pilot Brightspace reports.


## SCORM download packaging — 2026-09-18
Production SCORM 2004 export and project E2E contract passed. Upload ZIP: `projects/social30-1-related-issue-1-option-2/exports/social30-1-related-issue-1-option-2-scorm-2004.zip`. Combined receipt: `projects/social30-1-related-issue-1-option-2/meta/option-two-scorm-release.json`. Outer download must be extracted; upload each inner ZIP individually. Final CRC, manifest, local-resource and analytics verification recorded in the receipt. Non-ASCII ZIP filename flags normalized after macOS packaging; verify again on subsequent exports. Actual Brightspace pilot and comprehensive Studio lifecycle remain deferred. Resource notes identify inherited missing materials; obtain teacher resources for dependent activities. No upload or deployment occurred.


### Replacement v2 — Brightspace reporting rejection
Optional action-report failure no longer blocks saved work or Save and Exit after successful required-state commit. Pending reports retry while the session remains open; exact rejected field/LMS diagnostic is logged. Required write and commit failures remain blocking. Replacement export and ZIP integrity/manifest/resource/bridge checks passed. Use the v2 combined download in option-two-scorm-release.json; earlier bundle is superseded. Focused rejected-report save/reopen/exit and shared unit checks passed. Actual Brightspace reporting availability remains unverified.


### Accepted family automatic-save rollout — 2026-09-18
Teacher confirmed Social 20 Issue 1 works and requested all 12 Option Two Social packages. This canonical body now opts into automatic saves with hidden success status and no manual Save and Exit; required save errors retain visible retry. Whole-second native SCORM interaction timestamps included. Real-course focused automatic/save/reopen/failure recovery checks passed for all 12. Production package and final archive checks recorded in projects/social30-1-related-issue-1-option-2/meta/option-two-scorm-release.json. Use the v5 family download; older packages superseded. Upload individual inner ZIPs; no agent LMS upload, deployment or commit performed. Actual sibling LMS reports and comprehensive Studio checks remain deferred.
