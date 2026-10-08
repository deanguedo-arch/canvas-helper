# Single-trait crosses and probability

<!-- Authored teaching interval begins. Boundary/protection notes are in the separate handoff records. -->

## What can the parents tell us about the next offspring?

Knowing that offspring receive one allele at a locus from each parent gives us a way to predict. If we know the parents’ allele pairs, we can identify their possible contributions and ask which offspring combinations those contributions can produce. The important starting point is the parents, not a ratio remembered from another cross.

We will follow a single fur-colour gene in a stated mouse model. Look at the black-furred mouse and the brown-furred mouse below. Their coats illustrate the contrast we will score. The photographs alone do not identify their allele pairs; the parental genotypes used in the crosses will be given separately.

![A black-furred mouse, used to illustrate the black coat category in the stated model.](../assets/teaching-batch1-v010/slide-27-image30.jpg)

Black fur is an observable category. It does not, by itself, distinguish the two genotypes that produce black in this model.

![A brown-furred mouse, used to illustrate the contrasting brown coat category in the stated model.](../assets/teaching-batch1-v010/slide-27-image31.jpg)

Brown fur supplies the contrasting category for the crosses below. The photographs are illustrations of appearance, not records of a breeding experiment.

Here **B** names an allele associated with black fur and **b** names an allele associated with brown fur. B is completely dominant to b for this characteristic: **BB and Bb are black; bb is brown**. These B/b symbols now describe the mouse fur-colour gene, not the flower-colour gene. The two letters of a parent’s genotype belong to one locus.

We assume an ordinary diploid autosomal model, normal segregation, random fertilisation, and reliable expression of these coat categories. We also assume that the genotypes being compared do not differ in survival before the offspring are counted. These conditions let us carry a prediction about fertilisation through to the scored offspring. They do not make every real coat-colour difference in mice a one-gene trait.

### Start with the gametes, then read the square

First consider a **heterozygous black father, Bb**, and a **brown mother, bb**. The cross is written **Bb × bb**. The multiplication-shaped cross symbol here means that these are the two parents; it does not mean multiplying the letters.

A gamete carries one allele at this locus. In the father, segregation separates B and b into different contributions. Under equal segregation, a sperm contributing to an offspring has a **1/2 chance of carrying B** and a **1/2 chance of carrying b**. The mother has b on both corresponding chromosomes, so every normal egg carries b. She has **one distinct allele type** to contribute, with probability 1.

A **probability** expresses the chance of an outcome under specified conditions. It ranges from 0, impossible within the model, to 1, certain within the model. A probability of 1/2 is 50%. The expected proportion is one half; larger independent samples are more likely to have observed proportions close to that expectation. Dominance does not change the father’s two gamete probabilities: B does not enter sperm more often merely because it determines the heterozygote’s coat colour.

A **Punnett square** is a table that organises possible combinations of parental gametes. Put a gamete contribution on each edge. An interior cell combines one contribution from the top with one from the side; the pair describes a possible offspring genotype. At fertilisation, the joined gametes form a **zygote**, the first diploid cell of the new individual. The cell in the table represents a possibility for that individual, not a third gamete.

The image below contains two complete squares. Begin with the **right-hand square**, which has B and b across the top and b repeated down the left. We will use the top edge for the father’s sperm and the left edge for the mother’s eggs. The image itself has no sex labels; this is the convention we are assigning to read this cross. The left-hand square changes the top parent to BB and can be compared later.

![Two fully visible single-trait squares. The left has B and B across the top and b and b down the left, giving four Bb cells. The right has B and b across the top and b and b down the left, giving Bb and bb in each row.](../assets/teaching-batch1-v010/slide-27-image22.png)

Read the right square for Bb × bb. The two b labels on its left repeat the same allele type; they do not give the bb parent two different gamete types.

Trace the right square’s top-left interior cell: top B joins side b, giving Bb. In the top-right cell, top b joins side b, giving bb. The second row repeats those same combinations because the mother’s other allele copy is also b. Repeating a label on a drawing does not create another biological allele version.

