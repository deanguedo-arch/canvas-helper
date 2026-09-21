# Math 10C Unit 3 Pilot — Integration Boundary

Planning only. No course created, no code changed, no patch applied. Frozen candidate facts used here:
SHA-256 `0d0597c864e8a705690c6ecaeb16f553073f79e30dd022afa791f467dd094a68`;
eight-lesson Chapter 3 review, routine HTML + CSS/JS, 22 routes, 132 authored questions,
v0.4 catalog + 10 appended v0.5 IDs, 1,584 deterministic generated factoring entries.
Install helper intentionally refuses apply. Receipt/codec patch base confirmed matching with
`git apply --check` succeeding, but the patch is absent from this worktree and is not
reconstructed here.

## 1. Exact workflow and intake command

Use the external `generated-course` workflow (`docs/workflows/generated-course.md`).
This is an imported ChatGPT Pro first pass, so the from-scratch `course:create` scaffold
does not own the intake. The candidate must enter as `blocked`, never directly `active`.

After hash verification and safe extraction into the incoming staging directory, Codex
(owner) runs:

```bash
npm run import -- "projects/incoming/math10c-unit3-pilot-source" \
  --slug math10c-unit3-pilot \
  --source other
```

The importer establishes the immutable raw baseline, normalized workspace, resources,
and blocked `proposal-only-v1` metadata. Codex then records the ChatGPT Pro provenance,
changes the workflow classification to `generated-course`, disables every export target,
and declares the exact workspace sources. Candidate content must never be installed by
running the supplied helper or by copying its proposed shared-repository files into the
repository.

Before that selective import, preserve the supplied candidate ZIP as the immutable
imported baseline through the owning intake path. Record `importedFirstPassOrigin` in
`projects/math10c-unit3-pilot/meta/project.json` with generator `chatgpt-pro`, the
original source path, the audited SHA-256, and the import timestamp. The preserved
baseline is evidence and recovery material; it is never the editable source.

## 2. Canonical ownership map

| Concern | Canonical owner | Notes |
|---|---|---|
| Routine teacher-editable HTML | `projects/math10c-unit3-pilot/workspace/**/*.html` (canonical entry `workspace/index.html`) | Visible text, links, images stay in HTML; JS attaches behavior, never replaces them (`docs/workflows/codex-studio-course.md` §2). `data-canvas-helper-course-title` on course-name surfaces; durable `data-canvas-helper-edit-key` on repeated/reorderable content. |
| Presentation/assets | `projects/math10c-unit3-pilot/workspace/styles.css`, `workspace/assets/**`, `workspace/course.js` (progressive enhancement only) | Scaffolded by `renderCodexStudioCourseHtml` in `scripts/lib/codex-course.ts`. Candidate CSS/JS is reference until ported by owner decision. |
| Math behavior modules (factoring generator, checkers, trig) | Ported copies under `workspace/` owned as canonical JS, OR adapter-owned recipes (see §3) | No generated bundle is ever canonical. Runtime-replaced content must be `data-canvas-helper-studio-edit="annotation-only"`, not hidden from measurement. |
| Generated workspace copies (the 1,584 deterministic factoring entries, if materialized) | Generated output owned by an adapter recipe, NOT canonical source | If the owner keeps runtime generation, no copies exist. If entries are pre-rendered, they live under workspace but are rebuild-owned (see §3). |
| Metadata | `projects/math10c-unit3-pilot/meta/project.json`, `meta/prompt-pack.md`, `meta/e2e-contract.json` (when interactions land) | `meta/project.json` is the single metadata contract (`AGENTS.md`); prompt-pack carries continuation rules. |
| Tests | `scripts/tests/math10c-unit3-pilot.*` (new, focused) + extensions to existing SCORM tests (see `SHARED_SCORM_TEST_PLAN.md`) | No new framework; `node:test` + `assert/strict` per existing SCORM tests. |
| Exports | `projects/math10c-unit3-pilot/exports/**` (generated only) | Produced by `exportProjectToScormPackage` (`scripts/lib/exports/scorm-package.ts`); never edited by hand. |
| Reference | Candidate ZIP (external, SHA above), `tasks/math10c-preflight/` harness, `tasks/math10c-reference-fixtures/`, `tasks/math-source-registry/` | Read-only evidence; the v0.4 catalog + 10 appended v0.5 IDs enter `meta/` only by owner decision. |

