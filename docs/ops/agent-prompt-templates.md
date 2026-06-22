# Agent Prompt Templates

These templates assume the repo follows the current architecture and governance contract.

## Shared Retrieval Rule

- Start surgical.
- Read only the smallest file set that can answer the task.
- Do not widen scope preemptively.
- If the task needs broader retrieval or a different behavior, stop and ask for approval before continuing.
- When asking, include the reason, the extra scope requested, and the expected token or time cost.

## Shared Subagent Rule

- If the user explicitly says this is a subagent, or says to act as a subagent, treat the task as subagent mode automatically.
- If the signal is ambiguous, ask exactly once: `Should I apply subagent rules for this task?`
- Keep subagent mode on for the rest of the task once confirmed unless the user changes the scope.
- Do not keep asking whether to apply subagent rules after confirmation.

## 1. Studio UI Change

```text
Project: <slug>
Task: Update Studio UI behavior in <component or workflow>.
Boundary:
- Touch only app/studio unless server support is explicitly required.
Constraints:
- Preserve compare/focus preview behavior.
- Keep filesystem access out of the frontend.
- No drive-by visual redesign.
Verification:
- npm run typecheck
- npm run build:studio
Deliver:
- Summary
- Files changed
- Verification run
- Known risks / follow-up
```

## 2. Local Server Change

```text
Task: Update local server handling for <route or preview behavior>.
Boundary:
- Touch app/server and only the minimum related Studio wiring.
Constraints:
- Preserve local filesystem-driven serving.
- Keep safe path validation explicit.
- Do not move command logic into the browser.
Verification:
- npm run typecheck
- npm run build:studio
- route-specific verification steps
Deliver:
- Summary
- Architecture impact
- Verification run
- Exact next command
```

## 3. Intelligence Policy Change

```text
Task: Adjust intelligence collect/apply behavior.
Boundary:
- Touch scripts/lib/intelligence/config, collect, or apply only.
Constraints:
- Collection must remain explicit.
- Application must respect off, collect, and apply modes.
- Preserve precedence: CLI > LEARNER_MODE > project > repo.
Verification:
- targeted tests
- npm run typecheck
Deliver:
- Policy change summary
- Flags added or changed
- Behavior by mode
- Risks
```

## 4. Pipeline / Export Change

```text
Project: <slug>
Task: Change import/analyze/refs/export behavior.
Boundary:
- Touch scripts plus the smallest necessary docs.
Constraints:
- Preserve local-first workflow.
- Do not edit raw or exports manually unless the task explicitly requires it.
- Update smoke verification if the core path changes.
Verification:
- targeted tests
- smoke path
- npm run typecheck
Deliver:
- Pipeline impact
- Files changed
- Verification run
- Follow-up
```

## 5. Incoming Intake Change

```text
Task: Change incoming bundle or tagged reference intake behavior.
Boundary:
- Touch scripts, the local server route, and the smallest necessary Studio wiring.
Constraints:
- Keep `projects/incoming/` as the import drop zone.
- Keep `projects/resources/<slug>/` as the canonical resource source.
- Keep `projects/processed/<slug>/source/` to one latest snapshot per slug.
- Do not reintroduce Gemini-specific folder lanes.
Verification:
- npm run typecheck
- npm run build:studio
- node --import tsx --test scripts/tests/incoming-watch.test.ts scripts/tests/incoming-intake.test.ts scripts/tests/incoming-route.test.ts scripts/tests/studio-incoming-refresh.test.ts
Deliver:
- Intake behavior summary
- Conflict policy
- Manual refresh behavior
- Risks
```

## 6. Session Handoff

```text
Project: <slug or repo-wide>
Task: Produce a strict handoff.
Use docs/ops/HANDOFF.md exactly and write it to docs/ops/ACTIVE_HANDOFF.md.
Include:
- Status
- Files changed
- What changed
- Why this changed
- Source of truth
- Fragile areas / watchouts
- Next prompt should assume
- What still needs validation
- Known risks
- Exact next command
- Exact next file to open
- Do not do next / warnings
```

## 7. English 30-1 Unit Replication

```text
Mode: DEFAULT
Workflow: conversion
Project: <ela30-1-unit-slug>
Canonical entry: projects/<slug>/workspace/index.html
Boundary:
- Touch the workspace course shell, project metadata, declared builder/source files, and export package only when regenerating the final deliverable.
Source-of-truth constraints:
- Imported Brightspace files are reference-only unless rebuilding from source.
- Workspace/builder source is canonical.
- Do not manually patch SCORM output except for inspection; fix workspace/builder, then rerun export.
Success criteria:
- Student-facing shell follows the English 30-1 replication model.
- Film Room media plays in browser preview; questionable MP4s are converted to H.264/AAC with +faststart before packaging.
- Text/question banks populate from dropdowns without pushing content or exposing local file-path language.
- Fillable fields accept continuous typing, keep focus, autosave, and restore after reload.
- SCORM 2004 export passes test:scorm, zip integrity, bridge-before-inline-script check, and packaged media verification.
Verification:
- Browser preview for the changed surface.
- ffprobe for converted media when local video/audio is included.
- npm run test:scorm
- unzip -tq projects/<slug>/exports/<slug>-scorm-2004.zip
Deliver:
- Package path
- Verification run
- Known risks, especially LMS suspend-data size and large media upload limits
```

## 8. Workflow Prompt Contract

Use `docs/workflows/prompt-contract.md` for day-to-day prompt shape.
