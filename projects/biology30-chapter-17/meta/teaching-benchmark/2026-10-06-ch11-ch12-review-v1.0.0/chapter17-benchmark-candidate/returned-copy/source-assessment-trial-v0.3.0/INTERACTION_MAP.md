# Native interaction map — v0.3.0

Integration owner SHA256: `bc42ea52d8cf5709c0ec33c914e86450f93971f3e3144cb81b695593aa0eff3b`. All current content pins are in INTERACTION_MAP.json. No runtime or storage namespace change is proposed; native UI tests remain pending.

## Optional notes: draft, explicit collection and history

- **draft:** Every note input uses native change/save to assign S.notes[responseID].draft. Empty and oversized drafts can be stored; textarea has no maxlength.
- **collection:** Explicit Save requires nonempty trimmed draft and raw length at most5000. Native change/save writes submitted=draft.trim() and at=Date.now().
- **reload:** restoreNotes fills textarea from draft. It does not recreate per-note saved status sentences; initial status is generic until interaction.
- **allMyWork:** Only submitted notes appear. C.notes supplies existing integrated title; last submitted response remains shown if a newer unsaved-to-collection draft exists, with a newer-draft notice.
- **history:** A second collection replaces the last submitted note. No S.history attempt entry, automatic accuracy grade, first-try grade or hint-use record is added for notes.
- **progress:** Required progress uses completed kind=check records only; notes contribute zero.
- **hintsAndModels:** The four optional tasks use ordinary unlocked details. Asking learners to save first is an instruction, not a technical save gate. Keep separate from required-writing data-locked models and hardcoded extension model.
- **conflictAndFailure:** Native cloned-state writes, revision comparisons, storage-event blocking and failure status remain owner. No new storage writer/schema/namespace.
- **print:** All My Work output includes submitted notes; actual print behavior remains untested.

## Required selections, saved writing and completion

- **MC.answerComparison:** selected === q.answer; HTML input.value and JSON answer must match exactly.
- **MC.success:** Correct. ${q.explanation}
- **MC.firstIncorrect:** Not correct yet. Hint: ${q.cue}
- **MC.laterIncorrect:** Not correct yet. Answer: ${q.answer}. ${q.explanation} Select and check the correct answer to unlock the writing.
- **MC.unlock:** Every MC item must have a correct attempt; first-try scoring is independent from later correction.
- **writing.draft:** Input persists draft, closes and locks the first details in that writing-question.
- **writing.save:** Only after selections unlock writing; rejects blank trim or raw draft length above3200; records trimmed submitted text and timestamp.
- **writing.model:** Native render unlocks the HTML details only when submitted is non-null and equals current draft.trim(). Model/criteria are existing static HTML, so revised text must be synchronized with JSON.
- **writing.completion:** Requires every writing draft nonblank, length within limit, and submitted equal current trimmed draft; then pushes a completed check history record.
- **writing.grading:** Writing saved and completed for human review; never automatically correctness-graded.
- **freshOrigin.sourceReason:** checkSpec prefers S.checks[id].spec; startCheck clones the current config spec into the new run. Prior saved runs can retain old question keys and models after same-ID semantic replacements.
- **freshOrigin.authorizedMitigation:** User requires a fresh versioned isolated origin with no migration of old saved state. This source review does not create that origin or run the tests.
- **freshOrigin.runtimeChangeNeededForProposal:** False

## Exact current task and assessment content

# Current practice and feedback content map — v0.3.0

This administrative map contains all four optional tasks and the eight selected required assessments, including teacher answers and comparison models. It is not a learner assessment screen. Native interaction execution remains unverified.

## ch17-kinch-v020-l02-arrow-task

Response ID: ch17-kinch-v020-l02-arrow-response. Integrated All My Work title: Repair the two process labels.

### Repair the two process labels

The allele contributions below are possible, but a student's process labels are reversed. The arrows summarize allele movement; they omit DNA copying and the intermediate cells.

A student's labelled allele diagram

| Arrow | What the arrow shows                                                                  | Student's label |
|-------|---------------------------------------------------------------------------------------|-----------------|
| A     | R and r on a parent's homologous pair → R or r as the allele contribution in a gamete | Fertilisation   |
| B     | R in an egg + r in a sperm → Rr in the offspring's first cell                         | Segregation     |