We can show the same cross more compactly by listing each distinct gamete type once and keeping its probability beside it. In the table below, the mother’s single b row has probability 1, while the father’s two columns each have probability 1/2.

<table class="comparison-table"><thead><tr><th>Egg from bb mother</th><th>Sperm B, probability 1/2</th><th>Sperm b, probability 1/2</th></tr></thead><tbody><tr><th>b, probability 1</th><td>Bb: 1 × 1/2 = 1/2</td><td>bb: 1 × 1/2 = 1/2</td></tr></tbody></table>

We multiply because an offspring needs *both* contributions, and random fertilisation makes the sperm allele independent of the egg allele in this model. For a Bb offspring, the required event is an egg carrying b together with a sperm carrying B: 1 × 1/2 = 1/2. For a bb offspring, it is a b egg together with a b sperm: 1 × 1/2 = 1/2. These two mutually exclusive possibilities exhaust the cross, and 1/2 + 1/2 = 1.

If we use the original four-cell drawing instead, the certain b contribution is displayed as two equivalent rows, each carrying half of the total weight. Each pictured cell then has weight 1/4, and the two repeated routes to each genotype add to 1/2. The compact table and the four-cell drawing agree. Counting boxes works only when their probability weights have been accounted for.

The **genotype ratio is 1 Bb : 1 bb**. Applying complete dominance gives a **phenotype ratio of 1 black : 1 brown**. The first ratio groups allele pairs; the second groups expressed coat colours. They happen to have the same numbers in this cross. That agreement is a result to explain, not a rule to assume for every pair of parents.

## Change the second parent

Now the father and mother are **both heterozygous black mice: Bb × Bb**. The father still produces B or b sperm at 1/2 each. The changed mother now produces B or b eggs at 1/2 each, instead of only b eggs. That new possible contribution is why the offspring probabilities will change.

Keep sperm across the top and eggs down the left. Before reading an interior cell, trace its row and column labels. Each cell requires a particular egg allele and a particular sperm allele, so each has probability 1/2 × 1/2 = 1/4 under random fertilisation.

<table class="comparison-table"><thead><tr><th>Egg from Bb mother</th><th>Sperm B, probability 1/2</th><th>Sperm b, probability 1/2</th></tr></thead><tbody><tr><th>B, probability 1/2</th><td>BB, probability 1/4</td><td>Bb, probability 1/4</td></tr><tr><th>b, probability 1/2</th><td>bB, probability 1/4; normally written Bb</td><td>bb, probability 1/4</td></tr></tbody></table>

The upper-left cell receives B from each parent and is BB. The upper-right cell receives B from the egg and b from the sperm. The lower-left receives b from the egg and B from the sperm. Those two routes both produce the genotype Bb. The lower-right receives b from each and is bb. Each cell has two allele copies because each includes two gametes’ contributions.

To group by **genotype**, retain the one BB route, add the two distinct routes to Bb, and retain the one bb route. Thus P(BB) = 1/4, P(Bb) = 1/4 + 1/4 = 1/2, and P(bb) = 1/4. Here P means “probability of” the outcome in parentheses. The genotype ratio is **1 BB : 2 Bb : 1 bb**. Check the whole set: 1/4 + 1/2 + 1/4 = 1.

To group by phenotype, apply the expression rule. Both BB and Bb are black, so P(black) = 1/4 + 1/2 = 3/4. Only bb is brown, so P(brown) = 1/4. The phenotype ratio is therefore **3 black : 1 brown**, and its probabilities also total 1. “Heterozygous” and “black” are different groups: all Bb mice are black in this model, but BB mice are black too.

The addition is justified because the alternatives being combined do not overlap. An individual cannot be both BB and Bb at the same locus. By contrast, “black” and “heterozygous” do overlap here, so simply adding their probabilities would count Bb twice. Name the event first, then decide which mutually exclusive outcomes belong to it.

A **monohybrid cross**, in the sense used here, crosses two individuals heterozygous for one studied gene. Bb × Bb is the example. The broader phrase *single-trait cross* also covers arrangements such as Bb × bb. Always read the actual parental genotypes: the name of a cross does not guarantee a 3:1 phenotype ratio. That ratio here follows from these parents, equal segregation, random fertilisation and complete dominance with reliable expression.

