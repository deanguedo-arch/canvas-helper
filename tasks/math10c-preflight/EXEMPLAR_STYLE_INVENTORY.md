# Exemplar Style Inventory (source inspection only)

Method: source inspection of repository files. Nothing below is based on
rendered visual inspection, browser testing, or LMS behaviour. Paths are
exact repository locations at the time of writing.

## Biology 30 Unit A Pilot 3 — reusable presentation/state patterns

Reference (presentation and state patterns only, not a math engine):

- `projects/biology30-unit-a-pilot-3/workspace/index.html`
- `projects/biology30-unit-a-pilot-3/workspace/styles.css`
- `projects/biology30-unit-a-pilot-3/workspace/assets/pilot3-catalog.js`
- `projects/biology30-unit-a-pilot-3/workspace/assets/pilot3-practice-bank.js`
- `projects/biology30-unit-a-pilot-3/workspace/scorm-tracking.json`
- `projects/biology30-unit-a-pilot-3/meta/project.json`
- `projects/biology30-unit-a-pilot-3/meta/prompt-pack.md`
- `scripts/lib/biology30-pilot3/runtime.ts`
- `scripts/lib/biology30-pilot3/practice-engine.ts`

| Pattern | What it accomplishes | Limitations |
|---|---|---|
| `data-canvas-helper-edit-key` on content and controls (e.g. `p3-content-0`, `p3-control-1` in `workspace/index.html`) | Durable teacher-edit targeting for repeated and reorderable content | Requires the Direct adapter and canonical HTML ownership; meaningless outside that contract |
| `data-canvas-helper-course-title` on the sidebar title | Synchronized course-name surfaces | Only works where the editing contract tracks the title surface |
| Canonical HTML owns visible text; JS attaches behaviour (`prompt-pack.md`: routine teacher-editable text stays in canonical HTML) | Teacher edits survive rebuilds; behaviour stays in owned scripts | Forbids runtime replacement of visible elements after load; constrains what components may do |
| Content data separated from runtime (`assets/pilot3-catalog.js`, `assets/pilot3-practice-bank.js` vs generated `assets/pilot3-runtime.js` built from `scripts/lib/biology30-pilot3/runtime.ts`) | Data files stay reviewable and rebuildable; never patch the bundle as source | Rebuild path must be known and deterministic; bundle is generated output, not a source |
| `workspace/scorm-tracking.json` (`hash-pages-v1` adapter, `pageIds`, `defaultPageId`, `storageKey`, `requiredIds`) | Declared page inventory, single storage key, explicit completion set | Declaration only; says nothing about live save/commit behaviour |
| Hash routes (`#lesson-01`, `#practice`, `#lesson-check`) with `data-page-target`, native `<details>/<summary>` disclosure, `sr-only` progress text | Navigable single-file structure with keyboard-operable disclosure and screen-reader progress text | Presentation pattern only; no evidence of math semantics, answer checking, or LMS persistence |
| Formative multiple-choice variants calibrated against a source assessment without exposing the source bank (`prompt-pack.md`) | Practice/formal separation: variants for learners, source bank withheld | Calibration claim needs independent item review; not transferable without the source assessment |
| Stop/reset of unfinished runs preserving completed history (`prompt-pack.md`) | Learner control without destroying earned evidence | State-pattern description only; resume truthfulness needs live testing |

## Chemistry 30 Unit A Pilot — blocked, not a pattern to copy

- `projects/chemistry30-unit-a-pilot/meta/project.json`: `authoringStatus: blocked`, `authoring.driverId: proposal-only-v1`, Studio editing disabled.
- `projects/chemistry30-unit-a-pilot/meta/prompt-pack.md`: generic retrieval rules only; no approved learner-surface contract.
- Blueprint documents and teacher keys are declared reference-only outside learner pages (`sourceOfTruthNotes`).

Do not copy Chemistry workspace structure, builder flow, or practice engine
choices into Math 10C work. Its only reusable lesson is negative: imported
ChatGPT-authored material stays blocked with Studio editing disabled until a
separate rollout verification explicitly enables it.

## Shared foundations worth reusing (not copying verbatim)

- `scripts/lib/scorm.ts`: SCORM version normalization, storage-key collection, template resolution for export orchestration.
- `scripts/lib/scorm-tracking.ts`: `ScormTrackingContract` shape (`schemaVersion`, `adapter`, `pageIds`, `defaultPageId`, state adapter, completion `storageKey` + `requiredIds`), plus safe-ID rules for stable identifiers.
- `scripts/verify-english-course.ts` (local-link checking idea only): collect `img[src]`, `iframe[src]`, `a[href]`, resolve within the workspace directory, report missing targets. The Math 10C scanner reimplements this idea in standard-library Python without new dependencies.
