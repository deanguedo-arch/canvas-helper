# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- No external runtime dependencies detected in the generated workspace.

## Visual Signals
- No Tailwind color tokens detected.
- Hex colors: #2b2b2b, #666, #8a641f, #315f3b, #fff4d7, #eaf3e8, #ddd6c5, #f7f4eb, #f7d27a, #f3bd42
- No repeated rounded-corner tokens detected.
- No significant motion tokens detected.

## Interaction Notes
- No notable interaction heuristics detected.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
