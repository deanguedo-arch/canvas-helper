# Chapter 17 remaining teaching: source sequence and science review

Research date: 6 October 2026. Scope: lessons 08–15 and the optional extension in the frozen source packet. This is a source and science review, not authored lesson copy, teacher acceptance, a runtime test, or publishing approval.

## Result and release-relevant findings

The complete 114-slide original and 38-page textbook chapter are present and readable. All slide text, notes, XML shape content, image relationships and hyperlink relationships have been extracted. The actual remaining native routes exist in the supplied index. Both teaching standards were read in full. Original media for the relevant remainder were inspected as pixels; selected textbook pages were rendered and inspected.

The source sequence is useful, but it cannot be copied without corrections. Highest-priority defects are:

1. Slide 80 prints a different parental cross from the cross that its square and answers actually solve
2. Slides 78–79 overstate what a small all-unaffected family says about an unresolved genotype
3. Slide 87's annotated X-linked pedigree leaves an allele unknown where the descendants actually force it
4. Slide 92's BRCA explanation is incorrect
5. Slide 96's final written ratio does not match its own parental phase
6. Slide 109 fixes a three-locus order without the third pairwise comparison needed to distinguish two arrangements
7. Slide 110 wrongly presents a sample frequency above 50% as a diagnostic rule
8. The packet references three native diagrams that are absent from its actual asset directory: `ch17-pedigree.svg`, `ch17-linkage.svg`, and `ch17-map.svg`
9. Official Alberta assessment guidance includes contextual gene-interaction problems even though the supplied slide deck and this textbook chapter do not explicitly teach a two-step interaction model

Source science is therefore READY WITH DOCUMENTED CORRECTIONS for drafting, not evidence that the existing teaching or any new manuscript has passed review. Owner-file recovery/rebase and delivery testing remain separate gates.

## Evidence files and methods

- Full slide text and notes: `extracted/ppt_slide_text.txt`
- Full textbook text by page: `extracted/pdf_fulltext.txt`; structured pages: `extracted/pdf_pages.json`
- Actual remaining native section text/HTML/links/images: `extracted/remaining_lessons.json` and `extracted/remaining_lessons_text.txt`
- Complete exact PPTX asset relationships: `source_asset_relationships.json`
- Source image files: `extracted/ppt-media/`
- Seven review-only contact sheets: `asset_contact_1.jpg` through `asset_contact_7.jpg`
- Rendered textbook pages: `extracted/pdf-images/p601.png`, `p603.png`, `p604.png`, `p607.png`, `p609.png`, `p612.png`, `p613.png`, `p614.png`, `p618.png`

PPTX inspection used direct ZIP/XML extraction, preserving original media bytes. The contact sheets composite transparency on white for viewing, but extracted media are untouched. This is not a PowerPoint application rendering of entire slides. All relevant original media were visually inspected; slide text includes diagram labels and equations that are native shapes, so absence of a bitmap does not mean absence of a source visual. PDF pages are 603 × 783 points. Printed page = one-based PDF page + 583: printed 584 is PDF 1; printed 621 is PDF 38.

## Source hierarchy and teaching requirements

`02_TEACHING_STANDARD.md` and `CHAPTER11_TEACHING_STANDARD.md` control teaching quality, not official outcome authority. They require the essential mechanism in the visible lesson, purposeful visual reading, worked choices and calculations, meaningful changed-condition examples, guided and fresh independent application, explanatory feedback, and a connected progression. Definitions, videos, and textbook reading cannot carry an otherwise missing explanation. They do not authorize a new shell, route changes, replacement of stable checks, or deletion of saved work. Keep scientific corrections and source conflicts in developer documentation rather than exposing source-repair commentary to learners.

The original deck supplies classroom progression and emphasis. Its recurring moves are especially useful: predict a cross, identify what the requested group is, justify an allele from an offspring, compare a new observation with a Mendelian expectation, and then use the same evidence for mapping. Textbook science has priority, except where a genuine outdated or erroneous claim needs authoritative correction. Existing check answers must be mapped and protected, with conflicts reported separately rather than silently changed.

