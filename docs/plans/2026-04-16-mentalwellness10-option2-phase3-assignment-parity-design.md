# Mental Wellness Option 2 Phase 3 Assignment Parity Design

**Project:** `mentalwellness10-option2`  
**Date:** `2026-04-16`

## Goal

Bring the Phase 3 assignment up to the same authored shell, sizing, rubric, and print quality as the finished Phase 2 work while preserving Phase 3's concentration-specific content.

## Current State

- Phase 3 still uses the older assignment runtime in `projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`.
- The current review uses a five-point scale even though the assignment pattern now uses a three-level rubric (`Proficient / Developing / Emerging`).
- The print export still brands itself as a generic `Phase 3 Mastery Report` and uses the older `/25` scoring model.
- Shared shell sizing and field-card fixes currently target Phase 1 and Phase 2, but not the live Phase 3 runtime.

## Approved Direction

Use the Phase 1 shell language as the canonical assignment surface for Phase 3, the same way Phase 2 now works.

This means:

- a proper assignment hero with a score rail and file-action rail
- Phase 1 step navigation and mobile step menu behavior
- authored step sections with clearer hierarchy and field-card structure
- a three-level review rubric instead of a five-point scale
- a print-first report that matches the upgraded shell and rubric

## Content Contract

The upgraded Phase 3 pass should keep and clarify the strongest concentration ideas already present in the project:

- spotlight control
- internal versus external distracters
- Self 1 versus Self 2
- quiet eye
- instructional versus motivational cues
- physical anchors
- fortress routine
- what-if reset logic

The live step flow should align to the assignment contract in `main.js`:

1. `00 Briefing`
2. `01 Spotlight Audit`
3. `02 Cue Builder`
4. `03 Fortress Plan`
5. `04 Review`

## Implementation Shape

### Runtime

`projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`

- replace the old Phase 3 shell with a dedicated runtime-built shell
- normalize review scoring onto a shared three-level rubric pattern
- preserve legacy local saves by mapping older score values into the new scale
- upgrade the print report to the same polished print-to-PDF style used by the other rebuilt assignments

### Styling

`projects/mentalwellness10-option2/workspace/styles.css`

- extend the shared assignment shell selectors so Phase 3 inherits the same sizing contract as Phase 1 and Phase 2
- add explicit Phase 3 field-card selectors so textarea/input layouts do not clip under the shared shell sizing layer

### Testing

`scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts`

- lock the new shell markers
- lock the three-level rubric scale and legacy-score normalization
- lock the shared sizing/field-card selectors that now include `#view-phase3`

## Risks

- Phase 3 still depends on runtime-built HTML over dormant static markup, so selector drift remains the main maintenance risk.
- The shared CSS layer now spans more assignments, so any later shell-size edits should be validated against Phase 1, Phase 2, and Phase 3 together.
- Older `p3_data` saves should continue to load, but new fields will naturally be blank for users with older storage payloads.

## Verification Floor

- targeted Phase 3 regression test
- `node --check projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`
- `npm run test:e2e:project -- --project mentalwellness10-option2`
