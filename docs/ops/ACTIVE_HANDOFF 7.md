# Handoff

- Project: `repo-wide`
- Task: Complete PR #1 Direct Editing V1 remediation without adding the separate inline-text editor.
- Status: PR #1 local implementation and release validation remain complete; the Social 30-1 Option 2 and English ELA 20/30 snapshot recoveries below are complete and intentionally uncommitted pending review.

## Social 30-1 Option 2 recovery — 2026-08-19

- Recovery source: `/Users/deanguedo/Downloads/D2LExport_156476_ONLINE_202681940.zip` (SHA-256 `7bbefdc51c55eb6425dd404ba40cf98fed8b2998cf514d9d7e4fcafe9cab54b9`). This is a D2L export containing four nested, complete SCORM 2004 packages—not a single flat SCORM upload.
- Restored exact nested packages into the four Option 2 workspaces: Issue 1 `5d9a0d38e6d3f6403894490db11cd1c9a0c23e5567448ebd00bd7079ce9cce1a` (153 files, 720,606-byte index), Issue 2 `e3a9b0798aef6adf92bf88b2222bb9f889102a5d529b95535464bb0ca533a0fb` (130 files, 731,206-byte index), Issue 3 `e25db1cbf008e5d392210907a3a22f293f209f24e1f1dc55944285eda88437e8` (174 files, 739,450-byte index), and Issue 4 `b50eb2c359062fcd0bb25f545271ca007997248c916449ed47e1219d7e86b67f` (190 files, 560,071-byte index). Each extracted workspace tree matches its nested package file-for-file.
- Reclassified all four projects from `social-related-issues-v1` to `legacy-snapshot-v1`, made `workspace/index.html` the canonical source, removed the active Social rebuild command/output declaration, and let onboarding infer complete declared route/state inventories. The old palette-shell builder remains present only as quarantined historical metadata; do not run it against these snapshots.
- A complete pre-restore backup is retained at `/tmp/canvas-helper-social30-restore.fQzWEg` for this machine/session. The attached D2L ZIP remains the durable recovery source; do not delete it until the restored pages and exports are accepted.
- Studio verification loaded the restored Issue 1 and Issue 4 pages in the embedded preview. Issue 1 showed 23 lessons and 16 editable areas on the overview; Issue 4 showed 13 lessons and the expected restored overview content. Switching courses in Split mode still leaves the prior course as the Original reference until Focus/Match is used; this is a Studio view-state issue, not a workspace-content change.

## English ELA 20/30 snapshot recovery — 2026-08-21

