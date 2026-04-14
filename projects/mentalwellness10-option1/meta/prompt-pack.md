# Prompt Pack

- Project: mentalwellness10-option1
- Generated: 2026-04-14T15:24:05.454Z

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
  "id": "2c0a0da1-73ca-4de3-8a27-4a4878cac9f7",
  "slug": "mentalwellness10-option1",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\mentalwellness10\\workspace\\index.html",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\mentalwellness10-option1\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\mentalwellness10-option1\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-04-14T15:24:04.875Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\mentalwellness10-option1\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\mentalwellness10-option1\\workspace\\index.html"
  ],
  "generatedOutputs": [],
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\mentalwellness10\\workspace\\index.html",
    "importedAt": "2026-04-14T15:24:04.628Z"
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
  "createdAt": "2026-04-14T15:24:04.628Z",
  "updatedAt": "2026-04-14T15:24:04.875Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: none.

## Resource Catalog Summary

> resource-catalog.json: missing
> Next: `npm run refs -- --project mentalwellness10-option1`

## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project mentalwellness10-option1`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project mentalwellness10-option1`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project mentalwellness10-option1`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project mentalwellness10-option1`

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
- External dependencies preserved: https://cdn.tailwindcss.com, https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,700;1,400;1,900&amp;family=JetBrains+Mono:wght@700&amp;display=swap, http://www.w3.org/2000/svg, https://drive.google.com/file/d/1my_sOJYdOLcvvQi4TQdkDJNUz6P7MvYY/preview, https://drive.google.com/file/d/1my_sOJYdOLcvvQi4TQdkDJNUz6P7MvYY/view?usp=sharing, https://drive.google.com/file/d/1DQvItijEudKroqUieRBKaJAqJJnzEa2x/preview, https://drive.google.com/file/d/1DQvItijEudKroqUieRBKaJAqJJnzEa2x/view?usp=sharing, https://drive.google.com/file/d/1XWwy8F27_0jupo8xdXO3oi2E4l9R4Rot/preview

## Visual Signals
- Tailwind-style color tokens: slate-800, sky-500, slate-500, slate-600, rose-500, amber-500, emerald-500, indigo-500, slate-900, slate-400
- Hex colors: #f59e0b, #a855f7, #10b981, #020617, #e2e8f0, #0f172a, #1e293b, #0ea5e9, #64748b, #38bdf8
- Repeated shape tokens: rounded-full, rounded-xl, rounded-lg, rounded-2xl, rounded-l, rounded-r, rounded-3xl, rounded
- Motion and interaction tokens: hover:text-white, hover:bg-slate-700, transition-all, hover:bg-sky-500, hover:bg-rose-500, hover:bg-amber-500, hover:bg-emerald-500, hover:bg-emerald-600, transition-colors, hover:bg-sky-400

## Interaction Notes
- Uses localStorage for persistence.
- Embeds iframe-based media or content.
- Reads local uploads with FileReader.
- Includes print-specific Tailwind utility styling.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
```

## Content Outline

```md
# Content Outline

- Project: mentalwellness10-option1
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10\workspace\index.html

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

> import-log.md: missing

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
