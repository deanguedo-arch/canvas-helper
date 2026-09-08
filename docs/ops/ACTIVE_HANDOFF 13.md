# Handoff

- Project: biology30-unit-a, biology30-unit-b, biology30-unit-c, and biology30-unit-d
- Task: Finish a complete English-language Alberta Biology 30 production course, strengthen Unit A, and build Units B-D to the same exact-build review boundary.
- Status: ready for exact-build human scoring. All four learner candidates are complete, locally verified, visually inspected, and still safely blocked / proposal-only-v1. Units B-D now have red-team-complete review records, exact-build evidence packets, conservative non-authorizing 95/100 agent score recommendations, and a tested transactional human-acceptance recorder bound to their exact build hashes. Human scores, promotion, Studio editing, commit, SCORM export, Brightspace upload, and publication have not occurred.

## Files changed

- Unit A canonical contract and content: projects/resources/biology30-unit-a-pilot/v2/production-contract.json, projects/resources/biology30-unit-a-pilot/v2/content/lessons/lesson-04.html, and the Gate 0/Gate 1 exact-contract review records in the same V2 root.
- Units B-D canonical family: projects/resources/biology30-production/v1/family-contract.json, curriculum-baseline.json, source-catalog.json, source-pdf-manifest.json, source-pdf-visual-review.json, factual-correction-ledger.json, notes-page-disposition.json, units/unit-b/production-contract.json, units/unit-c/production-contract.json, and units/unit-d/production-contract.json.
- Units B-D authored implementation: scripts/lib/biology30-course/v1/blueprint.ts, build.ts, content-b.ts, content-c.ts, content-d.ts, content-factory.ts, content-types.ts, curriculum.ts, figure-grammar.ts, glossary-b.ts, glossary-c.ts, glossary-d.ts, intake.ts, render.ts, and suspend-data.ts.
- Unit A runtime and quality floor: scripts/lib/biology30-unit-a/v2/blueprint.ts, build.ts, gate2-build.ts, gate2-render.ts, promote.ts, runtime.ts, and types.ts.
- Shared learner behavior: scripts/lib/next-step-course-shell.ts.
- New command entrypoints: scripts/intake-biology30-course.ts, scripts/build-biology30-course.ts, and scripts/audit-biology30-course-production-visual.ts.
- Acceptance boundary: scripts/lib/biology30-course/v1/acceptance.ts and scripts/record-biology30-course-acceptance.ts.
- Tests: scripts/tests/biology30-course-production.test.ts, scripts/tests/biology30-course-acceptance.test.ts, scripts/tests/biology30-unit-a-v2-gate2.test.ts, scripts/tests/biology30-unit-a-v2-promotion.test.ts, e2e/specs/biology30-course-production.spec.ts, e2e/specs/biology30-unit-a-v2.spec.ts, and e2e/playwright.biology30-cross-browser.config.ts.
- Commands/dependency metadata: package.json and package-lock.json.
- Generated exact candidates and review evidence: projects/biology30-unit-a/workspace/index.html, projects/biology30-unit-b/workspace/index.html, projects/biology30-unit-c/workspace/index.html, projects/biology30-unit-d/workspace/index.html, each project's owned meta reports, projects/biology30-unit-{b,c,d}/meta/quality-readiness-evidence.json, and projects/biology30-unit-{b,c,d}/meta/agent-score-recommendation.json.
- Human review guide: projects/resources/biology30-production/v1/human-review-guide.md.
- Workflow documentation: README.md, ARCHITECTURE.md, docs/ops/FAST_PATHS.md, docs/workflows/README.md, and docs/workflows/science-pilot.md.

## What changed

