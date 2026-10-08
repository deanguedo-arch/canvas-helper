# Fresh learner first attempt: Chapter 14 lessons 07–08

## Result before feedback

I completed all 17 requested attempts using the learner-visible lesson explanations and figures alone. Every required answer has sufficient visible support; I did not need the textbook, teacher source, an answer key, feedback, or additional science knowledge to supply a missing causal step. The two new applications can also be answered, with an important qualification in lesson 08: the prompt says a sustained estrogen *rise*, while the explanation requires estrogen to be sufficiently *high* and sustained for the expected positive-feedback response.

The two seven-page static packets contain all 17 tasks and all 28 substantive multiple-choice options. I inspected all 14 supplied page images, both linked original SVGs, and the meaningful diagram pixels. An independent high-resolution render from lesson-08.pdf confirms a real graphic defect: the FSH legend sample partly crosses its label, and the estrogen and progesterone samples cross their labels. The words remain decipherable, and the adjacent prose identifies the patterns, but the legend should be repaired. Lesson 07's identical downward arrows retain a potential causal ambiguity, explicitly corrected by the visible prose and the diagram's overlap note.

This is a static content/print review, not a native interface, save-state, unlock, keyboard, or screen-reader test. No feedback or external content was opened before this report. First-attempt answers below are frozen pending feedback.

## Materials and method

- Blind learner HTML: `review-blind/lesson-07.html` and `review-blind/lesson-08.html`
- Linked original diagrams: `assets/cycle-coordination.svg` and `assets/cycle-hormones.svg`
- Actual print packets: `review-rendered-final/lesson-07.pdf` and `lesson-08.pdf`
- Read both supplied extracted-text files, inspected every page PNG, then independently checked the actual PDFs with `pdfinfo` and `pdftotext`
- Independently rasterized lesson 08 page 4 at 170 dpi to verify the legend overlap in actual PDF pixels
- No textbook links, video, original teacher material, hidden feedback, previous reports, or answer keys consulted
- Page references below are packet pages, not textbook pages

## Lesson 07: eight attempts

### 1. Required selection 1

**Prompt:** What most directly links corpus-luteum regression with menstruation?

**Answer:** A fall in progesterone and estrogen (option 1).

**Visible support and consequential steps:**
1. Page 2, “Menstrual flow overlaps early follicular activity,” says the corpus luteum regresses and progesterone/estrogen output falls.
2. The next sentence states that the lining loses support and part is shed.
3. Page 4, “The end of one cycle helps explain the start of the next,” repeats that causal chain. Thus the linking event is falling hormones, rather than movement of the corpus luteum or an unrelated reproductive event.

### 2. Required selection 2

**Prompt:** Which statement uses the 28-day model appropriately?

**Answer:** It illustrates a sequence; actual cycle lengths and ovulation timing can vary (option 2).

**Visible support and consequential steps:**
1. Page 2 calls 28 days an illustration, places ovulation near day 14, and expressly says it is not everybody's timetable or a guarantee of pregnancy-free days.
2. Page 3 states that the release event defines the phase boundary, and that a later stated ovulation moves that boundary.
3. Page 2 expressly includes early menstrual-flow days within the follicular phase. These passages also rule out the other three choices.

### 3. Required written explanation 1

**Prompt:** Connect ovarian and uterine events before and after ovulation. Include the source and effect of estrogen and progesterone.

**My answer:** Before ovulation, a developing follicle in the ovary releases estrogen. Estrogen reaches the uterine lining through the blood and helps the endometrium grow or rebuild. Ovulation releases the secondary oocyte, and the follicular tissue left in the ovary forms the corpus luteum. After ovulation, the corpus luteum releases progesterone and some estrogen. These hormones support and prepare the lining for possible implantation. If pregnancy is not established, the corpus luteum becomes less active, estrogen and progesterone fall, and part of the lining is shed as menstrual flow. The ovarian structures remain in the ovary; the hormones connect them to the uterus.

