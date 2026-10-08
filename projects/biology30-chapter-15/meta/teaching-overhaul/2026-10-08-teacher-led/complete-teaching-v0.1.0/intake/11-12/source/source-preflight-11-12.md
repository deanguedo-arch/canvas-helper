# CH15 lessons 11–12 source preflight

8 October 2026. Direct source inspection for bounded teaching authoring. No original source, assessment, native figure, control, runtime or learner state was changed. This is not teacher acceptance, an integrated-course pass, or a runtime test.

## Result and boundaries

Drafting-ready for the existing teaching owners, with the source limitations below retained. The complete native pair, all required and optional pair tasks, generated vocabulary-family task templates, the cumulative unit-review bank, relevant source questions, and their supplied visual givens have been inspected. Several old-source errors and task-context faults prevent a blanket claim that every optional source is sufficient or scientifically current.

The required final check is not another ordinary lesson check. It has six selections and two written explanations. Its optional independent transfer has three selections and one written explanation. Three further optional source-written responses use four source images. All stay protected, with unchanged identity, prompt, options, models, keys, limits and required/optional status.

## Frozen inputs and source authority

Course production standards v0.4 was hash-verified before inspection and frozen as `Course_Production_Standards_v0.4.txt`: db8a04bcd7620d9ecf64ec6dc86c046cb3075b9b09cc51dac41936c391379e1e. Applicable rules: D01–D08, U01–U15, B01–B05 and V01, with runtime, first-use/resume, actual integration, teacher acceptance and release explicitly not tested here.

Historical native owner: `ch15-source/unpacked/chapter-15/workspace/index.html`, contentVersion `2026-09-17-completed-handoff`, bankVersion `ch15-complete-v1`; SHA256 2770ecce23a9fb2b8253466b712cbfaa982fc7342c476d940f07f40c95a326b4.

Actual teacher PPTX: `ch15-source/teacher/BIOLOGY 30 COURSE CREATION/Unit B Chapter 15 Notes.pptx`; SHA256 38149b6f562425a0b49bed3d0ad4369c5c5eef48f44d9099ea673cc888c2eb84. All 42 slide text records and all 42 notes were directly extracted. Notes contain no substantive additional teaching. All ten unique images embedded in slides35–42 were viewed. This was native PPTX XML/media inspection, not PowerPoint or a complete slide-layout rendering.

Original chapter PDF: `workspace/assets/textbook/chapter-15.pdf`; SHA256 30b03cf91e5cf99ed0ae2a7dedf7cae2b246111b795d280b5b95ca937c56aa25. It has 34 PDF pages corresponding to printed506–539. Printed508–537 text was read completely. Printed528–537 full-page pixels and all 42 relevant question/continuation crop pixels were inspected. Earlier chapter figure labels were reviewed through complete extracted text and the native source-written image where relevant; do not upgrade this into a new complete early-chapter figure or candidate review. Rendered538–539 are extraction artifacts only, not reviewed content.

All authoring files were frozen. Native `course-data` and authoring `course-config.json` are exactly equal as parsed JSON: all 24 top-level keys and their complete values match, including the later activity and unit-review arrays. The frozen config and saved native extraction match them as well; `native-authoring-config-comparison.json` records this fresh comparison. The separate `lesson-content.json` and initial builder are content/provenance artifacts, not substitutes for this matching native/config task census. The older assessment-dispositions text calls cumulative items archived/other-chapter, whereas both native/config records contain 46 current optional unit-review items. Preserve that current bank; do not reconstruct it from the older disposition descriptor.

`source-input-hashes.json`, `native-dom-ownership-and-hashes.json`, `protected-asset-hashes.json`, and `source-task-coverage.json` carry exact receipts. Source copies are in `frozen-inputs/`.

## Native lesson 12 format and exact ownership

Lesson11 contains a page header, three teaching sections, the worked example, two supported selections, a stop-and-think disclosure, required2+2 check, navigation, and an optional textbook link. No teaching figure is currently embedded.

Lesson12 contains a page header; separate review instructions; two teaching sections; an unkeyed eleven-topic goal summary table; a worked synthesis example; independent transfer; the required6+2 final check; three optional source-written disclosures; navigation; and a textbook link whose topic is `chapter-review`. It has no ordinary lesson guide, supported-select pair, dedicated lesson12 vocabulary concept set, sequence, multiselect or labeling activity. Its four visible key terms refer to earlier chapter word records.

The exact teaching-prose owners are:
- Lesson11: `ch15-l11-teaching-01`, `ch15-l11-teaching-02`, `ch15-l11-teaching-03`
- Lesson12: `ch15-l12-teaching-01`, `ch15-l12-teaching-02`

