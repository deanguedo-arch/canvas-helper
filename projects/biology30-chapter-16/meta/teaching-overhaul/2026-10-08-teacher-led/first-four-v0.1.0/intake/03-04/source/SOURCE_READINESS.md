# Biology 30 Chapter 16 lessons 03–04: source-only readiness

Status: drafting-ready, with the source distinctions and protected-content boundaries below. This is not learner-review, current-owner integration, runtime, teacher-acceptance, or release approval. No native course source was changed and no candidate teaching was written. The frozen authority is the available Chapter 16 handoff, contentVersion `2026-09-17-completed-handoff`, bankVersion `ch16-complete-v1`; a newer local owner was not inspected.

## Exact source binding and coverage

- Frozen Course production standards v0.4: `Course_Production_Standards_v04_frozen.txt`, SHA256 db8a04bcd7620d9ecf64ec6dc86c046cb3075b9b09cc51dac41936c391379e1e. Applicable source/preflight rules D01–D05/D08, U01–U10/U14–U15 and B01–B05. Later runtime and acceptance gates remain separate.
- Native lesson03 and lesson04 complete raw sections were read and copied byte-for-byte into `native-lesson-03-raw.html` and `native-lesson-04-raw.html`; text copies are also supplied. Full embedded course and textbook configs are frozen, with a complete pair-filtered protected configuration.
- Original teacher PPTX has 79 slides. Slides13–36 were extracted directly from slide XML, notes/relationships preserved in `teacher-slides13-36-direct.json`; actual slide16 and20–36 pixels were inspected using the existing source PDF render. Raw PPTX media for13–36 were extracted. The earlier source-preflight's verified full archive/218-manifest integrity is inherited evidence, not rerun here.
- Direct textbook text read: printed550–561, corresponding chapter-PDF pages3–14. Relevant figure pixels:555 Figure16.6,557 Figure16.8,558 narrative, plus current source crop and native figures. All22 selected optional question crops were inspected, with complete native full-page context retained, including prior-page reference where configured.
- Chapter16 daily-plan DOCX read directly from its XML. Day39: slides1–12 and chromosomes/DNA questions. Day40: slides13–19 and cell-cycle questions. Day41: slides20–36; textbook556 Q15,558–559 Q17–19,561 section16.2 Q1–4,6,7. Day41 spans more than native lesson04; it includes cancer, cytokinesis, growth, cloning, stem cells and aging. Do not silently enlarge lesson04 to all Day41 content.
- D2L quiz `quiz_d2l_59229.xml`: original OBJ_2131200,1205,1206 full prompts/options/keys/stimuli directly inspected and preserved in `pair-original-quiz-items.json`. Both originally attached images were recovered from the existing D2L ZIP and visually read. This is not a whole archival Word-quiz or all285-assessment audit.

### Lesson source windows

Lesson03: teacher16 (replication, one unreplicated/replicated chromosome); teacher24–28, especially26–27 (copy separation and chromosome distribution); textbook552 chromosome-number/ploidy definitions,553–555 S phase/Figure16.6,556 required complete genetic set,557–558 separation/count convention. Current embedded reading links remain552–557; the decisive explicit one-joined-pair=one-chromosome definition is on558 and should be cited in source mapping even though the current link endpoint is557.

Lesson04: teacher21–22 purpose,23 PMAT overview,24–28 stage mechanism,29–31 cytokinesis/plant comparison and microscope examples,32 video recap. Textbook556 introduces purpose and continuity;557 Figure16.8 and prophase;558 spindle/PMAT events and cytokinesis distinction;559 plant comparison. Core stage teaching need not absorb extras33–36. Preserve the two current lesson04 video IDs f-ldPgEfAHI and5bq1To_RKEo, both source slide32; external playback was not tested.

## Protected tasks and controls

`pair-protected-config.json` contains exact prompts, options, keys, hints, explanations, writing models, criteria, limits, figures, sequence, videos and IDs. `native-controls-full.json` preserves41 lesson03 and48 lesson04 controls with attributes and visible text.