Give each arrow its correct label. Explain what is separating or joining at each arrow, and which arrow restores an allele pair. Your explanation should repair the mechanism as well as the words.

This practice is optional and ungraded. Save your first response, then intentionally open the comparison to check your explanation. It does not count toward required chapter progress.

<div class="optional-writing"><label for="ch17-kinch-v020-l02-arrow-response">Your repaired labels and explanation</label><textarea aria-describedby="ch17-kinch-v020-l02-arrow-response-status" id="ch17-kinch-v020-l02-arrow-response" rows="5" disabled></textarea><p class="writing-status" id="ch17-kinch-v020-l02-arrow-response-status">Optional response. Select Save response to collect it. Maximum 5000 characters.</p><button type="button" disabled>Save response</button></div>

#### Optional hint: follow the number of contributions

At which arrow does one parent's pair separate into alternative contributions? At which arrow do contributions from two gametes meet? Do not use the word dominant to explain either movement.

#### Compare your explanation

Arrow A summarizes segregation. The parent's homologous chromosomes separate during meiosis, so a gamete contributes R or r at this locus. Arrow B is fertilisation: the egg and sperm join, and their allele contributions give the offspring the pair Rr.

Fertilisation restores the pair. Segregation does not create the second parent's contribution, and fertilisation does not separate the two alleles that were in a parent's diploid cell. If you corrected the names but still said that meiosis joins the egg and sperm, the causal explanation still needs repair.

**Check your response:** identify both processes correctly; name homologous separation for A and joining of gametes for B; connect the restored pair specifically to fertilisation.

## ch17-kinch-v020-l02-cross-task

Response ID: ch17-kinch-v020-l02-cross-response. Integrated All My Work title: Does reversing the parents reverse the result?.

### Does reversing the parents reverse the result?

Use the same ordinary autosomal seed-shape model: RR and Rr offspring seeds are round; rr offspring seeds are wrinkled. The allele has the same effect whether it arrives in the egg or in the sperm. The genotypes below are known from the breeding lines.

Two controlled pea crosses with the parental roles reversed

| Cross | Plant supplying eggs and receiving pollen | Plant supplying pollen and sperm |
|-------|-------------------------------------------|----------------------------------|
| A     | rr                                        | RR                               |
| B     | RR                                        | rr                               |

A grower says, “The offspring seeds should take their shape from the plant receiving the pollen, so reversing these parents must reverse the seed-shape result.” Is that prediction supported by this model? Follow one egg contribution and one sperm contribution in each cross, give the resulting genotype and phenotype, and use those contributions to evaluate the grower's claim.

This practice is optional and ungraded. Save your reasoning before opening the model for comparison. It does not count toward required chapter progress.

<div class="optional-writing"><label for="ch17-kinch-v020-l02-cross-response">Your comparison of the two crosses</label><textarea aria-describedby="ch17-kinch-v020-l02-cross-response-status" id="ch17-kinch-v020-l02-cross-response" rows="5" disabled></textarea><p class="writing-status" id="ch17-kinch-v020-l02-cross-response-status">Optional response. Select Save response to collect it. Maximum 5000 characters.</p><button type="button" disabled>Save response</button></div>

#### Optional hint: track contributions before appearance

Write the single allele available in an egg from each egg parent. Beside it, write the single allele available from the corresponding pollen donor. Which allele pair results after the two gametes join?

#### Compare your reasoning and its limit

In cross A, the rr egg parent supplies r and the RR pollen parent supplies R. Their offspring are Rr and round. In cross B, the RR egg parent supplies R and the rr pollen parent supplies r. The offspring are again Rr and round. Reversing which parent supplied the alleles does not change the pair or its phenotype under the stated model.

The grower's claim omits the sperm's genetic contribution and assigns the receiving plant's phenotype directly to the offspring. Fertilisation combines contributions from both parents. The conclusion concerns this specified autosomal seed-shape model; it is not a rule that every biological characteristic is unaffected by parental origin or growing conditions.

**Check your response:** show the egg and sperm allele in both crosses; distinguish the offspring seed from the plant carrying it; apply the same complete-dominance rule to the resulting genotype; explain why the receiving plant's appearance alone does not determine the answer.

