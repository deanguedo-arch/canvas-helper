# Handoff

- Project: `social30-1-related-issue-1-option-2`
- Task: Integrate the isolated Issue 1 Core Vocabulary tester with the learner Evidence Bank.
- Status: complete on `codex/social30-1-issue1-vocabulary-tester`; the integration is published as the branch head and remains unmerged.

## Summary

- The tester lives only on the unmerged branch `codex/social30-1-issue1-vocabulary-tester` in the isolated worktree `/Users/deanguedo/Documents/GitHub/canvas-helper-social30-vocabulary-tester`.
- Full rollback checkpoint: `e78f169ec7aefe531182cef39fe72a800340d9a5` (`chore(social): checkpoint restored issue 1 snapshot`).
- Vocabulary-tester checkpoint: `df90bec7bbe31a3847d6f9595c3f2142d9bfbf70` (`feat(social): add issue 1 vocabulary tester`). Resetting to this commit rejects only the Evidence Bank integration while retaining the vocabulary tester.
- Evidence Bank integration: this handoff ships in `feat(social): connect vocabulary to evidence bank`; the remote branch head is its authoritative SHA.
- Branch URL: https://github.com/deanguedo-arch/canvas-helper/tree/codex/social30-1-issue1-vocabulary-tester
- No PR was opened, no merge was performed, and no SCORM export, Brightspace upload, or Issues 2–4 propagation occurred.

## Files changed

- `projects/social30-1-related-issue-1-option-2/workspace/index.html`
- `projects/social30-1-related-issue-1-option-2/meta/project.json`
- `projects/social30-1-related-issue-1-option-2/meta/e2e-contract.json`
- `docs/ops/ACTIVE_HANDOFF.md`

## What changed

- Added one stable Evidence Bank collection ID to each of the eight Core Vocabulary terms.
- Added a deliberate `Save term to Evidence Bank` action and a scoped live status beside every Frayer activity.
- Kept field autosave draft-only. Editing a field does not publish evidence; the learner chooses when a term is ready.
- A save gathers the term's completed definition, characteristics, course example, and non-example into one readable Frayer collection card.
- Saving the same term again updates its existing Evidence Bank entry instead of creating a duplicate.
- Removing the Evidence Bank card does not erase the learner's working Frayer responses.
- Extended the project-local Evidence Bank renderer to display collection metadata and multiline responses while preserving existing individual proof notes.
- Changed the E2E contract from one evidence scenario to two: the existing individual notebook plus the new Ideology collection flow.
- Kept the vocabulary route, eight terms, model reveals, 32 response IDs, and later Study Guide retrieval practice unchanged.

## Why this changed

- Vocabulary work can now become reusable evidence for source responses, discussions, position papers, and exam-style writing.
- A stable per-term identity gives learners a clear draft-to-collection workflow without duplicate cards.
- The integration stays project-local and does not change any public Studio or server API.

## Verification run

- `npm run course:doctor -- --project social30-1-related-issue-1-option-2` — passed.
- `npm run verify -- --project social30-1-related-issue-1-option-2 --mode workspace` — passed with no missing local assets, embeds, or course-shell resources.
- `npm run build:studio` — passed.
- Inline learner scripts parsed successfully; found eight unique collection IDs, eight save controls, and 32 unique vocabulary response IDs.
- Default `npm run test:e2e:project -- --project social30-1-related-issue-1-option-2` — all desktop learner and Evidence Bank assertions completed before the known shared mobile helper requested a bare preview URL; the capability error page has no `#overview` route target, so the run fails at that separate helper defect.
- The same project E2E suite passed 1/1 with the temporary capability-aware mobile URL correction. `e2e/lib/learner-course-assertions.ts` was restored afterward and is not part of this branch diff.
- E2E collection proof covered draft-only autosave, first save, update-without-duplication, reload restoration, API removal, and retained working response.
- Live Studio at `http://127.0.0.1:5175/` — verified the visible save/update status, one rendered Ideology Frayer card, reload persistence, UI removal with retained response, two-row desktop Frayer grid, four-row mobile Frayer grid, stacked mobile action bar, and no horizontal overflow.
- In-app browser diagnostics — no console warnings or errors.
- `git diff --check` — passed before publication and must remain clean after the handoff edit.

## Source of truth

- Canonical learner entry: `projects/social30-1-related-issue-1-option-2/workspace/index.html`.
- Project contract: `projects/social30-1-related-issue-1-option-2/meta/project.json`.
- E2E contract: `projects/social30-1-related-issue-1-option-2/meta/e2e-contract.json`.
- Full rollback source: `e78f169ec7aefe531182cef39fe72a800340d9a5`.
- Vocabulary-only rollback source: `df90bec7bbe31a3847d6f9595c3f2142d9bfbf70`.

## Fragile areas / what might drift

- This remains an Issue 1-only tester. Issues 2–4 are untouched.
- Evidence Bank entries use the course's existing local/SCORM storage runtime. LMS and cross-browser SCORM restore remain untested because no export or upload was authorized.
- The checked-in mobile E2E helper remains out of sync with preview capability enforcement. Do not weaken the preview server or remove learner coverage to hide that shared harness defect.
- The full recovered checkpoint contains three legacy stylesheet files with pre-existing trailing whitespace; they remain byte-exact and were not normalized.

## Next prompt assumptions

- Teacher review should evaluate both the vocabulary activity and its new draft-to-Evidence-Bank flow.
- Rejecting only this integration can roll back to `df90bec7bbe31a3847d6f9595c3f2142d9bfbf70`; rejecting the entire tester can roll back to `e78f169ec7aefe531182cef39fe72a800340d9a5`.
- The original dirty checkout was not used for tester edits.

## What still needs validation

- Teacher accept/reject decision for the Issue 1 tester and Evidence Bank workflow.
- If accepted later, separately authorize SCORM export, cross-browser/LMS save-and-restore testing, and any Issues 2–4 propagation.

## Known risks / follow-up

- A future shared E2E harness repair should rerun the official unmodified project command and replace the temporary capability-aware evidence.
- The eight morphology notes remain concise instructional decompositions, not claims of complete historical etymology.
- The browser currently contains one local Ideology demonstration card for review; it is browser storage only and is not committed course data.

## Exact next command

`npm run studio -- --host 127.0.0.1 --port 5175 --strictPort --clearScreen false`

## Exact next file to open

`projects/social30-1-related-issue-1-option-2/workspace/index.html`

## Do not do next / warnings

- Do not open a PR, merge the branch, export SCORM, upload to Brightspace, or copy the tester into Issues 2–4 without explicit acceptance.
- Do not reset or clean the original dirty checkout.
- Do not stage `node_modules`, `.runtime/**`, generated exports, test artifacts, duplicate metadata, or unrelated course changes.
