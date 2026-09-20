# Handoff

- Project: Math 10C generated-course preparation in Canvas Helper.
- Task: Build an Astra-plan-based pre-generation audit harness for the future ChatGPT candidate, using Muse for bounded implementation.
- Status: local Build-mode implementation complete and focused checks passed; no candidate course has been imported, changed, packaged, deployed, committed, or pushed.

## Summary

- Added a read-only Phase A scanner for a future Math 10C ZIP or directory. It inventories the candidate, hashes it, checks archive and reference safety, records static indicators, and maps results to an auditable requirements ledger.
- Added a 33-row requirement matrix derived from the supplied Astra planning and audit prompts. Ten rows are critical stops; unresolved human-only rows remain visible and cannot be hidden by a confidence average.
- Added a report template that separates local artifact alignment from repository/LMS readiness and defines six learner-situation walkthroughs.
- Added a source-inspection inventory of reusable Biology Pilot 3 presentation/state patterns. Chemistry evidence remains blocked/proposal-only and is not treated as a pattern to copy.
- Added optional sparse checkout support to the Muse launcher after a full detached checkout failed for lack of disk space. The successful Muse run changed only its six allowed files. Codex reviewed the complete result, corrected nine concrete issues, and reran focused checks in the main checkout.
- Added a reviewer-owned reference pack with 14 factoring cases and a smaller seven-case right-triangle trigonometry contrast, plus a narrow standard-library verifier. A second Muse run created the first pass; Codex reviewed all five files, independently recalculated all 21 cases, fixed malformed-input, impossible-triangle, and nonprimitive-prime handling, then integrated the result.
- Added a privacy-conscious source registry for all six unique D2L Math exports plus the planning, audit, duplicate, and generated-candidate files. A third Muse run built the first pass. Codex corrected per-archive inspection budgets, real D2L QTI metadata parsing, embedded quiz-question coverage, original-ID relationship resolution, archive safety failures, and complete asset metadata before running all real sources.
- The verified private runtime registry contains 662 HTML records, 3,912 question records, 168 assessment relations, and 9,114 asset records. All 2,954 item references resolve; no prompt, choice, answer, response value, feedback body, or source binary was emitted.

## Files changed

