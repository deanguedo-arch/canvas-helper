# AB30 lead checkpoint — 2026-09-24

## Newest checkpoint: full-course student reading-title audit

Lesson 17 was the example, not the boundary. The rendered reading headings were reviewed across all four themes: 50 lessons and 275 reading groups. Generic `Reading: ...` labels and citation-style titles are gone. Named voices and documents remain explicit, and 34 weak or opaque topic labels were replaced with direct student-facing language. Complete source records and all activity/state identities remain intact.

Evidence: `reading-title-audit.json` records all 275 headings and bylines. It reports 189 distinct headings and zero technical/provenance, editorial-shorthand or overlong-title violations. The refreshed browser report passed 100 desktop/phone lesson-route checks with zero failures, and eight representative theme screenshots were visually inspected. The focused teacher-presentation suite now enforces the course-wide heading rules.

Routing: deterministic inventory plus Sol lead instructional naming and integration. Muse was ineligible because the canonical files were already dirty and the naming required teaching/source judgment. No Luna scout was needed for the single-project deterministic audit. Cache hits and usage savings were not measured. Teacher/community review, Studio lifecycle, packaging, SCORM and live Brightspace remain pending.

## Newest checkpoint: visual refinement and video proposal review

The annotated visual issues are corrected. Generated-image disclosure text remains in canonical data and screen-reader-only captions, while learner pages no longer show the repeated “Generated illustration” line. Theme 4 supporting images now sit beside their opening explanation on desktop and stack cleanly below it on smaller screens. The Theme 4 child-removal questions use the full available width; the comparison table becomes readable response cards at 760 px and below. Q7 now asks directly why acronyms can be disrespectful when substituted for a person’s or Nation’s name. The mobile menu button is fixed at the left of a centred logo.

Focused evidence passed: 21 content/route tests, course doctor, and 66 Chromium checks. The browser pass covered all 50 lesson routes at phone width, six representative lessons at desktop and phone widths, and the annotated lesson at 1594, 760, 390 and 320 px. It found no page overflow, incomplete blocks, missing current-page state, visible generated-media captions or table fit failures. Fourteen screenshots and the JSON report are in `visual-refinement-2026-09-24/`.

The supplied video package is preserved as a review-only planning source. Its 50 rows reconcile by L01–L50 sequence to the canonical course; 26 propose video and 24 intentionally do not. No learner video was added because the package contains no approved URLs, licensed media, captions/transcripts, posters or completed custom video. The normalized mapping and hash are in `video-integration-review/`.

Routing: deterministic package reconciliation plus Sol lead visual, cultural-copy and dirty-boundary integration. Muse was ineligible because the canonical files were already dirty and the edits required visual and source judgment. No Luna scout was needed for the bounded package. Cache hits, provider telemetry and usage savings were not measured. Teacher review, packaging, Studio lifecycle, SCORM and live Brightspace remain pending.

## Newest checkpoint: Theme 4 generated illustrations

The supplied L46–L50 image package is integrated into the current Theme 4 Lessons 3–7 by lesson title. Each lesson has one header illustration and one supporting illustration. All ten retain the supplied alt text and evidence-limit caption in canonical data; the caption is now visually hidden so it remains available to assistive technology without interrupting the lesson. Optimized WebP assets reduce the roughly 25 MB source set to about 1.2 MB in the learner workspace.

Focused evidence passed: 21 content/route tests, course doctor, and ten browser routes across desktop/phone. All images decoded, both placements appeared on every lesson, and no horizontal overflow or incomplete block was found. Review links, hashes and screenshots are in `theme4-generated-images/REVIEW.md`. Teacher approval, packaging, export and LMS checks remain pending.

Routing: deterministic package inventory and image conversion plus Sol lead integration. Muse was ineligible because `course-data.js`, `main.js` and `styles.css` were already dirty and placement required source/evidence judgment. No Luna scout was needed for this bounded five-lesson package. Cache hits and usage savings were not measured.

## Prior checkpoint: full-course teacher voice

The approved teacher-voice approach now covers all 50 lessons and the 400-item Practice & Review bank. The three pilot lessons keep their bespoke rewrites; the other 47 use the shared source-aware presentation over the existing teaching content. All directions, examples, feedback, and expanded reading context now identify the reading, speaker, document, or textbook page without unexplained source letters. Canonical quotations and activity/state identities remain intact.

