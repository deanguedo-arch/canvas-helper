# Prompt Pack

- Project: forensics
- Generated: 2026-04-17T20:08:53.732Z

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
  "id": "92b81c7c-1321-40e0-9b0a-a69b09442d64",
  "slug": "forensics",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\forensics\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/index.html",
  "rawEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/raw/original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-04-17T20:08:53.643Z",
  "migrationState": "migrated",
  "projectType": "hybrid",
  "preferredWorkflows": [
    "conversion",
    "injection/integration"
  ],
  "canonicalEntry": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/index.html",
  "canonicalSources": [
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/index.html",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/main.jsx",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/main.js",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module8assignment.html",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module8assignment-app.jsx"
  ],
  "generatedOutputs": [
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module7assignment.bundle.js",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module8assignment.bundle.js"
  ],
  "regenerateCommand": "Manual: rebuild assignment bundle files from matching *-app.jsx sources before export.",
  "injectedComponents": [
    {
      "id": "module8-assignment",
      "source": "projects/forensics/workspace/assets/module8assignment-app.jsx",
      "target": "projects/forensics/workspace/assets/module8assignment.html",
      "status": "active"
    },
    {
      "id": "module8-career-matcher-reference",
      "source": "projects/forensics/workspace/assets/module8assignment-career-matcher.jsx",
      "target": "projects/forensics/workspace/assets/module8assignment.html",
      "status": "reference-only"
    },
    {
      "id": "module8-day-in-life-reference",
      "source": "projects/forensics/workspace/assets/module8assignment-day-in-life.jsx",
      "target": "projects/forensics/workspace/assets/module8assignment.html",
      "status": "reference-only"
    },
    {
      "id": "module8-case-role-reference",
      "source": "projects/forensics/workspace/assets/module8assignment-case-role.jsx",
      "target": "projects/forensics/workspace/assets/module8assignment.html",
      "status": "reference-only"
    }
  ],
  "importedFirstPassOrigin": {
    "sourceSystem": "brightspace",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas helper\\projects\\processed\\forensics\\source"
  },
  "exportTargets": [
    {
      "target": "brightspace",
      "enabled": true
    },
    {
      "target": "scorm",
      "enabled": true
    }
  ],
  "authoringStatus": "active",
  "referenceOnly": [
    "projects/forensics/workspace/assets/module8assignment-career-matcher.jsx",
    "projects/forensics/workspace/assets/module8assignment-day-in-life.jsx",
    "projects/forensics/workspace/assets/module8assignment-case-role.jsx"
  ],
  "sourceOfTruthNotes": "Module 8 split files stay reference-only unless explicitly activated in the assignment flow.",
  "createdAt": "2026-03-14T13:26:57.855Z",
  "updatedAt": "2026-04-17T20:08:53.643Z",
  "workspaceApprovedAt": "2026-04-17T20:08:53.643Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: other: 201; textbook: 106; assessment: 40; outline: 4; teacher-note: 2.

## Resource Catalog Summary

### D2LCCExport 129076 23 24 Forensic Studies 25 Per 1(A B) Sec S3 202631302 (2) (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2).zip
- Extraction: stored-only
- Chunks: 0
- Signals: none

### shutterstock 169636037 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i0073cf68-ef89-4190-b368-d429ee0816f0\Content\shutterstock_169636037.jpg
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### 170829 F DB515 0024 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i16176291-5154-45bd-8891-b2c9517b1a3c\Content\170829-F-DB515-0024.JPG
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### 080717 F 5234X 064 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i24fee453-9acd-4444-8071-e09f3820538b\Content\080717-F-5234X-064.JPG
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### 3034903278 5ef70f6f09 b (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i5416ee1b-c173-4bcc-80e8-e3c1fae36848\Content\3034903278_5ef70f6f09_b.jpg
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### Leonarde Keeler 1937 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i545d89a9-d9bd-4555-91b4-35ef6d318388\Content\Leonarde_Keeler_1937.jpg
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### Locard Research (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i85281f98-0aa9-4147-93a9-d14de5638519\Content\Locard Research.jpeg
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### hair evidence (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\ia4effbb5-11e6-405e-a610-94c25bdcd18e\Content\hair evidence.jpg
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

## D2L Course Map Summary

