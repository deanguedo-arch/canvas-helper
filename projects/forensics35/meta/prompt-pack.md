# Prompt Pack

- Project: forensics35
- Generated: 2026-03-18T14:44:06.337Z

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
  "id": "74bb82fa-ebed-44b8-8dcf-ceaa6e21df03",
  "slug": "forensics35",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\forensics35\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\forensics35\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\forensics35\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-18T14:44:06.308Z",
  "createdAt": "2026-03-18T14:44:01.332Z",
  "updatedAt": "2026-03-18T14:44:06.308Z",
  "workspaceApprovedAt": "2026-03-18T14:44:06.308Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: other: 307; assessment: 84; outline: 12; textbook: 7; teacher-note: 1.

## Resource Catalog Summary

### assignment 47c57ef5 f797 429b 8a84 73246e9fc1d9 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\assignment\i0d13383d-713c-4b67-989e-833b135fa42b\assignment_47c57ef5-f797-429b-8a84-73246e9fc1d9.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 8715ada3 b323 4c65 b3b0 2f862bf16119 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\assignment\i2d9c8718-037d-422f-ba3e-fe55e0111030\assignment_8715ada3-b323-4c65-b3b0-2f862bf16119.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment f472e564 10f8 4b02 a05f 28d147d97773 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\assignment\i3acf59cc-be15-4305-a21e-1cf2237ee486\assignment_f472e564-10f8-4b02-a05f-28d147d97773.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment cf3b343e b244 4ba4 9aac 34c3deb73207 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\assignment\i431c722d-b304-40b7-8c7e-4ab0dfe60987\assignment_cf3b343e-b244-4ba4-9aac-34c3deb73207.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment ff4a62e3 8119 4045 9b16 f1ecb70a7b22 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\assignment\i6928e61b-0e33-4c30-96be-9a2513ff8161\assignment_ff4a62e3-8119-4045-9b16-f1ecb70a7b22.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### assignment 1b34dbb8 5ef7 4914 b9ab f53995f44c2e (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\assignment\i6c7fd40f-05be-475b-919a-c7e1bde19f75\assignment_1b34dbb8-5ef7-4914-b9ab-f53995f44c2e.xml
- Extraction: stored-only
- Chunks: 0
- Signals: filename:assignment

### imsmanifest (other)
- Authority: supporting-only
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\imsmanifest.xml
- Extraction: stored-only
- Chunks: 0
- Signals: none

### PastedImage o8k0z4vqkq63o3wcynr7lmg9siemit7r0014934821 (assessment)
- Authority: assessment-authoritative
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\quiz\i03ba268d-525c-448a-99c0-ee8270a47a0e\PastedImage_o8k0z4vqkq63o3wcynr7lmg9siemit7r0014934821.png
- Extraction: stored-only
- Chunks: 0
- Signals: filename:quiz

## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project forensics35`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project forensics35`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project forensics35`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project forensics35`

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
- External dependencies preserved: https://eips.brightspace.com//content/enforced/16663-20-21_S1_ForensicStudies35_Per1(A)_Sec/stop-emoticon.jpg?_&amp;d2lSessionVal=cnyUdyos4v2jatdhc8LWT61aC&amp;ou=16663

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

- Project: forensics35
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\forensics35

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-03-18T14:44:01.332Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\incoming\forensics35

## Actions
- Detected "сontent/i2dfd85cb-a6c4-4a98-8710-2d1d7fb3da73/Module 2 Assessment.html" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Copied 411 supporting file(s) into projects/resources/forensics35/.
- Indexed the imported supporting material into projects/resources/forensics35/_extracted/.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\forensics35.json).
- Updated local pattern bank (22 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics35\meta\prompt-pack.md).

