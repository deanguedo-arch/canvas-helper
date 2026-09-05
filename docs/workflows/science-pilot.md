# Workflow: Science Course Pilot

Use this workflow when starting a Science course that should share Canvas Helper's reliable navigation, accessibility, persistence, and export foundations without forcing an English or Social activity system onto different subject matter.

This starts with one real source-backed unit. It does **not** create a generic Science factory or a full learner course on day one.

## Intake

Supply the real source archives once:

```bash
npm run intake:science-pilot -- \
  --project science20-pilot \
  --course-code "SCI 20" \
  --title "Science 20" \
  --mode conversion \
  --brightspace-zip "/absolute/path/to/brightspace.zip" \
  --teacher-resources-zip "/absolute/path/to/teacher-resources.zip"
```

The intake command:

- copies each supplied ZIP into `projects/resources/<slug>/_sources/` under its SHA-256 filename;
- records named source IDs in `resource-manifest.json` and `meta/project.json`;
- creates `meta/science-pilot.json`, `meta/prompt-pack.md`, and `meta/decision-log.md`;
- creates no `workspace/index.html`, no export, and no generic builder;
- marks the project `blocked` / `proposal-only-v1` until the representative unit is approved.

It refuses to overwrite an existing project or resource library. Use an explicit follow-up migration rather than rerunning intake over work that already exists.

## Five-Version Source Comparison

Use the transactional comparison intake when two Brightspace sources must be reviewed both independently and together before choosing a course direction:

```bash
npm run intake:science-comparison -- \
  --family biology30-unit-a-pilot \
  --course-code "BIO 30" \
  --title "Biology 30 Unit A" \
  --unit-title "Unit A" \
  --primary-id class-2026-27 \
  --primary-label "2026-27 class course" \
  --primary-zip "/absolute/path/to/class-course.zip" \
  --reference-id system-2020 \
  --reference-label "CBE system course (2020)" \
  --reference-zip "/absolute/path/to/system-course.zip" \
  --treatments "faithful,optimized" \
  --synthesis "outcome-led"
```

The command stores each checksum-addressed archive once, writes a versioned comparison contract, and transactionally creates exactly five blocked Studio projects: faithful and optimized versions of each source plus one outcome-led synthesis. It refuses existing targets and rolls back all five targets if any promotion or validation step fails.

For the Biology 30 Unit A pilot, build the comparison with:

```bash
npm run build:biology30-unit-a-pilots -- --family biology30-unit-a-pilot
```

The Biology-specific builder parses Brightspace visibility, descriptions, QTI practice, resource paths, local files, and UTF-16 system HTML. It keeps single-source versions isolated, excludes hidden tests and teacher-only assessment material, and produces source, outcome, provenance, disposition, asset/link, and notes-content reports before committing any generated workspace.

The verified 139-page Unit A notes PDF is lesson content, not a learner-facing slide dependency. The builder:

- maps all 139 unique PDF pages into the class-derived lessons;
- recreates headings, paragraphs, lists, comparisons, and callouts as native semantic HTML;
- uses source-specific verified recreations for complex tables and diagrams and records those page numbers in `meta/notes-content-report.json`;
- keeps each original PDF page behind a closed `View original source slide` comparison control;
- preserves the full local PDF as a fallback reference only.

All five projects remain `blocked` under `proposal-only-v1`; Edit and export stay disabled while Annotation and the 100-point review matrix are available. Human selection is required. Do not promote, freeze, or export a winner during the comparison build.

Verification for this comparison boundary:

```bash
npm run test:science-comparison
npm run validate:manifests
npm run verify:typecheck-baseline
npm run build:studio
npm run test:e2e:project -- --project <one-of-the-five-slugs>
```

## Biology 30 Unit A Improvement Pilot

`biology30-unit-a-pilot` is a separate blocked, preview-only, Direct-authored sandbox copied from the Unit A production candidate. Its canonical learner source is `projects/biology30-unit-a-pilot/workspace/index.html`; the protected `raw/**` snapshot and production Units A-D must not be changed by pilot work.