**Visible support and consequential steps:**
- Source/location → signal transport → endometrial growth: page 2, “Two locations can change at the same time,” especially paragraphs 1–3
- Release → remaining follicular tissue → corpus luteum: page 3, “Ovulation changes the main ovarian structure,” paragraphs 1–2
- Corpus-luteum hormones → lining maintenance/preparation: same paragraph, reinforced by the right column of the page 4 diagram
- Regression → hormone withdrawal → shedding: page 4, “The end of one cycle helps explain the start of the next,” paragraph 1
- No structure travels into the lining: page 2 hormone-transport paragraph and page 3 final paragraph

### 4. Required written explanation 2

**Prompt:** Why can menstrual flow and follicular development occur at the same time?

**My answer:** They occur in different organs and describe different events. Menstrual flow is shedding from the uterus after the previous corpus luteum's hormone output falls. Follicular development takes place in an ovary. As the previous hormonal restraint declines, FSH can support new follicular development while the uterus is still shedding. Therefore early menstrual-flow days can also be part of the ovarian follicular phase. The developing follicle does not directly cause that menstrual flow merely because the two events overlap.

**Visible support and consequential steps:**
- Different organ/event categories: page 2, both main headings
- Previous regression → hormone fall → uterine shedding: page 2, second paragraph under “Menstrual flow overlaps early follicular activity”
- Falling restraint → FSH-supported follicle development can already be underway: following paragraph
- Overlap is not new-follicle causation: final paragraph on page 2 and page 3 arrow explanation
- Visual cross-check: page 4 left paired boxes and explicit “Flow overlaps early follicular development” note

### 5. Guided selection 1

**Prompt:** On day 2 of the illustrative cycle, menstrual flow is occurring. Which ovarian phase is also underway?

**Answer:** Follicular phase (option 1).

**Visible support and consequential steps:** Page 2 defines the follicular phase as before ovulation and explicitly says menstruation is not a separate ovarian phase that must finish first. Page 3 includes the early flow days within the follicular phase; page 4 pairs early follicular development with flow. Day 2 in this model therefore fits that overlap.

### 6. Guided selection 2

**Prompt:** Progesterone has risen after ovulation. Which ovarian structure is the main source in this cycle?

**Answer:** Corpus luteum (option 2).

**Visible support and consequential steps:** Page 2 directly identifies the post-ovulatory source as corpus luteum, and page 3 explains its formation from remaining follicular tissue. Page 4's right column links active corpus luteum with progesterone-supported maintenance. The uterus and oocyte are not the identified ovarian source.

### 7. Stop and think

**Prompt:** Does an oocyte's failure to be fertilized cause menstruation the next day?

**My answer:** No. Loss of the unfertilized oocyte does not instantly stop the corpus luteum from making hormones. The corpus luteum can keep supporting the lining for days. Menstrual flow follows its later decline and the fall in progesterone and estrogen, so failure of fertilization alone does not establish next-day bleeding.

**Visible support and consequential steps:** Page 4, “The end of one cycle helps explain the start of the next,” paragraphs 1–2 supplies every link: continuing tissue activity after oocyte loss, later hormone withdrawal, and then shedding. No exact number of days is provided or needed.

### 8. New optional application

**Prompt:** Ovulation occurred on day 18; on day 16 a follicle was developing and estrogen was rising. Identify day 16's ovarian phase, normal uterine effect, and why classifying every day after 14 as luteal fails.

**My answer:** Day 16 is still in the follicular phase because it is before the stated ovulation on day 18. Estrogen from the developing follicle would normally support rebuilding and growth of the endometrium. The luteal phase begins after ovulation, not automatically after calendar day 14. Applying the illustration's day 14 to this record would put the phase boundary two days before the stated release event.

