# Handoff

- Project: `chemistry30-unit-a-pilot`
- Task: create a local Chemistry 30 Unit A pilot from the completed Guided Edition and align its presentation and learner guidance with Biology 30 Pilot 3.
- Status: deployed for teacher review; the selector now version-busts embedded course frames so Chemistry loads the matching HTML/runtime, and the live Biology/Chemistry selector paths render successfully.

## Current follow-up: Biology 30 Pilot 3 practice startup

- Status: deployed for teacher review at `https://biology30pilot.web.app/?v=20260916-1`; live Biology and Chemistry selector paths were checked after deployment.
- Cause: two `lesson-14` concepts are retained in the practice bank solely for legacy saved-session restoration, but the validator treated them as unknown learner lessons and blocked every generated practice mode at start.
- Fix: `scripts/lib/biology30-pilot3/practice-engine.ts` now permits only that explicit legacy restoration ID while keeping lesson 14 hidden from new practice selections; the generated `pilot3-runtime.js` bundle was rebuilt.
- Verification: generated-practice tests passed 4/4; focused Chromium practice/reset tests passed 2/2; Biology and Chemistry workspace verification passed; live Biology multiple-choice started a saved 10-item set; live Chemistry populated after selector switching; targeted `git diff --check` passed.
- Reset boundary: Pilot 3 exposes `Stop and reset` for unfinished practice only. Completed practice history, lesson responses, and vocabulary Frayers remain in browser storage by design; deployment does not clear them.

## Files changed

## Biology 30 practice reset follow-up — 2026-09-16

- Local fix complete; not deployed. Both reset paths now use an on-page confirmation instead of native `window.confirm`, which can be suppressed in embedded previews and silently cancel reset.
- Reset unfinished practice clears only the current unfinished run; Keep working preserves it. Completed history and activity/answer/storage IDs are unchanged.
- Follow-up presentation fix: the activity bar wraps, the confirmation occupies its own full-width row, and its buttons use a wrapping action group with a 12px gap. Runtime bundle rebuilt and targeted diff check passed; reset-state regression was not repeated for this presentation-only edit.
- Changed: runtime source `scripts/lib/biology30-pilot3/runtime.ts`, rebuilt `projects/biology30-unit-a-pilot-3/workspace/assets/pilot3-runtime.js`, both Pilot 3 stylesheets, and `scripts/tests/biology30-pilot3-reset-browser.test.ts`.
- Focused browser test passed with native confirmation suppressed: all four generated modes and Labeling, cancellation, confirmed reset, reload, completed-history preservation and unchanged progress. Broader E2E, Studio, packaging and LMS checks remain deferred.
- Next action: refresh the local Biology preview and review the confirmation; deploy only on explicit request. Next file: `scripts/lib/biology30-pilot3/runtime.ts`.

### Chemistry files

