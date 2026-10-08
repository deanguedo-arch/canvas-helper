# Chapter 12 source-grounded teaching review

Review date: 6 October 2026. Audience: Dean and the authorized course reviewers. This is a review and bounded revision plan, not new lesson copy, an assessment amendment, technical acceptance, or permission to integrate or deploy. Original learner and teacher files were not edited.

## Decision

Keep the current nine-route progression and most of the scientific explanations. Chapter 12 already has substantially better teaching than the original slides alone: it explains transduction, separates optical input from neural output, distinguishes receptor function from conduction, and corrects several source shortcuts. A wholesale rewrite or a Chapter 17 word-count target would discard useful work.

The targeted pass should address four connected weaknesses:

1. Make the difficult mechanisms visible and reasoned, especially accommodation/corrective optics, cochlear place coding, vestibular movement, and receptive fields
2. Give students meaningful changed-condition work with a usable in-place response and save/compare sequence; distinguish supported repetition from independent evidence
3. Reconcile current generated practice with the lesson teaching, especially stale recognition definitions, brittle combined-term answers, weak distractors, and generic feedback
4. Obtain explicit teacher decisions on protected source-assessment conflicts before those sources are reused for grading

There is no verified blanket failure of the current native answer keys. The important science conflicts below are primarily in original source assessments, textbook prose or teacher keys. They must not be silently repaired by changing old questions, IDs, keys or saved attempts.

## 1. Evidence boundary and coverage

All paths below are relative to `biology_transfer_review/CH12/` unless explicitly prefixed `CH17/`. The authoritative current native entry is `native/index.html`, SHA256 `2205c401e8edacf3fb91b71cb7146ae1757d5d1bf06d5ec6e8b24724bcde3062`. The review used its complete route exports and embedded course data, not a historical manuscript. The original deck is `sources/teacher-original.pptx`, SHA256 `4162d8b6bc3ebe94a11b53ed2694932adccf41622a4473e785a46d57cd2184ea`. The textbook is `native/assets/textbook/chapter-12.pdf`, SHA256 `f6f2050fab98f05beb7ca3a589b1d95f1966b6a67ac0b7e1dfe263247205e10d`.

Textbook locator rule: physical PDF page = printed page minus 403. Thus printed 411 = PDF 8, printed 415 = PDF 12, printed 425 = PDF 22. A correct mapping is not evidence of working embedded-reader pixels.

### Reviewed current surfaces

- Complete `lesson-01.html` through `lesson-09.html`, overview and extension, including introductory instructions, all essential teaching, tables, figure guidance, worked examples, guided attempts, stop checks, video summaries, required selections, written prompts, model answers, criteria, and optional saved tasks
- All other route exports: flash cards, blanks, multiple choice, mixed practice, labeling, vocabulary/Frayer work, textbook practice, All My Work, textbook library and video library
- Embedded native data: 9 required checks containing 22 selections and 18 written explanations; 8 worked/guided records with 16 guided selection items; 1 optional whole-set transfer check with 3 selections and 1 written response; 9 saved-note records, including extension; 63 vocabulary entries; 64 practice concepts; 87 base practice-question definitions; 8 authored application items and their flash variants; 14 typed items; 2 multi-select items; 6 sequence items; 4 labeling answer maps; 8 video records
- The generator and feedback behavior in `native/assets/revision-practice.js`, `native/assets/revision-activities.js`, `native/main.js`, and the textbook workspace component. This was a read-only instructional inspection, not runtime or save certification
- The 90-question textbook-practice manifest and its source pages/questions. The workspace deliberately saves ungraded responses without learner-facing answer models. Teacher-only answers were inspected separately, not treated as learner feedback

`complete-native-routes/NATIVE_INVENTORY.json` reports zero `questionCount` for the routes. That is an extraction limitation, not an absence of questions. The counts above come from actual native data and complete route text.

### Source and pixel review

- Read the Chapter 12 README and preservation contract; the Chapter 17 benchmark README, acceptance ledger and owner receipt; all four full supplied historical process/standard documents; the teacher-led sequence HANDOFF/INTEGRATION_HANDOFF files; and `CH17/process/history/sample-integration-v0.1.1/DEAN_ACTIVITY_DIAGNOSIS.md`
- Inspected actual accepted-subset Chapter 17 lesson 6–7 teaching to compare causal explanation, visual reading, model boundaries and varied reasoning. The transfer standard is the demonstrated process, not genetics content, a paragraph template, or a length quota
- Read all 29 original slide texts with original PPTX media relationships; inspected rendered pixels for all 29 slides and all 30 textbook pages, with separate inspection of the 12 native teaching figures and 4 active labeling diagrams
- Inspected the 17 original D2L quiz image files, all 24 XML question records and keyed responses; read the Word quiz and key, source course directions, section answer PDFs and chapter/comprehension answer material
- Sampled eight distributed frames from each of the two original animated GIFs: slide 8 `ppt/media/image12.gif` (75 frames), slide 26 `ppt/media/image20.gif` (81 frames). This establishes their visual subject and changes, not frame-by-frame animation acceptance

