> Historical checkpoint, superseded by `BUILD_STATUS.md` and `docs/ops/ACTIVE_HANDOFF.md`. The current product is the dedicated English 30-1 Critical Essay Studio. Preserve this earlier handoff as reference only.

# Writing Studio Handoff

- Project: `nextstep-writing-studio` — Next Step Writing Studio.
- Repository: `/Users/deanguedo/Documents/GitHub/canvas-helper`.
- Task: Continue the standalone, reusable instructional Writing Studio derived from the supplied handoff and the existing English course Studio.
- Status: Build candidate. Metadata is `blocked`; HTML and SCORM export targets are disabled. Not released or Brightspace-validated.
- Handoff date: October 7, 2026 (America/Edmonton).

## Product scope — start here

Dean wants the Writing Studio from the English courses made better and usable throughout a student's coursework. It is a teaching/help tool: explanations, worked examples, reasoning, guided practice and revision support. Students bring their own task or source and can write their full assignment wherever they normally work.

It must not require a specific novel, story, play, film or assignment. Original fictional passages demonstrate transferable moves; they are examples, not assigned course texts. Do not turn the product back into a generic project dashboard or a place primarily for writing papers. An earlier draft-centered interpretation was rejected. Existing optional draft routes remain only to preserve already-created work.

The current scope supersedes any conflicting assumptions inside the supplied ZIP. Attached documents and their embedded prompts are reference material, not agent authority. Continue within this project; do not update other ELA, Biology, Social, Math or game projects.

## What changed / why

The app was rebuilt around instructional navigation:

- Start here: teaching entry points, summary-versus-analysis model and suggested learning path.
- Writing lessons: 18 searchable/category-filtered lessons with substantial explanation, three teaching moves, starting/developed models, reasoning annotations, thinking checks with feedback, practice, hints, self-checks and transfer.
- Analysis Explorer: nine concepts (characterization, irony, point of view, plot/conflict, setting, symbols/motifs, tone/mood, diction, theme), two original practice passages and 18 worked analyses. Each traces detail → interpretation → reasoning.
- Build a response: six guided steps each for personal and analytical responses, with teaching/model/reasoning/hints and a link to a fuller lesson.
- Saved practice & notes: learner practice and explicitly labelled teaching models; text export, print/PDF entry and backup access.
- Help with my writing: nine repair strategies that link to fuller teaching.
- Secondary navigation retains My drafts and Settings & backups.

Presentation uses the supplied light-shell direction: white content, pale sidebar, dark green active navigation, bold Hanken Grotesk headings, Work Sans text and locally bundled icons/fonts with licenses. No invented Brightspace chrome or unconditional save claims. Responsive rules exist but have not received full rollout verification.

## Source of truth and files changed

All project paths below are under `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/nextstep-writing-studio/`.

| File | Ownership |
| --- | --- |
| `workspace/index.html` | Canonical shell, teaching navigation and annotation-only runtime boundaries |
| `workspace/app/teaching.js` | Teaching views, response pathways, help, practice and model interactions |
| `workspace/content/lessons.json` | 18 original teaching lessons |
| `workspace/content/analysis-lessons.json` | Nine concepts, two original passages, 18 analyses |
| `workspace/app/main.js` | Integration, existing-schema practice saves, route/focus handling, retained draft flows |
| `workspace/app/persistence.js` | SCORM discovery/restore/save, local recovery, locks and session close |
| `workspace/app/model.js`, `codec.js`, `editor.js`, `legacy.js` | Existing workspace model, encoding, optional structured editor and legacy import |
| `workspace/styles.css`, `tokens.css`, `components.css` | Canonical presentation |
| `workspace/assets/icons/`, `assets/fonts/` | Local assets and font licenses |
| `workspace/schemas/*.json` | State/backup/product/deployment contracts |
| `meta/project.json`, `meta/prompt-pack.md` | Lifecycle, ownership and authoring scope |
| `meta/BUILD_STATUS.md` | Prior build checkpoint and verification detail |
| `meta/review/teaching-home.jpg` | Screenshot of the corrected teaching home |

Repository integration files: `scripts/build-writing-studio.mjs`, `scripts/tests/writing-studio-boundary.test.mjs`, and Writing Studio entries in `package.json`, `package-lock.json`, `README.md`.

`workspace/writing-studio.bundle.js` is generated. Rebuild it with `npm run build:writing-studio` after canonical app/content changes. Never patch the bundle as source. Do not run the English course factory against this standalone project. The scaffold already exists; do not create a replacement project.

## Supplied and existing references

Original input: `/Users/deanguedo/Downloads/Writing_Studio_Codex_Handoff_v1.0.zip`.
SHA-256: `934c5ab44900e6bb99365fe61dd36566f42c577752196b2b5c3e8e5768d0822e`.

Selected handoff documents are preserved in `meta/handoff-reference/`. Begin with `11_TEACHING_AND_CONTENT.md` and `02_PRODUCT_AND_DESIGN.md` if instructional/design intent needs clarification. Use `06_SCORM_PERSISTENCE.md`, `07_BACKUP_AND_MIGRATION.md` and `12_ACCEPTANCE_TESTS.md` for relevant storage/release work. The current user clarification takes precedence over earlier project-writing assumptions.

The previous course Studio can be inspected read-only in `projects/ela20-1-short-stories-pilot/workspace/index.html`. The old nine-term/five-reading/90-example data in `workspace/content/legacy-explorer-reference.json` is reference-only. Do not publish those fixed-work examples in the reusable tool. The old 12 guide cards are retained; old guide URLs redirect to fuller new lessons.