## ch17-kinch-v020-l05-change-task

Response ID: ch17-kinch-v020-l05-change-response. Integrated All My Work title: Change one parent and keep only the reasoning that still applies.

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

## ch17-kinch-v020-l05-evidence-task

Response ID: ch17-kinch-v020-l05-evidence-response. Integrated All My Work title: Decide what the new offspring settles—and what it leaves open.

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

## ch17-l02-check-mc-1 — ordered options

1.  The recessive allele is always recreated by mutation
2.  Dominant alleles vanish after one generation
3.  Each heterozygous parent can contribute the recessive allele
4.  Gametes carry both parental alleles together at every locus

### ch17-l02-check-mc-1

**Prompt:** Why can a recessive phenotype reappear in the F2 generation?

**Answer:** Each heterozygous parent can contribute the recessive allele

**Explanation:** Two recessive contributions can form a homozygous recessive offspring.

**Cue:** Trace the normal mechanism before choosing an answer.

**Difficulty:** application

Correct selection  
Correct. Two recessive contributions can form a homozygous recessive offspring.

First incorrect selection  
Not correct yet. Hint: Trace the normal mechanism before choosing an answer.

Later incorrect selection  
Not correct yet. Answer: Each heterozygous parent can contribute the recessive allele. Two recessive contributions can form a homozygous recessive offspring. Select and check the correct answer to unlock the writing.

## ch17-l02-check-mc-2 — ordered options

1.  Yes; meiosis makes only one type of gamete after the first birth
2.  No; because alleles are not inherited
3.  Yes; every short run must exactly match the expected ratio
4.  No; small samples can differ from expected ratios

### ch17-l02-check-mc-2

**Prompt:** A heterozygote has six dominant-phenotype offspring in succession in a suitable cross. Does that prove segregation stopped?

**Answer:** No; small samples can differ from expected ratios

**Explanation:** Probabilistic outcomes can form runs without changing the mechanism.

**Cue:** Trace the normal mechanism before choosing an answer.

**Difficulty:** application

Correct selection  
Correct. Probabilistic outcomes can form runs without changing the mechanism.

First incorrect selection  
Not correct yet. Hint: Trace the normal mechanism before choosing an answer.

Later incorrect selection  
Not correct yet. Answer: No; small samples can differ from expected ratios. Probabilistic outcomes can form runs without changing the mechanism. Select and check the correct answer to unlock the writing.

### ch17-l02-check-writing-1

**Prompt:** In a stated complete-dominance model, M is dominant to m. Before DNA copying, a diploid plant cell has M on one homologue and m on the other at this locus. After normal copying, there are two M-bearing sister chromatids and two m-bearing sister chromatids. A student says, ‘There are now four allele versions, and each gamete must keep both M and m because the pair was copied.’ Repair both parts of the claim. Distinguish copies from allele versions, explain the relevant separations, and state the possible allele contribution of a normal gamete. Does m have to blend with M or be recreated to enter a gamete? Assume ordinary copying and meiosis without mutation.

**Model:** There are still two allele versions, M and m. Copying produced four physical copies of the tracked locus, two carrying M and two carrying m; it did not produce four different versions. The homologous chromosomes separate in meiosis I, and the sister chromatids separate in meiosis II, without another round of DNA copying between them. A normal gamete receives one chromosome set and therefore one allele at this locus: M or m, not the diploid pair Mm. Under ordinary equal segregation, either contribution has probability one half. The m version remains distinct during copying and separation and can enter a gamete directly; it neither blends with M nor needs to be recreated. Complete dominance explains the phenotype of the Mm parent, not which allele survives or how many alleles a gamete carries.

Criteria for human review:

- Distinguishes two allele versions, M and m, from four physical copies of the locus after copying.
- Connects homologue separation and later sister-chromatid separation to one allele per normal gamete, without extra copying between the divisions.
- Identifies M or m as the possible single-locus gamete contribution, rather than Mm.
- Explains that m remains distinct and available; dominance does not blend, destroy or recreate the allele.

Native response limit: 3200 characters. Writing is saved for human review, not automatically graded.

### ch17-l02-check-writing-2

**Prompt:** Distinguish an expected 3:1 phenotype ratio from an exact prediction for four offspring.

