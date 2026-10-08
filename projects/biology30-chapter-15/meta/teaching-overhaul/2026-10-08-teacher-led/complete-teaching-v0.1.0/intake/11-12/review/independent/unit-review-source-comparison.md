# Cumulative unit review: bounded comparison after the first attempt

## Result

All 31 first selections match the corresponding native-bank keys. Fifteen items remain unanswered for missing permitted prerequisites: 13 CH14-tagged and 2 CH15-tagged. This is agreement on attempted items, not 46-item completion, a learner proficiency score, or a complete-course pass.

The frozen first-attempt record is `unit-review-first-attempts.md`, SHA-256 `074eeee903d4a4333d59ea38dc70c8f1493ff7386aa764cb3402be40328f0e89`. It contains every first response, support, gap, the repaired-input history and 42 input hashes. It was saved before the first native-bank read and has not been rewritten in light of the keys.

Only `unitReviewQuestions` was exposed for comparison from `ch15-batch11-12/source/course-data-native.json`. No author report, lesson answer configuration, application execution or course test was consulted. No question, key, teaching file or course file was changed by this reviewer.

## Fidelity and structural uniqueness

- Native-bank total: 46 items, comprising 24 CH14 and 22 CH15 items.
- Blind prompts, IDs, source-item IDs, options, order, chapter tags, difficulty, lesson, family, kind and stimuli all match the same native-bank fields. The blind-only `scope` marker was excluded from comparison.
- All 46 IDs are distinct. Every item has four distinct option strings. Its answer string occurs exactly once in its own options. All stimuli lists are empty.
- This establishes single-key data integrity. It does not by itself establish that the wording permits only one biological interpretation.
- Whole source file SHA-256: `bfae94112e0fea6e8cd2dddd959003229eb58a88435bb626c3c8e3a8db61e3fa`.
- SHA-256 of the `unitReviewQuestions` value serialized with sorted keys, UTF-8, unescaped Unicode and compact JSON separators: `cb342765c068758c863459362bdab38b36fbe1e748a657a333e5387eb9a84e2e`.

## Findings that remain after key agreement

1. **OBJ_2131525, blocked oviducts: semantic boundary needs tightening.** The keyed answer, ovulation, follows the intended natural pre-fertilization model. However, “which event can still occur?” does not state that model. The permitted L11 teaching explicitly explains that laboratory fertilization and embryo transfer can bypass the blocked tubes, so fertilization and implantation are not excluded across all circumstances covered by the wording. An already established pregnancy is also not excluded by the stem. The first answer was A with this assumption recorded. A revision should specify a new reproductive sequence without assisted fertilization/embryo transfer and ask the most directly unaffected event. The current literal wording does not merit an unconditional semantic-uniqueness pass.

2. **OBJ_2131135, third-trimester brain development: teaching and explanation do not establish the complete keyed statement.** The source keys C, “Fetal brain cells form rapidly, connecting to form more intricate networks.” L08 establishes continued later brain maturation. The native explanation likewise discusses neural connections and continued organ development, while explicitly saying formation and maturation differ. Neither establishes the option's rapid brain-cell-formation claim or enough precise timing to compare all four alternatives. The supplied sensitivity chart is not a trimester-event table. The first attempt correctly remained unanswered within this evidence boundary. Either the detailed prerequisite and its provenance need to be supplied, or the statement should be revised to test the taught continued development of neural connections. This review does not assert an externally validated biological correction.

3. **OBJ_2131152, first-three-day nutrition: missing teaching plus an unestablished time-specific source claim.** The native key is C, maternal egg cytoplasm. The explanation says the oocyte cytoplasm supplies stored material for early development. That is additional answer information, but does not establish the stem's exact three-day interval or its broad nutrient/energy formulation. L02's partitioning of starting cytoplasm does not teach that nutritional claim. A matching key cannot retrospectively supply the prerequisite. Source verification and appropriately qualified teaching are still needed; no external scientific or clinical review was performed here.

4. **OBJ_2131568, vasectomy/testosterone: wording exceeds the precise mechanism.** B is the sole keyed endocrine/blood-route answer and matches the first selection. Its “all the body tissues” wording is broader than both L11 and the native explanation's “target tissues.” Use the blood route to responsive targets as the precise formulation. The packet does not separately define exocrine tissue, although its endocrine/hormone description supports the selected option.

5. **OBJ_2131570, contraceptive pill: stem should match the stated combined-method explanation.** C agrees with L11 and the native explanation for combined estrogen-like/progesterone-like contraception. The stem's unqualified “birth control pill” and “prevents” wording are broader than the lesson's distinctions among methods and model effects. Specify a combined hormonal pill/model rather than carrying over the broader wording. No individual treatment recommendation is implied.

6. **OBJ_2131153 and OBJ_2131104: keep gamete production terminology precise.** The first attempt leaves both unanswered because relevant CH14 prerequisites are absent. The first stem describes “sex-cell production”; the native explanation instead describes Sertoli-cell support and follicular development. The second invokes oogenesis and secondary-characteristic hormone production but its explanation only names the anterior-pituitary pair and ovarian targets. Those explanatory shortcuts do not themselves validate every phrase of the stems. Verify against the actual CH14 teaching; do not treat native keys as replacement teaching or claim those unseen prerequisites fail.

