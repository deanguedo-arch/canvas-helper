# Chapter 11 targeted change log — v1.0.0

Teacher-only. Baseline: the full repaired exemplar, hash 56bbed509233ee497f7af3aefe27856cd58e9e498c1ff52e9b2893f6776634cf. Its complete unrevised copy is preserved in raw-manuscripts/. The 13 final files are complete lessons, not patches.

## Scope

58 targeted text/hint changes were applied. All 27 original formative model/feedback texts, all original question texts/order and all 21 native activity texts inside these routes are retained. The underlying original native controls, option values, keys and storage owners are not modified. Full diffs and complete revision copies are in revisions/.

Markdown extraction normalizes HTML layout and uses ../review-assets/ links. Exact UTF-8 route slices are retained as inert .source-fragment.html.txt files, so the original markup is available separately from the readable transformation. One redundant Markdown emphasis delimiter around a guide heading was normalized; this changes formatting, not learner wording.

Success criteria in PRACTICE_MAP are teacher-side interpretations of each complete retained model, not a new automatic rubric or grading threshold.

## Per-lesson retention record

| Route | Raw words | Final words | Unchanged / original text atoms | Targeted edits |

|---|---:|---:|---:|---:|

| lesson-01 | 2259 | 2450 | 120 / 122 | 5 |

| lesson-02 | 1955 | 2095 | 76 / 80 | 5 |

| lesson-03 | 2032 | 2296 | 85 / 88 | 6 |

| lesson-04 | 2088 | 2221 | 81 / 84 | 5 |

| lesson-05 | 2646 | 2764 | 105 / 110 | 7 |

| lesson-06 | 2778 | 2906 | 120 / 123 | 5 |

| lesson-07 | 2558 | 2643 | 110 / 112 | 3 |

| lesson-08 | 2931 | 3057 | 134 / 136 | 4 |

| lesson-09 | 1916 | 1995 | 77 / 79 | 3 |

| lesson-10 | 2934 | 3013 | 119 / 122 | 4 |

| lesson-11 | 2897 | 3029 | 129 / 131 | 4 |

| lesson-12 | 4226 | 4311 | 182 / 184 | 3 |

| lesson-13 | 1760 | 1887 | 80 / 81 | 4 |



Counts describe extraction/retention only. They are not a quality score, a shortening target or evidence of mastery. The review and optional extension remain complete.

## Exact targeted changes

### CH001 · lesson-01 · replace-text

Target: `p3-l01-guide-04`.

C01: directions follow the actual writing-only native activity; no activity or completion change.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required written chapter check. Open the check near the bottom and select Start. This check contains written responses only; there is no multiple-choice question to unlock them. Answer each prompt in your own words and select Save written response for every response box.

### CH002 · lesson-01 · replace-text

Target: `p3-l01-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH003 · lesson-01 · append-explanation

Target: `pro-l01-homeostasis`.

Practice support: teach the evaporation/effector reasoning before the guided task instead of leaving it only in the existing model answer; native homeostasis Frayer and exemplar model provide the bounded basis.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

For warming, connect the response to heat loss: sweat glands release sweat onto the skin, and evaporation removes heat from the body. The gland is the effector, releasing sweat is its activity, and cooling is the effect that can oppose a temperature rise. Use those distinctions in the next example.

### CH004 · lesson-01 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l01-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Separate information flow from regulation Make a first attempt before using this hint. First trace what was detected, where it was processed and which structure moved. Then ask which internal condition, if any, the catch was correcting. A useful response is not automatically a homeostatic response.

### CH005 · lesson-01 · append-explanation

Target: `Optional investigation: You, Robot?`.

C18: separate source interpretation/planning from physical investigation and avoid invented observations.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Use the source procedure to explain which input or movement has been changed and predict how that could affect the task. This lesson supplies no timing results. Perform a physical version only when your teacher has assigned an approved procedure with suitable materials and supervision; do not improvise sensory restrictions or tools.

### CH006 · lesson-02 · replace-text

Target: `p3-l02-guide-04`.

C01: directions follow the actual writing-only native activity; no activity or completion change.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required written chapter check. Open the check near the bottom and select Start. This check contains written responses only; there is no multiple-choice question to unlock them. Answer each prompt in your own words and select Save written response for every response box.

### CH007 · lesson-02 · replace-text

Target: `p3-l02-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH008 · lesson-02 · replace-text

