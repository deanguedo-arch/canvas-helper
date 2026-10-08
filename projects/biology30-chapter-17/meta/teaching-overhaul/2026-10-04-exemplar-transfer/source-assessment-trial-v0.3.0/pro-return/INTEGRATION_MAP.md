# Native integration map — v0.3.0 proposal

Owner archive member: `native-v020/index.html`. Owner SHA256: `bc42ea52d8cf5709c0ec33c914e86450f93971f3e3144cb81b695593aa0eff3b`.

This return proposes ten disjoint content replacements against the uploaded integrated baseline. It does not apply them or supply a whole rewritten native index. Every byte interval is zero-based UTF-8, with an inclusive start and exclusive end.

A future integrator must verify the complete original owner SHA256 and every before hash before editing. Apply all replacements in descending original-byte start order, or stream unchanged original slices and replacement bytes in ascending order. Do not recalculate later original offsets from partially changed content.

The complete teaching fragments are reference/reconstruction artifacts only. Applying them together with the narrow edits would overlap the same teaching. Header proposals, native-style proposals and version proposals are empty for this candidate. Native note titles/controls, figure hooks, runtime, CSS/fonts, storage namespace and unrelated data remain protected.

Same required IDs now carry changed semantics. The authorized later integration must use a fresh versioned isolated origin with no migrated old saved state. No native UI pass or teacher acceptance is claimed.

## Disjoint content edits

### 1. ch17-l02-check-writing-1.html

| Field | Value |
|---|---|
| Kind | `question-html` |
| Original UTF-8 interval | `[130865, 132393)` |
| Before bytes / SHA256 | 1528 / `05b99f3d122bf8b20223240768319337b440998e5eee34fa1c3a8f8fddd3e844` |
| Replacement bytes / SHA256 | 2893 / `0250f402b5fa6a5f65c9657b198369ae3dbd1873a08f794c163ca08f70b5e3ad` |
| Replacement payload | [integration-text/assessment-html/ch17-l02-check-writing-1.html.txt](integration-text/assessment-html/ch17-l02-check-writing-1.html.txt) |
| Exact delivered raw-before | [raw-before/integrated-v020/questions/ch17-l02-check-writing-1.html.txt](raw-before/integrated-v020/questions/ch17-l02-check-writing-1.html.txt) |

Apply persistent-allele and segregation reasoning to a before/after DNA-copy representation.

### 2. lesson-05.tomato-core

| Field | Value |
|---|---|
| Kind | `teaching-child-sequence` |
| Original UTF-8 interval | `[195148, 200094)` |
| Before bytes / SHA256 | 4946 / `5e72ac37b5a94f21e6d026487c42be7dc55bd4b28b606fd57c2534c373f7edb9` |
| Replacement bytes / SHA256 | 5130 / `17a9cd16afb399d1897ba90c0be35b2f8b775093054d2ff5b9e214d7145b8c9c` |
| Replacement payload | [integration-text/teaching-edits/lesson-05.tomato-core.html.txt](integration-text/teaching-edits/lesson-05.tomato-core.html.txt) |
| Exact delivered raw-before | [raw-before/integrated-v020/lesson-05/tomato-core.html.txt](raw-before/integrated-v020/lesson-05/tomato-core.html.txt) |

Restore actual Kinch43–45 RrTt × rrTt, contrasting parental colours, four-versus-two gametes, six genotypes and four nonzero phenotype groups; retain all surrounding source teaching.

### 3. lesson-05.change-task

| Field | Value |
|---|---|
| Kind | `optional-task` |
| Original UTF-8 interval | `[200094, 204007)` |
| Before bytes / SHA256 | 3913 / `541be9540ef4b88a6961d5a528f0e4c9a69f3ef60dcd3f166fb049f1c71aeceb` |
| Replacement bytes / SHA256 | 4203 / `a218d13653a95a59da2d56004ea889124992ee3903e2b0749c8f7df78c7a16cf` |
| Replacement payload | [integration-text/teaching-edits/lesson-05.change-task.html.txt](integration-text/teaching-edits/lesson-05.change-task.html.txt) |
| Exact delivered raw-before | [raw-before/integrated-v020/lesson-05/change-task.html.txt](raw-before/integrated-v020/lesson-05/change-task.html.txt) |

Make the existing optional activity consistently change rrTt to rrtt from the restored baseline, with complete4×1 calculation, height/colour comparison and exact native note controls.

### 4. ch17-l05-check-mc-2.html

