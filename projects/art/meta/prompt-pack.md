# Prompt Pack

- Project: art
- Generated: 2026-04-17T20:08:47.466Z

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
  "id": "d2f08857-02e5-4855-b1f9-b91d998be586",
  "slug": "art",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\art\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\art\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\art\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-04-17T20:08:47.288Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\art\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\art\\workspace\\index.html"
  ],
  "generatedOutputs": [],
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\art\\source",
    "importedAt": "2026-04-09T20:34:52.664Z"
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
  "createdAt": "2026-04-09T20:34:52.664Z",
  "updatedAt": "2026-04-17T20:08:47.288Z",
  "workspaceApprovedAt": "2026-04-17T20:08:47.288Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: other: 50; textbook: 24; assessment: 12; outline: 2.

## Resource Catalog Summary

### Lesson 1: What Is Art? Visual Language & Purpose What You Are Learning (textbook)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000002\ccres0000002.html
- Extraction: indexed via native
- Chunks: 1
- Signals: filename:lesson, text:lesson-heading, text:what-is

### Using the video below as a guideline - create a pop art image that has some 3D qualitaties (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000003\ccres0000003.html
- Extraction: indexed via native
- Chunks: 1
- Signals: none

### ccres0000004 (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000004\ccres0000004.html
- Extraction: stored-only
- Chunks: 0
- Signals: none

### Everythingyouneedtoknow 69b4604b6d7f1 (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000004\Everythingyouneedtoknow_69b4604b6d7f1.png
- Extraction: stored-only
- Chunks: 0
- Signals: none

### Sketchbook Task — Learning the Visual Language of Art (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000005\ccres0000005.html
- Extraction: indexed via native
- Chunks: 1
- Signals: none

### Use the following video as a guideline for creating a work of pointillism (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000006\ccres0000006.html
- Extraction: indexed via native
- Chunks: 1
- Signals: none

### ccres0000007 (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000007\ccres0000007.html
- Extraction: stored-only
- Chunks: 0
- Signals: none

### Lesson 1: Personal Vision & Artistic Identity In this lesson, you will: (textbook)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000008\ccres0000008.html
- Extraction: indexed via native
- Chunks: 1
- Signals: filename:lesson, text:lesson-heading, text:what-is

## D2L Course Map Summary

- Course title: art
- Modules: 3
- Items: 83
- Lessons: 0
- Assignments: 0
- Quizzes: 0
- PDFs: 0
- HTML pages: 79
Top modules:
- Art 10 (26 direct items)
- Art 20 (17 direct items)
- Art 30 (33 direct items)

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project art`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project art`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project art`

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

- Project: art
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\processed\art\source

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-04-09T20:34:52.664Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\processed\art\source

## Actions
- Detected "original.html" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Copied 1 local asset reference(s) into the raw project copy.
- Copied 1 local asset reference(s) into the workspace.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\art.json).
- Updated local pattern bank (28 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\art\meta\prompt-pack.md).

## Warnings
- None.
```

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### ccres0000011-ccres0000011-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000011\ccres0000011.html

```text
Art 30 Student Course Handbook
Welcome to Art 30
Art 30 is a studio-based, portfolio-driven course focused on helping you develop a personal artistic voice.
This course builds on the skills from Art 10 and Art 20, but at this level you are expected to work with greater independence, intention, and critical thinking.
You will explore drawing, composition, and artistic context while creating a body of work that reflects who you are, what you care about, and how you choose to communicate visually.
What Is Art 30 Really About?
Art 30 is not about making "perfect" artwork.
It is about:
Developing a recognizable personal style
Making intentional choices about materials, techniques, and subject mat...
```

### ccres0000033-ccres0000033-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000033\ccres0000033.html

```text
Emotional Colour Brainstorm
Create a page exploring emotions using colour only:
No objects
No symbols
No words (optional notes allowed)
Focus on how colours interact
Limited Palette Studies
Choose one emotion or idea.
Create 1-2 small studies using:
Only 2–3 colours
Value shifts within those colours
Notice how small changes affect mood.
Symbolic Colour Sketch
Choose a simple symbol or object.
Draw it three times, changing only the colour scheme.
Ask:
How does the meaning change?
Which colour choice feels most intentional?
Artist Influence Colour Studies
Create one small colour study inspired by one of the artists:
Riopelle: energy and movement
Monkman: dramatic contrast and symbolism
Rothko:...
```

