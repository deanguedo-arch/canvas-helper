# Aboriginal Studies 30 — Pixel-Perfect Implementation Plan

## What this plan is

This is the stricter, more visual version of the existing Aboriginal Studies 30 implementation spec. The existing spec defines the product requirements, content rules, accessibility rules, and required screens. This document turns the generated visual mockup into a measurable build plan that a coding agent can implement, screenshot, compare, and iterate against.

Pixel-perfect does **not** mean “one prompt and done.” It means the implementation is tied to exact reference images, exact viewport sizes, exact component measurements, exact theme tokens, and a screenshot QA loop.

## Source files in this pack

```txt
reference/as30-units-home-reference-1672x941.png
reference/as30-design-system-reference-1448x1086.png
reference/as30-units-home-annotated-measurements.png
assets/sidebar-full-reference.png
assets/sidebar-top-pattern-band.png
assets/sidebar-brand-block.png
assets/sidebar-active-nav-slice.png
assets/sidebar-lower-texture.png
assets/progress-hero-reference.png
assets/progress-track-reference.png
assets/units-section-header-reference.png
assets/unit-card-reference.png
assets/unit-badge-reference.png
assets/unit-card-right-texture.png
prompts/codex-pixel-perfect-prompt.txt
prompts/codex-qa-correction-prompt.txt
VISUAL_QA_CHECKLIST.md
AGENTS.md
TOKENS_AND_METRICS.css
```

## Definition of “pixel-perfect” for this project

The target is the **Units Home** reference at `1672 × 941px`.

The build should be judged at these viewports:

```txt
Desktop visual target: 1672 × 941
Large desktop:         1440 × 900
Tablet:                768 × 1024
Mobile:                390 × 844
```

The desktop screenshot should match the reference within these tolerances:

```txt
Global shell layout:       ±2–4px
Sidebar width:             exact at 336px for 1672px viewport
Main content start:        ±4px
Progress hero bounds:      ±4px
Unit card bounds:          ±4px
Typography scale:          ±1–2px
Border/radius feel:        visually identical, not mathematically fragile
Color tokens:              exact CSS values unless using extracted image assets
Ornamental pattern detail: use extracted assets for closest match; otherwise CSS approximation accepted
```

If the repo layout forces a different root width, preserve the **ratios and component proportions**, not arbitrary guessing.

---

# 1. Desktop Coordinate Map

Reference image: `reference/as30-units-home-reference-1672x941.png`

## Overall viewport

```txt
Viewport width:  1672px
Viewport height: 941px
```

## Sidebar

```txt
Sidebar x:      0
Sidebar y:      0
Sidebar width:  336px
Sidebar height: 941px
Boundary line:  x = 335/336
```

Implementation target:

```css
--as-sidebar-width: 336px;
```

## Main content area

```txt
Main visual content left edge: 374px for unit cards
Progress hero left edge:      382px
Right content edge:           1629px
Main visual right margin:     ~43px
Gap between sidebar and cards: ~38px
Gap between sidebar and hero:  ~46px
```

Implementation target:

```css
.as-main {
  padding-top: 32px;
  padding-right: 43px;
  padding-left: 38px;
}

.as-content-inner {
  width: min(100%, 1256px);
}
```

Important: the progress hero starts 8px to the right of the unit cards in the mockup. This asymmetry helps the design feel less boxed-in. Do not accidentally align everything into a bland grid.

## Progress hero

```txt
x:      382px
y:      32px
width:  1247px
height: 274px
radius: ~18–22px
```

Implementation target:

```css
.as-progress-hero {
  min-height: 274px;
  padding: 42px 48px 32px;
  border-radius: 22px;
}
```

Hero internal layout:

```txt
Top label y:                ~78px
Progress track y:           ~109px
Progress track height:      ~37px including border/glow
Large percent baseline:     around y=247px
Large percent visual size:  ~96–104px
“complete” text size:       ~34–38px
Modules label x:            ~1348px
```

## Units section title

```txt
Heading x: 374px
Heading y: 343px
Text:      UNITS
```

Implementation target:

```css
.as-section-heading {
  margin-top: 38px;
  margin-bottom: 22px;
  font-size: 34px;
  letter-spacing: 0.13em;
}
```

## Unit card stack

All unit cards:

```txt
x:      374px
width:  1255px
height: 108px
radius: ~10–14px
```

