# Test crosses and unknown genotypes

<!-- Authored teaching interval begins. Boundary/protection notes are in the separate handoff records. -->

## Which allele pair is hidden by a black coat?

A black mouse is about to become a parent, but its full genotype is unknown. That missing information matters: a BB parent cannot contribute b, while a Bb parent can. How could offspring provide evidence about an allele that the parent’s appearance does not reveal?

Continue with the stated mouse fur-colour model: B is completely dominant to b, so BB and Bb mice are black and bb mice are brown. The gene is autosomal, and the two-allele genotypes reliably produce these **phenotype** categories under the conditions considered. A phenotype is the characteristic we observe or measure; it is not a complete allele record.

Write the black mouse as **B_**. We know that at least one allele is B, but the underscore leaves the second allele unresolved. There are two **hypotheses**, or possible explanations of the appearance: the parent could be BB, or it could be Bb. Listing two possibilities does not mean each automatically has a probability of one half.

<table class="comparison-table"><thead><tr><th>Hypothesis for the black parent</th><th>Meaning of the allele pair</th><th>Normal gamete contributions</th></tr></thead><tbody><tr><td>BB</td><td>Two copies of B; homozygous dominant</td><td>B only, probability 1</td></tr><tr><td>Bb</td><td>One B and one b; heterozygous</td><td>B with probability 1/2; b with probability 1/2</td></tr></tbody></table>

Read across each row from the proposed pair to its possible gametes. The distinction we need to investigate is whether the unknown parent can contribute b. Looking at more photographs of its black coat would not resolve that distinction in this complete-dominance model.

### Choose a parent that makes the difference visible

A useful partner has the recessive phenotype, brown, which identifies **bb** under the stated expression rule. Every normal gamete from this partner carries b. Such an individual is a **recessive tester**: its known contribution allows us to interpret what came from the unknown parent.

A **test cross** uses a homozygous recessive individual to investigate an unknown genotype. The deliberate choice of tester is what makes this cross informative. Simply controlling which two individuals reproduce does not automatically make a crossing experiment a technical testcross.

Both proposed crosses are shown below. Compare the labels across the top: BB on the left, Bb on the right. In each square, the tester’s b is repeated down the left side. Keep that tester constant while comparing the unknown-parent hypotheses. Both squares and all their outcomes are already visible.

![Side-by-side testcross predictions: BB across the top with bb down the left gives only Bb offspring; Bb across the top with bb down the left gives Bb and bb offspring.](../assets/teaching-batch1-v010/slide-27-image22.png)

The unknown-parent hypotheses are across the top; the recessive tester is down the left. The repeated b rows display one distinct tester gamete type, not two different versions.

In the **left square**, every top B meets a side b. Every resulting pair is Bb. In the **right square**, the B column produces Bb while the b column produces bb. Since the heterozygote contributes each allele with probability 1/2, the right square predicts both categories in equal proportions.

The tester contributes b with probability 1. Under the BB hypothesis, B from the unknown parent combines with that b: P(Bb) = 1 × 1 = 1, so all offspring are predicted to be black. Under the Bb hypothesis, P(Bb) = 1/2 × 1 = 1/2 and P(bb) = 1/2 × 1 = 1/2. Random fertilisation justifies combining those contributions. The genotype ratio under the second hypothesis is 1 Bb : 1 bb; its phenotype ratio is 1 black : 1 brown.

<table class="comparison-table"><thead><tr><th>Cross being predicted</th><th>Offspring genotype probabilities</th><th>Offspring phenotype probabilities</th><th>Check</th></tr></thead><tbody><tr><td>BB × bb</td><td>Bb: 1; BB and bb: 0</td><td>Black: 1; brown: 0</td><td>1 + 0 = 1</td></tr><tr><td>Bb × bb</td><td>Bb: 1/2; bb: 1/2; BB: 0</td><td>Black: 1/2; brown: 1/2</td><td>1/2 + 1/2 = 1</td></tr></tbody></table>

Why not use a BB tester instead? It would supply B to every offspring. Even if the unknown parent supplied b, that offspring would be Bb and therefore black. Both unknown-parent hypotheses could produce only black offspring with that tester. The recessive tester is useful because its b contribution allows an inherited b from the unknown parent to produce a distinguishable bb phenotype.

## Trace an observed offspring back to its parents