### Read the same pairing pattern in the labelled figure

The next figure uses **A and a** for two alleles in a generic complete-dominance model, with A completely dominant to a. We are changing the notation to read a different representation, not adding another gene to the mouse cross. Both represented parents are Aa. Use the top edge for one parent’s gametes and the left edge for the other’s; the figure does not assign biological sex to either edge.

Notice the difference between letters *outside* the square and the circled letters *inside*. Outside A and a are gamete alleles. Inside A, B, C and D name four locations whose genotypes must be obtained from the edges. The interior B does not mean a B allele has appeared in this A/a model.

A single-trait cross: Aa × Aa

<button type="button" disabled>View larger</button>

![Each row and column represents a gamete. Four equally likely combinations give a 1:2:1 genotype ratio under the stated model. A is completely dominant to a.](../assets/figures/ch17-punnett.svg)

Each row and column represents a gamete. Four equally likely combinations give a 1:2:1 genotype ratio under the stated model. A is completely dominant to a. Schematic — not to scale.

At location A, side A meets top A, giving AA. At B, side A meets top a, giving Aa. At C, side a meets top A, also giving Aa. At D, side a meets top a, giving aa. The map beneath the square is already visible and confirms those readings. The two heterozygous locations represent different parental contribution routes into the same genotype.

A probability also lets us calculate an **expected number**: the model’s predicted count for a specified sample size, found by multiplying the probability by that size. We will use this after comparing one more parental arrangement. First make sure the probability belongs to the actual cross and the requested group; a correct multiplication cannot repair a probability taken from the wrong parents.

## Change a parent before predicting another generation

Return to the mouse fur-colour model, with B completely dominant to b. This time the father is **homozygous black, BB**, and the mother is **heterozygous black, Bb**. Both parents look black, but they do not produce the same range of gametes. The BB father supplies B in every normal sperm. The Bb mother supplies B or b in eggs at 1/2 each.

The compact table needs only one sperm column because there is only one distinct paternal allele type. Read the two possible egg rows separately.

<table class="comparison-table"><thead><tr><th>Egg from Bb mother</th><th>Sperm B from BB father, probability 1</th><th>Phenotype after applying complete dominance</th></tr></thead><tbody><tr><th>B, probability 1/2</th><td>BB: 1/2 × 1 = 1/2</td><td>Black</td></tr><tr><th>b, probability 1/2</th><td>Bb: 1/2 × 1 = 1/2</td><td>Black</td></tr></tbody></table>

The genotype ratio is **1 BB : 1 Bb**; bb has probability 0 because the father cannot contribute b. The expected phenotype is **all black**: 1/2 + 1/2 = 1. A four-cell version could repeat the father’s B column, just as the earlier image repeated the recessive mother’s b row. It would repeat the same possibilities without creating a new gamete type.

Now separate the immediate offspring from a possible later generation. In the image below, follow the two mice at the top down the converging lines to the single central mouse icon, then down to the question mark. The whole diagram is visible at once. It abbreviates a question about offspring and grandchildren; it does not provide genotypes, probabilities or a complete second mating.

![Two black-mouse photographs at the top connect by plain converging lines to one black-mouse photograph in the middle. A vertical line leads from the middle photograph to a question mark below.](../assets/teaching-batch1-v010/slide-29-image33.png)

The central icon abbreviates the offspring being considered. Predicting a later generation requires another stated mating; a single mouse cannot supply both parents of a sexual cross.

For the first mating we have just analysed, BB × Bb, the immediate offspring can be BB or Bb even though all are black. We cannot assign Bb to every black offspring in that picture. We also cannot answer the question about grandchildren until the two parents of that later mating are identified.

Suppose the later mating is explicitly between **two descendants known to be Bb**. Each can contribute B or b with probability 1/2. A brown grandchild requires a b contribution from each, so P(bb) = 1/2 × 1/2 = 1/4 for that specified mating. Its other genotype probabilities are 1/4 BB and 1/2 Bb, and its phenotype probabilities are 3/4 black and 1/4 brown. The previously derived Bb × Bb square applies because the parental genotypes now match that square.

