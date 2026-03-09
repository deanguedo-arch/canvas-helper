# Prompt Pack

- Project: calmmodule2
- Generated: 2026-03-09T21:54:36.368Z

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
  "id": "33591f13-3d65-476b-98c5-39fa0e1d88db",
  "slug": "calmmodule2",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\calmmodule2\\source",
  "inputKind": "text-html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calmmodule2\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calmmodule2\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-09T21:54:36.330Z",
  "createdAt": "2026-03-06T20:40:30.861Z",
  "updatedAt": "2026-03-09T21:54:36.330Z",
  "workspaceApprovedAt": "2026-03-09T21:54:36.330Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: textbook: 1.

## Resource Catalog Summary

### CALM MODULE TWO – RESOURCE CHOICES OUTREACH PROGRAMS – REVISED 2018 (textbook)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\calmmodule2\CALM Module 2 - Resourse Choices.pdf
- Extraction: indexed via native
- Chunks: 22
- Signals: text:what-is

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project calmmodule2`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project calmmodule2`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project calmmodule2`

## Anti-Summary Generation Rules

- Build from outline authority plus assessment demand, not from whole-book excerpts.
- Never generate a lesson that lacks outcomes, linked assessments, misconceptions, guided practice, independent practice, and readiness evidence.
- A lesson is a failure if it reads like chapter notes, only defines terms, or cites broad source blobs instead of targeted lesson evidence.
- Prefer lesson-packet-scoped references and page/section locators over raw document dumps.
- Use textbook or reference sources only to support a specific outcome and assessment demand.

## Sections List

- No sections detected.

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://unpkg.com/react@18/umd/react.development.js, https://unpkg.com/react-dom@18/umd/react-dom.development.js, https://unpkg.com/@babel/standalone/babel.min.js, https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js, https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap

## Visual Signals
- Tailwind-style color tokens: slate-700, amber-50, amber-200, amber-100, amber-900, amber-500, violet-500, violet-600, violet-50, violet-100
- Hex colors: #f8fafc, #334155, #f1f5f9, #cbd5e1, #94a3b8, #e2e8f0, #8b5cf6, #6d28d9, #5b21b6, #475569
- Repeated shape tokens: rounded-2xl, rounded-xl, rounded-full, rounded-3xl
- Motion and interaction tokens: transition, transition-all, hover:bg-amber-100, transition-transform, hover:text-violet-600, hover:bg-slate-100, transition-colors, hover:bg-red-600, hover:bg-slate-50, active:translate-y-[6px

## Interaction Notes
- Uses localStorage for persistence.
- Reads local uploads with FileReader.
- Uses canvas-confetti for celebratory interactions.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
```

## Content Outline

```md
# Content Outline

- Project: calmmodule2
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\_incoming\calmmodule2

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-03-06T20:40:30.861Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\_incoming\calmmodule2

## Actions
- Detected "calmmodule2.html.txt" as the site entrypoint inside the source folder.
- Extracted an HTML document from the source text file into raw/original.html.
- Preserved the original text input at raw/original-source.txt.
- Externalized 1 inline style block(s) to workspace/styles.css.
- Externalized 2 inline script block(s) to workspace/main.jsx.
- Copied 1 supporting file(s) into references/raw.
- Indexed the imported supporting material into references/extracted.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\calmmodule2.json).
- Updated local pattern bank (10 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calmmodule2\meta\prompt-pack.md).

## Warnings
- Merged inline scripts with different attributes into one external script. Review workspace/main for compatibility.
```

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### calm-module-2-resourse-choices-pdf (pdf/textbook)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\calmmodule2\CALM Module 2 - Resourse Choices.pdf

```text
CALM MODULE TWO – RESOURCE CHOICES
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
