# Chapter 15 lessons 07–08 source preflight

Review completed 2026-10-08 UTC. Scope: read-only review of the historical native source, active data, actual teacher PPTX, relevant original textbook pages and pixels, lesson-local tasks, optional question givens, and source-assessment catalogue. No lesson, assessment, source figure, runtime, or user-computer edits were made. This is source preflight, not a fresh learner attempt, browser test, teacher acceptance, or release decision.

## Findings that affect authoring

1. **Reject the textbook p. 516 statement that the placenta has a mass of 600 g at about 10 weeks.** It is printed in the actual PDF and visible in the rendered page, not an extraction artifact. The same sentence's suggestion that development is finished at ten weeks is misleading. Human placental growth continues well beyond this point. The authoritative human-source check is recorded below. Do not simply replace it with an exact universal early weight; that is unnecessary to the lesson and adds an age/measurement dependency.
2. **The inherited source-map is not an accurate slide map.** Actual slide 19 is neurulation; slide 20 gives placenta functions; slide 21 is an image-only critical-period/teratogen timeline. Slides 22–24 cover the three trimesters. Slide 25 has the first development video, and slide 30 the second. Slides 31, 33 and 34 are STI/sex-determination material, not necessary prerequisites for the existing lesson 08 checks.
3. **Lesson 07's reading band omits the main cord/placenta page.** It says pp. 514–516, but p. 517 supplies Fig. 15.11 and the explicit two-artery/one-vein directions. Pp. 514–515 mostly concern organogenesis and support structures. Source grounding should include pp. 515–517, with p. 518 Q8 as a separate optional task.
4. **Lesson 08 contains no teaching figure.** Its body mentions a developmental timeline but renders none. Actual Fig. 15.12 on p. 522 is an available, relevant source supplement for the timing task. A supplement must retain the source pixels/labels and teach how to read them. The graph's equally wide columns have unequal time intervals; it is not suitable for proportional interpolation of dates or individual risk prediction.
5. **The required checks are well aligned to the existing core concepts; the broader optional tasks require more support.** Lesson 07's list includes p. 515 Q15–19 about neurulation and week-by-week embryology. Lesson 08 asks for three second-trimester and three third-trimester events in p. 520 Q25–26, but the current route only offers broad maturation language. These are genuine task-support gaps, not missing files.
6. **Preserve a third age convention.** P. 518 Q8's graph expressly uses weeks after implantation. Do not silently reinterpret it as weeks after fertilization or gestational age. Lesson 08's general age-convention rule needs this source-specific exception wherever the optional task is explained.
7. **The original p. 528 Q3 is not a reliable current single-answer teratogen classification task.** It assumes every listed item except folic acid, including vitamin C, should be called a teratogen without dose/exposure context. Preserve the original question; visibly flag the historical premise. Do not teach an unqualified vitamin-C-causes-birth-defects answer or change the protected question/key to make it pass.

## Exact inspected owner and receipts

Historical source root: `biology_prep/ch15-source/unpacked/chapter-15/`

- Native owner: `workspace/index.html`, with embedded `course-data` and `textbook-practice-data`; external runtime files remain untouched
- Original PDF: `workspace/assets/textbook/chapter-15.pdf`, SHA256 `30b03cf91e5cf99ed0ae2a7dedf7cae2b246111b795d280b5b95ca937c56aa25`
- Embedded base64 `textbook-data` decodes to the same PDF SHA256
- Actual teacher source: `biology_prep/ch15-source/teacher/BIOLOGY 30 COURSE CREATION/Unit B Chapter 15 Notes.pptx`, SHA256 `38149b6f562425a0b49bed3d0ad4369c5c5eef48f44d9099ea673cc888c2eb84`
- Locally present v0.4 text SHA256 independently matches the requested `db8a04bcd7620d9ecf64ec6dc86c046cb3075b9b09cc51dac41936c391379e1e`. Freezing/adoption remains the author's responsibility
- Relevant PDF text inspected: printed pp. 513–523 and 528. Actual pixels inspected: relevant lesson figures, pp. 514–517/520–523, all 17 routed optional question crops, and relevant teacher media. P. 518's complete nutrition graph was inspected as its full question crop
- Actual PPTX text was extracted directly from all 42 slide XML files; relevant slide media relationships, image pixels and speaker notes were independently checked. Relevant notes contain no extra substantive teaching

