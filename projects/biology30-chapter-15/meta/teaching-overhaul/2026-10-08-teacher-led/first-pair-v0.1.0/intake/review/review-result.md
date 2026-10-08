# Independent review of Chapter 15 lessons 01–02

Reviewed 2026-10-08 UTC. The exact candidate reviewed is identified below. No protected question, key, teaching fragment or learner manuscript was changed.

## Decision

- Learner sufficiency: **PASS** for the 15 requested local response items: four supported selections, two stop-and-think responses, four required selections, four required written explanations and lesson 02's optional anatomical application. Every consequential step has a visible teaching/pixel justification in `first-attempts.md`. Worked examples and guided diagram walkthroughs were additionally attempted.
- Source/scientific accuracy: **PASS for the candidate lessons in this scope**, with the source limitations below. I found no required-content scientific repair. This is a level-appropriate scientific review, not validation of every molecular detail or all optional external content.
- Actual image pixels: **PASS for the four exact learner image assets and exact SVG rendering inspected**. Fertilization layers, cleavage A–E leaders, anatomical organs and the optional 1–3 leaders are present and usable at inspected resolution. Embedded browser size, responsiveness, enlargement and keyboard access are not established by this result.
- Actual runtime: **NOT VERIFIED**. No learner session was run. Start/check/unlock/save/edit/submit/progress/All My Work behavior was not tested. The HTML is a manuscript section rather than a verified runnable whole course; no runtime conclusion follows from static text, original-course reports or these image inspections.
- Novice learning outcomes: **NOT VERIFIED**. These are independent first attempts using only the visible lesson evidence, not empirical performance data from a real novice learner.

No repair request is needed before integrating these teaching manuscripts, subject to the separate runtime gate. This does not authorize integration or any change to protected materials.

## Blind first-attempt protocol

Phase 1 read only `review/lesson-01-blind.txt`, `review/lesson-02-blind.txt`, the named learner assets and the permitted exact cleavage SVG preview/source. The blind HTML files were hashed but not opened during phase 1. No original configuration, full manuscript, key, feedback, textbook, teacher PPTX, source/preflight report or outside scientific source was consulted before saving first attempts.

`first-attempts.md` was saved and its provisional finding sent before phase 2. Its SHA-256 is `7c287234349f40f98679775682a30e8b0f008c99ee882cb3928779b788363bc2`.

All 14 feedback/key-bearing local answers agree with the original feedback or configuration. The separate optional anatomical attempt produced 2213 before source access; phase 2 confirmed that source item OBJ_2131150 has original key 2213. The numbers were established by actual leader endpoints and lesson-taught anatomy, not the key. Number 3 identifies the uterine region at the resolution provided; it is not a histological demonstration of a particular endometrial sublayer.

## Protected assessment comparison

I read the original workspace `index.html` and source `authoring/course-config.json` only after first attempts. The original course configuration's first two checks supply exactly the prompts, options, answers and written models used for comparison. The candidate retains their visible content.

A fresh DOM comparison against the original workspace confirms identical normalized visible text for:
- Lesson 01: guided practice, stop prompt/feedback, both check questions, both written questions/models
- Lesson 02: the same groups plus the optional written application and its instructions

The focused comparison is saved in `protected-comparison.json`. It is a text-preservation check, not an event-handler or browser test. The original source configuration and assessment assets remained read-only.

## Source inspection and reconciliation

The original chapter PDF was inspected directly: extracted printed pages 508–511 were rendered from PDF pages 3–6 and their actual pixels viewed, in addition to the supplied workspace page images. The teacher PPTX was read directly as OOXML for slides 3–10, including actual embedded images and their slide relationships. This was content/source inspection, not a PowerPoint layout or playback test.

1. **Fertilization site and chromosome combination.** Printed pp. 508–509 and PPTX slide 5 support the oviduct as the usual site and the two haploid contributions forming one diploid zygote. The candidate correctly separates ovulation, arrival, successful entry and subsequent cell division. Its numerical examples transfer the taught operation rather than requiring an untaught rule.

