# Independent assistant assembled-reading review — source-teaching trial v0.2.0

This is a bounded independent assistant reading and static content comparison for the new lesson02 and lesson05 candidate. It is separate from the author's assembly self-check, source/science review, native integration review, and Dean's decision. Both teaching manuscripts were read in full, including every table, task stimulus, response preview, hint, comparison model, feedback paragraph, and criterion. Both separate protected-source Markdown appendices were also read in full to assess the boundary and adjoining assessment context. The actual expanded fragment and teacher-reading content was compared against the previously reviewed input at every visible token, including mathematical symbols and table entries. No browser, viewport rendering, native runtime, saving, reloading, All My Work, or print operation was used.

The assembled teaching copy retains the reviewed teaching and all four new activities. No missing learner wording, lost mathematical operation, omitted table cell, truncated hint/model, or new explanatory defect was found in this scope. This result does **not** clear the separate unresolved tomato source-fidelity/protected-response conflict. The review copy's current notice explicitly preserves that decision boundary.

## Exact read and comparison pins

| Role | Relative path | Bytes | SHA256 |
|---|---|---:|---|
| Reviewed lesson02 input | `kinch-trial-v0.2.0/authoring/lesson-02.teaching.html.in` | 17,871 | `c5712fcf6e33e732a3985593bdbea867749f2cfcaa38000c6a8290ee498af2af` |
| Reviewed lesson05 input | `kinch-trial-v0.2.0/authoring/lesson-05.teaching.html.in` | 30,601 | `eac351c08ef28c82b936cf1baa206dbfb5f14feef65338d3e196d3c5aa0f6b4e` |
| Lesson02 expanded fragment | `output/Biology30_CH17_Source_Teaching_Trial_v0.2.0/integration-text/lesson-02.teaching-fragment.html.txt` | 18,591 | `a843cc369e041e244a5cc775907979d36b906b78b2fc3b39ed26a0757d395c00` |
| Lesson05 expanded fragment | `output/Biology30_CH17_Source_Teaching_Trial_v0.2.0/integration-text/lesson-05.teaching-fragment.html.txt` | 31,651 | `4439240ef48d2b38d50bf3e624769c03e9a79a9641d7fd25386d0d5ec4799cb8` |
| Lesson02 complete teaching Markdown | `output/Biology30_CH17_Source_Teaching_Trial_v0.2.0/manuscripts/lesson-02.md` | 15,070 | `60df96e6b1b6bc459e477774441d5568c9e31e541d43c7d51cc30f122dfdb320` |
| Lesson05 complete teaching Markdown | `output/Biology30_CH17_Source_Teaching_Trial_v0.2.0/manuscripts/lesson-05.md` | 26,936 | `4b6a990549930e35ad396a61ebe7a7a0be81e83d8086e7a01f1153503b7bd255` |
| Complete inert teacher reading | `output/Biology30_CH17_Source_Teaching_Trial_v0.2.0/Biology30_CH17_Source_Teaching_Trial_Teacher_Review_v0.2.0.html` | 1,290,101 | `ffe57a4224e16286a52f98099720cc4f9b0e8310d93b940c06e514b507a4737c` |

The teacher-reading pin includes the added administrative notice that the tomato conflict remains unresolved. The earlier assembled HTML pin beginning `75a56c1f` preceded that notice; it is not presented as the final reviewed file. All lesson input, fragment, and Markdown pins remain unchanged.

The independent comparison evidence is `ASSEMBLED_STATIC_CONTENT_CHECK.json`, produced by the reviewer's separate `check_assembled_reading.py`. This helper does not import, execute, or edit the assembler. It reads only candidate and supplied-source files and writes only this reviewer's analysis directory. Its tokenizer normalizes HTML/Markdown representation and whitespace while preserving ordered words, numerical values, notation, mathematical signs, fractions, and punctuation. Its word-token counts use a different definition from the assembler's word count and are not a revised manuscript-length claim. No length or practice-count threshold was used as a teaching-quality criterion.