- `projects/chemistry30-unit-a-pilot/workspace/index.html`
- `projects/chemistry30-unit-a-pilot/workspace/styles.css`
- `projects/chemistry30-unit-a-pilot/workspace/main.js`
- `projects/chemistry30-unit-a-pilot/workspace/assets/fonts/**`
- `projects/chemistry30-unit-a-pilot/meta/project.json`
- `projects/chemistry30-unit-a-pilot/meta/pilot-integration.json`
- Import-generated metadata under `projects/chemistry30-unit-a-pilot/meta/**`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Imported the user-supplied ChatGPT Guided Teaching Edition into a new blocked pilot while preserving the original HTML byte-for-byte under `raw/original.html`.
- Added Hanken Grotesk and Work Sans from the local Biology Pilot 3 font assets and aligned lesson headers, goal strips, spacing, guide panels, review orientation, and embedded-activity directions with the established learner presentation.
- Refined the shared course shell after visual review: the sidebar now follows Biology Pilot 3's course-name hierarchy, section rhythm, active marker, bottom Save and Exit placement, and narrow collapsed rail; the top bar now carries the live course-progress block.
- Rebuilt the sidebar navigation hierarchy to match Biology Pilot 3 more closely: Start and Learn are the primary learner sections; Chapters 9, 10, and 11 are collapsible subsections inside Learn; Practice & Review, Tools, Process Collection, and Resources retain the same Biology-sized headings, lesson typography, spacing, and active border treatment.
- Rebuilt the lesson surface as the same bordered white card pattern used by Biology Pilot 3. The learning-goal strip fills the card edge-to-edge without grey gutters, and closing the sidebar expands the complete card and all lesson sections from 1120px to 1380px at the reviewed desktop width.
- Added 31 collapsed guides: 20 lesson-specific “How to complete this lesson” disclosures, four review guides, and seven guides for Practice Lab, Textbook Practice, Process Collection, Core Vocabulary, Equation Studio, Resources, and Video Library.
- Rebuilt Core Vocabulary with Biology Pilot 3's category index and split reader. All 74 Chemistry terms retain their original meanings and common-confusion notes, and their existing four Frayer fields remain the sole saved-response owner.
- Added an explicit Frayer save control. A learner completes all four Frayer sections and saves them together as one Vocabulary Frayers entry; existing drafts remain available and are consolidated without changing the four underlying field IDs.
- Wired vocabulary terms throughout lesson teaching text. Each underlined term opens a right-side mini vocabulary drawer with Meaning, What it does, Common confusion, related ideas, and the same saved Frayer fields used on Core Vocabulary.
- Added a persistent Reference sheet control beside the top bar. Its panel is non-modal, can remain open while a learner navigates or works, can be dragged by its heading, resized from its lower corner, and returned to its default position.
- Reorganized the support navigation into collapsible Practice & Review, Tools, Process Collection, and Resources sections. Video Lessons now sits with Practice & Review; Practice Lab, Core Vocabulary, and Equation Studio sit together under Tools; All My Work sits under Process Collection.
- Removed the selected administrative/source-provenance copy from Video Lessons while retaining every video card and playback control. The three playlist cards now use direct learner wording.
- Replaced Textbooks & Sources with a Biology-style Textbook Library under Resources. It provides Chapter 9, 10, and 11 selectors, printed-page controls, and an embedded PDF reader without leaving the course.
- Converted the 24 lesson/review textbook bands into 27 printed-page entry points. Each opens an in-course textbook modal at the mapped PDF page; lessons citing separated ranges expose one control for each range. Textbook Practice uses the same viewer.
- Reorganized All My Work into collection types: Vocabulary Frayers, Written responses, Equation and textbook work, Energy diagrams, Models and simulations, Checked practice, and Interactive activities. Related fields from one Frayer, lesson, textbook question, model, or diagram now render as one entry with their data together.
- Simplified the Process Collection action area to one learner-facing **Download your process report** button. Its guide and helper copy now describe the readable HTML report; the page-specific backup and restore controls were removed.
- Kept the overview’s existing learner directions visible and restyled them instead of adding a duplicate guide.
- Updated visible course identity to Chemistry 30 Unit A Pilot while preserving the runtime course/state identity required by the existing save contract.
- Recorded source/reference hashes, preservation evidence, focused browser results, and the release boundary in `meta/pilot-integration.json`.

## Why this changed

- Learners needed the completed Chemistry course presented with the same clear rhythm and page-level completion guidance as Biology 30 Pilot 3 without rebuilding or altering the course’s instructional and assessment systems.

## Verification run

