# Biology 30 Chapter 15, lessons 03–04: source preflight

Date: 8 October 2026. Scope: source inspection only. No lesson manuscript, course implementation, runtime, browser session, learner response or task mapping was changed.

## Findings that affect authoring immediately

1. **Lesson 03 has a missing worked-example stimulus.** Its native worked example says “A schematic shows an early hCG peak followed by a decline while progesterone remains high” and then says “Identify both curves.” The complete native lesson contains zero images, no SVG, no canvas and no graph. The given is verbal, but the request to inspect two curves has no actual visual object. Preserve the worked example's question and reasoning; supply a genuinely inspected, clearly labelled schematic or an appropriate inspected source visual with explanatory limits.
2. **The inherited source maps omit or misassign important material.** Lesson 03 lists printed pp. 510–511 and teacher slides 10–12. The relevant multi-hormone graph is Figure 15.5 on p. 512; pregnancy testing is actual teacher slide 13. Lesson 04 lists pp. 511 and 513 and slides 13–15, but p. 512 contains its core definitions, while slide 13 is hCG. Adjacent slide 16 contains another gastrulation image worth inspecting. Consult the actual pages/slides rather than treating the existing lists as complete scope.
3. **Preserve existing scientific corrections.** The current native route correctly avoids declaring hCG an infallible diagnosis and correctly places human gastrulation in the third post-fertilization week. The teacher deck's “only possible source”/“pregnancy is confirmed” statement, week-2 gastrulation grouping and generic invagination illustration must not be restored as unqualified facts.
4. **The optional textbook filters are cross-topic.** Lesson 03 exposes nine questions, many about preceding fertilization or following gastrulation. Lesson 04 exposes four, consisting of hCG and later developmental-timeline questions. Preserve exact current IDs, wording, contexts, topic mappings and saved-response ownership. Teaching context or a clearly identified reading pointer can address the mismatch; reassignment is not incidental authoring permission.
5. **The existing core task meanings are coherent.** No required-check key/model contradiction was found in the two native routes. Most required-answer concepts are present, but lesson 03's graph is absent, lesson 04's movement-to-layer explanation is very compressed, and source concepts such as embryonic disc, gastrula and morphogenesis are omitted. This is a preflight finding, not a fresh learner-attempt pass.

## 1. Exact inputs and inspection method

Primary owner inspected in full for both routes:
- `biology_prep/ch15-source/unpacked/chapter-15/workspace/index.html`, sections `lesson-03` and `lesson-04`
- Native inline `course-data` and `textbook-practice-data`, plus their authoring counterparts
- Authoring `course-config.json`, `lesson-content.json`, `lesson-source-map.json`, `textbook-question-manifest.json`, `optional-source-responses.json`, `assessment-dispositions.json`, `source-assessment-catalogue.json`, `question-context-audit.json` and `source-discrepancies.md`
- Actual textbook `workspace/assets/textbook/chapter-15.pdf`, printed pp. 510–513, plus pp. 508–509 and 514–515 for the full optional-task givens; relevant p. 518 questions checked as adjacent source coverage
- Actual teacher deck `biology_prep/ch15-source/teacher/BIOLOGY 30 COURSE CREATION/Unit B Chapter 15 Notes.pptx`: slide XML/text, notes and media relationships for slides 8–17; all embedded images on slides 10–16 visually inspected
- Existing native lesson-04 germ-layer SVG inspected as source XML and rendered pixels
- Production standards v0.3 consulted for U01–U15/B01–B05; author owns freezing the standard for this new batch

Native inline course configuration exactly equals `authoring/course-config.json`. Native inline textbook manifest exactly equals `authoring/textbook-question-manifest.json`. This comparison establishes active-source identity; portable HTML and historical generators are not replacement authorities.

