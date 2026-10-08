# CH15 final pair 11–12: independent learner, source and assessment review

8 October 2026. Frozen Course production standards v0.4. Final reviewed copy is identified by `final-verification.json`.

## Result

**Pass for the six authorized teaching replacements, their local learner support, and the source-size science-art review, after two ordinary repairs.** All 53 local task identities were attempted before source keys or author rationale were read; eight optional Frayer forms were also completed. No ordinary teaching repair remains.

This does **not** clear every inherited optional source task. Protected wording/context defects below remain unchanged. The separate 46-item cumulative unit-review first attempt belongs to another reviewer and is not included in this local result. Target-size lesson layout, application execution, saving/reopening, LMS behavior, teacher acceptance and release are **Not verified**.

## First-attempt evidence and independence

`first-attempts.json` contains every answer, the visible teaching or figure that supported it, ambiguity notes and explicit deduplication. Its SHA256 remains `9212b257396b35489f0f118dd317b881e3e82aa87cd6b8bc4ad74b3c4d6c443f`. No answers were rewritten after opening keys or after the repairs.

The 53 task identities comprise:

- 2 guided selections and 1 stop-and-think response in lesson 11
- Lesson 11 required 2 selections and 2 written explanations
- Lesson 12 required 6 selections and 2 written explanations
- Lesson 12 independent 3 selections and 1 written explanation
- 3 optional source-written applications, using all four actual assessment images
- All 31 lesson 11 optional-practice identities: 5 source-adapted MC, 4 foundation MC, 1 application MC, 4 contextual typed items, 16 derived vocabulary items and 1 scenario-flash identity

The eight Frayer forms contain all 32 fields, each within 240 characters. The four lesson 12 anchor words are earlier chapter vocabulary, not a newly invented lesson 12 practice bank.

HTML, plain-text and prompt-JSON copies of the same identity were counted once. The identical prompt shared by `ch15-l11-application-1` and `ch15-l11-scenario-1` is explicitly cross-referenced; both identities remain in the record, with the same first response. Definition questions with different lead-ins were retained as separate tasks rather than incorrectly called exact duplicates.

An initial review-packet defect was found and repaired before keys were opened: all prior-lesson text files were empty, and HTML contained only `<article></article>`. The parent regenerated the permitted teaching extracts from the nested native owners and supplied their actual figures. The initial pending-response file is retained. The membrane matching item was deliberately held until lesson 05 and its source pixels were available; it was then answered as 4, 2, 1, 3 from the restored teaching. Lessons 03 and 10 were also read for the hormone-chain and suckling-reflex dependencies. Repaired prerequisite hashes are in `first-attempts-input-hashes.json`.

A tool-level status listing incidentally exposed a short earlier preflight summary mentioning optional Q21/Q24/Q26 and contraception flags, without local answers. The first native JSON read also displayed some cumulative prompts, but no cumulative answers were attempted. These exposures are disclosed in the frozen attempt record. No local key, feedback, original source document, config or author rationale was opened before the complete first attempts were saved.

## Independent assessment check

The original native `course-data` was extracted independently from `ch15-source/unpacked/chapter-15/workspace/index.html`. It equals the actual authoring `course-config.json` in all 24 top-level values. Static reading of `revision-practice.js` confirmed the 16 derived vocabulary prompts and scenario flash; `main.js` confirmed the Frayer fields and limits. Neither script was executed.

- All 23 selection responses match the native answer text
- All 12 deterministic term responses match the native term or derived answer
- All 9 explanation/correction flash responses are scientifically valid paraphrases
- All 5 native written responses satisfy the stated models and criteria
- The 3 independently derived source-written results agree with the historical catalogue keys 2413, 53142 and 4213; these are not current automatic grades
- The stop-and-think explanation correctly separates transport from endocrine function
- The Frayer examples and distinctions are valid alternatives to the displayed course models

