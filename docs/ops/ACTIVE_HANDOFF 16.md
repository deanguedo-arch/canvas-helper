# Handoff

- Project: `biology30-unit-a-pilot`
- Task: Trial selected high-value textbook and PowerPoint images inside the existing Unit A lessons while preserving the stronger course-native figures and interactions.
- Status: Implemented and fully verified at workspace SHA-256 `5599667b7c5793b6064fce91ee23e34a5c18597cfca2f36175b5bc9550b51751`. The pilot remains intentionally `blocked`, preview-only, Studio Edit disabled, non-exportable, and isolated from production Units A-D.

## Summary

- Added six selective source visuals at the exact teaching moments where added anatomical or histological detail improves the lesson:
  - Lesson 3: neural-tissue micrograph.
  - Lesson 6: functional cortex regions.
  - Lesson 9: detailed eye anatomy.
  - Lesson 10: detailed ear anatomy.
  - Lesson 12: endocrine-cell and capillary relationship.
  - Lesson 13: hypothalamus-pituitary pathways.
- Preserved the existing semantic and interactive course figures as the mechanism/explanation layer; no source image replaced learner reasoning, practice, or required instruction.
- Added responsive intrinsic sizing, adjacent explanations, exact textbook-page links, and keyboard-accessible `View larger` dialogs with focus return.
- Kept all learner-facing media local. No slide screenshot or complete textbook page became a lesson.
- Studio's current workspace preview exposes all six expected `data-source-visual` IDs.

## Files changed

- Canonical learner source: `projects/biology30-unit-a-pilot/workspace/index.html`.
- Source-visual contract and generated evidence: `projects/biology30-unit-a-pilot/meta/source-visual-integration.json` and `source-visual-resource-report.json`.
- Generated local learner assets: `projects/biology30-unit-a-pilot/workspace/assets/source-visuals/`.
- Transactional preparer and CLI: `scripts/lib/biology30-unit-a/pilot-source-visuals.ts` and `scripts/prepare-biology30-unit-a-pilot-source-visuals.ts`.
- Focused static/E2E/visual coverage: `scripts/tests/biology30-unit-a-source-visuals.test.ts`, `scripts/tests/biology30-unit-a-media-pilot.test.ts`, `scripts/tests/biology30-unit-a-improvement-pilot.test.ts`, `e2e/specs/biology30-unit-a-improvement-pilot.spec.ts`, and `scripts/audit-biology30-unit-a-improvement-pilot-visual.ts`.
- Operational and workflow records: `projects/biology30-unit-a-pilot/meta/project.json`, `prompt-pack.md`, `improvement-ledger.json`, `package.json`, `README.md`, `ARCHITECTURE.md`, `docs/ops/FAST_PATHS.md`, and `docs/workflows/science-pilot.md`.

## Verification run

- `npm run prepare:biology30-unit-a-pilot:visuals -- --project biology30-unit-a-pilot` — passed idempotently; six existing visuals reverified with no file changes.
- `npm run test:biology30-unit-a-media-pilot` — 8/8 passed.
- `npm run test:biology30-unit-a-improvement-pilot` — 7/7 passed.
- `npm run test:e2e:biology30-unit-a-improvement-pilot` — 14/14 passed.
- `npm run verify -- --project biology30-unit-a-pilot --mode workspace` — passed with no missing assets, unresolved embeds, or required external dependencies.
- `npm run test:e2e:project -- --project biology30-unit-a-pilot` — 1/1 passed.
- `npm run audit:biology30-unit-a-improvement-pilot:visual` — passed with 93 route-viewports, 12 source-visual viewport states, and zero geometry findings.
- All 26 final contact sheets were opened and inspected.
- `npm run test:science-comparison` — 6/6 passed.
- `npm run validate:manifests` — passed for the full catalog.
- `npm run build:studio` — passed.
- `npm run course:doctor -- --project biology30-unit-a-pilot` — intentionally exited 1 with only `ERROR not-active`; no additional diagnostic.
- Live Studio preview inspection found exactly the six expected source-visual IDs.

## Known risks / follow-up

- The eye-anatomy raster is explicitly pilot-only because its original third-party reuse provenance is unresolved. It must be redrawn or rights-cleared before production export.
- Dense labels in the brain, eye, and pituitary images are supplementary; the adjacent web explanation and `View larger` treatment must remain available.
- The remaining PowerPoint/PDF imagery is not approved merely because six examples worked. Continue selective, rights-aware review rather than bulk extraction.
- Exact visual evidence lives in ignored `.runtime/**`; deleting it invalidates the recorded manual-review artifact.
- The repository remains broadly dirty with unrelated user-owned work. Keep future edits and any staging path-scoped.

## Source-of-truth location

- Direct canonical learner source: `projects/biology30-unit-a-pilot/workspace/index.html`.
- Explicit selection, rights, crop, placement, accessibility, and source hashes: `projects/biology30-unit-a-pilot/meta/source-visual-integration.json`.
- Generated intake evidence: `projects/biology30-unit-a-pilot/meta/source-visual-resource-report.json`.
- Pending acceptance rules and exact visual-review record: `projects/biology30-unit-a-pilot/meta/improvement-ledger.json`.
- Immutable textbook and PowerPoint sources: `projects/resources/biology30-unit-a-pilot/_sources/`.
- The source-visual preparer owns only `workspace/assets/source-visuals/` and `meta/source-visual-resource-report.json`; it never owns or rewrites canonical learner HTML.

## Fragile areas / what might drift

- Any learner-HTML change changes the workspace hash and requires a fresh full visual audit, opening every new contact sheet, and updating the ledger hashes.
- Keep every source image's `data-source-visual` ID, adjacent explanation, enlargement trigger, and exact textbook-page action synchronized with the source-visual contract.
- The image dialog temporarily moves the selected image into the dialog and restores it on close; focus return and source placement are covered by E2E and must not regress.
- Do not replace native action-potential, feedback-loop, or other interactive figures with raster source images.

## Next prompt assumptions

- The teacher should review the six placements in Lessons 3, 6, 9, 10, 12, and 13 and decide which source-image treatment should become an accepted Unit A rule.
- Review does not authorize production Unit A-D changes, automatic use of more source images, Studio Edit, promotion, commit, push, SCORM export, Brightspace upload, or publication.
- No visual rule transfers automatically to Units B-D.

## Exact next command

`npm run studio`

## Exact next file to open

`projects/biology30-unit-a-pilot/workspace/index.html`

## Do not do next / warnings

- Do not export or promote the eye image without resolving its reuse status.
- Do not bulk-import remaining textbook or slide imagery.
- Do not mark ledger rules accepted without explicit user review.
- Do not edit production `biology30-unit-a`, Units B-D, `raw/**`, or immutable source decks.
- Do not enable Studio Edit, promote, commit, push, export SCORM, upload to Brightspace, or publish without separate authorization.
- Do not stage, reset, clean, or disturb unrelated dirty-worktree paths.
