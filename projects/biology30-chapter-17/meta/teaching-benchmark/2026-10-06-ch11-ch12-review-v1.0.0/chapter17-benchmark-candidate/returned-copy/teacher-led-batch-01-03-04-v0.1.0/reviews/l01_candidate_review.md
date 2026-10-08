# Lesson01 complete candidate review

## Scope and evidence distinction

This is a **separate assistant read-only source/science/instructional review** of the actual completed lesson01 candidate. The reviewer shared the task context and had prepared the lesson01 source review. It was not blind, external specialist review or Dean's exact-copy acceptance. The reviewer did not author or edit learner copy, integrate a native page, operate a browser, test runtime behaviour or access Mac/course/GitHub files.

I read the whole native fragment and whole reading manuscript, including every paragraph, all three teaching tables, both figure introductions/alt texts/captions/interpretations, every worked step and every protected suffix prompt, option, explanation, writing model, criterion, status instruction and optional task. I then read the complete appended native-data feedback/optional-practice supplement after it was added. Source comparisons use the actual current batch packet and the directly read original-slide/PDF evidence recorded in `l01_source_preparation.md` and associated JSON files.

## Exact candidate versions read

| Read stage | File | Bytes | SHA256 |
| --- | --- | ---: | --- |
| Full learner teaching read | `lesson-01.teaching-fragment.html` | 17,762 | `d657e77739f6338e9d1668ad6860f7fc189cb977407fbd1c1a8ba4e375acf86a` |
| Initial complete manuscript read | `manuscripts/lesson-01.md` | 20,571 | `c675c80a898bcbbb316df9fc42fb8bf9f402a8be842132beff5c14848a550d84` |
| Full new native-feedback supplement read, with unchanged preceding teaching/suffix | `manuscripts/lesson-01.md` | 27,243 | `90807201fe8337480afc3c788c5379fae37327eec03265761ab3e503823a07a0` |

The author indicated an intended change from the hypothetical record names Cedar/Aspen/Willow to Plant1/2/3. That change was not yet present at the hashes above. It needs a final hash addendum and a bounded reread of the changed passage/table before these records are described as applying to the final bytes.

## Findings and repair history

### R1 — Reading-only feedback completeness: repaired and rechecked

The first manuscript preserved the native suffix's visible content, but the inert guided questions promised hints without containing the runtime-provided hints or explanations. Those texts live in `course-data.guidedActivities[0].guided.items`, not the source suffix's empty live-feedback elements. Disabled reading controls cannot provide that feedback themselves.

The author added a clearly separated reading-only supplement, leaving the native teaching fragment unchanged. I read and checked the full supplement against current native data:

- `ch17-l01-guided-q1` and `ch17-l01-guided-q2`: exact hints, answers and explanations.
- `ch17-l01-check-mc-1` and `ch17-l01-check-mc-2`: exact cues, answers and explanations.
- `ch17-foundation-ch17-word-gene`, `...-allele`, `...-genotype`, `...-phenotype`: complete prompts, option order, cues, answers and explanations.
- `ch17-l01-application-1` and original self-assessed `ch17-l01-scenario-1` model.
- `ch17-l01-context-gene`, `...-allele`, `...-genotype`, `...-phenotype`: complete existing prompts, cues, answers and explanations.
- `ch17-multiple-01`: complete current prompt, all option texts in source order, correct texts corresponding to source answer IDs `true-1` and `true-2`, cue and full explanation.

All 15 source record IDs/locators were checked directly. The supplement does not restore the historical `guidedActivities.worked` record as teaching. It adds no native field, save control, grading or progress behaviour. The repair is confirmed at manuscript SHA `90807201…23a07a0`.

### C1 — Hypothetical plant-record names: agreed clarification pending final-byte confirmation

The source model concerns one kind of flowering plant. The initial worked records are called Cedar, Aspen and Willow, with an explicit sentence saying these are names for records. The explanation is scientifically scoped, but those names also denote real kinds of trees and add needless possible confusion. The author's intended Plant1/2/3 labels keep every student inference while removing that distraction. This is a label clarification, not a reason to rewrite or shorten the worked reasoning.

