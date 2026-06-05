# Prompt Pack

- Project: finlit101-money-basics
- Generated: 2026-06-05T14:45:42.338Z

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

- Mode: off
- Policy source: env-override
- Collect pattern bank: off
- Collect memory ledger: off
- Apply pattern bank to prompt pack: off
- Apply memory ledger to prompt pack: off
- Apply memory ledger to recommendations: off

## Selected Benchmark

none

## Project Manifest

```json
{
  "id": "finlit101-money-basics",
  "slug": "finlit101-money-basics",
  "sourcePath": "/Users/deanguedo/Downloads/stitch_extracted_text_from_https_finlit101.ca_en_topic_money_basics.zip",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "workspace"
  ],
  "workspaceEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/finlit101-money-basics/workspace/index.html",
  "rawEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/finlit101-money-basics/raw/original.html",
  "migrationState": "migrated",
  "projectType": "generated-course",
  "preferredWorkflows": [
    "generated-course"
  ],
  "canonicalEntry": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/finlit101-money-basics/workspace/index.html",
  "canonicalSources": [
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/finlit101-money-basics/workspace/index.html",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/finlit101-money-basics/meta/prompt-pack.md"
  ],
  "authoringStatus": "active",
  "exportTargets": [
    {
      "target": "html",
      "enabled": true,
      "notes": "Standalone editable course-page HTML for setting the first Financial Literacy 101 issue standard."
    }
  ],
  "generatedOutputs": [],
  "injectedComponents": [],
  "referenceOnly": [
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/finlit101-money-basics/raw/original.html",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/incoming/finlit101-money-basics/code.html",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/incoming/finlit101-money-basics/screen.png",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/incoming/finlit101-money-basics/DESIGN.md"
  ],
  "sourceOfTruthNotes": "Edit workspace/index.html as the canonical course-page surface. The incoming zip extraction is provenance only. Use meta/prompt-pack.md for the imported visual and brand standard while expanding this first issue before scaling to additional Financial Literacy 101 topics.",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-06-05T14:45:42.337Z",
  "createdAt": "2026-06-04T00:00:00.000Z",
  "updatedAt": "2026-06-05T14:45:42.337Z",
  "workspaceApprovedAt": "2026-06-05T14:40:53.709Z"
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
> Next: `npm run d2l-map -- --project finlit101-money-basics`

## Course Blueprint Summary

No blueprint units were generated.

## Assessment Map Summary

No assessment entries were generated.

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

> section-map.json: missing

## Style Guide

> style-guide.md: missing

## Content Outline

> content-outline.md: missing

## Import Log

> import-log.md: missing

## Global Memory

disabled by intelligence policy (off)

## Pattern Matches

disabled by intelligence policy (off)

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
