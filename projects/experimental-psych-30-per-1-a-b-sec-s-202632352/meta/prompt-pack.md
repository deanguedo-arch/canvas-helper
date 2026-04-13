# Prompt Pack

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Generated: 2026-04-13T15:31:13.539Z

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
  "id": "3dbcc376-9ab4-4ffd-a6b8-dd15df4e4e77",
  "slug": "experimental-psych-30-per-1-a-b-sec-s-202632352",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\experimental-psych-30-per-1-a-b-sec-s-202632352\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\experimental-psych-30-per-1-a-b-sec-s-202632352\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\experimental-psych-30-per-1-a-b-sec-s-202632352\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-04-13T15:31:13.494Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\experimental-psych-30-per-1-a-b-sec-s-202632352\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\experimental-psych-30-per-1-a-b-sec-s-202632352\\workspace\\index.html"
  ],
  "generatedOutputs": [],
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\incoming\\experimental-psych-30-per-1-a-b-sec-s-202632352",
    "importedAt": "2026-04-09T19:29:11.083Z"
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
  "createdAt": "2026-04-09T19:29:11.083Z",
  "updatedAt": "2026-04-13T15:31:13.494Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: other: 209; assessment: 35; textbook: 20; outline: 7.

## Resource Catalog Summary

### assignment 41acbc22 5ab0 48d5 9d58 9e9c8da81b2d (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\assignment\i242a11fc-d3bc-4d80-a199-88b88de1783e\assignment_41acbc22-5ab0-48d5-9d58-9e9c8da81b2d.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment ef94e360 31de 45d5 a58a 8f3547687ab2 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\assignment\i41c72f5e-05ad-4dfa-b349-8bdf48518cbe\assignment_ef94e360-31de-45d5-a58a-8f3547687ab2.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 66c3ed6c f6ef 4c50 94fb 6e3713246afd (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\assignment\i7c7ef5d8-18ec-4ae9-acc7-5a77dd9c9901\assignment_66c3ed6c-f6ef-4c50-94fb-6e3713246afd.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### Experimental Psychology 30 ____ /22 Module 3 Conducting Research Assessment (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\assignment\i7c7ef5d8-18ec-4ae9-acc7-5a77dd9c9901\attachments\NXT EP30 M3 Assessment.docx
- Extraction: indexed via native
- Chunks: 5
- Signals: filename:assignment, text:assessment, text:what-is

### assignment a4550875 c858 4fb0 a355 82a71cd9fc14 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\assignment\i8e175f73-25a4-4724-9716-cd78e3fa28ed\assignment_a4550875-c858-4fb0-a355-82a71cd9fc14.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 8f621710 8497 4f4f 80b8 1eb9c28c8098 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\assignment\ia6dc540b-a53a-4ecf-b6f9-a7ae7bb792a7\assignment_8f621710-8497-4f4f-80b8-1eb9c28c8098.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### Experimental Psychology 30 ____ /25 Module 1 Experimental Psychology Overview Assessment (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\assignment\ia6dc540b-a53a-4ecf-b6f9-a7ae7bb792a7\attachments\NXT EP30 M1 Assessment.docx
- Extraction: indexed via native
- Chunks: 5
- Signals: filename:overview, text:outcomes, filename:assignment, text:assessment, text:what-is

### assignment 14189afb 63e6 45ed 8733 b2ee1d79ad70 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\assignment\ib1ab8554-0f40-48d5-987c-bb332c31336d\assignment_14189afb-63e6-45ed-8733-b2ee1d79ad70.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

## D2L Course Map Summary

- Course title: 23-24 | Experimental Psych 30 | Per 1(A-B) | Sec S3
- Modules: 7
- Items: 151
- Lessons: 2
- Assignments: 7
- Quizzes: 4
- PDFs: 21
- HTML pages: 96
Top modules:
- Course Information (6 direct items)
- Module 1: Experimental Psychology Overview (5 direct items)
- Module 2: Statistics (5 direct items)
- Module 3: Conducting Research (5 direct items)
- Extra Credits (1 direct item)
- Module 4:  Experiment Examples and Practice Project (3 direct items)
- Teacher Resources (Keep Hidden) (8 direct items)