The early-pregnancy writing answer properly qualifies the question's use of “feedback.” The hCG → corpus luteum → progesterone/endometrium chain alone does not specify a return loop. The existing model likewise describes that support chain and contrasts it with labour's explicit reinforcing stretch–oxytocin–contraction loop. A learner should not be required to invent a negative-feedback loop to match the word “feedback.” This is a protected prompt limitation, not a failed learner explanation.

The contextual typed prompt for hormonal contraception says that a method changes reproductive feedback “and/or conditions for sperm passage.” Outside the four-term lesson context, that wording can also describe some physical barriers. The intended answer is taught and was selected, but this review does not establish that the prompt excludes every scientifically valid alternative. The protected prompt, aliases and key were not changed.

## Source and science review

The actual original native lesson owners, complete config, actual teacher PPTX XML/relationships, original chapter PDF, and current protected assessment images were inspected independently before reconciling the preflight report. This review did not treat the preflight's conclusions as a substitute for the originals.

The teacher-deck extraction contains all 42 slides; focused reading covered the final-pair material on slides 35–42 and relevant developmental/lactation text on slides 19–28. All ten embedded image assets referenced by slides 35–42 were extracted directly from the PPTX and viewed. Slide 35 is a prior sex-development discussion; it is not an unfilled required technology lesson. Slides 36–39 establish laboratory fertilization, embryo transfer, hormonal stimulation and insemination; 40–42 cover barriers, hormone control and interrupted ducts. Whole-slide layout and linked video playback were not reviewed.

The original PDF was independently text-extracted. Printed pages 529–537, Table 15.2 on 521, the full Figure 15.18 page on 531, full source pages 528/536/537, all 41 native optional question texts and all 42 question/continuation crop images were examined. The crop sheets in this folder were built from the original assets without resizing their constituent images. The four protected source-written images and the lesson 11 supplement were viewed at source size. The prerequisite membrane, hormone and lactation source figures and the two needed SVG schematics were also viewed.

The new teaching preserves the supported mechanisms: IVF fertilization occurs outside the body; transfer is separate from implantation; hormonal follicular stimulation does not open an obstructed duct; duct interruption does not itself remove gonadal hormone production; accessory glands contribute fluid; hormone-based methods can differ; evidence about an intermediate event does not prove birth; evidence and value judgments need separate reasoning.

