# Lesson 02 teaching sequence — v0.4.0

## Decision and scope

This is the section-level sequence implemented in the complete lesson-02 candidate, **Mendel’s experiments and segregation**. It addresses Dean’s comparison comments about actual PowerPoint slides 13 and 14: explain why the idea is being examined, make the contrast concrete, and guide observation before supplying its interpretation. The experimental stages now precede the disappearance/reappearance problem and the later chromosome explanation. Useful causal and quantitative reasoning remains in the lesson.

Current authority is the supplied `Biology30_CH17_Lesson02_Teacher_Trial_v0.4.0_Source.zip`, specifically `SCOUT_AND_PRO_TASK.md`, `USER_COMMENTS.md`, both supplied teaching standards, the current native lesson files and contracts, and the original sources inside that packet. Older returns are context, not replacement owners. This document records teaching decisions; it does not represent Dean’s acceptance of the exact copy or native integration.

The lesson’s answerable question is how a recessive phenotype can be absent from F1 appearance and occur in F2 without an inherited allele blending away or being recreated. That full problem is posed after the learner has followed the experiment, rather than used as an unexplained opening conclusion.

## Actual earlier prerequisite passages

These references identify passages actually present in source-packet `current/lesson-01.html`; they are not assumptions that earlier returned manuscripts were accepted.

| Reference | Native passage | What it supplies to lesson 02 |
| --- | --- | --- |
| P1 | `ch17-l01-teaching-01-p1` | Gene as a DNA sequence, alleles as versions, and one allele inherited from each parent in the stated diploid autosomal model. |
| P2 | `ch17-l01-teaching-01-p2` | Genotype as the allele combination, phenotype as the observed or measured characteristic. |
| P3 | `ch17-l01-teaching-02-p1` | A complete-dominance mapping in which two genotypes share the dominant phenotype. |
| P4 | `ch17-l01-teaching-02-p2` | Homozygous and heterozygous; dominance describes heterozygote expression and does not mean common, healthy or strong. |
| P5 | `ch17-l01-teaching-02-p3` | A stated model is necessary; human eye colour is not assumed to be a simple single-gene dominant/recessive fact. |
| P6 | `ch17-l01-teaching-03-p1` | Define letters before solving; use the same letter for alleles of one gene. |
| P7 | `ch17-l01-teaching-03-p2` and worked example `ch17-l01-worked` | A dominant appearance alone leaves two possible genotypes; more parent or offspring evidence can resolve that uncertainty. |

Lesson 02 restates consequential meanings where they are used and supplies its own chromosome, locus, copying, meiosis, haploid, spore, mitosis, gamete and fertilisation explanations. The learner is not required to infer that account from the brief lesson-01 “Before you begin” strip. The optional source-bank linkage task elsewhere in lesson 01 is not treated as evidence that linkage has already been taught.

## Four preserved outer containers

| Exact outer ID | Exact native class | Implemented instructional job |
| --- | --- | --- |
| `ch17-l02-teaching-01` | `content-section` | Orient the investigation, notice contrasting pea forms, establish starting lines and controlled parentage, follow flower P/F1/F2, pose the problem, then explicitly change to seed shape and define R/r. |
| `ch17-l02-teaching-02` | `content-section` | Explain the one-locus chromosome/copying/separation account, its plant reproductive context, and the resulting single-allele contributions. |
| `ch17-l02-worked` | `worked-example` | Explain seed-shape F1 and F2 from gametes; read the source square; justify probabilities and groupings; retain the exact process-label repair activity. |
| `ch17-l02-teaching-03` | `content-section` | Compare predicted proportions with observed counts, separate the jobs of the mechanisms, return to flower colour, retain the exact reciprocal-parent activity and connect to later work. |

Matching native edit-key attributes remain attached to the four outer containers. This sequence does not propose header, route, assessment, CSS, runtime or storage changes.

## Section jobs in the implemented order

### 1. Why Mendel compared pea plants