**Visible support and consequential steps:**
1. Page 2 definitions distinguish before-ovulation follicular and after-ovulation luteal phases.
2. Page 3 explicitly says a later stated ovulation shifts the phase boundary.
3. Page 2 identifies follicular estrogen's normal endometrial-growth effect; page 4 middle column reinforces it.
4. Applying 16 < 18 is sufficient; no unstated biological timing is needed.

## Lesson 08: nine attempts

### 9. Required selection 1

**Prompt:** Which hormone change most directly triggers ovulation in the usual cycle?

**Answer:** LH surge (option 3).

**Visible support and consequential steps:** Page 2, “Sustained high estrogen precedes the LH surge,” says the LH surge helps trigger secondary-oocyte release and formation of the corpus luteum. The page 4 figure associates the narrow LH peak with the ovulation landmark, but the causal wording comes from the explanation rather than curve shape alone.

### 10. Required selection 2

**Prompt:** Why is the pre-ovulatory estrogen–LH relationship an example of positive feedback?

**Answer:** High estrogen promotes increased pituitary stimulation leading to an LH surge (option 4).

**Visible support and consequential steps:**
1. Page 2 defines positive feedback as reinforcement/amplification.
2. The same section identifies sufficiently high, sustained follicular estrogen as promoting a strong pituitary LH surge.
3. Its final paragraph explicitly rejects permanent removal of every inhibition or hormone levels becoming fixed.
4. Page 3's opening paragraph states the necessary conditions and direction. This is sufficient to choose the intended option without inventing an additional endocrine mechanism.

### 11. Required written explanation 1

**Prompt:** Explain the normal order of estrogen, LH and progesterone changes around ovulation. Name the relevant ovarian structures.

**My answer:** As a dominant follicle develops, its estrogen output rises. Near the end of follicular development, sufficiently high estrogen sustained over time promotes positive feedback and a surge of LH from the anterior pituitary. The LH surge helps trigger ovulation, releasing the secondary oocyte. The remaining follicular tissue forms the corpus luteum. This active ovarian structure releases progesterone and some estrogen, so the broad progesterone rise comes after the ovulatory landmark and supports the endometrium. The figure therefore shows estrogen rising first, the brief LH surge next, and the later broad progesterone rise.

**Visible support and consequential steps:**
- Developing dominant follicle → estrogen: page 2, “Name the hormone source before interpreting a curve,” paragraph 3
- Sustained sufficiently high estrogen → pituitary LH surge: page 2, next heading, paragraph 1
- LH surge → release and remaining-tissue corpus luteum: next paragraph
- Active corpus luteum → progesterone and some estrogen → lining support: page 3, “Follow the post-ovulatory ovarian output,” paragraph 1
- Sequence cross-check on shared day marks: page 3 graph-reading explanation and page 4 figure, where estrogen's large earlier peak precedes the day-14 LH peak and progesterone's broad maximum is near day 21

### 12. Required written explanation 2

**Prompt:** Two curves use different vertical scales. Explain why comparing their visual heights may be misleading and describe a comparison you can still make.

**My answer:** Equal heights can represent different values when the vertical scales differ, so the taller-looking curve is not necessarily the larger concentration. I would first check each scale and its units. In the worked example, a point three-quarters up a 0–20 units/L scale is 15 units/L, while a lower-looking point halfway up a 0–200 units/L scale is 100 units/L. The cycle figure does not supply numerical concentration scales at all, so I cannot calculate a concentration ratio from its heights. Because its panels share the same cycle-day axis, I can still compare when rises and peaks occur: the estrogen rise precedes the LH surge and the broad progesterone rise follows it. I can also describe rising or falling within a single curve.

**Visible support and consequential steps:**
- Scale rather than displayed height controls numeric meaning: pages 4–5 worked example with both calculations shown
- Retained figure has relative level, no concentration units or vertical numeric ticks, and separately scaled curves: page 3 graph-reading section and page 4 pixels/caption
- Timing comparison is valid because the same day marks are used: page 3, paragraphs 3–4 of that section and aligned day ticks in page 4 figure
- I make the shared-horizontal-axis condition explicit; different vertical scales alone would not establish that arbitrary new graphs have comparable time axes.