## Course Blueprint Summary

### Unit 1: Experimental Psychology 30 Next Step Summer School (780) 467-7929
- Outcomes: some scientists, the most problematic statistical illusion relates to observational studies in which correlation is often confused with causation. For example, you may have heard the statement that people who consume a moderate amount of alcohol have less heart disease than people who consume either no alcohol or too much alcohol. People who report the news might inadvertently present this information in such a way that the public is led to believe that alcohol prevents heart disease. In fact, this claim cannot be made. Correlation is not causation
- Linked assessments: ontent-i4ad2ee24-9c63-4785-b430-45099312fd87-section-4-summary-html, assignment-ia6dc540b-a53a-4ecf-b6f9-a7ae7bb792a7-attachments-nxt-ep30-m1-assessment-docx, ontent-icda9abd0-32c4-4e1f-a530-b7e61fcf2334-key-ep30-assignment-1-pdf
- Must know: some scientists, the most problematic statistical illusion relates to observational studies in which correlation is often confused with causation. For example, you may have heard the statement that people who consume a moderate amount of alcohol have less heart disease than people who consume either no alcohol or too much alcohol. People who report the news might inadvertently present this information in such a way that the public is led to believe that alcohol prevents heart disease. In fact, this claim cannot be made. Correlation is not causation
- Assessed skills: complete, explain, identify, provide, analyze, describe, design, predict
- Mandatory vocabulary: Achievement, Analysis, Assessments, Check, Communication, Completed, Credit, Data

### Unit 2: ANSWER KEY Experimental Psychology 30 - Assignment 2
- Outcomes: Use Unit 2: ANSWER KEY Experimental Psychology 30 - Assignment 2 concepts to write, compare, define, describe course ideas in assessment-aligned responses
- Linked assessments: ontent-iecfb71ba-aeec-4f6f-afef-68d7c9c6152e-key-ep30-assignment-2-pdf, ontent-ib688abb7-7458-4213-a7e3-713459396c06-section-4-summary-copy-html, assignment-ifce37e56-0e7e-41cb-8976-efb3e53a452e-attachments-nxt-ep30-m2-assessment-docx
- Must know: Use Unit 2: ANSWER KEY Experimental Psychology 30 - Assignment 2 concepts to write, compare, define, describe course ideas in assessment-aligned responses
- Assessed skills: write, compare, define, describe, explain, pretend, provide, complete
- Mandatory vocabulary: none

### Unit 3: ANSWER KEY Experimental Psychology 30 - Assignment 3
- Outcomes: Use Unit 3: ANSWER KEY Experimental Psychology 30 - Assignment 3 concepts to compare, define, explain, provide course ideas in assessment-aligned responses
- Linked assessments: ontent-ifeab108d-9d65-4fc6-951f-635464238894-key-ep30-assignment-3-1-pdf, ontent-i7d647901-2618-476b-8124-3ced6a0c2ffe-section-4-summary-copy-1-html, assignment-i7c7ef5d8-18ec-4ae9-acc7-5a77dd9c9901-attachments-nxt-ep30-m3-assessment-docx
- Must know: Use Unit 3: ANSWER KEY Experimental Psychology 30 - Assignment 3 concepts to compare, define, explain, provide course ideas in assessment-aligned responses
- Assessed skills: compare, define, explain, provide, show, summarize, complete, support
- Mandatory vocabulary: none

### Unit 4: ANSWER KEY Experimental Psychology 30 - Assignment 4
- Outcomes: Use Unit 4: ANSWER KEY Experimental Psychology 30 - Assignment 4 concepts to provide, complete, create, interpret course ideas in assessment-aligned responses
- Linked assessments: ontent-i8a050c03-71f5-4969-bed4-0233c74b8fe4-key-ep30-assignment-4-pdf
- Must know: Use Unit 4: ANSWER KEY Experimental Psychology 30 - Assignment 4 concepts to provide, complete, create, interpret course ideas in assessment-aligned responses
- Assessed skills: provide, complete, create, interpret, justify, list, outline, show
- Mandatory vocabulary: none

## Assessment Map Summary

