# Unit A Pilot 2 — Remaining Academic Review

Review date: 2026-09-05. Learner SHA: `21363490e611251c01101cee0bc5925583d1b856b8285a87ee74838ddd1341e5`.

The readable teaching direction is sound, but Unit A is not ready for academic sign-off or automatic B–D transfer. This was a review-only pass: the learner course, saved-state contract and previous visual build are unchanged.

## What was actually checked

- All 86 practice prompts, keys, choices and rationales against their exact local teaching; no key change is recommended. This is not a claim that all 86 are well-designed assessments.
- Actual textbook folios and relevant passages: 12 Final Practice links point to Chapter 13 with negative PDF pages. Separately, 22 printed-page selections target unrelated teaching content (overlapping findings, not additive counts). Other links provide only background; see every item below.
- All 14 local media paths and their checkpoints. All are four-step text summaries, not the illustrated alternatives promised in the plan.
- Public metadata for all 14 videos: titles, providers, durations, reported embedding and English tracks. This is not playback or transcript proof. Full clips total 102 min 11 sec.
- One complete publisher transcript (NIH brain video), with qualifications required. Thirteen transcript reviews remain unfinished: direct YouTube timed-text responses were empty, and title/summary pages are not transcripts.
- Official standards pages were rendered and opened to check the two columns; 47 stored rows match acceptable examples, five match excellence examples, and one is a locally authored skills criterion.
- Remaining outcome/evidence records, all 13 core lesson explanations, their readability report, and the saved-state headroom.

## Findings and exact repair criteria

### AR-01 — Answer position leaks the correct response

Priority: high. Scope: 86 practice items.

62 keys are a, 21 b, 3 c and none d. Every Chapter 12 item, every Chapter 13 item, and all 24 Final Practice items put the key first.

Next change: Author a balanced display order while preserving choice values and answer keys. Do not shuffle meaning or invalidate existing answers merely to change presentation.

Acceptance: Balanced visible positions within each set; old selected choice values still restore to the same answer text.

Owner: [render-gate1.ts](../../../scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts)

### AR-02 — Textbook chapter selection and teaching pages are wrong

Priority: high. Scope: Practice feedback and other reused locators.

Twelve Final Practice items use Chapter 13 for Chapter 11/12 content, producing negative physical PDF pages. FINAL_CORE_ITEMS and FINAL_CHALLENGE_ITEMS pass one chapter-13 argument to practiceItems for the entire mixed-unit set. Separately, several printed-page selections point to unrelated content. Arithmetic and a present button were not sufficient validation.

Next change: Choose the document per item, reject physical pages outside its verified range, then apply the per-item content judgments. Check reused locators in vocabulary, lesson, media, advanced and study maps separately. Mark partial/background support honestly and offer the exact local teaching link when needed.

Acceptance: Every locator has the correct chapter, a valid physical page and a visually inspected relevant explanation; no source-error wording reintroduced.

Owner: [full-content.ts](../../../scripts/lib/biology30-unit-a-pilot-2/full-content.ts)

### AR-03 — Feedback and distractors need an instructional review

Priority: high. Scope: 68 generic-feedback items; weak alternatives across multiple sets.

The generic response repeats the choice and rationale without locating the misconception. Anatomically unrelated and absolute distractors often make elimination trivial.

Next change: Write choice-specific explanations of the wrong role, direction, structure or causal step. Replace weak options one-for-one. Version an item if its answer meaning changes; retain unaffected saved answers.

Acceptance: Every wrong option gets a specific repair explanation and uses introduced vocabulary; no new quiz counts or score changes.

Owner: [full-content.ts](../../../scripts/lib/biology30-unit-a-pilot-2/full-content.ts)

### AR-04 — Required local media paths are not illustrated equivalents

Priority: high. Scope: All 14 required media steps.

Every local path contains four numbered captions and a short summary, with no image, SVG, graph, data table or model. Adjacent lesson visuals do not constitute an objective-mapped walkthrough.

Next change: Build each local path around already reviewed diagrams/data and explicit ordered explanations. Match the clip's selected learning objectives and checkpoint, not every tangent in the full clip. Keep it available offline.

Acceptance: A student choosing local can follow the same taught mechanism without leaving the path; exact visual/objective/checkpoint map reviewed for all 14.

Owner: [render-gate1.ts](../../../scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts)

### AR-05 — A caption track is not a completed video academic review

Priority: high. Scope: 14 clips.

Public player metadata reports all 14 available, with English tracks, but all direct timed-text fetches returned empty bodies. The NIH brain transcript was obtained separately and raises qualification/term-scope concerns.

