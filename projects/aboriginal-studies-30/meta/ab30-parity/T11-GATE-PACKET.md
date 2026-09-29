# T11 exemplar review gate packet — Lesson 7 candidate

Status: PACKET-READY. NO APPROVAL CLAIMED. Teacher decision + lead decision are both PENDING (recorded below, unfilled).

Candidate: `t1-l07-numbered-treaties`, contentVersion `v2-exemplar-t10`.
Per the runbook, any approval granted applies ONLY to the hashes below. Later material edits reopen the review.

## Candidate hashes (sha256)

| Artifact | sha256 |
|---|---|
| Lesson 7 source (`course-data.js` lesson object, 21,301 chars, 21 blocks) | `95c9625e6903ed7ddb70e580cc4c933a42bb5cf8edb56ce4d85fc5f6fc2315f7` |
| `workspace/course-data.js` (whole file) | `7c274e112ac8a01a321643a7f8e5a06af9bbd1daab9a4295965a6b15d7402884` |
| `workspace/lesson-components.js` | `2956ad84609374e2ea0b20d0f52bab37a06663e7986d3d6facd151ecfec22ed5` |
| `workspace/main.js` | `9da73170b1e42c7204a2660fcaf7cc6b0aacf789f712d12b52d8dcc88b450d24` |
| `workspace/learning-store.js` | `3872f1d8a8ce8a91726656052d94294c8ba34717fab24bf71ef9cd8eb89292a9` |
| `lesson-review-manifest.json` (L7: v2-exemplar-t10, unreviewed) | `b3b24e2ec5409534c1e3d1d09610ea8db283c8462a07663ff361f90215d6b5b4` |
| `T10-lesson7-rendered.html` (renderer output, both states) | `0ef34a781dd66a36bd1b396b65fd092758784d7985c57f4f68b4ef3a811d287a` |
| `textbook-ch1-pp24-28.txt` (quote-verification fixture) | `c96fc945f309a0315515d6eeaf964548199e95eefe6f532f7aa8b061dbd7657d` |

## Evidence index (all in-repo)

1. Readable lesson: `meta/ab30-parity/T10-lesson7-rendered.html` — exact renderer output, fresh (criteria locked) and after save+reload (criteria unlocked), plus the real attempt loop (first save, reload replay, revision 3).
2. Source set: 9 extracts in the lesson object, each with type/locator/attribution; 4 non-textbook cards carry speaker + context/limits. Locators cite printed p. 25/26/27/28 + PDF pp. 33/34/35/36 of Contemporary Issues: Aboriginal Studies 30 (Duval, 2005).
3. Task/feedback examples: worked (4 reasoning steps + finished response + limit), supported (match + repair, 3-case feedback), independent (fresh pair, save-gated criteria), reflection (unsaved).
4. Test results: `meta/ab30-parity/T10-run.log` (content 13/13) + battery 84/84; matrix auto-halves CONTENT01–08, PRACT03, STATE07 green.
5. Quote verification: CONTENT06 proves all 9 extracts are contiguous substrings of the independently extracted band (mutation control included).

## Bio-parity anatomy mapping (text form; screenshots pending — no browser in this environment)

| Parity §2 anatomy item | Lesson 7 location |
|---|---|
| 1. Breadcrumb/eyebrow, title, essential question | Kicker + title + goal strip (essential question rendered) |
| 2. Goal/prior-knowledge strip | Goal strip: goal + prerequisite + essential question |
| 3. Collapsed How-to | Theme-level "How to complete this theme" chrome (existing) |
| 4. Source-reading band + page mapping | Textbook band (Ch.1 pp. 24–28) + per-extract printed→PDF locators |
| 5. Key terms + vocab help | Terms strip + collapsed vocabulary help (existing chrome) |
| 6. Headed teaching sections | 5 headed explanations, each before its application |
| 7. Figure/source comparison + prose | Comparison table (M06 text role); NO map (permission pending per register) |
| 8. Worked example at the concept | Worked block: bounded Q, 2 evidence items, 4 reasoning steps, finished response |
| 9. Supported practice + feedback + next step | Supported block: method, match+repair task, 3-case feedback |
| 10. Fresh independent opportunity, formative labelled | Independent block: fresh pair, differsFrom declared, response labelled formative |
| 11. Assignment connection via canonical record | Q28–31 boxes woven below via unchanged bookletQuestionIds (no second draft box) |
| 12. Synthesis + Previous/Next | Synthesis explanation; prev/next is existing route chrome |

Bio/AB30 side-by-side screenshots: NOT PROVIDED (no browser). The plan's baseline screenshots (`bio13_lesson-01_*`, `t1-l07-numbered-treaties_desktop.png`) are the visual references; capturing the new Lesson 7 at desktop/narrow widths requires a human with a browser.

## Teacher checklist (T11 human half)

- [ ] A first-time learner can follow the purposes → meanings → views → language → method sequence without a missing explanation.
- [ ] New terms are introduced in prose before use (Numbered treaties, oral promise, cede, adhesion, surrender/sharing).
- [ ] The worked example models the method on a nearby case (1899 adhesion), NOT the Q29 answer.
- [ ] Supported feedback addresses real errors (overgeneralization, irrelevant dates, claim-vs-event confusion).
- [ ] The independent pair is genuinely fresh; criteria compare without diagnosing writing.
- [ ] Source labels are correct (summary vs explanation vs retrospective vs quoted court statement); the one-adhesion limit is stated and kept.
- [ ] No fabricated testimony/quotations; extracts match the supplied textbook (spot-check against the PDF, not just the fixture).
- [ ] Sensitive-task handling acceptable; interpretations assessable on evidence/reasoning.
- [ ] Extract-permission posture confirmed (in-copyright textbook, short study extracts — see T10 record note).

## Lead checklist (T11 human half)

- [ ] Code/state integration: formative key is `formative` role, denominator unchanged (CONTENT08 proves; confirm the approach).
- [ ] Save-before-model gating is render-time truthful, reload-stable (STATE07 proves; confirm no bypass worth blocking on).
- [ ] Q28–31 records byte-identical; completion semantics unchanged.
- [ ] Full battery + tsx run in CI (tsx EPERM in the worker sandbox).
- [ ] Browser pass: desktop/narrow render, keyboard through the new controls, save→navigate→reload→revise over HTTP.
- [ ] Confirm the candidate hashes above match the files reviewed (re-run the hash script).

## Approval record (HUMAN ONLY — executor must not fill)

- Teacher approval: name / `________________` date / `________________` decision (approve | approve-with-corrections | reject): `________________`
- Content hash approved (teacher): `________________`
- Lead approval: name / `________________` date / `________________` decision: `________________`
- Content hash approved (lead): `________________`
- Corrections assigned (bounded, with owning ticket): `________________`

## Defect log

None filed yet. Corrections from this gate return as bounded fixes against this packet (same hashes if cosmetic; new candidate + re-review if material).