Companion receipts:
- `inspected-active-course-data.json`: complete active data snapshot
- `inspected-active-local-tasks-07-08.json`: full relevant prompts, options, answers, models and task data
- `inspected-lesson-07-full.html/.txt` and `inspected-lesson-08-full.html/.txt`: complete native local sections
- `inspected-actual-teacher-pptx-text.json`, `inspected-teacher-assets.json`, and `teacher-assets/`: actual PPTX extraction and media hashes
- `inspected-optional-questions-07-08.json` and `optional-resource-receipts.json`: full original optional prompts, all crop/context references and hashes
- `inspected-source-assessment-07-08.json`: exact catalogue entries for four active imported items
- `protected-control-receipts.json`: 45 lesson-07 and 49 lesson-08 interactive/linked elements, with their attributes and visible labels
- Rendered page/figure/contact PNGs document pixel inspection; they are review receipts, not replacements for protected source assets

## Authoritative check: 600 g at ten weeks

The printed statement on p. 516 joins an early-development date to an approximately term-sized mass. Evidence:

- The Institute of Medicine/National Research Council report, *Weight Gain During Pregnancy* (2009), chapter 3, printed p. 84 (PDF index 97), reports early human placental measurements of roughly 51 g at 10–12 weeks and 141 g at 18–20 weeks, citing Abramovich's 1969 human study. It also explains the limitations of early-pregnancy specimens and describes subsequent growth. The numerical statement was directly located in the official NCBI-hosted PDF, not only a search snippet: https://www.ncbi.nlm.nih.gov/books/n/nap12584/pdf/ . Readable chapter entry: https://www.ncbi.nlm.nih.gov/books/NBK32815/ . Primary study metadata verified: https://pubmed.ncbi.nlm.nih.gov/5785674/ (DOI 10.1111/j.1471-0528.1969.tb05873.x). The original 1969 full text was not accessible here, so do not claim to have directly inspected its table or dating methods
- A primary human study of 11,141 uncomplicated singleton term pregnancies (37–42 gestational weeks) reports mean freshly delivered untrimmed placental weights of 545 g after vaginal delivery and 621 g after Caesarean delivery. These are population/method-specific term values, not fixed normals: https://pubmed.ncbi.nlm.nih.gov/16377060/ (DOI 10.1016/j.ejogrb.2005.10.032). Its indexed abstract was retrieved; direct page retrieval later returned a limited page
- Boyd's human morphometry study measured 95 placentas from 10 gestational weeks through term and describes continued growth and elaboration of villi: https://pubmed.ncbi.nlm.nih.gov/6745150/ (DOI 10.1016/0378-3782(84)90074-4). Indexed abstract inspected; full article not inspected

Conclusion: the textbook's combined ten-week/600-g claim is contradicted, and “fully developed” must not imply growth stops. A safe course-level correction is to describe an early-established placenta that continues growing and functioning through pregnancy, without inserting an unnecessary exact mass. This is an educational source correction, not clinical guidance.

## Source contradictions and limits

### Directly relevant to lessons 07–08

- **Teacher slides 7 and 22:** “fetal stage/period = weeks 9–12.” P. 520 and active course text correctly continue the fetal period from week nine after fertilization until birth. Slide 22 may describe only the first-trimester portion, but its label needs that qualification; slide 7 gives the mistaken whole-period definition
- **Fig. 15.9 on p. 515:** labels its Carnegie-stage timing as approximate postovulatory days. Preserve that stated reference when using the original, rather than silently relabeling it
- **Textbook p. 520:** says approximately 266 days, then “approximately 40 weeks,” after the fertilized cell forms. 266 days equals 38 weeks. About 40 weeks is the conventional LMP-based gestational count, not the same elapsed time after fertilization
- **Teacher slide 32:** explains early relative insensitivity by saying blastocyst cells have not begun differentiating. The blastocyst already has distinct inner-cell-mass/trophoblast populations. Do not repeat this absolute claim. Early “all-or-none” is a limited model, with possible loss and exceptions, not a guarantee of harmlessness
- **Teacher slide 21:** original image says the early period is “Usually not susceptible to teratogens.” If used, retain pixels but put the limitation next to it. Its fetal period correctly continues beyond week twelve. MotherToBaby's official explanation distinguishes the first two weeks after conception from gestational dating and explicitly notes exceptions: https://mothertobaby.org/fact-sheets/critical-periods-development/ (1 April 2025)
- **Pp. 520–521 and teacher slides 23–24:** broad premature-survival statements must not become a fixed viability cutoff. The source's classroom time groupings do not determine an individual outcome
- **P. 522 Fig. 15.12:** lower-sensitivity phases still represent possible functional effects. “Less severe” in the source heading must not become an assurance that later exposures are harmless or inconsequential
- **P. 523 and p. 528 Q3:** vitamin C is presented too categorically. MotherToBaby's 1 November 2024 fact sheet says birth-defect risk from low or high intakes is not established and the evidence is limited; it describes the rebound-deficiency report as two babies, not a universal outcome. https://mothertobaby.org/fact-sheets/vitamin-c/ . Keep the distinction between insufficient evidence, a reported adverse outcome and a proven general teratogenic claim. No supplement/medication advice is needed in the lesson
- **P. 521 Table 15.2:** the footnote labels all listed lengths crown-to-rump, while its month-nine value is 50 cm. Do not adopt that table as a quantitative growth standard without a separate measurement-definition check. The table also contains dated generalizations such as twins “usually” being born in month eight; these are not necessary to the local checks

