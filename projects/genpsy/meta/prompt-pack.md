# Prompt Pack

- Project: genpsy
- Generated: 2026-03-06T04:31:47.364Z

## Rules

- Work in repo-approved zones (`app/studio`, `app/server`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Retrieval order: prompt-pack -> local pattern bank matches -> references/extracted.
- Finish only after typecheck/build and task-specific verification pass.

## Intelligence Policy

- Mode: active
- Policy source: repo-default
- Collect pattern bank: on
- Collect memory ledger: on
- Apply pattern bank to prompt pack: on
- Apply memory ledger to prompt pack: on
- Apply memory ledger to recommendations: on

## Project Manifest

```json
{
  "id": "209287cc-2dd8-4b34-9b35-2f0ea6a2ed8b",
  "slug": "genpsy",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\_incoming\\genpsy",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\genpsy\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\genpsy\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-06T04:31:47.274Z",
  "createdAt": "2026-03-06T04:15:08.198Z",
  "updatedAt": "2026-03-06T04:31:47.274Z",
  "workspaceApprovedAt": "2026-03-06T04:31:47.274Z"
}
```

## Sections List

- No sections detected.

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css

## Visual Signals
- Tailwind-style color tokens: gray-800, slate-900, blue-400, slate-300, blue-500, yellow-600, slate-50, slate-200, slate-800, blue-600
- Hex colors: #f8fafc, #ffffff, #3b82f6, #eff6ff, #1e3a8a, #bfdbfe, #1e293b, #fef3c7, #f59e0b, #dbeafe
- Repeated shape tokens: rounded-lg, rounded, rounded-t, rounded-b, rounded-xl, rounded-full
- Motion and interaction tokens: hover:bg-gray-100, transition-colors, hover:bg-gray-300, hover:bg-gray-50, hover:bg-blue-700, transition-transform, hover:scale-105, transition

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

- Project: genpsy
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\_incoming\genpsy

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-03-06T04:15:08.198Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\_incoming\genpsy

## Actions
- Detected "generalpsy20.html" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Externalized 1 inline style block(s) to workspace/styles.css.
- Externalized 1 inline script block(s) to workspace/main.js.
- Copied 2 supporting file(s) into references/raw.
- Indexed the imported supporting material into references/extracted.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\genpsy.json).
- Updated local pattern bank (3 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\genpsy\meta\prompt-pack.md).

## Warnings
- None.
```

## Global Memory

### Approved style direction from genpsy
- Kind: style
- Confidence: high
- Reinforcement: 4
- Projects: genpsy
- Top reasons: Style overlap (+180); Keyword overlap (+154)
- Keywords: acetylcholine, action, anatomy, applied, architecture, basis, behavior, biological, block, brain, builder, building
- Style tokens: amber-500, blue-100, blue-200, blue-300, blue-400, blue-500, blue-600, blue-700, blue-800, emerald-600, gray-100, gray-200
- Dependencies: none
- Reference kinds: none

### Runtime and tool choices from genpsy
- Kind: tool
- Confidence: high
- Reinforcement: 4
- Projects: genpsy
- Top reasons: Keyword overlap (+154); Dependency overlap (+12)
- Keywords: acetylcholine, action, anatomy, applied, architecture, basis, behavior, biological, block, brain, builder, building
- Style tokens: none
- Dependencies: https://cdn.tailwindcss.com, https://cdn.tailwindcss.com"></script>, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
- Reference kinds: none

### Reference and resource profile from genpsy
- Kind: resource
- Confidence: high
- Reinforcement: 4
- Projects: genpsy
- Top reasons: Keyword overlap (+154); Approved bonus (+6)
- Keywords: acetylcholine, action, anatomy, applied, architecture, basis, behavior, biological, block, brain, builder, building
- Style tokens: none
- Dependencies: none
- Reference kinds: pdf

### Reusable sections and components from genpsy
- Kind: component
- Confidence: high
- Reinforcement: 4
- Projects: genpsy
- Top reasons: Keyword overlap (+154); Approved bonus (+6)
- Keywords: acetylcholine, action, anatomy, applied, architecture, basis, behavior, biological, block, brain, builder, building
- Style tokens: none
- Dependencies: none
- Reference kinds: none

### Approved style direction from smoke-calm-module
- Kind: style
- Confidence: high
- Reinforcement: 10
- Projects: smoke-calm-module
- Top reasons: Style overlap (+108); Keyword overlap (+8)
- Keywords: action, addiction, addictions, addictive, after, alcohol, alone, amazing, analysis, answers, back, calm
- Style tokens: amber-100, amber-200, amber-300, amber-400, amber-50, amber-500, amber-600, amber-700, amber-800, amber-900, blue-100, blue-200
- Dependencies: none
- Reference kinds: none

## Pattern Matches

### smoke-calm-module (auto/auto, score 143)
- Confidence: high
- Score breakdown: sections 0, keywords 8, references 4, styles 108, colors 1, dependencies 8, curated 0, recency 6, workspace approval 8
- Top reasons: Style token overlap (+108); Keyword overlap (+8)
- Shared sections: none
- Shared style tokens: amber-500, blue-100, blue-200, blue-300, blue-500, blue-800, emerald-600, green-300, green-800, indigo-100, indigo-500, indigo-600, indigo-800, purple-100, purple-50, purple-600, red-100, red-200, red-300, red-50, red-500, red-600, red-700, red-800, rounded-full, rounded-lg, rounded-xl, slate-100, slate-200, slate-300, slate-400, slate-50, slate-800, slate-900, yellow-300, yellow-800
- Shared keywords: action, check, high, module
- Shared reference kinds: pdf

## Reference Excerpts

### genpsych20module-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\genpsy\references\raw\GenPsych20Module.pdf

```text
GG
GG
G
ENERALENERAL
ENERALENERAL
ENERAL
  P  P
  P  P
  P
