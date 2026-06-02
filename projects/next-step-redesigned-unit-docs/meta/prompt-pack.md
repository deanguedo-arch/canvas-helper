# Prompt Pack

- Project: next-step-redesigned-unit-docs
- Generated: 2026-06-02T16:35:55.223Z

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
  "id": "aa88635c-5cb8-416a-8a55-2744a1647873",
  "slug": "next-step-redesigned-unit-docs",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\incoming\\next-step-redesigned-unit-docs",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\next-step-redesigned-unit-docs\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\next-step-redesigned-unit-docs\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-06-02T16:35:54.988Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\next-step-redesigned-unit-docs\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\next-step-redesigned-unit-docs\\workspace\\index.html",
    "main.jsx",
    "styles.css"
  ],
  "generatedOutputs": [],
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\incoming\\next-step-redesigned-unit-docs",
    "importedAt": "2026-06-02T16:35:54.674Z"
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
  "createdAt": "2026-06-02T16:35:54.674Z",
  "updatedAt": "2026-06-02T16:35:54.988Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: textbook: 4.

## Resource Catalog Summary

### Unit 1: Properties of Matter Chemical Storage and Disposal (textbook)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\next-step-redesigned-unit-docs\01 - Unit 1 Properties of Matter - Next Step Redesigned.docx
- Extraction: indexed via native
- Chunks: 28
- Signals: filename:unit, text:lesson-heading, text:what-is

### Unit 2: Energy Transfer Technologies Thermal Energy, Heat, and Temperature (textbook)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\next-step-redesigned-unit-docs\02 - Unit 2 Energy Transfer Technologies - Next Step Redesigned.docx
- Extraction: indexed via native
- Chunks: 18
- Signals: filename:unit, text:lesson-heading, text:what-is

### Unit 3: Matter and Energy in Living Systems Digestion, Circulation, and Healthy Living (textbook)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\next-step-redesigned-unit-docs\03 - Unit 3 Matter and Energy in Living Systems - Next Step Redesigned.docx
- Extraction: indexed via native
- Chunks: 13
- Signals: text:assessment, filename:unit, text:lesson-heading

### Unit 4: Matter and Energy in the Environment The Cycling of Matter in the Biosphere (textbook)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\next-step-redesigned-unit-docs\04 - Unit 4 Matter and Energy in the Environment - Next Step Redesigned.docx
- Extraction: indexed via native
- Chunks: 10
- Signals: filename:unit, text:lesson-heading, text:what-is

## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project next-step-redesigned-unit-docs`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project next-step-redesigned-unit-docs`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project next-step-redesigned-unit-docs`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project next-step-redesigned-unit-docs`

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
- External dependencies preserved: https://cdn.tailwindcss.com, https://fonts.googleapis.com, https://fonts.gstatic.com, https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&amp;display=swap, https://unpkg.com/react@18/umd/react.development.js, https://unpkg.com/react-dom@18/umd/react-dom.development.js, https://unpkg.com/@babel/standalone/babel.min.js

## Visual Signals
- Tailwind-style color tokens: slate-950, slate-50, indigo-500, indigo-100, slate-200, slate-900, slate-300
- No inline hex colors detected.
- Repeated shape tokens: rounded-[2rem, rounded-full, rounded-2xl
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

- Project: next-step-redesigned-unit-docs
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\next-step-redesigned-unit-docs

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

### 01-unit-1-properties-of-matter-next-step-redesigned-docx (docx/textbook)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\next-step-redesigned-unit-docs\01 - Unit 1 Properties of Matter - Next Step Redesigned.docx

```text
Please use the information from the lesson to complete the guided notes right in the Google Doc. You have your own copy of notes for each lesson.

Chemical Storage and Disposal

We are going to start off the course by exploring safety around household and workplace chemicals. Even though household chemicals are available to buy in stores and we often keep them around the house, they still pose many dangers. Many workplaces also require the use of chemicals, so it is important to know the basics to handle them safely.

1. When using chemicals, you should always keep the following questions in mind:

Does the substance have special handling or storage requirements?

How will it react with othe...
```

### 02-unit-2-energy-transfer-technologies-next-step-redesigned-docx (docx/textbook)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\next-step-redesigned-unit-docs\02 - Unit 2 Energy Transfer Technologies - Next Step Redesigned.docx

```text
Please use the information from the lesson to complete the guided notes right in the Google Doc. You have your own copy of notes for each lesson.

Thermal Energy, Heat, and Temperature

Have you ever wondered why a cup of hot coffee cools down on a kitchen counter, or why a metal spoon gets hot when left in a pot of boiling soup? It all comes down to how energy moves.

To understand energy transfer, we first need to know the difference between three very important words: temperature, thermal energy, and heat. People often use these words to mean the same thing, but in science, they are very different!

Particles in Motion

Remember what we learned in Unit 1......... Everything around us is m...
```

### 03-unit-3-matter-and-energy-in-living-systems-next-step-redesigned-docx (docx/textbook)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\next-step-redesigned-unit-docs\03 - Unit 3 Matter and Energy in Living Systems - Next Step Redesigned.docx

```text
Digestion, Circulation, and Healthy Living

Our bodies have many systems that work together to keep us healthy. The digestive and circulatory systems are key to making sure our cells get both nutrients and oxygen to function properly and keep us alive.

The Digestive System: Taking in Matter

The digestive system is how your body takes in food and breaks it into tiny molecules your cells can actually use.

Food is mechanically broken down (chewing, churning in the stomach) and chemically broken down (enzymes and stomach acid).

By the time food reaches the small intestine, nutrients (like glucose, amino acids, vitamins, minerals, and fatty acids) are absorbed into the bloodstream.

This abso...
```

### 04-unit-4-matter-and-energy-in-the-environment-next-step-redesigned-docx (docx/textbook)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\next-step-redesigned-unit-docs\04 - Unit 4 Matter and Energy in the Environment - Next Step Redesigned.docx

```text
The Cycling of Matter in the Biosphere

Let's start by discussing what the biosphere actually is. It is thin layer around planet Earth where life exists. It is made up of the air, water and land that life as we know it survives. Within the biosphere, matter is continually cycled and energy flows through different systems in order to maintain homeostasis (a balance) for all living things to survive.

1. Natural Cycles: Food Chains, Food Webs & Energy Pyramids

All living things need energy to survive. This energy is passed through ecosystems from organism to orgranism. Food chains, food webs and energy pyramids show how that energy is passed along.

Food chains: show a single pathway of energ...
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
