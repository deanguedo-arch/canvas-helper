# CALM 10: Career and Life Management — authoring contract

## Required CALM teaching standard

Dean adopted the accepted CE1-03 teacher narrative as the CALM authoring and review standard on 2026-10-05. Before changing a lesson, read meta/calm-teaching-standard.json and its paired authoring/review rules under meta/teaching-overhaul/calm-standard-v1/. Use the complete accepted CE1-03 manuscript as the exemplar. Teach purpose, concepts and document reading; model the reasoning and connect transitions before gradually handing responsibility to the student. Full reading governs quality; structural counts only protect compatibility.

The standard is scoped to CALM. It does not alter the generic global scaffold or promote defaults to other courses. Dean approved course-wide Version B revision 4 as the sole active CALM course on 2026-10-05. All forty lessons are integrated in canonical workspace HTML. Future changes are made directly there; the A/B assemblies and manuscripts are historical review records, not regeneration owners.

## Current source and scope

- Workflow: generated-course; current authoring owner: direct-workspace-v1.
- Canonical learner content: `projects/calm10-2026-draft/workspace/index.html`. Visible teaching, documents, models, questions, media and resource links are editable static HTML.
- Presentation: `styles.css`, `co1-01-review.css`, `authored-lessons.css`, `stage-headings.css` and `course-shell.css`. Keep the approved Math-aligned shell, dark grouped sidebar, course typography, prominent stage headings and collapsed help/reference rows.
- Behavior: `course.js`, `activities.js`, `authored-lessons.js`, `vocabulary.js`, `case-reader.js`, `resource-reader.js`. Use script references in canonical HTML to distinguish active behavior from earlier retained scripts.
- Status: active Build-mode review candidate. SCORM remains disabled; no rollout, packaging, deployment or live LMS certification is implied.
- Approved CO1-01 B is implemented. All 40 lessons now teach essential concepts and a basic procedure before their first case question. Thirty-nine have a visible, individually authored foundations section before the original case; CE1-04 teaches its revised opening and method before the records. Case-dependent explanations remain beside the records they use, followed by modelling, practice, checks, independent application and review/completion. There are 186 vocabulary definitions and four terms named for each lesson.
- `meta/astra-authoring/**` is the instructional specification. `meta/implementation/**` contains one-time migration records, backups and focused evidence, not regeneration owners. Never rerun a baseline migration over current HTML.

## Learner state and completion

- Preserve `calm10-2026-draft:learning:v3` and retained response keys. Schema 3 now has typed checkbox state, task versions, completion records and historical prompt/answer association. Unknown response keys remain in backups.
- Main evidence keys remain the 40 lesson IDs. Each lesson may also have structured final fields. Completion requires final fields and four learner signoffs; it is self-review, not an automatic writing grade or Brightspace completion.
- Editing final work reopens completion/signoffs. Editing guided practice or a FINLIT check does not erase an otherwise completed final task.
- Changed prompts retain earlier answers with earlier wording through the static historical registry. Never relabel old work with a new case. Archived review pages retain their separate namespace; do not merge their work into canonical saving. CE1-05 uses the Alberta course task version `2026-10-05.alberta-course-review.2`; the prior canonical instructions and answers remain associated in Earlier Work.
- Preserve automatic-saving status, staged/confirmed restore, pre-migration backup, quota failure handling and cross-tab conflict protection. Keep vocabulary state, historical source checkpoints and v1/v2 legacy drafts separate.
- Current task versions are recorded on fields. FINLIT practice uses `2026-09-28.finlit.1` and `media:<lesson-id>:notice`; these carry no final-evidence attribute.

## Sources and professional media

