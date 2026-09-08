# Handoff

- Project: `biology30-unit-a-pilot`
- Task: Build and compare five source-isolated Biology 30 Unit A prototypes from two Brightspace exports, with the complete local notes PDF recreated as native lesson content.
- Status: ready for human comparison; all five projects are restored and visible in Studio, remain intentionally blocked, and no winner has been promoted or exported.

## Summary

- Transactional comparison intake and a Biology-30-specific Unit A builder are implemented.
- Exactly five Studio projects exist: class faithful, class optimized, system faithful, system optimized, and outcome-led synthesis.
- On 2026-08-29, numeric conflict-copy suffixes on the two class-course outputs caused Studio to show only three variants. The preserved sources were unchanged; the five-version builder restored the canonical filenames and Studio catalog.
- The checksum-matched 139-page notes PDF is no longer presented as a slide viewer plus transcript. All 139 unique pages are mapped into class-derived lessons as semantic headings, paragraphs, lists, callouts, and responsive comparisons; original page images are closed optional source references.
- Sixteen complex source pages are verified, source-specific manual recreations of tables or diagrams: `12, 44, 48, 55, 60, 72, 101, 102, 108, 112, 120, 128, 130, 131, 135, 136`.

## Files changed

- Intake and contracts: `scripts/lib/science-comparison.ts`, `scripts/intake-science-comparison.ts`, `scripts/lib/science-pilot-intake.ts`, and `package.json`.
- Biology parser and renderer: `scripts/lib/biology30-unit-a/`, `scripts/build-biology30-unit-a-pilots.ts`.
- Regression coverage: `scripts/tests/science-comparison.test.ts`, `scripts/tests/biology30-unit-a-pilot.test.ts`, and `e2e/lib/learner-course-assertions.ts`.
- Shared source library and contract: `projects/resources/biology30-unit-a-pilot/`.
- Generated blocked prototypes: `projects/biology30-unit-a-class-2026-faithful/`, `projects/biology30-unit-a-class-2026-optimized/`, `projects/biology30-unit-a-system-2020-faithful/`, `projects/biology30-unit-a-system-2020-optimized/`, and `projects/biology30-unit-a-synthesis/`.
- Workflow documentation: `README.md`, `ARCHITECTURE.md`, `docs/workflows/README.md`, and `docs/workflows/science-pilot.md`.

## What changed

- `intake:science-comparison` accepts two named Brightspace resources, stores each checksum-addressed archive once, writes a versioned five-variant comparison contract, refuses duplicate targets, and rolls back all targets on failure.
- The Biology builder parses manifest visibility/descriptions, QTI quiz metadata, resource paths, local files, and UTF-16 system HTML; it emits source, outcome, asset/link, content-disposition, provenance, and notes-content reports before transactional promotion.
- Visible complete chapter quizzes become local non-graded practice. Hidden unit tests, printable quizzes, hidden keys, teacher-only assessment content, Units B-D, and unrelated content remain excluded.
- The class ZIP notes PDF and the user-supplied PDF are byte-identical at SHA-256 `538f58fffe4aa0459dfcf49c5675948d8c7231a95a6fb2b61d7cde56e06a6035`.
- The PDF layout parser uses text position, font size, bullets, numbering, and columns to create semantic HTML. Complex diagrams/tables use checksum-gated manual source recreations; their page numbers are recorded in `meta/notes-content-report.json`.
- All source-slide images remain closed under `View original source slide`; the complete local PDF remains a fallback. No Google Slides link is required for completion.
- All five manifests remain `blocked` / `proposal-only-v1`, with Studio Edit and export disabled and Annotation available.

## Why this changed

- A slide screenshot with a raw `Read the slide text` transcript did not recreate the notes as usable course lessons. Native course structure is now the primary learner surface, while source slides are retained only for provenance and visual comparison.

## Verification run

