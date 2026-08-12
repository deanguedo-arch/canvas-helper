# Handoff

- Project: `repo-wide`
- Task: Prepare a complete post-roadmap Canvas Studio brief for an independent ChatGPT Pro / Terra Max audit.
- Status: complete; the brief is ready to attach to ChatGPT Pro.

## Files changed

- `docs/audits/2026-08-12-canvas-studio-current-state-and-next-step-audit.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Added a course-neutral current-state brief covering every functional change delivered across phases A through H.
- Added a before/after matrix, verified limits, release evidence, remaining usability questions, and Codex's ranked product recommendation.
- Added a copy-ready ChatGPT Pro / Terra Max prompt requiring repository verification, red-team, green-team, and adjudication.
- Archived the completed A-H handoff without changing Studio code or learner-course artifacts.

## Why this changed

- The next independent audit needs the completed implementation state rather than the superseded pre-roadmap audit.
- The brief prevents duplicate recommendations for work already completed and gives the adviser a concrete product position to challenge.

## Verification run

- Passed: `git diff --check`.
- Verified: branch `codex/studio-roadmap-phases` and pushed implementation/handoff commits `1ad3cc21` and `dc89ec96`.
- Verified: all referenced Studio audit files and owning source paths exist.
- Read-only live check: current Studio at `http://127.0.0.1:5173/` confirms the course-first toolbar, Focus/Current controls, Annotate, Full Preview, Review Set, and Tools surfaces.
- Not rerun: `npm run test:studio-release`, because this task changes documentation only.

## Source of truth

- New independent-audit brief: `docs/audits/2026-08-12-canvas-studio-current-state-and-next-step-audit.md`.
- Completed implementation record: `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`.
- Product release record: `docs/releases/2026-08-11-canvas-studio.md`.

## Fragile areas / watchouts

- Adviser recommendations are proposals until Codex verifies them locally.
- Keep the audit course-neutral; use courses only as varied regression fixtures.
- Do not turn a visual refinement into another broad redesign or an embedded AI feature.
- Unrelated local intake, resource, and duplicate test-result folders remain unstaged.

## Next prompt should assume

- Canvas Studio phases A through H are complete and pushed.
- The new document is the current audit brief; the Downloads audit describes the older pre-roadmap state.
- Codex's position is visual/usability refinement first, then validate a small Verify Changes loop and compact handoff modes.

## What still needs validation

- ChatGPT Pro should verify the named branch and commits through GitHub and complete the requested red-team/green-team adjudication.
- Any accepted implementation plan must be rechecked locally before code changes.

## Known risks

- A GitHub auditor cannot see this new uncommitted brief unless the user attaches it directly or it is later committed and pushed.
- Repository-wide typecheck retains unrelated historical diagnostics and is not evidence against this documentation-only task.

## Exact next command

`git diff -- docs/audits/2026-08-12-canvas-studio-current-state-and-next-step-audit.md`

## Exact next file to open

`docs/audits/2026-08-12-canvas-studio-current-state-and-next-step-audit.md`

## Do not do next / warnings

- Do not ask the adviser to repeat phases A through H.
- Do not accept adviser claims about repository state without local verification.
- Do not edit learner-course output to change shared Studio behavior.
