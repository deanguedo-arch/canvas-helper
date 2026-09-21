# Codex handoff — preserve the unit; integrate the contracts

## Do not restart or shrink the build

Dean authorized the full Chapter 3 unit and reconciliation of the plan. Preserve all eight lessons, the science-style shell, the optional trig contrast and stable IDs. The old single-lesson boundary is historical. Read `RECONCILIATION_v0.4.md` and `TRACEABILITY.json` first. Do not treat a single attractive screenshot or passed component tests as release acceptance.

## Verified remote baseline and exact execution gap

Connected GitHub reads confirmed `deanguedo-arch/canvas-helper`, `codex/social-ela-updates`, `d0b4cf731dd180cebee908915772e90687d40215`. Targeted scaffold source was inspected at that SHA. The container could not resolve github.com for a checkout. No actual repository checkout, `course:create`, doctor, Studio lifecycle or git write occurred here. Reconcile newer local work before applying anything; do not reset unrelated changes.

## Sources and integration

1. Run `node integration/install-into-canvas-helper.mjs --repo /actual/canvas-helper` for a read-only preflight. Review the exact head/status and new paths. The helper has not been exercised against the actual checkout.
2. An explicitly approved `--apply` runs the repository's real scaffold for `math10c-unit3-pilot`, then adds only new Math-owned files. A different HEAD needs an explicit reviewed `--accept-head EXACT_SHA`. Existing project/module/rebuild paths are refused, not overwritten.
3. The helper places algebra/contracts/state/input-spike sources under `scripts/lib/math-engine/unit3-reconciled/`, declares their copied workspace assets as generated outputs and creates a narrow `scripts/build-math10c-unit3.cjs`. That rebuild never regenerates canonical lesson HTML or question data. The raw scaffold stays untouched.
4. `workspace/index.html`, `styles.css`, `course.js`, `assets/unit-data.js`, logo and tracking contract are canonical project sources. Routine hints and worked support live in actual HTML. Do not reconstruct them from JS.
5. The helper leaves authoring/export eligibility blocked after overlaying the externally authored candidate. Verify the actual source ownership/learner-surface metadata using the supported repository workflow before enabling Studio editing. Do not grant eligibility with a boolean alone.

The integration script is a guarded starting point, not proof that the repository accepts the final metadata. If application fails partway, retain and inspect the new blocked candidate; do not delete unrelated work or pretend the integration completed.

## Priority closures

**First:** execute the official project workflow, inspect source ownership, wire the actual existing shared state owner and run focused production-bridge restoration/failure/capacity checks. Do not add a second LMS owner. Confirm whether the recorded indexed question catalogue/version contract requires a migration for any existing attempt.

**Second:** resolve real input/MathLive compatibility. Native input ships. The optional adapter is disabled, requires an explicitly supplied local 0.110.0 build and has not been tested with the real library. The host blocked distribution access here; no font/library files were supplied. Verify local resources, no remote fallback, CSP, keyboard/iframe behaviour, supported-notation transfer, draft persistence and the actual assistive-technology route before enabling it.

**Third:** use the real Studio controls to edit a hint, rebuild behaviour, reload and Undo; withdraw a faulty topic/family with a clear learner alternative and retained work. Runtime tests exercised canonical DOM wording and source withdrawal, not Studio itself.

**At rollout only:** validate current outcome/source decisions, actual learner inventory, full interaction E2E, accessibility/device matrix, normal browser-origin persistence, actual encoded package, real Brightspace resume/interruption/new attempts/replacement and teacher-visible evidence. Configure approved help/assignment links and accepted report formats. Then separately authorize controlled learner observation. No packaging, deployment or broad learner release was performed or implied here.

## Test discipline

Original `tests/original_M01_M30.json` has SHA-256 `b59def072b94e8a208cb2fef5418b0898620d96a1966fba3c89fbbfcf4431cb5`. Keep it immutable and `not_run`. Add/run bindings in separate files. Component results include all 122 authored answer contracts and 1,584 generated parameter combinations; these are not an independent teacher audit of all content. Browser results use controlled storage and bridge doubles because direct navigation is blocked by the host. Capacity results use the exact referenced codec with a modelled envelope, not a real shared exporter invocation.

Useful commands inside this bundle:

```sh
node tests/check_contracts.cjs
node tests/check_capacity.cjs
python tests/check_preview.py
python tests/assemble.py
```

The browser scripts expect Python Playwright and `/usr/bin/chromium`; adapt the browser executable for the local workstation. Run risk-focused changed tests during Build mode and reserve full Studio/readiness/tenant proof for the explicit rollout checkpoint. Do not turn historical original fixture metadata green.
