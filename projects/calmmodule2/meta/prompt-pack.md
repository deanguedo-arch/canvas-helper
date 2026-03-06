# Prompt Pack

- Project: calmmodule2
- Generated: 2026-03-06T21:36:25.386Z

## Rules

- Work in repo-approved zones (`app/studio`, `app/server`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Retrieval order: prompt-pack -> local pattern bank matches -> projects/resources/<slug>/_extracted.
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
  "learningUpdatedAt": "2026-03-06T21:36:25.340Z",
  "createdAt": "2026-03-06T20:40:30.861Z",
  "updatedAt": "2026-03-06T21:36:25.340Z",
  "workspaceApprovedAt": "2026-03-06T21:36:25.340Z"
}
```

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

### calm-module-2-resourse-choices-pdf (pdf)
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
rkvegrevillenextstepfortsaskatchewan
sherwoodparkvegrevillenextstepforts
 
STUDENT NAME: 
 
 
 
 
 
 
  
Career and 
Life 
Management 
Module 2 
Resource Choices 
 
SENIOR HIGH SCHOOL 
Fort Saskatchewan 780 992 0101 
Sherwood Park 780 464 1899 
Vegreville 780 632 7998  
 
 
 

  
CALM MODULE TWO – RESOURCE CHOICES 
OUTREACH PROGRAMS – REVISED 2018 
2 
 
Resources: Who Decides What You Buy 
 
Advertising and Consumerism    
 
The  Canadian  Code  of  Advertising  Standards  defines  Advertising  as  any  paid  message...
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