Existing instructional worked examples are `ch15-l11-worked` and `ch15-review-worked`. Preserve their stated scenario and steps when adding explanation. Lesson11's example also exists in `course-data.guidedActivities[10].worked`; it is not a separate free-standing owner. The chapter-goal summary table precedes `ch15-review-worked`; preserve each topic/goal.

Protect headers/outcomes/reading links/term bindings, vocabulary/Frayer data and controls, native supported practice, stop-check question/explanation, `[data-transfer='ch15-transfer-01']`, both required checks, all source-written disclosures and images, options/models/criteria/limits, route/navigation and textbook filters. An edit-key attribute alone does not authorize altering an assessment. For teaching expansion, keep source task content intact and supply explanation in the teaching region.

## Complete task census and blind-packet inputs

Native required: lesson11 two selections plus two written responses; lesson12 six selections plus two written responses. Supported practice: two selections in lesson11. Stop-and-think: one question with a hidden explanation. Independent transfer: three selections plus one written response. Source-written: three optional responses in lesson12, each with a5000-character limit. Required/transfer written limits are3200 characters.

Lesson11 optional practice pool has31 distinct identities: five adapted source MC, four foundation MC, one application MC, four contextual typed items, sixteen runtime-derived vocabulary variants, and one scenario flash variant. The derived sixteen comprise Explain, reverse retrieval, misconception correction and definition-to-term for each of the four lesson11 concepts. No exclusions suppress these families in this pair. The scenario-flash identity is `ch15-l11-scenario-1`.

`revision-practice.js` lines9–20 were read directly and the exact templates were expanded statically; the runtime was not run. Its options can shuffle, so identity and option text, rather than displayed letter position, establish parity. The cumulative bank exists only under the separate `unit-review` topic and mixed-practice mode; its46 entries are24 CH14 and22 CH15. These are not additional required-final items and do not make lesson12 responsible for reteaching all CH14.

Frayer support was read from main.js lines130–138. Each selected word has four fields: “Meaning in your own words”; “Key features or what it does”; “A specific example”; “A non-example or common confusion”. Each field permits240 characters; up to eight chapter words can be selected. Pair-visible terms are four new lesson11 terms plus the four earlier anchor terms shown on lesson12. Optional Frayer completion is not an accuracy grade.

Prepared files:
- `native-task-prompts-blind.json`: native required, guided, transfer, static optional pool, unit-review, source-written and stop-check prompts, options and givens
- `native-task-keys.json`: separate corresponding feedback/models/criteria
- `derived-practice-prompts-blind.json`: seventeen exact source-derived identities/prompts
- `derived-practice-keys.json`: separate derived answers/feedback/aliases
- `frayer-pair-prompts-blind.json` and `frayer-pair-models.json`: eight pair-visible word choices and separate models
- `protected-native-pair-tasks.json`: full unmasked frozen record, not a blind learner packet

The blind JSON retains metadata IDs and concept bindings for author parity work; present only learner-facing fields when creating an actual blind attempt. Do not expose keys or source answer records in the learner packet. Existing visible worked teaching is permitted support; feedback revealed only after an attempt must remain masked for that attempt. Textbook originals remain original resources with their own visible teaching.

## Dependency map

`core-task-dependency-map.json` binds every required, guided, transfer and source-written task to actual source pages/slides and prior teaching ownership.

Lesson11 must make gamete placement, laboratory versus oviduct fertilization, transfer versus implantation, endocrine stimulation versus transport obstruction, and biological evidence versus values clear before its tasks. The application and misconception variants also require that cervical mucus can impede sperm passage while ovulation continues. Duct procedures do not directly remove endocrine gonads; accessory-gland fluid can still enter semen.

Lesson12's final selections depend respectively on blastocyst cell regions, hCG/corpus-luteum/progesterone support, tissue-specific germ layers, umbilical-vein direction, prolactin versus oxytocin, and age-convention starting points. Its first writing needs a connected cell-number/organization/implantation/germ-layer/organogenesis sequence. Its second writing needs the early support chain and the labour feedback loop with source, neural route, hormone target, reinforcing effect and ending event. Do not label the isolated hCG-to-corpus-luteum support chain a negative-feedback loop without specifying an actual return pathway.

Transfer requires three changed-condition predictions: implantation failure despite a normal blastocyst; thicker diffusion distance despite continuing circulation; and impaired mammary response despite normal milk production. The writing needs both an age-reference limit and structure-versus-function limit. Explain these principles without supplying a new clinical case or claim of exact outcomes.

Cumulative CH14 prerequisites are reproductive routes and gonads, sperm formation/maturation and fluid environment, pituitary/hypothalamic signals, ovarian-cycle order, and endocrine negative feedback. They are intentionally separate from the required final. The current native46 have complete self-contained prompts and no image givens.

## Actual teacher-deck map

