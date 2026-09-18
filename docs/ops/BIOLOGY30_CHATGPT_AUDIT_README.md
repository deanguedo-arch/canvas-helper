# Biology 30 Chapters 11–13: ChatGPT audit bundle

This bundle contains the current local Biology Chapter 11, 12 and 13 courses, not Chemistry and not other Biology units or historical pilots. It is an audit snapshot, not a live-LMS-certified release.

## Updated post-correction snapshot — 2026-09-17

Start with `docs/ops/BIOLOGY30_AUDIT_CORRECTIONS.md`. This snapshot follows the independent audit correction pass and verified deployment `https://biology30pilot.web.app/?v=20260917-8`. All three current review-only SCORM 2004 ZIPs are included under their chapter `exports/` folders. They are generated review artifacts, not canonical editable sources.

Re-audit the 40 guided and six transfer MC displayed answer positions, strengthened transfer distractors, five corrected worksheet targets, taught detailed ear terminology, old-response compatibility and Chapter 11's lesson-first instructions. Retain the exact Chapter 12/13 teaching prose unless a specific substantiated defect is found. Chapter 11 final-assessment breadth was not expanded in this pass; practice-family expansion also remains separate, not an unfinished immediate correction.

The active diagram configuration references five `*_corrected.png` siblings and the previously corrected stress image. Original supplied images are intentionally retained for provenance: inspect the images actually selected in `course-data` rather than reporting an unused original as the current activity. Chapter 12's `meta/instructional-revision/audit-image-edits.json` records exact edit prompts, selected outputs and tool mode. Labeling review records distinguish locally corrected audit targets from independent teacher acceptance. Root `SHA256SUMS.txt` fingerprints the snapshot files.

## Start here

1. Review each chapter's `workspace/index.html`, `styles.css` and runtime. Chapter 11 uses `workspace/assets/pilot3-runtime.js`, derived from `scripts/lib/biology30-pilot3/runtime.ts`; Chapters 12/13 use native `workspace/main.js`.
2. Chapters 12/13 also include portable standalone `Biology30_Chapter12.html` and `Biology30_Chapter13.html`. They are derived copies, not the source to patch.
3. Read `docs/ops/BIOLOGY30_CH12_CH13_INSTRUCTIONAL_REVISION.md` for scope, changes, local evidence and known limitations. Authoritative Chapter 12/13 content specifications are under Chapter 12's `meta/instructional-revision/specifications/`.
4. Inspect all learner routes, including optional extensions, vocabulary dialogs/Frayer supports, videos and written alternatives, practice/retries, textbook library/practice and All My Work/print. Textbook PDFs and supplied images are included in course assets.
5. Audit scientific accuracy, Alberta Biology 30 scope, teacher voice/readability, standalone learning completeness, instructions, diagram/key alignment, feedback and answer grading. Distinguish confirmed defects from suggestions.

## Protected behavior

Preserve existing save namespaces, answer/question/option identities, earlier student attempts, first-try results and required-progress counts. Optional practice must not affect required progress. Vocabulary distinctions are correct explanatory statements; practice misconceptions are false statements to correct, not reference answers. Chapter 13 lesson 7's worked/guided steps precede failure analysis.

## Important limits

Live Brightspace checks remain deferred. Local and simulated-SCORM tests do not certify Brightspace behavior. Biology photo-upload controls were deliberately removed; existing older photo records can remain readable where available. Do not propose restoring uploads as a defect fix.

The stress diagram's ACTH/aldosterone and cortex-label issues remain corrected. Five additional flagged worksheet targets were corrected in the follow-up; see the current correction report and metadata for scope and retained original concerns. Chapter 11 received only learner-instruction alignment; Chemistry is outside this bundle and unchanged by the correction pass.

## Requested audit output

Return an itemized report by chapter and route, with severity, precise file/element/question identity, observed issue, supporting source and minimal recommended correction. Separate science/content defects, teaching/usability issues, implementation/state issues and checks requiring real Brightspace. Do not rewrite the entire course or treat developer specifications as student-facing pages. No browser-local student saves are included in this filesystem snapshot.