## Verified official Alberta authority

Primary source: [Biology 20–30 Program of Studies, 2007, updated 2014](https://education.alberta.ca/media/159727/bio203007.pdf), printed pp. 69–70 (PDF pp. 69–70). Verified relevant outcomes:

- 30–C2.2k: allele-model genotype/phenotype ratios and probabilities
- 30–C2.3k: linkage, crossing over, and variability
- 30–C2.4k: variability in relation to the number of contributing genes
- 30–C2.5k: sex-chromosome versus autosomal inheritance
- 30–C2.1sts: social, cultural, environmental, ethical, and economic perspectives on applications
- 30–C2.2s: investigation skills, with an environmental-expression example
- 30–C2.3s: quantitative interpretation, pedigrees, maps, and small-sample limitations

These are verified codes; no separate epistasis code should be invented. The standards alone do not establish these codes.

The official [2025–2026 archived clarification bulletin](https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-archived-info-bulletin.pdf), printed p. 4 (PDF p. 8), distinguishes conceptual C2.4k from contextual epistatic calculations under C2.2k/C2.3s. It also prefers precise X-linked/Y-linked language. The [2025–2026 information bulletin](https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf), printed p. 14 (PDF p. 18), includes a two-gene hearing-model problem; printed p. 19 (PDF p. 23) includes a coat-colour interaction problem. These verify assessment relevance without requiring memorization of every real example or a universal modified-ratio catalogue. These retrieved editions are explicitly dated 2025–2026; this review does not certify that no 2026–2027 revision exists.

## Actual route and source mapping

### Lesson 08: Sex-linked inheritance

Actual goal: typical XX/XY crosses and joint versus conditional probabilities. Current reading links: printed 601–605. Main sources are slides 59–66, especially 61–64, plus textbook pp. 599 and 601, 603–604. Slides 72–114 alone are insufficient for this route.

Progression to retain: locate alleles on X; explain the absent matching Y allele at the modeled locus; list genotypes and phenotypes; trace the parent-of-origin chromosome; build the cross; deliberately change the question's denominator; contrast affected-mother and carrier-mother crosses; then briefly distinguish X-linked dominant inheritance. Slide 65 supplies an optional X-inactivation contrast after inheritance is understood. The video reference from slide 66 matches the native sex-linked support.

Key numerical checks, assuming equally likely X/Y contributions and the simple fully penetrant recessive model:

- XBXb × XBY: affected among all children 1/4; affected among sons 1/2; affected among daughters 0; affected son among all children 1/4
- XbXb × XBY: affected among all children 1/2; affected among sons 1; affected among daughters 0; affected son among all children 1/2; all daughters are carriers
- XBXb × XbY: four outcomes XBXb, XbXb, XBY, XbY; total affected 1/2, affected among sons 1/2, affected among daughters 1/2

A father and son can both show an X-linked condition through separate maternal transmission; that observation alone does not establish father-to-son transmission of the X allele. Keep the mechanistic statement exact. X-linked alleles lie on X; sex-linked is broader and can include Y. Typical chromosome models do not define every person's sex development or identity.

Source corrections: slide 60 compresses Morgan's F1/F2 history incorrectly; textbook p. 599 gives red-eyed F1 followed by white-eyed males in F2. Slide 64's word 'save' for an unaffected paternal allele is inappropriate. Slide 65 says only females can have tortoiseshell coats, but p. 604 itself notes rare males. X-inactivation occurs early and is maintained in descendant cell patches; it is largely chromosome-wide, with genes that escape, rather than literally every gene turned off in every cell. [MedlinePlus X chromosome](https://medlineplus.gov/genetics/chromosome/x/) supports this qualification. Do not turn the slide 59 Ishihara image into a diagnostic classroom genotype test. Do not teach the p. 603 hairy-ear example as a secure verified human Y-linked fact.

Visual recommendation: slide 61 `image55.png` is a legible 727 × 304 genotype reference; adjacent semantic Punnett tables are still needed for the probability procedure. Slide 65 `image52.png` is a 1000 × 667 tortoiseshell photograph useful only with patch-lineage explanation. Preserve its role as an example, not the only mechanism diagram.

### Lesson 09: Polygenic traits and environmental influences

Actual goal: polygenic/environmental contributions and distinctions between DNA sequence, expression, and phenotype. Current reading links: printed 606–609. Main source: slide 72, with pp. 606–607 and Figure 17.24, p. 609 environment examples, and pp. 608–609 investigation context. Slide 92–93 epigenetic extension is supportive only after science correction.

Build beyond the one-sentence slide claim: multiple loci can contribute effects; count their combined contribution under a stated additive model; many allele combinations give intermediate values; additional loci and environment broaden distributions. Figure 17.24 gives the actual two-locus AaBb × AaBb additive counts 1:4:6:4:1 (zero through four contributing copies). Its three-locus illustration is 1:6:15:20:15:6:1. These require equal additive effects and independent segregation as given assumptions. Uppercase contribution and lowercase zero contribution are labels of this model, not universal dominant/recessive biology. Several genes need not produce a smooth continuous distribution in every case, and continuous data alone do not prove a purely genetic or purely environmental cause.

Environment: describe conditions, the molecular or developmental consequence that is supported, the measured phenotype, and what is unchanged. A temperature-sensitive enzyme may alter activity without a new allele; this should not automatically be relabeled epigenetic methylation. Controlled cloned/similar-genotype plants can isolate an environmental question better than two populations that differ in both DNA and living conditions. Explain replication and measurement without pretending the learner performed an experiment from supplied numbers.

Gene interaction, if required for continuity: distinguish same-locus dominance, additive effects across loci, and interaction between gene products in one biological process. A fictional two-step pathway can state that functional A product converts precursor to intermediate and B product converts intermediate to pigment. If either step is blocked, the final pigment is absent. A_B_ can therefore produce pigment while aaB_, A_bb and aabb do not, under the exact stated model. Independent gamete probabilities can remain unchanged while phenotype categories combine. From AaBb × AaBb, the two functional requirements have probability (3/4)(3/4) = 9/16; the other 7/16 do not complete the pathway. Define the product functions first; do not simply announce a 9:7 ratio or imply actual human hearing follows that universal molecular pathway. The official bulletin's contextual problem supports this reasoning demand. NHGRI's [epistasis definition](https://www.genome.gov/genetics-glossary/Epistasis) independently distinguishes cross-gene modification of a phenotype.

Slide 92 is a reject-as-written source: everyone generally has BRCA1/BRCA2, and harmful variants increase cancer susceptibility through impaired protective DNA-repair function; this is not a cancer allele that merely needs turning on. [NCI BRCA fact sheet](https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet) resolves the error. For optional epigenetics, use sequence versus activity, cell-type regulation, and appropriately limited inheritance claims; [MedlinePlus epigenetics](https://medlineplus.gov/genetics/understanding/howgeneswork/epigenome/) supports this bounded account. No cancer-risk estimates or medical recommendations are needed.

Visual recommendation: Figure 17.24 at p. 607, PDF 24, is superior to slide 72's group photograph for explanation. A verified full-figure crop can use PDF rectangle [65,420,570,742]; inspect the exact crop after creating it. The children's photo `image64.jpg` is context only, with no inference of individuals' ancestry, genotype, or trait causes from appearance. No original two-step pathway image exists in the inspected packet.

### Lesson 10: Reading autosomal pedigrees

Actual goal: read relationships, infer forced genotypes, and retain alternatives. Reading pp. 610–614. Source sequence: 74 overview; 75 symbol key; 76 reading identities and connections; 77 dominant genotypes; 78 recessive genotypes; 82–85 inference examples; 90 comparison; 91 optional video. Textbook pp. 611–614 supplies context, symbols, dominant/recessive cases, and a complete worked cystic-fibrosis model.

The student should first read a key, generations, family connectors, and printed person identifiers. Circles/squares and shading are conventions in this supplied model, not a claim that all human identities fit those two symbols. Then state model assumptions: single locus, accurate biological relationships, full penetrance, no new mutation, appropriate age of expression, and no phenotype misclassification unless a problem explicitly changes them.

Autosomal recessive: affected aa; unaffected AA or Aa; two unaffected parents of aa must both be Aa. Any unaffected child of an aa parent is Aa. From Aa × Aa, unaffected offspring retain AA or Aa, with carrier probability 2/3 after conditioning on being unaffected. Autosomal dominant: unaffected dd; affected D_; an affected parent of an unaffected dd child must be Dd. An unaffected spouse does not prove the affected spouse is DD or Dd unless offspring constraints do so.

Slide 77 image73: top pair numbered 1 and 2 must both be Dd because child 7 is unaffected; person 3 is dd; persons 5 and 6 can be DD or Dd; persons 7 and 8 are dd, so their offspring must be dd. Important diagram convention: the original asset numbers individuals continuously across generations (1–12), not from 1 anew in every row. Do not invent conflicting labels.

Slide 78 image68: the unaffected central couple must both be Rr because they have affected children. Their affected son is rr. His unaffected partner can be RR or Rr despite four unaffected children. The four children are all Rr. Four unaffected children have probability 1 if she is RR and 1/16 if she is Rr under the ideal model, but those likelihoods alone do not supply prior probabilities or prove the woman's genotype. Avoid unqualified 'most likely RR.'

Inference of mode: both sexes affected, skipped generations, and successive affected generations are clues rather than universal proofs. Unaffected parents with affected offspring rule out a simple fully penetrant dominant model but do not alone distinguish autosomal recessive from X-linked recessive. Likewise an affected couple with an unaffected child rules out a simple recessive model, but other candidate models must still be tested.

Visual recommendations: `image63.png` (slide 75) symbol legend; high-resolution `image73.png` (slide 77) worked dominant pedigree; `image68.png` (slide 78) uncertainty example with verbal location descriptions. Native ch17-pedigree.svg is referenced but absent from the packet and must be recovered or handled under the lead's asset policy.

### Lesson 11: Sex-linked pedigrees and testing a model

Actual goal: chromosome-path reasoning and consistency versus proof. Reading pp. 612–614. Source sequence: 79–81 genotype inference, 86–89 model clues/annotations, 90 synthesis; textbook pp. 613–615 and the broader worked strategy at p. 614.

Use X-linked recessive transmission: an affected son gets the recessive X from his mother, so an unaffected mother is an obligate carrier under the stated assumptions; daughters of affected fathers all receive that X, but whether they are affected depends on the other X and the expression model. For X-linked dominant, an affected father and unaffected mother have all affected daughters and unaffected sons. An affected father with an unaffected daughter contradicts the simple fully penetrant model. A small all-daughter or all-son family does not make an inheritance mode certain.

Slide 79 typo: the explanatory line says an affected son received XR; it should be Xr. The unaffected mother in the upper generation is a carrier. The left unaffected daughter who has only unaffected sons remains either XRXR or XRXr; the lack of affected sons does not force non-carrier status. The right unaffected daughter with an affected son is a carrier.

Slide 80: with the diagram numbered left-to-right including partners, generation-II individual 4 is an unaffected son. The displayed cross says XrY × XRXr, but the square and 1/4 affected-child answer use XRY × XRXr. If the father really were XrY, half of all children would be affected, while half of sons would still be affected. Do not reproduce the source mismatch.

Slide 81: the unaffected mother numbered 6 and affected father 7 give affected daughters and unaffected sons under its dominant model. The slide's square incorrectly labels one son XDY despite a maternal Xd and paternal Y. Its conditional daughter answer of 100% is nevertheless correct. Keep the model and all square cells consistent.

Slide 87 image102 answer pixels contain a further incomplete deduction: the leftmost generation-II female is labeled XBX–. Her daughter is forced to carry Xb because she has an affected son, and that daughter's father is unaffected XBY; therefore the generation-II mother must also carry Xb. Treat the annotated image as needing correction, not an authoritative solved key.

`image82.png`, used on slides 84 and 86, supports alternate-model teaching: the same pedigree fits both simple autosomal dominant and autosomal recessive models. An affected father and son in it do not by themselves prove a Y-linked pathway. It contradicts the fully penetrant X-linked dominant interpretation because the affected son's partner is unaffected yet their son is affected; the top affected mother also has an unaffected son, contradicting X-linked recessive. Conditions must be stated before those exclusions.

Visual recommendations: `image74.png` slides 79–80 for X-recessive deductions, `image72.png` slide 88 for dominant deductions, `image82.png` for competing autosomal models. Avoid using already genotype-annotated answers as the student's only chance to infer. The royal hemophilia pedigree on p. 613 is explicitly selective (affected people/carriers), so it must not be treated as a full unbiased sample for estimating sex frequencies.

### Lesson 12: Linked genes and recombinant offspring

Actual goal: phase, parental/recombinant identity, and a test-cross readout. Reading pp. 599–601. Source sequence: 94 topic; 95 mechanism; 96 independent versus linked patterns; 97 meiosis stages; 98 map-distance comparison; 99–102 parental excess reasoning; 103–105 test-cross example. Textbook pp. 599–600 contains non-sister chromatid crossing over and count-based interpretation.

AaBb does not specify phase. AB/ab and Ab/aB are distinct arrangements. Explain the slash as the separation between homologues and each same-side pair as loci on one homologue. In AB/ab, AB and ab are parental, Ab and aB recombinant. In Ab/aB, those assignments reverse. A recessive tester ab/ab contributes ab consistently, allowing the other parent's gamete contribution to be inferred from the offspring genotype/phenotype under the given dominance model.

Mechanism: after DNA replication, homologues pair during prophase I; non-sister chromatids exchange corresponding DNA segments; a crossover between the two scored loci can make new combinations; meiosis distributes chromatids into gametes. Crossing over does not mean the allele letters mutate or one chromosome becomes a mixed bag without loci. A single crossover in one chromatid pair leaves two of the four chromatids parental for those markers. Recombinant fraction is therefore not the fraction of all meiotic cells that crossed over anywhere.

Independent expectation: each of four gamete classes 1/4, combined parental 1/2 and recombinant 1/2 relative to the stated phase. This is an expected distribution, not a guaranteed count. A small sample that is uneven is not proof of linkage. Large repeatable parental excess supports detectable linkage under the model, but viability differences and scoring errors are possible alternative explanations if the problem extends beyond the ideal model.

Corrections: slide 96's last displayed sequence Ab:AB:ab:aB should be minority:majority:majority:minority for the shown AB/ab phase; its text has ab and aB reversed. Slide 95 image95 labels distant same-chromosome loci 'Not Linked'; qualify as no detectable statistical linkage at that separation, not physically on different chromosomes. Slide 99's human hair/eye wording must remain a fictional/given two-gene model, not a verified claim about human appearance. Slide 101's 'different ratio' is insufficient as a proof rule. Textbook p. 600's uniform-crossover-position wording is too strong; recombination varies by region.

Visuals: slide 96 `image85.png` shows all three models but small labels require enlargement and guided reading; slide 97 `image88.png` usefully traces stages but lacks A/a/B/b loci, so complement it with an explicit phase table. Slide 100/102 `image96.png` shows two homologues with B,H,d versus b,h,D; it is low-resolution (269 × 282) but correct for the relative-interval comparison. Preserve the unusual lowercase d on one homologue if used. Native ch17-linkage.svg is absent and unverified.

### Lesson 13: Recombination frequency and chromosome maps

Actual goal: count, calculate, map, and explain limits. Reading pp. 599–601. Source sequence: 102 definition; 103–107 model/calculate/unit; 108–109 third locus; 110 limits (needs correction); 111–113 fresh fly application; 114 video. Textbook pp. 600–602 supplies the strongest complete count/map sequence.

Verified source numbers:

- Slides 104–106: 6 HhNn, 2 Hhnn, 2 hhNn, 6 hhnn; assumed HN/hn phase; 4 recombinants of 16 = 25%. This tiny sample does not independently prove linkage
- Slide 108: 7 EeNn, 1 Eenn, 1 eeNn, 7 eenn; assumed EN/en; 2/16 = 12.5%
- Slides 109: H–N 25 and E–N 12.5 permit both H–E–N and H–N–E. In the first, H–E is 12.5; in the second H–E is 37.5 on the simple additive map. The supplied image chooses the first without adequate evidence
- Slides 111–113: EeLl × eell; 40 EeLl and 40 eell parental, 10 Eell and 10 eeLl recombinant; 20/100 = 20%. Given eye–body 14 and body–wing 6, body is in the middle, with 14 + 6 = 20. Reversing orientation changes nothing
- Textbook p. 600: 450 normal-eye/normal-wing, 450 purple/vestigial, 50 normal-eye/vestigial, 50 purple/normal-wing; 100/1000 = 10%
- Textbook p. 601: eye–body 4, body–wing 6, eye–wing 10; body in the middle
- Textbook p. 602 Part A: 406 + 398 parental, 96 + 100 recombinant; 196/1000 = 19.6%. Eye–body 12.2 and body–wing 7.4, so body in the middle
- Textbook p. 602 Part B: 115 + 105 of 1000 = 22%; 154 + 153 of 1000 = 30.7%; eye–wing 8.7%. Eye lies between leg and wing in the simple additive model because 22 + 8.7 = 30.7

Always sum both reciprocal recombinant groups and divide by all scored offspring. Give percent RF separately from the approximate cM estimate. For short intervals, 1% recombination estimates 1 cM. A map unit is not a universal physical length; the human-genome average mentioned in slide 107 is not a conversion rule. [NHGRI centimorgan](https://www.genome.gov/genetics-glossary/Centimorgan-cM) supports the genetic/physical distinction.

The model's expected two-locus recombination fraction lies between 0 and 0.5. A finite observed sample can be above 50% by chance when phase was independently fixed; do not say the arithmetic is impossible or automatically reassign parental labels merely to force a lower value. Check classification, counts, sampling, viability and assumptions. A value near 50% cannot distinguish unlinked chromosomes from widely separated loci on the same chromosome. Multiple crossovers can restore the parental arrangement of the two outside markers, hiding exchanges. Summing shorter mapped intervals can yield chromosome distances beyond 50 cM. The current native explanation sometimes says 'observed' when it means expected fraction; revise that distinction in replaceable teaching without silently changing protected checks.

The slide 111 black-body-dominant-to-grey statement should be kept as an explicitly stipulated classroom allele model, not generalized as the usual actual Drosophila body-colour genetics; the supplied phenotype letters are problem definitions.

Slide 107 also blurs '25% of gametes recombinant' and '25% of meioses with crossing over'; keep those different. Textbook p. 600's map-unit phrasing has the same simplification. Longer-interval ratios are approximations and not an exact physical ruler. For p. 602's zero-recombinant contrast, do not equate zero observed with proof of zero crossing-over probability; close spacing and limited sampling can explain it, and Drosophila parent sex can matter if that biological fact is independently introduced.

Visual recommendation: original `image100.png` formula and `image97.png` two-locus map are correct under their given model but already reveal the source answer. Prefer them as worked examples, not hidden independent prompts. `image109.png` must not be presented as the unique deduction. Source slide 113's map uses native shapes, not a standalone image. Native ch17-map.svg is absent and unverified.

### Lesson 14: Genetic testing, counselling and decisions

Actual goal: distinguish result, risk, uncertainty, consent and privacy. Current reading spans pp. 610–617. Main science/context sources are pp. 614 and 616–617, with societal context pp. 610–611 and 618. The original PPT has no dedicated genetic-testing/counselling section; do not invent a slide source. It contributes pedigree reasoning as prerequisite only.

Teach a bounded fictional test and distinguish measured result, supported interpretation, and personal decision. Positive can identify a variant, carrier state, diagnosis, or risk depending on the test. Negative means the targeted finding was not detected within the test's scope and performance; it does not exclude every untested cause. An uncertain variant should not become a deterministic diagnosis. [MedlinePlus test interpretation](https://www.medlineplus.gov/genetics/understanding/testing/interpretingresults/) supports these distinctions. Separate screening from definitive diagnostic claims when a case uses those words.

Counselling should support understanding and the person's informed choices, with respectful language and no predetermined reproductive decision. Explain family implications without treating relatives' access as automatic. Avoid mandatory student disclosure of health, biological relationships, family histories, colour-vision performance, or test results. Fictional cases provide the necessary learning evidence. The textbook's PKU diet instructions, CF prevalence/treatments, Huntington's timetable, and Duchenne life-expectancy claims are historical material rather than current clinical instructions. Neither a classroom cross nor this review provides individual medical advice.

No missing image automatically blocks this conceptual lesson if a clear, accessible evidence/interpretation/decision table does the necessary teaching. A photograph of a clinician does not replace reasoning. Do not invent current named programs or statistics merely to make the lesson concrete.

### Lesson 15: Chapter review and final check

Actual purpose is synthesis across the fourteen lessons, not a new inheritance model. Sources are the complete deck, especially recap 73, pedigree synthesis 90, linkage 101/111–113, plus textbook summary/review pp. 619–621. Keep all existing final check questions, IDs, saving and completion semantics.

The review should make the selection procedure visible: define model and symbols; infer possible parents; retain uncertainty; list valid gametes; justify independence or phase-specific linkage; choose the requested denominator; calculate; check biological meaning and limits. Include distinct cross types and changed information rather than only a definitions table. Assessment preparation must include the final check's ABO all-four-groups cross, X-linked conditional probability, RF calculation, and ambiguous-pedigree conclusion, while keeping any fresh independent task meaningfully different.

The supplied native final independent set is optional and saved; its answers are 1/2 for a dominant phenotype with an aa parent test-crossed to aa, 1/2 for an affected son from XbXb × XBY, 12.5 cM from 25 + 25 recombinants out of 400, and forced Aa parents with 2/3 carrier probability among unaffected siblings. These are verification notes, not authorization to alter that set.

### Optional extension: Biobanks and genetic information

Main original source: textbook p. 618, PDF 35. No dedicated PPT slide exists. The page's 2003 policy discussion and future-tense prediction that biobanking will happen in the learner's lifetime are historical, not current reporting. Its 'open source' language must not imply unrestricted public DNA release. Biobanks hold biological materials and associated data under varied governance and access arrangements.

Use the existing hypothetical association to separate sample composition, confounding, causal evidence, validation and generalization from participation decisions. More DNA alone does not remove age/location confounding. An association can be useful without proving the variant itself caused the phenotype. Appropriate issues include purpose, future uses, storage, access, return of findings, privacy safeguards, withdrawal conditions, family/community implications, and fair representation. State questions and tradeoffs rather than inventing universal legal rules.

Current Canadian primary support: [TCPS 2 (2022), Chapter 13](https://ethics.gc.ca/eng/tcps2-eptc2_2022_chapter13-chapitre13.html) addresses genetic information, family/community implications, communication preferences, counselling and biobanking plans. [Chapter 12](https://ethics.gc.ca/eng/tcps2-eptc2_2022_chapter12-chapitre12.html) describes varied bank purposes, safeguards and governance. Withdrawal limits and future-use conditions depend on the actual approved arrangement; do not promise that all distributed data or completed analyses can always be recalled. These are research-ethics guidance, not a comprehensive summary of Canadian law. Do not imply research participation guarantees clinical benefit, privacy can be absolutely guaranteed, or Indigenous community engagement replaces individual consent.

Preserve the optional response and its native saving. No personal sample collection or disclosure is needed. A whole-page reproduction of p. 618 would carry outdated framing; use it as historical reading context, with current lesson reasoning in visible text.

## Source-media disposition and verification gates

Machine-readable asset recommendations, caveats, exact ZIP relationships, dimensions, hashes, extracted locations, route mappings and PDF crop proposal are in `source_asset_relationships.json`. Key decisions:

- Use original media with accurate guided interpretation; preserve numbering and captions that remain scientifically correct
- Treat small pedigree images at 221 pixels or 271 pixels wide as poor main-workspace choices when larger original alternatives exist
- Do not use video thumbnails as explanatory diagrams or count a linked thumbnail as verified playback
- Do not reuse annotated image102 as a correct solved key; do not reuse image109 as a uniquely deduced map
- Do not treat slide 95 image95's distant same-chromosome label as a physical location statement
- The 114-slide deck contains correct lessons outside the initial 72–114 target, particularly 59–66 for lesson 08
- All three missing native figures need actual owner-file recovery or an explicitly scoped reviewed replacement; reference text alone cannot establish pixel correctness
- No browser, Mac, Codex task, or publication was used in this research
- No claims of desktop/mobile rendering, keyboard behavior, link functionality, video playback, SCORM, saved-state, or Brightspace verification are made


## Follow-up verification requested during authoring

### X-inactivation, penetrance and temperature-sensitive pigment

- [MedlinePlus X chromosome](https://medlineplus.gov/genetics/chromosome/x/) verifies early X-inactivation, persistence, and escape genes. The supplied p. 604 separately states that descendants retain the same inactive X. Keep the early random choice separate from later clonal inheritance; do not imply each descendant chooses anew
- [MedlinePlus penetrance and expressivity](https://medlineplus.gov/genetics/understanding/inheritance/penetranceexpressivity/) distinguishes the proportion of variant carriers who show a condition from differences in manifestations among those who show it. Neither term is a synonym for a quantitative polygenic trait's population distribution
- [UC Davis Veterinary Genetics Laboratory: Colorpoint Restriction](https://vgl.ucdavis.edu/test/colorpoint-restriction) connects inherited TYR variants to temperature-sensitive pigment production, with reduced pigment in warmer body areas. [Primary TYR/TYRP1 research](https://pubmed.ncbi.nlm.nih.gov/15858157/) identifies inherited substitutions associated with the Siamese and Burmese phenotypes. Explain the temperature sensitivity of the inherited enzyme/pigment system without inventing a new cold-induced DNA mutation or asserting that transcription necessarily changed

### Textbook p. 602 zero-recombinant follow-up

The supplied chapter and slide deck do not state the sex-specific absence of ordinary male Drosophila crossing over. The primary 2022 study [Premeiotic pairing of homologous chromosomes during Drosophila male meiosis](https://pmc.ncbi.nlm.nih.gov/articles/PMC9704699/) explicitly establishes the normal absence of male meiotic crossing over despite successful chromosome segregation. This can be supplied as new case information, not silently required as prior knowledge. If the heterozygous parent was female in the first cross and male in the second, the difference gives a concrete possible explanation.

Important contextual limit: the first experiment already estimated 19.6% recombination for the same pair. A second similarly large sample with zero recombinants is extremely unexpected under that unchanged estimate. Tight linkage plus finite sampling is a generic reason for zero counts, but it is not a persuasive explanation for the full contrast without changed conditions or uncertainty about the repeat's sample size. The probability of zero in n independent observations is (1-r)^n under the model. Check what the question actually tells us before giving a blanket small-sample explanation. No collection or breeding of flies is required; this remains supplied-data analysis.

### Final extraction verification

The Figure 17.24 crop at `extracted/pdf-images/figure17-24.png` has now been extracted and visually checked. It retains panels A, B and C, all axis labels, the 1:4:6:4:1 explanation, and the original caption. It contains no added marks. Its exact source rectangle and SHA256 are in the JSON. This confirms the crop only, not its eventual lesson placement, mobile readability, or the accuracy of any surrounding manuscript.