- Required check IDs `ch16-check-03` and`ch16-check-04`: two MC selections and two written explanations per lesson. MC IDs end `check-mc-1/2`; writing IDs end `check-writing-1/2`. The prefix is `ch16-l03-` or`ch16-l04-`. Each writing limit is3200 characters. Required progress depends on corrected MC, saved writing and Submit and finish; writing is not automatically graded. Preserve model-reveal/save/edit-to-draft behavior.
- Lesson03 keys: replicated homologous pair=2 chromosomes/4 chromatids; whole undivided2n=8 anaphase cell=16 chromosomes. Writing:2n=12 before/after S; whole-cell versus daughter-cell anaphase count.
- Lesson04 keys: telophase=new nuclei at opposite poles; opposite-pole attachment delivers one replicated copy to each daughter. Writing: trace PMAT; distinguish sister-chromatid separation from intact homologue separation in meiosis I.
- Four guided items retain `ch16-l03-guided-q1/2` and`ch16-l04-guided-q1/2`: keys20,4,Metaphase,Sister chromatids. Both full worked examples and both Stop and think prompts/reveals remain in native raw sections.
- Eight lesson vocabulary words produce32 Frayer fields: Meaning in your own words; Key features or what it does; A specific example; A non-example or common confusion. Each allows240 characters. Course permits up to8 selected words. Four valid fields unlock the model, collection is optional/ungraded, and edits return collected work to draft. Full models in `pair-frayer-fields-and-models.json`.
- Labeling IDs `ch16-chromosome-label` and`ch16-mitosis-label`: four targets each. Chromosome A=one unreplicated chromosome, B/C=sister chromatid, D=centromere region. Mitosis A/B/C/D=prophase/metaphase/anaphase/telophase. These separate labeling tasks are also represented by8 diagram-identification items in Mixed practice. Preserve8 answers and letter associations.
- One ordered sequence `ch16-sequence-04`: prophase condensation/spindle organization → metaphase individual alignment → anaphase sister separation → telophase daughter nuclei.

## Complete practice derivation

Static source tracing of `BiologyRevisionPractice.pool` in revision-practice.js, not execution of the product runtime, produced `runtime-derived-practice-full.json`. It enumerates each exact derived prompt/answer/cue/explanation/alias/options/kind/family/review route and diagram stimulus. Counts are unique question IDs; availability in multiple modes is not double-counted.

- Lesson03:31 unique items =13 flash,8 typed blanks,6 MC,4 diagrams.
- Lesson04:34 unique items =13 flash,8 typed blanks,7 MC,1 order,1 multiple-select,4 diagrams.
- For each of8 concepts, the runtime derives Explain term, reverse definition retrieval, misconception correction, and definition-to-term blank. The concepts are centromere, chromosome number, DNA amount, anaphase, prophase, metaphase, spindle fibre, telophase. There are no excluded families in these8.
- Each lesson also has4 scenario-retrieval blanks and1 authored application MC plus1 scenario-explanation flash variant. Native practice includes3 D2L-derived questions across this pair,8 foundational MC definitions,1 four-step sequence,1 TWO-statements multiple-select, and8 diagram tasks.
- Pool filters select by mode/topic/difficulty, with foundation normalized to recall. Mixed can include every kind; flash only flash, blanks only blank, MC only MC. Selection uses a finite pool and prioritizes concept/kind/family variety, then shuffles options and ordering steps. Repeated practice can reuse items when alternatives run out;65 is not65 transfer scenarios or proof of readiness.
- Flash ratings are self-assessment. Nonflash completion permits correct response or two attempts, with hint after the first miss and answer after the second. First attempts remain separate from corrections. This is a source behavior description, not runtime verification.

## Full optional textbook context

`pair-optional-textbook-full.json` keeps all22 unique items and every crop/page/box/topic/sourceText record. Lesson03 maps9 questions; lesson04 maps16;3 are shared. Every native crop and configured full-page context file is frozen under `native-assets`, with37 total current teaching/labeling/question/context assets hashed.

Lesson03: p551 in-textQ1,Q3; p552 in-textQ5,Q6,Q10; p553 in-textQ11; p556 in-textQ16; p558 in-textQ17,Q18.

Lesson04: p555 in-textQ14; p556 in-textQ15,Q16; p558 in-textQ17,Q18; p555 section16.1Q1,Q2,Q5,Q7; p561 section16.2Q1–7.

