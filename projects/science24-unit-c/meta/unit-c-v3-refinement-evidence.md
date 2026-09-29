# Unit C v3 refinement checkpoint

**State:** blocked, previewable Build candidate. This is a refinement of the v2 learner namespace and IDs, not a new save version. Teacher sign-off and the full Unit C acceptance batch remain outstanding.

**Local preview:** http://127.0.0.1:4191/science24-unit-c/workspace/#overview

## What changed after the parity review

| Unit A/B standard or source requirement | Unit C implementation | Build review result |
| --- | --- | --- |
| Clear overview and lesson route | Overview now names concrete C questions and links to the original resource library; all 17 teaching routes and the review remain. | Compared against current B overview at 1440 px; `review-screenshots-v3/overview-desktop.png`. |
| Teaching before a source assignment | Removed the same generic “Connect the explanation to the original work” card from all 17 lessons. Each lesson now has its own source-specific explanation in that slot. | All 17 bridge records are in `source-coverage-repair-v3.json`; no generic card remains. |
| Full original workbook context without a lesson text wall | Every lesson ends with a collapsed, optional original-work section containing the appropriate workbook page links, page image and text, and a saved written application. | 17 sections and 17 unique saved notes are present. The 108 mapped workbook questions/subparts point to their respective lesson and preparation note. The exact original questions remain on the workbook page. |
| Honest source disposition | All 108 exact workbook tasks are explicitly retained as original work with online preparation. The former blanket claim that each was fully taught and practised online was removed. | `source-task-map-v2.json` reconciled to this candidate; subject-specific preparation is in the 17 bridge records. This is a source mapping correction, not proof of complete source acceptance. |
| Original diagrams where interpretation depends on them | **Superseded in part 2026-09-25:** Lesson 15 now shows both the original p. 31 Q11 pedigree and the separate p. 32 Q12 pedigree. Lesson 13 adds a native cell–chromosome–DNA scale figure and links to the three original karyotypes. Lesson 7 has a clearer source-to-tap safeguard diagram. | The earlier browser evidence covered the p. 31 figure only. The corrected two-figure candidate requires a fresh targeted visual check. |
| Plausible practice and saved evidence | Reworded clearly implausible distractors while preserving question IDs, option IDs, correct option text and keyed answer IDs. New edits are recorded in `question-wording-repair-v3.json`. Optional practice now shows checked feedback only after the browser confirms the write. | 127 objective items have unique, valid keyed options. One checked attempt and one new original-work response survived Chromium reload after save confirmation. Old attempts still use their option IDs; their displayed wrong-option wording can differ from the wording at the time of the old attempt. |
| Phone-readable source comparison | Lesson 7’s three-column public-systems table becomes three labeled cards below 700 px. The lesson header, water figure, source section and required-check summary were reviewed. | No document overflow at 320, 390, 768 or 1440 px in the sampled changed views. `review-screenshots-v3/lesson-07-public-systems-phone.png`. |
| Teacher-editable and runtime ownership | New routine headings, explanation, table label and figure captions have durable edit keys. New saved activity and practice surfaces remain runtime-owned. | Static duplicate-key check passed: 824 unique edit keys. Studio lifecycle proof remains deferred. |

The current C candidate still includes the v2 baseline of two worked examples and five practice tasks per teaching lesson, 18 required checks, optional practice modes, 68 vocabulary terms, 13 original textbook practice pages, 49 reader pages and eight optional videos. This turn checked structural presence for all 17 teaching lessons and rendered examples of the changed areas; it did **not** rerun the complete learner acceptance batch.

## Focused checks run

- Deterministic `course-data.json` → `course-data.js` compiler passed; `node --check` passed for `main.js` and the compiled wrapper.
- Static reconciliation passed for 17 teaching lessons, two worked examples and five formative mounts per lesson, 17 original-work sections and notes, 17 required-check mounts, 108 workbook task routes/preparation IDs, six figure assets and 127 keyed objective items.
- Real Chromium showed no page errors in the targeted lesson/overview views. At 390 px, a guided answer and a source-work note survived reload **after visible save confirmation**; the pedigree enlargement opened. A simulated `QuotaExceededError` showed both the global storage alert and a local “not in the confirmed browser record” message, without claiming the attempt was retained. The first immediate-reload probe before the confirmed-save fix exposed the feedback timing issue and was not counted as a pass.
- Sampled source table and figure layouts at 320, 390, 768 and 1440 px had no horizontal document overflow. Seven exact-candidate screenshots are in `review-screenshots-v3/`.

## Exact candidate hashes (SHA-256)

| File | Hash |
| --- | --- |
| `workspace/index.html` | `c068f292e62eaec6a3870c2ac682aecfe66cac696ab180ba57c275c7df857df6` |
| `workspace/course-data.json` | `0101b70852674fe202b13a2ccdd0bb94baf63c4800e6f33ddbe901f9aa6fa287` |
| `workspace/course-data.js` | `070b8fc66237f71934f4e1582e23d3e2f78e71e35984b05964d7e139e2fb8c11` |
| `workspace/main.js` | `b3fad47adbad04faa9af093627a2787d60601a249c1a37da02c16659de37711d` |
| `workspace/state-store.js` | `24375e06f68c4e73aaa306350a14674e0982be44559d7d0a473652b010906a30` |
| `workspace/styles.css` | `f0bce32fcd6d4243cbcde101c1e916b247de55cc45696a3fc624c54bd0b6a85a` |
| `workspace/unit-c.css` | `584891885cd5062a5f3f5ff4ff720c8ebb98f9a06cc35c539246581519c2de04` |
| `meta/source-task-map-v2.json` | `0d7665029487b0af4243155d080f2902f2d0a0ac0b38220565d0cfba04246e74` |
| `meta/source-coverage-repair-v3.json` | `bbb3f6dd7cd134f5f4f273a040209e4ad62ba198885b207aaabc4a777422e2bd` |

## Remaining review and teacher decisions

- Run the planned complete source/science and answer-key audit, all-route desktop/tablet/phone plus keyboard/zoom inspection, every practice/required-check path, interrupted saves, storage-failure and two-tab recovery, and Studio/workspace readiness against a frozen candidate. A blocked-project doctor refusal is not a pass.
- **Superseded 2026-09-25:** this finding compared Q12 with the Q11 figure. The questions use different pedigrees. Q12's own p. 32 figure shows two unaffected parents with an affected child, supporting recessive inheritance in the intended simple model; the learner lesson and assessment were corrected and versioned.
- Decide whether any supplemental CBE image can be published after rights review. No CBE photo was added in this refinement. Current vaccine schedules and air-quality advice should be treated as live public-health sources rather than frozen textbook facts.

No deployment, export, Studio activation, SCORM test or Brightspace certification was run.
