# Chapter 11 first batch — source, assets and integration handoff — DRAFT v1

**Status:** DRAFT authoring handoff only. No course integration, deployment, SCORM packaging or teacher acceptance is authorized.  
**Scope:** `lesson-01`, `lesson-02`, `lesson-03` only.  
**Branch:** `codex/math-engine-preflight`  
**Revision:** `ecc1b806630cb33b9942e64eb676a1f8568c007e`  
**Source-tree SHA-256:** `0e89c19b8db652abffc5a8837e084b7e84eb30be888057c8ccdf2e2efe33ba52`  
**Canonical entry:** `projects/biology30-unit-a-pilot-3/workspace/index.html`  
**Driver/status:** active · `direct-workspace-v1`

This record is teacher/developer-only. Historical project files are not current authority for this batch.

---

## 1. Canonical lesson anchors and source fragments

| Lesson | Anchor | Current lines | Fragment SHA-256 |
|---|---|---:|---|
| Nervous communication | `#lesson-01` | 167–368 | `d6e23136fc8be7c720cfc63e4f18f51d774d8e77c8243ab6bb14884e62ea9d3c` |
| Neurons & myelin | `#lesson-02` | 369–518 | `0ea84201a6ae183b7a3bb4ecdceb98c24b3703b5ad5999525a0d5d082bb57643` |
| Pathways & reflexes | `#lesson-03` | 519–679 | `ec297bb0523c652595051ea9bbf79f5f50eacc1ae46f1549c94f424249b7ccd9` |

Do not regenerate the canonical workspace using retired initializer, intake or Pilot 2 builders.

---

## 2. Immutable required-check bindings

All six required items remain written-only. Do not rename, split, rewrite, regrade, auto-grade, gate with new MC items, or reuse their IDs for new content.

### Lesson 01 — `practice-overview`

Activity attributes: `data-activity="practice-overview"`, `data-activity-mode="writing"`, required check.

| Question ID | Exact prompt | Written field / data-writing | Limit | Existing reader page |
|---|---|---|---:|---|
| `source-checkpoint-1` | `Define homeostasis.` | `source-checkpoint-1-written` | 3200 | printed 367 / PDF 8 |
| `source-checkpoint-2` | `Explain why the nervous system is critical for maintaining homeostasis.` | `source-checkpoint-2-written` | 3200 | printed 367 / PDF 8 |
| `source-checkpoint-3` | `Create a table to identify the different systems in the nervous system and explain the structure and function of each.` | `source-checkpoint-3-written` | 3200 | printed 367 / PDF 8 |

### Lesson 02 — `practice-neuron-structure`

Activity attributes: `data-activity="practice-neuron-structure"`, `data-activity-mode="writing"`, required check.

| Question ID | Exact prompt | Written field / data-writing | Limit | Existing reader page |
|---|---|---|---:|---|
| `source-checkpoint-7` | `Draw a neuron, label its basic structures, and identify their functions.` | `source-checkpoint-7-written` | 3200 | printed 372 / PDF 13 |

No image/photo-upload control exists or is proposed. Paper/personal-notes drawing + typed label/function account is the authored workflow.

### Lesson 03 — `practice-reflexes`

Activity attributes: `data-activity="practice-reflexes"`, `data-activity-mode="writing"`, required check.

| Question ID | Exact prompt | Written field / data-writing | Limit | Existing reader page |
|---|---|---|---:|---|
| `source-checkpoint-4` | `Compare the basic function of neurons and glial cells.` | `source-checkpoint-4-written` | 3200 | printed 370 / PDF 11 |
| `source-checkpoint-6` | `Identify the basic neural pathway that is involved as you dodge a wayward tennis ball. Compare this pathway with a withdrawal reflex.` | `source-checkpoint-6-written` | 3200 | printed 370 / PDF 11 |

Native learner controls to preserve: **Open check → Start → Written response → Save written response → Submit and finish**. Writing is not automatically graded. Redo/history behaviour must remain native.

---

## 3. Reader bindings and exact page mapping

The Chapter 11 source uses **printed page = PDF page + 359**.

### Lesson 01 retained reader bindings

- primary optional reading: printed pp. 367–371;
- `Open at p. 367` → PDF p. 8;
- required-check source references to printed p. 367 → PDF p. 8;
- existing Launch Lab support to printed p. 371 → PDF p. 12 may remain.

### Lesson 02 retained reader bindings

- `Open at p. 372` → PDF p. 13;
- figure/reference page for neuron drawing → printed p. 372 / PDF p. 13.

