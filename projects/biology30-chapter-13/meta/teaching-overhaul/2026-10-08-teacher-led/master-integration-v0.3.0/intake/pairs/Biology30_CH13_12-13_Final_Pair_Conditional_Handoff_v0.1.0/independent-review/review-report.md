# Independent content review: Biology 30 Chapter 13, lessons 12–13

## Result

**Pass, bounded to the final content and source evidence described below.** Two small learner/feedback defects were found independently, reported, repaired by the author, and rechecked in the final artifacts. There is no remaining demonstrated lesson-content blocker. The initially reported muscle/liver corroboration gap was closed for the actual limited lesson claim with an independently opened additional textbook source; stronger unneeded biochemical claims remain outside this review.

This is content-only review. It does **not** establish teacher acceptance, browser layout, quiz execution, keyboard behavior, native-shell preservation, state persistence, LMS completion, mastery, or unfamiliar learner transfer.

Final hashes independently read from actual files:
- Lesson 12 learner HTML: `0af4f53bcbe3abfd34497418018a2aa105ef55dca6abe97684e9a169652a7c69`
- Lesson 13 learner HTML: `79ba59062886d821e506a641c97d931c336c80cb9e0cc274aa4c9a104b3cd999`
- Original first-attempt record remains `1a01af83a617858c6944e17157ab32b81c1ee2048e5ee7ce1976fb5628d44664`

See `reviewed-artifacts.json` for exact source/output paths and source hashes; `first-attempts.md` for all 21 answers and exact visible-support mapping; `lesson-12-content-diff.txt` and `lesson-13-content-diff.txt` for inspected initial-to-final content diffs.

## Review independence and coverage

Read only the two blind TXT exports, their HTML image content, and the specified liver companion image before forming and saving all answers. No prior lesson was verified or credited as prerequisite. The L12 base64 SVG was extracted from the blind HTML, rendered with Inkscape and inspected as pixels; L13 contains no source figure. The existing visible worked examples were read, but comparison feedback, answer keys, source adjudication and author rationale were withheld until the record was saved and reported.

Only after that report did I inspect the two feedback HTML files and the native configured `selection-and-transfer-feedback.json`, then independently read the actual textbook PDF and unzip the actual teacher PPTX for selected XML, image relationships and pixels. Frozen Course production standards v0.2 applicable U01–U15, B01–B05 and V01 were then read. Historical records outside those applicable rules were not independently re-audited. This review does not inherit an earlier reviewer’s conclusions.

All 21 items were attempted: L12 guided 2, required selections 2, writing 2, stop 1, optional dataset 1; L13 required selections 6, writing 2, optional transfer selections 3, transfer writing 1, stop 1. All 13 selection answers match the supplied configured keys. All five required/transfer written responses meet their listed criteria. Both stop responses agree with the explanations. The optional dataset response gives actual values, changes, sampled duration bounds and an appropriate inference limit. This is an expert reviewer’s constrained attempt, not an observed student test or proof of mastery.

## Repairs and affected rechecks

### R1: T4 naming bridge — Needs repair → Pass

Initial L13 required selection 2 uses “Low T4 with elevated TSH,” while local teaching used “thyroxine” without defining T4. The first attempt explicitly marked that name equivalence as imported vocabulary; the feedback conditional itself was locally supported.

Smallest repair: name “thyroxine (T4)” once in the primary-versus-upstream mechanism row. The final actual HTML now says: “Low thyroxine (T4) permits increased TSH when pituitary control works.” The following upstream-failure clause remains present. Reattempt: low T4 with elevated TSH fits primary thyroid underproduction when pituitary control is intact; an insufficient pituitary signal can instead give low thyroid output without an appropriate TSH increase. No imported vocabulary is now needed. Optional transfer item 1 and required writing 2 remain consistent. This reattempt occurred after feedback and is labelled a repair recheck, not another independent first attempt.

### R2: optional glucose-data feedback — Needs repair → Pass by supplement

Initial protected optional model only instructed the learner to identify rises, peaks, falls and duration. It did not show values, and “peaks” lacked the lesson’s sampled-data qualification. The required first attempt was nevertheless supported by the main lesson and table.

Smallest repair used: add a separate, closed “Compare after your own supper-data attempt” disclosure to the teaching worked block. The final HTML has no `open` attribute on this disclosure. It supplies Maria 4.5 → 6.5 → 4.5 mmol/L and Tamika 9.0 → 18.0 → 12.0 mmol/L at 6, 7 and 11 p.m.; correctly distinguishes “back by bedtime” from “still above at the sampled time”; limits the highest value to these observations; and gives a plausible insulin mechanism without diagnosing or prescribing. Its revision instruction specifically addresses invented exact peak/return times. Normal time/unit spacing is now present.