SYCHOLOGYSYCHOLOGY
SYCHOLOGYSYCHOLOGY
SYCHOLOGY
  20  20
  20  20
  20
SSN2172SSN2172
SSN2172SSN2172
SSN2172
  Distance  Distance
LearningLearning
   Distance   Distance
LearningLearning
CentreCentre
CentreCentre
Alberta Alberta 
AlbertaAlberta

ALL RIGHTS RESERVED
Copyright © 2003, by Alberta Distance Learning Centre, 4601-63 Avenue, Barrhead, Alberta, Canada, T7N 1P4.
No part of this courseware may be reproduced or transmitted in any form, electronic or mechanical, including photocopying (unless
otherwise indicated), recording, or any information storage and retrieval system, without the written permission of Alberta Distance
Learning Centre.
Every effort has been made both to provide proper acknowledgement of the original source and to comply with copyright law. If cases
are identified where this effort has been unsuccessful, please notify Alberta Distance Learning Centre so that appropriate corrective
action can be taken.
Printed and bound in Canada
IT IS STRICTLY PROHIBITED TO COPY ANY PART OF THESE MATERIALS UNDER THE TERMS OF
A LICENCE FROM A COLLECTIVE OR A LICENCING BODY.
General Psychology 20
Student  Module  Book...
```

### genpsychoverview-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\genpsy\references\raw\GenPsychOverview.pdf

```text
General Psychology 20
Over view

CANADIAN CATALOGUING IN PUBLICATION DATA
General Psychology 20
SSN2172
Overview
ISBN:  1-894894-02-2
Copyright 2010 Alberta Distance Learning Centre
4601 - 63 Avenue
Barrhead, Alberta  Canada  T7N 1P4
All rights reserved.  No part of this courseware may be reproduced, stored in a retrieval system, 
or transmitted in any form or by any means – electronic, mechanical, photocopying, recording, or 
otherwise – without written permission from Alberta Distance Learning Centre.
Printed in Canada
Alberta Distance Learning Centre has made every effort to acknowledge original sources and to 
comply with copyright law.  If errors or omissions are noted, please contact Alberta Distance Learning 
Centre so that necessary amendments can be made.
For Users of Alberta Distance Learning Centre Courseware
Much time and effort involved in preparing learning materials and activities that meet curricular 
expectations as determined by Alberta Education.  We ask that you respect our work by honouring 
copyright regulations.
Acknowledgement
Alberta Distance Learning Centre wishes to acknowledge McGraw-Hill Ryerson for their 
generosity in our use of their resources.
The I...
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
