# Final bounded source-map and teaching-sequence review

## Scope and final reviewed versions

Reviewer: separate assistant task `l05_source_review`. This review compared the source records with the original-source reads documented in `source_preparation.md` and with the complete candidate read documented in `source_candidate_review.md`. It did not edit learner prose, source files or protected native contracts.

|Final reviewed record|Bytes|SHA256|
|---|---:|---|
|`SOURCE_VISUAL_MAP.json`|81,991|`1fa5b74f1f67ffffd0375d4435a3f7cddb6f974c332b3adb6cac8e21281eee6a`|
|`TEACHING_SEQUENCE.md`|15,892|`35ef4331f226041136f8aa0223e09b5c3792322473b14e87d39dd25814aec46b`|

Initial source-map snapshot reviewed before correction: 74,445 bytes, SHA256 `f8aff18794faa83c5e4a488a68938c936b08f9dfdb2b599a28895d3c3ad4b8d8`. The three metadata findings below were reported to the author, corrected in the source map, and rechecked against actual final record bytes and the unchanged learner fragment.

**Disposition: no consequential source-record finding remains open in the final reviewed versions.** This is a bounded source/metadata review, not native-runtime testing, external science-specialist review, teacher acceptance or release approval.

## Findings and verified repairs

|Finding in initial map|Why it mattered|Final repair verified|
|---|---|---|
|Native branch locator named nonexistent `course-data.labelingTasks[1]`.|The locked answers could not be retrieved through that field name in the attached owner.|Now names `course-data.labelDiagrams[1], id ch17-two-trait-label, answers`. Directly parsed attached course-data confirms that exact index/ID and A→AB, B→Ab, C→aB, D→ab.|
|All tables inside frozen optional sections were labelled as hidden hint/model context, including two prompt tables.|Tables9 and14 are visible information for the attempts; only table10 is inside the voluntary model disclosure.|Table9 “The one change to the tomato cross” and table14 “A breeding record with incomplete parental genotypes” are now visible-before-attempt with `frozenOptionalHintModelContext:false`. Table10 “Complete comparison for RrTt × rrtt” alone is marked inside voluntary model details. All three correctly retain `withinFrozenOptionalTask:true`.|
|Optional table entries reused the whole frozen section's placement/hash without naming that scope.|A table-specific record could be misread as giving the table's own exact bytes, and the two different changed-parent tables appeared to share the same interval.|All14 table entries now distinguish `placementScope` for the containing element from exact `tablePlacement`. Each table's start/end bytes and hash independently match the actual `<table>…</table>` bytes. The whole optional-section ranges/hashes remain accurately labelled.|

The visibility descriptions are statements about the supplied static HTML structure and its existing `details` elements. They are not claims of observed browser rendering or runtime state. An independent HTML-parser pass confirmed the details ancestry: thirteen tables are outside a details element, and only the changed-parent model table is inside one.

## Source and locator checks

The six PNG image dimensions independently match their file headers: 325×349, 655×311, 558×207, 823×377, 982×437 and1000×707 in map order. The native SVG specifies1400×900 with its matching viewBox. The original PPT slide numbers, relationship IDs and media members agree with the earlier direct original-deck OOXML review. All six selected image hashes and the native SVG hash agree with the actual attached source files.

The map's directions agree with observed pixels: tall/short plants, green-left/yellow-right pod inset; left tall/green and right short/yellow P parents; TG/tg repetitions; F2 ovals versus rectangles and pod-colour outlines; long-pair orientation held while the short pair changes; bottom native branch location letters distinguished from allele symbols. The original source image decisions accurately identify excluded genotype/gamete banners, the small tomato arrow aid, the broad three-laws map, crossover-context image47 and the two video thumbnails. No excluded thumbnail is represented as verified playback.