Limits: the deck render used LibreOffice; some slide text layout differed or crowded, so XML text and original relationships were used alongside pixels. No PowerPoint animation/font fidelity, live course rendering, mobile/keyboard flow, vocabulary dialog pixels, save/reload/history, old imports, printing, media playback, target LMS behavior, copyright clearance, or current Alberta curriculum certification is claimed. Eight linked videos have verified package IDs and source-slide relationships, but their full footage, captions, current availability and target-LMS playback were not verified here. Historical reports remain historical. No source problem is marked unresolved merely because an old report listed it.

### Benchmark status

Primary benchmark candidate SHA256: `1ac7a2f934cdd2a5373f75d567abe01f7a512fc52e1c766320b46c58afc5e46a`. Dean's current method approval is separate from exact-copy acceptance. In the located package records, only Chapter 17 lessons 6–7 have explicit exact-copy acceptance; other statuses remain as recorded. None establishes canonical integration, deployment or release.

Dean's activity diagnosis matters here: prose, a hint and a model disclosure do not constitute a usable new activity when the stimulus or response surface is absent. New work must not be pushed onto paper or left unsaved by default. Any proposal for new fields uses a later explicitly authorized, additive native save/compare contract, distinct IDs and unchanged required progress. This review adds no controls.

## 2. Chapter progression and continuity

Central question: how does an environmental or internal change become usable neural information, and what changes when a particular stage is impaired?

The existing order is defensible even though the teacher deck introduces taste/smell before vision: establish reception/transduction, follow light to receptors, explain focusing, examine retinal signaling, compare mechanical reception in the ear, encode sound differences, apply hair-cell principles to equilibrium, integrate the remaining senses, then synthesize. Retain the routes and topic order.

| Boundary | Knowledge needed | Current state and targeted action |
|---|---|---|
| Chapter 11 → 12.1 | Sensory neuron/CNS, electrical signaling, all-or-none action potential, receptor versus effector | The opening supplies a brief reminder. Retain it. For firing-frequency/recruitment reasoning, add an explicit short explanation of what changes and what stays constant rather than assuming students remember the entire previous chapter |
| 12.1 → 12.2 | Detection differs from support/conduction and interpretation | Strong carry-forward principle. End 12.1 by making the next optical question explicit, rather than relying only on the Next link |
| 12.2 → 12.3 | Refraction, retina location, iris/pupil versus lens | Present. Explain why nearer rays need different convergence and how a contracting ring reduces ligament pull |
| 12.3 → 12.4 | Focus is necessary but not sufficient | Strong existing distinction. Reuse it to introduce conversion at photoreceptors without reworking every anatomical label |
| 12.4 → 12.5 | Receptor signaling differs from action potentials in output neurons | Present and useful. Contrast light-triggered receptor changes with mechanical hair-cell changes, without teaching that all sensory receptors behave identically |
| 12.5 → 12.6 | Cochlea, basilar membrane, hair cells, auditory output | Present. Base/apex coding needs a usable spatial representation. The late detailed chamber legend should be encountered before detailed labeling |
| 12.6 → 12.7 | Inner-ear hair cells are mechanoreceptors | Present. Distinguish a hearing structure from adjacent vestibular structures and relate rotation, tilt and linear acceleration to actual motion in the figure |
| 12.7 → 12.8 | Several sensory signals can be combined; mechanoreception | Present. Add a clear transition from position information to chemical and skin information, and teach receptive-field interpretation before the investigation demand |
| 12.8 → 12.9 | Variables, evidence versus prediction, causal pathway comparison | Investigation terminology is introduced. A second body-region example largely repeats the first. Supply a genuinely changed inferential demand if fresh transfer is desired |
| Review → extension | Conversion versus bypass; remaining pathway must function | Good conceptual bridge. Extension needs a fully identifiable second device and a complete self-comparison model if revised; keep optional status and existing saved task immutable pending scope |

First-use/coverage decisions needing attention: optic-chiasm crossing occurs in old recognition-bank text but not the main lesson; proprioceptor retrieval can be tagged to lesson 1 although the main teaching is lesson 7; scala names/endolymph/perilymph are added after lesson 5 navigation and in collapsed labeling help; advanced original textbook questions involve macular degeneration, phantom limbs, afterimages, neurotoxins and historical medical claims beyond the native core. These are source-supported extensions or teaching gaps to classify, not permission to add university-level detail everywhere.

## 3. Per-lesson review and bounded plan

### Lesson 01 — Sensory receptors, sensation and adaptation

Evidence: `complete-native-routes/lesson-01.html`; figure `reception`; PPT slides 3–6 (media image6, image26, image1, image5); textbook printed 406–409 / PDF 3–6, especially Table 12.1 and Fig. 12.4.

Keep: coffee-shop stimulus opening; reception/sensation/perception separation; conversion of stimulus energy; four receptor classes; internal sensing and nociceptor qualification; explanation that stronger input does not simply make a taller action potential; separate mention of attention; complete everyday worked example and saved writing.

Change: connect the classification table to the pathway rather than repeating the four definitions. Explain briefly how a maintained stimulus can yield declining response and why reduced awareness alone does not establish the exact mechanism. The current lesson distinguishes adaptation from attention more carefully than several current practice definitions do. Reconcile the bank to that distinction through a reviewed version, preserving old attempts.

Visual: `reception` is a useful overview but skips an explicit sensation stage. Explain where conscious awareness fits before interpretation; no new ornate diagram is needed. The source optical illusions on p.408 can support perception only if a specific visible illusion is introduced and interpreted, not merely named.

