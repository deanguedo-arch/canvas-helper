# Old-to-new required assessment map — v0.3.0

Four native IDs are retained while their assessment meaning changes under Dean’s explicit bounded authorization. This administrative record contains exact previous and candidate prompts, options, keys/models and criteria. The learner reading copy presents the selected prompts, with answers in a separately labelled teacher key. Unrelated protected answers are not reproduced there.

Integration owner: `bc42ea52d8cf5709c0ec33c914e86450f93971f3e3144cb81b695593aa0eff3b`; corrected supplied ZIP: `ddc02a762cdca9718867c3992850a766a5b0b97e0ce9614ffbf958d74667fc20`. No header or content/bank-version proposal is included. An eventual isolated origin must not treat a saved old response as a response to a changed item; no migration or runtime change has been made.

## ch17-l02-check-writing-1 → ch17-l02-check-writing-1

### Previous exact item

**prompt**

Explain Mendel’s F1 and F2 pattern using alleles rather than blending.

**model**

A homozygous dominant parent crossed with a homozygous recessive parent makes heterozygous F1 offspring. Their recessive alleles remain present. Segregation gives gametes one allele each, and an F2 offspring receiving two recessive alleles expresses the recessive phenotype.

**criteria**

1. Identifies the relevant structures or quantities.
2. Explains the causal relationship or calculation, not just the final result.
3. Uses the stated evidence and avoids a stronger conclusion than it supports.

**id**

ch17-l02-check-writing-1

**limit**

3200

### New exact item

**id**

ch17-l02-check-writing-1

**prompt**

In a stated complete-dominance model, M is dominant to m. Before DNA copying, a diploid plant cell has M on one homologue and m on the other at this locus. After normal copying, there are two M-bearing sister chromatids and two m-bearing sister chromatids. A student says, ‘There are now four allele versions, and each gamete must keep both M and m because the pair was copied.’ Repair both parts of the claim. Distinguish copies from allele versions, explain the relevant separations, and state the possible allele contribution of a normal gamete. Does m have to blend with M or be recreated to enter a gamete? Assume ordinary copying and meiosis without mutation.

**model**

There are still two allele versions, M and m. Copying produced four physical copies of the tracked locus, two carrying M and two carrying m; it did not produce four different versions. The homologous chromosomes separate in meiosis I, and the sister chromatids separate in meiosis II, without another round of DNA copying between them. A normal gamete receives one chromosome set and therefore one allele at this locus: M or m, not the diploid pair Mm. Under ordinary equal segregation, either contribution has probability one half. The m version remains distinct during copying and separation and can enter a gamete directly; it neither blends with M nor needs to be recreated. Complete dominance explains the phenotype of the Mm parent, not which allele survives or how many alleles a gamete carries.

**criteria**

1. Distinguishes two allele versions, M and m, from four physical copies of the locus after copying.
2. Connects homologue separation and later sister-chromatid separation to one allele per normal gamete, without extra copying between the divisions.
3. Identifies M or m as the possible single-locus gamete contribution, rather than Mm.
4. Explains that m remains distinct and available; dominance does not blend, destroy or recreate the allele.

**limit**

3200

### Demand, taught outcome and retained level

**purpose:** Apply persistent-allele and segregation reasoning to a before/after DNA-copy representation.

**taughtOutcome:** Explain how copying preserves allele versions and ordinary segregation supplies one allele per gamete without blending.

**consequentialDifference:** Replaces the worked P/F1/F2 retelling with two connected errors about allele-version number and gamete content after copying. No parent cross or offspring ratio is requested.

**levelPreservation:** Qualitative mechanism from visible native02; no mutation, chromosome-disorder diagnosis, advanced life cycle or new quantitative operation.

**dependenceOnTeaching:** Uses native01 genotype/allele/dominance meanings and actual integrated02 homologue/sister-copy/gamete explanation. This is modest taught mechanism transfer, not blind recall-free assessment.

**comparisonAgainstTeachingAndOptionalModels:** The existing arrow activity repairs segregation/fertilisation names and the reciprocal-cross activity evaluates the receiving-parent claim. Neither interprets the supplied four-copy/two-version record or supplies this complete required response. Visible copying explanation remains intentional prerequisite overlap.

**Freshness qualification:** Modest transfer: the visible explanation teaches copying and separation explicitly. Newness is interpretation of the supplied four-copy/two-version record and repair of two connected claims; neither allele letters nor complete recall independence is claimed.