Read `projects/biology30-unit-a-pilot/meta/unit-a-to-bcd-improvement-playbook.md` before continuing the pilot or planning any B-D adaptation. It is the living chronological record and minute operating runbook for source intake, textbook/review integration, Canvas Helper annotation cycles, PowerPoint/video processing, source-image selection, ChatGPT Images prompting and correction, Core Vocabulary and Frayer evidence, accessible placement, persistence, exact-build evidence, approval, rollback, and transfer. The playbook does not authorize a B-D change: only explicitly teacher-accepted rules may enter a separate unit-specific gap audit and builder-owned implementation.

Prepare the approved local textbook and historical seminar resources with:

```bash
npm run prepare:biology30-unit-a-pilot:textbook -- \
  --project biology30-unit-a-pilot
```

The command verifies the two immutable Brightspace archive hashes, strips the 128-byte wrappers from CBE Chapters 11-13, validates the 44/30/38 page counts and text extraction, copies the approved 35-page learner seminar source, and commits only the staged asset directories plus `meta/textbook-resource-report.json`. It is idempotent, refuses source drift, excludes secure assessment material, and never rewrites the canonical HTML.

Prepare and inventory the three Unit A PowerPoints with:

```bash
npm run prepare:biology30-unit-a-pilot:media -- \
  --project biology30-unit-a-pilot \
  --chapter-11-pptx "<Unit A Chapter 11 Notes.pptx>" \
  --chapter-12-pptx "<Unit A Chapter 12 Notes.pptx>" \
  --chapter-13-pptx "<Unit A Chapter 13 Notes.pptx>" \
  --check-video-links
```

The transactional command verifies all three immutable hashes, accounts for 138 slides, 152 embedded assets, 45 YouTube references, and three other links, and writes only content-addressed source copies, extracted authoring references, `meta/media-integration.json`, and `meta/media-resource-report.json`. It never rewrites canonical HTML. Learner delivery must use selective rights-cleared source media or corrected semantic redraws, never slide screenshots. The approved pilot inventory places 12 primary videos beside exact lesson concepts and all 35 available, curriculum-relevant videos in a chapter-and-lesson-sorted Video Library; ten unavailable, lower-authority, self-help, study-skills, or out-of-scope links remain excluded. Optional videos use privacy-enhanced previews that load only when their lesson or selected Video Library entry becomes visible, never autoplay, keep hidden entries unloaded, and retain exact lesson mappings, watch-for prompts, and complete local fallback summaries.

Prepare the approved nine-image source-visual trial with:

```bash
npm run prepare:biology30-unit-a-pilot:visuals -- \
  --project biology30-unit-a-pilot
```

`meta/source-visual-integration.json` is the canonical source-selection and rights contract. The command verifies the stored chapter PDFs and PowerPoint decks, extracts or crops only the nine exact contracted visuals, validates their hashes and dimensions, and transactionally replaces only `workspace/assets/source-visuals/**` plus `meta/source-visual-resource-report.json`. The learner page remains directly authored. Six source plates replace exact redundant static figures; three distinct images remain supplemental. All non-duplicated semantic figures and interactions remain in place. Each source image has responsive intrinsic sizing, concise alt text, a nearby explanatory description, keyboard-operable enlargement, and an exact textbook-page link. A visual with unresolved embedded-image origin remains pilot-only and is a release blocker until redrawn or cleared.

`meta/textbook-integration.json` owns the exact source IDs, checksums, printed-to-physical page map, the 16 lesson crosswalks for Lessons 1-16, the 51 guided-practice and 24 Final Practice feedback-page mappings, answer-source mappings, review destinations, corrections, and exclusions. Lesson 17 deliberately has no textbook band because its chapter-summary and textbook-unit-review work already lives in the dedicated review routes. It is the required capstone under Lessons > Integration and Mastery; the separate Review group contains optional study routes only. Revealed feedback opens the exact local chapter page and distinguishes direct textbook support from the closest available support when the course corrects or extends the older source. Module checks do not receive these links. The learner Library contains exactly three local chapter PDFs. Textbook and review attempts use pilot-namespaced persistence but never affect the 17 required lesson exits, seven artifact drafts, 1,505 required minutes, practice score, or completion. `Final Practice` is the learner-facing name; its existing 24-question scoring and completion behavior remains unchanged.

