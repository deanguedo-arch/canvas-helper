# CH14 lessons 03–04: feedback comparison and bounded second verdict

## Result

All 17 first-attempt answers agree with the supplied keys, models or preserved stop-and-think explanations. This is **not** a claim that all 17 tasks are equally supported: **16 tasks have complete visible instructional support; inherited numeric task 04-9 remains partly positional/eliminative even though the attempted 3421 matches the source key.** No first-attempt answer needed correction after feedback. The exact paragraph/figure support for each answer remains in `learner-first.md` and was recorded before feedback access.

Three targeted edits are verified in the current reading copies: lesson 03 now explains “germ cells” before its later use; lesson 04 now says “Two pituitary signals reach different cells”; and lesson 04 explicitly acknowledges the inherited numbered image’s unnamed cell targets and directs learners to optional textbook Figure 14.13 on p494. The heading mismatch is resolved. The textbook referral makes the dependency transparent; it does not make the numbered stimulus independently sufficient.

## Sources and boundaries

After preserving the first report, I read:
- `review-feedback/lesson-03.json`
- `review-feedback/lesson-04.json`
- `candidate/lesson-03.reading.html`
- `candidate/lesson-04.reading.html`

The candidate stop-and-think and comparison details are now included in this second review. The initial normalized text comparison, with comparison-answer blocks withheld in both versions, found only the first two stated teaching changes relative to the frozen blind copies. A subsequent targeted read verified the additional optional-textbook dependency sentence, documented below. These checks cover the text of these two reading files; it is not a deployed-course, runtime, configuration or persistence test.

The feedback JSONs' `guided.worked` objects describe the historical worked examples. As the parent clarified, those configuration records intentionally remain frozen. I reviewed the revised examples as they actually appear in the current reading copies and did not mistake the historical objects for current learner-visible content. I did not change assessment content, keys, prompts, stimuli, course configuration or lesson files.

## Per-task answer and feedback verdicts

### 03-1 — Required selection: interstitial cell

**Answer verdict:** Correct against the supplied key. Fully supported before feedback by lesson 03 teaching 01 p3 and the interstitial location in panel B.

**Feedback verdict:** The cue, “Use both its position and its product,” directs attention to the two consequential clues. The explanation explicitly supplies “between tubules” and “release testosterone,” so a learner confusing this with a Sertoli cell can repair both location and function. This is sufficient feedback for the bounded selection.

### 03-2 — Required selection: acrosome

**Answer verdict:** Correct against the supplied key. Fully supported before feedback by teaching 03 p1 and the cap label in the sperm figure.

**Feedback verdict:** The cue separates enzyme-containing structure from ATP-producing structures. The explanation names acrosomal enzymes and contrasts the tail's movement job. It repairs a structure–function confusion without suggesting that the acrosome supplies movement energy. Sufficient for the selection; it is not a full fertilization mechanism lesson.

### 03-3 — Required writing: distinguish Sertoli/interstitial locations and functions

**Answer verdict:** Meets both criteria: gives both locations and connects each cell type to the correct function. The first response's additional distinction that these cells do not become sperm is supported in the lesson and consistent with the model.

**Feedback verdict:** The model is concise but complete for the exact prompt. The two criteria make the learner check location and function instead of merely naming both cells. No automated correctness judgment of saved writing is inferred; the page explicitly states saving is not grading.

### 03-4 — Required writing: primary → two secondary → four spermatids → differentiated sperm

**Answer verdict:** Meets both criteria and all consequential parts of the model: two distinct meiotic divisions, four haploid products, then differentiation without another chromosome-set reduction. The first answer also distinguishes differentiation from doubling four cells to eight, directly supported in teaching 02 p4.

**Feedback verdict:** The model supplies the exact stages and distinguishes specialised structures from another chromosome-number reduction. The criteria are adequate for self-checking the two major distinctions. The model's mention of heads, middle pieces and flagella is compatible with the taught sperm structures; my first answer's “features such as a compact head and a flagellum” was an example list, not a claim that the middle piece is absent. No revision needed.

### 03-5 — Guided selection: Sertoli cell

**Answer verdict:** Correct against the supplied key and explicitly supported by teaching 01 p3.

**Feedback verdict:** The hint separates support cells from cells becoming gametes. The explanation contrasts Sertoli support with secondary spermatocytes as reproductive-cell stages. This addresses the plausible stage/support confusion. It does not repeat “inside” in the explanation, but the prior teaching states the location directly; the feedback is sufficient in context.

### 03-6 — Guided selection: differentiation

**Answer verdict:** Correct against the supplied key; teaching 02 p4 directly supplies the next step.

**Feedback verdict:** “Separate a change of cell shape from another division” targets the consequential wrong inference. The explanation gives acrosome/flagellum development as examples. It is useful and consistent with the broader lesson definition of specialisation in structure and function, although the short hint alone is narrower than that full definition.

### 03-7 — Stop and think: four sperm are not identical copies

