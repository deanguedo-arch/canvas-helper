# Codex handoff — Biology 30 Chapters 12 and 13 Practice & Review

## Goal

Integrate the authored Chapter 12 and Chapter 13 practice banks and labeling resources into the standalone HTML courses, using the Chapter 11 Practice & Review behaviour as the interaction reference.

Do **not** change Chapter 11. Do **not** expose source assessment keys as learner resources. These banks are formative practice generated from the taught concepts and calibrated against source-course assessment scope.

## Files in this handoff

- `chapter12-practice-bank.js` — Chapter 12 generator-ready concept bank in the same broad model as Pilot 3.
- `chapter13-practice-bank.js` — Chapter 13 generator-ready concept bank.
- `chapter12-practice-bank.json` — explicit authored question/review reference and answer keys.
- `chapter13-practice-bank.json` — explicit authored question/review reference and answer keys.
- `labeling-manifest.json` — labeling sets, A/B/C answer keys, aliases, source figure/page, preferred repository asset, and science guardrails.
- `textbook-figure-inventory.md` — broader scan of textbook figures worth using for labeling/diagram practice, including source page mapping and exclusions.

## Source assessment calibration

The current source map identifies:

- Chapter 12 visible quiz `quiz_d2l_59223.xml`: **24 questions** — 18 multiple choice, 6 short answer.
- Chapter 13 visible quiz `quiz_d2l_59224.xml`: **26 questions** — 21 multiple choice, 5 short answer.

Use those source quizzes and textbook review sets to calibrate what students are expected to recognize and explain. Do not simply paste their hidden answer keys into formative practice.

## Integration order

### 1. Chapter 12 first

Wire `chapter12-practice-bank.js` into:

1. Flash cards
2. Fill in the blanks
3. Multiple choice
4. Mixed practice
5. Labeling

Use the lesson/topic filter from the bank instead of hardcoding Chapter 11 lesson assumptions.

Chapter 12 topics:

1. Sensory receptors, sensation, and adaptation
2. Eye structures and path of light
3. Focusing, accommodation, and vision problems
4. Retina, rods/cones, and visual interpretation
5. Ear structures and sound transmission
6. Pitch, loudness, hearing impairment, technology
7. Balance, body position, and proprioception
8. Taste, smell, touch, and temperature
9. Chapter review

### 2. Chapter 13 second

Wire `chapter13-practice-bank.js` into the same five practice modes.

Chapter 13 topics:

1. Homeostasis and endocrine communication
2. Hormone target cells/mechanisms
3. Feedback and regulation
4. Hypothalamus and pituitary
5. Growth regulation
6. ADH and water balance
7. Thyroid hormones/metabolism
8. PTH and calcium
9. Short-term stress
10. Longer-term stress
11. Aldosterone, salt, and water
12. Insulin/glucagon/blood glucose
13. Integrated review

## Practice behaviour

Match Chapter 11 behaviour where practical:

- Topic dropdown + set size 5/10/15/20.
- Multiple choice also offers difficulty filtering.
- Deterministic unfinished sessions restore the exact same item and option order.
- First wrong attempt gives a cue.
- Second wrong attempt can reveal the reviewed answer/explanation.
- Formative practice never increases required chapter-check progress.
- Completed practice appears in All My Work/history if the standalone course supports that feature.
- Stop and reset uses the in-page confirmation, not `window.confirm()`.
- If a filtered bank has fewer unique valid questions than requested, show the smaller set; never pad by repeating invalid items.

### Sequence items

Only generate ordering/pathway questions when a concept has a reviewed non-empty `sequence`. Do not invent a sequence merely because the engine supports ordering.

### Multiple-choice distractors

Prefer explicit authored variants and same-topic distractors. Reject any generated item with more than one defensible answer.

## Labeling integration

Use `labeling-manifest.json` as the answer authority.

For every labeling set:

1. Open the specified preferred asset or textbook figure.
2. Visually inspect it before wiring any answer.
3. Create a learner copy with stable letters A/B/C... and **no biological answer words**.
4. Keep the answer key in code/data only.
5. Provide dropdown answer choices and accepted aliases from the manifest.
6. Support Check one label and Check all labels.
7. Keep image readable above controls, with a larger-image option.
8. Confirm each leader line/hotspot reaches the intended structure.

### Chapter 12 highest-priority labels

