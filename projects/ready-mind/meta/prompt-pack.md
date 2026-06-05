# Prompt Pack

- Project: ready-mind
- Generated: 2026-06-05T15:41:44.961Z

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
  "id": "847d35ca-809b-4540-9f67-b58bd12c9b57",
  "slug": "ready-mind",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\ready-mind\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\ready-mind\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\ready-mind\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "curated",
  "learningUpdatedAt": "2026-06-05T15:41:44.890Z",
  "migrationState": "migrated",
  "projectType": "generated-course",
  "preferredWorkflows": [
    "generated-course"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\ready-mind\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\ready-mind\\workspace\\index.html",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\ready-mind\\workspace\\main.js",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\ready-mind\\workspace\\styles.css",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\ready-mind\\workspace\\assignment-runtime.html",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\ready-mind\\workspace\\assignment-runtime-main.js"
  ],
  "generatedOutputs": [],
  "regenerateCommand": "No generated outputs yet. Edit Ready Mind workspace sources, then run export commands when content is finalized.",
  "injectedComponents": [],
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
      "readymind.course-progress.v1",
      "readymind.ui-state.v1",
      "readymind.sidebarCollapsed",
      "readymind.baseline.v1",
      "readymind.stress-reset-plan.v1",
      "readymind.values-blueprint.v1",
      "readymind.sustainable-routine.v1",
      "readymind.focus-system.v1",
      "readymind.confidence-evidence.v1",
      "readymind.mental-rehearsal.v1"
    ]
  },
  "sourceOfTruthNotes": "Ready Mind canonical editable sources are in projects/ready-mind/workspace. Catalogs are intentionally blank or placeholder-only until source content is finalized.",
  "createdAt": "2026-05-08T19:00:32.888Z",
  "updatedAt": "2026-06-05T15:41:44.890Z",
  "workspaceApprovedAt": "2026-06-05T15:41:44.890Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: other: 5; outline: 1.

## Resource Catalog Summary

### # Ready Mind Course Brief ## Purpose ## Current State (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\ready-mind-course-brief.md
- Extraction: indexed via native
- Chunks: 1
- Signals: none

### # Ready Mind Scenario Library ## Placeholder Scenarios (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\ready-mind-scenario-library.md
- Extraction: indexed via native
- Chunks: 1
- Signals: none

### # Ready Mind Tool Library ## Placeholder Tools - Stress State Simulator: a future activity for noticing activation and choosing a reset. (outline)
- Authority: blueprint-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\ready-mind-tool-library.md
- Extraction: indexed via native
- Chunks: 1
- Signals: text:outcomes

### # Scope And Safety Boundaries ## Scope ## Safety Boundary (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\scope-and-safety-boundaries.md
- Extraction: indexed via native
- Chunks: 1
- Signals: none

### # Source Map ## Shell Source - Structural template: projects/sportswellness/workspace (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\source-map.md
- Extraction: indexed via native
- Chunks: 1
- Signals: none

### # Ready Mind Sport-To-Life Translation Guide ## Translation Rule (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\sport-to-life-translation-guide.md
- Extraction: indexed via native
- Chunks: 1
- Signals: none

## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project ready-mind`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project ready-mind`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project ready-mind`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project ready-mind`

## Anti-Summary Generation Rules

- Build from outline authority plus assessment demand, not from whole-book excerpts.
- Never generate a lesson that lacks outcomes, linked assessments, misconceptions, guided practice, independent practice, and readiness evidence.
- A lesson is a failure if it reads like chapter notes, only defines terms, or cites broad source blobs instead of targeted lesson evidence.
- Prefer lesson-packet-scoped references and page/section locators over raw document dumps.
- Use textbook or reference sources only to support a specific outcome and assessment demand.

## Sections List

> section-map.json: missing

## Style Guide

```md
# Style Guide

## Direction

The Ready Mind uses the Stitch-supplied light glass redesign: airy surface backgrounds, translucent panels, teal primary actions, sky blue and amber module accents, and restrained soft rose warning states.

Primary shell styling should feel premium, calm, and capable rather than clinical. Use Inter for readable interface text and Rajdhani for compact display headings.

## Constraints

- Avoid clinical wellness styling.
- Avoid sport, athlete, competition, and grind language unless explicitly reintroduced by approved source content.
- Preserve the sportswellness shell mechanics while neutralizing old content catalogs.
- Do not import the Stitch Tailwind prototype into the shell. Translate its visual system into the canonical Ready Mind CSS and keep export-safe static assets.
```

## Content Outline

```md
# Content Outline

- Project: ready-mind
- Status: blank styled shell

## Modules

- 00 Diagnostic: What Is Mental Readiness?
- 01 The Ready State
- 02 Sustainable Discipline
- 03 Focused Action
- 04 Confidence Before the Moment

Full lesson content is intentionally out of scope for this shell pass.
```

## Import Log

> import-log.md: missing

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### meta-ready-mind-tool-library-md (md/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\ready-mind-tool-library.md

```text
# Ready Mind Tool Library

## Placeholder Tools

- Stress State Simulator: a future activity for noticing activation and choosing a reset.
- Focus Reset Simulator: a future activity for interruption, refocus, and next action.

Tools remain placeholders until lesson outcomes are finalized.
```

### meta-ready-mind-course-brief-md (md/other)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\ready-mind-course-brief.md

```text
# Ready Mind Course Brief

## Purpose

The Ready Mind is a life-performance course shell for practical tools around stress, focus, confidence, and sustainable effort.

## Current State

This is a placeholder shell. Lesson content, quizzes, performance tools, and videos are not finalized yet.
```

### meta-ready-mind-scenario-library-md (md/other)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\ready-mind-scenario-library.md

```text
# Ready Mind Scenario Library

## Placeholder Scenarios

- Stress before a test, presentation, meeting, or hard conversation.
- Focus recovery after distraction, overthinking, or a missed step.
- Confidence before an evaluated moment.
- Recovery after fatigue, overload, or discouragement.
```

### meta-sport-to-life-translation-guide-md (md/other)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\sport-to-life-translation-guide.md

```text
# Ready Mind Sport-To-Life Translation Guide

## Translation Rule

Use the old shell pattern only as structure. Translate pressure-performance ideas into everyday school, work, relationship, and personal-responsibility situations.

## Boundary

Do not carry over athlete, competition, team, or sport examples unless a later source list deliberately approves them.
```

### meta-scope-and-safety-boundaries-md (md/other)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\scope-and-safety-boundaries.md

```text
# Scope And Safety Boundaries

## Scope

Ready Mind teaches practical self-management skills for everyday stress, focus, confidence, recovery, and preparation.

## Safety Boundary

This course is educational and skills-based. It must not present itself as therapy, diagnosis, medical treatment, crisis support, or a replacement for professional care.
```

### meta-source-map-md (md/other)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\ready-mind\meta\source-map.md

```text
# Source Map

## Shell Source

- Structural template: projects/sportswellness/workspace
- Ready Mind canonical shell: projects/ready-mind/workspace

## Content Source Status

Lesson, quiz, video, and activity sources are placeholders. Add approved source entries here before writing full lesson content.
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
