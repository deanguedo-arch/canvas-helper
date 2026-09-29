# Ticket T09 completion record

Status: IMPLEMENTED (queue reviewGate: no extra approval beyond the master contract)
Baseline commit/source hashes: dirty overlay continues from the T08 record; this ticket adds workspace/practice-data.js, workspace/practice-engine.js, scripts/tests/aboriginal-studies-30-practice.test.ts, and edits workspace/learning-store.js (practice runtime + write-order fix), workspace/main.js (practice route/catalog/run/cards/quizzes UI), workspace/course-data.js (coreVocabulary export surface), workspace/index.html (script tags), workspace/styles.css (practice styles), contracts/learning-contract.d.ts (practice types).
Dirty-overlay/diff digest: cumulative working-tree overlay covers T01–T09 (uncommitted by contract). No Biology/Chemistry/brand files touched. No lesson prose touched. No assignment IDs, keys, answers, flags, locks, or completion semantics changed.
Writer/approved scope: practice bank/engine; main.js practice UI; styles.css (queue allowedScope); store practice runtime. No teacher/lead gate in this ticket. No new compulsory workload, auto-grades, or LMS claims: practice is unscored formative work with reviewed-only items.

## Changed files and actual changes

- workspace/practice-data.js (new, script tag before main.js): MODES catalog (matching + concept-cards offered; fill-in/ordering/short-answer/essay/reflection declared unoffered with explicit reasons), BANK_VERSION, coreVocabulary accessor over the 94 course terms.
- workspace/practice-engine.js (new): reviewed-only gate (eligibleItems with per-item exclusion reasons), seeded buildMatchingItems (stable ids + option order per seed), without-replacement sampling with honest exhaustion counts, submitFirst (save-before-feedback, draft preserved on failure), revisions append-only, narrow fill-in grading (reviewed accepted-answers only, never fuzzy), feedbackFor (explanatory text + teaching link), exposure tracking, keyboard-order ops.
- workspace/learning-store.js: practice runtime (startPracticeRun/submitPracticeAttempt/markPracticeExposed/finishPracticeRun/getPracticeRun/getPracticeAttempt/getPracticeExposure/listPracticeRuns on the ui envelope, attempts in the activity envelope) + GHOST-WRITE FIX: refreshProgressUi() moved before the in-place mutation in all 4 practice writers (it reloads runtime.ui from storage; called after mutation it wiped the write, committed the wiped state, and still returned ok:true).
- workspace/main.js: practice route (catalog/run/cards screens), matching run UI (native radio groups + written reasoning box), concept cards (zero-submit path), quizzes compatibility surface; practiceView state; reviewed-gate enforcement at run start.
- workspace/course-data.js: coreVocabulary surface consumed by the bank (no lesson edits).
- workspace/index.html: practice-data + practice-engine script tags.
- workspace/styles.css: practice catalog/run/card/feedback rules.
- contracts/learning-contract.d.ts: practice run/attempt/item/mode types.
- scripts/tests/aboriginal-studies-30-practice.test.ts (new): own vm seam (adapter + bank + engine + practice slices). PRACT01–12 + RUNTIME-ATTEMPTS (see Evidence).

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-practice.test.ts`: 13/13 pass (PRACT01 reviewed-gate/stable keying, PRACT02 explanatory feedback + teaching link, PRACT03 save-before-feedback + draft-on-failure + no-durable-storage refusal, PRACT04 reasoning verbatim + no grade, PRACT05 reload replay + pinned order, PRACT06 sampling/exhaustion, PRACT07 review labelling, PRACT08 native keyboard controls + order ops, PRACT09 append-only revisions, PRACT10 zero-submit cards, PRACT11 narrow fill-in, PRACT12 honest catalog, RUNTIME-ATTEMPTS submit/duplicate/finish/abandon/unknown paths). Log: meta/ab30-parity/T09-run.log.
- Regression battery same session: 78/78 (22 parity + 18 state + 10 source + 8 route + 7 content + 13 practice). The store write-order fix regressed nothing: STATE01–15 + T05-1–4 all green unmodified.
- `node --check` on learning-store.js: SYNTAX_OK. `npx tsc --noEmit`: ZERO errors in touched files (only pre-existing English-factory verifier errors remain, out of scope).
- Caught and fixed during T09: (1) GHOST WRITES — all 8 live-run tests failed with ok:true + null run; root cause was refresh-after-mutate in the 4 practice writers (production bug, fixed by moving refresh before mutation per the write() convention); (2) harness storage:"none" still injected a localStorage global so init fell back to it — context now omits the global for "none" (test-only fix; init fallback is documented T05 behavior).

## Learner-work impact

None to existing work: no keys, IDs, answers, flags, locks, routes, or completion semantics changed. Practice adds NEW envelope surface only (ui.practiceRuns/practiceExposed/practiceRunCounter, activity attempts with practice: task namespace); fresh installs start empty, existing envelopes migrate clean (STATE01 green).

## Content/source review

No lesson prose written or altered. Practice items are generated from the existing 94 coreVocabulary terms with engine-authored stems/feedback — reviewed-gate enforced in code (unreviewed/unkeyed/unfeedbacked/unversioned items excluded with reasons), but TEACHER review of generated stems/feedback per (itemId, contentVersion) is still required before any assessment-adjacent use. Holds carried forward: novel-4-3-activation, outcomes-mapping. No grade policy touched (practice computes no score or grade anywhere — PRACT04/PRACT10 prove it).

## Not run / failed / blocked

- Practice human halves (do the stems teach; feedback tone), browser/keyboard/focus/announcement checks, reduced-motion, responsive: NOT RUN — need a human and/or browser. Partial automated cover exists (PRACT08 native controls/labels/legend; unit-level order ops).
- Shell test file: fails at import (pre-existing ERR_MODULE_NOT_FOUND for scripts/lib/projects.js, untouched by this ticket; lead/CI owns scripts/lib).
- npx tsx --test: same environmental EPERM; lead/CI verification needed (expect practice 13/13 + prior suites unchanged).
- Nothing blocked.

## Next safe step

T10 is next in queue order. Per the contract the writer stops at ticket boundaries: LEAD confirms this record, then authorizes T10. The Lesson 7 exemplar + bulk-rewrite teacher gates from the master instructions still stand for lesson-prose tickets.
