# Biology 30 — Chapter 11 First-Batch Conceptual Progression v1

**Status:** DRAFT — conceptual progression only. No learner manuscripts have been authored or approved.

**Current-source binding:** `codex/math-engine-preflight` at revision `ecc1b806630cb33b9942e64eb676a1f8568c007e`; source-tree SHA-256 `0e89c19b8db652abffc5a8837e084b7e84eb30be888057c8ccdf2e2efe33ba52`.

**Scope of this document:** establish the Chapter 11 story and the detailed conceptual sequence for `lesson-01`, `lesson-02`, and `lesson-03`. This document does not modify HTML, create a runtime, change assessments, generate images, or claim later lessons have been authored/audited.

---

## 1. Attachment readability and evidence actually inspected

All nine supplied attachments were readable in this session.

| Attachment | Readable? | What was inspected |
|---|---|---|
| `CH11_FIRST_BATCH_CONTEXT.md` | Yes | Current revision binding, lesson order, complete current copy for lessons 01–03, preservation constraints, supplied teaching standard, historical slide extracts. |
| `CH11_FIRST_BATCH_EVIDENCE.json` | Yes | Exact lesson locators, required activity/question IDs, written-field IDs, textbook links, slide associations, media records, captions, statuses, vocabulary bindings and preservation records. |
| `Chapter11_Original_Textbook.pdf` | Yes | Actual PDF pages 7–13 for printed pp. 366–372, including Figures 11.3–11.9, Table 11.1, withdrawal-reflex figures and Investigation 11.A. Printed page = PDF page + 359 was kept explicit. |
| `Chapter11_Original_Teacher_Notes.pptx` | Yes | Relevant slides 4–20, including the actual slide visuals and text for neuron structure, myelin, MS, neuron types, pathway and reflex claims. |
| `Alberta_Program_Unit_A1_Original_Excerpt.pdf` | Yes | Physical pages 1–3 of the supplied excerpt, corresponding to original program pp. 51–53; verified General Outcome 1 and specific codes 30–A1.1k, 30–A1.2k, 30–A1.3k plus relevant skill/STS codes. |
| `Chapter11_Teacher_Only_Comprehension_Key.pdf` | Yes | Actual pages containing Q1–Q8 guidance, including the systems table, neuron/glia comparison, tennis-ball answer and neuron/myelin drawing guidance. |
| `integrated-neuron.png` | Yes | Full existing image: neuron structure, information-flow arrow and glial-cell inset. |
| `integrated-myelin.png` | Yes | Full existing image: unmyelinated versus myelinated conduction, Schwann cell/node labels and damage callout. |
| `CH11_EXISTING_WITHDRAWAL_DIAGRAM.zip` | Yes | ZIP contents extracted; `integrated-withdrawal.svg` and `SOURCE_NOTE.txt` inspected, and the SVG was rendered to inspect the actual figure. |

No attachment in this batch is being treated as unreadable or substituted with an inferred local path.

---

# PART A — PROPOSED LEARNER PROGRESSION

## 2. Chapter 11 central story

### Central biological question

**How does the nervous system detect change, move information through specialized cells and pathways, and coordinate responses quickly enough to control physiological processes and help maintain homeostasis?**

This is stronger than treating Chapter 11 as a vocabulary sequence. It creates a problem that each lesson solves one part of:

**detect a change → carry information → process it → send instructions → produce a response → regulate the body**

The chapter then repeatedly zooms in and out:

- whole-body communication problem,
- individual neuron,
- neural pathway,
- membrane electrical mechanism,
- synapse between cells,
- effects of chemicals on signalling,
- PNS/CNS organization,
- brain structures and evidence.

The story should therefore feel like one explanation becoming more detailed, rather than twelve separate mini-articles.

### Actual prerequisite knowledge

The official Unit A excerpt says the unit builds on Grade 8 Cells and Systems, Science 10 Cycling of Matter in Living Systems and Biology 20 Human Systems. The textbook preparation specifically assumes prior understanding of human systems, homeostasis and the flow of matter in living systems.

For Chapter 11, the practical prerequisite set is:

- organisms are made of specialized cells organized into tissues, organs and systems;
- body systems interact rather than operate independently;
- **homeostasis** means maintaining internal conditions within workable ranges rather than holding every variable perfectly constant;
- a **stimulus** is a change and a **response** is what the body does following that change;
- basic cell structure, a cell membrane, concentration differences and membrane transport are background knowledge that will become important when lessons 04–05 reach resting potential and action potentials.

The first three lessons should not assume that students already know CNS/PNS subdivisions, neuron morphology, reflex circuitry, saltatory conduction or detailed ion movement. Those are teaching targets, not prerequisites.

### Chapter 11 destination

By the end of required Lesson 12, a learner should be able to explain, using biological cause-and-effect rather than isolated definitions:

1. how a change can be detected and converted into sensory input, integrated in the nervous system, and followed by motor output to an effector;
2. how neuron structures support receiving, integrating and transmitting information, and how myelin changes conduction;
3. how the membrane of a neuron establishes a resting potential and how an action potential is initiated, propagated and limited by threshold/all-or-none and refractory behaviour;
4. how information passes across synapses, how excitatory and inhibitory inputs contribute to whether a postsynaptic neuron fires, and how relevant neurotransmitters/enzymes fit the Alberta scope;
5. how chemicals or drugs can alter neural communication at the synapse;
6. how neurons are organized into pathways and nerves, including the composition and function of a reflex arc and the distinction between a spinal withdrawal response and a voluntary response;
7. how the PNS and CNS are organized, including somatic/autonomic and sympathetic/parasympathetic control;
8. how the required major brain structures contribute to nervous-system control and how evidence/technology is used to investigate nervous-system function.