Recheck: all supplied values equal actual p.458 pixels. Maria’s sampled change is +2.0 then −2.0; Tamika’s +9.0 then −6.0, still +3.0 above pre-supper at bedtime. Exact intervening peaks/return times remain unknown. The first-attempt answer already meets this comparison; no answer was retrofitted. The generic protected model remains present and unchanged in meaning. This report approves the supplement’s sufficiency, not a claim that the protected model was rewritten or that the disclosure lock works at runtime.

### Neighboring-content recheck — Pass, content only

The final table still contains all nine original data pairs and their events. Breakfast demonstration remains 4.0 → 7.0 → 4.5 and 10.0 → 14.0 → 10.0. No numbers, hormone mechanisms, question demands or completion expectations changed in the identified repairs. T4 clarification does not alter source/failure conditions. Main text still explicitly separates uptake from hepatic storage/output, diabetes type from age/treatment, ADH production from release, and neural medulla control from the ACTH-cortex axis. No clinical-treatment demand was added. Broader byte/state preservation requires its own owner-level check and is **Not verified** here.

## Actual textbook identity and dataset verification

Read and rendered the supplied actual `chapter-13.pdf`, a 38-page PDF, not a standalone source-summary image. Physical PDF pages 23–32 show printed pages 456–465, verified from footers and chapter headings. Fresh renders are saved under `source-pixels/page-23.png` through `page-32.png`; extracted text is `textbook-456-465.txt`.

**Pass:** the nine-row dataset is Thought Lab 13.1, printed p.458, “Maria’s and Tamika’s Blood Glucose Levels over 15 h,” in mmol/L. It is not the different p.460 simulated-disorders table, p.462 insulin/glucagon hike graph, or p.465 review question 30 glucose curves. The source stipulates identical meals and exercise timing and neither person presently taking insulin. The actual p.458 attribution spells “Dr. Edmund A. Ryan,” University of Alberta; the final learner attribution matches it. The p.460 table’s “Edmond” spelling is a separate source label and must not be substituted.

Verified directly from the p.458 page pixels, in order:
1. Wake up, 8 a.m.: Maria 4.0; Tamika 10.0
2. 1 h after breakfast, 9 a.m.: 7.0; 14.0
3. Pre-lunch, noon: 4.5; 10.0
4. 2 h after lunch, 2 p.m.: 6.0; 15.0
5. Mid-afternoon, 3 p.m.: 4.5; 10.0
6. 1 h after vigorous exercise, 4 p.m.: 4.0; 4.0
7. Pre-supper, 6 p.m.: 4.5; 9.0
8. 1 h after supper, 7 p.m.: 6.5; 18.0
9. Bedtime, 11 p.m.: 4.5; 12.0

The lesson’s explicitly narrowed optional task does not reproduce the historical lab’s treatment-threshold or medication demands. It accurately tells learners not to use these as personal clinical instructions. No invented measurement, sample density, exact physiological peak, diagnosis or treatment was used in the review.

## Actual teacher source and visual review

Unzipped `teacher-chapter-13.pptx` directly and read slide XML and relationships for 33–37 and 43; extracted actual embedded images and inspected their pixels. `teacher-33-37-43-extraction.txt` records the selected XML text/relations. These are source-content inspections, not slideshow or video-playback tests.

- Slide 33 / image48.png: endocrine pancreatic output enters blood; exocrine enzymes enter ducts. L12 retains this distinction.
- Slide 34: beta/insulin after-meal and alpha/glucagon low-glucose routes, hepatic glycogen storage/breakdown. L12 retains and develops them, while avoiding a universal-cell glucose-door rule.
- Slide 35 / image29.png: diagram explicitly groups “liver and muscles” before blood glucose release in the glucagon arm. The lesson identifies and limits this misleading grouped arrow instead of reproducing it in its liver-only illustration.
- Slide 36: poor insulin supply/action, hyperglycemia, urine glucose and water loss; also calls ketones a toxic by-product. L12 explains the missing urine-osmosis steps and limits ketone danger to excess accumulation rather than classifying every ketone as inherently toxic.
- Slide 37 / image28.png: supply failure versus response failure; slide text includes childhood diagnosis and broad treatment labels. L12 retains the mechanism comparison and explicitly prevents age or insulin use becoming a type-identification rule.
- Slide 43 contains endocrine-review labels and linked-video thumbnails for hormone cascades, stress, growth/metabolism and glucose. It does not itself supply a complete transcript or an independent mechanism explanation. No video correctness or availability claim was made.

