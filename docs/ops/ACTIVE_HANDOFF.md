# Handoff

- Project: Social Studies 30-1 Option Two family (`social30-1-related-issue-{1,2,3,4}-option-2`)
- Task: Restore the four user-supplied SCORM lesson snapshots and add issue-specific, textbook-grounded Core Vocabulary plus organized Evidence Bank testing to each course.
- Status: complete on unmerged branch `codex/social30-option2-evidence-origin-tester`; issue-specific vocabulary commit `96f3822c53968a4cf5144fc3478eaa8df061ea5a` is published.

## Summary

- Branch URL: https://github.com/deanguedo-arch/canvas-helper/tree/codex/social30-option2-evidence-origin-tester
- Correct four-SCORM rollback checkpoint: `9739184dbb2c3064ef984d0c9b1d1707efebe665` (`chore(social): restore 30-1 option two snapshots`).
- Vocabulary and organized Evidence Bank implementation: `f573667813ca210dc9f871e6acae65f717cef115` (`feat(social): add 30-1 option two vocabulary testers`).
- Pre-correction vocabulary tester rollback: `dae328cce0d8e72eceecda87024a9f08978e9243`.
- Issue-specific textbook vocabulary correction: `96f3822c53968a4cf5144fc3478eaa8df061ea5a` (`feat(social): tailor 30-1 vocabulary by issue`).
- Issue 1 package: `SOCIAL_30-1_ISSUE_1_NEW.zip`, SHA-256 `5d9a0d38e6d3f6403894490db11cd1c9a0c23e5567448ebd00bd7079ce9cce1a`, 153 files, 23 lessons.
- Issue 2 package: `SOCIAL_30-1_ISSUE_2_NEW.zip`, SHA-256 `e3a9b0798aef6adf92bf88b2222bb9f889102a5d529b95535464bb0ca533a0fb`, 130 files, 22 lessons.
- Issue 3 package: `SOCIAL_30-1_ISSUE_3.zip`, SHA-256 `e25db1cbf008e5d392210907a3a22f293f209f24e1f1dc55944285eda88437e8`, 174 files, 23 lessons.
- Issue 4 package: `SOCIAL_30-1_ISSUE_4_NEW.zip`, SHA-256 `b50eb2c359062fcd0bb25f545271ca007997248c916449ed47e1219d7e86b67f`, 190 files, 13 lessons.
- No PR, merge, SCORM re-export, Brightspace upload, or propagation outside these four Option Two courses occurred.

## Files changed

- `.gitattributes`
- `projects/social30-1-related-issue-{1,2,3,4}-option-2/workspace/**`
- `projects/social30-1-related-issue-{1,2,3,4}-option-2/meta/project.json`
- `projects/social30-1-related-issue-{1,2,3,4}-option-2/meta/conversion-notes.md`
- `projects/social30-1-related-issue-{1,2,3,4}-option-2/meta/e2e-contract.json`
- `projects/social30-1-related-issue-{1,2,3,4}-option-2/meta/social-build.json` (removed as stale builder output)
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Replaced the mismatched Issue 2–4 generated workspaces with the exact SCORM package trees supplied by the user; Issue 1 was also reset to its supplied package before the tester layer was reapplied.
- Preserved each package's manifest, `scorm-bridge.js`, lesson HTML, media, resource previews, source-analysis assets, and legacy theme assets.
- Declared all four slugs as `legacy-snapshot-v1` canonical workspaces. The older Social builder is not authoritative and must not regenerate them.
- Added `#core-vocabulary` after Overview and before Lessons in all four courses, including sidebar and Overview links.
- Issue 1 retains the foundational set: ideology, identity, worldview, individualism, collectivism, liberalism, autonomy, and indoctrination.
- Issue 2 now uses: modern liberalism, mixed economy, Keynesian economics, neo-conservatism, authoritarianism, totalitarianism, communism, and fascism.
- Issue 3 now uses: ideological conflict, deterrence, liberal democracy, imposition of liberalism, illiberalism, civil liberties, dissent, and environmentalism.
- Issue 4 now uses: citizenship, active citizenship, political participation, citizen advocacy, civil disobedience, civility, collective action, and pro-democracy movements.
- Every term names its course source from the supplied *Perspectives on Ideology* chapters, glossary, unit study notes, or matching lesson sequence.
- Each term has word structure, four autosaving Frayer fields, a course-model reveal, and one deliberate Save to Evidence Bank action.
- Kept response IDs stable as `<slug>:core-vocabulary:<term>:<field>` and collection IDs as `<slug>:core-vocabulary:<term>:collection`.
- Replaced the repeated Issue 1 terms in Issues 2-4 with issue-specific morphology, prompts, definitions, characteristics, examples, and non-examples.
- Retained the original Study Guide vocabulary checks as later retrieval practice.
- Organized Evidence Bank entries by Core Vocabulary, lesson section, Source Analysis, direct notebook saves, and legacy fallback without rewriting existing learner data.
- Added `core-vocabulary` to declared learner surfaces and project E2E contracts.

## Why this changed

- The previous propagation used an older Brightspace factory source and reduced Issues 2–4 to 93, 92, and 93 files instead of the supplied 130, 174, and 190-file lesson packages.
- The supplied SCORMs are now the explicit lesson baseline, while the vocabulary/evidence tester remains a narrow direct overlay in `workspace/index.html`.

## Verification run

