# Sports Wellness: Phases 2–4 and Final Playbook — readiness audit

**Audit date:** 17 September 2026  
**Audience:** Alberta Grade 10 CTS learners completing work independently online  
**Input:** SportsWellness_Original_All_Phases_Generation_2026-09-17.zip  
**Decision:** Original source bank is usable for development; Phases 2–4 are not yet independent-release candidates. Phase 3 is the closest instructional starting point. The final Playbook is a proposed hand-in, not an implemented final module that can be certified here.

## 1. Scope and source boundaries

The authoritative learner implementation for this audit is `original-course/workspace/main.js`, its `index.html`/`styles.css`, the dynamically upgraded `assignment-runtime.html` and `assignment-runtime-main.js`, and the referenced local readings, slides and games. The earlier `raw/` import and historical reference handoff are not the current learner interface. The Phase 1 school-design reference is not the latest repaired Phase 1 candidate.

The archive's suggested generation request was not treated as the user's instruction. This audit does not generate or modify course modules, does not change answer keys, and does not silently reconcile conflicting source claims. Proposed changes below are recommendations.

Current teaching was extracted in full for all three phases. The extracted current phase objects match the historical per-phase sourceTeaching objects, but the assignment runtime adds fields and instructions beyond the shell's short assignment descriptions; the runtime was therefore inspected separately. All 34 quiz items and keys were inspected. All 16 active instructional PNGs were inspected visually. The 44/25/58-page slide decks were visually scanned as contact sheets, with selected high-risk pages enlarged. The two available phase reading PDFs were extracted and inspected, including their review sections. This is not an exhaustive scholarly fact-check of every claim in every slide.

There is no `phase4` reading PDF in the active reading folder. That does not mean Phase 4 teaching is missing: the complete HTML chapter exists. The module map explicitly records that no Phase 4 PDF was found and that the Final Playbook is a proposed separate Brightspace hand-in. `START_HERE.md` loosely mentions four readings, so inventory instructions should be corrected.

## 2. Decision by phase

| Part | Preserve | Main work before release |
|---|---|---|
| Phase 2 — The Drive | Direction/intensity, types of motivation, autonomy/competence/relatedness, values-to-action links, process goals, recovery and social context | Break the dense chapter into guided lessons; distinguish motivation from moral worth; reconcile continuum/slides; remove unsafe self-diagnostic exercise; reduce overlapping writing |
| Phase 3 — The Focus | Four attention quadrants, task-dependent shifting, nonjudgmental observations, preparation and refocus routines | Add worked transitions and short decisions; identify the free-throw case before referring to it; bound the Inner Game metaphor; repair game inference and accessibility |
| Phase 4 — The Toolkit | Confidence grounded in evidence, effort/success/progress, realistic response to setbacks, C-B-A, rehearsal of disruption and recovery | Stop presenting certainty as a prerequisite; withhold unsupported neuroscience slides; remove decorative physiological numbers; allow alternative rehearsal formats; consolidate 46 response controls |
| Final — Performance Playbook | Integration of prior work as a useful end product | Define the actual brief, criteria, required evidence, submission route and demonstration. Do not invent an implemented final workflow |

These decisions do not establish which CTS credits have been earned. Map the actual assessed evidence to the declared course outcomes before release. The published REC1050 overview includes sport, artistic and academic performance; an exclusively elite-sport/warrior frame is a design choice, not a necessary boundary of the subject.

## 3. Shared functional findings

### R01 — Wrong backup can erase assignment work (release blocker)

In the Focus assignment, a written response was entered. Loading a syntactically valid JSON file containing only `{"unrelated":"not a course backup"}` cleared the response and produced the success alert **Focus Data Loaded**. The populate function fills absent keys with blanks and immediately saves them. The failure is reproduced in `evidence/student-flow-results.json`.

The related backup functions use the same JSON-parse/populate approach. Some catch malformed JSON, but that is not validation of module identity, schema or version. The Phase 3 destructive case was reproduced; the corresponding issue in other modules is a source-code finding, not a claim that every wrong-file permutation was executed.

**Repair:** include courseId/moduleId/schemaVersion, validate shape and types before touching live state, reject unrelated/cross-module backups, preview what will be replaced, require confirmation, retain an undo/recovery snapshot, and preserve long response text. Invalid input must leave every current field and saved value unchanged.