## What was retained and read

| Comparison | Lesson02 | Lesson05 |
|---|---|---|
| Final reviewed input after vocabulary/native-figure expansion → fragment: all visible tokens in order | Identical | Identical |
| Fragment plus native title → teacher-reading article: all visible tokens in order | Identical | Identical |
| Fragment plus native title → Markdown parsed independently with Pandoc: all visible tokens in order | Identical | Identical |
| Tables, including stimulus and complete model tables | All 3 retained | All 9 retained |
| In-place response previews | Both retained | Both retained |
| Optional hint and separate complete model/criteria disclosures | All 4 retained | All 4 retained |
| New task text, including response labels/status and complete feedback → reading article | Identical | Identical |

These are whole-sequence checks, not isolated keyword matches. The reading continues to distinguish the input prose from the separate protected-source appendix. The appendix Markdown and the corresponding HTML source sections have identical visible-token sequences for each route. That comparison verifies the two reading representations agree; it is not a new claim that this reviewer independently re-audited every native source record or original scientific key.

The read lesson02 retains the purple/white entry and the explicit move to round/wrinkled R/r, the definitions and chromosome contribution account, P/F1/F2 relationships, the small F2 grid, segregation versus fertilisation, and the minimum chance/observed-count explanation. The corrected first-use probability and autosomal definitions remain visible before they are needed. Its process-label repair asks for the movement as well as the corrected names. The reciprocal-parent task follows the contribution rule into an explanatory claim about the receiving plant. Its arithmetic remains a scaffolded use of the already worked RR × rr cross; assembly has not made it a mathematically new cross or an independent mastery test.

The read lesson05 retains the TTGG × ttgg → TtGg → TtGg × TtGg progression, chromosome-pair orientation before the grid, all 16 pea-grid entries and four phenotype groups, and the distinct multiplication/addition explanations. The native branch figure paragraph now explicitly separates the large allele circles from the small A/B/C/D location labels and uses the bottom key to identify Ab at location B. The exact source figure markup, including native figure ID, path, alt text, caption and toolbar wording, occurs unchanged in the supplied native index before reading-copy adaptation.

The altered tomato worked cross still derives four versus two distinct gamete lists from RrTt × RRTt, completes all eight combinations, keeps six genotype groups separate from the two possible phenotype groups, and explains both zero yellow categories. The changed-parent task retains the RRtt replacement, four-by-one comparison and complete model. The final feedback correctly distinguishes redundant Rt columns from the biologically impossible retained RT column. The squash section retains both inverse parental inferences from the observed wwdd offspring before its forward two-by-two calculation and expected counts. The new evidence task still leaves the second parent's leaf locus unresolved until an informative lobed offspring is observed, with the finite smooth-only limitation fully explained. Its solution does not require a posterior-probability method that the learner has not been taught.

The cases therefore retain the distinct teaching jobs identified in the explanatory review: source pattern and mechanism, systematic combination, adapting only the changed part of a model, and distinguishing forced from still-possible parental alleles. The assembled format does not add repeated practice boxes or silently replace those functions with a quota.

## Response and comparison presentation

| Task ID | Response ID | Function retained |
|---|---|---|
| `ch17-kinch-v020-l02-arrow-task` | `ch17-kinch-v020-l02-arrow-response` | Repair two process labels and their causal explanation |
| `ch17-kinch-v020-l02-cross-task` | `ch17-kinch-v020-l02-cross-response` | Test a receiving-parent claim using reciprocal gamete contributions |
| `ch17-kinch-v020-l05-change-task` | `ch17-kinch-v020-l05-change-response` | Recalculate only the changed parent's contributions and resulting predictions |
| `ch17-kinch-v020-l05-evidence-task` | `ch17-kinch-v020-l05-evidence-response` | Infer what an observed child forces and what remains possible |

