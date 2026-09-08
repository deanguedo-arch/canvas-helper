# Handoff

- Project: `biology30-unit-a-pilot`
- Task: Finish the Unit A pilot textbook/review integration and repair textbook links so lessons and reviews visibly open the requested page inside the correct chapter reader while the separate full-screen action opens the whole PDF.
- Status: implementation, automated verification, live Chromium page-number verification, and exact-build visual inspection are complete; ready for explicit user review. The pilot remains intentionally `blocked`, preview-only, Studio Edit disabled, and non-exportable.

## Files changed

- Canonical learner source: `projects/biology30-unit-a-pilot/workspace/index.html`.
- Local learner assets: `projects/biology30-unit-a-pilot/workspace/assets/textbook/chapter-11.pdf`, `chapter-12.pdf`, `chapter-13.pdf`, and `projects/biology30-unit-a-pilot/workspace/assets/review/unit-a-review-seminar-source.pdf`.
- Pilot contracts and evidence: `projects/biology30-unit-a-pilot/meta/textbook-integration.json`, `textbook-resource-report.json`, `improvement-ledger.json`, `project.json`, `prompt-pack.md`, and `e2e-contract.json`.
- Resource preparation: `scripts/lib/biology30-unit-a/pilot-textbook.ts` and `scripts/prepare-biology30-unit-a-pilot-textbook.ts`.
- Tests and visual QA: `scripts/tests/biology30-unit-a-improvement-pilot.test.ts`, `e2e/specs/biology30-unit-a-improvement-pilot.spec.ts`, and `scripts/audit-biology30-unit-a-improvement-pilot-visual.ts`.
- Commands and documentation: `package.json`, `README.md`, `ARCHITECTURE.md`, `docs/ops/FAST_PATHS.md`, and `docs/workflows/science-pilot.md`.

## What changed

- Added a standalone Library with exactly three normalized local textbook PDFs: Chapter 11 (44 pages), Chapter 12 (30 pages), and Chapter 13 (38 pages). The 128-byte Brightspace PDF wrappers are stripped transactionally.
- Added an exact textbook band to all 17 lessons with chapter/section, printed pages, physical PDF page, recommended questions, exact Library navigation, and a persistent attempt-before-answer interaction.
- Organized Lessons under Foundations and textbook Chapters 11-13. Added a separate seven-route Review group containing Review Overview, three chapter reviews, a native five-station Review Seminar, Textbook Unit Review, and required Lesson 17.
- Re-authored learner-visible answer support as native corrected HTML. The 35-page seminar worksheet remains an optional historical copy; the 90-page key remains authoring-only.
- Excluded printable quizzes, quiz keys, the secure Unit A test and answers, teacher-only assessment content, broken launchers, and unrelated files.
- Removed all large lesson-level safety/material cards and the generic “No special materials” wording. Essential cautions now appear only beside the activity they govern; Overview retains the unit safety statement.
- Corrected all 17 retrieval-response layouts while preserving the existing lesson IDs, response IDs, autosave hooks, saved work, 1,505 required minutes, 100 practice items, seven artifacts, and completion rules.
- Added exact-build visual auditing for all 30 routes at desktop, tablet, and mobile, plus all 17 textbook bands and all 17 retrieval blocks at desktop and mobile. The final audit produced 17 contact sheets; every sheet was opened and inspected with no unresolved defect.
- Replaced the unfamiliar `§`/`§§` notation with plain `Section`/`Sections` wording throughout the learner experience and integration contract.
- Corrected lesson, native review, and Review Overview textbook actions so they select the right chapter and replace the embedded PDF iframe at the requested physical page. Replacing the frame is required because Chrome's PDF viewer can ignore a new `#page=` fragment when the existing iframe's `src` is merely mutated.
- Kept `Open chapter PDF full screen` as a separate whole-chapter link with no inherited page fragment. Page-specific actions now affect only the embedded Library reader, then scroll it into view, focus its heading, and announce the printed/PDF page reached.
- Rewrote administrative and implementation-facing learner copy, including completion/scoring, local-delivery, source-version, and pilot language, while retaining appropriate scientific source disclosures.
- Recorded nine candidate improvement rules with owner, automated test, manual check, and conditional Unit B-D adaptation. Every rule remains `awaiting-explicit-user-review`; none is accepted or transferable yet.

## Why this changed

- The user wants Unit A to become the deliberate quality pilot before any process is adapted to Units B-D.
- The Next Step archive contains learner practice and keys, while the CBE archive contains the Unit A textbook chapters. The pilot now combines those approved learner resources without exposing secure assessment material or making external links a completion dependency.
- The previous navigation did not connect lessons to the textbook or offer a coherent review path, all retrieval response blocks shared a layout defect, and the first exact-page implementation changed the PDF fragment without reliably moving Chrome's already-loaded PDF viewer. The teacher's screenshot showed the mismatch directly: learner status requested Chapter 13 PDF page 30 while the visible toolbar remained at page 2.

## Source of truth

- Canonical direct learner source: `projects/biology30-unit-a-pilot/workspace/index.html`.
- Exact source/page/question/correction contract: `projects/biology30-unit-a-pilot/meta/textbook-integration.json`.
- Approved generated-resource report: `projects/biology30-unit-a-pilot/meta/textbook-resource-report.json`.
- Pending pilot rules and visual-inspection record: `projects/biology30-unit-a-pilot/meta/improvement-ledger.json`.
- Immutable Brightspace archives: `projects/resources/biology30-unit-a-pilot/_sources/`.
- Protected starting snapshot: `projects/biology30-unit-a-pilot/raw/`.
- The asset preparer owns only `workspace/assets/textbook/**`, `workspace/assets/review/**`, and `meta/textbook-resource-report.json`; it never owns or rewrites canonical HTML.

