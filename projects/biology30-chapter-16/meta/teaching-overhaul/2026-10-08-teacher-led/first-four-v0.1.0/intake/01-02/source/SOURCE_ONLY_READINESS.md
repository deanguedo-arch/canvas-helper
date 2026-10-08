# Chapter 16 source-only preflight

Status: first-pair sources available, with explicit preservation and teaching dependencies. Completed 8 October 2026. This is an intake/readiness record, not a new teaching candidate, learner pass, science certification, teacher acceptance, integration or runtime pass. No native course file was changed.

## Exact source and ownership

The current resolved native source is `unpacked/chapter-16`, from Library `libfile_5e84f8738e9081918fa58ce86ae1551e`, Biology30_Chapter16_Complete_Handoff.zip. Archive SHA256: `7d9f75046e9b5328cd5a342e90c59eb2c505700a77277b455e098fa2cd939411`. ZIP CRC passes for all 219 members; all 218 entries in its SHA256SUMS.txt match.

The separate Library portable HTML (`libfile_92ddcfe962408191882a799d3f0384a6`) is byte-identical to the archive portable: SHA256 `1146248344960257fae9efd26efab7a2987627f0c57610a67633566324e5b4fc`. It is derived output, not the editing authority.

The original teacher deck is **Unit C Chapter 16 Notes.pptx**, Library `libfile_f58ba22635608191819b3109f35f9303`, 79 slides, SHA256 `a7af5a3b552995d835261eb490c56aa4d05dc26b31ab0afd7993184deb611061`. Its 453 ZIP members pass CRC and its hash matches the handoff inventory. Direct text/notes/relationship extraction covers all 79 slides; substantive text and rendered-pixel review is bounded to slides 1–19.

The source textbook `workspace/assets/textbook/chapter-16.pdf` has 36 pages, printed 548–583, SHA256 `6f109455a9a5aa8d9ee03bc6b224baf68b973675f0b62b1eec0aa294de48d526`. All 36 pages exactly match whitespace-normalized extracted text from the original full textbook in UnitC, printed-page offset +18. Direct text and pixel review for this preflight covers printed 550–556 and 561. This comparison does not independently certify all later-page figures.

Source supplements were recovered and hashes match the native source inventory: UnitC.zip (`8b4ad2b48215ed2638e81a67f6e68731601c8fd5ed21ef14e455f746b0021ea8`), All daily plan.zip (`8d4a3fe57e938ab45318ce2b140055559f87fc36553ce34839ef0ca52a615f10`) and Biology30_Chapter14_Exact_Template_Handoff.zip (`904db6f6e58c4d68689c611e2b6f2e3f5b020f48d6db55d366b934dbcf396a58`). Their CRCs pass. UnitC's nested D2L archive also passes CRC for 1,078 members. Original CH16 quiz XML and relevant source assessment images are retained under `evidence/original-sources`.

The README defines `workspace/index.html` as the current teaching/shell/navigation owner, `authoring/course-config.json` as reviewed task-data owner, and `authoring/textbook-question-manifest.json` as original textbook-task/crop/context owner. `lesson-content.json` and initial builders are provenance and must not overwrite native HTML. Both stylesheets exactly match the referenced CH14 template hashes. The embedded course-data JSON equals the config owner.

## Frozen rules and protected inventory

`Course_Production_Standards_v04_frozen.txt` is the supplied 65,442-byte v0.4, SHA256 `db8a04bcd7620d9ecf64ec6dc86c046cb3075b9b09cc51dac41936c391379e1e`. Apply the applicable D01–D08, U01–U15 and B01–B05 gates. CH17 remains a method reference; exact-copy acceptance is limited to its 06–07 subset, not transferred to CH16.

Actual native inventory: 25 course pages; 12 teaching routes and one review; 13 required checks; 30 required selections; 26 required writings; 24 guided selections; 48 words; 6 labeling diagrams/23 targets; 98 textbook tasks; 24 source MC, 48 foundation MC, 12 authored application MC; 285 source-catalogue records. Native HTML contains 10 teaching figures plus one assessment figure. All 152 linked local asset references resolve after stripping URL fragments. This does not claim all catalogue-only images are student assets: two first-pair original stimulus images were deliberately excluded by recorded adaptations and are now retained separately as original evidence.

All later routes and complete file hashes are inventoried in `evidence/native-routes.json`, `base-route-hashes.json` and `base-file-hashes.json`; later teaching was not fully reviewed. Preserve all original routes, IDs, prompts, options, keys, givens, figures, feedback, vocabulary/Frayer state, reader/map fields, optional/required progress and interaction ownership.

Exact raw route hashes:
- lesson-01: `15004bf28c2c88dae38d9cb06bcdc5158688f7dbb9a4468989de2e8aea46b564` (22,857 bytes)
- lesson-02: `a9320366e29761a79aa22a605b5f7cedd06cbb2deddc0cd931bf037ad04440f4` (17,846 bytes)

