# Two-trait crosses and independent assortment

## Does one allele contribution tell us the other?

A pea plant passes on **alleles** for many genes at once. If a gamete carries an allele associated with a tall plant, must it also carry the allele for green pods? Mendel extended his one-trait crosses to ask whether the inheritance of one characteristic influenced the inheritance of another. To answer that question, we need to follow two loci through the same gamete, then through fertilisation.

Keep the one-locus reasoning from lessons02–04: a diploid parent has two alleles at a locus, a gamete contributes one, and fertilisation restores a pair. A **locus** is a gene's position on a chromosome. Here we follow a height locus and a pod-colour locus. A two-locus genotype records both pairs; a two-locus gamete records one allele from each pair.

### Begin with the true-breeding pea parents

Use **T** for the tall allele and **t** for the short allele. Use **G** for the green-pod allele and **g** for the yellow-pod allele. In this complete-dominance model, TT and Tt plants are tall, while tt plants are short; GG and Gg plants have green pods, while gg plants have yellow pods. Apply each gene's rule separately. A capital letter indicates the dominant relationship in a heterozygote, not a better or more common allele.

The true-breeding tall, green-pod parent is **TTGG**. Its contrasting short, yellow-pod parent is **ttgg**. Write the parental cross as TTGG × ttgg. The first parent can contribute only **TG**; the second can contribute only **tg**. These are whole gamete labels: one letter from the height locus and one from the pod-colour locus. Combining TG with tg gives **TtGg**, so the F1 plants are tall with green pods.

A plant heterozygous at both loci is a **dihybrid**. Growing the F1 generation and crossing two TtGg plants gives the next question: what combinations can their offspring inherit? We cannot answer by writing Tt or Gg on a gamete edge. Each of those is a parent's pair at one locus; neither supplies one allele at each of the two loci we are tracking.

### Connect the two contributions to chromosome movement

First consider two genes on different homologous chromosome pairs. During **metaphase I** of meiosis, those pairs line up before the homologues separate. The orientation of the pair carrying T/t does not set the orientation of the pair carrying G/g. Across many meioses, a T contribution can therefore accompany G or g; the same is true for a t contribution. The later separation of sister chromatids completes meiosis. Do not confuse the independent orientations of different pairs with the joining of two parents' gametes at fertilisation.

This is **independent assortment**: segregation at one locus does not determine the allele contribution at the other under this model. From TtGg, ordinary segregation gives T or t with probability ½ and G or g with probability ½. Because the two contributions are independent, the **probability** of their joint occurrence in one gamete is found by multiplying. For example, **P(TG) = P(T) × P(G) = ½ × ½ = ¼**. The result describes one gamete containing both T and G; it does not describe two separate gametes meeting.

The four distinct gamete types are **TG, Tg, tG and tg**, each with probability ¼. They exhaust the possibilities, so their probabilities total ¼ + ¼ + ¼ + ¼ = 1. This is a prediction for gametes across many meioses, not a claim that every individual meiosis must display all four types in that proportion.

### Read the existing branch figure one path at a time

The figure below uses A/a and B/b as general allele labels for two loci. The large branch circles carry allele letters; the smaller circles along the bottom carry **location labels A, B, C and D**. Those bottom labels are not extra alleles. Start at AaBb, follow the A branch, then the b branch. You reach location B, where the bottom key reads “B · Ab”: location B represents the gamete Ab. The first branch contributes one allele at the first locus and the second contributes one at the second locus. Trace the other three complete paths and use the key to identify their gametes. Returning to the pea letters, the four paths follow the same pattern as TG, Tg, tG and tg under independent assortment.

**Independent assortment: follow both allele choices**View larger

![Follow each branch from AaBb through one allele at the first locus and one at the second. Each endpoint is one haploid gamete, with probability one quarter.](../review-assets/assets/figures/ch17-two-trait.svg)

Follow each branch from AaBb through one allele at the first locus and one at the second. Each endpoint is one haploid gamete, with probability one quarter. Schematic — not to scale.