- Recovery sources are the supplied flat SCORM archives in `/Users/deanguedo/Downloads/`: the six ELA 20-1/20-2 packages, the twelve ELA 30-1/30-2 packages, and both duplicate short-story uploads where provided. The selected short-story baseline is the newer July 28 no-suffix archive for ELA 20-1, ELA 30-1, and ELA 30-2. The duplicate ELA 30-2 Film Study archives are byte-identical; the no-suffix archive is canonical. Older duplicates remain recorded as reference alternates rather than silently overwriting the selected snapshot.
- Restored 18 exact package trees into the served main checkout (`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/**/workspace/`). Existing projects were backed up before replacement at `/tmp/canvas-helper-ela-all-restore-main.i6UQou`; no prior workspace was deleted. The parallel verification worktree also contains the same restored set and its backup at `/tmp/canvas-helper-ela-restore-inline.iSqaxH`.
- Existing mappings: ELA 20-1 Feature Film → `ela20-1-feature-film`; Modern Play/The Crucible → `ela20-1-modern-play-crucible`; Novel Study → `ela20-1-novel-study-clean`; Shakespeare/Macbeth package → `ela20-1-shakespeare-macbeth`; Short Stories → `ela20-1-short-stories-pilot`; ELA 20-2 Short Stories → `ela20-2-short-stories`; ELA 30-1 Modern Play → `ela30-1-modern-drama`; Othello → `ela30-1-shakespeare-othello`; Short Stories → `ela30-1-short-stories`; ELA 30-2 Short Stories and Visual Literacy → `ela30-2-short-stories-visual-literacy`.
- New catalog projects: `ela20-2-feature-film`, `ela20-2-modern-play-crucible`, `ela20-2-novel-study`, `ela30-1-feature-film`, `ela30-1-novel-study`, `ela30-2-film-study`, `ela30-2-modern-play`, and `ela30-2-novel-study`. Each is now catalogued as an enabled `legacy-snapshot-v1` with `workspace/index.html` as the only canonical source; prior English factory builders and generated-output claims are quarantined.
- Exact restore proof passed for all 18: each workspace file tree matches its selected ZIP file-for-file. ZIP SHA-256 values, workspace index SHA-256 values, file counts, duplicate policy, and the backup path are recorded in `.runtime/english-snapshot-restore-2026-08-21.json`; learner inventory details are in `.runtime/english-editability-inventory-2026-08-21-main.json`.
- `npm run course:onboard -- --all --apply --report .runtime/course-onboarding-english-2026-08-21-main.json` passed and signaled the running Studio. `npm run verify:course-onboarding -- --all` and targeted `course:doctor`/`verify --mode workspace` passed for all 18 restored projects. The live 5174 catalog was reloaded and visibly lists the new ELA courses; ELA 30-1 Feature Film rendered its restored `Feature Film` overview in Current preview.
- The rendered learner inventory is conservatively `12/18 complete`; six older runtime-heavy snapshots (`ela20-2-short-stories`, `ela30-1-feature-film`, `ela30-1-modern-drama`, `ela30-1-novel-study`, `ela30-1-shakespeare-othello`, `ela30-2-short-stories-visual-literacy`) are explicitly `snapshot-boundary-invalid` because their navigation target set does not exactly match their declared course-page set. They remain restored and Studio-editable through the legacy snapshot map, but no coverage percentage is claimed until their route/state inventory is repaired.
- The served process is currently the main checkout on port 5174. Do not treat the sibling worktree as the live source unless the process is restarted there. No commit or push was made; preserve both backups and the Downloads ZIPs until Brightspace visual acceptance is complete.

## Summary

- PR #1 remains a **draft** on `codex/studio-direct-editing-v1` targeting `codex/studio-roadmap-phases`.
- The three audited release blockers are closed: shared safe URL handling, recipe-derived English factory dependencies, and byte-exact factory Rename rollback.
- The eleven remaining recovery and integrity findings are addressed, including durable saved-draft reopen, no persistent pre-Apply asset API, exact onboarding rollback, `course:create` signaling rollback, and preview-launch cleanup.
- A frozen baseline verifier reports the established ten raw TypeScript diagnostics without calling raw typecheck green. A new isolated proof creates a real Studio-aware course through production `course:create` and proves inventory, thresholds, browser-local save, HTTP Normalize/Apply/reload/restart/Undo, and exact restoration.
- No inline `contenteditable` or parent-owned in-place editor was added. That is intentionally deferred to `codex/studio-inline-text-editing-v1` after the exact PR #1 integration commit and an independent GO.
- Before the recovery above, the existing user-owned `projects/ready-mind/workspace/index.html` change and all unrelated untracked paths remained unstaged and untouched. They remain preserved after the recovery.

## Files changed

- Safety and mutation authority: `app/server/lib/course-editing.ts`, `app/server/lib/course-edit-render-validation.ts`, `app/server/routes/course-edits.ts`, `app/server/studio-server.ts`, `app/shared/course-editing.ts`, and `scripts/lib/course-editing/html.ts`.
- Factory and creation authority: `scripts/lib/english-unit/dependencies.ts`, `scripts/lib/english-unit/factory-build.ts`, `scripts/lib/english-unit/v3-donor-lessons.ts`, `scripts/lib/codex-course.ts`, `scripts/lib/course-onboarding.ts`, and `scripts/lib/new-course-readiness.ts`.
- New evidence gates: `scripts/verify-typecheck-baseline.ts`, `config/typecheck-baseline-v1.json`, `scripts/verify-fresh-course-studio-proof.ts`, `package.json`, `.github/workflows/new-course-readiness.yml`, and `.github/workflows/studio-direct-editing.yml`.
- Regression coverage: `scripts/tests/course-editing.test.ts`, `scripts/tests/course-onboarding.test.ts`, `scripts/tests/codex-course.test.ts`, `scripts/tests/new-course-readiness.test.ts`, `scripts/tests/package-script-contract.test.ts`, and `scripts/tests/studio-architecture.test.ts`.
- Independent-review packet: `docs/audits/2026-08-16-direct-editing-v1-remediation-audit.md`.
- Social 30-1 recovery source and metadata: `projects/social30-1-related-issue-{1,2,3,4}-option-2/meta/project.json` plus the attached D2L export listed above.

