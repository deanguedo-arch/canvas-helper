# Pilot 3 — Chapter 11 handoff

## Practice reset confirmation repair — 2026-09-16

Stop and reset now uses an on-page confirmation rather than native `window.confirm`. Embedded previews can suppress the native prompt, causing the prior handler to return without resetting. Students explicitly choose Reset unfinished practice or Keep working. Both generated and fixed/Labeling reset paths use this confirmation. Confirmed reset removes only the current unfinished run and drafts; completed All My Work history and all activity/answer/storage IDs remain unchanged.

Canonical runtime source: `scripts/lib/biology30-pilot3/runtime.ts`; its browser bundle was rebuilt and both Pilot 3 stylesheets synchronized. The focused `scripts/tests/biology30-pilot3-reset-browser.test.ts` passed with native confirmation deliberately suppressed: cancellation preserves work, reset returns all four generated modes and Labeling to setup, clearing survives reload, completed history remains, progress is unchanged and no page errors occur. Broader E2E, Studio, SCORM/LMS and deployment remain deferred. Next action: refresh the local preview and review; next file: `scripts/lib/biology30-pilot3/runtime.ts`.

- Project: biology30-unit-a-pilot-3
- Task: integrate all Chapter 11 topics from the teacher-supplied HTML.
- Status: Chapter 11 learner work complete; exact-head Studio readiness passed (2026-09-12). Studio Edit is enabled.

## What changed / why

User confirmed Chapter 11 only. The current learner sequence has 11 teaching topics, a Chapter review and final check, and one unnumbered optional extension. The supplied Biology in practice extension was removed after teacher review. Topics 1–3 use their existing source-grounded writing activities as required checks inside their own lesson pages; nine paired MC/writing checks cover topics 4–12. Twelve topic-located checks control progress. The earlier combined foundation check remains available only for legacy saved work and no longer controls progress. Question diagrams, tables and subparts are retained. Physical investigations are textbook observation references, not required home procedures.

The 12 core destinations and the retained optional extension carry the Pilot 2 lesson-entry pattern requested in review: a learning goal or expectation strip, an in-context textbook or chapter-connection band, clickable anchor words, and an expandable inventory of lesson terms. The 22 lesson video placements and matching library entries use the stronger companion-card presentation. Players appear automatically when their destination opens; the old load controls are hidden while existing video IDs, external links and local fallbacks remain.

Source-backed MC unlocks related writing. Timers, first-attempt marks, corrections, redo history, Process Collection download, individual clickable vocabulary and any-eight Frayers remain. Old response IDs and 900-character fields are preserved except for the explicitly removed Topic Review activity (`review-1` and `review-2`); new source responses allow 3200 characters. Oversized writing stays visible without silent truncation.

Twenty-two source video placements have matching library entries and lesson return links. Twenty passed oEmbed lookup; ecGEcj1tBBI returned 404 and jaWrMYChc5A returned 403. These are flagged, with local explanations and external links. Player creation is tested, not uninterrupted third-party playback. Twenty-seven imported lesson/source assets supplement retained legacy assessment assets. Figures were inspected, questionable diagrams excluded, and illustrative/clinical limitations retained.

The remaining 104 textbook links span 19 distinct destinations. The 44-page Chapter 11 PDF has a consistent printed-page offset: PDF page 8 is textbook page 367, so `PDF page = printed page - 359`. Every retained link matches that relationship. Lesson and question links open a compact modal reader on the requested page without changing the current lesson route; Close/Escape restores focus, and a separate-window option remains. A cache-distinct reader URL prevents Chrome from reusing the Textbook Library iframe's earlier page position.

## Files changed / source of truth

- Canonical: workspace/index.html, workspace/styles.css, workspace/assets/pilot3-catalog.js.
- Presentation source synchronized with the canonical stylesheet: scripts/lib/biology30-pilot3/pilot3.css.
- Runtime source: scripts/lib/biology30-pilot3/runtime.ts; generated bundle: workspace/assets/pilot3-runtime.js.
- One-time intake: scripts/import-biology30-pilot3-integrated.ts and scripts/lib/biology30-pilot3/import-chapter.ts. Reference-only; completed intake refuses reimport; temporary repair retired.
- Metadata: project.json, e2e-contract.json, chapter11-intake.json, integrated-content-review.json (historical first-three-topic slice), prompt-pack.md, verification.json, readiness-boundary.json, this handoff.
- Tests: scripts/test-biology30-pilot3.ts and project E2E contract; existing shared pilot3-local-run assertions reused.
- Preserved source: projects/resources/biology30-pilot3-review/9e9e7823d345f21ad251e7e02624d65e005eab7c2f057bca20f23418cfdc94d2/Biology30_Chapter11_Integrated.html.