Predictions describe what each hypothesis allows. An observation can now be compared with those predictions. Suppose a correctly recorded B_ × bb testcross produces a brown offspring. Its brown phenotype identifies bb in the stated model. Follow the two copies of b separately: one came from the known tester, and the other had to come from the unknown parent.

One **bb offspring from B_ × bb** therefore establishes that the unknown parent carries the recessive **allele** b. Its own black phenotype also requires B. Together, the offspring evidence and the parent’s phenotype force **Bb**: the parent is **heterozygous**, with two different alleles at the locus.

This reasoning depends on correct parentage and scoring, the stated expression rule, and ordinary allele transmission without a new mutation or other change that would invalidate the model. Within those assumptions, BB cannot account for a b contribution. The recessive offspring distinguishes the two hypotheses without requiring the whole sample to be exactly half brown.

If the offspring counts are uneven, keep the two questions separate. The presence of a correctly identified bb offspring constrains what the parent can contribute. The exact proportions concern the chance outcomes of a finite sample. A sample need not reproduce the expected 1:1 ratio perfectly for its recessive offspring to be informative.

### Read an all-black sample more cautiously

An all-black sample is compatible with a **homozygous** BB parent, whose two allele copies are the same. But it is also possible from a Bb parent: each offspring could, by chance, receive B from that parent. The difference is that a brown offspring is impossible under the BB hypothesis in this model, whereas a finite run of black offspring is not impossible under the Bb hypothesis.

We can use **probability** to compare how readily the two hypotheses produce the same record. Keep the tester bb and assume offspring outcomes are independent. If the unknown parent is Bb, each offspring has probability 1/2 of being black. If it is BB, each has probability 1 of being black.

First consider the specified record **three offspring, all black**. Under the Bb hypothesis, the first must receive B, the second must receive B, and the third must receive B. The three independent requirements give 1/2 × 1/2 × 1/2 = **1/8**. Under BB, the corresponding product is 1 × 1 × 1 = **1**.

Now consider a longer specified record, **six offspring, all black**. Under Bb, there are six independent requirements, each with probability 1/2, so the probability is **(1/2)<sup>6</sup> = 1/64**. The exponent 6 means multiply six factors of 1/2. Equivalently, the first three all-black outcomes have probability 1/8 and the next three have probability 1/8, giving 1/8 × 1/8 = 1/64. Under BB the probability remains 1.

<table class="comparison-table"><thead><tr><th>Specified observed record</th><th>Probability if unknown parent is BB</th><th>Probability if unknown parent is Bb</th></tr></thead><tbody><tr><td>Three offspring, all black</td><td>1</td><td>(1/2)<sup>3</sup> = 1/8</td></tr><tr><td>Six offspring, all black</td><td>1</td><td>(1/2)<sup>6</sup> = 1/64</td></tr></tbody></table>

Read the column headings before interpreting either fraction. For example, 1/64 is the probability of that six-offspring record *if the parent is Bb*. It is not a statement that an observed all-black record gives the parent a 1/64 probability of being Bb. That reverse question would require more information, including how plausible the parental genotypes were before observing the record.

An all-black record is more probable under BB than under Bb, and extending that run strengthens this comparison. Nevertheless, (1/2)<sup>n</sup> remains greater than 0 for any finite positive number n of independent offspring. It therefore remains possible for a heterozygote to produce the whole run. Say that the all-black record supports the BB hypothesis over Bb under the model; do not say it proves BB.

**Sampling variation** is the difference that chance can produce between observed sample outcomes and expected proportions. It explains why absence of a recessive offspring in a small sample is weaker evidence than a correctly identified recessive offspring is under these two hypotheses. It does not mean that every incompatible observation should be dismissed as chance. If an observation is impossible under the assumed model, check the model and evidence.

## Use a family record before choosing a cross

Offspring are not the only source of information about an unknown **genotype**. A known parent can tell us which allele an individual must already have received. Use hypothetical breeding records supplied with a problem; the reasoning does not require anyone’s private family information.

Consider a black mouse that is known to have a brown bb parent. That parent could contribute only b, so one allele in the black mouse must be b. The black mouse’s own phenotype requires B in this model. Its pair is therefore forced to be Bb. The family record already answers the genotype question; another testcross is unnecessary for that particular inference.

Now change only the known parent to BB. It could contribute only B, so the black mouse certainly has B. But that contribution already explains a black phenotype whether the other allele is B or b. The second allele remains unresolved. A known dominant contribution and a dominant appearance are not two independent pieces of evidence for two B copies.

