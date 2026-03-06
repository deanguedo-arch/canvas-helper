# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css

## Visual Signals
- Tailwind-style color tokens: gray-800, slate-900, blue-400, slate-300, blue-500, yellow-600, slate-50, slate-200, slate-800, blue-600
- Hex colors: #f8fafc, #ffffff, #3b82f6, #eff6ff, #1e3a8a, #bfdbfe, #1e293b, #fef3c7, #f59e0b, #dbeafe
- Repeated shape tokens: rounded-lg, rounded, rounded-t, rounded-b, rounded-xl, rounded-full
- Motion and interaction tokens: hover:bg-gray-100, transition-colors, hover:bg-gray-300, hover:bg-gray-50, hover:bg-blue-700, transition-transform, hover:scale-105, transition

## Interaction Notes
- No notable interaction heuristics detected.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