**Source locators:** assignment-runtime-main.js `vb_loadBackup`, `vb_populate`, `mb_loadBackup`, `p3_loadBackup`, `p3_populate`, `p4a_loadBackup`, `p4b_loadBackup`.

### R02 — Quiz choices are memory-only; summary is not a restorable attempt

The original `quizDrafts` object exists only in JavaScript memory. An answer and feedback survived navigation away and back in the same page. Reconstructing the application using all captured stored data restored neither the choices nor the per-question feedback. Stored progress retains aggregate quiz information, not the complete draft/attempt.

**Repair:** persist question IDs, selections, question position, submitted answers, feedback state and content version; restore them on return. Clearly distinguish a current draft, a submitted attempt and a new attempt. Test this in the real Brightspace launch environment after the component logic passes.

### R03 — Quiz feedback and thresholds do not establish independent mastery

The interface updates the number correct while students choose answers, before formal submission. Individual checks reveal answers that can be changed before submitting. Repeated unchanged full submissions increased the attempt counter from one to two.

This can be an intentional formative design; it is not secure evidence that the learner independently demonstrated mastery. Keep feedback-rich practice, but label it accurately and require a new applied explanation or teacher demonstration separately when mastery is the claim.

The inspected keys contain **no D answer among 34 questions**; eight of Phase 3's twelve answers are B. Rebalance options or safely shuffle presentation while preserving stable choice IDs and correct-answer mapping. Do not silently change the conceptual keys merely to balance positions. Some distractors are absolute claims easily rejected without understanding the concept; use plausible misconceptions and new scenarios.

### R04 — Progress and unlocking are not aligned with completion

`AUTHORING_UNLOCK_ALL = true` enables access regardless of stated threshold requirements. The global progress denominator consists of five phase-review flags and four quiz passes; completed assignments are not included. The test reached 100% without completing the assignments.

Open navigation is acceptable. Misleading unlocking/completion language is not. Either apply the actual prerequisites or remove the gating promises. Label reading review, knowledge practice, assignment evidence, teacher assessment and LMS submission separately. A checkbox or self-rated rubric is not a teacher mark.

### R05 — Fragmented evidence and dependency-heavy core tasks

The original shell has no Phase 1-style consolidated My Work or Quick Notes workflow. Assignments store and export separately. Core assignment loading waits on external resources, and the games reference CDN React, ReactDOM, Babel and Tailwind resources. Remote cover images are also used.

Use the repaired Phase 1 learning interface as the shared foundation, but finish its known remaining repairs before cloning it. Keep phase-specific versioned state; do not silently import unrelated course storage. Localize core dependencies and expose useful failure messages. A network failure must not leave the assignment hidden. Optional videos may require internet; essential learning and exporting should not depend on a video provider.

## 4. Phase 2 — The Drive: instructional audit

### Keep the conceptual spine

The chapter does more than tell students to work harder. It distinguishes the direction and intensity of effort, separates integrated regulation from intrinsic enjoyment, introduces basic psychological needs, links values to observable actions, and includes recovery and person-by-situation influences. Those are useful distinctions to preserve.

### Teach decisions before demanding a complete personal system

The current 17-section chapter is a long reading page rather than a sequence of short read/try/check lessons. Its two assignments expose 18 and 23 text/input/select controls. The combined 41 controls are not 41 essays, but they still create substantial response and navigation load.

Recommended sequence, not a replacement source outline: understand why effort differs; compare reasons for the same action; apply autonomy/competence/relatedness to a case; turn one value into a behaviour; interpret a mistake without global self-judgment; plan a realistic week that includes support and recovery. Carry earlier responses into the later Master Config rather than requiring students to restate them.

A useful new practice would show two students completing the same session for different reasons. Students identify the reason from the statements, then change one feature of the environment and explain why it may help. Do not ask them to diagnose a classmate's motivational personality from appearances.

### Correct the continuum without collapsing distinctions

The graphic labels the left end “More controlled” while including amotivation. In Ryan and Deci's primary description, amotivation involves lack of intention/non-regulation, not simply an extreme version of controlled motivation. The authors also explicitly say this is not a developmental ladder requiring everyone to pass through every category. Preserve the lesson's useful distinction between integrated regulation and intrinsic interest.

External verification: Ryan & Deci (2000), pp. 72–73, https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf . This is an audit correction, not wording silently attributed to the uploaded lesson.

### Remove the character-judgment burden