- The full four-unit inventory is now 117 exact official outcomes, 66 lessons, 90 learner routes, 6,005 required minutes, 1,195 optional minutes, 418 practice items, 66 substantive local interactions, and 33 portfolio artifacts. Required plus optional learning totals 7,200 minutes, or 120 hours.
- Unit A remains a 17-lesson, 23-route production candidate. Its promotion floor is now 95/100, and a regression test proves that an otherwise valid 94-point record cannot promote it.
- Unit A Model Lab and Practice Hub cards land on the exact model or guided-practice activity. Evidence Bank removal preserves the underlying lesson response. The Lesson 4 membrane model and Lesson 15 glucose model were corrected for text fit, labels, and connectors.
- Units B-D were created transactionally from the shared verified Brightspace sources and 395 pages of unit notes. They contain 14, 24, and 11 lessons; 86, 160, and 72 practice items; 8, 12, and 6 artifacts; and one substantive local scientific model per lesson.
- The complete 318-item B-D practice inventory now has 318 unique prompts. Module and final practice cross lesson boundaries, each cognitive label matches the task form, every higher-mental-activity item integrates two evidence streams, and feedback identifies the exact evidence or misconception rather than repeating generic boilerplate.
- Unit C now gives all 24 lessons distinct materials lists and lesson-specific safety, privacy, rights, or non-diagnostic boundaries. Regression tests prevent the old repeated generic notice from returning.
- All 395 source-PDF pages were rendered and visually inspected across 35 contact sheets. Sixteen exact-page correction rules now bind every flagged source claim or presentation issue to a corrected or excluded learner treatment; source renders remain QA references only and are never learner delivery.
- The B-D source catalogue contains 423 manifest items, 237 decoded UTF-16 lesson files, and 202 source-visible questions. Visible chapter quizzes become reviewed formative practice; secure tests, printable keys, teacher-only assessment material, broken LMS launchers, and unrelated units remain excluded.
- All four courses use the restrained self-contained Next Step scientific editorial shell. Required learning makes no Google Slides, YouTube, remote-font, remote-script, remote-image, or remote-simulation request.
- The exact-build B-D visual audit now refuses build/workspace drift and checks every learner route, all 49 scientific models, and all 49 lesson interactions at desktop, tablet, and mobile widths. The latest audit covers 67 learner routes, 201 route-viewports, 49 models, and 147 interaction-viewports; all 40 contact sheets under the 2026-08-31T04-36-50-182Z audit were opened and their recorded checksums reverified with no unresolved learner-facing finding.
- The 49 lesson models no longer repeat one generic three-card layout, and the 49 Model Lab activities no longer repeat one generic dropdown/reveal control. Every lesson has an explicit topic-owned figure and keyboard-operable case-board interaction; both use pathway, feedback, timeline, cycle, layers, comparison, calculation, evidence, and network forms, with at least seven distinct interaction forms in each unit. Build, unit, and visual-audit gates reject missing mappings, legacy generic dropdowns, or insufficiently varied forms.
- The dedicated B-D E2E contract now axe-scans every learner route in Chromium, retains representative axe coverage in Firefox and WebKit, and verifies all-route inventories, mobile exact-activity landing, offline operation, and compact LMS restoration across all three engines.
- Exact-build quality-readiness packets map every 95-point review category to evidence while leaving every human score and decision null. Each B-D candidate now also has a conservative agent recommendation of Academic 24/25, Coherence 19/20, Visual 14/15, Practice 15/15, Accessibility 9/10, Runtime 10/10, and Maintainability 4/5, totaling 95/100. The combined human review guide provides a short representative review route and exact acceptance language.
- Human acceptance remains deliberately empty. The 95/100 agent recommendations are explicitly non-authorizing and cannot promote, enable Studio editing, export, upload, or publish a course.
- `record:biology30-course-acceptance` now provides the post-review recording boundary for Units B-D. It recomputes the workspace hash, validates all exact-build evidence and seven category scores, rejects stale/sub-95/blocker-bearing/incomplete records, refuses overwrite, and rolls back all five target files after a simulated mid-commit failure. A successful record still leaves the project blocked, Studio Edit disabled, and every promotion/export/upload/publication flag false.

## Exact candidate builds

- Unit A: 4908245ee9e176d647e0f927e1fc3f7db99009a8b50ec7e8ec9a86708a6524f0
- Unit B: c810dd85af4ba82dc7f08ddf28ace20a7abe2cc5b731234f245b266e2111d23c
- Unit C: 0814f93c4d74bb6411045d649625ba2bd6c664cf6e98d8147a215c7014f9354a
- Unit D: dcb35045a3a82d8be75b81f24c2649a38f3cbd21efbbcb53c9efafc530847392

