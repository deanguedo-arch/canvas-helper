# Active handoff — Biology 30 Pilot 3 Chapter 11

- Project: biology30-unit-a-pilot-3
- Task: verify every Chapter 11 textbook-page destination and keep learners in the unit with an in-course page reader.
- Status: Build-mode changes complete; comprehensive Studio Edit verification is deferred and must not be claimed as passed.
- Repository cadence: Build mode is now the default for every new Canvas Helper chat and artifact. Comprehensive tests are deferred until an explicit testing, packaging, deployment, or rollout request.

## Summary

All 106 textbook links were checked across 20 distinct PDF destinations. They correctly use the fixed Chapter 11 mapping `PDF page = printed textbook page - 359`. Lesson and question links now open the requested page in a compact, closable modal without changing the current unit route. Close/Escape restores focus, and learners can open that exact page in a new window. A cache-distinct iframe URL prevents Chrome from reusing the Textbook Library viewer's stale page position. Existing video, activity and saved-answer IDs, state namespaces and Process Collection behaviour are unchanged.

## Files changed

- `projects/biology30-unit-a-pilot-3/workspace/index.html`
- `projects/biology30-unit-a-pilot-3/workspace/styles.css`
- `projects/biology30-unit-a-pilot-3/workspace/assets/pilot3-runtime.js`
- `scripts/lib/biology30-pilot3/pilot3.css`
- `scripts/lib/biology30-pilot3/runtime.ts`
- `scripts/test-biology30-pilot3.ts`
- `projects/biology30-unit-a-pilot-3/meta/project.json`
- `projects/biology30-unit-a-pilot-3/meta/verification.json`
- `projects/biology30-unit-a-pilot-3/meta/readiness-boundary.json`
- `projects/biology30-unit-a-pilot-3/meta/review-handoff.md`

## Verification run

- `npx tsx scripts/test-biology30-pilot3.ts`: passed against HTML SHA-256 `5c3eb0acbd4a2e721168f16311da42e6eb7f27a947cc02174573ae171aac3b2e` and runtime SHA-256 `a82619606e366438cc5cc0b93ca551b25e698cd56b9a9ac08af1134aeb5c8236`; all 106 textbook destinations, route preservation, reader controls/focus, videos, responsive layouts and saved-work regressions passed.
- `npm run test:e2e:project -- --project biology30-unit-a-pilot-3`: 1/1 passed.
- `npm run course:doctor -- --project biology30-unit-a-pilot-3`: passed.
- `npm run test:new-course-readiness`: 10/10 passed in the full checkout.
- Visual check: opening textbook p. 380 from Lesson 6 displayed PDF page 21 and the correct printed-page content inside the modal; the initial Chrome stale-page reuse was caught and corrected before completion.
- Exact-head `verify:new-course-readiness`: passed in isolated snapshot `/tmp/biology30-pilot3-validation.VzOFlG` at `1671cf85d69fa759dd6703c3d01f6d255378ae67`; 179/179 learner surfaces complete, 5054 editable targets, reversible apply/reload/Undo passed.

## Source of truth

Canonical learner content is `projects/biology30-unit-a-pilot-3/workspace/index.html`; canonical presentation is `projects/biology30-unit-a-pilot-3/workspace/styles.css` with the scoped source addition in `scripts/lib/biology30-pilot3/pilot3.css`. Runtime source remains `scripts/lib/biology30-pilot3/runtime.ts`. Do not regenerate the HTML through the retired initializer or import scripts.

## Fragile areas / watchouts

Preserve every existing activity, response, vocabulary and storage ID. Keep the declared `native-details-open` learner states for lessons 1–14; removing one makes Studio readiness incomplete. The two previously flagged source videos remain unavailable/restricted, with local explanations retained.

## Next prompt should assume

Chapter 11 content, the requested Pilot 2 presentation transfer, automatic video display and in-course textbook reader are complete. Pilot 2 A and B/C/D remain unchanged. A review-only SCORM snapshot and ChatGPT context ZIP now exist; the consolidated checkpoint is committed and pushed on `main` at `32dc578f`. No deployment, Chapters 12–13 course change, older-course change or LMS certification occurred.

## What still needs validation

No required local validation remains for the current Build-mode changes or the review package. Full learner regression, comprehensive responsive coverage, Studio editability, SCORM behavior testing and target-LMS certification remain deferred until rollout.

## Known risks

Learner activity history and Frayers remain browser-local. External video availability can drift.

## Exact next action

Await the next requested change. Do not rerun the passing Biology checks unless a future rollout candidate invalidates their evidence.

## Exact next file to open

`projects/biology30-unit-a-pilot-3/workspace/index.html` at the Practice & Review sidebar links and `#practice`

## Do not do next / warnings

- Do not rerun broad passing suites without a new relevant change.
- Do not deploy, create another export/ZIP, commit, regenerate, or expand beyond Chapter 11 unless requested.

## Repository workflow update

