# Studio Glass Visual Design

## Summary

Shift the Studio interface to an Apple-like glass direction across the full shell: top bar, pane shells, control rows, preview framing, and inspector cards. The goal is not maximal blur, but layered translucency with strong readability and a calm editing atmosphere.

## Visual Direction

Target the middle intensity level: Apple-like glass.

This means:

- Frosted translucent surfaces instead of opaque cards.
- Soft luminous borders instead of hard gray outlines.
- Layered depth using blur, backdrop filtering, inner highlights, and restrained shadow.
- A gentle atmospheric background so the glass surfaces have something to sit on.
- Controls that feel like floating utility tools rather than flat form blocks.

## Design Rules

### Readability First

- All glass surfaces must preserve text contrast.
- Preview content remains more neutral and stable than the outer chrome.
- Blur should support depth, not obscure controls.

### Hierarchy

- Top bar: thinnest, cleanest glass layer.
- Pane shells: strongest glass presence.
- Control rows: lighter internal glass strips inside each pane.
- Inspector cards: slightly denser glass so dense text remains readable.
- Preview frame interior: mostly neutral white surface with mild shadow.

### Restraint

- Avoid neon glows or exaggerated transparency.
- Avoid turning every element into a separate floating bubble.
- Keep animation subtle or omit it if it risks visual noise.

## Surface Treatment

### Background

- Introduce a more atmospheric background with soft radial color blooms and subtle tonal movement in the base canvas.
- Keep the palette warm and pale rather than dark or saturated.

### Glass Panels

- Use translucent white or cream-tinted surfaces.
- Apply `backdrop-filter: blur(...)` and a softer semi-transparent border.
- Add a faint top-edge highlight for the Apple-like polished feel.
- Reduce opaque fills that currently make cards feel boxed-in.

### Shadows

- Prefer soft floating shadows with low contrast.
- Use depth differences between top bar, pane shells, and inner control strips.
- Avoid heavy dark shadows that fight the light glass feel.

## Component-Level Changes

### Top Bar

- Make the top bar a thin frosted strip.
- Keep `Studio` as the only title.
- Utility buttons should look like integrated glass controls.

### Preview Panes

- Pane containers become primary glass cards.
- Pane headers should feel embedded into the card, not like a separate section stacked above it.
- Control rows should feel like inner trays within the pane.

### Control Rows

- Flatten the current form-like boxes into lighter glass rails.
- Dropdowns should feel inset and refined, with gentler borders and slightly more polish.
- Secondary actions like `Match`, `Open Extracted Text`, and `Show Output` should read as utility chips.

### Inspector

- Inspector cards should match the same glass family, but with slightly denser surface opacity for readability.
- Dense content areas such as logs and extracted text remain more solid than the outer shell.

### Preview Stage

- Outer preview stage gets a glass wrapper.
- Inner preview surface remains visually stable and more neutral to preserve the actual module content.

## Scope

Primary files:

- `app/studio/src/styles.css`
- `app/studio/src/App.tsx`

No dependency changes.

## Acceptance Criteria

- The Studio shell reads as a cohesive glass system rather than a collection of opaque cards.
- The top bar, panes, control rows, and inspector visually belong to the same design family.
- Text remains readable and controls remain easy to operate.
- The previewed module content still stands out clearly from the Studio chrome.
- `npm run typecheck` and `npm run build:studio` pass.
