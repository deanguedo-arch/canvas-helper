# Handoff

- Project: science24-unit-b; Science 24 gameplay redesign
- Task: Build the complete B2 gameplay pilot before extending the redesign to C1 → A2 → D2 → B1 → D1 → C2.
- Status: building; B2 pilot technically checked and awaiting concrete play review. Learner and teacher decisions pending.
- Candidate: `Science24-B2-2.1.0-pilot1-c74133f57292`

## Files changed

- B2 canonical `workspace/games/power-budget-challenge/`: `index.html`, `js/app.js`, new `js/gameplay.js`, `js/gameplay-model.js`, `js/gameplay-state.js`, `data/gameplay.json`, `css/gameplay.css`, and README.
- Additive B2 component sources/version in `projects/science24-unit-b/meta/project.json`; status stays planned and course stays blocked.
- Scoped checks/guard: `scripts/test-science24-games.mjs`, `scripts/package-science24-games-review.mjs`, `scripts/lib/science24-games/gameplay-b2-tests.mjs`, `scripts/lib/science24-games/gameplay_b2_browser.py`; scoped README clarification.
- Current suite status and pilot record folder: `projects/science24-unit-a/meta/science24-games-v2/suite.json`, `gameplay-redesign-v1/b2-pilot-1/`. Earlier C1 design is explicitly historical only.

## What changed

B2 has a learner-operated coached repair, four practice missions, preserved independent projector transfer, eight authored replay variants and an open five-service centre lab. Plans drive service indicators and energy accounts. A compact forecast/Run control remains beside the device controls while scrolling. Day replay uses actual quantities, power and runtime, with pause/resume/step and reduced-motion alternatives. Successful trials report actual energy saved or useful-output/efficiency targets.

Predictions precede supported results. Independent entered totals are quantitative predictions before model reveal. Trials and submitted claims remain immutable; edits invalidate current completion. Transfer's first complete response survives correction and remains distinct from supported success. Anonymous state stays in memory; restart confirms and review is printable. Correct first attempts are accepted. Explanation quality is always teacher pending.

The original six scenario IDs, corrected 2.0.1 science bank, pure engine and legacy state are preserved. Gameplay records use 2.1.0-pilot1 and retain the original source content version. The reference workstation transfer remains reference only; canonical T01 retains 0.580 / 0.460 kWh against 0.500 kWh.

## Why this changed

The user found the old games passive and confusing. This candidate lets choices change a working model and provides quick repairs, distinct constraints, native accomplishments and fresh replay decisions. Fun and instructional usability still require actual learners; technical traversal is not engagement evidence.

## Verification run

- `npm run test:science24-games -- --game B2`: 261 independent-fixture/model/state assertions and 88 actual-control Chromium assertions passed. Six core cases, all eight variants and the lab were played through controls. Includes prediction gates, failed/correct trials, alternatives, service floors, immutable history, navigation, transfer revision, hints, keyboard, restart cancel/confirm, rapid activation and animation interruption.
- 1440×900 and 390×844 layouts: focused overflow, local assets and 44 px controls passed; desktop/mobile screenshots inspected. Native IAB opening captured separately. One help-close test race was fixed by waiting for its asynchronous close event; final pass follows that fix.
- 74 current B2 source hashes match browser evidence; science/state receipt records its exact input hashes and independently authored solution hash. Candidate/approval records are unsigned and pending.
- Packaging preflight rejects overwriting rc1 before writes. Preserved ZIP SHA remains `efd7cd4699676fd72343cc8d1c70a1ee18842d501f6483ba88a4fc1eff03b26f`; archived candidate JSON unchanged. 491 non-B2 canonical files and original B2 science/state hashes remain unchanged. All four courses blocked, all suite game components planned.
- Dispatcher branch checked after its small guard update; no full-course, platform or suite regression run.

## Source of truth

`projects/science24-unit-b/workspace/games/power-budget-challenge/index.html` → `js/app.js` → gameplay modules; `data/gameplay.json` overlays the retained science bank. Do not edit the archived delivery PLAY files. Previous B2 entry files are retained in the pilot metadata's `previous-source/`. Candidate hashes, teacher guide, independently authored solutions, blank five-learner protocol and next-lesson application task are in this pilot record folder.

## Fragile areas / watchouts

Changing sources invalidates affected technical evidence and review identity. Preserve first transfer, original core IDs, and separate model correctness/support/completion/explanation judgment. Practice forecasts are calculated support; they do not prove independent arithmetic. The old rc1 packaging path is intentionally guarded until a new versioned packager is implemented. Targeted B2 tests use the new pilot flow; full suite tests defer during redesign. Do not lift guards merely to reuse old evidence.

## Next prompt should assume

B2 is the only implemented gameplay redesign. A1 stays v1.2; C1's earlier proposal is inactive. The user-approved sequence requires concrete B2 play feedback before propagation. The original mockup pixel gate no longer governs redesigned compositions; brand identity and supplied art remain visual constraints. No new package or deployment is authorized at this checkpoint.

## What still needs validation

Dean's gameplay review; five representative learners with the teacher; proposed 30-second start, causal-revision, independent fresh-task and voluntary-replay targets; next-lesson application. All remain pending. Native 200% zoom, screen reader, Safari/Firefox and physical devices: Not tested. Five remaining widths, accumulated suite E2E and offline package parity: deferred until acceptance/rollout. Teacher science/curriculum/usability/accessibility review remains pending.

## Known risks

The 10–15 minute duration, engagement and transfer-of-learning claims are design targets, not established findings. Equal-service equipment choices and the replay's simultaneous starts are authored simplifications. No full Unit B coverage, real building operation, course integration, grading, SCORM, LMS persistence or publishing claim.

## Routing

Sol lead retained the dirty canonical, mathematical and learner-state boundary. Deterministic scripts handled fixtures, validation, hashes and guard checks. No new worker was spawned for this implementation slice. Local reference reuse is recorded; provider-cache telemetry and usage savings are unknown.

## Exact next action

Play the fresh B2 coached opening and centre lab, collect Dean's concrete confusion/engagement feedback, and fix the pilot before beginning C1. The five-learner teacher pilot uses `PLAYTEST_RECORD.txt`; no observations have been filled in.

## Exact next file to open

`projects/science24-unit-b/workspace/games/power-budget-challenge/js/gameplay.js`

## Do not do next / warnings

Do not overwrite rc1, activate courses, edit raw/exports or generated PLAY files, fabricate teacher/learner findings, or treat technical checks as gameplay acceptance. Later packaging requires a new candidate version and accumulated release validation.