Practice/feedback: guided sunlight-warmth case usefully changes sensory modality. Required writing 1 asks for a new example and can reveal understanding. Required writing 2 closely repeats the coffee stop-check and main explanation; retain as consolidation. A future independent demand could distinguish what is observed from what can be inferred when response changes after a stimulus change. It needs provided evidence, a saved response and feedback addressing alternate explanations. Do not turn current supported work into a new mastery claim.

Prerequisite: define firing rate in ordinary language if retaining it as an explanatory mechanism; internal receptor examples needed by optional p.409 Q6 should be supplied or explicitly linked as supported extension.

### Lesson 02 — Eye structures and the path of light

Evidence: `lesson-02.html`; `eye-source`; PPT 12–14, 21 (image2, image3, image23); textbook 410–412 / PDF 7–9, Fig.12.7, Table12.2, Fig.12.8.

Keep: light route with both humours; pupil as opening; cornea versus lens; three-layer table; separate problems of entry, focusing, detection and output; fovea versus optic disc; photoreceptor-damage worked example.

Change: use the figure in two passes: first front-to-back optical route, then nested coats/output point. Explain the connections between transparency, light transmission, pigment/stray light and retinal detection. This needs a little more causal guidance, not a longer list of names. Close with why changing distance creates the next problem.

Visual: preserve actual textbook eye crop and active corrected labeling image. The current corrected worksheet visibly places C on iris and K at the optic-nerve exit; the historical complaints about their old targets are not current failures. Keep letter mappings locked.

Practice/feedback: guided block titled “Complete the light route” actually asks iris and retina identification while supplying the entire route; it does not require ordering. Use an existing ordering family as supported practice or later add a separate saved explanation. A changed-condition case contrasting transparent optics with output-pathway failure is useful, but note that `ch12-mc-006` already asks optic-nerve damage; do not reuse it as unseen independent evidence. Required MC1 deliberately omits humours, and its feedback says so; the full written demand does include both. That is not a wrong key.

Prerequisite: accommodation is introduced here but its mechanism belongs in lesson 3. Keep that boundary clear.

### Lesson 03 — Focusing, accommodation and vision problems

Evidence: `lesson-03.html`; `focus-source`, `focus-model`; PPT 13,15,17,21 (image3, image11, image10, image23); textbook 412–414 / PDF 9–11, Figs12.9–12.12.

Keep: four-link muscle → tension → lens → refraction chain; near/far comparison; iris distinction; myopia versus hyperopia; limits of a simplified optical model; presbyopia versus damaged photoreceptors; nonliteral treatment of the inverted image.

Change: answer two missing “why” questions: why nearer objects require more convergence, and why contraction of a ring relaxes its pull on the lens. The table currently states the correct relationships but the ring geometry is not made explicit. Use a worked focal-position diagnosis that explains the effect of a corrective lens, not just its name.

Visual: the source accommodation figure is helpful but does not show ligament tension explicitly. Guide the learner from muscle position to tension and lens curvature, with a reviewed annotation if necessary. `focus-model` shows uncorrected myopic/hyperopic focal positions and names the correction, but does not actually show the corrective lens/ray change. The before/after source Fig.12.12 (p.413) is a stronger starting point for demonstrating that reasoning. Keep its exaggerated/non-scale character explicit.

Practice/feedback: the reverse far-view guided attempt is a meaningful first contrast. The book/clock worked example and required tree/book MC1 have the same near-focus demand; written 1 also repeats it. Preserve them as supported consolidation. Add only separately approved fresh reasoning, such as interpreting a stated failed step or choosing and justifying a correction from an unlabeled focal diagram, with complete source-supported feedback. Required written 2 is fair in scope but under-modelled as a reasoning task.

Prerequisite: current main teaching mentions glaucoma only briefly; optional questions require drainage/pressure reasoning and macular degeneration/treatment comparisons. Provide bounded optional support or classify these as further reading, not silently required core.

### Lesson 04 — The retina, rods and cones

Evidence: `lesson-04.html`; `retina`, `retina-source`; PPT 16–20 (image28,image10,image25,image4,image15); textbook 414–418 / PDF 11–15, Figs12.13–12.18.

Keep: dim-light versus color/detail conditions; foveal concentration without claiming cones occur only there; opposing light and information directions; opsin plus retinal; hyperpolarization/reduced release; ganglion-cell action potentials; qualified color-vision deficiency; binocular comparison. This is materially better than several source shortcuts.

Change: work one genuinely explanatory rods/cones example, showing how lighting and retinal location jointly affect the prediction. The current worked and guided blocks rehearse the retinal route, leaving the rods/cones comparison mostly as a table. Add a clear bridge from decreased photoreceptor transmitter release to changed downstream activity without claiming all bipolar pathways respond identically. Existing simplified wording can remain; a full molecular cascade is unnecessary.

Visual: retain both retinal figures and teach their orientation explicitly. The lettered retinal worksheet is a simplified pathway with no optic-chiasm crossing; its existing caveat is appropriate. A source field/pathway figure may be used for crossing only if that demand is retained and taught. Do not grade crossing from the simplified worksheet.

Practice/feedback: required route MC/writing repeat the worked/guided route; count as consolidation. `ch12-authored-application-04` already offers dim-light versus colored-print transfer and can be better placed contextually. Source visual-pathway recognition text includes optic chiasm/tract that the main lesson omits. Decide whether to teach the small additional relationship or narrow the future item, rather than leaving a popup as the only instruction. The protected original sequence falsely gives action potentials to rods/cones; see issue S1.

