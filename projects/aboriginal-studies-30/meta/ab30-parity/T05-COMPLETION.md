# Ticket T05 completion record

Status: IMPLEMENTED (lead-authorized; T04 design approved 2026-09-23, capacity (a)+(b))
Baseline commit/source hashes: dirty overlay continues from the T04 record; this ticket's new production file is workspace/learning-store.js (959 lines) plus routed reads/writes in workspace/main.js, save-status/conflict UI in workspace/index.html + workspace/styles.css, and suite updates. git diff --check clean on all touched paths.
Dirty-overlay/diff digest: cumulative working-tree overlay covers T01–T05 (uncommitted by contract); T05's own additions are the adapter, the main.js routing + status/conflict/export code paths, the index.html adapter tag + announcer, the styles.css save/conflict rules, the state-suite production binding + T05-1–T05-4 tests, and the parity-suite T05 harness amendment. No Biology/Chemistry/brand files touched.
Writer/approved scope: T04-approved adapter integration only (queue allowedScope: approved store adapter; main.js write/read handlers; tests). Review boundary was the T04 design approval — GRANTED before this ticket started. No teacher gate in this ticket (no prompt/assessment/lesson-content changes).

## Changed files and actual changes

- workspace/learning-store.js (new): the T04-approved store as production code — v1 envelope inside the SAME 3 localStorage keys, migration (flat→v1 + envelope passthrough), logical reads/writes with assignment-alias resolution, conflicts with predecessors + resolution, attempts (submit/begin/reset), export/import, capacity measurement, commit checks, status derivation, and the AB30Store runtime (init/mode/status/read/write/resolveConflict/exportWork/importWork/flush/measure) with envelope/passthrough/memory modes. Deliberate, documented divergence from the T04 proposal: booklet membership by internal key prefix instead of a caller-supplied Set (no DATA dependency, no load-order coupling) — proven equivalent on all 102 registry keys (T05-2, zero unknowns). One additive test seam: storeClone exported via AB30LearningStoreInternals (zero behavior change).
- workspace/main.js (routed, logic preserved): saveActivityResponse/readCourseResponse/promptAnswered/renderers read and write through the adapter with legacy-direct fallbacks when the adapter is absent; pendingWrites retry via flushPendingWrites; refreshSaveStatus renders truthful per-activity status + conflict counts; conflict panels with keep-first/keep-second/merged resolution; export/import/flush wiring. promptAnswered keeps its exact T04 base+prefix-some logic (verified against the pre-T05 body recovered from session evidence) with only the read primitive swapped.
- workspace/index.html: adapter script tag (before main.js) + save-status announcer element.
- workspace/styles.css: save-status/conflict-panel styles (additive; shell redlines untouched — shell suite 10/10).
- scripts/tests/aboriginal-studies-30-state.test.ts: Part 1 is now a vm-loader binding the LIVE adapter under the exact T04 names (retired in-file proposal copy remains in git history); migration call sites use production's real 3-argument shape; Part 3 adds T05-1 (surface loads), T05-2 (prefix-vs-registry agreement + exact dual-key list), T05-3 (init/write/read/status/flush/re-init persistence through fake storage), T05-4 (memory-mode truthfulness without storage).
- scripts/tests/aboriginal-studies-30-parity.test.ts (T05 amendment, assertions untouched): seam loads the real adapter and boots AB30Store against stub storage; setResponses seeds the adapter (the real store); slice set gains pendingWrites/readCourseResponse/refreshSaveStatus; STATE02-keys guards the readCourseResponse production read expression + its adapter delegation.

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-state.test.ts`: 18/18 pass — STATE01–STATE15 all green against PRODUCTION adapter code (not the retired copy), plus T05-1–T05-4. Log: meta/ab30-parity/T05-run.log.
- `node --test scripts/tests/aboriginal-studies-30-parity.test.ts`: 16/18 — STATE02-F02/F03 flipped green UNEDITED via the adapter's alias resolution (T05's required MAP04-adjacent proof; MAP04-DOM green); all 14 T02-green tests still green. The 2 reds are the T06-owned assertions, byte-identical to the T02 baseline (COMP01 flags-only mastery; COMP02 legacy-boolean one-cell).
- `node --test scripts/tests/aboriginal-studies-30-source.test.ts`: 10/10 (untouched, still green).
- Shell file-scope runner (/tmp/as30_shell_filescope.test.ts — committed suite with ONLY the tsx-only projects.js import stubbed, picker test excluded): 10/10, covering all assertions over the T05-edited files (manifest fields incl. authoringStatus active, shell markup, visual-system redlines incl. every doesNotMatch, asset existence, main.js storage-key literal).
- `node --check` on learning-store.js + main.js: SYNTAX_OK. `npx tsc --noEmit`: ZERO errors in touched files (repo-wide pre-existing errors elsewhere unchanged).
- Caught and fixed during T05: (1) parity seam initially missed the new adapter file + new production dependencies (pendingWrites/readCourseResponse/refreshSaveStatus) — harness now loads the full runtime; (2) my T05-2/T05-3 key choice collided with the two approved F05 dual keys — tests now pin the exact dual-key list and use solo keys; (3) STATE15 needed the host TextEncoder in the vm sandbox (standard platform global) to exercise production's real byte measure instead of the legacy char-estimate fallback.

## Learner-work impact

All lesson IDs, saved keys, and learner answers preserved: same 3 storage keys, same key strings (STATE02-keys + MAP05-ids green), migration keeps every string byte-exact (STATE04), unknowns/corrupt preserved (STATE05), conflicts retained with predecessors (STATE03), attempts immutable (STATE08), over-budget commits write nothing and say so (STATE13/STATE15, capacity option (a) path). Rollback: storeFlattenForRollback + legacy.raw verbatim (STATE01/STATE11).

## Content/source review

No lesson/prompt/assessment/source content touched. novel-4-3-activation and outcomes-mapping holds carried forward from T03. No teacher/lead approvals claimed beyond the recorded T04 design approval that authorized this ticket.

## Not run / failed / blocked

- REAL browser reload, real two-tab contention, live Studio identity, real LMS failure: NOT RUN — no browser in this sandbox. Closest first-hand evidence: T05-3 re-init persistence (committed bytes replay through a fresh adapter boot) and the STATE06/13/14 failure battery against production code. Browser/host proofs stay with T23/T24.
- Studio picker shell test (1 of 11): NOT RUN — needs tsx + server lib (tsx EPERM persists in sandbox; pre-existing). Unaffected by this ticket's logic (bundle-path assertions only); lead/CI runs the committed suite unmodified.
- npx tsx --test (all suites): same environmental EPERM; lead/CI verification needed (expect state 18/18, parity 16/18 with COMP01+COMP02 red, source 10/10, shell 11/11).
- COMP01/COMP02: red assertions owned by T06 (unchanged from T02 baseline) — not failures of this ticket.

## Next safe step

T06 (completion semantics: getPromptCompletion + fields-complete, flips COMP01/COMP02) is the next queue ticket needing no new gate — its scope (completion display) is authorized routine work, but per the contract the writer stops at ticket boundaries: LEAD confirms T05 record, then authorizes T06. T23/T24 (browser/host proofs) remain the standing verification debt for the whole STATE battery.