Source byte identities:
- Native index: 2,692,694 bytes, SHA256 `2770ecce23a9fb2b8253466b712cbfaa982fc7342c476d940f07f40c95a326b4`
- Course config: 320,379 bytes, SHA256 `4d023c61ee9b83dd4ea4488b5a518406b2309b059c7d1c46f272c98e28dc4441`
- Textbook PDF: 1,486,822 bytes, SHA256 `30b03cf91e5cf99ed0ae2a7dedf7cae2b246111b795d280b5b95ca937c56aa25`
- Textbook manifest: 108,698 bytes, SHA256 `aedfe442b493c0f0a091a8fb5b5b213ff8b9bd84a7ba24bf5c0b329f114a430d`
- Teacher PPTX: 6,976,589 bytes, SHA256 `38149b6f562425a0b49bed3d0ad4369c5c5eef48f44d9099ea673cc888c2eb84`, matching the supplied verified identity

PDF page 1 is printed p. 506; printed pp. 510–513 are PDF pages 5–8. Current route reader links use printed numbers. No runtime or PowerPoint rendering claim is made: deck inspection used its actual text, shapes' media references and image bytes. Chromium was not attempted.

## 2. Lesson 03: source coverage and source tensions

### Actual source progression

Textbook p. 510 links implantation to trophoblast hCG secretion and compares hCG action with LH. Page 511 continues the mechanism: corpus luteum persistence, continued estrogen/progesterone, maintenance of endometrium and suppression of menstruation; hCG stays high early, then decreases while placental hormone production becomes sufficient. Page 512 Figure 15.5 adds the missing multi-hormone visual and diagrams changing ovarian/placental contributions.

Actual deck sequence:
- Slide 10: image-only cleavage, blastocyst formation and implantation recap (`image6.png`); it contains no new hCG text
- Slide 11: menstrual-cycle/corpus-luteum recap, why falling ovarian hormones would lead to menstrual shedding; implantation image (`image10.jpg`) and labelled implanting blastocyst (`image31.png`)
- Slide 12: trophoblast → hCG → maintained corpus luteum → estrogen/progesterone → endometrium, followed by placental takeover; hCG-only graph (`image21.png`)
- Slide 13: urine hCG pregnancy testing; kit/product photo (`image19.png`) and one-line/two-line result example (`image7.png`)

### What the native lesson currently teaches

The route establishes the preceding LH/corpus-luteum relationship, the complete hCG-source/target chain, continued ovarian hormones, later placental contribution, and why a positive hormone test cannot establish implantation location or normal development. It correctly distinguishes hCG from progesterone. Required MC1, MC2 and both written responses are directly about those concepts.

The current lesson's short worked example has a legitimate causal conclusion, but it calls on a nonexistent two-curve graph. The route's source reading band omits p. 512, where the actual supporting figure is located. The words “conceptus,” “endometrium” and “target” deserve clear first-use meaning; the lesson question currently introduces “conceptus” without defining it. A visible blood-borne signal route would strengthen the source→hormone→ovary relationship and explain why hCG appears in urine. The optional authored receptor-failure problem also needs an explicit distinction between signal concentration and target-cell response rather than relying on outside knowledge.

### Important scientific/visual limits

- **Slide 13 overclaim:** trophoblast is said to be the “only possible source” and detection is treated as confirmation. Preserve the current evidence-limited approach. Detection alone does not locate a pregnancy; NICE NG126 1.8.2 explicitly warns against using serum hCG to establish location. FDA device-review evidence also recognizes occasional positive urine results in nonpregnant people. This is classroom mechanism work, not advice on a person's test.
- **Slide 11 absolute wording:** “no progesterone and estrogen produced” after corpus-luteum degeneration is too absolute. The native “levels fall” formulation is preferable.
- **Source timing:** p. 511 says high hCG for about two months and low by four months; p. 512's caption describes a peak near the first trimester's end; slide 12 says decline after the second month. Their precision and dating conventions differ. Keep the robust relationship, an early peak followed by lower levels while other hormone support continues, instead of inventing a single exact cutoff.
- **Slide 12 graph dating:** its x-axis explicitly reads GESTATIONAL WEEK, marked 1–30 with later unnumbered ticks. It peaks around the ninth labelled week and has no y-axis numerical units. It cannot be silently relabelled as weeks after fertilization and cannot supply a second progesterone curve.
- **Textbook Figure 15.5:** red hCG, blue progesterone, green estrogen; x-axis grouped into trimesters, y-axis generic hormone concentration, with no numeric scale. It supports within-curve trends and changing sources. It does not establish numerical concentration ratios or precise patient values. The B caption's “continues to increase until it levels off” is not a literal match to the drawn blue curve, which flattens in the middle and rises late. Treat it as schematic and explain what observation is actually used.
- **Placental contribution:** do not imply hCG secretion stops completely after its early peak. Do not imply the placenta suddenly appears on one date or that hCG transforms into progesterone.