### Lesson 03 retained reader bindings

- `Open at p. 370` → PDF p. 11;
- existing p. 371 investigation link → PDF p. 12;
- required-check references → printed p. 370 / PDF p. 11.

Reader links remain optional support. Do not restore obsolete “read textbook first” wording.

---

## 4. Vocabulary bindings

Canonical vocabulary owner: `current-course/data/vocabulary-and-schema.json`.

Preserve existing contextual `bio-term` links, routes and word-owned Frayer/Process Collection behaviour. Vocabulary popups support the teaching; they do not replace the authored explanation.

### Lesson 01 core vocabulary used

homeostasis · response · CNS · PNS · sensory input · integration · motor output · effector · electrochemical message · hormone · neuron · glial cell · nerve, plus authored contextual orientation for sensory/afferent, motor/efferent, somatic, autonomic, sympathetic and parasympathetic.

### Lesson 02 core vocabulary used

neuron · dendrite · cell body · axon · axon terminal · synapse · myelin · node of Ranvier · action potential · saltatory conduction · effector · CNS · PNS. Do not create duplicate vocabulary ownership merely because learner copy adds oligodendrocyte context.

### Lesson 03 core vocabulary used

stimulus · receptor · sensory neuron · interneuron · motor neuron · effector · response · reflex · reflex arc · neuron · cell body · CNS · claim.

---

## 5. Existing media and assets — retain in place

### Lesson 01 video

- Section class currently includes `video-companion required-media`.
- `data-video="qPix_X-9t7E"`
- URL: `https://www.youtube.com/watch?v=qPix_X-9t7E`
- Playback/transcript: **UNVERIFIED**.
- Authoring treatment: optional support only; lesson remains self-teaching if blocked.
- Integration caution: preserve binding/controls; do not infer that the historical class name `required-media` means the learner must watch it before progressing.

### Lesson 02 neuron asset

Path: `assets/source/integrated-neuron.png`

Existing alt: `A labelled neuron showing dendrites, soma, nucleus, axon, myelin sheath, nodes of Ranvier, axon terminals, and supporting glial cells.`

Existing caption: `Read from dendrites to axon terminals. This is a simplified illustration of a typical multipolar neuron, not every neuron shape.`

Status: existing source asset; inspected for draft authoring; **not newly teacher-approved**.

Actual elements referenced by manuscript:
- orange neuron/dendritic tree and axon;
- labels Dendrites, Cell body (soma), Nucleus, Axon hillock, Axon, Myelin sheath, Nodes of Ranvier, Axon terminals;
- large teal `Direction of information flow (from dendrites to axon terminals)` arrow;
- glial inset labelled Astrocyte, Oligodendrocyte, Microglial cell.

Do not modify asset or locked relationships in this handoff.

### Lesson 02 myelin asset

Path: `assets/source/integrated-myelin.png`

Existing alt: `A comparison of continuous conduction in an unmyelinated axon and saltatory conduction in a myelinated axon.`

Existing caption: `Compare where the impulse is regenerated. The arrows are a shorthand: the axon remains continuous beneath the sheath. Schwann cells shown here form peripheral myelin; CNS myelin is made by oligodendrocytes.`

Status: existing source asset; inspected for draft authoring; **not newly teacher-approved**.

Actual elements referenced:
- Panel A `Unmyelinated axon — continuous conduction`;
- Panel B `Myelinated axon — saltatory conduction`;
- orange directional arcs/highlighted node positions;
- labels `Node of Ranvier (gap in myelin)`, `Schwann cell (forms myelin sheath)`, `Myelin sheath (multiple layers of membrane)`, `Axon`;
- teal bottom direction-of-conduction arrows;
- bottom messages about faster conduction and damage to myelin.

### Lesson 02 video

- `data-video="A44brRGG4Ys"`
- URL: `https://www.youtube.com/watch?v=A44brRGG4Ys`
- Playback/transcript: **UNVERIFIED**; optional support only.

### Lesson 03 withdrawal asset

Canonical path: `assets/source/integrated-withdrawal.svg`

Existing alt: `Trace the withdrawal pathway first, then follow the separate route carrying information toward the brain.`

Existing caption: `Follow the spinal withdrawal circuit, then the separate path toward the brain. This is a simplified pathway, not a scale drawing or the wiring of every reflex.`

Status: existing source asset; inspected for draft authoring; **not teacher asset approval**.