Phrases such as “harder to fake,” “maintain dishonestly,” “non-negotiable” values, and “honest” identity audits turn an explanation task into a test of character. The rubric should evaluate the coherence and specificity of the plan, not whether a teacher believes the student is sufficiently authentic or tough.

Offer a fictional performer and a school/artistic/recreational situation consistently. Students should not need to disclose private beliefs, identify a real support person by name, describe actual distress, or claim recovery experiences they have not had. A role such as “trusted adult” is enough when the task is to explain support.

### Withhold unsafe or unreconciled slides

`02-drive.pdf`, page 37, presents the “40% Rule” with a governor dial and asks the learner to diagnose injury pain versus effort before negotiating another repetition or ten seconds. The dial also contains duplicated/inconsistent percentage labels. This should not be a self-directed exercise for Grade 10 students. The disclaimer at the bottom does not supply the judgment or supervision the exercise requires.

Page 24 presents a “calloused mind” metaphor alongside a physiological explanation; pages 26–27/39 turn a study-based person-by-situation discussion into broad profile prescriptions; page 36 says “100% autonomy.” Page 10 incorrectly announces Phase 1 complete inside the Phase 2 deck. Pages 28–30/38 contain recovery/overtraining claims needing discipline-specific review. Withhold the unreconciled deck from student Resources rather than adding a warning students must interpret themselves.

The revised student task should identify the need for support or an appropriate adjustment, not ask students to diagnose overtraining, determine physiological limits, or treat fatigue as evidence of weak motivation.

### Game decision

The game asks students to fill a Championship Bar as quickly as possible while warning them that the outcome zone creates anxiety. It awards immediate points for choices labelled shame or hubris and uses altered target sizes as costs. These are authored game rules, not measured psychological effects.

Hovering the outcome area produced **Choking (Anxiety Overload from Outcome Trap)** without any report of anxiety. The actual input was pointer location. Explain this limitation in the activity and feedback, not only in a distant disclaimer.

Keep the game optional after a guided decision task. There is also a stored feedback paragraph claiming that identity-based failure processing “permanently shrinks” stress capacity; the current termination route did not trigger that branch in our test. Treat it as problematic dormant copy to remove, not a reproduced learner outcome.

## 5. Phase 3 — The Focus: instructional audit

### Best teaching starting point

This phase has a clear central question: what information matters for the task right now? The four attention quadrants, contrast between observing an error and judging the whole person, and planning for disruptions can become strong short lessons.

Teach the quadrants with one changing situation: scan teammates and space; consider options during a pause; notice a specific body cue; focus on a target for the next attempt. Students should explain why the appropriate focus changes. Correctly naming a quadrant once is not enough.

### Separate explanatory frameworks from measurements

Keep Gallwey's `performance = potential − interference` as an attributed coaching framework. The source itself names Gallwey, and the official Inner Game presentation uses this formulation. Do not imply that a game score measures potential, or that Self 1 and Self 2 are literal anatomical systems. Task knowledge, skill learning and feedback should not disappear behind “trust the body.”

The web lesson refers to “this athlete” in the case lens without first identifying the anxious free-throw shooter as clearly as the PDF does. Restore the case description. The symptom table also assigns likely mechanisms too confidently: missing a cue could arise from several attention problems. Require evidence from the scenario before assigning the focus error.

Replace “safe, sterile” practice rhetoric with teacher-approved, graduated task variation. Noise/time/evaluation can be hypothetical or adapted; pressure practice should not be punishment or a physical-risk challenge.

### Game feedback is instructionally misleading

Without clicking the ball, the game displayed **Missed Cue (Broadened Focus)**. Pressing **Center (Breathe)** immediately displayed **Centered! (Arousal Regulated)** and reduced the game variable. Three hits are programmed to announce a flow state. No learner attention width, breathing or flow experience was measured.

Repair the feedback to describe what actually happened: the timing window was missed; a game adjustment was used; a streak bonus was earned. Invite the learner to compare the model with the lesson rather than claiming the software has measured their psychology.

The ball and thought cards use clickable divs without an equivalent keyboard interaction. Provide a fully keyboard-operable version and an untimed scenario route assessing the same decisions. Do not require the survival game to earn the phase's conceptual credit.

### Assignment design

The Focus assignment exposes 17 response controls. Keep the useful before-performance plan, interruption response, cue and review. Add one complete worked case next to the relevant step and a final unfamiliar scenario. Avoid making the final explanation a summary of several already repeated paragraphs.

## 6. Phase 4 — The Toolkit: instructional audit