No other consequential science or instructional repair was identified in the reviewed teaching.

## Whole-lesson instructional read

| Actual block | What the learner receives | Review conclusion within scope |
| --- | --- | --- |
| `ch17-l01-teaching-01`, “Why choose particular parents?” | A biological question about inheritance and predictive limits; a concrete dog contrast with precise noticing; selective-breeding meaning; distinction between observation and genetic inference | Purpose precedes the terminology. The photo is not treated as genotype or parentage evidence. The transfer retains the teacher's concrete-example function without importing the human-eye model. |
| Same block, “What passes from parents to offspring?” | DNA, chromosome, gene/product, allele/version and locus; ordinary diploid autosomal scope; homologous pair; a table of two corresponding loci before copying; two allele copies versus versions; egg/sperm and fertilisation meanings | Consequential first-use terms and parent-contribution links are explained visibly. The table avoids using a duplicated chromosome as the two parental homologues. Full segregation/replication mechanics are explicitly left for the retained Mendel account. |
| `ch17-l01-teaching-02`, “Read an allele pair and the characteristic it produces” | Explicit B/b flower model; genotype/phenotype meanings; row-by-row reading of original flower chart; distinct questions answered by its two columns | Symbols and model are introduced before independent use. Static-image guidance is honest. The chart is not described as generations, a probability set or measured population. |
| Same block, “Compare the versions within each pair” | Homozygous/heterozygous meanings, BB/Bb/bb, bB versus Bb, role of writing convention | Two different allele versions remain distinct from two allele copies. Parent order does not become a fourth genotype. The later worked reversal has a distinct representational inference. |
| Same block, “Explain the shared purple phenotype” | Complete dominance as heterozygote phenotype relationship; b remains in Bb; dominance does not bias gamete inheritance; physiological/behavioural phenotype and expression limits | The misleading human-eye source and “always expressed” generalisation are not copied. The original chart's limited “physical traits” wording is corrected through essential visible explanatory context without editing its bytes. |
| `ch17-l01-teaching-03`, “Use the model before the letters” | Local notation, copy/version meaning table, dominance versus frequency, reverse inference and B_ uncertainty, model assumptions, why notation/expression rules precede a cross | The conclusions are scoped. The placeholder is explained. Fair preparation for the broad required conceptual demands remains visible. The reader is not expected to know grid operations yet. |
| `ch17-l01-worked`, “Follow a contribution record before interpreting appearance” | Givens; ordered parental contributions; unordered allele pair; zygosity; phenotype mapping; loss of information when only appearance remains; full summary table | The worked example explains each action and why. There is no unjustified probability assigned to the three given records and no claim that their composition predicts a population ratio. |
| Closing “What would breeding evidence need to show?” | Returns to selected appearance versus inherited information; poses Mendel's experimental question; defers advanced optional chromosome-order work | The ending connects to the retained experiment rather than repeating it. It does not force internal route codes or source/authoring narration into learner prose. |

## Actual source-pixel and preservation checks

I previously displayed and inspected all original relevant lesson01 PPT image pixels through their actual OOXML relationships. In this candidate I checked both selected output asset files against those original byte copies:

| Candidate path | Original identity | Byte comparison |
| --- | --- | --- |
| `./assets/teaching-batch1-v010/slide-4-image13.jpg` | Slide4 rId3 → `ppt/media/image13.jpg`; eight-dog row; 27,674 bytes; SHA `7c2c37bc887ab1b5bdf6ff3948242ba949b9d10c3ba510f27f1538c7a01525ba` | Exact original bytes |
| `./assets/teaching-batch1-v010/slide-12-image18.png` | Slide12 rId3 → `ppt/media/image18.png`; BB/Bb purple and bb white chart; 159,723 bytes; SHA `6514f5d48a724cdf1fe785c24b74f44abb03b73af75c26e787b8a8adf687f26c` | Exact original bytes |

