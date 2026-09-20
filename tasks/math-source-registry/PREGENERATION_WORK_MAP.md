# Pregeneration Work Map (Math family)

Phased uses supported by the metadata-only registry. Each phase consumes
registry outputs; none copies question/answer payloads or binaries into the
repository.

## Phase 1 — Math 10C factoring pilot source map and formative-candidate review

Use the NXT Master and CBE System Math 10C archive entries
(`content-index.ndjson` rows tagged `factoring`, manifest organization
titles, `course-archives.json` counts) to locate factoring source material
and review formative candidates against inventory metadata only.

## Phase 2 — Right-triangle trig contrast source map

Use rows tagged `right-triangle-trigonometry` from the same two Math 10C
archives to bound the smaller trig contrast slice. Same metadata-only
rules as Phase 1.

## Phase 3 — Image/diagram rights and accessibility contact-sheet review

Use `asset-index.ndjson` (`rightsStatus: unreviewed`,
`learnerUseStatus: not-approved`, dimensions, `referencedBy` linkage) to
triage a contact sheet for rights and accessibility review. No source
image may be copied into course material before that review completes.

## Phase 4 — Human classification of practice versus formal/restricted assessment

Use `question-reference-index.ndjson` (IDs, `hasResponseKey` boolean,
`assessmentRole: unclassified`) and `assessment-relations.ndjson`
(resolved/unresolved reference counts) to queue human classification of
practice versus formal/restricted items. No question bank may be built
before this classification.

## Phase 5 — Later Math 20-1 and 30-1 architecture fixtures only

Use the 20-1/30-1 archive entries (tagged `math20-fixture` /
`math30-fixture`) for architecture and capacity planning only, until the
Math 10C pilot passes. No 20-1 or 30-1 course is built in this phase.

## Phase 6 — Candidate-versus-source provenance checking

When the ChatGPT-built course arrives, compare its files against registry
hashes, titles, asset fingerprints, and topic tags to record provenance
(metadata comparison only; no payload copying).

## Explicit prohibitions

- Do not build all three courses now; only the Math 10C pilot advances.
- Do not ship answer keys or any response/feedback content.
- Do not treat inventory counts as quality or coverage evidence.
- Do not copy source images into deliverables before rights and
  accessibility review.
- Do not reclassify `unclassified` assessment roles without human review.
