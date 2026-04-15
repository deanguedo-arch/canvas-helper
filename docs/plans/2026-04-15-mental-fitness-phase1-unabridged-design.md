# Mental Fitness Phase 1 Unabridged Design

## Goal

Rebuild `Phase 1: The Engine` in `mentalwellness10-option2` so the phase view preserves the chapter in near-original order and wording, while keeping the end quiz separated into `Quizzes`.

## Approved direction

- Preserve the chapter flow as designed.
- Keep the current approved hero image and the existing extracted figure set unless the new Word source contains missing figures that clearly belong in the chapter.
- Keep the current Option 2 shell, navigation, and phase-reader layout.
- Exclude the quiz from the phase body and leave it in the quiz flow.

## Content rules

- Maintain near-original wording and section order from the Word source.
- Do not summarize or reframe the chapter into a lighter web rewrite.
- Keep glossary, tables, and callout material where present.
- Do not change the separate quiz routing or quiz gating logic.

## Implementation boundary

- Modify only:
  - `projects/mentalwellness10-option2/workspace/main.js`
  - `projects/mentalwellness10-option2/workspace/assets/readings/phase1-figures/**` if the new Word source contains missing figure assets
- Add planning docs only under `docs/plans/`

## Risks

- Word structure may contain decorative artifacts that do not belong in the phase body.
- Figure placement may need manual judgment where the source document uses floating layout.
- The current reader renderer is text-first, so fidelity depends on mapping the source into the existing section schema cleanly.

## Success criteria

- `Phase 1` reads as an unabridged chapter pass minus the quiz.
- Current approved images remain intact.
- Any missing source figures are added only if they belong in the chapter flow.
- `Quiz 01` remains separate and unchanged.
