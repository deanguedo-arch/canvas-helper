# Biology 30 audit correction candidate — 2026-09-17

## Outcome and scope

Implemented the immediate corrections from the supplied ChatGPT Pro audit. Retained all 35 Chapter 12 and 51 Chapter 13 exact teaching replacements and the established worked → guided → transfer progression. No broad prose rewrite, Chemistry edits, deployment, commit, release promotion or live Brightspace certification.

## Assessment corrections

- All 40 guided selections and six transfer MC items now have deterministic build-balanced answer positions. Returning to a page or reloading does not reshuffle them. Balance is calculated separately for two-, three- and four-option questions.
- Chapter 12 guided counts by answer position: two-option items `[1,1]`; three-option items `[4,5,5]`. Chapter 13: `[2,2]` and `[6,7,7]`. Transfer counts: Chapter 12 `[1,1,0,1]`; Chapter 13 `[1,0,1,1]`. Three transfer questions cannot fill four positions equally.
- Replaced the six weak transfer distractor sets with studied mechanism contrasts: retinal transmission stages; a confounded pressure/body-region comparison; cupula versus otolith and cochlear membranes; reduced TRH/TSH/thyroxine signalling; sodium reabsorption versus water permeability; and insulin secretion versus target sensitivity.
- Question IDs, correct answer values, prompts, feedback and written-response criteria remain unchanged. Existing selections use answer text identities, not numeric option positions. Old transfer distractors remain in a compatibility list: a previously saved selection appears as “Earlier saved choice.” Old submission text, score, timestamp and first-submission evidence are not recalculated or overwritten.
- Optional guided, transfer and textbook work remain separate from required chapter-check progress.

## Worksheet corrections and provenance

Original supplied PNGs remain available. The active configuration selects these versioned siblings:

| Chapter | Corrected asset under `workspace/assets/labeling/` | Audited correction |
| --- | --- | --- |
| 12 | `01_Human_Eye_Anatomy_Worksheet_corrected.png` | C distinctly on iris; K at retinal optic-nerve exit rather than the foveal depression. |
| 12 | `03_Human_Ear_and_Organ_of_Corti_corrected.png` | S moved from enlarged inset wall to membrane-covered cochlear-base opening below the oval window; H on coiled cochlea. |
| 13 | `05_Principal_Endocrine_Glands_corrected.png` | D on pink thyroid tissue and E on yellow parathyroid nodules, including inset and both figures. |
| 13 | `07_ADH_and_Water_Balance_corrected.png` | Blue arrows outward from lumen toward blood; lumen and blood sides named; upper D/E boxes identified; G points to duct wall rather than lumen. |
| 13 | `08_Thyroxine_Negative_Feedback_corrected.png` | Anterior/posterior lobes explicit; C on orange anterior tissue; TRH input/TSH output use anterior lobe; inhibitory arrows target hypothalamus and anterior pituitary. |

All five selected outputs were inspected at full image size for the listed endpoints/arrow direction and letter preservation. Ear, ADH and thyroid needed a second, more precise edit before selection. This is a local review of the recorded audit targets, not blanket certification of every detail in AI-assisted anatomical artwork or independent teacher acceptance. Existing diagram IDs and answer strings are retained. The previously corrected stress worksheet 9 remains active and unchanged.

The built-in imagegen editing tool was used on the supplied worksheet images, rather than sending the course to the opened ChatGPT browser tab. Exact initial/follow-up prompts, generated source paths, final destination paths and tool mode are recorded in `projects/biology30-chapter-12/meta/instructional-revision/audit-image-edits.json`. Imagegen influenced only the five listed raster assets; existing course styling was preserved.

