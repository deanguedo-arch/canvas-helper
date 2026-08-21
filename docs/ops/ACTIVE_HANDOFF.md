# Handoff

- Project: `social30-1-related-issue-1-option-2`
- Task: Organize the Issue 1 tester Evidence Bank by collection origin.
- Status: complete on `codex/social30-1-issue1-vocabulary-tester`; the organized Evidence Bank is published as the unmerged branch head.

## Summary

- The tester lives only on `codex/social30-1-issue1-vocabulary-tester` in `/Users/deanguedo/Documents/GitHub/canvas-helper-social30-vocabulary-tester`.
- Full snapshot rollback: `e78f169ec7aefe531182cef39fe72a800340d9a5` (`chore(social): checkpoint restored issue 1 snapshot`).
- Vocabulary-only checkpoint: `df90bec7bbe31a3847d6f9595c3f2142d9bfbf70` (`feat(social): add issue 1 vocabulary tester`).
- Ungrouped Evidence Bank checkpoint: `cf32fb14ff1ab8e8d6462a5d35475bce791320dd` (`feat(social): connect vocabulary to evidence bank`). Resetting here rejects only origin grouping.
- Origin-grouping change: this handoff ships in `feat(social): organize evidence bank by origin`; the remote branch head is its authoritative SHA.
- Branch URL: https://github.com/deanguedo-arch/canvas-helper/tree/codex/social30-1-issue1-vocabulary-tester
- No PR, merge, SCORM export, Brightspace upload, or Issues 2–4 propagation occurred.

## Files changed

- `projects/social30-1-related-issue-1-option-2/workspace/index.html`
- `projects/social30-1-related-issue-1-option-2/meta/project.json`
- `docs/ops/ACTIVE_HANDOFF.md`

## What changed

- Replaced the separate flat lesson/manual lists with one ordered Evidence Bank view:
  1. Core Vocabulary
  2. Lesson Evidence
  3. Source Analysis
  4. Saved Directly in Evidence Bank
  5. Other / Legacy Notes when needed
- Group headings include restrained entry counts and short source descriptions.
- Lesson Evidence is grouped again by the existing course-section metadata, with section-level note counts.
- Source Analysis and direct notebook saves now store normalized `origin` and `activity` metadata.
- Core Vocabulary collections now store explicit origin metadata in addition to their existing activity and work metadata.
- Existing entries are classified at render time from their stable IDs and activity metadata. No learner data is rewritten or destructively migrated.
- The legacy fallback safely retains older entries whose origin cannot be determined.
- Empty groups are omitted; when the bank has no evidence, one general empty state is shown.
- Existing contribution IDs, response IDs, autosave, update-without-duplication, removal, and Frayer draft behavior remain unchanged.

## Why this changed

- Learners can now see where evidence came from before reusing it in source responses, discussions, position papers, or exam-style writing.
- Section grouping makes multiple lesson notes easier to scan without adding search or filter complexity to the tester.
- Render-time compatibility avoids a migration that could damage existing local or SCORM state.

## Verification run

- Inline learner scripts parsed successfully; all five origin definitions were found.
- `npm run course:doctor -- --project social30-1-related-issue-1-option-2` — passed.
- `npm run verify -- --project social30-1-related-issue-1-option-2 --mode workspace` — passed with no missing local assets, embeds, or course-shell resources.
- `npm run build:studio` — passed.
- Default `npm run test:e2e:project -- --project social30-1-related-issue-1-option-2` — all desktop learner and Evidence Bank assertions completed before the known shared mobile helper loaded its bare, capability-free preview path and found no `#overview` route target.
- The same project E2E suite passed 1/1 with the temporary capability-aware mobile URL correction. `e2e/lib/learner-course-assertions.ts` was restored and is not part of this branch diff.
- Visible Studio at `http://127.0.0.1:5175/` — created and restored evidence from Core Vocabulary, two lessons in one section, Source Analysis, and the direct notebook.
- Browser grouping proof — exact order was `core-vocabulary`, `lesson-evidence`, `source-analysis`, `evidence-notebook`; the two lesson notes appeared under `Section 1: Identity, Beliefs, and Values` with correct origin and section counts.
- Browser lifecycle proof — reload retained every group; removing the Core Vocabulary card removed its empty group; re-saving restored it in the correct first position.
- Responsive proof — desktop headings share a row; mobile origin and lesson-section headings stack; document width remained 429/429 with no horizontal overflow.
- Browser diagnostics — no console warnings or errors.
- `git diff --check` — passed before publication and must remain clean after the handoff edit.

## Source of truth

- Canonical learner entry: `projects/social30-1-related-issue-1-option-2/workspace/index.html`.
- Project contract: `projects/social30-1-related-issue-1-option-2/meta/project.json`.
- Existing interaction contract: `projects/social30-1-related-issue-1-option-2/meta/e2e-contract.json`.
- Ungrouped rollback source: `cf32fb14ff1ab8e8d6462a5d35475bce791320dd`.

## Fragile areas / what might drift

- This remains an Issue 1-only tester. Issues 2–4 are untouched.
- Existing Source Analysis entries created before normalized metadata are recognized by their historical `evidence-<timestamp>` identity. If another activity later adopts that legacy identity shape, the fallback classifier must be revisited.
- Evidence entries still use the existing local/SCORM storage runtime. LMS and cross-browser SCORM restoration remain untested because no export or upload was authorized.
- The checked-in mobile E2E helper remains out of sync with preview capability enforcement. Do not weaken the preview server to hide that shared harness defect.

## Next prompt assumptions

- Teacher review should evaluate whether the origin order and lesson-section grouping are useful before adding filters, search, or propagation.
- Rejecting only grouping can roll back to `cf32fb14ff1ab8e8d6462a5d35475bce791320dd` without losing the vocabulary-to-Evidence-Bank workflow.
- The original dirty checkout was not used for these edits.

## What still needs validation

- Teacher accept/reject decision for the grouped Issue 1 Evidence Bank.
- If accepted later, separately authorize SCORM export, cross-browser/LMS save-and-restore testing, and Issues 2–4 propagation.

## Known risks / follow-up

- A future shared E2E harness repair should rerun the official unmodified project command.
- Search, filtering, custom tags, and making additional course activities collectible were deliberately excluded from this focused tester.
- The browser currently contains local demonstration evidence in the four active origin groups; it is browser storage only and is not committed course data.

## Exact next command

`npm run studio -- --host 127.0.0.1 --port 5175 --strictPort --clearScreen false`

## Exact next file to open

`projects/social30-1-related-issue-1-option-2/workspace/index.html`

## Do not do next / warnings

- Do not open a PR, merge, export SCORM, upload to Brightspace, or copy this tester into Issues 2–4 without explicit acceptance.
- Do not reset or clean the original dirty checkout.
- Do not stage `node_modules`, `.runtime/**`, generated exports, test artifacts, duplicate metadata, or unrelated course changes.
