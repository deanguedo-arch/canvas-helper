# Prompt Pack

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Generated: 2026-03-23T14:37:01.761Z

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
  "id": "d4944777-3a5e-4045-b0f3-7d99d88c9c55",
  "slug": "experimental-psych-30-per-1-a-b-sec-s-202632352",
  "sourcePath": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/processed/experimental-psych-30-per-1-a-b-sec-s-202632352/source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/index.html",
  "rawEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/raw/original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-23T14:37:01.746Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/index.html",
  "canonicalSources": [
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/index.html",
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js"
  ],
  "generatedOutputs": [
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/course-shell-data.js"
  ],
  "regenerateCommand": "npm run build:course-shell -- --project experimental-psych-30-per-1-a-b-sec-s-202632352",
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/processed/experimental-psych-30-per-1-a-b-sec-s-202632352/source",
    "importedAt": "2026-03-23T14:33:43.141Z"
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
  "sourceOfTruthNotes": "Edit workspace sources listed in canonicalSources. Treat generated outputs such as course-shell-data.js and runtime bundles as derived output.",
  "createdAt": "2026-03-23T14:33:43.141Z",
  "updatedAt": "2026-03-23T14:37:01.746Z"
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
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/assignment/i242a11fc-d3bc-4d80-a199-88b88de1783e/assignment_41acbc22-5ab0-48d5-9d58-9e9c8da81b2d.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment ef94e360 31de 45d5 a58a 8f3547687ab2 (assessment)
- Authority: assessment-authoritative
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/assignment/i41c72f5e-05ad-4dfa-b349-8bdf48518cbe/assignment_ef94e360-31de-45d5-a58a-8f3547687ab2.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 66c3ed6c f6ef 4c50 94fb 6e3713246afd (assessment)
- Authority: assessment-authoritative
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/assignment/i7c7ef5d8-18ec-4ae9-acc7-5a77dd9c9901/assignment_66c3ed6c-f6ef-4c50-94fb-6e3713246afd.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### Experimental Psychology 30 ____ /22 Module 3 Conducting Research Assessment (assessment)
- Authority: assessment-authoritative
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/assignment/i7c7ef5d8-18ec-4ae9-acc7-5a77dd9c9901/attachments/NXT EP30 M3 Assessment.docx
- Extraction: indexed via native
- Chunks: 5
- Signals: filename:assignment, text:assessment, text:what-is

### assignment a4550875 c858 4fb0 a355 82a71cd9fc14 (assessment)
- Authority: assessment-authoritative
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/assignment/i8e175f73-25a4-4724-9716-cd78e3fa28ed/assignment_a4550875-c858-4fb0-a355-82a71cd9fc14.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 8f621710 8497 4f4f 80b8 1eb9c28c8098 (assessment)
- Authority: assessment-authoritative
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/assignment/ia6dc540b-a53a-4ecf-b6f9-a7ae7bb792a7/assignment_8f621710-8497-4f4f-80b8-1eb9c28c8098.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### Experimental Psychology 30 ____ /25 Module 1 Experimental Psychology Overview Assessment (assessment)
- Authority: assessment-authoritative
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/assignment/ia6dc540b-a53a-4ecf-b6f9-a7ae7bb792a7/attachments/NXT EP30 M1 Assessment.docx
- Extraction: indexed via native
- Chunks: 5
- Signals: filename:overview, text:outcomes, filename:assignment, text:assessment, text:what-is

