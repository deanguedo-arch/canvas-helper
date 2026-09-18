# Prompt Pack

- Project: biology30-chapter-17
- Generated: 2026-09-18T02:36:21.122Z

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
- Policy source: cli-override
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
  "id": "2b59456a-351d-4879-82b9-be0a8e9c8bb5",
  "slug": "biology30-chapter-17",
  "sourcePath": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/incoming/biology30-chapters14-20-handoff/biology30-chapter-17-registration.html",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/biology30-chapter-17/workspace/index.html",
  "rawEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/biology30-chapter-17/raw/original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-09-18T02:36:21.121Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/biology30-chapter-17/workspace/index.html",
  "canonicalSources": [
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/biology30-chapter-17/workspace/index.html"
  ],
  "authoring": {
    "driverId": "proposal-only-v1",
    "familyId": "imported-workspace-v1",
    "studioEditing": {
      "enabled": false,
      "renameCourse": false,
      "imageAssets": false
    }
  },
  "generatedOutputs": [],
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/incoming/biology30-chapters14-20-handoff/biology30-chapter-17-registration.html",
    "importedAt": "2026-09-18T02:36:21.118Z"
  },
  "exportTargets": [
    {
      "target": "brightspace",
      "enabled": true,
      "notes": "Default export target for imported projects."
    }
  ],
  "authoringStatus": "blocked",
  "referenceOnly": [],
  "sourceOfTruthNotes": "Imported workspace sources remain reviewable but are not automatically Studio-editable. Onboard explicit ownership, complete learner surfaces, rendered coverage, and a reversible lifecycle before changing authoringStatus to active. Treat generated exports and runtime bundles as derived output.",
  "createdAt": "2026-09-18T02:36:21.118Z",
  "updatedAt": "2026-09-18T02:36:21.121Z"
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
> Next: `npm run refs -- --project biology30-chapter-17`

## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project biology30-chapter-17`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project biology30-chapter-17`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project biology30-chapter-17`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project biology30-chapter-17`

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
- No external runtime dependencies detected in the generated workspace.

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

- Project: biology30-chapter-17
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/incoming/biology30-chapters14-20-handoff/biology30-chapter-17-registration.html

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

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
