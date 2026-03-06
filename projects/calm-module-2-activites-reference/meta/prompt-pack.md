# Prompt Pack

- Project: calm-module-2-activites-reference
- Generated: 2026-03-05T13:30:01.080Z

## Rules

- Work in repo-approved zones (`app/studio`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Retrieval order: prompt-pack -> local pattern bank matches -> references/extracted.
- Finish only after typecheck/build and task-specific verification pass.

## Project Manifest

```json
{
  "id": "c4b2575d-c9ae-42bf-ad88-1c61dedfde7c",
  "slug": "calm-module-2-activites-reference",
  "sourcePath": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/_incoming/calm module 2 activites reference",
  "inputKind": "text-html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module-2-activites-reference/workspace/index.html",
  "rawEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-module-2-activites-reference/raw/original.html",
  "createdAt": "2026-03-05T13:30:01.013Z",
  "updatedAt": "2026-03-05T13:30:01.076Z"
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
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/_incoming/calm module 2 activites reference

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

> import-log.md: missing

## Pattern Matches

### calm-module (auto, score 18)
- Shared sections: none
- Shared style tokens: emerald-500, rose-500, rose-600, rounded-2xl, rounded-lg, rounded-xl
- Shared keywords: none

### calmmodule2 (auto, score 12)
- Shared sections: none
- Shared style tokens: rounded-2xl, rounded-xl, slate-50, slate-700
- Shared keywords: none

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