Next change: Review accessible publisher transcripts or displayed captions and actual segment pacing. Record timestamps, additional terms, corrections, duration and the local-equivalent mapping. Do not approve a full clip from metadata or its publisher name.

Acceptance: Every required segment has actual transcript/caption evidence and a documented scope judgment; unreviewed clips are not certified required-ready.

Owner: [contracts.ts](../../../scripts/lib/biology30-unit-a-pilot-2/contracts.ts)

### AR-06 — The 53-row standards inventory conflates sources and levels

Priority: high. Scope: Curriculum/performance contracts.

Five stored rows come from the excellence column, not acceptable: A1.3k-04, A2.3k-02, A2.3k-03, A2.5k-02 and A2.6k-04. A1.4s-01 is a locally constructed communication row, not an additional performance-table bullet.

Next change: Record official outcome, document page, column and locally authored ID separately. Retain the 47 actual acceptable examples as examples, five excellence rows as extensions, and the communication row as an outcome-derived local criterion. Re-evaluate gaps against the Program of Studies before adding required tasks.

Acceptance: No claim of 53 official acceptable-standard behaviours; broad curriculum skills retained without turning every illustrative example into a mandated extra lab.

Owner: [contracts.ts](../../../scripts/lib/biology30-unit-a-pilot-2/contracts.ts)

### AR-07 — Chapter 12/13 structure-function evidence is incomplete

Priority: high. Scope: Eye, ear, gland and twelve-hormone targets.

Readable teaching and labelled figures exist, but current responses sample only part of the required structure/function inventory. A labelled figure alone does not show that the learner can identify it.

Next change: Use a small number of purposeful identification/source-target-effect tasks with explicit answer criteria. Reuse existing model parents and figures. Resolve state headroom before adding fields; do not shorten existing saved work.

Acceptance: Each named curricular structure/hormone has an actual teaching and response opportunity; no completion-gating expansion or checkbox-only coverage claim.

Owner: [academic-evidence.ts](../../../scripts/lib/biology30-unit-a-pilot-2/academic-evidence.ts)

### AR-08 — Practical skills require a delivery decision

Priority: high. Scope: Microscopy, reflex, visual and hearing procedures.

The current ruler-drop activity measures reaction time, not an isolated reflex. Tactile discrimination does not cover visual discrimination. Synthetic plots do not prove actual tool use.

Next change: Confirm fully online, supervised or mixed delivery; choose safe procedures or explicitly approved alternatives and record which skills each can demonstrate. Rename the ruler-drop learner title without changing its stored ID. No pupil tests with unsafe light, diagnostic hearing claims or unapproved procedures.

Acceptance: Teacher records delivery/procedure choices. The audit does not treat the standards' illustrative laboratory examples as an automatic requirement to perform every physical experiment.

Owner: [render-gate1.ts](../../../scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts)

### AR-09 — Inquiry and communication are still under-evidenced

Priority: high. Scope: STS, planning, data analysis and collaboration.

Current saved cases do not consistently require an investigable question, variables, evaluation of a technology's limits, comparison of explanations and a justified revision.

Next change: Strengthen a few existing investigations/review sessions with explicit criteria and safe exchange paths. A published environmental dataset is one possible source-backed planning example, not the only legally mandated one. Never claim invented data are published.

Acceptance: Actual prompts and response criteria support each skill outcome; teacher-approved independent alternatives do not falsely claim observed teamwork.

Owner: [academic-evidence.ts](../../../scripts/lib/biology30-unit-a-pilot-2/academic-evidence.ts)

### AR-10 — Challenge and final blueprint need meaningful data demands

Priority: medium. Scope: Final Practice.

Several Challenge items repeat familiar rules without supplying data. Final core item 10 is temperature feedback, not a fourth sensory item. Graphs exist in lessons, but the item set rarely asks for numerical or multi-step interpretation.

Next change: Reconcile the six/four/six/two final allocation against actual concepts and replace weak items one-for-one using unfamiliar graphs, values and plausible alternatives. Keep difficult writing out of the core.

Acceptance: Item blueprint matches rendered questions; graph/data tasks genuinely require the evidence; independent graph drawing is offered at the justified skill/advanced level, not imposed as a misread acceptable example.

Owner: [full-content.ts](../../../scripts/lib/biology30-unit-a-pilot-2/full-content.ts)

### AR-11 — First-use scope includes distractors and videos

Priority: medium. Scope: Prerequisite sequence.

Correct answers generally follow clear core explanations. Some distractors and full videos introduce unprepared terminology, including synaptic cleft in Lesson 2 and endocrine/thyroid in early nervous-system choices.

