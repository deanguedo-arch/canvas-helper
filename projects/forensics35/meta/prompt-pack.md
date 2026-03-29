# Prompt Pack

- Project: forensics35
- Generated: 2026-03-29T14:10:42.045Z

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
  "id": "74bb82fa-ebed-44b8-8dcf-ceaa6e21df03",
  "slug": "forensics35",
  "sourcePath": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/processed/forensics35/source",
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
  "learningUpdatedAt": "2026-03-18T20:17:29.541Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\forensics35\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\forensics35\\workspace\\index.html",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\forensics35\\workspace\\main.jsx",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\forensics35\\workspace\\main.js",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\forensics35\\workspace\\course-shell-data.js",
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\forensics35\\workspace\\d2l-map-data.js"
  ],
  "generatedOutputs": [],
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "brightspace",
    "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas helper\\projects\\processed\\forensics35\\source"
  },
  "exportTargets": [
    {
      "target": "brightspace",
      "enabled": true
    },
    {
      "target": "google-hosted",
      "enabled": true
    }
  ],
  "authoringStatus": "active",
  "referenceOnly": [],
  "sourceOfTruthNotes": "Edit workspace sources only. Keep raw/exports immutable and regenerate hosted output via export scripts.",
  "createdAt": "2026-03-18T14:44:01.332Z",
  "updatedAt": "2026-03-29T00:53:39.046Z",
  "workspaceApprovedAt": "2026-03-29T00:53:39.046Z"
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

- Course title: 23-24 | Forensic Studies 35 | Per 1(A-B) | Sec S3
- Modules: 10
- Items: 266
- Lessons: 7
- Assignments: 6
- Quizzes: 32
- PDFs: 17
- HTML pages: 169
Top modules:
- Course Information (4 direct items)
- 1. Forensic Toxicology (11 direct items)
- 2. Law Enforcement Equipment (11 direct items)
- 3. Arson and Explosives (11 direct items)
- 4. Forensic Ballistics (11 direct items)
- 5. Criminal Profiling (11 direct items)
- 6. Anthropology and Entomology (11 direct items)
- 7. Final Exam (3 direct items)

## Course Blueprint Summary

### Forensic Toxicology Overview Module Learner Objectives
- Outcomes: analyze historical crime cases and/or fictional crime cases that involves forensic toxicology; explain how the toxicological testing technique of mass spectrometry is used to confirm the presence of specific drugs or poisons within the human body; identify various types of poisons (e.g., cyanide, carbon monoxide, arsenic, strychnine) and their harmful side-effects upon the human body
- Linked assessments: ontent-ie9f2b656-c9d8-4fee-9ac1-6bbd550d946e-forensics-35-ab01-key-pdf, ontent-i52456243-2654-4885-942e-a9f26c5bf4cb-nxt-fs35-3-module-1-assignment-pdf, ontent-idbc9f9eb-37f0-4020-9d9c-de65b2c232aa-nxt-fs35-m1-assignment-answer-key-docx, ontent-i6ba75a57-bb56-40b1-9727-51576d8d6b4c-forensics-35-ab06-key-pdf, ontent-idfe46fee-6d79-4f80-a7e2-67c388101569-forensics-35-ab05-key-pdf, ontent-i08f89347-30da-4099-baaa-8f3bc3afae82-module-4-assignment-online-html, ontent-idb266520-4da3-4db1-ac56-65cd81982e71-module-6-assignment-online-html, ontent-i7b309871-a372-4cf2-b08a-cf4d4b1ce691-forensics-35-ab03-key-pdf, ontent-i85fabbb6-cd20-40d6-a26d-48effc136e3a-forensics-35-ab04-key-pdf, ontent-ib1ff4a56-96e9-497e-ad09-cd540a83ab86-forensics-35-ab02-key-pdf, ontent-iae1ba046-a520-46a2-a0d7-b11c6cbefc06-module-1-assignment-online-html, ontent-i943b7b99-513c-43db-8867-d0ae4ff0ec19-module-5-assignment-online-html, ontent-i2d93491b-9486-496f-93d5-1da498a68375-nxt-fs35-3-module-3-assignment-copy-pdf, ontent-i11dc3b58-7fab-4f69-bc85-44133b04f33d-nxt-fs35-3-module-4-assignment-pdf, ontent-i413e11fe-ec10-4433-9105-ed56cd2480dd-nxt-fs35-3-module-5-assignment-pdf, ontent-if764fb3b-c224-4652-8384-7abcb395f836-nxt-fs35-3-module-6-assignment-pdf, ontent-id7e4717a-786f-4019-874a-8321d2ee7fc9-nxt-fs35-3-module-4-assignment-answer-key-pdf, ontent-i45b5c2ec-3cf3-4e20-941d-5273ae5f096a-module-3-assessment-html, ontent-ibf9b10f2-3e30-4823-954b-fb1bbc545481-content-lesson-33-page-258-html
- Must know: analyze historical crime cases and/or fictional crime cases that involves forensic toxicology; explain how the toxicological testing technique of mass spectrometry is used to confirm the presence of specific drugs or poisons within the human body; identify various types of poisons (e.g., cyanide, carbon monoxide, arsenic, strychnine) and their harmful side-effects upon the human body; understand the mechanics of various toxicology testing procedures used to screen for drugs or poisons (e.g., color testing, microcrystalline testing, immunoassay testing, gas chromatography)
- Assessed skills: list, provide, complete, identify, apply, describe, explain, analyze
- Mandatory vocabulary: Body, Cases, Crime, Crimes, Drug, Drugs, Effects, Forensic