### 13. Guided selection 1

**Prompt:** What change most directly precedes the LH surge in the normal model?

**Answer:** Sustained high estrogen from the developing follicle (option 3).

**Visible support and consequential steps:** The page 2 heading and following paragraph give this exact order and condition. The earlier teal rise and narrow reddish peak on page 4 corroborate timing; the source and high/sustained condition are supplied by the prose.

### 14. Guided selection 2

**Prompt:** A broad progesterone rise occurs after the LH peak. What ovarian change explains it?

**Answer:** Formation of an active corpus luteum (option 1).

**Visible support and consequential steps:** Page 2 explains remaining follicular tissue forming corpus luteum. Page 3 says the active corpus luteum produces progesterone, and explicitly connects the broad later rise with the change from follicle to corpus luteum. The graph's dashed broad later trace matches that account.

### 15. Stop and think

**Prompt:** Is estrogen's feedback always negative?

**My answer:** No. Through much of follicular development, estrogen contributes to negative feedback that limits pituitary stimulation, especially FSH. Near ovulation, sufficiently high estrogen sustained over time temporarily promotes positive feedback and the LH surge. The direction depends on the stage and sustained signal; not every estrogen increase produces the surge. After ovulation, luteal hormones contribute to negative feedback again.

**Visible support and consequential steps:** Page 2 establishes the usual inhibitory contribution and temporary positive-feedback condition; page 3 contrasts the conditions and describes post-ovulatory negative feedback. No numerical threshold or extra signaling mechanism is assumed.

### 16. New optional application

**Prompt:** A record shows a sustained estrogen rise but no recorded LH surge in the following interval. What expected relationship is missing, and why does this alone neither prove a particular cause nor establish that ovulation never occurred?

**My answer:** The record does not show the normal expected sequence of sufficiently high, sustained estrogen being followed by a pituitary LH surge. But “a sustained rise” alone does not tell me that the estrogen level was high enough to meet the lesson's stated condition. Also, an unrecorded brief surge may have fallen between measurements or outside the observation interval. I can say that this record has not demonstrated the expected estrogen-to-LH relationship; I cannot identify a particular biological fault or conclude that ovulation never happened from this observation alone.

**Visible support and consequential steps:**
1. Page 2 requires sufficiently high estrogen sustained over time, not merely any increase.
2. Page 3 says a single measurement without timing and pattern does not establish the feedback response, and directs the learner to state what a new record does not establish.
3. Page 4's sampling-limit paragraph explicitly gives the between-measurements/outside-interval explanations and warns against inferring absence of an event from a missing recorded peak.
4. Those limits justify withholding a cause or never-ovulated conclusion. No diagnosis, additional hormone pathway, or hidden test result is supplied.

**Prompt qualification:** If the intended transfer is solely the missing response/sampling distinction, “sustained high estrogen” would align more tightly with the taught prerequisite. As written, recognizing the unestablished height condition is a defensible and well-supported part of the answer, not a reason to force a pathology explanation.

### 17. Original saved optional positive-feedback written application

**Prompt:** Explain the positive-feedback relationship leading to the LH surge before ovulation. Contrast it with estrogen's inhibitory contribution at other stages.

**My answer:** A developing follicle releases estrogen. Through much of the follicular phase, estrogen contributes to negative feedback that limits further pituitary stimulation, especially FSH. Near the end of follicular development, estrogen that is sufficiently high and sustained changes the feedback response. It promotes a strong LH surge from the anterior pituitary, amplifying activity in the pathway. The LH surge helps trigger ovulation and the changes that form the corpus luteum. This positive-feedback interval is temporary; it does not mean all estrogen rises increase LH or that inhibition disappears permanently. After ovulation the corpus luteum releases progesterone and some estrogen, and the luteal hormones contribute to negative feedback on the hypothalamic-pituitary system.