Each current fragment has a labelled textarea, matching `data-note-input` and `data-save-note` response IDs, matching status target, the visible Save response label, and a separate intentional hint and comparison. Each complete task stimulus precedes its response area. All four status bindings match the response IDs rather than the status DOM IDs. No new task has a required-progress or automatic model-unlock attribute in this copy. These are static markup observations; they do not prove the native runtime will execute the proposed note bindings correctly after integration.

In the teacher-reading HTML all four textareas and all four Save response buttons are explicitly disabled. The administrative notice correctly says they are interface previews and that this document cannot save, reload, or connect to All My Work. It also explains that opening comparisons is voluntary, not technically save-gated. All eight new hint/model disclosures are initially closed and all their complete contents remain in the document. The Markdown makes those comparison contents directly readable as headings, which is appropriate for a teacher manuscript; it is not a claim that this Markdown is a working learner interface.

The essential reasoning is in the visible teaching before each task. Hints offer support, and hidden models perform answer comparison rather than supplying an unstated prerequisite needed for a fair first attempt. The independent explanatory memos describe the finer limits of task freshness and source overlap; this assembled review does not strengthen those claims.

## Assets and inertness

The teacher reading has exactly two embedded images: the native two-trait SVG in the teaching and the original labeling PNG in the protected-source appendix. Each embedded byte stream is identical to its copied review asset and to the supplied native asset. SVG XML parses; it contains no script element. The PNG signature, all chunk CRCs, and image-data decompression succeed. These checks establish file integrity and data readability, not visual rendering.

| Existing asset path | SHA256 | Static result |
|---|---|---|
| `assets/figures/ch17-two-trait.svg` | `6fdb301a963b4da131f8fe50624611fc0ff091c62e0ac99d6602019c2830c316` | Same 5,623 bytes in native, copied asset, and embedded reading image |
| `assets/labeling/ch17-two-trait-label.png` | `bc5115f43f636f2e35e1a9df5bcc303272ac464a4e7cb4cb27ed9538ea18c27a` | Same 852,180 bytes in native, copied asset, and embedded reading image |

The reading contains no script, stylesheet, style element, iframe, form, inline event handler, or JavaScript URL. All actual buttons are disabled previews. There are no duplicate DOM IDs. Ordinary details disclosures remain in the markup. No course runtime or new storage code is present. Images retain their original dimensions (SVG 1400 × 900; PNG 1448 × 1086). Because no browser or viewport rendering was performed, this review makes no claim about screen overflow, mobile sizing, visual polish, keyboard interaction, or print layout.

## Remaining decision boundaries

1. **Tomato source fidelity and protected-response proximity remain unresolved.** The adapted RrTt × RRTt example changes the original phenotype outcomes while retaining the four-by-two method and staying near the protected RrTt/rrTt writing template. Arithmetic completeness and clear teaching do not settle whether this is an acceptable source-faithful adaptation. The current administrative notice correctly labels it a completed candidate for decision, not cleared teaching copy.
2. The pea 9:3:3:1 explanation necessarily teaches structure used by the protected two-locus check. No assessment-blind independence is claimed. The separate appendix exposes original answers for teacher review; it is not part of the proposed replacement teaching or a new learner assessment.
3. Native saving, reloading, All My Work, title registration, character-limit handling, storage conflicts/failures, printing, and progress behaviour are untested here. Proposed compatible attributes and disabled previews are not functional acceptance.
4. The review covers only lessons02 and05. It does not integrate them, revise another course lesson, approve metadata, package a runtime, deploy, release, certify Brightspace, or promote a teaching standard.
5. Author self-review and this independent assistant review are separate evidence. External specialist review and Dean/teacher acceptance remain pending.

No learner, source, assembler, map, prior-return, or native course file was changed by this reviewer. Current detailed explanatory findings remain in `LESSON02_EXPLANATORY_REVIEW.md` and `LESSON05_EXPLANATORY_REVIEW.md`; their read records and preserved snapshots document the full initial reads and exact subsequent deltas.