### Experimental Psychology 30 ____ /22 Module 3 Conducting Research Assessment (written-response)
- Deliverable: Completed written responses
- Skill verbs: complete, provide, compare, show, support, define, explain, summarize
- Related units: unit-3
- Related outcomes: unit-3--use-unit-3-answer-key-experimental-psychology-30-assignment-3-concepts-4404f3a7
- Failure points: Students may attempt to complete without using the required vocabulary or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may describe items separately without making the actual comparison explicit.; Students may attempt to show without using the required vocabulary or evidence.; Students may attempt to support without using the required vocabulary or evidence.; Students may name terms correctly but fail to connect them to examples or evidence.

### Experimental Psychology 30 ____ /25 Module 1 Experimental Psychology Overview Assessment (written-response)
- Deliverable: Completed written responses
- Skill verbs: explain, identify, provide, analyze, complete, describe, design, predict
- Related units: unit-1
- Related outcomes: unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3
- Failure points: Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.; Students may attempt to describe without using the required vocabulary or evidence.; Students may attempt to design without using the required vocabulary or evidence.

### Experimental Psychology 30 ____ /25 Module 2 Statistics Assessment (written-response)
- Deliverable: Completed written responses
- Skill verbs: design, complete, provide, write, compare, define, describe, explain
- Related units: unit-2
- Related outcomes: unit-2--use-unit-2-answer-key-experimental-psychology-30-assignment-2-concepts-59dd4c3d
- Failure points: Students may attempt to design without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may provide unsupported opinions instead of organized, criteria-aligned responses.; Students may describe items separately without making the actual comparison explicit.; Students may name terms correctly but fail to connect them to examples or evidence.

### Rubric – Lab Report Categories and Descriptors Reprinted (with Authorization) from Corwin Press Inc. (rubric)
- Deliverable: Work product that satisfies rubric criteria
- Skill verbs: provide, complete, explain, identify, analyze, describe, design, predict
- Related units: unit-1
- Related outcomes: unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3
- Failure points: Students may attempt to provide without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.; Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to describe without using the required vocabulary or evidence.; Students may attempt to design without using the required vocabulary or evidence.

### Reliability and Validity Reliability can be divided into three categories: test-retest, internal, and inter-rater. (written-response)
- Deliverable: Completed written responses
- Skill verbs: respond, complete, explain, identify, provide, analyze, describe, design
- Related units: unit-1
- Related outcomes: unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3
- Failure points: Students may attempt to respond without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.; Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may attempt to describe without using the required vocabulary or evidence.

### Steps to FDA Approval Phase Test Group (written-response)
- Deliverable: Completed written responses
- Skill verbs: apply, assess, identify, provide, complete, explain, analyze, describe
- Related units: unit-1
- Related outcomes: unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3
- Failure points: Students may attempt to apply without using the required vocabulary or evidence.; Students may attempt to assess without using the required vocabulary or evidence.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.; Students may give surface summaries instead of cause-and-effect or evidence-based explanations.

## Lesson Packet Summary

### Unit 1: Experimental Psychology 30 Next Step Summer School (780) 467-7929: some scientists, the most problematic statistical illusion relates to observational studies in which correlation is often confused with causation. For example, you may have heard the statement that people who consume a moderate amount of alcohol have less heart disease than people who consume either no alcohol or too much alcohol. People who report the news might inadvertently present this information in such a way that the public is led to believe that alcohol prevents heart disease. In fact, this claim cannot be made. Correlation is not causation
- Outcomes: some scientists, the most problematic statistical illusion relates to observational studies in which correlation is often confused with causation. For example, you may have heard the statement that people who consume a moderate amount of alcohol have less heart disease than people who consume either no alcohol or too much alcohol. People who report the news might inadvertently present this information in such a way that the public is led to believe that alcohol prevents heart disease. In fact, this claim cannot be made. Correlation is not causation
- Linked assessments: assignment-ia6dc540b-a53a-4ecf-b6f9-a7ae7bb792a7-attachments-nxt-ep30-m1-assessment-docx, ontent-i1fa15d3d-8803-4284-a871-1df0ac7810b5-lab-report-diamond-exceeds-pdf, ontent-i267ddcde-b272-41de-9e4e-e8b0ce8ba6ea-reliability-and-validity-html, ontent-i420a7eaa-b0e9-4ec4-b0b0-2cffeaab8929-approval-process-html, ontent-i4ad2ee24-9c63-4785-b430-45099312fd87-section-4-summary-html, ontent-i78ce9f26-410d-4f30-a9d6-57c585745b29-how-to-be-successful-in-an-independent-study-course-pdf
- Core concepts: Will, Psychology, Experimental, Research, Teacher, Eips, Completed, Credit
- Guided practice: Model how to complete using the lesson vocabulary and one cited source example.; Walk through one written-response prompt from Experimental Psychology 30 ____ /25 Module 1 Experimental Psychology Overview Assessment and annotate what a successful response has to include.
- Readiness evidence: Student can complete Will accurately without reverting to chapter-note summary.; Student uses Achievement, Analysis, Assessments in context.

