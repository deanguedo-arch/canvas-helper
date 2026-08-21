# Handoff

- Project: `social30-1-related-issue-1-option-2`
- Task: Publish an isolated Issue 1 Core Vocabulary tester after a byte-exact GitHub rollback checkpoint.
- Status: complete on `codex/social30-1-issue1-vocabulary-tester`; the tester commit is published and the remote branch head is confirmed.

## Summary

- The tester lives only on the unmerged branch `codex/social30-1-issue1-vocabulary-tester` in the isolated worktree `/Users/deanguedo/Documents/GitHub/canvas-helper-social30-vocabulary-tester`.
- Rollback checkpoint: `e78f169ec7aefe531182cef39fe72a800340d9a5` (`chore(social): checkpoint restored issue 1 snapshot`). GitHub was confirmed at this exact SHA before tester editing began.
- Tester SHA: this handoff ships in the `feat(social): add issue 1 vocabulary tester` commit. Resolve its exact self-referential SHA with `git rev-parse HEAD` after committing; the remote branch head is the authoritative tester identifier.
- Branch URL: https://github.com/deanguedo-arch/canvas-helper/tree/codex/social30-1-issue1-vocabulary-tester
- Remote confirmation: local `HEAD` and `refs/heads/codex/social30-1-issue1-vocabulary-tester` were confirmed equal after publication.
- No PR was opened, no merge was performed, and no SCORM export, Brightspace upload, or Issues 2–4 propagation occurred.

## Files changed

- `projects/social30-1-related-issue-1-option-2/workspace/index.html`
- `projects/social30-1-related-issue-1-option-2/meta/project.json`
- `projects/social30-1-related-issue-1-option-2/meta/e2e-contract.json`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Added `#core-vocabulary` after Overview and before Lessons, with matching sidebar and Overview links.
- Added eight selectable terms: ideology, identity, worldview, individualism, collectivism, liberalism, autonomy, and indoctrination.
- Each term includes a word-structure explanation, four autosaving Frayer fields, and a restrained `Compare with the course model` reveal grounded in Issue 1.
- Added 32 unique response IDs shaped as `social30-1-related-issue-1-option-2:core-vocabulary:<term>:<field>`.
- Kept the existing Study Guide vocabulary check unchanged as later retrieval practice.
- Added a two-column desktop Frayer layout that collapses at the dedicated 700px mobile breakpoint.
- Restored the project-local Evidence Bank API, capture attributes, and scoped Print / PDF hook already required by the checked-in Issue 1 E2E contract. No shared Studio/server API changed.
- Added the learner surface and desktop/mobile route to project metadata and the project E2E contract.

## Why this changed

- The tester gives learners explicit Tier 3 vocabulary preparation before Issue 1 lessons while preserving later retrieval practice.
- The separate checkpoint makes rejection or rollback a single-commit branch reset without touching the original dirty checkout.
- The restored project-local Evidence Bank hooks reconcile the recovered learner snapshot with its existing project contract and keep unchanged Evidence Bank checks executable.

## Verification run

- Nested recovered package SHA-256: `5d9a0d38e6d3f6403894490db11cd1c9a0c23e5567448ebd00bd7079ce9cce1a` — matched the complete 153-file checkpoint workspace before tester editing.
- `npm run course:doctor -- --project social30-1-related-issue-1-option-2` — passed.
- `npm run verify -- --project social30-1-related-issue-1-option-2 --mode workspace` — passed with no missing local assets, embeds, or shell resources.
- `npm run build:studio` — passed.
- `git diff --check` on the tester and handoff changes — passed.
- Default `npm run test:e2e:project -- --project social30-1-related-issue-1-option-2` — all project assertions reached the separate mobile phase, where the shared harness requested a now-forbidden bare preview path and received `403 Preview capability required`.
- The same project E2E suite passed 1/1 with a temporary, uncommitted correction that reused the iframe capability URL for the mobile page; `e2e/lib/learner-course-assertions.ts` was restored afterward and is not part of this branch diff.
- Live Studio on `http://127.0.0.1:5175/` — verified eight-term selection, all eight model reveals, active navigation, unchanged Overview/Lessons/Study Guide routes, two-column desktop layout, one-column mobile layout with no horizontal overflow, and four Ideology Frayer responses restored after switching terms and reloading.
- In-app browser diagnostics — no console warnings or errors; workspace verification found no missing assets.

## Source of truth

- Canonical learner entry: `projects/social30-1-related-issue-1-option-2/workspace/index.html`.
- Project contract: `projects/social30-1-related-issue-1-option-2/meta/project.json`.
- E2E learner-route contract: `projects/social30-1-related-issue-1-option-2/meta/e2e-contract.json`.
- Rollback source: checkpoint commit `e78f169ec7aefe531182cef39fe72a800340d9a5`.

## Fragile areas / watchouts

- The tester is intentionally Issue 1–only. Issues 2–4 remain untouched.
- The browser persistence proof uses the course's existing local/SCORM storage runtime; LMS and cross-browser SCORM restore remain untested because no export or upload was authorized.
- The checked-in mobile E2E helper is out of sync with preview capability enforcement. Do not weaken the preview server or remove project coverage to hide that shared harness defect.
- The checkpoint contains three legacy stylesheet files with pre-existing trailing whitespace. They are byte-exact restored package content and were intentionally not normalized.

## Next prompt should assume

- The first branch commit is the accepted rollback point and the second branch commit is the tester under review.
- The original dirty checkout was not used for tester edits.
- Acceptance should evaluate this Issue 1 prototype before any export, merge, or propagation.

## What still needs validation

- Teacher review and an accept/reject decision for the vocabulary tester.
- If accepted later, separately authorize SCORM export, cross-browser/LMS save-and-restore testing, and any Issues 2–4 propagation.

## Known risks

- A future shared E2E harness change could alter the temporary capability-aware verification result; rerun the official project suite after that repo-wide fix lands.
- The eight morphology notes are concise instructional decompositions, not claims of complete historical etymology.

## Exact next command

`npm run studio -- --host 127.0.0.1 --port 5175 --strictPort --clearScreen false`

## Exact next file to open

`projects/social30-1-related-issue-1-option-2/workspace/index.html`

## Do not do next / warnings

- Do not open a PR, merge the branch, export SCORM, upload to Brightspace, or copy the tester into Issues 2–4 without explicit acceptance.
- Do not reset or clean the original dirty checkout.
- Do not stage `node_modules`, `.runtime/**`, generated exports, test artifacts, duplicate metadata, or unrelated course changes.