The precise textbook locations agree with the supplied PDF: independent assortment begins at the bottom of printed591/PDF8 and resumes in the main prose on593/PDF10. Investigation17.A occupies592/PDF9 and continues at the top of593/PDF10. Chromosome context is on596–597/PDF13–14, including Figure17.14. The optional deferral is correctly located at595/PDF12 questions13,15 and16. The source record does not turn the physical investigation into a learner assignment.

The table locators correctly associate pea rules/grids with slides35–41 and Figure17.10; tomato parent translation with slide43, gametes with44 and original full table/proportions with45; squash inference with46 and forward grid/expected-count problem with47. The new inclusive tomato union is explicitly identified as a new worked interpretation of the verified original cross, rather than falsely attributed to teacher slide text. Frozen tasks are correctly located in the current `OPTIONAL_NOTES.json` complete-section contracts.

All seven figure-placement ranges/hashes and all24 teaching-component heading ranges/hashes independently match the unchanged proposed fragment. All14 exact table ranges/hashes match. Every one of the76 source payload size/hash entries in the map matches the corresponding actual extracted file. The source ZIP and separately attached lead-review file were also rehashed directly and match the map's declared byte counts/hashes. This last check confirms the map's attached-file claims; it does not assert independent access to any external Mac file.

## Teaching sequence and scientific qualification

The sequence preserves the actual teacher progression: question and concrete contrasts; P notation/parental contributions; F1 reproduction and F2 observation; chromosome orientation; weighted gametes; offspring/phenotype grouping; original tomato four-by-two method; changed-parent activity; squash evidence before prediction; expected counts; evidence-limit activity; conclusion and model boundaries. Its descriptions are consistent with the actual complete candidate previously read. The independent lead sequence remains identified as preparation, not acceptance of the new manuscript.

The sequence's prerequisite citations to the original native gene/allele/genotype/phenotype and homozygous/heterozygous/notation passages are present in the attached native material. Named corrected-reference headings for breeding history, copied loci, chromosome separations and equal contribution pairs are actual headings in the attached reference. The record distinguishes the current native source from historical embedded builders and does not claim an exact new Chapter11-fragment read or a completed Chapter19 calibration.

The source cautions are faithfully recorded: redundant slide37 labels do not establish distinct types; slide39 ratio is already visible; slide41 orientation belongs to metaphaseI while the middle image stage is MetaphaseII; image47 includes recombinant colour segments; same-locus underscores are restricted appropriately;9:3:3:1 has stated parent/model assumptions; squash phenotypes are fruit, and40/20 are expectations among80 scored offspring. The learner copy's homologous-pair, sister-chromatid and plant-spore distinctions are not contradicted by the source map.

## Evidence attribution and limitations

The map appropriately distinguishes attached-source verification from external provenance: it records563 protection-ledger records,49 records with attached counterparts across20 distinct files, and514 external records not independently read here. The all563 external/local verification is explicitly attributed to the user's report of Codex's work. This review does not independently verify those external file contents or Mac paths.

The map's `actualPixelsViewedByAuthor:true` entries attribute direct reads to the root author. The root author confirmed that all13 original image assets were directly viewed during preparation before compaction. Independently, this separate source-review task viewed all13 original images and recorded that observation in its own source-preparation evidence. These are distinct evidence sources. This review does not transform another assistant's reads into proof of a root UI action; it confirms the source identities and reports the author's own read attestation separately.

No model-selector UI, Codex local receipt, native browser rendering, runtime operation, save/history behaviour, native assembly, teacher decision or external acceptance was observed in this review. No new connections or unrelated source access occurred.

Learner bytes remain the exact previously reviewed candidate:

- HTML: SHA256 `b29e83ae44ba3fd44b1f6e52a359ece8eb4933b3ee018b8964fdda5b85c97d21`.
- Markdown: SHA256 `67a75c62d2fe43cd3877d6bfd9940d6558bf6cdbee35a2d266b024a102fbdb9c`.

Machine-readable bounded comparison results are saved in `source_map_review_evidence.json`. The author remains responsible for final package consistency after any later metadata changes; this record applies to the exact hashes at its start.
