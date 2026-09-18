# Sports Wellness Phases 2–4: exact Phase 1 design, complete generation specification

## 1. Outcome and working rules

Produce three complete, independently usable learner previews:

- **Phase 2 — The Drive**
- **Phase 3 — The Focus**
- **Phase 4 — The Toolkit**

Each will be a working folder containing HTML, styles, scripts, local learning assets, its reading chapter, and review records. ChatGPT Pro will generate them from a prepared template package, one phase at a time.

The visual reference is the **current repaired Phase 1 workspace**. The older school-design HTML inside the original ZIP is historical reference only.

The governing rule is:

> Reuse Phase 1’s actual shell, stylesheet, component markup, placement, and interaction patterns. Change the phase content and its declared configuration. Do not recreate the appearance from descriptions or screenshots.

The decisions already agreed are:

| Area | Decision |
|---|---|
| Audience | Alberta Grade 10 learners working independently |
| Reading | Grade 8–9 prose, retaining Grade 10 application and reasoning |
| Assignments | Consolidate repeated work while mapping every original field |
| Delivery | Working module folders before Codex integration |
| Reading PDFs | One newly reconciled chapter for each phase |
| Workload | Estimate from the actual reading and tasks; refine after a student pilot |
| Scope | Phases 2–4; introduction and final Performance Playbook deferred |
| Release | Local review candidates; SCORM and Brightspace validation occur later |

The audit becomes a correction list and acceptance checklist. Its recommendations do not authorize silently deleting source material or inventing missing evidence.

---

## 2. Prepare the generation package before asking ChatGPT to author

### 2.1 Include the correct sources

The generation package must contain these four inputs, clearly labelled:

1. **Original course and assets:** the original all-phases ZIP already created.
2. **Current Phase 1 reference:** a fresh copy of the current workspace, including the latest activity links, figures, Quick Notes, My Work, runtime, and styling.
3. **Phases 2–4 audit:** the supplied audit document.
4. **This specification and the extracted content manifests described below.**

The current Phase 1 source is:

[Current Phase 1 workspace](/Users/deanguedo/Documents/GitHub/canvas-helper/projects/sportswellness-phase-1/workspace/index.html)

The existing Phase 1 audit ZIP predates the latest activity shortcuts. It must not serve as the sole visual reference.

Correct the source inventory before generation:

- Phase 2 has a **19-page original reading PDF**.
- Phase 3 has a **13-page original reading PDF**.
- Phase 4 has **no original reading PDF**.
- Original slide decks contain **44, 25, and 58 pages**, respectively.
- The audit’s referenced `MEDIA_AUDIT.md` and `VIDEO_AUDIT.md` appendices were not supplied. Record that absence; do not claim to have inspected them.

### 2.2 Give ChatGPT an explicit file hierarchy

Prepare the following package structure:

```text
SportsWellness_Phases2_4_Generation_Kit/
  START_HERE.md
  GENERATION_SPECIFICATION.md

  reference/
    phase1-current/
    original-course/
    audit/
    historical-handoff/

  contracts/
    visual-contract.json
    component-catalog.html
    route-template-map.csv
    phase2-content-map.csv
    phase3-content-map.csv
    phase4-content-map.csv
    assignment-field-map.csv
    checkpoint-source-bank.json
    question-provenance.csv
    media-manifest.csv
    curriculum-evidence-map.csv
    acceptance-checklist.csv

  templates/
    sportswellness-phase-2/
    sportswellness-phase-3/
    sportswellness-phase-4/
```

Each template folder must already contain the Phase 1 shell and complete stylesheet. It must also contain the reusable behaviour adapted to a phase configuration, with phase-specific lesson content left for authoring.

**Do not give ChatGPT a blank page and tell it to “match Phase 1.”**

### 2.3 Freeze what may and may not change

Record SHA-256 hashes for the reference stylesheet, logo, shell fragments, and reusable runtime.

**Locked during content generation:**

- Font stack.
- Colours.
- Header/sidebar structure.
- Content margins and responsive rules.
- Component classes and wrapper hierarchy.
- Shared button labels and placement.
- Completion-guide structure.
- My Work and Quick Notes presentation.
- Navigation, saving, backup, and export contracts.

**Editable:**

- Phase title and topic labels.
- Lesson content.
- Learning goals and instructions.
- Questions, feedback, and worked examples.
- Phase-specific diagrams and captions.
- Assignment evidence fields.
- Approved resource records.
- Phase-specific configuration.

Existing CSS classes containing `p1` may remain where they are styling hooks. Renaming them for cosmetic consistency is unnecessary and risks breaking the layout.

### 2.4 Extract complete source material

Use the original course’s live teaching and assignment runtime, not just its short inventory descriptions.

The source manifests must account for:

| Phase | Original teaching sections | Original assignment controls | Checkpoint questions | Main figures |
|---|---:|---:|---:|---:|
| 2 | 17 | 41 | 10 | 6 |
| 3 | 13 | 17 | 12 | 5 |
| 4 | 14 | 46 | 12 | 5 |

Every source section, assignment control, checkpoint question, and figure receives a disposition:

- Retained.
- Reworded.
- Combined with another item.
- Optional extension.
- Withheld from learners with a recorded reason.

No blank or unexplained disposition is permitted.

---

## 3. Exact visual and page-structure contract