Target: `p`.

C02: define multipolar and action potential at their first explanatory use without importing the later ionic lesson.

**Before**

Start with a typical multipolar neuron. Dendrites are branching receiving regions. The cell body , or soma, contains the nucleus and organelles and maintains the cell's metabolism. The axon carries action potentials toward its terminal branches. An axon terminal passes a signal to another cell at a junction called a synapse.

**After**

Start with a typical multipolar neuron : it has many dendrites and one axon. Dendrites are branching receiving regions. The cell body , or soma, contains the nucleus and organelles and maintains the cell's metabolism. The axon carries action potentials toward its terminal branches. An action potential is a brief electrical change across a neuron’s membrane. Regenerating that change along the axon carries a nerve signal. For now, connect this signal with the continuous axon; Lessons 4 and 5 will explain the ion movements that produce it. An axon terminal passes a signal to another cell at a junction called a synapse.

### CH009 · lesson-02 · replace-phrase

Target: `p`.

C02: explain threshold sufficiently for this structure/failure prediction; detailed threshold mechanism stays in lesson 05.

**Before**

The next region may reach threshold later, or may fail to reach it.

**After**

The next region may reach threshold—the level of electrical change needed to regenerate an action potential—later, or may fail to reach it.

### CH010 · lesson-02 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l02-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Locate each failure before proposing a repair Make a first attempt before using this hint. Mark the conducting axon, the terminal and the receiving branches as different places. Ask which missing function additional input branches would actually restore.

### CH011 · lesson-03 · replace-text

Target: `p3-l03-guide-04`.

C01: directions follow the actual writing-only native activity; no activity or completion change.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required written chapter check. Open the check near the bottom and select Start. This check contains written responses only; there is no multiple-choice question to unlock them. Answer each prompt in your own words and select Save written response for every response box.

### CH012 · lesson-03 · replace-text

Target: `p3-l03-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH013 · lesson-03 · replace-text

Target: `p`.

C03: replace the worked ball situation with textbook p.369/PDF10 and slide17’s driver/braking example; the required tennis-ball prompt remains untouched.

**Before**

Now imagine a ball moving toward your face and deliberately moving aside. Visual information enters through a sensory pathway. Brain processing helps identify the ball and organize a suitable movement. Descending motor signals reach spinal pathways and motor neurons that activate skeletal muscles.

**After**

Now consider a driver who sees a cat move onto the road and deliberately presses the brake. Work through the response from the detected change to the foot movement. The response can be quick, but it is not the same circuit as withdrawing a hand from a sharp object.

### CH014 · lesson-03 · insert-worked-reasoning

Target: `pro-l03-comparison`.

C03: preserve and make explicit the full causal comparison using a meaningfully different source example, rather than answer the unchanged required tennis-ball question.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Detect the change. Visual receptors provide information about the cat on the road. This is sensory input, not yet the instruction to move a foot. Explain the processing. Brain circuits interpret the incoming information and contribute to selecting the braking response. This step connects seeing the obstacle with a deliberate action. Trace the outgoing route. Motor commands descend through pathways in the spinal cord and travel in motor neurons toward the leg and foot muscles. Using the brain does not mean bypassing the spinal cord. Identify the effector and result. Skeletal muscles contract so that the foot presses the brake. Naming the muscle’s role completes the connection between the detected change and the response.

### CH015 · lesson-03 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l03-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Keep the first response separate from the later choice Make a first attempt before using this hint. Follow the first route to a muscle, then follow the information that permits awareness and a planned step. A short route need not prevent a longer route from also carrying information.

### CH016 · lesson-03 · append-explanation

Target: `pro-l03-investigation`.

C18: separate source interpretation/planning from physical investigation and avoid invented observations.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Planning a fair comparison is not the same as collecting data. No reflex measurements are supplied here. Any physical investigation must follow the procedure and safety conditions your teacher has approved; do not create painful stimuli, throw objects at someone’s eyes, or use bright lights to improvise a test.

### CH017 · lesson-04 · replace-text

Target: `p3-l04-guide-04`.

C01/C17: make the existing paired-control sequence explicit; preserve its unlock and saving semantics.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required chapter check. Open the check near the bottom and select Start. Choose a multiple-choice answer and select Check answer. A correct choice unlocks the related writing. Answer that prompt in your own words and select Save written response.

### CH018 · lesson-04 · replace-text

Target: `p3-l04-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH019 · lesson-04 · replace-phrase

