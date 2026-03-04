# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://unpkg.com/react@18/umd/react.production.min.js, https://unpkg.com/react-dom@18/umd/react-dom.production.min.js, https://unpkg.com/@babel/standalone/babel.min.js, https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js

## Visual Signals
- Tailwind-style color tokens: slate-900, blue-400, slate-400, slate-800, blue-500, slate-200, blue-600, blue-700, blue-50, slate-500
- Hex colors: #f8fafc, #0f172a, #ff0000, #000000
- Repeated shape tokens: rounded-lg, rounded-xl, rounded-bl, rounded-2xl, rounded, rounded-br, rounded-t
- Motion and interaction tokens: transition-colors, hover:text-slate-800, hover:bg-slate-50, hover:bg-slate-600, transition-all, hover:bg-slate-200, hover:bg-slate-100, hover:border-blue-500, hover:text-blue-700

## Interaction Notes
- Uses canvas-confetti for celebratory interactions.
- Includes print-specific Tailwind utility styling.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
