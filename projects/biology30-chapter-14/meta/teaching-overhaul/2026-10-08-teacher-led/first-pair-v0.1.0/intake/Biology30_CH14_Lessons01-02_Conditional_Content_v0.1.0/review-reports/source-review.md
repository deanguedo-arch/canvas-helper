# Chapter 14 lessons 01–02: independent source and preservation review

Reviewed 8 October 2026. This is a review of a detached teaching candidate against the supplied historical Chapter 14 package. It is not a review of an implemented course or the user's current local copy.

## Decision by claim

- **Pass: biological accuracy of the revised explanations and worked examples**, within their stated classroom-model limits
- **Pass: meaningful interpretation of the actual anatomy figure**
- **Pass after repair and recheck: source coverage in the revised teaching prose**, including the restored penis function
- **Pass: historical-base integrity and structural preservation in the detached candidate**, with the exact limits below
- **Needs repair: full lesson/assessment release**, because the protected lesson 02 second writing prompt retains a consequential paired-duct/timing ambiguity, and one inherited optional item retains misleading clinical wording
- **Not verified: actual student learning, teacher acceptance, current-local parity, technical integration, runtime behavior, persistence, LMS operation or release**

No historical source, assessment, answer, task ID or course implementation was changed by this review.

## Sources actually inspected