| Field | Value |
|---|---|
| Kind | `question-html` |
| Original UTF-8 interval | `[221723, 222873)` |
| Before bytes / SHA256 | 1150 / `35015e8877690bf8f43586136bab35c2609f5594bc5f687e8f22dc3d60cb97ae` |
| Replacement bytes / SHA256 | 1547 / `b6c7799412c019fed19fe9ec0ae49fd37fb9c247713354a3b512a5d88b723efb` |
| Replacement payload | [integration-text/assessment-html/ch17-l05-check-mc-2.html.txt](integration-text/assessment-html/ch17-l05-check-mc-2.html.txt) |
| Exact delivered raw-before | [raw-before/integrated-v020/questions/ch17-l05-check-mc-2.html.txt](raw-before/integrated-v020/questions/ch17-l05-check-mc-2.html.txt) |

Choose the probability of a newly defined set of outcomes for one offspring.

### 5. ch17-l05-check-writing-1.html

| Field | Value |
|---|---|
| Kind | `question-html` |
| Original UTF-8 interval | `[223076, 224552)` |
| Before bytes / SHA256 | 1476 / `847596093539629d0001685de7c26d51859ab4209c9b98dfe556276c21b5cb1e` |
| Replacement bytes / SHA256 | 3071 / `38aed68ffcd1102959217d95cc974aa020d25d8dc5e7b317d82eb1e2782ebe7f` |
| Replacement payload | [integration-text/assessment-html/ch17-l05-check-writing-1.html.txt](integration-text/assessment-html/ch17-l05-check-writing-1.html.txt) |
| Exact delivered raw-before | [raw-before/integrated-v020/questions/ch17-l05-check-writing-1.html.txt](raw-before/integrated-v020/questions/ch17-l05-check-writing-1.html.txt) |

Check a gamete-table representation for exhaustiveness and correct weighting.

### 6. ch17-l05-check-writing-2.html

| Field | Value |
|---|---|
| Kind | `question-html` |
| Original UTF-8 interval | `[224552, 225988)` |
| Before bytes / SHA256 | 1436 / `e17b2971640c6ab6f81b09da2f993078efe5913b1b22df0b049dea5d22067457` |
| Replacement bytes / SHA256 | 3135 / `49c3804388d3c25dd80b3a0366a0e28f048d7c06f6b16a8f59719c02493cf21a` |
| Replacement payload | [integration-text/assessment-html/ch17-l05-check-writing-2.html.txt](integration-text/assessment-html/ch17-l05-check-writing-2.html.txt) |
| Exact delivered raw-before | [raw-before/integrated-v020/questions/ch17-l05-check-writing-2.html.txt](raw-before/integrated-v020/questions/ch17-l05-check-writing-2.html.txt) |

Calculate a genotype-status event and evaluate an inappropriate phenotype shortcut.

### 7. ch17-l02-check-writing-1.json-item

| Field | Value |
|---|---|
| Kind | `question-json-item` |
| Original UTF-8 interval | `[3155226, 3155873)` |
| Before bytes / SHA256 | 647 / `68ce219e2a96eddea903284408e089c3c5bd4a41689d492f4ee32273bb470dfa` |
| Replacement bytes / SHA256 | 2040 / `746380cf22eee10bb1acf82e246352f1dc2e425927ad4f83676d36026e25b0d5` |
| Replacement payload | [integration-text/assessment-json/ch17-l02-check-writing-1.json](integration-text/assessment-json/ch17-l02-check-writing-1.json) |
| Exact delivered raw-before | [raw-before/integrated-v020/questions/ch17-l02-check-writing-1.json.txt](raw-before/integrated-v020/questions/ch17-l02-check-writing-1.json.txt) |

Apply persistent-allele and segregation reasoning to a before/after DNA-copy representation.

### 8. ch17-l05-check-mc-2.json-item

| Field | Value |
|---|---|
| Kind | `question-json-item` |
| Original UTF-8 interval | `[3161891, 3162219)` |
| Before bytes / SHA256 | 328 / `1202627167362c8e8c520b343c9e441ec3fce39d6b20865acd7a04ff9693ebc9` |
| Replacement bytes / SHA256 | 1374 / `1d0d2b8c11e7790ba449f06acca670ad26ebc91f544d1976856e4793fb5c298b` |
| Replacement payload | [integration-text/assessment-json/ch17-l05-check-mc-2.json](integration-text/assessment-json/ch17-l05-check-mc-2.json) |
| Exact delivered raw-before | [raw-before/integrated-v020/questions/ch17-l05-check-mc-2.json.txt](raw-before/integrated-v020/questions/ch17-l05-check-mc-2.json.txt) |

Choose the probability of a newly defined set of outcomes for one offspring.

### 9. ch17-l05-check-writing-1.json-item

| Field | Value |
|---|---|
| Kind | `question-json-item` |
| Original UTF-8 interval | `[3162234, 3162829)` |
| Before bytes / SHA256 | 595 / `ce350aedac4355f10d7769103a837a7588986f332a3412025a7553f370d6d312` |
| Replacement bytes / SHA256 | 2218 / `69c5823eea0ca6ff8576821d7921b425c6f74cd5caac6c8abecaee7970503684` |
| Replacement payload | [integration-text/assessment-json/ch17-l05-check-writing-1.json](integration-text/assessment-json/ch17-l05-check-writing-1.json) |
| Exact delivered raw-before | [raw-before/integrated-v020/questions/ch17-l05-check-writing-1.json.txt](raw-before/integrated-v020/questions/ch17-l05-check-writing-1.json.txt) |