Important context: p555 in-textQ14 says 'Briefly describe each phase' and depends onQ13 immediately above, asking for the main phases of the cell cycle. Keep that full-page context; do not reinterpretQ14 as PMAT-only. Q561.2 contains four lettered subparts, all present; Q561.7 contains the entire0/92-chromosome scenario. CropsQ553.11 and right-column561 questions include minor adjacent-question fragments, but the selected prompt is complete; native captions explicitly select the numbered question. Full-page context is initially collapsed by the optional workspace. A blind packet must retain it, not strip all details elements. Optional work is saved/ungraded and does not increase required progress.

## Source contradictions and teaching decisions

1. Count using an explicit convention. Textbook554 calls newly copied joined structures 'two identical chromosomes'; textbook558 explicitly defines the joined sister pair as one chromosome. Use558's counting convention, matching native assessments. In G1 say '12 unreplicated chromosomes, each containing one DNA molecule; no sister-chromatid pairs yet.' If a learner uses '12 chromatids' before S, assess the defined convention rather than silently treating the DNA content as wrong. After S:12 chromosomes,24 sister chromatids/24 DNA molecules. After separation each former chromatid counts as a chromosome. Do not change protected model/criteria casually to resolve terminology.
2. Teacher16 calls sisters 'two arms'. Preserve the biological correction: a complete chromatid may have two chromosome arms; count complete copied units/centromere separation, not visible arms. The native chromosome illustration hasB/C leader endpoints near rod tips: introduce the whole chromatid, not just the endpoint as an isolated arm.
3. Different letter systems: native model/labeling A–D=PMAT; textbook Figure16.8 A=interphase andB–E=PMAT. Interphase precedes mitosis. Never carry the model'sA=prophase key onto the textbook image.
4. The native model correctly shows4 replicated chromosomes before separation,8 whole-cell chromosomes in anaphase,4 at each pole, and4 per re-forming daughter nucleus. It omits spindle detail. The current source Figure16.8 provides actual spindle attachments, disappearing/reappearing nuclear membranes and microscope images. Existing assets suffice; there is no missing-image blocker and no need for new art merely to illustrate the same facts.
5. The model's parental colours and long/short chromosome types are retained in both daughters. Do not teach a division into all-maternal versus all-paternal daughters. Avoid interpreting temporary anaphase whole-cell8 as stable daughter tetraploidy.
6. Teacher23 says cytokinesis can occur only after all four stages; native copy already allows overlap. Figure16.8 telophase panel visually includes furrowing. Keep nuclear division and cytoplasmic division distinct without asserting an absolute non-overlap.
7. Native OBJ_2131200 and1206 are documented inherited adaptations, not verbatim originals. OBJ_2131200 originally classifies a supplied12-chromosome karyotype as somatic; the current question asks chromosome count after S. OBJ_2131206 originally uses a vincristine/tubulin chemotherapy stimulus; the current hypothetical spindle question abstracts that mechanism. Original images exist and match recorded asset hashes; preserve current tasks/IDs during this batch and record provenance, not a missing-image repair. Original OBJ_2131205 prophase prompt/key matches current meaning.
8. Day41 extras35–36 make broad stem-cell/aging claims outside03–04; their presence is not permission to import them into this pair. No fresh external accuracy review of those extras is claimed.

## Image and scope readiness

Three native teaching figures, both labeling figures, all22 question crops, teacher16 and20–36 rendered slides, textbook555/557/558 page pixels, and two original quiz stimuli were inspected. Reading/source coverage is sufficient to draft complete03–04 teaching. No material missing stimulus remains in this bounded scope. Current mobile/desktop placement, saved-state recovery, LMS operation and fresh learner performance are Not verified.

No blind packet was created in this source-only pass. All JSON/config/source files contain answers and are author/reviewer reconciliation material. Any later blind packet must use neutral task IDs, with native ID mapping stored separately, and remove hidden keys/model fields/answer-bearing attributes while retaining all actual prompts, choices, givens, complete optional context and rendered figures. Visible native support is not hidden metadata and its presence should be recorded honestly.

## Review files

Start with `pair-protected-config.json`, `runtime-derived-practice-full.json`, `pair-frayer-fields-and-models.json`, `pair-optional-textbook-full.json`, `native-controls-full.json`, `pair-original-quiz-items.json`, `inherited-assessment-dispositions.json`, `pair-native-asset-hashes.json`, `base-file-hashes.json` and `base-route-hashes.json`. These preserve exact content; this report is the bounded interpretation.