Prerequisite: hyperpolarization is defined in the main text, so this is not an unexplained vocabulary failure. Source afterimage and optic-field tasks require additional models beyond this core.

### Lesson 05 — Ear structures and sound transmission

Evidence: `lesson-05.html`; `ear-source`, `corti-source`; PPT22–25,28 (image14,image27,image33,image16–18,image30,image22); textbook419–421 / PDF16–18, Figs12.20–12.22.

Keep: mechanical wave opening; mechanical versus neural stages; ossicle names/order; oval versus round window; pressure-equalization function; hair-cell projections/transmitter changes; worked middle-ear-fluid failure.

Change: “transmit and concentrate” is scientifically safer than exaggerated amplitude statements in the teacher source, but students still need the reason the middle-ear system transfers air-driven vibration effectively into fluid. Explain the relevant lever/area relationship at the course level if this source demand is retained. Make basilar-membrane motion relative to tectorial structures explicit in the figure rather than leaving it as a single dense sentence. Explain why fluid displacement needs a movable round window.

Visual: retain textbook ear and organ-of-Corti crops. Current corrected worksheet S is visibly at the basal round window; do not report its historical inset-wall error as current. The detailed chamber legend is after the Previous/Next navigation in the route and inside collapsed labeling help. It includes terms actually tested in the 19-label set. Provide an approved visible teaching home before that demand; changing a protected suffix or activity needs separate scope.

Practice/feedback: guided items correctly separate conduction from transduction. Required writing traces the mechanism but chiefly rehearses the supplied sequence. Add a saved changed-failure comparison if requested: the learner must distinguish intact receptors receiving too little mechanical input from adequate motion reaching damaged receptors. A model must explain what the evidence cannot establish. Do not reuse the existing stapes-failure authored item as a fresh independent check after revealing it.

Prerequisite: three scala names, endolymph and perilymph exceed the main narrative; keep them supported/optional unless Dean explicitly retains them as expected label knowledge.

### Lesson 06 — Pitch, loudness and hearing impairment

Evidence: `lesson-06.html`; `sound-model`; PPT25,29; textbook421–424 / PDF18–21, Fig12.23 and Investigation12.B.

Keep: frequency versus amplitude; fixed interval/scale warning; pitch versus loudness; action-potential height correction; conductive versus sensorineural distinction; amplification qualification; implant bypass/remaining-pathway limit; prohibition on self-administered loudness tests.

Change: show where base and apex are along the basilar membrane and connect place to which pathway is active. At present the location is stated, then the stop-check and required MC ask it back. Explain how amplifying sound differs from bypassing receptor conversion in one worked comparison before required written 2. Preserve the important qualification that amplification may help some cases of sensory loss.

Visual: `sound-model` usefully contrasts cycle spacing and excursion. Add explicit axes/quantity labels or adjacent reading directions tied to identical time/scale; it is illustrative, not measured data. A source-grounded uncoiled/located cochlear representation is needed if students must use base/apex mechanistically; the current figure is only a wave comparison.

Practice/feedback: 4 versus 8 cycles in the same interval is a meaningful supported comparison. Equal amplitude does not guarantee equal perceived loudness at different frequencies; current wording says “in this simplified comparison,” which should remain an explicit model assumption rather than a physiological rule. Required MC1 repeats the worked louder-same-frequency example. Feedback “the high-frequency end is closest to the oval window” restates the answer without helping locate it. A later fresh case should require inference from a provided frequency/location or damaged-region representation.

Prerequisite: if Hz calculations are introduced, explicitly model cycles divided by time with units; the current guided comparison does not require calculating Hz and should not be failed for omitting an unnecessary calculation.

### Lesson 07 — Balance, body position and proprioception

Evidence: `lesson-07.html`; `balance`; PPT26–27 (image34,image31,image20,image19); textbook424–425 / PDF21–22, Fig12.24.

Keep: fluid lag at onset; continued relative motion after stopping; cupula versus weighted otolithic membrane; gravity/linear acceleration; horizontal versus vertical emphasis; vision and proprioception; no spinning or blindfolded balance tests.

Change: distinguish changing rotation from a maintained position using visibly different states, then work how apparently conflicting sources of position information could arise. Current required writing 2 asks sensory disagreement while teaching only gives the general integration principle; add a fully described evidence case before requiring an explanation.

Visual: `balance` is a useful two-mechanism overview but shows largely static structures. The original p.425 figure offers before/after deflection states that can be read carefully, while its adjacent p.424 wording contains the cupula/otolith error. Use the actual correct visual relationships without importing that prose. Keep the active vestibular worksheet H mapped to stereocilia, not the hair-cell body; the current pixels and key agree.

Practice/feedback: the elevator worked example and required lift MC2 are essentially the same condition; preserve as supported consolidation. The forward-acceleration guided contrast is worthwhile. Stop-versus-start rotation is already explicitly explained and later used in transfer MC3; it is not wholly unseen reasoning. A future fresh response can compare a held tilt, changing rotation and an explicitly described acceleration, with an actual movement stimulus and in-place saved explanation.

Prerequisite: “linear acceleration” should be tied to changing straight-line velocity, avoiding the implication that any steady travel is acceleration. The opening asks about “travelling in a lift”; the worked case correctly specifies starting upward.

