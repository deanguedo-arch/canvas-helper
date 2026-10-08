# v0.2.0 source-method evidence: lessons 02 and 05

**Recommendation:** `RrTt × RRTt` is the smallest proposed structural change that retains the tomato context, four-versus-two distinct gametes and eight-cell method. It is a documented compromise, not full preservation of the original demand. It removes segregation for the fruit-colour phenotype and reduces the original four nonzero phenotype groups to two. A letter-only substitution does not protect the assessment.

The complete uploaded plan was read: `upload/Pasted text(20261004-212001).txt`, 11,540 bytes, SHA-256 `3b5e38bb4b038b94c69fcc8db2df53e41f6b4c38c27039ea52209fe74a372e59`. The latest user correction, relayed by the parent, overrides its proposed letter-only tomato adaptation. No source preflight was rerun.

The actual original deck is `source-inspection/ch17/sources/Unit C Part B Mendelian Genetics .pptx`, 10,153,531 bytes, SHA-256 `da1ce1c0526da4da1aefd1fb6c0f23070f820ce24378c12f9699d1c700e1a985`. Actual presentation order was freshly verified as slides 1–114. This pass reread the actual XML and relationships for **13–25 and 34–48: 28 slides**, plus pixels from **13 byte-verified original embedded images**. No whole-slide renders or notes were read in this pass. `READ_LOG.json` pins every input/member and states the exact scope; `ACTUAL_TARGETED_XML.json` preserves the fresh text/table extraction.

## Source method and fidelity boundaries

| Actual slides | Source teaching move | Fidelity requirement and qualification |
|---|---|---|
| 13–16 | Contrasting pea traits; purple/white historical entry; P/F1/F2 round/wrinkled observations; disappearance and return question | Preserve the phenomenon and clearly mark the move to the R/r seed model. Generation labels describe parentage, not universal genotypes. “Test crosses” is used broadly in the source; technical terminology needs correction. Slide 15's image supplies schematic fractions, not raw observations or a guarantee of exact finite ratios. |
| 17–23 | RR × rr → Rr F1 → Rr × Rr F2; grid edges and combinations; segregation | Preserve parental contribution tracing. A recessive allele remains present when its phenotype is absent. Homologue separation and random fertilization have distinct jobs; slide 22 conflates them. Keep the simple diploid model explicit without turning this into the later systematic-grid lesson. |
| 24–25 | Dominance explains F1 expression; segregation explains transmission; assortment is deferred | Image23 already qualifies segregation to diploid organisms and assortment to alleles on different chromosomes. Preserve the distinct jobs of these explanations. |
| 34–39 | T/G peas; pure TTGG × ttgg; TtGg F1; F1 cross and 9:3:3:1 F2 | Retain the actual pure-parent/F1/F2 bridge. Teach one allele from each locus per gamete before calculation. Source 37 repeats one distinct gamete type for each homozygous parent; duplicated labels do not create distinct types. |
| 40–42 | Independent orientations of homologous pairs explain assortment | Source 41 names metaphase I in a paragraph referring to prior meiosis-II notes. Its image44 includes later meiosis II. This is contextual ambiguity, not evidence that the diagram locates independent homolog orientation in meiosis II. Its four gamete classes span alternative orientations. |
| 43–45 | Tomato worded parents → genotypes → distinct gametes → 4×2 grid → four phenotype groups | Both grid shape and phenotype grouping are source demands. A valid eight-cell replacement alone is not complete fidelity. See the explicit tradeoff below. |
| 46–47 | Squash parental phenotype constraints → offspring evidence → parental genotype inference → forward cross → expected counts | Keep the inverse step before revealing genotypes. This is the distinct reasoning purpose for the case. It is not merely a second grid demonstration. |
| 48 | Practise the current simple one-/two-trait relationships before complexity | No advanced probability or altered inheritance model is justified solely to manufacture different answers. Linked videos were not opened or played. |

Exact XML locators for these records are in `METHOD_EVIDENCE.json`; for example, tomato is `ppt/slides/slide43.xml`, `slide44.xml`, and `slide45.xml`, including native table cells rather than text inferred from filenames. Squash is `ppt/slides/slide46.xml` and `slide47.xml`.

## Tomato: original and proposed parent change

The original slides 43–45 explicitly use a double heterozygote crossed to a height heterozygote homozygous recessive for colour: `RrTt × rrTt`. Source 43 translates the worded parents into a genotype/phenotype table. Source 44 identifies `RT, Rt, rT, rt` versus `rT, rt`, chooses only the needed distinct gametes, and asks about four phenotype groups. Source 45 fills the eight cells and derives tall red `3/8`, tall yellow `3/8`, short red `1/8`, short yellow `1/8`.

