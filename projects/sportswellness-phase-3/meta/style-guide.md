# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- No external runtime dependencies detected in the generated workspace.

## Visual Signals
- No Tailwind color tokens detected.
- Hex colors: #243b33, #303b36, #68746d, #245a46, #dce3dc, #fff, #f7f8f4, #edf3ed, #a27537, #b9cdbf
- No repeated rounded-corner tokens detected.
- Motion and interaction tokens: transition, hover:not

## Interaction Notes
- Embeds iframe-based media or content.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
