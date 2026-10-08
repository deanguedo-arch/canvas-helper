# Independent source and preservation review for Chapter 14 lessons 03 and 04

Review date: 2026-10-08 UTC

## Decision

Pass for the scientific content, source reconciliation, and preservation of the teaching-only candidate after the ordinary clarity repairs described below. One inherited optional assessment stimulus has a source-verified answer but still needs clarification if it is to be treated as independently answerable from explicitly labelled cell targets. No assessment was changed in this review.

This review concerns the supplied historical base and candidate only. It does not establish current-local state, runtime operation, course integration, teacher acceptance, or authorization for historical assessment adaptations. Pending issues from lessons 01–02 remain outside this review.

## Evidence inspected

- Full rendered textbook printed pages 480–481 and 492–495, including their figures, tables, questions, sidebars, and Thought Lab 14.2; extracted text was used alongside the page images
- Full rendered teacher slides 11–20, with native slide XML text checked against the images
- Both complete original lessons, extracted from the frozen index and independently confirmed identical to their corresponding index sections
- The complete candidate teaching JSON, lesson manuscripts, teaching fragments, and reading pages
- The original supported tasks, stop-and-think tasks, required selections and written-response comparison models, vocabulary, video explanations, original optional numeric task, seven mapped imported practice records, raw source assessment catalogue, and recorded assessment dispositions
- The original figure bytes and actual images; the feedback SVG was inspected through the accurate Inkscape render, which preserves its CSS, arrowheads, and dashed return lines
- The source archive, frozen file hashes, all 322 historical checksum entries, and all eight recorded original teaching-block DOM hashes

## Claim-by-claim decisions

### Cell roles and source conflict: Pass

The candidate correctly separates germ-cell development from Sertoli support inside seminiferous tubules and Leydig/interstitial testosterone production between tubules. The first-use definition of “germ cells” added during review is accurate and removes an avoidable vocabulary gap.

The textbook p493 sentence assigning FSH-stimulated sperm production to interstitial cells is genuinely erroneous. It conflicts with the p480 cell locations, the p494 branch diagram, and the teacher diagram. The candidate explicitly reconciles it rather than quietly reproducing it. The teacher slide 17 prose also loosely describes Sertoli cells as producing sperm; the candidate’s separation of supporting cells and reproductive lineage prevents that misconception.