The b allele was not recreated when brown became possible. It was carried in some black heterozygous descendants and could meet another b at fertilisation. A characteristic may therefore be absent from the scored appearance of one generation and possible in the next, while the allele itself has remained present. If the later parents instead included a BB individual, that individual could not contribute b, and this brown-grandchild prediction would not apply.

Across these comparisons, the method has stayed the same: establish the parents, identify their possible gametes and weights, combine one contribution from each, then group by the requested genotype or phenotype. The ratios changed because the starting allele pairs changed. Appearance alone did not tell us which set of calculations to use.

Worked example

### Work from a probability to a count or a sequence

Use **Bb × Bb** in the same mouse model. Each parent contributes B or b at 1/2, giving genotype probabilities 1/4 BB, 1/2 Bb and 1/4 bb. Complete dominance gives 3/4 black and 1/4 brown. We will use those probabilities for two different questions: a predicted count in a group, and a specified sequence of offspring. The question determines which outcomes belong in the calculation.

### Predict a group without scheduling its members

Suppose a breeding record will contain **48 offspring** from matings with these parental genotypes. This is a hypothetical total chosen for prediction, not an observed experiment. Assume each offspring is counted and that the expression and survival conditions of the model hold. An expected count is the sample size multiplied by the probability of the category.

<table class="comparison-table"><thead><tr><th>Category</th><th>Probability for one offspring</th><th>Expected count among 48</th></tr></thead><tbody><tr><td>BB</td><td>1/4</td><td>48 × 1/4 = 12</td></tr><tr><td>Bb</td><td>1/2</td><td>48 × 1/2 = 24</td></tr><tr><td>bb</td><td>1/4</td><td>48 × 1/4 = 12</td></tr></tbody></table>

The genotype counts add to 12 + 24 + 12 = 48, so no genotype category has been omitted or counted twice. For phenotypes, combine the BB and Bb counts: 12 + 24 = **36 expected black**. The 12 expected bb offspring are **brown**. The same results follow directly from 48 × 3/4 = 36 and 48 × 1/4 = 12.

Multiplying by 48 scales a proportion to the whole group. It does not assign coat colours to positions in a litter or require the observed record to contain exactly those counts. A probability is a property of the model; an observed count is the result of the particular fertilisations that occurred. Repeating the same model across many groups gives a basis for the expectation, while individual finite groups can differ.

### Specify the sequence before multiplying

Now ask for **a black first offspring followed by a brown second offspring** from the stated Bb × Bb parents. “First” and “second” identify two particular offspring in an ordered record. This is not a question about the two alleles inside one offspring.

We assume the offspring outcomes are **independent**: knowing the first outcome does not change the gamete probabilities or phenotype rule for the second. Under that assumption, 3/4 of first outcomes are black, and 1/4 of the possible second outcomes following those are brown. The fraction meeting both requirements is therefore:

**P(black first and brown second) = 3/4 × 1/4 = 3/16.**

The multiplication means “take the fraction that satisfies the first requirement, then the fraction of those records that also satisfies the second.” It is justified by the unchanged second-offspring probability. The word *and* alone is not enough to justify multiplying probabilities if the outcomes are not independent.

If the question instead asks for **one black and one brown offspring in either order**, there are two separate orderings. Black then brown has probability 3/4 × 1/4 = 3/16. Brown then black has probability 1/4 × 3/4 = 3/16. A pair cannot be both orderings, so they are mutually exclusive and can be added:

**P(one of each, either order) = 3/16 + 3/16 = 6/16 = 3/8.**

We did not multiply the result by two until identifying the second distinct ordering. The answer 3/8 is greater than the specified-order answer 3/16 because it includes more records. Its complementary category, both offspring having the same coat colour, has probability 1 − 3/8 = 5/8. Together the two exclusive categories total 3/8 + 5/8 = 1. Here the denominator describes all possible two-offspring records under the model, rather than a count of genotypes in a single square.

### Interpret a finite record carefully

