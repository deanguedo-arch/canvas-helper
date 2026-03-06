# Prompt Pack

- Project: calm-module-2-activites-reference
- Generated: 2026-03-06T21:36:25.269Z

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
  "id": "d444c1d0-e149-4f7d-97a3-7611bfd097fd",
  "slug": "calm-module-2-activites-reference",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\calm-module-2-activites-reference\\source",
  "inputKind": "text-html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm-module-2-activites-reference\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm-module-2-activites-reference\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-06T21:36:25.229Z",
  "createdAt": "2026-03-06T20:40:30.530Z",
  "updatedAt": "2026-03-06T21:36:25.229Z",
  "workspaceApprovedAt": "2026-03-06T21:36:25.229Z"
}
```

## Sections List

- No sections detected.

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://unpkg.com/react@18/umd/react.production.min.js, https://unpkg.com/react-dom@18/umd/react-dom.production.min.js, https://unpkg.com/@babel/standalone/babel.min.js, https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js

## Visual Signals
- Tailwind-style color tokens: slate-200, blue-600, blue-700, slate-300, slate-800, rose-500, rose-600, emerald-500, emerald-600, slate-700
- Hex colors: #f8fafc, #0f172a, #ff0000, #000000
- Repeated shape tokens: rounded-2xl, rounded-xl, rounded-lg, rounded-bl, rounded, rounded-br, rounded-t
- Motion and interaction tokens: hover:bg-blue-700, hover:bg-slate-300, hover:bg-rose-600, hover:bg-emerald-600, transition-all, hover:shadow-md, hover:-translate-y-0.5, transition-colors, hover:text-slate-800, hover:bg-slate-50

## Interaction Notes
- Uses canvas-confetti for celebratory interactions.
- Includes print-specific Tailwind utility styling.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
```

## Content Outline

```md
# Content Outline

- Project: calm-module-2-activites-reference
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\_incoming\calm module 2 activites reference

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-03-06T20:40:30.530Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\_incoming\calm module 2 activites reference

## Actions
- Detected "calm2 activites.html.txt" as the site entrypoint inside the source folder.
- Extracted an HTML document from the source text file into raw/original.html.
- Preserved the original text input at raw/original-source.txt.
- Externalized 1 inline style block(s) to workspace/styles.css.
- Externalized 1 inline script block(s) to workspace/main.jsx.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\calm-module-2-activites-reference.json).
- Updated local pattern bank (10 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-2-activites-reference\meta\prompt-pack.md).

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