Actual rendered relationships referenced:
- `Stimulus` red-brown arrow;
- `Receptor in skin`;
- orange `Sensory neuron` route into `Spinal cord (CNS)`;
- labelled `Interneuron`;
- teal `Motor neuron` route to `Effector: muscle`;
- response text `Response: the muscle contracts and the hand withdraws.`;
- dashed grey route `Information also travels to the brain.`;
- bottom sequence `Receptor → sensory neuron → interneuron → motor neuron → effector.`

The extracted PNG used for inspection is not a replacement asset. Keep the canonical SVG.

### Lesson 03 videos

- `data-video="aaQWxko6qmk"` → `https://www.youtube.com/watch?v=aaQWxko6qmk`
- `data-video="4WcZR_k_a0I"` → `https://www.youtube.com/watch?v=4WcZR_k_a0I`
- Playback/transcripts: **UNVERIFIED**; optional support only; no timestamps authored.

---

## 6. New media briefs

### Proposed L01 board visual — nervous-system hierarchy

**Status: NOT PRODUCED / NOT REVIEWED.**

Teaching question: “How are the major nervous-system divisions nested, and which way does information move?”

Required relationships:

`Nervous system`
- `Central nervous system (CNS)` → `brain`, `spinal cord`
- `Peripheral nervous system (PNS)`
  - `sensory / afferent pathways` → arrows toward CNS
  - `motor / efferent pathways` → arrows away from CNS
    - `somatic nervous system` → skeletal muscle
    - `autonomic nervous system`
      - `sympathetic division`
      - `parasympathetic division`

Caption concept: CNS/PNS is anatomical; sensory/motor describes information direction; somatic/autonomic subdivides motor output. Somatic must not be labelled “always conscious.”

Accessibility: full equivalent information is already authored as text tree + table, so this image is enhancement rather than a blocking placeholder.

### Proposed L03 board visual — selected response versus spinal withdrawal

**Status: NOT PRODUCED / NOT REVIEWED.**

Teaching question: “What is shared, and what changes, between a deliberately selected sensory-motor response and a spinal withdrawal reflex?”

Left route:
`receptor → sensory route → brain/CNS integration + response selection → somatic motor route → skeletal muscle → selected movement`

Right route:
`receptor → sensory neuron → spinal integration/interneuron in shown example → motor neuron → skeletal muscle → withdrawal`
plus separate arrow `information also travels toward brain`.

Accessibility: manuscript comparison table contains the complete equivalent teaching. No release should depend on a missing image.

---

## 7. Proposed teaching-block order for integration

This is declarative ordering only, not implementation code.

### `#lesson-01`

Preserve existing shell in place:
1. Learn · Chapter 11 / title.
2. Side-by-side **Learning goal / Before you begin**.
3. Existing `How to complete this lesson` disclosure container, replacing obsolete generic MC language with lesson-specific written-check instructions from manuscript.
4. Existing optional embedded-reading block and vocabulary system.
5. Replace/expand current teaching body with manuscript sequence:
   - homeostasis as workable-range regulation;
   - communication pathway;
   - fully worked thermoregulation example;
   - non-homeostatic nervous response contrast;
   - accessible nervous-system hierarchy tree + structure/function table;
   - two guided self-checks;
   - neuron/glia/nerve preview;
   - independent interrupted-control transfer;
   - retained optional video support;
   - required-check preparation.
6. Preserve `practice-overview` and its three immutable written questions exactly.
7. Closing/bridge to `#lesson-02`.

### `#lesson-02`

Preserve shell, reader, vocabulary, assets and video. Proposed order:
1. Learning goal / Before you begin.
2. Accurate completion disclosure.
3. Optional p. 372 reading.
4. One-cell communication model and structure/function table.
5. Existing `integrated-neuron.png` + deliberate visual-reading prose.
6. Brief action-potential definition only; defer ion mechanism.
7. Myelin / Schwann-PNS / oligodendrocyte-CNS explanation.
8. Existing `integrated-myelin.png` + deliberate comparison reading.
9. Fully worked myelinated-versus-unmyelinated reasoning.
10. Two guided self-checks.
11. Qualified MS application.
12. Independent demyelination transfer.
13. Retained optional video.
14. Drawing-check preparation with paper/personal-notes + typed account instruction.
15. Preserve `practice-neuron-structure` / `source-checkpoint-7` exactly.
16. Closing/bridge to `#lesson-03`.

### `#lesson-03`