A run of black offspring does not use up a supply of black outcomes, and a brown offspring does not make another brown outcome “due” or “unlikely because it just happened.” If the parental genotypes and model remain fixed, each next offspring has the same gamete-combination probabilities. Expected proportions do not make independent events compensate for previous results.

Small samples can differ noticeably from an expected ratio. That is **sampling variation**, variation in observed outcomes due to chance. Repeated or substantial disagreement can be a reason to examine the starting genotypes, parentage, scoring and biological assumptions. It is not a reason to change a ratio after each birth just to make the running totals look balanced.

Some applications use the word **carrier** for a heterozygote carrying an allele for a recessively expressed condition without showing that condition. They may specify **full penetrance**, meaning that every individual with the genotype defined to produce the condition expresses it under the stated conditions. These words identify the genotype-to-phenotype rule that a probability calculation must use. A model prediction is not an individual diagnosis, and the expression rule should be supplied rather than guessed from a condition’s name.

The optional applications involving several alleles, a lethal genotype or a rabbit colour series need additional expression rules and, where survival differs, a careful decision about which offspring are being counted. Return to them when those models have been developed. The single-locus contribution method remains useful, but the black/brown rule cannot simply be carried into every new context.

We can now predict from known allele pairs and explain what the probabilities mean. The next problem begins when a black-looking parent has no complete genotype record. Its appearance allows more than one starting pair. What kind of cross could make the unknown allele visible in the offspring?

<!-- Authored teaching interval ends. Complete protected native suffix reading copy begins; visible words, options, hints and models are retained. Reading controls are disabled. Exact functional source bytes are in raw-before and remain owned by the native suffix. -->

## Practise with support

### Apply the explanation

Try both questions. Use the hint to revise your thinking after an incorrect answer.

For Bb × Bb, what fraction is heterozygous?

<select disabled><option value="">Choose an answer</option><option value="1/4">1/4</option><option value="1/2">1/2</option><option value="3/4">3/4</option></select>

<button type="button" disabled>Check answer</button>

For Aa × aa, what is the expected number of aa offspring among 100?

<select disabled><option value="">Choose an answer</option><option value="25">25</option><option value="75">75</option><option value="50">50</option></select>

<button type="button" disabled>Check answer</button>

Stop and think

## Try this before opening the explanation

Why should the square’s edges contain A or a rather than Aa?

#### Show the explanation

The edges represent gametes, which carry one allele at the studied locus.

Optional video support

### Single-trait crosses and probability — video support

**As you watch:** Construct and interpret a monohybrid Punnett square, distinguish genotype and phenotype probabilities, and state the denominator.

Optional video. Internet access is required. The explanation below covers the idea without the video.

Open on YouTube

<button type="button" disabled>Load video</button>

#### Read the explanation

For Aa × Aa, the four equally likely combinations are AA, Aa, aA and aa. Grouping the two heterozygous combinations gives probabilities of 1/4 AA, 1/2 Aa and 1/4 aa. The dominant phenotype has probability 3/4 under complete dominance. Genotype probability and phenotype probability therefore can differ. “Heterozygous” refers to two of the four combinations, while “dominant phenotype” includes three. Mark the requested group before choosing your numerator. When converting to an expected number, multiply by the total. If 80 offspring each have a 1/4 chance of aa, the expected number is 80 × 0.25 = 20. The result is an expectation, not a promise.

Optional video support

### Single-trait crosses and probability — video support 2

**As you watch:** Construct and interpret a monohybrid Punnett square, distinguish genotype and phenotype probabilities, and state the denominator.

Optional video. Internet access is required. The explanation below covers the idea without the video.

Open on YouTube

<button type="button" disabled>Load video</button>

#### Read the explanation

For Aa × Aa, the four equally likely combinations are AA, Aa, aA and aa. Grouping the two heterozygous combinations gives probabilities of 1/4 AA, 1/2 Aa and 1/4 aa. The dominant phenotype has probability 3/4 under complete dominance. Genotype probability and phenotype probability therefore can differ. “Heterozygous” refers to two of the four combinations, while “dominant phenotype” includes three. Mark the requested group before choosing your numerator. When converting to an expected number, multiply by the total. If 80 offspring each have a 1/4 chance of aa, the expected number is 80 × 0.25 = 20. The result is an expectation, not a promise.

