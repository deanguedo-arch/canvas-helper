# Biology 30 B/C/D — Full Rebuild Using the Final Unit A Process

## 0. Restart authority, model policy, and current implementation state

Recorded 2026-09-06 from the planning task **Find new science course process**, ID `01a049cb-5d97-7212-96b0-fd9687a5624b`. Sections 1–5 below preserve the complete previously presented implementation plan. This section adds the subsequently agreed restart and AI-effort policy.

### Read first and resolve precedence

1. Read [the active handoff](../ops/ACTIVE_HANDOFF.md), then this complete plan.
2. Read [the pinned intake manifest](../../projects/biology30-unit-a-pilot/meta/bcd-rebuild-intake-manifest.json) and [the handoff checkpoint](../../projects/biology30-unit-a-pilot/meta/bcd-rebuild-handoff-checkpoint.json).
3. Use [the living playbook](../../projects/biology30-unit-a-pilot/meta/unit-a-to-bcd-improvement-playbook.md) for the detailed procedures and [the 53-rule register](../../projects/biology30-unit-a-pilot/meta/biology30-improvement-transfer-contract.json) for per-rule owners, evidence, and recovery.
4. Read the target production contract and relevant owning source before editing. The current B/C/D courses and their older tests are not already Pilot-2-equivalent.

The user explicitly chose **provisional use of final Unit A**, a complete B → C → D build without intermediate slice-approval pauses, unit-specific assessment sizing, and scientifically usable provisional image selections followed by batch comparison. Those process decisions supersede earlier requirements to await complete A acceptance before starting a separately authorized B/C/D rebuild. They do **not** supersede scientific/source gates, mark A accepted, or grant release authority.

The old generated `bcd-material-readiness.json` inventories the earlier archive/notes stage and still reports standalone decks/plans missing. The new intake manifest is the availability overlay for the newly supplied fifteen files and eight embedded textbook members. Keep the older report as evidence of its narrower stage; update its generator during intake rather than manually falsifying generated readiness. Neither manifest proves complete scientific, rights, caption, or source-disposition review.

### AI effort and usage policy