### Lesson 08 — Taste, smell, touch and temperature

Evidence: `lesson-08.html`; `taste-source`, `smell-source`; PPT7–11 (image13,image24,image21,image12,image32,image9,image7,image8); textbook425–429 / PDF22–26, Figs12.25–12.27.

Keep: dissolved food chemicals; five tastes and no exclusive tongue zones; odor molecules in mucus; flavor integration; combinatorial qualification to lock-and-key; receptor density plus receptive fields/processing; variable/control/repetition terminology; explicit plan-only safety.

Change: guide the nested taste image from papilla to bud to receptor cell and clarify communication to sensory neurons; do not make “taste bud” a single neuron. Similarly trace olfactory epithelium to bulb using the figure's locations. Show why two contacts in a large field can be harder to distinguish than two in separate small fields. The current explanation states the conclusion without a spatial model.

Visual: preserve the actual source taste/olfactory crops; the tongue crop retains a partial source caption along its bottom edge, so review crop boundaries if revising, without deleting relevant labels. A simple reviewed receptive-field stimulus is more useful than another decorative skin picture. The source skin anatomy may support receptor diversity, but students should not be asked to memorize every named corpuscle because a diagram includes it; the teacher slide explicitly says otherwise.

Practice/feedback: the fingertip/forearm worked plan is reasonably complete. Palm/forearm guided practice changes the names but largely preserves the same variable logic. Required written 2 asks for substantially the same plan; retain as supported application, not fresh design evidence. The model's “measure correct discrimination” is less precise than the taught minimum separation in millimetres. Record a proposed marking-model clarification for teacher approval; do not silently change its protected model. A fresh independent demand could evaluate supplied conflicting results or repair one stated design flaw with justification, using an in-place saved response.

Prerequisite: original quiz taste-pathway writing expects brainstem/thalamic stages absent from the native core; decide scope before using it as an assessment of these lessons. Source neurotoxin questions require Chapter 11 synapse knowledge and historical-claim review; they are not fully prepared by the touch lesson alone.

### Lesson 09 — Chapter review and final check

Evidence: `lesson-09.html`; textbook431–433 / PDF28–30; embedded `ch12-transfer-01` and `ch12-check-09`; original quiz XML and Word quiz.

Keep: common stimulus/receptor/transduction/pathway/interpretation scaffold; comparison table; distinction between observed difficulty and the affected mechanism; explicit limitations of completion and ungraded writing; separate first-submission transfer reporting.

Change: the “Build a full explanation” worked example lists a method but provides no actual damaged structure or completed reasoned case. Demonstrate one full comparison using supplied evidence, then return to the common pathway. Do not reveal a protected final-check answer and call it fresh transfer.

Practice/feedback: transfer MC1 changes receptor failure to output failure, but optic-nerve damage already appears in `ch12-mc-006`; transfer MC2 repeats lesson8's pressure/body-region confound and final-check MC6; transfer MC3 repeats lesson7's stopping explanation. The transfer writing combines brightness and distance usefully but relies on already rehearsed chains. This set can be independent in submission conditions while remaining near-transfer in demand. The help declaration, whole-set feedback, and distinction of first submission from later practice are worthwhile and must remain. Do not claim secure closed-book conditions or automatic accuracy of writing.

A future transfer revision requires distinct IDs/versioned historical compatibility and separately approved content, not replacement of this set under the same IDs. Use a changed representation, evidence constraint or failure combination, not just different nouns.

### Optional extension — Sensory limits, technology and evidence

Evidence: `extension.html`; textbook409 Fig12.5, 419 opening animal-sense examples, 424 technology discussion, 433 Q23/Q31; prior hearing/vision lessons.

Keep: infrared detector → visible display → human retinal detection; distinction between bypass and repair; functioning remaining pathway; no automatic claim of a complete sensory experience; optional saved response.

Change only if separately authorized: identify the second device concretely enough that students can trace a specific pathway, and provide a complete model response beside the existing criteria after the learner's saved attempt. A criteria-only list supports self-check but gives less recovery help than a reasoned model. No new claim about efficacy or diagnosis is needed. Preserve the entire current saved-task block until a replacement boundary is approved.

## 4. Whole-practice and feedback findings

### Keep existing interaction strengths

Required checks, optional supported practice, vocabulary work, textbook work and whole-set transfer are explicitly distinguished. Writing is consistently described as saved for review rather than reliably auto-graded. Existing native contracts preserve first attempts separately from corrections. The source inspection found actual in-place controls for the current guided activities, required writing and saved optional tasks; this is not the earlier Chapter17 no-response-control failure. Runtime success still needs later tests.

### Prioritize these specific repairs

