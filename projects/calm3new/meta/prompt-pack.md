# Prompt Pack

- Project: calm3new
- Generated: 2026-03-09T21:54:51.504Z

## Rules

- Work in repo-approved zones (`app/studio`, `app/server`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Retrieval order: prompt-pack -> course blueprint -> assessment map -> lesson packets -> targeted resource chunks -> pattern matches if enabled.
- Finish only after typecheck/build and task-specific verification pass.

## Intelligence Policy

- Mode: collect
- Policy source: env-override
- Collect pattern bank: on
- Collect memory ledger: on
- Apply pattern bank to prompt pack: off
- Apply memory ledger to prompt pack: off
- Apply memory ledger to recommendations: off

## Project Manifest

```json
{
  "id": "0d218bb6-0368-4c7d-a585-0fde793c4c4f",
  "slug": "calm3new",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\calm3new\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm3new\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm3new\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-09T21:54:51.469Z",
  "createdAt": "2026-03-09T21:53:29.563Z",
  "updatedAt": "2026-03-09T21:54:51.469Z",
  "workspaceApprovedAt": "2026-03-09T21:54:51.469Z"
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



## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project calm3new`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project calm3new`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project calm3new`

## Anti-Summary Generation Rules

- Build from outline authority plus assessment demand, not from whole-book excerpts.
- Never generate a lesson that lacks outcomes, linked assessments, misconceptions, guided practice, independent practice, and readiness evidence.
- A lesson is a failure if it reads like chapter notes, only defines terms, or cites broad source blobs instead of targeted lesson evidence.
- Prefer lesson-packet-scoped references and page/section locators over raw document dumps.
- Use textbook or reference sources only to support a specific outcome and assessment demand.

## Sections List

- Nav -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js
- Section -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js
- Intro -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js
- Attitude -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js
- Trends -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js
- Career Prep -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js
- Job Search -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js
- Safety -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://unpkg.com/lucide@latest, https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;family=Lora:italic,wght@0,400;0,700;1,400&amp;display=swap

## Visual Signals
- Tailwind-style color tokens: slate-50, slate-900, slate-200, indigo-700, slate-400, slate-100, indigo-600, indigo-200, indigo-50, slate-600
- Hex colors: #f1f5f9, #cbd5e1, #94a3b8
- Repeated shape tokens: rounded-xl, rounded-full, rounded-2xl, rounded-[2.5rem, rounded-3xl, rounded-[2rem, rounded, rounded-sm
- Motion and interaction tokens: transition-all, hover:text-indigo-600, hover:bg-indigo-700, hover:-translate-y-0.5, active:translate-y-0, hover:bg-indigo-50, hover:bg-slate-50/50, hover:border-slate-300

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

- Project: calm3new
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\CALM3NEW

## Sections
- Nav (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js)
- Section (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js)
- Intro (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js)
- Attitude (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js)
- Trends (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js)
- Career Prep (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js)
- Job Search (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js)
- Safety (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\workspace\main.js)
```

## Import Log

```md
# Import Log

- Generated: 2026-03-09T21:53:29.563Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\CALM3NEW

## Actions
- Detected "CALM3NEW.HTML" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Externalized 1 inline style block(s) to workspace/styles.css.
- Externalized 1 inline script block(s) to workspace/main.js.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\calm3new.json).
- Updated local pattern bank (18 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\meta\prompt-pack.md).

## Warnings
- None.
```

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