- Course title: 23-24 | Forensic Studies 25 | Per 1(A-B) | Sec S3
- Modules: 12
- Items: 194
- Lessons: 3
- Assignments: 12
- Quizzes: 9
- PDFs: 4
- HTML pages: 147
Top modules:
- Course Information (7 direct items)
- 1 Introduction to Crime Scenes (3 direct items)
- 2 Types of Evidence and Fingerprint Analysis (4 direct items)
- 3 Trace Evidence (4 direct items)
- 4 Body Fluid Evidence (4 direct items)
- 5 Forensic Detection of Impaired Driving (4 direct items)
- 6 Polygraphing and Document Analysis (4 direct items)
- 7 Forensic Genetics (3 direct items)

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project forensics`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project forensics`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project forensics`

## Anti-Summary Generation Rules

- Build from outline authority plus assessment demand, not from whole-book excerpts.
- Never generate a lesson that lacks outcomes, linked assessments, misconceptions, guided practice, independent practice, and readiness evidence.
- A lesson is a failure if it reads like chapter notes, only defines terms, or cites broad source blobs instead of targeted lesson evidence.
- Prefer lesson-packet-scoped references and page/section locators over raw document dumps.
- Use textbook or reference sources only to support a specific outcome and assessment demand.

## Sections List

- Node Preview -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/main.jsx

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://unpkg.com/@babel/standalone/babel.min.js, https://unpkg.com/react-dom@19.1.1/client?module, https://unpkg.com/react@19.1.1?module, https://unpkg.com/lucide-react@0.542.0?module

## Visual Signals
- Tailwind-style color tokens: slate-200, slate-600, sky-200, sky-50, slate-900, slate-700, sky-600, slate-300, slate-400, slate-500
- Hex colors: #ef4444, #fecaca, #1e293b, #020617, #0f172a, #111827
- Repeated shape tokens: rounded-full, rounded-xl, rounded-3xl, rounded-2xl
- Motion and interaction tokens: transition, hover:border-slate-200, hover:bg-white, hover:bg-slate-50, hover:bg-white/5, hover:text-white, hover:bg-sky-600, hover:text-slate-800

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

- Project: forensics
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/canvas code and references/forensics

## Sections
- Node Preview (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/main.jsx)
```

## Import Log

