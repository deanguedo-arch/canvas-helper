# Pilot 3 Lesson 1 — review handoff

## Summary

User requested a pause to conserve remaining usage and inspect the candidate in Canvas Helper. Pilot 3 is visibly selected in Canvas Helper at http://127.0.0.1:5174/. Original reference remains Pilot 2; current course is Pilot 3. Preview and Annotate are available. Edit remains correctly disabled pending readiness proof.

## Files changed / source of truth

- Canonical: workspace/index.html, workspace/styles.css, workspace/assets/pilot3-catalog.js.
- Runtime source: scripts/lib/biology30-pilot3/runtime.ts; bundle: workspace/assets/pilot3-runtime.js.
- One-time initializer: scripts/create-biology30-unit-a-pilot-3.ts. Do not rerun; it refuses existing targets and its seed no longer contains subsequent canonical edits.
- Tests: scripts/test-biology30-pilot3.ts, meta/e2e-contract.json; narrowly extended e2e/lib/project-contract-schema.ts and learner-course-assertions.ts for pilot3-local-run.
- Source evidence: meta/source-map.json and authored-test-answers.md.

## Implemented

One slide-faithful Neuron Structure lesson; source textbook/PPT figures; two original source videos; flashcards, blanks and labeling; two original MC questions with correct-answer writing unlock; two textbook review questions; 900-character writing; wall-clock activity timers; first-try marks and redo history; local Process Collection download; individual vocabulary and eight word Frayers. No changes to Pilot 2 or B–D learner outputs.

## Verification

Focused learner checks passed through the tested HTML hash in meta/verification.json: all practice modes, wrong/correct unlock, 900/901 boundary, writing reload, first-try marks, redo history, Frayer cap and reload, popup Escape/scroll, three viewport sizes, text-200 profile, mobile menu, forced IndexedDB write failure and recovery. Shared smoke passed 1/1. Readiness unit tests passed 10/10. Workspace asset verification passed.

Final runtime additions after that focused receipt (Frayer cross-tab conflict guard and radio-selection reload) need the focused rerun; do not claim that old receipt certifies their final bundle. Project E2E initially failed because the manifest omitted previewModes/rawEntrypoint; after repair the final project E2E passed 1/1 (14.9 seconds). The course is visibly previewable in Studio.

## Remaining boundary / risks

Direct editing is NOT certified. authoringStatus remains blocked; requested Direct capabilities do not grant Edit while blocked. Isolated validation snapshot /tmp/biology30-pilot3-validation.VzOFlG completed its 152-surface run just before the attempted pause. It failed block-coverage-90, candidate-prose-80 and teacher-text-coverage-90; lifecycle was not run. Snapshot commit: 2b3f2f0a5b0fdb5e36e1cc903da6f4937a91a006. Earlier inventory and on-load database creation failures were resolved. The remaining controlled/runtime prose and labels require a bounded ownership repair, not another course redesign. No readiness process remains running.

Activities use local IndexedDB; Frayers use a separate Pilot 3 localStorage key. No Pilot 2 state is read. History is not SCORM suspend data; whole-history 44k compliance and live LMS reporting are explicitly deferred. Browser clearing loses local records; download a backup. Source picture permissions remain a release boundary. Other lessons, the advanced site, deployment, SCORM and ZIPs are deferred.

## Fragile areas

Canonical vocabulary HTML owns the reader and popup wording; embedded JSON owns identities/model responses. Keep those identity maps stable. Do not regenerate learner HTML. Runtime bundle must be rebuilt after runtime edits. Inspection snapshot has its own commits only; the user's repository was not committed or reset.

## Next prompt assumptions / exact next steps

Wait for user review. If asked to resume verification, first run `npx tsx scripts/test-biology30-pilot3.ts`, then `npm run test:e2e:project -- --project biology30-unit-a-pilot-3`. Readiness requires a refreshed isolated snapshot matching current sources and its genuine rendered apply/reload/Undo gate; never enable by flag alone.

Exact next file: projects/biology30-unit-a-pilot-3/meta/review-handoff.md.

Exact runtime command: `npx esbuild scripts/lib/biology30-pilot3/runtime.ts --bundle --platform=browser --format=iife --target=es2022 --outfile=projects/biology30-unit-a-pilot-3/workspace/assets/pilot3-runtime.js`.
