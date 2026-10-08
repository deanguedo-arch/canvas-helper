# Fresh learner attempt: lessons 09–10 derived vocabulary

## Scope and result

I read only the two specified blind lesson extracts and the specified native derived-task prompts. I attempted every prompt from its wording and the visible teaching/glossary. Task IDs below are trace labels, not evidence for an answer. I did not inspect configuration, answer keys, model responses, source files, prior reviews, task bodies outside the supplied blind JSON, browser state or images.

**Bounded finding: 32/32 prompts have enough visible text to support the first answers recorded below. No teaching gap prevented an answer.** This measures support in the supplied learner text, not automated grading, actual learner performance, external scientific accuracy, source fidelity, target pixels or runtime behavior. No application code or runtime was run; cloud file reads, input hashing and this report write were the only filesystem operations.

The visible lesson explicitly calls milk ejection “let-down.” That is a valid alternative answer to prompts 26 and 28. Equivalent explanatory wording should also be accepted where the question requests explanation or correction. I did not test whether the native task matcher accepts alternatives.

## Input identity

SHA-256 hashes of the exact files read:

- `/workspace/scratch/6f97d4e841e3/biology_prep/ch15-batch09-10/review/lesson-09-blind.txt`: `a25ff6aff79ceb03e3aacf2c41de2adf821c3cc28a5c26130294a5f965acbac2`
- `/workspace/scratch/6f97d4e841e3/biology_prep/ch15-batch09-10/review/lesson-10-blind.txt`: `0f79ce94b99852ef0128489a8e22b06cdf267fdb4b3fad9fbc49069518993424`
- `/workspace/scratch/6f97d4e841e3/biology_prep/ch15-batch09-10/review/derived-native-tasks-blind.json`: `9c2ab68558a144ba3a428b8c3e2aef7e99e07e1381e24782584228f5fc57476f`

## Exact visible support

The labels in this section are report references to verbatim excerpts, not assessment keys. In the raw extracts, glossary labels and definitions are concatenated; the explanatory sentences below provide readable exact support where available.

### Lesson 09

- **09-A**, “Follow the message from the cervix to the uterus”: “Parturition means labour and birth.”
- **09-B**, “Use the event to distinguish the three stages”: “During dilation, the cervix thins and opens as labour progresses. During expulsion, the baby passes through the opened cervix and birth canal and is delivered. During the placental stage, the placenta separates from the uterine wall and is delivered with associated membranes.”
- **09-C**, same section: “These are birth events, long after fertilization.”
- **09-D**, glossary definition of cervical dilation: “Widening of the cervix during labour.”
- **09-E**, “Follow the message from the cervix to the uterus”: “Oxytocin is made in the hypothalamus and released into blood by the posterior pituitary. Blood carries it to uterine muscle, where it helps strengthen contractions.”
- **09-F**, glossary definition of oxytocin: “A hormone made in the hypothalamus and released by the posterior pituitary that supports uterine contractions and milk ejection.”
- **09-G**, glossary definition of positive feedback: “A response that reinforces the initiating change.”
- **09-H**, “Decide what makes the feedback positive”: “Those contractions can increase the very stretch that initiated the signalling. Because response and starting change reinforce one another, the feedback is positive.”
- **09-I**, same section: “Compare a negative-feedback response: if a rise in a hormone reduces further secretion of that hormone, the response opposes the rise.”
- **09-J**, same section: “Delivery of the baby removes much of the cervical pressure that drives this particular loop. That interrupts its amplification.”

### Lesson 10