Target: `p`.

First-use support for ATP’s role, grounded in textbook p.374/PDF15 and the native resting-potential explanation; no extra metabolic pathway added.

**Before**

Ions still move through channels, and the cell still uses ATP.

**After**

Ions still move through channels, and the cell still uses ATP, a molecule that transfers energy for cellular work such as active transport.

### CH020 · lesson-04 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l04-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Track charge across the boundary Make a first attempt before using this hint. Count the sign of the charge and the direction it moves. Use only the initial conditions specified; do not assume the same net movement continues indefinitely.

### CH021 · lesson-04 · append-explanation

Target: `Optional model investigation`.

C18: separate source interpretation/planning from physical investigation and avoid invented observations.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Use the source description to compare the model with a neuron. No measured voltage table is supplied here, so do not invent one. Preparing solutions and taking measurements belong to a separate teacher-approved laboratory task, not an unsupervised requirement of this online explanation.

### CH022 · lesson-05 · replace-text

Target: `p3-l05-guide-04`.

C01/C17: make the existing paired-control sequence explicit; preserve its unlock and saving semantics.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required chapter check. Open the check near the bottom and select Start. Choose a multiple-choice answer and select Check answer. A correct choice unlocks the related writing. Answer that prompt in your own words and select Save written response.

### CH023 · lesson-05 · replace-text

Target: `p3-l05-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH024 · lesson-05 · replace-text

Target: `p`.

C18: preserve the exemplar’s exact 100 ms / 2 / 5 values and calculations while explicitly identifying them as an illustrative model.

**Before**

Suppose one 100 ms interval contains 2 spikes and another contains 5. Because 100 ms is 0.10 s, the frequencies are 2 ÷ 0.10 = 20 impulses/s and 5 ÷ 0.10 = 50 impulses/s . If the spike heights are unchanged, the evidence supports a frequency increase. It does not show that each impulse became stronger, or that more neurons fired.

**After**

Use these supplied teaching-model numbers, not experimental measurements. Suppose one 100 ms interval contains 2 spikes and another contains 5. Because 100 ms is 0.10 s, the frequencies are 2 ÷ 0.10 = 20 impulses/s and 5 ÷ 0.10 = 50 impulses/s . If the spike heights are unchanged, the evidence supports a frequency increase. It does not show that each impulse became stronger, or that more neurons fired.

### CH025 · lesson-05 · replace-phrase

Target: `p`.

First-use explanation of a retained term, not a new force calculation. The quantitative whole-muscle extension remains a bounded-source review item.

**Before**

recruiting more motor units and increasing firing frequency

**After**

recruiting more motor units (motor neurons together with the muscle fibres they control) and increasing firing frequency

### CH026 · lesson-05 · append-explanation

Target: `pro-evaluation-2026-10-03-v1-l05-guided`.

C18: distinguish supplied hypothetical trial conditions from collected observations.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

The three trials above are model conditions for reasoning, not reported measurements from an experiment.

### CH027 · lesson-05 · replace-phrase

Target: `p`.

C18: classify the supplied recording scenario as a model without changing its inference demand or numbers.

**Before**

A stronger stimulus produces more equal-height spikes from neuron A.

**After**

In this model recording, a stronger stimulus produces more equal-height spikes from neuron A.

### CH028 · lesson-05 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l05-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Count spikes and count neurons separately Make a first attempt before using this hint. More spikes from A and newly detected spikes from B and C are different observations. For the final prediction, identify which part of the refractory period the prompt names.

### CH029 · lesson-06 · replace-text

Target: `p3-l06-guide-04`.

C01/C17: make the existing paired-control sequence explicit; preserve its unlock and saving semantics.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required chapter check. Open the check near the bottom and select Start. Choose a multiple-choice answer and select Check answer. A correct choice unlocks the related writing. Answer that prompt in your own words and select Save written response.

### CH030 · lesson-06 · replace-text

Target: `p3-l06-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH031 · lesson-06 · replace-phrase

