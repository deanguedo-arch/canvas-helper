# Prompt Pack

- Project: e2e-fixture
- Generated: 2026-03-18T14:44:04.852Z

## Rules

- Start with the narrowest useful retrieval path.
- Prefer known entrypoints, targeted reads, and `rg` over broad discovery.
- Do not expand scope or change behavior unless the current context is insufficient.
- If broader retrieval is needed, stop and ask for approval with the reason, added scope, and expected cost.
- Keep follow-up reads minimal even after approval.
- If the user explicitly says this is a subagent, or says to act as a subagent, treat the task as subagent mode automatically.
- If the signal is ambiguous, ask exactly once: `Should I apply subagent rules for this task?`
- Keep subagent mode on for the rest of the task once confirmed unless the user changes the scope.
- Do not keep asking whether to apply subagent rules after confirmation.
- Work in repo-approved zones (`app/studio`, `app/server`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Retrieval order: prompt-pack -> course blueprint -> assessment map -> lesson packets -> targeted resource chunks -> pattern matches if enabled.
- Finish only after typecheck/build and task-specific verification pass.

## Session Mode

- Subagent mode: off
- Use standard task mode.

## Intelligence Policy

- Mode: collect
- Policy source: repo-default
- Collect pattern bank: on
- Collect memory ledger: on
- Apply pattern bank to prompt pack: off
- Apply memory ledger to prompt pack: off
- Apply memory ledger to recommendations: off

## Selected Benchmark

none

## Project Manifest

```json
{
  "id": "ee7ac6f4-3ab4-46ca-b57f-2e7c120b08c6",
  "slug": "e2e-fixture",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\e2e-fixture\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/e2e-fixture/workspace/index.html",
  "rawEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/e2e-fixture/raw/original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-18T14:44:04.818Z",
  "createdAt": "2026-03-16T00:00:00.000Z",
  "updatedAt": "2026-03-18T14:44:04.818Z",
  "workspaceApprovedAt": "2026-03-18T14:44:04.818Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: .

## Resource Catalog Summary



## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project e2e-fixture`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project e2e-fixture`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project e2e-fixture`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project e2e-fixture`

## Anti-Summary Generation Rules

- Build from outline authority plus assessment demand, not from whole-book excerpts.
- Never generate a lesson that lacks outcomes, linked assessments, misconceptions, guided practice, independent practice, and readiness evidence.
- A lesson is a failure if it reads like chapter notes, only defines terms, or cites broad source blobs instead of targeted lesson evidence.
- Prefer lesson-packet-scoped references and page/section locators over raw document dumps.
- Use textbook or reference sources only to support a specific outcome and assessment demand.

## Sections List

> section-map.json: missing

## Style Guide

> style-guide.md: missing

## Content Outline

> content-outline.md: missing

## Import Log

> import-log.md: missing

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

none

## Task Stub

```md
# Task
## Goal
<one sentence>

## Constraints
- Touch only the files listed in this task.
- No new deps.
- No refactors.

## Acceptance tests
- <test 1>
- <test 2>

## Expected files to change
- <file 1>
- <file 2>

## Commands
- npm run typecheck
- npm run build:studio
```