| Dimension | Original RrTt × rrTt | Proposed RrTt × RRTt | Fidelity assessment |
|---|---|---|---|
| Context and notation | Tomato; red/yellow fruit; tall/short plants; R/r, T/t | Same | Retained |
| Word-to-genotype reasoning | Double heterozygote; second parent homozygous recessive for colour, heterozygous for height | Double heterozygote; second parent homozygous dominant for colour, heterozygous for height | Same translation operations, changed biological givens |
| Parental phenotypes | Red/tall × yellow/tall | Red/tall × red/tall | The contrasting fruit-colour entry is lost |
| Distinct gametes | 4 versus 2 | 4 versus 2 | Retained; no duplicated columns needed |
| Cells and weights | Eight, each 1/8 under the stated model | Eight, each 1/8 under the stated model | Retained |
| Distinct genotypes | Six | Six | Retained; this is not a new benefit of the adaptation |
| Nonzero phenotype groups | Four | Two | Consequential loss of source demand |
| Phenotype results in source order | 3/8, 3/8, 1/8, 1/8 | 3/4, 0, 1/4, 0 | Changed answer structure; all offspring receive R |
| Genotype-to-phenotype grouping | Colour and height both segregate phenotypically | Both RR and Rr count as red; only height segregates phenotypically | Dominance grouping remains, but the final phenotype calculation is simpler |

The proposed cells, retaining the source's four-row/two-column orientation, are:

| First-parent gamete | RT from second parent | Rt from second parent |
|---|---|---|
| RT | RRTT | RRTt |
| Rt | RRTt | RRtt |
| rT | RrTT | RrTt |
| rt | RrTt | Rrtt |

The six genotype probabilities are RRTT `1/8`, RRTt `1/4`, RRtt `1/8`, RrTT `1/8`, RrTt `1/4`, Rrtt `1/8`. These are evidence calculations, not proposed learner prose or a genotype-only replacement task. A residual individual cell probability of `1/8` is not itself proof of an assessment copy; the relevant conflict is reproducing an isomorphic solved cross and phenotype target.

The replacement must not be described as preserving four nonzero phenotype groups or the full original cognitive demand. Four named categories could still be classified, but two contain zero offspring. That is a different reasoning emphasis. Keeping only a genotype task would discard the source's phenotype interpretation and would require its own explicit justification.

## Why a different ordinary 4×2 cross cannot solve the four-group conflict

This is a conditional result within the source model: diploid, two biallelic loci, ordinary equal segregation, independent assortment, random fertilization, and complete dominance scored separately at each locus. “4×2” means distinct gamete types, not repeated labels.

1. A parent with four distinct gametes must be heterozygous at both loci: `AaBb`.
2. A parent with two distinct gametes must be heterozygous at one locus and homozygous at the other. The only four generic possibilities are `AABb`, `aaBb`, `AaBB`, and `Aabb`.
3. The locus heterozygous in both parents gives the usual dominant/recessive phenotype probabilities `3/4` and `1/4`.
4. At the other locus, `Aa × AA` gives only the dominant phenotype, so only two joint phenotype groups can be nonzero. `Aa × aa` instead gives `1/2` and `1/2`, allowing four joint groups.
5. Therefore four nonzero groups necessarily have probabilities `3/8, 3/8, 1/8, 1/8`. `AaBb × aaBb` and `AaBb × Aabb` differ only by locus exchange. Parent reversal, allele-letter changes, scenario changes or table rotation do not change this structure.

`verify_four_by_two.py` exhaustively checked all 81 ordered pairs of the nine two-locus diploid genotypes. Exactly four pairs have parent gamete counts 4 then 2; exactly two have four nonzero phenotype groups, and both have the probability multiset above. `FOUR_BY_TWO_PROOF.json` contains every cell and grouped result. Assertions passed.

Consequently there is **no alternative within this ordinary source model** that retains four nonzero groups while avoiding the isomorphic original four-group probability structure. Unequal gamete weights from linkage, altered expression rules, viability selection, or a different grid shape can change the result but also change the taught model or method. Those are not minimum adaptations for this trial. Changing a sample size changes a count answer, not the underlying protected probability structure.

## Squash: preserve the inverse-inference purpose

Slide 46 starts from yellow/disk fruit crossed to white/sphere fruit. With its stated dominance rules, the initial constraints are `wwD_ × W_dd`. The observed yellow/sphere offspring is `wwdd`. Thus the yellow/disk parent supplied `d`, making it `wwDd`, and the white/sphere parent supplied `w`, making it `Wwdd`. Revealing `wwDd × Wwdd` before this evidence would remove the distinct inference step.

Slide 47 then uses `wD, wd` versus `Wd, wd` and obtains WwDd, wwDd, Wwdd, wwdd, each `1/4`. Its original 80-seed questions yield an expected 40 white-fruited plants and 20 yellow/sphere-fruited plants. The source switches fruit terminology to “white flowering” and “sphere-shaped flowers”; this is a wording drift. Its “actual number” is an expectation, and the counted population/viability assumption needs to be stated without a new selected-record denominator exercise.

Neither parent is a double heterozygote. The gametes and 1:1:1:1 result follow ordinary single-locus segregation in each parent even if the two loci are linked. Use the case to apply inverse genotype reasoning and then forward two-locus grouping/counting; do not present it as independent evidence for assortment.

The parent is concurrently auditing native/printed protected tasks and the original `N = 80` overlap. This pass does not clear unchanged values. If only N changes, record honestly that it changes exact expected-count answers while preserving the inverse inference, parental cross and 1:1:1:1 structure. It does not create structurally independent transfer.

This evidence contains no learner manuscript, protected-task clearance, Chapter 11 passage review, native UI test, independent manuscript approval, or teacher acceptance claim. All earlier artifacts and original sources remain read-only.
