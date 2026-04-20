# Prompt Pack

- Project: general-psychology-20-independent-studies-202633108
- Generated: 2026-04-20T20:44:05.959Z

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
  "learningUpdatedAt": "2026-04-20T20:44:05.739Z",
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
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\assets\\gp20-behaviourism-quiz.html",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\assets\\gp20-humanism-quiz.html",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\assets\\gp20-learning-techniques-matching.html",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\assets\\gp20-defense-mechanisms-quiz.html",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\assets\\gp20-identifying-behaviour-disorders-quiz.html",
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
  "sourceOfTruthNotes": "Use workspace/index.html, workspace/main.js, workspace/assessment-delivery.js, and workspace/assets/*.html as editable canonical sources. Regenerate course-shell-data.js and D2L map artifacts from meta/build-shell-from-manifest.ps1. Do not replace this project with the generic build:course-shell output unless intentionally rebuilding course structure.",
  "createdAt": "2026-04-09T19:29:15.518Z",
  "updatedAt": "2026-04-20T20:44:05.739Z",
  "workspaceApprovedAt": "2026-04-20T20:44:05.739Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: textbook: 414; other: 295; assessment: 47; outline: 20; teacher-note: 2.

## Resource Catalog Summary

### assignment 8f482f70 25da 4c03 b504 60635079e77d (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\assignment\i0b00d30c-afd8-4faf-8d2c-c45b9ea56c55\assignment_8f482f70-25da-4c03-b504-60635079e77d.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 0580aff0 b77f 4108 9b65 2d65978229a6 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\assignment\i0ec0d3af-2d3a-407b-b9c3-0909b2d1ffad\assignment_0580aff0-b77f-4108-9b65-2d65978229a6.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 8c63995f e6de 40f4 9e74 b89190b664a2 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\assignment\i1b35a799-ebac-400c-abe4-feb6727da215\assignment_8c63995f-e6de-40f4-9e74-b89190b664a2.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 4569789d f733 419d beec 24b93f47a840 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\assignment\i3cc9c486-bb30-4dec-96da-cbd30ec66318\assignment_4569789d-f733-419d-beec-24b93f47a840.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 84c16026 b1cb 4521 a3fe acd7282f316b (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\assignment\i838b9de8-0f59-4c8d-b632-dc011956ce71\assignment_84c16026-b1cb-4521-a3fe-acd7282f316b.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 6891a52a 96f6 4640 87a8 f79f9d362da6 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\assignment\ic402bab7-1129-4739-8bb7-d00fe25453a6\assignment_6891a52a-96f6-4640-87a8-f79f9d362da6.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment a86e1090 4305 431e b495 27b4700c94da (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\assignment\id6277875-45f6-46f0-885c-d4a865314982\assignment_a86e1090-4305-431e-b495-27b4700c94da.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment a4b4b66d 1f8c 4130 be1a 5cf86c53568a (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\assignment\if842700c-88cb-4e05-a651-1713571973c4\assignment_a4b4b66d-1f8c-4130-be1a-5cf86c53568a.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

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

### content-i69540a89-fb5d-447f-be2e-73038977e5f4-content-lesson-683-page-5092-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\content\i69540a89-fb5d-447f-be2e-73038977e5f4\Content\Lesson_683\page_5092.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><div class="firstBlock">
<p>A criminal psychologist is a professional that studies the behaviors and thoughts of criminals. Interest in this career field has grown dramatically in recent years thanks to a number of popular television programs that depict fictionalized criminal psychologists, such as such as�<em>Criminal Minds</em>�and�<em>CSI</em>. The field is highly related to<a href="http://psychology.about.com/od/branchesofpsycholog1/f/forensicpsychology.htm" data-component="link" data-source="inlineLink" data-type="internalLink" data-ordinal="1">foren...
```

### ontent-i69540a89-fb5d-447f-be2e-73038977e5f4-content-lesson-683-page-5092-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\i69540a89-fb5d-447f-be2e-73038977e5f4\Content\Lesson_683\page_5092.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><div class="firstBlock">
<p>A criminal psychologist is a professional that studies the behaviors and thoughts of criminals. Interest in this career field has grown dramatically in recent years thanks to a number of popular television programs that depict fictionalized criminal psychologists, such as such as�<em>Criminal Minds</em>�and�<em>CSI</em>. The field is highly related to<a href="http://psychology.about.com/od/branchesofpsycholog1/f/forensicpsychology.htm" data-component="link" data-source="inlineLink" data-type="internalLink" data-ordinal="1">foren...
```

