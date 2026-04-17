# Prompt Pack

- Project: worldreligions30-option2
- Generated: 2026-04-17T14:59:18.326Z

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
  "id": "7c4f87de-5c28-4cb8-96e1-3a13fc9749c1",
  "slug": "worldreligions30-option2",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\canvas code and references\\World Religions",
  "inputKind": "docx-pdf-bundle",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\worldreligions30-option2\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\worldreligions30-option2\\raw\\original.html",
  "migrationState": "migrated",
  "projectType": "generated-course",
  "preferredWorkflows": [
    "generated-course"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\worldreligions30-option2\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\worldreligions30-option2\\workspace\\index.html",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\worldreligions30-option2\\workspace\\main.js",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\worldreligions30-option2\\workspace\\styles.css",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\worldreligions30-option2\\workspace\\course-data.js"
  ],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\canvas code and references\\World Religions",
    "importedAt": "2026-04-15T00:00:00.000Z"
  },
  "exportTargets": [
    {
      "target": "brightspace",
      "enabled": true,
      "notes": "Default export target for imported project shells."
    }
  ],
  "authoringStatus": "active",
  "generatedOutputs": [],
  "injectedComponents": [],
  "referenceOnly": [],
  "sourceOfTruthNotes": "Edit the workspace shell files. Chapter PDFs are local library assets. Quiz content is generated from the booklet DOCX sources into workspace/course-data.js."
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
> Next: `npm run refs -- --project worldreligions30-option2`

## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project worldreligions30-option2`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project worldreligions30-option2`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project worldreligions30-option2`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project worldreligions30-option2`

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
