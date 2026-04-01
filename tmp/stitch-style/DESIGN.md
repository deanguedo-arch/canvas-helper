```markdown
# Design System Specification: Digital Forensic Intelligence

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Silent Observer."** 

Unlike consumer applications that shout for attention, this system embodies the cold, clinical precision of a high-tech forensic lab. It rejects "standard" UI templates in favor of a sophisticated, layered environment that feels like a tactical heads-up display (HUD). We achieve this through **Intentional Asymmetry**—where data-heavy sidebars contrast with expansive, breathing canvases—and **Tonal Depth**, replacing traditional lines with shifted light and texture. The goal is to make the investigator feel they are peering into a digital microscope: every pixel is evidence; every interaction is an extraction.

## 2. Color & Atmospheric Surface Strategy
The palette is built on a foundation of obsidian and deep mineral tones, punctuated by high-alert primary accents.

### Surface Hierarchy & The "No-Line" Rule
To achieve a premium, editorial feel, **1px solid borders are strictly prohibited** for sectioning. Boundaries must be defined through background color shifts or subtle tonal transitions.

*   **The Foundation:** Use `surface` (#131314) for the main application background.
*   **The Nesting Principle:** Use the `surface-container` tiers to create hierarchy. A `surface-container-low` (#1c1b1c) sidebar should sit on the `surface` background. Inside that sidebar, individual modules or cards should use `surface-container-highest` (#353436). This creates "natural" containment without the visual clutter of lines.
*   **The Glass & Gradient Rule:** For floating panels (like command palettes or evidence previews), use `surface-container-low` with a 70% opacity and a `20px` backdrop-blur. 
*   **Signature Textures:** Main CTAs or active data streams should utilize a subtle linear gradient from `primary` (#ffb4a9) to `primary_container` (#7e3b32) at a 135-degree angle to provide a "pulsing" tactical energy.

## 3. Typography: Technical Authority
We pair high-contrast scales to differentiate between "System Intelligence" and "Human Interface."

*   **Display & Headlines (Space Grotesk):** Use for high-level telemetry and section titles. The wide apertures and geometric forms convey a futuristic, high-tech authority.
    *   *Headline-LG:* 2rem. Use sparingly for dashboard headers.
*   **Body & Titles (Inter):** Use for narrative reports and user-generated notes. Inter provides the legibility required for long-form analysis.
*   **Labels & Technical Data (Monospace Fallback):** While the system defaults to Space Grotesk for labels, all raw forensic data (hashes, hex codes, timestamps) must be rendered in a monospace font to ensure character alignment and a "terminal" aesthetic.
*   **The Weight Ratio:** Maintain high contrast between `title-lg` (Inter, Semibold) and `label-sm` (Space Grotesk, Medium).

## 4. Elevation & Depth
In this design system, depth is a function of light, not physics.

*   **Tonal Layering:** Avoid shadows for static elements. Instead, "stack" your tokens: Place a `surface-container-lowest` card onto a `surface-container-low` section. The slight darkness creates a recessed, "etched" look into the UI.
*   **Ambient Shadows:** For high-level modals, use an extra-diffused shadow: `0px 24px 48px rgba(0, 0, 0, 0.4)`. The shadow must never be neutral grey; it should be a tinted version of `surface_container_lowest`.
*   **The "Ghost Border" Fallback:** If a container requires a border for accessibility (e.g., an input field), use `outline-variant` at **15% opacity**. This creates a "scanned-effect" edge that feels like a laser guide rather than a box.
*   **Tactical Grids:** Overlay a subtle 20px dot grid or a 1px scanline pattern (opacity 3%) over `surface-container-lowest` backgrounds to reinforce the "Digital Investigation" theme.

## 5. Component Logic

### Buttons & CTAs
*   **Primary:** A solid block of `primary` (#ffb4a9) with `on-primary` (#571d16) text. Shape: `sm` (0.125rem) radius for a sharp, tactical edge.
*   **Secondary:** `surface-container-highest` background with a `Ghost Border` of `primary`.
*   **Tertiary:** Ghost button using `on-surface-variant` text. High-contrast hover state using `primary_fixed`.

### Input Fields & Forensic Data
*   **Inputs:** Background must be `surface-container-lowest`. No bottom line; only a "Ghost Border" on all sides. Use `label-sm` for floating labels.
*   **Selection Chips:** Use `secondary-container` (#4c463e) with `on-secondary-container` (#bdb4aa) text. For "Critical Evidence" chips, use `error_container` with `on_error_container`.

### Evidence Cards & Lists
*   **The No-Divider Rule:** Forbid the use of divider lines in lists. Use `0.6rem` (Spacing 3) of vertical whitespace or a subtle background shift (alternating `surface-container-low` and `surface-container-lowest`) to separate data rows.
*   **Tactical Iconography:** Use 1.5px stroke-weight icons. Icons should be enclosed in a `surface-variant` square with a `0.125rem` radius to mimic a "scanned" asset.

### Tooltips
*   Use `inverse-surface` with `inverse-on-surface` text. Apply a `0px` radius (square corners) to emphasize the technical, non-consumer nature of the application.

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts (e.g., an 8-column main view paired with a 3-column detail pane).
*   **Do** lean into "monochromatic" sections, using only `primary` for the most critical points of interest (POI).
*   **Do** use `0.2rem` (Spacing 1) for tight technical data clusters and `3.5rem` (Spacing 16) for major section breathing room.

### Don't
*   **Don't** use rounded corners larger than `0.375rem` (md). High-tech forensics requires precision; excessive roundness feels too "soft."
*   **Don't** use standard blue for links. Use `primary` or `tertiary_fixed` for all interactive triggers.
*   **Don't** use 100% opaque white (#FFFFFF). Always use `on_surface` (#e5e2e3) to reduce eye strain in dark-room forensic environments.
*   **Don't** use drop shadows on buttons. Use color-fills or "Ghost Borders" to indicate state.