**Model:** The ratio represents probabilities under specified assumptions. Each offspring has the same modeled probabilities, but chance can produce different counts in a sample of four. Larger samples tend to show proportions closer to the expectation.

Criteria for human review:

- Identifies the relevant structures or quantities.
- Explains the causal relationship or calculation, not just the final result.
- Uses the stated evidence and avoids a stronger conclusion than it supports.

Native response limit: 3200 characters. Writing is saved for human review, not automatically graded.

## ch17-l05-check-mc-1 — ordered options

1.  The loci assort independently under the model
2.  The two genes must be identical
3.  Every parent must be homozygous
4.  Each offspring compensates for the previous one

### ch17-l05-check-mc-1

**Prompt:** What assumption is needed for multiplying separate two-locus probabilities in these examples?

**Answer:** The loci assort independently under the model

**Explanation:** Independence allows the product rule for locus outcomes.

**Cue:** Trace the normal mechanism before choosing an answer.

**Difficulty:** application

Correct selection  
Correct. Independence allows the product rule for locus outcomes.

First incorrect selection  
Not correct yet. Hint: Trace the normal mechanism before choosing an answer.

Later incorrect selection  
Not correct yet. Answer: The loci assort independently under the model. Independence allows the product rule for locus outcomes. Select and check the correct answer to unlock the writing.

## ch17-l05-check-mc-2 — ordered options

1.  1/16
2.  3/16
3.  7/16
4.  1/2

### ch17-l05-check-mc-2

**Prompt:** Use the stated pea model: TT and Tt are tall, tt is short; GG and Gg give green pods, gg gives yellow pods. Two TtGg parents are crossed with ordinary segregation, independent assortment, random fertilisation and reliable phenotype expression. For one offspring, what is the probability of being short or having yellow pods, including an offspring with both characteristics? The denominator includes all possible offspring, not only those showing one of these traits.

**Answer:** 7/16

**Explanation:** Count three non-overlapping phenotype groups: short/green has probability 1/4 × 3/4 = 3/16; tall/yellow has probability 3/4 × 1/4 = 3/16; short/yellow has probability 1/4 × 1/4 = 1/16. Adding these mutually exclusive groups gives 7/16. The double-recessive offspring qualifies, but counts once. The remaining tall/green group is 9/16, so all four groups total 1. Choosing 1/16 counts only the offspring with both recessive phenotypes; 3/16 counts only one single-recessive group. Adding 1/4 short to 1/4 yellow to get 1/2 would count short/yellow offspring twice.

**Cue:** Separate the qualifying offspring into short/green, tall/yellow and short/yellow. Count each possible offspring in only one of those groups.

**Difficulty:** application

Correct selection  
Correct. Count three non-overlapping phenotype groups: short/green has probability 1/4 × 3/4 = 3/16; tall/yellow has probability 3/4 × 1/4 = 3/16; short/yellow has probability 1/4 × 1/4 = 1/16. Adding these mutually exclusive groups gives 7/16. The double-recessive offspring qualifies, but counts once. The remaining tall/green group is 9/16, so all four groups total 1. Choosing 1/16 counts only the offspring with both recessive phenotypes; 3/16 counts only one single-recessive group. Adding 1/4 short to 1/4 yellow to get 1/2 would count short/yellow offspring twice.

First incorrect selection  
Not correct yet. Hint: Separate the qualifying offspring into short/green, tall/yellow and short/yellow. Count each possible offspring in only one of those groups.

Later incorrect selection  
Not correct yet. Answer: 7/16. Count three non-overlapping phenotype groups: short/green has probability 1/4 × 3/4 = 3/16; tall/yellow has probability 3/4 × 1/4 = 3/16; short/yellow has probability 1/4 × 1/4 = 1/16. Adding these mutually exclusive groups gives 7/16. The double-recessive offspring qualifies, but counts once. The remaining tall/green group is 9/16, so all four groups total 1. Choosing 1/16 counts only the offspring with both recessive phenotypes; 3/16 counts only one single-recessive group. Adding 1/4 short to 1/4 yellow to get 1/2 would count short/yellow offspring twice. Select and check the correct answer to unlock the writing.

### ch17-l05-check-writing-1

