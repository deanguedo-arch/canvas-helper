# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com, https://unpkg.com/lucide@latest, https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;family=Lora:italic,wght@0,400;0,700;1,400&amp;display=swap

## Visual Signals
- Tailwind-style color tokens: slate-50, slate-900, slate-200, indigo-700, slate-400, slate-500, indigo-600, indigo-200, slate-100, indigo-50
- Hex colors: #f1f5f9, #cbd5e1, #94a3b8, #e2e8f0, #f8fafc, #4f46e5, #f59e0b
- Repeated shape tokens: rounded-xl, rounded-full, rounded-2xl, rounded-[2rem, rounded, rounded-[2.5rem, rounded-3xl, rounded-sm
- Motion and interaction tokens: transition-all, hover:text-indigo-600, hover:border-indigo-200, hover:bg-indigo-700, hover:-translate-y-0.5, active:translate-y-0, hover:bg-indigo-50, hover:border-slate-300, hover:bg-slate-50/50, transition-colors

## Interaction Notes
- No notable interaction heuristics detected.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