Preserve shell, reader, vocabulary, SVG, two videos and required check. Proposed order:
1. Learning goal / Before you begin.
2. Accurate completion disclosure.
3. Optional pp. 370–371 reading.
4. Sensory/interneuron/motor jobs.
5. Concise job-versus-shape qualification.
6. Fully worked phone-sliding deliberately selected response.
7. Fully worked spinal withdrawal response.
8. Existing `integrated-withdrawal.svg` + precise reading moves.
9. Accessible two-pathway comparison table.
10. Two anti-overgeneralization notes: interneuron not universal; reflex not always spinal.
11. Neuron/glia retrieval.
12. Guided withdrawal trace.
13. Independent buzzer/raise-hand transfer.
14. Retained optional videos.
15. Required-check preparation.
16. Preserve `practice-reflexes` / `source-checkpoint-4` and `source-checkpoint-6` exactly.
17. Closing/bridge to `#lesson-04`.

---

## 8. New formative item registry

No new item below is a required check. No existing checkpoint ID is reused.

| Proposed ID | Lesson | Mode in manuscript | Persistence |
|---|---|---|---|
| `ch11-l01-guided-sensory-direction-v1` | 01 | guided notes + hint + reveal solution | none |
| `ch11-l01-guided-somatic-classification-v1` | 01 | guided notes + hint + reveal solution | none |
| `ch11-l01-independent-control-interruption-v1` | 01 | independent notes + reveal model | none |
| `ch11-l02-guided-structure-flow-v1` | 02 | guided notes + hint + reveal solution | none |
| `ch11-l02-guided-node-correction-v1` | 02 | guided notes + hint + reveal solution | none |
| `ch11-l02-independent-demyelination-v1` | 02 | independent notes + reveal model | none |
| `ch11-l03-guided-withdrawal-trace-v1` | 03 | guided notes + hint + reveal solution | none |
| `ch11-l03-independent-buzzer-selected-response-v1` | 03 | independent notes + reveal model | none |

If later review asks for saved formative response fields, native-owner integration is **PENDING** and must use the existing state owner. Do not create another persistence/state system.

---

## 9. Preservation requirements for Codex integration

Preserve without behavioural redesign:

- side-by-side Learning goal / Before you begin;
- current guide/disclosure placement;
- typography, colours and navigation;
- existing textbook reader and page-target semantics;
- vocabulary IDs, routes, Frayer/Process Collection ownership;
- existing image paths, SVG, video IDs/URLs and load controls;
- all six required activities/questions/written fields and 3200-character limits;
- Save written response / Submit and finish / Redo / All My Work behaviour;
- current required-progress semantics;
- current state/history namespaces and native owner;
- student-work preservation;
- accessibility behaviour;
- established SCORM path.

**Namespace limitation in the authoring packet:** the provided evidence identifies immutable writing IDs and required-check bindings but does not enumerate a standalone string name for every internal state/history namespace. Therefore, integration must preserve the canonical implementation in place and must not infer, rename or recreate namespace keys from this document. Inspect the canonical runtime during implementation and treat existing state/history keys as immutable.

No new global Save & Exit, upload control, runtime, grading system, completion gate or state owner is authorized.

---

## 10. Curriculum coverage map

Official source: `Alberta_Program_Unit_A1_Original_Excerpt.pdf`, physical pp. 51–53 / excerpt PDF pp. 1–3.

| Outcome | First-batch relationship |
|---|---|
| General Outcome 1 — explain how the nervous system controls physiological processes | Central organizing outcome for all three manuscripts. |
| `30–A1.1k` — neuron/myelin, action potential, all-or-none/intensity, synapse, named transmitters/chemicals | Lesson 02 provides neuron/myelin foundation only. Lessons 04–06 are still required for the rest. **Not completed in this batch.** |
| `30–A1.2k` — principal CNS/PNS structures and voluntary/autonomic regulation | Lesson 01 provides hierarchy orientation only. Lessons 08–10 are still required for detailed structures/functions. **Not completed in this batch.** |
| `30–A1.3k` — organization of neurons into nerves and composition/function of reflex arcs using an example | Lessons 01–03 together provide substantial conceptual coverage: nerve versus neuron, pathway roles and withdrawal reflex. Full course acceptance remains pending. |
| `30–A1.2s` — design and perform investigation of reflex arcs | Optional textbook Investigation 11.A is linked, but this online manuscript does not itself design/perform the investigation. **Do not claim skill completion.** |

---

## 11. Source conflicts resolved for this draft

### Homeostasis

- Historical teacher key uses “constant internal environment” but also notes dynamic equilibrium.
- Draft uses **regulated workable range / relative stability**, avoiding perfect-constancy language.

### Temperature sensing and sweating