Next change: Check the vocabulary dependency graph against every visible choice, figure and selected video segment. Prefer coherent introduced distractors; add an immediately useful definition only when instruction needs it.

Acceptance: No question requires a future term to understand the alternatives; no false promise that four anchors are the only necessary terms.

Owner: [full-content.ts](../../../scripts/lib/biology30-unit-a-pilot-2/full-content.ts)

### AR-12 — Allocated time is not a measured learner workload

Priority: medium. Scope: 1,505 required / 295 optional minutes.

Full current clips total 6,131 seconds (102 min 11 sec). Reading and allocation estimates do not establish time for pausing, model use, note writing, mistakes and revision.

Next change: Time representative learners on complete routes, including video and local branches. Record duration evidence separately from declared minutes. Keep totals fixed during this review; adjust content density only through an approved revision.

Acceptance: A timed route log supports feasible workload; readability estimates and declared duration are not presented as observed completion times.

Owner: [pilot-2-contract.json](../../../projects/biology30-unit-a-pilot-2/meta/pilot-2-contract.json)

## Question-by-question review

R = recognition/understanding; A = qualitative application; H = multi-step interpretation. These are reviewer judgments, not measured item difficulty or provincial certifications. Every row retains its key; the linked JSON includes prompt, all choices, exact teaching selector/hash, prerequisites and page recommendations.

