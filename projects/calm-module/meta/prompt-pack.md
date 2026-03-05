# Prompt Pack

- Project: calm-module
- Generated: 2026-03-05T12:54:25.982Z

## Rules

- Work in repo-approved zones (`app/studio`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Avoid dependency changes unless explicitly required.
- Finish only after typecheck/build and task-specific verification pass.

## Project Manifest

```json
{
  "id": "f297d844-12e7-4e2b-915f-8d909f19ed7d",
  "slug": "calm-module",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas helper\\canvas code and references",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas helper\\projects\\calm-module\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas helper\\projects\\calm-module\\raw\\original.html",
  "createdAt": "2026-03-04T17:50:43.536Z",
  "updatedAt": "2026-03-05T12:54:22.226Z"
}
```

## Sections List

- Card -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/Card.jsx
- Hint Toggle -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/HintToggle.jsx
- Input -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/Input.jsx
- Knowledge Drop -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/KnowledgeDrop.jsx
- Label -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/Label.jsx
- Pill Radio Group -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/PillRadioGroup.jsx
- Section Title -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/SectionTitle.jsx
- Textarea -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/Textarea.jsx
- Overview (heading: nextSTEP High School) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Inventory (heading: Looking after myself) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Goals -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Romantic (heading: Relationship Timeline) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Evaluating (heading: The Vibe Check) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Alcohol (heading: Action & Consequence) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Tobacco (heading: Warning: Highly Addictive) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Risk (heading: The Risk Meter) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Addictions (heading: The Addiction Continuum) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Mental Health (heading: You are not alone) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Task A (heading: The Mission) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Task B (heading: Quick Character Recap:) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Submit (heading: Wait up! You have missing answers.) -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx
- Content -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://unpkg.com/react@18/umd/react.development.js, https://unpkg.com/react-dom@18/umd/react-dom.development.js, https://unpkg.com/@babel/standalone/babel.min.js, https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js, https://www.youtube.com/embed/yRUAzGQ3nSY?rel=0

## Visual Signals
- Tailwind-style color tokens: sky-500, sky-100, amber-500, amber-100, emerald-500, emerald-100, rose-500, rose-100, orange-500, orange-100
- Hex colors: #f1f5f9, #8b5cf6, #10b981, #f59e0b, #f43f5e, #0ea5e9, #ddd6fe, #7e22ce, #fda4af, #a7f3d0
- Repeated shape tokens: rounded-[2rem, rounded-xl, rounded-2xl, rounded-lg, rounded-full, rounded-md, rounded-l, rounded-r, rounded-[3rem, rounded-3xl
- Motion and interaction tokens: transition-all, transition-colors, hover:text-rose-600, hover:border-violet-300, hover:-translate-y-1, hover:shadow-[0_6px_0_0_, active:translate-y-[2px, active:shadow-none, hover:opacity-100, hover:bg-lime-100

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
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas helper\canvas code and references

## Sections
- Card (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/Card.jsx)
- Hint Toggle (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/HintToggle.jsx)
- Input (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/Input.jsx)
- Knowledge Drop (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/KnowledgeDrop.jsx)
- Label (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/Label.jsx)
- Pill Radio Group (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/PillRadioGroup.jsx)
- Section Title (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/SectionTitle.jsx)
- Textarea (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/components/Textarea.jsx)
- Overview - heading: nextSTEP High School (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Inventory - heading: Looking after myself (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Goals (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Romantic - heading: Relationship Timeline (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Evaluating - heading: The Vibe Check (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Alcohol - heading: Action & Consequence (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Tobacco - heading: Warning: Highly Addictive (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Risk - heading: The Risk Meter (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Addictions - heading: The Addiction Continuum (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Mental Health - heading: You are not alone (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Task A - heading: The Mission (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Task B - heading: Quick Character Recap: (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Submit - heading: Wait up! You have missing answers. (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
- Content (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module/workspace/main.jsx)
```

## Import Log

```md
# Import Log

- Generated: 2026-03-04T17:50:43.536Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas helper\canvas code and references

## Actions
- Detected "CALM MODULE .HTML" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Externalized 1 inline script block(s) to workspace/main.jsx.
- Copied 1 supporting file(s) into references/raw.
- Indexed the imported supporting material into references/extracted.

## Warnings
- None.
```

## Reference Excerpts

### calm-module-1-personal-choices-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module\references\raw\CALM Module 1 - Personal Choices.pdf

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
rkvegrevillenextstepfortsaskatchewan
sherwoodparkvegrevillenextstepforts
 
STUDENT NAME: 
 
 
 
 
 
 
  
Career and 
Life 
Management 
Module 1 
Personal Choices 
 
SENIOR HIGH SCHOOL 
Fort Saskatchewan 780 992 0101 
Sherwood Park 780 464 1899 
Vegreville 780 632 7998  
 
 
 

  
CALM MODULE ONE – PERONSAL CHOICES 
OUTREACH PROGRAMS – REVISED 2018 
2 
 
COURSE OVERVIEW 
 
CALM is a compulsory course for Alberta High School students.  It is the 
final component of the grade 1-12 Health Promotion Program.  It is a 3 
c...
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
