# Handoff

- Project: `biology30-unit-a-pilot-2`
- Task: Repair Core Vocabulary entries that appeared clickable but did not update the concept reader.
- Status: Codex-verified and ready for explicit teacher/user review at learner SHA-256 `24e18ca81a7bf33a0182825be95472fa2a3f6ac55b779f90f14855e25ee9c66c`. Local only, blocked, preview-only, Studio Edit disabled, non-exportable, and undeployed.

## Summary

- Fixed the `Learned so far` filter so future concepts are genuinely hidden. The component's grid rule had overridden the browser's default `[hidden]` behavior.
- Future concepts are no longer disabled. In `All term names`, selecting one opens a clear locked preview showing the teaching lesson and a direct `Go to Lesson N` action.
- Full meaning, morphology, retrieval, and Frayer tools still unlock only after the learner visits the teaching lesson.
- Added a regression for the exact reported concept, `Regulated variable and set point`, including the Lesson 9 deep link and unlock flow.
- Preserved all course content, response IDs, Frayer work, Process Collection records, completion rules, Pilot 1, and production Units A-D.

## Files changed

- `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`
- `scripts/lib/biology30-unit-a-pilot-2/build-full.ts`
- `scripts/tests/biology30-unit-a-pilot-2.test.ts`
- `e2e/specs/biology30-unit-a-pilot-2.spec.ts`
- `scripts/audit-biology30-unit-a-pilot-2-visual.ts`
- `projects/biology30-unit-a-pilot-2/workspace/index.html`
- `projects/biology30-unit-a-pilot-2/meta/revision-gate-b-review.json`
- `projects/biology30-unit-a-pilot-2/meta/review-deployment.json`
- `projects/biology30-unit-a-pilot-2/meta/pilot-2-contract.json`
- `projects/biology30-unit-a-pilot-2/meta/revision-gate-b-content-audit.json`
- `projects/biology30-unit-a-pilot-2/meta/pilot-2-improvement-ledger.json`
- `projects/biology30-unit-a-pilot-2/meta/pilot-2-improvement-journal.md`
- `projects/biology30-unit-a-pilot-2/meta/prompt-pack.md`
- `projects/biology30-unit-a-pilot-2/raw/revision-gate-b-review-baselines/b6eaba5b1f543a62e8971a55b36e5705df01e0f14adc7eaddafcd81989da0e8f/**`
- `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-04T15-11-00-737Z/**`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## Verification run

- Transactional rebuild passed; the superseded `b6eaba5b...` candidate was preserved and marked `changes-requested` before replacement.
- `npm run test:biology30-unit-a-pilot-2`: 10/10 passed.
- `npm run verify -- --project biology30-unit-a-pilot-2 --mode workspace`: passed.
- `npm run test:e2e:project -- --project biology30-unit-a-pilot-2`: 1/1 passed.
- `npm run test:e2e:biology30-unit-a-pilot-2`: 18/18 passed.
- `npm run test:biology30-unit-a-improvement-pilot`: 12/12 passed.
- `npm run test:science-comparison`: 6/6 passed.
- `npm run validate:manifests`: passed for all projects.
- `npm run build:studio`: passed.
- Visual audit passed with 78 route screenshots, 131 interaction-state screenshots, 29 contact sheets, and zero geometry findings.
- All 29 exact-build contact sheets were opened and inspected, including the new locked `Regulated variable and set point` state at 1265x902.
- `npm run course:doctor -- --project biology30-unit-a-pilot-2`: returned only the intentional `not-active` diagnostic.
- Worst-case learner state remains 38,753 characters.

## Source of truth

- Authored vocabulary renderer and runtime: `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`
- Transactional builder and validation: `scripts/lib/biology30-unit-a-pilot-2/build-full.ts`
- Reviewable learner candidate: `projects/biology30-unit-a-pilot-2/workspace/index.html`
- Review record: `projects/biology30-unit-a-pilot-2/meta/revision-gate-b-review.json`
- Visual audit: `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-04T15-11-00-737Z/report.json`
- Learner SHA-256: `24e18ca81a7bf33a0182825be95472fa2a3f6ac55b779f90f14855e25ee9c66c`
- Workspace-tree SHA-256: `57f903d6d3501fe0500ec2deb13faf69d41d6df52680b1d84b80c3c30a18a544`
- State-budget SHA-256: `740bdc0da3260c8412f65b6ef303948e35e4345a2f7a86f370fba62cd20b5ce9`
- Visual-audit report SHA-256: `c2cb7f39dcf867d6b465d8758ffcd2496db71ed5c696e99c8feb0a318de36584`

## Known risks / follow-up

- This candidate is Codex-verified but not teacher-accepted. Review should test both vocabulary filters and the future-term lesson link.
- Any learner-facing workspace change invalidates this exact review SHA and its visual evidence.
- The public Firebase review remains on the older `e5398f56...` build. A separate deployment request is required to publish this candidate.
- The repository contains extensive unrelated user-owned changes and untracked files. Never broadly stage, format, clean, or reset them.

## Fragile areas / what might drift

- Keep `.vocabulary-index button[hidden]{display:none}` or another explicit author rule; the grid display rule otherwise makes hidden future rows visible.
- Keep future vocabulary controls enabled in `All term names`; use the locked reader state rather than disabled buttons.
- Keep vocabulary full-content panels unavailable until the mapped lesson has been visited.
- Preserve the 44,000-character state budget and the 18-route completion contract.

## Next prompt assumptions

- Revision Gate A remains accepted.
- The previous `b6eaba5b...` candidate is preserved and marked `changes-requested`.
- The current `24e18ca8...` candidate is Codex-verified, awaiting explicit teacher/user review, and not deployed.
- Acceptance must identify this exact learner SHA. Deployment, commit, push, export, promotion, and Studio editing require separate authorization.

## What still needs validation

- Explicit teacher/user review of `Learned so far`, `All term names`, the locked future-term preview, and `Go to Lesson 9`.
- Explicit acceptance of learner SHA `24e18ca81a7bf33a0182825be95472fa2a3f6ac55b779f90f14855e25ee9c66c` if satisfactory.
- If public review is wanted, a separate deployment request followed by hosted-page and iframe verification.

## Exact next command

`npm run studio`

## Exact next file to open

`projects/biology30-unit-a-pilot-2/workspace/index.html`

## Do not do next / warnings

- Do not mark `teacherDecision` accepted until the teacher/user explicitly accepts learner SHA `24e18ca81a7bf33a0182825be95472fa2a3f6ac55b779f90f14855e25ee9c66c`.
- Do not deploy, commit, push, export, promote, enable Studio Edit, modify Pilot 1, or modify Units A-D without separate authorization.