Card positions:

```txt
Card 1 y: 393px
Card 2 y: 522px
Card 3 y: 651px
Card 4 y: 779px
Vertical gap: ~21px
```

Implementation target:

```css
.as-unit-list {
  display: grid;
  gap: 21px;
}

.as-unit-card {
  min-height: 108px;
  grid-template-columns: 130px minmax(0, 1fr) 72px;
}
```

Card internal map:

```txt
Badge column:      x=374–504  (~130px)
Vertical accent:   x=503–510  (~7px)
Copy start:        x≈538
Right arrow zone:  x≈1530–1629
Badge size:        ~64px including ring; inner text T1 ~31px
```

---

# 2. Exact Theme Tokens

Use these in the repo as the single visual source of truth.

```css
:root {
  --as-bg-950: #020609;
  --as-bg-925: #050B10;
  --as-bg-900: #071016;
  --as-bg-875: #081520;
  --as-bg-850: #0B1520;
  --as-bg-825: #0D171B;
  --as-bg-800: #101820;
  --as-bg-750: #111D1F;
  --as-bg-700: #162225;
  --as-bg-650: #1B2A2D;

  --as-forest: #0F2A26;
  --as-deep-teal: #0E3D3F;
  --as-teal: #0F6B66;
  --as-turquoise: #19C1B7;
  --as-turquoise-soft: #6FE7DC;
  --as-copper: #B87347;
  --as-copper-dark: #7B4729;
  --as-amber: #D69A5A;
  --as-cream: #F2E9D8;
  --as-cream-muted: #CFC3AE;
  --as-sand: #E5D2B7;
  --as-slate: #2A3238;
  --as-muted-sage: #5E6D66;

  --as-border-subtle: rgba(242, 233, 216, 0.12);
  --as-border-copper: rgba(184, 115, 71, 0.55);
  --as-border-copper-strong: rgba(184, 115, 71, 0.76);
  --as-border-teal: rgba(25, 193, 183, 0.45);
  --as-border-teal-strong: rgba(25, 193, 183, 0.70);

  --as-text-primary: #F2E9D8;
  --as-text-secondary: #CFC3AE;
  --as-text-muted: #8F9A98;
  --as-text-accent: #19C1B7;
  --as-text-copper: #D69A5A;

  --as-focus: #6FE7DC;
  --as-success: #19C1B7;
  --as-warning: #D69A5A;
  --as-locked: rgba(143, 154, 152, 0.45);

  --as-radius-sm: 8px;
  --as-radius-md: 12px;
  --as-radius-lg: 18px;
  --as-radius-xl: 22px;
  --as-radius-xxl: 28px;

  --as-sidebar-width: 336px;
  --as-content-max: 1256px;

  --as-space-1: 4px;
  --as-space-2: 8px;
  --as-space-3: 12px;
  --as-space-4: 16px;
  --as-space-5: 24px;
  --as-space-6: 32px;
  --as-space-7: 48px;

  --as-shadow-panel: 0 18px 50px rgba(0, 0, 0, 0.35);
  --as-shadow-card: 0 10px 30px rgba(0, 0, 0, 0.28);
  --as-glow-teal: 0 0 0 1px rgba(25, 193, 183, 0.35), 0 0 24px rgba(25, 193, 183, 0.12);
  --as-glow-copper: 0 0 0 1px rgba(184, 115, 71, 0.45), 0 0 24px rgba(184, 115, 71, 0.10);

  --font-display: "Playfair Display", "Cinzel", Georgia, serif;
  --font-ui: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

---

# 3. Asset Strategy

There are two possible levels.

## Level A — Highest visual fidelity

Use the extracted assets in this pack as background images/slices.

Recommended use:

```txt
assets/sidebar-top-pattern-band.png       -> sidebar top band
assets/sidebar-lower-texture.png          -> subtle lower sidebar background overlay
assets/progress-hero-reference.png        -> progress hero background layer, blurred/darkened behind actual UI text
assets/unit-card-right-texture.png        -> right-side texture overlay for unit cards
assets/unit-badge-reference.png           -> visual reference only; recreate as CSS/SVG if possible
```

Do not use a full screenshot as the UI. Use crops only as decorative assets behind real text/buttons.

## Level B — Good production fidelity

Use pure CSS generated textures:

- repeating linear gradients for beadwork-inspired strips
- radial gradient rings for badges
- topographic contour pseudo-elements
- dark landscape-style gradient for the progress hero

This is more maintainable but less exact.

## Recommendation

Use Level A for the sidebar top band and progress hero background, Level B for cards and interactive states. This gives the closest match without turning the app into a static image.

---

# 4. Global Layout CSS Target

```css
.as-course-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--as-sidebar-width) minmax(0, 1fr);
  background:
    radial-gradient(circle at 90% 0%, rgba(15, 61, 63, 0.35), transparent 34%),
    linear-gradient(135deg, #071016 0%, #0B1520 43%, #070713 100%);
  color: var(--as-text-primary);
}