2. **Coverings and the acrosome.** Actual textbook Figure 15.1 and teacher slide 6 contain the acrosome, corona radiata, zona pellucida and cell membrane shown in the new lesson. The candidate JPEG is byte-identical to PPTX `ppt/media/image4.jpg`. The candidate appropriately describes enzymes as helping alongside movement and interactions, rather than asserting enzyme-only penetration or a mandatory fixed number of cooperating sperm.

3. **Polyspermy mechanism and attachment versus entry.** Textbook p. 508 and PPTX slide 6 present a rapid depolarization block as human fact; slide 5 also conflates attachment with successful entry. The candidate specifically marks the electrical-block account as unsuitable as an established human explanation and uses cautious cortical/zona wording. This does not claim that one experiment proves the absence of every electrical effect or that zona changes guarantee zero penetration in every setting.

4. **Nuclear events.** Figure 15.1 and slide 6 summarize the event as nuclear fusion. Textbook p. 508 already describes disappearance of nuclear membranes. The candidate explains parental nuclear-envelope breakdown and participation of chromosomes in the first division. It does not demand physical fusion of intact pronuclei or import detailed spindle claims.

5. **Cleavage and stage organization.** Printed pp. 509–511 and slides 8–10 show repeated divisions, smaller cells, morula organization, then cavity, inner cell mass and outer cells. The candidate teaches organization rather than an exact visible cell count, describes the schematic as a section/not to scale, and labels its numerical volumes as illustrative. Equal overall outlines are not represented as measured growth data.

6. **Implantation and trophoblast.** Printed p. 510 and slides 9–10 support blastocyst interaction with the uterus near the end of the first week and continuation into the next. The candidate corrects p. 510's misleading “outer lining” to the uterine inner lining, distinguishes stage organization from evidence of attachment, and says trophoblast contributes to fetal placental/support tissues rather than becoming the entire placenta. Timing is explicitly approximate and measured from fertilization.

Teacher slide 7's fetal-stage endpoint is an unrelated source error, not imported into these two lessons and not a reason to expand their assessed scope.

## Independent scientific cross-checks and their limits

