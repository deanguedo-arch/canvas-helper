# Chapter 11: current-source teaching review and transfer plan

6 October 2026. Review and planning only. No learner, assessment, runtime, or deployment files changed.

## Recommendation

Keep the current chapter's route order, corrected science, native design, original questions, and saved-work contracts. Develop its teaching substantially, beginning with lessons 1–3 and then the tightly connected membrane/synapse sequence in 4–7. The current chapter is a sound content framework, but it is not the complete earlier Scout teaching manuscript. Most lessons move from compact explanation to a required check without a fully worked reasoning example, supported attempt, and meaningfully different application. Adding those functions is the priority; matching Chapter 17's length is not.

Several weaknesses are shared across the chapter: directions that do not match writing-only checks, under-explained diagrams, generic answer-status feedback, and tasks that depend on material deliberately deferred to another lesson. A number of historical source/key conflicts remain teacher decisions. The teaching already corrects several of them, so copying the old slides or answer keys verbatim would make the course less accurate.

## Exact source and review boundary

- Current learner owner: `native/index.html`, from `projects/biology30-unit-a-pilot-3/workspace/index.html`; SHA-256 `9fcd8203b41f4220e53716e473c02a0835f356420b363ea0092e544a8e7bb210`
- Complete current routes: `complete-native-routes/lesson-01.html` through `lesson-13.html`, plus all practice, vocabulary, reader, video, overview, and All My Work surfaces
- Original teacher deck: `sources/teacher-original.pptx`, 66 slides; SHA-256 `74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1`. All slide text and rendered slide images were inspected. The 139-page Unit A teacher-notes PDF repeats this chapter in pages 1–66; its later sensory/endocrine material is not Chapter 11 teaching
- Textbook: `native/assets/textbook/chapter-11.pdf`, 44 physical pages, printed 360–403. Chapter 11 itself, printed 364–403/PDF 5–44, was read with its actual figures, tables, investigations, and questions. Printed page = PDF page + 359
- Assessment evidence: current HTML prompts/options, current `pilot3-catalog.js`, every authored concept and question-family template in `pilot3-practice-bank.js`, current feedback/generator definitions in `pilot3-runtime.js`, all nine labeling activities and their actual images, 25 original D2L quiz items, and the supplied comprehension and chapter-review keys. Important key claims were checked in rendered visible answer boxes; white-covered extraction text was not treated as visible teaching
- Scope evidence: supplied Alberta Biology 20–30 program, Unit A, printed 51–53, and the 2018 student-based performance standards, printed 1–4. The performance examples are illustrative, not an additional compulsory content quota
- Historical Scout manuscript and issue report were used as comparison leads, not as proof of current integration or correctness. The current package closes several historical availability gaps

This is a content and source audit. It does not certify today’s browser behavior, save/import compatibility, video playback/captions, mobile/keyboard rendering, print/export, SCORM, or Brightspace. All original files remained unchanged. The 28-page historical Unit A diploma-question compilation is supplementary assessment provenance spanning several chapters; this report does not certify every historical question in that cross-chapter compilation.

## Chapter path and what must carry forward

Central question: How does a detected change become a coordinated response, and what evidence lets us explain a failure in that pathway?

1. Establish stimulus, receptor, integration, effector, and homeostasis; distinguish a neuron from a nerve and the CNS from the PNS
2. Use neuron structure to explain receiving, conducting, and transmitting information; introduce the action potential at a small sufficient level before myelin
3. Connect cells into pathways; distinguish a spinal withdrawal circuit from a consciously directed response
4. Establish membrane voltage, ion gradients, channels, and continuous pumping before a firing event
5. Explain one membrane event, then propagation, recovery, frequency, and recruitment
6. Connect electrical arrival, chemical transmission, postsynaptic effects, and summation
7. Change a specific step and reason through the consequences, including different effects at excitatory and inhibitory synapses
8. Classify pathways by direction and effector, then explain organ-specific autonomic responses
9. Locate central pathways and protective structures; distinguish interruption, integration, and protection
10. Use brain structures together in a pathway rather than as an isolated naming list
11. Match research questions to measurements; separate observation, inference, and limitations
12. Reassemble the mechanism across scales and use it in a genuinely changed case
13. Keep sensitive extensions optional and evidence-based, without personal disclosure or diagnosis

Preserve that dependency path. The teacher deck also places peripheral control before central control; the textbook uses the reverse order. That difference does not require moving native routes.