### Preserve evidence, preparation and coping rehearsal

Effort/success/progress entries can help students identify concrete evidence rather than write empty affirmations. The confidence-account analogy, a short C-B-A sequence, and rehearsing a disruption plus a response are useful teaching structures. The prose contains some important limits—confidence is not arrogance and interpretation need not mean denying an error. Preserve those limits consistently across the slides, quizzes and game.

### Certainty is currently overemphasized

The chapter and quiz repeatedly define confidence through certainty. The slides go further: “The outcome is decided long before the game begins” and “decide you've already won.” These are motivational statements, not established outcomes of completing a routine. They conflict with Phase 1's more careful message that a performer can act usefully while still nervous or uncertain.

Recommended framing: identify evidence of preparation, choose a believable cue, attempt the task, and learn from the result. Assess the plan and justification, not whether the student reports total confidence.

### Withhold the neuroscience claims pending a proper source review

`04-toolkit.pdf` pages 45 and 49 say the nervous system does not know the difference between imagined and actual repetitions, and that each mental repetition lays down another layer of myelin. Page 50 presents an imagined-lemon response as proof. The supplied materials do not substantiate those sweeping equivalences or repetition-by-repetition claims. Do not carry them into a student release as settled neuroscience.

A response to imagining a lemon, even when it occurs, would not logically demonstrate that imagining a sport skill is neurologically identical to executing it or quantify myelin change. Keep the observation separate from the inference. Page 40 permits different imagery perspectives, while pages 48/53 frame external viewing as wrong and first-person as the required correct approach. Reconcile that contradiction before using the deck as an alternate explanation.

These are findings about unsupported/inconsistent source claims, not a claim that imagery has no use.

### Rehearsal must allow different ways of representing the task

The Visualization Blueprint requires vivid, controlled, emotional mental cinema. As an inclusive design choice, allow a written sequence, storyboard, spoken rehearsal or eyes-open task walkthrough to demonstrate the same planning and recovery decisions. Mark the relevance, sequence, perspective choice, response to disruption and explanation—not the student's claimed ability to generate a vivid internal film.

The confidence assignment has 30 response controls and visualization has 16. Some are short top-ten or daily-log entries, not extended essays. Nevertheless, 46 controls make it especially important to reuse prior evidence rather than add another layer of independent writing.

### Remove decorative physiology

The active C-B-A figure includes VO2 max 78 mL/kg/min, heart rate 145 bpm labelled “Focused,” and power output 850 W. None is needed to explain the routine or tied to a defined data source in the lesson. They make decoration look like scientific evidence. Remove them and enlarge the actual steps. Also qualify the graphic's promise that one or two breaths interrupt panic and convert nervous energy into readiness.

### Game decision and keyboard failure

The Confidence Account game classifies selected statements into approve/lockdown categories. That can support a limited discussion of global self-judgment, but the intro broadly groups criticism and doubt as withdrawals. Add cases distinguishing a global insult from specific, useful corrective feedback. The bank balance must remain a game variable, not an assessment of the student's confidence or identity.

A deterministic control test paused spawning after one card. Focusing Approve and pressing Enter left the card unchanged; dispatching the mouse-down action removed it. The handler is `onMouseDown`, not a normal click activation. Replace it with semantic activation usable by mouse, touch and keyboard; then repeat the test without pausing and on actual devices.

## 7. Visual system and media

All sixteen main figures have relevant topics, but the metallic frames, illuminated interfaces, gym backgrounds and pseudo-monitor markings often occupy space needed by the teaching. The images total **114,466,926 bytes (114.47 MB)** before any other course assets. They are not necessarily downloaded simultaneously across phases, but that is a large image payload and the current renderer does not add lazy loading to the figures.

At a 390-pixel viewport, the main figures displayed around 315 pixels wide. Dense 2500–3000-pixel raster diagrams become very small text at that size. The original lesson renderer does not provide Phase 1's enlargement control. A layout can fit without horizontal overflow and still be hard to read.

Preserve the school theme. Retain the conceptual figures, remove unnecessary frames and numerical decoration, compress web media, provide full-size detail where needed, and move essential labels/explanations into live HTML. Use full diagrams for synthesis only after teaching their parts.

Image-specific decisions are in `MEDIA_AUDIT.md`. The Phase 2 overview has duplicated Mindset/Accountability and Pride/Goals cards; its complexity is not all meaningful. The Phase 3 quadrant graphic is the strongest candidate to simplify rather than redesign conceptually. The Phase 4 C-B-A figure needs the physiology removed before aesthetic polish.