The detailed ear legend explicitly teaches scala vestibuli (upper vestibular canal), scala media (middle cochlear duct) and scala tympani (lower tympanic canal), fluid distinctions and round-window location. It appears as a separate Chapter 12 lesson 5 teaching block and collapsible diagram caption, leaving exact teaching paragraphs untouched. Anatomy was cross-checked against [OpenStax hearing and vestibular sensation](https://openstax.org/books/biology-2e/pages/36-4-hearing-and-vestibular-sensation), [OpenStax acoustic information](https://openstax.org/books/introduction-behavioral-neuroscience/pages/7-2-how-does-acoustic-information-enter-the-brain) and the [National Eye Institute eye summary](https://www.nei.nih.gov/sites/default/files/nei-pdfs/nei_executive-summary.pdf). ADH-mediated collecting-duct water transport is supported by [the aquaporin physiology review](https://pmc.ncbi.nlm.nih.gov/articles/PMC2781343/).

## Chapter 11 instruction-only alignment

Overview, teaching-lesson guides and optional embedded-reading wording now use lesson → practice → required check → finish. The lesson teaches directly; textbook reading supports rather than gates starting. The instruction owner checks that embedded JSON data is unchanged. Teaching explanations, question IDs, catalog, runtime, save ownership and required final-check breadth were not rewritten. Broadening Chapter 11's final check and expanding thin practice families remain separate future work, as recommended by the audit.

## Sources, owners and files changed

- Canonical Chapter 11: `projects/biology30-unit-a-pilot-3/workspace/index.html`; narrow repeatable instruction owner `scripts/align-biology30-ch11-instructions.mjs`. Do not rerun the old Chapter 11 builder.
- Canonical Chapters 12/13: their `workspace/index.html`, `main.js` and five corrected PNG siblings. Shared source `scripts/lib/biology30-chapters/revision-activities.js`; build-time correction overlay `audit-corrections.mjs`.
- Revision owner `scripts/apply-biology30-instructional-revision.mjs` applies the original specifications followed by this correction overlay. The original JSON specifications remain unchanged. The owner fails if a corrected image is absent.
- `scripts/refresh-biology30-chapter-portable.mjs` refreshed the derived helper copies and self-contained `Biology30_Chapter12.html` / `Biology30_Chapter13.html`, including corrected images offline.
- Chapter metadata declares the new build owner. Labeling review records retain original concerns as provenance and distinguish local audit-target corrections from teacher acceptance. This report supersedes the older candidate report's statement that these five targets remain unresolved.
- New compatibility/position checks: `scripts/tests/biology30-audit-corrections.mjs`.

## Verification run

- `node scripts/tests/biology30-audit-corrections.mjs`: both chapters passed actual HTML option-order/balance assertions, corrected-asset existence and browser restoration of a replaced old distractor; first submission remains immutable after later correct work.
- `node scripts/tests/biology30-instructional-revision.mjs`: both chapters passed exact content, supported/independent feedback, required IDs/progress, retained teaching figures, native legacy state, generated practice branches, storage/conflict protections, display/print generation and portable offline checks. Chapter 13 lesson 7 worked/guided placement remains before failure analysis.
- Five full-size selected image outputs inspected; representative ear/thyroid panels inspected at desktop/390px widths. The existing Larger diagram control remains available for small-screen detail. Two preliminary screenshot scripts used incorrect selectors and timed out; corrected selector captures completed, not treated as course defects.
- All three Biology review-only SCORM 2004 ZIPs refreshed through the exporter; ZIP integrity checks passed. Production export approval/status remains unchanged.
- Two exported Chapter 12/13 formative-work SCORM browser cases passed simulated same-learner resume, unchanged required progress and failed-LMS-save preservation. Not live Brightspace evidence. Chapter 11 runtime was not changed or newly certified.

## Risks, deferred checks and next action

Local audit corrections are complete. Teacher review of corrected scientific artwork and real Brightspace save/resume/completion/time testing remain necessary before learner release. Comprehensive Studio readiness, universal accessibility/responsiveness and unrelated browser suites were not rerun. Browser-local photo records are not claimed to be portable LMS attachments; upload controls remain removed. The earlier audit ZIP is a historical snapshot and was not silently overwritten.

Preserve native namespaces, answer identities, immutable old attempts, required-progress rules, SCORM save/conflict/failure protections and Chapter 13 lesson 7 sequence. Do not interchange correct vocabulary distinctions with false misconception statements.

Next prompt assumes no further broad rewrite. Exact next action: test the refreshed review candidate in a Brightspace sandbox when requested. Exact next file: `docs/plans/biology-chemistry-brightspace-scorm.md`.