**State meaning:** ID retained; prompt and expected evidence changed. Old response/progress is not evidence for the new item. Later isolated-origin no-migration requirement is documented, not implemented.

**Exact input:** `746380cf22eee10bb1acf82e246352f1dc2e425927ad4f83676d36026e25b0d5`, 2040 UTF-8 bytes. The JSON companion carries both old/new complete values and the paired SHA-bound HTML/JSON replacement ranges.

## ch17-l05-check-mc-2 → ch17-l05-check-mc-2

### Previous exact item

**prompt**

For independent AaBb × AaBb with complete dominance, what is P(aaB_)?

**answer**

3/16

**explanation**

P(aa) = 1/4 and P(B_) = 3/4, giving 3/16.

**cue**

Trace the normal mechanism before choosing an answer.

**id**

ch17-l05-check-mc-2

**options**

1. 1/16
2. 3/16
3. 1/4
4. 9/16

**difficulty**

application

### New exact item

**id**

ch17-l05-check-mc-2

**prompt**

Use the stated pea model: TT and Tt are tall, tt is short; GG and Gg give green pods, gg gives yellow pods. Two TtGg parents are crossed with ordinary segregation, independent assortment, random fertilisation and reliable phenotype expression. For one offspring, what is the probability of being short or having yellow pods, including an offspring with both characteristics? The denominator includes all possible offspring, not only those showing one of these traits.

**options**

1. 1/16
2. 3/16
3. 7/16
4. 1/2

**answer**

7/16

**explanation**

Count three non-overlapping phenotype groups: short/green has probability 1/4 × 3/4 = 3/16; tall/yellow has probability 3/4 × 1/4 = 3/16; short/yellow has probability 1/4 × 1/4 = 1/16. Adding these mutually exclusive groups gives 7/16. The double-recessive offspring qualifies, but counts once. The remaining tall/green group is 9/16, so all four groups total 1. Choosing 1/16 counts only the offspring with both recessive phenotypes; 3/16 counts only one single-recessive group. Adding 1/4 short to 1/4 yellow to get 1/2 would count short/yellow offspring twice.

**cue**

Separate the qualifying offspring into short/green, tall/yellow and short/yellow. Count each possible offspring in only one of those groups.

**difficulty**

application

### Demand, taught outcome and retained level

**purpose:** Choose the probability of a newly defined set of outcomes for one offspring.

**taughtOutcome:** Combine disjoint phenotype categories under a stated independent two-locus complete-dominance model.

**consequentialDifference:** Replaces a direct 3/16 pea category with a union of three distinct phenotype groups. The learner must decide which groups qualify and count the double-recessive group once; retaining source pea letters makes clear that a letter swap is not the change.

**levelPreservation:** Uses only the taught per-locus products and addition of mutually exclusive categories; no conditional renormalisation, combinatorics or new required complement rule.

**dependenceOnTeaching:** The pea grid and category probabilities are taught and intentionally reusable. Newness lies in the requested event and its grouping, not an unfamiliar cross or blindness to the table.

**comparisonAgainstTeachingAndOptionalModels:** Full pea teaching and protected video fallbacks give the four component probabilities but not this 7/16 group. Source-bank3/16 items and final aabb1/16 remain component/near-method overlap, not the complete new response. One-offspring wording avoids the different native03 multi-offspring warning.

**Freshness qualification:** The taught pea table already gives all component probabilities, so this is one new sum/complement. Native03 ch17-l03-teaching-03-p2 also names an unsolved “at least one recessive among two offspring” event with an isomorphic7/16 result under the relevant one-quarter model. Here the event is short OR yellow in ONE offspring. This near-cue does not supply the exact complete response; it prevents any blind-assessment claim.

**State meaning:** ID retained; prompt and expected evidence changed. Old response/progress is not evidence for the new item. Later isolated-origin no-migration requirement is documented, not implemented.

**Exact input:** `1d0d2b8c11e7790ba449f06acca670ad26ebc91f544d1976856e4793fb5c298b`, 1374 UTF-8 bytes. The JSON companion carries both old/new complete values and the paired SHA-bound HTML/JSON replacement ranges.

## ch17-l05-check-writing-1 → ch17-l05-check-writing-1

### Previous exact item

**prompt**

List the gametes from RrTt and rrTt under independent assortment, then explain why a 4 × 4 square is unnecessary.

**model**

RrTt produces RT, Rt, rT and rt. rrTt produces rT and rt. A 4 × 2 square contains all distinct combinations; duplicating columns does not add new outcomes or change probabilities.

**criteria**