### 3.1 Copy the actual stylesheet

Phase 1’s stylesheet contains several layers of overrides. Copy the complete file unchanged. The following values document the expected appearance; they do not replace the stylesheet.

| Element | Required appearance |
|---|---|
| Font | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif` |
| External fonts | None |
| Main text | Desktop 17px; mobile 16px; generous line spacing |
| Text colour | `#171b1b` |
| Muted text | `#5b635d` |
| Page background | `#f7f8f5` |
| Reading surface | White |
| Primary green | `#154212` |
| Teal | `#146c60` |
| Borders | `#d9ded8` |
| Keyboard focus | Visible gold outline |
| Header | Fixed, 64px high, near-black |
| Desktop sidebar | 270px wide |
| Desktop reading inset | 54px within the white page |
| Mobile reading inset | 22px |
| Topic heading | Heavy sans-serif; responsive 34–50px |
| Lesson subheadings | Approximately 25px desktop, 24px mobile |
| Primary buttons | Green, white text, minimum 44px high, 6px radius |
| Secondary buttons | White, green border/text, same dimensions |
| Button spacing | 10px gap; wrapping supported |
| Textareas | 16px text, minimum 120px height, padded, 4px radius |
| Decorative shadows | None, except the existing drawer treatment |

The current reference uses system fonts, so comparisons must use the same operating system and browser. Introducing a similar-looking web font would create a mismatch.

The current mobile drawer also has inherited CSS overrides affecting its geometry. Preserve the frozen reference behaviour during generation; do not independently “clean up” the CSS in one phase.

### 3.2 Header and sidebar

Use the same header in all three phases:

- Exact Next Step logo, centred.
- **Topics reviewed** indicator on the right.
- Menu control on the left when applicable.
- A visible way to reopen a collapsed sidebar.
- Icon-only mobile menu at narrow widths, with its accessible name retained.

The sidebar must have this order:

| Position | Item |
|---|---|
| First direct link | How to use this phase |
| Collapsible group | Start |
| Collapsible group | Learn |
| Collapsible group | Practice |
| Collapsible group | Build |
| Collapsible group | Review |
| Collapsible group | My tools |
| Fixed bottom control | Save and Exit |

Specific contents:

- **Start:** 01 Overview.
- **Learn:** topics 02–09.
- **Practice:** topic 10, the phase’s decision lab.
- **Build:** topic 11, the phase assignment.
- **Review:** topic 12 and Final checkpoint.
- **My tools:** My Work, My Notes, Resources.

The game and untimed practice remain accessible through the Practice page’s chooser, matching the current Phase 1 pattern.

Preserve:

- Current-row highlight and **Current** marker.
- Topic numbers and reviewed indicators.
- Independently scrolling navigation.
- Collapsible groups.
- Correct alignment of “How to use this phase” with the group headings.

Do not restore previously removed interface elements: the course-phases list, coming-soon items, duplicate sidebar progress, Continue card, sidebar storage warning, or export/submission banners.

### 3.3 Route inventory

Each phase will have **12 numbered topics and six supporting routes**.

Shared route roles:

```text
course-guide
start
[eight phase-specific Learn routes]
performance-lab
playbook
phase-review
checkpoint
performance-game
untimed-practice
process-collection
resources
```

Topic titles change by phase. Shared support labels and page behaviour remain consistent.

### 3.4 Mandatory numbered-lesson sequence

Every Learn page must use this sequence:

1. Phase/category eyebrow.
2. Topic title.
3. One-sentence introduction.
4. Closed **How to complete this section** disclosure.
5. Visible **Jump to the activity ↓** link.
6. **Learning goal / Before you begin** strip.
7. Lesson explanation.
8. Relevant worked example and figure.
9. Guided concept checks.
10. Independent written application.
11. Closed **Learn another way** support section.
12. Reviewed checkbox.
13. Previous/next topic controls.
14. Open My Notes control.

Use the existing Overview, Practice, Build, and Review template variants rather than forcing every page into a Learn layout.

Current Phase 1 teaching figures are stacked in a **single column**, including desktop. Earlier side-by-side screenshots are not the current specification.

### 3.5 Completion guides must provide actual instructions

The summary text is exactly:

**How to complete this section**

Each guide starts closed and includes:

- The exact required work on that page.
- What to read first.
- What to do in the activity.
- How much explanation is expected.
- How to check or revise the response.
- Where support is available.
- What to do before moving on.

For example:

> **Required work:** Complete “Change the practice environment” and try both concept checks.  
> Read the three needs, study the worked example, choose one change for the fictional practice, and explain which need it supports. Two to four sentences are enough if they include the case evidence and your reason.

Avoid vague instructions such as “complete all relevant work” or “do what your teacher assigns” when the page already defines the required task.

### 3.6 Component placement rules

| Component | Required placement and behaviour |
|---|---|
| Worked example | Within the lesson band, before independent application; use the existing warm callout |
| Figure | Existing figure component; full width, caption underneath, Enlarge control |
| Figure explanation | Live text below complex diagrams; essential meaning cannot exist only inside the image |
| Response | Label → helper text → input → save status |
| Concept check | Prompt → choices → Check action → explanatory feedback |
| Completion guide | Beneath title/intro, above activity shortcut |
| Learning support | Near the end of the topic, before its footer |
| Button row | Inside the content inset, never touching the page border |
| Build controls | Previous left, step count centre, Next right |
| Review controls | Question selector above; Previous left and Next right below |
| Checkpoint | Padded question boxes; question text remains inside its border |
| My Work | Inset introduction, one PDF action, collected work |
| Quick Notes | Persistent bottom-right control, matching Phase 1 |
| Backup controls | Closed recovery section in the course guide |
| Game controls | Inside the game’s own interface; no duplicate outer toolbar |