- `npm run test:science-comparison` — 6/6 passed, including transactional intake, duplicate refusal, rollback, UTF-16 handling, exclusions, semantic notes rendering, and comparison-freeze refusal.
- `npm run build:biology30-unit-a-pilots -- --family biology30-unit-a-pilot` — built exactly five blocked workspaces; no promotion or export.
- Real-source audit — all five have zero unresolved local assets, zero D2L launchers, zero teacher-assessment leakage, and no legacy slide transcript. Class faithful, class optimized, and synthesis each report 139 semantic pages and 139 unique mapped pages; both system-only variants correctly exclude the class PDF.
- `npm run validate:manifests` — passed for the full catalog, including all five Biology projects.
- `npm run verify:typecheck-baseline` — passed with the established ten diagnostics and none in files changed since baseline capture.
- `npm run build:studio` — passed.
- `npm run test:e2e:project -- --project <slug>` — passed separately for all five Biology slugs.
- Live Studio inspection — Edit disabled, Annotation available, semantic comparison content rendered in desktop and responsive single-column mobile layouts; the myelinated/unmyelinated recreation was visually checked.
- Recovery verification — `npm run build:biology30-unit-a-pilots -- --family biology30-unit-a-pilot` rebuilt exactly five blocked workspaces, `npm run validate:manifests` passed, and a live Studio refresh showed both 2026–27 class variants, both CBE variants, and the synthesis. The class-faithful preview loaded successfully.
- `git diff --check` — no whitespace errors; only unrelated existing CRLF conversion warnings were printed.
- `npm run test:e2e:harness` — 6/7 passed. The remaining pre-existing assertion expects the older phrase `modulePassTargets or visibilityChecks`, while the current schema correctly reports `modulePassTargets, visibilityChecks, or enabled learnerCourse routes`; this unrelated test was not changed.

## Source of truth

- Shared immutable sources and hashes: `projects/resources/biology30-unit-a-pilot/resource-manifest.json` and `_sources/`.
- Five-version boundary and review rubric: `projects/resources/biology30-unit-a-pilot/comparison-contract.json`.
- Rebuild authority: `scripts/lib/biology30-unit-a/build.ts`, `notes.ts`, `source.ts`, `content.ts`, and `render.ts`.
- Generated comparison workspaces are review outputs, not editable canonical winners. They remain rebuildable until one is explicitly frozen and promoted.

## Fragile areas / watchouts

- The sixteen manual semantic page recreations are intentionally gated to the exact verified PDF SHA. Replacing the PDF changes the hash and removes those source-specific overrides rather than applying them to unrelated material.
- Running the comparison builder replaces all unfrozen generated comparison outputs. A selected winner must receive `meta/comparison-freeze.json` before any further comparison rebuild.
- The system-only variants must never acquire class-course PDF content. Source-isolation assertions fail the build if that boundary leaks.
- Optional external links are not completion dependencies. The legacy Alberta Disadvantage URL in the system source currently returns 404; local lesson content remains available.
- Original Downloads ZIPs and PDF remain unchanged and should be preserved through winner acceptance.

## Next prompt should assume

- The five versions are ready to compare in Studio using the common 100-point matrix.
- The notes now read as course content; slide images are closed references, not the lesson presentation.
- The user must select one winner. No score automatically selects or promotes a project.
- Do not enable Edit, run new-course readiness, export SCORM, or upload to Brightspace until the winner is named.

## What still needs validation

- Human review of all five prototypes and selection of one winner.
- After selection: freeze the winner, mark the other four reference-only, establish the winner as a canonical Direct source with durable edit keys, and run doctor, workspace verification, new-course readiness, Studio Edit-map inspection, reversible Apply/reload/Undo, and winner-specific E2E.
- Export only the accepted winner as SCORM 2004, validate the archive/runtime, then verify save/restore in Brightspace learner accounts and target browsers.

## Known risks

- Automated layout extraction cannot infer every visual relationship. The highest-value tables and diagrams are manually recreated and explicitly reported, but human subject-matter review remains required before promotion.
- The workspace is broadly dirty with unrelated user-owned work. Do not broadly stage, clean, or rewrite outside the Biology paths listed above.

## Exact next command

`npm run studio`

## Exact next file to open

`projects/resources/biology30-unit-a-pilot/comparison-contract.json`

## Do not do next / warnings

- Do not run a comparison rebuild after freezing a winner.
- Do not promote a course based only on an automated score.
- Do not export or upload any of the five blocked comparison projects.
- Do not edit `projects/**/raw/`, the original Downloads files, or unrelated dirty paths.
