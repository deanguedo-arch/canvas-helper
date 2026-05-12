# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://unpkg.com/@babel/standalone/babel.min.js, https://unpkg.com/react-dom@19.1.1/client?module, https://unpkg.com/react@19.1.1?module, https://unpkg.com/lucide-react@0.542.0?module

## Visual Signals
- Tailwind-style color tokens: slate-200, slate-600, sky-200, sky-50, slate-900, slate-700, sky-600, slate-300, slate-400, slate-500
- Hex colors: #ef4444, #fecaca, #1e293b, #020617, #0f172a, #111827
- Repeated shape tokens: rounded-full, rounded-xl, rounded-3xl, rounded-2xl
- Motion and interaction tokens: transition, hover:border-slate-200, hover:bg-white, hover:bg-slate-50, hover:bg-white/5, hover:text-white, hover:bg-sky-600, hover:text-slate-800

## Interaction Notes
- No notable interaction heuristics detected.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
