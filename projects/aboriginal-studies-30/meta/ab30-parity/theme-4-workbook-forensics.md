# T18 Theme 4 workbook forensics (read-only; D2L export in Downloads, never committed)

Source file: `Content/ABS30 Workbook Theme 4 - Aboriginal World Issues.docx` (4,018,721 bytes, 08-24-2020).
Extraction: docx word/document.xml paragraph text, 664 paras, 362 non-empty. Para index = extraction order.
(A second copy exists — `ABS30 Workbook Theme 4 caitlin lingley.rtf`, 61MB — not extracted; same-version used copy.)

## Copy identity (contamination warnings)

- PERSONALIZED: para 0 `Name: Daniel Petherick`, para 1 `Date Due: December 18th 2019`.
- STUDENT ANSWERS INTERLEAVED throughout (first-person, typos, wrong answers): paras 46, 50, 66-67, 117, 120, 124,
  136, 138-140, 170, 193, 238-239, 243-244, 249, 256, 262-263, 271-272, 278-279, 290, 343, 364-370, 381-384, 388-391,
  435, 438, 445, 454, 457, 487, 490, 500, 539-549, 558-565, 586, 589, and more.
- Form-field ID artifacts pollute prompt text (e.g. `-2857493143252`, `-45719995251`): form export noise,
  not content. Negative numbers are NEVER prompt wording.
- CONSEQUENCE: prompt wording recoverable with ID-noise stripped by eye; NO answer text usable; name never committed.
  The committed fixture holds 145 prompt-only paras (see `theme4-workbook-prompts.txt`).

## Workbook structure (Q2-29 with a duplicated Q4 — NOT booklet Q1-22)

- Numbered runs: Q2-Q9 (paras 116-289, with article + ATSI + flags material), 4.2 film Qs 1-6 LOCAL numbering
  (paras 310-325), Q10-Q25 (paras 341-513, stolen generations → UN), Q26 T/F + Q27-Q29 (paras 557-588, education + fact sheet).
- NO Q1 anywhere (sequence starts at Q2). Q4 appears TWICE with different content: para 121 (glossary: geopolitical)
  and para 135 (boundaries challenge, highlight/underline + options). Tracked as wb-q04a + wb-q04b, never merged.
- MC options inline for Q6 (paras 164-167), Q11 (381-384), Q12 (388-391); match rows for Q14 (399-411);
  T/F rows for Q26 (558-562); fact-sheet rows for Q28-29 (572-583) — all kept as task material in the fixture.

## Assignment 4.1 comparison chart (paras 230-279)

- Header: residential schools (Canada) vs stolen generation (Australia); instruction para 231 ("based on resource
  provided in class" — classroom resource, not in the workbook).
- Frame: CATEGORY (232) / AUSTRALIA'S STOLEN GENERATIONS (233) / CANADA'S RESIDENTIAL SCHOOLS (234).
- 12 categories inventoried as cat-01..cat-12: objective/goal (235), rationale (236), assimilation policies (237),
  where children went (240), how long gone (241), experiences (245), impact (257), what lost (258),
  important reports (264), report outcomes (265), apology date+effects (268), reconciliation/healing (273).
- Student cell answers interleaved (238-239, 243-244, 249, 256, 262-263, 271-272, 278-279) — excluded from fixture.

## Assignment 4.2 Rabbit Proof Fence (paras 300-325)

- Film intro + viewing instruction (para 309: "While watching the film answer the following questions").
- 6 scene-specific viewing Qs /10 marks: assimilation policies compare (310), removal feeling (313),
  Molly navigation (316), tracker role (319), Neville lengths (322), Molly+daughter impact (325).
- NO viewing-access pointer in the workbook (no Moodle/NFB line unlike Reel Injun); version/timestamps unverified.
- Current 4.2 record (Stolen Generations opinion paragraph) is a DIFFERENT task — not adopted.

## Workbook 4.3 is NOT the novel (paras 353-356)

- Workbook "Assignment 4.3 Contemporary Issues /20" = pipelines research (Canada/Australia compare, AB viewpoints,
  2+ news articles dated Jan 2017+, quote + links). Novel study lives in a SEPARATE D2L item
  (`Copy of Final Project - The Inconvenient Indian Novel Study.pdf`, verified T03 p.25).
- Workbook 4.4 = UNDRIP international strategies /20 (paras 518-536, Moodle reading pointer para 526).
- Checklist (paras 622-646): 4.0 Short Answer /85 (30%), 4.1 /24 (20%), 4.2 /10 (5%), 4.3 /20 (25%), 4.4 /20.

## Novel forensics (this ticket)

- Legacy: The Inconvenient Indian novel-study PDF p.25 verified T03 (3 choice Qs, CHOOSE ONE); live record
  `4-3-personal-response` pinned byte-exact by T4XW03; saved-work keys untouched.
- Candidate: `assets/library/halfbreed-maria-campbell.pdf` verified in T18: 222 PDF pages, text layer present,
  Introduction + Chapters 1-24 confirmed by heading extraction (50 hits = TOC + body).
- NO Halfbreed assignment record, lesson page, or response key exists (NOVEL-GATE proves absence).
- Decision packet: `T18-novel-decision.md` (teacher-only fill; activation rule; denominator exclusion).

## What T18 did NOT do

No booklet wording adopted; no lesson-home mapping inferred; no learner-surface wiring; no 4.2/4.3 edits;
no novel activation (review boundary). All 27 required items sit in `theme-4-crosswalk.json` blocked.