**Prompt:** A/a and B/b are alleles at two independently assorting autosomal loci. For AaBB × AaBb, a student intends each table header to name one distinct possible gamete type. The two row headers for AaBB are AB and aB. The four column headers for AaBb are AB, Ab, ab and ab. The student says, ‘A two-by-four table has eight boxes, so every possible gamete pairing is included once.’ Evaluate and repair the table. Derive the complete gamete list and probabilities for each parent, identify the defect in the proposed headers, and justify the probability of each cell in the corrected table. Assume ordinary equal segregation and random fertilisation.

**Model:** AaBB supplies A or a at the first locus, each with probability 1/2, and B at the second with probability 1. Its distinct gametes are AB and aB, each 1/2; the proposed rows are correct. AaBb supplies A or a and B or b, each at one half. Independent assortment gives AB, Ab, aB and ab, each 1/2 × 1/2 = 1/4. The proposed columns omit aB and repeat ab. Replace one ab header with aB. The dimensions can remain two by four, but the lists now include every distinct possible contribution. Eight boxes alone did not establish that: the original arrangement omitted valid pairings involving the second parent's aB gamete. Merely adjusting the weights of the repeated ab columns would not restore that missing type. In the corrected table, random fertilisation gives each pairing probability 1/2 × 1/4 = 1/8. Each parent's gamete probabilities total 1, and the eight cell probabilities total 8 × 1/8 = 1. A transposed four-by-two table with the same correct lists and weights is equally valid.

Criteria for human review:

- Derives AB and aB at 1/2 each for AaBB, using the certain B contribution.
- Derives AB, Ab, aB and ab at 1/4 each for AaBb from ordinary segregation and independent assortment.
- Identifies both the missing aB and the duplicated ab; repairs the list and explains why correct dimensions alone do not show completeness.
- Justifies each corrected pairing as 1/2 × 1/4 = 1/8 under random fertilisation and checks the gamete and cell probabilities total 1.

Native response limit: 3200 characters. Writing is saved for human review, not automatically graded.

### ch17-l05-check-writing-2

**Prompt:** In a hypothetical plant model, CC and Cc give coloured petals, cc gives white petals; HH and Hh give hairy stems, hh gives smooth stems. Two CcHh parents are crossed with ordinary segregation, independent assortment, random fertilisation and reliable expression. A student predicts that 9/16 of their offspring will be homozygous at each of the two loci because 9/16 have coloured petals and hairy stems. Evaluate the prediction. List the offspring genotypes that are homozygous at both loci and calculate their combined probability for one offspring, showing the allele contributions or separate-locus probabilities and justifying your operations.

**Model:** The prediction confuses genotype with phenotype. Each CcHh parent can make CH, Ch, cH and ch gametes, each with probability 1/4 under independent assortment. At the C locus, Cc × Cc gives 1/4 CC, 1/2 Cc and 1/4 cc. Homozygosity includes CC or cc, so add these exclusive alternatives: 1/4 + 1/4 = 1/2. At the H locus, Hh × Hh similarly gives 1/4 HH, 1/2 Hh and 1/4 hh, with homozygosity probability 1/2. The question requires homozygosity at both independent loci, so multiply 1/2 × 1/2 = 1/4. The qualifying genotypes are CCHH, CChh, ccHH and cchh. Each occurs in one of the sixteen equally likely gamete pairings, so their combined probability is 4/16, confirming 1/4. The other twelve pairings contain heterozygosity at one or both loci; 4/16 + 12/16 = 1. The 9/16 coloured/hairy group also includes CCHh, CcHH and CcHh, which are heterozygous at one or both loci. Conversely, some double-homozygous offspring express a recessive phenotype. Dominant appearance therefore does not identify the requested genotype group.

Criteria for human review:

- Distinguishes homozygosity at each locus from expression of both dominant phenotypes.
- Identifies all four qualifying genotypes: CCHH, CChh, ccHH and cchh.
- Derives each single-locus homozygosity probability as 1/4 + 1/4 = 1/2 and multiplies the two independent requirements, or gives an equivalent correctly weighted sixteen-pairing method.
- Concludes 1/4, checks the counted possibilities, and explains why the 9/16 coloured/hairy group includes genotypes that do not qualify.

Native response limit: 3200 characters. Writing is saved for human review, not automatically graded.