### content-ic39d2510-84f2-4a6a-9951-e2325784ed4e-content-lesson-683-page-5091-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\content\ic39d2510-84f2-4a6a-9951-e2325784ed4e\Content\Lesson_683\page_5091.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><div>
<div class="occupation-profile-content">
<h3>Psychologist - Career Profile (<a href="http://occinfo.alis.alberta.ca/occinfopreview/info/browse-occupations/occupation-profile.html?id=71002221" target="_blank">For full profile click here</a>)�</h3>
<div>
<div class="occupation-profile-content-noc"></div>
</div>
<div>
<p>Psychologists assess, diagnose and treat psychological, emotional and behavioural disorders. They also research and apply theories relating to behaviour and mental processes.</p>
<p><b>Also Known As</b></p>
<p>Facilitator, Industrial Ps...
```

### ontent-ic39d2510-84f2-4a6a-9951-e2325784ed4e-content-lesson-683-page-5091-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\ic39d2510-84f2-4a6a-9951-e2325784ed4e\Content\Lesson_683\page_5091.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><div>
<div class="occupation-profile-content">
<h3>Psychologist - Career Profile (<a href="http://occinfo.alis.alberta.ca/occinfopreview/info/browse-occupations/occupation-profile.html?id=71002221" target="_blank">For full profile click here</a>)�</h3>
<div>
<div class="occupation-profile-content-noc"></div>
</div>
<div>
<p>Psychologists assess, diagnose and treat psychological, emotional and behavioural disorders. They also research and apply theories relating to behaviour and mental processes.</p>
<p><b>Also Known As</b></p>
<p>Facilitator, Industrial Ps...
```

### content-ia2b65a17-7829-4500-b74a-6f18b3d9c39c-content-book-1818-chapter-15710-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\content\ia2b65a17-7829-4500-b74a-6f18b3d9c39c\Content\book_1818\chapter_15710.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><p align="center"><br><b><img width="157" height="139" alt="https://lh6.googleusercontent.com/g4FSREZpkYueHmXq2or481-0sy7kaBcOMN4s868u52eV23DLUDRM-qWfMyuAJplIjdypyS7muKytQn0bsaNXVa6RNFBKGtH-Px4HicjHwcTX8zlHFFvh543WLjpURxUbcjgZaxvX" src="..\image_chapter_15710.png" border="0" v:shapes="Picture_x0020_6"></b><br></p>
<p align="center">�</p><p align="center"><b>
Click on the purple link below and complete the Humanism�Quiz</b></p>
<h4 align="center"><strong><span style="color: rgb(51, 102, 255);"><a href="/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6811&amp...
```

### ontent-ia2b65a17-7829-4500-b74a-6f18b3d9c39c-content-book-1818-chapter-15710-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\ia2b65a17-7829-4500-b74a-6f18b3d9c39c\Content\book_1818\chapter_15710.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><p align="center"><br><b><img width="157" height="139" alt="https://lh6.googleusercontent.com/g4FSREZpkYueHmXq2or481-0sy7kaBcOMN4s868u52eV23DLUDRM-qWfMyuAJplIjdypyS7muKytQn0bsaNXVa6RNFBKGtH-Px4HicjHwcTX8zlHFFvh543WLjpURxUbcjgZaxvX" src="..\image_chapter_15710.png" border="0" v:shapes="Picture_x0020_6"></b><br></p>
<p align="center">�</p><p align="center"><b>
Click on the purple link below and complete the Humanism�Quiz</b></p>
<h4 align="center"><strong><span style="color: rgb(51, 102, 255);"><a href="/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6811&amp...
```

### content-i1dab161a-aa78-4c81-9991-a55e4fe09e47-content-book-1818-chapter-15709-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\content\i1dab161a-aa78-4c81-9991-a55e4fe09e47\Content\book_1818\chapter_15709.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><br><p></p><p align="center"><br></p><p align="center"><img width="157" height="139" alt="https://lh6.googleusercontent.com/g4FSREZpkYueHmXq2or481-0sy7kaBcOMN4s868u52eV23DLUDRM-qWfMyuAJplIjdypyS7muKytQn0bsaNXVa6RNFBKGtH-Px4HicjHwcTX8zlHFFvh543WLjpURxUbcjgZaxvX" src="..\image_chapter_15709.png" border="0" v:shapes="Picture_x0020_2"></p><p align="center">
<br></p><p align="center"><span lang="EN"><b><i>Click on the purple link below and complete
the <a title="Freud" href="/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6811&amp;type=quiz&amp;rCode=6a3fa0d9a41...
```

### ontent-i1dab161a-aa78-4c81-9991-a55e4fe09e47-content-book-1818-chapter-15709-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\i1dab161a-aa78-4c81-9991-a55e4fe09e47\Content\book_1818\chapter_15709.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><br><p></p><p align="center"><br></p><p align="center"><img width="157" height="139" alt="https://lh6.googleusercontent.com/g4FSREZpkYueHmXq2or481-0sy7kaBcOMN4s868u52eV23DLUDRM-qWfMyuAJplIjdypyS7muKytQn0bsaNXVa6RNFBKGtH-Px4HicjHwcTX8zlHFFvh543WLjpURxUbcjgZaxvX" src="..\image_chapter_15709.png" border="0" v:shapes="Picture_x0020_2"></p><p align="center">
<br></p><p align="center"><span lang="EN"><b><i>Click on the purple link below and complete
the <a title="Freud" href="/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6811&amp;type=quiz&amp;rCode=6a3fa0d9a41...
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
