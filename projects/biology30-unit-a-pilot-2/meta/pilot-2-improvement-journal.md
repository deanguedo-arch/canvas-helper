# Biology 30 Unit A Pilot 2 improvement journal

## 2026-09-03 — Gate 1 accepted

The teacher accepted workspace SHA-256 `8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe`. The acceptance authorizes full-course production only. It does not authorize export, promotion, deployment, Studio editing, or changes to Pilot 1 or Units A-D.

## 2026-09-03 — Gate 2 full-course candidate

Pilot 2 now follows the teacher's thirteen-topic sequence: five Chapter 11 lessons, three Chapter 12 lessons, and five Chapter 13 lessons. Each lesson introduces no more than four concept families, teaches with two visual sections, places current-topic retrieval after instruction, provides exactly two guided questions, saves one Evidence Slip, and keeps deeper content in optional Advanced Learning.

The complete review path contains three twelve-item chapter practices, three saved Review Seminar sessions, eighteen required Final Practice items, and six optional Diploma Challenge items. Three investigations remain saveable in Process Collection but do not gate progress. Textbook, video, model, vocabulary, and figure resources are mapped to the new topic routes.

Exact candidate evidence is recorded in `gate-2-review.json` and `gate-2-content-audit.json`. All transfer rules remain `awaiting-explicit-user-review`; nothing has transferred to Units B-D.

## 2026-09-03 — Gate 2 changes requested and Revision Gate A

Teacher feedback changed Gate 2 SHA-256 `9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7` to `changes-requested`. That exact workspace and its content contracts are preserved under `raw/gate-2-review-baselines/`. Gate 1 remains accepted.

Revision Gate A expanded Lessons 2, 5, 11, and 13 while keeping the accepted visual direction and topic order. The exact build `3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff` passed the Codex visual, browser, state, and public-file checks. The user explicitly approved moving to Revision Gate B, so that build and its review evidence are now preserved under `raw/revision-gate-a-accepted/`.

Fourteen media checkpoints require the learner to select either the curated video or a complete local illustrated walkthrough and answer the same sense-making question. Completion records the checkpoint, never claimed watch time. Version-1 state migrates without deleting learner writing.

The atomic curriculum map binds all 25 outcomes and 53 acceptable-standard behaviours to exact teaching selectors, visuals or data, worked examples, practice items, evidence records, and source locators.

## 2026-09-03 — Revision Gate B full-course propagation

The accepted Revision Gate A pattern was applied to Lessons 1, 3, 4, 6, 7, 8, 9, 10, and 12. All thirteen lessons now contain 700–1,050 core instructional words, except Lesson 13 which retains its approved allowance up to 1,200 words. Each lesson keeps four visible anchors, the complete term disclosure, three or more Learn blocks, at least four purposeful visual or data objects, a worked example, post-instruction retrieval, two guided questions, one Evidence Slip, and required media sense-making.

The added teaching follows the daily plans and PowerPoint order. It completes neuron and glial structure, synaptic release and termination, CNS/PNS and white/grey matter relationships, receptor evidence, optical and neural vision pathways, hearing and equilibrium evidence, dynamic feedback and target-cell signalling, pituitary source-target-effect reasoning, and thyroid/calcium data interpretation.

All learner-state identifiers, required times, 18-route completion rules, Process Collection records, and non-gating Advanced Learning remain unchanged. The full candidate is bound to `revision-gate-b-review.json` and remains blocked pending exact-build Codex verification and explicit teacher acceptance. No rule or asset transfers to Units B-D automatically.

## 2026-09-03 — Navigation and Model Lab restoration

Teacher review identified two capability regressions in the Revision Gate B candidate: the desktop course-navigation collapse control had been removed, and Model Lab had been reduced to three shallow examples. The prior exact candidate `cc968289c232ebeee5db0572426ea519806da8920c44dc4a3de008597e85a261` is retained as a changes-requested baseline.

This iteration restores a persistent desktop collapse control while preserving the mobile drawer. It groups Core Vocabulary and Model Lab under Process Collection because both create learner-owned process evidence. Model Lab now contains one lesson-linked mechanism for each of the thirteen lessons. Each model presents four causal steps, two conditions to compare, explanatory feedback, an exact lesson return, and a scoped add/remove action for Process Collection. Model results remain non-gating and do not affect the eighteen-route progress contract.

Learner state advances to version 3. Existing version-1 and version-2 work migrates without loss; model selections and collection flags are added only when the learner uses the restored lab.

## 2026-09-03 — Model Lab responsive step layout

The four mechanism steps were being forced into four narrow columns. At the teacher's annotated 1117 by 902 viewport, this produced excessive wrapping and made labels and explanations look as though they did not fit. The exact pre-fix candidate `b280c64e8eb144590bce5fcb3bf984de43ae1fc9fef5dfdc0f28ba051fac4161` is retained as a changes-requested baseline.

