---
name: Academic Precision
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#42493e'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#5d5e61'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e5'
  on-secondary-container: '#636467'
  tertiary: '#303c34'
  on-tertiary: '#ffffff'
  tertiary-container: '#47534a'
  on-tertiary-container: '#b9c6bb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcf0ae'
  primary-fixed-dim: '#a1d494'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#23501e'
  secondary-fixed: '#e2e2e5'
  secondary-fixed-dim: '#c6c6c9'
  on-secondary-fixed: '#1a1c1e'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#d9e6da'
  tertiary-fixed-dim: '#bdcabe'
  on-tertiary-fixed: '#131e17'
  on-tertiary-fixed-variant: '#3e4a41'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  success-green: '#2D5A27'
  ink-dark: '#1A1C1E'
  alert-red: '#BA1A1A'
  surface-muted: '#F1F3F4'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1140px
  gutter: 20px
---

## Brand & Style
The design system is a modern, educational framework designed for high-clarity learning environments. It balances the authoritative weight of traditional academia with the streamlined efficiency of contemporary SaaS. The aesthetic is **Corporate / Modern** with a strong emphasis on content hierarchy and instructional design. It prioritizes legibility and a sense of progress, making financial literacy feel approachable yet rigorous.

The visual direction uses generous negative space to reduce cognitive load, while using high-contrast typography and subtle structural elements to guide the learner's eye through modular units of information.

## Colors
The palette is rooted in a professional "Forest Green" and "Obsidian" pairing, replacing the source material's blue/red scheme to align with the provided brand assets.

- **Primary (#2D5A27):** Used for actionable items, active states, and progress indicators. It signifies growth and stability.
- **Secondary (#1A1C1E):** Reserved for high-level headings and heavy structural components. 
- **Tertiary (#E8F5E9):** A soft tint used for highlight containers, module backgrounds, and subtle callouts.
- **Neutral (#F8F9FA):** The foundation for the page, providing a crisp, clean canvas that prevents visual fatigue during long reading sessions.

## Typography
The typography system uses a tri-font approach to maximize information scent:
- **Headlines:** Use *Hanken Grotesk* for its sharp, contemporary geometry, providing a clear "anchor" for each section.
- **Body:** Use *Work Sans* for its exceptional readability at small sizes and neutral character, ideal for dense educational content.
- **Labels:** Use *IBM Plex Sans* to introduce a technical, systematic feel to metadata, tags, and form labels.

Maintain a strict vertical rhythm by using a 4px baseline grid. Body text should always prioritize line length (max 65 characters) to ensure optimal reading speed.

## Layout & Spacing
The layout follows a **Fluid-to-Fixed Grid** model. On mobile devices, the system uses a single-column layout with 16px side margins. As the viewport expands to desktop, it transitions to a 12-column grid within a max-width container of 1140px.

Spacing is strictly mathematical, built on multiples of 4px. Use `lg` (40px) spacing between major sections and `sm` (16px) for internal component padding. Group related content using "proximity logic"—elements within a lesson block should be significantly closer together than the blocks themselves.

## Elevation & Depth
This design system utilizes **Tonal Layers** rather than heavy shadows to maintain a clean, academic look. 

- **Surface 0:** The primary background (`#F8F9FA`).
- **Surface 1:** Content cards and modules use a pure white background (`#FFFFFF`) with a subtle 1px border in `surface-muted` to define boundaries.
- **Interactive Elevation:** Only active components like primary buttons or "hovered" lesson cards use a soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) to suggest interactivity.
- **Overlays:** Modals and tooltips utilize a 10% opacity backdrop blur to focus the learner’s attention on the current task.

## Shapes
The shape language is **Soft (0.25rem)**. This subtle rounding removes the clinical "hardness" of sharp corners while maintaining a professional, structured appearance. 

- **Standard Elements:** Buttons, input fields, and tags use the base 4px radius.
- **Large Containers:** Content cards and instructional blocks use `rounded-lg` (8px) to feel distinct from the page background.
- **Visual Assets:** Images and charts should follow the 8px rounding to ensure visual cohesion across the platform.

## Components
- **Buttons:** Primary buttons use a solid Forest Green background with white text. Secondary buttons use an outline style with 1.5px borders. All buttons have a minimum height of 44px for touch-friendliness.
- **Progress Cards:** Use a 4px tall horizontal bar in Primary Green at the top of cards to indicate completion status.
- **Instructional Callouts:** Use the Tertiary light green background with a thick 4px left-border in Primary Green to highlight "Key Takeaways" or "Tips."
- **Input Fields:** Use a 1px `surface-muted` border that thickens and changes to Primary Green on focus. Labels should be positioned above the field in `label-md` style.
- **Chips/Tags:** Used for categorization (e.g., "Beginner," "Investing"). These use the `label-md` typography and a very light gray fill to avoid competing with primary actions.
- **Brightspace Adaptation:** Ensure all components use relative units (rem/em) to inherit the base font size of the Brightspace environment while maintaining internal proportions.