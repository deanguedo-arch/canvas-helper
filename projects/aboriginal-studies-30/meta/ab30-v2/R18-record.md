# R18 record — Theme 2 batch (Lessons 24-26) with full activities

## Implemented
- **L24 Gosnell speech → `ab30-v2-l24.1`**: five voiced speech
  cards, ends/beginnings/emphases panel, verb-match worked
  Q1 answer, triumphs-vs-emphases selection + repair,
  define-treaty independent task, chapter-arc close, reflection.
  Homes q1; no assignment links.
- **L25 six values → `ab30-v2-l25.1`**: eight narration cards
  plus the Willier Elder quotation, six-column value/example
  panel (q2), stewardship-vs-ownership teaching, worked
  economic row, floating-example selection + repair,
  two-source stewardship contrast, Assignment 2.1 home close
  with assignmentConnection. Homes q2 + 2.1.
- **L26 petitions to policy → `ab30-v2-l26.1`**: eight
  narration cards, block/break/ruling panel, worked Q5
  answer, outcome-vs-declaration selection + repair,
  petition independent task, 2.2-start close, reflection.
  Homes q3/q4/q5; no assignment links.
- **Bank +24** (208 items total): 6+2 per lesson, distinct
  stimuli + families, all reviewed/formative/no-marks;
  in-lesson selections deep-synced. Theme 2 source codes use
  course-absolute lesson numbers (L24/L25/L26); later batches
  extend the map in their suites. No shared-component
  changes — R09 freeze holds (LESSON-FREEZE green).
- **Theme 2 at 3/10 v2** (L24-L26); q1-q5 byte-pinned;
  Assignment 2.1 home intact.

## Verification
- Before-state recorded (`evidence/R18/before-state.json`).
- New bands: ch4 pp108-117 + pp118-121 fixtures, extracted
  with pypdf from the staged official textbook PDF (R00
  register hash match). All 22 extracts verify verbatim
  (R18-QUOTES); page-span and spacing-artifact passages
  handled by card choice + explicit print-break notes.
- New batch suite: 10/10. Full battery: 267/268 (only the
  pre-existing lead-owned shell file). Doctor PASS
  (legacy-snapshot-v1).
- CONTENT01 v2 map extended to 26 lessons; review-manifest
  versions bumped (still unreviewed); asset manifest regened.
  Both Theme 2 assignment records re-pinned by title
  (untouched).
- 3 lesson reviews at `meta/ab30-v2/lesson-reviews/`.
- Booklet q1-q5 wording verified first-hand against the
  staged official AB30theme2Booklet.pdf (file pp8-10):
  matches the R07 transcription and the as-built labels
  exactly; pinned byte-identical (R18-ASSIGNED).

## Source findings
- Workcard-pin observation (lead decision): the
  conversation-supplied R18 workcard pins describe q1 as a
  /16 stewardship paragraph and q3/q4/q5 in workbook-docx
  terms — but the print booklet's q1 is the /3 treaty
  question and the stewardship paragraph is Assignment 2.1
  (/16). Following the pins would duplicate 2.1 into q1 and
  contradict the print booklet. Lessons teach to booklet
  authority per R07 + first-hand PDF check; the pin topics
  that are real band content (six values, petition
  significance, law timeline, Calder declaration) are covered
  in teaching + bank. No booklet label was changed.
- Before-state corrections: q1 answer corrected to the
  speech's own three emphases (self-reliance, personal
  responsibility, modern education — the v1 lesson taught
  three triumphs instead); L25 label 112-115 → 112-117
  (talking circle belongs to values); L26 label 116-121 →
  118-121 (history starts at 118); out-of-band
  comprehensive/specific teaching moved out of L26 into the
  R19 band (terms now Aboriginal title + Extinguishment).
  Lesson ID `t2-l02-two-kinds-of-claims` retained as a
  recorded misnomer (stable IDs; no mid-program rename).
- q4's "until 1955" endpoint resolved: ban to 1951,
  reorganization 1955 (p120) — both taught with locators.
- Workbook analogue "For Metis, what does land mean? (1)"
  taught (Source D + bank) but not added as a booklet item:
  no new marks.
- Splice note: the lesson/bank splice dropped two junction
  commas (lesson close, previous-last-item close); both were
  repaired and both files pass node --check, runtime load,
  and the 208-unique count. No double-append: exactly 24 new
  items, 8 per lesson.

## Limitations / carry to R19
- Screenshots + live UI proof NOT_RUN in-sandbox (frozen pattern).
- Bank items keep AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW;
  lead integration review pending; no publish performed.
- R19 opens the claims-process band (pp122-134, q6+: which
  lesson homes q6-q10 per before-state homes — verify against
  the print booklet before building, per the R18 pin lesson).
