# Handoff

- Project: `biology30-unit-a`
- Task: Complete Biology 30 Unit A Production V2 Gates 2 and 3, incorporate follow-up teacher review, then stop for full-course human acceptance.
- Status: blocked awaiting explicit Gate 3 human scoring and acceptance of exact build `d5d97368a9813ebc62f444dbd011ebe7134e48204412ef03a9bf69cf01162847`. Follow-up review removed learner-facing platform language and aligned all learning intentions and success criteria with the CBE student-communication pattern. Full production and refreshed automated red-team evidence are complete. Promotion, Studio editing, commit, SCORM export, Brightspace upload, and publication have not occurred.

## Summary

- The production candidate now contains all 17 lessons and all 23 learner routes as native, local-first web instruction rather than a slide viewer.
- All 25 Alberta Unit A outcomes have explicit teach, practice, and evidence routes.
- The candidate includes 27 original figures, 17 substantive local interactions, 100 unique formative practice items, seven portfolio artifacts, all learner hubs, local fonts, and SCORM-ready bounded persistence.
- Every original SVG was opened in a real browser render. Clipped labels, crowded text, and misaligned arrows discovered during red-team review were corrected in canonical SVG source and rebuilt transactionally.
- The overview and all 17 lessons now distinguish a student-facing `I am learning to...` learning intention from explicit `I can...` success criteria.
- Visible SCORM, Brightspace, LMS, learning-record, and success-status language was removed from learner routes and runtime feedback while persistence behavior remained intact.
- All required automated Gate 3 evidence passes. The remaining decision is human review against the 100-point acceptance matrix; no score or test may promote the course automatically.

## Files changed

- Full canonical lesson and hub content: `projects/resources/biology30-unit-a-pilot/v2/content/`.
- Canonical activities, datasets, figures, assets, sources, and Gate 2 source QA: `projects/resources/biology30-unit-a-pilot/v2/activities/`, `datasets/`, `figures/`, `assets/`, `gate-2-pdf-visual-qa.json`, and related source/rights records.
- Biology V2 renderer, runtime, styles, validation, and transactional build: `scripts/lib/biology30-unit-a/v2/`.
- Follow-up learner copy and criteria communication: `projects/resources/biology30-unit-a-pilot/v2/content/overview.html`, all lesson sources under `content/lessons/`, plus `gate2-render.ts`, `runtime.ts`, and `styles.ts`.
- Shared authored-shell navigation refinement: `scripts/lib/next-step-course-shell.ts`.
- Commands and tests: `package.json`, `package-lock.json`, `scripts/tests/biology30-unit-a-v2-gate2.test.ts`, `scripts/tests/next-step-course-shell-authored.test.ts`, and `e2e/specs/biology30-unit-a-v2.spec.ts` plus its snapshots.
- Generated blocked candidate and reports: `projects/biology30-unit-a/workspace/` and `projects/biology30-unit-a/meta/`.
- Gate 3 evidence: `projects/biology30-unit-a/meta/gate-3-automated-review.json` and `gate-3-visual-review.json`.
- Workflow and handoff documentation: `README.md`, `ARCHITECTURE.md`, `docs/ops/`, and `docs/workflows/`.

## What changed

- Recorded the user’s approval of exact Gate 1 build `ef0b900b880cb705fd9b4e8000738b52fcf324ac2ba373d5d60aaf8760d3bf2a` and built the remaining 15 lessons without changing the approved visual/learning-loop direction.
- Completed the required 1,505 minutes plus 295 optional minutes across six modules.
- Added Model Lab, Investigation Notebook, Practice Hub, Glossary and Data, Sources and Credits, seven artifact workflows, and all 100 practice items.
- Added 27 original accessible SVGs and 17 keyboard-operable interactions with static or supplied-data fallbacks.
- Added SCORM 2004 state/version logic while keeping release disabled. Worst-case encoded state is 46,142 characters, 1,858 below the 48,000-character build guard.
- Aligned the working notebook Print/PDF control with the shared learner-course print hook after the project contract found the selector mismatch.
- Replaced platform and administration wording with plain student directions for saving, submitting, practising, and choosing a next learning step.
- Added an 18-block regression contract that requires every unit/lesson target area to use `I am learning to...` and `I can...`, and rejects visible SCORM, Brightspace, or LMS wording.
- Preserved all five historical comparison pilots and their source isolation.

## Why this changed

- Gate 1 proved the visual system and two difficult lesson loops. The approved Gate 2/3 scope required turning that slice into a complete first-teach Alberta Biology 30 Unit A course, then subjecting the exact build to academic, visual, accessibility, local-first, persistence, and integration red-team checks.

