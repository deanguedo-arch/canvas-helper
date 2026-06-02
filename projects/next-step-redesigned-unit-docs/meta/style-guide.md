# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://fonts.googleapis.com, https://fonts.gstatic.com, https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&amp;display=swap, https://unpkg.com/react@18/umd/react.development.js, https://unpkg.com/react-dom@18/umd/react-dom.development.js, https://unpkg.com/@babel/standalone/babel.min.js

## Visual Signals
- Tailwind-style color tokens: slate-950, slate-50, indigo-500, indigo-100, slate-200, slate-900, slate-300
- No inline hex colors detected.
- Repeated shape tokens: rounded-[2rem, rounded-full, rounded-2xl
- No significant motion tokens detected.

## Interaction Notes
- No notable interaction heuristics detected.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