**Visible support and consequential steps:**
- Estrogen source and inhibitory contribution: page 2, hormone-source section
- Condition-dependent positive-feedback direction and LH surge: page 2, sustained-high-estrogen section and page 3 opening paragraph
- Temporary nature and exclusion of permanent inhibition loss: page 2 final paragraph
- Post-ovulatory source and negative-feedback role: page 3, first post-ovulatory paragraph

## All selection options checked

All eight selection prompts and all 28 substantive options appear completely in both the blind HTML and the actual packet text. All are visible without clipping on the rendered task pages.

| Task | Option sequence in packet | First-attempt choice |
|---|---|---|
| L07 required 1 | Fall in progesterone and estrogen; corpus luteum entering cervix; new oocyte becoming diploid; rise in sperm production | 1 |
| L07 required 2 | Guaranteed pregnancy-free days; illustrative sequence with variable timing; everybody day 14; follicular phase only after flow | 2 |
| L07 guided 1 | Follicular; ovulation; luteal | 1 |
| L07 guided 2 | Endometrium; corpus luteum; unfertilized oocyte | 2 |
| L08 required 1 | Fall in all pituitary hormones; inhibin peak alone; LH surge; corpus-luteum regression | 3 |
| L08 required 2 | Progesterone already caused menstruation; concentrations fixed; all inhibition permanently removed; high estrogen promotes pituitary stimulation/LH surge | 4 |
| L08 guided 1 | Fall in all ovarian hormones; end-cycle regression; sustained high follicular estrogen | 3 |
| L08 guided 2 | Active corpus luteum formation; every follicular cell lost; oocyte becomes hormone-producing gland | 1 |

“Choose an answer” placeholders and inactive buttons are appropriately omitted from the static option lists; they are not answer options.

## Packet integrity and page-by-page visual inspection

Both actual PDFs report seven A4 pages, no interactive forms, and no JavaScript. Each contains one occurrence of each required selection/writing label. All writing prompts retain their character-limit/in-own-words guidance; lesson 08 retains the saved optional response and its 5000-character limit. The static packet makes its inactive/answers-withheld status explicit. It does not demonstrate native progress or save behavior.

| Packet page | Inspected contents and finding |
|---|---|
| L07 p1 | Title, goal, prerequisite, completion instructions, reading links, vocabulary. Readable, complete; vocabulary continues on p2 |
| L07 p2 | Remaining definitions, organ distinction, hormonal links, phase overlap and FSH support. Dense but readable; no clipped lines |
| L07 p3 | Teacher-landmark clarification, phase boundary, corpus-luteum formation, detailed diagram-reading instructions. Readable; large lower white area follows section |
| L07 p4 | Original coordination diagram, caption, cycle-end causal sequence and target-response bridge. All labels readable; “Worked example” left at page bottom with example on p5 |
| L07 p5 | Worked example, new application, both guided questions and every option. Readable; “Stop and think” appears alone at bottom, with its prompt on p6 |
| L07 p6 | Stop prompt, video alternative explanation, both required selections and eight options. Readable and complete |
| L07 p7 | Both required writing prompts, limits, answer-withheld notices, navigation. Readable; no answer space beyond instruction to respond separately |
| L08 p1 | Title, goal, prerequisite, workflow, reading links and definitions. Readable and complete |
| L08 p2 | Vocabulary, hormone-source sequence, negative/positive-feedback conditions. Readable; final sentence splits across pages, leaving “cycle.” alone at top of p3 |
| L08 p3 | Feedback comparison, post-ovulatory sequence, detailed actual-graph instructions. Readable; the last sentence's “day 14” splits, leaving “14.” at top of p4 |
| L08 p4 | Sampling limit, original two-panel figure, caption, numerical scale worked example. Graph and prose readable except legend sample/text overlap described below; example continues on p5 |
| L08 p5 | Remainder of worked example, new optional application, both guided prompts/options, stop prompt, video introduction. Readable; video's explanatory alternative follows on p6 |
| L08 p6 | Video explanation, required selections/eight options, first required writing prompt. Readable and complete |
| L08 p7 | Second required writing prompt and original saved optional positive-feedback writing. Readable and complete |

