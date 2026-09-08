import {
  BIOLOGY30_UNIT_CURRICULA,
  type Biology30ProductionUnitCode
} from "./curriculum.js";

export type Biology30NotesSelection = {
  sourceId: string;
  archivePath: string;
  sha256: string;
  pages: number[];
};

export type Biology30LessonBlueprint = {
  id: string;
  unitCode: Biology30ProductionUnitCode;
  moduleId: string;
  order: number;
  title: string;
  inquiry: string;
  requiredMinutes: number;
  optionalMinutes: number;
  outcomeIds: string[];
  classItemIds: string[];
  systemItemIds: string[];
  notes: Biology30NotesSelection[];
  artifactIds: string[];
  interactionKind: string;
};

export type Biology30ModuleBlueprint = {
  id: string;
  unitCode: Biology30ProductionUnitCode;
  title: string;
  lessonIds: string[];
};

export type Biology30ArtifactBlueprint = {
  id: string;
  unitCode: Biology30ProductionUnitCode;
  title: string;
  lessonIds: string[];
  outcomeIds: string[];
};

export const BIOLOGY30_NOTE_SOURCES = {
  B: {
    sourceId: "unit-b-notes",
    archivePath: "Unit B Reproduction and Development Notes (1).pdf",
    sha256: "109d11f735585be7104515afb3253fe9d31d1ae87704a893799e09864149549a",
    pageCount: 75
  },
  C1: {
    sourceId: "unit-c-cell-division-notes",
    archivePath: "Unit C Part A Cell Division Notes.pdf",
    sha256: "ca13d544f10ede910f97fedc4dccaf8c41298143968ca8f17e8ebcb754c6c6f5",
    pageCount: 79
  },
  C2: {
    sourceId: "unit-c-mendelian-genetics-notes",
    archivePath: "Unit C Part B Mendelian Genetics  Student Copy.pdf",
    sha256: "ac559697872a6619fe0d7a6ebe9f665e26b7ebf54e8381925ec36e3e7e6a53aa",
    pageCount: 114
  },
  C3: {
    sourceId: "unit-c-molecular-genetics-notes",
    archivePath: "Unit C Part C Molecular Genetics Student Copy.pdf",
    sha256: "a8a2fa43c1bb797c3d2286e5181c7fb18120ead7933ef139f8e766d836cedad7",
    pageCount: 59
  },
  D: {
    sourceId: "unit-d-population-notes",
    archivePath: "Unit D Population Dynamics Student Notes.pdf",
    sha256: "08ff6e3a4d59f3359413056a29226a15062d8ff9c6b17cf6a37a427002e74def",
    pageCount: 68
  }
} as const;

function pages(start: number, end = start) {
  return Array.from({ length: end - start + 1 }, (_value, index) => start + index);
}

function note(source: (typeof BIOLOGY30_NOTE_SOURCES)[keyof typeof BIOLOGY30_NOTE_SOURCES], start: number, end = start): Biology30NotesSelection {
  const { pageCount: _pageCount, ...selectionSource } = source;
  return { ...selectionSource, pages: pages(start, end) };
}

function lesson(input: Biology30LessonBlueprint) {
  return input;
}