1. **Feedback quality:** all 64 practice concepts have `correctExplanation` exactly equal to `meaning`. The misconception flash variant often answers with the definition rather than correcting the particular claim. Example: `ch12-cornea-misconception` challenges “cornea changes shape during accommodation,” but its model merely defines corneal refraction. Explain that lens shape changes, how that solves the problem, and why the proposed alternative fails. Sequence feedback currently joins the ordered steps with arrows; it rarely explains why each link follows. Labeling feedback in `native/main.js` is “Correct,” a generic revisit cue, then the answer label; add location/function-specific recovery support if this surface is authorized for revision.
2. **Plausible distractors:** many required and authored items contain clearly unrelated choices such as an eye becoming a photoreceptor, the optic nerve carrying sound, or pituitary structures in balance questions. They support initial recognition but provide weak evidence of mechanism. Preserve existing immutable items; any new formative item should contrast plausible neighboring structures, causal directions or changed conditions.
3. **Definition-family ambiguity:** combined terms remain blank/reverse-retrieval targets with no alternate phrasings, including `ch12-iris-pupil`, `ch12-frequency-pitch`, `ch12-amplitude-loudness`, `ch12-ampulla-cupula`, and `ch12-utricle-saccule`. `ch12-near-focus`/`far-focus` can also invite a biologically valid “accommodation” answer under the generic “Name the term described” instruction. Conversely `ch12-pinna-canal` accepts either single structure as an alias for the combined answer. Review each item's demanded granularity and aliases; string equality is not a scientific judgement. The three meta-skills already excluded from blank/reverse families should remain excluded.
4. **Current bank consistency:** `ch12-mc-002` explains adaptation solely as CNS attention reduction, and `ch12-sensory-adaptation-recognize`/concept meaning still frame reduced awareness broadly. The lesson and vocabulary are more careful. `ch12-visual-pathway-recognize` retains partial chiasm crossing, while the revised concept meaning and main lesson give a simpler retina–nerve–thalamus–cortex route. These are current embedded records, not merely historical bank concerns.
5. **Placement and help:** use the finite current families to place useful retrieval near the relevant teaching, but avoid counting a reshuffled or alternate-format question as a new biological problem. The generator favors diversity, yet families sharing a concept can remain the same task. Preserve transparent repeat labeling and historical attempt storage.
6. **Vocabulary models:** the 63 vocabulary records generally have meaningful “what it does” and distinction text. Keep the corrected rod/cone, optic nerve, cupula and rhodopsin definitions. The vocabulary instructions still promise an “example” while the popup renderer prioritizes `whatItDoes`; align learner directions with actual presentation in a later permitted correction. Do not collapse essential teaching into vocabulary dialogs.

Static generator inspection suggests 374 candidate variants across all modes before filtering: 197 flash variants, 75 blanks, 92 MC, 6 ordering, 2 diagram and 2 multi-select. This is a count of renderable variants, not 374 independent concepts or mastery tests, and it was not a runtime acceptance run.

### Textbook practice is a supported source workspace, not a complete feedback system

All 90 selected questions retain source context and an in-place writing field. Keep those questions and saved records intact. No automated correctness or model feedback is offered, and that limitation is honestly stated. If Dean wants self-directed recovery, propose a separate reviewed model/criteria layer for approved questions, with no teacher-key dump and no new marking semantics.

Concrete source-demand/routing issues:

- `ch12-p409-in-text-q6` asks for internal receptor types/functions; main lessons name internal sensing only generally. The textbook table supplies the extra scope
- `ch12-p416-in-text-q15` and chapter-review Q11 rely on the source's problematic retinal account; give a teacher-approved interpretation before using those keys
- `ch12-p417-12-a-diagram-analysis-q3` asks where rods/cones are; it is mapped to lessons2/3, while detailed receptor teaching is lesson4
- `ch12-p429-section-12-3-q4` is middle-ear pressure/Eustachian-tube reasoning but maps only to lesson7; lesson5 is its principal home
- `ch12-p432-chapter-review-q17` concerns temporal-lobe injury but maps to lesson8; hearing lessons5/6 are the relevant starting point
- `ch12-p433-chapter-review-q24` concerns aging lens/accommodation but maps to lesson4; lesson3 is the direct home
- `ch12-p433-chapter-review-q26` tells the learner to stare at colored birds and report afterimages. The workspace says not to perform physical procedures or invent observations. This retained prompt needs explicit classification or supplied observation/evidence for a paper-analysis interpretation. The generic “procedures excluded” manifest statement is not sufficient to resolve the conflict
- Printed433 Q22 asks about “red-blue” colour blindness, but the teacher review answer discusses red-green. Preserve both originals and ask which interpretation to use
- Printed430 neurotoxin/migraine material and printed433 Q29 neonatal apnea are historical source claims, not current medical guidance. They should not be promoted into a fresh model answer without targeted verification

Do not remove all challenging optional questions because they go beyond the core. Identify their extra reading, prerequisite and teacher-review needs, preserve optional progress, and prevent them from masquerading as wholly taught independent tasks.

## 5. Source science and assessment conflict register

The following items identify exact source evidence and the action boundary. “Current teaching already improved” means preserve that improvement; it does not retroactively authorize edits to source assessments.