## Per-lesson transfer plan

### 01 · Nervous communication · Priority 1

**Keep:** sensory input/integration/motor output; CNS/PNS distinction; neuron versus nerve; nervous/endocrine comparison; current homeostasis definition.

**Develop:** begin with one concrete regulated change, then explain what is detected, which information is carried, where it is processed, which effector acts, and how the response changes the condition. The current opening names the sequence but never walks a complete example through it. Explain why a response can support homeostasis without being voluntary. End with the need for a specialized signalling cell.

**Visual and practice:** introduce a simple current pathway figure, or an approved source crop from textbook Figure 11.3/11.7, with a stated reading task. Work one pathway completely; guide the learner through a missing connection; make a second case change the receptor/effector or regulatory consequence. A new response task should have an in-place response and deliberate comparison, with saving separately specified for native implementation.

**Decision:** `source-checkpoint-3-written` asks for the different nervous-system systems and their structures/functions. The supplied comprehension key Q3 includes somatic/autonomic and sympathetic/parasympathetic detail, while current teaching says subdivisions will come later. Either teach a minimal preview before this check or explicitly approve a narrower marking expectation; do not leave an optional textbook as the only preparation. The first three checks are writing-only, but current directions still describe an MC unlock.

**Evidence:** route 01 headings “A first look at the two main divisions” and “How to complete”; slides 6–8; textbook 367–370/PDF 8–11; comprehension key PDF 2, Q3.

### 02 · Neurons & myelin · Priority 1

**Keep:** continuous axon beneath myelin; nodes as gaps in insulation; Schwann/PNS versus oligodendrocyte/CNS distinction; qualified effects of damage; existing integrated neuron and myelin assets.

**Develop:** motivate the cell shape through the problem of communication over distance. Define an action potential in visible prose before “regenerated at each node”; the term currently appears in the myelin explanation without a first-use explanation there. Explain what the long axon, branches, terminals, and insulation each contribute. Ion detail belongs later.

**Visual and practice:** trace the yellow axon under the sheath, distinguish a node from a break, and connect labels with function. Model the effect of one structural change; guide correction of an actual supplied diagram error; use an independently changed failure at the receiving region or terminal. Include complete reasoning feedback. Keep the original draw-and-label prompt and all label mappings.

**Source caution:** slide 12 equates white/grey matter with whole neuron categories and makes blanket regeneration claims; slide 14 describes MS as a genetic disorder with a uniform course. Current teaching is better qualified. Do not restore these shortcuts. Precise disease claims should remain bounded to the instructional mechanism.

**Evidence:** route 02 “Myelin and Schwann cells”; assets `integrated-neuron.png`, `integrated-myelin.png`; slides 9–14; textbook 372/PDF 13 and 378/PDF 19; required `source-checkpoint-7-written`.

### 03 · Pathways & reflexes · Priority 1

**Keep:** driver/cat/brake context, direction of sensory and motor pathways, distinction between shape and function, spinal withdrawal before awareness, ascending information to the brain, and the qualification that not all reflexes require an interneuron.

**Develop:** turn the brief driver example into a worked causal trace. Then compare it with withdrawal using the same dimensions: initiating stimulus, processing site, decision requirement, output, and timing. Explain how damage at different positions changes the evidence. Do not use the exact tennis-ball question as the worked solution.

**Visual and practice:** existing `integrated-withdrawal.svg` has an appropriate spinal pathway and separate ascending route. Explain both arrows explicitly and use a supplied alternate diagram for a changed-condition prediction. A correct sequence alone should not count as a complete explanation.

**Decision:** the visible comprehension key Q6 calls dodging a tennis ball a spinal withdrawal reflex and sends the visual signal through a spinal interneuron. The current lesson and textbook Q6 ask for a comparison with withdrawal. Resolve human marking before using that key; preserve question ID and historical answers. Keep physical investigation performance separate from reading a scanned investigation.

**Evidence:** route 03 `source-checkpoint-6-written`; slides 15–20; textbook 369–371/PDF 10–12; comprehension key PDF 2/printed 5-19 Q6.

### 04 · The resting neuron · Priority 1

**Keep:** inside-versus-outside reference for −70 mV, active resting state, gradients, greater K+ leak, large intracellular anions, 3 Na+ out/2 K+ in, and distinction between passive channels and ATP-dependent pumping.