## Fragile areas / watchouts

- The improvement ledger is bound to canonical workspace SHA-256 `e674ca1c0dc6122520e19e5b45acdba5ccff6a4d147ce24a2beac2ff16619458`. Any learner HTML change requires a new full visual audit and ledger hash update.
- Final visual evidence is at `.runtime/biology30-unit-a-improvement-pilot-visual-audit/2026-08-31T19-49-19-059Z/visual-audit.json`, SHA-256 `f0ac475dc5404d430c04e3290009070ed5c383fd1c57612344991852c3f4d184`. It reports zero geometry findings and 17 manually opened contact sheets.
- The attempt flags are intentionally independent from normal learner completion and scoring. Do not merge them into lesson-completion state.
- Lesson 17 remains the only required Review destination and retains the existing 24-item final practice.
- `course:doctor` must continue to refuse only with `not-active` while this pilot is blocked.
- The repository is broadly dirty with unrelated user-owned changes and untracked files. Keep future edits and any staging path-scoped.

## Next prompt should assume

- The requested textbook/review integration is implemented and technically verified.
- The follow-up Review Set and browser-annotation issues are resolved: no learner-facing section symbols, exact lesson/native-review/Review-Overview page landing, a whole-PDF full-screen action, and a static learner-language regression scan.
- The next step is the user's learner-facing review in Studio, not B-D transfer, promotion, export, or another bulk rebuild.
- The user can review the Library, one lesson from each chapter, all Review routes, and the retrieval block in Lesson 1. If that review is positive, they may explicitly accept some or all nine rules in `meta/improvement-ledger.json`.
- Acceptance of a rule authorizes only planning a unit-specific B-D adaptation. It does not authorize automatically editing Units B-D.
- Production Unit A and Units B-D still match their recorded exact candidate hashes; no production course changed during this pilot task.

## What still needs validation

- Explicit user review and acceptance or revision of the nine pending Unit A pilot rules.
- If the user requests a learner-facing correction, update only the pilot, rerun the static/E2E/visual suites, open every new contact sheet, and update the exact workspace/report hashes.
- Any later B-D work requires a separate plan that translates only accepted rules through the appropriate production builder and its own exact-build tests.

## Verification run

- `npm run prepare:biology30-unit-a-pilot:textbook -- --project biology30-unit-a-pilot` — passed idempotently; source hashes reverified and no files changed.
- `npm run test:biology30-unit-a-improvement-pilot` — 7/7 passed, including exact contract/inventory, secure exclusions, preserved IDs/time/completion, normalized PDF rendering, pending-rule ledger, idempotence, rollback, and source-drift refusal.
- `npm run test:science-comparison` — 6/6 passed.
- `npm run verify -- --project biology30-unit-a-pilot --mode workspace` — passed with no missing assets, external dependencies, embeds, or shell resources.
- `npm run test:e2e:project -- --project biology30-unit-a-pilot` — passed.
- `npm run test:e2e:biology30-unit-a-improvement-pilot` — 10/10 passed, covering all 30 routes at three viewports, all 17 retrieval layouts, all 17 lesson page jumps, all four native review-page jumps, all four Review Overview direct-reader jumps, iframe replacement/revision, whole-PDF full-screen fallbacks, offline Library behavior, reveal/hide/reload persistence, seminar persistence, keyboard Review navigation, axe scans, 200% zoom, and mobile touch targets.
- `npm run audit:biology30-unit-a-improvement-pilot:visual` — passed with 90 route-viewports, 34 textbook-band placements, 34 retrieval placements, zero geometry findings, and all 17 final contact sheets manually inspected.
- Poppler PDF render QA — representative pages from all three normalized textbook chapters and the historical seminar copy rendered successfully and were visually inspected.
- `npm run validate:manifests` — passed for the full catalog.
- `npm run verify:typecheck-baseline` — passed with 10 established diagnostics and none in changed files.
- `npm run build:studio` — passed.
- `npm run course:doctor -- --project biology30-unit-a-pilot` — intentionally exited 1 with only `ERROR not-active`; no other diagnostic.
- Live Chromium inspection of the current canonical workspace visibly confirmed Chapter 13 Review at PDF page `30 / 38`, Textbook Unit Review at `35 / 38`, and Lesson 4 at Chapter 11 page `14 / 44`. These checks read the rendered PDF toolbar, not only the iframe URL. `course:doctor` independently confirmed the pilot remains blocked.
- The protected pilot raw tree and production Units A-D exactly matched their recorded hashes. Both source ZIPs and the original notes PDF in Downloads retained their required SHA-256 values.

## Known risks

- Automated and Codex visual inspection do not replace the teacher's academic and learner-experience judgment.
- The source textbook and answer material is locally authorized course content; do not publish it publicly.
- The visual-audit evidence lives in ignored `.runtime/**`; regenerating or cleaning runtime evidence requires a fresh manual inspection and ledger update.
- No SCORM/LMS release validation was performed because export and upload were explicitly out of scope.

## Exact next command

`npm run studio`

## Exact next file to open

`projects/biology30-unit-a-pilot/meta/improvement-ledger.json`

## Do not do next / warnings

- Do not mark any ledger rule accepted without explicit user review.
- Do not transfer pilot changes to Units B-D automatically.
- Do not change `projects/biology30-unit-a`, `biology30-unit-b`, `biology30-unit-c`, or `biology30-unit-d`.
- Do not edit `projects/biology30-unit-a-pilot/raw/**` or the source archives.
- Do not enable Studio Edit, promote, commit, export SCORM, upload to Brightspace, or publish without separate authorization.
- Do not stage, reset, clean, or otherwise disturb unrelated dirty-worktree paths.