**Answer verdict:** Agrees with the preserved candidate explanation: “No. Meiosis produces haploid cells with genetic variation.” My answer had already separated equal chromosome counts from genetic identity using teaching 02 p3.

**Feedback verdict:** It confirms the relevant genetic-variation distinction and identifies where detailed chromosome combinations are studied later. It does not itself explain mechanisms of variation; that is an explicit scope limit, not a gap needed to answer this question. I did not open Chapter 16 or borrow its mechanisms.

### 03-8 — New optional application: failed Sertoli nourishment despite normal testosterone

**Answer verdict:** Agrees with the new optional model. The disrupted job is local Sertoli-cell support; normal hormone release establishes a separate functioning contribution, not normal development.

**Feedback verdict:** The explanation identifies the failed job, contrasts the unaffected contribution, and explains why the normal measurement is insufficient. Its explicit limit on counting surviving sperm or diagnosing a person is useful. This is feedback on the causal inference, not merely the answer name. Fully supported by prior teaching without needing the feedback to introduce a missing prerequisite.

### 04-1 — Required selection: anterior pituitary → LH → interstitial cells

**Answer verdict:** Correct against the key and fully supported by teaching 01 p2–p3 and the main SVG's right branch.

**Feedback verdict:** The cue asks for release site and direct target; the explanation supplies both plus the target's testosterone function. Sufficient for source/hormone/target correction.

### 04-2 — Required selection: outside androgen can reduce FSH/LH through feedback

**Answer verdict:** Correct against the key. Teaching 04 p1–p2 explicitly explains the conditional sequence and the difference between circulating signal and local testicular stimulation.

**Feedback verdict:** The cue redirects from an invented physical blockage to feedback. The explanation correctly says an outside androgen can suppress upstream signals and reduce sperm-production support. It is adequate to correct this selection, but less detailed than the teaching: by itself it does not restate the separate FSH → Sertoli and LH → interstitial/testosterone branches. A learner needing that explanation must return to the already-present teaching; I do not count this short feedback as an independent full account of both branches.

### 04-3 — Required writing: GnRH and two pituitary branches

**Answer verdict:** Meets both criteria: correct sources, hormones and targets; explains how Sertoli activity and testosterone contribute to spermatogenesis. The first response explicitly included anterior-pituitary release of both FSH and LH, which the model conveys in its abbreviated sequence.

**Feedback verdict:** The model and criteria preserve direct targets and the shared outcome. They allow a learner to detect reversal of FSH/LH targets or omission of the testosterone step. Sufficient for the prompt; no microscopic mechanism or clinical prediction is claimed.

### 04-4 — Required writing: rising testosterone reduces upstream stimulation

**Answer verdict:** Meets both criteria and agrees with the model: feedback reaches control centres, reduces GnRH/LH, tends to limit further testosterone production and opposes the initial rise.

**Feedback verdict:** Both the direction and the reason for “negative” are explained, including that it does not mean undesirable. The model retains “tends to,” avoiding guaranteed restoration or a quantitative claim. Sufficient for the stated functioning model.

### 04-5 — Guided selection: falling FSH first reduces Sertoli stimulation

**Answer verdict:** Correct against the key and fully supported by teaching 01 p3 and the explicit left-hand branch in the SVG.

**Feedback verdict:** The hint identifies target separation; the explanation names both FSH/Sertoli and LH/interstitial pairings. This directly repairs the likely target swap. Sufficient.

### 04-6 — Guided selection: rising testosterone reduces GnRH/LH

**Answer verdict:** Correct against the key and teaching 03 p1.

**Feedback verdict:** “Trace the return arrow” directs the learner to the relevant part of the figure rather than the forward stimulatory path. The explanation states that higher testosterone strengthens feedback and reduces upstream stimulation. Together with the named answer and teaching, this repairs the direction-of-response error. Sufficient for a qualitative prediction; it gives no exact magnitude or timing.

### 04-7 — Stop and think: LH does not make sperm directly

**Answer verdict:** Agrees with the preserved candidate explanation. The direct LH effect is interstitial testosterone release; FSH acts on Sertoli cells, and those contributions support sperm production.

**Feedback verdict:** It restores the skipped interstitial/testosterone step and contrasts the FSH target. The final phrase “these signals support” is brief, but its meaning is clear in the accompanying explicit teaching. Fully answerable before feedback; no revision required.

### 04-8 — New optional application: lower inhibin releases FSH from restraint

**Answer verdict:** Agrees with the optional model. FSH would tend to rise; usual testosterone feedback does not itself establish a corresponding LH rise. My first answer deliberately used “can increase” and did not claim exact levels or that LH is guaranteed unchanged under every possible condition.

**Feedback verdict:** The model identifies FSH, the specific inhibin loop and the unchanged testosterone-feedback condition. It explicitly warns against moving all pituitary hormones together. This directly addresses the central transfer task and is fully supported by teaching 03 p4–p5 even though inhibin is omitted from the main SVG. The prose openly acknowledges that visual omission.