**Develop:** start with the two-electrode measurement and explicitly distinguish voltage, ion concentration, and movement. Work through what −70 to −60 mV means, using a number line or graph and the stated reference. Explain the relative roles of gradients/permeability and long-term maintenance. A named list of three factors does not yet explain the resulting state.

**Visual and practice:** current resting diagram is useful, but the learner needs guided attention to outside/inside, concentration symbols, arrows, and pump directions. Contrast a change in permeability with a failure to maintain gradients over time. Avoid suggesting all ions cross back immediately or that the pump is switched off during every impulse.

**Decision:** source Q10 key treats chloride as trapped and overstates the pump as the direct explanation for the voltage; current teaching does not. Preserve the question, settle a teacher-approved explanation, and separate a teaching repair from any change to marking guidance.

**Evidence:** route 04 “Ion concentrations, leakage and the sodium-potassium pump”; slide 22–23; textbook 373–375/PDF 14–16; comprehension key PDF 4/printed 5-21 Q10; `check-resting-potential-written`.

### 05 · Action potentials · Priority 1

**Keep:** current channel account, sodium-channel inactivation, potassium efflux/undershoot, no bulk concentration reversal, absolute/relative recovery distinction, frequency versus recruitment, continuous axon and node regeneration.

**Develop:** teach one membrane region over time before explaining a moving wave. Read both axes and reference lines. Work threshold versus subthreshold examples, then an ion/channel-to-graph inference. Make local voltage change, action-potential amplitude, firing frequency, and number of recruited neurons separate quantities. Explain local spread to the next region before using “starts a new action potential.”

**Visual and practice:** compare the same interval in the existing low/high-frequency figure; then change either the interval or number of neurons so the student must identify what is being compared. Fix or explicitly qualify the illustration's refractory shorthand: the labeling figure H spans only the later interval, and the large teaching figure says no second action potential during “the refractory period,” whereas the prose correctly distinguishes absolute and relative phases. The displayed teaching image uses a peak around +30 mV; the prose examples mention +35/+40. Read the actual image value rather than asking students to force all graphs to one number.

**Decision:** required MC `check-action-potentials-mc` begins “When an action potential begins” but the key describes positive-inside polarity reached later. Slides 26–27 also claim Na/K concentration reversal; key Q13 says the pump is reactivated. These are separate source/marking issues, not authority to re-key past attempts.

**Evidence:** route 05; slides 21–30; textbook 376–380/PDF 17–21; comprehension key PDF 5 Q11–14; `chapter11-action-potentials-0.png`, `-1.svg`, labeling `04_action_potential.png`.

### 06 · Synapses & summation · Priority 1

**Keep:** complete arrival/Ca2+/vesicle/diffusion/receptor/clearance sequence; electrical-to-chemical distinction; conditional firing; receptor-dependent effects; separate temporal/spatial summation.

**Develop:** use one release failure and one postsynaptic receptor failure to demonstrate different bottlenecks. The current steps are present but the learner is not shown how to use them to explain an observation. For summation, work a clearly labelled simplified input model from a starting voltage to threshold, including inhibitory input and timing. Explain that the arithmetic model supports reasoning rather than reproducing every real neuron.

**Visual and practice:** the current three-panel `chapter11-synapses-1.png` has local EPSP/IPSP baselines and dashed reference lines that differ from the summation plots without explaining why. Revise/qualify that teaching asset before depending on it for quantitative reasoning. In spatial and temporal tasks, change location versus timing, not merely the numbers. Have feedback identify the failed inference and restore the chain.

**Source caution:** slides 34–35 say threshold is raised/lowered; slide 36 and current text use membrane voltage toward/away from threshold. Preserve the latter. The transmitter table's “excitatory” entries need specific target context, not an absolute category inferred from the name. Keep ACh, norepinephrine, and cholinesterase clear; teacher-selected GABA emphasis is separate from asserting an exam requirement.

**Evidence:** route 06 “Adding inputs: summation” and “Key neurotransmitters”; slides 31–39; textbook 379–382/PDF 20–23; original required synapse prompt and written response; native three synapse assets.

### 07 · Drugs at the synapse · Priority 1

**Keep:** normal sequence as comparison; localize the changed step; make signal duration/amount conditional on synapse type; preserve the cautious cocaine hypothesis instruction.

**Develop:** a step label followed by a predicted effect is not yet a worked explanation. Work through an explicitly stated hypothetical intervention and observed response, linking site, transmitter availability/receptor action, postsynaptic consequence, and pathway output. Then contrast the same intervention at an inhibitory synapse. Teach why “more transmitter” is not the same as more excitation everywhere.

