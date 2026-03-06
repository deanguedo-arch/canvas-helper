# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://unpkg.com/react@18/umd/react.development.js, https://unpkg.com/react-dom@18/umd/react-dom.development.js, https://unpkg.com/@babel/standalone/babel.min.js, https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js, https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap

## Visual Signals
- Tailwind-style color tokens: slate-700, amber-50, amber-200, amber-100, amber-900, amber-500, violet-500, violet-600, violet-50, violet-100
- Hex colors: #f8fafc, #334155, #f1f5f9, #cbd5e1, #94a3b8, #e2e8f0, #8b5cf6, #6d28d9, #5b21b6, #475569
- Repeated shape tokens: rounded-2xl, rounded-xl, rounded-full, rounded-3xl
- Motion and interaction tokens: transition, transition-all, hover:bg-amber-100, transition-transform, hover:text-violet-600, hover:bg-slate-100, transition-colors, hover:bg-red-600, hover:bg-slate-50, active:translate-y-[6px

## Interaction Notes
- Uses localStorage for persistence.
- Reads local uploads with FileReader.
- Uses canvas-confetti for celebratory interactions.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
