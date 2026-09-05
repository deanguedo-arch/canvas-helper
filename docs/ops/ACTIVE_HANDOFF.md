# Handoff

## Current follow-up — 2026-09-05

The Process Collection toolbar fit annotation is repaired through `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`. Two equal-width filters sit above a separate Copy/Print row, stacking at narrow container widths. Current learner SHA is `219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc`; current tree SHA is `bf5de61f7b01bd8431b853c53d4468b30baf790007bc64e21201290f918f0dc6`. Static tests pass 13/13 and workspace verification passes; doctor reports only intentional `not-active`. Targeted screenshots are under `/tmp/bio-collection-fit-nSOYY1/`. The full-suite results and 34-sheet audit below describe the preceding candidate, not this CSS-only revision. Next file: `projects/biology30-unit-a-pilot-2/workspace/index.html`, route `#process-collection`; next command: `npm run studio`. Teacher review is pending and no deployment occurred.

## Prior completed index handoff

- Project: `biology30-unit-a-pilot-2`
- Task: Review the contained Process Collection Index enhancement.
- Status: Codex-verified and ready for explicit teacher/user review at learner SHA-256 `a195fb28ad233efcb8814e6e5f5bb5fe18fb976924814808e886704cb7101e5f`. The project remains blocked, preview-only, Studio Edit disabled, non-exportable, and undeployed at this hash.

## Summary

- Preserved Advanced Bridge Gate B SHA-256 `11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c` as the strict pre-index baseline.
- Replaced separate duplicate saved-work displays with one state-derived **All My Work** index.
- Added an authored, validated registry of exactly 178 possible activity records across retrieval, Evidence Slips, practice, media checkpoints, Frayer models, Models and Data Lab, investigations, Review Seminar, textbook-review confirmations, and the process note.
- Rendered only work that the learner has started or saved, with the original prompt, current response or result, accurate status, relevant course feedback, and an exact return link.
- Added chapter and activity-type filters without changing saved state.
- Made copy and print use the complete structured collection even when the visible index is filtered.
- Kept the three investigations and process note under **Continue your work**, with Core Vocabulary, Models and Data Lab, and Advanced Learning available from the same Process Collection group.
- Added allowlisted `#<route>/work/<work-id>` links that open ancestor disclosures, restore the relevant resource selection, scroll to the source, and focus its heading.
- Replaced generic persistence claims with independent local-browser and SCORM checks and the four required learner messages.
- Kept learner state at version 6 and 39,061 worst-case characters. No course content, questions, Advanced Learning blocks, required routes, completion rules, scoring, or time changed.
- No deployment, commit, push, export, publication, promotion, Studio editing, Pilot 1 edit, or Unit B-D edit occurred.

## Files changed

- `scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts`
- `scripts/lib/biology30-unit-a-pilot-2/build-process-collection-index.ts`
- `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`
- `scripts/build-biology30-unit-a-pilot-2.ts`
- `scripts/tests/biology30-unit-a-pilot-2.test.ts`
- `e2e/specs/biology30-unit-a-pilot-2.spec.ts`
- `scripts/audit-biology30-unit-a-pilot-2-visual.ts`
- `projects/biology30-unit-a-pilot-2/workspace/index.html`
- `projects/biology30-unit-a-pilot-2/meta/process-collection-index.json`
- `projects/biology30-unit-a-pilot-2/meta/process-collection-index-review.json`
- `projects/biology30-unit-a-pilot-2/meta/process-collection-index-audit.json`
- `projects/biology30-unit-a-pilot-2/meta/pilot-2-improvement-ledger.json`
- `projects/biology30-unit-a-pilot-2/meta/pilot-2-improvement-journal.md`
- `projects/biology30-unit-a-pilot-2/meta/prompt-pack.md`
- `projects/biology30-unit-a-pilot/meta/unit-a-to-bcd-improvement-playbook.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`
- `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-05T03-25-55-745Z/**`

## What changed

- `process-collection-content.ts` owns stable record IDs, source-state references, sequence, labels, prompts, evidence, exact return routes, and exact focus targets. Its validation rejects duplicate or incomplete records and totals other than 178.
- The Process Collection route derives one display model from current canonical learner state; it creates no second response store.
- Statuses now reflect the underlying record: **Draft**, **Attempted**, **Checkpoint saved**, or **Collected**.
- Practice rows show the retained choice and submitted feedback. Textbook-review rows explicitly describe self-reported attempts. Media rows distinguish selected path from completed checkpoint.
- The runtime accepts only route/work pairs declared by the authored registry. Unknown pairs cannot become arbitrary selectors.
- Local save success is verified by reading the stored value back. SCORM `SetValue` and `Commit` are evaluated independently. The learner sees **Saved to course**, **Saved on this device**, **Saved on this device only**, or **Not saved—copy your work before leaving**.
- The print control retains its Process Collection-specific selector and now also exposes the shared `data-worksheet-print` hook required by the project E2E contract.

## Why this changed

- Pilot 2 already saved much more work than its former Process Collection presentation showed.
- A single derived index makes that evidence findable without changing persistence, adding completion requirements, or duplicating learner data.
- Exact return links turn the collection into a useful learning index rather than a detached archive.
- Independent save outcomes avoid telling learners their work is safe when local or LMS persistence actually failed.

## Verification run