| ID | Exact source and conflict | Current treatment and review action |
|---|---|---|
| S1 | Word quiz numerical response1, steps1/4; D2L `OBJ_2131004` / `QUES_51798_85531`, image `PastedImage_rzvssboae8z01u2fgsyefqks4ancrm58002.png`, key614523: rods/cones allegedly transduce into an action potential transferred to ganglion axons | Current lesson4 correctly explains graded receptor change and ganglion action potentials. Protected source item needs teacher decision before grading/reuse. Changing sequence digits alone would not repair its science |
| S2 | Word quiz MC6 / D2L `OBJ_2130995` / `QUES_51771_85515`, eye image `PastedImage_nwpuhvp1lb15ra0cwnkun1fcu1ruteob002.png`: asks which structure focuses light; I marks cornea, H lens; only H is keyed | Both contribute to focusing. Treat as a verified wording/answer-uniqueness concern, not grounds to teach that cornea does not refract. Teacher may choose future narrower wording; originals stay immutable |
| S3 | Word quiz key written2(f): no amplification can help if hair-cell receptors are damaged | Current lesson6 appropriately allows benefit in some cases. NIDCD explains surviving hair cells may detect amplified vibrations, with limits. Review the absolute protected model before reuse |
| S4 | Textbook415 / PDF12, comprehension keyQ15, chapter-review keyQ11: universal “inhibitory neurotransmitter”/stopped release account; rod pigment described as splitting | Current lesson4's reduced release and pathway qualification are preferable. Do not copy the old model into feedback or reverse the correction |
| S5 | PPT19 calls rhodopsin “a form of vitamin A” | Textbook415 and current lesson4 correctly identify opsin plus retinal, a vitamin-A derivative. Preserve current explanation |
| S6 | PPT17 describes brain flipping the message; PPT20 claims newborns see upside down | Current lesson3 explicitly rejects literal picture turning and omits the newborn claim. Do not restore either as an engaging fact; the newborn claim is unsupported by the supplied evidence |
| S7 | PPT18 implies all red-green deficiency is missing cones and seeing colors as brown | Current lesson4 says particular cone responses can be missing or altered and does not equate deficiency with absence of all color. Preserve qualification; NEI describes multiple forms/causes |
| S8 | Textbook424 / PDF21, source Word MC17 stimulus, Section12.3 reviewQ3, comprehensionQ24 and reviewQ13/Q15: otoliths “lie in a cupula” | Fig12.24 p425 labels an otolithic membrane; current lesson7 keeps it distinct from a canal cupula. NIDCD corroborates the two mechanisms. This internal source conflict must remain visible to teacher review |
| S9 | Comprehension keyQ25, teacher printed5-62: crystals stop rolling and vestibule sends no impulses in a held position | Conflicts with the current sustained-head-position account. Do not use absence of all signaling as the model for static posture. Preserve original; seek a reviewed answer if assigned |
| S10 | PPT26 associates canals with head tilting without distinguishing changing rotation from held tilt; PPT27 says canals fail to flex | Current lesson7's fluid/cupula and weighted-membrane mechanisms are better. NIDCD describes cupula flexing, not bony canals bending. Preserve current distinction |
| S11 | Section12.3 teacher Biology Background, printed5-58: impulses initiated in the tectorial membrane; comprehension explanation Fig12.20 calls ossicles inner-ear structures | Current lesson5 places ossicles in middle ear and neural conversion at hair cells. Do not import these teacher-key errors into feedback |
| S12 | D2L `OBJ_2131011` / `QUES_76450_77898`: sound “first analyzed by the brain” in temporal lobe | Intended cortex answer differs from the wording “first”; source textbook424 includes brainstem/thalamus before temporal cortex. Flag wording scope before reuse, not an automatic rekey |
| S13 | Word quiz MC14 assigns broad agnosia description to occipital lobe alone | Clinical localization is underspecified by the description. Avoid using this as a precise localization demand without specialist source/teacher review |
| S14 | D2L `OBJ_2131013` / `QUES_76452_85538`, stem image `PastedImage_7ccbcsl9isqhpdg2k04q6o221s6w5407002.png`, key3256: “basilar membrane cells” paired with neural deafness; “permanent vertigo” broadly attributed to trauma | The intended hearing receptor appears to be cochlear hair cells, not arbitrary membrane cells. Treat as imprecise source terminology and hypothetical treatment scope, not evidence of proven stem-cell therapy |
| S15 | Teacher chapter-review keyQ9, printed5-67: cone cells “dominate human eyes”; source textbook414 gives many more rods than cones | Keep distinction between foveal specialization and overall number. Current lesson4 does not make the false numerical generalization |
| S16 | Textbook433 Q22 “red-blue” versus review modelQ22 red-green; final teacher answer numbered34 corresponds to source Q33 | Preserve originals and document intended matching before assigning/revealing models. These are source correspondence errors, not native runtime corruption |

Authority checks used only to adjudicate bounded conflicts:

- [NIDCD: Hearing Aids](https://www.nidcd.nih.gov/health/hearing-aids), especially “How can hearing aids help?”: amplification can work through surviving hair cells in sensorineural loss; severe damage can limit benefit
- [NIDCD: Cochlear Implants](https://www.nidcd.nih.gov/health/cochlear-implants): receptor bypass, auditory-nerve stimulation, limits of restored hearing
- [NIDCD: Balance Disorders](https://www.nidcd.nih.gov/health/balance-disorders), “How does my body keep its balance?”: canal cupula versus utricle/saccule gel with otoconia
- [Purves et al., Neuroscience: Phototransduction](https://www.ncbi.nlm.nih.gov/books/NBK10806/): graded photoreceptor potentials, hyperpolarization and reduced transmitter release
- [National Eye Institute: Color Blindness](https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness): color-vision deficiency varies and does not mean a single universal loss of all color

These checks do not certify every historical clinical or numerical claim in the textbook. No health advice, treatment recommendation or new assessment science was authored.

## 6. Asset and media plan

All 12 native teaching images exist and were inspected as pixels. There is no missing-image-placeholder finding from this read-only review.

| Existing figure | Status and bounded next use |
|---|---|
| `reception` | Keep overview; explicitly place awareness versus interpretation in learner guidance |
| `eye-source` | Keep source relationships; guide front/back and nested-layer reading |
| `focus-source` | Keep; explain ciliary ring/tension and qualify exaggerated lens effect |
| `focus-model` | Extend only after approval with actual corrected-ray comparison; current labels name a lens but do not show its effect |
| `retina` and `retina-source` | Keep opposing directions and schematic caveat; contrast with actual layer micrograph |
| `ear-source` and `corti-source` | Keep; make relative motion and pressure transfer observable; place detailed chamber guidance before its use |
| `sound-model` | Keep qualitative wave contrast; explicit axes/scale guidance and separate cochlear-location representation |
| `balance` | Keep comparison; add/use actual start/stop/tilt deflection states with clear gravity/motion arrows if revised |
| `taste-source` and `smell-source` | Keep nested anatomical structures; teach the magnification and signal route, review taste crop edge |

The four active labeling images and their answer maps were inspected. The current eye C/K and ear S targets are corrected; retinal B/E and vestibular H agree with the selected answers. Preserve their identities, letter mappings and source bytes. Visual inspection is not independent teacher acceptance or evidence that enlargement/keyboard access works in the course.

Provenance detail found in the final audit: `C.labelDiagrams` points to the corrected eye and ear files but retains the original image SHA256 values. The corrected eye actually hashes to `c72a417301e33ca553bf15081fd1c813a8c5118b8698c84a0f4d32540675c63f`; the corrected ear to `52e404a1b118969fd2fd01d78cff15468816f23cedf664e448605f499cb7670d`. The package checksum manifest correctly matches both current files. This is stale embedded asset metadata, not a failed package copy or recurrence of the old visual error. Rebind metadata in any later authorized preparation; do not select an older original merely because its hash matches the stale field.

The eight native YouTube IDs match source links: vision `o0DYP-u1rNM` (slide12), eye recap `MJxxFwVu1OM` (21), rods `nnCrnWOiKG4` (19), hearing `Ie2j7GpC4JU` (22), pathway `T8lKKlnnC6M`, pitch `LkGOGzpbrCk`, hearing-loss support `98-6WfdumZY` (all25), balance `ryGMI3SpxCE` (26). Current captions supply a purpose and written fallback. Actual title/footage fit, caption quality, timestamps, playback and LMS embedding remain unverified. Do not describe a title/thumbnail/source link as a verified instructional video. The source slide29 external hearing-device article is historical and not a verified current technology source.

## 7. Bounded next pass, decisions and acceptance evidence

### Decisions before authoring

1. Accept or revise the targeted plan while retaining the nine-route progression and current core explanations
2. Decide how the source conflicts will be handled when original assessments or textbook keys are assigned; preserve originals and existing native attempts
3. Decide whether new practice is requested, which tasks need new additive in-place response controls, and which established native save/compare behavior should be used. No paper-only or unsaved requirement should be imposed by default
4. Classify advanced source questions and detailed labels as supported optional work or additional required scope, using the verified curriculum authority when supplied. The packet contains teacher scope summaries and historical textbook outcome references, not a freshly verified complete Alberta authority/version record

### Proposed connected batches, only after authorization

- **Batch A: lessons1–3.** Resolve adaptation terminology across current surfaces; strengthen optical geometry and corrected-ray reasoning; distinguish supported repetition from a fresh application; keep protected checks and saved tasks exact
- **Batch B: lessons4–6.** Preserve corrected retinal science; resolve pathway/practice scope; strengthen ear mechanics, detailed-figure prerequisite placement, place coding and technology reasoning; reconcile feedback families
- **Batch C: lessons7–9 and extension.** Make vestibular/receptive-field changes visible; improve the investigation-to-transfer progression; provide a genuinely completed review example; classify the optional source demands and refine extension recovery support if requested

For every batch return complete connected manuscripts, exact source/visual locators, a continuity ledger, separate practice/stimulus/save proposals, preservation boundaries, issue decisions and hashes. Review all later lessons as carefully as early lessons. No arbitrary length reduction and no broad historical builder rerun.

### Required evidence for a later candidate

- First-time-reader review of complete copy, real visuals and all prompts/options/hints/models/criteria/feedback
- Explicit statement of what each worked, guided and independent task adds; repeats remain labeled consolidation, not new mastery evidence
- Actual stimulus available at each task; usable in-place response; save, comparison and feedback sequence; synthetic response survives reload/navigation and appears in All My Work; required progress unchanged for optional work
- Per-figure dimensions, labels/arrows, actual pixels and enlargement checks; vocabulary links and printed/PDF reader targets; no inference from a correct file hash to a usable reader
- Preserve native layout/fonts/CSS/routes, required-check totals, keys/option IDs, old attempts, namespaces/schema, import compatibility and all complete optional saved-task sections
- Separate independent instructional review, Dean's exact-copy decision, authorized isolated integration, focused technical tests and rollout/LMS gates

Final preservation check: all 280 files listed in the Chapter 12 package checksum manifest still matched their supplied hashes after this review. This verifies unchanged supplied files, not runtime acceptance.

Current stopping point: source-grounded review and targeted plan ready. No learner-source rewrite, new activity implementation, coding-environment work, canonical integration, packaging or deployment was performed.