## Verification

Final HTML SHA-256: 5c3eb0acbd4a2e721168f16311da42e6eb7f27a947cc02174573ae171aac3b2e.
Runtime SHA-256: a82619606e366438cc5cc0b93ca551b25e698cd56b9a9ac08af1134aeb5c8236.

- Focused checks passed those hashes: legacy state, all new paired checks, 900/901 and 3200/3201 boundaries, reload, wrong/correct/redo, ten-check progress, eight Frayers, popup route/scroll/focus, all 23 routes and image decoding at desktop/tablet/mobile, 200% text, injected IndexedDB failure recovery.
- Project E2E passed 1/1 after the course-wide Pilot 2 pattern transfer. The final focused suite was rerun against all 23 routes and responsive sizes.
- Shared smoke passed 1/1. Readiness unit tests passed 10/10. Workspace assets/embeds verification passed.
- Source image contact sheets and desktop/mobile course screenshots visually inspected. Settled mobile navigation hides correctly.
- Protected Pilot 2 A and B/C/D learner hashes passed unchanged.
- Exact-head Studio readiness passed in isolated snapshot /tmp/biology30-pilot3-validation.VzOFlG at 1671cf85d69fa759dd6703c3d01f6d255378ae67. All 179 declared learner surfaces completed, including every lesson with its term inventory expanded; rendered block coverage was 4389/4832 and teacher-text coverage was 206471/221581. The reversible Studio apply/reload/Undo lifecycle passed with 5054 editable and 212 Annotation-only map targets. Readiness report digest: 397c016edc68ebe290b6cc20723fe626baa944442016f4c4cb9108b91f982491.

## Known risks / remaining boundaries

Local browser persistence only: IndexedDB activity history and independent Pilot 3 localStorage Frayers. No SCORM suspend-data budget or Brightspace reporting is claimed. Download a backup before clearing browser data or changing devices. Video availability and picture permissions remain release boundaries. Technical checks are not teacher acceptance or curriculum certification. Chapters 12–13, separate Advanced Learning site, deployment, exports and ZIPs are outside this pass.

## Fragile areas / next prompt assumptions

Never regenerate canonical HTML from initializer/intake scripts. Preserve vocabulary identities, activity IDs, storage keys and source-question mappings. Rebuild only the runtime bundle after runtime edits. The neutral spans around 13 Previous/Next separators prevent punctuation-only parent containers from obscuring individually editable link destinations; preserve those wrappers. Isolated validation commits belong to the temporary repository; no commit/reset was made in the user's dirty main checkout. Do not rebuild older courses.

## Exact next command

Await the next requested Build-mode change. Run the accumulated rollout checks only when testing, packaging or rollout is requested.

## Exact next file to open

`projects/biology30-unit-a-pilot-3/meta/readiness-boundary.json`

Runtime regeneration: `npx esbuild scripts/lib/biology30-pilot3/runtime.ts --bundle --platform=browser --format=iife --target=es2022 --outfile=projects/biology30-unit-a-pilot-3/workspace/assets/pilot3-runtime.js`.

## Build-mode neural-pathway integration — 2026-09-14

The returned external activity is adapted into the existing `labeling` activity rather than running as a second standalone application. The teacher-supplied 1448 × 1086 replacement diagram now shows A–J and is active at `workspace/assets/source/neural-pathway-labeling.png`. An exact provenance copy is retained at `meta/injected-components/neural-pathway-labeling-a-j.png` and declared as the active v2 component in `meta/project.json`; the earlier ZIP-based v1 component is retained as archived provenance.

