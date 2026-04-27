# Prompt Pack

- Project: sportswellness
- Generated: 2026-04-24T15:04:06.900Z

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

- Subagent mode: on
- Use subagent rules automatically; ask for approval before widening scope.

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
  "id": "01921b03-e8a2-4d76-b71b-7fbb5a22005b",
  "slug": "sportswellness",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\sportswellness\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\sportswellness\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\sportswellness\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-04-17T20:09:27.795Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\sportswellness\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\sportswellness\\workspace\\index.html"
  ],
  "generatedOutputs": [],
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\sportswellness\\source",
    "importedAt": "2026-04-14T15:24:04.645Z"
  },
  "exportTargets": [
    {
      "target": "brightspace",
      "enabled": true,
      "notes": "Default export target for imported projects."
    },
    {
      "target": "google-hosted",
      "enabled": true,
      "notes": "Firebase-hosted delivery with Google sign-in, autosave, and cross-device resume."
    },
    {
      "target": "apps-script",
      "enabled": true,
      "notes": "Drive-backed Apps Script web app with Google Drive assets and Apps Script autosave."
    }
  ],
  "authoringStatus": "active",
  "referenceOnly": [],
  "googleHosted": {
    "trackedStorageKeys": [
      "sportswellness.course-progress.v1",
      "sportswellness.ui-state.v1",
      "sportswellness.sidebarCollapsed",
      "diag_data",
      "sportswellness_phase1_assignment_v2",
      "vb_data",
      "mb_data",
      "p3_data",
      "p4a_data",
      "athlete_visualization_master_v1"
    ]
  },
  "sourceOfTruthNotes": "Edit workspace sources listed in canonicalSources. Treat generated exports and runtime bundles as derived output.",
  "createdAt": "2026-04-14T15:24:04.645Z",
  "updatedAt": "2026-04-23T21:17:49.179Z",
  "workspaceApprovedAt": "2026-04-23T21:17:49.179Z"
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
> Next: `npm run d2l-map -- --project sportswellness`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project sportswellness`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project sportswellness`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project sportswellness`

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

- Project: sportswellness
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\processed\sportswellness\source

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-04-14T15:24:04.645Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\processed\sportswellness\source

## Actions
- Copied the source HTML into raw/original.html without modifying it.
- Copied 2 local asset reference(s) into the raw project copy.
- Copied 2 local asset reference(s) into the workspace.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\sportswellness.json).
- Updated local pattern bank (31 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\meta\prompt-pack.md).

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