The branches organize allele possibilities. They are not a picture of chromosomes splitting into four parts, and they do not show fertilisation. The reason for the equal endpoint probabilities comes from the segregation and independent orientations just explained.

## Combine the F1 gametes, then group the F2 phenotypes

The cross is now **TtGg × TtGg**. Both parents have the same four distinct gamete types. Assume **random fertilisation**: which gamete comes from one parent does not change the gamete probabilities from the other. Each pairing then has probability ¼ × ¼ = **1/16**. Independent assortment establishes the combinations within each parent's gametes; random fertilisation allows us to combine contributions between parents in this way.

Put one parent's four gamete types down the left edge and the other's across the top. Read the TG row and tg column, for example: T meets t at the height locus, and G meets g at the pod-colour locus, giving **TtGg**. Keep the two alleles of each locus together when writing the offspring genotype. A box holds a possible offspring genotype, not another gamete.

F2 genotype combinations from TtGg × TtGg; each interior cell has probability 1/16

| Parent 1 gamete ↓ / parent 2 gamete → | TG, ¼ | Tg, ¼ | tG, ¼ | tg, ¼ |
|---------------------------------------|-------|-------|-------|-------|
| TG, ¼                                 | TTGG  | TTGg  | TtGG  | TtGg  |
| Tg, ¼                                 | TTGg  | TTgg  | TtGg  | Ttgg  |
| tG, ¼                                 | TtGG  | TtGg  | ttGG  | ttGg  |
| tg, ¼                                 | TtGg  | Ttgg  | ttGg  | ttgg  |

There are sixteen equally likely gamete pairings, not sixteen different genotypes. For instance, TtGg occurs in four cells because four different pairs of parental contributions produce it. Count those four cells when finding its probability; counting the genotype name only once would discard possible fertilisations.

Now apply the complete-dominance rules to determine the **phenotype**. The shorthand **T\_** means TT or Tt: at least one T is present, and the blank represents the second allele at that same locus. Similarly, **G\_** means GG or Gg. Thus T_G\_ groups all genotypes that are tall with green pods. The blanks do not remove alleles from the genotype or allow letters from a different locus.

Grouping the sixteen F2 cells by phenotype

| Phenotype and shorthand  | Genotypes, with their cell counts      | Phenotype probability     |
|--------------------------|----------------------------------------|---------------------------|
| Tall, green pods: T_G\_  | TTGG (1), TTGg (2), TtGG (2), TtGg (4) | (1 + 2 + 2 + 4)/16 = 9/16 |
| Tall, yellow pods: T_gg  | TTgg (1), Ttgg (2)                     | (1 + 2)/16 = 3/16         |
| Short, green pods: ttG\_ | ttGG (1), ttGg (2)                     | (1 + 2)/16 = 3/16         |
| Short, yellow pods: ttgg | ttgg (1)                               | 1/16                      |

These counts give the **9:3:3:1 phenotype ratio** for this particular cross and these allele relationships. The genotype counts are the nine separate entries shown in the middle column; they have not become four genotypes. The four phenotype categories are **mutually exclusive**: one plant cannot belong to two of them at once. They also cover every outcome in the model, so (9 + 3 + 3 + 1)/16 = 1 is a useful check.

### Use multiplication and addition for different jobs

Apply lesson03's single-locus method separately at each locus. Tt × Tt gives tall with probability ¾ and short with probability ¼. Gg × Gg gives green pods with probability ¾ and yellow pods with probability ¼. In this independent two-locus model, tall **and** green requires both outcomes, so ¾ × ¾ = 9/16. For tall and yellow, multiply ¾ × ¼; for short and green, multiply ¼ × ¾; for short and yellow, multiply ¼ × ¼. These products match the four groups in the grid.

Add when combining alternatives that cannot happen to the same plant. For example, all tall offspring are either tall/green or tall/yellow, so their combined probability is 9/16 + 3/16 = 12/16 = ¾. Multiplication combines the independent requirements here; addition combines the non-overlapping categories. Neither operation is justified merely by seeing the word “and” or “or” without checking the events.

