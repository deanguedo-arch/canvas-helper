# Biology 30 Chapter 16 lessons 05–06: independent review

Final review: 8 October 2026. Consumed standard: **Course production standards v0.4**, frozen in the source packet. This is a review of the two candidate lesson fragments and their bounded teaching, task, source and static-preservation evidence.

## Verdict

**Pass: the current eight teaching/worked sections provide accurate, visible support for the attempted local and native content, and their source-sized figures support the explanation. No ordinary teaching or visual repair remains.**

**Protected assessment fairness still needs owner decisions**, particularly N045, N055 and N058. The existing configuration also contains a stale teaching-only worked-step mirror that must be reconciled before a rebuild. Those findings prevent an unconditional assessment/fairness or integration pass. No protected content was edited.

This is **not** a course-runtime, accessibility, mobile rendering, learner mastery, teacher acceptance, canonical integration or release result. I inspected actual figure pixels at their original sizes; I did not render or operate the course in a browser.

Reviewed candidate SHA256 values:

- `learner/lesson-05.html`: `54a49fe7374c8e568a9607808b59aa90c550c2eaf15a64641146f5fe1a7f37d9`
- `learner/lesson-06.html`: `c01167f2dbef78743076449ff165978e8da3059761732fcd53061d2f4df68309`

## Fresh attempts and evidence boundary

The first phase used only the two blind HTML/text lessons, the 58-form neutral-ID native practice file, the eight Frayer forms, and the three images those lessons reference. **No prior-teaching files were needed or read.** All 14 local tasks were answered before feedback: four guided selections, two stop-and-think responses, four required selections and four written explanations. All 58 native forms were attempted with complete prompts/options/givens retained, including the ordering task from alphabetized choices. All 32 Frayer fields were completed within their 240-character limits.

`phase1-frozen-attempts.json` contains every first response, visible-support locator, meaningful alternative and unsupported-step declaration, plus hashes for all nine inputs. Its SHA256 remains `7f79122ca7d7226f23a6e7d6957493c83833e9df95d2a681f109244d48d797d2`.

The second phase separately used the optional-textbook tasks, every complete question crop, all ten supplied full-page contexts, and the relevant full PDF context. All 16 unique tasks and every subpart were answered. Question 3 has a real, independently drawn four-panel mitosis sketch in `phase2-q3-first-response-sketch.png`. The phase records assumptions and alternatives for the microtubule-inhibition question and the 0/92 chromosome-distribution question.

`phase2-frozen-attempts.json` has SHA256 `d31ba14ad792032c1e1f364e5951a293c58a2e5978f13424a2ddd91747178157`. The sketch has SHA256 `bd752f10e3ad105af409f0f08b92ab13253021ce93b5a0d63fd3ebc04c3fba15`.

Chronology is explicit: the 16 crops and ten supplied full-page images were viewed before the second response file was written. Two supplementary PDF renders, pages 560 and 564, and the finished sketch were viewed immediately after that file was first frozen; the corresponding PDF text had already been read. No feedback or keys intervened. `phase2-final-visual-barrier.json` records the subsequent barrier, after all visual checks and before opening source/configuration/keys. The response and sketch bytes were unchanged.

The final check rehashed all nine first-phase inputs and all 28 second-phase inputs: **no changes**. These are reviewer-authored attempts and evidence maps, not observed student learning outcomes.

## Teaching and science findings

Lesson 05 supplies the missing mechanistic links for its tasks: nuclear division differs from cytoplasmic division; DNA copying occurs earlier; an animal contractile ring produces a furrow; plant vesicles build a partition against the constraint of a rigid wall. It distinguishes spindle/centriole differences from cytokinesis and explicitly supports the retained animal-versus-onion question. Growth, maintenance and repair are connected to specialization, organization, function and controlled proliferation. The sensory-tissue example provides a reason why more cells alone do not establish successful repair.