## Why this changed

- The earlier Unit A synthesis was a notes/slide conversion rather than a complete first-teach course, and Units B-D did not yet exist as production candidates.
- The user requested all remaining units and a quality threshold high enough to compete with the established Social and English courses.
- The implementation therefore uses exact curriculum/source contracts, locally authored instruction, substantive practice and models, responsive visual auditing, and a human-only 95-point release gate.

## Source of truth

- Unit A production contract and authored fragments: projects/resources/biology30-unit-a-pilot/v2/.
- Units B-D contracts, source catalogue, rights register, exact page dispositions, factual-correction ledger, and completed source-PDF review: projects/resources/biology30-production/v1/.
- Units B-D authored lessons/rendering/runtime: scripts/lib/biology30-course/v1/.
- Shared source archives: projects/resources/biology30-unit-a-pilot/_sources/; do not duplicate or alter them.
- Generated review workspaces: projects/biology30-unit-a/workspace/index.html, projects/biology30-unit-b/workspace/index.html, projects/biology30-unit-c/workspace/index.html, and projects/biology30-unit-d/workspace/index.html; do not hand-edit them while proposal build ownership is active.
- Human review boundaries: projects/biology30-unit-a/meta/gate-3-acceptance-matrix.json, projects/biology30-unit-{b,c,d}/meta/acceptance-matrix.json, projects/biology30-unit-{b,c,d}/meta/quality-readiness-evidence.json, and projects/resources/biology30-production/v1/human-review-guide.md.

## Fragile areas / watchouts

- Any substantive rebuild changes the exact candidate hash and invalidates its visual review, contact-sheet binding, acceptance matrix, and any human decision. Regenerate and re-review all exact-build evidence after such a change.
- Unit A and Units B-D have different owning builders. Never run the five-version pilot builder for the production courses, and never run the Unit A V2 builder against B-D.
- The compact persistence envelopes are below the 48,000-character build guard, but Unit C has the least remaining margin: 4,919 characters. Do not enlarge saved fields without rerunning the budget and LMS restoration tests.
- course:doctor is expected to refuse all four projects while they remain blocked; that is a pre-promotion safeguard, not a defect.
- B-D acceptance recording is implemented, but B-D promotion tooling has not been implemented or authorized. Do not simulate either step by manually changing project metadata; run the acceptance recorder only after an explicit teacher decision.
- The repository is broadly dirty with unrelated user-owned work. Keep all edits, verification, and any later Git staging path-scoped.

## Next prompt should assume

- The instructional builds are complete and ready for teacher review; the next phase is exact-build human scoring and defect feedback, not another bulk generation pass.
- The user should follow projects/resources/biology30-production/v1/human-review-guide.md in Studio; the route is intentionally representative because every route and model has already received exact-build automated and visual coverage. If the representative review agrees with the 95/100 recommendation, the guide contains exact copy/paste confirmation text for all three hashes and all seven category scores.
- After that explicit confirmation exists, create one separate `Biology30CourseAcceptanceV1` submission per unit and run `record:biology30-course-acceptance`; do not populate the current templates or run the recorder before the user decides.
- Scores and approval must identify the exact build hash above. A request such as “fix this item” authorizes a rebuild and therefore supersedes the corresponding review hash; a request such as “approve” still requires recording the seven category scores before promotion.
- No export or LMS upload should happen until a separately authorized promotion/readiness phase is complete.

## What still needs validation

- Human category scores for all four exact candidates, with a total of at least 95/100 and no category below its minimum.
- Teacher confirmation that no factual, instructional, visual, rights, or accessibility blocker remains.
- After acceptance: promotion/readiness, Studio Edit-map and reversible Apply/reload/Undo proof, SCORM archive/runtime validation, and Brightspace learner-account cross-browser save/restore.

## Verification run

