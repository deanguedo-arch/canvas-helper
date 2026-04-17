# Prompt Pack

- Project: calm-life-adventure
- Generated: 2026-04-17T20:08:47.648Z

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
  "id": "7ba88adc-c72f-42ba-9035-41a6fffc37ad",
  "slug": "calm-life-adventure",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\calm-life-adventure\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/index.html",
  "rawEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/raw/original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-04-17T20:08:47.495Z",
  "migrationState": "migrated",
  "projectType": "generated-course",
  "preferredWorkflows": [
    "generated-course"
  ],
  "canonicalEntry": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/index.html",
  "canonicalSources": [
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/index.html",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-view-assets.py",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-pic-assets.py"
  ],
  "generatedOutputs": [
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-10",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-11",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-14",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-15",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-16",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-21",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-22",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-31",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/views/vBartender",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/views/vBarGreaser",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/views/vEgo",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/views/vReceptionist"
  ],
  "regenerateCommand": "python3 projects/calm-life-adventure/meta/extract-agi-view-assets.py --view 0 --view 49 --view 54 --view 166 && python3 projects/calm-life-adventure/meta/extract-agi-pic-assets.py --pic 10 --pic 11 --pic 14 --pic 15 --pic 16 --pic 21 --pic 22 --pic 31",
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "manual",
    "sourcePath": "/Users/deanguedo/Documents/GitHub/canvas-helper/docs/plans/calm-life-game.md",
    "notes": "Standalone adventure prototype created directly in Canvas Helper from the CALM life-sim planning pass."
  },
  "exportTargets": [
    {
      "target": "google-hosted",
      "enabled": false,
      "notes": "Enable after a Firebase Hosting site is created for calm-life-adventure."
    }
  ],
  "authoringStatus": "active",
  "referenceOnly": [],
  "sourceOfTruthNotes": "Treat workspace/index.html, workspace/main.js, workspace/styles.css, and the AGI extraction scripts as canonical. Regenerate the checked-in SVG PIC/VIEW assets from the extracted LSL source bundle instead of hand-editing them.",
  "createdAt": "2026-03-29T01:20:00.000Z",
  "updatedAt": "2026-04-17T20:08:47.495Z",
  "workspaceApprovedAt": "2026-04-17T20:08:47.495Z"
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
> Next: `npm run d2l-map -- --project calm-life-adventure`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project calm-life-adventure`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project calm-life-adventure`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project calm-life-adventure`

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