Learner-facing practice ordinals must begin at 1 within each practice list. Treat display numbering separately from stable internal practice IDs, response names, persistence keys, answer mappings, scores, and completion rules.

Run exact-workspace visual QA with:

```bash
npm run audit:biology30-unit-a-improvement-pilot:visual
```

The audit renders all 31 learner routes at 1440x900, 1024x768, and 390x844, plus every textbook band and retrieval response, representative checked-answer textbook links from Guided Practice and Final Practice, all 12 primary lesson-video surfaces, all nine source visuals, and all 35 Video Library states at desktop and mobile widths. Open every reported contact sheet before handoff. Record the exact workspace/report hashes and manual result in `meta/improvement-ledger.json`; all rules remain `awaiting-explicit-user-review` until the user accepts them. No rule transfers automatically to Units B-D.

Verification:

```bash
npm run test:biology30-unit-a-improvement-pilot
npm run test:biology30-unit-a-media-pilot
npm run verify -- --project biology30-unit-a-pilot --mode workspace
npm run test:e2e:project -- --project biology30-unit-a-pilot
npm run test:e2e:biology30-unit-a-improvement-pilot
npm run course:doctor -- --project biology30-unit-a-pilot
```

`course:doctor` must refuse only with `not-active`; the pilot deliberately remains blocked, Studio Edit disabled, and non-exportable.

## Biology 30 Unit A Student-Ready Pilot 2

`biology30-unit-a-pilot-2` is a separate, blocked comparison project. It does not replace or mutate `biology30-unit-a-pilot`. The teacher daily plans and Chapter 11-13 PowerPoints control topic order; Alberta curriculum and performance standards control required content and the acceptable-standard versus optional-advanced boundary.

Create it transactionally only from the recorded Pilot 1 learner hash:

```bash
npm run create:biology30-unit-a-pilot-2 -- \
  --source biology30-unit-a-pilot \
  --project biology30-unit-a-pilot-2 \
  --source-workspace-sha b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee
```

The command refuses an existing target or source drift, keeps the Pilot 1 HTML as an immutable raw baseline, stores content-addressed teacher-plan references, namespaces learner state, creates explicit route/response maps, validates Gate 0 contracts, and promotes only a complete staged project. The source of truth is `projects/biology30-unit-a-pilot-2/workspace/index.html`; its owner is `scripts/lib/biology30-unit-a-pilot-2/`.

The exact Gate 1 slice contains Lessons 1, 3, and 13, Chapter 11 Practice, Process Collection, learned-so-far Core Vocabulary, and representative textbook, video, model, glossary, and source routes. Gate 1 was explicitly accepted at workspace SHA-256 `8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe`; the immutable acceptance record is `projects/biology30-unit-a-pilot-2/meta/gate-1-review.json`.

Gate 2 is built transactionally from that accepted checkpoint:

```bash
npm run build:biology30-unit-a-pilot-2 -- \
  --project biology30-unit-a-pilot-2 \
  --accepted-gate-1-sha 8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe
```

The complete candidate has 13 lessons, three chapter practices, Review Seminar, Final Practice, 80 required questions, six optional Diploma Challenge questions, three optional investigations, and all five resource routes. A pending Gate 2 may be rebuilt only when its current workspace still matches its recorded pending-review hash. Once Gate 2 is teacher-accepted, the builder must refuse further replacement.

Verification:

```bash
npm run test:biology30-unit-a-pilot-2
npm run audit:biology30-unit-a-pilot-2:visual
npm run verify -- --project biology30-unit-a-pilot-2 --mode workspace
npm run test:e2e:project -- --project biology30-unit-a-pilot-2
npm run test:e2e:biology30-unit-a-pilot-2
npm run course:doctor -- --project biology30-unit-a-pilot-2
```

Open every exact-build contact sheet. `course:doctor` may refuse only with the intentional `not-active` diagnostic. Do not deploy, export, promote, enable Studio editing, commit, push, or transfer Pilot 2 rules to B-D without separate authorization.

## Biology 30 Unit A Production V2

Production V2 is a clean, staged Biology-specific rebuild. It does not repair, rename, or rebuild the five historical comparison projects, and it does not introduce a generic Science factory. The immutable archives remain shared under `projects/resources/biology30-unit-a-pilot/_sources/`.