## What changed

- URL values now reject raw/encoded control characters, internal whitespace, malformed decoding, protocol-relative/root-absolute/backslash/traversal forms, and executable schemes. One sanitizer governs preview normalization, saved drafts, rich-text links, Apply, and final learner output.
- English factory readiness now derives output dependencies from recipes and donors rather than trusting generated manifest claims. Missing output-affecting dependencies fail closed and stored dependency paths are repository-relative.
- Rename captures both the post-metadata intermediate and final rebuilt fingerprints, then restores the exact pre-Rename write boundary on command, timeout, title, doctor, or rendered-validation failure.
- Saved drafts reopen by durable edit identity through read-only `POST /api/course-edits/reopen`; obsolete stored node IDs are discarded and Studio performs a current Resolve before preview or saving.
- The typecheck baseline gate verifies exactly the known ten normalized diagnostics and fails for additions, removals, changes, or a newly introduced diagnostic in a file changed after the baseline capture. Raw `typecheck` still exits `2` with those ten established diagnostics.
- The fresh-course proof runs in a temporary clean clone and deletes its generated test course afterward. It does not alter the real catalog or worktree.

## Verification run

At implementation head `311d4a4426b3e685481325347fb5fb2a85097d4b`:

- `npm run test:course-editing` — 50/50 passed.
- `npm run test:course-onboarding` — 5/5 passed.
- `npm run test:codex-course` — 5/5 passed.
- `npm run test:new-course-readiness` — 10/10 passed.
- `npm run test:course-editability` — 17/17 passed.
- `npm run test:exports` — 55/55 passed.
- `npm run build:studio` — passed.
- `npm run verify:typecheck-baseline` — passed; raw `npm run typecheck -- --pretty false` exited `2` with the exact established ten diagnostics.
- `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts --grep "direct edits persist"` — passed.
- `npm run test:studio-release` — passed: 162 focused contracts, 58/58 inspection E2E, smoke, and strict project contract.
- `npm run verify:fresh-course-studio-proof -- --report .runtime/fresh-course-studio-proof-local.json` — passed: complete inventory, 26/27 blocks, and 793/818 teacher-text code units, plus real reversible lifecycle.
- `npm run verify:course-editing-pilots` — passed for Direct, English factory, Social factory, and legacy snapshot; each restored its exact boundary.
- `npm run verify:course-onboarding -- --all` — 71/71 passed in the served main checkout. Existing `ready-mind` checkpoint was safely skipped rather than overwritten.
- `git diff --check` — passed before documentation-only updates.
- `npm run course:doctor -- --project social30-1-related-issue-{1,2,3,4}-option-2` — all four passed as `legacy-snapshot-v1`.
- `npm run verify -- --project social30-1-related-issue-{1,2,3,4}-option-2 --mode workspace` — all four passed with no missing local assets, embeds, or course-shell resources.
- `npm run report:course-editability -- --project ... --inventory-only --allow-incomplete` — all four learner inventories complete; the full rendered census was complete for Issue 4 and conservatively incomplete for Issues 1–3 because several large states hit the browser memory limit.
- English ELA recovery in the served main checkout: exact ZIP/workspace parity `18/18`; targeted `course:doctor` `18/18`; targeted `verify --mode workspace` `18/18`; `npm run test:course-onboarding` `5/5`; rendered learner inventory `12/18` complete with six explicit `snapshot-boundary-invalid` results and residue proof pass; live Studio Edit mode verified on ELA 30-1 Feature Film (`23 editable areas · 2 annotation-only`).
- `npm run test:course-editability` — 17/17 passed.
- `npm run verify:course-onboarding -- --all` — 71/71 passed in the served main checkout.
- `npm run build:studio` — passed.

## Source of truth