**Prior understanding:** P2–P4 establish dominance as a relationship between genotype and appearance. **Why now:** the learner needs to know why crosses and offspring observations are relevant before receiving another inheritance rule. The opening distinguishes learning an established relationship today from Mendel inferring it from evidence.

**Visual/noticing:** purple and white flowers are introduced as a concrete proposed cross; a pale-purple blending prediction is identified as something offspring evidence could address. The opening does not announce the F2 result.

**Result and available attempt:** the learner can state what the investigation compares and why known parents plus offspring observations matter. This is orientation, not an added response field.

**Sources:** actual slide 13; textbook printed 587/PDF 4 and the experimental account on printed 588/PDF 5; `USER_COMMENTS.md`, comment 1.

### 2. Make the contrast visible

**Prior understanding:** P2 and the opening question. **Why now:** “contrasting traits” must correspond to recognizable forms before the experiment uses them as categories.

**Visual/noticing:** actual slide 14 `ppt/media/image25.png`, placed as `./assets/teaching-v040/slide-14-image25.png`, shows six pea contrasts. The learner finds purple/white flowers, then round/wrinkled seeds, and distinguishes forms within a characteristic from different characteristics. The seed-colour drawing is read honestly: yellow is left and green is right despite the caption’s reversed word order.

**Result and available attempt:** identify what an observer could record, and distinguish an observed phenotype from an unseen allele combination. This image is neither a cross nor an offspring chart. It is not a human eye.

**Sources:** actual slide 14; textbook Figure 17.4, printed 588/PDF 5; `USER_COMMENTS.md`, comment 2. The textbook’s seventh trait, flower position, is not falsely attributed to the six-contrast slide image.

### 3. Choose starting plants whose breeding history is known

**Prior understanding:** P3, P4 and P7; visible appearance does not establish a unique genotype. **Why now:** the starting genotypes used later need evidence rather than a convenient assumption.

**Visual/noticing:** the contrasting plants just inspected remain the concrete referents. The explanation adds true-breeding history, self-pollination, controlled donor choice, and the distinction between pollination and fertilisation. No separate reproduction image is needed to understand the contributions explained in prose.

**Result and available attempt:** explain why repeated breeding history supports the starting-line description and why controlling the pollen source makes a cross interpretable. Identify sperm and egg as gametes and avoid equating pollen transfer with fertilisation.

**Sources:** printed 588/PDF 5; actual slides 13 and 17. The deck’s broad “test crosses” label is not copied into this controlled-cross description. Technical testcross inference is deferred.

### 4. Follow the flower-colour experiment through its generations

**Prior understanding:** controlled parentage, true-breeding lines and offspring relationships from section 3. **Why now:** an F1/F2 pattern only becomes meaningful when the learner can say which plants produced each generation.

**Visual/noticing:** the visible native HTML table `ch17-v040-l02-visual-flower-generations` represents flower colour accurately. It has P, F1 and F2 rows recording what was done and which flower colours were observed. The reader is directed top to bottom: identify starting lines, the cross producing F1, and the F1 self-pollination producing F2. All rows are visible; no scripted reveal is claimed.

**Result and available attempt:** identify experimental stages and distinguish the observation from its explanation. Only after reading the table does the prose interpret the lack of a blend and the return of white, then pose the allele-persistence problem. “P” and “F1” are relationship labels, not universal genotype assignments.

**Sources:** printed 588/PDF 5; flower-generation Figure 17.8 on printed 591/PDF 8; slide 13’s flower example and slide 16’s explanatory question. This is an authored native text/table representation, not an altered or relabelled source image.

### 5. Take the same question from flower colour to seed shape

**Prior understanding:** the flower investigation and P1–P6. **Why now:** the original seed images and R/r cross must not be presented as if they still depict flowers.

