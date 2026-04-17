# Prompt Pack

- Project: calmmodule3
- Generated: 2026-04-17T20:08:49.315Z

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
  "id": "d5c08208-2069-407b-9f2f-95898ecef629",
  "slug": "calmmodule3",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\calmmodule3\\source",
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
  "learningUpdatedAt": "2026-04-17T20:08:49.238Z",
  "createdAt": "2026-03-09T21:26:02.882Z",
  "updatedAt": "2026-04-17T20:08:49.238Z",
  "workspaceApprovedAt": "2026-04-17T20:08:49.238Z",
  "migrationState": "legacy",
  "preferredWorkflows": [],
  "canonicalSources": [],
  "generatedOutputs": [],
  "injectedComponents": [],
  "exportTargets": [],
  "authoringStatus": "active",
  "referenceOnly": []
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: outline: 2.

## Resource Catalog Summary

### Career and Life Management MODULE 3 Career and Life Choices (outline)
- Authority: blueprint-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\calmmodule3\CALM Module 3  - Career and Life Choices.docx
- Extraction: indexed via native
- Chunks: 80
- Signals: text:objectives, text:outcomes, text:what-is

### killfkh Career and Life (outline)
- Authority: blueprint-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\calmmodule3\CALM Module 3  - Career and Life Choices.pdf
- Extraction: indexed via native
- Chunks: 48
- Signals: text:objectives, text:outcomes, text:what-is

## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project calmmodule3`

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

```md
# Import Log

- Generated: 2026-03-09T21:26:02.882Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\calm3module\calmmodule3.html

## Actions
- Copied the source HTML into raw/original.html without modifying it.
- Externalized 1 inline style block(s) to workspace/styles.css.
- Externalized 1 inline script block(s) to workspace/main.js.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\calmmodule3.json).
- Updated local pattern bank (14 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calmmodule3\meta\prompt-pack.md).

## Warnings
- None.
```

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### calm-module-3-career-and-life-choices-docx (docx/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\calmmodule3\CALM Module 3  - Career and Life Choices.docx

```text
Career and Life Management
```

### calm-module-3-career-and-life-choices-pdf (pdf/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\calmmodule3\CALM Module 3  - Career and Life Choices.pdf

```text
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstefortsaskatchewans
herwoodparkvegrevillenextstepfortsa
skatchewannextstepsherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillepfortsaskatchewa
nsherwoodparkvegrevillenextstepfort
saskatchewansherwoodparkvegreville
nextstepfortsaskatchewansherwoodpa
killfkh

STUDENT NAME:

Career and
Life
Management
MODULE 3
Career and Life Choices

SENIOR HIGH ...
```

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
