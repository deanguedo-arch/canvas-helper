# R22 record — Theme 3 batch (Lessons 34-36) with full activities; Theme 3 opened

## Implemented
- **L34 Dumont/mainstream → `ab30-v2-l34.1`**: fourteen
  cards (G–N narration; B–G Dumont essay documents),
  multiculturalism/assimilation/resistance panel,
  worked Q2 cost-of-stereotypes answer, blend-it
  selection + repair, holders independent task, 3.1
  handoff close, reflection. Homes q1-q6.
- **L35 chain/language/Littlechild → `ab30-v2-l35.1`**:
  seventeen cards (fifteen narration; N–O voiced
  Littlechild profiles), nine-row panel, worked Q7/Q9
  language answer, silent-landlord selection + repair,
  equal-vs-same independent task, screens close,
  reflection. Homes q7-q9.
- **L36 media/humour/film-bridge → `ab30-v2-l36.1`**:
  seventeen cards (fourteen narration; Isadore and
  Brave Rock voiced; Burnstick narration-with-quote),
  film/TV/answer panel, worked Q10 roles answer,
  victory-lap selection + repair, twist independent
  task, Reel Injun bridge close, reflection. Homes
  q10 + R1-R14 (R14 restored per R07).
- **Bank +24** (288 items total): 6+2 per lesson, distinct
  stimuli + families, all reviewed/formative/no-marks;
  in-lesson selections generated from the lessons for
  sync. T2 source-code map extended (L34-L36). No
  shared-component changes — R09 freeze holds
  (LESSON-FREEZE green).
- **Theme 3 at 3/10 v2** (L34-L36); Theme 3 q1-q10 +
  R1-R14 pinned.

## Verification
- Before-state captured BEFORE splicing
  (`evidence/R22/before-state.json`) — the R21 process
  gap is closed.
- New band: ch5 pp158-171 fixture from the staged official
  textbook PDF (R00 register hash match). All 48 extracts
  verify verbatim (R22-QUOTES); page-turn, artifact, and
  mid-list passages handled by card re-cuts with explicit
  notes or prose-with-locator.
- New batch suite: 10/10. Full battery: 307/308 (only the
  pre-existing lead-owned shell file). Doctor PASS
  (legacy-snapshot-v1).
- CONTENT01 v2 map extended to 36 lessons; review-manifest
  versions bumped (still unreviewed); asset manifest regened.
- 3 lesson reviews at `meta/ab30-v2/lesson-reviews/`.
- Booklet q1-q10 + R1-R14 wording verified first-hand
  against the staged official AB30Theme3Booklet.pdf
  (file pp3-13): matches the as-built labels exactly
  (including the genuine q7/q9 repeat, the R4 print
  grammar quirk, and the unnumbered Atanarjuat
  question); R22 pins all 24 byte-identical
  (R22-ASSIGNED).

## Source findings
- q8's "Language" line is q9's bold section header, not a
  10th table row: staged booklet file p5 sets it in
  Arial-BoldMT like the Assignment 3.1 heading, while
  rows stay regular. q8 pinned at 9 rows; the font
  analysis is recorded in the L35 review.
- R14 was homed at no lesson (R07 assigns it to L36; v1
  omits it). Restored to L36's homes as a
  before-state correction, pinned numberless as print.
- Uncardable-as-drafted passages: IBC/APTN sentence
  ('T elevision' artifact, re-cut + split card); team
  list (p169-170 page turn, prose-with-locator);
  Yankees defence ('Y ork' artifact, prose); Source N
  closing ('T eams' artifact, dropped with note);
  empathy sentence ('T eaching' artifact, not quoted).
- Bank splice first landed in the MODES array (wrong
  `];` match); caught by the item-count check, removed,
  and re-appended to ITEMS correctly. Verified: 288
  unique, 8 per R22 lesson, MODES intact.

## Limitations / carry to R23
- Screenshots + live UI proof NOT_RUN in-sandbox (frozen pattern).
- Bank items keep AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW;
  lead integration review pending; no publish performed.
- R23: Theme 3 batch 2 (L37 3.1 home + L38 + L39;
  ch5 pp172-177 + ch6 pp178-187).