Check a gamete-table representation for exhaustiveness and correct weighting.

### 10. ch17-l05-check-writing-2.json-item

| Field | Value |
|---|---|
| Kind | `question-json-item` |
| Original UTF-8 interval | `[3162831, 3163386)` |
| Before bytes / SHA256 | 555 / `e00e4effe0cf71b92d9ea30770e59d90c1845f09a95d8ab7f3d716c088ac9853` |
| Replacement bytes / SHA256 | 2282 / `4a1006653299a24ddd914be11f676653c393d1e80888bc3c56f0a44681840a0f` |
| Replacement payload | [integration-text/assessment-json/ch17-l05-check-writing-2.json](integration-text/assessment-json/ch17-l05-check-writing-2.json) |
| Exact delivered raw-before | [raw-before/integrated-v020/questions/ch17-l05-check-writing-2.json.txt](raw-before/integrated-v020/questions/ch17-l05-check-writing-2.json.txt) |

Calculate a genotype-status event and evaluate an inappropriate phenotype shortcut.

## Complete teaching references

| Route | Reference-only fragment | SHA256 |
|---|---|---|
| lesson-02 | [integration-text/complete-teaching/lesson-02.teaching-fragment.html.txt](integration-text/complete-teaching/lesson-02.teaching-fragment.html.txt) | `a843cc369e041e244a5cc775907979d36b906b78b2fc3b39ed26a0757d395c00` |
| lesson-05 | [integration-text/complete-teaching/lesson-05.teaching-fragment.html.txt](integration-text/complete-teaching/lesson-05.teaching-fragment.html.txt) | `c0c83129effd4b3268d41493f0a5a8d0bc82870453df040fe86b829078d44a3a` |

## Protected activity/footer contracts

Each complete original suffix is retained as raw-before evidence. The suffix is **not** claimed wholly unchanged: only its listed question HTML carveouts are permitted to change. Every other disjoint suffix segment is pinned below and in INTEGRATION_MAP.json.

### lesson-02

Original suffix `[124946, 134480)`, SHA256 `56c917d78e4bc20d47275146afcd604ae737691cf816b485863f3d4b383766f1`; raw copy [raw-before/integrated-v020/lesson-02/suffix.html.txt](raw-before/integrated-v020/lesson-02/suffix.html.txt).

Allowed question HTML carveouts: `ch17-l02-check-writing-1.html`.

| Protected original interval | Bytes | SHA256 |
|---|---:|---|
| `[124946, 130865)` | 5919 | `18a31e145722947e3474466b58a8598c86997c79662518a55cc7e6b5e41111b9` |
| `[132393, 134480)` | 2087 | `99e67e2d0a497b4b535cde6a2a554572525caf5437f3a4dd1abd1d790e7df1e9` |

### lesson-05

Original suffix `[214899, 226565)`, SHA256 `b096766cf85ac4a41564bcc3d6a662ba136d565469ae207203a38ec4f4859e45`; raw copy [raw-before/integrated-v020/lesson-05/suffix.html.txt](raw-before/integrated-v020/lesson-05/suffix.html.txt).

Allowed question HTML carveouts: `ch17-l05-check-mc-2.html`, `ch17-l05-check-writing-1.html`, `ch17-l05-check-writing-2.html`.

| Protected original interval | Bytes | SHA256 |
|---|---:|---|
| `[214899, 221723)` | 6824 | `87ce505a97e06bc9f30068760e519316e4777ac8e4f5c8e0940190c2dca76747` |
| `[222873, 223076)` | 203 | `627b04acccb300513f21366cc2ebd1cbda86cc4f4edab65be971f0898f85c208` |
| `[225988, 226565)` | 577 | `cfdab68e77ecf4cca993b9ac57fca2439b13b7d521a4cc2dae11722ff7cf2322` |

## Untouched owner and native contracts

- [Untouched owner complement hashes](evidence/UNTOUCHED_OWNER_EVIDENCE.json).
- [Current native range/control contract](evidence/native-source/INTEGRATED_NATIVE_CONTRACT.json).
- [Current optional note state contract](evidence/native-source/OPTIONAL_NOTE_INTERACTION.json).
- [Current required check state contract](evidence/native-source/REQUIRED_ASSESSMENT_INTERACTION.json).
- Exact integrated note registry: [raw-before/integrated-v020/configuration/notes.json.txt](raw-before/integrated-v020/configuration/notes.json.txt).

The preserved figure ranges and delivered raw paths are in `figureContracts` in INTEGRATION_MAP.json. Reader-only presentation styles are not native integration edits.
