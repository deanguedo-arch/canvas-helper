# Chapter 17 remaining teaching integration handoff

## 1. Summary

Integrated all supplied lesson 08–15 teaching and the optional extension into a separate complete Chapter 17 comparison. Signed-off lessons 01–07 are byte-for-byte unchanged. This is a review candidate, not canonical integration or release.

Comparison: http://127.0.0.1:57250/?lesson=08
Full new chapter: http://127.0.0.1:57252/index.html#lesson-08
Previous full owner: http://127.0.0.1:57251/index.html#lesson-08

## 2. Files changed

New assembly and range-capable local preview scripts: scripts/build-biology30-ch17-remaining-comparison.mjs and scripts/serve-biology30-ch17-remaining-comparison.mjs.
New review root: projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer/teacher-led-remaining-08-15-extension-v0.1.0/.
Immutable pro-return intake, evaluation/baseline, evaluation/new, original source viewer, preservation report, browser-checks.json and screenshots. No workspace, raw, release exports or existing review files changed.
An incomplete first source-viewer build is retained recoverably in the sibling teacher-led-remaining-08-15-extension-v0.1.0-incomplete-source-viewer directory; it is not the delivered candidate.

## 3. Verification run

Verified all 183 manifest payloads and checksums from the user-supplied extracted folder. The original ZIP was absent, so archive SHA/CRC were not verified.
Rebased exact complete-route matches from frozen source 31447f72550c68ceb4a7cfd444f85651908a86782096dff4e4847cff4ab9e3e4 onto signed-off current owner 480d60d752d717b9d947098695b043bf85776dff4fcb796725a6506c298f7262.
Candidate SHA: 1ac7a2f934cdd2a5373f75d567abe01f7a512fc52e1c766320b46c58afc5e46a.
Reversing all nine teaching substitutions reproduces the exact owner. All 837 protected source files, 167 native non-index files, course JSON, IDs/control attributes, locked figures, CSS and runtime unchanged. Source picture hashes checked against original PPTX members; PDF crop hash checked against supplied manifest.
Final script syntax checks and candidate/baseline/protected hashes passed. Scoped git diff --check passed for tracked differences; scripts are new untracked files.
Focused browser results and limits are recorded in evaluation/browser-checks.json. Only synthetic QA origin 57253 received test answers. Review origin 57252 remains free of synthetic answers.

## 4. Known risks / follow-up

Embedded textbook PDF controls/page mappings work, but PDF pixels were blank in the in-app browser. Deep-scroll mobile screenshot capture was unreliable; representative mobile header and all-route overflow checks passed, not complete mobile visual certification.
One unattributed MutationObserver error appeared during comparison navigation; no matching observer in wrapper/context source and route selection worked. Candidate and QA console error collections were empty.
Full keyboard accessibility/table scrolling, native transfer-set submission, legacy save imports/conflicts, print/PDF, backup, external media, SCORM and Brightspace remain unverified.
Preserved old assessment/source wording issues remain in pro-return/OPEN_ISSUES.md; this teaching-only integration does not authorize changing immutable questions or keys. All 8–15/extension teacher acceptance is pending.

## 5. Source-of-truth location

Canonical course remains projects/biology30-chapter-17/workspace/index.html and its existing ownership metadata; it has not been replaced.
This review is assembled from the unchanged latest signed-off 1–7 owner and complete reviewed fragments in pro-return/patches, with exact boundaries in pro-return/INTEGRATION_MAP.json.
Do not run the immutable builder against the same existing version; create a new review version if assembly changes.

## 6. Fragile areas / what might drift

Keep native namespaces, attempt history, assessment keys/option IDs, guided/transfer and note controls, progress rules and reader relationships unchanged. No review answers may be migrated automatically.
Source PowerPoint retains historical wording/errors; actual media relationships were restored from PPTX. Lessons 14 and extension have honest no-dedicated-PowerPoint notices and textbook source links.
Incoming offsets belong to older frozen owner, not current signed-off 1–7. Never paste the older full HTML over the new candidate.
The existing visual system was preserved under uncodixfy; no new visual direction or content-shortening quota was introduced.

## 7. Next prompt assumptions

Dean has approved 1–7 only. Remaining teaching is available for review, not accepted by automated checks or by the supplied independent author reviews.
No new ChatGPT authoring, packaging, deployment or canonical promotion has been performed.
Routing: deterministic intake/assembly plus lead source/state compatibility and bounded browser verification. Dirty-boundary work retained by lead; no worker/provider-cache calls. Usage savings unknown.

## 8. Exact next action

Dean reviews the comparison selector for 08–15 and Optional extension and gives explicit acceptance or targeted edits.
The local server is running. If it has stopped, run node scripts/serve-biology30-ch17-remaining-comparison.mjs from the repository root. No restart is needed now.

## 9. Exact next file to open

/Users/deanguedo/Documents/GitHub/canvas-helper/projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer/teacher-led-remaining-08-15-extension-v0.1.0/evaluation/index.html