Preserve the existing checkpoint legend fix. Reverting to default fieldset styling would recreate the questions-overlapping-borders defect.

### 3.7 Course guide contents

Each phase gets a complete dedicated guide page containing:

1. What this phase teaches.
2. What the finished phase assignment will contain.
3. Start → Learn → Practice → Build → Review sequence.
4. What is required and what is optional.
5. How to use lesson checks and feedback.
6. How to reuse earlier answers in Build.
7. How My Work differs from Quick Notes.
8. How topic-review progress works.
9. How to return to unfinished work.
10. How to print or save My Work as PDF.
11. A closed recovery section for backup/import.
12. An accessible route through practice without a timed game.

Instructions must use the exact labels students see on buttons and in navigation.

---

## 4. Learning, writing, and question standards

### 4.1 Reading and cognitive demand

Use Grade 8–9 prose with Grade 10 reasoning:

- Prefer sentences of approximately 12–18 words.
- Use short paragraphs and concrete examples.
- Explain technical vocabulary at first use.
- Retain necessary distinctions rather than replacing them with slogans.
- Aim for approximately 400–650 words of core teaching per Learn topic, excluding optional support and feedback.
- Split long explanations into meaningful subsections.
- Use readability calculations as an editorial signal, followed by human review.

Each lesson must move through:

**Explain → model → guided decision → independent application → feedback → next step.**

Required thinking includes:

- Identifying relevant evidence.
- Explaining a concept accurately.
- Selecting a response that fits the task.
- Justifying the selection.
- Adapting when the situation changes.

### 4.2 Examples and learner privacy

Every phase includes sport, academic, and artistic or recreational examples.

Every assignment provides a complete fictional case. Students may use a suitable personal example, but must not need to disclose:

- Actual distress or injury.
- Private beliefs.
- A named support person.
- Personal failures they do not want to discuss.
- Claimed confidence, toughness, or vivid mental imagery.