## 8. Video selection

The source Film Room contains 29 catalogued links across the course. Link titles are not playback verification. The catalogue mixes concept explanations, athlete stories, self-help clips, team leadership and military/warrior motivation. Their relevance and audience suitability should not be treated as interchangeable.

Recommended shortlist by instructional job, subject to end-to-end verification:
- Phase 2: one accurate introduction to motivation types; one concrete example of responding to a learning setback. The Dweck/praise item is a candidate, not a verified pass.
- Phase 3: one clear demonstration of attention or the Inner Game distinction, followed by a task-switching question.
- Phase 4: one evidence-based confidence example and one short rehearsal demonstration; a Phelps story can illustrate preparation but does not prove a mechanism or guarantee transfer.

Move generic extreme-discipline, military selection and warrior-ethos material out of the core learning route. This is a task-fit recommendation, not a blanket judgment about the named speakers. “Confronting the Weak Self” is particularly poorly aligned with the lesson's attempt to separate mistakes from personal worth.

For each retained video record publisher, verified title, duration/segment, captions/transcript status, school playback status, precise purpose, one application question, and a complete local alternative. No video should be required merely to obtain the explanation needed for assessed work. All 29 items and the limits of verification are in `VIDEO_AUDIT.md`.

External video pages could not be consistently retrieved. No claim is made that an inaccessible page is a dead link, and no video has been certified end-to-end in the school environment in this pass.

## 9. Final Playbook

The inventory describes the final as a proposed separate Brightspace hand-in. The active assignment list has no dedicated final module. Accordingly there is no finished final interface, rubric or submission flow to pass or fail from this upload.

Recommended design, explicitly new: reuse existing work to create a short performance plan for one real or fictional case. It should identify the situation and demand; motivation and practical constraints; relevant signs and regulation; attention cues and a refocus routine; evidence-based confidence; rehearsal of a likely disruption; and a reasoned adjustment after new information. Do not ask for a sixth full retyping of earlier assignments.

Require a brief demonstration or walkthrough plus explanation of one changed scenario, with an equivalent accessible format. Define whether the submission is a PDF, a recording, a teacher conversation, or a combination, and show a concise rubric. A fictional walkthrough must be labelled fictional; do not require invented real-world trials. Track submission separately from local export.

## 10. Priority and acceptance gates

1. Protect responses: wrong/cross-module backups, restore, storage failures, long answers, export, replacement confirmation and recovery.
2. Align completion claims: open versus gated access, review versus mastery, practice results versus teacher grade, and export versus submission.
3. Reconcile source content: Phase 2 governor/continuum/character language; Phase 3 measured-versus-metaphorical claims; Phase 4 certainty/neuroscience/perspective contradictions. Withhold unreconciled PDFs.
4. Build a shared learning shell using the finished Phase 1 pattern. Add guided decisions, live response collection, clear required work and equivalent untimed practice. Keep stable response IDs where migration is needed.
5. Simplify and compress the sixteen figures; curate rather than expand the video list; test game feedback and keyboard operation.
6. Define the final hand-in; then pilot actual Brightspace student accounts on school computers and phones. Observe where students need teacher rescue instead of relying only on developer test passes.

## 11. What was and was not tested

**Tested:** original shell routes, live assignment mounting with supplied dependencies in a component fixture, in-page response save/return for all five assignments, one destructive wrong-backup import, quiz draft restoration from captured storage, quiz duplicate submission, quiz progress logic, image dimensions, and representative game controls/feedback. Original source code was inspected for related cases.

**Harness limits:** isolated Chromium could not serve the course through localhost, and external CDNs were unavailable. Browser storage was emulated; the app was reconstructed using captured storage to test restoration logic. Original shell CSS was used for the final shell viewport checks. Assignment/game visual checks used a locally compiled utility-CSS fixture and a React fixture, not a certified reproduction of the original CDN stack. Actual game application logic was not rewritten; a test paused game timers to isolate keyboard activation. Evidence records identify these conditions.

**Not tested:** real browser shutdown persistence, storage quota behaviour in the target LMS, actual SCORM API reporting, authenticated Brightspace submission/resume, school network filtering, physical touchscreen devices, assistive-technology certification, every game-winning strategy, or full playback/caption verification for every video.

These limits prevent production certification. They do not erase the source-code and reproducible component findings above.