const UNIT_B_LESSONS: Biology30LessonBlueprint[] = [
  lesson({ id: "b-lesson-01", unitCode: "B", moduleId: "b-module-1", order: 1, title: "Reproduction as a Control System", inquiry: "How can one coordinated system preserve continuity while creating variation?", requiredMinutes: 75, optionalMinutes: 15, outcomeIds: ["B1.1sts", "B1.1s"], classItemIds: ["1498085"], systemItemIds: ["2367", "2368"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 2, 6)], artifactIds: ["b-regulation-map"], interactionKind: "reproductive-system-overview" }),
  lesson({ id: "b-lesson-02", unitCode: "B", moduleId: "b-module-1", order: 2, title: "Male Reproductive Anatomy and Spermatogenesis", inquiry: "How does structure support sperm production, maturation, and delivery?", requiredMinutes: 85, optionalMinutes: 15, outcomeIds: ["B1.2k", "B1.3k", "B1.2s"], classItemIds: ["1498148", "1498149"], systemItemIds: ["2374", "2384"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 7, 20)], artifactIds: ["b-anatomy-evidence"], interactionKind: "male-reproductive-pathway" }),
  lesson({ id: "b-lesson-03", unitCode: "B", moduleId: "b-module-1", order: 3, title: "Female Reproductive Anatomy and Oogenesis", inquiry: "How do follicles, hormones, and reproductive structures coordinate egg development?", requiredMinutes: 85, optionalMinutes: 15, outcomeIds: ["B1.1k", "B1.3k", "B1.2s"], classItemIds: ["1498150"], systemItemIds: ["2379", "2384"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 21, 27)], artifactIds: ["b-anatomy-evidence"], interactionKind: "female-reproductive-pathway" }),
  lesson({ id: "b-lesson-04", unitCode: "B", moduleId: "b-module-1", order: 4, title: "Chromosomes, Hormones, and Sexual Development", inquiry: "How can chromosomes and hormone signals influence reproductive development?", requiredMinutes: 80, optionalMinutes: 15, outcomeIds: ["B1.4k", "B1.3s"], classItemIds: ["1498150"], systemItemIds: ["2390"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 66, 68)], artifactIds: ["b-regulation-map"], interactionKind: "development-evidence-model" }),
  lesson({ id: "b-lesson-05", unitCode: "B", moduleId: "b-module-2", order: 5, title: "Reproductive Hormones and Feedback", inquiry: "How do GnRH, FSH, LH, and gonadal hormones coordinate reproductive function?", requiredMinutes: 95, optionalMinutes: 20, outcomeIds: ["B2.1k", "B2.3k", "B2.1sts"], classItemIds: ["1498149", "1498151"], systemItemIds: ["2400", "2405"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 16, 20), note(BIOLOGY30_NOTE_SOURCES.B, 27, 28)], artifactIds: ["b-regulation-map"], interactionKind: "reproductive-feedback-model" }),
  lesson({ id: "b-lesson-06", unitCode: "B", moduleId: "b-module-2", order: 6, title: "Menstrual and Ovarian Cycle Data Lab", inquiry: "What can changing hormone concentrations reveal about events in the cycle?", requiredMinutes: 100, optionalMinutes: 20, outcomeIds: ["B2.2k", "B2.1s", "B2.2s", "B2.3s", "B2.4s"], classItemIds: ["1498151"], systemItemIds: ["2410"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 28, 35)], artifactIds: ["b-cycle-data-lab"], interactionKind: "cycle-hormone-graph" }),
  lesson({ id: "b-lesson-07", unitCode: "B", moduleId: "b-module-2", order: 7, title: "Fertility, STIs, and Reproductive Health", inquiry: "How should biological evidence guide decisions about fertility and prevention?", requiredMinutes: 85, optionalMinutes: 15, outcomeIds: ["B1.5k", "B1.1sts", "B1.1s", "B1.3s", "B1.4s", "B2.2sts"], classItemIds: ["1498145"], systemItemIds: ["2395", "2415"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 65, 65)], artifactIds: ["b-fertility-evidence-brief"], interactionKind: "fertility-evidence-board" }),
  lesson({ id: "b-lesson-08", unitCode: "B", moduleId: "b-module-3", order: 8, title: "Fertilization and Implantation", inquiry: "Which events must occur for fertilization to become an implanted pregnancy?", requiredMinutes: 85, optionalMinutes: 15, outcomeIds: ["B3.1k"], classItemIds: ["1498152"], systemItemIds: ["2426"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 36, 46)], artifactIds: ["b-development-timeline"], interactionKind: "fertilization-sequence" }),
  lesson({ id: "b-lesson-09", unitCode: "B", moduleId: "b-module-3", order: 9, title: "Extra-embryonic Membranes and the Placenta", inquiry: "How do temporary structures sustain and protect a developing embryo?", requiredMinutes: 80, optionalMinutes: 15, outcomeIds: ["B3.1k", "B3.3k"], classItemIds: ["1498157"], systemItemIds: ["2426"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 52, 55)], artifactIds: ["b-development-timeline"], interactionKind: "placenta-exchange-model" }),
  lesson({ id: "b-lesson-10", unitCode: "B", moduleId: "b-module-3", order: 10, title: "Gastrulation, Germ Layers, and Organogenesis", inquiry: "How can three germ layers generate the tissues and organ systems of the body?", requiredMinutes: 95, optionalMinutes: 20, outcomeIds: ["B3.2k", "B3.3k", "B3.3s"], classItemIds: ["1498153", "1498157"], systemItemIds: ["2426"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 47, 51)], artifactIds: ["b-development-timeline"], interactionKind: "germ-layer-fate-map" }),
  lesson({ id: "b-lesson-11", unitCode: "B", moduleId: "b-module-3", order: 11, title: "Fetal Development and Environmental Evidence", inquiry: "How does developmental timing change the effects of environmental exposure?", requiredMinutes: 95, optionalMinutes: 20, outcomeIds: ["B3.2k", "B3.4k", "B3.1s", "B3.2s", "B3.3s"], classItemIds: ["1498157"], systemItemIds: ["2432"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 56, 59)], artifactIds: ["b-development-risk-analysis"], interactionKind: "development-risk-evidence" }),
  lesson({ id: "b-lesson-12", unitCode: "B", moduleId: "b-module-3", order: 12, title: "Parturition and Lactation", inquiry: "How do positive feedback and changing hormone signals coordinate birth and lactation?", requiredMinutes: 80, optionalMinutes: 15, outcomeIds: ["B3.1k"], classItemIds: ["1498158"], systemItemIds: ["2437"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 60, 64)], artifactIds: ["b-regulation-map"], interactionKind: "birth-feedback-model" }),
  lesson({ id: "b-lesson-13", unitCode: "B", moduleId: "b-module-4", order: 13, title: "Reproductive Technologies, Evidence, and Ethics", inquiry: "How should evidence, risk, access, and values shape a reproductive-technology decision?", requiredMinutes: 90, optionalMinutes: 20, outcomeIds: ["B3.5k", "B3.1sts", "B3.2sts", "B3.2s", "B3.3s", "B3.4s", "B2.2sts"], classItemIds: ["1498154"], systemItemIds: ["2442"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 69, 75)], artifactIds: ["b-technology-decision-brief"], interactionKind: "technology-evidence-matrix" }),
  lesson({ id: "b-lesson-14", unitCode: "B", moduleId: "b-module-4", order: 14, title: "Integrated Reproduction and Development Case", inquiry: "Can one evidence chain connect anatomy, hormones, development, risk, and technology?", requiredMinutes: 70, optionalMinutes: 20, outcomeIds: ["B1.1k", "B1.2k", "B1.3k", "B1.4k", "B1.5k", "B2.1k", "B2.2k", "B2.3k", "B3.1k", "B3.2k", "B3.3k", "B3.4k", "B3.5k", "B1.3s", "B2.3s", "B3.3s"], classItemIds: ["1498147"], systemItemIds: ["2368"], notes: [note(BIOLOGY30_NOTE_SOURCES.B, 1, 75)], artifactIds: ["b-integrated-case"], interactionKind: "integrated-reproduction-case" })
];