The inherited lesson-source-map is approximate; use inspected native numbering:
- Slides5–6: fertilization; slides8–10: cleavage/blastocyst/implantation
- Slides11–12: corpus luteum/hCG; slide13: pregnancy-test claims (not a general diagnostic authority)
- Slides14–16: gastrulation/germ layers; slide17: extraembryonic supports; slides18–19: organogenesis/neurulation
- Slides20–21: placenta; slides22–24: fetal development; slide25: conception-to-birth media; slides26–27: parturition; slides28–29: lactation
- Slide35 is a sex-development discussion/video continuation, not reproductive-technology teaching. Slides36–37 teach/show IVF;38 fertility drugs;39 artificial insemination;40 barriers;41 hormonal contraception;42 surgical transport interruption

Native lesson11 has no video link. Slide35 videos and other deck-linked video content were not watched or certified. Do not add them as required prerequisites.

## Optional textbook tasks and source-context defects

The native lesson11 topic includes41 unique questions: four in-text questions on530/532; six legacy-tagged section15.2 questions on528; five section15.3 questions on534; and all26 chapter-review questions on536–537. The lesson12 textbook link selects those26 chapter-review items. Keep these exact IDs and topic bindings pending explicit repair authorization, even when lesson11 tagging is broader than its teaching topic.

All41 prompt texts and42 crop/continuation pixels were inspected against the original complete pages. Full task data, paths and current image hashes are in `protected-textbook-pair-tasks.json` and `protected-asset-hashes.json`.

1. Q21, printed536, explicitly requires the ectopic-location diagram on537. Its current task offers only536, so the supplied task context is incomplete. The original537 exists in the PDF. No current task-context parity pass is possible forQ21.
2. Q24, printed536, incorrectly includes a left-hand crop of that ectopic diagram as a “required question continuation”. Its actual44-day question is complete on536 and has no such continuation. The attached crop also cuts off much of the ectopic diagram. Preserve the mapping and flag it; do not treat the diagram as evidence forQ24.
3. Q26, printed537, has a left-column crop that stops mid-sentence and cuts the right-side continuation and twin diagram. The task also supplies the complete537 page, which is essential to read the entire prompt and drawing. The extracted `sourceText` is incomplete and cannot substitute for those pixels.
4. Q19's graph gives organ windows and a “percent sensitivity” label but no numerical y-axis scale or denominator, no specified agent/dose and no explicit age convention. It supports qualitative comparison, not an exact personal probability or numerical percentage. The continuing brain/skeleton band does not say all organs have equal sensitivity throughout pregnancy.
5. Q24's44-day LMP task permits an approximate30-day post-fertilization estimate only under the usual approximately14-day offset assumption; an exact conception date or individual organ function is not established.
6. Section15.2 Q3 invokes the book's vitamin-C claim and Q8 asks for historical cultural dietary inference. Neither justifies current personal dietary/medical advice, a universal culture claim, or pretending the printed account supplies missing empirical evidence. Preserve and qualify the scope rather than invent a unique clinical answer.
7. Section15.3 Q3 asks for effectiveness and safety. The historic percentages and clinical statements on531–532 are not current verified estimates. Its research-dependent dimensions cannot be certified solely from the bounded teaching manuscript. Do not insert unsupported rates merely to fill the table.
8. Q22, printed536, suggests an unspecified milk-production-inhibiting drug. Reduced prolactin is a reasonable course-model possibility, but the observation alone does not uniquely establish the drug's target or changed secretion; other synthesis/response steps could be involved.
9. Q23's historic “fewer than10 million = infertile” statement is not a current diagnostic rule. Keep the general many-sperm/transport reasoning separate from a universal threshold.

## Source scientific reconciliation

Preserve the existing native science corrections. Several teacher/PDF statements are historical or overbroad; they must not be reintroduced while expanding teaching.