### assignment 14189afb 63e6 45ed 8733 b2ee1d79ad70 (assessment)
- Authority: assessment-authoritative
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/assignment/ib1ab8554-0f40-48d5-987c-bb332c31336d/assignment_14189afb-63e6-45ed-8733-b2ee1d79ad70.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project experimental-psych-30-per-1-a-b-sec-s-202632352`

## Course Blueprint Summary

### Unit 1: Experimental Psychology 30 Next Step Summer School (780) 467-7929
- Outcomes: some scientists, the most problematic statistical illusion relates to observational studies in which correlation is often confused with causation. For example, you may have heard the statement that people who consume a moderate amount of alcohol have less heart disease than people who consume either no alcohol or too much alcohol. People who report the news might inadvertently present this information in such a way that the public is led to believe that alcohol prevents heart disease. In fact, this claim cannot be made. Correlation is not causation
- Linked assessments: ontent-icda9abd0-32c4-4e1f-a530-b7e61fcf2334-key-ep30-assignment-1-pdf, assignment-ia6dc540b-a53a-4ecf-b6f9-a7ae7bb792a7-attachments-nxt-ep30-m1-assessment-docx, assignment-i7c7ef5d8-18ec-4ae9-acc7-5a77dd9c9901-attachments-nxt-ep30-m3-assessment-docx, assignment-ifce37e56-0e7e-41cb-8976-efb3e53a452e-attachments-nxt-ep30-m2-assessment-docx, ontent-ifeab108d-9d65-4fc6-951f-635464238894-key-ep30-assignment-3-1-pdf, ontent-i8a050c03-71f5-4969-bed4-0233c74b8fe4-key-ep30-assignment-4-pdf, ontent-ib688abb7-7458-4213-a7e3-713459396c06-section-4-summary-copy-html, ontent-i7d647901-2618-476b-8124-3ced6a0c2ffe-section-4-summary-copy-1-html, ontent-i1fa15d3d-8803-4284-a871-1df0ac7810b5-lab-report-diamond-exceeds-pdf, ontent-iad7d66f5-c213-4c97-9543-9c5c9bb90a28-lab-report-not-yet-meeting-pdf, ontent-ibef8f47b-d1cb-443c-b13b-425dee55926e-lab-report-remedial-pdf, ontent-ifab7b62a-552d-4593-86c5-6d5fa1563475-lab-report-meets-pdf, ontent-i78ce9f26-410d-4f30-a9d6-57c585745b29-how-to-be-successful-in-an-independent-study-course-pdf
- Must know: some scientists, the most problematic statistical illusion relates to observational studies in which correlation is often confused with causation. For example, you may have heard the statement that people who consume a moderate amount of alcohol have less heart disease than people who consume either no alcohol or too much alcohol. People who report the news might inadvertently present this information in such a way that the public is led to believe that alcohol prevents heart disease. In fact, this claim cannot be made. Correlation is not causation
- Assessed skills: compare, define, explain, provide, show, summarize, complete, create
- Mandatory vocabulary: Achievement, Analysis, Assessments, Check, Communication, Completed, Credit, Data

## Assessment Map Summary

### Experimental Psychology 30 ____ /22 Module 3 Conducting Research Assessment (written-response)
- Deliverable: Completed written responses
- Skill verbs: complete, provide, compare, show, support, define, explain, summarize
- Related units: unit-1
- Related outcomes: unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3
- Failure points: Students may attempt to complete without using the required vocabulary or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may describe items separately without making the actual comparison explicit.; Students may attempt to show without using the required vocabulary or evidence.; Students may attempt to support without using the required vocabulary or evidence.; Students may name terms correctly but fail to connect them to examples or evidence.

### Experimental Psychology 30 ____ /25 Module 1 Experimental Psychology Overview Assessment (written-response)
- Deliverable: Completed written responses
- Skill verbs: explain, identify, provide, analyze, complete, describe, design, predict
- Related units: unit-1
- Related outcomes: unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3
- Failure points: Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.; Students may attempt to describe without using the required vocabulary or evidence.; Students may attempt to design without using the required vocabulary or evidence.

### Experimental Psychology 30 ____ /25 Module 2 Statistics Assessment (written-response)
- Deliverable: Completed written responses
- Skill verbs: design, complete, provide, compare, define, explain, show, summarize
- Related units: unit-1
- Related outcomes: unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3
- Failure points: Students may attempt to design without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may describe items separately without making the actual comparison explicit.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may give surface summaries instead of cause-and-effect or evidence-based explanations.

### Rubric – Lab Report Categories and Descriptors Reprinted (with Authorization) from Corwin Press Inc. (rubric)
- Deliverable: Work product that satisfies rubric criteria
- Skill verbs: provide, compare, define, explain, show, summarize, complete, create
- Related units: unit-1
- Related outcomes: unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3
- Failure points: Students may attempt to provide without using the required vocabulary or evidence.; Students may describe items separately without making the actual comparison explicit.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may attempt to show without using the required vocabulary or evidence.; Students may attempt to summarize without using the required vocabulary or evidence.

### Reliability and Validity Reliability can be divided into three categories: test-retest, internal, and inter-rater. (written-response)
- Deliverable: Completed written responses
- Skill verbs: respond, compare, define, explain, provide, show, summarize, complete
- Related units: unit-1
- Related outcomes: unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3
- Failure points: Students may attempt to respond without using the required vocabulary or evidence.; Students may describe items separately without making the actual comparison explicit.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may attempt to provide without using the required vocabulary or evidence.; Students may attempt to show without using the required vocabulary or evidence.

### Steps to FDA Approval Phase Test Group (written-response)
- Deliverable: Completed written responses
- Skill verbs: apply, assess, identify, provide, compare, define, explain, show
- Related units: unit-1
- Related outcomes: unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3
- Failure points: Students may attempt to apply without using the required vocabulary or evidence.; Students may attempt to assess without using the required vocabulary or evidence.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may describe items separately without making the actual comparison explicit.; Students may give surface summaries instead of cause-and-effect or evidence-based explanations.

## Lesson Packet Summary

### Unit 1: Experimental Psychology 30 Next Step Summer School (780) 467-7929: some scientists, the most problematic statistical illusion relates to observational studies in which correlation is often confused with causation. For example, you may have heard the statement that people who consume a moderate amount of alcohol have less heart disease than people who consume either no alcohol or too much alcohol. People who report the news might inadvertently present this information in such a way that the public is led to believe that alcohol prevents heart disease. In fact, this claim cannot be made. Correlation is not causation
- Outcomes: some scientists, the most problematic statistical illusion relates to observational studies in which correlation is often confused with causation. For example, you may have heard the statement that people who consume a moderate amount of alcohol have less heart disease than people who consume either no alcohol or too much alcohol. People who report the news might inadvertently present this information in such a way that the public is led to believe that alcohol prevents heart disease. In fact, this claim cannot be made. Correlation is not causation
- Linked assessments: assignment-i7c7ef5d8-18ec-4ae9-acc7-5a77dd9c9901-attachments-nxt-ep30-m3-assessment-docx, assignment-ia6dc540b-a53a-4ecf-b6f9-a7ae7bb792a7-attachments-nxt-ep30-m1-assessment-docx, assignment-ifce37e56-0e7e-41cb-8976-efb3e53a452e-attachments-nxt-ep30-m2-assessment-docx, ontent-i1fa15d3d-8803-4284-a871-1df0ac7810b5-lab-report-diamond-exceeds-pdf, ontent-i267ddcde-b272-41de-9e4e-e8b0ce8ba6ea-reliability-and-validity-html, ontent-i420a7eaa-b0e9-4ec4-b0b0-2cffeaab8929-approval-process-html
- Core concepts: Will, Psychology, Experimental, Research, Teacher, Eips, Completed, Credit
- Guided practice: Model how to compare using the lesson vocabulary and one cited source example.; Walk through one written-response prompt from Experimental Psychology 30 ____ /22 Module 3 Conducting Research Assessment and annotate what a successful response has to include.
- Readiness evidence: Student can compare Will accurately without reverting to chapter-note summary.; Student uses Achievement, Analysis, Assessments in context.

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
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/processed/experimental-psych-30-per-1-a-b-sec-s-202632352/source

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-03-23T14:33:43.141Z
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/processed/experimental-psych-30-per-1-a-b-sec-s-202632352/source

## Actions
- Detected "сontent/i12be43f5-1bc7-4efe-9f21-ce86c2764360/Step 8 Sources of Error and Suggestions for Improvement.html" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Copied 8 local asset reference(s) into the raw project copy.
- Copied 8 local asset reference(s) into the workspace.
- Copied 271 supporting file(s) into projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/.
- Indexed the imported supporting material into projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/_extracted/.
- Learned project patterns (/Users/deanguedo/Documents/GitHub/canvas-helper/.runtime/pattern-bank/auto/experimental-psych-30-per-1-a-b-sec-s-202632352.json).
- Updated local pattern bank (1 profile(s)).
- Generated prompt pack (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/prompt-pack.md).

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

### ontent-icda9abd0-32c4-4e1f-a530-b7e61fcf2334-key-ep30-assignment-1-pdf (pdf/assessment)
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/сontent/icda9abd0-32c4-4e1f-a530-b7e61fcf2334/KEY EP30 Assignment 1.pdf

```text
KEY
Experimental Psychology 30 - Assignment 1(29 Marks)
Part One:  Multiple-Choice Questions(9 marks)
LetterStatement
Use the following information to answer multiple-choice questions 1 and 2.
Correlation
A study was conducted on a group of second grade children.  Researchers tested the
students’ aptitudes in reading comprehension and math problem-solving skills.  The
researchers found a correlation value (r) of +0.86.
D
1.What is the strength of the relationship?
A.Weak
B.  Moderate
C.  Moderately strong
D.  Very strong
C
2.   The r value means that
A.  reading comprehension causes high scores in math
B.  high scores in math cause students to comprehend what they read
C.  reading comprehens...
```

### ontent-i367bef6c-bfa6-4a71-9bc0-7037394edca8-ep-outline-summer-school-pdf (pdf/outline)
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/сontent/i367bef6c-bfa6-4a71-9bc0-7037394edca8/EP outline (summer school).pdf

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
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/сontent/i7244f5be-b6f1-4b97-9595-526ba159a3e3/Data Analysis and Checklist Review.html

```text
Basic Page
Data Analysis and Checklist Review
After viewing data in table or graph form, discerning relationships between variables is often easier.  As noted in Section Two of Module One, if one variable increases as another decreases, the variables are said to be negatively correlated.  If both variables change in the same direction, the variables are positively correlated.  If no obvious pattern is recognized in the data, no correlation may exist.
The strength of a correlation, however, can be distorted by poorly designed graphs.  You can use the checklists below when selecting a method of data display.  You will want to answer "yes" to all the questions.
An Effective Data Table?
An Effec...
```

### ontent-ib8ebd674-0dba-42e2-82e9-879b14215579-eating-and-behaviour-html (html/textbook)
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/сontent/ib8ebd674-0dba-42e2-82e9-879b14215579/Eating and Behaviour.html

```text
Basic Page
Eating and Behaviour
According to Wansink (2006), "we eat largely because of what's around us.  We overeat not because of hunger but because of family and friends, packages and plates, names and numbers, labels and lights, colors and candles, shapes and smells, distractions and distances, cupboards and containers."  Wansink knows this because of his extensive research and experimentation into the psychology of eating behaviours.
Wansink, a professor of marketing, became interested in doing research after he was asked a question about magazine covers.  The director of editorial research of a popular magazine asked Wansink which magazine cover of four would sell the most copies and ...
```

### ontent-i3c036fe5-ba8f-44c8-858c-deeb43baf36f-experimental-research-html (html/textbook)
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/сontent/i3c036fe5-ba8f-44c8-858c-deeb43baf36f/Experimental Research.html

```text
Basic Page
Experimental Research
The experimental method is the only method that requires researchers to use the scientific method.  The researcher manipulates a variable (anything that can vary) under highly controlled conditions to see if this produces (causes) any change to a second variable.  The variable that the researcher manipulates is called the independent variable or manipulated variable. The variable measured for change is the dependent variable or responding variable. More information on variables and the scientific method is found in Section Three of this module.
Strengths and Weaknesses of Experimental Research
Strengths of Experimental Research:  The main benefit of this meth...
```

### ontent-i5a0d1973-84ec-4044-a5ef-f16d4e620ff0-history-of-experimental-psychology-html (html/other)
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/сontent/i5a0d1973-84ec-4044-a5ef-f16d4e620ff0/History of Experimental Psychology.html

```text
History of Experimental Psychology
Wilhelm Wundt (1832-1920) and Gustav Fechner (1801-1887) are considered the originators of experimental psychology.  Before Fechner and Wundt began their research, psychology was focused in the realms of physiology and philosophy instead of experimentation.  Fechner performed his research with scientific rigour and it was this rigour which laid the foundations for experimental psychology as we know it today.  This new psychology was based on the scientific method.  Wundt was the first person to call himself a psychologist and the first person to formally establish a psychology laboratory in Leibzig, Germany.
With the expansion of psychology as a discipline ...
```

### ontent-iecfb71ba-aeec-4f6f-afef-68d7c9c6152e-key-ep30-assignment-2-pdf (pdf/assessment)
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/сontent/iecfb71ba-aeec-4f6f-afef-68d7c9c6152e/KEY EP30 Assignment 2.pdf

```text
ANSWER KEY
Experimental Psychology 30 - Assignment 2
/31
Part One:  Multiple-Choice Questions(8 marks)
LetterStatement
All Case Studies used in this assignment are summarized fromMindless Eatingby Brian
Wansink.  UseCase Study Ato answer multiple-choicequestions 1, 2, and 3.
Case Study A
Billy, a galley cook on a Navy ship, was facing daily complaints from the crew about the lemon Jell-O he was serving.
Because of an ordering error, lemon was the only flavour of Jell-O purchased for consumption during the four-month
exercise.  There was no cherry Jell-O and the crew was unhappy.  Because the ship was not going to be in port (land) for
another two months, Billy had to act in a creative manner...
```

### ontent-ifeab108d-9d65-4fc6-951f-635464238894-key-ep30-assignment-3-1-pdf (pdf/assessment)
- Source: /Users/deanguedo/Documents/GitHub/canvas-helper/projects/resources/experimental-psych-30-per-1-a-b-sec-s-202632352/сontent/ifeab108d-9d65-4fc6-951f-635464238894/KEY EP30 - Assignment 3 (1).pdf

```text
ANSWER KEY
Experimental Psychology 30 - Assignment 3
/34
Part One:  Multiple-Choice Questions(14 marks)
LetterStatement
The following questions require you to have completed the first three topics in theCentral Tendencies
Exercisefrom the LearnAlberta website.  If you havenot already completed the exercises, please do so
before attempting the following multiple-choice questions.  Indicate the letter of your choice of each BEST
answer.
Questions 1 to 3 refer to the hockey example.
C
1.
The mean score was                20 goals/5games = 4
A.
2
B.
3
C.
4
D.
5
A
2.
The mode was         2 out of the 5 games had2 goals therefore most frequent # of
goals was 2
A.
2
B.
3
C.
4
D.
5
C
3.
The median w...
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
