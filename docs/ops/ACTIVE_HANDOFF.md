# Handoff

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Task: Lock module framing first (content then assignments) and harden planning derivation/linking so Experimental Psych can expand module-by-module using the forensics process
- Status: complete

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/curriculum-heuristics.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/course-blueprint.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/assessment-map.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-course-shell.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/course-shell.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/tests/course-planning.test.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/d2l-course-map.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/d2l-course-map.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/course-blueprint.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/assessment-map.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/index.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/unit-2--use-unit-2-answer-key-experimental-psychology-30-assignment-2-concepts-59dd4c3d.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/unit-3--use-unit-3-answer-key-experimental-psychology-30-assignment-3-concepts-4404f3a7.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/unit-4--use-unit-4-answer-key-experimental-psychology-30-assignment-4-concepts-2076bdd0.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/course-shell-data.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Hardened unit/module number detection to parse `Module N`, `Unit N`, and shorthand `M#`/`U#` patterns during planning.
- Added outline segmentation fallback that can derive units from `Module`/`Unit` headers when `Assignment #N Overview` blocks are missing.
- Added deterministic assessment linking: explicit module/unit number match is applied first, keyword fallback only when explicit match is absent.
- Added shell-build lock guard: if generated shell collapses to one module while multiple module/unit numbers are detectable, build fails unless `--allow-single-module-lock` is passed.
- Updated module rendering framing for Experimental Psych: active module now always renders `Module Content` first and `Assignments` second in stacked sections.
- Added explicit empty states: `No content found in this module.` and `No assignments found in this module.`
- Removed global content/assignment mode toggle for Experimental Psych and kept module-local grouping behavior.
- Regenerated planning artifacts in strict order (`d2l-map -> blueprint -> assessment-map -> lesson-packets -> build:course-shell`).
- Added/updated planning tests to cover number extraction and deterministic explicit assessment-to-unit mapping.

## Why this changed
- The project needed the same forensics workflow gate: structure lock first, then expansion.
- Experimental Psych framing needed to match module-local assignment grouping before adding more module content.
- The previous derivation risked collapsing structure when heading styles differed from `Assignment #N Overview` patterns.

## Source of truth
- Canonical editable entry: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`
- Canonical planning logic: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/course-blueprint.ts`, `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/assessment-map.ts`, `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/curriculum-heuristics.ts`, `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-course-shell.ts`
- Generated shell artifact: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/course-shell-data.js` (regenerate; do not hand-edit)

## Fragile areas / watchouts
- Course map ordering can still reflect source title ambiguity where titles lack explicit module numbers (for this dataset, `Extra Credits` appears before `Module 4` because `Extra Credits` has no explicit sequence label).
- Assignment classification still depends on metadata (`kind/resourceKind/renderHint`) and may need further tightening if imports use nonstandard labels.
- The archived backup `projects/processed/experimental-psych-30-per-1-a-b-sec-s-202632352/source.backup-20260324-073924/` is safety state and should not be committed.

## Next prompt should assume
- Module 1 framing lock is implemented and validated in automation.
- Expansion to modules `2+` should reuse this framing and bucketing behavior without one-off UI overrides.
- Planning artifacts should continue to be regenerated by pipeline commands, not hand-edited.

## What still needs validation
- Manual Studio QA for Module 1 readability and framing against the forensics reference surface.
- Human sign-off on module ordering policy for non-numbered titles (`Extra Credits`) versus strict numeric resequencing.

## Known risks
- If source titles stay inconsistent, auto-sequencing may continue to produce edge-case ordering that is technically stable but not instructor-preferred.
- Existing unrelated repo changes remain in working tree and were intentionally excluded from scoped commit.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`

## Do not do next / warnings
- Do not edit `projects/experimental-psych-30-per-1-a-b-sec-s-202632352/raw/**`.
- Do not hand-patch `workspace/course-shell-data.js`; rerun the planning pipeline.
- Do not commit the processed source backup directory.