**Visual/noticing:** an explicit transition defines R and r, RR/Rr/rr expression and heterozygosity before actual slide 15 `ppt/media/image14.png`. The reader follows the round/wrinkled P forms to all-round F1 and then mixed F2. Each seed icon represents a category, not a literal offspring count. Arrows abbreviate reproduction. A seed’s genotype belongs to the offspring within it, distinct from the parent plant carrying it.

**Result and available attempt:** use the seed-shape notation, state the depicted generation pattern and identify the remaining need for a mechanism. The difference between F1 self-pollination in the flower table and crossing F1 individuals in the source seed drawing is explicit; the later gamete account explains their shared Rr × Rr prediction.

**Sources:** actual slides 15–20; printed 588–591/PDF 5–8. Dominance is distinguished from gamete bias at first meaningful use.

### 6. How an allele reaches a gamete; copying increases copies, not allele versions

**Prior understanding:** P1 and the defined R/r seed model. **Why now:** the returning phenotype cannot be explained merely by naming segregation, and the frozen writing task specifically requires physical copying-state reasoning.

**Visual/noticing:** the prose establishes chromosome, locus, diploid and homologous pair before asking the learner to interpret a chromosome drawing. Meiosis is introduced by its chromosome-set reduction function before the explanation refers to DNA copying ahead of it. The prose distinguishes the two homologues from the two joined sister chromatids of one copied chromosome. At the tracked locus, normal copying yields four physical locus copies carrying two allele versions.

**Result and available attempt:** trace R and r through copying without changing their identity, distinguish an X-shaped copied chromosome from a homologous pair, and reject the inference that four copies mean four different versions. No new solved reproduction of the protected M/m writing prompt is added.

**Sources:** current native mechanism and protected writing demand; printed 597/PDF 14, Figure 17.14; actual slide 41. The historical inference from breeding and the later chromosome account remain distinct.

### 7. Separate the pair, then separate the copies; which allele can be contributed?

**Prior understanding:** section 6’s structures and the Rr starting state. **Why now:** the learner must connect copying to one allele per gamete through the actual intervening separations.

**Visual/noticing:** actual slide 41 `ppt/media/image44.png` is displayed unchanged. The learner deliberately follows the long blue and long red homologues in the left-hand arrangement. The short pair and comparison between arrangements are set aside. Guidance traces copied homologues into different cells, identifies the Metaphase II row while sisters remain joined, and follows single rods after the second division. Colours distinguish homologues, not dominance or unprinted R/r labels.

**Result and available attempt:** explain meiosis I homologue separation, no interdivision DNA copying, meiosis II sister separation, and one chromosome set. The plant account states that meiosis produces haploid spores, followed by mitosis and gamete-producing stages. Mitosis is defined as separating sister chromatids after DNA copying, maintaining the haploid chromosome number; DNA copying is not assigned to mitosis itself. RR, rr and Rr contribution possibilities then follow from available alleles; equal segregation gives either heterozygote contribution probability one half.

**Sources:** actual slide 41; printed 597/PDF 14; current native mechanism and assessment. Image47’s crossover context is omitted rather than used to make universal claims that sister chromatids always remain identical.

### 8. Explain the seed-shape generations: account for F1

**Prior understanding:** known true-breeding lines, explicit phenotype rule and gamete contributions. **Why now:** the observed first-generation category can now be derived, not merely repeated.

**Visual/noticing:** actual slide 18 `ppt/media/image20.png` supplies the RR × rr parents and Rr F1 category. The cross sign is explained. The learner reads two-letter parent genotypes and recognizes that the single F1 icon abbreviates a shared result. The prose supplies the gamete and fertilisation steps missing from the image.

**Result and available attempt:** combine one contribution from each parent, identify the restored pair in the zygote, then apply complete dominance. Distinguish a known Rr result from the generally unresolved genotype of a round seed.

**Sources:** actual slides 17–18 and duplicate slide 24; printed 590/PDF 7, Figure 17.6. The repeated-edge grid in slide 17 is not needed because it could suggest distinct gamete types where only one exists.