The plain PDF omits some web-only labels/controls, including “View larger,” start/check/save/finish buttons, “Optional embedded reading,” and the final optional textbook-practice heading. No required task, new optional task, original saved application, core explanation, diagram, or substantive option was lost. Static text still describes live controls, but the first-page static-copy banner prevents interpreting the packet itself as a working interface.

## Diagram inspection: scales, arrows and actual pixels

### Lesson 07 coordination graphic

- Top row visibly labels ovary; bottom row labels uterus. All six box labels fit, and arrowheads are visible.
- Top horizontal arrows make left-to-right progression clear. There are no numerical durations; equal box widths cannot be read as equal phase lengths.
- First vertical arrow visually has the same appearance as the later estrogen/progesterone links. By itself it can imply that developing follicles cause shedding.
- The visible preceding lesson text directly warns that the first arrow denotes overlap, not causation, and the diagram itself says “Flow overlaps early follicular development” plus the preceding hormone-decline explanation. Consequently I did not need to invent a causal fix when answering.
- Residual recommendation: if the retained figure is ever revised, distinguish the first overlap connector from hormonal-effect arrows or label each connector. For this review, the full lesson resolves the ambiguity; the figure alone is weaker.
- No movement of tissue between organs is necessary or supported; the explanation expressly prevents that interpretation.

### Lesson 08 hormone graphic

- Both horizontal axes show 1, 7, 14, 21 and 28 at matching positions. The labels identify cycle day and day 1 as the start of flow.
- Both vertical axes say “Relative level”; no numerical vertical ticks or concentration units are present. The prose and caption explicitly say the curves are separately scaled. A ratio or numerical rate cannot be read from the picture.
- Solid reddish LH shows the narrow peak near day 14; dashed brown FSH shows a smaller coincident rise and an early modest rise. The larger pre-ovulatory solid teal estrogen peak precedes LH, with a smaller later estrogen rise. Dashed dark-green progesterone has a broad later maximum near day 21.
- Low curves sit above the drawn bottom axis, consistent with the explanation's warning that low does not establish absence.
- Dashed versus solid styling is present in both panels and is useful beyond color.
- **Confirmed graphic defect:** legend samples partly overlay FSH, Estrogen and Progesterone text. This is visible in the supplied p4 PNG and an independent 170-dpi render of the actual PDF. The original SVG centers label text at x=165/405 but places sample strokes at x=120–148/360–388, so longer words intrude into the stroke region. The lower labels also sit closely beneath the upper panel's day ticks.
- This does not make the answers unknowable because the text explicitly maps each color/pattern to a hormone. It does prevent calling the graphic visually clean. Separate sample strokes from start-aligned labels with a real horizontal gap; give the lower legend its own vertical space if permitted to revise the asset.
- Numerical worked-example values are explicitly invented, share units, start at zero and are bounded as a scale-reading demonstration. They are not presented as actual hormone reference values.

## Decisions and next step

1. Content sufficiency: all 17 attempts answerable from the visible lesson; no missing indispensable teaching step found.
2. Integrity: all specified tasks/options preserved in both seven-page static packets.
3. Graphic QA: repair the hormone legend overlap before claiming clean diagram rendering. Coordination-arrow ambiguity is explicitly mitigated but remains a figure-only design risk.
4. Print polish: keep headings with following content and avoid isolated “cycle.”/“14.” continuation fragments if another print pass is in scope. These are minor pagination issues, not content loss.
5. Prompt precision: consider “sustained high estrogen” in the new lesson-08 application, or accept recognition that the high-level prerequisite is not established by “sustained rise.”
6. Await feedback release before grading or revising these frozen first-attempt answers.