The original answer IDs A/B/C/D/J are unchanged. New stable IDs E/F/G/H/I cover cell body, dendrites, node of Ranvier, myelin sheath and axon. All ten dropdowns appear below the complete image in a two-column wide layout and a one-column phone layout. `Check all labels` uses the existing Pilot 3 runtime, attempts, timer and local-save state. Runtime answer lookup falls back to the current catalog so an older in-progress five-label run can use the newly added questions without an error.

A focused activity-only browser check passed 10/10 check-all behavior, correct A–J feedback, saved dropdown restoration after reload, and desktop/mobile overflow. A simulated five-label in-progress save also accepted and graded new label E. The desktop and mobile activity views were visually inspected in `meta/integration-preview/neural-labeling-a-j-*.png`. Full-course E2E, exhaustive responsive checks, Studio/readiness proof, SCORM behavior and LMS certification remain deferred until rollout.

The earlier review-only SCORM and ChatGPT context ZIP were created before this integration and were not regenerated. Refresh them only when requested or at rollout.

## Practice-route split — 2026-09-14

Practice & Review now exposes three separate sidebar destinations: `#practice` for Flash cards, `#fill-in-the-blanks`, and `#labeling-practice`. Each page contains exactly one of the existing activities. The activity identities `flashcards`, `blanks` and `labeling`, along with their question/answer IDs and local saved-state records, were not changed.

A focused route check passed direct navigation, one-visible-page behavior, sidebar active states and the original activity identities for all three destinations. Edit keys are unique and `git diff --check` passed. No full-course E2E, exhaustive responsive, Studio/readiness, SCORM or LMS validation was run; those remain deferred until rollout.

## Topic-located checks for Topics 1–3 — 2026-09-14

The existing source-grounded writing activities for Nervous communication, Neurons & myelin, and Pathways & reflexes are now the required checks for Topics 1–3. Their activity IDs, question IDs, response IDs and saved histories are unchanged. Together with the nine existing checks in Topics 4–12, progress now reports twelve chapter checks. The standalone Lesson check link was removed from Practice & Review and from the three lesson footers. Its existing route, activity and answer IDs remain available as an earlier foundation check for legacy saved work, but it no longer contributes to required progress.

A focused state regression completed all three topic-located checks and confirmed progress at 3 of 12, no standalone navigation link, and direct legacy-route availability. Static structure validation and `git diff --check` passed. The earlier ten-check full-project evidence is historical and does not certify this new twelve-check candidate; full learner E2E and Studio/readiness remain deferred until rollout.

## Collapsed chapter checks and question-label cleanup — 2026-09-14

All twelve required chapter checks now reuse the established plain `activity-disclosure` pattern and begin collapsed. Students select the topic-specific “Open chapter check” row to reveal the existing activity. No new visual system or runtime state was introduced. Imported visible source-number labels such as `Q4.` and `Q27.` were removed throughout the learner questions because the retained selections are organized by topic rather than by their original textbook sequence. Underlying activity, question, answer and writing IDs remain unchanged.

A focused browser regression confirmed twelve collapsed disclosures, zero remaining visible numeric source labels, open/start/write/save/finish behavior, persisted progress after reload, and a closed state on reload. The Topic 3 collapsed and expanded states were visually inspected. The full project E2E and Studio/readiness rerun remain deferred until rollout.

## Source-practice collapse, lesson-footer cleanup and Topic Review removal — 2026-09-14

The ten remaining optional source-practice activities now start collapsed behind the same established disclosure pattern as the twelve chapter checks. Lesson footers no longer include Flash cards, Fill in the blanks or Labeling shortcuts; their Previous/Next topic links remain. The redundant standalone Topic Review page, sidebar link, learner-route declaration and project surface were removed. Its two old response IDs remain only in historical source mapping and existing browser records; they are no longer editable or resumable in the learner interface. The project E2E evidence scenario now uses the Topic 2 source-grounded check, and the shared Pilot 3 assertion opens a containing disclosure before interacting.

A focused browser regression confirmed 22 collapsed activity groups, optional source-practice open/start behavior, zero lesson-footer practice shortcuts, intact Previous/Next links, 25 learner pages, 104 retained textbook links and no page errors. Action potentials source practice was visually inspected while expanded. Full learner/project E2E and Studio readiness remain deferred until rollout.

## Generated Chapter 11 practice — 2026-09-14

