# CALM 10: Career and Life Management — authoring contract

## Current source and scope

- Workflow: generated-course; current authoring owner: direct-workspace-v1.
- Canonical learner content: `projects/calm10-2026-draft/workspace/index.html`. Visible teaching, documents, models, questions, media and resource links are editable static HTML.
- Presentation: `styles.css`, `co1-01-review.css`, `authored-lessons.css`. Keep the Biology-style shell, dark grouped sidebar, course typography and collapsed help/reference rows.
- Behavior: `course.js`, `activities.js`, `authored-lessons.js`, `vocabulary.js`, `case-reader.js`, `resource-reader.js`. Use script references in canonical HTML to distinguish active behavior from earlier retained scripts.
- Status: active Build-mode review candidate. SCORM remains disabled; no rollout, packaging, deployment or live LMS certification is implied.
- Approved CO1-01 B is implemented. The other 39 lessons use the Astra scripts: introduce the task, supply the case, teach the method, model it, practise, check, apply independently, and review/complete. There are 160 vocabulary definitions and four terms named for each lesson.
- `meta/astra-authoring/**` is the instructional specification. `meta/implementation/**` contains one-time migration records, backups and focused evidence, not regeneration owners. Never rerun a baseline migration over current HTML.

## Learner state and completion

- Preserve `calm10-2026-draft:learning:v3` and retained response keys. Schema 3 now has typed checkbox state, task versions, completion records and historical prompt/answer association. Unknown response keys remain in backups.
- Main evidence keys remain the 40 lesson IDs. Each lesson may also have structured final fields. Completion requires final fields and four learner signoffs; it is self-review, not an automatic writing grade or Brightspace completion.
- Editing final work reopens completion/signoffs. Editing guided practice or a FINLIT check does not erase an otherwise completed final task.
- Changed prompts retain earlier answers with earlier wording through the static historical registry. Never relabel old work with a new case. Review pages retain their separate namespace.
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
