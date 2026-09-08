# Handoff

- Project: `biology30-unit-a`
- Task: Complete Gate 3 acceptance, Gate 4 Direct promotion/readiness, and the local Gate 5 SCORM release for Biology 30 Unit A.
- Status: promotion infrastructure is complete and tested, but execution remains blocked at the required human-only rubric scores for exact build `e1dce76b7b5292a8e586ad8714f840c32bf344118037cfae84527d41378943fc`. Promotion, Studio editing, commit, SCORM export, Brightspace upload, and publication have not occurred.

## Current continuation

- Added `promote:biology30-unit-a-v2`. It validates the exact candidate, complete user-scored acceptance, all Gate 3 evidence, and unchanged pilot hashes before writing.
- Promotion adds only invisible durable edit identities and Annotation-only runtime markers; it proves stripping those attributes restores the accepted learner HTML byte-for-byte.
- One transaction converts the V2 project to `direct-workspace-v1`, removes proposal rebuild ownership, adds `studio-routine-content-v1`, and marks all five comparison projects `reference-only`. A simulated mid-transaction failure restores every production and pilot path.
- The command deliberately refuses to create or infer the seven human rubric scores. The user must provide them before `human-acceptance.json` can be valid.
- Current promotion regression suite: 33/33 passed. Typecheck baseline remains unchanged.

## Summary

- All 17 Model Lab cards now carry the exact interaction ID for their destination and use the learner-facing action label `Open model`.
- Selecting a card opens the correct lesson, scrolls directly to that model, and moves accessible focus to the model heading. It no longer leaves the learner at the lesson introduction.
- Static validation proves every Model Lab card maps to exactly one interaction in the same lesson route. Playwright verifies direct landing and focus for both the custom Action Potential model and a standard generated model.
- All 17 Practice Hub lesson-check cards now carry the exact lesson-practice destination while keeping the learner-facing action label `Open lesson practice`.
- Selecting a lesson-check card opens the correct lesson, scrolls directly to its guided-practice section, and moves accessible focus to the `Guided practice` heading. Module checks and final practice remain in Practice Hub because they are already at their actual activity location.
- Static validation proves every lesson-check card maps to exactly one practice section in the same lesson route. Playwright verifies direct landing and focus for both the specially authored Lesson 4 and the standard-rendered Lesson 7.
- Rebuilt the Lesson 4 resting-membrane figure in canonical SVG source. Labels, ions, pump copy, voltage notation, and flow arrows now occupy dedicated non-overlapping zones with consistent arrowheads.
- Corrected two tight title stacks found by the new audit in the Lesson 15 blood-glucose figure.
- Complex mobile figures now remain readable inside a contained horizontal evidence lane instead of shrinking SVG labels or expanding the learner page.
- Added a Biology-specific exact-build figure audit. It renders all 28 figure placements representing 27 unique figures inside their real learner routes at desktop, tablet, and mobile widths; measurable overlap, clipping, undersized labels, marked connector collisions, page overflow, and invalid mobile containment fail the command.
- The audit emits four contact sheets. All four were opened and visually inspected for hierarchy, spacing, clipping, labels, arrows, and scientific legibility.
- Added a separate verifier that rejects stale build hashes, changed contact-sheet bytes, omitted figure IDs, unresolved findings, or an incomplete visual-review record.
- Added the 28-placement geometry contract to the normal Biology Playwright suite, so future builds cannot rely on route-top screenshots as proof that all figures were inspected.

## Files changed

- Model Lab and Practice Hub mapping and runtime behavior: `scripts/lib/biology30-unit-a/v2/gate2-render.ts` and `runtime.ts`.
- Accessible destination focus: `scripts/lib/biology30-unit-a/v2/styles.ts`.
- Direct-to-model and direct-to-practice regression coverage: `scripts/tests/biology30-unit-a-v2-gate2.test.ts` and `e2e/specs/biology30-unit-a-v2.spec.ts`.
- Model Lab visual baseline: `e2e/specs/biology30-unit-a-v2.spec.ts-snapshots/biology30-gate2-model-lab-chromium-darwin.png`.
- Canonical figures: `projects/resources/biology30-unit-a-pilot/v2/figures/resting-membrane.svg` and `blood-glucose-loop.svg`.
- Responsive figure rendering: `scripts/lib/biology30-unit-a/v2/styles.ts`.
- Audit and verifier: `scripts/audit-biology30-unit-a-v2-figures.ts` and `scripts/verify-biology30-unit-a-v2-figure-review.ts`.
- Commands and regression tests: `package.json`, `e2e/specs/biology30-unit-a-v2.spec.ts`, and `scripts/tests/biology30-unit-a-v2-gate2.test.ts`.
- Exact-build evidence: `projects/biology30-unit-a/meta/gate-3-figure-audit.json`, `gate-3-figure-visual-inspection.json`, `gate-3-visual-review.json`, and `gate-3-automated-review.json`.
- Generated blocked candidate: `projects/biology30-unit-a/workspace/index.html` and transactional Gate 2 metadata.
- Workflow documentation: `README.md`, `ARCHITECTURE.md`, and `docs/workflows/science-pilot.md`.