Flash cards and Fill in the blanks now use an authored, versioned bank and deterministic browser generator; Mixed practice is a new fourth Practice & Review destination after Labeling. Every teaching lesson, the cumulative Chapter review and the retained optional extension are selectable, with All Chapter 11 and 5/10/15 controls. Biology in practice is not selectable for new sets; its concepts remain in the bank only for older saved-session restoration. Generated sets are one item at a time and include recall, comparison, application, sequencing, misconception/error-correction, multiple-select, true/false and a corrected diagram-selection item. Flash-card outcomes are reported as self-assessment, while graded items use first-try reporting and two-attempt cue/answer feedback.

The exact generated session is saved in the existing version-1 IndexedDB record before display. Optional Run/Attempt fields preserve seed, bank/generator versions, item and option order, feedback, responses, concept/skill evidence and deterministic adaptation records. Legacy unfinished `flashcards` and `blanks` runs continue against their original snapshots; completed history and all existing IDs remain unchanged. A compact localStorage projection named `biology30-unit-a-pilot-3:generated-practice-resume:v1` is discoverable by the shared SCORM exporter. It restores current generated sessions when IndexedDB is absent, refuses malformed/unavailable bank versions without replacement, and reports the 60,000-character save-budget failure while retaining the full local IndexedDB record.

The original A–J image remains preserved in provenance. The active corrected sibling moves E from the nucleus to cell-body cytoplasm and H to the centre of a myelin segment without changing A–J answer identities. Built-in image editing was used with a change-only-E/H prompt; the result was visually inspected at 1448 × 1086.

Focused verification passed 4/4: bank/reference/identity/coverage validation; deterministic uniqueness, lesson filtering and mixed-set balance; answer normalization and compact projection restoration; and a browser flow covering complete sets, reveal/respond/next/finish/start-another, exact reload, first/second-attempt feedback, formative progress isolation, 60,000-character failure, concurrent-tab conflict, legacy unfinished work, external requests blocked, and 1100px/320px rendering. Runtime compilation, JSON parsing, edit-key uniqueness and `git diff --check` also passed. Full-course E2E, exhaustive responsive coverage, Studio reversible-edit proof, SCORM packaging and Brightspace test-student verification remain deferred until rollout.

## Dedicated multiple-choice practice and learner-copy cleanup — 2026-09-14

`#multiple-choice` is now a separate formative route between Labeling and Mixed practice. It uses the same concept, session, attempt, adaptation and Process Collection architecture as the other generated practice. The bank contains 280 stable MC variants across 40 concepts, including 252 variants across the twelve core Chapter 11 lessons. Topic choices include all core lessons, Lessons 1–3 foundations and each individual core lesson; difficulty choices are Foundation, Developing, Application and Mixed; set sizes are 5, 10, 15 and 20. Questions appear one at a time, options are deterministically shuffled and restored, the first error gives a cue, and the second reveals the answer and explanation. Mixed practice can draw from these same MC variants. The activity has no `data-required-check` marker and does not affect the twelve-check progress denominator.

The supplied D2L `quiz_d2l_59222.xml` contains 25 source items (21 multiple choice and four short answer). It was used only to calibrate coverage, difficulty and misconception patterns; its exact stems and object IDs are not presented to learners. The source audit is recorded in `meta/multiple-choice-calibration.json`. Across six lessons, the repeated “Investigation reference” heading and online-pilot procedure disclaimer were removed. The actual named investigation and textbook links remain available to students.

Focused checks passed 5/5 across the bank and browser regressions: 280 unique valid MC variants, 20-item lesson sets, topic/difficulty filtering, deterministic item and option order, broad all-chapter distribution, Mixed-practice reuse, exact reload, two-stage error feedback, serialized attempts/options, no required-progress change, 320 px layout and no page errors. The runtime bundle was rebuilt and the desktop MC screen was visually inspected. Full project E2E, exhaustive responsive coverage, Studio reversible-edit proof, SCORM packaging and Brightspace verification remain deferred until rollout.

## In-progress Practice & Review reset — 2026-09-14

Flash cards, Fill in the blanks, Multiple choice and Mixed practice now show a restrained “Stop and reset” action beside the active-set summary. Labeling exposes the same action beside its timer. The action requires confirmation, removes only that activity's unfinished current run and drafts, returns to the setup/start state, and keeps completed Process Collection history. Cancelling the confirmation leaves the exact active set untouched. Required chapter checks and their progress behavior were not changed.

