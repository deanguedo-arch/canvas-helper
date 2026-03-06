# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css, https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&amp;fit=crop&amp;w=1600&amp;q=80, https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&amp;fit=crop&amp;w=600&amp;q=80, https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?auto=format&amp;fit=crop&amp;w=800&amp;q=80, https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&amp;fit=crop&amp;w=1600&amp;q=80, https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?auto=format&amp;fit=crop&amp;w=1600&amp;q=80, https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&amp;fit=crop&amp;w=1600&amp;q=80

## Visual Signals
- Tailwind-style color tokens: gray-800, slate-900, slate-300, slate-950, slate-800, blue-500, slate-500, slate-400, blue-400, slate-700
- Hex colors: #ef4444, #fca5a5, #fef2f2, #3b82f6, #93c5fd, #eff6ff, #10b981, #6ee7b7, #ecfdf5, #e11d48
- Repeated shape tokens: rounded-full, rounded, rounded-lg, rounded-t, rounded-b, rounded-xl
- Motion and interaction tokens: transition-all, transition-colors, hover:bg-slate-800, hover:text-white, hover:bg-slate-700, hover:bg-gray-300, hover:bg-gray-50, hover:bg-blue-700, transition-transform, hover:scale-105

## Interaction Notes
- No notable interaction heuristics detected.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
