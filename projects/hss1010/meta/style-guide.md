# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&amp;family=JetBrains+Mono:wght@500;700&amp;display=swap, https://drive.google.com/file/d/13YKR-wgOxlx_PLzIYfDd9H36NsfHVQeD/view?usp=sharing, https://drive.google.com/file/d/13YKR-wgOxlx_PLzIYfDd9H36NsfHVQeD/preview, https://goo.gl/vqoINQ, https://aidsinfo.nih.gov/, https://goo.gl/64zqgL, http://www.cdc.gov/hepatitis

## Visual Signals
- Tailwind-style color tokens: blue-500, slate-400, slate-900, slate-700, blue-600, slate-800, blue-400, emerald-500, slate-300, emerald-400
- Hex colors: #020617, #e2e8f0, #0f172a, #475569, #64748b, #3b82f6, #10b981, #ef4444, #334155, #cbd5e1
- Repeated shape tokens: rounded-xl, rounded-lg, rounded, rounded-2xl
- Motion and interaction tokens: transition-all, hover:text-white, hover:bg-slate-700, transition-colors, transition-opacity, hover:bg-blue-500, hover:underline, hover:bg-slate-600, hover:bg-emerald-600, hover:scale-105

## Interaction Notes
- Uses localStorage for persistence.
- Embeds iframe-based media or content.
- Reads local uploads with FileReader.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
