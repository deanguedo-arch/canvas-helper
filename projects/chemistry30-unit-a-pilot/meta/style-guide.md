# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: http://www.w3.org/2000/svg\, http://www.w3.org/2000/svg\\\, https://www.youtube-nocookie.com/embed/nmhZ-m90eus?rel=0&amp;playsinline=1&amp;cc_load_policy=1\, https://www.youtube.com/watch?v=nmhZ-m90eus\, https://www.youtube-nocookie.com/embed/8m_FCe5aCqY?rel=0&amp;playsinline=1&amp;cc_load_policy=1\, https://www.youtube.com/watch?v=8m_FCe5aCqY\, https://www.youtube-nocookie.com/embed/Bi_cWPbOt_A?rel=0&amp;playsinline=1&amp;cc_load_policy=1\, https://www.youtube.com/watch?v=Bi_cWPbOt_A\

## Visual Signals
- No Tailwind color tokens detected.
- Hex colors: #171b1b, #5b635d, #f7f8f5, #fff, #154212, #0e3510, #146c60, #a15c00, #a43f35, #d9ded8
- Repeated shape tokens: rounded
- Motion and interaction tokens: transition, transition-state

## Interaction Notes
- Uses localStorage for persistence.
- Embeds iframe-based media or content.
- Uses confirm dialogs for destructive actions.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