<table class="comparison-table"><thead><tr><th>Known information about a black mouse</th><th>Contribution forced by the known parent</th><th>What the mouse’s own colour adds</th><th>Genotype conclusion</th></tr></thead><tbody><tr><td>One parent is brown, bb</td><td>b</td><td>Requires B as the other allele</td><td>Bb is forced</td></tr><tr><td>One parent is BB</td><td>B</td><td>Is compatible with either B or b as the other allele</td><td>BB or Bb remains possible; retain B_</td></tr></tbody></table>

In each row, work from the most informative constraint. Write the allele the known parent must supply, then use the individual’s phenotype to limit the second allele. A forced genotype fits the evidence in only one way within the model. A possible genotype is one of the ways still allowed. Do not substitute “possible” for “established” before predicting another cross.

Worked example

### Make the prediction the evidence supports

Two black mice are being considered as parents in a hypothetical breeding problem. **Mouse 1 has a brown bb parent.** **Mouse 2 has a known BB parent**, but no genotype information is available for its other parent. Predict what this evidence permits us to say about brown offspring from a mating between mouse 1 and mouse 2.

Use the same B/b complete-dominance rule, normal segregation, random fertilisation and reliable expression. The useful work begins before the offspring square: we must determine which parental allele pairs the records actually establish.

1. **Resolve mouse 1 from its known contribution and phenotype.** The bb parent supplied b. Mouse 1 is black, so its other allele must be B. Mouse 1 is therefore Bb, and it contributes B or b with probability 1/2 each.
2. **Keep mouse 2’s unresolved allele visible.** Its BB parent supplied B, but its black phenotype does not identify the allele from the other parent. Mouse 2 remains B_, meaning BB or Bb. We have not been given probabilities for those two hypotheses.
3. **Calculate the offspring under each allowed hypothesis separately.** If mouse 2 is BB, it contributes B with probability 1. If it is Bb, it contributes B or b at 1/2 each. We combine each of those possibilities with the already resolved contributions from mouse 1.

<table class="comparison-table"><thead><tr><th>Mouse 2 hypothesis</th><th>Contributions combined with mouse 1’s B or b at 1/2 each</th><th>Offspring genotype probabilities</th><th>Phenotype prediction</th></tr></thead><tbody><tr><td>BB</td><td>Mouse 2 supplies B only. Mouse 1’s B gives BB; mouse 1’s b gives Bb.</td><td>BB: 1/2 × 1 = 1/2; Bb: 1/2 × 1 = 1/2; bb: 0</td><td>Black: 1; brown: 0</td></tr><tr><td>Bb</td><td>Mouse 2 supplies B or b at 1/2 each. The four pairs are BB, Bb, bB and bb.</td><td>BB: 1/4; Bb: 1/4 + 1/4 = 1/2; bb: 1/4</td><td>Black: 1/4 + 1/2 = 3/4; brown: 1/4</td></tr></tbody></table>

In the first row, a brown offspring is impossible within the model because mouse 2 cannot provide b. In the second row, a brown offspring needs b from each parent: 1/2 × 1/2 = 1/4. The two heterozygous routes are grouped because bB and Bb are the same allele pair, giving the second row’s 1:2:1 genotype ratio and 3:1 phenotype ratio. Both rows have total genotype probability 1.

**The evidence does not yet support one exact brown-offspring probability.** It supports two conditional predictions: 0 if mouse 2 is BB, and 1/4 if mouse 2 is Bb. We cannot average those numbers merely because there are two rows in the table. Averaging would assume how often each parental hypothesis should be used, and that information has not been supplied.

A testcross of mouse 2 with a bb tester could provide further evidence. A brown offspring would resolve mouse 2 as Bb under the stated assumptions. A finite all-black record would favour BB without logically eliminating Bb. That additional evidence is useful because it addresses the particular allele still missing from the record, rather than repeating a question that mouse 1’s parentage has already answered.

### What the tester reveals, and the next question

The testcross works because the tester’s contribution is known. With b supplied by the tester, a recessive offspring reveals a b contribution from the unknown parent. The parent’s own dominant appearance supplies the other constraint. When the revealing offspring is absent, probability tells us how compatible the observed record is with each hypothesis, while preserving the limits of a finite sample.

