# Prompt Pack

- Project: general-psychology-20-independent-studies-202633108
- Generated: 2026-04-09T19:29:20.654Z

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
  "id": "c13d30c7-8def-414f-8a3c-6c1a5c5e7382",
  "slug": "general-psychology-20-independent-studies-202633108",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\incoming\\general-psychology-20-independent-studies-202633108",
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
  "learningUpdatedAt": "2026-04-09T19:29:20.610Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\index.html",
  "canonicalSources": [
    "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\general-psychology-20-independent-studies-202633108\\workspace\\index.html"
  ],
  "generatedOutputs": [],
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
  "sourceOfTruthNotes": "Edit workspace sources listed in canonicalSources. Treat generated exports and runtime bundles as derived output.",
  "createdAt": "2026-04-09T19:29:15.518Z",
  "updatedAt": "2026-04-09T19:29:20.610Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: textbook: 207; other: 150; assessment: 43; outline: 10; teacher-note: 1.

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

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project general-psychology-20-independent-studies-202633108`

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

> import-log.md: missing

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### ontent-i69540a89-fb5d-447f-be2e-73038977e5f4-content-lesson-683-page-5092-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\i69540a89-fb5d-447f-be2e-73038977e5f4\Content\Lesson_683\page_5092.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><div class="firstBlock">
<p>A criminal psychologist is a professional that studies the behaviors and thoughts of criminals. Interest in this career field has grown dramatically in recent years thanks to a number of popular television programs that depict fictionalized criminal psychologists, such as such as�<em>Criminal Minds</em>�and�<em>CSI</em>. The field is highly related to<a href="http://psychology.about.com/od/branchesofpsycholog1/f/forensicpsychology.htm" data-component="link" data-source="inlineLink" data-type="internalLink" data-ordinal="1">foren...
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

### ontent-ia2b65a17-7829-4500-b74a-6f18b3d9c39c-content-book-1818-chapter-15710-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\ia2b65a17-7829-4500-b74a-6f18b3d9c39c\Content\book_1818\chapter_15710.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><p align="center"><br><b><img width="157" height="139" alt="https://lh6.googleusercontent.com/g4FSREZpkYueHmXq2or481-0sy7kaBcOMN4s868u52eV23DLUDRM-qWfMyuAJplIjdypyS7muKytQn0bsaNXVa6RNFBKGtH-Px4HicjHwcTX8zlHFFvh543WLjpURxUbcjgZaxvX" src="..\image_chapter_15710.png" border="0" v:shapes="Picture_x0020_6"></b><br></p>
<p align="center">�</p><p align="center"><b>
Click on the purple link below and complete the Humanism�Quiz</b></p>
<h4 align="center"><strong><span style="color: rgb(51, 102, 255);"><a href="/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6811&amp...
```

### ontent-i1dab161a-aa78-4c81-9991-a55e4fe09e47-content-book-1818-chapter-15709-html (html/assessment)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\i1dab161a-aa78-4c81-9991-a55e4fe09e47\Content\book_1818\chapter_15709.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><br><p></p><p align="center"><br></p><p align="center"><img width="157" height="139" alt="https://lh6.googleusercontent.com/g4FSREZpkYueHmXq2or481-0sy7kaBcOMN4s868u52eV23DLUDRM-qWfMyuAJplIjdypyS7muKytQn0bsaNXVa6RNFBKGtH-Px4HicjHwcTX8zlHFFvh543WLjpURxUbcjgZaxvX" src="..\image_chapter_15709.png" border="0" v:shapes="Picture_x0020_2"></p><p align="center">
<br></p><p align="center"><span lang="EN"><b><i>Click on the purple link below and complete
the <a title="Freud" href="/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6811&amp;type=quiz&amp;rCode=6a3fa0d9a41...
```

### ontent-id942d3d8-476d-421c-95fe-f056bbbaf9c2-content-book-1818-chapter-15698-html (html/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\id942d3d8-476d-421c-95fe-f056bbbaf9c2\Content\book_1818\chapter_15698.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><h3><span style="font-size: 14px; line-height: 20px;">John Watson was an early leader in the Behaviourist movement in psychology.</span></h3>
<div class="no-overflow">
<p style="text-align: center;"><img src="http://image.slidesharecdn.com/behaviorism-150117004220-conversion-gate01/95/behaviorism-13-638.jpg?cb=1421477005" width="637" height="358" /></p>
<p>He was an extreme�environmentalist�which means he believed that human character, ability and intelligence are outcomes of our circumstances and experiences in life and that character is not inborn or inn...
```

### ontent-ice9ba344-0483-4453-8525-bb7205e7a1b9-content-book-1817-chapter-15686-html (html/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\ice9ba344-0483-4453-8525-bb7205e7a1b9\Content\book_1817\chapter_15686.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><p align="center"></p><h3></h3>
<h3 align="center"><img width="177" height="161" src="https://cdn.psychologytoday.com/files/u45/goal.jpg"></h3>
<h4 align="center"><strong>As a science, psychology has some important goals to achieve.</strong></h4>
<div>
</div><p><br></p><div>
</div><p align="center">First, psychology must <strong>observe and record facts</strong> in order to understand what is happening. The goal of psychology is to <strong>find an accurate description of human behavior.�</strong></p><div>
</div><p align="center"><img width="177" height="80...
```

### ontent-iff8040c5-1bf8-44df-a0f6-34385352764c-content-book-1822-chapter-15728-html (html/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\iff8040c5-1bf8-44df-a0f6-34385352764c\Content\book_1822\chapter_15728.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p>When you are faced with the challenge of learning new information, your most valuable asset for success is a positive attitude.The attitudes we acquire through childhood experiences have a strong�<a href="http://moodle.eipsnextstep.ca/mod/glossary/showentry.php?courseid=302&eid=158&displayformat=dictionary" title="Globalization 10-1/10-2 Glossary: effect">effect</a><span>�on our behaviors throughout life. Early experiences influence and determine how later experiences will be interpreted.�</span>The direct and subtle messages we get from our family about w...
```

### ontent-ic8226c44-0f4e-4a24-987d-82d45f55e013-content-book-1836-chapter-15893-html (html/outline)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\general-psychology-20-independent-studies-202633108\сontent\ic8226c44-0f4e-4a24-987d-82d45f55e013\Content\book_1836\chapter_15893.html

```text
��<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><body><p><h5 dir="ltr"><span>What is psychotherapy?</span></h5>
<p dir="ltr"><span>Through psychotherapy, psychologists help people of all ages live happier, healthier and more productive lives. In psychotherapy, psychologists apply scientifically validated procedures to help people develop healthier, more effective habits. </span></p>
<p style="text-align: center;"><span><span>�<img src="..\image_chapter_15893.jpeg" alt="Image result for psychotherapy"><br></span></span></p>
<p dir="ltr"><span>There are several approaches to psychotherapy   �including cognitive-b...
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
