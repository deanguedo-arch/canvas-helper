# CALM 10 — FL2-03 pilot and floating calculator handoff

Updated: 2026-10-01. This is continuation guidance for Dean’s pinned CALM 10 Codex chat. Inspect the existing work; do not regenerate the course.

## Current source and review status

Canonical project: `projects/calm10-2026-draft`. Canonical learner source: `projects/calm10-2026-draft/workspace/index.html`, lesson `#fl2-03` (Read a loan payment schedule). The static, teacher-editable workspace is authoritative. Archived CALM variants and the older standalone module are not the current full course.

Dean reviewed the bounded teaching pilot and said it did not change much but was good. He then requested a calculator that opens in the browser, can be moved/resized, closed and brought back. That calculator request is implemented and verified. Neither conversation authorizes a course-wide teaching rollout, universal standards promotion, migration or regeneration.

Local landing page: **http://127.0.0.1:4193/**
- Before: http://127.0.0.1:4193/before/index.html#fl2-03
- After: http://127.0.0.1:4193/after/index.html#fl2-03

The loopback server is running at handoff and returned HTTP 200. It must remain running and the Mac connected. Before and After learning/vocabulary storage use separate review namespaces; they do not use ordinary course-preview saved-work keys.

## What changed for students

### Teaching pilot, reviewed positively

The core lesson retains Alex’s $1,000 case and Ren’s $1,800 equipment comparison, with their existing calculations and independent task. One convention is taught first: nominal annual rate divided by 12, monthly interest rounded to cents. The alternative-convention video, captions and transcript remain intact in a collapsed optional extension after core review.

Wrong answers receive a misconception-specific first hint. A revised, different wrong answer adds method support and an explicit Show worked reasoning option. Unchanged repeated clicks do not count as new tries. Correct answers receive explanations. Learners may still deliberately open a comparison model at any time; support is not locked behind failure or grading.

The first independent calculation check or model opening preserves a labelled partial/complete copy of current independent entries. Current responses remain editable. Added stopping cues identify the next task. Existing completion remains self-review; written explanations are not machine graded.

### Requested floating calculator

FL2-03 Open calculator links and Load this practice open a nonmodal floating loan calculator while the lesson remains visible. It reuses the original `#tool-loan` component, arithmetic engine and bound save handlers; it does not duplicate response fields or implement another loan formula.

- Move: drag/touch the Move control, or use its arrow keys; Shift uses larger steps.
- Resize: drag/touch the corner control, use its arrow keys, or choose Smaller/Larger. Reset position returns a reachable default.
- Close: × or Escape while focus is inside. Focus returns to the opener. Reopen using a lesson link or Loan calculator button.
- Values/results remain through close/reopen. Values resume through the existing course browser-save mechanism; window position/size are retained during that page session, not saved as a cross-session preference.
- One floating window exists. Position/size are constrained on viewport changes. Fields/results scroll inside it; the lesson remains independently usable.
- Explicit practice loading asks before replacing an experiment, maps the supplied loan case to the valid ordinary-loan selector, and clears optional rate-reset inputs. Cancel preserves the experiment. Lesson answers are not replaced.
- Initial calculator text/default now agrees with Alex/Ren’s ordinary convention. A previously saved alternative-convention experiment is retained, not silently replaced.
- Leaving FL2-03 closes the floating view and restores the original panel to Practice and review. Other lesson/tool routes retain their existing behavior; there is no course-wide floating-calculator rollout.

## Exact touched files

Canonical CALM files across these two bounded changes:
1. `projects/calm10-2026-draft/workspace/index.html` — FL2-03 teaching markup, pilot/calculator script includes, calculator stylesheet include, and the existing loan tool’s intro/default/note.
2. `projects/calm10-2026-draft/workspace/fl2-03-pilot.js` — scoped formative feedback and first independent-copy behavior.
3. `projects/calm10-2026-draft/workspace/authored-lessons.js` — one `:not([data-pilot-guided])` selector exclusion to avoid duplicate guided feedback.
4. `projects/calm10-2026-draft/workspace/floating-loan-calculator.js` — floating view, pointer/keyboard controls, scoped open/load integration and close/restoration behavior.
5. `projects/calm10-2026-draft/workspace/floating-loan-calculator.css` — scoped styling and sizing.
6. `docs/ops/CALM10_FL2_03_CALCULATOR_HANDOFF.md` — this handoff.

Existing `course.js` and `activities.js` were not edited. All 40 learner lesson bodies and saved-answer keys/task versions matched the pre-calculator source in a static comparison. No other course’s learner assets were changed.