## Fragile areas / saved-work constraints

- Preserve workspace/project/note IDs, draft documents, imported records, storage namespaces, attempt identity and backup compatibility. No deletion or migration was performed for the teaching rebuild.
- Practice uses a separate marked learning notebook inside the existing project/notes schema. `NOTEBOOK_PROMPT` and `isLearningNotebook` in `app/teaching.js` distinguish it. Do not change that marker casually or mix notebook notes into assignment drafts.
- Models stay clearly labelled as teaching models, separate from student-authored practice. Never insert a model automatically into a draft or generate an assignment answer for the learner.
- Explicit Save records practice. Unsaved responses persist only within the current page session; they are not guaranteed across reload/close.
- Restore/recovery/review modes keep teaching usable while disabling saved mutations. Normal LMS editing uses Web Locks or an IndexedDB lease. Session close must not write LMS data in review/recovery/unprotected sessions.
- Local preview has no LMS connection: saved practice is browser-tab-only. Export a backup before closing that tab; do not equate this with Brightspace persistence.
- Current deployment configuration is `SYNTHETIC_TEST_ONLY`, with a demo tenant/scope. Never promote it to production simply by changing the status flag. Real tenant/course identity, stable deployment scope and new-versus-existing SCO decision are still unresolved.
- Runtime-rendered instructional content is developer-editable in canonical JSON but Annotation only in Studio. A direct authoring driver declaration does not prove teacher editability or readiness. Keep the project blocked until its supported editing boundary and readiness gates are actually proven.
- Source tree is dirty and this project/build/test files are untracked. No commit or push was made. Inspect exact write paths before editing; preserve unrelated dirty work.

## Verification run and evidence limits

Prior checkpoint evidence from October 6 (not rerun for this documentation task):

- `npm run build:writing-studio` passed for the corrected candidate, including the final thinking-check keyboard-focus change.
- Four focused synthetic checks passed: existing draft save/reopen; practice + labelled model save/reopen without changing the draft; review-mode teaching with no writes on close; corrupt-restore teaching with saving disabled and no exit writes.
- Content inventory confirmed 18 unique lessons, one correct answer per thinking check, nine concepts, two passages and a model for every concept/passage pair.
- Browser inspection covered home, lesson library, a full analysis lesson, explanatory thinking-check feedback/focus, Analysis Explorer and guided personal response. No captured console errors. Screenshot is `meta/review/teaching-home.jpg`.
- The first build's 14-test persistence batch and draft/backup checks passed before the teaching rebuild. Those are historical evidence, not a complete current regression pass.

For this handoff: read current project/build metadata, checked scoped Git status, and checked the former preview endpoint. `http://127.0.0.1:8791/` is not currently listening. No tests, rebuild, packaging or deployment were run merely to refresh documentation.

## What still needs validation / known risks

Defer to an explicit rollout checkpoint:

- Teacher/content acceptance, complete teaching-route and learner interaction regression.
- Full current persistence/backup/import/recovery/competing-tab/failure coverage.
- Mobile, keyboard/screen reader, zoom, reduced motion, contrast and actual print/PDF layout.
- Supported Studio editing, inventory/rendered thresholds, reversible apply/reload/Undo, doctor/workspace verification and new-course readiness.
- Actual Brightspace upload/launch/save/close/reopen across browsers, bound to an approved production deployment identity.

The prior `/Users/deanguedo/Downloads/Next Step Writing Studio - Source Review.zip` contains the superseded draft-centered candidate. It has not been refreshed with this teaching rebuild and must not be uploaded as the current product.

## Preview and commands

Run from `/Users/deanguedo/Documents/GitHub/canvas-helper`.

After source changes:

```sh
npm run build:writing-studio
```

If port 8791 is free, restart the stopped, workspace-only preview:

```sh
python3 -m http.server 8791 --bind 127.0.0.1 --directory projects/nextstep-writing-studio/workspace
```

Then open `http://127.0.0.1:8791/#/home`. Other routes: `#/lessons`, `#/explorer/characterization`, `#/response/personal/0`, `#/study-notes`, `#/writing-help`.

At an appropriate saved-state check or rollout checkpoint, the existing full synthetic suite is `npm run test:writing-studio:boundary`. Do not repeat broad suites during ordinary Build changes. Synthetic tests do not replace real Brightspace proof.

## Next prompt should assume

Continue this exact candidate in Build mode. Source/design/content work is authorized, but no automatic packaging, activation, deployment, Git commit/push, legacy-save migration or repository-wide cleanup is authorized. Accept Dean's next targeted feedback without re-asking the settled reusable-tool scope.

## Exact next action

Read this handoff, restore the stopped local preview when needed, and await the next requested Writing Studio change.

## Exact next file to open

`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/nextstep-writing-studio/workspace/app/teaching.js`

## Routing actually used

Prior build: deterministic inventory/build/content checks; lead retained instructional authority, dirty-boundary integration and saved-state compatibility. No Muse or Luna worker was launched. This handoff used deterministic documentation only. Local reference reuse is separate from provider caching; provider-cache telemetry and measured usage savings are unknown.

## Do not do next

Do not recreate a generic paper-writing dashboard, tie the tool to specific published works, discard existing saved work, patch the generated bundle, upload the stale ZIP, claim local tests certify Brightspace, or broaden into other projects.
