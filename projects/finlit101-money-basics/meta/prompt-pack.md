# Prompt Pack

- Project: finlit101-money-basics
- Generated: 2026-06-05T15:41:41.571Z

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
  "id": "78d59b43-a5cf-4c1b-8479-16a1fe906cb3",
  "slug": "finlit101-money-basics",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\finlit101-money-basics\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\finlit101-money-basics\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\finlit101-money-basics\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-06-05T15:41:41.482Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\finlit101-money-basics\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\finlit101-money-basics\\workspace\\index.html",
    "main.js",
    "styles.css"
  ],
  "generatedOutputs": [],
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\incoming\\finlit101-money-basics",
    "importedAt": "2026-06-05T15:41:29.848Z"
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
  "createdAt": "2026-06-05T15:41:29.848Z",
  "updatedAt": "2026-06-05T15:41:41.482Z",
  "workspaceApprovedAt": "2026-06-05T15:41:41.482Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: other: 2.

## Resource Catalog Summary

### name: Academic Precision colors: surface: '#f8f9fa' (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\finlit101-money-basics\DESIGN.md
- Extraction: indexed via native
- Chunks: 5
- Signals: none

### screen (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\finlit101-money-basics\screen.png
- Extraction: stored-only
- Chunks: 0
- Signals: none

## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project finlit101-money-basics`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project finlit101-money-basics`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project finlit101-money-basics`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project finlit101-money-basics`

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
- External dependencies preserved: https://cdn.tailwindcss.com?plugins=forms,container-queries, https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800&amp;family=IBM+Plex+Sans:wght@600&amp;family=Work+Sans:wght@400;600&amp;display=swap, https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap, https://lh3.googleusercontent.com/aida-public/AB6AXuAQVO7T55Vcbvu7l1Y-Pq2LG5DHe0HoIXbH6uFUj4X-gSBWUI708z4_N9h1PD7V2Px5M0ETz4ezeXPqthyJDmpW8Mx5wJ4Ov4imQ7M82KVUT_zuP-zeI6RsPMJU7LoZcRG007h1yv7rwxT8Si2gPaxpk0QYWljctY7hRRxsrKGAlzuZJBm2TExKPCMQxrss439kua1Z5jGQ2EuAEtICUgSbvrPnpdqx4_WLzjMj2aI8fPUjVDkhDwL0P0D_gr3aFglhCuu5riObfqkp, https://lh3.googleusercontent.com/aida-public/AB6AXuC32VwimeI-P67qQATHm1i1Ms-Rx8BQJ64vnSzL_oAdgkWC4Rx3d-UqMD4MrCyNrYlA599GiPGqKAcpYsnl-B5Xv1offm6kNEX28hpxz_AluHETerqVPCxMBMODsJLviRjSS-TnH6IpIPL8hd4jZrqH7nLg6OELRmM4lFSpJ8BP_lICoM5FSw9XCWUscvhohqDITB5CuRsDe6YRFZ8DRH--Js1uIXm_-afSlyla4mfcbBUVX9gwpXzUsiLoaQTUoQC5ZLRzV293vB0C

## Visual Signals
- No Tailwind color tokens detected.
- Hex colors: #154212, #F1F3F4, #a1d494, #454749, #131e17, #bdcabe, #edeeef, #93000a, #ba1a1a, #BA1A1A
- Repeated shape tokens: rounded-xl, rounded-full, rounded-2xl, rounded-lg, rounded-r
- Motion and interaction tokens: transition-all, hover:bg-white/5, hover:text-white, hover:bg-black/10, transition-colors, hover:scale-110, transition-transform, hover:opacity-100, transition-opacity, hover:text-primary

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

- Project: finlit101-money-basics
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\finlit101-money-basics

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-06-05T15:41:29.848Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\finlit101-money-basics

## Actions
- Detected "code.html" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Externalized 1 inline style block(s) to workspace/styles.css.
- Externalized 1 inline script block(s) to workspace/main.js.
- Copied 2 supporting file(s) into projects/resources/finlit101-money-basics/.
- Indexed the imported supporting material into projects/resources/finlit101-money-basics/_extracted/.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\finlit101-money-basics.json).
- Updated local pattern bank (41 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\finlit101-money-basics\meta\prompt-pack.md).

## Warnings
- None.
```

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### design-md (md/other)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\finlit101-money-basics\DESIGN.md

```text
---
name: Academic Precision
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#42493e'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#5d5e61'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2...
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