- npm run test:biology30-course-production — 17/17 passed, including the canonical 395-page source-PDF review, correction binding, 318 unique and cognitively matched practice prompts, Unit C materials/safety specificity, explicit 49-lesson / nine-form figure and interaction grammars, the exact-build 95/100 recommendation boundary, successful non-promoting acceptance recording for B-D, stale/sub-95/blocker/incomplete rejection, duplicate refusal, and full rollback after a forced mid-commit failure.
- npm run test:biology30-unit-a-v2 — 34/34 passed, including refusal of a 94-point promotion record.
- npm run audit:biology30-course-production:visual — passed for all 67 B-D learner routes, all 201 route-viewports, all 49 scientific models, and all 147 interaction-viewports at 1440×900, 1024×768, and 390×844; all 40 exact-build contact sheets opened and checksums reverified.
- npm run verify:biology30-unit-a-v2:figure-review -- --project biology30-unit-a — passed for 27 unique Unit A figures / 28 placements and four inspected contact sheets.
- npm run test:e2e:biology30-course-production — 3/3 passed across Units B-D, including an axe scan on every learner route in Chromium, mobile reflow, exact hub landing, offline operation, and compact LMS restoration.
- npm run test:e2e:biology30-course-production:cross-browser — seven checks passed on the full run; the Chromium preview-ready handshake and Firefox launch timed out without a learner assertion failure, then both passed on the isolated `--last-failed` rerun. Final coverage is green for all 9 Chromium, Firefox, and WebKit checks, including inventories, overflow checks, representative axe scans, mobile exact-activity landing, and compact LMS restoration.
- npm run test:e2e:biology30-unit-a-v2 — 14/14 passed, including every-figure geometry, interactions, keyboard use, persistence, overflow protection, 200% zoom, and visual snapshots.
- npm run test:e2e:project -- --project biology30-unit-{a,b,c,d} — all four independent project contracts passed during this production pass.
- npm run test:science-comparison — 6/6 passed.
- npm run validate:manifests — passed for all projects.
- npm run verify:typecheck-baseline — passed with the 10 established diagnostics and none in changed files.
- npm run build:studio — passed.
- npm run test:e2e:smoke — passed.
- npm run verify -- --project biology30-unit-{a,b,c,d} --mode workspace — all four passed with no missing local assets, required external dependencies, or missing embeds.
- All A-D review records parse as JSON and point at the exact candidate hashes; every B-D recorded contact-sheet checksum was reverified. Every B-D quality packet matches its build, curriculum, practice, interaction, persistence, figure grammar, and visual reports and resolves every listed evidence path. B-D production-review status is `red-team-evidence-passed-awaiting-human-score`, with score and decision still null.
- npm run course:doctor -- --project biology30-unit-{b,c,d} — intentionally refused each project with `not-active` because all three remain blocked `proposal-only-v1`; this is the expected pre-promotion safeguard.
- Live Studio discovery was inspected at http://127.0.0.1:5174/: the course selector contains the production Unit A, Unit B, Unit C, and Unit D candidates, and Unit C rendered its complete 24-lesson navigation in the preview.

## Known risks

- Automated and AI-assisted checks cannot substitute for the teacher's final academic judgment or assistive-technology testing.
- The B-D scientific models are semantic authored diagrams in nine explicit visual forms rather than copied slide artwork; later factual refinements must preserve their exact lesson, outcome, source, and figure-grammar mappings.
- Final SCORM and real Brightspace persistence are intentionally untested because export/upload remain unauthorized at this stage.

## Exact next command

npm run studio

## Exact next file to open

projects/resources/biology30-production/v1/human-review-guide.md

## Do not do next / warnings

- Do not invent human scores, mark any project active, enable Studio Edit, promote, commit, export SCORM, upload, or publish without explicit authorization.
- Do not rebuild an accepted exact hash. If review feedback requires a change, rebuild only that unit and regenerate its exact-build visual and acceptance evidence.
- Do not hand-edit generated learner workspaces or alter the immutable ZIP/PDF sources.
- Do not stage, reset, clean, or otherwise disturb unrelated dirty-worktree paths.
