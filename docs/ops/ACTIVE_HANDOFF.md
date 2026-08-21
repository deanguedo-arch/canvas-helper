# Handoff

- Project: Social Studies 30-1 Option Two family (`social30-1-related-issue-{1,2,3,4}-option-2`)
- Task: Test origin-organized Evidence Banks across only the four selected Social 30-1 Option Two courses.
- Status: complete on unmerged branch `codex/social30-option2-evidence-origin-tester`; implementation commit `363ed468de628f4793b24b665326cb778c1608cf` is published.

## Summary

- Branch URL: https://github.com/deanguedo-arch/canvas-helper/tree/codex/social30-option2-evidence-origin-tester
- Rollback checkpoint: `567ae750bae7d6d7f1d59b8823a04aa2f11c905f` (`feat(social): organize evidence bank by origin`).
- Four-course tester implementation: `363ed468de628f4793b24b665326cb778c1608cf` (`feat(social): organize option two evidence banks`).
- Issue 1 retains its accepted legacy-snapshot prototype; Issues 2–4 now use the same origin model through their canonical Social builder and shared course shell.
- No non-Option-Two Social course changed.
- No PR, merge, SCORM export, Brightspace upload, or propagation to Social 10/20 occurred.

## Files changed

- `scripts/lib/next-step-course-shell.ts`
- `scripts/build-social30-related-issues.ts`
- `scripts/tests/next-step-course-shell-origin-groups.test.ts`
- `e2e/lib/learner-course-assertions.ts`
- `scripts/tests/e2e-contract-harness.test.ts`
- `projects/social30-1-related-issue-2-option-2/meta/e2e-contract.json`
- `projects/social30-1-related-issue-2-option-2/meta/social-build.json`
- `projects/social30-1-related-issue-2-option-2/workspace/index.html`
- `projects/social30-1-related-issue-3-option-2/meta/e2e-contract.json`
- `projects/social30-1-related-issue-3-option-2/meta/social-build.json`
- `projects/social30-1-related-issue-3-option-2/workspace/index.html`
- `projects/social30-1-related-issue-4-option-2/meta/e2e-contract.json`
- `projects/social30-1-related-issue-4-option-2/meta/social-build.json`
- `projects/social30-1-related-issue-4-option-2/workspace/index.html`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- The shared shell can render one ordered Evidence Bank by collection point:
  1. Core Vocabulary
  2. Lesson Evidence
  3. Source Analysis
  4. Saved Directly in Evidence Bank
  5. Other / Legacy Notes
- Empty groups are omitted. Lesson notes are grouped again by course section when that metadata exists.
- Existing entries are classified at render time; learner evidence is not rewritten or destructively migrated.
- Unknown historical entries remain visible under Other / Legacy Notes.
- Issues 2–4 Source Analysis pages are now stable, deliberate Evidence Bank collections with one collection ID per course.
- Issues 2–4 direct notebook saves now record `evidence-notebook` origin metadata.
- Existing stable response/contribution IDs, autosave, update-without-duplication, removal, and source-response preservation remain intact.
- Issues 2–4 were regenerated only through `scripts/build-social30-related-issues.ts`; generated trailing whitespace is normalized before promotion.
- Issues 2–4 now have project E2E contracts covering Overview, Lessons, one real lesson, Issue Inquiry, Source Analysis, Evidence Bank, Resources, direct saves, collection saves, reload restoration, removal, Print/PDF, and mobile routes.
- Learner interaction checks use Studio's exact capability-scoped preview URL. Studio still proves course selection and route navigation; the isolated learner page prevents Studio preview-health refreshes on the large Issue 3 document from swallowing interaction clicks.

## Why this changed

- Learners can find evidence by where they collected it before reusing it in source responses, position papers, discussions, or exam-style writing.
- The shared builder keeps Issues 2–4 consistent without copying the legacy Issue 1 implementation into generated output by hand.
- Capability-scoped E2E checks preserve the isolated preview security boundary while testing the actual learner runtime.

## Verification run