#### Open required check · Single-trait crosses and probability

## Explain what you have learned

This check counts toward chapter progress. Correct the 2 selections to unlock 2 written explanations. Saving writing records your response; it does not grade its accuracy.

<button type="button" disabled>Start</button>

<button type="button" disabled>Redo this check</button>

Not started

Required chapter check

Selection 1

### Under complete dominance, AA × Aa can produce which phenotypes?

Only the dominant phenotype

A fixed 3:1 dominant-to-recessive ratio

Only the recessive phenotype

A fixed 1:1 dominant-to-recessive ratio

<button type="button" disabled>Check answer</button>

Selection 2

### Aa × Aa has already produced three aa offspring. What is the probability that the next is aa in the independent model?

0

1/4

1

3/4

<button type="button" disabled>Check answer</button>

Answer the selections correctly to unlock the writing.

Written explanations

Written explanation 1

Show how to obtain genotype and phenotype probabilities for Bb × bb when B is completely dominant.

<textarea aria-describedby="ch17-l03-check-writing-1-status" rows="6" disabled></textarea>

Maximum 3200 characters. Explain the biology in your own words.

<button type="button" disabled>Save written response</button>

#### Compare after saving your own response

The heterozygote produces B or b gametes and bb produces b. The combinations are Bb and bb, each with probability 1/2. Therefore the expected genotype ratio is 1:1 and the expected dominant-to-recessive phenotype ratio is also 1:1.

Check your explanation for:

- Identifies the relevant structures or quantities.
- Explains the causal relationship or calculation, not just the final result.
- Uses the stated evidence and avoids a stronger conclusion than it supports.

Written explanation 2

Explain why a predicted count of 25 recessive offspring among 100 is not a guarantee.

<textarea aria-describedby="ch17-l03-check-writing-2-status" rows="6" disabled></textarea>

Maximum 3200 characters. Explain the biology in your own words.

<button type="button" disabled>Save written response</button>

#### Compare after saving your own response

The count is an expectation from a 1/4 probability multiplied by 100. Individual gamete combinations are chance events, so the observed count can differ. The model predicts a distribution of possibilities rather than an exact scheduled sequence.

Check your explanation for:

- Identifies the relevant structures or quantities.
- Explains the causal relationship or calculation, not just the final result.
- Uses the stated evidence and avoids a stronger conclusion than it supports.

<button type="button" disabled>Submit and finish</button>

#### Additional written application 1

This is optional written practice. It does not change required progress.

![Original question diagram or data. Use its labels and values with the written directions.](../assets/assessment/9e85ebb2ecbe95100af0.png)

Use the diagram or data with the question.

![Original question diagram or data. Use its labels and values with the written directions.](../assets/assessment/1cb36c7f022e66f1f7ff.png)

Use the diagram or data with the question.

The P 1 cross is between a full colour male ( D 1 D 3 ) and dilute colour female ( D 2 D 3 ). Calculate the theoretical probability of producing the F 1 phenotypes shown below. Show the calculation or sequence and explain your reasoning. Use only the supplied evidence; do not invent observations.

<textarea aria-describedby="ch17-source-written-OBJ_2131244-status" rows="5" disabled></textarea>

Optional response. Select Save response to collect it. Maximum 5000 characters.

<button type="button" disabled>Save response</button>

#### Additional written application 3

This is optional written practice. It does not change required progress.

![Original question diagram or data. Use its labels and values with the written directions.](../assets/assessment/f45c6bfd939bd821e055.png)

Use the diagram or data with the question.

In the second cross, a full colour rabbit ( CC a ) is mated to a light grey rabbit ( C ch C a ). Calculate the theoretical probability of this cross producing each of the following phenotypes shown below. Show the calculation or sequence and explain your reasoning. Use only the supplied evidence; do not invent observations.

<textarea aria-describedby="ch17-source-written-OBJ_2131248-status" rows="5" disabled></textarea>

Optional response. Select Save response to collect it. Maximum 5000 characters.