The optional extension can deepen application to stress, experience and addiction, but it should not become hidden required teaching for the twelve required chapter checks.

---

## 3. Role of all existing Chapter 11 lessons in the actual order

These roles describe the proposed chapter story. Lessons 04–13 are not being claimed as audited or manuscript-ready in this batch.

| Order | Existing route | Existing title | Role in the chapter story |
|---|---|---|---|
| 1 | `lesson-01` | Nervous communication | Establish the problem the nervous system solves: detect change, integrate information and coordinate responses that support homeostasis. Give students the minimum whole-system map needed to understand later lessons and the preserved systems-table check. |
| 2 | `lesson-02` | Neurons & myelin | Zoom from the whole system to its communication cell. Explain how neuron structures create directional information flow and how glial-produced myelin changes conduction speed. |
| 3 | `lesson-03` | Pathways & reflexes | Connect individual neurons into functional routes. Distinguish sensory, interneuron and motor jobs; compare a voluntary response with a spinal withdrawal reflex; establish receptor-to-effector tracing. |
| 4 | `lesson-04` | The resting neuron | Ask how a neuron can be electrically ready before a message arrives. Establish resting membrane potential, ion distributions, selective permeability and the sodium-potassium pump as starting conditions. |
| 5 | `lesson-05` | Action potentials | Turn the resting membrane into a travelling electrical event. Teach threshold, depolarization, repolarization, refractory behaviour, all-or-none response, stimulus intensity and propagation. |
| 6 | `lesson-06` | Synapses & summation | Solve the next problem: the axon ends, but communication must continue. Teach chemical synaptic transmission and how multiple excitatory/inhibitory inputs influence postsynaptic firing. |
| 7 | `lesson-07` | Drugs at the synapse | Apply the synaptic mechanism. Analyze how changing release, receptors, reuptake or breakdown changes signalling; connect mechanism to drug/neurotoxin effects without replacing biology with drug lists. |
| 8 | `lesson-08` | Peripheral control | Scale back up to the PNS. Deepen the orientation introduced in Lesson 1: sensory versus motor routes, somatic versus autonomic control, and sympathetic versus parasympathetic regulation. |
| 9 | `lesson-09` | Central control | Shift to the CNS as integration/control tissue, with the spinal cord as a communication and processing route. This is the proper place for a fuller treatment of CNS tissue organization such as grey/white matter. |
| 10 | `lesson-10` | The brain | Map the required brain structures to functions and connect them to voluntary/involuntary regulation rather than presenting an isolated anatomy list. |
| 11 | `lesson-11` | Studying the brain | Use evidence, investigations and technology to show how claims about brain function are established and limited. Exact STS/skills coverage must be confirmed when this lesson receives its own source-grounded authoring pass. |
| 12 | `lesson-12` | Chapter review and final check | Reassemble the chapter: stimulus → pathway → neuron mechanism → synapse → system organization → brain/CNS/PNS control. Review should emphasize explanation and transfer rather than term recognition alone. |
| 13 | `lesson-13` | Stress, experience and addiction — optional extension | Apply neural signalling/control to a richer context and potentially preview later nervous/endocrine interaction. It remains optional unless a separate decision changes course requirements. |

The chapter therefore has six natural movements:

**I. Why communicate?** Lesson 1  
**II. What carries the message?** Lessons 2–3  
**III. How does the electrical message work?** Lessons 4–5  
**IV. How does one cell affect the next?** Lessons 6–7  
**V. How is control organized at body scale?** Lessons 8–10  
**VI. How do we know and apply it?** Lessons 11–13

---

# 4. `lesson-01` — Nervous communication

## Proposed learner-facing conceptual path

### Opening phenomenon/question

**Phenomenon:** You leave a warm building into a very cold Alberta day. Your body begins adjusting before you deliberately plan each change.

**Opening question:** **How can your body detect a change, decide what matters, and coordinate a response quickly enough to keep internal conditions workable?**

This establishes homeostasis as the reason for communication before introducing system names.

### Exact prerequisite knowledge for this lesson

Students need only:

- body systems contain specialized structures/cells;
- a stimulus is a change and a response follows a change;
- prior Biology 20 familiarity with homeostasis as maintaining a stable internal environment within limits.

Do **not** assume that students know CNS/PNS subdivisions, afferent/efferent terminology or sympathetic/parasympathetic physiology.

### Dependency-ordered teaching chunks

#### Chunk 1 — The control problem: conditions change

Instructional job: establish why a rapid control system is needed.

Teach homeostasis as **relative/dynamic stability**, not a perfectly fixed state. Use one concrete variable such as body temperature to show that a change matters because cells and organs work best within limited conditions.

The student should leave this chunk able to answer: *What is the nervous system trying to protect or regulate?*

#### Chunk 2 — Build the communication loop before naming divisions

Instructional job: give students the core causal sequence.

Build the route in this order:

**stimulus → receptor/detection → sensory input → integration → motor output → effector → response**

The key distinction is between information entering the control system and instructions leaving it. “Integration” should be explained as processing the incoming information and organizing an appropriate output, not simply defined as “processing.”

This sequence becomes the backbone reused in Lessons 2, 3, 8 and 9.

#### Chunk 3 — Worked reasoning: a homeostatic response

Use one complete example, such as body temperature rising during physical activity.

Model the reasoning explicitly:

1. identify the change;
2. identify a receptor/detection step;
3. show sensory information travelling toward the CNS;
4. explain that the CNS integrates the information;
5. show motor output leaving the CNS;
6. identify effectors such as sweat glands and blood-vessel smooth muscle;
7. state how the resulting response helps move conditions back toward a workable range.