The optional rabbit colour-series application needs more than the two-allele black/brown rule: it uses several allele versions and a supplied expression table. Return to it when those allele relationships are introduced. Likewise, predicting a testcross involving two characteristics requires the gamete combinations for both loci, not simply a reused single-trait ratio.

So far, we have followed one characteristic at a time. A breeder may instead be interested in two, such as plant height and pod colour. Once the allele pairs are established, the next question is whether their contributions can be combined independently within a parent. That question will explain why tracking two characteristics requires more than doubling the size of a familiar single-trait answer.

<!-- Authored teaching interval ends. Complete protected native suffix reading copy begins; visible words, options, hints and models are retained. Reading controls are disabled. Exact functional source bytes are in raw-before and remain owned by the native suffix. -->

## Practise with support

### Apply the explanation

Try both questions. Use the hint to revise your thinking after an incorrect answer.

Which tester is useful for distinguishing TT from Tt?

<select disabled><option value="">Choose an answer</option><option value="tt">tt</option><option value="An individual with unresolved T_ genotype">An individual with unresolved T_ genotype</option><option value="TT">TT</option></select>

<button type="button" disabled>Check answer</button>

An unknown dominant parent crossed with aa produces one aa offspring. What is the unknown genotype?

<select disabled><option value="">Choose an answer</option><option value="AA">AA</option><option value="Aa">Aa</option><option value="aa despite its dominant phenotype">aa despite its dominant phenotype</option></select>

<button type="button" disabled>Check answer</button>

Stop and think

## Try this before opening the explanation

Does a small departure from 1:1 automatically disprove a heterozygous test cross?

#### Show the explanation

No. Sampling variation can change the observed counts.

Optional video support

### Test crosses and unknown genotypes — video support

**As you watch:** Use a homozygous recessive tester to distinguish possible parental genotypes and explain uncertainty from small samples.

Optional video. Internet access is required. The explanation below covers the idea without the video.

Open on YouTube

<button type="button" disabled>Load video</button>

#### Read the explanation

One aa offspring from B_ × bb means the dominant-phenotype parent must carry the recessive allele, assuming the model, parentage and observations are correct. It is heterozygous. By contrast, several dominant offspring do not logically prove the parent is homozygous. An Aa parent can, by chance, produce a run of A-bearing gametes. For four independent offspring in an Aa × aa cross, the probability that all show the dominant phenotype is (1/2)⁴ = 1/16. More offspring with no recessive phenotype generally strengthen the homozygous interpretation, but finite samples still require cautious wording. Say what the evidence supports and what remains possible.

#### Open required check · Test crosses and unknown genotypes

## Explain what you have learned

This check counts toward chapter progress. Correct the 2 selections to unlock 2 written explanations. Saving writing records your response; it does not grade its accuracy.

<button type="button" disabled>Start</button>

<button type="button" disabled>Redo this check</button>

Not started

Required chapter check

Selection 1

### Five dominant offspring appear in a test cross. What is the most careful conclusion?

The recessive allele has mutated into A in every cell

Segregation cannot operate

Homozygosity is supported, but heterozygosity is not logically excluded

The parent is certainly AA

<button type="button" disabled>Check answer</button>

Selection 2

### A dominant-phenotype individual has an aa parent. Under the simple model, its genotype is:

Impossible to constrain at all

AA

aa

Aa

<button type="button" disabled>Check answer</button>

Answer the selections correctly to unlock the writing.

Written explanations

Written explanation 1

Explain why a recessive tester makes an unknown dominant genotype easier to investigate.

<textarea aria-describedby="ch17-l04-check-writing-1-status" rows="6" disabled></textarea>

Maximum 3200 characters. Explain the biology in your own words.

<button type="button" disabled>Save written response</button>

#### Compare after saving your own response

The homozygous recessive tester contributes only the recessive allele. Offspring outcomes therefore reveal whether the unknown parent can contribute a recessive allele. A recessive offspring identifies the unknown dominant parent as heterozygous within the model.

Check your explanation for:

- Identifies the relevant structures or quantities.
- Explains the causal relationship or calculation, not just the final result.
- Uses the stated evidence and avoids a stronger conclusion than it supports.

Written explanation 2

Calculate the probability that an Aa × aa cross produces four dominant-phenotype offspring in succession, and explain its relevance.