## Assessment Map Summary

### Module 4 Assignment (Online) (assignment)
- Deliverable: Submitted assignment responses
- Skill verbs: list, provide, complete, identify, apply, describe, explain, analyze
- Related units: unit-1
- Related outcomes: unit-1--analyze-historical-crime-cases-and-or-fictional-crime-cases-that-involves-forensic-toxicology, unit-1--explain-how-the-toxicological-testing-technique-of-mass-spectrometry-is-used-to-confirm-the-presence-of-specific-drugs-or-poisons-within-the-human-body, unit-1--identify-various-types-of-poisons-e-g-cyanide-carbon-monoxide-arsenic-strychnine-and-their-harmful-side-effects-upon-the-human-body, unit-1--understand-the-mechanics-of-various-toxicology-testing-procedures-used-to-screen-for-drugs-or-poisons-e-g-color-testing-microcrystalline-testing-immunoassay-testing-gas-chromatography
- Failure points: Students may attempt to list without using the required vocabulary or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to apply without using the required vocabulary or evidence.; Students may attempt to describe without using the required vocabulary or evidence.

### Gun Residue Tests Paraffin Test Sodium Rhodizonate Test (written-response)
- Deliverable: Completed written responses
- Skill verbs: analyze, list, provide, complete, identify, apply, describe, explain
- Related units: unit-1
- Related outcomes: unit-1--analyze-historical-crime-cases-and-or-fictional-crime-cases-that-involves-forensic-toxicology, unit-1--explain-how-the-toxicological-testing-technique-of-mass-spectrometry-is-used-to-confirm-the-presence-of-specific-drugs-or-poisons-within-the-human-body, unit-1--identify-various-types-of-poisons-e-g-cyanide-carbon-monoxide-arsenic-strychnine-and-their-harmful-side-effects-upon-the-human-body, unit-1--understand-the-mechanics-of-various-toxicology-testing-procedures-used-to-screen-for-drugs-or-poisons-e-g-color-testing-microcrystalline-testing-immunoassay-testing-gas-chromatography
- Failure points: Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may attempt to list without using the required vocabulary or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to apply without using the required vocabulary or evidence.

### Forensic Studies 35-3 Name: Module 4 Assignment: Forensic Ballistics (assignment)
- Deliverable: Submitted assignment responses
- Skill verbs: explain, identify, describe, discuss, analyze, justify, list, provide
- Related units: unit-1
- Related outcomes: unit-1--explain-how-the-toxicological-testing-technique-of-mass-spectrometry-is-used-to-confirm-the-presence-of-specific-drugs-or-poisons-within-the-human-body, unit-1--explain-how-combustion-differs-from-an-explosion, unit-1--analyze-historical-crime-cases-and-or-fictional-crime-cases-that-involves-forensic-toxicology, unit-1--identify-various-types-of-poisons-e-g-cyanide-carbon-monoxide-arsenic-strychnine-and-their-harmful-side-effects-upon-the-human-body
- Failure points: Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to describe without using the required vocabulary or evidence.; Students may attempt to discuss without using the required vocabulary or evidence.; Students may provide unsupported opinions instead of organized, criteria-aligned responses.; Students may attempt to list without using the required vocabulary or evidence.