Gate 0 is created once with:

```bash
npm run intake:biology30-unit-a-v2 -- \
  --family biology30-unit-a-pilot \
  --project biology30-unit-a
```

The command verifies both Brightspace hashes and both origins of the byte-identical 139-page notes PDF, parses the real class and UTF-16 system sources, records all five pilot tree hashes, and transactionally creates:

- `projects/resources/biology30-unit-a-pilot/v2/production-contract.json`;
- exact JSON/Markdown curriculum maps;
- a normalized Brightspace source catalogue and source/rights register;
- all 139 page dispositions;
- factual-correction and content-gap ledgers;
- `projects/biology30-unit-a/` as a minimal blocked Studio review shell.

The target must not already exist. There is no overwrite flag. If validation or either final rename fails, both staged roots are removed and no partial V2 target remains. The command never invokes `build:biology30-unit-a-pilots`.

Gate 0 review is tied to the exact contract SHA-256 in `gate-0-review.json`. Approval covers the official outcome wording, teach/practice/evidence routes, 17-lesson sequence, 1,505 required minutes, page dispositions, and correction/supplementation strategy. It authorizes only the Gate 1 vertical slice; it does not authorize full production, Direct editing, a commit, promotion, SCORM export, or Brightspace upload.

Verification for the Gate 0 boundary:

```bash
npm run test:biology30-unit-a-v2
npm run test:science-comparison
npm run validate:manifests
npm run verify:typecheck-baseline
npm run build:studio
```

Do not start lesson rendering until `production-contract.json` passes strict validation and the user explicitly approves Gate 0. Gate 1 is limited to Overview, Lessons 4 and 15, shared visual/persistence foundations, and the three support-hub skeletons; pause again for approval of the exact visual build hash.

After Gate 0 approval, build the vertical slice with:

```bash
npm run build:biology30-unit-a-v2 -- \
  --project biology30-unit-a \
  --strict
```

The builder verifies the approved contract, immutable source hashes, and preserved pilot tree hashes before staging a complete replacement candidate. It refuses a frozen, promoted, or already accepted candidate; validation failure removes the stage and leaves the previous valid workspace intact. Gate 1 emits the exact workspace hash plus provenance, assets, interactions, practice, content density, static accessibility, persistence-budget, source-verification, and E2E review records.

Gate 1 remains `blocked` / `proposal-only-v1`. Edit and export stay disabled. Human approval must name the exact `gate-1-review.json` build SHA-256 and authorizes Gate 2 full-course production only. Any substantive rebuild invalidates the earlier visual approval. Do not infer approval from test results or a review score.

Verification for the Gate 1 boundary:

```bash
npm run test:biology30-unit-a-v2
npm run test:course-shell
npm run test:e2e:biology30-unit-a-v2
npm run test:e2e:project -- --project biology30-unit-a
npm run test:e2e:smoke
npm run test:science-comparison
npm run validate:manifests
npm run verify:typecheck-baseline
npm run build:studio
```

After the user explicitly approves the exact Gate 1 build, the same strict build command may produce the full Gate 2 candidate. Gate 2 must contain exactly 17 lessons and 23 learner routes, all 25 outcomes with teach/practice/evidence coverage, 1,505 required minutes, 295 optional minutes, seven artifacts, at least 100 unique practice items, and the complete local figure/interaction inventory. Canonical content remains under `projects/resources/biology30-unit-a-pilot/v2/`; never hand-edit the generated workspace.

Gate 3 reviews the exact full-course build and emits:

- `meta/gate-3-acceptance-matrix.json` for human scoring;
- `meta/gate-3-automated-review.json` for final command evidence;
- `meta/gate-3-visual-review.json` for figure, screenshot, viewport, and accessibility evidence;
- `meta/gate-3-figure-audit.json` for exact-build geometry findings and contact-sheet hashes;
- `meta/gate-3-figure-visual-inspection.json` for the reviewer record proving every contact sheet and unique figure ID was inspected.

Route-top screenshots do not count as complete figure review. After every substantive content or style rebuild, run:

```bash
npm run audit:biology30-unit-a-v2:figures -- --project biology30-unit-a
```

