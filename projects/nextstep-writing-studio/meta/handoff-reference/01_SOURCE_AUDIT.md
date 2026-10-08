# 01 — Inspected original source

## Provenance
Original file: `Writing Studio.zip`, **278,848 bytes**.
SHA-256: `6b6400c37a8275f5b47313787a7c26440abb2b3f9ad1d0d1a1f88a045173df4a`.
The archive contains eight files: six source/text files and two font binaries. Exact per-file hashes and inclusion status are in `verification/original-source-inventory.json`. The six source files in this handoff are byte-for-byte copies; this is not a claim that the original source is production-safe. Font binaries and the original ZIP containing them are not redistributed.

## Actual implementation
- `index.html`: 12,704 bytes; two main sections, Personal Response Workspace and Saved Notes; explicitly ELA 20-1 Short Stories; five fixed texts.
- `app.js`: 6,496 bytes; localStorage persistence, hash-based section navigation, shared evidence-bank object and print action. No SCORM API discovery, initialization, manifest or Commit.
- `studio-explorer.js`: 34,836 bytes; **9 terms, 5 readings and 90 worked example records** embedded as arrays. Term search, reading selector and hint toggle.
- `styles.css`: 146,936 bytes, 2,565 newline-delimited lines; extensive inherited ELA/course rules followed by standalone overrides. Do not import this wholesale into the new app.
- README identifies the source course path and extraction date 2026-10-06; it explicitly calls this a non-SCORM development ZIP.

## Exact legacy keys
`ela-student-tool-kit:writing-studio:responses:v1`
`ela-student-tool-kit:writing-studio:notes:v1`

Response IDs:
`evidence-draft:writing-studio:source`, `:concept`, `:detail`, `:connection`;
`personal-response:texts`, `:idea`, `:connection`, `:evidence`, `:form`, `:draft`.

Notes are array entries with `contributionId`, `source`, optional `concept`, `answer` (or fallback `detail`) and `updatedAt`. A saved response plan upserts the fixed contribution ID `writing-studio:response-plan`. Evidence entries use a timestamp-based contribution ID. The `answer` can contain combined evidence and commentary; do not invent a reliable delimiter.

## Behaviours worth retaining
Searchable analysis vocabulary; concept plus evidence plus explanation; hints under planning prompts; saving unfinished field edits; separation of evidence from interpretation; print/export; explicit note capture.

## Defects / migration hazards
1. `safeRead` catches every parse/storage exception and falls back to an empty structure. New code must distinguish empty from damaged/inaccessible data and preserve raw bytes.
2. `nextStepEvidenceBank.upsert()` ignores the boolean from `safeWrite`. Evidence/plan handlers then display a successful save message even if the write failed. Do not port this behaviour.
3. A zero-delay startup timer dispatches synthetic input events to every response field. That rewrites browser state on load; combined with parse fallback, it can replace failed-to-read content with defaults. New code must have an explicit hydration barrier.
4. No learner identity in legacy keys. Do not automatically expose/import those keys for whichever student launches next on a shared browser.
5. Only one perpetual planner exists; no project isolation, backup format or migration contract.
6. Planner `personal-response:draft` asks for a controlling idea/opening move, not necessarily a finished essay. Preserve it as an imported opening and proposed draft with clear provenance, not as a certified complete response.
7. Evidence examples include descriptive scene summaries. The old UI renders them in blockquote markup; that does not establish direct-quotation accuracy.
8. Material-symbol text is present in HTML, but standalone CSS hides those symbols. The new icon library must not depend on an unavailable icon font.

## Migration mapping
The complete legacy adapter is specified in `07_BACKUP_AND_MIGRATION.md`; a read-only exporter helper is provided. Preserve both the original raw response map and notes array in a legacy import record; do not discard unknown fields. Import into a **new project** after preview. Existing projects are never replaced automatically.

## Preservation boundaries
Do not modify the user's original course or a live copy just to extract state. A legacy exporter must run in an owner-approved copy that can access the same origin's storage. New SCORM origins cannot read another origin's localStorage. Where original access is gone and no export exists, this handoff supplies no hidden recovery route.
