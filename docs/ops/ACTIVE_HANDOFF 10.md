# Handoff

- Project: `biology30-unit-a`
- Task: Implement the approved Biology 30 Unit A Production V2 Gate 1 vertical slice, then stop for exact-build visual and learning-loop approval.
- Status: blocked awaiting explicit Gate 1 user approval. The exact candidate is built and verified; Gate 2, promotion, commit, export, and Brightspace upload have not started.

## Files changed

- Approved Gate 0 and refreshed source authority: `projects/resources/biology30-unit-a-pilot/v2/gate-0-review.json`, `gate-1-authority-refresh.json`, and `gate-1-source-review.json`.
- Gate 1 lesson, hub, activity, dataset, source, figure, font, and brand inputs: `projects/resources/biology30-unit-a-pilot/v2/content/`, `activities/`, `datasets/`, `figures/`, `assets/`, and `source-and-rights-gate-1.json`.
- Biology-specific renderer, runtime, styles, and transactional build: `scripts/lib/biology30-unit-a/v2/render.ts`, `runtime.ts`, `styles.ts`, and `build.ts`.
- Build CLI and command contracts: `scripts/build-biology30-unit-a-v2.ts`, `package.json`, and `package-lock.json`.
- Backward-compatible shared shell additions and tests: `scripts/lib/next-step-course-shell.ts` and `scripts/tests/next-step-course-shell-authored.test.ts`.
- Gate 1 tests and visual baselines: `scripts/tests/biology30-unit-a-v2-gate1.test.ts`, `e2e/specs/biology30-unit-a-v2.spec.ts`, and `e2e/specs/biology30-unit-a-v2.spec.ts-snapshots/`.
- Blocked generated candidate and reports: `projects/biology30-unit-a/workspace/` and `projects/biology30-unit-a/meta/`.
- Workflow, architecture, fast-path, and handoff documentation: `README.md`, `ARCHITECTURE.md`, `docs/workflows/science-pilot.md`, and `docs/ops/`.

## What changed

- Recorded Gate 0 approval for exact contract SHA-256 `cb773ee76a4c1a20f384a0edcbd764ee64a3af296ed87e0526d95e1ed940f3cc`, scoped only to Gate 1.
- Rechecked Alberta authority. No 2026-27 Biology-specific bulletin was discoverable; the 2025-26 Biology 30 bulletin remains the current subject bulletin, paired with the 2026-27 General Bulletin.
- Visually reviewed source PDF pages 21-30 and 129-133 and documented action-potential, insulin, diabetes, urinalysis, and non-diagnostic correction boundaries.
- Built seven review routes: Overview, an available-lessons index, Lessons 4 and 15, Model Lab, Investigation Notebook, and Practice Hub.
- Recreated the two lessons as semantic web instruction with three original local SVG figures, two substantive keyboard-operable models, six practice items with explanatory feedback, and two saved evidence artifacts.
- Resolved the initial Review Set feedback on the blood-glucose figure in its canonical V2 SVG source: all labels now use explicit wrapping and centring, step circles no longer overlap connector paths, arrowheads use fixed SVG user-space sizing, return arrows terminate cleanly at the regulated-range node, and an after-meal example makes the feedback direction concrete.
- Added locally vendored Hanken Grotesk and Work Sans fonts with OFL licences; the learner package has zero required remote assets and zero unresolved local assets.
- Added versioned local/SCORM persistence for inputs, model state, artifacts, notebook, practice, route progress, and completion. Worst-case encoded state is 36,637 characters, 11,363 below the 48,000-character build guard.
- Added opt-in shared-shell `authored` presentation and `self-contained` chrome assets without changing existing `document` or `ela30` defaults.
- The revised exact Gate 1 candidate workspace SHA-256 is `ef0b900b880cb705fd9b4e8000738b52fcf324ac2ba373d5d60aaf8760d3bf2a`; the previous `a5e9644b…` review hash is obsolete.

## Why this changed

- Gate 1 proves that the supplied PDF and Brightspace material can become readable, independent-first Biology instruction rather than a slide viewer. The two lessons deliberately test abstract neural modelling, health-data interpretation, accessibility, local-first delivery, evidence capture, and persistence before authoring the remaining 15 lessons.
- The first teacher Review Set correctly identified a source-SVG layout defect: oversized marker scaling and manual text coordinates made the blood-glucose loop look misaligned even though its semantic equivalent was accurate.

## Verification run