```md
# Import Log

- Generated: 2026-03-14T13:26:57.855Z
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/canvas code and references/forensics

## Actions
- Detected "chatgptcanvascreationexample.html" as a React module entrypoint inside the source folder.
- Generated raw/original.html as a preview shell for the imported React module source.
- Preserved the original React module source at raw/original-source.txt.
- Generated raw/main.jsx with a preview bootstrap for the imported React module.
- Generated workspace/index.html to preview the imported React module source.
- Preserved the imported React module as workspace/main.jsx with a preview bootstrap.
- Copied 384 supporting file(s) into projects/resources/forensics/.
- Indexed the imported supporting material into projects/resources/forensics/_extracted/.
- Learned project patterns (/Users/deanguedo/Documents/GitHub/canvas-helper/.runtime/pattern-bank/auto/forensics.json).
- Updated local pattern bank (7 profile(s)).
- Generated prompt pack (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/meta/prompt-pack.md).

## Warnings
- Found 148 possible site files. Using "chatgptcanvascreationexample.html" and treating the rest as supporting material.
```

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-assignment-ibf8741ec-ded8-4c2a-9594-f9ab5f78eea0-content-experiment-1-latent-fingerprints-docx (docx/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\ibf8741ec-ded8-4c2a-9594-f9ab5f78eea0\Content\Experiment 1 - Latent Fingerprints.docx

```text
Experiment 1

Short-term vs. Long-term Latent Fingerprint Samples

33 Marks
```

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-ie0299797-cf54-494f-af1d-80d66242ee26-forensic-science-25-answer-keys-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\ie0299797-cf54-494f-af1d-80d66242ee26\Forensic Science 25 Answer Keys.pdf

```text
Forensic Science 25 Answer Keys
M1 Introduction to Crime Scenes Assignment
12 marks
1.One of the first things that investigators do when approaching a crime scene is to
make it secure.  Givetworeasons why it’s importantto properly secure a crime
scene. (2 marks)
1)Evidence can be lost or contaminated 2) Anyone can enter the crime scene
and disrupt evidence
2.In a crime scene, there are 7 steps that investigators take in order to ensure that
protocols are being followed.  Complete the table below by describing the 7 steps
in your own words. (7 marks)
StepDescription
SecuringMake sure no one enters the crime scene; track any who do
SeparatingSeparate the witnesses so they do not compare storie...
```

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-i205ddaa3-0c3e-4015-b814-bcfd45b83422-content-book-1416-chapter-11997-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\i205ddaa3-0c3e-4015-b814-bcfd45b83422\Content\book_1416\chapter_11997.html

```text
Identification of Blood Evidence
The first step that a forensic investigator must take in a crime scene where blood evidence is suspected is confirming that the evidence found is blood. Some liquids when spilled and left to dry can be mistaken for blood such as paint, stain, juices, food coloring, or hair dyes. Forensic scientists use various chemical tests to confirm that the residue left behind at a crime scene is blood. In this lesson two popular chemical blood identification tests will be examined - phenolphthalein and luminal.
The Phenolphthalein Test
Trying to clean up every trace of blood after a violent crime is very difficult especially if there is great deal of blood. Often crimina...
```

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-i1b9d5df3-0b57-4109-9a00-d3f42192d5e2-assignment-submission-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\i1b9d5df3-0b57-4109-9a00-d3f42192d5e2\Assignment Submission.html

```text
Submission Instructions
When submitting your assignments go to the corresponding drop box and follow the instructions below for the format you are using.
For Digital (Online) Assignments - Submit from Google Drive:
Step 0: (You only need to do this step once in Brightspace. If you have already done this, skip to Step 1).
Go to the Brightspace Homepage by clicking on the EIPS logo on the top left corner.
Scroll down to the bottom until you see the Google Apps widget and select Authorize
Step 1: In the box, select Choose Existing
Step 2: Select Google Drive (If you do not see "Google Drive" make sure you do Step 0!)
Step 3: Search for the file you want to submit and hit Add.
Step 4: Hit Submit...
```

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-ic6856f52-3e5a-447d-8054-f101d18b7e83-content-book-1416-chapter-11998-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\ic6856f52-3e5a-447d-8054-f101d18b7e83\Content\book_1416\chapter_11998.html

```text
The Luminol Test
At a crime scene, large pools of blood are easy to spot, but what if all the blood has been cleaned up by the assailant?  It too can be detected using a powerful chemiluminescent compound called LUMINOL (3-aminophthalhydazide). Luminol reacts with a portion of the hemoglobin of red blood cells called 'heme'. When luminol comes into contact with ‘heme’ it reacts producing a unique product - a greenish-blue light. Luminol is very sensitive; it can detect blood at 1 part to 300 000.
Investigators use luminol at crime scenes where there is no visible blood whatsoever. They spray it over a wide area in near-total darkness so that any reaction is obvious. Officers then photograph/...
```

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-ie2c27177-23ad-417f-b0ec-34dd4f47add4-content-book-1416-chapter-11992-html (html/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\ie2c27177-23ad-417f-b0ec-34dd4f47add4\Content\book_1416\chapter_11992.html

```text
Body Fluid Evidence
This module will explore the significance of body fluid evidence found at crime scenes. The two main types of body fluids that may be found at a crime scene or upon the bodies of the individuals involved with a particular crime are blood and semen. The lessons in this module will:
outline some of the basic features of blood.
explore how latent blood residue can be enhanced and how blood spatter patterns can be interpreted.
focus upon the information that semen collected from a sexual assault yields.
examine a historical crime and a fictional crime that both involve body fluid evidence.
The body fluid that is most often found at crime scene involving injuries (ie. traffic ...
```

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-idd074817-3b63-4e7f-b095-637a00ea461e-fs25-outline-summer-school-pdf (pdf/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\idd074817-3b63-4e7f-b095-637a00ea461e\FS25 outline (summer school).pdf

```text
Forensic Studies 25
Next Step Summer School (780) 467-7929
dylan.shott@eips.ca
Course Description:
Forensic Studies 25 is the application of scientific principles, methods, and technologies for the purpose of solving
debates including legal proceedings. Through the study of forensic science, students are given the opportunity to
explore how scientific concepts from a variety of disciplines (biology, chemistry, and physics) apply specifically to this
unique field. This Course will promote the importance of scientific literacy and problem‐solving techniques. Emphasis
is placed on Canadian Methods and legal protocols as students enhance their understanding of science and to explore
this unique ...
```

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-ib526d33e-efed-4365-93ee-351aec4b56ab-content-label-3489-html (html/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\ib526d33e-efed-4365-93ee-351aec4b56ab\Content\label_3489.html

```text
Disclaimer: Due to the graphic nature of this course material and its basis on real events, this course may not be suitable for everyone. Forensic Science 25 deals with mature subject matter such as crimes involving varying degrees of injury and/or death.  The course includes controversial or sensitive components such as simulated blood experiments, discussion of semen analysis and the use of rape kits and the examination of alcohol and substance abuse. Students must be able to discuss forensic criminal cases in an objective manner, while being sensitive and respectful toward the negative impact of that crime.
If you find these topics to be objectionable or offensive, please do not enroll in...
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