7. **Other qualified matches remain bounded.** OBJ_2131542's urethral endpoint is named in the native explanation but not labelled/defined in the permitted teaching; the first choice follows the taught sperm-transport failure. OBJ_2131523 uses “fertilized egg” where the taught implantation stage is blastocyst. OBJ_2131133 combines an enclosing membrane with its fluid's functions, clarified by the native explanation. OBJ_2131126 uses the course's through-week-eight embryonic convention, with L08's note that the first two weeks can be named separately. None of these qualifiers was erased by the matching key.

## Packet sufficiency

The supplied CH15 lessons support 20 of the 22 CH15-tagged review items at the requested evidence standard. The other two need the actions in findings 2 and 3. For CH14-tagged items, 11 had enough cross-topic CH15 support to make a reasoned selection, while 13 require the omitted CH14 teaching. The lesson-12 review itself explicitly directs learners back to Chapter 14 for the cumulative topic, so absence from this bounded packet is not evidence of absence from the complete course.

Missing CH14 prerequisites are the male LH/testosterone and GnRH/FSH pathways; Sertoli-cell function; scrotal temperature regulation; seminal fructose/buffer functions; sperm-production and maturation/storage locations; ovarian-control detail and phase terminology; and menopause terminology. Exact item identities are preserved in the first-response table and ledger below.

No blanket statement is made about original textbook fidelity, current scientific validity, complete-course coverage, runtime behaviour, automated grading, or teacher approval. Source fidelity here means agreement with the provided native bank's `unitReviewQuestions`, not independent validation of the bank's source claims.

## Per-item post-key ledger

The ledger below records keys only after the frozen attempt. Missing responses remain missing; they are not converted into correct learner answers.

| # | Source item | Chapter | Native key | First response | Comparison |
|---|---|---:|---|---|---|
| 1 | OBJ_2131514 | 14 | D | D | Matches native key |
| 2 | OBJ_2131523 | 14 | B | B | Matches native key |
| 3 | OBJ_2131525 | 14 | A | A | Matches native key |
| 4 | OBJ_2131539 | 14 | B | Missing prerequisite | Not attempted from absent teaching |
| 5 | OBJ_2131542 | 14 | D | D | Matches native key |
| 6 | OBJ_2131554 | 14 | B | Missing prerequisite | Not attempted from absent teaching |
| 7 | OBJ_2131568 | 14 | B | B | Matches native key |
| 8 | OBJ_2131570 | 14 | C | C | Matches native key |
| 9 | OBJ_2131575 | 14 | A | Missing prerequisite | Not attempted from absent teaching |
| 10 | OBJ_2131579 | 14 | D | Missing prerequisite | Not attempted from absent teaching |
| 11 | OBJ_2131153 | 14 | B | Missing prerequisite | Not attempted from absent teaching |
| 12 | OBJ_2131162 | 14 | A | A | Matches native key |
| 13 | OBJ_2131163 | 14 | A | Missing prerequisite | Not attempted from absent teaching |
| 14 | OBJ_2131095 | 14 | D | Missing prerequisite | Not attempted from absent teaching |
| 15 | OBJ_2131098 | 14 | D | D | Matches native key |
| 16 | OBJ_2131099 | 14 | D | D | Matches native key |
| 17 | OBJ_2131102 | 14 | D | Missing prerequisite | Not attempted from absent teaching |
| 18 | OBJ_2131103 | 14 | B | Missing prerequisite | Not attempted from absent teaching |
| 19 | OBJ_2131104 | 14 | D | Missing prerequisite | Not attempted from absent teaching |
| 20 | OBJ_2131105 | 14 | A | A | Matches native key |
| 21 | OBJ_2131110 | 14 | A | Missing prerequisite | Not attempted from absent teaching |
| 22 | OBJ_2131113 | 14 | B | B | Matches native key |
| 23 | OBJ_2131114 | 14 | A | Missing prerequisite | Not attempted from absent teaching |
| 24 | OBJ_2131122 | 14 | A | Missing prerequisite | Not attempted from absent teaching |
| 25 | OBJ_2131123 | 15 | A | A | Matches native key |
| 26 | OBJ_2131124 | 15 | A | A | Matches native key |
| 27 | OBJ_2131125 | 15 | B | B | Matches native key |
| 28 | OBJ_2131126 | 15 | A | A | Matches native key |
| 29 | OBJ_2131127 | 15 | A | A | Matches native key |
| 30 | OBJ_2131128 | 15 | A | A | Matches native key |
| 31 | OBJ_2131129 | 15 | A | A | Matches native key |
| 32 | OBJ_2131130 | 15 | B | B | Matches native key |
| 33 | OBJ_2131131 | 15 | A | A | Matches native key |
| 34 | OBJ_2131133 | 15 | D | D | Matches native key |
| 35 | OBJ_2131134 | 15 | A | A | Matches native key |
| 36 | OBJ_2131135 | 15 | C | Missing prerequisite | Not attempted from absent teaching |
| 37 | OBJ_2131136 | 15 | A | A | Matches native key |
| 38 | OBJ_2131138 | 15 | A | A | Matches native key |
| 39 | OBJ_2131139 | 15 | A | A | Matches native key |
| 40 | OBJ_2131140 | 15 | A | A | Matches native key |
| 41 | OBJ_2131141 | 15 | B | B | Matches native key |
| 42 | OBJ_2131142 | 15 | A | A | Matches native key |
| 43 | OBJ_2131143 | 15 | A | A | Matches native key |
| 44 | OBJ_2131144 | 15 | A | A | Matches native key |
| 45 | OBJ_2131146 | 15 | A | A | Matches native key |
| 46 | OBJ_2131152 | 15 | C | Missing prerequisite | Not attempted from absent teaching |
