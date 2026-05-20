---
name: High Performance Wellness System
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#909097'
  outline-variant: '#46464c'
  surface-tint: '#c0c6de'
  primary: '#c0c6de'
  on-primary: '#2a3043'
  primary-container: '#020617'
  on-primary-container: '#72778d'
  inverse-primary: '#585e73'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#100400'
  on-tertiary-container: '#ba6002'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1fb'
  primary-fixed-dim: '#c0c6de'
  on-primary-fixed: '#151b2d'
  on-primary-fixed-variant: '#40465a'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
  oxygen-blue: '#38BDF8'
  kinetic-orange: '#FB923C'
  stadium-white: '#F8FAFC'
  track-navy: '#0F172A'
  performance-success: '#22C55E'
  recovery-danger: '#EF4444'
typography:
  display-lg:
    fontFamily: Archivo Narrow
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Archivo Narrow
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  headline-xl-mobile:
    fontFamily: Archivo Narrow
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  title-lg:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  section-kicker:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.15em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.7'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  status-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter-md: 16px
  margin-edge: 24px
  card-gap: 20px
  max-width-desktop: 1280px
  max-width-log: 1000px
---

## Brand & Style

The design system shifts the HSS 1010 interface from a clinical academic tool to a high-performance sports wellness platform. The brand personality is focused, energetic, and data-driven, designed to evoke the intensity of an elite athletic training environment while remaining supportive and accessible for student learning.

The visual style is a hybrid of **Corporate Modern** and **High-Contrast Bold**. It utilizes a deep, immersive dark-mode shell that mirrors high-end performance tracking apps, contrasted with crisp, clean "Stadium White" work areas. The mood is professional yet aggressive, using sharp typography and vibrant energy accents to drive engagement and maintain focus on peak physical and mental wellness.

Key design pillars include:
- **Athletic Precision:** Utilizing tight grids and technical typography.
- **Energy Injection:** High-visibility accents to highlight critical data and performance milestones.
- **Mental Clarity:** Clear separation between instructional "coaching" content and "athlete" assessment zones.

## Colors

The palette is anchored in a **Track Navy** and deep slate base to maintain a focused, low-distraction environment. 

- **Primary Accent (Oxygen Blue):** A high-vibrancy cyan used for navigation, active states, and "flow" elements. It represents clarity and breath.
- **Energy Accent (Kinetic Orange):** Used sparingly for high-impact callouts, urgent checkpoints, and performance markers. It represents action and intensity.
- **Neutral (Stadium White):** Reserved for "Performance Logs" and workbook cards, providing a high-contrast surface that mimics physical training manuals.
- **Functional States:** Success and danger colors are tuned for high visibility against the dark background, ensuring feedback is immediate and unmistakable.

## Typography

The typography system is designed for maximum scanability and performance-tracking aesthetics. 

**Archivo Narrow** serves as the primary headline face. Its condensed, aggressive structure evokes sports broadcasting and stopwatch readouts. It should be used in uppercase for most section headers to create a sense of urgency and importance.

**Inter** provides a highly legible foundation for all instructional and assessment text. It ensures that complex psychological concepts are easy to digest during long study sessions.

**JetBrains Mono** is utilized for metadata, technical labels, and "Data Points." It reinforces the "data-driven" mood of the system, making utility elements feel like part of a sophisticated performance dashboard.

## Layout & Spacing

The layout follows a **Fixed Grid** model to maintain a sense of controlled structure. Content is centered on the page with a maximum width of 1280px.

- **Desktop:** A 12-column grid with 16px gutters. "Performance Logs" (workbook cards) are centered within a narrower 1000px container to improve readability and focus.
- **Tablet:** 8-column grid with 16px margins. Cards reflow to vertical stacks when they reach 50% of the screen width.
- **Mobile:** 4-column grid with 12px margins. Typography scales down (see `headline-xl-mobile`) and all cards span the full container width.

Spacing follows a strict 4px rhythm. Use `32px` (unit * 8) for major section breaks and `16px` (unit * 4) for internal card padding to maintain a dense, "pro-equipment" feel.

## Elevation & Depth

This design system uses **Tonal Layers** and **Glassmorphism** to organize information without relying on heavy shadows.

- **The Shell:** Uses a dark, semi-transparent `Track Navy` background with a subtle backdrop blur (12px) for top-level navigation, making it feel like an overlay on a training field.
- **Instructional Panels:** Flat, low-contrast surfaces using `surface-muted` with thin, 1px borders in `Oxygen Blue` or `Kinetic Orange` to denote category.
- **Performance Logs (Workbook Cards):** These use **Stadium White** and sit at the highest visual elevation. They utilize a crisp 1px border and a small, sharp offset shadow (4px 4px 0px) rather than a soft blur, giving them a tactile, "physical card" feel.
- **Active Elements:** Interactive components use a glowing outer border effect (2px stroke) in `Oxygen Blue` rather than a drop shadow.

## Shapes

The shape language is "Technical-Sharp." We use **Soft (0.25rem)** roundedness for standard elements like buttons and input fields to maintain a precise, engineered appearance. 

Larger containers like the "Athlete Checkpoints" use **rounded-lg (0.5rem)** to provide enough softness to feel modern without losing the aggressive, athletic edge. Fully circular "Pill" shapes are reserved exclusively for status badges (e.g., "Active," "Completed," "High Intensity") to make them instantly recognizable as distinct from interactive buttons.

## Components

### Performance Logs (Formerly Clinical Cards)
The central workbook component. These are `Stadium White` cards with a bold top-border (4px) in the section's accent color. They use high-contrast dark text (`Track Navy`) to ensure clarity for data entry.

### Athlete Checkpoints
Instructional callouts that appear as "coaching notes." These use a dark background with a high-energy `Kinetic Orange` left-hand border. They include a small `JetBrains Mono` icon label at the top.

### Primary Actions
Buttons are condensed and uppercase. They utilize a solid `Oxygen Blue` fill with white text. Hover states should trigger a slight horizontal shift (+4px) to simulate forward momentum.

### Input Fields
Styled as "Data Entry Points." Dark background with a subtle inner border. On focus, the border turns `Oxygen Blue` and a small glow is applied.

### Progress Trackers
Linear bars that use a segmented "meter" look rather than a smooth fill. Completed segments are `Performance Success` (Green), while the current segment pulses in `Oxygen Blue`.

### Chips & Tags
Technical tags using `JetBrains Mono`. Small, high-contrast badges with inverted colors (light text on dark backgrounds) for categorizing psychology vs. physiology content.
