# Prompt Pack

- Project: forensics
- Generated: 2026-03-29T14:10:42.035Z

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
  "id": "92b81c7c-1321-40e0-9b0a-a69b09442d64",
  "slug": "forensics",
  "sourcePath": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/processed/forensics/source",
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
  "learningUpdatedAt": "2026-03-18T14:44:05.427Z",
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
  "updatedAt": "2026-03-29T00:53:40.572Z",
  "workspaceApprovedAt": "2026-03-29T00:53:40.572Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: other: 214; textbook: 106; assessment: 57; outline: 4; teacher-note: 2.

## Resource Catalog Summary

### D2LCCExport 129076 23 24 Forensic Studies 25 Per 1(A B) Sec S3 202631302 (2) (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2).zip
- Extraction: stored-only
- Chunks: 0
- Signals: none

### assignment 80f86dff 581e 4e9f abe9 d5407d926f3f (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i0073cf68-ef89-4190-b368-d429ee0816f0\assignment_80f86dff-581e-4e9f-abe9-d5407d926f3f.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### shutterstock 169636037 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i0073cf68-ef89-4190-b368-d429ee0816f0\Content\shutterstock_169636037.jpg
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 701e84be 65c1 4997 b793 347fd65867af (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i16176291-5154-45bd-8891-b2c9517b1a3c\assignment_701e84be-65c1-4997-b793-347fd65867af.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### 170829 F DB515 0024 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i16176291-5154-45bd-8891-b2c9517b1a3c\Content\170829-F-DB515-0024.JPG
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 5c66b2fe 5be0 4060 a68e a6ca11dd1ffb (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i20dfab48-a342-491f-8077-34397a216ad6\assignment_5c66b2fe-5be0-4060-a68e-a6ca11dd1ffb.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 08f87e49 036a 44cd 83ce c62f268fd692 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i24fee453-9acd-4444-8071-e09f3820538b\assignment_08f87e49-036a-44cd-83ce-c62f268fd692.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### 080717 F 5234X 064 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\i24fee453-9acd-4444-8071-e09f3820538b\Content\080717-F-5234X-064.JPG
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

- Extracted chunk text missing.

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-assignment-if3a4e6a4-91ac-4aef-813d-76a771b488bf-content-experiment-2-lifting-fingerprints-docx (docx/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\assignment\if3a4e6a4-91ac-4aef-813d-76a771b488bf\Content\Experiment 2 - Lifting Fingerprints.docx

- Extracted chunk text missing.

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-ie0299797-cf54-494f-af1d-80d66242ee26-forensic-science-25-answer-keys-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\ie0299797-cf54-494f-af1d-80d66242ee26\Forensic Science 25 Answer Keys.pdf

- Extracted chunk text missing.

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-i205ddaa3-0c3e-4015-b814-bcfd45b83422-content-book-1416-chapter-11997-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\i205ddaa3-0c3e-4015-b814-bcfd45b83422\Content\book_1416\chapter_11997.html

- Extracted chunk text missing.

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-i3838d916-02d0-4c57-bfa7-2032c66a71c4-how-to-be-successful-in-an-independent-study-course-1-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\i3838d916-02d0-4c57-bfa7-2032c66a71c4\How to Be Successful in an Independent Study Course (1).pdf

- Extracted chunk text missing.

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-i1b9d5df3-0b57-4109-9a00-d3f42192d5e2-assignment-submission-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\i1b9d5df3-0b57-4109-9a00-d3f42192d5e2\Assignment Submission.html

- Extracted chunk text missing.

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-ic6856f52-3e5a-447d-8054-f101d18b7e83-content-book-1416-chapter-11998-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\ic6856f52-3e5a-447d-8054-f101d18b7e83\Content\book_1416\chapter_11998.html

- Extracted chunk text missing.

### d2lccexport-129076-23-24-forensic-studies-25-per-1-a-b-sec-s3-202631302-2-ontent-ie2c27177-23ad-417f-b0ec-34dd4f47add4-content-book-1416-chapter-11992-html (html/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics\D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)\сontent\ie2c27177-23ad-417f-b0ec-34dd4f47add4\Content\book_1416\chapter_11992.html

- Extracted chunk text missing.

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
