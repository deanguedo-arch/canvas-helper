# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://unpkg.com/react@18/umd/react.development.js, https://unpkg.com/react-dom@18/umd/react-dom.development.js, https://unpkg.com/@babel/standalone/babel.min.js, https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js, https://www.youtube.com/embed/yRUAzGQ3nSY?rel=0

## Visual Signals
- Tailwind-style color tokens: sky-500, sky-100, amber-500, amber-100, emerald-500, emerald-100, rose-500, rose-100, orange-500, orange-100
- Hex colors: #f1f5f9, #8b5cf6, #10b981, #f59e0b, #f43f5e, #0ea5e9, #ddd6fe, #7e22ce, #fda4af, #a7f3d0
- Repeated shape tokens: rounded-[2rem, rounded-xl, rounded-2xl, rounded-lg, rounded-full, rounded-md, rounded-l, rounded-r, rounded-[3rem, rounded-3xl
- Motion and interaction tokens: transition-all, transition-colors, hover:text-rose-600, hover:border-violet-300, hover:-translate-y-1, hover:shadow-[0_6px_0_0_, active:translate-y-[2px, active:shadow-none, hover:opacity-100, hover:bg-lime-100

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
