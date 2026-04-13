# Design System Specification: The Creative Atelier

## 1. Overview & Creative North Star
**Creative North Star: "The Curated Studio"**
This design system moves away from the sterile, "app-like" interfaces of modern SaaS and instead embraces the tactile, imperfect beauty of a physical artist's studio. We are not building a grid of data; we are composing a canvas. 

The system breaks the "template" look by using **intentional asymmetry**, **overlapping layers**, and a **high-contrast typographic scale**. We treat the screen as a series of stacked watercolor papers and canvases. Elements should feel like they were placed by hand, using organic shapes and soft transitions rather than rigid, boxed-in containers.

---

## 2. Colors & Surface Philosophy
The palette is rooted in traditional pigments—Cadmium Red (`primary`), Ultramarine (`secondary`), and Ochre (`tertiary`).

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. We define boundaries through **Tonal Transitions**. To separate a sidebar or a new content section, shift the background color from `surface` to `surface-container-low` or `surface-container-highest`. This creates a sophisticated, "wash" effect similar to a watercolor background.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of paper.
*   **Base:** `surface` (#fffcf7) acts as your raw canvas.
*   **The Inset:** Use `surface-container-low` for large, recessed areas like a course curriculum list.
*   **The Lift:** Use `surface-container-highest` for active cards or floating panels. 
By nesting `surface-container-lowest` within a `surface-container` section, you create a natural visual lift that feels architectural rather than digital.

### The "Glass & Soul" Rule
To add professional polish, utilize **Glassmorphism** for navigation bars and floating action menus. Use a semi-transparent `surface` color with a `backdrop-filter: blur(12px)`. For main CTAs, do not use flat fills; use a subtle gradient transitioning from `primary` (#c0281f) to `primary-container` (#ffaca0) at a 45-degree angle to mimic the way wet oil paint catches the light.

---

## 3. Typography
The typography scale relies on the tension between the modern, expressive **Epilogue** and the editorial, literary **Newsreader**.

*   **Display & Headlines (Epilogue):** Used for "The Artist's Voice." These should be bold, slightly oversized, and often use tighter letter-spacing. Use `display-lg` for hero statements to command the page.
*   **Body & Titles (Newsreader):** Used for "The Instructor’s Guidance." This serif provides high legibility and a sense of history. 
*   **The Accent Rule:** Small labels (`label-md`) should often be set in `tertiary` (#925600) to act as "hand-written" annotations on the page.

---

## 4. Elevation & Depth
In this system, depth is organic, not mathematical.

*   **Tonal Layering:** Avoid shadows where background shifts can do the work. A `surface-container-high` card on a `surface` background provides enough contrast for a "soft lift."
*   **Ambient Shadows:** When an element must float (e.g., a modal or a floating video player), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(55, 56, 49, 0.06)`. Note the color: we use a tint of `on-surface` (#373831), never pure black.
*   **The Ghost Border:** If accessibility requires a border, use `outline-variant` at 15% opacity. It should be felt, not seen.
*   **Organic Shapes:** Apply `roundedness.xl` (1.5rem) to most containers, but occasionally break the symmetry by using a custom `border-radius` (e.g., `60% 40% 30% 70% / 60% 30% 70% 40%`) to mimic a hand-drawn brushstroke or a palette shape.

---

## 5. Components

### Buttons
*   **Primary:** A gradient fill (Primary to Primary-Container) with `roundedness.full`. On hover, increase the "glow" by shifting the shadow opacity.
*   **Secondary:** No fill. Use a "Ghost Border" and `secondary` (#5456c9) text.
*   **Tertiary:** No border or fill. Use `Newsreader` italic for a "sketchbook note" feel.

### Cards & Lists
*   **The "No Divider" Rule:** Do not use horizontal lines to separate list items. Use 24px of vertical white space or a 4px left-accent bar in `tertiary-fixed`.
*   **Canvas Cards:** Cards use `surface-container-low` with a subtle `outline-variant` ghost border. They should never have hard corners.

### Input Fields
*   **Text Inputs:** Use `surface-container-lowest` with a bottom-only border of 2px in `outline-variant`. When focused, the border transforms into a "brushstroke" (a slight thickness variation) in `primary`.

### Featured Component: The "Palette Selection" (Chips)
*   Instead of standard rectangles, selection chips should be organic, "blob" shapes. Selected states use `secondary-container` with `on-secondary-container` text, feeling like a dab of fresh paint on the interface.

---

## 6. Do's & Don'ts

### Do
*   **Do** allow elements to overlap. A heading can slightly bleed into an image container to create depth.
*   **Do** use asymmetrical margins. If the left margin is 80px, try making the right margin 120px to break the "web-template" feel.
*   **Do** use `tertiary` (#925600) for icons and small decorative elements to keep the "studio" warmth.

### Don't
*   **Don't** use 100% black. Use `on-surface` (#373831) for all "black" text to maintain the charcoal feel.
*   **Don't** use sharp 90-degree corners. Everything in art has a soft edge; our UI should too.
*   **Don't** use "Drop Shadows" on buttons. Use tonal shifts or ambient blurs. 
*   **Don't** clutter the "Canvas." If a screen feels busy, increase the background `surface` area. Space is as important as the paint.