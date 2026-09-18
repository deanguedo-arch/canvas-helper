# Biology 30 Chapters 12–13 instructional revision candidate

2026-09-17 follow-up: the five inherited worksheet concerns and correct-first guided/transfer choices have now received a controlled correction pass. See [audit correction report](BIOLOGY30_AUDIT_CORRECTIONS.md) for current scope, assets, compatibility and evidence. Statements below describe the earlier pre-audit candidate.

## Summary and source of truth

The supplied JSON specifications are retained under `projects/biology30-chapter-12/meta/instructional-revision/specifications/`. Apply through `node scripts/apply-biology30-instructional-revision.mjs`, then refresh portable copies with `node scripts/refresh-biology30-chapter-portable.mjs`. Canonical chapter HTML and native `main.js` remain in each chapter's workspace. Do not rerun the original import over these revisions.

Applied 35 Chapter 12 and 51 Chapter 13 teaching replacements; eight and twelve worked/guided activities respectively; reviewed vocabulary and concept feedback, varied practice families, optional independent transfer checks and self-contained extensions. Required check identities and counts remain nine and thirteen. Chapter 11 was not edited by this revision.

Clickable vocabulary is bold (weight 800) in lesson prose, vocabulary definitions and Key terms. The shared owner is `scripts/lib/biology30-chapters/components.css`; the portable refresh copies this style into both workspace component assets and standalone HTML.

## Files changed

- Mechanical revision owner: `scripts/apply-biology30-instructional-revision.mjs`.
- Shared behavior: `scripts/lib/biology30-chapters/revision-practice.js`, `revision-activities.js`, `component-reader.js`, `components.css`.
- Portable owner: `scripts/refresh-biology30-chapter-portable.mjs`.
- Canonical and derived Chapter 12/13 HTML, native runtime, component assets and operational metadata.
- Focused checks: `scripts/tests/biology30-instructional-revision.mjs`, instructional-revision cases in `e2e/specs/science-scorm.spec.ts`.
- Review-only SCORM 2004 ZIPs in each chapter's exports folder, rebuilt through the exporter. No deployment or release promotion.

## Verification and remaining acceptance

Both chapters passed exact-copy reconciliation, retained teaching-image checks, required check IDs/counts, worked/guided placement, blank blocking, guided wrong-answer hints and corrections, immutable first transfer submission, old check/history/Frayer/note/textbook preservation, legacy feedback safety, deterministic/diverse selection, alternative retry selection, exact multi-select set comparisons, all-route language scans, representative desktop/mobile rendering, print generation, storage failure and portable offline startup. Browser assertions check bold vocabulary in prose and Key terms. Evidence: Chapter 12 metadata `instructional-revision/acceptance-browser.json`.

Actual exported SCORM packages passed two browser tests for formative work, fresh-context same-learner resume, unchanged required progress and failed-LMS-save preservation using a simulated SCORM 2004 API. This is not live Brightspace certification.

Local close-out completed: each generated kind/family was exercised with incorrect-first hint, incorrect-second reference and correct-first responses; completing/retrying preserves prior history; incomplete/duplicate ordering cannot record an attempt; vocabulary Enter/Escape restores focus; a real second tab changing storage blocks overwrite. All seven Chapter 12 and nine Chapter 13 print pages were rendered and visually inspected. The print-only stray skip link was fixed. These are scoped local checks, not universal browser/accessibility certification. Live Brightspace behavior remains deferred.

Existing labeling concerns in supplied worksheets 1, 3, 5, 7 and 8 predate this revision and remain documented separately; this close-out does not silently certify or replace them. The attached revision specifically requested inspection/correction of the ACTH stress pathway, which is completed. Mixed-practice diagram items use only inspected retinal worksheet 2 and insulin/glucagon worksheet 10, with tightly scoped labels and answer maps.

Shared workflow checks cover Biology 11/12/13 and Chemistry: native written save/reload, All My Work and print generation passed in all four (`scripts/tests/science-local-work-print.mjs`). Biology topic inventory/navigation/saved response checks passed in all three. Fresh-browser simulated LMS writing/resume, learner isolation, capacity failure and Chemistry legacy migration passed. Two actual Chapter 12/13 exported-package formative resume/failure cases passed. A race in the test was fixed by comparing failure against the most recent successful LMS save, not an older tracking envelope. The obsolete remote-photo test is explicitly skipped because the user removed Biology photo-upload controls; no remote-photo support is claimed.

Chemistry's print-only skip link and retained screen margin were also fixed in its canonical workspace stylesheet. A fresh one-page print was visually inspected and readable. No Chemistry instructional content or Chapter 11 source was changed. All four review-only SCORM ZIPs are refreshed; ZIP integrity, packaged native source byte equality and exclusion of developer specifications passed.

## Diagram correction and provenance

The supplied stress worksheet incorrectly connected ACTH to both cortisol and aldosterone, and label I's leader touched the medulla rather than cortex. The original file remains retained. The corrected file is Chapter 13 `workspace/assets/labeling/09_Stress_Responses_Fast_and_Longer_Term_corrected.png`; A–K answer identities remain unchanged. ACTH now leads to cortisol, aldosterone has separate main controls (angiotensin II and increased blood potassium), and I identifies the outer adrenal cortex. This is limited correction, not a claim that every supplied diagram is cleared.

The imagegen skill and image generation tool edited the supplied raster in two passes. Instructions were to preserve worksheet styling and labels, remove the ACTH-to-aldosterone branch, present separate aldosterone regulation, then move only I's leader to the outer cortex. Generated originals are retained at `/Users/deanguedo/.codex/generated_images/01a0a190-4f8c-74e1-9615-c2db6fa99328/exec-e4b0ac9a-c452-4c76-86e9-aef011edff92.png` and `exec-e1bb9760-1c3a-47b1-b591-4df3251d81fb.png`. Both were visually inspected before selecting the final correction. Existing teacher-reference versions were used; no `(2)` PPTX variants were found. Exact JSON wording was authoritative.

## Fragile areas and next action

Preserve native save namespaces, immutable old attempts, option IDs, required-progress rules and native SCORM save/conflict/failure protections. Vocabulary distinction is correct explanatory text; practice misconception is explicitly false text—never interchange them. Chapter 13 lesson 7's worked/guided placement must remain before its failure-analysis sections.

Next prompt assumes local implementation/close-out is complete, with live Brightspace testing deferred by the user. No deployment, learner release or authoring promotion is implied. Exact next file: `docs/plans/biology-chemistry-brightspace-scorm.md` for sandbox LMS checks. Refresh the open chapter tabs to see the local changes; no additional command is needed.