The audit renders all figure placements inside the real learner route at 1440×900, 1024×768, and 390×844. It fails on text overlap, clipping, undersized mobile labels, connector-label collisions for marked connectors, page overflow, or an invalid mobile evidence lane. It also produces desktop contact sheets under `.runtime/biology30-unit-a-v2-figure-audit/`. Codex or the human reviewer must open every listed contact sheet and inspect hierarchy, spacing, labels, arrows, clipping, and scientific legibility. Record that review against the exact build and contact-sheet hashes, then run:

```bash
npm run verify:biology30-unit-a-v2:figure-review -- --project biology30-unit-a
```

The verifier refuses a stale build hash, changed screenshot, missing figure ID, unresolved finding, or unreviewed contact sheet. A candidate cannot claim complete figure inspection from automated geometry alone.

The required Gate 2/3 verification floor is:

```bash
npm run test:biology30-unit-a-v2
npm run audit:biology30-unit-a-v2:figures -- --project biology30-unit-a
npm run verify:biology30-unit-a-v2:figure-review -- --project biology30-unit-a
npm run test:science-comparison
npm run validate:manifests
npm run verify:typecheck-baseline
npm run build:studio
npm run test:e2e:project -- --project biology30-unit-a
npm run test:e2e:biology30-unit-a-v2
npm run test:e2e:smoke
```

Automated evidence may mark the candidate ready for human review, but it must not populate category scores or create acceptance. Promotion requires explicit user acceptance of the exact build hash, a total score of at least 95/100, every category at or above its minimum, and no binary blocker. Until then the project remains `blocked` / `proposal-only-v1`, Studio Edit and export stay disabled, and the five historical pilots remain unchanged.

After the user supplies all seven category scores and explicitly accepts the exact build, store that decision at `projects/biology30-unit-a/meta/human-acceptance.json` and run:

```bash
npm run promote:biology30-unit-a-v2 -- \
  --project biology30-unit-a \
  --acceptance projects/biology30-unit-a/meta/human-acceptance.json
```

The command refuses a copied template, stale hash, omitted category, score below a category minimum, total below 95, binary blocker, incomplete visual evidence, changed candidate workspace, or changed historical pilot. It changes no learner wording or styling: it adds only durable Studio edit identities and explicit Annotation-only markers for runtime controls. One transaction then freezes the accepted candidate as the Direct canonical workspace, removes proposal rebuild ownership, enables the versioned Studio editability contract, records both pre- and post-promotion workspace hashes, and marks all five comparison projects `reference-only`. Any write failure restores every production and pilot file.

Gate 4 remains incomplete until these checks pass against the promoted workspace:

```bash
npm run course:doctor -- --project biology30-unit-a
npm run verify -- --project biology30-unit-a --mode workspace
npm run report:course-editability -- --project biology30-unit-a
npm run test:new-course-readiness
npm run verify:course-onboarding -- --project biology30-unit-a
```

The exact-head `verify:new-course-readiness` gate runs only after a separately authorized Biology-only commit. It must prove the full learner-surface inventory, routine-content coverage, and reversible Apply/reload/Undo lifecycle before SCORM release work begins.

## Biology 30 Units B-D Production V1

Units B, C, and D use a separate Biology-specific production family rather than the Unit A pilot builder or a generic Science factory. Their canonical contracts and source records live under `projects/resources/biology30-production/v1/`; they reference the existing checksum-verified Brightspace archives without duplicating them.

Create the family once with:

```bash
npm run intake:biology30-course -- \
  --family biology30-production
```

The intake is all-or-nothing. It creates exactly `biology30-unit-b`, `biology30-unit-c`, and `biology30-unit-d`, all as `blocked` / `proposal-only-v1` projects with Studio Edit and every export target disabled. Existing targets are refused and there is no overwrite flag. The family contract contains 92 exact official outcomes, 49 lessons, 4,500 required minutes, 900 optional minutes, 30 artifacts, 318 practice items, a disposition for all 395 notes pages, and explicit selection from the 423-item Brightspace source catalogue. Secure tests, printable keys, unrelated units, broken LMS launchers, and teacher-only assessment material remain excluded.

Build one candidate at a time:

