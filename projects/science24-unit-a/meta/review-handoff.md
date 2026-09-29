# Science 24 Unit A review handoff

## Teacher figure comments, 2026-09-24

Lessons 1, 2 and 5 now use the revised visual treatment described in `figure-refinement-review.md`. The current affected-file hashes and desktop/phone evidence are in `figure-refinement-review.json`. The Lesson 1 polymer figure remains enlargeable; Lesson 2 compares official HHPS and WHMIS flame symbols; Lesson 5 no longer shows a duplicate energy schematic. The previous CBE and broad verification reports name earlier candidates. Unit A remains blocked for teacher review.

## CBE supplement, 2026-09-24

The later CBE System Science 24 source pass is recorded separately in `cbe-source-pass.md`. It added an original, source-informed scrubber pathway to Lesson 13 without changing checks or saved-work IDs. `cbe-integration-review.json` holds the current affected-file hashes and focused desktop/phone evidence. The broader review in `review-verification.json` predates this addition and must not be presented as verification of this exact candidate. Unit A remains blocked for teacher review.

## Summary
A blocked, local Canvas Helper Unit A review project now owns the imported v5 learner draft. Biology 30 Pilot 3 is the presentation and interaction reference. Textbook Practice, Core Vocabulary and video cards received focused layout and reading improvements. No Unit B–D work, export, deployment or LMS upload occurred.

## Files changed
`projects/science24-unit-a/workspace/**`, `projects/science24-unit-a/meta/**`, `projects/resources/science24-unit-a/**`, and `scripts/tests/science24-unit-a-review.cjs`. The Brightspace ZIP and v5 source ZIP were copied under checksum names; their original Downloads files were not changed.

## Verification run
`npm run verify -- --project science24-unit-a --mode workspace` passed. `node scripts/tests/science24-unit-a-review.cjs` passed 28 routes at desktop, tablet and phone widths, real IndexedDB textbook and Frayer save/reload, the question dialog and all eight offline video fallbacks. Source PDF hashes, question page links and learner-asset assessment exclusions passed. `course:doctor` returned only the expected `not-active` refusal. Repository-wide `validate:manifests` validated Science 24 but remains failed on existing Sports Wellness Phase 2–4 metadata. Exact file and tree hashes are in `review-verification.json`.

## Known risks / follow-up
The original Brightspace Learning Guide says students use the visible Unit A workbook key for self-check. This candidate restores the exact key PDF after workbook completion; the teacher should review its placement. The original Unit A Quiz and hidden Test remain LMS-owned; the Defence Evidence Dropbox and workbook Google Doc sharing remain LMS workflows. External video availability, exhaustive textbook-question coverage, Alberta outcome-code completeness, Studio lifecycle, SCORM and Brightspace reporting are not certified. Teacher review must bind to the exact workspace hash before activation or B–D adaptation.

## Source of truth
Canonical learner files are `workspace/index.html`, `styles.css`, `unit-a.css`, `course-data.js`, `main.js`, `state-store.js`, `asset-loader.js`, and assets. `project.json` declares the direct workspace driver, blocked status, disabled Studio Edit and disabled exports. `source-review.json` maps the generated lesson and assessment inventory against the Brightspace export. `meta/imported-authoring/**` and the source ZIPs are evidence only.

## Fragile areas / what might drift
Keep `s24-a-*` IDs, printed-to-physical textbook page mapping, the `S24_DATA` shape, IndexedDB schema/namespace, saved-response semantics, and optional-video progress isolation. The bundled portable HTML still represents the original v5 draft; edit the canonical workspace for this project. The review preview uses a local HTTP origin, so browser storage from a prior `file://` opening is not automatically present.

## Next prompt assumptions
The user selected a Canvas Helper project, with Biology 30 Pilot 3 as the reference. Unit A comes first; Units B–D require their own sources and teacher-reviewed Unit A pattern. Route used: Sol lead for source/assessment screening, integration, UI and acceptance. No Luna or Muse call, cache metric or measured usage saving is claimed.

## Exact next action
Review the local Unit A preview, review the restored workbook self-check key and record the exact-build teacher findings. Then fix any findings and run the applicable Studio/readiness checks before changing blocked status or producing a package.

## Exact next file to open
`projects/science24-unit-a/meta/source-review.json` for source decisions; `projects/science24-unit-a/workspace/index.html` for the learner candidate.
