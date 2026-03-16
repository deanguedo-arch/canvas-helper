# Task
## Goal
Execute Phase 6 for `forensics`: QA and hardening on top of the completed faithful-player, interaction, and visual passes.

## Constraints
- Keep `projects/forensics/raw/**` and `projects/resources/forensics/**` immutable.
- Work in `projects/forensics/workspace/**`, `projects/forensics/meta/**`, and minimal shared code only if a reusable parser gap is required.
- No new dependencies.
- No renames.
- No broad refactors.
- No new feature scope.
- No structural rewrites.
- No visual redesign work.

## Acceptance tests
- Existing faithful-player acceptance remains true (visibility modes + real source rendering + fallback behavior).
- Interaction layer remains additive and non-destructive (section mode + checkpoints + quiz navigation/progress).
- Visual shell remains coherent and readable after recent polish pass.
- `npm run verify -- --project forensics` passes.
- `npm run typecheck` passes.
- `npm run build:studio` passes.

## QA / Hardening Gaps
- [ ] Validate representative nodes across all major modules in learner mode and archive mode.
- [ ] Learner vs archive: verify the mode toggle works and content visibility changes accordingly.
- [ ] Hidden/admin content never appears in learner mode (HTML, assignment, quiz, PDF, page, external).
- [ ] Hidden/admin content is visible in archive mode where expected (no accidental suppression).
- [ ] Final exam and extra-credit nodes stay in correct sequence in module flow.
- [ ] HTML nodes: source-backed rendering is visible and readable (no blank panels).
- [ ] Assignment nodes: instructions, due info, and attachments (if present) render without breaking layout.
- [ ] Quiz nodes: per-question navigation works (next/prev, question list).
- [ ] Quiz nodes: answer state persists while navigating within the quiz.
- [ ] Quiz nodes: answered progress indicator reflects current state.
- [ ] Quiz nodes: question content renders (prompt + choices) without layout collapse.
- [ ] PDF nodes: preview/embedded viewer renders or falls back gracefully.
- [ ] External links / LTI nodes: render as safe link tiles without throwing errors.
- [ ] Fallback panel appears instead of blank/crash on weak/unmapped nodes.
- [ ] Section mode (expand/collapse) works on HTML sections without hiding source content.
- [ ] Quick checkpoints in Learn view render and do not disrupt content flow.
- [ ] Visual shell remains coherent after polish (spacing, hierarchy, contrast, no clipped content).
- [ ] Audit for unnecessary file churn before commit.

## Module Pass List (Representative Nodes)
Use this list to click through one representative item per module. Mark the QA checkboxes above once all rows are validated in learner and archive modes.

| Module | Node type | Item title |
| --- | --- | --- |
| Course Information | html | Disclaimer (Please Read) |
| Course Information | pdf | Course outline (MUST READ) |
| Course Information | lesson | Course Outline (Please Read) |
| 1 Introduction to Crime Scenes | html | An Introduction to the Crime Scene |
| 1 Introduction to Crime Scenes | assignment | Introduction to Crime Scenes Assignment |
| 1 Introduction to Crime Scenes | quiz | M1 Introduction to Crime Scenes Quiz |
| 2 Types of Evidence and Fingerprint Analysis | html | Types of Evidence and Fingerprint Analysis |
| 2 Types of Evidence and Fingerprint Analysis | assignment | Types of Evidence and Fingerprint Analysis Assignment |
| 2 Types of Evidence and Fingerprint Analysis | quiz | M2 Types of Evidence and Fingerprint Analysis Assessment |
| 3 Trace Evidence | html | What is Trace Evidence? |
| 3 Trace Evidence | assignment | Trace Evidence Assignment |
| 3 Trace Evidence | quiz | M3 Trace Evidence Assessment |
| 4 Body Fluid Evidence | html | Body Fluid Evidence |
| 4 Body Fluid Evidence | assignment | Body Fluid Assignment |
| 4 Body Fluid Evidence | quiz | M4 Body Fluid Evidence Assessment |
| 5 Forensic Detection of Impaired Driving | html | Forensic Detection of Impaired Driving |
| 5 Forensic Detection of Impaired Driving | assignment | Impaired Driving Assignment |
| 5 Forensic Detection of Impaired Driving | quiz | M5 Impaired Driving and Alcohol Assessment |
| 6 Polygraphing and Document Analysis | html | Polygraph Testing & Forensic Document Analysis |
| 6 Polygraphing and Document Analysis | assignment | Polygraphing and Forensic Writing Analysis Assignment |
| 6 Polygraphing and Document Analysis | quiz | M6 The Polygraph and Writing Analysis Assessment |
| 7 Forensic Genetics | html | Forensic Genetics |
| 7 Forensic Genetics | assignment | Forensic DNA Evidence Assignment |
| 7 Forensic Genetics | quiz | M7 Forensic Genetics Assessment |
| 8 Careers in Forensic Science | assignment | Careers in Forensic Science Assignment |
| 8 Careers in Forensic Science | lesson | Careers in Forensic Science |
| FINAL EXAM | quiz | Final Exam |
| FINAL EXAM | lesson | Final Exam Instructions |
| Extra Credits | quiz | Student Centred Learning Self Reflection |
| Teacher Resources (KEEP HIDDEN) | pdf | Forensic Science 25 Answer Keys |

## Expected files to change
- `tasks/active.md`
- `projects/forensics/workspace/**`
- optional minimal shared parser files if required by a reusable gap

## Commands
- `npm run verify -- --project forensics`
- `npm run typecheck`
- `npm run build:studio`