### Unit 2: ANSWER KEY Experimental Psychology 30 - Assignment 2: Use Unit 2: ANSWER KEY Experimental Psychology 30 - Assignment 2 concepts to write, compare, define, describe course ideas in assessment-aligned responses
- Outcomes: Use Unit 2: ANSWER KEY Experimental Psychology 30 - Assignment 2 concepts to write, compare, define, describe course ideas in assessment-aligned responses
- Linked assessments: assignment-ifce37e56-0e7e-41cb-8976-efb3e53a452e-attachments-nxt-ep30-m2-assessment-docx, ontent-ib688abb7-7458-4213-a7e3-713459396c06-section-4-summary-copy-html, ontent-iecfb71ba-aeec-4f6f-afef-68d7c9c6152e-key-ep30-assignment-2-pdf
- Core concepts: none
- Guided practice: Model how to write using the lesson vocabulary and one cited source example.; Walk through one written-response prompt from Experimental Psychology 30 ____ /25 Module 2 Statistics Assessment and annotate what a successful response has to include.
- Readiness evidence: Student can write Use Unit 2: ANSWER KEY Experimental Psychology 30 - Assignment 2 concepts to write, compare, define, describe course ideas in assessment-aligned responses accurately without reverting to chapter-note summary.; Student uses required vocabulary in context.

### Unit 3: ANSWER KEY Experimental Psychology 30 - Assignment 3: Use Unit 3: ANSWER KEY Experimental Psychology 30 - Assignment 3 concepts to compare, define, explain, provide course ideas in assessment-aligned responses
- Outcomes: Use Unit 3: ANSWER KEY Experimental Psychology 30 - Assignment 3 concepts to compare, define, explain, provide course ideas in assessment-aligned responses
- Linked assessments: assignment-i7c7ef5d8-18ec-4ae9-acc7-5a77dd9c9901-attachments-nxt-ep30-m3-assessment-docx, ontent-i7d647901-2618-476b-8124-3ced6a0c2ffe-section-4-summary-copy-1-html, ontent-ifeab108d-9d65-4fc6-951f-635464238894-key-ep30-assignment-3-1-pdf
- Core concepts: none
- Guided practice: Model how to compare using the lesson vocabulary and one cited source example.; Walk through one written-response prompt from Experimental Psychology 30 ____ /22 Module 3 Conducting Research Assessment and annotate what a successful response has to include.
- Readiness evidence: Student can compare Use Unit 3: ANSWER KEY Experimental Psychology 30 - Assignment 3 concepts to compare, define, explain, provide course ideas in assessment-aligned responses accurately without reverting to chapter-note summary.; Student uses required vocabulary in context.

### Unit 4: ANSWER KEY Experimental Psychology 30 - Assignment 4: Use Unit 4: ANSWER KEY Experimental Psychology 30 - Assignment 4 concepts to provide, complete, create, interpret course ideas in assessment-aligned responses
- Outcomes: Use Unit 4: ANSWER KEY Experimental Psychology 30 - Assignment 4 concepts to provide, complete, create, interpret course ideas in assessment-aligned responses
- Linked assessments: ontent-i8a050c03-71f5-4969-bed4-0233c74b8fe4-key-ep30-assignment-4-pdf
- Core concepts: none
- Guided practice: Model how to provide using the lesson vocabulary and one cited source example.; Walk through one assignment prompt from ANSWER KEY Experimental Psychology 30 - Assignment 4 and annotate what a successful response has to include.
- Readiness evidence: Student can provide Use Unit 4: ANSWER KEY Experimental Psychology 30 - Assignment 4 concepts to provide, complete, create, interpret course ideas in assessment-aligned responses accurately without reverting to chapter-note summary.; Student uses required vocabulary in context.

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

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\experimental-psych-30-per-1-a-b-sec-s-202632352

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-04-09T19:29:11.083Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\experimental-psych-30-per-1-a-b-sec-s-202632352

