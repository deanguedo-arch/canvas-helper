# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://unpkg.com/react@18/umd/react.development.js, https://unpkg.com/react-dom@18/umd/react-dom.development.js, https://unpkg.com/@babel/standalone/babel.min.js, https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js, https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap

## Visual Signals
- Tailwind-style color tokens: violet-50, violet-100, violet-700, violet-200, violet-900, rose-50, rose-100, rose-600, rose-200, rose-900
- Hex colors: #f8fafc, #334155, #f1f5f9, #cbd5e1, #94a3b8, #e2e8f0, #8b5cf6, #6d28d9, #5b21b6, #475569
- Repeated shape tokens: rounded-xl, rounded-2xl, rounded-full, rounded-3xl, rounded, rounded-br, rounded-[2rem, rounded-[1.5rem, rounded-[1.75rem
- Motion and interaction tokens: transition, hover:bg-slate-200, hover:text-slate-700, transition-colors, transition-all, hover:bg-slate-100, hover:bg-slate-50, hover:bg-slate-600, hover:bg-white, active:translate-y-[6px

## Interaction Notes
- Uses localStorage for persistence.
- Uses canvas-confetti for celebratory interactions.
- Includes print-specific Tailwind utility styling.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
