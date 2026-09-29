# Chapter 3 mastery build milestone P0-P4

Status: blocked review candidate with local pathways for all 32 targets. This is not a gradebook, learner release, or Brightspace-certified course.

The P0–P4 measurements below are historical checkpoint evidence from the prior mastery policy. For the corrected State 14 / policy 2 candidate, use `mastery-coverage-matrix.md` and `mastery-capacity-report.json`.

## P0 baseline

- Repository baseline: `02a9fadc9148bf26c0c93006560375a9c5c6b4ee` on `codex/math-engine-preflight`.
- Immutable imported candidate SHA-256: `0d0597c864e8a705690c6ecaeb16f553073f79e30dd022afa791f467dd094a68`.
- Planning package SHA-256: `f53887be0502260ea30e1deaecfbe6b12c58faa1e2d5af38de8c2fe1a486482f`.
- Canonical implementation remains `projects/math10c-unit3-pilot/workspace/**`; raw and exports are unchanged.

## P1 evidence contract

- Policy: 32 fixed essential targets, equally weighted; stages 0, 25, 50, 75, and 100.
- The score is criterion evidence and is explicitly separate from a grade or teacher confirmation.
- Qualifying evidence requires a fresh first valid submission with support captured before the response.
- One later slip preserves attained evidence and opens a recheck. Confirmed execution, reasoning, and retention gaps cap only the affected stage, and post-gap evidence can re-establish it.
- Retention requires 48 elapsed hours and a later session.

## P2 state and capacity

- `unit3-state-13` keeps compact mastery receipts, actual constructed working, and separate exact resumable drafts and seen ledgers for all eight lessons. It packs seen ledgers as bitsets while reading earlier arrays, retains selected-work protection and a disclosed retirement count for older redundant, unselected submissions. It also preserves the four-check count and unfinished wrong-component mask. Versions 3–12 remain readable.
- The frozen v2 decoder is unchanged. Version 3 work decodes with empty mastery evidence; no completion record is converted into mastery.
- Current receipt/work-record bounds: 192/41. Existing ordinary response, reasoning, selected-work, active/recent, attempt-history, and textbook limits are unchanged. The work bound rose by one only after an actual-bank perfect-path check showed Lesson 3.2 needs three verification tasks for all four targets.
- The authored 32-target path has 164 linked receipts, 33 stage-supporting submissions, eight retained supported repairs, eight full seen ledgers, eight open drafts and selected work. Its legacy-record fixture round-trips to a modeled stage score of 100 at 27,247/52,000 application characters and 9,662/60,000 SCORM-envelope characters. A separate high-entropy 192-receipt/41-record fixture, including four-check records and partially checked drafts, fits at 50,048 application and 46,181 SCORM-envelope characters. Maximum-length work exceeds both limits and is rejected before save. This is local codec evidence, not real elapsed retention, complete real learner history, or Brightspace proof. See `mastery-capacity-report.json`.

## P3 Lesson 3.6 vertical workshop

- The existing lesson instruction, examples, guided practice, and ordinary repair routes remain intact.
- The new workshop separately checks the whole-polynomial GCF, primitive coefficients, `ac` pair, equivalent middle-term split, complete factorization, and expansion verification.
- Independent verification, changed-form transfer with an outside GCF, bounded reasoning evidence, later-session retention plumbing, diagnostic feedback, score explanation, and exact draft resume are implemented.
- Equivalent factor order and valid algebraic equality are accepted through the existing bounded checker; the learner is not forced to copy one factor order.
- The learner-facing header now reports mastery evidence over all 32 targets. The existing eight completion IDs remain private and unchanged for LMS compatibility.
- Four focused browser regressions now cover retained submitted work, unchanged-equality rejection, support exclusion, failed-save rollback, and structural variation through changed-form transfer. The 240-variant factor bank and state migration have executable mathematical tests.

## P4 local chapter pathway

- All eight lessons now have bounded in-lesson paths from varied fresh checks to changed-form transfer/reasoning and later retention. A student can correct the same authored task across four saved mathematical checks; fully correct first through fourth checks earn 100%, 75%, 50%, then 25% of that task's available marks, and a focused repair lowers credit one step. The later evidence stages remain required; repeated tasks and failed saves do not award fresh credit. The exact 32-target mapping is in `mastery-coverage-matrix.md`.
- Lessons 3.1–3.5, 3.7 and 3.8 preserve the original problem and actual submitted fields behind composite evidence, retain a learner-selected record, provide focused repair and return to the preserved work, and fail closed on capacity or save refusal. Lesson 3.6 remains the reviewed vertical model.
- Executable tests check every authored variant, mathematics, focused wrong-component diagnosis and state round trips. Focused Studio-preview browser checks reached transfer in every lesson and reloaded selected work. These are local build checks, not a completed later-session or LMS test.

## Deferred milestones

- P5: the authored full-path local capacity check is complete; real elapsed later-session validation, chapter-wide learner flow and responsive/accessibility review remain.
- P6-P9: teacher workflow, tenant/accessibility validation, controlled learner observation, and release/template freeze.
- Packaging, deployment, commit, push, formal grade export, and learner release were not performed.
