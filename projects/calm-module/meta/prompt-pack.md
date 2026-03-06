# Prompt Pack

- Project: calm-module
- Generated: 2026-03-06T02:06:47.517Z

## Rules

- Work in repo-approved zones (`app/studio`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Retrieval order: prompt-pack -> local pattern bank matches -> references/extracted.
- Finish only after typecheck/build and task-specific verification pass.

## Project Manifest

```json
{
  "id": "cb6efd51-9046-430f-a9e1-0f8fd3fd6621",
  "slug": "calm-module",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\canvas code and references\\CALM MODULE .HTML",
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
  "learningUpdatedAt": "2026-03-06T02:06:47.292Z",
  "createdAt": "2026-03-06T02:06:47.139Z",
  "updatedAt": "2026-03-06T02:06:47.292Z"
}
```

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

> import-log.md: missing

## Global Memory

### Approved style direction from calm-module
- Kind: style
- Confidence: high
- Reinforcement: 1
- Projects: calm-module
- Top reasons: Style overlap (+402); Keyword overlap (+138)
- Keywords: action, addiction, addictions, addictive, after, alcohol, alone, amazing, analysis, answers, back, calm
- Style tokens: amber-100, amber-200, amber-300, amber-400, amber-50, amber-500, amber-600, amber-700, amber-800, amber-900, blue-100, blue-200
- Dependencies: none
- Reference kinds: none

### Reusable sections and components from calm-module
- Kind: component
- Confidence: high
- Reinforcement: 1
- Projects: calm-module
- Top reasons: Keyword overlap (+138); Section overlap (+84)
- Keywords: action, addiction, addictions, addictive, after, alcohol, alone, amazing, analysis, answers, back, calm
- Style tokens: none
- Dependencies: none
- Reference kinds: none

### Approved style direction from calmmodule2
- Kind: style
- Confidence: high
- Reinforcement: 5
- Projects: calmmodule2
- Top reasons: Style overlap (+183); Keyword overlap (+12)
- Keywords: amanda, analysis, assignment, auto, budget, budgeting, calm, case, checklist, communication, completion, conflict
- Style tokens: amber-100, amber-200, amber-400, amber-50, amber-500, amber-600, amber-700, amber-800, amber-900, blue-100, blue-400, blue-50
- Dependencies: none
- Reference kinds: none

### Runtime and tool choices from calm-module
- Kind: tool
- Confidence: high
- Reinforcement: 1
- Projects: calm-module
- Top reasons: Keyword overlap (+138); Dependency overlap (+42)
- Keywords: action, addiction, addictions, addictive, after, alcohol, alone, amazing, analysis, answers, back, calm
- Style tokens: none
- Dependencies: https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js, https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>, https://cdn.tailwindcss.com, https://cdn.tailwindcss.com"></script>, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">, https://unpkg.com/@babel/standalone/babel.min.js, https://unpkg.com/@babel/standalone/babel.min.js"></script>, https://unpkg.com/react-dom@18/umd/react-dom.development.js, https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>, https://unpkg.com/react@18/umd/react.development.js, https://unpkg.com/react@18/umd/react.development.js"></script>, https://www.youtube.com/embed/yRUAzGQ3nSY?rel=0, https://www.youtube.com/embed/yRUAzGQ3nSY?rel=0"
- Reference kinds: none

### Approved style direction from calm-module-2-activites-reference
- Kind: style
- Confidence: high
- Reinforcement: 1
- Projects: calm-module-2-activites-reference
- Top reasons: Style overlap (+162); Keyword overlap (+14)
- Keywords: active, activebudgettab, adindex, advertising, analyzer, apply, bottom, boundary, budget, builder, calm, choice
- Style tokens: amber-100, amber-200, amber-400, amber-50, amber-800, amber-900, blue-100, blue-200, blue-400, blue-50, blue-500, blue-600
- Dependencies: none
- Reference kinds: none

## Pattern Matches

none

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