The purpose is not to teach detailed thermoregulation. It is to make “nervous system maintains homeostasis” causally meaningful before students face `source-checkpoint-2`.

#### Chunk 4 — Orient the student inside the nervous-system hierarchy

Instructional job: teach enough organization for the unchanged systems-table check without consuming Lesson 8.

A concise hierarchy is required **now**:

**Nervous system**  
→ **CNS:** brain + spinal cord; integration/processing/control  
→ **PNS:** nerves/routes connecting receptors and effectors with the CNS  
→ **sensory/afferent routes:** information toward the CNS  
→ **motor/efferent routes:** instructions away from the CNS  
→ motor side includes **somatic** and **autonomic** control  
→ autonomic includes **sympathetic** and **parasympathetic** divisions

Only the organizing logic belongs here. Detailed organ effects, fight-or-flight/rest-and-digest patterns and neurotransmitter detail remain for Lesson 8.

The learner should understand the nesting and direction, not memorize a list of disconnected labels.

#### Chunk 5 — Preview the cells without stealing Lesson 2

Instructional job: prepare the next zoom level and support the Lesson 3 glia comparison.

Introduce three distinctions only:

- a **neuron** is an information-handling cell;
- **glial cells** support neural function in several ways;
- a **nerve** is a macroscopic bundle of nerve fibres/axons, not a single neuron.

Do not turn this into detailed neuron anatomy; that is the next lesson.

### Necessary visual-reading moves

**Essential new media needed:** a clean in-course board-style organization diagram for Lesson 1. It should not depend on the optional textbook viewer.

The student should be guided through it in stages rather than shown a finished hierarchy with no explanation:

1. first reveal CNS versus PNS;
2. identify the physical structures belonging to each;
3. add sensory arrows pointing **toward** the CNS and motor arrows pointing **away**;
4. split the motor route into somatic and autonomic;
5. split autonomic into sympathetic and parasympathetic, explicitly marking these as an orientation that will be taught in detail later.

A second, very small flow strip can show **stimulus → receptor → CNS → effector → response**, but it should visually distinguish “where information travels” from “how the nervous system is subdivided.”

The existing textbook Figure 11.3 on printed p. 367/PDF p. 8 is a useful source model, but optional textbook access cannot carry essential online teaching.

### Fully modelled reasoning opportunity

**Model:** increasing body temperature during exercise.

The worked example should require the teacher voice to justify each arrow in the pathway rather than simply display the finished chain. The concluding reasoning should connect the response to homeostasis.

### Meaningful contrast

Contrast two communication systems only as orientation:

- nervous signalling: fast electrochemical communication through neural pathways;
- endocrine signalling: hormones carried in blood, generally slower and longer-lasting.

Keep this short. Chapter 13 owns the full comparison.

A second useful contrast is **voluntary action versus automatic regulation** to establish that the nervous system is not limited to conscious movement.

### Guided attempt

Give a partially scaffolded scenario: a student waits outside in cold conditions and their body begins conserving/producing heat.

Provide the pathway labels and ask the learner to place or explain the **stimulus, sensory input, integration, motor output, effector and response**. A hint should remind them that an effector is the structure that actually carries out the response.

The complete solution should explain the reasoning, not merely display the sequence.

### Fresh independent transfer

Use a different scenario: after sustained activity in a warm gym, body temperature rises and sweating increases.

The learner independently explains the communication route and how the response supports homeostasis. This is not the required check and should not alter required progress semantics.

### Closing answer

**The nervous system contributes to homeostasis by detecting internal or external change, carrying sensory information into the CNS, integrating that information, and sending motor output to effectors that produce a response.**

### Bridge to Lesson 2

**We now know the route information must travel. Next question: what kind of cell can receive, carry and pass that information — sometimes over very long distances?**

---

# 5. `lesson-02` — Neurons & myelin

## Proposed learner-facing conceptual path

### Opening phenomenon/question

**Phenomenon:** Some human motor and sensory axons extend a very long distance through the body, yet information must still travel quickly enough to coordinate movement and sensation.

**Opening question:** **How can one microscopic cell receive information, carry it over distance and pass it onward quickly enough to be useful?**

### Exact prerequisites

Students should already understand from Lesson 1:

- stimulus → sensory input → integration → motor output → effector;
- CNS versus PNS at an orientation level;
- a neuron is one cell, while a nerve contains many nerve fibres;
- receptors detect change and effectors carry out responses.

They also need basic cell knowledge: nucleus/organelles and the idea that structure supports function.

They do **not** need resting potential, Na+/K+ movement or the detailed action-potential mechanism yet.

### Dependency-ordered teaching chunks

#### Chunk 1 — One neuron has a directional job

Instructional job: establish the common functional plan before adding terminology.

Use the existing `integrated-neuron.png` and trace left-to-right:

**dendrites → cell body (soma) → axon/initial region → axon → axon terminals**

Teach each part as a structure-function relationship:

- branching dendrites provide receiving surface;
- the soma contains the nucleus/organelles and maintains the cell while integrating incoming information;
- the axon carries the electrical signal away from the soma;
- terminals allow the neuron to affect the next cell.

The synapse should be previewed only as the junction where information passes to another cell. Lesson 6 owns the chemical mechanism.

#### Chunk 2 — Teach the student how to read the neuron image

Instructional job: prevent the labelled figure from functioning as decoration.

Explicit visual-reading sequence:

1. locate the dendritic tree on the receiving side;
2. find the soma and nucleus;
3. locate where the single long axon leaves the soma;
4. follow the axon beneath the myelin segments;
5. find the gaps (nodes of Ranvier);
6. end at the branched terminals;
7. follow the large direction-of-information arrow and explain what it summarizes.

State that this is a **simplified typical multipolar neuron**, not the shape of every neuron.

