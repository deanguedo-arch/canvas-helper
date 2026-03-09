# Prompt Pack

- Project: calmmodule3
- Generated: 2026-03-09T21:26:03.086Z

## Rules

- Work in repo-approved zones (`app/studio`, `app/server`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Retrieval order: prompt-pack -> course blueprint -> assessment map -> lesson packets -> targeted resource chunks -> pattern matches if enabled.
- Finish only after typecheck/build and task-specific verification pass.

## Intelligence Policy

- Mode: collect
- Policy source: repo-default
- Collect pattern bank: on
- Collect memory ledger: on
- Apply pattern bank to prompt pack: off
- Apply memory ledger to prompt pack: off
- Apply memory ledger to recommendations: off

## Project Manifest

```json
{
  "id": "d5c08208-2069-407b-9f2f-95898ecef629",
  "slug": "calmmodule3",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\incoming\\calm3module\\calmmodule3.html",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calmmodule3\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calmmodule3\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-09T21:26:02.954Z",
  "createdAt": "2026-03-09T21:26:02.882Z",
  "updatedAt": "2026-03-09T21:26:02.954Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: none.

## Resource Catalog Summary

> resource-catalog.json: missing
> Next: `npm run refs -- --project calmmodule3`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project calmmodule3`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project calmmodule3`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project calmmodule3`

## Anti-Summary Generation Rules

- Build from outline authority plus assessment demand, not from whole-book excerpts.
- Never generate a lesson that lacks outcomes, linked assessments, misconceptions, guided practice, independent practice, and readiness evidence.
- A lesson is a failure if it reads like chapter notes, only defines terms, or cites broad source blobs instead of targeted lesson evidence.
- Prefer lesson-packet-scoped references and page/section locators over raw document dumps.
- Use textbook or reference sources only to support a specific outcome and assessment demand.

## Sections List

- Nav -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calmmodule3\workspace\main.js
- Question -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calmmodule3\workspace\main.js

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap

## Visual Signals
- Tailwind-style color tokens: slate-900, slate-800, blue-600, blue-400, slate-700, blue-500, slate-300, blue-950, blue-900, slate-400
- Hex colors: #334155, #64748b, #3b82f6, #22c55e, #ef4444, #475569, #0f172a, #020617, #e2e8f0, #ffffff
- Repeated shape tokens: rounded-lg, rounded-2xl, rounded-full, rounded-r, rounded-xl, rounded, rounded-md
- Motion and interaction tokens: hover:bg-blue-500, transition-all, transition-opacity, hover:bg-slate-700, transition-colors, transition, hover:text-white, hover:bg-slate-800

## Interaction Notes
- No notable interaction heuristics detected.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
```

## Content Outline

```md
# Content Outline

- Project: calmmodule3
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\calm3module\calmmodule3.html

## Sections
- Nav (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calmmodule3\workspace\main.js)
- Question (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calmmodule3\workspace\main.js)
```

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