### ccres0000043-ccres0000043-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000043\ccres0000043.html

```text
Ethical Considerations
When working with social or cultural issues:
Avoid stereotypes
Do not speak for groups you do not belong to
Focus on awareness, questioning, or response
Choose symbols carefully and respectfully
You are responsible for your visual choices.
Sketchbook
Issue Brainstorm
Create a page exploring issues you care about:
Local, national, or global
Social, cultural, or political
Issues that affect you or your community
You are not required to choose controversial topics — relevance matters more than shock.
Concept Development
Choose one issue.
Create multiple concept sketches using:
SymbolsMetaphorsVisual contrast
Avoid literal scenes or illustrations.
Text + Image Experiments
...
```

### ccres0000019-ccres0000019-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000019\ccres0000019.html

```text
Final Portfolio Submission Checklist
Use this checklist before you submit your final Art 30 portfolio. This is a professional self-check, not busywork. If you can confidently check each item, you are ready to submit.
1. Portfolio Contents (Required)
I have selected 6–8 major artworks that best represent my learning in Art 30Each artwork was chosen intentionally (not just because it was finished)My portfolio shows growth over time, not one repeated ideaMy work demonstrates conceptual thinking, not just technical skill
2. Cohesion & Artistic Voice
My artworks are connected by at least one of the following:
Theme or idea
Symbolic imagery
Visual style or strategy
Material or process choices
A vi...
```

### ccres0000067-ccres0000067-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000067\ccres0000067.html

```text
Grade 10 Art Assignment
Personal Choice Artwork
In this assignment you will create a completed artwork based on a subject or idea of your own choosing. Artists constantly make decisions about what they want to communicate and how they want to communicate it. The subject, materials, colours, and style used in an artwork are all choices made by the artist. This project is designed to give you the opportunity to explore your own interests while applying the artistic skills and concepts you have been learning in Art 10. Rather than following a strict theme, you will decide what you want to create and how you want to express your idea visually.
The goal of this assignment is to help you develop i...
```

### ccres0000050-ccres0000050-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000050\ccres0000050.html

```text
Material Testing
Choose 3–5 materials and test them:
Cut, tear, layer, draw, attach
Combine with drawing or paint
Do not aim for finished work — aim for discovery.
Process Exploration
Choose one material or combination.
Explore process:
Repetition
Layering
Removal or destruction
Document each stage.
Artist Influence Experiments
Create one small experiment inspired by each artist:
Jungen: transform a familiar object
Dick: consider cultural or symbolic meaning of material
Kiefer: build texture or weight through layers
Label each experiment with:
Artist influence
What material choice you borrowed
Written Reflection (½Page)
Respond using art vocabulary:
What material choices felt most meaningful...
```

### ccres0000056-ccres0000056-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000056\ccres0000056.html

```text
Movement Exploration
Choose one art movement (e.g., Cubism, Expressionism, Conceptual Art).
Create notes and quick sketches showing:
Key visual traits
Typical subject matter
Core ideas or beliefs
Style Experiments
Create 1-2 small sketches inspired by movement characteristics:
Change how space is shown
Simplify or fragment forms
Alter perspective or structure
Do not copy a specific artwork.
Artist Influence Studies
Create one sketch inspired by each artist:
Snow: concept or perception-based idea
Odjig: flowing form and narrative
Picasso: fragmented space or multiple viewpoints
Label each sketch with:
Artist influence
What stylistic idea you borrowed
How you changed it
Personal Adaptation
Cho...
```

### ccres0000038-ccres0000038-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\art\ccres0000038\ccres0000038.html

```text
Narrative Brainstorm
Create a page exploring possible personal narratives:
Moments that changed you
Repeated memories
Important places or objects
Experiences you are comfortable exploring visually
You do NOT need to share private details.
Symbol Development
Choose 2–3 narrative ideas.
For each idea:
Create multiple symbolic sketches
Avoid literal illustration
Explore different visual metaphors
Visual Story Studies
Create small narrative sketches using:
Sequence (multiple frames)
Repetition of symbols
Changes in scale or composition
Test different ways the story could be told.
Artist Influence Sketches
Create one narrative sketch inspired by each artist:
Carr: story through place or atmospher...
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
