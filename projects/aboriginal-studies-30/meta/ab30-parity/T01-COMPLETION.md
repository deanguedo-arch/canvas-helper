# Ticket T01 completion record

Status: IMPLEMENTED (tests only; 7 red reproductions + 6 green guards, all first-hand)
Baseline commit/source hashes: branch codex/math-engine-preflight @ 02a9fadc; tested inputs main.js 91171649…, course-data.js 7b1ce722… — identical to the T00 frozen baseline. Production untouched.
Dirty-overlay/diff digest: session added only untracked tests/evidence (see below). Pre-existing overlay (98 tracked files) not modified by this ticket; git diff --check clean on new files.
Writer/approved scope: tests only. No production, package.json, or config edits.

## Changed files and actual changes

- scripts/tests/aboriginal-studies-30-parity.test.ts (new, ~560 lines, zero repo imports, erasable TS): 13 tests covering MAP01, MAP02, STATE02, COMP01, COMP02 (red) plus MAP03, fixture-consistency, F04, key-model, and zero-state guards (green). Loads REAL course-data.js in node:vm (established shell-test precedent) and executes REAL main.js seam functions (mechanically sliced, each slice asserted present + syntax-checked; drift fails loudly, never silently green) against stub localStorage/document.
- scripts/tests/fixtures/ab30-parity/theme1-question-map.json (new): verbatim copy of plan contracts/theme1-question-map.json — reviewed starting map for MAP01.
- scripts/tests/fixtures/ab30-parity/assignment-aliases.json (new): verbatim copy of plan contracts/assignment-aliases.json — 8 logical-identity pairs for STATE02.
- scripts/tests/fixtures/ab30-parity/state-fixtures.json (new): synthetic F01/F02/F03/F04/F08/F15 markers (SYNTH_AB30_* literals, no learner data).
- projects/aboriginal-studies-30/meta/ab30-parity/T01-baseline-run.log (new): frozen baseline run output.
- Future-seam contract documented in the test header for T02/T05/T06 (explicit bookletQuestionIds preferred when present; optional readLogicalResponse/writeLogicalResponse; optional getPromptCompletion(activity, prompt) -> status | {status}; updateProgress + refs.progressPercent/progressCount kept). Production changes flip red tests green WITHOUT test edits; any seam removal fails loudly.

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-parity.test.ts`: 13 tests, 6 pass, 7 fail — exactly the designed split. Full log: meta/ab30-parity/T01-baseline-run.log.
- RED (defect reproductions against real code):
  - MAP01-data: all 23 Theme 1 lessons lack explicit bookletQuestionIds.
  - MAP01-homes: q1/q2 triple-homed (t1-l02, t1-l21, t1-l22) via the REAL promptsForLesson; all other q3..q87 single-homed.
  - MAP02: 18 lessons (t1-l03..t1-l20) change membership when kicker gains "Assignment 1.2" + numbers. (t1-l02/l21/l22 already contain q1/q2 so the mutation is idempotent there; t1-l01/l23 have no question kickers — consistent with the parsing mechanism, not a test gap.)
  - STATE02-F02/F03: all 8 aliases disconnected in both directions (lesson-only invisible formally and vice versa).
  - COMP01: flags-only state renders "100%" + "4 / 4 themes" through the REAL updateProgress.
  - COMP02: one Q37 cell returns answered=true through the REAL promptAnswered (12 distinct cell keys built by the REAL promptFieldKey/fieldToken).
- GREEN (guards): MAP03 exact 50-ID order; fixture q1..q87 set coverage; alias shape; F04 dual-draft consistency + write-reaches-localStorage proof; alias keys == real key builders; 0% zero-state.
- `npx tsx --test scripts/tests/aboriginal-studies-30-parity.test.ts`: same environmental EPERM on tsx IPC socket as T00 (first-hand for this file). Suite is import-free/erasable-TS precisely so the lead/CI tsx run executes it unmodified.
- Browser/HTTP-served behavior tests: NOT RUN — no playwright browsers / system chrome in this environment. The vm-seam tests execute real production functions (white-box, stronger than string matching); real-browser reload/resume proofs belong to T23 + rollout.
- Two test-authoring bugs found and fixed during T01 (test-only): vm-realm Array prototype vs strict deepEqual (fixed by JSON normalization at the load boundary); reviewed map is q-complete but not flat-ordered (fixed by set-equality assertion; per-lesson grouping is pedagogical, not contractual).

## Learner-work impact

None. No IDs, storage keys, limits, or content changed. MAP03 guard now freezes the 50-ID order against future tickets.

## Content/source review

No course content or sources touched. Fixture copies are verbatim plan contracts (T02's starting map, T04/T05's alias pairs), not newer-work overwrites. 4-3 alias (sourceHold=true, novel dispute) is exercised for draft-plumbing mechanics only; no novel/content judgment made.

## Not run / failed / blocked

- tsx runner: environmental EPERM in sandbox; needs lead/CI verification (`npx tsx --test scripts/tests/aboriginal-studies-30-parity.test.ts`, expect same 6/7 split).
- Real-browser persistence/routing proofs: NOT RUN (no browser); tracked for T23/rollout.
- Nothing blocked: T02 prerequisites satisfied.

## Next safe step

T02 (scope: course-data.js, main.js, mapping tests): add explicit bookletQuestionIds (+ assignmentIds/assignmentHomeIds) per the reviewed map fixture; remove kicker/title parsing from render/review paths; freeze row/column/blank IDs. Expected effect on this suite with NO test edits: MAP01-data, MAP01-homes, MAP02 turn green; MAP03 + guards stay green; STATE02/COMP01/COMP02 stay red until T05/T06. Awaiting user authorization to proceed beyond T01 (this run was authorized for T00+T01 only). Writer stopped: yes after this record.
