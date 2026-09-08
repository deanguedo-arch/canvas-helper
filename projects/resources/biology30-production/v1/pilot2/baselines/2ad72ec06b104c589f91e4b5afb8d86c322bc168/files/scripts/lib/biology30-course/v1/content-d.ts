import type { Biology30LessonContent } from "./content-types.js";

export const BIOLOGY30_UNIT_D_CONTENT: Biology30LessonContent[] = [
  {
    id: "d-lesson-01",
    unitCode: "D",
    learningIntention: "I am learning to describe a population as a gene pool and explain what genetic equilibrium would require.",
    successCriteria: [
      "I can distinguish an individual genotype from population allele frequencies.",
      "I can calculate an allele frequency from counted alleles.",
      "I can explain why equilibrium is a comparison model rather than a claim that populations never change."
    ],
    materials: "Calculator, paper or the Investigation Notebook, and the supplied beetle gene-pool table.",
    safety: "This lesson uses synthetic instructional data. It makes no claims about the genetics, health, or identity of any learner or real community.",
    warmup: {
      title: "From organisms to alleles",
      prompt: "A population contains ten diploid beetles. How many copies of one autosomal gene are represented, and why is that number different from the number of beetles?",
      placeholder: "State the allele-copy count and explain your reasoning."
    },
    sections: [
      {
        label: "Scale of analysis",
        title: "A population is more than a head count",
        paragraphs: [
          "A population is a group of individuals of the same species living in the same area at the same time with a realistic opportunity to reproduce. Population genetics changes the question from “What genotype does this organism have?” to “How common is each allele in the breeding population?” That shift matters because evolution is measured as a change in allele frequencies across generations. An individual can develop, acclimate, or move, but an individual does not evolve genetically during its lifetime.",
          "The gene pool is the complete collection of alleles in that population. For a diploid autosomal locus, every individual contributes two allele copies. A population of 100 diploid organisms therefore contains 200 allele copies at that locus, even if only two allele forms—A and a—are present. Frequency is a proportion, so the frequency of A plus the frequency of a equals 1. Symbols p and q are labels for those frequencies, not labels for “strong” and “weak” alleles."
        ]
      },
      {
        label: "Counting evidence",
        title: "Move from genotype counts to allele frequencies",
        paragraphs: [
          "Suppose a synthetic beetle population contains 36 AA individuals, 48 Aa individuals, and 16 aa individuals. There are 200 allele copies. The AA group contributes 72 A alleles, and the heterozygous group contributes 48 more, for 120 A alleles. Therefore p = 120/200 = 0.60. The remaining 80 copies are a, so q = 0.40. Checking p + q = 1 catches many arithmetic errors before they affect later conclusions.",
          "Genotype frequency uses individuals as the denominator: 36/100 = 0.36 for AA, 48/100 = 0.48 for Aa, and 16/100 = 0.16 for aa. Allele frequency uses allele copies as the denominator. Confusing these denominators is the most common conceptual error in this unit. Keep a two-row evidence table—genotypes first, allele contributions second—so every calculated value can be traced back to an observed count."
        ],
        table: {
          caption: "Synthetic beetle gene-pool evidence",
          headers: ["Genotype", "Individuals", "A copies", "a copies"],
          rows: [["AA", "36", "72", "0"], ["Aa", "48", "48", "48"], ["aa", "16", "0", "32"], ["Total", "100", "120", "80"]]
        }
      },
      {
        label: "Model baseline",
        title: "What genetic equilibrium means",
        paragraphs: [
          "Hardy-Weinberg equilibrium describes a population in which allele and genotype frequencies remain stable from one generation to the next under a specific set of assumptions. The model imagines a very large, randomly mating population with no mutation, migration, or differential reproductive success among genotypes. Those conditions isolate inheritance from evolutionary forces. If allele frequencies remain constant under the model, ordinary Mendelian segregation by itself does not cause evolution.",
          "Real populations rarely satisfy every assumption perfectly. That is the model’s value, not its failure. Scientists compare observed evidence with the equilibrium prediction, then ask which violated assumption could explain a meaningful departure. A difference does not automatically identify the cause: sampling error, population structure, non-random mating, migration, selection, mutation, or drift may produce different patterns. The model starts an investigation; it does not finish one."
        ]
      },
      {
        label: "Scientific reasoning",
        title: "Use an equilibrium claim carefully",
        paragraphs: [
          "A defensible claim names the population, locus, time interval, and evidence. “This species is in equilibrium” is too broad. A stronger statement is: “At locus R in this sampled population, observed genotype frequencies do not differ meaningfully from the Hardy-Weinberg expectation in this generation.” Even that statement is provisional because one sample can miss rare alleles or local subpopulations. Repeated samples and transparent methods make the inference stronger.",
          "The social context also matters. Allele frequencies describe populations, not the worth, ability, or identity of individuals. Genetic categories can be misused when variation within groups is ignored or when socially defined groups are treated as fixed biological populations. In this course, population-genetic models are used to explain inheritance and evolutionary change. They are not tools for ranking people or making unsupported claims about complex human traits."
        ]
      }
    ],
    conceptMap: {
      title: "Population-genetics evidence chain",
      description: "Counts of genotypes are converted into allele frequencies, compared with a model baseline, and interpreted as evidence rather than certainty.",
      nodes: [
        { label: "Count", detail: "Record genotype numbers in a defined sample." },
        { label: "Calculate", detail: "Convert individual counts into allele frequencies p and q." },
        { label: "Compare", detail: "Test observed evidence against an equilibrium expectation." }
      ]
    },
    interaction: {
      title: "Gene-pool equilibrium model",
      intro: "Inspect three samples that share the same number of organisms but not the same allele distribution.",
      prompt: "Choose a sample. Decide which denominator is appropriate and what claim the evidence supports.",
      cases: [
        { id: "balanced", label: "Sample A · p = 0.50", evidence: "25 AA, 50 Aa, and 25 aa among 100 diploid organisms.", explanation: "The sample contains 100 A copies and 100 a copies. Genotype frequencies also match p², 2pq, and q² for p = q = 0.50." },
        { id: "a-common", label: "Sample B · A is common", evidence: "64 AA, 32 Aa, and 4 aa among 100 diploid organisms.", explanation: "There are 160 A copies and 40 a copies, so p = 0.80 and q = 0.20. The genotype pattern matches the equilibrium expectation for those frequencies." },
        { id: "heterozygote-deficit", label: "Sample C · heterozygote deficit", evidence: "45 AA, 30 Aa, and 25 aa among 100 diploid organisms.", explanation: "p = 0.60 and q = 0.40, but 30 heterozygotes are observed instead of an expectation of 48. The departure needs investigation; the sample alone cannot identify the cause." }
      ],
      staticFallback: "For each sample, count two allele copies per diploid organism, verify p + q = 1, and separate the numerical comparison from the causal interpretation."
    },
    practiceSeeds: [
      { id: "gene-pool", cognitiveLevel: "remember-understand", prompt: "Which description correctly defines a gene pool?", correct: "All allele copies at all loci in a defined population", distractors: ["The alleles carried by one individual", "Only alleles that produce a visible phenotype", "All genes found in every species in an ecosystem"], rationale: "A gene pool belongs to a defined population and includes all allele copies, whether common, rare, dominant, recessive, or not visibly expressed.", misconceptionFeedback: ["That is an individual genotype, not a population gene pool.", "Unexpressed and recessive alleles remain part of the gene pool.", "An ecosystem contains multiple species; a gene pool is population-specific."] },
      { id: "allele-denominator", cognitiveLevel: "apply", prompt: "A sample has 40 diploid organisms. What denominator is used to calculate the frequency of an autosomal allele?", correct: "80 allele copies", distractors: ["20 allele copies", "40 organisms", "160 chromosome pairs"], rationale: "Each diploid individual contributes two copies of an autosomal locus, so 40 × 2 = 80 allele copies.", misconceptionFeedback: ["Dividing by two moves in the wrong direction; each organism contributes two copies.", "Forty is the denominator for genotype frequency, not allele frequency.", "The calculation concerns one locus, not every chromosome pair."] },
      { id: "equilibrium-claim", cognitiveLevel: "higher-mental-activity", prompt: "Observed genotypes closely match a Hardy-Weinberg prediction in one sample. Which conclusion is strongest?", correct: "The locus shows no detected departure in this sample; repeated evidence is still needed", distractors: ["The entire species has stopped evolving", "No mutation has ever occurred at the locus", "Every Hardy-Weinberg assumption is proven true"], rationale: "Agreement is evidence of no detected departure at that locus and time, not proof about all loci, all generations, or every model assumption.", misconceptionFeedback: ["Evolution can continue at other loci or times.", "Rare mutation could occur without being detected in one sample.", "Different violations can offset one another, and a close match does not prove each assumption."] }
    ],
    artifact: {
      prompt: "Begin the Hardy-Weinberg evidence artifact by showing one complete genotype-to-allele calculation and writing a bounded equilibrium claim.",
      evidenceRequirements: ["A labelled genotype and allele-count table", "A p + q check with units or proportions", "A claim that names the population, locus, and evidence limit"]
    },
    exit: { title: "Define the baseline", prompt: "Explain why Hardy-Weinberg equilibrium can be scientifically useful even when real populations do not meet every assumption.", placeholder: "Connect the model baseline to evidence of change and to limits on causal claims." },
    glossaryTerms: ["population", "gene pool", "allele frequency", "genotype frequency", "genetic equilibrium"],
    sourceSummary: "Built from the Alberta Biology 20–30 Program of Studies, the verified Unit D classroom and system-course selections, the Unit D notes pages 2–11, and OpenStax Biology 2e population-genetics cross-checks."
  },
  {
    id: "d-lesson-02",
    unitCode: "D",
    learningIntention: "I am learning to test Hardy-Weinberg assumptions and use model departures as evidence for further investigation.",
    successCriteria: [
      "I can state the five major Hardy-Weinberg assumptions in biological terms.",
      "I can predict how violating an assumption may alter a gene pool.",
      "I can distinguish evidence of departure from proof of one evolutionary cause."
    ],
    materials: "Calculator and the supplied four-generation island population dataset.",
    safety: "The organism and data are synthetic. Model assumptions should not be used to make claims about real human groups without appropriate population definitions and evidence.",
    warmup: { title: "A model with impossible conditions", prompt: "Why might scientists deliberately build a model with conditions that no natural population meets perfectly?", placeholder: "Explain what the model allows scientists to compare or isolate." },
    sections: [
      {
        label: "Assumption set",
        title: "Hold evolutionary forces still",
        paragraphs: [
          "The Hardy-Weinberg model holds five influences still: mutation is absent, migration does not move alleles in or out, mating is random with respect to the locus, the population is effectively very large, and all genotypes have equal reproductive success. Mendelian segregation and random fertilization continue. Under those conditions, allele frequencies remain constant, and expected genotype frequencies can be calculated from p and q after one generation of random mating.",
          "Each assumption points to a real process. Mutation creates new allele forms. Gene flow transports alleles among populations. Non-random mating changes which gametes combine, often changing genotype proportions before it changes allele frequencies. Finite population size allows random sampling error, called genetic drift. Natural or sexual selection creates differences in survival or reproductive contribution. Naming the biological process is more useful than memorizing a list detached from evidence."
        ]
      },
      {
        label: "Prediction",
        title: "Different violations leave different clues",
        paragraphs: [
          "If a storm randomly leaves only a few survivors, allele frequencies may jump unpredictably, especially for rare alleles. If migrants arrive with a different allele distribution, the recipient population should shift toward the migrants’ frequencies. If one genotype leaves more surviving offspring, its associated alleles may increase in a directional pattern. If relatives mate more often than expected, homozygous genotypes may become more frequent while allele frequencies initially remain similar.",
          "These are predictions, not automatic diagnoses. A heterozygote deficit could reflect inbreeding, assortative mating, selection against heterozygotes, genotyping error, or the accidental mixing of two subpopulations in one sample. Scientists use additional evidence—movement records, survival data, parentage, spatial sampling, or repeated generations—to distinguish among explanations. A good investigation is designed around alternatives rather than a single favoured story."
        ],
        table: {
          caption: "Assumptions and evidence that could challenge them",
          headers: ["Assumption", "Process when violated", "Useful additional evidence"],
          rows: [["Very large population", "Genetic drift", "Population size and replicate trajectories"], ["No migration", "Gene flow", "Movement and neighbouring allele frequencies"], ["Equal reproductive success", "Selection", "Survival and offspring counts by genotype"], ["Random mating", "Assortative mating or inbreeding", "Parentage and genotype-pair frequencies"]]
        }
      },
      {
        label: "Testing",
        title: "Observed versus expected is a statistical question",
        paragraphs: [
          "After calculating p and q from the observed sample, scientists calculate expected genotype proportions p², 2pq, and q². Multiplying each proportion by sample size produces expected counts. The differences between observed and expected counts can then be evaluated. Small differences are inevitable because samples are finite. A statistical goodness-of-fit test can help judge whether the discrepancy is larger than expected from sampling alone, provided its assumptions are met.",
          "This course emphasizes the reasoning before formal statistics: define categories, verify totals, calculate an expectation from observed allele frequencies, compare all genotype classes, and examine sample size. A visual difference is not automatically biologically important, and a non-significant result is not proof of perfect equilibrium. Measurement quality and statistical power affect what the evidence can reveal."
        ]
      },
      {
        label: "Model limits",
        title: "Equilibrium is locus-specific and time-specific",
        paragraphs: [
          "One population may appear near equilibrium at one locus while another locus changes under selection. A population may also match expectations this year and depart after migration or an environmental shift. The model therefore applies to a defined locus, population, and generation. Broad claims about an entire species erase variation in geography, time, and selection pressure and should be rejected unless evidence truly supports that scale.",
          "The strongest conclusion combines calculation and uncertainty: state the observed departure, identify plausible mechanisms, and specify the next evidence needed. For example, an unexpected increase in a coastal allele after a shipping route opens is consistent with gene flow, but migration data and comparison populations are needed. “Consistent with” is accurate scientific language when multiple explanations remain possible."
        ]
      }
    ],
    conceptMap: { title: "Assumption-to-evidence workflow", description: "A model assumption is translated into a biological process, a predicted data pattern, and a test using additional evidence.", nodes: [{ label: "Assume", detail: "Define the no-change baseline." }, { label: "Predict", detail: "Forecast a pattern if one process acts." }, { label: "Test", detail: "Compare alternatives with repeated evidence." }] },
    interaction: {
      title: "Hardy-Weinberg assumption lab",
      intro: "The same starting population experiences one change. Inspect the predicted evidence before naming a mechanism.",
      prompt: "Choose a disturbance and decide which assumption is directly challenged.",
      cases: [
        { id: "storm", label: "Random storm mortality", evidence: "Ten survivors are an unrepresentative sample; a rare allele rises from 0.08 to 0.25.", explanation: "Small effective population size permits genetic drift. The direction is random, so replicate populations may change differently." },
        { id: "migration", label: "Migration corridor opens", evidence: "New arrivals carry allele A at 0.90 while residents have A at 0.35.", explanation: "Gene flow predicts movement of the recipient frequency toward the migrants’ distribution, depending on migration rate and reproduction." },
        { id: "mate-choice", label: "Like phenotypes pair", evidence: "Homozygotes increase while the overall A frequency changes little in the first generation.", explanation: "Non-random mating directly changes genotype combinations. It need not immediately change allele frequencies." }
      ],
      staticFallback: "For each disturbance, identify the violated assumption, predict allele and genotype effects separately, and name one measurement that could distinguish the mechanism from an alternative."
    },
    practiceSeeds: [
      { id: "assumption", cognitiveLevel: "remember-understand", prompt: "Which condition belongs to the Hardy-Weinberg no-change model?", correct: "All genotypes have equal reproductive success", distractors: ["Alleles mutate at a constant high rate", "Individuals choose genetically similar mates", "A small population experiences random mortality"], rationale: "Equal reproductive success removes selection from the baseline model.", misconceptionFeedback: ["Mutation violates the no-mutation assumption.", "Genetically assortative mating violates random mating.", "A small population is vulnerable to genetic drift."] },
      { id: "heterozygote-deficit", cognitiveLevel: "apply", prompt: "A sample has fewer heterozygotes than expected but similar allele frequencies. Which process could produce that pattern first?", correct: "Non-random mating among similar genotypes", distractors: ["A guaranteed new mutation in every gamete", "Equal reproductive success among all genotypes", "Perfect random mating in an infinite population"], rationale: "Assortative mating or inbreeding can redistribute genotype frequencies toward homozygosity before strongly changing allele frequencies.", misconceptionFeedback: ["Mutation is not guaranteed and does not specifically predict a broad heterozygote deficit.", "Equal fitness is part of the no-change baseline.", "Random mating predicts the expected p²:2pq:q² proportions."] },
      { id: "cause-limit", cognitiveLevel: "higher-mental-activity", prompt: "A locus departs from Hardy-Weinberg expectations. What should a scientist conclude first?", correct: "At least one model condition or sampling assumption may be violated; more evidence is needed to identify which", distractors: ["Natural selection is proven to be the only cause", "The arithmetic must be wrong", "The population is a new species"], rationale: "A departure is a signal for investigation because multiple biological and methodological causes can produce it.", misconceptionFeedback: ["Selection is one possibility, not the only one.", "Arithmetic should be checked, but a real departure may remain.", "Equilibrium departure is not a species criterion."] }
    ],
    artifact: { prompt: "Add an assumption analysis to the Hardy-Weinberg artifact: predict one violation, compare it with an alternative, and identify decisive evidence.", evidenceRequirements: ["The challenged assumption and biological process", "A predicted allele or genotype pattern", "A second explanation and evidence that could distinguish it"] },
    exit: { title: "From departure to investigation", prompt: "Explain why a Hardy-Weinberg departure is evidence of possible change but not proof of one specific mechanism.", placeholder: "Name at least two possible causes and one additional measurement." },
    glossaryTerms: ["Hardy-Weinberg equilibrium", "random mating", "effective population size", "goodness-of-fit", "model assumption"],
    sourceSummary: "Built from the Alberta Biology 20–30 Program of Studies, the verified Unit D sources, Unit D notes pages 8–17, and rights-safe population-genetics cross-checks."
  },
  {
    id: "d-lesson-03",
    unitCode: "D",
    learningIntention: "I am learning to solve Hardy-Weinberg problems and communicate what each calculated frequency represents.",
    successCriteria: ["I can choose p + q = 1 or p² + 2pq + q² = 1 for the quantity given.", "I can calculate allele and genotype frequencies in a defensible sequence.", "I can check whether my answer is mathematically and biologically plausible."],
    materials: "Calculator, worked-example organizer, and supplied synthetic phenotype datasets.",
    safety: "All datasets are synthetic and use simplified single-locus inheritance. Do not transfer these simplified models to complex human traits.",
    warmup: { title: "Name the quantity", prompt: "In p² + 2pq + q² = 1, which terms represent alleles and which represent genotypes?", placeholder: "Label every term before doing any arithmetic." },
    sections: [
      {
        label: "Equation meaning",
        title: "Two equations answer different questions",
        paragraphs: [
          "The equation p + q = 1 describes two allele frequencies at one locus: p is the frequency of one allele and q is the frequency of the other. The expanded equation p² + 2pq + q² = 1 describes expected genotype frequencies after random mating: p² for one homozygote, 2pq for heterozygotes, and q² for the other homozygote. The squared terms are not allele counts; they are probabilities that two gametes contribute the same allele.",
          "Before calculating, translate the evidence into a known quantity. A count of individuals with a recessive phenotype can represent q² only when the trait is fully penetrant, the phenotype corresponds uniquely to the homozygous recessive genotype, and the equilibrium model is being used. A direct genotype table allows p and q to be calculated by allele counting and is usually stronger evidence than inferring genotype from phenotype."
        ]
      },
      {
        label: "Worked method",
        title: "Start with the quantity you actually know",
        paragraphs: [
          "In a synthetic population of 1,000 plants, 90 show a recessive phenotype. Under the stated simple model, q² = 90/1,000 = 0.09. Taking the square root gives q = 0.30, so p = 1 − 0.30 = 0.70. Expected heterozygotes are 2pq = 2(0.70)(0.30) = 0.42, or about 420 plants. Expected homozygous dominant individuals are p² = 0.49, or about 490 plants.",
          "A common error is treating 0.09 as q rather than q². That mistake produces q = 0.09, p = 0.91, and a heterozygote estimate that does not follow from the observed recessive genotype frequency. Write the symbol beside every observed value before substituting. Keep frequencies as decimals during calculations, then convert to counts or percentages only when the question requires them."
        ]
      },
      {
        label: "Verification",
        title: "Use three independent checks",
        paragraphs: [
          "First, p and q must each lie from 0 to 1 and must sum to 1. Second, p², 2pq, and q² must also lie from 0 to 1 and sum to 1 within rounding tolerance. Third, expected counts should sum to the sample size. These checks cannot prove the biological assumptions, but they can expose misplaced square roots, omitted factors of two, percentage-decimal errors, and rounding drift.",
          "Keep extra digits until the end. If q² = 17/240, rounding q too early can shift all expected counts. Report a sensible precision that reflects sample size. A calculated frequency such as 0.26643 should not be presented as though five decimal places are biologically exact when the source sample contains only 240 individuals. Precision is part of scientific communication, not cosmetic formatting."
        ],
        table: { caption: "Hardy-Weinberg calculation checks", headers: ["Stage", "Required check", "Common error detected"], rows: [["Alleles", "p + q = 1", "Wrong subtraction or percentage conversion"], ["Genotypes", "p² + 2pq + q² = 1", "Missing 2 in heterozygotes"], ["Counts", "Expected counts sum to N", "Rounding or wrong denominator"]] }
      },
      {
        label: "Interpretation",
        title: "A correct number still needs a biological sentence",
        paragraphs: [
          "If 2pq = 0.42, write “Under the stated Hardy-Weinberg model, the expected heterozygote frequency is 0.42.” Do not write “42 percent of the population definitely carries the allele” unless the model assumptions and trait relationship justify that inference. The word expected signals that the value comes from a model. Observed genotype counts may differ, and carrier language applies only in an appropriate inheritance context.",
          "When comparing generations, calculate frequencies using each generation’s denominator rather than raw counts. A population can double in size while an allele frequency stays constant, or shrink while an allele frequency changes. Evolutionary change concerns relative allele representation. Population size affects drift and uncertainty, but population growth alone does not tell you the direction of allele-frequency change."
        ]
      }
    ],
    conceptMap: { title: "Hardy-Weinberg calculation route", description: "Identify the known frequency, solve for alleles, predict genotypes, and verify totals before interpreting.", nodes: [{ label: "Identify", detail: "Label the observed value as p, q, p², 2pq, or q²." }, { label: "Solve", detail: "Use the allele and genotype equations in order." }, { label: "Verify", detail: "Check ranges, sums, counts, and biological wording." }] },
    interaction: {
      title: "Hardy-Weinberg calculator",
      intro: "Compare three problems that begin from different kinds of evidence.",
      prompt: "Choose a dataset and identify the first valid calculation rather than searching for a memorized recipe.",
      cases: [
        { id: "recessive-phenotype", label: "Known recessive phenotype", evidence: "64 of 400 organisms are aa under the stated model.", explanation: "q² = 0.16, q = 0.40, p = 0.60, and expected heterozygotes are 2pq = 0.48 or 192 organisms." },
        { id: "allele-count", label: "Known allele count", evidence: "Among 500 allele copies, 325 are A.", explanation: "p = 325/500 = 0.65 and q = 0.35. No square root is needed because an allele frequency is directly observed." },
        { id: "genotype-table", label: "Known genotypes", evidence: "18 AA, 44 Aa, and 18 aa among 80 organisms.", explanation: "A copies = 80 and a copies = 80, so p = q = 0.50. Observed heterozygotes can then be compared with the expected 40." }
      ],
      staticFallback: "Label the known quantity, calculate without premature rounding, verify both equations, and write one sentence distinguishing expected from observed."
    },
    practiceSeeds: [
      { id: "terms", cognitiveLevel: "remember-understand", prompt: "What does 2pq represent in the Hardy-Weinberg genotype equation?", correct: "The expected frequency of heterozygotes", distractors: ["The frequency of the dominant allele", "The expected frequency of both homozygotes", "Twice the population size"], rationale: "A heterozygote can be formed by p then q or q then p, producing pq + qp = 2pq.", misconceptionFeedback: ["An allele frequency is p or q, not 2pq.", "The homozygote frequencies are p² and q².", "The term is a probability, not a head count until multiplied by N."] },
      { id: "square-root", cognitiveLevel: "apply", prompt: "If 9% of a modeled population is homozygous recessive, what is q?", correct: "0.30", distractors: ["0.09", "0.70", "0.91"], rationale: "The recessive genotype frequency is q² = 0.09, so q is the square root: 0.30.", misconceptionFeedback: ["0.09 is q², not q.", "0.70 is p after q has been calculated.", "0.91 results from subtracting q² rather than q from 1."] },
      { id: "interpretation", cognitiveLevel: "higher-mental-activity", prompt: "A model predicts 48 heterozygotes but 30 are observed. Which response is scientifically strongest?", correct: "Verify calculations, evaluate sampling, and investigate model assumptions before assigning a cause", distractors: ["Change the observed count to 48", "Conclude natural selection is proven", "Ignore the difference because models are always exact"], rationale: "A discrepancy is evidence to investigate; it should neither be erased nor assigned to one cause without additional data.", misconceptionFeedback: ["Observed evidence must not be altered to fit a model.", "Selection is one possible cause among several.", "Models are comparison tools, and discrepancies can be informative."] }
    ],
    artifact: { prompt: "Complete a worked Hardy-Weinberg analysis with symbols, calculations, verification, and a one-sentence interpretation.", evidenceRequirements: ["Every observed value labelled before substitution", "Allele and genotype sum checks", "A distinction between observed and expected frequencies"] },
    exit: { title: "Make the number mean something", prompt: "Solve q and 2pq when q² = 0.16, then explain what each result means and one assumption behind the estimate.", placeholder: "Show the calculation, checks, and biological interpretation." },
    glossaryTerms: ["p", "q", "p²", "2pq", "q²", "expected frequency"],
    sourceSummary: "Built from the Alberta Biology 20–30 Program of Studies, verified Unit D lesson sources, Unit D notes pages 12–20, and corrected, re-typeset Hardy-Weinberg methods."
  },
  {
    id: "d-lesson-04",
    unitCode: "D",
    learningIntention: "I am learning to distinguish mechanisms that change allele frequencies by the evidence patterns they produce.",
    successCriteria: ["I can explain mutation, gene flow, drift, selection, and non-random mating without treating them as interchangeable.", "I can predict whether a mechanism is directional or stochastic.", "I can compare competing explanations using population evidence."],
    materials: "Mechanism evidence cards and the supplied four-population allele-frequency graph.",
    safety: "The activity models non-human populations. Avoid value language such as better, pure, advanced, or inferior when describing allele-frequency change.",
    warmup: { title: "Same result, different history", prompt: "Two populations both show an allele rising from 0.20 to 0.50. Why does that numerical result not reveal the cause by itself?", placeholder: "Name at least two mechanisms that could produce the same direction of change." },
    sections: [
      {
        label: "Sources of variation",
        title: "Mutation creates; recombination reshuffles",
        paragraphs: [
          "Mutation is the ultimate source of new alleles because it changes DNA sequence. Most mutations are neutral or harmful in a given context, and a beneficial effect depends on environment and phenotype. Mutation rates at one locus are usually too low to cause rapid population-wide change by themselves, but mutation supplies the variation on which other forces act. Recombination, independent assortment, and fertilization create new allele combinations without creating new alleles.",
          "A mutation enters a gene pool only if it occurs in a lineage that contributes to the next generation. In sexually reproducing organisms, a mutation in a body cell can affect that organism but is not ordinarily inherited. A mutation in a cell lineage producing gametes may be transmitted. Even then, its fate depends on chance, selection, mating, and population structure. Novel does not mean useful, and common does not mean superior."
        ]
      },
      {
        label: "Movement and chance",
        title: "Gene flow and genetic drift change representation",
        paragraphs: [
          "Gene flow occurs when migrants or their gametes reproduce in another population. It can introduce alleles, raise or lower existing frequencies, and often reduce differences between connected populations. The effect depends on the migrants’ allele frequencies, their number relative to residents, and their reproductive contribution. Movement alone is not enough; alleles must enter the recipient gene pool to count as gene flow.",
          "Genetic drift is random change caused by finite sampling from one generation to the next. Its effect is strongest in small populations. A bottleneck sharply reduces population size, while a founder event begins a population from a small, unrepresentative sample. Both can reduce diversity or make rare alleles common by chance. Drift has no goal and does not consistently favour adaptations, although its results can interact with later selection."
        ]
      },
      {
        label: "Differential reproduction",
        title: "Selection links phenotype, environment, and fitness",
        paragraphs: [
          "Natural selection occurs when heritable phenotypic differences lead to differences in survival or reproductive contribution in a particular environment. Fitness is relative reproductive success, not strength, health, or moral value. If an allele contributes to a phenotype that leaves more viable offspring under current conditions, that allele may rise. If conditions change, the direction or strength of selection can also change.",
          "Selection can be directional, stabilizing, disruptive, frequency-dependent, or balanced by trade-offs. A simple rise in one allele is consistent with directional selection but does not prove it. Scientists look for genotype-linked survival, fecundity, or mating differences and compare populations or years with different conditions. Selection acts on phenotypes, while evolution is recorded as changing genetic composition in the population."
        ],
        table: { caption: "Mechanism signatures and cautions", headers: ["Mechanism", "Typical clue", "Caution"], rows: [["Gene flow", "Change follows movement and reproduction", "Movement without reproduction is not gene flow"], ["Drift", "Replicates change unpredictably; small populations vary most", "A single direction is not expected across replicates"], ["Selection", "Genotype-linked reproductive differences", "Frequency change alone does not prove selection"], ["Mutation", "New sequence variant appears", "Usually a slow direct effect at one locus"]] }
      },
      {
        label: "Evidence integration",
        title: "Separate mechanism, pattern, and claim",
        paragraphs: [
          "A pattern is what the data show: an allele rose, diversity fell, populations became more similar, or replicate populations diverged. A mechanism is the process proposed to produce the pattern. A claim connects the two and must be supported by evidence beyond the pattern when alternatives exist. For example, convergence after a migration corridor opens supports gene flow more strongly when tagged migrants reproduce and carry the changing allele.",
          "Non-random mating deserves careful placement. It directly changes genotype combinations and can increase homozygosity, but it does not necessarily change allele frequencies by itself. Sexual selection can change allele frequencies when mating differences lead to unequal reproductive success. Clear language prevents the false shortcut that every departure from random mating is automatically allele-frequency evolution in one generation."
        ]
      }
    ],
    conceptMap: { title: "Mechanism-evidence distinction", description: "A biological process produces a predicted population pattern, but the claim remains proportional to the available evidence.", nodes: [{ label: "Mechanism", detail: "Mutation, flow, drift, selection, or mating pattern." }, { label: "Pattern", detail: "Observed change in alleles, genotypes, or diversity." }, { label: "Claim", detail: "Best-supported explanation with limits and alternatives." }] },
    interaction: {
      title: "Microevolution evidence sort",
      intro: "Three populations show allele-frequency change. The direction alone is not enough to classify the mechanism.",
      prompt: "Choose an evidence set and identify which additional observation carries the most diagnostic value.",
      cases: [
        { id: "replicate-islands", label: "Replicate small islands", evidence: "Five equally small populations begin at p = 0.40 and later range from 0.05 to 0.85 with no shared environmental trend.", explanation: "Divergent, unpredictable trajectories and strong small-population effects support genetic drift." },
        { id: "migration-corridor", label: "Connected valleys", evidence: "After a corridor opens, neighbouring populations become genetically more similar; tagged migrants reproduce.", explanation: "Movement, reproduction, and convergence together support gene flow." },
        { id: "drought-survival", label: "Drought-associated survival", evidence: "A heritable beak phenotype predicts seed use, survival, and offspring number during drought years.", explanation: "The phenotype-fitness link and environmental contrast support natural selection more strongly than frequency change alone." }
      ],
      staticFallback: "For each case, name the pattern, identify the proposed mechanism, list an alternative, and point to the evidence that discriminates between them."
    },
    practiceSeeds: [
      { id: "new-allele", cognitiveLevel: "remember-understand", prompt: "Which process is the ultimate source of a new allele sequence?", correct: "Mutation", distractors: ["Independent assortment", "Random fertilization", "Genetic drift"], rationale: "Mutation changes DNA sequence; the other processes change combinations or frequencies of existing alleles.", misconceptionFeedback: ["Assortment reshuffles homologous chromosomes but does not create a new sequence.", "Fertilization combines existing gamete alleles.", "Drift changes the representation of existing alleles."] },
      { id: "drift-pattern", cognitiveLevel: "apply", prompt: "Which result most strongly supports drift rather than directional selection?", correct: "Small replicate populations change in different, unpredictable directions", distractors: ["The same allele rises in every large population under the same condition", "A genotype has higher offspring survival in every trial", "Migrants reproduce and populations converge"], rationale: "Drift is stochastic, so independent small populations often diverge in direction and magnitude.", misconceptionFeedback: ["A shared direction under a shared condition is more consistent with selection.", "Genotype-linked survival directly supports selection.", "Documented migration and convergence support gene flow."] },
      { id: "claim-quality", cognitiveLevel: "higher-mental-activity", prompt: "An allele rises after a drought. Which evidence is most important before claiming natural selection?", correct: "A heritable phenotype linked to the allele predicts differential survival or reproduction", distractors: ["The allele has a memorable name", "The population became smaller", "One graph shows the allele rose"], rationale: "Selection requires heritable phenotypic variation connected to differential reproductive contribution in that environment.", misconceptionFeedback: ["Names provide no mechanism evidence.", "A smaller population could increase drift but does not establish selection.", "The frequency pattern is necessary but not sufficient to identify the cause."] }
    ],
    artifact: { prompt: "Analyze a gene-pool change case by separating observed pattern, proposed mechanism, alternative explanation, and decisive evidence.", evidenceRequirements: ["A quantified allele-frequency pattern", "A mechanism prediction tied to evidence", "At least one plausible alternative and a discriminating test"] },
    exit: { title: "Do not name a force too early", prompt: "Contrast drift and selection using direction, population size, replication, and evidence of reproductive differences.", placeholder: "Write a comparison that could be used to interpret an unfamiliar dataset." },
    glossaryTerms: ["mutation", "gene flow", "genetic drift", "bottleneck effect", "founder effect", "natural selection", "fitness"],
    sourceSummary: "Built from the Alberta Biology 20–30 Program of Studies, verified Unit D source selections, Unit D notes pages 21–30, and OpenStax population-evolution cross-checks."
  },
  {
    id: "d-lesson-05",
    unitCode: "D",
    learningIntention: "I am learning to classify species interactions by their effects and explain how those interactions shape population abundance.",
    successCriteria: ["I can distinguish population, community, and ecosystem evidence.", "I can classify interactions using effects on both participants.", "I can explain why an interaction label may depend on scale, conditions, and measured fitness effects."],
    materials: "Species-interaction evidence cards and the supplied community observation table.",
    safety: "Use observations or supplied data rather than disturbing, collecting, feeding, or handling wild organisms.",
    warmup: { title: "Who is affected?", prompt: "A flowering plant gains pollination while an insect gains food. What evidence is needed before calling the interaction mutualism?", placeholder: "Describe a measurable benefit for each population." },
    sections: [
      {
        label: "Ecological scale",
        title: "Populations meet in communities",
        paragraphs: [
          "A community includes the populations of different species living and interacting in an area. An ecosystem includes that community plus non-living conditions and transfers of energy and matter. These levels answer different questions. Population data describe abundance or genetic change within one species; community data describe interactions, diversity, and composition among species; ecosystem data add factors such as temperature, water, nutrients, disturbance, and productivity.",
          "Interactions can alter survival, growth, or reproduction and therefore change abundance and selection pressure. Their effects are often represented as positive, negative, or approximately neutral for each participant. This notation is a starting framework: +/+ for mutualism, +/− for predation, herbivory, or parasitism, −/− for competition, and +/0 for commensalism. The symbols refer to measured effects relative to an appropriate comparison, not intention or moral value."
        ]
      },
      {
        label: "Classification",
        title: "Use outcomes, not appearances",
        paragraphs: [
          "In mutualism, both populations receive a net benefit, but the relationship may be obligate or optional and may shift with conditions. In commensalism, one benefits while the other has no detected effect. Demonstrating a true zero effect is difficult because an unmeasured cost or benefit may exist. Parasitism benefits a parasite while reducing host fitness, usually without immediately killing the host. Predation consumes another organism, while herbivory consumes plant or algal tissue and may or may not kill the organism.",
          "Competition occurs when organisms use a resource that is limiting. Intraspecific competition occurs within a species; interspecific competition occurs between species. The presence of two species near the same resource does not prove competition. Evidence could include reduced growth when they co-occur, resource overlap, removal experiments, or shifts in resource use. A classification is strongest when it identifies the resource and measures effects on both populations."
        ],
        table: { caption: "Interaction effects and evidence", headers: ["Interaction", "Effect pattern", "Evidence focus"], rows: [["Mutualism", "+/+", "Reproductive or survival benefit to both"], ["Competition", "−/−", "A shared limiting resource and reduced performance"], ["Predation or parasitism", "+/−", "Consumer gain and prey or host cost"], ["Commensalism", "+/0", "Benefit to one; no detected effect on the other"]] }
      },
      {
        label: "Context",
        title: "Interactions are not fixed personality traits",
        paragraphs: [
          "A plant-mycorrhizal association may be mutually beneficial when soil nutrients are scarce, yet the carbon cost to the plant may exceed nutrient benefit under other conditions. A normally commensal microorganism may become harmful when host defences or location change. Competition can be weak when resources are abundant and strong during drought. Therefore, interaction labels summarize evidence under stated conditions rather than permanently defining the species involved.",
          "Direct and indirect effects also differ. A predator directly lowers prey survival but may indirectly release a plant from herbivory. Removing one competitor can increase another species, which then changes a third interaction. Community ecology follows these pathways without assuming every correlation is direct. Experimental controls, time series, and food-web context help identify whether an observed response is caused by the focal interaction."
        ]
      },
      {
        label: "Investigation",
        title: "Build a fair interaction claim",
        paragraphs: [
          "A useful investigation defines the response variable for each participant. For pollination, flower visits alone show contact but not necessarily benefit. Researchers may compare seed set in accessible and excluded flowers while also measuring pollinator food collection or reproductive success. For competition, compare performance alone and together while controlling total density, resource level, and starting size. Replication helps separate an interaction effect from individual variation.",
          "Observational evidence can still be valuable when experiments would be unethical or impractical. A time series may show predator abundance preceding changes in prey abundance, or long-term monitoring may reveal plant recruitment after pollinator decline. The claim should remain proportional: association supports a hypothesis, while manipulative or converging evidence may strengthen causal inference. Always report the spatial and temporal scale because effects can reverse across scales."
        ]
      }
    ],
    conceptMap: { title: "Community interaction evidence", description: "Identify participants, measure effects on each, and interpret the relationship within its ecological context.", nodes: [{ label: "Participants", detail: "Define the two populations and the shared setting." }, { label: "Effects", detail: "Measure survival, growth, reproduction, or resource gain." }, { label: "Context", detail: "State conditions, scale, and indirect pathways." }] },
    interaction: {
      title: "Species-interaction model",
      intro: "Each case includes an observation and a stronger comparison. Classify only after considering both participants.",
      prompt: "Choose a case and decide which evidence justifies the interaction label.",
      cases: [
        { id: "pollinator", label: "Flower and pollinator", evidence: "Excluding visits lowers seed set; insects gain measurable food and produce more offspring where flowers are available.", explanation: "Both populations show a fitness-related benefit under these conditions, supporting mutualism." },
        { id: "epiphyte", label: "Epiphyte and tree", evidence: "The epiphyte gains light and support; tree growth and reproduction do not differ within measurement limits.", explanation: "The evidence supports commensalism provisionally, while acknowledging that a small tree effect may be undetected." },
        { id: "shared-seed", label: "Two seed consumers", evidence: "Each population grows alone; both decline when housed together at the same total density, and seed supply is depleted.", explanation: "A shared limiting resource and reciprocal cost support interspecific competition." }
      ],
      staticFallback: "For every case, record a response variable for both participants, the comparison condition, and one reason the classification might change with context."
    },
    practiceSeeds: [
      { id: "community", cognitiveLevel: "remember-understand", prompt: "Which description defines an ecological community?", correct: "Populations of different species living and interacting in an area", distractors: ["All individuals of one species across its entire range", "Only the non-living conditions in a habitat", "One organism and all of its genes"], rationale: "A community includes multiple interacting populations; an ecosystem adds abiotic conditions.", misconceptionFeedback: ["That describes a broad species distribution, not a local community.", "Abiotic conditions are part of an ecosystem context.", "That is an individual genetic scale."] },
      { id: "competition-evidence", cognitiveLevel: "apply", prompt: "Which evidence most strongly supports competition?", correct: "Both species perform worse together because they draw down the same limiting resource", distractors: ["Two species are photographed in the same area", "One species consumes the other", "Both species increase when one provides shelter"], rationale: "Competition requires reciprocal cost linked to a shared limiting resource.", misconceptionFeedback: ["Co-occurrence alone does not establish resource limitation or cost.", "Consumption is predation, herbivory, or parasitism.", "Reciprocal benefit is consistent with mutualism."] },
      { id: "context-shift", cognitiveLevel: "higher-mental-activity", prompt: "A fungus benefits a plant in nutrient-poor soil but imposes a net carbon cost in nutrient-rich soil. What is the best interpretation?", correct: "The net interaction can shift with environmental context and measured costs and benefits", distractors: ["The original mutualism evidence must have been false", "All fungi are parasites", "Interaction categories never depend on conditions"], rationale: "Interaction labels summarize net measured effects under stated conditions; the balance can shift as resources and costs change.", misconceptionFeedback: ["Both results may be valid under different conditions.", "Broad taxonomic labels do not replace measured effects.", "Ecological outcomes commonly vary with context."] }
    ],
    artifact: { prompt: "Begin the community investigation artifact by classifying one interaction from evidence and proposing a fair comparison.", evidenceRequirements: ["Response variables for both populations", "A control or comparison that tests the interaction", "A context or indirect effect that limits the claim"] },
    exit: { title: "Classify from evidence", prompt: "Explain why seeing two species together is insufficient to classify their interaction, and name the measurements needed.", placeholder: "Include effects on both participants, a comparison, and context." },
    glossaryTerms: ["community", "ecosystem", "mutualism", "commensalism", "parasitism", "predation", "competition"],
    sourceSummary: "Built from the Alberta Biology 20–30 Program of Studies, verified Unit D community lessons, Unit D notes pages 56–63, and OpenStax ecology cross-checks."
  },
  {
    id: "d-lesson-06",
    unitCode: "D",
    learningIntention: "I am learning to explain how predation and competition generate adaptations and changing population patterns.",
    successCriteria: ["I can connect defence or resource-use traits to costs and benefits.", "I can interpret predator-prey patterns without assuming a simple one-way cause.", "I can distinguish competitive exclusion from resource partitioning."],
    materials: "Predator-prey time series, niche-use table, and graphing tool or paper.",
    safety: "Use supplied observations. Do not stage predator-prey encounters or disturb organisms to test defence behaviour.",
    warmup: { title: "A trait has a cost", prompt: "Why might a defence that improves survival still fail to spread through every population?", placeholder: "Consider energetic cost, environment, trade-offs, and reproduction." },
    sections: [
      {
        label: "Predator-prey systems",
        title: "Abundance can rise, fall, and lag",
        paragraphs: [
          "Predators can reduce prey abundance, while prey availability can limit predator survival and reproduction. This two-way dependence can generate cycles in simplified systems, often with predator peaks following prey peaks. Real time series are also shaped by weather, alternative prey, disease, habitat, human harvest, and movement. A repeating lag is useful evidence, but it does not prove that predation alone controls both populations.",
          "Density-dependent effects are important. When prey are abundant, predators may encounter them more often, reproduce more, or switch toward them. When prey decline, predator numbers may later fall, giving prey an opportunity to recover. Yet refuges, age structure, and migration can dampen or disrupt cycles. Scientists compare multiple years and locations and build models that include plausible external drivers."
        ]
      },
      {
        label: "Adaptation and trade-offs",
        title: "Defence changes probabilities, not guarantees",
        paragraphs: [
          "Defences include camouflage, warning signals, armour, toxins, escape behaviour, grouping, and mimicry. A trait is adaptive when its heritable effects increase relative reproductive success in a particular context. Camouflage may reduce detection in one habitat but increase it in another. Toxin production consumes resources. Group vigilance can improve detection but increase competition or visibility. Every defence should be evaluated as a trade-off, not as a perfect design.",
          "Predators also have adaptations for locating, capturing, or processing prey. Reciprocal selection can produce coevolution when each species creates selection pressure on the other. Evidence for coevolution requires more than matching traits; it should show reciprocal evolutionary change or geographically paired patterns. Similar traits may also arise from other pressures. Avoid declaring an “arms race” from one dramatic observation."
        ]
      },
      {
        label: "Competition outcomes",
        title: "Niches overlap, shift, or separate",
        paragraphs: [
          "A niche describes how a species uses resources and conditions, not simply where it lives. The fundamental niche is the range it could occupy without limiting biotic interactions; the realized niche is the range observed under competition, predation, and other constraints. Strong overlap for a limiting resource can reduce performance. Competitive exclusion predicts that complete competitors cannot coexist indefinitely under constant conditions, but natural environments are rarely constant or one-dimensional.",
          "Resource partitioning reduces overlap through differences in time, space, or resource type. Character displacement describes evolved trait divergence where competing species coexist, but a valid claim requires geographic and genetic evidence. A short-term shift in behaviour is not automatically evolutionary change. As with predation, separate the observed pattern from the process proposed to produce it."
        ],
        table: { caption: "Predation and competition evidence", headers: ["Pattern", "Possible process", "Needed evidence"], rows: [["Predator peak follows prey peak", "Coupled population response", "Replicate time series and external drivers"], ["Species use different feeding heights together", "Resource partitioning", "Resource limitation and comparison where each occurs alone"], ["Defence trait rises where predator is common", "Selection by predation", "Heritability and reproductive consequences"]] }
      },
      {
        label: "Data reasoning",
        title: "Correlations need mechanism checks",
        paragraphs: [
          "Cross-correlation can quantify whether one time series tends to lead another, but a lag alone does not establish causation. If plant productivity drives herbivores and predators together, prey may appear to lead predators even when bottom-up resource change is the main driver. Removal experiments, natural experiments, diet evidence, and mechanistic models can test whether predation is necessary for the pattern.",
          "When graphing, keep equal time intervals, label abundance units, and avoid connecting missing data as though they were observed. Compare rate and timing rather than only highest values. A strong explanation cites specific peaks, lags, and changes, acknowledges an alternative driver, and proposes the next observation. This evidence discipline is more valuable than memorizing that predator and prey curves are always smooth cycles."
        ]
      }
    ],
    conceptMap: { title: "Interaction-to-adaptation pathway", description: "An interaction changes fitness, selection acts on heritable variation, and population evidence reveals the outcome with trade-offs.", nodes: [{ label: "Interaction", detail: "Predation or competition changes survival and reproduction." }, { label: "Variation", detail: "Individuals differ in heritable traits and costs." }, { label: "Outcome", detail: "Trait and abundance patterns change across generations." }] },
    interaction: {
      title: "Predator-prey evidence model",
      intro: "Inspect cases that look similar on a graph but differ in the evidence available.",
      prompt: "Choose a case and decide how strong the causal claim can be.",
      cases: [
        { id: "lagged-cycle", label: "Repeated lagged cycles", evidence: "Across six cycles, prey peaks precede predator peaks by one season; predator diet confirms prey consumption.", explanation: "The repeated lag and diet evidence support coupled dynamics, while weather and habitat should still be assessed." },
        { id: "shared-driver", label: "Shared climate driver", evidence: "Warm springs increase plant growth, herbivores, and predators in the same year; no consistent predator lag occurs.", explanation: "A shared bottom-up driver explains the positive association better than a simple predator-controlled cycle." },
        { id: "partitioning", label: "Competitor resource shift", evidence: "Together, two birds feed at different canopy heights; alone, each uses the full canopy and food is limiting.", explanation: "The alone-versus-together comparison supports resource partitioning caused by competition." }
      ],
      staticFallback: "For each case, identify the pattern, direct mechanism evidence, alternative driver, and one limit on generalization."
    },
    practiceSeeds: [
      { id: "predator-lag", cognitiveLevel: "remember-understand", prompt: "In a simplified coupled cycle, why might predator abundance peak after prey abundance?", correct: "Higher prey availability first increases predator survival or reproduction, whose population response takes time", distractors: ["Predators always reproduce before prey", "Prey abundance is calculated from predator abundance", "A lag proves climate has no effect"], rationale: "Population responses involve feeding, development, and reproduction, so predator change can follow prey availability.", misconceptionFeedback: ["Predator reproduction does not universally precede prey reproduction.", "The two abundances are measured independently.", "Other drivers can still influence both populations."] },
      { id: "resource-partition", cognitiveLevel: "apply", prompt: "Which comparison best supports competition-driven resource partitioning?", correct: "Species use broad overlapping resources alone but narrower, different resources together", distractors: ["Species use different resources in different continents", "Both species eat the same food and grow equally well together", "One species eats the other"], rationale: "The alone-versus-together shift links reduced overlap to the presence of the competitor.", misconceptionFeedback: ["Geographic difference introduces many uncontrolled explanations.", "Equal performance with no limiting effect does not support competition.", "Consumption is predation, not resource partitioning."] },
      { id: "defence-tradeoff", cognitiveLevel: "higher-mental-activity", prompt: "A toxin defence reduces predation but slows growth. Which prediction is most defensible?", correct: "Its frequency should depend on the balance of predation benefit and growth cost in that environment", distractors: ["It must reach 100% because it is protective", "It can never increase because it has a cost", "Every predator will immediately evolve immunity"], rationale: "Selection reflects net reproductive consequences and context-dependent trade-offs.", misconceptionFeedback: ["Protective traits can retain costs that prevent fixation.", "A cost does not erase a larger survival benefit.", "Predator counter-adaptation is possible but neither immediate nor guaranteed."] }
    ],
    artifact: { prompt: "Add a predator-prey or competition analysis using a graph, a mechanism claim, and a trade-off or alternative driver.", evidenceRequirements: ["Specific values, peaks, lags, or resource-use differences", "A causal pathway that stays within the evidence", "One trade-off, confound, or additional test"] },
    exit: { title: "Read beyond the curve", prompt: "Explain what a predator lag can support, what it cannot prove, and what additional evidence would strengthen the claim.", placeholder: "Use timing, mechanism evidence, and an alternative driver." },
    glossaryTerms: ["coevolution", "niche", "fundamental niche", "realized niche", "competitive exclusion", "resource partitioning", "density dependence"],
    sourceSummary: "Built from the Alberta Biology 20–30 Program of Studies, verified Unit D source selections, Unit D notes pages 57–60, and rights-safe ecology cross-checks."
  },
  {
    id: "d-lesson-07",
    unitCode: "D",
    learningIntention: "I am learning to use evidence to explain succession as a contingent process following disturbance.",
    successCriteria: ["I can distinguish primary from secondary succession by starting conditions.", "I can analyze how disturbance, dispersal, facilitation, tolerance, and inhibition affect community change.", "I can design a safe observational or supplied-data succession investigation."],
    materials: "Supplied post-disturbance quadrat dataset, graphing tool, and investigation planner.",
    safety: "Observe from established paths and use supplied images or data. Do not enter burned, flooded, unstable, contaminated, or protected sites.",
    warmup: { title: "After disturbance", prompt: "Why might two forests disturbed in the same year recover along different pathways?", placeholder: "Consider starting soil, survivors, seed sources, weather, and repeated disturbance." },
    sections: [
      {
        label: "Starting conditions",
        title: "Primary and secondary succession begin differently",
        paragraphs: [
          "Primary succession begins where biological legacies such as developed soil and established terrestrial communities are largely absent—for example, newly exposed rock after glacial retreat or new volcanic substrate. Weathering, microbial activity, and colonizing organisms contribute to soil development. Secondary succession begins after disturbance where soil, organic matter, seed banks, roots, microorganisms, or surviving organisms remain. Because these legacies accelerate recovery, secondary succession is often faster, but speed varies widely.",
          "The labels describe starting conditions, not a fixed list of species. A severe disturbance can leave patches with different legacies, creating a mosaic. Flooding may deposit new substrate in one place while leaving intact soil nearby. Fire can remove above-ground vegetation but preserve soil and fire-adapted seeds. Scientists map disturbance severity and biological legacies before interpreting later community patterns."
        ]
      },
      {
        label: "Pathways",
        title: "Facilitation, tolerance, and inhibition shape establishment",
        paragraphs: [
          "In facilitation, early colonists modify conditions in ways that help later species—for example, trapping sediment or adding organic matter. In tolerance, later species can establish despite earlier occupants and eventually persist under low-resource conditions. In inhibition, established organisms reduce recruitment of others until they die or disturbance creates openings. These mechanisms can operate together at different times or locations.",
          "Dispersal limits which species arrive. Seed distance, animal movement, wind, water, and landscape connectivity can matter as much as local competition. Chance arrival order can create priority effects: early occupants change later opportunities. Therefore, succession is not a guaranteed march toward one universal climax community. Climate, disturbance regime, species pool, soils, and history produce multiple possible trajectories."
        ]
      },
      {
        label: "Evidence over time",
        title: "Measure composition, structure, and function",
        paragraphs: [
          "Species richness alone cannot describe succession. Two plots may contain the same number of species but differ in identity, dominance, vertical structure, biomass, soil cover, or nutrient cycling. Repeated quadrats or transects can track percent cover and abundance. Remote images can track canopy. Soil measurements can reveal changing organic matter or moisture. The chosen variable must match the claim.",
          "A chronosequence compares sites of different ages as a substitute for following one site for decades. It is efficient but assumes the sites were similar before disturbance and differ mainly in age. That assumption often fails because soil, topography, management, and weather history vary. Long-term monitoring is stronger for temporal change, while carefully matched chronosequences can provide useful provisional evidence."
        ],
        table: { caption: "Synthetic post-fire quadrat summary", headers: ["Years after fire", "Bare ground", "Herb cover", "Shrub cover", "Tree seedlings per plot"], rows: [["1", "62%", "30%", "5%", "2"], ["5", "18%", "44%", "28%", "11"], ["15", "6%", "22%", "41%", "34"], ["35", "3%", "9%", "27%", "76"]] }
      },
      {
        label: "Investigation design",
        title: "Do not confuse age with cause",
        paragraphs: [
          "A strong supplied-data investigation begins with a question such as: “How does shrub cover change with time since moderate-severity fire in comparable sites?” The independent variable is time since fire, the response is shrub cover, and important controls include fire severity, slope, soil, and sampling method. Replicate plots at each age provide variation estimates. A graph should show individual values or uncertainty, not only one smooth line.",
          "The conclusion should describe the measured trajectory and its limits. Increasing tree seedlings alongside decreasing bare ground is consistent with secondary succession, but the dataset does not prove that herbs caused tree establishment. A facilitation claim would need a comparison of seedling establishment with and without herb cover or another mechanism test. Distinguishing pattern from mechanism prevents a descriptive study from being overstated."
        ]
      }
    ],
    conceptMap: { title: "Succession evidence timeline", description: "Starting conditions and disturbance history shape arrival, interactions, and measured community change through time.", nodes: [{ label: "Legacy", detail: "Soil, survivors, seed banks, and landscape context." }, { label: "Assembly", detail: "Dispersal, facilitation, tolerance, inhibition, and chance." }, { label: "Trajectory", detail: "Changing composition, structure, and ecosystem function." }] },
    interaction: {
      title: "Succession evidence timeline",
      intro: "Compare three disturbances by their starting conditions and evidence needs.",
      prompt: "Choose a site and classify the pathway without relying on elapsed time alone.",
      cases: [
        { id: "lava", label: "New lava surface", evidence: "No developed soil remains; windborne organisms colonize cracks and organic matter slowly accumulates.", explanation: "The absence of soil and terrestrial biological legacies supports primary succession." },
        { id: "fire", label: "Moderate forest fire", evidence: "Soil, roots, seed bank, and surviving patches remain; herbs resprout in the first year.", explanation: "Retained biological legacies support secondary succession and explain relatively rapid early recovery." },
        { id: "field", label: "Abandoned field", evidence: "Soil and nearby seed sources remain, but mowing history and invasive plants affect establishment.", explanation: "This is secondary succession with strong land-use and priority-effect context; no single endpoint is guaranteed." }
      ],
      staticFallback: "For each site, identify the starting substrate, biological legacies, dispersal sources, likely mechanism, response variable, and one reason the pathway could diverge."
    },
    practiceSeeds: [
      { id: "primary-secondary", cognitiveLevel: "remember-understand", prompt: "What most directly distinguishes primary from secondary succession?", correct: "Whether developed soil and substantial biological legacies remain at the start", distractors: ["The exact number of years since disturbance", "Whether the first colonist is a plant", "Whether the site will reach a fixed climax"], rationale: "The distinction is based on starting conditions, especially soil and surviving biological legacies.", misconceptionFeedback: ["Time affects trajectory but does not define the category.", "Microorganisms or other colonists may arrive before plants.", "Modern succession theory does not require one fixed endpoint."] },
      { id: "chronosequence", cognitiveLevel: "apply", prompt: "What is a major limitation of a chronosequence?", correct: "Sites of different ages may also differ in soil, severity, or history", distractors: ["It requires waiting at one site for decades", "It cannot include any measurements", "It always proves facilitation"], rationale: "A chronosequence substitutes space for time, so site differences can confound the age comparison.", misconceptionFeedback: ["Long-term monitoring, not a chronosequence, requires waiting at one site.", "Chronosequences can include extensive measurements.", "A pattern across site ages does not by itself prove a mechanism."] },
      { id: "mechanism-claim", cognitiveLevel: "higher-mental-activity", prompt: "Tree seedlings are more common where early herbs are dense. What evidence would best support facilitation?", correct: "A controlled comparison showing herbs alter conditions and increase seedling establishment", distractors: ["A photograph showing both are present", "A list of all species at the site", "The assumption that early species always help later species"], rationale: "Facilitation is a mechanism claim and needs evidence that the early species changes conditions in a way that improves later establishment.", misconceptionFeedback: ["Co-occurrence is correlation, not mechanism evidence.", "An inventory describes composition but not causal effect.", "Early species can facilitate, tolerate, or inhibit later species."] }
    ],
    artifact: { prompt: "Complete the community investigation with a succession question, graph, mechanism-bounded conclusion, and improvement.", evidenceRequirements: ["Starting conditions and a defined disturbance", "A graph of a relevant response variable with units", "A conclusion separating trajectory from proposed mechanism"] },
    exit: { title: "A pathway, not a ladder", prompt: "Explain why succession does not guarantee one fixed climax community and how a scientist could still study its patterns.", placeholder: "Use legacies, dispersal, interaction mechanisms, repeated data, and limits." },
    glossaryTerms: ["primary succession", "secondary succession", "biological legacy", "facilitation", "tolerance", "inhibition", "chronosequence", "priority effect"],
    sourceSummary: "Built from the Alberta Biology 20–30 Program of Studies, verified Unit D source selections, Unit D notes pages 64–68, and current ecological succession framing."
  },
  {
    id: "d-lesson-08",
    unitCode: "D",
    learningIntention: "I am learning to calculate population size, density, and change while matching each number to its ecological meaning.",
    successCriteria: ["I can distinguish size, density, distribution, and growth.", "I can calculate density and per-capita population change with correct units.", "I can evaluate sampling methods and sources of bias."],
    materials: "Calculator, quadrat and mark-recapture datasets, graph paper or a digital graphing tool.",
    safety: "Use supplied data. Real capture studies require trained supervision, permits, species-appropriate methods, and animal-welfare protocols.",
    warmup: { title: "Large is not dense", prompt: "Population X has 1,000 individuals over 100 km². Population Y has 300 individuals over 10 km². Which is larger, which is denser, and why are those different claims?", placeholder: "Calculate both densities and compare the meanings." },
    sections: [
      {
        label: "Population description",
        title: "Size, density, and distribution answer different questions",
        paragraphs: [
          "Population size, N, is the number of individuals in a defined population. Density divides N by area or volume, such as plants per square metre or plankton per litre. Distribution describes spatial pattern: clumped, uniform, or approximately random at a stated scale. A population can be large but low-density if spread over a broad range, or small but high-density in a restricted habitat. Every value needs a boundary, time, and unit.",
          "Clumping often reflects patchy resources, social behaviour, or dispersal. Uniform spacing may reflect territoriality or local competition. Random patterns require individuals to be positioned independently at the measured scale, which is uncommon in strongly structured habitats. Patterns can change with scale: trees may appear clumped within valleys but evenly spaced within a stand. A map and sampling design should match the scale of the claim."
        ]
      },
      {
        label: "Accounting identity",
        title: "Four processes change population size",
        paragraphs: [
          "Over an interval, population change can be written ΔN = births + immigration − deaths − emigration. For a closed population, migration terms are zero. The finite rate of increase can compare N at two times, while per-capita change divides by starting population size and time. Raw change is not enough for fair comparison: an increase of 100 is substantial for a population starting at 200 but small for one starting at 100,000.",
          "Rates must use consistent intervals. Ten births during one week cannot be compared directly with twenty births during one year. Researchers also distinguish recruitment—the addition of individuals to a counted stage—from birth. In plant or fisheries studies, many new organisms may die before reaching the survey stage. Define what counts as entry and exit so the equation matches the measurement."
        ],
        table: { caption: "Synthetic wetland frog population accounting", headers: ["Quantity over one year", "Count", "Effect on N"], rows: [["Starting population", "240", "Baseline"], ["Recruitment", "86", "+86"], ["Immigration", "18", "+18"], ["Deaths", "51", "−51"], ["Emigration", "23", "−23"], ["Ending population", "270", "Net +30"]] }
      },
      {
        label: "Estimating abundance",
        title: "Most populations must be sampled",
        paragraphs: [
          "Quadrats work well for stationary or slow-moving organisms. Researchers choose quadrat size and placement, count individuals or percent cover, and scale the estimate to habitat area. Random or stratified placement reduces site-selection bias. Transects reveal change along a gradient. Detectability matters: hidden seedlings, cryptic animals, or seasonal dormancy can make observed count lower than true abundance.",
          "Mark-recapture can estimate mobile populations. In the simplest Lincoln-Petersen model, N is approximately M times C divided by R, where M is marked in the first sample, C is total captured in the second, and R is marked recaptures. The estimate assumes a closed population, durable neutral marks, equal capture probability, accurate recognition, and enough mixing. Violating these assumptions can bias N upward or downward."
        ]
      },
      {
        label: "Evidence quality",
        title: "Uncertainty belongs beside the estimate",
        paragraphs: [
          "An estimate should report method, effort, timing, habitat coverage, and uncertainty. Repeating quadrats or capture sessions shows variation. Confidence intervals communicate a plausible range rather than false precision. A calculated N of 847.3 animals should not be reported as though a fraction of an animal was observed; rounding and an uncertainty interval are more honest.",
          "Sampling bias can mimic population change. A warmer survey day may increase activity and capture probability even when true abundance is unchanged. Improved equipment may detect more organisms. Before attributing a trend to births, deaths, or management, check whether boundaries, season, effort, observer, or detection method changed. Comparable methods across time are essential for a defensible trend."
        ]
      }
    ],
    conceptMap: { title: "Population measurement chain", description: "Define the population, sample with a suitable method, calculate a quantity with units, and evaluate uncertainty before explaining change.", nodes: [{ label: "Define", detail: "Boundary, species, stage, and time." }, { label: "Estimate", detail: "Census, quadrat, transect, or mark-recapture." }, { label: "Interpret", detail: "Units, uncertainty, bias, and biological process." }] },
    interaction: {
      title: "Population measures lab",
      intro: "The same landscape can produce different values depending on the quantity and sampling design.",
      prompt: "Choose a dataset and identify the valid calculation and most important limitation.",
      cases: [
        { id: "density", label: "Elk density", evidence: "180 elk are counted across a 2,500 km² study area.", explanation: "Density is 0.072 elk/km². The value needs the defined boundary and does not show whether elk are clumped within it." },
        { id: "change", label: "Wetland frogs", evidence: "N starts at 240; recruitment 86, immigration 18, deaths 51, and emigration 23.", explanation: "ΔN = +30 and ending N = 270. The positive change cannot be assigned to birth alone because all four terms contribute." },
        { id: "mark-recapture", label: "Minnow estimate", evidence: "M = 80 marked first, C = 100 caught second, and R = 20 marked recaptures.", explanation: "Estimated N = 400. Unequal capture probability or migration between samples would weaken the estimate." }
      ],
      staticFallback: "For each dataset, write the formula in words, include units, state the result at sensible precision, and identify one assumption or detection bias."
    },
    practiceSeeds: [
      { id: "density", cognitiveLevel: "remember-understand", prompt: "How is population density different from population size?", correct: "Density expresses individuals per unit area or volume; size is the total count within the boundary", distractors: ["Density is always larger than size", "Size includes only adults while density includes juveniles", "Density measures birth rate only"], rationale: "Density standardizes abundance by space, while size is N within a defined population.", misconceptionFeedback: ["The numerical relationship depends on area and units.", "Life-stage definitions may differ, but that is not the core distinction.", "Birth rate is a process of change, not density."] },
      { id: "accounting", cognitiveLevel: "apply", prompt: "A population starts at 500, with 60 births, 20 immigrants, 45 deaths, and 15 emigrants. What is ending N?", correct: "520", distractors: ["480", "500", "640"], rationale: "ΔN = 60 + 20 − 45 − 15 = +20, so ending N = 520.", misconceptionFeedback: ["This reverses the signs of gains and losses.", "Births and losses do not exactly cancel; net change is +20.", "Adding every term ignores deaths and emigration."] },
      { id: "sampling-bias", cognitiveLevel: "higher-mental-activity", prompt: "Counts rise after a new thermal camera is introduced. What is the strongest first response?", correct: "Assess whether detectability changed before concluding true abundance increased", distractors: ["Treat every added detection as a birth", "Discard the earlier data", "Conclude immigration is the only cause"], rationale: "A method change can alter observation probability and create an apparent trend without biological population change.", misconceptionFeedback: ["Detections are not equivalent to births.", "Earlier data may remain useful if method differences are calibrated.", "Several biological processes and measurement changes remain possible."] }
    ],
    artifact: { prompt: "Begin the population data lab with one density or population-accounting calculation and a critique of the sampling method.", evidenceRequirements: ["Formula, substitution, answer, and units", "A clearly defined population boundary and interval", "One sampling assumption, bias, and improvement"] },
    exit: { title: "Match number to meaning", prompt: "Compare population size, density, and change using one example, and explain how sampling bias could distort one quantity.", placeholder: "Use units, boundaries, time, and a specific source of bias." },
    glossaryTerms: ["population size", "population density", "distribution", "recruitment", "immigration", "emigration", "mark-recapture", "detectability"],
    sourceSummary: "Built from the Alberta Biology 20–30 Program of Studies, verified Unit D sources, Unit D notes pages 31–43, and corrected population-measure equations."
  },
  {
    id: "d-lesson-09",
    unitCode: "D",
    learningIntention: "I am learning to distinguish exponential and logistic growth and use carrying capacity as a dynamic evidence-based model.",
    successCriteria: ["I can interpret J-shaped and S-shaped growth without relying on shape alone.", "I can connect growth rate to population size, limiting factors, and carrying capacity.", "I can analyze overshoot, lag, and changing carrying capacity from data."],
    materials: "Calculator and the supplied synthetic population time series.",
    safety: "The data are synthetic instructional data. They are designed for model reasoning, not forecasts for a real managed population.",
    warmup: { title: "Can growth continue forever?", prompt: "If a population increases by 20% each year, why does the number added each year grow even though the percentage stays constant?", placeholder: "Use a starting population and two calculation steps." },
    sections: [
      {
        label: "Exponential model",
        title: "A constant per-capita rate creates accelerating change",
        paragraphs: [
          "Exponential growth occurs when the per-capita rate of increase remains positive and resources do not yet constrain growth strongly. In continuous form, change is proportional to rN: the same per-capita rate r produces a larger numerical increase when N is larger. A graph can be J-shaped because additions compound. Exponential growth may describe early colonization or recovery over a limited interval, but no finite environment supports it indefinitely.",
          "The intrinsic rate of increase reflects births and deaths under stated conditions, not a permanent species constant. Age structure, season, resource quality, and density affect realized growth. When using a discrete geometric model, the finite multiplier λ compares successive population sizes. Keep discrete and continuous parameters distinct and state the time step. A rate without time units is incomplete."
        ]
      },
      {
        label: "Logistic model",
        title: "Density dependence slows realized growth",
        paragraphs: [
          "The logistic model adds a limiting term, often written 1 − N/K. When N is small relative to K, growth can resemble exponential increase. As N approaches K, competition, disease, predation, or other density-dependent effects reduce net per-capita growth. The model predicts an S-shaped trajectory under stable conditions. Maximum total growth occurs at an intermediate N, not at K, because many reproducing individuals still have substantial resources.",
          "Carrying capacity, K, is the population size that a particular environment can sustain over time under stated conditions. It is not a fixed property engraved into a species. Food, water, habitat, climate, competitors, predators, disease, and human activity can raise or lower it. A population fluctuating around K does not stop reproducing; births plus immigration approximately balance deaths plus emigration over the interval."
        ],
        table: { caption: "Synthetic island herbivore time series", headers: ["Year", "Population N", "Change from prior year", "Interpretation"], rows: [["0", "40", "—", "Colonizing population"], ["1", "74", "+34", "Rapid growth"], ["2", "128", "+54", "Largest total increase"], ["3", "176", "+48", "Density effects strengthen"], ["4", "198", "+22", "Approaching current K"], ["5", "203", "+5", "Near balance"]] }
      },
      {
        label: "Departures",
        title: "Overshoot and time lag matter",
        paragraphs: [
          "If resource feedback is delayed, a population may overshoot current carrying capacity. Resource depletion can then produce a decline or crash. Overshoot is not a violation of ecology; it reveals that population response and environmental change operate on different time scales. Seasonal populations may repeatedly exceed a long-term average. A single peak should not be mistaken for sustainable K.",
          "Some limits are density-independent over the observed range, such as a sudden freeze or fire, although their effects may still interact with density and habitat. The distinction concerns whether effect strength changes with density, not whether the event is living or non-living. Drought can impose a broad density-independent shock while also intensifying density-dependent competition for remaining water. Real systems combine processes."
        ]
      },
      {
        label: "Model evaluation",
        title: "Fit the model, then inspect residuals and mechanism",
        paragraphs: [
          "To distinguish models, examine per-capita growth as well as curve shape. Under simple exponential growth, per-capita growth is roughly constant. Under logistic growth, it declines as N rises. Plotting change per individual against N can reveal density dependence even when the time series is noisy. Residuals—the differences between observed and predicted values—may show seasonality, lag, or changing K that the simple model misses.",
          "A good interpretation states the interval over which a model fits and why. “The population is logistic” is too absolute. Better: “From years 0–5, growth slows as N approaches about 200, consistent with density dependence under the model; additional years are needed to estimate variation in K.” Models organize evidence and predictions, but management decisions should include uncertainty and changing conditions."
        ]
      }
    ],
    conceptMap: { title: "Population growth controls", description: "Population size and per-capita rate interact with density-dependent limits and changing environmental capacity.", nodes: [{ label: "Potential", detail: "Positive per-capita growth can compound when N rises." }, { label: "Feedback", detail: "Density-dependent limits reduce realized growth." }, { label: "Capacity", detail: "K varies with resources, conditions, and other species." }] },
    interaction: {
      title: "Population growth simulator",
      intro: "Compare three time series that require different interpretations of r and K.",
      prompt: "Choose a scenario and identify the model feature supported by the evidence.",
      cases: [
        { id: "early-exponential", label: "New island colonist", evidence: "N changes 20, 31, 49, 77, 121 while per-capita growth stays similar.", explanation: "The limited interval is consistent with exponential growth, but the model should not be projected indefinitely." },
        { id: "logistic", label: "Resource-limited herbivore", evidence: "N rises rapidly, then additions shrink as the population fluctuates near 200.", explanation: "Declining per-capita growth with higher N supports density dependence and a current K near 200." },
        { id: "changing-k", label: "Habitat restoration", evidence: "After habitat area doubles, a former plateau near 200 shifts gradually toward 330.", explanation: "The carrying-capacity estimate changed with environmental conditions; K is not a permanent species constant." }
      ],
      staticFallback: "For each time series, calculate at least two changes, compare per-capita rates, identify evidence for density dependence, and limit projections to observed conditions."
    },
    practiceSeeds: [
      { id: "exponential", cognitiveLevel: "remember-understand", prompt: "Why does exponential growth accelerate when the per-capita rate stays constant?", correct: "The same rate acts on an increasing number of individuals", distractors: ["Carrying capacity rises automatically every year", "Every individual produces more offspring each year", "Deaths become mathematically impossible"], rationale: "Because total change is proportional to N, a constant positive per-capita rate yields larger additions as N increases.", misconceptionFeedback: ["K is a separate environmental parameter.", "Per-capita contribution can remain constant while total births increase.", "Deaths can occur; net per-capita change remains positive."] },
      { id: "carrying-capacity", cognitiveLevel: "apply", prompt: "Habitat restoration increases food and nesting sites. What is the most defensible prediction?", correct: "Carrying capacity may increase under the new conditions, but must be estimated from later evidence", distractors: ["K cannot change", "The population instantly becomes equal to the new K", "Exponential growth continues forever"], rationale: "K depends on environmental conditions, and population response can lag behind habitat change.", misconceptionFeedback: ["K is dynamic rather than a fixed species value.", "Demography takes time; N does not jump automatically.", "Finite resources eventually constrain growth."] },
      { id: "model-choice", cognitiveLevel: "higher-mental-activity", prompt: "Which evidence best distinguishes logistic slowing from a one-time weather shock?", correct: "Per-capita growth repeatedly declines as N rises across comparable conditions", distractors: ["One sudden decline follows a freeze", "The graph contains an S-shaped segment", "The population is large"], rationale: "Repeated density-linked decline directly supports density dependence; one shock or visual shape alone is weaker.", misconceptionFeedback: ["A freeze may be a density-independent shock.", "Curve shape can be mimicked by changing conditions or limited data.", "Large N alone does not establish the relationship between density and growth."] }
    ],
    artifact: { prompt: "Extend the population data lab by comparing exponential and logistic interpretations of a supplied time series.", evidenceRequirements: ["Calculated total and per-capita changes", "A model claim tied to specific years or N values", "A limitation involving lag, changing K, or another driver"] },
    exit: { title: "K is not a ceiling line", prompt: "Explain what carrying capacity means, why a population can overshoot it, and how evidence could show K changed.", placeholder: "Connect resources, density feedback, lag, and a time-series comparison." },
    glossaryTerms: ["exponential growth", "logistic growth", "intrinsic rate of increase", "carrying capacity", "density-dependent", "density-independent", "overshoot"],
    sourceSummary: "Built from the Alberta Biology 20–30 Program of Studies, verified Unit D sources, Unit D notes pages 38–49, and corrected population-growth models."
  },
  {
    id: "d-lesson-10",
    unitCode: "D",
    learningIntention: "I am learning to evaluate life-history evidence and build a defensible population-management recommendation.",
    successCriteria: ["I can treat r/K selection as a comparative life-history continuum rather than two rigid boxes.", "I can connect life-history traits to population response and uncertainty.", "I can weigh ecological evidence, values, risks, and monitoring in a management decision."],
    materials: "Life-history dataset, management option matrix, and the supplied synthetic wildlife case.",
    safety: "This is a decision simulation. Real wildlife management requires legal authority, community consultation, Indigenous rights and knowledge protocols, and species-specific field evidence.",
    warmup: { title: "Fast and slow are not better and worse", prompt: "Why is it misleading to call one reproductive strategy more advanced or more successful than another?", placeholder: "Relate success to environment, trade-offs, and relative reproductive contribution." },
    sections: [
      {
        label: "Life-history variation",
        title: "Traits occur along continua",
        paragraphs: [
          "Life-history traits include age at first reproduction, number and size of offspring, frequency of reproduction, parental investment, lifespan, dispersal, and survival. The historical r/K framework compares suites of traits favoured under different patterns of mortality and density dependence. High potential population increase may be associated with early reproduction and many small offspring; strong competition near carrying capacity may favour investment in survival or fewer offspring. Real species do not fit two perfect boxes.",
          "The same species can also show plasticity or population differences. An organism may mature earlier under high mortality or alter offspring investment with food availability. Trade-offs occur because energy used for growth, maintenance, defence, or one reproductive event cannot be used elsewhere. A defensible comparison uses measured traits and conditions instead of labelling a species simply “r-selected” or “K-selected” as though the label explains everything."
        ]
      },
      {
        label: "Management evidence",
        title: "Population response depends on life history",
        paragraphs: [
          "A long-lived species with late maturity and low reproductive output may recover slowly after added adult mortality. A short-lived species with many offspring may rebound quickly when conditions improve, yet fluctuate strongly and depend on habitat for recruitment. Management should identify which life stage most influences population growth. Protecting adult survival, nesting habitat, migration routes, or juvenile recruitment can have different effects.",
          "Population viability is not captured by N alone. Genetic diversity, sex or stage structure, connectivity, habitat quality, environmental variability, and catastrophic risk matter. A population near current K may still be vulnerable if habitat is shrinking or age structure is skewed. Conversely, a low count may be expected seasonally. Baseline, trend, and mechanism are all needed."
        ],
        table: { caption: "Synthetic management evidence matrix", headers: ["Evidence", "Option A: harvest increase", "Option B: habitat restoration", "Option C: no change"], rows: [["Adult survival", "Likely decreases", "May improve", "Current decline continues"], ["Juvenile habitat", "No direct gain", "Wetland area increases", "Remains limiting"], ["Uncertainty", "High at low N", "Lag before response", "Risk of delayed action"], ["Monitoring", "Mandatory quota checks", "Recruitment and habitat surveys", "Trend surveys only"]] }
      },
      {
        label: "Decision quality",
        title: "Separate evidence, values, and uncertainty",
        paragraphs: [
          "Science can estimate likely population effects and uncertainty, but management also involves values, rights, costs, livelihoods, welfare, and acceptable risk. A transparent decision states which parts are empirical and which are value judgments. Stakeholders may agree on population data yet differ on priorities. Consultation is not a substitute for evidence, and evidence is not a substitute for legitimate governance and rights.",
          "Indigenous Peoples have constitutionally protected rights and place-based knowledge systems that must not be reduced to a decorative quotation or extracted without protocol. When a management case involves Indigenous lands, species, or knowledge, use current Indigenous-led sources and appropriate relationships. If such authority is unavailable, keep the instructional case synthetic rather than inventing a perspective."
        ]
      },
      {
        label: "Adaptive management",
        title: "A recommendation includes monitoring and revision",
        paragraphs: [
          "Adaptive management treats action as a testable, monitored decision. A recommendation identifies the goal, option, predicted population response, indicators, timeline, thresholds, and response if evidence differs from prediction. For habitat restoration, monitor habitat quality and recruitment, not only adult abundance. For harvest, monitor effort and demographic structure as well as total count.",
          "Precaution is most important when harm could be serious or irreversible and evidence is uncertain. It does not mean never acting; delayed action also carries risk. Compare consequences of false reassurance and false alarm, identify reversible steps, and preserve future options. A high-quality brief makes uncertainty visible and specifies what new evidence would change the recommendation."
        ]
      }
    ],
    conceptMap: { title: "Management decision pathway", description: "Population and life-history evidence informs options, while values, rights, uncertainty, and monitoring shape a defensible decision.", nodes: [{ label: "Evidence", detail: "Trend, demography, habitat, genetics, and mechanism." }, { label: "Decision", detail: "Compare effects, rights, values, feasibility, and risk." }, { label: "Monitor", detail: "Set indicators, thresholds, and revision rules." }] },
    interaction: {
      title: "Management evidence matrix",
      intro: "A synthetic wetland bird population is declining. Compare actions by mechanism, delay, and uncertainty.",
      prompt: "Choose an option and evaluate what evidence would determine whether it is working.",
      cases: [
        { id: "restore", label: "Restore nesting wetland", evidence: "Juvenile habitat is limiting; restoration increases suitable area, but recruitment response may take three years.", explanation: "The mechanism matches the diagnosed limit. Monitor habitat use, nest success, and recruitment before expecting adult abundance to respond." },
        { id: "supplement", label: "Short-term captive supplementation", evidence: "Numbers rise immediately, but habitat and migration mortality remain unchanged.", explanation: "The action can increase N temporarily without fixing limiting processes; genetic, welfare, disease, and long-term feasibility need evaluation." },
        { id: "wait", label: "No action, continue monitoring", evidence: "Trend uncertainty is moderate, but adult survival has declined in four consecutive years and N is low.", explanation: "Waiting avoids intervention costs but risks irreversible loss. A decision should compare that risk with action uncertainty and set an explicit trigger." }
      ],
      staticFallback: "For each option, identify mechanism, expected delay, benefits, harms, uncertainty, rights or value considerations, indicators, and a revision threshold."
    },
    practiceSeeds: [
      { id: "continuum", cognitiveLevel: "remember-understand", prompt: "What is the most accurate use of the r/K life-history framework?", correct: "A comparative continuum of trait trade-offs under different ecological conditions", distractors: ["Two fixed categories that every species fits perfectly", "A ranking from inferior to superior species", "A replacement for population data"], rationale: "The framework is a simplified comparative model; traits vary continuously and context matters.", misconceptionFeedback: ["Real life histories show mixed and plastic traits.", "Life-history strategies are not value rankings.", "Management still requires measured population evidence."] },
      { id: "late-maturity", cognitiveLevel: "apply", prompt: "Why can added adult mortality be especially risky for a late-maturing, low-fecundity species?", correct: "Adults are replaced slowly, so population growth is sensitive to adult survival", distractors: ["The species has no carrying capacity", "Every juvenile survives", "Genetic drift cannot occur"], rationale: "Low recruitment and delayed maturity make each breeding adult’s survival more influential to population trajectory.", misconceptionFeedback: ["All populations experience environmental limits.", "Juvenile survival is usually less than one.", "Small populations may be especially vulnerable to drift."] },
      { id: "adaptive-plan", cognitiveLevel: "higher-mental-activity", prompt: "Which recommendation best demonstrates adaptive management?", correct: "Restore habitat, predict recruitment response, monitor defined indicators, and revise if thresholds are missed", distractors: ["Choose an action and never reconsider it", "Wait for complete certainty before measuring anything", "Report only the final adult count"], rationale: "Adaptive management links an action to explicit predictions, multiple indicators, thresholds, and revision.", misconceptionFeedback: ["A fixed plan cannot respond to new evidence.", "Complete certainty is unattainable and delay has consequences.", "Mechanism indicators can reveal success or failure before adult abundance changes."] }
    ],
    artifact: { prompt: "Write the wildlife-management brief with a recommendation, evidence chain, uncertainty, rights and values boundary, and monitoring plan.", evidenceRequirements: ["Population and life-history evidence tied to a limiting process", "A comparison of at least two options and consequences", "Indicators, timeline, threshold, and revision action"] },
    exit: { title: "Recommend and remain revisable", prompt: "Give a management recommendation for the synthetic case and state what evidence would make you revise it.", placeholder: "Include mechanism, uncertainty, consequence, indicator, and threshold." },
    glossaryTerms: ["life history", "r/K continuum", "trade-off", "population viability", "adaptive management", "precautionary approach"],
    sourceSummary: "Built from the Alberta Biology 20–30 Program of Studies, verified Unit D sources, Unit D notes pages 49–55, and current evidence-based management framing."
  },
  {
    id: "d-lesson-11",
    unitCode: "D",
    learningIntention: "I am learning to integrate population genetics, community interactions, growth models, and management evidence in an unfamiliar case.",
    successCriteria: ["I can select relevant evidence from different biological scales.", "I can build one causal explanation without confusing correlation, model expectation, and mechanism.", "I can evaluate alternatives and recommend a monitored next step."],
    materials: "Integrated evidence board, calculator, graphing tool, and completed Unit D artifacts.",
    safety: "The case and all quantitative values are synthetic instructional data. No real population decision should be made from this simplified exercise.",
    warmup: { title: "Choose the scale", prompt: "Sort these observations by scale: allele frequency, predator abundance, carrying capacity, and wetland restoration. How might they still connect?", placeholder: "Name each scale and sketch at least two causal links." },
    sections: [
      {
        label: "Integrated case",
        title: "The North Marsh rail population",
        paragraphs: [
          "A synthetic marsh bird population declines from 420 to 210 adults over six years as wetland area shrinks. A neighbouring population remains near 600. At one neutral genetic marker, expected and observed genotype frequencies are similar, but allelic richness declines in North Marsh. Juvenile recruitment falls before adult abundance. An introduced nest predator increases, and nesting vegetation becomes sparse after repeated low-water years.",
          "No single number explains the case. Declining allelic richness may follow a bottleneck or reduced gene flow, but the neutral marker does not show adaptive decline. Recruitment data point to a life-stage limit. Predator and habitat changes offer mechanisms, yet their effects may interact: sparse vegetation may increase nest exposure. The evidence must be organized by scale and timing before a management claim is made."
        ]
      },
      {
        label: "Quantitative synthesis",
        title: "Calculate first, then connect",
        paragraphs: [
          "A mark-recapture survey estimates N from M = 70, C = 84, and R = 28, giving N ≈ 210, consistent with the independent count. Density drops from 0.84 to 0.53 adults per hectare because occupied wetland also contracts. The smaller population and isolation increase vulnerability to drift. However, Hardy-Weinberg agreement at one marker does not mean genetic risk is absent; heterozygosity can persist temporarily after allele loss.",
          "A nest dataset shows 68% success in dense vegetation without predator signs, 39% in dense vegetation with predator signs, 42% in sparse vegetation without signs, and 17% when both occur. The pattern is consistent with independent and combined effects, but observational categories may differ in other ways. A factorial field design or carefully matched comparisons would strengthen causal inference."
        ],
        table: { caption: "Synthetic North Marsh evidence board", headers: ["Evidence layer", "Observation", "Bounded inference"], rows: [["Population", "N fell 420 to 210", "Strong decline; cause unresolved"], ["Genetics", "Allelic richness fell; one marker near H-W expectation", "Consistent with small-population loss; equilibrium does not remove risk"], ["Community", "Predator signs predict lower nest success", "Predation is plausible; confounds remain"], ["Habitat", "Sparse vegetation and wetland loss precede recruitment decline", "Habitat is a plausible limiting pathway"]] }
      },
      {
        label: "Alternative models",
        title: "Compare explanations that make different predictions",
        paragraphs: [
          "A predator-first explanation predicts nest success should improve rapidly where predator access is reduced even before vegetation recovers. A habitat-first explanation predicts restored water and vegetation should improve nesting and recruitment, perhaps with or without predator control. A combined explanation predicts the largest response when both pressures are addressed. Monitoring should test these contrasting predictions rather than merely recording whether total N changes.",
          "Genetic rescue could increase diversity, but moving individuals without improving habitat may not improve long-term recruitment. It can also introduce disease, outbreeding concerns, or disruption to local adaptation, so it requires specialized evidence and governance. The integrated model places genetic management after diagnosis of demographic and habitat mechanisms, not as an automatic response to a small population."
        ]
      },
      {
        label: "Decision and reflection",
        title: "Build a monitored, reversible recommendation",
        paragraphs: [
          "A defensible first recommendation may restore wetland hydrology and nesting vegetation while piloting targeted, legally authorized predator-exclusion measures at matched plots. Monitor water level, vegetation cover, predator evidence, nest success, juvenile recruitment, adult survival, and allele diversity. Predefine a three-year recruitment threshold and an earlier welfare or unintended-impact stop rule. The action is tied to evidence and remains revisable.",
          "Finish by revisiting the Unit D systems map. Population genetics describes the gene pool; community ecology describes interactions; population dynamics describes abundance and rates; management connects evidence with decisions and values. Integration does not mean forcing every variable into one story. It means selecting relevant links, preserving uncertainty, and identifying observations that could prove the current explanation incomplete."
        ]
      }
    ],
    conceptMap: { title: "Integrated population case model", description: "Habitat and interaction pressures affect demography; population size and connectivity affect genetic variation; monitoring tests management predictions.", nodes: [{ label: "Pressure", detail: "Habitat loss, predation, and isolation." }, { label: "Response", detail: "Recruitment, abundance, density, and gene-pool change." }, { label: "Decision", detail: "Mechanism-matched action with indicators and revision." }] },
    interaction: {
      title: "Integrated population case",
      intro: "Use one evidence board to compare three management hypotheses.",
      prompt: "Choose a hypothesis and inspect the prediction that would distinguish it from the alternatives.",
      cases: [
        { id: "predator", label: "Predator-first hypothesis", evidence: "Nest success rises quickly in exclusion plots, including sparse vegetation, while control plots remain low.", explanation: "This pattern supports predation as an immediate limiting mechanism, though habitat may still affect longer-term capacity." },
        { id: "habitat", label: "Habitat-first hypothesis", evidence: "Recruitment tracks water and vegetation recovery; predator signs remain similar across restored and unrestored plots.", explanation: "This pattern supports habitat quality as the stronger driver under the observed conditions." },
        { id: "combined", label: "Combined-pressure hypothesis", evidence: "Either action alone yields modest gains; matched plots receiving both show the largest recruitment increase.", explanation: "An interaction between habitat cover and predation is supported when the combined effect exceeds either single pathway." }
      ],
      staticFallback: "For each hypothesis, list the predicted short-term indicator, long-term population response, alternative explanation, and revision threshold."
    },
    practiceSeeds: [
      { id: "equilibrium-risk", cognitiveLevel: "apply", prompt: "One neutral marker matches Hardy-Weinberg expectations while allelic richness declines. Which interpretation is strongest?", correct: "Equilibrium at one marker does not rule out diversity loss or demographic risk", distractors: ["The population has no genetic concern", "Natural selection is impossible", "The marker proves population size is stable"], rationale: "Hardy-Weinberg fit at one locus addresses genotype proportions in one sample, not richness, all loci, or demographic trend.", misconceptionFeedback: ["Alleles can be lost while remaining genotypes approximate expected proportions.", "Selection may act at other loci or traits.", "Marker proportions do not measure N directly."] },
      { id: "factorial-evidence", cognitiveLevel: "higher-mental-activity", prompt: "Why compare habitat restoration and predator reduction alone and together?", correct: "The design can estimate separate and interacting effects on recruitment", distractors: ["It guarantees every confound is removed", "It makes monitoring unnecessary", "It proves genetics is irrelevant"], rationale: "A factorial comparison tests whether each pressure contributes and whether their combined effect differs from single actions.", misconceptionFeedback: ["Randomization, replication, and field conditions still matter.", "Monitoring provides the outcome evidence.", "Genetic evidence remains relevant but addresses a different scale."] },
      { id: "management-sequence", cognitiveLevel: "higher-mental-activity", prompt: "Which recommendation best follows the integrated evidence?", correct: "Pilot mechanism-matched habitat and predator actions with demographic, ecological, and genetic monitoring", distractors: ["Move individuals immediately without addressing recruitment limits", "Declare one cause from the population decline alone", "Take no action until every uncertainty disappears"], rationale: "The recommendation tests plausible mechanisms, addresses immediate recruitment limits, and preserves revision through multiple indicators.", misconceptionFeedback: ["Translocation without habitat diagnosis may add individuals without improving persistence.", "A trend identifies the problem but not a unique cause.", "Complete certainty is unrealistic and delay can increase risk."] }
    ],
    artifact: { prompt: "Complete the integrated Unit D case with calculations, a multiscale evidence chain, alternatives, and an adaptive recommendation.", evidenceRequirements: ["At least one verified population or genetic calculation", "A causal model linking evidence across two or more scales", "A recommendation with indicators, threshold, and revision rule"] },
    exit: { title: "Integrate without overclaiming", prompt: "Write the strongest current explanation for the North Marsh decline, then identify the observation most likely to make you revise it.", placeholder: "Use quantified evidence, mechanism, uncertainty, alternative, and next test." },
    glossaryTerms: ["integrated evidence", "limiting factor", "factorial design", "genetic diversity", "recruitment", "adaptive recommendation"],
    sourceSummary: "Built from all verified Unit D source selections, the Alberta Unit D outcomes, locally supplied notes, and rights-safe population genetics and ecology cross-checks. All case data are synthetic instructional data."
  }
];