The corrections to old contraception claims are independently supported. [FDA's Plan B mechanism review](https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/plan-b-one-step-15-mg-levonorgestrel-information) supports preventing/delaying ovulation and rejects an implantation mechanism. [WHO's 2026 IUD account](https://www.who.int/news-room/fact-sheets/detail/intrauterine-devices) distinguishes copper and hormonal devices. The [FDA Mirena label, sections 12.1–12.2](https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/021225s043lbl.pdf) documents local mechanisms and ovulatory cycles; this historical label is used as a mechanism counterexample, not current prescribing advice. No old numerical efficacy estimates or treatment schedules were turned into new universal claims.

## Repairs and affected rechecks

1. **Third-trimester support, lesson 12 teaching 01.** The separate cumulative reviewer identified that prior lesson 08's broad “later maturation” wording did not fully distinguish rapid late brain/network development from earlier skeletal formation. Actual teacher slide 24 gives rapid brain development, slide 22 places skeletal hardening earlier, and PDF Table 15.2 records early bone growth. The added paragraph explains rapid third-trimester growth and increasingly complex neural connections while explicitly saying brain development began earlier. [Prospective in-utero tractography research](https://pubmed.ncbi.nlm.nih.gov/32399686/) independently documents third-trimester tract development; the [26–38-week structural-network study](https://pmc.ncbi.nlm.nih.gov/articles/PMC11255424/) was available through indexed primary-source results, while a direct full-text open was blocked. The final paragraph was re-read beside the unchanged age-convention paragraph, final chronology writing and structure-versus-function transfer prompt. It supplies the missing comparison without claiming that all neurons first form in the third trimester. The cumulative task remains protected and that review's original first response remains separate.

2. **Figure 15.18B correspondence, lesson 11 teaching 02.** The initial alt text said the drawing showed both oviducts interrupted, but the source pixels visibly mark an interruption on one illustrated side. The author changed the alt text to “B illustrates an interrupted oviduct while the ovaries and uterus remain” and changed the viewing cue to locating the labelled interruption. Reinspection against the actual original PDF and unchanged crop confirms the corrected language. The procedure's biological explanation is preserved, and no source pixels were edited.

The repaired copy retains the normal-hormone/blocked-transport distinction, the worked contrast with suppressed LH surge, the semen-fluid clarification and the warning that source label arrows do not show hormone movement. The final chapter worked example and eleven-topic summary table remain unchanged.

## Protected optional-source limitations retained

The 41 optional textbook tasks were reviewed for source dependencies; they did not receive a new blinded answer set in this review. The following prevent a blanket optional-source sufficiency or assessment-quality pass:

- Q21 on p536 refers to the ectopic-location figure on p537, but its task mapping supplies p536 only
- Q24 incorrectly receives a cropped portion of that ectopic figure as its “required continuation”; the actual 44-day problem is already complete on p536
- Q26's question crop ends mid-sentence and cuts the twin diagram. Its supplied full p537 is essential. The claim that all identical twins have one chorion and two amnions is not universal; the [NHS source](https://www.nhs.uk/pregnancy/your-pregnancy-care/antenatal-care-with-twins/) explicitly distinguishes alternative identical-twin arrangements
- Q19's sensitivity graph has no numerical y-axis scale, stated agent/dose or explicit age convention; it supports qualitative comparison, not an exact probability
- Q22's unspecified drug does not uniquely establish which production/response step was altered. Reduced prolactin is a reasonable classroom possibility, not a unique diagnostic deduction
- The source-written 2413 image heading says “ovulation to implantation” while including gastrulation. The chronological sequence remains answerable; the heading remains inaccurate
- The source-written suckling image lists an acute release reflex, despite bundling hypothalamic hormone production and posterior release and mentioning milk production in its heading. The teaching correctly separates secretion/ejection functions
- The generic alt text on the four protected assessment images does not transcribe the essential numbered givens, so nonvisual accessibility is not cleared
- Broader optional tables/research tasks require source reading and current evidence about safety/effectiveness; lesson 11 is not a clinical reference. Historical infertility thresholds, vitamin-C/cultural-diet assumptions and parturition generalizations must remain qualified rather than become universal facts
- Eleven historical catalogue stimuli are absent from the handoff, independently confirmed by file checks. Current adapted tasks do not use those images; original historical pixel parity is not established

No protected source prompt, key, feedback, mapping, assessment image, progress rule or record meaning was modified to remove these flags.

## Preservation and delivery gates

Independent normalized DOM comparison finds exact semantic preservation outside the six allowed owners. It includes the final worked synthesis, summary table, headers, reading links, term bindings, guided/stop/required/transfer tasks, optional written disclosures, controls and navigation. All four assessment images remain byte-identical to the original native assets. The one added transport asset is byte-identical to the authorized exact PDF crop. All 35 available frozen original files still match their original counterparts. The native task payload remains equal to authoring config.

`final-verification.json` binds the final fragments/manuscripts/learner files to hashes and records the independent comparison results. `verify_final_review.py` can repeat these file-only checks. This evidence is static; the course runtime was never launched.

Standards application: D02/D04/D05, U01–U10/U12/U15 and B01–B05 are supported within this stated source/teaching scope. U06/V01 support is limited to source-size pixels and alt/cue correspondence. D06/U11/U13 target rendering, complete product fit, execution/save/LMS paths, and D07 teacher acceptance/release remain separate outstanding gates. This is not a demonstrated student-learning gain, a full chapter/course pass or authorization to deploy.