- **10-A**, “Separate making milk from moving it”: “Lactation includes milk production and secretion by mammary glands. Within these glands, small sacs called alveoli contain secretory cells that make milk. Milk can collect in the sacs and ducts before it moves toward the nipple.”
- **10-B**, same section: “Prolactin is released by the anterior pituitary and supports milk production by the secretory cells.”
- **10-C**, same section: “Oxytocin is made in the hypothalamus and released by the posterior pituitary. It stimulates contraction of myoepithelial cells surrounding the secretory structures. Their contraction moves existing milk into ducts and toward the nipple: milk ejection, also called let-down.”
- **10-D**, glossary definition of milk ejection: “Movement of milk toward the nipple through contraction of cells around mammary secretory structures.”
- **10-E**, glossary definition of suckling reflex: “A neural and hormonal response initiated by sensory stimulation during feeding.”
- **10-F**, “Connect the neural input with the hormonal responses”: “Suckling stimulates sensory receptors in the nipple and surrounding areola. Nerve impulses carry information to the hypothalamus. This central control influences pituitary hormone release: prolactin supports production, while oxytocin supports movement of available milk.”
- **10-G**, same section: “The initial information travels along neurons toward the central nervous system. Hormones then travel in blood from their release sites to responsive mammary tissues. Milk follows a third route, through mammary ducts toward the nipple; it does not travel along nerves or return to the brain.”
- **10-H**, “Explain what placental delivery changes”: “During pregnancy, estrogen and progesterone help prepare mammary tissues. Their high concentrations also limit copious milk secretion despite the presence of prolactin. After placental delivery, these placental hormone concentrations fall. Reduced restraint allows prolactin-supported milk secretion to increase.”
- **10-I**, “Separate making milk from moving it”: “Making a substance and moving a substance already present are different jobs.”
- **10-J**, glossary definition of lactation: “Milk production and secretion by the mammary glands.”
- **10-K**, glossary definition of prolactin: “An anterior-pituitary hormone that stimulates milk production.”

## First answers, support and gaps

### 01. Explain parturition.

- Task: `ch15-concept-parturition-flash`
- First answer: Parturition is labour and birth. Its three stages are dilation, when the cervix thins and opens; expulsion, when the baby is delivered; and the placental stage, when the placenta and associated membranes are delivered.
- Exact support: 09-A and 09-B.
- Gap: None for this prompt. A shorter answer, “the process of labour and birth,” also satisfies the term explanation in the visible glossary.

### 02. Which term fits this definition? The process of labour and birth.

- Task: `ch15-concept-parturition-reverse`
- First answer: Parturition.
- Exact support: 09-A.
- Gap: None.

### 03. Correct this incorrect statement: Parturition is another word for fertilization.

- Task: `ch15-concept-parturition-misconception`
- First answer: Parturition means labour and birth, which occur long after fertilization.
- Exact support: 09-A and 09-C.
- Gap: None. Defining fertilization in more detail is unnecessary for the requested correction and was not needed from outside the visible teaching.

### 04. Name the term described: The process of labour and birth.

- Task: `ch15-concept-parturition-blank`
- First answer: Parturition.
- Exact support: 09-A.
- Gap: None.

### 05. Explain cervical dilation.

- Task: `ch15-concept-cervical-dilation-flash`
- First answer: Cervical dilation is widening of the cervix during labour. In the dilation stage, the cervix thins and opens.
- Exact support: 09-D and 09-B.
- Gap: None.

### 06. Which term fits this definition? Widening of the cervix during labour.

- Task: `ch15-concept-cervical-dilation-reverse`
- First answer: Cervical dilation.
- Exact support: 09-D.
- Gap: None.

### 07. Correct this incorrect statement: Cervical dilation is the release of milk.

- Task: `ch15-concept-cervical-dilation-misconception`
- First answer: Cervical dilation is widening of the cervix during labour. Movement of existing milk toward the nipple through contraction around mammary secretory structures is milk ejection, also called let-down.
- Exact support: 09-D, 10-C and 10-D.
- Gap: None. The first sentence alone corrects the false definition; the second distinguishes the milk-related event using the other visible lesson.

### 08. Name the term described: Widening of the cervix during labour.

- Task: `ch15-concept-cervical-dilation-blank`
- First answer: Cervical dilation.
- Exact support: 09-D.
- Gap: None.

### 09. Explain oxytocin.

- Task: `ch15-concept-oxytocin-flash`
- First answer: Oxytocin is a hormone made in the hypothalamus and released into the blood by the posterior pituitary. It supports uterine contractions during labour and milk ejection by stimulating contraction of myoepithelial cells around mammary secretory structures.
- Exact support: 09-E, 09-F and 10-C.
- Gap: None.

### 10. Which term fits this definition? A hormone made in the hypothalamus and released by the posterior pituitary that supports uterine contractions and milk ejection.

- Task: `ch15-concept-oxytocin-reverse`
- First answer: Oxytocin.
- Exact support: 09-F.
- Gap: None.

### 11. Correct this incorrect statement: Oxytocin is made by the placenta to manufacture milk.