Focused evidence passed: 46 tests, course doctor, and 100 browser route checks across desktop and phone. Eight representative screenshots and the review links are in `teacher-voice-full-course/REVIEW.md`. Teacher/community editorial review, the known legacy review-record gaps, Studio annotation, packaging, SCORM, and live Brightspace remain later checkpoints. **Next action is teacher sampling of the four linked lessons before any packaging or release.**

Routing: the lead retained teacher voice, Indigenous/source judgment, dirty canonical integration, saved-state compatibility, and acceptance. One bounded Luna read-only audit was admitted and accepted; it found the review-record gaps documented above. Muse was ineligible because the useful canonical paths were already dirty and the work required judgment. Local context cache missed; provider-cache telemetry and actual usage savings are unknown.

## Prior checkpoint: teacher-voice pilot

The approved three-lesson teacher-voice pilot and shared navigation are implemented. Review `teacher-voice-pilot/REVIEW.md` for the three lesson links, matched desktop/phone screenshots, preserved-state evidence, source hashes and routing record. All three remain unreviewed by the teacher. **Next action is teacher feedback on the pilot before extending the voice to the other 47 lessons.** This supersedes the older next action below; the curriculum gaps remain a later checkpoint. A native-triangle/sidebar correction and initial-route save-order fix are included.

## 1. Summary

Build-mode candidate on `codex/math-engine-preflight` at `02a9fadc`, with the pre-existing dirty overlay retained. All 50 stable lesson routes now use v2 teaching blocks. Theme 4 lessons 3–7 were authored against the supplied official booklet/textbook and two publisher/organization sources. The bank now holds 300 objective and 100 written variants, six plus two per lesson. Selected-response practice is offered as a five-item default and keeps run-specific key/feedback. A store-adapter exception no longer falls through to a direct tracked-key write.

The user's newly found `AB30_ChatGPT_Edited_Candidate (1).zip` was inspected read-only. SHA-256 `d7bc29b5b3c4d79b5a530fbf23cba4d207bada8e5d6bd20ee62006c7f7911366`. Its own delivery note says it was built from the 2026-09-23 audit snapshot. Of 92 ZIP workspace files, 76 match the present workspace, 16 differ and none is ZIP-only. All major runtime sources in the ZIP are older/smaller (e.g. course-data.js 348,158 vs 1,518,668 bytes; practice-data.js 2,793 vs 460,267 bytes). It is a comparison reference, not the current candidate. The ZIP's T25 note says an approval stamp was reverted, but its `meta/project.json` contains `workspaceApprovedAt`; the current project metadata also contains that older timestamp. No current candidate approval is inferred from it.

## 2. Files changed in this lead pass

- Canonical: `workspace/course-data.js` (L46–L50 and source links), `workspace/practice-data.js` (30+10 bank items, selected-response offer), `workspace/practice-engine.js` (run-pinned keys/feedback), `workspace/main.js` (safe save failure path, practice start UI and recorded-run replay).
- Focused tests: `scripts/tests/aboriginal-studies-30-storev2.test.ts`, `scripts/tests/aboriginal-studies-30-practice.test.ts`, `scripts/tests/aboriginal-studies-30-content.test.ts`.
- Metadata/evidence: `meta/ab30-parity/lesson-review-manifest.json` (versions/titles, all still unreviewed), regenerated `asset-manifest.json` and `media-ledger.json`; five candidate lesson records under `meta/ab30-v2/lesson-reviews/`; ten local opening screenshots under `meta/ab30-v2/evidence/R27/`; `CURRICULUM_ALIGNMENT_THEME4_2026-09-24.md`; and this checkpoint.
- No existing assignment IDs, response keys, saved learner work, exports, commits, pushes or deployments were changed by this pass. Existing dirty assignment asset edits from earlier work remain present.

## 3. Verification run

