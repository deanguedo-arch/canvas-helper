# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,700;1,400;1,900&amp;family=JetBrains+Mono:wght@700&amp;display=swap, http://www.w3.org/2000/svg, https://drive.google.com/file/d/1my_sOJYdOLcvvQi4TQdkDJNUz6P7MvYY/preview, https://drive.google.com/file/d/1my_sOJYdOLcvvQi4TQdkDJNUz6P7MvYY/view?usp=sharing, https://drive.google.com/file/d/1DQvItijEudKroqUieRBKaJAqJJnzEa2x/preview, https://drive.google.com/file/d/1DQvItijEudKroqUieRBKaJAqJJnzEa2x/view?usp=sharing, https://drive.google.com/file/d/1XWwy8F27_0jupo8xdXO3oi2E4l9R4Rot/preview

## Visual Signals
- Tailwind-style color tokens: slate-800, sky-500, slate-500, slate-600, rose-500, amber-500, emerald-500, indigo-500, slate-900, slate-400
- Hex colors: #f59e0b, #a855f7, #10b981, #020617, #e2e8f0, #0f172a, #1e293b, #0ea5e9, #64748b, #38bdf8
- Repeated shape tokens: rounded-full, rounded-xl, rounded-lg, rounded-2xl, rounded-l, rounded-r, rounded-3xl, rounded
- Motion and interaction tokens: hover:text-white, hover:bg-slate-700, transition-all, hover:bg-sky-500, hover:bg-rose-500, hover:bg-amber-500, hover:bg-emerald-500, hover:bg-emerald-600, transition-colors, hover:bg-sky-400

## Interaction Notes
- Uses localStorage for persistence.
- Embeds iframe-based media or content.
- Reads local uploads with FileReader.
- Includes print-specific Tailwind utility styling.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
