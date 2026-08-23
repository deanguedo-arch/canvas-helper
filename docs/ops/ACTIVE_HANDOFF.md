# Handoff

- Project: `ela10-1-short-stories`
- Task: Build an isolated English 10-1 Core Vocabulary and Evidence Bank tester.
- Status: complete and pushed on `codex/ela10-1-vocabulary-evidence-tester`; intentionally unmerged with no pull request, SCORM export, or Brightspace upload.

## Summary

- Rollback checkpoint: `fda171dc56371019a55e56dfb8363a28c346ae79`.
- Scoped-preview E2E repair: `c7cfc5f9db8c188b99d7016554af131badc1052c` (`fix(e2e): use scoped learner preview URLs`).
- Tester implementation: `323f1c8c10d32c8d280c235bed82ad14bc5fa785` (`feat(english): add ELA 10-1 vocabulary evidence tester`).
- Branch: [codex/ela10-1-vocabulary-evidence-tester](https://github.com/deanguedo-arch/canvas-helper/tree/codex/ela10-1-vocabulary-evidence-tester).
- The first remote branch state at the rollback SHA was confirmed before editing; each implementation commit was pushed and its remote head was confirmed.
- The tester adds `#core-vocabulary` after Overview and before Lessons, with 45 searchable parent concepts across four course-specific clusters.
- Each concept has a definition, word/phrase structure or origin note, nested related terms, course location, source selector, four autosaving Frayer fields, a course-grounded model reveal, and a deliberate whole-entry Evidence Bank collection action.
- Core Vocabulary collections upsert by stable concept ID and organize through Activity, Text, Locator, and Type filters. Removing an entry does not erase the working Frayer draft.
- The existing Short Story Terms and Literary Terms Review sections are byte-for-byte unchanged from the rollback commit.

## Files changed

- Scoped learner-preview repair: `e2e/lib/learner-course-assertions.ts`.
- Durable learner source: `projects/ela10-1-short-stories/workspace/index.html`.
- Learner surfaces and ownership metadata: `projects/ela10-1-short-stories/meta/project.json` and `projects/ela10-1-short-stories/meta/conversion-notes.md`.
- Project learner contract: `projects/ela10-1-short-stories/meta/e2e-contract.json`.
- Handoff state: `docs/ops/ACTIVE_HANDOFF.md` and `docs/ops/ARCHIVED_HANDOFFS.md`.

## What changed

- Studio project E2E now derives mobile checks from the already-authorized iframe URL instead of requesting an unsecured preview path.
- Core Vocabulary provides 45 concepts, 180 Frayer response fields, 45 model reveals, and 45 stable collection IDs.
- Response IDs follow `ela10-1-short-stories:core-vocabulary:<concept-id>:<field>`; collection IDs end in `:<concept-id>:collection`.
- A collection requires at least one completed field but records all four Frayer response IDs. Schema-v2 metadata includes the category, category ID, concept ID, selected source, and `core-vocabulary` tag.
- Source choices cover the course lessons/guides and the five assigned readings: *The Cask of Amontillado*, *Flight into Danger*, *The Flying Machine*, *Harrison Bergeron*, and *I Am a Rock*.
- Evidence Bank filters now expose Activity, Text or source, Location or concept, and Entry type while preserving existing collection rendering and public API behavior.
- Desktop uses a two-column concept browser; mobile uses a searchable single-column selector and one-column Frayer layout.

## Verification run

At tester implementation `323f1c8c10d32c8d280c235bed82ad14bc5fa785`:

- `npm run course:doctor -- --project ela10-1-short-stories` — passed (`legacy-snapshot-v1`).
- `npm run verify -- --project ela10-1-short-stories --mode workspace` — passed; only the pre-existing Google Fonts external-dependency warnings remain.
- `npm run build:studio` — passed.
- `npm run test:e2e:project -- --project ela10-1-short-stories` — passed, 1/1 in 53.0 seconds.
- `npm run test:e2e:smoke` — passed, 1/1.
- `npm run verify:typecheck-baseline` — passed; the frozen ten established diagnostics remain and none is in a changed file.
- `git diff --check` — passed.
- Structural contract audit — passed: 45 concept panels, 45 selectors, 180 Frayer fields, 45 collections, and 45 model reveals.
- Preservation audit — passed: Short Story Terms SHA-256 `9f1f351d208df704beb731f01f8f37b303402f488a09b6b1eed79694f72fabf4`; Literary Terms Review SHA-256 `7c4dea4ad04aa85abda7973b0021d15f7952e5d9ecb4b96f98c9baa513414ce4`; both match the rollback source exactly.
- Visible browser audit — passed on desktop and mobile: search and nested term selection, all four draft fields, source switching, model reveal, deliberate collect, filter location, reload restoration, update without duplication, removal without draft loss, no console errors, and no horizontal mobile overflow.
- `npm run test:e2e:harness` was also sampled and remains 6/7 because an untouched baseline assertion expects the older wording of the current deep-contract validation error. Neither involved file differs from the rollback commit; this is not introduced by the tester.

## Source of truth

- The preserved learner source is `projects/ela10-1-short-stories/workspace/index.html`.
- Project ownership and learner-surface declarations are in `projects/ela10-1-short-stories/meta/project.json`.
- The historical `english-unit.json` recipe and English factory rebuild are quarantined for this `legacy-snapshot-v1` tester and are not the write authority.
- The branch rollback authority is `fda171dc56371019a55e56dfb8363a28c346ae79`.

## Fragile areas / watchouts

- Do not run `npm run build:english-unit -- --project ela10-1-short-stories`; it can replace the preserved workspace and erase the tester.
- The legacy learner source contains a large inline runtime. Keep future edits surgical and re-run the project E2E contract after changing routes, persistence, or Evidence Bank behavior.
- Evidence and draft state are browser-local and origin-scoped. Brightspace/SCORM cross-browser persistence has not been tested because export and LMS work are explicitly outside this tester.
- The scoped-preview helper is shared E2E infrastructure; keep its capability-bearing URL behavior intact.

## Next prompt should assume

- Review the tester on the isolated branch before deciding whether to accept, revise, or discard it.
- Keep the tester limited to `ela10-1-short-stories`; do not propagate to other English courses until the structure and vocabulary depth are accepted.
- Keep the current whole-Frayer collection contract and Evidence Bank filters unless learner testing identifies a specific usability issue.

## Exact next command

`npm run studio -- --host 127.0.0.1 --port 5176 --clearScreen false`

## Exact next file to open

`projects/ela10-1-short-stories/workspace/index.html`

## Do not do next / warnings

- Do not merge this branch or open a pull request without explicit approval.
- Do not rebuild the English unit, export SCORM, upload to Brightspace, or propagate the tester to other courses yet.
- Do not stage the tester worktree's local `node_modules` symlink or any `.runtime/**`, `dist/**`, exports, archives, or unrelated course paths.
