# Handoff

- Project: consolidated Social and ELA course catalog
- Task: make the accepted Social Option Two and ELA Core Vocabulary/Evidence Bank rollouts available from one daily Canvas Helper workspace.
- Status: consolidated and ready for daily Studio review on `codex/course-catalog-social-ela` at `32877134`. The clean ELA rollout (`4867dda8`) is the base; the accepted Social rollout is merged without changing the preserved SCORM ZIP sources.

## Summary

- This worktree is the clean daily catalog candidate: `/Users/deanguedo/Documents/GitHub/canvas-helper-course-catalog`.
- The original supplied SCORM ZIPs remain the recovery baseline. Canonical editable course files are the extracted `projects/<slug>/workspace/index.html` files.
- Included ELA scope: all 21 active `ela*` courses, their restored snapshots, course-specific Core Vocabulary, Evidence Bank integration, and the accepted learner repairs.
- Included Social scope: Option Two Social 10-1, 20-1, and 30-1 vocabulary/Evidence Bank work from the accepted Social rollout.
- Excluded scope: SCORM export, Brightspace upload, historical English/Social factory rebuilds, and unrelated Direct Editing experiments.

## Verification

- `npm run build:studio` passed.
- `npm run test:e2e:project -- --project ela10-1-short-stories` passed.
- `npm run test:e2e:project -- --project social20-1-related-issue-4-option-2` passed.
- The integration initially exposed an ELA-only DOM assertion being applied to Social vocabulary. The shared assertion now limits that specialized contract to ELA while retaining Social's scoped-preview Evidence Bank checks.
- `git diff --check` passed before the merge commit.

## Source of truth and safeguards

- Do not alter `raw/**`, `exports/**`, `.runtime/**`, or the uploaded SCORM ZIPs.
- Do not run historical English or Social factory commands; these restored courses use `legacy-snapshot-v1` workspaces.
- The original dirty checkout at `/Users/deanguedo/Documents/GitHub/canvas-helper` is preserved and must not be used as the merge target.

## Exact next command

`npm run studio -- --host 127.0.0.1 --port 5177 --strictPort --clearScreen false`

## Exact next file to open

`e2e/lib/learner-course-assertions.ts`