### Source material to quarantine rather than import

Slides 31 and 33–34 do not support the existing local tasks directly. Slide 34 compresses gene action into a Y-chromosome gene “encoding the secretion of testosterone,” and says absence means no testosterone. This is an inaccurate mechanism and overstatement. Official MedlinePlus describes SRY as encoding a regulatory protein involved in testis development: https://medlineplus.gov/genetics/gene/sry/ . Keep sex determination out of this narrow expansion unless deliberately sourced and taught. No inference about identity is appropriate.

## Optional task inventory and dependencies

All 17 currently routed optional items have existing local question images and their declared context images. No missing local file was found among their declared dependencies. Their original wording, subparts and graph/values are preserved in the receipts.

Lesson 07: 10 items

- `ch15-p515-in-text-q15`: neurulation definition. Needs lesson-06 explanation and Fig. 15.8/page context; not taught by placenta exchange alone
- `...q16`: two other week-three events. Needs pp. 513–514 and an explicit source-age convention. The supplied context images are pp. 514–515; p. 513 is in the embedded PDF but is not a declared crop for this item
- `...q17`: three week-four events. Full question and pp. 514–515 context exist
- `...q18`: four week-five-to-eight events and their times. Full question and pp. 514–515 context exist; needs prior organogenesis teaching
- `...q19`: when embryo becomes fetus. Full question and pp. 514–515 context exist; consistent with start of week nine after fertilization
- `ch15-p517-in-text-q20`: four extraembryonic membranes. Needs lesson-05 knowledge or p. 516 support
- `...q21`: membranes associated with placenta and cord. P. 516 supplies the course-level chorion/allantois account; avoid treating complex cord origin as allantois alone
- `...q22`: role of placenta. P. 516 Table 15.1 supplies nutritional, excretory, respiratory, endocrine and immune functions
- `...q23`: role of cord. Pp. 516–517 supply direction and vessel count
- `ch15-p518-section-15-1-q8`: all four subparts plus the full trophoblastic/placental-nutrition graph are present in one crop. Axis is weeks after implantation, ticks 0–40. The source uses widening bands rather than an ordinary y-value line graph and supplies no quantitative vertical scale. Teach approximate source interpretation and do not invent exact calculated equality dates or relabel its axis

Lesson 08: 7 items

- `ch15-p520-in-text-q24`: embryonic/fetal distinction; p. 520 supplies this
- `...q25`: three second-trimester events; requires more than the current generic lesson body. P. 520 and Table 15.2 give source examples, subject to the cautions above
- `...q26`: three third-trimester events; same support gap
- `ch15-p523-in-text-q27`: teratogen definition; pp. 521–522 supply it, while the current lesson appropriately uses broader developmental disturbance language
- `...q28`: three examples of dangers; source examples should be explained as possible effects of particular agents/exposures, not inevitable outcomes
- `ch15-p528-section-15-2-q1`: embryonic/fetal comparison; complete and consistent
- `...q3`: full two-part eight-item list present; historical single-answer premise requires a caution as above

Routing anomalies to report, not silently repair in a prose-only batch:

- P. 528 Q2 is an obvious trimester-classification task but is tagged only lesson-11/lesson-10, so it is absent from lesson-08's current filter
- P. 518 Q7, the six-support-structure summary, is tagged only lesson-06
- Relevant chapter-review questions p. 536 Q1/8/12/15 are routed to lesson-11 and chapter-review, not to lesson-07/08. The global “all questions” route still retains them
- P. 519's equipment-dependent investigation is expressly excluded from assigned self-contained written tasks. It nevertheless appears as p. 520 questions' full-page context. Do not invent microscopy observations

## Active tasks, source catalogue and protected boundaries

The active snapshot contains two required checks, four guided selections, two worked examples, four required selections, four written-response prompts, eight vocabulary records, 12 optional practiceQuestions (four source-linked adaptations plus eight definition-recognition items), eight typed questions, two authored application questions, one lesson-07 multiselect, one four-label diagram with four practice items, and two optional lesson-08 videos. All full local prompts/options/models were inspected.

Required checks:

- `ch15-check-07`: oxygen-rich umbilical vein by direction; selective exchange/incomplete barrier; written fetal blood round trip and harmful-exposure explanation
- `ch15-check-08`: tissue/timing-dependent effects; structural presence versus mature function; written age-convention explanation and early/late exposure reasoning

The four source-linked active practice entries are `OBJ_2131126`, `OBJ_2131134`, `OBJ_2131135`, `OBJ_2131136`. Active data, not the catalogue's original stems, drives current practice. Three were rewritten self-contained; `OBJ_2131135` retains the original trimester MC. Catalogue source images for `OBJ_2131126` and `OBJ_2131136` are not present in the supplied historical workspace. This does not break the current adaptations, whose stimuli arrays are empty. It does mean their original pictured contexts cannot be claimed independently re-inspected. Other archived cumulative source items also reference missing media. The raw UnitB assessment archive/XML is not present in this task's supplied source tree; the catalogue is inspectable, not a substitute for those absent originals.

Preserve:

- Both native `section.course-page` routes, previous/next destinations, terms/popups, figure IDs and enlargement controls
- Existing image/SVG bytes, captions and protected original media unless a separate authorization explicitly covers a correction. Explain schematic limits beside them rather than repainting labels
- Required check IDs, question IDs, radio values, answer options, prompts/models, save controls, textarea IDs, character limits, unlock gates, timers, submission/progress behavior and All My Work destinations
- Guided item IDs/selection values and their active-data answer mappings
- Global practice data, labeling answers, optional question IDs/crops/context, topic filters and source PDF
- Video IDs `izOa3-AX8zQ` and `BtsSbZ85yiQ`; actual PPTX links confirmed on slides 25 and 30. External playback was not tested. No core instruction may depend on playback

The native placenta SVG's C/D labels compress the incoming/outgoing fetal vessel pathways into a villus/capillary schematic. Do not teach that the drawing literally shows two full umbilical arteries within a single villus. Use the original p. 517 figure and nearby explanation to distinguish cord vessels from the capillary exchange network. The labeling key remains protected.

## Source supplements justified by actual gaps

- **Lesson 08:** Fig. 15.12, textbook p. 522, is the strongest available supplement for stage-specific susceptibility. Preserve source pixels and use a nearby age-convention/unequal-interval/limited-prediction explanation
- **Alternative/secondary:** teacher slide 21's critical-period image offers the same core relationship but has the early-safety wording caution; it is not an additional necessity if Fig. 15.12 is taught well
- **Lesson 07:** both a local schematic and the original p. 517 placenta figure already exist. No additional generic placenta artwork is justified. Improve explicit reading of maternal pools, fetal capillaries, tissue boundary, arrows and vessel direction instead
- Teacher slide-22/23/24 images are genuine source images, but their 40-week endpoint does not declare its dating convention. Do not use them as precise evidence for the chapter's post-fertilization axis without clarification

## Remaining gates

The source is sufficient for a carefully bounded teaching revision if the errors/optional cautions above are addressed visibly and original controls remain intact. A later fresh learner attempt must use the complete prompts and givens. Browser/runtime/save/resume/mobile behavior remains untested in this preflight; Chromium startup is reported blocked by the environment. Missing original catalogue images limit claims about historical assessment revalidation, not use of the present self-contained adaptations. No whole-chapter or clinical validity claim is made.