Task-owned delivery files live under `/Users/deanguedo/Documents/Codex/2026-09-30/task/`:
- `calm-fl2-03-pilot/review.html` and `preview.mjs` — landing page/server; landing notes now mention the calculator.
- `calm-floating-calculator/test.mjs`, `validation.txt`, `screens.mjs`, `floating-1280.png`, `floating-390.png` — current calculator checks/evidence.
- `calm-fl2-03-pilot/landing-test.mjs`, `landing-validation.txt` — current landing checks.

## Before and recovery boundaries

The preserved original Before is `calm-fl2-03-pilot/before-index.html`, with `before-authored-lessons.js`, baseline SHA256 and before/after same-mistake screenshots in that folder. Before uses those HTML/handler overrides and shared original supporting assets. It does not include the floating calculator.

The pre-calculator, already improved pilot is separately preserved as `calm-floating-calculator/before-current-index.html`. The delivered calculator HTML is also recorded in `calm-floating-calculator/after-index-v2.html` for comparison.

Do not restore an entire saved index over newer work. Any later rollback must inspect current diffs and restore only the agreed FL2-03/tool/integration changes, preserving concurrent edits, stable IDs and saved-work history. Do not run the old CALM builders, migrations or blanket regeneration instructions.

## Tests actually passed

- Teaching pilot before calculator: 194 assertions across 1280px/390px isolated synthetic browser contexts, plus supplemental specific-misconception, first-copy, completion/revision and keyboard-menu checks.
- Current calculator: **116 assertions**, desktop and 390px mobile contexts. Actual mouse and browser touch gestures; pointer/keyboard movement/resize bounds; viewport shrink; blank/invalid input; ordinary/alternative convention; Alex’s payment $88.85 and total $1,066.19; guided payment $47.07 and interest $129.79; Ren’s payment $157.41 and borrowing cost $108.95; zero-interest arithmetic; repeated close/reopen; explicit load/cancel; lesson/calculator saved-state resume; preserved saved convention; nearby FL2-02 checks, Practice and review/loan/saving routes; original Before; no runtime errors or horizontal page overflow.
- Current landing: **35 assertions** at desktop/390px: direct Before/After links, screenshots, requested local assets, runnable feedback, isolated review saving/resume, ordinary preview-key preservation and delivered-source comparison.
- JS syntax passed. Static comparison preserved all 40 lesson bodies and saved keys/task versions. Clean screenshots verified full panel bounds at 1280×850 and 390×850; local server returned HTTP 200.

During development, the test first attempted to fill collapsed optional reset settings; the test was corrected to open them. A real initialization-order defect hid the reopen launcher after load/restore; the new script now follows existing deferred course initialization, and reload was reverified. There are no remaining failures in the current calculator/landing checks.

These checks do not certify physical iPhone soft-keyboard behavior, VoiceOver, comprehensive accessibility, storage-conflict/capacity recovery, all course lessons, real learner outcomes or Brightspace operation. Calculations remain the existing bounded classroom model; the floating view does not add financial advice or grading.

## Packaging, archive context and authorization limits

No current SCORM/export was generated or enabled, and no commit, push, deployment or publication occurred. CALM SCORM remains disabled pending its separate saved-state/launch/resume/completion checks. The previously observed single-HTML export was dated September 25 and is not the current pilot.

A separate approved archive moved six non-CALM ELA/Biology originals to Documents/Project Archives and added `config/project-archives.json` plus a portable recovery resolver. It does not affect CALM loan arithmetic, learner media or browser saving. Do not restore, fetch, prune or move those files to continue this calculator work. No LFS bandwidth/disk reclamation is implied.

## Precise continuation for the pinned chat

1. Read `AGENTS.md` and this handoff; inspect current scoped diffs and any newer user edits.
2. Inspect the canonical CALM workspace and both preserved baselines above. Use the existing After page, not an archived CALM variant or stale export.
3. If preview is needed, first check port 4193 to avoid duplicate servers. If absent, run `node /Users/deanguedo/Documents/Codex/2026-09-30/task/calm-fl2-03-pilot/preview.mjs` in a persistent local session; verify http://127.0.0.1:4193/.
4. Treat the teaching pilot as reviewed-good and the calculator as the current requested addition. Ask Dean what he wants changed next rather than inferring broader rollout.
5. Keep next edits bounded, preserve existing IDs/state/version history and workspaces. Do not regenerate, export, enable SCORM, promote standards, commit/push or roll the pattern across other lessons without a new request.


## October 1 continuation — Tools chooser