**Visual and practice:** replace reliance on the four mechanism cards with a traced synapse pathway at the point of reasoning. Use two observations to distinguish release failure from receptor blockade. Include a changed clearance condition as independent transfer; avoid duplicating the required cholinesterase-overproduction answer as the model. The original slide 40 simulation has a useful instructional purpose, but neither a URL nor a thumbnail proves current usability.

**Decision:** required MC repeats lesson 6's transmitter-direction item and does not test the lesson's prediction goal. Keep it as current evidence; a new graded demand is a separately approved revision. Optional nervous-system-tree Q1 expects subdivisions taught in lesson 8: add a clear later-use pointer or a prerequisite bridge. Thought Lab 11.1 link says 371, but source is 383/PDF 24.

**Evidence:** route 07; slides 40–42; textbook 383–384/PDF 24–25; `check-drugs-written`, `source-review111-q1-written`; current generic mechanism figure.

### 08 · Peripheral control · Priority 2

**Keep:** skeletal-muscle reflexes within somatic control; direction distinct from target; mixed organ changes; nervous impulses versus adrenal hormones; caution about polygraph inference.

**Develop:** work a single ordinary situation that contains both a consciously directed skeletal movement and an involuntary organ adjustment. Explain classification by effector before using voluntary/involuntary as shorthand. Show why digestion can decrease while heart activity increases, and why return toward baseline requires continuing regulation.

**Visual and practice:** read the organizational tree as location/direction/target categories rather than one uniform hierarchy. Trace one organ on the actual Figure 11.36 and explain transmitter colours only at the represented connections. Contrast a skeletal-muscle reflex with an autonomic response, then interpret a supplied physiological record with an alternative explanation. A polygraph caution should become an evidence task, not just a warning.

**Decision:** comprehension key Q31 says the bladder sphincter relaxes; source textbook p397 says it constricts. Current net urination-inhibited wording is safer. Do not conflate bladder wall with outlet. The broad optional organ table should distinguish effects actually shown from blanks that the source does not justify filling by simple reversal.

**Evidence:** route 08; slides 43–48; textbook 396–399/PDF 37–40, Figure 11.36; key PDF 12/printed 5-35 Q28–32; `source-review113-q4-written`.

### 09 · Central control · Priority 2

**Keep:** corrected grey/white composition; different cortical/spinal arrangements; communication and reflex roles; bone versus spinal cord; separation of meninges/CSF from the capillary barrier.

**Develop:** connect position to function. Trace ascending and descending communication through a simple intact pathway before explaining an interruption at a stated level. Compare mechanical cushioning with selective blood-to-tissue exchange. Explain why a local spinal circuit can remain conceptually different from communication with the brain.

**Visual and practice:** the existing cross-section and protective-layer diagrams can support this. Point to the relevant tissue and route rather than naming colours alone. Work one hypothetical interruption; give a different level or direction of impairment for transfer. Keep clinical certainty bounded to the stated model.

**Decision:** textbook p388 and comprehension Q20 conflate meninges with the blood–brain barrier. Current prose separates them correctly. The chapter-review key repeats that conflation in Q22. Resolve marking rather than rewriting the current lesson back toward the key.

**Evidence:** route 09 “The blood-brain barrier”; slides 50–54; textbook 385–389/PDF 26–30; key PDF 8/printed 5-29 Q20; review key PDF 4/printed 5-40 Q22.

### 10 · The brain · Priority 2

**Keep:** major structures/functions, cerebrum as part of forebrain, uneven cortical body maps, qualified crossing of motor pathways, and rejection of fixed left-brained/right-brained learner categories.

**Develop:** teach orientation first, then explain how several structures cooperate in a simple movement or sensory task. A list of regions does not model how to use location/function evidence. Work one limited structure-function inference and give a contrasting alternative rather than asking students to diagnose real people.

**Visual and practice:** separate sagittal from lateral views, point to anterior/posterior and brainstem landmarks, and correct the broad region bracket on `chapter11-brain-0.png` before it can visually place forebrain structures in a midbrain band. Connect primary motor versus somatosensory cortex to the uneven body map. Existing optional labeling of Broca/Wernicke regions has more explicit detail than the lesson prose: provide enough visible preparation if those tasks remain assigned.