The axon-hillock label may be acknowledged as the region near which action-potential initiation occurs, but the detailed threshold mechanism must be reserved for Lessons 4–5.

#### Chunk 3 — Structure/function reasoning rather than memorizing labels

Work a complete example: “If a neuron must receive information from several nearby cells but send its output a long distance, which features make sense and why?”

Model the reasoning:

- many branches help receive many inputs;
- one long axon is suited to carrying output away over distance;
- terminal branching allows the output to reach target cells.

This is the conceptual preparation for the preserved drawing-and-functions check.

#### Chunk 4 — The long-distance problem introduces myelin

Instructional job: give myelin a reason to exist.

Ask: *If an axon is long, does every part of its membrane need to regenerate the signal in exactly the same way?*

Introduce myelin as a glial-produced insulating sheath around many axons. Teach the location distinction accurately:

- **Schwann cells** form myelin in the **PNS**;
- **oligodendrocytes** form myelin in the **CNS**.

Then identify the **nodes of Ranvier** as gaps between myelin segments.

#### Chunk 5 — Compare continuous and saltatory conduction without teaching Lesson 5 early

Use `integrated-myelin.png` as a comparison.

First read the unmyelinated side: adjacent membrane regions must regenerate the impulse along the axon.

Then read the myelinated side: depolarizing current spreads rapidly beneath the insulating myelin and the action potential is regenerated at nodes of Ranvier. Saltatory conduction is commonly described as the impulse “jumping” node to node, but the axon is continuous and the signal does not teleport across missing pieces.

The learner needs the **relative consequence** — myelination makes conduction faster — without a premature Na+/K+ channel lecture.

#### Chunk 6 — Apply the mechanism to myelin damage

Use the current qualified causal chain:

**myelin damage → disrupted/slower neural signalling → possible changes in sensation or movement depending on the pathway affected**

MS can remain a short biological application of demyelination. Do not teach MS as a purely genetic disease or promise a single inevitable progression pattern.

### Necessary visual-reading moves

#### Existing asset: `integrated-neuron.png`

Use it for the first directional trace and for the neuron/glia distinction. The learner-facing explanation must point to the parts in a deliberate order. The glial inset is useful evidence that “glia” is a category with different roles, but Lesson 2 should not require memorization of astrocyte/microglia subtypes unless the course separately requires it.

#### Existing asset: `integrated-myelin.png`

Use it as a true comparison, not as two pictures to glance at. Ask the student to compare **where the action potential is regenerated**. Explicitly explain that the orange arcs/stars are schematic and that the left panel represents continuous adjacent-membrane regeneration even though the graphic uses separated markers.

No new core visual is essential for Lesson 2 if these two assets remain legible and scientifically constrained by the accompanying copy.

### Fully modelled reasoning opportunities

**Model 1 — structure supports function:** explain why branched dendrites and a long axon suit different parts of the same information route.

**Model 2 — myelination comparison:** given two comparable axons over the same distance, predict that the myelinated axon conducts faster and justify the prediction using nodes/regeneration rather than “the signal skips the axon.”

### Meaningful contrasts

- dendrite versus axon: receiving side versus long-distance output side;
- neuron versus nerve: microscopic cell versus bundle of fibres;
- neuron versus glial cell: information-transmitting cell versus supporting/regulating cells;
- myelinated versus unmyelinated conduction;
- Schwann cell (PNS) versus oligodendrocyte (CNS).

### Guided attempt

Using the existing neuron visual, ask the learner to cover the labels and reconstruct the route from memory: identify dendrites, soma, axon, myelin, node and terminals, then give one function for each. A hint can say, “Start with the large information-flow arrow; ask what must happen at the receiving end, middle and output end.”

### Fresh independent transfer

Scenario: the axon remains physically continuous, but much of its myelin is damaged.

Ask the student to predict what happens to communication speed/reliability and justify the prediction using the contrast between myelinated and unmyelinated conduction. This requires explanation, not term recognition.

### Preparing the unchanged drawing check

Before `source-checkpoint-7`, the lesson should explicitly tell students that the current online check has a written response box but **no new photo-upload control**.

Workable instruction:

- make the neuron drawing on paper or in personal notes;
- label the basic structures on that drawing;
- in the saved written response, list the labelled structures and state the function of each so the required online evidence is preserved.

This supports the existing prompt without changing its ID, adding an upload UI or pretending the text box can receive an image.

### Closing answer

**A neuron’s structures create a directional communication cell: dendrites receive, the soma maintains/integrates, the axon carries the signal away and terminals pass information onward. Myelin insulates many axons and allows faster saltatory conduction by concentrating action-potential regeneration at nodes.**

### Bridge to Lesson 3

**One neuron can carry a message, but a body response requires several cells and structures working in sequence. Next question: how are neurons organized into a complete route from receptor to effector — and why can some routes respond before conscious awareness?**

---

# 6. `lesson-03` — Pathways & reflexes

## Proposed learner-facing conceptual path

### Opening phenomenon/question

Present two superficially similar fast movements:

- you touch a dangerously hot surface and your hand withdraws before you consciously decide to move it;
- you see an object flying toward you and deliberately move out of its way.

**Opening question:** **Both end with muscles moving, so what is different about the information pathway in a withdrawal reflex versus a visually guided voluntary response?**

This opening directly prepares the preserved tennis-ball comparison without giving that exact required response away.

### Exact prerequisites

Students need:

- receptor, sensory input, integration, motor output, effector and response from Lesson 1;
- CNS/PNS orientation and direction of information flow;
- neuron, nerve and glial-cell distinction;
- neuron parts and general signal direction from Lesson 2.

They do **not** need the detailed ionic mechanism of an action potential or detailed synaptic transmission yet.