- Audit instructions and explicit claims: `docs/audits/2026-08-16-direct-editing-v1-remediation-audit.md`.
- Core write, rollback, and Undo authority: `app/server/lib/course-editing.ts` and `app/server/lib/course-edit-transaction.ts`.
- Read-only draft reopen and request boundary: `app/server/routes/course-edits.ts` and `app/server/studio-server.ts`.
- Factory dependency authority: `scripts/lib/english-unit/dependencies.ts`.
- Fresh course and typecheck evidence: `scripts/verify-fresh-course-studio-proof.ts` and `scripts/verify-typecheck-baseline.ts`.
- Published CI authority: `.github/workflows/studio-direct-editing.yml`, `.github/workflows/new-course-readiness.yml`, exact-head push artifacts, and PR #1 merge-context artifacts derived from the final branch head.

## Fragile areas / watchouts

- The Studio filesystem lock coordinates Studio processes, not arbitrary concurrent Codex, Git, manual-editor, or standalone-builder writers. Those writers must not run during Apply.
- A portable filesystem compare-and-swap cannot close the tiny reread-to-rename interval against an uncooperative external writer. The transaction and drift checks fail closed where they can observe it; this remains an operational contract.
- The frozen baseline intentionally compares changed files since baseline capture. One pre-existing diagnostic is in a file that earlier PR work had already changed, so it cannot honestly enforce the plan's stricter literal “any file changed anywhere in PR” wording without treating an inherited baseline diagnostic as newly introduced.
- Local render checks are bounded. Brightspace/deployed-host behavior, cross-browser SCORM, delayed interaction, full WCAG, and teacher rollout remain separate acceptance.
- Coverage and catalog lifecycle evidence do not mean every visible legacy element is editable; runtime/behavior-rich/ambiguous elements remain Annotation-only or need dedicated controls.
- The recovered Option 2 packages are preserved snapshots, not Social factory outputs. Future structural changes should be made in Codex against the snapshot source or through an explicitly reviewed new adapter; running the old Social builder would recreate the version that was replaced.
- The recovery source is currently an external Downloads path rather than a committed repository artifact. Keep its SHA recorded and preserve the ZIP before publishing new SCORM packages.

## Next prompt should assume

- Do not add the inline-text UI, `contenteditable`, or Full Preview editing to PR #1.
- After PR #1 is integrated at an independently approved exact SHA, create `codex/studio-inline-text-editing-v1` from that exact commit—not by assuming `main`—and implement the separate inline-editing plan.
- Keep Apply as the first course-file and course-asset write. Save draft remains browser-local state only.

## What still needs validation

- Publish the scoped commits, then inspect exact-head push and PR merge-context executions of `Studio Direct Editing release gate`, `New course Studio readiness`, and the all-catalog editability census. The push artifact's recorded commit must equal the branch head; the PR artifact may record GitHub's synthetic merge commit while the run's `headSha` remains that same branch head.
- Obtain an independent review verdict before making PR #1 ready for review or merging it.

## Known risks

- The local worktree is intentionally dirty because of user-owned course and untracked data. The isolated fresh-course proof is clean-clone evidence; GitHub exact-head workflows are the release authority.
- `npm run report:course-editability -- --all --allow-incomplete` remains an exhaustive CI evidence job, not a local claim of global legacy element coverage.

## Exact next command

`npm run export:scorm -- --project ela30-1-feature-film --version 2004` (only after visual acceptance; repeat for the accepted ELA snapshots)

## Exact next file to open

`projects/ela30-1-feature-film/meta/project.json`

## Do not do next / warnings

- Do not merge, post review replies, or resolve review threads without explicit repository-owner authorization.
- Do not stage `projects/ready-mind/workspace/index.html`, `.runtime/**`, duplicate resource paths, transaction folders, or alternate handoff files.
- Do not stage or delete the restored Social workspaces until the user accepts the recovered learner pages; review the eight intended Option 2 paths separately from unrelated dirty/untracked files.
- Do not stage or delete the restored English workspaces until the user accepts the recovered learner pages; review the 18 intended ELA paths separately from unrelated dirty/untracked files.
- Do not describe raw typecheck as green or claim final GitHub evidence before the final published SHA has completed.