## Verification run

- `npm run build:biology30-unit-a-v2 -- --project biology30-unit-a --strict` — transactional final build passed at workspace SHA-256 `d5d97368a9813ebc62f444dbd011ebe7134e48204412ef03a9bf69cf01162847`.
- `npm run test:biology30-unit-a-v2` — 29/29 passed.
- `npm run test:e2e:biology30-unit-a-v2` — 11/11 passed.
- `npm run test:science-comparison` — 6/6 passed.
- `npm run validate:manifests` — passed for the complete project catalog.
- `npm run verify:typecheck-baseline` — passed; 10 established diagnostics and none in changed files.
- `npm run build:studio` — passed.
- `npm run test:e2e:project -- --project biology30-unit-a` — passed after aligning the existing notebook print control with the shared hook.
- `npm run test:e2e:smoke` — passed.
- `npm run course:doctor -- --project biology30-unit-a` — intentionally refused authoring context because the candidate remains `blocked` / `proposal-only-v1`; this is the expected pre-promotion guard.
- Twenty-seven canonical SVGs and six representative course screenshots were opened and visually inspected.

## Source of truth

- Production contract: `projects/resources/biology30-unit-a-pilot/v2/production-contract.json`.
- Canonical authored content and figures: `projects/resources/biology30-unit-a-pilot/v2/content/` and `projects/resources/biology30-unit-a-pilot/v2/figures/`.
- Build ownership: `scripts/lib/biology30-unit-a/v2/gate2-build.ts`, `gate2-render.ts`, `runtime.ts`, and `styles.ts`.
- Generated review candidate: `projects/biology30-unit-a/workspace/index.html`.
- Exact build/review boundary: `projects/biology30-unit-a/meta/gate-2-build.json`, `gate-3-acceptance-matrix.json`, `gate-3-automated-review.json`, and `gate-3-visual-review.json`.

## Fragile areas / watchouts

- Human acceptance is valid only for build `d5d97368a9813ebc62f444dbd011ebe7134e48204412ef03a9bf69cf01162847`. The earlier Gate 3 candidate is superseded; any further substantive rebuild invalidates this review boundary.
- The project remains `blocked` / `proposal-only-v1`; do not hand-edit `workspace/index.html` or add Direct-edit metadata before Gate 4.
- The 46,142-character worst-case state is below the 48,000 guard but has only 1,858 characters of guard headroom. Do not expand stored response budgets casually.
- The shared shell change remains opt-in/backward-compatible; existing document and ELA behavior must stay unchanged.
- No 2026-27 Biology-specific information bulletin was discoverable at Gate 2. Recheck Alberta authority again before release.
- The repository remains broadly dirty with unrelated user-owned changes. Keep all edits and Git operations path-scoped.

## Next prompt should assume

- Gate 0, Gate 1, Gate 2 production, and Gate 3 automated review are complete.
- The user must review and score the exact full candidate. Automated evidence already passes but does not constitute acceptance.
- Explicit acceptance of this hash authorizes Gate 4 promotion work only. A commit, SCORM export, Brightspace upload, and publication each remain separate actions requiring authorization at their stated boundaries.
- Gate 4 must atomically freeze the accepted workspace, mark the five pilots reference-only, transition to `direct-workspace-v1`, add durable edit keys, and prove the reversible Studio draft/reload/Undo lifecycle.

## What still needs validation

- Human academic, instructional, visual, practice, and accessibility scoring against `gate-3-acceptance-matrix.json`, with a total of at least 90/100, every category at or above its minimum, and no binary blocker.
- Gate 4 Studio Edit-map inspection and reversible edit lifecycle after acceptance.
- Gate 5 SCORM archive/runtime validation and Brightspace learner-account restoration after separate release authorization.

## Known risks / follow-up

- Automated axe and keyboard checks cannot replace a human assistive-technology review.
- The generated workspace is intentionally not Studio-editable yet; `course:doctor` and new-course readiness belong to Gate 4 after the ownership transition.
- No SCORM archive or LMS upload exists yet, so cross-browser Brightspace restoration remains unproven until Gate 5.

## Exact next command

`npm run studio`

## Exact next file to open

`projects/biology30-unit-a/meta/gate-3-acceptance-matrix.json`

## Do not do next / warnings

- Do not rebuild the candidate before the user accepts or rejects the exact hash.
- Do not mark the project active, enable Studio Edit, promote, commit, export SCORM, upload to Brightspace, or publish without the next explicit authorization.
- Do not invoke the five-version comparison builder as the V2 build path.
- Do not stage, reset, clean, or reformat unrelated dirty-worktree paths.