## Verification run

- `npm run build:biology30-unit-a-v2 -- --project biology30-unit-a --strict` — passed; exact workspace SHA-256 `e1dce76b7b5292a8e586ad8714f840c32bf344118037cfae84527d41378943fc`.
- `npm run audit:biology30-unit-a-v2:figures -- --project biology30-unit-a` — passed; 27 unique figures, 28 placements, three viewports, zero geometry findings.
- Four generated contact sheets — all opened and visually inspected.
- `npm run verify:biology30-unit-a-v2:figure-review -- --project biology30-unit-a` — passed for the exact build and screenshot hashes.
- `npm run test:biology30-unit-a-v2` — 29/29 passed.
- `npm run test:e2e:biology30-unit-a-v2` — 14/14 passed, including direct card-to-model landing/focus, direct card-to-practice landing/focus, and the all-figure geometry contract.
- `npm run test:science-comparison` — 6/6 passed.
- Recorded tree hashes for all five historical pilots were rechecked and remain unchanged.
- `npm run validate:manifests` — passed.
- `npm run verify:typecheck-baseline` — passed; 10 established diagnostics and none in changed files.
- `npm run build:studio` — passed.
- `npm run test:e2e:project -- --project biology30-unit-a` — passed.
- `npm run test:e2e:smoke` — passed.
- `npm run course:doctor -- --project biology30-unit-a` — expected refusal because the candidate remains `blocked` / `proposal-only-v1`.

## Source of truth

- Production contract: `projects/resources/biology30-unit-a-pilot/v2/production-contract.json`.
- Canonical authored content and figures: `projects/resources/biology30-unit-a-pilot/v2/content/` and `projects/resources/biology30-unit-a-pilot/v2/figures/`.
- Build ownership: `scripts/lib/biology30-unit-a/v2/gate2-build.ts`, `gate2-render.ts`, `runtime.ts`, and `styles.ts`.
- Generated review candidate: `projects/biology30-unit-a/workspace/index.html`; do not hand-edit it.
- Figure review evidence: `projects/biology30-unit-a/meta/gate-3-figure-audit.json` and `gate-3-figure-visual-inspection.json`.

## Fragile areas / what might drift

- Any workspace rebuild creates a new candidate hash and invalidates the current figure audit, contact sheets, visual-inspection record, acceptance matrix, and human review boundary. Rerun both figure commands after every substantive rebuild.
- Model Lab direct landing depends on retaining both `data-page-target` for shell routing and `data-open-bio-model` for exact interaction focus.
- Practice Hub direct landing depends on retaining `data-page-target`, `data-open-bio-practice`, and the one-per-lesson `data-bio-practice` destination.
- Contact sheets live under `.runtime/biology30-unit-a-v2-figure-audit/`; they are generated evidence. Their hashes are recorded and the audit can regenerate a fresh set for a new build.
- The project remains intentionally blocked. Do not add Direct edit keys, enable Studio Edit, promote, export, or upload before exact-build human acceptance.
- The repository remains broadly dirty with unrelated user-owned work. Keep all edits and Git operations path-scoped.

## Next prompt assumptions

- Gate 0, Gate 1, Gate 2 production, and refreshed Gate 3 automated/visual red-team work are complete for exact build `e1dce76b7b5292a8e586ad8714f840c32bf344118037cfae84527d41378943fc`.
- The Model Lab and Practice Hub direct-navigation requests and prior figure defect are resolved in canonical source and verified in the generated learner course.
- The user still decides whether the whole course meets the acceptance matrix. Automated evidence never constitutes acceptance.

## Known risks / follow-up

- Geometry and contact-sheet review greatly reduce missed visual defects but do not replace assistive-technology testing or final teacher judgment of scientific emphasis.
- Gate 4 Studio Edit-map and reversible draft/reload/Undo verification remain pending human acceptance.
- Gate 5 SCORM and Brightspace learner-account restoration remain pending separate release authorization.

## Exact next command

After the user supplies all seven category scores and accepts the exact hash:

`npm run promote:biology30-unit-a-v2 -- --project biology30-unit-a --acceptance projects/biology30-unit-a/meta/human-acceptance.json`

## Exact next file to open

`projects/biology30-unit-a/meta/gate-3-human-acceptance-template.json`

## Do not do next / warnings

- Do not rebuild unless responding to new review feedback; rebuilding supersedes the exact review hash.
- Do not mark active, enable Studio Edit, promote, commit, export SCORM, upload, or publish without the required authorization.
- Do not invoke the five-version comparison builder for V2.
- Do not stage, reset, clean, or reformat unrelated dirty-worktree paths.