- Task: `ch15-concept-oxytocin-misconception`
- First answer: Oxytocin is made in the hypothalamus and released by the posterior pituitary. It helps move existing milk toward the nipple by causing myoepithelial cells to contract. Prolactin from the anterior pituitary supports milk production by secretory cells.
- Exact support: 10-B and 10-C, also 09-E.
- Gap: None. Both the incorrect production site and the incorrect milk-manufacturing action are explicitly correctable.

### 12. Name the term described: A hormone made in the hypothalamus and released by the posterior pituitary that supports uterine contractions and milk ejection.

- Task: `ch15-concept-oxytocin-blank`
- First answer: Oxytocin.
- Exact support: 09-F.
- Gap: None.

### 13. Explain positive feedback.

- Task: `ch15-concept-positive-feedback-flash`
- First answer: Positive feedback occurs when a response reinforces the change that initiated it. During labour, cervical stretch promotes stronger contractions, and those contractions can increase cervical stretch. Delivery reduces the pressure driving that loop and limits its amplification.
- Exact support: 09-G, 09-H and 09-J.
- Gap: None.

### 14. Which term fits this definition? A response that reinforces the initiating change.

- Task: `ch15-concept-positive-feedback-reverse`
- First answer: Positive feedback.
- Exact support: 09-G.
- Gap: None.

### 15. Correct this incorrect statement: Positive feedback always returns a variable toward its starting value.

- Task: `ch15-concept-positive-feedback-misconception`
- First answer: Positive feedback reinforces or amplifies the initiating change. A response that opposes that change is negative feedback. In the labour example, stronger contractions can produce more of the stretch that started the response.
- Exact support: 09-G, 09-H and 09-I.
- Gap: None. The answer does not require claiming that all negative-feedback systems return precisely to a previous value.

### 16. Name the term described: A response that reinforces the initiating change.

- Task: `ch15-concept-positive-feedback-blank`
- First answer: Positive feedback.
- Exact support: 09-G.
- Gap: None.

### 17. Explain lactation.

- Task: `ch15-concept-lactation-flash`
- First answer: Lactation is milk production and secretion by the mammary glands. Secretory cells make milk with support from prolactin. Oxytocin supports the separate process of moving existing milk toward the nipple.
- Exact support: 10-A, 10-B, 10-C and 10-J.
- Gap: None. The glossary definition alone is sufficient for a short term explanation.

### 18. Which term fits this definition? Milk production and secretion by the mammary glands.

- Task: `ch15-concept-lactation-reverse`
- First answer: Lactation.
- Exact support: 10-J and 10-A.
- Gap: None.

### 19. Correct this incorrect statement: Lactation is controlled only by progesterone.

- Task: `ch15-concept-lactation-misconception`
- First answer: Several signals influence lactation. Prolactin supports milk production, and oxytocin supports milk ejection. Suckling provides sensory input that influences pituitary hormone release. Estrogen and progesterone help prepare mammary tissue during pregnancy, but their high concentrations also limit copious milk secretion; their fall after placental delivery allows secretion to increase.
- Exact support: 10-B, 10-C, 10-F and 10-H.
- Gap: None. The requested “only progesterone” misconception can be corrected even with the shorter production/ejection comparison; the text supplies the wider hormonal context too.

### 20. Name the term described: Milk production and secretion by the mammary glands.

- Task: `ch15-concept-lactation-blank`
- First answer: Lactation.
- Exact support: 10-J and 10-A.
- Gap: None.

### 21. Explain prolactin.

- Task: `ch15-concept-prolactin-flash`
- First answer: Prolactin is a hormone released by the anterior pituitary that stimulates or supports milk production by mammary secretory cells.
- Exact support: 10-B and 10-K.
- Gap: None.

### 22. Which term fits this definition? An anterior-pituitary hormone that stimulates milk production.

- Task: `ch15-concept-prolactin-reverse`
- First answer: Prolactin.
- Exact support: 10-K and 10-B.
- Gap: None.

### 23. Correct this incorrect statement: Prolactin’s main action is squeezing milk out of ducts.

- Task: `ch15-concept-prolactin-misconception`
- First answer: Prolactin mainly supports production of milk by secretory cells. Oxytocin stimulates contraction of myoepithelial cells around mammary secretory structures, moving existing milk into ducts and toward the nipple.
- Exact support: 10-B and 10-C.
- Gap: None. The corrected mechanism specifies contraction around secretory structures rather than repeating the prompt's imprecise “squeezing milk out of ducts.”