- Transactional Process Collection build passed from exact baseline `11f9508f...` and preserved the prior candidate.
- `npm run test:biology30-unit-a-pilot-2`: 13/13 passed.
- `npm run test:e2e:project -- --project biology30-unit-a-pilot-2`: 1/1 passed.
- `npm run test:e2e:biology30-unit-a-pilot-2`: 24/24 passed.
- `npm run audit:biology30-unit-a-pilot-2:visual -- --project biology30-unit-a-pilot-2`: passed with 81 route screenshots, 140 learner-state screenshots, 34 contact sheets, and zero geometry findings.
- All 34 exact-build contact sheets were opened and inspected.
- `npm run test:biology30-unit-a-improvement-pilot`: 12/12 passed.
- `npm run test:science-comparison`: 6/6 passed.
- `npm run verify -- --project biology30-unit-a-pilot-2 --mode workspace`: passed with no missing assets or unresolved required dependencies.
- `npm run validate:manifests`: passed.
- `npm run build:studio`: passed.
- `npm run course:doctor -- --project biology30-unit-a-pilot-2`: returned only the intentional `not-active` diagnostic.
- Learner SHA-256: `a195fb28ad233efcb8814e6e5f5bb5fe18fb976924814808e886704cb7101e5f`.
- Workspace-tree SHA-256: `c7abaed3497d16fac32eee5f661d0e9641691e483b6b50290e6583846bcd0c5d`.
- Visual-report SHA-256: `612fe1b33f466d3404276c357a6991240e90b467ce2bd2bc479978ab0b082d3a`.

## Source of truth

- Authored activity registry: `scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts`
- Course renderer and version-6 runtime: `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`
- Transactional contained builder: `scripts/lib/biology30-unit-a-pilot-2/build-process-collection-index.ts`
- Generated registry contract: `projects/biology30-unit-a-pilot-2/meta/process-collection-index.json`
- Exact review record: `projects/biology30-unit-a-pilot-2/meta/process-collection-index-review.json`
- Implementation audit: `projects/biology30-unit-a-pilot-2/meta/process-collection-index-audit.json`
- Reviewable learner candidate: `projects/biology30-unit-a-pilot-2/workspace/index.html`
- Exact visual evidence: `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-05T03-25-55-745Z/report.json`
- Cross-pilot operating record: `projects/biology30-unit-a-pilot/meta/unit-a-to-bcd-improvement-playbook.md`
- Preserved Advanced Bridge Gate B review: `projects/biology30-unit-a-pilot-2/meta/advanced-bridge-gate-b-review.json`

## Fragile areas / what might drift

- Generate learner HTML through the authored TypeScript sources. Directly patching `workspace/index.html` will be overwritten.
- Keep all 178 work IDs, source-state references, and focus targets stable unless an explicit migration accompanies a change.
- Keep the registry-derived display, copy, and print views on one formatter so filtered rows do not disappear from exports.
- Keep Advanced Learning completion outside All My Work; those self-check flags are an availability/completion checklist, not a saved evidence response.
- Keep local and SCORM save checks independent. A successful browser write must not conceal a failed LMS commit.
- The prior Gate B visual report remains exact only for preserved SHA `11f9508f...`; the current candidate uses the newer 34-sheet report.
- The public teacher-review site still serves pre-bridge SHA `912a213f...` and is stale. Do not identify it as this candidate.
- The repository contains extensive unrelated user-owned changes and untracked files. Never broadly stage, clean, reset, format, commit, or push them.

## Next prompt should assume

- Gate 1, teacher-feedback Revision Gate A, and Advanced Bridge Gate A are accepted only within their named scopes.
- Advanced Bridge Gate B is Codex-verified at preserved SHA `11f9508f...`, but its `teacherDecision` remains null.
- The Process Collection Index is a separate Codex-verified candidate at SHA `a195fb28...`, also with `teacherDecision: null`.
- Reviewing or accepting the Process Collection candidate does not automatically accept the forty-block Advanced Bridge, the whole course, deployment, export, publication, Studio editing, promotion, commit, push, or B-D transfer.

## What still needs validation

- Explicit teacher/user review of the unified index with empty, representative, and dense saved-work states.
- Teacher/user confirmation that status wording, original-prompt context, feedback display, exact return links, filtering, and copy/print presentation are useful and understandable.
- Explicit acceptance or changes requested against learner SHA `a195fb28ad233efcb8814e6e5f5bb5fe18fb976924814808e886704cb7101e5f`.

## Known risks / follow-up

- The candidate is automated- and Codex-verified, not teacher-accepted.
- Textbook confirmations are necessarily self-reported; the index does not claim that individual textbook answers were recorded.
- A selected media path is not proof that a learner watched a whole video. Only the checkpoint is reported as saved.
- The audit's comparison, showcase, multiple-model-run, error-repair, and visual-annotation proposals remain intentionally unimplemented.
- The current public review URL is stale and could mislead a reviewer if shared as the current build.

## Exact next command

`npm run studio`

## Exact next file to open

`projects/biology30-unit-a-pilot-2/workspace/index.html`

## Do not do next / warnings

- Do not mark the Process Collection Index accepted until the user or teacher explicitly accepts learner SHA `a195fb28ad233efcb8814e6e5f5bb5fe18fb976924814808e886704cb7101e5f`.
- Do not infer acceptance of Advanced Bridge Gate B from any Process Collection decision.
- Do not deploy, commit, push, export, publish, promote, enable Studio Edit, modify Pilot 1 learner content, or modify Units A-D without separate authorization.