| Item | Key / demand | Textbook review | Recommendation |
| --- | --- | --- | --- |
| lesson-01-guided-1 | b / R | p.369: nearby-overview | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.372 (PDF 13). |
| lesson-01-guided-2 | c / R | p.371: wrong-teaching-page | A good structure-function target, but the current p.371 link is a reflex lab. Preferred support: Chapter 11, p.372 (PDF 13), p.378 (PDF 19). |
| lesson-02-guided-01 | a / A | p.375: wrong-teaching-page | Refers to the lesson graph; no coordinates or numerical comparison are required. Do not call this independent graph construction. Preferred support: Chapter 11, p.376 (PDF 17), p.377 (PDF 18). |
| lesson-02-guided-02 | b / R | p.377: background-only | Synaptic cleft is used as a distractor before Lesson 3 defines it. Preferred support: Chapter 11, p.377 (PDF 18), p.403 (PDF 44). |
| lesson-03-guided-1 | b / R | p.380: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.379 (PDF 20), p.380 (PDF 21). |
| lesson-03-guided-2 | a / A | p.382: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.382 (PDF 23). |
| lesson-04-guided-01 | b / R | p.396: direct-support | A parasympathetic sensory gland is not a coherent competing pathway; endocrine is not defined in this lesson's term inventory. Preferred support: Chapter 11, p.396 (PDF 37). |
| lesson-04-guided-02 | c / R | p.398: supported-with-qualification | All/only distractors can be dismissed without much mechanism knowledge. Preferred support: Chapter 11, p.397 (PDF 38), p.398 (PDF 39). |
| lesson-05-guided-01 | a / R | p.392: wrong-teaching-page | Thyroid and dorsal root are not alternative brain regions. p.392 discusses cortical language areas, not the direct cerebellum explanation. Preferred support: Chapter 11, p.387 (PDF 28), p.391 (PDF 32). |
| lesson-05-guided-02 | b / R | p.390: background-only | Correct evidence habit, but the three absolute alternatives make it an easy elimination item. Preferred support: Chapter 11, p.391 (PDF 32), p.392 (PDF 33). |
| chapter-11-practice-01 | a / R | p.369: nearby-overview | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.372 (PDF 13). |
| chapter-11-practice-02 | b / R | p.371: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.372 (PDF 13), p.378 (PDF 19). |
| chapter-11-practice-03 | b / R | p.372: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.370 (PDF 11). |
| chapter-11-practice-04 | a / R | p.370: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.369 (PDF 10), p.370 (PDF 11). |
| chapter-11-practice-05 | b / R | p.374: supported-with-qualification | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.373 (PDF 14), p.374 (PDF 15). |
| chapter-11-practice-06 | a / R | p.375: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.376 (PDF 17). |
| chapter-11-practice-07 | b / R | p.377: background-only | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.377 (PDF 18), p.403 (PDF 44). |
| chapter-11-practice-08 | a / R | p.377: supported-with-qualification | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.377 (PDF 18). |
| chapter-11-practice-09 | a / R | p.380: background-only | The calcium detail is taught locally, but is over-sampled across media, chapter and final practice while other required evidence is missing. Preferred support: Chapter 11, p.379 (PDF 20). |
| chapter-11-practice-10 | b / R | p.382: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.382 (PDF 23). |
| chapter-11-practice-11 | a / R | p.385: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.385 (PDF 26), p.396 (PDF 37). |
| chapter-11-practice-12 | b / R | p.398: supported-with-qualification | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.397 (PDF 38), p.398 (PDF 39). |
| lesson-06-guided-01 | b / R | p.407: nearby-overview | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.408 (PDF 5). |
| lesson-06-guided-02 | b / R | p.409: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.407 (PDF 4). |
| lesson-07-guided-01 | b / R | p.412: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.410 (PDF 7), p.411 (PDF 8), p.412 (PDF 9). |
| lesson-07-guided-02 | c / R | p.415: partial-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.411 (PDF 8), p.414 (PDF 11). |
| lesson-08-guided-01 | a / R | p.421: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.421 (PDF 18). |
| lesson-08-guided-02 | b / R | p.424: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.424 (PDF 21), p.425 (PDF 22). |
| chapter-12-practice-01 | a / R | p.407: nearby-overview | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.408 (PDF 5), p.409 (PDF 6). |
| chapter-12-practice-02 | a / R | p.407: nearby-overview | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.409 (PDF 6). |
| chapter-12-practice-03 | a / R | p.408: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.408 (PDF 5). |
| chapter-12-practice-04 | a / R | p.409: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.407 (PDF 4). |
| chapter-12-practice-05 | a / R | p.412: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.410 (PDF 7), p.411 (PDF 8), p.412 (PDF 9). |
| chapter-12-practice-06 | a / R | p.413: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.411 (PDF 8). |
| chapter-12-practice-07 | a / R | p.415: partial-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.411 (PDF 8), p.414 (PDF 11). |
| chapter-12-practice-08 | a / R | p.416: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.416 (PDF 13). |
| chapter-12-practice-09 | a / R | p.420: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.420 (PDF 17), p.421 (PDF 18). |
| chapter-12-practice-10 | a / R | p.421: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.421 (PDF 18). |
| chapter-12-practice-11 | a / R | p.424: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.424 (PDF 21), p.425 (PDF 22). |
| chapter-12-practice-12 | a / R | p.425: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.424 (PDF 21), p.425 (PDF 22). |
| lesson-09-guided-01 | b / A | p.438: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.441 (PDF 8), p.442 (PDF 9). |
| lesson-09-guided-02 | a / R | p.441: partial-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.442 (PDF 9). |
| lesson-10-guided-01 | a / R | p.445: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.440 (PDF 7), p.444 (PDF 11), p.445 (PDF 12), p.448 (PDF 15). |
| lesson-10-guided-02 | b / R | p.444: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.444 (PDF 11), p.445 (PDF 12). |
| lesson-11-guided-01 | b / A | p.446: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.441 (PDF 8), p.444 (PDF 11), p.445 (PDF 12). |
| lesson-11-guided-02 | b / R | p.446: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.444 (PDF 11), p.445 (PDF 12). |
| lesson-12-guided-01 | a / A | p.449: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.448 (PDF 15), p.449 (PDF 16). |
| lesson-12-guided-02 | b / A | p.450: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.449 (PDF 16), p.450 (PDF 17). |
| lesson-13-guided-1 | b / R | p.456: supported-with-qualification | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.456 (PDF 23), p.457 (PDF 24). |
| lesson-13-guided-2 | a / R | p.453: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.452 (PDF 19), p.453 (PDF 20), p.454 (PDF 21). |
| chapter-13-practice-01 | a / R | p.437: supported-with-qualification | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.436 (PDF 3), p.437 (PDF 4), p.441 (PDF 8). |
| chapter-13-practice-02 | a / A | p.438: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.441 (PDF 8), p.442 (PDF 9). |
| chapter-13-practice-03 | a / R | p.441: partial-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.442 (PDF 9). |
| chapter-13-practice-04 | a / R | p.443: nearby-overview | The hypothalamus location can be checked on p.444; p.443 is a photoperiod feature rather than the pituitary pathway lesson. Preferred support: Chapter 13, p.444 (PDF 11), p.445 (PDF 12). |
| chapter-13-practice-05 | a / R | p.445: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.440 (PDF 7), p.444 (PDF 11), p.445 (PDF 12), p.448 (PDF 15). |
| chapter-13-practice-06 | a / R | p.445: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.444 (PDF 11), p.445 (PDF 12). |
| chapter-13-practice-07 | a / A | p.446: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.441 (PDF 8), p.444 (PDF 11), p.445 (PDF 12). |
| chapter-13-practice-08 | a / A | p.449: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.448 (PDF 15), p.449 (PDF 16). |
| chapter-13-practice-09 | a / R | p.450: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.449 (PDF 16), p.450 (PDF 17). |
| chapter-13-practice-10 | a / R | p.456: supported-with-qualification | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.456 (PDF 23), p.457 (PDF 24). |
| chapter-13-practice-11 | a / R | p.453: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.452 (PDF 19), p.453 (PDF 20), p.454 (PDF 21). |
| chapter-13-practice-12 | a / R | p.454: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.454 (PDF 21), p.455 (PDF 22). |
| final-practice-core-01 | a / A | INVALID Chapter 13/PDF -62; p.371: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.372 (PDF 13), p.378 (PDF 19). |
| final-practice-core-02 | a / R | INVALID Chapter 13/PDF -56; p.377: background-only | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.377 (PDF 18), p.403 (PDF 44). |
| final-practice-core-03 | a / A | INVALID Chapter 13/PDF -53; p.380: background-only | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.379 (PDF 20). |
| final-practice-core-04 | a / R | INVALID Chapter 13/PDF -37; p.396: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.396 (PDF 37). |
| final-practice-core-05 | a / A | INVALID Chapter 13/PDF -41; p.392: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.387 (PDF 28), p.391 (PDF 32). |
| final-practice-core-06 | a / R | INVALID Chapter 13/PDF -61; p.372: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 11, p.370 (PDF 11). |
| final-practice-core-07 | a / R | INVALID Chapter 13/PDF -25; p.408: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.408 (PDF 5). |
| final-practice-core-08 | a / R | INVALID Chapter 13/PDF -20; p.413: partial-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.410 (PDF 7), p.411 (PDF 8), p.412 (PDF 9). |
| final-practice-core-09 | a / R | INVALID Chapter 13/PDF -12; p.421: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 12, p.421 (PDF 18). |
| final-practice-core-10 | a / A | p.438: wrong-teaching-page | Thermoregulatory feedback is not a fourth eye/ear/receptor item. Reconcile the declared six/four/six/two final blueprint against actual targets. Preferred support: Chapter 13, p.441 (PDF 8), p.442 (PDF 9). |
| final-practice-core-11 | a / R | p.441: partial-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.442 (PDF 9). |
| final-practice-core-12 | a / R | p.449: partial-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.440 (PDF 7), p.444 (PDF 11), p.445 (PDF 12), p.448 (PDF 15). |
| final-practice-core-13 | a / A | p.446: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.441 (PDF 8), p.444 (PDF 11), p.445 (PDF 12). |
| final-practice-core-14 | a / A | p.450: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.449 (PDF 16), p.450 (PDF 17). |
| final-practice-core-15 | a / R | p.456: supported-with-qualification | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.456 (PDF 23), p.457 (PDF 24). |
| final-practice-core-16 | a / R | p.453: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.452 (PDF 19), p.453 (PDF 20), p.454 (PDF 21). |
| final-practice-core-17 | a / H | p.446: wrong-teaching-page | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.441 (PDF 8), p.460 (PDF 27). |
| final-practice-core-18 | a / A | p.454: direct-support | Key and alternatives read individually. Conceptual relevance is sound; see set-level position, distractor quality and feedback findings before acceptance. Preferred support: Chapter 13, p.452 (PDF 19), p.453 (PDF 20), p.454 (PDF 21). |
| final-practice-challenge-01 | a / A | INVALID Chapter 13/PDF -62; p.371: wrong-teaching-page | Same-diameter myelin comparison repeats core learning; add unfamiliar measurements to justify the Challenge label. Preferred support: Chapter 11, p.372 (PDF 13), p.378 (PDF 19). |
| final-practice-challenge-02 | a / R | INVALID Chapter 13/PDF -51; p.382: wrong-teaching-page | Asks for the net-input principle without input traces or values; does not require the intended multi-step summation analysis. Preferred support: Chapter 11, p.379 (PDF 20), p.380 (PDF 21). |
| final-practice-challenge-03 | a / A | INVALID Chapter 13/PDF -17; p.416: supported-with-qualification | Useful extension, but an actual visual-field diagram would test application more convincingly. Preferred support: Chapter 12, p.416 (PDF 13). |
| final-practice-challenge-04 | a / A | p.449: supported-with-qualification | Paired hormones are useful; add a second plausible cause or follow-up result for deeper inference. Preferred support: Chapter 13, p.448 (PDF 15), p.449 (PDF 16). |
| final-practice-challenge-05 | a / A | p.454: direct-support | Appropriate distinction from ACTH, but the normal regulation rule already answers the case. Preferred support: Chapter 13, p.454 (PDF 21), p.455 (PDF 22). |
| final-practice-challenge-06 | a / H | p.456: background-only | Strongest extension: distinguish hormone concentration from target action and hepatic output. Still needs specific distractor feedback. Preferred support: Chapter 13, p.457 (PDF 24), p.458 (PDF 25), p.459 (PDF 26). |