## 3. Lesson 04: source coverage and source tensions

### Actual source progression

Textbook p. 511 introduces the amniotic cavity, flattened embryonic disc and its connection to the implantation context. Page 512 names gastrulation, primary germ layers, gastrula, morphogenesis and differentiation. Page 513 Figure 15.6 shows the changing embryonic disc and supporting spaces; Figure 15.7 gives representative derivatives. The page then begins neurulation, which is primarily the subsequent lesson's work.

Actual teacher content:
- Slide 14: amniotic cavity/fluid, inner-cell-mass reorganization, three germ layers and gastrula; `image11.png` shows generic blastula invagination with blastocoele, archenteron and blastopore, and labels only ectoderm/endoderm
- Slide 15: germ layers differentiate into specific tissues/organs; `image37.png` contains the derivative illustration and labels
- Slide 16: image-only supplementary gastrulation sequence (`image15.png`), with inner-cell-mass context, migration arrows and the mesoderm between ectoderm/endoderm

### What the native lesson currently teaches

The route places gastrulation after cleavage/blastocyst formation and in the third week after fertilization. It names the three layers and links them to representative tissues. It correctly distinguishes epidermis from all skin, gastrointestinal epithelium from the organ's muscle, and differentiation from acquiring a wholly new genome. The worked example classifies spinal-cord neurons, intestinal smooth muscle and respiratory lining. Required-check concepts are taught explicitly.

The native visual is a static three-band comparison, not a movement sequence. Its current purpose and accuracy can be retained, but it cannot independently show how cells establish the layers. The source's development from embryonic disc to three-layer arrangement would benefit from more visible causal explanation. The current route does not define embryo's disc, gastrula or morphogenesis, and does not locate the amniotic cavity. These are important missing source relationships even though no current required task directly asks for all three terms. A source-grounded explanation can supply them without converting later membrane/neurulation lessons into this lesson.

### Important scientific/visual limits

- **Week 2 versus week 3:** deck slide 14 groups its discussion under week 2. The book transitions from second-week disc development into gastrulation without adequately distinguishing stages. Keep the native third-week post-fertilization placement. Bilaminar-disc formation precedes human gastrulation.
- **Two-layer labels:** textbook p. 511/Figure 15.6 label the early bilaminar disc “ectoderm and endoderm.” More precise modern terminology is epiblast/hypoblast before formation of definitive germ layers. Do not silently teach the preliminary labels as if the definitive embryonic endoderm already exists. An introductory explanation can distinguish the two-layer precursor without adding unnecessary memorization requirements.
- **Slide 14 shape:** generic ball-infolding imagery should not be presented as a literal human embryo folding its whole blastocyst inward. Human gastrulation involves migration in the embryonic disc. The image also lacks the mesoderm needed for the stated three-layer learning goal.
- **Slide 16:** more pertinent migration imagery, but still highly simplified and its legend says entire “digestive tract”/“respiratory tract.” Qualify derivatives as epithelial lining and related tissues. Do not substitute the image's broad organ wording for the native mixed-origin explanation.
- **Slide 15:** derivative text at left describes ectoderm beside a body illustration displaying digestive organs; text at right describes endoderm beside a body illustration displaying nervous tissue. The central layer labels are clear, but spatial proximity of text and figures can mislead. Teach from clearly identified labels, not whichever body illustration is nearest. The textbook's Figure 15.7 separates the list more clearly.
- **Representative derivatives:** p. 513 includes more detail than the native route (dermis, kidney/ureter, glands, enamel, etc.). The native goals require representative tissues, not unannounced memorization of every list entry. Preserve “contributes to” language; not every cell of an organ shares one origin. Special neural-crest derivatives also make “every bone/muscle cell is mesodermal” too strong.
- **Adjacent neurulation claim:** p. 513 says the notochord forms the basic framework of the skeleton. Do not broaden that into “the notochord becomes the vertebral column” while bridging forward. Full neurulation is outside this batch's main focus.

