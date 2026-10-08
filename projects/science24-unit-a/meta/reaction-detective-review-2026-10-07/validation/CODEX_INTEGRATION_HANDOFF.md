# Codex handoff — integrate the repaired A1, do not redesign it

Dean authorized repair of the actual first-pass game. This package is the repaired standalone build. **Use `game/` as the implementation source.** Do not reconstruct the runtime from screenshots or regenerate the approved aesthetic.

## Known source of truth

The uploaded audit names this repository location:

`projects/science24-unit-a/workspace/games/reaction-detective/**`

This path comes from the audit's README and implementation evidence; the live repository was not accessed in this repair. Before writing, compare its current contents with the baseline hashes in `provenance/BASELINE_FILE_SHA256.json`. If newer changes exist, preserve them and reconcile a scoped diff. Do not overwrite an independently changed repository blindly.

## Bounded integration

1. Read `README.md`, `docs/RULES_AND_STATE.md`, `docs/SCIENCE_AND_SCOPE.md`, `qa/TEST_REPORT.md` and the unchanged visual standard under `reference/`.
2. Preserve a recoverable copy or commit of the existing game directory.
3. Replace the standalone game's implementation with the complete contents of `game/`. **`engine.js` is new and required.** Keep the script order `scenarios.js → engine.js → game.js`. Keep the six WebP images at the supplied relative paths.
4. Do not copy `provenance/` or concept/reference images into runtime routes. Remove obsolete runtime references only inside the game directory, after confirming nothing uses them.
5. Preview the actual hosted folder, not only `PLAY.html`. Check for missing relative assets, host CSP restrictions, blocked scripts and embedded-height/scroll behaviour.
6. Run the supplied tests on the integrated copy, then manually check the host with keyboard, a real phone and assistive technology. Recheck existing Unit A lessons/save/progress behaviour if any integration is later authorized.
7. Return the exact changed files, a runtime screenshot, test results, version/hash and unresolved failures. Do not claim completion from a screenshot alone.

**Do not change:** course activation/block status, unrelated `meta/project.json` fields, lesson IDs, required checks, course save contracts, LMS reporting, SCORM packaging or deployment. Those are separate approvals. This repair does not authorize publication.

## Never regress these contracts

- Three-zone forest-green investigation workspace; no cyan, sci-fi skin, mascots or generated scientific labels.
- Answer edits cannot leave an old success active. Submitted answers are locked; explicit revision requires rechecking.
- Case reopen preserves support/attempt/seen-evidence history. Transfer first response never becomes “first-attempt correct” after retry.
- P01 uncertainty checkpoint is not a finished classification and does not bypass the identity follow-up.
- Written explanations are **submitted and self-reviewed, not automatically graded**. Do not introduce keyword mastery or an AI/network grader.
- P02 application and P04 environmental choice are checked. Water vapour must not be called a non-greenhouse gas.
- No network/persistence/student identifiers. Reload loss is explicit. Answers are client-side because this is formative practice, not a secure exam.
- Focus stays near the action; only targeted status messages are live.

## Commands

```sh
node --test qa/tests/engine.test.cjs
python3 scripts/build_standalone.py
# QA dependencies only: Python playwright and a supported Chromium installation.
python3 qa/tests/browser_test.py
python3 qa/tests/responsive_test.py 360 390 430 768 1024 1440 1648
python3 qa/tests/keyboard_stress_test.py
python3 qa/tests/capture_preview.py
```

Set `CHROMIUM` to the Chromium executable path when different from `/usr/bin/chromium`. The scripts are repository-local tests, not game dependencies. These authoring tests use the exact single-file content because navigation is restricted in the authoring environment; add a host-navigation smoke test in Dean's environment.

## Acceptance before classroom release

Teacher sign-off on the supplied science/assessment mapping; voice and wording at the intended class level; complete real-device and screen-reader route; native browser zoom; live-host navigation, refresh and asset loading; no unexpected external requests; no changes to required course progress. Keep unperformed items labelled **Not tested**.


## Navigation requirement added in v1.2

Do not remove or simplify the reversible navigation behavior. The persistent **Previous** controls and the per-scenario in-session `rounds` state are part of the accepted learner experience. Back navigation must never erase a draft, evidence selection, submitted answer, feedback state or later in-progress case. `Practise again` is the only intentional fresh-round path.