### Forensic Studies 35-3 Name: Module 3 Assignment: Arson and Explosives (assignment)
- Deliverable: Submitted assignment responses
- Skill verbs: describe, explain, identify, list, provide, complete, apply, analyze
- Related units: unit-1
- Related outcomes: unit-1--identify-and-describe-various-types-of-explosive-devices-including-gunpowder-dynamite-nitroglycerin-saltpetre-guncotton-tnt-petn-picric-acid-plastic-explosives, unit-1--identify-various-motivations-for-arson-and-possible-strategies-to-eliminate-this-crime, unit-1--explain-how-the-toxicological-testing-technique-of-mass-spectrometry-is-used-to-confirm-the-presence-of-specific-drugs-or-poisons-within-the-human-body, unit-1--compare-the-numbers-of-human-fatalities-and-human-injuries-caused-by-arson-using-graphed-data
- Failure points: Students may attempt to describe without using the required vocabulary or evidence.; Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to list without using the required vocabulary or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.

### Forensic Studies 35-3 Name: Module 5 Assignment: Criminal Profiling (assignment)
- Deliverable: Submitted assignment responses
- Skill verbs: identify, explain, support, describe, create, discuss, list, provide
- Related units: unit-1
- Related outcomes: unit-1--identify-the-components-necessary-for-a-combustion-reaction, unit-1--identify-the-three-basic-components-of-an-explosive-device-fuel-source-oxidizer-and-ignition, unit-1--identify-various-motivations-for-arson-and-possible-strategies-to-eliminate-this-crime, unit-1--analyze-historical-crime-cases-and-or-fictional-crime-cases-that-involves-forensic-toxicology
- Failure points: Students may name terms correctly but fail to connect them to examples or evidence.; Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may attempt to support without using the required vocabulary or evidence.; Students may attempt to describe without using the required vocabulary or evidence.; Students may attempt to create without using the required vocabulary or evidence.; Students may attempt to discuss without using the required vocabulary or evidence.

### Forensic Studies 35-3ANSWER KEY Name: Module 3 Assignment: Arson and Explosives (assignment)
- Deliverable: Submitted assignment responses
- Skill verbs: describe, explain, identify, list, provide, complete, apply, analyze
- Related units: unit-1
- Related outcomes: unit-1--compare-the-numbers-of-human-fatalities-and-human-injuries-caused-by-arson-using-graphed-data, unit-1--identify-and-describe-various-types-of-explosive-devices-including-gunpowder-dynamite-nitroglycerin-saltpetre-guncotton-tnt-petn-picric-acid-plastic-explosives, unit-1--identify-the-three-basic-components-of-an-explosive-device-fuel-source-oxidizer-and-ignition, unit-1--identify-various-motivations-for-arson-and-possible-strategies-to-eliminate-this-crime
- Failure points: Students may attempt to describe without using the required vocabulary or evidence.; Students may give surface summaries instead of cause-and-effect or evidence-based explanations.; Students may name terms correctly but fail to connect them to examples or evidence.; Students may attempt to list without using the required vocabulary or evidence.; Students may attempt to provide without using the required vocabulary or evidence.; Students may attempt to complete without using the required vocabulary or evidence.

## Lesson Packet Summary

No lesson packet files were available to summarize.

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

- Extracted chunk text missing.

### ontent-i7b309871-a372-4cf2-b08a-cf4d4b1ce691-forensics-35-ab03-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\i7b309871-a372-4cf2-b08a-cf4d4b1ce691\Forensics_35_AB03_Key.pdf

- Extracted chunk text missing.

### ontent-i85fabbb6-cd20-40d6-a26d-48effc136e3a-forensics-35-ab04-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\i85fabbb6-cd20-40d6-a26d-48effc136e3a\Forensics_35_AB04_Key.pdf

- Extracted chunk text missing.

### ontent-ib1ff4a56-96e9-497e-ad09-cd540a83ab86-forensics-35-ab02-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\ib1ff4a56-96e9-497e-ad09-cd540a83ab86\Forensics_35_AB02_Key.pdf

- Extracted chunk text missing.

### ontent-idfe46fee-6d79-4f80-a7e2-67c388101569-forensics-35-ab05-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\idfe46fee-6d79-4f80-a7e2-67c388101569\Forensics_35_AB05_Key.pdf

- Extracted chunk text missing.

### ontent-ie9f2b656-c9d8-4fee-9ac1-6bbd550d946e-forensics-35-ab01-key-pdf (pdf/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\ie9f2b656-c9d8-4fee-9ac1-6bbd550d946e\Forensics_35_AB01_Key.pdf

- Extracted chunk text missing.

### ontent-i5b868f43-fb54-4dee-8384-cd5a40dae987-module-2-assignment-online-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\i5b868f43-fb54-4dee-8384-cd5a40dae987\Module 2 Assignment (Online).html

- Extracted chunk text missing.

### ontent-id8143c17-8c3c-4511-a1d2-cfb13de39cca-module-3-assignment-online-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\forensics35\сontent\id8143c17-8c3c-4511-a1d2-cfb13de39cca\Module 3 Assignment (Online).html

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
