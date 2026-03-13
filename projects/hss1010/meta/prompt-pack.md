# Prompt Pack

- Project: hss1010
- Generated: 2026-03-12T19:38:10.623Z

## Rules

- Work in repo-approved zones (`app/studio`, `app/server`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Retrieval order: prompt-pack -> course blueprint -> assessment map -> lesson packets -> targeted resource chunks -> pattern matches if enabled.
- Finish only after typecheck/build and task-specific verification pass.

## Intelligence Policy

- Mode: collect
- Policy source: repo-default
- Collect pattern bank: on
- Collect memory ledger: on
- Apply pattern bank to prompt pack: off
- Apply memory ledger to prompt pack: off
- Apply memory ledger to recommendations: off

## Project Manifest

```json
{
  "id": "852b8632-b6fa-4f37-a7f8-78c1a8b996da",
  "slug": "hss1010",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\hss1010\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\hss1010\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\hss1010\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-12T19:38:10.569Z",
  "createdAt": "2026-03-12T19:28:57.168Z",
  "updatedAt": "2026-03-12T19:38:10.569Z",
  "workspaceApprovedAt": "2026-03-12T19:38:10.569Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: assessment: 1.

## Resource Catalog Summary

### HSS 1010 | Health Services Foundations 0 Black Gold Outreach School - Black Gold Regional Schools (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\hss1010\Health Services Foundations.pdf
- Extraction: indexed via native
- Chunks: 66
- Signals: text:objectives, text:outcomes, text:assessment, text:assignment-booklet, text:section-heading

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project hss1010`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project hss1010`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project hss1010`

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
- External dependencies preserved: https://cdn.tailwindcss.com, https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&amp;family=JetBrains+Mono:wght@500;700&amp;display=swap, https://drive.google.com/file/d/13YKR-wgOxlx_PLzIYfDd9H36NsfHVQeD/view?usp=sharing, https://drive.google.com/file/d/13YKR-wgOxlx_PLzIYfDd9H36NsfHVQeD/preview, https://goo.gl/vqoINQ, https://aidsinfo.nih.gov/, https://goo.gl/64zqgL, http://www.cdc.gov/hepatitis

## Visual Signals
- Tailwind-style color tokens: blue-500, slate-400, slate-900, slate-700, blue-600, slate-800, blue-400, emerald-500, slate-300, emerald-400
- Hex colors: #020617, #e2e8f0, #0f172a, #475569, #64748b, #3b82f6, #10b981, #ef4444, #334155, #cbd5e1
- Repeated shape tokens: rounded-xl, rounded-lg, rounded, rounded-2xl
- Motion and interaction tokens: transition-all, hover:text-white, hover:bg-slate-700, transition-colors, transition-opacity, hover:bg-blue-500, hover:underline, hover:bg-slate-600, hover:bg-emerald-600, hover:scale-105

## Interaction Notes
- Uses localStorage for persistence.
- Embeds iframe-based media or content.
- Reads local uploads with FileReader.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
```

## Content Outline

```md
# Content Outline

- Project: hss1010
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\HSS1010

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-03-12T19:28:57.168Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\HSS1010

## Actions
- Detected "HSS101.HTML" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Externalized 1 inline style block(s) to workspace/styles.css.
- Externalized 2 inline script block(s) to workspace/main.js.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\hss1010.json).
- Updated local pattern bank (21 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\meta\prompt-pack.md).

## Warnings
- None.
```

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### health-services-foundations-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\hss1010\Health Services Foundations.pdf

```text
HSS 1010 | Health Services Foundations 0

Black Gold Outreach School - Black Gold Regional Schools
HSS
1010
HEALTH SERVICES FOUNDATIONS
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