The predictions also assume that the stated genotype produces its assigned phenotype in every counted plant, called **complete penetrance**, and that no phenotype group is selectively lost before counting. The ratios describe the model's probabilities. A finite set of offspring can depart from them by chance. Different parental genotypes require fresh gamete lists and calculations, as the next cross shows.

Worked example

## A tomato cross with four gametes from one parent and two from the other

Use a tomato model in which red fruit is dominant to yellow fruit and tall plants are dominant to short plants. Use **R/r** for fruit colour and **T/t** for height. Here RR and Rr produce red fruit, rr produces yellow fruit; TT and Tt are tall, tt is short. The loci assort independently, with the same random-fertilisation and expression assumptions used above.

**The first parent is heterozygous for both traits. The second is homozygous recessive for fruit colour and heterozygous for height.** Find the genotype and phenotype of each parent, then the proportions of offspring in the four fruit-colour/height categories. Start with the words, not a memorized ratio.

### Translate the parents and identify the gametes

Heterozygous for both traits means one of each allele at each locus: parent 1 is **RrTt**, red and tall. Homozygous recessive for colour means rr, while heterozygous for height means Tt: parent 2 is **rrTt**, yellow and tall. Both are tall, but their colour genotypes give them different allele contributions.

Possible gametes for RrTt × rrTt

| Parent | One allele from each locus           | Distinct gametes and probabilities |
|--------|--------------------------------------|------------------------------------|
| RrTt   | R or r, each ½; T or t, each ½       | RT, Rt, rT, rt; each ½ × ½ = ¼     |
| rrTt   | r with probability 1; T or t, each ½ | rT, rt; each 1 × ½ = ½             |

rr supplies only the r allele version at the colour locus. Listing the two chromosome copies as two different r gamete types would duplicate an identical possibility. The second parent therefore needs two columns, while the first needs four rows. The grid size follows the **distinct gametes**; it is not automatically four by four just because two traits are involved. Each parent's gamete probabilities total 1: four quarters for RrTt and two halves for rrTt.

### Combine one row contribution with one column contribution

Each pairing has probability ¼ × ½ = **⅛**. For the RT row and rt column, combine R with r to get Rr and T with t to get Tt. The offspring is RrTt, red and tall. Use the same locus-by-locus operation in every cell.

Eight equally likely gamete pairings from RrTt × rrTt

| Parent 1 gamete ↓ / parent 2 gamete → | rT, ½               | rt, ½                |
|---------------------------------------|---------------------|----------------------|
| RT, ¼                                 | RrTT — red, tall    | RrTt — red, tall     |
| Rt, ¼                                 | RrTt — red, tall    | Rrtt — red, short    |
| rT, ¼                                 | rrTT — yellow, tall | rrTt — yellow, tall  |
| rt, ¼                                 | rrTt — yellow, tall | rrtt — yellow, short |

The six distinct genotypes have the following counts among the eight cells: **1 RrTT : 2 RrTt : 1 Rrtt : 1 rrTT : 2 rrTt : 1 rrtt**. Their probabilities are those counts divided by eight, and the counts total eight. For example, RrTt occurs twice because RT can meet rt or Rt can meet rT. Keep this genotype grouping separate from the phenotype grouping below.

Phenotype predictions for the tomato offspring

| Requested phenotype     | Contributing genotypes | Probability     |
|-------------------------|------------------------|-----------------|
| Tall with red fruit     | RrTT, RrTt             | (1 + 2)/8 = 3/8 |
| Tall with yellow fruit  | rrTT, rrTt             | (1 + 2)/8 = 3/8 |
| Short with red fruit    | Rrtt                   | 1/8             |
| Short with yellow fruit | rrtt                   | 1/8             |