- Remote checkpoint confirmed before edits: branch head `567ae750bae7d6d7f1d59b8823a04aa2f11c905f`.
- Remote implementation confirmed after push: branch head `363ed468de628f4793b24b665326cb778c1608cf`.
- `npm run test:social-build` — 7/7 passed.
- `tsx --test scripts/tests/next-step-course-shell-origin-groups.test.ts` — 1/1 passed.
- `npm run test:e2e:harness` — 7/7 passed.
- `npm run course:doctor -- --project <slug>` — passed for all four Option Two slugs.
- `npm run verify -- --project <slug> --mode workspace` — passed for all four; no missing assets, embeds, or shell resources. Only expected Google Fonts dependency warnings remain.
- `npm run build:studio` — passed.
- `npm run test:e2e:project -- --project <slug>` — passed 1/1 for each of the four Option Two slugs after the final rebuild.
- Project E2E covered deliberate save, update without duplication, reload restoration, removal without erasing working responses, active routes, Print/PDF, and 390x844 mobile routes.
- Visible Issue 3 learner test at port 5175 — Source Analysis and direct notebook entries appeared in the correct order, restored after reload, and produced no browser console warnings/errors.
- Visible desktop/mobile inspection — restrained green/charcoal styling remained consistent; cards and group headers stacked without horizontal document overflow.
- `git diff --check` and staged diff checks — passed for the implementation commit.
- `npm run typecheck` — retained ten established unrelated diagnostics in legacy English, Forensics, Social 20, and English-factory files; no diagnostic referenced a changed file.

## Source of truth

- Issue 1 legacy tester: `projects/social30-1-related-issue-1-option-2/workspace/index.html`.
- Issues 2–4 canonical builder: `scripts/build-social30-related-issues.ts`.
- Shared Evidence Bank runtime: `scripts/lib/next-step-course-shell.ts`.
- Issues 2–4 generated learner entries: `projects/social30-1-related-issue-{2,3,4}-option-2/workspace/index.html`.
- Interaction contracts: `projects/social30-1-related-issue-{1,2,3,4}-option-2/meta/e2e-contract.json`.

## Fragile areas / watchouts

- Issue 1 remains a `legacy-snapshot-v1` tester and is not regenerated by the Social builder. Preserve it as a separate canonical boundary.
- Issues 2–4 workspace HTML is generated output. Change the shared shell or Social builder, then rebuild; do not patch those generated files by hand.
- The origin normalizer preserves explicit origin data in `metadata.originId`; unknown top-level entry fields are not a safe persistence contract.
- Large Issue 3 embeds can make Studio's health UI refresh the iframe after content is already visible. Learner behavior is verified in the exact capability-scoped preview rather than by weakening preview security.
- Evidence persistence is the existing local/SCORM runtime. No SCORM package or cross-browser LMS restoration was authorized in this tester.
- The browser contains two local demonstration entries for Issue 3. They are browser-local only and are not committed course data.

## Next prompt should assume

- Only the four Social 30-1 Option Two courses are under review.
- The branch is published but intentionally unmerged; `567ae750` is the clean rollback point for rejecting the four-course propagation.
- The implementation is ready for teacher accept/reject testing in the open Studio/learner tabs.
- Search, filters, custom tags, additional collectible lesson activities, other Social levels, exports, and LMS upload remain out of scope unless explicitly approved.

## What still needs validation

- Teacher acceptance of the origin order, headings, and amount of grouping across the four Option Two courses.
- If accepted later: separately authorize SCORM export plus cross-browser/Brightspace save-and-restore validation.

## Known risks

- Existing legacy entries with no recognizable origin use the Other / Legacy Notes fallback; future activities should write explicit `metadata.originId`.
- Shared-shell changes affect other opt-in consumers only when they add `data-organized-evidence-list`; flat legacy lists remain unchanged.
- The repository-wide typecheck is not green because of the recorded unrelated baseline diagnostics.

## Exact next command

`npm run studio -- --host 127.0.0.1 --port 5175 --strictPort --clearScreen false`

## Exact next file to open

`scripts/lib/next-step-course-shell.ts`

## Do not do next / warnings

- Do not open a PR, merge, export SCORM, upload to Brightspace, or propagate to Social 10/20 without explicit acceptance.
- Do not patch Issues 2–4 generated workspace HTML directly; use the builder and rebuild.
- Do not reset or clean the user's original dirty checkout.
- Do not stage `node_modules`, `.runtime/**`, generated exports, test artifacts, or unrelated course changes.