## 4. Complete native tasks and givens

The saved `course-config-lessons03-04-evidence.json` contains full prompts/options/answers/cues/feedback/models/criteria and relevant vocabulary, sequence and labeling objects. This section records their identities and instructional dependencies, not replacement wording.

### Required checks

Each native check has two selected responses and two written responses, each written response limited to 3200 characters. Two correct selections unlock writing; saved writing is not automatically graded. Completion requires saving each response and selecting Submit and finish.

Lesson 03, `ch15-check-03`:
- `ch15-l03-check-mc-1`: hCG cannot act on corpus luteum; key is reduced corpus-luteum hormone support for endometrium
- `ch15-l03-check-mc-2`: what hCG detection does not establish; key is definitely normal uterine implantation
- `ch15-l03-check-writing-1`: trace source, direct target and subsequent hormones maintaining endometrium
- `ch15-l03-check-writing-2`: why falling hCG after its peak does not imply loss of all progesterone support

Lesson 04, `ch15-check-04`:
- `ch15-l04-check-mc-1`: identify the pair with ectodermal origin; key is epidermis/nervous tissue
- `ch15-l04-check-mc-2`: why the entire digestive system is not exclusively endodermal; key recognizes muscle/connective tissue contributions
- `ch15-l04-check-writing-1`: what gastrulation changes and which layers it establishes
- `ch15-l04-check-writing-2`: intestinal muscle versus lining in a selective developmental-damage scenario

### Native supported work and practice pools

- Worked examples: `ch15-l03-worked`, `ch15-l04-worked`; preserve stated scenarios, reasoning targets and stimulus needs
- Guided activity IDs: `ch15-l03-guided-q1/q2` (corpus luteum; placenta), `ch15-l04-guided-q1/q2` (epidermis origin; heart-muscle origin); preserve options, hint/cue and explanatory feedback
- Optional imported MC: `ch15-source-OBJ_2131127`, `...1128`, `...1129` (lesson 03), `...1131` (lesson 04)
- Native imported versions intentionally adapt earlier source items. Their current stimuli arrays are empty. Historical 1127/1131 catalogue images are not required givens for the adapted native prompts; their old image paths were not found in the workspace. Do not “restore” an old stimulus or source stem into a saved native question ID without an explicit assessment/version decision
- Eight definition-recognition questions and eight context-retrieval questions accompany the eight lesson terms
- Authored transfer/application: `ch15-l03-application-1` tests equal hCG concentrations with different receptor response; `ch15-l04-application-1` tests shared DNA/different expression and developmental signals
- Sequence `ch15-sequence-03`: trophoblast-derived tissue releases hCG; hCG maintains corpus luteum; corpus luteum continues progesterone/estrogen secretion; endometrial support continues
- Multi-select `ch15-multiple-04`: two accurate statements distinguish gastrulation from cleavage and recognize mixed tissue origins within organs
- Label diagram `ch15-germ-layers-label` and three associated A/B/C questions: A Ectoderm, B Mesoderm, C Endoderm
- No lesson-03/04 video entries and no additional saved written-source-response entries are present. The four additional written applications belong to lessons 02/12, not these routes

### Optional textbook question inventory and full supporting context