### Dependency-ordered teaching chunks

#### Chunk 1 — Classify neurons by job before classifying by shape

Instructional job: make the pathway functional.

Teach:

- **sensory (afferent) neuron:** carries information from receptors toward the CNS;
- **interneuron:** processes/relays information within the CNS;
- **motor (efferent) neuron:** carries output from the CNS toward an effector.

Then separately state that **multipolar, bipolar and unipolar describe morphology**, while sensory/interneuron/motor describe function. Do not imply one fixed shape for every functional category.

#### Chunk 2 — Build a generic receptor-to-effector pathway

Use the reusable pattern:

**stimulus → receptor → sensory route → CNS integration → motor route → effector → response**

Work a voluntary example that is **not** the required tennis-ball prompt — for example, seeing a phone begin to slide off a desk and reaching to catch it.

Model the reasoning step by step:

1. visual receptors detect change;
2. sensory information travels to the CNS;
3. the brain integrates the information and a movement is selected;
4. motor output travels to skeletal muscles;
5. the muscles produce the response.

At this level, there is no need to teach the detailed retinal pathway; Chapter 12 owns photoreceptor anatomy.

#### Chunk 3 — A reflex is a special route, not a synonym for every fast reaction

Define a reflex as a rapid, involuntary response generated through a reflex circuit.

Use the existing withdrawal example:

**skin receptor → sensory neuron → spinal integration/interneuron → motor neuron → skeletal-muscle effector → withdrawal**

Explain why this can begin before conscious awareness: the spinal circuit can initiate motor output without waiting for conscious cortical processing, while sensory information also continues toward the brain.

#### Chunk 4 — Teach the withdrawal visual like a board drawing

Use `integrated-withdrawal.svg` in this order:

1. locate the stimulus and receptor in skin;
2. follow the sensory arrow into the spinal cord;
3. identify the central processing/interneuron shown in this example;
4. follow the motor route out to the muscle;
5. identify the muscle contraction/withdrawal response;
6. only then follow the separate dashed route toward the brain.

State explicitly: **this figure is a spinal withdrawal reflex, not a universal diagram of every reflex in the human body.**

#### Chunk 5 — Meaningful comparison: voluntary response versus withdrawal reflex

Build a comparison on common dimensions:

| Dimension | Voluntary visually guided response | Spinal withdrawal reflex |
|---|---|---|
| Detection | receptor detects stimulus | receptor detects potentially harmful stimulus |
| Sensory route | toward CNS | toward spinal cord/CNS |
| Integration emphasized | brain/cortical processing before the selected action | spinal circuit can initiate the response before conscious processing is complete |
| Motor output | selected motor command to skeletal muscle | rapid motor output to withdrawal muscles |
| Conscious decision required before movement? | generally yes for the selected voluntary action | no |
| Does information reach the brain? | yes | yes; awareness can follow the initiated reflex response |

The comparison must avoid “reflex = no brain involvement.”

#### Chunk 6 — Exceptions prevent a false universal rule

Two short qualifications are needed because the preserved sources otherwise invite overgeneralization:

- **not every reflex arc requires an interneuron between the sensory and motor neuron**; the patellar reflex is the useful Grade 12 contrast;
- **not every reflex is a spinal reflex**; some reflex circuits, such as the pupillary light reflex, involve brainstem/midbrain circuitry.

This should be one compact caution, not a detour into neuroanatomy.

#### Chunk 7 — Retrieve neuron versus glial-cell function before the required check

Because `source-checkpoint-4` appears in Lesson 3, the lesson must not assume students remember a one-line mention from Lesson 1.

Use a short retrieval contrast:

- neurons are specialized to receive/conduct/pass information;
- glial cells support neural function, including environmental support, defence/cleanup and myelin production by specific glia.

This is retrieval/reinforcement, not a new long section.

### Fully modelled reasoning opportunities

**Model 1 — voluntary pathway:** a phone begins sliding off a desk; the learner sees it and reaches to catch it. Trace receptor → sensory route → brain integration → motor route → skeletal muscle.

**Model 2 — withdrawal reflex:** hand contacts a dangerously hot surface. Trace the spinal circuit and then the separate route supporting conscious awareness.

The teacher voice must explain why the routes differ, not just show two arrows.

### Meaningful contrasts

- sensory versus motor direction;
- functional neuron type versus neuron shape;
- voluntary response versus spinal withdrawal reflex;
- reflex response versus conscious awareness;
- reflexes with an interneuron versus a reflex circuit that does not require one.

### Guided attempt

Scenario: a student steps on a sharp object.

Provide the pathway frame with two blanks and a hint: “First follow information **toward** the CNS; then follow instructions **away** from the CNS.” Ask the learner to explain how the foot can begin withdrawing before the pain is consciously interpreted.

### Fresh independent transfer

Scenario: a student sees a ruler begin to fall and closes their fingers to catch it.

Ask whether this is best treated as the same kind of spinal withdrawal reflex and require a short pathway explanation. This is deliberately chosen to prevent the common misconception that every rapid reaction-time task is a reflex arc.

The unchanged tennis-ball required check remains another transfer opportunity after this teaching.

### Closing answer

**Nervous-system responses are built from linked roles: receptors detect, sensory routes carry information inward, the CNS integrates, motor routes carry instructions outward and effectors respond. A withdrawal reflex uses a rapid spinal circuit that can initiate movement before conscious processing is complete; a voluntary response such as deliberately dodging a seen object depends on brain integration before the selected movement.**

### Bridge to Lesson 4

**We can now trace where a message goes. The next problem is electrical: before any message starts, how does a neuron create the charge difference that makes an action potential possible?**

---

# PART B — DEVELOPER/SOURCE AND EDITORIAL NOTES

