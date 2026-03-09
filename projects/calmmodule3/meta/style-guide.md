# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap

## Visual Signals
- Tailwind-style color tokens: slate-900, slate-800, blue-600, blue-400, slate-700, blue-500, slate-300, blue-950, blue-900, slate-400
- Hex colors: #334155, #64748b, #3b82f6, #22c55e, #ef4444, #475569, #0f172a, #020617, #e2e8f0, #ffffff
- Repeated shape tokens: rounded-lg, rounded-2xl, rounded-full, rounded-r, rounded-xl, rounded, rounded-md
- Motion and interaction tokens: hover:bg-blue-500, transition-all, transition-opacity, hover:bg-slate-700, transition-colors, transition, hover:text-white, hover:bg-slate-800

## Interaction Notes
- No notable interaction heuristics detected.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