When the final generated run is reset, the portable localStorage resume projection is now removed rather than leaving an empty projection that could not be restored. Focused state verification passed 6/6: cancel preservation, confirmed clearing, post-reload clearing, all four generated routes, Labeling field reset, portable-projection cleanup, unchanged twelve-check progress, desktop presentation and existing MC/bank behavior. Full project E2E, Studio readiness, packaging and LMS verification remain deferred until rollout.

## Chapter ending and instruction cleanup — 2026-09-15

The core Learn sequence now ends with `12. Chapter review and final check`. Its new four-step orientation tells learners to review the pathway, explain one pathway aloud, complete the required paired check, and choose whether they need the optional textbook questions. The required check now explains the Start → check answer → unlock and save writing → Submit and finish sequence. The separate source activity is labelled as 22 optional textbook review questions and explains that individual responses can be saved, while all 22 must be saved before the complete set can be submitted.

Further exploration is no longer numbered as a core lesson. It appears in its own Optional extension navigation group as `Stress, experience and addiction`, tells learners to choose one topic, and states that nothing is submitted unless a teacher assigns it. The empty teaching section was removed. Biology in practice, its fixed writing activity, navigation link, learner route and new-practice lesson selector were removed. The two lesson-14 generated concepts remain in the bank only to restore older generated sessions and cannot be selected for new sets.

A focused structure and browser check confirmed 12 required checks, 22 optional review questions, 24 learner pages, no Lesson 14 page or navigation target, Lesson 13 outside required completion, visible required/optional language, and invalid `#lesson-14` falling back to the overview. Lesson 12 and Lesson 13 were inspected in the local learner preview. Full project E2E, the responsive matrix, Studio reversible-edit proof, packaging and LMS verification remain deferred until rollout.

## Detailed learner page-use guidance — 2026-09-15

Twenty detailed “How to use” disclosures now give students explicit, numbered workflows without crowding the page when help is not needed. They begin collapsed on teaching Lessons 1–11, all five Practice & Review pages, All My Work, Core Vocabulary, the Textbook Library and the Video Library. The directions explain where to begin, which controls to use, how feedback and completion work, what is saved locally, and whether the page affects the twelve required checks. Lesson 12 keeps its full visible four-step process and the optional extension keeps its visible choose-one-topic directions, so neither receives a duplicate disclosure.

No runtime, activity identity, answer identity, required-check marker, route or save-state contract changed. Presentation rules are synchronized between `workspace/styles.css` and `scripts/lib/biology30-pilot3/pilot3.css`; the disclosures are hidden when printing All My Work so the learner record remains concise. Focused checks confirmed 20 disclosures, zero open-by-default disclosures, unique edit keys, 12 required checks, expected guide placement and no guide on Lessons 12–13. A local browser check confirmed the collapsed and expanded lesson and multiple-choice states plus the collapsed All My Work state. Full project E2E, the 320/375/768/full desktop matrix, Studio reversible-edit proof, packaging and LMS verification remain deferred until rollout.

## Sports Wellness guide baseline and Learn sequence — 2026-09-15

The Sports Wellness Phase 1 completion-guide treatment is now the presentation baseline for Pilot 3’s “How to use” disclosures: pale-teal background, teal left rule, small guide label, strong title, explicit chevron and a divided instruction body. Biology wording, navigation and completion controls remain course-specific.

All eleven Learn guides sit in the lesson-opening sequence directly after the complete, original side-by-side Learning goal / Before you begin strip and before the textbook panel and vocabulary help. Their first numbered instruction tells students to read the full assigned textbook range before working through the online lesson. The remaining steps explain how to use the learning goal, proceed through the lesson, use support, complete the required chapter check, submit it and distinguish optional practice. Focused static checks confirmed 11/11 ordering, 11/11 required-reading first steps, 20 total collapsed guides, unique edit keys, 12 unchanged required checks and synchronized source/workspace CSS. Lesson 2 was visually inspected collapsed and expanded when adopting the baseline; Lesson 1 was rechecked after restoring the original goal-strip layout. Full responsive, project E2E, Studio, packaging and LMS checks remain deferred until rollout.