- `scripts/audit-math10c-candidate.py`
- `scripts/test-audit-math10c-candidate.py`
- `tasks/math10c-preflight/ASTRA_REQUIREMENTS.json`
- `tasks/math10c-preflight/AUDIT_REPORT_TEMPLATE.md`
- `tasks/math10c-preflight/EXEMPLAR_STYLE_INVENTORY.md`
- `tasks/math10c-preflight/README.md`
- `scripts/verify-math10c-reference-fixtures.py`
- `scripts/test-verify-math10c-reference-fixtures.py`
- `tasks/math10c-reference-fixtures/FACTORIZATION_CASES.json`
- `tasks/math10c-reference-fixtures/TRIG_CASES.json`
- `tasks/math10c-reference-fixtures/README.md`
- `scripts/build-math-source-registry.py`
- `scripts/test-build-math-source-registry.py`
- `tasks/math-source-registry/SOURCE_INPUTS.json`
- `tasks/math-source-registry/README.md`
- `tasks/math-source-registry/PREGENERATION_WORK_MAP.md`
- `tasks/math-source-registry/VERIFIED_SOURCE_SUMMARY.md`
- `.agents/skills/muse-delegate/SKILL.md`
- `.agents/skills/muse-delegate/scripts/launch.py`
- `.agents/skills/muse-delegate/scripts/test_launcher.py`
- `ARCHITECTURE.md`
- `AGENTS.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## Verification run

- `python3 scripts/test-audit-math10c-candidate.py`: 12 passed.
- Python bytecode compilation for the scanner, scanner tests, Muse controller, launcher, reporter, usage tracker, and launcher tests: passed with an external cache directory.
- `python3 .agents/skills/muse-delegate/scripts/test_launcher.py -v`: 8 passed, including sparse-worktree materialization.
- `git diff --check`: passed.
- Muse run `20260920T201729Z-math10c-preflight-harness-8f43f23a`: completed at base commit `d0b4cf731dd180cebee908915772e90687d40215`; six changed files all within the allowlist; Muse-side diff check passed.
- `python3 scripts/test-verify-math10c-reference-fixtures.py`: 9 passed after Codex review fixes.
- Reference verifier CLI: 14 factoring and 7 trig fixtures passed.
- Separate Codex calculation code independently reconstructed all 14 factorizations and recomputed all 7 trigonometry answers within their declared tolerances.
- Muse run `20260920T203324Z-math10c-reference-fixtures-0cb375a6`: completed at the same base commit; five changed files all within the allowlist; retained-worktree diff check passed.
- `python3 scripts/test-build-math-source-registry.py`: 13 passed after Codex review fixes.
- Full private-source registry run: 17/17 expected files hash-validated; six unique authoritative course exports scanned; output privacy self-audit passed; 2,954/2,954 assessment references resolved; no unsafe paths, duplicate archive members, case collisions, or unreadable archives.
- Muse run `20260920T204435Z-math-family-source-registry-9339cdcf`: completed at the same base commit; five changed files all within the allowlist; retained-worktree diff check passed.

## Muse usage evidence

- The completed observed five-hour window contained 3 delegated prompts, 82 provider calls, 6,828,822 input tokens (6,513,473 cached), 74,340 output tokens, and 34,306 reasoning tokens.
- The Math 10C harness run accounted for 20 provider calls, 1,129,452 input tokens (1,064,404 cached), 22,236 output tokens, and 2,562 reasoning tokens.
- No Muse quota wall was observed. The window closed because five hours elapsed, so these totals measure work obtained during the observed interval rather than Muse's account limit. Direct Muse terminal sessions outside the launcher are not included.
- The new active Muse window contains 1 delegated prompt, 13 provider calls, 504,862 input tokens (463,677 cached), and 19,947 output tokens. No quota wall has been observed.
- Codex usage was sampled immediately before and after the complete reference-fixture cycle: 29% before and 30% after, an observed increase of 1 weekly percentage point. This included contract design, monitoring, full review, corrections, independent math recalculation, integration, and focused verification. The meter is rounded and account-wide, so this is not exact per-task billing. The ignored observation record is `.runtime/muse-delegate/codex-usage-observations.json`.
- The complete Math-family registry cycle moved Codex from 30% to 31%, another observed increase of 1 weekly percentage point. Muse supplied 19 provider calls, 1,156,174 input tokens (1,088,227 cached), and 33,942 output tokens. The current Muse window totals two prompts and 32 provider calls with no quota wall.

## Known risks / follow-up

- The scanner is static triage. It cannot prove mathematical correctness, teaching quality, accessibility conformance, save/resume truth, Brightspace behavior, teacher acceptance, or release readiness.
- Keyword-based learner-flow, factoring, trig, placeholder, and secret checks are indicators requiring human review. The report explicitly preserves those limits.
- The scanner has not yet been run against ChatGPT's actual candidate because that artifact has not been supplied to this checkout.
- The reference fixtures validate a deliberately narrow representation and are audit samples, not curriculum certification or a general learner-answer checker.
- All source-registry question roles remain unclassified. A practice bank cannot be created until a human separates formative candidates from formal/restricted assessments.
- All 9,114 source assets remain rights-unreviewed and unapproved for learner use. Two large archives reached the optional asset-content inspection limit after their manifests, questions, quizzes, and HTML were processed; 270 asset records therefore retain path/size/CRC but not a content SHA-256 or dimensions.
- Broad Studio, course, SCORM, and LMS checks are deferred until a candidate exists and the user requests the rollout checkpoint.

## Source of truth

- `tasks/math10c-preflight/ASTRA_REQUIREMENTS.json` owns the audit requirements and critical-stop list.
- `scripts/audit-math10c-candidate.py` owns deterministic static candidate inspection.
- `tasks/math10c-preflight/AUDIT_REPORT_TEMPLATE.md` owns the human audit structure and separate verdicts.
- `tasks/math-source-registry/SOURCE_INPUTS.json` owns the filename, role, size, hash, course, and source-variant registry for the available Math family.
- `.runtime/math-source-registry-v1/` holds the reproducible private metadata indexes; `tasks/math-source-registry/VERIFIED_SOURCE_SUMMARY.md` is the sanitized durable summary.
- The future imported candidate must declare its own canonical editable entry and sources before integration.

## Fragile areas / what might drift

- Curriculum, calculator, assessment, accommodation, redistribution, and Brightspace tenant rules remain external authority gates and must be refreshed when the candidate is audited.
- Muse CLI flags and event shapes can change; launcher tests cover the current contract.
- Stable IDs in `ASTRA_REQUIREMENTS.json` must never be reused or renumbered after audit evidence starts accumulating.
- Source-registry topic tags are conservative evidence labels, not curricular or assessment classification. Regenerate the private indexes whenever an input hash changes.

## Next prompt assumptions

- The next substantive input is the ChatGPT-produced Math 10C candidate ZIP or directory.
- The six source exports are now indexed for future use, while Math 20-1 and Math 30-1 remain architecture fixtures until the Math 10C pilot passes.
- Phase A means blind source, archive, and static evidence inspection before relying on ChatGPT's claims.
- Codex retains math derivation, source-of-truth decisions, integration, and final confidence claims; Muse may handle another bounded implementation task only through the reviewed launcher.

## Exact next action

When the ChatGPT candidate arrives, run the candidate scanner and compare it with the private source registry. Before then, the next safe Muse task is a private review-pack builder for human classification of factoring/trig questions and rights/accessibility review of images; that task should begin only from a committed or otherwise clean registry base.

```bash
python3 scripts/audit-math10c-candidate.py <candidate-zip-or-directory> \
  --requirements tasks/math10c-preflight/ASTRA_REQUIREMENTS.json \
  --output <phase-a-report.json>
```

## Exact next file to open

`tasks/math-source-registry/VERIFIED_SOURCE_SUMMARY.md`
