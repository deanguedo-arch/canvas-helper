# Ticket T02 completion record

Status: IMPLEMENTED (MAP01/02/03/05 green; MAP04-DOM + MAP06-manifest green with documented partials)
Baseline commit/source hashes: branch codex/math-engine-preflight @ 02a9fadc; T02 inputs main.js a6e9b86f…, course-data.js 6550aaf9… (changed by this ticket from the T00 baseline c9a7f359…/7b1ce722…/91171649…/3acd132f… — index.html and styles.css untouched).
Dirty-overlay/diff digest: ticket touched course-data.js, main.js, the parity test + coverage manifest only (allowed scope). git diff --check clean.
Writer/approved scope: course-data.js; main.js; mapping tests. No approval gate beyond the master contract.

## Changed files and actual changes

- projects/aboriginal-studies-30/workspace/course-data.js: all 50 lessons carry explicit `bookletQuestionIds`, `assignmentIds`, `assignmentHomeIds` (Theme 1 from the reviewed map fixture; Themes 2–4 explicit empty). Q37 rows/columns converted from strings to `{ id, label }` with ids byte-equal to the legacy token derivation (proven below — zero migration, saved answers keep reading).
- projects/aboriginal-studies-30/workspace/main.js: `lessonQuestionNumbers` DELETED (was the only kicker/title parser; verified no other number-parsing of display text exists). `promptsForLesson` and `lessonsForSection` are explicit-only. Added `tableFieldId`/`tableFieldLabel` (explicit id for keys, label for display, legacy-string fallback); table render + review lines use them. `fieldToken` retained as documented legacy-compat derivation only.
- scripts/tests/aboriginal-studies-30-parity.test.ts (mapping tests): slice set updated (parser removed, render cone added); MAP01-data extended to all three membership fields + Themes 2–4 explicit presence; COMP02 updated to object rows; NEW MAP04-DOM (unique DOM ids via real renderer), MAP05 (3 tests), MAP06 (manifest validation).
- projects/aboriginal-studies-30/meta/ab30-parity/coverage-manifest.json (new): 108 items, every required class with an allowed disposition; namespace rules recorded.
- Deliberately NOT changed: `ASSIGNMENT_PROMPT_LESSONS` static map (already explicit, not parsed; canonical section→assignment linkage belongs to T03's manifest), DOM `inputId` values (no co-mounting consumer yet; churning ids without one risks Studio fingerprints), `LESSON_DRAFTS` (already explicit; theme tickets own assignment restoration).

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-parity.test.ts`: 18 tests, 14 pass, 4 fail. Log: meta/ab30-parity/T02-run.log. The 4 failures are exactly the T05/T06-owned reds (STATE02-F02/F03, COMP01, COMP02) — unchanged from T01, still failing for the same production reasons.
- MAP01-data, MAP01-homes, MAP02 flipped red→green with NO logic edits to those tests (only slice-list/data-shape updates the ticket scope allows) — genuine production-change flips.
- Pre-change characterization (/tmp/ab30evidence/oldmap_diff.js, real legacy function): membership delta vs reviewed map was EXACTLY t1-l21/t1-l22 losing wrongly-attached q1/q2; other 21 lessons identical. Post-change render probe (/tmp/ab30evidence/t02_render_probe.js, real renderLessonQuestions): t1-l02 weaves q1–q8; t1-l07 q28–q31; t1-l21 q81–q83 only; t1-l22 q84–q87 + hosted assignment-1-2. Fix proven in rendered output.
- Saved-key preservation: all 8 explicit row/column ids == REAL fieldToken(label) output (node cross-check + MAP05-ids test). Visible table text byte-identical (labels unchanged; aria-labels use labels).
- `npx tsc --noEmit`: 51 errors repo-wide, ZERO in touched files (all pre-existing in unrelated scripts/e2e).
- `npx tsx --test` on the suite: same environmental EPERM (sandbox IPC); lead/CI verification still needed.
- MAP04: DOM half GREEN (89 real renders, unique view-scoped ids, MC radio groups share one saved name==key). Same-logical-record half stays RED until T05 (STATE02) — honest partial, not a silent pass.
- MAP06: manifest/schema/cross-check GREEN. Source-backing of retained wording completes in T03/T13 — honest partial.

## Learner-work impact

Zero-migration: every saved key derivable before T02 derives identically after (explicit ids == legacy tokens; membership change only REMOVES wrongly-duplicated q1/q2 editors in Lessons 21/22 — answers themselves live under q1/q2 keys in Lesson 2 and are untouched). No IDs changed, no storage keys changed, no limits changed. MAP03 still green (50-ID order intact).

## Content/source review

No content, sources, or assessment policy touched. Definition-terms set (12) recorded as blocked→T03 (official-booklet reconciliation), not excluded. Later-theme sets + film/chart/novel specials recorded as blocked with owning tickets (T14/T16/T18). No teacher/lead approvals required or claimed.

## Not run / failed / blocked

- tsx suite run: environmental EPERM; lead/CI must run `npx tsx --test scripts/tests/aboriginal-studies-30-parity.test.ts` (expect 14/4).
- Browser coexistence/multi-view DOM proofs: NOT RUN (no browser); T23/rollout.
- Pre-existing shell test (scripts/tests/aboriginal-studies-30-shell.test.ts): NOT RUN in sandbox (tsx EPERM; node cannot resolve its ../lib import) — unchanged from T00 baseline, unrelated to mapping.
- One test-authoring bug fixed during T02 (review-line comparison now compares saved values, not label prefixes).

## Next safe step

T03 (scope: assignment data/exports; developer manifests): reconcile the 8 visible + 4 shell assignment records against the official booklets; canonical section→assignment linkage; versioned Halfbreed 4.3 candidate (legacy Inconvenient Indian + work preserved); Statement/Evidence/Interpret/Connect labels; local rubric/criteria links; sourceAudit separation. BLOCKER WARNING: official Theme booklets/textbook/rubric PDFs are not yet located in-repo — T03 needs them for any source-dependent claim; without them only the structural manifest work can proceed. Writer stopped: no — T03 authorized under the same "keep going" directive unless the user stops.