### 9. Account for F2; explain why the four pairs are equally likely

**Prior understanding:** Rr contributions and the two-gamete fertilisation account. **Why now:** the explanation must produce the recessive pair, justify its probability and distinguish genotype from phenotype grouping.

**Visual/noticing:** actual slide 20 `ppt/media/image36.png` displays the square. Prose explicitly assigns sperm across the top and eggs down the left for this unlabeled-parent-role image. Each edge is a gamete contribution; each interior entry is an offspring genotype. All four positions are traced from their two edge letters. The two heterozygote paths are combined only after their contributions are established.

**Result and available attempt:** explain how two previously present r contributions yield rr; distinguish the heterozygote’s phenotype from the mechanism transmitting its alleles; justify ½ × ½ = ¼ using equal segregation and random fertilisation. Four alternative contribution probabilities sum to one. The native grouping table then makes 1:2:1 by genotype and 3:1 by phenotype visible and checks both sums. This is the minimum quantitative model needed here, not a general probability unit.

**Sources:** actual slides 20–23; printed 590–591/PDF 7–8, Figures 17.7–17.8. The source claim on slide 22 that alignment alone explains all four offspring combinations is replaced by the correct distinction between producing gametes and joining them. Some source grids assign maternal contributions across the top; the candidate states its own displayed orientation rather than treating one orientation as universal.

### 10. Repair the two process labels — exact existing saved activity

**Prior understanding:** the separation and joining account, plus the grid interpretation. **Why here:** the task changes the inference from producing a genotype prediction to diagnosing a representation’s process labels.

**Visual/noticing:** retain the entire existing `ch17-kinch-v020-l02-arrow-task` section and its labelled-arrow table. Its hint directs attention to the number and source of contributions; its model distinguishes the processes and repairs the causal explanation.

**Result and available attempt:** repair both labels, identify what separates or joins, and explain which step restores a pair. Exact note ID: `ch17-kinch-v020-l02-arrow-response`. Exact title: **Repair the two process labels**. The task remains optional, saved by its native control and ungraded, outside required progress. No new note replaces it.

### 11. Compare the prediction with the counted offspring

**Prior understanding:** the derived expected proportions. **Why now:** the preserved small-sample selection and writing require a distinction between model probabilities and actual observations; that cannot be deferred entirely to lesson 03.

**Visual/noticing:** the actual reported seed counts from Figure 17.5 are visible in prose: 5,474 round and 1,850 wrinkled. The operation dividing both counts by 1,850 is shown and explained, giving approximately 2.96:1 for comparison with 3:1. A second copy of the generation diagram would not add an inference here.

**Result and available attempt:** distinguish a prediction from a schedule, explain why a short run can vary, and identify assumptions connecting alleles to counted phenotypes. Larger samples tend toward the probabilities but are not guaranteed to be monotonically closer. No invented observation, fixed offspring order or extra changed-count activity is supplied.

**Sources:** printed 589/PDF 6, Figure 17.5; current native final section and protected small-sample tasks. Mendel is described as recording offspring, not as using a later named Punnett diagram.

### 12. Use each part of the explanation for its own job

**Prior understanding:** all preceding experimental and causal reasoning. **Why now:** the lesson should answer its opening question without conflating dominance, segregation, fertilisation and historical discovery.

**Visual/noticing:** return to the already visible flower-generation table. Its white-flower return is now explained using inherited contributions rather than a second fully solved symbolic flower cross.

**Result and available attempt:** distinguish the physical transmission mechanism, the genotype-to-phenotype relationship and the observed pattern. The law of segregation summarizes the account already explained.

**Sources:** actual slides 23–25; printed 589–591/PDF 6–8 and 597/PDF 14. The three-law summary image is unnecessary here because independent assortment has not yet been developed.

### 13. Does reversing the parents reverse the result? — exact existing saved activity