L12 actual embedded SVG pixels: both three-box sequences are readable; arrow and feedback directions agree with the visible explanation. Liver companion PNG: intracellular glycogen is shown on both sides, glucose arrows point into storage after the meal and out to blood between meals; the caption explains symbolic chemistry and omitted intermediates. No asset-pixel clipping or contradictory arrow was observed at inspected source resolution. Alt text matches the depicted compartments/routes. **Not verified:** small-screen lesson rendering, zoom, screen-reader behavior or integrated asset availability.

## Source corrections: exact identity and external corroboration

The following external sources were opened successfully, and their relevant bodies/PDF sections were read. Search snippets were not credited as opened evidence. These are physiology checks, not medical advice or a clinical protocol.

1. **Type 1/type 2, age and insulin treatment — Pass.** Actual textbook p.459 says type 2 can become type 1 when insulin-dependent; this is the precise obsolete statement the lesson corrects. NIDDK distinguishes autoimmune beta-cell destruction from inadequate production/action in type 2, allows both types outside rigid age categories, and explicitly includes insulin among type-2 medicines. Thus needing insulin does not itself establish autoimmune type 1. [NIDDK type 1](https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-1-diabetes), sections “What is,” “Who is more likely,” “What causes” and blood-glucose tests; [NIDDK type 2](https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-2-diabetes), “What is,” “Who” and medicines.
2. **Mellitus versus insipidus — Pass.** Actual p.460 already separates the disorders. NIDDK explains hypothalamic vasopressin production, pituitary release, inadequate hormone availability and renal resistance, supporting the mechanism distinction without a high-glucose requirement. The lesson uses the central/nephrogenic teaching model without claiming to exhaust every cause. [NIDDK diabetes insipidus](https://www.niddk.nih.gov/health-information/kidney-disease/diabetes-insipidus), causes and central/nephrogenic subsections.
3. **Insulin tissue specificity and hepatic output — Pass.** Endotext distinguishes insulin-independent uptake (including brain) from insulin-responsive peripheral uptake and describes suppressed hepatic production after glucose ingestion. This supports the lesson’s refusal of an absolute “every cell needs insulin to obtain glucose” rule. [Endotext, Pathogenesis of Type 2 Diabetes Mellitus, publisher PDF](https://www.endotext.org/wp-content/uploads/pdfs/pathogenesis-of-type-2-diabetes-mellitus-6.pdf), glucose homeostasis, peripheral uptake and oral glucose-load sections, PDF pp.2–7. This is a successfully opened older chapter version; no claim of latest clinical management is made.
4. **Liver glucagon supply and continuing basal secretion — Pass.** Endotext describes alpha-cell glucagon, hepatic glycogenolysis/gluconeogenesis and basal insulin/glucagon balance. Actual textbook p.457 Figure 13.25 has an adipose-fat-to-glucose shortcut, distinct from the teacher slide-35 liver/muscle grouping. The lesson accurately identifies both specific source features and teaches the relevant hepatic routes instead. [Endotext Glucagon Physiology](https://www.endotext.org/wp-content/uploads/pdfs/glucagon-physiology.pdf), PDF pp.5–8. The correction is not a claim that no component of fat can contribute substrate: glycerol’s hepatic gluconeogenic contribution is acknowledged by the separately opened [Non-Diabetic Hypoglycemia](https://endotext.org/wp-content/uploads/pdfs/non-diabetic-hypoglycemia.pdf), PDF p.2.
5. **Ketones — Pass.** NIDDK’s type-1 DKA subsection supports excessive ketones during severe insulin deficiency as dangerous. Endotext Non-Diabetic Hypoglycemia PDF p.2 explains liver ketone production and their alternative-fuel role. This corroborates the carefully bounded lesson correction to textbook p.457 and teacher slide36.
6. **ACTH source, cortical failure and distinct medulla route — Pass.** Actual printed p.463 explicitly misassigns ACTH to the hypothalamus; p.465 question25 separately asks the correct hypothalamic/pituitary/adrenal chain. [Endotext ACTH Action on the Adrenals](https://www.endotext.org/wp-content/uploads/pdfs/acth-action-on-the-adrenals.pdf), PDF pp.1–4, places ACTH in anterior-pituitary corticotrophs, hypothalamic CRH upstream and glucocorticoid feedback on both. The supplied intact-upstream/failed-cortex case therefore supports increased ACTH as an inference under its stated conditions. [NIDDK adrenal insufficiency causes](https://www.niddk.nih.gov/health-information/endocrine-diseases/adrenal-insufficiency-addisons-disease/symptoms-causes) and [diagnosis](https://www.niddk.nih.gov/health-information/endocrine-diseases/adrenal-insufficiency-addisons-disease/diagnosis) corroborate pituitary ACTH deficiency and an adrenal gland that cannot respond adequately. [Endotext Stress](https://www.endotext.org/wp-content/uploads/pdfs/stress-endocrine-physiology-and-pathophysiology.pdf), PDF pp.8–9, supports glucocorticoid feedback and sympathetic/adrenomedullary output.
7. **Aldosterone principal controls — Pass.** Endotext ACTH Action on the Adrenals PDF p.4 identifies angiotensin II and potassium as the main aldosterone regulators, with ACTH secondary. The lesson correctly says “principal” and does not claim ACTH has no possible influence.
8. **PTH/calcitonin asymmetry — Pass.** [Endotext Calcium and Phosphate Homeostasis](https://www.endotext.org/wp-content/uploads/pdfs/calcium-and-phosphate-homeostasis.pdf), PDF pp.3,6,19, corroborates the lesser calcitonin role, PTH renal calcium conservation and indirect vitamin-D intestinal action. [Mayo Clinic Laboratories calcitonin information](https://endocrinology.testcatalog.org/show/CATN), Clinical Information, independently describes calcitonin’s minor normal calcium-regulatory role.

9. **Muscle storage versus the named hepatic glucagon route — Pass for the actual taught claim after source-access recheck.** The coordinator supplied one additional candidate source after the initial first-attempt and source reports. I independently opened and read [OpenStax Concepts of Biology 4.5](https://openstax.org/books/concepts-biology/pages/4-5-connections-to-other-metabolic-pathways), “Connections of Other Sugars to Glucose Metabolism.” It identifies muscle glycogen as an energy reserve supporting ATP production during exercise. Together with the successfully opened Endotext Glucagon Physiology hepatic-output section, this corroborates the lesson’s limited distinction: muscle glycogen mainly supports muscle fuel needs, while the named glucagon route supplies blood glucose from the liver. The lesson does not teach an absolute receptor-absence or glucose-6-phosphatase explanation, and none is required for its tasks. This bounded corroboration closes the earlier research-access gap; it is not evidence for a stronger molecular exclusion.

**Excluded failed opens — Not verified:** relevant NCBI/PMC detailed biochemical pages returned browser-check pages; Cold Spring Harbor full HTML/PDF returned 403; MDPI returned 429. These failed opens and their search snippets were never counted as evidence. The successful OpenStax source above supports the actual modest statement without importing those unavailable details.

## Standards and workload disposition

- U01/U02/B02 — **Pass after R1:** every consequential local task step has visible support; only initial T4 naming needed repair. Full attempt-to-support mapping is in the separate record.
- U03/U04/B04 — **Pass, bounded:** L12 moves from distinctions to two loops, mechanism consequences, worked comparison and practice. L13 consolidates nine contrasts with a common explanation frame. Its upstream-failure case changes the failure condition; however, the table already rehearses similar cases, so unfamiliar far transfer is **Not verified**.
- U05 — **Pass after R2:** saved writing is explicitly ungraded, criteria are available after attempts, and supplied feedback agrees with correct biology. Required L13 writing1’s model is a concise summary rather than a complete causal exemplar; its criteria and visible mechanism rows supply the control distinctions. No protected model or key was silently changed in this review.
- U06/V01 — **Pass for inspected source pixels and meaning; Not verified for target viewport/rendered UI.**
- U07 — **Pass:** attempts saved and reported before feedback; no expert gap-filling hidden in the record.
- U08/U09/U15 — **Pass for bounded repairs, source identities and rechecks; the originally open muscle-source item was rechecked against a successfully opened source at the claim’s actual scope.**
- U10/U11/U12/U13/U14/B03 — **Not verified where these concern native owner integration, byte/state preservation, runtime tests, delivery or user acceptance.** Static content inspection cannot establish those gates.
- B01 — **Pass for exact supplied textbook/teacher source locations and the opened correction evidence; Not verified for independent Alberta-program-scope certification.**
- B05 — **Pass:** true supplied data are separated from inference, simplified models from diagnoses, and completion from understanding.

L13 remains compact integration in the core teaching: one frame, one mechanism table, short interpretation guidance and existing checks. It states one required final-check run (6 selections + 2 written explanations). The transfer set, textbook exercises and six videos are clearly optional. Neither repair adds a required task, replaces the chapter with a second chapter of work, or demands all optional resources. Six visible optional video blocks still lengthen the page, but content alone does not show a completion burden. No workload duration or student-effort measurement is claimed.