Dean requested a Tools button hosting the course tools. This addition supersedes the earlier loan-only launcher description: the bottom-right button now says **Tools** and is available throughout the course. It opens a compact chooser for the eleven existing tools. Each selection opens the original activity panel in the same nonmodal movable/resizable window. The window’s Tools button switches tools; closing/switching restores the original panel and retains its values. Existing FL2-03 Open calculator and Load this practice behavior stays direct. If the debt tool is floating, FL2-04’s loader confirms before replacing values; cancel preserves both values and the open window. Hash navigation closes/restores the floating tool.

Changed canonical files: `workspace/index.html` (static editable launcher/chooser only), `workspace/floating-loan-calculator.js` (reuse any existing tool panel), `workspace/floating-loan-calculator.css` (chooser/header wrapping). All 40 lesson bodies, eleven original tool panels, saved-field attributes, historical registry and existing calculation engines are unchanged from the start of this continuation. `course.js`, `activities.js`, `fl2-03-pilot.js` and `authored-lessons.js` were not changed in this continuation. Before snapshots were not edited.

Current focused evidence: `meta/implementation/course-tools-2026-10-01/`. The new behavior passed 90 desktop and 90 phone assertions (1280px/390px), plus 16 debt load/cancel assertions. Covers all eleven original panels, switch/close/reload values, isolated review storage, keyboard movement/resize, route restoration, original pilot loading/arithmetic, Before exclusion and runtime errors. Desktop and phone chooser/window screenshots were inspected. `checks.json` has source hashes and limitations. The older 116-check harness describes the original loan-only launcher and will need its launcher expectations updated before reuse; it was not rerun as current proof.

Focused checks if needed after another affected edit:
- `node projects/calm10-2026-draft/meta/implementation/course-tools-2026-10-01/check-ui.mjs`
- `node projects/calm10-2026-draft/meta/implementation/course-tools-2026-10-01/check-load.mjs`

The existing 4193 server still serves canonical After content without restart. Review: `http://127.0.0.1:4193/after/index.html#fl2-03`. No regeneration, lesson rollout, standard promotion, export, deployment or release-state change occurred. Lead retained this dirty/state-sensitive boundary; no worker was used and usage savings are unmeasured. `context:project` failed the existing context-size cap (14642 bytes vs 5000); this unrelated context metadata issue was not changed. Full course/Studio/accessibility/SCORM/LMS checks remain deferred.

## October 1 continuation — teaching support for the remaining lessons

Dean then approved the lesson changes and explicitly asked to apply them to the remaining lessons. This authorizes the scoped teaching adaptation below and supersedes the earlier pilot-only teaching boundary. It does not authorize regeneration, packaging, publishing or universal standard promotion.

The other 39 lessons now have selected-mistake first hints, method support after a different incorrect answer, optional worked reasoning, three links to the actual next task, and a separate first-independent-attempt copy. Original tasks, answer options/keys, task versions, field IDs, final evidence IDs, completion policy and history remain unchanged. Writing stays self-reviewed. All 23 videos and supporting media remain in place. FL2-03 retains its exact reviewed article and own pilot handler. Original Before files remain untouched.

Canonical changes: workspace/index.html; new workspace/learning-support.js; scoped styles in workspace/authored-lessons.css; handler exclusions in workspace/authored-lessons.js and workspace/finlit-integration.js; helper ownership in meta/project.json; continuation in meta/prompt-pack.md. Evidence and pre-adaptation source snapshots: meta/implementation/teaching-support-2026-10-01/. Its apply-once.cjs records the initial adaptation only, with subsequent static corrections held in canonical HTML. Never rerun it over later edits.

Focused Build evidence: 5,520 static compatibility assertions; 4,752 feedback assertions across 396 controls; 234 first-copy assertions across 39 lessons; retained attempt/first-copy reload, existing completion/history and isolated review storage checks; 34 selected desktop/390px preview assertions. Selected changed-area screenshots were inspected. One bad new CO1-01 next link was repaired and all 117 next links now resolve to their intended sections. No tested runtime errors. The existing FL3-04 document/video checks share an old answer save key; new attempt histories are distinct, while the original answer schema is preserved. A repair of that older answer overlap needs a separate compatibility decision.

Current review: http://127.0.0.1:4193/after/index.html#ce1-01 . The server still serves canonical After content without restart; use the sidebar to review the other lessons. Previous landing/loan-only harnesses describe older feedback/launcher expectations and are historical evidence, not the current full-course gate. Broader learner E2E, accessibility, Studio, SCORM/export and Brightspace checks remain deferred. Lead retained dirty state-sensitive integration; no worker, and usage savings are unmeasured.

Final placement refinement: first-attempt controls precede final sign-off in CO1-01, CE1-03 and FL3-04; six affected placement/capture checks passed. Evidence: `meta/implementation/teaching-support-2026-10-01/placement-checks.json`. All other model/response adjacency remains unchanged.
