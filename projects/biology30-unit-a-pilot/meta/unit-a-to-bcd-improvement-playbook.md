# Biology 30 Unit Improvement Journal and B-D Transfer Playbook

## B/C/D execution restart — 2026-09-06

The user has now supplied the B/C/D originals and requested a fresh-task handoff. Read the [complete B/C/D rebuild plan](../../../docs/plans/biology30-bcd-pilot2-rebuild.md), [verified intake manifest](./bcd-rebuild-intake-manifest.json), [handoff checkpoint](./bcd-rebuild-handoff-checkpoint.json), and [copyable next-task prompt](../../../docs/ops/biology30-bcd-next-task-prompt.md). These are the current continuation records; this playbook remains the detailed history and procedure source.

**Current authority:** use final Unit A provisionally, without marking it accepted; preserve the teacher's named B/C/D topics; derive unit-specific practice; build complete B, then C, then D without representative-slice approval pauses; use scientifically checked provisional image choices and later batch teacher comparisons. This separate authorization supersedes earlier wait-for-complete-A-acceptance wording only for starting the B/C/D rebuild. It does not transfer acceptance, waive source/science gates, or authorize release.

**Current availability:** fifteen supplied originals match their pinned hashes; eight textbook members are located and checksummed. The intake manifest supplements the older generated `bcd-material-readiness.json`, whose archive/notes-only stage predates the supplied standalone decks and daily plans. Do not ask for those originals again. Complete per-slide/per-item dispositions, curriculum mapping, caption review, rights decisions, normalization and frozen unit contracts remain future preparation work; neither record may be marked build-ready merely because a file exists.

**AI operating policy:** Astra High / Standard is the main setting. Medium is for separately configured bounded routine work. Max requires approval for a named escalation. Instructions do not change the actual task setting. Preserve verification quality; use deterministic scripts and saved checkpoints to avoid repeated context loading. No paid API fallback or credit reset is authorized.

**Environment:** use the existing local checkout, not a clean worktree/clone. Important work after Git checkpoint `2ad72ec06b104c589f91e4b5afb8d86c322bc168` is uncommitted/untracked. This cycle writes documents only; B/C/D source/learner files and all A learner files remain unchanged. See restart journal entry 37 below.

This is the canonical human-readable record and repeatable operating manual for the Biology 30 Unit A improvement pilot. It preserves the exact process for later adapting accepted improvements to Units B, C, and D: inputs, checksums, commands, source ownership, learner-page mechanics, ChatGPT Images prompting, Canvas Helper review, scientific corrections, failure handling, evidence, approvals, and handoff requirements. It is a chronological decision journal plus an operational runbook, not a raw transcript. Machine-readable facts remain in the linked contracts and ledgers.

Use this file in two ways:

- Read the **rolling transfer index** to see which ideas exist and whether the teacher has accepted them.
- Follow the **complete repeatable operating procedure** when performing another improvement cycle or adapting an accepted rule to B, C, or D.

If this playbook and a machine-readable contract disagree, stop. Verify the current workspace and update the stale record; do not guess which one is current.

## Current production recipe

Updated 2026-09-06. The complete online authoring candidate is assembled for one final full-build review. **Teacher academic clearance is not yet recorded.** Earlier audit findings and failed approaches remain in the chronological journal; the exact technical record below determines which checks passed.

Start with these records:

- [One complete-build teacher clearance checklist](../../biology30-unit-a-pilot-2/meta/final-clearance-review.md).
- [Online implementation and sources](../../biology30-unit-a-pilot-2/meta/online-finalization.json).
- [Current academic targets and all-item review](../../biology30-unit-a-pilot-2/meta/final-academic-review.json) and [Final Practice weighting/demand](../../biology30-unit-a-pilot-2/meta/final-practice-blueprint-review.md).
- [Historical corrections](../../biology30-unit-a-pilot-2/meta/academic-corrections.md) and [source review](../../biology30-unit-a-pilot-2/meta/remaining-academic-review.md), preserved against their own immutable builds.
- [53-rule transfer contract](./biology30-improvement-transfer-contract.json), [B/C/D materials readiness](./bcd-material-readiness.json), and [exact-build verification and limits](../../biology30-unit-a-pilot-2/meta/final-academic-verification.json).

### Checkpoint and current candidate

- Git checkpoint: `2ad72ec06b104c589f91e4b5afb8d86c322bc168`, branch `codex/studio-direct-editing-v1`, parent `98f481b06ce304ccc79e236f3b45b6ffcd99bb41`.
- Checkpoint learner SHA: `219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc`.
- Current online-finalization learner SHA: `ab82b791d0bc771a522c6bd2d88c97a2f28e5ecaa0add9d69cb32a1be580c105`; workspace-tree SHA: `f9b0f45627d8deba6bc4bb72c9608c1ff3a2d0252272c8187e4f58a82444807d`. The preceding `f39669f0...` build and contracts are immutable under `raw/online-finalization-baselines/<full-sha>/`.
- The pre-correction learner SHA `21363490e611251c01101cee0bc5925583d1b856b8285a87ee74838ddd1341e5`, tree `e9f39a3171ec6365fdd90863a268b0383e065d95efd64b1915d410a57f02c59a`, HTML and reviewed contracts are immutable under Pilot 2's `raw/academic-correction-baselines/<sha>/`. The historical source review still binds to these bytes.
- The pre-Chapter-11 candidate `b669aaadd6d4f08626f0476778e53a46e3cde8fd5f2a48cb3a979edb82d72652` is preserved under Pilot 2's `raw/chapter-11-academic-baselines/<sha>/`. The [Chapter 11 repair contract](../../biology30-unit-a-pilot-2/meta/chapter-11-academic-repair.json) records the six new study tasks and their source/evidence mappings.
- The checkpoint captures 317 scoped Biology files, including Pilot 2 authored inputs and learner assets, Pilot 1 reference content, build libraries, tests and this record. It is a local recovery point, not a push, deployment, source-archive backup, or proof that unrelated dirty dependencies are versioned.
- Source ZIPs, teacher-source DOCX files, runtime captures, review ZIPs, numeric duplicate files and unrelated changes were excluded. Preserve checksum-addressed source archives separately; Git alone is not a complete source-material backup.
- A stale Git index lock from September 3 had no open process owner. It was moved, not deleted, to `/tmp/biology30-checkpoint.VYXgTY/stale-index.lock` before the commit.
- The pre-audit learner file and review metadata are also preserved under Pilot 2's `raw/final-academic-baselines/<checkpoint-learner-sha>/`. The baseline is `changes-requested`; historical slice approvals keep their original scopes.
- No current complete-course teacher decision has been recorded. Pilot 1, production Units A–D, exports and deployment state remain unchanged.

### Final Unit A work queue and actual completion criteria

The finishing pass resolves the previous 35 overlapping implementation-gap records to named online tasks. These are not counts of mastered outcomes. Source classification remains 47 acceptable examples, five excellence examples and one local criterion. The minutely reproducible process, source decisions and failure handling are in journal entry 36.

| Area | Current candidate | Final review boundary |
| --- | --- | --- |
| Identification | Six Chapter 11 study tasks, five saved eye/ear/gland/hormone/imbalance matrices and real prepared-tissue observation. | Digital observation is not microscope handling; inspect instructional usefulness. |
| Inquiry and communication | Three complete supplied-data investigations with variables, comparisons, calculations, limitations, frames and revision. | Independent comparison does not certify actual collaboration or physical performance. |
| Required media | Fourteen full-width three-panel paths (42 illustrated sections), worked cases and model links; all fourteen full caption texts reviewed and focused excerpts selected. | Review clip usefulness and visuals; complete original videos are not endorsed. |
| Assessment | All 86 preserved items have exact concept operations and source/outcome connections; graph/inquiry evidence stays separate. | Final-core weighting is 6/3/7/2, not original 6/4/6/2. Teacher accepts the preserved balance or requests a versioned replacement. |
| Verification and clearance | Current command, visual and protected-tree checks bind to the current SHA in final-academic-verification.json. One final teacher checklist replaces more slice pauses. | Teacher decision remains null; tests do not grant learner release, observed mastery or live LMS certification. |

Keep the user's decision order: remap first, replace one-for-one second, then add a necessary skills task if neither can demonstrate the operation. Never attach an old answer to new meaning. This finishing pass preserves every question meaning/key and old response limit. Five compact matrix strings and one 260-character observation use the existing schema-6 responses map. Maximum ordinary-length fixture: **42,738 characters**, at most 79 persisted response fields, leaving 1,262 below the 44,000 target. Arbitrary escaping/Unicode may still invoke the existing last-valid-state guard. All My Work remains 178 parents with child studies inside their existing model records.

Times remain 1,505 required / 295 optional minutes. Reading/video/task calculations are planning estimates, not observed student workload. The hosted review was not redeployed or certified in this finishing pass. Do not infer that it matches the exact local review candidate.

### Inputs to collect once for B, C and D

The two shared Brightspace archives and five B–D notes PDFs were checksum-verified again by `audit:biology30-improvement-transfer`. The old source catalog already contains day/topic ordering and learner-visible review candidates. **Do not ask the teacher to supply everything again.** Locate these candidates first and ask only for missing or current replacements.

| Unit | Existing blocked baseline | Notes already present in the class archive | Material still needing confirmation or intake |
| --- | --- | --- | --- |
| B: Reproduction and Development | 14 lessons; 86 practice items; 8 artifacts | Unit B Reproduction and Development Notes (1).pdf, 75 pages | Current Chapter 14–15 daily/review plans or confirmation of archived sequence; original editable decks; approved chapter PDFs; complete learner-authorized review guidance; video/caption inventory; reproductive-model and investigation requirements. |
| C: Cell Division, Genetics and Molecular Biology | 24 lessons; 160 practice items; 12 artifacts | Cell Division, 79 pages; Mendelian Genetics, 114 pages; Molecular Genetics, 59 pages | Current Chapter 16–18 sequence/decks; chapter PDFs and reviews; microscopy/cell-cycle and genetics data tasks; pedigrees/crosses/molecular diagrams with accuracy checklists; unit-specific videos and captions. |
| D: Population and Community Dynamics | 11 lessons; 72 practice items; 6 artifacts | Population Dynamics Student Notes, 68 pages | Current Chapter 19–20 sequence/decks; chapter PDFs and reviews; population sampling/growth/Hardy-Weinberg datasets and worked calculations; graph conventions; video/caption inventory. |

The per-unit JSON lists archive candidates with locators and distinguishes **hash verified**, **present but unaudited**, and **not yet supplied as verified standalone material**. An external launcher or a notes PDF is not proof that an original PowerPoint was inspected. A chapter answer-key title is not proof that the corresponding textbook PDF is available. Do not infer printed/physical PDF offsets from Unit A.

Prohibited learner inputs remain secure tests, hidden assessments, teacher-only quiz/exam keys, credentials and broken LMS launchers. Learner-authorized textbook guidance is a separate category and requires factual/rights review before native rewriting. Do not output whole teacher keys.

### One-pass build procedure after intake and Unit A clearance

“One pass” means **one coordinated full-unit implementation followed by complete review**, not an unverified single generation. The user chose no representative-slice pause for B–D. Resolve missing source and contract decisions before generation, then build the whole approved unit through its owner. Final teacher acceptance is still required separately for B, C and D.

1. **Freeze inputs.** Read this recipe, the two ledgers, the exact Unit A acceptance and the target unit contract. Record branch/commit/dirty state and protected trees. Hash originals. Preserve source archives; stage extraction transactionally. Name every archive member/deck slide/PDF page and every exclusion. Reject changed hashes, unsafe paths, missing sources and duplicate IDs.
2. **Resolve teacher order and curriculum depth.** Map every daily-plan row and slide into the target unit sequence. Inspect the actual standards columns, not just extracted text; label acceptable examples, excellence examples and local criteria separately with exact page/column references. Examples are illustrative, not an exhaustive or independently mandatory checklist. Break required outcomes into atomic explanations, prerequisites, visuals, worked examples, assessment/skill outputs and saved evidence. Retain excellent deeper content through a named optional destination. Record every old section's retain/rewrite/move/exclude decision and reason.
3. **Author readable instruction.** Write complete explanatory sentences, not slide fragments or technical shorthand. Keep the accepted accessible style and bold the first meaningful term use. Introduce each dependency before using it to explain another idea. Keep four anchor families plus a complete new/reused inventory. Attach term links to actual static passage targets. Teach, check, model, work an example, then retrieve, practise and collect evidence.
4. **Build textbook/review maps.** Inspect printed folios and physical pages independently. Choose the document and page per item, including every mixed final question; reject negative, zero, non-integer or out-of-range physical pages. Read the actual referenced explanation: valid arithmetic is not relevance. Label limited support as background and provide an exact corrected local-teaching link. Extract approved PDFs at original quality. Put chapter assignments/native guides before course questions and the unit review before final core questions. Keep attempt flags separate, answers initially collapsed and focus movement correct. Reuse no Unit A page, offset or Q range without a target-unit source.
5. **Select source imagery.** Extract original embedded media at native size, not screenshots of whole slides. Compare current figure, source PPT/PDF figure and need for an original replacement. Choose only scientifically correct, legible, rights-cleared material. Use semantic HTML/SVG for dense labels, graphs and pathways. Preserve model interactions when they teach more than a static plate.
6. **Run the ChatGPT Images process when there is a real gap.** Write the scientific/misconception checklist first; then write composition, labels, level, contrast, aspect ratio and visual-style requirements. Provide the approved reference only when needed. Generate one candidate, inspect every scientific label/arrow, request narrow corrections, and download the full-resolution result. Store the exact prompt/revision/provider/checksum locally. Build the authoring-only side-by-side view, have the teacher select the winner, and record that decision separately. Add alt text, adjacent long description/equivalent table, responsive intrinsic dimensions, keyboard enlargement and focus return. Inspect inline and enlarged views, then remove only the superseded *visible* figure. Keep provenance and old candidates in the authoring record. Never expose private ChatGPT links or claim an earlier image decision approves a new context. The detailed worked procedure and prompt history remain in Phase 6 and the linked image-generation/teacher-decision records below.
7. **Review every video disposition.** Extract YouTube and other links from decks and notes; preserve duplicates as source relationships but deliver one canonical entry. Record include, supplementary, exclude or unavailable with a reason. Review transcript facts, captions, pace, relevance and segment duration. Place the selected preview automatically when visible, with no autoplay or custom Play button. A required learning step offers a complete local illustrated path and the same checkpoint; the broader library remains supplementary. Recheck blocked-network use and all exact lesson/library links. Never download YouTube files.
8. **Author practice and skills evidence.** Write each key, plausible distractors using introduced terms, choice-specific feedback and exact source/local links. Check the rendered correct-position distribution; visible order is not a stored answer ID. Match a question to the *operation* required: identify, label, draw, calculate, compare, design, perform, interpret or communicate. A recognition question cannot prove a practical skill. Preserve IDs and values only when their meanings remain equivalent. Give changed wrong-choice meanings fresh values, retaining old meanings/feedback for saved work; version materially changed prompts or keys. Test old drafts, submitted answers, reload, new attempts and Process Collection before release. Scaffold complex investigations with safe procedures, supplied-data/accommodation paths, variables, worked starts, sentence frames and non-diagnostic limits.
9. **Build vocabulary, models and collections.** Select target-unit concept families from recurrence/curriculum/mechanism/morphology, not glossary size. B≈30/C≈42/D≈24 are planning budgets, not inventories. Write meaningful word-part cautions and all model Frayers before enabling choices. Use Predict → Test → Explain → Save for models with an explicit purpose, comparison and evidence cue. Derive All My Work from existing responses through one allowlisted registry. Include the task, retained response, honest status, feedback and exact return link; use the same complete formatter for copy/print even when filtered.
10. **Finish advanced learning.** Re-audit old content for curricular depth, not difficult prose. Add appropriately placed closed disclosures and an independent optional checklist. Use exact model links where useful. Make deeper thinking accessible; never make it a hidden prerequisite for required questions. Set unit-specific optional minutes and manifest size rather than copying Unit A's forty flags.
11. **Integrate through the owning builder.** B–D changes belong in `scripts/lib/biology30-course/v1/` and unit production records under `projects/resources/biology30-production/v1/units/`. Do not paste Pilot 2 HTML into generated workspaces. Preserve the existing Next Step shell, responsive course collapse, unit-scoped IDs, state budget and blocked authoring status. Stage the entire candidate and promote only after validation. No generic Science factory or Studio Edit enablement is implied.
12. **Audit, repair and review the complete unit.** Run structural tests and then independent academic/item review; neither replaces the other. Exercise all routes and states offline, with keyboard, desktop, tablet, mobile and 200% zoom. Inspect every contact sheet, including expanded answers, first-use links, populated collections, failed saving, video/local paths and figures. Recompute exact hashes after any fix. Hand the teacher the complete candidate, issue-resolution matrix, open risks and evidence. Record acceptance only for the exact build they accepted.

### Owning-builder gap brief

The existing B–D builder renders its own course contracts, glossary, practice, artifact and suspend-data systems. It does **not** become Pilot-2-equivalent merely because it can render a course. Before the target-unit implementation, extend its explicit unit content/contracts and renderer to support the accepted chapter-review routes, exact PDF selection, video/local checkpoints, gradual core vocabulary/Frayers, evidence-producing models, unified Process Collection, and optional advanced manifest. Reuse tested behaviour, not Unit A text, IDs or hard-coded counts. Keep unit-specific scientific data in the target content records. Implement migrations with fixtures for the existing B, C and D saved-state formats; test last-valid-state recovery and truthful local/LMS writes independently.

No B–D builder changes were made in this documentation/audit cycle. The production entrypoints remain `build:biology30-course`, `test:biology30-course-production`, `audit:biology30-course-production:visual`, project E2E, workspace verification and course doctor. Their current contracts must be extended before those commands can prove the new patterns; a passing old suite cannot certify a feature it never exercises.

### Record-update commands and evidence rules

```bash
npm run build:biology30-unit-a-pilot-2 -- \
  --project biology30-unit-a-pilot-2 \
  --gate final-academic-review \
  --baseline-workspace-sha 219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc
npm run audit:biology30-improvement-transfer
npm run audit:biology30-improvement-transfer -- --check
npm run test:biology30-improvement-transfer
```

The new audit command writes only the two operational transfer/readiness JSON files beside this playbook. `--check` verifies them without changing them and rejects stale current hashes, rule counts or materials. Every rule has an explicitly authored procedure mapping: an unfamiliar rule fails rather than being categorized by a guessed keyword. Primary evidence links, individual implementation paths, and resolved B/C/D owning files must exist. Combined legacy owner descriptions are split into individual paths; they are not treated as one filename. The command verifies archive/note checksums without extracting teacher-only content into learner files. It does not implement B–D.

After a future change: verify the pilot → append the dated journal → update the ledger → regenerate the transfer/readiness records → bind new evidence to the exact SHA → update this current recipe and handoff. Never trim a Markdown file at a historical heading and discard everything below it. Generated current sections have bounded replacement; dated entries are append-only. Rejected or superseded work remains visible in history. The teacher must explicitly accept a complete Unit A pattern before it can authorize B–D adaptation.

Authority recheck on 2026-09-05: Alberta's [diploma support page](https://www.alberta.ca/writing-diploma-exams) still linked to the [2025–2026 Biology bulletin](https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf). The [Program of Studies](https://education.alberta.ca/media/159727/bio203007.pdf) and [performance standards](https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf) remain the content/skill references. Recheck at release; do not infer a newer subject-specific bulletin from a general bulletin's date.

## Current state

The Pilot 1 facts below remain its protected baseline. For Pilot 2 and future B–D execution, the **Current production recipe** above supersedes earlier procedural instructions in the chronological journal. Historical slice pauses and old "complete coverage" claims are retained as history, not renewed instructions or academic clearance.

- Last updated: `2026-09-05`
- Pilot: `biology30-unit-a-pilot`
- Pilot status: `blocked`, preview-only, Studio Edit disabled, and non-exportable
- Ledger status: `stage-2-core-vocabulary-awaiting-teacher-review`
- Protected production-candidate baseline SHA-256: `4908245ee9e176d647e0f927e1fc3f7db99009a8b50ec7e8ec9a86708a6524f0`
- Initial pilot workspace-tree SHA-256: `e89fcf0e78207c0320886bd772192c2a096bb6d6e4c19891ef48d0bce99fbfea`
- Current workspace SHA-256: `b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee`
- Current workspace-tree SHA-256: `61396aee1fec5e4c35fd408a2629ca05abda82df584a2db47e46444c37e361dc`
- Prior full-pilot exact-build visual report: `.runtime/biology30-unit-a-improvement-pilot-visual-audit/2026-09-02T18-48-28-003Z/visual-audit.json`
- Prior full-pilot visual-report SHA-256: `4d002a34999c78cfa6286e7813197d1a94e728b9fab52777b88056b434b8fbb8`
- Accepted Stage 1 slice report: `.runtime/biology30-unit-a-core-vocabulary-pilot-visual-audit/2026-09-02T20-18-11-917Z/visual-audit.json`, SHA-256 `fabd5a6a9fbd4fcbf85ef4b14a9817254c9bd7f256c0f60c6b1487c6cadf9c97`
- Current Stage 2 Core Vocabulary visual report: `.runtime/biology30-unit-a-core-vocabulary-pilot-visual-audit/2026-09-03T01-08-03-419Z/visual-audit.json`
- Current Stage 2 visual-report SHA-256: `6fac8fd887e27509bc4f0183ecbabaea9496396af928c11a516c439e36ed6db0`
- Stage 2 contact sheets: 7, all opened; 84 concept-entry viewports, 30 learner-state viewports, 51 Word Lens viewports, two zoom views, and zero automated geometry findings
- Core Vocabulary Stage 1: explicitly teacher-accepted on `2026-09-02`; Stage 2 is complete and awaits exact-build teacher review
- Pilot 1 teacher acceptance of the exact integrated build: pending
- B-D rollout: deferred until Unit A acceptance; no rule has transferred
- Pilot 2 experiment: `biology30-unit-a-pilot-2` is a separate, blocked topic-sequence rebuild. Its representative Gate 1, teacher-feedback Revision Gate A, and Advanced Learning Bridge Gate A slices were explicitly accepted. Advanced Bridge Gate B provides all forty adjacent higher-level blocks and remains unaccepted at its preserved exact build; a separate contained Process Collection Index candidate now awaits review.
- Pilot 2 accepted Gate 1 workspace SHA-256: `8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe`; workspace-tree SHA-256: `a2f5dd4ff3cf3d2806949e4075b8e498ae102a309414d5f5d82489eca737d481`
- Pilot 2 initial full-course Gate 2 SHA-256: `9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7`; status: `changes-requested`
- Pilot 2 accepted Revision Gate A workspace SHA-256: `3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff`; workspace-tree SHA-256: `b341400a305ec5c2ba75aba322d58d07ed500ba4642388c4bece03a9c2e17cbc`
- Pilot 2 pre-bridge Revision Gate B workspace SHA-256: `912a213fd62e503b99d9c42f28b1094f8a4f4e31d9772513013adbc02ef4707e`; workspace-tree SHA-256: `f3ae4822477fe3165023e82d3f96eb0476a1a2e7fb2fbde9cf57cb9a3c6cbf41`; status: `changes-requested` and preserved as the strict Advanced Learning baseline
- Pilot 2 accepted Advanced Bridge Gate A workspace SHA-256: `3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6`; workspace-tree SHA-256: `eb0b44eaa35352347d4e5658749527f860d690a7383468672f14d06acd193bcb`
- Pilot 2 preserved Advanced Bridge Gate B workspace SHA-256: `11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c`; workspace-tree SHA-256: `5ea60d70eb152639be5644965c98c566349a64ff924310016f23cf531094feef`; status: `Codex-verified`, `teacherDecision: null`
- Pilot 2 pre-audit Process Collection Index workspace SHA-256: `219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc`; workspace-tree SHA-256: `bf5de61f7b01bd8431b853c53d4468b30baf790007bc64e21201290f918f0dc6`. Preserved as `changes-requested` in the final academic baseline. Historical toolbar screenshots are in `/tmp/bio-collection-fit-nSOYY1/`.
- Pilot 2 current online-finalization workspace SHA-256: `ab82b791d0bc771a522c6bd2d88c97a2f28e5ecaa0add9d69cb32a1be580c105`; workspace-tree SHA-256: `f9b0f45627d8deba6bc4bb72c9608c1ff3a2d0252272c8187e4f58a82444807d`. Implementation gaps are mapped in `online-finalization.json`; `teacherDecision: null`. Final Practice weighting remains an explicit teacher-review decision.
- Pilot 2 current state schema: version 6; ordinary worst-case estimate 42,738 characters across at most 79 persisted response fields. Five compact study responses and one observation were added; all old limits remain. Target 44,000; guard 48,000.
- Pilot 2 preserved Advanced Bridge Gate B visual report: `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-04T21-20-16-003Z/report.json`; 81 route captures, 140 state captures, all 30 contact sheets opened, and zero geometry findings
- Pilot 2 historical Process Collection Index visual report: `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-05T03-25-55-745Z/report.json`, SHA-256 `612fe1b33f466d3404276c357a6991240e90b467ce2bd2bc479978ab0b082d3a`; 81 route captures, 140 state captures, all 34 contact sheets opened, and zero geometry findings. It is not evidence for the new academic-review SHA.
- Pilot 2 current visual/command evidence: [final verification](../../biology30-unit-a-pilot-2/meta/final-academic-verification.json) names the exact SHA-bound report and manual inspection. Earlier 38/39-sheet academic reports remain historical, not clearance of this candidate.
- Pilot 2 current review status: one complete online candidate awaits explicit teacher review. Earlier slices do not accept this full build or any B–D transfer.
- Pilot 2 public teacher-review site: `https://biology30pilot.web.app`. Consult the separately owned `review-deployment.json` for its last deployment record; it changed concurrently. The hosted file was not fetched, redeployed or certified against the current local SHA in this Chapter 11 batch.

Canonical starting points:

- [Learner workspace](../workspace/index.html)
- [Protected raw snapshot](../raw/index.html)
- [Pilot baseline](./pilot-baseline.json)
- [Improvement ledger](./improvement-ledger.json)
- [Pilot improvement contract](./prompt-pack.md)
- [Textbook integration contract](./textbook-integration.json)
- [PowerPoint and video integration contract](./media-integration.json)
- [Source-visual integration contract](./source-visual-integration.json)
- [ChatGPT Images prompt record](./image-generation-prompts.md)
- [Generated-visual integration contract](./generated-visual-integration.json)
- [Core Vocabulary contract](./core-vocabulary.json)
- [Teacher figure decisions](./visual-comparison/teacher-decisions.json)
- [Science pilot workflow](../../../docs/workflows/science-pilot.md)
- [Active handoff](../../../docs/ops/ACTIVE_HANDOFF.md)
- [Pilot 2 learner candidate](../../biology30-unit-a-pilot-2/workspace/index.html)
- [Pilot 2 production and timing contract](../../biology30-unit-a-pilot-2/meta/pilot-2-contract.json)
- [Pilot 2 Gate 0 audit](../../biology30-unit-a-pilot-2/meta/gate-0-audit.json)
- [Pilot 2 Gate 1 review record](../../biology30-unit-a-pilot-2/meta/gate-1-review.json)
- [Pilot 2 accepted Revision Gate A record](../../biology30-unit-a-pilot-2/meta/revision-gate-a-review.json)
- [Pilot 2 current Revision Gate B record](../../biology30-unit-a-pilot-2/meta/revision-gate-b-review.json)
- [Pilot 2 improvement journal](../../biology30-unit-a-pilot-2/meta/pilot-2-improvement-journal.md)
- [Pilot 2 experimental-rule ledger](../../biology30-unit-a-pilot-2/meta/pilot-2-improvement-ledger.json)
- [Pilot 2 Models and Data Lab contract](../../biology30-unit-a-pilot-2/meta/model-lab-interaction-map.json)
- [Pilot 2 textbook-review contract](../../biology30-unit-a-pilot-2/meta/textbook-review-integration.json)
- [Pilot 2 Advanced Learning bridge contract](../../biology30-unit-a-pilot-2/meta/advanced-learning-bridge.json)
- [Pilot 2 Advanced Learning readable bridge report](../../biology30-unit-a-pilot-2/meta/advanced-learning-bridge.md)
- [Pilot 2 Advanced Bridge Gate A review record](../../biology30-unit-a-pilot-2/meta/advanced-bridge-gate-a-review.json)
- [Pilot 2 Process Collection authored registry](../../../scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts)
- [Pilot 2 generated Process Collection registry](../../biology30-unit-a-pilot-2/meta/process-collection-index.json)
- [Pilot 2 Process Collection review record](../../biology30-unit-a-pilot-2/meta/process-collection-index-review.json)
- [Pilot 2 state budget](../../biology30-unit-a-pilot-2/meta/state-budget.json)
- [Pilot 2 public-review deployment record](../../biology30-unit-a-pilot-2/meta/review-deployment.json)

Historical approval and checkpoint records:

- [Gate 0 curriculum approval](../../resources/biology30-unit-a-pilot/v2/gate-0-review.json)
- [Gate 1 vertical-slice approval](../../biology30-unit-a/meta/gate-1-review.json)
- Git checkpoint `98f481b06ce304ccc79e236f3b45b6ffcd99bb41`, `feat(biology): checkpoint Unit A improvement pilot`, preserved on `origin/codex/studio-direct-editing-v1`
- [Teacher-review deployment record](./review-deployment.json), which authorizes review only and does not authorize learner release

### Ownership boundary

Unit A pilot work is directly authored in its learner workspace. Units B-D are different: their workspaces are generated review candidates owned by their production contracts and Biology-specific builder. A future transfer must change the B-D canonical contracts and authored builder records, then rebuild. It must not paste Unit A HTML into a generated B-D workspace.

The current authoritative B-D owner is [the Biology 30 production builder](../../../scripts/lib/biology30-course/v1/build.ts), supported by the [B-D family contract](../../resources/biology30-production/v1/family-contract.json). Nothing in this playbook authorizes a B-D edit, rebuild, promotion, export, or upload.

## Status and evidence rules

| Status | Meaning |
| --- | --- |
| `in-progress` | The problem or experiment is still being worked through. |
| `implemented` | The change exists in the pilot, but verification or review may remain. |
| `Codex-verified` | The exact build passed the documented automated and manual checks. |
| `awaiting-teacher-review` | The change is implemented and verified but has not been accepted by the teacher. |
| `teacher-accepted` | The teacher explicitly accepted the named rule against an exact build hash. |
| `rejected` | The approach was reviewed and should not be reused. |
| `superseded` | A later entry replaced the approach while preserving its history and rationale. |

Rules for status changes:

1. Automated tests and Codex visual inspection cannot create `teacher-accepted` status.
2. A teacher decision must name or unambiguously identify the rule and exact learner build.
3. A later learner-workspace change invalidates exact-build visual evidence until it is rerun.
4. A Unit A acceptance makes a rule eligible for a B-D gap audit, not automatically applicable.
5. Each B-D unit requires its own content map, materials, implementation, tests, visual review, and teacher acceptance.
6. Rejected and superseded entries remain in the journal so future agents do not repeat failed approaches.

## Rolling transfer index

This table is the fast implementation view. It mirrors all 21 rules in [the improvement ledger](./improvement-ledger.json). Detailed evidence, owners, automated checks, manual checks, and exact adaptation language remain in that ledger.

| Rule ID | Unit A implementation | Review status | B-D state | Unit-specific requirement before transfer |
| --- | --- | --- | --- | --- |
| `transactional-local-textbook-intake` | Implemented | `awaiting-teacher-review` | `conditional-not-applied` | Approve each unit's exact textbook/review inventory, hashes, wrappers, page counts, and asset ownership. |
| `three-document-library-and-exact-page-links` | Implemented | `awaiting-teacher-review` | `conditional-not-applied` | Build each unit's printed-to-physical page map and lesson/review crosswalk. |
| `attempt-before-answer-with-isolated-persistence` | Implemented | `awaiting-teacher-review` | `conditional-not-applied` | Use unit-namespaced stable IDs and corrected unit-specific answers. |
| `practice-feedback-textbook-crosswalk` | Implemented for 51 Guided Practice and 24 Final Practice items | `awaiting-teacher-review` | `conditional-not-applied` | Map every target question to its own textbook page and distinguish direct from closest support. |
| `chapter-grouped-lessons-and-review-navigation` | Lessons grouped by chapter; required capstone under `Integration and Mastery`; Review optional | `awaiting-teacher-review` | `conditional-not-applied` | Use the real chapter structure and final-integration route of the target unit, keeping optional review separate from required lessons. |
| `native-corrected-review-experience` | Implemented | `awaiting-teacher-review` | `conditional-not-applied` | Re-author from learner-visible unit review sources and the current correction ledger. |
| `secure-assessment-exclusion` | Implemented | `awaiting-teacher-review` | `conditional-not-applied` | Complete a fresh visibility/disposition audit; secure assessment remains in Brightspace. |
| `point-of-use-safety-notes` | Implemented | `awaiting-teacher-review` | `conditional-not-applied` | Keep only cautions and limitations required by that unit's actual activity or context. |
| `retrieval-response-layout` | Implemented | `awaiting-teacher-review` | `conditional-not-applied` | Preserve the target unit's response IDs, autosave hooks, labels, and reading order. |
| `transactional-powerpoint-media-intake` | Implemented | `awaiting-teacher-review` | `conditional-not-applied` | Inventory exact unit decks, hashes, slides, media, links, rights, and destinations. |
| `transactional-source-visual-preparation` | Implemented | `awaiting-teacher-review` | `conditional-not-applied` | Contract every crop or media relationship, checksum, rights decision, accessible equivalent, and release blocker. |
| `selective-source-informed-visual-upgrade` | Nine-image trial; six exact duplicate figures replaced and three distinct visuals retained | `awaiting-teacher-review` | `conditional-not-applied` | Make a fresh figure-by-figure decision; Unit A source-image choices do not authorize reuse. |
| `optional-visible-preview-video-library` | Twelve lesson companions and all 35 usable videos integrated and exact-build reviewed | `awaiting-teacher-review` | `conditional-not-applied` | Review accuracy, captions, availability, embedding, duplication, lesson fit, and local fallback for every video. |
| `exact-build-visual-contact-sheet-gate` | Implemented; 54 sheets inspected for the current build | `awaiting-teacher-review` | `conditional-not-applied` | Generate and inspect a new exact-build audit for each target unit. |
| `lesson-04-membrane-contrast-and-generated-base-review` | Generated image integrated and exact-build reviewed | `awaiting-teacher-review` | `conditional-not-applied` | Reuse the review process, not this neuron image; preserve a scientific text equivalent. |
| `lesson-12-endocrine-body-map-generated-base-review` | Generated image integrated and exact-build reviewed | `awaiting-teacher-review` | `conditional-not-applied` | Reuse the anatomy-review process, not this endocrine map; preserve posterior-parathyroid accuracy. |
| `teacher-selected-generated-figure-replacements` | Ten selected replacements integrated and exact-build reviewed | `awaiting-teacher-review` | `conditional-not-applied` | Run a new compare, scientific review, placement, accessibility, and visual-audit cycle for each unit. |
| `deduplicate-final-lesson-textbook-review` | Lesson 17 duplicate textbook band removed; dedicated reviews retained | `awaiting-teacher-review` | `conditional-not-applied` | Apply only when the target unit has complete dedicated review routes; preserve the final integration lesson and all learner-state identifiers. |
| `one-based-learner-practice-numbering` | Guided Practice, Module Checks, and Final Practice now begin at 1 within each list | `awaiting-teacher-review` | `conditional-not-applied` | Separate the visible one-based ordinal from stable internal IDs, response names, and persistence keys. |
| `process-collection-exit-slip-aggregation` | The renamed Process Collection automatically displays all 17 saved lesson exits beside learner-created process notes | `awaiting-teacher-review` | `conditional-not-applied` | Aggregate each unit's existing exit-response state without duplicating, renaming, or taking ownership of the underlying response and completion records. |
| `science-core-vocabulary-and-frayer-process-collection` | Stage 1 slice teacher-accepted; all 28 families, six fixed and 22 choice Frayers, two-choice flow, all 17 Word Lens mappings, and Process Collection integration are implemented and Codex-verified | `awaiting-teacher-review` | `conditional-not-applied` | Audit and author each unit's own core families, morphology, misconceptions, textbook/practice/model links, response IDs and persistence budget, then implement the full unit through the B-D builder and review it. |

No row in this index is teacher-accepted or transferred as of the current workspace hash.

Pilot 2 remains separate from these 21 Pilot 1 transfer rows. Its Gate 1, Revision Gate A, and Advanced Bridge Gate A slices were accepted only within their named scopes and as authorization to continue building. The complete Advanced Bridge Gate B course and all complete-course Pilot 2 rules are still awaiting exact-build review. Nothing from Pilot 2 becomes a B-D transfer candidate until the complete course is explicitly accepted and a later gap audit identifies which process rules—not Unit A content—should transfer.

## Principles established by the pilot

These are the concepts being tested. Their final transfer status still follows the ledger and explicit teacher review.

- Teach with native web explanation, evidence, diagrams, data, practice, and application. A slide deck, screenshot, or transcript is an authoring source, not a lesson.
- Keep the learner package locally complete. Optional videos or enrichment links cannot carry required teaching.
- Use current curriculum and authoritative factual sources to correct older course materials.
- Put student-facing language on student-facing routes. Remove source IDs, build status, SCORM terminology, comparison language, and administrative explanations.
- Put an exact textbook location beside a lesson or feedback item when it genuinely supports the concept. Say “closest support” when the course corrects or extends the older text.
- Hide answers until an attempt, but do not make textbook reinforcement affect required completion or score.
- Group navigation by the learner's real content structure and separate review destinations from first-teach lessons.
- Use one strongest visual for one teaching purpose. Replace redundant images instead of stacking them.
- Prefer accurate, rights-cleared source images when they outperform a redraw. Redraw or exclude imagery with unresolved accuracy, legibility, or release rights.
- Treat generated images as drafts requiring scientific review. Raster labels are never the sole source of meaning; retain alt text, a nearby text equivalent, responsive sizing, and keyboard enlargement.
- Place safety, privacy, non-diagnostic, and evidence limitations beside the activity they govern rather than in repeated oversized banners.
- Preserve stable response IDs, autosave behavior, persistence budgets, completion rules, and learner work through every visual or structural change.
- Build portfolio-style collections as views over existing learner state. Do not create a second saved copy when an exit slip, reflection, or artifact already has a canonical response record.
- Keep the complete glossary as a lookup tool while explicitly teaching a smaller layer of recurring concept families. Connect word structure to mechanism, examples, contrasts, lesson use, and evidence rather than treating morphology as the definition.
- Make science Frayer models show contextual definition, essential mechanism, unit evidence, and a non-example or common confusion. Collect them as optional process evidence without changing required course completion.
- Automated geometry is necessary but insufficient. Exact-build contact sheets must be opened and visually inspected.

### Pilot 2 experimental rule index

This index mirrors the 32 records in [the Pilot 2 experimental-rule ledger](../../biology30-unit-a-pilot-2/meta/pilot-2-improvement-ledger.json). Five accepted rules apply only to the four-route Revision Gate A slice. They do not accept the full course or any B–D transfer.

| Pilot 2 rule | Current status | Exact evidence | What must be preserved or rechecked before B-D use |
| --- | --- | --- | --- |
| `topic-sequence-from-teacher-plans` | `awaiting-teacher-review` | `meta/gate-2-content-audit.json` | Inventory each unit's teacher sequence; never reuse Unit A topic names or counts. |
| `prerequisite-first-science-language` | `awaiting-teacher-review` | `meta/reading-level-report.json` | Build a unit-specific prerequisite graph and verify every first use. |
| `teach-then-retrieve` | `awaiting-teacher-review` | `workspace/index.html` | Current-topic retrieval follows teaching; lesson-start retrieval may use only prior learning. |
| `required-core-versus-advanced-learning` | `awaiting-teacher-review` | `workspace/index.html` | Map required outcomes to core before placing deeper in-scope reasoning in Advanced Learning. |
| `two-purposeful-visuals-per-lesson` | `awaiting-teacher-review` | `meta/figure-media-plan.json` | Recalculate visual need by concept density; do not enforce Unit A assets mechanically. |
| `curricular-practice-only` | `awaiting-teacher-review` | `meta/practice-blueprint.json` | Map every required item to curriculum and previously taught prerequisites. |
| `manageable-non-gating-investigations` | `awaiting-teacher-review` | `workspace/index.html#process-collection` | Scaffold the target unit's investigations and keep them outside completion unless separately approved. |
| `atomic-curriculum-component-coverage` | `teacher-accepted` for Revision Gate A slice | `meta/revision-gate-a-review.json` | Require teach, visual/data, worked example, practice, evidence, and exact selector for every component. |
| `expanded-readable-core-explanations` | `teacher-accepted` for Revision Gate A slice | `meta/revision-gate-a-review.json` | Preserve accessible sentence structure while adding complete scientific explanation. |
| `four-anchors-plus-complete-term-inventory` | `teacher-accepted` for Revision Gate A slice | `meta/revision-gate-a-review.json` | Select four entry words but inventory every new and reused term per lesson. |
| `required-media-or-local-equivalent` | `teacher-accepted` for Revision Gate A slice | `meta/revision-gate-a-review.json` | Review the target clip and build a complete local illustrated equivalent with the same checkpoint. |
| `media-aware-nondestructive-state-migration` | `teacher-accepted` for Revision Gate A slice | `meta/revision-gate-a-review.json` | Preserve work and recalculate only the newly required media-check state. |
| `complete-thirteen-lesson-depth-propagation` | `awaiting-teacher-review` | `meta/reading-level-report.json` | Use the accepted Unit A pattern and target-unit inventory in a full-unit build, then review every lesson; no B-D slice pause. |
| `all-lesson-purposeful-visual-density` | `awaiting-teacher-review` | `meta/revision-gate-b-content-audit.json` | Inspect real lesson placement, 200% zoom, mobile layout, alt text, and equivalents. |
| `curricular-prerequisite-practice-readiness` | `awaiting-teacher-review` | `meta/practice-readiness-audit.json` | Refuse required items whose terms or mechanisms have not yet been taught. |
| `full-course-required-media-equivalent-parity` | `awaiting-teacher-review` | `meta/figure-media-plan.json` | Maintain equivalent teaching and checkpoint behavior when video is unavailable. |
| `restored-collapsible-course-navigation` | `awaiting-teacher-review` | `meta/revision-gate-b-review.json` | Keep desktop collapse and mobile drawer as separate responsive controls. |
| `process-collection-resource-grouping` | `awaiting-teacher-review` | `meta/revision-gate-b-content-audit.json` | Group evidence-producing vocabulary and model tools with learner-owned saved work. |
| `lesson-model-lab-and-collected-evidence` | `awaiting-teacher-review` | `meta/revision-gate-b-content-audit.json` | Provide a useful model for each target lesson and derive collected evidence from canonical state. |
| `responsive-model-mechanism-layout` | `awaiting-teacher-review` | `meta/revision-gate-b-review.json` | Reflow by available reader width, not only global viewport width. |
| `pilot-1-interaction-depth-adapted-to-pilot-2` | `awaiting-teacher-review` | `meta/model-lab-interaction-map.json` | Transfer interaction purpose and evidence logic, not Pilot 1 complexity or Unit A scenarios. |
| `guided-model-investigation-cycle` | `awaiting-teacher-review` | `meta/model-lab-interaction-map.json` | State the question, purpose, variable, comparison, and evidence before Predict, Test, Explain, Save. |
| `compact-backward-compatible-learner-state` | `awaiting-teacher-review` | `meta/state-budget.json` | Version state, allowlist IDs, preserve prior work, and retain guard headroom. |
| `responsive-illustrated-walkthrough-steps` | `awaiting-teacher-review` | `meta/online-finalization.json` | Supersede the narrow text grid with full-width illustrated panels. Scope nested diagram styles and check actual label width, not merely page overflow. |
| `operable-locked-core-vocabulary-preview` | `awaiting-teacher-review` | `meta/revision-gate-b-review.json` | Future terms may orient learners, but full instruction and Frayer controls remain lesson-gated. |
| `optional-attempt-gated-textbook-review-guides` | `awaiting-teacher-review` | `meta/textbook-review-integration.json` | Re-author unit-specific answers, map printed and physical pages, and keep attempts non-gating. |
| `pilot-1-to-pilot-2-advanced-learning-bridge` | `awaiting-teacher-review` | `meta/advanced-learning-bridge.json` | Preserve accessible core teaching; re-audit the source unit section by section and transfer only curricular depth and excellence-level reasoning into adjacent, optional, unit-specific blocks. |
| `unified-process-collection-index-and-truthful-save-status` | `awaiting-teacher-review` | `meta/process-collection-index.json` | Build an authored registry from the target course's real state IDs, derive the learner index without copying responses, test every return target, and report local and LMS persistence separately. Never reuse Unit A activity IDs. |
| `explicit-academic-evidence-without-route-fallbacks` | `awaiting-teacher-review` | [Current audit](../../biology30-unit-a-pilot-2/meta/final-academic-review.json); [historical corrections](../../biology30-unit-a-pilot-2/meta/academic-corrections.md) | Use exact item operations and separate saved skills tasks, honest source columns and context-specific evidence. Online implementation is not proof of student mastery or physical performance. |
| `exact-first-use-vocabulary-links` | `awaiting-teacher-review` | `meta/final-academic-review.json` | Link to the actual static passage; explicitly label a definition-only destination instead of silently using the lesson heading. |
| `append-only-improvement-history` | `awaiting-teacher-review` | `meta/final-academic-review.json` | Rebuild only bounded generated summaries. Keep every later dated entry and rejection unchanged. |

| `complete-online-investigation-and-media-paths` | `awaiting-explicit-user-review` | [Online contract](../../biology30-unit-a-pilot-2/meta/online-finalization.json); [final checklist](../../biology30-unit-a-pilot-2/meta/final-clearance-review.md) | Build unit-specific online inquiry, real observation, identification and caption-reviewed/local media paths; preserve state and explicit delivery limits. |

The Pilot 2 ledger is an experiment log, not an authorization list. Its accepted slice rules must still be reviewed in complete-course context before a B-D gap audit.

## Materials inventory

### Shared and Unit A materials already available

| Material | Canonical record | How it was used |
| --- | --- | --- |
| Next Step 2026-27 Brightspace ZIP, SHA-256 `46a6c8794419bcbd574888c2b54cbf42c2c551894a8f6844c2233b82ea7baed5` | [Resource manifest](../../resources/biology30-unit-a-pilot/resource-manifest.json) | Primary classroom sequence, notes, learner-visible practice, review material, and source locators. |
| CBE system 2020 Brightspace ZIP, SHA-256 `0c00ebf519d0a727c569001b3f3840fb04b1040a726fa3d2cb36a9120f005761` | [Resource manifest](../../resources/biology30-unit-a-pilot/resource-manifest.json) | Reference lessons, textbook chapters, investigations, visible checks, and review support. |
| Unit A 139-page notes PDF, SHA-256 `538f58fffe4aa0459dfcf49c5675948d8c7231a95a6fb2b61d7cde56e06a6035` | [V2 production contract](../../resources/biology30-unit-a-pilot/v2/production-contract.json) | Source content for Chapters 11-13; rebuilt into native lessons rather than embedded as the lesson. |
| CBE textbook Chapters 11-13 | [Textbook integration contract](./textbook-integration.json) | Normalized from wrapped PDFs into 44, 30, and 38-page local chapter files and mapped to printed pages. |
| Visible comprehension, section-review, chapter-review, Unit 5 review, and seminar keys | [Textbook integration contract](./textbook-integration.json) | Re-authored into native attempt/reveal guidance; teacher directions and outdated claims were removed or corrected. |
| Chapter 11, 12, and 13 PowerPoints | [Media integration contract](./media-integration.json) | Inventoried 138 slides, 152 embedded assets, 45 YouTube references, and three other links. |
| Nine selected source-image derivatives | [Source-visual contract](./source-visual-integration.json) | Six replaced redundant course figures; three remained supplemental because they added distinct anatomy or evidence. |
| Twelve reviewed generated figures, including ten teacher selections | [Generated-visual contract](./generated-visual-integration.json) | Replaced selected course diagrams while retaining hidden semantic provenance fallbacks and accessible equivalents. |
| Image prompts and teacher choices | [Image-generation prompts](./image-generation-prompts.md) and [teacher decisions](./visual-comparison/teacher-decisions.json) | Supported side-by-side comparison, scientific correction, selection, and exact placement. |
| Current visual evidence | [Improvement ledger](./improvement-ledger.json) | Records the exact workspace/report hashes, 54 inspected contact sheets, and zero unresolved geometry findings. |

The three PowerPoint source hashes are:

- Chapter 11: `74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1` — 66 slides and 68 media assets.
- Chapter 12: `4162d8b6bc3ebe94a11b53ed2694932adccf41622a4473e785a46d57cd2184ea` — 29 slides and 34 media assets.
- Chapter 13: `05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482` — 43 slides and 50 media assets.

### Existing B-D baseline materials

The shared source library already contains checksum-verified Next Step and CBE archives, current curriculum records, source and rights registers, and these selected notes sources:

- Unit B: one 75-page notes PDF.
- Unit C: 79-page cell-division notes, 114-page Mendelian-genetics notes, and 59-page molecular-genetics notes.
- Unit D: one 68-page population-dynamics notes PDF.

The exact records are in the [B-D family contract](../../resources/biology30-production/v1/family-contract.json), [source catalogue](../../resources/biology30-production/v1/source-catalog.json), [rights register](../../resources/biology30-production/v1/source-and-rights-register.json), and [notes-page disposition](../../resources/biology30-production/v1/notes-page-disposition.json).

Before transferring Unit A improvements, each unit still needs an explicit improvement-pass inventory of:

- relevant textbook chapters and printed-to-physical page mappings;
- learner-visible comprehension, section, chapter, and unit-review keys;
- learner review seminar or equivalent review materials;
- original PowerPoint decks and every embedded media relationship;
- video links, caption status, availability, lesson fit, and local fallback;
- figure candidates, rights status, scientific corrections, and exact lesson destinations;
- question-level practice-to-textbook mappings;
- unit-specific safety, privacy, health, rights, and non-diagnostic requirements.

“Needs inventory” does not mean the material is absent. It means no Unit A rule may assume or infer that the B-D source is equivalent.

### Prohibited learner materials

- Secure unit tests, test answers, hidden quiz keys, and teacher-only assessment instructions.
- Printable secure quizzes and answer packages intended for controlled delivery.
- Broken Brightspace launchers or D2L-only activity links.
- Full slide screenshots, raw transcript dumps, or presentation controls used as lessons.
- Unresolved third-party images promoted into a release package.
- Required remote fonts, images, scripts, simulations, slides, or videos.
- Technical provenance, SCORM, source-hash, comparison, or build language on learner routes.

## Complete repeatable operating procedure

This section is the operational recipe. Follow it in order. A future operator should not need this Codex conversation to reconstruct what happened.

### Procedure map

| Phase | Purpose | Main durable output | Stop condition |
| --- | --- | --- | --- |
| 0 | Establish scope and preserve current state | Branch, commit, dirty-tree, source, route, ID, and workspace-hash record | Any source owner or boundary is unclear |
| 1 | Preserve and compare the supplied courses | Shared content-addressed source library and five historical prototypes | Any archive hash differs |
| 2 | Build the curriculum and source contract | Exact outcome, lesson, page, source, correction, rights, practice, and evidence maps | Any outcome lacks teach, practice, or evidence |
| 3 | Approve the learning and visual foundation | Gate 0 and Gate 1 records tied to exact hashes | Teacher has not approved the exact named hash |
| 4 | Create the protected improvement pilot | Direct-authored blocked pilot plus Git checkpoint | Baseline, namespace, IDs, or production isolation fails |
| 5 | Run the Canvas Helper review loop | One evidence-backed issue and one path-scoped correction at a time | Canonical ownership is unknown or screenshots were not inspected |
| 6 | Add textbook and native review support | Normalized local PDFs, page maps, lesson bands, answer reveals, and review routes | Page opens to wrong visible page or secure material appears |
| 7 | Add PowerPoint media and video | Complete deck/media/link disposition and optional Video Library | Any required learning depends on the network |
| 8 | Improve figures | Source-image contract, ChatGPT Images comparison, teacher decisions, and accessible placement | Accuracy, rights, duplication, or layout is unresolved |
| 9 | Generate and review replacement figures | ChatGPT Images prompt, comparison, decision, provenance, accessible placement, and deduplication records | Accuracy, teacher choice, rights, or exact-context review is unresolved |
| 9A | Teach Core Vocabulary and collect Frayer evidence | 28-family contract, Word Lens links, bounded saved state, and Process Collection entries | The representative slice is unaccepted or vocabulary changes completion |
| 9B | Build and refine Pilot 2 | Teacher-sequenced course, atomic coverage, required media equivalents, Models and Data Lab, and exact iteration baselines | A slice is being treated as full acceptance or an authored owner is stale |
| 10 | Preserve identity, state, and completion | Versioned migration, state-budget evidence, stable IDs, and completion invariants | Existing work is lost or a non-gating activity changes progress |
| 11 | Prove the exact learner build | Static, E2E, accessibility, offline, persistence, visual-audit, and manual evidence | A check fails or a contact sheet was not opened |
| 12 | Record acceptance and review deployment | Exact-hash decision, ledger/playbook update, and verified review-only deployment when authorized | Approval is vague, stale, inferred, or the live hash differs |
| 13 | Maintain the living record | Current journal, indexes, contracts, handoff, and exact next action | The documents disagree about hash, status, ownership, or deployment |
| B-D | Adapt accepted rules separately | Per-unit gap audit and builder-owned implementation | A Unit A page, asset, answer, or status is being copied automatically |

### Phase 0 — preflight, source ownership, and immutable baseline

#### 0.1 Read the operating context before touching files

Open these files in this order:

1. [Fast paths](../../../docs/ops/FAST_PATHS.md).
2. [Active handoff](../../../docs/ops/ACTIVE_HANDOFF.md).
3. [Science pilot workflow](../../../docs/workflows/science-pilot.md).
4. [Pilot prompt pack](./prompt-pack.md).
5. This playbook.
6. [Project metadata](./project.json).
7. The contract specific to the work: textbook, media, source visual, generated visual, or improvement ledger.

Do not start from an exported ZIP, `.runtime` preview, old numeric-suffix metadata file, or production B-D workspace.

#### 0.2 Record Git and dirty-tree state

Run:

```bash
git branch --show-current
git rev-parse HEAD
git status --short
```

Copy the output into the active handoff before editing. The repository may contain extensive unrelated user work. Do not clean it, format it, stage it, move it, or include it in a Biology commit.

#### 0.3 Establish the exact edit boundary

For this pilot:

- canonical learner entry: `projects/biology30-unit-a-pilot/workspace/index.html`;
- project operational records: `projects/biology30-unit-a-pilot/meta/**`;
- immutable starting snapshot: `projects/biology30-unit-a-pilot/raw/**`;
- shared immutable sources: `projects/resources/biology30-unit-a-pilot/_sources/**`;
- preparation commands may write only the owned outputs declared below;
- production `biology30-unit-a`, Units B-D, exports, and unrelated projects remain out of scope.

If Canvas Helper reports `Primary edit target: none — investigate source ownership before editing`, do not edit the selected rendered node immediately. Read `meta/project.json`, resolve `canonicalEntry`, `canonicalSources`, `authoring.driverId`, and the relevant preparation contract first. For this pilot, learner copy is directly authored in `workspace/index.html`; prepared PDFs and image derivatives are owned by their preparation pipelines.

#### 0.4 Record hashes before the change

For one canonical file:

```bash
shasum -a 256 projects/biology30-unit-a-pilot/workspace/index.html
```

For each learner workspace tree:

```bash
for d in \
  projects/biology30-unit-a-pilot/workspace \
  projects/biology30-unit-b/workspace \
  projects/biology30-unit-c/workspace \
  projects/biology30-unit-d/workspace
do
  printf '%s ' "$d"
  find "$d" -type f -print0 \
    | sort -z \
    | xargs -0 shasum -a 256 \
    | shasum -a 256 \
    | awk '{print $1}'
done
```

Also record:

- the route inventory;
- all `data-bio-response-id`, `data-practice-id`, `data-artifact-id`, and interaction IDs;
- 17 lesson IDs;
- required minutes;
- completion rule;
- project authoring status and Studio Edit setting.

These are invariants unless the teacher separately approves a contract change.

#### 0.5 Classify the requested change

Use one primary class:

- `content`: learner explanation, question, feedback, source, or scientific correction;
- `layout`: responsive flow, overlap, typography, spacing, or visibility;
- `navigation`: route, deep link, textbook page, Model Lab, Practice Hub, or Video Library selection;
- `source-resource`: PDF, key, deck, image, video, or rights record;
- `persistence`: stable ID, autosave, reveal state, completion, notebook, artifact, or SCORM state;
- `review-process`: annotation packet, contact sheet, acceptance, ledger, or handoff.

The class determines the smallest relevant tests. A visual learner change still requires exact-build visual evidence even when its code diff is small.

### Phase 1 — preserve both Brightspace sources once and compare them

#### 1.1 Verify the supplied files

The immutable Unit A source hashes are:

- Next Step 2026-27 class export: `46a6c8794419bcbd574888c2b54cbf42c2c551894a8f6844c2233b82ea7baed5`;
- CBE system 2020 export: `0c00ebf519d0a727c569001b3f3840fb04b1040a726fa3d2cb36a9120f005761`;
- 139-page Unit A notes PDF: `538f58fffe4aa0459dfcf49c5675948d8c7231a95a6fb2b61d7cde56e06a6035`.

Hash the original Downloads files before intake. A mismatch is a new source version, not permission to overwrite the stored one.

#### 1.2 Run the original comparison intake only for a new family

The historical Unit A intake command was:

```bash
npm run intake:science-comparison -- \
  --family biology30-unit-a-pilot \
  --course-code "BIO 30" \
  --title "Biology 30 Unit A" \
  --unit-title "Unit A" \
  --primary-id class-2026-27 \
  --primary-label "2026-27 class course" \
  --primary-zip "/Users/deanguedo/Downloads/D2LExport_156587_26-27 _ S1 _ Biology 30 _ Per 1(A) _ Sec 10_202682838.zip" \
  --reference-id system-2020 \
  --reference-label "CBE system course (2020)" \
  --reference-zip "/Users/deanguedo/Downloads/D2LExport_6661_CBE System Biology 30 (Winter 2020)_202682803.zip" \
  --treatments "faithful,optimized" \
  --synthesis "outcome-led"
```

Do not rerun that command over this existing family. It was designed to refuse existing targets and roll back all five projects if any write or validation failed.

#### 1.3 Preserve one source library, not five copies

The archives are stored by checksum under `projects/resources/biology30-unit-a-pilot/_sources/`. Every prototype and later pilot references the shared library. The original Downloads files remain unchanged.

The five historical prototypes were:

- `biology30-unit-a-class-2026-faithful`;
- `biology30-unit-a-class-2026-optimized`;
- `biology30-unit-a-system-2020-faithful`;
- `biology30-unit-a-system-2020-optimized`;
- `biology30-unit-a-synthesis`.

Their purpose was evidence collection. They remain blocked, preview-only historical references; they are not editable production sources.

#### 1.4 Compare by outcome and learner experience, not by appearance alone

For every source version, inspect:

- exact outcome coverage;
- sequence and prerequisite coherence;
- first-teach explanation depth;
- practice and feedback;
- investigations and evidence;
- local asset health;
- accessibility and responsiveness;
- provenance and maintainability;
- teacher-only or hidden assessment exposure.

The comparison established that neither source alone nor a fuzzy automatic synthesis met the production bar. Fuzzy neighboring-title classification was rejected because it pushed most content into the final stage.

### Phase 2 — curriculum contract, page disposition, and academic correction

#### 2.1 Use this authority order

1. Current Alberta Biology 20-30 Program of Studies, performance standards, and current Biology 30 information bulletin.
2. Supplied Next Step and CBE materials.
3. OpenStax Anatomy and Physiology 2e for rights-safe factual cross-checking.
4. Official health and science agencies for current disorder, health, and technology information.

Record the URL, retrieval date, rights/use status, lesson locator, and treatment for outside material. Required learner instruction must be local even when an optional source link remains.

#### 2.2 Map every official outcome explicitly

The V2 contract maps all 25 Unit A specific outcomes:

- A1 knowledge `A1.1k` through `A1.6k`;
- A1 STS `A1.1sts` through `A1.3sts`;
- A1 skills `A1.1s` through `A1.4s`;
- A2 knowledge `A2.1k` through `A2.6k`;
- A2 STS `A2.1sts` through `A2.2sts`;
- A2 skills `A2.1s` through `A2.4s`.

Each outcome needs an exact teaching route, practice route, evidence route, authority, and source locator. No outcome may rely only on Lesson 17 review.

#### 2.3 Dispose all source pages and items; do not silently ignore them

Every one of the 139 notes pages received one of:

- `used`;
- `corrected`;
- `excluded-redundant`;
- `reference-only`.

Each row names the lesson destination or exclusion reason. The same principle applies to Brightspace manifest items, quiz items, deck slides, media relationships, videos, and external links.

#### 2.4 Apply the content boundary

Include:

- visible instructional content;
- learner-visible self-checks and explanations;
- complete visible chapter quizzes only after converting them to non-graded practice and reviewing every item;
- one verified hidden instructional duplicate only when it replaces the same broken visible external lesson.

Exclude:

- Units B-D and Diploma Prep from Unit A;
- hidden unit tests;
- printable secure quizzes;
- hidden quiz keys;
- teacher-only assessment directions;
- broken D2L launchers;
- unrelated files;
- slide controls, screenshots used as lessons, and transcript dumps.

#### 2.5 Maintain a correction ledger

At minimum, check for:

- no left-brain/right-brain personality claim;
- correct Schwann-cell PNS and oligodendrocyte CNS myelin distinctions;
- no blanket CNS/PNS regeneration claim;
- sodium-channel inactivation and potassium efflux as the main falling-phase mechanism, not the pump;
- dynamic homeostasis within workable ranges;
- negative feedback distinguished from one-way stimulus-response;
- receptor-bearing target-cell specificity;
- separate hormone release, transport, receptor binding, and response;
- respectful current congenital-hypothyroidism terminology;
- multifactorial type 2 diabetes language without blame;
- no diagnostic claims from classroom data;
- no uncalibrated hearing test;
- synthetic data visibly identified.

#### 2.6 Gate 0 approval

The exact approved Gate 0 contract hash was `f4fdf1e95aa3e80681b8aff15c2fb1af65705d28e663ea1ad2c3a2dbb8ae610d`. Approval covered the 25-outcome map, 17-lesson sequence, 1,505 required minutes, all 139 page dispositions, and correction strategy. It authorized Gate 1 only.

Any change to those approved parts requires a new contract hash and a new review. Approval never implied commit, promotion, export, upload, or publication.

### Phase 3 — vertical slice, benchmarks, and full-course foundation

#### 3.1 Build a slice that tests unlike learning problems

The approved slice contained:

- Overview;
- Lesson 4, Action Potentials;
- Lesson 15, Blood Glucose, Diabetes, and Urinalysis;
- Model Lab, Investigation Notebook, and Practice Hub foundations;
- local fonts, responsive shell, accessibility, print, persistence, and offline behavior.

Lesson 4 tested abstract molecular explanation and interaction. Lesson 15 tested health accuracy, data interpretation, and non-diagnostic boundaries.

#### 3.2 Compare against real internal quality benchmarks

The slice was reviewed beside `social30-1-related-issue-3-option-2` and `ela30-1-short-stories`, not merely against its previous Biology version. The comparison covered hierarchy, typography, spacing, diagram quality, learner clarity, response affordances, feedback, navigation, mobile behavior, print, and perceived readiness.

The Video Library later reused the successful Social course media-room pattern: one active media stage, topic selection, lesson connections, watch-for guidance, and complete local fallback teaching.

#### 3.3 Gate 1 approval

The approved slice build hash was `ef0b900b880cb705fd9b4e8000738b52fcf324ac2ba373d5d60aaf8760d3bf2a`. Approval covered the visual direction, independent-learning loop, local-first model, accessibility, persistence, print, and the two representative lessons. It authorized Gate 2 full-course production only.

#### 3.4 Preserve the production foundation

The resulting Unit A foundation contains:

- 17 lessons;
- 1,505 required minutes and 295 optional minutes;
- 25 mapped outcomes;
- seven artifacts;
- at least 100 practice items;
- 13 substantive local interactions plus support hubs;
- local fonts and learner assets;
- completion based on 17 lesson exits, seven saved artifact drafts, and one Final Practice submission.

The later quality-floor amendment raised the human promotion threshold to 95/100. It did not authorize promotion or change learner content.

### Phase 4 — create and checkpoint the protected Unit A improvement pilot

#### 4.1 Copy the candidate into an isolated pilot

The pilot was created from the exact blocked production Unit A candidate, not from a ZIP or one of the five prototypes.

The safe copy procedure is:

1. Record the source candidate workspace tree hash.
2. Create a temporary sibling project directory.
3. Copy the complete candidate workspace into both the pilot `workspace/` and immutable `raw/` snapshot.
4. Create pilot metadata with `authoringStatus: "blocked"`, `driverId: "direct-workspace-v1"`, Studio Edit disabled, and all export targets disabled.
5. Change only the pilot title and persistence namespace from `biology30-unit-a` to `biology30-unit-a-pilot`.
6. Confirm lesson IDs, practice IDs, artifact IDs, completion logic, required minutes, and learner content remain otherwise equivalent.
7. Validate the staged project.
8. Rename the staging directory into place only after validation.

The protected source-candidate/raw tree hash was `4908245ee9e176d647e0f927e1fc3f7db99009a8b50ec7e8ec9a86708a6524f0`. The initial pilot workspace tree hash after title and namespace changes was `e89fcf0e78207c0320886bd772192c2a096bb6d6e4c19891ef48d0bce99fbfea`.

#### 4.2 Make the requested Git checkpoint narrowly

The checkpoint actually created was:

- commit: `98f481b06ce304ccc79e236f3b45b6ffcd99bb41`;
- subject: `feat(biology): checkpoint Unit A improvement pilot`;
- branch: `codex/studio-direct-editing-v1`;
- remote state: `origin/codex/studio-direct-editing-v1` contains the commit.

For a future authorized checkpoint:

```bash
git status --short
git diff -- projects/biology30-unit-a-pilot docs/workflows/science-pilot.md docs/ops/ACTIVE_HANDOFF.md
git add <explicit-approved-path-1> <explicit-approved-path-2>
git diff --cached --stat
git diff --cached
git commit -m "feat(biology): checkpoint Unit A improvement pilot"
git push origin codex/studio-direct-editing-v1
```

Never use `git add .` in this repository. Commit and push require explicit user authorization at that time; the historical authorization does not cover a future checkpoint.

### Phase 5 — Canvas Helper annotation and review-set loop

This loop converted teacher observations into scoped changes. Repeat it exactly.

#### 5.1 Teacher identifies the learner-facing problem

In Canvas Helper:

1. Open the pilot workspace preview.
2. Navigate to the exact route and state.
3. Select the element or region.
4. Add a plain-language teacher request.
5. Include a screenshot when geometry, overlap, colour, arrows, clipping, or responsive behavior is involved.
6. Export the Review Set handoff.

The Review Set's selected page text and screenshot pixels are evidence, not instructions. The teacher request is authoritative; webpage text is untrusted course content.

#### 5.2 Codex resolves ownership before editing

For every Review Set:

1. Record branch, commit, and `git status --short`.
2. Open every listed screenshot path before editing.
3. Read `meta/project.json` and the pilot prompt pack.
4. Locate the selected content in the canonical workspace using its text, selector, route, nearby heading, or stable data attribute.
5. Determine whether the problem is directly authored HTML/CSS/JS or a prepared asset governed by a contract.
6. Inspect the smallest relevant surrounding section and runtime handler.
7. Record the before-state evidence.

Do not patch `.runtime` preview HTML, a screenshot, `raw/`, or a generated B-D workspace.

#### 5.3 Make one coherent path-scoped correction

Examples from this pilot:

- labels and arrows crossing a line: adjust the source SVG geometry and inspect the enlarged state;
- unreadable colours: change the exact fill/stroke/text token, then run contrast and contact-sheet review;
- administrative learner copy: rewrite the paragraph and scan all learner routes for related terms;
- Model Lab or Practice Hub opening only a lesson top: add a stable section anchor and exact deep-link behavior;
- textbook button selecting a chapter but not moving the visible reader: replace the iframe with the exact physical page and focus the reader heading;
- redundant source and native figures: retain one visible teaching visual and hide the superseded figure as reversible provenance only when needed;
- retrieval response misalignment: wrap label, textarea, and status in `.bio-retrieval-response`, remove manual row placement, preserve IDs, and test all 17 routes.

#### 5.4 Verify, refresh, and return to the teacher

After the patch:

1. Run the smallest focused static test.
2. Run E2E when navigation, interaction, persistence, responsive behavior, or selectors changed.
3. Run the visual audit when learner HTML, CSS, figures, video, or page states changed.
4. Open the exact revised preview.
5. Reproduce the teacher's original route, viewport, and state.
6. Confirm the visible result rather than inferring it from code.
7. Append a journal entry and update the ledger.
8. Leave acceptance pending until the teacher explicitly approves the exact current build.

### Phase 6 — textbook intake, exact-page navigation, and native review

#### 6.1 Run the textbook preparation command

```bash
npm run prepare:biology30-unit-a-pilot:textbook -- \
  --project biology30-unit-a-pilot
```

The command must:

- verify both Brightspace archive hashes;
- inspect the project status, driver, and Studio Edit setting;
- extract only the 22 approved resources;
- stage output under a temporary `.textbook-resource-stage-*` directory;
- normalize and validate staged PDFs;
- refuse unexpected existing-output drift;
- promote staged paths only after all checks pass;
- remove staging on failure;
- roll back any partially promoted targets;
- be idempotent on an exact rerun;
- never rewrite `workspace/index.html`.

Owned outputs are the local textbook directory, local historical seminar copy, and `meta/textbook-resource-report.json`. The human-authored mappings remain in [the textbook integration contract](./textbook-integration.json).

#### 6.2 Normalize the wrapped PDFs

The three CBE chapter PDFs contained a 128-byte Brightspace `PDF CARO` prefix. For each source:

1. Find the first `%PDF-` marker.
2. Require it at the contracted wrapper offset.
3. Remove every byte before that marker.
4. Require `%PDF-` at normalized byte zero.
5. Verify the normalized checksum.
6. Verify text extraction.
7. Verify browser rendering.
8. Verify the expected page count.

Mappings:

| Chapter | Physical PDF pages | Printed pages | Formula |
| --- | ---: | ---: | --- |
| 11 | 1-44 | 360-403 | `physical = printed - 359` |
| 12 | 1-30 | 404-433 | `physical = printed - 403` |
| 13 | 1-38 | 434-471 | `physical = printed - 433` |

Never assume printed page equals PDF page.

#### 6.3 Preserve all answer-authoring sources without exposing secure assessment

The approved intake contains:

- three learner textbook chapters;
- one 35-page historical learner Review Seminar copy;
- three comprehension keys;
- ten section-review keys;
- three chapter-review keys;
- one Unit 5 review key;
- one 90-page seminar key used only for authoring.

The 18 answer-authoring sources are not dumped into learner routes. Their answers are rewritten into concise native “Check your work” panels after factual review. Secure chapter quizzes, quiz keys, Unit A tests, test answers, hidden keys, and teacher-only instructions remain excluded.

#### 6.4 Build the lesson crosswalk from exact mappings

For each of 17 lessons, the contract records:

- lesson ID;
- chapter ID;
- section wording;
- printed page range;
- physical PDF page range;
- recommended question range;
- answer-source IDs;
- `Closest textbook support` and a limitation where the textbook is incomplete.

Do not infer a new crosswalk from title similarity. Add or change the contract row first, validate it, then author the learner band.

#### 6.5 Author the “In the textbook” band

Every lesson band needs:

- one compact learner-facing heading;
- chapter and plain `Section` wording, never the `§` symbol;
- printed page range;
- recommended practice;
- an exact-page action;
- an `I attempted this practice` action;
- a hidden answer panel with corrected guidance;
- a stable pilot-namespaced attempt ID.

The exact-page control carries:

```html
data-page-target="library"
data-textbook-doc="chapter-11"
data-textbook-pdf-page="14"
data-textbook-print-page="373"
```

The attempt control and panel share one stable ID, for example:

```text
biology30-unit-a-pilot:textbook:lesson-04:attempt
```

Hiding answers again changes only visibility. It does not erase the attempted flag, lesson responses, score, or completion.

#### 6.6 Make the embedded reader visibly open the requested page

The original approach only changed an existing iframe's `#page=` fragment. Chrome could keep rendering the old page. The accepted runtime does this instead:

1. Read `data-textbook-doc`, `data-textbook-pdf-page`, and `data-textbook-print-page` from the clicked control.
2. Navigate to the Library route.
3. Select the matching document panel, chapter tabs, and mobile selector.
4. Read the panel's `data-library-pdf-base`.
5. Clone and replace the PDF iframe with a new iframe whose source includes the requested physical page.
6. Increment `data-library-frame-revision` so the browser cannot reuse stale visible state.
7. Store `data-library-current-pdf-page` and `data-library-current-print-page`.
8. Update the page-status sentence.
9. Move focus to `data-library-reader-title`.

The separate `Open this chapter in a new tab` action remains a full-document action. It must not be mislabelled as exact-page navigation.

#### 6.7 Build native review routes

The six optional Review destinations are:

1. Review Overview.
2. Chapter 11 Review.
3. Chapter 12 Review.
4. Chapter 13 Review.
5. Review Seminar.
6. Unit A — Textbook Unit 5 Review.

Lesson 17 — **Integrated Regulation and Unit Mastery** — is the required capstone in the final **Integration and Mastery** subgroup under Lessons. It is intentionally outside Review so optional study routes are not confused with required completion work.

Each chapter review opens the exact summary page, presents the selected question range, requires an attempt before answer guidance, and links to related Practice Hub checks. The native Review Seminar is organized by concept and evidence, not by old slide order. The 35-page learner worksheet is optional historical reference only; the 90-page key is never a learner viewer.

Required corrections include:

- Chapter 12 choice wording `two from Q26-30`, not overlapping `two from 25-30`;
- Unit 5 review physically on printed pp. 468-471 even though the key title says pp. 466-469;
- corrected myelin, blood-brain barrier, pain, action-potential recovery, diabetes, homeostasis, respectful terminology, and non-diagnostic wording;
- no historical exam question-count claims.

#### 6.8 Link checked practice feedback to exact textbook pages

The contract contains 75 mappings:

- 51 Guided Practice items;
- 24 Final Practice items.

When a learner checks an answer, the feedback runtime looks up the stable `practiceId`, creates a local Library action, and writes either:

- `Find this in the textbook: Chapter <n>, p. <printed page>`; or
- `Closest textbook support: Chapter <n>, p. <printed page>`.

The control carries the same exact page attributes as lesson bands. Module Checks were deliberately excluded. The learner-facing title is `Final Practice`; the 24-item scoring and completion behavior remain unchanged.

#### 6.9 Apply the learner-language and layout pass

Scan every learner route for:

- SCORM, source hash, build, pilot, comparison, provenance, implementation, or completion-policy language;
- teacher directions such as “you do not need to memorize”;
- version labels and administrative status;
- overly technical headings or symbols;
- repeated generic filler panels.

Write outcomes as division-aligned learner-facing “I can” statements. Remove large lesson-level materials/safety cards. Retain the unit-level safety statement and move only genuine cautions beside the governed activity.

For all 17 retrieval blocks:

- prompt content occupies the first column;
- `.bio-retrieval-response` contains label, textarea, and save status;
- desktop columns top-align;
- mobile stacks prompt then response;
- no manual grid-row assignment remains;
- existing textarea IDs, response IDs, autosave hooks, placeholders, and values remain unchanged.

### Phase 7 — PowerPoint media intake and Video Library

#### 7.1 Verify and preserve the original PowerPoints

First-run source command:

```bash
npm run prepare:biology30-unit-a-pilot:media -- \
  --project biology30-unit-a-pilot \
  --chapter-11-pptx "/Users/deanguedo/Downloads/Unit A Chapter 11 Notes.pptx" \
  --chapter-12-pptx "/Users/deanguedo/Downloads/Unit A Chapter 12 Notes.pptx" \
  --chapter-13-pptx "/Users/deanguedo/Downloads/Unit A Chapter 13 Notes.pptx" \
  --check-video-links
```

Required hashes and counts:

| Deck | SHA-256 | Slides | Embedded media |
| --- | --- | ---: | ---: |
| Chapter 11 | `74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1` | 66 | 68 |
| Chapter 12 | `4162d8b6bc3ebe94a11b53ed2694932adccf41622a4473e785a46d57cd2184ea` | 29 | 34 |
| Chapter 13 | `05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482` | 43 | 50 |

Total: 138 slides, 152 media assets, 45 YouTube relationships, and three other external links.

For an idempotent rerun, use the content-addressed copies in the shared `_sources` directory rather than requiring the Downloads files again.

#### 7.2 Understand what the media command owns

The command:

- parses PPTX ZIP relationships and slide XML;
- records slide number, title/text hash, relationship file, media relationship, external relationship, treatment, and reason;
- stores one content-addressed copy of each deck;
- extracts only contracted authoring-reference media;
- optionally checks external video availability;
- stages output under `.media-resource-stage-*`;
- validates staged hashes and counts;
- promotes by rename;
- removes staging and rolls back promoted outputs on failure;
- never rewrites `workspace/index.html`.

Full slides, slide screenshots, thumbnails, text boxes, and presentation backgrounds are never learner lessons.

#### 7.3 Disposition every video before learner use

For each video record:

- source deck, slide, and relationship ID;
- provider and YouTube ID;
- accurate title;
- connected lesson or review route;
- concise `Watch for` prompt;
- complete local concept summary;
- caption status;
- availability and embedding check date;
- learner value and duplication review;
- `candidate`, `included`, or `excluded` disposition.

Exclude broken embedding, lower-authority duplicates, medical/self-help framing, and material outside Unit A. An available video is not automatically a good course video.

#### 7.4 Implement the optional preview without an extra play button

Lesson and library video surfaces use:

- `data-video-entry` to identify the exact video;
- `data-video-frame-host` for the stage;
- `data-video-load-status` for accessible status;
- `data-open-video` on a lesson-to-library link.

When the containing lesson or selected Video Library panel becomes visible, create:

```text
https://www.youtube-nocookie.com/embed/<video-id>?rel=0
```

Do not load hidden library entries. Do not autoplay. Do not add a custom `Play optional video` button. Keep `Watch on YouTube` as the direct fallback. If the network fails, the local summary still teaches the concept and course completion is unaffected.

The first representative slice contained Lessons 4, 9, and 15 plus five Video Library entries. On 2026-09-02, the teacher approved the next nine primary lesson placements and requested that every other usable course video remain available in the library. The resulting rule is:

- place one primary video beside each exact lesson concept when the match is strong;
- include all 35 available, curriculum-relevant videos in the Video Library;
- sort the library by chapter, then connected lesson, then source order;
- keep the ten unavailable, lower-authority, self-help, study-skills, or out-of-scope links excluded;
- retain a `Watch for` prompt, complete local summary, lesson return link, caption/availability record, and no-autoplay preview for every visible entry.

The 12 primary lesson videos are `A44brRGG4Ys`, `oa6rvUJlg7o`, `YcJy28Nnrb8`, `q8NtmDrb_qo`, `4WcZR_k_a0I`, `o0DYP-u1rNM`, `Ie2j7GpC4JU`, `eWHH9je2zG4`, `BYaR-JgbjCs`, `cDGmsR2ZILE`, `y9Bdi4dnSlg`, and `v-t1Z5-oPtU`. The two broad review entries remain in the Unit Review filter; the other usable alternatives remain under their instructional chapter and lesson.

### Phase 8 — figure selection, source images, and duplicate removal

#### 8.1 Use the visual decision tree

For each teaching purpose, decide in this order:

1. **Keep the current course interaction** when it changes learner reasoning, is scientifically accurate, accessible, and visually sound.
2. **Use a source image** when an exact textbook or PowerPoint visual is materially clearer and its rights status supports the intended delivery.
3. **Redraw as SVG or semantic HTML** when the source idea is useful but accuracy, labels, density, resolution, or rights are unresolved.
4. **Generate a ChatGPT Images candidate** when the existing course-made static figure is weak and no suitable rights-cleared source visual exists.
5. **Exclude the visual** when science or rights cannot be resolved.

After selecting a replacement, remove the visible duplicate. One teaching purpose should have one strongest visible figure. A hidden source/native fallback may remain only for reversible provenance or semantic equivalence; it must not create duplicate learner content.

#### 8.2 Prepare contracted source visuals transactionally

Run:

```bash
npm run prepare:biology30-unit-a-pilot:visuals -- \
  --project biology30-unit-a-pilot
```

The command reads [the source-visual contract](./source-visual-integration.json), verifies source checksums, and prepares exactly the contracted nine visuals. Each record includes:

- visual, lesson, and section IDs;
- source ID and kind;
- exact deck slide/media path or PDF page/crop rectangle;
- source-media checksum;
- output path;
- replacement or supplemental role;
- replaced figure slot when applicable;
- rights status and release blocker;
- alt text and long description;
- exact textbook page when available.

The command stages to `.source-visual-stage-*`, validates dimensions/checksums/contract fields, safely moves existing owned output aside, promotes by rename, restores the previous valid output if promotion fails, removes staging, and never edits the canonical HTML.

#### 8.3 Distinguish textbook and PowerPoint rights

- Textbook crops are authorized supplied course material for local delivery under the current record.
- A PowerPoint deck may be authorized while an embedded third-party image's original provenance remains unresolved.
- Unresolved embedded-image provenance is a release blocker even when the image is useful in a private pilot.
- Before promotion/export, clear rights or replace the image with an approved original redraw/generated asset.

The current unresolved source-visual blockers include the PowerPoint neuron anatomy, spinal-cord cross-section, reflex-arc anatomy, and eye anatomy plates.

#### 8.4 Integrate a source image accessibly

The direct learner placement needs:

- a semantic `<figure>` with a stable `data-source-visual` ID;
- intrinsic width/height or aspect ratio;
- responsive `max-width: 100%` behavior;
- useful `alt` text;
- nearby long description or equivalent table;
- keyboard-operable `View larger` dialog;
- focus return to the opener;
- an exact textbook page link where available;
- no required text readable only inside the raster;
- a recorded replacement/supplemental role.

Inspect both inline and enlarged states. A high-resolution source plate can still fail if it is unreadable at the evidence-lane size.

### Phase 9 — ChatGPT Images generation, comparison, correction, and integration

This phase was previously under-documented. It is now recorded in full.

#### 9.1 What was and was not automated

The repository did not call an image API to regenerate these assets. The teacher used an authenticated ChatGPT browser session with ChatGPT Images. Codex prepared the scientific prompts, reviewed results, built the local comparison surface, recorded teacher choices, recovered the selected full-resolution PNGs, integrated them, and ran exact-build checks.

No password, cookie, session token, or browser profile was read or stored. Private ChatGPT conversation URLs remain authoring-only provenance in [the comparison manifest](./visual-comparison/manifest.json).

#### 9.2 Select only weak static figure slots

Before prompting:

1. Inventory the current native SVG/HTML figures.
2. Exclude strong interactions and figures that already teach clearly.
3. Exclude source-image candidates being evaluated separately.
4. Capture the current figure for authoring-only comparison.
5. Name one exact `sourceSlot` and lesson purpose.
6. Write the misconception and accuracy checklist before visual style instructions.

Lesson 4's resting membrane and Lesson 12's endocrine body map were the first two generated-image trials. Ten additional slots were later compared: Lessons 1, 2, two Lesson 3 figures, 5, 8, 9, 10, 16, and 17.

#### 9.3 Write a decision-complete prompt

Every prompt should contain, in this order:

1. intended course level and figure purpose;
2. required composition and reading direction;
3. exact mechanisms or anatomy;
4. exact allowed labels and spelling;
5. known misconceptions and prohibited representations;
6. 16:10 landscape target and generous label margins;
7. scientific-editorial visual direction and palette;
8. prohibited decoration, logos, watermarks, fake data, and extra prose;
9. instruction to generate one finished image.

[The prompt record](./image-generation-prompts.md) now preserves the exact original prompts for all twelve figures and every recorded correction prompt. Do not depend on the private chat remaining available.

#### 9.4 Generate one candidate, then review the science before aesthetics

In ChatGPT:

1. Open a new image conversation.
2. Paste one figure prompt.
3. Generate one candidate.
4. Inspect anatomy, pathway direction, causal relationships, labels, and omissions at full size.
5. Compare against the lesson text, curriculum contract, current authoritative source, and misconception checklist.
6. If one problem exists, issue a narrow correction prompt that preserves correct parts.
7. Repeat only until the scientific error is resolved; do not accept a visually polished wrong diagram.
8. Download the selected full-resolution image.

Recorded correction history:

| Figure | Rejected issue | Accepted correction |
| --- | --- | --- |
| Lesson 9 retina | Retinal layers were organized incorrectly | `v2` uses continuous ganglion, bipolar, and photoreceptor columns with opposite light and neural-signal directions |
| Lesson 10 equilibrium | An angular-acceleration inset was connected to the saccule | `v3` keeps ampulla/cupula insets connected only to semicircular canals and the otolith inset connected only to utricle/saccule |
| Lesson 16 stress | “Return to baseline” was too static | Final image says “Return toward a workable range” |
| Lesson 17 integration | Osmoreceptors were made to detect low blood volume and the ADH sequence was incomplete | `v2` separates osmotic from volume/pressure evidence and shows hypothalamic synthesis, posterior-pituitary release, and kidney action |

#### 9.5 Build the local side-by-side comparison

The authoring-only comparison lives at [the visual comparison page](./visual-comparison/index.html). Its manifest stores, for each candidate:

- stable ID and title;
- lesson and exact source slot;
- current course figure image;
- candidate preview image;
- private ChatGPT conversation URL;
- scientific review;
- recommendation;
- comparison-time integration status.

The comparison manifest is an immutable review snapshot. Its `not-integrated` values describe the moment of comparison and are not the current learner status. Current integration state belongs in `generated-visual-integration.json` and the improvement ledger.

#### 9.6 Record teacher decisions separately from course acceptance

The teacher exported `biology30-unit-a-figure-decisions.json`. It was normalized into [the canonical teacher-decision record](./visual-comparison/teacher-decisions.json). All ten comparison candidates were selected.

A figure choice means “use this candidate in the pilot.” It does not mean:

- the image is scientifically accepted without correction;
- the exact learner placement is accepted;
- the whole course build is accepted;
- B-D may reuse the image;
- rights are cleared for public redistribution.

#### 9.7 Preserve the selected original and record provenance

For each selected asset:

1. Retrieve/download the full-resolution original, not the JPEG comparison preview.
2. Place it under `workspace/assets/generated-visuals/` with a stable descriptive name.
3. Record the source filename supplied by the teacher when available.
4. Compute SHA-256.
5. Record pixel dimensions.
6. Record provider `ChatGPT Images`; if the exact model version is unknown, say so rather than guessing.
7. Record generation/selection date and private-course rights authorization.
8. Record lesson, exact replaced slot, treatment, scientific-review status, alt/text/enlargement flags, and completion impact.

The canonical record is [the generated-visual contract](./generated-visual-integration.json). Public redistribution is not authorized by that record.

#### 9.8 Replace the exact figure once

The accepted learner pattern is:

- keep the original stable `<figure>` slot;
- add `data-media-treatment="reviewed-generated-visual"`;
- add `data-generated-visual="<stable-id>"`;
- insert the selected PNG once;
- preserve intrinsic dimensions and responsive sizing;
- retain the superseded semantic SVG hidden with `data-replaced-by-generated-visual="<stable-id>"` as reversible provenance;
- retain a nearby authored text equivalent;
- add keyboard enlargement and focus return;
- remove any second visible version of the same teaching diagram.

Raster labels are supplementary. The adjacent explanation is the accessible and editable source of meaning.

#### 9.9 Review in the real lesson, not only the comparison page

Inspect:

- inline evidence-lane size;
- `View larger` dialog;
- desktop, tablet, mobile, and 200% zoom;
- light/dark contrast within the image;
- text clipping and overlap;
- arrows crossing labels;
- whether image text remains readable;
- whether adjacent explanation and alt text cover the same meaning;
- whether the image duplicates another visible figure;
- print behavior;
- exact scientific relationship after placement.

Only after this pass may the contract status become exact-build reviewed. Teacher acceptance remains separate.

### Phase 9A — Core Vocabulary, morphology, Frayer evidence, and Process Collection

This phase creates a science-literacy layer between first-teach lessons and the complete glossary. It is not a renamed glossary, a definition-matching quiz, or an excuse to add every anatomical label to a card bank.

#### 9A.1 Freeze the vocabulary baseline

Before editing:

1. Hash `projects/biology30-unit-a-pilot/workspace/index.html`.
2. Record the current glossary count, route inventory, lesson IDs, practice IDs, model/interaction IDs, response IDs, persistence version, worst-case state size, and course-completion function.
3. Confirm the pilot remains `blocked`, preview-only, non-exportable, and Studio Edit disabled.
4. Confirm Units B-D and their builder-owned workspaces have not changed.
5. Record the canonical sources in `meta/core-vocabulary.json`; do not put the 28-entry instructional data only inside JavaScript.

The Unit A vocabulary baseline was 109 glossary terms, compact-state version 2, a measured 33,236-character worst case, and a 48,000-character build guard. The exact pre-vocabulary workspace SHA-256 was `fe147931e3f6c44ac4ad7ec44e1226b6d7a758daf4ab23b30d9da13669e5b77a`.

#### 9A.2 Select concept families rather than isolated labels

Build the selection sheet from five existing inventories:

- exact Unit A curriculum outcomes;
- lesson titles, explanations, figures, interactions, and artifacts;
- Guided Practice, Module Check, and Final Practice concepts;
- textbook chapter/page mappings;
- the full glossary.

For every candidate, record whether it is outcome-required, mechanism-critical, recurrent, morphology-rich, commonly confused, diagram/data-critical, or likely to recur later in Biology 30. At least one of the first three conditions is required. Group inseparable terms into one teachable family—for example, stimulus/receptor/control centre/effector/response or insulin/glucagon/glycogen/hyperglycemia—so the learner studies a relationship rather than a pile of labels.

The Unit A contract fixes 28 families. That exact number is an authored decision for this unit, not a reusable quota. Future planning budgets are approximately 30 for Unit B, 42 for Unit C, and 24 for Unit D, but each remains unapproved until its own audit.

#### 9A.3 Build the machine-readable contract first

For each family in `meta/core-vocabulary.json`, author and validate:

- a stable kebab-case ID and learner-facing label;
- category and family terms;
- exact primary lesson IDs and inherited outcome IDs;
- learner-friendly meaning and biological mechanism;
- a declared word-analysis treatment;
- related terms and a specific common confusion;
- a retrieval prompt;
- exact textbook document, printed page, physical PDF page, and direct/closest support status;
- existing practice IDs and model/interaction ID;
- four model-Frayer responses, each at or below 240 characters;
- source-reference IDs with rights/use records;
- fixed-milestone status where applicable.

Reject unknown lesson, outcome, practice, model, source, or textbook IDs. Printed and physical page differences must match the existing chapter maps: Chapter 11 uses `physical = printed - 359`, Chapter 12 uses `physical = printed - 403`, and Chapter 13 uses `physical = printed - 433`.

#### 9A.4 Use one of five explicit word-analysis treatments

- `morpheme`: explain meaningful roots or affixes, such as `homeo- + -stasis`.
- `word-family`: connect forms such as regulate, regulation, and regulated.
- `acronym`: expand and interpret terms such as ADH, ACTH, PTH, or TSH.
- `name-history`: explain why an eponym or historically opaque label cannot be decoded reliably.
- `whole-phrase`: unpack a technical phrase whose meaning depends on the whole construction.

Always label morphology as a meaning clue, not the scientific definition. Add a caution whenever word parts could invite a false mechanism. `Sympathetic` and `parasympathetic`, for example, must not be taught as if their names predict a universal organ effect.

#### 9A.5 Design the science-adapted Frayer evidence

Use the same four fields for every eligible concept:

1. My definition in context.
2. Essential characteristics or mechanism.
3. Unit A example or evidence.
4. Non-example or common confusion.

Assign six fixed module anchors: negative feedback, action potential, reflex arc, sensory transduction, endocrine signalling, and a revised end-of-unit homeostasis model. Permit two additional learner choices from the remaining families. Every family still needs a professional model because any non-fixed family can become a choice.

Keep the course model hidden until all four learner fields contain an attempt. Revealing it must never overwrite the learner's writing. If an attempted field becomes empty, hide the model again. Autosave all four fields; require all four before **Add to Process Collection**. Removing a collected entry clears only the collection flag. Clearing written choice work requires an explicit, scoped confirmation and must not affect any other concept.

#### 9A.6 Render static instruction and attach behavior

Keep meanings, morphology, mechanism, confusions, links, prompts, and model responses as semantic canonical HTML. JavaScript may select, filter, save, reveal, collect, restore, and focus that content, but it must not replace the instructional body after page load.

Use one restrained index-and-reading-panel layout:

- search by term, related term, or word part;
- module/category filter;
- desktop term index and mobile selector;
- one visible semantic concept reading at a time;
- quiet text links to the exact lesson, textbook page, and existing model;
- vocabulary-only progress shown as `x of 8 collected`;
- no card wall, dashboard, gradients, oversized pills, or separate design language.

Add a compact **Word lens** line at the point a term becomes useful in a lesson. It should deep-link to the exact concept and focus its reading heading. Do not mechanically add vocabulary links to every paragraph or every practice item.

#### 9A.7 Derive Process Collection output from canonical responses

Place Core Vocabulary after Exit Slips and before learner-created process notes. Read the four Frayer fields from the canonical response map and the collected flag from vocabulary state. Do not persist a second copy of the learner's text. Show fixed/choice status, concept title, all four responses, draft/collected status, and an exact return link. Include collected entries in print and copy summaries.

Vocabulary progress must not enter the main course progress bar, lesson-exit count, artifact requirement, Final Practice score, or SCORM completion calculation.

#### 9A.8 Version and bound persistence

Use stable IDs of the form:

```text
biology30-unit-a-pilot:core-vocabulary:<entry-id>:definition
biology30-unit-a-pilot:core-vocabulary:<entry-id>:characteristics
biology30-unit-a-pilot:core-vocabulary:<entry-id>:example
biology30-unit-a-pilot:core-vocabulary:<entry-id>:non-example
```

Declare all 112 possible IDs but normalize stored Frayer responses to the six fixed and two current choices only: at most 8 entries and 32 response fields. Add compact-state version 3 with `w: [activeTermToken, choiceTermTokens, collectedTermTokens]`. Version-2 state must load unchanged and receive an empty vocabulary state. Version-3 normalization must reject unknown tokens, cap choices at two, cap collected entries at eight, require collected IDs to be fixed or currently chosen, and preserve the last valid serialized state on overflow.

The conservative Unit A envelope is 41,378 characters. That is 2,622 below the 44,000-character vocabulary target and 6,622 below the existing 48,000-character build guard.

#### 9A.9 Build a representative slice before all 28 learner views

The Stage 1 slice deliberately tests five different authoring problems:

- `homeostasis`: transparent morphology and a commonly oversimplified definition;
- `action-potential`: mechanism, phases, threshold, and a fixed Frayer;
- `sympathetic-parasympathetic`: opaque historical terminology and a learner-choice flow;
- `sensory-transduction`: reusable roots and a cross-sensory mechanism;
- `endocrine-signalling`: receptor-bearing target-cell precision.

Add only five representative Word Lens placements for Stage 1: Lessons 1, 4, 6, 8, and 12. Pause after verifying the slice. Do not quietly expand the other 23 concept views or all 17 lesson mappings before teacher acceptance of depth, morphology, prompts, density, and Process Collection presentation.

The teacher accepted the exact Stage 1 slice at workspace SHA-256 `1b283ef4795a01ecefdbfbeb1bdd290e77210967fd1f0012b7b5f71a35bd2c47` on `2026-09-02`, authorizing the complete Stage 2 implementation. Preserve that accepted slice hash and report as historical gate evidence; do not overwrite or relabel it as the current build.

#### 9A.10 Verify the exact slice

Run:

```bash
npm run test:biology30-unit-a-core-vocabulary-pilot
npm run test:e2e:biology30-unit-a-improvement-pilot -- --grep "Core Vocabulary"
npm run audit:biology30-unit-a-core-vocabulary-pilot:visual -- --project biology30-unit-a-pilot
```

The Stage 1 focused visual audit must capture all five concept/Frayer/collection states and all five representative Word Lens placements at 1440x900, 1024x768, and 390x844, plus desktop and mobile 200% zoom. Open every generated contact sheet. Bind the report and workspace hashes in `meta/core-vocabulary.json` and `meta/improvement-ledger.json`. A passing Codex review leaves `teacherAcceptance: pending`; only the teacher can set `stage2Authorized: true` for the accepted exact slice.

#### 9A.11 Complete Stage 2 only after slice acceptance

After explicit acceptance of the exact Stage 1 hash:

1. Change the contract state to Stage 2 in progress while leaving the accepted Stage 1 hash immutable.
2. Render all 28 entries in contract order in the desktop index, mobile selector, and semantic reading panels.
3. Render six fixed Frayers and 22 learner-choice Frayers, producing all 112 declared fields while still normalizing saved text to the six fixed plus two current choices.
4. Extend the runtime label and rendered-ID maps to all 28 contract IDs; do not fork a second state model.
5. Add the contracted Word Lens sequence to every lesson and preserve lesson IDs, response IDs, completion logic, required minutes, practices, and artifacts.
6. Test the two-choice cap, attempted-choice clear confirmation, model reveal, collection isolation, exact deep-link focus, version-2 migration, and state envelope.
7. Generate a new exact-build audit. Inspect all 28 concepts at desktop, tablet, and mobile sizes; representative default/search/filter/Frayer/reveal/choice-limit/collection states; every lesson Word Lens; and desktop/mobile 200% zoom.
8. Bind the new workspace, workspace-tree, report, and contact-sheet evidence to a new Stage 2 review record. Keep the full rule at `awaiting-teacher-review` until the teacher accepts this complete build.

### Phase 9B — Pilot 2 teacher-feedback rebuild and iterative refinement

Pilot 2 is not a cosmetic copy of Pilot 1. It is a separate experiment in prerequisite-first teaching, readable explanation, teacher-plan sequencing, required multimedia sense-making, and evidence-producing models. Preserve Pilot 1 as the advanced historical comparison and keep every Pilot 2 iteration tied to its own exact learner hash.

#### 9B.1 Fork the experiment without overwriting Pilot 1

The initial Pilot 2 fork used:

```bash
npm run create:biology30-unit-a-pilot-2 -- \
  --source biology30-unit-a-pilot \
  --project biology30-unit-a-pilot-2 \
  --source-workspace-sha b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee
```

The command must refuse an existing target, refuse source-hash drift, stage files in a temporary sibling directory, validate the complete project, and promote by atomic rename. It must preserve the Pilot 1 starting HTML as Pilot 2's immutable raw baseline, copy only approved learner assets, create explicit old-to-new route and response-ID maps, and namespace all new state under `biology30-unit-a-pilot-2:`. It must not edit Pilot 1, Units A-D, exports, deployments, or shared source archives.

Record before the fork and before every later rebuild:

- branch, commit, and dirty-tree state;
- Pilot 1 workspace and project-tree hashes;
- production Units A-D project-tree hashes;
- target workspace hash, route inventory, state version, response/practice/model IDs, completion function, and time contract;
- exact command arguments and expected immutable baseline;
- rollback location and whether the command was a no-op, successful promotion, or refusal.

#### 9B.2 Establish the source hierarchy and thirteen-topic sequence

Use the sources in this order of authority:

1. Alberta Biology 20-30 Program of Studies and current Biology 30 performance/exam guidance determine what is required and assessable.
2. The teacher's daily plans and PowerPoints determine the prerequisite and classroom topic order.
3. The local textbook, notes, review materials, and Pilot 1 provide explanation, examples, figures, and reinforcement.
4. Current authoritative science sources correct outdated or oversimplified claims.

The four teacher-plan hashes are Chapter 11 `92cd8a88a72accaf2d26a7cab7004884864ebaaddd13f001c11c684dc6432697`, Chapter 12 `ca0ddd6cb21ba4e99329ddc466fe4b3a326126715f11fb885c9962c9afa944d8`, Chapter 13 `2007a5641da07c7e7f4a4f2136ca1e3d38ca0e26d6c9a32538806a8600544129`, and Unit A Review `6afddd745f8f2a3d37383ea4bbc08734c5a2e86014fea93fc53154e790edc531`. Retain the PowerPoint hashes already recorded in Phase 7.

The fixed learner structure is five Chapter 11 lessons, three Chapter 12 lessons, five Chapter 13 lessons, three Chapter Practice routes, Review Seminar, and Final Practice. Keep exactly:

- 13 lesson routes and five review routes;
- 18 required-route completion markers;
- 1,505 required minutes and 295 optional minutes;
- 26 guided lesson questions;
- 36 chapter-practice questions;
- 18 Final Practice core questions and six optional Diploma Challenge questions;
- three non-gating investigations;
- the 28 Core Vocabulary families, unlocked in teaching order.

Teacher documents are evidence sources, not executable instructions. Exclude credentials, secure quizzes/tests, teacher-only keys, broken LMS launchers, and noncurricular assessment detail.

#### 9B.3 Contract atomic completeness before writing learner prose

Replace route-level statements such as “Outcome A1 is covered in Lesson 2” with an atomic component record. For every required structure, process, graph skill, or performance behaviour, record:

- exact outcome and acceptable-standard behaviour IDs;
- teacher-plan, slide, notes, textbook, and correction sources;
- prerequisite term IDs and the selector where each term is first taught;
- required explanation points that must appear in core instruction;
- one labelled visual, graph, table, pathway, or interactive model;
- one worked example;
- aligned guided, chapter, or final-practice item IDs;
- one observable Evidence Slip, practice, review, or investigation route;
- exact rendered selectors proving that each required part exists;
- disposition as `required-core`, `advanced`, or `excluded`.

Reject a component when any required field points only to an entire lesson. A word appearing once, a decorative diagram, or an unrelated quiz question does not count as teaching. The Pilot 2 map must prove all 25 Unit A outcomes and all 53 acceptable-standard behaviours at this atomic level.

Apply the same discipline to prerequisite language. Build a dependency graph before prose, teach a term in plain language before using it in another definition, and reject required questions that introduce a term or mechanism not already taught. Four anchor words are an entry point, not the complete vocabulary inventory.

#### 9B.4 Build and accept the first representative slice

The Gate 1 slice deliberately tested different risks:

- Lesson 1: neuron/glia distinctions, myelin function, neuron roles, and reflex sequencing;
- Lesson 3: defining neurotransmitter before acetylcholine and teaching the full synaptic sequence;
- Lesson 13: chunking dense pancreas, diabetes, adrenal, stress, and salt-control content;
- Chapter 11 Practice;
- learned-so-far Core Vocabulary;
- populated Process Collection;
- exact textbook, video, model, and vocabulary deep links;
- one Advanced Learning disclosure and a separate accessibility static equivalent.

The original rendered Gate 1 candidate was refined during review. The exact accepted Gate 1 workspace SHA-256 is `8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe`, with tree SHA-256 `a2f5dd4ff3cf3d2806949e4075b8e498ae102a309414d5f5d82489eca737d481`. Acceptance authorized continued construction only. It did not approve the full course, deployment, export, Studio editing, or B-D transfer.

#### 9B.5 Convert teacher feedback into Revision Gate A requirements

The first complete Gate 2 candidate, SHA-256 `9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7`, was changed to `changes-requested` after the teacher found that the language was improved but too brief, required detail and diagrams were still missing, the four-word list implied incomplete vocabulary coverage, and videos needed to be part of required sense-making.

Preserve that exact candidate and its contracts under `raw/gate-2-review-baselines/`. Do not rewrite history by calling it accepted. Translate the feedback into testable rules:

- 700-1,050 core instructional words per lesson, with Lesson 13 permitted up to 1,200;
- Flesch-Kincaid target 9.5-11.5 and hard ceiling 12;
- complete descriptive sentences, 40-100-word paragraphs, and approximately 20 words per sentence or fewer;
- no more than approximately 250 core words without a visual, check, graph, table, or worked example;
- four visible anchor words plus a native `<details>` inventory of every new and reused scientific term;
- three or more Learn blocks, a worked example, retrieval after teaching, two guided questions, and one Evidence Slip;
- at least four purposeful visual/data objects per lesson;
- an accurate action-potential graph and other curriculum-required diagrams/data, not merely topic illustrations;
- one required media checkpoint per lesson, with two checkpoints in Lesson 13.

Build Revision Gate A with Lessons 2, 5, 11, and 13 because together they test graph literacy, anatomy completeness, video/local-equivalent parity, hormone source-target-effect reasoning, dense content chunking, and two-media handling. The accepted Revision Gate A workspace SHA-256 is `3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff`, with tree SHA-256 `b341400a305ec5c2ba75aba322d58d07ed500ba4642388c4bece03a9c2e17cbc`. Preserve it under `raw/revision-gate-a-accepted/`.

Only five rule families were accepted for that four-route slice: atomic component coverage, expanded readable explanations, four anchors plus complete terms, required video-or-local-equivalent, and nondestructive media-aware state migration. Their slice acceptance does not make the complete Revision Gate B course teacher-accepted.

#### 9B.6 Propagate the accepted teaching pattern to all thirteen lessons

Keep the authored inputs in:

- `scripts/lib/biology30-unit-a-pilot-2/full-content.ts` for authored lesson, visual, term, practice, and local-equivalent content;
- `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts` for the shared learner shell, route rendering, interactions, persistence, and styling;
- `scripts/lib/biology30-unit-a-pilot-2/build-full.ts` for transactional staging, baseline checks, generated reports, and rendered-contract validation.

Apply the Revision Gate A structure to the remaining nine lessons without flattening their science into a repeated template. For every lesson:

1. Open with a phenomenon or question and state what prior knowledge is needed.
2. Show four anchor words, then the full new/used-again term disclosure.
3. Teach the first mechanism in readable paragraphs beside a labelled visual.
4. Insert Stop and Check before adding the next conceptual load.
5. Teach the second mechanism beside a visual, table, model, or data example.
6. Complete the required media pathway and common checkpoint.
7. Teach graph, pathway, or evidence interpretation through a worked example.
8. Place current-topic retrieval only after those ideas are taught.
9. Ask exactly two prerequisite-ready guided questions.
10. Save one short Evidence Slip.
11. Keep deeper in-scope material in optional Advanced Learning; never hide required teaching there.

Re-audit all 80 required questions and six optional challenges after propagation. Preserve a response ID only when the prompt meaning and answer key remain equivalent. Give a materially replaced item a versioned identity so old answers cannot attach to new science.

#### 9B.7 Make multimedia required without making YouTube a dependency

Pilot 2 uses 14 required media checkpoints across 13 lessons. Each checkpoint has one curated YouTube path and one complete local illustrated walkthrough. The learner chooses a path, but both end at the same low-pressure sense-making question. Completion records the checkpoint response—not claimed watch duration.

For every media checkpoint:

1. Review the exact clip for availability, captions, factual accuracy, pace, relevance, and alignment with what has already been taught.
2. Show the native YouTube preview without autoplay and without a custom Play button.
3. Provide a direct YouTube/caption fallback.
4. Author the local equivalent as ordered visuals plus explanatory captions, not a short paragraph labelled as equivalent.
5. Give both paths the same `Watch for` purpose and checkpoint prompt.
6. If the player fails or the network is blocked, open the local path automatically and keep completion possible.
7. Keep video requests, analytics, and playback outside saved state; save only the selected path and checkpoint response/completion.

Container width matters more than global viewport width. The local four-step walkthrough was initially forced into four narrow columns inside a split media stage. Replace that with a container-aware two-column layout and then one-column sequence before headings or explanations become vertical strips. Preserve step order, minimum readable width, wrapping, and normal content height.

#### 9B.8 Restore navigation and place evidence-producing tools correctly

The first Revision Gate B propagation accidentally removed the desktop course-navigation collapse control and reduced Model Lab to a shallow subset. Preserve the pre-repair SHA `cc968289c232ebeee5db0572426ea519806da8920c44dc4a3de008597e85a261` as `changes-requested`.

Restore the persistent desktop collapse control while keeping the mobile drawer as a separate responsive behaviour. Organize the five navigation groups as Start, Learn, Practice & Review, Process Collection, and Resources. Put Core Vocabulary and Models and Data Lab under Process Collection because they create learner-owned evidence; leave textbook, video, glossary, and source reference tools under Resources.

Deep links must carry an exact requested state. A lesson-to-model link selects the correct model; a term link selects the correct vocabulary family; a textbook link selects the chapter and physical PDF page; and a video link selects the exact library entry. A generic hub landing state is not a successful deep link.

#### 9B.9 Restore Pilot 1 interaction depth, then explain the investigation cycle

Pilot 2 originally reduced Model Lab to three short examples. Restore one lesson-linked model for each of the thirteen lessons and adapt the useful interaction purpose from Pilot 1 without copying its higher reading load. The lab must include:

- 13 stable model IDs and 49 authored scenarios;
- graph explorers for action potential, receptor evidence, hearing, ADH, and glucose/stress where data interpretation is central;
- pathway builders or evidence cases for the remaining mechanisms;
- a visible change in graph, pathway, highlighted mechanism step, evidence, and explanation when a scenario changes;
- complete data tables or static equivalents for every graph;
- exact return links to the teaching lesson;
- optional add/remove evidence actions for Process Collection.

The four mechanism steps also failed at an annotated 1117 by 902 layout because four columns became too narrow. Preserve pre-fix SHA `b280c64e8eb144590bce5fcb3bf984de43ae1fc9fef5dfdc0f28ba051fac4161` as `changes-requested`. Use two columns when the reader has enough width and one column when the sidebar, model index, tablet layout, mobile layout, or 200% zoom reduces the component's own width.

The name `Model Lab` and its initial instructions were too vague. Rename the learner route **Models and Data Lab** and make every model state:

- the investigation question;
- what the learner is trying to understand;
- what changes between cases;
- what stays controlled;
- what evidence to inspect;
- the sequence **Predict, Test, Explain, Save**.

Require a written prediction before revealing the result. Require a tested result and learner explanation before adding a new record to Process Collection. A scoped reset clears only the active model. Preserve pre-change SHA `2ea73014993b01e6cd64b0000d1c59d21d03ff3ed4c5af4617f009599babc3ae` as `changes-requested` so the vague version cannot be mistaken for the accepted pattern.

#### 9B.10 Version learner state after each new behaviour

Keep the existing Pilot 2 storage key and public stable IDs. Evolve compact state deliberately:

| Version | Added state | Migration requirement |
| --- | --- | --- |
| 1 | Base Pilot 2 responses, practice, route completion, vocabulary, notes, and Process Collection | Starting schema. |
| 2 | Selected video/local path, 14 media-check responses, and media completion | Load version 1 unchanged; recalculate completed lessons as `Needs media check` without deleting prior work. |
| 3 | Model scenario selections and collection flags | Load versions 1-2 unchanged; add model state only when used. |
| 4 | Thirteen predictions and explanations plus deterministic hashed storage keys | Preserve public IDs and versions 1-3; derive authored results instead of storing bulky content. |
| 5 | Four allowlisted textbook-review attempt flags | Preserve versions 1-4; reject unknown attempt IDs and keep answer guides collapsed after reload. |

At every version:

- normalize and allowlist IDs before accepting restored data;
- cap bounded collections;
- preserve the last valid state if a new write exceeds the guard;
- never store image data, HTML, transcripts, answer-guide content, or authored scenario text;
- test empty, partial, complete, migrated, corrupted, unknown-ID, and worst-case fixtures;
- prove that a scoped reset or hide action cannot erase unrelated responses.

The current version-5 worst case is 39,031 characters: 8,969 below the 48,000-character runtime guard and 20,969 below the 60,000-character platform limit.

#### 9B.11 Keep locked vocabulary previews understandable and operable

The `Learned so far` filter initially leaked future-term buttons because a shared button display rule overrode the `hidden` attribute. In `All term names`, those leaked buttons were disabled, so clicking a term appeared to do nothing. Preserve pre-fix SHA `b6eaba5b1f543a62e8971a55b36e5705df01e0f14adc7eaddafcd81989da0e8f` as `changes-requested`.

The corrected behaviour is:

- `Learned so far` truly removes future terms from the index;
- `All term names` exposes an operable orientation preview;
- selecting a future term updates the reading panel to a concise locked explanation, names the lesson where it will be taught, and provides an exact lesson link;
- meaning, morphology, mechanism, retrieval, model response, and Frayer controls remain hidden until the teaching lesson has begun;
- focus, selected styling, mobile selector, search, saved active term, and existing learner work remain consistent.

Test the exact user action—clicking a visible locked term—not merely whether its button exists in the DOM.

#### 9B.12 Add textbook review inside existing practice routes

Keep the authored review map and native answers in `scripts/lib/biology30-unit-a-pilot-2/textbook-review-content.ts`. Generate `meta/textbook-review-integration.json` from that map and validate it against rendered HTML. Do not read Pilot 1 at runtime.

Place each optional review block immediately before its course questions:

| Route | Assignment | Exact opening | Native answers |
| --- | --- | --- | ---: |
| Chapter 11 Practice | Summary p. 401; Q2-18 and one of Q22-24 on pp. 402-403 | Chapter 11 PDF page 42 for summary, 43 for questions | 20 |
| Chapter 12 Practice | Summary p. 431; Q1-25 and two of Q26-30 on pp. 432-433 | Chapter 12 PDF page 28 for summary, 29 for questions | 30 |
| Chapter 13 Practice | Summary p. 463; Q2, Q6, Q10, Q12-19, Q23-25, and one of Q26-30 on pp. 464-465 | Chapter 13 PDF page 30 for summary, 31 for questions | 19 |
| Final Practice | Unit A — Textbook Unit 5 Review, Q1-51 on pp. 468-471 | Chapter 13 PDF page 35 | 51 |

Use `I attempted the textbook review` as the gate. After confirmation, show a separate Show/Hide answer-guide control. Persist only the attempt flag. On reveal, focus the answer heading; on hide, return focus to the control. On reload, remember the attempt but reopen the guide collapsed. Keep all 120 reviewed native answers in normal document flow without nested scrolling. Jump links must focus the 12-question or 18-core-question heading.

The review is non-graded reinforcement. It cannot change the 36 chapter items, 18 final core items, six challenges, score, required-route completion, progress, or time. Preserve the correction that the source key title says pp. 466-469 while the actual Unit 5 review is on printed pp. 468-471. Preserve pre-integration SHA `24e18ca81a7bf33a0182825be95472fa2a3f6ac55b779f90f14855e25ee9c66c` as `changes-requested`.

#### 9B.13 Rebuild transactionally and bind review to one exact candidate

The teacher-feedback rebuild interface is:

```bash
npm run build:biology30-unit-a-pilot-2 -- \
  --project biology30-unit-a-pilot-2 \
  --accepted-gate-1-sha 8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe \
  --baseline-gate-2-sha 9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7 \
  --revision teacher-feedback-1
```

Before replacing an existing candidate, content-address it under the appropriate `raw/*-review-baselines/<sha>/` directory and mark the review record `changes-requested`. Build in staging; verify contracts, learner HTML, asset existence, protected project hashes, and state budget; then promote only after all checks pass. A failed stage must leave the currently reviewable workspace intact.

The current Revision Gate B candidate has learner SHA-256 `912a213fd62e503b99d9c42f28b1094f8a4f4e31d9772513013adbc02ef4707e` and workspace-tree SHA-256 `f3ae4822477fe3165023e82d3f96eb0476a1a2e7fb2fbde9cf57cb9a3c6cbf41`. Its exact visual report is `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-04T16-05-02-890Z/report.json`. The report contains 78 route captures, 137 state captures, and 30 opened contact sheets, with zero recorded geometry findings.

The same exact learner hash is currently deployed at `https://biology30pilot.web.app` for public teacher review only. Verify a hosted deployment by hashing the live index and inspecting the route, iframe/player behaviour, console, responsive layout, and horizontal overflow; deployment logs alone are not evidence. Any subsequent workspace change makes both the exact visual evidence and review deployment stale until rebuilt, redeployed under explicit authorization, and rechecked.

Current Revision Gate B remains `awaiting-teacher-review`. Do not call it accepted, promote it, export it, enable Studio editing, or transfer its rules to B-D until the teacher explicitly accepts this exact learner hash.

### Phase 10 — persistence, identity, and completion invariants

Visual and content improvements must not erase learner work.

#### 10.1 Stable identity rules

- Never change an existing `data-bio-response-id` merely because copy moved.
- Never renumber practice IDs when adding textbook feedback.
- Never change artifact IDs when changing layout.
- Deep links must target stable route/section IDs.
- Core Vocabulary fields use the stable concept-family ID plus one of four fixed field suffixes; changing a display label must never change that response identity.
- Textbook attempt flags use the pilot namespace and are isolated from lesson completion.
- Video selection does not enter required completion state.
- Hiding an answer, resetting an interaction, or removing a notebook entry affects only that item.

#### 10.2 Persistence behavior

- ordinary lesson fields autosave;
- artifact drafts use explicit Save actions;
- notebook entries use explicit Save and retain a 10-entry limit;
- practice saves choice, feedback visibility, and submission state;
- interaction reset does not erase unrelated responses;
- Save failures show a visible retry/export message;
- a later oversized write must not destroy the last valid saved state.

#### 10.3 State budget

The current canonical budget record is [the Gate 2 persistence report](../../biology30-unit-a/meta/gate-2-persistence-budget.json):

- platform hard limit: 60,000 characters;
- build guard: 48,000 characters;
- pre-vocabulary measured worst case: 33,236 characters;
- Stage 1 conservative vocabulary envelope: 41,378 characters;
- remaining headroom below the 48,000-character build guard: 6,622 characters;
- overflow policy: preserve the last valid state.

Do not add large image data, transcripts, arbitrary HTML, or unlimited text to suspend data.

#### 10.4 Completion and score

Course completion remains:

- all 17 lesson exits complete;
- all seven artifact checkpoints have a saved draft;
- Final Practice submitted at least once.

The final-practice percentage is the raw score. Success status remains `unknown` because this is not the secure summative test. Textbook practice, answer reveals, videos, optional extensions, vocabulary Frayer work, vocabulary collection, comparison decisions, and source-image viewing do not gate completion.

### Phase 11 — exact verification and visual evidence

#### 11.1 Run the relevant preparation commands first

Use only when their inputs or owned outputs changed:

```bash
npm run prepare:biology30-unit-a-pilot:textbook -- --project biology30-unit-a-pilot

npm run prepare:biology30-unit-a-pilot:media -- \
  --project biology30-unit-a-pilot \
  --chapter-11-pptx projects/resources/biology30-unit-a-pilot/_sources/74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1.pptx \
  --chapter-12-pptx projects/resources/biology30-unit-a-pilot/_sources/4162d8b6bc3ebe94a11b53ed2694932adccf41622a4473e785a46d57cd2184ea.pptx \
  --chapter-13-pptx projects/resources/biology30-unit-a-pilot/_sources/05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482.pptx \
  --check-video-links

npm run prepare:biology30-unit-a-pilot:visuals -- --project biology30-unit-a-pilot
```

#### 11.2 Run the focused and compatibility suites

```bash
npm run test:biology30-unit-a-improvement-pilot
npm run test:biology30-unit-a-core-vocabulary-pilot
npm run test:biology30-unit-a-media-pilot
npm run test:science-comparison
npm run verify -- --project biology30-unit-a-pilot --mode workspace
npm run validate:manifests
npm run build:studio
```

These prove contracts, hashes, mappings, exclusions, IDs, owned outputs, source isolation, and project validity. They do not replace browser inspection.

#### 11.3 Run interaction and responsive E2E after learner changes

```bash
npm run test:e2e:project -- --project biology30-unit-a-pilot
npm run test:e2e:biology30-unit-a-improvement-pilot
```

The pilot E2E covers:

- all learner routes at 1440x900, 1024x768, and 390x844;
- all 17 retrieval blocks on desktop and mobile;
- exact textbook chapter/page opening;
- answer-attempt persistence and isolated hiding/reset;
- Library switching and offline use;
- Video Library exact selection and no autoplay;
- source and generated figure enlargement/focus return;
- guided and Final Practice textbook links;
- Core Vocabulary deep links, search/filter, learner choice, Frayer reveal, collection, version-2 migration, and mobile reflow;
- notebook, artifact, lesson, practice, reload, and state restoration;
- keyboard operation, reduced motion, mobile reflow, and axe checks.

#### 11.4 Generate exact-build contact sheets

```bash
npm run audit:biology30-unit-a-improvement-pilot:visual
npm run audit:biology30-unit-a-core-vocabulary-pilot:visual -- --project biology30-unit-a-pilot
```

The audit captures route and component states, checks geometry, and writes a report under `.runtime/biology30-unit-a-improvement-pilot-visual-audit/<timestamp>/`.

For every path listed under `manualReview.contactSheets`:

1. Open the image at full useful detail.
2. Inspect text fit, clipping, overlap, reading hierarchy, arrows, labels, controls, feedback state, and responsive reflow.
3. Inspect inline and enlarged generated figures.
4. Inspect source-image placements.
5. Inspect representative lesson videos and every Video Library selection state.
6. Record `allContactSheetsOpened: true` only after every sheet was actually viewed.

The prior full-pilot build produced 54 contact sheets and zero geometry findings. The accepted Stage 1 Core Vocabulary slice has its own seven-sheet historical audit. The current Stage 2 implementation has a separate seven-sheet exact-hash audit covering all 28 entries at three viewports, ten representative state captures at each viewport, all 17 Word Lens placements at each viewport, and two 200% zoom views. Automated geometry alone is not acceptance, and historical evidence must remain bound to its original workspace hash instead of being relabelled as current.

#### 11.5 Run course doctor with the intentional blocked expectation

```bash
npm run course:doctor -- --project biology30-unit-a-pilot
```

Expected result: refusal for `not-active` only. Any additional diagnostic is a failure. Do not “fix” `not-active`; the pilot is deliberately blocked.

#### 11.6 Recompute and bind hashes

After the final learner change:

1. Hash `workspace/index.html`.
2. Hash the complete pilot workspace tree.
3. Hash the visual report.
4. Write those exact values to the improvement ledger and generated-visual review record.
5. Recompute B-D workspace tree hashes and prove they did not change.
6. Run `git diff --check` on the touched paths.

Any later learner change makes previous visual evidence stale.

### Phase 12 — teacher review, acceptance, and review-only deployment

#### 12.1 Distinguish four different approvals

- **Contract approval:** approves outcome/source/sequence decisions for one contract hash.
- **Slice approval:** approves a representative learner experience for one build hash.
- **Figure selection:** chooses a candidate for integration; it is not exact-course acceptance.
- **Exact-build acceptance:** accepts named ledger rules and the whole reviewed learner build at one workspace hash.

Never infer one from another.

#### 12.2 Present the exact build for review

Provide:

- exact workspace hash;
- exact visual-report hash;
- route list and representative review path;
- unresolved rights or science blockers;
- the 17 rule IDs;
- a plain-language statement of what acceptance would and would not authorize.

If the teacher requests a change, the build hash changes and the exact-build acceptance review restarts after verification.

#### 12.3 Optional public review deployment

The current pilot was later authorized for teacher review only at `https://biology30pilot.web.app`. The durable record is [the review-deployment contract](./review-deployment.json).

That approval means:

- teachers may inspect and leave notes;
- learner release is false;
- no learner data or secure assessment material may be present;
- unresolved source-image provenance limits distribution to named reviewers;
- Studio editing, SCORM export, Brightspace upload, and production promotion remain unauthorized.

A deployment is not complete evidence until the hosted route and learner surface are opened and visually verified. The deployment record must name the exact source hash; malformed or stale hash fields invalidate the record.

#### 12.4 Record teacher acceptance

When the teacher explicitly accepts:

1. Record the exact workspace hash, date, reviewer, accepted rule IDs, known exceptions, and wording of the decision.
2. Change only those ledger entries to `teacher-accepted`.
3. Update the rolling transfer index.
4. Append a chronological journal entry.
5. Keep unaccepted rules pending.
6. Update the active handoff.
7. Treat the accepted rules as eligible for B-D gap audits, not transferred.

Promotion, Studio editing, SCORM export, Brightspace upload, publication, commit, and push remain separate actions requiring separate authorization.

### Phase 13 — update this living record after every cycle

Every future improvement cycle must update all of the following before handoff:

1. **Playbook journal:** append what was observed, changed, tested, accepted, rejected, or superseded.
2. **Rolling transfer index:** update implementation and review state for the affected rule.
3. **Machine ledger:** update evidence, exact hashes, owner, test, manual check, and B-D applicability.
4. **Relevant contract:** update textbook/media/source/generated visual records when inputs, mappings, rights, or outputs changed.
5. **Exact evidence:** regenerate visual evidence when learner content or layout changed.
6. **Project metadata:** keep all canonical records and direct assets declared.
7. **Active handoff:** archive the previous handoff, then write current status, files, verification, risks, next command, and next file.

Never delete a failed experiment from history. Mark it `rejected` or `superseded`, explain why, and point to the replacement.

### Failure and rollback table

| Failure | Required response |
| --- | --- |
| Source ZIP/PDF/PPTX checksum mismatch | Stop; register as a new source version. Never overwrite the old content-addressed source. |
| Intake/preparation fails in staging | Remove only its temporary stage; leave the previous valid targets untouched. |
| Existing owned output differs from its contract | Refuse overwrite; investigate drift and decide whether contract or output is authoritative. |
| Exact PDF page does not visibly open | Inspect the live reader; replace the iframe rather than trusting a fragment-only URL change. |
| Answer panel exposes secure or teacher-only content | Remove it immediately, rerun exclusions, and inspect all review routes. |
| Video is unavailable, uncaptioned, duplicated, or weak | Exclude it; keep local instruction complete. |
| Source image has unresolved rights | Keep private-pilot blocker or replace with an approved original; do not promote/export. |
| Generated image is attractive but scientifically wrong | Reject or issue a narrow correction prompt; do not patch the lesson text to excuse the image. |
| Generated image labels are too small | Improve/recreate the asset or rely on a nearby text equivalent; do not make raster text the only instruction. |
| A replacement creates two visible figures for one purpose | Remove/hide the redundant version and recheck layout. |
| Learner response ID changes unexpectedly | Restore the stable ID before release and test saved-state restoration. |
| State exceeds the 48,000-character guard | Preserve the last valid state, reduce serialized payload, and rerun budget tests. |
| Visual audit finds zero geometry issues but looks wrong | Fix the visual defect; automated geometry is not a substitute for judgment. |
| Teacher requests a change after reviewing a hash | Invalidate that review evidence, make the change, rerun checks, and present the new hash. |
| `course:doctor` reports more than `not-active` | Treat every additional diagnostic as a defect. |
| Unrelated Git changes appear | Leave them untouched; stage and diff only explicit Biology paths. |

### Per-cycle completion checklist

Do not call an improvement cycle complete until every applicable box is true:

- [ ] Branch, commit, dirty tree, and scope recorded.
- [ ] Canonical owner resolved.
- [ ] Before hashes and stable learner IDs recorded.
- [ ] Every supplied source hash verified.
- [ ] Source item/page/slide/media/video locators recorded.
- [ ] Rights and learner visibility classified.
- [ ] Scientific correction reviewed against the authority order.
- [ ] Secure and teacher-only materials excluded.
- [ ] Learner-facing wording contains no admin/build/provenance language.
- [ ] Existing response, practice, artifact, interaction, and completion identities preserved.
- [ ] Required instruction remains local and offline-capable.
- [ ] Keyboard, focus, reduced-motion, mobile, zoom, and print behavior checked where relevant.
- [ ] Static and project verification passed.
- [ ] E2E passed when learner behavior changed.
- [ ] Exact-build visual audit passed when learner visuals changed.
- [ ] Every contact sheet was opened and inspected.
- [ ] Workspace and report hashes recorded.
- [ ] B-D workspace hashes prove no accidental transfer.
- [ ] Journal, ledger, contracts, project metadata, and active handoff updated.
- [ ] Teacher status is recorded accurately; no inferred acceptance.
- [ ] No unauthorized commit, push, deployment, promotion, export, or upload occurred.

## Chronological improvement journal

### 1. Source comparison and quality diagnosis — 2026-08-28 onward

**Status:** `superseded` as a production approach; retained as research evidence.

Two Brightspace exports were ingested once and used to create five blocked comparison prototypes: faithful and optimized treatments of each source plus an outcome-led synthesis. The [comparison contract](../../resources/biology30-unit-a-pilot/comparison-contract.json) kept sources isolated and recorded hashes, visibility, provenance, and exclusions.

The comparison answered an important question: neither simply publishing the Next Step course, publishing the CBE course, nor blending both automatically created a high-quality course. The early synthesis over-clustered content, exposed slide-oriented controls and placeholders, and did not provide a coherent first-teach experience.

**Transfer lesson:** source comparison is useful for selecting explanations and resources, but source order and fuzzy title matching must not control the final learner sequence.

### 2. Clean Unit A Production V2 foundation — 2026-08-29 to 2026-08-30

**Status:** `implemented`; became the protected starting point for the improvement pilot.

Unit A was rebuilt around Alberta outcomes and a 17-lesson independent-learning sequence rather than repaired slide by slide. The [V2 production contract](../../resources/biology30-unit-a-pilot/v2/production-contract.json) defined 1,505 required minutes, 295 optional minutes, 25 outcome routes, seven artifacts, at least 100 practice items, local-first delivery, persistence, accessibility, and secure-assessment boundaries.

Core changes included native explanations, original figures and interactions, Model Lab, Investigation Notebook, Practice Hub, Glossary and Data, and corrected scientific language. Required teaching no longer depended on Google Slides or YouTube.

**Transfer lesson:** B-D improvements must preserve their outcome maps, evidence routes, practice, artifacts, and completion contracts while improving the learner experience around them.

### 3. B-D production baseline created — 2026-08-30

**Status:** `implemented` as blocked production candidates; Unit A pilot refinements have not transferred.

Units B-D were produced through a separate Biology family contract and builder. They already contain complete course structures:

| Unit | Project | Contract | Lessons | Required minutes | Practice | Artifacts | Current blocked review hash |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| B — Reproduction and Development | `biology30-unit-b` | [Unit B contract](../../resources/biology30-production/v1/units/unit-b/production-contract.json) | 14 | 1,200 | 86 | 8 | `c810dd85af4ba82dc7f08ddf28ace20a7abe2cc5b731234f245b266e2111d23c` |
| C — Cell Division, Genetics and Molecular Biology | `biology30-unit-c` | [Unit C contract](../../resources/biology30-production/v1/units/unit-c/production-contract.json) | 24 | 2,400 | 160 | 12 | `0814f93c4d74bb6411045d649625ba2bd6c664cf6e98d8147a215c7014f9354a` |
| D — Population and Community Dynamics | `biology30-unit-d` | [Unit D contract](../../resources/biology30-production/v1/units/unit-d/production-contract.json) | 11 | 900 | 72 | 6 | `dcb35045a3a82d8be75b81f24c2649a38f3cbd21efbbcb53c9efafc530847392` |

The [B-D human review guide](../../resources/biology30-production/v1/human-review-guide.md) records the current exact-build evidence. These hashes must be refreshed after any future rebuild.

**Transfer lesson:** applying the pilot is an enhancement and adaptation pass over existing canonical B-D records, not a new course creation or direct workspace rewrite.

### 4. Protected Unit A improvement pilot — 2026-08-31

**Status:** `implemented`.

The production Unit A candidate was copied into a separate direct-authored pilot. Its source candidate and protected raw snapshot retained tree hash `4908245ee9e176d647e0f927e1fc3f7db99009a8b50ec7e8ec9a86708a6524f0`. The initial pilot workspace changed only the title and persistence namespace, producing tree hash `e89fcf0e78207c0320886bd772192c2a096bb6d6e4c19891ef48d0bce99fbfea`.

Production Units A-D and immutable archives remained unchanged. The pilot stayed blocked, preview-only, and non-exportable.

**Transfer lesson:** exploratory improvement needs an isolated baseline, explicit ownership, stable learner identities, and a reversible comparison point.

### 5. Textbook, Library, and review integration — 2026-08-31

**Status:** `Codex-verified`; `awaiting-teacher-review`.

The CBE textbook Chapters 11-13 contained a 128-byte Brightspace wrapper. The textbook preparation command stripped bytes before `%PDF-`, verified headers, page counts, text extraction, and browser rendering, and wrote only its owned asset directories and report. It never rewrote canonical lesson HTML.

The pilot initially added:

- a three-chapter local Library;
- chapter-grouped lesson navigation;
- exact chapter, printed-page, physical-PDF-page, and question mappings for all 17 lessons;
- direct page actions that recreate the embedded reader so Chrome visibly moves to the requested page;
- native Chapter 11-13 review routes;
- a corrected native Review Seminar;
- a textbook Unit 5 review clearly labelled as Unit A review;
- attempt-before-answer behavior with isolated persistence;
- Lesson 17 retained as the required final integration lesson. Its redundant lesson-level textbook band was removed on 2026-09-02 after the dedicated chapter and textbook-unit review routes made that band unnecessary; Lessons 1-16 retain their exact textbook bands.

**Superseded attempt:** merely changing the `#page=` fragment on an existing Chrome PDF iframe changed the DOM URL but did not reliably move the visible PDF viewer. Replacing the reader instance with the exact requested page fixed the mismatch. The “open full screen” action remained a whole-document action rather than inheriting the embedded page state.

**Transfer lesson:** page links require a tested printed-to-physical mapping and verified visible viewer state, not only a correct URL string.

### 6. Learner language, layout, and navigation refinement — 2026-08-31

**Status:** `Codex-verified`; `awaiting-teacher-review`.

The course was scanned for teacher-facing and administrative phrasing. SCORM, completion-policy, source-version, pilot, and implementation language was removed from learner routes. Section symbols were replaced with plain “Section” wording. Learner outcomes were rewritten as student-facing “I can” statements aligned with the intended communication style.

All 17 retrieval prompts were rebuilt as stable prompt/response pairs that align on desktop and stack in reading order on mobile while preserving every response ID and autosave hook. Large repeated materials/safety cards were removed; essential cautions moved beside the activity they govern.

Model Lab and Practice Hub cards were changed to open the exact model or practice location rather than only the top of a lesson.

**Transfer lesson:** reusable layout and deep-link behavior can transfer conditionally, but learner wording and cautions must be re-authored against each unit's activities.

### 7. Practice-to-textbook feedback crosswalk — 2026-09-01

**Status:** `Codex-verified`; `awaiting-teacher-review`.

Every one of the 51 Guided Practice checks and 24 Final Practice questions received an exact local textbook-page action inside revealed feedback. Direct support and closest support were distinguished honestly. Module Checks were intentionally excluded. The learner-facing title became “Final Practice” without changing its 24-item scoring, persistence, submission, or completion behavior.

**Transfer lesson:** question-level textbook support must be authored from the target unit's own practice bank. Lesson-level page ranges are not precise enough for checked-answer feedback.

### 8. PowerPoint media and optional Video Library — 2026-09-01

**Status:** full optional-video rollout `Codex-verified`; `awaiting-teacher-review`.

The three original PowerPoints were preserved by hash and fully inventoried: 138 slides, 152 embedded assets, 45 YouTube references, and three other links. Every item received a disposition rather than being copied wholesale into lessons.

Optional videos were first placed beside three representative lesson concepts and in a five-entry Video Library. On 2026-09-02, the teacher approved nine additional primary placements and requested learner access to every other usable source video. The pilot now places 12 primary videos beside exact lesson concepts and exposes all 35 usable videos in a Video Library sorted by chapter and lesson. Each entry retains provider and lesson context, “Watch for” guidance, a complete local concept summary, a return-to-lesson link, and a privacy-enhanced preview that loads only when visible and never autoplays. The ten excluded links remain absent.

**Superseded attempt:** the custom “Play optional video” button added friction and looked like an unnecessary course control. It was removed in favour of the native visible preview. Required learning still remains local when video access fails.

**Transfer lesson:** video value comes from precise placement, viewing guidance, and fallback instruction—not from the size of the video inventory.

### 9. Selective source-image trial and duplicate removal — 2026-09-01

**Status:** `Codex-verified`; `awaiting-teacher-review`; unresolved rights remain release blockers.

Textbook and PowerPoint images were compared against course-native figures. Nine high-value source visuals were prepared transactionally. Six stronger anatomy/pathway plates replaced exact redundant static figures; three visuals remained supplemental because they added different evidence or anatomy.

Every visible source image received intrinsic responsive sizing, alt text, a nearby explanation, keyboard enlargement with focus return, and an exact textbook-page action where available. Interactive and non-duplicated semantic figures remained.

**Superseded attempt:** placing a source plate immediately beside the older course-made figure created visual duplication. The accepted implementation shows one strongest visual per teaching purpose and retains the superseded block only as hidden reversible provenance.

**Transfer lesson:** source images must be selected by teaching purpose, not attractiveness alone. Accuracy, rights, accessibility, and exact replacement/supplemental treatment are mandatory contract fields.

### 10. Generated-figure comparison and integration — 2026-09-01

**Status:** teacher selections implemented and `Codex-verified`; exact integrated course remains `awaiting-teacher-review`.

The course-made figures were used to create detailed generation prompts. Generated candidates were reviewed side by side against the originals. Lesson 4's resting-membrane figure and Lesson 12's endocrine body map were first integrated with scientific corrections. The teacher then selected all ten remaining comparison candidates.

Before learner use, the retina pathway, vestibular apparatus, stress response, and integrated regulation figures were corrected. Each selected image replaced its matching diagram once. The original semantic SVG remains hidden as a provenance fallback, while alt text, a nearby text equivalent, and keyboard enlargement provide the accessible instructional layer.

The process rejected scientifically attractive but inaccurate details, including incorrect pathway connections, ambiguous endocrine anatomy, and claims that could only be understood from raster labels.

**Transfer lesson:** image generation is a comparison and refinement workflow. A prompt or visually polished image is not an approved scientific figure until placement, accuracy, accessibility, and responsive behavior are reviewed in the actual lesson.

### 11. Exact-build visual and technical gate — 2026-09-01

**Status:** `Codex-verified`; `awaiting-teacher-review`.

The current workspace was audited across 93 route viewports, 32 textbook-band viewports, 34 retrieval viewports, checked-answer states, feedback diagrams, representative media surfaces, 18 source-visual placements, 24 generated-visual placements, and 10 Video Library states. All 38 contact sheets were opened and inspected. Automated geometry reported zero unresolved findings.

The focused static suite, media suite, science-comparison suite, workspace verification, manifest validation, Studio build, project E2E, and 17-test pilot E2E suite passed. `course:doctor` returned only the intentional `not-active` diagnostic.

This evidence proves the current build is ready for teacher review. It does not accept the build or authorize rollout.

### 12. Remove the duplicate Lesson 17 textbook-review band — 2026-09-02

**Status:** `Codex-verified`; `awaiting-teacher-review`.

Lesson 17 previously repeated a broad textbook band linking to Chapter 11-13 summaries and the textbook Unit 5 Review. Those destinations, assigned questions, and answer reveals already exist in the dedicated Chapter Review and **Unit A — Textbook Unit 5 Review** routes. The repeated band added a second route to the same work immediately before the required capstone lesson and made the integration lesson look like another optional textbook exercise.

The duplicate `data-textbook-band="lesson-17"` block and its answer panel were removed from the direct-authored learner workspace. Lesson 17 now moves directly from its header into its learning intentions and integrated evidence work. The textbook contract now declares sixteen lesson bands, Lessons 1-16, and records the removal as `lesson-17-review-deduplication`.

The change deliberately preserved:

- route and lesson ID `lesson-17`;
- its 120 required minutes;
- all learner response IDs and saved-work hooks;
- Guided Practice and the 24-item Final Practice;
- artifact, persistence, scoring, and course-completion behavior;
- the separate Chapter Review and textbook Unit Review routes.

At this point in the chronology, Lesson 17 still remained inside **Review** because navigation had not yet been explicitly changed. The cleaner learner model identified for the next cycle was to place it in a final **Integration and Mastery** lesson subgroup and leave Review entirely optional.

The exact workspace was re-audited. All 38 contact sheets were opened, including Lesson 17 at desktop, tablet, and mobile sizes. The new header-to-content transition is clean, the remaining sixteen lesson bands still fit, and automated geometry reported no findings.

**Transfer lesson:** do not repeat broad textbook-review controls inside a required capstone when dedicated review routes already provide that work. Keep optional review and required integration conceptually distinct, and preserve all learner-state and completion identities when removing the duplicate surface.

### 13. Separate required integration from optional Review — 2026-09-02

**Status:** `Codex-verified`; `awaiting-teacher-review`.

The teacher explicitly approved the proposed navigation change. Lesson 17 was moved from the Review submenu into a final **Integration and Mastery** subgroup under Lessons. Review now contains only Review Overview, the three chapter reviews, Review Seminar, and Unit A — Textbook Unit 5 Review.

Only navigation ownership changed. Route ID `lesson-17`, lesson content, 120 required minutes, response IDs, Final Practice, persistence, scoring, and completion behavior remain unchanged. Opening Lesson 17 expands Lessons and leaves Review collapsed. Static and keyboard E2E contracts now enforce that separation.

All 38 exact-build contact sheets were regenerated, opened, and inspected. Automated geometry found no overlap, clipping, or overflow across the audited desktop, tablet, and mobile views.

**Transfer lesson:** required capstone instruction belongs with required lessons. Optional chapter, seminar, and textbook review belongs in a clearly separate Review area. Transfer the information-architecture principle—not Unit A route names—to Units B-D.

### 14. Complete optional-video rollout — 2026-09-02

**Status:** `Codex-verified`; `awaiting-teacher-review`.

The accepted representative media pattern was extended without changing required learning. Nine more exact lesson companions were added to Lessons 3, 5, 6, 7, 10, 12, 13, 14, and 16. Together with the existing Lesson 4, 9, and 15 companions, the pilot now has twelve primary lesson-video placements.

Every usable PowerPoint-linked video was also made available in the Video Library. The library now contains 35 entries sorted by chapter, connected lesson, and source order. Each entry has provider context, a specific “Watch for” prompt, a local concept summary, a return-to-lesson action, and a visible privacy-enhanced YouTube preview without autoplay. Ten unavailable, inaccurate, duplicative, self-help, or out-of-scope links remain documented in the media contract and hidden from learners.

The media contract advanced from its five-entry slice to profile `biology30-unit-a-pilot-media-v2`. The preparation command includes a narrow transactional migration for the exact prior v1 generated contract; it still refuses unexpected drift and preserves rollback behavior. The media audit now validates all 35 learner-visible entries, all twelve primary mappings, caption and availability review, exact library selection, and absence of excluded IDs.

The exact build produced 54 contact sheets. Every sheet was opened and inspected, including 30 lesson-media viewports and 70 Video Library states. Automated geometry reported zero findings. The learner inventory, response IDs, required minutes, persistence, artifacts, scoring, and completion rules remain unchanged.

**Superseded state:** the five-entry library was a vertical slice, not the final learner inventory.

**Transfer lesson:** inventory all unit videos first, classify each one explicitly, select only exact lesson companions, and preserve every other useful reviewed video in a well-sorted optional library with local instruction. Never transfer Unit A IDs or decisions blindly to another unit.

### 15. One-based learner-facing practice numbering — 2026-09-02

**Status:** `Codex-verified`; `awaiting-teacher-review`.

The visible practice headings were built from zero-based array indexes, so the first question appeared as “0. Apply the idea.” The fix changed only the learner-facing ordinal in each practice heading. Guided Practice now displays 1-3, Module Checks display 1-5, and Final Practice displays 1-24.

The implementation deliberately did not renumber `data-practice-id` values, radio-group names, response IDs, persistence keys, answer mappings, scores, or completion rules. Those identifiers are durable learner-state contracts and must not be changed to repair a display label.

The focused static contract now rejects any practice heading beginning with zero and verifies consecutive one-based headings inside every practice list. The exact build was regenerated across all 54 visual contact sheets. Every sheet was opened; the representative Lesson 4 Guided Practice begins at 1, Final Practice item 20 displays as 20, and automated geometry reports zero findings.

**Transfer lesson:** learner-facing ordinals and internal indexes are different concepts. Render the visible question number as array position plus one, while leaving durable identifiers untouched. Apply this rule to B-D only after checking how each owning renderer derives labels and state keys.

### 16. Process Collection and automatic exit-slip aggregation — 2026-09-02

**Status:** `Codex-verified`; `awaiting-teacher-review`.

**Learner-facing problem**

The route named Investigation Notebook held learner-created notes and artifact links, but the seventeen lesson exit slips remained scattered at the ends of lessons. A learner could not review their developing thinking in one place, and the route name suggested a laboratory notebook rather than the broader collection of reflection, investigation, and reasoning evidence used throughout this unit.

**Intended improvement**

Rename only the learner-facing surface to **Process Collection** and make it an automatic collected view of every saved lesson exit. Preserve the existing manual-note tool, artifact links, route hash, persistence object, exit response IDs, saved values, lesson-completion rules, and state budget.

**Materials and sources**

No new external source material was required. The implementation uses the canonical lesson metadata and learner state already present in [the learner workspace](../workspace/index.html): lesson headings, each `.bio-exit` prompt, the stable `biology30-unit-a-pilot:lesson:NN:exit` response key, and the existing lesson-completion record. The established improvement ledger and current exact-build visual audit provide implementation and review evidence.

**Implementation process**

1. Retained the internal route `#investigation-notebook`, `data-route="investigation-notebook"`, `bioState.notebook`, notebook serialization, and all durable learner-state keys. Only student-visible labels changed to Process Collection.
2. Added one semantic Exit slips section before the learner-created process-note composer. Its empty state explains that saved lesson exits will appear automatically.
3. Added `exitSlipRecords()`, which iterates Lessons 1–17 in course order and reads the existing response object directly. It does not write a duplicate exit-slip record.
4. Added `renderExitSlips()`, which creates one accessible collected card per non-empty response. Each card shows the lesson number and title, original exit prompt, exact saved response, and a `Draft saved` or `Completed` status derived from the existing completion state.
5. Added a `Return to this exit slip` action. It opens the original lesson route and moves keyboard focus to the actual exit-slip section so revision continues at the canonical response field.
6. Called the renderer after response save, route/notebook rendering, and lesson completion so the collection updates immediately without a page reload.
7. Extended the existing copy/print summary to include saved exits before manually added process notes. Removing a manual process note still changes only `bioState.notebook`; there is no delete control for aggregated exits.
8. Added narrow responsive styles so the status and lesson label share a row on wide screens and stack without overlap on mobile. The existing restrained course visual system was preserved; no new dashboard, decorative cards, or competing navigation was introduced.

**Constraints**

- The canonical exit response remains `bioState.responses[biology30-unit-a-pilot:lesson:NN:exit]`.
- Collection rendering must never rename, move, truncate, overwrite, or duplicate that state.
- A lesson is still complete only through its existing completion action; saving an exit draft alone does not complete the lesson.
- Deleting a learner-created process note cannot delete an exit response, artifact draft, practice state, or completion record.
- Empty exits do not produce blank collection cards.
- Learner-facing copy says Process Collection, while internal route and state identifiers remain unchanged to protect bookmarks, tests, and saved work.
- Collection output remains local-first, keyboard-operable, printable, and within the existing persistence budget.

**Evidence**

- Static coverage verifies the Process Collection navigation and heading, one collection/count surface, the retained manual-note and artifact surfaces, the aggregation functions, and the absence of the old learner-facing name.
- Focused Playwright coverage saves a Lesson 1 exit, verifies the automatic collected draft, follows the deep link back to the exact exit, completes the lesson, confirms status changes to Completed, removes a manual note without affecting the exit, reloads, and confirms restoration.
- The same browser test checks the mobile stacked header and horizontal-overflow boundary.
- Exact workspace SHA-256: `fe147931e3f6c44ac4ad7ec44e1226b6d7a758daf4ab23b30d9da13669e5b77a`.
- Exact visual report: `.runtime/biology30-unit-a-improvement-pilot-visual-audit/2026-09-02T18-48-28-003Z/visual-audit.json`, SHA-256 `4d002a34999c78cfa6286e7813197d1a94e728b9fab52777b88056b434b8fbb8`.
- All 54 contact sheets were opened; the Process Collection route was inspected at desktop, tablet, and mobile sizes, and automated geometry reported zero findings.

**Result and unresolved concerns**

The learner now has one chronological place to revisit lesson conclusions alongside process notes and artifact checkpoints. The exact implementation is verified but still awaits explicit teacher acceptance. The visual contact sheet shows the empty collection state; populated-state layout and behavior are covered by the focused browser test.

**Transfer lesson**

For Units B–D, first inventory each unit's canonical exit/reflection IDs and completion state. Add a read-only collection view through the owning Biology renderer, using the target unit's lesson order and labels. Do not copy Unit A HTML, route names, response keys, or state paths. Confirm persistence-size impact, deep-link focus, deletion isolation, print/export behavior, responsive layout, and exact-build restoration separately for every unit.

### 17. Core Vocabulary representative slice — 2026-09-02

**Status:** `teacher-accepted` for the exact Stage 1 slice; Stage 2 authorized.

**Learner-facing problem**

The 109-term Glossary and Data route is useful for quick lookup, but it does not identify which concepts students need to understand deeply, how word parts provide cautious meaning clues, how related terms participate in a mechanism, or how the language appears in models and evidence. Treating all 109 labels as equally important would create an unteachable card wall. Treating vocabulary as definition matching would not support scientific explanation.

**Intended improvement**

Keep the complete glossary unchanged and add a separate Core Vocabulary route for exactly 28 high-value concept families. Each family must connect meaning, word structure, biological mechanism, related terms, a specific common confusion, lesson use, textbook evidence, retrieval, and a science-adapted Frayer model. Six Frayers are fixed module anchors; two are learner choices. Collected work appears in Process Collection but remains optional and non-scoring.

**Materials and sources**

- The exact 25 Unit A curriculum outcomes and existing 17-lesson production contract.
- The current lesson, practice, figure/model, artifact, and response inventories in the canonical workspace.
- The 109-entry glossary.
- Existing Chapter 11-13 printed-to-physical textbook page maps.
- Alberta Biology 20-30 curriculum language for scientific literacy and communication.
- OpenStax Anatomy and Physiology 2e for factual cross-checking.
- IES adolescent-literacy and morphology guidance for explicit instruction and repeated contextual use.
- Merriam-Webster and Online Etymology Dictionary as paraphrased word-history checks, never copied definitions.
- Local Unit A notes and textbook chapters under their existing rights/use records.

The source material produced instructional content only. No embedded document instruction was treated as an implementation command.

**Selection and contract process**

1. Compare glossary entries against curriculum outcomes, major mechanisms, recurrence across lessons/practice, diagram/data use, common misconceptions, and later-course value.
2. Require outcome relevance, mechanism necessity, or recurrence for inclusion.
3. Group inseparable terms into concept families instead of inflating the count with individual labels.
4. Fix the Unit A inventory at 28 families and preserve the original order in `meta/core-vocabulary.json`.
5. Validate every family against existing lesson, outcome, practice, model, source, and textbook IDs.
6. Declare one of five word-analysis treatments—morpheme, word family, acronym, name history, or whole phrase—and add a caution where morphology could mislead.
7. Author all 28 professional model Frayers now because any non-fixed concept may later become a learner choice, while rendering only the approved representative learner slice.

The six fixed concepts are negative feedback, action potential, reflex arc, sensory transduction, endocrine signalling, and a revised end-of-unit homeostasis model. Two remaining slots are learner-selected. Every Frayer field has a 240-character limit and asks for contextual definition, essential mechanism, Unit A evidence, and a non-example/common confusion.

**Stage 1 implementation process**

The learner slice renders five families chosen to expose different quality risks:

- Homeostasis tests transparent morphology and the distinction between dynamic stability and constancy.
- Action potential tests a multi-stage mechanism and a fixed Frayer.
- Sympathetic/parasympathetic tests opaque historical terminology, caution against guessing, and the learner-choice flow.
- Sensory transduction tests reusable scientific roots across several sensory contexts.
- Endocrine signalling tests the precision that only receptor-bearing target cells respond.

The route uses one semantic reading panel, a desktop index, mobile selector, term/word-part search, and category filter. The instructional text is static canonical HTML; JavaScript controls only selection, filtering, saving, reveal, collection, restoration, and focus. Five representative Word Lens links were inserted at Lessons 1, 4, 6, 8, and 12. Each opens the exact vocabulary entry. The full 17-lesson mapping is intentionally not rendered yet.

All four fields autosave. A course model stays hidden and disabled until all four fields have content, and hides again if a field is cleared. Adding to Process Collection requires all four fields. Removing from the collection clears only the collection flag. Learner writing remains in the canonical response map and is not duplicated by the collection view. Clearing a written learner-choice entry requires scoped confirmation.

**Persistence and compatibility**

The compact state upgraded from version 2 to version 3. Version-2 work loads unchanged with an empty vocabulary state. Version 3 adds only `w: [activeTermToken, choiceTermTokens, collectedTermTokens]`. All 112 possible response IDs are declared, but normalization permits vocabulary response text only for the six fixed and two selected entries, with a maximum of 32 fields. Unknown IDs are rejected; choices are capped at two; collection is capped at eight; and the existing last-valid-state overflow protection remains in place.

The conservative combined envelope is 41,378 characters. It remains 2,622 characters below the 44,000-character vocabulary target and 6,622 below the 48,000-character build guard. Vocabulary is absent from `isCourseComplete()`, so lesson exits, seven artifacts, and one Final Practice submission remain the only completion requirements.

**Automated and manual evidence**

- `npm run test:biology30-unit-a-core-vocabulary-pilot` verifies the 28-family contract, sources/rights, mappings, static slice, 112 possible IDs, migration logic, non-gating completion, and the 41,378-character state envelope.
- `npm run test:e2e:biology30-unit-a-improvement-pilot -- --grep "Core Vocabulary"` verifies deep links, search/filter, choice, all four response fields, model reveal/hide, collection/removal, Process Collection derivation, reload restoration, mobile reflow, and version-2 migration.
- `npm run audit:biology30-unit-a-core-vocabulary-pilot:visual -- --project biology30-unit-a-pilot` generated seven contact sheets covering 15 concept-state viewports, 15 Word Lens viewports, and two 200% zoom views.
- Every one of the seven sheets was opened. Automated geometry found zero clipping, horizontal overflow, or response-field overlap.
- Three blocked network requests in the focused audit came from existing optional YouTube previews on Lessons 4, 6, and 12 while their Word Lens lines were captured. The Core Vocabulary route itself remains locally usable and no required instruction depends on those videos.

The reviewed learner workspace SHA-256 is `1b283ef4795a01ecefdbfbeb1bdd290e77210967fd1f0012b7b5f71a35bd2c47`; its workspace-tree SHA-256 is `2f2b7b3d80332ba073a6dbd6bccedb98d575e7f343c2e4106fe53ba0abbc4c70`. The focused report is `.runtime/biology30-unit-a-core-vocabulary-pilot-visual-audit/2026-09-02T20-18-11-917Z/visual-audit.json`, SHA-256 `fabd5a6a9fbd4fcbf85ef4b14a9817254c9bd7f256c0f60c6b1487c6cadf9c97`.

**Result and unresolved concerns**

The complete 28-family instructional contract existed while the learner route intentionally showed only five representative entries. The teacher explicitly approved proceeding on `2026-09-02`, accepting the vocabulary depth, morphology approach, Frayer structure, browser density, and Process Collection presentation at workspace SHA-256 `1b283ef4795a01ecefdbfbeb1bdd290e77210967fd1f0012b7b5f71a35bd2c47`. This accepted only the Stage 1 design gate. It did not accept the later complete Stage 2 build or authorize B-D transfer.

**Transfer lesson**

Transfer the audit and authoring method, not Unit A's terms. Unit B's approximate 30-family, Unit C's approximate 42-family, and Unit D's approximate 24-family figures are planning budgets only. Each unit needs a fresh outcome/lesson/textbook/practice/mechanism/morphology audit, its own stable IDs and persistence envelope, implementation through `scripts/lib/biology30-course/v1/`, representative-slice approval, full build, and separate exact-build teacher acceptance.

### 18. Core Vocabulary complete Unit A rollout — 2026-09-03

**Status:** `Codex-verified`; `awaiting-teacher-review` for the exact Stage 2 build.

**Authorization and preserved gate**

The teacher's `2026-09-02` approval authorized Stage 2. The accepted Stage 1 workspace SHA-256, workspace-tree SHA-256, seven-sheet visual report, report SHA-256, acceptance statement, and date remain frozen in `meta/core-vocabulary.json` under `stage1Review`. Stage 2 did not overwrite the accepted evidence or infer acceptance of the complete route.

**Implementation process**

1. Changed the Core Vocabulary route profile from a five-entry slice to `full-v1` while preserving the route ID `core-vocabulary`.
2. Rendered all 28 concept-family buttons in the desktop index and all 28 options in the mobile selector, in the exact contract order.
3. Rendered all 28 semantic reading articles. Every article contains the authored learner meaning, declared word-analysis treatment and caution, biological mechanism, related-term contrasts, common confusion, exact course links, exact textbook links, one retrieval prompt, a Frayer interface, and the authored course model.
4. Preserved the five reviewed Stage 1 articles and added the remaining 23 from the same machine-readable contract rather than creating a second vocabulary source.
5. Rendered six fixed Frayers for negative feedback, action potential, reflex arc, sensory transduction, endocrine signalling, and homeostasis. Rendered the remaining 22 as learner-choice Frayers.
6. Rendered all 112 stable fields using `biology30-unit-a-pilot:core-vocabulary:<entry-id>:<field-id>`. The visible inventory is complete, but state normalization still permits text for no more than eight concepts and 32 fields.
7. Replaced the slice-only runtime allowlist with the complete 28-ID contract order and expanded the label map to all 28 entries. Search, category filtering, desktop selection, mobile selection, exact deep-link focus, save, reveal, collect, remove, copy, clear, print, and restoration continue to use the existing state model.
8. Kept the choice cap at two. An empty choice can be replaced immediately; a choice with writing requires the scoped Copy entry and Clear this Frayer model flow with confirmation. Clearing never touches another term or any lesson response.
9. Kept course-model reveal locked until all four fields contain an attempt. Revealing or hiding the model never changes learner writing.
10. Kept Process Collection derived from `responses` plus the collection flag. No Frayer text is duplicated in compact state, and vocabulary remains absent from the main course-completion and score calculations.

**Exact lesson Word Lens map**

| Lesson | Concepts linked in learner order |
| --- | --- |
| 1 | Homeostasis; Regulated variable and set point; Control-system roles |
| 2 | Negative feedback; Endocrine signalling |
| 3 | Neuron structure; Myelin and saltatory conduction |
| 4 | Resting membrane potential; Action potential; Membrane-potential phases |
| 5 | Synaptic transmission |
| 6 | Central and peripheral nervous systems; Somatic and autonomic systems; Sympathetic and parasympathetic divisions |
| 7 | Reflex arc |
| 8 | Sensory transduction; Sensory receptor classes; Sensory adaptation |
| 9 | Sensory transduction; Vision pathway |
| 10 | Sensory transduction; Hearing and equilibrium pathway |
| 11 | Scientific explanation; Sensory adaptation |
| 12 | Endocrine signalling; Negative feedback |
| 13 | Hypothalamus-pituitary axis; Water and salt regulation |
| 14 | Thyroid and calcium feedback; Antagonistic hormones |
| 15 | Blood-glucose regulation; Antagonistic hormones |
| 16 | Stress response; Water and salt regulation |
| 17 | Homeostasis; Negative feedback; Scientific explanation |

Each Word Lens is a compact text line at the point of use. Activating a term opens Core Vocabulary, selects the exact family, and focuses the concept heading. It does not create lesson cards or alter lesson completion.

**Persistence and compatibility evidence**

- Compact saved state remains version 3 and migrates version-2 fixtures to an empty vocabulary state without losing existing work.
- Unknown vocabulary IDs are rejected, learner choices are capped at two, collected IDs are capped at eight, and a collected ID must be fixed or currently chosen.
- All Frayer text remains in canonical `responses`; the compact `w` tuple stores only active, chosen, and collected term tokens.
- The conservative worst case remains 41,378 characters: 2,622 below the 44,000-character vocabulary target and 6,622 below the 48,000-character build guard.
- The 17 lesson exits, seven artifact drafts, Final Practice submission, required minutes, response IDs, practice IDs, score, and completion rules are unchanged.

**Automated and visual evidence**

- `npm run test:biology30-unit-a-core-vocabulary-pilot` validates the exact 28-entry contract and rendered parity, six fixed and 22 learner-choice interfaces, 112 IDs, all source/rights/lesson/outcome/textbook/practice/model mappings, all 17 Word Lens sequences, state migration, bounded storage, and non-gating completion.
- The focused Core Vocabulary E2E verifies all 28 entries, search, category filtering, exact term links, two choices, third-choice refusal, empty replacement, written-entry cancel/confirm clearing, autosave, model reveal, collection, reload, Process Collection, and all 17 lesson deep links.
- The Stage 2 visual audit inspected every concept at 1440x900, 1024x768, and 390x844: 84 concept-entry viewports. It also captured 30 representative default/search/filter/fixed/choice/model/choice-limit/collection states, 51 Word Lens viewports, and two 200% zoom views.
- All seven contact sheets were opened and visually inspected. Automated geometry reported zero findings.
- Twelve blocked network requests were the pre-existing optional YouTube lesson previews encountered while all 17 Word Lens placements were captured. Required vocabulary instruction and Frayer work remain local and usable without them.

The exact Stage 2 learner workspace SHA-256 is `b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee`; workspace-tree SHA-256 is `61396aee1fec5e4c35fd408a2629ca05abda82df584a2db47e46444c37e361dc`. The visual report is `.runtime/biology30-unit-a-core-vocabulary-pilot-visual-audit/2026-09-03T01-08-03-419Z/visual-audit.json`, SHA-256 `6fac8fd887e27509bc4f0183ecbabaea9496396af928c11a516c439e36ed6db0`.

**Result and unresolved concerns**

The full Unit A Core Vocabulary feature is implemented and Codex-verified. It is not teacher-accepted yet. The public review deployment still serves the accepted Stage 1 slice and is intentionally stale because redeployment was not authorized in this cycle. All 21 improvement-ledger rules remain pending as complete Unit A transfer rules, and no vocabulary count, term, page, response ID, or acceptance status has transferred to B-D.

**Transfer lesson**

For each of Units B, C, and D, repeat both gates: first build a unit-specific contract and representative five-risk slice, then obtain exact-hash approval before full rendering. Implement through `scripts/lib/biology30-course/v1/`, not copied Unit A HTML. Recompute the unit's own concept-family count, Frayer anchors, morphology cautions, lesson and textbook maps, persistence envelope, and visual evidence.

### 19. Student-ready topic-sequence Pilot 2, Gate 0 and Gate 1 — 2026-09-03

**Status:** `teacher-accepted` for the eight-block Gate A slice and its bridge architecture

**Learner-facing problem**

Teacher review found that Pilot 1 looked polished but often taught at an advanced reading and reasoning level. New scientific vocabulary sometimes appeared before learners had a usable definition, instructional ideas did not always follow the teacher's classroom sequence, retrieval occasionally asked for ideas before they had been taught, some required functions were too easy to miss, and several investigations or integration tasks demanded too much reasoning at once. The problem was therefore not a cosmetic defect. Repairing isolated paragraphs in Pilot 1 would not prove that a Grade 12 learner could follow the complete first-teach path independently.

**Intended improvement**

Create a separate course, `biology30-unit-a-pilot-2`, and preserve Pilot 1 as the advanced-content and historical comparison source. Rebuild the learner route around the teacher's 13 named topics: five Chapter 11 lessons, three Chapter 12 lessons, and five Chapter 13 lessons. Add three chapter-practice routes, Review Seminar, and Final Practice for 18 required routes. Keep exactly 1,505 required minutes and 295 optional minutes. Required teaching targets acceptable-standard performance; deeper in-scope reasoning moves into a clearly optional Advanced Learning disclosure.

Every lesson must use this prerequisite-safe order: question or phenomenon; plain-language goal and prior knowledge; no more than four new concept families; short Learn section with an adjacent visual; Stop and Check; second teaching section with another model or optional video; worked example; retrieval after current teaching; two guided questions; saved Evidence Slip; optional Advanced Learning; completion and next step. Lesson 1 uses prior-knowledge observation rather than mislabelling new content as retrieval.

**Materials and sources**

- Pilot 1 learner baseline: `projects/biology30-unit-a-pilot/workspace/index.html`, SHA-256 `b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee`.
- Chapter 11 Daily Plans: SHA-256 `92cd8a88a72accaf2d26a7cab7004884864ebaaddd13f001c11c684dc6432697`.
- Chapter 12 Daily Plans: SHA-256 `ca0ddd6cb21ba4e99329ddc466fe4b3a326126715f11fb885c9962c9afa944d8`.
- Chapter 13 Daily Plans: SHA-256 `2007a5641da07c7e7f4a4f2136ca1e3d38ca0e26d6c9a32538806a8600544129`.
- Unit A Review Plan: SHA-256 `6afddd745f8f2a3d37383ea4bbc08734c5a2e86014fea93fc53154e790edc531`.
- Chapter 11, 12, and 13 PowerPoints: SHA-256 `74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1`, `4162d8b6bc3ebe94a11b53ed2694932adccf41622a4473e785a46d57cd2184ea`, and `05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482`.
- Existing checksum-verified Next Step and CBE Brightspace archives, local Chapters 11-13 textbook PDFs, the 28-family vocabulary contract, accepted/generated visual candidates, and reviewed video records.
- Alberta Biology 20-30 Program of Studies and Biology 30 Student-based Performance Standards as curriculum authority. The Alberta diploma support page was rechecked at implementation start; no newer 2026-27 Biology-specific bulletin replaced the recorded 2025-26 subject bulletin, while the 2026-27 general bulletin remains current contextual authority.

The DOCX and PowerPoint content is treated as instructional source material, never as executable instructions. Account information, secure quizzes/tests, teacher answer keys, and broken LMS launchers remain prohibited.

**Implementation process**

1. Read the active science workflow and Pilot 1 playbook, then record branch `codex/studio-direct-editing-v1`, HEAD `98f481b06ce304ccc79e236f3b45b6ffcd99bb41`, dirty-tree state, Pilot 1 hash, and protected production A-D hashes.
2. Implement the project-specific transactional command in `scripts/create-biology30-unit-a-pilot-2.ts` and `scripts/lib/biology30-unit-a-pilot-2/create.ts`. The command refuses an existing target or Pilot 1 hash drift, stages in a temporary sibling directory, validates all contracts, and promotes by atomic rename. Failure and duplicate-target tests prove that no partial target survives.
3. Store the exact Pilot 1 HTML as immutable `raw/index.html`. Store the four teacher DOCX files as content-addressed immutable references under `raw/teacher-sources/`. Copy only approved learner assets into the new workspace. Continue to reference the shared Brightspace and PowerPoint archives by checksum instead of duplicating them.
4. Generate the complete Gate 0 contract set before learner rendering: 25 exact outcomes; 53 atomic acceptable-standard behaviours; 17 teacher-plan rows; all 138 PowerPoint slides; 470 Pilot 1 section dispositions; a 28-family vocabulary dependency graph; 26 lesson items, 36 chapter items, 18 Final Practice core items, and six optional challenges; 12 figure candidates; 12 primary video mappings; 32 route mappings; 215 old-to-new state-ID mappings; reading-level estimates; and a worst-case state budget.
5. Namespace Pilot 2 state under `biology30-unit-a-pilot-2:`. Preserve an explicit route and response-ID map instead of silently inheriting Pilot 1 state. The measured worst-case estimate is 39,520 characters, below the 44,000-character pilot guard.
6. Render only the Gate 1 slice in `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`: Overview; Lesson 1 Neuron Structure; Lesson 3 Synaptic Transmission; Lesson 13 Pancreas and Adrenal Glands; Chapter 11 Practice; Process Collection; learned-so-far Core Vocabulary; Textbook Library; Video Library; Model Lab; Glossary and Data; Sources and Credits.
7. Make the three lessons test distinct risks. Lesson 1 explicitly teaches neuron roles, glia, the insulating function of myelin, nodes, saltatory conduction, Schwann-cell/oligodendrocyte distinctions, a worked reflex pathway, and practice evidence. Lesson 3 defines neurotransmitter before acetylcholine and follows the electrical-to-chemical-to-cellular sequence. Lesson 13 breaks pancreas, diabetes, adrenal medulla, adrenal cortex, glucose, stress, and salt control into short sections, visuals, a worked case, and two guided questions.
8. Keep vocabulary locked until its connected lesson has actually been visited. Exact lesson links open the requested textbook page, selected Model Lab state, video entry, or vocabulary family rather than a generic hub. Videos show their native preview without autoplay or a custom play button; local summaries retain required meaning when the network is blocked.
9. Place Save and Exit in the navigation rather than floating over learner work. Add anchor offsets for fixed-header navigation, responsive figure sizing, full-width enlargement, 200% zoom support, and local fonts. Keep the optional static equivalent separate from Advanced Learning.
10. Generate an exact-build visual audit at desktop `1440x900`, tablet `1024x768`, mobile `390x844`, representative learner states, and 200% zoom. Capture each substantive Gate 1 figure at useful scale, including semantic neuron, synapse, and glucose models and the selected myelin, neuron-role, synapse, and stress-response illustrations. Open every contact sheet before recording a manual pass.

The creation command used for the accepted review candidate is:

```bash
npm run create:biology30-unit-a-pilot-2 -- \
  --source biology30-unit-a-pilot \
  --project biology30-unit-a-pilot-2 \
  --source-workspace-sha b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee
```

**Files and contracts**

- Canonical learner source: `projects/biology30-unit-a-pilot-2/workspace/index.html`.
- Creation and rendering owner: `scripts/lib/biology30-unit-a-pilot-2/`.
- Course/timing contract: `projects/biology30-unit-a-pilot-2/meta/pilot-2-contract.json`.
- Curriculum and performance map: `meta/curriculum-performance-map.json`.
- Teacher-plan and slide crosswalk: `meta/teacher-source-crosswalk.json`.
- Pilot 1 content disposition: `meta/pilot-1-section-disposition.json`.
- Vocabulary ordering: `meta/vocabulary-dependency-graph.json` and `meta/core-vocabulary.json`.
- Practice, media, state, reading, and persistence records: `meta/practice-blueprint.json`, `meta/figure-media-plan.json`, `meta/route-response-map.json`, `meta/reading-level-report.json`, and `meta/state-budget.json`.
- Gate records: `meta/gate-0-audit.json` and `meta/gate-1-review.json`.

**Scientific, rights, accessibility, and persistence constraints**

- Curriculum and acceptable-standard performance determine required core; a textbook detail is not automatically assessable.
- No term may be required before a plain-language introduction, and definitions may not depend on undefined vocabulary.
- Prevent the known myelin/regeneration, left/right-brain, neurotransmitter-order, neuron-morphology, retinal-processing, homeostasis, target-receptor, pituitary, diabetes, ADH/caffeine, autonomic, diagnostic, and out-of-unit pituitary errors.
- Use one strongest visible figure per purpose. Retain alt text, adjacent equivalents, responsive intrinsic sizing, keyboard enlargement and focus return, and no duplicate learner visuals.
- Optional videos, textbook reinforcement, Advanced Learning, Frayers, notes, and three scaffolded investigations do not change required progress or score.
- A lesson completes only after both guided items are attempted and its Evidence Slip is saved. Three chapter practices, Review Seminar, and Final Practice complete the 18-route contract.
- Pilot 2 remains blocked, preview-only, Studio Edit disabled, and non-exportable. No acceptance, asset choice, content, page, ID, or status transfers to B-D automatically.

**Evidence**

- Gate 0 validation: all 25 outcomes and 53 acceptable-standard behaviours have explicit teach, visual/model, worked-example, practice, and evidence routes; all teacher rows, slides, and Pilot 1 sections are dispositioned.
- `npm run test:biology30-unit-a-pilot-2`: 7/7 tests passed, including source protection, duplicate refusal, and simulated rollback.
- `npm run test:e2e:biology30-unit-a-pilot-2`: 8/8 tests passed across route reflow, prerequisite-first teaching, textbook/model deep links, completion and reload, Process Collection, gradual vocabulary unlocking, video fallback, figure dialog, 200% zoom, and axe scans.
- Exact Gate 1 learner SHA-256: `f623f8601e3c085d72ed1c43f646cf2981d316b16475e132f5f4df968cbc2a7d`.
- Exact Gate 1 workspace-tree SHA-256: `2bd1fd6f573789f79335f2d00d6c92b17cb1f802fae1ecdfb73a3c52dcd75861`.
- Exact visual report: `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-03T17-49-25-071Z/report.json`.
- Visual evidence: 36 route screenshots, 30 state screenshots, 11 contact sheets opened, zero geometry findings, correct populated Process Collection and Frayer states, and inspected inline/enlarged figures.
- Pilot 1 and production Units A-D remained byte-equivalent to the recorded creation baselines during focused testing.

**Result and unresolved concerns**

Gate 0 and the representative Gate 1 slice are implemented and Codex-verified. They are not teacher-accepted. The remaining ten lessons, Chapter 12 and 13 Practice, Review Seminar, Final Practice, full 80-item required practice bank, six challenges, and complete three-investigation implementation have not been rendered. Any requested Gate 1 change creates a new workspace hash and requires fresh focused tests and visual evidence.

**Transferable principle**

Use teacher topic order to control prerequisite sequence, current curriculum to control required content, and performance standards to separate acceptable-standard core from optional standard-of-excellence depth. Prove the lesson loop with a deliberately varied slice before authoring a complete unit. Preserve prior versions as evidence and advanced-content sources instead of overwriting them.

**Required adaptation for Units B, C, and D**

Do not copy Pilot 2 HTML, lesson counts, terms, times, questions, figures, state IDs, or acceptance. For each unit, inventory that teacher's topic order and materials; map the unit's outcomes and acceptable-standard behaviours atomically; build a unit-specific vocabulary dependency graph and reading baseline; disposition its existing generated sections; create a representative slice that tests anatomy/mechanism, data/health, and integration load; obtain exact-hash approval; then implement through the owning `scripts/lib/biology30-course/v1/` records and renderer.

### 20. Gate 1 acceptance and the first complete Pilot 2 candidate — 2026-09-03

**Status:** `superseded`

**Learner-facing problem**

The original Pilot 1 had strong interactions and depth but assumed too much prior vocabulary, used dense explanations, and did not follow the teacher's preferred instructional sequence closely enough. The Gate 1 slice showed a clearer direction, but only a fraction of the thirteen-topic course existed.

**Intended improvement**

Freeze the approved topic-sequence pattern, then build all thirteen lessons and five review routes without changing the accepted shell, navigation groups, bolded first-use terms, Stop and Check pattern, or core/Advanced Learning distinction.

**Materials and sources**

The exact accepted Gate 1 learner SHA is `8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe`. The build used the four checksum-verified daily/review plans, the three PowerPoints, curriculum and performance standards, Pilot 1's mapped content and assets, local textbook chapters, vocabulary contract, and video/figure records.

**Implementation process**

The teacher's five-Chapter-11, three-Chapter-12, and five-Chapter-13 topic order became the route contract. The remaining ten lessons, three Chapter Practices, Review Seminar, and Final Practice were rendered from authored Pilot 2 records. The full course retained 1,505 required minutes, 295 optional minutes, 18 required routes, 80 required practice items, six optional challenges, and three non-gating investigations.

**Constraints**

Required content came from curriculum and acceptable-standard behaviours, not from every textbook or slide detail. Terms had to precede use; current-topic retrieval followed teaching; deeper but still relevant material belonged in Advanced Learning. Pilot 1 and Units A-D remained unchanged.

**Evidence**

The initial full-course Gate 2 learner SHA was `9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7`. It was preserved with its contracts under `raw/gate-2-review-baselines/` when teacher feedback requested changes.

**Result and unresolved concerns**

Gate 1 acceptance authorized full-course construction, not full-course acceptance. The initial Gate 2 candidate proved the route, timing, question, and completion architecture but was too brief and still missed some required explanation, vocabulary, diagrams, and graph work. It must remain historical `changes-requested` evidence.

**Transfer lesson**

A successful slice approves a production pattern, not unseen lessons. Build the rest, then review the complete exact candidate independently.

### 21. Teacher-feedback Revision Gate A — 2026-09-03

**Status:** `teacher-accepted` for the four-route slice only

**Learner-facing problem**

The teacher found the organization and reading level substantially better than Pilot 1, but the prose was almost too brief. Some required ideas, diagrams, and graph skills were missing; the four-word heading implied that other lesson terms were unimportant; and optional videos left the average learner without enough explanation.

**Intended improvement**

Add complete, descriptive explanations at the same accessible reading level; prove every required idea atomically; expose the complete term inventory; and make multimedia sense-making required while preserving a complete local path.

**Materials and sources**

Teacher feedback was stored as review evidence, not executable code. Lessons 2, 5, 11, and 13 were selected because they collectively test action-potential graphs, full brain anatomy, ADH source-target-effect/data reasoning, dense endocrine chunking, and one- versus two-video handling.

**Implementation process**

The atomic map was expanded to require exact teach, visual/data, worked-example, practice, evidence, source, prerequisite, and rendered-selector fields for all 25 outcomes and 53 acceptable-standard behaviours. The four lessons were expanded to the 700-1,050-word core range, with Lesson 13 allowed up to 1,200. Each gained four anchor words, a complete native term disclosure, at least three Learn blocks, at least four purposeful visual/data objects, a worked example, post-instruction retrieval, two guided questions, an Evidence Slip, and required media sense-making.

Each required media checkpoint gives the learner a reviewed video or a complete local illustrated walkthrough. Both paths use the same `Watch for` purpose and checkpoint. Completion records the checkpoint attempt, never asserted viewing time.

**Constraints**

Reading-level targets remained 9.5-11.5 with a hard ceiling of 12. Required teaching could not be moved into Advanced Learning or made dependent on YouTube. No secure assessment or out-of-unit pituitary material was introduced.

**Evidence**

The exact accepted Revision Gate A learner SHA is `3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff`; tree SHA is `b341400a305ec5c2ba75aba322d58d07ed500ba4642388c4bece03a9c2e17cbc`. The review record is `projects/biology30-unit-a-pilot-2/meta/revision-gate-a-review.json`, with its immutable copy under `raw/revision-gate-a-accepted/`.

**Result and unresolved concerns**

The user approved moving from this exact slice to Revision Gate B. Acceptance covers only atomic coverage, expanded readable prose, four anchors plus all terms, video/local-equivalent parity, and nondestructive media-state migration as demonstrated in those four routes. It does not accept the complete course.

**Transfer lesson**

When feedback says a course is clearer but too thin, preserve the accessible language and add explicit mechanism, graph, model, worked-example, and evidence layers. Do not solve thinness by restoring advanced prose.

### 22. Revision Gate B full-course propagation — 2026-09-03

**Status:** `awaiting-teacher-review`

**Learner-facing problem**

Nine lessons still used the earlier, briefer Gate 2 treatment. Learners could encounter uneven depth, fewer visuals, or questions whose prerequisites were less explicit depending on the lesson.

**Intended improvement**

Apply the accepted Revision Gate A teaching pattern across all thirteen lessons while retaining topic-specific pacing and science.

**Materials and sources**

Authored lesson content and visual/media mappings live in `scripts/lib/biology30-unit-a-pilot-2/full-content.ts`; route rendering and runtime behaviour live in `render-gate1.ts`; transactional assembly and validation live in `build-full.ts`. The teacher plans and PowerPoints continue to set sequence, while curriculum/performance records set required depth.

**Implementation process**

Lessons 1, 3, 4, 6, 7, 8, 9, 10, and 12 were expanded. The pass completed neuron/glial functions; synaptic release and termination; CNS/PNS and white/grey-matter relationships; receptor evidence; optical versus neural vision pathways; hearing/equilibrium evidence; dynamic feedback and target-cell signalling; pituitary source-target-effect reasoning; and thyroid/calcium graph interpretation. All lessons received complete term inventories, purposeful visual/data density, worked examples, required media equivalents, post-teaching retrieval, guided practice, and Evidence Slips.

The 80 required and six optional items were rechecked for curriculum priority and prerequisite readiness. Materially changed items required versioned IDs; unchanged item identities, all Process Collection records, and unaffected learner responses remained stable.

**Constraints**

The exact 13/5 route structure, 18-route completion model, 1,505/295-minute contract, and non-gating Advanced Learning, investigations, vocabulary, and textbook work could not change.

**Evidence**

The current complete candidate is bound to `meta/revision-gate-b-review.json`, `meta/revision-gate-b-content-audit.json`, `meta/reading-level-report.json`, `meta/practice-readiness-audit.json`, and `meta/figure-media-plan.json`.

**Result and unresolved concerns**

All thirteen lessons now use the expanded pattern. Subsequent teacher review exposed navigation, model-depth, responsive-layout, vocabulary, and textbook-review issues; those corrections are recorded in the following entries. The complete build still awaits exact-hash teacher acceptance.

**Transfer lesson**

After accepting a slice, propagate its constraints through authored data and shared rendering, then conduct another full-course review. Pattern propagation is not acceptance.

### 23. Navigation and evidence-tool restoration — 2026-09-03

**Status:** `awaiting-teacher-review`

**Learner-facing problem**

The desktop sidebar no longer collapsed, Core Vocabulary and Model Lab were separated from the evidence they produced, and Pilot 2's Model Lab had been reduced from Pilot 1's substantive interactions to three shallow examples.

**Intended improvement**

Restore course orientation and the useful evidence workflow without restoring Pilot 1's reading burden.

**Materials and sources**

Pilot 1's lab interactions were used as behaviour references. Pilot 2's thirteen lesson topics, prerequisite language, state namespace, Process Collection, and completion contract remained authoritative.

**Implementation process**

The persistent desktop collapse/restore control was restored while leaving the mobile drawer independent. The sidebar was regrouped into Start, Learn, Practice & Review, Process Collection, and Resources. Core Vocabulary and the lab moved under Process Collection because they can create saved learner evidence.

Model Lab gained one stable lesson-linked mechanism for every lesson. Each model initially offered four causal steps, multiple cases, feedback, exact lesson return, and scoped collection actions. Learner state advanced to version 3 for model selection and collection flags, with version-1 and version-2 migration.

**Constraints**

Navigation collapse could not hide the mobile control or alter route state. Model evidence remained optional and could not affect 18-route progress. Process Collection had to derive output from canonical model/vocabulary state rather than duplicate text.

**Evidence**

The pre-restoration candidate `cc968289c232ebeee5db0572426ea519806da8920c44dc4a3de008597e85a261` is preserved as `changes-requested`. The thirteen-model mapping is recorded in `meta/model-lab-interaction-map.json` and the grouping in `meta/revision-gate-b-content-audit.json`.

**Result and unresolved concerns**

Navigation and evidence grouping were restored, but the first four-step layout did not fit at intermediate widths and the interactions still did not make their purpose clear enough. Those issues were treated as separate refinements rather than hidden.

**Transfer lesson**

Course simplification must not remove orientation controls or meaningful practice. Group a tool by the learner evidence it creates, and test every responsive state after moving it.

### 24. Models and Data Lab: interaction depth and Predict-Test-Explain-Save — 2026-09-03

**Status:** `awaiting-teacher-review`

**Learner-facing problem**

The restored models still looked like short reveal cards. Learners could not tell what they were investigating, what changed, what to compare, what evidence mattered, or why saving the result was useful. Four mechanism columns also wrapped into narrow, hard-to-read strips.

**Intended improvement**

Turn each model into a guided, low-pressure scientific investigation that explicitly teaches a comparison and produces understandable Process Collection evidence.

**Materials and sources**

Pilot 1 supplied interaction ideas such as phase graphs, pathway builders, supplied-data cases, and evidence comparisons. Pilot 2 supplied the accessible terminology, thirteen-topic sequence, exact lesson links, and non-gating evidence rules.

**Implementation process**

All thirteen stable model IDs were expanded to 49 authored scenarios. Lesson 2 received a seven-phase membrane-voltage explorer. Lessons 6, 8, 11, and 13 received graph/data models with complete tables. Other lessons received causal pathways or synthetic evidence cases. Selecting a scenario changes the relevant mechanism step, graph/pathway/evidence, and explanation while the static equivalent remains complete.

The learner-facing route was renamed **Models and Data Lab**. Every model now states its investigation question, learning purpose, changed variable, controlled comparison, and evidence focus. The interaction order is Predict, Test, Explain, Save. Result reveal requires a prediction. New Process Collection evidence requires a tested result and learner explanation. Reset affects only the active investigation.

State advanced to version 4. Predictions and explanations use stable public IDs with deterministic compact storage keys. Authored graph values, results, pathway text, and explanations are derived at runtime rather than duplicated in saved state.

**Constraints**

Graphs require tables or complete static equivalents; symptom and health cases remain synthetic and non-diagnostic. Model work remains optional. Existing responses, practice, Evidence Slips, vocabulary, notes, and completion state must survive migration.

**Evidence**

Preserved `changes-requested` baselines include `b280c64e8eb144590bce5fcb3bf984de43ae1fc9fef5dfdc0f28ba051fac4161` before responsive model reflow, `bcb522c4ea0626a4c666a85ce71d1d40d73afe57143408112037190431e4586d` before interaction-depth restoration, and `2ea73014993b01e6cd64b0000d1c59d21d03ff3ed4c5af4617f009599babc3ae` before the guided-investigation cycle.

**Result and unresolved concerns**

The lab now has a visible learning purpose and produces a complete prediction/evidence/explanation record. It remains pending full-course teacher review, including whether each scenario provides the right amount of challenge.

**Transfer lesson**

An interactive model is not just a selectable explanation. It needs a question, variable, comparison, evidence, learner prediction, observed result, explanation, and meaningful saved record.

### 25. Container-aware walkthroughs and operable vocabulary previews — 2026-09-04

**Status:** `awaiting-teacher-review`

**Learner-facing problem**

Four-step illustrated walkthroughs and model mechanisms technically stayed inside the page but became unreadably narrow when nested beside another panel. Core Vocabulary also displayed future-term buttons under the wrong filter, and visible disabled terms appeared clickable but did nothing.

**Intended improvement**

Make component layout respond to its actual available width and ensure every visible vocabulary control produces an understandable state change.

**Materials and sources**

The fixes were driven by teacher annotations at 1117 by 902 and 1265 by 902, plus the exact clicked future-term example `Regulated variable and set point`. These are layout/interaction corrections; lesson science and learner IDs remain unchanged.

**Implementation process**

Both mechanism and local-walkthrough step groups now move from readable two-column arrangements to one-column sequences according to their own container width. Minimum-width, wrapping, intrinsic-height, and overflow rules protect number, heading, and explanation text when the sidebar, model index, split media stage, tablet layout, mobile layout, or 200% zoom reduces space.

`Learned so far` now honors the hidden state for future terms. `All term names` presents future terms as operable orientation controls. Selecting one opens a locked preview with its lesson name and exact teaching-route link; full meaning, morphology, mechanism, retrieval, model, and Frayer controls stay locked until that lesson begins.

**Constraints**

Do not use fixed-height nested scrolling to conceal wrapping. A locked item cannot masquerade as a broken button. Selection, focus, search, mobile term choice, and saved active vocabulary state must agree.

**Evidence**

The pre-walkthrough candidate `e5398f56cdba93f5c57e681d6c21b6b4a5c19bd75985ce63babe6d6cde0a3916` and pre-vocabulary-fix candidate `b6eaba5b1f543a62e8971a55b36e5705df01e0f14adc7eaddafcd81989da0e8f` are preserved as `changes-requested`. Specialized E2E exercises actual selection and responsive reflow rather than checking DOM presence alone.

**Result and unresolved concerns**

The shared corrections apply to all thirteen model mechanisms, all fourteen local media equivalents, and all locked vocabulary previews. They remain part of the full build awaiting teacher acceptance.

**Transfer lesson**

Test educational components at their rendered container width, not only at global viewport breakpoints. Every visible control must explain why content is locked and where it will unlock.

### 26. Optional textbook review inside Pilot 2 practice routes — 2026-09-04

**Status:** `awaiting-teacher-review`

**Learner-facing problem**

Pilot 2's course questions were present, but the chapter and unit practice routes lacked Pilot 1's exact textbook assignment, page-opening controls, and corrected native check-your-work support.

**Intended improvement**

Place optional textbook reinforcement beside the corresponding course practice without creating duplicate routes or allowing it to affect grades, time, or completion.

**Materials and sources**

Pilot 1's reviewed chapter and Unit 5 answer content was adapted into Pilot 2's authored `TEXTBOOK_REVIEW_SUPPORT` map. The local normalized Chapter 11-13 PDFs and existing printed-to-physical page mappings remain the learner sources. Raw teacher keys are provenance only.

**Implementation process**

Chapter 11, 12, and 13 Practice received assignments and guides with 20, 30, and 19 native answers. Final Practice received **Unit A — Textbook Unit 5 Review**, explains the numbering difference, opens printed pp. 468-471 at Chapter 13 PDF page 35, and provides 51 native answers. All four blocks appear before their required course questions and include exact-page and exact-question-heading links.

Answers stay hidden until `I attempted the textbook review`. The attempt survives reload; the guide does not reopen automatically. Reveal moves focus to the answer heading, hide returns focus to its control, and the 51-answer guide stays in normal page flow. State version 5 stores only four allowlisted attempt flags.

**Constraints**

The 120 answers cannot expose secure quiz/test material, source IDs, raw keys, or administrative copy. Attempts cannot alter question totals, score, route completion, progress, 1,505 required minutes, or 295 optional minutes.

**Evidence**

The pre-integration SHA `24e18ca81a7bf33a0182825be95472fa2a3f6ac55b779f90f14855e25ee9c66c` is preserved as `changes-requested`. Authored content is in `scripts/lib/biology30-unit-a-pilot-2/textbook-review-content.ts`; generated parity evidence is in `meta/textbook-review-integration.json`; version-5 limits are in `meta/state-budget.json`.

**Result and unresolved concerns**

All four review supports are implemented and Codex-verified. The teacher still needs to confirm the assignment wording, exact-page experience, and whether the long 51-answer guide is the preferred learner treatment.

**Transfer lesson**

Integrate optional source practice where the learner is already reviewing. Persist an attempt, not authored answers, and make printed/physical page mapping an explicit contract.

### 27. Exact Revision Gate B audit and current public teacher-review build — 2026-09-04

**Status:** `awaiting-teacher-review`

**Learner-facing problem**

Many iterative changes had invalidated earlier screenshots and hosted review evidence. A local “passes tests” claim could not show whether the exact complete course was responsive, accessible, persistent, or the same build the teacher would open.

**Intended improvement**

Bind static, browser, visual, state, protected-source, and hosted-page evidence to one exact learner build while preserving the distinction between public review and learner release.

**Materials and sources**

The review set includes every learner route, interaction states for required media and local fallbacks, Models and Data Lab states, vocabulary states, Process Collection, all four textbook review blocks including the expanded 51-answer guide, desktop/tablet/mobile views, and 200% zoom.

**Implementation process**

The complete visual audit generated 78 route screenshots, 137 state screenshots, and 30 contact sheets. Every sheet was opened and inspected; automated geometry reported zero findings. Static validation checked contracts, 25 outcomes, 53 behaviours, exact route/time/practice counts, state migration, protected Pilot 1/A-D hashes, local assets, and non-gating rules. Specialized and project E2E covered navigation, media paths, network failure, models, vocabulary, textbook exact-page/reveal behaviour, persistence, focus, axe, and horizontal overflow.

The exact candidate was deployed to `https://biology30pilot.web.app` for teacher review under the existing review-only authorization. The hosted index was downloaded and hashed; all 22 hosted files matched canonical local files, the title and representative route loaded, the console was clean, and no horizontal overflow was observed.

**Constraints**

Public hosting does not authorize learner use, SCORM export, Brightspace upload, promotion, Studio editing, or B-D changes. Any learner-facing change makes this visual report and deployment stale.

**Evidence**

- Learner SHA-256: `912a213fd62e503b99d9c42f28b1094f8a4f4e31d9772513013adbc02ef4707e`.
- Workspace-tree SHA-256: `f3ae4822477fe3165023e82d3f96eb0476a1a2e7fb2fbde9cf57cb9a3c6cbf41`.
- Visual report: `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-04T16-05-02-890Z/report.json`.
- State version 5 worst case: 39,031 characters, with 8,969 characters of runtime-guard headroom.
- Static Pilot 2 tests: 10/10; specialized E2E: 20/20; project E2E: 1/1; Pilot 1 regression: 12/12; Science comparison: 6/6; workspace verification, manifests, and Studio build passed; `course:doctor` returned only intentional `not-active`.
- Hosted deployment record: `projects/biology30-unit-a-pilot-2/meta/review-deployment.json`, deployed `2026-09-04T16:46:19Z`.

**Result and unresolved concerns**

The complete Revision Gate B candidate is Codex-verified and the public teacher-review URL matches the canonical learner hash. `teacherDecision` remains null. The full course and 21 pending experimental rules are not accepted, and even the five slice-accepted rules require complete-course review before B-D eligibility.

**Transfer lesson**

Treat a deploy as an evidence step, not acceptance. A reviewer must see the same exact hash that passed visual and state checks, and any later edit requires a new evidence chain.

### 28. Pilot 1 to Pilot 2 Advanced Learning Bridge, Gate A — 2026-09-04

**Status:** `awaiting-teacher-review`

**Learner-facing problem**

Pilot 2 successfully replaced Pilot 1's difficult core prose with a clearer prerequisite-first sequence, but the higher-level pathway was incomplete. Each lesson had only one short end disclosure, so a learner could not systematically recover Pilot 1's deeper graph, evidence, mechanism, and unfamiliar-context reasoning without reading both pilots.

**Intended improvement**

Keep Pilot 2's readable core unchanged while placing one collapsed Advanced Learning block directly after every Learn block. Advanced work must deepen curricular reasoning without using harder writing, creating new quizzes, changing grades, or affecting the eighteen required routes. The complete design contains forty blocks and 245 lesson-level optional minutes; the existing twenty-minute Review Seminar extension and thirty-minute Diploma Challenge preserve exactly 295 optional minutes.

**Materials and sources**

- Strict pre-bridge learner baseline: `912a213fd62e503b99d9c42f28b1094f8a4f4e31d9772513013adbc02ef4707e`.
- Authored forty-block contract: `scripts/lib/biology30-unit-a-pilot-2/advanced-content.ts`.
- Pilot 1 source-section inventory: all 470 records in `meta/advanced-learning-bridge.json`.
- Curriculum and excellence gates: current Alberta Biology 30 curriculum, Biology 30 Student-based Performance Standards, and the current Biology 30 Information Bulletin checked through Alberta's diploma-exam support page.
- Existing Pilot 2 Models and Data Lab investigations, lesson explanations, graphs, tables, source locators, prerequisite vocabulary, and review routes.

**Implementation process**

The authored manifest fixes forty stable IDs in lesson/Learn order, their titles, minutes, curriculum outcomes, excellence behaviours, source references, prerequisite terms, evidence form, model destination, and accessibility requirements. Gate A renders eight representative blocks: myelin damage and repair; action-potential graph analysis; excitation, inhibition, and summation; brain evidence localization; visual-processing limits; feedback troubleshooting; ADH source-versus-target failure; and integrated water/salt stress. The other thirty-two entries appear in the checklist as planned but are not represented as complete.

Each rendered block follows its exact Learn section, starts collapsed, explains its connection to the core idea in accessible prose, provides semantic evidence or a worked comparison, and links to the exact Models and Data Lab investigation. A local checkbox and the Process Collection checklist share one completion flag. The `#lesson-02/advanced/l02-b02` form opens the correct lesson and disclosure, scrolls it into view, and focuses its heading.

State version 6 stores forty allowlisted flags as a ten-character hexadecimal bitset in stable manifest order. Version-5 state migrates with every existing response and completion record intact and all Advanced Learning flags unchecked. Malformed or out-of-range state is rejected. Unchecking removes only the advanced completion flag.

The 470-record difference audit resolves every Pilot 1 section to exactly one outcome: retained in Pilot 2 core, rewritten into a named advanced block, retained through Models and Data Lab, retained in review, or excluded with a duplicate/noncurricular/outdated/inaccurate/unsafe/overwhelming reason. No source section silently disappears.

**Constraints**

Advanced Learning remains curricular and optional. It cannot hide missing core teaching, introduce undefined prerequisites, create harder prose for its own sake, alter required questions or Evidence Slips, change the 1,505 required minutes, affect grade/progress/SCORM completion, or reuse inaccurate and noncurricular Pilot 1 material. Pilot 1 and production Units A-D remain protected. No deployment, export, publication, Studio editing, commit, push, or B-D transfer is authorized.

**Evidence**

- Current learner SHA-256: `3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6`.
- Current workspace-tree SHA-256: `eb0b44eaa35352347d4e5658749527f860d690a7383468672f14d06acd193bcb`.
- Review record: `projects/biology30-unit-a-pilot-2/meta/advanced-bridge-gate-a-review.json`; the project owner accepted this exact SHA on `2026-09-04T20:47:33Z` with the instruction “aprove and go.”
- Visual report: `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-04T20-16-45-123Z/report.json`; 81 route captures, 135 state captures, 29 of 29 contact sheets opened, and zero geometry findings.
- State version 6 worst case: 39,061 characters, leaving 8,939 characters below the 48,000-character runtime guard.
- Static Pilot 2 tests: 11/11; specialized E2E: 22/22; project E2E: 1/1; Pilot 1 regression: 12/12; Science comparison: 6/6; workspace verification, manifests, and Studio build passed; `course:doctor` returned only intentional `not-active`.

**Result and unresolved concerns**

The complete architecture and eight-block Gate A slice were Codex-verified and explicitly accepted for the limited purpose of authoring and verifying the remaining thirty-two blocks. That acceptance did not approve Gate B, deployment, export, publication, or B-D transfer. The prior public teacher-review site still serves the pre-bridge `912a213f...` candidate and is intentionally stale; no deployment occurred.

**Transfer lesson**

Preserve an accessible common core, then offer deeper curricular reasoning exactly where it connects to that core. Reuse the audit, adjacency, state-isolation, and exact-review process for B-D—not Unit A block text, timing, models, or scientific examples.

### 29. Pilot 1 to Pilot 2 Advanced Learning Bridge, Gate B — 2026-09-04

**Status:** `awaiting-teacher-review`

**Learner-facing problem**

Gate A proved the placement, language, evidence, deep-link, and completion model with eight representative blocks, but thirty-two planned entries still had no learner-facing content. The higher-level path therefore remained incomplete across most lessons.

**Intended improvement**

Complete all forty optional blocks without changing Pilot 2's readable core, required questions, Evidence Slips, eighteen required routes, 1,505 required minutes, or learner work. Advanced work must add graph, data, mechanism, comparison, and unfamiliar-context reasoning in accessible language rather than restoring Pilot 1's reading barrier.

**Materials and sources**

- Accepted Gate A learner SHA-256: `3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6`.
- Authored source: `scripts/lib/biology30-unit-a-pilot-2/advanced-content.ts`.
- Renderer and version-6 state: `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`.
- Transactional build and Pilot 1 difference audit: `scripts/lib/biology30-unit-a-pilot-2/build-full.ts`.
- Machine contract and readable report: `projects/biology30-unit-a-pilot-2/meta/advanced-learning-bridge.json` and `meta/advanced-learning-bridge.md`.
- All 470 Pilot 1 section-disposition records, current curriculum and performance standards, the Unit A teacher plans and PowerPoints, exact textbook support, and the thirteen existing Models and Data Lab investigations.

**Implementation process**

The accepted eight Gate A blocks were preserved byte-for-byte in the authored manifest. Thirty-two blocks were added under their fixed IDs so Lessons 1–12 each have three extensions and Lesson 13 has four. Every block is approximately 180–300 words, begins with a plain-language connection to the core section above it, defines any additional terminology before use, and supplies a semantic table, pathway, graph interpretation, worked case, or exact Models and Data Lab investigation link.

The renderer now inserts one block immediately after each of the forty Learn sections. All blocks begin collapsed. The lesson checkbox and matching Process Collection checkbox share one allowlisted version-6 bit. Exact links use `#lesson-XX/advanced/<block-id>` and open the lesson, expand the disclosure, scroll to it, and focus its heading. The checklist contains forty available entries and no planned placeholders. Unchecking one entry removes only that completion flag.

The build required the accepted Gate A SHA and refused drift. It preserved the accepted candidate under `raw/advanced-bridge-gate-a-accepted/`, rebuilt through staging, regenerated the bridge reports, and confirmed that all 470 Pilot 1 sections still resolve exactly once to core, a named Advanced block, Models and Data Lab, review, or an explicit exclusion reason.

**Constraints**

Advanced completion remains optional, self-marked, and isolated from grades, required progress, media checks, guided questions, Evidence Slips, textbook review, Core Vocabulary, Models and Data Lab state, and SCORM values. The forty lesson blocks total 245 minutes; the existing 20-minute Review Seminar extension and 30-minute Diploma Challenge preserve exactly 295 optional minutes. State remains below the guard at 39,061 characters. Pilot 1 and production Units A-D remain protected and unchanged.

**Evidence**

- Learner SHA-256: `11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c`.
- Workspace-tree SHA-256: `5ea60d70eb152639be5644965c98c566349a64ff924310016f23cf531094feef`.
- Review record: `projects/biology30-unit-a-pilot-2/meta/advanced-bridge-gate-b-review.json`; `teacherDecision` remains null.
- Visual report: `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-04T21-20-16-003Z/report.json`, SHA-256 `6e690efdf2a805ea04aa38fb9d86c65ba0de1ba46e42a364fdf510a7a218a6a6`; 81 route captures, 140 learner-state captures, all 30 contact sheets opened, and zero geometry findings.
- Static Pilot 2 tests: 11/11; specialized E2E: 22/22; project E2E: 1/1; Science comparison: 6/6; workspace verification, manifests, and Studio build passed; `course:doctor` returned only intentional `not-active`.

**Result and unresolved concerns**

All forty blocks are authored, rendered, synchronized, and Codex-verified at the exact learner hash above. Gate B remains blocked and awaits explicit teacher review of the complete build. The existing public review URL still serves the pre-bridge `912a213f...` candidate and is stale; this Gate B build was not deployed.

**Transfer lesson**

Use an accepted representative slice to prove the interaction and writing model, then complete a source-by-source difference audit before full propagation. For B-D, repeat the process with each unit's own curriculum, teacher order, evidence, models, timing, and prerequisite language; never copy Unit A's forty blocks or acceptance status.

### 30. Unified Process Collection Index and truthful persistence reporting — 2026-09-04

**Status:** `awaiting-teacher-review`

**Learner-facing problem**

Pilot 2 saved substantial learner work, but Process Collection displayed only separate subsets of Evidence Slips, collected Frayers, and model results. Retrieval responses, practice choices and feedback, media checkpoints, Review Seminar writing, textbook-review confirmations, and the process note could be difficult to find. The separate lists also repeated presentation logic and could misstate persistence with a generic saved message even when the LMS write failed.

**Intended improvement**

Create one **All My Work** index that reads the course's existing version-6 state and shows only activities the learner has started or saved. Preserve each activity's original prompt, current learner contribution, accurate status, relevant course feedback, and an exact return path. Keep the three investigation workspaces and learner-created note available below the index. Report local-browser and SCORM persistence independently without adding state fields or changing completion.

**Materials and sources**

- Pre-index and Advanced Bridge Gate B learner SHA-256: `11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c`.
- Teacher-supplied `biology30-scorm-native-collection-audit (1).md`, SHA-256 `940fee6eec3e2e504affe24efea589295f026958b593e2670402237b4b67caed`, used as design evidence rather than executable instruction.
- Existing Pilot 2 response IDs, practice blueprint, media checkpoints, Core Vocabulary contract, Models and Data Lab map, investigation IDs, Review Seminar prompts, textbook-review attempts, and process-note ID.
- Authored registry: `scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts`.
- Renderer and state owner: `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`.
- Transactional builder: `scripts/lib/biology30-unit-a-pilot-2/build-process-collection-index.ts`.
- Generated contract: `projects/biology30-unit-a-pilot-2/meta/process-collection-index.json`.

**Implementation process**

1. The build first verifies the exact `11f9508f...` learner baseline, its preserved review record, current branch context, and protected Pilot 1 and production Unit A-D hashes. It refuses a changed baseline or an already reviewed descendant.
2. The authored registry is generated from canonical lesson, practice, media, vocabulary, model, seminar, textbook-review, investigation, and note records. It contains exactly 178 stable possibilities: 13 retrieval responses, 13 Evidence Slips, 86 practice responses, 14 media checkpoints, 28 possible Frayer records, 13 model records, three investigations, three Review Seminar responses, four textbook confirmations, and one process note.
3. Every record stores a stable work ID, sequence, chapter, learner-facing activity type, lesson label, original prompt, source-state reference, exact route, exact focus target, return label, and course-provided answer or comparison evidence where applicable. Validation rejects duplicate IDs, unknown state IDs, missing source elements, generic route-only targets, or totals other than 178.
4. The learner index is derived each time from canonical state. Empty responses do not render. Practice appears once a choice is retained; a submitted choice also shows its current correctness state and authored feedback. A media record distinguishes a chosen path from the saved checkpoint. Textbook review is explicitly labelled a self-reported attempt. Collection flags change a record's status but never create a second copy of its response.
5. Status is calculated from the source state: unfinished text or selection is **Draft**, a submitted practice or tested model is **Attempted**, a saved media or investigation boundary is **Checkpoint saved**, and an Evidence Slip, Frayer, or model explicitly added to the collection is **Collected**.
6. Chapter and activity-type controls filter only rendered rows. The underlying state and full derived collection remain unchanged. The empty state explains that work appears only after the learner begins an activity.
7. Exact links use `#<route>/work/<work-id>`. The runtime accepts only IDs in the embedded authored registry, opens any ancestor disclosure, selects the linked vocabulary concept or model when needed, scrolls to the precise source, and focuses its heading. Unknown route/work pairs fall back safely instead of querying arbitrary selectors.
8. Copy and print call the same complete state-derived formatter rather than scraping visible cards. Therefore, a filtered-out activity remains in the copied or printed collection. The printed layout hides course navigation and control-only elements without creating a second learner-data store.
9. Saving serializes the existing state once, checks the browser write by reading it back, then performs SCORM `SetValue` calls and `Commit` independently. The four learner messages are exact: **Saved to course**, **Saved on this device**, **Saved on this device only**, and **Not saved—copy your work before leaving**. The last-valid-state and 48,000-character runtime guard remain intact.
10. The renderer is rebuilt in a sibling staging directory. Contracts and review metadata are regenerated and validated before atomic promotion. Any failure removes the staged candidate and leaves the current workspace intact.

**Files and contracts involved**

- `scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts`
- `scripts/lib/biology30-unit-a-pilot-2/build-process-collection-index.ts`
- `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`
- `scripts/build-biology30-unit-a-pilot-2.ts`
- `scripts/tests/biology30-unit-a-pilot-2.test.ts`
- `e2e/specs/biology30-unit-a-pilot-2.spec.ts`
- `scripts/audit-biology30-unit-a-pilot-2-visual.ts`
- `projects/biology30-unit-a-pilot-2/meta/process-collection-index.json`
- `projects/biology30-unit-a-pilot-2/meta/process-collection-index-review.json`
- `projects/biology30-unit-a-pilot-2/meta/process-collection-index-audit.json`

**Constraints**

The index must not duplicate learner responses, infer mastery, claim that a selected video was watched, or imply that textbook questions were recorded. It must not alter the 40 Advanced Learning flags, 86 practice IDs, 18 required routes, 1,505 required minutes, 295 optional minutes, grades, Evidence Slip rules, or any SCORM completion value. State stays at version 6 and the measured worst case stays 39,061 characters. Impersonation remains an authorized review workflow, but this phase adds no non-writing review mode and makes no promise that drafts are private from an authorized teacher.

**Automated and manual evidence**

- Current learner candidate SHA-256: `a195fb28ad233efcb8814e6e5f5bb5fe18fb976924814808e886704cb7101e5f`.
- Current workspace-tree SHA-256: `c7abaed3497d16fac32eee5f661d0e9641691e483b6b50290e6583846bcd0c5d`.
- Static tests verify the exact 178-record registry, rendered parity, source ownership, rollback, stable state version, unchanged course totals, complete focus targets, and all four save messages.
- Browser tests create one record of every activity type, filter the visible index, verify complete copy/print output, follow a link into a collapsed Diploma Challenge, test vocabulary/model exact focus, restore prior state versions, and simulate LMS success, local-only success, LMS failure, and total failure.
- The exact-build visual audit includes dedicated empty, representative, and dense Process Collection states at 1440×900, 1024×768, 390×844, and 200% text size. Manual acceptance is recorded only after every generated sheet is opened.
- Final verification passed 13/13 static tests, 1/1 project E2E contract, and 24/24 specialized E2E tests. The first project-contract run exposed a missing shared `data-worksheet-print` hook; the Print / Save as PDF control now retains its Process Collection selector and also exposes that shared hook, after which the exact project contract passed.
- Exact-build visual report: `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-05T03-25-55-745Z/report.json`, SHA-256 `612fe1b33f466d3404276c357a6991240e90b467ce2bd2bc479978ab0b082d3a`; 81 route screenshots, 140 state screenshots, 34 contact sheets opened and inspected, and zero geometry findings.

**Result and unresolved concerns**

The contained index does not implement the audit's later comparison, showcase, multiple-model-run, error-repair, or visual-annotation proposals. Those remain explicit future experiments. The earlier Advanced Bridge Gate B decision also remains null at its preserved hash; reviewing this contained candidate cannot silently accept that separate bridge.

**Transfer lesson**

For B-D, first enumerate the target unit's real activity/state registry and preserve its builder ownership. Transfer the pattern—one derived index, truthful status, exact allowlisted return paths, one complete copy/print formatter, and independent local/LMS save reporting—not Unit A IDs, prompts, counts, or acceptance status.

### 31. Process Collection toolbar alignment — 2026-09-05

Teacher review at 1117×902 found Copy and Print wrapping unevenly beside the two filters. In `render-gate1.ts`, the toolbar now uses two equal filter columns and a separate full-width actions row. A container query at 400 pixels stacks controls according to the space left beside the sidebar. Rebuild through the existing `process-collection-index` gate; never patch generated HTML. The 178 records and version-6 state remain unchanged. Browser inspection covers 1440, 1117, 1024, 800, and 390 pixel widths and 200% zoom; 13 static tests pass. Current candidate: `219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc`, awaiting teacher review. Transfer principle: give actions a predictable row and respond to component width rather than relying only on viewport breakpoints.

### 32. Checkpoint, honest academic evidence and the full-unit production recipe — 2026-09-05

**Problem and intended change.** The user wants to finish Unit A and reproduce the complete improvement process in B, C and D after supplying the missing materials. Earlier route-based checks overstated what they proved: a matching lesson or first question could be reported as evidence for a different skill. A large static test count did not establish independent academic clearance. The existing journal also risked losing later entries when a generated section was replaced.

**Checkpoint and preservation.** Before source edits, record branch, parent commit, dirty paths, learner hashes and protected trees. Commit the explicitly scoped Biology checkpoint as `2ad72ec06b104c589f91e4b5afb8d86c322bc168`; do not stage unrelated work or push. Keep the original candidate `219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc` under `raw/final-academic-baselines/`. Originals and excluded archives remain separate checksum-addressed resources. A stale Git lock with no process owner was moved recoverably rather than deleted.

**Materials inspected.** Re-read both pilot ledgers, authored lesson/practice/model/collection inputs, the current atomic map, teacher sequence/source contracts, production B–D family contracts and source catalogs. Recheck the official curriculum, performance standards and Biology bulletin link. Verify both shared Brightspace ZIPs and all five B–D notes PDFs. Do not open hidden tests or import raw teacher keys into learner pages. Distinguish an archived resource candidate from an approved standalone deck, textbook or current daily plan.

**Exact implementation steps.**

1. Add `academic-evidence.ts` with explicit bindings for all 53 acceptable-standard behaviours and the 13 skill/STS outcomes. Each binding names the actual question or task selector, rationale and remaining gap. Reject missing, whole-route and unrelated-first-question fallbacks. The action-potential graph behaviour now targets the real Lesson 2 graph question; sensory collaboration no longer points to a rods question.
2. Generate an honest 78-record atomic index: 25 outcomes and 53 behaviours. Its 45 gap records include aggregate duplicates. Label the result a structural/reference audit, not complete academic coverage. Preserve practical distinctions: identifying a labelled figure is not labelling one; ruler-drop reaction time is not an isolated reflex; synthetic data are not published research; reading a procedure is not performing it.
3. Inventory all 86 rendered practice items with exact prompt, choices, key, rationale, distractor feedback, textbook chapter/printed/physical page, focus target and item checksum. Require structural completeness but mark all item-level scientific reviews pending until independently done. Inventory all 14 media checkpoints with transcript, duration and local-equivalence review still required. Do not reinterpret an availability check as content review.
4. Introduce CNS, PNS, action potential, threshold, receptor and effector in Lesson 1 before mechanisms use them. Retain the readable core style, question IDs, evidence responses, times and state. Treat unfamiliar Lesson 1 dependencies as new, not incorrectly as previously taught.
5. Bind 165 vocabulary controls to exact authored passages. Use stable focusable IDs; when the phrase is not present in core prose, label the control **Definition** and target its definition. This deliberately avoids calling a vocabulary row a first-use passage. It is not a substitute for the remaining all-terms scientific/prerequisite audit.
6. Make history updates bounded and dated entries append-only with `review-history.ts`. Test that rebuilding a generated heading cannot erase a later teacher entry. Keep historical conclusions labelled with their exact candidate rather than retroactively rewriting acceptance.
7. Add a strict `final-academic-review` contained build gate. Stage the candidate and metadata, preserve the baseline and protected trees, then promote transactionally. Any refusal or failure must leave the current candidate intact. The current learner file remains generated from TypeScript, not a direct-edit target.
8. After the first technical pass, inspect actual viewport close-ups. These exposed a separate tablet failure despite zero horizontal-overflow findings: a 400-pixel minimum diagram column squeezed core prose, and vocabulary action links squeezed definitions. Replace fixed minimum two-column layouts with auto-fit readable tracks, place term actions below definitions, and stack lesson media based on its available container width. Add a browser test at 1024, 1117 and 1440 pixels that rejects prose/definition columns under 300 pixels and overlapping term actions. At 390 pixels, inspected Lesson 1 prose retains 346 pixels of width. Regenerate all exact-build evidence after this fix.
9. Generate `biology30-improvement-transfer-contract.json` and `bcd-material-readiness.json`. The 52 rules comprise 21 Pilot 1 and 31 Pilot 2 rules, each with source owner, input/output list, process, verification, recovery and B/C/D status. Five previously accepted Pilot 2 rules retain only their slice scope; no complete-unit transfer is accepted. The read-only `--check` mode rejects stale hashes, rules or materials.
10. Put the operative final Unit A work queue, complete material checklist and twelve-step full-unit implementation recipe at the top of this playbook. Preserve the detailed historical image prompting, teacher comparison, video, textbook, review, state, model, vocabulary and collection procedures below. B–D will use their own builder and unit-specific records; no Unit A HTML, hard-coded count or acceptance is copied blindly.

**Commands, outputs and evidence.** Use the exact build and transfer commands in the current recipe, followed by Pilot 2 static tests, both browser suites, visual audit, Pilot 1 regression, science comparison, workspace verification, manifest validation, Studio build and course doctor. The current candidate is `b669aaadd6d4f08626f0476778e53a46e3cde8fd5f2a48cb3a979edb82d72652`, tree `06f4fe274d8f702e9ed5c32a1b5a9ab608b8e684909075e912b1dabb6b5202f2`. The exact visual report is `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-05T15-31-21-658Z/report.json`. Whole-page thumbnails prove broad layout only; use viewport and enlarged figure inspection for text, labels and scientific accuracy. The initial pre-layout audit at SHA `46b5551e...` is historical, not current evidence.

**Result and unresolved concerns.** This cycle completes the checkpoint, repeatable production recipe and evidence-gap inventory, plus the contained prerequisite/link/layout repairs. It does not finish all seven final Unit A work packages. The course still has 13 lessons, 18 required routes, 1,505 required minutes, 295 optional minutes, 40 advanced blocks, 86 practice items, 14 media checkpoints, 28 families and 178 possible collection records. State remains version 6 at 39,061 worst-case characters. All learner-owned saved work and protected Pilot 1/A–D learner trees remain unchanged. Academic clearance, independent item/media review and complete-build teacher acceptance remain pending; no deployment or second commit occurred.

**Transfer principle and adaptation.** Prepare the complete resource/decision package before starting a target unit, then perform one coordinated full-unit implementation and complete review. “One pass” does not mean blind one-shot generation. Match evidence to the operation actually required, test semantic claims separately from structural validity, inspect narrow layouts even when overflow is zero, and keep every decision/recovery step in the living record. B, C and D require their own reproductive, genetics and population-science data, terminology, media, page maps, skills tasks, migrations and teacher decisions. Status: `in-progress` academic completion; new process rules `awaiting-explicit-user-review`.

### 33. Chapter 11: turn diagram exposure into saved learner reasoning — 2026-09-05

**Problem and boundary.** After the final academic inventory, the user said to proceed with the next step. This batch addresses Chapter 11's missing observable diagram/graph work. Existing recognition questions could not establish that a learner could name all structures, explain their functions, distinguish grey/white matter, or label graph phases. Six non-graded study responses were added inside four existing Models and Data Lab records. No required question, completion gate, course minute, lesson order, core paragraph, or later-chapter content was replaced. This is not the completion of the full final-A queue.

**Before editing.** Confirm branch `codex/studio-direct-editing-v1` and recovery commit `2ad72ec06b104c589f91e4b5afb8d86c322bc168`. Record the dirty tree without staging it. Hash Pilot 2's current learner file and protected Pilot 1/production A–D trees. Add a strict `CHAPTER_11_BASELINE` constant for `b669aaadd6d4f08626f0476778e53a46e3cde8fd5f2a48cb3a979edb82d72652`. On the first build, require that exact current learner file; on a continuation, require its immutable saved copy. The transactional sibling staging directory receives the preserved HTML and review contracts under `raw/chapter-11-academic-baselines/<sha>/` before candidate replacement. Review ZIPs are not copied into this baseline's metadata snapshot. Keep Downloads, shared archives, Pilot 1 HTML and production units unchanged. A concurrently changed deployment record and review ZIP remain user-owned.

**Materials and scientific checks.** Use the existing verified Chapter 11 deck, teacher-source crosswalk, textbook page map, performance-standard records, accepted course diagrams and authored core explanations. No new deck extraction, slide screenshot, private key, image download or AI-generated raster is needed for this batch. The original PowerPoint hash is `74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1`. Recheck OpenStax nervous tissue, action-potential and central-nervous-system sections; their exact URLs are in the [task contract](../../biology30-unit-a-pilot-2/meta/chapter-11-academic-repair.json). The prior same-day Alberta authority check remains separately identified: a later support-page request timed out, so do not invent a newer bulletin verification.

| Authored task ID | Existing model / teaching lesson | Source locators | Saved limit and task |
| --- | --- | --- | --- |
| `neuron-labels` | `myelin` / Lesson 1 | `ch11-day-1`, deck slides 1–20, printed pp. 367–372 | 600 characters; A–G structure/function, distinguishing a Schwann cell from its myelin layers. |
| `reflex-labels` | `myelin` / Lesson 1 | `ch11-day-1`, slides 1–20, pp. 367–372 and 384 | 400; receptor, sensory, interneuron, motor and effector roles, classified by information flow rather than universal morphology. |
| `voltage-labels` | `action-potential` / Lesson 2 | `ch11-day-2`, slides 21–30, pp. 374–377 and 384 | 650; A–F phases, T threshold, X/Y refractory intervals and a 105 mV change calculation. |
| `transport-reasoning` | `action-potential` / Lesson 2 | `ch11-day-2`, slides 21–30, pp. 374–377 and 384 | 400; distinguish pump, leak and voltage-gated channel jobs; explain local-current propagation and refractory recovery. |
| `matter-comparison` | `nervous-system` / Lesson 4 | `ch11-day-4`, slides 43–53, pp. 389 and 396–399 | 400; identify grey/white matter A–D in cerebral and spinal sections, then explain contents and arrangement limits. |
| `brain-labels` | `brain` / Lesson 5 | `ch11-day-5`, slides 54–65, pp. 389–395 and 399 | 700; A–J brain/spinal structures, functions, cerebrum/brainstem groupings and limitations of symptom inference. |

**Authored implementation, in order.**

1. Create [chapter-11-study.ts](../../../scripts/lib/biology30-unit-a-pilot-2/chapter-11-study.ts). Each record owns its ID, model/lesson, title, original prompt, short sentence frame, character limit, visual kind, long description, comparison explanation, behaviour IDs and teacher-plan/slide/page locators. Do not infer an outcome from a heading. Bind the actual learner operation in `academic-evidence.ts` to the exact study task selector.
2. Use original SVG for the simple lettered neuron and grey/white-matter sections; semantic HTML for reflex steps and the transport table. Reuse the existing course brain schematic as a clearly described cutaway, with a separate lettered study instance. At build time, rename its IDs and replace visible structure labels with A–J. Retain the labelled teaching figure in Lesson 5: the unlabeled response task has a different purpose, not a second decorative teaching plate. Source-selected raster figures remain untouched.
3. Share one `actionPotentialFigure()` between Lesson 2's labelled figure and the lettered task. Use a genuine numeric 0–4 ms axis and −80 to +35 mV scale, with threshold near −55 mV and rest near −70 mV. Keep the plotted values and local HTML data table consistent. Start the approximate absolute-refractory shading during the upstroke (1.5–2.7 ms in this synthetic teaching trace); follow with the relative interval (2.7–4 ms). Explain that channel state/recovery, not a fixed universal time gate, defines refractory behaviour. Independent graph drawing remains a separate open skill.
4. In `render-gate1.ts`, insert native collapsed study disclosures immediately beneath the matching model heading. A disclosure contains the prompt, figure/table, adjacent complete description, labelled textarea, sentence frame, truthful save status and initially hidden comparison guide. Keep the existing Next Step typography and controls; the `uncodixfy` skill directed this restraint. There is no card-wall redesign, nested text scroller, custom quiz, correctness score or completion checkbox.
5. Form each new response ID as `biology30-unit-a-pilot-2:chapter-11-study:<task-id>:v1`. Autosave into the existing `responses` map. Allow only the six known IDs for this new prefix; reject unknown IDs/non-string values and clamp to each declared limit. Do not remove unrelated legacy IDs or reinterpret earlier answers. Existing state versions migrate as before; schema remains 6 because the response-map format and top-level fields are unchanged.
6. Reveal **Compare with the explanation** only after a non-empty draft. The comparison does not grade the draft, overwrite it or promise mastery. Emptying this one textarea hides its guide and leaves other work intact. Reload restores writing with disclosures collapsed. Resetting the existing model investigation resets its prediction/test/explanation only, not these separately saved diagram notes.
7. Add `studyTasks` references to the four existing model records in `process-collection-content.ts`. Derive diagram-note lines from `responses` in `processRecordView()`. A diagram-only draft starts its parent model record; do not add six duplicate collection records or persist a copied text version. The registry remains 178 potential records. Existing Copy and Print traverse the structured model record and therefore include these notes even when the collection is filtered. Return links target the exact parent model heading, where the named study disclosure can be reopened; this batch does not claim child-disclosure deep links.
8. Export/reuse `estimateWorstCaseState()` in the contained builder. The six field maxima sum to 3,150 raw text characters; encoded overhead matters too. Recompute the actual compact payload, not simple character arithmetic: 42,284 characters, 73 worst-case persisted response fields, schema 6, existing 48,000-character last-valid-state guard. Fail a build above the 44,000-character target. There is only 1,716 characters of target headroom for future work.
9. Generate `meta/chapter-11-academic-repair.json`, extend the response map and manifest canonical-source inventory, regenerate lesson figure descriptions from actual HTML, and record six model-study figures separately from the lesson-only figure inventory. Preserve exact source, rights, accessibility and teacher-review status. Update the existing `explicit-academic-evidence-without-route-fallbacks` rule with this iteration; do not manufacture another accepted rule or change historical slice approvals.
10. Rebuild only through the existing final-academic transaction, validate all new selectors and preserved practice prompts/choices/keys/rationales/distractor feedback against the immutable pre-batch HTML, then compare protected project trees before promotion. Rebuilding metadata after verification must reproduce the same learner SHA; otherwise invalidate screenshots and rerun affected evidence.

**Commands and evidence.**

```bash
npm run build:biology30-unit-a-pilot-2 -- --project biology30-unit-a-pilot-2 --gate final-academic-review --baseline-workspace-sha 219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc
npm run test:biology30-unit-a-pilot-2
npm run audit:biology30-unit-a-pilot-2:visual
E2E_STUDIO_PORT=4182 npm run test:e2e:biology30-unit-a-pilot-2 -- --output=<new-isolated-temporary-directory>
E2E_STUDIO_PORT=4182 npm run test:e2e:project -- --project biology30-unit-a-pilot-2 --output=<new-isolated-temporary-directory>
npm run test:biology30-unit-a-improvement-pilot
npm run test:science-comparison
npm run verify -- --project biology30-unit-a-pilot-2 --mode workspace
npm run validate:manifests
npm run build:studio
npm run course:doctor -- --project biology30-unit-a-pilot-2
npm run audit:biology30-improvement-transfer
npm run audit:biology30-improvement-transfer -- --check
npm run test:biology30-improvement-transfer
```

Port 4182 is an isolated test-server choice, not a permanent course setting. Do not run two suites against the same server simultaneously or overwrite the user's active Studio artifacts. `course:doctor` may report only intentional `not-active`. Temporary screenshots/test outputs are evidence, not learner assets.

Closeout passed 14 Pilot 2 static tests, 27 specialized browser tests, the project browser test, 12 Pilot 1 regressions, six comparison tests and four transfer tests. The transfer test was updated to require the graph-labelling task and its exact response ID instead of the old recognition-question mapping; it must not make an unrelated quiz stand in for labelling. The 52-rule transfer registry also carries this iteration's source, evidence and verification pointers, without turning a technical pass into acceptance. The verification record retains all failures and a cosmetic warning for nine whitespace-only generated lines; no cosmetic rebuild changed the inspected learner hash.

The exact candidate is `21363490e611251c01101cee0bc5925583d1b856b8285a87ee74838ddd1341e5`. Its visual report is `.runtime/biology30-unit-a-pilot-2-visual-audit/2026-09-05T21-41-12-016Z/report.json`, SHA `35239dce56c040c29a9a344df7c44bfa1e77050773d0cd32ddde87e293b4ab7c`: 81 route captures, 172 state captures, 38 sheets opened and inspected, zero automated geometry findings. New tasks were inspected at desktop, tablet, mobile and 200% text size; the four SVGs were also opened enlarged. Actual desktop/tablet neuron screenshots check readability beyond thumbnail geometry. The result does not certify all unchanged scientific content or media transcripts. Final command outcomes are in [the current verification record](../../biology30-unit-a-pilot-2/meta/final-academic-verification.json).

**Failures worth preserving.** An intermediate build put `updateStudyGuides()` in an old unused runtime function, not the emitted runtime. Browser initialization failed; static HTML tests did not detect it. Move the helper into the actual emitted runtime, capture page errors, rebuild and verify initialization before full suites. The first new persistence test seeded local storage before reloading, allowing the old page's unload save to replace the fixture. Use a one-time `addInitScript` fixture after unload/before new-page initialization, matching existing migration-test practice. A complete run then recorded 25 passes plus that old fixture failure and a Studio preview-setup timeout; the corrected focused pair passed without changing learner behaviour or raising existing timeouts. Keep failures and final reruns separately in the verification record. Some locator screenshots catch the fixed header over their top edge; actual viewport close-ups are needed before labelling that a content-clipping defect.

**Result, remaining concerns and B–D adaptation.** The six tasks are implemented, technically reviewed and awaiting explicit teacher review. They provide an observable response opportunity, not proof of correctness or performance. The audit now contains 36 overlapping gap records. Microscopy, actual safe reflex procedures, independent graph construction, Chapters 12/13 identification/skills, scientific exchange/revision, complete hormone/published-data evidence, independent item/media review and complete-build acceptance remain open. The next lesson batch cannot simply add similarly sized fields: first budget storage and reuse existing response routes where appropriate. For B, C and D, preserve this task/source/state/verification method, but select unit-specific reproductive structures, cell/cross/pedigree/molecular diagrams or population graphs. Recheck every response operation, diagram convention, source locator, local equivalent, reset boundary and persistence limit. No Unit A letters, IDs, diagrams, counts, acceptance or runtime fields transfer automatically.

### 34. Review the actual learning and source evidence, not only the contracts — 2026-09-05

**Request, cycle and boundary.** The user asked to do the remaining academic reviews. This was a source-grounded review, not authorization to rewrite the learner course. The reviewed learner SHA remains `21363490e611251c01101cee0bc5925583d1b856b8285a87ee74838ddd1341e5`, on branch `codex/studio-direct-editing-v1` at the existing `2ad72ec06b104c589f91e4b5afb8d86c322bc168` checkpoint. Pilot 1 learner content, production A–D, saved-state fields, question meanings and the deployed review were not changed. The result is **findings recorded, not academically cleared**. Historical technical passes and slice approvals remain attached to their original scope.

**Materials required and exact sources.** Use the current rendered learner HTML plus `final-academic-review.json`, `curriculum-performance-map.json`, `reading-level-report.json`, the approved local chapter PDFs and the teacher-source contracts. Recheck Alberta's curriculum, standards and Biology-specific bulletin links; retain the observed edition rather than inferring an update. OpenStax synaptic and hormone mechanisms help qualify older textbook shorthand. For video, use actual publisher transcripts or displayed captions, not generated summaries. The current report lists all local PDF checksums, official URLs, source pages and each public video acquisition timestamp. It contains no secure assessment, teacher-only answer archive, account credential or downloaded YouTube media file.

**Read and capture before judging.**

1. Check branch/commit and the actual HTML hash; preserve the user's dirty tree. Read the current handoff, prompt pack and this playbook before treating any prior “passed” claim as academic evidence.
2. Extract all 86 rendered prompts, every choice, the retained answer key, rationale, wrong-answer feedback and textbook controls. Read them individually beside the exact core teaching passage. Write independent key reasons and item-specific concerns in [remaining-academic-review.ts](../../../scripts/lib/biology30-unit-a-pilot-2/remaining-academic-review.ts), then make the generator reject a mismatch with the rendered key. Record cognitive demand as a reviewer judgment, not measured difficulty. No key reversal was recommended; 68 generic feedback records, weak distractors and a 62/21/3/0 visible-key distribution still require repair. All 24 Final Practice answers appear first.
3. Read actual textbook folios and explanations. Pypdf extracts the three local PDFs into a task-specific scratch folder; do not modify originals. The verified ranges are Chapter 11: 44 pages/printed 360–403; Chapter 12: 30/404–433; Chapter 13: 38/434–471. First check document and physical-page bounds, then relevance. In the mixed Final Practice sets, `practiceItems(..., "chapter-13", ...)` assigns the same chapter to nervous and sensory questions: twelve links have negative PDF pages. Separately, 22 printed-page choices target unrelated teaching. The counts overlap. Examples: myelin 372/378 instead of 371, cerebellum 387/391 instead of 392, iris 411 instead of 413, and ADH 441/444–445 instead of 446. Every recommendation is in the machine review; partial/background support is labelled and should keep a direct local-teaching link.
4. Do not treat source images or textbooks as infallible. Page 440 misclassifies thyroxine as water-soluble; retain the corrected receptor mechanism. Older regeneration, pump, autonomic and insulin shorthand must not undo course corrections. The source-page review is an accuracy gate, not permission to replace explanations wholesale with textbook text.
5. Render and inspect both columns of standards PDF pages 6–10. Text extraction alone had lost the distinction: five stored rows belong to excellence (`A1.3k-04`, `A2.3k-02`, `A2.3k-03`, `A2.5k-02`, `A2.6k-04`), and `A1.4s-01` is a local outcome-derived criterion. The remaining 47 are acceptable examples. Standards examples are illustrative, not exhaustive or individually prescriptive. The Program of Studies remains the required-content authority. Independent action-potential drawing is an excellence example; this does not remove core graph/data analysis or the teacher's request to work with graphs.
6. Reconcile every one of the 36 open gap records against the actual learner task and source level. [The report](../../biology30-unit-a-pilot-2/meta/remaining-academic-review.md#every-remaining-structural-gap) groups overlapping records but retains an individual machine disposition. Keep genuine eye/ear/gland/hormone evidence gaps; distinguish practical delivery decisions, optional extension examples and missing inquiry/communication operations. The previous statement that an environmental-endocrine published-data hypothesis is necessarily an additional required core activity is superseded. Actual data-gathering, reasoning and communication skills remain required at their proper outcome level.
7. Inspect all 14 `[data-local-equivalent]` sections and their actual checkpoints. Each has four text steps and a short summary, with no image, graph, table or model in the walkthrough. The local text generally supports the checkpoint key but is not the promised complete illustrated alternative. Define the selected learning objectives and ordered visual explanation needed for each path; nearby lesson images alone do not establish objective-by-objective parity.
8. Fetch public video metadata without login cookies or hidden credentials. Record title, provider, full duration, reported availability/embedding and English track metadata separately from transcript/caption review. All fourteen direct timed-text responses were HTTP 200 with empty bodies. Do not record these as successful transcripts or claim the videos are unavailable. One complete NIH publisher transcript was accessible and reviewed; thirteen remain pending. The brain clip needs scope/wording qualifications despite its authoritative publisher. Public summaries and topic lists cannot substitute for the actual remaining captions. Full clips total 6,131 seconds; pacing, paused viewing and student workload still need observation.
9. Re-read the thirteen core explanations and the existing readability report. Their 702–809 core words and approximately 10.9–13.4 words per sentence support the teacher's accessible direction. They are not independent comprehension scores. Repair missing evidence and causal steps without turning Advanced Learning into difficult core writing. Check prerequisite language in distractors, diagrams and selected video segments, not only the four anchor words.
10. Ask whether practical delivery is online, supervised or mixed before designing physical skill requirements. Do not confuse ruler-drop reaction time with a reflex or a synthetic hearing plot with tool use. Record accommodations honestly. Keep the ordinary-text payload estimate at 42,284 and its 1,716-character headroom visible; a new batch must not truncate existing writing or silently raise the limit. This estimator does not replace adversarial escaping/Unicode tests.

**Reproduction commands and artifact roles.** The read-only collector is [review-academic-source-evidence.py](../../../scripts/lib/biology30-unit-a-pilot-2/review-academic-source-evidence.py); the authored judgments are separate from the [report generator](../../../scripts/review-biology30-unit-a-pilot-2-academic.ts). Source extraction goes only into a freshly created task-specific directory. Generated reports go only into Pilot 2 metadata, never `workspace/index.html`.

```bash
review_scratch=$(mktemp -d /tmp/biology30-academic-review-XXXXXX)
/Users/deanguedo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  scripts/lib/biology30-unit-a-pilot-2/review-academic-source-evidence.py \
  --output-dir "$review_scratch"
npx tsx scripts/review-biology30-unit-a-pilot-2-academic.ts --evidence "$review_scratch/source-evidence.json"
npx tsx scripts/review-biology30-unit-a-pilot-2-academic.ts --check
npx tsx --test scripts/tests/biology30-unit-a-academic-review.test.ts
npm run audit:biology30-improvement-transfer
npm run audit:biology30-improvement-transfer -- --check
```

The Python runtime path is the one discovered on this machine; rediscover it on another host. This run used `/tmp/biology30-academic-review-0xcqhs`. Source PDFs and extracted text there are inspection scratch, not durable canonical paths. The retained report records hashes and URLs so the input can be reacquired. Running extraction again does not complete a human transcript or page-content review automatically. A changed learner hash, reviewed contract or authored judgment invalidates the exact-build record; repeat affected judgments before regenerating.

**Failed checks and lessons.** PyMuPDF was unavailable, so extraction used the already installed pypdf; Poppler was available through its bundled absolute path for standards-page rendering. The first report-generation attempt failed on the wrong Final Practice chapter, correctly exposing the locator defect. The review generator was adjusted to record invalid learner locators as findings, not hide them or refuse to produce the review. A missing manual judgment for the TSH continuation on p.449 then failed closed; a specific partial-support judgment resolved that authoring omission. All fourteen empty caption responses remain recorded failures to obtain transcript text, not successful factual reviews.

**Verification, result and next changes.** [The dedicated review-verification record](../../biology30-unit-a-pilot-2/meta/remaining-academic-review-verification.json) records the focused/static/manifest/doctor results and protected hashes. No learner build or new browser/contact-sheet audit was performed for this report-only pass; the current 38-sheet visual record was produced in the preceding Chapter 11 batch. The machine transfer record now carries this review under the existing academic-evidence rule, without adding an accepted rule or overwriting older decisions. Start the next authorized repair batch with per-item chapter/page bounds and relevance, answer-position presentation, specific distractor feedback and source-level contract corrections. Then address complete local media paths, actual transcript reviews and the teacher's practical-delivery choice, before adding further saved fields. Final acceptance, pacing/student trials and live LMS certification remain separate gates.

**B–D adaptation.** For each unit, independently inventory actual folios, question concepts and chapter ownership, standards columns, supporting terms, full video segments and accessible equivalents. Require an item-level review even when every key is correct, a diagram-level check even when the course looks good, and an actual operation/response link even when all outcome IDs resolve. Never copy A's counts, text, page arithmetic, source mistakes, level classifications or approval status. The reproducible checks transfer only as candidate process safeguards until the teacher accepts the complete Unit A pattern.

### 35. Repair textbook links, practice feedback and standards levels without losing learner work — 2026-09-05

**Authorization and exact scope.** Following entry 34 and the proposed next step, the user said “Ok do it.” This batch implements the bounded practice/source-classification corrections, not the entire outstanding academic queue. It preserves the teacher's accessible core explanations and accepted visual direction. No new question, saved field, activity, required minute, image or video was added. The lesson prompts, answer keys and rationales are byte-equivalent after rendered-text normalization. Wrong alternatives, their feedback, displayed choice order, practice textbook links and exact local-help links are deliberately changed. The new learner SHA is `f39669f01779f98a1c8d7d3ec5fe7e1524100d9d55f0b9286c01f4de5603e865`, tree `982c883f92a51cd5176b9561745ed3a1b8496b5866c3d9614612ed54fac9db27`; `teacherDecision: null` and `transferReady: false`.

**Inputs and preservation.** Start with all 86 item judgments in entry 34's review, the rendered `21363490...` learner baseline, the approved local chapter PDFs, exact core/advanced teaching selectors and the standards PDF. Recheck the branch and commit; preserve unrelated dirty changes. The current checkpoint remains `2ad72ec06b104c589f91e4b5afb8d86c322bc168` on `codex/studio-direct-editing-v1`. The build makes a content-addressed copy of pre-correction HTML and metadata under `raw/academic-correction-baselines/21363490e611251c01101cee0bc5925583d1b856b8285a87ee74838ddd1341e5/` before replacement. It stages the candidate and validates protected Pilot 1/production A–D trees, locators, contracts and invariants before promotion. A later rebuild accepts only that known baseline or the exact current correction report; a drifted learner file is not silently overwritten. Raw baseline files and source PDFs are never edited.

**Source review mechanics.** The official diploma-support page still linked the 2025–2026 Biology-specific bulletin at the 2026-09-05 check. That observation is recorded, not a perpetual “latest” claim. The source check also used the official curriculum and actual performance-standards pages 6–10. Local pypdf extraction provided searchable text; Poppler-rendered pages were opened to identify the two source columns. Inspect page content as well as arithmetic. The chapter bounds are 11: printed 360–403/physical 1–44; 12: 404–433/1–30; 13: 434–471/1–38. Offsets are 359, 403 and 433 respectively, valid only for these exact normalized files.

1. For every item, identify the idea that supports its key and the most precise previously taught local passage. Do not inherit a single chapter argument from the parent Final Practice set.
2. Read the selected printed page. For example, neuron structure uses 372, myelin function 378, the action-potential graph 376, receptor classes 408, iris 411, hearing pathway 420 and ADH source/response 441 or 444 as appropriate. These are examples of checked locators, not a map to copy into B–D.
3. Record `direct` versus `background` support. The textbook does not explicitly support every unfamiliar data inference. A source with limited relevance gets “Textbook background on p. …” and a precise local explanation link, not an assertion that the answer is printed there. The item-level machine report retains original and replacement locators and rationale.
4. Preserve scientific corrections. Avoid p.390's left/right personality claims for localization; p.387 is background for the local evidence explanation. Treat p.398's simple autonomic opposites cautiously. Do not let p.440's thyroxine classification replace corrected local receptor teaching. “In the supplied textbook” is provenance, not a correctness guarantee.
5. Validate integer/range/offset/document agreement for every rendered textbook control, not only changed ones. Test the actual embedded reader's chapter and physical-page URL for nervous, sensory and endocrine Final Practice questions, plus focus at the precise local passage.

**Authored implementation and artifact ownership.**

- [practice-corrections.ts](../../../scripts/lib/biology30-unit-a-pilot-2/practice-corrections.ts) is the authored 86-item overlay: chapter/page, exact local destination, support level, plausible replacement distractors, feedback and stable displayed order. It exports the baseline/iteration constants and bounds validator. The existing `full-content.ts` prompts and keys remain the baseline content; its interface now permits historical choices.
- [render-gate1.ts](../../../scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts) applies the same overlay to every displayed item and emitted practice contract. It renders current choices, old-choice metadata, feedback, exact textbook controls and local links. It restores retired answers visibly as previous answers rather than selecting a different new radio button.
- [process-collection-content.ts](../../../scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts) merges historical and current choice meanings for its derived practice records. It does not add a second evidence state.
- [contracts.ts](../../../scripts/lib/biology30-unit-a-pilot-2/contracts.ts), [atomic-contract.ts](../../../scripts/lib/biology30-unit-a-pilot-2/atomic-contract.ts), [academic-evidence.ts](../../../scripts/lib/biology30-unit-a-pilot-2/academic-evidence.ts) and [final-academic-audit.ts](../../../scripts/lib/biology30-unit-a-pilot-2/final-academic-audit.ts) own standards classification, required versus advanced evidence binding and honest open-gap reporting.
- [academic-corrections.ts](../../../scripts/lib/biology30-unit-a-pilot-2/academic-corrections.ts) independently recomputes changes from old/new HTML, authored corrections and contracts. [Its checker](../../../scripts/check-biology30-unit-a-academic-corrections.ts) compares that recomputation with [the generated JSON](../../biology30-unit-a-pilot-2/meta/academic-corrections.json). [The Markdown report](../../biology30-unit-a-pilot-2/meta/academic-corrections.md) provides the readable 86-item result. Do not patch generated HTML or hand-edit a report to excuse drift.

**How saved-answer compatibility works.** Visible position and persisted value are different concepts. Current keys are arranged across the four visible positions as 21/22/22/21, statically authored rather than randomized after load. The correct value and text do not change. Unchanged wrong-choice meanings keep their existing values. A materially different wrong choice gets a fresh one-character value: original `a/b/c/d` slots use `e/f/g/h` for the replacement where needed. This is a choice-level meaning revision, not renaming all question IDs. Materially changed prompts or correct keys would still require versioned question IDs and a separate migration.

The retired value, exact old text and applicable old feedback remain allowlisted for existing states. On reload, a retired answer is displayed as a previous response, with no new choice falsely selected. Process Collection and its structured copy/print retain the old meaning. Selecting a new option hides the previous-answer notice; checking it saves that new value using the existing handler. Old drafts and attempted answers are retained, unknown values are rejected, and unrelated writing and completion remain unchanged. The schema stays 6 and no additional persisted field is introduced. The existing ordinary-text estimate stays 42,284 characters; preserving single-character values does not increase it. This is not proof against all escaping/Unicode extremes; the last-valid-state and 48,000-character runtime protections remain in place.

**Standards-level correction in detail.** Keep the 53 stable record IDs for traceability, but classify their authority honestly: 47 acceptable examples, five excellence examples and one local criterion. Excellence IDs are `A1.3k-04`, `A2.3k-02`, `A2.3k-03`, `A2.5k-02` and `A2.6k-04`. Local `A1.4s-01` is derived from the curriculum's communication outcome on physical PDF page 53; it is not represented as a verbatim acceptable-column example. Each record carries source kind, source column and scope. The five excellence bindings point to exact existing optional blocks; they do not make advanced work a core prerequisite. Required foundational knowledge/analysis remains in core. One existing optional comparison can now be bound correctly, so the machine queue changes from 36 to 35 overlapping gaps (32 required-scope, three optional-scope); this is a mapping/scope correction, not proof of another student's achieved skill. Historical “53 acceptable” claims remain in their dated entries with this explicit supersession.

**Observed results, not inflated counts.** Across 86 items: zero changed prompts or reversed keys; 49 changed textbook locators and zero invalid current locators; 188 replaced wrong choices; specific feedback for all 258 visible wrong choices. These counts overlap different dimensions and must not be added into a count of repaired questions. The historical review's 12 invalid and 22 unrelated-page findings were narrower categories; the 49 includes other precision/background improvements. Questions remain 26 guided + 36 chapter + 18 final core + six optional challenge. Existing planning aliases such as an unpadded guided-question suffix are resolved to the actual rendered ID with an explicit superseded-planning record; actual learner response IDs are not renamed.

**Exact reproduction and verification sequence.**

```bash
npm run build:biology30-unit-a-pilot-2 -- --project biology30-unit-a-pilot-2 --gate final-academic-review --baseline-workspace-sha 219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc
npx tsx scripts/check-biology30-unit-a-academic-corrections.ts
npx tsx scripts/review-biology30-unit-a-pilot-2-academic.ts --check
npx tsx --test --test-concurrency=1 scripts/tests/biology30-unit-a-academic-corrections.test.ts scripts/tests/biology30-unit-a-academic-review.test.ts scripts/tests/biology30-unit-a-pilot-2.test.ts
npm run audit:biology30-unit-a-pilot-2:visual
E2E_STUDIO_PORT=4182 npm run test:e2e:biology30-unit-a-pilot-2
E2E_STUDIO_PORT=4182 npm run test:e2e:project -- --project biology30-unit-a-pilot-2
npm run test:biology30-unit-a-improvement-pilot
npm run test:science-comparison
npm run verify -- --project biology30-unit-a-pilot-2 --mode workspace
npm run validate:manifests
npm run build:studio
npm run course:doctor -- --project biology30-unit-a-pilot-2
npm run audit:biology30-improvement-transfer
npm run audit:biology30-improvement-transfer -- --check
npm run test:biology30-improvement-transfer
```

Use a fresh task-specific Playwright output directory on reruns so failed traces are retained. The old review checker now resolves its preserved `21363490...` source snapshot when the live candidate has changed. It verifies that historical learner/contracts/judgments and the canonical archived review match. It does not call the new candidate reviewed by rewriting the old SHA. The historical check excludes the checker's own prior self-hash because archive resolution changed its implementation; the other reviewed-source checks remain enforced. The new correction checker separately validates the live candidate and throws on edited keys, prompts, weak-feedback reversion, bad pages or unresolved targets.

The standard `npm run test:biology30-unit-a-pilot-2` command now includes the four new correction tests as well as the fourteen existing tests (18 total); operators do not have to remember an extra suite to catch a future regression. The combined explicit command above additionally runs the seven historical-review tests (25 total). Nine inherited whitespace-only generated model-panel lines remain a documented `git diff --check` warning; authored sources and metadata pass. Do not make an unnecessary cosmetic learner rebuild merely to hide that warning after exact-build inspection.

**Failure handling and manual review.** An intermediate implementation placed a compatibility helper in an unused legacy runtime; browser inspection exposed it and the emitted runtime was corrected before the final candidate. An old-answer test must inject its fixture once at document initialization: setting storage immediately before reload lets the old page's unload save overwrite the fixture. The corrected test checks original meaning, no misleading selected replacement, Process Collection, a new keyboard attempt, reload and unchanged unrelated state. The all-item test attempts all 86 keys and follows nervous/sensory/endocrine exact-page and local links. The first full browser run had 24 passes and five timeouts, four during Studio preview readiness and one during persistence-scenario navigation; those were not recorded as successful checks. The focused three-test rerun passed on the same learner SHA. Final suite outcomes and trace paths are retained in [verification](../../biology30-unit-a-pilot-2/meta/academic-corrections-verification.json), rather than guessed from a partial run.

The second complete browser run passed 27 of 29 cases; both remaining failures occurred in Studio preview-readiness before learner interaction. The project contract passed 1/1. Preserve these full-run failures even when a targeted rerun succeeds; passing every behaviour across separate runs is not the same claim as a clean complete-suite run. Do not extend timeouts, force controls or weaken assertions merely to change the result. A later platform investigation may be needed if preview initialization remains unreliable; no shared Studio behaviour was patched in this course batch.

The final two-case targeted recheck passed both unchanged tests in 57.4 seconds. Together with the prior 3/3 focused run and 27/29 broad run, all 29 distinct behaviour cases have passed on this exact learner build. Static Pilot 2 checks pass 18/18, the combined correction/historical/Pilot 2 run 25/25, Pilot 1 12/12, science comparison 6/6 and transfer 4/4; workspace, manifests, Studio build, source freshness and 148 local Markdown file links also pass. Doctor reports only intentional `not-active`. The verification record retains nonzero broad runs and makes no clean-full-suite, live-LMS, teacher-acceptance or complete-academic-clearance claim.

The exact-build visual audit produced 81 route captures, 184 interaction-state captures and 39 contact sheets. All 39 were opened and inspected, plus three full-size feedback close-ups. Twelve new feedback captures span three representative questions at desktop, tablet, mobile and 200% text size. No new feedback overlap/clipping or automated geometry finding was observed. Whole-page thumbnails are structural overview, not sentence-by-sentence reading certification. Cross-origin video/PDF panes may be blank in headless captures; this audit does not establish playback, captions, transcript correctness or illustrated parity. The uncodixfy skill preserved the existing Next Step typography, feedback panels and focus/link styling rather than introducing a new UI language; the PDF skill guided actual source-page/column inspection. No generated-image workflow was needed for this batch.

**Living record and B–D adaptation.** The existing academic-evidence ledger rule carries `correctionIteration` with baseline/current SHA, report and verification references; no extra accepted rule is fabricated. The transfer generator preserves both the historical review and current correction evidence, and all 52 combined rules remain ineligible until complete Unit A acceptance. Current recipe, source-owner map, prompt pack, Pilot 2 journal and active handoff point here. For each B/C/D unit, rebuild item-specific sources, standards levels, introduced vocabulary, keys/distractors and original saved-value semantics from that unit's own material. Reuse the bounds, compatibility, deterministic-order, feedback and exact-build verification procedures, not A's answers, letters, page offsets, source classifications or acceptance.

**Still open.** Complete fourteen local illustrated equivalents, obtain/review the remaining thirteen actual video transcripts, resolve the teacher's practical-delivery approach, and repair appropriately scoped eye/ear/gland/hormone and inquiry/communication evidence. Review final topic weighting and cognitive demand, student workload and the whole exact build with the teacher. Keep the 18 required routes, 1,505/295 minutes, 40 advanced blocks, 14 media checkpoints, 28 vocabulary families, 178 parent collection records and all unaffected learner writing intact. Pilot 1 learner files and production A–D remain protected; no deployment, commit, push, export, publication or automatic transfer occurred.

### 36. Finish the complete online candidate and close the authoring gaps — 2026-09-06

**Status and authority.** Implemented; exact-build verification is recorded separately; awaiting explicit complete-build teacher review. The user asked to finish the remaining work so the course could be cleared, then clarified “This is all online.” That confirms the delivery format; it is not deployment authorization, teacher acceptance, LMS certification or permission to alter production B–D. Earlier slice approvals remain historical. This cycle prepares one complete candidate and one final review checklist instead of imposing another slice gate.

**Baseline and recovery.** Branch `codex/studio-direct-editing-v1`, checkpoint `2ad72ec06b104c589f91e4b5afb8d86c322bc168`. The preceding `f39669f01779f98a1c8d7d3ec5fe7e1524100d9d55f0b9286c01f4de5603e865` candidate and its content/review contracts were copied once into Pilot 2's content-addressed `raw/online-finalization-baselines/<sha>/`, with a baseline manifest. Existing raw history, unrelated dirty work and deployment records were preserved. A failed transaction leaves the current candidate intact. The resulting learner SHA is `ab82b791d0bc771a522c6bd2d88c97a2f28e5ecaa0add9d69cb32a1be580c105`, tree `f9b0f45627d8deba6bc4bb72c9608c1ff3a2d0252272c8187e4f58a82444807d`. Prior academic-correction and source-review records continue to bind to their old snapshots, not these new bytes.

**Problem and inclusion decisions.** The previous source review found identification, data/inquiry and communication operations represented too loosely by route tags or recognition questions. Fourteen alleged illustrated alternatives were predominantly text. Teacher-source material contained useful but inaccurate/out-of-unit video passages. Online completion needed authentic supplied-data and observation opportunities, without pretending students physically used equipment or worked with a partner. Prior reports list overlapping aggregate and component gaps; the final map resolves each to a named online task. Zero unresolved implementation-gap records is not a student-mastery or teacher-acceptance claim.

**Source retrieval and review sequence.**

1. Recheck the Alberta Program of Studies, performance-standard columns and current subject bulletin. On September 5 the official support page still linked the 2025–2026 Biology bulletin. Keep 47 acceptable examples, five excellence examples and one local criterion distinct. Illustrative physical experiments are examples, not an automatic mandate for every physical activity.
2. Reuse the checksum-verified daily plans, PowerPoints, normalized chapter PDFs and source locators already in the intake contracts. No new decks were needed; no secure tests or teacher keys were exposed.
3. Check relevant mechanism claims against the local textbook and OpenStax Anatomy and Physiology 2e, especially nervous tissue, autonomic functions, pituitary, thyroid, adrenal and pancreatic sections. Preserve corrections rather than copying old shorthand.
4. Inspect actual English caption text for every selected video. An HTTP-200 empty body, metadata title or accessibility status is not a transcript. Browser transcript loading sometimes yielded the wrong/empty content; retry and verify the video identity and complete text before recording a hash. All fourteen full caption exports were read, including source/caption errors and unnecessary content.
5. Record source video ID, full duration, caption type, inspected-text SHA, start/end seconds, scope, findings and learner-facing focus guidance in `online-video-review.ts`. Do not save full transcripts or video files in learner assets. Captions provide textual review, not proof that every animation/frame/audio claim is correct.
6. Retrieve one real public-domain cervical spinal-cord photomicrograph from CDC PHIL item 2756, credited to Dr. Karp, Emory University (1964). Inspect the actual image: 700 × 466, SHA `742ee51f9ee2cecae29b34c1d472e25336e668e9885025113c503d6f290ede3f`. Preserve the source/rights URL and add explicit limits: no scale bar, not whole neurons, no reliable identification of every profile. An AI illustration is not substituted for real tissue evidence.

**Authored files and build boundary.** New owners under `scripts/lib/biology30-unit-a-pilot-2/` are `online-media.ts` (14 × 3-panel teaching paths), `online-studies.ts` (five identification matrices and tissue observation), `online-investigations.ts` (three complete online tasks), `online-video-review.ts` (caption/segment decisions), `render-online.ts` (static instructional HTML), `online-finalization.ts` (baseline/invariant/report guard), and `practice-academic-review.ts` (86 exact item operations). The existing renderer imports these sources; its active full-course runtime handles interaction and saving. `process-collection-content.ts` adds child-study descriptions to existing model parent records. `academic-evidence.ts` and `final-academic-audit.ts` bind operations to actual elements. The transaction owns generated HTML/metadata; never edit the generated candidate directly. The small legacy runtime and the active full runtime are separate—verify emitted code, not merely a helper's presence in the source file.

**How the media alternatives were authored.** For each checkpoint, write the objectives first, then three ordered explanations, each with a purposeful accepted figure, semantic table, graph or pathway. Add a worked question and reasoning, an exact model link and the same existing checkpoint. Reuse original media at native size with existing provenance; do not duplicate a weaker figure for the same visible purpose or paste slides. Existing ChatGPT-selected images remain accepted candidates in their earlier slots, not newly generated assets or fresh teacher approvals. All reused SVG IDs, `url(#...)` references and accessible label references receive a per-walkthrough prefix. The new panels sit in a full-width native disclosure below the two-column video area. They have adjacent text/data equivalents and no nested scroll. Forty-two panels, including sixteen new semantic tables, remain available with video requests blocked.

**Video decisions and limitations.** Use the exact focused excerpts in the authored map, rather than claiming the full videos are clean: neuron 0:00–1:38; action potential 7:21–9:25; synapse 3:15–4:28; PNS 5:42–7:14; brain 1:15–2:47; sensory input 1:26–2:16; vision 4:45–5:40; hearing 2:16–4:12; endocrine targets 3:31–4:04; anterior pituitary 0:21–1:33; posterior pituitary 0:33–1:26; thyroid 0:34–1:22; insulin/glucagon 0:50–2:02; stress introduction 0:08–0:35. Short clips illustrate part of a mechanism; complete local teaching supplies the rest. Keep notes about caption errors and avoid presenting an excluded source claim as scientific fact. Embeds keep `youtube-nocookie.com`, start/end, captions requested, no autoplay and no custom Play control. Native preview requests occur when relevant content is shown as the user requested. Direct full-video links are supplementary, not an endorsement of the full source. A stress introduction is not a substitute for the local medulla/cortex/water-salt explanation. Teacher review must assess the usefulness of these choices.

**Five saved identification/comparison tasks.** Eye: fourteen structures × structure/function. Ear: fourteen × structure/function. Gland map: seven locations. Hormone matrix: twelve hormone rows × source/release, target and effect, including epinephrine/norepinephrine together. Imbalance patterns: twenty effect rows, explicitly non-diagnostic. Use alphabetically displayed native select options with stable semantic tokens, not option order as stored meaning. One character per cell encodes a row-major selection; `_` means blank. Only allowlisted tokens survive normalization. Reveal row explanations only after every cell has an attempt; changing a selection or reloading hides the guide without erasing drafts. Echo long selected values beneath the native control so narrow select fields cannot hide the answer text. Decode tokens into full words for All My Work, Copy and Print. These tasks are optional evidence, not additional graded questions.

**Real observation task.** The myelin model offers “Observe actual nervous tissue,” enlargement with keyboard focus return, alt text, an adjacent description and a 260-character observation/limitation response. Require neither microscope possession nor a diagnosis. The guide distinguishes visible staining/shape from unsupported cellular identity. Build fetches/checksums/stages the published image; the runtime loads a local asset only. Do not call viewing a prepared micrograph microscope-operation proficiency.

**Three online investigations, retaining the original five response IDs and limits.**

- Reflex: compare supplied interrupted sensory and motor pathways, then analyse the original ruler values 18/21/19/24/20 (mean 20.4, range 6). Explicitly distinguish voluntary reaction from a spinal withdrawal reflex. Use a supplied calcium/release comparison to test a model, state a limitation and revise reasoning. Two 500-character fields remain.
- Sensory: retain the original two-point observations, add centre/periphery recognition data at four symbol sizes with an eight-of-ten threshold criterion, and use cochlear-region response data without playing tones. Identify independent/dependent/controlled variables, interpret density/field limits and compare an assistive-device tradeoff. Two 500-character fields remain.
- Endocrine: contrast a controlled low/high-ADH supplied model (10/11/9 versus 4/5/3; means 10 versus 4) before interpreting the original multi-factor A/B observation. Do not infer causation from the confounded case. Compare monitoring access/cost/waste, note an uncertainty, and revise a claim. The original 700-character field remains.

Each has procedure, supplied data, a worked response or frame and partial saving. Optional asynchronous teacher/classmate comparison is available in the task directions; independent comparison is not falsely logged as actual teamwork. No personal health measurements, bright lights, spinning, loud sound, supplies or physical partner are necessary. All remain outside required completion. If the district requires observed laboratory manipulation or collaboration, obtain that evidence separately; this software cannot certify it.

**State and collection mechanics.** Keep version 6 and storage key `biology30-unit-a-pilot-2:state:v1`. Add five compact study responses `biology30-unit-a-pilot-2:online-study:<id>:v1` and one tissue-observation field inside the existing `responses` map. No new top-level schema, duplicated collection text, written-response deletion or question-key change. At most 79 text/compact response fields can persist; the ordinary maximum-length fixture is 42,738 characters, versus 42,284 before this cycle, leaving 1,262 below the 44,000 target and 5,262 below the 48,000 guard. This estimate does not guarantee arbitrary escaping/Unicode fits; retain the last-valid save and truthful failure messages. All My Work remains 178 possible parents; a model parent includes its child study work. Filter-independent copy/print includes all saved child content.

**Practice audit and honest variance.** Read all 86 prompts, keys and feedback; give each an explicit operation and one supporting performance-example/outcome connection. Preserve separate skills-task targets and label the item link `supporting-concept-not-complete-behaviour-demonstration`. Author-coded demand is 56 recognize/explain and 30 apply/infer, not a calibrated difficulty scale. The existing final-core weighting is 6 nervous / 3 sensory / 7 endocrine including homeostasis / 2 integrated, while the original plan was 6/4/6/2. Question 10 is homeostasis. Do not reclassify it as sensory or change a preserved prompt silently. This variance is prominent in the final teacher checklist; acceptance or one versioned replacement is the remaining assessment choice. Six optional challenges do not establish diploma-exam equivalence.

**Timing, invariants and acceptance.** Preserve thirteen lessons, five review routes, eighteen required progress markers, 1,505 required and 295 optional minutes, eighty required and six challenge items, fourteen checkpoints, twenty-eight vocabulary families and forty advanced blocks. The planning audit budgets core/local reading at 150 words/minute, the full source video duration conservatively, and forty minutes for vocabulary/model/check/practice/evidence tasks. It is not timed learner research and must not be reported as observed workload. The exact-build online report verifies preserved core wording, question meaning/keys, advanced content, old response limits and five protected learner trees. Source references resolving is not pedagogical validation.

**Verification and failures worth retaining.** Use [final technical evidence](../../biology30-unit-a-pilot-2/meta/final-academic-verification.json), not a success claim copied from a previous SHA. Browser review exposed two implementation hazards: long native select labels need a wrapped textual echo; legacy `.illustrated-equivalent li` grid styling squeezed nested feedback labels into a 30-pixel column despite zero page overflow. Remove that obsolete component-wide descendant styling and verify label width, not only overflow. Update stale tests that still expect the replaced four-text-column fallback, while retaining complete panel/visual/checkpoint assertions. Detail-only screenshots hide fixed chrome during isolated element captures to avoid camera occlusion; full-page and viewport screenshots retain real chrome. Inspect every exact-build sheet plus readable detail samples; tiny route thumbnails alone are not label review.

A repeated Studio preview-startup failure had a separate measured cause: the preview inspection decorator repeatedly spliced the entire large HTML string for each node. Replace only its assembly with reversed source fragments and one join, preserving byte-for-byte inspected HTML, offsets, IDs, exclusions and ownership. A 72,001-element test fell from approximately 30.6 seconds to approximately 0.2 seconds. This bounded shared-server change was necessary for verification; it does not enable editing or redesign Studio. Record relevant regression checks, the full suite and any unrelated baseline fixture/typecheck failures honestly.

**Reproduction commands and update order.**

```bash
npm run build:biology30-unit-a-pilot-2 -- --project biology30-unit-a-pilot-2 --gate final-academic-review --baseline-workspace-sha 219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc
npm run test:biology30-unit-a-pilot-2
npm run audit:biology30-unit-a-pilot-2:visual
npm run verify -- --project biology30-unit-a-pilot-2 --mode workspace
npm run test:e2e:project -- --project biology30-unit-a-pilot-2
npm run test:e2e:biology30-unit-a-pilot-2
npm run test:biology30-unit-a-improvement-pilot
npm run test:science-comparison
npm run validate:manifests
npm run build:studio
npm run course:doctor -- --project biology30-unit-a-pilot-2
npm run audit:biology30-improvement-transfer
npm run audit:biology30-improvement-transfer -- --check
npm run test:biology30-improvement-transfer
```

Run browser suites on an isolated Studio port when another server is open. Keep browser/visual batches sequential to reduce contention. After any learner change, recompute the SHA and regenerate exact-build captures; preserve old failed runs instead of attaching their successful parts to a different build. Doctor may report only intentional `not-active`. Update current summary, journal, ledger, transfer/readiness JSON, command evidence, prompt pack and active handoff in that order; use bounded section replacement, never truncate later history.

**Transferable process and target-specific work.** The new `complete-online-investigation-and-media-paths` rule is awaiting explicit review; all 53 combined rules remain ineligible for transfer until complete Unit A acceptance. Preserve the existing ChatGPT image-selection process described earlier: accuracy checklist before style, inspect source alternatives, one full-resolution candidate, narrow scientific corrections, authoring-only side-by-side, teacher choice, provenance/rights/alt/long description, actual inline/enlarged review, removal of superseded visible duplicates. No new ChatGPT image generation was needed in this cycle.

For B, inventory reproductive/developmental models, source imagery and non-diagnostic data needs. For C, use real source-cleared microscopy, genetic crosses/pedigrees and sequence data with unit-specific reference/answer conventions. For D, build sampling/population/growth/Hardy-Weinberg datasets and calculations with explicit assumptions. For all three, resolve required scientific operations first, author their own full online alternatives, review their own video captions and item distributions, calculate their own state budget and preserve their own learner-state meanings. Implement through `scripts/lib/biology30-course/v1/` and canonical unit records, not by pasting A HTML. Once resources and Unit A acceptance exist, perform the planned complete-unit build followed by full-unit teacher review; “one pass” does not mean omitting source audit, verification, corrections or acceptance.

**Final handoff.** [One complete-build clearance checklist](../../biology30-unit-a-pilot-2/meta/final-clearance-review.md) replaces fragmented next-step suggestions. Actual teacher acceptance, topic-weighting choice, physical/collaboration requirements if any, learner workload and eventual live LMS checks remain explicit human/release decisions. No deployment, commit, push, export, promotion, Studio editing, source cleanup or B–D learner change occurred.

## Superseded and rejected approaches worth remembering

| Approach | Disposition | Reason |
| --- | --- | --- |
| Use the notes deck or slide screenshots as the lesson | `rejected` | Poor reading experience, inaccessible visual text, presentation-era instructions, and no coherent learner loop. |
| Let fuzzy neighboring titles determine synthesis placement | `rejected` | It concentrated unrelated content and did not follow outcomes. |
| Link to Google Slides or YouTube for required teaching | `rejected` | Required learning must remain local and reliable offline. |
| Change only an existing PDF iframe's page fragment | `superseded` | Chrome could retain the visibly rendered old page despite the new DOM URL. |
| Keep a source image and its redundant course redraw together | `superseded` | The duplicate treatment weakened hierarchy and added no learning value. |
| Add a custom “Play optional video” button | `superseded` | It added friction; the native preview now appears when relevant without autoplay. |
| Trust a generated scientific image because it looks polished | `rejected` | Scientific pathways, labels, anatomy, and causal relationships require explicit review. |
| Use automated geometry as the whole visual review | `rejected` | Contact sheets and actual lesson context are needed to judge hierarchy, legibility, arrows, and teaching value. |
| Put SCORM, source, pilot, or completion-policy explanations in learner copy | `rejected` | These are implementation concerns, not learner instruction. |
| Treat route-level curriculum tags as proof of complete teaching | `rejected` | A route can mention an outcome while omitting the explanation, visual, worked example, practice, or evidence students actually need. |
| Keep Pilot 2 prose extremely short to lower reading level | `superseded` | The teacher found the language clearer but too brief; readable complete sentences and scaffolded explanation replaced compressed fragments. |
| Limit the lesson vocabulary display to four terms | `superseded` | Four anchors help entry, but a complete new/used-again inventory is needed so important supporting terms are not hidden. |
| Leave videos optional with only a short text summary as fallback | `superseded; replacement awaits full teacher review` | The online candidate now has fourteen three-panel illustrated paths and reviewed focused captions. Earlier parity claims were insufficient; actual visuals and complete local teaching were authored in entry 36. |
| Reduce Model Lab to a few selectable explanation cards | `superseded` | The result was shallow and vague; thirteen lesson-linked Predict-Test-Explain-Save investigations now create meaningful evidence. |
| Force four mechanism or walkthrough steps into four columns | `superseded` | Nested components became unreadably narrow before the page overflowed; layouts now respond to their own container width. |
| Display future vocabulary as disabled buttons | `rejected` | A visible control that does nothing appears broken; future terms now open an operable locked preview and exact lesson link. |
| Treat an accepted representative slice as acceptance of the complete course | `rejected` | Slice acceptance authorizes propagation only; the full exact build requires a separate review and decision. |

## Open work and unresolved decisions

### Pilot 1

- The teacher selected ten comparison figures but has not explicitly accepted the complete integrated Pilot 1 build at workspace SHA-256 `b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee`.
- All 21 Pilot 1 ledger rules remain `awaiting-explicit-user-review` for the complete exact build.
- The Core Vocabulary Stage 1 slice was teacher-accepted. The complete Stage 2 route, all 28 families, and all 17 Word Lens mappings are Codex-verified and await explicit teacher acceptance.
- Pilot 1's review deployment is distinct from Pilot 2's site and may not contain the current Stage 2 Pilot 1 workspace. Recheck its live hash before sharing it as current evidence.
- Lesson 17 is the required capstone under Lessons > Integration and Mastery; the changed exact build still awaits teacher review.
- The Video Library contains all 35 usable reviewed Unit A source videos; the exact expanded build still awaits teacher acceptance.
- Several source plates retain unresolved embedded-image provenance and remain private-pilot release blockers until redrawn or rights-cleared.
- Raster labels are most legible through **View larger**; nearby text equivalents remain the authoritative accessible instruction.

### Pilot 2

- Advanced Bridge Gate A learner SHA-256 `3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6` was explicitly accepted on `2026-09-04` to authorize the remaining thirty-two blocks.
- Advanced Bridge Gate B learner SHA-256 `11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c` contains all forty authored blocks and is Codex-verified with `teacherDecision: null`.
- Public teacher review at `https://biology30pilot.web.app` is separately governed by Pilot 2's `meta/review-deployment.json`. That record changed concurrently with this repair cycle and was preserved. This task did not fetch, deploy or certify the hosted build; compare its live hash with the current canonical candidate before sharing it as current.
- Five rules are teacher-accepted only for the four-route Revision Gate A slice. The other 27 rules await review; all 32 need complete-course context before B–D eligibility.
- Gate B review should sample every lesson, verify all forty blocks' accessible depth and adjacency, inspect semantic evidence and exact Models and Data Lab links, and test empty, partial, and complete checklist states, synchronization, unchecking, persistence, and deep-link focus.
- The Gate B and historical Process Collection reports apply only to preserved builds. Current online evidence and a [single clearance checklist](../../biology30-unit-a-pilot-2/meta/final-clearance-review.md) cover this candidate. Review weighting, digital delivery, clip selection and workload. Public deployment and LMS certification remain separate.

### Transfer boundary

- No Pilot 1 or Pilot 2 rule has been compared against B-D through a formal per-unit gap audit.
- No B-D textbook, review-key, deck, video, source-image, vocabulary, model, or question-level feedback map has been approved for this improvement pass.
- No B-D change, promotion, export, Brightspace upload, learner publication, commit, push, or Studio-editing authorization is implied.

## Standard journal-entry template

Append future entries under the chronological journal using this structure:

```markdown
### <sequence>. <short improvement name> — <date>

**Status:** `<in-progress|implemented|Codex-verified|awaiting-teacher-review|teacher-accepted|rejected|superseded>`

**Learner-facing problem**

Describe the observed problem and where it appeared.

**Intended improvement**

State the learner outcome and what must remain unchanged.

**Materials and sources**

List exact source IDs, paths/pages/slides/relationships, checksums, rights status, and teacher decisions.

**Implementation process**

Record canonical owners, commands, data contracts, and important behavior.

**Constraints**

Record scientific, curriculum, rights, accessibility, responsive, offline, persistence, and secure-assessment boundaries.

**Evidence**

List automated tests, exact workspace/report hashes, screenshots/contact sheets, and manual checks.

**Result and unresolved concerns**

State what worked, what failed, and whether another build invalidated the evidence.

**Transfer lesson**

State the reusable principle and the separate adaptations required for Units B, C, and D.
```

## Ongoing update process

After every future Unit A improvement cycle:

1. Identify the exact pilot, route, selected element, learner state, viewport, and teacher wording. Save the annotation or screenshot path when one exists.
2. Record branch, commit, dirty-tree state, canonical learner hash, project-tree hash, review status, state version/budget, and protected-project hashes before editing.
3. Resolve source ownership. Pilot 1 is direct-authored; Pilot 2 is generated from `scripts/lib/biology30-unit-a-pilot-2/`; Units B-D are owned by `scripts/lib/biology30-course/v1/`. Never patch a generated candidate while leaving its authored owner stale.
4. Preserve the exact candidate being replaced as a content-addressed `changes-requested` baseline before a learner-facing rebuild.
5. Translate feedback into a learner-facing problem, measurable postconditions, invariants, and an explicit affected-rule list. Separate a local component fix from a shared pattern change.
6. Change the smallest coherent canonical owner and its contract. Preserve unrelated dirty-tree work and protected source/archive zones.
7. Rebuild transactionally. A failed stage must leave the prior reviewable candidate untouched.
8. Run focused static tests first, then project and specialized E2E when navigation, persistence, practice, media, models, or other learner interactions changed.
9. For any learner-HTML or visual change, generate new exact-build desktop, tablet, mobile, zoom, and meaningful-state captures. Open every contact sheet and inspect the actual lesson context.
10. Recompute learner, tree, state/report, and protected-project hashes. A prior screenshot or hosted page cannot be attached to a new hash.
11. Update the pilot-specific machine record first. For Pilot 1, update [the improvement ledger](./improvement-ledger.json) and its relevant contract. For Pilot 2, update [its journal](../../biology30-unit-a-pilot-2/meta/pilot-2-improvement-journal.md), [experimental ledger](../../biology30-unit-a-pilot-2/meta/pilot-2-improvement-ledger.json), current gate review, and affected generated contract.
12. Append a dated entry to this chronological journal and update only the relevant index. Keep Pilot 1's 21-rule transfer index separate from Pilot 2's experimental-rule index.
13. Mark replaced ideas `rejected` or `superseded`; never delete the problem, failed approach, or baseline hash that would prevent the mistake from recurring.
14. Record `teacher-accepted` only when the teacher explicitly accepts a named rule and exact learner hash. A “continue,” Gate approval, or slice approval has only the scope stated in its gate record.
15. Update [the active handoff](../../../docs/ops/ACTIVE_HANDOFF.md) with current status, source owners, evidence, risks, exact next command, and exact next file.
16. Deploy only under explicit review/release authorization. After deployment, hash the live file and inspect hosted routes, console, iframe/media behaviour, persistence where applicable, responsive layout, and overflow. Update the deployment record with the exact local/live match.
17. If no deployment occurred, say that plainly. If a previous deployment exists, state whether it is current or stale relative to the canonical hash.

Only canonical filenames without numeric suffixes are authoritative. Files such as `improvement-ledger 2.json` or `source-visual-resource-report 2.json` are not cited, promoted, or deleted by this process.

## Future B-D application process

Start this process only after the relevant Unit A rules are explicitly teacher-accepted.

### Gate 1 — Rule eligibility

- Freeze the accepted Unit A workspace hash and rule IDs.
- Separate universally reusable process rules from Unit A-specific content, pages, figures, videos, and wording.
- Refuse any rule that lacks exact evidence or has an unresolved release blocker.

### Gate 2 — Per-unit gap and materials audit

For B, C, and D separately:

- capture the current contract, workspace, and review-evidence hashes;
- compare every accepted rule with the unit's actual learner experience and builder support;
- inventory textbooks, keys, seminars, decks, videos, figures, rights, practice, and page mappings;
- classify the rule as applicable, applicable with adaptation, already satisfied, or not applicable;
- record the exact canonical owner and tests required.

### Gate 3 — Canonical implementation design

- Update the target [production contract](../../resources/biology30-production/v1/family-contract.json) and unit-specific authored records.
- Add shared builder capability only when the behavior is genuinely common.
- Keep textbook pages, answers, videos, images, safety notes, and scientific corrections unit-specific.
- Preserve lesson IDs, response IDs, practice, artifacts, required minutes, persistence, and completion unless a separately approved contract change says otherwise.

### Gate 4 — Full-unit implementation (2026-09-05 decision)

- Once intake and accepted Unit A rules are ready, build the complete target unit through [the Biology production builder](../../../scripts/lib/biology30-course/v1/build.ts).
- Complete textbook, review, video/local learning, visual, vocabulary, model, advanced, collection and persistence mappings in one coordinated implementation.
- Do not pause for an intermediate representative-slice decision. The earlier B-D slice-pause procedure is superseded by the user's full-build-then-review choice; its historical rationale remains in the journal.

### Gate 5 — Full-unit review and acceptance

- Complete the unit through its owning builder.
- Run fresh academic, source, rights, asset, accessibility, interaction, practice, persistence, E2E, and exact-build visual audits.
- Open and inspect every required contact sheet.
- Require separate explicit teacher acceptance for that unit and exact build.
- Keep promotion, Studio editing, SCORM export, Brightspace upload, publication, commit, and push as separate authorizations.

Nothing transfers automatically: not images, pages, videos, answers, source dispositions, scientific content, scores, or acceptance status.

## Verification contract for this playbook

The focused pilot test must verify that:

- this document's ledger status and current workspace SHA-256 match the ledger;
- every ledger rule ID appears exactly once in the rolling transfer index;
- every pending rule is shown as `awaiting-teacher-review` and `conditional-not-applied`;
- all local Markdown links resolve;
- all three B-D project slugs and their builder owner are identified;
- no documentation change alters the learner workspace or B-D workspaces.

Run after documentation updates:

```bash
npm run test:biology30-unit-a-improvement-pilot
npm run validate:manifests
```

Browser and E2E reruns are not required for documentation-only changes. They become required again when learner-facing content, interactions, assets, navigation, persistence, or generated candidates change.

## B/C/D restart journal

### 37. Complete B/C/D execution plan and fresh-task handoff — 2026-09-06

**Problem and intended improvement.** The long planning task was repeatedly compacting. The user wanted the complete plan and every material/process decision retained before moving to a fresh task, including the ChatGPT image process and a practical model-effort policy. A short summary alone would have lost the exact topic sequence, source discrepancies, review ranges and unresolved contract work.

**Materials and authority.** Use the [pinned intake manifest](./bcd-rebuild-intake-manifest.json). Two Brightspace ZIPs, six editable PowerPoints and seven Chapter 14–20 Daily Plans DOCX files were supplied; all fifteen originals and both existing shared ZIP copies passed SHA-256 comparison. Eight original textbook members in the system archive were read for byte-level checksums/header offsets. Six have a 128-byte wrapper, while Chapter 16 has two unwrapped parts. Earlier planning had established 399 slides, 442 media files, 82 YouTube occurrences/80 distinct IDs, 90 external hyperlink relationships and 276 textbook pages. These earlier content/count findings are retained as planning evidence; this documentation cycle did not repeat the scientific/transcript/page-by-page review or generate derivatives.

**Exact process.**

1. Read the current handoff, workflow, prompt pack, playbook and 53-rule contract. Confirm branch, HEAD, relevant source owners, dirty state and exact learner hashes.
2. Recover the latest full B/C/D `<proposed_plan>` from completed assistant output in originating task `01a049cb-5d97-7212-96b0-fd9687a5624b`; retain its sections 1–5 intact rather than relying on a compacted recollection. Do not copy hidden reasoning, raw tool logs, credentials or the entire conversation into the repository.
3. Save [the complete plan](../../../docs/plans/biology30-bcd-pilot2-rebuild.md), adding restart precedence/model policy and an explicit stage/validation queue. Distinguish settled design from still-unimplemented command interfaces and not-yet-frozen counts.
4. Stream-hash supplied files and shared archive copies without modifying Downloads. Locate the eight known textbook ZIP members, record each checksum and `%PDF-` header offset, and preserve previous page-count provenance. Save the new intake manifest; do not manually edit the older generated readiness report into a false success.
5. Save [the checkpoint](./bcd-rebuild-handoff-checkpoint.json): exact branch/commit, dirty-state fingerprint and scoped statuses, learner hashes, sorted-path/content hashes for six workspaces and three owner/contract trees, plus old document hashes. A checksum inventory is not a byte backup; use the same checkout.
6. Append the previous complete active handoff verbatim to the archive before replacing it. Link the new active handoff to the full plan and manifests, with exact next command/file, actual pending work, historical test limitations and protected boundaries.
7. Save [the next-task prompt](../../../docs/ops/biology30-bcd-next-task-prompt.md). It tells the next agent to execute the persisted plan, validate contracts before rendering, preserve source ownership and progress, and report genuine blockers instead of restarting the planning conversation.
8. Validate original-plan preservation, original-handoff archival, all canonical links and source/hash parity. Recheck protected trees and run the focused documentation/transfer/manifests gates. Record their real results in the handoff/checkpoint; do not relabel historical A E2E as newly executed.

**Newly preserved decisions.** B eight teacher lessons / twelve required routes / 1,200 required + 240 optional minutes; C eighteen / twenty-three / 2,400 + 480; D four / eight / 900 + 180. Broad topics have manageable internal parts. Keep two guided questions per named lesson; derive/freeze chapter/final/challenge counts from actual skills before rendering. Vocabulary budgets B≈30/C≈42/D≈24 are not approved inventories. Full online inquiry, illustrated media equivalence, morphology/Frayers, exact-page textbook/native guides, real evidence-producing models, unified All My Work, separate advanced checklist and safe unit-specific migration all remain required capabilities.

**Scientific and rights constraints.** The original official curriculum and actual standards columns govern science; teacher materials govern order. Do not treat A's 47 acceptable examples, five excellence examples and one local criterion as 53 acceptable requirements. Do not reuse A's counts/pages/answers/science or accept every slide/video. Retain learner-authorized textbook guidance separately from prohibited secure assessments and teacher-only quiz/test keys. Recheck current bulletin, facts, rights, captions and source locators before authoring.

**Image-process preservation.** The full plan and Phase 9 keep scientific checklist → precise prompt → one ChatGPT candidate → full-resolution inspection → narrow correction → full-resolution download → checksum/provenance → inline/enlarged inspection → provisional selection → authoring-only comparison → explicit teacher decision → duplicate removal. New B/C/D images were not generated in this cycle; tab/authentication and limits must be rechecked in the next task.

**AI and persistence constraints.** Astra High/Standard is the proposed execution setting the user asked to include. Medium is conditional on actual task configuration; Max needs explicit escalation approval. Never claim prompt wording switched the model or promise fixed weekly savings. No broad task duplication or paid API/credit-reset workaround. Save resumable stage findings so a fresh task need not reload the entire history. B/C/D state schemas are their own; preserve original payloads, migrate only equivalent meanings, retain legacy work recoverably and test escaping/Unicode within the 44,000 target/48,000 guard.

**Result and review status.** Documentation/restart preparation, not course implementation or acceptance. The user authorized provisional A use; complete A and separate B/C/D teacher decisions remain null/pending. No new accepted ledger rule was manufactured for an operational handoff. The 53-rule source register retains its existing review statuses; the new checkpoint records the separate provisional-build decision. Exact technical documentation-check results live in the active handoff and checkpoint.

**Transferable principle.** Keep the complete executable specification, source inventory, stage progress, scientific limitations and actual acceptance state in durable linked records. Fresh tasks should read these records, not reconstruct a long conversation. Preserve rejected and superseded ideas as history. For B/C/D, freeze the new unit-specific contracts and implement the owning-builder profile before rendering; never copy the generated A workspace or silently bypass missing source/skill coverage.


### 38. B/C/D execution preflight and preserved source intake — 2026-09-06

Executed the saved restart plan in the existing dirty checkout. All nine checkpoint trees, 15 supplied files, two archive copies and eight textbook members matched, with branch/HEAD unchanged. Before authoring, preserved B/C/D workspaces, full metadata, production records and all declared canonical files (including original runtime/state owners) under `projects/resources/biology30-production/v1/pilot2/baselines/2ad72ec06b104c589f91e4b5afb8d86c322bc168/`. This is an actual byte backup; it does not claim access to browser/LMS saved payloads.

The new `npm run prepare:biology30-course:resources -- --units B,C,D` command preserves supplied decks/plans once, reuses existing archive originals, extracts native media with source relationships and all plan rows/slides, and normalizes seven reading PDFs with exact original-part mappings. Packet `7783e714077e56dcb6c423d61903d577a7decc4756cb38ace124679b279fbf13` reproduces 399 slides, 442 media members, 82 video occurrences and 80 distinct IDs. Chapter 16 combines four introductory and 36 chapter pages; folios and all academic/rights decisions remain pending.

`--verify-only` writes nothing; installed packets are never merged or overwritten. A changed source, unsafe ZIP or incomplete stage fails before installation. Six tests prove unsafe/duplicate/symlink rejection, failed-stage rollback, immutable-packet tamper refusal, idempotence and source drift. Video metadata probes are distinct from captions/science review. No learner rendering or teacher acceptance was claimed. Continue into all-unit contracts before any B build; the original new-profile/state/visual queue remains open.


### 39. All-unit topic drafts, actual standards columns and safe profile refusal — 2026-09-06

Prepared canonical draft B/C/D contracts with all 30 teacher topics, 127 planned Learn parts and required route totals 12/23/8. Every one of the 399 slides, 196 historical sections and 53 transfer rules per unit has a proposed destination, and all 92 historical curriculum outcome IDs have proposed teaching-part targets. These are planning records: atomic operations, full authored content, item keys and the other pre-render gates are not yet frozen.

Re-fetched the official Program, performance standards and current 2025–2026 bulletin. Inspected all 19 B/C/D standards pages visually, then preserved 190 Acceptable and 155 Excellence examples with exact column/page positions. A column does not independently define required curriculum. Correct the coding/template-strand and tRNA anticodon language during authoring. Also inspected all seven omitted/continued deck slides: restore the skipped Punnett introduction and linkage continuation; rewrite copied examination and overclaimed DNA identity cases. Two links in Chapter 20 speaker notes complete the original 90 external-relationship count; they are preserved in a separate immutable supplement.

The build CLI previously ignored unknown flags, making the planned profile command capable of silently running the legacy renderer. It now rejects unknown profile/flags and refuses incomplete academic contracts before writes. Tests prove unchanged candidate HTML and metadata after refusal. The new renderer is still unimplemented. Resource tests 7/7, topic-contract tests 2/2 and transfer tests 4/4 pass. The production suite passes 14 tests but its three acceptance fixtures fail because historical workspace hashes were stale before edits; baseline hashes and the distinct hashing algorithm are documented in `pilot2/inherited-verification-findings.json`. Do not repair those findings by inventing exact-build or acceptance evidence.

Continue stage 1 from the canonical unit contracts and pinned sources. No A learner/owner bytes, B/C/D learner bytes, teacher decisions, deployment or release settings changed.


### 40. B/C/D atomic and source-question contracts — 2026-09-06

Reconciled the actual required Program text into 92 outcomes and 136 local operational criteria. Kept 116 illustrative examples separate from requirements and 190 Acceptable/155 Excellence performance examples in their visually reviewed columns. Authored nine supplied-data investigation contracts, with required core skills independent of optional collection work. Visually inspected all 26 assigned review pages and authored 243 native textbook guides (B84/C91/D68); corrected strand orientation, missing genetic assumptions, denominator/rate ambiguity and obsolete deterministic human-trait models explicitly. Mapped all 276 actual PDF folios. Drafted B145/C245/D93 introduced-term definitions and preserved legacy extras. Source topology tests reject missing assignments, wrong folios and skill operations placed only in optional tasks. Full prose, second answer audit, exact passage links, family/Frayer selection, timing/state contracts and rendering remain pending. No learner source or A protected owner changed.


### 41. B/C/D vocabulary, practice, timing and persistence drafts — 2026-09-06

Selected and scored 28/40/24 concept families from B145/C246/D93 introduced terms, with four anchors per teacher topic and authored models for all six fixed plus eligible choice Frayers. Derived actual practice counts B16/26/17/4, C36/63/27/6, D8/24/14/4 (guided/chapter/final/optional challenge) from retained original course questions and constructed count, diagram, cross, sequence, graph and inquiry operations. These are draft counts until second key/prerequisite/workload reviews finish. Added 46 visible textbook source corrections before attempts and reviewed all 243 exact part destinations. Required/optional allocations balance without making collection extensions required.

Implemented a separate B/C/D v3 state engine through the owning builder directory. Six targeted tests prove byte-preserved legacy backup before migration, no inherited completion claims, scoped Frayer clear/replacement, separate local/LMS SetValue/Commit status, and fail-closed corruption/overflow handling. Ordinary and Unicode maxima are B26277/C38190/D22124; the guard rejects heavy escaping and oversized combined legacy rather than truncating writing. Four independent calculation tests cover the actual numerical and molecular model operations. Browser integration, final key review and learner candidates remain pending. No Unit A learner or owner changes.

## 42. Core teaching and reading revision — 2026-09-06

All 127 declared core parts now have original explanatory prose (B34/C71/D22), with correct source/data qualifications retained. The topic-level reading estimate passes the grade-12 ceiling in all 30 topics; individual passages above that estimate remain flagged for manual review. The report excludes navigation, glossary and control text and does not establish comprehension. Original first drafts and the plain-word revision record are preserved in `pilot2/source-review/`. Six article-agreement errors introduced during simplification were corrected. Source/first-use review, figures, worked examples, checks, Advanced teaching and local walkthroughs remain required before contract freeze. No learner workspaces were rendered or changed in this stage.

Next work: complete the instructional companions, beginning with Unit B's 34 parts, then C and D; bind them to actual source and question prerequisites, review workload and media, and freeze only verified evidence.

## 43. Complete instructional companion drafts — 2026-09-06

B34/C71/D22 worked examples, stop checks and optional closed Advanced explanations are now authored in each unit's `pilot2-instruction.json`. The all-unit contract command reads their exact hashes and reports actual core/worked/Advanced word counts. Two adversarial tests pass for inventory/order, outcome ownership, empty worked operations and optional-work gating. This establishes structural completeness of the draft companions, not independent key acceptance, old-section retention, visual quality or realistic elapsed learning time. The actual core prose is shorter than the earlier provisional 300–450-word-per-part timing assumption; workload must be reassessed against explicit activities rather than padded reading time.

Next: exact first-use vocabulary and prerequisite review, source/old-section and media/figure dispositions, complete local walkthroughs and task-specific independent practice; then evidence-bound contract freeze. All learner trees remain at the baseline.

## 44. First-use targets and vocabulary corrections — 2026-09-06

Advanced 106 definition introductions (B32/C56/D18) to earlier authored required uses, keeping later full-mechanism teaching destinations. Canonical core parts now declare visible `termIntroductionIds` for the future renderer. Corrected five definitions: uterine/Fallopian tube wording, genetic versus phenotypic variation, multiple crossovers, and p²/q² notation. Original glossary extras remain historical references, not automatically learner-ready definitions. The canonical first-use audit reports 11 earlier phrase matches needing contextual review and 87 terms needing alias/plural or missing-teaching review. It deliberately does not call exact matching a semantic or rendered pass.

All-unit contract validation and the core reading ceiling still pass. Source/figure/video review, implicit prerequisites and rendered introductions remain pending. Next file: `projects/resources/biology30-production/v1/units/unit-b/pilot2-first-use-review.json`; repeat queue command: `python3 scripts/audit-biology30-first-use.py`.

## 45. Topic learning paths and B slide-text correction review — 2026-09-06

All 30 topics have observable questions, goals, prior-knowledge support, retrieval prompts, Evidence Slip criteria and ordered narration through their core worked examples. Checkpoint guides fit their existing 120/180-character response limits; narration is not yet an illustrated-equivalence pass. Three instruction tests pass, including missing/reordered frames, stale narration, omitted definition introductions, oversized response guides and skipping chapter practice.

Read all 77 B slide texts and recorded 48 specific scientific qualifications in `unit-b/pilot2-slide-dispositions.json`; every image remains separately pending. Added core explanations of outside-androgen feedback (hGH is not a steroid), qualified age-related hormone changes, menopause, neurulation and local prostaglandin action. B now has 152 introduced terms; C246/D93 remain unchanged. The source review register keeps supplemental authority URLs and claim scope. The reading ceiling and all-unit contracts still pass; science 4/4, state 6/6 and instruction 3/3 tests pass. Verify-only protection check passed again: originals, six learner workspaces and the A owner match their protected baselines.

Continue the individual C and D slide-text/visual reviews and all-source dispositions, then close alias/prerequisite, figure/media, old-section, key and workload evidence before any contract freeze. No learner rendering, teacher acceptance, Studio Edit enablement or release action occurred.

## 46. D slide-text calculations and causal qualifications — 2026-09-06

All 68 D slide texts are reviewed, with 54 specific qualification records in `unit-d/pilot2-slide-dispositions.json`. Corrected source calculations include the frog expectation 306.832… → about 307, and beaver final density 253/70 rather than 251/70. Source wording about producers creating energy, fixed climax communities, p/q as alleles, universal q² shortcuts, and sexual selection equalling all nonrandom mating is explicitly dispositioned. The gene-flow example is rewritten with fictional non-human populations rather than reducing Métis identity to genetic mixture.

Added required core sexual-selection and survivorship teaching and six definitions; D now has 99 introduced terms (B152/C246). Reading and structural contract checks still pass. Full individual C text review, all visual/media/rights review and exact rendered/source evidence remain pending. No gate was promoted.

## 47. Complete C slide-text review and source corrections

All 254 C slide texts are reviewed, completing all 399 B/C/D slide texts. C has 150 specific qualification records. Full-resolution source checks resolved the Chapter 17 slide 80 pedigree father as XᴿY (affected son 1/4 of all offspring, 1/2 of sons) and slide 96 parental/recombinant summary as some:most:most:some in its printed order. The two inspected source PNGs are retained under `pilot2/source-review/slide-audits/`; complete individual visual/media/rights review remains pending.

Added the missing B artificial-insemination/IVF distinction and C binary-fission/conjugation distinction. C already contained nuclear-transfer teaching; it was retained. Expanded optional explanations to repair the supplied stem-cell potency, telomere countdown, Dolly ageing, X-inactivation and epigenetic claims using qualified mechanisms and reviewed primary/official sources. Introduced terms now B153/C249/D99. The 30-topic reading ceiling and structural contract checks pass; instruction tests 3/3 pass. No readiness gate or teacher acceptance was promoted.

Next: finish source visual/media dispositions and exact coverage/prerequisite/key/workload reviews, then freeze hash-bound evidence before rendering. All six learner workspaces and Unit A owner remain protected; no rebuilt candidate exists yet.

## 48. Source visual survey and first ChatGPT illustration

Surveyed all 399 slide compositions and visual purposes; contact sheets and individual slide references are preserved under `pilot2/source-review/visual-survey/`. This is explicitly not full-resolution clearance of every embedded asset. Recorded additional concerns including the diploid/haploid video thumbnail, meiosis-I daughter-cell label, underspecified midpoint linkage map, mixed DNA table and evolutionary ladder illustration.

The authenticated ChatGPT browser generated one human trilaminar-disc illustration for a genuine gap identified in the old text concept map, spherical slide diagrams and small textbook implantation figure. Downloaded the original 1536×1024 PNG and inspected it at original resolution: five labels and leader endpoints, germ-layer order and amniotic/yolk-sac orientation pass the stated scientific checklist. Saved a provisional recommendation with schematic limitations; teacher decision remains null. Exact prompt, authoring-only chat URL, image hash and review are in `pilot2/source-review/image-queue.json`. No publisher artwork was uploaded. Placement, inline/enlarged testing and batch comparison remain pending.

Continue exact source/media/prerequisite/key/workload reviews and hash-bound contract freezing. Do not treat the visual survey or the single image as a complete candidate.

## 49. Model reconstruction, response capacity and applied final practice

The nine model engines now produce all 27 selected cases and enforce 51 shared model/investigation data bindings. Exact model outputs and input hashes are saved per unit in `pilot2-model-outputs.json`; graph/controls/save/browser verification remains pending. Five model tests pass. The contract reader now verifies hashes for passed review evidence and requires a frozen design digest plus unit-input receipt. Five contract tests pass, including stale evidence/input, design drift and path escape cases. Asset and renderer dependency closure still needs implementation before the freeze mechanism is complete.

Replaced 14 generic alternative-assumption challenges with specific biological changes and worked answers. Rewrote 49 final selected-response items (B14/C24/D11) into applied mechanisms, calculations and experimental comparisons with option-specific feedback and narrower teaching-part destinations. Semantic item IDs, source metadata and previous prompt/option history are retained; legacy answer equivalence remains false. Exact passage and independent key review are still pending.

All 74 constructed practice fields now fit their full model answers with at least 20% plus 20 characters of working room (minimum 240). The learning validator rejects capacity drift; one focused test passes. Ordinary all-field state maxima are now B30117/C43550/D24864, below 44000; the 48000 guard still rejects heavy escaping or combined-legacy overflow without truncation or replacing the last valid save. All six state tests pass. Unit C has only 450 characters of ordinary-target headroom, so new saved fields require a fresh budget audit.

Next: review the rewritten final items against the actual required passages, finish remaining practice/source/first-use/media/workload evidence, and complete figures before contract freeze. No learner candidate has been rendered and no gate or acceptance flag has been promoted.

## 50. Exact prerequisites, complete source inventories and resumable browser block

### Summary

The separate required-passage review now covers the 49 rewritten final selected-response items. Added missing denominator, mitochondrial-source, protein-abundance and multiple-marker support in canonical required prose. Each reviewed item records the exact paragraphs and worked-example hashes in `pilot2-practice-passage-review.json`. The route validator rejects missing or later required prerequisites. Remaining items, independent key review and rendered order are still pending.

Read all 44 daily-plan rows and recorded their exact source cells and local topic/practice destinations. All 442 embedded files remain preserved authoring references with 476 exact media relationships; none is silently cleared for learner redistribution. All 226 external package relationships are dispositioned, including 82 YouTube occurrences deduplicated to 80 candidates. No clip is learner-selected before factual/caption/segment review. Original figure replacements remain pending; inventory accounting is not a scientific/visual pass.

### Files changed

Owning `scripts/lib/biology30-course/v1/pilot2-{contract,learning-audit,models,model-audit}.ts`; model/state/content/source audit scripts and focused tests; unit B/C/D `pilot2-*.json` contracts, outputs, practice history, passage reviews, source dispositions and reading queues; `package.json`, `README.md`, the execution plan/checkpoint, this handoff and Unit A operational playbook. No learner workspace or protected A owner changed.

### Verification run

24 focused TypeScript tests and five source-disposition tests pass. All-unit draft contracts, state budget, source inventory, reading ceiling and protected-source verify-only checks pass. Repository `npm run typecheck` fails with 25 diagnostics outside the changed B/C/D files; it is not a clean typecheck pass. Exact outputs and hashes are preserved in `projects/resources/biology30-production/v1/pilot2/verification/2026-09-06-contract-stage/report.json`. No learner/browser E2E is claimed because no new learner candidate exists.

### Known risks / follow-up

The CUA browser tool reports: “The Mac is locked and automatic unlock could not unlock it.” Manual unlock was requested through the user-input tool. This blocks the required authenticated ChatGPT image workflow; no API fallback was attempted. The existing scientifically reviewed provisional germ-layer PNG is preserved. Source/archive/old-section, first-use (12 earlier exact matches and 90 unmatched phrases), remaining keys, figures, caption/local-path equivalence and workload reviews also remain unfinished. In particular, required online graph/model construction needs a usable learner operation, not multiple-choice recognition or an unsupported drawing instruction. No pre-render gate was promoted by these inventory passes.

### Source of truth

`projects/resources/biology30-production/v1/units/unit-{b,c,d}/pilot2-*.json` and `scripts/lib/biology30-course/v1/`. Intake/baselines remain immutable. Unit A is provisional; all teacher decisions remain null.

### Fragile areas / what might drift

C's full ordinary state uses 43550 characters, only 450 below the target. New saved operations require budget review. Passage hashes become stale when required text or worked examples change. Do not rerun temporary authoring scripts, which would duplicate revision history or reset corrected canonical content. The frozen-input mechanism still needs complete figure/renderer dependency closure.

### Next prompt assumptions

Resume this same dirty checkout. Keep B → C → D order and all-unit contract freeze before learner HTML. Unlocking the Mac only restores browser access; it does not imply teacher acceptance, release authority or completion of the other pending reviews. Continue with no commit/push/deploy/export/publication/Studio Edit enablement.

### Exact next command

`npm run verify:biology30-course:topic-contracts`

After manual unlock, use CUA to resume the existing authenticated ChatGPT image task; do not use a paid API or change account/model settings.

### Exact next file to open

`projects/resources/biology30-production/v1/pilot2/source-review/image-queue.json`

## 51. Browser restored; exact passage, graph and image contracts advanced (2026-09-06)

### Summary

Authenticated ChatGPT browser access is restored after the user unlocked the Mac. Two original image candidates now have full-resolution scientific reviews and an author-only source/candidate comparison page: the existing trilaminar disc and the new female reproductive tract. Both remain provisional, with teacher decisions null and learner placement untested. The intact CC BY-SA 3.0 staticd onion-root micrograph is separately recorded for Unit C observation, with attribution and limits; it does not supply the synthetic cell-count dataset.

All 63 Unit B practice items now have exact required-paragraph and worked-example review receipts (98 across B/C/D; 147 remain pending). Twenty-eight B feedback sets were made option-specific, ambiguous chromosome/hormone prompts were repaired, and three final written guides now address alternative explanations and next evidence. New receipt validation rejects question, passage, worked-example and inventory drift without claiming independent scientific acceptance.

Six required graph constructions with 39 plotted values now have source-bound contracts, readable work collection, strict save codecs and comparison logic. Draft blanks, zero, incorrect values and legacy prose remain distinct. No learner graph controls or lesson HTML exist yet. Ordinary maximum state is B 30857, C 43650, D 25224 characters; C has only 350 characters of target headroom.

A contextual vocabulary pass recorded 102 target dispositions and 16 definition moves. Nine earlier exact matches and three earlier explicit aliases are different-sense candidates; implicit prerequisites and rendered first use remain open. No pre-render gate was promoted.

### Files changed

Owning `pilot2-{passage-audit,graph-work,graph-audit}.ts`, learning/graph tests and the all-unit verifier; B/C/D graph, practice, passage, vocabulary and state contracts; Unit C observation/investigation manifest; image queue/candidates/comparison generator and author page; checkpoint, playbook, handoff and plan. Protected learner workspaces and Unit A owner remain unchanged.

### Verification run

29 focused TypeScript tests pass. Refreshed state/model audits pass. Protected-source verify-only passes. Typecheck and final draft-contract output are being refreshed; previous typecheck had 25 unrelated diagnostics. Author comparison images loaded at full natural dimensions and received a desktop visual check. This is not learner browser or LMS evidence.

### Known risks / follow-up

Complete C/D passage reviews and independent practice/textbook keys, source/old-section retention, first-use and figure/media coverage, and realistic workload. Implement graph controls and persistence only after the all-unit contracts are frozen with complete code/asset dependency closure. Then build B → C → D through the owner and complete exact-candidate academic, technical and visual evidence.

### Source of truth

`projects/resources/biology30-production/v1/units/unit-{b,c,d}/pilot2-*.json` and `scripts/lib/biology30-course/v1/`. The local comparison page is author-only. Unit A stays provisional; teacher acceptance is null.

### Fragile areas / what might drift

Canonical receipts are hash-bound. Temporary authoring writers must not be rerun because they can reset corrections or duplicate history. New code/assets still need frozen-input dependency closure. C's state budget has 350 characters of ordinary headroom.

### Next prompt assumptions

Continue this dirty checkout with the restored authenticated browser; do not ask for another unlock. No commit, push, deployment, export, publication, Studio Edit enablement or teacher-acceptance claim.

### Exact next command

`npm run verify:biology30-course:topic-contracts`

### Exact next file to open

`projects/resources/biology30-production/v1/units/unit-c/pilot2-practice-passage-review.json`


## 52. All practice required-passage receipts complete (2026-09-06)


## Summary

The saved B → C → D plan is still being executed in the original dirty checkout. Source/baseline verification passes and authenticated ChatGPT browser access is restored. All **245 practice items** now have exact required-paragraph and worked-example author reviews: B63, C132, D50. No learner lesson HTML has been rendered. All-unit freeze remains pending; author receipt integrity is not independent scientific approval.

Two ChatGPT original images have full-resolution provisional scientific reviews and an author-only comparison page. Unit C also has an unchanged CC BY-SA 3.0 onion-root micrograph with attribution and observation limits. Six required graph constructions cover 39 plotted values; source binding, draft serialization and readable collection functions are tested, while learner controls and browser integration remain pending.

## Files changed

- Owner `scripts/lib/biology30-course/v1/pilot2-{passage-audit,graph-work,graph-audit}.ts`, graph/learning tests and all-unit contract verifier. The graph audit's new Set type error was found and fixed.
- Canonical unit B/C/D practice, passage-review, graph-work, vocabulary, content, state and audit JSON. Unit C's 72 nonfinal selected-response items now have option-specific feedback; missing cross/phase assumptions, overlapping options and unsupported prerequisites were repaired with original source IDs and prior wording retained.
- Unit D required teaching now explicitly explains community scale, resource partitioning and crossed ecological comparisons. The community definition moved before its new first use. Three B, two C and three D final written guides were completed to answer their requested alternative/next-evidence operations.
- Image queue/candidates and comparison generator; C microscopy/investigation manifests; checkpoint, this handoff, archive, plan and Unit A operational playbook. Protected learner trees and Unit A owner remain unchanged.

## Verification run

29 focused TypeScript tests pass. All-unit draft contracts, state/model audits, reading ceiling and refreshed source/baseline verify-only checks pass. Typecheck fails with **25 existing diagnostics outside the changed B/C/D files**; it is not a clean repository pass. Exact outputs and input hashes: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-06-all-practice-passages/report.json`.

Ordinary maximum serialized state: **B30857 / C43830 / D25504** characters against a 44000 target. C has only **170 characters** of target headroom. Heavy JSON escaping still invokes the nontruncating last-valid-payload guard. No learner/browser/LMS E2E claim is made. The image comparison has desktop author review only.

## Known risks / follow-up

Complete the independent scientific practice keys and all 243 textbook-guide keys/prerequisites, remaining implicit vocabulary/first-use checks, old-section/archive/transfer retention, 127 required figure targets and illustrated local media equivalence, and a realistic 75-hour workload audit. The 9 earlier exact-phrase matches and 90 unmatched phrases remain a non-gating sense/alias queue. No video has been selected from the 80 candidates. Do not mark any unfinished pre-render review passed merely because inventory counts agree.

Then close renderer/asset dependencies in the freeze receipt, implement the transactional owner renderer and required graph/persistence/collection controls, and build B → C → D. Complete all exact-candidate academic, technical and visual evidence including required routes, viewports, migration and protected A regression. The browser unlock is resolved; there is no current external blocker.

## Source of truth

Restart: `docs/ops/biology30-bcd-next-task-prompt.md`. Full plan: `docs/plans/biology30-bcd-pilot2-rebuild.md`. Canonical authored inputs: `projects/resources/biology30-production/v1/units/unit-{b,c,d}/pilot2-*.json`. Owning builder: `scripts/lib/biology30-course/v1/`. Progress: `projects/resources/biology30-production/v1/pilot2/execution-checkpoint.json`. Intake and baselines are immutable. Unit A remains provisional; teacher decisions/acceptance stay null.

## Fragile areas / what might drift

Passage receipts bind exact question/key fields, required prose and full worked examples. Content edits require genuine rereview and receipt refresh. C has 170 characters of ordinary state headroom. Do not rerun temporary authoring writers: they can reset corrected text or duplicate revision histories. Current freeze dependency closure and selected image placement are incomplete. The owner `--profile pilot2` still refuses unfrozen contracts and its renderer is not implemented.

## Next prompt assumptions

Continue in `/Users/deanguedo/Documents/GitHub/canvas-helper`, branch `codex/studio-direct-editing-v1`, HEAD `2ad72ec06b104c589f91e4b5afb8d86c322bc168`, preserving the entire dirty checkout. Follow the saved AI-effort and authenticated ChatGPT image-comparison policy. No slice acceptance pauses; no commit, push, deployment, export, publication, LMS upload, Studio Edit enablement, paid API or acceptance claims.

## Exact next command

`npm run verify:biology30-course:topic-contracts`

Continue the all-unit figure inventory/source comparisons and independent academic review before freezing and rendering. The existing authenticated ChatGPT image conversation is `https://chatgpt.com/c/6a9dba2e-0dd0-83e8-b11d-3a207e258519`.

## Exact next file to open

`projects/resources/biology30-production/v1/pilot2/source-review/image-queue.json`

### 53. Textbook second-source review and image correction outcome

Read the actual assigned questions again and derive their requested operations before comparing guides. B84 now bind exact required paragraphs, full immutable PDF hashes and physical pages; 14 guides were completed and 9 optional teaching notes must precede the attempt. The new owner textbook auditor rejects content/source/target drift and incomplete reviewed/pending inventories (2 tests pass); a passing receipt is not a human independent review or rendered proof. C91/D68 remain pending. Do not rerun temporary authoring writers.

The third ChatGPT original, male anatomy, is retained only as a rejected comparison because tail-to-vas continuity was wrong. The authenticated correction request was declined by ChatGPT; no replacement or bypass was used. The source/three-candidate comparison page records the open anatomy gap and two usable provisional originals, with teacher choices null.

D68 follow-through: independent numerical recomputation retained in `unit-d/pilot2-textbook-calculations.json`, all source questions reread, source graphs rechecked, 13 incomplete guides completed and 8 optional pre-attempt background notes bound into receipts. A route-order check caught later-lesson links in B/D; those are now optional further reading, with needed extension context before attempts. B has 11 such context notes. Two textbook tests and all-unit draft contracts pass. C91 remains pending; no learner rendering or acceptance claimed.

### 54. All textbook guide reviews complete before rendering

B84/C91/D68 original questions and exact teaching passages were reread in a separate source-first pass; chromosome/graph/pedigree keys and numerical denominators were independently reconstructed. All243 receipts account for each source question. Forty-seven guides now complete omitted operations;32 optional context notes and50 source notices must be visible before the attempt. Late core links were removed from chapter prerequisites and explicitly labelled further reading. The authored textbook pre-render gate now passes, without claiming a second human reviewer, rendered focus/reveal proof or acceptance.

The correction register preserves62 source qualifications and prior changed interpretations. D arithmetic is retained separately. Thirty-one focused tests, refreshed protection and draft contracts pass; typecheck retains25 unrelated diagnostics. Evidence is in `pilot2/verification/2026-09-06-all-textbook-guides/report.json`. Required prose, saved-state capacities, six learner trees and UnitA owner remain unchanged. Continue independent practice keys, implicit first use, source/figure/media retention, workload, freeze closure and owning renderer; no count-based gate promotion.


### 55. Independent practice-operation review complete

All245 practice items now have separate prompt-first author derivations (171 selected response,74 written) and exact full-item hashes. This is a separate author pass, not a second human reviewer or formal blinded study. B's gametogenesis guide now states primary/product chromosome counts; C's final cell-observation guide now addresses visible chromosome arrangement as well as synthetic counts. Required linked prose and examples were reread for those corrections. The authored practice/key gate passes; three of13 pre-render gates now pass.

All canonical selected-response keys are index0, so a tested owner helper varies displayed option order deterministically while preserving canonical saved values and feedback mapping. Renderer integration, actual image/graph availability, prerequisite visibility and restored browser selections remain pending. Updated ordinary state maxima are B30917/C43890/D25504; C has110 characters of target headroom. Thirty-three focused tests and draft contracts pass; protection verification passes; typecheck retains25 unrelated diagnostics. Exact evidence: `pilot2/verification/2026-09-06-all-practice-keys/report.json`. Continue semantic first use, atomic teaching proof, source/figure/media/retention and workload before all-unit freeze and B→C→D rendering.


### 56. Required-text vocabulary inflections and senses

A second passage pass checked33 earlier singular/plural/alias occurrences and explicit paraphrases. Twenty-one definitions moved earlier (B6/C12/D3), including15 inflected first uses; distinct senses such as birth delivery/sperm delivery and natural selection/image selection retain contextual decisions. True-breeding now specifies self or within-line crosses. Topic new/reused inventories are synchronized and the owner rejects drift. Required paragraphs/worked examples are unchanged; source container hashes in passed reviews were refreshed only for introduction-list changes. All99 prior exact-phrase queue records have been inspected, but counts cannot close implicit/surface-wide first use. Full definition wording, figure/media/optional contexts and rendered placement remain pending; no vocabulary gate was promoted.

### 57. Atomic-operation repair and source-bound authored figures

Two new B chapter applications now require five-perspective comparisons, science/society relationships, denominator-sensitive fertility evidence and a justified revised position. The five B STS components have exact practice IDs. Both questions and required teaching passages were separately reviewed; totals are247 items (171 selected response,76 written). This repairs those identified operation gaps without claiming the full136-component audit is complete. Ordinary state maxima are B32617/C43890/D25504.

The rejected ChatGPT male candidate remains in history. Plan-authorized original SVG v3 provides a provisional labelled duct pathway; native review repaired a urethral outlet and projected crossings. It is a schematic with explicit limits, not another provider-generated image. The batch comparison now includes it. Six graph model SVGs preserve39 supplied values; the browser-safe drawing kernel uses only learner-entered points, preserves blanks/zero/gaps and exposes scale overflow. All six native desktop figures were inspected; responsive enlargement, controls and persistence are still pending. Thirty-five focused tests, draft contracts and refreshed protection pass;25 existing unrelated typecheck diagnostics remain. Exact evidence: `pilot2/verification/2026-09-06-graph-and-b-applications/report.json`. No learner candidate or new gate promotion occurred.

### 58. Nine investigation contracts reviewed

Independently reconstruct each calculation and compare the required teaching before accepting an investigation guide. All9 now have exact source/data/method receipts and36 operation-specific saved-response examples within existing field limits. D expected genotype frequencies now cover every sampled observation; C has the exact needed codon subset. Five original textbook mitosis photographs were extracted without altering pixels, inspected and matched to page labels (object order differs); uncertain phase features remain qualified and synthetic counts remain separate. Local supplied-source use does not imply public redistribution rights.

A second original SVG shows testis compartments and secretion into blood; v2 fixes label collisions. Four author image comparison sections retain both ChatGPT originals, rejected history and both provisional SVG schematics. Six required graph models(39values) are joined by one optional demographic two-point model, saved in D's existing observation field with320-character capacity. Earlier prose remains recoverable. D ordinary maximum grows to25644; B32617/C43890 remain unchanged. The authored investigation gate passes, bringing the pre-render count to4of13 perunit; learner lifecycle/academic completeness are still separate. Thirty-seven focused tests and draft contracts pass;25 existing unrelated typecheck diagnostics remain. Exact receipt: `pilot2/verification/2026-09-06-investigation-contracts/report.json`. Continue full vocabulary/atomic proof, figures/media, old-section/transfer retention and workload before freezing/rendering.

### 59. Complete introduced-definition wording pass

Read all501 full definitions. Forty-eight revisions (B26/C18/D4) correct chromosome state, pair/singular and ratio/frequency categories, mutation transmission and avoidable future jargon. The inherited one-DNA chromosome wording cannot describe a replicated chromosome; a pair is not one homologue, and a ratio is not one category's frequency. Same-text glossary synchronization also needs a meaning check: confounding/confounder, homologue/pair, probability/ratio and linkage/loci are distinct. Their correct source meanings are retained separately.

Each current introduced definition has a SHA-bound author receipt;38 focused tests and draft contracts pass, with25 existing unrelated typecheck errors. No new review gate was promoted: all-surface first use, dependency order and preserved-only glossary entries remain pending. Practice keys, required prose, state capacities and learner baselines are unchanged. Exact receipt: `pilot2/verification/2026-09-06-definition-wording/report.json`. Continue actual atomic/figure and old-section retention proof; no planning restart.

### 60. Unit B original-section retention reviewed

Read all56 original B sections against actual required prose and adjacent Advanced teaching. Restore missing endocrine blood routes, pregnancy-versus-STI prevention distinctions, regulatory/developmental detail and support/access context. The review seminar now teaches a source-separated evidence ledger with three bounded, attempt-gated model responses. Eight affected practice and15 textbook passage receipts were rereviewed after the two core expansions; their question/key text is unchanged. Barrier-method first use moves earlier. B chapter question counts now match14 each; workload realism remains pending.

The new owner retention auditor binds original section bytes to actual destination paragraphs and rejects missing targets or false implemented claims. B56 passes author retention; C96/D44 remain explicitly pending. Forty focused tests, draft contracts, reading and refreshed source/baseline verification pass;25 unrelated typecheck diagnostics remain. Pre-render gates are B5/13,C4/13,D4/13. Exact receipt: `pilot2/verification/2026-09-06-b-retention/report.json`. No learner HTML, teacher acceptance or release action. Continue C/D retention and remaining all-unit contracts.

### 61. All original-section retention comparisons complete

Read all96 C and44 D original sections against the actual mapped core/Advanced prose. C restores41 deeper companions, D17, with definitions for added terms and original quantitative examples. C’s sexual-reproduction trade-off maps to the actual mode-comparison lesson after a wrong animal-example target was caught. Retain the corrected observed-recombination-over50% qualification, distinct marker/sequence/function claims, and personal/community-data limits. D preserves original frog, herbivore and succession numbers with separate units and explicit synthetic-data limits.

C’s source-separated review seminar and D’s original North Marsh seminar now have three attempt-gated, criterion-based guides each, all within existing240-character fields. D’s242-character first draft was rejected by the capacity check and shortened; no state limit increased. C/D required paragraphs, worked examples and all practice/textbook/investigation questions/keys remain unchanged during retention. Container receipts were refreshed only for added Advanced teaching.

All196 original sections now have exact source-to-destination receipts. Each unit passes5of13 authored pre-render gates; rendered placement and the complete136-component academic/visual proof remain pending. Forty focused tests, draft contracts, required reading estimates, state maxima and refreshed source/baseline verification pass. Exact receipt: `pilot2/verification/2026-09-06-all-retention/report.json`. Continue remaining all-unit gates before owning-renderer implementation and B→C→D builds.

### 62. Ask the operation explicitly; guard the whole candidate

UnitD’s50 prior practice mappings were narrowed to actual requested sub-operations; foundation-only recognition is no longer counted as full evidence. Two chapter cases now assess intended/unintended consequences, sustainability, model predictions and supplied perspectives. Three expanded final tasks explicitly ask prediction, controlled comparison and revision; new semantic IDs preserve the old draft snapshots without claiming response equivalence. Recompute raw frequencies, means and model values before comparing guides: logistic step4 is174.68704697, rounded174.7. All five full guides fit with working room. Current totals249 items (171MC/78written); D chapter19/20 counts10/16 and ordinary state27874. Complete atomic/visual coverage remains a separate pending gate.

The old Pilot2 guard checked only index.html. It now hashes the entire workspace using the immutable intake’s path-NUL-SHA-LF format, retaining old entry hashes as historical fields. New owner transaction infrastructure stages workspace and copied metadata together, checks intervening edits and symlinks, locks competing builds, and retains recovery bytes on rollback. Five synthetic transaction tests pass; no actual course was promoted. Full renderer integration remains pending. Forty-five focused tests and draft contracts pass; protection is refreshed. Typecheck exposed an owned retention Map-key inference error, corrected with an explicit Map<string,unknown>; the rerun is in the exact receipt directory. Continue the remaining all-unit contracts and owner implementation without rendering unfrozen content. Receipt: `pilot2/verification/2026-09-06-d-operations-and-builder/report.json`.

### 63. One collection index and bounded marker storage

The owner now derives one complete activity index: B243/C396/D186 entries, covering every registered response, choice and flag exactly once. Return destinations are explicit; rendered focus targets remain pending. Collection includes uncollected drafts, canonical selected answers, wrong/zero graph values, confirmations and preserved earlier work. Copy/Print text derives from the complete index and rejects a filtered partial inventory. Required completion is independently derived for all43 routes; optional textbook, Advanced and collection work cannot satisfy it.

Compact-v2, state-v1 and all three old shell stores now have separate original-backup handling. Readable recovery preserves duplicate response pairs and unknown fields instead of collapsing them into a map. Old answers and completions are not reassigned. Unknown/corrupt or oversized combinations stop without truncation or source overwrite. Browser storage and LMS integration remain unproved.

A fingerprinted hexadecimal flag bitset frees space without reducing any writing limit. Earlier Pilot2 token arrays still decode. Marker order is semantic-set order, not click chronology; map mismatches and unused high bits reject. Ordinary maxima fall to B30391/C40269/D26164, giving C3731 characters of headroom. Any later flag-inventory change must regenerate the exact mapping identity and preserve prior compatibility explicitly; never silently reuse bit positions for a different meaning.

Fifty-two focused tests, draft contracts and protected-source verification pass;25 unrelated typecheck diagnostics remain, none in changed owner/Pilot2 files. The authored state/migration gate passes, bringing all units to6of13. Seven authored gates and full renderer/browser work remain. Receipt: `pilot2/verification/2026-09-06-state-and-collection/report.json`. A separate source-figure record preserves a reviewed native textbook placental circulation extraction; final comparison, placement and rights limits remain explicit.

### 64. Preserve glossary meanings as well as names

Read all236 preserved definitions (B58/C133/D45), including names and senses outside the501 introduced-term inventory. Twenty-seven revisions fix self-referential aliases, singular structures, the assumptions behind9:3:3:1, short-interval map units, expected versus sampled recombination, pre-mRNA and cell-cycle qualifications, and D frequency-symbol/per-individual distinctions. Source wording remains in per-entry history. The one exact-name C nondisjunction overlap keeps its provenance and a future single-display resolution; different biological senses are not silently merged.

Exact wording receipts now cover both inventories and reject missing, duplicate or stale preserved entries. Fifty-two focused tests and draft contracts pass;25 unrelated typecheck diagnostics remain, zero in changed files. Source/baseline protection passes. Derived activity entries, required teaching, practice/keys and state capacities are unchanged; only reviewed vocabulary container receipts were refreshed. All-surface first use and dependency order remain pending, so no gate was promoted: allunits6of13, zero learner candidates. Exact receipt: `pilot2/verification/2026-09-06-preserved-glossary/report.json`. Do not rerun the one-shot `/tmp/bcd-preserved-glossary-review.py` writer.

### 65. Curriculum tags must match the requested operation

Read all43 B and56 C criteria and all197 current prompts with complete correct responses. Narrow broad topic-wide tags to actual sub-operations. Five B and15 C questions supply prerequisite knowledge only; optional challenges do not count as required practice. Preserve question text, answers, response identities, writing limits and exact required-passage receipts. B/C per-item operation reviews retain exact digests and readable operation scopes; D’s52 prior mappings remain unchanged.

Seven B and11 C criteria have no current required-practice link. These are evidence queues, not permission to add18 questions automatically. Inspect the remaining required activities and repair the weakest existing item where appropriate. Current C stops/retrieval/evidence were checked for all11: several cover only a small piece, such as recognizing that monozygotic twins need not have identical traits; they do not yet establish the entire criterion. B accessory-gland location/contribution, developmental clocks/trimesters and cause-matched infertility mechanisms were reread in full core/worked/stop teaching to prepare focused repairs. No repair to these questions has been made yet.

New owner operation integrity checks reject missing roles, unknown/out-of-sync outcomes, and credit assigned to foundation-only or optional work. Fifty-three focused tests and draft contracts pass;25 unrelated typecheck diagnostics remain. No curriculum gate promoted and no learner build. Latest protection is the stage64 receipt, with no subsequent learner-tree edits. Exact receipt: `pilot2/verification/2026-09-06-bc-operation-mappings/report.json`. Do not rerun `/tmp/bcd-{b,c}-practice-mappings.py`; both one-shot writers have run.

### 66. Required B inquiry finals ask for the whole reasoning sequence

Three required finals now explicitly ask a testable prediction, controlled repeated comparison, at least two source observations/values, an alternative and revision of a supplied claim. Reread every mapped required paragraph and worked example before rewriting; the underlying teaching/data remain unchanged. Each changed prompt has a new semantic ID and its prior complete draft in revisionHistory. Full guides are470/467/479 characters within600-character fields with working room; no other writing limit was reduced. B retains65 questions and ordinary maximum state becomes30851, below44000.

Replacing draft flag IDs exposed an incorrect test assumption: packed flags preserve a semantic set, not object insertion order. The maximum-state test now normalizes only flag order while comparing every other field exactly; no runtime codec change was needed. Fifty-three focused tests and draft contracts pass; the initial failed result is retained with the corrected pass. Prior stage65 typecheck and stage64 protection receipts remain explicit, not relabelled as reruns. No learner tree changed.

B’s empty required-practice-link queue falls from7 to3: accessory glands, developmental time and cause-matched infertility approaches still need review/repair. Nonempty links remain sub-operation evidence and do not close the full curriculum gate. C retains11 such gaps. No gate, rendering or acceptance changed. Exact receipt: `pilot2/verification/2026-09-06-b-required-inquiry/report.json`. The one-shot `/tmp/bcd-b-inquiry-repairs.py` has completed successfully; do not rerun it.

### 67. Replace redundant recognition with the missing B operations

Three chapter MC items are replaced one-for-one by a labelled accessory-gland layout, a developmental-clock/sequence task and a cause-matched signalling/transport task. Keep65 total questions and28 chapter questions. New IDs preserve the old complete items; all three model responses fit550/600/500-character capacities with working room. B now has39 selected-response and26 written items; allunit totals249,168 selected-response/81 written. B ordinary maximum is32498; C40269/D26164 unchanged. The derived collection has605 responses/177 choices/801 flags across825 entries.

The supplied textbook Figure14.2 (Chapter14 physical8/printed479) confirms seminal vesicles behind the bladder. Add that one missing location to required teaching before the layout question. Reread the full gland prose, two affected existing practice questions and five textbook guides, then refresh only affected paragraph and retention receipts. Preserve differentiated secretion functions; do not import the old source’s blanket gland-pH statement. The page rendering is source evidence, not a selected/cleared learner asset.

The validator caught cross-topic material incorrectly listed as same-topic teaching; move the unchanged cleavage/gastrulation passages to prerequisites. Three older negative tests also assumed the first question was always MC. Target the actual item type and retain all corruption/missing-state assertions. Final53 focused tests, draft contracts, reading and fresh source/baseline protection pass;25 unrelated typecheck diagnostics remain. Retain initial failure logs. No curriculum gate or learner render. B/D have no empty required-practice links; C11 remain, and all full criteria still require actual teaching/figure/operation proof. Receipt: `pilot2/verification/2026-09-06-b-required-chapter/report.json`. Never rerun the completed `/tmp/bcd-b-required-chapter-repairs.py` writer.

### 68. C science-and-society tasks apply every requested dimension

Replace three redundant chapter recognition items with original fictional cases: clonal capability/conservation, conditional genetic information with five perspectives, and crop research/consequences/sustainability. All four C STS criteria now have explicitly asked operations and a supplied contrasting perspective requiring revision or justified retention. Core/worked teaching was reread and remains unchanged; new questions supply their own bounded evidence. Neither marker observations nor technology labels establish a final social/environmental verdict.

New IDs retain the prior complete questions without answer equivalence. Full model responses499/610/630 characters fit650/850/850-character fields with working room. The first draft’s600-character capacity failed its working-room check before canonical writes, so it was set to650. C retains132 questions (93MC/39written); allunits249,165MC/84written. C ordinary state rises to42616, with1384 target characters left; no existing writing limit was reduced. The activity index covers608 responses/174 choices/801 flags in825 entries.

All53 focused tests and draft contracts pass. Stage67 typecheck/protection receipts are retained explicitly; no subsequent owner-code or learner-tree changes. Seven C criteria still have empty required-practice links: cytokinesis, complete division comparison, twinning, C2 inquiry planning/revision, aligned-sequence relatedness and C3 inquiry revision. Nonempty links are still only sub-operation proof. No new curriculum gate or learner HTML. Exact receipt: `pilot2/verification/2026-09-06-c-required-sts/report.json`. Do not rerun completed `/tmp/bcd-c-required-sts-repairs.py`.

### 69. C inquiry finals now ask question, prediction and revision

Three new-ID finals require an explicit testable question/prediction, controlled repeated comparison, source evidence and response to a supplied overclaim. Keep authentic cell observations separate from synthetic counts, expected probabilities separate from observed samples, and short coding sequences separate from independently measured larger fragments. All mapped required prose/worked examples were reread. Molecular inquiry also references the already authored applications/uncertainty paragraph. No underlying teaching or dataset changed.

Full guides495/501/506 characters fit650-character fields with working room. The old complete drafts remain in revisionHistory with no response equivalence. Counts remain132 C and249 overall. C ordinary maximum43186 leaves814 target characters; any further task changes need an honest state budget without cutting complete writing. All53 tests and draft contracts pass. Stage67 typecheck/protection receipts remain explicit; no learner-tree or owner-code change. Four C components still lack required-practice links: cytokinesis, full division comparison, twinning and aligned-sequence relatedness. Full compound-criterion/figure proof remains separate. Gates stay6of13 and no learner HTML exists. Receipt: `pilot2/verification/2026-09-06-c-required-inquiry/report.json`. Never rerun completed `/tmp/bcd-c-inquiry-repairs.py`.

## 70. Required C comparisons and lossless response packing

Four one-for-one new-ID tasks explicitly compare animal/plant cytokinesis, seven division features, twin origins and aligned nuclear/mitochondrial/chloroplast sequences. Complete mapped required prose/worked examples reread; unchanged teaching. Nine synthetic difference counts checked. Full guides370/529/425/579 characters fit capacities500/700/550/750 with working room. Prior whole questions retained; no answer equivalence. C remains132 items (92MC/40written); allunits249 (164MC/85written). All136 components now have a required asked sub-operation link; complete compound-criterion and figure proof remains pending.

The expanded writing exposed an ordinary-state target overflow. The owner now uses fingerprinted ordered response text with explicit presence bits when smaller, retaining sparse/earlier pairs, exact empty/zero/Unicode/escaped text and original payloads on errors. No field was shortened. Maximum B31386/C42988/D25272; C has1012 target headroom.54 focused tests and draft contracts pass; refreshed15-source/8-textbook-member protection confirms six learner trees and protectedA owner unchanged. Typecheck retains25 unrelated diagnostics, none owned. Browser integration remains pending. Exact receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-06-c-required-comparisons/report.json`. Completed one-shot `/tmp/bcd-c-four-construction-repairs.py` and `/tmp/bcd-stage70-receipts.py` must not be rerun.

User asked again why this has taken all day. Recorded candidly: still before first learner build, actual renderer unimplemented, seven authored gates remain; preparation gate counts do not represent overall percentage. Prioritize remaining explicit build blockers and a working B candidate, retaining the saved all-unit freeze requirement. No new scope or approval request.

## 71. Owning renderer components and real browser controls

Implemented the owning topic/practice/textbook/graph renderer components and browser controllers against the authored input schemas. Synthetic fixtures render no real Biology learner lesson. All59 focused tests pass, including Chromium/Firefox/WebKit interaction proof. Required graph entries preserve blanks, zero, out-of-scale values, partial drafts and earlier prose; axes/point inputs work by keyboard. Read-only answer graphs open after attempt. Textbook context/corrections precede its explicit attempt; physical PDF pages remain distinct from printed folios. Return links open closed Advanced ancestors and focus exact controls. Image/SVG enlargement supports Escape, original size and focus return. Mobile inspection prompted larger controls and a labelled horizontal graph region to keep tick labels legible.

All-unit freeze remains mandatory before any learner HTML generation. Owner code components must exist to close transitive code/asset evidence, so implementing them before the freeze resolves that dependency without bypassing it. The owning build now checks all three frozen contracts and still refuses incomplete whole-course assembly/promotion. No actual learner candidate exists.59 tests, draft contracts, refreshed protection pass; typecheck retains25 unrelated diagnostics and none owned. Exact receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-renderer-components/report.json`. Whole-course optional pages, collection/recovery/bootstrap and transaction integration remain alongside the seven outstanding authored gates.


## 72. Study, review and reference components

Owning Models, Frayers, All My Work, investigation, seminar, practice-route, glossary, textbook-hub, Advanced-index and notes components now exist. Models preserve full-precision calculated frequencies rather than forcing the learner graph’s two-decimal input limit onto source values. All27 authored case outputs render without changing their data. Predict/scenario changes invalidate tests and collected status while preserving explanation. Frayer replacement requires explicit clearing of only that family’s four fields. Whole-collection Copy/Print includes oversized current writing even under filters; save/completion retain original bounds. Invalid graph drafts have a separate collection adapter for bootstrap wiring.

Investigation observations follow an attempted plan, the four-field overall guide stays gated, and separate quadrat/demographic datasets stay distinct. Seminar saves require all three existing responses. Textbook attempts persist but guides close on reload, correcting the earlier component behavior to the saved plan.67 focused tests pass; final six browser fixtures pass after a synthetic UTF-8 metadata fix found during native mobile screenshot inspection.25 unrelated typecheck diagnostics, zero owned.15source/8textbook-member verification and all six learner/protectedA-owner hashes pass. These are component fixtures, no whole-course candidate or project E2E claim. Exact receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-study-components/report.json`. Whole-course recovery/bootstrap, assembly, assets, seven authored gates and all-unit freeze remain.


## 73. Startup recovery, integrated session and whole-course shell

The owning startup/session now composes all controls and preserves conflicting, malformed and prior saves. A recovery choice verifies copies of all originals before changing the active local version, rejects intervening edits, retains backup collisions and leaves active work unchanged on quota failure. Ordinary current/previous saves resume without repeated choice prompts. Recovery archives remain readable in All My Work. No live LMS discovery/initialization has been added.

The pure whole-course assembler uses the shared NextStep shell, keeps teacher topics separate from required review routes, and emits exact previous/next required links without skipping chapter work. It rejects draft contracts, duplicate IDs, missing indexed controls or legacy answer/completion selectors. Textbook guides have one owning practice-page location; the hub only links to them. All77 focused tests pass, including three-browser startup and full-shell tests. Actual shell CSS exposed oversized radio controls and mobile overflow; owner-local control sizing repairs it. Save status is now in the visible main content and header progress stays compact. Native recovery/mobile/desktop synthetic screenshots inspected; final assembled-browser retest passes. Typecheck25 unrelated,0 owned; sources and protected learners/Aowner pass.

No real learner candidate exists; all-unit contracts remain6of13. Reviewed asset loader, production media/browser entry, transaction/metadata integration and all seven source/academic/figure/media/time/transfer gates remain. Do not mistake the pure assembler’s temporary videoLibraryHtml argument for media review. Exact receipt: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-session-recovery/report.json`. Next priority is actual all-unit figure bindings and remaining evidence closure, preserving the completed renderer work.


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


## Stage 96 — User-reported failure to preserve Unit A presentation and organization

The user rejected the B/C/D presentation as substantially different from final Unit A Pilot 2. Direct native-browser comparison confirms this finding. Stage95 technical passes remain historical evidence; they do not establish faithful Unit A transfer or task completion. The earlier assistant assurance based on 53 mapped rules was too broad.

Observed differences: Unit A has Start / Learn (chapter groups) / Practice & Review / Process Collection / Resources navigation; B/C/D use the generic shell's Lessons group plus a flat list. Unit A has an authored question-led overview, route explanation and chapter map; B/C/D use a plain title, outcome bullets and ordered route list. Unit A uses framed lesson sections, local typography, time labels, learning-goal/prior-knowledge panels, textbook strip, four anchor words and expandable term inventory. B/C/D use a narrow generic content column, omit the anchor/inventory opening, and render retrieval before teaching. Unit A vocabulary uses search/filter plus concept navigation and a detail pane; B uses a long stacked family page and choice dropdowns. C/D overview screenshots confirm the same replacement design.

Cause: `scripts/lib/biology30-course/v1/pilot2-render-course.ts` calls `renderNextStepCourseShell` with newly assembled flat navigation and a basic overview. `pilot2-render-topic.ts` independently defines lesson markup and minimal CSS. Final Unit A's authored presentation is in `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts` and its associated styles/renderers. Feature inventories, generic owner mappings, and technical tests did not enforce visual/organizational equivalence to that reference. Speed/usage steering did not authorize a new design.

This turn inspected and diagnosed the mismatch; no learner or owner files were changed. Preserve existing B/C/D academic inputs, assets and saved-state identities. The required correction is to adapt Unit A's actual presentation and organization into the B/C/D owning builder, including lesson sequence and vocabulary workspace, then compare representative matching surfaces directly with A and run focused behavior checks. Do not regenerate images or repeat source intake. Unit A remains protected and provisional; all publication/Edit prohibitions remain.

Exact next file: `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts` (final navigation/assembly around line1330), then B/C/D `pilot2-render-course.ts`, `pilot2-render-topic.ts`, and `pilot2-render-vocabulary.ts`. Exact next command: `sed -n '1328,1370p' scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`.


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


## Stage110 — Focused first-use and task-staging repair (2026-09-07)

The user authorized narrow repairs to the13-lesson A Pilot2 and current B/C/D. First verify current hashes: historical review snapshots are pointers, not rollback targets. Preserve prior Stage109 prompt-specific capacity repairs (18 fields) and C indexed-state compatibility; the old240-character seminar issue is already repaired.

Implemented seven A first-use explanations (channels/ions, receptive fields, refraction, osmoreceptors/ADH, growth plates, glycogen/adipose tissue, autoimmune action) and two C explanations (gene expression and reading frame). Retained existing adequate B prerequisite and C probability teaching. Eight existing B/C/D guided questions now show numbered stages, preserving original prompt context, keys, response IDs, capacities and graph controls. D's quadrat, demographic and growth-model datasets remain separate. No required work or field was added; no difficult operation was removed or made optional.

Transfer lesson: inspect meanings and intermediate steps in actual learner order; use existing teaching/practice before adding tasks. Stage a compound prompt while retaining its original saved-response meaning. Exact authorized A changes are whitelisted by passage, not a general bypass of the preservation guard. Current A2 protection has an explicit versioned successor baseline; other A learner trees remain untouched.

All four local workspace/project E2E checks pass; focused owner/state/response10/10, expanded staging3/3 and browser/package3/3 pass.18 desktop/mobile screenshots inspected. A state remains42,738 chars; C worst-case43,440/44,000 target. One stale A full-project metadata fixture and25 unrelated type errors remain. No actual human/LMS observations or full independent curricular certification. Evidence, one living repair map, before snapshots and workload inventory: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-07-instructional-repairs/`. Review candidate remains blocked.


## 2026-09-08 — Answer-feedback presentation follow-up

Teacher compared A Pilot2's revealed answer panel with B/C/D. Matched outlined check/compare button, readable feedback panel and spaced supporting reading/lesson-return links. Existing lesson reading mappings supply real local PDFs; wording says lesson reading rather than claiming item-exact evidence. Existing answer strings can already start with Correct, so do not duplicate that prefix. Routine live status is screen-reader-only; unsuccessful save notices remain visible. Current academic inputs and saved-state schemas unchanged. All249 practice link destinations validated,6 desktop/mobile answer/reload/return flows and5 focused tests pass; B/C/D workspace and project E2E pass. A remains exact. Evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-08-answer-feedback/report.json`. Existing ZIPs stale; no deployment or approval. Test computed styles against generic selector specificity, not just presence of the intended CSS rule.


## 2026-09-08 — Weave video into the explanation

Teacher clarified that A's video integration means a relevant video and watch-for cue at the point of teaching, not a pile of links/players at lesson end. B/C/D now have7/16/4 selected source-video anchors after related explanation/diagram and before worked example, with specific conceptual cues and existing illustrated alternatives. All80 original source resources remain in the library. Do not fabricate clip focus timestamps from titles or imply metadata reachability is playback/scientific verification. No extra required work or state change. Final structural5/5 and browser1/1 (6 width/unit flows) pass; B/C/D workspace/E2E pass before final cue-only wording update. A unchanged; ZIPs stale. Evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-08-woven-videos/report.json`.


## 2026-09-08 — Shared teacher showcase

User authorized a single Firebase selector and repeatable redeployment. Published A Pilot2 and B/C/D to the existing biology30pilot site with a wrapper outside course sources. Unit responses retain original storage keys; wrapper remembers each route and exposes shareable links. No SCORM changes or new academic work. Update generated units through their owners, then run `npx tsx scripts/deploy-biology30-showcase.ts --deploy`; only current workspace index/assets are copied. Local all-unit persistence/navigation test, mobile inspection, all172 live payload hashes and live all-unit switching pass. Receipt/workflow: `docs/ops/biology30-showcase-deployment.json` and `docs/ops/biology30-showcase.md`. The public review deployment is not teacher acceptance or learner release.
