# Prompt Pack

- Project: calm-module-4-stage
- Generated: 2026-04-17T20:08:48.254Z

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
  "id": "eab0bb66-587c-42a8-92d3-a4610b64ae59",
  "slug": "calm-module-4-stage",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\calm-module-4-stage\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm-module-4-stage\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm-module-4-stage\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-04-17T20:08:48.180Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm-module-4-stage\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm-module-4-stage\\workspace\\index.html"
  ],
  "generatedOutputs": [],
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\incoming\\calm-module-4-stage",
    "importedAt": "2026-04-09T19:29:10.485Z"
  },
  "exportTargets": [
    {
      "target": "brightspace",
      "enabled": true,
      "notes": "Default export target for imported projects."
    }
  ],
  "authoringStatus": "active",
  "referenceOnly": [],
  "sourceOfTruthNotes": "Edit workspace sources listed in canonicalSources. Treat generated exports and runtime bundles as derived output.",
  "createdAt": "2026-04-09T19:29:10.485Z",
  "updatedAt": "2026-04-17T20:08:48.180Z",
  "workspaceApprovedAt": "2026-04-17T20:08:48.180Z"
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



## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project calm-module-4-stage`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project calm-module-4-stage`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project calm-module-4-stage`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project calm-module-4-stage`

## Anti-Summary Generation Rules

- Build from outline authority plus assessment demand, not from whole-book excerpts.
- Never generate a lesson that lacks outcomes, linked assessments, misconceptions, guided practice, independent practice, and readiness evidence.
- A lesson is a failure if it reads like chapter notes, only defines terms, or cites broad source blobs instead of targeted lesson evidence.
- Prefer lesson-packet-scoped references and page/section locators over raw document dumps.
- Use textbook or reference sources only to support a specific outcome and assessment demand.

## Sections List

- Field -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4-stage\workspace\main.js
- Activity -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4-stage\workspace\main.js
- Main -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4-stage\workspace\main.js
- App -> C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4-stage\workspace\main.js

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://fonts.googleapis.com, https://fonts.gstatic.com, https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap

## Visual Signals
- No Tailwind color tokens detected.
- Hex colors: #020617, #e2e8f0, #94a3b8, #f8fafc, #8b5cf6, #38bdf8, #22c55e, #0f172a, #dbeafe, #cbd5e1
- No repeated rounded-corner tokens detected.
- Motion and interaction tokens: transition

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

- Project: calm-module-4-stage
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\calm-module-4-stage

## Sections
- Field (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4-stage\workspace\main.js)
- Activity (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4-stage\workspace\main.js)
- Main (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4-stage\workspace\main.js)
- App (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4-stage\workspace\main.js)
```

## Import Log

```md
# Import Log

- Generated: 2026-04-09T19:29:10.485Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\calm-module-4-stage

## Actions
- Detected "index.html" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Copied 3 local asset reference(s) into the raw project copy.
- Copied 3 local asset reference(s) into the workspace.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\calm-module-4-stage.json).
- Updated local pattern bank (26 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4-stage\meta\prompt-pack.md).

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