The shared Model Lab pattern now uses two readable columns when the model reader has enough room and one column when the course sidebar, model index, tablet layout, mobile layout, or zoom leaves less space. Step copy has an explicit minimum-width boundary and cards grow with their content instead of clipping it. The same rule applies to all thirteen models without changing their science, choices, saved evidence, or completion behaviour.

## 2026-09-03 — Pilot 1 interaction depth adapted to Pilot 2

The user confirmed that Pilot 2 should keep its clearer teaching sequence while regaining the substantive graph explorers, pathway builders, data labs, and evidence cases that made Pilot 1's Model Lab useful. The exact pre-change candidate is preserved as a changes-requested Revision Gate B baseline before this iteration replaces it.

All thirteen stable lesson-model IDs remain in place. Their two-choice text reveals are expanded into three or more scientific cases. Lesson 2 now has a seven-phase membrane-voltage graph explorer. Lessons 6, 8, 11, and 13 include supplied-data graphs and complete tables. The remaining models use causal pathways or synthetic evidence cases. Every selection highlights the affected mechanism step, reveals evidence and reasoning, offers a complete static equivalent, and can be added to Process Collection.

The implementation preserves compact state by storing only one selected scenario ID per model. Graph values, pathway text, explanations, and collected summaries are derived from authored content. A scoped reset clears only that model's selection and collection flag. Model work remains optional and does not change the eighteen required routes, required time, practice totals, or learner completion.

## 2026-09-03 — Models and Data Lab guided-investigation cycle

The user found that Model Lab did not explain what learners were doing, what they were supposed to learn, or why the activity mattered. The exact pre-change candidate `2ea73014993b01e6cd64b0000d1c59d21d03ff3ed4c5af4617f009599babc3ae` is preserved as a changes-requested Revision Gate B baseline.

The learner-facing name is now Models and Data Lab. Every one of the thirteen lesson-linked models states an investigation question, learning purpose, changed variable, controlled comparison, and evidence focus. Learners choose a case, write a prediction before a result can be revealed, test the prediction, examine the graph, pathway, or evidence, write an explanation, and save the complete record to Process Collection. The result and explanation remain optional course evidence and do not affect required-route completion.

State advances to version 4. Version-1 through version-3 records migrate without deleting learner work. Response and practice records use deterministic hashed storage keys while retaining their public stable IDs, creating enough state headroom for thirteen predictions and thirteen explanations. Reset remains scoped to one investigation.

## 2026-09-04 — Responsive illustrated walkthrough steps

The four-step local illustrated equivalents were still using four narrow columns inside the side-by-side media section. At the teacher's annotated 1265 by 902 viewport, headings and explanations wrapped into thin vertical strips even though the page itself did not technically overflow. The exact pre-change candidate `e5398f56cdba93f5c57e681d6c21b6b4a5c19bd75985ce63babe6d6cde0a3916` is preserved as a changes-requested Revision Gate B baseline.

The shared illustrated-walkthrough pattern now responds to the width of its own media stage. It uses two readable columns when space permits and one vertical sequence when the lesson sidebar, expanded navigation, mobile layout, or text zoom leaves less room. Each step's number, heading, and explanation have explicit minimum-width and wrapping boundaries. The same correction applies to all fourteen required media checkpoints without changing their content, completion, persistence, or local-fallback behaviour.

## 2026-09-04 — Operable future-vocabulary previews

The Learned so far filter visually leaked future-term buttons because the shared button display rule overrode the hidden attribute. Those future buttons were also disabled, so selecting a visible term such as Regulated variable and set point produced a focus outline but left the reader on the previous concept. The exact pre-fix candidate `b6eaba5b1f543a62e8971a55b36e5705df01e0f14adc7eaddafcd81989da0e8f` is preserved as a changes-requested Revision Gate B baseline.

Learned so far now hides future terms correctly. All term names keeps future concepts available for orientation: selecting one opens a concise locked preview that names the teaching lesson and links directly to it. Full meaning, morphology, mechanism, retrieval, and Frayer controls remain hidden until the learner begins that lesson. The selected future term and all existing learner work persist without changing completion.

## 2026-09-04 — Optional textbook review inside practice routes

The user requested Pilot 1's textbook-review pattern inside Pilot 2's three Chapter Practice routes and Final Practice. The exact pre-change candidate `24e18ca81a7bf33a0182825be95472fa2a3f6ac55b779f90f14855e25ee9c66c` is preserved as a changes-requested Revision Gate B baseline.

