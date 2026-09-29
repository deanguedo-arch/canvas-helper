# CALM complete lesson authoring contract

Status: complete authoring candidate; implementation not started. Date: 2026-09-28. This folder is a frozen implementation specification for Sol after authoring review; the live editable course remains `../../workspace/index.html`. Do not load these Markdown files as learner runtime content. No packaging, deployment, learner-source edit or teacher/LMS setup is authorized by this authoring pass.

## Accepted decisions

- Author all 39 remaining lessons in full using `../../workspace/co1-01-review.html` as the approved depth and presentation example. Preserve CO1-01 B for later integration.
- The content must work independently. No teacher feedback, external assignment submission, myBlueprint login or supervised placement is required to complete it. The user accepts the supervised-experience curriculum gap; record it honestly in author metadata.
- Existing 40 routes, approximate 75-hour design budget and assessment reference map remain. Completion means reviewed lesson work, not demonstrated mastery or a teacher grade. Never invent an automated writing grade.
- Teach the situation, vocabulary and document before requiring their use. Every instruction has an adjacent control. Meaningful choices and calculations receive specific feedback. Writing receives an explained model, self-checks and revision.
- Distinguish supplied fiction from verified official facts. Required inquiry must be possible using the in-course dated source record; direct official pages support current verification without an account. If a current fact cannot be verified, omit the unsupported claim and teach a complete fictional case instead. Do not invent a dated institutional prerequisite.
- Keep optional references collapsed beside the roadmap and vocabulary; insert any actual source task after context. No generic early required-source stop. No learner PDF detours.
- Retain approved user images. Use editable document HTML for evidence; image/diagram captions and alt text are authored in each packet. Video is optional unless an accurate equivalent, reviewed boundaries and captions are established. Pending media review cannot be an essential learning dependency.
- All learner text is original or an attributed, limited adaptation. No substantial verbatim copying from outside sources. Each selected source must be opened/read, with exact title, URL, relevant section, retrieval date, and specific teaching use recorded.

## Route and ownership

Astra lead owns the contract, mathematics, saving design, outcome integration and acceptance. An explicitly selected Astra Ultra worker owns bounded lesson-script files assigned by the lead. Existing deterministic tools collect inventories and check arithmetic/structure. Muse/Sol are not used to author instructional prose: the user selected Astra for all copy. The course boundary is already dirty; preserve it. Savings and provider-cache telemetry are unknown.

## Required lesson-file structure

Create `lessons/<existing-lesson-id>.md`. These are complete scripts, not outlines. Use the following headings so the package can be checked. Text beneath numbered headings is learner-facing except clearly labelled implementation specifications.

1. `## 1. Start here` — purpose, situation, expected product, brief flexible duration/pauses, accurate roadmap with final section names. Explain what is practice and what becomes final saved evidence.
2. `## 2. Meet the situation and read the documents` — introduce every character, document, term and relevant constraint. Supply complete realistic documents before the first question about their contents. Include a small document-reading check with response options and specific feedback.
3. `## 3. Learn the method` — several connected paragraphs with lesson-specific subheadings, clear definitions, examples/nonexamples and transitions. This section must actually teach why/how; short lists of commands alone are insufficient. Include an optional first-step hint and a second representation, such as a text diagram or explained table.
4. `## 4. Follow a complete example` — narrator traces supplied facts, explains steps, produces a complete response and diagnoses an unsupported alternative. All facts used must appear in the documents. Models cannot be the first source of a required fact.
5. `## 5. Practise with support` — establish exactly what stays the same/changes; supply missing facts, exact prompts and labelled controls, a useful hint, targeted check feedback, a complete matching model and an explicit revision action. At least one answer must require actual construction/calculation rather than only recognising a choice.
6. `## 6. Check your understanding` — six fully authored four-option questions, answers and option-specific rationales. Use keys `practice:<lesson-id>:q1` through `q6`, new task version. Avoid answer-position patterns; questions extend taught ideas, never introduce unknown rules.
7. `## 7. Apply independently` — genuinely new case, complete documents, one coherent final product, exact fields, unit/length guidance, supplied success criteria and a complete model under a freely available comparison disclosure. Do not expose required numeric answers in the question. Do not ask for outside personal information. If multiple answers are defensible, show why and specify what evidence makes them acceptable.
8. `## 8. Review and complete` — exact criterion checkboxes; Complete lesson / Reopen lesson; no arbitrary correctness gate for writing; a short next-lesson connection. Required criteria correspond to the independent product, not generic effort statements.
9. `## Implementation specification` — exact field keys, types, requiredness, feedback actions, accepted numeric answers/tolerances, old activity reuse/removal, media placement/caption/alt, lesson-specific source role, and outcome IDs with precise evidence locations.
10. `## Sources and adaptation` — official sources with section/use/retrieval evidence; exact FINLIT or myBlueprint files/passages actually used, or explicit original authorship with unselected candidates kept as archive. Never claim to have inspected a source not read.

## Controls and data defaults

- Task version for this set: `2026-09-28.astra.1`. Preserve previous wording and responses before later promotion.
- Keep the existing lesson evidence key `<lesson-id>` for the final constructed response. Extra final fields use `evidence:<lesson-id>:<part>` and belong to that same lesson's evidence group.
- Existing guided part keys may be retained with the new task version; use `guided:<lesson-id>:part1`, `part2`, `part3`, additional parts and `match` as needed. A field label must describe the requested answer; no generic “use the case” placeholders.
- Intro check: `check:<lesson-id>:document`. Six retrieval keys as above. Each controls table specifies key, visible label, type, required/optional, and exact choice options where applicable.
- All fields auto-save. Reading a model or checking a practice answer does not complete the lesson. Complete requires populated required independent fields and all sign-offs. Reopen or independent edits clear sign-offs/completion but keep responses.
- Same learning target for alternative access: text is complete, visuals have meaningful text equivalents, optional audio/video repeats or demonstrates a defined concept. No learning-style labels.
- No mandatory live discussion, interview with another person, sending messages, purchases, account signup or disclosure of a real financial profile.

## Writer acceptance

Read the entire lesson as a first-time student. Verify names/figures/timing; every calculation independently; every action/control; all exact external facts; prompt/label/model/criteria agreement; guided and independent separation; meaningful misconception feedback; next-step continuity. Do not mark copy complete merely because headings or field counts exist. No `TBD`, TODO, “add example”, “write feedback”, undocumented source claims or unresolved answer keys in a completed packet.