At the colour locus, Rr × rr gives Rr or rr with probability ½ each: red and yellow are both possible. At the height locus, Tt × Tt gives ¾ tall and ¼ short. Under the independent model, the separate-locus checks are therefore ½ × ¾ = 3/8 for red/tall, ½ × ¾ = 3/8 for yellow/tall, ½ × ¼ = 1/8 for red/short and ½ × ¼ = 1/8 for yellow/short. Each product requires both specified characteristics in one offspring.

The four phenotype categories are mutually exclusive and cover all possible offspring in this model. Their probabilities total 3/8 + 3/8 + 1/8 + 1/8 = 1. Writing the ratio in that requested order gives **3:3:1:1**. All four categories are possible; none has been discarded because its phenotype is recessive. This ratio describes expected proportions over many offspring, not a promise that each next group of eight will contain exactly three, three, one and one.

### Change one parent and keep only the reasoning that still applies

A grower now keeps the RrTt parent but replaces the rrTt parent with an **rrtt** plant. The allele meanings and the independent-assortment model are unchanged.

The one change to the tomato cross

| Case         | Parent 1 | Parent 2 |
|--------------|----------|----------|
| Worked cross | RrTt     | rrTt     |
| New cross    | RrTt     | rrtt     |

Which parental gamete list stays the same, and which must change? Give both lists and the new grid dimensions. Use them to find the proportion of offspring that will be short, and decide whether the earlier red/yellow proportions still hold. Explain why each retained or revised prediction follows from the allele contributions.

This practice is optional and ungraded. Save your reasoning, then open the comparison deliberately. It does not count toward required chapter progress.

<div class="optional-writing"><label for="ch17-kinch-v020-l05-change-response">Your revised gametes and predictions</label><textarea aria-describedby="ch17-kinch-v020-l05-change-response-status" id="ch17-kinch-v020-l05-change-response" rows="5" disabled></textarea><p class="writing-status" id="ch17-kinch-v020-l05-change-response-status">Optional response. Select Save response to collect it. Maximum 5000 characters.</p><button type="button" disabled>Save response</button></div>

#### Optional hint: locate the changed allele pair

Only the second parent's height pair changed. Which colour allele must that parent contribute? Which height allele must it now contribute? Compare the resulting gamete with each of the first parent's four types.

#### Compare the retained and revised reasoning

The RrTt parent still produces RT, Rt, rT and rt, each with probability ¼. rrtt contributes r at the colour locus and t at the height locus, so its only distinct gamete is rt, with probability 1. A four-row, one-column grid is sufficient.

Complete comparison for RrTt × rrtt

| RrTt gamete | rrtt gamete | Offspring genotype and phenotype |
|-------------|-------------|----------------------------------|
| RT          | rt          | RrTt — red, tall                 |
| Rt          | rt          | Rrtt — red, short                |
| rT          | rt          | rrTt — yellow, tall              |
| rt          | rt          | rrtt — yellow, short             |

Each genotype has probability ¼ × 1 = ¼, so the four genotype probabilities total 1. They also give four different phenotypes, each with probability ¼. Two cells are tt: the short proportion is 2/4 = ½, and the other half are tall. The old ¼ short prediction no longer applies because the second parent always supplies t instead of supplying T or t.

The colour cross remains Rr × rr. Half the offspring receive R from the first parent and are Rr, red; half receive r and are rr, yellow. Thus the overall red/yellow proportions remain ½ and ½ even though the four joint colour/height probabilities have changed. The unchanged colour conclusion and the changed height conclusion come from different loci.

**Check your response:** keep the first parent's list; reduce the second to rt; size the grid from those lists; show the two tt outcomes; explain why the overall colour proportions survive while the height probability changes. A four-by-two grid could use two identical rt columns with appropriate weights, but that would add an unnecessary duplicate, not another gamete type. Retaining the old rT column would be a different error: rrtt cannot contribute T.

## Use an offspring to resolve unknown parental alleles

The tomato genotypes were supplied. A different problem begins with the parents' phenotypes and asks what alleles they must carry. Lesson04 showed why a dominant phenotype can leave the second allele unknown. We can now use that same evidence-based reasoning at two loci before making the forward prediction.