<button type="button" disabled>Save response</button>

← Mendel’s experiments and segregation

Next: Test crosses and unknown genotypes →

Optional textbook practice for Single-trait crosses and probability

<!-- Complete protected suffix reading copy ends. -->

<!-- Static reading supplement: the following exact existing hints, keys and explanations are supplied by current native data, not newly authored teaching or controls. Historical guidedActivities.worked records are deliberately not used as teaching owners. -->

## Feedback for the practice above

### Guided question 1

<!-- ch17-l03-guided-q1 -->

**Optional hint:** Count genotypes, not all dominant phenotypes.

**Answer:** 1/2

**Explanation:** Bb and bB are two of four equally likely combinations.

### Guided question 2

<!-- ch17-l03-guided-q2 -->

**Optional hint:** Use the actual parental cross before applying a ratio.

**Answer:** 50

**Explanation:** Probability aa = 1/2; 100 × 1/2 = 50.

### Selection question 1

<!-- ch17-l03-check-mc-1 -->

**Cue:** Trace the normal mechanism before choosing an answer.

**Answer:** Only the dominant phenotype

**Explanation:** Every offspring receives A from the homozygous parent.

### Selection question 2

<!-- ch17-l03-check-mc-2 -->

**Cue:** Trace the normal mechanism before choosing an answer.

**Answer:** 1/4

**Explanation:** Previous independent outcomes do not alter the next gamete-combination probabilities.

<!-- Exact current optional practice-bank reading copy begins. This appendix adds no item, save, grade or progress behaviour to the proposed native fragment. -->

## Optional practice

<!-- ch17-source-OBJ_2131224 -->

### In a completely dominant, single-locus model, which cross predicts a 3:1 dominant-to-recessive phenotype ratio?

- Aa × Aa
- AA × aa
- Aa × aa
- AA × AA

**Optional cue:** Identify the relevant mechanism or quantity and apply the stated model.

**Answer:** Aa × Aa

**Explanation:** The four equally likely outcomes are AA, Aa, Aa and aa. A sample ratio is evidence, not an exact guarantee.

<!-- ch17-source-OBJ_2131231 -->

### Under a fully penetrant autosomal-recessive model, two unaffected carriers have a child. What is the probability the child is affected?

- 75%
- 0%
- 50%
- 25%

**Optional cue:** Identify the relevant mechanism or quantity and apply the stated model.

**Answer:** 25%

**Explanation:** Aa × Aa predicts aa in one of four equally likely genotype combinations. Earlier births do not change this probability.

<!-- ch17-source-OBJ_2131235 -->

### In persons with sickle-cell disease, the red blood cells are shaped like a “sickle” and are not biconcave disks like normal red blood cells. Mr. and Mrs. Charleson are both carriers ( Hb A Hb S ) of sickle-cell disease. What are the chances of their having a child with sickle-cell disease?

- 0 percent
- 50 percent
- 100 percent
- 25 percent

**Optional cue:** Identify the relevant mechanism or quantity and apply the stated model.

**Answer:** 25 percent

**Explanation:** For HbA/HbS × HbA/HbS, the HbS/HbS combination has probability 1/4 in each conception under the stated model.

<!-- ch17-source-OBJ_2131239 -->

### A heterozygous affected parent Aa and an unaffected parent aa have offspring in a fully penetrant dominant model. What affected probability is predicted?

- 25%
- 100%
- 0%
- 50%

**Optional cue:** Identify the relevant mechanism or quantity and apply the stated model.

**Answer:** 50%

**Explanation:** Aa × aa gives one-half Aa and one-half aa. The statement is conditional on the inheritance model.

<!-- ch17-foundation-ch17-word-punnett-square -->

### Which term matches this description? A table combining possible parental gametes to organize offspring genotypes.

- Punnett square
- monohybrid cross
- probability
- expected number

**Optional cue:** Use the meaning of each term, not the length of its name.

**Answer:** Punnett square

**Explanation:** A table combining possible parental gametes to organize offspring genotypes. Each cell represents a possible combination, not a separate guaranteed offspring.

<!-- ch17-foundation-ch17-word-monohybrid-cross -->