## First pair: complete source windows and dependencies

Lesson 01's advertised pp.550–551 omit the direct source for much of its task: chromosome sets, polyploidy, homologues and karyotypes are on pp.552–553. Teacher day39 assigns slides1–12 and textbook552–553 #5,7–12 plus555 section16.1 #4. Read pp.550–555 for the pair's complete explanation and optional tasks; preserve current reader fields and document this source-map discrepancy separately.

Lesson 02 uses slides13–19 and pp.551–555. Its native optional task map additionally includes p.556 #15–16, so that page was reviewed too. Teacher day40 also assigns p.552 #6 (native mapped to lesson03) and p.561 section16.2 #5 on cancer (native mapped to lessons05/04/06). These are mapping differences, not authorization to move or remove protected tasks.

`evidence/pair-protected-tasks-full.json` includes the complete first-pair checks, guided work, 8 vocabulary records, 12 source/foundation MC, 8 typed items, 2 authored application items, 1 sequence, 1 multiple-select set, videos, 22 distinct textbook questions, the coffee written response and all 5 relevant original quiz records/dispositions. Raw route files retain every native nested prompt and note. `pair-original-quiz-items.json` preserves their exact original XML items.

Specific authoring dependencies:
- Explain sister chromatids before lesson01's required comparison and multiple-select. Native lesson01 mainly exposes the definition through a collapsed stop-and-think answer and later lesson02; this is a teaching dependency, not a fresh learner verdict.
- The chromosome glossary's short meaning says “A DNA molecule…” while its importantDistinction correctly separates an unreplicated one-DNA chromosome from a replicated two-sister chromosome. Preserve the protected vocabulary record; make the distinction explicit in visible teaching.
- Teach n,2n,4n,8n and tetraploid/octoploid meanings for the coffee task. The original image orders 2n,8n,4n and its historical six-digit key is 228844. Its prose lists diploid,tetraploid,octoploid. The native adaptation saves an explanation rather than grading that six-digit string. Bind each value to its label (2n=22;4n=44;8n=88), preserve prompt/image/key identities, and do not silently reorder a historical answer.
- The existing karyotype is a complete crop of p.553 Fig16.4 with 22 autosome pairs and an XX pair. Use size, centromere location and banding patterns together to identify homologues. Do not infer all sequence variants, every condition or a person's identity from chromosome count or this simplified example. Retain the native caveat that X and Y share some corresponding regions but are not matching chromosomes throughout.
- Native lesson02 has no teaching figure. An exact, inspected original supplement is `evidence/source-cell-cycle-fig16-5.png` with provenance JSON: printed553 Fig16.5, crop [264,552,568,744] PDF points, SHA256 `6fd0a6d9595bf8bc9fa7b994cdddb1ffa6fe8e3e400a93d6d0ab930c6cffea68`. It is an unmodified source crop, not a redraw. Its G1/S/G2/interphase/division labels and caption are present. Explain phase order and nuclear-versus-cytoplasmic division; wedge size is schematic, not a universal timing measurement.
- Historical wording on p.552 Fig16.2 calls joined sisters a “chromosome pair”; p.554 also calls sister chromatids “two identical chromosomes.” Teacher16 explicitly cautions that the condensed before/after drawing is illustrative. Preserve source scans while teaching the existing corrected chromosome-count distinction.

## Pixel finding that must stay visible

All 22 first-pair question crops were visually inspected alongside their full source pages. The question crop for `ch16-p555-section-16-1-q4` clips part(c), **XX and XY**. The complete p.555 supporting page is present and readable, so the source is available. Keep every a/b/c prompt in the learner/reviewer packet by retaining full-page context or an explicitly supplemental complete crop. Do not certify that narrow crop alone as complete. Some other crops include a sliver of a neighboring question; their own prompts remain readable.

## Remaining limits

The Library writing block Pasted markdown (2).md (`libfile_3aaae60bf59481919f1f7cb1eec28387`) resolves but read returns no readable content; its historical generation brief could not be independently reconstructed. The current native ownership record, teacher deck, daily plans, textbook and protected first-pair tasks are available. No source-transfer denial occurred. Current official outcome-code mapping, videos/playback, the later chapter's full scientific/figure review, fresh learner attempts, candidate review, teacher acceptance and runtime/LMS work remain separate gates.

The earlier `original-section-text-comparison.json` is an unsuccessful comparison against a two-page section worksheet, not evidence that the textbook differs. `original-full-textbook-comparison.json` is the correct full-source comparison and matches all36 pages.

This task stops at source readiness. No teaching replacement, generated image, course build, launch, integration, saved-state mutation or publication was performed.