The hormone targets are supported by the authors’ [Endotext axis figure](https://www.ncbi.nlm.nih.gov/sites/books/NBK279031/figure/endocrin-male-reprod.F12/): FSH targets Sertoli cells, LH stimulates Leydig testosterone production, and testosterone supports seminiferous function and upstream feedback. Original experimental work also distinguished receptor localization in [human and rat testis](https://pubmed.ncbi.nlm.nih.gov/6309888/). The candidate appropriately teaches the main pathways without claiming they exhaust all testicular interactions.

### Meiosis and differentiation: Pass

The candidate correctly teaches mitotic maintenance of spermatogonia, primary spermatocytes, two meiotic divisions yielding four spermatids, a haploid human count of 23, and subsequent differentiation without another reduction division. It does not repeat the slide 13 implication that a spermatogonium first performs two complete meioses while becoming a primary spermatocyte. Its learner reconciliation of “two cycles” as two divisions is appropriate.

The [NHGRI meiosis definition](https://www.genome.gov/genetics-glossary/Meiosis) supports the two-division/four-haploid-product account. The [NCBI-hosted Molecular Biology of the Cell meiosis chapter](https://www.ncbi.nlm.nih.gov/books/NBK26840/) specifically describes a second division without another DNA replication; its [sperm chapter](https://www.ncbi.nlm.nih.gov/books/NBK26914/) identifies the two secondary spermatocytes and four spermatids. The accessible search excerpts supplied the relevant passages when full-page access was unreliable.

### Sperm structure, maturation, and causal limits: Pass

The head/nuclear chromosome set, acrosomal enzymes, mitochondrial ATP contribution, flagellar movement, and epididymal maturation are consistent with p480 and slides 11–14. The candidate distinguishes energy supply from the movement apparatus and does not treat a drawing or normal cell count as evidence of normal function. Its wording says mitochondria help supply ATP and that reduced supply can impair movement; it does not claim mitochondria are the sole ATP source or infer an exact measured motility change.

### Hormonal feedback and the outside-androgen model: Pass

The candidate correctly follows hypothalamic GnRH to pituitary FSH/LH, distinguishes direct targets from downstream hair/voice effects, and defines negative feedback as opposition to the starting change. It treats testosterone feedback and the Sertoli/inhibin-to-FSH loop separately. The simplified retained SVG omits inhibin; the candidate explicitly names that omission and teaches the loop in words rather than pretending it is pictured.

Original human research supports inhibin B’s major role in FSH feedback while distinguishing it from LH responses: [Hayes et al](https://pubmed.ncbi.nlm.nih.gov/11701733/). A study of [gonadotropin suppression and replacement in men](https://pubmed.ncbi.nlm.nih.gov/3138288/) supports the suppression of pituitary signals by exogenous testosterone. The candidate keeps its outside-androgen prediction conditional and does not offer medical-use instructions or diagnose an individual.

### hGH reconciliation: Pass

Slide 19 really does classify hGH as an example of a steroid. The candidate correctly identifies growth hormone as a protein hormone and avoids extending the androgen-feedback model to every performance-related substance. The protein classification is directly confirmed in the manufacturer’s [FDA-hosted somatropin description, page 1](https://www.accessdata.fda.gov/drugsatfda_docs/label/2016/021538s002lbl.pdf). That historical label is used only for molecular identity, not current prescribing information.

### Figure use and learner directions: Pass, with the optional-stimulus limitation below

The testis figure directions match panels A–D, the interstitial-cell label outside the tubules, and the developing cells approaching sperm on the right. The candidate properly warns that broad curved arrows connect related/enlarged views rather than indicating cell-type conversion. The sperm directions correspond to the cap, head, short middle section, and long tail.

The feedback figure really has a left FSH/Sertoli branch, a right LH/interstitial branch, green forward connections, and red dashed testosterone feedback ending in inhibitory bars at hypothalamus and pituitary. The candidate’s figure-specific directions match it. These positions differ from the textbook’s Figure 14.13; the optional numbered task must therefore not be answered merely by transferring the candidate SVG’s left/right layout.

### Changed worked-example reasoning: Pass

Lesson 03 originally began with malfunctioning flagella. The candidate begins instead with reduced mitochondrial ATP contribution despite normal-looking structures. Its chain is component → energy supply → movement dependence → limits of visual evidence, while leaving cell count, chromosomes, acrosomal activity, and endocrine function unresolved. This is a substantive reasoning change, not a renamed version of the original prompt.

Lesson 04 originally began with falling LH and responsive interstitial cells. The candidate instead specifies a failed interstitial response, low testosterone, and functioning control centres. It predicts increased upstream stimulation without guaranteed restoration at the unresponsive target. Its explicit limit on FSH/inhibin and sperm-count inferences is appropriate. The new optional inhibin application similarly asks for FSH-specific reasoning without requiring a parallel LH rise.

The original required task models and answer options remain unchanged; only the designated teaching worked-example containers are replaced.

### Ordinary clarity repairs: Pass after recheck

1. The misleading heading “One pituitary signal divides into two testicular jobs” was replaced with “Two pituitary signals reach different cells” in the teaching JSON, manuscript, fragment, and reading page
2. “Germ cells” is now explicitly defined at first use in lesson 03

3. A bounded clarification now explicitly identifies the unnamed targets in the optional numeric stimulus and directs the learner to labelled Figure 14.13 on p494, as documented below

No other scientific repair to the candidate prose was identified.

## Protected material and imported records

### Preservation against the frozen historical base: Pass

The candidate retains every original lesson ID and edit key; it adds paragraph keys for new prose without deleting existing keys. After removing only the ten permitted teaching/worked containers and normalizing the reading-page visibility, disabled controls, and relocated asset references, both complete lesson DOMs are identical to the originals. Thus the original guided choices, keys, hints, feedback, stop-and-think tasks, required selections, written prompts/models/checklists, vocabulary, optional numeric response, and surrounding lesson material are preserved.

All five figure/assessment asset files are byte-identical. The figure subtrees, including captions and alternative text, also match after normalizing only read-only control disabling and asset paths. The frozen source files remain unchanged. These are static preservation findings, not runtime findings.

### Seven imported records: Pass for preservation and taught science; historical authorization not verified

- OBJ_2131098: Acrosome → enzymes. Original four option texts and correct answer are retained in the historical import
- OBJ_2131539: LH directly stimulates testosterone production. Original option meanings and correct answer are retained, with letter prefixes removed by the historical import
- OBJ_2131153: FSH is the expected source answer for sex-cell production in both systems. The historical explanation distinguishes Sertoli support from follicular development; female-system completion belongs to later lessons
- OBJ_2131163: Correct LH effects include ovulation, corpus-luteum formation, and testosterone production. The historical import already replaced the source’s “all of the above” option set with one combined correct option and new distractors
- OBJ_2131102: GnRH → anterior pituitary → FSH and LH. Original option texts and answer are retained
- OBJ_2131103: The historical import already narrowed a broad “responsible for sperm production” stem to the pituitary signal directly stimulating Sertoli functions, preserving FSH as the key. This removes the source’s FSH/testosterone ambiguity
- OBJ_2131122: The historical import already replaced a PBDE-exposure stem and its stimulus with a hypothetical reduced-testosterone model. LH remains the correct answer under the stated functioning-control-centre conditions

This candidate changes none of those records. Exact raw-quiz fidelity must not be claimed for the three existing adaptations. This review neither approves nor reverses them, and does not infer authorization from their presence in the historical base.

## Original optional numbered hormone task

### Source key: Pass

OBJ_2131119’s raw catalogue key is 3421. Its requested order is LH, inhibin, FSH, GnRH. Comparing the numbered stimulus with the labelled textbook Figure 14.13 gives 3 = LH, 4 = inhibin, 2 = FSH, and 1 = GnRH. Both stimulus files, the prompt, response ID, and saved-writing status are unchanged. The source key is a verification result here, not a newly inserted answer key in the candidate task.

### Standalone cell-target clarity: Needs repair if claimed; inherited limitation is retained

The numbered image does not label Sertoli cells or show a named Leydig endpoint for each incoming arrow. Figure 14.13 labels LH on the left, FSH on the right, and the corresponding output descriptions below; the numeric version substitutes 3 and 2 for the hormones and 4 for the right-side output. A learner can associate the branches with their outputs, but separating 2 and 3 partly relies on this arrangement or comparison with the labelled source. A matching source key alone does not prove independently clear target-cell evidence.

Do not silently redraw, relabel, re-key, or replace this protected assessment. The final candidate now includes the bounded teaching clarification outside the task: it acknowledges that the numbered image compresses the cell targets into one testis, states that those targets are unnamed, and directs the learner to the labelled Figure 14.13 on p494. This exact addition was rechecked in the JSON, manuscript, teaching fragment, and reading page. It improves source guidance without repairing the protected stimulus itself. If the assessment must stand alone without that comparison, its stimulus needs a separately authorized repair. This is a narrow inherited visual limitation, not a newly introduced scientific error in the teaching candidate.

## Not verified

- Current-local course files, runtime saving/grading/progression, deployed output, and teacher acceptance
- User authorization for historical imported-assessment adaptations
- Independently clear named target-cell endpoints in the protected numeric stimulus
- Original Library download provenance of the frozen v0.3 standards text; the manifest itself labels that provenance unverified

## Verified hashes

All 322 historical SHA256SUMS entries match. The source archive independently hashes to 904db6f6e58c4d68689c611e2b6f2e3f5b020f48d6db55d366b934dbcf396a58. All eight original teaching-block DOM hashes in the manifest match HTML serialization of the verified original lesson blocks.

The final candidate and supporting asset hashes are appended below from the files actually reviewed. They identify this reviewed snapshot; later changes require rechecking affected claims.

- `teaching-copy.json`: `a9799de30403cb96c28b1abd1e1a5bd8afcf2cdbb2fa0d3204af473d7a8f45de`

- `PRESERVATION_MANIFEST.json`: `ce161115b86f1a0a0175753098ddae17f3e76e966747e35e1991a3944665aecc`

- `candidate/lesson-03.reading.html`: `4f4b76d1a52f702b966a1847fb23b5d0a30145b97242454ea91e4c8a150378e5`

- `candidate/lesson-03.teaching-fragments.html`: `fd11eba3c77994103909c0d543b83876db2fea9769960cecd5be7b363e9486b9`

- `candidate/lesson-03.teaching-manuscript.txt`: `995486c830e1c4165d9d466114f3f6dccd56713c711580d9651417aa3e870337`

- `candidate/lesson-04.reading.html`: `10eaae78f33d0d0957e0fe3cf8b147845a2b149a7c92453a830edc5627e9e73b`

- `candidate/lesson-04.teaching-fragments.html`: `c65f9a35ecdd62d814341ea1882a8bdf248d83dcf54c18d299005e48f65ae96e`

- `candidate/lesson-04.teaching-manuscript.txt`: `67279d624fb7723bab73d4e92f5a62d5c60bd7b296a5d49a53e8296a13a8b716`

- `assets/1fe7d26423286fef.png`: `1fe7d26423286fef95c0ddcd0c5b2dcb447aebd8699ee8f3d3f5ca5ce8c343e7`

- `assets/3e94259b702ce9b6.png`: `3e94259b702ce9b60ca1ed96f8ad78f088dbb4a4b245291343fa6e53630da441`

- `assets/male-feedback.svg`: `1e9579a27e090ce7c755423c2fc9537e911c2c9c4fe49c0d84346b9c5bd388b8`

- `assets/sperm-structure.png`: `246b73cae9be2ce43e44f7079ecec08759c23eb3361ac3e7a32ef94b60e72109`

- `assets/testis-cells.png`: `a712160606975d4874d7fab4c59120b2fabd2ea676d44c05bd72975cc8621ed7`