.as-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  background:
    linear-gradient(180deg, rgba(7,16,22,0.88), rgba(15,42,38,0.94) 55%, rgba(7,16,22,0.98)),
    var(--as-bg-850);
  border-right: 1px solid rgba(184, 115, 71, 0.30);
  box-shadow: var(--as-shadow-panel);
}

.as-main {
  height: 100vh;
  overflow-y: auto;
  padding: 32px 43px 48px 38px;
}

.as-content-inner {
  width: min(100%, var(--as-content-max));
  margin: 0 auto;
}
```

For the exact reference width, the content inner will land around x=374–382.

---

# 5. Sidebar Pixel Plan

## Sidebar dimensions

```css
.as-sidebar {
  width: 336px;
}
```

## Sidebar top pattern band

```txt
Reference crop: assets/sidebar-top-pattern-band.png
Height: 50px
```

```css
.as-sidebar-pattern-band {
  height: 50px;
  background-image: url("/assets/as30/sidebar-top-pattern-band.png");
  background-size: 336px 50px;
  background-repeat: no-repeat;
  border-bottom: 1px solid rgba(184, 115, 71, 0.35);
}
```

Fallback CSS pattern:

```css
.as-sidebar-pattern-band {
  height: 50px;
  background:
    repeating-linear-gradient(
      45deg,
      rgba(25,193,183,0.88) 0 2px,
      transparent 2px 9px,
      rgba(184,115,71,0.88) 9px 11px,
      transparent 11px 18px
    ),
    #0A1416;
}
```

## Brand block target

```txt
Brand block y:       50–205px
Medallion mark x:    ~26px
Course title x:      ~104px
AS badge x:          ~270px
Divider y:           ~188px
COURSE SHELL y:      ~224px
```

Implementation notes:

- Keep title split as `ABORIGINAL` / `STUDIES 30`.
- Title should be all caps, condensed, heavy, cream.
- AS badge must be circular and sit to the right of the title block.
- Medallion mark is decorative only; set `aria-hidden="true"`.

Suggested CSS:

```css
.as-brand {
  padding: 52px 24px 22px;
}

.as-brand-row {
  display: grid;
  grid-template-columns: 64px 1fr 56px;
  align-items: center;
  gap: 16px;
}

.as-brand-title {
  font-family: var(--font-ui);
  font-size: 31px;
  line-height: 0.96;
  font-weight: 900;
  letter-spacing: 0.055em;
  color: var(--as-cream);
  text-transform: uppercase;
}

.as-course-badge {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid rgba(25,193,183,0.65);
  color: var(--as-turquoise);
  background: rgba(7,16,22,0.72);
  font-weight: 900;
}
```

## Navigation target

```txt
Active nav top:     y≈254px
Active nav height:  ~67px
Other nav height:   ~72px visually, touch area min 52px
```

Implementation notes:

- Active Units row is the strongest left-side color moment.
- Use turquoise fill, copper/teal patterned right strip, and cream text.
- Nav icons should be outline-style and cream/copper, not filled cartoon icons.

---

# 6. Progress Hero Pixel Plan

## Reference

```txt
Reference crop: assets/progress-hero-reference.png
Bounds: x=382, y=32, w=1247, h=274
```

## CSS target

```css
.as-progress-hero {
  position: relative;
  min-height: 274px;
  padding: 42px 48px 32px;
  border-radius: 22px;
  border: 1px solid rgba(184,115,71,0.58);
  background:
    linear-gradient(90deg, rgba(7,16,22,0.94), rgba(8,21,32,0.70) 52%, rgba(7,16,22,0.86)),
    url("/assets/as30/progress-hero-reference.png") center / cover no-repeat,
    var(--as-bg-800);
  box-shadow: var(--as-shadow-panel);
  overflow: hidden;
}

