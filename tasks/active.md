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

## E2E requirement
Required

## E2E command
`npm run test:e2e:project -- --project forensics`

## E2E trigger
This task touches learner/archive visibility, module navigation, quiz progress/state, and fallback behavior.

## Completion gate
Task is not complete unless the required E2E command passes.

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

## Phase 6 Execution Checklist
### Phase 6A — QA / hardening
- [ ] Run learner-mode pass across representative module list.
- [ ] Run archive-mode pass across representative module list.
- [ ] Confirm hidden/admin nodes are excluded from learner mode.
- [ ] Confirm hidden/admin nodes are available in archive mode.
- [ ] Confirm fallback panel renders for weak/unmapped nodes.
- [ ] Confirm quiz navigation, state persistence, and progress indicators.
- [ ] Confirm assignment + PDF + external node rendering behavior.
- [ ] Confirm final exam and extra-credit ordering.
- [ ] Run: `npm run verify -- --project forensics`
- [ ] Run: `npm run typecheck`
- [ ] Run: `npm run build:studio`

### Phase 6B — productionization / residue purge
- [x] Produce residue audit at `projects/forensics/meta/residue-audit.md`.
- [x] Remove learner-facing phase/prototype/build language from workspace UI.
- [x] Replace placeholder page title and temporary learner-visible naming.
- [x] Keep required fallback/support scaffolding where removal would regress behavior.
- [x] Isolate or remove any dev-only scaffolding that leaks into learner-facing views.
- [x] Re-run Phase 6A command floor after residue cleanup.

### Phase 7 (optional) — release candidate validation
- [ ] Optional ship/no-ship review for export naming, packaging, and final acceptance.

## Next Plan — High-Confidence Suite (1-2 days)
Goal: expand from contract smoke checks to full module-pass confidence with stronger assertions and deterministic fixtures.

### Day 1 scope
- [ ] Add missing stable `data-testid` hooks for in-player navigation, quiz controls/progress, section containers, and source fallback states.
- [ ] Extend project contract schema with optional module-pass targets and assertion profiles.
- [ ] Add one reusable deep-contract spec that can iterate a declared module pass list and assert no runtime regressions.
- [ ] Add richer forensics contract coverage for representative module rows (HTML, assignment, quiz, PDF, external, hidden/admin).

### Day 2 scope
- [ ] Add deterministic fixture content that exercises mode switching, quiz interactions, fallback rendering, and sequencing assertions.
- [ ] Add stronger assertions for learner/archive visibility behavior and hidden/admin filtering.
- [ ] Add stronger quiz assertions (per-question navigation, answer persistence, progress indicator changes).
- [ ] Add fallback and source-render assertions for weak/unmapped node handling.
- [ ] Run full verify floor plus e2e smoke + project suite and document residual gaps.

### Deliverables
- [ ] Expanded e2e contracts + schema
- [ ] Deep reusable spec(s) for module-pass checks
- [ ] Fixture updates for deterministic high-confidence checks
- [ ] Updated docs for when to run smoke vs contract vs deep suite

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
