/** Browser-safe calculation owner for B/C/D models and independent authored-key checks. */
function finite(value: number, label: string) {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
  return value;
}
function nonnegative(value: number, label: string) {
  finite(value, label);
  if (value < 0) throw new Error(`${label} cannot be negative`);
  return value;
}
function count(value: number, label: string) {
  nonnegative(value, label);
  if (!Number.isSafeInteger(value)) throw new Error(`${label} must be a whole count`);
  return value;
}
export function alleleFrequencies(AA: number, Aa: number, aa: number) {
  [AA, Aa, aa].forEach((v, i) => count(v, ["AA", "Aa", "aa"][i]));
  const individuals = AA + Aa + aa;
  if (!Number.isSafeInteger(2 * individuals) || individuals === 0) throw new Error("A positive safe diploid sample is required");
  const p = (2 * AA + Aa) / (2 * individuals), q = (2 * aa + Aa) / (2 * individuals);
  return { individuals, alleleCopies: 2 * individuals, p, q, observed: [AA / individuals, Aa / individuals, aa / individuals], expectedUnderEquilibrium: [p * p, 2 * p * q, q * q] };
}
export function equilibriumFromRecessive(frequency: number) {
  finite(frequency, "Recessive frequency");
  if (frequency < 0 || frequency > 1) throw new Error("Frequency must be between zero and one");
  const q = Math.sqrt(frequency), p = 1 - q;
  return { p, q, AA: p * p, Aa: 2 * p * q, aa: frequency, assumptionsRequired: true as const };
}
export function demographicChange(initial: number, births: number, immigrants: number, deaths: number, emigrants: number, elapsed: number) {
  [initial, births, immigrants, deaths, emigrants].forEach((v, i) => count(v, ["Initial count", "Births", "Immigrants", "Deaths", "Emigrants"][i]));
  finite(elapsed, "Elapsed time");
  if (initial === 0 || elapsed <= 0) throw new Error("Initial count and elapsed time must be positive");
  const change = births + immigrants - deaths - emigrants, final = initial + change;
  if (!Number.isSafeInteger(final) || final < 0) throw new Error("Population balance is impossible or unsafe");
  return { change, final, absolutePerTime: change / elapsed, perInitialIndividualOverInterval: change / initial, averagePerInitialIndividualPerTime: change / initial / elapsed };
}
export function quadratEstimate(counts: number[], quadratArea: number, totalArea: number) {
  counts.forEach((v) => count(v, "Quadrat count"));
  if (!counts.length || finite(quadratArea, "Quadrat area") <= 0 || finite(totalArea, "Total area") < counts.length * quadratArea) throw new Error("Supply non-overlapping positive-area samples within the study area");
  const density = counts.reduce((a, b) => a + b, 0) / (counts.length * quadratArea);
  return { sampledArea: counts.length * quadratArea, density, estimatedIndividuals: density * totalArea };
}
export function discreteGrowth(initial: number, proportionalRate: number, intervals: number) {
  nonnegative(initial, "Initial population"); finite(proportionalRate, "Rate"); count(intervals, "Intervals");
  if (proportionalRate < -1) throw new Error("A proportional decline cannot exceed the population per interval");
  const result = initial * (1 + proportionalRate) ** intervals;
  return finite(result, "Model result");
}
export function recombinationFrequency(recombinants: number, total: number) {
  count(recombinants, "Recombinants"); count(total, "Total");
  if (!total || recombinants > total) throw new Error("Recombinant count must be within a positive sample");
  const percent = 100 * recombinants / total;
  // A sampled proportion can exceed 50%; report it rather than silently cap or call it a map distance.
  return { observedPercent: percent, shortDistanceEstimate: percent < 50 ? percent : null, interpretation: percent >= 50 ? "Check class assignment and sampling; two-point data do not support a distance above 50 map units." : "Conditional short-distance estimate; hidden multiple crossovers can reduce observed recombination." };
}
export function stageCounts(diploidNumber: number, stage: "G1" | "after-S" | "after-meiosis-I" | "after-meiosis-II") {
  count(diploidNumber, "Diploid number");
  if (!diploidNumber || diploidNumber % 2) throw new Error("Use a positive even diploid number for this paired-chromosome model");
  if (stage === "G1") return { chromosomes: diploidNumber, chromatids: diploidNumber, sets: 2 };
  if (stage === "after-S") return { chromosomes: diploidNumber, chromatids: 2 * diploidNumber, sets: 2 };
  if (stage === "after-meiosis-I") return { chromosomes: diploidNumber / 2, chromatids: diploidNumber, sets: 1 };
  if (stage === "after-meiosis-II") return { chromosomes: diploidNumber / 2, chromatids: diploidNumber / 2, sets: 1 };
  throw new Error("Unknown stage");
}
export function monohybridCross(first: string, second: string) {
  if (!/^[Aa]{2}$/.test(first) || !/^[Aa]{2}$/.test(second)) throw new Error("Use AA, Aa, aA or aa for the one-locus model");
  const probabilities = { AA: 0, Aa: 0, aa: 0 };
  for (const a of first) for (const b of second) {
    const genotype = [a, b].sort().join("") as keyof typeof probabilities;
    probabilities[genotype] += 0.25;
  }
  return probabilities;
}
export function DNA(sequence: string) {
  const normalized = sequence.replace(/\s/g, "").toUpperCase();
  if (!normalized || !/^[ACGT]+$/.test(normalized)) throw new Error("Enter DNA bases A, C, G and T; direction labels belong outside the sequence");
  return normalized;
}
export function complementDNA(sequence: string, reverse = false) {
  const bases: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };
  const result = [...DNA(sequence)].map(base => bases[base]);
  return (reverse ? result.reverse() : result).join("");
}
export function transcribeDNA(sequence: string, suppliedStrand: "coding-5-to-3" | "template-3-to-5" | "template-5-to-3") {
  if (suppliedStrand === "coding-5-to-3") return DNA(sequence).replace(/T/g, "U");
  if (suppliedStrand === "template-3-to-5") return complementDNA(sequence).replace(/T/g, "U");
  if (suppliedStrand === "template-5-to-3") return complementDNA(sequence, true).replace(/T/g, "U");
  throw new Error("An explicit strand and direction are required");
}
const aminoAcids: Record<string, string> = {};
for (const [name, codons] of Object.entries({ Phe: "UUU UUC", Leu: "UUA UUG CUU CUC CUA CUG", Ile: "AUU AUC AUA", Met: "AUG", Val: "GUU GUC GUA GUG", Ser: "UCU UCC UCA UCG AGU AGC", Pro: "CCU CCC CCA CCG", Thr: "ACU ACC ACA ACG", Ala: "GCU GCC GCA GCG", Tyr: "UAU UAC", Stop: "UAA UAG UGA", His: "CAU CAC", Gln: "CAA CAG", Asn: "AAU AAC", Lys: "AAA AAG", Asp: "GAU GAC", Glu: "GAA GAG", Cys: "UGU UGC", Trp: "UGG", Arg: "CGU CGC CGA CGG AGA AGG", Gly: "GGU GGC GGA GGG" })) {
  for (const codon of codons.split(" ")) aminoAcids[codon] = name;
}
/** Translate a user-specified frame. Do not invent an initiation site or translate beyond a stop. */
export function translateRNA(sequence: string, frame: 0 | 1 | 2 = 0) {
  const rna = sequence.replace(/\s/g, "").toUpperCase();
  if (!rna || !/^[ACGU]+$/.test(rna) || ![0, 1, 2].includes(frame)) throw new Error("Use RNA bases and frame 0, 1 or 2");
  const peptide: string[] = [], codons: string[] = [];
  let stopIndex: number | null = null;
  for (let i = frame; i + 2 < rna.length; i += 3) {
    const codon = rna.slice(i, i + 3); codons.push(codon);
    if (aminoAcids[codon] === "Stop") { stopIndex = i; break; }
    peptide.push(aminoAcids[codon]);
  }
  return { peptide, codons, stopIndex, startsWithAUG: rna.slice(frame, frame + 3) === "AUG", trailingBases: stopIndex === null ? rna.slice(frame + 3 * codons.length) : "", interpretation: "Translation in the explicitly supplied frame; actual initiation and expression need biological context." };
}
