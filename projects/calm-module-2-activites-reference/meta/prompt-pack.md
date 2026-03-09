# Prompt Pack

- Project: calm-module-2-activites-reference
- Generated: 2026-03-09T21:37:52.511Z

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
  "id": "e3de5d41-f060-42d8-8608-ebad84c5620c",
  "slug": "calm-module-2-activites-reference",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\calm-module-2-activites-reference\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm-module-2-activites-reference\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\calm-module-2-activites-reference\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-09T21:37:52.455Z",
  "createdAt": "2026-03-09T21:37:52.321Z",
  "updatedAt": "2026-03-09T21:37:52.455Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: textbook: 1.

## Resource Catalog Summary

### <!DOCTYPE html> <html lang="en"> <head> (textbook)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\calm-module-2-activites-reference\original-source.txt
- Extraction: indexed via native
- Chunks: 49
- Signals: text:what-is

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project calm-module-2-activites-reference`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project calm-module-2-activites-reference`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project calm-module-2-activites-reference`

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
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\processed\calm-module-2-activites-reference\source

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

### original-source-txt (txt/textbook)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\calm-module-2-activites-reference\original-source.txt

```text
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CALM Module 2: Resource Choices</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.m...
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
