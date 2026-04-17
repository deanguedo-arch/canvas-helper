# Prompt Pack

- Project: general-psychology-20-independent-studies-202633108
- Generated: 2026-04-17T20:08:56.627Z

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
- Retrieval order: prompt-pack -> d2l course map -> course blueprint -> assessment map -> lesson packets -> targeted resource chunks -> pattern matches if enabled.
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
  "id": "c13d30c7-8def-414f-8a3c-6c1a5c5e7382",
  "slug": "general-psychology-20-independent-studies-202633108",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\general-psychology-20-independent-studies-202633108\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-04-17T20:08:56.560Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\index.html",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\main.js",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\assessment-delivery.js",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\meta\\build-shell-from-manifest.ps1"
  ],
  "generatedOutputs": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\course-shell-data.js",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\meta\\d2l-course-map.json",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\meta\\d2l-course-map.md"
  ],
  "regenerateCommand": "powershell -ExecutionPolicy Bypass -File projects/general-psychology-20-independent-studies-202633108/meta/build-shell-from-manifest.ps1",
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\incoming\\general-psychology-20-independent-studies-202633108",
    "importedAt": "2026-04-09T19:29:15.518Z"
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
  "sourceOfTruthNotes": "Use the deployed-era manifest-backed shell in workspace/index.html and workspace/main.js as the editable runtime. Regenerate course-shell-data.js and D2L map artifacts from meta/build-shell-from-manifest.ps1. Do not replace this project with the generic build:course-shell output unless intentionally rebuilding the course structure.",
  "createdAt": "2026-04-09T19:29:15.518Z",
  "updatedAt": "2026-04-17T20:08:56.560Z",
  "workspaceApprovedAt": "2026-04-17T20:08:56.560Z"
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

- Course title: NXT General Psychology 20 - Independent Studies (3 Cr) (Sep 2020)
- Modules: 11
- Items: 272
- Lessons: 1
- Assignments: 8
- Quizzes: 24
- PDFs: 1
- HTML pages: 210
Top modules:
- Course Information (1 direct item)
- Student Resource Materials (0 direct items)
- Module 1: History of Psychological Schools of Thought (10 direct items)
- 2. Principles of Learning (10 direct items)
- 3. The Process of Learning (8 direct items)
- 4. The Process of Thinking (5 direct items)
- 5. Facing Frustration and Conflict (7 direct items)
- 6. Adolescents (4 direct items)

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project general-psychology-20-independent-studies-202633108`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project general-psychology-20-independent-studies-202633108`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project general-psychology-20-independent-studies-202633108`

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
- External dependencies preserved: http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd

## Visual Signals
- No Tailwind color tokens detected.
- No inline hex colors detected.
- No repeated rounded-corner tokens detected.
- No significant motion tokens detected.

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

- Project: general-psychology-20-independent-studies-202633108
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\general-psychology-20-independent-studies-202633108

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-04-09T19:29:15.518Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\general-psychology-20-independent-studies-202633108

## Actions
- Detected "сontent/i37d38325-acb2-49d0-8dc9-549f69b1f9d2/Content/section_3878.html" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Copied 370 supporting file(s) into projects/resources/general-psychology-20-independent-studies-202633108/.
- Indexed the imported supporting material into projects/resources/general-psychology-20-independent-studies-202633108/_extracted/.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\general-psychology-20-independent-studies-202633108.json).
- Updated local pattern bank (28 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\meta\prompt-pack.md).

## Warnings
- Found 210 possible site files. Using "сontent/i37d38325-acb2-49d0-8dc9-549f69b1f9d2/Content/section_3878.html" and treating the rest as supporting material.
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