The official REC1050 curriculum includes artistic and academic performance as well as sport. Its personal-assessment and demonstration outcomes require separate evidence mapping before credit claims are made. [Alberta REC1050 curriculum](https://education.alberta.ca/media/160529/rec.pdf)

### 4.3 Standard lesson work

Each of the eight Learn topics contains:

- One complete worked example.
- Two short formative checks: one distinction/recognition question and one application question.
- One primary saved written response.
- A clear indication of how that response can support the Build assignment.

Written lesson responses usually require **two to four sentences**, not an essay. A useful response names evidence, makes a decision, and explains why.

Every question record must identify:

- Stable question ID.
- Learning target.
- Source location.
- Retained, revised, or newly authored status.
- Correct concept or expected evidence.
- Feedback and misconception addressed.
- Required or optional role.

Feedback must explain the reasoning. “Correct” or “Try again” alone is insufficient.

---

## 5. Exact phase-by-phase lesson plans

All phases use:

- **01 Overview**
- **02–09 Learn**
- **10 Decision lab**
- **11 Build**
- **12 Review**

### 5.1 Phase 2 — The Drive

Preserve coverage of all 17 source sections, including motivation quality, needs, values, mindset, pride, goals, recovery, and context.

| Topic / route | Teaching and source coverage | Primary saved question | Figure |
|---|---|---|---|
| 02 `effort-direction` — Where effort goes | Direction versus intensity; rethinking discipline | “Two performers work equally hard but improve different things. Explain their direction of effort and how it differs from intensity.” | No decorative image required |
| 03 `motivation-reasons` — Why we do the work | External, introjected, identified, integrated, intrinsic reasons; amotivation | “Compare someone who enjoys the activity with someone who chooses it because it fits a value. What evidence distinguishes their reasons?” | Corrected motivation continuum |
| 04 `psychological-needs` — Choice, progress and belonging | Autonomy, competence, relatedness | “Change one feature of this practice environment. Which need does it support, and why might it help?” | Three psychological needs |
| 05 `values-action` — Values into action | Values, observable behaviour, difficulty and action | “Choose one value for the fictional performer. Describe one action that expresses it and one action that would move away from it.” | Live HTML value/action comparison |
| 06 `responding-mistakes` — Responding to mistakes | Mindset, behaviour versus identity, guilt/shame distinction, evidence-based pride | “Rewrite ‘I failed because I am useless’ as an observation and a useful adjustment. Explain what changed.” | Live worked comparison |
| 07 `usable-goals` — Goals you can use | Outcome, performance, process; SMART goal wording | “Write an outcome, performance, and process goal for the same situation. Explain which action the performer can work on next.” | Live goal ladder |
| 08 `effort-recovery` — Effort, recovery and support | Recovery, growth-model limits, appropriate adjustment/support | “The performer is struggling to recover. What information and support would you seek, and what adjustment could be discussed?” | Corrected recovery diagram and qualified growth model |
| 09 `situation-plan` — Make the plan fit the situation | Person-by-situation, practical constraints, environment and support | “Adapt a weekly plan when time, transport, or support changes. Explain why the original plan needs adjusting.” | Person/situation diagram, followed by simplified synthesis map |

**Overview:** introduce motivation as reasons, direction, and conditions for action. Offer a fictional learner preparing for a team tryout or school performance. Save one opening response about the task and its constraints.

**Three lab cases:**

1. Same activity, different reasons.
2. A practice environment that does not support competence or belonging.
3. A plan disrupted by limited time and poor recovery.

Each case asks for a decision and a brief evidence-based explanation.

**Required content corrections:**

- Show amotivation as lack of intention, not the most controlled intentional category.
- Explain that integrated regulation remains extrinsic.
- Do not present the continuum as a compulsory ladder.
- Explain that autonomy can exist within appropriate constraints.
- Replace character judgments with observable choices and support.
- Remove the 40% rule and injury-versus-effort self-diagnosis task.
- Present recovery as a planning/support issue, not a learner diagnosis.

These motivation distinctions are supported by the original Ryan and Deci paper. [Ryan & Deci, 2000](https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf)

### 5.2 Phase 3 — The Focus

Preserve the 13 source sections while making attention shifts explicit.

| Topic / route | Teaching and source coverage | Primary saved question | Figure |
|---|---|---|---|
| 02 `attention-processes` — What attention does | Selecting, sustaining, noticing, shifting; limited capacity | “What information matters in this moment? Identify one distraction and explain why it is less useful now.” | Live relevant/irrelevant comparison |
| 03 `attention-quadrants` — Four ways to focus | Broad/narrow × internal/external | “Choose the focus needed at a stated moment and explain the evidence supporting your choice.” | Simplified attention quadrants |
| 04 `attention-shifts` — Shift as the task changes | Moving between quadrants as demands change | “Describe how attention changes from scanning, to planning, to a brief body check, to the next target.” | Reuse quadrants with a labelled sequence |
| 05 `observation-self-talk` — Observe without judging yourself | Gallwey, Self 1/Self 2, interference, nonjudgmental observation | “Turn a global judgment into a specific observation and next action. Explain why the new wording is more useful.” | Attributed Inner Game framework |
| 06 `cues-anchors` — Cue words and anchors | Instructional/motivational cues; appropriate anchor | “Choose a cue and anchor for the next action. Explain why they fit this task.” | Live cue/anchor examples |
| 07 `prepare-attention` — Prepare your attention | Preperformance planning | “Build a short before-performance sequence. State what each step directs attention toward.” | Preperformance blueprint |
| 08 `reset-return` — Notice, reset and return | What-if plan, refocusing, comfortable familiar routines | “A disruption occurs. Describe the signal, your reset, and what you attend to next.” | Corrected reset sequence |
| 09 `flexible-focus` — Practise a flexible focus plan | Appropriate variation, competing explanations, adjustment | “Change one condition in a hypothetical practice. What would you observe before deciding whether the plan needs changing?” | Focus-system synthesis map |

**Overview:** explicitly introduce the source’s free-throw shooter before later references to “this athlete.” Include an academic or artistic parallel.

**Three lab cases:**

1. Attention shifts during changing play.
2. An error followed by global self-judgment.
3. An unfamiliar interruption requiring a changed cue or focus.

**Required corrections:**

- No quadrant is permanently ideal.
- A missed cue does not establish one unique attention problem.
- Self 1/Self 2 are model labels, not brain structures.
- Gallwey’s equation is an attributed coaching framework, not a measured calculation.
- Appropriate analysis during learning must not be confused with overcontrol during a familiar action.
- Practice variation is hypothetical or appropriately supervised; it is not punishment.

Use a local explanation of the attributed model. [Inner Game Institute](https://theinnergameinstitute.com/the-inner-game-performance/)

### 5.3 Phase 4 — The Toolkit

Preserve the 14 source sections while correcting certainty, feedback, and rehearsal claims.

| Topic / route | Teaching and source coverage | Primary saved question | Figure |
|---|---|---|---|
| 02 `task-confidence` — Confidence for a particular task | Confidence, self-efficacy, task specificity, uncertainty | “What evidence supports readiness for this task? What remains uncertain?” | Live confidence versus certainty comparison |
| 03 `preparation-evidence` — Find evidence of preparation | Mastery, modelling, feedback, rehearsal, preparation | “Choose two relevant sources of confidence. Explain what each supports and what it cannot prove.” | Live evidence/source table |
| 04 `useful-evidence` — Keep useful evidence | Effort, success, progress; account metaphor | “Identify one effort, success, and progress example from the supplied case. Explain why these are more useful than an empty affirmation.” | Corrected confidence-account diagram |
| 05 `feedback-setbacks` — Use feedback after setbacks | Useful criticism, global judgments, realistic interpretation | “Separate an observed error, useful feedback, and a judgment about the whole person. What should the performer change?” | Live feedback comparison |
| 06 `cba-routine` — A routine you can use | Believable cue, comfortable familiar breath if useful, task-appropriate attention | “Write a brief C-B-A sequence and explain why its final cue fits the task.” | Redrawn C-B-A diagram |
| 07 `rehearsal-formats` — Rehearse in a way that works for you | Imagery, perspective, written/spoken/storyboard/walkthrough alternatives | “Choose a rehearsal format and perspective. Explain how it helps prepare this particular task.” | Inclusive rehearsal-format diagram |
| 08 `disruption-rehearsal` — Rehearse disruption and recovery | Flat-tire drill, adaptation, relevant timing | “Rehearse a likely interruption and your next response. Explain what would change if the first response did not help.” | Disruption/recovery sequence |
| 09 `combine-toolkit` — Put the toolkit together | Evidence, routine, rehearsal, review | “Connect preparation evidence, a routine, and a recovery response into one usable plan. Identify one limitation.” | Corrected chapter synthesis map |

**Overview:** establish that useful action is possible while uncertain. Offer a fictional performer preparing for an audition, presentation, or sporting task.

**Three lab cases:**

1. Evidence of preparation versus unsupported certainty.
2. Useful corrective feedback versus a global identity attack.
3. Rehearsing disruption when mental imagery is unclear or unhelpful.

**Required corrections:**

- Remove certainty as a prerequisite.
- Remove guaranteed-win and predetermined-outcome language.
- Retain useful corrective feedback.
- Remove neurological equivalence and repetition-by-repetition myelin claims.
- Remove decorative VO₂, heart-rate, and power-output values.
- Allow different rehearsal representations and perspectives.
- Do not grade vivid imagery, claimed emotional control, or reported confidence.

---

## 6. Assignments, review, and checkpoint specifications

### 6.1 One five-step Build assignment per phase

Use Phase 1’s exact Build interface:

- Five step tabs.
- One visible step panel.
- Required-response count per step.
- Worked case available beside the relevant instructions.
- Earlier saved responses available through an explicit **Reuse this response** action.
- Previous/Next controls in their established positions.
- Rubric disclosure beneath the steps.
- Automatic appearance in My Work.

Reusing an answer must never silently overwrite an edited Build response.

Each assignment has **12 distinct required evidence fields**. These are short structured responses, not 12 essays.

### Phase 2: My Motivation Plan

| Step | Required fields |
|---|---|
| 1. Choose the situation | `p2-case`: task, performer and constraint. `p2-reasons`: distinguish two reasons for doing the task. |
| 2. Connect values and support | `p2-value-action`: one value and observable behaviour. `p2-needs-context`: a need and environmental adjustment. |
| 3. Make an achievable plan | `p2-goals`: outcome/performance/process goals. `p2-week-plan`: realistic actions and review point. |
| 4. Respond and get support | `p2-if-then`: barrier and response. `p2-support`: support role and request. `p2-recovery`: adjustment/support decision. |
| 5. Review and adapt | `p2-review`: evidence and revision. `p2-transfer`: adapt to a new constraint. `p2-explain`: justify a choice and identify a limitation. |

Map all 41 original Values Blueprint/Master Config controls into these fields. Combine repeated values, support, goals, recovery, and narrative prompts. Preserve the original three-value and additional reflection material in the source record; do not require redundant fresh responses.

### Phase 3: My Focus Plan

| Step | Required fields |
|---|---|
| 1. Read the situation | `p3-case`: task and changing demand. `p3-distractions`: relevant distractions and evidence. |
| 2. Move attention | `p3-attention`: appropriate focus now. `p3-shifts`: three moments and triggers for changing focus. |
| 3. Prepare a routine | `p3-cues`: instructional/motivational examples and selection. `p3-anchor`: anchor and use. `p3-routine`: before-performance sequence. |
| 4. Plan a disruption | `p3-if-then`: disruption and response. `p3-rehearsal`: appropriate walkthrough with one varied demand. |
| 5. Review and transfer | `p3-observation`: factual observation and adjustment. `p3-transfer`: unfamiliar task. `p3-explain`: why attention must change. |

Map all 17 original controls. Combine the three routine fields into one labelled sequence, while preserving their source identities in the mapping record.

### Phase 4: My Confidence and Rehearsal Toolkit

| Step | Required fields |
|---|---|
| 1. Start with evidence | `p4-case`: task, preparation and uncertainty. `p4-evidence`: effort, success and progress examples. |
| 2. Interpret feedback | `p4-sources`: two confidence sources and limits. `p4-feedback`: error, useful feedback and global judgment. `p4-belief`: believable evidence-based statement. |
| 3. Prepare and rehearse | `p4-routine`: C-B-A and context. `p4-format`: representation/perspective and reason. `p4-sequence`: cues and relevant timing. |
| 4. Rehearse a disruption | `p4-disruption`: likely interruption. `p4-recovery`: adjustment/restart, including a different representation if helpful. |
| 5. Review and adapt | `p4-review`: observation, adjustment and limitation. `p4-transfer`: changed task or constraint. |

Map all 46 original controls. Replace the mandatory top-ten achievement list with three developed evidence examples. Combine repeated rehearsal scripts into one coherent sequence.

For spoken rehearsal, students can practise aloud and save the sequence and explanation in text. A recording/upload system is outside this first preview.

### 6.2 Field-map requirements

The operational map must contain one row for each of the **104 original assignment controls**:

```text
original module
original field ID
original prompt
new evidence field ID
retained / combined / optional / withheld
reason
source location
```

Combining fields is a content-design decision, not automatic migration of old learner data. The first preview must not read original course storage.

### 6.3 Rubric

Use the same rubric presentation as Phase 1, with four dimensions:

1. Concept accuracy.
2. Evidence and task fit.
3. Usable plan.
4. Reasoning and adaptation.

Use four descriptive levels:

- **Not yet shown:** insufficient evidence.
- **Developing:** relevant but vague or incomplete.
- **Clear:** accurate, supported and workable.
- **Thoughtful:** specific, adaptable and aware of limitations.

Do not calculate a teacher grade from word count, self-rating, game score, or reviewed-topic count.

### 6.4 Written review

Use the existing one-question-at-a-time review component, with four short prompts per phase:

1. Explain an important distinction.
2. Apply a concept to a brief case.
3. Correct a plausible misconception.
4. Revisit an earlier response and explain a useful revision.

Preserve the first-answer snapshot, show the teaching answer after comparison, and provide a revision field.

Source handling:

- **Phase 2:** map all 12 original written review questions. Distribute their concepts across lesson applications, checks, lab cases and review. Revise the diagnostic recovery questions.
- **Phase 3:** the PDF’s 12 questions duplicate its multiple-choice checkpoint. Author the four written review prompts as new items.
- **Phase 4:** author four new written prompts from the corrected teaching.

Keep the Build transfer response as the distinct unfamiliar-situation task. Do not require another complete plan in Review.

### 6.5 Checkpoint banks

Retain all original checkpoint identities:

- `phase2-q1`–`phase2-q10`
- `phase3-q1`–`phase3-q12`
- `phase4-q1`–`phase4-q12`

For every item, retain original wording, choices, key and rationale in provenance. Record replacement wording, key, rationale, source and content version separately.

| Phase | Required question treatment |
|---|---|
| 2 | q1 direction/intensity scenario; q2 integrated versus intrinsic; q3 qualify need-support effects; q4 observable value/action; q5 strategy and feedback after error; q6 behaviour/global-self distinction; q7 evidence-based pride; q8 task-specific process goal; **q9 replace diagnosis with adjustment/support**; q10 contextual evidence rather than personality diagnosis. |
| 3 | q1–2 attention processes/capacity; q3 broad-external; q4 narrow-internal in a specified moment; q5–6 attributed Gallwey model; q7 nonjudgmental observation; q8 routine; q9 adaptable what-if plan; q10 cue distinction; q11 qualified redirection; q12 fully introduced free-throw case. |
| 4 | q1 confidence without certainty; q2 self-efficacy; q3 useful evidence; q4 preserve corrective feedback; q5 avoid global judgment without denying error; q6 coping rehearsal; q7 task-appropriate attention; q8 qualified appraisal; q9 purposeful rehearsal; q10 perspective chosen for purpose; q11 flexible response to unhelpful imagery; q12 relevant timing without neurological guarantees. |

Use plausible distractors. Balance answer positions approximately evenly, preserving stable choice IDs and conceptually correct keys. The original “no D answers” pattern must not carry forward.

Match Phase 1 behaviour:

- Save unfinished selections.
- Require all answers before submission.
- Preserve submitted attempts.
- Prevent repeated unchanged submissions.
- Retain the best score.
- Keep the 70% practice threshold.
- Start a new attempt explicitly.
- Never count old-version results as current-version results.

---

## 7. Figures, reading PDFs, slides, and videos

### 7.1 Preserve all 16 conceptual figures

Use the source filenames as provenance anchors. Create corrected learner versions where required.

| Phase | Source figure | Learner treatment |
|---|---|---|
| 2 | `phase2-motivation-continuum` | Redraw with amotivation separate and no compulsory ladder |
| 2 | `phase2-psychological-needs` | Clear three-needs diagram |
| 2 | `phase2-recovery-continuum` | Replace diagnostic progression with noticing, adjusting and seeking support |
| 2 | `phase2-growth-equation` | Explicitly a simplified model; no guaranteed growth |
| 2 | `phase2-person-situation` | Contextual examples, no fixed profile prescriptions |
| 2 | `phase2-integrated-discipline-system` | Simplified synthesis after the component ideas |
| 3 | `phase3-attentional-quadrants` | Four clear quadrants and examples |
| 3 | `phase3-inner-game-equation` | Attributed coaching framework |
| 3 | `phase3-precompetition-blueprint` | Readable preparation sequence |
| 3 | `phase3-reset-sequence` | Qualified, adaptable reset sequence |
| 3 | `phase3-focus-system-map` | End-of-learning synthesis |
| 4 | `phase4-confidence-account` | Clearly labelled metaphor |
| 4 | `phase4-cba-routine` | Remove physiological numbers; enlarge actual steps |
| 4 | `phase4-mental-cinema` | Include nonvisual rehearsal formats |
| 4 | `phase4-flat-tire-drill` | Disruption and recovery |
| 4 | `phase4-chapter-map` | Evidence/routine/rehearsal/review without certainty promises |

Many existing `-pro.svg` files contain embedded raster images. They must not be treated as corrected vectors merely because of the extension.

New diagrams should:

- Use simple native SVG where suitable.
- Retain the intended concept.
- Use live readable labels.
- Fit the school palette.
- Include caption, alt text and visible explanation.
- Support enlargement.
- Avoid decorative metallic frames and pseudo-monitor values.
- Remain understandable at phone width through accompanying HTML.

Record the original file, replacement file, conceptual changes and placement.

### 7.2 Reading chapter deliverables

Create:

- `phase2-drive-reading.pdf`
- `phase3-focus-reading.pdf`
- `phase4-toolkit-reading.pdf`

Generate them from the same corrected lesson content. Do not maintain independently rewritten PDF teaching.

Each chapter contains:

1. Title and phase purpose.
2. Learning goals and contents.
3. Eight Learn topics in the same order.
4. Matching numbered figures and captions.
5. Worked examples.
6. The lesson application prompts.
7. Lab-case summaries.
8. Build assignment steps and rubric.
9. Review prompts.
10. Glossary and sources.

Use Letter pages, selectable text, approximately 11.5–12pt body text, readable captions, page numbers, bookmarks where supported, and no clipped tables or split instructions.

Provide a separate clearly labelled answer/feedback section after the learner questions. Do not place a correct answer immediately beside a question intended for first-attempt retrieval.

Phase 4’s chapter is explicitly a newly authored reading, not a recovered original.

### 7.3 Original slides

Keep all original decks in the source package.

Do not link the unreconciled Phase 2 or Phase 4 decks in learner Resources. Reconcile Phase 3 before any learner placement.

The required first-pass alternate format is the new reading chapter. Replacement slide decks are not required for this milestone; no placeholder “slides coming soon” controls should appear.

### 7.4 Video shortlist and placement

Preserve all 29 catalog entries in reference records. Start with this narrow candidate list:

| Phase / lesson | Candidate | Purpose |
|---|---|---|
| 2 / Why we do the work | `tape-01`, SDT | Compare reasons for action |
| 2 / Responding to mistakes | `tape-05`, praise/motivation | Examine feedback and response to setbacks |
| 3 / Observe without judging | `tape-06`, Inner Game | Explain the attributed distinction |
| 4 / Keep useful evidence | `tape-09`, confidence account | Examine evidence-based confidence |
| 4 / Rehearse disruption | `tape-13`, scenario planning | Illustrate preparation for interruption |

These are candidates, not verified recommendations.

Before activating a video, record:

- Actual title and publisher.
- Duration and relevant segment.
- Captions/transcript availability.
- Suitability and conceptual accuracy.
- Playback result.
- Specific lesson purpose.
- One application question.
- Complete local written alternative.

If verification is unavailable, use the local explanation and keep the video out of the learner interface. Preserve its candidate record for later review.

Use one player at a time, loaded only after a learner action, with a direct publisher link. Video viewing does not become required completion.

---

## 8. Working behaviour and technical interfaces

### 8.1 Adapt the runtime deliberately

Phase 1 contains hard-coded question counts, field IDs, lab cases, events and storage identities. A global replacement of “Phase 1” is insufficient.

Prepare phase configuration for:

- Course/module identity and title.
- Numbered topic inventory.
- Build field IDs and required groups.
- Four written review records.
- Checkpoint bank and version.
- Three guided cases and their untimed equivalent.
- Resource groups.
- Game identity and protocol.

Keep routine teaching, questions, captions and links in canonical HTML. Keep inert metadata in an `application/json` block and executable behaviour in separate scripts.

There must be one navigation owner handling:

- Sidebar navigation.
- Internal links.
- Back/Forward.
- Reload/deep links.
- Focus movement.
- Opening relevant disclosures.
- Selecting the correct Build/review step when returning to a field.

### 8.2 Saving and recovery

Each phase gets an independent versioned state store, following Phase 1’s state structure.

Persist:

- Responses.
- First-answer snapshots and revisions.
- Topic-review flags.
- Checkpoint drafts and attempts.
- Guided/untimed practice.
- Game summaries and debrief.
- Note entries.
- Navigation position.

Use isolated keys such as:

```text
canvas-helper:sportswellness-phase-2:state
canvas-helper:sportswellness-phase-3:state
canvas-helper:sportswellness-phase-4:state
```

Do not automatically read legacy assignment keys or another phase’s storage.

Backup import must validate module identity, version and record types before changing live work. Show replacement information, require confirmation, and retain a recoverable prior snapshot. Invalid files leave current work unchanged.

Save and Exit flushes the final keystroke and truthfully reports **Saved in this browser.**

Preserve full permitted text. Do not solve state-capacity problems by truncating responses.

### 8.3 My Work and Quick Notes

**My Work** automatically collects all phase evidence. Use the same group order and one primary **Print or save My Work as PDF** action as Phase 1.

Every editable record links back to its original field.

**Quick Notes** remains accessible from every route:

- New note.
- Save note.
- Timestamped entries.
- Per-entry Delete.
- Immediate Undo.
- Notes included in My Work.

Keep backup/import controls in the course guide’s recovery disclosure.

Render saved text safely in both the browser and exported records.

### 8.4 Games

Retain the original games’ mechanics and localize their dependencies.

Apply only the scoped repairs:

- **Phase 2:** replace pointer-location “anxiety/choking” claims with descriptions of game input/rules; remove the dormant permanent-capacity claim.
- **Phase 3:** describe timing misses, game adjustments and streaks accurately; provide keyboard activation.
- **Phase 4:** use semantic mouse/touch/keyboard activation; distinguish useful feedback from global attacks.

All games must support appropriate start, pause, resume, restart and end behaviour. Stop timers/audio when hidden or when navigating away.

Save completed and interrupted summaries through the parent. Validate the exact iframe, origin, activity identity, version and payload.

Timed performance remains optional. The guided lab and untimed route assess the conceptual decisions.

---

## 9. Generation sequence and acceptance gates

### Step 1 — Prepare and validate the template kit

Before content generation:

- Freeze the current Phase 1 reference.
- Extract the component catalogue.
- Prepare the three phase configurations.
- Complete source/field/question/asset inventories.
- Capture reference screenshots and computed styles.
- Verify the template’s basic navigation and state isolation.

Do not require ChatGPT to infer missing shell behaviour from screenshots.

### Step 2 — ChatGPT performs an intake check

Its first response must confirm:

- All required input folders are present.
- It has opened the current Phase 1 reference.
- It understands which files are locked.
- It has located the complete assignment runtime.
- It has identified the missing original Phase 4 reading.
- It has identified all 34 checkpoint questions and 104 assignment controls.
- It has read the audit corrections.

It must report actual missing inputs before generating around them.

### Step 3 — Generate Phase 2 completely

Complete its 18 routes, questions, assignment, figures, local reading, tools and optional game.

Return the whole working folder, not disconnected HTML snippets.

Complete its content map and visual comparison report before proceeding.

### Step 4 — Generate Phase 3 from the frozen template

Use the original frozen template again. Do not copy Phase 2’s newly generated lesson HTML as the next template; that risks carrying accidental changes forward.

Apply the Phase 3 specification and repeat the same acceptance process.

### Step 5 — Generate Phase 4 from the frozen template

Apply the Phase 4 corrections, inclusive rehearsal formats, new reading chapter and corrected game controls.

Repeat the same acceptance process.

### Step 6 — Run a systematic comparison

For every one of the **54 routes across three phases**:

- Check desktop at **1117×902**.
- Check phone at **390×844**.
- Inspect the top, required activity, and page bottom.
- Inspect closed and opened completion guides.
- Inspect figures/captions.
- Inspect all controls and their parent insets.
- Verify current navigation and previous/next links.

Additionally, check shared shell/component templates at:

- 1440×900.
- 1024×902.
- 1023×902.
- 768×1024.
- 430×900.

The 1024/1023 pair specifically tests the drawer breakpoint.

Automate comparison of:

- Stylesheet hashes.
- Font family, size, weight and line-height.
- Header/sidebar dimensions.
- Content insets.
- Button dimensions and gaps.
- Component wrapper hierarchy.
- Overflow and clipping.
- Missing controls and broken assets.

Compare component geometry against the matching Phase 1 template, rather than comparing whole-page heights containing different text.

Produce labelled screenshots/contact sheets and a route-by-route result table. A single homepage screenshot does not establish parity.

### Step 7 — Test meaningful interaction states

| Area | Required scenarios |
|---|---|
| Navigation | Direct link, reload, Back/Forward, collapsed sidebar, mobile drawer, focus return |
| Guides | Start closed; open/close; jump opens and focuses actual work |
| Responses | Enter text, navigate, reload, final-keystroke Save and Exit |
| Build | All five steps; reused response; edited response protected from overwrite |
| Review | First answer, comparison, immutable snapshot, revision, restoration |
| Checkpoint | Partial resume, incomplete rejection, submission, duplicate prevention, new attempt, best score |
| My Work | Empty state, populated state, refresh after edits, return to source field |
| Notes | Save separate entries, reload, delete, Undo |
| Recovery | Malformed, unrelated and cross-module files; valid replacement; cancelled replacement |
| Storage failure | Recoverable work and backup option; no false save confirmation |
| Games | First interaction, repeated play, pause/resume, end, restart, navigation interruption, keyboard |
| Messages | Wrong iframe/origin/activity/version/payload rejected |
| Resources | Local PDFs open; player unloads; unavailable video still has full local teaching |
| Export | Safe text rendering, correct content scope, readable PDF output |

Any unavailable browser or test capability must be reported as **not run**, never passed by inspection.

### Step 8 — Return the complete handoff

Each phase folder must include:

- Working learner files.
- All active local assets.
- Revised reading PDF.
- Source-to-lesson map.
- Original-to-new assignment field map.
- Question provenance and answer keys.
- Asset and video review records.
- Content-change record.
- Visual comparison report.
- Checks actually run and unresolved items.

Return both three individual phase folders and one combined generation ZIP.

Codex then imports the external first-pass artifacts through the existing conversion workflow under the separate phase slugs. Keep the candidates blocked until their later readiness checks. Studio lifecycle, SCORM packaging, response-capacity resolution, physical-device checks, school-network media checks and Brightspace proof remain explicit rollout work.

### Master instruction to give ChatGPT Pro

> Generate Phases 2–4 using the supplied frozen Phase 1 template and this specification. Treat visual and interaction parity as a file-and-component contract. Preserve the complete stylesheet, fonts, shell structure, component wrappers and control placement. Author only within the declared phase-content and configuration areas. Account for every source section, question, assignment field and figure. Apply the audit corrections with provenance. Complete and verify one phase before beginning the next. Return working module folders, aligned reading PDFs, source maps and route-by-route comparison evidence. Do not replace missing source material with invented claims, present unverified tests as passed, or declare LMS readiness from a browser preview.

Completion means every lesson and supporting route has been accounted for, compared, and handed over with evidence—not merely that the three opening pages resemble Phase 1.
