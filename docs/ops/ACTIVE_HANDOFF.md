# Handoff

- Project: repo-wide
- Task: Refresh the active handoff around current plan status and next execution priorities
- Status: ready

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ARCHIVED_HANDOFFS.md

## What changed
- Archived the previous `hss1010` handoff before replacing the active handoff.
- Made `tasks/active.md` the current execution source for repo planning status.
- Captured the live work as Forensics Phase 6 QA/hardening.
- Captured the next planned repo investment as the high-confidence E2E suite described in `tasks/active.md`.
- Marked older `docs/plans/**` entries as backlog/history unless a specific plan is reactivated.

## Why this changed
- The active handoff was pointing at an `hss1010` continuation, but the repo's current task board now points to Forensics QA/hardening and E2E confidence work.
- The plan backlog is large enough that the next operator needs a triage summary instead of treating every plan file as equally current.

## Plan status update
- Active execution: `tasks/active.md` -> Forensics Phase 6 QA/hardening.
- Required gate for active execution: `npm run test:e2e:project -- --project forensics`.
- Verification floor for active execution: `npm run verify -- --project forensics`, `npm run typecheck`, and `npm run build:studio`.
- Next plan after QA: High-Confidence Suite in `tasks/active.md`, covering stable `data-testid` hooks, contract schema expansion, reusable deep-contract specs, deterministic fixtures, and docs for smoke vs contract vs deep suite.
- Recent actionable backlog: `docs/plans/2026-04-07-calm-module-4-career-planner-fixes.md`, but only switch to it if the user explicitly chooses CALM Module 4 over the current Forensics task.
- Back-burner backlog: `docs/plans/2026-03-14-practice-engine-roadmap-design.md`.
- Older March plans cover Studio polish, HSS1010 conversion/rebuild, Google-hosted export/deploy, authoring preference enforcement, image pipeline, and benchmark systems; treat them as design/history until their current implementation status is checked.

## Source of truth
- Current task board: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\tasks\active.md
- Plan backlog: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans
- Handoff standard: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\HANDOFF.md
- Forensics project metadata: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics\meta\project.json
- Forensics canonical entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics\workspace\index.html
- Forensics canonical sources: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics\workspace\main.jsx, C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics\workspace\main.js, C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics\workspace\assets\module8assignment.html, C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics\workspace\assets\module8assignment-app.jsx

## Fragile areas / watchouts
- Forensics has generated bundle outputs under `projects/forensics/workspace/assets/*.bundle.js`; rebuild from matching source files instead of hand-patching bundles where possible.
- `projects/forensics/raw/**` and `projects/resources/forensics/**` are protected for the active task.
- The current task requires E2E because it touches learner/archive visibility, module navigation, quiz state/progress, and fallback behavior.
- Several `docs/plans/**` files are likely partially or fully implemented; do not execute an old plan without checking the current code and metadata first.

## Next prompt should assume
- The active repo work is Forensics Phase 6 QA/hardening, not HSS1010 editing.
- Stay in `projects/forensics/workspace/**`, `projects/forensics/meta/**`, and minimal shared code only if a reusable parser/rendering gap is confirmed.
- No new dependencies, renames, structural rewrites, visual redesigns, broad refactors, or new feature scope for the active task.
- If switching to plan backlog work, name the specific plan file first and re-check status before editing.

## What still needs validation
- Run the Forensics project E2E contract: `npm run test:e2e:project -- --project forensics`.
- Run the active task verification floor: `npm run verify -- --project forensics`, `npm run typecheck`, and `npm run build:studio`.
- Manual learner/archive review is still required across the representative module pass list in `tasks/active.md`.

## Known risks
- This was a docs-only handoff refresh; no validation commands were run.
- The plan inventory is based on current task docs and plan files, not a full code-status audit.
- The older plan backlog may contain stale commands, completed work, or assumptions that no longer match the codebase.

## Exact next command
`npm run test:e2e:project -- --project forensics`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\tasks\active.md`

## Do not do next / warnings
- Do not edit `projects/forensics/raw/**` or `projects/resources/forensics/**`.
- Do not treat older `docs/plans/**` files as active instructions until one is explicitly selected and status-checked.
- Do not skip the E2E gate for Forensics Phase 6.