## 7. Required-check reconciliation — exact preserved checks

No prompt, activity ID, question ID, written-field ID, answer limit or grading behaviour is changed in this progression.

| Lesson | Preserved check | What must be explicitly taught before it |
|---|---|---|
| `lesson-01` | `practice-overview` / `source-checkpoint-1`: **“Define homeostasis.”** | Teach homeostasis as relative/dynamic stability within workable internal ranges, not merely the word “constant.” |
| `lesson-01` | `practice-overview` / `source-checkpoint-2`: **“Explain why the nervous system is critical for maintaining homeostasis.”** | Teach the causal chain detection → sensory input → integration → motor output → effector → response, then model one homeostatic example. |
| `lesson-01` | `practice-overview` / `source-checkpoint-3`: **“Create a table to identify the different systems in the nervous system and explain the structure and function of each.”** | The current lesson is too thin if it teaches only CNS and PNS. Teach the concise hierarchy now: CNS/PNS; sensory versus motor direction; somatic/autonomic orientation; sympathetic/parasympathetic as autonomic subdivisions. Detailed organ physiology remains in Lesson 8. |
| `lesson-02` | `practice-neuron-structure` / `source-checkpoint-7`: **“Draw a neuron, label its basic structures, and identify their functions.”** | Teach an actual structure-function walkthrough and give a drawing rehearsal. Because there is no upload control, instruct paper drawing plus a typed list/account of the labelled structures and functions in the existing written field. |
| `lesson-03` | `practice-reflexes` / `source-checkpoint-4`: **“Compare the basic function of neurons and glial cells.”** | Teach neuron versus glia in Lesson 1/2 and retrieve the contrast immediately before the check. |
| `lesson-03` | `practice-reflexes` / `source-checkpoint-6`: **“Identify the basic neural pathway that is involved as you dodge a wayward tennis ball. Compare this pathway with a withdrawal reflex.”** | Teach a generic receptor-to-effector pathway, one different voluntary example, one spinal withdrawal example, and the distinction between conscious brain integration and rapid spinal initiation. Do not teach the tennis-ball dodge itself as a spinal withdrawal reflex. |

All six are written responses. No MC unlock/gate is part of these preserved first-three checks.

### Consequential key conflict for `source-checkpoint-6`

The supplied teacher-only key labels the tennis-ball example as a withdrawal reflex and gives a route through the spinal cord/interneuron. That is not a sound default interpretation of a **visually guided deliberate dodge**. The prompt itself can remain unchanged, but later teacher-facing marking guidance must be reconciled before approval. There is no authored automatic key in the current evidence packet, so this is primarily a pedagogy/marking-reference conflict rather than a runtime-key change.

A scientifically defensible Grade 12 answer should recognize a voluntary visual route in which sensory information is integrated in the brain before the chosen skeletal-muscle response, then contrast that with a spinal withdrawal circuit that can initiate before conscious awareness.

---

## 8. Consequential source conflicts and decisions

These are developer/editorial notes. None of this language should appear as “source correction” commentary in learner copy.

### 8.1 Myelin-producing cells

**Historical slide 10:** says Schwann cells produce the myelin surrounding each axon.  
**Textbook p. 372 / teacher key Q8:** can also be read as giving Schwann cells a CNS myelin role.

**Decision:** do not carry this forward. Teach:

- Schwann cells form myelin in the PNS;
- oligodendrocytes form myelin in the CNS;
- not every axon is myelinated.

The current online Lesson 2 wording already makes the PNS/CNS distinction and should be preserved in substance.

### 8.2 “Jumping” and whether the signal avoids the axon

**Historical slide 10:** “jump” shorthand is followed by wording suggesting the impulse avoids travelling the entire length of the axon.

**Decision:** retain “appears to jump” only as a teaching shorthand after the mechanism is made clear. The axon is continuous; local current spreads under myelin and the action potential is regenerated at nodes of Ranvier. Do not imply teleportation or a physically discontinuous pathway.

The current online text and `integrated-myelin.png` caption already contain a useful qualification.

### 8.3 Grey matter versus white matter

**Historical slide 12 / textbook p. 372:** creates an overly clean contrast of myelinated neurons = white matter and unmyelinated neurons = grey matter.

**Decision:** do not teach that binary in Lesson 2. If a connection is needed, say myelinated axons contribute strongly to white matter and defer full CNS tissue composition to Lesson 9. Grey matter contains neuronal cell bodies, dendrites, synapses, glia and axons; it is not simply “unmyelinated neurons.”

The current Lesson 2 formulation — “myelinated axons contribute to white matter; see Lesson 9 for grey matter composition” — is a good boundary.

### 8.4 Regeneration

**Historical slide 12:** ties regeneration to “myelinated neurons” versus “unmyelinated neurons.”

**Decision:** omit this comparison. Regenerative capacity is not determined by whether an axon is myelinated. Adult PNS axons can regenerate under favourable conditions far more effectively than CNS axons; injury type, neuronal state and the glial/environmental context matter. If regeneration is later added as explicit learner content, it needs a separately sourced, current explanation.

### 8.5 Multiple sclerosis

**Historical slide 14:** calls MS a genetic disorder and implies a simple age-linked worsening path.

**Decision:** do not use those claims. For this lesson, the useful level is the current causal application: MS involves CNS myelin damage/demyelination that can disrupt neural communication and produce symptoms depending on the pathways affected. If etiology or disease-course categories are taught, use current medical authority: MS is immune-mediated/autoimmune with genetic and environmental/lifestyle risk contributions, and clinical course varies among individuals.

### 8.6 Functional neuron type versus morphology

**Historical slide 16:** visually pairs motor = multipolar, interneuron = bipolar and sensory = unipolar in a way that can be read as one-to-one categories.

