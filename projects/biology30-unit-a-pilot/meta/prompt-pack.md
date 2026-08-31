# Biology 30 Unit A Pilot — improvement contract

- Workflow: generated-course improvement pilot
- Canonical learner page: `projects/biology30-unit-a-pilot/workspace/index.html`
- Protected baseline: `projects/biology30-unit-a-pilot/raw/`
- Studio authoring driver: `direct-workspace-v1`
- Status: blocked and preview-only while improvements are evaluated
- Starting Unit A tree SHA-256: `4908245ee9e176d647e0f927e1fc3f7db99009a8b50ec7e8ec9a86708a6524f0`

## Purpose

Use this standalone copy to improve Unit A deliberately. Preserve the production Unit A and Units B-D while the pilot establishes a stronger academic, visual, interaction, practice, accessibility, and learner-experience standard.

## Source ownership

- Edit only the canonical pilot files under `projects/biology30-unit-a-pilot/workspace/**` and operational records under `projects/biology30-unit-a-pilot/meta/**`.
- Never edit `raw/**`; it is the exact starting snapshot.
- Never run `build:biology30-unit-a-v2` against this slug. The original Biology renderer owns `biology30-unit-a`, not this direct pilot.
- Never hand-edit or rebuild `biology30-unit-a`, `biology30-unit-b`, `biology30-unit-c`, or `biology30-unit-d` as part of pilot work.
- Keep learner response IDs and persistence keys under the `biology30-unit-a-pilot:` namespace.
- Keep the course preview-only. Do not enable Studio Edit, export, SCORM, upload, or publication until a separate readiness and acceptance phase.

## Improvement loop

1. Record the current learner-facing weakness and its evidence.
2. Make the smallest coherent improvement in the pilot canonical workspace.
3. Verify academic accuracy, responsive layout, keyboard use, accessibility, offline behavior, and persistence in proportion to the change.
4. Record the accepted before-and-after principle in `meta/improvement-ledger.json`.
5. Classify the rule as shared-shell, renderer, content, figure, interaction, practice, or review-process work.
6. State whether the rule applies automatically, conditionally, or not at all to Units B-D.

The pilot is not complete merely because it looks better. Its accepted rules must be specific enough to test and to translate through the separate B-D owning builder.
