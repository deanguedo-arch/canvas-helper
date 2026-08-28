# Handoff

- Project: Social and ELA SCORM upload release
- Task: create upload-ready SCORM 2004 packages from the accepted Social Option Two and ELA catalog, including LMS suspend-data persistence.
- Status: complete. The SCORM export-configuration checkpoint is `d8690706` on `codex/course-catalog-social-ela`; the release contains 33 packages (21 ELA, 12 Social Option Two) in `/Users/deanguedo/Downloads/Canvas-Helper-SCORM-Social-ELA-2026-08-28`.

## Latest follow-up

- Social 30-1 Issue 1 only: Lesson Evidence cards now provide a Remove control. Removal stores a separate Evidence Bank dismissal and does not erase the lesson response itself. Issues 2–4 were intentionally left unchanged.
- Verified with Issue 1 `course:doctor`, workspace verification, project E2E, and `git diff --check`.

## Summary

- This worktree is the clean daily catalog source: `/Users/deanguedo/Documents/GitHub/canvas-helper-course-catalog`.
- The original supplied SCORM ZIPs remain the recovery baseline. Canonical editable course files are the extracted `projects/<slug>/workspace/index.html` files.
- Included ELA scope: all 21 active `ela*` courses, their restored snapshots, course-specific Core Vocabulary, Evidence Bank integration, and the accepted learner repairs.
- Included Social scope: Option Two Social 10-1, 20-1, and 30-1 vocabulary/Evidence Bank work from the accepted Social rollout.
- Fresh SCORM 2004 ZIPs and `SHA256SUMS.txt` are in the release folder above; `README.md` gives the Brightspace acceptance procedure.
- Excluded scope: Brightspace upload, historical English/Social factory rebuilds, and unrelated Direct Editing experiments.

## Verification

- `npm run build:studio` passed.
- `npm run test:e2e:project -- --project ela10-1-short-stories` passed.
- `npm run test:e2e:project -- --project social20-1-related-issue-4-option-2` passed.
- The integration initially exposed an ELA-only DOM assertion being applied to Social vocabulary. The shared assertion now limits that specialized contract to ELA while retaining Social's scoped-preview Evidence Bank checks.
- `git diff --check` passed before the merge commit.
- `npm run test:scorm` passed (19 tests), including SCORM 2004/1.2 API handling, suspend-data save/restore, Save & Exit, and response-state tracking.
- `course:doctor` and workspace verification passed for all 33 release projects.
- Every release archive passed ZIP integrity testing and a release audit confirming a root manifest, SCORM bridge, SCORM 2004 4th Edition declaration, and bridge ordering before the course runtime.
- `git lfs fsck --pointers HEAD` and `git lfs fsck --objects HEAD` passed.

## Source of truth and safeguards

- Do not alter `raw/**`, `exports/**`, `.runtime/**`, or the uploaded SCORM ZIPs.
- Do not run historical English or Social factory commands; these restored courses use `legacy-snapshot-v1` workspaces.
- The original dirty checkout at `/Users/deanguedo/Documents/GitHub/canvas-helper` is preserved and must not be used as the merge target.
- The packages include the shared SCORM bridge, which sends tracked learner state through LMS suspend data. Cross-browser restoration is ready for Brightspace, but actual LMS proof still requires a same-learner upload/reopen test in two browsers.

## Exact next command

`open /Users/deanguedo/Downloads/Canvas-Helper-SCORM-Social-ELA-2026-08-28`

## Exact next file to open

`/Users/deanguedo/Downloads/Canvas-Helper-SCORM-Social-ELA-2026-08-28/README.md`
