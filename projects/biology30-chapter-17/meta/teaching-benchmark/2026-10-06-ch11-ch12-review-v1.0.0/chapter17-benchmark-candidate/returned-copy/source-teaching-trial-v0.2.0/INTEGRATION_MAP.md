# Exact proposed native integration boundaries — v0.2.0

These are inert proposals against the unchanged current native owner. No replacement or configuration insertion has been applied.

**Required native index SHA256:** `9ea0e4532845625e7a2421b6e885fea2781ad3c1229b8499dc7c8bb967289868`

All offsets are UTF-8 **bytes**, start-inclusive and end-exclusive, in that original file. They are not character indices or offsets in a previously integrated course. `INTEGRATION_MAP.json` contains all source ranges, anchors, hashes and protected-record contracts.

| Route / exact title | Teaching replacement interval | Exact new fragment | Bytes |
|---|---|---|---:|
| `lesson-02` — Mendel’s experiments and segregation | `[106355, 110898)` | `integration-text/lesson-02.teaching-fragment.html.txt` | 18,591 |
| `lesson-05` — Two-trait crosses and independent assortment | `[169200, 174246)` | `integration-text/lesson-05.teaching-fragment.html.txt` | 31,651 |

## lesson-02

Fragment SHA256: `a843cc369e041e244a5cc775907979d36b906b78b2fc3b39ed26a0757d395c00`

| Protected portion / source replacement slice | Original UTF-8 interval | SHA256 |
|---|---|---|
| Original teaching slice | `[106355, 110898)` | `b4e64d090435f0dd8af71ce21e3d1621f11d0370b1f086b60c0b5e2df8aa5c8c` |
| Untouched route prefix | `[102372, 106355)` | `db23b534c4003ebb1ff3d7ad97070bd4f8d6e4bca096209cd6de7802bd45c438` |
| Untouched activities and footer suffix | `[110898, 120432)` | `56c917d78e4bc20d47275146afcd604ae737691cf816b485863f3d4b383766f1` |

All original source controls and every individually recorded activity/footer within `lesson-02` remain protected. The exact raw slices are indexed in `evidence/RAW_BEFORE_INDEX.json`.

## lesson-05

Fragment SHA256: `4439240ef48d2b38d50bf3e624769c03e9a79a9641d7fd25386d0d5ec4799cb8`

| Protected portion / source replacement slice | Original UTF-8 interval | SHA256 |
|---|---|---|
| Original teaching slice | `[169200, 174246)` | `5faeb54cab22d793d22839d25271ee3eba6f63b07057fbf17683e7197e473f46` |
| Untouched route prefix | `[165206, 169200)` | `28b986d505f43c2100034aa0bbbf76eb9c5280b5fc083011659fe82597ea77e4` |
| Untouched activities and footer suffix | `[174246, 185912)` | `b096766cf85ac4a41564bcc3d6a662ba136d565469ae207203a38ec4f4859e45` |

All original source controls and every individually recorded activity/footer within `lesson-05` remain protected. The exact raw slices are indexed in `evidence/RAW_BEFORE_INDEX.json`.

## Separate note-title proposal and unchanged headers

The four optional response interfaces propose the existing native S.notes mechanism. `NOTE_TITLE_REGISTRATION_PROPOSAL.json` and `integration-text/course-data.notes.append-proposal.txt` specify a separate **498-byte insertion at original UTF-8 byte3240262**, immediately before the existing notes-array closing bracket. It adds only four `{id,title}` registrations for readable All My Work titles. The six original entries remain unchanged. This insertion is not part of either teaching interval and has not been applied.

`HEADER_PROPOSALS.json` contains an empty proposal list. Exact route titles, goal/before-you-begin/guide/reader ordering, media and required tasks remain native-owned. There are no stylesheet, font, JavaScript, runtime, storage-schema, history, progress or save-gating changes. Metadata remains blocked/proposal-only.

Native saving and course behavior remain untested. Static compatibility and exact byte boundaries do not clear either unresolved source/assessment decision or authorize integration.