Twelve unique questions are exposed across the two filters; hCG Q9 appears in both. Every referenced question crop and full-page context file exists. The exact manifest objects, including crop boxes/roles/paths and complete source text, are saved in `textbook-question-givens-lessons03-04.json`.

Lesson 03 filter (9):
1. `ch15-p509-in-text-q1`: How many chromosomes are there in a human egg once fertilized? Source contexts pp. 509 and 508; the 23 + 23 = 46 contribution is on those pages
2. `ch15-p509-in-text-q2`: Why fertilization within 12–24 hours of release? Context pp. 509/508; p. 508 states the oocyte loses capacity to develop further
3. `ch15-p509-in-text-q3`: Why so few sperm reach the oviduct? Context pp. 509/508; p. 508 identifies acidic vaginal environment and entry into the other oviduct
4. `ch15-p509-in-text-q4`: Why is the first sperm reaching the egg unlikely to enter/join it? Context pp. 509/508; original source uses cooperative enzyme-clearing explanation. Preserve the previously corrected distinction that reaching coverings is not successful fertilization; do not restore an obligatory “hundreds must dig a path” human rule
5. `ch15-p511-in-text-q7`: Trophoblast or inner cell mass as embryo source? Context pp. 511/510; answer inner cell mass
6. `ch15-p511-in-text-q9`: What is hCG and how long is it secreted? Context pp. 511/510. Explain high early levels and later lower continuing secretion; “two months, then none” is not justified. Figure 15.5 on p. 512 supplies especially helpful continuation even though it is absent from this question's context list
7. `ch15-p512-in-text-q10`: What/where is amniotic cavity? Context pp. 512/511; space adjacent to developing inner-cell-mass/disc and trophoblast, later enclosed by amnion
8. `ch15-p512-in-text-q11`: Name three embryonic-disc layers. Context pp. 512/511; ectoderm, mesoderm, endoderm
9. `ch15-p512-in-text-q12`: Process forming primary germ layers. Context pp. 512/511; gastrulation

Lesson 04 filter (4):
1. Shared `ch15-p511-in-text-q9`, hCG definition/duration, as above
2. `ch15-p515-in-text-q17`: Identify three fourth-week events. Context pp. 515/514. Source p. 514 supplies blood cells/vessels, emerging lungs/kidneys, limb buds, distinct head/early sensory structures; learner must identify events, not infer three from an unlabelled photo alone
3. `ch15-p515-in-text-q18`: Four events between weeks 5–8 and when. Context pp. 515/514. The source gives week-5 head/eye/brain changes; week-6 brain/limb changes; weeks-7–8 organ differentiation, cartilage skeleton and eyelid changes. Historical fine timings should not be converted into patient predictions
4. `ch15-p515-in-text-q19`: When embryo is termed fetus. Context pp. 515/514; at the transition after week 8, beginning week 9 from fertilization

Cross-topic mappings to flag without altering:
- Q10–12/p. 512 are mapped to lessons 06/02/03, not lesson 04
- Morphogenesis Q13 and differentiation Q14/p. 512 are mapped only to lesson 06
- Germ-layer significance review Q5/p. 518 is mapped only to lesson 06
- hCG review Q6(a–b)/p. 518 is mapped to lessons 05/06. Its second part requires the blood/urine route: a secreted hormone circulates in maternal blood and is detectable after excretion into urine
- Timeline Q17–19/p. 515 are mapped to lessons 05/07/04

## 5. Preservation boundary

Keep the current shell and route IDs, previous/next navigation, required-versus-optional progress semantics, optional task selectors, reader mappings, save/redo/finish behavior and state ownership. This batch may improve teaching within its authorized manuscript scope; it does not authorize runtime, global practice-bank, migration or assessment redesign.