- Textbook p. 366 supplies temperature/homeostasis context but is not used to claim all sensing is peripheral.
- Current verification: OpenStax §16.3 identifies both peripheral surface-temperature sensing and central core-temperature sensing; NCBI temperature-regulation reference supports sweat evaporation as heat loss.

### Somatic ≠ always conscious

- Textbook/older course language may equate somatic with voluntary too strongly.
- Current verification: OpenStax Anatomy & Physiology 2e describes somatic output as skeletal-muscle control and explicitly notes somatic reflexes can occur without conscious decision.

### Myelin-producing cells

- Teacher slide 10 generalizes Schwann cells too broadly.
- Draft: Schwann cells = PNS myelin; oligodendrocytes = CNS myelin.

### Saltatory “jumping”

- “Jumping” retained only as shorthand after continuous-axon/regeneration explanation.

### Grey/white matter

- Teacher slide 12 and textbook p. 372 are not used to teach a binary “myelinated neurons = white / unmyelinated neurons = grey” rule.
- Detailed tissue composition remains for later CNS teaching.

### Regeneration

- Teacher slide 12's myelinated/unmyelinated regeneration binary is omitted as misleading.

### Multiple sclerosis

- Teacher slide 14's “genetic disorder” and simple inevitable age-progressive framing are omitted.
- Draft uses current multifactorial/immune-mediated framing and variable course.

### Reflexes

- Teacher slide 20's universal spinal-bypass statement is narrowed to the spinal withdrawal example.
- Pupillary light reflex is used only as a brief counterexample showing that not every reflex is spinal.
- Teacher slide 18's note that some reflexes lack an interneuron is retained.

### Historical teacher key Q6

- The historical key calls the tennis-ball dodge a withdrawal reflex and routes it through the spinal cord.
- Current required prompt is preserved unchanged, but teacher-only marking guidance in Lesson 03 treats a deliberately selected visually guided dodge as receptor → sensory route → CNS/brain integration → somatic motor route → skeletal muscle, then compares it with a spinal withdrawal reflex.
- No automatic learner feedback is attached to this correction.

---

## 12. External verification references

Retrieved 2026-10-02. These are teacher/developer verification sources, not learner-facing required readings.

1. OpenStax, *Introduction to Behavioral Neuroscience*, §16.3 Neural Control of Core Body Temperature  
   https://openstax.org/books/introduction-behavioral-neuroscience/pages/16-3-neural-control-of-core-body-temperature
2. StatPearls / NCBI Bookshelf, *Physiology, Temperature Regulation*  
   https://www.ncbi.nlm.nih.gov/books/NBK507838/
3. OpenStax, *Anatomy and Physiology 2e*, §12.1 Basic Structure and Function of the Nervous System  
   https://openstax.org/books/anatomy-and-physiology-2e/pages/12-1-basic-structure-and-function-of-the-nervous-system
4. OpenStax, *Anatomy and Physiology 2e*, §14.3 Motor Responses  
   https://openstax.org/books/anatomy-and-physiology-2e/pages/14-3-motor-responses
5. OpenStax, *Anatomy and Physiology 2e*, §15.2 Autonomic Reflexes and Homeostasis  
   https://openstax.org/books/anatomy-and-physiology-2e/pages/15-2-autonomic-reflexes-and-homeostasis
6. NCBI Bookshelf, *Basic Neurochemistry — The Myelin Sheath*  
   https://www.ncbi.nlm.nih.gov/books/NBK27954/
7. MedlinePlus Genetics, *Multiple sclerosis*  
   https://medlineplus.gov/genetics/condition/multiple-sclerosis/
8. StatPearls / NCBI Bookshelf, *Neuroanatomy, Pupillary Light Reflexes and Pathway*  
   https://www.ncbi.nlm.nih.gov/books/NBK553169/

---

## 13. Current status / acceptance boundary

- Source inventory: **available for this first batch**.
- Progression: reviewed by user as input to this manuscript phase; not a teacher-acceptance claim.
- Manuscripts: **DRAFT v1**.
- New media: hierarchy and comparison visuals **NOT PRODUCED / NOT REVIEWED**; essential teaching does not depend on them.
- Existing media: retained; playback of existing videos **UNVERIFIED**.
- Integration: **NOT STARTED / NOT AUTHORIZED**.
- Technical testing: **NOT STARTED**.
- Brightspace/SCORM testing: **NOT STARTED**.
- Dean teacher acceptance: **NOT REQUESTED / NOT GRANTED**.
- Chapter 19 calibration: **NOT STARTED**.