const UNIT_C_LESSONS: Biology30LessonBlueprint[] = [
  lesson({ id: "c-lesson-01", unitCode: "C", moduleId: "c-module-1", order: 1, title: "Chromosomes, Ploidy, and the Cell Cycle", inquiry: "How does chromosome organization preserve information through cell division?", requiredMinutes: 90, optionalMinutes: 20, outcomeIds: ["C1.1k", "C1.2k"], classItemIds: ["1498159", "1498160"], systemItemIds: ["2456"], notes: [note(BIOLOGY30_NOTE_SOURCES.C1, 2, 18)], artifactIds: ["c-cell-cycle-analysis"], interactionKind: "chromosome-ploidy-model" }),
  lesson({ id: "c-lesson-02", unitCode: "C", moduleId: "c-module-1", order: 2, title: "Mitosis and Cytokinesis", inquiry: "How does one nucleus become two genetically equivalent nuclei?", requiredMinutes: 95, optionalMinutes: 20, outcomeIds: ["C1.2k", "C1.2s"], classItemIds: ["1498161"], systemItemIds: ["2467"], notes: [note(BIOLOGY30_NOTE_SOURCES.C1, 21, 32)], artifactIds: ["c-cell-cycle-analysis"], interactionKind: "mitosis-stage-model" }),
  lesson({ id: "c-lesson-03", unitCode: "C", moduleId: "c-module-1", order: 3, title: "Cell-Cycle Investigation and Cancer", inquiry: "What can cell counts reveal about cycle timing and loss of regulation?", requiredMinutes: 105, optionalMinutes: 20, outcomeIds: ["C1.2k", "C1.1sts", "C1.1s", "C1.2s", "C1.3s", "C1.4s"], classItemIds: ["1498160"], systemItemIds: ["2462"], notes: [note(BIOLOGY30_NOTE_SOURCES.C1, 15, 20), note(BIOLOGY30_NOTE_SOURCES.C1, 33, 37)], artifactIds: ["c-cell-cycle-analysis"], interactionKind: "cell-cycle-data-lab" }),
  lesson({ id: "c-lesson-04", unitCode: "C", moduleId: "c-module-1", order: 4, title: "Meiosis I and II", inquiry: "Why does sexual reproduction require two divisions after one DNA replication?", requiredMinutes: 110, optionalMinutes: 20, outcomeIds: ["C1.3k", "C1.4k"], classItemIds: ["1498162", "1498166"], systemItemIds: ["2472"], notes: [note(BIOLOGY30_NOTE_SOURCES.C1, 38, 51)], artifactIds: ["c-meiosis-karyotype"], interactionKind: "meiosis-chromosome-model" }),
  lesson({ id: "c-lesson-05", unitCode: "C", moduleId: "c-module-1", order: 5, title: "Spermatogenesis, Oogenesis, and Chromosome Number", inquiry: "How do gamete-production pathways achieve the same chromosome goal differently?", requiredMinutes: 95, optionalMinutes: 20, outcomeIds: ["C1.3k"], classItemIds: ["1498162", "1498166"], systemItemIds: ["2478"], notes: [note(BIOLOGY30_NOTE_SOURCES.C1, 52, 56)], artifactIds: ["c-meiosis-karyotype"], interactionKind: "gametogenesis-comparison" }),
  lesson({ id: "c-lesson-06", unitCode: "C", moduleId: "c-module-1", order: 6, title: "Crossing Over, Nondisjunction, and Karyotypes", inquiry: "How can chromosome behaviour generate variation or alter development?", requiredMinutes: 105, optionalMinutes: 20, outcomeIds: ["C1.5k", "C1.6k", "C1.3s"], classItemIds: ["1498166"], systemItemIds: ["2478"], notes: [note(BIOLOGY30_NOTE_SOURCES.C1, 42, 62)], artifactIds: ["c-meiosis-karyotype"], interactionKind: "karyotype-evidence-lab" }),
  lesson({ id: "c-lesson-07", unitCode: "C", moduleId: "c-module-1", order: 7, title: "Reproductive Strategies and Cell-Division Integration", inquiry: "How do life cycles balance genetic continuity, variation, speed, and survival?", requiredMinutes: 100, optionalMinutes: 20, outcomeIds: ["C1.7k", "C1.2s", "C1.4s"], classItemIds: ["1498167"], systemItemIds: ["2484"], notes: [note(BIOLOGY30_NOTE_SOURCES.C1, 63, 79)], artifactIds: ["c-reproductive-strategy-comparison"], interactionKind: "life-cycle-comparison" }),
  lesson({ id: "c-lesson-08", unitCode: "C", moduleId: "c-module-2", order: 8, title: "Mendel, Alleles, and Segregation", inquiry: "How did inheritance ratios reveal rules that could not be seen directly?", requiredMinutes: 90, optionalMinutes: 20, outcomeIds: ["C2.1k"], classItemIds: ["1498174", "1498178"], systemItemIds: ["2496"], notes: [note(BIOLOGY30_NOTE_SOURCES.C2, 2, 25)], artifactIds: ["c-inheritance-investigation"], interactionKind: "segregation-model" }),
  lesson({ id: "c-lesson-09", unitCode: "C", moduleId: "c-module-2", order: 9, title: "Monohybrid Crosses", inquiry: "How can genotype probability predict phenotype without guaranteeing an outcome?", requiredMinutes: 100, optionalMinutes: 20, outcomeIds: ["C2.1k", "C2.2k"], classItemIds: ["1498179"], systemItemIds: ["2502"], notes: [note(BIOLOGY30_NOTE_SOURCES.C2, 26, 33)], artifactIds: ["c-inheritance-investigation"], interactionKind: "monohybrid-cross-lab" }),
  lesson({ id: "c-lesson-10", unitCode: "C", moduleId: "c-module-2", order: 10, title: "Probability, Test Crosses, and Sampling Variation", inquiry: "Why do observed ratios approach predictions without matching them exactly?", requiredMinutes: 95, optionalMinutes: 20, outcomeIds: ["C2.2k", "C2.1s", "C2.2s", "C2.3s"], classItemIds: ["1498179"], systemItemIds: ["2520"], notes: [note(BIOLOGY30_NOTE_SOURCES.C2, 27, 33), note(BIOLOGY30_NOTE_SOURCES.C2, 70, 71)], artifactIds: ["c-inheritance-investigation"], interactionKind: "probability-sampling-simulator" }),
  lesson({ id: "c-lesson-11", unitCode: "C", moduleId: "c-module-2", order: 11, title: "Incomplete Dominance, Codominance, and Multiple Alleles", inquiry: "What changes when alleles do not follow a simple dominant-recessive pattern?", requiredMinutes: 100, optionalMinutes: 20, outcomeIds: ["C2.2k", "C2.4k"], classItemIds: ["1498180"], systemItemIds: ["2508"], notes: [note(BIOLOGY30_NOTE_SOURCES.C2, 49, 73)], artifactIds: ["c-inheritance-investigation"], interactionKind: "inheritance-pattern-sort" }),
  lesson({ id: "c-lesson-12", unitCode: "C", moduleId: "c-module-2", order: 12, title: "Dihybrid Crosses and Independent Assortment", inquiry: "How do two gene pairs combine to create a larger probability space?", requiredMinutes: 115, optionalMinutes: 20, outcomeIds: ["C2.1k", "C2.2k"], classItemIds: ["1498179"], systemItemIds: ["2514"], notes: [note(BIOLOGY30_NOTE_SOURCES.C2, 34, 48)], artifactIds: ["c-inheritance-investigation"], interactionKind: "dihybrid-cross-lab" }),
  lesson({ id: "c-lesson-13", unitCode: "C", moduleId: "c-module-2", order: 13, title: "Sex Linkage and Pedigree Evidence", inquiry: "How can family patterns distinguish autosomal and sex-linked inheritance?", requiredMinutes: 110, optionalMinutes: 20, outcomeIds: ["C2.5k", "C2.3s"], classItemIds: ["1498180", "1498181"], systemItemIds: ["2526", "2546"], notes: [note(BIOLOGY30_NOTE_SOURCES.C2, 59, 66), note(BIOLOGY30_NOTE_SOURCES.C2, 74, 91)], artifactIds: ["c-pedigree-evidence"], interactionKind: "pedigree-evidence-lab" }),
  lesson({ id: "c-lesson-14", unitCode: "C", moduleId: "c-module-2", order: 14, title: "Gene Linkage, Crossing Over, and Chromosome Maps", inquiry: "How can recombination frequency become a map of relative gene position?", requiredMinutes: 115, optionalMinutes: 20, outcomeIds: ["C2.3k", "C2.3s"], classItemIds: ["1498182"], systemItemIds: ["2541"], notes: [note(BIOLOGY30_NOTE_SOURCES.C2, 94, 114)], artifactIds: ["c-chromosome-map"], interactionKind: "recombination-map-lab" }),
  lesson({ id: "c-lesson-15", unitCode: "C", moduleId: "c-module-2", order: 15, title: "Polygenic Traits, Environment, and Genetic Decisions", inquiry: "How should models and evidence be used when traits have many genetic and environmental influences?", requiredMinutes: 95, optionalMinutes: 20, outcomeIds: ["C2.4k", "C2.1sts", "C2.1s", "C2.2s", "C2.4s"], classItemIds: ["1498180", "1498181"], systemItemIds: ["2531", "2536"], notes: [note(BIOLOGY30_NOTE_SOURCES.C2, 67, 73), note(BIOLOGY30_NOTE_SOURCES.C2, 92, 93)], artifactIds: ["c-genetic-decision-brief"], interactionKind: "trait-evidence-model" }),
  lesson({ id: "c-lesson-16", unitCode: "C", moduleId: "c-module-3", order: 16, title: "DNA Evidence, History, and Structure", inquiry: "How did converging evidence support the double-helix model?", requiredMinutes: 85, optionalMinutes: 20, outcomeIds: ["C3.1k", "C3.2k"], classItemIds: ["1498184"], systemItemIds: ["2557"], notes: [note(BIOLOGY30_NOTE_SOURCES.C3, 2, 12)], artifactIds: ["c-dna-model"], interactionKind: "dna-evidence-builder" }),
  lesson({ id: "c-lesson-17", unitCode: "C", moduleId: "c-module-3", order: 17, title: "DNA Replication", inquiry: "How does molecular structure make accurate copying possible?", requiredMinutes: 100, optionalMinutes: 20, outcomeIds: ["C3.2k", "C3.2s"], classItemIds: ["1498185"], systemItemIds: ["2561"], notes: [note(BIOLOGY30_NOTE_SOURCES.C3, 13, 21)], artifactIds: ["c-dna-model"], interactionKind: "replication-sequence-model" }),
  lesson({ id: "c-lesson-18", unitCode: "C", moduleId: "c-module-3", order: 18, title: "Transcription", inquiry: "How is a DNA sequence converted into a portable RNA message?", requiredMinutes: 100, optionalMinutes: 20, outcomeIds: ["C3.3k", "C3.2s"], classItemIds: ["1498186"], systemItemIds: ["2565"], notes: [note(BIOLOGY30_NOTE_SOURCES.C3, 22, 29)], artifactIds: ["c-protein-synthesis-evidence"], interactionKind: "transcription-model" }),
  lesson({ id: "c-lesson-19", unitCode: "C", moduleId: "c-module-3", order: 19, title: "Translation and Gene Expression", inquiry: "How does a nucleotide message become an amino-acid sequence?", requiredMinutes: 110, optionalMinutes: 20, outcomeIds: ["C3.3k", "C3.2s"], classItemIds: ["1498187"], systemItemIds: ["2565"], notes: [note(BIOLOGY30_NOTE_SOURCES.C3, 30, 41)], artifactIds: ["c-protein-synthesis-evidence"], interactionKind: "translation-codon-lab" }),
  lesson({ id: "c-lesson-20", unitCode: "C", moduleId: "c-module-3", order: 20, title: "Mutations, Variation, and Cancer Evidence", inquiry: "When does a DNA change have no effect, alter a trait, or contribute to disease?", requiredMinutes: 105, optionalMinutes: 20, outcomeIds: ["C3.6k", "C3.1s", "C3.3s"], classItemIds: ["1498188"], systemItemIds: ["2570"], notes: [note(BIOLOGY30_NOTE_SOURCES.C3, 42, 50)], artifactIds: ["c-protein-synthesis-evidence"], interactionKind: "mutation-consequence-lab" }),
  lesson({ id: "c-lesson-21", unitCode: "C", moduleId: "c-module-3", order: 21, title: "Restriction Enzymes, Ligase, and Transformation", inquiry: "How can molecular tools cut, join, and introduce DNA sequences?", requiredMinutes: 105, optionalMinutes: 20, outcomeIds: ["C3.4k", "C3.5k", "C3.1sts", "C3.2s"], classItemIds: ["1498189"], systemItemIds: ["2575"], notes: [note(BIOLOGY30_NOTE_SOURCES.C3, 51, 55)], artifactIds: ["c-biotechnology-brief"], interactionKind: "recombinant-dna-model" }),
  lesson({ id: "c-lesson-22", unitCode: "C", moduleId: "c-module-3", order: 22, title: "DNA Evidence, Relationships, and Biotechnology", inquiry: "How can DNA patterns support identity, ancestry, diagnosis, and social decisions?", requiredMinutes: 105, optionalMinutes: 20, outcomeIds: ["C3.7k", "C3.2sts", "C3.3s", "C3.4s"], classItemIds: ["1498189"], systemItemIds: ["2580"], notes: [note(BIOLOGY30_NOTE_SOURCES.C3, 56, 59)], artifactIds: ["c-biotechnology-brief"], interactionKind: "dna-evidence-board" }),
  lesson({ id: "c-lesson-23", unitCode: "C", moduleId: "c-module-4", order: 23, title: "Genetics Investigation Portfolio", inquiry: "Can a complete investigation connect model choice, data, uncertainty, and communication?", requiredMinutes: 90, optionalMinutes: 20, outcomeIds: ["C1.1s", "C1.2s", "C1.3s", "C1.4s", "C2.1s", "C2.2s", "C2.3s", "C2.4s", "C3.1s", "C3.2s", "C3.3s", "C3.4s"], classItemIds: ["1498194"], systemItemIds: ["2450"], notes: [note(BIOLOGY30_NOTE_SOURCES.C1, 1, 79), note(BIOLOGY30_NOTE_SOURCES.C2, 1, 114), note(BIOLOGY30_NOTE_SOURCES.C3, 1, 59)], artifactIds: ["c-investigation-portfolio"], interactionKind: "genetics-investigation-board" }),
  lesson({ id: "c-lesson-24", unitCode: "C", moduleId: "c-module-4", order: 24, title: "Integrated Genetics and Molecular Biology Case", inquiry: "Can chromosome, inheritance, and molecular evidence explain one unfamiliar case?", requiredMinutes: 80, optionalMinutes: 20, outcomeIds: ["C1.1k", "C1.2k", "C1.3k", "C1.4k", "C1.5k", "C1.6k", "C1.7k", "C2.1k", "C2.2k", "C2.3k", "C2.4k", "C2.5k", "C3.1k", "C3.2k", "C3.3k", "C3.4k", "C3.5k", "C3.6k", "C3.7k"], classItemIds: ["1498194"], systemItemIds: ["2450"], notes: [note(BIOLOGY30_NOTE_SOURCES.C1, 1, 79), note(BIOLOGY30_NOTE_SOURCES.C2, 1, 114), note(BIOLOGY30_NOTE_SOURCES.C3, 1, 59)], artifactIds: ["c-integrated-case"], interactionKind: "integrated-genetics-case" })
];