### 04-9 — Inherited numeric task: 3421

**Answer verdict:** My provisional 3421 matches `original_optional_source.original_key`. The requested order is unambiguously LH, inhibin, FSH, GnRH in the second stimulus image. Matching the key establishes answer agreement only.

**Support verdict:** **Qualified, unchanged from the blind attempt.** Numbers 2 and 3 label two downward pituitary-to-testis paths, but their endpoints are not explicitly named Sertoli or interstitial cells. I inferred 3/LH from its left-side relation to the labelled interstitial/testosterone output and then assigned 2/FSH by comparison/elimination. The testicular output at 4 and upper signal at 1 can also be interpreted from the provided hormone list and pathway arrangement, but the anatomical stimulus does not name all of their source/target structures. This is less secure evidence than the new teaching SVG's named boxes.

**Feedback verdict:** The supplied object contains a key and provenance, not an explanation that would repair a learner's 2/3 swap or clarify the unnamed target endpoints. No learner-visible numeric feedback was present in the inert candidate's optional writing block. I do not infer runtime feedback or grading. The inherited task and both stimuli remain preserved; I made no silent repair and do not claim a full visible-support pass for this item.

## Verification of the targeted revisions

### Germ-cell term at first use

**Verified current wording:** In lesson 03 teaching 01 p2: “These developing reproductive cells are also called germ cells. They belong to a lineage in which successive stages lead toward sperm.”

**Bounded verdict:** This provides a direct, learner-facing synonym before “Germ cells develop through division and differentiation” in teaching 04 p3. It removes a possible terminology jump without changing the reproductive/support-cell distinction or adding an unsupported step. The visible text comparison found this as the only non-feedback teaching-text change in lesson 03.

### Pituitary heading

**Verified current wording:** “Two pituitary signals reach different cells.”

**Bounded verdict:** Resolved. It now agrees with the body and diagram: FSH and LH are the two anterior-pituitary signals, with different direct targets; GnRH is the preceding hypothalamic signal. The initial visible text comparison found this as the only non-feedback teaching-text change in lesson 04 at that point. The later optional-resource transparency addition is reviewed separately below.

### Optional numbered-task resource dependency

**Verified later addition in lesson 04 teaching 04 p4:** “The numbered image compresses the target cells into one testis. Compare it with the labelled Figure 14.13 in the optional textbook on p494 to identify the branches; the drawing alone does not name their cell targets.”

**Bounded verdict:** This accurately and explicitly marks the visual limitation observed during the blind attempt. It gives the learner a specific optional source and figure for the missing branch identification, rather than pretending the numbered image labels those targets. Its position immediately after the numbered-task instructions makes the dependency visible before attempting that item. The parent reports that a separate source reviewer verified the p494 figure; I have not independently opened that textbook figure in this review, so I do not claim to have verified its labels, availability or in-product navigation.

**Support classification remains unchanged:** The numbered stimulus alone does not secure the 2/3 assignment. The activity now openly depends on comparing an optional textbook figure for that distinction. This is a transparency improvement, not a standalone-stimulus pass or a silent assessment repair. The task prompt, two images and original key remain unchanged in the reviewed reading material.

## Revised worked examples: bounded review

- **Lesson 03:** The visible revised scenario changes mitochondrial ATP supply while preserving normal-looking heads, acrosomes and tails. Its steps use already-taught energy dependence to predict impaired movement, then distinguish appearance from function and refrain from inventing chromosome/count/testosterone results. Those claims are supported by teaching 03 p1–p3 and teaching 04 p1–p2. This is a valid content-level transfer example. It is not evidence that a particular real sample has that cause.
- **Lesson 04:** The visible revised scenario changes interstitial responsiveness, explicitly states low testosterone and functioning control centres, and traces weaker inhibition to potentially increased GnRH/LH. It then explains why more signal does not guarantee recovery at a nonresponding target. Teaching 01 p3 and teaching 03 p3 support those links; the fifth step appropriately leaves FSH, inhibin, sperm count and treatment unresolved. This is a valid content-level transfer example within the stated hypothetical model.
- **Historical configuration boundary:** These findings concern the worked examples in the supplied candidate reading copies. The older `guided.worked` JSON records are not evidence that the new examples failed; conversely, reading the candidate does not establish which content any deployed renderer selects. That runtime question was outside this assignment.

## Final bounded disposition

- **Answered before feedback:** 17/17 tasks attempted
- **Agreement after feedback:** 17/17, counting the 16 supplied/current explanations and the inherited numeric key
- **Complete visible support for consequential steps:** 16/17
- **Retained limitation:** The inherited numeric task's 2/3 distinction is partly positional/eliminative; key agreement does not remove it
- **Targeted edits:** All three verified; heading issue resolved, germ-cell term introduced before reuse, and optional textbook dependency made explicit
- **Scope not claimed:** Live rendering, activity unlocking, answer saving, progress, source configuration selection, deployment or medical/scientific validation beyond the supplied learning material