1. Supplied textbook `workspace/assets/textbook/chapter-14.pdf`: complete printed pages 478–481 and 492, corresponding to PDF pages 3–6 and 17. Read page text and inspected the complete rendered page images, including Figures 14.1–14.3 and 14.12, Tables 14.1–14.2, sidebars and in-text questions. Verified the PDF page/printed-page mapping directly against the PDF. SHA-256: `82d37feec1390def949ed241d117e2b218b8dc8aa09d9cddead37fd6c64a49ea`.
2. Supplied `authoring/source-inputs/Unit B Chapter 14 Notes.pptx`: inspected rendered slides 3–10 in full and crosschecked embedded slide text. SHA-256: `b2d6ed2ff0e758f81e2c2dab288011188fa9c8370b873ebf2c70caf25499d229`.
3. Both original lesson sections, the current teaching JSON, both teaching fragments, manuscripts and detached reading pages, original lesson checks, preservation manifest, source map, imported-practice records and labeling-map records.
4. The existing male-anatomy image, the corresponding male labeling image, both first-pair table stimuli, and both numbered-anatomy stimuli. These were inspected as pixels, not inferred from alt text.
5. Official external verification sources, accessed 8 October 2026: [MedlinePlus SRY](https://medlineplus.gov/genetics/gene/sry/); [OpenStax Anatomy and Physiology 2e, section 27.1](https://openstax.org/books/anatomy-and-physiology-2e/pages/27-1-anatomy-and-physiology-of-the-testicular-reproductive-system); [MedlinePlus cystic fibrosis](https://medlineplus.gov/genetics/condition/cystic-fibrosis/); [MedlinePlus congenital bilateral absence of the vas deferens](https://medlineplus.gov/genetics/condition/congenital-bilateral-absence-of-the-vas-deferens/).

The current OpenStax 2e section is titled “Anatomy and Physiology of the Testicular Reproductive System.” The older URL ending `male-reproductive-system` returned 404. The verified link above works.

This reviewer did not receive or use a hidden answer key to pose as a first-time learner. This is the independent source/preservation review; the fresh learner attempt is a different review.

## Source fidelity and biology

### Lesson 01: Pass

- Section 1 correctly separates the reproductive organ, gamete and hormonal signal. It connects production in the testis to the different routes of sperm and testosterone rather than treating the terms as synonyms. This is faithful to p478 and teacher slide 4. The 23 + 23 = 46 account is explicitly a normal-pattern model, consistent with the chromosome material on slide 6 and the sperm description on p480.
- Section 2 defines primary/secondary characteristics by the type and reproductive role of the structure, not simply by whether it changes during puberty. The ovary/breast comparison makes that distinction usable. Reproductive ducts are correctly primary despite not producing gametes. Table 14.1 and slides 4–5 support the classification and individual variation.
- Section 3 states typical XX/XY associations, now explicitly names X and Y as sex chromosomes, and separates chromosome pattern, gene activity, developing gonad and tissue response. This is a scientifically appropriate refinement of slide 6 and p492, not a claim that those sources already contain every qualification. MedlinePlus supports SRY's role in initiating testis development and documents variations that justify “usually” and “typical.” The candidate does not claim testosterone alone determines every reproductive structure. [MedlinePlus SRY](https://medlineplus.gov/genetics/gene/sry/)
- The receptor explanation is accurate within its stated conditions. A missing functioning receptor changes responsiveness; it does not change chromosome number or transform a hormone into a gamete. The original prerequisite already introduces receptor-specific response, so this is elaboration rather than a hidden new prerequisite.
- Section 4 correctly treats puberty as further development/activity of existing organs and emerging secondary features. The hypothalamus/anterior-pituitary preview remains appropriately broad; detailed hormone-control pathways belong to the later lesson. Source slides and the original lesson support this scope.

### Lesson 02: biological accuracy and bounded source fidelity Pass after repair

- Production in seminiferous tubules, maturation/storage in the epididymis, the scrotum's temperature-related role, and Leydig/interstitial testosterone secretion agree with pp479–481. “Acquire the capacity for movement” is an appropriate formulation and avoids saying the sperm actively swim through every duct.
- The major duct sequence is correct and acknowledges small connecting ducts. Ductus deferens and vas deferens are correctly treated as synonyms. The ejaculatory duct is formed at the vas/seminal-vesicle duct junction and empties into the urethra through the prostate region. The bladder is correctly excluded from the sperm route, and ureter is distinguished from urethra.
- The text separates gland bodies from transport passages. Seminal-vesicle fructose, prostate fluid, bulbourethral lubrication and the combined fluid environment are appropriate at this level. The collective buffering statement avoids assigning every secretion the same composition. No exact sperm speed, count or fertilization probability is inferred from fructose reduction. OpenStax's transport/accessory-gland subsections independently support the duct relationships and fructose role. [OpenStax 27.1](https://openstax.org/books/anatomy-and-physiology-2e/pages/27-1-anatomy-and-physiology-of-the-testicular-reproductive-system)
- The lesson correctly separates endocrine transport through blood from sperm passage through ducts. It now explicitly asks whether one side or both sides are affected before inferring complete loss of sperm transport.
- **Bounded omission identified:** original lesson 02 section 4 taught that the penis provides a route for depositing semen in the female reproductive tract. The reviewed replacement describes its urethral/outlet role but drops that existing reproductive function. The function appears on textbook pp480–481/Table 14.2 and slide 8. **Closed after repair:** lesson 02 section 2 now ends the duct/penis paragraph with “During intercourse, it can deposit semen in the female reproductive tract.” Verified the exact sentence in JSON, manuscript, fragment and reading page. Re-read the adjacent duct-path paragraph: it still correctly follows the ejaculatory duct through the prostate to the urethra. Figure markup and all protected guided/check/writing content and IDs remain unchanged. This is a teaching-copy repair, not an assessment edit.

The candidate need not duplicate every source label or sidebar. In particular, sperm fine structure and Sertoli-cell detail belong to lesson 03 in the source map. This review is not certification that every optional textbook task across the chapter is fully covered by these two lessons alone.

## Actual figure interpretation: Pass

The existing color side-view image is a crop of Figure 14.2 on p479. The candidate asset is byte-identical to the historical image. The teaching fragment retains the original figure markup, asset path, alt text, caption, figure ID and enlarge control.

The new prose supplies consequential reading instructions:

- Section 1 directs the learner to the testis inside the scrotum, curved epididymis and departing ductus deferens
- It correctly identifies the black lines as label leaders, not direction arrows
- It says that the side view omits tiny connecting ducts and coiled seminiferous tubules, so the learner is not expected to see invisible microscopic structures
- Section 2 follows the visible duct around the bladder region, the short ejaculatory duct, and the urethra through the penis
- It explains why proximity to the bladder does not make the bladder a sperm-transport structure
- Section 3 locates the seminal vesicle behind the bladder, prostate below the bladder, and Cowper's gland lower down, then distinguishes gland secretion from traversal of the gland body

These statements match the inspected pixels. Slides 9–10 add the front view and testis enlargement; they corroborate paired structures and internal tubules. The candidate does not misrepresent its side-view image as that front view.

The source graphic is dense around the prostate/ejaculatory-duct junction, but the labels are discernible in the existing full-size image. No new incorrect leader line, relabeling or anatomy crop was introduced. Functional enlargement, popups and visual layout in an actual course remain untested.

## Worked examples and required writing: Pass with a preserved assessment caveat

### Lesson 01

The original worked example classified an ovary, egg and estrogen, substantially repeating the first required written response. The replacement instead asks whether equal hormone delivery establishes equal tissue response when receptor function differs. Its steps identify shared information, isolate the changed condition, justify the mechanism, test the conclusion and bound what cannot be inferred. It therefore teaches causal reasoning, not just the wording of either required written answer.

The optional uterus/egg/progesterone comparison is more than a cosmetic substitution: the uterus is a reproductive organ but not a gonad. The feedback explicitly teaches that reproductive organs are a wider category. The required writing still asks the learner to connect a gonad with its gamete and hormone, while the second response requires a primary/secondary comparison. Both have visible explanatory support in the teaching sections.

The new example overlaps the pre-existing guided receptor question, but that is supported rehearsal, not answer leakage into required writing. It should not be advertised as a new independent assessment.

### Lesson 02

The original blocked-vas example closely reproduced required writing question 2. The replacement isolates a reduced gland contribution while keeping production, maturation and transport normal. Its reasoning distinguishes composition from transport and keeps unsupported quantitative/clinical inferences out. This changes a consequential condition.

The optional application then changes both epididymides' passage while leaving downstream gland entry points open. It explicitly limits its prediction to newly transported sperm and declines to infer whether sperm already existed farther downstream. The worked example and application thus contrast changed fluid composition with changed cell transport. They teach a reusable method and are not a verbatim model answer to the unchanged blocked-vas writing prompt.

The optional application is close transfer to that writing prompt and should not be counted as proof of independent mastery. Required writing question 1 remains ordinary pathway synthesis taught visibly in sections 1–2.

## Protected assessment issue: Needs repair before full lesson release

`ch14-l02-check-writing-2` is unchanged:

“Explain why a blocked vas deferens could prevent sperm from appearing in semen without stopping all semen production.”

The original model explains transport versus gland secretion but does not specify both sides or deal with pre-existing downstream sperm. The word “could” permits a qualified answer, so the prompt is not false in every reading. However, a blockage on one side alone does not establish loss of sperm from the other, and the expected model gives no conditions that resolve the ambiguity. The new teaching appropriately notices a nuance the old assessment leaves unstated.

Disposition: preserve the original prompt/model/criteria/ID and historical response meaning. Follow the separate `PROTECTED_ASSESSMENT_DECISION.txt` for the proposed, unapplied clarification. An authorized, version-aware assessment decision is required; a passing teaching-source review must not be labeled a full lesson-release Pass.

## Original first-pair optional imported practice and diagrams

All 10 relevant imported items were inspected: one assigned to lesson 01 and nine to lesson 02. None was edited.

- `OBJ_2131097`: **Pass for source answer**. Inspected table `646fd8c557960fad.png`: row A pairs oviducts with breasts; keyed Row A agrees with the intended primary/secondary classification
- `OBJ_2131554`: **Pass**. Below-core scrotal temperature matches p479
- `OBJ_2131095`: **Pass**. Seminiferous tubules followed by epididymis correctly locates production and maturation/storage
- `OBJ_2131096`: **Pass for source answer**. Inspected table `0494827f4e9ddf52.png`: row B contains prostate and Cowper's glands, the two accessory glands asked for
- `OBJ_2131106`: **Pass for source answer**. Inspected numbered image `5538ea0e4a8af8b0.png`: 6, 7 and 8 correspond to seminal vesicle, prostate and bulbourethral gland, as keyed
- `OBJ_2131107`: **Pass for source answer; inherited typo Needs repair separately**. In inspected `f0f497f31b18db94.png`, 9 points to the epididymis. The distractor says “prostrate gland” rather than “prostate gland.” Preserve now and correct only within authorized assessment scope
- `OBJ_2131568`: **Pass for intended endocrine/duct distinction; wording caution**. The explanation correctly sends testosterone through blood to target tissues. The option “reaches all the body tissues” is broad and must not be read to mean every tissue responds. The candidate's receptor teaching supplies the distinction; item wording was preserved
- `OBJ_2131575`: **Pass for keyed mechanism**. The two-testes body-cavity model makes temperature the relevant change. Its deliberately implausible distractors make it a weak measure of transfer; no claim of difficulty or mastery follows from correct selection
- `OBJ_2131579`: **Pass for intended components/mechanism**. Fructose plus buffers is the supported choice. The clinical framing is a simplified assessment scenario, not enough information to diagnose an actual person's fertility; the candidate does not make that extrapolation
- `OBJ_2131542`: **Needs repair in the inherited stem; intended transport answer remains sound**. The stem calls absence of the vas deferens an unusual/rare form of cystic fibrosis. MedlinePlus states that most men with CF have CBAVD. Its separate CBAVD page says this can occur alone or with CF and describes CFTR-associated cases without other CF features as atypical CF. Thus the old wording may intend isolated atypical CFTR-related CBAVD, but it does not say so and blurs that distinction with the common association in classic CF. Do not assert its intended clinical subtype as a fact. [MedlinePlus CF](https://medlineplus.gov/genetics/condition/cystic-fibrosis/) and [MedlinePlus CBAVD](https://medlineplus.gov/genetics/condition/congenital-bilateral-absence-of-the-vas-deferens/)

A minimal future correction could state a bounded bilateral absence/transport model without the unnecessary rarity claim, while preserving the source record. This report does not authorize or apply it.

The lettered male labeling image was also inspected. A–J correctly retain the original leader-line positions for vas deferens, urethra, penis, seminal vesicle, ejaculatory duct, prostate, bulbourethral gland, epididymis, testis and scrotum. The two numbered “2” markers on the inherited grayscale diagram point to parts of the same vas deferens; they are not competing answer IDs.

Inherited accessibility caveat: the four table/numbered-image stimuli use generic alt text (“Original diagram or table needed to answer this question”), which does not expose the essential row/number relationships to a nonvisual reader. This is an existing practice-delivery issue, preserved here and not certified by image-answer correctness.

## Preservation evidence and limits

### Historical integrity: Pass

Recomputed all 322 entries in the frozen checksum list against the historical Chapter 14 package. All passed. Also independently checked the manifest's four governing full-file hashes against both historical and frozen files:

- `scripts/content.py`: `15f3e496a739a40f7de85ccfa8a8dcaadfb0a4ebb4274f4c36c272244d542a2e`
- `scripts/build_chapter.py`: `915625267d4ea0a5a2bbd5cb86c62d3a9767f1d5aebcadcfb7b0169ee0eb704a`
- `workspace/index.html`: `4ce8de9382426b07de164b5de82ab6c25cd2471f41f309f7208311d3b523d1d0`
- `authoring/course-config.json`: `22a968d603d78dd5cd12e81324f8f4df4fbd29161413de20873884c714d1ffe8`

The archive-level hash in the manifest was not independently recomputed from the original ZIP during this review. The 322 file-level results are direct checks, not an inferred archive verification.

### Detached candidate structure: Pass

- Exactly the four teaching blocks and worked block per lesson retain their original block IDs
- All original paragraph `data-canvas-edit-key` and `data-canvas-helper-edit-key` values remain present; nine additional paragraph keys support the expanded prose (four in lesson 01, five in lesson 02)
- All original inline vocabulary `data-term-id` values in the replacement targets remain present; no original vocabulary ID is missing
- The lesson 02 figure markup is unchanged in the fragment, including the existing figure/enlarge IDs and original course-relative asset path
- The new optional applications have no saved task/check/writing identifiers; teaching fragments contain no input, textarea, select, form or script
- Both detached reading pages preserve original guided-practice text/IDs and required-check text/IDs, including both written prompts, models and criteria; all original element IDs remain present and no duplicate IDs were found
- Reading pages intentionally disable their controls and contain no scripts. Their unchanged button labels do not establish operational functionality
- Teaching paragraph text agrees across current JSON, fragments, manuscripts and detached reading pages
- The reading-page image path is intentionally adjusted to the detached preview's local asset. The source fragment retains the original integration-relative path

This proves preservation in the supplied historical base and detached review files only. It does not prove compatibility with current local overrides, existing saved-response schemas, derived worked-example records or any live integration. The manifest correctly requires separately authorized integration and synchronization of the worked owner/derived record.

## Final reviewed snapshot after the bounded prose recheck

- `teaching-copy.json`: `6ebcce60037694329efd7316fb19cbfa5d76eb967d5f10c38b7e8c06995483f1`
- Lesson 01 fragment: `db318b627f145573a7e419c3fe97701fe3ba5dc3cb44b7c7b4081df9e070f478`
- Lesson 02 fragment: `2262ba9e1bbc26f77fd74e95604e5ea66d88c1ee2d54a779e7668ad067f13ece`

- Lesson 01 reading page: `c982acd89d8398c3186164a4bfcecf785f309f868132aaebc26b02ca9b860d59`
- Lesson 02 reading page: `f23d65de9e5cc6bba145e99c19e877a7dc09ef7ba400734c1ed8129519982fe1`
- Lesson 01 manuscript: `ee4bfdcffae8152abeb79f5d70b596f82ce3ad224003c456a0ba78887ebd81c3`
- Lesson 02 manuscript: `88a4028f5445251c03d98485775e83cd5c58df27abc2b55e0fa285999700ab6c`

Final recheck at 18:38 UTC: all lesson 02 teaching paragraphs agree across the four representations; figure markup is unchanged; guided/check/writing text and identifiers are preserved; all 322 historical checksum entries still pass. The sole new teaching-copy repair raised here is closed. The protected assessment ambiguity and inherited optional-bank findings remain unresolved and preserved; see the separate decision records. No broader source/clinical review is implied. A later change to these bytes requires the affected claim to be rechecked.