### 24. Name the term described: An anterior-pituitary hormone that stimulates milk production.

- Task: `ch15-concept-prolactin-blank`
- First answer: Prolactin.
- Exact support: 10-K and 10-B.
- Gap: None.

### 25. Explain milk ejection.

- Task: `ch15-concept-milk-ejection-flash`
- First answer: Milk ejection, or let-down, is movement of existing milk into ducts and toward the nipple when myoepithelial cells around mammary secretory structures contract. Oxytocin stimulates this contraction.
- Exact support: 10-C and 10-D.
- Gap: None.

### 26. Which term fits this definition? Movement of milk toward the nipple through contraction of cells around mammary secretory structures.

- Task: `ch15-concept-milk-ejection-reverse`
- First answer: Milk ejection.
- Valid alternative: Let-down.
- Exact support: 10-D defines the process; 10-C explicitly names “milk ejection, also called let-down.”
- Gap: None in teaching. Whether the task accepts the explicitly taught synonym was not tested.

### 27. Correct this incorrect statement: Milk ejection and milk synthesis are identical events.

- Task: `ch15-concept-milk-ejection-misconception`
- First answer: Milk synthesis means making milk in secretory cells, supported by prolactin. Milk ejection means moving milk that is already present toward the nipple through contraction of surrounding myoepithelial cells, stimulated by oxytocin. Milk can be made and present before it is ejected.
- Exact support: 10-A, 10-B, 10-C and 10-I.
- Gap: None. Although “synthesis” is not itself a glossary term in these extracts, the contrast with making/production versus moving existing milk provides enough context to answer this prompt without outside subject facts.

### 28. Name the term described: Movement of milk toward the nipple through contraction of cells around mammary secretory structures.

- Task: `ch15-concept-milk-ejection-blank`
- First answer: Milk ejection.
- Valid alternative: Let-down.
- Exact support: 10-D defines the process; 10-C explicitly names “milk ejection, also called let-down.”
- Gap: None in teaching. Whether the task accepts the explicitly taught synonym was not tested.

### 29. Explain suckling reflex.

- Task: `ch15-concept-suckling-reflex-flash`
- First answer: The suckling reflex is a neural and hormonal response to sensory stimulation during feeding. Receptors in the nipple and areola detect suckling, and nerve impulses carry information to the hypothalamus. Central control influences pituitary release of prolactin, which supports milk production, and oxytocin, which supports milk ejection. The hormones travel through blood to mammary tissues.
- Exact support: 10-E, 10-F and 10-G.
- Gap: None. The visible text is sufficient without adding unprovided details of the central control mechanism.

### 30. Which term fits this definition? A neural and hormonal response initiated by sensory stimulation during feeding.

- Task: `ch15-concept-suckling-reflex-reverse`
- First answer: Suckling reflex.
- Exact support: 10-E.
- Gap: None within the supplied lesson vocabulary. The definition is broad in isolation, but the visible glossary directly establishes the intended term.

### 31. Correct this incorrect statement: Milk itself must travel to the brain to trigger the reflex.

- Task: `ch15-concept-suckling-reflex-misconception`
- First answer: Suckling sends sensory nerve impulses toward the hypothalamus; milk does not travel to the brain. Hormones then travel in blood to responsive mammary tissues, while milk moves through ducts toward the nipple.
- Exact support: 10-F and 10-G.
- Gap: None. The lesson directly distinguishes the routes for information, hormones and milk.

### 32. Name the term described: A neural and hormonal response initiated by sensory stimulation during feeding.

- Task: `ch15-concept-suckling-reflex-blank`
- First answer: Suckling reflex.
- Exact support: 10-E.
- Gap: None within the supplied lesson vocabulary; the glossary gives this exact definition.

## Boundaries of this review

- All eight Explain-term, eight reverse-definition, eight misconception-correction and eight blank prompts were attempted once here, for 32 first answers total.
- Reverse-definition and blank prompts reuse the same definitions; their separate successful attempts show text coverage of both prompt forms, not 16 independent biological concepts.
- No response depended on an unseen figure. Figure captions and instructional prose were present in the extracts, but target images were not opened or evaluated.
- All support judgments concern visible lesson text. The lesson's external/source-science assertions were neither checked nor endorsed by this exercise.
- No answer-key comparison, automated acceptance test, assessment-body inspection or target-site verification was performed.