const UNIT_D_LESSONS: Biology30LessonBlueprint[] = [
  lesson({ id: "d-lesson-01", unitCode: "D", moduleId: "d-module-1", order: 1, title: "Populations, Gene Pools, and Equilibrium", inquiry: "What would have to be true for allele frequencies to remain unchanged?", requiredMinutes: 75, optionalMinutes: 15, outcomeIds: ["D1.1k", "D1.2sts"], classItemIds: ["1498199"], systemItemIds: ["2587", "2594"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 2, 11)], artifactIds: ["d-hardy-weinberg-evidence"], interactionKind: "gene-pool-equilibrium-model" }),
  lesson({ id: "d-lesson-02", unitCode: "D", moduleId: "d-module-1", order: 2, title: "Hardy-Weinberg Assumptions and Model Limits", inquiry: "How can an unrealistic equilibrium model reveal real evolutionary change?", requiredMinutes: 90, optionalMinutes: 15, outcomeIds: ["D1.1k", "D1.2sts", "D1.1s"], classItemIds: ["1498199"], systemItemIds: ["2594"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 8, 17)], artifactIds: ["d-hardy-weinberg-evidence"], interactionKind: "hardy-weinberg-assumption-lab" }),
  lesson({ id: "d-lesson-03", unitCode: "D", moduleId: "d-module-1", order: 3, title: "Hardy-Weinberg Calculations", inquiry: "How can phenotype data reveal hidden allele and genotype frequencies?", requiredMinutes: 100, optionalMinutes: 15, outcomeIds: ["D1.3k", "D1.3s", "D1.4s"], classItemIds: ["1498199"], systemItemIds: ["2605"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 12, 20)], artifactIds: ["d-hardy-weinberg-evidence"], interactionKind: "hardy-weinberg-calculator" }),
  lesson({ id: "d-lesson-04", unitCode: "D", moduleId: "d-module-1", order: 4, title: "Mechanisms of Gene-Pool Change", inquiry: "How can selection, drift, mutation, and gene flow leave different evidence patterns?", requiredMinutes: 80, optionalMinutes: 15, outcomeIds: ["D1.2k", "D1.4k", "D1.1sts", "D1.2s"], classItemIds: ["1498200"], systemItemIds: ["2600", "2611"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 21, 30)], artifactIds: ["d-gene-pool-change-case"], interactionKind: "microevolution-evidence-sort" }),
  lesson({ id: "d-lesson-05", unitCode: "D", moduleId: "d-module-2", order: 5, title: "Species Interactions", inquiry: "How do interactions change the fitness and abundance of participating populations?", requiredMinutes: 75, optionalMinutes: 15, outcomeIds: ["D2.1k", "D2.1s", "D2.2s"], classItemIds: ["1498204"], systemItemIds: ["2615"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 56, 63)], artifactIds: ["d-community-investigation"], interactionKind: "species-interaction-model" }),
  lesson({ id: "d-lesson-06", unitCode: "D", moduleId: "d-module-2", order: 6, title: "Predation, Competition, and Defence", inquiry: "Which adaptations alter the costs and outcomes of predation and competition?", requiredMinutes: 80, optionalMinutes: 15, outcomeIds: ["D2.2k", "D2.3s"], classItemIds: ["1498204"], systemItemIds: ["2620"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 57, 60)], artifactIds: ["d-community-investigation"], interactionKind: "predator-prey-evidence-model" }),
  lesson({ id: "d-lesson-07", unitCode: "D", moduleId: "d-module-2", order: 7, title: "Succession and Community Change", inquiry: "How does disturbance alter the path and pace of community development?", requiredMinutes: 75, optionalMinutes: 15, outcomeIds: ["D2.3k", "D2.1sts", "D2.2s", "D2.3s", "D2.4s"], classItemIds: ["1498204"], systemItemIds: ["2624"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 64, 68)], artifactIds: ["d-community-investigation"], interactionKind: "succession-evidence-timeline" }),
  lesson({ id: "d-lesson-08", unitCode: "D", moduleId: "d-module-3", order: 8, title: "Population Size, Density, and Change", inquiry: "Which measurements distinguish a large population from a growing population?", requiredMinutes: 85, optionalMinutes: 15, outcomeIds: ["D3.1k", "D3.2k", "D3.1s", "D3.2s"], classItemIds: ["1498203"], systemItemIds: ["2629", "2633"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 31, 43)], artifactIds: ["d-population-data-lab"], interactionKind: "population-measures-lab" }),
  lesson({ id: "d-lesson-09", unitCode: "D", moduleId: "d-module-3", order: 9, title: "Growth Rates, Carrying Capacity, and Curves", inquiry: "What evidence distinguishes exponential growth from logistic growth?", requiredMinutes: 90, optionalMinutes: 20, outcomeIds: ["D3.2k", "D3.3k", "D3.3s"], classItemIds: ["1498203"], systemItemIds: ["2638"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 38, 49)], artifactIds: ["d-population-data-lab"], interactionKind: "population-growth-simulator" }),
  lesson({ id: "d-lesson-10", unitCode: "D", moduleId: "d-module-3", order: 10, title: "Life Strategies, Carrying Capacity, and Management", inquiry: "How should population evidence inform a defensible management decision?", requiredMinutes: 75, optionalMinutes: 20, outcomeIds: ["D3.4k", "D3.1sts", "D3.4s"], classItemIds: ["1498204"], systemItemIds: ["2644"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 49, 55)], artifactIds: ["d-wildlife-management-brief"], interactionKind: "management-evidence-matrix" }),
  lesson({ id: "d-lesson-11", unitCode: "D", moduleId: "d-module-4", order: 11, title: "Integrated Population and Community Case", inquiry: "Can genetic, interaction, growth, and management evidence support one coherent explanation?", requiredMinutes: 75, optionalMinutes: 20, outcomeIds: ["D1.1k", "D1.2k", "D1.3k", "D1.4k", "D2.1k", "D2.2k", "D2.3k", "D3.1k", "D3.2k", "D3.3k", "D3.4k", "D1.3s", "D2.3s", "D3.3s"], classItemIds: ["1498205"], systemItemIds: ["2588"], notes: [note(BIOLOGY30_NOTE_SOURCES.D, 1, 68)], artifactIds: ["d-integrated-case"], interactionKind: "integrated-population-case" })
];