Each chapter route now places its printed-page assignment, exact local PDF links, and attempt-gated native answer guide immediately before the twelve course questions. Final Practice places Unit A — Textbook Unit 5 Review after the synthesis figure and before the eighteen core questions, explains the textbook numbering difference, and uses the corrected printed pp. 468–471 locator. The four guides contain 20, 30, 19, and 51 reviewed answers.

Learner state advances to version 5. Only four allowlisted attempt flags are added. A saved attempt survives reload, but the long guide reopens collapsed. Textbook work remains extra review and cannot change required practice, score, route completion, progress, or the 1,505 required and 295 optional minute contracts.

## 2026-09-04 — Pilot 1 to Pilot 2 Advanced Learning Bridge, Gate A

Pilot 2 successfully lowered the reading barrier, but its thirteen short lesson-end Advanced Learning disclosures did not provide a traceable bridge to Pilot 1's deeper curricular reasoning. The user approved a forty-block architecture with one optional block directly after every Learn section. The exact pre-bridge candidate `912a213fd62e503b99d9c42f28b1094f8a4f4e31d9772513013adbc02ef4707e` is preserved as a changes-requested baseline.

Gate A rendered eight representative blocks: myelin damage, action-potential graph analysis, synaptic summation, brain evidence localization, visual-processing limits, feedback troubleshooting, ADH source-versus-target failure, and integrated water/salt stress. Each block used accessible prose, semantic evidence, an exact Models and Data Lab link, and a synchronized self-completion checkbox. Learner state advanced to version 6 with a compact forty-flag bitset while required progress remained unchanged.

After exact-build static, browser, state, accessibility, and visual verification, the project owner explicitly accepted Gate A at learner SHA-256 `3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6` and authorized the remaining thirty-two blocks. That exact candidate and its review records are preserved under `raw/advanced-bridge-gate-a-accepted/`.

## 2026-09-04 — Pilot 1 to Pilot 2 Advanced Learning Bridge, Gate B

The remaining thirty-two authored blocks now complete the forty-block bridge. Every core Learn section has one adjacent optional extension of approximately 180 to 300 words, a semantic graph, table, pathway, or worked case, and an exact Models and Data Lab link. Advanced means deeper curricular reasoning in accessible language, not harder writing.

All forty items are available from the synchronized Process Collection checklist. Deep links open the exact lesson and block; checkboxes share one compact, allowlisted state. The lesson blocks still total 245 optional minutes. Together with the 20-minute Review Seminar extension and 30-minute Diploma Challenge, Pilot 2 remains exactly 295 optional minutes and 1,505 required minutes.

The 470-record Pilot 1 difference audit remains complete, and no source section is silently dropped. The exact learner candidate is SHA-256 `11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c`, with workspace-tree SHA-256 `5ea60d70eb152639be5644965c98c566349a64ff924310016f23cf531094feef`. Static tests passed 11/11, the specialized browser suite passed 22/22, the project E2E contract passed 1/1, and the exact-build visual audit produced 30 contact sheets with zero geometry findings; every sheet was opened and inspected. State remains at 39,061 worst-case characters. Gate B is Codex-verified but remains blocked until explicit teacher acceptance. Nothing transfers automatically to Units B-D.

## 2026-09-05 — Process Collection toolbar fit

Teacher review at 1117×902 identified uneven alignment where Copy and Print wrapped inside a third column beside the filters. The authored renderer now places two equal-width filters above a full-width actions row. At 400 pixels of available toolbar width, the controls stack. This responds to the actual space remaining beside the sidebar. Candidate SHA: `219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc`. Targeted browser inspection covers 1440, 1117, 1024, 800, and 390 pixel widths plus 200% zoom. The prior full visual audit remains evidence for the preceding build only.

## 2026-09-04 — Unified Process Collection index and truthful saves

The Process Collection presentation was rebuilt as one structured **All My Work** index derived from existing state. Its authored registry covers 178 possible records across retrieval, Evidence Slips, practice, media checkpoints, Frayer models, Models and Data Lab, investigations, Review Seminar, textbook-review confirmations, and the learner-created note. Only work that a learner has actually started or saved appears. Chapter and activity filters change the view without changing evidence state, while copy and print use the complete structured collection.

Each record has an allowlisted exact return link in the form `#<route>/work/<work-id>`. The link opens its route and any containing disclosure, restores the relevant vocabulary or model selection, scrolls to the source, and moves focus to the exact heading. The three investigation editors and one process note remain below the index under **Continue your work**.

Saving now reports local and LMS outcomes independently. Learners see **Saved to course**, **Saved on this device**, **Saved on this device only**, or **Not saved—copy your work before leaving** according to the destinations that actually succeeded. State remains version 6 and no new learner-state field was added. The Advanced Bridge Gate B review remains anchored to its verified baseline SHA `11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c` with its teacher decision unresolved. This new candidate is separately bound to SHA `219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc` and awaits explicit review.