Target: `p`.

C18: the supplied timing observations are scenario assumptions, not a newly claimed experiment.

**Before**

One small input produces a depolarization that stays below threshold.

**After**

In this model experiment, one small input produces a depolarization that stays below threshold.

### CH032 · lesson-06 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l06-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Ask what can overlap in time Make a first attempt before using this hint. Compare how much of an earlier postsynaptic effect remains when the next input arrives. Then keep the threshold decision separate from the height of the resulting spike.

### CH033 · lesson-06 · append-explanation

Target: `Optional tissue investigation`.

C18: separate source interpretation/planning from physical investigation and avoid invented observations.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

You may analyse the textbook’s supplied micrographs and label features that are actually visible. That is image interpretation, not a claim that you used a microscope. Handling slides and equipment belongs to a separate teacher-approved practical activity; do not invent observations from missing specimens.

### CH034 · lesson-07 · replace-text

Target: `p3-l07-guide-04`.

C01/C17: make the existing paired-control sequence explicit; preserve its unlock and saving semantics.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required chapter check. Open the check near the bottom and select Start. Choose a multiple-choice answer and select Check answer. A correct choice unlocks the related writing. Answer that prompt in your own words and select Save written response.

### CH035 · lesson-07 · replace-text

Target: `p3-l07-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH036 · lesson-07 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l07-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Use the controls to eliminate a proposed failure Make a first attempt before using this hint. A normal signal at A’s terminal checks one part of the route. A normal response to transmitter placed at B checks another. Identify what has not yet been measured directly.

### CH037 · lesson-08 · replace-text

Target: `p3-l08-guide-04`.

C01/C17: make the existing paired-control sequence explicit; preserve its unlock and saving semantics.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required chapter check. Open the check near the bottom and select Start. Choose a multiple-choice answer and select Check answer. A correct choice unlocks the related writing. Answer that prompt in your own words and select Save written response.

### CH038 · lesson-08 · replace-text

Target: `p3-l08-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH039 · lesson-08 · append-explanation

Target: `pro-l08-effectors`.

Practice support: make the effector information from the existing guided hint/model available before the attempt; no new eye-anatomy lesson or required task is added.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

For the next comparison, note the effectors: the knee is moved by skeletal muscle, whereas pupil constriction is produced by smooth muscle in the iris. Use that tissue information when you classify the motor pathways; an involuntary response can use either type of effector.

### CH040 · lesson-08 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l08-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Explain the organ pattern before its possible cause Make a first attempt before using this hint. Compare the heart, salivary glands and digestive tract before and after the presentation. Then ask whether those same measurements could occur for a reason other than lying.

### CH041 · lesson-09 · replace-text

Target: `p3-l09-guide-04`.

C01/C17: make the existing paired-control sequence explicit; preserve its unlock and saving semantics.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required chapter check. Open the check near the bottom and select Start. Choose a multiple-choice answer and select Check answer. A correct choice unlocks the related writing. Answer that prompt in your own words and select Save written response.

### CH042 · lesson-09 · replace-text

Target: `p3-l09-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH043 · lesson-09 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l09-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Compare cushioning with selective exchange Make a first attempt before using this hint. Locate the fluid around nervous tissue and the capillary wall between blood and tissue. Ask which structure changes mechanical forces and which controls the passage of materials.

### CH044 · lesson-10 · replace-text

Target: `p3-l10-guide-04`.

C01/C17: make the existing paired-control sequence explicit; preserve its unlock and saving semantics.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required chapter check. Open the check near the bottom and select Start. Choose a multiple-choice answer and select Check answer. A correct choice unlocks the related writing. Answer that prompt in your own words and select Save written response.

### CH045 · lesson-10 · replace-text

Target: `p3-l10-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH046 · lesson-10 · replace-phrase

Target: `p`.

Practice support: make the sensory condition explicit in the existing independent scenario; preserve the native textbook Braille question unchanged.

**Before**

A person reads an instruction in Braille, understands it,

**After**

A person reads an instruction in Braille by touch, understands it,

### CH047 · lesson-10 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l10-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Break the task into cooperating contributions Make a first attempt before using this hint. Separate receiving touch information, understanding and planning, sending a motor command, and correcting precision. Then consider why information may have to pass between hemispheres.

