# Handoff

- Project: `biology30-unit-a-pilot`
- Task: Remove the older course-made figures wherever an accepted source plate now teaches the same concept, without disturbing distinct figures or interactions.
- Status: Ready for teacher review at workspace SHA-256 `9a0b1bb4503ed0c250266c2770764216a6d409bf26c8a47949a3bbb5874b3c43`. The pilot remains intentionally `blocked`, preview-only, Studio Edit disabled, non-exportable, and isolated from production Units A-D.

## Files changed

- `projects/biology30-unit-a-pilot/workspace/index.html`
- `projects/biology30-unit-a-pilot/meta/source-visual-integration.json`
- `projects/biology30-unit-a-pilot/meta/source-visual-resource-report.json`
- `projects/biology30-unit-a-pilot/meta/improvement-ledger.json`
- `projects/biology30-unit-a-pilot/meta/prompt-pack.md`
- `scripts/lib/biology30-unit-a/pilot-source-visuals.ts`
- `scripts/tests/biology30-unit-a-source-visuals.test.ts`
- `scripts/tests/biology30-unit-a-media-pilot.test.ts`
- `e2e/specs/biology30-unit-a-improvement-pilot.spec.ts`
- `scripts/audit-biology30-unit-a-improvement-pilot-visual.ts`
- `docs/workflows/science-pilot.md`
- `ARCHITECTURE.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Retired six exact duplicate course-made figures from learner view and made their stronger source plates the single visible treatment:
  - Lesson 3 neuron anatomy -> `neuron-anatomy-source`
  - Lesson 6 brain regions -> `brain-functional-regions`
  - Lesson 7 reflex arc -> `reflex-arc-anatomy-source`
  - Lesson 9 eye anatomy -> `eye-anatomy-source`
  - Lesson 10 ear/hearing pathway -> `ear-anatomy-source`
  - Lesson 13 hypothalamus-pituitary axes -> `hypothalamus-pituitary-source`
- Kept three source visuals because they add different evidence rather than duplicating a figure: the neural-tissue micrograph, spinal-cord cross-section, and endocrine-capillary network.
- Preserved all non-duplicated semantic figures, models, interactions, lesson IDs, response IDs, saved work, required minutes, artifacts, practice, and completion rules.
- Kept each retired native block hidden and explicitly mapped in canonical HTML for reversible provenance; it is not rendered to learners.
- Added strict source-contract validation and static/browser regression assertions for the exact six replacement mappings.
- Updated the exact-build ledger and operating documentation to distinguish replacements from supplemental visuals.

## Why this changed

- The accepted source plates were being displayed immediately beside older figures that taught the same concept, creating visual duplication without adding instructional value.
- The teacher requested one strongest image per concept while retaining genuinely different evidence and models.

## Verification run

- `npm run prepare:biology30-unit-a-pilot:visuals -- --project biology30-unit-a-pilot` — passed idempotently; nine existing assets verified with no file changes.
- `npm run test:biology30-unit-a-improvement-pilot` — 7/7 passed.
- `npm run test:biology30-unit-a-media-pilot` — 9/9 passed, including exact six-replacement validation, idempotence, replacement safety, and rollback.
- `npm run test:e2e:biology30-unit-a-improvement-pilot` — final clean rerun 14/14 passed. Browser-computed visibility confirms every retired figure is hidden and every replacement source plate is visible.
- An earlier full E2E attempt had one transient Studio-shell startup miss in the unrelated video-preview test; that exact test passed immediately on isolation, and the subsequent full rerun passed 14/14.
- `npm run audit:biology30-unit-a-improvement-pilot:visual -- --project biology30-unit-a-pilot` — passed with 93 route viewports, 18 source-visual viewport states, and zero geometry findings.
- All 28 contact sheets under `.runtime/biology30-unit-a-improvement-pilot-visual-audit/2026-09-01T12-39-58-923Z/` were opened and inspected.
- Visual report SHA-256: `9da1eba16bd763fab0744947cd58a0c38ae8f0f3da361517b3a796d5cb4d80a4`.
- `npm run verify -- --project biology30-unit-a-pilot --mode workspace` — passed with no missing assets, unresolved embeds, or required external dependencies.
- `npm run test:e2e:project -- --project biology30-unit-a-pilot` — 1/1 passed.
- `npm run test:science-comparison` — 6/6 passed.
- `npm run validate:manifests` — passed for the full catalog.
- `npm run build:studio` — passed.
- `npm run course:doctor -- --project biology30-unit-a-pilot` — intentionally exited 1 with only `ERROR not-active`; no additional diagnostic.
- Scoped `git diff --check` — passed.

## Source of truth

- Direct canonical learner source: `projects/biology30-unit-a-pilot/workspace/index.html`.
- Exact replacement/supplemental mapping, source relationships, rights, placement, accessibility, and release blockers: `projects/biology30-unit-a-pilot/meta/source-visual-integration.json`.
- Generated-asset evidence: `projects/biology30-unit-a-pilot/meta/source-visual-resource-report.json`.
- Pending review rules and exact visual evidence: `projects/biology30-unit-a-pilot/meta/improvement-ledger.json`.
- Immutable textbook and PowerPoint sources: `projects/resources/biology30-unit-a-pilot/_sources/`.

## Fragile areas / watchouts

- Keep the six `data-replaced-by-source-visual` mappings synchronized with `meta/source-visual-integration.json`; exposing a retired block recreates the duplicate treatment.
- Preserve the three supplemental visuals because they teach distinct anatomy or evidence.
- Any learner-HTML change changes the workspace hash and requires a fresh full visual audit, opening all generated contact sheets, and updating the ledger evidence.
- Keep each visible source image's intrinsic sizing, nearby explanation, enlargement trigger, and exact textbook-page action intact.
- Do not replace native action-potential, feedback-loop, data, or other interactive explanation figures with raster plates.

## Known risks / follow-up

- The neuron, spinal-cord, reflex-arc, and eye plates have unresolved original embedded-image provenance. They remain private-pilot visuals and release blockers until redrawn or rights-cleared.
- Exact contact-sheet evidence is under ignored `.runtime/**`; deleting it invalidates the recorded manual-review artifact.
- The repository remains broadly dirty with unrelated user-owned work. Keep future edits and staging path-scoped.
- User acceptance is still pending; no improvement-ledger rule is accepted automatically.

## Next prompt should assume

- The learner now sees one visible treatment for each of the six replaced concepts and still sees the three distinct supplemental source images.
- Review does not authorize production Unit A-D changes, additional source-image imports, Studio Edit, promotion, commit, push, SCORM export, Brightspace upload, or publication.
- No visual rule transfers automatically to Units B-D.

## What still needs validation

- Explicit teacher acceptance or another concrete visual correction on workspace SHA-256 `9a0b1bb4503ed0c250266c2770764216a6d409bf26c8a47949a3bbb5874b3c43`.
- A redraw or rights-clearance decision for each of the four pilot-only source plates before any future production release.

## Exact next command

`npm run studio`

## Exact next file to open

`projects/biology30-unit-a-pilot/workspace/index.html`

## Do not do next / warnings

- Do not physically delete the hidden rollback/provenance blocks unless a separate canonical cleanup is explicitly requested.
- Do not bulk-import remaining PowerPoint or textbook imagery.
- Do not mark improvement-ledger rules accepted without explicit teacher review.
- Do not edit production `biology30-unit-a`, Units B-D, `raw/**`, or immutable source decks.
- Do not enable Studio Edit, promote, commit, push, export SCORM, upload to Brightspace, or publish without separate authorization.
- Do not stage, reset, clean, or disturb unrelated dirty-worktree paths.
