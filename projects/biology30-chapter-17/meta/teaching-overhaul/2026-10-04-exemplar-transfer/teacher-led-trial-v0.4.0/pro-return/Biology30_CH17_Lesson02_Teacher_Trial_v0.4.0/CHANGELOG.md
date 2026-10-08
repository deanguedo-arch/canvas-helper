# Changelog — Biology30_CH17_Lesson02_Teacher_Trial_v0.4.0

## 0.4.0 — 5 October 2026

### Scope and comparison owner

Complete teacher-led lesson-02 teaching candidate, **Mendel’s experiments and segregation**, created under the current source ZIP’s `SCOUT_AND_PRO_TASK.md`, `USER_COMMENTS.md` and contracts. This change record compares against the newly supplied frozen teaching fragment, not against an earlier independently chosen return.

| Source binding | Value |
| --- | --- |
| Current source ZIP SHA256 | `1d98265b95190929caec7764b4b701fca5ea87e41a6ed76b116ec97e4077e209` |
| Frozen `current/lesson-02.teaching-fragment.html` | 18,590 UTF-8 bytes |
| Frozen fragment SHA256 | `0c2d3dee02b5b2413d600915a03e8c7bd72a2b03951c55f2fcd76c6c1ece4572` |
| Supplied full v0.3.0 owner SHA256 | `20c22d6d80720d04a2924c1a161b35da9ec5d964fea32d1b6c480b96c76fdcf9` |
| Supplied owner replacement interval | UTF-8 bytes `[106355, 124945)`, end exclusive |

The full owner index is not attached. Its hash and global boundary are supplied contract values; the user reports that Scout independently verified them locally. This authoring return independently verifies the attached fragment and contracts, not the absent full owner file. `INTEGRATION_MAP.json` records the complete replacement and preservation boundaries.

### Teaching changes and their purposes

1. **Opening rebuilt around the investigation’s purpose.** “A flower colour disappears, then returns” becomes “Why Mendel compared pea plants.” The learner first connects prior dominant/recessive teaching to what known parents and offspring observations can establish. The complete F2 conclusion is no longer delivered before the experiment has been set up.

2. **Concrete contrasts added with the actual pea image.** Original slide14 image25 is displayed with explicit flower-colour and seed-shape noticing guidance. The original pixels contain six pea contrasts, not a human eye. Seed-colour guidance follows yellow-left/green-right pixels rather than the caption’s word order.

3. **Starting plants and controlled parentage explained before results.** Existing true-breeding history is retained and developed; phenotype alone does not establish that history. Pollination, sperm/egg gametes, fertilisation and self-pollination are distinguished where needed. “Controlled cross” is not automatically labelled a technical testcross.

4. **Flower P/F1/F2 made visibly readable before its interpretation.** A native HTML table represents the flower-generation experiment, supported by printed588/PDF5 and flower-colour Figure17.8 on printed591/PDF8. Guidance identifies the producing parents for each generation. All rows are static and visible. The table is an authored text representation, not a claimed crop or relabelled seed image.

5. **Flower-to-seed transition made explicit before original seed visuals.** R/r, RR/Rr/rr, complete dominance and heterozygosity are defined for seed shape. Offspring-seed identity is separated from the plant carrying it. Original slide15 image14 remains a seed-shape generation diagram. The prose explains its categories, abbreviated reproduction arrows and the difference between its F1-cross description and the flower table’s self-pollination.

6. **Copying and separation retain their full instructional demand.** The account explicitly distinguishes two allele versions from four physical locus copies, copied chromosomes from homologous pairs, meiosis I from meiosis II, and separation from an additional round of copying. Meiosis is defined by its reduction function before DNA copying ahead of that process is explained. Metaphase II is explained when the displayed label becomes relevant. The plant account includes haploid spores and later mitotic stages before gametes, avoiding a direct animal-style meiosis-to-gamete shortcut. The final wording explains that mitosis separates sister chromatids after DNA copying while maintaining haploid chromosome number; it does not locate DNA copying within mitosis. Self-pollination is also explained as using the plant’s own pollen at first mention.

7. **One source chromosome pair is followed deliberately.** Original slide41 image44 remains intact, with the long pair in the left-hand arrangement selected by reading instructions. Colours are not falsely assigned to R/r or dominance. The short pair and comparison of arrangements remain later two-trait work. Image47’s crossover context is not inserted or used to claim universal sister-chromatid identity.

8. **Worked seed reasoning expanded at consequential steps.** Original slide18 image20 makes the RR × rr F1 category visible. Single-letter gametes and restoring a pair at fertilisation explain the result before phenotype mapping. Original slide20 image36 then supports all four Rr × Rr contribution pairs. Top/sperm and left/egg roles are explicitly assigned for that image; the prose does not impose that orientation on other source diagrams.

9. **Quantitative justification made visible.** Equal segregation and random fertilisation justify ½ × ½ = ¼. Four exclusive contribution pairs sum to one. A native grouping table explains 1:2:1 by genotype and 3:1 by phenotype and checks both totals. The observed 5,474:1,850 counts are converted to approximately 2.96:1 with the operation explained. Expected proportions remain distinct from exact counts or an offspring schedule.

