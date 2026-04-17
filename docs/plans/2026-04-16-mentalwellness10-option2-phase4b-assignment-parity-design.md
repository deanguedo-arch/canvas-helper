# Mental Wellness Option 2 Phase 4B Assignment Parity Design

## Goal

Bring `4B` (`Visualization`) onto the same authored assignment shell used by Phase 1, Phase 2, Phase 3, and Phase 4A while preserving the existing course logic around sanctuary building, multisensory scripting, reset rehearsal, and narrative understanding.

## Scope

- Rebuild the live `phase4b` runtime in `workspace/assignment-runtime-main.js`
- Extend the shared assignment-shell selectors in `workspace/styles.css` to include `#view-phase4b`
- Add a dedicated regression test for Phase 4B shell/rubric parity
- Refresh ops handoff after verification

## Out of Scope

- Lesson-shell changes in `workspace/main.js`
- Phase 4A structural changes beyond shared selector updates
- New content generation beyond what Phase 4B already promises in the current course contract

## Recommended Approach

Use the same pattern established in the Phase 4A pass:

1. Replace the old bespoke Phase 4B runtime block with a full shell builder
2. Keep the current five-step visualization structure, but render it with the shared Phase 1 shell language
3. Convert the review model from the legacy five-point shape to the three-level rubric contract
4. Normalize older `athlete_visualization_master_v1` saves into the new rubric model instead of breaking load behavior
5. Update the print report so score labels, title, and fields match the rebuilt runtime
6. Extend the shared CSS selectors so Phase 4B inherits the same sizing, review, and field-card behavior as the aligned assignments

## Runtime Design

### Phase 4B shell

The rebuilt shell should include:

- `Assignment 04B`
- `Visualization Master Blueprint`
- Phase subtitle matching the existing course framing
- right rail with `Mastery score` and `File actions`
- authored step nav shell
- authored review grid and rubric table

### Step structure

Keep five steps:

1. `00 Briefing`
2. `01 Sanctuary`
3. `02 Performance`
4. `03 Reset`
5. `04 Review`

### Visualization content contract

Preserve and clarify the current Phase 4B concepts:

- mental sanctuary setup
- anchor object and object manipulation details
- visual, auditory, kinesthetic, and emotional scripting
- flat-tire or glitch rehearsal with a dominant reset
- master script synthesis and understanding narrative

### Review model

Adopt the same three-level rubric model used by aligned Phase 2, Phase 3, and Phase 4A assignments:

- score buttons render as `1 / 2 / 3`
- readiness total updates to the correct lower maximum
- legacy `5 / 3 / 1` or previous five-button saves normalize into `3 / 2 / 1`

### Save/load and report flow

- Preserve `athlete_visualization_master_v1` local storage key
- Preserve backup import/export
- Keep print-first browser PDF flow
- Update report copy to match the rebuilt title and new rubric scale

## Styling Design

Phase 4B should join the same shared selector groups used by Phase 4A for:

- desktop sizing
- shared typography
- field-card wrappers
- review grid
- rubric table
- step-nav shell and mobile toggle behavior

No new visual system should be introduced. Phase 4B should read as part of the same authored assignment family.

## Verification

- Add a failing Phase 4B regression test before implementation
- Run targeted Phase 2/3/4A/4B assignment tests together after implementation
- Run `node --check` for the runtime file
- Run `npm.cmd run typecheck`
- Run `npm.cmd run build:studio`
- Run `npm run test:e2e:project -- --project mentalwellness10-option2`

## Risks

- Phase 4B still upgrades dormant HTML in place, so the JS remains the live source of truth
- Extending shared selectors to `#view-phase4b` increases the styling blast radius if future edits are careless
- Legacy score normalization must remain explicit or older saved browsers may drift or crash