.as-progress-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 66% 50%, rgba(25,193,183,0.11), transparent 34%),
    linear-gradient(180deg, rgba(242,233,216,0.04), transparent);
}
```

## Internal typography

```css
.as-progress-eyebrow,
.as-progress-units {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--as-cream);
}

.as-progress-percent {
  font-family: var(--font-display);
  font-size: clamp(78px, 6.2vw, 104px);
  line-height: 0.9;
  color: var(--as-cream);
}

.as-progress-complete {
  font-family: var(--font-display);
  font-size: 36px;
  line-height: 1;
  color: var(--as-cream);
}
```

## Progress bar

```css
.as-progress-track {
  height: 40px;
  margin-top: 18px;
  border-radius: 999px;
  border: 1px solid rgba(184,115,71,0.78);
  padding: 5px;
  background:
    repeating-linear-gradient(
      45deg,
      rgba(25,193,183,0.20) 0 5px,
      rgba(184,115,71,0.14) 5px 10px
    ),
    rgba(0,0,0,0.32);
  box-shadow: inset 0 0 0 1px rgba(25,193,183,0.12);
}

.as-progress-fill {
  height: 100%;
  width: var(--progress, 0%);
  border-radius: inherit;
  background: linear-gradient(90deg, var(--as-copper), var(--as-turquoise));
}
```

---

# 7. Unit Cards Pixel Plan

## CSS target

```css
.as-units-heading-row {
  margin-top: 38px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.as-units-heading {
  font-family: var(--font-ui);
  font-size: 34px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0.13em;
  color: var(--as-cream);
  text-transform: uppercase;
}

.as-unit-list {
  display: grid;
  gap: 21px;
}

.as-unit-card {
  position: relative;
  min-height: 108px;
  width: 100%;
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr) 72px;
  align-items: center;
  padding: 0;
  overflow: hidden;
  text-align: left;
  color: var(--as-text-primary);
  border: 1px solid rgba(184,115,71,0.48);
  border-radius: 12px;
  background:
    linear-gradient(90deg, rgba(10,16,20,0.96), rgba(16,24,32,0.92)),
    var(--as-bg-700);
  box-shadow: var(--as-shadow-card);
  cursor: pointer;
}

.as-unit-card::before {
  content: "";
  position: absolute;
  left: 130px;
  top: 0;
  bottom: 0;
  width: 7px;
  background: linear-gradient(180deg, var(--as-turquoise), var(--as-copper));
}

.as-unit-card::after {
  content: "";
  position: absolute;
  inset: 0 0 0 auto;
  width: 260px;
  opacity: 0.25;
  background:
    url("/assets/as30/unit-card-right-texture.png") right center / cover no-repeat;
  pointer-events: none;
}

.as-unit-badge-wrap {
  width: 130px;
  display: grid;
  place-items: center;
}

.as-unit-badge {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgba(184,115,71,0.72);
  color: var(--as-turquoise);
  font-family: var(--font-ui);
  font-size: 28px;
  font-weight: 900;
  background: rgba(7,16,22,0.64);
  box-shadow:
    0 0 0 6px rgba(25,193,183,0.07),
    0 0 0 10px rgba(184,115,71,0.08),
    inset 0 0 0 1px rgba(25,193,183,0.22);
}

.as-unit-copy {
  padding-left: 34px;
  padding-right: 24px;
  position: relative;
  z-index: 1;
}

.as-unit-copy h3 {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 27px;
  line-height: 1.1;
  font-weight: 700;
  color: var(--as-cream);
}

.as-unit-copy p {
  margin: 0;
  font-family: var(--font-ui);
  font-size: 15px;
  line-height: 1.45;
  color: var(--as-cream-muted);
}

.as-unit-arrow {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  color: var(--as-copper);
  font-size: 54px;
  line-height: 1;
}