Protected zones stay untouched: `projects/math10c-unit3-pilot/raw/**` (immutable baseline),
prior exports, `.runtime/**`, active handoffs, release flags.

## 3. Smallest supported adapter/rebuild boundary preserving teacher edits

Future promotion target: Direct ownership (`direct-workspace-v1`, editability profile
`STUDIO_ROUTINE_CONTENT_PROFILE_ID = "studio-routine-content-v1"`,
`STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION = 1`, both in
`app/shared/course-editability.ts`). During intake the project remains blocked under
`proposal-only-v1`; Direct ownership and Studio Edit are enabled only after the canonical
boundary and reversible lifecycle are proven. Teacher edits to routine HTML then survive
because the source of truth IS the workspace HTML.

The adapter boundary is needed only for the deterministic factoring generator (and any
trig item bank) IF the owner chooses runtime generation over static authored items:

- Adapter contract (to be authored at integration, not here): a stored recipe +
  parameters (seed, count, difficulty bands) under `meta/`, a deterministic rebuild
  command writing a declared file set under `workspace/`, and a reversible pilot
  (preview → annotate → rebuild → Studio Edit re-enabled) per
  `docs/workflows/codex-studio-course.md` "Changing ownership later".
- Teacher edits to routine prose around generated items stay Direct-owned and are never
  overwritten by rebuild; the rebuild write set covers ONLY generated item files.
- Studio discovery signal: `STUDIO_PROJECT_CHANGE_SIGNAL`
  (`app/shared/project-discovery.ts`) fires only after a successful transactional apply.
- If instead the owner authors the pilot slice statically (recommended for slice 1),
  no adapter is needed at all: generated entries remain reference-only in the candidate.

## 4. Path inventory

Likely new paths (created at integration by owner command/decision):

- `projects/math10c-unit3-pilot/workspace/index.html` (scaffolded, then authored)
- `projects/math10c-unit3-pilot/workspace/styles.css`, `workspace/course.js`, `workspace/assets/**`
- `projects/math10c-unit3-pilot/meta/project.json` (`authoringStatus: "blocked"` first)
- `projects/math10c-unit3-pilot/meta/prompt-pack.md`
- `projects/math10c-unit3-pilot/meta/e2e-contract.json` (when learner interactions land)
- `projects/math10c-unit3-pilot/meta/capacity-decision.json` (records the §6/CAPACITY decision)
- `projects/math10c-unit3-pilot/workspace/scorm-tracking.json` (contract type
  `ScormTrackingContract`, `scripts/lib/scorm-tracking.ts`: `schemaVersion: 1`,
  `adapter: "hash-pages-v1"`) — required before any SCORM export claims resume/completion
- `scripts/tests/math10c-unit3-pilot-scorm.test.ts` (new focused file; see test plan)

Existing paths that may later need a separately reviewed change (NOT changed here):

- `scripts/lib/scorm.ts` (`buildScormBridgeScript`, `persistStateToLms`, `save`,
  `saveAndExit`, `markCompleted`) — only via the future receipt patch + test plan
- `scripts/lib/scorm-state-codec.ts` (`buildScormStateCodecRuntime`) — only via the
  future codec patch + test plan
- `scripts/lib/scorm-tracking.ts`, `scripts/lib/scorm-actions.ts`
  (`buildScormActionsRuntime`), `scripts/lib/exports/scorm-package.ts`
  (`exportProjectToScormPackage`) — only if pilot export needs demand it