- Human eye anatomy — textbook Fig. 12.7, p. 411.
- Retina layers/light-vs-neural direction — Fig. 12.16, p. 415.
- Visual pathway — Fig. 12.18, p. 416.
- Accommodation — Fig. 12.10, p. 412.
- Myopia/hyperopia — Fig. 12.12, p. 413.
- Ear anatomy — Fig. 12.20, p. 420.
- Cochlea/organ of Corti — Fig. 12.21, p. 421.
- Vestibular apparatus — Fig. 12.24, p. 424.
- Sensory receptor families — Table 12.1, p. 409.

### Chapter 13 highest-priority labels

- Major endocrine glands — Fig. 13.7, p. 439.
- Hypothalamus/pituitary pathways — Fig. 13.12, p. 445.
- General tropic-hormone loop — Fig. 13.10, p. 441.
- ADH water-balance loop — Fig. 13.9, p. 441.
- Thyroxine feedback — Fig. 13.17, p. 448.
- PTH/calcium homeostasis — Fig. 13.18, p. 449.
- Adrenal cortex/medulla anatomy — Fig. 13.19, p. 451.
- Short-term vs long-term stress — Fig. 13.22, p. 453.
- Insulin/glucagon blood-glucose feedback — Section 13.4, pp. 456–462.
- ADH versus aldosterone integrated comparison — Fig. 13.9 + aldosterone mechanism p. 454.

## Existing repository figures to reuse before redrawing

Look under:

`projects/resources/biology30-unit-a-pilot/v2/figures/`

Useful assets include:

- `eye-anatomy.svg`
- `retina-light-pathway.svg`
- `ear-hearing-pathway.svg`
- `equilibrium-apparatus.svg`
- `sensory-receptor-families.svg`
- `endocrine-body-map.svg`
- `generic-feedback-loop.svg`
- `hypothalamus-pituitary-axes.svg`
- `water-balance-loop.svg`
- `thyroxine-loop.svg`
- `calcium-regulation-loop.svg`
- `stress-response-comparison.svg`
- `blood-glucose-loop.svg`
- `water-salt-regulation.svg`

If an SVG omits structures required by the labeling manifest, extend/redraw the SVG or derive a source-faithful textbook crop. Do not fake a label target.

## Science guardrails to preserve

### Chapter 12

- Incoming retinal light passes ganglion/bipolar layers before reaching rods/cones; neural information travels back photoreceptor → bipolar → ganglion → optic nerve.
- Near focus: ciliary muscles contract, suspensory tension decreases, lens becomes rounder.
- Far focus: ciliary muscles relax, suspensory tension increases, lens flattens.
- Myopia: focal point for distant light in front of retina; concave correction.
- Hyperopia: near focal point behind retina; convex correction.
- Otoliths belong with utricle/saccule, not the semicircular canals.
- Sound waves do not travel down the auditory nerve; hair cells transduce mechanical energy into neural signalling.

### Chapter 13

- ADH and oxytocin are **produced in hypothalamic neurons** and stored/released from posterior-pituitary terminals.
- Anterior pituitary synthesizes its own hormones, including hGH, TSH, ACTH, PRL, FSH, and LH.
- Cortisol is **anti-inflammatory / immune-suppressing** in the textbook. Do not use the teacher-slide phrase saying cortisol increases inflammation.
- Aldosterone: focus on adrenal-cortex source and kidney Na+ reabsorption/water-retention effects. Do not teach ACTH as its sole or primary physiological regulator.
- PTH is the major human low-blood-calcium regulator emphasized by the text; calcitonin's adult-human role is comparatively minor.
- Beta cells → insulin → glucose down. Alpha cells → glucagon → glucose up.
- Printed pp. 468–471 are cumulative Unit 5 review, not Chapter 13-only required practice.

## Acceptance checks

Before calling the integration complete:

- Every bank concept maps to taught lesson content.
- Every MC item has exactly one defensible answer.
- Every fill-in alias is biologically equivalent.
- Every sequence is a real ordered biological process.
- Every labeling letter lands on the correct final image structure.
- Every answer in `labeling-manifest.json` is accepted by Check one and Check all.
- Practice completion does not change required-check progress.
- A 20-item filtered set does not repeat questions merely to fill quota.
- An unfinished set restores the exact same questions and displayed options after reload.
- Chapter 12 and Chapter 13 storage remain separate.

## First file to open

Start with:

`handoff/biology30-ch12-ch13-practice/chapter12-practice-bank.js`

Then open:

`handoff/biology30-ch12-ch13-practice/labeling-manifest.json`