### A summer-squash cross starts with two blanks

For this summer-squash problem, use the stated independent two-gene model. **W** gives white fruit and is completely dominant to **w**, which gives yellow fruit in ww plants. **D** gives disk-shaped fruit and is completely dominant to **d**, which gives spherical fruit in dd plants. Colour and shape are separate characteristics; a genotype must account for both.

A **yellow-fruit, disk-shaped** plant is crossed with a **white-fruit, spherical** plant. Yellow fruit forces ww, but disk shape could be DD or Dd: write the first parent as **wwD\_**. Spherical fruit forces dd, but white fruit could be WW or Ww: write the second as **W_dd**. At this stage we have not earned either missing allele. The blanks mark genuine alternatives, not permission to assume heterozygosity.

**Now an offspring with yellow, spherical fruit is observed.** Under the stated phenotype rules, that offspring must be **wwdd**. It received one w and one d from each parent. The yellow/disk parent already had ww, and the offspring's d shows that this parent's other shape allele is d: it must be **wwDd**. The white/spherical parent already had dd, and the offspring's w shows that its other colour allele is w: it must be **Wwdd**. A single observed double-recessive offspring resolves both unknowns here, provided the stated parentage and expression model are correct.

### Make the prediction from the now-resolved parents

The cross is **wwDd × Wwdd**. The first parent contributes wD or wd, each with probability ½: w is certain, while D or d segregates equally. The second contributes Wd or wd, each with probability ½: d is certain, while W or w segregates equally. Each list totals probability 1. Neither parent makes four distinct gametes, so this cross needs only two rows and two columns.

Gamete combinations after the yellow, spherical offspring resolves the squash parents

| wwDd gamete ↓ / Wwdd gamete → | Wd, ½                   | wd, ½                    |
|-------------------------------|-------------------------|--------------------------|
| wD, ½                         | WwDd — white, disk      | wwDd — yellow, disk      |
| wd, ½                         | Wwdd — white, spherical | wwdd — yellow, spherical |

Each interior pairing has probability ½ × ½ = ¼. Here the four cells are four different genotypes and four different phenotypes, each with probability ¼: a **1:1:1:1 genotype ratio** and a **1:1:1:1 phenotype ratio** in the table's order. Equal numbers of categories do not always occur, as the pea and tomato crosses showed. The probabilities sum to 1.

### Interpret an expected count among 80 plants

Suppose 80 seeds from this cross are grown into plants whose fruit can be scored. Treat these as 80 offspring from the same parental model, with no selective loss of a genotype before scoring. An **expected count** is the predicted average number for a group of that size under the probability model. As in lesson03, calculate it by multiplying the total offspring count by the probability of the requested outcome.

For white fruit, include both possible shapes. The white/disk and white/spherical categories cannot describe the same plant in this model, so add their probabilities: ¼ + ¼ = ½. The expected count is **80 × ½ = 40 white-fruit plants**. For yellow, spherical fruit, both conditions must hold; only wwdd qualifies. Its probability is ¼, giving **80 × ¼ = 20 yellow, spherical-fruit plants**.

As a check, each of the four phenotype groups has an expected count of 80 × ¼ = 20, and their expected counts sum to 80. The 40 white-fruit plants combine two of those groups; do not add that overlapping total to the four groups again. These are expectations for the plants grown and scored, not guarantees about germination or exact numbers in one planting. Also distinguish the two directions of reasoning: the observed offspring established what parental alleles were present; the resulting model predicts probabilities for further offspring.

### Decide what the new offspring settles—and what it leaves open

Use this hypothetical plant model. **V** is completely dominant for violet flowers; **vv** gives white flowers. **L** is completely dominant for smooth leaves; **ll** gives lobed leaves. The loci assort independently, the stated parentage is known, and these genotype-to-phenotype rules apply reliably.

A breeding record with incomplete parental genotypes