- All four supplied ZIPs passed `unzip -tq` and SHA-256 verification.
- Clean snapshot comparison before the tester layer: all four workspaces matched their extracted ZIP trees file-for-file.
- Final snapshot comparison: only `workspace/index.html` differs from each supplied ZIP; every other package file remains identical.
- Lesson and Study Guide section hashes remain identical to each corresponding supplied SCORM after the tester overlay.
- `npm run course:doctor -- --project <slug>` — passed for all four; driver `legacy-snapshot-v1`.
- `npm run verify -- --project <slug> --mode workspace` — passed for all four; no missing local assets, embeds, or shell resources. Only expected Google Fonts warnings remain.
- `npm run build:studio` — passed.
- `npx tsx --test scripts/tests/next-step-course-shell-origin-groups.test.ts scripts/tests/e2e-contract-harness.test.ts` — 8/8 passed.
- `npm run test:e2e:project -- --project <slug>` — passed 1/1 for each of the four courses.
- Project E2E covered desktop routes, 390x844 mobile routes, direct Evidence Bank saves, vocabulary collection saves, reload restoration, removal, Print/PDF, and uncaught mobile page errors.
- Textbook source audit — extracted the supplied *Perspectives on Ideology* chapter key terms and glossary with the bundled PDF runtime, then cross-checked selected terms against Unit 3-7 Study Notes and the exact SCORM lesson text.
- Static tester audit — each course has its expected unique eight-term list, 32 unique Frayer response fields, eight unique collection IDs, eight model reveals, eight visible course-source labels, and an E2E collection scenario aligned to the first term.
- Section-boundary audit — content before Core Vocabulary and the entire Lessons-through-Resources suffix remain byte-for-byte identical to `dae328cc` in all four learner files.
- Visible port 5175 checks — Issue 1 source labels, Issue 2 desktop selector and Fascism model reveal, Issue 3 Environmentalism in the one-column mobile Frayer layout, and Issue 4 Pro-democracy Movements model reveal passed.
- `git diff --check` and both staged-path audits — passed.
- Remote head confirmed after the vocabulary correction push: `96f3822c53968a4cf5144fc3478eaa8df061ea5a`.

## Source of truth

- Canonical learner source for each course: `projects/social30-1-related-issue-<n>-option-2/workspace/index.html` plus its adjacent preserved package assets.
- Ownership, supplied-package hash, lesson count, and declared surfaces: `projects/social30-1-related-issue-<n>-option-2/meta/project.json`.
- Human-readable package provenance: `projects/social30-1-related-issue-<n>-option-2/meta/conversion-notes.md`.
- Learner interaction contracts: `projects/social30-1-related-issue-<n>-option-2/meta/e2e-contract.json`.

## Fragile areas / watchouts

- Do not run `scripts/build-social30-related-issues.ts` against these four slugs; it uses the older source that caused the lesson mismatch.
- The supplied ZIP files live under `/Users/deanguedo/Downloads/` and are reference-only. Their hashes and complete expanded workspaces are tracked, but the ZIP containers themselves were not added to Git.
- Only `workspace/index.html` carries the tester overlay. Replacing it from a ZIP would restore the lesson snapshot but remove Core Vocabulary and Evidence Bank grouping.
- Learner responses remain browser/SCORM-local. The open browser contains four previously entered Issue 1 Frayer responses used for persistence verification; they are not committed course data.
- In-app Browser control can log its own MutationObserver instrumentation error during DOM inspection. The project E2E browser contexts reported no uncaught learner page errors.

## Next prompt should assume

- Only the four Social Studies 30-1 Option Two courses are under review.
- `9739184d` is the clean, correct-lesson rollback point if the entire tester is rejected.
- `96f3822c` is the published issue-specific, textbook-grounded tester implementation ready for teacher review.
- `dae328cc` is the rollback point if the issue-specific term correction is rejected but the earlier tester should be retained.
- The older builder-backed `363ed468` result is superseded and must not be used as a lesson reference.
- Studio is running from `/Users/deanguedo/Documents/GitHub/canvas-helper-social30-vocabulary-tester` on port 5175 with Issue 1 Core Vocabulary open.

## What still needs validation

- Teacher acceptance of each issue's new eight-term set, morphology wording, course models, and Evidence Bank grouping.
- If accepted later: separately authorize SCORM export and cross-browser/Brightspace save-and-restore validation.

## Known risks

- Existing unknown legacy evidence remains visible under Other / Legacy Notes rather than being destructively migrated.
- Old browser-local Issue 2-4 drafts that used the repeated Issue 1 term IDs were not deleted or silently migrated; the new issue-specific IDs begin clean and any old saved evidence remains non-destructively available through legacy grouping.
- The tester is direct snapshot work. A future factory migration needs a new verified source manifest that reproduces these exact lesson trees before ownership can change.
- No exported package or LMS behavior is claimed yet; only the preserved workspaces and local learner runtime were validated.

## Exact next command

`npm run studio -- --host 127.0.0.1 --port 5175 --strictPort --clearScreen false`

## Exact next file to open

`projects/social30-1-related-issue-2-option-2/workspace/index.html`

## Do not do next / warnings

- Do not open a PR, merge, export SCORM, upload to Brightspace, or propagate to Social 10/20 without explicit acceptance.
- Do not run the old Social builder against these four legacy snapshots.
- Do not reset or clean the user's original dirty checkout.
- Do not stage `node_modules`, `.runtime/**`, generated exports, test artifacts, or unrelated course changes.