**Prior understanding:** gamete contributions, offspring-seed identity, known genotypes and the explicit ordinary autosomal model. **Why here:** this changes the question from “which category results?” to “does reversing the reproductive roles support a causal claim about the receiving plant?”

**Visual/noticing:** retain the entire `ch17-kinch-v020-l02-cross-task` section with both crosses, the grower’s claim, hint, full model, criteria and limitation. The learner follows one egg and one sperm contribution in each cross.

**Result and available attempt:** evaluate the claim using contributions from both parents and distinguish the offspring seed from its carrying plant. Exact note ID: `ch17-kinch-v020-l02-cross-response`. Exact title: **Does reversing the parents reverse the result?** The activity remains optional, saved by its native control and ungraded, outside required progress.

The closing paragraph answers the original problem and names the next instructional jobs. It does not announce teacher acceptance or claim that the native checks have been completed.

## Why these visuals and activities earn their place

The five selected source images have different jobs: concrete pea contrasts; observed seed generations; one-pair chromosome separation within a two-pair schematic; known-parent F1 derivation; and F2 gamete/offspring mapping. They are copied without alteration into `assets/teaching-v040/`. No derived crop or generated image is used. The flower table and genotype/phenotype grouping table are native HTML teaching representations, not claimed source image bytes.

Image choices do not follow a quota. The deck portrait is omitted because it adds no inference required for this experiment. Slide17’s repeated-edge grid, slide19’s further schematic seed sequence, slide20 image21, slides21–22’s duplicate image27, and slide24’s duplicate image20 would repeat a representation already explained or add avoidable ambiguity. Their relevant instructional purposes are supplied by the selected source visual and connected prose. Slide25’s three-law summary and slide41 image47’s crossover context introduce later material without helping the immediate one-locus task. Omitting them does not omit the required copying or segregation mechanism.

Both existing activities survive in full because their demands differ: one repairs process meaning, the other tests a claim using reversed parental roles. A third new activity, another parentage-classification task, or a separate changed-count exercise would not currently supply a missing prerequisite or independent inference. No new required assessment is authored. The final native guided selections, stop-check, required questions/options/models/keys and textbook-practice link remain protected.

## Deferrals and fair preparation

| Keep visible in lesson 02 | Later home and actual evidence |
| --- | --- |
| Gametes before grids; one explained Rr × Rr square; genotype versus phenotype grouping; equal segregation plus random fertilisation; probability checks; actual counts versus predictions. | Lesson03 `ch17-l03-teaching-01-p1/p2` generalizes grid use to Aa × aa and prevents an automatic 3:1 shortcut. |
| Explain why a short run need not match the expected ratio. | Lesson03 `ch17-l03-teaching-02-p3` explicitly teaches expected count = total × probability; `ch17-l03-teaching-03-p1/p2` develops independent offspring and specified sequential-event multiplication. These later passages are not presumed prior learning. |
| Explain why a dominant appearance alone does not establish genotype, and why known breeding history matters here. | Technical unknown-genotype testcross inference is deferred to lesson04, consistent with the printed591/PDF8 definition. The full lesson04 file is not supplied in this packet; no read of its complete teaching is claimed. |
| Deliberately track one long chromosome pair in slide41 image44 and separate transmission from expression. | Comparing chromosome-pair arrangements and deriving two-locus gametes belong to lesson05. The full lesson05 file is not supplied or revised here. |

Preparation is checked against the supplied current assessments, including the copying-state written task and expected-versus-exact-count task. The historical embedded `guidedActivities[1].worked` DD/dd record is protected data, not the current teaching owner. Essential preparation is visible before the learner attempts the existing notes or protected checks; hint/model disclosure is support rather than the only source of a required explanation.

## Evidence boundary

This document records the implemented authoring sequence and a source-bound comparison. `CONTENT_REVIEW.md` records the actual review scope separately. Dean authorized creation of this candidate; exact-copy acceptance remains pending. No browser rendering, saving, completion, print, reader or native runtime acceptance follows from these teaching decisions.