export const BIOLOGY30_REMAINING_LESSONS: Record<Biology30ProductionUnitCode, Biology30LessonBlueprint[]> = {
  B: UNIT_B_LESSONS,
  C: UNIT_C_LESSONS,
  D: UNIT_D_LESSONS
};

export const BIOLOGY30_REMAINING_MODULES: Biology30ModuleBlueprint[] = [
  { id: "b-module-1", unitCode: "B", title: "Reproductive Structures and Development", lessonIds: pages(1, 4).map((number) => `b-lesson-${String(number).padStart(2, "0")}`) },
  { id: "b-module-2", unitCode: "B", title: "Chemical Control and Reproductive Health", lessonIds: pages(5, 7).map((number) => `b-lesson-${String(number).padStart(2, "0")}`) },
  { id: "b-module-3", unitCode: "B", title: "Human Development", lessonIds: pages(8, 12).map((number) => `b-lesson-${String(number).padStart(2, "0")}`) },
  { id: "b-module-4", unitCode: "B", title: "Technology and Integration", lessonIds: pages(13, 14).map((number) => `b-lesson-${String(number).padStart(2, "0")}`) },
  { id: "c-module-1", unitCode: "C", title: "Cell Division", lessonIds: pages(1, 7).map((number) => `c-lesson-${String(number).padStart(2, "0")}`) },
  { id: "c-module-2", unitCode: "C", title: "Classical Genetics", lessonIds: pages(8, 15).map((number) => `c-lesson-${String(number).padStart(2, "0")}`) },
  { id: "c-module-3", unitCode: "C", title: "Molecular Genetics", lessonIds: pages(16, 22).map((number) => `c-lesson-${String(number).padStart(2, "0")}`) },
  { id: "c-module-4", unitCode: "C", title: "Investigation and Integration", lessonIds: pages(23, 24).map((number) => `c-lesson-${String(number).padStart(2, "0")}`) },
  { id: "d-module-1", unitCode: "D", title: "Population Genetics", lessonIds: pages(1, 4).map((number) => `d-lesson-${String(number).padStart(2, "0")}`) },
  { id: "d-module-2", unitCode: "D", title: "Community Interactions", lessonIds: pages(5, 7).map((number) => `d-lesson-${String(number).padStart(2, "0")}`) },
  { id: "d-module-3", unitCode: "D", title: "Population Growth", lessonIds: pages(8, 10).map((number) => `d-lesson-${String(number).padStart(2, "0")}`) },
  { id: "d-module-4", unitCode: "D", title: "Integration", lessonIds: ["d-lesson-11"] }
];