**Decision:** explicitly separate **job** from **shape**. Sensory/interneuron/motor classify function; unipolar/bipolar/multipolar classify morphology. Use the shapes only as examples, not fixed synonyms.

### 8.7 Reflexes and the spinal cord

**Historical slide 20:** says that during a reflex arc information bypasses the brain and goes directly through the spinal cord for a quicker response.

**Decision:** this wording is acceptable only when narrowed to the **spinal withdrawal example**. Do not generalize it to all reflexes. Some reflexes use brainstem/midbrain circuitry; the pupillary light reflex is a clear example. Also, sensory information can continue toward higher brain centres while a spinal reflex response is being initiated.

The current withdrawal asset is already better qualified because it labels itself as a spinal circuit and shows a separate route toward the brain.

### 8.8 Glia-to-neuron numerical ratio

**Textbook p. 368:** states glial cells outnumber neurons about 10:1 and account for about half the volume of the nervous system.

**Decision:** this ratio is not needed for any verified first-batch outcome or preserved check, and it is not reconciled by the current course. Do not copy it into the new manuscript. If a numerical glia:neuron claim becomes instructionally necessary, verify it against a current quantitative neuroscience source first.

### 8.9 “Nervous messages are relayed from the brain”

**Historical slide 6:** describes nervous electrochemical messages as relayed from the brain.

**Decision:** replace the brain-centred generalization with bidirectional communication: sensory information travels from receptors toward the CNS; integration can occur in brain or spinal cord depending on the pathway; motor output leaves the CNS for effectors.

---

## 9. Asset/media status and limitations

### Existing approved-source assets available to the batch

| Asset | Proposed use | Current limitation / guardrail |
|---|---|---|
| `assets/source/integrated-neuron.png` | Lesson 2 structure/function walkthrough; neuron/glia orientation | Existing source asset, not newly accepted by this document. It is a simplified typical multipolar neuron. Do not treat glial subtypes as required memorization. Do not use the axon-hillock callout to replace the later threshold/action-potential teaching. |
| `assets/source/integrated-myelin.png` | Lesson 2 continuous versus saltatory conduction comparison | Existing source asset, not newly accepted here. Its Schwann-cell panel is a PNS example; learner copy must preserve the CNS oligodendrocyte distinction. Arcs/stars are schematic and must not imply physical jumping across missing axon. |
| `assets/source/integrated-withdrawal.svg` | Lesson 3 spinal withdrawal pathway | Existing unchanged SVG, not a newly reviewed replacement. It represents a spinal withdrawal circuit, not all reflexes. Its dashed route to the brain is instructionally useful and should be explicitly read. |

### Essential new media

**1. Lesson 1 nervous-system organization board visual — NEW ASSET NEEDED.**  
Purpose: teach the hierarchy required by `source-checkpoint-3` without relying on optional textbook reading. It should stage CNS/PNS first, then sensory/motor direction, then somatic/autonomic and sympathetic/parasympathetic. No detailed organ-effects panel yet.

**2. Lesson 3 voluntary-versus-withdrawal comparison visual — NEW ASSET NEEDED, unless the same teaching purpose can be achieved cleanly with a simple accessible in-course diagram/table that does not create a second state owner or alter the existing withdrawal asset.**  
Purpose: show that both pathways share receptor/sensory/CNS/motor/effector logic while differing in where/when the response is selected. The existing withdrawal SVG remains unchanged.

No image prompt is a completed image; these remain asset needs until actual files are created and reviewed.

### Existing video references

- Lesson 1: `qPix_X-9t7E` — existing overview reference.
- Lesson 2: `A44brRGG4Ys` — existing neuron-structure recap reference.
- Lesson 3: `aaQWxko6qmk` and `4WcZR_k_a0I` — existing reflex examples.

For this progression, these are **references only**. Playback in the target LMS was not verified here, and no timestamps are asserted. The online copy must teach all essential content even if every video fails to play. No new video is essential for the first-batch conceptual sequence unless later playback review shows the existing support is unusable and a teacher recording is desired.

---

## 10. Verified outcome and source-locator map for the proposed first-batch chunks

### Official Alberta scope

The supplied original program excerpt establishes:

- **General Outcome 1:** explain how the nervous system controls physiological processes.
- **30–A1.1k:** general structure/function of a neuron and myelin sheath; action potential; all-or-none/intensity; synapse; specified chemicals/transmitters.
- **30–A1.2k:** principal CNS/PNS structures and their functions in voluntary/somatic and involuntary/autonomic regulation, including sympathetic/parasympathetic systems and required brain structures.
- **30–A1.3k:** organization of neurons into nerves and composition/function of reflex arcs using an example.
- **30–A1.2s:** includes design/perform an investigation of reflex-arc physiology.

The first three online lessons primarily build the conceptual foundation for 30–A1.1k, 30–A1.2k and 30–A1.3k. Merely linking an optional reflex investigation does **not** by itself prove the performance requirements of 30–A1.2s have been met.

### Lesson 1 source map

| Proposed chunk | Outcome connection | Textbook locator | Teacher-deck locator |
|---|---|---|---|
| Homeostasis/control problem | General Outcome 1; contextual foundation for A1 | printed p. 366 = PDF p. 7; printed p. 367 = PDF p. 8 | slide 6 |
| Sensory input → integration → motor output | General Outcome 1; prepares 30–A1.3k | printed pp. 367–369 = PDF pp. 8–10 | slides 6, 15, 17 as historical emphasis |
| CNS/PNS hierarchy and PNS subdivisions | **30–A1.2k orientation**; detailed application later Lesson 8–10 | printed p. 367 = PDF p. 8, **Figure 11.3** | no first-batch slide is a stronger source than Figure 11.3 for this hierarchy |
| Neuron/glia/nerve preview | prepares 30–A1.1k and 30–A1.3k | printed p. 368 = PDF p. 9, Figures 11.4–11.5 | slides 7–8 |