1. Identifies the relevant structures or quantities.
2. Explains the causal relationship or calculation, not just the final result.
3. Uses the stated evidence and avoids a stronger conclusion than it supports.

**id**

ch17-l05-check-writing-1

**limit**

3200

### New exact item

**id**

ch17-l05-check-writing-1

**prompt**

A/a and B/b are alleles at two independently assorting autosomal loci. For AaBB × AaBb, a student intends each table header to name one distinct possible gamete type. The two row headers for AaBB are AB and aB. The four column headers for AaBb are AB, Ab, ab and ab. The student says, ‘A two-by-four table has eight boxes, so every possible gamete pairing is included once.’ Evaluate and repair the table. Derive the complete gamete list and probabilities for each parent, identify the defect in the proposed headers, and justify the probability of each cell in the corrected table. Assume ordinary equal segregation and random fertilisation.

**model**

AaBB supplies A or a at the first locus, each with probability 1/2, and B at the second with probability 1. Its distinct gametes are AB and aB, each 1/2; the proposed rows are correct. AaBb supplies A or a and B or b, each at one half. Independent assortment gives AB, Ab, aB and ab, each 1/2 × 1/2 = 1/4. The proposed columns omit aB and repeat ab. Replace one ab header with aB. The dimensions can remain two by four, but the lists now include every distinct possible contribution. Eight boxes alone did not establish that: the original arrangement omitted valid pairings involving the second parent's aB gamete. Merely adjusting the weights of the repeated ab columns would not restore that missing type. In the corrected table, random fertilisation gives each pairing probability 1/2 × 1/4 = 1/8. Each parent's gamete probabilities total 1, and the eight cell probabilities total 8 × 1/8 = 1. A transposed four-by-two table with the same correct lists and weights is equally valid.

**criteria**

1. Derives AB and aB at 1/2 each for AaBB, using the certain B contribution.
2. Derives AB, Ab, aB and ab at 1/4 each for AaBb from ordinary segregation and independent assortment.
3. Identifies both the missing aB and the duplicated ab; repairs the list and explains why correct dimensions alone do not show completeness.
4. Justifies each corrected pairing as 1/2 × 1/4 = 1/8 under random fertilisation and checks the gamete and cell probabilities total 1.

**limit**

3200

### Demand, taught outcome and retained level

**purpose:** Check a gamete-table representation for exhaustiveness and correct weighting.

**taughtOutcome:** Derive distinct gametes from each parental genotype and use them to organize a complete probability table.

**consequentialDifference:** Replaces exact tomato lists with an apparently correct-sized table that omits a possible gamete and duplicates another. A repaired complete list, not eight boxes or reversed parent order, supplies the answer.

**levelPreservation:** Still two independent loci, two versus four distinct gametes and eight equal pairings. No missing-parent inference, unequal segregation, sampling test or larger grid is added.

**dependenceOnTeaching:** Depends on visible definitions, one-allele-per-locus gametes, the native branch figure, distinct-type reasoning and random fertilisation. Generic method overlap is intentional.

**comparisonAgainstTeachingAndOptionalModels:** The restored tomato teaches the method, and the repaired optional rrtt task discusses redundant versus impossible columns. The required case changes the error: the omitted aB is genuinely possible; weighting duplicate ab columns cannot restore it. No complete identical malformed-list case was found in the source/native scan.

**Freshness qualification:** Tomato and optional-task feedback already discuss duplicated columns. The consequential new error is a possible aB type missing despite correct2×4 dimensions; merely reweighting duplicated ab cannot supply it. Freshness is coverage repair, not generic duplication or letter changes.

**State meaning:** ID retained; prompt and expected evidence changed. Old response/progress is not evidence for the new item. Later isolated-origin no-migration requirement is documented, not implemented.

**Exact input:** `69c5823eea0ca6ff8576821d7921b425c6f74cd5caac6c8abecaee7970503684`, 2218 UTF-8 bytes. The JSON companion carries both old/new complete values and the paired SHA-bound HTML/JSON replacement ranges.

## ch17-l05-check-writing-2 → ch17-l05-check-writing-2

### Previous exact item

**prompt**

Calculate P(A_bb) for AaBb × aaBb under independent assortment and complete dominance.

**model**

At A, Aa × aa gives P(A_) = 1/2. At B, Bb × Bb gives P(bb) = 1/4. Multiplying gives 1/8. The result depends on independent assortment and the stated phenotype rules.

**criteria**

1. Identifies the relevant structures or quantities.
2. Explains the causal relationship or calculation, not just the final result.
3. Uses the stated evidence and avoids a stronger conclusion than it supports.