10. **Historical and current explanatory roles kept distinct.** Mendel is described as recording offspring and inferring distinct factors. Chromosome copying and separation provide the later physical account. The opening flower observation is revisited with that account before the final reciprocal-parent application and forward connection.

11. **Practice retained for its distinct purposes.** The process-label repair remains after the mechanism and worked contribution account. The reciprocal-parent task remains after the distinction between the model prediction and observation. Neither is replaced, shortened or supplemented with a formulaic third activity. Their full prompts, tables, hints, models and criteria are retained.

### Source-selected assets

All five image files are byte-identical copies of supplied original assets. Native fragment paths use `./assets/teaching-v040/`; the Markdown uses the corresponding relative path from `manuscripts/`. No image generation, retouching, relabelling, crop or derived raster is used.

| Output asset | Original locator | SHA256 |
| --- | --- | --- |
| `assets/teaching-v040/slide-14-image25.png` | Actual slide14, `ppt/media/image25.png` | `4e5cd0ea4159932025b801e03faf3c32ea2c88efa906238f5cde4daeeca441dc` |
| `assets/teaching-v040/slide-15-image14.png` | Actual slide15, `ppt/media/image14.png` | `30b7f6873a81955cc3c8e64b93ebaf4f3c5bfd5b7366ef7064c7eca28087628d` |
| `assets/teaching-v040/slide-18-image20.png` | Actual slide18, `ppt/media/image20.png`; also used on slide24 | `013dd2769996f9e08f19ea3e86e70ea3a69ce2a1a2bfb7a6ee1ebf2023636ec6` |
| `assets/teaching-v040/slide-20-image36.png` | Actual slide20, `ppt/media/image36.png` | `b8563f6f9ed748ac3880103472762ec0e05b6fbd3f1a6d1a666cb0b9877779e7` |
| `assets/teaching-v040/slide-41-image44.png` | Actual slide41, `ppt/media/image44.png` | `7e57deedfe727416d5536605bb4327cffd16ee88cbb13c778bd5e5039f450eb8` |

`SOURCE_VISUAL_MAP.json` records full placement, caption, alt text, exact sources, reading status and omissions. Native flower-generation and genotype/phenotype grouping tables are explicitly identified as teaching text/table representations.

### Exact preservation

- Four original outer IDs remain with their native classes and edit-key attributes: `ch17-l02-teaching-01`, `ch17-l02-teaching-02`, `ch17-l02-worked`, `ch17-l02-teaching-03`.
- Both complete embedded optional-task HTML sections are byte-identical to the frozen fragment: `ch17-kinch-v020-l02-arrow-task` is 2,962 bytes, SHA256 `832a0126d0434b8068b9bb98f51a463a15e4fbf70ac59608545a258caf8998a5`; `ch17-kinch-v020-l02-cross-task` is 3,368 bytes, SHA256 `d9f059765d06ec5989aee7fb00c0a0a6c0b589d002e7a582e2532f2ecca3355b`.
- Exact response IDs remain `ch17-kinch-v020-l02-arrow-response` and `ch17-kinch-v020-l02-cross-response`. Titles, labels, five-row textareas, all note input/status/save attributes, buttons, 5000-character status copy, prompts, tables, hints, models and criteria remain intact. Their native saved-note behaviour remains optional and ungraded, outside required progress.
- Markdown retains the complete activity words and feedback and uses disabled inert controls for reading. Those disabled controls are not copied into the native teaching fragment. The fragment and supplied `OPTIONAL_NOTES.json` retain functional native attributes.
- Existing native vocabulary/Frayer connections remain in the fragment through `bio-term` buttons and native term IDs. Essential meanings are also explained in visible prose.
- Header and all guided-practice-onward bytes, assessments/options/keys/models, embedded native data, lesson05 and other routes are outside the replacement. The historical embedded DD/dd worked record is not treated as current teaching or changed to match the new copy.
- No native stylesheet, font, script, storage key, namespace, saved history, conflict/failure protection, required progress, reader, video, navigation, All My Work or print implementation is rewritten. No new assessment, save control, response field or required count is introduced.

### Status at return

The complete manuscript, native teaching fragment, selected original assets and required supporting records form a teacher-review candidate. Author self-review and actual static/source comparisons are documented separately in `CONTENT_REVIEW.md`, `PRO_AUTHORING_EVIDENCE.md` and the manifest. No automatic certification or invented independent review is implied by this changelog.

Dean’s authorization covers creating the comparison candidate. Exact-copy teacher acceptance is pending. The return does not edit a canonical course, GitHub repository, local Mac destination, prior return or running evaluation site. Codex owns local receipt, comparison assembly and technical checks. Browser/native runtime behaviour, saved-state operation, rendering and teacher acceptance have not been claimed from this authoring work. No deployment, SCORM package, release or standard promotion is performed.