- Homa and Swann (1994), [A cytosolic sperm factor triggers calcium oscillations and membrane hyperpolarizations in human oocytes](https://pubmed.ncbi.nlm.nih.gov/7714158/): primary-study abstract read. Sperm-extract injection induced human-oocyte calcium oscillations with hyperpolarization, supporting activation-related events after sperm contribution. This is not direct proof of every event during natural fertilization and does not establish a universal negative about electrical effects. It supports the candidate's caution about treating textbook depolarization as the established human block.

- Patrat et al. (2006), [Zona pellucida from fertilised human oocytes induces a voltage-dependent calcium influx and the acrosome reaction in spermatozoa, but cannot be penetrated by sperm](https://link.springer.com/article/10.1186/1471-213X-6-59): primary article full text, results and discussion read. Fertilized human zona retained sperm-binding/acrosome-induction activity while penetration was substantially reduced. The reported penetration proportion was not literally zero. The study used discarded IVF material with selection/age limitations. It supports the candidate's distinction between attachment and successful penetration and cautious “help prevent” language, not an absolute guarantee or complete molecular account.

- Cavazza et al. (2021), [Parental genome unification is highly error-prone in mammalian embryos](https://pubmed.ncbi.nlm.nih.gov/33964210/): primary-study abstract read; the indexed article results were also retrieved. Human and bovine observations place parental genomes in separate pronuclei and associate unification with nuclear-envelope breakdown. This directly supports the candidate's level-appropriate correction to the simplified nuclear-fusion drawing. Full article access encountered a browser check, so no full-text methods audit is claimed.

- Hnida, Engenheiro and Ziebe (2004), [Computer-controlled, multilevel, morphometric analysis of blastomere size](https://pubmed.ncbi.nlm.nih.gov/14747169/): primary PubMed indexed abstract/result retrieved; full direct page extraction was unavailable. Reported mean blastomere volume decreased between 2- and 4-cell stages. This is consistent with the candidate's decreasing average-size teaching. It does not establish exact halving in every human embryo; the candidate properly makes its arithmetic a stated illustrative fixed-volume model.

No secondary-source claim was used to overturn the supplied candidate, and no medical advice or outcome guarantee is being offered.

## Optional source reading, assessed separately

The 15-item sufficiency decision does not require completing textbook practice or videos.

- Printed p. 509 Q1–Q3 and p. 511 Q5–Q8 fit the teaching or their supplied source-page context. The local lessons address chromosome number, limited fertilization window, sperm transport, cleavage, morula/blastocyst organization, inner cell mass and implantation.
- Printed p. 509 Q4 assumes a simplified account of earlier sperm helping later ones through the coverings. As an unqualified universal scientific question about the “first sperm,” that source premise needs qualification. The candidate already names it as a simplified textbook account and uses it only to distinguish arrival from successful entry. Do not turn it into a mandatory claim that a fixed number of sperm or group enzyme action is always required.
- The original p. 508 electrical-block statement and p. 510 lining terminology remain visible in preserved optional source pages, but the learner teaching explicitly reconciles them. This is a limitation of using the source pages by themselves, not an undisclosed contradiction in the new teaching.
- hCG and gastrulation questions on/after p. 511 are explicitly deferred to upcoming lessons. Their lack of full treatment in lesson 02 is therefore not a missing prerequisite for its required check.
- External videos were not watched; scientific or accessibility approval of the videos themselves is not included.

## Exact candidate and source identities

All SHA-256 values below were obtained from the files inspected. Candidate HTML/blind text hashes were rechecked after the review and remained unchanged.

Candidate full HTML:
- `learner/lesson-01.html`: 01edd275147bb168dcd393bfbd5874de311f7ee8ac5d95902d7847a6de8a451c
- `learner/lesson-02.html`: 491efc68698e1becd7d4570bf9f8c901362d610b27cd0aad4d6912a2b2b77572

Full manuscript text:
- Lesson 01: 6cb964c963548f5a7db8f5fa2787fa0d73f36e3eeb996710b8e7c3ad612eed92
- Lesson 02: fcf9c2c5698b6cddf26100ee0f189a468670f2354ca869a0c2f58e56ee0b8d4b

Blind text:
- Lesson 01: eba4400994b1ecd7f01e457315476ee27017dbb8e461db70f64374ff920c279e
- Lesson 02: 7a8a54ccb84492570d44a7946126a3c6a4d5e79fc519c5a5de23ddba13b7f2c0

Learner assets:
- `ch15-source-cleavage.png`: 0d3241c8fe08010335a73f3bd147fce1a03c1683580d099391ee6bbffa2caa8a
- `ch15-source-fertilization-detail.jpg`: f03f1942d6df774f0996989c84a92c84513b13cb09928f24f9869ddcc95d4783
- `ch15-cleavage.svg`: a773cfb9bb2441297b32cbf15e900cee5b750e8ada772d937e65636275e75011
- `1fdf0c6c0550cf02.png`: 1fdf0c6c0550cf027b51ad93467580c9dcf542675aa24153640ba4dd9469d9bb
- Exact cleavage preview: de3b6a37152357f4eaafb867e9c25dc7aacd9d85b6a3884c516525ca51376b28

Original sources:
- Teacher PPTX: 38149b6f562425a0b49bed3d0ad4369c5c5eef48f44d9099ea673cc888c2eb84
- Chapter PDF: 30b03cf91e5cf99ed0ae2a7dedf7cae2b246111b795d280b5b95ca937c56aa25
- Original `authoring/course-config.json`: 4d023c61ee9b83dd4ea4488b5a518406b2309b059c7d1c46f272c98e28dc4441
- Original workspace `index.html`: 2770ecce23a9fb2b8253466b712cbfaa982fc7342c476d940f07f40c95a326b4
- Original workspace `main.js` (hash only): d5bd1f23265f2442a277c7c2b75caf8d9953f98be6a3794c7ba1fb3fb321e719

Phase-1 asset and blind HTML hashes are also preserved in `first-attempts.md`. PDF render images, extracted exact PDF text and teacher embedded images in this review directory are inspection intermediates, not replacement learner assets.
