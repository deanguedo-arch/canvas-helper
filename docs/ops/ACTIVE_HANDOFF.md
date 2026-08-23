# Handoff

- Project: all 21 active `ela*` catalog projects
- Task: Roll out course-specific Core Vocabulary and Evidence Bank collection across the active ELA catalog.
- Status: complete and pushed on `codex/all-ela-vocabulary-evidence-rollout`; intentionally unmerged with no pull request, factory rebuild, SCORM export, or Brightspace upload.

## Summary

- Rollback point one: `131fb195ee68c9171c2e10287c97ac90fe32bde7` (accepted ELA 10-1 tester head).
- Rollback point two: `e69444aaac631f3a507c86240955929b0a892c1e` (`chore(english): checkpoint restored ELA snapshots`).
- Branch: [codex/all-ela-vocabulary-evidence-rollout](https://github.com/deanguedo-arch/canvas-helper/tree/codex/all-ela-vocabulary-evidence-rollout).
- Family commits:
  - Writing Foundations: `7a8432c706e40c340574baa3cbcb66a550c22288`.
  - Short Fiction: `92a852e6ffb9f2c689c118620d50027fae0fbf5c`.
  - Film: `f50e2051c5464fa61aebf006346212b17e18baa6`.
  - Modern Drama: `b8a0383c525aeeba678d7410bc540309d662f101`.
  - Novel: `c46eb398d9a1be85f3454d80403595cec7af6c33`.
  - Shakespeare: `75e65a6e909da4e96ed36e18e9b0b5c8d3b34299`.
- Shared contract commit: `ab97f5c6fc9fe1927989632bbde5376a2ae3ced0` (`test(english): verify ELA vocabulary contracts`).
- Final implementation repair: `186dced8db6dde110f6c208c565806bf19129f0d` (`fix(english): harden restored ELA learner routes`); the remote branch was confirmed at this SHA before the documentation commit.
- ELA 30-1 preview and Streetcar repair: `cbb20cdb8398efbd45ab261e4f0bc072e4fc2889` (`fix(english): restore ELA 30-1 course previews`); the remote branch was confirmed at this SHA before this handoff update.
- The catalog now contains 21 distinct, source-driven inventories totalling 959 parent concepts. Every course has its own sources, location labels, models, and stream/family emphasis.
- Studio is running on port `5177` with ELA 30-1 Modern Drama (*A Streetcar Named Desire*) open in desktop view.

## Files changed

- Restored snapshot checkpoint and LFS rules: `.gitattributes`, plus complete `workspace/**` and `meta/project.json` snapshots for the 18 ELA 20/30 projects.
- Durable learner sources: `projects/<each active ela slug>/workspace/index.html` for all 21 active ELA projects.
- Learner inventory/contracts: `projects/<each active ela slug>/meta/project.json` and `projects/<each active ela slug>/meta/e2e-contract.json`.
- Factory-quarantine notes where present: selected `projects/<slug>/meta/prompt-pack.md` and `projects/<slug>/meta/conversion-notes.md`.
- Shared verification: `e2e/lib/learner-course-assertions.ts`, `e2e/lib/project-open.ts`, `package.json`, `scripts/tests/e2e-contract-harness.test.ts`, and `scripts/verify-ela-core-vocabulary.ts`.
- Preview repair: `app/server/lib/preview-runtime-relay.ts`, `app/shared/studio-quality.ts`, `app/studio/src/hooks/usePreviewRecovery.ts`, `scripts/tests/preview-security.test.ts`, and `scripts/tests/studio-quality.test.ts`.
- Streetcar repair: `projects/ela30-1-modern-drama/workspace/index.html`, `projects/ela30-1-modern-drama/meta/project.json`, and `projects/ela30-1-modern-drama/meta/e2e-contract.json`.
- Operational record: `docs/ops/ACTIVE_HANDOFF.md` and `docs/ops/ARCHIVED_HANDOFFS.md`.

## What changed

- Every active ELA course has `#core-vocabulary` after Overview and before Lessons, with sidebar, Overview, and Evidence Bank links.
- Each concept provides a course-grounded definition, honest word/phrase structure note, related terms, course location, source selector, four autosaving Frayer fields, model reveal, and deliberate whole-entry Evidence Bank action.
- Response IDs follow `<slug>:core-vocabulary:<concept-id>:<field>`; collection IDs end in `:<concept-id>:collection`.
- Evidence entries upsert through the unchanged `window.nextStepEvidenceBank` API and organize by Activity `Core Vocabulary`, selected source, concept locator, and type `collection`. Removing a collection leaves draft responses intact.
- Source inventories distinguish ELA streams and families rather than copying the ELA 10-1 tester list.
- Existing glossary, short-story-term, literary-term, and review sections remain separate retrieval-practice surfaces.
- All learner-surface metadata and E2E contracts declare complete ordered course-route inventories.
- The shared verifier discovers actual `.course-page` sections and enforces a complete ordered match with inline route declarations, metadata, and E2E contracts, preventing hidden orphan routes.
- Seven preserved Critical Writing Workbook pages in ELA 30-1 Feature Film and Novel Study are now directly navigable and correctly chained.
- The scoped preview relay now canonicalizes the three ELA 30-1 Tailwind requests to exact Tailwind 3.4.17 plugin pins (`forms@0.5.10` and `container-queries@0.1.1`). Unknown versions, plugins, parameters, hosts, and paths still fail closed.
- Project E2E now fails on scoped executable-runtime errors and verifies a rendered `.bg-ink-dark` color sentinel in the three affected courses: ELA 30-1 Modern Drama, Shakespeare Othello, and Short Stories.
- Studio and E2E use shared 50-second bridge and 60-second contract recovery windows so the 2.38 MB Othello snapshot can complete a cold first preview without a false `Preview unavailable` state.
- ELA 30-1 Modern Drama now exposes the two source-backed lessons that its preserved index and section map declared but the workspace had merged away: Lesson 1 Tennessee Williams and Lesson 3 Streetcar Character Powerpoint. Navigation, numbering, route metadata, and 15 completion controls now agree, so progress can reach 100% instead of stopping at 87%.
- Streetcar's overview image uses a scoped full-frame rule instead of a broad `#overview img` override.

## Why this changed

- The accepted ELA 10-1 tester established a usable vocabulary-to-evidence workflow. This rollout adapts it to each course's actual lessons, guides, questions, and assigned works while preserving the recovered SCORM learner baselines.
- Tailwind's pinned CDN endpoint began redirecting its unversioned plugin query to exact plugin-version values that the preview relay correctly rejected as undeclared. The repair declares only those exact upstream pins and adds rendered-style coverage so another executable-runtime failure cannot be hidden by a successful course navigation test.
- The restored ELA 30-1 Streetcar source already declared 15 learning items, but two had been folded into adjacent pages while remaining in progress state. Restoring those source-backed boundaries fixes the learner-visible sequence without inventing content.

## Verification run

- Snapshot intake: all 18 selected Downloads ZIP hashes and exact workspace trees matched `.runtime/english-snapshot-restore-2026-08-21.json` before the checkpoint commit.
- `npm run course:doctor -- --project <slug>` — passed for all 21 active ELA projects (`legacy-snapshot-v1`).
- `npm run verify -- --project <slug> --mode workspace` — passed for all 21 projects; preserved external Google Fonts warnings remain informational.
- `npm run test:e2e:project -- --project <slug>` — passed for all 21 project contracts. The final repaired ELA 30-1 Feature Film and Novel Study contracts passed on the first run after their seven-route exposure.
- Project E2E covers autosave privacy, deliberate collection, all four response IDs, update without duplication, filter placement, reload restoration, removal without draft loss, selectors, model reveals, source changes, and mobile overflow.
- `npm run verify:ela-core-vocabulary` — passed for all 21 courses and confirmed 21 distinct inventories. Final learner route counts include 40 for ELA 30-1 Feature Film and 34 for ELA 30-1 Novel Study.
- `npm run build:studio` — passed (85 modules).
- `npm run test:e2e:smoke` — passed, 1/1.
- `npm run test:e2e:harness` — passed, 7/7.
- `npm run verify:typecheck-baseline` — passed; the ten established diagnostics remain and none is in a changed file.
- `npx tsx --test scripts/tests/preview-security.test.ts scripts/tests/preview-route.test.ts scripts/tests/studio-quality.test.ts` — passed, 37/37 after the preview repair.
- Post-repair isolated project E2E passed for all three affected courses: ELA 30-1 Modern Drama (including 39 routes and 15 completion items), ELA 30-1 Short Stories, and ELA 30-1 Shakespeare Othello. Each reached the rendered Tailwind style sentinel; Othello's clean run passed 1/1 in 124.56 seconds.
- A post-repair 21-course doctor/workspace matrix passed 21/21 for each command. Its extra project-E2E sampling passed 15 courses; ELA 10-2 and ELA 20-2 Short Stories exhausted the 180-second test budget during final mobile/resource checks under concurrent load without a course assertion or runtime failure, and four unaffected courses were not rerun after priority narrowed. The complete pre-repair rollout E2E matrix remains 21/21, and the shared repair changes executable-runtime detection only for the three affected Tailwind shells.
- Visible browser checks on port `5177` confirmed the repaired Streetcar desktop/mobile shell and full lesson order, ELA 30-1 Short Stories styling, and Othello styling. A fresh Othello cold preview became ready in 37.5 seconds without showing `Preview unavailable`.
- `npm run test:studio-inspection` reached 166/168; its two failures are pre-existing stale source-boundary expectations for `ela20-1-modern-play-crucible` that still expect a factory recipe instead of the catalogued `legacy-snapshot-v1` boundary. Focused preview/security suites are green.
- `git lfs fsck --pointers HEAD` — passed (`Git LFS fsck OK`). Crucible and both ELA 30-2 Streetcar MP4 directories are pointer-backed along with the pre-existing Streetcar/Othello paths.
- `git diff --check` — passed.
- Visible desktop/mobile browser audits passed for ELA 10-2 Writing Foundations, ELA 20-2 Short Stories, ELA 30-2 Short Stories and Visual Literacy, ELA 30-1 Feature Film, Modern Drama, Novel Study, Shakespeare Othello, ELA 30-1 Short Stories, and the final ELA 20-1 Film Study review.
- The final ELA 20-1 Film review confirmed 42 concepts, 42 source selectors, 42 model reveals, concept selection, model reveal, zero broken images, 1067/1067 desktop width, 429/429 mobile width, and no new browser errors.

## Source of truth

- Canonical learner sources: `projects/<slug>/workspace/index.html` for each of the 21 active ELA projects.
- Ownership, route inventory, and learner contracts: each project's `meta/project.json` and `meta/e2e-contract.json`.
- Every project remains `legacy-snapshot-v1`; historical `english-unit.json` recipes and English factory commands are quarantined and are not write authority.
- Git rollback authority: `131fb195ee68c9171c2e10287c97ac90fe32bde7`, then restored-snapshot checkpoint `e69444aaac631f3a507c86240955929b0a892c1e`.

## Fragile areas / watchouts

- Do not run an English factory rebuild; it can replace the preserved `workspace/index.html` sources and erase this rollout.
- Five repaired ELA 30-1 snapshots use older route/runtime variants. Their ordered route declarations, lesson exclusion lists, Tailwind guards, and navigation targets must stay aligned with the rendered `<section class="course-page">` inventory.
- `e2e/lib/project-open.ts` and `e2e/lib/learner-course-assertions.ts` are shared infrastructure. Keep capability-bearing preview URLs, the shared recovery deadlines, the scoped runtime-failure assertion, and the rendered Tailwind sentinel intact.
- Tailwind approval is intentionally exact. Do not replace the pinned plugin allowlist with a permissive version regex; a future upstream redirect must be reviewed and tested before its exact destination is admitted.
- Othello's preserved workspace is 2.38 MB and a cold preview normally takes about 38 seconds. A transient Vite/CDP disconnect occurred during a loaded parallel test run; the clean isolated run passed. Do not reduce the 50/60-second recovery deadlines without a faster canonical source.
- Evidence and draft state remain origin-scoped browser storage. SCORM/LMS cross-browser persistence was not tested because export and Brightspace work are outside this branch.
- Large restored media depends on Git LFS availability. A clone without LFS objects will not have complete Crucible, Streetcar, or Othello media.
- `node_modules` is a local untracked symlink used by the running worktree Studio and must never be staged.

## Next prompt should assume

- The all-ELA implementation and verification are complete on the isolated branch and ready for human catalog review.
- The three-course ELA 30-1 preview repair and the Streetcar lesson/progress repair are pushed at `cbb20cdb8398efbd45ab261e4f0bc072e4fc2889`.
- Keep the branch unmerged until the 21-course review is accepted.
- Preserve the whole-Frayer collection contract and course-specific inventories unless learner review identifies a specific change.
- No export or LMS deployment has occurred.

## What still needs validation

- Human content review can still request term, definition, or source-label refinements before acceptance.
- The two load-bound Short Stories project contracts can be rerun sequentially on quiet isolated ports if a fresh complete post-repair 21-project timing matrix is required; neither produced a learner assertion or runtime failure in the concurrent sampling run.
- SCORM packaging, Brightspace upload, and LMS cross-browser persistence remain intentionally out of scope until this tester rollout is accepted.

## Known risks

- A future direct edit can add a learner section without updating route declarations; `npm run verify:ela-core-vocabulary` and the project E2E contracts are the required protection.
- External source labels can drift if a preserved lesson is later renamed without updating its course inventory.
- The three ELA 30-1 Tailwind shells still depend on the approved CDN bundle at preview time. The relay now fails visibly and E2E detects it, but an offline/self-contained CSS conversion would be a separate source adaptation.
- Git LFS quota and availability remain prerequisites for complete media checkout on another machine.

## Exact next command

`npm run studio -- --host 127.0.0.1 --port 5177 --strictPort --clearScreen false`

## Exact next file to open

`projects/ela30-1-modern-drama/workspace/index.html`

## Do not do next / warnings

- Do not merge or open a pull request without explicit approval.
- Do not run an English factory rebuild, export SCORM, or upload to Brightspace.
- Do not stage `node_modules`, `.runtime/**`, `dist/**`, exports, archives, raw ZIPs, or unrelated projects.
