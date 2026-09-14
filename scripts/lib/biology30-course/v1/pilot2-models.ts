import { alleleFrequencies, demographicChange, monohybridCross, stageCounts, transcribeDNA, translateRNA } from "./pilot2-science.js";

/** Data and calculation contract shared by the browser and authored-output audit. */
export type TopicModel = {
  id: string; modelVersion: 1; options: string[];
  cases: { value: string; label: string; parameters: Record<string, string | number> }[];
  series?: { columns: string[]; rows: number[][] };
};
export type ModelOutput = {
  modelId: string; modelVersion: 1; choice: string; title: string;
  columns: string[]; rows: (string | number)[][];
  explanation: string; limitation: string;
  visual: "pathway-observations" | "separate-line-panels" | "paired-proportions" | "chromosome-stages" | "punnett-square" | "aligned-sequences" | "observed-expected-bars" | "population-balance" | "replicate-comparison";
  // Unrounded values are used for diagrams and reconstruction. Formatting is a
  // presentation concern and must never replace the stored observation values.
  values: Record<string, unknown>;
};

export function runBiology30TopicModel(model: TopicModel, choice: string): ModelOutput {
  if (model.modelVersion !== 1 || !model.options.includes(choice)) throw new Error("Unknown Biology model version or option");
  if (new Set(model.options).size !== model.options.length || model.cases.length !== model.options.length
    || model.options.some(option => model.cases.filter(entry => entry.value === option).length !== 1)) throw new Error("Biology model case inventory drift");
  const selected = model.cases.find(entry => entry.value === choice)!;
  const parameters = selected.parameters;
  const number = (key: string) => {
    const value = parameters[key];
    if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid model number: ${key}`);
    return value;
  };
  const text = (key: string) => {
    const value = parameters[key];
    if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid model text: ${key}`);
    return value;
  };
  const result = (output: Omit<ModelOutput, "modelId" | "modelVersion" | "choice" | "title">): ModelOutput =>
    ({ modelId: model.id, modelVersion: 1, choice, title: selected.label, ...output });
  switch (model.id) {
    case "a-model-closed-system": {
      const production=number('production'),consumption=number('consumption');
      if(production<0||consumption<0)throw new Error('Gas model rates cannot be negative');
      const oxygenChange=production-consumption;
      return result({columns:['Account','Source','Sink','Net change'],rows:[['Oxygen',production,consumption,oxygenChange],['Carbon dioxide (simplified coupling)',consumption,production,-oxygenChange]],explanation:'Net change equals source minus sink over the same interval. Reduced production can reverse the sign even while oxygen is still being produced.',limitation:'Illustrative arbitrary gas units, with equal and opposite CO₂ coupling assumed. This is not a complete chemical mechanism, a real sealed-ecosystem measurement or a guarantee of indefinite balance.',visual:'pathway-observations',values:{production,consumption,oxygenChange}});
    }
    case "b-model-signal-pathway": {
      const keys = ["germCells", "support", "LH", "duct"];
      const observations = keys.map(text);
      const labels = ["Developing germ cells", "Sertoli support", "LH signal", "Duct passage"];
      const interpretation: Record<string, string> = {
        "support-defect": "Germ cells are absent with disrupted support despite a present LH signal and an open duct. Investigate support and production before attributing the finding to an obstruction.",
        "signal-defect": "Reduced germ cells accompany a reduced LH signal while support is recorded as present and the duct is open. This is consistent with an upstream signal problem; it does not uniquely identify a cause.",
        "duct-obstruction": "Germ cells, support and LH are recorded as present while the duct is blocked. Reduced delivery can therefore occur even when the observed production pathway is present."
      };
      if (!interpretation[choice]) throw new Error("Unknown pathway case");
      return result({ columns: ["Observation", "Reference", `Case ${text("case")}`], rows: labels.map((label, i) => [label, i === 3 ? "open" : "present", observations[i]]),
        explanation: interpretation[choice], limitation: "Fictional observations do not diagnose a person or establish fertility.", visual: "pathway-observations", values: { observations } });
    }
    case "b-model-cycle-sequence": {
      const start = number("start"), end = number("end");
      const series = model.series;
      if (!series || series.columns.length !== 5 || start >= end || series.rows.some((row, i) => row.length !== 5 || row.some(value => !Number.isFinite(value)) || (i > 0 && row[0] <= series.rows[i - 1][0]))) throw new Error("Invalid cycle series");
      const rows = series.rows.filter(row => row[0] >= start && row[0] <= end).map(row => [...row]);
      if (rows.length < 2 || rows[0][0] !== start || rows.at(-1)![0] !== end) throw new Error("Cycle interval lacks its endpoints");
      const differences = rows[0].slice(1).map((initial, i) => rows.at(-1)![i + 1] - initial);
      return result({ columns: [...series.columns], rows, explanation: "Read each hormone on its own relative scale. Connect the sampled changes in time: estrogen rises before the highest sampled LH point; the later progesterone rise is consistent with luteal support.",
        limitation: "A sparse illustrative cycle cannot date an individual's ovulation. Indices of different hormones are not comparable molar concentrations.", visual: "separate-line-panels", values: { differences, start, end, separateHormoneScales: true } });
    }
    case "b-model-development-timing": {
      const control = number("control"), exposed = number("exposed"), n = number("samplesPerGroup");
      if (![control, exposed, n].every(Number.isSafeInteger) || n <= 0 || Math.min(control, exposed) < 0 || Math.max(control, exposed) > n) throw new Error("Invalid development counts");
      const controlProportion = control / n, exposedProportion = exposed / n;
      return result({ columns: ["Group", "Marker M present", "Samples", "Proportion"], rows: [["No agent", control, n, controlProportion], ["Agent X", exposed, n, exposedProportion]],
        explanation: "Subtract the control proportion from the exposed proportion within this stage. Compare that difference with the other stage before claiming a constant effect.",
        limitation: "Synthetic non-human cell-model data concern marker M, not a human birth outcome or a personal risk estimate.", visual: "paired-proportions", values: { difference: exposedProportion - controlProportion } });
    }
    case "c-model-chromosome-counts": {
      const stages = ["G1", "after-S", "after-meiosis-I", "after-meiosis-II"] as const;
      const counts = stages.map(stage => stageCounts(number("diploid"), stage));
      return result({ columns: ["Stage (per cell)", "Chromosomes", "DNA molecules", "Chromosome sets"], rows: stages.map((stage, i) => [stage, counts[i].chromosomes, counts[i].chromatids, counts[i].sets]),
        explanation: "S phase copies DNA without adding chromosome sets. Meiosis I separates homologues; meiosis II separates sister chromatids. The last two rows describe each resulting daughter cell after division.",
        limitation: "A paired diploid model with successful segregation. An undivided anaphase cell and one daughter cell have different counting boundaries.", visual: "chromosome-stages", values: { diploid: number("diploid"), stages: [...stages], counts } });
    }
    case "c-model-inheritance-cross": {
      const first = text("parent1"), second = text("parent2"), probabilities = monohybridCross(first, second);
      return result({ columns: ["Genotype", "Probability"], rows: Object.entries(probabilities),
        explanation: "Combine one allele from each parent's gamete. Repeated rows or columns represent repeated allele probabilities, not different allele types.",
        limitation: "Equal segregation and fertilization probabilities at one autosomal locus. Complete dominance applies only when converting these genotypes to the stated simple phenotype model.", visual: "punnett-square", values: { first, second, probabilities, dominantPhenotype: probabilities.AA + probabilities.Aa, recessivePhenotype: probabilities.aa } });
    }
    case "c-model-sequence-expression": {
      const coding = text("coding5to3"), rna = transcribeDNA(coding, "coding-5-to-3"), translation = translateRNA(rna, 0);
      return result({ columns: ["Representation", "Sequence or outcome"], rows: [["Coding DNA, 5′ → 3′", coding], ["RNA, 5′ → 3′", rna], ["Codons in supplied frame", translation.codons.join(" ")], ["Peptide, N → C", translation.peptide.join("–")], ["Stop in supplied excerpt", translation.stopIndex === null ? "not present" : `yes, RNA base ${translation.stopIndex + 1}`], ["Trailing incomplete bases", translation.trailingBases || "none"]],
        explanation: "Read from the first base in the stated frame. A synonymous substitution can preserve this peptide; a one-base insertion shifts later codon boundaries.",
        limitation: "A short coding excerpt does not establish whole-gene expression or protein function. A stop is not an amino acid; an incomplete codon is not translated.", visual: "aligned-sequences", values: { coding, rna, ...translation } });
    }
    case "d-model-gene-pool": {
      const counts = [number("AA"), number("Aa"), number("aa")];
      const frequencies = alleleFrequencies(counts[0], counts[1], counts[2]);
      return result({ columns: ["Genotype", "Observed count", "Observed frequency", "Expected frequency under equilibrium"], rows: ["AA", "Aa", "aa"].map((genotype, i) => [genotype, counts[i], frequencies.observed[i], frequencies.expectedUnderEquilibrium[i]]),
        explanation: "Calculate allele frequencies from all observed genotypes using 2N as the denominator. Then calculate p², 2pq and q² as conditional expectations; they are separate from observed frequencies.",
        limitation: "Agreement at one time does not prove all equilibrium assumptions. A frequency change alone does not identify selection, movement or sampling as its cause.", visual: "observed-expected-bars", values: frequencies });
    }
    case "d-model-population-balance": {
      const initial = number("initial"), days = number("days"), area = number("areaM2");
      if (area <= 0) throw new Error("Model area must be positive");
      const balance = demographicChange(initial, number("births"), number("immigration"), number("deaths"), number("emigration"), days);
      return result({ columns: ["Quantity", "Value", "Unit or interval"], rows: [["Initial population", initial, "individuals"], ["Births", number("births"), `individuals over ${days} days`], ["Immigration", number("immigration"), `individuals over ${days} days`], ["Deaths", number("deaths"), `individuals over ${days} days`], ["Emigration", number("emigration"), `individuals over ${days} days`], ["Net change", balance.change, "individuals"], ["Final population", balance.final, "individuals"], ["Final density", balance.final / area, "individuals/m²"], ["Absolute growth rate", balance.absolutePerTime, "individuals/day"], ["Per initial individual", balance.perInitialIndividualOverInterval, `over ${days} days`], ["Average per initial individual per day", balance.averagePerInitialIndividualPerTime, "day⁻¹"]],
        explanation: "Add births and immigration; subtract deaths and emigration. Keep the initial population, elapsed time and area as separate denominators for different questions.",
        limitation: "This whole-population scenario is separate from the quadrat estimate. Two time points do not establish an exponential or logistic growth curve.", visual: "population-balance", values: { ...balance, initial, days, area, initialDensity: initial / area, finalDensity: balance.final / area } });
    }
    case "d-model-competition": {
      const a = number("A"), b = number("B"), first = number("replicate1"), second = number("replicate2"), days = number("days");
      if (![a, b].every(Number.isSafeInteger) || a <= 0 || b < 0 || Math.min(first, second) < 0 || days <= 0) throw new Error("Invalid competition treatment");
      const mean = (first + second) / 2;
      return result({ columns: ["Replicate", "Mean dry mass per focal A plant (g/A)"], rows: [[1, first], [2, second], ["Mean of replicates", mean]],
        explanation: "Compare 5 A with 10 A to examine within-species density. Compare 10 A with 5 A + 5 B at equal total density to examine composition, while noting the change in focal A density.",
        limitation: "Two synthetic replicate means do not establish statistical significance or identify a limiting resource. Plant mass is not a population growth rate.", visual: "replicate-comparison", values: { a, b, totalDensityPerPot: a + b, days, first, second, mean } });
    }
    default: throw new Error(`Unknown Biology model operation: ${model.id}`);
  }
}