## Actions
- Detected "сontent/i12be43f5-1bc7-4efe-9f21-ce86c2764360/Step 8 Sources of Error and Suggestions for Improvement.html" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Copied 8 local asset reference(s) into the raw project copy.
- Copied 8 local asset reference(s) into the workspace.
- Copied 271 supporting file(s) into projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/.
- Indexed the imported supporting material into projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/_extracted/.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\experimental-psych-30-per-1-a-b-sec-s-202632352.json).
- Updated local pattern bank (27 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\experimental-psych-30-per-1-a-b-sec-s-202632352\meta\prompt-pack.md).

## Warnings
- Found 96 possible site files. Using "сontent/i12be43f5-1bc7-4efe-9f21-ce86c2764360/Step 8 Sources of Error and Suggestions for Improvement.html" and treating the rest as supporting material.
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/thirdpartylib/jquery/jquery-3.3.1.slim.min.js
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/thirdpartylib/popper-js/popper.min.js
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/thirdpartylib/bootstrap-4.3.1/js/bootstrap.min.js
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/js/scripts.min.js
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/thirdpartylib/bootstrap-4.3.1/css/bootstrap.min.css
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/thirdpartylib/fontawesome-free-5.9.0-web/css/all.min.css
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/css/styles.min.css
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/css/custom.css
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/thirdpartylib/jquery/jquery-3.3.1.slim.min.js
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/thirdpartylib/popper-js/popper.min.js
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/thirdpartylib/bootstrap-4.3.1/js/bootstrap.min.js
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/js/scripts.min.js
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/thirdpartylib/bootstrap-4.3.1/css/bootstrap.min.css
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/thirdpartylib/fontawesome-free-5.9.0-web/css/all.min.css
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/css/styles.min.css
- Referenced asset not found: /shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/css/custom.css
```

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### ontent-i8a050c03-71f5-4969-bed4-0233c74b8fe4-key-ep30-assignment-4-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\сontent\i8a050c03-71f5-4969-bed4-0233c74b8fe4\KEY EP30 Assignment 4.pdf

```text
ANSWER KEY
Experimental Psychology 30 - Assignment 4
Module 2 Section 3 and 4
/34
Part One:  Multiple-Choice Questions(7 marks)
LetterStatement
B
1.Infomercials often use _____ to sell products.
A.the placebo effect
B.statistical illusions
C.re-interpretation bias
D.regression to the mean
D
2. When the behaviour of people changes simply because they are being observed, the
phenomenon is termed the _____ effect.
A.bias
B.confounding
C.observer
D.Hawthorne
D
3. Inattentional blindness can cause someone to miss something that is right before
their eyes, and this can alter the interpretation of results in psychological research.
This was demonstrated in the video about selective attention when m...
```

### ontent-ib688abb7-7458-4213-a7e3-713459396c06-section-4-summary-copy-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\сontent\ib688abb7-7458-4213-a7e3-713459396c06\Section 4 Summary - Copy.html

```text
Conclusion Page
Section 4 Summary
You have now completed Module 2 Section 4.
Next Steps
Using Section 3 and Section 4 as a  guideline, complete Assignment 4.  When you have completed the assignment, upload it to Brightspace.
Once you receive feedback you will be given access to the Module 2 Assessment. You do not need to complete this assessment before moving on with Module 3.
```

### ontent-i7d647901-2618-476b-8124-3ced6a0c2ffe-section-4-summary-copy-1-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\сontent\i7d647901-2618-476b-8124-3ced6a0c2ffe\Section 4 Summary - Copy (1).html

```text
Conclusion Page
Section 4 Summary
You have now completed Section 4 of Module 3.
Next Steps
Using content from Section 3 and Section 4 you can complete Assignment 6.  When you are done, submit your assignment to Brightspace.  Once you receive feedback from your teacher, you will be given access to the Module 3 Assessment.
```

### assignment-ia6dc540b-a53a-4ecf-b6f9-a7ae7bb792a7-attachments-nxt-ep30-m1-assessment-docx (docx/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\assignment\ia6dc540b-a53a-4ecf-b6f9-a7ae7bb792a7\attachments\NXT EP30 M1 Assessment.docx

```text
Experimental Psychology 30