- `npm run test:biology30-unit-a-v2` — 18/18 passed, including the new arrow-marker and step-node regression.
- `npm run build:biology30-unit-a-v2 -- --project biology30-unit-a --strict` — transactional rebuild passed at exact workspace SHA-256 `ef0b900b880cb705fd9b4e8000738b52fcf324ac2ba373d5d60aaf8760d3bf2a`.
- `npm run test:e2e:biology30-unit-a-v2` — 6/6 passed, including axe, keyboard, persistence, mobile/tablet reflow, and visual baselines.
- `npm run test:e2e:project -- --project biology30-unit-a` — passed.
- `npm run test:e2e:smoke` — passed.
- `npm run test:science-comparison` — 6/6 passed; the five historical pilots remain isolated.
- `npm run validate:manifests`, `npm run verify:typecheck-baseline`, and `npm run build:studio` — passed.
- `npm run course:doctor -- --project biology30-unit-a` — intentionally failed closed with `not-active` because Gate 1 remains `blocked` / `proposal-only-v1`; no Direct write target was enabled.
- Browser inspection confirmed the corrected desktop figure, the concrete example, and the refreshed Studio preview revision. The Review Set items remain for the user to accept or reopen.
- `git diff --check` — no whitespace errors; only unrelated pre-existing Forensics CRLF warnings were emitted.

## Source of truth

- Approved production contract: `projects/resources/biology30-unit-a-pilot/v2/production-contract.json`.
- Gate 1 authored inputs: `projects/resources/biology30-unit-a-pilot/v2/content/`, `activities/`, `datasets/`, `figures/`, and `source-and-rights-gate-1.json`.
- Rebuild ownership: `scripts/lib/biology30-unit-a/v2/build.ts`, `render.ts`, `runtime.ts`, and `styles.ts`.
- Review candidate: `projects/biology30-unit-a/workspace/index.html`.
- Exact review boundary: `projects/biology30-unit-a/meta/gate-1-review.json` and `gate-1-build.json`.

## Fragile areas / watchouts

- Gate 1 approval is valid only for build `ef0b900b880cb705fd9b4e8000738b52fcf324ac2ba373d5d60aaf8760d3bf2a`. Any substantive rebuild requires a fresh review.
- The candidate remains generated and blocked. Do not hand-edit `workspace/index.html`; authoring changes belong in V2 resources and the Biology renderer until Gate 4 promotion.
- The shared shell additions are opt-in; preserve the default remote/document behavior for existing course families.
- The five historical pilots remain untouched. The pre-existing missing manifest in `biology30-unit-a-class-2026-faithful` remains outside Gate 1.
- The repository is broadly dirty with unrelated user-owned changes. Keep all edits and Git operations path-scoped.

## Next prompt should assume

- Gate 1 implementation and automated validation are complete.
- The initial three-item Review Set has been implemented, the Studio preview has been refreshed to the revised candidate, and the user must verify rather than having Codex accept those annotations on their behalf.
- The user must inspect the Overview, Lessons 4 and 15, models, Notebook, and Practice Hub in Studio and either request changes or approve the exact build hash.
- Gate 1 approval authorizes only Gate 2 full-course production: the remaining 15 lessons, full figure/interaction inventory, seven artifacts, and at least 100 practice items.
- Promotion, Studio Edit, commit, SCORM export, Brightspace upload, and publication remain unauthorized.

## What still needs validation

- Human approval of the scientific editorial visual direction, independent-learning loop, explanation depth, model quality, feedback, evidence structure, responsive presentation, and perceived production readiness.
- Full-course academic, visual, accessibility, persistence, and red-team review after Gate 2.
- Gate 4 Studio editability lifecycle and Gate 5 SCORM/Brightspace restoration remain later, separate approvals.

## Known risks

- Gate 1 proves two representative lessons, not all 25 outcomes or all 17 finished lessons.
- Browser accessibility automation found no violations on the required Gate 1 routes, but human assistive-technology review remains part of later acceptance.
- `course:doctor` must continue to reject this blocked generated candidate until the separately authorized Gate 4 ownership transition; making it pass now would violate the review boundary.
- NPM currently reports dependency audit findings elsewhere in the repository; no broad dependency remediation was attempted in this scoped course change.

## Exact next command

`npm run studio`

## Exact next file to open

`projects/biology30-unit-a/meta/gate-1-review.json`

## Do not do next / warnings

- Do not rebuild the candidate before the user accepts or rejects the exact hash.
- Do not start the remaining 15 lessons without explicit Gate 1 approval.
- Do not mark the project active, enable Studio Edit, promote, commit, export SCORM, upload to Brightspace, or publish.
- Do not invoke the five-version comparison builder as the V2 build path.
- Do not stage, reset, clean, or reformat unrelated dirty-worktree paths.
