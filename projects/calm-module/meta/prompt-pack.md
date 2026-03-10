# Prompt Pack

- Project: calm-module
- Generated: 2026-03-10T14:18:24.455Z

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
  "id": "cb6efd51-9046-430f-a9e1-0f8fd3fd6621",
  "slug": "calm-module",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\calm-module\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm-module\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm-module\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-10T14:18:24.321Z",
  "createdAt": "2026-03-06T02:06:47.139Z",
  "updatedAt": "2026-03-10T14:18:24.321Z",
  "workspaceApprovedAt": "2026-03-10T14:18:24.321Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: outline: 1.

## Resource Catalog Summary

### CALM MODULE ONE – PERONSAL CHOICES OUTREACH PROGRAMS – REVISED 2018 (outline)
- Authority: blueprint-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\calm-module\CALM Module 1 - Personal Choices.pdf
- Extraction: indexed via native
- Chunks: 32
- Signals: text:outcomes, text:section-heading

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project calm-module`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project calm-module`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project calm-module`

## Anti-Summary Generation Rules

- Build from outline authority plus assessment demand, not from whole-book excerpts.
- Never generate a lesson that lacks outcomes, linked assessments, misconceptions, guided practice, independent practice, and readiness evidence.
- A lesson is a failure if it reads like chapter notes, only defines terms, or cites broad source blobs instead of targeted lesson evidence.
- Prefer lesson-packet-scoped references and page/section locators over raw document dumps.
- Use textbook or reference sources only to support a specific outcome and assessment demand.

## Sections List

- Overview (heading: nextSTEP High School) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Inventory (heading: Looking after myself) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Goals -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Romantic (heading: Relationship Timeline) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Evaluating (heading: The Vibe Check) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Alcohol (heading: Action & Consequence) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Tobacco (heading: Warning: Highly Addictive) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Risk (heading: The Risk Meter) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Addictions (heading: The Addiction Continuum) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Mental Health (heading: You are not alone) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Task A (heading: The Mission) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Task B (heading: Quick Character Recap:) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Submit (heading: Wait up! You have missing answers.) -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx
- Content -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://unpkg.com/react@18/umd/react.development.js, https://unpkg.com/react-dom@18/umd/react-dom.development.js, https://unpkg.com/@babel/standalone/babel.min.js, https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js, https://www.youtube.com/embed/yRUAzGQ3nSY?rel=0

## Visual Signals
- Tailwind-style color tokens: slate-100, slate-300, slate-800, violet-100, violet-700, violet-200, slate-600, slate-700, slate-500, violet-500
- Hex colors: #f1f5f9, #e2e8f0, #5b21b6, #bae6fd, #fde68a, #a7f3d0, #fecdd3, #ddd6fe, #8b5cf6, #10b981
- Repeated shape tokens: rounded-[2rem, rounded-full, rounded-xl, rounded-2xl, rounded-lg, rounded-md, rounded-l, rounded-r, rounded-[3rem, rounded-3xl
- Motion and interaction tokens: transition-all, hover:text-violet-700, transition-colors, hover:border-violet-300, active:bg-violet-100, hover:border-violet-200, hover:text-violet-600, active:translate-y-[2px, active:shadow-none, hover:text-rose-600

## Interaction Notes
- Uses localStorage for persistence.
- Embeds iframe-based media or content.
- Reads local uploads with FileReader.
- Uses canvas-confetti for celebratory interactions.
- Uses confirm dialogs for destructive actions.
- Includes print-specific Tailwind utility styling.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
```

## Content Outline

```md
# Content Outline

- Project: calm-module
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\canvas code and references\CALM MODULE .HTML

## Sections
- Overview - heading: nextSTEP High School (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Inventory - heading: Looking after myself (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Goals (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Romantic - heading: Relationship Timeline (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Evaluating - heading: The Vibe Check (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Alcohol - heading: Action & Consequence (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Tobacco - heading: Warning: Highly Addictive (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Risk - heading: The Risk Meter (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Addictions - heading: The Addiction Continuum (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Mental Health - heading: You are not alone (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Task A - heading: The Mission (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Task B - heading: Quick Character Recap: (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Submit - heading: Wait up! You have missing answers. (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
- Content (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\workspace\main.jsx)
```

## Import Log

```md
# Import Log

- Generated: 2026-03-06T02:06:47.139Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\canvas code and references\CALM MODULE .HTML

## Actions
- Copied the source HTML into raw/original.html without modifying it.
- Externalized 1 inline script block(s) to workspace/main.jsx.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\calm-module.json).
- Updated local pattern bank (1 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\meta\prompt-pack.md).

## Warnings
- None.
```

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### calm-module-1-personal-choices-pdf (pdf/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\calm-module\CALM Module 1 - Personal Choices.pdf

```text
CALM MODULE ONE – PERONSAL CHOICES
OUTREACH PROGRAMS – REVISED 2018
1

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
rkvegrevillenextstepfortsa...
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