____  /25

Module 1 Experimental Psychology Overview Assessment

Complete the following multiple-choice questions using the best possible answer.

1. What is the primary goal of experimental psychology?

A. To describe behavior

B. To explain behavior

C. To predict behavior

D. To control behavior

2. Which of the following best defines experimental psychology?

A. The study of individual case studies

B. The study of mental disorders

C. The systematic study of behavior and mental processes using controlled experiments

D. The exploration of human consciousness

3. In experimental psychology, what is a variable that researchers manipulate to observe its effect o...
```

### ontent-ie7294d02-e9d7-43ba-98c2-ebe7e10d249e-psychological-research-design-and-experiments-html (html/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\сontent\ie7294d02-e9d7-43ba-98c2-ebe7e10d249e\Psychological Research Design and Experiments.html

```text
Basic Page
Psychological Research Design
The research design is a specific plan the researcher(s) uses for the:
collection
analysis, and
interpretation of data.
The research design is often put together and presented as a research proposal before any research is conducted. A psychology research proposal is an academic document that a person submits to propose a research project, specifically in the field of clinical psychology. The purpose of research proposals is to outline the research questions and summarize your selected research topic. Another necessary reason for creating this proposal is to present ways that you think would be best in conducting the study and justifying it.
Research D...
```

### ontent-i367bef6c-bfa6-4a71-9bc0-7037394edca8-ep-outline-summer-school-pdf (pdf/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\сontent\i367bef6c-bfa6-4a71-9bc0-7037394edca8\EP outline (summer school).pdf

```text
Experimental Psychology 30
Next Step Summer School (780) 467-7929
dylan.shott@eips.ca
Course Description:
The focus of Experimental Psychology 30 is to provide an overview of the scientific approach to understanding human
behaviour and mental processes. The aim of the course is to familiarize students with methods and concepts used in
experimental psychology, including the key steps in the psychological research process. Throughout the course
students  are exposed to a variety of past and current psychological research and a practice project is completed to
experience  how the scientific method is applied in psychology. Students will be able to develop their skill to think more
like a  psych...
```

### ontent-i7244f5be-b6f1-4b97-9595-526ba159a3e3-data-analysis-and-checklist-review-html (html/textbook)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\сontent\i7244f5be-b6f1-4b97-9595-526ba159a3e3\Data Analysis and Checklist Review.html

```text
Basic Page
Data Analysis and Checklist Review
After viewing data in table or graph form, discerning relationships between variables is often easier.  As noted in Section Two of Module One, if one variable increases as another decreases, the variables are said to be negatively correlated.  If both variables change in the same direction, the variables are positively correlated.  If no obvious pattern is recognized in the data, no correlation may exist.
The strength of a correlation, however, can be distorted by poorly designed graphs.  You can use the checklists below when selecting a method of data display.  You will want to answer "yes" to all the questions.
An Effective Data Table?
An Effec...
```

### ontent-ib8ebd674-0dba-42e2-82e9-879b14215579-eating-and-behaviour-html (html/textbook)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\сontent\ib8ebd674-0dba-42e2-82e9-879b14215579\Eating and Behaviour.html

```text
Basic Page
Eating and Behaviour
According to Wansink (2006), "we eat largely because of what's around us.  We overeat not because of hunger but because of family and friends, packages and plates, names and numbers, labels and lights, colors and candles, shapes and smells, distractions and distances, cupboards and containers."  Wansink knows this because of his extensive research and experimentation into the psychology of eating behaviours.
Wansink, a professor of marketing, became interested in doing research after he was asked a question about magazine covers.  The director of editorial research of a popular magazine asked Wansink which magazine cover of four would sell the most copies and ...
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