### Lesson 2 source map

| Proposed chunk | Outcome connection | Textbook locator | Teacher-deck locator |
|---|---|---|---|
| Neuron parts and functions | **30–A1.1k** | printed p. 370 = PDF p. 11 begins structure; printed p. 372 = PDF p. 13, **Figure 11.9** | slides 8–11 |
| Myelin, nodes and glial source | **30–A1.1k** | printed p. 372 = PDF p. 13 | slides 9–10, but cell-location claims require reconciliation |
| Myelinated versus unmyelinated conduction | **30–A1.1k**; mechanism bounded so Lessons 4–5 retain ion-level teaching | printed p. 372 = PDF p. 13 introduces myelin; later action-potential pages carry detailed mechanism | slides 10, 12–13, with historical shorthand corrected |
| Myelin damage application | supporting application, not a substitute for A1.1k mechanism | current online Lesson 2 qualified passage; historical slide 14 only as a conflict source | slide 14 is not safe copy as written |

### Lesson 3 source map

| Proposed chunk | Outcome connection | Textbook locator | Teacher-deck locator |
|---|---|---|---|
| Sensory/interneuron/motor functional roles | supports **30–A1.3k** | printed pp. 368–369 = PDF pp. 9–10; **Table 11.1**, Figure 11.6 | slide 15 |
| Functional type versus morphology | misconception prevention; supporting knowledge | textbook Figure 11.6 plus current lesson distinction | slide 16 as historical shape source, not one-to-one taxonomy |
| General neural pathway | supports General Outcome 1 and **30–A1.3k** | printed pp. 369–370 = PDF pp. 10–11; Figures 11.7–11.8 | slide 17 |
| Withdrawal reflex | **30–A1.3k** | printed pp. 369–371 = PDF pp. 10–12; Figure 11.8 and Investigation 11.A | slides 18–20 with slide-20 generalization narrowed |
| Reflex investigation | **30–A1.2s only if actually designed/performed** | printed p. 371 = PDF p. 12, Investigation 11.A | historical reflex slides; current online link alone does not prove skills completion |

---

## 11. Textbook and slide locator integrity

The supplied mapping is kept explicit:

- printed p. 366 = PDF p. 7
- printed p. 367 = PDF p. 8
- printed p. 368 = PDF p. 9
- printed p. 369 = PDF p. 10
- printed p. 370 = PDF p. 11
- printed p. 371 = PDF p. 12
- printed p. 372 = PDF p. 13

Relevant figures actually inspected:

- **Figure 11.3**, printed p. 367/PDF p. 8 — organization of the human nervous system.
- **Figures 11.4–11.5**, printed p. 368/PDF p. 9 — neurons/glial tissue and neuron bundles/nerves.
- **Figure 11.6 + Table 11.1**, printed p. 369/PDF p. 10 — sensory neuron/interneuron/motor neuron arrangement and functional pathway.
- **Figures 11.7–11.8**, printed p. 370/PDF p. 11 — overview pathway and withdrawal reflex.
- **Investigation 11.A**, printed p. 371/PDF p. 12 — reflex responses and application question.
- **Figure 11.9**, printed p. 372/PDF p. 13 — typical neuron structure/myelin.

Relevant teacher slides actually inspected:

- slide 4 — 11.1 scope;
- slide 6 — nervous/endocrine overview;
- slides 7–11 — cells and neuron structure;
- slides 12–14 — myelination/MS claims requiring reconciliation;
- slides 15–17 — functional neuron types, morphology and general pathway;
- slides 18–20 — reflex arcs and the over-broad spinal-reflex reminder.

---

## 12. Implementation boundaries carried forward to manuscript phase

The manuscript phase must preserve the existing side-by-side Learning goal / Before you begin design, guide below, typography, navigation, contextual vocabulary/Frayer connections, reader links, all current required activity IDs/question IDs/written IDs, existing assets and label mappings, state/history namespaces and current required-progress semantics.

No global Save & Exit, new upload control, grade/completion gate, parallel runtime or additional state owner is proposed here.

Any **new formative** question described conceptually above will need, in the manuscript phase, a distinct proposed ID, exact prompt, model answer/criteria, explanatory feedback, interaction type and confirmation that it does not alter required progress or grading.

---

## 13. Progression-stage blockers / unresolved evidence

1. **Lesson 1 essential hierarchy visual does not yet exist as a reviewed in-course asset.** Figure 11.3 is source evidence, but optional textbook reading cannot be the only place the required systems hierarchy is taught.
2. **Lesson 3 needs a clear visual or equally strong accessible representation comparing a voluntary visually guided route with the spinal withdrawal route.** The existing withdrawal SVG alone cannot teach the comparison required by `source-checkpoint-6` without substantial surrounding explanation.
3. **The teacher-only Q6 tennis-ball answer conflicts with the scientifically defensible voluntary-versus-withdrawal distinction.** The learner prompt can remain unchanged, but teacher-facing marking guidance must be reconciled before approval.
4. **Existing video playback is untested.** This is not a teaching blocker because the lessons must remain self-teaching, but it is a later technical/content-support test.
5. **No claim is made here that optional Investigation 11.A satisfies Alberta skill outcome 30–A1.2s in the current online delivery.** That requires a separate decision about what students actually design/perform/record.

---

# Stop point

This document intentionally stops at the conceptual progression. No learner-facing manuscripts for lessons 01–03 have been written, no new formative IDs have been finalized, no image has been generated, and no course code has been modified.