The dog description matches visible features and does not infer genotype, measured relative size or parentage. The flower chart's legend, row order and colours match actual source pixels. Its embedded labels and credit remain unchanged. No human-eye/child image, unsupported generated image, crop or invented source URL was added.

The four exact outer opening tags match the original fragment byte strings. The candidate contains no input, textarea, select, script or style element. Existing four vocabulary links remain, with meaningful existing-ID links to homozygous/heterozygous. The complete source optional saved note is not duplicated in the native fragment.

Every nonempty source-suffix visible text leaf survives in the reading Markdown. This includes the whole protected chromosome6 mapping prompt and its instructions/status text, guided options, required options, both writing models and all criteria. The original lesson01 protected suffix contains **no image**, so no optional-source figure is absent from its reading copy. Source-provided dynamic feedback is additionally preserved in the checked supplement above. These are static file/content checks, not tests of native interaction behaviour.

## Assessment preparation and limits

The teaching visibly prepares gene/allele/locus relationships, genotype versus phenotype, homozygous/heterozygous, complete dominance, frequency versus expression, valid notation and phenotype uncertainty. It supplies necessary conceptual support for the frozen required and guided questions. The broad required writing asks for any complete-dominance example showing why two genotypes can share one phenotype, so conceptual overlap with competent instruction cannot be eliminated. The new worked record adds ordered contribution versus unordered genotype reasoning, copy/version discrimination and an information-loss inference rather than presenting the historical fictional beetle response as a new worked answer.

The chromosome6 optional source task remains beyond this lesson's prerequisites and is explicitly deferred to linked genes/genetic maps. Its original disease labels are retained as protected source wording; the new teaching makes no medical claim from them. The source preparation record separately identifies optional textbook588Q3/Q4 as belonging to the retained experimental sequence, and587Q2 as historical reading. The batch preparation map should keep those deferrals explicit rather than label them taught by the introductory definitions.

## Status at this review stage

- Complete actual candidate teaching and initial protected suffix: read.
- Complete added native-feedback/optional-practice reading supplement: read and verified against current native data.
- Source text/pixels and two selected original asset bytes: checked within lesson01 scope.
- Identified reading-feedback omission: repaired and rechecked.
- Plant-record label clarification: expected; final-byte addendum pending.
- Other consequential source/science/instructional finding: none identified within this bounded read.
- Browser rendering, native assembly, runtime/save tests, external specialist review and Dean acceptance: not performed by this reviewer.

The record does not automatically certify quality or authorise integration. Final file hashes and the bounded reread of subsequent changes must be added before referring to this as a review of the final delivered bytes.

## Final-byte addendum: targeted label-change closure

The planned record-name repair is now applied as **Plant 1, Plant 2 and Plant 3**, with the introductory phrases reading “For Plant 1”, “For Plant 2” and “For Plant 3”. I reread the complete changed worked paragraph, every worked step, the summary table and the adjoining interpretation in both formats. All contributions, genotype/zygosity assignments, flower colours, uncertainty conclusions and probability limits remain correct.

| Final file | Bytes | SHA256 |
| --- | ---: | --- |
| `lesson-01.teaching-fragment.html` | 17,745 | `9af1936228a2f611e9338d0a72142801899802d7d86c054d2a983474ed96e72a` |
| `manuscripts/lesson-01.md` | 27,226 | `6710454dc2cf38853a68280c60d1d078589e71a4a8fae55072c8794c38597eee` |

A reversible text comparison that restores only the original record names/clarification sentence reproduces the previously reviewed native-fragment and feedback-complete manuscript hashes exactly. This establishes that no unreviewed teaching or feedback changes accompany the label repair. The final supplement therefore retains the checked current native text.

The name-clarification item is closed. No consequential unresolved source/science/instructional repair was found within this bounded lesson01 read. This is still not external specialist review, native testing or Dean acceptance. Later byte changes would need a new explicit review scope.
