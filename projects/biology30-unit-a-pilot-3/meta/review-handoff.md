# Pilot 3 — Chapter 11 handoff

- Project: biology30-unit-a-pilot-3
- Task: integrate all Chapter 11 topics from the teacher-supplied HTML.
- Status: Chapter 11 learner work complete; exact-head Studio readiness passed (2026-09-12). Studio Edit is enabled.

## What changed / why

User confirmed Chapter 11 only. All 14 supplied topics have separate destinations: 11 teaching topics, Chapter Review, and two optional extensions. The first three share the preserved foundation check; nine further paired MC/writing checks cover topics 4–12. Ten checks control progress. Twenty-seven activity containers and 99 question containers include source practice; optional practice is not additional required completion. Question diagrams, tables and subparts are retained. Physical investigations are textbook observation references, not required home procedures.

All 14 destinations now carry the Pilot 2 lesson-entry pattern requested in review: a learning goal and prerequisite strip, an in-context textbook or chapter-connection band, four clickable anchor words, and an expandable inventory of all lesson terms. The 22 lesson video placements and matching library entries use the stronger companion-card presentation. Players appear automatically when their destination opens; the old load controls are hidden while existing video IDs, external links and local fallbacks remain.

Source-backed MC unlocks related writing. Timers, first-attempt marks, corrections, redo history, Process Collection download, individual clickable vocabulary and any-eight Frayers remain. Old response IDs and 900-character fields are preserved; new source responses allow 3200 characters. Oversized writing stays visible without silent truncation.

Twenty-two source video placements have matching library entries and lesson return links. Twenty passed oEmbed lookup; ecGEcj1tBBI returned 404 and jaWrMYChc5A returned 403. These are flagged, with local explanations and external links. Player creation is tested, not uninterrupted third-party playback. Twenty-seven imported lesson/source assets supplement retained legacy assessment assets. Figures were inspected, questionable diagrams excluded, and illustrative/clinical limitations retained.

All 106 textbook links were audited across their 20 distinct destinations. The 44-page Chapter 11 PDF has a consistent printed-page offset: PDF page 8 is textbook page 367, so `PDF page = printed page - 359`. Every link matches that relationship. Lesson and question links now open a compact modal reader on the requested page without changing the current lesson route; Close/Escape restores focus, and a separate-window option remains. A cache-distinct reader URL prevents Chrome from reusing the Textbook Library iframe's earlier page position.

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
