# Ticket T06 completion record

Status: IMPLEMENTED (queue reviewGate: no extra approval beyond the master contract)
Baseline commit/source hashes: dirty overlay continues from the T05 record; this ticket edits workspace/main.js (completion block + progress/review/home copy) and scripts/tests/aboriginal-studies-30-parity.test.ts (slices, seam exposure, COMP03–COMP06). git diff --check clean on all touched paths.
Dirty-overlay/diff digest: cumulative working-tree overlay covers T01–T06 (uncommitted by contract). No Biology/Chemistry/brand files touched. No lesson/prompt/assessment content touched.
Writer/approved scope: main.js completion/status + requirement manifest (queue allowedScope). No new compulsory tasks, locks, or grade weights — verified by COMP05/COMP06. No teacher/lead gate in this ticket.

## Changed files and actual changes

- workspace/main.js:
  - `requiredPromptFieldKeys` (explicit required IDs per kind: table rows×columns, fillBlank blank IDs with blank-1 fallback, single key otherwise) + `promptExpectsSubfields` + `getPromptCompletion` returning `{status: not-started|partial|fields-complete|needs-review, filled, expected}`. No prefix search anywhere in the proof. needs-review fires only for legacy unstructured base text against an incomplete structured task; the raw text stays readable.
  - `promptAnswered` is now a fields-complete equality shim (sole caller was sectionAnswerCount); `sectionAnswerCount` returns `{done, total, partial, needsReview}` with done = fields-complete.
  - Requirement manifest: `REQUIREMENT_ROLE_OVERRIDES` (empty; teacher policy lands here when recorded), `roleForRequirement` (override → known-legacy legacyAssigned → else formative default), `requirementItems` (89 booklet prompts + non-shell written assignments, shell filter reused from the count display), `requirementDenominator` (legacyAssigned only), `isRequirementComplete` (canonical-record reads, so dual pairs count once per requirement), `requirementTotals`.
  - `updateProgress` writes the same refs (progressFill/Percent/Count + inline hook, per the T01 contract) with requirements coverage (`0%`, `0 / N requirements · 4 self-reported` on the COMP01 fixture) instead of the flags-only 100%.
  - `renderBookletReview` rows read `N of M fields-complete` plus `· K partial` / `· K needs review` when nonzero; `renderHome` hero shows requirements coverage. Mark Complete flags, `isUnitComplete`/`isUnitUnlocked`, and all lock behavior untouched (shell lock test still green).
- scripts/tests/aboriginal-studies-30-parity.test.ts (T06 amendment): slices gain the completion/manifest functions and the `assignments`, `BOOKLET_SHELL_ASSIGNMENT_IDS`, `REQUIREMENT_ROLE_OVERRIDES` consts; seam exposes getPromptCompletion/requirement*; new tests COMP03 (Q73 1/2 partial → 2/2 fields-complete), COMP04 (base-only legacy text → needs-review 0/12, raw visible), COMP05 (no gradeWeight fields, formative default, denominator stable under added formative item, dual-pair single write → +2 requirements, solo write → +1), COMP06 (dynamic: progress copy + every booklet status free of mastery/correctness/review/grade claims; static: completion-function sources free of the same after comment stripping).

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-parity.test.ts`: 22/22 pass — COMP01/COMP02 flipped green UNEDITED; COMP03–COMP06 green on first run; all 16 prior greens preserved. Log: meta/ab30-parity/T06-run.log.
- `node --test` state + source suites: 28/28 (18 + 10) — no regressions from the main.js completion rework.
- Shell file-scope runner (/tmp/as30_shell_filescope.test.ts): 10/10 — manifest, shell markup, redlines, locks, and asset assertions all hold after the copy changes.
- `node --check` main.js: SYNTAX_OK. `npx tsc --noEmit`: ZERO errors in touched files.

## Learner-work impact

None destructive: no keys, IDs, answers, flags, or locks changed. Display-only completion semantics: partial work now reads partial instead of answered-or-not, flags read as self-report instead of mastery, and the top progress can no longer show 100% from four buttons with an empty store.

## Content/source review

No content touched. novel-4-3-activation and outcomes-mapping holds carried forward. No grade policy invented or recorded (REQUIREMENT_ROLE_OVERRIDES empty; manifest carries no weights).

## Not run / failed / blocked

- npx tsx --test: same environmental EPERM; lead/CI verification needed (expect parity 22/22, state 18/18, source 10/10, shell 11/11).
- Studio picker shell test + real browser reload/contention/Studio/LMS proofs: same standing T23/T24 debt as T05 (nothing in T06 changes it).
- Nothing failed; nothing blocked.

## Next safe step

T07 (lesson routing, gate ROUTE01–ROUTE08) is next in queue order. Per the contract the writer stops at ticket boundaries: LEAD confirms this record, then authorizes T07. Suggested first T07 move: recon `routeableSections`/query parsing/`gotoLesson`/`syncStudioPreviewRoute` against ROUTE01–ROUTE08 in the matrix.
