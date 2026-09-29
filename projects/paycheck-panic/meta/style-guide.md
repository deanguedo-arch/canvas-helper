# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- No external runtime dependencies detected in the generated workspace.

## Visual Signals
- No Tailwind color tokens detected.
- Hex colors: #95d5b2, #101d14, #1d5c34, #0d2b1d, #ffe14d, #7a4d00, #d8f3dc, #fff, #b7e4c7, #f5a623
- Repeated shape tokens: rounded
- Motion and interaction tokens: transition, active:false

## Interaction Notes
- Uses localStorage for persistence.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