- `scripts/tests/scorm-export.test.ts`, `scorm-state-codec.test.ts`,
  `scorm-tracking.test.ts` — extended, not rewritten (see test plan)
- `app/shared/*` (e.g. `course-editability.ts`) — no change foreseen; any edit is
  repo-wide governance needing its full floor (`typecheck`, `build:studio`)

## 5. First visible pilot slice vs preserved later content

First pilot slice (initial learner rollout): one complete factoring vertical slice plus
the smaller right-triangle contrast. "Complete" means routed, checkable, savable,
resumable, completable items — not a preview stub. Sampling oracles already exist:
`tasks/math10c-reference-fixtures/` (factoring + right-triangle cases).

The complete eight-lesson candidate is imported and preserved as the immutable baseline,
while only the selected pilot slice is promoted into the active canonical workspace for
the first rollout. Preserved for later expansion (kept reference-only, still `blocked`):
the remaining Chapter 3 lessons/routes, the full 132-question authored set beyond the
slice, the v0.4 + 10-ID v0.5 catalogs, and the 1,584 generated entries beyond slice needs.
Nothing is trimmed or rewritten to fit; unbaked content waits.

## 6. Ordered Gate B steps and stop conditions

Gate B = frozen-candidate rollout batch (Build mode defers all of it until the owner
freezes the slice). Run cheapest first; stop at the first red gate.

1. `npm run course:doctor -- --project math10c-unit3-pilot` — expect refusal while
   `blocked` (any code other than the expected not-active/blocked refusal is a defect
   in the test setup, not the course). STOP if scaffold contract is malformed.
2. Promote to `active` ONLY by explicit owner decision with the capacity decision
   recorded (`meta/capacity-decision.json`); then re-run doctor, expecting
   `direct-ready`, `direct-workspace-v1`, Studio editing enabled. STOP if not direct-ready.
3. `npm run verify -- --project math10c-unit3-pilot --mode workspace`. STOP on failure.
4. `npm run report:course-editability -- --project math10c-unit3-pilot` +
   `npm run test:new-course-readiness` (floors in
   `scripts/tests/new-course-readiness.test.ts`). STOP on coverage/contract failure.
5. Real Studio lifecycle (§5 of `docs/workflows/codex-studio-course.md`): Edit map →
   inert-preview edit → Save draft → apply → reload → Undo restores exact original.
   STOP if Undo does not restore byte-identical content.
6. `npm run test:e2e:project -- --project math10c-unit3-pilot` (needs
   `meta/e2e-contract.json`). STOP on interaction failure.
7. SCORM package gate (after the future receipt/codec patch lands and its test plan
   passes): export 2004 + 1.2, resume/save/completion/timing verified in target LMS
   before ANY LMS-readiness claim. STOP on save loss, oversize silent failure, or
   completion mismatch.
8. CI `verify:new-course-readiness -- --base <comparison-sha>` exact-head gate
   (comparison SHA supplied by CI). STOP on mismatch.

Rollout floor commands source: `docs/ops/FAST_PATHS.md` ("Codex-Created Studio Course").

## 7. Later Muse work vs Codex/Dean-retained decisions

Muse may later implement (bounded, reviewable): scaffold verification, file-by-file
content porting per owner manifest, `scorm-tracking.json` authoring, the new focused
SCORM test file, `e2e-contract.json` drafting, capacity measurements on the real slice.

Codex/Dean retain (never delegated): curriculum scope and assessment policy; rights and
source-family provenance (`tasks/math-source-registry/`); whether the factoring bank is
static-authored or adapter-generated; the capacity option (see `CAPACITY_DECISION_OPTIONS.md`);
applying or reconstructing the receipt/codec patch; promoting `blocked` → `active`;
any `app/shared/` or SCORM library change; packaging/deploying/publishing; teacher,
learner, AT, accessibility, and Brightspace acceptance claims.