- `npm run course:doctor -- --project aboriginal-studies-30`: PASS (`legacy-snapshot-v1`).
- `node --test scripts/tests/aboriginal-studies-30-storev2.test.ts scripts/tests/aboriginal-studies-30-submissions.test.ts`: 18/18 PASS.
- `node --test scripts/tests/aboriginal-studies-30-practice.test.ts`: 13/13 PASS after updating its actual offered-mode expectation.
- `node --test scripts/tests/aboriginal-studies-30-content.test.ts`: 13/13 PASS after aligning the five lesson versions/manifest.
- `node --test scripts/tests/aboriginal-studies-30-assets.test.ts`: 4/4 PASS; regenerated allowlist has 97 shipped files, five excluded backups/metadata files, and 74 media ledger entries.
- Syntax and scoped diff checks passed. A runtime inventory found 50/50 v2 lessons, 300 objective/100 written items, and six/two items for each new lesson; supported controls match the bank's option IDs, key and feedback.
- Local Chromium: all five new lessons opened at 1440 and 390 widths with no page errors or horizontal overflow, three options and two first-save controls each. Lesson 3 wrong/correct feedback and a first save survived reload. The active Assignment 4.3 view showed Halfbreed and no legacy Inconvenient Indian prompt. Selected-response catalogue offered a five-item run; one answer, reload and resume succeeded. A synthetic in-session bank change did not alter that run's pinned key/feedback.
- Earlier this pass, `node scripts/lib/as30-r08-browser.cjs` passed Lesson 7 desktop/mobile supported, repair, independent and reload checks over HTTP. The earlier startup regression from the save guard was repaired before this passing run.

## 4. Known risks / follow-up

- The 50 v2 structures and 300/100 bank counts are implementation progress, not independent editorial acceptance. Five new review records are candidate technical records; manifest statuses remain `unreviewed` because no teacher review was supplied.
- Theme 4 curriculum map is partial. Outcome 6's Australia/New Zealand/Russia/Sweden education-system investigation and other named gaps need source-backed learner evidence. Themes 1–3 specific outcomes are not yet mapped.
- Full 281 source-item/167 numbered-question reconciliation, all media access and reuse rights, all 50 deep responsive openings, keyboard/zoom/screen reader, Studio annotation save/reopen, exported SCORM storage capacity/resume and live Brightspace checks remain unrun at this Build checkpoint.
- The old `workspaceApprovedAt` field conflicts with the historical ZIP note and predates current bytes; do not treat it as approval. Do not silently remove/renew it without an explicit release-governance decision.
- Selected-response run records created before key/feedback pinning use the prior current-bank fallback. New runs pin both. A future content-version migration should test the old-run fallback explicitly.

## 5. Source of truth

`projects/aboriginal-studies-30/workspace/index.html` is the canonical entry. Course teaching/assignments are in `workspace/course-data.js`, presentation/flow in `workspace/main.js` and `lesson-components.js`, practice registry/engine in `workspace/practice-data.js` and `practice-engine.js`, learner state in `workspace/learning-store.js`. Metadata/evidence are in `meta/ab30-v2/` and `meta/ab30-parity/`. The external ZIP is reference-only in Downloads and was not extracted into or applied to the workspace.

## 6. Fragile areas / what might drift

Stable lesson/assignment IDs and active Halfbreed vs legacy Inconvenient Indian profiles; saved firsts/revisions and run provenance; the two historically dated textbook statistics/case descriptions; third-party source URLs and film access; the generated asset hashes and manifest content versions. The shared branch contains unrelated dirty work; do not reset or use the older ZIP as a new base.

## 7. Next prompt assumptions and agent usage

The user authorized course improvement with usage guardrails, not release. Route used: deterministic source/test commands plus Sol lead for pedagogy, persistence and integration; one bounded Luna read-only Theme 4 inventory with admission/acceptance; Muse not used because canonical `course-data.js`/`main.js` were already dirty and source judgment was not a clean delegated slice. One local context-cache hit was observed on the scout packet; provider cache telemetry and actual usage savings are unknown. `agents:status` finished with no active worker/cooldown. No direct Muse session is included in this record.

## 8. Exact next action

Resolve the Theme 4 curriculum gaps against the official 2002 program, then continue the plan's source-item/assigned-work and all-lesson editorial reconciliation in Build mode. At the explicit rollout checkpoint, run the planned ordered acceptance batch rather than broad suites after each prose edit.

## 9. Exact next file to open

`projects/aboriginal-studies-30/meta/ab30-v2/CURRICULUM_ALIGNMENT_THEME4_2026-09-24.md`.
