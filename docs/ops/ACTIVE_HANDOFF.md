# Handoff

- Project: ELA short-story family and shared English factory
- Task: Preserve the current six-project short-story state on a clean, pushable checkpoint branch.
- Status: complete

## Summary

- Clean checkpoint branch: `codex/ela-short-stories-checkpoint-20260728`.
- The branch starts from the pushed Writing Foundations checkpoint at `origin/codex/ela10-2-writing-foundations`; it does not carry the oversized history from `codex/ela20-factory-checkpoint-20260714`.
- The checkpoint contains the current canonical `meta/` and `workspace/` state for:
  - `ela10-1-short-stories`
  - `ela10-2-short-stories`
  - `ela20-1-short-stories-pilot`
  - `ela20-2-short-stories`
  - `ela30-1-short-stories`
  - `ela30-2-short-stories-visual-literacy`
- It also contains the scoped shared renderer, builder, and test changes used by those workspaces.
- Exports, raw archives, transaction folders, and unrelated dirty work were not copied into the checkpoint.

## Files changed

- `projects/ela10-1-short-stories/meta/`
- `projects/ela10-1-short-stories/workspace/`
- `projects/ela10-2-short-stories/meta/`
- `projects/ela10-2-short-stories/workspace/`
- `projects/ela20-1-short-stories-pilot/meta/`
- `projects/ela20-1-short-stories-pilot/workspace/`
- `projects/ela20-2-short-stories/meta/`
- `projects/ela20-2-short-stories/workspace/`
- `projects/ela30-1-short-stories/meta/`
- `projects/ela30-1-short-stories/workspace/`
- `projects/ela30-2-short-stories-visual-literacy/meta/`
- `projects/ela30-2-short-stories-visual-literacy/workspace/`
- `scripts/build-ela-short-stories.ts`
- `scripts/lib/english-unit/factory-render.ts`
- `scripts/lib/english-unit/render.ts`
- `scripts/lib/english-unit/factory-render.test.ts`
- `scripts/tests/english-unit.test.ts`

## Source of truth

- Per-project source declarations and regeneration commands are in each project’s `meta/project.json`.
- Shared factory rendering is owned by `scripts/lib/english-unit/`.
- ELA 30-1 Short Stories is regenerated through `scripts/build-ela-short-stories.ts`.
- The learner workspaces in this checkpoint are the exact reviewed local state copied from the original working checkout.

## Verification run

- Scoped renderer and short-story tests: 16 passed, 0 failed.
- Project verifier: all six short-story projects passed with no missing local assets, embeds, or course-shell resources.
- Project E2E: all six short-story learner contracts passed in Chromium.
- Full English course suite: 166 passed and 18 failed. The failures are outside this six-project checkpoint and arise from legacy ELA 30-1 workspaces and other unpublished clean-branch prerequisites that are absent from the branch, plus existing unrelated contract expectations.

## Known risks / unfinished work

- The full repository English test suite is not green on this selective clean branch. Do not represent the 18 unrelated failures as short-story project failures.
- Brightspace import and cross-browser save-close-reopen remain the external acceptance checks for any newly generated SCORM packages.
- The main checkout is now on the clean checkpoint branch with a clean working tree.
- The former uncommitted short-story state is preserved in the named safety stash `safety-before-clean-short-stories-checkpoint-20260728`.
- Previously hidden OCR and processed-source files that became visible under the clean branch’s ignore rules are preserved in two additional named safety stashes.

## Fragile areas / watchouts

- Preserve stable response IDs, Evidence Bank contribution IDs, completion state, route restoration, and autosave behavior.
- Keep future edits in canonical recipes/renderers and regenerate affected workspaces where declared by `meta/project.json`.
- Do not merge the oversized historical branch into this clean branch.
- Do not broadly copy exports, raw archives, or temporary transaction folders into this branch.

## Next prompt should assume

- The current six-project short-story state is safely checkpointed on `codex/ela-short-stories-checkpoint-20260728`, and the main checkout is clean on that branch.
- Continue new work from this clean branch, not from `codex/ela20-factory-checkpoint-20260714`.

## Exact next command

`git status -sb`

## Exact next file to open

`docs/ops/ACTIVE_HANDOFF.md`

## Do not do next / warnings

- Do not merge or rebase the old oversized branch into the clean checkpoint.
- Do not drop the three July 28 safety stashes until the user confirms the clean branch contains everything they expect.