- Main implementer: **GPT-6 Astra / High / Standard speed**.
- Routine bounded inventory, formatting, or metadata work may use **Medium** when actually configured for that work. Otherwise continue with High; do not claim a prompt alone switched settings.
- **Max is an escalation, not the default**. Use only for an identified difficult scientific reconciliation or technical failure, with explicit user approval of the escalation.
- Model, reasoning effort, and processing speed are separate configured settings. Do not edit global Codex settings or assume automatic per-step switching. State the actual supported setting if it differs. [Official configuration guidance](https://learn.chatgpt.com/docs/config-file/config-reference)
- Use scripts for deterministic inventory/count/hash/link checks; keep source-review findings and task checkpoints on disk. Read targeted records rather than repeatedly loading the entire chat, all slides, or every historical report.
- Do not trade away required academic, scientific, accessibility, visual, or persistence verification to reduce usage. Do not promise a fixed weekly percentage or runtime saving.
- No automatic credit redemption, paid API fallback, or proliferation of parallel AI tasks. B, C, and D remain sequential. If bounded subagents are available and useful, give them narrow inputs and disjoint ownership; do not duplicate the entire course review.
- Use the user's authenticated ChatGPT browser for the image workflow in section 4. Re-discover the live tab; tab IDs and authentication are not persistent handoff guarantees. Preserve a resumable image queue and report a genuine authentication/limit blocker without bypassing it.

### Fresh-task environment and stopping point

Use **the saved local checkout** at `/Users/deanguedo/Documents/GitHub/canvas-helper`, not a fresh worktree or clone. Branch at handoff: `codex/studio-direct-editing-v1`; HEAD `2ad72ec06b104c589f91e4b5afb8d86c322bc168`. Important authored inputs and assets are uncommitted/untracked. The checkpoint records their presence; it is not a backup of all source bytes.

This handoff cycle changes documentation/operational records only. **The B/C/D rebuild and new command/profile implementation have not started.** Start the next execution task with verified intake and all-unit contracts, not a Unit A rebuild or another generic A audit. The [copyable next-task prompt](../ops/biology30-bcd-next-task-prompt.md) authorizes that next task separately.

Before any target rebuild, preserve current B/C/D learner bytes, canonical inputs, contracts and state in an immutable baseline; detect intervening edits and stage changes transactionally. Never run broad Git cleanup, reset, checkout, staging or commit operations.

### Decisions still requiring evidence, not another design discussion

- Final A teacher decision remains null; its 6/3/7/2 Final Practice weighting differs from the original 6/4/6/2. Do not change A to resolve that in this task.
- Exact chapter/final/challenge question counts, vocabulary-family inventories, internal part counts, per-route timing, and advanced counts are **to be derived and frozen during pre-render intake**. Do not invent them from A or pretend they were already approved.
- Recheck the current official Biology-specific bulletin and performance-standard columns. Availability alone does not establish curriculum relevance.
- Every unit still needs actual caption/factual review, figure rights/accuracy decisions, exact PDF folio verification, migration proof, and complete candidate review.
- Full-unit teacher acceptance, publication, export, deployment and actual LMS certification remain separate decisions.

## 1. Objective and operating decisions

Rebuild the existing B/C/D courses using the complete instructional and technical approach developed in Unit A Pilot 2—not simply its appearance.

“One pass” means a coordinated implementation of all three complete units, with technical and academic checks throughout, followed by full-unit teacher review. It does not mean trusting a single AI generation.

The decisions are:

- Use final Unit A provisionally as the reference. This does not mark Unit A or B/C/D teacher-accepted.
- Preserve the teacher’s named topics and order. As in A, broad topics contain manageable internal teaching sections rather than compressed explanations.
- Size practice to each unit’s curriculum and skills, not Unit A’s counts.
- Generate necessary image candidates, integrate scientifically checked provisional choices, and provide batch side-by-side comparisons afterward.
- Build B, then C, then D without representative-slice approval pauses. Stop only for a genuine source, authority, scientific, or technical blocker.
- Keep all courses blocked, preview-only, non-exportable, and Studio Edit disabled. No publishing, deployment, commit, push, or LMS upload is included.

The canonical history remains the [Unit A→B–D improvement playbook](/Users/deanguedo/Documents/GitHub/canvas-helper/projects/biology30-unit-a-pilot/meta/unit-a-to-bcd-improvement-playbook.md). Its **53-rule transfer contract** becomes the implementation checklist. Every rule receives a B, C, and D disposition with evidence; historical or superseded approaches are not applied blindly.

### Protected reference

Pin Unit A Pilot 2 to:

`ab82b791d0bc771a522c6bd2d88c97a2f28e5ecaa0add9d69cb32a1be580c105`

Preserve Pilot 1, Pilot 2 learner files, production Unit A, source originals, and unrelated changes. Operational playbook and transfer records may be updated without changing A’s learner content or acceptance.

Before rebuilding each target, preserve its current workspace, authored inputs, contracts, and state schema in a content-addressed baseline. Record branch, commit, dirty state, and protected-tree checksums.

## 2. Source intake and exact teaching sequence

### Verified materials

The supplied material contains:

| Material | Confirmed inventory |
|---|---:|
| Brightspace archives | Two; both match existing shared archive copies |
| PowerPoints | Six |
| PowerPoint slides | 399 |
| Embedded media files | 442 |
| YouTube references | 82 occurrences representing 80 distinct IDs |
| Daily-plan documents | Seven, covering Chapters 14–20 |
| Textbook files | Eight PDFs covering seven chapters |

Keep Downloads unchanged. Preserve new originals once by checksum; reuse existing archive copies.

Six textbook PDFs have a 128-byte wrapper requiring normalization. Chapter 16 has two valid parts: four introductory pages and 36 chapter pages. Preserve the originals and create a validated 40-page reading derivative with explicit original-part mappings.

### Teacher-controlled lesson map

| Unit/chapter | Lessons in the teacher’s order |
|---|---|
| **B · Chapter 14** | 1. Male Reproductive Structures; 2. Spermatogenesis; 3. Female Reproductive Structures; 4. Menstrual Cycle |
| **B · Chapter 15** | 5. Fertilization to Implantation; 6. hCG and Gastrulation; 7. Extraembryonic Structures and Organogenesis; 8. Parturition |
| **C · Chapter 16** | 1. Chromosomes and DNA; 2. The Cell Cycle; 3. Mitosis; 4. Meiosis Part A; 5. Meiosis Part B; 6. Reproductive Strategies |
| **C · Chapter 17** | 7. Genes, Alleles and Traits; 8. Mendelian Genetics; 9. Single and Two Trait Crosses; 10. Other Modes of Inheritance; 11. Pedigrees; 12. Chromosome Mapping |
| **C · Chapter 18** | 13. DNA and its History; 14. DNA Replication; 15. Transcription; 16. Translation; 17. Mutations; 18. Genetic Technologies |
| **D · Chapter 19** | 1. Hardy–Weinberg; 2. Mechanisms of Change |
| **D · Chapter 20** | 3. Population Growth; 4. Life Strategies and Ecological Relationships |

Each unit also receives its Chapter Practice routes, Review Seminar, and Final Practice.

This produces **12 required routes in B, 23 in C, and eight in D**. Internal teaching sections provide clear stopping points but do not invent additional required-route markers.

### Resolve source discrepancies explicitly

- Chapter 16’s plan stops at slide 78; inspect and map slide 79’s continuation.
- Chapter 17 skips slide 26. Introduce its inheritance/Punnett-square explanation before the following crosses.
- Chapter 17’s plan ends at 111; account for slides 112–114, including the linkage/map continuation.
- Chapter 18’s plan ends at 59; inspect and disposition slides 60–61.
- A slide without extracted text is not automatically blank: inspect its media and visual content.
- Reconcile textbook page/question references against the actual book. Preserve corrections in a source-discrepancy register.
- Classroom quiz/exam windows become practice and review time. Secure assessments and their keys do not enter the course.
- Replace Quizlet/account-dependent directions with the local vocabulary and retrieval experience.

### Planning contracts before learner rendering

Complete and freeze these records before generating lesson HTML:

- Every teacher-plan row, slide, media relationship, hyperlink, and relevant archive item.
- Every existing B/C/D section: retain, core rewrite, advanced rewrite, model/review destination, or exclusion with reason.
- Atomic curriculum components, prerequisite terms, exact teaching targets, visuals, worked examples, practice operations, and evidence tasks.
- Exact lesson sections, times, assessment blueprint, vocabulary families, media checkpoints, figures, investigations, and saved-state budget.
- Every applicable Unit A transfer rule and its target-unit implementation.

The existing outcome inventories—B 30, C 35, D 27—must be reconciled against the official curriculum rather than treated as sufficient proof.

Use the [Program of Studies](https://education.alberta.ca/media/159727/bio203007.pdf) and [performance standards](https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf) as authorities. Distinguish acceptable-standard examples, excellence examples, and locally authored criteria; do not repeat A’s earlier mistake of treating all performance records as acceptable-standard requirements.

The official Biology bulletin retrieved during planning is labelled **2025–2026**. Recheck for its successor before authoring and again before eventual release. [Biology 30 bulletin](https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf)

## 3. Instructional features to reproduce completely

### Lesson construction

Carry forward A’s final sequence:

1. Observable question, learning goal, and prior knowledge.
2. Four anchor terms.
3. Expandable inventory of all new and reused terms.
4. Short, complete explanations with adjacent visuals.
5. Stop and Check.
6. Further teaching and required multimedia/local walkthrough.
7. Worked example, graph, model, or data interpretation.
8. Retrieval after teaching.
9. Guided practice with corrective feedback.
10. Saved Evidence Slip.
11. Optional Advanced Learning beside the relevant teaching.
12. Completion requirements and next destination.

Broad topics retain their names but gain clearly titled internal parts. They must not be squeezed into A’s usual lesson word count.

Core prose retains A’s accessible level: target Flesch–Kincaid 9.5–11.5, ceiling 12, generally short sentences and 40–100-word paragraphs. Readability calculations exclude navigation, repeated controls, and answer guides and are supplemented by manual reading.

Definitions precede explanatory use. A glossary link alone does not satisfy introduction. Necessary ideas cannot appear only in a figure, video, answer explanation, or Advanced Learning.

### Academic completeness

Every required component needs actual teaching and an observable learning operation—not merely a matching keyword or lesson link.

Prioritize:

- **B:** reproductive structure/function, gamete development, hormone/cycle graphs, fertilization and development sequences, placental relationships, birth/lactation, and evidence-based technology evaluation.
- **C:** chromosome/chromatid/ploidy reasoning, real cell observations, mitosis/meiosis sequences, probability and crosses, pedigrees, linkage calculations, DNA/RNA directionality, coding, mutations, and biotechnology evidence.
- **D:** allele/genotype calculations, Hardy–Weinberg assumptions, mechanisms of population change, sampling, rate units, growth curves, limiting factors, ecological relationships, and succession.

Graph, identification, calculation, inquiry, and explanation skills receive suitable tasks. Multiple-choice recognition is not substituted for constructing or explaining a model.

All investigations work online using supplied data and appropriate observations. They must not require equipment, partners, personal medical information, or family genetic disclosures. Digital observation is not represented as physical laboratory performance.

### Practice and textbook review

Keep two guided questions per named lesson. Develop chapter and final practice blueprints from the remaining curriculum operations and teacher emphasis. Their exact counts are frozen in the pre-render contract; neither old B/C/D totals nor A’s totals are automatic targets.

For every item, author:

- Outcome and component mapping.
- Previously taught prerequisites.
- Answer and independently checked rationale.
- Misconception-specific feedback.
- Relevant printed/physical textbook page and corrected local teaching link.
- Stable semantic response identifiers.

Preserve identifiers only where meaning and answer values remain equivalent. Material replacements receive new identifiers.

Place optional textbook assignments and attempt-gated native answer guides immediately before course questions:

| Chapter | Teacher’s review assignment |
|---|---|
| 14 | pp. 504–505: Q1–4, 8–9, 11, 13, 16, 17, 20, 23 |
| 15 | pp. 536–537: Q1–5, 7–17, 22, 23, 25, 26; validate the plan’s single-page reference |
| 16 | pp. 582–583: Q2–9, 11, 13–18, 21 |
| 17 | pp. 620–621: Q2–6, 8–10, 12–18, 21 |
| 18 | pp. 664–665: Q1–6, 9, 10, 12, 13, 22 |
| 19 | pp. 700–701: Q1–15 |
| 20 | pp. 740–741: Q1–12, 14, 15, 17, 18, 20, 22 |

Unit-review source ranges are:

- **B / Textbook Unit 6:** Q1–52, pp. 540–543; Chapter 15 PDF page 35.
- **C / Textbook Unit 7:** Q1–48, pp. 668–671; Chapter 18 PDF page 47.
- **D / Textbook Unit 8:** Q1–35, pp. 744–747; Chapter 20 PDF page 43.

Review each question for accuracy and relevance before adapting its guide. Document exclusions and corrections. Do not paste raw teacher keys.

Retain A’s attempt persistence, collapsed-on-reload guides, focus handling, exact-page controls, and jump-to-course-questions links. Textbook attempts remain non-gating.

### Vocabulary, models, investigations, and Process Collection

- Preserve the separate comprehensive glossary.
- Audit concept families using curriculum importance, recurrence, mechanism, confusion, and useful morphology. B≈30/C≈42/D≈24 remain planning budgets, not forced inventories.
- Use six fixed Frayer anchors plus two learner choices per unit, with authored model responses and the same safe choice/replacement rules as A.
- Introduce vocabulary progressively; future-term selections must explain where the concept is taught rather than appearing unresponsive.
- Build purposeful Models and Data Lab activities with **Predict → Test → Explain → Save**, explicit instructions, variables, comparisons, and evidence.
- Provide three scaffolded online investigations per unit, adapted to its content.
- Preserve one unified **All My Work** index derived from saved state, including meaningful drafts, attempted practice, media checks, evidence, Frayers, models, investigations, review responses, textbook confirmations, and notes.
- Copy/Print includes the complete collection, not only filtered visible entries.
- All return links open and focus the exact originating activity.

Investigations, Frayers, models, textbook reinforcement, and Advanced Learning remain non-gating.

### Advanced Learning and time

Give every substantive Learn block one adjacent, closed Advanced Learning disclosure. Reuse deeper curricular content from the old unit where appropriate, rewritten at the same accessible reading level.

Provide purposeful evidence, exact model links, self-mark completion, and a synchronized Process Collection checklist. Preserve every old section’s disposition; “advanced” is not a destination for inaccurate or noncurricular material.

Retain the existing unit time budgets:

| Unit | Required minutes | Optional minutes |
|---|---:|---:|
| B | 1,200 | 240 |
| C | 2,400 | 480 |
| D | 900 | 180 |

Reserve 20 optional minutes per unit for Review Seminar extension and 30 for Diploma Challenge; allocate the remainder to lesson Advanced Learning.

Audit reading, selected video duration, equivalent walkthroughs, practice, and evidence against these budgets. These are planning estimates, not measured student completion times.

## 4. Images and videos, including the ChatGPT workflow

### Figure selection and generation

Do not generate 442 replacements simply because 442 media files exist.

For each teaching purpose:

1. Inspect the existing course figure.
2. Inspect relevant native PowerPoint/textbook imagery.
3. Choose accurate, legible, rights-cleared source material when strongest.
4. Use authored SVG/HTML for graphs, calculations, Punnett squares, pedigrees, sequences, and label-heavy pathways.
5. Use ChatGPT Images only for a genuine illustration gap.

For each generated candidate:

1. Assign a stable unit/lesson/figure-slot ID.
2. Write the scientific accuracy and misconception checklist first.
3. Specify purpose, composition, reading direction, exact permitted labels, prohibited errors, dimensions, margins, and visual style.
4. Use the authenticated ChatGPT browser workflow requested by the user.
5. Generate one candidate and inspect its full-resolution science.
6. Request narrow corrections while preserving correct elements.
7. Download the full-resolution result.
8. Record original and revision prompts, provider, dimensions, checksum, source/reference, review findings, and provisional recommendation.
9. Integrate only a scientifically usable candidate.
10. Produce the authoring-only side-by-side comparison for teacher selection.

Keep the queue resumable. Authentication, image limits, or generation failures may require attention; do not bypass them or silently switch to a paid API. Reference-guided generation and focused editing are supported, but output still needs verification. [OpenAI image guidance](https://learn.chatgpt.com/docs/image-generation)

Each learner figure requires intrinsic responsive sizing, alt text, adjacent equivalent explanation/data, keyboard enlargement, and focus return. Inspect inline and enlarged versions. Remove superseded visible duplicates while preserving authoring history.

Teacher image choice remains distinct from scientific review, placement approval, rights clearance, and whole-course acceptance.

### Required media and Video Library

Disposition all 82 YouTube occurrences and other external links. Deduplicate learner entries by video ID while retaining every source relationship.

For selected instructional clips:

- Review captions/transcript, facts, prerequisites, pace, relevance, and segment duration.
- Show the preview when visible; never autoplay or add a custom Play button.
- Offer a complete ordered illustrated local walkthrough and the same checkpoint.
- Record the learner’s checkpoint, not asserted viewing time.
- Open the local path when the provider fails or is blocked.
- Preserve direct-provider and caption guidance.
- Keep other vetted useful clips in the categorized Video Library.

Unreviewed or failed clips cannot become required. No YouTube files are downloaded or redistributed. Every required concept remains locally taught.

## 5. Build ownership, state, verification, and handoff

### Authored inputs and interfaces

Extend the existing owner, [the Biology production builder](/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/biology30-course/v1/build.ts), with an explicitly selected Pilot-2-equivalent profile.

Do not paste A’s generated HTML into B/C/D or modify A’s renderer to operate on other units.

Add:

- An authored, checksum-pinned B/C/D intake manifest.
- Unit-specific topic/content, vocabulary, textbook, media, figure, advanced, practice, and collection contracts.
- A preparation command supporting verification-only and resumable transactional intake.
- An opt-in build profile with baseline/source-hash guards.
- Profile-aware academic, static, state, browser, and visual checks.

Proposed command interfaces:

```bash
npm run prepare:biology30-course:resources -- \
  --units B,C,D \
  --intake-manifest <pinned-manifest> \
  --check-video-links

npm run build:biology30-course -- \
  --project biology30-unit-b \
  --profile pilot2-topic-sequence-v1 \
  --baseline-workspace-sha <recorded-target-sha> \
  --strict
```

Run the build separately for B, C, and D. These interface additions must be implemented; they are not presented as existing functionality.

Stage workspace and metadata together. Validate before promotion, detect intervening edits, and roll back failed promotions. Once a unit uses the new profile, its ordinary regeneration command must not silently restore the old renderer.

### Persistence and compatibility

Use unit-scoped identifiers and the existing owning persistence boundary. Do not assume B/C/D already use A’s version-6 state format.

- Create explicit old-to-new route, response, choice, model, and completion maps.
- Migrate only equivalent meanings.
- Preserve unmatched earlier work as recoverable legacy work; do not attach it to unrelated new activities.
- Preserve the original payload before migration.
- Never silently truncate learner writing or overwrite a payload that cannot migrate safely.
- Target at most 44,000 serialized characters per unit with the 48,000-character guard and last-valid-state recovery.
- Exercise maximum-length, escaping, Unicode, legacy, and mixed-state fixtures.
- Report local saving, LMS SetValue, and Commit results independently.

Completion follows A’s approach: guided questions attempted, Evidence Slip saved, and mapped media checkpoints attempted. Chapter Practice, Review Seminar, and Final Practice have their own explicit required criteria. Optional collection work cannot change required completion or scores.

Live LMS migration and certification are outside this blocked-review build.

### Verification gates

Before handoff, prove:

- Complete input inventories and disposition coverage.
- All 53 transfer rules considered separately for each unit.
- Correct topic order, exact route totals, time totals, and frozen practice counts.
- Required concepts genuinely taught before assessment.
- Scientifically correct diagrams, calculations, datasets, keys, and misconception feedback.
- No secure assessments, credentials, private ChatGPT links, raw teacher keys, or administrative language in learner content.
- Exact textbook, vocabulary, video, model, advanced, and work-return navigation.
- Safe reload, migration, resets, choice replacement, collection, and truthful save failures.
- Complete blocked-network learning and completion.
- Collapsible desktop navigation, mobile navigation, wrapping controls, and full-width walkthroughs.
- Keyboard access, focus return, reduced motion, axe scans, and no clipping or horizontal overflow.

Test all routes and meaningful states at 1440×900, 1024×768, 390×844, and 200% zoom. Generate exact-build contact sheets and open every sheet before marking visual review complete.

Extend and run the existing production static/acceptance suite, specialized and project E2E, cross-browser coverage, visual audit, workspace verification, science comparison, transfer audit, manifests, Studio build, and course doctor. Run A regressions and protected-tree comparisons after shared changes.

A passing old test suite is not evidence that newly added features were tested. `course:doctor` may report only the intentional blocked/not-active condition.

### Final deliverables and continuing record

Produce:

- Three complete blocked review candidates.
- A teacher-topic/course crosswalk for each unit.
- Full academic, assessment, source-disposition, and old-content difference reports.
- Complete image comparison galleries with provisional selections.
- Video inclusion/exclusion reports and local-equivalent records.
- Exact-build verification, known limitations, and teacher-review checklists.
- Updated playbook, transfer ledger, materials readiness, per-unit prompt packs, and active handoff.

Append decisions and corrections chronologically; update bounded current summaries without deleting history. Record every final teacher decision against the exact unit and build hash.

The result is a repeatable, documented full-build process—not a claim that B/C/D are automatically accepted because they resemble Unit A.

## 6. Execution ledger and validation commands

### Required work queue

| Stage | Work | Finish condition |
| --- | --- | --- |
| 0 | Verify sources, protected hashes, same checkout and existing owners | Every source matches; no undocumented drift; immutable target-baseline plan established |
| 1 | Complete B/C/D inventories, discrepancies, old-section dispositions, 53-rule/unit maps and atomic curriculum/skills maps | Every required source/operation has a destination; actual counts and timing frozen before rendering |
| 2 | Implement opt-in owning-builder profile, contracts, transactional preparation and state migration tests | New features have explicit tests; ordinary regeneration cannot revert the profile |
| 3 | Build all of B, academic/technical repair and visual inspection | Complete blocked B candidate and exact-build findings; no slice approval pause |
| 4 | Build all of C with the same gates and its own science | Complete blocked C candidate and exact-build findings |
| 5 | Build all of D with the same gates and its own science | Complete blocked D candidate and exact-build findings |
| 6 | Consolidate image comparisons, unit review checklists and all evidence | Separate B/C/D teacher decisions requested, never inferred; handoff/playbook current |

After each stage and before any compaction-sized pause, update the active handoff with completed work, exact files/hashes, failed tests, remaining queue and next command. Do not restart completed inventory or silently discard findings.

### Existing versus planned commands

Inspect each existing entrypoint before running it. The new preparation command and `--profile pilot2-topic-sequence-v1`, `--baseline-workspace-sha`, and `--strict` support shown in section 5 are **planned interfaces**, not currently working commands.

Current entrypoints to extend/use:
```bash
npm run test:biology30-course-production
npm run audit:biology30-course-production:visual -- --project biology30-unit-b
npm run verify -- --project biology30-unit-b --mode workspace
npm run test:e2e:project -- --project biology30-unit-b
npm run test:biology30-unit-a-pilot-2
npm run test:biology30-unit-a-improvement-pilot
npm run test:science-comparison
npm run test:biology30-improvement-transfer
npm run audit:biology30-improvement-transfer -- --check
npm run validate:manifests
npm run build:studio
npm run course:doctor -- --project biology30-unit-b
```

Run per-unit commands separately for C and D too. Extend specialized/profile and cross-browser suites before using them as evidence; record their actual command names when implemented. The current transfer checker describes the old availability stage and pending acceptance; update its generator/fixtures intentionally when incorporating the new intake manifest, without setting acceptance flags.

The next task must not treat existing unrelated repository typecheck or stale legacy-fixture failures as newly introduced, nor hide new failures behind them. The A handoff records 25 historical repository typecheck errors and two old preview-fixture failures; refresh only as relevant and distinguish exact current evidence from historical findings.

### Scope and acceptance invariants

Five navigation groups: Start, Learn, Practice & Review, Process Collection, Resources. Course-local runtime uses no required remote instructional dependency. Preserve exact deep-link selection for textbook, terms, model, video, advanced block and saved work. Keep optional self-marked participation separate from observable evidence and required progress.

Do not manufacture A's counts (13 lessons, 86 questions, 40 advanced blocks, 14 media steps, 178 collection parents, state v6) in B/C/D. Reuse semantics and verification procedures. Target budgets and teacher topics in this plan govern the new contracts.

The original A evidence remains historical and hash-bound. No source, question, image, term, page, score, acceptance or curriculum content transfers merely by copying its identifier.


### Live execution checkpoint — 2026-09-06

Stage 0 complete. Stage 1 in progress: immutable source/baseline packets, all-unit draft topic/old-section/outcome/transfer maps and visual standards-column audit exist. Stage 2 has transactional preparation and a fail-closed profile interface only; no Pilot 2 renderer or new learner candidate exists. Exact progress, tests and inherited failures are in [the execution checkpoint](../../projects/resources/biology30-production/v1/pilot2/execution-checkpoint.json). The original planned-interface descriptions above remain historical; preparation and draft-contract validation are now implemented. Continue remaining atomic/content/practice/time/state contracts before rendering B.

Execution update: all-unit atomic, vocabulary/Frayer, practice, time, textbook and persistence draft contracts now exist. Deterministic planning tests 4/4, science tests 4/4 and state tests 6/6 pass. No contract is frozen and no learner candidate has been rendered: full core prose, individual source/figure/media review, independent answer/prerequisite/workload review and browser integration remain required. The execution checkpoint contains current counts rather than the earlier partial inventory.

Execution update: all 127 core parts are authored and the 30 topic-level prose estimates pass the reading ceiling. Individual high-grade passages, first-use science/source review and all instructional companions remain pending. Drafts are not rendered candidates; no gates were promoted by the reading estimate.

Execution update: all 127 worked examples, stop checks and closed optional Advanced explanations are authored. The all-unit contract command now audits these inputs and hashes them. Two instruction tests pass. Exact source/key/first-use review, old-section coverage and realistic workload remain pending.

Execution update: all 399 source slide texts now have individual dispositions, including 150 C qualification records and two visually resolved C answer-diagram conflicts. Core teaching and 127 companions include the identified source corrections; complete visual/media/rights, exact coverage/key and workload reviews remain pending. No pre-render gate is promoted by text review.

Execution update: nine model engines now reconstruct 27 cases with 51 shared-data bindings. All 14 challenge guides are specific, 49 final selected-response prompts now require applied biological operations, and all 74 written practice capacities fit complete exemplars with working room while remaining below the state target. Hash-based review/freeze validation is implemented; exact passage/key, figures/media/workload, renderer/asset closure and browser proofs remain pending. See the current checkpoint for test counts and state maxima.

Execution update: 49 final-item required-passage reviews, 44 plan-row dispositions, 442 embedded-file dispositions (476 media relationships) and 226 external relationship dispositions are saved. All unreviewed clips remain unselected. The authenticated ChatGPT image workflow is currently blocked by the locked Mac; manual unlock has been requested. Other pre-render reviews remain unfinished, and no candidate has been rendered. The active handoff and verification receipt record exact restart details.

### Execution update — restored browser and graph contracts (2026-09-06)

Browser blocker resolved. Playbook entry 51 records two provisional ChatGPT originals, the licensed microscopy supplement, 98 passage receipts, 16 contextual vocabulary moves and six source-bound graph contracts. All-unit freeze and learner rendering remain pending; no acceptance/release gate changed.

### Execution update — all practice passage receipts (2026-09-06)

Playbook entry 52 records B63/C132/D50 exact author passage reviews, repaired prerequisites and complete final written guides. Three small Unit D teaching additions and one community definition move were necessary to support the questions. Independent scientific keys, textbook reviews, figures/local media, workload, freeze closure and rendering remain pending. All 29 focused tests and protection checks pass; typecheck retains 25 unrelated diagnostics. Ordinary state is B30857/C43830/D25504; C has 170 characters of target headroom.

Execution update: playbook54 records all243 textbook source/key and required-passage reviews,47 completed guides,32 optional pre-attempt contexts and50 source notices. Authored textbook gate passes; rendered behaviour is pending. Thirty-one focused tests and protection checks pass with25 unrelated typecheck diagnostics. ChatGPT declined the correction of the rejected male anatomy candidate; that figure gap remains open with no alternate provider. Continue the remaining pre-render gates from the active handoff.


### Execution update — Independent practice-operation review complete

All245 practice items now have separate prompt-first author derivations (171 selected response,74 written) and exact full-item hashes. This is a separate author pass, not a second human reviewer or formal blinded study. B's gametogenesis guide now states primary/product chromosome counts; C's final cell-observation guide now addresses visible chromosome arrangement as well as synthetic counts. Required linked prose and examples were reread for those corrections. The authored practice/key gate passes; three of13 pre-render gates now pass.

All canonical selected-response keys are index0, so a tested owner helper varies displayed option order deterministically while preserving canonical saved values and feedback mapping. Renderer integration, actual image/graph availability, prerequisite visibility and restored browser selections remain pending. Updated ordinary state maxima are B30917/C43890/D25504; C has110 characters of target headroom. Thirty-three focused tests and draft contracts pass; protection verification passes; typecheck retains25 unrelated diagnostics. Exact evidence: `pilot2/verification/2026-09-06-all-practice-keys/report.json`. Continue semantic first use, atomic teaching proof, source/figure/media/retention and workload before all-unit freeze and B→C→D rendering.

### Execution update — B operation repairs and graph figures

Two additional B chapter applications close identified STS practice omissions; all247 keys and passage receipts pass. Six source-bound model graph SVGs and one original male-duct schematic are provisionally author-reviewed. Thirty-five focused tests and protected-baseline checks pass. Three pre-render gates perunit remain passed; no learner HTML rendered. Current exact receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-06-graph-and-b-applications/report.json`.

### Execution update — investigation contracts

All9 authored method/data/operation reviews pass with36 saved examples, bound original observation materials and graph contracts. Four of13 pre-render gates perunit now pass; learner HTML remains unrendered. D ordinary maximum25644; C43890 still has110 characters of target headroom. Latest receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-06-investigation-contracts/report.json`.

### Execution update — Unit B original-section retention reviewed

Read all56 original B sections against actual required prose and adjacent Advanced teaching. Restore missing endocrine blood routes, pregnancy-versus-STI prevention distinctions, regulatory/developmental detail and support/access context. The review seminar now teaches a source-separated evidence ledger with three bounded, attempt-gated model responses. Eight affected practice and15 textbook passage receipts were rereviewed after the two core expansions; their question/key text is unchanged. Barrier-method first use moves earlier. B chapter question counts now match14 each; workload realism remains pending.

The new owner retention auditor binds original section bytes to actual destination paragraphs and rejects missing targets or false implemented claims. B56 passes author retention; C96/D44 remain explicitly pending. Forty focused tests, draft contracts, reading and refreshed source/baseline verification pass;25 unrelated typecheck diagnostics remain. Pre-render gates are B5/13,C4/13,D4/13. Exact receipt: `pilot2/verification/2026-09-06-b-retention/report.json`. No learner HTML, teacher acceptance or release action. Continue C/D retention and remaining all-unit contracts.

### 61. All original-section retention comparisons complete

Read all96 C and44 D original sections against the actual mapped core/Advanced prose. C restores41 deeper companions, D17, with definitions for added terms and original quantitative examples. C’s sexual-reproduction trade-off maps to the actual mode-comparison lesson after a wrong animal-example target was caught. Retain the corrected observed-recombination-over50% qualification, distinct marker/sequence/function claims, and personal/community-data limits. D preserves original frog, herbivore and succession numbers with separate units and explicit synthetic-data limits.

C’s source-separated review seminar and D’s original North Marsh seminar now have three attempt-gated, criterion-based guides each, all within existing240-character fields. D’s242-character first draft was rejected by the capacity check and shortened; no state limit increased. C/D required paragraphs, worked examples and all practice/textbook/investigation questions/keys remain unchanged during retention. Container receipts were refreshed only for added Advanced teaching.

All196 original sections now have exact source-to-destination receipts. Each unit passes5of13 authored pre-render gates; rendered placement and the complete136-component academic/visual proof remain pending. Forty focused tests, draft contracts, required reading estimates, state maxima and refreshed source/baseline verification pass. Exact receipt: `pilot2/verification/2026-09-06-all-retention/report.json`. Continue remaining all-unit gates before owning-renderer implementation and B→C→D builds.

### Execution update — preserved glossary wording

Playbook64 records all236 preserved definition reviews and27 corrections, with original wording retained. Combined wording coverage is501 introduced plus236 preserved entries, not737 unique concepts. All-surface first use and dependencies remain pending. Fifty-two tests, draft contracts and source protection pass;25 unrelated typecheck diagnostics remain. No gate or learner build status changed. Exact receipt: `pilot2/verification/2026-09-06-preserved-glossary/report.json`.

### Execution update — actual B/C practice-operation mappings

Playbook65 records B65/C132 prompt-to-component reviews, narrowed to asked operations. B7/C11 criteria need other required-operation evidence or focused repairs; D links remain sub-operation evidence, not full completeness.53 tests and draft contracts pass,25 unrelated typecheck diagnostics remain. Six of13 gates perunit and zero rebuilt learners are unchanged. Exact receipt: `pilot2/verification/2026-09-06-bc-operation-mappings/report.json`.

### Execution update — required B inquiry repairs

Playbook66 records three new-ID required finals with explicit prediction/control/evidence/revision. B counts remain65; three response limits expand to600 and ordinary state becomes30851.53 focused tests and draft contracts pass; initial flag-order test failure and correction are retained. B3/C11 remaining required-practice-link gaps need review/repair before full academic proof. Allunit gates remain6of13; no learner render.

### Execution update — required B chapter repairs

Playbook67 records three one-for-one chapter replacements and one source-verified gland-location clarification. B65 counts unchanged; allunits249 items now168MC/81written. B ordinary state32498; C40269/D26164.53 focused tests, draft contracts, reading and source protection pass;25 unrelated typecheck diagnostics remain. B/D have required-practice links for every component, but full coverage remains pending; C11 empty links remain. Six of13 gates perunit and no new learner HTML.

### Execution update — required C STS cases

Playbook68 records three one-for-one chapter replacements addressing all four C STS criteria, including explicit evidence/value distinctions and perspective revision. C132 counts unchanged; allunits249 now165MC/84written. C ordinary state42616 leaves1384 target characters.53 tests and draft contracts pass; no owner-code/learner-tree change. Seven C empty required-practice links and complete all-component proof remain. Gates stay6of13; renderer still unimplemented.

### Execution update — required C inquiry finals

Playbook69 records three new-ID finals explicitly asking testable question/prediction/control/evidence/claim revision. C state43186 leaves814 target characters; complete guides fit650 each.53 tests and draft contracts pass; counts unchanged. Four C empty required-practice links and full all-component/figure proof remain. No gate promotion or learner render.

### Execution update — required C comparisons and state headroom

Playbook70 records four new-ID required comparison replacements; all136 components now link an actually asked required sub-operation, with full compound-criterion/figure proof still pending. Lossless fingerprinted response packing accommodates complete writing without shortening fields. Ordinary state B31386/C42988/D25272.54 tests, draft contracts and refreshed protection pass;25 unrelated typecheck diagnostics remain. Still6of13 authored gates each,0of3 learner candidates and no renderer implementation. This remains several substantial steps from the first build; no short ETA or percentage claim.

### Execution update — owner renderer components

Playbook71 records topic, practice, textbook and graph rendering with synthetic cross-browser save/restore/attempt/enlargement proof.59 tests pass. Components are implemented before freeze so their transitive code/asset contracts can be pinned; no real learner HTML is generated. All-unit freeze and whole-course assembly still gate B→C→D builds.


### Execution update — study/review/reference renderer components

Playbook72 records Models, Frayers, whole collection, investigations, seminar and optional references.67 tests and final six browser fixtures pass; no learner candidates generated and gates remain6of13. Textbook guide reload behavior corrected to the plan. Exact evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-study-components/report.json`. Continue recovery/bootstrap and assembly dependencies, then remaining all-unit academic/figure/source/timing/transfer closure before B→C→D generation.


### Execution update — integrated session and shell

Playbook73 records restore/recovery, integrated session and a pure NextStep-shell assembler.77 focused tests pass, including full synthetic route/collection/browser proof. All-unit freeze still gates real lesson rendering; no B/C/D candidate exists. Remaining production loader/media/entry/transaction work and seven authored gates are explicit in `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-session-recovery/report.json`. Next focus: bind reviewed figures and close the real source/academic/media/time/transfer contracts.


## 74. Actual figure bindings and production browser startup

All127 figure targets now have explicit unit manifests. Six are provisionally bound: five original illustrations (three ChatGPT PNGs and two authored SVGs) plus restricted local-use placental Figure15.11A. The new ovarian candidate was requested only after native old-course, supplied histology and textbook comparison, then inspected at original1536x1024. It separates the oocyte, supporting tissue and corpus luteum. Original prompt, checklist, checksum, limitations and fifth comparison section are saved. The four earlier image-queue records remain unchanged; only their containing evidence-file hash was refreshed after appending the new record. Placental old-course pixels and source crop were inspected. First-use and actual placement remain pending.

The actual owning browser entry now reads embedded startup data and composes environment capture with recovery/session. Exact unit keys include old state, responses, completion and notebook; malformed originals remain recoverable. Verified archives avoid reasking the same migration after reload while changed old bytes reopen recovery. Platform discovery/init/read failures cannot silently become an empty writable session. Local and SetValue/Commit outcomes remain separate. A bundled classic entry removes the module-fetch dependency for later local-file use; actual file/offline course proof still remains.

83 focused tests pass. Final expanded whole-shell/payload tests4 and capture/binding tests6 pass after the full run. Actual owner entry passes Chromium/Firefox/WebKit, including conflicting platform/device saves, failed Commit and blocked storage. Typecheck25 unrelated,0 owned; source/protected-tree checks pass. No live LMS certification, actual learner build or freeze. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-figures-browser-entry/report.json`. Next is the precise B hormone-diagram batch, followed by the remaining all-unit figure/source/academic closure and production asset/media/transaction integration. Do not rerun completed `/tmp/bcd-ovarian-review.py`.


## 75. Hormone and population-genetics figures

Nine original code-native SVGs add precise source/target and inhibitory hormone pathways, bounded labour and distinct lactation pathways, allele-copy counting, a probability-weighted genotype grid, equilibrium condition roles, phenotype/conditional-denominator calculation and observed-versus-expected bars. Native existing course figures, selected original slide imagery and textbook pages were inspected first. Required core/worked examples were reread. Independent Decimal calculations confirm the two D samples and conditional fraction. Native1200x900 review corrected lactation arrow/label collisions, explicit LH-source wording and a graph-axis collision; superseded drafts remain author-only. No alternate image generator or publisher-pixel reuse.

Fifteen of127 figure targets are bound: B10,C0,D5.112 remain. Short alt text/captions have complete adjacent equivalents. Fourteen comparison sections now exist; all teacher choices and actual learner first-use/placement remain pending. Two binding tests and draft contracts pass. Stage74 full83 tests/typecheck25 unrelated/0 owned/protection remain the referenced baseline; no owner code changed in stage75. No actual learner HTML or freeze. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-hormone-hwe-figures/report.json`. Do not rerun completed one-shot `/tmp/bcd-hormone-svg-drafts.py`, `/tmp/bcd-hormone-bindings.py`, `/tmp/bcd-hwe-svg-drafts.py` or `/tmp/bcd-hwe-bindings.py`. Continue remaining figure and source/academic closure.


## 76. Authentic five-photo group and individual enlargement

The required C observation slot now displays all five original MHR photographs as one source group. Each retains its exactJPEG bytes and A–E identity, neutral initial feature description, independent enlargement and focus return. The separate initially closed comparison gives tentative source stage interpretations and preserves uncertainty for B/E. Synthetic counts remain separate; no species, scale or physical microscopy skill is invented. No generated image substitutes for observational evidence.

The owning figure schema/renderer supports2–8 independent panels, validates every asset and prevents nested/duplicate groups.88 focused tests pass, including three-browser group controls and actual-owner startup. A first full-run screenshot-position failure was fixed in the static capture setup after focus-return proof; the full rerun passes. Actual originals were also inspected in an authoring-only component at1440/390 and individual original-size enlargement. This is not a real learner lesson or whole-course placement proof. Typecheck25 unrelated/0 owned; draft contracts and fresh source/protected-tree verification pass.

Figure bindings B10/C1/D5 =16of127;111 remain. All-unit gates stay6of13 and candidates0of3. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-microscopy-group/report.json`. Continue remaining figure/source/academic closure and owning asset/media/transaction/metadata integration. Never rerun completed `/tmp/bcd-micrograph-binding.py`.


### Stage77 — actual input assembly and browser bundle

The owner now reads all825 activity entries and all7 graph activities (including D’s demographic investigation), verifies exact textbook PDF and investigation material bytes, and plans only the needed logo/books/reviewed figure copies. C’s five original microscopy images remain separately available. `pilot2-inputs.ts` performs read-only inspection with no HTML; its production accessor enforces all-three-unit freeze. `pilot2-browser-bundle.ts` bundles the real browser entry in memory, records the exact source bytes delivered to esbuild plus package files/compiler identity, and refuses unresolved or outside-owner browser dependencies. The three-browser whole-course tests now use this production bundler.

All91 focused tests pass; typecheck25 unrelated/0 owned; draft contracts and fresh15-source/8-member/six-learner/A-owner protection pass. No canonical academic content changed, no real learner HTML,16/127 figures bound and6/13 gates per unit remain. Video Library, owner transaction/metadata integration and whole-owner transitive closure remain pending. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-owner-inputs/report.json`. Next: remaining D mechanisms/population figures and the other pending scientific/source gates.


### Stage78 — mechanisms of allele-frequency change

Five original D SVGs now distinguish variant origin and selection, drift/population histories, gene flow versus fixed-pool pairing, replicated exposure comparisons, and observed frequency evidence. Existing d-lesson-04, selected native slide media and chapter19 physical23 Figure19.13 were compared; relevant chapter19 physical22–24 source passages were read. All five native originals and five side-by-side sections inspected. Independent counts and Decimal calculations checked; diagrams retain no-unique-cause and model limits. No copied publisher pixels or generated replacement of observation evidence.

21/127 figure targets provisionally bound (B10,C1,D10),106 pending; six focused binding/input checks and draft contracts pass, protection passes. Full91-test stage77 baseline retained; no new owner code. No actual lesson rendering or teacher acceptance. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-mechanisms-figures/report.json`. Next: six D population-growth figures, then remaining ecology/B/C figures and scientific/source gates. Do not rerun completed `/tmp/bcd-mechanisms-svg-drafts.py` or `/tmp/bcd-mechanisms-bindings.py`.


### Stage79 — population measurement and growth figures

Six original D SVGs now show equal-density/different-size habitats and spatial distributions, quadrat/mark–recapture estimation, all four demographic counts, three explicitly denominated rates, qualitative J/S curves with separate first-step calculations, and changing K with a lag. Existing d-lesson-08/09, selected native slide media and chapter20 physical10–11 including Figure20.5 were inspected. All six final originals and six source/candidate comparison sections viewed. Numerical work independently checked; qualitative teaching figures remain separate from keyed full graph answers. Three v1 drafts retained after v2 refinements to arrows and labels.

27/127 targets bound (B10,C1,D16),100 pending; six focused binding/input checks, draft contracts and protection pass. Full91-test stage77 evidence retained; no new owner code. No actual learner rendering or teacher acceptance. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-population-figures/report.json`. Next: six remaining D ecology figures, then B/C figures and pending academic/source gates. Do not rerun completed `/tmp/bcd-population-svg-drafts.py` or `/tmp/bcd-population-bindings.py`.


### Stage80 — ecology figure groups

Nine original SVGs cover the six remaining D ecology targets: life-history continua/cohort survivorship, measured interaction effects, density/resource-use/mimicry comparisons, fictional population cycles, branching succession pathways and a four-condition conservation study. Two groups retain separate independently enlargable panels. Selected native slides, chapter20 physical20/22 and five existing-course concept figures were inspected. All originals and all six side-by-side sections viewed; logarithmic survival, mean-mass bars and peak lag checked. A clipped-heading screenshot artifact was resolved by fresh capture without changing the SVG.

33/127 targets provisionally bound (B10,C1,D22),94 pending. All D targets now have provisional figures; this is not full figures/rights or first-use gate closure. Six focused binding/input checks, draft contracts and fresh source/protected verification pass. Full91-test stage77 baseline retained. No actual learner course, teacher acceptance or publication. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-ecology-figures/report.json`. Next: remaining B/C figures and pending source/academic gates, production media/transaction/metadata integration, all-unit freeze, then B→C→D. Never rerun completed `/tmp/bcd-ecology-svg-drafts.py` or `/tmp/bcd-ecology-bindings.py`.


### Stage81 — gamete development and cycle evidence figures

Eight original SVGs fill seven more B targets: separate sets/copies, one-to-four spermatid sequence and differentiation, oocyte pauses/unequal divisions, separately aligned ovarian/uterine cycles, contextual feedback signs, luteal withdrawal, and a two-panel sparse-sampling/menopause comparison. Existing b-lessons02/03/06, selected chapter14 slide images and chapter16 physical26/chapter14 physical26 were natively inspected. All eight final originals and seven comparison sections viewed. Two v1 diagrams retained after v2 label/arrow corrections. Keyed full hormone-graph answers remain separate.

40/127 targets provisionally bound (B17,C1,D22),87 pending. Six focused checks, contracts and protection pass; full91-test stage77 baseline retained. All-unit gates still6/13, no actual learner candidates or teacher acceptance. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-gamete-cycle-figures/report.json`. Next: owner Video Library integration plus remaining B17/C70 figures and source/academic closure. Never rerun completed `/tmp/bcd-gamete-cycle-svg-drafts.py` or `/tmp/bcd-gamete-cycle-bindings.py`.


### Stage82 — owning media selection and Video Library

The pure whole-course assembler now renders a categorized library and inline topic clips from explicit vetted selections; the temporary raw `videoLibraryHtml` interface is removed. Current B17/C48/D15 source candidates stay unselected, with their original relationships preserved. Selected clips require caption/fact/prerequisite/pace/relevance/segment/local-equivalence evidence and exact reviewed figure mapping. The input loader pins selected review bytes. Every topic walkthrough now has a stable local target and shares its existing checkpoint with external media; no viewing-time state or duplicated response is added.

The owner player loads the native YouTube API only for a visible selected section, cues without autoplay, pauses hidden players, and opens the local option on offline/provider/API failure. Failed previews collapse rather than leaving empty space. Direct-provider/caption guidance and independently available local links remain. Mocked provider tests in Chromium/Firefox/WebKit verify segment cue, errors, script-load failure, offline local return and unchanged persisted checkpoint. All96 focused tests pass; latest5 media checks/captures pass; typecheck25 unrelated/0 owned, contracts and protection pass. An existing Chromium static-screenshot positioning race was corrected after preserving the actual focus-return assertion.

No real media selected, caption review claimed, learner HTML rendered or promotion performed. Figure coverage40/127, gates6/13. The frozen input accessor now also requires complete-author-review figure status, closing the earlier status-only gap. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-media-owner/report.json`. Next: owner production metadata/transaction/transitive closure integration and remaining B17/C70 figures/source/academic gates; freeze all3 before actual B→C→D rendering.


## Stage83 — connected production owner (2026-09-07)

The strict Pilot 2 profile now invokes the production owner after all three frozen contracts pass. The owner verifies transitive code/package/external-branding hashes, immutable source packets, branch/HEAD and all protected Unit A trees; assembles exact academic inputs; stages the browser bundle, assets and blocked metadata; validates bytes before transactional replacement. Cold source verification deliberately excludes original B/C/D workspace checks so B does not prevent the later C/D builds; the transaction separately requires the exact current target workspace. No actual candidate was rendered or promoted. No owner-closure.json has been frozen.

Generated project checks now use Pilot 2 response/collection routes, with synthetic preview save/reload/return-focus/mobile proof. Return links wait for the shell's route-change event before focusing the original activity, removing the earlier two-frame timing assumption. All101 focused tests passed; final9 browser checks passed after the final cancellation guard. Typecheck25 unrelated/0 owned; source15/member8, all original learner/protected hashes and draft contracts passed. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-production-owner/report.json`. Actual production staging/promotion and real project E2E remain unexercised pending all-unit freeze.

Next: stage84 remaining B17/C70 teaching figure targets and academic closure; D22 targets are provisionally bound. Figure total40/127, all-unit gates6/13, teacher decisions null. Computer-control tool again reports the Mac locked, so ChatGPT raster work waits for unlock while original scientific SVG/source review continues. No deployment/export/commit/push/publication/Edit.


## Stage84 — early development figures (2026-09-07)

Seven original SVG targets bound in B: functional fertilization steps(v2), two pronuclei/ploidy(v1), cleavage/morula/blastocyst(v3), IVF location/denominators(v1), hCG source/target/placental transition(v1), germ-layer tissue map(v1), and fictional developmental evidence timing(v1). Native source media, existing B08/B10/B11 figures, all seven final native SVGs and seven side-by-side sections reviewed. Earlier cleavage ring and oocyte inner-circle ambiguities were corrected before selection. Source fast-block, whole-organ germ-layer and uncalibrated hCG-curve claims are not transferred.

Totals47/127 targets: B24,C1,D22;80 pending(B10,C70).55 selected asset files;46 gallery sections. All-unit gates remain6/13 each. Ten focused binding/input/closure/project-metadata tests, contracts and full source/protected verification pass. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-early-development-figures/report.json`. No real learner HTML, teacher acceptance, export or deployment.

Continue stage85 remaining B support/development/health/technology/evidence figures, then C. Computer-control reports Mac locked; user was asked to unlock, while source-based work continues. Never rerun the completed one-shot writers `/tmp/bcd-early-development-svg-drafts.py` or `/tmp/bcd-early-development-bindings.py`; they are historical construction steps.


## Stage85 — reproductive transitions and C figure reuse (2026-09-07)

Thirteen additional targets provisionally bound: B9 and C4, using eleven newly reviewed SVG files and three exact reviewed B assets reused in C. B33/34, C5/71, D22/22; total60/127,67pending. The remaining B target is extraembryonic support membranes. C reuse retains explicit model/human count boundaries and unequal gamete timing. Source meiosis claims of entirely maternal/paternal products, universally identical meiosis-II products and interchangeable gamete/nucleus counts were not transferred. Birth v2 labels oxygen exchange explicitly. Exact P/T model observations replace an inaccurate draft paraphrase.

Eleven focused checks passed; draft contracts and full source/protected verification passed. Gallery59 sections with all local references present; batch comparisons prepared, without claiming separate inspection of every gallery screenshot. All eleven new final SVGs were natively reviewed; prior asset reviews reused. Gates6/13 each, learner candidates0/3, teacher decisions null. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-reproductive-transition-figures/report.json`.

User reports almost two weekly allowances consumed and wants execution. Avoid repeated infrastructure, complete-inventory retrieval, settings claims and full-suite reruns without a code change or unresolved concern. Continue C in coherent source batches; preserve the ChatGPT anatomy gap while the Mac is locked. Never rerun stage85 construction/binding writers, including the successful resume writer. The first binding attempt wrote only the review JSON before a tuple-index error; the resume verified it and completed the still-unmodified manifests/gallery. No course workspace changed.


## Stage86 — C cell-division figure batch (2026-09-07)

Thirteen C targets bound with eleven new original SVGs and a previously reviewed meiotic-count model reused. Packaging, fictional karyotype counts, interphase quantities, checkpoint inference, mitotic-index denominator, mitotic chromosome boundaries, cytokinesis, nonsister exchange, division comparison, variation, nondisjunction and twin origins are covered. DNA v2 removes disconnected-X ambiguity; mitosis v2 separates panel captions; twin v2 puts fertilization before zygotes and removes arrow/text collisions; nondisjunction v2 corrects singular wording. All final native SVGs reviewed. Existing real microscopy requirements remain; symbolic count boxes are explicitly the existing worked example, not invented cell images.

Totals73/127 targets (B33,C18,D22),54pending(B1,C53),77 unique selected asset files,72 gallery sections. Six focused binding/input checks and draft contracts pass; all gallery local references resolve. Last source/protection verification stage85 in this run; no learner/owner edits since. Batch comparisons prepared without a claim that every gallery screenshot was separately inspected. All-unit gates6/13; learner candidates0/3; teacher decisions null. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-c-cell-division-figures/report.json`.

User asked whether Codex or their ChatGPT browser is making the images. Clarified: these precise SVGs are authored directly by Codex; only the three earlier raster illustrations came from ChatGPT. Latest browser-control state was locked; remaining B membrane anatomy illustration is still queued. Do not claim this SVG batch used ChatGPT. Continue C reproductive strategies and inheritance targets, then molecular genetics and academic closure. Construction/binding/correction writers for this batch are complete and must not be rerun.


## Stage87 — browser restored, B figure coverage complete (2026-09-07)

User said the browser was open. Fresh CUA check succeeded, so the queued human support-membranes illustration was generated in the existing ChatGPT conversation with unchanged6Pro. Response displayed1m30s. Original1536×1024 PNG retrieved and inspected: outer chorion, inner amnion/cavity, separate yolk-sac connection and small inset allantoic extension provisionally usable. No publisher image uploaded, no image edits. B34/34 figure targets now bound; no claim that B is built.

While it generated, five precise C inheritance SVGs were authored and natively reviewed, covering eight targets through reuse. Conditional-probability v2 explicitly identifies parental paths instead of treating Aa/aA as separate unphased genotypes. Total82/127 bound (B34,C26,D22),45C pending;83 unique selected files,81gallerysections. Six focused checks pass after repairing a stale evidence-path dependency: the exact prior image-queue bytes were reconstructed with their original3d0ce1e3 hash and retained in `image-queue-reviewed-before-membranes.json`; four prior B asset references now point there. No scientific evidence was silently reapproved. Draft contracts and all source/protected checks pass. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-membranes-inheritance-figures/report.json`.

User explicitly said to keep what we have and do it correctly going forward. Preserve completed figures, use ChatGPT for new illustrative gaps, retain SVG for exact graphs/genetic grids, and avoid repeated review/infrastructure work. This is continuation authorization, not teacher acceptance. Nothing generating now. All-unit gates6/13 and actual learner candidates0/3 remain. Do not rerun stage87 construction, correction or binding writers.


### Stage88 — reproductive strategies and inheritance/mapping figures

Twenty C targets now have provisional bindings:102/127 overall (B34,C46,D22),25 remaining in molecular genetics/biotechnology. Retained reviewed work as requested. One original moss/pine image came from the authenticated ChatGPT browser (observed generation1m10s);13 precise diagrams supply exact ploidy, genotype, pedigree and map relationships. Source whole-cone haploid annotation corrected, no publisher pixels uploaded. Native review caught and fixed one arrow-label collision. Six focused binding/input checks pass; no full-suite repetition. Teacher decisions remain null and no learner candidate has been built. Next: finish the25 targets, then source/curriculum/vocabulary/media/timing/transfer academic closure, all-unit freeze and B→C→D builds. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-reproduction-inheritance-mapping/report.json`.


### Stage89 — complete provisional figure selection

All127 targets now bound (B34,C71,D22),115 unique selected assets and126 side-by-side sections. All3 figure manifests are `complete-author-review`; `figuresAndRights` passed for local blocked review, bringing each contract to7/13. Teacher choices remain null. Seventeen precise molecular/technology diagrams plus a ChatGPT-corrected expression illustration complete C. The initial image repeated exported exons and was rejected; v2 retains one three-region set. Coordinate, strand-lineage, restriction-cut, mutation-frame and full codon text-equivalent corrections were reviewed. Six focused checks and draft contracts pass; cold source/protected verification passes. No actual learner build or publication. Next: remaining six academic gates, all-unit freeze, B→C→D builds and actual-course checks. Receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-complete-figure-selection/report.json`.


### Execution stages90–92: source/local paths, first-use placement and workload

All399 slides,442 embedded assets,44 source plan rows and226 external-link relationships now have authored dispositions. All127 local walkthrough frames exactly match the reviewed worked examples and bind the reviewed figures. All80 unique YouTube candidates remain authoring references, excluded from this local candidate; no transcript/caption-review claim or provider downloads. Eight C enrichment slides map to qualified optional Advanced explanations. Source and local-path gates pass.

The all-surface first-use pass moved73 definition placements earlier (including11 grouped-panel follow-ups); definitions/core paragraphs, keys and saved response identities are unchanged. Different senses such as birth delivery versus duct transport and experimental control versus cell regulation remain explicitly distinguished. Scoped delta receipts retain earlier reviews rather than silently repinning changed bytes. Remaining-surface/dependency and actual rendered first-use proof still pending.

Workload review counts actual core/definition/figure text and all comparison panels at a planning140 words/minute plus2 minutes per panel, with100/180 sensitivity. Existing route minutes reallocated from revisit/evidence windows where needed; required4500 and optional900 total minutes retained. Advanced is optional, initially closed and non-gating. These are authored pacing estimates, not observed learner timings. A first run found no revisit minute in C chromosomes and stopped; final allocation takes its one minute from the18-minute evidence window. Initial B allocation was saved before that stop; final input hashes pin its corrected allocation.

Now10/13 gates pass per unit; actual learner candidates0/3. Stage90 media/input tests8/8; draft contracts pass throughstage92. No owner code, learner workspace, protected A, acceptance or publishing change. Evidence: all-unit-source-and-local-paths.json, all-surface-first-use-placement-review.json, group-panel-first-use-placement-review.json, authored-workload-and-advanced-review.json under pilot2/source-review/. Continue atomic curriculum proof, remaining vocabulary surfaces/dependencies and transfer rules, then all-unitfreeze and B→C→D.


### Execution stages93–95: actual B/C/D local courses complete

The user explicitly directed ending broad review because of time and usage. Reused existing reviews to close the remaining provisional contracts, read all136 criteria against127 required core parts, restored the missing ovarian-puberty comparison, and synchronized exact skill-data targets/outcome declarations.73 earlier vocabulary placements and159 transfer rules are recorded. All3 contracts are frozen with13/13 authored gates and80 transitive owner files. This is not teacher acceptance.

**Actual learner candidates:3/3.** B8topics/65practice, C18/132, D4/52;43 required routes,127 figure targets. Built through the owning builder in B→C→D order. Actual C build exposed null continuation-page handling; corrected the renderer without changing source textbook assignments. Native mobile views exposed logo/progress overlap; added a Pilot2-only header grid. Unit A/shared shell source untouched.

Final actual project E2E: B,C,D each1/1 pass. Workspace checks3/3 pass. All172 route/viewport checks at1440/1024/390/720 CSS pixels pass with no broken images or document overflow. Fresh network-offline local-file launches3/3 pass. Exact rendered required prose, definition placements, declared academic targets and required practice IDs pass. Typecheck retains25 unrelated/0 owned diagnostics. Doctor intentionally rejects blocked/proposal-only status; no Studio Edit workaround. Teacher acceptance, native browser zoom UI and LMS/release verification are not claimed.

Report: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-actual-courses/report.json`. Per-unit `meta/pilot2-teacher-review.md` and `pilot2-review.json` record exact candidate SHAs. Local previews: http://127.0.0.1:4180/b/ , /c/ , /d/ . Offline workspace index files also work. Stop broad review; next work should address a specific learner/teacher finding or an explicitly requested release workflow. No commit, push, export, deployment, publication or Studio Edit.


## Stage97 — Repair Unit A presentation and organization transfer (2026-09-07)

The stage96 user finding was correct: the generic shell and separate B/C/D topic renderer did not carry final A's presentation forward. Replaced that boundary inside the B/C/D owner with A's actual presentation CSS/fonts, five navigation groups and chapter subdivisions, question-led overview/route map, lesson goal/prerequisite/timing/textbook/anchor-word opening, and teaching-before-retrieval sequence. Added A-style vocabulary search/filter and concept reader, model/investigation readers, textbook library and source credits. Existing B/C/D content, figures and state identities remain intact. Fixed saved-work return focus to reveal the reader before focusing its response. Studio's progress hook and numeric status are preserved.

Built B→C→D through the owner. Final project E2E and workspace verification pass for all three; 11 focused tests pass; all-unit browser regression passes with 244 route/width checks, vocabulary unlock, collect/save/reload/return, models, textbook and mobile menu. Compared A's actual rendered fonts/layout and inspected the real local candidates. All 127 core paragraphs and 825 indexed activities retained. Protected A baseline checks pass. Typecheck retains 25 unrelated diagnostics and no touched Biology diagnostics. No images regenerated, broad source-review restart or release actions. Teacher acceptance remains null.

Evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-a-presentation-repair/report.json`. This supersedes stage95's claim of presentation completion. Technical feature mapping alone must never be used as proof of A presentation transfer: compare the actual reference overview, lesson opening, vocabulary and model surfaces. Keep the current candidates and respond to specific findings; do not initiate another general review cycle.


## Stage98 — Correct Practice & Review, Process Collection and Resources

The user identified remaining hub differences after stage97. The repair now matches A's menu children, embeds the optional challenge in Final Practice and investigations/notes in Process Collection while preserving each original route and response ID, and transfers the actual practice/seminar, collection, Advanced, model, textbook, glossary and Sources page structures. Chapter/type collection filters, synchronized Advanced checklist, textbook group attempt-before-guide and chapter tabs/mobile selector work. Sources is a presentation-only route with no saved fields. Empty recovery versions remain stored but no longer create blank collection records. Existing B/C/D academic content and authored question types remain intact; no images regenerated.

Final B→C→D builds pass workspace and actual Studio project E2E checks. Seven focused static tests plus four owner/protected preflight tests pass. Browser regression covers note/Frayer save/reload, checklist synchronization, model test, textbook tabs and attempts, embedded challenge, exact work return and 292 route/viewport checks. Actual native views compared with A. Teacher acceptance, fresh offline launch and native browser zoom are not claimed. Typecheck retains 25 unrelated diagnostics and no touched owner/test diagnostics. Evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-a-hub-repair/report.json`.

Do not use top-level menu names or a small sample of hub headers as proof that all subordinate structures transfer. Check each actual reference subsection. This was completion of the reported repair, not authorization to restart source review or images.


## Stage99 — Restore original PowerPoint videos and vocabulary behavior (2026-09-07)

The user identified that Core Vocabulary still behaved differently and original PowerPoint videos were absent. The earlier blanket reference-only disposition had excluded all80 unique source videos. Restore these original optional resources through an explicit source-library lane while retaining the existing reviewed-clip gate; provider metadata is not caption/science/playback acceptance. B17/C48/D15 original links are present in chapter/slide order, with native players, connected lessons, original direct links and local walkthrough links.77 metadata checks succeeded;3 original links remain marked unavailable. Ten title/topic connections were corrected, and the combined Chapter19-20 deck is grouped using its lesson chapters.

Vocabulary now has Add/Remove collection and Compare/Hide model controls, preserves the active concept on reload and retains collected work during valid edits. Existing response IDs, fixed/choice requirements and scoped clear safeguards remain. State version3 gains only an optional active-concept field; maximum ordinary/Unicode payload tests still pass. Final B/C/D workspace and project E2E checks pass, final13 focused checks pass, and actual player offline/navigation lifecycle checks pass. A reference and protected owner/learner trees remain unchanged; teacher acceptance is null.

Process correction: compare A's control state transitions and source-resource inventory, not just section labels or feature presence. A pending optional-media review must not silently produce an empty library when the supplied original links are requested. Do not present restored source links as newly vetted equivalent clips.

Evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-vocabulary-source-videos/report.json`. Owning source: `scripts/lib/biology30-course/v1/pilot2-source-videos.ts`, vocabulary/control/state modules and the per-unit link dispositions. No image generation or release action.


## Stage100 — Content uses reclaimed sidebar space (2026-09-07)

User requested that content move with the sidebar and use all available space. The copied A CSS still capped frames at1120/1200px, leaving large margins on wider screens even though the sidebar margin moved. BCD presentation adapter now sizes the course frame to100% of its main container in expanded, collapsed and mobile states. Normal gutters remain. Only the owning adapter CSS changes; no protected A, content or saved-state changes.

Final all-unit sidebar/width regression, all3 workspace checks, all3 project E2E checks and4 owner/protected-baseline checks pass. Evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-sidebar-content-width/report.json`. Future sidebar checks must measure actual content width/position on a wide viewport, not just whether the navigation hides.


## Stage101 — Embed original videos in teaching lessons (2026-09-07)

The user asked whether videos were inside the lessons as they were in A. Inspection showed stage99 added lesson links only. Corrected through the owning renderer: every original mapped PowerPoint video is now embedded after teaching and immediately before the existing walkthrough/checkpoint. Header links jump to inline players; library remains one entry per video. No duplicate saved work, new required-video flag, or unearned caption/science review status.

All-unit exact source/placement checks and protected owner checks pass (5/5), actual B/C/D inline-player/header-jump/library-handoff tests pass, and all3 final workspace/project E2E checks pass. Evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-inline-powerpoint-videos/report.json`. Process lesson: verifying the library and lesson links does not verify inline instructional placement; inspect both.


## Stage102 — Advanced Learning spacing (2026-09-07)

User browser comments showed missing outer padding and cramped lesson headings/activity rows. Restored desktop/mobile gutters, widened the heading column and added container-based stacking through the BCD presentation adapter. Academic content, checklist keys and return links unchanged.12 all-unit width/spacing checks, checklist reload/lesson return,4 owner/protected checks and all3 workspace/project E2E runs pass. Evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-advanced-spacing/report.json`. Preserve the page gutters when adapting A hub content.


## Stage103 — Models and Data Lab investigation process (2026-09-07)

User identified that the lab still looked and felt different. Replaced the generic dropdown/form presentation with A chapter navigation, source-grounded investigation orientation, case buttons and distinct Predict/Test/Explain/Save panels. Predictions require a case; explanations require tested evidence. Existing9 BCD models, calculations, datasets, plots and saved-state IDs retained. Base-support text comes from each lesson; standalone investigation procedures referring to other materials are not copied into the model.

All9 actual model workflows and mobile checks pass,3 browser component tests pass,9 owner/science tests pass, and all3 final workspace/project E2E runs pass.25 unrelated baseline type errors, zero pilot2 diagnostics. Evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-model-lab-process/report.json`. Compare actual control states and instructional organization when transferring A, not only hub names. This preserves subject-specific BCD models and is not a claim that every A-only simulation feature or model count is identical.


## Stage104 — Core learning level and scaffold repair (2026-09-07)

User asked whether BCD matched A's carefully developed learning level, then authorized the targeted correction. Comparison found32/127 core blocks above Grade12 despite passing lesson averages. Revised those32 plus C's probability-rules block: B7/C21/D5. Keep complete required mechanisms, examples, qualifications, source mappings and teacher topics; do not cut broad topics to A's word count. Break dense sentences into clear causal steps. C conditional probability now develops the unconditioned set before removing outcomes; D explicitly works the conditional denominator. Expand the B hormone-graph, C combined probability and D Hardy-Weinberg examples and synchronize their local walkthroughs. Assessments, keys, state IDs and optional content remain unchanged.

The owning instruction audit now checks every core block (grade<=12, average sentence<=20 words, paragraph<=100 words). Regression proves easy prose cannot dilute a dense block into a pass. All127 blocks pass; lesson ranges B8.8–11.2, C8.0–10.7, D9.6–10.3. These are diagnostics, not comprehension certification.17 focused tests pass, all3 workspace/project E2E checks pass, six desktop/mobile screenshots inspected. Typecheck retains25 unrelated baseline errors; protected A exact. Before-input copies, narrow academic/owner delta receipts, updated all-unit contract pins and exact final hashes are recorded in `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-learning-level/report.json`.

Transfer lesson: match A's actual explanation sequence and intermediate reasoning, not merely component presence or whole-lesson averages. Keep first-use vocabulary and complete required scope. Review dense parts independently. Broad-topic pacing remains a student/teacher judgment; this targeted repair does not certify every remaining passage or Advanced explanation as newly reviewed.


## Stage105 — Optional-completion label spacing (2026-09-07)

Review-set request initially targeted C; user explicitly extended to B/D. Native inspection found the inline completion checkbox row against the Advanced disclosure bottom divider. Owning presentation CSS now uses a44px minimum row,16px top/20px bottom margin,10px gap and20px checkbox aligned with the first wrapped line. Applies to all127 BCD labels; content, IDs and saved-state behavior unchanged.5 focused owner/protected/browser tests and all3 workspace/project E2E checks pass. Six final desktop/mobile screenshots inspected. Requested C doctor returns only expected not-active for the intentionally blocked review course. Evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-c-optional-label/report.json`. Preserve explicit unit scope until the user extends it; do not equate a blocked Studio edit map with missing generator ownership.