- `node --check projects/chemistry30-unit-a-pilot/workspace/main.js` passed.
- Firebase Hosting deploy to `biology30pilot` completed successfully after adding the selector frame cache key `20260915-3`.
- Live Chromium verification passed for `https://biology30pilot.web.app/?v=20260915-3#chemistry30-a-pilot` and the original `?v=20260915-2#chemistry30-a-pilot` link; the embedded Chemistry overview populated instead of remaining blank. Biology Pilot 3 also rendered after switching in the selector.
- `git diff --check -- projects/chemistry30-unit-a-pilot` passed before the final metadata/handoff write.
- Static source comparison passed for preserved instructional and assessment content after accounting for the added guide markup, overview style hook, requested sidebar regrouping, and teacher-requested removal of two Video Lessons administrative blocks plus three playlist wording revisions. Vocabulary, textbook-question, check, label, and milestone data are unchanged, and every original route ID remains present exactly once.
- Inventory confirmed 32 routes, 24 milestones, 123 textbook entries, 74 vocabulary terms, 19 unit-check definitions, 11 lesson/review activity placements, one Practice Lab frame, and 24 unchanged completion requirements/controls.
- Focused Chromium check confirmed all 31 guide routes have one closed-by-default guide, Enter opens a focused guide, a Chapter 9 required-check response survives reload, and the 390px Practice Lab has no horizontal page overflow or console errors.
- Focused shell check at 1667px confirmed the top progress block and menu control are visible and clickable, the expanded frame/goal strip measure 1120px/1118px, and sidebar collapse produces a 78px rail with a 1380px/1378px frame/goal strip. Both states have zero horizontal overflow.
- Focused mobile check at 390px confirmed a single-column goal strip, zero horizontal overflow, and a working 310px navigation drawer. The compact mobile header intentionally omits the progress block to preserve usable space.
- Focused vocabulary check confirmed all 74 preserved terms appear in the category index. A Chapter 9 lesson produced 29 contextual term links; selecting `system` opened the correct drawer, and a Frayer response entered there appeared on Core Vocabulary and survived reload.
- Isolated Frayer save check confirmed all four fields save through one button and appear as one dated Vocabulary Frayers entry. A two-field investigation response and a textbook response each rendered as one entry under their correct collection type.
- Existing-state collection check confirmed a prior four-field vocabulary draft and four supplied profile values now render as two consolidated entries instead of eight individual rows; no stored values or IDs changed.
- Focused Process Collection check confirmed the action area renders exactly one **Download your process report** button and no page-specific Download backup or Restore backup controls.
- Focused reference check confirmed the panel opens non-modally at 620×760px, moves by its heading, reports `resize: both`, and stays open when navigating to another lesson.
- At 390px, Core Vocabulary becomes one column, the vocabulary drawer fills the viewport, the Reference sheet control remains visible, and horizontal overflow remains zero.
- Focused sidebar check confirmed all 32 route IDs remain unique, Practice & Review opens automatically on Textbook Practice, and the other support sections remain collapsed until selected.
- Refreshed sidebar inspection confirmed six Biology-style top-level sections, three nested collapsible chapter groups, and the active Chapter 9 lesson under the expanded Learn group. The reviewed browser's Process Collection showed four supplied reaction-profile starting values, zero completed practice attempts, and zero of 24 finished lessons.
- Focused Video Lessons source check confirmed the selected “Internet and access” and “The original video collections” blocks and their export/source wording are absent; all existing video load controls remain in the course runtime.
- Focused textbook check confirmed Chapter 9 p. 334 opens at PDF page 3, Chapter 9’s separated pp. 336 and 351 references have separate buttons, the Chapter 11 bonds lesson exposes pp. 342 and 408 separately, and Textbook Practice opens its selected question in the same modal.
- Textbook modal verification confirmed modal state, close-button/Escape behavior, focus return, no new-tab navigation, no browser errors, and a full-viewport 390×844 mobile presentation with zero horizontal page overflow.
- Screenshots inspected at 1440px for Chapter 9, 1667px for the reviewed shell states, and 390px for Practice Lab and the shell.
- No full E2E, Studio lifecycle, packaging, deployment, or Brightspace verification was run in Build mode.

## Source of truth

- Preserved imported baseline: `projects/chemistry30-unit-a-pilot/raw/original.html`.
- Canonical learner review sources: `projects/chemistry30-unit-a-pilot/workspace/index.html`, `workspace/styles.css`, and `workspace/main.js`.
- Integration and verification evidence: `projects/chemistry30-unit-a-pilot/meta/pilot-integration.json`.

## Fragile areas / watchouts

- `workspace/main.js` contains the imported self-contained course data and runtime. Preserve all route IDs, question/activity identifiers, `data-save`, `data-check`, `data-require`, `data-complete`, iframe placement/query values, state schema, and `chem30-unit-a-v2` identity.
- Add future page guidance by exact route in `window.COURSE_PAGES`; do not reconstruct the course or replace the Chemistry runtime with Biology code.
- Do not rerun import with `--force` over this pilot. The raw source and current canonical workspace now have distinct roles.

## Next prompt should assume

- The usable local Chemistry 30 Unit A pilot exists in the current dirty `main` checkout and Biology Pilot 3 remains unchanged.
- The new preview pathname creates a separate browser-local work record; the existing backup/restore controls remain the transfer mechanism.
- Teacher guides and the interactive SCORM ZIP are reference-only provenance and were not treated as current verification.
- Studio editing, export, deployment, and LMS readiness remain disabled or unclaimed.

## What still needs validation

- At rollout: project E2E coverage, the remaining 320/375/768 responsive widths, Studio Edit-map and reversible lifecycle, export integrity, SCORM checks, and actual Brightspace save/reopen/reporting.

## Known risks

- The canonical `main.js` is large because the source embeds PDFs and activity code. Future broad serialization could create unnecessary drift.
- Browser-local save/reload passed at the new pathname, but this is not proof of cross-device saving or Brightspace persistence.

## Exact next action

- Await teacher review of the deployed Chemistry 30 Unit A pilot and Biology 30 Pilot 3 selector.

## Exact next file to open

`projects/chemistry30-unit-a-pilot/meta/pilot-integration.json`

## Do not do next / warnings

- Do not commit, export, upload to Brightspace, enable Studio Edit, or change release flags without a separate request. Future deployment remains explicit and should preserve the selector frame cache-busting pattern.
- Do not modify Biology 30 Pilot 3 while reviewing Chemistry.
