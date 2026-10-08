# Asset usage

## Production-ready
`assets/icons/*.svg`
- monochrome vector icons, intended to inherit/color with CSS where practical
- preferred for navigation, toolbars and status

`assets/decoration/*.svg`
- optional decorative marks only
- never required for comprehension

`assets/empty/*.svg`
- empty/recovery state illustration assets

`assets/thumbnails/*.webp`
- optional generic thumbnails
- safe to remove if the new tool has its own content imagery

`design/*.css`
- starting implementation system
- `tokens.css`: canonical design variables
- `components.css`: controls/cards/editor primitives
- `shell.css`: application shell and exact layout guidance

## Reference only
`reference/canonical/*.png`
- strongest visual authority

`reference/supporting/*.png`
- screen examples for components not visible in the canonical pair

`reference/do-not-slice/*.png`
- composition references only
- DO NOT crop buttons, chips, icons, cards or text from these images into production assets

## Recommended implementation
Use semantic HTML + CSS + provided SVGs. The web tool should visually match the references while remaining responsive, selectable, keyboard accessible and capable of rendering dynamic text/data.