## Warnings
- Found 169 possible site files. Using "сontent/i2dfd85cb-a6c4-4a98-8710-2d1d7fb3da73/Module 2 Assessment.html" and treating the rest as supporting material.
```

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### ontent-i6ba75a57-bb56-40b1-9727-51576d8d6b4c-forensics-35-ab06-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\i6ba75a57-bb56-40b1-9727-51576d8d6b4c\Forensics_35_AB06_Key.pdf

```text
FOR STUDENT USE ONLY
(If label is missing or incorrect)
NameAddress
City/Town               Province               Postal               Code
Student’s Questions
and Comments
Apply Assignment Label Here
Please use the correct preprinted label for this
course and Assignment Booklet.
Teacher’s Comments
ALBERTA  DISTANCE  LEARNING  CENTRE
Forensic Science 35
Assignment Booklet 6
FOR ADLC USE ONLY
Assigned to
Marked by
Mark:                               %
Date Received:
File Number:
Summary
New February 2008
Teacher’s Signature
Total
Possible
Marks
Your
Marks
TOTAL
Lesson 1
Lesson 2
Lesson 3
Lesson 4
23
26
23
28
100
KEY
```

### ontent-i7b309871-a372-4cf2-b08a-cf4d4b1ce691-forensics-35-ab03-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\i7b309871-a372-4cf2-b08a-cf4d4b1ce691\Forensics_35_AB03_Key.pdf

```text
FOR STUDENT USE ONLY
(If label is missing or incorrect)
NameAddress
City/Town               Province               Postal               Code
Student’s Questions
and Comments
Apply Assignment Label Here
Please use the correct preprinted label for this
course and Assignment Booklet.
Teacher’s Comments
ALBERTA  DISTANCE  LEARNING  CENTRE
Forensic Science 35
Assignment Booklet 3
FOR ADLC USE ONLY
Assigned to
Marked by
Mark:                               %
Date Received:
File Number:
Summary
New February 2008
Teacher’s Signature
Total
Possible
Marks
Your
Marks
TOTAL
Lesson 1
Lesson 2
Lesson 3
Lesson 4
24
22
21
23
90
KEY
```

### ontent-i85fabbb6-cd20-40d6-a26d-48effc136e3a-forensics-35-ab04-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\i85fabbb6-cd20-40d6-a26d-48effc136e3a\Forensics_35_AB04_Key.pdf

```text
FOR STUDENT USE ONLY
(If label is missing or incorrect)
NameAddress
City/Town                Province                Postal                Code
Student’s Questions
and Comments
Apply Assignment Label Here
Please use the correct preprinted label for this
course and Assignment Booklet.
Teacher’s Comments
ALBERTA  DISTANCE  LEARNING  CENTRE
Forensic Science 35
Assignment Booklet 4
FOR ADLC USE ONLY
Assigned to
Marked by
Mark:                               %
Date Received:
File Number:
Summary
Reprint September 2008
Teacher’s Signature
Total
Possible
Marks
Your
Marks
TOTAL
Lesson 1
Lesson 2
Lesson 3
Lesson 4
23
23
20
24
90
KEY
```

### ontent-ib1ff4a56-96e9-497e-ad09-cd540a83ab86-forensics-35-ab02-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\ib1ff4a56-96e9-497e-ad09-cd540a83ab86\Forensics_35_AB02_Key.pdf

```text
FOR STUDENT USE ONLY
(If label is missing or incorrect)
NameAddress
City/Town               Province               Postal               Code
Student’s Questions
and Comments
Apply Assignment Label Here
Please use the correct preprinted label for this
course and Assignment Booklet.
Teacher’s Comments
ALBERTA  DISTANCE  LEARNING  CENTRE
Forensic Science 35
Assignment Booklet 2
FOR ADLC USE ONLY
Assigned to
Marked by
Mark:                               %
Date Received:
File Number:
Summary
New February 2008
Teacher’s Signature
Total
Possible
Marks
Your
Marks
TOTAL
Lesson 1
Lesson 2
Lesson 3
Lesson 4
23
19
23
20
85
KEY
```

### ontent-idfe46fee-6d79-4f80-a7e2-67c388101569-forensics-35-ab05-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\idfe46fee-6d79-4f80-a7e2-67c388101569\Forensics_35_AB05_Key.pdf

```text
FOR STUDENT USE ONLY
(If label is missing or incorrect)
NameAddress
City/Town               Province               Postal               Code
Student’s Questions
and Comments
Apply Assignment Label Here
Please use the correct preprinted label for this
course and Assignment Booklet.
Teacher’s Comments
ALBERTA  DISTANCE  LEARNING  CENTRE
Forensic Science 35
Assignment Booklet 5
FOR ADLC USE ONLY
Assigned to
Marked by
Mark:                               %
Date Received:
File Number:
Summary
New February 2008
Teacher’s Signature
Total
Possible
Marks
Your
Marks
TOTAL
Lesson 1
Lesson 2
Lesson 3
Lesson 4
20
25
23
22
90
KEY
```

### ontent-ie9f2b656-c9d8-4fee-9ac1-6bbd550d946e-forensics-35-ab01-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\ie9f2b656-c9d8-4fee-9ac1-6bbd550d946e\Forensics_35_AB01_Key.pdf

```text
FOR STUDENT USE ONLY
(If label is missing or incorrect)
NameAddress
City/Town                Province                Postal                Code
Student’s Questions
and Comments
Apply Assignment Label Here
Please use the correct preprinted label for this
course and Assignment Booklet.
Teacher’s Comments
ALBERTA  DISTANCE  LEARNING  CENTRE
Forensic Science 35
Assignment Booklet 1
FOR ADLC USE ONLY
Assigned to
Marked by
Mark:                               %
Date Received:
File Number:
Summary
Reprint September 2008
Teacher’s Signature
Total
Possible
Marks
Your
Marks
TOTAL
Lesson 1
Lesson 2
Lesson 3
Lesson 4
23
29
22
26
100
KEY
```

### ontent-i5b868f43-fb54-4dee-8384-cd5a40dae987-module-2-assignment-online-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\i5b868f43-fb54-4dee-8384-cd5a40dae987\Module 2 Assignment (Online).html

```text
Click on the following link to make a copy of the M2 Law Enforcement Equipment Assignment.
```

### ontent-id8143c17-8c3c-4511-a1d2-cfb13de39cca-module-3-assignment-online-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\id8143c17-8c3c-4511-a1d2-cfb13de39cca\Module 3 Assignment (Online).html

```text
Click on the following link to make a copy of the M3 Arson and Explosives Assignment.
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