- Updated `AGENTS.md`, `CONTRIBUTING.md`, `docs/ops/FAST_PATHS.md`, `docs/ops/HANDOFF.md`, and `docs/workflows/codex-studio-course.md` to separate Build mode from the Rollout checkpoint.
- No Biology, E2E, Studio, readiness, SCORM, build, export, deployment, or other test command was run for the documentation-only policy change.
- Rollout checks remain deferred until explicitly requested; existing push/PR CI is unchanged.

## Current Build-mode change

- Pilot 3 sidebar now keeps its header, collapse control, and Save and Exit action visible while only the navigation list scrolls.
- The Chapter 11 overview now teaches the nervous-system purpose in student-facing language and presents five “I can” outcomes; Pilot/source/administrative wording was removed from that overview.
- The Lesson 8 Peripheral control chapter check is now collapsed behind a native “Open chapter check” control. Its `check-pns` activity identity, questions, response IDs, timer and history contract are unchanged.
- The Memorization practice labeling activity now presents the supplied full A–J diagram followed by compact dropdowns for all ten letters. The original `labeling` activity ID and answer IDs A/B/C/D/J remain unchanged; new stable IDs E/F/G/H/I use the same save-state contract.
- Practice & Review now lists Flash cards, Fill in the blanks and Labeling as three separate sidebar destinations. Their existing activity IDs, response IDs, timers, attempts and stored work are unchanged; only their course-page wrappers and routes were separated.
- Prepared `projects/biology30-unit-a-pilot-3/meta/biology30-neural-pathway-chatgpt-pro.zip` for external ChatGPT Pro design. Its returned activity has now been integrated as recorded below; the original design-request ZIP remains as provenance.
- Canonical presentation change: `projects/biology30-unit-a-pilot-3/workspace/styles.css`; synchronized scoped source: `scripts/lib/biology30-pilot3/pilot3.css`.
- Full-course, responsive, E2E, Studio, readiness, and SCORM checks are deferred until rollout.

## ChatGPT course-context package

- Exported a review-only SCORM 2004 snapshot to `projects/biology30-unit-a-pilot-3/exports/biology30-unit-a-pilot-3-scorm-2004.zip` using the standard exporter. It contains the SCORM manifest, launch page, course presentation/runtime, local resources and SCORM bridge.
- The exporter reports save status, active-session timing, resume and page timing as connected. Automatic completion and progress measurement are not connected, and target-LMS behavior has not been certified.
- Created `projects/biology30-unit-a-pilot-3/meta/biology30-pilot3-chatgpt-course-context.zip` for upload to ChatGPT Pro. It contains the SCORM snapshot, five freshly captured current-course screenshots, a course-structure guide, a ready prompt, and the nested neural-pathway design brief.
- Recreated `projects/biology30-unit-a-pilot-3/meta/biology30-neural-pathway-chatgpt-pro.zip` from its existing source handoff folder because the handoff referenced the ZIP but it was absent on disk.
- Both the outer context ZIP and nested SCORM ZIP passed archive-integrity checks. Required SCORM files `index.html`, `styles.css`, `imsmanifest.xml`, `scorm-bridge.js`, and `assets/pilot3-runtime.js` are present.
- No learner E2E, broad responsive, Studio, readiness or LMS test suite was run for this review package.

## Neural-pathway activity integration

- Integrated the returned `biology30-neural-pathway-activity.zip` into the existing Memorization practice activity. The active source image is `projects/biology30-unit-a-pilot-3/workspace/assets/source/neural-pathway-labeling.png`; the untouched returned ZIP is retained at `projects/biology30-unit-a-pilot-3/meta/injected-components/biology30-neural-pathway-activity.zip`.
- The activity now uses the supplied 1448 × 1086 A–J pathway illustration. Ten compact dropdowns sit below the full image in two columns on wider canvases and one column on phones, so the controls do not cover the structures. The old image pop-out link remains removed.
- Existing activity ID `labeling` and answer IDs `label-A`, `label-B`, `label-C`, `label-D`, `label-J` remain unchanged. Stable IDs `label-E` through `label-I` were added for cell body, dendrites, node of Ranvier, myelin sheath and axon. Timer, attempts, redo history, saved drafts and Process Collection behavior are preserved.
- Added `Check all labels` through the owning runtime. It records every currently selected label as an ordinary attempt and reports the latest correct count without revealing incorrect answers.
- A focused activity-only browser check passed all ten selections, 10/10 check-all feedback, correct A–J per-label results, reload restoration, and horizontal-overflow checks at 1440 px and 390 px. A simulated five-label in-progress save also accepted and graded new label E. Both views were visually inspected in `projects/biology30-unit-a-pilot-3/meta/integration-preview/neural-labeling-a-j-*.png`.
- The runtime bundle was rebuilt from `scripts/lib/biology30-pilot3/runtime.ts`. No full-course E2E, exhaustive responsive, Studio/readiness, SCORM or LMS test suite was run; those checks remain deferred until rollout.
- The earlier review-only SCORM and ChatGPT context ZIP predate this integration. They were not regenerated; refresh them only when requested or at rollout.
