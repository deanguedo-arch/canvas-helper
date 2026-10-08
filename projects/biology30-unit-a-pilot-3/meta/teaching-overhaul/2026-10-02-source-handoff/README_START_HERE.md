# Biology 30 — Chapter 11 teaching source handoff

Current-source export anchored to `ecc1b806630cb33b9942e64eb676a1f8568c007e` on `codex/math-engine-preflight`, plus exact file hashes. Stage 1 only; no learner-course changes or ChatGPT prompts.

## Read in this order

1. NEXT_PHASE.md — agreed boundary and next authoring/review process.
2. supplied-standard/02_TEACHING_STANDARD.md — supplied proposed teacher-voice/depth standard.
3. inventory/CHAPTER_INDEX.md, chapters-11-20.json and current-source-availability.json — actual routes, IDs, source owners, resources, fresh file availability and preservation records.
4. inventory/stale-and-missing-evidence.json and sources/extraction-gaps.json — stale metadata, source/currency limitations.
5. first-batch/ — complete current lesson-01/02/03 copy, questions, feedback/keys and source locators; source-excerpts holds bounded original PDFs.
6. chapter11-lessons/ — complete HTML and readable extracts for all 12 required lessons, optional lesson-13 and the hidden legacy lesson-check.
7. sources/source-register.json — original textbook, teacher deck, official cache and selected teacher documents with exact hashes/locators.
8. current-course/data/ — original catalogue, all generated question families and keys, vocabulary/schema, textbook crop provenance and feedback policy; current-course/owners holds exact runtime sources.
9. PRESERVATION_CONTRACT.md, AUTHORING_TRACKER.json and VERIFICATION.json — preserved state/design and truthful stage status.

## Important distinctions

The 11–20 map is an inventory, not rewritten courses or full source packages for every chapter. Chapter 11 exported text is the existing course, not an authored overhaul. Native collapsed text is included; runtime-generated questions/feedback are exported separately. No learner answers, browser storage or private student data were accessed.

Teacher-only answer/quiz files and quiz-media must not be copied into learner pages. Unit A review documents may also cover Chapters 12/13; use their Chapter 11 portions only. PDF text extraction cannot replace looking at the original figure or two-column question layout. See sources/pdf-extraction-warnings.json for parser limitations; originals are unchanged. Original source copyrights/redistribution boundaries remain unchanged.

## Optional local source-reference preview

Serve current-course/workspace with a local static server and open index.html. This is a developer-only source reference, not an uploadable SCORM or learner release. Its bundled runtime is derived/reference only; canonical runtime source is in current-course/owners. No source document availability, LMS saving or new teaching acceptance is implied by this preview.

## Routing and reproduction

Source/teacher judgment retained by lead; inventory/extraction/hash checks use deterministic local commands. No worker/delegation was used because the read-only public-source extraction is one bounded command and source authority/ownership acceptance must remain with the lead. Provider-cache telemetry and usage savings: unknown; no savings claim.

Reproduction source is in reproduction/. Run the repository exporter with --output pointing to a new directory, --python to a pypdf-enabled runtime and --prompts to the supplied ZIP. It refuses existing destinations and does not touch learner sources.