**Decision:** `source-checkpoint-25-written` asks a Broca/Wernicke comparison that is not actually explained in the main current lesson, although labels appear in an image. Source claims of absolute language loss and one-lobe memory deserve qualification. Do not let optional label art silently set a new required scope.

**Evidence:** route 10; slides 55–61; textbook 387 and 389–392/PDF 28,30–33; native brain figures; `source-checkpoint-25-written` and labeling figure 07.

### 11 · Studying the brain · Priority 1

**Keep:** injury evidence versus proof, Penfield's observations, structure/function distinction, MRI/PET comparison, scan-key caution, and no claim that scans directly show thoughts.

**Develop:** model a complete inference from an actual supplied image or small clearly labelled hypothetical dataset: what was measured, what changed, what claim follows, and what alternative remains. The current lesson tells students to read a scan key but supplies only conceptual circles and brief facts. Use source PET/MRI pixels as evidence with their real captions and limitations, not fabricated scans.

**Visual and practice:** place the actual textbook image or selected dissection photograph with a constrained question. Let an independent task change the evidence type or remove a control. The current SVG text fits in this static rendering; the historical overlap complaint is not independently reproduced here. Its greater issue is that it supplies no observation data.

**Decision:** `check-brain-investigation-mc` keys “X-ray technology” as not useful, but current practice concept `ct-mri` correctly says CT uses X-rays for structural images. This is a live contradiction. NIBIB explicitly describes CT as X-ray imaging and its use for head injuries, tumours, clots, and hemorrhage. Clarify intended plain radiography versus CT through a separately approved assessment version. Do not reinterpret existing attempts. EEG/CT are also practiced more explicitly than they are taught in this lesson.