```bash
npm run build:biology30-course -- --project biology30-unit-b --strict
npm run build:biology30-course -- --project biology30-unit-c --strict
npm run build:biology30-course -- --project biology30-unit-d --strict
```

The strict builder accepts only these three slugs, rechecks the contract and source hashes, stages the complete workspace and owned metadata, and preserves the previous valid candidate if any write or validation fails. The contract, authored lesson records, and Biology renderer are canonical; never hand-edit the generated workspaces.

After every substantive rebuild, run the exact-build visual audit:

```bash
npm run audit:biology30-course-production:visual
```

The audit refuses a promoted, editable, stale, or hash-drifted candidate. It checks every learner route, every semantic scientific model, and every lesson-owned reasoning interaction at 1440×900, 1024×768, and 390×844. It rejects missing or repetitive interaction grammar, content overflow, card overlap, undersized text, and page overflow, then emits route, model, and interaction contact sheets under `.runtime/biology30-course-production-visual-audit/`. Open every listed sheet and record the visual inspection in the unit's `meta/visual-review.json`; automated geometry alone is not human acceptance.

The full pre-review verification floor is:

```bash
npm run test:biology30-course-production
npm run audit:biology30-course-production:visual
npm run test:e2e:biology30-course-production
npm run test:e2e:project -- --project biology30-unit-b
npm run test:e2e:project -- --project biology30-unit-c
npm run test:e2e:project -- --project biology30-unit-d
npm run test:science-comparison
npm run validate:manifests
npm run verify:typecheck-baseline
npm run build:studio
npm run test:e2e:smoke
```

Each unit has its own `meta/acceptance-matrix.json`. Automated and AI-assisted visual evidence may mark a build ready for human review, but must leave every category score and decision empty. Acceptance requires an explicit human score of at least 95/100, every category minimum, no binary blocker, and the exact build hash. No B-D promotion, SCORM export, upload, publication, or commit is implied by a passing build; those are separate authorized gates.

After the teacher provides the exact build hash, all seven category scores, a 95+/100 total, confirmation that no binary blocker remains, and an explicit acceptance statement, create a separate acceptance-submission JSON matching `Biology30CourseAcceptanceV1` and run:

```bash
npm run record:biology30-course-acceptance -- \
  --project biology30-unit-b \
  --acceptance /absolute/path/to/unit-b-acceptance-submission.json
```

The recorder independently rehashes the workspace and rechecks the candidate, matrix, visual audit, red-team review, quality packet, and non-authorizing agent recommendation. It refuses a stale build, repeated decision, copied template, missing category, score below a category minimum, total below 95, binary blocker, incomplete authorization wording, enabled export, or non-blocked/non-proposal ownership. A five-file transaction records `meta/human-acceptance.json` plus the accepted matrix/review state; any mid-write failure restores every original file. The project remains `blocked` / `proposal-only-v1`, Studio Edit and export remain disabled, and promotion, upload, publication, and commit remain unauthorized.

## Shared Structure, Science-Specific Learning

Reuse the stable parts of the repository:

- course shell navigation and responsive behavior;
- accessible focus and explicit interaction states;
- persistent response/evidence patterns where the unit needs them;
- resource provenance, source hashing, export, and Brightspace acceptance gates.

Choose the instructional loop from the actual Science unit. The initial planning contract uses this candidate sequence:

`question -> investigate -> explain -> apply -> reflect`

That can become a simulation, data table, model-building activity, lab analysis, phenomenon explanation, or a different evidence-driven sequence. It is a planning prompt, not a mandated page layout.

## Red-Team / Green-Team Decision Loop

Both reviewers must work from the same small packet:

1. `meta/science-pilot.json`
2. `meta/project.json`
3. `meta/prompt-pack.md`
4. `projects/resources/<slug>/resource-manifest.json`
5. only the exact extracted source excerpts or curriculum mapping needed for the chosen unit

The red team looks for missing source authority, inaccessible interactions, fake data, unsafe assessment handling, unsupported persistence claims, and reasons the proposed activity does not fit the Science learning goal.

The green team proposes the smallest complete learner loop using the verified sources and existing shared shell capabilities.

They do not settle disagreement by voting. Record the evidence, unresolved edge case, and smallest testable decision in `meta/decision-log.md`. If either side identifies a real gap, narrow the pilot or gather the missing source rather than expanding the scope.

