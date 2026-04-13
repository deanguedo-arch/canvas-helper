# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://fonts.googleapis.com, https://fonts.gstatic.com, https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap

## Visual Signals
- No Tailwind color tokens detected.
- Hex colors: #020617, #e2e8f0, #94a3b8, #f8fafc, #8b5cf6, #38bdf8, #22c55e, #0f172a, #dbeafe, #cbd5e1
- No repeated rounded-corner tokens detected.
- Motion and interaction tokens: transition

## Interaction Notes
- No notable interaction heuristics detected.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
