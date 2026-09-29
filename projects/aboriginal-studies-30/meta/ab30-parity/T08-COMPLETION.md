# Ticket T08 completion record

Status: IMPLEMENTED (queue reviewGate: no extra approval beyond the master contract)
Baseline commit/source hashes: dirty overlay continues from the T07 record; this ticket adds contracts/learning-contract.d.ts, workspace/lesson-components.js, scripts/tests/aboriginal-studies-30-content.test.ts, meta/ab30-parity/lesson-review-manifest.json, and edits workspace/main.js (v2 branch), course-data.js (schemaVersion only), index.html (script tag), styles.css (block styles), route suite (4 slice names). git diff --check clean on all touched paths.
Dirty-overlay/diff digest: cumulative working-tree overlay covers T01–T08 (uncommitted by contract). No Biology/Chemistry/brand files touched. No lesson prose touched: all 50 lessons stay v1 (no bulk conversion — proven by CONTENT01).
Writer/approved scope: course-data.js schema; main.js + scoped lesson components; styles.css (queue allowedScope). No teacher/lead gate in this ticket.

## Changed files and actual changes

- contracts/learning-contract.d.ts (new): the 9 block types (explanation, source, comparison, figure, workedExample, supportedPractice, independentTask, reflection, assignmentConnection), goal strip, block issues; `editorial` typed authoring-only.
- workspace/lesson-components.js (new, script tag before main.js): self-contained validators + renderers + URL policy. Validation codes per type (missing-*/unknown-type/unapproved-src/unknown-assignment); renderers escape every string, omit absent attribution (never placeholders), emit visible incomplete/unsupported badges (never silent gaps), never emit unapproved URLs, never read `editorial`.
- workspace/main.js: `lessonContentVersion` (default v1-legacy), `isV2Lesson` (non-empty blocks), `lessonBlocksApi` (guarded), `renderV2GoalStrip` (Bio placement: first), `renderV2Blocks` (canonical assignment hrefs + existence check); `renderLessonArticle` branches v2 vs verbatim v1 markup (v1 output unchanged apart from insignificant whitespace).
- workspace/course-data.js: top-level `"schemaVersion": 2` only (reader capability; zero lesson edits).
- workspace/styles.css: goal strip, source card, comparison table, figure, worked/practice/task, reflection, connection, incomplete-badge rules.
- meta/ab30-parity/lesson-review-manifest.json (new): 50 entries generated from real DATA, all (v1-legacy, unreviewed) — teacher reviews flip statuses per (lessonId, contentVersion).
- scripts/tests/aboriginal-studies-30-content.test.ts (new): own vm seam (adapter + components + article slices). CONTENT01-auto (v2 comprehensive + all 50 v1 inline-teaching), CONTENT02-auto (worked-example completeness + directions-only badge), CONTENT03-auto (feedback + differsFrom rules), CONTENT04-auto (manifest coverage/version/explicit-status/zero-claimed), UI02-auto (control names, label resolution, img alt, details/summary, heading hooks, pager landmark), UI03-auto (figure alt/caption, URL matrix 4 approved/9 rejected incl. traversal, unapproved omission, headed comparison tables), SAFE-TEXT (seeded script/img payloads escaped in draft + question fields, editorial invisible, unknown-type badge, canonical/unknown assignment links).
- scripts/tests/aboriginal-studies-30-route.test.ts: slice set gains the 4 v2 helpers (T08 production dependency; the slicer caught the drift loudly).

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-content.test.ts`: 7/7 pass. Log: meta/ab30-parity/T08-run.log.
- Regression battery same session: all suites 65/65 (22 parity + 18 state + 10 source + 8 route + 7 content), shell file-scope 10/10.
- `node --check` on lesson-components.js + main.js + course-data.js: SYNTAX_OK. `npx tsc --noEmit`: ZERO errors in touched files.
- Caught and fixed during T08: (1) route seam needed the 4 new v2 helpers after the article branch (slicer failed loudly, then green); (2) my UI02 draft wrongly required ids on aria-labelled table inputs — aria-label alone is a valid accessible name, test corrected (production untouched).

## Learner-work impact

None: no keys, IDs, answers, flags, locks, routes, or completion semantics changed. v1 rendering preserved (ROUTE06 + all suites green unmodified apart from the 4 slice names). v2 path activates only for lessons carrying blocks (none yet).

## Content/source review

No lesson prose written or altered. No sources added (figure fixtures use synthetic/approved URLs only). Holds carried forward: novel-4-3-activation, outcomes-mapping. No grade policy touched.

## Not run / failed / blocked

- CONTENT01–04 human halves (does the prose teach), UI01 screenshots/reflow, UI04 manual keyboard/focus/dialog/announcement/reduced-motion checks, UI05 conformance certification: NOT RUN — need a human and/or browser. Partial automated cover exists and is referenced (UI02/UI03/SAFE-TEXT green; ROUTE05 focus path; shell reduced-motion + lock assertions). No suite here is presented as conformance proof.
- npx tsx --test: same environmental EPERM; lead/CI verification needed (expect content 7/7 + prior suites unchanged, shell 11/11).
- Nothing failed; nothing blocked.

## Next safe step

T09 (finite practice engine) is next in queue order. Per the contract the writer stops at ticket boundaries: LEAD confirms this record, then authorizes T09. Note: T09's runbook builds practice-data/practice-engine with reviewed authored items and attempt semantics on top of the T05 store — larger than T08; the Lesson 7 exemplar + bulk-rewrite teacher gates from the master instructions still stand for lesson-prose tickets beyond it.