- The user confirmed educational reuse/adaptation permission for the supplied FINLIT collection. Preserve professional material and user-supplied replacement videos when revising teaching.
- Current media: 17 selected FINLIT excerpts plus six other lesson demonstrations, 23 placements total. Each FINLIT clip follows the case/method introduction, has a specific viewing purpose, a saved question with response-specific feedback, and connections to the example, guided practice and final task.
- The approved eight-source FINLIT dispositions are implemented. CE1-03/FL3-04 use the reviewed flows; compounding is optional in FL3-04. CE1-01 distinguishes suggestions from evidence; FL2-01 has optional FCAC product-cost inquiry; FL4-02 classifies three supplied requests and FL4-05 applies current CRA reporting guidance beside Nico. Résumé, paycheque and phone-device PDF tasks are archived rather than assigned in mismatched lessons. Original PDFs are unchanged; relevant question links are optional provenance.
- Label original handout tasks and course adaptations distinctly. Do not silently add personal surveys, old external-link research, a résumé, a 20-item fraud list or retirement assumptions to lesson requirements.
- Compounding Q3 starts with $500, then compares $40/$60 monthly for 40 years at a hypothetical 5% effective annual growth converted monthly, month-end deposits and zero fees/inflation. It is optional in FL3-04. Ari/Devon’s FL3-06 revision cases supply no interest. Never import an assumed return into their answers.
- Preserve differences between demonstrations and current tasks. FL2-03 video uses semi-annual conversion/full precision; Alex’s course schedule uses exactly 1% monthly and monthly cent rounding. The introductory explanation distinguishes them.
- Exact integration copy and provenance: `meta/implementation/finlit-integration.json`. Earlier FINLIT inventories, PDF audit, adaptation and media-candidate manifests remain source evidence. Original media bytes are unchanged; new `.poster.jpg` files are frames extracted at one second from the existing clips.
- Professional production and local integration review are different facts. Automated captions need audio review; three teacher-supplied replacement videos retain written equivalents and need matching synchronized captions. Do not reconnect superseded caption tracks.
- Every lesson supplies the facts needed for its course task. Named official links remain in collapsed references, with current-rule limits stated in teaching. External reading is optional for the implemented authored sequence. Older required-source spine, stop and checkpoint manifests describe superseded versions; do not reintroduce their completion requirements.

## Authoring protections

- Keep stable IDs, `data-canvas-helper-course-title` and durable edit keys. Add routine text, links and images to canonical HTML; attach behavior without replacing teacher-editable content after load.
- Keep scene images contextual and required case facts in accessible HTML. Preserve the teacher-approved safety-sequence, career-planning and library-floor-plan PNGs.
- Do not edit raw sources or exported packages. Declare new learner assets in `meta/project.json`; preserve the editability contract and existing release flags.
- Keep the 40 lessons and assessment weights. Approximately 75 hours remains a design estimate pending trials; optional experiments do not become hidden requirements.
- No teacher interaction, myBlueprint login, outside submission or supervised experience is a learner dependency in this SCORM-content scope. The accepted supervised-participation outcome gap remains documented; simulation is not evidence that supervised work occurred.

## Verification cadence

- Build: inspect changed content and desktop/mobile surfaces. Run focused risk checks only for altered saving, feedback, calculations or preview defects.
- Static guard: `node projects/calm10-2026-draft/meta/verify-instructional-repair.cjs`.
- Evidence: `meta/implementation/{focused-checks,calculation-checks,failure-checks,finlit-checks}.json`. Do not rerun passing suites merely to refresh reports.
- Separately requested rollout: accumulated accessibility/media review, Studio lifecycle, doctor/workspace verification, new-course readiness and learner E2E. Package only when authorized. Local/browser evidence is not Brightspace proof.

## Approved FINLIT integration continuation

- Canonical teaching is static in index.html, with scoped finlit-integration.css and feedback-only finlit-integration.js. Do not load finlit-review.js into the course.
- CE1-03 and FL3-04 changed fields use task version 2026-09-28.finlit-integrated.1; evidence keys and course namespace remain stable. Prior versioned prompts and retired responses are retained in Earlier Work. Other lessons retain their current final task versions.
- The comparison page is a historical review record. Its A screenshots precede integration; current course links open the approved implementation. Do not regenerate those historical screenshots from the new course.
- Latest focused Build proof and source snapshot: meta/implementation/finlit-integration-2026-09-28/. Do not rerun apply.cjs. Full rollout gates remain deferred.