<textarea aria-describedby="ch17-l04-check-writing-2-status" rows="6" disabled></textarea>

Maximum 3200 characters. Explain the biology in your own words.

<button type="button" disabled>Save written response</button>

#### Compare after saving your own response

Each offspring has probability 1/2 of the dominant phenotype. Four specified independent outcomes have probability (1/2)⁴ = 1/16. Thus an all-dominant sample of four can occur even when the unknown parent is heterozygous.

Check your explanation for:

- Identifies the relevant structures or quantities.
- Explains the causal relationship or calculation, not just the final result.
- Uses the stated evidence and avoids a stronger conclusion than it supports.

<button type="button" disabled>Submit and finish</button>

#### Additional written application 2

This is optional written practice. It does not change required progress.

![Original question diagram or data. Use its labels and values with the written directions.](../assets/assessment/eeca2d84afb814ca523d.png)

Use the diagram or data with the question.

![Original question diagram or data. Use its labels and values with the written directions.](../assets/assessment/edd29af72eeb9c646081.png)

Use the diagram or data with the question.

In the first cross, a rabbit with the chinchilla coat colour is mated to a rabbit with a Himalayan coat colour that is known to be homozygous for this trait. Calculate the theoretical probability of this cross producing each of the following phenotypes shown below. Show the calculation or sequence and explain your reasoning. Use only the supplied evidence; do not invent observations.

<textarea aria-describedby="ch17-source-written-OBJ_2131247-status" rows="5" disabled></textarea>

Optional response. Select Save response to collect it. Maximum 5000 characters.

<button type="button" disabled>Save response</button>

← Single-trait crosses and probability

Next: Two-trait crosses and independent assortment →

Optional textbook practice for Test crosses and unknown genotypes

<!-- Complete protected suffix reading copy ends. -->

<!-- Static reading supplement: the following exact existing hints, keys and explanations are supplied by current native data, not newly authored teaching or controls. Historical guidedActivities.worked records are deliberately not used as teaching owners. -->

## Feedback for the practice above

### Guided question 1

<!-- ch17-l04-guided-q1 -->

**Optional hint:** Choose a tester that contributes only the recessive allele.

**Answer:** tt

**Explanation:** The recessive tester has a known allele contribution.

### Guided question 2

<!-- ch17-l04-guided-q2 -->

**Optional hint:** Combine phenotype evidence with the offspring’s required allele.

**Answer:** Aa

**Explanation:** The parent must contribute a while also carrying A for its phenotype.

### Selection question 1

<!-- ch17-l04-check-mc-1 -->

**Cue:** Trace the normal mechanism before choosing an answer.

**Answer:** Homozygosity is supported, but heterozygosity is not logically excluded

**Explanation:** A finite run of dominant offspring can occur by chance from a heterozygote.

### Selection question 2

<!-- ch17-l04-check-mc-2 -->

**Cue:** Trace the normal mechanism before choosing an answer.

**Answer:** Aa

**Explanation:** The aa parent must supply a; the dominant phenotype requires A from the other parent.

<!-- Exact current optional practice-bank reading copy begins. This appendix adds no item, save, grade or progress behaviour to the proposed native fragment. -->

## Optional practice

<!-- ch17-source-OBJ_2131226 -->

### A test cross is used to determine

- the phenotype of the parent
- the phenotype of the offspring
- the genotype of the parent
- if independent assortment occurred

**Optional cue:** Identify the relevant mechanism or quantity and apply the stated model.

**Answer:** the genotype of the parent

**Explanation:** A recessive tester helps distinguish the possible genotypes behind a dominant phenotype; sample size affects certainty when no recessive offspring appear.

<!-- ch17-source-OBJ_2131230 -->

### In a hypothetical single-locus trait, B is dominant to b. An individual with the dominant phenotype has a recessive-phenotype child with a bb partner. What is the first parent’s genotype?

- bb
- BBbb
- Bb
- BB

**Optional cue:** Identify the relevant mechanism or quantity and apply the stated model.

**Answer:** Bb

**Explanation:** The recessive child is bb and must receive b from both parents; the dominant-phenotype parent must also carry B.

<!-- ch17-foundation-ch17-word-test-cross -->

### Which term matches this description? A cross with a homozygous recessive individual used to investigate an unknown genotype.

- test cross
- homozygous
- heterozygous
- sampling variation

**Optional cue:** Use the meaning of each term, not the length of its name.

