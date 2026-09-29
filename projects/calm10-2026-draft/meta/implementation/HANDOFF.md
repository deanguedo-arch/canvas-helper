# CALM 10 authored implementation and FINLIT integration — 2026-09-28

- **Project:** calm10-2026-draft.
- **Task:** Implement the approved 40-lesson authoring plan, preserve professional resources, and integrate them into students’ actual tasks.
- **Status:** Building; usable local preview. No packaging, deployment, release flag change or LMS certification.

## What changed and why

The approved CO1-01 B lesson and 39 Astra lesson scripts are now static canonical HTML. Each introduces the situation and documents before questions, teaches a method, supplies models and guided practice, and ends with aligned independent fields and four signoffs. The existing shell, 40 main evidence keys and separate review storage remain. Completion becomes visible in the sidebar and is reopened when final work changes.

The initial implementation accidentally omitted the earlier video sections. User correction prompted restoration of all 21 earlier placements, then restoration of two further selected FINLIT clips (employment skills and saving tips): **17 professional FINLIT excerpts plus six other demonstrations**. The original media files were preserved. Every FINLIT clip now has a viewing purpose, response-specific case check, and explicit connections to the model, guided practice and final task. Eight selected original assignment PDFs are available after the worked examples, with specific supplied-case adaptations. Posters are actual frames from the existing clips.

## Files changed / source of truth

- Learner owner: `workspace/index.html`.
- State/navigation/completion: `workspace/course.js`; calculators: `workspace/activities.js`.
- Authored controls and course-style additions: `workspace/authored-lessons.js`, `workspace/authored-lessons.css`.
- Existing vocabulary, case and resource readers remain active. New FINLIT question controls reuse authored choice feedback and existing automatic saving.
- New posters: `workspace/assets/finlit/*.poster.jpg`; these are declared in `meta/project.json`.
- Current operating contract: `meta/prompt-pack.md`; media/question/handout provenance: `meta/implementation/finlit-integration.json`.
- `meta/astra-authoring/**` is the authored specification. `meta/implementation/*.cjs` migration scripts are **one-time records**, not rebuild owners. Never run baseline migration scripts over canonical HTML.

## Verification run

- Focused structural guard passes: 40 routes, stable main keys, four signoffs each, authored sequences/models, optional references, valid internal links; now also 23 videos, 17 FINLIT checks/connections and eight handout links.
- `focused-checks.json`: completion/reload, practice versus final edits, typed signoffs, cancelled/corrupt restore, cross-tab protection, earlier-prompt migration, unknown keys, loan/debt/saving behavior.
- `calculation-checks.json`: 19 loan, mortgage, debt and saving fixtures pass.
- `failure-checks.json`: quota errors preserve in-memory text without claiming completion; CO1 B match/document feedback and vocabulary dialog pass.
- `finlit-checks.json`: all earlier video sources and save keys retained; final fields/versions unchanged by media integration; alternative-specific feedback, answer persistence without completion, playback advancement for FL3-06 and both restored clips, PDF reader/image/focus return, Q3 saving preset, no page errors.
- Changed desktop/mobile screenshots inspected under `meta/implementation/screens/`; FL3-06 media/reader and CO1-01 media fit without horizontal page overflow. Earlier implementation checks sampled seven module representatives. These are local checks, not comprehensive accessibility or LMS proof.

## Fragile areas / known risks

- Preserve `learning:v3`, `vocabulary:v1`, review isolation, historical source state, stable keys and original-prompt history. Final task versions and historical prompt mappings must travel together. Unknown earlier wording is labelled unavailable, not replaced with current wording.
- Save/restore, completion and calculator fixes are already applied. Do not repeat old handoff instructions to implement them again.
- Some video examples use different names, dates or assumptions. Their introductions now explain the differences. FL2-03 video uses semi-annual conversion/full precision; Alex’s lesson schedule uses exactly 1% monthly and cent rounding. FL3-06 compounding does not create interest in Ari/Devon’s zero-interest cases.
- The eight original PDFs are captured assignment pages. In-course adaptations identify which question idea is being used and where to respond. Original PDF controls do not submit work. Research/survey/retirement extensions are not hidden prerequisites.
- Full clip audio/visual review and automated-caption correction remain deferred. The three user-supplied long replacement videos still need matching synchronized captions; existing written equivalents are not verbatim transcripts. Never attach old superseded tracks.
- Preserve the approved replacement PNGs and professional media on every future rewrite. Original asset inventory alone is not enough: retain visible lesson placements too.
- Course metadata remains active, SCORM disabled, as found. Approximately 75 hours is still a design budget; learner workload and engagement have not been trialled. The accepted supervised-participation gap remains documented without making it a learner dependency.

## Routing actually used

Lead retained instructional judgment, dirty canonical integration, saving/math compatibility and acceptance. Deterministic scripts handled migration and checks. Native Luna High investigated calculators/state earlier and the eight PDFs in this continuation; both results were reviewed and admission leases released. The FINLIT scout’s local context cache was a miss. Provider cache and usage savings were not measured. Muse was not eligible for this dirty instructional boundary.

## Next prompt should assume / deferred checks

Continue Build mode in canonical HTML. External references are optional in the implemented self-contained sequence; earlier required-source stop/spine manifests are historical. No teacher support, login, external submission or supervised experience is required by the online tasks.

At a separately requested rollout: accumulated accessibility/media review, Studio editability/reversible lifecycle, course doctor/workspace verification, new-course readiness, learner E2E and authorized packaging. Real Brightspace validation is outside the present content request. Local results do not certify it.

## Exact next action

Await the next requested change. The user can review the integrated FINLIT section in `http://127.0.0.1:4189/index.html#fl3-06` after refreshing.

## Exact next file to open

`projects/calm10-2026-draft/workspace/index.html` at `#fl3-06-finlit`.