## Reviewed teaching support adapted across the course (2026-10-01)

Dean approved the FL2-03 teaching pilot and requested the same support for the remaining lessons. Static index.html now owns 39 lesson-specific support records, selected-mistake hints, 117 next-task links, and labelled first-independent-copy controls. learning-support.js attaches formative behavior through those records; course.js remains the sole saved-work/history/completion owner. FL2-03 retains its exact reviewed article and fl2-03-pilot.js behavior. Professional videos, transcripts and handouts remain in place.

New support save fields are additive and unversioned; existing task versions, field IDs, options, answers and historical wording are unchanged. A different wrong answer adds method support and optional worked reasoning; unchanged repeated checks do not advance support. Writing remains self-reviewed. First independent entries are kept at an explicit review action, independent calculation check or first comparison-model opening, and remain separate from current editable responses. Keep existing model/response adjacency intact.

Evidence and the pre-adaptation snapshot: meta/implementation/teaching-support-2026-10-01/. apply-once.cjs is a historical initial adaptation script, not a regeneration owner; later static corrections are canonical in index.html. Do not rerun it or restore a whole Before index. One existing FL3-04 pair of checks shares an answer save key; their new attempt records are separate. Correcting that older answer-key overlap requires a separately scoped migration.

Local Build checks cover the changed controls, retained attempts/copies, completion/history compatibility and selected desktop/phone views. Broader accessibility/media, Studio, full learner E2E, SCORM/export and Brightspace remain deferred to a separately requested rollout. No packaging, publishing or standards promotion occurred.

## Approved instruction presentation across all lessons (2026-10-01)

Dean approved CE1-01’s visible actions plus expandable guidance and requested adoption across the course. All 40 lessons now have three labelled instruction areas: reading the worked example, building the guided response and completing the independent task. Numbered steps refer to each lesson’s actual records and response fields. Essential task requirements, case documents, facts and completed worked examples stay visible; definitions, reminders, media connections and additional feedback sit under initially closed “Show more guidance.” Existing hint and comparison controls remain available. The three instruction areas use cream, pale green and light green-white tones matching their containing sections.

The approved CE1-01 HTML is unchanged by this propagation. All saved fields, task versions, options, answer controls, models, completion sign-offs, media and original edit keys are retained. course.js, learning-support.js and fl2-03-pilot.js were not changed. Native guidance dropdowns have no saved learner state and contain no response controls. Source/render evidence and the pre-change snapshots are in meta/implementation/course-instructions-2026-10-01/. Its scripts and copy file are historical adaptation records, not regeneration owners; subsequent static HTML refinements remain canonical. Broad rollout gates remain deferred.

## Accepted CE1-03 teacher narrative (2026-10-05)

Dean accepted Version B of the complete CE1-03 pilot. Its exact reviewed article is integrated into canonical index.html: connected teaching from the opening question through document reading, Leah’s Route A think-aloud, Route B practice and Owen’s new application; shared CALM vocabulary disclosure; corrected model preference and explicit trade-off. No other lesson changed. All original response/control IDs, task versions, media, documents, history and completion requirements remain unchanged. No response migration was necessary because tasks/prompts are unchanged.

The preserved A/B comparison and manuscript are in meta/teaching-overhaul/ce1-03-teacher-narrative-v1/. Its canonical-integration/ records the pre-edit snapshot, source preservation and focused synthetic completed-work restore checks. Proposal scripts and initial comparison checks are historical checkpoint tools, not canonical regeneration owners. Do not rerun them over newer work. Current authoring remains workspace/index.html. Acceptance is scoped to CE1-03; no wider lesson adoption, course-standard promotion, packaging or release approval is implied.