**Answer:** test cross

**Explanation:** A cross with a homozygous recessive individual used to investigate an unknown genotype. One recessive offspring can be informative; all dominant offspring in a small sample need not prove homozygosity.

<!-- ch17-foundation-ch17-word-homozygous -->

### Which term matches this description? Having two identical alleles at a locus.

- test cross
- homozygous
- heterozygous
- sampling variation

**Optional cue:** Use the meaning of each term, not the length of its name.

**Answer:** homozygous

**Explanation:** Having two identical alleles at a locus. Homozygous can be dominant or recessive.

<!-- ch17-foundation-ch17-word-heterozygous -->

### Which term matches this description? Having two different alleles at a locus.

- test cross
- homozygous
- heterozygous
- sampling variation

**Optional cue:** Use the meaning of each term, not the length of its name.

**Answer:** heterozygous

**Explanation:** Having two different alleles at a locus. A heterozygote can share a phenotype with a homozygous dominant individual.

<!-- ch17-foundation-ch17-word-sampling-variation -->

### Which term matches this description? Differences between observed sample outcomes and their expected proportions due to chance.

- test cross
- homozygous
- heterozygous
- sampling variation

**Optional cue:** Use the meaning of each term, not the length of its name.

**Answer:** sampling variation

**Explanation:** Differences between observed sample outcomes and their expected proportions due to chance. A small sample may not distinguish two models decisively.

<!-- ch17-l04-application-1 -->

### A test cross of G_ × gg produces 12 dominant and 8 recessive offspring. Which genotype is established for the unknown parent in the stated model?

- gg
- No genotype can be inferred because the ratio is not exactly 1:1
- GG
- Gg

**Optional cue:** Trace the normal mechanism before choosing an answer.

**Answer:** Gg

**Explanation:** The presence of recessive offspring establishes that the unknown parent can supply g; exact sample balance is unnecessary.

<!-- ch17-l04-scenario-1: exact existing self-assessed variant -->

**Explanation model:** Gg. The presence of recessive offspring establishes that the unknown parent can supply g; exact sample balance is unnecessary.

<!-- ch17-l04-context-test-cross -->

### Identify the term illustrated: A dark B_ individual is crossed with a pale bb tester.

**Optional cue:** Use the relationship described in the example.

**Answer:** test cross

**Explanation:** A cross with a homozygous recessive individual used to investigate an unknown genotype. One recessive offspring can be informative; all dominant offspring in a small sample need not prove homozygosity.

<!-- ch17-l04-context-homozygous -->

### Identify the term illustrated: An individual is AA or aa rather than Aa.

**Optional cue:** Use the relationship described in the example.

**Answer:** homozygous

**Explanation:** Having two identical alleles at a locus. Homozygous can be dominant or recessive.

<!-- ch17-l04-context-heterozygous -->

### Identify the term illustrated: An individual has one dominant and one recessive allele in a simple model.

**Optional cue:** Use the relationship described in the example.

**Answer:** heterozygous

**Explanation:** Having two different alleles at a locus. A heterozygote can share a phenotype with a homozygous dominant individual.

<!-- ch17-l04-context-sampling-variation -->

### Identify the term illustrated: A small set of offspring contains no recessive individual even though each had a one-half chance.

**Optional cue:** Use the relationship described in the example.

**Answer:** sampling variation

**Explanation:** Differences between observed sample outcomes and their expected proportions due to chance. A small sample may not distinguish two models decisively.

<!-- ch17-multiple-04 -->

### Select the TWO accurate statements about test crosses and unknown genotypes.

- One recessive offspring can be informative; all dominant offspring in a small sample need not prove homozygosity.
- Homozygous always means dominant.
- A heterozygote can share a phenotype with a homozygous dominant individual.
- Every difference from an expected ratio proves a new inheritance law.

**Optional cue:** Check every statement against the mechanism; do not assume a negative statement is correct.

**Answers:** One recessive offspring can be informative; all dominant offspring in a small sample need not prove homozygosity.; A heterozygote can share a phenotype with a homozygous dominant individual.

**Explanation:** One recessive offspring can be informative; all dominant offspring in a small sample need not prove homozygosity. A heterozygote can share a phenotype with a homozygous dominant individual. Homozygous can be dominant or recessive. A small sample may not distinguish two models decisively.

<!-- Exact current optional practice-bank reading copy ends. -->