### Which term matches this description? A cross between individuals heterozygous for one studied gene.

- Punnett square
- monohybrid cross
- probability
- expected number

**Optional cue:** Use the meaning of each term, not the length of its name.

**Answer:** monohybrid cross

**Explanation:** A cross between individuals heterozygous for one studied gene. A single-trait cross is not always heterozygote × heterozygote.

<!-- ch17-foundation-ch17-word-probability -->

### Which term matches this description? The expected proportion of an outcome under specified conditions.

- Punnett square
- monohybrid cross
- probability
- expected number

**Optional cue:** Use the meaning of each term, not the length of its name.

**Answer:** probability

**Explanation:** The expected proportion of an outcome under specified conditions. Use the group asked about as the denominator.

<!-- ch17-foundation-ch17-word-expected-number -->

### Which term matches this description? The predicted count obtained by multiplying a probability by the sample size.

- Punnett square
- monohybrid cross
- probability
- expected number

**Optional cue:** Use the meaning of each term, not the length of its name.

**Answer:** expected number

**Explanation:** The predicted count obtained by multiplying a probability by the sample size. An expected count need not equal an observed count.

<!-- ch17-l03-application-1 -->

### For Aa × Aa, what is the probability of two specified successive aa offspring?

- 1/2
- 1/4
- 1/16
- 3/4

**Optional cue:** Trace the normal mechanism before choosing an answer.

**Answer:** 1/16

**Explanation:** Multiply the independent probabilities: 1/4 × 1/4 = 1/16.

<!-- ch17-l03-scenario-1: exact existing self-assessed variant -->

**Explanation model:** 1/16. Multiply the independent probabilities: 1/4 × 1/4 = 1/16.

<!-- ch17-l03-context-punnett-square -->

### Identify the term illustrated: Rows list one parent’s gametes and columns the other’s.

**Optional cue:** Use the relationship described in the example.

**Answer:** Punnett square

**Explanation:** A table combining possible parental gametes to organize offspring genotypes. Each cell represents a possible combination, not a separate guaranteed offspring.

<!-- ch17-l03-context-monohybrid-cross -->

### Identify the term illustrated: Aa × Aa is used to examine segregation of one locus.

**Optional cue:** Use the relationship described in the example.

**Answer:** monohybrid cross

**Explanation:** A cross between individuals heterozygous for one studied gene. A single-trait cross is not always heterozygote × heterozygote.

<!-- ch17-l03-context-probability -->

### Identify the term illustrated: One of four equally likely combinations is homozygous recessive.

**Optional cue:** Use the relationship described in the example.

**Answer:** probability

**Explanation:** The expected proportion of an outcome under specified conditions. Use the group asked about as the denominator.

<!-- ch17-l03-context-expected-number -->

### Identify the term illustrated: A probability of 0.25 in 80 offspring gives an expected count of 20.

**Optional cue:** Use the relationship described in the example.

**Answer:** expected number

**Explanation:** The predicted count obtained by multiplying a probability by the sample size. An expected count need not equal an observed count.

<!-- ch17-punnett-label-practice-A -->

### What does letter A identify?

- AA
- aa
- Aa

**Optional cue:** Follow the leader line or the lettered feature. Read any stated model assumptions.

**Explanation:** Letter A identifies AA.

<!-- ch17-punnett-label-practice-B -->

### What does letter B identify?

- AA
- Aa
- aa

**Optional cue:** Follow the leader line or the lettered feature. Read any stated model assumptions.

**Explanation:** Letter B identifies Aa.

<!-- ch17-punnett-label-practice-C -->

### What does letter C identify?

- aa
- AA
- Aa

**Optional cue:** Follow the leader line or the lettered feature. Read any stated model assumptions.

**Explanation:** Letter C identifies Aa.

<!-- ch17-punnett-label-practice-D -->

### What does letter D identify?

- aa
- AA
- Aa

**Optional cue:** Follow the leader line or the lettered feature. Read any stated model assumptions.

**Explanation:** Letter D identifies aa.

<!-- Exact current optional practice-bank reading copy ends. -->