- Textbook531 calls emergency hormone treatment “not a form of contraception” and suggests post-fertilization implantation prevention. WHO explicitly describes emergency contraception; FDA's Plan B One-Step review supports preventing/delaying ovulation and does not support effects on implantation. These statements do not license claims about every drug or every intrauterine device. Reconcile at the mechanism level only, with no dosing, timing instructions, success percentages or personal prescribing advice.
- Teacher41 groups IUDs into a universal hormone/FSH-LH/ovulation account. WHO distinguishes hormone-free copper IUDs from levonorgestrel-releasing devices, with different actions. The official Mirena label describes mainly local effects and records ovulatory cycles; not every hormonal method prevents every ovulation. Retain the native method-specific distinction. Teacher41's48-hour emergency-treatment line and textbook531–532 schedules/rates are not current course instructions.
- Q26's claim that all monozygotic twins have one chorion and two amnions describes only one arrangement. NHS explicitly identifies identical twins as potentially DCDA, MCDA or rarely MCMA. The original task is a stipulated drawing model, not a universal biological rule. Preserve its prompt and figure; do not make final12 a new clinical multiple-pregnancy unit.
- Q14a must not be taught as requiring a universal sharp fall of circulating progesterone to initiate human labour. Endotext distinguishes functional progesterone withdrawal and increased responsiveness in human parturition. For this course, retain the bounded pregnancy-support versus labour-response explanation, not a serum threshold or individual prediction.
- Existing source526 wrongly says prolactin is not secreted during pregnancy; teacher28 also implies secretion first begins after birth. Do not restore this claim. Native teaching distinguishes production/ejection, and previously reviewed lesson10 owns the detailed correction.
- Teacher7 says fetal development ends at week12; source508/520 instead says week9 to birth. Textbook520 also writes266 days as approximately40 weeks, conflating reference points. Keep the explicit age convention and approximate38 post-fertilization versus40 LMP framework.
- Teacher14 and textbook511–513/535 blur bilaminar-disc formation and gastrulation timing. Do not undo the existing third-post-fertilization-week gastrulation clarification or turn the simplistic second-week sequence into a universal rule.
- Earlier source claims about every substance crossing the placenta, the yolk sac having no nutritive role, instant depolarization as the human polyspermy block, pregnancy-test infallibility, literal early eye “opening”, and SRY directly encoding testosterone must not be imported into the final synthesis. They lie outside a new full earlier-lesson scientific re-review here; preserve the already bounded corrected mechanisms and prior source flags.

Official cross-checks read during this preflight:
- WHO, Emergency contraception: https://www.who.int/news-room/fact-sheets/detail/emergency-contraception
- FDA, Plan B One-Step information, mechanism-of-action review: https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/plan-b-one-step-15-mg-levonorgestrel-information
- WHO, Intrauterine devices,22January2026: https://www.who.int/news-room/fact-sheets/detail/intrauterine-devices
- FDA Mirena label,2022,§12.1–12.2, local action and ovulatory cycles, used only for this stable mechanistic counterexample, not current prescribing: https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/021225s043lbl.pdf
- NHS, Antenatal care with twins, different types of twins: https://www.nhs.uk/pregnancy/your-pregnancy-care/antenatal-care-with-twins/
- Endotext, Endocrinology of Pregnancy, human parturition: https://www.ncbi.nlm.nih.gov/books/NBK278962/

## Source-written visual givens

Application1 `OBJ_2131148`: image lists1 blastocyst,2 zygote,3 gastrulation,4 morula. Historical key2413 matches chronological order. The image's “ovulation to implantation” heading is inaccurate because gastrulation follows implantation. Preserve the figure and key; teaching can separate the events. The key itself is not exposed as an automatic current native grade.

Application2 `OBJ_2131149`: image lists1 hypothalamic oxytocin production/posterior release,2 milk letdown,3 neural route to hypothalamus,4 mammary contraction,5 suckling. Key53142 fits the reflex. Interpret the reflex's acute endocrine step as release of hypothalamically synthesized oxytocin; do not imply each feed requires first producing it anew. Its heading mentions production and secretion, while the five listed steps specifically trace ejection.

Application4 `OBJ_2131151`: first image shows membrane labels1–4; second gives answer order chorion,allantois,amnion,yolk sac. Pixel inspection is consistent with key4213. Keep both images together. The generic native alt texts do not transcribe these givens, so this read-only receipt does not establish a nonvisual accessibility pass.

The four native images are present and hash-matched. Eleven additional historical source-catalogue images referenced by earlier, adapted MC tasks are absent from the handoff (IDs listed in `missing-historical-assessment-assets.json`). The current adapted tasks no longer depend on those pictures. Their self-contained prompt/key mechanisms were read, but original missing-pixel parity cannot be claimed or reconstructed from the catalogue's old letter key.

## Optional source-art supplement

Figure15.18, printed531/PDF26, was inspected in the complete page. `figure-15-18-source-crop.png` is an exact PDF rendering crop, with no redrawing or label modification. Its provenance JSON records points[55,472,567,735] and scale2. All A/B panels and label callouts are present. The source original is unchanged.

It can support a proposed lesson11 transport comparison: identify the cut duct and the retained gonad, then explain their different functions. It does not picture hormone movement and cannot by itself prove normal hormone concentration. Its “glands continue to produce semen” label means accessory-gland fluid contribution in the teaching explanation; sperm production belongs to testes. Do not append the surrounding source's blanket efficacy guarantees. This is a candidate source asset only, not an inserted native figure or a review of final candidate desktop/mobile pixels.

## Remaining gates

Fresh learner attempt using the actual candidate and all retained task fields/pixels; independent science/assessment review of candidate changes; targeted repairs and repeated affected checks; actual integration and runtime/save/resume checks if later authorized; teacher acceptance of exact candidate; separate release. Optional-context defects, missing historical images and unverified clinical research dimensions must remain visible in the delivered review scope. This preflight changes none of those gates into a pass.