## Promotion Criterion

Only after the decision log identifies one representative unit, its outcomes, source mapping, learner loop, and verification requirements should the project be changed from blocked planning to an active implementation boundary.

The first build should prove one complete loop, including:

- curriculum/source traceability;
- accessible learner interactions;
- save/restore behavior when responses are collected;
- resource and assessment exclusions;
- project-specific E2E and SCORM acceptance checks if those delivery paths are in scope.

Only then should a reusable Science profile or builder be proposed. The pilot's evidence—not a copied course template—decides what is worth standardizing.

## Inspector Readiness for the First Unit

Do not make a Science workspace inspectable merely by adding a marker to rendered HTML. When the representative unit is approved, its science-specific authoring driver must declare the same ownership contract used by Studio:

- the canonical editable source or recipe;
- any generated workspace output and exact rebuild command;
- source resource IDs and contributor paths that are safe to show in a packet;
- whether a selected block can be `exact`, must remain `bounded`, or must be `unknown`.

Before broad authoring, prove one visible unit block through this loop:

`Inspect -> Copy bounded packet -> review one proposed change -> edit declared source -> rebuild -> verify learner behavior`

Reuse the Inspector contract, not Social or English source ownership. A Science activity may be a simulation, data analysis, lab reflection, or phenomenon explanation; its edit/rebuild path must simply be truthful and testable.

## Verification

```bash
npm run test:science-pilot
npm run validate:manifests
```

Use `npm run course:list -- --all` to confirm that a newly intaken Science pilot appears blocked until it has an approved implementation boundary. That is intentional and safer than treating a source archive as permission to generate a course.

## Collected learner-process views

When a Science pilot gathers lesson exits, reflections, investigation notes, or artifacts into one learner-facing collection, preserve one canonical state owner for every response. A collection should normally derive its display from existing stable response and completion records rather than serializing a second copy. Keep manual notes separately removable, deep-link collected work back to its original editable location, and verify reload restoration, deletion isolation, print/export output, persistence size, keyboard focus, and responsive layout. Generated Biology units must add this behavior through their owning production records and renderer; a direct-authored pilot workspace is evidence for the pattern, not a template to paste into generated courses.

## Core scientific vocabulary pilots

Keep a complete glossary for lookup, then select a much smaller instructional inventory of recurring concept families using curriculum outcomes, mechanism importance, recurrence, common confusions, diagram/data use, and later-course value. Store the selected families, word-analysis treatment, sources, exact lesson/outcome/textbook/practice/model mappings, and professional Frayer examples in a machine-readable project contract before rendering them.

Morphology is a cautious meaning clue, never the scientific definition. Use explicit treatments for meaningful morphemes, word families, acronyms, opaque name history, and whole technical phrases. A science-adapted Frayer model should ask for a contextual definition, essential mechanism, unit evidence, and a non-example/common confusion. Derive any Process Collection view from the canonical response state instead of persisting duplicate learner text.

For `biology30-unit-a-pilot`, the authoritative contract is `projects/biology30-unit-a-pilot/meta/core-vocabulary.json`. The teacher accepted the exact five-family Stage 1 slice before the complete rollout. Stage 2 now renders all 28 concept families, six fixed and 22 learner-choice Frayer interfaces, a strict two-choice flow, and the contracted Word Lens sequence in all 17 lessons. It remains blocked and awaits teacher acceptance of the exact complete build. Run:

```bash
npm run test:biology30-unit-a-core-vocabulary-pilot
npm run test:e2e:biology30-unit-a-improvement-pilot -- --grep "Core Vocabulary"
npm run audit:biology30-unit-a-core-vocabulary-pilot:visual -- --project biology30-unit-a-pilot
```

Bind each focused report to its exact workspace hash and open every contact sheet. Preserve the accepted Stage 1 evidence and earlier full-course audit under their historical hashes. The Stage 2 audit must inspect all 28 entries at desktop, tablet, and mobile sizes, representative learner states, all 17 Word Lens placements, and desktop/mobile 200% zoom. Units B-D require new family inventories, their own representative-slice approval, and builder-owned implementations; do not copy Unit A content, counts, IDs, mappings, or acceptance status.
