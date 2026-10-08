# Current local source gate — calibration v0.1.0

Fresh verification: **PASS**. All three original ZIPs are currently present and readable; whole-file bytes/SHA256 match the original manifest and CRC checking reports no failure. No archive was restaged.

| Original local ZIP | Bytes | SHA256 | Members |
|---|---:|---|---:|
| `upload/Biology30_CH17_Source_Handoff_2026-10-03_Part_1(1).zip` | 14666563 | `73520250d140ef5f7575c5d52400ba941c0a751d24fe6939776ccd28df0be7d0` | 188 |
| `upload/Biology30_CH17_Source_Handoff_2026-10-03_Part_2(1).zip` | 13627472 | `0ec8c4c0b46f7b25a67d02282a0893eeb359bb89d5d13173bf2024c2f62ce327` | 32 |
| `upload/Biology30_CH11_Teaching_Exemplar_v1.0.0_Part_1(1).zip` | 196257 | `a4351be937b320aefa8e2076ed3b5a20326c5c142111f3f2b472a8b7a91169ca` | 32 |

All **235 included manifest entries** match both original archive member bytes and current staged originals. The **17 additional archive-protected members** also match the staged copies. There are 252 file members total: 220 Chapter17 and 32 isolated Chapter11 exemplar members. The two Chapter17 ZIPs have distinct members; they are ordinary archives, not split binary wrappers.

Native owner SHA256 remains `9ea0e4532845625e7a2421b6e885fea2781ad3c1229b8499dc7c8bb967289868`. The current uploaded manifest SHA256 is `c22193171eac93ed75085394b6edad16fbf8d292db8a0ebfead08646013bdee2`; preservation binding was parsed and matched its archive member.

## Concrete unavailable scope

- `UnitC.zip` (declared 274,867,532 bytes) remains intentionally absent and unaccessed; its parent hash is provenance only, not a new local verification. The selected original members are present and verified.
- The full `All daily plan.zip` and full daily-plan members were not supplied or read. Historical extracted references are not those full plans.
- Original mixed-chapter UnitC tests were not supplied or read; complete missing filenames/content cannot be recovered from this packet. The two included Chapter17 QTI exports are available as their own bounded sources.
- Registry-only authority `performance.pdf` and `bulletin.pdf` remain unavailable; cached program and registry evidence are dated, not current certification.
- Historical references to Chapter14 handoff and `Pasted markdown (2).md`, and other files merely mentioned by the exemplar, are not evidence of present source availability or authorization to access unrelated material.

## Read-only boundary

All 410 files in the final v1.0.0 folder remain byte-identical during this gate. The gate writes only this calibration source-evidence directory. It does not establish a fresh teaching read, teacher/science acceptance, integration, current authority, video playback or runtime tests. Detailed category/member records are in the adjacent JSON files.
