# Unit C v2 learner build checkpoint

> Superseded as the current learner candidate by `unit-c-v3-refinement-evidence.md`. The hashes and screenshots below document the earlier v2 checkpoint only.

**State:** blocked, previewable Build candidate. Teacher sign-off, full learner acceptance, Studio readiness, export and Brightspace certification have not occurred.

**Preview:** http://127.0.0.1:4191/science24-unit-c/workspace/#overview (local server on this machine).

## Candidate and source coverage

- 17 teaching lessons plus integrated review, Chapters 9–12, in canonical `workspace/index.html`.
- `source-task-map-v2.json` traces 108 workbook question/subpart entries and 49 printed textbook pages to their physical PDF pages. Original 2023 workbook, key and guided notes remain linked; the key is framed for attempt-first self-check.
- Each teaching lesson has a goal, prerequisite, page-specific reading, four key terms, two worked examples, error diagnosis, two guided and two independent tasks, saved transfer and later responses, two required selections and two required saved explanations. Eight fresh review selections span four chapters, followed by two synthesis responses.
- Optional practice has 85 multiple-choice formative items, 68 blanks, 68 flash cards, 13 original textbook question pages with source image/text and saved numbered responses, four labeling diagrams, and eight optional lesson-connected videos with local explanations. The full 49-page textbook reader retains nonconstant printed/PDF positions.
- The v1 candidate is frozen in `rejected-candidate-v1.zip`, and the original catalog in `legacy-catalog-v1.json`. New IDs and namespace are v2. Prior v1 answers remain accessible in All My Work as previous-draft evidence and do not count toward the 18 new checks.
- **Superseded 2026-09-25:** this v2 evidence combined Q11 and Q12. The corrected source map records that they use different pedigrees; Q12's separate p. 32 figure supports the key's recessive interpretation in the intended simple model. The supplemental CBE audit is in `cbe-content-audit-v2.md`; no CBE image was copied into the learner pages.

## Focused Build verification

- Initial activity catalog assembled from reviewed seeds with `python3 scripts/build-science24-c-catalog.py`; the canonical `course-data.json` browser wrapper compiled successfully with `node scripts/compile-science24-bcd-data.cjs --project science24-unit-c`. Future activity edits belong in canonical `course-data.json`; the seed builder is provenance, not a routine regeneration dependency.
- Static assertions passed for 17 route IDs, 85 formative mounts, 18 required-check mounts, all expected writing questions, eight media entries and present image assets. All 127 objective items have unique IDs, valid keyed options and explanatory feedback.
- Real Chromium loaded overview, sample lessons, integrated review and every shared practice/resource route without page errors. At 1365 px and 390 px, sample pages had no horizontal document overflow. Representative images are in `review-screenshots/`.
- A written transfer response saved and survived reload. One complete required check saved two correct selections and two written explanations, increased progress to 1 of 18 and survived reload. A seeded old-namespace answer appeared under Previous draft work without changing v2 progress.
- Vocabulary lesson filtering, textbook question rendering, printed-page viewer, video card and labeling route loaded without page errors.

## Exact candidate hashes

| Canonical file | SHA-256 |
| --- | --- |
| `workspace/index.html` | `ac3d767b50bb7334d24b9f35f498720475e3db49e0e312d21aa26a8a24bf9100` |
| `workspace/course-data.json` | `79cac8dcf2b42e4cae97daf12cc6393ec1ab468989509061503096c22877c9f5` |
| `workspace/course-data.js` | `877af7dee747ae1de50cc7a43345aa0f163f1fb41c5d2775046d90ab0eb5e5d5` |
| `workspace/main.js` | `4b44a413afa7b20f00cde82b0be3cc60f49a5fb70b1dca40cb546eb1b87976e1` |
| `workspace/state-store.js` | `24375e06f68c4e73aaa306350a14674e0982be44559d7d0a473652b010906a30` |
| `workspace/styles.css` | `f0bce32fcd6d4243cbcde101c1e916b247de55cc45696a3fc624c54bd0b6a85a` |
| `workspace/unit-c.css` | `9b9313cd3343a285efdc2516fe1493dbc0ccd46738462d28918ce101ee74e1c6` |

## Deferred acceptance and teacher decisions

The completed Unit C review batch still needs independent scientific/source review of every worked example and answer, all-route desktop/tablet/phone presentation and keyboard/zoom review, all practice modes and required checks, interrupted sessions, storage failure and two-tab recovery, Studio/workspace metadata checks and exact-candidate evidence. The project remains blocked; a doctor refusal in that state is not a pass. No export, deploy, SCORM test or LMS certification was run.

Teacher decisions: whether any supplemental CBE photo has local rights approval before a future publication. Current v2 uses no copied CBE photo. The earlier Q12 decision is closed by the source correction recorded 2026-09-25.