### CH048 · lesson-11 · replace-text

Target: `p3-l11-guide-04`.

C01/C17: make the existing paired-control sequence explicit; preserve its unlock and saving semantics.

**Before**

Complete the required chapter check. Open the check near the bottom and select Start. For multiple choice, select Check answer; a correct answer unlocks the related writing. Answer in your own words and select Save written response for every response box.

**After**

Complete the required chapter check. Open the check near the bottom and select Start. Choose a multiple-choice answer and select Check answer. A correct choice unlocks the related writing. Answer that prompt in your own words and select Save written response.

### CH049 · lesson-11 · replace-text

Target: `p3-l11-guide-07`.

C17: distinguish native activity draft/save semantics from the 27 deliberately unsaved formative spaces. No saving implementation is changed.

**Before**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.

**After**

Expected work: complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Draft saving applies to the chapter-check and textbook activities you start; use their Save written response controls and check the save status. The optional practice spaces in the teaching are labelled “not saved.” They are not stored, automatically graded or counted toward the 12 required checks.

### CH050 · lesson-11 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l11-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Separate uptake from the claim about intelligence Make a first attempt before using this hint. State what PET records in this example before interpreting a brighter region. Ask what comparison is absent and whether the activity of a single region excludes the contribution of the rest of the network.

### CH051 · lesson-11 · append-explanation

Target: `pro-l11-anatomy`.

C18: separate source interpretation/planning from physical investigation and avoid invented observations.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Using the supplied photographs is a source-image observation task. It does not establish that you performed a dissection. A physical specimen or dissection requires a separately assigned, teacher-approved procedure, materials and safety arrangements; a practical performance is not required to work through this lesson.

### CH052 · lesson-12 · replace-text

Target: `p3-l12-review-process-04`.

C01: state the native final paired-check control sequence without changing the final check.

**Before**

Complete the required check. Open the final chapter check, select Start, answer the multiple-choice question correctly, save the written explanation and then select Submit and finish.

**After**

Complete the required check. Open the final chapter check and select Start. Choose the multiple-choice answer and select Check answer. Once it is correct, write and save the explanation that appears, then select Submit and finish.

### CH053 · lesson-12 · replace-text

Target: `p3-l12-review-process-06`.

C17: distinguish required/optional native writing from the new unsaved practice spaces.

**Before**

Expected written work: answer in your own words and explain the biological connection. Written responses are saved, but they are not automatically graded.

**After**

Expected written work: answer in your own words and explain the biological connection. Written responses inside an activity you have started use its Save written response control and are not automatically graded. The optional practice spaces in the teaching are labelled “not saved”; they do not change chapter progress.

### CH054 · lesson-12 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l12-independent`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Trace one whole route, then zoom into two steps Make a first attempt before using this hint. Start with the sound and end with movement and adjustment. Insert cellular mechanisms where they do work. For the changed condition, locate the neuromuscular junction after the brain’s processing steps.

### CH055 · lesson-13 · replace-phrase

Target: `p3-l13-setup-02`.

Keep the original optional-choice invitation accurate for the full, substantive extension teaching.

**Before**

read its short introduction

**After**

read its explanation

### CH056 · lesson-13 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l13-stress-application`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Ask what the instrument did and did not measure Make a first attempt before using this hint. The observation is a change in heart rate. Consider whether that one variable uniquely identifies either a subjective experience or its cause.

### CH057 · lesson-13 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l13-experience-application`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Separate a picture, an association and a causal test Make a first attempt before using this hint. Ask how participants and comparison conditions were selected, and whether the evidence follows change over time. A single image cannot supply all of that information.

### CH058 · lesson-13 · add-optional-hint

Target: `pro-evaluation-2026-10-03-v1-l13-addiction-application`.

C17: purposeful support after an independent first attempt; original prompt, field ID, model and explanatory feedback stay intact.

**Before**

(No corresponding text in the exemplar; this is an addition.)

**After**

Optional hint: Connect a synaptic change with learning and context Make a first attempt before using this hint. Choose a communication step already taught, then connect it to a cue, repeated behaviour or an environmental influence. Check what each absolute claim leaves out.