.as-unit-card:hover {
  border-color: rgba(25,193,183,0.70);
  box-shadow: var(--as-glow-teal);
  transform: translateY(-1px);
}
```

---

# 8. Non-Units Screens

The Units page is the pixel lock. All other pages should inherit the exact shell, sidebar, tokens, card language, button system, and texture treatment.

## Theme page

Use:

- same shell/sidebar
- title panel using progress-hero visual language but shorter
- resource rows using unit-card border language
- Chapter 1 first for Theme 1
- Mark Complete and Back to Units controls

## Theme 1 Questions

Do not attempt to make this decorative. The worksheet must prioritize readability.

Required behavior:

- no inline booklet images
- section headers
- source references
- numbered cards
- multiple choice
- fill-in-the-blank
- long answer
- fillable charts
- Copy Responses
- autosave text
- textareas auto-grow and cap at 360px
- no manual resize

## Library/PDF

Use the same card language. PDF viewer must stay inside the shell.

## Film Room

TV/player should use the same dark/copper/turquoise system. Use video/module wording only.

## Quiz placeholder

Must look intentional, not empty or broken.

---

# 9. Codex Work Sequence

Do not ask Codex to implement everything in one pass. That is how visual drift happens.

## Pass 0 — audit only

Goal: identify files/routes/components/styles. No edits.

Expected output:

```txt
- current component map
- current route map
- style files to edit
- unknowns/assets missing
- build command
- screenshot command or recommended Playwright setup
```

## Pass 1 — shell + Units pixel lock

Goal: implement only the shell/sidebar/progress hero/units cards.

Codex must produce:

```txt
- desktop screenshot at 1672×941
- changed files
- build output
- known deviations from reference
```

Do not approve until the Units Home is visually close.

## Pass 2 — Theme page + resources

Goal: apply visual system to Theme pages and Theme 1 resource list.

## Pass 3 — Theme 1 Questions

Goal: web-native worksheet. This is product-critical, not just style.

## Pass 4 — Library/PDF + Assignments + Quizzes

Goal: style secondary screens.

## Pass 5 — Film Room

Goal: preserve TV concept, remove tape language.

## Pass 6 — mobile and QA

Goal: 390, 768, 1024, 1440, 1672 screenshot proof.

---

# 10. Screenshot QA Protocol

## Required screenshots

```txt
units-home-desktop-1672x941.png
units-home-1440x900.png
theme-1-desktop.png
theme-1-questions-desktop.png
library-pdf-desktop.png
film-room-desktop.png
mobile-units-390x844.png
mobile-worksheet-390x844.png
```

## Visual QA checklist

Use `VISUAL_QA_CHECKLIST.md` in this pack.

## Suggested Playwright screenshot script

Have Codex add something equivalent if the repo does not already have it:

```ts
import { test, expect } from '@playwright/test';

test('AS30 Units desktop screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('as30-units-desktop.png', {
    fullPage: false,
    animations: 'disabled',
    maxDiffPixelRatio: 0.15,
  });
});
```

Use visual diff as a guide, not an excuse. AI-generated reference images include texture noise, so full pixel diff will not be mathematically perfect unless the extracted assets are used.

---

# 11. What to give Codex

Put these in the repo:

```txt
/docs/design/as30/PIXEL_PERFECT_IMPLEMENTATION_PLAN.md
/docs/design/as30/reference/as30-units-home-reference-1672x941.png
/docs/design/as30/reference/as30-design-system-reference-1448x1086.png
/docs/design/as30/reference/as30-units-home-annotated-measurements.png
/docs/design/as30/assets/*
/AGENTS.md
```

Then paste:

```txt
Read AGENTS.md first.
Then read docs/design/as30/PIXEL_PERFECT_IMPLEMENTATION_PLAN.md.
Then inspect the repo.
Do not edit files until you produce a plan.
```

---

# 12. Hard No List

Codex must not:

- create a generic landing page
- remove existing course behavior
- add Phases or Performance
- use Sports Wellness wording
- use tape/tapes wording in Film Room
- add dreamcatchers, feathers, headdresses, sacred objects, or faux tribal clipart
- turn the worksheet into screenshots of a PDF
- make textareas manually resizable
- ignore mobile
- claim done without screenshots

---

# 13. Approval Standard

Approve the implementation only when:

1. The Units page at 1672×941 looks recognizably like the reference within one glance.
2. Sidebar width, hero size, unit card size, and major spacing are within 2–4px.
3. The color palette feels cream/copper/turquoise/forest, not generic blue-gray.
4. The active nav state has the same visual weight as the mockup.
5. Unit cards have the same horizontal rhythm: badge column, accent strip, title copy, right arrow.
6. Theme 1 Questions is a usable web worksheet, not decorative junk.
7. The app still functions as a course shell.
8. Screenshots and build output are provided.