| Record                 | Flower and leaf phenotype    | What is already known about the genotype                                       |
|------------------------|------------------------------|--------------------------------------------------------------------------------|
| Parent 1               | Violet flowers, lobed leaves | V_ll                                                                           |
| Parent 2               | White flowers, smooth leaves | vvL\_                                                                          |
| One observed offspring | White flowers, smooth leaves | Use the phenotype rules to determine what is forced and what remains possible. |

A classmate says that this offspring must fill both parental blanks, just as the yellow, spherical squash offspring did. Evaluate that claim. Identify the allele each parent had to contribute to this offspring, state which parental genotype is now forced and which possibilities remain for the other parent, and name a further offspring leaf phenotype that would settle the remaining blank. Explain whether a finite run of smooth-leaf offspring alone would settle it.

This practice is optional and ungraded. Save your first explanation, then intentionally open the comparison. It does not count toward required chapter progress.

<div class="optional-writing"><label for="ch17-kinch-v020-l05-evidence-response">Your evidence-based parental-genotype explanation</label><textarea aria-describedby="ch17-kinch-v020-l05-evidence-response-status" id="ch17-kinch-v020-l05-evidence-response" rows="5" disabled></textarea><p class="writing-status" id="ch17-kinch-v020-l05-evidence-response-status">Optional response. Select Save response to collect it. Maximum 5000 characters.</p><button type="button" disabled>Save response</button></div>

#### Optional hint: inspect each missing allele separately

White flowers require vv, so trace one v back to each parent. For the leaves, the lobed parent can contribute only l. A smooth child must also have L, but does that tell you whether the other parent has a second L or an l?

#### Compare the evidence and its limit

The white offspring is vv, so each parent supplied v. Parent 1 already showed the violet phenotype and therefore had V; supplying v forces it to be **Vvll**. Parent 2 was already known to be vv. For leaf shape, parent 1 supplies l. The smooth offspring must have received L from parent 2, giving the offspring **vvLl**. The actual gamete contributions to this offspring were vl from parent 1 and vL from parent 2.

Parent 2 could still be **vvLL or vvLl**. Both can supply vL, so this observed offspring does not reveal the second leaf-shape allele. The classmate's claim goes too far: in the squash example the offspring expressed the recessive form at both loci and required both recessive contributions; here smooth leaves show that L was supplied, not that parent 2 lacks l.

A further **lobed-leaf offspring** would be ll. Parent 1 supplies l, so the second l would have to come from parent 2, forcing that parent to be vvLl. If parent 2 is vvLL, it contributes L every time and all offspring are smooth. If it is vvLl, its L and l contributions make both smooth and lobed offspring possible. A finite run containing only smooth offspring is possible under either candidate; it does not logically force LL. You do not need to assign a probability to the two possible parents to state this limit.

**Check your response:** force Vvll for parent 1 using the observed v contribution; retain both vvLL and vvLl for parent 2; identify the observed child's Ll pair and the vL contribution; explain why an ll child would settle the second blank but smooth-only observations do not prove it.

### Know when to carry this model forward

The answer to the opening question depends on how the loci are inherited. For genes on different chromosome pairs under independent assortment, an allele contribution at one locus does not favour a particular allele at the other. Genes close together on the same chromosome can be **linked**: they tend to be inherited together, so the four gamete combinations need not be equally frequent. Lessons12–13 will use that difference to study linkage and gene maps. Do not apply four equal gamete probabilities when independence has not been established or given.

For the crosses in this lesson, the useful sequence has stayed the same: establish or infer the parental genotypes, derive the gametes, combine them using the stated probabilities, then apply the phenotype rules to answer the actual question. Lesson06 changes those phenotype rules with incomplete dominance and codominance. The textbook practice at printed page595, questions13,15 and16, includes those later relationships; return to that set after lesson06.

## Required check — learner prompts