**Evidence:** route 11; `native/assets/pilot3-catalog.js` key `QUES_51687_82728_A275538`; practice concept `ct-mri`; textbook 392–395/PDF 33–36; Figure 11.32/11.33; [NIBIB CT explanation](https://www.nibib.nih.gov/science-education/science-topics/computed-tomography-ct), checked 6 October 2026.

### 12 · Chapter review and final check · Priority 1

**Keep:** three-scale summary, original graphic organizer and all 22 optional source tasks, explicit ungraded writing, and distinction between completion and scientific correctness.

**Develop:** work one complete cross-scale explanation, connecting structure, membrane events, synaptic changes, central processing, and output. Then give a different failure and ask the learner to justify the location from supplied observations. The final required writing currently asks why severing the corpus callosum helps some seizures; the main current teaching explains communication between hemispheres but not seizure spread. This missing bridge must be taught or the assessment scope separately reconsidered.

**Visual and practice:** use the existing organizer critically: its voluntary/somatic shortcut needs the reflex qualification. Add a graph/data interpretation tied to what 4–6 taught. In source Q17 distinguish stimulus setting from membrane threshold, single fibre model from whole muscle, and a measured bound from an exact threshold. Keep Q19's actual robotic-arm photograph separate from any hypothesized wiring.

**Decision:** the now-supplied review key introduces specific marking risks: Q18 declares frontal lobe the single memory answer; Q19(b) says skeletal muscles in the robotic arm contract; Q22 repeats the BBB/meninges error; Q23 reduces pain tolerance to a threshold explanation. These require a teacher errata/marking decision. Current one-line caveats do not completely reconcile them. Q16–24 are on printed 403/PDF 44 despite current repeated p402 links.

**Evidence:** route 12, `check-chapter-review-section-written`, `source-chapter-review-q17-written` through Q24; textbook 401–403/PDF 42–44; review key PDF 3–4/printed 5-39–5-40; slide 66.

### 13 · Stress, experience and addiction · Priority 3

**Keep:** optional status, no personal disclosure, no diagnosis/treatment claim, respectful nonjudgmental addiction language, and source-evidence caution.

**Develop:** offer a bounded scientific task that is answerable without the videos. For example, interpret a supplied comparison and identify a competing explanation, or distinguish a synaptic mechanism from a broad claim about a person. Any illustrative data must be labelled as hypothetical. Do not revive the source's unsupported “healthy versus abused brain” visual as diagnostic proof.

**Visual and practice:** the current text refers to “the comparison image,” but no such image is in this route. Either remove the dangling reference in a later authorized copy edit or supply an appropriately reviewed evidence source with context. A video title and a caution are not a complete optional teaching experience. No added saved or graded requirements should be inferred from this recommendation.

**Evidence:** route 13 “Experience, development and the brain”; slides 49,62–65; source slide 64 comparison and its absent study context; extension video/library definitions.

## Practice and feedback findings across the chapter

1. **Required written work has status feedback, not explanatory feedback.** Current `pilot3-runtime.js` reports “Correct”/“Not correct yet” for static checked answers and a saved status for writing. Writing is honestly labelled ungraded. That should be preserved, but a learner still needs a model, criteria, and explanation at an intentional comparison point. The existence of a teacher key elsewhere is not an in-course recovery path.
2. **Generated variety is often recognition variety.** The 40 concept records produce several families, but “application” often asks for the term matching a one-sentence scenario. A “sequence-end” item labelled level 4 asks for the last stored entry. Those labels do not establish higher-order demand. Plan selected causal/interpretive applications aligned to the lesson goals, with distinct IDs and no rewriting of already saved generated instances.
3. **Some stored sequences are category lists.** For example, `gray-white-matter` orders “cell bodies and synapses → gray matter → myelinated axons → white matter.” A generated instruction to put these “steps” in order represents a comparison as a process. Similar scrutiny is needed for protection layers and structural descriptions. Keep genuine sequences for propagation/transmission; use matching/comparison for categories.
4. **Generated cues and explanations are too generic to repair many errors.** The shared cue tells students to trace the term, and explanation repeats the definition. For a changed-condition task, feedback should state the changed link and why alternatives fail.
5. **Labeling is a useful retained asset set.** Keep nine diagram activities and fixed answers. Connect each to its lesson and add interpretation after identification. Do not “improve” a figure by silently moving its protected leader lines or changing an answer map.
6. **Current draw/table tasks need an honest work path.** Some required prompts ask students to draw or make a table while the response surface is a textarea. The textbook-practice surface gives paper/photo/submission instructions; individual required tasks need compatible guidance. New substantive tasks should not default to an unsaved external workspace simply because they are optional. Specify the native response, save, deliberate model reveal, and collection behavior before implementation.
7. **Do not replace a good source example to conceal assessment overlap.** Record whether a retained question is retrieval, guided review, or fresh transfer. If a consequentially fresh graded item is needed, ask for that revision explicitly rather than quietly altering an old question under its ID.

## Historical findings reconciled against the current package

- The current native owner has the same entry hash recorded in the October 3 baseline. The later full Scout return is a separate manuscript candidate; its 27 unsaved formative fields are not present in this current owner. Do not report those fields as a current native saving defect
- Native runtime and compiled JavaScript are now supplied, along with authority PDFs, original QTI, quiz media, and the chapter-review answer key. Earlier statements that these files were absent are no longer true for this review packet
- Practice concepts with `lesson-14` exist, but current runtime explicitly allows them for legacy restoration and excludes lessons 13/14 from default all-chapter generation. They are not evidence of a missing live lesson 14. Preserve restoration behavior
- The old SVG text-overlap concern for the brain-investigation illustration did not reproduce in the static rendering used here. Browser/mobile inspection remains untested
- The written-only MC directions, first-use action-potential gap, source/key conflicts, source-page mismatches, and weak full worked/guided/transfer progression are still supported by current evidence

## Bounded next sequence

1. Agree the Chapter 11 progression and the highest-risk teaching/marking positions before drafting: first-check system scope, tennis-ball/reflex interpretation, membrane and barrier source errata, and X-ray/CT wording
2. Prepare a complete 1–3 teaching batch using the frozen Chapter 17 process. Reuse strong historical Scout teaching only after passage-by-passage source review; do not paste an old portable course over the current native owner
3. Prepare 4–5, then 6–7 with one continuity record: first-use terms, concepts already taught, protected questions used as review, fresh applications, unresolved assets, and later homes for detail
4. Prepare 8–10 together as a structure/function sequence, then 11–12 as evidence and synthesis. Complete the optional 13 only to its appropriate evidence depth
5. Return full versioned manuscripts, exact visual placements, complete prompts/hints/models/criteria/feedback, and a saved-work proposal. Require independent first-time-reader review and actual visual inspection before an exact-copy decision
6. Any implementation remains a later separately authorized step. Preserve current native layout, route IDs, vocabulary, reader mappings, optional/required progress, all original prompts/options/keys, immutable attempts, and saved-work ownership. Confirm the specific work, settings, and scope before consuming Codex usage

No chapter-wide length target, cosmetic rewrite, new route, new progress gate, silent answer-key replacement, or deployment follows from this review.
