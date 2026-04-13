# Prompt Pack

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Generated: 2026-04-09T19:29:15.031Z

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
  "id": "3dbcc376-9ab4-4ffd-a6b8-dd15df4e4e77",
  "slug": "experimental-psych-30-per-1-a-b-sec-s-202632352",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\incoming\\experimental-psych-30-per-1-a-b-sec-s-202632352",
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
  "learningUpdatedAt": "2026-04-09T19:29:14.988Z",
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
  "updatedAt": "2026-04-09T19:29:14.988Z"
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

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project experimental-psych-30-per-1-a-b-sec-s-202632352`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project experimental-psych-30-per-1-a-b-sec-s-202632352`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project experimental-psych-30-per-1-a-b-sec-s-202632352`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project experimental-psych-30-per-1-a-b-sec-s-202632352`

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

> import-log.md: missing

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### ontent-iecfb71ba-aeec-4f6f-afef-68d7c9c6152e-key-ep30-assignment-2-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\сontent\iecfb71ba-aeec-4f6f-afef-68d7c9c6152e\KEY EP30 Assignment 2.pdf

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
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\сontent\ifeab108d-9d65-4fc6-951f-635464238894\KEY EP30 - Assignment 3 (1).pdf

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

### ontent-i4ad2ee24-9c63-4785-b430-45099312fd87-section-4-summary-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\сontent\i4ad2ee24-9c63-4785-b430-45099312fd87\Section 4 Summary.html

```text
Conclusion Page
Section 4 Summary
You have reached the end of Section 4. You are almost done Module 1.
Next Steps
Complete Assignment 2 that covers the concepts learned in Section 3 and Section 4.
When you have received feedback from your teacher, you will be provided with access to the Module 1 Assessment. Complete the assessment when you are ready (you do not need to complete the first assessment before moving on to Module 2).
```

### assignment-i7c7ef5d8-18ec-4ae9-acc7-5a77dd9c9901-attachments-nxt-ep30-m3-assessment-docx (docx/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\experimental-psych-30-per-1-a-b-sec-s-202632352\assignment\i7c7ef5d8-18ec-4ae9-acc7-5a77dd9c9901\attachments\NXT EP30 M3 Assessment.docx

```text
Experimental Psychology 30

____  /22

Module 3 Conducting Research Assessment

Complete the following multiple-choice questions using the best possible answer.

1. Which of the following sampling methods involves selecting every nth member of a population to be included in the sample?

A. Random sampling

B. Stratified sampling

C. Systematic sampling

D. Convenience sampling

2. A researcher wants to ensure that their sample reflects the diversity of a population. Which sampling method would be most appropriate?

A. Snowball sampling

B. Quota sampling

C. Cluster sampling

D. Judgment sampling

3. What is the primary advantage of using random sampling in research?

A. It is cost-effective...
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
