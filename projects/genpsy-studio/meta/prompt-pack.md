# Prompt Pack

- Project: genpsy-studio
- Generated: 2026-03-06T21:36:25.095Z

## Rules

- Work in repo-approved zones (`app/studio`, `app/server`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Retrieval order: prompt-pack -> local pattern bank matches -> projects/resources/<slug>/_extracted.
- Finish only after typecheck/build and task-specific verification pass.

## Intelligence Policy

- Mode: collect
- Policy source: env-override
- Collect pattern bank: on
- Collect memory ledger: on
- Apply pattern bank to prompt pack: off
- Apply memory ledger to prompt pack: off
- Apply memory ledger to recommendations: off

## Project Manifest

```json
{
  "id": "3aae29ea-522e-4780-a1e9-f62a5ead7f84",
  "slug": "genpsy-studio",
  "sourcePath": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\processed\\genpsy-studio\\source",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\genpsy-studio\\workspace\\index.html",
  "rawEntrypoint": "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\genpsy-studio\\raw\\original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-03-06T21:36:25.043Z",
  "createdAt": "2026-03-06T19:03:24.663Z",
  "updatedAt": "2026-03-06T21:36:25.043Z",
  "workspaceApprovedAt": "2026-03-06T21:36:25.043Z"
}
```

## Sections List

- No sections detected.

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&amp;fit=crop&amp;w=1600&amp;q=80, https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&amp;fit=crop&amp;w=600&amp;q=80, https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?auto=format&amp;fit=crop&amp;w=800&amp;q=80, https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&amp;fit=crop&amp;w=1600&amp;q=80, https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?auto=format&amp;fit=crop&amp;w=1600&amp;q=80, https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&amp;fit=crop&amp;w=1600&amp;q=80

## Visual Signals
- Tailwind-style color tokens: gray-800, slate-900, slate-300, slate-950, slate-800, blue-500, slate-500, slate-400, blue-400, slate-700
- Hex colors: #ef4444, #fca5a5, #fef2f2, #3b82f6, #93c5fd, #eff6ff, #10b981, #6ee7b7, #ecfdf5, #e11d48
- Repeated shape tokens: rounded-full, rounded, rounded-lg, rounded-t, rounded-b, rounded-xl
- Motion and interaction tokens: transition-all, transition-colors, hover:bg-slate-800, hover:text-white, hover:bg-slate-700, hover:bg-gray-300, hover:bg-gray-50, hover:bg-blue-700, transition-transform, hover:scale-105

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

- Project: genpsy-studio
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\_incoming\genpsy

## Sections
- No structured sections were detected. Edit workspace/main directly.
```

## Import Log

```md
# Import Log

- Generated: 2026-03-06T19:03:24.663Z
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\_incoming\genpsy

## Actions
- Detected "generalpsy20.html" as the site entrypoint inside the source folder.
- Copied the source HTML into raw/original.html without modifying it.
- Externalized 1 inline style block(s) to workspace/styles.css.
- Externalized 1 inline script block(s) to workspace/main.js.
- Copied 14 supporting file(s) into references/raw.
- Indexed the imported supporting material into references/extracted.
- Learned project patterns (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\.runtime\pattern-bank\auto\genpsy-studio.json).
- Updated local pattern bank (6 profile(s)).
- Generated prompt pack (C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\genpsy-studio\meta\prompt-pack.md).

## Warnings
- None.
```

## Global Memory

disabled by intelligence policy (collect)

## Pattern Matches

disabled by intelligence policy (collect)

## Reference Excerpts

### copy-of-personal-psychology-20-unit-1-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\Copy of Personal Psychology 20 Unit 1.pdf

```text
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstefortsaskatchewans
herwoodparkvegrevillenextstepfortsa
skatchewannextstepsherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillepfortsaskatchewa
nsherwoodparkvegrevillenextstepfort
saskatchewansherwoodparkvegreville
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstepfortsaskatchewan
sherwoodparkvegrevillenextstepforts
 
STUDENT NAME:
 
 
 
 
 
 
Personal 
Psychology 20 
Unit 1 
 
 
SENIOR HIGH SCHOOL 
Fort Saskatchewan 780 992 0101 
Sherwood Park 780 464 1899 
Vegreville 780 632 7998
```

### copy-of-personal-psychology-20-unit-2-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\Copy of Personal Psychology 20 Unit 2.pdf

```text
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstefortsaskatchewans
herwoodparkvegrevillenextstepfortsa
skatchewannextstepsherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillepfortsaskatchewa
nsherwoodparkvegrevillenextstepfort
saskatchewansherwoodparkvegreville
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstepfortsaskatchewan
sherwoodparkvegrevillenextstepforts
 
STUDENT NAME:
 
 
 
 
 
 
Personal 
Psychology 20 
Unit 2 
 
 
SENIOR HIGH SCHOOL 
Fort Saskatchewan 780 992 0101 
Sherwood Park 780 464 1899 
Vegreville 780 632 7998
```

### copy-of-personal-psychology-20-unit-3-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\Copy of Personal Psychology 20 Unit 3.pdf

```text
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstefortsaskatchewans
herwoodparkvegrevillenextstepfortsa
skatchewannextstepsherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillepfortsaskatchewa
nsherwoodparkvegrevillenextstepfort
saskatchewansherwoodparkvegreville
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstepfortsaskatchewan
sherwoodparkvegrevillenextstepforts
 
STUDENT NAME:
 
 
 
 
 
 
Personal 
Psychology 20 
Unit 3 
 
 
SENIOR HIGH SCHOOL 
Fort Saskatchewan 780 992 0101 
Sherwood Park 780 464 1899 
Vegreville 780 632 7998
```

### copy-of-personal-psychology-20-unit-4-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\Copy of Personal Psychology 20 Unit 4.pdf

```text
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstefortsaskatchewans
herwoodparkvegrevillenextstepfortsa
skatchewannextstepsherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillepfortsaskatchewa
nsherwoodparkvegrevillenextstepfort
saskatchewansherwoodparkvegreville
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstepfortsaskatchewan
sherwoodparkvegrevillenextstepforts
 
STUDENT NAME:
 
 
 
 
 
 
Personal 
Psychology 20 
Unit 4 
 
 
SENIOR HIGH SCHOOL 
Fort Saskatchewan 780 992 0101 
Sherwood Park 780 464 1899 
Vegreville 780 632 7998
```

### copy-of-personal-psychology-20-unit-5-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\Copy of Personal Psychology 20 Unit 5.pdf

```text
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstefortsaskatchewans
herwoodparkvegrevillenextstepfortsa
skatchewannextstepsherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillepfortsaskatchewa
nsherwoodparkvegrevillenextstepfort
saskatchewansherwoodparkvegreville
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstepfortsaskatchewan
sherwoodparkvegrevillenextstepforts
 
STUDENT NAME:
 
 
 
 
 
 
Personal 
Psychology 20 
Unit 5 
 
 
SENIOR HIGH SCHOOL 
Fort Saskatchewan 780 992 0101 
Sherwood Park 780 464 1899 
Vegreville 780 632 7998
```

### copy-of-personal-psychology-20-unit-6-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\Copy of Personal Psychology 20 Unit 6.pdf

```text
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstefortsaskatchewans
herwoodparkvegrevillenextstepfortsa
skatchewannextstepsherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillepfortsaskatchewa
nsherwoodparkvegrevillenextstepfort
saskatchewansherwoodparkvegreville
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstepfortsaskatchewan
sherwoodparkvegrevillenextstepforts
 
STUDENT NAME:
 
 
 
 
 
 
Personal 
Psychology 20 
Unit 6 
 
 
SENIOR HIGH SCHOOL 
Fort Saskatchewan 780 992 0101 
Sherwood Park 780 464 1899 
Vegreville 780 632 7998
```

### copy-of-personal-psychology-20-unit-7-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\Copy of Personal Psychology 20 Unit 7.pdf

```text
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstefortsaskatchewans
herwoodparkvegrevillenextstepfortsa
skatchewannextstepsherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillenextstepfortsaskat
chewansherwoodparkvegrevillenextst
epfortsaskatchewansherwoodparkveg
revillenextstepfortsaskatchewansher
woodparkvegrevillepfortsaskatchewa
nsherwoodparkvegrevillenextstepfort
saskatchewansherwoodparkvegreville
nextstepfortsaskatchewansherwoodpa
rkvegrevillenextstepfortsaskatchewan
sherwoodparkvegrevillenextstepforts
 
STUDENT NAME:
 
 
 
 
 
 
Personal 
Psychology 20 
Unit 7 
 
 
SENIOR HIGH SCHOOL 
Fort Saskatchewan 780 992 0101 
Sherwood Park 780 464 1899 
Vegreville 780 632 7998
```

### genpsychoverview-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\GenPsychOverview.pdf

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

### perpsy20ab01key-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\PerPsy20AB01Key.pdf

```text
FOR STUDENT USE ONLY
(if label is missing or incorrect)
File Number:
NameAddress 
City/Town                Province                Postal                Code
FOR ADLC USE ONLY
Student’s Questions
and Comments
Teacher’s Signature
Assigned to
Marked by
Mark
             %
Date received
Apply Assignment Label Here
Please use the pre-printed label for this 
course and Assignment Booklet.
Teacher’s Comments:
ALBERTA DISTANCE LEARNING CENTRE
SSN2171:  PERSONAL PSYCHOLOGY 20
An Introduction to Psychology
Assignment Booklet  1 
Revised December 2008
Possible
Marks
Your
Marks
99
TOTAL99
SUMMARY
KEY

CANADIAN CATALOGUING IN PUBLICATION DATA
Personal Psychology 20
Personal Psychology 20:  An Introduction to Psychology
Assignment Booklet 1
Alberta Distance Learning Centre
Copyright 2007 Alberta Distance Learning Centre
4601 - 63 Avenue
Barrhead, Alberta  Canada  T7N 1P4
All rights reserved.  No part of this courseware may be reproduced, stored in a retrieval system, 
or transmitted in any form or by any means – electronic, mechanical, photocopying, recording, or 
otherwise – without written permission from Alberta Distance Learning Centre.
Printed in Canada
Alberta Distance Learning Centre has...
```

### perpsy20ab02key-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\PerPsy20AB02Key.pdf

```text
ALBERTA  DISTANCE  LEARNING  CENTRE 
SSN2171 
Personal Psychology 20  KEY 
 
Assignment Booklet 2 
Student’s Questions and 
Comments 
For Student use only For ADLC USE ONLY 
 
  
 (If label is missing or incorrect) 
File Number: 
 
  
Assigned to 
 
 
 
        
City/Town               Province           Postal Code
 
  Address:
 
Name:
 
Apply Assignment Label Here
 
 
Marked by 
 
 
 
Date Received: 
 
 
 
Summary 
 
Possible 
Marks 
Your 
Marks 
% 
Part One 
17 
  
Part Two 
10 
  
Part Three 
10   
Part Four 
13 
  
TOTAL 
50 
  
 
 
Teacher’s Comments 
 
 
 
 
 
 
 
 
 
 
 
       Teacher’s Signature 
Revised January 2015 

 
 
 
CANADIAN CATALOGUING IN PUBLICATION DATA
 
 
 
SSN2171 
Personal Psychology 20 
Assignment Booklet Package 
Copyright © 2014 Alberta Distance Learning Centre 
4601 - 63 Avenue 
Barrhead, Alberta, Canada  T7N 1P4
 
 
Permission has been obtained from Distributed Learning Resources Branch to revise this 
material. 
 
All rights reserved.  No part of this courseware may be reproduced, stored in a retrieval system, 
or transmitted in any form or by any means – electronic, mechanical, photocopying, recording, 
or otherwise – without written permission from...
```

### perpsy20ab03key-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\PerPsy20AB03Key.pdf

```text
ALBERTA  DISTANCE  LEARNING  CENTRE 
SSN2171 
Personal Psychology 20  KEY 
 
Assignment Booklet 3 
Student’s Questions and 
Comments 
For Student use only For ADLC USE ONLY 
 
  
 (If label is missing or incorrect) 
File Number: 
 
  
Assigned to 
 
 
 
        
City/Town               Province           Postal Code
 
  Address:
 
Name:
 
Apply Assignment Label Here
 
 
Marked by 
 
 
 
Date Received: 
 
 
 
Summary 
 
Possible 
Marks 
Your 
Marks 
% 
Part One 
16 
  
Part Two 
10 
  
Part Three 
7   
Part Four 
17 
  
TOTAL 
50 
  
 
 
Teacher’s Comments 
 
 
 
 
 
 
 
 
 
 
 
       Teacher’s Signature 
Revised January 2015 

 
 
 
CANADIAN CATALOGUING IN PUBLICATION DATA
 
 
 
SSN2171 
Personal Psychology 20 
Assignment Booklet Package 
Copyright © 2014 Alberta Distance Learning Centre 
4601 - 63 Avenue 
Barrhead, Alberta, Canada  T7N 1P4
 
 
Permission has been obtained from Distributed Learning Resources Branch to revise this 
material. 
 
All rights reserved.  No part of this courseware may be reproduced, stored in a retrieval system, 
or transmitted in any form or by any means – electronic, mechanical, photocopying, recording, 
or otherwise – without written permission from ...
```

### perpsy20ab04key-pdf (pdf)
- Source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\resources\genpsy-studio\PerPsy20AB04Key.pdf

```text
ALBERTA  DISTANCE  LEARNING  CENTRE 
SSN2171 
Personal Psychology 20  KEY 
 
Assignment Booklet 4 
Student’s Questions and 
Comments 
For Student use only For ADLC USE ONLY 
 
  
 (If label is missing or incorrect) 
File Number: 
 
  
Assigned to 
 
 
 
        
City/Town               Province           Postal Code
 
  Address:
 
Name:
 
Apply Assignment Label Here
 
 
Marked by-- 
 
 
 
Date Received: 
 
 
 
Summary 
 
Possible 
Marks 
Your 
Marks 
% 
Part One 
12 
  
Part Two 
10 
  
Part Three 
10   
Part Four 
19 
  
TOTAL 
51 
  
 
 
Teacher’s Comments 
 
 
 
 
 
 
 
 
 
 
 
       Teacher’s Signature 
Revised January 2015 

 
 
 
CANADIAN CATALOGUING IN PUBLICATION DATA
 
 
 
SSN2171 
Personal Psychology 20 
Assignment Booklet Package 
Copyright © 2014 Alberta Distance Learning Centre 
4601 - 63 Avenue 
Barrhead, Alberta, Canada  T7N 1P4
 
 
Permission has been obtained from Distributed Learning Resources Branch to revise this 
material. 
 
All rights reserved.  No part of this courseware may be reproduced, stored in a retrieval system, 
or transmitted in any form or by any means – electronic, mechanical, photocopying, recording, 
or otherwise – without written permission fr...
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