Its checkpoint explanation distinguishes pausing from guaranteed repair and rapid normal growth from loss of control. Adult stem-cell potency is appropriately qualified. The teacher slide 35 statement that pluripotent cells can simply be obtained from adult tissues is not repeated: ordinary adult tissue stem cells are generally lineage-limited; induced pluripotency involves reprogramming. This distinction agrees with [NIH Stem Cell Basics](https://stemcells.nih.gov/info/basics/stc-basics/) and [NIGMS, What Are Stem Cells?](https://www.nigms.nih.gov/biobeat/2024/11/what-are-stem-cells).

The telomere paragraph appropriately says shortening occurs during many somatic-cell divisions and can limit proliferation, while some cells maintain repeat sequences. It avoids turning a cellular relationship into an individual lifespan prediction. The maintenance exception agrees with the [NHGRI telomere explanation](https://www.genome.gov/genetics-glossary/Telomere). No clinical treatment or personal longevity claim is made.

Lesson 06 correctly separates replication, homologous sets and chromatids; places synapsis in prophase I; counts a tetrad as two replicated chromosomes/four chromatids; and states that crossing over can make sisters nonidentical. Metaphase-I alignment is distinguished from initial pairing. The actual figure's top/bottom poles and left/right homologous pairs are correctly traced, preserving one long and one short chromosome in each daughter.

The worked `2n = 4` model yields two chromosomes/four chromatids per meiosis-I daughter. The supported `2n = 12` task yields six chromosomes per daughter, and the required `2n = 8` response yields four chromosomes/eight chromatids per daughter. Haploidy is correctly explained by one complete set, despite replication. Whole-cell versus per-pole counting during anaphase I is qualified. There is no new S phase before meiosis II.

Direct original textbook review covered the relevant printed pages 555–566, including Figures 16.8, 16.9 and 16.11–16.14. Direct original PPTX text was inspected for slides 21–50, with individual source-sized slide images inspected for 29, 30, 35, 36, 42, 44, 45, 48, 49 and 50. The actual original PPTX and PDF hashes were checked; this is not a whole-deck/whole-chapter content approval.

Several source simplifications were avoided by the candidate: slide 49's implication that a daughter receives an entire maternal or paternal set; slide 50's implication of necessarily identical meiosis-II daughters; slide 42's unqualified two-pair example; and the textbook's categorical organelle equality during cytokinesis. The candidate instead uses the model's limits, independent pair orientation, exchange and explicit species/count boundaries.

## Actual figure/pixel findings

- **Animal cytokinesis, 707 × 733:** the source illustration shows a narrowing centre, arrows and two separate daughter-cell drawings. The asset is byte-identical to `ppt/media/image35.png` in the original teacher deck; slide 29 directly references that media. The source itself crops the lower edges of the daughter drawings. The task requires narrowing/separation, which remains clear; it does not need complete closed outlines. The lesson explicitly limits the illustration's “identical” label to its normal nuclear-genetic model.
- **Plant cytokinesis, 610 × 396:** the two dark chromosome groups and a faint central partition are visible. The learner asset exactly preserves the original owner bytes and corresponds to textbook Figure 16.9. Vesicle fusion and outward growth are mechanistic explanations, not structures/motion claimed to be directly resolved by this still micrograph.
- **Meiosis, 1026 × 1112:** pale orange identifies meiosis I. At metaphase I, the short blue/yellow pair is at left and the long green/red pair at right; poles are above/below. Anaphase I moves predominantly blue+green upwards and yellow+red downwards. Exchanged tips are visible, sisters remain joined, and the `2n = 4` interpretation is supported. No whole-genome maternal/paternal colour key is implied. The learner asset exactly preserves the original owner bytes and corresponds to Figure 16.11 on printed page 564.

The figures are usable for the stated explanations at source size. Responsive course placement and any enlargement controls remain untested.

## Assessment reconciliation and protected findings

All 14 local first responses are consistent with their protected keys/models. All 32 Frayer responses are scientifically supported. The 26 native flash responses are semantically consistent with their models. All 15 native selected first answers and the ordering response match their stored answers. Of 16 typed first responses, 15 match stored normalization/aliases; the remaining response, N055, is scientifically valid and more specific than its stored key. This is a fairness finding, not a teaching failure.

1. **N045 / `ch16-foundation-ch16-word-reduction-division`:** “meiosis I” and “reduction division” both fit the description, and both are choices. The first answer selected the closest defined term, “reduction division,” but the other biologically correct choice is excluded.
2. **N055 / `ch16-l06-context-meiosis-i`:** the frozen first answer is “anaphase I,” exactly the described and taught movement of replicated homologues to opposite poles. The stored answer is “meiosis I,” with no aliases. Direct inspection of the source matcher confirms the precise answer is excluded by normalized string matching. No browser rejection is claimed.
3. **N058 / `ch16-l06-context-reduction-division`:** the first answer matches “reduction division,” but “meiosis I” also fits and is not an alias.
4. **N016/N054 checkpoint blanks:** absence of aliases also excludes natural “cell cycle checkpoint” without the internal hyphen, or “checkpoint.” Source normalization does not remove that hyphen. The frozen answer used the exact stored term. Alias policy remains an owner decision.
5. **Regeneration dependency:** `course-data.guidedActivities` lesson 6, `worked.steps[0]`, still says “At metaphase I, the long homologues pair and the short homologues pair.” The current visible `ch16-l06-worked` correctly puts pairing/synapsis in prophase I and subsequent alignment in metaphase I. Reconcile the exact **teaching-only mirror** with the reviewed visible worked text before any rebuild. The full protected config remains unchanged; this review did not alter a key, task or model.
6. **Frayer model quality:** the models repeat each key feature as the example and often use a distinction instead of a concrete non-example. They are scientifically usable but provide limited diagnostic variety. This is a protected quality limitation, not an invented missing learner response.
7. **Optional textbook crops:** all 16 prompts and subparts are readable. Section 16.2 questions 5–7 include extraneous neighbouring-column fragments in the crop and extracted sourceText. Full-page context resolves the prompt. The question about a 0/92 endpoint most directly implicates anaphase segregation, but cannot uniquely establish causal timing; its species/normal starting count is unstated. Those limitations are recorded in the frozen response.

I independently parsed the original D2L XML and inspected the original p53 image stimulus before consulting any inherited assessment dispositions. Current native source-linked IDs `OBJ_2131203`, `OBJ_2131207` and `OBJ_2131209` preserve the original prompts, option sets and keyed biological answers, with reordered options. `OBJ_2131204` is an **inherited rewrite** of the p53 loss-of-function question into a generic checkpoint model; its original stimulus, named gene and option wording are absent from the native question. `OBJ_2131211` is an **inherited rewrite** of the “become haploid” question into explicit homologue separation at poles, with changed options and the same anaphase-I answer. These are preserved against the owning build, not exact copies of the original D2L questions. Their response histories should not be described as interchangeable solely because source-linked IDs remain.

The 16 optional tasks are exact objects from the original owner's textbook-question data. They extend beyond just lessons 05–06 into prior mitosis and later meiosis-II/variation content, using explicitly supplied reading. Their successful source-assisted attempts do not establish that these two lesson explanations alone teach every textbook task. Recognition and numerical substitution also do not demonstrate robust independent transfer or mastery.

## Independent static checks and resolution of apparent differences

`static-checks.json` records the complete results and per-task comparisons:

- Both baseline/raw lesson files exactly match the original owner's raw route substring.
- Candidate bytes **outside the eight authorized teaching/worked divs are exactly equal** to that original owner. This includes protected prompts, options, controls, route links and surrounding markup.
- All 182 frozen original-source file hashes still match, with no drift.
- The full source course-data JSON equals the original index's embedded configuration.
- All 28 preserved figure/textbook assets match their frozen hashes and source copies; all 26 optional crop/full-page asset files equal original owner bytes; the optional PDF equals the original owner PDF.
- Independent static reconstruction from original configuration yields the same 58 practice forms, with no prompt/options/key/alias/order differences from the supplied full pool. All 58 neutral blind prompts/options/givens match those records, and the ordering choices are alphabetized exact steps.
- All six teaching blocks begin with native `h2` headings. Both worked blocks preserve `p.section-label` (“Worked example”) followed by `h3`. Their actual headings are listed in the JSON. No universal heading assumption replaced the native structure.

Two strict raw comparisons are intentionally qualified rather than hidden:

1. The pair-config extraction adds explicit `lesson: 5` and `lesson: 6` annotations to the original title-only lesson metadata. Thus a literal whole-object subset test is false. Both titles match the correct indexed original lessons; every other extracted object matches exactly; the full authoritative config is unchanged. The corrected semantic/projection check is true with no unresolved difference.
2. The first teaching block in each blind HTML file serializes `<img/>` as `<img>`. Thus raw teaching-block byte comparison is false for those two blocks. Normalizing **only that void-tag closing slash** makes all eight blocks exactly equal. Every text string, attribute, image reference and actual pixel file matches. This is serialization, not a missing prompt, altered diagram or teaching change.

## Standards evidence and remaining gates

Applicable v0.4 rules D02/D04, U01/U02/U06/U07/U15 and B01/B05 are evidenced by the frozen input boundaries, complete attempts, actual image/source inspection, exact original-question reconciliation and explicit model limits. D05/U08/U10/U12/B03 are evidenced by protected-byte checks, unchanged source/configuration and separately retained protected decisions. U03/U04 are supported at the bounded current-task explanation/worked level; no generalized transfer or learning-gain claim follows. U05 has meaningful local feedback/models, with the protected native fairness limitations above. The packet's later-topic reading dependency is explicit.

D06/U09/U11/U13 runtime, delivered-page visual placement, accessibility, actual save/resume/recovery and LMS evidence remain **Not verified** in this direct content review. Teacher acceptance, owner integration and release remain separate gates. No ordinary in-scope repair is pending; protected fairness decisions and the pre-rebuild teaching-mirror reconciliation remain open with the owner.