function artifactsFor(unitCode: Biology30ProductionUnitCode): Biology30ArtifactBlueprint[] {
  const lessons = BIOLOGY30_REMAINING_LESSONS[unitCode];
  const artifactIds = [...new Set(lessons.flatMap((record) => record.artifactIds))];
  return artifactIds.map((id) => {
    const artifactLessons = lessons.filter((record) => record.artifactIds.includes(id));
    const title = id
      .replace(/^[b-d]-/, "")
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
    return {
      id,
      unitCode,
      title,
      lessonIds: artifactLessons.map((record) => record.id),
      outcomeIds: [...new Set(artifactLessons.flatMap((record) => record.outcomeIds))]
    };
  });
}

export const BIOLOGY30_REMAINING_ARTIFACTS = (["B", "C", "D"] as const).flatMap(artifactsFor);

export function validateBiology30RemainingBlueprint() {
  const lessonIds = new Set<string>();
  for (const unitCode of ["B", "C", "D"] as const) {
    const curriculum = BIOLOGY30_UNIT_CURRICULA[unitCode];
    const lessons = BIOLOGY30_REMAINING_LESSONS[unitCode];
    const expectedLessonCount = { B: 14, C: 24, D: 11 }[unitCode];
    if (lessons.length !== expectedLessonCount) {
      throw new Error(`Unit ${unitCode} lesson-count drift: expected ${expectedLessonCount}, received ${lessons.length}.`);
    }
    if (lessons.reduce((total, record) => total + record.requiredMinutes, 0) !== curriculum.requiredMinutes) {
      throw new Error(`Unit ${unitCode} required minutes do not match the curriculum contract.`);
    }
    if (lessons.reduce((total, record) => total + record.optionalMinutes, 0) !== curriculum.optionalMinutes) {
      throw new Error(`Unit ${unitCode} optional minutes do not match the curriculum contract.`);
    }
    const officialOutcomeIds = new Set(curriculum.outcomes.map((record) => record.id));
    const mappedOutcomeIds = new Set(lessons.flatMap((record) => record.outcomeIds));
    for (const outcomeId of officialOutcomeIds) {
      if (!mappedOutcomeIds.has(outcomeId)) throw new Error(`Unit ${unitCode} outcome ${outcomeId} has no explicit teaching route.`);
    }
    for (const record of lessons) {
      if (lessonIds.has(record.id)) throw new Error(`Duplicate Biology 30 lesson ID: ${record.id}.`);
      lessonIds.add(record.id);
      if (record.outcomeIds.some((outcomeId) => !officialOutcomeIds.has(outcomeId))) {
        throw new Error(`Lesson ${record.id} references an unknown Unit ${unitCode} outcome.`);
      }
      if (record.classItemIds.length === 0 || record.systemItemIds.length === 0 || record.notes.length === 0) {
        throw new Error(`Lesson ${record.id} requires explicit class, system, and notes source selections.`);
      }
      if (!record.inquiry.trim() || !record.interactionKind.trim() || record.artifactIds.length === 0) {
        throw new Error(`Lesson ${record.id} has an incomplete independent-learning blueprint.`);
      }
    }
  }

  const moduleLessonIds = BIOLOGY30_REMAINING_MODULES.flatMap((record) => record.lessonIds);
  if (moduleLessonIds.length !== lessonIds.size || new Set(moduleLessonIds).size !== lessonIds.size) {
    throw new Error("Biology 30 module inventory must contain every remaining lesson exactly once.");
  }
  for (const lessonId of lessonIds) {
    if (!moduleLessonIds.includes(lessonId)) throw new Error(`Biology 30 module inventory omits ${lessonId}.`);
  }
}