<div class="check-question"><p class="eyebrow">Selection 1</p><h3 id="ch17-l05-check-mc-1-prompt">What assumption is needed for multiplying separate two-locus probabilities in these examples?</h3><fieldset aria-labelledby="ch17-l05-check-mc-1-prompt"><label class="choice-row"><input name="ch17-l05-check-mc-1" type="radio" value="The loci assort independently under the model" disabled><span>The loci assort independently under the model</span></label><label class="choice-row"><input name="ch17-l05-check-mc-1" type="radio" value="The two genes must be identical" disabled><span>The two genes must be identical</span></label><label class="choice-row"><input name="ch17-l05-check-mc-1" type="radio" value="Every parent must be homozygous" disabled><span>Every parent must be homozygous</span></label><label class="choice-row"><input name="ch17-l05-check-mc-1" type="radio" value="Each offspring compensates for the previous one" disabled><span>Each offspring compensates for the previous one</span></label></fieldset><button type="button" disabled>Check answer</button><p class="inline-feedback"></p></div>

<div class="check-question"><p class="eyebrow">Selection 2</p><h3 id="ch17-l05-check-mc-2-prompt">Use the stated pea model: TT and Tt are tall, tt is short; GG and Gg give green pods, gg gives yellow pods. Two TtGg parents are crossed with ordinary segregation, independent assortment, random fertilisation and reliable phenotype expression. For one offspring, what is the probability of being short or having yellow pods, including an offspring with both characteristics? The denominator includes all possible offspring, not only those showing one of these traits.</h3><fieldset aria-labelledby="ch17-l05-check-mc-2-prompt"><label class="choice-row"><input name="ch17-l05-check-mc-2" type="radio" value="1/16" disabled><span>1/16</span></label><label class="choice-row"><input name="ch17-l05-check-mc-2" type="radio" value="3/16" disabled><span>3/16</span></label><label class="choice-row"><input name="ch17-l05-check-mc-2" type="radio" value="7/16" disabled><span>7/16</span></label><label class="choice-row"><input name="ch17-l05-check-mc-2" type="radio" value="1/2" disabled><span>1/2</span></label></fieldset><button type="button" disabled>Check answer</button><p class="inline-feedback"></p></div>

<div class="writing-question"><p class="eyebrow">Written explanation 1</p><label for="ch17-l05-check-writing-1">A/a and B/b are alleles at two independently assorting autosomal loci. For AaBB × AaBb, a student intends each table header to name one distinct possible gamete type. The two row headers for AaBB are AB and aB. The four column headers for AaBb are AB, Ab, ab and ab. The student says, ‘A two-by-four table has eight boxes, so every possible gamete pairing is included once.’ Evaluate and repair the table. Derive the complete gamete list and probabilities for each parent, identify the defect in the proposed headers, and justify the probability of each cell in the corrected table. Assume ordinary equal segregation and random fertilisation.</label><textarea aria-describedby="ch17-l05-check-writing-1-status" id="ch17-l05-check-writing-1" rows="6" disabled></textarea><p class="writing-status">Maximum 3200 characters. Explain the biology in your own words.</p><button type="button" disabled>Save written response</button><p class="writing-status" id="ch17-l05-check-writing-1-status"></p></div>

<div class="writing-question"><p class="eyebrow">Written explanation 2</p><label for="ch17-l05-check-writing-2">In a hypothetical plant model, CC and Cc give coloured petals, cc gives white petals; HH and Hh give hairy stems, hh gives smooth stems. Two CcHh parents are crossed with ordinary segregation, independent assortment, random fertilisation and reliable expression. A student predicts that 9/16 of their offspring will be homozygous at each of the two loci because 9/16 have coloured petals and hairy stems. Evaluate the prediction. List the offspring genotypes that are homozygous at both loci and calculate their combined probability for one offspring, showing the allele contributions or separate-locus probabilities and justifying your operations.</label><textarea aria-describedby="ch17-l05-check-writing-2-status" id="ch17-l05-check-writing-2" rows="6" disabled></textarea><p class="writing-status">Maximum 3200 characters. Explain the biology in your own words.</p><button type="button" disabled>Save written response</button><p class="writing-status" id="ch17-l05-check-writing-2-status"></p></div>
