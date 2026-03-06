# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://unpkg.com/react@18/umd/react.development.js, https://unpkg.com/react-dom@18/umd/react-dom.development.js, https://unpkg.com/@babel/standalone/babel.min.js, https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js, https://www.youtube.com/embed/yRUAzGQ3nSY?rel=0

## Visual Signals
- Tailwind-style color tokens: slate-100, slate-300, slate-800, violet-100, violet-700, violet-200, slate-600, slate-700, slate-500, violet-500
- Hex colors: #f1f5f9, #e2e8f0, #5b21b6, #bae6fd, #fde68a, #a7f3d0, #fecdd3, #ddd6fe, #8b5cf6, #10b981
- Repeated shape tokens: rounded-[2rem, rounded-full, rounded-xl, rounded-2xl, rounded-lg, rounded-md, rounded-l, rounded-r, rounded-[3rem, rounded-3xl
- Motion and interaction tokens: transition-all, hover:text-violet-700, transition-colors, hover:border-violet-300, active:bg-violet-100, hover:border-violet-200, hover:text-violet-600, active:translate-y-[2px, active:shadow-none, hover:text-rose-600

## Interaction Notes
- Uses localStorage for persistence.
- Embeds iframe-based media or content.
- Reads local uploads with FileReader.
- Uses canvas-confetti for celebratory interactions.
- Uses confirm dialogs for destructive actions.
- Includes print-specific Tailwind utility styling.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