## Video and local-path review

English-track metadata does not prove caption accuracy, pace or scientific suitability. Automatic/generated English tracks need especially careful term checking. No YouTube audio/video file was downloaded or redistributed.

| Lesson / video | Full duration | Local objective review | Transcript status |
| --- | --- | --- | --- |
| lesson-01 / [A44brRGG4Ys](https://www.youtube.com/watch?v=A44brRGG4Ys) | 5:55 | The four steps support the direction checkpoint, but a short sequence is not an illustrated neuron lesson. Add labelled neuron parts, myelin and a worked path. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-02 / [oa6rvUJlg7o](https://www.youtube.com/watch?v=oa6rvUJlg7o) | 13:11 | The channel sequence supports the checkpoint. Put the actual voltage graph beside the walkthrough with a phase-by-phase worked reading; numbered text boxes are not graph practice. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-03 / [YcJy28Nnrb8](https://www.youtube.com/watch?v=YcJy28Nnrb8) | 8:00 | The sequence and calcium checkpoint are consistent. Show terminal, cleft, receptor and termination on an ordered diagram, not only four captions. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-04 / [QY9NTVh-Awo](https://www.youtube.com/watch?v=QY9NTVh-Awo) | 10:01 | The efferent checkpoint is supported locally. The publisher's chapter list spends substantial time on pain/receptors before afferent/efferent pathways; use a reviewed segment and explicit term preparation. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-05 / [0-8PvNOdByc](https://www.youtube.com/watch?v=0-8PvNOdByc) | 5:05 | Local text supports a cautious cerebellum inference but omits labelled pons/medulla detail. The publisher transcript is reviewable and needs contextual corrections before full-clip required use. | [Publisher text reviewed](https://nida.nih.gov/videos/human-brain-major-structures-functions) — Supports lobes, cerebellum, pons and medulla. Broad claims linking cortical folding with intelligence and the unqualified pituitary master-gland description are unsuitable as learner rules. Reward-circuit, reproductive and pineal material exceeds this lesson's prepared terms. Review an anatomical segment with local qualifications rather than approving the full clip solely because NIH published it. Playback and displayed-caption accuracy were not observed. |
| lesson-06 / [qPix_X-9t7E](https://www.youtube.com/watch?v=qPix_X-9t7E) | 10:35 | Local transduction steps answer the checkpoint. This is a general nervous-system introduction, not proof of complete receptor/adaptation coverage; review the exact sensory segment before making the full clip a required alternative. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-07 / [o0DYP-u1rNM](https://www.youtube.com/watch?v=o0DYP-u1rNM) | 9:39 | Optics and neural processing are correctly separated. Full eye structures, retina and a light-versus-signal worked pathway must be visible in the local alternative. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-08 / [Ie2j7GpC4JU](https://www.youtube.com/watch?v=Ie2j7GpC4JU) | 10:40 | Hair-cell conversion is correct. Add the actual labelled ear, cochlear movement and equilibrium diagrams; the current four captions cannot replace them. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-09 / [eWHH9je2zG4](https://www.youtube.com/watch?v=eWHH9je2zG4) | 10:25 | Target-cell specificity is accurate. Add a receptor-bearing/non-target comparison and hormone-route diagram. Keep later hormones outside this checkpoint unless introduced. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-10 / [QHkGG4TimvQ](https://www.youtube.com/watch?v=QHkGG4TimvQ) | 4:08 | The TSH checkpoint is supported. Add a source-target-effect diagram and restrict required review to Unit A hormones; the complete clip needs an out-of-unit hormone screen. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-11 / [BYaR-JgbjCs](https://www.youtube.com/watch?v=BYaR-JgbjCs) | 3:37 | The checkpoint correctly separates ADH synthesis from release. The detect→make sequence can imply immediate new synthesis; explain pre-existing stores and regulated release. Oxytocin appears in the fallback without helping this ADH checkpoint. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-12 / [cDGmsR2ZILE](https://www.youtube.com/watch?v=cDGmsR2ZILE) | 4:03 | The four sentences support the feedback answer but are not a complete illustrated alternative. Add the thyroid loop, a paired-value example and explicit limits on disorder interpretation. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-13 / [y9Bdi4dnSlg](https://www.youtube.com/watch?v=y9Bdi4dnSlg) | 2:10 | Local beta/alpha and target-specific wording is sound. Include the glucose loop and a worked meal/fasting comparison; verify the clip does not generalize insulin-dependent uptake to every cell. | Not completed; caption endpoint returned no text. Do not mark passed. |
| lesson-13 / [v-t1Z5-oPtU](https://www.youtube.com/watch?v=v-t1Z5-oPtU) | 4:42 | Local rapid-versus-longer sequence answers the checkpoint but is not a visual stress-pathway explanation. Verify full transcript scope and timing; chronic-stress health claims are not diagnoses or proof of the ACTH sequence. | Not completed; caption endpoint returned no text. Do not mark passed. |

## Every remaining structural gap

These judgments supersede the earlier gap reasons only where explicitly corrected below. The original records remain intact. An outcome roll-up and its detailed example are not separate activities to add.

| Gap record(s) | Reviewed disposition | Evidence and next operation |
| --- | --- | --- |
| behaviour-a1-1k-05; outcome-a1-1k | delivery-decision | Neuron teaching and new labelling tasks are present. Microscopy is an acceptable example, not itself the wording of the knowledge outcome. Record whether actual observation, a prepared micrograph or a teacher-approved alternative demonstrates the intended identification; do not claim a schematic proves microscope use. (AR-08) |
| behaviour-a1-3k-03; outcome-a1-3k | delivery-decision | The withdrawal pathway is taught and now has a saved structure/role task. The ruler-drop procedure is reaction time. Confirm the teacher's safe practical method or accommodation before claiming reflex performance; preserve the existing response ID when correcting the title. (AR-08) |
| behaviour-a1-3k-04 | excellence-example-reclassify | Designing the reflex activity is in the excellence column. Retain an optional design opportunity where appropriate, but do not add a new core completion condition to repair this misclassification. (AR-06, AR-08) |
| behaviour-a1-4k-01; behaviour-a1-4k-03; outcome-a1-4k | core-evidence-repair | Use the existing eye model and figure for an explicit identification/function response covering the curricular structure list. The light and rods questions remain useful but do not cover sclera, choroid, fovea, optic nerve and the whole eye. Pair labels with function, not a second passive diagram. (AR-07) |
| behaviour-a1-4k-04 | delivery-decision | The existing two-point skin activity does not demonstrate visual discrimination. Choose an accessible visual task with controlled viewing conditions and non-diagnostic limits; do not assume this illustrative procedure mandates one particular test. (AR-08) |
| behaviour-a1-5k-01; behaviour-a1-5k-03; outcome-a1-5k | core-evidence-repair | Add active whole-ear identification/functions within the current hearing model. Include pressure equalization and Eustachian tube, plus the sound and balance pathways; two hair-cell/rotation questions cannot establish full coverage. (AR-07) |
| behaviour-a1-5k-04 | delivery-decision | Synthetic hearing data support interpretation, not actual safe listening-tool performance. Ask the teacher to select a procedure or explicit accessibility alternative; never require louder sound to pass or infer a diagnosis. (AR-08) |
| behaviour-a2-1k-01; behaviour-a2-1k-02; outcome-a2-1k | core-evidence-repair | Use the accepted gland map with a source-identification task for the required endocrine structures and hormones. Separate hormone production from storage/release. One shared task may support these overlapping records without three duplicate activities. (AR-07) |
| behaviour-a2-2k-01; outcome-a2-2k | core-evidence-repair | Extend the same hormone record to target tissue and response, including receptor specificity, ACTH/cortisol and calcitonin. An answer key and explicit criteria are needed; a source-target-effect table supplied by the course is teaching, not a learner response. (AR-07) |
| behaviour-a2-3k-01; outcome-a2-3k | core-evidence-repair | The integration prompt needs explicit criteria linking growth, metabolic rate, glucose, water, sodium and calcium to named hormones. Preserve manageable prompts and use shared evidence, rather than expanding the core into all possible endocrine interactions. (AR-07) |
| behaviour-a2-3k-02; behaviour-a2-3k-03 | excellence-example-reclassify | The specific comparisons and other-hormone glucose hypothesis are excellence examples. Review existing advanced stress/calcium/glucose cases against these operations before adding anything. Required hormone roles remain core even though these particular extensions are optional. (AR-06) |
| behaviour-a2-6k-02; outcome-a2-6k | core-evidence-repair | Match imbalance teaching and sample evidence to the exact curricular expectations, with cautious source-target reasoning. Do not expand to a diagnostic catalogue or claim every rare disorder/treatment is required. Current thyroid and ADH cases alone are not the complete inventory. (AR-07) |
| behaviour-a2-6k-03; outcome-a2-1s | inquiry-evidence-repair | The supplied-data investigation needs a clear investigable question, prediction and manipulated/responding/controlled-variable reasoning. Distinguish an experiment from an observational comparison. Reuse its existing saved response and provide a worked start. (AR-09) |
| behaviour-a2-6k-04 | excellence-example-reclassify | The published environmental-endocrine hypothesis task is an excellence example, not a uniquely mandated extra core task. If retained, provide a traceable rights-cleared dataset and distinguish association from causation; synthetic values cannot be described as published. (AR-06, AR-09) |
| behaviour-a1-4s-01; outcome-a1-4s; outcome-a2-4s | communication-evidence-repair | The stored behaviour ID is local, but the underlying communication/teamwork outcomes are real. Include a comparison and justified revision with a partner/teacher route, or a teacher-approved independent alternative whose limits are explicit. Do not infer teamwork from saved numbers. (AR-06, AR-09) |
| outcome-a1-1sts | inquiry-evidence-repair | Use the synapse worked example to ask which observation supports a hypothesis and what new evidence would change it. A course-authored explanation alone does not show the learner evaluating or revising scientific knowledge. (AR-09) |
| outcome-a1-3sts | technology-evidence-repair | Connect the eye lesson's technology example to an actual benefit/constraint/trade-off response. Name the evidence needed to choose a design; a passing reference to corrective technology is insufficient. (AR-09) |
| outcome-a1-3s | data-evidence-reconcile | The new voltage-label task includes a quantitative difference, so the earlier absence-of-calculation implication is superseded. Independent action-potential graph drawing is an excellence example. Audit the broader required data-analysis skills separately and offer drawing in the appropriate extension; do not remove graph work altogether. (AR-06, AR-10) |
| outcome-a2-1sts; outcome-a2-2sts | technology-evidence-repair | Use the diabetes monitoring/treatment discussion for a source-backed benefit, limitation and intended/unintended consequence task. Keep this evaluation educational rather than personal treatment advice. One well-designed case can support both outcomes. (AR-09) |
| outcome-a2-2s | delivery-decision | Clarify which information-gathering tool or method the learner actually uses. Reading a supplied plot does not show measurement or tool choice, but the course need not require unsafe hormone manipulation. Record a feasible teacher-approved data gathering or research method. (AR-08, AR-09) |

## Sources, limits and continuation

Required content comes from the [Program of Studies](https://education.alberta.ca/media/159727/bio203007.pdf). The [performance examples](https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf) are illustrative and must retain their source column. Independent action-potential graph construction appears in the excellence column; that does not remove the broader core data-analysis outcome or the teacher's request for graph work.

The [Biology bulletin linked by Alberta](https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf) still identifies itself as 2025–2026. Recheck through the [official support page](https://www.alberta.ca/writing-diploma-exams) before release.

The book is not infallible. Its p.440 thyroxine classification and simplified pump/autonomic descriptions must not override corrected science. Use the local correction and primary textbook explanations such as [OpenStax synaptic communication](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-5-communication-between-neurons) and [hormone mechanisms](https://openstax.org/books/anatomy-and-physiology-2e/pages/17-2-hormones).

The previous 36 gap records overlap. They are retained, not all promoted to mandatory lab requirements or dismissed because a few rows were misclassified. Distinguish missing teaching, missing response opportunities, actual practical performance, optional depth and teacher decisions.

State has only 1,716 characters of ordinary-text estimator headroom. Do not add a large set of response fields, truncate prior writing, or raise limits as an academic repair shortcut. Escaping/non-ASCII cases and the last-valid-state guard still require appropriate engineering review before new state is introduced.

No new visual/E2E run is needed for these report-only changes; the previously inspected learner hash is unchanged. This does not certify live Brightspace, full-clip pacing, student comprehension or teacher acceptance.

Machine record: [remaining-academic-review.json](./remaining-academic-review.json). Earlier evidence inventory: [final-academic-review.json](./final-academic-review.json). Reproduction and future B–D precautions: [canonical playbook](../../biology30-unit-a-pilot/meta/unit-a-to-bcd-improvement-playbook.md).

Freshness check: `npx tsx scripts/review-biology30-unit-a-pilot-2-academic.ts --check`. A learner or reviewed-source change invalidates these exact-build judgments.
