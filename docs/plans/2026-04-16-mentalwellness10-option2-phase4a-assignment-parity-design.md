# Mental Wellness Option 2 Phase 4A Assignment Parity Design

## Goal

Bring `4A` (`Confidence`) onto the same authored assignment shell used by Phase 1, Phase 2, and Phase 3 while preserving the existing course logic around deposits, damage control, C-B-A routine, and narrative understanding.

## Scope

- Rebuild the live `phase4a` runtime in `workspace/assignment-runtime-main.js`
- Extend the shared assignment-shell selectors in `workspace/styles.css` to include `#view-phase4a`
- Add a dedicated regression test for Phase 4A shell/rubric parity
- Refresh ops handoff after verification

## Out of Scope

- Phase 4B
- Lesson-shell changes in `workspace/main.js`
- New content generation beyond what Phase 4A already promises in the current course contract

## Recommended Approach

Use the same pattern established in the Phase 3 pass:

1. Replace the old bespoke Phase 4A runtime block with a full shell builder
2. Keep the current five-step confidence structure, but render it with the shared Phase 1 shell language
3. Convert the review model from the legacy five-point shape to the three-level rubric contract
4. Normalize older `p4a_data` saves into the new rubric model instead of breaking load behavior
5. Update the print report so score labels, title, and fields match the rebuilt runtime
6. Extend the shared CSS selectors so Phase 4A inherits the same sizing, review, and field-card behavior as Phase 3

## Runtime Design

### Phase 4A shell

The rebuilt shell should include:

- `Assignment 04A`
- `Confidence Master Blueprint`
- Phase subtitle matching the existing course framing
- right rail with `Mastery score` and `File actions`
- authored step nav shell
- authored review grid and rubric table

### Step structure

Keep five steps:

1. `00 Briefing`
2. `01 The Bank`
3. `02 Damage Control`
4. `03 Conviction`
5. `04 Review`

### Confidence content contract

Preserve and clarify the current Phase 4A concepts:

- `Top Ten` mastery deposits
- daily `Effort / Success / Progress` deposits
- setback reframing and lockdown logic
- `Cue / Breathe / Attach` routine
- understanding narrative tying the system together

### Review model

Adopt the same three-level rubric model used by aligned Phase 2 and Phase 3 assignments:

- score buttons render as `1 / 2 / 3`
- readiness total updates to the correct lower maximum
- legacy `5 / 3 / 1` or previous five-button saves normalize into `3 / 2 / 1`

### Save/load and report flow

- Preserve `p4a_data` local storage key
- Preserve backup import/export
- Keep print-first browser PDF flow
- Update report copy to match the rebuilt title and new rubric scale

## Styling Design

Phase 4A should join the same shared selector groups used by Phase 3 for:

- desktop sizing
- shared typography
- field-card wrappers
- review grid
- rubric table
- step-nav shell and mobile toggle behavior

No new visual system should be introduced. Phase 4A should read as part of the same authored assignment family.

## Verification

- Add a failing Phase 4A regression test before implementation
- Run targeted Phase 2/3/4A assignment tests together after implementation
- Run `node --check` for the runtime file
- Run `npm.cmd run typecheck`
- Run `npm.cmd run build:studio`
- Run `npm run test:e2e:project -- --project mentalwellness10-option2`

## Risks

- Phase 4A still upgrades dormant HTML in place, so the JS remains the live source of truth
- Extending shared selectors to `#view-phase4a` increases the styling blast radius if future edits are careless
- Legacy score normalization must remain explicit or older saved browsers may drift or crash