Specifically preserve:
- `lesson-03`, `lesson-04`, `ch15-check-03`, `ch15-check-04`; all existing task IDs and response meaning
- Full required-check prompts, options and order, correct answers, cue/explanation, written models/criteria, 3200 limits and controls
- Guided select IDs, choices and feedback; worked-example targets and givens
- Eight term IDs and their shared definitions/Frayer relationships; preserve support for existing vocabulary rather than silently changing global definitions
- `ch15-sequence-03`, optional application/blank/MC/multi-select IDs and data
- Germ-layer labeling A/B/C answers and original label-diagram asset; new teaching art should not silently replace its task asset
- All textbook question IDs, complete crops plus context images, topic arrays, saved-response boundaries and original embedded PDF
- Canvas edit keys/helper keys and teaching-section IDs when a candidate follows the native target slots
- Other routes, reader library, global practice and All My Work

Detailed native attribute inventory and serialized required/guided HTML are saved in `preservation-preflight.json`. That file also records native-source hashes and exact optional-question identities. Extracted route HTML files are UTF-8 fragments; use an explicit UTF-8 parser when reading them without the original document's charset declaration.

Recommended decision boundary: repair a missing teaching stimulus, explanations, first-use terms and carefully bounded source notes. Escalate changes to task prompts/options/keys, canonical filters or stage/learning-goal scope. Do not turn a source discrepancy into a silent change to historical learner-response meaning.

## 6. External corroboration used for real source conflicts

These were consulted on 8 October 2026, not used to replace the uploaded instructional source:
- OpenStax Anatomy and Physiology 2e, 28.2: hormone source/target pathway, amniotic-disc context, third-week gastrulation and cell migration. Its prose explicitly distinguishes the epiblast/hypoblast precursor and the three subsequent germ layers. Its Figure 28.9 caption inconsistently says “first 2 weeks,” so do not rely on that caption as timing authority. https://openstax.org/books/anatomy-and-physiology-2e/pages/28-2-embryonic-development
- NCBI Bookshelf, Embryology, Gastrulation (updated 23 April 2023): corroborates week 3 and the bilaminar-disc precursor. https://www.ncbi.nlm.nih.gov/sites/books/NBK554394/
- NICE NG126, section 1.8.2: hCG measurements do not establish implantation location. https://www.nice.org.uk/guidance/NG126/chapter/diagnosis-of-viable-intrauterine-pregnancy-and-of-tubal-ectopic-pregnancy
- FDA Clearblue Early Pregnancy Test review K213379: acknowledges low urinary hCG and possible false-positive results in some nonpregnant people. https://www.accessdata.fda.gov/cdrh_docs/reviews/K213379.pdf
- NCBI Bookshelf, Human Chorionic Gonadotropin: corroborates nonpregnancy sources and limitations of a positive hormone result. https://www.ncbi.nlm.nih.gov/books/NBK532950/

No individual medical conclusions, new Alberta curriculum certification, exact textbook-answer acceptance, teacher approval, learner-sufficiency pass, implementation success or LMS behavior is asserted.

## 7. Supporting files created by this preflight

- `lesson-03-original-readable.html`, `lesson-04-original-readable.html`: full native route fragments
- `lesson-03-original.txt`, `lesson-04-original.txt`: text extraction
- `course-config-lessons03-04-evidence.json`: complete relevant config objects
- `textbook-question-givens-lessons03-04.json`: 12 unique native optional questions with all crop/context metadata
- `preservation-preflight.json`: source byte identities, parity checks, identifiers and exact protected check/guided HTML
- `textbook510-513.txt`: actual PDF text for the assigned core pages
- `textbook-question-contexts.txt`: adjacent page text for question context and source coverage
- `teacher-slides08-17.txt`: text extracted from actual PPTX slides, not the inherited transcript
- `preflight-media/`: page renderings 510–513, original teacher embedded images used above, and a rendered native germ-layer SVG

The core pages and every actual teacher image named in sections 2–3 were visually inspected. The complete active question prompts/options/configuration and corresponding textbook full-page contexts were read. Individual crops were checked for existence; the question blocks themselves were inspected on the full-page source renderings. No fabricated figure, graph value or task given was added.