**id**

ch17-l05-check-writing-2

**limit**

3200

### New exact item

**id**

ch17-l05-check-writing-2

**prompt**

In a hypothetical plant model, CC and Cc give coloured petals, cc gives white petals; HH and Hh give hairy stems, hh gives smooth stems. Two CcHh parents are crossed with ordinary segregation, independent assortment, random fertilisation and reliable expression. A student predicts that 9/16 of their offspring will be homozygous at each of the two loci because 9/16 have coloured petals and hairy stems. Evaluate the prediction. List the offspring genotypes that are homozygous at both loci and calculate their combined probability for one offspring, showing the allele contributions or separate-locus probabilities and justifying your operations.

**model**

The prediction confuses genotype with phenotype. Each CcHh parent can make CH, Ch, cH and ch gametes, each with probability 1/4 under independent assortment. At the C locus, Cc × Cc gives 1/4 CC, 1/2 Cc and 1/4 cc. Homozygosity includes CC or cc, so add these exclusive alternatives: 1/4 + 1/4 = 1/2. At the H locus, Hh × Hh similarly gives 1/4 HH, 1/2 Hh and 1/4 hh, with homozygosity probability 1/2. The question requires homozygosity at both independent loci, so multiply 1/2 × 1/2 = 1/4. The qualifying genotypes are CCHH, CChh, ccHH and cchh. Each occurs in one of the sixteen equally likely gamete pairings, so their combined probability is 4/16, confirming 1/4. The other twelve pairings contain heterozygosity at one or both loci; 4/16 + 12/16 = 1. The 9/16 coloured/hairy group also includes CCHh, CcHH and CcHh, which are heterozygous at one or both loci. Conversely, some double-homozygous offspring express a recessive phenotype. Dominant appearance therefore does not identify the requested genotype group.

**criteria**

1. Distinguishes homozygosity at each locus from expression of both dominant phenotypes.
2. Identifies all four qualifying genotypes: CCHH, CChh, ccHH and cchh.
3. Derives each single-locus homozygosity probability as 1/4 + 1/4 = 1/2 and multiplies the two independent requirements, or gives an equivalent correctly weighted sixteen-pairing method.
4. Concludes 1/4, checks the counted possibilities, and explains why the 9/16 coloured/hairy group includes genotypes that do not qualify.

**limit**

3200

### Demand, taught outcome and retained level

**purpose:** Calculate a genotype-status event and evaluate an inappropriate phenotype shortcut.

**taughtOutcome:** Distinguish genotype from phenotype and combine single-locus probabilities across independent loci.

**consequentialDifference:** Replaces renamed tomato red/short arithmetic with homozygosity at each locus, combining dominant and recessive homozygotes. Neither new letters nor a new species is the freshness claim; the eligible event changes.

**levelPreservation:** Same double-heterozygote 16-pairing method and elementary disjoint addition/independent multiplication already taught. No conditional probability, new inheritance model or harder population question.

**dependenceOnTeaching:** Uses native01 homozygote/dominance, native03 numerator selection, and05 single-locus probabilities/grid. The familiar pea cross structure is intentionally retained; the four-genotype status group is new.

**comparisonAgainstTeachingAndOptionalModels:** Teaching supplies genotype cell counts and9/16 dominant phenotype grouping but does not solve combined homozygosity at both loci. The new MC is phenotype-union grouping, whereas this writing task checks genotype status and an erroneous phenotype inference. No whole-response duplicate was found in the current native bank/fallback scan.

**Freshness qualification:** The complete pea16-cell table contains all four qualifying genotype patterns and the9/16 phenotype group. Newness lies in selecting both-locus homozygosity and rejecting a phenotype shortcut; the double-heterozygote cross itself is intentionally familiar.

**State meaning:** ID retained; prompt and expected evidence changed. Old response/progress is not evidence for the new item. Later isolated-origin no-migration requirement is documented, not implemented.

**Exact input:** `4a1006653299a24ddd914be11f676653c393d1e80888bc3c56f0a44681840a0f`, 2282 UTF-8 bytes. The JSON companion carries both old/new complete values and the paired SHA-bound HTML/JSON replacement ranges.

The four untouched required items in the selected routes remain: `ch17-l02-check-mc-1`, `ch17-l02-check-mc-2`, `ch17-l02-check-writing-2`, `ch17-l05-check-mc-1`. Optional textbook/video/source-bank work remains protected formative/source practice, including near-method3/16 examples. No independence from all teaching cues is claimed.
