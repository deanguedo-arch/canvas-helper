# Handoff

- Project: science24-unit-a / Reaction Detective A1
- Task: Import v1.2.0, independently validate the standalone candidate, and prepare teacher review/sign-off materials.
- Status: ready for teacher review; course remains blocked, component planned; not classroom/LMS released.
- Date: October 7, 2026 (America/Edmonton).

## Files changed / summary
- projects/science24-unit-a/workspace/games/reaction-detective/: imported the 11 exact v1.2 runtime files and updated README. Supplied learner code was not altered. Unused old PNG/icon assets remain for recovery.
- projects/resources/science24-unit-a/reaction-detective-v1.2.0/: preserved source intake, original receipts and provenance.
- projects/science24-unit-a/meta/project.json: version/source/review record for planned component; declared canonical component files; preserved lifecycle, lesson/progress and unrelated metadata.
- projects/science24-unit-a/meta/reaction-detective-review-2026-10-07/: first-build backup, validation copy/harness adaptations, exact source hashes, independent receipts, screenshot, teacher answer guide/text-form, 10-page fillable PDF, unreviewed acceptance JSON and delivery receipt.
- Downloads/Science24_A1_Reaction_Detective_Teacher_Review_v1.2.0_2026-10-07.zip: 6.1 MB portable review delivery; 59 files with verified hashes.

## Verification run / methods
842 engine tests, 88 embedded core browser assertions, 277 responsive assertions across seven widths (including touch emulation), 39 keyboard/stress assertions, 88 real canonical-host core assertions, 8 actual file:// offline smoke checks: 1,342 successful technical assertions. All 11 runtime files match original source and hosted bytes. Source JS/CSS exactly represented in PLAY.html. No learner-runtime edits were needed.

Harness differences: CommonJS package declaration resolves repo ESM inheritance; keyboard native selects use macOS typeahead instead of arrow-only input; screenshot timeout increased to 30 seconds. The temporary focus-expectation change failed and was reverted. Independent report explains initial failures; supplied original records remain in the resource intake. Node 24.14.0 and temporary Python Playwright 1.63.0 used installed Chromium executable. No game dependencies changed.

PDF: 10 rendered pages inspected; 33 interactive fields, all unreviewed/blank; field/widget parity and a scratch synthetic name-only roundtrip checked. Text alternative included. Synthetic filled form is excluded from delivery. ZIP CRC, all payload hashes and exact candidate game bytes verified.

## Source of truth
Canonical component: projects/science24-unit-a/workspace/games/reaction-detective/index.html, scenarios.js, engine.js, game.js, styles.css and six WebP scenes. Course source stays under its existing workspace ownership. Resource intake and previous build backup are reference/recovery. Teacher ZIP is a fixed snapshot, not a canonical owner.

Candidate PLAY SHA256: ebd9f60548887206e144fbbc3fece4d90877fbe47c01422d5aac943341c0fc70.

## Known risks / what still needs validation
Independent teacher judgment on science, curriculum scope, exact evidence-pair fairness, corrosion/acid-carbonate labels, uncertainty follow-up, reading level and self-review rubric. Real phone, actual VoiceOver/NVDA, native browser zoom, Safari/Firefox and actual print dialog. Final lesson placement, optional/required progress, target host/CSP/iframe and Brightspace/SCORM release. CSS zoom and touch emulation are not native/hardware proof. In-memory only; reload/close clears work.

## Fragile areas / drift
Stable six case IDs/evidence IDs, immutable attempts, first transfer response, Previous restoration and submitted-answer fingerprint gates must survive later changes. Imported scenario version fields remain 1.1.0 because v1.2 changed navigation only; runtime candidate is 1.2.0. Any substantive revision invalidates affected-area teacher acceptance and requires a new candidate/hash. Never replace pending decisions with test results. Runtime learner content remains Annotation only in Studio.

## Next prompt assumptions
Optional Unit A practice is the proposed scope, not a finalized course insertion. No teacher reviewer/recipient supplied yet; no message was sent and no hosting deployment performed. Review ZIP and fillable PDF are prepared for Dean to share. No LMS reporting, persistent saving, required course credit, activation, commit/push or production release occurred.

## Routing actually used
Deterministic source reconciliation/intake, supplied test runs and PDF/ZIP assembly. Lead retained external-source/dirty-metadata integration, learner-state acceptance and teacher judgment boundaries; no eligible independent bulk implementation slice existed. No worker/provider-cache calls. Memory release-boundary lookup was distinct from local context-cache hits (none measured); provider-cache telemetry and usage savings unknown.

## Exact next action
Have the Science 24 teacher review the fixed candidate and return the completed Teacher_Review_and_Signoff.pdf (or text alternative) with a decision and any conditions. Resolve those conditions before final integration/release validation.

## Exact next file to open
projects/science24-unit-a/meta/reaction-detective-review-2026-10-07/output/pdf/Reaction_Detective_Teacher_Review.pdf

## Preview
http://127.0.0.1:57324/ is running and open at the intro. Local machine only. If stopped, run `python3 -m http.server 57324 --bind 127.0.0.1 --directory projects/science24-unit-a/workspace/games/reaction-detective` from the repo root.

## Do not do next
Do not infer teacher approval, activate/export/deploy the course, alter required progress or saved-work contracts, remove recovery assets, or treat synthetic/device-emulation results as real-device or LMS acceptance.
